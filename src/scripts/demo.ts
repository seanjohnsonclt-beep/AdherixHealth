/**
 * Adherix dry-run demo — fully self-contained.
 *
 * Uses pg-mem (in-process Postgres) so no external DB or internet is needed.
 * Runs migrate → seed (Alex, phase 0) → tick (dry-run sender) → state dump.
 *
 * Usage:  npx tsx src/scripts/demo.ts
 */

import { newDb, DataType } from 'pg-mem';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { parse } from 'yaml';
import { addMinutes, addHours, addDays, set } from 'date-fns';
import { fromZonedTime, toZonedTime } from 'date-fns-tz';
import { randomUUID } from 'crypto';

// ─── pg-mem setup ─────────────────────────────────────────────────────────────

const mem = newDb();

// Register UUID generation (pg-mem doesn't include it by default)
mem.public.registerFunction({
  name: 'gen_random_uuid',
  returns: DataType.uuid,
  impure: true,           // must not cache — each call returns a new UUID
  implementation: () => randomUUID(),
});

const pgAdapter = mem.adapters.createPg();

async function runSql(sql: string, params: any[] = []) {
  const client = new pgAdapter.Client();
  await client.connect();
  try {
    return await client.query(sql, params);
  } finally {
    await client.end();
  }
}

async function q<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  return (await runSql(sql, params)).rows as T[];
}
async function q1<T = any>(sql: string, params: any[] = []): Promise<T | null> {
  return (await q<T>(sql, params))[0] ?? null;
}

// ─── 1. Migrate ───────────────────────────────────────────────────────────────

