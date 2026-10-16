import * as THREE from './node_modules/three/build/three.module.js';
import { OrbitControls } from './node_modules/three/examples/jsm/controls/OrbitControls.js';

const $ = (id) => document.getElementById(id);
const ui = {
  loginOverlay: $('loginOverlay'), loginForm: $('loginForm'), loginUser: $('loginUser'), loginPass: $('loginPass'), loginError: $('loginError'),
  userName: $('userName'), userRole: $('userRole'), logoutBtn: $('logoutBtn'), permissionBadge: $('permissionBadge'),
  scenarioSelect: $('scenarioSelect'), modeSelect: $('modeSelect'), algorithmSelect: $('algorithmSelect'), speedSelect: $('speedSelect'),
  scenarioTitle: $('scenarioTitle'), scenarioDescription: $('scenarioDescription'), assignedZone: $('assignedZone'),
  startBtn: $('startBtn'), pauseBtn: $('pauseBtn'), resetBtn: $('resetBtn'), sprayBtn: $('sprayBtn'), saveReportBtn: $('saveReportBtn'),
  status: $('status'), elapsed: $('elapsed'), coverage: $('coverage'), coverageMini: $('coverageMini'), coverageBar: $('coverageBar'),
  obstacles: $('obstacles'), sprayState: $('sprayState'), distance: $('distance'), battery: $('battery'), tank: $('tank'),
  frontSensor: $('frontSensor'), leftSensor: $('leftSensor'), rightSensor: $('rightSensor'), tempSensor: $('tempSensor'), humiditySensor: $('humiditySensor'), vocSensor: $('vocSensor'),
  eventLog: $('eventLog'), clearLogBtn: $('clearLogBtn'), reportsTable: $('reportsTable'), downloadReportsBtn: $('downloadReportsBtn'),
  adminPanel: $('adminPanel'), userForm: $('userForm'), newFullName: $('newFullName'), newUsername: $('newUsername'), newPassword: $('newPassword'), newRole: $('newRole'), usersTable: $('usersTable'),
  scene: $('simCanvas'), loading: $('sceneLoading'), toast: $('toast')
};

const cellSize = 20;
const cols = 37;
const rows = 22;
const scale = 50;
const worldWidth = cols * cellSize / scale;
const worldDepth = rows * cellSize / scale;
const SCENARIOS = {
  hospital: {
    title: 'Hospital · Área clínica', description: 'Camillas, equipos médicos y zonas de circulación restringida.', baseTemp: 22.4, baseHumidity: 48,
    obstacles: [
      { x: 5, y: 4, w: 7, h: 4, label: 'Camilla A', type: 'bed' }, { x: 17, y: 3, w: 5, h: 5, label: 'Equipo médico', type: 'cart' },
      { x: 28, y: 5, w: 7, h: 3, label: 'Camilla B', type: 'bed' }, { x: 9, y: 14, w: 6, h: 4, label: 'Estación', type: 'cart' },
      { x: 21, y: 13, w: 5, h: 6, label: 'Gabinete', type: 'cabinet' }, { x: 30, y: 15, w: 5, h: 4, label: 'Camilla C', type: 'bed' }
    ], zones: [{ x: 1, y: 1, w: 10, h: 2 }, { x: 27, y: 10, w: 8, h: 3 }]
  },
  industry: {
    title: 'Industria · Planta de proceso', description: 'Maquinaria, tuberías y pasillos de seguridad simulados.', baseTemp: 27.8, baseHumidity: 55,
    obstacles: [
      { x: 4, y: 3, w: 7, h: 6, label: 'Máquina 1', type: 'machine' }, { x: 15, y: 4, w: 5, h: 9, label: 'Tanque', type: 'tank' },
      { x: 24, y: 2, w: 10, h: 5, label: 'Línea de proceso', type: 'machine' }, { x: 26, y: 11, w: 7, h: 7, label: 'Máquina 2', type: 'machine' },
      { x: 4, y: 16, w: 10, h: 4, label: 'Pallets', type: 'crate' }, { x: 18, y: 17, w: 5, h: 4, label: 'Bomba', type: 'machine' }
    ], zones: [{ x: 1, y: 1, w: 35, h: 2 }, { x: 32, y: 8, w: 4, h: 6 }]
  },
  warehouse: {
    title: 'Bodega · Almacenamiento', description: 'Estanterías, pallets y corredores para navegación autónoma.', baseTemp: 24.5, baseHumidity: 52,
    obstacles: [
      { x: 4, y: 3, w: 4, h: 8, label: 'Rack A', type: 'rack' }, { x: 12, y: 3, w: 4, h: 8, label: 'Rack B', type: 'rack' },
      { x: 20, y: 3, w: 4, h: 8, label: 'Rack C', type: 'rack' }, { x: 28, y: 3, w: 4, h: 8, label: 'Rack D', type: 'rack' },
      { x: 6, y: 15, w: 6, h: 5, label: 'Pallets', type: 'crate' }, { x: 17, y: 14, w: 6, h: 6, label: 'Carga', type: 'crate' },
      { x: 27, y: 15, w: 7, h: 5, label: 'Pallets', type: 'crate' }
    ], zones: [{ x: 1, y: 12, w: 35, h: 2 }]
  }
};

