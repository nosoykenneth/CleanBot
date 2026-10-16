import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compareFloorPhotos } from '../CleanBot_Simulacion_Avanzada/static/photo-analysis.js';
const width = 40, height = 40;
function photo(value = 180) {
  const pixels = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < pixels.length; i += 4) pixels.set([value, value, value, 255], i);
  return pixels;
}
function stain(pixels, w = 10, h = 10) {
  for (let y = 15; y < 15 + h; y++) for (let x = 15; x < 15 + w; x++) pixels.set([60, 50, 40, 255], (y * width + x) * 4);
  return pixels;
}
test('actual pixel comparison estimates a 50% reduction in reference differences', () => {
  const result = compareFloorPhotos(photo(), stain(photo()), stain(photo(), 5), width, height);
  assert(result.valid); assert.equal(result.beforeArea, 100); assert.equal(result.afterArea, 50);
  assert.equal(result.reductionPercent, 50);
  assert.equal(result.beforeMask.reduce((a, b) => a + b), 100);
});
test('unchanged stain is not called clean', () => {
  const result = compareFloorPhotos(photo(), stain(photo()), stain(photo()), width, height);
  assert(result.valid); assert.equal(result.reductionPercent, 0);
});
test('worsening retains a negative reduction rather than hiding it', () => {
  const result = compareFloorPhotos(photo(), stain(photo(), 5), stain(photo()), width, height);
  assert(result.valid); assert.equal(result.reductionPercent, -100);
});
test('background or lighting changes invalidate the comparison', () => {
  const result = compareFloorPhotos(photo(), stain(photo()), photo(80), width, height);
  assert(!result.valid); assert.equal(result.reductionPercent, null); assert(result.controlChangePercent > 15);
});
test('no initial stain cannot produce a success percentage', () => {
  const result = compareFloorPhotos(photo(), photo(), photo(), width, height);
  assert(!result.valid); assert.equal(result.reductionPercent, null);
});
test('an ROI without an external control area is rejected', () => {
  const result = compareFloorPhotos(photo(), stain(photo()), photo(), width, height, { roi: { x: 0, y: 0, w: 1, h: 1 } });
  assert(!result.valid); assert(result.reasons.some(reason => reason.includes('10%')));
});
test('transparency, mismatched sizes and invalid thresholds are rejected', () => {
  const before = stain(photo()); before[3] = 0;
  assert(!compareFloorPhotos(photo(), before, photo(), width, height).valid);
  assert.throws(() => compareFloorPhotos(photo(), new Uint8Array(3), photo(), width, height));
  assert.throws(() => compareFloorPhotos(photo(), photo(), photo(), width, height, { threshold: NaN }));
});
