import * as THREE from './node_modules/three/build/three.module.js';
import { OrbitControls } from './node_modules/three/examples/jsm/controls/OrbitControls.js';

const $ = (id) => document.getElementById(id);
const ui = {
  loginOverlay: $('loginOverlay'), loginForm: $('loginForm'), loginUser: $('loginUser'), loginPass: $('loginPass'), loginError: $('loginError'),
  userName: $('userName'), userRole: $('userRole'), logoutBtn: $('logoutBtn'), permissionBadge: $('permissionBadge'),
  scenarioSelect: $('scenarioSelect'), modeSelect: $('modeSelect'), algorithmSelect: $('algorithmSelect'), speedSelect: $('speedSelect'),
  scenarioTitle: $('scenarioTitle'), scenarioDescription: $('scenarioDescription'), assignedZone: $('assignedZone'),
  startBtn: $('startBtn'), pauseBtn: $('pauseBtn'), resetBtn: $('resetBtn'), sprayBtn: $('sprayBtn'), saveReportBtn: $('saveReportBtn'),
  cutawayBtn: $('cutawayBtn'), cutawayLegend: $('cutawayLegend'), safetyStopBtn: $('safetyStopBtn'), safetyStopBtnPanel: $('safetyStopBtnPanel'),
  sampleSelect: $('sampleSelect'), analyzeBtn: $('analyzeBtn'), confirmProtocolBtn: $('confirmProtocolBtn'), sampleResult: $('sampleResult'), protocolCode: $('protocolCode'),
  productResult: $('productResult'), doseProfile: $('doseProfile'), sampleRecordCode: $('sampleRecordCode'), retainedSamples: $('retainedSamples'),
  interlockState: $('interlockState'), safetyMessage: $('safetyMessage'), processStages: [...document.querySelectorAll('.process-flow [data-stage]')],
  missionSamples: $('missionSamples'),
  cartridgeValues: { A: $('cartridgeA'), B: $('cartridgeB'), C: $('cartridgeC') },
  cartridgeRows: [...document.querySelectorAll('.cartridge-row')],
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
const SAMPLE_EXCLUSION_RADIUS = 3;
const worldWidth = cols * cellSize / scale;
const worldDepth = rows * cellSize / scale;
const SCENARIOS = {
  hospital: {
    title: 'Hospital · Área clínica', description: 'Camillas, equipos médicos y zonas de circulación restringida.', baseTemp: 22.4, baseHumidity: 48,
    obstacles: [
      { x: 5, y: 4, w: 7, h: 4, label: 'Camilla A', type: 'bed' }, { x: 17, y: 3, w: 5, h: 5, label: 'Equipo médico', type: 'cart' },
      { x: 28, y: 5, w: 7, h: 3, label: 'Camilla B', type: 'bed' }, { x: 9, y: 14, w: 6, h: 4, label: 'Estación', type: 'cart' },
      { x: 21, y: 13, w: 5, h: 6, label: 'Gabinete', type: 'cabinet' }, { x: 30, y: 15, w: 5, h: 4, label: 'Camilla C', type: 'bed' }
    ], zones: [{ x: 1, y: 1, w: 10, h: 2 }, { x: 27, y: 10, w: 8, h: 3 }],
    samples: [{ id: 'H-01', x: 7, y: 1, type: 'organic' }, { id: 'H-02', x: 28, y: 10, type: 'unknown' }]
  },
  industry: {
    title: 'Industria · Planta de proceso', description: 'Maquinaria, tuberías y pasillos de seguridad simulados.', baseTemp: 27.8, baseHumidity: 55,
    obstacles: [
      { x: 4, y: 3, w: 7, h: 6, label: 'Máquina 1', type: 'machine' }, { x: 15, y: 4, w: 5, h: 9, label: 'Tanque', type: 'tank' },
      { x: 24, y: 2, w: 10, h: 5, label: 'Línea de proceso', type: 'machine' }, { x: 26, y: 11, w: 7, h: 7, label: 'Máquina 2', type: 'machine' },
      { x: 4, y: 16, w: 10, h: 4, label: 'Pallets', type: 'crate' }, { x: 18, y: 17, w: 5, h: 4, label: 'Bomba', type: 'machine' }
    ], zones: [{ x: 1, y: 1, w: 35, h: 2 }, { x: 32, y: 8, w: 4, h: 6 }],
    samples: [{ id: 'I-01', x: 13, y: 1, type: 'biological' }, { id: 'I-02', x: 34, y: 19, type: 'unknown' }]
  },
  warehouse: {
    title: 'Bodega · Almacenamiento', description: 'Estanterías, pallets y corredores para navegación autónoma.', baseTemp: 24.5, baseHumidity: 52,
    obstacles: [
      { x: 4, y: 3, w: 4, h: 8, label: 'Rack A', type: 'rack' }, { x: 12, y: 3, w: 4, h: 8, label: 'Rack B', type: 'rack' },
      { x: 20, y: 3, w: 4, h: 8, label: 'Rack C', type: 'rack' }, { x: 28, y: 3, w: 4, h: 8, label: 'Rack D', type: 'rack' },
      { x: 6, y: 15, w: 6, h: 5, label: 'Pallets', type: 'crate' }, { x: 17, y: 14, w: 6, h: 6, label: 'Carga', type: 'crate' },
      { x: 27, y: 15, w: 7, h: 5, label: 'Pallets', type: 'crate' }
    ], zones: [{ x: 1, y: 12, w: 35, h: 2 }],
    samples: [{ id: 'B-01', x: 7, y: 13, type: 'organic' }, { id: 'B-02', x: 34, y: 13, type: 'unknown' }]
  }
};

const DEMO_SAMPLES = {
  organic: {
    classification: 'Residuo orgánico de referencia (demo)', protocol: 'PR-DEMO-01',
    product: 'P-01 · producto aprobado (demo)', doseProfile: 'DP-DEMO-01 · perfil de ficha; sin cantidad simulada', cartridge: 'A'
  },
  biological: {
    classification: 'Indicador biológico de referencia (demo)', protocol: 'PR-DEMO-02',
    product: 'P-02 · producto aprobado (demo)', doseProfile: 'DP-DEMO-02 · perfil de ficha; sin cantidad simulada', cartridge: 'B'
  },
  unknown: {
    classification: 'Señal no identificada', protocol: null, product: null,
    doseProfile: 'No asignado · muestra retenida', cartridge: null
  }
};

const cartridgeInventory = { A: 12, B: 12, C: 12 };

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
const overviewCameraPosition = camera.position.clone();
const overviewCameraTarget = controls.target.clone();
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
  casing: new THREE.MeshStandardMaterial({ color: '#344640', roughness: 0.65, metalness: 0.22 }),
  sensor: new THREE.MeshStandardMaterial({ color: '#72c5d0', roughness: 0.24, emissive: '#10434a', emissiveIntensity: 0.5 }),
  cartridgeA: new THREE.MeshStandardMaterial({ color: '#6eaa9c', roughness: 0.4, metalness: 0.12 }),
  cartridgeB: new THREE.MeshStandardMaterial({ color: '#d4a75f', roughness: 0.4, metalness: 0.12 }),
  cartridgeC: new THREE.MeshStandardMaterial({ color: '#93aab3', roughness: 0.4, metalness: 0.12 }),
  warning: new THREE.MeshStandardMaterial({ color: '#c84f43', roughness: 0.36, emissive: '#46150f', emissiveIntensity: 0.2 }),
  processFluid: new THREE.MeshStandardMaterial({ color: '#8fcfc1', roughness: 0.24, transparent: true, opacity: 0.72 }),
  hose: new THREE.MeshStandardMaterial({ color: '#344f49', roughness: 0.5, metalness: 0.12 }),
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
const sampleSiteGroup = new THREE.Group();
const coverageGroup = new THREE.Group();
const routeGroup = new THREE.Group();
const sampleSiteVisuals = new Map();
scene.add(zoneGroup, obstacleGroup, sampleSiteGroup, coverageGroup, routeGroup);

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

function buildSampleSite(site) {
  const group = new THREE.Group();
  const center = cellCenter(site.x, site.y);
  group.position.set(center.x, 0, center.z);
  const color = site.type === 'unknown' ? '#c84f43' : '#d59436';
  const patch = new THREE.Mesh(new THREE.CircleGeometry(0.11, 24), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.65, depthWrite: false }));
  patch.rotation.x = -Math.PI / 2;
  patch.position.y = 0.018;
  group.add(patch);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.014, 8, 28), new THREE.MeshBasicMaterial({ color }));
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.028;
  group.add(ring);
  const marker = new THREE.Mesh(new THREE.OctahedronGeometry(0.07, 0), new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.2 }));
  marker.position.y = 0.12;
  group.add(marker);
  sampleSiteGroup.add(group);
  sampleSiteVisuals.set(site.id, { group, patch, ring, marker });
}

