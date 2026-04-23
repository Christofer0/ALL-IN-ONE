<script setup lang="ts">
import { ref, computed, onMounted } from "vue";

interface Habit {
  id: number;
  emoji: string;
  name: string;
  streak: number;
  color: string;
  freq: "daily" | "weekday" | "custom";
  done: boolean;
  weekData: number[]; // 0 for missed, 1 for done
  rate: number;
}

const DAYS_SHORT = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// State
const habits = ref<Habit[]>([]);
const stats = ref({
  doneToday: 0,
  totalHabits: 0,
  bestStreak: 0,
  overallWeekRate: 0,
  perfectDays: 0,
});

const currentView = ref<"today" | "week" | "heatmap">("today");
const isModalOpen = ref(false);
const todayStr = ref("");
const isReminderOn = ref(false);
const isLoading = ref(false);

const API_BASE =
  (import.meta.env.VITE_API_BASE || "http://localhost:9991") +
  "/api/admin/habits";

const fetchHabits = async () => {
  try {
    const res = await fetch(API_BASE, { credentials: "include" });
    if (!res.ok) throw new Error("Failed to fetch habits");
    habits.value = await res.json();
  } catch (err) {
    console.error(err);
  }
};

const fetchStats = async () => {
  try {
    const res = await fetch(`${API_BASE}/stats`, { credentials: "include" });
    if (!res.ok) throw new Error("Failed to fetch stats");
    stats.value = await res.json();
  } catch (err) {
    console.error(err);
  }
};

const fetchData = async () => {
  isLoading.value = true;
  await Promise.all([fetchHabits(), fetchStats()]);
  isLoading.value = false;
};

const newHabitForm = ref({
  name: "",
  emoji: "⭐",
  color: "blue",
  freq: "daily" as Habit["freq"],
  time: "08:00",
});

// Stats Computed
const summary = computed(() => {
  const doneCount = habits.value.filter((h) => h.done).length;
  const totalCount = habits.value.length;
  const percentage =
    totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;
  const remainingCount = totalCount - doneCount;

  // Ring: circumference = 2π*34 = 213.6
  const circumference = 213.6;
  const offset = circumference - (circumference * percentage) / 100;

  return { doneCount, totalCount, percentage, remainingCount, offset };
});

const bestStreak = computed(() => stats.value.bestStreak);
const overallWeekRate = computed(() => stats.value.overallWeekRate);

