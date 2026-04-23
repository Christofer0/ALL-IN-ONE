<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import api from "@/utils/api";
import type { Folder, Note } from "@/types";

const folders = ref<Folder[]>([]);
const notes = ref<Note[]>([]);
const isLoading = ref(true);
const isSaving = ref(false);
const searchQuery = ref("");
const activeFolderId = ref<string | number>(1); // 1 for "All Notes" virtual folder
const activeNoteId = ref<string | null>(null);
const editorMode = ref<"split" | "write" | "preview">("split");
const tagInput = ref("");

// Helper: Debounce function
function debounce<T extends (...args: any[]) => void>(fn: T, delay: number) {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

const fetchFolders = async () => {
  try {
    const response = await api.get("/admin/folders");
    folders.value = [
      { id: "1", name: "All Notes", icon: "📝", createdAt: "", updatedAt: "" },
      ...response.data,
    ];
  } catch (error) {
    console.error("Failed to fetch folders:", error);
  }
};

const fetchNotes = async (folderId?: string) => {
  isLoading.value = true;
  try {
    const params: any = {};
    if (folderId && folderId !== "1") params.folderId = folderId;
    const response = await api.get("/admin/notes", { params });
    notes.value = response.data;
  } catch (error) {
    console.error("Failed to fetch notes:", error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(async () => {
  await fetchFolders();
  await fetchNotes();
  if (notes.value.length > 0) {
    activeNoteId.value = notes.value[0].id;
  }
});

// Computed
const currentNote = computed(() =>
  notes.value.find((n) => n.id === activeNoteId.value),
);

const filteredNotes = computed(() => {
  let list = notes.value;

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        n.tags?.some((t) => t.toLowerCase().includes(q)),
    );
  }

  return list.sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));
});

const folderCounts = computed(() => {
  const counts: Record<string, number> = {};
  notes.value.forEach((n) => {
    if (n.folderId) {
      counts[n.folderId] = (counts[n.folderId] || 0) + 1;
    }
  });
  return counts;
});

const wordCount = computed(() => {
  if (!currentNote.value) return 0;
  return currentNote.value.content
    .trim()
    .split(/\s+/)
    .filter((w) => w).length;
});

const renderedMarkdown = computed(() => {
  if (!currentNote.value) return "";
  let html = currentNote.value.content
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/~~(.+?)~~/g, "<s>$1</s>")
    .replace(
      /```([\s\S]*?)```/g,
      '<pre class="code-block"><code>$1</code></pre>',
    )
    .replace(/`(.+?)`/g, "<code>$1</code>")
    .replace(/^\> (.+)$/gm, "<blockquote>$1</blockquote>")
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>)/gs, "<ul>$1</ul>")
    .replace(
      /\[(.+?)\]\((.+?)\)/g,
      '<a href="$2" target="_blank" style="color:var(--p-accent)">$1</a>',
    )
    .replace(/^---$/gm, "<hr>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br>");
  return `<div class="markdown-body"><p>${html}</p></div>`;
});

// Methods
const selectFolder = async (id: string | number) => {
  activeFolderId.value = id;
  await fetchNotes(id.toString());
};

const selectNote = (id: string) => {
  activeNoteId.value = id;
};

const createNote = async () => {
  try {
    const payload = {
      title: "Untitled Note",
      content: "# Untitled Note\n\nStart writing...",
      folderId: activeFolderId.value !== 1 ? activeFolderId.value : null,
      tags: [],
      isPinned: false,
    };
    const response = await api.post("/admin/notes", payload);
    notes.value.unshift(response.data);
    activeNoteId.value = response.data.id;
  } catch (error) {
    console.error("Failed to create note:", error);
  }
};

const deleteNote = async (id: string) => {
  if (!confirm("Are you sure you want to delete this note?")) return;
  try {
    await api.delete(`/admin/notes/${id}`);
    notes.value = notes.value.filter((n) => n.id !== id);
    if (activeNoteId.value === id) {
      activeNoteId.value = notes.value.length > 0 ? notes.value[0].id : null;
    }
  } catch (error) {
    console.error("Failed to delete note:", error);
  }
};

const updateNoteOnServer = async (id: string, payload: Partial<Note>) => {
  isSaving.value = true;
  try {
    await api.put(`/admin/notes/${id}`, payload);
  } catch (error) {
    console.error("Failed to update note:", error);
  } finally {
    setTimeout(() => {
      isSaving.value = false;
    }, 500);
  }
};

const debouncedUpdate = debounce(updateNoteOnServer, 1000);

