# SumaKlean Sim 2.0 — Simulación funcional avanzada

Este proyecto aporta el backend de la demostración SumaKlean: autenticación por perfiles, administración de usuarios y persistencia de reportes en **SQLite**. Al ejecutar `run.bat` o `run.sh`, el servidor abre la experiencia web 3D de la carpeta principal, que integra esas funciones con la navegación y la telemetría. El panel 2D original sigue disponible en `/avanzada/`.

## Funciones implementadas

1. **Experiencia 3D**: habitación y robot modular representados en Three.js, con escenarios de hospital, industria y bodega.
2. **Navegación**: cobertura automática o selección de destino, con A* y Dijkstra; control manual con WASD o flechas.
3. **Cámara simulada**: vista frontal desde el robot hacia los residuos en su campo visual; muestra conceptual, no identifica sustancias.
4. **Sensores simulados**: ultrasónico frontal/izquierdo/derecho, temperatura, humedad, VOC, batería y nivel de tanque.
5. **Base de datos SQLite**: reportes con cobertura, tiempo, distancia, obstáculos, pulverización y snapshot de sensores.
6. **Usuarios y perfiles**:
   - `admin`: simula, guarda reportes y crea usuarios.
   - `operator`: simula y guarda sus reportes.
   - `observer`: visualiza la simulación y reportes sin operar el robot.
7. **Webots**: carpeta `webots/` con un mundo de demostración independiente y un controlador Python para un robot diferencial con sensor frontal.

## Ejecutar en Windows

1. Instala Three.js desde la carpeta principal del proyecto: `npm install`.
2. Haz doble clic en `run.bat`.
3. Si el navegador no se abre automáticamente, entra a `http://127.0.0.1:8000`.

No necesitas instalar librerías de Python: el servidor usa módulos de la biblioteca estándar.

El servidor también mantiene el dashboard 2D anterior en `http://127.0.0.1:8000/avanzada/`. Para ejecutar manualmente:

```bash
python server.py
```

## Usuarios de demostración

- Administrador: `admin` / `admin123`
- Operador: `operador` / `demo123`
- Observador: `observador` / `view123`

**Importante:** son credenciales de demostración para un Hackathon. Cámbialas antes de usar el proyecto fuera de un entorno de prueba.

## Uso de la simulación

### Modo automático

- Selecciona escenario y algoritmo.
- Pulsa **Iniciar misión** para generar una ruta de cobertura.
- También puedes hacer clic en una celda libre del mapa para ordenar al robot ir a ese destino usando A* o Dijkstra.

### Modo manual

- Selecciona **Manual por teclado**.
- Usa `WASD` o las flechas.
- Con pulverización en `AUTO`, mantén `Espacio` para simular la aplicación del líquido.
- También puedes cambiar pulverización a `ON` o `OFF` desde el botón.

### Reportes

Pulsa **Guardar reporte** para almacenar la ejecución en `cleanbot.db`. La tabla inferior muestra los reportes disponibles según el perfil. El botón `CSV` exporta el historial.

## Estructura

```text
CleanBot_Simulacion_Avanzada/
├── server.py
├── cleanbot.db              # se crea automáticamente al ejecutar
├── run.bat
├── run.sh
├── static/
│   ├── index.html
│   ├── styles.css
│   └── app.js
└── webots/
    ├── worlds/
    │   └── cleanbot_demo.wbt
    └── controllers/
        └── cleanbot_controller/
            └── cleanbot_controller.py
```

La página 3D, `dashboard-3d.js`, `styles.css` y `package.json` están en la carpeta principal del proyecto. El servidor publica esos archivos y la dependencia Three.js local, además de sus recursos de `static/`.

## Webots 3D

1. Instala Webots.
2. Abre `webots/worlds/cleanbot_demo.wbt`.
3. Webots detectará el controlador `cleanbot_controller`.
4. Ejecuta la simulación.

El mundo Webots es una **base de evolución** independiente de la escena 3D web: demuestra un robot diferencial con sensor frontal y evasión simple. No está conectado al backend ni a la telemetría del navegador.

## Qué demuestra frente al jurado

El objetivo no es afirmar que ya existe un robot industrial certificado. El proyecto demuestra digitalmente la lógica de una futura solución física: navegación, selección de ruta, detección de obstáculos, cobertura, pulverización simulada, monitoreo, trazabilidad y administración de usuarios.
