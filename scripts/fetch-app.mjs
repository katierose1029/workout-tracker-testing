// Downloads (or updates) the app under test into ./app.
// Usage: npm run app:fetch            -> latest main
//        APP_REF=some-branch npm run app:fetch
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';

const repo = process.env.APP_REPO || 'https://github.com/katierose1029/workout-tracker';
const ref = process.env.APP_REF || 'main';
const dir = 'app';
const git = (...args) => execFileSync('git', args, { stdio: 'inherit' });

if (existsSync(`${dir}/.git`)) {
  git('-C', dir, 'fetch', '--depth', '1', 'origin', ref);
  git('-C', dir, 'checkout', '--force', 'FETCH_HEAD');
} else {
  git('clone', '--depth', '1', '--branch', ref, repo, dir);
}
console.log(`\nApp ready in ./${dir} (${ref})`);
