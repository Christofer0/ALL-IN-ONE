# Task / Prompt untuk Junior Dev atau AI (Model Murah)

## Pelajari Dahulu

Pelajari file referensi desain HTML di `test/claude/private/dashboard.html`.
Kenali struktur layout (`sidebar`, `topbar`, `main-content`), kelas-kelas CSS kustom, serta konfigurasi warna tailwind yang digunakan di sana.

## Tujuan Utama

Mengonversi desain statis Dashboard (`dashboard.html`) menjadi komponen Vue 3 (`Dashboard.vue`) dengan Composition API, namun **memisahkan styling kustom ke file Global CSS (`frontend/src/style.css`) dengan scope `.private`**. Pastikan warna referensi dan desain 100% selaras dengan aslinya.

---

**Silakan salin prompt di bawah ini untuk diberikan ke AI Model: 👇**

```text
Kamu adalah Senior Frontend Developer spesialis Vue 3.

Tugasmu mengonversi desain HTML statis (berbasis Tailwind CSS) menjadi single file component Vue 3 (Composition API / `<script setup>`). File yang akan dikerjakan adalah halaman beranda Dashboard (bernama `Dashboard.vue`). Struktur dan gayanya berpatokan pada `test/claude/private/dashboard.html`.

Berikut adalah instruksi langkah-demi-langkah:

### 1. Ekstraksi Layout & Komponen
Struktur halaman harus dipecah menjadi komponen modular.
- **Sidebar (`.sidebar`)**: Ekstrak bagian sidebar menjadi komponen terpisah di `frontend/src/layouts/private/Sidebar.vue`. Terapkan logika toggle state (`isSidebarOpen`) untuk support mobile.
- **Navbar/Top Bar (`.topbar`)**: Ekstrak bagian topbar menjadi komponen terpisah di `frontend/src/layouts/private/Navbar.vue`. Ganti teks penyapaan statis dengan interpolasi variabel dinamis (misal selamat pagi/siang).
- **Dashboard (`Dashboard.vue`)**: Impor `Sidebar.vue` dan `Navbar.vue` ke dalam `Dashboard.vue`. Pindahkan struktur *Cards*, *AI Suggestion Banner*, dan *Mini Charts* ke dalam konten utama halaman ini.
- **PENTING:** Pastikan root container utama di `Dashboard.vue` dibungkus dengan `<div class="private">` agar styling global scoped dapat teraplikasi pada semua komponen di dalamnya.

### 2. Vue State & Logika (`<script setup lang="ts">`)
- Buat state responsif untuk komunikasi antara Navbar, Sidebar, dan Layout utama (mis. pinia, composables, atau defineProps/defineEmits untuk `isSidebarOpen`).
- Buat fungsi dinamis `greetingText` dan `dateText`.
- Definisikan data *mock* untuk nilai statistik, daftar quick action, atau grafik jika diperlukan agar template tidak hardcoded penuh.

### 3. Migrasi Custom CSS ke `frontend/src/style.css`
Alur penulisan styling: JANGAN gunakan `<style scoped>` di dalam file `.vue` untuk class utama (seperti .sidebar, .card, dll). 
- Buka file `frontend/src/style.css`.
- Pindahkan aturan-aturan `<style>` kustom dari file HTML referensi ke file `style.css` tersebut.
- **Terapkan Scope `.private`**: Bungkus semua custom class tersebut dalam selector `.private` (karena Tailwind v4 / standard CSS bersarang mendukung nesting) atau tambahkan prefix `.private` (contoh: `.private .sidebar { ... }`). Ini untuk memastikan gaya hanya berlaku pada area private (selaras dengan komponen lain yang juga menggunakan namespace `.private`).
- **Gunakan Warna Referensi**: Di file HTML referensi ada palet warna pada config Tailwind:
  - `primary`: `#000000`
  - `secondary`: `#4A70A9`
  - `accent`: `#8FABD4`
  - `light`: `#EFECE3`
  - `sidebar-bg`: `#0A0A0A`
  - `card-bg`: `#111111`
  - `card-border`: `#1E1E1E`
  - `surface`: `#161616`
  Pastikan kamu mendefinisikan dan menerapkan warna-warna ini di dalam rules `.private` agar tampilannya konsisten dan persis sama.
- Terapkan scrollbar kustom, efek `.pulse`, style `.btn-primary`, `.badge-blue`, dll ke dalam scope `.private` tersebut.

Tolong berikan hasil *code* secara sempurna untuk file-file berikut:
1. `frontend/src/layouts/private/Sidebar.vue`
2. `frontend/src/layouts/private/Navbar.vue`
3. `Dashboard.vue` (yang mengimpor Sidebar dan Navbar beserta konten utamanya)
4. Aturan CSS tambahan untuk ditaruh di `frontend/src/style.css`.
```
