#!/usr/bin/env node
// Compare each .env.<environment> file against the committed .env.example template.
//
// SECURITY: this script prints key NAMES only, never values. The .env.* files hold
// certificate ARNs and account-specific config, the repository is public, and this
// output goes into terminals and pasted issues. The script compares key *sets*, so a
// value cannot leak even by accident.
//
// Usage:
//   node scripts/env-sync.mjs              report drift, exit 1 if any (read-only)
//   node scripts/env-sync.mjs --write      append missing keys to each file
//   node scripts/env-sync.mjs --only=prod  limit to one environment
//
// Exit codes: 0 = in sync, 1 = drift found, 2 = error.

import { readFileSync, appendFileSync, existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const TEMPLATE = '.env.example';

// `test` is intentionally absent. infra/test/setup.ts supplies every value the suite
// needs before any module loads, and dotenv never overrides an already-set variable,
// so no .env.test file exists. CI proves it: .env.* is gitignored, so the file is
// absent on a fresh checkout and `npm test -w infra` passes anyway.
const ENVS = ['dev', 'sandbox', 'staging', 'prod'];

const KEY_RE = /^([A-Za-z_][A-Za-z0-9_]*)\s*=/;

/**
 * Parse the template into ordered entries, keeping each key's preceding comment block.
 * Those comments are the only documentation each variable has, so they travel with it.
 */
function parseTemplate(text) {
  const entries = [];
  let comments = [];
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (trimmed.startsWith('#')) {
      comments.push(line);
      continue;
    }
    if (trimmed === '') {
      comments = []; // a blank line ends the block; trailing notes belong to nothing
      continue;
    }
    const match = trimmed.match(KEY_RE);
    if (match) {
      entries.push({ key: match[1], comments });
      comments = [];
    }
  }
  return entries;
}

/** The key names defined in a file. Values are never captured. */
function keysOf(text) {
  const keys = new Set();
  for (const line of text.split('\n')) {
    const match = line.trim().match(KEY_RE);
    if (match) keys.add(match[1]);
  }
  return keys;
}

/**
 * Build the text appended to a .env file for the keys it is missing.
 *
 * @param {string} env  environment name, e.g. "prod"
 * @param {{key: string, comments: string[]}[]} missing  template entries to add
 * @returns {string} text to append, or '' when there is nothing to add
 */
function renderAdditions(env, missing) {
  let result = '';
  missing.forEach(({ key, comments }) => {
    // Leading newline per entry: the file may not end in one, and appending
    // straight onto an unterminated last line would corrupt it.
    result += '\n';
    for (const comment of comments) {
      result += `${comment}\n`;
    }
    // DEPLOY_ENV is the one key that is never blank — every file names itself.
    result += key === 'DEPLOY_ENV' ? `${key}=${env}` : `${key}=`;
  });
  return result ? `${result}\n` : '';
}

function main() {
  const args = process.argv.slice(2);
  const write = args.includes('--write');
  const only = args.find((a) => a.startsWith('--only='))?.split('=')[1];

  const templatePath = join(ROOT, TEMPLATE);
  if (!existsSync(templatePath)) {
    console.error(`error: ${TEMPLATE} not found at ${templatePath}`);
    process.exit(2);
  }

  const entries = parseTemplate(readFileSync(templatePath, 'utf8'));
  const templateKeys = new Set(entries.map((e) => e.key));
  const targets = only ? [only] : ENVS;

  if (only && !ENVS.includes(only)) {
    console.error(`error: unknown environment "${only}". Known: ${ENVS.join(', ')}`);
    process.exit(2);
  }

  console.log(`${TEMPLATE} defines ${templateKeys.size} keys: ${[...templateKeys].join(', ')}\n`);

  let drift = false;

  for (const env of targets) {
    const name = `.env.${env}`;
    const path = join(ROOT, name);

    if (!existsSync(path)) {
      // Deliberately not created. An empty file turns a clear "missing file" into a
      // confusing requireEnv() failure at synth time.
      console.log(`${name}  MISSING FILE — copy ${TEMPLATE} and fill it in`);
      drift = true;
      continue;
    }

    const have = keysOf(readFileSync(path, 'utf8'));
    const missing = entries.filter((e) => !have.has(e.key));
    const extra = [...have].filter((k) => !templateKeys.has(k));

    if (missing.length === 0 && extra.length === 0) {
      console.log(`${name}  in sync`);
      continue;
    }

    drift = true;
    if (missing.length > 0) {
      console.log(`${name}  missing ${missing.length}: ${missing.map((e) => e.key).join(', ')}`);
    }
    if (extra.length > 0) {
      // Reported, never removed — an unexpected key is worth surfacing, but deleting
      // one silently could destroy the only copy of a value.
      console.log(`${name}  extra ${extra.length} (not in template): ${extra.join(', ')}`);
    }

    if (write && missing.length > 0) {
      const addition = renderAdditions(env, missing);
      if (addition) {
        appendFileSync(path, addition);
        console.log(`${name}  appended ${missing.length} key(s) — fill in the values`);
      }
    }
  }

  if (drift && !write) {
    console.log(`\nRun \`npm run env:sync\` to append the missing keys.`);
  }
  process.exit(drift && !write ? 1 : 0);
}

main();
