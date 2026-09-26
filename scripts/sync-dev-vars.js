#!/usr/bin/env node

const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const readline = require("readline");

const PROJECT_ROOT = path.resolve(__dirname, "..");
const WRANGLER_CONFIG = path.join(PROJECT_ROOT, "wrangler.jsonc");

function parseJsonc(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  // Strip single-line comments only when they start a line (with optional whitespace),
  // avoiding false matches inside string values like URLs.
  const stripped = raw
    .replace(/^\s*\/\/.*$/gm, "")
    .replace(/\/\*[\s\S]*?\*\//g, "");
  return JSON.parse(stripped);
}

const config = parseJsonc(WRANGLER_CONFIG);
const secrets = config.secrets_store_secrets || [];

if (!secrets.length) {
  console.log("⚠️  No secrets_store_secrets found in wrangler.jsonc");
  process.exit(0);
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
function prompt(question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

function wrangler(...args) {
  return execFileSync("npx", ["wrangler", ...args], {
    cwd: PROJECT_ROOT,
    stdio: "pipe",
  });
}

function getExistingSecrets(storeId) {
  try {
    const output = wrangler(
      "secrets-store",
      "secret",
      "list",
      storeId
    ).toString();
    const existing = new Map();
    for (const line of output.split("\n")) {
      const match = line.match(/│\s*(\S+)\s*│\s*([a-f0-9]{32})\s*│/);
      if (match) existing.set(match[1], match[2]);
    }
    return existing;
  } catch {
    return new Map();
  }
}

async function run() {
  console.log("🔐 Sync secrets to local Secrets Store");
  console.log(
    "   Paste a new value, or press Enter to keep the existing one.\n"
  );

  const storeIds = [...new Set(secrets.map((s) => s.store_id))];
  const existingByStore = new Map(
    storeIds.map((id) => [id, getExistingSecrets(id)])
  );

  for (const secret of secrets) {
    const { binding, store_id, secret_name } = secret;
    const existing = existingByStore.get(store_id);
    const hasExisting = existing?.has(secret_name);

    const label = hasExisting
      ? `  ${binding} [Already set — Enter to keep]: `
      : `  ${binding} [Enter to skip]: `;

    const value = await prompt(label);

    if (!value) {
      if (hasExisting) {
        console.log("    ✅ Kept existing value");
      } else {
        console.log("    ⏭️  Skipped (no value set)");
      }
      continue;
    }

    try {
      const secretId = existing?.get(secret_name);
      if (secretId) {
        wrangler(
          "secrets-store",
          "secret",
          "update",
          store_id,
          "--secret-id",
          secretId,
          "--value",
          value
        );
        console.log("    ✅ Updated");
      } else {
        wrangler(
          "secrets-store",
          "secret",
          "create",
          store_id,
          "--name",
          secret_name,
          "--scopes",
          "workers",
          "--value",
          value
        );
        console.log("    ✅ Saved");
      }
    } catch (e) {
      console.log(
        "    ❌ Failed:",
        e.stderr?.toString().trim() || "unknown error"
      );
    }
  }

  console.log("\n✅ Local Secrets Store updated. Ready for `pnpm dev`.");
  rl.close();
}

run();