const handleTitleInput = () => {
  if (!currentNote.value) return;
  debouncedUpdate(currentNote.value.id, {
    title: currentNote.value.title,
    content: currentNote.value.content,
  });
};

const handleInput = () => {
  if (!currentNote.value) return;

  // Extract title from first H1 (Optional: keeping for auto-sync)
  const match = currentNote.value.content.match(/^#\s+(.+)/m);
  if (match) {
    currentNote.value.title = match[1];
  }

  debouncedUpdate(currentNote.value.id, {
    title: currentNote.value.title,
    content: currentNote.value.content,
  });
};

const togglePin = async () => {
  if (currentNote.value) {
    currentNote.value.isPinned = !currentNote.value.isPinned;
    await updateNoteOnServer(currentNote.value.id, {
      isPinned: currentNote.value.isPinned,
    });
  }
};

const addTag = async () => {
  const tag = tagInput.value.trim().replace(/[^a-z0-9-]/gi, "");
  if (tag && currentNote.value && !currentNote.value.tags.includes(tag)) {
    currentNote.value.tags.push(tag);
    tagInput.value = "";
    await updateNoteOnServer(currentNote.value.id, {
      tags: currentNote.value.tags,
    });
  }
};

const removeTag = async (tag: string) => {
  if (currentNote.value) {
    currentNote.value.tags = currentNote.value.tags.filter((t) => t !== tag);
    await updateNoteOnServer(currentNote.value.id, {
      tags: currentNote.value.tags,
    });
  }
};

const createFolder = async () => {
  const name = window.prompt("Enter folder name:");
  if (name) {
    try {
      const response = await api.post("/admin/folders", { name, icon: "📁" });
      folders.value.push(response.data);
    } catch (error) {
      console.error("Failed to create folder:", error);
    }
  }
};

const exportNote = () => {
  if (!currentNote.value) return;
  const blob = new Blob([currentNote.value.content], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${currentNote.value.title.replace(/[^a-z0-9]/gi, "-")}.md`;
  a.click();
  URL.revokeObjectURL(url);
};

const insertMd = (before: string, after: string) => {
  const textarea = document.getElementById(
    "md-textarea",
  ) as HTMLTextAreaElement;
  if (!textarea || !currentNote.value) return;

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const text = currentNote.value.content;
  const selection = text.substring(start, end);

  currentNote.value.content =
    text.substring(0, start) + before + selection + after + text.substring(end);

  // Set focus back and adjust selection
  setTimeout(() => {
    textarea.focus();
    textarea.setSelectionRange(start + before.length, end + before.length);
    handleInput(); // Trigger auto-save
  }, 0);
};
</script>

<template>
  <main
    class="page-content"
    style="
      display: flex;
      flex-direction: column;
      height: 100%;
      min-height: 0;
      padding: 0;
    "
  >
    <!-- Topbar Panel -->
    <header class="notes-header">
      <div style="font-size: 0.85rem; font-weight: 600; flex-shrink: 0">
        Notes
      </div>
      <div class="search-wrap" style="flex: 1; max-width: 300px">
        <svg
          style="
            position: absolute;
            left: 10px;
            top: 50%;
            transform: translateY(-50%);
            color: #374151;
          "
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          class="search-input"
          placeholder="Search notes..."
        />
      </div>

      <div class="mode-toggles">
        <button
          v-for="mode in ['split', 'write', 'preview'] as const"
          :key="mode"
          class="mode-btn"
          :class="{ active: editorMode === mode }"
          @click="editorMode = mode"
        >
          {{ mode.charAt(0).toUpperCase() + mode.slice(1) }}
        </button>
      </div>

      <div style="display: flex; gap: 8px; margin-left: auto">
        <button class="btn-primary" @click="createNote">
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Note
        </button>
        <button class="btn-ghost" @click="exportNote" :disabled="!currentNote">
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
    </header>

    <div class="notes-body">
      <!-- Panel 1: Folders -->
      <aside class="folders-panel">
        <div class="panel-header">
          <span>Folders</span>
          <button class="icon-btn" title="New folder" @click="createFolder">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>
        <div class="panel-content scrollbar-minimal">
          <div
            v-for="folder in folders"
            :key="folder.id"
            class="folder-item"
            :class="{ active: activeFolderId === folder.id }"
            @click="selectFolder(folder.id)"
          >
            <span class="folder-icon">{{ folder.icon || "📁" }}</span>
            <span class="folder-name">{{ folder.name }}</span>
            <span class="folder-count">{{
              folder.id === "1" ? notes.length : folderCounts[folder.id] || 0
            }}</span>
          </div>
        </div>
        <div class="panel-footer">{{ notes.length }} notes total</div>
      </aside>

      <!-- Panel 2: Notes List -->
      <section class="notes-list-panel">
        <div class="panel-header">
          <span style="font-weight: 600">{{
            folders.find((f) => f.id === activeFolderId.toString())?.name ||
            "Notes"
          }}</span>
          <button class="text-btn">Sort</button>
        </div>
        <div class="panel-content scrollbar-minimal">
          <div v-if="isLoading" class="loading-state">Loading notes...</div>
          <template v-else>
            <div
              v-for="note in filteredNotes"
              :key="note.id"
              class="note-item"
              :class="{ active: activeNoteId === note.id }"
              @click="selectNote(note.id)"
            >
              <div class="note-item-header">
                <span v-if="note.isPinned" class="pin-icon">📌</span>
                <span class="note-title">{{ note.title }}</span>
              </div>
              <div class="note-preview">
                {{
                  note.content
                    .replace(/[#*`\n]/g, " ")
                    .trim()
                    .slice(0, 60)
                }}...
              </div>
              <div class="note-item-footer">
                <div class="tag-list">
                  <span
                    v-for="tag in note.tags?.slice(0, 2)"
                    :key="tag"
                    class="tag-chip mini"
                    >#{{ tag }}</span
                  >
                </div>
                <span class="note-date">{{
                  new Date(note.updatedAt).toLocaleDateString()
                }}</span>
              </div>
            </div>
          </template>
          <div
            v-if="!isLoading && filteredNotes.length === 0"
            class="empty-state"
          >
            No notes found
          </div>
        </div>
      </section>

      <!-- Panel 3: Editor -->
      <section class="editor-panel">
        <template v-if="currentNote">
          <!-- Meta bar -->
          <div class="note-meta-bar">
            <input
              v-model="currentNote.title"
              class="current-note-title-input"
              @input="handleTitleInput"
              placeholder="Note title..."
            />
            <div class="note-tags-list">
              <span v-for="tag in currentNote.tags" :key="tag" class="tag-chip">
                #{{ tag }}
                <button class="remove-tag" @click="removeTag(tag)">×</button>
              </span>
            </div>
            <div style="display: flex; gap: 8px; align-items: center">
              <button
                class="pin-btn"
                :class="{ active: currentNote.isPinned }"
                @click="togglePin"
                title="Toggle Pin"
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
                    d="m15 4.5-4 4L7 7l-1.5 1.5 4 4-3 6L8 20l6-3 4 4 1.5-1.5-1.5-4 4-4L20.5 10l-1.5-2.5z"
                  />
                </svg>
              </button>
              <button
                class="pin-btn danger-hover"
                @click="deleteNote(currentNote.id)"
                title="Delete Note"
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
            <span class="save-status">{{
              isSaving ? "Saving..." : "Saved ✓"
            }}</span>
          </div>

          <!-- Toolbar -->
          <div class="editor-toolbar">
            <button class="tool-btn" @click="insertMd('**', '**')" title="Bold">
              <b>B</b>
            </button>
            <button class="tool-btn" @click="insertMd('*', '*')" title="Italic">
              <i>I</i>
            </button>
            <button
              class="tool-btn"
              @click="insertMd('~~', '~~')"
              title="Strike"
            >
              <s>S</s>
            </button>
            <div class="toolbar-divider"></div>
            <button class="tool-btn" @click="insertMd('\n# ', '')">H1</button>
            <button class="tool-btn" @click="insertMd('\n## ', '')">H2</button>
            <button class="tool-btn" @click="insertMd('\n### ', '')">H3</button>
            <div class="toolbar-divider"></div>
            <button class="tool-btn" @click="insertMd('\n- ', '')">
              — List
            </button>
            <button class="tool-btn" @click="insertMd('\n> ', '')">
              ❝ Quote
            </button>
            <button class="tool-btn" @click="insertMd('`', '`')">Code</button>
            <button class="tool-btn" @click="insertMd('\n```\n', '\n```')">
              Block
            </button>
            <div class="toolbar-divider"></div>
            <button class="tool-btn" @click="insertMd('\n---\n', '')">
              HR
            </button>
            <button class="tool-btn" @click="insertMd('[', '](url)')">
              Link
            </button>

            <div class="toolbar-right">
              <span class="word-count">{{ wordCount }} words</span>
              <input
                v-model="tagInput"
                type="text"
                class="tag-add-input"
                placeholder="+ add tag"
                @keydown.enter="addTag"
              />
            </div>
          </div>

          <!-- Split / Content View -->
          <div class="editor-split">
            <div
              v-show="editorMode !== 'preview'"
              class="editor-write scrollbar-minimal"
            >
              <textarea
                id="md-textarea"
                v-model="currentNote.content"
                class="md-editor"
                placeholder="Start writing..."
                @input="handleInput"
              ></textarea>
            </div>
            <div
              v-show="editorMode !== 'write'"
              class="editor-preview scrollbar-minimal"
            >
              <div v-html="renderedMarkdown"></div>
            </div>
          </div>
        </template>
        <div v-else class="empty-editor">
          <div class="empty-icon">📝</div>
          <div class="empty-text">Select or create a note to start writing</div>
          <button class="btn-primary" @click="createNote">
            Create New Note
          </button>
        </div>
      </section>
    </div>
  </main>
