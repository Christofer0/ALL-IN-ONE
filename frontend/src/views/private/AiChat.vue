<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from "vue";
import axios from "axios";

const AI_API_BASE = import.meta.env.VITE_API_BASE_AI || "http://localhost:8000";

interface Message {
  id: string | number;
  role: "user" | "ai";
  content: string;
  timestamp: string;
}

interface ContextLayer {
  id: string;
  name: string;
  icon: string;
  isOn: boolean;
  color: string;
}

interface HistoryItem {
  id: string | number;
  title: string;
  date: string;
  active?: boolean;
}

interface Prompt {
  id: number;
  text: string;
  fullContent: string;
}

// State
const messages = ref<Message[]>([
  {
    id: "welcome",
    role: "ai",
    content: "Halo Brillian! 👋 Saya asisten AI Personal OS kamu. Ada yang bisa saya bantu hari ini? Saya punya akses ke data Cashflow dan Notes kamu jika kamu butuh analisis atau rangkuman.",
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  },
]);

const sessionId = ref<string | null>(null);
const currentMode = ref<"brainstorm" | "review" | "plan">("brainstorm");
const chatInput = ref("");
const isTyping = ref(false);
const chatContainer = ref<HTMLElement | null>(null);

const contexts = ref<ContextLayer[]>([
  { id: "cashflow", name: "Cashflow data", icon: "money", isOn: true, color: "#4ade80" },
  { id: "notes", name: "Notes context", icon: "file", isOn: true, color: "#4ade80" },
  { id: "goals", name: "Goals data", icon: "target", isOn: false, color: "#374151" },
]);

const chatHistory = ref<HistoryItem[]>([]);

const savedPrompts = ref<Prompt[]>([
  { id: 1, text: "Analisis cashflow & saran hemat", fullContent: "Analisis cashflow bulan ini dan berikan 3 saran penghematan spesifik berdasarkan riwayat transaksi saya." },
  { id: 2, text: "Review notes & insight penting", fullContent: "Review notes terbaru saya dan rangkum insight penting atau action item yang perlu saya tindak lanjuti minggu ini." },
  { id: 3, text: "Draft ide project baru", fullContent: "Bantu saya brainstorming ide project open-source sederhana yang bisa saya bangun menggunakan stack Vue 3 dan ElysiaJS." },
]);

// Methods
const fetchHistory = async () => {
  try {
    const res = await axios.get(`${AI_API_BASE}/api/ai/chat/history`);
    chatHistory.value = res.data.map((item: any) => ({
      id: item.id,
      title: item.title,
      date: new Date(item.created_at).toLocaleDateString(),
      active: item.id === sessionId.value
    }));
  } catch (error) {
    console.error("Failed to fetch history:", error);
  }
};

const loadSession = async (id: string | number) => {
  if (id === sessionId.value) return;
  sessionId.value = id.toString();
  isTyping.value = true;
  try {
    const res = await axios.get(`${AI_API_BASE}/api/ai/chat/${id}/messages`);
    messages.value = res.data.map((msg: any) => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      timestamp: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }));
    chatHistory.value.forEach(h => h.active = h.id === id);
    scrollToBottom();
  } catch (error) {
    console.error("Failed to load messages:", error);
  } finally {
    isTyping.value = false;
  }
};

const scrollToBottom = async () => {
  await nextTick();
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
  }
};

