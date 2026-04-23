<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import api from "@/utils/api";

interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  type: "income" | "expense";
  amount: number;
  notes: string;
}

const catColors: Record<string, string> = {
  Freelance: "#4A70A9",
  Project: "#8FABD4",
  Investment: "#60a5fa",
  "Other Income": "#93c5fd",
  Food: "#f87171",
  Transport: "#fb923c",
  Software: "#a78bfa",
  Personal: "#f472b6",
  Bills: "#fbbf24",
  Other: "#6B7280",
};

// State
const transactions = ref<Transaction[]>([]);
const isLoading = ref(true);

const fetchTransactions = async () => {
  isLoading.value = true;
  try {
    const response = await api.get("/admin/cashflow");
    transactions.value = response.data;
  } catch (error) {
    console.error("Failed to fetch transactions:", error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(async () => {
  await fetchTransactions();
  console.log(
    "Cashflow initialized. Total transactions:",
    transactions.value.length,
  );
  if (transactions.value.length > 0) {
    const latestDate = transactions.value[0].date;
    activeMonth.value = latestDate.substring(0, 7);
    console.log("Auto-switched to latest month:", activeMonth.value);
  }
});

const activeMonth = ref("2025-04");
const filterType = ref<"all" | "income" | "expense">("all");
const categoryFilter = ref("");
const searchQuery = ref("");
const isModalOpen = ref(false);
const categoryViewMode = ref<"donut" | "bars">("donut");

const form = ref<Partial<Transaction>>({
  type: "income",
  date: new Date().toISOString().split("T")[0],
  category: "",
  description: "",
  amount: 0,
  notes: "",
});

// Computed Metrics
const availableMonths = computed(() => {
  const months = new Set<string>();

  // If no transactions, default to current month
  if (transactions.value.length === 0) {
    months.add(new Date().toISOString().substring(0, 7));
  } else {
    transactions.value.forEach((t) => {
      months.add(t.date.substring(0, 7));
    });
  }

  return Array.from(months)
    .sort((a, b) => b.localeCompare(a)) // Sort newest first
    .map((m) => {
      const date = new Date(m + "-01");
      return {
        value: m,
        label: date.toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        }),
      };
    });
});

const summary = computed(() => {
  const inc = transactions.value
    .filter((t) => t.type === "income")
    .reduce((acc, t) => acc + t.amount, 0);
  const exp = transactions.value
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => acc + t.amount, 0);
  const net = inc - exp;
  const sr = inc > 0 ? Math.round((net / inc) * 100) : 0;
  return {
    totalIncome: inc,
    incomeCount: transactions.value.filter((t) => t.type === "income").length,
    totalExpense: exp,
    expenseCount: transactions.value.filter((t) => t.type === "expense").length,
    netBalance: net,
    savingsRate: sr,
  };
});

const filteredTransactions = computed(() => {
  return transactions.value
    .filter((t) => {
      const matchType =
        filterType.value === "all" || t.type === filterType.value;
      const matchCat =
        !categoryFilter.value || t.category === categoryFilter.value;
      const matchSearch =
        !searchQuery.value ||
        t.description.toLowerCase().includes(searchQuery.value.toLowerCase());
      const matchMonth = t.date.startsWith(activeMonth.value);
      return matchType && matchCat && matchSearch && matchMonth;
    })
    .sort((a, b) => b.date.localeCompare(a.date));
});

const categorizedData = computed(() => {
  const map: Record<string, number> = {};
  const monthTransactions = transactions.value.filter((t) =>
    t.date.startsWith(activeMonth.value),
  );

  monthTransactions.forEach((t) => {
    map[t.category] = (map[t.category] || 0) + t.amount;
  });

  const total = Object.values(map).reduce((a, b) => a + b, 0) || 1;
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .map(([cat, amt]) => ({
      cat,
      amt,
      pct: (amt / total) * 100,
      color: catColors[cat] || "#6B7280",
    }));
});

// Donut Logic
const circumference = 2 * Math.PI * 45;
const donutSegments = computed(() => {
  let offset = 0;
  return categorizedData.value.map((item) => {
    const dash = (circumference * item.pct) / 100;
    const currentOffset = offset;
    offset += dash;
    return {
      ...item,
      dash: `${dash} ${circumference - dash}`,
      offset: -currentOffset,
    };
  });
});

