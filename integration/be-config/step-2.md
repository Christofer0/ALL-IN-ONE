# Panduan Integrasi Backend & Frontend (Tahap 2: Catatan / Notes)

Dokumen ini adalah instruksi untuk AI Model atau Junior Developer dalam merancang dan mengimplementasikan sistem Backend (Database & API) khusus untuk fitur **Notes** (`frontend/src/views/private/Notes.vue`).

Gaya bahasa dan arsitektur mengikuti fondasi yang sudah diletakkan pada `integration/be-config/step-1.md`.

---

## 1. Analisa Kebutuhan Fitur Notes

Berdasarkan analisis pada komponen `Notes.vue`, fitur ini adalah aplikasi pencatatan dengan sistem berbasis folder (kategori), tag, dan editor Markdown. 

Kebutuhan utamanya adalah:
- **Hierarki Folder vs Catatan**: Setiap catatan (note) berada di dalam satu direktori (folder).
- **Rich Data**: Catatan memiliki atribut seperti daftar tag (untuk kategorisasi menyilang), status disematkan (pinned), konten berbasis Markdown, dan judul.
- **Sistem Single-Admin**: Sama seperti Entitas Project dan Blog, semua referensi kepemilikan mutlak milik 1 Admin (meskipun tabel user tidak perlu secara eksplisit di-relasikan).

## 2. Desain Schema Database (PostgreSQL)

Fitur catatan membutuhkan dua entitas utama: `folders` dan `notes`.

### Table: `folders`
Menyimpan struktur direktori catatan. Disertai kolom `icon` yang bisa berisi emoji atau identifier ikon ringan untuk UI.

- `id` (Serial/Int atau UUID, Primary Key)
- `name` (String) - _Contoh: "Personal", "Projects", "Ideas"_
- `icon` (String) - _Contoh: "🚀", "💡"_
- `created_at` (Timestamp, Default: Now)
- `updated_at` (Timestamp)

_Catatan: Menurut Mockup UI, ada satu folder default bernama "All Notes" (biasanya direpresentasikan secara logikal dari frontend atau id: 1). Jika diinisialisasi melalui seeder, pastikan id 1 ada._

### Table: `notes`
Menyimpan detail catatan itu sendiri. Di sinilah letak konten Markdown.

- `id` (Serial/Int atau UUID, Primary Key)
- `folder_id` (Type Index ke `folders.id`) - _Relasi tempat catatan disimpan_
- `title` (String) - _Judul dari catatan (di UI diambil otomatis dari elemen `# H1` isi MD jika memungkinkan)_
- `content` (Text) - _Isi catatan mentah dalam format Markdown_
- `tags` (JSONB / Array of String) - _Array tag. Contoh: `["ideas", "personal"]`_
- `is_pinned` (Boolean, default: false) - _Status apakah catatan dilekatkan di atas list_
- `created_at` (Timestamp, Default: Now)
- `updated_at` (Timestamp)

### Table: `activity_logs` (Existing / Reuse)
Mengacu pada `step-1.md`, tabel ini digunakan untuk mencatat riwayat operasi sistem. Setiap kali Admin melakukan Create, Update, atau Delete pada Folder atau Notes, sistem **wajib** mencatat aksi tersebut di tabel ini.

## 3. Struktur API (RESTful)

Seluruh Endpoint ini dilindungi oleh Middleware Auth (karena hanya ditujukan untuk layar CMS internal admin):

### Folders Endpoints
- `GET /api/admin/folders` → List semua folder (digunakan untuk sidebar).
- `POST /api/admin/folders` → Buat folder baru.
- `PUT /api/admin/folders/:id` → Update nama/ikon folder.
- `DELETE /api/admin/folders/:id` → Hapus folder. (Tentukan aturan logika: apakah catatan di bawah folder ini akan ikut terhapus (*Cascade*) atau dipindah ke 'All Notes' / dilarang terhapus).

### Notes Endpoints
- `GET /api/admin/notes` → List semua catatan. Mendukung *Query Parameters* seperti `?folderId=2` atau `?search=keyword` untuk search.
- `GET /api/admin/notes/:id` → Dapatkan sebuah detil (content) catatan untuk ditaruh di editor.
- `POST /api/admin/notes` → Buat catatan baru.
- `PUT /api/admin/notes/:id` → Update catatan yang ada (mencakup payload judul, content md, tags array, pin states).
- `DELETE /api/admin/notes/:id` → Hapus catatan.

## 4. Instruksi Implementasi Lanjutan

1.  **Struktur Layered Architecture:** Anda **DIWAJIBKAN** untuk menggunakan arsitektur berlapis (Layered Architecture) yang sudah ditetapkan, yaitu pemisahan antara `Controller`, `Service`, dan `Repository`.
    *   **Router/Controller:** Hanya menerima request, memvalidasi input, dan memanggil Service.
    *   **Service:** Inti bisnis logika. Memproses data, memanggil Repository, dan (penting) memanggil fungsi log aktivitas di sini.
    *   **Repository:** Berinteraksi langsung dengan Database (ORM Prisma/Drizzle).
2.  **Eksekusi Konfigurasi DB:** Modifikasi schema Drizzle ORM atau Prisma saat ini dengan menambahkan dua entitas tabel di atas. Lakukan iterasi command migrasi untuk menerapkan di PostgreSQL.
3.  **Implementasi Fitur Log (Activity Logs):** Di dalam layer `Service`, setiap kali terjadi operasi mutasi data (`CREATE`, `UPDATE`, `DELETE`) untuk Folder atau Note, Anda **HARUS** menyisipkan pemanggilan repositori log untuk mencatat rekaman ke dalam tabel `activity_logs`. Ini wajib dilakukan setelah mutasi data berhasil.
4.  **Terapkan Proteksi Endpoint:** Ingat selalu pasang Guard Middleware (pemroses Auth JWT / Cookie) pada semua routes `/api/admin/notes` dan `/api/admin/folders` tanpa terkecuali.
5.  **Revisi UI (Opsi Frontend)**: Di file `Notes.vue` yang sudah berjalan menggunakan mock data tĩnh (*ref arrays*), ganti pemanggilan logic ini menuju `fetch` REST Calls axios/utilitas `api.ts` begitu Backend endpoint ini siap dan berjalan stabil di tahap pengecekan Insomnia / Postman.
