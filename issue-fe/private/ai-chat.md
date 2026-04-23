# Task / Prompt untuk Junior Dev atau AI (Model Murah)

## Pelajari Dahulu

1. **Referensi Desain:** `test/claude/private/ai-chat.html` (Struktur HTML & UI).
2. **Referensi Arsitektur:** `frontend/src/views/private/Dashboard.vue` (Contoh komponen konten dalam sistem layer).
3. **Sistem Layout:** `frontend/src/layouts/private/PrivateLayout.vue` (Sudah menangani Sidebar & Navbar).
4. **Global CSS:** `frontend/src/style.css` (Cari scope `.private` untuk melihat gaya, variabel warna, dan desain komponen khusus tema).

## Tujuan Utama

Konversi tata letak halaman "AI Chat" statis (`ai-chat.html`) ke dalam satu komponen independen Vue 3 (`AiChat.vue`). Halaman ini akan dirender di dalam `PrivateLayout` (melalui router), sehingga **TIDAK PERLU** mengimpor atau membuat ulang Sidebar atau Navbar. Fokuslah pada konten utamanya saja yakni antarmuka model bahasa (*LLM Chat Interface*), manajemen *state* perpesanan, dan interaksi di panel konteks/history.

---

**Silakan salin prompt di bawah ini untuk diberikan ke AI Model: 👇**

```text
Kamu adalah Senior Frontend Developer spesialis Vue 3.

Silakan bangun komponen aplikasi perpesanan AI dari rancangan antarmuka HTML murni (`test/claude/private/ai-chat.html`) ke komponen Vue 3 (`AiChat.vue`) menggunakan tata cara `Composition API` terbaru (`<script setup>`).

### PENTING: Arsitektur & Styling
1. **Layered Layout**: Komponen ini akan dirender sebagai "anak" dari `PrivateLayout.vue`. Jadi, kamu HANYA perlu menulis konten yang biasanya berada di blok utama halaman obrolan (chat layout). Sidebar dan Navbar **SUDAH DITANGANI** oleh layout induknya, jangan dirender ulang di sini.
2. **Global Theme (.private)**: Proyek ini menggunakan tema global di `style.css` dalam scope `.private`. Gunakan struktur DOM dan kelas-kelas CSS yang sudah ada di HTML asli karena metrik UI dan estetika dasar (seperti layout pembungkus form, tombol dll) sudah tersedia secara global.
3. **Check Dashboard.vue**: Jika bingung, pelajari `frontend/src/views/private/Dashboard.vue` untuk melihat struktur komponen diimplementasikan dengan benar dalam sistem *layered layout* PrivateLayout.

### Fitur yang Harus Diimplementasikan:
1. **Top Header**: Ikat `.mode-tab` (⚡ Brainstorm, 🔍 Review, 📋 Plan) pada suatu *state* reaktif.
2. **Chat Layout (Panel Sisi `.chat-sidebar`)**:
   - *Context Active Cards* (`.ctx-card`): Jadikan *toggle switch* reaktif di mana status (ON/OFF) berwarna berdasarkan aksi pengguna.
   - *Saved Prompts* (`.prompt-chip`): Hubungkan event klik yang langsung mengisi/memperbarui isi pesan.
   - *Chat History* (`.history-item`): Iterasi data menggunakan `v-for`.
3. **Area Obrolan Utama (`.chat-main`)**:
   - Tampilkan pesan dengan loop pada array `messages`. Gunakan conditional class rendering (`msg-user` / `msg-ai`) sesuai `role`.
   - Terapkan elemen animasi mengetik tambahan saat AI sedang merespons.
   - Area Input: Ikat `.chat-textarea` dengan nilai *v-model*. Aktifkan tombol (dan submit Enter) jika area teks tak kosong.
4. **Penataan Reaktivitas (`<script setup lang="ts">`)**:
   - Buat variabel referensi dinamis: `currentMode` (default 'brainstorm'), `chatInput`, array data objek pesan reaktif (`messages`), dan status data tiruan riwayat/konteks.
   - Buat fungsi pengiriman pesan `sendMessage()` yang mensimulasikan pemindahan input ke array dan menjadwalkan "pesan balasan tiruan" AI menggunakan timeout sementara.

### Struktur File:
<script setup lang="ts">
import { ref, computed } from 'vue'
// Definisikan antarmuka dan status logika di sini
</script>

<template>
  <main class="page-content" style="display: flex; flex-direction: column; height: 100%; min-height: 0;">
    <!-- Isi dengan Top Header UI Chat, layout pembungkus Chat Sidebar, dan Chat Main -->
  </main>
</template>

/* Gunakan <style scoped> hanya untuk struktur spesifik pada halaman chat ini, misalnya struktur bentuk kontainer tinggi grid obrolan, bubble desain (msg-bubble-user/msg-bubble-ai), animasi titik mengetik, atau efek cahaya spesifik pada .send-btn. */
```
