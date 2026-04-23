# Panduan Integrasi Backend & Frontend (Tahap 7: Goals / OKR Tracker)

Dokumen ini adalah instruksi untuk Junior Developer dalam merancang dan mengimplementasikan sistem Backend (Database & API) khusus untuk fitur **Goals / OKR Tracker** (`frontend/src/views/private/Goals.vue`).

Fitur ini bertujuan memungkinkan user mengelola tujuan jangka pendek/menengah lengkap dengan Key Results, progress tracking, status monitoring, dan catatan — semua persisten di database via API.

Bekerjalah di dalam direktori `services/core/src`. Ikuti pola arsitektur yang sudah ada:
**Schema (Drizzle) → Repository → Service → Controller → Routes**

Referensi implementasi sebelumnya: lihat `HabitService.ts`, `HabitController.ts`, `HabitRepository.ts`.

---

## 1. Analisa Kebutuhan Fitur Goals / OKR

Berdasarkan analisis pada komponen `Goals.vue`, saat ini semua data bersifat **hardcoded / mock statis**. Fitur ini memiliki relasi one-to-many antara Goal dan Key Results.

Kebutuhan utamanya adalah:

- **Data Goal (Master)**:
  - Judul goal (objective)
  - Deskripsi
  - Tag / kategori (contoh: Product, Finance, Content)
  - Deadline (tanggal)
  - Status: `on-track`, `at-risk`, `behind`
  - Catatan / notes
  - Status arsip (`isArchived`)

- **Data Key Results (per Goal)**:
  - Judul key result
  - Status selesai (`done`)
  - Relasi ke goal induk (`goalId`)

- **Statistik Aggregasi**:
  - Jumlah active goals
  - Average progress (rata-rata % KR selesai per goal)
  - Rasio KR (total done vs total KR)
  - Hari tersisa hingga deadline terdekat (dihitung di frontend dari data)

- **Manajemen CRUD**:
  - Tambah goal baru beserta daftar KR
  - Toggle status `done` per Key Result
  - Archive goal (soft-delete via `isArchived = true`)
  - Filter berdasarkan status: `all`, `on-track`, `at-risk`, `behind`

---

## 2. Desain Schema Database (Drizzle ORM)

Buat **dua file schema** baru di `src/db/schema/`.

---

### File: `src/db/schema/goal.ts`

```ts
import {
  pgTable,
  uuid,
  varchar,
  text,
  date,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const goals = pgTable("goals", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  desc: text("desc"),
  tag: varchar("tag", { length: 100 }).notNull().default("General"),
  deadline: date("deadline").notNull(),
  status: varchar("status", { length: 20 })
    .$type<"on-track" | "at-risk" | "behind">()
    .notNull()
    .default("on-track"),
  notes: text("notes"),
  isArchived: boolean("is_archived").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const keyResults = pgTable("key_results", {
  id: uuid("id").primaryKey().defaultRandom(),
  goalId: uuid("goal_id")
    .references(() => goals.id, { onDelete: "cascade" })
    .notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  done: boolean("done").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const goalsRelations = relations(goals, ({ many }) => ({
  keyResults: many(keyResults),
}));

export const keyResultsRelations = relations(keyResults, ({ one }) => ({
  goal: one(goals, {
    fields: [keyResults.goalId],
    references: [goals.id],
  }),
}));
```

---

### Update: `src/db/schema/index.ts`

Tambahkan baris export:

```ts
export * from "./goal.js";
```

---

## 3. Struktur API (RESTful) via Express

Semua endpoint didaftarkan di `src/routes/admin.ts` (sudah ada `authMiddleware`).

| Method   | Path                                    | Fungsi                                                  |
| -------- | --------------------------------------- | ------------------------------------------------------- |
| `GET`    | `/api/admin/goals`                      | Ambil semua goal beserta key results-nya                |
| `POST`   | `/api/admin/goals`                      | Buat goal baru (beserta daftar KR sekaligus)            |
| `PUT`    | `/api/admin/goals/:id`                  | Update goal (title, desc, tag, deadline, status, notes) |
| `DELETE` | `/api/admin/goals/:id`                  | Hapus goal secara permanen                              |
| `POST`   | `/api/admin/goals/:id/archive`          | Archive goal (set `isArchived = true`)                  |
| `POST`   | `/api/admin/goals/:id/krs/:krId/toggle` | Toggle status `done` pada Key Result tertentu           |
| `GET`    | `/api/admin/goals/stats`                | Ambil statistik agregat                                 |

> **Perhatian**: Daftarkan `/goals/stats` **sebelum** `/goals/:id` di routes agar Express tidak salah parse.

---

## 4. Response Format (Backend → Frontend)

### GET `/api/admin/goals`