const scene = new THREE.Scene();
scene.background = new THREE.Color('#d9e5dc');
scene.fog = new THREE.Fog('#d9e5dc', 14, 29);
const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 80);
camera.position.set(9.4, 10.4, 11.5);
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
controls.minDistance = 7;
controls.maxDistance = 22;
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
  glass: new THREE.MeshStandardMaterial({ color: '#95c5c1', roughness: 0.22, metalness: 0.25 }),
  zone: new THREE.MeshBasicMaterial({ color: '#e3bb66', transparent: true, opacity: 0.2, depthWrite: false }),
  coverage: new THREE.MeshBasicMaterial({ color: '#8fbd70', transparent: true, opacity: 0.49, depthWrite: false })
};

function box(parent, material, x, y, z, width, height, depth, castShadow = true) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
  mesh.position.set(x, y, z);
  mesh.castShadow = castShadow;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function worldX(cellX) { return -worldWidth / 2 + cellX * cellSize / scale; }
function worldZ(cellY) { return -worldDepth / 2 + cellY * cellSize / scale; }
function cellCenter(x, y) { return { x: worldX(x + 0.5), z: worldZ(y + 0.5) }; }

const floor = box(scene, materials.floor, 0, -0.1, 0, worldWidth, 0.2, worldDepth, false);
floor.receiveShadow = true;
const gridPoints = [];
for (let x = 0; x <= cols; x++) {
  const px = worldX(x);
  gridPoints.push(new THREE.Vector3(px, 0.006, -worldDepth / 2), new THREE.Vector3(px, 0.006, worldDepth / 2));
}
for (let y = 0; y <= rows; y++) {
  const pz = worldZ(y);
  gridPoints.push(new THREE.Vector3(-worldWidth / 2, 0.006, pz), new THREE.Vector3(worldWidth / 2, 0.006, pz));
}
scene.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(gridPoints), new THREE.LineBasicMaterial({ color: '#cbd5c9', transparent: true, opacity: 0.68 })));
box(scene, materials.wall, 0, 1.12, -worldDepth / 2 - 0.08, worldWidth, 2.24, 0.16, false);
box(scene, materials.trim, 0, 0.12, -worldDepth / 2 + 0.012, worldWidth, 0.24, 0.04, false);
box(scene, materials.wall, -worldWidth / 2 - 0.08, 1.12, 0, 0.16, 2.24, worldDepth, false);
box(scene, materials.trim, -worldWidth / 2 + 0.012, 0.12, 0, 0.04, 0.24, worldDepth, false);

const obstacleGroup = new THREE.Group();
const zoneGroup = new THREE.Group();
const coverageGroup = new THREE.Group();
const routeGroup = new THREE.Group();
scene.add(zoneGroup, obstacleGroup, coverageGroup, routeGroup);

function clearGeometries(group) {
  group.traverse((object) => object.geometry?.dispose());
  group.clear();
}

function clearRoute() {
  routeGroup.traverse((object) => {
    object.geometry?.dispose();
    if (Array.isArray(object.material)) object.material.forEach((material) => material.dispose());
    else object.material?.dispose();
  });
  routeGroup.clear();
}

