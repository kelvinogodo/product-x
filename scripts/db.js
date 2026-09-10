// Minimal helper to run a .sql file against SUPABASE_DB_URL (from .env.local).
// Used by `pnpm db:push` / `pnpm db:seed` — not part of the Next.js app runtime.
const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

function loadEnvLocal() {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2].trim();
  }
}

async function main() {
  loadEnvLocal();
  const file = process.argv[2];
  const dbUrl = process.env.SUPABASE_DB_URL;
  if (!file || !dbUrl) {
    console.error("Usage: node scripts/db.js <path-to-sql-file>  (requires SUPABASE_DB_URL in .env.local)");
    process.exit(1);
  }

  const sql = fs.readFileSync(file, "utf8");
  const client = new Client({ connectionString: dbUrl });
  await client.connect();
  try {
    await client.query(sql);
    console.log(`Applied ${file}`);
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error("FAILED:", err.message);
  process.exit(1);
});
