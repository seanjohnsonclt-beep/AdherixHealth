import { Pool } from 'pg';

let pool: Pool | null = null;

export function db(): Pool {
  if (!pool) {
    // Fix region in pooler URL if misconfigured (us-east-1 → us-west-2)
    const connStr = (process.env.DATABASE_URL || '').replace(
      'aws-0-us-east-1.pooler.supabase.com',
      'aws-0-us-west-2.pooler.supabase.com'
    );
    pool = new Pool({
      connectionString: connStr,
      max: 10,
      ssl: { rejectUnauthorized: false },
    });
  }
  return pool;
}

export async function query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const result = await db().query(sql, params);
  return result.rows as T[];
}

export async function queryOne<T = any>(sql: string, params: any[] = []): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows[0] ?? null;
}
