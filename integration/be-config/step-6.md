# Panduan Integrasi Backend & Frontend (Tahap 6: Habit Tracker)

Dokumen ini adalah instruksi untuk Junior Developer dalam merancang dan mengimplementasikan sistem Backend (Database & API) khusus untuk fitur **Habit Tracker** (`frontend/src/views/private/Habits.vue`).

Fitur ini bertujuan memungkinkan user memantau kebiasaan harian (habits) secara personal, melacak streak, mencatat progress mingguan, dan melihat visualisasi konsistensi berupa heatmap — semua data bersumber dari database via API.

Bekerjalah di dalam direktori `services/core/src`. Ikuti pola arsitektur yang sudah ada:
**Schema (Drizzle) → Repository → Service → Controller → Routes**

---

## 1. Analisa Kebutuhan Fitur Habit Tracker

Berdasarkan analisis pada komponen `Habits.vue`, saat ini semua data habit bersifat **hardcoded / mock statis** di frontend. Data habits bersifat **persistent per user** dan membutuhkan tracking harian.

Kebutuhan utamanya adalah:

- **Data Habit (Master)**:
  - Emoji / icon habit
  - Nama habit
  - Warna tema (hex color)
  - Frekuensi: `daily`, `weekday`, atau `custom`

- **Tracking Harian**:
  - Status selesai (`done`) per hari per habit
  - Data 7 hari terakhir (`weekData`) untuk preview mingguan
  - Streak (jumlah hari berturut-turut habit dilakukan)
  - Completion rate mingguan (`rate` dalam %)

- **Statistik Aggregasi**:
  - Total habit selesai hari ini vs total habit
  - Best streak dari semua habit
  - Overall week rate (rata-rata semua habit dalam seminggu)
  - Jumlah "Perfect Days" (hari dengan 100% semua habit selesai)

- **Manajemen CRUD**:
  - Tambah habit baru
  - Hapus habit
  - Toggle status done hari ini
  - Toggle status per hari di weekly view

---

## 2. Desain Schema Database (Drizzle ORM)

Buat dua file schema baru, ikuti pola yang sama seperti `note.ts` atau `transaction.ts`.

---

### File: `src/db/schema/habit.ts`

```ts
import {
  pgTable,
  uuid,
  varchar,
  date,
  boolean,
  timestamp,
  integer,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const habits = pgTable("habits", {
  id: uuid("id").primaryKey().defaultRandom(),
  emoji: varchar("emoji", { length: 10 }).notNull().default("⭐"),
  name: varchar("name", { length: 255 }).notNull(),
  color: varchar("color", { length: 20 }).notNull().default("#4A70A9"),
  freq: varchar("freq", { length: 20 })
    .$type<"daily" | "weekday" | "custom">()
    .notNull()
    .default("daily"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const habitLogs = pgTable(
  "habit_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    habitId: uuid("habit_id")
      .references(() => habits.id, { onDelete: "cascade" })
      .notNull(),
    logDate: date("log_date").notNull(), // format: YYYY-MM-DD
    done: boolean("done").notNull().default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    habitDateUnique: uniqueIndex("habit_logs_habit_id_log_date_unique").on(
      table.habitId,
      table.logDate,
    ),
  }),
);

export const habitsRelations = relations(habits, ({ many }) => ({
  logs: many(habitLogs),
}));

export const habitLogsRelations = relations(habitLogs, ({ one }) => ({
  habit: one(habits, {
    fields: [habitLogs.habitId],
    references: [habits.id],
  }),
}));
```

> **Catatan**: Kombinasi `habit_id` + `log_date` dibuat **UNIQUE** menggunakan `uniqueIndex` agar upsert aman dari duplikat.

---

### Update: `src/db/schema/index.ts`

Tambahkan export baru dari file habit:

```ts
export * from "./habit.js";
```

---

## 3. Struktur API (RESTful) via Express

Semua endpoint didaftarkan di `src/routes/admin.ts` (dilindungi `authMiddleware` sesuai pola yang sudah ada).

| Method   | Path                           | Fungsi                                               |
| -------- | ------------------------------ | ---------------------------------------------------- |
| `GET`    | `/api/admin/habits`            | Ambil semua habit beserta data harian                |
| `POST`   | `/api/admin/habits`            | Buat habit baru                                      |
| `DELETE` | `/api/admin/habits/:id`        | Hapus habit                                          |
| `POST`   | `/api/admin/habits/:id/toggle` | Toggle status done hari ini                          |
| `POST`   | `/api/admin/habits/:id/logs`   | Toggle status pada tanggal tertentu (weekly view)    |
| `GET`    | `/api/admin/habits/stats`      | Ambil statistik agregat (streak, rate, perfect days) |

---

