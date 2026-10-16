import * as THREE from './node_modules/three/build/three.module.js';
import { OrbitControls } from './node_modules/three/examples/jsm/controls/OrbitControls.js';

const ui = {
  status: document.getElementById('status'), elapsed: document.getElementById('elapsed'),
  coverage: document.getElementById('coverage'), coverageMini: document.getElementById('coverageMini'),
  coverageBar: document.getElementById('coverageBar'), obstacles: document.getElementById('obstacles'),
  sprayState: document.getElementById('sprayState'), log: document.getElementById('eventLog'),
  startBtn: document.getElementById('startBtn'), pauseBtn: document.getElementById('pauseBtn'),
  resetBtn: document.getElementById('resetBtn'), sprayBtn: document.getElementById('sprayBtn'),
  downloadBtn: document.getElementById('downloadBtn'), scene: document.getElementById('simCanvas'),
  loading: document.getElementById('sceneLoading')
};

const room = { x: 30, y: 30, w: 740, h: 440 };
const cellSize = 20;
const cols = Math.floor(room.w / cellSize);
const rows = Math.floor(room.h / cellSize);
const scale = 50;
const worldWidth = room.w / scale;
const worldDepth = room.h / scale;
const obstacles = [
  { x: 180, y: 110, w: 130, h: 70, label: 'Camilla', type: 'bed' },
  { x: 470, y: 80, w: 110, h: 90, label: 'Equipo', type: 'cart' },
  { x: 330, y: 270, w: 150, h: 80, label: 'Mesa', type: 'table' },
  { x: 610, y: 310, w: 90, h: 90, label: 'Gabinete', type: 'cabinet' }
];

const scene = new THREE.Scene();
scene.background = new THREE.Color('#d9e5dc');
scene.fog = new THREE.Fog('#d9e5dc', 16, 31);
const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 80);
camera.position.set(10.8, 12.6, 13.2);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
ui.scene.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0.15, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.07;
controls.minDistance = 9;
controls.maxDistance = 25;
controls.maxPolarAngle = Math.PI * 0.47;

scene.add(new THREE.HemisphereLight('#f4fff6', '#8c9a89', 2.1));
const keyLight = new THREE.DirectionalLight('#fff4dc', 3.4);
keyLight.position.set(-5, 12, 7);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(1536, 1536);
keyLight.shadow.camera.left = -12;
keyLight.shadow.camera.right = 12;
keyLight.shadow.camera.top = 12;
keyLight.shadow.camera.bottom = -12;
scene.add(keyLight);

const materials = {
  floor: new THREE.MeshStandardMaterial({ color: '#e9ece2', roughness: 0.94 }),
  wall: new THREE.MeshStandardMaterial({ color: '#edf1e7', roughness: 0.9 }),
  trim: new THREE.MeshStandardMaterial({ color: '#9fb9aa', roughness: 0.75 }),
  robot: new THREE.MeshStandardMaterial({ color: '#176d5d', roughness: 0.42, metalness: 0.16 }),
  robotLight: new THREE.MeshStandardMaterial({ color: '#bce363', roughness: 0.36, emissive: '#243712', emissiveIntensity: 0.25 }),
  white: new THREE.MeshStandardMaterial({ color: '#f7f8f2', roughness: 0.48 }),
  dark: new THREE.MeshStandardMaterial({ color: '#273934', roughness: 0.74 }),
  steel: new THREE.MeshStandardMaterial({ color: '#9baea4', roughness: 0.38, metalness: 0.55 }),
  bed: new THREE.MeshStandardMaterial({ color: '#f7f5ec', roughness: 0.85 }),
  linen: new THREE.MeshStandardMaterial({ color: '#8db7ad', roughness: 0.82 }),
  coral: new THREE.MeshStandardMaterial({ color: '#cf8068', roughness: 0.75 }),
  glass: new THREE.MeshStandardMaterial({ color: '#95c5c1', roughness: 0.22, metalness: 0.25 })
};

function box(parent, material, x, y, z, width, height, depth, castShadow = true) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
  mesh.position.set(x, y, z);
  mesh.castShadow = castShadow;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function worldX(pixelX) { return (pixelX - room.x) / scale - worldWidth / 2; }
