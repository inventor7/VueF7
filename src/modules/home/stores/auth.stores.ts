import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useAuthStore = defineStore(
  "auth",
  () => {
    // Mock session/user
    const mockUser = {
      id: "local-user",
      email: "local@example.com",
      user_metadata: {
        full_name: "Local User",
      },
    };

    const session = ref<any>({
      user: mockUser,
      access_token: "mock-token",
    });

    const user = computed(() => session.value?.user ?? null);
    const isAuthenticated = computed(() => !!session.value);
    const loading = ref(false);
    const error = ref<string | null>(null);

    async function init() {
      // No-op for local auth
      loading.value = false;
    }

    async function login(email: string, password: string) {
      loading.value = true;
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      session.value = {
        user: mockUser,
        access_token: "mock-token",
      };
      loading.value = false;
    }

    async function register(email: string, password: string, fullName: string) {
      loading.value = true;
      await new Promise((resolve) => setTimeout(resolve, 500));
      session.value = {
        user: mockUser,
        access_token: "mock-token",
      };
      loading.value = false;
    }

    async function resetPassword(email: string) {
      loading.value = true;
      await new Promise((resolve) => setTimeout(resolve, 500));
      loading.value = false;
    }

    async function logout() {
      loading.value = true;
      await new Promise((resolve) => setTimeout(resolve, 500));
      session.value = null;
      loading.value = false;
    }

    return {
      session,
      user,
      isAuthenticated,
      loading,
      error,
      init,
      login,
      register,
      resetPassword,
      logout,
    };
  },
  {
    persist: true,
  }
);
