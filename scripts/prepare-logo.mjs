import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const src =
  'C:/Users/Musafir/.cursor/projects/d-evenPlannerBackend/assets/c__Users_Musafir_AppData_Roaming_Cursor_User_workspaceStorage_a41a6573bab71817445de6700ca1088d_images_image-d0faa14e-68fb-42aa-ba88-2af38e4bff81.png';
const outDir = 'public/brand';
fs.mkdirSync(outDir, { recursive: true });

const isBlackBg = (r, g, b) => r < 28 && g < 28 && b < 28;

const isDarkEventText = (r, g, b) => {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const avg = (r + g + b) / 3;
  return avg > 20 && avg < 95 && max - min < 55 && b >= g && b >= r - 10;
};

const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: w, height: h } = info;
const light = Buffer.from(data);
const dark = Buffer.from(data);

const seen = new Uint8Array(w * h);
const q = [];
const push = (x, y) => {
  if (x < 0 || y < 0 || x >= w || y >= h) return;
  const p = y * w + x;
  if (seen[p]) return;
  const i = p * 4;
  if (!isBlackBg(data[i], data[i + 1], data[i + 2])) return;
  seen[p] = 1;
  q.push(p);
};
for (let x = 0; x < w; x++) {
  push(x, 0);
  push(x, h - 1);
}
for (let y = 0; y < h; y++) {
  push(0, y);
  push(w - 1, y);
}
while (q.length) {
  const p = q.pop();
  const x = p % w;
  const y = (p / w) | 0;
  light[p * 4 + 3] = 0;
  dark[p * 4 + 3] = 0;
  push(x + 1, y);
  push(x - 1, y);
  push(x, y + 1);
  push(x, y - 1);
}

for (let y = 1; y < h - 1; y++) {
  for (let x = 1; x < w - 1; x++) {
    const p = y * w + x;
    const i = p * 4;
    if (light[i + 3] === 0) continue;
    if (!isBlackBg(light[i], light[i + 1], light[i + 2])) continue;
    let t = 0;
    for (const [dx, dy] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]) {
      if (light[((y + dy) * w + (x + dx)) * 4 + 3] === 0) t++;
    }
    if (t >= 2) {
      light[i + 3] = 0;
      dark[i + 3] = 0;
    }
  }
}

for (let i = 0; i < dark.length; i += 4) {
  if (dark[i + 3] === 0) continue;
  if (isDarkEventText(dark[i], dark[i + 1], dark[i + 2])) {
    dark[i] = 248;
    dark[i + 1] = 250;
    dark[i + 2] = 252;
  }
}

await sharp(src).png().toFile(path.join(outDir, 'eventsphere-logo-source.png'));
await sharp(light, { raw: { width: w, height: h, channels: 4 } })
  .trim()
  .png()
  .toFile(path.join(outDir, 'eventsphere-logo.png'));
await sharp(dark, { raw: { width: w, height: h, channels: 4 } })
  .trim()
  .png()
  .toFile(path.join(outDir, 'eventsphere-logo-dark.png'));

await sharp(path.join(outDir, 'eventsphere-logo-dark.png'))
  .resize({ width: 960, withoutEnlargement: true })
  .png()
  .toFile(path.join(outDir, 'eventsphere-logo-dark@2x.png'));
await sharp(path.join(outDir, 'eventsphere-logo.png'))
  .resize({ width: 960, withoutEnlargement: true })
  .png()
  .toFile(path.join(outDir, 'eventsphere-logo@2x.png'));

const meta = await sharp(path.join(outDir, 'eventsphere-logo-dark.png')).metadata();
const side = Math.min(meta.width, meta.height);
await sharp(path.join(outDir, 'eventsphere-logo-dark.png'))
  .extract({ left: 0, top: 0, width: Math.min(side + 8, meta.width), height: meta.height })
  .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toFile(path.join(outDir, 'eventsphere-mark.png'));

await sharp(path.join(outDir, 'eventsphere-mark.png')).resize(64, 64).png().toFile('public/favicon.png');
await sharp(path.join(outDir, 'eventsphere-mark.png')).resize(180, 180).png().toFile('public/apple-touch-icon.png');
await sharp(path.join(outDir, 'eventsphere-logo-dark.png')).png().toFile('public/logo.png');
await sharp(path.join(outDir, 'eventsphere-mark.png')).png().toFile('public/logo-mark.png');

console.log('Brand logos ready in public/brand');
