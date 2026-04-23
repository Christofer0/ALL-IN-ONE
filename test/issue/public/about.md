# Task: Create "About" Page UI

## 📋 Deskripsi
Tolong rancang dan buat tampilan UI halaman **"About" (`/about`)**. Halaman ini ibarat resume digital atau profil lengkap, yang memperkenalkan siapa pembuat portfolio ini dari sisi skill, sifat, kepribadian, hingga pengalaman profesionalnya.

## 🎨 Tema Warna Utama
- **`#222831`** (Primary Dark)
- **`#393E46`** (Secondary Dark)
- **`#00ADB5`** (Accent Cyan)
- **`#EEEEEE`** (Light Text)

## ✨ Komponen / Fitur yang Harus Ada
1. **Profile Hero:** Berisi Foto Profil nyata (gunakan dummy berkualitas untuk sementara), Bio/Intro perkenalan yang bersahabat, dan *Nilai-nilai (Core Values) / Cara Kerja*.
2. **Action Buttons:** Siapkan satu blok khusus berisi tombol "Download CV" dan tombol "Hire Me / Connect".
3. **Timeline Pengalaman Kerja:** Buat komponen UI interaktif berupa garis waktu (Timeline). Setiap node berisi: *Nama Jabatan, Nama Perusahaan, Durasi (Tahun), serta list deskripsi pencapaian*.
4. **Histori Pendidikan (Education):** Tampilan semacam card minimalis yang memuat tempat menempuh pendidikan.
5. **Soft Skills & Hobi Div:** Desain yang santai (jangan bentuk list membosankan) untuk mencantumkan Soft Skills dan Hobi (Misal berupa icon set atau tag cloud).

## 🛠 Instruksi Teknis Senior ke Junior
- **Penggunaan Framework CSS:** **TIDAK BOLEH pakai CSS mandiri**. Wajib gunakan **TailwindCSS via CDN.** Hubungkan palet custom ke config Tailwind agar kode HTML bersih dan rapi.
- Hindari membuat halaman ini terlihat seperti dokumen Word. Gunakan Layout Split Flexbox/Grid via Tailwind (Kiri untuk sidebar `sticky`, Kanan untuk konten bergulir).
- Interaksi mikro: Tambahkan efek hover atau transisi yang elegan menyusuri Timeline dengan class utility Tailwind (contoh: `transition-all outline-none`).
