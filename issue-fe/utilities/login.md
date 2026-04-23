# Task / Prompt untuk Junior Dev atau AI (Model Murah)

## Pelajari Dahulu

pelajari login.html

## Tujuan Utama

Mengubah atau membuat file `Login.vue` agar struktur UI, styling Tailwind CSS, dan logika JavaScript-nya 100% sama dengan desain pada `test/claude/utilitas/login.html`.

---

**Silakan salin prompt di bawah ini untuk diberikan ke AI Model: 👇**

```text
Kamu adalah Senior Frontend Developer spesialis Vue 3.

Tugasmu mengonversi desain HTML murni (berbasis Tailwind CSS) menjadi komponen Vue 3 (Composition API / `<script setup>`). File yang akan dibuat atau diupdate adalah `Login.vue`. Struktur referensinya diambil dari desain `login.html`.

Berikut adalah instruksinya:

### 1. Ekstrak Template HTML ke dalam Vue `<template>`
- Layar dibagi jadi 2 (Kiri: Ilustrasi statis/animasi, Kanan: Form).
- Tolong pindahkan seluruh elemen HTML dari tag `<body>` referensi ke dalam `<template>` Vue.
- Ganti manipulasi DOM native seperti `document.getElementById('id').classList.add('hidden')` menjadi conditional rendering Vue (menggunakan `v-if` atau `v-show`).
- Gunakan `v-model` pada input email dan password.
- Tambahkan `v-bind:class` untuk pengaturan state (seperti menambah class `.shake` jika error).

### 2. Vue State Management (`<script setup>`)
Buat state responsif menggunakan `ref` untuk menggantikan variabel global dari raw JS:
- Form state: `email` (string), `password` (string), `rememberMe` (boolean).
- UI toggles: `showPassword` (boolean).
- Status API/Notif: `isLoading` (boolean), `isSuccess` (boolean), `errorMessage` (string, jika empty artinya hide alert), `showForgotHit` (boolean), `showMagicMsg` (boolean).
- Rate Limit state: `failedAttempts` (number, default 0), `isLocked` (boolean), `lockRemainingSeconds` (number).

### 3. Logika Fungsi & Event Handling
Buat padanan fungsi Vue untuk fungsionalitas berikut:
- `@submit.prevent="handleLogin"`: Untuk handle loading, memvalidasi email = 'admin@portfolio.dev' & password = 'password123', menghitung `failedAttempts`, trigger `.shake` pada error, atau melempar ke state sukses.
- `@click="togglePassword"`: Untuk merubah text/password input dan icon SVG mata.
- `@click="sendMagicLink"`: Simulasi loading (misal 1200ms) lalu mengubah state `showMagicMsg`.
- Fungsi `activateRateLimit()`: Menutup semua akses input (disable button & input), jalankan interval `setInterval` selama 30 detik untuk update UI progress bar `lockRemainingSeconds`, lalu buka form lagi setelah timeout.

### 4. Custom CSS (`<style scoped>`)
- Pindahkan semua blok `<style>` di head HTML ke `<style scoped>` (karena project ini butuh custom styling non-tailwind seperti `background-image` radial/grid, class `.left-panel`, keyframes `.float`, `.shake`, dan `.form-input` overrides).
- Pastikan tidak ada konflik scope.

Tolong berikan full code lengkap `Login.vue` untuk `<template>`, `<script setup>`, dan `<style scoped>` tanpa terpotong!
```
