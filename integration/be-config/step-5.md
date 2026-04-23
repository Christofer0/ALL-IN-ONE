# Panduan Integrasi Backend & Frontend (Tahap 5: Contact Form)

Dokumen ini adalah instruksi untuk Junior Developer dalam merancang dan mengimplementasikan sistem Backend (Database & API) khusus untuk fitur **Contact Form** (`frontend/src/views/public/Contact.vue`).

Fitur ini bertujuan untuk memungkinkan user mengirim pesan melalui website, menyimpan data tersebut ke database, serta mengirim notifikasi email menggunakan service yang sudah ada (`email_service.go`) di dalam `services/worker`.

---

## 1. Analisa Kebutuhan Fitur Contact Form

Berdasarkan analisis pada komponen `Contact.vue`, fitur ini berfungsi untuk menerima pesan dari user secara langsung melalui form.

Kebutuhan utamanya adalah:

- **Input Data User**:
  - Nama lengkap
  - Alamat email
  - Subject / topik
  - Pesan / isi diskusi

- **Validasi Sederhana**:
  - Field wajib tidak boleh kosong
  - Validasi email format
  - Validasi checkbox "I'm not a robot" (sementara boolean/dummy)

- **Penyimpanan Data**:
  - Semua pesan harus disimpan ke database untuk keperluan tracking

- **Notifikasi Email**:
  - Setiap pesan yang masuk akan dikirim ke email owner menggunakan service existing (`email_service.go`)

- **Integrasi Worker**:
  - Email tidak dikirim langsung, tetapi menggunakan mekanisme scheduler (reuse logic existing)

---

## 2. Desain Schema Database

Fitur ini membutuhkan satu tabel utama: `contact_messages`.

### Table: `contact_messages`

Digunakan untuk menyimpan seluruh pesan yang dikirim melalui Contact Form.

Kolom-kolom yang harus dibangun:

- `id` (Serial/Int atau UUID, Primary Key)
- `name` (String) - _Nama lengkap user_
- `email` (String) - _Alamat email user_
- `subject` (String) - _Topik pesan_
- `message` (Text) - _Isi pesan_
- `is_not_robot` (Boolean) - _Validasi checkbox (dummy sementara)_
- `created_at` (Timestamp, Default: Now)

---

## 3. Struktur API (RESTful) via Golang Worker

Endpoint ini akan ditempatkan di `services/worker` dan digunakan langsung oleh frontend.

### Endpoints (Contact Form)

- `POST /api/contact`
  - Fungsi: Mengirim pesan dari user
  - Behavior:
    1. Validasi input
    2. Simpan ke database
    3. Trigger email via `email_service`
    4. Return response sukses

---

## 4. Instruksi Implementasi Lanjutan (Golang Layered Architecture)

Bekerjalah di dalam direktori `services/worker`.

### 1. **Buat Model / Entity (Database Layer)**

- Buat struct `ContactMessage`
- Pastikan field sesuai dengan schema
- Tambahkan ke proses migrasi database

---

### 2. **Buat Layer Repository (`repositories/`)**

- Buat `ContactRepository`
- Fungsi minimal:
  - `Create(message *ContactMessage)`

Repository hanya bertugas untuk komunikasi ke database (insert data).

---

### 3. **Buat Layer Service (`services/`)**

Gunakan **email_service.go yang sudah ada**, jangan membuat logic email baru.

Tambahkan method baru:

- `SendContactEmail(name, email, subject, message string)`

Behavior:

- Format body email (HTML)
- Gunakan struct `ScheduledEmail`
- Set:
  - `TargetDate` = hari ini
  - `TargetTime` = sekarang
  - `Status` = `"pending"`

- Gunakan function existing:
  - `ScheduleEmail(...)`

Tujuan:
➡️ reuse system scheduler yang sudah ada
➡️ tidak membuat email logic baru

---

### 4. **Buat Layer Controller / Handler (`handlers/`)**

Buat `ContactHandler`

Function utama:

- `SendMessage`

Alur:

1. Bind request JSON ke struct
2. Validasi:
   - Field wajib
   - `is_not_robot == true`

3. Simpan ke database
4. Panggil:
   - `SendContactEmail(...)`

5. Return response sukses / error

---

### 5. **Daftarkan Router**

Tambahkan endpoint:

```go
POST /api/contact
```

Hubungkan ke `ContactHandler.SendMessage`

---

## 5. Request Format (Frontend → Backend)

Payload yang dikirim dari frontend:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Project Inquiry",
  "message": "Saya tertarik kerja sama",
  "is_not_robot": true
}
```

---

## 6. Penyelarasan Kode Frontend

Update logic pada `Contact.vue`:

### Sebelumnya:

- Menggunakan `setTimeout` (dummy)

### Setelah integrasi:

- Gunakan `fetch` / `axios` ke endpoint:

```
POST /api/contact
```

### Behavior:

- Saat submit:
  - set `isSubmitting = true`

- Jika sukses:
  - tampilkan state sukses (`isSuccess = true`)

- Jika gagal:
  - tampilkan error message

---

## 7. Flow Akhir Sistem

Alur lengkap sistem:

Frontend (Contact.vue)
→ API `/api/contact`
→ Save ke `contact_messages`
→ Trigger `email_service`
→ Masuk ke `scheduled_emails`
→ Worker Cron kirim email

---

## 8. Catatan Penting

- ❌ Jangan membuat service email baru
- ✅ Gunakan `email_service.go`
- ✅ Gunakan scheduler existing
- ⚠️ Validasi robot masih dummy (boolean)
- ⚠️ Belum menggunakan reCAPTCHA asli (bisa di tahap berikutnya)

---

END.
