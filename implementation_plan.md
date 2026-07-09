# 📋 BennedictFiles — Finalized System Design Plan

## ✅ Final Decisions Summary

| Question | Answer |
|---|---|
| **Scale** | Personal + a few friends |
| **Auth** | Guest-only — email required upfront (data collection + file delivery) |
| **MVP Scope** | PDF ↔ Word/PNG/JPG/Excel + Compress + Merge |
| **Paid APIs** | Free-tier only (local tools only, no paid APIs) |
| **Email** | Gmail SMTP via Nodemailer (user provides their Gmail) |
| **Storage** | Supabase Storage |
| **Hosting** | Local dev first → Vercel (later) |
| **App Name** | **BennedictFiles** |

---

## 🏗️ System Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│                     CLIENT (Browser)                               │
│              Next.js 14 Frontend — "BennedictFiles"                │
│   Email Capture → Tool Picker → Upload → Progress → Download/Email │
└───────────────────────────┬────────────────────────────────────────┘
                            │ HTTP (REST)
┌───────────────────────────▼────────────────────────────────────────┐
│                    Node.js Express API                             │
│         /jobs  /files  /email  /status                             │
│         Rate Limiting · Multer Upload · Job Enqueue                │
└──────┬──────────────────┬─────────────────────────┬───────────────┘
       │                  │                         │
┌──────▼──────┐   ┌───────▼────────┐      ┌────────▼──────────┐
│  Supabase   │   │  Redis (local  │      │  Gmail SMTP       │
│  PostgreSQL │   │  dev) / Upstash│      │  via Nodemailer   │
│  + Storage  │   │  (prod)        │      │  (free)           │
└─────────────┘   └───────┬────────┘      └───────────────────┘
                          │
                 ┌────────▼────────┐
                 │  Python Worker  │
                 │  BullMQ Consumer│
                 │  ─────────────  │
                 │  LibreOffice    │
                 │  Ghostscript    │
                 │  Pillow/pdf2img │
                 │  img2pdf        │
                 └─────────────────┘
```

---

## 🔄 Data Flow

```
1.  Guest lands on BennedictFiles homepage
2.  Guest enters their email → stored in DB (guests table)
3.  Guest selects a conversion tool (e.g. PDF → Word)
4.  Guest uploads file → API receives multipart/form-data
5.  API saves raw file → Supabase Storage (temp bucket)
6.  API creates Job record in Supabase PostgreSQL (status: PENDING)
7.  Job enqueued in Redis (BullMQ)
8.  Python Worker picks up job → runs conversion
9.  Output file saved → Supabase Storage
10. Job status updated → DONE + output_path stored
11. Frontend polls GET /jobs/:id → shows Download button
12. Guest clicks "Send to my email" → Nodemailer sends file via Gmail SMTP
13. Files auto-deleted from storage after 1-hour TTL
```

---

## 📊 Sequence Flow

```
Guest         Frontend          API            Worker         Supabase      Gmail SMTP
  │               │               │               │               │               │
  │  Enter email  │               │               │               │               │
  │──────────────►│  POST /guest  │               │               │               │
  │               │──────────────►│  Save guest   │               │               │
  │               │◄──────────────│  guest_id     │               │               │
  │  Pick tool    │               │               │               │               │
  │  Upload file  │  POST /jobs   │               │               │               │
  │──────────────►│──────────────►│  Save raw     │               │               │
  │               │               │──────────────────────────────►│               │
  │               │               │  Create job   │               │               │
  │               │               │  Enqueue      │               │               │
  │               │               │──────────────►│               │               │
  │               │  {jobId}      │               │  Convert file │               │
  │               │◄──────────────│               │──────────────►│               │
  │  Poll status  │               │               │  Save output  │               │
  │──────────────►│  GET /jobs/id │               │◄──────────────│               │
  │               │──────────────►│               │               │               │
  │               │◄──{DONE}──────│               │               │               │
  │  Download     │  GET /files/id│               │               │               │
  │──────────────►│──────────────►│──────────────────────────────►│               │
  │               │               │               │               │               │
  │  Send Email   │  POST /email  │               │               │               │
  │──────────────►│──────────────►│─────────────────────────────────────────────►│
  │               │               │               │               │               │