</template>

<style scoped>
.notes-header {
  height: 52px;
  background: var(--p-sidebar-bg);
  border-bottom: 1px solid var(--p-card-border);
  display: flex;
  align-items: center;
  padding: 0 20px;
  gap: 12px;
  flex-shrink: 0;
}

.notes-body {
  flex: 1;
  display: flex;
  overflow: hidden;
  background: #000;
}

/* Panel Layouts */
.folders-panel {
  width: 180px;
  border-right: 1px solid var(--p-card-border);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.notes-list-panel {
  width: 260px;
  border-right: 1px solid var(--p-card-border);
  background: #080808;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.editor-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #000;
}

.panel-header {
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--p-card-border);
  font-family: "JetBrains Mono", monospace;
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #374151;
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.panel-footer {
  padding: 10px 16px;
  border-top: 1px solid var(--p-card-border);
  font-family: "JetBrains Mono", monospace;
  font-size: 0.65rem;
  color: #374151;
}

/* Sidebar items */
.folder-item {
  padding: 8px 16px;
  font-size: 0.8rem;
  cursor: pointer;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 10px;
  border-radius: 6px;
  margin: 2px 8px;
  transition: all 0.2s;
}

.folder-item:hover {
  background: var(--p-surface);
  color: var(--p-light);
}

.folder-item.active {
  background: rgba(74, 112, 169, 0.12);
  color: var(--p-accent);
}

.folder-icon {
  font-size: 0.9rem;
}
.folder-name {
  flex: 1;
}
.folder-count {
  font-family: "JetBrains Mono", monospace;
  font-size: 0.65rem;
  opacity: 0.5;
}

/* Note List Items */
.note-item {
  padding: 16px;
  border-bottom: 1px solid #111;
  cursor: pointer;
  transition: all 0.2s;
}

.note-item:hover {
  background: #111;
}
.note-item.active {
  background: rgba(74, 112, 169, 0.05);
  border-left: 2px solid var(--p-secondary);
}

.note-item-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}
.pin-icon {
  font-size: 0.75rem;
  color: #fbbf24;
}
.note-title {
  font-size: 0.85rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--p-light);
}
.note-preview {
  font-size: 0.72rem;
  color: #6b7280;
  line-height: 1.4;
  margin-bottom: 12px;
  height: 2em;
  overflow: hidden;
}
.note-item-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.note-date {
  font-family: "JetBrains Mono", monospace;
  font-size: 0.6rem;
  color: #374151;
}

