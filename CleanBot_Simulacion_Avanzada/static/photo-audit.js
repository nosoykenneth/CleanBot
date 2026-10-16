import { compareFloorPhotos } from './photo-analysis.js';
const $ = id => document.getElementById(id);
const images = {};
let result = null;
const inputs = ['Reference', 'Before', 'After'];
function invalidate() {
  result = null;
  $('photoExport').disabled = true;
  $('photoResult').textContent = 'Carga las tres fotos, marca la zona y confirma que corresponden al mismo encuadre.';
  for (const id of ['photoBeforeMask', 'photoAfterMask']) $(id).getContext('2d').clearRect(0, 0, $(id).width, $(id).height);
}
function draw(name) {
  const canvas = $(`photo${name}Preview`), ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (!images[name]) return;
  canvas.width = images[name].canvas.width; canvas.height = images[name].canvas.height;
  ctx.drawImage(images[name].canvas, 0, 0, canvas.width, canvas.height);
  if (name === 'Before' && roi) {
    ctx.strokeStyle = '#ffd241'; ctx.lineWidth = 3;
    ctx.strokeRect(roi.x * canvas.width, roi.y * canvas.height, roi.w * canvas.width, roi.h * canvas.height);
  }
}
let roi = { x: 0.2, y: 0.2, w: 0.6, h: 0.6 };
for (const name of inputs) {
  let version = 0;
  $(`photo${name}`).addEventListener('change', async event => {
    const request = ++version;
    $('photoAligned').checked = false;
    invalidate(); delete images[name]; draw(name);
    const file = event.target.files[0]; if (!file) return;
    try {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 12 * 1024 * 1024) throw new Error('Usa JPG, PNG o WebP de hasta 12 MB.');
      const bitmap = await createImageBitmap(file);
      try {
        if (request !== version) return;
        if (bitmap.width < 64 || bitmap.height < 64 || bitmap.width * bitmap.height > 40000000) throw new Error('Usa una foto de al menos 64 × 64 y como máximo 40 megapíxeles.');
        const canvas = document.createElement('canvas');
        const scale = Math.min(1, 512 / Math.max(bitmap.width, bitmap.height));
        canvas.width = Math.max(1, Math.round(bitmap.width * scale)); canvas.height = Math.max(1, Math.round(bitmap.height * scale));
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
        images[name] = { canvas, filename: file.name, originalWidth: bitmap.width, originalHeight: bitmap.height };
        draw(name);
      } finally { bitmap.close(); }
    } catch (error) { if (request === version) $('photoResult').textContent = error.message; }
  });
}
let drag = null;
function point(event) {
  const bounds = $('photoBeforePreview').getBoundingClientRect();
  return { x: Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width)), y: Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height)) };
}
$('photoBeforePreview').addEventListener('pointerdown', event => {
  if (!images.Before) return;
  drag = point(event); $('photoBeforePreview').setPointerCapture(event.pointerId);
});
$('photoBeforePreview').addEventListener('pointerup', event => {
  if (!drag) return;
  const end = point(event), start = drag; drag = null;
  if (Math.abs(end.x - start.x) < 0.05 || Math.abs(end.y - start.y) < 0.05) return;
  roi = { x: Math.min(start.x, end.x), y: Math.min(start.y, end.y), w: Math.abs(end.x - start.x), h: Math.abs(end.y - start.y) };
  invalidate(); draw('Before');
});
$('photoBeforePreview').addEventListener('pointercancel', () => { drag = null; });
$('photoResetRoi').addEventListener('click', () => { roi = { x: 0.2, y: 0.2, w: 0.6, h: 0.6 }; invalidate(); draw('Before'); });
for (const id of ['photoThreshold', 'photoAligned']) $(id).addEventListener('input', invalidate);
function maskPreview(name, mask, width, height) {
  const canvas = $(`photo${name}Mask`); canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext('2d'); ctx.drawImage(images[name].canvas, 0, 0);
  const pixels = ctx.getImageData(0, 0, width, height);
  for (let i = 0; i < mask.length; i++) if (mask[i]) {
    pixels.data[i * 4] = 255; pixels.data[i * 4 + 1] *= 0.4; pixels.data[i * 4 + 2] *= 0.4;
  }
  ctx.putImageData(pixels, 0, 0);
}
$('photoCompare').addEventListener('click', () => {
  invalidate();
  try {
    if (!inputs.every(name => images[name])) throw new Error('Faltan fotografías: referencia limpia, antes y después.');
    if (!$('photoAligned').checked) throw new Error('Confirma primero que las fotos muestran el mismo piso, luz y encuadre.');
    const { width, height } = images.Reference.canvas;
    if (!inputs.every(name => images[name].canvas.width === width && images[name].canvas.height === height)) throw new Error('Las fotos deben tener la misma proporción. No se deformarán ni alinearán automáticamente.');
    const data = inputs.map(name => images[name].canvas.getContext('2d').getImageData(0, 0, width, height).data);
    const analysis = compareFloorPhotos(...data, width, height, { roi, threshold: Number($('photoThreshold').value) });
    maskPreview('Before', analysis.beforeMask, width, height); maskPreview('After', analysis.afterMask, width, height);
    const { beforeMask, afterMask, ...summary } = analysis;
    result = { ...summary, created_at: new Date().toISOString(), files: Object.fromEntries(inputs.map(name => [name, images[name].filename])), mode: 'real_photo_pixel_comparison', limitation: 'Diferencias RGB respecto a referencia limpia. Sin identificación de sustancias, IA, validación microbiológica ni autorización de tratamiento.' };
    $('photoExport').disabled = false;
    $('photoResult').textContent = analysis.valid
      ? `Reducción de área diferente a la referencia: ${analysis.reductionPercent.toFixed(1)}%. Antes: ${analysis.beforeCoveragePercent.toFixed(1)}% de la zona; después: ${analysis.afterCoveragePercent.toFixed(1)}%. Resultado visual estimado: requiere revisión del operador.`
      : `Comparación no válida: ${analysis.reasons.join(' ')} No se calcula reducción.`;
  } catch (error) { $('photoResult').textContent = error.message; }
});
$('photoExport').addEventListener('click', () => {
  if (!result) return;
  const payload = { ...result, evidence: Object.fromEntries(inputs.map(name => [name, images[name].canvas.toDataURL('image/png')])) };
  const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
  const link = document.createElement('a'); link.href = url; link.download = 'cleanbot-auditoria-fotografias.json'; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});
invalidate();
