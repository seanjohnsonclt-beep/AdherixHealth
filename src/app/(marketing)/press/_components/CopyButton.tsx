'use client';

import { useState } from 'react';

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <button
      className="press-copy-btn"
      onClick={handleCopy}
      aria-label="Copy boilerplate text"
    >
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}