## 4. Response Format (Backend → Frontend)

### GET `/api/admin/habits`

Backend mengembalikan habits **beserta** kalkulasi `weekData`, `streak`, `rate`, dan `done` hari ini.

```json
[
  {
    "id": "uuid-...",
    "emoji": "📖",
    "name": "Baca buku 30 menit",
    "streak": 21,
    "color": "#4A70A9",
    "freq": "daily",
    "done": true,
    "weekData": [1, 1, 1, 0, 1, 1, 1],
    "rate": 86
  }
]
```

- `done` = apakah **hari ini** sudah dilakukan
- `weekData` = array 7 elemen, index 0 = 6 hari lalu → index 6 = hari ini
- `streak` = dihitung dari `habit_logs` secara berturut-turut mundur dari hari ini
- `rate` = persentase `weekData` yang bernilai `1`

---

### GET `/api/admin/habits/stats`

```json
{
  "doneToday": 3,
  "totalHabits": 6,
  "bestStreak": 21,
  "overallWeekRate": 65,
  "perfectDays": 8
}
```

---

### POST `/api/admin/habits` (Request Body)

```json
{
  "name": "Meditasi 10 menit",
  "emoji": "🧘",
  "color": "#c084fc",
  "freq": "daily"
}
```

---

### POST `/api/admin/habits/:id/logs` (Request Body)

Digunakan untuk toggle pada tampilan **Weekly View**.

```json
{
  "logDate": "2025-04-18",
  "done": true
}
```

---

## 5. Instruksi Implementasi Lanjutan (Node.js Layered Architecture)

---

### 1. **Buat Schema** — `src/db/schema/habit.ts`

Salin kode schema dari Bagian 2 ke file baru ini.
Lalu tambahkan `export * from "./habit.js"` ke `src/db/schema/index.ts`.

---

### 2. **Buat Repository** — `src/repositories/HabitRepository.ts`

Ikuti pola yang sama seperti `NoteRepository.ts` atau `TransactionRepository.ts`.

Fungsi yang harus diimplementasi:

```ts
export const HabitRepository = {
  // Ambil semua habit
  async findAll(): Promise<habit[]>,

  // Ambil log suatu habit dalam rentang tanggal (YYYY-MM-DD)
  async findLogsByDateRange(habitId: string, from: string, to: string): Promise<habitLog[]>,

  // Insert or Update log untuk habit tertentu pada tanggal tertentu
  // Gunakan: db.insert().values().onConflictDoUpdate()
  async upsertLog(habitId: string, logDate: string, done: boolean): Promise<void>,

  // Tambah habit baru
  async create(data: typeof habits.$inferInsert): Promise<habit>,

  // Hapus habit by ID
  async delete(id: string): Promise<void>,
};
```

> **Penting untuk `upsertLog`**: Gunakan `.onConflictDoUpdate()` dari Drizzle ORM agar tidak menggunakan dua query terpisah.
> Contoh:
>
> ```ts
> await db
>   .insert(habitLogs)
>   .values({ habitId, logDate, done })
>   .onConflictDoUpdate({
>     target: [habitLogs.habitId, habitLogs.logDate],
>     set: { done },
>   });
> ```

---

### 3. **Buat Service** — `src/services/HabitService.ts`

Ikuti pola yang sama seperti `NoteService.ts`.

Berisi **business logic utama**. Fungsi wajib:

- **`getAll()`**:
  - Ambil semua habits dari repository
  - Untuk setiap habit, ambil log 7 hari terakhir
  - Hitung `weekData` (array 7 nilai 0/1), `rate`, `done` (hari ini), `streak`
  - Return dalam format response frontend

- **`getStats()`**:
  - Hitung `doneToday` (habits yang `done = true` hari ini)
  - Hitung `bestStreak` (streak tertinggi dari semua habits)
  - Hitung `overallWeekRate` (rata-rata `rate` semua habits)
  - Hitung `perfectDays` (jumlah hari di mana semua habits `done`)

- **`create(data)`**: Panggil `HabitRepository.create()`

- **`delete(id)`**: Panggil `HabitRepository.delete()`

- **`toggleToday(id)`**:
  - Ambil log hari ini untuk habit tersebut
  - Balikkan status `done`-nya menggunakan `upsertLog`

- **`toggleLog(habitId, logDate, done)`**: Panggil `HabitRepository.upsertLog()`

> **Logika Streak** (implementasikan di dalam `getAll()`):
> Hitung mundur dari hari ini. Selama ada log `done = true` pada hari berturut-turut, tambahkan counter. Berhenti saat ada hari `done = false` atau tidak ada log sama sekali.

---

### 4. **Buat Controller** — `src/controllers/private/HabitController.ts`

Ikuti pola yang sama seperti `NoteController.ts`.

