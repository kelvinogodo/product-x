import fs from "node:fs";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";

const ROOT = path.resolve(__dirname, "..", "..");

/**
 * Builds an in-memory Postgres with just enough of Supabase's surface (auth.uid(), roles, storage
 * tables, moddatetime) to run the real migrations and seeds, so RLS and functions can be tested
 * without a live project.
 */
export async function createDb() {
  const db = new PGlite();

  await db.exec(`
    create role anon nologin; create role authenticated nologin;
    create schema auth; create schema extensions; create schema storage;
    create table auth.users (id uuid primary key default gen_random_uuid(), raw_user_meta_data jsonb);
    create function auth.uid() returns uuid language sql stable as $$
      select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    create function extensions.moddatetime() returns trigger language plpgsql as $$
      begin new.updated_at = now(); return new; end $$;
    create table storage.buckets (id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
    create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text, name text);
    alter table storage.objects enable row level security;
    create function storage.foldername(name text) returns text[] language sql immutable as $$
      select string_to_array(name, '/') $$;
    grant usage on schema auth, public, storage to anon, authenticated;
    grant execute on function auth.uid() to anon, authenticated;
  `);

  const migrationsDir = path.join(ROOT, "supabase", "migrations");
  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql") && !f.includes("_extensions"))
    .sort();
  for (const f of files) {
    try {
      await db.exec(fs.readFileSync(path.join(migrationsDir, f), "utf8"));
    } catch (e) {
      throw new Error(`Migration ${f} failed: ${(e as Error).message}`);
    }
  }
  await db.exec(`
    grant select, insert, update, delete on all tables in schema public to anon, authenticated;
    grant select, insert, update, delete on storage.objects to anon, authenticated;
  `);

  const seed = async () => {
    await db.exec(fs.readFileSync(path.join(ROOT, "supabase", "seed.sql"), "utf8"));
    await db.exec(fs.readFileSync(path.join(ROOT, "supabase", "seed_quizzes.sql"), "utf8"));
  };

  const rows = async <T = Record<string, unknown>>(sql: string) => (await db.query<T>(sql)).rows;

  /** Run `fn` as an API caller (anon or authenticated user), like PostgREST does. */
  const as = async <T>(role: "anon" | "authenticated", uid: string | null, fn: () => Promise<T>) => {
    await db.exec(`set role ${role}; select set_config('request.jwt.claim.sub', '${uid ?? ""}', false);`);
    try {
      return await fn();
    } finally {
      await db.exec(`reset role; select set_config('request.jwt.claim.sub', '', false);`);
    }
  };

  const attempt = async (sql: string) => {
    try {
      return { rows: (await db.query<Record<string, unknown>>(sql)).rows, error: undefined as string | undefined };
    } catch (e) {
      return { rows: [] as Record<string, unknown>[], error: (e as Error).message };
    }
  };

  const createUser = async (id: string, name: string, role: "student" | "admin" = "student") => {
    await db.exec(`insert into auth.users (id, raw_user_meta_data) values ('${id}', '{"full_name":"${name}"}');`);
    if (role === "admin") await db.exec(`update public.profiles set role='admin' where id='${id}'`);
  };

  return { db, seed, rows, as, attempt, createUser };
}

export const IDS = {
  alice: "aaaaaaaa-0000-0000-0000-000000000001",
  admin: "aaaaaaaa-0000-0000-0000-000000000002",
  bob: "aaaaaaaa-0000-0000-0000-000000000003",
};
