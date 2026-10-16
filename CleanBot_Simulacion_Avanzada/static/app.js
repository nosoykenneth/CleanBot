const $ = (id) => document.getElementById(id);

const els = {
  loginOverlay: $('loginOverlay'), loginForm: $('loginForm'), loginUser: $('loginUser'), loginPass: $('loginPass'), loginError: $('loginError'),
  userName: $('userName'), userRole: $('userRole'), logoutBtn: $('logoutBtn'), permissionBadge: $('permissionBadge'),
  scenarioSelect: $('scenarioSelect'), modeSelect: $('modeSelect'), algorithmSelect: $('algorithmSelect'), speedSelect: $('speedSelect'),
  startBtn: $('startBtn'), pauseBtn: $('pauseBtn'), resetBtn: $('resetBtn'), sprayBtn: $('sprayBtn'), saveReportBtn: $('saveReportBtn'),
  scenarioTitle: $('scenarioTitle'), scenarioDescription: $('scenarioDescription'), canvas: $('simCanvas'),
  statusValue: $('statusValue'), coverageValue: $('coverageValue'), coverageBar: $('coverageBar'), timeValue: $('timeValue'), distanceValue: $('distanceValue'), obstacleValue: $('obstacleValue'), sprayValue: $('sprayValue'), batteryValue: $('batteryValue'), tankValue: $('tankValue'),
  frontSensor: $('frontSensor'), leftSensor: $('leftSensor'), rightSensor: $('rightSensor'), tempSensor: $('tempSensor'), humiditySensor: $('humiditySensor'), vocSensor: $('vocSensor'),
  eventLog: $('eventLog'), clearLogBtn: $('clearLogBtn'), reportsTable: $('reportsTable'), downloadReportsBtn: $('downloadReportsBtn'),
  adminPanel: $('adminPanel'), userForm: $('userForm'), newFullName: $('newFullName'), newUsername: $('newUsername'), newPassword: $('newPassword'), newRole: $('newRole'), usersTable: $('usersTable'), toast: $('toast')
};

const ctx = els.canvas.getContext('2d');
const CELL = 20;
const GRID = { x: 30, y: 30, cols: 45, rows: 25 };
const DIRS = {
  N: { dx: 0, dy: -1 }, E: { dx: 1, dy: 0 }, S: { dx: 0, dy: 1 }, W: { dx: -1, dy: 0 }
};

const SCENARIOS = {
  hospital: {
    title: 'Hospital · Área clínica',
    description: 'Camillas, equipos médicos y zonas de circulación restringida.',
    baseTemp: 22.4, baseHumidity: 48,
    obstacles: [
      {x:5,y:4,w:8,h:4,label:'Camilla A'}, {x:18,y:3,w:6,h:5,label:'Equipo médico'},
      {x:29,y:5,w:10,h:3,label:'Camilla B'}, {x:10,y:14,w:7,h:4,label:'Estación'},
      {x:24,y:13,w:5,h:6,label:'Gabinete'}, {x:34,y:16,w:7,h:4,label:'Camilla C'}
    ],
    zones: [{x:1,y:1,w:12,h:2,label:'Ingreso'}, {x:31,y:10,w:12,h:3,label:'Zona crítica'}]
  },
  industry: {
    title: 'Industria · Planta de proceso',
    description: 'Maquinaria, tuberías y pasillos de seguridad simulados.',
    baseTemp: 27.8, baseHumidity: 55,
    obstacles: [
      {x:4,y:3,w:8,h:7,label:'Máquina 1'}, {x:16,y:4,w:5,h:10,label:'Tanque'},
      {x:26,y:2,w:12,h:5,label:'Línea de proceso'}, {x:29,y:11,w:8,h:8,label:'Máquina 2'},
      {x:5,y:17,w:12,h:4,label:'Pallets'}, {x:20,y:18,w:5,h:5,label:'Bomba'}
    ],
    zones: [{x:1,y:1,w:43,h:2,label:'Pasillo seguro'}, {x:38,y:8,w:5,h:6,label:'Riesgo químico'}]
  },
  warehouse: {
    title: 'Bodega · Almacenamiento',
    description: 'Estanterías, pallets y corredores para navegación autónoma.',
    baseTemp: 24.5, baseHumidity: 52,
    obstacles: [
      {x:5,y:3,w:5,h:8,label:'Rack A'}, {x:14,y:3,w:5,h:8,label:'Rack B'},
      {x:23,y:3,w:5,h:8,label:'Rack C'}, {x:32,y:3,w:5,h:8,label:'Rack D'},
      {x:7,y:16,w:7,h:5,label:'Pallets'}, {x:19,y:15,w:6,h:6,label:'Carga'},
      {x:31,y:16,w:8,h:5,label:'Pallets'}
    ],
    zones: [{x:1,y:12,w:43,h:2,label:'Corredor principal'}]
  }
};