function buildObstacle(obstacle) {
  const group = new THREE.Group();
  const center = cellCenter(obstacle.x + obstacle.w / 2 - 0.5, obstacle.y + obstacle.h / 2 - 0.5);
  group.position.set(center.x, 0, center.z);
  obstacleGroup.add(group);
  const width = obstacle.w * cellSize / scale;
  const depth = obstacle.h * cellSize / scale;
  if (obstacle.type === 'bed') {
    box(group, materials.steel, 0, 0.2, 0, width * 0.82, 0.12, depth * 0.8);
    box(group, materials.bed, 0, 0.32, 0, width * 0.92, 0.16, depth * 0.88);
    box(group, materials.linen, 0, 0.415, -depth * 0.12, width * 0.88, 0.055, depth * 0.48);
    box(group, materials.white, 0, 0.46, -depth * 0.32, width * 0.31, 0.07, depth * 0.2);
    box(group, materials.steel, 0, 0.08, -depth * 0.35, width * 0.94, 0.07, 0.055);
    box(group, materials.steel, 0, 0.08, depth * 0.35, width * 0.94, 0.07, 0.055);
  } else if (obstacle.type === 'cart') {
    box(group, materials.white, 0, 0.48, 0, width * 0.82, 0.68, depth * 0.72);
    box(group, materials.glass, 0, 0.48, depth * 0.372, width * 0.66, 0.45, 0.025);
    box(group, materials.coral, 0, 0.81, 0, width * 0.88, 0.055, depth * 0.78);
    box(group, materials.dark, 0, 0.14, 0, width * 0.9, 0.09, depth * 0.82);
  } else if (obstacle.type === 'rack') {
    box(group, materials.coral, 0, 0.84, 0, width, 1.68, depth, true);
    for (const level of [0.35, 0.85, 1.35]) box(group, materials.steel, 0, level, depth * 0.53, width * 0.92, 0.05, 0.055);
    for (const x of [-width * 0.32, 0, width * 0.32]) box(group, materials.white, x, 1.05, 0, width * 0.25, 0.28, depth * 0.8);
  } else if (obstacle.type === 'machine' || obstacle.type === 'tank') {
    if (obstacle.type === 'tank') {
      const vessel = new THREE.Mesh(new THREE.CylinderGeometry(width * 0.43, width * 0.43, 1.65, 24), materials.steel);
      vessel.position.y = 0.9;
      vessel.castShadow = true;
      group.add(vessel);
      box(group, materials.coral, 0, 1.74, 0, width * 0.56, 0.08, width * 0.56);
    } else {
      box(group, materials.coral, 0, 0.7, 0, width * 0.88, 1.35, depth * 0.88);
      box(group, materials.dark, 0, 0.18, depth * 0.46, width * 0.72, 0.24, 0.04);
      box(group, materials.steel, 0, 1.43, 0, width * 0.72, 0.12, depth * 0.72);
    }
  } else {
    box(group, materials.coral, 0, 0.38, 0, width * 0.9, 0.76, depth * 0.9);
    box(group, materials.white, 0, 0.79, 0, width * 0.42, 0.05, depth * 0.42);
  }
}

function buildScenario() {
  clearGeometries(obstacleGroup);
  clearGeometries(zoneGroup);
  const scenario = SCENARIOS[ui.scenarioSelect.value];
  for (const obstacle of scenario.obstacles) buildObstacle(obstacle);
  for (const zone of scenario.zones) {
    const center = cellCenter(zone.x + zone.w / 2 - 0.5, zone.y + zone.h / 2 - 0.5);
    const mark = new THREE.Mesh(new THREE.PlaneGeometry(zone.w * cellSize / scale, zone.h * cellSize / scale), materials.zone);
    mark.rotation.x = -Math.PI / 2;
    mark.position.set(center.x, 0.014, center.z);
    mark.renderOrder = 1;
    zoneGroup.add(mark);
  }
  ui.scenarioTitle.textContent = scenario.title;
  ui.scenarioDescription.textContent = scenario.description;
  ui.assignedZone.textContent = `${scenario.title.split(' · ')[0]} · Zona A`;
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
  const tankBody = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.17, 0.38, 18), materials.white);
  tankBody.position.set(0, 0.78, -0.11);
  tankBody.castShadow = true;
  group.add(tankBody);
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
  const sprayFan = new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.65, 20, 1, true), new THREE.MeshBasicMaterial({ color: '#91d6c2', transparent: true, opacity: 0.31, side: THREE.DoubleSide, depthWrite: false }));
  sprayFan.rotation.x = -Math.PI / 2;
  sprayFan.position.set(0, 0.24, -0.55);
  group.add(sprayFan);
  return { group, sprayFan };
}

const { group: robotMesh, sprayFan } = buildRobot();
const coverageGeometry = new THREE.PlaneGeometry(cellSize / scale - 0.025, cellSize / scale - 0.025);
const auth = { token: localStorage.getItem('cleanbot_token') || '', user: null };
const keys = new Set();
const visited = new Set();
const detected = new Set();
const events = [];
const sim = {
  position: { x: 1.5, y: 1.5 }, heading: 'E', route: [], routeIndex: 0, running: false, completed: false,
  status: 'Listo', elapsed: 0, distance: 0, spraySeconds: 0, battery: 100, tank: 100, sprayMode: 'AUTO', spraying: false,
  sensors: { front: 0, left: 0, right: 0, temp: 0, humidity: 0, voc: 0 }
};
const direction = { N: { x: 0, y: -1 }, E: { x: 1, y: 0 }, S: { x: 0, y: 1 }, W: { x: -1, y: 0 } };
let lastFrame = 0;
let lastUiUpdate = 0;

function toast(message) {
  ui.toast.textContent = message;
  ui.toast.classList.add('show');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => ui.toast.classList.remove('show'), 2600);
}

