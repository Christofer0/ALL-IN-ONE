# Task / Prompt untuk Junior Dev atau AI (Model Murah)

## Pelajari Dahulu

1. **Referensi Desain:** `test/claude/private/goals.html` (Struktur HTML & UI).
2. **Referensi Arsitektur:** `frontend/src/views/private/Dashboard.vue` (Contoh komponen konten dalam sistem layer).
3. **Sistem Layout:** `frontend/src/layouts/private/PrivateLayout.vue` (Sudah menangani Sidebar & Navbar).
4. **Global CSS:** `frontend/src/style.css` (Cari scope `.private` untuk melihat gaya, variabel warna, dan desain komponen khusus tema).

## Tujuan Utama

Tugas ini difokuskan pada konversi halaman pengelola "Goals / OKR" (`goals.html`) menjadi sebuah komponen interaktif Vue 3 (`Goals.vue`). Halaman ini akan dirender di dalam `PrivateLayout` (melalui router), sehingga **TIDAK PERLU** mengimpor atau membuat ulang Sidebar atau Navbar. Fokuslah pada konten utamanya saja (metrik statistik, opsi filter, daftar goals, dan modal form).

---

**Silakan salin prompt di bawah ini untuk diberikan ke AI Model: 👇**

```text
Kamu adalah Senior Frontend Developer spesialis Vue 3.

Silakan migrasikan antarmuka "Goals / OKR" dari file HTML (`test/claude/private/goals.html`) menjadi komponen Vue 3 (`Goals.vue`) menggunakan standar Composition API (`<script setup>`).

### PENTING: Arsitektur & Styling
1. **Layered Layout**: Komponen ini akan dirender sebagai "anak" dari `PrivateLayout.vue`. Jadi, kamu HANYA perlu menulis konten yang biasanya berada di dalam tag `<main class="page-content">` atau area utama halaman. Sidebar dan Navbar **SUDAH DITANGANI** oleh layout induknya, jadi jangan dirender ulang.
2. **Global Theme (.private)**: Proyek ini menggunakan tema global di `style.css` dalam scope `.private`. Gunakan struktur DOM dan kelas-kelas CSS yang sudah ada di HTML asli karena layout dasar, metrik UI, dan estetika (seperti form input, tombol primary, dll) sudah diadaptasi secara global pada tema `.private`.
3. **Check Dashboard.vue**: Jika bingung, pelajari `frontend/src/views/private/Dashboard.vue` untuk melihat struktur komponen konten yang diimplementasikan dengan benar dalam sistem *layered layout* ini.

### Fitur yang Harus Diimplementasikan:
1. **Header & Action Buttons**: Sambungkan tombol "New Goal" untuk menampilkan `Modal` dialog reaktif. 
2. **Summary Cards**: Representasikan 4 card metrik statistik atas: *Active Goals*, *Avg Progress*, *KR Selesai*, dan *Hari Tersisa* menggunakan data *computed*.
3. **Opsi Filter Bersarang (`.filter-tab`)**: Buat indikator filter (All Goals, On Track, Behind). Sambungkan *click event* dengan fungsi untuk merubah state aktif.
4. **Rendering List (Daftar Goals)**: 
   - Gunakan perulangan `v-for` pada `filteredGoals` untuk menampilkan kotak target (`.goal-card`).
   - Jadikan progres `.progress-fill` reaktif menggunakan `style` dinamis (contoh: `:style="{ width: goal.progress + '%' }"`).
   - **Sistem Sub-Tugas (Key Results / KR)**: Di dalam kotak Goal tersebut, lakukan loop kedua dengan `v-for` untuk daftar `<div class="kr-row">`. Berikan kelas `.done` secara dinamis pada `.kr-check`.
5. **Konversi Modul Modal**: Implementasikan form reaktif (`v-model`) dan logika tombol penambahan "Key Result" *input box* baru.

### Struktur File:
<script setup lang="ts">
import { ref, computed } from 'vue'
// Definisikan interfaces, mock data goals, object logic, kr tracker, dan state filter di sini
</script>

<template>
  <main class="page-content">
    <!-- Konten dari <main class="page-content">, meliputi Stat cards, Filter bar, Grid Goal Card, dan barisan Modal Form -->
  </main>
</template>

/* Gunakan <style scoped> hanya untuk struktur spesifik yang belum tersedia secara global di style.css (.private). Misalnya custom CSS untuk border box progress, struktur .goal-footer, atau status custom checkbox .kr-check.done */
```
