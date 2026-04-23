<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";
import api from "@/utils/api";
import axios from "axios";
import { ROUTE_PATHS } from "@/router/constants";

// AI suggestions rotation
const suggestions = [
  'Pengeluaran bulan ini naik 18% dibanding bulan lalu. Pertimbangkan review kategori "Food & Drinks". Juga ada 3 habit yang streak-nya hampir putus hari ini.',
  "Kamu belum log transaksi sejak 2 hari lalu. Pastikan data cashflow tetap update untuk akurasi laporan bulanan.",
  'Goal "Launch Personal OS" sudah 85%. Dengan pace saat ini, estimasi selesai 15 hari lebih awal dari deadline.',
  "5 email terjadwal minggu ini. Cek preview sebelum jam 8 pagi untuk memastikan konten masih relevan.",
];
const currentSuggestion = ref(suggestions[0]);
const suggestionOpacity = ref(1);
let suggestionInterval: any;

const rotateSuggestions = () => {
  let si = 0;
  suggestionInterval = setInterval(() => {
    si = (si + 1) % suggestions.length;
    suggestionOpacity.value = 0;
    setTimeout(() => {
      currentSuggestion.value = suggestions[si];
      suggestionOpacity.value = 1;
    }, 300);
  }, 8000);
};

const projects = ref<any[]>([]);
const isLoadingProjects = ref(true);

// Cashflow State
const cashflowTotalIn = ref(0);
const cashflowTotalOut = ref(0);
const cashflowNet = ref(0);
const isLoadingCashflow = ref(true);
const lineDataIn = ref<number[]>([]);
const lineDataOut = ref<number[]>([]);
const dailyLabels = ref<string[]>([]);

// Habit State
const habitStats = ref({ total: 0, doneToday: 0, completionRate: 0 });
const isLoadingHabits = ref(true);

// Goals State
const goalStats = ref({ avgCompletion: 0, activeGoals: 0 });
const isLoadingGoals = ref(true);

// Email Schedule State
const scheduledEmails = ref<any[]>([]);
const isLoadingEmails = ref(true);

const formatRupiah = (amount: number): string => {
  if (Math.abs(amount) >= 1_000_000)
    return `Rp ${(amount / 1_000_000).toFixed(1)}M`;
  if (Math.abs(amount) >= 1_000) return `Rp ${(amount / 1_000).toFixed(0)}K`;
  return `Rp ${amount}`;
};

const fetchProjectStats = async () => {
  try {
    const response = await api.get("/admin/projects");
    projects.value = response.data;
  } catch (error) {
    console.error("Failed to fetch projects stats:", error);
  } finally {
    isLoadingProjects.value = false;
  }
};

const fetchCashflow = async () => {
  try {
    const res = await api.get("/admin/cashflow");
    const transactions: any[] = res.data;

    const incomes = transactions.filter((t) => t.type === "income");
    const expenses = transactions.filter((t) => t.type === "expense");

    cashflowTotalIn.value = incomes.reduce(
      (sum, t) => sum + Number(t.amount || 0),
      0,
    );
    cashflowTotalOut.value = expenses.reduce(
      (sum, t) => sum + Number(t.amount || 0),
      0,
    );
    cashflowNet.value = cashflowTotalIn.value - cashflowTotalOut.value;

    // Group transactions by date for the last 7 days
    const dailyData: Record<string, { in: number; out: number }> = {};
    const labels: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      labels.push(
        d.toLocaleDateString("id-ID", { day: "numeric", month: "short" }),
      );
      dailyData[dateStr] = { in: 0, out: 0 };
    }

    transactions.forEach((t) => {
      const tDate = t.date; // YYYY-MM-DD
      if (dailyData[tDate]) {
        if (t.type === "income") dailyData[tDate].in += Number(t.amount);
        else dailyData[tDate].out += Number(t.amount);
      }
    });

    dailyLabels.value = labels;
    lineDataIn.value = Object.keys(dailyData)
      .sort()
      .map((d) => dailyData[d].in);
    lineDataOut.value = Object.keys(dailyData)
      .sort()
      .map((d) => dailyData[d].out);
  } catch (error) {
    console.error("Failed to fetch cashflow:", error);
  } finally {
    isLoadingCashflow.value = false;
  }
};