```

---

## ✅ Functional Requirements (MVP)

| ID | Requirement |
|---|---|
| FR-01 | Guest must enter their email before using any tool |
| FR-02 | Guest email is stored in DB for identification and mailing |
| FR-03 | Guest can select from MVP conversion tools |
| FR-04 | Guest can upload a file (PDF, DOCX, XLSX, PNG, JPG) up to 50MB |
| FR-05 | System converts file asynchronously (job queue) |
| FR-06 | Guest sees real-time conversion progress via polling |
| FR-07 | Guest can download the converted file |
| FR-08 | Guest can click "Send to my email" — file sent as attachment via Gmail |
| FR-09 | Files auto-deleted from storage after 1 hour |
| FR-10 | Friendly error messages shown on failure |

---

## 🚫 Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-01 | Max upload size: **50MB** |
| NFR-02 | Conversion completes within **60 seconds** |
| NFR-03 | All free-tier services only |
| NFR-04 | Files stored with UUID paths (not guessable) |
| NFR-05 | Rate limiting: 20 conversions/IP/hour |
| NFR-06 | Mobile-responsive, premium UI branded as **BennedictFiles** |
| NFR-07 | .env.example provided for all secrets |
| NFR-08 | .gitignore covers all secrets, build artifacts, temp files |

---

## 🎯 MVP Conversion Tools

| Tool | Input → Output | Engine | Resolution Setting |
|---|---|---|---|
| PDF to Word | `.pdf` → `.docx` | LibreOffice headless | Native vector text (lossless) |
| PDF to PNG | `.pdf` → `.png` | pdf2image + Pillow | **300 DPI** |
| PDF to JPG | `.pdf` → `.jpg` | pdf2image + Pillow | **300 DPI**, JPEG quality **95** |
| PDF to Excel | `.pdf` → `.xlsx` | LibreOffice headless | Native (lossless) |
| Word to PDF | `.docx` → `.pdf` | LibreOffice headless | Native vector (lossless) |
| Excel to PDF | `.xlsx` → `.pdf` | LibreOffice headless | Native vector (lossless) |
| PNG/JPG to PDF | `.png/.jpg` → `.pdf` | img2pdf | **Embedded at original resolution** |
| Compress PDF | `.pdf` → `.pdf` | Ghostscript | **`-dPDFSETTINGS=/printer`** (300 DPI, high quality) |
| Compress Image | `.png/.jpg` → `.png/.jpg` | Pillow | PNG lossless / JPG quality **85** (perceptually lossless) |
| Merge PDFs | multiple `.pdf` → `.pdf` | pypdf | Native (no re-render, lossless) |
| Merge Images | multiple `.png/.jpg` → `.pdf` | img2pdf | **Embedded at original resolution** |

---

## 🖼️ High-Resolution Output Policy

> All conversions must preserve or maximize output quality. The following settings are enforced in the Python worker:

### PDF → Image (pdf2image)
```python
# Always render at 300 DPI (print-quality)
images = convert_from_path(pdf_path, dpi=300, fmt='png')  # or fmt='jpeg'
```

### Image → Any Format (Pillow)
```python
# PNG: lossless
img.save(output_path, 'PNG', optimize=True)

# JPG: near-lossless
img.save(output_path, 'JPEG', quality=95, subsampling=0)

# Compress (size reduction with minimal quality loss)
img.save(output_path, 'JPEG', quality=85, optimize=True)
```

### PDF Compress (Ghostscript)
```bash
# /printer = 300 DPI — high quality, good compression
# Avoid /ebook (150 DPI) or /screen (72 DPI) — too lossy
gs -sDEVICE=pdfwrite -dPDFSETTINGS=/printer \
   -dCompatibilityLevel=1.4 -dNOPAUSE -dBATCH \
   -sOutputFile=output.pdf input.pdf
```

### Image → PDF (img2pdf)
```python
# img2pdf embeds images WITHOUT re-encoding = zero quality loss
import img2pdf
with open('output.pdf', 'wb') as f:
    f.write(img2pdf.convert([img_path1, img_path2]))
```

### LibreOffice PDF Export
```bash
# Export with highest quality PDF settings
libreoffice --headless \
  --convert-to pdf:writer_pdf_Export \
  --infilter='writer_pdf_Export:{"ReduceImageResolution":{"type":"boolean","value":"false"}}' \
  input.docx
