# Panduan Integrasi Frontend & Backend (Tahap 1: Koneksi Dasar)

Dokumen ini adalah instruksi untuk AI Model / Junior Developer untuk mengganti **Mock Data** di Frontend Vue 3 dengan pemanggilan _real API_ ke Backend Express yang sudah kita bangun di `services/core`.

**Target Operasi:**

1. Authentication (Login & Session Check)
2. Public Data (Menampilkan list Project & Blog ke publik)
3. Private CMS (Menyambungkan tabel CMS dengan data dari API admin)

---

## Aturan Utama (Wajib Dibaca!)

Eksekutor wajib mematuhi aturan ini saat melakukan _fetch_ data:

1. Backend berjalan di `http://localhost:9991`. Frontend di `http://localhost:5173`.
2. Backend menggunakan sistem **HttpOnly Cookie** untuk otentikasi. Karena itu, SETIAP kali menggunakan `fetch` API atau `axios`, Anda HARUS menyertakan opsi **`credentials: 'include'`** (atau `withCredentials: true` di Axios). Jika tidak, otentikasi akan selalu gagal!
3. Gunakan composables (misal `useFetch`) atau inisialisasi Axios instance terpusat (contoh di `src/utils/api.ts` atau `src/services/api.ts`) untuk menghindari repitisi kode.

---

## Langkah 1: Setup Axios / Fetch Client (Opsional tapi disarankan)

Buat satu _instance_ HTTP client di Frontend yang secara otomatis menangani _Base URL_ dan _Credentials_.

- **Task**: Buat file `frontend/src/utils/api.ts`.
- Konfigurasi:
  - `baseURL: 'http://localhost:9991/api'`
  - `withCredentials: true`

---

## Langkah 1.5: Setup Pinia State Management

Frontend membutuhkan **Pinia** untuk mengelola state global, terutama untuk status autentikasi pengguna agar reaktif di semua komponen.

- **Task**: Instalasi dan konfigurasi Pinia.
- **Instruksi**:
  1. Pastikan Pinia terpasang (`npm install pinia`) dan didaftarkan pada `/frontend/src/main.ts` (`app.use(createPinia())`).
  2. Buat file `frontend/src/stores/auth.ts`.
  3. Buat implementasi `useAuthStore` yang menyimpan _state_ `isAuthenticated` dan `user` object.
  4. Implementasikan aksi (`actions`) seperti `login`, `logout`, dan `checkSession` di store ini dengan memanggil metode dari instance Axios (`api.ts`).

---

## Langkah 2: Mengintegrasikan Autentikasi

Saat ini `Login.vue` mungkin masih menggunakan logika dummy atau hanya mengecek statis `admin@admin.com`.

- **Target File**: `frontend/src/views/utilities/Login.vue` (atau jika sudah dipindah ke direktori lain).
- **Instruksi**:
  1. Ubah fungsi penanganan form submit.
  2. Lakukan `POST` ke `/api/auth/login` dengan payload `{ email, password }`.
  3. Jika berhasil, Backend otomatis set Cookie (Frontend tidak perlu simpan token di localStorage).
  4. Panggil action login dari `useAuthStore` (Pinia) agar state global mengetahui user telah terautentikasi (`isAuthenticated = true`). Lalu navigasikan via router ke `/dashboard`.
  5. _Challenge_: Evaluasi juga file routing (`router/index.ts` atau `router/modules/private.ts`) untuk menggunakan endpoint `GET /api/auth/me` sebagai _guard_ perlindungan rute.

---

## Langkah 3: Mengintegrasikan Halaman Publik

Halaman-halaman publik saat ini berisi object Array statis di dalam file `.vue`-nya. Anda perlu menghapusnya dan diganti dengan State Reaktif yang dipupuk via Lifecycle Hooks.

### A. Projects Public Showcase

- **Target File**: `frontend/src/views/public/Projects.vue` dan `ProjectDetail.vue`.
- **Instruksi**:
  1. Bersihkan _mock data_ `projects`.
  2. Saat `onMounted`, panggil endpoint: `GET /api/projects`. (Endpoint ini sudah otomatis mengambil data yang `isPublished: true`).
  3. Untuk halaman detail, panggil: `GET /api/projects/:slug`.

### B. Blog Public Showcase

- **Target File**: `frontend/src/views/public/Blog.vue`.
- **Instruksi**:
  1. Bersihkan _mock data_ `articles`.
  2. Saat `onMounted`, panggil endpoint: `GET /api/blogs`.

---

## Langkah 4: Mengintegrasikan Private Dashboard (CMS)

Di dashboard, Admin bisa melihat semua data, termasuk yang berstatus draf, dan melakukan operasi CRUD.

### A. Management Projects

- **Target File**: `frontend/src/views/private/ProjectCms.vue` (atau file serupa yang mengelola project).
- **Instruksi**:
  1. **Read**: Ambil seluruh data proyek (termasuk draft) dengan memanggil `GET /api/admin/projects`.
  2. **Create**: Hubungkan tombol "Simpan/Tambah" untuk menembak `POST /api/admin/projects`.
  3. **Update**: Form edit diarahkan ke `PUT /api/admin/projects/:id`.
  4. **Delete**: Tambahkan fungsi hapus dengan `DELETE /api/admin/projects/:id`.
  - Catatan: Jangan lupa _refresh list_ atau update state list komponen Vue setelah berhasil memanggil POST/PUT/DELETE.

## Testing Output

Setelah AI/Developer melaksanakan hal-hal di atas:

- Halaman public (`/projects` dan `/blog`) seharusnya menampilkan data yang ditarik dari PostgreSQL.
- Form Login harus validasi email/password langsung ke DB via backend.
- Menekan logout akan menghapus cookie tanpa memutus browser.
