-- Expand modality constraint to include all five Adherix product types.

ALTER TABLE clinics DROP CONSTRAINT IF EXISTS clinics_modality_check;
ALTER TABLE clinics ADD CONSTRAINT clinics_modality_check
  CHECK (modality IN ('glp1', 'bariatric', 'pharmacotherapy', 'behavioral_therapy', 'metabolic_health'));

ALTER TABLE patients DROP CONSTRAINT IF EXISTS patients_modality_check;
ALTER TABLE patients ADD CONSTRAINT patients_modality_check
  CHECK (modality IN ('glp1', 'bariatric', 'pharmacotherapy', 'behavioral_therapy', 'metabolic_health'));
