/**
 * validate.js — theme validation script
 *
 * Run before pushing to check your theme meets all requirements.
 * Usage: node validate.js
 *
 * Checks:
 *   1. theme.css exists, is non-empty, under 512 KB
 *   2. No @import rules
 *   3. No javascript: URIs
 *   4. No expression() calls
 *   5. Warns on http:// url() references
 *   6. theme.json is valid JSON with required fields (optional file)
 *   7. assets/ files have allowed extensions only
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const ALLOWED_EXTENSIONS = new Set([
  '.css', '.png', '.jpg', '.jpeg', '.gif',
  '.svg', '.webp', '.woff', '.woff2', '.ttf', '.ico',
]);

const MAX_CSS_BYTES = 512 * 1024; // 512 KB

let errors = 0;
let warnings = 0;

function fail(msg)  { console.error(`  [ERROR] ${msg}`); errors++; }
function warn(msg)  { console.warn( `  [WARN]  ${msg}`); warnings++; }
function ok(msg)    { console.log(  `  [OK]    ${msg}`); }

console.log('\nValidating Mustbe theme...\n');

// ── 1. theme.css ────────────────────────────────────────────────────────────
const cssPath = path.join(__dirname, 'theme.css');

if (!fs.existsSync(cssPath)) {
  fail('theme.css not found. This file is required.');
} else {
  const css = fs.readFileSync(cssPath, 'utf8');

  if (css.trim().length === 0) {
    fail('theme.css is empty.');
  } else {
    ok(`theme.css found (${(css.length / 1024).toFixed(1)} KB)`);
  }

  if (css.length > MAX_CSS_BYTES) {
    fail(`theme.css is too large (${(css.length / 1024).toFixed(0)} KB). Maximum is 512 KB.`);
  }

  if (/@import\s/i.test(css)) {
    fail('@import rules are not allowed. Inline your styles or use https:// url().');
  }

  if (/javascript\s*:/i.test(css)) {
    fail('javascript: URIs are not allowed.');
  }

  if (/expression\s*\(/i.test(css)) {
    fail('expression() calls are not allowed.');
  }

  if (/url\s*\(\s*['"]?http:\/\//i.test(css)) {
    warn('Found url() with http:// — use https:// for production assets.');
  }

  if (!/:root\s*\{/.test(css)) {
    warn('No :root {} block found. Consider adding CSS custom property overrides.');
  } else {
    ok(':root {} block present');
  }
}

// ── 2. theme.json (optional) ─────────────────────────────────────────────────
const jsonPath = path.join(__dirname, 'theme.json');

if (!fs.existsSync(jsonPath)) {
  warn('theme.json not found. This file is optional but recommended.');
} else {
  try {
    const json = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    for (const field of ['name', 'version']) {
      if (!json[field]) warn(`theme.json missing field: "${field}"`);
    }
    ok(`theme.json valid (name: "${json.name}", version: "${json.version}")`);
  } catch (err) {
    fail(`theme.json is not valid JSON: ${err.message}`);
  }
}

// ── 3. assets/ directory ────────────────────────────────────────────────────
const assetsDir = path.join(__dirname, 'assets');

if (!fs.existsSync(assetsDir)) {
  ok('assets/ directory not found (optional)');
} else {
  const files = fs.readdirSync(assetsDir, { recursive: true });
  let count = 0;
  for (const file of files) {
    if (typeof file !== 'string') continue;
    const ext = path.extname(file).toLowerCase();
    if (!ext) continue; // skip directories
    count++;
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      fail(`assets/${file}: extension "${ext}" not allowed. Allowed: ${[...ALLOWED_EXTENSIONS].join(', ')}`);
    }
  }
  ok(`assets/ contains ${count} file(s)`);
}

// ── Summary ─────────────────────────────────────────────────────────────────
console.log('');
if (errors > 0) {
  console.error(`Validation FAILED: ${errors} error(s), ${warnings} warning(s).`);
  process.exit(1);
} else if (warnings > 0) {
  console.log(`Validation PASSED with ${warnings} warning(s). Review warnings above.`);
} else {
  console.log('Validation PASSED. Theme is ready to push.');
}
