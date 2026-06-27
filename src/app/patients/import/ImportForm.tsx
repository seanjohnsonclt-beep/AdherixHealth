'use client';

import { useState, useRef } from 'react';
import { importPatientsAction, ImportRow, ImportResult } from '@/app/patients/actions';

/**
 * Patient import  -  CSV or PDF.
 *
 * Flow:
 *   1. Upload   -  drop a CSV or PDF roster
 *   2. Preview  -  editable table of parsed rows; add/remove before confirming
 *   3. Results  -  enrolled / skipped / error per row with links to patient records
 *
 * CSV expected columns (header row required, order flexible):
 *   first_name, phone, medication*, starting_dose*, supply_quantity*
 *   (* optional)
 *
 * PDF  -  best-effort extraction: looks for US phone patterns and nearby names.
 *       User can edit any row in the preview before submitting.
 */

type ParsedRow = ImportRow & { _id: number };
type Step = 'select-product' | 'upload' | 'preview' | 'results';

// --- CSV parser ---------------------------------------------------------------

function parseCSV(text: string): ParsedRow[] {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, '_'));

  const col = (row: string[], key: string): string => {
    const idx = headers.indexOf(key);
    return idx >= 0 ? (row[idx] || '').trim() : '';
  };

  return lines.slice(1).map((line, i) => {
    // Handle quoted fields naively
    const cells = line.split(',');
    const supplyRaw = col(cells, 'supply_quantity');
    return {
      _id: i,
      first_name: col(cells, 'first_name') || col(cells, 'name'),
      phone: col(cells, 'phone') || col(cells, 'phone_number') || col(cells, 'mobile'),
      medication: col(cells, 'medication') || undefined,
      starting_dose: col(cells, 'starting_dose') || col(cells, 'dose') || undefined,
      supply_quantity: supplyRaw ? parseInt(supplyRaw, 10) || undefined : undefined,
      date_of_birth: col(cells, 'date_of_birth') || col(cells, 'dob') || undefined,
      state: col(cells, 'state') || undefined,
      guardian_name: col(cells, 'guardian_name') || col(cells, 'parent_name') || undefined,
      guardian_phone: col(cells, 'guardian_phone') || col(cells, 'parent_phone') || undefined,
    };
  }).filter(r => r.phone);
}

// --- Component ----------------------------------------------------------------

