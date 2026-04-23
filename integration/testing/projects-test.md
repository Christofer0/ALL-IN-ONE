# Projects Testing Guide (Postman)

Gunakan panduan ini untuk menguji fitur Project Showcase (Public) dan Management (Admin).

## 1. List All Projects (Admin)
Melihat semua proyek (termasuk yang belum dipublikasi).

- **URL**: `{{base_url}}/api/admin/projects`
- **Method**: `GET`
- **Auth**: Membutuhkan Login (Cookie: `auth_token`)
- **Expected Result**: 
    - Status: `200 OK`
    - Response: Array of project objects.

## 2. Create New Project (Admin)
Menyimpan proyek baru ke database.

- **URL**: `{{base_url}}/api/admin/projects`
- **Method**: `POST`
- **Body (JSON)**:
```json
{
  "title": "My Awesome Project",
  "slug": "my-awesome-project",
  "category": "Web Development",
  "description": "A really cool web app",
  "techStack": ["Vue 3", "Node.js", "PostgreSQL"],
  "isPublished": true
}
```
- **Expected Result**: 
    - Status: `201 Created`
    - **Note**: Periksa tabel `activity_logs`, seharusnya ada log `CREATE_PROJECT`.

## 3. Update Project (Admin)
Mengubah data proyek yang sudah ada.

- **URL**: `{{base_url}}/api/admin/projects/:id` (Ganti `:id` dengan UUID asli)
- **Method**: `PUT`
- **Body (JSON)**:
```json
{
  "title": "Updated Title",
  "isPublished": false
}
```
- **Expected Result**: `200 OK`

## 4. Delete Project (Admin)
Menghapus proyek.

- **URL**: `{{base_url}}/api/admin/projects/:id`
- **Method**: `DELETE`
- **Expected Result**: `200 OK`

## 5. Public: List Published Projects
Melihat proyek yang sudah dipublikasikan saja.

- **URL**: `{{base_url}}/api/projects`
- **Method**: `GET`
- **Auth**: No Auth Required
- **Expected Result**: Hanya menampilkan proyek dengan `isPublished: true`.
