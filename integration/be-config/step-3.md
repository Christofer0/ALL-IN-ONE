# Panduan Integrasi Backend & Frontend (Tahap 3: Cashflow)

Dokumen ini adalah instruksi untuk AI Model atau Junior Developer dalam merancang dan mengimplementasikan sistem Backend (Database & API) khusus untuk fitur **Cashflow** (`frontend/src/views/private/Cashflow.vue`).

Gaya bahasa dan arsitektur mengikuti fondasi yang sudah diletakkan pada urutan integrasi sebelumnya.

---

## 1. Analisa Kebutuhan Fitur Cashflow

Berdasarkan analisis pada komponen `Cashflow.vue`, fitur ini berfungsi sebagai pelacak keuangan (pemasukan dan pengeluaran) untuk Admin. 

Kebutuhan utamanya adalah:
- **Pencatatan Transaksi**: Setiap transaksi memiliki rincian tanggal, referensi (deskripsi), kategori, tipe arus kas (pemasukan/pengeluaran), nominal (jumlah), dan catatan opsional.
- **Kategorisasi (Hardcoded Label)**: Pengelompokan transaksi untuk klasifikasi statistik, misalnya: "Freelance", "Food", "Software". Pada tahap ini, referensi kategori di sisi Backend dapat cukup menggunakan tipe *string* sederhana yang disesuaikan dengan daftar di antarmuka pengguna.
- **Statistik & Kalkulasi**: Frontend melakukan kalkulasi dari kumpulan data (List) untuk menampilkan ringkasan Metrik (Total Pemasukan, Net, Savings Rate) serta tampilan Visual (Donut & Bar chart). Backend bertugas murni men-serve valid data transaksi.
- **Sistem Single-Admin**: Seluruh pencatatan merupakan milik aplikasi/Admin secara hierarki tunggal.

## 2. Desain Schema Database (PostgreSQL)

Fitur ini membutuhkan entitas tabel utama yaitu `transactions` (atau istilah lain `cashflows`).

### Table: `transactions`
Digunakan untuk merekam seluruh arus pemasukan dan pengeluaran.

Kolom-kolom yang harus dibangun menggunakan Drizzle ORM:
- `id` (Serial/Int atau UUID, Primary Key)
- `date` (Date) - _Tanggal terjadinya transaksi (YYYY-MM-DD)_
- `description` (String) - _Deskripsi pendek mengenai transaksi_
- `category` (String) - _Kategori transaksi (contoh: "Project", "Food", "Transport")_
- `type` (String/Enum) - _Terbatas pada dua nilai: `"income"` atau `"expense"`_
- `amount` (Numeric/Integer) - _Nominal transaksi bersih (contoh: 3500000)_
- `notes` (Text, Nullable) - _Ruang tambahan untuk catatan detail transaksi_
- `created_at` (Timestamp, Default: Now)
- `updated_at` (Timestamp)

### Table: `activity_logs` (Existing / Reuse)
Mengacu pada pola dasar sistem, setiap kali Admin melakukan mutasi (Create, Update, Delete) pada tabel `transactions`, aksi ini **wajib** dicatat jejaknya pada tabel `activity_logs`.

## 3. Struktur API (RESTful)

Simpan seluruh endpoint ini dalam prefix `/api/admin/cashflow` atau `/api/admin/transactions`. Endpoints akan membutuhkan Guard Middleware untuk Authentication.

### Endpoints
- `GET /api/admin/cashflow` 
  - Fungsi: Mengambil daftar semua arus kas.
  - *Catatan: Untuk saat ini pengurutan dan filter dapat ditangani Frontend melalui client-side array manipulation. Namun siapkan parameter opsional jika dibutuhkan.*
- `POST /api/admin/cashflow` 
  - Fungsi: Membuat sebuah data transaksi baru.
- `PUT /api/admin/cashflow/:id` 
  - Fungsi: Update/merombak data transaksi apabila terjadi salah input.
- `DELETE /api/admin/cashflow/:id`
  - Fungsi: Menghapus sebuah riwayat transaksi.

## 4. Instruksi Implementasi Lanjutan

1. **Buat Schema Database:**
   - Masukkan ke direktori `services/core/src/db/schema`. Definisikan skema untuk `transactions`.
   - Eksekusi _migration command_ Drizzle agar struktur yang didesain ter-terapkan ke database PostgreSQL.

2. **Buat File Layering (Layer Architecture):**
   - Implementasikan fungsi-fungsi query database spesifik menuju file `services/core/src/repositories/transaction.repository.ts`.
   - Bangun validasi dan business logic di dalam `services/core/src/services/transaction.service.ts`.
   - Tangkap jalur Request HTTP di `services/core/src/controllers/transaction.controller.ts`.

3. **Implementasi Activity Log Service:**
   - Di lapisan **Service**, sesudah aksi logic data mutation dinyatakan sukses (`create`, `update`, maupun `delete`), panggil _Activity Log Helper / Repository_ guna mencatat operasi tersebut sebagai interaksi yang terekam. Kealpaan ini akan menyebabkan timeline kegiatan sistem menjadi *out-of-sync*.

4. **Persiapan Routing Murni:**
   - Daftarkan ke `services/core/src/routes/transaction.route.ts` dan tautkan ke main entrypoint aplikasi `index.ts`. Amankan setiap Route path menggunakan Middleware JWT.

5. **Penyelarasan Kode Frontend (Tugas Akhir):**
   - Arahkan ke file `frontend/src/views/private/Cashflow.vue`.
   - Hapus properti _dummy data array_ untuk state `transactions`.
   - Konversikan inisialisasi komponen kedalam metode pengambil data Lifecycle `onMounted`, yang berinteraksi langsung memanggil endopint `GET /api/admin/cashflow`. Gunakan komponen loader yang sesuai layaknya di modul lain jika diperlukan (menggunanakn flag `isLoading=true/false`).
