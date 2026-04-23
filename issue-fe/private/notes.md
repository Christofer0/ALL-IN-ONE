# Task / Prompt untuk Junior Dev atau AI (Model Murah)

## Pelajari Dahulu

1. **Referensi Desain:** `test/claude/private/notes.html` (Struktur HTML & UI).
2. **Referensi Arsitektur:** `frontend/src/views/private/Dashboard.vue` (Contoh komponen konten dalam sistem layer).
3. **Sistem Layout:** `frontend/src/layouts/private/PrivateLayout.vue` (Sudah menangani Sidebar & Navbar).
4. **Global CSS:** `frontend/src/style.css` (Cari scope `.private` untuk melihat gaya, variabel warna, dan desain komponen khusus tema).

## Tujuan Utama

Tugas ini bertujuan untuk mengubah desain statis komponen Notes (`notes.html`) menjadi sebuah komponen Vue 3 bernama `Notes.vue`. Halaman ini akan dirender di dalam `PrivateLayout` (melalui router), sehingga **TIDAK PERLU** mengimpor atau membuat ulang Sidebar atau Navbar. Fokuslah pada konten utamanya saja (tata letak tiga panel, editor markdown, dan pratinjau).

---

**Silakan salin prompt di bawah ini untuk diberikan ke AI Model: 👇**

```text
Kamu adalah Senior Frontend Developer spesialis Vue 3.

Silakan konversi antarmuka statis "Notes" dari file HTML (`test/claude/private/notes.html`) menjadi file komponen interaktif Vue 3 (`Notes.vue`) menggunakan Composition API (`<script setup>`).

### PENTING: Arsitektur & Styling
1. **Layered Layout**: Komponen ini akan dirender sebagai "anak" dari `PrivateLayout.vue`. Jadi, kamu HANYA perlu menulis konten yang biasanya ada di dalam bagian utama atau tag `<main>`. Sidebar dan Navbar bagian atas **SUDAH DITANGANI** oleh layout induknya, jadi JANGAN dimasukkan kembali.
2. **Global Theme (.private)**: Proyek ini menggunakan tema global di `style.css` dalam scope `.private`. Gunakan struktur DOM dan kelas-kelas CSS yang sudah ada di HTML asli karena layout dasar dan estetikanya sudah didukung secara global dengan tema `.private`.
3. **Check Dashboard.vue**: Jika bingung, pelajari `frontend/src/views/private/Dashboard.vue` untuk melihat struktur komponen konten yang diimplementasikan dengan benar dalam sistem *layered layout* ini.

### Fitur yang Harus Diimplementasikan:
1. **Struktur Layout Tiga Panel (Slicing Template)**:
   - **Topbar Panel**: Terdapat input pencarian (Search) yang diikat `v-model` dan tombol mode (Split/Write/Preview). (Ganti elemen `.topbar` lama menjadi bagian dari kerangka konten halaman saja).
   - **Folders Panel (`.folders-panel`)**: Berisi daftar folder (seperti "All Notes", "Personal") menggunakan loop `v-for`.
   - **Notes List Panel (`.notes-list-panel`)**: Berisi daftar catatan dari folder yang aktif.
   - **Editor Panel (`.editor-panel`)**: Tampilkan judul, toolbar teks, dan area split editor/preview Markdown yang bergantung pada *state* `editorMode`.
2. **State & Reaktivitas (`<script setup lang="ts">`)**:
   - Daftarkan **Mock Data** reaktif untuk `folders` dan `notes`.
   - Buat state UI logikal: `activeFolderId`, `activeNoteId`, `searchQuery`, dan `editorMode`.
   - Terapkan `v-model` pada textarea untuk *two-way binding*.

### Struktur File:
<script setup lang="ts">
import { ref, computed } from 'vue'
// Definisikan interfaces, mock data, logic mode editor, dan state di sini
</script>

<template>
  <!-- Pastikan tinggi penampung utamanya 100% sehingga sisa halaman vertikal dipakai habis oleh sistem tiga panel -->
  <main class="page-content" style="display: flex; flex-direction: column; height: 100%; min-height: 0;">
    <!-- Masukkan Topbar kustom (search & mode toggle) dan <div class="notes-body"> -->
  </main>
</template>

/* Gunakan <style scoped> untuk gaya yang PENTING dan spesifik ke halaman ini saja. Misalnya: CSS flexbox/dimensi fix (180px, 260px) pada .folders-panel, styling elemen Markdown hasil render, scrollbars, atau state aktif yang tidak tercakup di style.css (.private) */
```
