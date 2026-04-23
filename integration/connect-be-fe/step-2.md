# Instruksi Prompt untuk Integrasi Backend & Frontend (Fitur Notes)

Silakan berikan prompt di bawah ini kepada Junior Developer atau Model AI yang akan mengerjakan integrasi _frontend-backend_ untuk fitur **Notes**.

---

**Salin dan tempelkan teks berikut ke AI / Developer Anda: 👇**

````text
Kamu adalah Frontend Developer Vue 3 yang ahli.

Tugas kamu adalah **menghubungkan komponen UI statis dengan API Backend nyata** untuk fitur "Notes". Saat ini, file `frontend/src/views/private/Notes.vue` masih menggunakan "Mock Data" (data palsu) berupa array objek `folders` dan `notes`. Backend API-nya sudah siap untuk digunakan.

Berikut adalah instruksi langkah demi langkah yang HARUS kamu ikuti:

### 1. Buat Definisi Tipe Data (TypeScript)
Sistem ini menggunakan tipe data terpusat di `frontend/src/types`.
- Buat file `frontend/src/types/models/folder.model.ts` dengan interface: `id (string), name (string), icon (string), createdAt (string), updatedAt (string)`.
- Buat file `frontend/src/types/models/note.model.ts` dengan interface: `id (string), folderId (string), title (string), content (string), tags (string[]), isPinned (boolean), createdAt (string), updatedAt (string)`.
- Daftarkan tipe tersebut di `frontend/src/types/models/index.ts`.
- (Opsional tetapi disarankan) Buat file request data layaknya `Project` (`CreateNoteRequest`, `UpdateNoteRequest`) di folder `request/private`.
- Daftarkan semua ke file utama `frontend/src/types/index.ts`.

### 2. Integrasikan Pemanggilan API ke `Notes.vue`
Kamu harus menghapus Mock Data di dalam file `frontend/src/views/private/Notes.vue` dan melakukan fetch dari backend.

- **Impor API**: Gunakan utilitas standar yang sudah ada `import api from '@/utils/api'`.
- **Ubah state statis menjadi reaktif kosong**:
  ```ts
  const folders = ref<Folder[]>([]);
  const notes = ref<Note[]>([]);
````

- **Fetch Data Saat Mount**:
  Buat fungsi `fetchData()` yang mengambil data dari `GET /admin/folders` dan `GET /admin/notes` menggunakan `api.get()`, lalu jalankan melalui `onMounted()`.

### 3. Sambungkan Logic CRUD

Ganti logika manipulasi array lokal yang ada saat ini dengan HTTP Calls yang sesungguhnya:

- **Create Note**: Di metode `createNote()`, panggil `api.post('/admin/notes', { folderId: activeFolderId, title: "Untitled Note", ... })` dan set `activeNoteId` dengan ID catatan yang baru dikembalikan backend.
- **Auto-Save Content**: Lihat metode `handleInput()`. Saat ini fungsi tersebut hanya pura-pura loading pakai `setTimeout`. Gunakan fungsi _debounce_ (misalnya lodash) atau ubah logika menjadi menyimpan data markdown ke `api.put('/admin/notes/:id', payload)` selang beberapa detik user berhenti mengetik. Update status `isSaving` berdasarkan status request.
- **Update Tags & Pin**: Saat menekan tombol `togglePin`, `addTag`, atau `removeTag`, selain mengupdate UI, kamu juga wajib menembak endpoint `api.put()` agar perubahannya menetap di Database.
- **Delete Note & Folder**: Tambahkan tombol atau fungsi Delete (menembak `api.delete()`). (Saat ini belum ada tombol delete note di tampilan editor, tambahkan ikon tong sampah di `note-meta-bar` untuk menghapus catatan yang sedang aktif).

### Peringatan Terkait Nama Variabel

Perhatikan bahwa mockup UI lama memakai properti `folder` untuk menandai id folder pada catatan, sedangkan backend menggunakan parameter `folderId`. Kamu juga harus mengubah referensi boolean dari `pinned` menjadi `isPinned` sesuai format model data backend.

### Ekspektasi Akhir

Pastikan kamu memberikan saya (pengguna) blok kode untuk:

1. File-file model TypeScript baru di `src/types/models/`.
2. Keseluruhan kode update dari `frontend/src/views/private/Notes.vue`.

```

```
