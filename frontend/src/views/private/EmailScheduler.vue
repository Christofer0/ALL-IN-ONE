<script setup lang="ts">
import { ref, computed, onMounted } from "vue";

interface Email {
  id: number;
  to: string;
  subject: string;
  body: string;
  date: string;
  time: string;
  repeat: "none" | "daily" | "weekly" | "monthly";
  status: "pending" | "sent" | "failed";
  sentAt: string | null;
}

interface Template {
  id: number;
  name: string;
  icon: string;
  subject: string;
  body: string;
}

// State
const emails = ref<Email[]>([]);
const templates = ref<Template[]>([]);
const API_BASE = "http://localhost:9992/api/worker";

const fetchData = async () => {
  try {
    const [emailRes, tempRes] = await Promise.all([
      fetch(`${API_BASE}/emails`),
      fetch(`${API_BASE}/templates`),
    ]);
    emails.value = await emailRes.json();
    templates.value = await tempRes.json();
  } catch (err) {
    console.error("Failed to fetch scheduler data:", err);
  }
};

onMounted(fetchData);

// State
const currentTab = ref<"pending" | "history" | "templates">("pending");
const isModalOpen = ref(false);
const isTemplateModalOpen = ref(false);
const showPreview = ref(false);

const form = ref<Partial<Email>>({
  to: "",
  subject: "",
  body: "",
  date: new Date().toISOString().split("T")[0],
  time: "08:00",
  repeat: "none",
});

const templateForm = ref<Partial<Template>>({
  name: "",
  icon: "📄",
  subject: "",
  body: "",
});

// Computed
const stats = computed(() => {
  const todayStr = new Date().toISOString().split("T")[0];
  return {
    pending: emails.value.filter((e) => e.status === "pending").length,
    sentToday: emails.value.filter(
      (e) => e.status === "sent" && e.sentAt?.startsWith(todayStr),
    ).length,
    thisWeek: emails.value.filter((e) => e.date >= todayStr).length, // Simplified
    templates: templates.value.length,
  };
});

const pendingSorted = computed(() => {
  return [...emails.value]
    .filter((e) => e.status === "pending")
    .sort(
      (a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time),
    );
});

const historySorted = computed(() => {
  return [...emails.value]
    .filter((e) => e.status === "sent" || e.status === "failed")
    .sort((a, b) => (b.sentAt || "").localeCompare(a.sentAt || ""));
});

// Methods
const openModal = () => {
  isModalOpen.value = true;
  showPreview.value = false;
};

const closeModal = () => {
  isModalOpen.value = false;
  form.value = {
    to: "",
    subject: "",
    body: "",
    date: new Date().toISOString().split("T")[0],
    time: "08:00",
    repeat: "none",
  };
};

const closeTemplateModal = () => {
  isTemplateModalOpen.value = false;
  templateForm.value = {
    name: "",
    icon: "📄",
    subject: "",
    body: "",
  };
};

const saveEmail = async () => {
  try {
    const isEdit = !!form.value.id;
    const url = isEdit
      ? `${API_BASE}/emails/${form.value.id}`
      : `${API_BASE}/emails`;
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form.value),
    });
    if (res.ok) {
      await fetchData();
      closeModal();
      currentTab.value = "pending";
    } else {
      const errData = await res.json();
      alert("Error: " + (errData.error || "Failed to save"));
    }
  } catch (err) {
    console.error("Failed to save email:", err);
    alert("Connection error: " + err);
  }
};

const editEmail = (e: Email) => {
  form.value = { ...e };
  isModalOpen.value = true;
};

const cancelEmail = async (id: number) => {
  if (confirm("Cancel this scheduled email?")) {
    try {
      const res = await fetch(`${API_BASE}/emails/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (err) {
      console.error("Failed to cancel email:", err);
    }
  }
};

const editTemplate = (t: Template) => {
  templateForm.value = { ...t };
  isTemplateModalOpen.value = true;
};

const deleteTemplate = async (id: number) => {
  if (confirm("Are you sure you want to delete this template?")) {
    try {
      const res = await fetch(`${API_BASE}/templates/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (err) {
      console.error("Failed to delete template:", err);
    }
  }
};

const saveTemplate = async () => {
  try {
    const isEdit = !!templateForm.value.id;
    const url = isEdit
      ? `${API_BASE}/templates/${templateForm.value.id}`
      : `${API_BASE}/templates`;
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(templateForm.value),
    });
    if (res.ok) {
      await fetchData();
      closeTemplateModal();
    }
  } catch (err) {
    console.error("Failed to save template:", err);
  }
};

