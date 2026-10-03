import { existsSync, readdirSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';

const target = resolve(process.argv[2] ?? 'dist/chessroot/browser');

if (!existsSync(target)) {
  console.log(`sourcemaps: nothing to clean, ${target} does not exist`);
  process.exit(0);
}

let removed = 0;

for (const entry of readdirSync(target, { recursive: true, withFileTypes: true })) {
  if (entry.isFile() && entry.name.endsWith('.map')) {
    rmSync(join(entry.parentPath, entry.name));
    removed++;
  }
}

console.log(`sourcemaps: removed ${removed} map file(s) from ${target}`);