const chartPaths = computed(() => {
  const dataIn = lineDataIn.value;
  const dataOut = lineDataOut.value;
  if (dataIn.length === 0) return { in: "", out: "", inArea: "", outArea: "" };

  const maxVal = Math.max(...dataIn, ...dataOut, 1);
  const w = 300;
  const h = 100;
  const stepX = w / (dataIn.length - 1);

  const getPoints = (data: number[]) =>
    data.map((v, i) => ({
      x: i * stepX,
      y: h - (v / maxVal) * h,
    }));

  const pointsIn = getPoints(dataIn);
  const pointsOut = getPoints(dataOut);

  // Smooth path generator (simple cubic bezier)
  const generateSmoothPath = (p: { x: number; y: number }[]) => {
    if (p.length === 0) return "";
    let d = `M ${p[0].x} ${p[0].y}`;
    for (let i = 0; i < p.length - 1; i++) {
      const p0 = p[i];
      const p1 = p[i + 1];
      const cp1x = p0.x + (p1.x - p0.x) / 2;
      const cp2x = p0.x + (p1.x - p0.x) / 2;
      d += ` C ${cp1x} ${p0.y}, ${cp2x} ${p1.y}, ${p1.x} ${p1.y}`;
    }
    return d;
  };

  const pathIn = generateSmoothPath(pointsIn);
  const pathOut = generateSmoothPath(pointsOut);

  return {
    in: pathIn,
    out: pathOut,
    inArea: `${pathIn} L ${w} ${h} L 0 ${h} Z`,
    outArea: `${pathOut} L ${w} ${h} L 0 ${h} Z`,
  };
});

const fetchHabits = async () => {
  try {
    const res = await api.get("/admin/habits/stats");
    const data = res.data;
    habitStats.value = {
      total: data.totalHabits || 0,
      doneToday: data.doneToday || 0,
      completionRate:
        data.totalHabits > 0
          ? Math.round((data.doneToday / data.totalHabits) * 100)
          : 0,
    };
  } catch (error) {
    console.error("Failed to fetch habits:", error);
  } finally {
    isLoadingHabits.value = false;
  }
};

const fetchGoals = async () => {
  try {
    const res = await api.get("/admin/goals/stats");
    const data = res.data;
    goalStats.value = {
      avgCompletion: data.avgProgress || 0,
      activeGoals: data.activeCount || 0,
    };
  } catch (error) {
    console.error("Failed to fetch goals:", error);
  } finally {
    isLoadingGoals.value = false;
  }
};

const fetchEmailSchedule = async () => {
  try {
    isLoadingEmails.value = true;
    const workerUrl = import.meta.env.VITE_API_BASE_WORKER || "http://localhost:9992";
    const res = await axios.get(`${workerUrl}/api/worker/emails`);
    const allEmails = res.data;
    
    // Filter for today's date (YYYY-MM-DD)
    const today = new Date().toISOString().split("T")[0];
    scheduledEmails.value = allEmails
      .filter((e: any) => e.date === today)
      .sort((a: any, b: any) => a.time.localeCompare(b.time))
      .slice(0, 3); // Only show top 3 for dashboard
  } catch (error) {
    console.error("Failed to fetch email schedule:", error);
  } finally {
    isLoadingEmails.value = false;
  }
};

const projectStats = computed(() => ({
  total: projects.value.length,
  published: projects.value.filter((p) => p.isPublished).length,
  draft: projects.value.filter((p) => !p.isPublished).length,
  percentage:
    projects.value.length > 0
      ? (projects.value.filter((p) => p.isPublished).length /
          projects.value.length) *
        100
      : 0,
}));

onMounted(() => {
  rotateSuggestions();
  fetchProjectStats();
  fetchCashflow();
  fetchHabits();
  fetchGoals();
  fetchEmailSchedule();
});

onUnmounted(() => {
  clearInterval(suggestionInterval);
});
</script>

