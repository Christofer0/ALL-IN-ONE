# Task / Prompt untuk Junior Dev atau AI (Model Murah)

## Pelajari Dahulu

Pelajari file referensi desain statis HTML di `test/claude/public/index.html`.
Kenali struktur layout utama (`nav`, jaring struktur, warna khusus) serta interaksi *dark mode* dan navigasi yang ada di sana.

## Tujuan Utama

Mengonversi desain statis (berbasis Tailwind CSS murni) dari `test/claude/public/index.html` menjadi komponen Vue 3 (`Home.vue`) dengan Composition API.
Hal terpenting adalah **DILARANG** menggunakan layout atau namespace CSS `.private` milik area dashboard. Kamu wajib **memisahkan styling kustom ke file Global CSS (`frontend/src/style.css`) dengan scope `.public`**. Pastikan struktur layout terpisah modular (seperti Navbar) dan seluruh antarmuka 100% selaras dengan aslinya.

---

**Silakan salin prompt di bawah ini untuk diberikan ke AI Model: 👇**

```text
Kamu adalah Senior Frontend Developer spesialis Vue 3.

Tugasmu mengonversi desain HTML statis (berbasis Tailwind CSS) menjadi single file component Vue 3 (Composition API / `<script setup>`). File yang akan dikerjakan adalah halaman beranda publik (`Home.vue`). Struktur dan gayanya berpatokan 100% pada `test/claude/public/index.html`.

Berikut adalah instruksi langkah-demi-langkah:

### 1. Ekstraksi Layout & Komponen Publik
Struktur halaman harus dipecah menjadi komponen modular:
- **Navbar/Navigasi Publik (`nav`)**: Ekstrak bagian navbar menjadi komponen terpisah di `frontend/src/layouts/public/Navbar.vue`. Terapkan logika toggle state untuk menu mobile dan *Dark Mode*.
- **Footer**: Jika ada elemen sekunder seperti footer di HTML, letakkan juga menjadi komponen di dalam `layouts/public/`.
- **Home (`Home.vue`)**: Impor `Navbar.vue` (dan komponen layout publik lainnya) ke dalam `Home.vue`. Pindahkan struktur *Hero*, *Highlight Projects*, *Skills*, dsb ke dalam konten utama halaman ini.
- **PENTING:** Pastikan root container utama di `Home.vue` dan komponen layout terkait dibungkus dengan `<div class="public">` agar styling global scoped dapat teraplikasi.

### 2. Vue State & Logika (`<script setup lang="ts">`)
- Buat state responsif untuk komunikasi komponen (misal: menu toggle untuk versi mobile atau switch *theme dark/light mode* secara interaktif).
- Definisikan data *mock* untuk nilai seperti *Highlight Projects* atau daftar *Skills* agar template tidak sepenuhnya bersifat statis *hardcoded*.

### 3. Migrasi Custom CSS ke `frontend/src/style.css`
Alur penulisan styling: **JANGAN** gunakan `<style scoped>` di dalam file `.vue` untuk elemen kustom yang ada di dalam class HTML.
- Buka file `frontend/src/style.css`.
- Pindahkan aturan-aturan `<style>` kustom dari file HTML referensi (`test/claude/public/index.html`) ke file `style.css` tersebut.
- **Terapkan Scope `.public`**: Bungkus semua custom class tersebut dalam selector `.public` (contoh: `.public .mesh { ... }`, `.public .card-glow:hover { ... }`). Ini untuk memastikan gaya hanya berlaku pada area website publik tanpa mengganggu style `.private` milik internal dashboard.
- **Terapkan Variabel Theme**: Di dalam `.public`, deklarasikan CSS variabel warna persis sesuai yang tertulis di dalam blok CSS `<style>` pada referensi aslinya.
- Konversi penggunaan warna `text-[]`, `bg-[]` yang ada di tag `<script>` bawaan Tailwind ke format class utility Tailwind standar, namun utamakan variabel warna kustom (.public) jika dirasa perlu untuk logika *dark mode*.

Tolong berikan hasil *code* secara sempurna untuk file-file berikut:
1. `frontend/src/layouts/public/Navbar.vue`
2. Komponen pendukung lain jika ada (misal `Footer.vue`)
3. `Home.vue` (berisi konten utama dan memanggil komponen Navbar)
4. Aturan CSS tambahan/variabel warna untuk ditaruh di `frontend/src/style.css`.
```

