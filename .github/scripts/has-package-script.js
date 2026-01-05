/*
 * Check for presence of an npm/yarn script in package.json.
 *
 * Usage:
 *   node .github/scripts/has-package-script.js <scriptName>
 *
 * Exits with code 0 if package.json contains scripts[scriptName]. Otherwise exits 1.
 */

const fs = require('node:fs');
const path = require('node:path');

function main() {
  const arg = process.argv[2];
  const isSelfTest = arg === '--self-test';
  const scriptName = isSelfTest ? undefined : arg;
  if (!isSelfTest && !scriptName) {
    process.exit(1);
  }

  const pkgPath = path.resolve(process.cwd(), 'package.json');

  let pkg;
  try {
    pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  } catch (err) {
    console.error(`Error reading or parsing package.json at "${pkgPath}":`, err && err.message ? err.message : err);
    process.exit(1);
  }

  if (isSelfTest) {
    // A successful self-test means we can load and parse package.json.
    process.exit(0);
  }

  const scripts = pkg && typeof pkg === 'object' ? pkg.scripts : undefined;
  const has =
    scripts &&
    typeof scripts === 'object' &&
    typeof scripts[scriptName] === 'string' &&
    scripts[scriptName].trim().length > 0;

  process.exit(has ? 0 : 1);
}

main();