<template>
  <main class="page-content">
    <!-- AI Suggestion Banner -->
    <div class="ai-card p-4 mb-6 flex items-center gap-4">
      <div
        style="
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: rgba(74, 112, 169, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        "
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--p-accent)"
          stroke-width="2"
        >
          <path
            d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
          />
        </svg>
      </div>
      <div style="flex: 1">
        <div
          style="
            font-size: 0.7rem;
            color: var(--p-secondary);
            font-family:
              JetBrains Mono,
              monospace;
            letter-spacing: 0.1em;
            margin-bottom: 2px;
          "
        >
          AI SUGGESTION · TODAY
        </div>
        <div
          style="font-size: 0.85rem; color: #efece3; transition: opacity 0.3s"
          :style="{ opacity: suggestionOpacity }"
        >
          {{ currentSuggestion }}
        </div>
      </div>
      <button class="btn-ghost" style="font-size: 0.75rem; white-space: nowrap">
        Ask AI →
      </button>
    </div>

    <!-- Stats Row -->
    <div
      style="
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;
        margin-bottom: 24px;
      "
    >
      <!-- Cashflow -->
      <div class="stat-card">
        <div
          style="
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 12px;
          "
        >
          <span
            style="
              font-size: 0.72rem;
              color: #6b7280;
              font-family:
                JetBrains Mono,
                monospace;
              text-transform: uppercase;
              letter-spacing: 0.08em;
            "
            >Net Balance</span
          >
          <span :class="cashflowNet >= 0 ? 'badge-green' : 'badge-red'">
            {{ cashflowNet >= 0 ? "Surplus" : "Defisit" }}
          </span>
        </div>
        <div
          style="
            font-size: 1.6rem;
            font-weight: 800;
            color: #efece3;
            line-height: 1;
          "
        >
          {{ isLoadingCashflow ? "..." : formatRupiah(cashflowNet) }}
        </div>
        <div style="font-size: 0.72rem; color: #6b7280; margin-top: 4px">
          This month
        </div>
        <div class="mini-chart" style="margin-top: 12px; height: 30px">
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 300 100"
            preserveAspectRatio="none"
          >
            <path
              :d="chartPaths.in"
              fill="none"
              stroke="#4ade80"
              stroke-width="8"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              :d="chartPaths.out"
              fill="none"
              stroke="#f87171"
              stroke-width="8"
              stroke-linecap="round"
              stroke-linejoin="round"
              opacity="0.6"
            />
          </svg>
        </div>
      </div>

      <!-- Projects -->
      <div class="stat-card">
        <div
          style="
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 12px;
          "
        >
          <span
            style="
              font-size: 0.72rem;
              color: #6b7280;
              font-family:
                JetBrains Mono,
                monospace;
              text-transform: uppercase;
              letter-spacing: 0.08em;
            "
            >Projects</span
          >
          <span class="badge-blue">Published</span>
        </div>
        <div
          style="
            font-size: 1.6rem;
            font-weight: 800;
            color: #efece3;
            line-height: 1;
          "
        >
          {{ projectStats.published }} / {{ projectStats.total }}
        </div>
        <div style="font-size: 0.72rem; color: #6b7280; margin-top: 4px">
          {{ projectStats.draft }} in draft
        </div>
        <div
          style="
            height: 4px;
            background: #1e1e1e;
            border-radius: 2px;
            margin-top: 14px;
          "
        >
          <div
            style="
              height: 100%;
              background: var(--p-secondary);
              border-radius: 2px;
            "
            :style="{ width: projectStats.percentage + '%' }"
          ></div>
        </div>
      </div>

      <!-- Habits -->
      <div class="stat-card">
        <div
          style="
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 12px;
          "
        >
          <span
            style="
              font-size: 0.72rem;
              color: #6b7280;
              font-family:
                JetBrains Mono,
                monospace;
              text-transform: uppercase;
              letter-spacing: 0.08em;
            "
            >Habits Today</span
          >
          <span class="badge-blue"
            >{{ habitStats.doneToday }}/{{ habitStats.total }}</span
          >
        </div>
        <div
          style="
            font-size: 1.6rem;
            font-weight: 800;
            color: #efece3;
            line-height: 1;
          "
        >
          {{ isLoadingHabits ? "..." : habitStats.completionRate + "%" }}
        </div>
        <div style="font-size: 0.72rem; color: #6b7280; margin-top: 4px">
          completion rate
        </div>
        <div style="display: flex; gap: 4px; margin-top: 12px">
          <div
            v-for="i in habitStats.total"
            :key="i"
            style="flex: 1; height: 6px; border-radius: 2px"
            :style="{
              background: i <= habitStats.doneToday ? '#4ade80' : '#1e1e1e',
              opacity: i <= habitStats.doneToday ? 0.8 : 1,
            }"
          ></div>
        </div>
      </div>

      <!-- Goals -->
      <div class="stat-card">
        <div
          style="
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 12px;
          "
        >
          <span
            style="
              font-size: 0.72rem;
              color: #6b7280;
              font-family:
                JetBrains Mono,
                monospace;
              text-transform: uppercase;
              letter-spacing: 0.08em;
            "
            >Goals Progress</span
          >
          <span class="badge-blue">Q2 2025</span>
        </div>
        <div
          style="
            font-size: 1.6rem;
            font-weight: 800;
            color: #efece3;
            line-height: 1;
          "
        >
          {{ isLoadingGoals ? "..." : goalStats.avgCompletion + "%" }}
        </div>
        <div style="font-size: 0.72rem; color: #6b7280; margin-top: 4px">
          avg. completion
        </div>
        <div
          style="
            height: 4px;
            background: #1e1e1e;
            border-radius: 2px;
            margin-top: 14px;
          "
        >
          <div
            style="
              height: 100%;
              background: linear-gradient(
                90deg,
                var(--p-secondary),
                var(--p-accent)
              );
              border-radius: 2px;
            "
            :style="{ width: goalStats.avgCompletion + '%' }"
          ></div>
        </div>
      </div>
    </div>

    <!-- Middle Row -->
    <div
      style="
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 16px;
        margin-bottom: 24px;
      "
    >
      <!-- Cashflow chart -->
      <div class="card p-5">
        <div
          style="
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 16px;
          "
        >
          <div>
            <div style="font-size: 0.85rem; font-weight: 600">
              Cashflow Overview
            </div>
            <div style="font-size: 0.7rem; color: #6b7280; margin-top: 2px">
              Apr 2025
            </div>
          </div>
          <div style="display: flex; gap: 8px">
            <span
              style="
                display: flex;
                align-items: center;
                gap: 4px;
                font-size: 0.65rem;
                color: #6b7280;
              "
              ><span
                style="
                  width: 8px;
                  height: 8px;
                  border-radius: 2px;
                  background: #4ade80;
                  display: inline-block;
                "
              ></span
              >In</span
            >
            <span
              style="
                display: flex;
                align-items: center;
                gap: 4px;
                font-size: 0.65rem;
                color: #6b7280;
              "
              ><span
                style="
                  width: 8px;
                  height: 8px;
                  border-radius: 2px;
                  background: #f87171;
                  display: inline-block;
                "
              ></span
              >Out</span
            >
          </div>
        </div>
        <div style="position: relative; height: 120px; margin-top: 10px">
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 300 100"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="gradIn" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#4ade80" stop-opacity="0.3" />
                <stop offset="100%" stop-color="#4ade80" stop-opacity="0" />
              </linearGradient>
              <linearGradient id="gradOut" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#f87171" stop-opacity="0.2" />
                <stop offset="100%" stop-color="#f87171" stop-opacity="0" />
              </linearGradient>
            </defs>
            <!-- Area Fills -->
            <path :d="chartPaths.inArea" fill="url(#gradIn)" />
            <path :d="chartPaths.outArea" fill="url(#gradOut)" />

            <!-- Lines -->
            <path
              :d="chartPaths.in"
              fill="none"
              stroke="#4ade80"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              :d="chartPaths.out"
              fill="none"
              stroke="#f87171"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>

          <!-- Labels -->
          <div
            style="
              display: flex;
              justify-content: space-between;
              margin-top: 8px;
            "
          >
            <span
              v-for="l in dailyLabels"
              :key="l"
              style="
                font-size: 0.6rem;
                color: #4b5563;
                font-family:
                  JetBrains Mono,
                  monospace;
              "
            >
              {{ l }}
            </span>
          </div>
        </div>
        <div style="margin-top: 32px; display: flex; gap: 24px">
          <div>
            <div style="font-size: 0.7rem; color: #6b7280">Total In</div>
            <div style="font-size: 0.9rem; font-weight: 700; color: #4ade80">
              {{ formatRupiah(cashflowTotalIn) }}
            </div>
          </div>
          <div>
            <div style="font-size: 0.7rem; color: #6b7280">Total Out</div>
            <div style="font-size: 0.9rem; font-weight: 700; color: #f87171">
              {{ formatRupiah(cashflowTotalOut) }}
            </div>
          </div>
          <div>
            <div style="font-size: 0.7rem; color: #6b7280">Net</div>
            <div
              style="
                font-size: 0.9rem;
                font-weight: 700;
                color: var(--p-accent);
              "
            >
              {{ formatRupiah(cashflowNet) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Emails -->
      <div class="card p-5">
        <div
          style="
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 16px;
          "
        >
          <div style="font-size: 0.85rem; font-weight: 600">
            Email Schedule Today
          </div>
          <a
            href="#"
            style="
              font-size: 0.72rem;
              color: var(--p-secondary);
              text-decoration: none;
            "
            >View all →</a
          >
        </div>
        <div style="display: flex; flex-direction: column; gap: 10px">
          <div v-if="isLoadingEmails" class="loading-wrap" style="padding: 20px; text-align: center; color: #4b5563; font-size: 0.8rem">
            Loading schedule...
          </div>
          <div v-else-if="scheduledEmails.length === 0" class="empty-wrap" style="padding: 20px; text-align: center; color: #4b5563; font-size: 0.8rem">
            No emails scheduled for today.
          </div>
          <div
            v-else
            v-for="(email, idx) in scheduledEmails"
            :key="email.id"
            style="
              display: flex;
              align-items: center;
              gap: 12px;
              padding: 10px;
              background: #161616;
              border-radius: 8px;
              border: 1px solid var(--p-card-border);
            "
          >
            <div
              style="
                width: 36px;
                height: 36px;
                border-radius: 8px;
                background: rgba(74, 112, 169, 0.15);
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
              "
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--p-accent)"
                stroke-width="2"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div style="flex: 1; min-width: 0">
              <div
                style="
                  font-size: 0.8rem;
                  font-weight: 500;
                  white-space: nowrap;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  color: var(--p-light);
                "
              >
                {{ email.subject }}
              </div>
              <div
                style="
                  font-size: 0.68rem;
                  color: #6b7280;
                  font-family:
                    JetBrains Mono,
                    monospace;
                "
              >
                {{ email.time }} · {{ email.to }}
              </div>
            </div>
            <template v-if="email.status === 'sent'">
              <span
                style="
                  font-size: 0.65rem;
                  color: #4ade80;
                  font-family: 'JetBrains Mono', monospace;
                "
                >✓ Sent</span
              >
            </template>
            <template v-else-if="email.status === 'pending'">
              <span class="badge-green">Pending</span>
            </template>
            <template v-else-if="email.status === 'failed'">
              <span class="badge-red">Failed</span>
            </template>
            <template v-else>
              <span class="badge-blue">Queued</span>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions Row -->
    <div
      style="
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;
        margin-bottom: 24px;
      "
    >
      <router-link
        v-for="action in [
          {
            name: 'Add Project',
            sub: 'Portfolio CMS',
            icon: 'M12 12m-10 0a10 10 0 1 0 20 0a10 10 0 1 0 -20 0 M12 8v8 M8 12h8',
            href: ROUTE_PATHS.PROJECT_CMS,
          },
          {
            name: 'New Note',
            sub: 'Markdown editor',
            icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2 14 8 20 8',
            href: ROUTE_PATHS.NOTES,
          },
          {
            name: 'Log Transaction',
            sub: 'Cashflow tracker',
            icon: 'M12 1v22 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
            href: ROUTE_PATHS.CASHFLOW,
          },
          {
            name: 'Ask AI',
            sub: 'GPT-4o assistant',
            icon: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
            href: ROUTE_PATHS.AI_CHAT,
          },
        ]"
        :key="action.name"
        :to="action.href"
        class="quick-action"
        style="text-decoration: none"
      >
        <div class="quick-action-icon">
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--p-accent)"
            stroke-width="2"
          >
            <path :d="action.icon" />
          </svg>
        </div>
        <div>
          <div style="font-size: 0.8rem; font-weight: 500">
            {{ action.name }}
          </div>
          <div style="font-size: 0.65rem; color: #6b7280">{{ action.sub }}</div>
        </div>
      </router-link>
    </div>
  </main>
</template>
