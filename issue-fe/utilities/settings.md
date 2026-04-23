# Task / Prompt untuk Junior Dev atau AI (Model Murah)

## Pelajari Dahulu

pelajari settings.html

## Tujuan Utama

Mengubah atau membuat komponen tampilan Settings (misalnya `Settings.vue` atau di-split menjadi beberapa komponen layout) agar struktur UI, styling Tailwind CSS, dan logika tab-navigation 100% mengikuti desain halaman pada `test/claude/utilitas/settings.html`.

---

**Silakan salin prompt di bawah ini untuk diberikan ke AI Model: 👇**

```text
Kamu adalah Senior Frontend Developer spesialis Vue 3.

Tugasmu mengonversi desain HTML murni (berbasis Tailwind CSS) menjadi ekosistem komponen Vue 3 (Composition API / `<script setup>`). File yang akan dikerjakan adalah halaman Settings (bisa bernama `Settings.vue`). Struktur referensinya diambil dari desain `settings.html`.

Berikut adalah instruksi pengerjaan:

### 1. Ekstrak Template HTML (Layout & Layout Slicing)
Dikarenakan halaman ini cukup besar (mengandung Sidebar dan Main Content), tolong pindahkan semua struktur dari tag `<body>` ke `<template>`:
- **Sidebar (`#dashSidebar`)**: Jadikan sidebar ini dinamis (show/hide di mode mobile).
- **Top Bar**: Letakkan di atas Main Content. Ganti tombol mobile menu `onclick="openSidebar()"` dengan binding `@click="toggleSidebar"`.
- **Tabs Content**: Konversi blok-blok `<div id="section-profile">`, `<div id="section-security">`, dst. menjadi sistem tab dinamis menggunakan `v-if` atau `v-show` dari state Vue, BUKAN manipulasi DOM native.

### 2. Vue State & Interaksi (`<script setup>`)
Buat fungsionalitas reaktif pengganti script native menggunakan `ref` dan `reactive`:
- **State Tab Aktif**: Buat state `const activeTab = ref('profile')`. Modifikasi tombol tab (Profile, Security, API Keys, dsb) agar aktif/nonaktifnya tergantung nilai `activeTab`. Render div masing-masing tab sesuai kondisinya.
- **Sidebar State**: Buat `const isSidebarOpen = ref(false)` untuk render/menyembunyikan `#sidebarOverlay` dan merubah class transformasi CSS pada sidebar ketika di layar mobile.
- **Form State**:
  - Untuk tab profile: `fullName`, `username`, `email`, `bio`.
  - Untuk tab security: `currentPassword`, `newPassword`, `confirmPassword`. (Terapkan fungsi logika kekuatan password yang memanipulasi progress bar kekuatan password jika diperlukan).
  - Untuk tab API keys: state untuk input API Keys dengan mask/unmask (toggle `type="password"` ke `type="text"` memakai boolean array atau mapped state).
- **Notifikasi Toast**: Buat fungsi `showToast(message)` yang mentrigger custom pop up toast notifikasi tanpa bergantung pada manipulasi class `document.getElementById` lagi.

### 3. Custom CSS (`<style scoped>`)
- Pindahkan semua blok `<style>` spesial dari head `settings.html` ke `<style scoped>`.
- Ciri khas styling yang harus dimasukkan: `.form-input`, `body::before` (background SVG svg grid base 64), animasi switch toggle CSS (`.toggle-wrap`, `.toggle-slider`), styling interaksi sidebar aktif `.nav-item.active`, card UI `.settings-card`, area drop gambar `.avatar-drop`.
- Pastikan kamu memanfaatkan pengikatan `:class="{ 'active': activeTab === 'profile' }"` daripada class hardcoded.

Tolong berikan full code `Settings.vue` lengkap (dan jangan terpotong pada bagian `<template>`, `<script setup>`, maupun `<style scoped>`) agar desain admin/dashboard setting ini bisa langsung berjalan elegan di framework Vue.
```
