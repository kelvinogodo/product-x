// Small DB helper for Supabase projects, used by the package.json scripts. Not part of the app runtime.
//
//   node scripts/db.js <file.sql> [more.sql ...]   run SQL files (pnpm db:seed)
//   node scripts/db.js --migrate                   apply supabase/migrations/*.sql not yet applied
//
// Connection: SUPABASE_DB_URL from .env.local. Direct hosts (db.<ref>.supabase.co) are IPv6-only; on an
// IPv4-only network use the "Session pooler" connection string from Project Settings -> Database.
const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

function loadEnvLocal() {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2].trim();
  }
}

async function runFile(client, file) {
  await client.query(fs.readFileSync(file, "utf8"));
  console.log(`Applied ${file}`);
}

// Tracks applied migrations in public._app_migrations. On first run against a database that already
// has the base schema (created by hand or by an older setup), migrations up to BASELINE are assumed applied.
const BASELINE = "20250101000005";

async function migrate(client) {
  await client.query(`create table if not exists public._app_migrations (
    name text primary key, applied_at timestamptz not null default now())`);
  const dir = path.join(__dirname, "..", "supabase", "migrations");
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();

  const { rows: done } = await client.query("select name from public._app_migrations");
  const applied = new Set(done.map((r) => r.name));

  if (applied.size === 0) {
    const { rows } = await client.query("select to_regclass('public.profiles') as t");
    if (rows[0].t) {
      for (const f of files.filter((f) => f.slice(0, 14) <= BASELINE)) {
        await client.query("insert into public._app_migrations (name) values ($1) on conflict do nothing", [f]);
        applied.add(f);
      }
      console.log(`Existing schema detected — baselined migrations up to ${BASELINE}`);
    }
  }

  for (const f of files) {
    if (applied.has(f)) continue;
    await client.query("begin");
    try {
      await client.query(fs.readFileSync(path.join(dir, f), "utf8"));
      await client.query("insert into public._app_migrations (name) values ($1)", [f]);
      await client.query("commit");
      console.log(`Migrated ${f}`);
    } catch (err) {
      await client.query("rollback");
      throw new Error(`${f}: ${err.message}`);
    }
  }
  console.log("Migrations up to date.");
}

async function main() {
  loadEnvLocal();
  const args = process.argv.slice(2);
  const dbUrl = process.env.SUPABASE_DB_URL;
  if (args.length === 0 || !dbUrl) {
    console.error("Usage: node scripts/db.js <file.sql ...> | --migrate   (requires SUPABASE_DB_URL in .env.local)");
    process.exit(1);
  }

  const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();
  try {
    if (args[0] === "--migrate") await migrate(client);
    else for (const file of args) await runFile(client, file);
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error("FAILED:", err.message);
  process.exit(1);
});