const useTemplate = (t: Template) => {
  if (!isModalOpen.value) openModal();

  const dStr = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const replacePlaceholders = (text: string) => {
    return text
      .replace(/{{date}}/g, dStr)
      .replace(/{{name}}/g, "[Name]")
      .replace(/{{topic}}/g, "[Topic]")
      .replace(/{{invoice}}/g, "#XXX");
  };

  form.value.subject = replacePlaceholders(t.subject);
  form.value.body = replacePlaceholders(t.body);
};

const togglePreview = () => {
  showPreview.value = !showPreview.value;
};

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return "-";
  try {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch (err) {
    return dateStr;
  }
};
</script>

<template>
  <main class="page-content">
    <!-- Header -->
    <div
      style="
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 24px;
      "
    >
      <div>
        <div style="font-size: 1.1rem; font-weight: 700; color: var(--p-light)">
          Email Scheduler
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
          /dashboard/schedule · Schedule & manage emails
        </div>
      </div>
      <div style="display: flex; gap: 10px">
        <button class="btn-ghost" @click="currentTab = 'templates'">
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
            />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          Templates
        </button>
        <button
          v-if="currentTab === 'templates'"
          class="btn-primary"
          @click="isTemplateModalOpen = true"
        >
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
          New Template
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
          New Email
        </button>
      </div>
    </div>

    <!-- Stats -->
    <div
      style="
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 16px;
        margin-bottom: 24px;
      "
    >
      <div class="card p-4">
        <div class="stat-label" style="color: var(--p-accent)">Pending</div>
        <div class="stat-value" style="color: var(--p-accent)">{{ stats.pending }}</div>
      </div>
      <div class="card p-4">
        <div class="stat-label" style="color: #4ade80">Sent Today</div>
        <div class="stat-value" style="color: #4ade80">
          {{ stats.sentToday }}
        </div>
      </div>
      <div class="card p-4">
        <div class="stat-label" style="color: #8fabd4">This Week</div>
        <div class="stat-value">{{ stats.thisWeek }}</div>
      </div>
      <div class="card p-4">
        <div class="stat-label">Templates</div>
        <div class="stat-value">{{ stats.templates }}</div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="tab-group" style="margin-bottom: 24px">
      <button
        v-for="tab in ['pending', 'history', 'templates']"
        :key="tab"
        class="tab-btn"
        :class="{ active: currentTab === tab }"
        @click="currentTab = tab as any"
      >
        {{ tab.charAt(0).toUpperCase() + tab.slice(1) }}
      </button>
    </div>

    <!-- Views -->
    <div
      v-if="currentTab === 'pending'"
      style="display: flex; flex-direction: column; gap: 12px"
    >
      <div v-for="e in pendingSorted" :key="e.id" class="email-card p-4">
        <div style="display: flex; align-items: flex-start; gap: 16px">
          <div class="email-icon">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
              />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          </div>
          <div style="flex: 1; min-width: 0">
            <div
              style="
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 4px;
              "
            >
              <div
                style="
                  font-weight: 600;
                  font-size: 0.9rem;
                  color: var(--p-light);
                  overflow: hidden;
                  text-overflow: ellipsis;
                  white-space: nowrap;
                  flex: 1;
                "
              >
                {{ e.subject }}
              </div>
              <span v-if="e.repeat !== 'none'" class="badge-blue"
                >🔁 {{ e.repeat }}</span
              >
            </div>
            <div style="font-size: 0.75rem; color: #6b7280; margin-bottom: 8px">
              To: {{ e.to }}
            </div>
            <div
              style="
                font-size: 0.78rem;
                color: var(--text-muted);
                margin-bottom: 12px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              "
            >
              {{ e.body }}
            </div>
            <div style="display: flex; align-items: center; gap: 12px">
              <div
                style="
                  display: flex;
                  align-items: center;
                  gap: 6px;
                  font-family:
                    JetBrains Mono,
                    monospace;
                  font-size: 0.72rem;
                  color: #8fabd4;
                "
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                {{ formatDate(e.date + 'T' + e.time) }}
              </div>
              <span class="badge-amber">Scheduled</span>
              <div style="margin-left: auto; display: flex; gap: 8px">
                <button
                  @click="editEmail(e)"
                  class="btn-icon"
                  title="Edit"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
                <button
                  @click="cancelEmail(e.id)"
                  class="btn-icon-danger"
                  title="Cancel"
                >
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
            </div>
          </div>
        </div>
      </div>
      <div
        v-if="pendingSorted.length === 0"
        class="card"
        style="
          padding: 48px;
          text-align: center;
          color: #374151;
          font-family:
            JetBrains Mono,
            monospace;
          font-size: 0.8rem;
        "
      >
        No pending emails scheduled.<br />
        <button class="btn-primary" style="margin-top: 16px" @click="openModal">
          Schedule your first email
        </button>
      </div>
    </div>

    <div v-if="currentTab === 'history'" class="card overflow-hidden">
      <div
        style="
          overflow-x: auto;
          width: 100%;
          -webkit-overflow-scrolling: touch;
        "
      >
        <table style="width: 100%; border-collapse: collapse">
          <thead>
            <tr>
              <th class="th-mono">Date Sent</th>
              <th class="th-mono">Subject</th>
              <th class="th-mono">Recipients</th>
              <th class="th-mono">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="e in historySorted" :key="e.id" class="table-row">
              <td class="td-mono">{{ formatDate(e.sentAt) }}</td>
              <td>{{ e.subject }}</td>
              <td style="color: #6b7280; font-size: 0.78rem">{{ e.to }}</td>
              <td>
                <span class="badge-green">Sent</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div
      v-if="currentTab === 'templates'"
      style="
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 16px;
      "
    >
      <div
        v-for="t in templates"
        :key="t.id"
        class="template-card p-4"
        @click="useTemplate(t)"
      >
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px">
          <div style="font-size: 1.5rem">{{ t.icon }}</div>
          <div style="display: flex; gap: 4px">
            <button class="btn-icon" @click.stop="editTemplate(t)" title="Edit Template">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
            <button class="btn-icon-danger" @click.stop="deleteTemplate(t.id)" title="Delete Template">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              </svg>
            </button>
          </div>
        </div>
        <div
          style="font-weight: 600; color: var(--p-light); margin-bottom: 4px"
        >
          {{ t.name }}
        </div>
        <div
          style="
            font-size: 0.72rem;
            color: #6b7280;
            font-family:
              JetBrains Mono,
              monospace;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          "
        >
          {{ t.subject }}
        </div>
        <button
          class="btn-ghost"
          style="margin-top: 16px; width: 100%; justify-content: center"
        >
          Use Template
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
          <div class="modal" style="max-width: 640px">
            <div
              style="
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 24px;
              "
            >
              <div>
                <div
                  style="
                    font-size: 1rem;
                    font-weight: 700;
                    color: var(--p-light);
                  "
                >
                  {{ form.id ? "Edit Scheduled Email" : "Compose New Email" }}
                </div>
                <div
                  style="font-size: 0.72rem; color: #6b7280; margin-top: 2px"
                >
                  {{ form.id ? "Update the details of your scheduled email" : "Schedule an email to be sent automatically" }}
                </div>
              </div>
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
            </div>

            <!-- Template selection in modal -->
            <div style="margin-bottom: 20px">
              <label class="form-label">Quick Templates</label>
              <div style="display: flex; gap: 8px; flex-wrap: wrap">
                <button
                  v-for="t in templates"
                  :key="t.id"
                  class="btn-tag"
                  @click="useTemplate(t)"
                >
                  {{ t.icon }} {{ t.name }}
                </button>
              </div>
            </div>

            <form
              @submit.prevent="saveEmail"
              style="display: flex; flex-direction: column; gap: 16px"
            >
              <div>
                <label class="form-label">To (recipients) *</label>
                <input
                  type="text"
                  v-model="form.to"
                  class="form-input"
                  placeholder="email@example.com"
                  required
                />
              </div>
              <div>
                <label class="form-label">Subject *</label>
                <input
                  type="text"
                  v-model="form.subject"
                  class="form-input"
                  placeholder="Enter subject..."
                  required
                />
              </div>
              <div
                style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px"
              >
                <div>
                  <label class="form-label">Schedule Date *</label>
                  <input
                    type="date"
                    v-model="form.date"
                    class="form-input"
                    required
                  />
                </div>
                <div>
                  <label class="form-label">Schedule Time *</label>
                  <input
                    type="time"
                    v-model="form.time"
                    class="form-input"
                    required
                  />
                </div>
              </div>
              <div>
                <label class="form-label">Repeat</label>
                <select v-model="form.repeat" class="form-input">
                  <option value="none">No repeat (once)</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div>
                <label class="form-label">Body *</label>
                <textarea
                  v-model="form.body"
                  class="form-input"
                  rows="6"
                  style="resize: vertical"
                  required
                ></textarea>
              </div>

              <!-- Live Preview -->
              <div v-if="showPreview" class="preview-panel">
                <div class="preview-header">
                  <div class="preview-dots">
                    <span
                      class="preview-dot"
                      style="background: #ff5f57"
                    ></span>
                    <span
                      class="preview-dot"
                      style="background: #febc2e"
                    ></span>
                    <span
                      class="preview-dot"
                      style="background: #28c840"
                    ></span>
                  </div>
                  <span class="preview-title">{{
                    form.subject || "Preview"
                  }}</span>
                </div>
                <div class="preview-content">
                  <div
                    style="
                      font-size: 0.72rem;
                      color: #6b7280;
                      margin-bottom: 6px;
                    "
                  >
                    To: <span style="color: #8fabd4">{{ form.to || "—" }}</span>
                  </div>
                  <div
                    style="
                      font-size: 0.85rem;
                      font-weight: 600;
                      color: var(--p-light);
                      margin-bottom: 12px;
                    "
                  >
                    {{ form.subject || "(No subject)" }}
                  </div>
                  <div
                    style="
                      font-size: 0.82rem;
                      color: #aaaaaa;
                      line-height: 1.7;
                      white-space: pre-line;
                    "
                  >
                    {{ form.body || "(Empty body)" }}
                  </div>
                </div>
              </div>

              <div style="display: flex; gap: 12px; margin-top: 8px">
                <button
                  type="button"
                  class="btn-ghost"
                  style="flex: 1"
                  @click="togglePreview"
                >
                  {{ showPreview ? "👁 Hide Preview" : "👁 Show Preview" }}
                </button>
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
                    stroke-width="2.5"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  Schedule
                </button>
              </div>
            </form>
          </div>
        </Transition>
      </div>
    </Transition>

    <!-- Template Modal -->
    <Transition name="fade">
      <div
        v-if="isTemplateModalOpen"
        class="modal-overlay open"
        @click.self="closeTemplateModal"
      >
        <Transition name="slide-up">
          <div class="modal" style="max-width: 540px">
            <div
              style="
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 24px;
              "
            >
              <div>
                <div
                  style="
                    font-size: 1rem;
                    font-weight: 700;
                    color: var(--p-light);
                  "
                >
                  {{ templateForm.id ? "Edit Template" : "Create New Template" }}
                </div>
                <div
                  style="font-size: 0.72rem; color: #6b7280; margin-top: 2px"
                >
                  {{ templateForm.id ? "Update your template details" : "Define a reusable template for quick scheduling" }}
                </div>
              </div>
              <button @click="closeTemplateModal" class="close-btn">
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
            </div>

            <form
              @submit.prevent="saveTemplate"
              style="display: flex; flex-direction: column; gap: 16px"
            >
              <div
                style="
                  display: grid;
                  grid-template-columns: 80px 1fr;
                  gap: 12px;
                "
              >
                <div>
                  <label class="form-label">Icon</label>
                  <input
                    type="text"
                    v-model="templateForm.icon"
                    class="form-input"
                    placeholder="📄"
                    required
                  />
                </div>
                <div>
                  <label class="form-label">Template Name *</label>
                  <input
                    type="text"
                    v-model="templateForm.name"
                    class="form-input"
                    placeholder="e.g. Weekly Report"
                    required
                  />
                </div>
              </div>
              <div>
                <label class="form-label">Default Subject *</label>
                <input
                  type="text"
                  v-model="templateForm.subject"
                  class="form-input"
                  placeholder="e.g. Report for {{date}}"
                  required
                />
              </div>
              <div>
                <label class="form-label">Default Body *</label>
                <textarea
                  v-model="templateForm.body"
                  class="form-input"
                  rows="8"
                  style="resize: vertical"
                  required
                ></textarea>
                <div
                  v-pre
                  style="
                    font-size: 0.65rem;
                    color: #6b7280;
                    margin-top: 8px;
                    font-family:
                      JetBrains Mono,
                      monospace;
                  "
                >
                  Placeholders: {{ date }}, {{ name }}, {{ topic }},
                  {{ invoice }}
                </div>
              </div>

              <div
                style="
                  display: flex;
                  gap: 12px;
                  margin-top: 8px;
                  justify-content: flex-end;
                "
              >
                <button
                  type="button"
                  class="btn-ghost"
                  @click="closeTemplateModal"
                >
                  Cancel
                </button>
                <button type="submit" class="btn-primary">Save Template</button>
              </div>
            </form>
          </div>
        </Transition>
      </div>
    </Transition>
  </main>
