# Panduan Integrasi Backend & Frontend (Tahap 8: AI Chat Assistant)

Dokumen ini adalah instruksi untuk Junior Developer dalam merancang dan mengimplementasikan sistem Backend (Database & API) khusus untuk fitur **AI Chat** (`frontend/src/views/private/AiChat.vue`).

Fitur ini bertujuan memberikan asisten personal yang dapat merespon pertanyaan user dengan tambahan _context_ data dari modul lain (Cashflow, Notes, Goals) menggunakan model AI yang _cost-effective_ (murah namun pintar seperti `gemini-1.5-flash`, `gpt-4o-mini`, atau `Llama-3` via Groq).

Bekerjalah di dalam direktori `services/ai`. Sistem ini akan menggunakan **Python** dengan framework **FastAPI**.

Ikuti pola arsitektur:
**Schema/Models (SQLAlchemy/Pydantic) → Repository/CRUD → Service/AI Logic → Routers (FastAPI)**

---

## 1. Analisa Kebutuhan Fitur AI Chat

Berdasarkan analisis pada komponen `AiChat.vue`, saat ini logika balasan AI dan riwayat masih berupa mock/hardcoded.

Kebutuhan utamanya adalah:

- **Manajemen Sesi Chat (Chat History)**:
  - Menyimpan riwayat percakapan agar user dapat melihat chat atau thread sebelumnya di panel sidebar.
  - Atribut: `id`, `title` (di-generate otomatis dari pesan pertama), `created_at`.

- **Penyimpanan Pesan (Messages)**:
  - Menyimpan deretan pesan dalam setiap sesi.
  - Atribut: `id`, `session_id`, `role` (`user` atau `ai`), `content`, `timestamp`.

- **Sistem Prompting & Context Tambahan**:
  - Terdapat 3 "Mode" intervensi: `brainstorm`, `review`, `plan`.
  - Terdapat 3 "Context" data (RAG/injeksi lokal): `cashflow`, `notes`, `goals`.
  - Jika sebuah context aktif (`isOn = true`), backend harus menyertakan rangkuman data tersebut ke dalam _System Prompt_ sebelum dikirim ke model AI.

- **Integrasi Model AI**:
  - Menggunakan API eksternal dengan model yang murah namun cukup mumpuni untuk reasoning ringan, seperti **Gemini 1.5 Flash**, **GPT-4o-mini**, atau model Open Source via **Groq/Ollama**.
  - Respons diusahakan rendah latensi (low latency).

- **Manajemen Quick Prompts**:
  - Menyediakan _saved prompts_ untuk memudahkan pertanyaan cepat user (data ini bisa diletakkan di DB atau hardcoded di level FastAPI).

---

## 2. Desain Schema Database (SQLAlchemy)

Buat model database di dalam `services/ai/models.py`.

```python
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
import datetime
import uuid

class ChatSession(Base):
    __tablename__ = 'chat_sessions'

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    messages = relationship("ChatMessage", back_populates="session", cascade="all, delete")

class ChatMessage(Base):
    __tablename__ = 'chat_messages'

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String, ForeignKey('chat_sessions.id'), nullable=False)
    role = Column(String(10), nullable=False) # 'user' | 'ai'
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    session = relationship("ChatSession", back_populates="messages")
```

_(Catatan: Konfigurasi engine & base Base SQLAlchemy silakan disesuaikan dengan koneksi database)._

---

## 3. Struktur API Endpoint (FastAPI)

Daftarkan endpoint di `services/ai/routers/chat.py`. Semua endpoint berjalan pada prefix `/api/ai`.

| Method   | Path                                 | Fungsi                                         |
| -------- | ------------------------------------ | ---------------------------------------------- |
| `GET`    | `/api/ai/chat/history`               | Ambil semua daftar sesi chat untuk UI Sidebar  |
| `POST`   | `/api/ai/chat/history`               | Buat sesi chat baru kosong                     |
| `DELETE` | `/api/ai/chat/history/{session_id}`  | Hapus percakapan beserta isinya                |
| `GET`    | `/api/ai/chat/{session_id}/messages` | Ambil detail isi pesan berdasarkan sesi id     |
| `POST`   | `/api/ai/chat/message`               | Kirim pesan ke API AI dan simpan balasan ke DB |
| `GET`    | `/api/ai/chat/prompts`               | Ambil daftar Quick Prompts yg tersedia         |

---

## 4. Format Request & Response

### POST `/api/ai/chat/message`

Dipanggil ketika user mengetik dan mengirim pesan.

**Request Body (Pydantic Schema):**

```json
{
  "session_id": "uuid-...",
  "message": "Tolong evaluasi spending makanan saya.",
  "mode": "review",
  "active_contexts": ["cashflow", "notes"]
}
```

_Catatan:_ Jika `session_id` kosong (NULL), backend membuat `ChatSession` baru dan mencoba me-ringkas `message` pertama menjadi nama `title`.

**Response:**

```json
{
  "id": "msg-ai-uuid",
  "session_id": "uuid-...",
  "role": "ai",
  "content": "Berdasarkan data cashflow Anda yang tercatat, pengeluaran makanan bulan ini...",
  "timestamp": "14:30"
}
```

---

### GET `/api/ai/chat/history`

**Response:**

