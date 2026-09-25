# 🏫 E-Sekolah REST API Server

API Server backend terpadu (Unified API) untuk aplikasi **Android (Mobile App)** dan **Web Desktop**. Dibuat dengan arsitektur bersih (*Clean Layered Architecture*) yang ringan, cepat, dan mudah dipahami oleh developer.

---

## 📁 Struktur Folder Project

```text
E-Sekolah/
├── .env                     # Konfigurasi Environment (Port 5007, Database)
├── .env.example             # Template konfigurasi environment
├── .gitignore               # Daftar file yang diabaikan Git
├── package.json             # Dependensi & NPM scripts
├── README.md                # Dokumentasi API & Panduan Pengembangan
└── src/
    ├── config/
    │   └── database.js      # Koneksi MySQL Connection Pool (mysql2/promise)
    ├── constants/
    │   └── status.js        # Kode konstanta sistem (HTTP status, presensi)
    ├── middleware/
    │   ├── auth.middleware.js   # Verifikasi Token JWT
    │   └── error.middleware.js  # Handling Error Terpusat & 404
    ├── models/              # Layer Query Database (SQL Encapsulation)
    │   ├── guru.model.js
    │   ├── kelas.model.js
    │   ├── mapel.model.js
    │   ├── jadwal.model.js
    │   ├── presensi.model.js
    │   ├── absensiSiswa.model.js
    │   └── absensiMapel.model.js
    ├── controllers/         # Handler Logika HTTP (Request -> Service -> Response)
    │   ├── auth.controller.js
    │   ├── guru.controller.js
    │   ├── kelas.controller.js
    │   ├── mapel.controller.js
    │   ├── jadwal.controller.js
    │   ├── presensi.controller.js
    │   ├── absensiSiswa.controller.js
    │   ├── absensiMapel.controller.js
    │   └── dashboard.controller.js
    ├── routes/              # Routing Endpoint API
    │   ├── index.js         # Agregator Utama Route (/api)
    │   ├── auth.routes.js
    │   ├── guru.routes.js
    │   ├── kelas.routes.js
    │   ├── mapel.routes.js
    │   ├── jadwal.routes.js
    │   ├── presensi.routes.js
    │   ├── absensiSiswa.routes.js
    │   ├── absensiMapel.routes.js
    │   └── dashboard.routes.js
    ├── utils/               # Helper Utility (Response Formatter, Date Utils)
    │   ├── response.util.js
    │   └── date.util.js
    └── server.js            # Entry Point Aplikasi Express
```

---

## ⚡ Cara Menjalankan Project

1. **Install Dependensi:**
   ```bash
   npm install
   ```

2. **Jalankan Mode Development:**
   ```bash
   npm run dev
   ```

3. **Jalankan Mode Production:**
   ```bash
   npm start
   ```

API akan berjalan di `http://localhost:5007/api`.

---

## 🌐 Daftar Endpoint API

### 1. Autentikasi (`/api/auth`)
- `POST /api/auth/login` - Login Guru / User
- `GET /api/auth/profile` - Mengambil data profil login (*Memerlukan Token*)

### 2. Presensi Guru (`/api/presensi`)
- `GET /api/presensi/today` - Cek status presensi hari ini
- `POST /api/presensi/checkin` - Presensi masuk (Lokasi & Foto)
- `POST /api/presensi/checkout` - Presensi pulang (Lokasi & Foto)
- `GET /api/presensi/history` - Riwayat presensi bulanan

### 3. Absensi Siswa Harian (`/api/absensi-siswa`)
- `GET /api/absensi-siswa?tanggal=YYYY-MM-DD&kode_kelas=1` - Ambil daftar absensi siswa
- `POST /api/absensi-siswa/batch` - Simpan/Update absensi siswa harian secara masal

### 4. Absensi Mata Pelajaran (`/api/absensi-mapel`)
- `GET /api/absensi-mapel?tanggal=YYYY-MM-DD&kode_kelas=1&kode_mapel=2` - Ambil absensi mapel
- `POST /api/absensi-mapel/batch` - Simpan/Update absensi mata pelajaran secara masal

### 5. Jadwal Pelajaran (`/api/jadwal`)
- `GET /api/jadwal?hari=Senin&kode_kelas=1` - Ambil jadwal pelajaran berdasarkan hari/kelas/guru

### 6. Master Data (`/api/guru`, `/api/kelas`, `/api/mapel`)
- `GET /api/guru` - Daftar Guru
- `GET /api/guru/:id` - Detail Guru
- `GET /api/kelas` - Daftar Kelas & Wali Kelas
- `GET /api/mapel` - Daftar Mata Pelajaran

### 7. Dashboard Overview (`/api/dashboard`)
- `GET /api/dashboard/summary` - Total Guru, Kelas, Mapel, Presensi Hari Ini

---

## 🔑 Format Header Autentikasi
Sertakan JWT token di header Authorization untuk endpoint yang dilindungi:
```text
Authorization: Bearer <your_jwt_token>
```
