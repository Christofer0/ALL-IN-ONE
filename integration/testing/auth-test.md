# Auth Testing Guide (Postman)

Gunakan panduan ini untuk menguji sistem autentikasi menggunakan Postman.

## 1. Login Admin
Mengirimkan kredensial untuk mendapatkan cookie autentikasi.

- **URL**: `{{base_url}}/api/auth/login`
- **Method**: `POST`
- **Headers**: 
    - `Content-Type: application/json`
- **Body (JSON)**:
```json
{
  "email": "brilliancw30@gmail.com",
  "password": "abcd1234"
}
```
- **Expected Result**: 
    - Status: `200 OK`
    - Response: `{"message": "Login successful", "user": { ... }}`
    - **Penting**: Postman akan otomatis menyimpan `auth_token` di tab Cookies.

## 2. Check Session (Me)
Memverifikasi apakah kita masih terautentikasi.

- **URL**: `{{base_url}}/api/auth/me`
- **Method**: `GET`
- **Expected Result**: 
    - Status: `200 OK`
    - Response: `{"authenticated": true}`

## 3. Logout
Menghapus cookie autentikasi.

- **URL**: `{{base_url}}/api/auth/logout`
- **Method**: `POST`
- **Expected Result**: 
    - Status: `200 OK`
    - Response: `{"message": "Logged out successfully"}`
