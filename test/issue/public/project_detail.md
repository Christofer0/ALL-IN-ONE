# Task: Create "Project Detail" Page UI

## 📋 Deskripsi
Sebagai frontend developer, tolong buatkan UI untuk halaman **"Project Detail" (`/projects/[slug]`)**. Halaman ini adalah tempat di mana pengunjung membaca secara penuh case study dan spesifikasi dari satu project tertentu yang diklik dari daftar project. 

## 🎨 Tema Warna Utama
- **`#222831`** (Primary Dark)
- **`#393E46`** (Secondary Dark)
- **`#00ADB5`** (Accent Cyan)
- **`#EEEEEE`** (Light Text)

## ✨ Komponen / Fitur yang Harus Ada
1. **Hero / Header:** Menampilkan Nama Project dengan typography besar, ringkasan pendek (Subtitle), dan daftar label/badge Tech Stack yang digunakan.
2. **Cover Image:** Container gambar raksasa untuk preview utama project (buatkan skeleton loader atau placeholder menarik).
3. **Long Description (Case Study Area):** Area berparagraf-paragraf teks yang menceritakan tentang perancangan project ini. Pastikan tipografi (line-height, font-size, read-width) memiliki *readability* yang nyaman di mata.
4. **Call to Actions (Project Links):** 
   - Tombol "Live Demo" (Aksen dominan)
   - Tombol "GitHub Repo" (Aksen sekunder)
5. **Media Gallery (Screenshot / Video):** Tampilan masonry atau carousel di pertengahan atau bawah artikel untuk memamerkan screenshot fitur.
6. **Bottom Navigation (Prev/Next):** Navigasi di bagian kaki artikel yang berisi tombol "<- Previous Project" dan "Next Project ->".

## 🛠 Instruksi Teknis Senior ke Junior
- **Penggunaan Framework CSS:** JANGAN menggunakan CSS mandiri/file terpisah. **Wajib menggunakan TailwindCSS via CDN saja.** Ekstensikan palet warna di dalam `tailwind.config`.
- Fokus utama pada *Typography and Spacing*. Jangan sampai teks terasa sesak; gunakan *white-space* (negative space) dengan bijak melalui utility Tailwind (misal: `leading-relaxed`).
- Optimasi aset gambar. Untuk UI dummy, gunakan layanan seperti Unsplash Source dengan class `object-cover` dari Tailwind agar rapi.
