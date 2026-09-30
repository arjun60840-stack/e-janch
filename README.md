# E-Jaanch (ई-जाँच): Digital Field Test Documentation System

> **Statutory Scientific Disclaimer**:
> *“E-Jaanch provides a presumptive field-test result based on image analysis of a colorimetric test. It does not replace laboratory confirmatory testing.”*

E-Jaanch is a production-quality, mobile-first full-stack web application designed for field officers, forensic technicians, environmental inspectors, and law enforcement personnel. It standardizes colorimetric chemical field-kit assays (e.g., Cobalt Thiocyanate, Marquis, Ehrlich, Scott reagent, water safety test strips) using reference-card photometric calibration, deterministic CIELAB colorimetry, and cryptographic SHA-256 tamper-evident digital sealing.

---

## Key Features

1. **Camera-Only Field Scanning Workflow**:
   - Browser Camera API (`getUserMedia`) with dynamic reticle HUD overlays.
   - Dual alignment frames for the reference colour card and the chemical reaction well.
   - Front/rear camera switcher, shutter capture, and retake controls.
   - **No file upload** — captures must originate directly from the device camera in the field.
   - Built-in Hackathon Demo Mode with realistic simulated colorimetric field kits.

2. **Automated Substance Classification (No Manual Selection)**:
   - Operators do **not** manually choose suspected narcotics (Opium, Heroin, Cocaine, etc.).
   - Multi-drug color matching pipeline evaluates calibrated sample against the entire kit reagent panel using CIELAB \(\Delta E_{ab}\) distance.
   - Automatically identifies the closest matching substance when presumptive result is POSITIVE.