// Weekly Calculation Logic
const weeklyData = computed(() => {
  const result = [
    { label: "W1", inc: 0, exp: 0 },
    { label: "W2", inc: 0, exp: 0 },
    { label: "W3", inc: 0, exp: 0 },
    { label: "W4", inc: 0, exp: 0 },
  ];

  transactions.value.forEach((t) => {
    // Only process transactions for the active month
    if (!t.date.startsWith(activeMonth.value)) return;

    const day = parseInt(t.date.split("-")[2]);
    let weekIndex = 0;
    if (day <= 7) weekIndex = 0;
    else if (day <= 14) weekIndex = 1;
    else if (day <= 21) weekIndex = 2;
    else weekIndex = 3;

    if (t.type === "income") {
      result[weekIndex].inc += t.amount;
    } else {
      result[weekIndex].exp += t.amount;
    }
  });

  return result;
});

const maxWeekly = computed(() => {
  const m = Math.max(...weeklyData.value.map((d) => Math.max(d.inc, d.exp)));
  return m === 0 ? 1 : m;
});

// Methods
const fmt = (n: number) => "Rp " + Number(n).toLocaleString("id-ID");

const openModal = () => {
  isModalOpen.value = true;
  form.value = {
    type: "income",
    date: new Date().toISOString().split("T")[0],
    category: "",
    description: "",
    amount: 0,
    notes: "",
  };
};

const closeModal = () => {
  isModalOpen.value = false;
};

const saveTransaction = async () => {
  try {
    const payload = {
      date: form.value.date,
      description: form.value.description,
      category: form.value.category,
      type: form.value.type,
      amount: Number(form.value.amount),
      notes: form.value.notes,
    };

    await api.post("/admin/cashflow", payload);
    await fetchTransactions();
    closeModal();
  } catch (error) {
    console.error("Failed to save transaction:", error);
    alert("Error saving transaction.");
  }
};

const deleteTransaction = async (id: string) => {
  if (confirm("Delete this transaction?")) {
    try {
      await api.delete(`/admin/cashflow/${id}`);
      await fetchTransactions();
    } catch (error) {
      console.error("Failed to delete transaction:", error);
      alert("Error deleting transaction.");
    }
  }
};