```json
[
  {
    "id": "uuid-1",
    "title": "Analisis pengeluaran April",
    "created_at": "2026-04-22T08:00:00Z"
  },
  {
    "id": "uuid-2",
    "title": "Ide konten blog teknis",
    "created_at": "2026-04-21T08:00:00Z"
  }
]
```

---

## 5. Instruksi Implementasi Lanjutan (Python - Layanan FastAPI)

Bekerjalah di dalam sub-proyek `services/ai`.

### 1. **Buat Pydantic Schemas** — `schemas.py`

Buat skema validasi tipe data (DTO) untuk payload Input dan Output.
Gunakan `Enum` atau `Literal` di Pydantic untuk membatasi nilai `mode` pada `['brainstorm', 'review', 'plan']`.

### 2. **Buat Logika Repository Layer** — `crud.py`

Buat fungsi-fungsi handler SQLAlchemy (Synchronous atau Asynchronous bila pakai `asyncpg`):

- `get_sessions(db)`
- `create_session(db, title)`
- `delete_session(db, session_id)`
- `get_messages(db, session_id)`
- `add_message(db, session_id, role, content)`

### 3. **Buat Logika AI Inti** — `services.py`

Fungsi esensial berada di sini:

- **`generate_ai_response(db, session_id, user_message, mode, active_contexts)`**:
  1. Ambil history array message untuk `session_id` agar AI mengingat percakapan sebelumnya. Batasi riwayat (misalnya maksimal 8-10 pasang percakapan) agar tidak memakan limit token (token optimization).
  2. Rancang bentuk **System Prompt** berdasarkan `mode`. Contoh: jika `mode == 'review'`, AI harus bersikap sebagai pengulas kritis berdasarkan data terkait.
  3. _(Opsional: Context Injection)_ Jika di dalam array `active_contexts` terdapat nilai `"cashflow"`, backend FastAPI bisa memanggil (HTTP GET request) ke _Core Service_ node.js, mendapatkan JSON summary keuangan, dan menyisipkan teks itu ke System Prompt AI agar jawaban selalu relevan.
  4. Kirim _prompt + history_ ke SDK model (ex: `google-generativeai` untuk Gemini 1.5 Flash atau `openai` untuk GPT-4o-mini).
  5. Dapatkan teks respons, simpan data chat tipe `user` ke DB dan string response chat bertipe `ai` ke DB.
  6. Kembalikan data entity pesan AI yang utuh.

### 4. **Buat API Routers** — `routers/chat.py`

Gunakan kelas `APIRouter()`. Mapping fungsi router dengan logic CRUD dan Service.
Pastikan menggunakan `Depends()` injeksi Session Database (mis. `Depends(get_db)`).

---

## 6. Penyelarasan Kode Frontend (`AiChat.vue`)

- Hapus seluruh isi hardcoded mock data.
- Sediakan dan pertahankan nilai local ref `sessionId` yang aktif (null jika ini percakapan yang dirintis baru alias _New Chat_).
- Hubungkan fungsi state `messages` untuk memuat ulang data pesan apabila item list pada menu Sidebar _Chat History_ ditekan dengan memanggil `GET /api/ai/chat/{sessionId}/messages`.
- Pada fungsi `sendMessage()`, panggil `POST /api/ai/chat/message`, kirim teks beserta `mode` dan status dari `contexts` yang dicentang `isOn`.
- Tambahkan logic animasi dot `...` (loading state) ketika menunggu Promise Network.
- Ketika tombol "New Chat" atau `clearChat()` diklik, kosongkan `sessionId`, re-inisialisasi variabel `messages`.

---

## 7. Flow Eksekusi Pesan AI

```
Frontend (AiChat.vue) mengirim POST /message
  ↓
FastAPI Router (routers/chat.py)
  ↓
AI Service Layer (services.py)
  1. Ambil riwayat percakapan dari DB menggunakan session_id.
  2. Susun instruksi System Prompt berdasarkan 'mode' state user.
  3. Jika context tertentu onaktif, lakukan Fetching summary data internal (Cashflow/Goal) via REST dari backend Node.js.
  4. Hubungkan ke Model Language API (mis. openAI chat completion API -> model gpt-4o-mini).
  ↓
Model API memberikan hasil output Text (String)
  ↓
AI Service Layer (services.py)
  1. Simpan baris Pesan User ke tabel chat_messages.
  2. Simpan baris Pesan AI ke tabel chat_messages.
  ↓
Return JSON Data Message → Diterima Frontend dan di-render sebagai gelembung percakapan baru.
```

---

## 8. Catatan Penting

- ✅ Gunakan model berbiaya rendah/tier junior yang handal untuk penalaran simpel seperti **Gemini 1.5 Flash** atau **GPT-4o-mini** demi menahan budget limit operasional.
- ✅ Pisahkan fungsi antara komunikasi ke pihak eksternal (LLM API) dengan akses Database Internal agar mempermudah pengetesan di FastAPI.
- ✅ Lakukan pembatasan riwayat chat yang dikirim (Chat History Truncation) ke API LLM.
- ❌ Jangan meng-import _framework_ AI Agent berat (mis. LangChain) jika kebutuhannya masih simpel berbasis basic RAG / Prompt Engineering biasa. Langsung pakai Pydantic + Official SDK dirasa sudah cukup _performant_.

---

END.
