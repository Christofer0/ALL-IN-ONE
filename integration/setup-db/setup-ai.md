# Setup Lingkungan Backend AI (FastAPI & Python)

Dokumen ini menjelaskan langkah-langkah untuk menyiapkan environment pengembangan untuk layanan **AI Chat Assistant** yang berbasis Python dan FastAPI.

---

## 1. Persiapan Direktori

Pastikan Anda berada di direktori layanan AI sebelum memulai:

```bash
cd services/ai
```

---

## 2. Setup Virtual Environment (venv)

Sangat disarankan menggunakan `virtual environment` agar library Python tidak bentrok dengan library global atau project lain.

### Create venv

Jalankan perintah berikut untuk membuat folder venv:

```bash
python -m venv venv
```

### Activate venv

Setelah dibuat, aktifkan environment tersebut:

- **Mac / Linux:**
  ```bash
  source venv/bin/activate
  ```

---

## 3. Instalasi Dependencies

Setelah venv aktif (ditandai dengan munculnya `(venv)` di terminal), instal semua library yang dibutuhkan:

```bash
pip install -r requirements.txt
```

---

## 4. Konfigurasi Environment Variable (`.env`)

Salin atau buat file `.env` di dalam `services/ai/` dan sesuaikan nilainya:

```env
PORT=9993
DATABASE_URL=postgres://postgres:abcd1234@localhost:5432/portofolio
GEMINI_API_KEY=AIzaSyB... (Masukkan API Key Gemini Anda di sini)
CORE_API_URL=http://localhost:9991/api/admin
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

> [!IMPORTANT]
> Masukkan API Key yang valid dari [Google AI Studio](https://aistudio.google.com/) ke dalam `GEMINI_API_KEY` agar AI dapat memberikan respons.

> [!NOTE]
> Jika Anda mengikuti pola isolasi database di `schema-db.md`, Anda dapat menambahkan `?search_path=ai_service` di akhir `DATABASE_URL`. Namun, pastikan schema `ai_service` sudah dibuat di PostgreSQL terlebih dahulu.

---

## 5. Menjalankan Aplikasi

Setelah semua siap, jalankan server FastAPI:

```bash
python main.py
```

Aplikasi akan berjalan di `http://localhost:8000`. Anda dapat mengakses dokumentasi API interaktif (Swagger UI) di:
[http://localhost:8000/docs](http://localhost:8000/docs)

---

## Verifikasi Akhir

1. Pastikan muncul logo asisten di terminal saat startup.
2. Pastikan tabel `chat_sessions` dan `chat_messages` terbuat secara otomatis di database.
3. Buka dashboard frontend, masuk ke menu **AI Chat**, dan coba kirim pesan pertama Anda.

---

END.