function worldZ(pixelY) { return (pixelY - room.y) / scale - worldDepth / 2; }

function buildRoom() {
  const floor = box(scene, materials.floor, 0, -0.1, 0, worldWidth, 0.2, worldDepth, false);
  floor.receiveShadow = true;
  const gridMaterial = new THREE.LineBasicMaterial({ color: '#cbd5c9', transparent: true, opacity: 0.68 });
  const gridPoints = [];
  for (let x = 0; x <= cols; x++) {
    const px = -worldWidth / 2 + x * (cellSize / scale);
    gridPoints.push(new THREE.Vector3(px, 0.006, -worldDepth / 2), new THREE.Vector3(px, 0.006, worldDepth / 2));
  }
  for (let z = 0; z <= rows; z++) {
    const pz = -worldDepth / 2 + z * (cellSize / scale);
    gridPoints.push(new THREE.Vector3(-worldWidth / 2, 0.006, pz), new THREE.Vector3(worldWidth / 2, 0.006, pz));
  }
  const gridGeometry = new THREE.BufferGeometry().setFromPoints(gridPoints);
  scene.add(new THREE.LineSegments(gridGeometry, gridMaterial));

  box(scene, materials.wall, 0, 1.12, -worldDepth / 2 - 0.08, worldWidth, 2.24, 0.16, false);
  box(scene, materials.trim, 0, 0.12, -worldDepth / 2 + 0.012, worldWidth, 0.24, 0.04, false);
  box(scene, materials.wall, -worldWidth / 2 - 0.08, 1.12, 0, 0.16, 2.24, worldDepth, false);
  box(scene, materials.trim, -worldWidth / 2 + 0.012, 0.12, 0, 0.04, 0.24, worldDepth, false);

  const windowMaterial = new THREE.MeshStandardMaterial({ color: '#a8c8be', roughness: 0.3, metalness: 0.12 });
  box(scene, windowMaterial, -2.4, 1.35, -worldDepth / 2 + 0.015, 2.2, 0.82, 0.035, false);
  box(scene, materials.trim, -2.4, 1.35, -worldDepth / 2 + 0.04, 0.045, 0.9, 0.04, false);
  box(scene, materials.trim, -2.4, 1.35, -worldDepth / 2 + 0.04, 2.25, 0.045, 0.04, false);
  box(scene, materials.trim, -2.4, 1.35, -worldDepth / 2 + 0.04, 0.045, 0.9, 0.04, false);
}

function buildObstacle(obstacle) {
  const group = new THREE.Group();
  group.position.set(worldX(obstacle.x + obstacle.w / 2), 0, worldZ(obstacle.y + obstacle.h / 2));
  scene.add(group);
  const width = obstacle.w / scale;
  const depth = obstacle.h / scale;

  if (obstacle.type === 'bed') {
    const frameY = 0.32;
    box(group, materials.steel, 0, 0.2, 0, width * 0.82, 0.12, depth * 0.8);
    box(group, materials.bed, 0, frameY, 0, width * 0.92, 0.16, depth * 0.88);
    box(group, materials.linen, 0, frameY + 0.095, -depth * 0.12, width * 0.88, 0.055, depth * 0.48);
    box(group, materials.white, 0, frameY + 0.14, -depth * 0.32, width * 0.31, 0.07, depth * 0.2);
    box(group, materials.steel, 0, 0.08, -depth * 0.35, width * 0.94, 0.07, 0.055);
    box(group, materials.steel, 0, 0.08, depth * 0.35, width * 0.94, 0.07, 0.055);
  } else if (obstacle.type === 'cart') {
    box(group, materials.white, 0, 0.48, 0, width * 0.82, 0.68, depth * 0.72);
    box(group, materials.glass, 0, 0.48, depth * 0.372, width * 0.66, 0.45, 0.025);
    box(group, materials.coral, 0, 0.81, 0, width * 0.88, 0.055, depth * 0.78);
    box(group, materials.dark, 0, 0.14, 0, width * 0.9, 0.09, depth * 0.82);
    for (const x of [-width * 0.34, width * 0.34]) {
      for (const z of [-depth * 0.29, depth * 0.29]) {
        const caster = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.045, 12), materials.dark);
        caster.rotation.z = Math.PI / 2;
        caster.position.set(x, 0.07, z);
        group.add(caster);
      }
    }
  } else if (obstacle.type === 'table') {
    box(group, materials.bed, 0, 0.64, 0, width * 0.9, 0.12, depth * 0.84);
    for (const x of [-width * 0.38, width * 0.38]) {
      for (const z of [-depth * 0.34, depth * 0.34]) box(group, materials.steel, x, 0.31, z, 0.065, 0.62, 0.065);
    }
    box(group, materials.linen, 0, 0.72, 0, width * 0.34, 0.045, depth * 0.3);
  } else {
    box(group, materials.coral, 0, 0.76, 0, width * 0.92, 1.48, depth * 0.9);
    box(group, materials.white, 0, 0.76, depth * 0.458, width * 0.84, 1.34, 0.025);
    box(group, materials.steel, 0, 1.36, depth * 0.48, width * 0.83, 0.035, 0.06);
    box(group, materials.steel, 0, 0.74, depth * 0.48, width * 0.83, 0.035, 0.06);
    const handle = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 10), materials.green || materials.robot);
    handle.position.set(width * 0.25, 0.78, depth * 0.5);
    group.add(handle);
  }
}

