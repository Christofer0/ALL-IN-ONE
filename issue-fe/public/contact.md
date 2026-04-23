# Task / Prompt untuk Junior Dev atau AI (Model Murah)

## Pelajari Dahulu

Pelajari file referensi desain statis HTML di `test/claude/public/contact.html`.
Kenali dua area utama pada struktur grid halamannya: *Panel Info & Socials* di sebelah kiri, dan *Contact Form* berserta status *Success Message* di sebelah kanan.

## Tujuan Utama

Mengonversi desain statis (berbasis Tailwind CSS murni) dari `test/claude/public/contact.html` menjadi komponen reaktif Vue 3 (`Contact.vue`) dengan `Composition API`.
Paling esensial: **DILARANG** menggunakan layout atau namespace CSS `.private`. Seluruh elemen CSS kustom dari statis ini harus didaftarkan di file root global (`frontend/src/style.css`) dengan ruang lingkup scope kelas `.public`.

---

**Silakan salin prompt di bawah ini untuk diberikan ke AI Model: 👇**

```text
Kamu adalah Senior Frontend Developer spesialis Vue 3.

Tugasmu mengonversi desain HTML statis menjadi sebuah komponen Vue 3 (`Contact.vue`) yang menerapkan pola `Composition API` (`<script setup>`). Desain dasar berbasis Tailwind CSS yang perlu dikloning adalah file `test/claude/public/contact.html`.

Berikut adalah instruksi langkah-demi-langkah terkait pengerjaannya:

### 1. Ekstraksi Komponen Publik
Halaman *Contact* adalah bagian dari sistem Publik kita:
- **Impor Komponen Layout**: Abaikan pembuatan ulang *Navbar* dan *Footer* secara mandiri. Cukup panggil Navbar layout pusat publik.
- **Form Penelepon (`Contact.vue`)**: Ekstrak struktur kontainer grid ke dalamnya, utamanya bagian form, input, dan panel media sosial.
- **PENTING:** Pastikan template utama di dalam `Contact.vue` dibalut (di-wrap) secara utuh dengan induk properti kelas `class="public"` (contoh: `<div class="public">`) agar styling global tidak bocor ke dashboard `.private`.

### 2. Vue State & Penanganan Form (`<script setup lang="ts">`)
HTML referensi menggunakan Vanilla JS yang memanipulasi DOM (`document.getElementById`). Kamu WAJIB menggantinya menjadi sistem reaktif murni Vue:
- **Binding Form (`v-model`)**: Buat object reactive `formState = reactive({ name: '', email: '', subject: '', message: '' })` dan tempelkan `v-model` pada setiap slot input/textarea.
- **State Pengiriman**: Buat variable `isSubmitting = ref(false)` dan `isSuccess = ref(false)`.
  - Ganti elemen pembungkus form menjadi `v-if="!isSuccess"`.
  - Ganti elemen `div#successMsg` menjadi `v-else`.
- **Logika Submit (`@submit.prevent`)**: Rangkai metode `handleSubmit()` milik Vue untuk menyimulasikan jeda setTimeOut (mengatur *loading/disabled state* dari tombol dan mengubah boolean `isSuccess` menjadi *true*).
- **Clipboard Salin Email**: Buat fungsi _copy_ ke clipboard dan manfaatkan variable bool pendek mis. `copied = ref(false)` untuk menampilkan/menyembunyikan alert teks umpan balik `div#copyFeedback` (menggantikan `.classList.add/remove('hidden')`).

### 3. Migrasi Custom CSS ke `frontend/src/style.css`
Aturan penulisan styling kita: **JANGAN** pernah menuliskan balok `<style scoped>` untuk menggoreskan kelas kustom seperti input form di lingkup file vue-nya.
- Buka file `frontend/src/style.css`.
- Pindahkan aturan khusus dari `<style>` kustom `contact.html` (*.form-input*, *.social-link*, *.ping*).
- **Wajib Terapkan Scope `.public`**: Kelompokkan kelas desain khas tersebut ke dalam selector `.public` persis seperti ini (contoh: `.public .form-input:focus { ... }`, `.public .social-link { ... }`).
- Bila CSS Variabel dari skema warnanya (--bg, --bg-card) serupa 100% dengan page sebelumnya (seperti Home/Projects), kamu tidak perlu menumpuk/mengulang deklarasi variabel tersebut.

Tolong kembalikan hasil kodenya dengan sempurna untuk:
1. `Contact.vue` dengan pemanfaatan logic status formulir (`v-model` + `v-if` / `v-else`) secara optimal di section *form*.
2. Kumpulan *custom style* input dan sosial medianya siap sisip ke berkas induk `frontend/src/style.css` dengan blok scope `.public`.
```