</template>

<style scoped>
.stat-label {
  font-size: 0.65rem;
  color: #6b7280;
  font-family: "JetBrains Mono", monospace;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 8px;
}
.stat-value {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--p-light);
}

.tab-group {
  display: flex;
  gap: 4px;
  background: var(--p-primary);
  border: 1px solid var(--p-card-border);
  padding: 4px;
  border-radius: 10px;
  width: fit-content;
}
.tab-btn {
  padding: 8px 16px;
  font-size: 0.82rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  background: transparent;
  border: none;
  color: #6b7280;
}
.tab-btn.active {
  background: var(--p-surface);
  color: var(--p-light);
  border: 1px solid var(--p-card-border);
}

.email-card {
  transition: all 0.2s;
  cursor: pointer;
  background: var(--p-surface);
}
.email-card:hover {
  border-color: rgba(74, 112, 169, 0.3);
  background: var(--p-primary);
}

.email-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(74, 112, 169, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8fabd4;
  flex-shrink: 0;
}

.table-row {
  transition: background 0.2s;
}
.table-row:hover {
  background: rgba(255, 255, 255, 0.02);
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
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
}

.template-card {
  transition: all 0.2s;
  border: 1px solid var(--p-card-border);
  cursor: pointer;
}
.template-card:hover {
  border-color: #4a70a9;
  background: rgba(74, 112, 169, 0.04);
}

.close-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  color: #6b7280;
  padding: 6px;
}
.btn-tag {
  background: var(--p-primary);
  border: 1px solid var(--p-card-border);
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 0.7rem;
  font-family: "JetBrains Mono", monospace;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-tag:hover {
  border-color: #8fabd4;
  color: #8fabd4;
}

.preview-panel {
  background: var(--p-primary);
  border: 1px solid var(--p-card-border);
  border-radius: 12px;
  overflow: hidden;
  margin-top: 8px;
}
.preview-header {
  background: var(--p-surface);
  padding: 10px 16px;
  border-bottom: 1px solid var(--p-card-border);
  display: flex;
  align-items: center;
  gap: 12px;
}
.preview-dots {
  display: flex;
  gap: 6px;
}
.preview-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  opacity: 0.8;
}
.preview-title {
  font-size: 0.68rem;
  color: #374151;
  font-family: "JetBrains Mono", monospace;
  flex: 1;
  text-align: center;
}
.preview-content {
  padding: 16px;
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
