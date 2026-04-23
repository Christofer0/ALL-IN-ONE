import { defineStore } from "pinia";
import { ref } from "vue";
import api from "@/utils/api";

export const useAuthStore = defineStore("auth", () => {
  const isAuthenticated = ref(false);
  const user = ref<any>(null);
  const loading = ref(false);

  async function login(credentials: { email: string; password: string }) {
    loading.value = true;
    try {
      const response = await api.post("/auth/login", credentials);
      isAuthenticated.value = true;
      user.value = response.data.user;
      return response.data;
    } catch (error) {
      isAuthenticated.value = false;
      user.value = null;
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function logout() {
    try {
      await api.post("/auth/logout");
    } finally {
      isAuthenticated.value = false;
      user.value = null;
    }
  }

  async function checkSession() {
    try {
      const response = await api.get("/auth/me");
      if (response.data.authenticated) {
        isAuthenticated.value = true;
        // In a real app, you might fetch user data here if /auth/me returns it
      } else {
        isAuthenticated.value = false;
        user.value = null;
      }
    } catch (error) {
      isAuthenticated.value = false;
      user.value = null;
    }
  }

  return {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
    checkSession,
  };
});
