# Task / Prompt untuk Junior Dev atau AI (Model Murah)

## Pelajari Dahulu

1. **Referensi Desain:** `test/claude/private/habits.html` (Struktur HTML & UI).
2. **Referensi Arsitektur:** `frontend/src/views/private/Dashboard.vue` (Contoh komponen konten dalam sistem layer).
3. **Sistem Layout:** `frontend/src/layouts/private/PrivateLayout.vue` (Sudah menangani Sidebar & Navbar).
4. **Global CSS:** `frontend/src/style.css` (Cari scope `.private` untuk melihat gaya, variabel warna, dan desain komponen khusus tema).

## Tujuan Utama

Konversi tata letak halaman Habit Tracker (`habits.html`) menjadi komponen Vue 3 utuh (`Habits.vue`). Halaman ini akan dirender di dalam `PrivateLayout` (melalui router), sehingga **TIDAK PERLU** mengimpor atau membuat ulang Sidebar atau Navbar. Fokuslah pada konten utamanya saja (tab view Today/Weekly/Heatmap, daftar habit, animasi progress ring, dan form modal).

---

**Silakan salin prompt di bawah ini untuk diberikan ke AI Model: 👇**

```text
Kamu adalah Senior Frontend Developer spesialis Vue 3.

Tugasmu mengonversi antarmuka statis "Habit Tracker" dari file HTML (`test/claude/private/habits.html`) menjadi komponen Vue 3 (`Habits.vue`) yang menggunakan `Composition API` (`<script setup>`).

### PENTING: Arsitektur & Styling
1. **Layered Layout**: Komponen ini akan dirender sebagai "anak" dari `PrivateLayout.vue`. Jadi, kamu HANYA perlu menulis konten yang biasanya berada di dalam tag `<main class="page-content">`. Sidebar dan Navbar **SUDAH DITANGANI** oleh layout induknya, jangan dimasukkan kembali.
2. **Global Theme (.private)**: Proyek ini menggunakan tema global di `style.css` dalam scope `.private`. Gunakan struktur DOM dan kelas-kelas CSS yang sudah ada di HTML asli karena layout dasar dan estetika (seperti `.habit-card`, `.badge-blue`, `.streak-badge`) sudah disiapkan secara global pada tema `.private`.
3. **Check Dashboard.vue**: Jika bingung, pelajari `frontend/src/views/private/Dashboard.vue` untuk melihat struktur komponen konten yang diimplementasikan dengan benar dalam sistem *layered layout* ini.

### Fitur yang Harus Diimplementasikan:
1. **Navigasi Tabs Utama**: Terdapat *Toggle Tabs* untuk mode "Today", "Weekly", dan "Heatmap" di bagian atas (sebelumnya di topbar/header konten). Ikat *tabs* ini dengan variabel state (`currentView`) dan pasang `v-if`/`v-show` untuk merender:
   - `view-today`: Mode daftar pekerjaan hari ini.
   - `view-week`: Mode tabel rekap progres mingguan (`.week-cell`).
   - `view-heatmap`: Mode kontribusi bergaya github (`.heat-cell`).
2. **Elemen Dinamis Today View**:
   - **Progress Ring SVG**: Konversi animasi ke properti reaktif yang di-*bind* menggunakan atribut *style* berdasar hitungan persentase (`stroke-dashoffset`).
   - Iterasi daftar habit menggunakan `v-for` menggunakan mock data reaktif `habits`.
   - Pasang aksi klik (`@click`) pada `.check-btn` untuk toggle penyelesaian habit.
3. **State & Modal**:
   - Definisikan mockup data `habits` (misal: `const habits = ref([{ id:1, name:'Drink Water', streak: 12, completed: false }])`).
   - Buat fungsi hitung `computed` untuk: Total Habit harian, Habit Done, Week Rate, dan Persentase UI.
   - Implementasikan *controller* reaktif untuk form Modal Habit Baru (`isModalOpen`) beserta form tiruannya.

### Struktur File:
<script setup lang="ts">
import { ref, computed } from 'vue'
// Definisikan interfaces, mock data habits, computed states, dan toggle UI di sini
</script>

<template>
  <main class="page-content">
    <!-- Konten dari <main class="page-content"> mulai dari Header/Tabs konten, Progress Ring, Habit List, Heatmap, Week View hingga Modal Add Habit -->
  </main>
</template>

/* Gunakan <style scoped> HANYA untuk styling spesifik halaman ini (seperti animasi .pulse berkedip, keyframes ringFill/bell, bentuk grid tab mingguan .week-cell, .heat-cell, dll) yang mungkin belum tercakup penuh di style.css global (.private). */
```
