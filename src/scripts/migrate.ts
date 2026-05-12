import { config } from 'dotenv';
config({ path: '.env.local' });
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { db } from '@/lib/db';

async function migrate() {
  const dir = join(process.cwd(), 'db');
  const files = readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();

  const client = await db().connect();
  try {
    // Ensure tracking table exists
    await client.query(`
      create table if not exists _migrations (
        filename   text primary key,
        applied_at timestamptz not null default now()
      )
    `);

    // Fetch already-applied migrations
    const { rows } = await client.query<{ filename: string }>(
      `select filename from _migrations`
    );
    const applied = new Set(rows.map((r) => r.filename));

    for (const file of files) {
      if (applied.has(file)) {
        console.log(`[migrate] skip ${file} (already applied)`);
        continue;
      }

      console.log(`[migrate] applying ${file}`);
      const sql = readFileSync(join(dir, file), 'utf8');
      await client.query(sql);

      await client.query(
        `insert into _migrations (filename) values ($1)`,
        [file]
      );
      console.log(`[migrate] applied ${file}`);
    }

    console.log('[migrate] done');
  } finally {
    client.release();
  }
}

migrate().then(() => process.exit(0)).catch((err) => {
  console.error('[migrate] failed:', err);
  process.exit(1);
});
