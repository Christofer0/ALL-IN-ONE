# Step 2: Dynamic Encrypted System Settings (API Keys & SMTP)

**Context & Architecture Decision**:
Kita telah memutuskan untuk membuat aplikasi ini sefleksibel mungkin. Alih-alih menyimpan API Keys (OpenAI, Anthropic, Github) dan konfigurasi SMTP (Email & Password) secara *hardcoded* di `.env`, kita akan menyimpannya di Database. 

Namun, **MENYIMPAN SECRET DI DATABASE SEBAGAI PLAIN TEXT ADALAH DOSA BESAR DALAM KEAMANAN**. Oleh karena itu, tugas utamamu di tahap ini adalah mengimplementasikan sistem penyimpanan dinamis yang dienkripsi secara *two-way* (bisa dienkripsi dan didekripsi) menggunakan standar industri (AES-256).

Berikut adalah arahan implementasi (Tolong ikuti dengan saksama):

---

## 1. Persiapan Keamanan (Encryption Utility)
Sebelum menyentuh database, kamu harus membuat *utility* untuk mengenkripsi dan mendekripsi string.
- **Lokasi**: Buat file baru di `services/core/src/utils/encryption.ts`.
- **Instruksi**:
  1. Tambahkan environment variable baru di `services/core/.env` bernama `ENCRYPTION_MASTER_KEY` (harus string acak 32 karakter).
  2. Gunakan modul bawaan Node.js yaitu `crypto`.
  3. Buat dua fungsi: `encrypt(text: string): string` dan `decrypt(hash: string): string`.
  4. Rekomendasi algoritma: `aes-256-gcm` atau `aes-256-cbc`. Pastikan kamu menyimpan Initialization Vector (IV) bersamaan dengan hasil enkripsi (biasanya digabung dengan format `iv:encryptedData`).

## 2. Database Schema
Buat tabel baru khusus untuk menyimpan konfigurasi sistem.
- **Lokasi**: Buat file `services/core/src/db/schema/system_settings.ts`.
- **Kolom yang disarankan**:
  - `id` (uuid, PK)
  - `openaiKey` (text, nullable) - *Akan menyimpan data terenkripsi*
  - `anthropicKey` (text, nullable) - *Akan menyimpan data terenkripsi*
  - `githubKey` (text, nullable) - *Akan menyimpan data terenkripsi*
  - `smtpEmail` (varchar, nullable) - *Bisa plain text karena email bukan secret*
  - `smtpPassword` (text, nullable) - *Akan menyimpan data terenkripsi*
  - `updatedAt` (timestamp)
- **Catatan Senior**: Karena sistem ini untuk satu user (Personal OS), tabel ini secara praktis hanya akan memiliki 1 baris data (single row record).

## 3. Backend API (Controller & Route)
Buat service dan controller untuk menangani CRUD settings ini.
- **Endpoint 1**: `GET /api/settings/secrets`
  - **CRITICAL RULE**: Jangan pernah mengirimkan API Key asli kembali ke frontend!
  - Endpoint ini hanya boleh mengembalikan data yang sudah disamarkan (Masked). 
  - *Contoh response*: `{ openai: "sk-...xxxx", github: "ghp_...xxxx", smtpEmail: "admin@domain.com", hasSmtpPassword: true }`.
- **Endpoint 2**: `PUT /api/settings/secrets`
  - Menerima payload dari frontend.
  - Sebelum di-insert/update ke database, jalankan fungsi `encrypt()` pada field yang berisi secret/password.

## 4. Frontend Integration (`Settings.vue`)
- Buka `frontend/src/views/private/Settings.vue`.
- **Tab API Keys**: Hubungkan form OpenAI, Anthropic, dan Github dengan endpoint yang baru kamu buat.
- **Tambahkan UI SMTP**: Di bawah bagian API Keys (atau buat section baru), tambahkan form input untuk `SMTP Email` dan `SMTP Password`.
- Pastikan saat komponen di-mount, form memanggil `GET` untuk menampilkan data *masked*. Jika user mengisi input baru, kirim data asli melalui `PUT`.

---

**Pesan dari Senior:**
Kerjakan pelan-pelan. Pastikan fungsi enkripsi berjalan sempurna terlebih dahulu (coba buat unit test kecil atau jalankan script standalone) sebelum kamu mengintegrasikannya ke database. Kalau ada yang bingung soal `crypto` di Node.js, baca dokumentasi resminya. Good luck!