let auth = { token: localStorage.getItem('cleanbot_token') || '', user: null };
let sim = {};
let timerId = null;
let keys = new Set();

function toast(message) {
  els.toast.textContent = message;
  els.toast.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => els.toast.classList.remove('show'), 2400);
}

async function api(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (options.body && !headers['Content-Type']) headers['Content-Type'] = 'application/json';
  if (auth.token) headers.Authorization = `Bearer ${auth.token}`;
  const res = await fetch(path, { ...options, headers });
  let data = null;
  const type = res.headers.get('content-type') || '';
  if (type.includes('application/json')) data = await res.json();
  if (!res.ok) throw new Error(data?.error || `Error HTTP ${res.status}`);
  return data;
}

function roleLabel(role) {
  return ({admin:'Administrador', operator:'Operador', observer:'Observador'})[role] || role;
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

function showLogin() {
  els.loginOverlay.classList.remove('hidden');
}

function enterApp() {
  els.loginOverlay.classList.add('hidden');
  els.userName.textContent = auth.user.full_name;
  els.userRole.textContent = roleLabel(auth.user.role);
  els.permissionBadge.textContent = roleLabel(auth.user.role);
  const observer = auth.user.role === 'observer';
  [els.startBtn, els.pauseBtn, els.resetBtn, els.sprayBtn, els.saveReportBtn].forEach(b => b.disabled = observer);
  els.modeSelect.disabled = observer;
  els.algorithmSelect.disabled = observer;
  els.speedSelect.disabled = observer;
  els.adminPanel.classList.toggle('hidden', auth.user.role !== 'admin');
  resetSimulation(true);
  loadReports();
  if (auth.user.role === 'admin') loadUsers();
}

els.loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  els.loginError.textContent = '';
  try {
    const data = await api('/api/login', { method:'POST', body: JSON.stringify({username:els.loginUser.value.trim(), password:els.loginPass.value}) });
    auth = { token: data.token, user: data.user };
    localStorage.setItem('cleanbot_token', auth.token);
    enterApp();
  } catch (err) {
    els.loginError.textContent = err.message;
  }
});

els.logoutBtn.addEventListener('click', async () => {
  try { await api('/api/logout', {method:'POST'}); } catch {}
  auth = {token:'', user:null};
  localStorage.removeItem('cleanbot_token');
  stopTicker();
  showLogin();
});

function currentScenario() { return SCENARIOS[els.scenarioSelect.value]; }
function cellKey(x,y){ return `${x},${y}`; }
function inBounds(x,y){ return x>=0 && y>=0 && x<GRID.cols && y<GRID.rows; }
function obstacleAt(x,y){
  return currentScenario().obstacles.some(o => x>=o.x && x<o.x+o.w && y>=o.y && y<o.y+o.h);
}
function isFree(x,y){ return inBounds(x,y) && !obstacleAt(x,y); }
function getNeighbors(x,y){
  return [[1,0],[-1,0],[0,1],[0,-1]].map(([dx,dy])=>({x:x+dx,y:y+dy})).filter(p=>isFree(p.x,p.y));
}

function heuristic(a,b){ return Math.abs(a.x-b.x)+Math.abs(a.y-b.y); }
function reconstruct(came, goalKey){
  const path=[]; let k=goalKey;
  while(k){ const [x,y]=k.split(',').map(Number); path.push({x,y}); k=came.get(k); }
  return path.reverse();
}

