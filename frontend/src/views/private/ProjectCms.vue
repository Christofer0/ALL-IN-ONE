<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import api from "@/utils/api";
import type { Project } from "@/types";

const projects = ref<Project[]>([]);
const isLoading = ref(true);
const isSaving = ref(false);

const fetchProjects = async () => {
  isLoading.value = true;
  try {
    const response = await api.get("/admin/projects");
    projects.value = response.data;
  } catch (error) {
    console.error("Failed to fetch projects:", error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchProjects);

// Filtering States
const searchQuery = ref("");
const statusFilter = ref("");
const categoryFilter = ref("");

// Computed
const filteredProjects = computed(() => {
  return projects.value.filter((p) => {
    const q = searchQuery.value.toLowerCase();
    const matchSearch =
      !q || [p.title, p.description].some((f) => f.toLowerCase().includes(q));
    const matchStatus =
      !statusFilter.value ||
      (statusFilter.value === "published" ? p.isPublished : !p.isPublished);
    const matchCategory =
      !categoryFilter.value || p.category === categoryFilter.value;
    return matchSearch && matchStatus && matchCategory;
  });
});

const stats = computed(() => ({
  total: projects.value.length,
  published: projects.value.filter((p) => p.isPublished).length,
  draft: projects.value.filter((p) => !p.isPublished).length,
  featured: projects.value.filter((p) => p.isFeatured).length,
}));

// Modal Logic
const isModalOpen = ref(false);
const isDeleteModalOpen = ref(false);
const modalMode = ref<"add" | "edit">("add");
const editingId = ref<string | null>(null);
const deleteTargetId = ref<string | null>(null);

const initialFormState = (): any => ({
  title: "",
  slug: "",
  category: "",
  description: "",
  content: "",
  techStack: "",
  coverImage: "",
  demoUrl: "",
  githubUrl: "",
  isPublished: false,
  isFeatured: false,
  overview: "",
  problem: "",
  solution: "",
  results: "",
  duration: "",
  impact: "",
  teamSize: "",
});

const form = ref<any>(initialFormState());

const openModal = (mode: "add" | "edit", id: string | null = null) => {
  modalMode.value = mode;
  if (mode === "edit" && id) {
    editingId.value = id;
    const p = projects.value.find((x) => x.id === id);
    if (p) {
      form.value = {
        ...p,
        techStack: p.techStack ? p.techStack.join(", ") : "",
      };
    }
  } else {
    editingId.value = null;
    form.value = initialFormState();
  }
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
};

const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w-]+/g, "") // Remove all non-word chars
    .replace(/--+/g, "-"); // Replace multiple - with single -
};

const saveProject = async () => {
  // Validate title
  if (!form.value.title) {
    alert("Project title is required!");
    return;
  }

  isSaving.value = true;

  try {
    // Auto-generate slug if empty
    if (!form.value.slug) {
      form.value.slug = slugify(form.value.title);
    }

    // Sanitize payload: remove auto-generated fields that might conflict with DB insert/update
    const { id, createdAt, updatedAt, ...formClean } = form.value;

    const payload = {
      ...formClean,
      techStack:
        typeof form.value.techStack === "string"
          ? form.value.techStack
              .split(",")
              .map((s: string) => s.trim())
              .filter((s: string) => s)
          : form.value.techStack,
    };

    if (modalMode.value === "edit" && editingId.value) {
      await api.put(`/admin/projects/${editingId.value}`, payload);
    } else {
      await api.post("/admin/projects", payload);
    }
    await fetchProjects();
    closeModal();
  } catch (error: any) {
    console.error("Failed to save project:", error);
    const backendMessage = error.response?.data?.error;
    alert(
      backendMessage
        ? `Error: ${backendMessage}`
        : "Error saving project. Check console for details.",
    );
  } finally {
    isSaving.value = false;
  }
};

const openDeleteModal = (id: string) => {
  deleteTargetId.value = id;
  isDeleteModalOpen.value = true;
};

