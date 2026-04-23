# Task: Create "Projects" Page UI

## 📋 Deskripsi
Sebagai frontend developer/AI, tugas Anda adalah membuat UI untuk halaman **"Projects" (`/projects`)**. Halaman ini berfungsi sebagai galeri karya. Saat ini kita hanya fokus mem-build tampilan statis (menggunakan data dummy/mock data), namun struktur kodenya harus dirancang sedemikian rupa agar nantinya mudah dilooping/di-fetch dari backend API.

## 🎨 Tema Warna Utama
Gunakan variable CSS untuk palet wajib berikut:
- **`#222831`** (Primary Dark background)
- **`#393E46`** (Secondary Dark background untuk card, panel, dsb)
- **`#00ADB5`** (Accent Cyan untuk tombol, interaksi hover, filter yg aktif)
- **`#EEEEEE`** (Text/Font color utama)

## ✨ Komponen / Fitur yang Harus Ada
Berdasarkan spesifikasi sistem:
1. **Filter & Search Bar:**
   - Input text form untuk pencarian (Search project).
   - Kumpulan tombol/pill filter untuk menyaring berdasarkan Kategori atau Tag (contoh: UI/UX, Web App, Mobile).
   - Berikan aksen warna cyan jika suatu filter sedang dalam keadaan aktif.
2. **Projects Grid (List Karya):**
   - Grid layout yang responsif untuk setiap kartu (card) project.
   - Isi dari masing-masing card:
     - *Image Thumbnail / Cover*
     - Judul Project
     - Potongan deskripsi singkat
     - Berisan tag kecil (technology stack)
   - Efek transisi hover (misalnya card sedikit terangkat, atau border glow).
3. **Empty State Component:** Tampilan ilustrasi / teks khusus ketika filter pencarian tidak membuahkan hasil.

## 🛠 Instruksi Teknis Senior ke Junior
- **Penggunaan Framework CSS:** JANGAN menggunakan CSS mandiri/file terpisah. **Wajib menggunakan TailwindCSS via CDN saja dulu.** Setup custom warnanya di script konfigurasi Tailwind pada head HTML.
- **Komentar:** Beri penanda `<!-- Data Dummy Start -->` dan `<!-- Data Dummy End -->` agar developer backend tahu bagian mana yang perlu direplace dengan data dinamis.
- **Responsivitas:** Wajib tampil sempurna di mobile (1 kolom), tablet (2 kolom), dan desktop (3-4 kolom) menggunakan utility class Grid dari Tailwind (misal: `grid-cols-1 md:grid-cols-2`).