function buildRobot() {
  const group = new THREE.Group();
  scene.add(group);
  box(group, materials.dark, 0, 0.25, 0, 0.9, 0.22, 0.68);
  box(group, materials.robot, 0, 0.42, 0, 0.84, 0.2, 0.62);
  box(group, materials.white, 0, 0.55, 0.02, 0.42, 0.08, 0.42);
  box(group, materials.robotLight, 0, 0.555, 0.27, 0.29, 0.055, 0.075);

    for (const x of [-0.29, 0.29]) {
      for (const z of [-0.31, 0.31]) {
        const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.1, 20), materials.dark);
        wheel.rotation.x = Math.PI / 2;
        wheel.position.set(x, 0.18, z);
        wheel.castShadow = true;
        group.add(wheel);
      }
  }

  const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.17, 0.38, 18), materials.white);
  tank.position.set(0, 0.78, -0.11);
  tank.castShadow = true;
  group.add(tank);
  const tankCap = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.055, 16), materials.robotLight);
  tankCap.position.set(0, 1.0, -0.11);
  group.add(tankCap);

  const lidar = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.11, 18), materials.dark);
  lidar.position.set(0, 0.7, 0.18);
  group.add(lidar);
  const lidarTop = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.035, 18), materials.robotLight);
  lidarTop.position.set(0, 0.77, 0.18);
  group.add(lidarTop);

  const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.22, 10), materials.steel);
  nozzle.position.set(0, 0.31, -0.43);
  group.add(nozzle);
  const sprayFan = new THREE.Mesh(
    new THREE.ConeGeometry(0.4, 0.65, 20, 1, true),
    new THREE.MeshBasicMaterial({ color: '#91d6c2', transparent: true, opacity: 0.31, side: THREE.DoubleSide, depthWrite: false })
  );
    sprayFan.rotation.x = -Math.PI / 2;
    sprayFan.position.set(0, 0.24, -0.55);
  group.add(sprayFan);
  return { group, sprayFan };
}

buildRoom();
obstacles.forEach(buildObstacle);
const { group: robotMesh, sprayFan } = buildRobot();
const coverageMaterial = new THREE.MeshBasicMaterial({ color: '#8fbd70', transparent: true, opacity: 0.49, depthWrite: false });
const coverageGeometry = new THREE.PlaneGeometry(cellSize / scale - 0.025, cellSize / scale - 0.025);
const coverageMeshes = new Map();
const robot = { x: room.x + 28, y: room.y + 28, r: 12, speed: 75, vx: 1, vy: 0, spraying: false };

