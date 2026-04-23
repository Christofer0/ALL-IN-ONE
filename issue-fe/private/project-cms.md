# Task / Prompt untuk Junior Dev atau AI (Model Murah)

## Pelajari Dahulu

1.  **Referensi Desain:** `test/claude/private/project-cms.html` (Struktur HTML & UI).
2.  **Referensi Arsitektur:** `frontend/src/views/private/Dashboard.vue` (Contoh komponen konten dalam sistem layer).
3.  **Sistem Layout:** `frontend/src/layouts/private/PrivateLayout.vue` (Sudah menangani Sidebar & Navbar).
4.  **Global CSS:** `frontend/src/style.css` (Cari scope `.private` untuk melihat variabel warna dan gaya komponen).

## Tujuan Utama

Tugas ini bertujuan untuk mengubah desain statis halaman pengelola proyek (`project-cms.html`) menjadi sebuah komponen Vue 3 bernama `ProjectCms.vue`. Halaman ini akan dirender di dalam `PrivateLayout` (melalui router), sehingga **TIDAK PERLU** mengimpor Sidebar atau Navbar lagi. Fokuslah pada area konten utama saja.

---

**Silakan salin prompt di bawah ini untuk diberikan ke AI Model: 👇**

```text
Kamu adalah Senior Frontend Developer spesialis Vue 3.

Silakan konversi antarmuka tabel manajemen proyek dari file HTML (`test/claude/private/project-cms.html`) menjadi file komponen Vue 3 (`ProjectCms.vue`) menggunakan Composition API (`<script setup>`).

### PENTING: Arsitektur & Styling
1. **Layered Layout**: Komponen ini akan dirender sebagai "anak" dari `PrivateLayout.vue`. Jadi, kamu HANYA perlu menulis konten yang biasanya ada di dalam `<main class="page-content">`. Sidebar dan Navbar sudah ditangani oleh induknya.
2. **Global Theme (.private)**: Proyek ini menggunakan tema global di `style.css` dalam scope `.private`. Bungkus template kamu dengan `<main class="page-content">`. Gunakan class-class yang sudah ada seperti `.stat-card`, `.card`, `.badge-green`, `.btn-primary`, dll.
3. **Check Dashboard.vue**: Pelajari `frontend/src/views/private/Dashboard.vue` untuk melihat bagaimana struktur konten yang benar dalam sistem layer ini.

### Fitur yang Harus Diimplementasikan:
1. **Summary Row**: Empat kartu statistik (Total, Published, Draft, Featured).
2. **Tabel Utama (Datatable)**:
   - Implementasikan array reaktif `projects` sebagai mock data.
   - Fitur pencarian teks (`searchQuery`) dan filter (Status & Kategori) menggunakan `computed` property `filteredProjects`.
   - Render baris tabel menggunakan `v-for`.
3. **Modal Form (Add/Edit)**:
   - Gunakan state `isModalOpen` untuk kontrol muncul/sembunyinya modal.
   - Binding form menggunakan `v-model` ke obyek `form`.
   - Implementasikan UI Toggle (Featured) menggunakan class `.toggle` dan `.toggle-slider` yang sudah ada di CSS global.
4. **Image Upload Zone**: Implementasikan visual area upload menggunakan class `.upload-zone`.

### Struktur File:
<script setup lang="ts">
import { ref, computed } from 'vue'
// Definisikan interfaces, mock data, dan logic di sini
</script>

<template>
  <main class="page-content">
    <!-- Konten dari <main class="page-content"> di HTML asli -->
  </main>
</template>

/* Gunakan <style> hanya jika ada gaya yang sangat spesifik untuk halaman ini saja. 
Gaya umum seperti tabel, modal, dan badge sudah ada di style.css scope .private */
```