Backend mengembalikan goals **beserta** array `krs` (key results) dan nilai `progress` yang sudah dihitung.

```json
[
  {
    "id": "uuid-...",
    "title": "Launch Personal OS v1.0",
    "tag": "Product",
    "desc": "Migrasi dashboard dari HTML statis ke Vue 3 modular...",
    "deadline": "2025-05-15",
    "status": "on-track",
    "notes": "Dashboard main views sudah 80% selesai.",
    "isArchived": false,
    "progress": 50,
    "krs": [
      {
        "id": "uuid-kr-1",
        "goalId": "uuid-...",
        "title": "Selesaikan 7 modul private dashboard",
        "done": true
      },
      {
        "id": "uuid-kr-2",
        "goalId": "uuid-...",
        "title": "Optimasi lighthouse score > 90",
        "done": false
      }
    ]
  }
]
```

- `progress` = persentase KR yang `done` dari total KR milik goal tersebut (dihitung di **backend**)
- `krs` = array semua key results milik goal

---

### GET `/api/admin/goals/stats`

```json
{
  "activeCount": 3,
  "avgProgress": 58,
  "krDone": 6,
  "krTotal": 11
}
```

---

### POST `/api/admin/goals` (Request Body)

Satu request membuat goal sekaligus dengan seluruh KR-nya.

```json
{
  "title": "Publish 12 Blog Articles",
  "desc": "Membangun personal brand via tulisan teknis.",
  "tag": "Content",
  "deadline": "2025-12-31",
  "status": "on-track",
  "notes": "Sudah ada 3 draft.",
  "krs": [
    "Setup blog di website portfolio",
    "Publish 4 artikel pertama",
    "Publish 8 artikel berikutnya"
  ]
}
```

---

### PUT `/api/admin/goals/:id` (Request Body)

```json
{
  "title": "Publish 12 Blog Articles",
  "status": "at-risk",
  "notes": "Perlu jadwal lebih konsisten.",
  "deadline": "2025-12-31"
}
```

---

## 5. Instruksi Implementasi Lanjutan (Node.js Layered Architecture)

Bekerjalah di dalam `services/core/src`.

---

### 1. **Buat Schema** — `src/db/schema/goal.ts`

Salin kode schema dari Bagian 2. Lalu update `src/db/schema/index.ts`.

---

### 2. **Buat Repository** — `src/repositories/GoalRepository.ts`

Ikuti pola `HabitRepository.ts` atau `NoteRepository.ts`.

Fungsi yang harus diimplementasi:

```ts
export const GoalRepository = {
  // Ambil semua goal beserta key results (gunakan db.query dengan relations)
  async findAll(): Promise<GoalWithKRs[]>,

  // Ambil satu goal beserta KR-nya
  async findById(id: string): Promise<GoalWithKRs | null>,

  // Buat goal baru (tanpa KR, KR di-insert terpisah)
  async create(data: typeof goals.$inferInsert): Promise<Goal>,

  // Insert multiple KR untuk satu goal
  async createKeyResults(krs: { goalId: string; title: string }[]): Promise<void>,

  // Update goal
  async update(id: string, data: Partial<typeof goals.$inferInsert>): Promise<Goal>,

  // Archive goal (soft-delete)
  async archive(id: string): Promise<void>,

  // Hapus goal (cascade ke KR otomatis karena onDelete: "cascade")
  async delete(id: string): Promise<void>,

  // Toggle KR done status
  async toggleKR(krId: string): Promise<KeyResult>,
};
```

> **Tips**: Untuk `findAll` dan `findById`, gunakan `db.query.goals.findMany({ with: { keyResults: true } })` agar relasi otomatis di-join oleh Drizzle.

---

### 3. **Buat Service** — `src/services/GoalService.ts`

Ikuti pola `NoteService.ts`.

Berisi **business logic** utama. Fungsi wajib:

- **`getAll()`**:
  - Panggil `GoalRepository.findAll()`
  - Untuk setiap goal, hitung `progress` = `(krs.filter(kr => kr.done).length / krs.length) * 100`
  - Return dalam format response frontend

- **`getStats()`**:
  - Hitung `activeCount` (goals yang tidak diarsipkan)
  - Hitung `avgProgress` (rata-rata progress semua active goals)
  - Hitung total `krDone` dan `krTotal`

- **`create(data)`**:
  - Buat goal baru via `GoalRepository.create()`
  - Jika ada `krs` (array string judul), insert semua KR via `GoalRepository.createKeyResults()`

- **`update(id, data)`**: Panggil `GoalRepository.update()`

- **`archive(id)`**: Panggil `GoalRepository.archive()`

- **`delete(id)`**: Panggil `GoalRepository.delete()`

- **`toggleKR(goalId, krId)`**: Panggil `GoalRepository.toggleKR(krId)`

---

