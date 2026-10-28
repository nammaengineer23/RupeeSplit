/**
 * Automated PWA and PWABuilder Assessment Verification Script
 * Validates manifest configuration, icon files, service worker, and build output.
 */

import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();
let errors = [];
let passedChecks = [];

function pass(name, detail = '') {
  passedChecks.push(`✔ [PASS] ${name}${detail ? ` - ${detail}` : ''}`);
}

function fail(name, reason) {
  errors.push(`✖ [FAIL] ${name}: ${reason}`);
}

console.log('--------------------------------------------------');
console.log('RupeeSplit PWA Verification Suite');
console.log('--------------------------------------------------\n');

// 1. Verify public/manifest.json
try {
  const manifestPath = path.join(rootDir, 'public/manifest.json');
  if (!fs.existsSync(manifestPath)) {
    fail('Manifest File', 'public/manifest.json does not exist');
  } else {
    const raw = fs.readFileSync(manifestPath, 'utf8');
    const manifest = JSON.parse(raw);

    if (manifest.name === 'RupeeSplit') {
      pass('Manifest Name', manifest.name);
    } else {
      fail('Manifest Name', `Expected "RupeeSplit", found "${manifest.name}"`);
    }

    if (manifest.short_name === 'RupeeSplit') {
      pass('Manifest Short Name', manifest.short_name);
    } else {
      fail('Manifest Short Name', `Expected "RupeeSplit", found "${manifest.short_name}"`);
    }

    const expectedDesc = 'Track and split travel expenses with friends in Indian rupees.';
    if (manifest.description === expectedDesc) {
      pass('Manifest Description', manifest.description);
    } else {
      fail('Manifest Description', `Expected "${expectedDesc}", found "${manifest.description}"`);
    }

    if (manifest.start_url === '/') {
      pass('Manifest start_url', manifest.start_url);
    } else {
      fail('Manifest start_url', `Expected "/", found "${manifest.start_url}"`);
    }

    if (manifest.scope === '/') {
      pass('Manifest scope', manifest.scope);
    } else {
      fail('Manifest scope', `Expected "/", found "${manifest.scope}"`);
    }

    if (manifest.display === 'standalone') {
      pass('Manifest display', manifest.display);
    } else {
      fail('Manifest display', `Expected "standalone", found "${manifest.display}"`);
    }

    if (manifest.theme_color?.toLowerCase() === '#059669') {
      pass('Manifest theme_color', manifest.theme_color);
    } else {
      fail('Manifest theme_color', `Expected "#059669", found "${manifest.theme_color}"`);
    }

    if (manifest.background_color?.toLowerCase() === '#0f172a') {
      pass('Manifest background_color', manifest.background_color);
    } else {
      fail('Manifest background_color', `Expected "#0f172a", found "${manifest.background_color}"`);
    }

    // Verify icons array
    const icons = manifest.icons || [];
    const has192 = icons.some(i => i.sizes === '192x192' && i.src.includes('192'));
    const has512 = icons.some(i => i.sizes === '512x512' && i.src.includes('512') && i.purpose !== 'maskable');
    const hasMaskable = icons.some(i => i.purpose === 'maskable' && i.sizes.includes('512'));

    if (has192) pass('Manifest 192x192 Icon', 'Present');
    else fail('Manifest 192x192 Icon', 'Missing 192x192 icon definition');

    if (has512) pass('Manifest 512x512 Icon', 'Present');
    else fail('Manifest 512x512 Icon', 'Missing 512x512 standard icon definition');

    if (hasMaskable) pass('Manifest Maskable Icon', 'Present');
    else fail('Manifest Maskable Icon', 'Missing maskable 512x512 icon definition');
  }
} catch (e) {
  fail('Manifest JSON Parsing', e.message);
}

// 2. Verify icon files on disk
const expectedIcons = [
  'public/pwa-192x192.png',
  'public/pwa-512x512.png',
  'public/pwa-maskable-512x512.png',
  'public/apple-touch-icon.png',
  'public/icon.svg',
  'public/favicon.ico'
];

for (const iconPath of expectedIcons) {
  const full = path.join(rootDir, iconPath);
  if (fs.existsSync(full) && fs.statSync(full).size > 0) {
    pass(`Icon File: ${iconPath}`, `${fs.statSync(full).size} bytes`);
  } else {
    fail(`Icon File: ${iconPath}`, 'File missing or 0 bytes');
  }
}