async function api(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (options.body && !headers['Content-Type']) headers['Content-Type'] = 'application/json';
  if (auth.token) headers.Authorization = `Bearer ${auth.token}`;
  const response = await fetch(path, { ...options, headers });
  const type = response.headers.get('content-type') || '';
  const data = type.includes('application/json') ? await response.json() : null;
  if (!response.ok) throw new Error(data?.error || `Error HTTP ${response.status}`);
  return data;
}

function roleLabel(role) { return ({ admin: 'Administrador', operator: 'Operador', observer: 'Observador' })[role] || role; }
function showLogin() { ui.loginOverlay.classList.remove('hidden'); }

function enterApp() {
  ui.loginOverlay.classList.add('hidden');
  ui.userName.textContent = auth.user.full_name;
  ui.userRole.textContent = roleLabel(auth.user.role);
  ui.permissionBadge.textContent = roleLabel(auth.user.role);
  const observer = auth.user.role === 'observer';
  [ui.startBtn, ui.pauseBtn, ui.resetBtn, ui.sprayBtn, ui.saveReportBtn].forEach((button) => { button.disabled = observer; });
  [ui.scenarioSelect, ui.modeSelect, ui.algorithmSelect, ui.speedSelect].forEach((select) => { select.disabled = observer; });
  ui.adminPanel.classList.toggle('hidden', auth.user.role !== 'admin');
  resetSimulation(true);
  loadReports();
  if (auth.user.role === 'admin') loadUsers();
}

async function restoreSession() {
  if (!auth.token) return showLogin();
  try {
    const data = await api('/api/me');
    auth.user = data.user;
    enterApp();
  } catch {
    auth.token = '';
    localStorage.removeItem('cleanbot_token');
    showLogin();
  }
}

ui.loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  ui.loginError.textContent = '';
  try {
    const data = await api('/api/login', { method: 'POST', body: JSON.stringify({ username: ui.loginUser.value.trim(), password: ui.loginPass.value }) });
    auth.token = data.token;
    auth.user = data.user;
    localStorage.setItem('cleanbot_token', auth.token);
    enterApp();
  } catch (error) {
    ui.loginError.textContent = error.message;
  }
});

ui.logoutBtn.addEventListener('click', async () => {
  try { await api('/api/logout', { method: 'POST' }); } catch {}
  auth.token = '';
  auth.user = null;
  localStorage.removeItem('cleanbot_token');
  sim.running = false;
  showLogin();
});

function blocked(x, y) {
  if (x < 0 || y < 0 || x >= cols || y >= rows) return true;
  return SCENARIOS[ui.scenarioSelect.value].obstacles.some((obstacle) => x >= obstacle.x && x < obstacle.x + obstacle.w && y >= obstacle.y && y < obstacle.y + obstacle.h);
}

function cellKey(x, y) { return `${x},${y}`; }
function positionCell(position = sim.position) { return { x: Math.floor(position.x), y: Math.floor(position.y) }; }
function neighbors(point) { return [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([x, y]) => ({ x: point.x + x, y: point.y + y })).filter((next) => !blocked(next.x, next.y)); }
function heuristic(a, b) { return Math.abs(a.x - b.x) + Math.abs(a.y - b.y); }

function findPath(start, goal, algorithm = ui.algorithmSelect.value) {
  if (blocked(goal.x, goal.y)) return [];
  const key = cellKey(start.x, start.y);
  const goalKey = cellKey(goal.x, goal.y);
  const open = [{ ...start, key }];
  const openSet = new Set([key]);
  const cameFrom = new Map();
  const cost = new Map([[key, 0]]);
  const score = new Map([[key, algorithm === 'astar' ? heuristic(start, goal) : 0]]);
  while (open.length) {
    let best = 0;
    for (let i = 1; i < open.length; i++) if ((score.get(open[i].key) ?? Infinity) < (score.get(open[best].key) ?? Infinity)) best = i;
    const current = open.splice(best, 1)[0];
    openSet.delete(current.key);
    if (current.key === goalKey) {
      const path = [];
      let currentKey = goalKey;
      while (currentKey) {
        const [x, y] = currentKey.split(',').map(Number);
        path.push({ x, y });
        currentKey = cameFrom.get(currentKey);
      }
      return path.reverse();
    }
    for (const next of neighbors(current)) {
      const nextKey = cellKey(next.x, next.y);
      const nextCost = (cost.get(current.key) ?? Infinity) + 1;
      if (nextCost >= (cost.get(nextKey) ?? Infinity)) continue;
      cameFrom.set(nextKey, current.key);
      cost.set(nextKey, nextCost);
      score.set(nextKey, nextCost + (algorithm === 'astar' ? heuristic(next, goal) : 0));
      if (!openSet.has(nextKey)) {
        open.push({ ...next, key: nextKey });
        openSet.add(nextKey);
      }
    }
  }
  return [];
}

