-- Expand modality constraint to include future product types.
-- pharmacotherapy and behavioral_therapy are not yet engine-backed
-- but can be assigned to patients for roadmap tracking.

ALTER TABLE clinics DROP CONSTRAINT IF EXISTS clinics_modality_check;
ALTER TABLE clinics ADD CONSTRAINT clinics_modality_check
  CHECK (modality IN ('glp1', 'bariatric', 'pharmacotherapy', 'behavioral_therapy'));

ALTER TABLE patients DROP CONSTRAINT IF EXISTS patients_modality_check;
ALTER TABLE patients ADD CONSTRAINT patients_modality_check
  CHECK (modality IN ('glp1', 'bariatric', 'pharmacotherapy', 'behavioral_therapy'));
