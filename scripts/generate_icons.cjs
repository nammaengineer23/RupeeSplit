const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');

const publicDir = path.resolve(__dirname, '../public');
const svgPath = path.join(publicDir, 'icon.svg');
const svg = fs.readFileSync(svgPath);

async function render(name, size, options = {}) {
  await sharp(svg, { density: 192 })
    .resize(size, size, { fit: 'contain', background: options.background || '#1747DB' })
    .png()
    .toFile(path.join(publicDir, name));
}

(async () => {
  await render('pwa-192x192.png', 192);
  await render('pwa-512x512.png', 512);
  // Maskable artwork uses the same background with the complete emblem inside
  // the central safe zone, leaving margin for Android launcher shape masks.
  await render('pwa-maskable-512x512.png', 512);
  await render('apple-touch-icon.png', 180);
  await render('favicon-32x32.png', 32);
  console.log('Generated RupeeSplit icon assets from public/icon.svg');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
