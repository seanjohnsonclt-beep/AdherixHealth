'use client';

import { useState } from 'react';
import {
  advancePhaseAction,
  toggleFlagAction,
  dischargePatientAction,
  removePatientAction,
  updatePatientAction,
  pausePatientAction,
  resumePatientAction,
  reactivatePatientAction,
} from '@/app/patients/actions';

type Props = {
  patientId: string;
  firstName: string | null;
  phone: string;
  status: string;
  currentPhase: number;
  isLastPhase: boolean;
};

export function PatientActions({ patientId, firstName, phone, status, currentPhase, isLastPhase }: Props) {
  const [showEdit, setShowEdit] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const isFlagged = status === 'flagged';
  const isChurned = status === 'churned';
  const isPaused = status === 'paused';

  return (
    <div>
      {/* Action buttons row */}
      <div className="actions" style={{ justifyContent: 'flex-end' }}>
        <button
          onClick={() => setShowEdit(!showEdit)}
          className="btn ghost"
          title="Edit this patient's name or phone number"
        >
          {showEdit ? 'Cancel edit' : 'Edit'}
        </button>

        {!isLastPhase && !isChurned && (
          <form action={advancePhaseAction}>
            <input type="hidden" name="patient_id" value={patientId} />
            <button type="submit" className="btn ghost"
              title="Manually move this patient to the next clinical phase ahead of schedule">
              Advance phase
            </button>
          </form>
        )}

        {!isChurned && (
          <form action={toggleFlagAction}>
            <input type="hidden" name="patient_id" value={patientId} />
            <button type="submit" className={`btn ${isFlagged ? '' : 'danger'}`}
              title={isFlagged
                ? 'Remove the flag and return this patient to active status'
                : 'Flag for manual clinic follow-up — pauses automated messages'}>
              {isFlagged ? 'Un-flag' : 'Flag'}
            </button>
          </form>
        )}

        {!isChurned && !isPaused && (
          <form action={pausePatientAction}>
            <input type="hidden" name="patient_id" value={patientId} />
            <button type="submit" className="btn ghost"
              title="Temporarily stop outbound messages — scheduled messages wait until you resume. Use for vacation or mid-care gaps.">
              Pause
            </button>
          </form>
        )}

        {isPaused && (
          <form action={resumePatientAction}>
            <input type="hidden" name="patient_id" value={patientId} />
            <button type="submit" className="btn"
              title="Resume sending — scheduled messages will begin firing again on the next engine tick.">
              Resume
            </button>
          </form>
        )}

        {isChurned && (
          <form action={reactivatePatientAction}>
            <input type="hidden" name="patient_id" value={patientId} />
            <button type="submit" className="btn"
              title="Move this discharged patient back to active. Phase plan stays where it was; advance manually if needed.">
              Reactivate
            </button>
          </form>
        )}

        {!isChurned && (
          <form action={dischargePatientAction}>
            <input type="hidden" name="patient_id" value={patientId} />
            <button type="submit" className="btn ghost"
              title="Mark as discharged — stops all future messages but keeps their history in Reports for retention analytics">
              Discharge
            </button>
          </form>
        )}

        <button
          onClick={() => setShowConfirm(true)}
          className="btn ghost"
          style={{ color: 'var(--accent)', borderColor: 'var(--accent)' }}
          title="Permanently delete this patient and all their message history. Cannot be undone."
        >
          Remove
        </button>
      </div>

      {/* Confirm remove dialog */}
      {showConfirm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 100,
        }}>
          <div style={{
            background: 'white', border: '1px solid var(--line)',
            padding: '32px 36px', maxWidth: 400, width: '100%',
          }}>
            <h3 style={{ marginBottom: 12 }}>Remove patient?</h3>
            <p style={{ fontSize: 14, color: 'var(--fg-muted)', lineHeight: 1.6, marginBottom: 24 }}>
              This permanently deletes <strong>{firstName || 'this patient'}</strong> and all their
              message history. It cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowConfirm(false)}
                className="btn ghost"
              >
                Cancel
              </button>
              <form action={removePatientAction}>
                <input type="hidden" name="patient_id" value={patientId} />
                <button type="submit" className="btn danger">Yes, remove permanently</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Inline edit form */}
      {showEdit && (
        <form action={updatePatientAction} style={{
          marginTop: 16,
          display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap',
          padding: '20px', background: 'white', border: '1px solid var(--line)',
        }}>
          <input type="hidden" name="patient_id" value={patientId} />
          <div style={{ flex: 1, minWidth: 160 }}>
            <label className="label">First name</label>
            <input
              className="input"
              name="first_name"
              defaultValue={firstName ?? ''}
              placeholder="First name"
              style={{ marginTop: 4 }}
            />
          </div>
          <div style={{ flex: 1, minWidth: 180 }}>
            <label className="label">Phone</label>
            <input
              className="input"
              name="phone"
              defaultValue={phone}
              placeholder="+15551234567"
              style={{ marginTop: 4 }}
            />
          </div>
          <button type="submit" className="btn"
            title="Save changes to this patient's name and phone number"
            style={{ flexShrink: 0 }}>
            Save changes
          </button>
        </form>
      )}
    </div>
  );
}