```

---

## 🛠️ Tech Stack

### Frontend
| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Styling | Vanilla CSS (CSS Modules) |
| File Upload | react-dropzone |
| State | Zustand |
| HTTP | Axios |
| Icons | Lucide React |
| Fonts | Inter (Google Fonts) |

### Backend
| Layer | Technology |
|---|---|
| Runtime | Node.js + Express |
| Job Queue | BullMQ + Redis |
| ORM | Prisma |
| File Upload | Multer |
| Email | Nodemailer (Gmail SMTP) |
| Validation | Zod |

### Conversion Worker
| Tool | Purpose |
|---|---|
| Python 3.10+ | Worker runtime |
| LibreOffice (headless) | DOCX/XLSX ↔ PDF |
| Ghostscript | PDF compress |
| pdf2image + Pillow | PDF → Image, Image compress |
| img2pdf | Images → PDF |
| pypdf | PDF merge/split |

### Infrastructure (Local Dev)
| Service | Purpose |
|---|---|
| Supabase | PostgreSQL DB + File Storage |
| Redis (local Docker) | Job queue |
| Gmail SMTP | Email sending (free) |

---

## 📁 Project Structure

```
files-converter-engine/
│
├── .gitignore                        ← Covers node_modules, .env, __pycache__, uploads/
├── .env.example                      ← Template for all required env vars
├── README.md
├── docker-compose.yml                ← Local Redis + (optional) Postgres
│
├── docs/
│   └── system-design.md             ← This plan (saved to repo)
│
├── frontend/                         ← Next.js 14 App
│   ├── .env.local.example
│   ├── next.config.js
│   ├── package.json
│   ├── app/
│   │   ├── layout.tsx               ← Root layout (font, metadata)
│   │   ├── page.tsx                 ← Landing: email capture + tool grid
│   │   ├── convert/
│   │   │   └── [tool]/
│   │   │       └── page.tsx         ← Upload + convert UI per tool
│   │   └── result/
│   │       └── [jobId]/
│   │           └── page.tsx         ← Download + email send UI
│   ├── components/
│   │   ├── EmailGate/               ← Email capture modal (shown first)
│   │   ├── ToolGrid/                ← Category cards + tool tiles
│   │   ├── FileDropzone/            ← Drag-and-drop upload zone
│   │   ├── ConversionProgress/      ← Progress bar + status polling
│   │   ├── DownloadCard/            ← Download button + file info
│   │   ├── EmailSendPanel/          ← "Send to my email" section
│   │   ├── Navbar/                  ← BennedictFiles branding
│   │   └── Footer/
│   ├── lib/
│   │   ├── api.ts                   ← Axios client + all API calls
│   │   ├── tools.ts                 ← Tool definitions (name, icon, category)
│   │   └── store.ts                 ← Zustand store (guestEmail, jobId)
│   └── styles/
│       ├── globals.css
│       └── variables.css            ← Design tokens (colors, spacing)
│
├── backend/                          ← Node.js Express API
│   ├── .env.example
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   │   ├── index.ts                 ← Express app entry + middleware
│   │   ├── routes/
│   │   │   ├── guests.ts            ← POST /guests (email capture)
│   │   │   ├── jobs.ts              ← POST /jobs, GET /jobs/:id
│   │   │   ├── files.ts             ← GET /files/:id (download)
│   │   │   └── email.ts             ← POST /email (send file)
│   │   ├── services/
│   │   │   ├── storage.ts           ← Supabase Storage ops
│   │   │   ├── queue.ts             ← BullMQ producer
│   │   │   └── email.ts             ← Nodemailer Gmail SMTP
│   │   ├── middleware/
│   │   │   ├── upload.ts            ← Multer config (50MB limit)
│   │   │   └── rateLimit.ts         ← express-rate-limit
│   │   ├── db/
│   │   │   └── prisma.ts            ← Prisma client singleton
│   │   └── types/
│   │       └── index.ts             ← Shared TypeScript types
│   └── prisma/
│       ├── schema.prisma            ← DB schema
│       └── migrations/
│
└── worker/                           ← Python Conversion Worker
    ├── requirements.txt
    ├── .env.example
    ├── main.py                       ← BullMQ job consumer
    ├── converters/
    │   ├── __init__.py
    │   ├── pdf_converter.py          ← LibreOffice + Ghostscript ops
    │   ├── image_converter.py        ← Pillow + img2pdf ops
    │   └── merge_converter.py        ← pypdf merge/split
    └── utils/
        ├── __init__.py
        └── storage.py               ← Supabase Storage upload/download
