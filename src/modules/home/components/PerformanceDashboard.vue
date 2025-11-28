<template>
  <F7BlockTitle>Performance Dashboard</F7BlockTitle>
  <F7Block strong class="!rounded-2xl">
    <div
      class="grid grid-cols-1 md:grid-cols-2 gap-4"
      v-if="setupTimings.sqlite.schema || setupTimings.indexedDb.schema"
    >
      <div
        v-if="setupTimings.sqlite.schema || setupTimings.sqlite.insert"
        class="p-3 bg-green-50 rounded-lg border border-green-200"
      >
        <h3 class="font-bold text-green-600 mb-2">SQLite Performance</h3>
        <div class="space-y-1">
          <p v-if="setupTimings.sqlite.schema">
            <span class="font-semibold">Schema:</span>
            <span class="font-mono ml-2">{{ setupTimings.sqlite.schema }} ms</span>
          </p>
          <p v-if="setupTimings.sqlite.insert">
            <span class="font-semibold">Insert:</span>
            <span class="font-mono ml-2">{{ setupTimings.sqlite.insert }} ms</span>
          </p>
          <p v-if="performanceComparison.sqlite.schemaVsIndexedDB" class="mt-1">
            <span class="font-semibold">Schema vs IndexedDB:</span>
            <span
              :class="{
                'text-green-600': parseFloat(performanceComparison.sqlite.schemaVsIndexedDB) < 0,
                'text-red-600': parseFloat(performanceComparison.sqlite.schemaVsIndexedDB) > 0
              }"
              class="font-mono ml-2"
            >
              {{ performanceComparison.sqlite.schemaVsIndexedDB }}%
              {{ parseFloat(performanceComparison.sqlite.schemaVsIndexedDB) < 0 ? 'faster' : 'slower' }}
            </span>
          </p>
          <p v-if="performanceComparison.sqlite.insertVsIndexedDB">
            <span class="font-semibold">Insert vs IndexedDB:</span>
            <span
              :class="{
                'text-green-600': parseFloat(performanceComparison.sqlite.insertVsIndexedDB) < 0,
                'text-red-600': parseFloat(performanceComparison.sqlite.insertVsIndexedDB) > 0
              }"
              class="font-mono ml-2"
            >
              {{ performanceComparison.sqlite.insertVsIndexedDB }}%
              {{ parseFloat(performanceComparison.sqlite.insertVsIndexedDB) < 0 ? 'faster' : 'slower' }}
            </span>
          </p>
          <p v-if="performanceComparison.sqlite.insertedRowsVsIndexedDB" class="mt-1">
            <span class="font-semibold">Rows vs IndexedDB:</span>
            <span
              :class="{
                'text-green-600': parseFloat(performanceComparison.sqlite.insertedRowsVsIndexedDB) > 0,
                'text-red-600': parseFloat(performanceComparison.sqlite.insertedRowsVsIndexedDB) < 0
              }"
              class="font-mono ml-2"
            >
              {{ performanceComparison.sqlite.insertedRowsVsIndexedDB }}%
              {{ parseFloat(performanceComparison.sqlite.insertedRowsVsIndexedDB) > 0 ? 'more' : 'fewer' }} rows
            </span>
          </p>
        </div>
      </div>
      <div
        v-if="setupTimings.indexedDb.schema || setupTimings.indexedDb.insert"
        class="p-3 bg-red-50 rounded-lg border border-red-200"
      >
        <h3 class="font-bold text-red-600 mb-2">IndexedDB Performance</h3>
        <div class="space-y-1">
          <p v-if="setupTimings.indexedDb.schema">
            <span class="font-semibold">Schema:</span>
            <span class="font-mono ml-2">{{ setupTimings.indexedDb.schema }} ms</span>
          </p>
          <p v-if="setupTimings.indexedDb.insert">
            <span class="font-semibold">Insert:</span>
            <span class="font-mono ml-2">{{ setupTimings.indexedDb.insert }} ms</span>
          </p>
          <p v-if="performanceComparison.indexedDb.schemaVsSQLite" class="mt-1">
            <span class="font-semibold">Schema vs SQLite:</span>
            <span
              :class="{
                'text-green-600': parseFloat(performanceComparison.indexedDb.schemaVsSQLite) < 0,
                'text-red-600': parseFloat(performanceComparison.indexedDb.schemaVsSQLite) > 0
              }"
              class="font-mono ml-2"
            >
              {{ performanceComparison.indexedDb.schemaVsSQLite }}%
              {{ parseFloat(performanceComparison.indexedDb.schemaVsSQLite) < 0 ? 'faster' : 'slower' }}
            </span>
          </p>
          <p v-if="performanceComparison.indexedDb.insertVsSQLite">
            <span class="font-semibold">Insert vs SQLite:</span>
            <span
              :class="{
                'text-green-600': parseFloat(performanceComparison.indexedDb.insertVsSQLite) < 0,
                'text-red-600': parseFloat(performanceComparison.indexedDb.insertVsSQLite) > 0
              }"
              class="font-mono ml-2"
            >
              {{ performanceComparison.indexedDb.insertVsSQLite }}%
              {{ parseFloat(performanceComparison.indexedDb.insertVsSQLite) < 0 ? 'faster' : 'slower' }}
            </span>
          </p>
          <p v-if="performanceComparison.indexedDb.insertedRowsVsSQLite" class="mt-1">
            <span class="font-semibold">Rows vs SQLite:</span>
            <span
              :class="{
                'text-green-600': parseFloat(performanceComparison.indexedDb.insertedRowsVsSQLite) > 0,
                'text-red-600': parseFloat(performanceComparison.indexedDb.insertedRowsVsSQLite) < 0
              }"
              class="font-mono ml-2"
            >
              {{ performanceComparison.indexedDb.insertedRowsVsSQLite }}%
              {{ parseFloat(performanceComparison.indexedDb.insertedRowsVsSQLite) > 0 ? 'more' : 'fewer' }} rows
            </span>
          </p>
        </div>
      </div>
    </div>

    <!-- Row count comparison -->
    <div
      class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4"
      v-if="insertedRows.sqlite || insertedRows.indexedDb"
    >
      <div class="text-center p-3 bg-green-50 rounded-lg border border-green-200">
        <p class="font-bold text-green-600">SQLite Rows Inserted</p>
        <p class="font-mono text-xl">{{ insertedRows.sqlite.toLocaleString() }}</p>
      </div>
      <div class="text-center p-3 bg-red-50 rounded-lg border border-red-200">
        <p class="font-bold text-red-600">IndexedDB Rows Inserted</p>
        <p class="font-mono text-xl">{{ insertedRows.indexedDb.toLocaleString() }}</p>
      </div>
    </div>
  </F7Block>
</template>

<script setup lang="ts">
// Props to receive shared state
interface Props {
  setupTimings: {
    sqlite: {
      schema: string | null;
      insert: string | null;
    };
    indexedDb: {
      schema: string | null;
      insert: string | null;
    };
  };
  insertedRows: {
    sqlite: number;
    indexedDb: number;
  };
  performanceComparison: {
    sqlite: {
      schemaVsIndexedDB: string | null;
      insertVsIndexedDB: string | null;
      insertedRowsVsIndexedDB: string | null;
    };
    indexedDb: {
      schemaVsSQLite: string | null;
      insertVsSQLite: string | null;
      insertedRowsVsSQLite: string | null;
    };
  };
}

const props = defineProps<Props>();
</script>
