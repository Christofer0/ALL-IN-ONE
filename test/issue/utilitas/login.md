# Task: Create "Login" Page UI

## 📋 Deskripsi
Tolong rancang dan buat tampilan UI halaman **"Login" (`/login`)**. Halaman ini adalah "Pintu masuk ke dashboard" (Priority: MUST).

## 🎨 Tema Warna Utama
- **`#001C30`** (Primary Dark)
- **`#176B87`** (Secondary Dark)
- **`#64CCC5`** (Accent Cyan)
- **`#DAFFFB`** (Light Text)

## ✨ Komponen / Fitur yang Harus Ada
1. **Email + password input:** Form dasar untuk login.
2. **Magic link (opsional):** Tambahkan tombol atau link untuk opsi login dengan magic link.
3. **Redirect ke dashboard:** (Logic JS dummy) Saat disubmit, beri mock seakan-akan redirect sukses.
4. **Lupa password flow:** Link / teks "Lupa password?".
5. **Rate limiting anti-brute force:** Sediakan pesan UI (alert error style) ketika terlalu sering mencoba login salah.
6. **Remember me:** Terdapat checkbox untuk let browser remember the session.

## 🛠 Instruksi Teknis Senior ke Junior
- **Penggunaan Framework CSS:** Wajib gunakan **TailwindCSS via CDN.** Hubungkan palet custom ke config Tailwind. Jangan pakai CSS mandiri atau custom kecuali untuk utility minor di style inline.
- **HTML & JS:** Tulis struktur semantik di file `.html` dan tambahkan fungsionalitas dummy dengan Javascript (Vanilla JS) agar form seakan-akan bisa disubmit. Nanti junior developer ai yang lebih murah akan mengerjakan tampilan ui ux menggunakan html, tailwind css cdn, js.
- **Desain UI:** Fokus pada tampilan form otentikasi yang bersih dan terpusat (Center Box pada layar, atau split screen dengan ilustrasi di sisi lainnya). Tonjolkan modern dan elegan.
