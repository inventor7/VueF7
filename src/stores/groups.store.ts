import { defineStore } from "pinia";
import { ref } from "vue";
import database from "@/shared/database/index";
import type { GroupRecord } from "@/shared/database/schemas/AppSchema";
import { useAuthStore } from "./auth.store";
import type { Transaction } from "@powersync/web";

export const useGroupsStore = defineStore("groups", () => {
  const groups = ref<GroupRecord[]>([]);
  const loading = ref(false);
  const authStore = useAuthStore();

  let watchAbort: AbortController | null = null;

  async function watchGroups() {
    if (watchAbort) watchAbort.abort();
    watchAbort = new AbortController();

    try {
      // Watch for groups where the user is a member
      const query = `
        SELECT g.* 
        FROM groups g
        INNER JOIN members m ON g.id = m.group_id
        WHERE m.user_id = ?
        ORDER BY g.created_at DESC
      `;

      const userId = authStore.user?.id || "demo-user";

      for await (const result of database.watch(query, [userId], {
        signal: watchAbort.signal,
      })) {
        // Convert SQLite result to plain array for Vue reactivity
        groups.value = Array.from(
          result.rows?._array || result.rows || []
        ) as GroupRecord[];
      }
    } catch (error: any) {
      if (error.name !== "AbortError") {
        console.error("Error watching groups:", error);
      }
    }
  }

  async function createGroup(name: string, currency: string = "USD") {
    if (!authStore.user) throw new Error("User must be logged in");

    const groupId = crypto.randomUUID();
    const now = new Date().toISOString();
    const userId = authStore.user.id;

    await database.writeTransaction(async (tx: Transaction) => {
      // Create Group
      await tx.execute(
        "INSERT INTO groups (id, name, currency, created_by, created_at) VALUES (?, ?, ?, ?, ?)",
        [groupId, name, currency, userId, now]
      );

      // Add Creator as Member
      await tx.execute(
        "INSERT INTO members (id, group_id, user_id, joined_at) VALUES (?, ?, ?, ?)",
        [crypto.randomUUID(), groupId, userId, now]
      );
    });
  }

  function stopWatching() {
    if (watchAbort) {
      watchAbort.abort();
      watchAbort = null;
    }
  }

  async function clearAndResync() {
    try {
      loading.value = true;
      // Clear local database and trigger resync
      await database.disconnectAndClear();
      await database.connect(databaseConnector);

      // Restart watching after reconnect
      await watchGroups();
    } catch (error) {
      console.error("Error clearing and resyncing:", error);
    } finally {
      loading.value = false;
    }
  }

  async function refreshGroups() {
    loading.value = true;
    try {
      const userId = authStore.user?.id || "demo-user";
      const result = await database.execute(
        `
        SELECT g.* 
        FROM groups g
        INNER JOIN members m ON g.id = m.group_id
        WHERE m.user_id = ?
        ORDER BY g.created_at DESC
      `,
        [userId]
      );

      groups.value = Array.from(
        result.rows?._array || result.rows || []
      ) as GroupRecord[];
    } catch (error) {
      console.error("Error refreshing groups:", error);
    } finally {
      loading.value = false;
    }
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