const confirmDelete = async () => {
  if (deleteTargetId.value) {
    try {
      await api.delete(`/admin/projects/${deleteTargetId.value}`);
      await fetchProjects();
      isDeleteModalOpen.value = false;
    } catch (error) {
      console.error("Failed to delete project:", error);
      alert("Error deleting project.");
    }
  }
};

const handleFileUpload = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    form.value.coverImage = ev.target?.result as string;
  };
  reader.readAsDataURL(file);
};

const exportCSV = () => {
  const headers = [
    "ID",
    "Title",
    "Category",
    "Description",
    "Tech Stack",
    "Status",
    "Date",
  ];
  const rows = projects.value.map((p) => [
    p.id,
    p.title,
    p.category,
    p.description,
    p.techStack.join(" | "),
    p.isPublished ? "published" : "draft",
    p.createdAt,
  ]);
  const csv = [headers, ...rows]
    .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "projects.csv";
  link.click();
};

const toggleStatus = async (
  project: Project,
  field: "isPublished" | "isFeatured",
) => {
  try {
    // Sanitize payload: remove auto-generated fields
    const { id, createdAt, updatedAt, cover_image, ...formClean } = project;

    const payload = {
      ...formClean,
    };

    await api.put(`/admin/projects/${project.id}`, payload);
  } catch (error) {
    console.error(`Failed to update project ${field}:`, error);
    // Revert state on failure
    project[field] = !project[field];
    alert(`Failed to update status. Please try again.`);
  }
};
</script>