function buildScenario() {
  clearGeometries(obstacleGroup);
  clearGeometries(zoneGroup);
  clearGeometries(sampleSiteGroup);
  sampleSiteVisuals.clear();
  const scenario = SCENARIOS[ui.scenarioSelect.value];
  for (const obstacle of scenario.obstacles) buildObstacle(obstacle);
  scenario.samples.forEach(buildSampleSite);
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
  box(group, materials.dark, 0, 0.2, 0, 0.88, 0.16, 0.76);
  box(group, materials.casing, 0, 0.13, 0, 0.98, 0.09, 0.82);

  for (const x of [-0.39, 0.39]) {
    for (const z of [-0.24, 0.24]) {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.115, 0.115, 0.09, 24), materials.dark);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(x, 0.115, z);
      wheel.castShadow = true;
      group.add(wheel);
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.052, 0.096, 16), materials.steel);
      hub.rotation.z = Math.PI / 2;
      hub.position.copy(wheel.position);
      group.add(hub);
    }
  }

  const bumper = box(group, materials.casing, 0, 0.24, 0.39, 0.92, 0.17, 0.075);
  bumper.position.z = 0.39;
  box(group, materials.robotLight, 0, 0.235, 0.432, 0.26, 0.025, 0.012, false);
  for (const x of [-0.28, 0, 0.28]) {
    const sensor = new THREE.Mesh(new THREE.SphereGeometry(0.035, 14, 12), materials.sensor);
    sensor.position.set(x, 0.22, 0.44);
    group.add(sensor);
  }

  const shell = new THREE.Group();
  group.add(shell);
  box(shell, materials.robot, 0, 0.42, -0.015, 0.78, 0.31, 0.68);
  box(shell, materials.casing, 0, 0.585, 0.15, 0.36, 0.035, 0.27);
  box(shell, materials.glass, 0, 0.61, 0.15, 0.29, 0.018, 0.17, false);
  box(shell, materials.robotLight, 0, 0.612, 0.242, 0.14, 0.012, 0.018, false);
  for (const x of [-0.32, 0.32]) {
    box(shell, materials.casing, x, 0.44, 0.01, 0.045, 0.18, 0.46);
    for (const z of [-0.16, 0, 0.16]) {
      const fastener = new THREE.Mesh(new THREE.SphereGeometry(0.018, 10, 8), materials.steel);
      fastener.position.set(x * 1.08, 0.45, z);
      shell.add(fastener);
    }
  }

  const stopBase = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.035, 20), materials.white);
  stopBase.position.set(0.25, 0.61, -0.04);
  group.add(stopBase);
  const stopButton = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.055, 20), materials.warning);
  stopButton.position.set(0.25, 0.652, -0.04);
  group.add(stopButton);

  const lidarBase = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.09, 24), materials.casing);
  lidarBase.position.set(-0.2, 0.61, 0.12);
  group.add(lidarBase);
  const lidar = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.07, 24), materials.dark);
  lidar.position.set(-0.2, 0.68, 0.12);
  group.add(lidar);
  const lidarRing = new THREE.Mesh(new THREE.TorusGeometry(0.078, 0.012, 8, 28), materials.sensor);
  lidarRing.rotation.x = Math.PI / 2;
  lidarRing.position.set(-0.2, 0.72, 0.12);
  group.add(lidarRing);
  const cameraHousing = box(group, materials.dark, 0, 0.54, 0.37, 0.15, 0.08, 0.06);
  const cameraLens = new THREE.Mesh(new THREE.SphereGeometry(0.026, 14, 12), materials.sensor);
  cameraLens.position.set(0, 0.55, 0.405);
  group.add(cameraLens);
  cameraHousing.castShadow = true;
  box(group, materials.dark, 0, 0.075, 0.28, 0.2, 0.075, 0.16);
  const floorSensor = new THREE.Mesh(new THREE.SphereGeometry(0.035, 14, 12), materials.sensor);
  floorSensor.position.set(0, 0.035, 0.32);
  group.add(floorSensor);

  const internals = new THREE.Group();
  group.add(internals);
  const cartridgeColors = [materials.cartridgeA, materials.cartridgeB, materials.cartridgeC];
  const cartridgePositions = [-0.22, 0, 0.22];
  const flowCurves = [];
  const flowParticles = [];
  cartridgePositions.forEach((x, index) => {
    box(internals, materials.casing, x, 0.65, -0.22, 0.17, 0.29, 0.22);
    box(internals, cartridgeColors[index], x, 0.65, -0.22, 0.125, 0.24, 0.18);
    box(internals, materials.white, x, 0.785, -0.22, 0.07, 0.035, 0.07);
    box(internals, materials.dark, x, 0.65, -0.124, 0.075, 0.035, 0.012, false);
    const fill = box(internals, materials.robotLight, x, 0.61, -0.115, 0.055, 0.012, 0.014, false);
    fill.userData.cartridge = String.fromCharCode(65 + index);
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(x, 0.58, -0.12), new THREE.Vector3(x, 0.48, 0.01),
      new THREE.Vector3(x * 0.5, 0.49, 0.11), new THREE.Vector3(0, 0.52, 0.1)
    ]);
    const hose = new THREE.Mesh(new THREE.TubeGeometry(curve, 18, 0.012, 8, false), materials.hose);
    internals.add(hose);
    flowCurves.push(curve);
    const particle = new THREE.Mesh(new THREE.SphereGeometry(0.022, 10, 8), materials.robotLight);
    particle.visible = false;
    internals.add(particle);
    flowParticles.push(particle);
  });

  box(internals, materials.casing, 0, 0.49, 0.015, 0.31, 0.2, 0.28);
  const chamber = new THREE.Mesh(new THREE.CylinderGeometry(0.115, 0.115, 0.28, 24), new THREE.MeshStandardMaterial({ color: '#a9d2c9', roughness: 0.22, transparent: true, opacity: 0.38, metalness: 0.18 }));
  chamber.position.set(0, 0.66, 0.02);
  internals.add(chamber);
  const fluid = new THREE.Mesh(new THREE.CylinderGeometry(0.086, 0.086, 0.11, 20), materials.processFluid);
  fluid.position.set(0, 0.605, 0.02);
  internals.add(fluid);
  const mixerRotor = new THREE.Group();
  mixerRotor.position.set(0, 0.67, 0.02);
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.2, 10), materials.steel);
  mixerRotor.add(shaft);
  box(mixerRotor, materials.steel, 0, 0, 0, 0.19, 0.025, 0.035);
  box(mixerRotor, materials.steel, 0, -0.045, 0, 0.12, 0.025, 0.035).rotation.y = Math.PI / 3;
  internals.add(mixerRotor);
  const pump = box(internals, materials.dark, 0.25, 0.48, 0.04, 0.12, 0.12, 0.16);
  pump.rotation.y = -0.2;
  box(internals, materials.steel, 0.25, 0.55, 0.04, 0.075, 0.025, 0.075);
  const sampleCapsule = new THREE.Group();
  sampleCapsule.position.set(0.25, 0.49, 0.22);
  const sampleTube = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.17, 18, 1, true), new THREE.MeshStandardMaterial({ color: '#a8d8d2', roughness: 0.18, transparent: true, opacity: 0.5, metalness: 0.16, side: THREE.DoubleSide }));
  sampleCapsule.add(sampleTube);
  const sampleCore = new THREE.Mesh(new THREE.SphereGeometry(0.027, 14, 10), materials.coral);
  sampleCore.position.y = -0.035;
  sampleCapsule.add(sampleCore);
  const sampleCap = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.035, 18), materials.warning);
  sampleCap.position.y = 0.095;
  sampleCapsule.add(sampleCap);
  const sampleBase = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.025, 18), materials.white);
  sampleBase.position.y = -0.095;
  sampleCapsule.add(sampleBase);
  sampleCapsule.visible = false;
  internals.add(sampleCapsule);

  const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.16, 12), materials.steel);
  nozzle.position.set(0, 0.22, -0.42);
  group.add(nozzle);
  const sprayFan = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.55, 20, 1, true), new THREE.MeshBasicMaterial({ color: '#91d6c2', transparent: true, opacity: 0.31, side: THREE.DoubleSide, depthWrite: false }));
  sprayFan.rotation.x = -Math.PI / 2;
  sprayFan.position.set(0, 0.18, -0.58);
  sprayFan.visible = false;
  group.add(sprayFan);
  internals.visible = false;
  return { group, sprayFan, shell, internals, mixerRotor, flowCurves, flowParticles, sampleCapsule };
}