function buildCoverageRoute() {
  const goals = [];
  let reverse = false;
  for (let y = 1; y < rows - 1; y += 3) {
    const line = [];
    for (let x = 1; x < cols - 1; x += 3) if (!blocked(x, y)) line.push({ x, y });
    if (reverse) line.reverse();
    reverse = !reverse;
    goals.push(...line);
  }
  let current = positionCell();
  const route = [current];
  for (const goal of goals) {
    const segment = findPath(current, goal);
    if (segment.length > 1) {
      route.push(...segment.slice(1));
      current = goal;
    }
  }
  return route;
}

function drawRoute() {
  clearRoute();
  if (sim.route.length < 2) return;
  const points = sim.route.map(({ x, y }) => {
    const center = cellCenter(x, y);
    return new THREE.Vector3(center.x, 0.035, center.z);
  });
  if (points.length < 2) return;
  const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), new THREE.LineBasicMaterial({ color: '#d59436', transparent: true, opacity: 0.82 }));
  routeGroup.add(line);
}

function clearCoverage() {
  coverageGroup.clear();
  visited.clear();
}

function markCoverage() {
  if (!sim.spraying || sim.tank <= 0) return;
  const cell = positionCell();
  for (let oy = -2; oy <= 2; oy++) {
    for (let ox = -2; ox <= 2; ox++) {
      if (ox * ox + oy * oy > 5) continue;
      const x = cell.x + ox;
      const y = cell.y + oy;
      const key = cellKey(x, y);
      if (blocked(x, y) || visited.has(key)) continue;
      visited.add(key);
      const center = cellCenter(x, y);
      const tile = new THREE.Mesh(coverageGeometry, materials.coverage);
      tile.rotation.x = -Math.PI / 2;
      tile.position.set(center.x, 0.012, center.z);
      tile.renderOrder = 1;
      coverageGroup.add(tile);
    }
  }
}

function freeCellCount() {
  let count = 0;
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) if (!blocked(x, y)) count++;
  return count;
}

function coveragePercent() { return Math.min(100, Math.round(visited.size / freeCellCount() * 100)); }

function addEvent(event, detail) {
  const time = new Date().toLocaleTimeString('es-EC', { hour12: false });
  events.unshift({ time, event, detail });
  const row = document.createElement('tr');
  for (const value of [time, event, detail]) {
    const cell = document.createElement('td');
    cell.textContent = value;
    row.appendChild(cell);
  }
  ui.eventLog.prepend(row);
}

function resetSimulation(silent = false) {
  sim.position = { x: 1.5, y: 1.5 };
  sim.heading = 'E';
  sim.route = [];
  sim.routeIndex = 0;
  sim.running = false;
  sim.completed = false;
  sim.status = 'Listo';
  sim.elapsed = 0;
  sim.distance = 0;
  sim.spraySeconds = 0;
  sim.battery = 100;
  sim.tank = 100;
  sim.spraying = false;
  detected.clear();
  events.length = 0;
  ui.eventLog.replaceChildren();
  clearCoverage();
  buildScenario();
  clearRoute();
  updateSensors();
  syncRobotMesh();
  updateUI();
  if (!silent) addEvent('Sistema listo', 'Simulación 3D reiniciada.');
}

function rayDistance(heading) {
  const vector = direction[heading];
  const cell = positionCell();
  let steps = 0;
  for (let distance = 1; distance <= 12; distance++) {
    if (blocked(cell.x + vector.x * distance, cell.y + vector.y * distance)) break;
    steps = distance;
  }
  return Math.max(5, steps * cellSize);
}

function rotateHeading(heading, turn) {
  const order = ['N', 'E', 'S', 'W'];
  const index = order.indexOf(heading);
  return order[(index + (turn === 'R' ? 1 : 3)) % order.length];
}

function updateSensors() {
  const scenario = SCENARIOS[ui.scenarioSelect.value];
  const wave = Math.sin(sim.elapsed / 6);
  sim.sensors.front = rayDistance(sim.heading);
  sim.sensors.left = rayDistance(rotateHeading(sim.heading, 'L'));
  sim.sensors.right = rayDistance(rotateHeading(sim.heading, 'R'));
  sim.sensors.temp = scenario.baseTemp + wave * 0.7;
  sim.sensors.humidity = scenario.baseHumidity + Math.cos(sim.elapsed / 8) * 2.3;
  sim.sensors.voc = Math.round(18 + (sim.spraying ? 13 : 0) + Math.abs(Math.sin(sim.elapsed / 5)) * 5);
}