3. **Interactive India Drug Detection Map**:
   - Interactive SVG choropleth visualization of India on the main dashboard.
   - State-wise aggregated positive detection counts with color intensity shading:
     - 0 / No data: Slate (#E2E8F0)
     - Low: Light Saffron (#FFD9A6)
     - Medium: Saffron (#FF9933)
     - High: Dark Navy (#0B1F3A)
   - Interactive state selection and hover tooltips showing Total Tests, Positive, Negative, and Inconclusive counts.
   - Click a state to filter regional trends and statistics.

4. **Regional Detection Trends Line Chart (Recharts)**:
   - Dynamic trend visualization showing Positive, Negative, and Inconclusive results over time.
   - Interactive filters: Time Period (Last 7 Days, Last 30 Days, Last 90 Days, All Time) and State selection.
   - Linked bidirectionally with the India Map.

5. **GPS-Based State Inference (`lib/geo/india-states.ts`)**:
   - Inferred Indian state based on bounding boxes with centroid distance tiebreaking.
   - Real GPS captured via `navigator.geolocation.getCurrentPosition()`.

6. **Photometric Calibration Engine (`lib/image-analysis/`)**:
   - 3-Patch Reference Card Sampling (95% White, 18% Neutral Gray, 3% Black).
   - Von Kries Chromatic Adaptation & White-Point Gain Normalization (\(k_R, k_G, k_B\)).
   - Eliminates color distortions caused by outdoor sunlight, shade, or warm incandescent bulbs.

7. **Cryptographic Tamper-Evident Record**:
   - **Image SHA-256**: Calculated directly over raw image binary data using Web Crypto API.
   - **Canonical Metadata Hash**: Deterministic, alphabetically sorted JSON canonicalization (RFC 8785).
   - **Server-Side HMAC-SHA256 Signature**: Digitally signed using a secure server secret via `/api/records/sign` (private keys are never exposed to the client).
   - Real-time tamper verification on the test dossier and public verification portal.

8. **Bilingual Support (English / हिंदी)**:
   - Complete bilingual UI with persistent language preference via `LanguageContext` and `localStorage`.
   - Comprehensive dictionary covering all UI labels, disclaimers, map data, and dossier records.

---

## Tech Stack & Design Identity

- **Framework**: Next.js 16+ (App Router) with TypeScript & Turbopack
- **Styling**: Tailwind CSS v4 (Custom **White, Indian Saffron `#FF7722`, and Navy Dark Blue `#0A1E3F`** Theme with Gold Trim)
- **Official Emblem**: Integrated Traffic Police Alcohol & Drug Test circular badge (`/e-jaanch-emblem.jpg`)
- **Icons**: Lucide React
- **Backend & DB**: Supabase (PostgreSQL, Row Level Security, Storage Buckets, Auth)
- **Cryptography**: Web Crypto API (Client SHA-256) & Node.js `crypto` (Server HMAC-SHA256)
- **Hardware APIs**: Browser Camera API (`getUserMedia`) & Geolocation API (`getCurrentPosition`)

---

## Getting Started

### 1. Prerequisites
- **Node.js**: v18.17.0+ or v20+ (Node.js LTS recommended)
- **npm** or **pnpm** or **yarn**

### 2. Installing Dependencies
Clone the repository and install packages:
```bash
cd e-jaanch
npm install
```

### 3. Setting Up Supabase

#### A. Create a Supabase Project
1. Log in to [supabase.com](https://supabase.com) and create a new project.
2. Note your **Project URL** and **Anon API Key** under **Project Settings > API**.
3. Note your **Service Role Key** (keep this confidential).

#### B. Run Database Migrations
1. In the Supabase Dashboard, open the **SQL Editor**.
2. Open the file `supabase/migrations/001_initial_schema.sql` from this repository.
3. Paste its contents into the SQL Editor and click **Run**.
   - This creates:
     - `profiles` table
     - `tests` table (with indexes on `test_id`, `operator_id`, `result`, `tested_at`)
     - `audit_logs` table
     - Row Level Security (RLS) policies
     - Public storage bucket `test-images`

#### C. Verify Storage Bucket
- Navigate to **Storage** in the Supabase sidebar.
- Ensure the bucket `test-images` exists and is marked **Public**.

#### D. Configure Authentication
- Under **Authentication > Providers**, ensure **Email** provider is enabled.
- (Optional) Disable "Confirm email" for immediate operator account provisioning.

### 4. Setting Environment Variables

Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Fill in your actual project values:
```env
# Supabase Public API (Browser accessible)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Server-Side Only Secrets (Never exposed to frontend bundle)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
RECORD_SIGNING_SECRET=generate_a_secure_random_hex_string_for_hmac_signing_2026

# App Version
NEXT_PUBLIC_APP_VERSION=1.0.0
```

> **Note**: If you run the app with placeholder Supabase credentials, E-Jaanch automatically runs in high-fidelity local evaluation mode, persisting records to browser storage and signing via the local server HMAC API route.

### 5. Running Locally
Start the Next.js development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Deploying to Vercel

1. Push this repository to GitHub or GitLab.
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import the `e-jaanch` repository.
4. In the **Environment Variables** section, configure:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `RECORD_SIGNING_SECRET`
   - `NEXT_PUBLIC_APP_VERSION`
5. Click **Deploy**. Vercel will build the Next.js application and deploy it globally with serverless edge routes.

---

## End-to-End Acceptance Test Walkthrough

Follow this verification flow to validate all requirements:

1. **Login (`/login`)**:
   - Click one of the quick demo operator buttons (e.g. `OP-DEL-8921` - Inspector Rajesh Kumar) or enter credentials.
   - Confirm seamless authentication and redirection to `/dashboard`.

2. **Dashboard (`/dashboard`)**:
   - Observe live KPI summary counters: Total Documented, Presumptive Positive, Presumptive Negative, Inconclusive.
   - Click **[ Launch New Field Test ]**.

3. **Step 1: Metadata & Geolocation (`/new-test`)**:
   - Verify unique auto-generated Test ID (e.g. `EJ-20260911-XXXX`).
   - Verify live timestamp.
   - Click "Refresh GPS" to lock latitude/longitude (or observe "Location unavailable" notice without invented coordinates).
   - Click **Proceed to Optical Camera**.

4. **Step 2: Optical Camera & Alignment**:
   - Observe real-time reticle guide targeting the Reference Card (left) and Test Reaction Well (right).
   - Click **Capture Test Photo** (or select a **Demo Kit** such as "Demo +" to test synthetic Cobalt Blue chromophore).
   - Click **Use Photo & Analyze**.

5. **Step 3: Photometric Calibration & Classification**:
   - Review image quality assessment (Laplacian blur variance and exposure contrast).
   - Inspect the **Colorimetric Lighting Calibration** inspector displaying sampled White, Gray, and Black standards and computed gain factors.
   - Observe CIELAB classification verdict (**PRESUMPTIVE POSITIVE**, **PRESUMPTIVE NEGATIVE**, or **INCONCLUSIVE**), confidence score, and statutory disclaimer.
   - Click **Confirm, Sign & Save Record**.

6. **Step 4: Cryptographic Sealing & Archival**:
   - Observe upload to Supabase Storage, calculation of image SHA-256 hash, canonical JSON hash generation, and HMAC server signature.
   - Click **View Full Digital Record**.

7. **Record Inspection & Tamper Evident Verification (`/test/[id]`)**:
   - Review the full evidentiary dossier.
   - Click **Re-Verify Integrity** to recalculate image SHA-256 and server signature in real time (`✓ RECORD INTEGRITY VERIFIED`).
   - Click **🧪 Test Tamper Detection** to simulate client-side tampering; observe how the badge immediately turns into `⚠ RECORD INTEGRITY CHECK FAILED`.

8. **Searchable History (`/history`)**:
   - Filter by classification result (Positive/Negative/Inconclusive).
   - Search by Test ID or Operator ID.
   - Paginate and sort records.

9. **Independent Public Verification (`/verify`)**:
   - Navigate to `/verify`, enter any Test ID (e.g. `EJ-20260911-POS1`), and click **Verify Record**.
   - Confirm independent verification verdict and cryptographic audit breakdown.

---

## Directory Architecture

```
e-jaanch/
├── app/
│   ├── layout.tsx                    # Root application layout with navigation & forensic footer
│   ├── page.tsx                      # Landing hero page with authentication gate
│   ├── login/page.tsx                # Operator authentication & quick demo selector
│   ├── dashboard/page.tsx            # KPI metric cards, quick actions, recent tests table
│   ├── new-test/page.tsx             # 4-step workflow: Info -> Camera -> Calibration -> Sign
│   ├── history/page.tsx              # Searchable history table with filters & pagination
│   ├── test/[id]/page.tsx            # Digital dossier with tamper detection demonstration
│   ├── verify/page.tsx               # Public independent verification portal by Test ID
│   ├── profile/page.tsx              # Operator credentials and database status
│   └── api/
│       ├── records/sign/route.ts     # Secure server-side HMAC-SHA256 signing endpoint
│       └── records/verify/route.ts   # Secure server-side signature verification endpoint
├── components/
│   ├── Navigation.tsx                # Header navigation bar with operator status badge
│   ├── CameraCapture.tsx             # Camera API stream with reticle guides & demo loader
│   ├── ColorCalibrationView.tsx      # Interactive calibration inspector with patch swatches
│   ├── ResultCard.tsx                # High-contrast classification card with confidence bar
│   ├── IntegrityBadge.tsx            # Tamper-evident badge with real-time re-verification
│   ├── DisclaimerBanner.tsx          # Statutory presumptive testing notice
│   └── Pagination.tsx                # Reusable table pagination component
├── lib/
│   ├── supabase/
│   │   └── client.ts                 # Dual-mode Supabase DB, Auth, Storage & Seed repository
│   ├── image-analysis/
│   │   ├── config.ts                 # Adjustable thresholds, test kit profiles, and standards
│   │   ├── calibration.ts            # Reference patch sampling & Von Kries gains calculation
│   │   ├── classifier.ts             # CIELAB Delta-E color distance & classification logic
│   │   └── quality.ts                # Laplacian blur variance & exposure contrast analysis
│   ├── hashing/
│   │   ├── sha256.ts                 # Web Crypto API SHA-256 for images, buffers, strings
│   │   └── canonical.ts              # Deterministic canonical JSON generator & hash calculator
│   ├── verification/
│   │   └── integrity.ts              # Re-verification of image hashes, records & signatures
│   └── demo/
│       └── sample-kits.ts            # Synthetic test kit procedural image generator
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql    # PostgreSQL DDL, RLS policies, indexes, and storage rules
├── types/
│   └── index.ts                      # TypeScript definitions for records, calibration, and audits
├── .env.example                      # Template for required environment variables
└── README.md
```

---

## Evidentiary Notice

E-Jaanch is designed in accordance with forensic preliminary documentation standards. Field colorimetric tests provide presumptive classifications. Confirmatory qualitative and quantitative substance identification requires secondary analytical methodologies (GC-MS, LC-MS, or FTIR).
