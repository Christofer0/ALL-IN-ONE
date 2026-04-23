# Task / Prompt untuk Junior Dev atau AI (Model Murah)

## Pelajari Dahulu

Pelajari file referensi desain statis HTML di `test/claude/public/project_detail.html`.
Kenali struktur layout utama (terdiri dari *Hero Header*, *Article Body* tipe _Prose_, dan *Sidebar TOC*), serta efek hover dinamis dan sistem *scroll spy* untuk Table of Contents (TOC).

## Tujuan Utama

Mengonversi desain statis (berbasis Tailwind CSS murni) dari `test/claude/public/project_detail.html` menjadi komponen Vue 3 (`ProjectDetail.vue`) dengan Composition API.
Hal terpenting adalah **DILARANG** menggunakan layout atau namespace CSS `.private` milik area dashboard. Kamu wajib **memisahkan styling kustom ke file Global CSS (`frontend/src/style.css`) dengan scope `.public`**. Pastikan struktur layout terpisah modular (impor komponen publik) dan seluruh interaksi sisi klien (seperti highlight TOC otomatis saat di-scroll) terimplementasi dalam Vue yang reaktif.

---

**Silakan salin prompt di bawah ini untuk diberikan ke AI Model: 👇**

```text
Kamu adalah Senior Frontend Developer spesialis Vue 3.

Tugasmu mengonversi desain HTML statis (berbasis Tailwind CSS) menjadi single file component Vue 3 (Composition API / `<script setup>`). File yang akan dikerjakan adalah halaman beranda sekunder (`ProjectDetail.vue`). Struktur, gaya, dan perilakunya berpatokan 100% pada `test/claude/public/project_detail.html`.

Berikut adalah instruksi langkah-demi-langkah:

### 1. Ekstraksi Layout & Komponen Publik
Halaman ini adalah bagian rute Publik, maka layoutingnya harus seperti ini:
- **Navbar & Footer**: JANGAN merender ulang *Navbar* dan *Footer* di dalam file `ProjectDetail.vue`. Cukup impor bagian tersebut dari folder `frontend/src/layouts/public/` atau biarkan parent rutenya yang menangani.
- **Detail Projek (`ProjectDetail.vue`)**: Pindahkan seluruh struktur seperti tulisan (*Hero Header*, *Article Body*, *Screenshot Gallery*, *Sidebar TOC & Meta*, hingga *Prev/Next Navigation*).
- **PENTING:** Pastikan root container dari komponen ini dibungkus dengan `<div class="public">` agar styling global scoped dari variabel tema publik teraplikasi.

### 2. Vue State & Logika (`<script setup lang="ts">`)
Kamu harus memigrasi logika Vanilla JS (yang ada di tag `<script>` HTML) ke _Composition API_ Vue yang elegan:
- **Data Dinamis (Mock System)**: Buat variabel data (*ref/reactive*) untuk konten detail projek (judul, deskripsi, badges, daftar teknologi) - tidak seluruhnya harus dinamis, tetapi minimalkan *hardcoding* tag agar lebih mantap di-looping menggunakan `v-for`.
- **TOC Scroll Spy (Active Highlight)**: Konversi event listener `window.addEventListener('scroll')` dari JS menjadi vue watcher/hook yang efisien:
  - Pantau elemen article text dengan atribut ID (mis. `#overview`, `#problem`).
  - Update variabel reaktif `activeToc` saat suatu seksi masuk ke _viewport_ atau sedang dikunjungi user.
  - Tambahkan binding kelas dinamis `:class="{ active: activeToc === 'overview' }"` pada elemen link navigasi `#toc-link`.

### 3. Migrasi Custom CSS ke `frontend/src/style.css`
Alur penulisan styling: **JANGAN** menggunakan `<style scoped>` di dalam file `.vue` untuk elemen tag dan efek tipografis (seperti `.prose`, `.gallery-img`).
- Buka file `frontend/src/style.css`.
- Pindahkan aturan `<style>` kustom referensi (`test/claude/public/project_detail.html`) ke berkas global tersebut.
- **Terapkan Scope `.public`**: Bungkus semua *custom class* (*.prose*, *.skeleton*, *.gallery-img*, *.toc-link*) ke dalam selector `.public` (contoh: `.public .prose p { ... }`, `.public .gallery-img:hover { ... }`). Ini sangat fatal agar format tipografi publik tidak "bocor" merusak CSS *reset* di aplikasi *Private Dashboard*.
- Gunakan dan sesuaikan palet root variabel yang sudah didaftarkan pada halaman Home (`--bg`, `--text-muted`, dll).

Tolong berikan hasil *code* secara utuh dan sempurna untuk file-file berikut:
1. `ProjectDetail.vue` (berserta fungsionalitas Table of Contents yang interaktif dari sisi `<script setup>`).
2. Aturan CSS tambahan (`.prose`, dll) untuk dicantumkan ke dalam file `frontend/src/style.css` di dalam balutan selektor bersarang `.public`.
```
