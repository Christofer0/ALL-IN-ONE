# Task: Create "404 / Error" Page UI

## 📋 Deskripsi

Tolong rancang dan buat tampilan UI halaman **"404 / Error" (`/404`)**. Halaman ini muncul jika "Halaman tidak ditemukan" (Priority: SHOULD).

## 🎨 Tema Warna Utama

- **`#001C30`** (Primary Dark)
- **`#176B87`** (Secondary Dark)
- **`#64CCC5`** (Accent Cyan)
- **`#DAFFFB`** (Light Text)

## ✨ Komponen / Fitur yang Harus Ada

1. **Pesan error yang ramah:** Teks informatif bahwa halaman sudah tiada, dipindah, atau link rusak (contoh: "Oops! We can't find that page.").
2. **Tombol kembali ke Home:** Call to Action button yang prominent untuk kembali ke landing page utama.
3. **Ilustrasi / visual menarik:** Sediakan tempat (placeholder) yang elegan untuk SVG atau visual grafis 404 yang relevan.
4. **Search bar (opsional):** Mockup input search untuk mencari artikel/project yang relevan.
5. **Link ke halaman populer:** Berikan 3-4 tautan cepat (misal ke About, Projects, Blog).
6. **Konsisten dengan desain:** Gunakan typography dan layout yang selaras dengan main identity website (navbar dan footer basic).

## 🛠 Instruksi Teknis Senior ke Junior

- **Penggunaan Framework CSS:** Wajib gunakan **TailwindCSS via CDN.** Konfigurasikan warna utamanya. Dilarang pakai file `.css` terpisah.
- **HTML & JS:** Buat di satu file `.html`. Tak perlu JS tingkat lanjut selain barangkali animasi kecil atau logic minor pada search bar mockup. Nanti junior developer ai yang lebih murah akan mengerjakan tampilan ui ux menggunakan html, tailwind css cdn, js.
- **Desain UI:** Layout harus fill layar secara elegan (misal centering konten di dalam `min-h-screen flex flex-col justify-center items-center`). Buat user tidak merasa tersesat meskipun menemukan error.
