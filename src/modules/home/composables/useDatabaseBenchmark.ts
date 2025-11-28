import { ref, reactive } from 'vue';

// Define types
type Benchmark = {
  sqlite: {
    time: string | null;
    data: any;
  };
  indexedDb: {
    time: string | null;
    data: any;
  };
};

type SetupTimings = {
  sqlite: {
    schema: string | null;
    insert: string | null;
  };
  indexedDb: {
    schema: string | null;
    insert: string | null;
  };
};

type InsertedRows = {
  sqlite: number;
  indexedDb: number;
};

type PerformanceComparison = {
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

// Create a composable to manage shared state
export function useDatabaseBenchmarkState() {
  // State variables
  const benchmarkResults = ref<Benchmark>({
    sqlite: { time: null, data: undefined },
    indexedDb: { time: null, data: undefined },
  });

  const isSetupComplete = ref(false);
  const isSchemaCreated = ref(false);
  const isSettingUpSQLite = ref(false);
  const isSettingUpIndexedDB = ref(false);
  const isInsertingDataSQLite = ref(false);
  const isInsertingDataIndexedDB = ref(false);
  const isBenchmarking = ref(false);
  const isClearingSQLite = ref(false);
  const isClearingIndexedDB = ref(false);
  const setupMessage = ref("");

  const setupTimings = ref<SetupTimings>({
    sqlite: {
      schema: null,
      insert: null,
    },
    indexedDb: {
      schema: null,
      insert: null,
    },
  });

  // Track row counts
  const insertedRows = ref<InsertedRows>({
    sqlite: 0,
    indexedDb: 0,
  });

  // Track performance comparison
  const performanceComparison = ref<PerformanceComparison>({
    sqlite: {
      schemaVsIndexedDB: null,
      insertVsIndexedDB: null,
      insertedRowsVsIndexedDB: null,
    },
    indexedDb: {
      schemaVsSQLite: null,
      insertVsSQLite: null,
      insertedRowsVsSQLite: null,
    },
  });

  // Reset all state to initial values
  const resetState = () => {
    isSetupComplete.value = false;
    isSchemaCreated.value = false;
    isSettingUpSQLite.value = false;
    isSettingUpIndexedDB.value = false;
    isInsertingDataSQLite.value = false;
    isInsertingDataIndexedDB.value = false;
    isBenchmarking.value = false;
    isClearingSQLite.value = false;
    isClearingIndexedDB.value = false;
    setupMessage.value = "";

    setupTimings.value = {
      sqlite: {
        schema: null,
        insert: null,
      },
      indexedDb: {
        schema: null,
        insert: null,
      },
    };

    insertedRows.value = {
      sqlite: 0,
      indexedDb: 0,
    };

    performanceComparison.value = {
      sqlite: {
        schemaVsIndexedDB: null,
        insertVsIndexedDB: null,
        insertedRowsVsIndexedDB: null,
      },
      indexedDb: {
        schemaVsSQLite: null,
        insertVsSQLite: null,
        insertedRowsVsSQLite: null,
      },
    };

    benchmarkResults.value = {
      sqlite: { time: null, data: undefined },
      indexedDb: { time: null, data: undefined },
    };
  };

  return {
    benchmarkResults,
    isSetupComplete,
    isSchemaCreated,
    isSettingUpSQLite,
    isSettingUpIndexedDB,
    isInsertingDataSQLite,
    isInsertingDataIndexedDB,
    isBenchmarking,
    isClearingSQLite,
    isClearingIndexedDB,
    setupMessage,
    setupTimings,
    insertedRows,
    performanceComparison,
    resetState
  };
}
