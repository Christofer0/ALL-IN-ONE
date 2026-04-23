<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import api from "@/utils/api";

interface KeyResult {
  id: number;
  title: string;
  done: boolean;
  target?: number;
  current?: number;
}

interface Goal {
  id: number;
  title: string;
  tag: string;
  desc: string;
  deadline: string;
  status: "on-track" | "at-risk" | "behind" | "completed";
  krs: KeyResult[];
  notes: string;
  isArchived: boolean;
}

// State
const goals = ref<Goal[]>([]);
const statsApi = ref({
  activeCount: 0,
  avgProgress: 0,
  krRatio: "0/0",
});

const filterStatus = ref<
  "all" | "on-track" | "at-risk" | "behind" | "completed"
>("all");
const isModalOpen = ref(false);
const todayStr = ref("");
const daysLeft = ref(0);
const isLoading = ref(false);
const isEditing = ref(false);
const editingId = ref<number | string | null>(null);

const fetchGoals = async () => {
  try {
    const res = await api.get("/admin/goals");
    goals.value = res.data;
  } catch (err) {
    console.error(err);
  }
};

const fetchStats = async () => {
  try {
    const res = await api.get("/admin/goals/stats");
    statsApi.value = res.data;
  } catch (err) {
    console.error(err);
  }
};

const fetchData = async () => {
  isLoading.value = true;
  await Promise.all([fetchGoals(), fetchStats()]);
  isLoading.value = false;

  // Calculate days left from the nearest deadline of active goals
  const activeGoals = goals.value.filter((g) => !g.isArchived);
  if (activeGoals.length > 0) {
    const deadlines = activeGoals.map((g) => new Date(g.deadline).getTime());
    const minDeadline = Math.min(...deadlines);
    const today = new Date().getTime();
    daysLeft.value = Math.max(
      0,
      Math.ceil((minDeadline - today) / (1000 * 60 * 60 * 24)),
    );
  } else {
    daysLeft.value = 0;
  }
};

const newGoalForm = ref({
  title: "",
  desc: "",
  tag: "General",
  deadline: new Date().toISOString().split("T")[0],
  status: "on-track" as Goal["status"],
  krs: [{ title: "" }, { title: "" }] as {
    id?: number | string;
    title: string;
  }[],
  notes: "",
});

// Stats Computed
const stats = computed(() => {
  return {
    activeCount: statsApi.value.activeCount,
    avgProgress: statsApi.value.avgProgress,
    krRatio: statsApi.value.krRatio,
  };
});

const filteredGoals = computed(() => {
  return goals.value.filter((g) => {
    if (g.isArchived) return false;
    if (filterStatus.value === "all") return true;
    return g.status === filterStatus.value;
  });
});

// Logic
const getGoalProgress = (goal: any) => {
  return goal.progress || 0;
};

const toggleKR = async (goalId: string | number, krId: string | number) => {
  try {
    await api.post(`/admin/goals/${goalId}/krs/${krId}/toggle`);
    await fetchData();
  } catch (err) {
    alert("Gagal update status Key Result");
  }
};

const archiveGoal = async (id: string | number) => {
  if (confirm("Archive goal ini?")) {
    try {
      await api.post(`/admin/goals/${id}/archive`);
      await fetchData();
    } catch (err) {
      alert("Gagal mengarsipkan goal");
    }
  }
};

const addKRInput = () => {
  newGoalForm.value.krs.push({ title: "" });
};

const removeKRInput = (index: number) => {
  newGoalForm.value.krs.splice(index, 1);
};

const editGoal = (goal: Goal) => {
  isEditing.value = true;
  editingId.value = goal.id;
  newGoalForm.value = {
    title: goal.title,
    desc: goal.desc || "",
    tag: goal.tag || "General",
    deadline: goal.deadline,
    status: goal.status,
    krs: (goal.krs || (goal as any).keyResults || []).map((k: any) => ({
      id: k.id,
      title: k.title,
    })),
    notes: goal.notes || "",
  };
  isModalOpen.value = true;
};

