# Task: Create "Contact" Page UI

## 📋 Deskripsi
Kamu ditugaskan untuk menyusun layout frontend dari halaman **"Contact" (`/contact`)**. Halaman ini krusial sebagai jembatan yang menghubungkan pengunjung dengan pembuat website (klien/recruiter). 

## 🎨 Tema Warna Utama
- **`#222831`** (Primary Dark)
- **`#393E46`** (Secondary Dark)
- **`#00ADB5`** (Accent Cyan)
- **`#EEEEEE`** (Light Text)

## ✨ Komponen / Fitur yang Harus Ada
1. **Status Ketersediaan (Availability Badge):** Buat sebuah *badge* status yang estetik di bagian atas profil halaman. Contoh: Sebuah indikator bulat warna Light Green berdenyut dengan teks *"Available for full-time roles & freelance projects"*.
2. **Informasi Kontak Langsung & Social Media:** 
   - Teks alamat Email untuk disalin mudah langsung dengan 1 klik.
   - Daftar Link atau tombol untuk social media yang terhubung (LinkedIn, GitHub, Dribbble, dsb).
3. **Contact Form:**
   - Input Box: `Nama Lengkap`
   - Input Box: `Alamat Email`
   - TextArea: `Pesan / Topik Diskusimu`
   - Button: `Kirim Pesan` (Desain tebal dengan hover effect).
4. **Anti-Spam Widget Area:** Sebuah area kosongan kecil tempat meletakkan widget `reCAPTCHA` nantinya, dengan tulisan pudar privasi data (misal: "This site is protected by reCAPTCHA...").

## 🛠 Instruksi Teknis Senior ke Junior
- **Penggunaan Framework CSS:** **Hanya gunakan TailwindCSS via CDN.** Jangan tulis file CSS mandiri. Semua custom object warna diatur dari script config head HTML.
- *Form States:* Jangan lupakan state form. Gunakan utilitas bawaan Tailwind tanpa custom JS, contoh: `focus:ring-2`, `focus:border-cyan-500`, atau `invalid:border-red-500`.
- Bangun UI Form di dalam container dengan background secondary (`#393E46`) agar elegan.
- Pastikan komponen lulus *Accessibility (a11y)*; gunakan class utility Tailwind jika ada yang perlu disembunyikan visual tapi terbaca oleh screen reader (`sr-only`).