function updateUI() {
  const coverage = coveragePercent();
  ui.status.textContent = sim.running ? 'En operación' : sim.completed ? 'Completado' : sim.status;
  ui.coverage.textContent = `${coverage}%`;
  ui.coverageMini.textContent = `${coverage}%`;
  ui.coverageBar.style.width = `${coverage}%`;
  ui.obstacles.textContent = String(detected.size);
  ui.sprayState.textContent = sim.spraying ? 'Activa' : 'Inactiva';
  ui.distance.textContent = `${sim.distance.toFixed(1)} m`;
  ui.battery.textContent = `${sim.battery.toFixed(0)}%`;
  ui.tank.textContent = `${sim.tank.toFixed(0)}%`;
  const minutes = Math.floor(sim.elapsed / 60).toString().padStart(2, '0');
  const seconds = Math.floor(sim.elapsed % 60).toString().padStart(2, '0');
  ui.elapsed.textContent = `${minutes}:${seconds}`;
  ui.frontSensor.textContent = `${sim.sensors.front} cm`;
  ui.leftSensor.textContent = `${sim.sensors.left} cm`;
  ui.rightSensor.textContent = `${sim.sensors.right} cm`;
  ui.tempSensor.textContent = `${sim.sensors.temp.toFixed(1)} °C`;
  ui.humiditySensor.textContent = `${sim.sensors.humidity.toFixed(0)} %`;
  ui.vocSensor.textContent = `${sim.sensors.voc} índice`;
  ui.sprayBtn.innerHTML = `<span aria-hidden="true">◉</span> Pulverización: ${sim.sprayMode}`;
}

function syncRobotMesh() {
  const x = worldX(sim.position.x);
  const z = worldZ(sim.position.y);
  robotMesh.position.set(x, 0.02, z);
  const vector = direction[sim.heading];
  robotMesh.rotation.y = Math.atan2(vector.x, vector.y);
  sprayFan.visible = sim.spraying;
}

function shouldSpray() {
  if (sim.tank <= 0) return false;
  if (sim.sprayMode === 'ON') return true;
  if (sim.sprayMode === 'OFF') return false;
  return ui.modeSelect.value === 'manual' ? keys.has(' ') || keys.has('Space') : sim.running;
}

function setHeading(dx, dy) {
  sim.heading = dx > 0 ? 'E' : dx < 0 ? 'W' : dy > 0 ? 'S' : 'N';
}

function detectObstacle(x, y) {
  const key = cellKey(x, y);
  if (detected.has(key)) return;
  detected.add(key);
  addEvent('Obstáculo detectado', `Sensor bloqueó el paso hacia ${x},${y}.`);
}

function moveToward(target, dt, speed) {
  const dx = target.x + 0.5 - sim.position.x;
  const dy = target.y + 0.5 - sim.position.y;
  const distance = Math.hypot(dx, dy);
  if (distance < 0.0001) return true;
  const step = Math.min(distance, speed * dt);
  const nx = sim.position.x + dx / distance * step;
  const ny = sim.position.y + dy / distance * step;
  const currentCell = positionCell();
  const nextCell = { x: Math.floor(nx), y: Math.floor(ny) };
  if (blocked(nextCell.x, nextCell.y)) {
    detectObstacle(nextCell.x, nextCell.y);
    sim.running = false;
    sim.status = 'Obstáculo';
    return false;
  }
  if (Math.abs(dx) > Math.abs(dy)) setHeading(Math.sign(dx), 0);
  else setHeading(0, Math.sign(dy));
  sim.position.x = nx;
  sim.position.y = ny;
  sim.distance += step * cellSize / scale;
  if (currentCell.x !== nextCell.x || currentCell.y !== nextCell.y) {
    const near = sim.sensors.front <= cellSize * 2;
    if (near && blocked(nextCell.x + direction[sim.heading].x, nextCell.y + direction[sim.heading].y)) {
      const forward = cellKey(nextCell.x + direction[sim.heading].x, nextCell.y + direction[sim.heading].y);
      if (!detected.has(forward)) {
        detected.add(forward);
        addEvent('Obstáculo detectado', 'Sensor frontal anticipó una obstrucción; ruta recalculada.');
      }
    }
  }
  return distance <= step + 0.0001;
}

function manualStep(dt, speed) {
  const directions = [
    [['ArrowUp', 'w', 'W'], 0, -1], [['ArrowDown', 's', 'S'], 0, 1],
    [['ArrowLeft', 'a', 'A'], -1, 0], [['ArrowRight', 'd', 'D'], 1, 0]
  ];
  const selected = directions.find(([names]) => names.some((key) => keys.has(key)));
  if (!selected) return;
  const [, dx, dy] = selected;
  setHeading(dx, dy);
  const nextX = sim.position.x + dx * speed * dt;
  const nextY = sim.position.y + dy * speed * dt;
  const cell = { x: Math.floor(nextX), y: Math.floor(nextY) };
  if (blocked(cell.x, cell.y)) {
    detectObstacle(cell.x, cell.y);
    return;
  }
  const distance = Math.hypot(nextX - sim.position.x, nextY - sim.position.y);
  sim.position.x = nextX;
  sim.position.y = nextY;
  sim.distance += distance * cellSize / scale;
}