const openModal = () => {
  isEditing.value = false;
  editingId.value = null;
  newGoalForm.value = {
    title: "",
    desc: "",
    tag: "General",
    deadline: new Date().toISOString().split("T")[0],
    status: "on-track",
    krs: [{ title: "" }, { title: "" }],
    notes: "",
  };
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
};

const saveGoal = async () => {
  if (!newGoalForm.value.title.trim()) return;

  const payload = {
    ...newGoalForm.value,
    krs: newGoalForm.value.krs
      .filter((k) => k.title.trim() !== "")
      .map((k) => ({ id: k.id, title: k.title })),
  };

  try {
    if (isEditing.value && editingId.value) {
      await api.put(`/admin/goals/${editingId.value}`, payload);
    } else {
      await api.post("/admin/goals", payload);
    }
    await fetchData();
    closeModal();
  } catch (err) {
    alert("Gagal menyimpan goal");
  }
};

const askAI = (context?: string) => {
  alert(`Opening AI Chat with context: ${context || "General Goals"}`);
};

onMounted(() => {
  todayStr.value = new Date().toLocaleDateString("id-ID", {
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
          Goals / OKR
        </div>
        <span
          style="
            font-size: 0.72rem;
            color: #374151;
            font-family:
              JetBrains Mono,
              monospace;
            margin-top: 2px;
          "
          >{{ todayStr }}</span
        >
      </div>
      <div style="display: flex; align-items: center; gap: 8px">
        <button
          class="btn-ghost"
          style="font-size: 0.78rem"
          @click="askAI('General')"
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#8FABD4"
            stroke-width="2"
          >
            <path
              d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
            />
          </svg>
          Ask AI
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
          New Goal
        </button>
      </div>
    </header>

    <!-- Stats -->
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
        <div class="stat-label">Active Goals</div>
        <div class="stat-value">{{ stats.activeCount }}</div>
        <div class="stat-meta">Q2 2025</div>
      </div>
      <div class="card p-4">
        <div class="stat-label">Avg Progress</div>
        <div class="stat-value" style="color: #4a70a9">
          {{ stats.avgProgress }}%
        </div>
        <div class="stat-meta">Across all goals</div>
      </div>
      <div class="card p-4">
        <div class="stat-label">KR Selesai</div>
        <div class="stat-value" style="color: #4ade80">{{ stats.krRatio }}</div>
        <div class="stat-meta">Key results done</div>
      </div>
      <div class="card p-4">
        <div class="stat-label">Hari Tersisa</div>
        <div class="stat-value" style="color: #fb923c">{{ daysLeft }}</div>
        <div class="stat-meta">Until Jun 30</div>
      </div>
    </div>

    <!-- Filters -->
    <div
      style="display: flex; align-items: center; gap: 8px; margin-bottom: 20px"
    >
      <button
        v-for="s in [
          'all',
          'on-track',
          'at-risk',
          'behind',
          'completed',
        ] as const"
        :key="s"
        class="filter-tab"
        :class="{ active: filterStatus === s }"
        @click="filterStatus = s"
      >
        {{
          s === "all"
            ? "All Goals"
            : s === "completed"
              ? "Completed"
              : s.charAt(0).toUpperCase() + s.slice(1).replace("-", " ")
        }}
      </button>
    </div>

    <!-- Goals Grid -->
    <div
      class="goals-grid"
      style="
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
        gap: 16px;
        margin-bottom: 24px;
      "
    >
      <div v-for="g in filteredGoals" :key="g.id" class="goal-card">
        <div class="goal-header">
          <div
            style="
              display: flex;
              align-items: center;
              justify-content: space-between;
              margin-bottom: 12px;
            "
          >
            <div style="display: flex; align-items: center; gap: 8px">
              <span class="note-tag">{{ g.tag }}</span>
              <span v-if="g.status === 'completed'" class="badge-green"
                >COMPLETED</span
              >
            </div>
            <div class="radial-progress">
              <svg width="42" height="42" viewBox="0 0 42 42">
                <circle
                  cx="21"
                  cy="21"
                  r="18"
                  fill="none"
                  stroke="#1E1E1E"
                  stroke-width="3"
                />
                <circle
                  cx="21"
                  cy="21"
                  r="18"
                  fill="none"
                  stroke="#4A70A9"
                  stroke-width="3"
                  stroke-linecap="round"
                  :stroke-dasharray="2 * Math.PI * 18"
                  :stroke-dashoffset="
                    2 * Math.PI * 18 * (1 - getGoalProgress(g) / 100)
                  "
                  transform="rotate(-90 21 21)"
                  style="
                    transition: stroke-dashoffset 0.6s
                      cubic-bezier(0.16, 1, 0.3, 1);
                  "
                />
              </svg>
              <span class="radial-text">{{ getGoalProgress(g) }}%</span>
            </div>
          </div>
          <h3 class="goal-title">{{ g.title }}</h3>
          <p class="goal-desc">{{ g.desc }}</p>
          <div class="progress-track-wrap">
            <div class="progress-track">
              <!-- Gunakan tanda kutip tunggal (') untuk 'completed', '#4ade80', dll. -->
              <div
                class="progress-fill"
                :style="{
                  width: getGoalProgress(g) + '%',
                  background:
                    g.status === 'completed'
                      ? '#4ade80'
                      : g.status === 'on-track'
                        ? '#4a70a9'
                        : g.status === 'at-risk'
                          ? '#fb923c'
                          : '#f87171',
                }"
              ></div>
            </div>
          </div>
        </div>

        <div class="goal-body">
          <div class="kr-list">
            <div
              v-for="kr in g.krs"
              :key="kr.id"
              class="kr-row"
              @click="toggleKR(g.id, kr.id)"
            >
              <div class="kr-check" :class="{ done: kr.done }">
                <svg
                  v-if="kr.done"
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#8FABD4"
                  stroke-width="3"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <span
                class="kr-title"
                :class="{ 'done-text': kr.done }"
                :style="
                  kr.done
                    ? { color: '#9ca3af', textDecoration: 'line-through' }
                    : {}
                "
                >{{ kr.title }}</span
              >
              <span v-if="kr.done" class="badge-green">Done</span>
              <span v-else class="badge-gray">Todo</span>
            </div>
          </div>

          <div v-if="g.notes" class="goal-notes">
            <div
              class="label-mono"
              style="font-size: 0.65rem; color: #374151; margin-bottom: 5px"
            >
              📝 Catatan
            </div>
            <p style="font-size: 0.78rem; color: #9ca3af; line-height: 1.5">
              {{ g.notes }}
            </p>
          </div>
        </div>

        <div class="goal-footer">
          <div style="display: flex; gap: 6px">
            <div class="badge-date">
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              {{ g.deadline }}
            </div>
            <span :class="'btn-status ' + g.status">{{
              g.status.toUpperCase()
            }}</span>
          </div>
          <div style="display: flex; gap: 4px">
            <button
              class="action-btn"
              title="Edit Goal"
              @click.stop="editGoal(g)"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
                />
                <path
                  d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
                />
              </svg>
            </button>
            <button
              class="action-btn-danger"
              @click="archiveGoal(g.id)"
              title="Archive Goal"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polyline points="21 8 21 21 3 21 3 8" />
                <rect x="1" y="3" width="22" height="5" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- AI Panel -->
    <div class="ai-panel p-5">
      <div
        style="
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
        "
      >
        <div class="ai-icon">
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#8FABD4"
            stroke-width="2"
          >
            <path
              d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
            />
          </svg>
        </div>
        <div style="font-size: 0.82rem; font-weight: 600; color: #8fabd4">
          AI Goals Analysis
        </div>
        <div
          style="
            font-size: 0.65rem;
            color: #374151;
            font-family:
              JetBrains Mono,
              monospace;
            margin-left: auto;
          "
        >
          Updated: Today 08:00
        </div>
      </div>
      <p style="font-size: 0.82rem; color: #9ca3af; line-height: 1.7">
        <strong style="color: var(--p-light)">Ringkasan Q2:</strong> Progress
        keseluruhan {{ stats.avgProgress }}% dengan {{ daysLeft }} hari tersisa.
        Goal "Personal OS" on-track, namun goal revenue perlu perhatian segera —
        pace saat ini hanya 42% dari target bulanan.
        <span style="color: #fb923c"
          >Rekomendasi: Fokus pada outreach aktif minggu ini dan batch writing
          untuk konten blog agar tetap sesuai jadwal.</span
        >
      </p>
      <div style="margin-top: 12px; display: flex; gap: 8px">
        <button
          class="btn-ghost"
          style="font-size: 0.72rem"
          @click="askAI('Deep Analysis')"
        >
          Tanya lebih lanjut
        </button>
        <button class="btn-ghost" style="font-size: 0.72rem">
          Refresh Analysis
        </button>
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
                {{ isEditing ? "Edit Goal" : "New Goal" }}
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
              @submit.prevent="saveGoal"
              style="display: flex; flex-direction: column; gap: 16px"
            >
              <div>
                <label class="form-label">Objective (Goal Title)</label>
                <input
                  v-model="newGoalForm.title"
                  class="form-input"
                  placeholder="e.g. Launch SaaS Product"
                  required
                />
              </div>

              <div>
                <label class="form-label">Description</label>
                <textarea
                  v-model="newGoalForm.desc"
                  class="form-input"
                  rows="2"
                  style="resize: none"
                  placeholder="Describe your goal context..."
                ></textarea>
              </div>

              <div
                style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px"
              >
                <div>
                  <label class="form-label">Deadline</label>
                  <input
                    type="date"
                    v-model="newGoalForm.deadline"
                    class="form-input"
                    required
                  />
                </div>
                <div>
                  <label class="form-label">Status</label>
                  <select v-model="newGoalForm.status" class="form-input">
                    <option value="on-track">On Track</option>
                    <option value="at-risk">At Risk</option>
                    <option value="behind">Behind</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div>
                <label class="form-label">Key Results</label>
                <div style="display: flex; flex-direction: column; gap: 8px">
                  <div
                    v-for="(kr, idx) in newGoalForm.krs"
                    :key="idx"
                    style="display: flex; gap: 8px"
                  >
                    <input
                      v-model="newGoalForm.krs[idx].title"
                      class="form-input"
                      :placeholder="'Key result ' + (idx + 1) + '...'"
                      required
                    />
                    <button
                      type="button"
                      @click="removeKRInput(idx)"
                      class="btn-icon-danger"
                      v-if="newGoalForm.krs.length > 1"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  class="btn-ghost"
                  style="font-size: 0.72rem; margin-top: 8px"
                  @click="addKRInput"
                >
                  + Add Key Result
                </button>
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
                <button type="submit" class="btn-primary">Save Goal</button>
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
  letter-spacing: 0.1em;
}

.stat-label {
  font-size: 0.65rem;
  font-family: "JetBrains Mono", monospace;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #374151;
  margin-bottom: 8px;
}
.stat-value {
  font-size: 1.8rem;
  font-weight: 800;
  color: var(--p-light);
  line-height: 1;
}
.stat-meta {
  font-size: 0.72rem;
  color: #6b7280;
  margin-top: 4px;
}

.filter-tab {
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid transparent;
  transition: 0.15s;
  background: transparent;
  color: #6b7280;
}
.filter-tab.active {
  background: rgba(74, 112, 169, 0.15);
  color: #8fabd4;
  border-color: rgba(74, 112, 169, 0.25);
}
.filter-tab:hover:not(.active) {
  color: var(--p-light);
  border-color: #1e1e1e;
}

.goal-card {
  background: #080808;
  border: 1px solid var(--p-card-border);
  border-radius: 14px;
  overflow: hidden;
  transition: 0.2s;
}
.goal-card:hover {
  border-color: rgba(74, 112, 169, 0.3);
}

.goal-header {
  padding: 20px 20px 0;
}
.goal-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--p-light);
  margin-bottom: 6px;
}
.goal-desc {
  font-size: 0.8rem;
  color: #6b7280;
  line-height: 1.5;
  margin-bottom: 16px;
}

