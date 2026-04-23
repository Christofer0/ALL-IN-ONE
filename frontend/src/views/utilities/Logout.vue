<script setup lang="ts">
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { ROUTE_NAMES } from "@/router/constants";

const router = useRouter();
const authStore = useAuthStore();

onMounted(async () => {
  try {
    await authStore.logout();
  } catch (error) {
    console.error("Logout failed:", error);
  } finally {
    router.push({ name: ROUTE_NAMES.LOGIN });
  }
});
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-900">
    <div class="text-center">
      <div class="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p class="text-white/60 font-mono text-sm tracking-widest">LOGGING OUT...</p>
    </div>
  </div>
</template>

<style scoped>
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
