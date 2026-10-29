import { readFileSync } from 'node:fs';

const [tag, ...flags] = process.argv.slice(2);
const stable = flags.includes('--stable');

if (!tag) {
  console.error('usage: node scripts/check-release-version.mjs <tag> [--stable]');
  process.exit(1);
}

const { version } = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const expected = `v${version}`;

if (tag !== expected) {
  console.error(`Release tag ${tag} does not match package.json version ${expected}.`);
  process.exit(1);
}

if (stable && !/^v\d+\.\d+\.\d+$/.test(tag)) {
  console.error(`Production deployments require a stable release tag, received ${tag}.`);
  process.exit(1);
}

console.log(`Release tag ${tag} matches package.json.`);