let running = false;
let completed = false;
let elapsedSeconds = 0;
let lastFrame = 0;
let sprayMode = 'AUTO';
let laneDirection = 1;
const detectedSet = new Set();
const visited = new Set();
const events = [];

function isCellBlocked(cx, cy) {
  const px = room.x + cx * cellSize + cellSize / 2;
  const py = room.y + cy * cellSize + cellSize / 2;
  return obstacles.some(o => px >= o.x && px <= o.x + o.w && py >= o.y && py <= o.y + o.h);
}

function totalReachableCells() {
  let total = 0;
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) if (!isCellBlocked(x, y)) total++;
  return total;
}

const reachableCells = totalReachableCells();
function coveragePercent() { return Math.min(100, Math.round((visited.size / reachableCells) * 100)); }

function addEvent(event, detail) {
  const time = new Date().toLocaleTimeString('es-EC', { hour12: false });
  events.unshift({ time, event, detail });
  const row = document.createElement('tr');
  for (const value of [time, event, detail]) {
    const cell = document.createElement('td');
    cell.textContent = value;
    row.appendChild(cell);
  }
  ui.log.prepend(row);
}

function resetRobot() {
  robot.x = room.x + 28;
  robot.y = room.y + 28;
  robot.vx = 1;
  robot.vy = 0;
  robot.spraying = false;
  robotMesh.rotation.y = 0;
  running = false;
  completed = false;
  elapsedSeconds = 0;
  lastFrame = 0;
  laneDirection = 1;
  detectedSet.clear();
  visited.clear();
  events.length = 0;
  ui.log.replaceChildren();
  for (const mesh of coverageMeshes.values()) scene.remove(mesh);
  coverageMeshes.clear();
  updateUI();
  addEvent('Sistema listo', 'Simulación reiniciada.');
  syncRobotMesh();
}

function intersectsObstacle(nx, ny) {
  return obstacles.find(o => {
    const cx = Math.max(o.x, Math.min(nx, o.x + o.w));
    const cy = Math.max(o.y, Math.min(ny, o.y + o.h));
    const dx = nx - cx;
    const dy = ny - cy;
    return dx * dx + dy * dy < (robot.r + 6) ** 2;
  });
}

function detectNearbyObstacle() {
  const hit = intersectsObstacle(robot.x + robot.vx * 32, robot.y + robot.vy * 32);
  if (hit) {
    const index = obstacles.indexOf(hit);
    if (!detectedSet.has(index)) {
      detectedSet.add(index);
      addEvent('Obstáculo detectado', `${hit.label}: trayectoria ajustada.`);
    }
  }
}

function markCoverage() {
  if (!robot.spraying) return;
  const cx = Math.floor((robot.x - room.x) / cellSize);
  const cy = Math.floor((robot.y - room.y) / cellSize);
  for (let oy = -2; oy <= 2; oy++) {
    for (let ox = -2; ox <= 2; ox++) {
      if (ox * ox + oy * oy > 5) continue;
      const x = cx + ox;
      const y = cy + oy;
      const key = `${x},${y}`;
      if (x < 0 || x >= cols || y < 0 || y >= rows || isCellBlocked(x, y) || visited.has(key)) continue;
      visited.add(key);
      const tile = new THREE.Mesh(coverageGeometry, coverageMaterial);
      tile.rotation.x = -Math.PI / 2;
      tile.position.set(-worldWidth / 2 + (x + 0.5) * cellSize / scale, 0.012, -worldDepth / 2 + (y + 0.5) * cellSize / scale);
      tile.renderOrder = 1;
      scene.add(tile);
      coverageMeshes.set(key, tile);
    }
  }
}

