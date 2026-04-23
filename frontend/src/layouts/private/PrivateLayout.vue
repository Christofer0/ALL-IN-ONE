<script setup lang="ts">
import { ref, onMounted } from "vue";
import Sidebar from "@/components/private/Sidebar.vue";
import Navbar from "@/components/private/Navbar.vue";
import { applyTheme } from "@/utils/theme";

const isSidebarOpen = ref(false);

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

onMounted(() => {
  const saved = localStorage.getItem("publicAppearance");
  if (saved) {
    applyTheme(JSON.parse(saved));
  }
});
</script>

<template>
  <div class="private">
    <Sidebar :isOpen="isSidebarOpen" />

    <div class="main-content">
      <!-- Overlay for mobile sidebar -->
      <div
        v-if="isSidebarOpen"
        class="fixed inset-0 bg-black/50 z-30 lg:hidden"
        @click="toggleSidebar"
      ></div>

      <Navbar @toggleSidebar="toggleSidebar" />
      <router-view />
    </div>
  </div>
</template>
