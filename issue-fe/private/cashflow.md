# Task / Prompt untuk Junior Dev atau AI (Model Murah)

## Pelajari Dahulu

pelajari `test/claude/private/cashflow.html`

## Tujuan Utama

Konversi tata letak HTML statis aplikasi keuangan (`cashflow.html`) menjadi ke komponen interaktif Vue 3 (`Cashflow.vue`) menggunakan Composition API. Komponen ini mengandung integrasi visual berlapis seperti form modal, tabel daftar transaksi, dan representasi elemen *chart* (Bar Chart & Donut Chart). Pertahankan desain UI serta kustomasi gaya dari Tailwind yang diberikan.

---

**Silakan salin prompt di bawah ini untuk diberikan ke AI Model: 👇**

```text
Kamu adalah Senior Frontend Developer spesialis Vue 3.

Tugasmu mengonversi desain tata letak berbasis CSS HTML bawaan (`test/claude/private/cashflow.html`) menjadi struktur file komponen Vue 3 utuh (`Cashflow.vue`) yang siap digunakan, dengan Composition API (`<script setup>`).

Perhatikan instruksi wajib berikut:

### 1. Ekstrak Template HTML (Komposisi UI Visual)
Bawa seluruh isi `<body>` ke bagian `<template>` dan konversi elemen secara dinamis:
- **Sidebar & Topbar**: Sesuaikan status navigasi sisi agar responsif, lalu pasangkan fungsionalitas untuk _Month Filter_ dropdown, tombol Export CSV, dan pembukaan Modal `Add Transaction`.
- **Summary Cards (Statistik Panel)**: Konversi panel empat angka utama ke perhitungan state Vue (Total Income, Total Expenses, Net Balance, Savings Rate).
- **Layout Chart Visual (Wajib Mirip Desain)**: 
  - **Bar Chart**: Gunakan loop `v-for` untuk membentuk tinggi bar dinamis pada div `.chart-bar` berdasarkan persentase.
  - **Donut Chart SVG**: Bawa elemen kustom SVG Donut Chart secara mentah (raw HTML SVG), kemudian kaitkan variabel kalkulasi `stroke-dasharray` dan `stroke-dashoffset` agar beradaptasi sesuai nilai reaktif dari data kategori mu nanti.
- **Tabel History List (Daftar Transaksi)**:
  - Berisi opsi Toggle (`.type-toggle` untuk switch *Income / Expense*).
  - Terdapat baris pencarian input dan list `table`. Loop melalui variabel data `transactions`. Warnai setiap nilai dengan elemen badge custom (`.badge-green`, `.badge-red`) dan `.cat-dot` (Dot warna berdasarkan kategori pengeluaran).
- **Modal Add Transaction (`.modal-overlay`)**:
  - Konversikan sebagai pop-up reaktif. Ikat input *Amount*, tombol *Type* Income/Expense (`.type-btn`), *Category*, *Date*, *Note*,  dengan nilai `v-model`.

### 2. Formulasi State Reaktif (`<script setup lang="ts">`)
- **Tabel Data Mockup**: Bikin array variabel state transaksi (contoh referensi fields: `id, type, amount, category, date, title`).
- **Logika Kontrol Filter Berbasis UI**:
  - `activeMonth` (number/string ref) dari dropdown bulan tab atas.
  - `searchQuery` (string ref).
  - `activeTab` (string ref: merepresentasikan `'all'`, `'income'`, `'expense'`) yang terikat di desain Toggle Button list tabel.
- Beri minimal *computed property* yang dapat menghitung Total Income, Expense, dan nilai *Net* berdasarkan kumpulan *array* draf transaksi tadi. Fungsi kalkulasi ini juga secara ideal akan menyuplai kalkulasi dasar ke tinggi "Bar Chart" reaktif tadi (walaupun cukup data draf atau representatif kasar saja tidak apa-apa).

### 3. Ekstraksi Khusus *Scoped* CSS (`<style scoped>`)
Pindahkan area kode dalam tag `<style>` ke style komponen. Pastikan beberapa fitur gaya inti tidak hilang demi menjaga UI 100% sama dengan demo.
- Kelas UI inti pemisah struktur seperti `.sidebar`, `.main-content`, animasi `scrollbar`.
- Desain unik seperti Chart elements (`.chart-bar-wrap`, `.chart-bar`, `.donut-wrap`).
- Elemen interaktif *Toggle filter button* list (bentuk *pill* kustom menggunakan input dan span `:before`).
- *Badge label component* multi-warna seperti `.badge-red` dan `.badge-green`.
- Perbaikan layout CSS `<select>`, `<table>`, `.search-input` dan elemen `.modal-overlay`-nya.

Harap hasilkan kode penuh tanpa potongan satupun. Seluruh `<template>`, `<script setup>`, serta `<style scoped>` harus berada dalam 1 output format yang siap pakai langsung.
```
