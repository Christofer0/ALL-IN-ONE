# Implementasi Cloudinary untuk Upload Gambar

Halo AI Assistant, tugas Anda adalah mengimplementasikan Cloudinary untuk mengganti penyimpanan gambar berbasis Base64 menjadi penyimpanan URL berbasis Cloud di project ini.

## Konteks Saat Ini

- **Frontend** (`frontend/src/views/private/ProjectCms.vue`): Fitur upload gambar sudah menggunakan `FileReader` untuk membaca file gambar lokal dan mengubahnya menjadi string `Base64` (`data:image/jpeg;base64,...`). String ini dikirim dalam payload JSON saat Create/Update project.
- **Backend** (`services/core`): Saat ini backend menerima string Base64 tersebut dan langsung menyimpannya ke database Postgres.
- **Database** (`project.ts` schema): Kolom `coverImage` sudah bertipe `text`, sehingga **TIDAK PERLU** ada perubahan skema database atau migrasi.

## Tujuan Utama

Kita tidak perlu mengaburkan kode dengan `multer` atau Form Data. Cloudinary SDK mendukung pengumpulan string Base64 secara langsung. Anda hanya perlu memodifikasi service/controller backend untuk mengunggah Base64 ini ke Cloudinary dan menyimpan URL-nya.

## Langkah-langkah Implementasi:

### 1. Persiapan Backend Dependencies

- Arahkan ke direktori backend: `cd services/core`
- Install SDK Cloudinary: jalankan perintah `npm install cloudinary` di terminal.
- Tambahkan variabel ini di `.env.example` (berikan komentar agar user ingat untuk mengisinya):
  ```env
  CLOUDINARY_CLOUD_NAME=your_cloud_name
  CLOUDINARY_API_KEY=your_api_key
  CLOUDINARY_API_SECRET=your_api_secret
  ```

### 2. Buat File Konfigurasi Cloudinary

Buat file baru di `services/core/src/utils/cloudinary.ts` dengan konfigurasi:

```typescript
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;
```

### 3. Modifikasi ProjectService.ts

Modifikasi file `services/core/src/services/ProjectService.ts`.

- Import instance cloudinary yang dibuat tadi.
- Pada fungsi `create(data: any)` dan `update(id: string, data: any)`, tambahkan logika intersepsi sebelum data dikirim ke `ProjectRepository`.
- **Logika Intersepsi**:
  Cek apakah `data.coverImage` ada **dan** apakah string tersebut dimulai dengan substring `"data:image/"` (yang mengindikasikan itu adalah file base64 baru).
  ```typescript
  if (data.coverImage && data.coverImage.startsWith("data:image/")) {
    try {
      const uploadResponse = await cloudinary.uploader.upload(data.coverImage, {
        folder: "portfolio_projects", // Simpan dalam folder rapi
      });
      // Ganti string base64 dengan secure URL dari Cloudinary
      data.coverImage = uploadResponse.secure_url;
    } catch (error) {
      throw new Error("Failed to upload image to Cloudinary");
    }
  }
  ```

### 4. Tidak Perlu Ubah Frontend

Beri catatan bahwa frontend tidak perlu diubah, form logic sudah benar. Jika form mengirim Base64 baru, backend akan mengunggahnya. Jika form mengirim URL biasa (saat editing tapi user tidak mengubah gambar), kondisi `startsWith` akan false dan URL aslinya akan tetap dipertahankan dengan aman.

Silakan jalankan langkah-langkah di atas!
