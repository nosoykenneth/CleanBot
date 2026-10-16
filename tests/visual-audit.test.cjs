const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require('node:path').join(__dirname, '..', 'dashboard-3d.js'), 'utf8');
function extract(name) {
  const start = source.indexOf(`function ${name}(`);
  let index = source.indexOf('{', start) + 1, depth = 1;
  for (; depth; index++) {
    if (source[index] === '{') depth++;
    if (source[index] === '}') depth--;
  }
  return source.slice(start, index);
}
function setup(difficulty, stock = 4) {
  const site = { id: 'TEST', difficulty };
  const audit = { site, passes: 1, targetRemaining: difficulty === 'easy' ? 0.02 : difficulty === 'persistent' ? 0.32 : 0.7 };
  let stopped = false, scheduled = 0, treated = false;
  const ctx = {
    protocolState: { phase: 'applying', site, match: { cartridge: 'A' }, treatmentReturn: true, autoSample: true, activeMissionSample: { site } },
    visualAudits: new Map([[site.id, audit]]), cartridgeInventory: { A: stock }, sim: { tank: 100, battery: 100 },
    sampleExclusions: new Map([[site.id, {}]]), setDirtRemaining: () => {}, captureAuditScene: () => 'snapshot',
    renderVisualAudit: () => {}, refreshResidueColors: () => {}, addEvent: () => {}, renderMissionSamples: () => {},
    isolateProtocol: () => { stopped = true; }, setTimeout: () => ++scheduled, beginApplication: () => {},
    markSampleAreaTreated: () => { treated = true; }, resumeCoverageAfterSample: () => {},
  };
  vm.createContext(ctx); vm.runInContext(extract('passResidual') + extract('finishApplication'), ctx);
  return { ctx, audit, stopped: () => stopped, scheduled: () => scheduled, treated: () => treated };
}
test('easy stain finishes once and releases its exclusion', () => {
  const t = setup('easy'); t.ctx.finishApplication();
  assert(t.treated()); assert.equal(t.audit.accepted, true); assert.equal(t.scheduled(), 0); assert.equal(t.ctx.sampleExclusions.size, 0);
});
test('persistent stain gets exactly a second pass before acceptance', () => {
  const t = setup('persistent'); t.ctx.finishApplication();
  assert.equal(t.scheduled(), 1); assert.equal(t.audit.accepted, false); assert(!t.treated());
  t.audit.passes = 2; t.audit.targetRemaining = t.ctx.passResidual('persistent', 2);
  t.ctx.protocolState.phase = 'applying'; t.ctx.finishApplication();
  assert(t.treated()); assert.equal(t.scheduled(), 1); assert(!t.stopped());
});
test('stubborn stain stops after two passes and remains excluded', () => {
  const t = setup('stubborn'); t.audit.passes = 2; t.audit.targetRemaining = t.ctx.passResidual('stubborn', 2);
  t.ctx.finishApplication(); assert(t.stopped()); assert(!t.treated());
  assert.equal(t.ctx.sampleExclusions.size, 1); assert.equal(t.ctx.protocolState.activeMissionSample.status, 'review');
});
test('no compatible stock prevents a retry', () => {
  const t = setup('persistent', 0); t.ctx.finishApplication();
  assert(t.stopped()); assert.equal(t.scheduled(), 0); assert(!t.treated());
});
test('latched stop blocks completion and additional treatment', () => {
  const t = setup('persistent'); t.ctx.protocolState.stopLatched = true; t.ctx.finishApplication();
  assert.equal(t.scheduled(), 0); assert(!t.treated());
});