<template>
  <main class="page-content">
    <!-- Header -->
    <header class="cms-header">
      <div class="header-main">
        <h1 class="page-title">Projects CMS</h1>
        <p class="breadcrumb">/dashboard/projects · Manage your portfolio</p>
      </div>
      <button class="btn-primary" @click="openModal('add')">
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
        Add Project
      </button>
    </header>

    <!-- Stats -->
    <section class="stats-grid">
      <div v-for="(val, label) in stats" :key="label" class="card stat-card">
        <span class="stat-label">{{ label }}</span>
        <span class="stat-value" :class="`value-${label}`">{{ val }}</span>
      </div>
    </section>

    <!-- Table Section -->
    <section class="card table-container">
      <div class="toolbar">
        <div class="search-wrap">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            v-model="searchQuery"
            class="search-input"
            placeholder="Search projects..."
          />
        </div>
        <select v-model="statusFilter" class="form-input filter-select">
          <option value="">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
        <select v-model="categoryFilter" class="form-input filter-select">
          <option value="">All Categories</option>
          <option value="AI / ML">AI / ML</option>
          <option value="Fullstack">Fullstack</option>
          <option value="SaaS">SaaS</option>
          <option value="Tool">Developer Tool</option>
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
          Export
        </button>
      </div>

      <div class="scroll-wrapper">
        <table class="project-table">
          <thead>
            <tr>
              <th style="width: 40px"></th>
              <th>Project</th>
              <th>Category</th>
              <th>Tech Stack</th>
              <th>Featured</th>
              <th>Published</th>
              <th>Date</th>
              <th style="text-align: right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in filteredProjects" :key="p.id" class="project-row">
              <td>
                <div class="project-thumb">
                  <img v-if="p.coverImage" :src="p.coverImage" />
                  <svg
                    v-else
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#374151"
                    stroke-width="2"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                </div>
              </td>
              <td>
                <div class="cell-title">{{ p.title }}</div>
                <div class="cell-sub">{{ p.description }}</div>
              </td>
              <td>
                <span class="badge-blue">{{ p.category }}</span>
              </td>
              <td>
                <div class="tech-tags">
                  <span
                    v-for="t in p.techStack.slice(0, 3)"
                    :key="t"
                    class="tech-tag"
                    >{{ t }}</span
                  >
                  <span v-if="p.techStack.length > 3" class="tech-more"
                    >+{{ p.techStack.length - 3 }}</span
                  >
                </div>
              </td>
              <td>
                <label class="toggle">
                  <input
                    type="checkbox"
                    v-model="p.isFeatured"
                    @change="toggleStatus(p, 'isFeatured')"
                  />
                  <span class="toggle-slider"></span>
                </label>
              </td>
              <td>
                <label class="toggle">
                  <input
                    type="checkbox"
                    v-model="p.isPublished"
                    @change="toggleStatus(p, 'isPublished')"
                  />
                  <span class="toggle-slider"></span>
                </label>
              </td>
              <td>
                <span class="mono-date">{{
                  new Date(p.createdAt).toLocaleDateString()
                }}</span>
              </td>
              <td class="action-cell">
                <a
                  v-if="p.demoUrl"
                  :href="p.demoUrl"
                  target="_blank"
                  class="icon-btn"
                  title="Live Demo"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"
                    />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
                <button
                  @click="openModal('edit', p.id)"
                  class="icon-btn"
                  title="Edit"
                >
                  <svg
                    width="14"
                    height="14"
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
                  @click="openDeleteModal(p.id)"
                  class="icon-btn danger"
                  title="Delete"
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
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Modals -->
    <Transition name="fade">
      <div
        v-if="isModalOpen"
        class="modal-overlay open"
        @click.self="closeModal"
      >
        <Transition name="slide-up">
          <div class="modal">
            <header class="modal-header">
              <div>
                <h2 class="modal-title">
                  {{ modalMode === "add" ? "Add New Project" : "Edit Project" }}
                </h2>
                <p class="modal-sub">
                  {{
                    modalMode === "add"
                      ? "Fill in the project details"
                      : `Editing: ${form.title}`
                  }}
                </p>
              </div>
              <button @click="closeModal" class="modal-close">
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

            <form @submit.prevent="saveProject" class="modal-form">
              <div class="upload-section">
                <label class="form-label">Cover Image</label>
                <div
                  class="upload-zone"
                  @click="($refs.fileInput as any).click()"
                >
                  <div v-if="!form.coverImage" class="upload-placeholder">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#374151"
                      stroke-width="1.5"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <span>Click to upload cover image</span>
                  </div>
                  <div v-else class="upload-preview">
                    <img :src="form.coverImage" />
                    <span class="upload-change">Change image</span>
                  </div>
                  <input
                    type="file"
                    ref="fileInput"
                    @change="handleFileUpload"
                    accept="image/*"
                    style="display: none"
                  />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Project Name *</label>
                  <input
                    type="text"
                    v-model="form.title"
                    class="form-input"
                    placeholder="e.g. AutoFlow AI"
                    required
                  />
                </div>
                <div class="form-group">
                  <label class="form-label">Category *</label>
                  <select v-model="form.category" class="form-input" required>
                    <option value="">Select...</option>
                    <option value="AI / ML">AI / ML</option>
                    <option value="Fullstack">Fullstack</option>
                    <option value="SaaS">SaaS</option>
                    <option value="Tool">Developer Tool</option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Description *</label>
                <textarea
                  v-model="form.description"
                  class="form-input"
                  rows="3"
                  placeholder="Brief description..."
                  required
                ></textarea>
              </div>

              <div class="form-group">
                <label class="form-label">Tech Stack (comma separated)</label>
                <input
                  type="text"
                  v-model="form.techStack"
                  class="form-input"
                  placeholder="Next.js, OpenAI, PostgreSQL"
                />
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Demo URL</label>
                  <input
                    type="url"
                    v-model="form.demoUrl"
                    class="form-input"
                    placeholder="https://..."
                  />
                </div>
                <div class="form-group">
                  <label class="form-label">GitHub URL</label>
                  <input
                    type="url"
                    v-model="form.githubUrl"
                    class="form-input"
                    placeholder="https://github.com/..."
                  />
                </div>
              </div>

              <!-- Quick Stats -->
              <div class="form-section-title">Quick Stats (Optional)</div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Duration</label>
                  <input
                    type="text"
                    v-model="form.duration"
                    class="form-input"
                    placeholder="e.g. 3 Months"
                  />
                </div>
                <div class="form-group">
                  <label class="form-label">Impact</label>
                  <input
                    type="text"
                    v-model="form.impact"
                    class="form-input"
                    placeholder="e.g. 40% faster"
                  />
                </div>
                <div class="form-group">
                  <label class="form-label">Team Size</label>
                  <input
                    type="text"
                    v-model="form.teamSize"
                    class="form-input"
                    placeholder="e.g. 5 People"
                  />
                </div>
              </div>

              <!-- Structured Content -->
              <div class="form-section-title">Project Details (Optional)</div>
              <div class="form-group">
                <label class="form-label">Project Overview</label>
                <textarea
                  v-model="form.overview"
                  class="form-input"
                  rows="3"
                  placeholder="Detailed overview..."
                ></textarea>
              </div>
              <div class="form-group">
                <label class="form-label">The Problem</label>
                <textarea
                  v-model="form.problem"
                  class="form-input"
                  rows="3"
                  placeholder="What was the challenge?"
                ></textarea>
              </div>
              <div class="form-group">
                <label class="form-label">The Solution</label>
                <textarea
                  v-model="form.solution"
                  class="form-input"
                  rows="3"
                  placeholder="How did you solve it?"
                ></textarea>
              </div>
              <div class="form-group">
                <label class="form-label">Results & Impact</label>
                <textarea
                  v-model="form.results"
                  class="form-input"
                  rows="3"
                  placeholder="What were the final outcomes?"
                ></textarea>
              </div>

              <div class="form-section-title">Legacy Content</div>
              <div class="form-group">
                <label class="form-label">Full Content (HTML/Markdown)</label>
                <textarea
                  v-model="form.content"
                  class="form-input"
                  rows="10"
                  placeholder="Legacy combined content field..."
                ></textarea>
              </div>

              <div class="form-row">
                <div class="toggle-card">
                  <div class="toggle-info">
                    <span class="toggle-title">Published</span>
                    <span class="toggle-desc">Public portfolio</span>
                  </div>
                  <label class="toggle">
                    <input type="checkbox" v-model="form.isPublished" />
                    <span class="toggle-slider"></span>
                  </label>
                </div>
                <div class="toggle-card">
                  <div class="toggle-info">
                    <span class="toggle-title">Featured</span>
                    <span class="toggle-desc">Hero section</span>
                  </div>
                  <label class="toggle">
                    <input type="checkbox" v-model="form.isFeatured" />
                    <span class="toggle-slider"></span>
                  </label>
                </div>
              </div>

              <footer class="modal-footer">
                <button type="button" class="btn-ghost" @click="closeModal">
                  Cancel
                </button>
                <button type="submit" class="btn-primary" :disabled="isSaving">
                  <div v-if="isSaving" class="btn-loader"></div>
                  <svg
                    v-else
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {{
                    isSaving
                      ? "Saving..."
                      : modalMode === "add"
                        ? "Save Project"
                        : "Save Changes"
                  }}
                </button>
              </footer>
            </form>
          </div>
        </Transition>
      </div>
    </Transition>

    <!-- Delete Modal -->
    <Transition name="fade">
      <div
        v-if="isDeleteModalOpen"
        class="modal-overlay open"
        @click.self="isDeleteModalOpen = false"
      >
        <Transition name="slide-up">
          <div class="modal delete-modal">
            <div class="delete-icon-wrap">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#f87171"
                stroke-width="2"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6M14 11v6" />
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              </svg>
            </div>
            <h3 class="delete-title">Delete Project?</h3>
            <p class="delete-desc">
              This action cannot be undone and will permanently remove the
              project from your registry.
            </p>
            <div class="delete-actions">
              <button class="btn-ghost" @click="isDeleteModalOpen = false">
                Cancel
              </button>
              <button class="btn-danger" @click="confirmDelete">Delete</button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </main>