const sendMessage = async () => {
  if (!chatInput.value.trim() || isTyping.value) return;

  const content = chatInput.value;
  const userMsg: Message = {
    id: Date.now(),
    role: "user",
    content: content,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };

  messages.value.push(userMsg);
  chatInput.value = "";
  scrollToBottom();

  isTyping.value = true;
  try {
    const activeContexts = contexts.value.filter(c => c.isOn).map(c => c.id);
    const res = await axios.post(`${AI_API_BASE}/api/ai/chat/message`, {
      session_id: sessionId.value,
      message: content,
      mode: currentMode.value,
      active_contexts: activeContexts
    });

    const aiMsg: Message = {
      id: res.data.id,
      role: "ai",
      content: res.data.content,
      timestamp: res.data.timestamp
    };

    if (!sessionId.value) {
      sessionId.value = res.data.session_id;
      await fetchHistory();
    }

    messages.value.push(aiMsg);
    scrollToBottom();
  } catch (error) {
    console.error("Failed to get AI response:", error);
    messages.value.push({
      id: "error",
      role: "ai",
      content: "Maaf, terjadi kesalahan saat menghubungi asisten AI. Pastikan backend sudah berjalan.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
  } finally {
    isTyping.value = false;
  }
};

const usePrompt = (p: Prompt) => {
  chatInput.value = p.fullContent;
};

const toggleContext = (id: string) => {
  const ctx = contexts.value.find((c) => c.id === id);
  if (ctx) {
    ctx.isOn = !ctx.isOn;
    ctx.color = ctx.isOn ? "#4ade80" : "var(--text-muted)";
  }
};

const clearChat = () => {
  if (confirm("Mulai chat baru?")) {
    sessionId.value = null;
    messages.value = [
      {
        id: "welcome",
        role: "ai",
        content: "Halo! Ada yang bisa saya bantu di sesi baru ini?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
    ];
    chatHistory.value.forEach(h => h.active = false);
  }
};

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
};

watch(messages, () => {
  scrollToBottom();
}, { deep: true });

onMounted(() => {
  fetchHistory();
  scrollToBottom();
});
</script>

<template>
  <main class="page-content chat-page-wrapper">
    <!-- Header -->
    <header class="chat-header">
      <div style="display: flex; align-items: center; gap: 12px">
        <div style="font-size: 0.95rem; font-weight: 700; color: var(--p-light)">AI Chat</div>
        <span class="badge-green status-badge">● Assistant Online</span>
      </div>
      
      <div style="display: flex; align-items: center; gap: 8px">
        <div class="mode-toggles">
          <button 
            v-for="m in (['brainstorm', 'review', 'plan'] as const)" 
            :key="m"
            class="mode-tab" 
            :class="{ active: currentMode === m }"
            @click="currentMode = m"
          >
            {{ m === 'brainstorm' ? '⚡' : m === 'review' ? '🔍' : '📋' }} {{ m.charAt(0).toUpperCase() + m.slice(1) }}
          </button>
        </div>
        <button class="btn-ghost" style="font-size: 0.75rem" @click="clearChat">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 .49-3.5" />
          </svg>
          New Chat
        </button>
      </div>
    </header>

    <div class="chat-layout">
      <!-- Sidebar -->
      <aside class="chat-sidebar">
        <div class="sidebar-section">
          <div class="section-label">Context Active</div>
          <div class="context-list">
            <div 
              v-for="ctx in contexts" 
              :key="ctx.id" 
              class="ctx-card" 
              @click="toggleContext(ctx.id)"
            >
              <div class="ctx-icon" :style="{ color: ctx.color }">
                <svg v-if="ctx.id === 'cashflow'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
                <svg v-else-if="ctx.id === 'notes'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                </svg>
                <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
                </svg>
              </div>
              <span class="ctx-name" :style="{ color: ctx.isOn ? '#9ca3af' : '#374151' }">{{ ctx.name }}</span>
              <span class="ctx-status" :style="{ color: ctx.isOn ? '#4ade80' : '#374151' }">{{ ctx.isOn ? 'ON' : 'OFF' }}</span>
            </div>
          </div>
        </div>

        <div class="sidebar-section">
          <div class="section-label">Quick Prompts</div>
          <div class="prompt-list">
            <button 
              v-for="p in savedPrompts" 
              :key="p.id" 
              class="prompt-chip"
              @click="usePrompt(p)"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4A70A9" stroke-width="2">
                 <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              {{ p.text }}
            </button>
          </div>
        </div>

        <div class="sidebar-section history-section">
          <div class="section-label">Chat History</div>
          <div class="history-list">
            <div 
              v-for="h in chatHistory" 
              :key="h.id" 
              class="history-item" 
              :class="{ active: h.active }"
              @click="loadSession(h.id)"
            >
              <div class="history-title">{{ h.title }}</div>
              <div class="history-meta">{{ h.date }}</div>
            </div>
          </div>
        </div>
      </aside>

      <!-- Main Chat -->
      <div class="chat-main">
        <div ref="chatContainer" class="chat-messages">
          <div v-for="m in messages" :key="m.id" :class="m.role === 'user' ? 'msg-user' : 'msg-ai'">
            <div v-if="m.role === 'ai'" class="msg-avatar-ai">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8FABD4" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div class="msg-bubble" :class="m.role === 'user' ? 'msg-bubble-user' : 'msg-bubble-ai'">
              <p style="white-space: pre-wrap;">{{ m.content }}</p>
              <div class="msg-time">{{ m.timestamp }}</div>
            </div>
          </div>

          <div v-if="isTyping" class="msg-ai">
            <div class="msg-avatar-ai">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8FABD4" stroke-width="2">
                <path d="M21 15a2 2 0 0 0-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div class="msg-bubble msg-bubble-ai typing-bubble">
              <span class="typing-dot"></span>
              <span class="typing-dot"></span>
              <span class="typing-dot"></span>
            </div>
          </div>
        </div>

        <div class="chat-input-area">
          <div class="input-wrapper">
            <textarea 
              v-model="chatInput" 
              class="chat-textarea" 
              placeholder="Deep brainstorm with AI Assistant..." 
              rows="1"
              @keydown="handleKeydown"
            ></textarea>
            <button 
              class="send-btn" 
              :disabled="!chatInput.trim() || isTyping" 
              @click="sendMessage"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
          <div class="input-footer">
             <span style="font-size: 0.65rem; color: var(--text-muted); font-family: 'JetBrains Mono', monospace;">Enter to send · Shift + Enter for new line</span>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.chat-page-wrapper {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 40px); /* Subtracting padding from main-content */
  min-height: 0;
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--p-card-border);
  margin-bottom: 0;
}