### 4. **Buat Controller** — `src/controllers/private/GoalController.ts`

Ikuti pola `NoteController.ts`.

```ts
export const GoalController = {
  async getGoals(req: Request, res: Response) { ... },
  async getStats(req: Request, res: Response) { ... },
  async createGoal(req: Request, res: Response) { ... },
  async updateGoal(req: Request, res: Response) { ... },
  async archiveGoal(req: Request, res: Response) { ... },
  async deleteGoal(req: Request, res: Response) { ... },
  async toggleKR(req: Request, res: Response) { ... },
};
```

Setiap method memanggil method yang sesuai di `GoalService` dan mengembalikan JSON response. Tangani error dengan `try/catch`.

---

### 5. **Daftarkan Routes** — `src/routes/admin.ts`

Tambahkan blok berikut setelah blok Habits:

```ts
import { GoalController } from "../controllers/private/GoalController.js";

// Goals / OKR
router.get("/goals/stats", GoalController.getStats);
router.get("/goals", GoalController.getGoals);
router.post("/goals", GoalController.createGoal);
router.put("/goals/:id", GoalController.updateGoal);
router.delete("/goals/:id", GoalController.deleteGoal);
router.post("/goals/:id/archive", GoalController.archiveGoal);
router.post("/goals/:id/krs/:krId/toggle", GoalController.toggleKR);
```

---

## 6. Penyelarasan Kode Frontend

Update logic pada `Goals.vue`.

### Sebelumnya:

- Data `goals` menggunakan `ref<Goal[]>([...])` — data mock statis hardcoded
- Fungsi `toggleKR`, `archiveGoal`, `saveGoal` hanya memanipulasi state lokal
- Stats dihitung dari data lokal via `computed`

### Setelah integrasi:

Gunakan base URL core API (`http://localhost:5000`) dengan kredensial sesi.

**Saat `onMounted`**:

- Fetch `GET /api/admin/goals` → populate `goals.value`
- Fetch `GET /api/admin/goals/stats` → populate stats card

**Fungsi `toggleKR(goalId, krId)`**:

- Panggil `POST /api/admin/goals/:goalId/krs/:krId/toggle`
- Setelah sukses, re-fetch goals (agar progress bar dan stats ikut update)

**Fungsi `archiveGoal(id)`**:

- Panggil `POST /api/admin/goals/:id/archive`
- Setelah sukses, re-fetch goals

**Fungsi `saveGoal()`**:

- Panggil `POST /api/admin/goals` dengan payload form (title, desc, tag, deadline, status, notes, krs)
- `krs` dikirim sebagai array string (judul saja), bukan object — backend yang membuat record-nya
- Setelah sukses, re-fetch goals dan tutup modal

**Stats Card "Hari Tersisa"**:

- Tetap dihitung di frontend dari `deadline` goal (tidak perlu API khusus)
- Ambil deadline terdekat dari semua active goals, lalu hitung selisihnya

---

## 7. Flow Akhir Sistem

```
Frontend (Goals.vue)
  ↓
GET /api/admin/goals          → GoalService.getAll()
                              → GoalRepository.findAll() (with: { keyResults: true })
                              → Return: goals + krs[] + progress

POST /api/admin/goals         → GoalService.create(data)
                              → GoalRepository.create() → GoalRepository.createKeyResults()

PUT /api/admin/goals/:id      → GoalService.update(id, data)
                              → GoalRepository.update()

POST /api/admin/goals/:id/archive
                              → GoalService.archive(id)
                              → GoalRepository.archive() (set isArchived = true)

POST /api/admin/goals/:id/krs/:krId/toggle
                              → GoalService.toggleKR(goalId, krId)
                              → GoalRepository.toggleKR(krId)

GET /api/admin/goals/stats    → GoalService.getStats()
                              → Kalkulasi agregat dari semua active goals
```

---

## 8. Catatan Penting

- ✅ Gunakan **layered architecture**: Schema → Repository → Service → Controller → Routes
- ✅ Progress dihitung di **backend** (Service layer), bukan frontend
- ✅ KR dibuat sekaligus saat `POST /api/admin/goals` (bulk insert)
- ✅ Archive menggunakan **soft-delete** (`isArchived = true`), bukan `DELETE`
- ✅ Gunakan `db.query.goals.findMany({ with: { keyResults: true } })` agar relasi terjoin
- ✅ Daftarkan route `/goals/stats` **sebelum** `/goals/:id`
- ✅ Tambahkan export `goal.ts` ke `src/db/schema/index.ts`
- ⚠️ Tombol **Edit Goal** di UI saat ini belum ada logic-nya — tambahkan modal edit jika diperlukan (opsional di tahap ini)
- ❌ Jangan gunakan data mock / hardcoded setelah integrasi selesai

---

END.