function tick(dt) {
  if (sim.running) {
    sim.elapsed += dt;
    sim.battery = Math.max(0, sim.battery - dt * 0.06 * Number(ui.speedSelect.value));
    if (ui.modeSelect.value === 'auto') {
      let remaining = 4 * Number(ui.speedSelect.value) * dt;
      while (remaining > 0 && sim.routeIndex < sim.route.length && sim.running) {
        const target = sim.route[sim.routeIndex];
        const before = { ...sim.position };
        const finished = moveToward(target, remaining / (4 * Number(ui.speedSelect.value)), 4 * Number(ui.speedSelect.value));
        const moved = Math.hypot(sim.position.x - before.x, sim.position.y - before.y);
        remaining -= moved;
        if (finished) {
          sim.routeIndex++;
          if (sim.routeIndex % 15 === 0) addEvent('Navegación', `Ruta ${ui.algorithmSelect.value.toUpperCase()} · celda ${target.x},${target.y}.`);
        }
        if (moved < 0.000001) break;
      }
      if (sim.running && sim.routeIndex >= sim.route.length) {
        sim.running = false;
        sim.completed = true;
        sim.status = 'Completado';
        addEvent('Misión finalizada', `Cobertura alcanzada: ${coveragePercent()}%.`);
      }
    } else {
      manualStep(dt, 3 * Number(ui.speedSelect.value));
    }
  }
  sim.spraying = shouldSpray();
  if (sim.spraying) {
    sim.spraySeconds += dt;
    sim.tank = Math.max(0, sim.tank - dt * 0.16);
    markCoverage();
  }
  updateSensors();
}

function startMission() {
  if (ui.modeSelect.value === 'auto') {
    if (!sim.route.length || sim.routeIndex >= sim.route.length) {
      sim.route = buildCoverageRoute();
      sim.routeIndex = sim.route.length > 1 ? 1 : 0;
      drawRoute();
      addEvent('Ruta generada', `${ui.algorithmSelect.value.toUpperCase()} generó ${sim.route.length} puntos de cobertura.`);
    }
    if (sim.route.length < 2) {
      toast('No se encontró una ruta de cobertura.');
      return;
    }
  }
  sim.running = true;
  sim.completed = false;
  sim.status = 'En operación';
  addEvent('Misión iniciada', `${ui.modeSelect.options[ui.modeSelect.selectedIndex].text} · ${ui.algorithmSelect.value.toUpperCase()}.`);
  updateUI();
}

function selectSceneDestination(event) {
  if (!auth.user || auth.user.role === 'observer' || ui.modeSelect.value !== 'auto') return;
  const bounds = renderer.domElement.getBoundingClientRect();
  const pointer = new THREE.Vector2((event.clientX - bounds.left) / bounds.width * 2 - 1, -((event.clientY - bounds.top) / bounds.height) * 2 + 1);
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObject(floor)[0];
  if (!hit) return;
  const x = Math.floor((hit.point.x + worldWidth / 2) * scale / cellSize);
  const y = Math.floor((hit.point.z + worldDepth / 2) * scale / cellSize);
  if (blocked(x, y)) {
    toast('Selecciona una celda libre.');
    return;
  }
  const start = positionCell();
  const route = findPath(start, { x, y });
  if (route.length < 2) {
    toast('No se encontró una ruta al destino.');
    return;
  }
  sim.route = route;
  sim.routeIndex = 1;
  sim.completed = false;
  drawRoute();
  addEvent('Destino seleccionado', `Ruta ${ui.algorithmSelect.value.toUpperCase()} hacia ${x},${y}: ${route.length} pasos.`);
  startMission();
}

ui.startBtn.addEventListener('click', startMission);
ui.pauseBtn.addEventListener('click', () => {
  sim.running = false;
  sim.spraying = false;
  sim.status = 'Pausado';
  addEvent('Misión pausada', 'Operación detenida por el usuario.');
  updateUI();
});
ui.resetBtn.addEventListener('click', () => resetSimulation(false));
ui.sprayBtn.addEventListener('click', () => {
  sim.sprayMode = sim.sprayMode === 'AUTO' ? 'OFF' : sim.sprayMode === 'OFF' ? 'ON' : 'AUTO';
  addEvent('Pulverización', `Modo cambiado a ${sim.sprayMode}.`);
  updateUI();
});
ui.scenarioSelect.addEventListener('change', () => {
  ui.scenarioSelect.blur();
  resetSimulation(true);
  addEvent('Escenario cambiado', SCENARIOS[ui.scenarioSelect.value].title);
});
ui.modeSelect.addEventListener('change', () => {
  ui.modeSelect.blur();
  sim.route = [];
  sim.routeIndex = 0;
  clearRoute();
  sim.running = false;
  sim.status = 'Listo';
  addEvent('Modo cambiado', ui.modeSelect.options[ui.modeSelect.selectedIndex].text);
  updateUI();
});
ui.algorithmSelect.addEventListener('change', () => {
  ui.algorithmSelect.blur();
  sim.route = [];
  sim.routeIndex = 0;
  clearRoute();
  addEvent('Algoritmo cambiado', ui.algorithmSelect.value.toUpperCase());
});
ui.speedSelect.addEventListener('change', () => ui.speedSelect.blur());
ui.clearLogBtn.addEventListener('click', () => {
  ui.eventLog.replaceChildren();
  events.length = 0;
});
renderer.domElement.addEventListener('click', selectSceneDestination);

