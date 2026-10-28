const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');

const root = path.resolve(__dirname, '..');
const publicDir = path.join(root, 'public');
const svg = fs.readFileSync(path.join(publicDir, 'icon.svg'));

async function renderFile(destination, size) {
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  await sharp(svg, { density: 192 })
    .resize(size, size, { fit: 'contain', background: '#1747DB' })
    .png()
    .toFile(destination);
}

async function generateWebIcons() {
  await renderFile(path.join(publicDir, 'pwa-192x192.png'), 192);
  await renderFile(path.join(publicDir, 'pwa-512x512.png'), 512);
  await renderFile(path.join(publicDir, 'pwa-maskable-512x512.png'), 512);
  await renderFile(path.join(publicDir, 'apple-touch-icon.png'), 180);
  await renderFile(path.join(publicDir, 'favicon-32x32.png'), 32);
}

async function generateAndroidIcons() {
  const res = path.join(root, 'android/app/src/main/res');
  const densities = [
    ['mipmap-mdpi', 48],
    ['mipmap-hdpi', 72],
    ['mipmap-xhdpi', 96],
    ['mipmap-xxhdpi', 144],
    ['mipmap-xxxhdpi', 192],
  ];
  for (const [folder, size] of densities) {
    await renderFile(path.join(res, folder, 'ic_launcher.png'), size);
    await renderFile(path.join(res, folder, 'ic_launcher_round.png'), size);
    await renderFile(path.join(res, folder, 'ic_launcher_foreground.png'), size);
  }
  // Adaptive launcher icons use this foreground artwork and the app's gradient background.
  await renderFile(path.join(res, 'drawable-nodpi', 'ic_launcher_foreground.png'), 432);
  const values = path.join(res, 'values');
  fs.mkdirSync(values, { recursive: true });
  fs.writeFileSync(path.join(values, 'ic_launcher_background.xml'),
    '<?xml version="1.0" encoding="utf-8"?>\n<resources><color name="ic_launcher_background">#1747DB</color></resources>\n');
  console.log('Generated Android launcher icons at mdpi through xxxhdpi.');
}

(async () => {
  await generateWebIcons();
  if (process.argv.includes('--android')) await generateAndroidIcons();
  console.log('Generated RupeeSplit icon assets from public/icon.svg');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
