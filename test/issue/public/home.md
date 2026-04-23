# Issue: Create Home Landing Page UI

## 📋 Deskripsi
Tugas ini adalah membuat User Interface (UI) untuk halaman Home (Landing Page) website portfolio personal. Saat ini kita fokus pada pembuatan UI (frontend) terlebih dahulu, yang nantinya akan diintegrasikan dengan backend untuk fitur CRUD (misal: mengambil data list project dari database).

## 🎨 Design & Tema Warna
Website ini harus menggunakan palet warna berikut untuk menciptakan tampilan modern, clean, dan sedikit bernuansa tech/dark:
- **`#222831`** (Primary Dark - cocok untuk background utama)
- **`#393E46`** (Secondary Dark - cocok untuk background card, navbar, atau elemen sekunder)
- **`#00ADB5`** (Accent Cyan - cocok untuk tombol, link, hover effect, atau highlight)
- **`#EEEEEE`** (Light/White - cocok untuk teks agar kontras tinggi)

*Pastikan kontras warna nyaman dibaca dan terlihat estetik. Implementasikan dengan variable CSS yang rapi.*

## ✨ Fitur & Komponen (Berdasarkan Sitemap)
Mohon buatkan struktur halamannya yang mencakup:
1. **Hero Section:** Berisi nama, tagline, serta first impression interaktif.
2. **Highlight Projects:** Tampilkan grid berisi 3 project terbaik. *Cukup gunakan data dummy statis terlebih dahulu, namun buat strukturnya agar mudah dilooping/di-fetch via API backend nanti.*
3. **Skills & Tech Stack:** Tampilan visual untuk skill dan teknologi yang dikuasai.
4. **Call to Action (CTA):** Tombol yang menonjol untuk mengarahkan pengunjung ke halaman kontak.
5. **Animasi Scroll:** Animasi halus (contoh: fade-in / slide-up) saat halaman di-scroll ke bawah.
6. **Dark Mode Toggle:** Fitur untuk beralih mode. Pastikan palet warna di atas diadaptasi dengan baik saat mode diaktifkan.

## 🛠 Aturan Teknis
- **DILARANG MENGGUNAKAN CSS MANDIRI (.css). Gunakan TailwindCSS via CDN saja dulu (`<script src="https://cdn.tailwindcss.com"></script>`).**
- Konfigurasikan object Tailwind (`tailwind.config`) di dalam tag script untuk mendaftarkan palet warna custom kita, sehingga bisa digunakan seperti `bg-primary` atau `text-accent`.
- Hasil akhir berupa struktur HTML dengan Tailwind yang rapi, modular, dan didokumentasikan.
- Pastikan layout **Responsive** (Mobile, Tablet, Desktop) secara bawaan murni menggunakan utility class Tailwind (`md:`, `lg:`).
- Tambahkan animasi interaksi secara mudah melalui standard class transition bawaan Tailwind (`transition`, `hover:`, dsb).