const robotModel = buildRobot();
const { group: robotMesh, sprayFan } = robotModel;
const coverageGeometry = new THREE.PlaneGeometry(cellSize / scale - 0.025, cellSize / scale - 0.025);
const auth = { token: localStorage.getItem('cleanbot_token') || '', user: null };
const keys = new Set();
const visited = new Set();
const detected = new Set();
const events = [];
const sim = {
  position: { x: 1.5, y: 1.5 }, heading: 'E', route: [], routeIndex: 0, routePurpose: 'coverage', running: false, completed: false,
  status: 'Listo', elapsed: 0, distance: 0, spraySeconds: 0, battery: 100, tank: 100, sprayMode: 'AUTO', spraying: false,
  sensors: { front: 0, left: 0, right: 0, temp: 0, humidity: 0, voc: 0 }
};
const protocolState = {
  phase: 'idle', remaining: 0, sample: null, match: null, site: null, resumeAfterProtocol: false, autoSample: false, treatmentReturn: false,
  recordedSample: null, recordPending: false, recordError: '', stopLatched: false, stopReason: ''
};
const handledSampleSites = new Set();
const sampleExclusions = new Map();
const missionSamples = [];
const direction = { N: { x: 0, y: -1 }, E: { x: 1, y: 0 }, S: { x: 0, y: 1 }, W: { x: -1, y: 0 } };
const sampleMarker = new THREE.Group();
const samplePatch = new THREE.Mesh(new THREE.CircleGeometry(0.13, 28), new THREE.MeshBasicMaterial({ color: '#d58c54', transparent: true, opacity: 0.68, depthWrite: false }));
samplePatch.rotation.x = -Math.PI / 2;
samplePatch.position.y = 0.012;
sampleMarker.add(samplePatch);
const sampleRing = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.012, 8, 32), new THREE.MeshBasicMaterial({ color: '#d58c54', transparent: true, opacity: 0.9 }));
sampleRing.rotation.x = Math.PI / 2;
sampleRing.position.y = 0.025;
sampleMarker.add(sampleRing);
sampleMarker.visible = false;
scene.add(sampleMarker);
let lastFrame = 0;
let lastUiUpdate = 0;
let protocolTimer = null;

function showSampleMarker() {
  if (protocolState.site) {
    sampleMarker.position.set(worldX(protocolState.site.x + 0.5), 0, worldZ(protocolState.site.y + 0.5));
  } else {
    const heading = direction[sim.heading];
    sampleMarker.position.set(worldX(sim.position.x + heading.x * 0.55), 0, worldZ(sim.position.y + heading.y * 0.55));
  }
  sampleMarker.visible = true;
  const color = protocolState.sample === 'unknown' ? '#c84f43' : '#d58c54';
  samplePatch.material.color.set(color);
  sampleRing.material.color.set(color);
}

function updateRobotProcess(dt) {
  const preparing = protocolState.phase === 'preparing';
  robotModel.sampleCapsule.visible = protocolState.sample === 'unknown' && (protocolState.phase === 'isolated' || protocolState.recordPending || Boolean(protocolState.recordedSample));
  robotModel.mixerRotor.rotation.y += dt * (preparing ? 9 : 0.25);
  const time = performance.now() / 1000;
  robotModel.flowParticles.forEach((particle, index) => {
    particle.visible = preparing;
    if (preparing) particle.position.copy(robotModel.flowCurves[index].getPoint((time * 0.38 + index * 0.23) % 1));
  });
  if (sampleMarker.visible) sampleRing.scale.setScalar(1 + Math.sin(time * 3) * 0.06);
}

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
  [ui.startBtn, ui.pauseBtn, ui.resetBtn, ui.sprayBtn, ui.saveReportBtn, ui.safetyStopBtn, ui.safetyStopBtnPanel, ui.analyzeBtn, ui.confirmProtocolBtn].forEach((button) => { button.disabled = observer; });
  [ui.scenarioSelect, ui.modeSelect, ui.algorithmSelect, ui.speedSelect].forEach((select) => { select.disabled = observer; });
  ui.sampleSelect.disabled = observer;
  ui.adminPanel.classList.toggle('hidden', auth.user.role !== 'admin');
  resetSimulation(true);
  loadReports();
  loadRetainedSamples();
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
   return blockedByObstacle(x, y) || isExcludedSampleCell(x, y);
}