document.addEventListener('keydown', (event) => {
  if (!auth.user || auth.user.role === 'observer') return;
  if (['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'Space'].includes(event.key)) event.preventDefault();
  keys.add(event.key);
  if (ui.modeSelect.value === 'manual') {
    sim.running = true;
    sim.status = 'En operación';
  }
});
document.addEventListener('keyup', (event) => keys.delete(event.key));
window.addEventListener('blur', () => keys.clear());

async function saveReport() {
  try {
    const payload = {
      scenario: ui.scenarioSelect.value, mode: ui.modeSelect.value, algorithm: ui.algorithmSelect.value,
      duration_seconds: Number(sim.elapsed.toFixed(2)), coverage_percent: coveragePercent(), obstacles_detected: detected.size,
      distance_m: Number(sim.distance.toFixed(2)), spray_seconds: Number(sim.spraySeconds.toFixed(2)),
      battery_percent: Number(sim.battery.toFixed(1)), tank_percent: Number(sim.tank.toFixed(1)),
      sensor_snapshot: { ...sim.sensors }, notes: 'Simulación 3D CleanBot'
    };
    const data = await api('/api/reports', { method: 'POST', body: JSON.stringify(payload) });
    toast(`Reporte #${data.report_id} guardado en SQLite.`);
    addEvent('Reporte guardado', `ID ${data.report_id} persistido en base de datos.`);
    loadReports();
  } catch (error) {
    toast(error.message);
  }
}
ui.saveReportBtn.addEventListener('click', saveReport);

async function loadReports() {
  try {
    const data = await api('/api/reports');
    ui.reportsTable.replaceChildren();
    for (const report of data.reports) {
      const row = document.createElement('tr');
      const values = [report.id, SCENARIOS[report.scenario]?.title || report.scenario, `${report.coverage_percent}%`, report.username, new Date(report.created_at).toLocaleString()];
      for (const value of values) {
        const cell = document.createElement('td');
        cell.textContent = value;
        row.appendChild(cell);
      }
      ui.reportsTable.appendChild(row);
    }
  } catch (error) {
    console.error(error);
  }
}

ui.downloadReportsBtn.addEventListener('click', async () => {
  try {
    const response = await fetch('/api/reports.csv', { headers: { Authorization: `Bearer ${auth.token}` } });
    if (!response.ok) throw new Error('No se pudo exportar el historial.');
    const url = URL.createObjectURL(await response.blob());
    const link = document.createElement('a');
    link.href = url;
    link.download = 'cleanbot_reportes.csv';
    link.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    toast(error.message);
  }
});

async function loadUsers() {
  try {
    const data = await api('/api/users');
    ui.usersTable.replaceChildren();
    for (const user of data.users) {
      const row = document.createElement('tr');
      for (const value of [user.id, user.full_name, user.username, roleLabel(user.role), new Date(user.created_at).toLocaleString()]) {
        const cell = document.createElement('td');
        cell.textContent = value;
        row.appendChild(cell);
      }
      ui.usersTable.appendChild(row);
    }
  } catch (error) {
    toast(error.message);
  }
}

ui.userForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  try {
    await api('/api/users', { method: 'POST', body: JSON.stringify({
      full_name: ui.newFullName.value.trim(), username: ui.newUsername.value.trim(), password: ui.newPassword.value, role: ui.newRole.value
    }) });
    ui.userForm.reset();
    toast('Usuario creado.');
    loadUsers();
  } catch (error) {
    toast(error.message);
  }
});

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
  tick(dt);
  syncRobotMesh();
  controls.update();
  renderer.render(scene, camera);
  if (timestamp - lastUiUpdate > 120) {
    updateUI();
    lastUiUpdate = timestamp;
  }
  requestAnimationFrame(loop);
}

const resizeObserver = new ResizeObserver(resizeScene);
resizeObserver.observe(ui.scene);
buildScenario();
resetSimulation(true);
resizeScene();
ui.loading.classList.add('hidden');
restoreSession();
requestAnimationFrame(loop);