function moveRobot(dt) {
  robot.vx = laneDirection;
  robot.vy = 0;
  detectNearbyObstacle();
  const nextX = robot.x + laneDirection * robot.speed * dt;
  const right = room.x + room.w - robot.r;
  const left = room.x + robot.r;

  if ((laneDirection === 1 && nextX >= right) || (laneDirection === -1 && nextX <= left)) {
    robot.x = laneDirection === 1 ? right : left;
    const targetY = robot.y + 34;
    if (targetY >= room.y + room.h - robot.r) {
      running = false;
      completed = true;
      robot.spraying = false;
      addEvent('Proceso finalizado', `Cobertura simulada: ${coveragePercent()}%.`);
      return;
    }
    if (!intersectsObstacle(robot.x, targetY)) robot.y = targetY;
    else robot.y = Math.min(targetY + 50, room.y + room.h - robot.r);
    laneDirection *= -1;
  } else {
    const hit = intersectsObstacle(nextX, robot.y);
    if (!hit) robot.x = nextX;
    else {
      const down = robot.y + robot.speed * dt;
      const up = robot.y - robot.speed * dt;
      if (down < room.y + room.h - robot.r && !intersectsObstacle(robot.x, down)) robot.y = down;
      else if (up > room.y + robot.r && !intersectsObstacle(robot.x, up)) robot.y = up;
      else laneDirection *= -1;
    }
  }

  robot.spraying = sprayMode === 'ON' || (sprayMode === 'AUTO' && running);
  markCoverage();
}

function syncRobotMesh() {
  robotMesh.position.set(worldX(robot.x), 0.02, worldZ(robot.y));
    robotMesh.rotation.y = laneDirection === 1 ? Math.PI / 2 : -Math.PI / 2;
  sprayFan.visible = robot.spraying;
}

function updateUI() {
  const coverage = coveragePercent();
  ui.status.textContent = completed ? 'Completado' : running ? 'En operación' : coverage > 0 ? 'Pausado' : 'Listo';
  ui.coverage.textContent = `${coverage}%`;
  ui.coverageMini.textContent = `${coverage}%`;
  ui.coverageBar.style.width = `${coverage}%`;
  ui.obstacles.textContent = detectedSet.size;
  ui.sprayState.textContent = robot.spraying ? 'Activa' : 'Inactiva';
  const minutes = Math.floor(elapsedSeconds / 60).toString().padStart(2, '0');
  const seconds = Math.floor(elapsedSeconds % 60).toString().padStart(2, '0');
  ui.elapsed.textContent = `${minutes}:${seconds}`;
  ui.sprayBtn.innerHTML = `<span aria-hidden="true">◉</span> Pulverización: ${sprayMode}`;
}

function resizeScene() {
  const { width, height } = ui.scene.getBoundingClientRect();
  if (!width || !height) return;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height, false);
}

function loop(timestamp) {
  if (!lastFrame) lastFrame = timestamp;
  const dt = Math.min((timestamp - lastFrame) / 1000, 0.05);
  lastFrame = timestamp;
  if (running) {
    moveRobot(dt);
    elapsedSeconds += dt;
    updateUI();
  }
  syncRobotMesh();
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(loop);
}

ui.startBtn.addEventListener('click', () => {
  if (!running) {
    if (completed) resetRobot();
    completed = false;
    running = true;
    lastFrame = 0;
    addEvent('Proceso iniciado', 'Recorrido autónomo conceptual iniciado.');
    updateUI();
  }
});
ui.pauseBtn.addEventListener('click', () => {
  if (running) {
    running = false;
    robot.spraying = false;
    addEvent('Proceso pausado', 'Operación detenida por el usuario.');
    updateUI();
  }
});
ui.resetBtn.addEventListener('click', resetRobot);
ui.sprayBtn.addEventListener('click', () => {
  sprayMode = sprayMode === 'AUTO' ? 'OFF' : sprayMode === 'OFF' ? 'ON' : 'AUTO';
  if (sprayMode === 'OFF') robot.spraying = false;
  addEvent('Modo de pulverización', `Modo cambiado a ${sprayMode}.`);
  updateUI();
});
ui.downloadBtn.addEventListener('click', () => {
  const data = [['Hora', 'Evento', 'Detalle'], ...[...events].reverse().map(event => [event.time, event.event, event.detail])];
  const csv = data.map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'cleanbot_reporte.csv';
  link.click();
  URL.revokeObjectURL(url);
});

const resizeObserver = new ResizeObserver(resizeScene);
resizeObserver.observe(ui.scene);
resetRobot();
resizeScene();
ui.loading.classList.add('hidden');
requestAnimationFrame(loop);
