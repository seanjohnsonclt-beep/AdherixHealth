-- Add AI personalization tracking to messages
alter table messages
  add column if not exists ai_personalized boolean not null default false;

comment on column messages.ai_personalized is
  'True when the body was rewritten by the LLM personalization layer before send. '
  'template_key still holds the original intent for audit purposes.';
