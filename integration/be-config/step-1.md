# Panduan Integrasi Backend & Frontend (Tahap 1)

Dokumen ini adalah instruksi komprehensif bagi Junior Developer / AI Model untuk merancang dan mengimplementasikan sistem Backend yang akan melayani Frontend Vue 3.

**Konteks Project:**
Frontend menggunakan Vue 3 + TypeScript + Tailwind CSS yang dibagi menjadi dua ranah utama:

1. **Public Website**: Portfolio personal, Blog, dan Project Showcase. (Sifat: Read-only Data).
2. **Private Dashboard**: Content Management System (CMS) untuk mengelola data website. (Sifat: Full CRUD).

Sistem ini didesain sebagai **Single-Admin** (hanya digunakan oleh pemilik situs).

---

## 1. Analisa Kebutuhan Backend

Backend harus dirancang seringan dan seefisien mungkin untuk melayani dua kebutuhan utama:

- **Authentication System**: Melindungi area Private Dashboard. Harus mampu memverifikasi identitas 1 admin tunggal dan menjaga sesinya dengan aman.
- **Content API (CRUD)**: API internal untuk manajemen data (Create, Read, Update, Delete).
- **Public API (Read-only)**: Endpoint yang terekspos untuk melayani data ke website publik (menampilkan daftar blog & proyek yang sudah berstatus 'published').

## 2. Entitas & Relasi Database

Karena sistem ini bertipe single-admin, relasi database dibuat sesederhana mungkin:

- Tidak perlu membuat _Foreign Key_ relasional yang rumit antara tabel `projects` atau `blogs` dengan `users` (author), dikarenakan semua konten mutlak milik sang author/admin.
- Tiap entitas berdiri independen agar modifikasi di masa depan (misal: menambah galeri gambar untuk proyek) tidak berdampak luas.

## 3. Desain Schema Database (PostgreSQL)

_(Catatan Penting: Struktur kolom di bawah ini, terutama untuk tabel `projects`, bersifat fleksibel. Pemahaman dasarnya adalah struktur data proyek sangat dinamis dan berpeluang besar mengalami perubahan/penambahan kolom seiring waktu)._

**Table: `users`** (Hanya berisi 1 bari data untuk admin)

- `id` (UUID, Primary Key)
- `email` (String, Unique)
- `password_hash` (String) - _Wajib hash menggunakan bcrypt/argon2_
- `created_at` (Timestamp)

**Table: `projects`**

- `id` (UUID, Primary Key)
- `title` (String)
- `slug` (String, Unique) - _Digunakan untuk URL SEO-friendly_
- `category` (String)
- `description` (Text) - _Deskripsi singkat untuk layout kartu depan_
- `content` (Text) - _Bisa berupa HTML/Markdown untuk halaman detail_
- `cover_image` (String) - _URL gambar_
- `tech_stack` (JSONB / Array of String) - _Contoh: ["Vue 3", "PostgreSQL"]_
- `is_published` (Boolean, default: false)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

**Table: `blogs`**

- `id` (UUID, Primary Key)
- `title` (String)
- `slug` (String, Unique)
- `category` (String)
- `excerpt` (String) - _Rangkuman untuk grid list di depan_
- `content` (Text)
- `cover_image` (String)
- `is_published` (Boolean, default: false)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

**Table: `activity_logs`**

- `id` (UUID, Primary Key)
- `action` (String) - _Aktivitas yang terjadi, cnth: 'CREATE_PROJECT', 'DELETE_BLOG', 'LOGIN'_
- `entity_type` (String) - _Bagian yang terdampak, cnth: 'PROJECT', 'BLOG'_
- `entity_id` (UUID, Nullable) - _Berisi ID dari parameter terkait_
- `details` (JSONB) - _Snapshot payload data lama/baru untuk audit_
- `created_at` (Timestamp, Default: Now)

## 4. Struktur API (RESTful)

### Auth

- `POST /api/auth/login` → Menerima `email` & `password`. Mengembalikan token sesi.
- `POST /api/auth/logout` → Menghancurkan sesi.
- `GET /api/auth/me` → (Opsional) Memvalidasi apakah sesi admin saat ini masih aktif.

### Public (Tanpa Auth)

Selalu tambahkan parameter query untuk pagination/limit jika memungkinkan.

- `GET /api/projects` → List proyek (Filter: `is_published = true`).
- `GET /api/projects/:slug` → Detail proyek.
- `GET /api/blogs` → List direktori blog (Filter: `is_published = true`).
- `GET /api/blogs/:slug` → Baca artikel.

### Private (Terproteksi Middleware Auth)