function findPath(start, goal, algorithm='astar') {
  if (!isFree(goal.x, goal.y)) return [];
  const startK=cellKey(start.x,start.y), goalK=cellKey(goal.x,goal.y);
  const open=[{x:start.x,y:start.y,key:startK}];
  const openSet=new Set([startK]);
  const came=new Map();
  const g=new Map([[startK,0]]);
  const f=new Map([[startK, algorithm==='astar'?heuristic(start,goal):0]]);
  while(open.length){
    let best=0;
    for(let i=1;i<open.length;i++) if((f.get(open[i].key)??Infinity)<(f.get(open[best].key)??Infinity)) best=i;
    const cur=open.splice(best,1)[0]; openSet.delete(cur.key);
    if(cur.key===goalK) return reconstruct(came,goalK);
    for(const n of getNeighbors(cur.x,cur.y)){
      const nk=cellKey(n.x,n.y); const tentative=(g.get(cur.key)??Infinity)+1;
      if(tentative<(g.get(nk)??Infinity)){
        came.set(nk,cur.key); g.set(nk,tentative);
        f.set(nk,tentative+(algorithm==='astar'?heuristic(n,goal):0));
        if(!openSet.has(nk)){ open.push({...n,key:nk}); openSet.add(nk); }
      }
    }
  }
  return [];
}

function nearestFree(x,y){
  if(isFree(x,y)) return {x,y};
  for(let r=1;r<8;r++){
    for(let dy=-r;dy<=r;dy++) for(let dx=-r;dx<=r;dx++) if(Math.abs(dx)===r||Math.abs(dy)===r){
      const nx=x+dx, ny=y+dy; if(isFree(nx,ny)) return {x:nx,y:ny};
    }
  }
  return {x:1,y:1};
}

function buildCoverageRoute() {
  const algo=els.algorithmSelect.value;
  const goals=[];
  let reverse=false;
  for(let y=2;y<GRID.rows-2;y+=4){
    const row=[];
    for(let x=2;x<GRID.cols-2;x+=4) if(isFree(x,y)) row.push({x,y});
    if(reverse) row.reverse(); reverse=!reverse; goals.push(...row);
  }
  let current={...sim.robot}; const route=[];
  for(const g of goals){
    const seg=findPath(current,g,algo);
    if(seg.length>1){ route.push(...seg.slice(1)); current=g; }
  }
  return route;
}

function resetSimulation(silent=false){
  stopTicker(); keys.clear();
  const start=nearestFree(1,1);
  sim={
    robot:{x:start.x,y:start.y,heading:'E'}, route:[], routeIndex:0, target:null, running:false,
    sprayMode:'AUTO', spraying:false, visited:new Set(), detected:new Set(), events:[],
    elapsed:0,distance:0,spraySeconds:0,battery:100,tank:100,status:'Listo', lastTick:performance.now(),
    sensors:{front:0,left:0,right:0,temp:0,humidity:0,voc:0}
  };
  updateScenarioText(); updateSensors(); updateUI(); draw();
  if(!silent) addEvent('Simulación reiniciada','Robot colocado en posición inicial.');
}

function updateScenarioText(){
  const s=currentScenario(); els.scenarioTitle.textContent=s.title; els.scenarioDescription.textContent=s.description;
}

function addEvent(event, detail){
  const time=new Date().toLocaleTimeString('es-EC',{hour12:false});
  sim.events.unshift({time,event,detail});
  const tr=document.createElement('tr'); tr.innerHTML=`<td>${time}</td><td>${event}</td><td>${detail}</td>`; els.eventLog.prepend(tr);
}

function startTicker(){
  if(timerId) return;
  sim.lastTick=performance.now();
  timerId=setInterval(tick,120);
}
function stopTicker(){ if(timerId){clearInterval(timerId);timerId=null;} }

