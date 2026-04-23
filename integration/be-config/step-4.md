# Panduan Integrasi Backend & Frontend (Tahap 4: Email Scheduler)

Dokumen ini adalah instruksi untuk Junior Developer dalam merancang dan mengimplementasikan sistem Backend (Database & API) khusus untuk fitur **Email Scheduler** (`frontend/src/views/private/EmailScheduler.vue`).

Berbeda dengan tahap sebelumnya yang menggunakan Node.js (di `services/core`), layanan ini akan ditempatkan di `services/worker` dan dibangun menggunakan **Golang** dengan arsitektur berlapis (Layered Architecture).

---

## 1. Analisa Kebutuhan Fitur Email Scheduler

Berdasarkan analisis pada komponen `EmailScheduler.vue`, fitur ini berfungsi untuk menjadwalkan, mengelola, dan mengirim email secara otomatis.

Kebutuhan utamanya adalah:
- **Penjadwalan Email**: Menyimpan data email yang akan dikirim, termasuk penerima (to), subjek, isi (body), batas tanggal dan waktu pengiriman (schedule date & time), aturan pengulangan (repeat), serta status pengiriman.
- **Template Email**: Menyimpan daftar template cepat untuk subjek dan isi email agar mudah digunakan kembali.
- **Riwayat Pengiriman (History)**: Melacak email yang sudah berhasil dikirim berserta waktu pengirimannya.
- **Worker Service**: Karena tugas ini berkaitan dengan *background processing* (mengirim email pada waktu tertentu), maka sangat tepat jika backend diletakkan di *service worker* menggunakan Golang yang terkenal sangat baik untuk konkurensi (goroutines).

## 2. Desain Schema Database

Fitur ini membutuhkan dua entitas tabel utama: `scheduled_emails` dan `email_templates`. Karena layanan dikelola terpisah, tabel ini harus dimasukkan ke dalam sistem migrasi database yang digunakan oleh worker.

### Table: `scheduled_emails`
Digunakan untuk menyimpan antrean email yang akan dikirim serta riwayat email yang sudah terkirim.

Kolom-kolom yang harus dibangun:
- `id` (Serial/Int atau UUID, Primary Key)
- `recipient_email` (String) - _Alamat email tujuan perjalanan (frontend menggunakan key `to`)_
- `subject` (String) - _Judul dari email_
- `body` (Text) - _Isi pesan email_
- `target_date` (Date) - _Tanggal penjadwalan (YYYY-MM-DD)_
- `target_time` (Time) - _Waktu penjadwalan (HH:MM)_
- `repeat_rule` (String/Enum) - _Aturan pengulangan: `"none"`, `"daily"`, `"weekly"`, atau `"monthly"`_
- `status` (String/Enum) - _Status pengiriman: `"pending"` atau `"sent"`_
- `sent_at` (Timestamp, Nullable) - _Waktu spesifik saat email benar-benar dikirim_
- `created_at` (Timestamp, Default: Now)
- `updated_at` (Timestamp)

### Table: `email_templates`
Digunakan untuk menyimpan template cepat penyusunan email.

Kolom-kolom yang harus dibangun:
- `id` (Serial/Int atau UUID, Primary Key)
- `name` (String) - _Nama template (contoh: "Weekly Digest")_
- `icon` (String) - _Emoji icon untuk mempermudah identifikasi antarmuka_
- `subject` (String) - _Pola subjek email_
- `body` (Text) - _Pola body pesan_
- `created_at` (Timestamp, Default: Now)
- `updated_at` (Timestamp)

### Table: `scheduler_logs`
Digunakan khusus untuk memisahkan log aktivitas Worker dari log admin (`activity_logs`), guna mempermudah _tracing_ dan menjaga agar _core_ tetap bersih.

Kolom-kolom yang harus dibangun:
- `id` (Serial/Int atau UUID, Primary Key)
- `action_type` (String) - _Contoh: `"SCHEDULE_CREATED"`, `"SCHEDULE_CANCELLED"`, `"EMAIL_SENT"`, `"TEMPLATE_CREATED"`_
- `email_id` (Int/UUID, Nullable) - _Referensi ke `scheduled_emails.id` (jika log berkaitan dengan email spesifik)_
- `template_id` (Int/UUID, Nullable) - _Referensi ke `email_templates.id` (ditambahkan agar log pengeditan atau penggunaan template juga jelas)_
- `message` (Text) - _Detail keterangan eksekusi_
- `created_at` (Timestamp, Default: Now)

