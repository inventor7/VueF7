import { defineStore } from "pinia";
import { ref } from "vue";
import { useAuthStore } from "./auth.stores";
import { db, powerSync } from "@/shared/services/database/index";

// NOTE: This store is for FairShare app, not the benchmark
// Commented out since we're using the benchmark schema
export const useGroupsStore = defineStore("groups", () => {
  const groups = ref<any[]>([]);
  const loading = ref(false);

  async function watchGroups() {
    // No-op - benchmark doesn't use this
  }

  async function createGroup(name: string, currency: string = "USD") {
    // No-op - benchmark doesn't use this
  }

  function stopWatching() {
    // No-op
  }

  async function clearAndResync() {
    try {
      loading.value = true;
      await powerSync.disconnectAndClear();
    } catch (error) {
      console.error("Error clearing and resyncing:", error);
    } finally {
      loading.value = false;
    }
  }

  async function refreshGroups() {
    // No-op - benchmark doesn't use this
  }

  return {
    groups,
    loading,
    watchGroups,
    stopWatching,
    createGroup,
    clearAndResync,
    refreshGroups,
  };
});