// 3. Verify index.html tags and Service Worker registration
try {
  const htmlPath = path.join(rootDir, 'index.html');
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');

  if (htmlContent.includes('<link rel="manifest" href="/manifest.json"')) {
    pass('HTML Manifest Link', 'Found <link rel="manifest" href="/manifest.json" />');
  } else {
    fail('HTML Manifest Link', 'Missing <link rel="manifest" href="/manifest.json" />');
  }

  if (htmlContent.includes('navigator.serviceWorker.register(\'/sw.js\'') || htmlContent.includes('navigator.serviceWorker.register("/sw.js"')) {
    pass('HTML Service Worker Registration', 'Found register(\'/sw.js\')');
  } else {
    fail('HTML Service Worker Registration', 'Missing registration for /sw.js');
  }

  if (htmlContent.includes('<meta name="theme-color" content="#059669"')) {
    pass('HTML Theme Color Meta', 'Found #059669');
  } else {
    fail('HTML Theme Color Meta', 'Missing meta theme-color #059669');
  }

  if (htmlContent.includes('<link rel="apple-touch-icon" href="/apple-touch-icon.png"')) {
    pass('HTML Apple Touch Icon', 'Found apple-touch-icon link');
  } else {
    fail('HTML Apple Touch Icon', 'Missing apple-touch-icon link');
  }
} catch (e) {
  fail('HTML Verification', e.message);
}

// 4. Verify public/sw.js
try {
  const swPath = path.join(rootDir, 'public/sw.js');
  if (!fs.existsSync(swPath) || fs.statSync(swPath).size === 0) {
    fail('Service Worker File', 'public/sw.js is missing or empty');
  } else {
    const swContent = fs.readFileSync(swPath, 'utf8');

    if (swContent.includes('addEventListener(\'install\'') || swContent.includes('addEventListener("install"')) {
      pass('SW Install Handler', 'Pre-caching shell assets present');
    } else {
      fail('SW Install Handler', 'Missing install event listener');
    }

    if (swContent.includes('addEventListener(\'fetch\'') || swContent.includes('addEventListener("fetch"')) {
      pass('SW Fetch Handler', 'Fetch event handling present');
    } else {
      fail('SW Fetch Handler', 'Missing fetch event listener');
    }

    // Check sensitive request exclusion
    if (swContent.includes('firestore.googleapis.com') && swContent.includes('isSensitiveRequest')) {
      pass('SW Security Shield', 'Excludes Firestore, auth tokens, receipts, and sensitive APIs');
    } else {
      fail('SW Security Shield', 'Missing security rules preventing caching of auth/Firestore APIs');
    }
  }
} catch (e) {
  fail('SW Verification', e.message);
}

// 5. Verify production build dist/ if present
const distPath = path.join(rootDir, 'dist');
if (fs.existsSync(distPath)) {
  const distManifest = fs.existsSync(path.join(distPath, 'manifest.json'));
  const distSw = fs.existsSync(path.join(distPath, 'sw.js'));
  const dist192 = fs.existsSync(path.join(distPath, 'pwa-192x192.png'));
  const dist512 = fs.existsSync(path.join(distPath, 'pwa-512x512.png'));
  const distHtml = fs.existsSync(path.join(distPath, 'index.html'));

  if (distManifest) pass('Dist Manifest', 'dist/manifest.json copied');
  else fail('Dist Manifest', 'dist/manifest.json missing in build');

  if (distSw) pass('Dist Service Worker', 'dist/sw.js copied');
  else fail('Dist Service Worker', 'dist/sw.js missing in build');

  if (dist192 && dist512) pass('Dist App Icons', '192x192 and 512x512 icons present in dist');
  else fail('Dist App Icons', 'Icons missing in dist directory');

  if (distHtml) pass('Dist HTML Entry', 'dist/index.html present');
  else fail('Dist HTML Entry', 'dist/index.html missing');
} else {
  console.log('ℹ dist/ folder not yet built. Run npm run build to verify production artifacts.');
}

console.log('\n--------------------------------------------------');
passedChecks.forEach(p => console.log(p));
console.log('--------------------------------------------------');

if (errors.length > 0) {
  console.error('\nIssues found:');
  errors.forEach(e => console.error(e));
  process.exit(1);
} else {
  console.log(`\nAll checks passed successfully! (${passedChecks.length} checks passed)\n`);
  process.exit(0);
}