function tick(){
  const now=performance.now(); const dt=Math.min((now-sim.lastTick)/1000,.25); sim.lastTick=now;
  if(!sim.running){updateSensors();updateUI();draw();return;}
  const speed=Number(els.speedSelect.value);
  sim.elapsed += dt;
  sim.battery=Math.max(0,sim.battery-dt*0.06*speed);

  if(els.modeSelect.value==='auto'){
    let steps=Math.max(1,Math.floor(speed));
    if(speed>1 && Math.random()<0.5) steps++;
    for(let i=0;i<steps;i++) autoStep();
  } else {
    manualContinuousStep();
  }
  sim.spraying = shouldSpray();
  if(sim.spraying){ sim.spraySeconds+=dt; sim.tank=Math.max(0,sim.tank-dt*0.16); markCoverage(); }
  updateSensors(); updateUI(); draw();
}

function autoStep(){
  if(sim.routeIndex>=sim.route.length){
    sim.running=false; sim.status='Completado'; sim.spraying=false;
    addEvent('Misión finalizada',`Cobertura alcanzada: ${coveragePercent()}%.`); return;
  }
  const next=sim.route[sim.routeIndex++];
  moveTo(next.x,next.y,true);
}

function manualContinuousStep(){
  const directions=[
    [['ArrowUp','w','W'],0,-1,'N'], [['ArrowDown','s','S'],0,1,'S'],
    [['ArrowLeft','a','A'],-1,0,'W'], [['ArrowRight','d','D'],1,0,'E']
  ];
  for(const [names,dx,dy,h] of directions){
    if(names.some(k=>keys.has(k))){ manualMove(dx,dy,h); break; }
  }
}

function manualMove(dx,dy,heading){
  const nx=sim.robot.x+dx, ny=sim.robot.y+dy; sim.robot.heading=heading;
  if(isFree(nx,ny)) moveTo(nx,ny,false); else detectCollision(nx,ny);
}

function moveTo(x,y,auto){
  const dx=x-sim.robot.x,dy=y-sim.robot.y;
  if(Math.abs(dx)>Math.abs(dy)) sim.robot.heading=dx>=0?'E':'W'; else if(dy!==0) sim.robot.heading=dy>=0?'S':'N';
  if(!isFree(x,y)){detectCollision(x,y);return false;}
  sim.robot.x=x;sim.robot.y=y; sim.distance+=0.20;
  if(auto && sim.routeIndex%12===0) addEvent('Navegación',`Ruta ${els.algorithmSelect.value.toUpperCase()} · celda ${x},${y}.`);
  return true;
}

function detectCollision(x,y){
  const key=cellKey(x,y); if(!sim.detected.has(key)){sim.detected.add(key);addEvent('Obstáculo detectado',`Sensor bloqueó movimiento hacia ${x},${y}.`);}
}

function shouldSpray(){
  if(sim.tank<=0) return false;
  if(sim.sprayMode==='ON') return true;
  if(sim.sprayMode==='OFF') return false;
  if(els.modeSelect.value==='manual') return keys.has(' ') || keys.has('Space');
  return sim.running;
}

function markCoverage(){
  const radius=2;
  for(let dy=-radius;dy<=radius;dy++) for(let dx=-radius;dx<=radius;dx++){
    if(Math.abs(dx)+Math.abs(dy)>3) continue;
    const x=sim.robot.x+dx,y=sim.robot.y+dy; if(isFree(x,y)) sim.visited.add(cellKey(x,y));
  }
}

function freeCellCount(){
  let n=0; for(let y=0;y<GRID.rows;y++)for(let x=0;x<GRID.cols;x++)if(isFree(x,y))n++; return n;
}
function coveragePercent(){return Math.min(100,Math.round(sim.visited.size/freeCellCount()*100));}

