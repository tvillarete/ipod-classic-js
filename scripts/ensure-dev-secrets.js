#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const PROJECT_ROOT = path.resolve(__dirname, "..");
const WRANGLER_CONFIG = path.join(PROJECT_ROOT, "wrangler.jsonc");
const SECRETS_STORE_DIR = path.join(PROJECT_ROOT, ".wrangler", "state", "v3", "secrets-store");

const raw = fs.readFileSync(WRANGLER_CONFIG, "utf8");
const stripped = raw
  .replace(/^\s*\/\/.*$/gm, "")
  .replace(/\/\*[\s\S]*?\*\//g, "");
const config = JSON.parse(stripped);
const secrets = config.secrets_store_secrets || [];

if (!secrets.length) process.exit(0);

const storeIds = [...new Set(secrets.map((s) => s.store_id))];
const hasLocalSecrets = storeIds.every((id) => {
  const blobsDir = path.join(SECRETS_STORE_DIR, id, "blobs");
  try {
    return fs.readdirSync(blobsDir).length > 0;
  } catch {
    return false;
  }
});

if (!hasLocalSecrets) {
  console.log("\n🔐 Local secrets not found. Running first-time setup...\n");
  const { execSync } = require("child_process");
  execSync("node scripts/sync-dev-vars.js", { cwd: PROJECT_ROOT, stdio: "inherit" });
  console.log("");
}
