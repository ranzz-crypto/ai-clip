// Usage: node scripts/set-backend-url.mjs https://nama-backend-anda.up.railway.app
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const input = process.argv[2];

if (!input) {
  console.error('Isi URL backend. Contoh: node scripts/set-backend-url.mjs https://nama-backend.up.railway.app');
  process.exit(1);
}

let origin;
try {
  const url = new URL(input);
  if (url.protocol !== 'https:') throw new Error('URL harus diawali https://');
  origin = url.origin;
} catch (error) {
  console.error(`URL tidak valid: ${error.message}`);
  process.exit(1);
}

const file = join(dirname(fileURLToPath(import.meta.url)), '..', 'vercel.json');
const config = JSON.parse(readFileSync(file, 'utf8'));
config.rewrites = [{ source: '/api/:path*', destination: `${origin}/api/:path*` }];
writeFileSync(file, `${JSON.stringify(config, null, 2)}\n`);

console.log(`vercel.json sekarang mengarahkan /api/* ke ${origin}`);