```

---

## 🗄️ Database Schema

```sql
-- Guest: email capture for identification + mailing
Table guests {
  id         UUID      PK  DEFAULT gen_random_uuid()
  email      VARCHAR   NOT NULL UNIQUE
  created_at TIMESTAMP DEFAULT now()
}

-- Jobs: tracks every conversion task
Table jobs {
  id          UUID      PK  DEFAULT gen_random_uuid()
  guest_id    UUID      FK → guests.id
  tool        VARCHAR   NOT NULL   -- e.g. "pdf-to-word"
  status      VARCHAR   NOT NULL   -- PENDING | PROCESSING | DONE | FAILED
  input_key   VARCHAR              -- Supabase storage path
  output_key  VARCHAR              -- Supabase storage path
  error_msg   TEXT
  created_at  TIMESTAMP DEFAULT now()
  expires_at  TIMESTAMP            -- now() + 1 hour
}

-- EmailLogs: audit of sent emails
Table email_logs {
  id          UUID      PK  DEFAULT gen_random_uuid()
  job_id      UUID      FK → jobs.id
  recipient   VARCHAR   NOT NULL
  sent_at     TIMESTAMP DEFAULT now()
  status      VARCHAR              -- SENT | FAILED
}
```

---

## 🔐 .env.example Structure

```
# ─── Supabase ───────────────────────────────────
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_STORAGE_BUCKET=conversions

# ─── Redis (local dev: redis://localhost:6379) ───
REDIS_URL=redis://localhost:6379

# ─── Gmail SMTP (Nodemailer) ─────────────────────
GMAIL_USER=your-gmail@gmail.com
GMAIL_APP_PASSWORD=your-16-char-app-password
EMAIL_FROM_NAME=BennedictFiles

# ─── API ─────────────────────────────────────────
PORT=3001
NEXT_PUBLIC_API_URL=http://localhost:3001

# ─── File Limits ─────────────────────────────────
MAX_FILE_SIZE_MB=50
FILE_TTL_HOURS=1
```

---

## 🚀 Build Order (Task Sequence)

1. **Repo scaffolding** — .gitignore, .env.example, docker-compose, README
2. **Database** — Prisma schema, Supabase migrations
3. **Backend API** — Express app, all routes, services
4. **Python Worker** — Conversion engine, BullMQ consumer
5. **Frontend** — Next.js app, all components, tool definitions, pages
6. **Preparation & API Key Setup** — Collect credentials, database sync, Docker startup
7. **Integration & Testing** — Wire up end-to-end flow, test locally
8. **Polish** — UI styling, branded as BennedictFiles, mobile responsive

---

## 🛠️ Step-by-Step Preparation Checklist

Before integration testing with actual services (bypassing simulation mode), perform these steps:

### 1. Supabase Setup
- **Create Project**: Sign in to [Supabase](https://supabase.com) and create a new free project.
- **Database Connection**: Under Project Settings -> Database, copy the **Transaction Connection String (URI)**. Modify it to use the connection pooling port if necessary or standard port 5432.
- **Storage Bucket**: Under Storage, create a new bucket named `conversions`. Make sure it has public access or policies allowing uploads/downloads.
- **API Keys**: Under Project Settings -> API, copy the **Project URL** and the **service_role** secret key (do NOT share this service_role key publicly).

### 2. Gmail SMTP App Password
- **2-Step Verification**: Enable 2-Step Verification on your Gmail account settings.
- **App Password**: Go to Security -> App Passwords. Select "Other (Custom name)" and input `BennedictFiles`. Copy the generated **16-character code** (e.g. `abcd efgh ijkl mnop`).

### 3. Local Redis Container
- **Docker Desktop**: Ensure Docker Desktop is installed and running on your machine.
- **Start Redis**: In the project root directory, run `docker-compose up -d` to spin up Redis on `localhost:6379`.

### 4. Configuration Files
- **Backend & Worker**:
  - Duplicate `.env.example` in root or copy to `backend/.env` and `worker/.env`.
  - Populate:
    - `DATABASE_URL` (with your Supabase PostgreSQL URI)
    - `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
    - `GMAIL_USER` and `GMAIL_APP_PASSWORD`
- **Frontend**:
  - Duplicate `frontend/.env.local.example` to `frontend/.env.local`.
  - Keep `NEXT_PUBLIC_API_URL=http://localhost:3001`.

### 5. Sync Database Schema
- Inside the `backend/` folder, run `npx prisma db push` to push the database models directly to Supabase PostgreSQL.