## 3. Struktur API (RESTful) via Golang Worker

Simpan seluruh endpoint ini dalam prefix routing Golang di `services/worker`. Endpoint ini melayani permintaan langsung dari Frontend.

### Endpoints (Email Scheduling)
- `GET /api/worker/emails` 
  - Fungsi: Mengambil daftar semua email (baik `pending` maupun `sent`).
- `POST /api/worker/emails` 
  - Fungsi: Menjadwalkan / membuat antrean email baru.
- `DELETE /api/worker/emails/:id`
  - Fungsi: Membatalkan / menghapus jadwal email (`pending`).

### Endpoints (Templates)
- `GET /api/worker/templates`
  - Fungsi: Mengambil daftar opsi template.

## 4. Instruksi Implementasi Lanjutan (Golang Layered Architecture)

Bekerjalah di dalam direktori `services/worker`. Gunakan struktur direktori Golang yang modern (seperti pola `internal/` atau MVC berlapis).

1. **Buat Model / Entity (Database Layer):**
   - Buat struct Golang untuk merepresentasikan `ScheduledEmail` dan `EmailTemplate`.
   - Lakukan migrasi skema database (baik itu menggunakan file skema SQL murni atau pustaka ORM seperti GORM/Ent, ikuti standard repo).

2. **Buat Layer Repository (`repositories/`)**
   - Bangun `EmailRepository` dan `TemplateRepository` (biasanya dalam bentuk Interface dan struct implementasinya).
   - Layer ini hanya bertugas melakukan eksekusi query ke PostgreSQL (contoh: `.Save()`, `.FindAll()`, `.Delete()`).

3. **Buat Layer Service (`services/`)**
   - Bangun `EmailService` yang menangani logika bisnis. 
   - Service ini akan memanggil fungsi dari Repository. Validasi data masuk (seperti memastikan format email valid atau waktu penjadwalan logis) dilakukan di sini.
   - **Tugas Khusus Worker:** Di dalam service atau folder khusus (misal `jobs/` atau `workers/`), buat *Goroutine Job Scheduler* (sebaiknya menggunakan Cron library golang seperti `robfig/cron`) yang memeriksa secara berkala: *"Apakah sekarang ada email berstatus `pending` yang `target_date` & `target_time` nya sudah tercapai?"*. Jika ya, kirim email (dummy implementation/SMTP log), lalu tandai sebagai `sent` dan catat `sent_at`.
   - **Isolated Logging (PENTING):** Pastikan untuk selalu mencatat _event_ krusial (seperti ketika ada penjadwalan baru dibuat, dibatalkan, maupun sukses/gagal tereksekusi oleh worker) ke dalam tabel `scheduler_logs`. Pemisahan tabel ini dari `activity_logs` milik Core bertujuan agar foki _tracing_ eksekusi _background task_ tetap terisolasi dan mudah dianalisis.

4. **Buat Layer Controller / Handler (`controllers/` atau `handlers/`)**
   - Bangun `EmailController`. Fungsi ini akan menangkap HTTP Request, meng-_unmarshal_ JSON payload ke DTO (Data Transfer Object), memanggil logic dari layer `service`, dan membalas dengan status HTTP response (`Context.JSON()` jika menggunakan framework seperti Gin/Fiber).

5. **Daftarkan Router:**
   - Sambungkan fungsi Controller ke HTTP Router framework yang digunakan, tepat di entrypoint file (contoh `main.go` atau `router/router.go`).

6. **Penyelarasan Kode Frontend:**
   - Setelah API Golang siap, arahkan kembali ke `frontend/src/views/private/EmailScheduler.vue`.
   - Ubah logika `dummy data array` (`emails` dan `templates`) menjadi state dinamis.
   - Eksekusi Fetch request ke endpoint `/api/worker/...` di `onMounted` dan sesuaikan metode aksinya (`saveEmail`, `cancelEmail`).
