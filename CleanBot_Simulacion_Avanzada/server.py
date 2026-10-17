from __future__ import annotations

import csv
import hashlib
import hmac
import io
import json
import mimetypes
import os
import re
import secrets
import sqlite3
import threading
from datetime import datetime, timezone
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse

BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "static"
DB_PATH = BASE_DIR / "cleanbot.db"
HOST = "127.0.0.1"
PORT = 8000

SESSIONS: dict[str, dict] = {}
SESSIONS_LOCK = threading.Lock()


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def db_connect() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def hash_password(password: str, salt_hex: str | None = None) -> tuple[str, str]:
    salt = bytes.fromhex(salt_hex) if salt_hex else secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 120_000)
    return digest.hex(), salt.hex()


def verify_password(password: str, expected_hash: str, salt_hex: str) -> bool:
    actual_hash, _ = hash_password(password, salt_hex)
    return hmac.compare_digest(actual_hash, expected_hash)


def init_db() -> None:
    conn = db_connect()
    conn.executescript(
        """
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            full_name TEXT NOT NULL,
            role TEXT NOT NULL CHECK(role IN ('admin','operator','observer')),
            password_hash TEXT NOT NULL,
            salt TEXT NOT NULL,
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            scenario TEXT NOT NULL,
            mode TEXT NOT NULL,
            algorithm TEXT NOT NULL,
            duration_seconds REAL NOT NULL,
            coverage_percent REAL NOT NULL,
            obstacles_detected INTEGER NOT NULL,
            distance_m REAL NOT NULL,
            spray_seconds REAL NOT NULL,
            battery_percent REAL NOT NULL,
            tank_percent REAL NOT NULL,
            sensor_snapshot_json TEXT NOT NULL,
            notes TEXT,
            created_at TEXT NOT NULL,
            FOREIGN KEY(user_id) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS retained_samples (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sample_code TEXT NOT NULL UNIQUE,
            user_id INTEGER NOT NULL,
            scenario TEXT NOT NULL CHECK(scenario IN ('hospital','industry','warehouse')),
            site_id TEXT NOT NULL,
            signature_id TEXT NOT NULL DEFAULT 'UNCLASSIFIED-DEMO',
            sample_type TEXT NOT NULL CHECK(sample_type = 'unknown'),
            classification TEXT NOT NULL,
            location_x INTEGER NOT NULL,
            location_y INTEGER NOT NULL,
            sample_status TEXT NOT NULL CHECK(sample_status = 'retained_for_lab_review'),
            created_at TEXT NOT NULL,
            FOREIGN KEY(user_id) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS approved_protocols (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            signature_id TEXT NOT NULL UNIQUE,
            classification TEXT NOT NULL,
            protocol_code TEXT NOT NULL,
            product_code TEXT NOT NULL,
            dose_profile TEXT NOT NULL,
            cartridge_id TEXT NOT NULL CHECK(cartridge_id IN ('A','B','C')),
            is_active INTEGER NOT NULL DEFAULT 1 CHECK(is_active IN (0,1)),
            created_by INTEGER NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY(created_by) REFERENCES users(id)
        );

        CREATE UNIQUE INDEX IF NOT EXISTS retained_samples_site_once
        ON retained_samples(user_id, scenario, site_id);
        """
    )

    sample_columns = {row["name"] for row in conn.execute("PRAGMA table_info(retained_samples)")}
    if "signature_id" not in sample_columns:
        conn.execute("ALTER TABLE retained_samples ADD COLUMN signature_id TEXT NOT NULL DEFAULT 'UNCLASSIFIED-DEMO'")
    conn.execute(
        "UPDATE retained_samples SET signature_id='SIM-HOSPITAL-02' WHERE scenario='hospital' AND site_id='H-02' AND signature_id='UNCLASSIFIED-DEMO'"
    )
    conn.execute(
        "UPDATE retained_samples SET signature_id='SIM-INDUSTRY-02' WHERE scenario='industry' AND site_id='I-02' AND signature_id='UNCLASSIFIED-DEMO'"
    )
    conn.execute(
        "UPDATE retained_samples SET signature_id='SIM-WAREHOUSE-02' WHERE scenario='warehouse' AND site_id='B-02' AND signature_id='UNCLASSIFIED-DEMO'"
    )

    seeds = [
        ("admin", "Administrador SumaKlean", "admin", "admin123"),
        ("operador", "Operador Demo", "operator", "demo123"),
        ("observador", "Observador Demo", "observer", "view123"),
    ]
    for username, full_name, role, password in seeds:
        exists = conn.execute("SELECT 1 FROM users WHERE username = ?", (username,)).fetchone()
        if not exists:
            pwd_hash, salt = hash_password(password)
            conn.execute(
                "INSERT INTO users(username, full_name, role, password_hash, salt, created_at) VALUES(?,?,?,?,?,?)",
                (username, full_name, role, pwd_hash, salt, utc_now()),
            )
    conn.commit()
    conn.close()


