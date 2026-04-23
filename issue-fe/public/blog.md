# Task / Prompt untuk Junior Dev atau AI (Model Murah)

## Pelajari Dahulu

Pelajari file referensi desain statis HTML di `test/claude/public/blog.html`.
Kenali struktur utama halaman ini: Header + Search Bar, Navigasi Kategori (Scrollable Horizontal), Grid Artikel (dengan penanganan khusus untuk artikel *Featured*/*Highlight* pada col-span tertentu), dan Pagination di bagian bawah. 

## Tujuan Utama

Mengonversi desain statis (berbasis Tailwind CSS murni) dari `test/claude/public/blog.html` menjadi komponen reaktif Vue 3 (`Blog.vue` & berpotensi ekstraksi tipe kartu jika dirasa kepanjangan) menggunakan arsitektur `Composition API`.
Sekali lagi, **DILARANG** keras menggunakan layout atau namespace CSS `.private`. Seluruh kustomisasi CSS yang tidak di-cover oleh Tailwind harus ditempatkan di file Global CSS (`frontend/src/style.css`) dengan balok scope `.public`. 

---

**Silakan salin prompt di bawah ini untuk diberikan ke AI Model: 👇**

```text
Kamu adalah Senior Frontend Developer spesialis Vue 3.

Tugasmu mengonversi desain HTML statis menjadi sebuah komponen Vue 3 (`Blog.vue`) yang menerapkan pola `Composition API` (`<script setup>`). Desain dasar berbasis Tailwind CSS yang perlu dikloning adalah file `test/claude/public/blog.html`.

Berikut adalah instruksi langkah-demi-langkah terkait pengerjaannya:

### 1. Ekstraksi Komponen Publik
Halaman ini adalah bagian rute Publik. Karenanya, efisiensi arsitektur komponen sangat dinilai:
- **Jangan merender Rute Navbar/Footer**: Integrasikan dan panggil *Navbar* berserta *Footer* dari layout komponen utama. Jangan diulangi pembuatannya di dalam template `Blog.vue`.
- **Blog (`Blog.vue`)**: Ekstrak struktur kontainer utama `div.max-w-7xl` yang memiliki *Hero Search*, daftar filter kategori `.cat-btn`, grid `.article-card`, bagian validasi *Empty State*, serta *Pagination*.
- **PENTING:** Pastikan template teratas `Blog.vue` yang membungkus kontennya diikat menggunakan kelas utama `class="public"` (contoh: `<div class="public">`) agar styling global kita tepat sasaran.

### 2. Vue State & Reaktivitas Data (`<script setup lang="ts">`)
Di file HTML, fungsionalitas filtering berjalan di tag `<script>` standar. Konversilah ke sintaks Vue:
- **Data Mockup Artikel**: Ringkaskan ke-6 dummy artikel menjadi *React Array of Objects* (`ref([])`). Tambahkan properti spesifik: apakah ini *featured?* (untuk mengatur styling *layout md:col-span-2*).
- **Logika Filter & Pencarian**: 
  - Sediakan dua buah trigger parameter dengan `ref()` yaitu: `searchQuery` (terikat `v-model` ke `<input id="searchInput">`) dan `activeCategory` (nilai string `all` by default).
  - Buat **Computed Property** seperti `filteredArticles` untuk merender/mengembalikan artikel yang hanya relevan dengan filter kategori dan pencarian keyword.
- **Empty State**: Sematkan `v-if="filteredArticles.length === 0"` untuk `<div id="emptyState">`.

### 3. Migrasi Custom CSS ke `frontend/src/style.css`
Aturan konsistensi styling kita: **JANGAN** pernah menulis blok `<style scoped>` untuk kelas desain kartu interaktif di dalam komponen Vue.
- Buka dokumen `frontend/src/style.css`.
- Translasikan CSS kustom dari `test/claude/public/blog.html` menuju *stylesheet* ini.
- **Wajib Terapkan Scope `.public`**: Kelompokkan kelas desain (seperti `.article-card:hover`, `.card-body`, `.cat-btn.active`) murni ke dalam selektor pemisah `.public` (contoh: `.public .article-card { ... }`).
- Lakukan check up terhadap warna dasar. Jika skema `--bg` atau `--bg-card` sudah didefinisikan sempurna pada tahap penulisan CSS halaman 'Home/Projects', abaikan redudansi penulisan var root.

Tolong berikan kode dengan sangat baik untuk:
1. `Blog.vue` teruntuk area logika komponen Vue dengan _loop rendering v-for_ dan logic pemfilteran array reaktif yang canggih.
2. Aturan CSS interaksi baru (.article-card) untuk `frontend/src/style.css` yang dibalut khusus dalam ranah `.public`.
```