.note-tag {
  font-size: 0.65rem;
  padding: 2px 8px;
  border-radius: 20px;
  background: rgba(74, 112, 169, 0.1);
  color: #8fabd4;
  font-family: "JetBrains Mono", monospace;
}

.radial-progress {
  position: relative;
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.radial-text {
  position: absolute;
  font-size: 0.65rem;
  font-weight: 800;
  font-family: "JetBrains Mono", monospace;
}

.progress-track-wrap {
  margin-top: 12px;
}
.progress-track {
  height: 6px;
  background: #1e1e1e;
  border-radius: 3px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.goal-body {
  padding: 16px 20px;
}
.kr-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 16px;
}
.kr-row {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 4px 0;
}
.kr-check {
  width: 18px;
  height: 18px;
  border-radius: 4px;
  border: 1.5px solid #374151;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: 0.15s;
}
.kr-check.done {
  background: rgba(74, 112, 169, 0.2);
  border-color: #4a70a9;
}
.kr-title {
  font-size: 0.82rem;
  flex: 1;
  transition: 0.2s;
  color: var(--p-light);
}
.kr-title.done-text {
  text-decoration: line-through;
  color: #6b7280;
}

.goal-notes {
  background: #0d0d0d;
  border-radius: 8px;
  border: 1px solid #1a1a1a;
  padding: 10px 12px;
}

.goal-footer {
  padding: 12px 20px;
  border-top: 1px solid #1e1e1e;
  background: #040404;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.badge-date {
  font-size: 0.7rem;
  color: #6b7280;
  background: #111;
  padding: 4px 8px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.btn-status {
  font-size: 0.6rem;
  font-family: "JetBrains Mono", monospace;
  padding: 3px 8px;
  border-radius: 4px;
  font-weight: 700;
}
.btn-status.on-track {
  background: rgba(34, 197, 94, 0.1);
  color: #4ade80;
}
.btn-status.at-risk {
  background: rgba(251, 146, 60, 0.1);
  color: #fb923c;
}
.btn-status.behind {
  background: rgba(239, 68, 68, 0.1);
  color: #f87171;
}

.action-btn {
  background: #111;
  border: 1px solid #1e1e1e;
  color: #6b7280;
  border-radius: 6px;
  padding: 5px;
  cursor: pointer;
  transition: 0.2s;
  display: flex;
}
.action-btn:hover {
  color: var(--p-light);
  border-color: #4a70a9;
}
.action-btn-danger {
  background: #111;
  border: 1px solid #1e1e1e;
  color: #6b7280;
  border-radius: 6px;
  padding: 5px;
  cursor: pointer;
  transition: 0.2s;
  display: flex;
}
.action-btn-danger:hover {
  color: #f87171;
  border-color: #f87171;
}

.ai-panel {
  background: rgba(74, 112, 169, 0.05);
  border: 1px solid rgba(74, 112, 169, 0.15);
  border-radius: 12px;
}
.ai-icon {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: rgba(74, 112, 169, 0.1);
  border: 1px solid rgba(74, 112, 169, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-icon-danger {
  background: transparent;
  border: 1px solid #1e1e1e;
  color: #6b7280;
  border-radius: 8px;
  padding: 0 8px;
  cursor: pointer;
  transition: 0.2s;
}
.btn-icon-danger:hover {
  border-color: #f87171;
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
</style>