function rayDistance(heading){
  const d=DIRS[heading]; let steps=0;
  for(let i=1;i<=14;i++){const x=sim.robot.x+d.dx*i,y=sim.robot.y+d.dy*i;if(!isFree(x,y))break;steps=i;}
  return Math.max(5,steps*20);
}
function rotateHeading(h,turn){
  const order=['N','E','S','W']; let i=order.indexOf(h); i=(i+(turn==='R'?1:3))%4; return order[i];
}
function updateSensors(){
  const s=currentScenario(); const wave=Math.sin(sim.elapsed/6);
  sim.sensors.front=rayDistance(sim.robot.heading); sim.sensors.left=rayDistance(rotateHeading(sim.robot.heading,'L')); sim.sensors.right=rayDistance(rotateHeading(sim.robot.heading,'R'));
  sim.sensors.temp=s.baseTemp+wave*0.7; sim.sensors.humidity=s.baseHumidity+Math.cos(sim.elapsed/8)*2.3; sim.sensors.voc=Math.round(18+(sim.spraying?13:0)+Math.abs(Math.sin(sim.elapsed/5))*5);
}

function updateUI(){
  const cov=coveragePercent(); els.statusValue.textContent=sim.running?'En operación':sim.status; els.coverageValue.textContent=`${cov}%`; els.coverageBar.style.width=`${cov}%`;
  const mm=String(Math.floor(sim.elapsed/60)).padStart(2,'0'),ss=String(Math.floor(sim.elapsed%60)).padStart(2,'0'); els.timeValue.textContent=`${mm}:${ss}`;
  els.distanceValue.textContent=`${sim.distance.toFixed(1)} m`; els.obstacleValue.textContent=sim.detected.size; els.sprayValue.textContent=sim.spraying?'ON':'OFF'; els.batteryValue.textContent=`${sim.battery.toFixed(0)}%`; els.tankValue.textContent=`${sim.tank.toFixed(0)}%`;
  els.frontSensor.textContent=`${sim.sensors.front} cm`; els.leftSensor.textContent=`${sim.sensors.left} cm`; els.rightSensor.textContent=`${sim.sensors.right} cm`; els.tempSensor.textContent=`${sim.sensors.temp.toFixed(1)} °C`; els.humiditySensor.textContent=`${sim.sensors.humidity.toFixed(0)} %`; els.vocSensor.textContent=`${sim.sensors.voc} índice`;
  els.sprayBtn.textContent=`💧 Pulverización ${sim.sprayMode}`;
}

