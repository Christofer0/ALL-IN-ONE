# Task: Create "Blog" Page UI

## 📋 Deskripsi
Buatlah UI halaman daftar artikel pada **"Blog" (`/blog`)**. Sederhananya, ini merupakan index artikel berisi daftar seluruh publikasi tulisan, tips, atau catatan pribadi pembuat website. 

## 🎨 Tema Warna Utama
- **`#222831`** (Primary Dark)
- **`#393E46`** (Secondary Dark)
- **`#00ADB5`** (Accent Cyan)
- **`#EEEEEE`** (Light Text)

## ✨ Komponen / Fitur yang Harus Ada
1. **Hero / Search Header:** Judul besar "Blog" dan kolom Input "Search article..." yang responsif.
2. **Kategori & Tags Selector:** Menu horizontal (scrollable) berisikan kategori artikel yang bisa dipilih (contoh: General, Tutorial, Career, dsb).
3. **List Artikel (Grid atau List View):** 
   - Tampilkan dummy data artikel-artikel.
   - Satu item artikel wajib memuat:
     * Gambar Thumbnail (opsional/tergantung UI-nya)
     * Kategori Artikel (opsional)
     * Judul Artikel (H2/H3)
     * Deskripsi snippet (1-2 baris kalimat pembuka)
     * Metadata: Tanggal dipublish & Estimasi Waktu Baca (contoh: "14 Apr 2026 • 5 min read").
4. **RSS Link Action:** Sebuah tombol minimalis / ikon RSS feed di bagian atas samping judul utama untuk berlangganan artikel.
5. **Pagination:** Barisan navigasi di halaman bawah (Page 1, 2, 3... atau tombol "Load More").

## 🛠 Instruksi Teknis Senior ke Junior
- **Penggunaan Framework CSS:** **Wajib menggunakan TailwindCSS via CDN saja.** Tanpa ada file CSS eksternal. Konfigurasi warna harus dilakukan pada object ekstensi tailwind.
- UI yang bagus untuk blog itu tidak ramai. Jangan gunakan border yang berlebihan; manfaatkan `shadow-lg` dari Tailwind atau perbedaan warna flat.
- Artikel pertama bisa dijadikan *Featured Article* dengan ukuran kartu paling besar di posisi nomor 1 (sangat mudah dengan Tailwind `md:col-span-2`).
