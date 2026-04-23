# Blogs Testing Guide (Postman)

Gunakan panduan ini untuk menguji fitur Blog (Public) dan Management (Admin).

## 1. List All Blogs (Admin)
Melihat semua artikel blog (termasuk draf).

- **URL**: `{{base_url}}/api/admin/blogs`
- **Method**: `GET`
- **Auth**: Membutuhkan Login
- **Expected Result**: 
    - Status: `200 OK`
    - Response: Array of blog objects.

## 2. Create New Blog (Admin)
Membuat artikel blog baru.

- **URL**: `{{base_url}}/api/admin/blogs`
- **Method**: `POST`
- **Body (JSON)**:
```json
{
  "title": "Welcome to my Blog",
  "slug": "welcome-to-my-blog",
  "category": "General",
  "excerpt": "This is the first post on my new blog.",
  "content": "Full content of the article goes here...",
  "isPublished": true
}
```
- **Expected Result**: 
    - Status: `201 Created`

## 3. Update Blog (Admin)
Mengedit artikel.

- **URL**: `{{base_url}}/api/admin/blogs/:id`
- **Method**: `PUT`
- **Body (JSON)**:
```json
{
  "isPublished": false
}
```
- **Expected Result**: `200 OK`

## 4. Delete Blog (Admin)
Menghapus artikel.

- **URL**: `{{base_url}}/api/admin/blogs/:id`
- **Method**: `DELETE`
- **Expected Result**: `200 OK`

## 5. Public: List Articles
- **URL**: `{{base_url}}/api/blogs`
- **Method**: `GET`
- **Expected Result**: Hanya menampilkan artikel dengan `isPublished: true`.

## 6. Public: Read Article
- **URL**: `{{base_url}}/api/blogs/:slug`
- **Method**: `GET`
- **Expected Result**: Menampilkan detail artikel berdasarkan slug.