def public_user(row: sqlite3.Row) -> dict:
    return {
        "id": row["id"],
        "username": row["username"],
        "full_name": row["full_name"],
        "role": row["role"],
        "created_at": row["created_at"],
    }


class CleanBotHandler(BaseHTTPRequestHandler):
    server_version = "SumaKleanSim/2.0"

    def log_message(self, fmt, *args):
        print(f"[{self.log_date_time_string()}] {fmt % args}")

    def _json_body(self) -> dict:
        length = int(self.headers.get("Content-Length", "0") or "0")
        if length <= 0:
            return {}
        raw = self.rfile.read(length)
        try:
            return json.loads(raw.decode("utf-8"))
        except json.JSONDecodeError:
            raise ValueError("JSON inválido")

    def _send_json(self, payload, status=200):
        data = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(data)

    def _send_text(self, text, status=200, content_type="text/plain; charset=utf-8"):
        data = text.encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def _auth(self, roles: set[str] | None = None):
        header = self.headers.get("Authorization", "")
        if not header.startswith("Bearer "):
            return None
        token = header[7:].strip()
        with SESSIONS_LOCK:
            session = SESSIONS.get(token)
        if not session:
            return None
        if roles and session["role"] not in roles:
            return "forbidden"
        return session

    def _serve_static(self, path: str):
        if path == "/":
            static_root = BASE_DIR.parent
            rel = "index.html"
        elif path in {"/styles.css", "/dashboard-3d.js"}:
            static_root = BASE_DIR.parent
            rel = path.lstrip("/")
        elif path.startswith("/avanzada/"):
            static_root = STATIC_DIR
            rel = path.removeprefix("/avanzada/")
            if not rel:
                rel = "index.html"
        elif path == "/brand/sumaklean-mark.png":
            static_root = BASE_DIR.parent / "static"
            rel = "sumaklean-mark.png"
        elif path == "/brand/sumaklean-k.png":
            static_root = BASE_DIR.parent / "static"
            rel = "sumaklean-k.png"
        elif path.startswith("/node_modules/three/"):
            static_root = BASE_DIR.parent / "node_modules" / "three"
            rel = path.removeprefix("/node_modules/three/")
        else:
            static_root = STATIC_DIR
            rel = path.lstrip("/")
        target = (static_root / rel).resolve()
        try:
            target.relative_to(static_root.resolve())
        except ValueError:
            self._send_text("Acceso denegado", HTTPStatus.FORBIDDEN)
            return
        if not target.exists() or not target.is_file():
            self._send_text("No encontrado", HTTPStatus.NOT_FOUND)
            return
        content_type = mimetypes.guess_type(target.name)[0] or "application/octet-stream"
        data = target.read_bytes()
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", content_type + ("; charset=utf-8" if content_type.startswith("text/") else ""))
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path

        if path == "/api/health":
            self._send_json({"ok": True, "service": "SumaKlean Sim", "version": "2.0"})
            return

        if path == "/api/me":
            session = self._auth()
            if not session:
                self._send_json({"error": "No autenticado"}, HTTPStatus.UNAUTHORIZED)
                return
            self._send_json({"user": session})
            return

        if path == "/api/reports":
            session = self._auth()
            if not session:
                self._send_json({"error": "No autenticado"}, HTTPStatus.UNAUTHORIZED)
                return
            conn = db_connect()
            if session["role"] == "operator":
                rows = conn.execute(
                    """
                    SELECT r.*, u.username, u.full_name
                    FROM reports r JOIN users u ON u.id = r.user_id
                    WHERE r.user_id = ? ORDER BY r.id DESC LIMIT 100
                    """,
                    (session["id"],),
                ).fetchall()
            else:
                rows = conn.execute(
                    """
                    SELECT r.*, u.username, u.full_name
                    FROM reports r JOIN users u ON u.id = r.user_id
                    ORDER BY r.id DESC LIMIT 100
                    """
                ).fetchall()
            conn.close()
            items = []
            for row in rows:
                item = dict(row)
                try:
                    item["sensor_snapshot"] = json.loads(item.pop("sensor_snapshot_json"))
                except Exception:
                    item["sensor_snapshot"] = {}
                    item.pop("sensor_snapshot_json", None)
                items.append(item)
            self._send_json({"reports": items})
            return

        if path == "/api/reports.csv":
            session = self._auth()
            if not session:
                self._send_json({"error": "No autenticado"}, HTTPStatus.UNAUTHORIZED)
                return
            conn = db_connect()
            if session["role"] == "operator":
                rows = conn.execute(
                    "SELECT r.*, u.username FROM reports r JOIN users u ON u.id=r.user_id WHERE r.user_id=? ORDER BY r.id DESC",
                    (session["id"],),
                ).fetchall()
            else:
                rows = conn.execute(
                    "SELECT r.*, u.username FROM reports r JOIN users u ON u.id=r.user_id ORDER BY r.id DESC"
                ).fetchall()
            conn.close()
            out = io.StringIO()
            writer = csv.writer(out)
            writer.writerow([
                "id", "usuario", "escenario", "modo", "algoritmo", "duracion_s", "cobertura_pct",
                "obstaculos", "distancia_m", "pulverizacion_s", "bateria_pct", "tanque_pct", "notas", "fecha"
            ])
            for r in rows:
                writer.writerow([
                    r["id"], r["username"], r["scenario"], r["mode"], r["algorithm"], r["duration_seconds"],
                    r["coverage_percent"], r["obstacles_detected"], r["distance_m"], r["spray_seconds"],
                    r["battery_percent"], r["tank_percent"], r["notes"] or "", r["created_at"]
                ])
            data = out.getvalue().encode("utf-8-sig")
            self.send_response(HTTPStatus.OK)
            self.send_header("Content-Type", "text/csv; charset=utf-8")
            self.send_header("Content-Disposition", "attachment; filename=cleanbot_reportes.csv")
            self.send_header("Content-Length", str(len(data)))
            self.end_headers()
            self.wfile.write(data)
            return

        if path == "/api/protocols":
            session = self._auth()
            if not session:
                self._send_json({"error": "No autenticado"}, HTTPStatus.UNAUTHORIZED)
                return
            conn = db_connect()
            rows = conn.execute(
                "SELECT signature_id, classification, protocol_code, product_code, dose_profile, cartridge_id, created_at, updated_at FROM approved_protocols WHERE is_active=1 ORDER BY signature_id"
            ).fetchall()
            conn.close()
            self._send_json({"protocols": [dict(row) for row in rows]})
            return

        if path == "/api/samples":
            session = self._auth()
            if not session:
                self._send_json({"error": "No autenticado"}, HTTPStatus.UNAUTHORIZED)
                return
            conn = db_connect()
            if session["role"] == "operator":
                rows = conn.execute(
                    """
                          SELECT s.*, u.username, u.full_name,
                              p.classification AS approved_classification,
                              p.protocol_code AS approved_protocol_code,
                              p.product_code AS approved_product_code,
                              p.dose_profile AS approved_dose_profile,
                              p.cartridge_id AS approved_cartridge_id
                    FROM retained_samples s JOIN users u ON u.id=s.user_id
                          LEFT JOIN approved_protocols p ON p.signature_id=s.signature_id AND p.is_active=1
                    WHERE s.user_id=? ORDER BY s.id DESC
                    """,
                    (session["id"],),
                ).fetchall()
            else:
                rows = conn.execute(
                    """
                          SELECT s.*, u.username, u.full_name,
                              p.classification AS approved_classification,
                              p.protocol_code AS approved_protocol_code,
                              p.product_code AS approved_product_code,
                              p.dose_profile AS approved_dose_profile,
                              p.cartridge_id AS approved_cartridge_id
                    FROM retained_samples s JOIN users u ON u.id=s.user_id
                          LEFT JOIN approved_protocols p ON p.signature_id=s.signature_id AND p.is_active=1
                    ORDER BY s.id DESC
                    """
                ).fetchall()
            conn.close()
            self._send_json({"samples": [dict(row) for row in rows]})
            return

        if path == "/api/users":
            session = self._auth({"admin"})
            if session == "forbidden":
                self._send_json({"error": "Permiso insuficiente"}, HTTPStatus.FORBIDDEN)
                return
            if not session:
                self._send_json({"error": "No autenticado"}, HTTPStatus.UNAUTHORIZED)
                return
            conn = db_connect()
            rows = conn.execute("SELECT * FROM users ORDER BY id").fetchall()
            conn.close()
            self._send_json({"users": [public_user(r) for r in rows]})
            return

        self._serve_static(path)

    def do_POST(self):
        path = urlparse(self.path).path
        try:
            body = self._json_body()
        except ValueError as exc:
            self._send_json({"error": str(exc)}, HTTPStatus.BAD_REQUEST)
            return

        if path == "/api/login":
            username = str(body.get("username", "")).strip()
            password = str(body.get("password", ""))
            conn = db_connect()
            row = conn.execute("SELECT * FROM users WHERE username = ?", (username,)).fetchone()
            conn.close()
            if not row or not verify_password(password, row["password_hash"], row["salt"]):
                self._send_json({"error": "Usuario o contraseña incorrectos"}, HTTPStatus.UNAUTHORIZED)
                return
            token = secrets.token_urlsafe(32)
            user = public_user(row)
            with SESSIONS_LOCK:
                SESSIONS[token] = user
            self._send_json({"token": token, "user": user})
            return

        if path == "/api/logout":
            header = self.headers.get("Authorization", "")
            if header.startswith("Bearer "):
                token = header[7:].strip()
                with SESSIONS_LOCK:
                    SESSIONS.pop(token, None)
            self._send_json({"ok": True})
            return

        if path == "/api/reports":
            session = self._auth({"admin", "operator"})
            if session == "forbidden":
                self._send_json({"error": "El perfil observador no puede guardar reportes"}, HTTPStatus.FORBIDDEN)
                return
            if not session:
                self._send_json({"error": "No autenticado"}, HTTPStatus.UNAUTHORIZED)
                return

            required = ["scenario", "mode", "algorithm"]
            if any(not str(body.get(k, "")).strip() for k in required):
                self._send_json({"error": "Faltan datos del reporte"}, HTTPStatus.BAD_REQUEST)
                return

            snapshot = body.get("sensor_snapshot") or {}
            conn = db_connect()
            cur = conn.execute(
                """
                INSERT INTO reports(
                    user_id, scenario, mode, algorithm, duration_seconds, coverage_percent,
                    obstacles_detected, distance_m, spray_seconds, battery_percent, tank_percent,
                    sensor_snapshot_json, notes, created_at
                ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)
                """,
                (
                    session["id"],
                    str(body.get("scenario")),
                    str(body.get("mode")),
                    str(body.get("algorithm")),
                    float(body.get("duration_seconds", 0)),
                    float(body.get("coverage_percent", 0)),
                    int(body.get("obstacles_detected", 0)),
                    float(body.get("distance_m", 0)),
                    float(body.get("spray_seconds", 0)),
                    float(body.get("battery_percent", 100)),
                    float(body.get("tank_percent", 100)),
                    json.dumps(snapshot, ensure_ascii=False),
                    str(body.get("notes", ""))[:500],
                    utc_now(),
                ),
            )
            conn.commit()
            report_id = cur.lastrowid
            conn.close()
            self._send_json({"ok": True, "report_id": report_id}, HTTPStatus.CREATED)
            return

        if path == "/api/samples":
            session = self._auth({"admin", "operator"})
            if session == "forbidden":
                self._send_json({"error": "El perfil observador no puede registrar muestras"}, HTTPStatus.FORBIDDEN)
                return
            if not session:
                self._send_json({"error": "No autenticado"}, HTTPStatus.UNAUTHORIZED)
                return

            scenario = str(body.get("scenario", ""))
            site_id = str(body.get("site_id", "")).strip()[:40]
            signature_id = str(body.get("signature_id", "UNCLASSIFIED-DEMO")).strip()[:60]
            sample_type = str(body.get("sample_type", ""))
            classification = str(body.get("classification", "Señal no identificada"))[:120]
            if scenario not in {"hospital", "industry", "warehouse"} or not site_id or sample_type != "unknown" or not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9._-]{1,59}", signature_id):
                self._send_json({"error": "Datos de muestra desconocida inválidos"}, HTTPStatus.BAD_REQUEST)
                return
            try:
                location_x = int(body.get("location_x"))
                location_y = int(body.get("location_y"))
            except (TypeError, ValueError):
                self._send_json({"error": "Ubicación de muestra inválida"}, HTTPStatus.BAD_REQUEST)
                return

            sample_code = f"CB-{datetime.now(timezone.utc):%Y%m%d%H%M%S}-{secrets.token_hex(3).upper()}"
            conn = db_connect()
            existing = conn.execute(
                "SELECT * FROM retained_samples WHERE user_id=? AND scenario=? AND site_id=?",
                (session["id"], scenario, site_id),
            ).fetchone()
            if existing:
                conn.close()
                self._send_json({"ok": True, "sample": dict(existing), "reused": True})
                return
            cur = conn.execute(
                """
                INSERT INTO retained_samples(
                    sample_code, user_id, scenario, site_id, signature_id, sample_type, classification,
                    location_x, location_y, sample_status, created_at
                ) VALUES(?,?,?,?,?,?,?,?,?,?,?)
                """,
                (
                    sample_code, session["id"], scenario, site_id, signature_id, sample_type, classification,
                    location_x, location_y, "retained_for_lab_review", utc_now(),
                ),
            )
            conn.commit()
            sample_id = cur.lastrowid
            conn.close()
            self._send_json({
                "ok": True,
                "sample": {
                    "id": sample_id,
                    "sample_code": sample_code,
                    "scenario": scenario,
                    "site_id": site_id,
                    "signature_id": signature_id,
                    "classification": classification,
                    "location_x": location_x,
                    "location_y": location_y,
                    "sample_status": "retained_for_lab_review",
                    "created_at": utc_now(),
                },
            }, HTTPStatus.CREATED)
            return

        if path == "/api/protocols":
            session = self._auth({"admin"})
            if session == "forbidden":
                self._send_json({"error": "Solo un administrador puede actualizar protocolos"}, HTTPStatus.FORBIDDEN)
                return
            if not session:
                self._send_json({"error": "No autenticado"}, HTTPStatus.UNAUTHORIZED)
                return

            signature_id = str(body.get("signature_id", "")).strip()
            classification = str(body.get("classification", "")).strip()[:120]
            protocol_code = str(body.get("protocol_code", "")).strip()
            product_code = str(body.get("product_code", "")).strip()
            dose_profile = str(body.get("dose_profile", "")).strip()
            cartridge_id = str(body.get("cartridge_id", "")).strip()
            identifier = re.compile(r"[A-Za-z0-9][A-Za-z0-9._-]{1,59}")
            if (
                not identifier.fullmatch(signature_id)
                or not classification
                or not identifier.fullmatch(protocol_code)
                or not identifier.fullmatch(product_code)
                or not identifier.fullmatch(dose_profile)
                or cartridge_id not in {"A", "B", "C"}
            ):
                self._send_json({"error": "Usa una firma, producto, protocolo y perfil como códigos; no ingreses fórmulas ni cantidades."}, HTTPStatus.BAD_REQUEST)
                return

            now = utc_now()
            conn = db_connect()
            conn.execute(
                """
                INSERT INTO approved_protocols(
                    signature_id, classification, protocol_code, product_code, dose_profile,
                    cartridge_id, is_active, created_by, created_at, updated_at
                ) VALUES(?,?,?,?,?,?,1,?,?,?)
                ON CONFLICT(signature_id) DO UPDATE SET
                    classification=excluded.classification,
                    protocol_code=excluded.protocol_code,
                    product_code=excluded.product_code,
                    dose_profile=excluded.dose_profile,
                    cartridge_id=excluded.cartridge_id,
                    is_active=1,
                    created_by=excluded.created_by,
                    updated_at=excluded.updated_at
                """,
                (signature_id, classification, protocol_code, product_code, dose_profile, cartridge_id, session["id"], now, now),
            )
            conn.commit()
            row = conn.execute(
                "SELECT signature_id, classification, protocol_code, product_code, dose_profile, cartridge_id, created_at, updated_at FROM approved_protocols WHERE signature_id=?",
                (signature_id,),
            ).fetchone()
            conn.close()
            self._send_json({"ok": True, "protocol": dict(row)}, HTTPStatus.CREATED)
            return

        if path == "/api/users":
            session = self._auth({"admin"})
            if session == "forbidden":
                self._send_json({"error": "Permiso insuficiente"}, HTTPStatus.FORBIDDEN)
                return
            if not session:
                self._send_json({"error": "No autenticado"}, HTTPStatus.UNAUTHORIZED)
                return
            username = str(body.get("username", "")).strip()
            full_name = str(body.get("full_name", "")).strip()
            role = str(body.get("role", "operator")).strip()
            password = str(body.get("password", ""))
            if not username or not full_name or len(password) < 6 or role not in {"admin", "operator", "observer"}:
                self._send_json({"error": "Datos de usuario inválidos. La contraseña debe tener al menos 6 caracteres."}, HTTPStatus.BAD_REQUEST)
                return
            pwd_hash, salt = hash_password(password)
            conn = db_connect()
            try:
                conn.execute(
                    "INSERT INTO users(username, full_name, role, password_hash, salt, created_at) VALUES(?,?,?,?,?,?)",
                    (username, full_name, role, pwd_hash, salt, utc_now()),
                )
                conn.commit()
            except sqlite3.IntegrityError:
                conn.close()
                self._send_json({"error": "Ese nombre de usuario ya existe"}, HTTPStatus.CONFLICT)
                return
            conn.close()
            self._send_json({"ok": True}, HTTPStatus.CREATED)
            return

        self._send_json({"error": "Endpoint no encontrado"}, HTTPStatus.NOT_FOUND)


def main():
    init_db()
    server = ThreadingHTTPServer((HOST, PORT), CleanBotHandler)
    print("\nSumaKlean Sim 2.0 listo")
    print(f"Abre en tu navegador: http://{HOST}:{PORT}")
    print("Usuarios demo:")
    print("  admin / admin123")
    print("  operador / demo123")
    print("  observador / view123")
    print("\nPresiona Ctrl+C para detener.\n")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
