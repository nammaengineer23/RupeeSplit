import { copyFile, mkdir, access } from 'node:fs/promises';
import { constants } from 'node:fs';

const source = new URL('../public/sw.js', import.meta.url);
const destinationDir = new URL('../dist/', import.meta.url);
const destination = new URL('../dist/sw.js', import.meta.url);
try {
  await access(source, constants.R_OK);
  await mkdir(destinationDir, { recursive: true });
  await copyFile(source, destination);
  console.log('Copied public/sw.js to dist/sw.js');
} catch (error) {
  if (error.code === 'ENOENT') console.warn('public/sw.js not found; Vite PWA plugin will manage the service worker.');
  else throw error;
}
