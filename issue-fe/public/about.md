# Task / Prompt untuk Junior Dev atau AI (Model Murah)

## Pelajari Dahulu

Pelajari file referensi desain statis HTML di `test/claude/public/about.html`.
Kenali struktur *Split Layout* (di mana *Sidebar* membeku secara vertikal/sticky dengan konten *scrollable* di kanannya), serta elemen-elemen estetik spesifik seperti *Timeline node* (.timeline-line, .timeline-dot) dan lencana (.tag).

## Tujuan Utama

Mengonversi desain statis (berbasis Tailwind CSS murni) dari `test/claude/public/about.html` menjadi komponen Vue 3 (`About.vue`) menggunakan `Composition API`.
Sekali lagi, **DILARANG** menggunakan layout atau namespace CSS `.private`. Seluruh kustomisasi CSS harus ditempatkan di file Global CSS (`frontend/src/style.css`) dengan balok scope `.public`. Komponen modular penyerta (Navbar) harus dimanfaatkan silang antar rute agar efisien.

---

**Silakan salin prompt di bawah ini untuk diberikan ke AI Model: 👇**

```text
Kamu adalah Senior Frontend Developer spesialis Vue 3.

Tugasmu mengonversi desain HTML statis menjadi sebuah komponen Vue 3 (`About.vue`) yang menerapkan pola `Composition API` (`<script setup>`). Desain dasar berbasis Tailwind CSS yang perlu dikloning adalah file `test/claude/public/about.html`.

Berikut adalah instruksi langkah-demi-langkah terkait pengerjaannya:

### 1. Ekstraksi Komponen Publik
Halaman ini adalah bagian rute Publik. Karenanya, integrasikan arsitekturnya dengan efisien:
- **Jangan meng-hardcode rute Navigasi & Footer**: Impor/gunakan komponen publik `Navbar.vue` (dan *Footer* bila modular). Hindari penduplikasian kode.
- **Tentang Saya (`About.vue`)**: Ekstrak struktur kontainer utama `div.max-w-7xl` yang memiliki *Split Layout* (Sticky Sidebar berisi Profil VS Main Content berisi linimasa sejarah kerja).
- **PENTING:** Pastikan parent wrapper di dalam template `About.vue` terbungkus dengan class utama `class="public"` (contoh: `<div class="public">`) agar styling global tidak saling bersinggungan dengan area admin dashboard.

### 2. Vue State & Data Mock (`<script setup lang="ts">`)
Kamu harus menghindari duplikasi HTML monoton pada daftar-daftar panjang. Gantilah tag hardcode menjadi iterasi berbasis data agar lebih ringkas:
- **Data Work History (`v-for`)**: Buat array object reaktif yang memuat informasi pekerjaan (Role, Company, Start-End year, Deskripsi list). 
- **Data Education (`v-for`)**: Ringkas konten bagian pendidikan atau sertifikasi Google/AWS ke dalam satu format perulangan.
- **Data Attributes (Tags & Hobbies)**: Sederhanakan *Soft Skills* dan *Hobbies* menjadi array string/object agar baris template menjadi sangat _clean_ dan teratur.

### 3. Migrasi Custom CSS ke `frontend/src/style.css`
Aturan paling ketat: **JANGAN** pernah menulis blok `<style scoped>` untuk kelas fungsional desain di dalam komponen *About*.
- Buka dokumen `frontend/src/style.css`.
- Translasikan `<style>` kustom dari `test/claude/public/about.html` menuju *stylesheet* sistem global ini.
- **Wajib Terapkan Scope `.public`**: Kelompokkan kelas desain khas dari *About* (seperti `.timeline-line`, `.timeline-dot`, `.timeline-item`, `.timeline-card`, `.tag`) ke dalam selector `.public` (contoh: `.public .timeline-dot { ... }`, `.public .tag:hover { ... }`).
- Sinkronkan warna akar root (`--bg`, `--bg-card`) bila ada inkonsistensi dari file yang ada sebelumnya, atau hapus jika duplikat dari versi *Home/Projects*.
- Pertahankan dukungan efek *hover* yang diurus manual oleh CSS maupun utilitas kelas Tailwind bawaannya (`hover:-translate-y-1`, dsb).

Tolong berikan kode secara matang untuk ditaruh di file:
1. `About.vue` teruntuk area komponen Vue-nya dengan *mock logic* iterasi.
2. Tambahan rule set CSS (timeline properties) yang akan dimasukkan ke `frontend/src/style.css` di bawah naungan block selector `.public`.
```