export function ImportForm() {
  const [step, setStep] = useState<Step>('select-product');
  const [modality, setModality] = useState('glp1');
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [results, setResults] = useState<ImportResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  let nextId = useRef(0);

  // -- File handling ----------------------------------------------------------

  async function handleFile(file: File) {
    setError('');
    setLoading(true);

    try {
      if (file.name.endsWith('.csv') || file.type === 'text/csv') {
        const text = await file.text();
        const parsed = parseCSV(text);
        if (!parsed.length) { setError('No valid rows found. Check the CSV has a header row and a phone column.'); setLoading(false); return; }
        setRows(parsed.map(r => ({ ...r, _id: nextId.current++ })));
        setStep('preview');
      } else {
        // PDF  -  send to server for extraction
        const form = new FormData();
        form.append('file', file);
        const res = await fetch('/api/patients/parse-import', { method: 'POST', body: form });
        const data = await res.json();
        if (!res.ok || data.error) { setError(data.error || 'Could not parse PDF.'); setLoading(false); return; }
        const parsed: ParsedRow[] = (data.rows || []).map((r: ImportRow) => ({ ...r, _id: nextId.current++ }));
        if (!parsed.length) { setError('No phone numbers found in the PDF. Try CSV instead.'); setLoading(false); return; }
        setRows(parsed);
        setStep('preview');
      }
    } catch {
      setError('Failed to read file.');
    } finally {
      setLoading(false);
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  // -- Row editing ------------------------------------------------------------

  function updateRow(id: number, field: keyof ImportRow, value: string) {
    setRows(prev => prev.map(r => r._id === id ? { ...r, [field]: value } : r));
  }

  function removeRow(id: number) {
    setRows(prev => prev.filter(r => r._id !== id));
  }

  function addRow() {
    setRows(prev => [...prev, { _id: nextId.current++, first_name: '', phone: '', medication: '', starting_dose: '' }]);
  }

  // -- Confirm import ---------------------------------------------------------

  async function confirm() {
    setLoading(true);
    try {
      const clean: ImportRow[] = rows.map(r => ({
        first_name: r.first_name,
        phone: r.phone,
        medication: r.medication || undefined,
        starting_dose: r.starting_dose || undefined,
        supply_quantity: r.supply_quantity || undefined,
      }));
      const res = await importPatientsAction(clean, modality);
      setResults(res);
      setStep('results');
    } catch {
      setError('Import failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // -- Download template ------------------------------------------------------

  function downloadTemplate() {
    const isQuest = modality === 'quest';
    const csv = isQuest
      ? 'first_name,phone,date_of_birth,state,guardian_name,guardian_phone\nJane Smith,5551234567,2012-03-15,WA,Mary Smith,5557654321\n'
      : 'first_name,phone,medication,starting_dose,supply_quantity\nJane Smith,5551234567,semaglutide,0.25mg,4\nJohn Doe,5559876543,,,\n';
    const a = document.createElement('a');
    a.href = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;
    a.download = `adherix-${modality}-import-template.csv`;
    a.click();
  }

  // --- Render ---------------------------------------------------------------

  const PRODUCTS = [
    { value: 'glp1',            label: 'Adherix Keep',      sub: 'GLP-1 medication programs' },
    { value: 'bariatric',       label: 'Adherix Bridge',    sub: 'Bariatric surgery programs' },
    { value: 'metabolic_health',label: 'Adherix Metabolic', sub: 'Metabolic health programs' },
    { value: 'glp1_gauge',      label: 'Adherix Gauge',     sub: 'Scale tracking add-on' },
    { value: 'quest',           label: 'Adherix Quest',     sub: 'Pediatric & adolescent programs' },
  ];

  const StepBreadcrumb = ({ current }: { current: 1 | 2 }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 28 }}>
      {([{ n: 1, label: 'Select product' }, { n: 2, label: 'Upload patient list' }] as const).map((s, i) => (
        <div key={s.n} style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 26, height: 26, borderRadius: '50%', display: 'flex',
              alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700,
              background: current >= s.n ? '#5B9B94' : 'rgba(0,0,0,0.08)',
              color: current >= s.n ? '#fff' : 'var(--fg-muted,#999)',
            }}>{s.n}</div>
            <span style={{
              fontSize: 13,
              color: current === s.n ? 'var(--fg,#1F2A2A)' : 'var(--fg-muted,#999)',
              fontWeight: current === s.n ? 600 : 400,
            }}>{s.label}</span>
          </div>
          {i === 0 && <div style={{ width: 36, height: 1, background: 'rgba(0,0,0,0.12)', margin: '0 10px' }} />}
        </div>
      ))}
    </div>
  );

  if (step === 'select-product') {
    return (
      <div className="import-wrap">
        <StepBreadcrumb current={1} />
        <h2 style={{ fontSize: 17, fontWeight: 600, marginBottom: 6, color: 'var(--fg,#1F2A2A)' }}>
          Which product is this patient list for?
        </h2>
        <p style={{ fontSize: 14, color: 'var(--fg-muted,#666)', marginBottom: 24 }}>
          This sets the message program each patient will be enrolled in.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 10, marginBottom: 32 }}>
          {PRODUCTS.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { setModality(opt.value); setStep('upload'); }}
              style={{
                padding: '14px 18px', borderRadius: 8,
                border: '1.5px solid rgba(0,0,0,0.10)', background: '#fff',
                color: 'var(--fg,#1F2A2A)', cursor: 'pointer', textAlign: 'left' as const,
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#5B9B94'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(0,0,0,0.10)'; }}
            >
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 3 }}>{opt.label}</div>
              <div style={{ fontSize: 12, color: 'var(--fg-muted,#888)' }}>{opt.sub}</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (step === 'upload') {
    const isQuest = modality === 'quest';
    const selectedProduct = PRODUCTS.find(p => p.value === modality);
    return (
      <div className="import-wrap">
        <StepBreadcrumb current={2} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <div style={{
            padding: '5px 12px', borderRadius: 6,
            background: 'rgba(91,155,148,0.1)', border: '1px solid rgba(91,155,148,0.3)',
            fontSize: 13, fontWeight: 600, color: '#3D7670',
          }}>{selectedProduct?.label}</div>
          <button type="button" onClick={() => setStep('select-product')}
            style={{ fontSize: 13, color: 'var(--fg-muted,#888)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
            Change product
          </button>
        </div>

        {isQuest && (
          <p style={{ fontSize: 13, color: 'var(--fg-muted,#888)', marginBottom: 16, padding: '10px 14px', background: 'rgba(91,155,148,0.08)', borderRadius: 6, border: '1px solid rgba(91,155,148,0.2)' }}>
            Quest CSV columns required: <code>first_name</code>, <code>phone</code>, <code>date_of_birth</code>, <code>state</code>, <code>guardian_name</code>, <code>guardian_phone</code>
          </p>
        )}

        <div
          className={`import-drop${loading ? ' import-drop--loading' : ''}`}
          onDrop={onDrop}
          onDragOver={e => e.preventDefault()}
          onClick={() => fileRef.current?.click()}
        >
          <input ref={fileRef} type="file" accept=".csv,.pdf" style={{ display: 'none' }} onChange={onPick} />
          {loading ? (
            <p className="import-drop__hint">Parsing…</p>
          ) : (
            <>
              <div className="import-drop__icon">↑</div>
              <p className="import-drop__label">Drop a CSV or PDF roster here</p>
              <p className="import-drop__hint">or click to browse</p>
            </>
          )}
        </div>

        {error && <p className="import-error">{error}</p>}

        <div className="import-meta">
          <p>
            <strong>CSV format:</strong> columns <code>first_name</code>, <code>phone</code> (required) · <code>medication</code>, <code>starting_dose</code>, <code>supply_quantity</code> (optional).
          </p>
          <p>
            <strong>PDF:</strong> We extract US phone numbers and nearby names automatically. You&rsquo;ll review before confirming.
          </p>
          <button className="import-template-btn" type="button" onClick={downloadTemplate}>
            Download CSV template
          </button>
        </div>
      </div>
    );
  }

  if (step === 'preview') {
    const enrolled = rows.filter(r => r.phone).length;
    return (
      <div className="import-wrap">
        <div className="import-preview-head">
          <div>
            <h2 className="import-preview-title">{enrolled} patient{enrolled !== 1 ? 's' : ''} ready to import</h2>
            <p className="import-preview-sub">Review and edit before confirming. Duplicates will be skipped automatically.</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn--ghost" onClick={() => { setStep('select-product'); setRows([]); setError(''); }}>
              Start over
            </button>
            <button className="btn" onClick={confirm} disabled={loading || rows.length === 0}>
              {loading ? 'Importing…' : `Confirm import`}
            </button>
          </div>
        </div>

        {error && <p className="import-error">{error}</p>}

        <div className="import-table-wrap">
          <table className="import-table">
            <thead>
              <tr>
                <th>First name</th>
                <th>Phone</th>
                {modality !== 'quest' && <><th>Medication</th><th>Starting dose</th></>}
                {modality === 'quest' && <><th>DOB</th><th>State</th><th>Guardian name</th><th>Guardian phone</th></>}
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r._id}>
                  <td>
                    <input
                      className="import-cell-input"
                      value={r.first_name}
                      placeholder="First name"
                      onChange={e => updateRow(r._id, 'first_name', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      className="import-cell-input"
                      value={r.phone}
                      placeholder="Phone"
                      onChange={e => updateRow(r._id, 'phone', e.target.value)}
                    />
                  </td>
                  {modality !== 'quest' && (
                    <>
                      <td>
                        <input className="import-cell-input" value={r.medication || ''} placeholder="e.g. semaglutide"
                          onChange={e => updateRow(r._id, 'medication', e.target.value)} />
                      </td>
                      <td>
                        <input className="import-cell-input" value={r.starting_dose || ''} placeholder="e.g. 0.25mg"
                          onChange={e => updateRow(r._id, 'starting_dose', e.target.value)} />
                      </td>
                    </>
                  )}
                  {modality === 'quest' && (
                    <>
                      <td>
                        <input className="import-cell-input" value={(r as any).date_of_birth || ''} placeholder="YYYY-MM-DD"
                          onChange={e => updateRow(r._id, 'date_of_birth' as any, e.target.value)} />
                      </td>
                      <td>
                        <input className="import-cell-input" value={(r as any).state || ''} placeholder="WA" maxLength={2}
                          onChange={e => updateRow(r._id, 'state' as any, e.target.value)} />
                      </td>
                      <td>
                        <input className="import-cell-input" value={(r as any).guardian_name || ''} placeholder="Guardian name"
                          onChange={e => updateRow(r._id, 'guardian_name' as any, e.target.value)} />
                      </td>
                      <td>
                        <input className="import-cell-input" value={(r as any).guardian_phone || ''} placeholder="(555) 123-4567"
                          onChange={e => updateRow(r._id, 'guardian_phone' as any, e.target.value)} />
                      </td>
                    </>
                  )}
                  <td>
                    <button className="import-remove-btn" onClick={() => removeRow(r._id)} title="Remove row">✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button className="import-add-btn" onClick={addRow}>+ Add row</button>
      </div>
    );
  }

  // Results
  const enrolled = results.filter(r => r.status === 'enrolled');
  const skipped  = results.filter(r => r.status === 'skipped');
  const errors   = results.filter(r => r.status === 'error');

  return (
    <div className="import-wrap">
      <div className="import-results-summary">
        <div className="import-results-stat import-results-stat--good">
          <span className="import-results-stat__n">{enrolled.length}</span>
          <span className="import-results-stat__l">Enrolled</span>
        </div>
        <div className="import-results-stat import-results-stat--warn">
          <span className="import-results-stat__n">{skipped.length}</span>
          <span className="import-results-stat__l">Skipped (duplicates)</span>
        </div>
        {errors.length > 0 && (
          <div className="import-results-stat import-results-stat--err">
            <span className="import-results-stat__n">{errors.length}</span>
            <span className="import-results-stat__l">Errors</span>
          </div>
        )}
      </div>

      <div className="import-table-wrap">
        <table className="import-table">
          <thead>
            <tr>
              <th>Patient</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r, i) => (
              <tr key={i} className={`import-result-row import-result-row--${r.status}`}>
                <td>{r.row.first_name || ' - '}</td>
                <td>{r.row.phone}</td>
                <td>
                  <span className={`import-badge import-badge--${r.status}`}>
                    {r.status === 'enrolled' ? 'Enrolled' : r.status === 'skipped' ? 'Skipped' : 'Error'}
                  </span>
                </td>
                <td>
                  {r.status === 'enrolled' && r.patientId
                    ? <a href={`/patients/${r.patientId}`} className="import-patient-link">View patient →</a>
                    : <span style={{ fontSize: 13, color: 'var(--fg-muted)' }}>{r.reason || ''}</span>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 24, display: 'flex', gap: 8 }}>
        <a href="/dashboard" className="btn">Back to dashboard</a>
        <button className="btn btn--ghost" onClick={() => { setStep('select-product'); setRows([]); setResults([]); }}>
          Import more
        </button>
      </div>
    </div>
  );
}
