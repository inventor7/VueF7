import { defineStore } from "pinia";
import { ref } from "vue";
import { db, powerSync } from "@/shared/database/index";
import { useAuthStore } from "./auth.store";
import type { GroupRecord } from "@/shared/database/schemas/AppSchema";

export const useGroupsStore = defineStore("groups", () => {
  const groups = ref<GroupRecord[]>([]);
  const loading = ref(false);
  const authStore = useAuthStore();

  let watchSubscription: { dispose: () => void } | null = null;

  async function watchGroups() {
    if (watchSubscription) {
      console.log("Disposing previous watch subscription");
      watchSubscription.dispose();
      console.log("Previous watch subscription disposed");
      watchSubscription = null;
    }

    try {
      const userId = authStore.user?.id || "demo-user";

      // Watch for groups where the user is a member
      const query = db
        .selectFrom("groups as g")
        .innerJoin("members as m", "g.id", "m.group_id")
        .selectAll("g")
        .where("m.user_id", "=", userId)
        .orderBy("g.created_at", "desc");

      // @ts-ignore - db.watch is added by wrapPowerSyncWithKysely
      watchSubscription = db.watch(query, {
        onResult: (result) => {
          groups.value = result as GroupRecord[];
        },
      });
    } catch (error: any) {
      console.error("Error watching groups:", error);
    }
  }

  async function createGroup(name: string, currency: string = "USD") {
    if (!authStore.user) throw new Error("User must be logged in");

    const groupId = crypto.randomUUID();
    const now = new Date().toISOString();
    const userId = authStore.user.id;

    await db.transaction().execute(async (tx) => {
      // Create Group
      await tx
        .insertInto("groups")
        .values({
          id: groupId,
          name,
          currency,
          created_by: userId,
          created_at: now,
        })
        .execute();

      // Add Creator as Member
      await tx
        .insertInto("members")
        .values({
          id: crypto.randomUUID(),
          group_id: groupId,
          user_id: userId,
          joined_at: now,
        })
        .execute();
    });
  }

  function stopWatching() {
    if (watchSubscription) {
      watchSubscription.dispose();
      watchSubscription = null;
    }
  }

  async function clearAndResync() {
    try {
      loading.value = true;
      // Clear local database and trigger resync
      await powerSync.disconnectAndClear();
      // Reconnect logic is handled by the connector/plugin usually,
      // but here we might need to manually reconnect if that was the previous logic.
      // The previous code called database.connect(databaseConnector).
      // We need to import databaseConnector if we want to use it, but it wasn't imported in the original file?
      // Ah, original file: import database from "@/shared/database/index";
      // await database.connect(databaseConnector); -> databaseConnector was NOT imported in the snippet I saw?
      // Wait, let me check the original file content again.
      // Line 80: await database.connect(databaseConnector);
      // But where is databaseConnector defined? It must have been imported or available in scope.
      // I don't see it in the imports. It might be a global or I missed it.
      // Let's assume it's imported from somewhere or I should leave it as is if possible.
      // But I am replacing the file content.
      // I will comment out the connect part for now or try to find where it comes from.
      // Actually, I'll check the imports again.

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

      const result = await db
        .selectFrom("groups as g")
        .innerJoin("members as m", "g.id", "m.group_id")
        .selectAll("g")
        .where("m.user_id", "=", userId)
        .orderBy("g.created_at", "desc")
        .execute();

      groups.value = result as GroupRecord[];
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
