# Pemisahan Schema Database (Multi-Service Isolation)

Dokumen ini menjelaskan langkah-langkah untuk memisahkan schema database antara **Core API (Node.js)** dan **Go Worker**, guna menghindari konflik saat melakukan `drizzle-kit push` atau migrasi otomatis.

## 1. Masalah
Secara default, Drizzle dan GORM menggunakan schema `public`. Saat `drizzle-kit push` dijalankan di Node.js, Drizzle akan membandingkan schema yang ada di database (termasuk tabel milik Go) dengan file schema TypeScript-nya. Karena tabel milik Go tidak ada di definisi Drizzle, Drizzle akan mengira tabel tersebut harus dihapus.

## 2. Solusi: Schema Isolation
- **Schema `public`**: Khusus untuk Core API (Node.js).
- **Schema `email_service`**: Khusus untuk Go Worker.

---

## Langkah-Langkah Implementasi

### Step 1: Membuat Schema di PostgreSQL
Jalankan perintah SQL berikut melalui terminal database (psql), DBeaver, atau tool database Anda lainnya:

```sql
-- Buat schema khusus untuk worker
CREATE SCHEMA IF NOT EXISTS email_service;
```

---

### Step 2: Konfigurasi Go Worker (GORM)
Kita perlu mengarahkan GORM untuk menggunakan schema `email_service` sebagai prioritas pertama.

1. Buka file `.env` yang digunakan oleh Go Worker (cek di `services/worker/.env` atau file `.env` utama).
2. Ubah `DATABASE_URL` dengan menambahkan parameter `search_path`:

```env
# Sebelumnya
DATABASE_URL=postgres://user:pass@localhost:5432/dbname?sslmode=disable

# Sesudah (Tambahkan search_path)
DATABASE_URL=postgres://user:pass@localhost:5432/dbname?sslmode=disable&search_path=email_service
```

3. GORM secara otomatis akan membuat tabel hasil `AutoMigrate` ke schema pertama yang ditemukan di `search_path`.

---

### Step 3: Konfigurasi Core API (Node.js + Drizzle)
Agar Drizzle tidak "melihat" schema lain dan hanya fokus pada schema `public`, kita perlu menambahkan filter.

1. Buka file `services/core/drizzle.config.ts`.
2. Tambahkan properti `schemaFilter`:

```ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  // Tambahkan baris ini agar Drizzle HANYA mengelola schema public
  schemaFilter: ["public"],
});
```

---

### Step 4: Migrasi Tabel existing (Opsional)
Jika tabel worker sebelumnya sudah ada di `public`, Anda bisa memindahkannya:

```sql
ALTER TABLE public.scheduled_emails SET SCHEMA email_service;
ALTER TABLE public.email_templates SET SCHEMA email_service;
ALTER TABLE public.scheduler_logs SET SCHEMA email_service;
ALTER TABLE public.activity_logs SET SCHEMA email_service;
ALTER TABLE public.contact_messages SET SCHEMA email_service;
```

---

## 3. Verifikasi
1. Jalankan `npm run db:push` di direktori `services/core`.
2. Drizzle sekarang hanya akan menampilkan perubahan terkait tabel habit, notes, dll yang ada di schema `public`.
3. Jalankan Go Worker. Cek di database apakah tabel baru sudah muncul di dalam schema `email_service`.

---

## Keuntungan
- **Safety**: Node.js tidak akan menghapus tabel Go secara tidak sengaja.
- **Organization**: Data terorganisir dengan baik berdasarkan domain service.
- **Scalability**: Memudahkan jika suatu saat service harus dipisah ke database yang berbeda.
