# OriginCheck — Plagiarism & Originality Detection System

Edge-to-edge pixel-perfect clone and reverse-engineered implementation of [https://plagiarism-detection-vgdt.bolt.host](https://plagiarism-detection-vgdt.bolt.host).

## Architecture & Reverse-Engineered Findings

### 1. Technology Stack
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + Lucide React
- **Document Parsing**: 
  - `mammoth.js` for `.docx` raw text extraction
  - `pdfjs-dist` for client-side `.pdf` page-by-page tokenization
  - Native browser File API for `.txt`
- **Routing**: Client-side hash routing (`/`, `/check`, `/reports`, `/reports/:id`)
- **Backend / Database Options**:
  - Direct Supabase Client (Original client configuration preserved with same database tables)
  - Custom Node.js Express REST API backend + PostgreSQL (included in `/backend`)

### 2. Core Detection Algorithm
- **Normalization**: Unicode-aware letter/number filtering (`\p{L}\p{N}`) and lowercase transformation.
- **Sentence Segmentation**: Lookbehind boundary regex `(?<=[.!?])\s+|\n+`.
- **Shingling (n-grams)**: 5-word contiguous rolling n-grams (`pf = 5`).
- **Thresholds**:
  - `BA = 0.5` (50% n-gram overlap classifies a sentence as matching).
  - `jA = 0.5` (0.5% threshold for attributing reference sources).
  - Score bands: `< 15%` (Low), `15-40%` (Moderate), `>= 40%` (High).

---

## Getting Started

### 1. Run the Frontend (Vite)
```bash
# In the root folder:
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 2. Production Build
```bash
npm run build
npm run preview
```

### 3. Optional: Running the Custom Node.js & PostgreSQL Backend
If you want to run your own self-hosted PostgreSQL database rather than Supabase:
```bash
cd backend
npm install
# Set your DATABASE_URL in .env
psql your_db < schema.sql
npm start
```

