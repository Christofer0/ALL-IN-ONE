# Task / Prompt untuk Junior Dev atau AI (Model Murah)

## Pelajari Dahulu

pelajari error.html

## Tujuan Utama

Mengubah atau membuat file Vue (misalnya `Error.vue` atau `NotFound.vue`) agar struktur UI, styling Tailwind CSS, dan logika JavaScript-nya 100% mengikuti desain halaman pada `test/claude/utilitas/error.html`.

---

**Silakan salin prompt di bawah ini untuk diberikan ke AI Model: 👇**

```text
Kamu adalah Senior Frontend Developer spesialis Vue 3.

Tugasmu mengonversi desain HTML murni (berbasis Tailwind CSS) menjadi komponen Vue 3 (Composition API / `<script setup>`). File yang akan dibuat atau diupdate adalah halaman error (misalnya `Error.vue` atau `NotFound.vue`). Struktur referensinya diambil dari desain `error.html`.

Berikut adalah instruksi pengerjaan:

### 1. Ekstrak Template HTML ke dalam Vue `<template>`
- Pindahkan seluruh elemen UI dari `<body>` (termasuk Navbar, Main Content / Ilustrasi animasi ruang angkasa, Search Bar, CTA Buttons, dan Footer) ke dalam blok `<template>` di Vue.
- Ganti event inline native misal `onclick="history.back()"` dengan binding event Vue `@click="goBack"`.
- Pindahkan atribut animasi, inline SVG, form search bar beserta ikon-nya persis mengikuti HTML aslinya.
- Pastikan penggunaan class utilitas Tailwind dari atribut `class="..."` di-copy secara penuh agar layout dan warna tidak berubah drastis (perhatikan warna `primary`, `secondary`, `accent`, `light` yang baru).

### 2. Vue State & Interactions (`<script setup>`)
Buat fungsionalitas fungsional pengganti script native menggunakan Vue 3 Composition API:
- Gunakan `ref` untuk input pencarian: `const searchQuery = ref('')`.
- Buat method `@keydown.enter="handleSearch"` pada input text box:
  Jika `searchQuery` ada isinya, redirect user (misal push via `vue-router` ke halaman pencarian, atau mock alert).
- Buat method `goBack()` yang memanggil `window.history.back()` atau `router.back()`.
- Untuk logika *IntersectionObserver* (elemen berkelas `.reveal`), kamu bisa mengimplementasikan custom directive `v-reveal`, mengubahnya menjadi state onMounted refs dengan observer yang nge-toggle class `.visible`, atau gunakan package tools populer seperti `@vueuse/core` (`useIntersectionObserver`). Pilih yang paling native / sederhana.

### 3. Custom CSS (`<style scoped>`)
- Pindahkan semua blok `<style>` spesial dari head `error.html` ke `<style scoped>` (misal class `.mesh`, `.grid-bg`, pseudo elemen `body::before`, keyframes animasi `@keyframes orbit`, `@keyframes glitch`, `.glitch-wrap`, `.orbit-dot`).
- Hindari konflik selector global dengan me-wrap custom styling UI tersebut ke root elemen di dalam `<template>`. Pastikan animasi planet `.orbit-dot` dan interaksi `float` serta `glitch` jalan.

Tolong berikan full code lengkap (untuk `<template>`, `<script setup>`, dan `<style scoped>`) tanpa dipotong supaya desain 404 ini bisa langsung berjalan sempurna di framework Vue 3.
```
