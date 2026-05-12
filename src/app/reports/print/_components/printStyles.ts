// Shared CSS string for printable reports. Inlined as a <style jsx global>
// so Next doesn't have to bundle a separate CSS file for the print routes.

export const PRINT_CSS = `
  :root {
    --pg: 48px 56px;
    --navy: #1e3a5f;
    --navy-soft: #2a4a7a;
    --fg: #0f172a;
    --fg-muted: #475569;
    --line: #e6e5df;
    --bg: #fafaf7;
  }
  * { box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, sans-serif;
    color: var(--fg);
    background: white;
    margin: 0;
    padding: 0;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .page {
    max-width: 8.5in;
    margin: 0 auto;
    padding: var(--pg);
    background: white;
    page-break-after: always;
  }
  .page:last-child { page-break-after: auto; }
  .brand {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    border-bottom: 3px solid var(--navy);
    padding-bottom: 14px;
    margin-bottom: 32px;
  }
  .brand h1 {
    font-family: Georgia, 'Times New Roman', serif;
    font-weight: 500;
    font-size: 26px;
    margin: 0;
    color: var(--navy);
    letter-spacing: -0.01em;
  }
  .brand sup { font-size: 11px; color: var(--fg-muted); }
  .brand .meta { font-size: 12px; color: var(--fg-muted); text-align: right; }
  .brand .meta .clinic { font-size: 14px; color: var(--fg); font-weight: 500; }

  h2.section {
    font-family: Georgia, serif;
    font-weight: 500;
    font-size: 16px;
    color: var(--navy);
    margin: 28px 0 12px;
    padding-bottom: 4px;
    border-bottom: 1px solid var(--line);
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .headline-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 28px;
  }
  .headline-tile {
    border: 1px solid var(--line);
    padding: 14px 16px;
    background: #fafafa;
  }
  .headline-tile .label {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--fg-muted);
    margin-bottom: 6px;
  }
  .headline-tile .value {
    font-family: Georgia, serif;
    font-size: 28px;
    color: var(--navy);
    line-height: 1;
  }
  .headline-tile .sub {
    font-size: 11px;
    color: var(--fg-muted);
    margin-top: 6px;
  }
  .headline-tile.primary {
    background: var(--navy);
    border-color: var(--navy);
  }
  .headline-tile.primary .label,
  .headline-tile.primary .value,
  .headline-tile.primary .sub {
    color: white;
  }

  table.rows {
    width: 100%;
    border-collapse: collapse;
    font-size: 12px;
  }
  table.rows th {
    text-align: left;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--fg-muted);
    font-weight: 500;
    padding: 8px 10px;
    border-bottom: 1px solid var(--line);
    background: #f5f5f0;
  }
  table.rows td {
    padding: 8px 10px;
    border-bottom: 1px solid var(--line);
    vertical-align: top;
  }
  table.rows tr:nth-child(even) td { background: #fafafa; }
  table.rows .num { text-align: right; font-variant-numeric: tabular-nums; }
  table.rows .money { color: var(--navy); font-weight: 500; }

  .footer-note {
    margin-top: 32px;
    padding-top: 14px;
    border-top: 1px solid var(--line);
    font-size: 10px;
    color: var(--fg-muted);
    line-height: 1.5;
  }

  .risk-bar {
    display: flex;
    height: 14px;
    border: 1px solid var(--line);
    overflow: hidden;
    margin-top: 8px;
  }
  .risk-bar > div { height: 100%; }
  .risk-good { background: #4a7c5c; }
  .risk-warn { background: #c2953a; }
  .risk-urgent { background: #a04545; }
  .risk-legend { display: flex; gap: 16px; margin-top: 8px; font-size: 11px; color: var(--fg-muted); }
  .risk-legend span::before {
    content: '';
    display: inline-block;
    width: 9px; height: 9px; margin-right: 6px;
    vertical-align: middle;
  }
  .risk-legend .good::before { background: #4a7c5c; }
  .risk-legend .warn::before { background: #c2953a; }
  .risk-legend .urgent::before { background: #a04545; }

  .print-hint {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--navy);
    color: white;
    padding: 8px 16px;
    font-size: 12px;
    border-radius: 2px;
    z-index: 100;
  }
  @media print {
    .print-hint { display: none; }
    .page { padding: 0.5in 0.6in; }
  }

  @page {
    size: letter;
    margin: 0.5in;
  }
`;