.status-badge {
  font-size: 0.65rem;
  padding: 2px 8px;
  background: rgba(34, 197, 94, 0.08);
  border: 1px solid rgba(34, 197, 94, 0.15);
  border-radius: 4px;
}

.mode-toggles {
  display: flex;
  gap: 2px;
  background: var(--p-primary);
  border: 1px solid var(--p-card-border);
  border-radius: 8px;
  padding: 3px;
}

.mode-tab {
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.15s;
  font-family: 'JetBrains Mono', monospace;
  background: transparent;
  color: #6b7280;
}

.mode-tab.active {
  background: rgba(74, 112, 169, 0.15);
  color: #8fabd4;
  border-color: rgba(74, 112, 169, 0.25);
}

.chat-layout {
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  margin-top: 0;
}

.chat-sidebar {
  width: 260px;
  border-right: 1px solid var(--p-card-border);
  background: var(--p-surface);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  flex-shrink: 0;
}

.sidebar-section {
  padding: 16px;
  border-bottom: 1px solid #1e1e1e;
}

.section-label {
  font-size: 0.65rem;
  font-family: 'JetBrains Mono', monospace;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--text-muted);
  font-weight: 700;
  margin-bottom: 12px;
}

.context-list, .prompt-list, .history-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.ctx-card {
  background: var(--p-primary);
  border: 1px solid var(--p-card-border);
  border-radius: 8px;
  padding: 8px 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.ctx-card:hover { border-color: rgba(74, 112, 169, 0.3); }

.ctx-name { font-size: 0.75rem; flex: 1; font-weight: 500; }
.ctx-status { font-size: 0.65rem; font-weight: 800; }

.prompt-chip {
  background: var(--p-primary);
  border: 1px solid var(--p-card-border);
  border-radius: 8px;
  padding: 8px 10px;
  font-size: 0.75rem;
  color: #9ca3af;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.prompt-chip:hover {
  border-color: rgba(74, 112, 169, 0.35);
  color: var(--p-light);
  background: rgba(74, 112, 169, 0.05);
}

.history-item {
  padding: 8px 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s;
}

.history-item:hover { background: var(--p-primary); }
.history-item.active { background: rgba(74, 112, 169, 0.1); border: 1px solid rgba(74, 112, 169, 0.15); }
.history-title { font-size: 0.78rem; color: var(--p-light); font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-bottom: 2px; }
.history-meta { font-size: 0.65rem; color: var(--text-muted); }

.history-section { flex: 1; border-bottom: none; }

.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: var(--p-primary);
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 30px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.msg-user { display: flex; justify-content: flex-end; }
.msg-ai { display: flex; justify-content: flex-start; gap: 12px; align-items: flex-start; }

.msg-avatar-ai {
  width: 32px; height: 32px; border-radius: 8px;
  background: rgba(74, 112, 169, 0.15); border: 1px solid rgba(74, 112, 169, 0.2);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 4px;
}

.msg-bubble {
  max-width: 75%; padding: 12px 16px; font-size: 0.88rem; line-height: 1.6; position: relative;
}

.msg-bubble-user {
  background: #4a70a9; color: #ffffff; font-weight: 500; border-radius: 16px 16px 4px 16px;
}

.msg-bubble-ai {
  background: var(--p-surface); border: 1px solid var(--p-card-border); color: var(--p-light); font-weight: 500; border-radius: 4px 16px 16px 16px;
}

.msg-time {
  font-size: 0.68rem; color: var(--text-muted); margin-top: 6px;
  display: flex; justify-content: flex-end;
}
.msg-bubble-ai .msg-time { justify-content: flex-start; }

.typing-bubble { display: flex; gap: 4px; align-items: center; padding: 12px 18px; width: fit-content; }
.typing-dot { width: 5px; height: 5px; border-radius: 50%; background: #4a70a9; display: inline-block; animation: typing 1.2s infinite; }
.typing-dot:nth-child(2) { animation-delay: 0.2s; }
.typing-dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes typing { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }

.chat-input-area {
  padding: 20px 30px 30px;
  border-top: 1px solid var(--p-card-border);
  background: var(--p-primary);
}

.input-wrapper {
  display: flex; gap: 12px; align-items: flex-end;
  background: var(--p-surface); border: 1px solid var(--p-card-border); padding: 10px;
  transition: border-color 0.2s;
}

.input-wrapper:focus-within { border-color: rgba(74, 112, 169, 0.5); }

.chat-textarea {
  flex: 1; background: transparent; border: none; color: var(--p-light);
  font-size: 0.9rem; padding: 8px 10px; resize: none; outline: none;
  min-height: 40px; max-height: 200px;
}

.send-btn {
  background: #4a70a9; color: white; border: none; border-radius: 10px;
  width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.2s; flex-shrink: 0;
}

.send-btn:hover:not(:disabled) {
  background: #5a80b9;
  box-shadow: 0 0 15px rgba(74, 112, 169, 0.4);
  transform: translateY(-1px);
}

.send-btn:disabled { opacity: 0.3; cursor: not-allowed; }

.input-footer { margin-top: 10px; text-align: center; font-weight: 500; }
</style>
