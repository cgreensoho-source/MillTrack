# MillTrack

[![CI Build](https://github.com/cgreensoho-source/MillTrack/actions/workflows/ci.yml/badge.svg)](https://github.com/cgreensoho-source/MillTrack/actions)
[![Go Version](https://img.shields.io/badge/Go-1.25+-00ADD8?logo=go&logoColor=white)](https://go.dev/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Flutter](https://img.shields.io/badge/Flutter-3.x-02569B?logo=flutter&logoColor=white)](https://flutter.dev/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

Sistem Informasi Terpadu Pengelolaan Pabrik Kelapa Sawit (Palm Oil Mill), Pengumpulan Sampel Lapangan Terverifikasi GPS, dan Analisis Data Produksi.

---

## 🏛️ Arsitektur Monorepo

Repository ini mengadopsi struktur monorepo flat standar industri yang memisahkan seluruh lapisan layanan secara modular:

```text
MillTrack/
├── backend/                   # REST API Service (Go Fiber + GORM + PostgreSQL)
├── mobile/                    # Mobile Application Lapangan (Flutter + Clean Architecture)
├── web-admin/                 # Web Admin Dashboard (React 19 + Vite + Tailwind CSS)
├── docs/                      # Spesifikasi & Dokumentasi API terpusat
├── .github/                   # GitHub Actions CI/CD workflows
├── git-pull.bat               # Shortcut one-click Git Pull untuk seluruh monorepo
├── git-push.bat               # Shortcut one-click Git Push interaktif
├── setup.bat                  # Shortcut otomatisasi instalasi & bootstrap project
├── .gitignore                 # Proteksi monorepo dari secret leak & build bloat
└── README.md                  # Dokumentasi utama proyek
```

---

## 📋 Prasyarat Sistem (Prerequisites)

Sebelum menjalankan project, pastikan toolchain berikut telah terpasang di sistem operasi Anda:

| Komponen | Versi Minimal | Link Unduh | Keterangan |
| :--- | :--- | :--- | :--- |
| **Git** | 2.40+ | [git-scm.com](https://git-scm.com/downloads) | Version Control System |
| **Go** | 1.25+ | [go.dev/dl](https://go.dev/dl/) | Runtime untuk `backend/` |
| **Node.js & npm** | Node v20+, npm v10+ | [nodejs.org](https://nodejs.org/) | Runtime untuk `web-admin/` |
| **Flutter SDK** | 3.24+ | [docs.flutter.dev](https://docs.flutter.dev/get-started/install) | SDK untuk `mobile/` |
| **PostgreSQL** | 14+ | [postgresql.org](https://www.postgresql.org/download/) | Database Relasional |

---

## ⚡ Setup Cepat (One-Click Bootstrap)

Jika Anda menggunakan Windows, cukup jalankan skrip bootstrap otomatis di terminal root:

```cmd
setup.bat
```

Skrip ini akan secara otomatis:
1. Memvalidasi ketersediaan `git`, `go`, `node`, `npm`, dan `flutter`.
2. Menyalin template environment `backend/.env.example` ke `backend/.env`.
3. Mengunduh dependency Go modules (`go mod download`).
4. Menginstal dependency Node.js di `web-admin/` (`npm install`).
5. Mengunduh package Dart di `mobile/` (`flutter pub get`).

---

## 🚀 Panduan Setup & Instalasi Manual

### 1. Backend Service (`backend/`)
Service API ditulis menggunakan bahasa Go dengan framework Fiber v2 dan ORM GORM.

```bash
cd backend

# 1. Buat environment file dari template
cp .env.example .env

# 2. Sesuaikan konfigurasi DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET pada .env

# 3. Unduh dependency Go
go mod download

# 4. Jalankan service (Port default :3000)
go run main.go
```
- **Dokumentasi Swagger:** Akses `http://localhost:3000/swagger/index.html` saat server berjalan.
- **Health Check:** `http://localhost:3000/`

---

### 2. Web Admin Dashboard (`web-admin/`)
Dashboard berbasis Single Page Application (SPA) menggunakan React 19, Vite, dan Tailwind CSS.

```bash
cd web-admin

# 1. Install dependencies
npm install

# 2. Jalankan development server
npm run dev

# 3. Build untuk production
npm run build
```
- Dashboard dapat diakses di `http://localhost:5173/` secara default.
- Konfigurasi target endpoint API berada di [src/config.js](file:///c:/Projects/MillTrack/web-admin/src/config.js).

---

### 3. Mobile Client (`mobile/`)
Aplikasi mobile lintas platform untuk petugas lapangan (sampling mandiri, scan QR stasiun, validasi koordinat GPS Haversine, dan sinkronisasi offline-online).

```bash
cd mobile

# 1. Install Flutter dependencies
flutter pub get

# 2. Cek perangkat yang terhubung (USB / Emulator / Chrome)
flutter devices

# 3. Jalankan aplikasi
flutter run
```

---

## 🛠️ Shortcut Batch Scripts (Push & Pull)

Untuk mempermudah alur kerja tim, telah disediakan shortcut `.bat` yang dapat dijalankan langsung dengan klik ganda di Windows Explorer atau dipanggil lewat terminal:

### Di Root Directory (`MillTrack/`)
- **[`git-pull.bat`](file:///c:/Projects/MillTrack/git-pull.bat)**: Menarik update terbaru dari branch aktif saat ini (`git pull origin <branch>`).
- **[`git-push.bat`](file:///c:/Projects/MillTrack/git-push.bat)**: Menampilkan status staging, meminta pesan commit, melakukan `git add -A`, `git commit`, dan `git push origin <branch>`.
- **[`setup.bat`](file:///c:/Projects/MillTrack/setup.bat)**: Menginisialisasi environment seluruh monorepo dalam satu langkah.

### Di Setiap Sub-Folder Service
Tiap folder memiliki shortcut mandiri yang otomatis berpindah konteks ke root monorepo:
- **`backend/`**:
  - [`backend/git-pull.bat`](file:///c:/Projects/MillTrack/backend/git-pull.bat)
  - [`backend/git-push.bat`](file:///c:/Projects/MillTrack/backend/git-push.bat) (Otomatis menyematkan tag `[backend]` pada commit message)
- **`web-admin/`**:
  - [`web-admin/git-pull.bat`](file:///c:/Projects/MillTrack/web-admin/git-pull.bat)
  - [`web-admin/git-push.bat`](file:///c:/Projects/MillTrack/web-admin/git-push.bat) (Otomatis menyematkan tag `[web-admin]`)
- **`mobile/`**:
  - [`mobile/git-pull.bat`](file:///c:/Projects/MillTrack/mobile/git-pull.bat)
  - [`mobile/git-push.bat`](file:///c:/Projects/MillTrack/mobile/git-push.bat) (Otomatis menyematkan tag `[mobile]`)

---

## 🔒 Kebijakan Keamanan & Kontribusi (Security Standard)

1. **Dilarang Commit File `.env`**: Seluruh secret, token, dan kredensial database disimpan secara lokal di `.env` yang diabaikan oleh Git. Gunakan `.env.example` untuk menambahkan variabel baru.
2. **Dilarang Menumpuk Binary**: File `.exe`, `.apk`, `.zip`, atau direktori `dist/` / `build/` tidak boleh di-commit ke Git.
3. **Data Lapangan Terisolasi**: Folder `backend/upload/` hanya melacak file `.gitkeep` untuk menjaga struktur direktori, data upload riil tidak akan masuk ke Git repository.
