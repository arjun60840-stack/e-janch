-- ==============================================================================
-- E-JAANCH: Migration 002
-- Adds detected_drug and state columns to existing tests table
-- Run this if you already applied 001_initial_schema.sql
-- ==============================================================================

-- Add detected_drug column (auto-classified substance name, or 'None Detected')
ALTER TABLE public.tests
  ADD COLUMN IF NOT EXISTS detected_drug TEXT DEFAULT 'None Detected';

-- Add state column (Indian state name inferred from GPS coordinates)
ALTER TABLE public.tests
  ADD COLUMN IF NOT EXISTS state TEXT;

-- Add indexes for new columns
CREATE INDEX IF NOT EXISTS idx_tests_detected_drug ON public.tests (detected_drug);
CREATE INDEX IF NOT EXISTS idx_tests_state ON public.tests (state);

-- Update existing demo records with approximate values (optional)
UPDATE public.tests
  SET detected_drug = 'None Detected'
  WHERE detected_drug IS NULL;
