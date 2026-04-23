# Task / Prompt untuk Junior Dev atau AI (Model Murah)

## Pelajari Dahulu

Pelajari file referensi desain statis HTML di `test/claude/public/projects.html`.
Kenali struktur layout utama, sistem *grid* untuk proyek, mekanisme *filter & search*, serta penerapan variabel warna khusus yang ada di sana.

## Tujuan Utama

Mengonversi desain statis (berbasis Tailwind CSS murni) dari `test/claude/public/projects.html` menjadi komponen Vue 3 (`Projects.vue`) dengan Composition API.
Hal terpenting adalah **DILARANG** menggunakan layout atau namespace CSS `.private` milik area dashboard. Kamu wajib **memisahkan styling kustom ke file Global CSS (`frontend/src/style.css`) dengan scope `.public`**. Pastikan struktur layout terpisah modular (impor komponen publik) dan seluruh fungsi UI (filter, animasi) selaras dengan aslinya.

---

**Silakan salin prompt di bawah ini untuk diberikan ke AI Model: 👇**

```text
Kamu adalah Senior Frontend Developer spesialis Vue 3.

Tugasmu mengonversi desain HTML statis (berbasis Tailwind CSS) menjadi single file component Vue 3 (Composition API / `<script setup>`). File yang akan dikerjakan adalah halaman sekunder publik (`Projects.vue`). Struktur, gaya, dan perilakunya berpatokan 100% pada `test/claude/public/projects.html`.

Berikut adalah instruksi langkah-demi-langkah:

### 1. Ekstraksi Layout & Komponen Publik
Halaman ini adalah bagian rute Publik, maka layoutingnya harus seperti ini:
- **Navbar & Footer**: Jangan buat ulang kode *Navbar* dan *Footer* di dalam `Projects.vue`. Cukup impor dari `frontend/src/layouts/public/Navbar.vue` (atau layout utama yang menaunginya). Fokusmu adalah bagian rentang konten mulai dari "*Page Header*" hingga blok *Projects Grid* dan *Empty State*.
- **Projects (`Projects.vue`)**: Pindahkan struktur *Page Header*, *Filter & Search Bar*, *Projects Grid*, dan *Empty State* ke dalam template komponen ini.
- **PENTING:** Pastikan root container utama di `Projects.vue` (di dalam template) beserta komponen layout yang membungkusnya dibungkus dengan `<div class="public">` agar styling global scoped dari public theme dapat teraplikasi.

### 2. Vue State & Logika (`<script setup lang="ts">`)
Kamu harus memigrasi logika Vanilla JS (yang ada di tag `<script>` HTML) ke _Composition API_ Vue yang reaktif:
- **Mock Data**: Konversi elemen `.project-card` mandiri yang *hardcoded* menjadi *Array of Objects* bereaktif (`ref=[]`). Minimal sertakan 6 projek dengan properti: `title, category, image, tags, description`.
- **Search & Filter**: 
  - Buat `ref('all')` untuk *activeFilter* dan `ref('')` untuk *searchQuery*.
  - Gunakan `computed` properti untuk mengembalikan daftar proyek yang sudah tersaring/difilter (*filteredProjects*).
  - Tampilkan bagian *Projects Grid* jika ada hasil, dan *Empty State* jika `filteredProjects.length === 0`.
- **Interaksi Active State**: `v-model` input search dan ikat *class* binding dinamis `.active` pada tombol filter `div.flex.gap-2` sesuai variabel `activeFilter`.

### 3. Migrasi Custom CSS ke `frontend/src/style.css`
Alur penulisan styling: **JANGAN** gunakan `<style scoped>` di dalam file `.vue` untuk elemen kustom (*card-glow*, *reveal*, *project-card*).
- Buka file `frontend/src/style.css`.
- Pindahkan aturan `<style>` kustom dari `test/claude/public/projects.html` ke berkas global tersebut.
- **Terapkan Scope `.public`**: Bungkus semua *custom class* (*.reveal*, *.project-card*, *.card-inner*, *.filter-btn.active*) ke dalam selector `.public` (contoh: `.public .project-card:hover { ... }`). Ini memisahkan gaya area website publik dari area `.private` dashboard.
- Konversi variabel root warna (`--bg`, `--bg-card`, `--border`, dsb) di bagian atas `projects.html` agar didaftarkan ke dalam blok class `.public` dan `.dark .public`, jika belum ada dari halaman *Home* sebelumnya. Hindari pendefinisian ulang jika konfigurasi warna dasarnya sama.

Tolong berikan hasil *code* secara sempurna untuk file-file berikut:
1. `Projects.vue` (berisi konten utama dengan integrasi state untuk rendering dan filter array).
2. Aturan CSS tambahan untuk komponen kartu dan filter yang perlu dicantumkan di `frontend/src/style.css` dalam balutan nest `.public`.
```