function cellToPx(x,y){return {x:GRID.x+x*CELL+CELL/2,y:GRID.y+y*CELL+CELL/2};}
function draw(){
  ctx.clearRect(0,0,els.canvas.width,els.canvas.height); const w=GRID.cols*CELL,h=GRID.rows*CELL;
  ctx.fillStyle='#fff';ctx.fillRect(GRID.x,GRID.y,w,h);ctx.strokeStyle='#94a3b8';ctx.lineWidth=2;ctx.strokeRect(GRID.x,GRID.y,w,h);
  drawZones(); drawCoverage(); drawGrid(); drawRoute(); drawObstacles(); drawRobot();
}
function drawGrid(){ctx.strokeStyle='#edf1f6';ctx.lineWidth=1;for(let x=0;x<=GRID.cols;x++){ctx.beginPath();ctx.moveTo(GRID.x+x*CELL,GRID.y);ctx.lineTo(GRID.x+x*CELL,GRID.y+GRID.rows*CELL);ctx.stroke();}for(let y=0;y<=GRID.rows;y++){ctx.beginPath();ctx.moveTo(GRID.x,GRID.y+y*CELL);ctx.lineTo(GRID.x+GRID.cols*CELL,GRID.y+y*CELL);ctx.stroke();}}
function drawZones(){for(const z of currentScenario().zones){ctx.fillStyle='rgba(245,158,11,.09)';ctx.fillRect(GRID.x+z.x*CELL,GRID.y+z.y*CELL,z.w*CELL,z.h*CELL);ctx.fillStyle='#92400e';ctx.font='11px system-ui';ctx.fillText(z.label,GRID.x+z.x*CELL+5,GRID.y+z.y*CELL+14);}}
function drawCoverage(){ctx.fillStyle='rgba(96,165,250,.28)';for(const key of sim.visited){const[x,y]=key.split(',').map(Number);ctx.fillRect(GRID.x+x*CELL,GRID.y+y*CELL,CELL,CELL);}}
function drawObstacles(){for(const o of currentScenario().obstacles){const px=GRID.x+o.x*CELL,py=GRID.y+o.y*CELL;ctx.fillStyle='#fee2e2';ctx.strokeStyle='#dc2626';ctx.lineWidth=1.5;ctx.fillRect(px,py,o.w*CELL,o.h*CELL);ctx.strokeRect(px,py,o.w*CELL,o.h*CELL);ctx.fillStyle='#991b1b';ctx.font='11px system-ui';ctx.fillText(o.label,px+5,py+15);}}
function drawRoute(){if(!sim.route.length)return;ctx.strokeStyle='rgba(245,158,11,.8)';ctx.lineWidth=3;ctx.beginPath();let started=false;for(let i=Math.max(0,sim.routeIndex-1);i<sim.route.length;i+=2){const p=cellToPx(sim.route[i].x,sim.route[i].y);if(!started){ctx.moveTo(p.x,p.y);started=true;}else ctx.lineTo(p.x,p.y);}ctx.stroke();if(sim.target){const p=cellToPx(sim.target.x,sim.target.y);ctx.strokeStyle='#f59e0b';ctx.lineWidth=2;ctx.beginPath();ctx.arc(p.x,p.y,8,0,Math.PI*2);ctx.stroke();}}
function drawRobot(){const p=cellToPx(sim.robot.x,sim.robot.y);if(sim.spraying){const g=ctx.createRadialGradient(p.x,p.y,6,p.x,p.y,45);g.addColorStop(0,'rgba(16,185,129,.3)');g.addColorStop(1,'rgba(16,185,129,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(p.x,p.y,45,0,Math.PI*2);ctx.fill();}ctx.fillStyle='#4f46e5';ctx.beginPath();ctx.arc(p.x,p.y,9,0,Math.PI*2);ctx.fill();const d=DIRS[sim.robot.heading];ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x+d.dx*8,p.y+d.dy*8);ctx.stroke();}

els.startBtn.addEventListener('click',()=>{
  if(els.modeSelect.value==='auto'){
    if(!sim.route.length || sim.routeIndex>=sim.route.length){ sim.route=buildCoverageRoute();sim.routeIndex=0;sim.target=null;addEvent('Ruta generada',`${els.algorithmSelect.value.toUpperCase()} generó ${sim.route.length} pasos de cobertura.`); }
  }
  sim.running=true;sim.status='En operación';startTicker();addEvent('Misión iniciada',`${els.modeSelect.options[els.modeSelect.selectedIndex].text} · ${els.algorithmSelect.value.toUpperCase()}.`);
});
els.pauseBtn.addEventListener('click',()=>{sim.running=false;sim.spraying=false;sim.status='Pausado';addEvent('Misión pausada','Operación detenida por el usuario.');updateUI();draw();});
els.resetBtn.addEventListener('click',()=>resetSimulation(false));
els.sprayBtn.addEventListener('click',()=>{sim.sprayMode=sim.sprayMode==='AUTO'?'OFF':sim.sprayMode==='OFF'?'ON':'AUTO';addEvent('Pulverización',`Modo cambiado a ${sim.sprayMode}.`);updateUI();});
els.clearLogBtn.addEventListener('click',()=>{els.eventLog.innerHTML='';sim.events=[];});
els.scenarioSelect.addEventListener('change',()=>{resetSimulation(true);addEvent('Escenario cambiado',currentScenario().title);});
els.modeSelect.addEventListener('change',()=>{sim.route=[];sim.routeIndex=0;sim.running=false;sim.status='Listo';addEvent('Modo cambiado',els.modeSelect.options[els.modeSelect.selectedIndex].text);updateUI();draw();});
els.algorithmSelect.addEventListener('change',()=>{sim.route=[];sim.routeIndex=0;addEvent('Algoritmo cambiado',els.algorithmSelect.value.toUpperCase());draw();});

els.canvas.addEventListener('click',(e)=>{
  if(!auth.user || auth.user.role==='observer' || els.modeSelect.value!=='auto')return;
  const r=els.canvas.getBoundingClientRect(); const scaleX=els.canvas.width/r.width, scaleY=els.canvas.height/r.height;
  const px=(e.clientX-r.left)*scaleX,py=(e.clientY-r.top)*scaleY; const x=Math.floor((px-GRID.x)/CELL),y=Math.floor((py-GRID.y)/CELL);
  if(!isFree(x,y)){toast('Selecciona una celda libre');return;}
  const route=findPath(sim.robot,{x,y},els.algorithmSelect.value); if(route.length<2){toast('No se encontró una ruta');return;}
  sim.route=route.slice(1);sim.routeIndex=0;sim.target={x,y};sim.running=true;sim.status='En operación';startTicker();addEvent('Destino seleccionado',`Ruta ${els.algorithmSelect.value.toUpperCase()} hacia ${x},${y}: ${sim.route.length} pasos.`);draw();
});

document.addEventListener('keydown',(e)=>{
  const tag=document.activeElement?.tagName; if(['INPUT','SELECT','TEXTAREA'].includes(tag)) return;
  if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','Space'].includes(e.key)) e.preventDefault();
  keys.add(e.key); if(els.modeSelect.value==='manual' && auth.user?.role!=='observer'){sim.running=true;sim.status='En operación';startTicker();}
});
document.addEventListener('keyup',(e)=>{keys.delete(e.key);});

async function saveReport(){
  try{
    const payload={scenario:els.scenarioSelect.value,mode:els.modeSelect.value,algorithm:els.algorithmSelect.value,duration_seconds:Number(sim.elapsed.toFixed(2)),coverage_percent:coveragePercent(),obstacles_detected:sim.detected.size,distance_m:Number(sim.distance.toFixed(2)),spray_seconds:Number(sim.spraySeconds.toFixed(2)),battery_percent:Number(sim.battery.toFixed(1)),tank_percent:Number(sim.tank.toFixed(1)),sensor_snapshot:{...sim.sensors},notes:'Simulación CleanBot 2.0'};
    const data=await api('/api/reports',{method:'POST',body:JSON.stringify(payload)});toast(`Reporte #${data.report_id} guardado en SQLite`);addEvent('Reporte guardado',`ID ${data.report_id} persistido en base de datos.`);loadReports();
  }catch(err){toast(err.message);}
}
els.saveReportBtn.addEventListener('click',saveReport);

async function loadReports(){
  try{const data=await api('/api/reports');els.reportsTable.innerHTML='';for(const r of data.reports){const tr=document.createElement('tr');tr.innerHTML=`<td>${r.id}</td><td>${r.scenario}</td><td>${r.coverage_percent}%</td><td>${r.username}</td><td>${new Date(r.created_at).toLocaleString()}</td>`;els.reportsTable.appendChild(tr);}}
  catch(err){console.error(err);}
}
els.downloadReportsBtn.addEventListener('click',async()=>{
  try{const res=await fetch('/api/reports.csv',{headers:{Authorization:`Bearer ${auth.token}`}});if(!res.ok)throw new Error('No se pudo exportar');const blob=await res.blob();const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='cleanbot_reportes.csv';a.click();URL.revokeObjectURL(url);}catch(err){toast(err.message);}
});

async function loadUsers(){
  try{const data=await api('/api/users');els.usersTable.innerHTML='';for(const u of data.users){const tr=document.createElement('tr');tr.innerHTML=`<td>${u.id}</td><td>${u.full_name}</td><td>${u.username}</td><td>${roleLabel(u.role)}</td><td>${new Date(u.created_at).toLocaleString()}</td>`;els.usersTable.appendChild(tr);}}
  catch(err){toast(err.message);}
}
els.userForm.addEventListener('submit',async(e)=>{e.preventDefault();try{await api('/api/users',{method:'POST',body:JSON.stringify({full_name:els.newFullName.value.trim(),username:els.newUsername.value.trim(),password:els.newPassword.value,role:els.newRole.value})});els.userForm.reset();toast('Usuario creado');loadUsers();}catch(err){toast(err.message);}});

restoreSession();
