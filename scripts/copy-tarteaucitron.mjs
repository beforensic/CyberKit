import { cpSync, existsSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = join(root, 'node_modules/tarteaucitronjs');
const destDir = join(root, 'public/tarteaucitron');

if (!existsSync(srcDir)) {
  console.warn('[copy-tarteaucitron] tarteaucitronjs not installed, skipping.');
  process.exit(0);
}

mkdirSync(destDir, { recursive: true });

const entries = [
  'tarteaucitron.js',
  'tarteaucitron.min.js',
  'tarteaucitron.services.js',
  'tarteaucitron.services.min.js',
  'css',
  'lang',
];

for (const entry of entries) {
  cpSync(join(srcDir, entry), join(destDir, entry), { recursive: true });
}

console.log('[copy-tarteaucitron] Copied assets to public/tarteaucitron/');
