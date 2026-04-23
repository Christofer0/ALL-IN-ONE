# Instruksi Responsive Frontend (Junior Developer)

Dokumen ini berisi hasil analisis dan panduan langkah demi langkah untuk membuat tampilan _Private Dashboard_ (`frontend/src/views/private`) menjadi responsif saat dibuka di perangkat mobile (HP).

Tugasmu adalah mengimplementasikan perubahan-perubahan ini pada basis kode.

---

## 1. Perbaikan Layout Global & Sidebar (`style.css` & `PrivateLayout.vue`)

Saat ini sidebar sudah memiliki logika _toggle_ di layar kecil, namun user experience-nya masih kurang optimal di HP.

**Yang harus dilakukan:**

- Buka `frontend/src/style.css` dan cari `.page-content`. Tambahkan _media query_ untuk mengurangi _padding_ di layar kecil agar ruang konten lebih lega di HP:
  ```css
  @media (max-width: 768px) {
    .page-content {
      padding: 16px; /* Kurangi dari 28px */
    }
    .topbar {
      padding: 0 16px; /* Kurangi dari 24px */
    }
  }
  ```
- Buka `frontend/src/layouts/private/PrivateLayout.vue`. Saat `isSidebarOpen` aktif di layar mobile, tambahkan sebuah `div` _overlay_ (latar belakang gelap) yang menutupi `main-content`. Jika _overlay_ ini di-klik, sidebar harus tertutup otomatis.
  ```html
  <!-- Contoh Overlay -->
  <div
    v-if="isSidebarOpen"
    class="fixed inset-0 bg-black/50 z-30 lg:hidden"
    @click="toggleSidebar"
  ></div>
  ```

---

## 2. Penanganan Tabel agar Tidak _Overflow_ (Penting!)

Elemen `<table>` secara bawaan tidak responsif dan akan merusak layout (_horizontal scroll_ pada seluruh halaman) jika kolomnya terlalu banyak.

**Yang harus dilakukan:**
Cari semua tag `<table>` di file-file berikut:

1. `Cashflow.vue`
2. `ProjectCms.vue`
3. `EmailScheduler.vue`

Bungkus setiap elemen `<table>` tersebut dengan sebuah `div` yang memiliki fungsi _horizontal scroll_:

```html
<div style="overflow-x: auto; width: 100%; -webkit-overflow-scrolling: touch;">
  <table>
    <!-- Isi tabel -->
  </table>
</div>
```

---

## 3. Responsive Modals (Dialog)

Pada file seperti `Settings.vue` (Bagian Delete Confirm & Detail Pesan) dan `ProjectCms.vue` (Form Tambah Project), modal memiliki _padding_ yang cukup besar (`padding: 28px;` atau `p-6` / `p-8` di Tailwind).

**Yang harus dilakukan:**

- Gunakan _media query_ atau class responsif Tailwind (contoh: `p-4 sm:p-6`) untuk memperkecil padding modal di layar HP.
- Pastikan modal tidak menempel di tepi layar HP dengan memberikan margin (contoh: `w-[calc(100%-32px)]` atau pastikan wrapper luar memiliki padding `p-4`).

---

## 4. Perombakan Layout Khusus `AiChat.vue`

File `AiChat.vue` memiliki arsitektur `.chat-layout` dengan flexbox: `.chat-sidebar` (`width: 260px`) dan `.chat-main`. Di layar HP, membagi layar menjadi dua secara vertikal tidak akan muat.

**Yang harus dilakukan:**

- Pada layar HP (`max-width: 768px`), ubah `.chat-sidebar` menjadi menu geser (_drawer_) atau sembunyikan secara bawaan, lalu tambahkan tombol burger menu kecil di dalam header `AiChat` untuk memunculkan riwayat chat.
- Biarkan `.chat-main` mengambil lebar penuh (`100%`) di layar HP.

---

## 5. Flexbox & Grid Wrap

Di beberapa bagian header modul (contoh: Top bar di `Cashflow.vue` atau `Goals.vue` yang berisi tombol filter dan judul), elemen dideretkan dengan `display: flex; justify-content: space-between;`.

**Yang harus dilakukan:**

- Pastikan _flex container_ tersebut memiliki `flex-wrap: wrap; gap: 12px;` agar jika layarnya terlalu kecil, tombol filter dapat turun ke baris bawah dengan rapi, tidak terpotong atau tumpang tindih dengan judul.
- Ubah `input` pencarian (Search bar) agar lebarnya `width: 100%` saat di layar HP, daripada dipaksa satu baris dengan elemen lain.

---

## 6. Public Pages (`frontend/src/views/public/`)

Secara keseluruhan, halaman publik (_Home_, _ProjectDetail_, _Blog_, dsb.) sudah menggunakan _utility classes_ dari Tailwind yang sangat baik untuk responsivitas (seperti `md:grid-cols-2`, `lg:w-1/2`). Namun ada beberapa detail flexbox yang berpotensi rusak di layar HP yang sangat sempit (misal 320px):

**Yang harus dilakukan:**

- **`Home.vue` & `ProjectDetail.vue` (CTA Buttons)**:
  Cari kontainer tombol aksi utama, contohnya di _Hero Section_ (berisi _View Projects_ / _About Me_) dan di _ProjectDetail_ (_Live Demo_ / _GitHub Repo_).
  ```html
  <!-- Sebelum -->
  <div class="flex gap-4"></div>
  ```
  Ubah menjadi responsif agar tombol membungkus ke bawah (`wrap`) jika tidak muat, atau bertumpuk:
  ```html
  <!-- Sesudah -->
  <div class="flex flex-wrap sm:flex-row gap-4">
    <!-- atau -->
    <div class="flex flex-col sm:flex-row gap-4"></div>
  </div>
  ```
- **Quick Stats (`ProjectDetail.vue`)**:
  Grid untuk statistik cepat (`Duration, Impact, Team Size`) menggunakan `grid-cols-3`. Meskipun biasanya cukup, pastikan teks di dalamnya tidak saling bertumpuk di HP. Jika perlu, ubah ke `grid-cols-2 sm:grid-cols-3`.

---

## 7. Utilities Pages (`frontend/src/views/utilities/`)

Halaman utilitas (`Login.vue`, `Error.vue`) sudah **sepenuhnya responsif** secara bawaan.

- **`Login.vue`**: Panel desain kiri dengan _code card_ otomatis disembunyikan di layar mobile (`hidden lg:flex`), menyisakan form login (_right panel_) yang mengambil lebar layar penuh (`w-full`). Ini sudah _best practice_.
- **`Error.vue`**: Tombol aksi utama (_Back to Home_ & _Go Back_) sudah menggunakan `flex-col sm:flex-row`, sehingga di HP tombol tersebut akan otomatis tersusun ke bawah. Tidak ada perubahan besar yang diperlukan di folder ini.

---

**Catatan untuk Junior Dev:**
Lakukan perubahan ini satu per satu dan selalu tes dengan _Chrome DevTools_ (Toggle Device Toolbar -> Pilih iPhone atau Pixel) untuk memastikan _horizontal scroll_ pada body utama sudah hilang. Semangat! 🚀
