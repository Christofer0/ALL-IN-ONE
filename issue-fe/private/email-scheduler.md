# Task / Prompt untuk Junior Dev atau AI (Model Murah)

## Pelajari Dahulu

1. **Referensi Desain:** `test/claude/private/email-scheduler.html` (Struktur HTML & UI).
2. **Referensi Arsitektur:** `frontend/src/views/private/Dashboard.vue` (Contoh komponen konten dalam sistem layer).
3. **Sistem Layout:** `frontend/src/layouts/private/PrivateLayout.vue` (Sudah menangani Sidebar & Navbar).
4. **Global CSS:** `frontend/src/style.css` (Cari scope `.private` untuk melihat gaya, variabel warna, dan desain komponen khusus tema).

## Tujuan Utama

Tugas ini bertujuan untuk mengubah desain statis halaman penjadwalan email (`email-scheduler.html`) menjadi sebuah komponen Vue 3 bernama `EmailScheduler.vue`. Halaman ini akan dirender di dalam `PrivateLayout` (melalui router), sehingga **TIDAK PERLU** mengimpor atau membuat ulang Sidebar atau Navbar. Fokuslah pada konten utamanya saja (tab navigasi, data statistik, daftar email, daftar template, dan modal interaktif).

---

**Silakan salin prompt di bawah ini untuk diberikan ke AI Model: 👇**

```text
Kamu adalah Senior Frontend Developer spesialis Vue 3.

Silakan konversi antarmuka statis dari file HTML (`test/claude/private/email-scheduler.html`) menjadi file komponen Vue 3 (`EmailScheduler.vue`) menggunakan Composition API (`<script setup>`).

### PENTING: Arsitektur & Styling
1. **Layered Layout**: Komponen ini akan dirender sebagai "anak" dari `PrivateLayout.vue`. Jadi, kamu HANYA perlu menulis konten yang biasanya ada di dalam tag `<main class="page-content">` (atau kontainer konten utama). Sidebar dan Navbar **SUDAH DITANGANI** oleh layout induknya, jangan dimasukkan kembali.
2. **Global Theme (.private)**: Proyek ini menggunakan tema global di `style.css` dalam scope `.private`. Bungkus template kamu dengan `<main class="page-content">`. Gunakan struktur DOM dan kelas-kelas CSS yang sudah ada di HTML asli (seperti `.stat-card`, `.badge-green`, `.badge-amber`, `.btn-primary`, tabel, tab dll.) karena semuanya sudah didukung secara global dengan tema `.private`.
3. **Check Dashboard.vue**: Jika bingung, pelajari `frontend/src/views/private/Dashboard.vue` untuk melihat struktur komponen konten yang diimplementasikan dengan benar dalam sistem *layered layout* ini.

### Fitur yang Harus Diimplementasikan:
1. **Statistik Email (Summary Row)**: Tampilkan area statistik (Pending, Sent Today, This Week, Templates) dengan data reaktif statis.
2. **Tab Navigasi**: Sediakan navigasi tab (Pending, History, Templates). Gunakan logic state (seperti ref `activeTab`) dan `v-show`/`v-if` untuk beralih antar tampilan.
3. **Tabel History & List Pending**: Implementasikan loop `v-for` menggunakan mock data reaktif.
4. **Grid Templates**: Tampilkan ragam template dalam format grid menggunakan loop `v-for` dan data tiruan.
5. **Modal Compose Email**:
   - Terapkan variabel terpisah misal `isModalOpen` untuk membuka dan menutup modal overlay.
   - Buat kerangka interaktif form sederhana menggunakan `v-model`.

### Struktur File:
<script setup lang="ts">
import { ref, computed } from 'vue'
// Definisikan interfaces, mock data, logic toggle tab, & modal di sini
</script>

<template>
  <main class="page-content">
    <!-- Konten dari <main class="page-content"> mulai dari Header, Tabs, Stat Cards, Tables hingga blok Modal Compose -->
  </main>
</template>

/* Gunakan <style scoped> HANYA JIKA memang diperlukan gaya sangat custom di halaman ini. Komponen inti (Modal, Toggle, Badges, Buttons) sudah ada di dalam style.css (.private). */
```
