# 📁 BennedictFiles — Versatile Files Converter Engine

**BennedictFiles** is a high-resolution, all-in-one web application that allows users to upload documents, images, and files, and convert them across various formats. Users can download converted files or email them directly as attachments.

Built with a **Next.js frontend**, a **Node.js Express API**, and a **Python conversion worker** running a background job queue using **Redis & BullMQ**.

---

## 🚀 Project Features (MVP)
* **Pre-conversion Email Gate**: Capture guest emails before they convert to identify and email them files.
* **High-Resolution Conversions**: Enforces print-quality (300 DPI) for image formats and vector conversions for text.
* **11 Core MVP Tools**:
  * PDF to Word / PNG / JPG / Excel
  * Word / Excel / PNG / JPG to PDF
  * Compress PDF (using Ghostscript `/printer` high-quality setting)
  * Compress Image (perceptually lossless quality)
  * Merge PDFs and Merge Images
* **Direct Email Delivery**: Send converted files directly to any email using Nodemailer and Gmail SMTP.
* **Automatic Expiration**: Converted files are automatically removed after 1 hour to respect user privacy.

---

## 🛠️ Architecture Overview
* **Frontend**: Next.js 14 (App Router) + CSS Modules
* **Backend**: Node.js + Express + Prisma + BullMQ
* **Worker**: Python 3.10+ (LibreOffice, Ghostscript, pdf2image, img2pdf, pypdf)
* **Services**: Supabase (PostgreSQL database & Storage bucket) + Redis + Gmail SMTP

---

## 📂 Project Structure
```
files-converter-engine/
├── frontend/             # Next.js 14 App
├── backend/              # Node.js Express API
├── worker/               # Python Conversion Worker
├── docs/                 # System Design & Implementation Plans
├── docker-compose.yml    # Local Redis service
├── .gitignore            # Git ignore configuration
└── .env.example          # Environment variables template
```

---

## 🏗️ Getting Started
Detailed setup instructions for the database, backend, worker, and frontend will be added here as we build them.