.tag-list {
  display: flex;
  gap: 4px;
}
.tag-chip.mini {
  font-size: 0.55rem;
  padding: 1px 6px;
}

/* Editor Meta Bar */
.note-meta-bar {
  padding: 12px 20px;
  border-bottom: 1px solid var(--p-card-border);
  display: flex;
  align-items: center;
  gap: 12px;
  background: #000;
}

.current-note-title-input {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--p-light);
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  padding: 4px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.current-note-title-input:focus {
  border-bottom: 1px solid var(--p-card-border);
}

.note-tags-list {
  display: flex;
  gap: 6px;
}
.pin-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  color: #374151;
  padding: 4px;
  transition: color 0.2s;
}
.pin-btn:hover {
  color: #fbbf24;
}
.pin-btn.active {
  color: #fbbf24;
}
.pin-btn.danger-hover:hover {
  color: #f87171;
}

.loading-state {
  padding: 40px;
  text-align: center;
  color: #374151;
  font-family: "JetBrains Mono", monospace;
  font-size: 0.8rem;
}

.save-status {
  font-family: "JetBrains Mono", monospace;
  font-size: 0.65rem;
  color: #374151;
}

/* Toolbar */
.editor-toolbar {
  padding: 8px 16px;
  background: var(--p-surface);
  border-bottom: 1px solid var(--p-card-border);
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.tool-btn {
  background: transparent;
  border: 1px solid transparent;
  border-radius: 4px;
  padding: 4px 8px;
  cursor: pointer;
  color: #6b7280;
  font-size: 0.75rem;
  font-family: "JetBrains Mono", monospace;
  transition: all 0.2s;
}

.tool-btn:hover {
  background: #1e1e1e;
  color: var(--p-light);
  border-color: #333;
}

.toolbar-divider {
  width: 1px;
  height: 16px;
  background: #222;
  margin: 0 4px;
}

.toolbar-right {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 12px;
}
.word-count {
  font-family: "JetBrains Mono", monospace;
  font-size: 0.65rem;
  color: #374151;
}

.tag-add-input {
  background: #111;
  border: 1px solid #222;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 0.7rem;
  color: var(--p-light);
  outline: none;
  width: 90px;
  font-family: "JetBrains Mono", monospace;
}

/* Split View */
.editor-split {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.editor-write,
.editor-preview {
  flex: 1;
  overflow-y: auto;
  padding: 30px;
}

.editor-write {
  background: #0a0a0a;
  border-right: 1px solid var(--p-card-border);
}

.md-editor {
  width: 100%;
  height: 100%;
  background: transparent;
  border: none;
  outline: none;
  color: #ccc;
  font-family: "JetBrains Mono", monospace;
  font-size: 0.9rem;
  line-height: 1.8;
  resize: none;
}

/* Mode toggles in header */
.mode-toggles {
  display: flex;
  gap: 4px;
  background: #111;
  padding: 3px;
  border-radius: 6px;
  border: 1px solid #222;
}

.mode-btn {
  background: transparent;
  border: none;
  border-radius: 4px;
  padding: 4px 10px;
  font-size: 0.65rem;
  font-family: "JetBrains Mono", monospace;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.mode-btn.active {
  background: #222;
  color: var(--p-accent);
}

/* Tag Chips */
.tag-chip {
  font-family: "JetBrains Mono", monospace;
  font-size: 0.65rem;
  padding: 2px 8px;
  background: rgba(74, 112, 169, 0.1);
  border: 1px solid rgba(74, 112, 169, 0.2);
  color: var(--p-accent);
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.remove-tag {
  background: transparent;
  border: none;
  color: inherit;
  cursor: pointer;
  opacity: 0.5;
  padding: 0 0 0 4px;
}

.remove-tag:hover {
  opacity: 1;
}

.empty-editor {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: #374151;
}

.empty-icon {
  font-size: 3rem;
  opacity: 0.2;
}
.empty-text {
  font-family: "JetBrains Mono", monospace;
  font-size: 0.8rem;
}

.scrollbar-minimal::-webkit-scrollbar {
  width: 4px;
}
.scrollbar-minimal::-webkit-scrollbar-track {
  background: transparent;
}
.scrollbar-minimal::-webkit-scrollbar-thumb {
  background: #1e1e1e;
  border-radius: 2px;
}

/* Markdown Styles */
:deep(.markdown-body) {
  font-family: "Inter", sans-serif;
  color: #bbb;
  line-height: 1.8;
  font-size: 0.95rem;
}

:deep(.markdown-body h1) {
  font-size: 1.8rem;
  font-weight: 800;
  color: #fff;
  margin-bottom: 24px;
  border-bottom: 1px solid #222;
  padding-bottom: 8px;
}
:deep(.markdown-body h2) {
  font-size: 1.4rem;
  font-weight: 700;
  color: #fff;
  margin: 32px 0 16px;
}
:deep(.markdown-body h3) {
  font-size: 1.1rem;
  font-weight: 600;
  color: #fff;
  margin: 24px 0 12px;
}
:deep(.markdown-body p) {
  margin-bottom: 16px;
}
:deep(.markdown-body strong) {
  color: #fff;
  font-weight: 600;
}
:deep(.markdown-body em) {
  font-style: italic;
}
:deep(.markdown-body blockquote) {
  border-left: 4px solid var(--p-secondary);
  background: #0d0d0d;
  padding: 16px 20px;
  margin: 20px 0;
  color: #888;
  font-style: italic;
  border-radius: 0 8px 8px 0;
}

:deep(.markdown-body .code-block) {
  background: #111;
  border: 1px solid #222;
  padding: 20px;
  border-radius: 10px;
  margin: 20px 0;
  overflow-x: auto;
}

:deep(.markdown-body code) {
  font-family: "JetBrains Mono", monospace;
  font-size: 0.85rem;
  background: #1a1a1a;
  padding: 2px 6px;
  border-radius: 4px;
  color: var(--p-accent);
}

:deep(.markdown-body ul) {
  padding-left: 20px;
  margin-bottom: 16px;
}
:deep(.markdown-body li) {
  margin-bottom: 8px;
}
</style>
