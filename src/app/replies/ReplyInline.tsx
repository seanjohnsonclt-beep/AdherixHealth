'use client';
import { useRef, useState, useTransition } from 'react';
import { replyAction } from './actions';

interface Props {
  patientId: string;
  toPhone: string;       // patient phone or guardian_phone depending on sender
  recipientLabel: string; // e.g. "Sarah" or "Guardian (Maria)"
}

export function ReplyInline({ patientId, toPhone, recipientLabel }: Props) {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const textRef = useRef<HTMLTextAreaElement>(null);

  function handleOpen() {
    setOpen(true);
    setSent(false);
    setError(null);
    setTimeout(() => textRef.current?.focus(), 50);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const body = textRef.current?.value?.trim();
    if (!body) return;

    const fd = new FormData();
    fd.set('patientId', patientId);
    fd.set('toPhone', toPhone);
    fd.set('body', body);

    startTransition(async () => {
      try {
        await replyAction(fd);
        setSent(true);
        setOpen(false);
        if (textRef.current) textRef.current.value = '';
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Send failed');
      }
    });
  }

  if (sent) {
    return (
      <span style={{ fontSize: 12, color: 'var(--good)', fontWeight: 500 }}>
        Sent
      </span>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={handleOpen}
        className="btn btn--ghost"
        style={{ fontSize: 12, padding: '4px 10px' }}
      >
        Reply
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 220 }}>
      <div style={{ fontSize: 11, color: 'var(--fg-muted)', marginBottom: 2 }}>
        To: {recipientLabel}
      </div>
      <textarea
        ref={textRef}
        rows={2}
        placeholder="Type your message..."
        required
        disabled={isPending}
        style={{
          width: '100%',
          fontSize: 13,
          padding: '6px 8px',
          borderRadius: 6,
          border: '1px solid var(--line-strong)',
          background: 'var(--bg-card)',
          color: 'var(--fg)',
          resize: 'vertical',
          fontFamily: 'inherit',
        }}
      />
      {error && (
        <span style={{ fontSize: 11, color: 'var(--urgent)' }}>{error}</span>
      )}
      <div style={{ display: 'flex', gap: 6 }}>
        <button
          type="submit"
          disabled={isPending}
          className="btn btn--primary"
          style={{ fontSize: 12, padding: '4px 12px' }}
        >
          {isPending ? 'Sending...' : 'Send'}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="btn btn--ghost"
          style={{ fontSize: 12, padding: '4px 10px' }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