function blockedByObstacle(x, y) {
   return SCENARIOS[ui.scenarioSelect.value].obstacles.some((item) => x >= item.x && x < item.x + item.w && y >= item.y && y < item.y + item.h);
}

function isExcludedSampleCell(x, y) {
   return [...sampleExclusions.entries()].some(([siteId, zone]) => {
     const activeTreatment = protocolState.phase === 'applying'
       && protocolState.treatmentReturn
       && protocolState.activeMissionSample?.site.id === siteId;
     return !activeTreatment && Math.abs(x - zone.x) + Math.abs(y - zone.y) <= zone.radius;
   });
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

function markSampleAreaTreated(item) {
  const zone = sampleExclusions.get(item.site.id);
  if (!zone) return;
  for (let y = Math.max(0, zone.y - zone.radius); y <= Math.min(rows - 1, zone.y + zone.radius); y++) {
    for (let x = Math.max(0, zone.x - zone.radius); x <= Math.min(cols - 1, zone.x + zone.radius); x++) {
      if (Math.abs(x - zone.x) + Math.abs(y - zone.y) > zone.radius || blockedByObstacle(x, y)) continue;
      const key = cellKey(x, y);
      if (visited.has(key)) continue;
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

function markCoverage() {
  if (!sim.spraying || sim.tank <= 0) return;
  const cell = positionCell();
  for (let oy = -2; oy <= 2; oy++) {
    for (let ox = -2; ox <= 2; ox++) {
      if (ox * ox + oy * oy > 5) continue;
      const x = cell.x + ox;
      const y = cell.y + oy;
      const key = cellKey(x, y);
      if (blockedByObstacle(x, y) || isExcludedSampleCell(x, y) || visited.has(key)) continue;
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

function renderMissionSamples() {
  ui.missionSamples.replaceChildren();
  if (!missionSamples.length) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 3;
    cell.textContent = 'Sin muestras pendientes.';
    row.appendChild(cell);
    ui.missionSamples.appendChild(row);
    return;
  }
  for (const item of missionSamples) {
    const row = document.createElement('tr');
    const action = item.sampleType === 'unknown'
      ? `Retenida · ${item.sampleCode || 'laboratorio pendiente'}`
      : item.status === 'treated' ? 'Atendida al final' : 'Pendiente para el regreso';
    for (const value of [item.site.id, item.match?.classification || 'Señal no identificada', action]) {
      const cell = document.createElement('td');
      cell.textContent = value;
      row.appendChild(cell);
    }
    ui.missionSamples.appendChild(row);
  }
}

function updateProtocolUI() {
  const stageStatus = {
    scanning: { complete: [], active: 0 },
    pending: { complete: [0, 1], active: 2 },
    preparing: { complete: [0, 1, 2], active: 3 },
    applying: { complete: [0, 1, 2, 3], active: 4 },
    complete: { complete: [0, 1, 2, 3, 4], active: -1 },
    queuedKnown: { complete: [0, 1, 2], active: -1 },
    queuedUnknown: { complete: [0], active: 1 },
    returnReady: { complete: [0, 1, 2], active: 3 },
    returning: { complete: [0, 1, 2], active: 3 },
    pendingTreatment: { complete: [0, 1, 2], active: 4 },
    unknownComplete: { complete: [0, 1], active: -1 },
    isolated: { complete: [], active: -1 }
  }[protocolState.phase] || { complete: [], active: -1 };

  ui.processStages.forEach((stage, index) => {
    stage.classList.toggle('done', stageStatus.complete.includes(index));
    stage.classList.toggle('active', stageStatus.active === index);
    stage.classList.toggle('blocked', protocolState.phase === 'isolated' && index >= 2);
  });

  const siteLabel = protocolState.site ? `${protocolState.site.id} · (${protocolState.site.x}, ${protocolState.site.y})` : 'Prueba manual';
  const sampleCode = protocolState.recordedSample?.sample_code || (protocolState.recordPending ? 'Guardando custodia...' : protocolState.recordError ? 'No guardada · revisar conexión' : protocolState.sample === 'unknown' && protocolState.phase === 'isolated' ? 'Pendiente de registro' : siteLabel);
  const match = protocolState.match || DEMO_SAMPLES[protocolState.sample];
  const copy = {
    idle: ['Sin muestra analizada', 'Sin asignar', 'Sin asignar', 'Sin asignar', 'Sin muestra retenida', 'En espera', 'Lecturas y productos son de demostración; no se identifican sustancias reales.'],
    scanning: ['Analizando referencia...', 'Buscando coincidencia', 'Verificando catálogo', 'Consultando perfil aprobado', sampleCode, 'Lectura en curso', 'Cribado conceptual. No equivale a identificación química real.'],
    pending: [match?.classification || 'Referencia compatible', match?.protocol || 'Sin asignar', match?.product || 'Sin producto compatible', match?.doseProfile || 'Sin perfil aprobado', sampleCode, 'Pendiente de confirmación', 'Coincidencia de catálogo demo. La dosificación real debe provenir de la ficha aprobada del producto exacto.'],
    preparing: [match?.classification || 'Referencia compatible', match?.protocol || 'Sin asignar', match?.product || 'Sin producto compatible', match?.doseProfile || 'Sin perfil aprobado', sampleCode, 'Cámara cerrada · enclavada', 'Preparación visual. La demo no calcula cantidades ni muestra una receta.'],
    applying: [match?.classification || 'Referencia compatible', match?.protocol || 'Sin asignar', match?.product || 'Sin producto compatible', match?.doseProfile || 'Sin perfil aprobado', sampleCode, 'Aplicación localizada demo', 'Aplicación visual en zona marcada; no representa una recomendación de uso real.'],
    complete: [match?.classification || 'Referencia compatible', match?.protocol || 'Sin asignar', match?.product || 'Sin producto compatible', match?.doseProfile || 'Sin perfil aprobado', sampleCode, 'Ciclo demo completado', 'Cartucho descontado solo del inventario de esta simulación.'],
    queuedKnown: [match?.classification || 'Referencia compatible', match?.protocol || 'Sin asignar', match?.product || 'Sin producto compatible', match?.doseProfile || 'Sin perfil aprobado', siteLabel, 'Muestra sellada · ruta continúa', 'Zona excluida de cobertura. El producto se aplicará solo al finalizar el recorrido y tras confirmación.'],
    queuedUnknown: ['Señal no identificada', 'Sin protocolo autorizado', 'Ninguno · sin aplicación', 'No asignado · requiere laboratorio', sampleCode, 'Muestra retenida · ruta continúa', 'Se conserva la zona excluida y el robot termina el resto de la misión sin intentar combatir esta señal.'],
    returnReady: [match?.classification || 'Referencia compatible', match?.protocol || 'Sin asignar', match?.product || 'Sin producto compatible', match?.doseProfile || 'Sin perfil aprobado', siteLabel, 'Cobertura completa · regreso pendiente', 'La misión principal terminó. Confirma para volver al punto y aplicar el perfil aprobado.'],
    returning: [match?.classification || 'Referencia compatible', match?.protocol || 'Sin asignar', match?.product || 'Sin producto compatible', match?.doseProfile || 'Sin perfil aprobado', siteLabel, 'Regreso al punto pendiente', 'La ruta principal terminó; el robot vuelve ahora a la muestra conocida.'],
    pendingTreatment: [match?.classification || 'Referencia compatible', match?.protocol || 'Sin asignar', match?.product || 'Sin producto compatible', match?.doseProfile || 'Sin perfil aprobado', siteLabel, 'Punto alcanzado · confirmar tratamiento', 'Confirma para simular la aplicación localizada con el perfil del catálogo.'],
    unknownComplete: ['Muestra no identificada retenida', 'Sin protocolo autorizado', 'Ninguno · sin aplicación', 'No asignado · requiere laboratorio', sampleCode, 'Misión terminada · revisión requerida', 'La zona queda excluida y no hay regreso automático. Requiere análisis y decisión humana antes de otra tarea.'],
    isolated: [
      protocolState.sample === 'unknown' ? 'Señal no identificada' : match?.classification || 'Paro seguro activado',
      match?.protocol || 'Sin protocolo autorizado', match?.product || 'Ninguno · sin aplicación',
      match?.doseProfile || 'No asignado · sin dosificación', sampleCode, 'BLOQUEADO · PARO SEGURO',
      `${protocolState.stopReason} La ruta y la salida están inhibidas; no se prepara ni aplica producto. ${protocolState.recordError || ''}`
    ]
  }[protocolState.phase];

  ui.sampleResult.textContent = copy[0];
  ui.protocolCode.textContent = copy[1];
  ui.productResult.textContent = copy[2];
  ui.doseProfile.textContent = copy[3];
  ui.sampleRecordCode.textContent = copy[4];
  ui.interlockState.textContent = copy[5];
  ui.safetyMessage.textContent = copy[6];
  ui.confirmProtocolBtn.disabled = !['pending', 'returnReady', 'pendingTreatment'].includes(protocolState.phase) || protocolState.stopLatched || auth.user?.role === 'observer';
  ui.confirmProtocolBtn.innerHTML = protocolState.phase === 'returnReady'
    ? '<span aria-hidden="true">↩</span> Regresar a muestras conocidas'
    : protocolState.phase === 'pendingTreatment'
      ? '<span aria-hidden="true">✓</span> Confirmar tratamiento aprobado'
      : '<span aria-hidden="true">✓</span> Confirmar protocolo';
  ui.analyzeBtn.disabled = ['scanning', 'pending', 'preparing', 'applying', 'queuedKnown', 'queuedUnknown', 'returnReady', 'returning', 'pendingTreatment', 'unknownComplete'].includes(protocolState.phase) || protocolState.stopLatched || auth.user?.role === 'observer';
  ui.sampleSelect.disabled = ['scanning', 'pending', 'preparing', 'applying', 'queuedKnown', 'queuedUnknown', 'returnReady', 'returning', 'pendingTreatment', 'unknownComplete'].includes(protocolState.phase) || auth.user?.role === 'observer';
  renderMissionSamples();
  ui.cartridgeRows.forEach((row) => {
    const id = row.dataset.cartridge;
    const available = cartridgeInventory[id];
    const selected = protocolState.match?.cartridge === id;
    row.classList.toggle('selected', selected);
    row.classList.toggle('empty', available <= 0);
    ui.cartridgeValues[id].textContent = `${available} / 12`;
    row.querySelector('em').textContent = available <= 0 ? 'Agotado' : selected ? 'Seleccionado' : id === 'C' ? 'En reserva' : 'Disponible';
  });
  ui.cutawayBtn.textContent = robotModel.internals.visible ? 'Ocultar módulos internos' : 'Ver módulos internos';
  ui.cutawayBtn.setAttribute('aria-pressed', String(robotModel.internals.visible));
  ui.cutawayLegend.classList.toggle('hidden', !robotModel.internals.visible);
}

function startSampleScreening(sampleType, site = null, resumeMission = false) {
  if (!auth.user || auth.user.role === 'observer') return;
  if (protocolState.stopLatched) {
    toast('Paro seguro activo. Reinicia y verifica el área antes de otra prueba.');
    return;
  }
  protocolState.autoSample = Boolean(site && resumeMission);
  sim.running = false;
  sim.spraying = false;
  if (!protocolState.autoSample) sim.sprayMode = 'OFF';
  protocolState.sample = sampleType;
  protocolState.match = null;
  protocolState.site = site;
  protocolState.resumeAfterProtocol = resumeMission;
  protocolState.recordedSample = null;
  protocolState.recordPending = false;
  protocolState.recordError = '';
  protocolState.phase = 'scanning';
  protocolState.remaining = 1.35;
  protocolState.stopReason = '';
  showSampleMarker();
  sim.status = 'Analizando muestra';
  addEvent(site ? 'Muestra detectada en recorrido' : 'Cribado manual simulado', `${site?.id || 'Prueba manual'} · lectura conceptual; no es identificación química real.`);
  updateProtocolUI();
  updateUI();
  clearTimeout(protocolTimer);
  protocolTimer = setTimeout(finishScreening, 1350);
}

function analyzeSample() {
  startSampleScreening(ui.sampleSelect.value);
}

function detectSampleAt(x, y) {
  const site = SCENARIOS[ui.scenarioSelect.value].samples.find((sample) =>
    !handledSampleSites.has(sample.id)
    && Math.abs(sample.x - x) + Math.abs(sample.y - y) <= SAMPLE_EXCLUSION_RADIUS + 1
  );
  if (!site) return false;
  handledSampleSites.add(site.id);
  sampleExclusions.set(site.id, { x: site.x, y: site.y, radius: SAMPLE_EXCLUSION_RADIUS });
  const visual = sampleSiteVisuals.get(site.id);
  if (visual) {
    const color = site.type === 'unknown' ? '#c84f43' : '#4d9b79';
    visual.patch.material.color.set(color);
    visual.ring.material.color.set(color);
    visual.marker.material.color.set(color);
    visual.marker.material.emissive.set(color);
  }
  startSampleScreening(site.type, site, ui.modeSelect.value === 'auto');
  return true;
}

function resumeCoverageAfterSample() {
  if (!protocolState.autoSample || protocolState.stopLatched) return;
  sim.route = buildCoverageRoute();
  sim.routePurpose = 'coverage';
  sim.routeIndex = sim.route.length > 1 ? 1 : 0;
  drawRoute();
  sim.completed = false;
  sim.running = sim.route.length > 1;
  sim.status = sim.running ? 'En operación' : 'Cobertura terminada';
  protocolState.autoSample = false;
  if (sim.running) addEvent('Cobertura reanudada', 'Área de muestra excluida; continúa por el resto del escenario.');
  else isolateProtocol('No hay ruta de cobertura válida alrededor de la zona de muestra; la cobertura no se declara completa.');
  updateUI();
}

function completeCoverageMission() {
  sim.running = false;
  sim.completed = true;
  sim.sprayMode = 'OFF';
  const pendingKnown = missionSamples.find((item) => item.sampleType !== 'unknown' && item.status === 'pending');
  if (pendingKnown) {
    protocolState.activeMissionSample = pendingKnown;
    protocolState.site = pendingKnown.site;
    protocolState.sample = pendingKnown.sampleType;
    protocolState.match = pendingKnown.match;
    protocolState.phase = 'returnReady';
    protocolState.stopLatched = false;
    sim.completed = false;
    sim.status = 'Cobertura completa · regreso pendiente';
    addEvent('Cobertura completa', `${missionSamples.filter((item) => item.status === 'pending').length} muestra(s) conocidas esperan confirmación de regreso.`);
    updateUI();
    return;
  }

  const unknownSamples = missionSamples.filter((item) => item.sampleType === 'unknown');
  if (unknownSamples.length) {
    const lastUnknown = unknownSamples.at(-1);
    protocolState.activeMissionSample = null;
    protocolState.site = lastUnknown.site;
    protocolState.sample = 'unknown';
    protocolState.match = DEMO_SAMPLES.unknown;
    protocolState.phase = 'unknownComplete';
    protocolState.stopLatched = true;
    protocolState.stopReason = 'Cobertura finalizada; las muestras desconocidas requieren revisión de laboratorio.';
    sim.status = 'Misión finalizada · revisión requerida';
    sim.sprayMode = 'OFF';
    sim.spraying = false;
    addEvent('Misión finalizada con muestras retenidas', `${unknownSamples.length} muestra(s) pendientes de laboratorio; no se regresa a esas zonas.`);
    updateUI();
    return;
  }

  protocolState.phase = 'complete';
  sim.status = 'Completado';
  addEvent('Misión finalizada', `Cobertura alcanzada: ${coveragePercent()}%.`);
  updateUI();
}

function startReturnToMissionSample() {
  const item = protocolState.activeMissionSample;
  if (!item || item.sampleType === 'unknown' || item.status !== 'pending') {
    completeCoverageMission();
    return;
  }
  const candidates = [];
  for (let y = Math.max(0, item.site.y - 5); y <= Math.min(rows - 1, item.site.y + 5); y++) {
    for (let x = Math.max(0, item.site.x - 5); x <= Math.min(cols - 1, item.site.x + 5); x++) {
      if (Math.abs(x - item.site.x) + Math.abs(y - item.site.y) !== 4 || blocked(x, y)) continue;
      const path = findPath(positionCell(), { x, y });
      if (path.length) candidates.push(path);
    }
  }
  candidates.sort((left, right) => left.length - right.length);
  if (!candidates.length) {
    isolateProtocol('No se encontró acceso seguro a la muestra; área sigue excluida y requiere intervención humana.');
    return;
  }
  protocolState.phase = 'returning';
  protocolState.treatmentReturn = false;
  sim.sprayMode = 'OFF';
  sim.route = candidates[0];
  sim.routePurpose = 'sample-return';
  sim.routeIndex = sim.route.length > 1 ? 1 : sim.route.length;
  sim.completed = false;
  sim.running = sim.routeIndex < sim.route.length;
  sim.status = 'Regresando a muestra aprobada';
  drawRoute();
  addEvent('Regreso a muestra aprobado', `${item.site.id} · área aislada; recorrido sin pulverización.`);
  if (!sim.running) {
    protocolState.phase = 'pendingTreatment';
    sim.status = 'Punto de muestra · confirmar tratamiento';
  }
  updateUI();
}

function queueMissionSample(match) {
  if (!protocolState.site || missionSamples.some((item) => item.site.id === protocolState.site.id)) return;
  const item = {
    site: protocolState.site,
    sampleType: protocolState.sample,
    match,
    status: protocolState.sample === 'unknown' ? 'lab' : 'pending',
    sampleCode: null
  };
  missionSamples.push(item);
  renderMissionSamples();
  return item;
}

function isolateProtocol(reason, recordUnknown = true) {
  clearTimeout(protocolTimer);
  protocolTimer = null;
  sim.running = false;
  sim.spraying = false;
  sim.sprayMode = 'OFF';
  sim.status = 'Aislamiento';
  protocolState.stopLatched = true;
  protocolState.phase = 'isolated';
  protocolState.remaining = 0;
  protocolState.stopReason = reason;
  keys.clear();
  addEvent('Interbloqueo de seguridad', reason);
  updateProtocolUI();
  updateUI();
  if (recordUnknown && protocolState.sample === 'unknown' && !protocolState.recordedSample && !protocolState.recordPending) {
    protocolState.recordPending = true;
    updateProtocolUI();
    retainUnknownSample();
  }
}

function confirmProtocol() {
  if (protocolState.stopLatched || auth.user?.role === 'observer') return;
  if (protocolState.phase === 'returnReady') {
    startReturnToMissionSample();
    return;
  }
  if (protocolState.phase === 'pendingTreatment') {
    protocolState.treatmentReturn = true;
    protocolState.phase = 'preparing';
    protocolState.remaining = 2.8;
    sim.status = 'Preparación cerrada demo';
    addEvent('Tratamiento final confirmado', `${protocolState.match.protocol} · ${protocolState.activeMissionSample.site.id} · aplicación localizada después de la cobertura.`);
    updateUI();
    clearTimeout(protocolTimer);
    protocolTimer = setTimeout(beginApplication, 2800);
    return;
  }
  if (protocolState.phase !== 'pending') return;
  const available = cartridgeInventory[protocolState.match.cartridge];
  if (available <= 0) {
    isolateProtocol('Cartucho demo agotado: movimiento de proceso y dosificación bloqueados.');
    return;
  }
  sim.running = false;
  sim.spraying = false;
  protocolState.phase = 'preparing';
  protocolState.remaining = 2.8;
  sim.status = 'Preparación cerrada demo';
  addEvent('Protocolo confirmado', `${protocolState.match.protocol} · confirmación de operador · cámara cerrada.`);
  updateProtocolUI();
  updateUI();
  clearTimeout(protocolTimer);
  protocolTimer = setTimeout(beginApplication, 2800);
}

function emergencyStop(reason = 'Paro seguro activado por el operador; salidas simuladas inhibidas.') {
  if (!auth.user || auth.user.role === 'observer' || protocolState.stopLatched) return;
  isolateProtocol(reason);
  toast('Paro seguro enclavado. Reinicia la misión tras verificar el área.');
}

function finishScreening() {
  protocolTimer = null;
  if (protocolState.phase !== 'scanning' || protocolState.stopLatched) return;
  const match = DEMO_SAMPLES[protocolState.sample];
  if (protocolState.autoSample) {
    protocolState.match = match || DEMO_SAMPLES.unknown;
    const item = queueMissionSample(protocolState.match);
    if (!match?.protocol) {
      protocolState.phase = 'queuedUnknown';
      protocolState.recordPending = true;
      sim.status = 'Guardando muestra · área excluida';
      addEvent('Zona excluida', `${protocolState.site.id} · sin aplicación durante esta misión.`);
      updateUI();
      retainUnknownSample(item).then((sample) => {
        if (!sample) {
          isolateProtocol('No se pudo confirmar la custodia; el robot queda detenido en seguro.', false);
          return;
        }
        item.sampleCode = sample.sample_code;
        renderMissionSamples();
        protocolState.recordedSample = sample;
        protocolState.recordPending = false;
        sim.status = 'Muestra retenida · cobertura continúa';
        addEvent('Cobertura reanudada', 'Muestra guardada para laboratorio; la zona permanece excluida.');
        resumeCoverageAfterSample();
      });
      return;
    }
    protocolState.activeMissionSample = item;
    protocolState.phase = 'queuedKnown';
    sim.status = 'Muestra sellada · cobertura continúa';
    addEvent('Zona excluida', `${protocolState.site.id} · ${match.product} reservado para después de la cobertura.`);
    addEvent('Protocolo aprobado en cola', `${match.protocol} · retorno al punto al completar la cobertura.`);
    updateUI();
    resumeCoverageAfterSample();
    return;
  }
  if (!match?.protocol) {
    protocolState.match = match || DEMO_SAMPLES.unknown;
    isolateProtocol('Señal no identificada: ruta detenida, cámara cerrada y salida de aplicación bloqueada.');
    return;
  }
  if (cartridgeInventory[match.cartridge] <= 0) {
    protocolState.match = match;
    isolateProtocol('No hay cartucho demo compatible disponible; se requiere intervención humana.');
    return;
  }
  protocolState.match = match;
  protocolState.phase = 'pending';
  protocolState.remaining = 0;
  sim.status = 'Protocolo pendiente';
  addEvent('Coincidencia de catálogo demo', `${match.protocol} · requiere confirmación del operador.`);
  updateProtocolUI();
  updateUI();
}

function beginApplication() {
  protocolTimer = null;
  if (protocolState.phase !== 'preparing' || protocolState.stopLatched) return;
  protocolState.phase = 'applying';
  protocolState.remaining = 2.1;
  cartridgeInventory[protocolState.match.cartridge] -= 1;
  sim.spraying = true;
  sim.status = 'Aplicación localizada demo';
  addEvent('Cámara cerrada', protocolState.treatmentReturn
    ? `Secuencia demo completada en ${protocolState.activeMissionSample.site.id}; inicia aplicación localizada.`
    : 'Secuencia conceptual completada; inicia aplicación visual delimitada.');
  updateProtocolUI();
  updateUI();
  protocolTimer = setTimeout(finishApplication, 2100);
}

function finishApplication() {
  protocolTimer = null;
  if (protocolState.phase !== 'applying' || protocolState.stopLatched) return;
  protocolState.phase = 'complete';
  protocolState.remaining = 0;
  sim.spraying = false;
  addEvent('Aplicación demo finalizada', 'No representa descontaminación verificada ni validación de producto.');
  if (protocolState.treatmentReturn) {
    const item = protocolState.activeMissionSample;
    if (item) {
      item.status = 'treated';
      markSampleAreaTreated(item);
      sampleExclusions.delete(item.site.id);
      addEvent('Zona atendida al cierre', `${item.site.id} · el área deja de estar excluida de la siguiente misión.`);
    }
    protocolState.treatmentReturn = false;
    sim.sprayMode = 'OFF';
    sim.running = false;
    const nextKnown = missionSamples.find((sample) => sample.sampleType !== 'unknown' && sample.status === 'pending');
    if (nextKnown) {
      protocolState.activeMissionSample = nextKnown;
      protocolState.site = nextKnown.site;
      protocolState.sample = nextKnown.sampleType;
      protocolState.match = nextKnown.match;
      protocolState.phase = 'returnReady';
      sim.status = 'Siguiente muestra aprobada · confirmar regreso';
    } else {
      completeCoverageMission();
      return;
    }
    updateUI();
    return;
  }
  sim.status = 'Protocolo demo completado';
  const resumeMission = protocolState.resumeAfterProtocol;
  protocolState.resumeAfterProtocol = false;
  if (resumeMission) {
    sim.running = true;
    sim.status = 'En operación';
    addEvent('Ruta reanudada', 'Muestra atendida según el protocolo demo; continúa el recorrido de cobertura.');
  }
  updateProtocolUI();
  updateUI();
}

function resetSimulation(silent = false) {
  clearTimeout(protocolTimer);
  protocolTimer = null;
  sim.position = { x: 1.5, y: 1.5 };
  sim.heading = 'E';
  sim.route = [];
  sim.routeIndex = 0;
  sim.routePurpose = 'coverage';
  sim.running = false;
  sim.completed = false;
  sim.status = 'Listo';
  sim.elapsed = 0;
  sim.distance = 0;
  sim.spraySeconds = 0;
  sim.battery = 100;
  sim.tank = 100;
  sim.spraying = false;
  sim.sprayMode = 'AUTO';
  protocolState.phase = 'idle';
  protocolState.remaining = 0;
  protocolState.sample = null;
  protocolState.match = null;
  protocolState.site = null;
  protocolState.resumeAfterProtocol = false;
  protocolState.autoSample = false;
  protocolState.treatmentReturn = false;
  protocolState.activeMissionSample = null;
  protocolState.recordedSample = null;
  protocolState.recordPending = false;
  protocolState.recordError = '';
  protocolState.stopLatched = false;
  protocolState.stopReason = '';
  handledSampleSites.clear();
  sampleExclusions.clear();
  missionSamples.length = 0;
  detected.clear();
  events.length = 0;
  ui.eventLog.replaceChildren();
  clearCoverage();
  sampleMarker.visible = false;
  buildScenario();
  clearRoute();
  updateSensors();
  syncRobotMesh();
  updateRobotProcess(0);
  updateProtocolUI();
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
  ui.status.textContent = sim.running ? 'En operación' : sim.completed && protocolState.phase !== 'unknownComplete' ? 'Completado' : sim.status;
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
  updateProtocolUI();
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
  if (protocolState.stopLatched || ['scanning', 'pending', 'preparing', 'isolated', 'returnReady', 'returning', 'pendingTreatment', 'unknownComplete'].includes(protocolState.phase)) return false;
  if (protocolState.phase === 'applying') return true;
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
  if ((currentCell.x !== nextCell.x || currentCell.y !== nextCell.y) && detectSampleAt(nextCell.x, nextCell.y)) return false;
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
  const currentCell = positionCell();
  const nextX = sim.position.x + dx * speed * dt;
  const nextY = sim.position.y + dy * speed * dt;
  const cell = { x: Math.floor(nextX), y: Math.floor(nextY) };
  if (blocked(cell.x, cell.y)) {
    detectObstacle(cell.x, cell.y);
    return;
  }
  if ((currentCell.x !== cell.x || currentCell.y !== cell.y) && detectSampleAt(cell.x, cell.y)) return;
  const distance = Math.hypot(nextX - sim.position.x, nextY - sim.position.y);
  sim.position.x = nextX;
  sim.position.y = nextY;
  sim.distance += distance * cellSize / scale;
}

function tick(dt, elapsedDt = dt) {
  const protocolActive = ['scanning', 'preparing', 'applying'].includes(protocolState.phase);
  if (protocolActive && !sim.running) {
    sim.elapsed += elapsedDt;
    sim.battery = Math.max(0, sim.battery - elapsedDt * 0.06);
  }
  if (sim.running) {
    sim.elapsed += elapsedDt;
    sim.battery = Math.max(0, sim.battery - elapsedDt * 0.06 * Number(ui.speedSelect.value));
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
        sim.sprayMode = 'OFF';
        if (sim.routePurpose === 'sample-return') {
          protocolState.phase = 'pendingTreatment';
          sim.status = 'Punto de muestra · confirmar tratamiento';
          addEvent('Muestra alcanzada al cierre', `${protocolState.activeMissionSample?.site.id || ''} · robot detenido sin pulverizar.`);
        } else {
          completeCoverageMission();
        }
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
  if (protocolState.stopLatched) {
    toast('Paro seguro activo. Reinicia la misión tras verificar el área.');
    return;
  }
  if (['scanning', 'pending', 'preparing', 'applying', 'queuedKnown', 'queuedUnknown', 'returnReady', 'returning', 'pendingTreatment', 'unknownComplete', 'isolated'].includes(protocolState.phase)) {
    toast('La misión está atendiendo muestras. Usa la acción indicada en el panel de protocolo.');
    return;
  }
  if (ui.modeSelect.value === 'auto') {
    if (!sim.route.length || sim.routeIndex >= sim.route.length) {
      sim.route = buildCoverageRoute();
      sim.routePurpose = 'coverage';
      sim.routeIndex = sim.route.length > 1 ? 1 : 0;
      sim.sprayMode = 'AUTO';
      drawRoute();
      addEvent('Ruta generada', `${ui.algorithmSelect.value.toUpperCase()} generó ${sim.route.length} puntos de cobertura.`);
    }
    if (protocolState.phase === 'complete') sim.sprayMode = 'AUTO';
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
  if (['scanning', 'pending', 'preparing', 'applying', 'queuedKnown', 'queuedUnknown', 'returnReady', 'returning', 'pendingTreatment', 'unknownComplete', 'isolated'].includes(protocolState.phase)) return;
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
  sim.routePurpose = 'coverage';
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
  if (protocolState.stopLatched || ['scanning', 'pending', 'preparing', 'applying', 'returnReady', 'returning', 'pendingTreatment', 'unknownComplete', 'isolated'].includes(protocolState.phase)) {
    toast('Pulverización bloqueada por el estado del protocolo.');
    return;
  }
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
ui.analyzeBtn.addEventListener('click', analyzeSample);
ui.confirmProtocolBtn.addEventListener('click', confirmProtocol);
ui.safetyStopBtn.addEventListener('click', () => emergencyStop());
ui.safetyStopBtnPanel.addEventListener('click', () => emergencyStop());
ui.cutawayBtn.addEventListener('click', () => {
  robotModel.internals.visible = !robotModel.internals.visible;
  robotModel.shell.visible = !robotModel.internals.visible;
  if (robotModel.internals.visible) {
    const target = robotMesh.position.clone().add(new THREE.Vector3(0, 0.47, 0));
    controls.target.copy(target);
    camera.position.copy(target).add(new THREE.Vector3(2.8, 2.5, 3.1).normalize().multiplyScalar(3.9));
    controls.minDistance = 2.2;
  } else {
    controls.target.copy(overviewCameraTarget);
    camera.position.copy(overviewCameraPosition);
    controls.minDistance = 7;
  }
  camera.updateProjectionMatrix();
  updateProtocolUI();
});
ui.clearLogBtn.addEventListener('click', () => {
  ui.eventLog.replaceChildren();
  events.length = 0;
});
renderer.domElement.addEventListener('click', selectSceneDestination);

document.addEventListener('keydown', (event) => {
  if (!auth.user || auth.user.role === 'observer') return;
  if (protocolState.stopLatched || ['scanning', 'pending', 'preparing', 'applying', 'returnReady', 'returning', 'pendingTreatment', 'unknownComplete', 'isolated'].includes(protocolState.phase)) return;
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
document.addEventListener('visibilitychange', () => {
  if (document.hidden && ['scanning', 'preparing', 'applying'].includes(protocolState.phase)) {
    emergencyStop('Pestaña oculta durante el protocolo: paro seguro activado y salidas inhibidas.');
  }
});

async function saveReport() {
  try {
    const payload = {
      scenario: ui.scenarioSelect.value, mode: ui.modeSelect.value, algorithm: ui.algorithmSelect.value,
      duration_seconds: Number(sim.elapsed.toFixed(2)), coverage_percent: coveragePercent(), obstacles_detected: detected.size,
      distance_m: Number(sim.distance.toFixed(2)), spray_seconds: Number(sim.spraySeconds.toFixed(2)),
      battery_percent: Number(sim.battery.toFixed(1)), tank_percent: Number(sim.tank.toFixed(1)),
      sensor_snapshot: {
        ...sim.sensors,
        protocol_phase: protocolState.phase,
        sample_classification: protocolState.match?.classification || (protocolState.sample === 'unknown' ? 'Señal no identificada' : 'Sin muestra')
      },
      notes: protocolState.match ? `Demo ${protocolState.match.protocol} · ${protocolState.phase}` : 'Simulación 3D CleanBot'
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

async function retainUnknownSample(item = null) {
  const site = item?.site || protocolState.site;
  const location = site || positionCell();
  try {
    const data = await api('/api/samples', {
      method: 'POST',
      body: JSON.stringify({
        scenario: ui.scenarioSelect.value,
        site_id: site?.id || `MANUAL-${Date.now()}`,
        sample_type: 'unknown',
        classification: DEMO_SAMPLES.unknown.classification,
        location_x: location.x,
        location_y: location.y
      })
    });
    if (!item || protocolState.site?.id === site?.id) protocolState.recordedSample = data.sample;
    if (!item || protocolState.site?.id === site?.id) protocolState.recordError = '';
    if (item) item.sampleCode = data.sample.sample_code;
    addEvent('Muestra retenida', `${data.sample.sample_code} · ${data.sample.sample_status} · laboratorio pendiente.`);
    await loadRetainedSamples();
    return data.sample;
  } catch (error) {
    protocolState.recordError = `Registro no confirmado: ${error.message}`;
    addEvent('Error al registrar muestra', protocolState.recordError);
    toast('Muestra no identificada: paro seguro activo, pero no se confirmó el guardado.');
    return null;
  } finally {
    if (!item || protocolState.site?.id === site?.id) protocolState.recordPending = false;
    updateProtocolUI();
    updateUI();
  }
}

async function loadRetainedSamples() {
  if (!auth.user) return;
  try {
    const data = await api('/api/samples');
    ui.retainedSamples.replaceChildren();
    if (!data.samples.length) {
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.colSpan = 5;
      cell.textContent = 'No hay muestras retenidas.';
      row.appendChild(cell);
      ui.retainedSamples.appendChild(row);
      return;
    }
    for (const sample of data.samples) {
      const row = document.createElement('tr');
      const values = [
        sample.sample_code,
        SCENARIOS[sample.scenario]?.title.split(' · ')[0] || sample.scenario,
        `${sample.site_id} · ${sample.location_x},${sample.location_y}`,
        'Retenida para laboratorio',
        new Date(sample.created_at).toLocaleString()
      ];
      for (const value of values) {
        const cell = document.createElement('td');
        cell.textContent = value;
        row.appendChild(cell);
      }
      ui.retainedSamples.appendChild(row);
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
  const elapsedDt = Math.min((timestamp - lastFrame) / 1000, 0.5);
  const dt = Math.min(elapsedDt, 0.05);
  lastFrame = timestamp;
  tick(dt, elapsedDt);
  syncRobotMesh();
  updateRobotProcess(dt);
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