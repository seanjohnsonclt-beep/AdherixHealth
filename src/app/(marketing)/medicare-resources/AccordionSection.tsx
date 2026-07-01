'use client';
import { useState } from 'react';

const ITEMS = [
  {
    title: 'Prior authorization',
    icon: (
      <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
        <rect x="3" y="2" width="16" height="18" rx="2" stroke="currentColor" strokeWidth="1.6"/>
        <path d="M7 8h8M7 12h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    ),
    body: "PAs are submitted to a single central processor - not the patient's Part D plan. CMS accepts requests electronically or by fax. The PA form is being released June 2026.",
  },
  {
    title: 'Patient eligibility',
    icon: (
      <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="8" r="4" stroke="currentColor" strokeWidth="1.6"/>
        <path d="M4 19c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    ),
    body: 'Patients must be enrolled in Medicare Part D (PDP or MA-PD). They must meet BMI thresholds and have at least one qualifying condition: heart failure, hypertension, CKD, pre-diabetes, or cardiovascular history.',
  },
  {
    title: 'Provider attestation',
    icon: (
      <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
        <path d="M4 10l4 4 8-8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    body: 'The PA must attest that the drug is prescribed for weight reduction in combination with ongoing lifestyle modification - structured nutrition and physical activity per FDA labeling.',
  },
  {
    title: 'Covered medications',
    icon: (
      <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
        <path d="M4 6h14M4 10h10M4 14h7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    ),
    body: 'Wegovy (injection and tablets), Zepbound KwikPen, and Foundayo are covered under the Bridge for weight management. $50 copay per month. Does not count toward Part D out-of-pocket limits.',
  },
];

export default function AccordionSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="med-accordion">
      {ITEMS.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={i} className={`med-accordion__item${isOpen ? ' med-accordion__item--open' : ''}`}>
            <button
              className="med-accordion__trigger"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : i)}
              type="button"
            >
              <span className="med-accordion__icon" aria-hidden="true">{item.icon}</span>
              <span className="med-accordion__title">{item.title}</span>
              <span className="med-accordion__chevron" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            </button>
            {isOpen && (
              <div className="med-accordion__body">
                <p>{item.body}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
