<script setup lang="ts">
import { ref } from "vue";
import Sidebar from "@/components/private/Sidebar.vue";
import Navbar from "@/components/private/Navbar.vue";

const isSidebarOpen = ref(false);

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};
</script>

<template>
  <div class="private">
    <Sidebar :isOpen="isSidebarOpen" />

    <div class="main-content">
      <Navbar @toggleSidebar="toggleSidebar" />
      <router-view />
    </div>
  </div>
</template>
