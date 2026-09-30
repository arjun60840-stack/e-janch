-- ==============================================================================
-- E-JAANCH: DIGITAL FIELD TEST DOCUMENTATION SYSTEM
-- Supabase PostgreSQL Database Schema & Migrations
-- Version: 2.0.0
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. PROFILES / OPERATORS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    operator_id TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    operator_name TEXT,
    operator_age INTEGER,
    signature_url TEXT,
    preferred_language TEXT DEFAULT 'en',
    department TEXT DEFAULT 'Traffic & Narcotics Inspection Squad',
    badge_number TEXT,
    role TEXT DEFAULT 'field_operator' CHECK (role IN ('field_operator', 'senior_examiner', 'supervisor', 'admin')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 2. TESTS TABLE (Field-Test Records)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_id TEXT UNIQUE NOT NULL,
    operator_id TEXT NOT NULL,
    operator_name TEXT,
    operator_age INTEGER,
    kit_type TEXT NOT NULL DEFAULT 'STANDARD_NARCOTIC',
    test_type TEXT NOT NULL DEFAULT 'Reagent Assay',
    detected_drug TEXT DEFAULT 'None Detected',
    state TEXT,
    vehicle_number TEXT NOT NULL DEFAULT 'UNSPECIFIED',
    sample_type TEXT NOT NULL DEFAULT 'Saliva',
    result TEXT NOT NULL CHECK (result IN ('POSITIVE', 'NEGATIVE', 'INCONCLUSIVE', 'INVALID_IMAGE')),
    confidence NUMERIC(5, 2) NOT NULL CHECK (confidence >= 0 AND confidence <= 100),
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    location_accuracy NUMERIC(8, 2),
    location_status TEXT DEFAULT 'AVAILABLE',
    tested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    image_url TEXT NOT NULL,
    image_hash TEXT NOT NULL,
    record_hash TEXT NOT NULL,
    signature TEXT NOT NULL,
    signature_url TEXT,
    calibration_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    colour_values JSONB NOT NULL DEFAULT '{}'::jsonb,
    quality_score TEXT NOT NULL CHECK (quality_score IN ('GOOD', 'ACCEPTABLE', 'POOR', 'INVALID')),
    reason TEXT,
    app_version TEXT NOT NULL DEFAULT '1.0.0',
    is_demo BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for high-performance lookup & filtering
CREATE INDEX IF NOT EXISTS idx_tests_test_id ON public.tests (test_id);
CREATE INDEX IF NOT EXISTS idx_tests_vehicle_number ON public.tests (vehicle_number);
CREATE INDEX IF NOT EXISTS idx_tests_kit_type ON public.tests (kit_type);
CREATE INDEX IF NOT EXISTS idx_tests_sample_type ON public.tests (sample_type);
CREATE INDEX IF NOT EXISTS idx_tests_operator_id ON public.tests (operator_id);
CREATE INDEX IF NOT EXISTS idx_tests_result ON public.tests (result);
CREATE INDEX IF NOT EXISTS idx_tests_tested_at ON public.tests (tested_at DESC);
CREATE INDEX IF NOT EXISTS idx_tests_is_demo ON public.tests (is_demo);
CREATE INDEX IF NOT EXISTS idx_tests_detected_drug ON public.tests (detected_drug);
CREATE INDEX IF NOT EXISTS idx_tests_state ON public.tests (state);

-- ------------------------------------------------------------------------------
-- 3. AUDIT LOGS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id TEXT NOT NULL,
    operator_id TEXT NOT NULL,
    event_type TEXT NOT NULL CHECK (event_type IN (
        'LOGIN', 
        'LOGOUT', 
        'TEST_STARTED',
        'IMAGE_CAPTURED',
        'RESULT_GENERATED',
        'IMAGE_UPLOADED',
        'RECORD_CREATED', 
        'RECORD_VERIFIED', 
        'RECORD_TAMPER_DETECTED'
    )),
    test_id TEXT,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_test_id ON public.audit_logs (test_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON public.audit_logs (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_operator ON public.audit_logs (operator_id);

-- ------------------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: Authenticated users can view profiles, users can edit their own profile
CREATE POLICY "Users can read profiles" 
    ON public.profiles FOR SELECT 
    TO authenticated 
    USING (true);

CREATE POLICY "Users can update own profile" 
    ON public.profiles FOR UPDATE 
    TO authenticated 
    USING (auth.uid() = id);

-- Tests:
CREATE POLICY "Authenticated users can read test records" 
    ON public.tests FOR SELECT 
    TO authenticated 
    USING (true);

CREATE POLICY "Public can verify test record by test_id" 
    ON public.tests FOR SELECT 
    TO anon 
    USING (true);

CREATE POLICY "Authenticated operators can insert test records" 
    ON public.tests FOR INSERT 
    TO authenticated, anon 
    WITH CHECK (true);

-- Audit Logs:
CREATE POLICY "Authenticated users can insert audit logs" 
    ON public.audit_logs FOR INSERT 
    TO authenticated, anon 
    WITH CHECK (true);

CREATE POLICY "Authenticated users can read audit logs" 
    ON public.audit_logs FOR SELECT 
    TO authenticated 
    USING (true);

-- ------------------------------------------------------------------------------
-- 5. STORAGE BUCKET CONFIGURATION (Supabase Storage)
-- ------------------------------------------------------------------------------
-- Bucket 1: test-images
INSERT INTO storage.buckets (id, name, public)
VALUES ('test-images', 'test-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

CREATE POLICY "Public read for test images" 
    ON storage.objects FOR SELECT 
    USING (bucket_id = 'test-images');

CREATE POLICY "Allow upload test images" 
    ON storage.objects FOR INSERT 
    TO authenticated, anon 
    WITH CHECK (bucket_id = 'test-images');

-- Bucket 2: operator-signatures
INSERT INTO storage.buckets (id, name, public)
VALUES ('operator-signatures', 'operator-signatures', true)
ON CONFLICT (id) DO UPDATE SET public = true;

CREATE POLICY "Public read for operator signatures" 
    ON storage.objects FOR SELECT 
    USING (bucket_id = 'operator-signatures');

CREATE POLICY "Allow upload operator signatures" 
    ON storage.objects FOR INSERT 
    TO authenticated, anon 
    WITH CHECK (bucket_id = 'operator-signatures');
