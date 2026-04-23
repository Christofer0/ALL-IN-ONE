# Task: Create "Settings" Page UI

## 📋 Deskripsi
Tolong rancang dan buat tampilan UI halaman **"Settings" (`/dashboard/settings`)**. Halaman ini adalah "Pengaturan akun & tampilan" untuk dashboard internal (Priority: SHOULD).

## 🎨 Tema Warna Utama
- **`#001C30`** (Primary Dark)
- **`#176B87`** (Secondary Dark)
- **`#64CCC5`** (Accent Cyan)
- **`#DAFFFB`** (Light Text)

## ✨ Komponen / Fitur yang Harus Ada
1. **Ganti password:** Form untuk mengganti password (Input password lama dan password baru).
2. **Update profil:** Form mengubah data seperti nama, bio singkat, file upload untuk gambar avatar.
3. **Preferensi tema (light/dark):** Toggle switch atau tombol dropdown yang mensimulasikan perubahan tampilan.
4. **API keys (OpenAI dsb):** Area input field ber-masking (hidden) untuk memasukkan API keys.
5. **Notifikasi email on/off:** Toggle switch untuk pengaturan alert/notifikasi via email.
6. **Danger zone: hapus data:** Area paling bawah dengan style "Danger" (warna kemerahan / peringatan) beserta tombol "Delete Account / Data".

## 🛠 Instruksi Teknis Senior ke Junior
- **Penggunaan Framework CSS:** Wajib gunakan **TailwindCSS via CDN.** Hubungkan palet custom ke config Tailwind. Jangan pakai CSS mandiri.
- **HTML & JS:** Susun markup di file HTML yang menunjukkan layout dashboard (ada sidebar kiri dan area konten di kanan). Tambahkan interaktivitas dummy pada bagian tab atau form di halaman Settings ini. Nanti junior developer ai yang lebih murah akan mengerjakan tampilan ui ux menggunakan html, tailwind css cdn, js.
- **Desain UI:** Berikan pemisah yang jelas (Cards atau Divider) untuk tiap bagian pengaturan. Pastikan bagian "Danger Zone" mendapat penempatan dan pewarnaan peringatan (merah alert) menggunakan class Tailwind.
