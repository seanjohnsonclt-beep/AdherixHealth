import { readFileSync } from 'fs';
import { join } from 'path';
import { parse } from 'yaml';

export type Phase = {
  id: number;
  name: string;
  duration_days: number;
  description: string;
};

export type Template = {
  key: string;
  phase?: number;
  after?: { minutes?: number; hours?: number; days?: number };
  send_at_local?: string;
  requires_reply_to?: string;
  repeat_every_days?: number;
  internal?: boolean;
  body: string;
};

export type Trigger = {
  key: string;
  condition: string;
  args?: Record<string, any>;
  only_in_phases?: number[];
  action: 'send_template' | 'flag_patient' | 'advance_phase';
  template?: string;
  reason?: string;
  dedupe_window_hours: number;
};

const CONFIG_DIR = join(process.cwd(), 'config');

function load<T>(file: string, key: string): T {
  const raw = readFileSync(join(CONFIG_DIR, file), 'utf8');
  return parse(raw)[key] as T;
}

let _phases: Phase[] | null = null;
let _templates: Template[] | null = null;
let _triggers: Trigger[] | null = null;

export function phases(): Phase[] {
  if (!_phases) _phases = load<Phase[]>('phases.yaml', 'phases');
  return _phases;
}

export function templates(): Template[] {
  if (!_templates) _templates = load<Template[]>('messages.yaml', 'templates');
  return _templates;
}

export function triggers(): Trigger[] {
  if (!_triggers) _triggers = load<Trigger[]>('triggers.yaml', 'triggers');
  return _triggers;
}

export function findTemplate(key: string): Template | undefined {
  return templates().find((t) => t.key === key);
}

export function findPhase(id: number): Phase | undefined {
  return phases().find((p) => p.id === id);
}

export function templatesForPhase(phaseId: number): Template[] {
  return templates().filter((t) => t.phase === phaseId);
}
