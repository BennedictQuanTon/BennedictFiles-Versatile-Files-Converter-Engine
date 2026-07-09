# BennedictFiles — Build Task List

## Phase 1: Repo Scaffolding
- [x] Copy finalized plan to repo `docs/system-design.md`
- [x] Create root `.gitignore`
- [x] Create root `.env.example`
- [x] Create `docker-compose.yml` (Redis)
- [x] Update `README.md`

## Phase 2: Database (Prisma + Supabase)
- [x] Scaffold `backend/` with `package.json`, `tsconfig.json`
- [x] Write `prisma/schema.prisma` (guests, jobs, email_logs)
- [x] Set up Prisma client singleton

## Phase 3: Backend API (Node.js + Express)
- [x] Express app entry with middleware (cors, rate-limit, multer)
- [x] `POST /guests` — email capture
- [x] `POST /jobs` — create job, enqueue, save to Supabase Storage
- [x] `GET /jobs/:id` — poll job status
- [x] `GET /files/:id` — download output file
- [x] `POST /email` — send file via Gmail SMTP (Nodemailer)
- [x] Supabase Storage service
- [x] BullMQ producer service
- [x] Nodemailer Gmail service

## Phase 4: Python Worker
- [x] Scaffold `worker/` with `requirements.txt`
- [x] BullMQ consumer (`main.py`)
- [x] Supabase Storage utils (download input / upload output)
- [x] `pdf_converter.py` — LibreOffice + Ghostscript
- [x] `image_converter.py` — Pillow + img2pdf
- [x] `merge_converter.py` — pypdf merge

## Phase 5: Frontend (Next.js 14)
- [x] Scaffold `frontend/` Next.js app
- [x] Design tokens + `globals.css` (BennedictFiles brand)
- [x] `Navbar` + `Footer` components
- [x] `EmailGate` component (email capture modal)
- [x] `ToolGrid` component (categories + 11 MVP tool cards)
- [x] `FileDropzone` component
- [x] `ConversionProgress` component (polling)
- [x] `DownloadCard` component
- [x] `EmailSendPanel` component
- [x] Landing page (`app/page.tsx`)
- [x] Convert page (`app/convert/[tool]/page.tsx`)
- [x] Result page (`app/result/[jobId]/page.tsx`)
- [x] Zustand store (guestEmail, jobId)
- [x] Axios API client (`lib/api.ts`)
- [x] Tool definitions (`lib/tools.ts`)

## Phase 6: Preparation & API Key Setup
- [ ] Create Supabase project & conversions bucket
- [ ] Generate Gmail SMTP 16-character App Password
- [ ] Startup local Redis Docker container
- [ ] Configure .env files for backend, worker, and frontend
- [ ] Run `npx prisma db push` to sync Supabase Postgres schema

## Phase 7: Integration & Testing
- [ ] End-to-end test: upload PDF → convert → download
- [ ] End-to-end test: send converted file to email
- [ ] Error handling: invalid file, conversion failure, oversized file

## Phase 8: Polish
- [ ] Mobile responsive UI
- [ ] Loading states, animations
- [ ] Final README with setup instructions
