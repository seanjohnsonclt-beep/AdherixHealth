import 'dotenv/config';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { db } from '@/lib/db';

async function migrate() {
  const dir = join(process.cwd(), 'db');
  const files = readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();

  const client = await db().connect();
  try {
    for (const file of files) {
      console.log(`[migrate] applying ${file}`);
      const sql = readFileSync(join(dir, file), 'utf8');
      await client.query(sql);
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
