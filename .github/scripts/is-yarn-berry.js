/*
 * Detect Yarn Berry using package.json `packageManager`.
 *
 * Exits with code 0 if Yarn major >= 2 (Berry), else 1.
 */

const fs = require('node:fs');
const path = require('node:path');

function main() {
  const isSelfTest = process.argv[2] === '--self-test';
  const pkgPath = path.resolve(process.cwd(), 'package.json');

  let pkg;
  try {
    pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  } catch (err) {
    console.error(`Failed to read or parse package.json at "${pkgPath}":`, err instanceof Error ? err.message : err);
    process.exit(1);
  }

  if (isSelfTest) {
    // A successful self-test means we can load and parse package.json.
    process.exit(0);
  }

  const pm = pkg && typeof pkg.packageManager === 'string' ? pkg.packageManager : '';
  const match = /^yarn@(\d+)(?:\.|$)/.exec(pm);
  const major = match ? Number.parseInt(match[1], 10) : NaN;

  if (Number.isInteger(major) && major >= 2) {
    process.exit(0);
  }

  process.exit(1);
}

main();