- `GET /api/admin/projects` → List SEMUA proyek (termasuk draf).
- `POST /api/admin/projects` → Buat proyek baru.
- `PUT /api/admin/projects/:id` → Edit proyek yang sudah ada.
- `DELETE /api/admin/projects/:id` → Hapus proyek.
- _(Pola yang persis sama direplikasi untuk entity `/api/admin/blogs`)_

## 5. Saran Arsitektur Backend

Sistem ini akan dibangun menggunakan pondasi utama **Node.js** dan **Express**. Namun, arsitektur dirancang dengan pemikiran jangka panjang (_microservices/modular-ready_):

- **Core API & CRUD (Fase 1)**: Menggunakan **Express.js** (`Node.js`). Sederhana, komunitas besar, dan sangat handal untuk menangani operasi CRUD standar serta _routing_ frontend ke backend.
- **Microservice AI / Heavy Logic (Fase Mendatang)**: Komputasi berat atau integrasi spesifik AI akan dipisahkan menjadi _service_ independen menggunakan **Python** (misal: FastAPI/Flask).
- **Background Jobs / Workers (Fase Mendatang)**: Jika ada kebutuhan pemrosesan data asinkron dalam jumlah masif atau _cron jobs_ berat, akan didelegasikan ke _service_ menggunakan **Go (Golang)**.

### Teknologi Utama (Fase 1 - Express)

- **Framework**: **Express.js** (Ditulis dalam TypeScript).
- **ORM**: **Prisma** atau **Drizzle ORM** untuk PostgreSQL. (Drizzle disarankan untuk kontrol query yang lebih eksplisit, Prisma disarankan untuk kecepatan _development_).
- **Autentikasi**: **JWT (JSON Web Tokens)** dikombinasikan dengan **HttpOnly Cookies**. Ini adalah _best-practice_ teraman untuk meminimalisir pencurian token via serangan XSS. Jangan menyimpan JWT di `localStorage` Frontend.

## 6. Alur Integrasi (Frontend ↔ Backend)

1. **Gatekeeping (Login)**: Administrator mengisi form login di Frontend vue. Vue menembak `/api/auth/login`. Jika sukses, Backend otomatis menyuntikkan `HttpOnly Cookie`. Frontend mencatat status global (misal Pinia store: `isAuthenticated = true`) dan me-routing ke halaman Dashboard.
2. **Operasional CMS**: Saat Frontend Dashboard mengambil data, mengubah, atau menghapus artikel, request `fetch`/`axios` yang terkirim akan otomatis membawa _Cookie_ tersebut. Middleware Backend memeriksa cookie. Jika otentik, jalankan query DB. Jika daluwarsa, tolak request `401 Unauthorized`—lalu Frontend me-redirect administrator keluar ke halaman login kembali.
3. **Public View**: Halaman Publik Vue melakukan fetch data ke rute `GET /api/projects` atau algoritma serupa. Backend akan langsung menembak database untuk data public tanpa perlu mempedulikan Cookie.

## 7. Langkah Implementasi (A to Z)

Instruksi ini agar diikuti secara berurutan oleh _developer_ selanjutnya:

1. **Setup Dasar Backend**: Buat folder proyek (misal: `backend/`), inisialisasi environment Node.js (`npm init -y`), install Express, TypeScript, dan ekstensi CORS/Cookie-Parser.
2. **Setup Database**: Nyalakan daemon PostgreSQL (via Docker atau DB lokal).
3. **Definisi Schema ORM**: Implementasikan struktur tabel `users`, `projects`, `blogs`, dan `activity_logs` di Drizzle ORM. Lakukan migrasi DB pertama.
4. **Seeding Kredensial**: Karena tidak ada halaman "Daftar", buat skrip rahasia atau seeder untuk memasukkan 1 baris email utama dan _password hased_ ke dalam tabel `users`.
5. **Modul Auth**: Bangun logic login. Generate Token JWT. Pasang di HttpOnly Cookie. Buat middleware validasinya.
6. **Modul CMS & Logging**: Implementasikan total 8 endpoint CRUD untuk proyek dan blog (`POST`, `PUT`, `GET`, `DELETE`). Pasangkan di balik middleware Auth. Setiap terjadi mutasi data (CREATE, UPDATE, DELETE), backend WAJIB melakukan insert ke tabel `activity_logs` untuk merekam jejak operasi tersebut.
7. **Modul Public**: Implementasikan endpoints `GET` yang difilter khusus `is_published: true`.
8. **Sanity Check API**: Validasi seluruh endpoint (Testing POST/GET/Error cases) melalui Postman / Insomnia / Bruno sebelum di-bundle bersama Vue.
9. **Integrasikan dengan Vue**: Buka repo Frontend, konfigurasi proxy Vite API (jika dibutuhkan untuk dev local), dan sambungkan ke UI.
10. **letakkan didalam folder service/core**