```ts
import { Request, Response } from "express";
import { HabitService } from "../../services/HabitService.js";

export const HabitController = {
  async getHabits(req: Request, res: Response) { ... },
  async createHabit(req: Request, res: Response) { ... },
  async deleteHabit(req: Request, res: Response) { ... },
  async toggleToday(req: Request, res: Response) { ... },
  async toggleLog(req: Request, res: Response) { ... },
  async getStats(req: Request, res: Response) { ... },
};
```

Setiap method memanggil method yang sesuai di `HabitService` dan mengembalikan response JSON. Tangani error dengan `try/catch`.

---

### 5. **Daftarkan Routes** — `src/routes/admin.ts`

Tambahkan blok berikut di dalam file `admin.ts` yang sudah ada:

```ts
import { HabitController } from "../controllers/private/HabitController.js";

// Habits
router.get("/habits", HabitController.getHabits);
router.get("/habits/stats", HabitController.getStats);
router.post("/habits", HabitController.createHabit);
router.delete("/habits/:id", HabitController.deleteHabit);
router.post("/habits/:id/toggle", HabitController.toggleToday);
router.post("/habits/:id/logs", HabitController.toggleLog);
```

> **Perhatian urutan route**: Pastikan `/habits/stats` didaftarkan **sebelum** `/habits/:id` agar Express tidak mengira `stats` adalah parameter `:id`.

---

## 6. Penyelarasan Kode Frontend

Update logic pada `Habits.vue`.

### Sebelumnya:

- Data `habits` menggunakan `ref<Habit[]>([...])` — data mock statis hardcoded
- Fungsi `toggleHabit`, `toggleWeekCell`, `deleteHabit`, `saveHabit` hanya memanipulasi state lokal
- Stats card "Perfect Days" (`8`) hardcoded
- Heatmap menggunakan `Math.random()` — data tidak nyata

### Setelah integrasi:

Gunakan base URL core API (biasanya `http://localhost:5000`) dengan header Authorization yang sesuai jika diperlukan.

**Saat `onMounted`**:

- Fetch `GET /api/admin/habits` → populate `habits.value`
- Fetch `GET /api/admin/habits/stats` → populate stats (perfect days, best streak, dll.)

**Fungsi `toggleHabit(id)`**:

- Panggil `POST /api/admin/habits/:id/toggle`
- Setelah sukses, re-fetch habits

**Fungsi `toggleWeekCell(habitId, dayIdx)`**:

- Hitung `logDate` dari `dayIdx` (index 0 = 6 hari lalu, index 6 = hari ini)
- Panggil `POST /api/admin/habits/:id/logs` dengan `{ logDate, done }`

**Fungsi `saveHabit()`**:

- Panggil `POST /api/admin/habits` dengan payload form
- Setelah sukses, re-fetch habits

**Fungsi `deleteHabit(id)`**:

- Panggil `DELETE /api/admin/habits/:id`
- Setelah sukses, hapus dari `habits.value`

---

## 7. Flow Akhir Sistem

```
Frontend (Habits.vue)
  ↓
GET /api/admin/habits         → HabitService.getAll()
                              → HabitRepository.findLogsByDateRange()
                              → Return: habits + weekData + streak + rate + done

POST /api/admin/habits        → HabitService.create()
                              → HabitRepository.create()

DELETE /api/admin/habits/:id  → HabitService.delete()
                              → HabitRepository.delete()

POST /api/admin/habits/:id/toggle
                              → HabitService.toggleToday()
                              → HabitRepository.upsertLog(today, !currentDone)

POST /api/admin/habits/:id/logs
                              → HabitService.toggleLog(logDate, done)
                              → HabitRepository.upsertLog(logDate, done)

GET /api/admin/habits/stats   → HabitService.getStats()
                              → Kalkulasi agregat dari habit_logs
```

---

## 8. Catatan Penting

- ✅ Gunakan **layered architecture**: Schema → Repository → Service → Controller → Routes
- ✅ Streak dihitung di **backend** (Service layer), bukan frontend
- ✅ `weekData` dihitung di **backend**, bukan frontend
- ✅ Gunakan **`onConflictDoUpdate`** dari Drizzle ORM untuk upsert di `habit_logs`
- ✅ Tambahkan export habit ke `src/db/schema/index.ts`
- ✅ Daftarkan routes di `src/routes/admin.ts` (sudah ada `authMiddleware`)
- ⚠️ Pastikan route `/habits/stats` didaftarkan **sebelum** `/habits/:id`
- ⚠️ Heatmap menggunakan random data saat ini — integrasinya **opsional** di tahap ini, prioritaskan CRUD dan weekly view
- ❌ Jangan gunakan data mock / hardcoded setelah integrasi selesai

---

END.