</template>

<style scoped>
.cms-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.page-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--p-light);
}
.breadcrumb {
  font-size: 0.72rem;
  color: #6b7280;
  font-family: "JetBrains Mono", monospace;
  margin-top: 4px;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.stat-label {
  font-size: 0.65rem;
  color: #6b7280;
  font-family: "JetBrains Mono", monospace;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.stat-value {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--p-light);
}
.value-published {
  color: #4ade80;
}
.value-draft {
  color: #fbbf24;
}
.value-featured {
  color: #8fabd4;
}

/* Toolbar */
.toolbar {
  padding: 16px 20px;
  border-bottom: 1px solid var(--p-card-border);
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.filter-select {
  width: auto;
  padding-top: 8px;
  padding-bottom: 8px;
}

/* Table */
.scroll-wrapper {
  overflow-x: auto;
}
.project-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
}
.project-row {
  transition: background 0.15s;
}
.project-row:hover {
  background: rgba(255, 255, 255, 0.02);
}

.project-thumb {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: #111;
  border: 1px solid var(--p-card-border);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.project-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cell-title {
  font-weight: 600;
  font-size: 0.85rem;
  color: var(--p-light);
}
.cell-sub {
  font-size: 0.7rem;
  color: #6b7280;
  margin-top: 2px;
  max-width: 250px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tech-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  max-width: 200px;
}
.tech-tag {
  font-family: "JetBrains Mono", monospace;
  font-size: 0.6rem;
  padding: 2px 7px;
  background: #111;
  border: 1px solid var(--p-card-border);
  border-radius: 3px;
  color: #6b7280;
}
.tech-more {
  font-size: 0.6rem;
  color: #374151;
  font-family: "JetBrains Mono", monospace;
}

.mono-date {
  font-family: "JetBrains Mono", monospace;
  font-size: 0.68rem;
  color: #6b7280;
}

.action-cell {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

/* Icons & Buttons */
.icon-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  color: #374151;
  padding: 6px;
  border-radius: 6px;
  transition: all 0.15s;
  display: flex;
}
.icon-btn:hover {
  background: #1e1e1e;
  color: var(--p-light);
}
.icon-btn.danger:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #f87171;
}

.btn-danger {
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 9px 18px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
}
.btn-danger:hover {
  background: #dc2626;
}

/* Modal specific */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}
.modal-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--p-light);
}
.modal-sub {
  font-size: 0.72rem;
  color: #6b7280;
  margin-top: 2px;
}
.modal-close {
  background: transparent;
  border: none;
  cursor: pointer;
  color: #6b7280;
  padding: 6px;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.upload-section {
  margin-bottom: 4px;
}
.upload-zone {
  border: 2px dashed var(--p-card-border);
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}
.upload-zone:hover {
  border-color: var(--p-secondary);
  background: rgba(74, 112, 169, 0.03);
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
  color: #6b7280;
}
.upload-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.upload-preview img {
  height: 100px;
  border-radius: 8px;
  object-fit: cover;
}
.upload-change {
  font-size: 0.72rem;
  color: var(--p-secondary);
}

.toggle-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px;
  background: #080808;
  border-radius: 8px;
  border: 1px solid var(--p-card-border);
}
.toggle-title {
  display: block;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--p-light);
}
.toggle-desc {
  display: block;
  font-size: 0.72rem;
  color: #6b7280;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 8px;
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

/* Delete Modal */
.delete-modal {
  max-width: 380px;
  text-align: center;
  padding: 32px;
}
.delete-icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}
.delete-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--p-light);
  margin-bottom: 8px;
}
.delete-desc {
  font-size: 0.85rem;
  color: #6b7280;
  margin-bottom: 24px;
  line-height: 1.5;
}
.delete-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}
.form-section-title {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--p-accent);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--p-card-border);
  margin: 24px 0 16px 0;
}
</style>
