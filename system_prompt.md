# SYSTEM PROMPT & AGENT EXECUTION RULES - E-SEKOLAH

## 1. Arsitektur Folder Proyek
- `/src/` : Backend Node.js Express (Controllers, Models, Routes, Middleware, Config MySQL).
- `/client/` : Frontend React 19 + Vite (Views, Components, API client, Vanilla CSS).
- `/public/` : Folder output build statis untuk Web Production & PWA.

## 2. Tech Stack & Konvensi Kode
- **Backend**: Express.js (CommonJS `require`), MySQL2, JWT auth, Auto-column migration pada Model.
- **Frontend**: React 19 (Hooks), Vite, Vanilla CSS (`index.css`, `admin.css`), `lucide-react`, `sweetalert2`, Axios (`@/api/client`).

## 3. Aturan Eksekusi Agent (Hemat Token & Performa Tinggi)
1. **Fokus File Target**: Hanya akses dan edit file yang disebutkan (`@file`) atau tab yang sedang dibuka. Hindari melakukan pencarian (*search*) ke seluruh proyek jika konteks file sudah jelas.
2. **Edit Minimalis (To The Point)**: HANYA berikan perubahan pada baris/fungsi yang relevan. Jangan menulis ulang file panjang jika revisi hanya pada beberapa baris.
3. **Produksi Web Build**: Setelah memperbarui komponen di `client/src/`, lakukan kompilasi `npm run build` di folder `client/` agar bundle `public/` ter-update.
