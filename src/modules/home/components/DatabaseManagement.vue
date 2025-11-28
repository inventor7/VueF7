<template>
    <F7BlockTitle>Database Management</F7BlockTitle>
    <F7Block strong class="!rounded-2xl">
        <p>Clear databases if you want to reset the benchmark:</p>
        <div class="grid grid-cols-2 gap-4 mt-4">
            <F7Button
                fill
                color="red"
                @click="clearSQLite"
                :loading="isClearingSQLite"
                >Clear SQLite</F7Button
            >
            <F7Button
                fill
                color="red"
                @click="clearIndexedDB"
                :loading="isClearingIndexedDB"
                >Clear IndexedDB</F7Button
            >
        </div>
        <div v-if="setupMessage" class="mt-4 text-center text-gray-500">
            {{ setupMessage }}
        </div>
    </F7Block>
</template>

<script setup lang="ts">
import { powerSync } from "@/shared/services/database";

// Props to receive shared state
interface Props {
    isClearingSQLite: boolean;
    isClearingIndexedDB: boolean;
    setupMessage: string;
}

const props = defineProps<Props>();

// Emit events for state changes
const emit = defineEmits([
    "update:is-clearing-sqlite",
    "update:is-clearing-indexeddb",
    "update:setup-message",
    "update:is-setup-complete",
    "update:is-schema-created",
    "clear-complete",
]);

// --- Database Connections ---
// We need to get the connection from the parent component or window since it's created in other components

// Clear SQLite database
async function clearSQLite() {
    emit("update:is-clearing-sqlite", true);
    emit("update:setup-message", "Clearing SQLite database...");
    try {
        // Delete all data from tables
        emit("update:setup-message", "Deleting data from all tables...");
        await db.deleteFrom("order_details").execute();
        await db.deleteFrom("orders").execute();
        await db.deleteFrom("products").execute();
        await db.deleteFrom("customers").execute();
        await db.deleteFrom("countries").execute();
        await db.deleteFrom("regions").execute();

        // Drop all tables
        emit("update:setup-message", "Dropping all tables...");
        await db.schema.dropTable("order_details").ifExists().execute();
        await db.schema.dropTable("orders").ifExists().execute();
        await db.schema.dropTable("products").ifExists().execute();
        await db.schema.dropTable("customers").ifExists().execute();
        await db.schema.dropTable("countries").ifExists().execute();
        await db.schema.dropTable("regions").ifExists().execute();

        // Completely wipe the OPFS database
        emit("update:setup-message", "Deleting entire OPFS database...");
        // await powerSync.disconnectAndClear();
        await purgeVFS();

        // Re-initialize for future use
        emit("update:setup-message", "Reinitializing PowerSync...");
        await powerSync.init();

        // After clearing, the setup is no longer considered complete
        emit("update:is-setup-complete", false);
        emit("update:is-schema-created", false);
        emit(
            "update:setup-message",
            "SQLite database completely deleted and reinitialized.",
        );
        emit("clear-complete");
    } catch (err: any) {
        console.error("Error clearing SQLite:", err);
        emit(
            "update:setup-message",
            `Error clearing SQLite: ${err.message ?? err}`,
        );
    } finally {
        emit("update:is-clearing-sqlite", false);
    }
}

// Clear IndexedDB database
async function clearIndexedDB() {
    emit("update:is-clearing-indexeddb", true);
    emit("update:setup-message", "Clearing IndexedDB database...");

    return new Promise((resolve, reject) => {
        // First, try to delete the database directly (this handles closing any existing connections)
        const deleteRequest = window.indexedDB.deleteDatabase("benchmarkIDB");

        deleteRequest.onsuccess = () => {
            emit("update:setup-message", "IndexedDB database cleared.");
            emit("update:is-setup-complete", false);
            emit("update:is-schema-created", false);
            emit("clear-complete");
            emit("update:is-clearing-indexeddb", false);
            resolve(true);
        };

        deleteRequest.onerror = (event) => {
            console.error("Error clearing IndexedDB:", deleteRequest.error);
            emit(
                "update:setup-message",
                `Error clearing IndexedDB: ${deleteRequest.error}`,
            );
            emit("update:is-clearing-indexeddb", false);
            reject(deleteRequest.error);
        };

        deleteRequest.onblocked = (event) => {
            console.warn("IndexedDB deletion was blocked.");
            emit(
                "update:setup-message",
                "Cannot clear IndexedDB. Please close any other tabs that may be using it.",
            );
            emit("update:is-clearing-indexeddb", false);
            reject("IndexedDB deletion blocked by an open connection.");
        };
    });
}

// Clear all OPFS storage
async function purgeVFS() {
    await powerSync.disconnect();
    await powerSync.close();

    const root = (await navigator.storage.getDirectory()) as any;
    await new Promise((resolve) => setTimeout(resolve, 100)); // Allow .db-wal to become deletable

    for await (const [name, entry] of root.entries!()) {
        try {
            if (entry.kind === "file") {
                await root.removeEntry(name);
            } else if (entry.kind === "directory") {
                await root.removeEntry(name, { recursive: true });
            }
        } catch (err) {
            console.error(`Failed to delete ${entry.kind}: ${name}`, err);
        }
    }
}
</script>
