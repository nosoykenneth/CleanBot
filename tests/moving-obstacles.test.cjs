const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const source = fs.readFileSync(require('node:path').join(__dirname, '..', 'dashboard-3d.js'), 'utf8');
function extract(name) {
  const start = source.indexOf(`function ${name}(`);
  let index = source.indexOf('{', start) + 1, depth = 1;
  for (; depth; index++) { if (source[index] === '{') depth++; if (source[index] === '}') depth--; }
  return source.slice(start, index);
}
function setup() {
  const obstacle = { x: 5, y: 3, w: 2, h: 2 };
  const context = {
    cols: 12, rows: 9, SCENARIOS: { test: { obstacles: [obstacle], samples: [] } },
    ui: { scenarioSelect: { value: 'test' }, algorithmSelect: { value: 'astar' } },
    sim: { position: { x: 1.5, y: 1.5 }, route: [], routePurpose: 'coverage', running: true, sprayMode: 'AUTO' },
    protocolState: { phase: 'idle', stopLatched: false }, visited: new Set(['1,1', '2,1']),
    drawRoute() {}, updateSensors() {}, updateUI() {}, addEvent() {},
    isExcludedSampleCell: () => false,
  };
  vm.createContext(context);
  const functions = ['cellKey', 'positionCell', 'blockedByObstacle', 'blocked', 'neighbors', 'heuristic', 'findPath', 'coverageFootprint', 'buildCoverageRoute', 'obstaclePlacementAllowed', 'replanAfterObstacleMove'];
  vm.runInContext(functions.map(extract).join('\n'), context);
  return { context, obstacle };
}
test('objects cannot overlap robot, samples, boundaries or other objects', () => {
  const { context: c, obstacle } = setup();
  assert(!c.obstaclePlacementAllowed(obstacle, 1, 1));
  assert(!c.obstaclePlacementAllowed(obstacle, -1, 2));
  assert(!c.obstaclePlacementAllowed(obstacle, 11, 2));
  c.SCENARIOS.test.samples.push({ x: 8, y: 6 });
  assert(!c.obstaclePlacementAllowed(obstacle, 8, 6));
  c.SCENARIOS.test.obstacles.push({ x: 9, y: 2, w: 2, h: 2 });
  assert(!c.obstaclePlacementAllowed(obstacle, 9, 2));
  assert(c.obstaclePlacementAllowed(obstacle, 5, 1));
});
test('recalculated coverage avoids moved obstacle and keeps progress and robot position', () => {
  const { context: c, obstacle } = setup();
  const cleaned = [...c.visited], position = { ...c.sim.position };
  obstacle.x = 4; obstacle.y = 1;
  c.replanAfterObstacleMove();
  assert(c.sim.running); assert(c.sim.route.length > 1);
  assert.deepEqual([...c.visited], cleaned); assert.deepEqual(c.sim.position, position);
  for (const point of c.sim.route) assert(!c.blocked(point.x, point.y));
  for (let i = 1; i < c.sim.route.length; i++) assert.equal(c.heuristic(c.sim.route[i - 1], c.sim.route[i]), 1);
});
test('moving an object does not resume a paused robot', () => {
  const { context: c } = setup(); c.sim.running = false;
  c.replanAfterObstacleMove(); assert(!c.sim.running); assert(c.sim.route.length > 1);
});
test('operator decision and latched stop remain in control', () => {
  const { context: c } = setup(); c.protocolState.phase = 'awaitingOperator';
  c.replanAfterObstacleMove(); assert(!c.sim.running); assert.equal(c.protocolState.phase, 'awaitingOperator');
  c.protocolState.phase = 'idle'; c.protocolState.stopLatched = true;
  c.replanAfterObstacleMove(); assert(!c.sim.running); assert(c.protocolState.stopLatched);
});