// Common Logic
const toggleHabit = async (id: number | string) => {
  try {
    const res = await fetch(`${API_BASE}/${id}/toggle`, {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) throw new Error("Toggle failed");
    await fetchData();
  } catch (err) {
    alert("Gagal update status");
  }
};

const toggleWeekCell = async (habitId: number | string, dayIdx: number) => {
  // Calculate date for the cell
  const d = new Date();
  d.setDate(d.getDate() - (6 - dayIdx));
  const logDate = d.toISOString().split("T")[0];

  const h = habits.value.find((x) => x.id === habitId);
  if (!h) return;

  const currentStatus = h.weekData[dayIdx];
  const newStatus = currentStatus === 1 ? false : true;

  try {
    const res = await fetch(`${API_BASE}/${habitId}/logs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ logDate, done: newStatus }),
      credentials: "include",
    });
    if (!res.ok) throw new Error("Status update failed");
    await fetchData();
  } catch (err) {
    alert("Gagal update status mingguan");
  }
};

const deleteHabit = async (id: number | string) => {
  if (confirm("Hapus habit ini?")) {
    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Delete failed");
      await fetchData();
    } catch (err) {
      alert("Gagal menghapus habit");
    }
  }
};

const openModal = () => {
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
};

const saveHabit = async () => {
  if (!newHabitForm.value.name.trim()) return;

  const colors: Record<string, string> = {
    blue: "#4A70A9",
    green: "#4ade80",
    amber: "#fb923c",
    purple: "#c084fc",
    teal: "#2dd4bf",
  };

  const payload = {
    emoji: newHabitForm.value.emoji,
    name: newHabitForm.value.name,
    color: colors[newHabitForm.value.color] || "#4A70A9",
    freq: newHabitForm.value.freq,
  };

  try {
    const res = await fetch(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      credentials: "include",
    });
    if (!res.ok) throw new Error("Save habit failed");
    await fetchData();
    closeModal();
    newHabitForm.value.name = "";
  } catch (err) {
    alert("Gagal menyimpan habit");
  }
};

onMounted(() => {
  const now = new Date();
  todayStr.value = now.toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  fetchData();
});
</script>

<template>
  <main class="page-content">
    <!-- Header -->
    <header
      style="
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 24px;
      "
    >
      <div style="display: flex; align-items: center; gap: 12px">
        <div style="font-size: 1.1rem; font-weight: 700; color: var(--p-light)">
          Habit Tracker
        </div>
        <span
          style="
            font-size: 0.72rem;
            color: var(--text-muted);
            font-family: JetBrains Mono, monospace;
            margin-top: 2px;
          "
        >
          {{ todayStr }}
        </span>
      </div>
      <div style="display: flex; align-items: center; gap: 8px">
        <div class="view-toggles">
          <button
            v-for="v in ['today', 'week', 'heatmap']"
            :key="v"
            class="view-tab"
            :class="{ active: currentView === v }"
            @click="currentView = v as any"
          >
            {{ v.charAt(0).toUpperCase() + v.slice(1) }}
          </button>
        </div>
        <button
          class="btn-ghost"
          style="font-size: 0.78rem"
          :class="{ 'bell-active': isReminderOn }"
          @click="isReminderOn = !isReminderOn"
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          Reminder
        </button>
        <button class="btn-primary" @click="openModal">
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Habit
        </button>
      </div>
    </header>

    <!-- Summary -->
    <div
      class="stats-grid"
      style="
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 14px;
        margin-bottom: 24px;
      "
    >
      <div class="card p-4">
        <div class="stat-label">Today</div>
        <div class="stat-value">
          {{ summary.doneCount
          }}<span class="stat-total">/{{ summary.totalCount }}</span>
        </div>
        <div class="stat-meta">habits completed</div>
      </div>
      <div class="card p-4">
        <div class="stat-label">Best Streak</div>
        <div class="stat-value" style="color: #fb923c">🔥 {{ bestStreak }}</div>
        <div class="stat-meta">days — Current top</div>
      </div>
      <div class="card p-4">
        <div class="stat-label">Week Rate</div>
        <div class="stat-value" style="color: #4a70a9">
          {{ overallWeekRate }}%
        </div>
        <div class="stat-meta">completion this week</div>
      </div>
      <div class="card p-4">
        <div class="stat-label">Perfect Days</div>
        <div class="stat-value" style="color: #4ade80">8</div>
        <div class="stat-meta">100% completions</div>
      </div>
    </div>

    <!-- Today View -->
    <div v-if="currentView === 'today'">
      <div class="card p-5 progress-card">
        <div class="ring-container">
          <svg width="80" height="80" viewBox="0 0 80 80">
            <circle
              cx="40"
              cy="40"
              r="34"
              fill="none"
              stroke="#1E1E1E"
              stroke-width="7"
            />
            <circle
              cx="40"
              cy="40"
              r="34"
              fill="none"
              stroke="#4A70A9"
              stroke-width="7"
              stroke-linecap="round"
              :stroke-dasharray="213.6"
              :stroke-dashoffset="summary.offset"
              transform="rotate(-90 40 40)"
              class="ring-progress"
            />
          </svg>
          <div class="ring-text">{{ summary.percentage }}%</div>
        </div>
        <div style="flex: 1">
          <div style="font-size: 0.95rem; font-weight: 600; margin-bottom: 4px">
            Daily Check-in — <span style="color: #4a70a9">Today</span>
          </div>
          <div style="font-size: 0.8rem; color: #6b7280; margin-bottom: 12px">
            Selesaikan semua habit hari ini untuk perfect day! 💪
          </div>
          <div class="progress-bar-bg">
            <div
              class="progress-bar-fill"
              :style="{ width: summary.percentage + '%' }"
            ></div>
          </div>
        </div>
        <div class="rem-count-wrap">
          <div class="rem-label">REMAINING</div>
          <div class="rem-val">{{ summary.remainingCount }}</div>
          <div class="rem-label">habits</div>
        </div>
      </div>

      <div class="habit-list">
        <div v-for="h in habits" :key="h.id" class="habit-card p-4">
          <div style="display: flex; align-items: center; gap: 14px">
            <button
              class="check-btn"
              :class="{ done: h.done }"
              @click="toggleHabit(h.id)"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                :stroke="h.done ? '#8FABD4' : '#374151'"
                stroke-width="2.5"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </button>
            <div style="font-size: 1.4rem">{{ h.emoji }}</div>
            <div style="flex: 1; min-width: 0">
              <div
                style="
                  display: flex;
                  align-items: center;
                  gap: 8px;
                  margin-bottom: 4px;
                "
              >
                <div class="habit-name" :class="{ 'done-text': h.done }">
                  {{ h.name }}
                </div>
                <span v-if="h.streak >= 7" style="font-size: 0.72rem"
                  >🔥 {{ h.streak }}d</span
                >
                <span v-else-if="h.streak > 0" class="badge-gray"
                  >{{ h.streak }}d</span
                >
              </div>
              <div class="habit-week-preview">
                <div
                  v-for="(d, i) in h.weekData"
                  :key="i"
                  class="preview-dot"
                  :style="{
                    background: d ? h.color + '55' : 'var(--p-primary)',
                    border: d
                      ? '1px solid ' + h.color + '33'
                      : '1px solid var(--p-card-border)',
                  }"
                  @click.stop="toggleWeekCell(h.id, i)"
                  title="Klik untuk toggle status hari ini"
                ></div>
                <span class="preview-rate">{{ h.rate }}% week</span>
              </div>
            </div>
            <div style="text-align: right; flex-shrink: 0">
              <div class="label-mono">STREAK</div>
              <div class="streak-val" :style="{ color: h.color }">
                {{ h.streak > 0 ? h.streak : "—" }}
              </div>
            </div>
            <button class="action-btn" @click="deleteHabit(h.id)">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              </svg>
            </button>
          </div>
          <div v-if="h.done" class="done-banner">
            <span class="pulse"></span> Completed today
          </div>
        </div>
      </div>
    </div>

    <!-- Weekly View -->
    <div v-if="currentView === 'week'" class="card p-5">
      <div
        style="
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        "
      >
        <div style="font-size: 0.88rem; font-weight: 600">Weekly Overview</div>
      </div>
      <div class="week-grid">
        <div class="week-row header">
          <div class="habit-name-col"></div>
          <div
            v-for="(d, i) in DAYS_SHORT"
            :key="d"
            class="day-col"
            :class="{ today: i === 6 }"
          >
            {{ d }}
          </div>
        </div>
        <div v-for="h in habits" :key="h.id" class="week-row">
          <div class="habit-name-col">{{ h.emoji }} {{ h.name }}</div>
          <div v-for="(d, i) in h.weekData" :key="i" class="day-col">
            <div
              class="week-cell"
              :class="{ done: d, missed: !d, today: i === 6 }"
              @click="toggleWeekCell(h.id, i)"
            >
              <svg
                v-if="d"
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="3"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      <div class="week-footer">
        <div class="label-mono" style="margin-bottom: 12px">
          Week completion by habit
        </div>
        <div v-for="h in habits" :key="h.id" class="habit-progress-row">
          <div class="prog-name">{{ h.emoji }} {{ h.name }}</div>
          <div class="prog-bar-bg">
            <div
              class="prog-bar-fill"
              :style="{ width: h.rate + '%', background: h.color }"
            ></div>
          </div>
          <div class="prog-pct">{{ h.rate }}%</div>
        </div>
      </div>
    </div>

    <!-- Heatmap View -->
    <div v-if="currentView === 'heatmap'" class="card p-5">
      <div
        style="
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        "
      >
        <div style="font-size: 0.88rem; font-weight: 600">
          Consistency Heatmap — 2025
        </div>
        <div class="heat-legend">
          <span>Less</span>
          <div class="heat-cell v0"></div>
          <div class="heat-cell v1"></div>
          <div class="heat-cell v2"></div>
          <div class="heat-cell v3"></div>
          <div class="heat-cell v4"></div>
          <span>More</span>
        </div>
      </div>
      <div class="heatmap-grid-scroll">
        <div class="months-wrap">
          <div v-for="m in MONTHS.slice(0, 4)" :key="m" class="month-col">
            <div class="month-label">{{ m }}</div>
            <div class="month-heat-grid">
              <div
                v-for="d in 28"
                :key="d"
                class="heat-cell"
                :class="'v' + Math.floor(Math.random() * 5)"
              ></div>
            </div>
          </div>
        </div>
      </div>
      <div class="heat-stats">
        <div class="h-stat">
          <div class="label-mono">TOTAL DAYS TRACKED</div>
          <div class="val-lg">106</div>
        </div>
        <div class="h-stat">
          <div class="label-mono">PERFECT DAYS</div>
          <div class="val-lg" style="color: #4ade80">23</div>
        </div>
        <div class="h-stat">
          <div class="label-mono">OVERALL RATE</div>
          <div class="val-lg" style="color: #4a70a9">74%</div>
        </div>
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
                Add New Habit
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
              @submit.prevent="saveHabit"
              style="display: flex; flex-direction: column; gap: 16px"
            >
              <div>
                <label class="form-label">Habit name</label>
                <input
                  v-model="newHabitForm.name"
                  class="form-input"
                  placeholder="e.g. Meditasi 10 menit"
                  required
                />
              </div>

              <div
                style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px"
              >
                <div>
                  <label class="form-label">Icon / Emoji</label>
                  <input
                    v-model="newHabitForm.emoji"
                    class="form-input"
                    maxlength="2"
                    style="font-size: 1.2rem; text-align: center"
                  />
                </div>
                <div>
                  <label class="form-label">Theme Color</label>
                  <select v-model="newHabitForm.color" class="form-input">
                    <option value="blue">Blue</option>
                    <option value="green">Green</option>
                    <option value="amber">Amber</option>
                    <option value="purple">Purple</option>
                    <option value="teal">Teal</option>
                  </select>
                </div>
              </div>

              <div>
                <label class="form-label">Frequency</label>
                <div class="freq-toggles">
                  <button
                    v-for="f in ['daily', 'weekday', 'custom']"
                    :key="f"
                    type="button"
                    class="view-tab"
                    :class="{ active: newHabitForm.freq === f }"
                    @click="newHabitForm.freq = f as any"
                  >
                    {{
                      f === "daily"
                        ? "Every day"
                        : f === "weekday"
                          ? "Weekdays"
                          : "Custom"
                    }}
                  </button>
                </div>
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
                  Save Habit
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
.label-mono {
  font-size: 0.65rem;
  font-family: "JetBrains Mono", monospace;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--text-muted);
  font-weight: 700;
}
.stat-label {
  font-size: 0.65rem;
  font-family: "JetBrains Mono", monospace;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--text-muted);
  font-weight: 700;
  margin-bottom: 8px;
}
.stat-value {
  font-size: 1.8rem;
  font-weight: 800;
  color: var(--p-light);
  line-height: 1;
}
.stat-total {
  font-size: 1rem;
  color: var(--text-muted);
}
.stat-meta {
  font-size: 0.72rem;
  color: #6b7280;
  margin-top: 4px;
}

.view-toggles {
  display: flex;
  gap: 2px;
  background: var(--p-primary);
  border: 1px solid var(--p-card-border);
  border-radius: 8px;
  padding: 3px;
}
.view-tab {
  padding: 6px 16px;
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.15s;
  font-family: "JetBrains Mono", monospace;
  background: transparent;
  color: #6b7280;
}
.view-tab.active {
  background: rgba(74, 112, 169, 0.15);
  color: #8fabd4;
  border-color: rgba(74, 112, 169, 0.25);
}

.progress-card {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}
.ring-container {
  position: relative;
  width: 80px;
  height: 80px;
  flex-shrink: 0;
}
.ring-progress {
  transition: stroke-dashoffset 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}
.ring-text {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  font-weight: 800;
}
.progress-bar-bg {
  height: 6px;
  background: var(--p-card-border);
  border-radius: 3px;
  overflow: hidden;
}
.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #4a70a9, #8fabd4);
  border-radius: 3px;
  transition: width 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}
.rem-count-wrap {
  text-align: center;
  flex-shrink: 0;
  border-left: 1px solid var(--p-card-border);
  padding-left: 20px;
}
.rem-label {
  font-size: 0.65rem;
  font-family: "JetBrains Mono", monospace;
  color: var(--text-muted);
}
.rem-val {
  font-size: 2rem;
  font-weight: 800;
  color: var(--p-light);
  line-height: 1;
  margin: 4px 0;
}

.habit-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.habit-card {
  background: var(--p-surface);
  transition: border-color 0.2s;
  border: 1px solid var(--p-card-border);
  cursor: pointer;
  border-radius: 14px;
  position: relative;
}
.habit-card:hover {
  border-color: rgba(74, 112, 169, 0.25);
  background: var(--p-primary);
}
.habit-name {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--p-light);
  transition: 0.2s;
}
.habit-name.done-text {
  text-decoration: line-through;
  color: #6b7280;
}
.habit-week-preview {
  display: flex;
  gap: 3px;
  align-items: center;
  margin-top: 4px;
}
.preview-dot {
  width: 14px;
  height: 14px;
  border-radius: 3px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.preview-dot:hover {
  transform: scale(1.15);
  filter: brightness(1.2);
}
.preview-dot:active {
  transform: scale(0.9);
}
.preview-rate {
  font-size: 0.65rem;
  color: var(--text-muted);
  font-family: "JetBrains Mono", monospace;
  margin-left: 4px;
}
.streak-val {
  font-size: 1.2rem;
  font-weight: 800;
}

.check-btn {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  border: 2px solid var(--p-card-border);
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}
.check-btn.done {
  background: rgba(74, 112, 169, 0.2);
  border-color: #4a70a9;
}
.done-banner {
  background: rgba(74, 112, 169, 0.04);
  border-top: 1px solid rgba(74, 112, 169, 0.1);
  padding: 8px 20px;
  font-size: 0.7rem;
  font-family: "JetBrains Mono", monospace;
  color: #4a70a9;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 12px;
  margin-bottom: -4px;
  margin-left: -16px;
  margin-right: -16px;
  border-bottom-left-radius: 14px;
  border-bottom-right-radius: 14px;
}

.week-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 24px;
}
.week-row {
  display: grid;
  grid-template-columns: 180px repeat(7, 1fr);
  gap: 6px;
  align-items: center;
}
.habit-name-col {
  font-size: 0.78rem;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.day-col {
  text-align: center;
}
.day-col.today {
  color: #8fabd4;
  font-weight: 700;
}
.week-cell {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.6rem;
  cursor: pointer;
  transition: 0.15s;
  border: 1px solid transparent;
  margin: 0 auto;
}
.week-cell.done {
  background: rgba(74, 112, 169, 0.3);
  color: #8fabd4;
}
.week-cell.missed {
  background: var(--p-primary);
  border-color: var(--p-card-border);
  color: var(--text-muted);
}
.week-cell.today {
  border: 1.5px solid #4a70a9;
}

.habit-progress-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}
.prog-name {
  font-size: 0.8rem;
  width: 140px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.prog-bar-bg {
  flex: 1;
  height: 5px;
  background: var(--p-card-border);
  border-radius: 3px;
}
.prog-bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.5s;
}
.prog-pct {
  font-size: 0.72rem;
  font-family: "JetBrains Mono", monospace;
  color: #6b7280;
  width: 35px;
  text-align: right;
}

.heat-legend {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.65rem;
  color: var(--text-muted);
}
.heat-cell {
  width: 10px;
  height: 10px;
  border-radius: 2px;
  border: 1px solid var(--p-card-border);
}
.heat-cell.v0 {
  background: var(--p-primary);
}
.heat-cell.v1 {
  background: rgba(74, 112, 169, 0.2);
}
.heat-cell.v2 {
  background: rgba(74, 112, 169, 0.4);
}
.heat-cell.v3 {
  background: rgba(74, 112, 169, 0.7);
}
.heat-cell.v4 {
  background: #8fabd4;
}

.heatmap-grid-scroll {
  overflow-x: auto;
  padding-bottom: 8px;
}
.months-wrap {
  display: flex;
  gap: 20px;
}
.month-col {
  min-width: 100px;
}
.month-label {
  font-size: 0.6rem;
  font-family: "JetBrains Mono", monospace;
  color: var(--text-muted);
  margin-bottom: 8px;
  letter-spacing: 0.08em;
}
.month-heat-grid {
  display: grid;
  grid-template-columns: repeat(7, 12px);
  gap: 3px;
}

.heat-stats {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--p-card-border);
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
.val-lg {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--p-light);
  margin-top: 4px;
}

.freq-toggles {
  display: flex;
  gap: 4px;
  background: var(--p-primary);
  padding: 4px;
  border-radius: 8px;
  border: 1px solid var(--p-card-border);
  width: fit-content;
}
.action-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--text-muted);
  padding: 6px;
  transition: 0.2s;
}
.action-btn:hover {
  color: #f87171;
}

.close-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  color: #6b7280;
  display: flex;
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

.pulse {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #4ade80;
  display: inline-block;
  animation: pulse-anim 2s infinite;
}
@keyframes pulse-anim {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
}

.bell-active {
  animation: bell-shake 0.4s ease;
}
@keyframes bell-shake {
  0%,
  100% {
    transform: rotate(0);
  }
  25% {
    transform: rotate(15deg);
  }
  75% {
    transform: rotate(-15deg);
  }
}
</style>
