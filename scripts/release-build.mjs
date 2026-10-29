import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

// Development deployments keep their source maps for browser debugging; production
// deployments upload them to Sentry and then remove them from the bundle.
const keepSourcemaps = process.argv.includes('--keep-sourcemaps');
const { version } = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const release = (process.env.SENTRY_RELEASE ?? '').trim() || `v${version}`;
const environment = keepSourcemaps ? 'development' : 'production';

if (!/^v\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(release)) {
  console.error(`Invalid Sentry release version: ${release}`);
  process.exit(1);
}

const run = (command, args) => execFileSync(command, args, { stdio: 'inherit' });

run('yarn', [
  'ng',
  'build',
  '--configuration',
  'production',
  '--define',
  `SENTRY_ENVIRONMENT="'${environment}'"`,
  '--define',
  `SENTRY_RELEASE="'${release}'"`,
]);

run('yarn', ['sentry:sourcemaps:inject']);
run('yarn', ['sentry:sourcemaps:upload']);

if (!keepSourcemaps) {
  run('yarn', ['sentry:sourcemaps:clean']);
}

console.log(
  `Built ${release} for ${environment} (${
    keepSourcemaps ? 'source maps retained' : 'source maps removed'
  }).`,
);