const exportCSV = () => {
  const headers = ["Date", "Description", "Category", "Type", "Amount"];
  const rows = transactions.value.map((t) => [
    t.date,
    t.description,
    t.category,
    t.type,
    t.amount,
  ]);
  const csv = [headers, ...rows]
    .map((r) => r.map((v) => `"${v}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `cashflow_${activeMonth.value}.csv`;
  link.click();
};
</script>

<template>
  <main class="page-content">
    <!-- Header -->
    <header
      class="page-header"
      style="
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 24px;
      "
    >
      <div>
        <div style="font-size: 1.1rem; font-weight: 700; color: var(--p-light)">
          Cashflow
        </div>
        <div
          style="
            font-size: 0.72rem;
            color: #6b7280;
            font-family:
              JetBrains Mono,
              monospace;
            margin-top: 4px;
          "
        >
          /dashboard/cashflow · Track income & expenses
        </div>
      </div>
      <div style="display: flex; gap: 10px">
        <select
          v-model="activeMonth"
          class="form-input"
          style="width: auto; padding: 8px 14px"
        >
          <option v-for="m in availableMonths" :key="m.value" :value="m.value">
            {{ m.label }}
          </option>
        </select>
        <button class="btn-ghost" @click="exportCSV">
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Export CSV
        </button>
        <button class="btn-primary" @click="openModal">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Transaction
        </button>
      </div>
    </header>

    <!-- Stats -->
    <div
      class="stats-grid"
      style="
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 14px;
        margin-bottom: 24px;
      "
    >
      <div class="card p-5">
        <div class="stat-label">Total Income</div>
        <div class="stat-value text-green">{{ fmt(summary.totalIncome) }}</div>
        <div class="stat-sub">{{ summary.incomeCount }} transactions</div>
      </div>
      <div class="card p-5">
        <div class="stat-label">Total Expenses</div>
        <div class="stat-value text-red">{{ fmt(summary.totalExpense) }}</div>
        <div class="stat-sub">{{ summary.expenseCount }} transactions</div>
      </div>
      <div class="card p-5" style="border-color: rgba(74, 112, 169, 0.25)">
        <div class="stat-label" style="color: #8fabd4">Net Balance</div>
        <div
          class="stat-value"
          :class="summary.netBalance >= 0 ? 'text-green' : 'text-red'"
        >
          {{ fmt(summary.netBalance) }}
        </div>
        <div class="stat-sub">This month</div>
      </div>
      <div class="card p-5">
        <div class="stat-label">Savings Rate</div>
        <div class="stat-value">{{ summary.savingsRate }}%</div>
        <div class="progress-bar-wrap">
          <div
            class="progress-bar"
            :style="{
              width: Math.max(0, Math.min(100, summary.savingsRate)) + '%',
            }"
          ></div>
        </div>
      </div>
    </div>
    <!-- Charts -->
    <div
      class="charts-row"
      style="
        display: grid;
        grid-template-columns: 1fr 340px;
        gap: 16px;
        margin-bottom: 24px;
      "
    >
      <div class="card p-5">
        <div class="chart-header">
          <div style="font-size: 0.88rem; font-weight: 600">
            Income vs Expenses
          </div>
          <div class="chart-legend">
            <span class="legend-item"
              ><span class="dot" style="background: #4a70a9"></span>Income</span
            >
            <span class="legend-item"
              ><span class="dot" style="background: #f87171"></span
              >Expense</span
            >
          </div>
        </div>
        <div class="chart-container-rel">
          <div class="bar-chart" v-if="filteredTransactions.length > 0">
            <div v-for="d in weeklyData" :key="d.label" class="bar-group">
              <div
                class="bar bar-inc"
                :style="{ height: (d.inc / maxWeekly) * 100 + '%' }"
                :title="'Income: ' + fmt(d.inc)"
              ></div>
              <div
                class="bar bar-exp"
                :style="{ height: (d.exp / maxWeekly) * 100 + '%' }"
                :title="'Expense: ' + fmt(d.exp)"
              ></div>
            </div>
          </div>
          <div v-else class="no-data-chart">
            No transactions in {{ activeMonth }}
          </div>
        </div>
        <div class="bar-labels">
          <div v-for="d in weeklyData" :key="d.label" class="bar-label">
            {{ d.label }}
          </div>
        </div>
      </div>

      <div class="card p-5">
        <div
          style="
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 20px;
          "
        >
          <div style="font-size: 0.88rem; font-weight: 600">By Category</div>
          <div class="mini-tabs">
            <button
              class="mini-tab"
              :class="{ active: categoryViewMode === 'donut' }"
              @click="categoryViewMode = 'donut'"
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="3"
              >
                <circle cx="12" cy="12" r="10" />
              </svg>
            </button>
            <button
              class="mini-tab"
              :class="{ active: categoryViewMode === 'bars' }"
              @click="categoryViewMode = 'bars'"
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="3"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
        </div>
        <div class="chart-container-rel">
          <div
            class="donut-wrap"
            v-if="categorizedData.length > 0 && categoryViewMode === 'donut'"
          >
            <svg viewBox="0 0 120 120" width="140" height="140">
              <circle
                cx="60"
                cy="60"
                r="45"
                fill="none"
                stroke="#1E1E1E"
                stroke-width="18"
              />
              <circle
                v-for="(seg, i) in donutSegments"
                :key="i"
                cx="60"
                cy="60"
                r="45"
                fill="none"
                :stroke="seg.color"
                stroke-width="18"
                :stroke-dasharray="seg.dash"
                :stroke-dashoffset="seg.offset"
                transform="rotate(-90 60 60)"
              />
              <text
                x="60"
                y="55"
                text-anchor="middle"
                fill="#EFECE3"
                font-size="9"
                font-family="JetBrains Mono"
              >
                Net
              </text>
              <text
                x="60"
                y="68"
                text-anchor="middle"
                fill="#8fabd4"
                font-size="7"
                font-family="JetBrains Mono"
                font-weight="600"
              >
                {{ summary.netBalance >= 0 ? "+" : "-"
                }}{{ fmt(Math.abs(summary.netBalance)).replace("Rp ", "") }}
              </text>
            </svg>
          </div>

          <div
            class="cat-bars"
            v-else-if="
              categorizedData.length > 0 && categoryViewMode === 'bars'
            "
          >
            <div
              v-for="cat in categorizedData.slice(0, 6)"
              :key="cat.cat"
              style="margin-bottom: 12px"
            >
              <div
                style="
                  display: flex;
                  justify-content: space-between;
                  font-size: 0.68rem;
                  margin-bottom: 4px;
                  color: #aaaaaa;
                "
              >
                <span>{{ cat.cat }}</span>
                <span>{{ Math.round(cat.pct) }}%</span>
              </div>
              <div class="progress-bar-wrap" style="height: 6px; margin-top: 0">
                <div
                  class="progress-bar"
                  :style="{ width: cat.pct + '%', background: cat.color }"
                ></div>
              </div>
            </div>
          </div>

          <div v-else class="no-data-chart mini">No activity</div>
        </div>

        <div
          v-if="categorizedData.length > 0 && categoryViewMode === 'donut'"
          class="donut-legend"
          style="
            margin-top: 20px;
            display: flex;
            flex-direction: column;
            gap: 8px;
          "
        >
          <div
            v-for="cat in categorizedData.slice(0, 5)"
            :key="cat.cat"
            class="legend-row"
          >
            <span class="legend-info">
              <span class="cat-dot" :style="{ background: cat.color }"></span>
              {{ cat.cat }}
            </span>
            <span class="legend-pct">{{ Math.round(cat.pct) }}%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="card overflow-hidden">
      <div class="table-toolbar">
        <div style="font-size: 0.88rem; font-weight: 600; flex: 1">
          Transactions
        </div>
        <div class="tab-toggles">
          <button
            v-for="t in ['all', 'income', 'expense']"
            :key="t"
            class="tab-btn"
            :class="{ active: filterType === t }"
            @click="filterType = t as any"
          >
            {{ t.charAt(0).toUpperCase() + t.slice(1) }}
          </button>
        </div>
        <div class="table-search">
          <input
            type="text"
            v-model="searchQuery"
            class="form-input search-input"
            placeholder="Search..."
          />
        </div>
        <select v-model="categoryFilter" class="form-input" style="width: auto">
          <option value="">All Categories</option>
          <option v-for="(_, cat) in catColors" :key="cat" :value="cat">
            {{ cat }}
          </option>
        </select>
      </div>
      <div style="overflow-x: auto">
        <table>
          <thead>
            <tr>
              <th class="th-mono">Date</th>
              <th class="th-mono">Description</th>
              <th class="th-mono">Category</th>
              <th class="th-mono">Type</th>
              <th class="th-mono" style="text-align: right">Amount</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="t in filteredTransactions" :key="t.id" class="table-row">
              <td class="td-mono">{{ t.date }}</td>
              <td>
                <div style="font-weight: 500; color: var(--p-light)">
                  {{ t.description }}
                </div>
                <div
                  v-if="t.notes"
                  style="font-size: 0.68rem; color: #374151; margin-top: 2px"
                >
                  {{ t.notes }}
                </div>
              </td>
              <td>
                <span
                  style="
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 0.72rem;
                    color: #6b7280;
                  "
                >
                  <span
                    class="cat-dot"
                    :style="{ background: catColors[t.category] || '#6B7280' }"
                  ></span>
                  {{ t.category }}
                </span>
              </td>
              <td>
                <span
                  :class="t.type === 'income' ? 'badge-green' : 'badge-red'"
                >
                  {{ t.type === "income" ? "Income" : "Expense" }}
                </span>
              </td>
              <td
                style="
                  text-align: right;
                  font-family:
                    JetBrains Mono,
                    monospace;
                  font-weight: 600;
                "
                :class="t.type === 'income' ? 'text-green' : 'text-red'"
              >
                {{ t.type === "income" ? "+" : "-" }}{{ fmt(t.amount) }}
              </td>
              <td style="text-align: right">
                <button
                  class="action-btn-danger"
                  @click="deleteTransaction(t.id)"
                >
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  </svg>
                </button>
              </td>
            </tr>
            <tr v-if="filteredTransactions.length === 0">
              <td
                colspan="6"
                style="
                  text-align: center;
                  padding: 48px;
                  color: #374151;
                  font-family:
                    JetBrains Mono,
                    monospace;
                  font-size: 0.8rem;
                "
              >
                No transactions found
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal -->
    <Transition name="fade">
      <div
        v-if="isModalOpen"
        class="modal-overlay open"
        @click.self="closeModal"
      >
        <Transition name="slide-up">
          <div class="modal">
            <header
              style="
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 24px;
              "
            >
              <h2
                style="font-size: 1rem; font-weight: 700; color: var(--p-light)"
              >
                Add Transaction
              </h2>
              <button @click="closeModal" class="close-btn">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </header>

            <form
              @submit.prevent="saveTransaction"
              style="display: flex; flex-direction: column; gap: 16px"
            >
              <div class="type-selector">
                <label class="form-label">Type</label>
                <div class="type-toggle">
                  <button
                    type="button"
                    class="type-tab inc"
                    :class="{ active: form.type === 'income' }"
                    @click="form.type = 'income'"
                  >
                    ⬆ Income
                  </button>
                  <button
                    type="button"
                    class="type-tab exp"
                    :class="{ active: form.type === 'expense' }"
                    @click="form.type = 'expense'"
                  >
                    ⬇ Expense
                  </button>
                </div>
              </div>

              <div
                style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px"
              >
                <div>
                  <label class="form-label">Date *</label>
                  <input
                    type="date"
                    v-model="form.date"
                    class="form-input"
                    required
                  />
                </div>
                <div>
                  <label class="form-label">Category *</label>
                  <select v-model="form.category" class="form-input" required>
                    <option value="" disabled>Select...</option>
                    <optgroup label="Income">
                      <option value="Freelance">Freelance</option>
                      <option value="Project">Project</option>
                      <option value="Investment">Investment</option>
                      <option value="Other Income">Other Income</option>
                    </optgroup>
                    <optgroup label="Expense">
                      <option value="Food">Food & Drinks</option>
                      <option value="Transport">Transport</option>
                      <option value="Software">Software</option>
                      <option value="Personal">Personal</option>
                      <option value="Bills">Bills</option>
                      <option value="Other">Other</option>
                    </optgroup>
                  </select>
                </div>
              </div>

              <div>
                <label class="form-label">Description *</label>
                <input
                  type="text"
                  v-model="form.description"
                  class="form-input"
                  placeholder="e.g. Client payment"
                  required
                />
              </div>

              <div>
                <label class="form-label">Amount (Rp) *</label>
                <div class="amount-input-wrap">
                  <span class="currency-prefix">Rp</span>
                  <input
                    type="number"
                    v-model="form.amount"
                    class="form-input"
                    style="padding-left: 38px"
                    placeholder="0"
                    required
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label class="form-label">Notes (optional)</label>
                <input
                  type="text"
                  v-model="form.notes"
                  class="form-input"
                  placeholder="Additional details..."
                />
              </div>

              <footer
                style="
                  display: flex;
                  justify-content: flex-end;
                  gap: 10px;
                  margin-top: 8px;
                "
              >
                <button type="button" class="btn-ghost" @click="closeModal">
                  Cancel
                </button>
                <button type="submit" class="btn-primary">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Save Transaction
                </button>
              </footer>
            </form>
          </div>
        </Transition>
      </div>
    </Transition>
  </main>
</template>

<style scoped>
.text-green {
  color: #4ade80;
}
.text-red {
  color: #f87171;
}

.stat-label {
  font-size: 0.65rem;
  color: #6b7280;
  font-family: "JetBrains Mono", monospace;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 8px;
}
.stat-value {
  font-size: 1.4rem;
  font-weight: 800;
}
.stat-sub {
  font-size: 0.68rem;
  color: #374151;
  margin-top: 4px;
}

.progress-bar-wrap {
  height: 4px;
  background: var(--p-card-border);
  border-radius: 2px;
  margin-top: 10px;
}
.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #4a70a9, #8fabd4);
  border-radius: 2px;
  transition: width 0.5s;
}

.chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}
.chart-legend {
  display: flex;
  gap: 12px;
}
.dot-dashed {
  width: 12px;
  height: 1px;
  background: #374151;
  border-top: 1px dashed #6b7280;
}

.bar-chart {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  height: 140px;
}
.bar-group {
  flex: 1;
  display: flex;
  align-items: flex-end;
  gap: 3px;
  height: 100%;
}
.bar {
  flex: 1;
  border-radius: 3px 3px 0 0;
  cursor: pointer;
  transition: opacity 0.2s;
  min-height: 2px;
}
.bar:hover {
  opacity: 0.7;
}
.bar-inc {
  background: #4a70a9;
  opacity: 0.85;
}
.bar-exp {
  background: #f87171;
  opacity: 0.75;
}
.bar-labels {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}
.bar-label {
  flex: 1;
  text-align: center;
  font-size: 0.6rem;
  font-family: "JetBrains Mono", monospace;
  color: #374151;
}

.donut-wrap {
  display: flex;
  justify-content: center;
}
.legend-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.legend-info {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 0.75rem;
  color: #aaaaaa;
}
.cat-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}
.legend-pct {
  font-size: 0.72rem;
  font-family: "JetBrains Mono", monospace;
  color: #6b7280;
}

.chart-container-rel {
  position: relative;
  min-height: 140px;
}

.no-data-chart {
  height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.72rem;
  color: #374151;
  font-family: "JetBrains Mono", monospace;
  border: 1px dashed var(--p-card-border);
  border-radius: 8px;
}
.no-data-chart.mini {
  height: 100px;
  border: none;
}

.table-toolbar {
  padding: 16px 20px;
  border-bottom: 1px solid var(--p-card-border);
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.tab-toggles {
  display: flex;
  background: var(--p-primary);
  padding: 3px;
  border-radius: 8px;
  border: 1px solid var(--p-card-border);
}
.tab-btn {
  padding: 6px 12px;
  font-size: 0.7rem;
  color: #6b7280;
  background: transparent;
  border: none;
  cursor: pointer;
  border-radius: 6px;
  transition: 0.2s;
  font-family: "JetBrains Mono", monospace;
}
.tab-btn.active {
  background: var(--p-surface);
  color: var(--p-light);
  border: 1px solid var(--p-card-border);
}

.mini-tabs {
  display: flex;
  background: var(--p-primary);
  padding: 2px;
  border-radius: 6px;
  border: 1px solid var(--p-card-border);
}
.mini-tab {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  border-radius: 4px;
  transition: 0.2s;
}
.mini-tab.active {
  background: var(--p-surface);
  color: var(--p-light);
  border: 1px solid var(--p-card-border);
}

.search-input {
  width: 160px;
  padding-top: 7px;
  padding-bottom: 7px;
}

.th-mono {
  font-family: "JetBrains Mono", monospace;
  font-size: 0.6rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #374151;
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid var(--p-card-border);
}
.td-mono {
  font-family: "JetBrains Mono", monospace;
  font-size: 0.72rem;
  color: #6b7280;
  padding: 12px 16px;
  border-bottom: 1px solid var(--p-card-border);
}

.table-row:hover td {
  background: rgba(255, 255, 255, 0.015);
}

.action-btn-danger {
  background: transparent;
  border: none;
  color: #374151;
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  transition: all 0.2s;
}
.action-btn-danger:hover {
  color: #f87171;
  background: rgba(239, 68, 68, 0.1);
}

.close-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  color: #6b7280;
  display: flex;
}
.type-toggle {
  display: flex;
  background: var(--p-primary);
  border: 1px solid var(--p-card-border);
  border-radius: 8px;
  padding: 3px;
}
.type-tab {
  flex: 1;
  padding: 8px;
  border: none;
  background: transparent;
  color: #6b7280;
  font-size: 0.82rem;
  cursor: pointer;
  border-radius: 6px;
  transition: 0.2s;
}
.type-tab.active.inc {
  background: rgba(34, 197, 94, 0.1);
  color: #4ade80;
}
.type-tab.active.exp {
  background: rgba(239, 68, 68, 0.1);
  color: #f87171;
}

.amount-input-wrap {
  position: relative;
}
.currency-prefix {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.82rem;
  color: #6b7280;
  font-family: "JetBrains Mono", monospace;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.slide-up-enter-active,
.slide-up-leave-active {
  transition:
    transform 0.3s cubic-bezier(0.16, 1, 0.3, 1),
    opacity 0.3s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(20px);
  opacity: 0;
}

/* SVG Animations */
svg path {
  transition:
    d 0.5s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.5s ease;
}
</style>
