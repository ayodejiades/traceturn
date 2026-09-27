// Resolve playwright-core without adding it as a project dependency.
// Order: PW_CORE env, local node_modules, then any sibling checkout on disk.
const { existsSync } = require("fs");
const { execSync } = require("child_process");
const { join } = require("path");

function loadPlaywright() {
  const candidates = [];
  if (process.env.PW_CORE) candidates.push(process.env.PW_CORE);
  candidates.push(join(__dirname, "..", "node_modules", "playwright-core"));
  try {
    // Only accept real installs: the bun/pnpm caches hold bare directories
    // with no package.json, and requiring one of those resolves to nothing.
    const found = execSync(
      "find /Users/mac -maxdepth 6 -type d -name playwright-core -path '*/node_modules/*' 2>/dev/null | head -5"
    )
      .toString()
      .split("\n")
      .filter(Boolean);
    candidates.push(...found);
  } catch {
    /* find unavailable; fall through to the error below */
  }
  const hit = candidates.find((p) => p && existsSync(join(p, "package.json")));
  if (!hit) {
    throw new Error(
      "playwright-core not found. Install it locally, or set PW_CORE=/path/to/playwright-core"
    );
  }
  return require(hit);
}

module.exports = { loadPlaywright };