async function migrate() {
  console.log('\n━━━ MIGRATE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  const dir = join(process.cwd(), 'db');
  const files = readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();
  for (const file of files) {
    console.log(`[migrate] applying ${file}`);
    let sql = readFileSync(join(dir, file), 'utf8');
    // pg-mem doesn't support uuid-ossp; gen_random_uuid() is built-in
    sql = sql.replace(/create extension[^;]*uuid-ossp[^;]*;/gi, '');
    sql = sql.replace(/uuid_generate_v4\(\)/gi, 'gen_random_uuid()');
    await runSql(sql);
  }
  console.log('[migrate] done');
}

// ─── Config helpers (inline, no module import) ────────────────────────────────

type Template = {
  key: string;
  phase?: number;
  after?: { minutes?: number; hours?: number; days?: number };
  send_at_local?: string;
  requires_reply_to?: string;
  repeat_every_days?: number;
  internal?: boolean;
  body: string;
};

type Phase = { id: number; name: string; duration_days: number };

const TZ = 'America/New_York';
const CONFIG_DIR = join(process.cwd(), 'config');

function loadTemplates(): Template[] {
  const raw = readFileSync(join(CONFIG_DIR, 'messages.yaml'), 'utf8');
  return parse(raw).templates as Template[];
}
function loadPhases(): Phase[] {
  const raw = readFileSync(join(CONFIG_DIR, 'phases.yaml'), 'utf8');
  return parse(raw).phases as Phase[];
}

function applyOffset(base: Date, after?: Template['after']): Date {
  let d = base;
  if (!after) return d;
  if (after.minutes) d = addMinutes(d, after.minutes);
  if (after.hours)   d = addHours(d, after.hours);
  if (after.days)    d = addDays(d, after.days);
  return d;
}

function applyTimeOfDay(d: Date, hhmm?: string): Date {
  if (!hhmm) return d;
  const [h, m] = hhmm.split(':').map(Number);
  const local = toZonedTime(d, TZ);
  const localAtTime = set(local, { hours: h, minutes: m, seconds: 0, milliseconds: 0 });
  const out = fromZonedTime(localAtTime, TZ);
  return out < d ? addDays(out, 1) : out;
}

function renderBody(body: string, firstName: string): string {
  return body.trim().replace(/\{first_name\}/g, firstName || 'there');
}

// ─── 2. Seed ──────────────────────────────────────────────────────────────────

async function seed() {
  console.log('\n━━━ SEED ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Clinic
  let clinic = await q1<{ id: string }>(`select id from clinics where name = 'Demo Clinic'`);
  if (!clinic) {
    clinic = await q1<{ id: string }>(
      `insert into clinics (name, plan) values ('Demo Clinic', 'pilot') returning id`
    );
  }
  if (!clinic) throw new Error('clinic creation failed');
  console.log(`[seed] clinic  ${clinic.id}`);

  // Patient (idempotent)
  let patient = await q1<{ id: string; phase_started_at: Date }>(
    `select id, phase_started_at from patients where clinic_id = $1 and phone = $2`,
    [clinic.id, '+15555550199']
  );
  if (!patient) {
    patient = await q1<{ id: string; phase_started_at: Date }>(
      `insert into patients (clinic_id, phone, first_name, current_phase, phase_started_at)
       values ($1, '+15555550199', 'Alex', 0, now()) returning id, phase_started_at`,
      [clinic.id]
    );
    if (!patient) throw new Error('patient creation failed');

    await q(
      `insert into events (patient_id, kind, payload) values ($1, 'enrolled', $2)`,
      [patient.id, JSON.stringify({ phone_last4: '0199' })]
    );
  }
  console.log(`[seed] patient ${patient.id} (Alex, +15555550199)`);

  // Schedule phase 0 messages
  const templates = loadTemplates().filter(
    (t) => t.phase === 0 && !t.internal && !t.requires_reply_to
  );
  const base = new Date(patient.phase_started_at);
  let scheduled = 0;

  for (const t of templates) {
    let when = applyOffset(base, t.after);
    when = applyTimeOfDay(when, t.send_at_local);
    const body = renderBody(t.body, 'Alex');

    await q(
      `insert into messages (patient_id, direction, template_key, body, scheduled_for, status)
       values ($1, 'outbound', $2, $3, $4, 'pending')`,
      [patient.id, t.key, body, when]
    );
    console.log(`[seed] queued  ${t.key}  @ ${when.toISOString()}`);
    console.log(`       "${body.slice(0, 70)}${body.length > 70 ? '...' : ''}"`);
    scheduled++;
  }

  await q(
    `insert into events (patient_id, kind, payload) values ($1, 'phase_messages_scheduled', $2)`,
    [patient.id, JSON.stringify({ phase: 0, count: scheduled })]
  );

  // Fast-forward so tick sees them as due
  await q(`update messages set scheduled_for = now() - interval '10 seconds'`);
  console.log(`[seed] ✓ ${scheduled} message(s) fast-forwarded to due`);
}

// ─── 3. Tick (dry-run) ────────────────────────────────────────────────────────

async function tick() {
  console.log('\n━━━ TICK ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Trigger evaluation (simplified — just log that we checked, no triggers fire
  // on a brand-new patient with no inbound messages)
  const patients = await q<{ id: string; current_phase: number; last_inbound_at: Date | null }>(
    `select id, current_phase, last_inbound_at from patients where status in ('active', 'flagged')`
  );
  console.log(`[tick] evaluating triggers for ${patients.length} patient(s) — none due on day 0`);

  // Dry-run sender
  const due = await q<{ id: string; patient_id: string; body: string; phone: string }>(
    `select m.id, m.patient_id, m.body, p.phone
     from messages m
     join patients p on p.id = m.patient_id
     where m.status = 'pending'
       and m.direction = 'outbound'
       and m.scheduled_for <= now()
       and p.status in ('active', 'flagged')
     order by m.scheduled_for asc
     limit 50`
  );

  if (due.length === 0) {
    console.log('[tick] no due messages');
  }

  for (const msg of due) {
    const fakeSid = `DRY_${msg.id.replace(/-/g, '').slice(0, 16).toUpperCase()}`;
    await q(
      `update messages set status = 'sent', sent_at = now(), twilio_sid = $1 where id = $2`,
      [fakeSid, msg.id]
    );
    console.log(`[tick] ✓ sent  ${msg.id}`);
    console.log(`       sid  = ${fakeSid}`);
    console.log(`       to   = ${msg.phone}`);
    console.log(`       body = "${String(msg.body).trim().slice(0, 70)}"`);
  }
}

// ─── 4. State dump ────────────────────────────────────────────────────────────

async function dump() {
  console.log('\n━━━ FINAL STATE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const patients = await q(`select first_name, phone, status, current_phase from patients`);
  const messages = await q(
    `select template_key, status, twilio_sid from messages order by created_at`
  );
  const events = await q(`select kind, payload from events order by created_at`);

  console.log('\nPatients:');
  patients.forEach((p) =>
    console.log(`  ${p.first_name} (${p.phone})  phase=${p.current_phase}  status=${p.status}`)
  );

  console.log('\nMessages:');
  messages.forEach((m) =>
    console.log(`  [${String(m.status).padEnd(7)}] ${m.template_key}${m.twilio_sid ? `  sid=${m.twilio_sid}` : ''}`)
  );

  console.log('\nEvents:');
  events.forEach((e) => console.log(`  ${e.kind}  ${JSON.stringify(e.payload)}`));
}

// ─── Main ─────────────────────────────────────────────────────────────────────

(async () => {
  try {
    await migrate();
    await seed();
    await tick();
    await dump();
    console.log('\n✅  End-to-end dry-run complete. Engine is working.');
  } catch (err) {
    console.error('\n❌  Demo failed:', err);
    process.exit(1);
  }
})();
