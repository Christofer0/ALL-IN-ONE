# Step 1: Sinkronisasi Dashboard dengan Data Real

## Tujuan
Sekarang `Dashboard.vue` masih menampilkan **data hardcoded / dummy** untuk komponen:
- **Net Balance** (Rp 4.2M) → statis
- **Habits Today** (3/5, 60%) → statis
- **Goals Progress** (72%) → statis
- **Cashflow Overview** chart (data bar dummy) → statis
- **Email Schedule Today** (daftar dummy) → statis
- **AI Suggestion Banner** (teks rotasi hardcoded) → statis

Tugasmu adalah mengganti semua data statis tersebut dengan data **nyata** yang diambil dari API backend.

---

## API yang Tersedia

Semua endpoint berada di base URL: `http://localhost:9991/api/admin` (gunakan instance `api` dari `@/utils/api` yang sudah ada di project).

| Widget | Endpoint | Method |
|---|---|---|
| Net Balance & Cashflow Chart | `GET /admin/cashflow` | GET |
| Habits Today | `GET /admin/habits/stats` | GET |
| Goals Progress | `GET /admin/goals/stats` | GET |
| Email Schedule | *(belum ada endpoint terjadwal, skip dulu, biarkan dummy)* | — |

---

## Langkah-Langkah Implementasi

### 1. Tambahkan State dan Fetch untuk Cashflow

**Apa yang harus ditambahkan di `<script setup>`:**

```typescript
// 1. Cashflow State
const cashflowTotalIn = ref(0);
const cashflowTotalOut = ref(0);
const cashflowNet = ref(0);
const cashflowBars = ref<number[]>([]);
const isLoadingCashflow = ref(true);

// 2. Fetch Function
const fetchCashflow = async () => {
  try {
    const res = await api.get("/admin/cashflow");
    const transactions: any[] = res.data;

    // Pisahkan income dan pengeluaran
    const incomes = transactions.filter((t) => t.type === "income");
    const expenses = transactions.filter((t) => t.type === "expense");

    cashflowTotalIn.value = incomes.reduce((sum, t) => sum + Number(t.amount), 0);
    cashflowTotalOut.value = expenses.reduce((sum, t) => sum + Number(t.amount), 0);
    cashflowNet.value = cashflowTotalIn.value - cashflowTotalOut.value;

    // Ambil 6 transaksi terakhir untuk mini chart
    cashflowBars.value = transactions.slice(-6).map((t) =>
      t.type === "income" ? Number(t.amount) : -Number(t.amount)
    );
  } catch (error) {
    console.error("Failed to fetch cashflow:", error);
  } finally {
    isLoadingCashflow.value = false;
  }
};
```

**Panggil di `onMounted`:**
```typescript
onMounted(() => {
  rotateSuggestions();
  fetchProjectStats();
  fetchCashflow();    // ← tambahkan ini
  fetchHabits();     // ← tambahkan ini
  fetchGoals();      // ← tambahkan ini
});
```

---

### 2. Tambahkan State dan Fetch untuk Habits

```typescript
// Habit State
const habitStats = ref({ total: 0, doneToday: 0, completionRate: 0 });
const isLoadingHabits = ref(true);

// Fetch Function
// Endpoint: GET /admin/habits/stats
// Response: { total: number, doneToday: number, completionRate: number }
const fetchHabits = async () => {
  try {
    const res = await api.get("/admin/habits/stats");
    habitStats.value = res.data;
  } catch (error) {
    console.error("Failed to fetch habits:", error);
  } finally {
    isLoadingHabits.value = false;
  }
};
```

---

### 3. Tambahkan State dan Fetch untuk Goals

```typescript
// Goals State
const goalStats = ref({ avgCompletion: 0, activeGoals: 0 });
const isLoadingGoals = ref(true);

// Fetch Function
// Endpoint: GET /admin/goals/stats
// Response struktur: { avgCompletion: number, activeGoals: number, ... }
const fetchGoals = async () => {
  try {
    const res = await api.get("/admin/goals/stats");
    goalStats.value = res.data;
  } catch (error) {
    console.error("Failed to fetch goals:", error);
  } finally {
    isLoadingGoals.value = false;
  }
};
```

---

### 4. Update Template

