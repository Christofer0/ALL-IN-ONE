<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import api from "@/utils/api";
import { ROUTE_PATHS } from "@/router/constants";
import type { Blog } from "@/types";

const blogs = ref<Blog[]>([]);
const isLoading = ref(true);
const isSaving = ref(false);

const fetchBlogs = async () => {
  isLoading.value = true;
  try {
    const response = await api.get("/admin/blogs");
    blogs.value = response.data;
  } catch (error) {
    console.error("Failed to fetch blogs:", error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchBlogs);

// Filtering States
const searchQuery = ref("");
const statusFilter = ref("");
const categoryFilter = ref("");

// Computed
const filteredBlogs = computed(() => {
  return blogs.value.filter((b) => {
    const q = searchQuery.value.toLowerCase();
    const matchSearch =
      !q || [b.title, b.excerpt].some((f) => f.toLowerCase().includes(q));
    const matchStatus =
      !statusFilter.value ||
      (statusFilter.value === "published" ? b.isPublished : !b.isPublished);
    const matchCategory =
      !categoryFilter.value || b.category === categoryFilter.value;
    return matchSearch && matchStatus && matchCategory;
  });
});

const stats = computed(() => ({
  total: blogs.value.length,
  published: blogs.value.filter((b) => b.isPublished).length,
  draft: blogs.value.filter((b) => !b.isPublished).length,
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
  excerpt: "",
  content: "",
  coverImage: "",
  isPublished: false,
});

const form = ref<any>(initialFormState());

const openModal = (mode: "add" | "edit", id: string | null = null) => {
  modalMode.value = mode;
  if (mode === "edit" && id) {
    editingId.value = id;
    const b = blogs.value.find((x) => x.id === id);
    if (b) {
      form.value = { ...b };
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
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");
};

const saveBlog = async () => {
  if (!form.value.title) {
    alert("Blog title is required!");
    return;
  }

  isSaving.value = true;
  try {
    if (!form.value.slug) {
      form.value.slug = slugify(form.value.title);
    }

    const { id, createdAt, updatedAt, ...payload } = form.value;

    if (modalMode.value === "edit" && editingId.value) {
      await api.put(`/admin/blogs/${editingId.value}`, payload);
    } else {
      await api.post("/admin/blogs", payload);
    }
    await fetchBlogs();
    closeModal();
  } catch (error: any) {
    console.error("Failed to save blog:", error);
    const backendMessage = error.response?.data?.error;
    alert(
      backendMessage
        ? `Error: ${backendMessage}`
        : "Error saving blog. Check console for details.",
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
      await api.delete(`/admin/blogs/${deleteTargetId.value}`);
      await fetchBlogs();
      isDeleteModalOpen.value = false;
    } catch (error) {
      console.error("Failed to delete blog:", error);
      alert("Error deleting blog.");
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

const toggleStatus = async (blog: Blog) => {
  try {
    const { id, createdAt, updatedAt, ...payload } = blog;
    await api.put(`/admin/blogs/${blog.id}`, payload);
  } catch (error) {
    console.error("Failed to update blog status:", error);
    blog.isPublished = !blog.isPublished;
    alert("Failed to update status. Please try again.");
  }
};
</script>

<template>
  <main class="page-content private">
    <header class="cms-header">
      <div class="header-main">
        <h1 class="page-title">Blog CMS</h1>
        <p class="breadcrumb">/dashboard/blogs · Manage your articles</p>
      </div>
      <button class="btn-primary" @click="openModal('add')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Add Article
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
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input type="text" v-model="searchQuery" class="search-input" placeholder="Search articles..." />
        </div>
        <select v-model="statusFilter" class="form-input filter-select">
          <option value="">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      <div class="scroll-wrapper">
        <table class="project-table">
          <thead>
            <tr>
              <th style="width: 40px"></th>
              <th>Article</th>
              <th>Category</th>
              <th>Published</th>
              <th>Date</th>
              <th style="text-align: right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="b in filteredBlogs" :key="b.id" class="project-row">
              <td>
                <div class="project-thumb">
                  <img v-if="b.coverImage" :src="b.coverImage" />
                  <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#374151" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                </div>
              </td>
              <td>
                <div class="cell-title">{{ b.title }}</div>
                <div class="cell-sub">{{ b.excerpt }}</div>
              </td>
              <td>
                <span class="badge-blue">{{ b.category }}</span>
              </td>
              <td>
                <label class="toggle">
                  <input type="checkbox" v-model="b.isPublished" @change="toggleStatus(b)" />
                  <span class="toggle-slider"></span>
                </label>
              </td>
              <td>
                <span class="mono-date">{{ new Date(b.createdAt).toLocaleDateString() }}</span>
              </td>
              <td class="action-cell">
                <button @click="openModal('edit', b.id)" class="icon-btn" title="Edit">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
                <button @click="openDeleteModal(b.id)" class="icon-btn danger" title="Delete">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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

    <!-- Modal -->
    <Transition name="fade">
      <div v-if="isModalOpen" class="modal-overlay open" @click.self="closeModal">
        <Transition name="slide-up">
          <div class="modal">
            <header class="modal-header">
              <div>
                <h2 class="modal-title">{{ modalMode === 'add' ? 'Add New Article' : 'Edit Article' }}</h2>
                <p class="modal-sub">Fill in the article details below</p>
              </div>
              <button @click="closeModal" class="modal-close">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </header>

            <form @submit.prevent="saveBlog" class="modal-form">
              <div class="upload-section">
                <label class="form-label">Cover Image</label>
                <div class="upload-zone" @click="($refs.fileInput as any).click()">
                  <div v-if="!form.coverImage" class="upload-placeholder">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#374151" stroke-width="1.5">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <span>Click to upload image</span>
                  </div>
                  <div v-else class="upload-preview">
                    <img :src="form.coverImage" />
                    <span class="upload-change">Change image</span>
                  </div>
                  <input type="file" ref="fileInput" @change="handleFileUpload" accept="image/*" style="display: none" />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Title *</label>
                  <input type="text" v-model="form.title" class="form-input" required />
                </div>
                <div class="form-group">
                  <label class="form-label">Category *</label>
                  <select v-model="form.category" class="form-input" required>
                    <option value="">Select...</option>
                    <option value="Tech">Tech</option>
                    <option value="Personal">Personal</option>
                    <option value="Tutorial">Tutorial</option>
                    <option value="Update">Project Update</option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Excerpt *</label>
                <textarea v-model="form.excerpt" class="form-input" rows="2" required></textarea>
              </div>

              <div class="form-group">
                <label class="form-label">Content *</label>
                <textarea v-model="form.content" class="form-input" rows="6" required></textarea>
              </div>

              <div class="toggle-card">
                 <div class="toggle-info">
                   <span class="toggle-title">Published</span>
                   <span class="toggle-desc">Public visibility</span>
                 </div>
                 <label class="toggle">
                   <input type="checkbox" v-model="form.isPublished" />
                   <span class="toggle-slider"></span>
                 </label>
              </div>

              <footer class="modal-footer">
                <button type="button" class="btn-ghost" @click="closeModal">Cancel</button>
                <button type="submit" class="btn-primary" :disabled="isSaving">
                  <div v-if="isSaving" class="btn-loader"></div>
                  <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {{ isSaving ? 'Saving...' : 'Save Article' }}
                </button>
              </footer>
            </form>
          </div>
        </Transition>
      </div>
    </Transition>

    <!-- Delete Modal -->
    <Transition name="fade">
      <div v-if="isDeleteModalOpen" class="modal-overlay open" @click.self="isDeleteModalOpen = false">
        <Transition name="slide-up">
          <div class="modal delete-modal">
            <h3 class="delete-title">Delete Article?</h3>
            <p class="delete-desc">This action cannot be undone.</p>
            <div class="delete-actions">
              <button class="btn-ghost" @click="isDeleteModalOpen = false">Cancel</button>
              <button class="btn-danger" @click="confirmDelete">Delete</button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </main>
</template>

<style scoped>
/* Scoped styles are reused from ProjectCms.vue or global .private CSS */
.cms-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}
.page-title { font-size: 1.5rem; font-weight: 700; color: var(--p-light); }
.breadcrumb { font-size: 0.8rem; color: #6b7280; margin-top: 0.25rem; }

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.private .card {
  background: var(--p-card-bg);
  border: 1px solid var(--p-card-border);
  border-radius: 12px;
  padding: 1.5rem;
}

.stat-label { font-size: 0.75rem; text-transform: uppercase; color: #6b7280; letter-spacing: 0.05em; }
.stat-value { font-size: 2rem; font-weight: 800; display: block; margin-top: 0.5rem; }
.value-published { color: #10b981; }
.value-draft { color: #f59e0b; }

.toolbar {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.search-wrap {
  position: relative;
  flex: 1;
}
.search-wrap svg {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
}
.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 3rem;
  background: #111;
  border: 1px solid var(--p-card-border);
  border-radius: 8px;
  color: white;
}

.project-table { width: 100%; border-collapse: collapse; }
.project-table th { text-align: left; padding: 1rem; color: #6b7280; font-size: 0.8rem; border-bottom: 1px solid var(--p-card-border); }
.project-table td { padding: 1rem; border-bottom: 1px solid var(--p-card-border); }
.project-thumb { width: 48px; height: 32px; border-radius: 4px; overflow: hidden; background: #222; }
.project-thumb img { width: 100%; height: 100%; object-fit: cover; }

.cell-title { font-weight: 600; color: var(--p-light); }
.cell-sub { font-size: 0.75rem; color: #6b7280; margin-top: 0.25rem; }

.badge-green { background: rgba(16, 185, 129, 0.1); color: #10b981; padding: 0.25rem 0.75rem; border-radius: 99px; font-size: 0.75rem; }
.badge-yellow { background: rgba(245, 158, 11, 0.1); color: #f59e0b; padding: 0.25rem 0.75rem; border-radius: 99px; font-size: 0.75rem; }
.badge-blue { background: rgba(59, 130, 246, 0.1); color: #3b82f6; padding: 0.25rem 0.75rem; border-radius: 99px; font-size: 0.75rem; }

.action-cell { display: flex; gap: 0.5rem; justify-content: flex-end; }
.icon-btn { background: none; border: none; padding: 0.5rem; cursor: pointer; color: #6b7280; transition: color 0.2s; }
.icon-btn:hover { color: var(--p-light); }
.icon-btn.danger:hover { color: #ef4444; }

/* Modal & Form - Reusing standard .private styles */
.upload-zone {
  border: 2px dashed var(--p-card-border);
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
}
.upload-preview img { max-height: 120px; border-radius: 8px; margin-bottom: 1rem; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.form-group { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1rem; }
.form-label { font-size: 0.85rem; color: #9ca3af; }
.form-input { 
  background: #111; 
  border: 1px solid var(--p-card-border); 
  border-radius: 8px; 
  padding: 0.75rem; 
  color: white; 
}

.toggle-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #111;
  border-radius: 12px;
  border: 1px solid var(--p-card-border);
}
.toggle-title { font-weight: 600; font-size: 0.9rem; color: white; }
.toggle-desc { font-size: 0.75rem; color: #6b7280; }

.modal-footer { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem; }
</style>
