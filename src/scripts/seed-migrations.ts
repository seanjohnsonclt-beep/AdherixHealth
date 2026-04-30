import { config } from 'dotenv';
config({ path: '.env.local' });
import { db } from '@/lib/db';

async function main() {
  const client = await db().connect();
  try {
    // Mark already-applied migrations so the tracker skips them
    await client.query(`
      insert into _migrations (filename) values
        ('0004_rls_security.sql'),
        ('0005_injection_tracking.sql')
      on conflict do nothing
    `);
    const { rows } = await client.query(`select filename from _migrations order by filename`);
    console.log('_migrations table now contains:');
    rows.forEach(r => console.log(' ', r.filename));
  } finally {
    client.release();
  }
}

main().then(() => process.exit(0)).catch((err) => {
  console.error('failed:', err.message);
  process.exit(1);
});