Ganti semua nilai hardcoded di `<template>` dengan data dari state yang baru.

#### A. Stat Card "Net Balance"
Ganti:
```html
<div ...>Rp 4.2M</div>
<span class="badge-green">+18%</span>
```
Dengan:
```html
<div ...>
  {{ isLoadingCashflow ? '...' : 'Rp ' + (cashflowNet / 1_000_000).toFixed(1) + 'M' }}
</div>
<span :class="cashflowNet >= 0 ? 'badge-green' : 'badge-red'">
  {{ cashflowNet >= 0 ? 'Surplus' : 'Defisit' }}
</span>
```

#### B. Stat Card "Habits Today"
Ganti:
```html
<span class="badge-blue">3/5</span>
<div ...>60%</div>
```
Dengan:
```html
<span class="badge-blue">{{ habitStats.doneToday }}/{{ habitStats.total }}</span>
<div ...>{{ habitStats.completionRate }}%</div>
```

Ganti juga mini bar-nya:
```html
<!-- Sebelum: v-for="i in 5" -->
<div
  v-for="i in habitStats.total"
  :key="i"
  style="flex: 1; height: 6px; border-radius: 2px"
  :style="{ background: i <= habitStats.doneToday ? '#4ade80' : '#1e1e1e' }"
></div>
```

#### C. Stat Card "Goals Progress"
Ganti:
```html
<div ...>72%</div>
<!-- dan width: 72% di progress bar -->
```
Dengan:
```html
<div ...>{{ goalStats.avgCompletion }}%</div>
<!-- progress bar -->
<div :style="{ width: goalStats.avgCompletion + '%' }"></div>
```

#### D. Cashflow Overview Chart
Ganti data dummy `[80, -70, 60, -85, 90, -55, 75, -60]` dengan:
```html
<div
  v-for="(val, idx) in cashflowBars"
  :key="idx"
  ...
>
```
Dan ganti summary di bawahnya:
```html
<div ...>Rp {{ (cashflowTotalIn / 1_000_000).toFixed(1) }}M</div>
<div ...>Rp {{ (cashflowTotalOut / 1_000_000).toFixed(1) }}M</div>
<div ...>Rp {{ Math.abs(cashflowNet / 1_000_000).toFixed(1) }}M</div>
```

---

## Format Helper (Opsional - Disarankan)

Tambahkan helper function untuk format angka Rupiah agar lebih rapi dan reusable:

```typescript
const formatRupiah = (amount: number): string => {
  if (amount >= 1_000_000) return `Rp ${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `Rp ${(amount / 1_000).toFixed(0)}K`;
  return `Rp ${amount}`;
};
```

Kemudian gunakan di template: `{{ formatRupiah(cashflowNet) }}`

---

## Catatan Penting

> [!NOTE]
> Perhatikan **format field** yang dikembalikan oleh API sebelum menggunakannya. Cek terlebih dahulu respons asli menggunakan `console.log(res.data)` untuk memahami struktur datanya. Jika field berbeda (misalnya `completion_rate` bukan `completionRate`), sesuaikan sebelum assign ke state.

> [!WARNING]
> Pastikan **loading state** selalu ditangani. Tampilkan teks `"..."` atau skeleton saat data belum selesai dimuat agar UI tidak terlihat kosong secara tiba-tiba.

> [!IMPORTANT]
> Email Schedule Today untuk saat ini **biarkan tetap hardcoded** karena endpoint terjadwal email belum memiliki format respons yang cocok untuk widget ini. Akan diintegrasikan di step berikutnya.

---

## Checklist Selesai

- [ ] State dan fetch function untuk cashflow ditambahkan
- [ ] State dan fetch function untuk habits ditambahkan
- [ ] State dan fetch function untuk goals ditambahkan
- [ ] Semua `onMounted` sudah memanggil ketiga fetch function baru
- [ ] Template stat card "Net Balance" menggunakan data real
- [ ] Template stat card "Habits Today" menggunakan data real
- [ ] Template stat card "Goals Progress" menggunakan data real
- [ ] Cashflow Overview chart menggunakan `cashflowBars` dari API
- [ ] Ringkasan cashflow (Total In, Out, Net) menggunakan data real
- [ ] Loading state ditangani dengan baik di semua widget
