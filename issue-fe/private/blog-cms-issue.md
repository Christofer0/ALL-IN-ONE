# Task: Membangun Blog CMS (Private Dashboard) & Menghubungkan Backend

Halo AI Assistant, tugas Anda adalah mengimplementasikan antarmuka Manajemen Blog (Blog CMS) pada area *private dashboard* dan melengkapi logika backendnya agar selaras dengan standar *Project CMS* yang sudah ada.

## Target Area
1. Backend: `services/core/src/services/BlogService.ts` 
2. Frontend Router: `frontend/src/router/constants.ts` & `modules/private.ts`
3. Frontend Sidebar: `frontend/src/components/private/Sidebar.vue`
4. Frontend View: `frontend/src/views/private/BlogCms.vue` (File Baru)

## 1. Pembaruan Backend (BlogService.ts)
Mirip dengan `ProjectService.ts`, buka `BlogService.ts` dan tambahkan integrasi **Cloudinary** dan **Sanitasi Data**:
- Import `cloudinary` dari `../utils/cloudinary.js`.
- Buat array `VALID_BLOG_FIELDS` sesuai skema database: `["title", "slug", "category", "excerpt", "content", "coverImage", "isPublished"]`.
- Buat fungsi `sanitizeData(rawData)` dan `extractPublicId(url)`.
- Pada method `create(rawData)`: Lakukan _sanitize_, cek apakah `coverImage` berupa `data:image/` (Base64). Jika ya, upload ke `portfolio_blogs` di Cloudinary dan replace dengan URL-nya.
- Pada method `update(id, rawData)`: Hapus gambar lama dari Cloudinary (jika ada gambar baru yang masuk), lalu upload gambar baru.
- Pada method `delete(id)`: Hapus gambar dari Cloudinary menggunakan `publicId` sebelum memanggil `BlogRepository.delete(id)`.

## 2. Pembaruan Frontend Router 
- Buka `router/constants.ts` dan tambahkan `BLOG_CMS: "blog-cms"` di `ROUTE_NAMES` dan `BLOG_CMS: "/private/blogs"` di `ROUTE_PATHS`.
- Buka `router/modules/private.ts` dan daftarkan rute baru yang memetakan ke `BlogCms.vue`.

## 3. Pembaruan Frontend Sidebar
- Buka `Sidebar.vue`. Di dalam struktur nav `Tools`, tambahkan rute *Blogs CMS* yang menghubungkan ke `ROUTE_PATHS.BLOG_CMS`. Gunakan ikon SVG dokumen/pen.

## 4. Pembuatan BlogCms.vue
Buat file baru `frontend/src/views/private/BlogCms.vue`. Konstruksinya harus meniru `ProjectCms.vue` secara persis (karena menggunakan tema `.private` yang sama):
- **Tabel Data**: Menampilkan Title, Category, Status (Published/Draft), dan Date. Punya tombol Edit & Delete.
- **Header & Stats**: Punya pencarian, Stats card (Total, Published, Draft).
- **Form Modal**: 
  - Input: Title, Category, Excerpt, Content (bisa textarea dulu), Slug (otomatis dibuat jika kosong menggunakan fungsi `slugify`).
  - Fitur File Upload: Modifikasi gambar menggunakan `FileReader` agar menjadi Base64 string yang ditaruh di `form.coverImage`.
  - Toggle: `isPublished`.
- **Keamanan UI**: Pastikan ada fungsionalitas `isSaving` dengan `try...finally` agar tombol Save ter-*disabled* saat API request berlangsung (mencegah klik ganda!).

Silakan kerjakan poin per poin!
