// Pixel comparison against a user-supplied clean reference, not a learned model.
export function compareFloorPhotos(reference, before, after, width, height, options = {}) {
  const length = width * height * 4;
  if (![reference, before, after].every(image => image?.length === length)) throw new Error('Las imágenes deben tener el mismo tamaño.');
  const threshold = options.threshold ?? 35;
  const roi = options.roi || { x: 0.2, y: 0.2, w: 0.6, h: 0.6 };
  if (threshold < 5 || threshold > 100 || !Number.isFinite(threshold)) throw new Error('Umbral fuera de rango.');
  if (![roi.x, roi.y, roi.w, roi.h].every(Number.isFinite) || roi.x < 0 || roi.y < 0 || roi.w <= 0 || roi.h <= 0 || roi.x + roi.w > 1.000001 || roi.y + roi.h > 1.000001) throw new Error('Zona de análisis inválida.');
  const beforeMask = new Uint8Array(width * height), afterMask = new Uint8Array(width * height);
  let beforeArea = 0, afterArea = 0, roiArea = 0, controlArea = 0, controlBefore = 0, controlAfter = 0, opaque = true;
  const distance = (a, b, offset) => Math.sqrt(((a[offset] - b[offset]) ** 2 + (a[offset + 1] - b[offset + 1]) ** 2 + (a[offset + 2] - b[offset + 2]) ** 2) / 3);
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const pixel = y * width + x, offset = pixel * 4;
    if ([reference, before, after].some(image => image[offset + 3] < 250)) opaque = false;
    const db = distance(reference, before, offset), da = distance(reference, after, offset);
    const inside = x / width >= roi.x && x / width < roi.x + roi.w && y / height >= roi.y && y / height < roi.y + roi.h;
    if (inside) {
      roiArea++;
      if (db > threshold) { beforeMask[pixel] = 1; beforeArea++; }
      if (da > threshold) { afterMask[pixel] = 1; afterArea++; }
    } else {
      controlArea++;
      if (db > threshold) controlBefore++;
      if (da > threshold) controlAfter++;
    }
  }
  const reasons = [];
  if (!opaque) reasons.push('Hay transparencia en las imágenes. Usa fotografías opacas.');
  if (controlArea < width * height * 0.1) reasons.push('Deja al menos 10% del encuadre fuera de la zona para comprobar cambios del fondo.');
  if (controlArea && Math.max(controlBefore, controlAfter) / controlArea > 0.15) reasons.push('El fondo cambió demasiado: revisa luz, encuadre, sombras o movimiento.');
  if (beforeArea < Math.max(8, roiArea * 0.002)) reasons.push('No hay suficiente diferencia inicial respecto al piso limpio para calcular reducción.');
  const valid = reasons.length === 0;
  return {
    method: 'rgb_reference_difference_v1', valid, reasons, width, height, threshold, roi,
    beforeArea, afterArea, roiArea,
    beforeMask, afterMask,
    reductionPercent: valid ? 100 * (beforeArea - afterArea) / beforeArea : null,
    beforeCoveragePercent: roiArea ? beforeArea / roiArea * 100 : 0,
    afterCoveragePercent: roiArea ? afterArea / roiArea * 100 : 0,
    controlChangePercent: controlArea ? Math.max(controlBefore, controlAfter) / controlArea * 100 : 100,
  };
}
