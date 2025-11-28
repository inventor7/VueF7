<template>
    <F7Page>
        <F7Navbar
            transparent
            :sliding="true"
            large
            title="Performance Benchmark"
            class="!rounded-b-2xl"
        >
        </F7Navbar>

        <F7BlockTitle>Database Setup</F7BlockTitle>
        <F7Block strong class="!rounded-2xl">
            <p>
                First, set up the databases. This will create a complex schema
                of 10+ tables and populate them with thousands of records. This
                step may take a moment.
            </p>
            <div class="grid grid-cols-2 gap-4 mb-4">
                <F7Button fill @click="setupSQLite" :loading="isSettingUpSQLite"
                    >Setup SQLite Schema</F7Button
                >
                <F7Button
                    fill
                    @click="setupIndexedDB"
                    :loading="isSettingUpIndexedDB"
                    >Setup IndexedDB Schema</F7Button
                >
            </div>
            <div
                v-if="isSchemaCreated"
                class="grid grid-cols-2 gap-4 mb-4 mt-4"
            >
                <F7Button
                    fill
                    @click="insertSQLiteData"
                    :loading="isInsertingDataSQLite"
                    :disabled="!isSchemaCreated"
                    >Insert SQLite Data</F7Button
                >
                <F7Button
                    fill
                    @click="insertIndexedDBData"
                    :loading="isInsertingDataIndexedDB"
                    :disabled="!isSchemaCreated"
                    >Insert IndexedDB Data</F7Button
                >
            </div>
            <div v-if="setupMessage" class="mt-4 text-center text-gray-500">
                {{ setupMessage }}
            </div>
            <div
                class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4"
                v-if="
                    setupTimings.sqlite.schema || setupTimings.indexedDb.schema
                "
            >
                <div
                    v-if="
                        setupTimings.sqlite.schema || setupTimings.sqlite.insert
                    "
                    class="p-3 bg-green-50 rounded-lg border border-green-200"
                >
                    <h3 class="font-bold text-green-600 mb-2">
                        SQLite Performance
                    </h3>
                    <div class="space-y-1">
                        <p v-if="setupTimings.sqlite.schema">
                            <span class="font-semibold">Schema:</span>
                            <span class="font-mono ml-2"
                                >{{ setupTimings.sqlite.schema }} ms</span
                            >
                        </p>
                        <p v-if="setupTimings.sqlite.insert">
                            <span class="font-semibold">Insert:</span>
                            <span class="font-mono ml-2"
                                >{{ setupTimings.sqlite.insert }} ms</span
                            >
                        </p>
                        <p
                            v-if="
                                performanceComparison.sqlite.schemaVsIndexedDB
                            "
                            class="mt-1"
                        >
                            <span class="font-semibold"
                                >Schema vs IndexedDB:</span
                            >
                            <span
                                :class="{
                                    'text-green-600':
                                        parseFloat(
                                            performanceComparison.sqlite
                                                .schemaVsIndexedDB,
                                        ) < 0,
                                    'text-red-600':
                                        parseFloat(
                                            performanceComparison.sqlite
                                                .schemaVsIndexedDB,
                                        ) > 0,
                                }"
                                class="font-mono ml-2"
                            >
                                {{
                                    performanceComparison.sqlite
                                        .schemaVsIndexedDB
                                }}%
                                {{
                                    parseFloat(
                                        performanceComparison.sqlite
                                            .schemaVsIndexedDB,
                                    ) < 0
                                        ? "faster"
                                        : "slower"
                                }}
                            </span>
                        </p>
                        <p
                            v-if="
                                performanceComparison.sqlite.insertVsIndexedDB
                            "
                        >
                            <span class="font-semibold"
                                >Insert vs IndexedDB:</span
                            >
                            <span
                                :class="{
                                    'text-green-600':
                                        parseFloat(
                                            performanceComparison.sqlite
                                                .insertVsIndexedDB,
                                        ) < 0,
                                    'text-red-600':
                                        parseFloat(
                                            performanceComparison.sqlite
                                                .insertVsIndexedDB,
                                        ) > 0,
                                }"
                                class="font-mono ml-2"
                            >
                                {{
                                    performanceComparison.sqlite
                                        .insertVsIndexedDB
                                }}%
                                {{
                                    parseFloat(
                                        performanceComparison.sqlite
                                            .insertVsIndexedDB,
                                    ) < 0
                                        ? "faster"
                                        : "slower"
                                }}
                            </span>
                        </p>
                        <p
                            v-if="
                                performanceComparison.sqlite
                                    .insertedRowsVsIndexedDB
                            "
                            class="mt-1"
                        >
                            <span class="font-semibold"
                                >Rows vs IndexedDB:</span
                            >
                            <span
                                :class="{
                                    'text-green-600':
                                        parseFloat(
                                            performanceComparison.sqlite
                                                .insertedRowsVsIndexedDB,
                                        ) > 0,
                                    'text-red-600':
                                        parseFloat(
                                            performanceComparison.sqlite
                                                .insertedRowsVsIndexedDB,
                                        ) < 0,
                                }"
                                class="font-mono ml-2"
                            >
                                {{
                                    performanceComparison.sqlite
                                        .insertedRowsVsIndexedDB
                                }}%
                                {{
                                    parseFloat(
                                        performanceComparison.sqlite
                                            .insertedRowsVsIndexedDB,
                                    ) > 0
                                        ? "more"
                                        : "fewer"
                                }}
                                rows
                            </span>
                        </p>
                    </div>
                </div>
                <div
                    v-if="
                        setupTimings.indexedDb.schema ||
                        setupTimings.indexedDb.insert
                    "
                    class="p-3 bg-red-50 rounded-lg border border-red-200"
                >
                    <h3 class="font-bold text-red-600 mb-2">
                        IndexedDB Performance
                    </h3>
                    <div class="space-y-1">
                        <p v-if="setupTimings.indexedDb.schema">
                            <span class="font-semibold">Schema:</span>
                            <span class="font-mono ml-2"
                                >{{ setupTimings.indexedDb.schema }} ms</span
                            >
                        </p>
                        <p v-if="setupTimings.indexedDb.insert">
                            <span class="font-semibold">Insert:</span>
                            <span class="font-mono ml-2"
                                >{{ setupTimings.indexedDb.insert }} ms</span
                            >
                        </p>
                        <p
                            v-if="
                                performanceComparison.indexedDb.schemaVsSQLite
                            "
                            class="mt-1"
                        >
                            <span class="font-semibold">Schema vs SQLite:</span>
                            <span
                                :class="{
                                    'text-green-600':
                                        parseFloat(
                                            performanceComparison.indexedDb
                                                .schemaVsSQLite,
                                        ) < 0,
                                    'text-red-600':
                                        parseFloat(
                                            performanceComparison.indexedDb
                                                .schemaVsSQLite,
                                        ) > 0,
                                }"
                                class="font-mono ml-2"
                            >
                                {{
                                    performanceComparison.indexedDb
                                        .schemaVsSQLite
                                }}%
                                {{
                                    parseFloat(
                                        performanceComparison.indexedDb
                                            .schemaVsSQLite,
                                    ) < 0
                                        ? "faster"
                                        : "slower"
                                }}
                            </span>
                        </p>
                        <p
                            v-if="
                                performanceComparison.indexedDb.insertVsSQLite
                            "
                        >
                            <span class="font-semibold">Insert vs SQLite:</span>
                            <span
                                :class="{
                                    'text-green-600':
                                        parseFloat(
                                            performanceComparison.indexedDb
                                                .insertVsSQLite,
                                        ) < 0,
                                    'text-red-600':
                                        parseFloat(
                                            performanceComparison.indexedDb
                                                .insertVsSQLite,
                                        ) > 0,
                                }"
                                class="font-mono ml-2"
                            >
                                {{
                                    performanceComparison.indexedDb
                                        .insertVsSQLite
                                }}%
                                {{
                                    parseFloat(
                                        performanceComparison.indexedDb
                                            .insertVsSQLite,
                                    ) < 0
                                        ? "faster"
                                        : "slower"
                                }}
                            </span>
                        </p>
                        <p
                            v-if="
                                performanceComparison.indexedDb
                                    .insertedRowsVsSQLite
                            "
                            class="mt-1"
                        >
                            <span class="font-semibold">Rows vs SQLite:</span>
                            <span
                                :class="{
                                    'text-green-600':
                                        parseFloat(
                                            performanceComparison.indexedDb
                                                .insertedRowsVsSQLite,
                                        ) > 0,
                                    'text-red-600':
                                        parseFloat(
                                            performanceComparison.indexedDb
                                                .insertedRowsVsSQLite,
                                        ) < 0,
                                }"
                                class="font-mono ml-2"
                            >
                                {{
                                    performanceComparison.indexedDb
                                        .insertedRowsVsSQLite
                                }}%
                                {{
                                    parseFloat(
                                        performanceComparison.indexedDb
                                            .insertedRowsVsSQLite,
                                    ) > 0
                                        ? "more"
                                        : "fewer"
                                }}
                                rows
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
                <div
                    class="text-center p-3 bg-green-50 rounded-lg border border-green-200"
                >
                    <p class="font-bold text-green-600">SQLite Rows Inserted</p>
                    <p class="font-mono text-xl">
                        {{ insertedRows.sqlite.toLocaleString() }}
                    </p>
                </div>
                <div
                    class="text-center p-3 bg-red-50 rounded-lg border border-red-200"
                >
                    <p class="font-bold text-red-600">
                        IndexedDB Rows Inserted
                    </p>
                    <p class="font-mono text-xl">
                        {{ insertedRows.indexedDb.toLocaleString() }}
                    </p>
                </div>
            </div>
        </F7Block>

        <F7BlockTitle>Run Benchmark</F7BlockTitle>
        <F7Block strong class="!rounded-2xl">
            <p>
                Now, run the benchmark. This executes a complex query to find
                the top 5 customers by total sales value in a specific region.
                The time taken for each database will be displayed below.
            </p>
            <F7Button
                large
                fill
                @click="runBenchmarks"
                :loading="isBenchmarking"
                :disabled="!isSetupComplete"
            >
                Run Complex Query Benchmark
            </F7Button>
        </F7Block>

        <F7BlockTitle>Benchmark Results</F7BlockTitle>
        <F7Block strong class="!rounded-2xl">
            <div
                v-if="
                    benchmarkResults.sqlite.time !== null ||
                    benchmarkResults.indexedDb.time !== null
                "
                class="space-y-4"
            >
                <div>
                    <h3 class="text-xl font-bold text-green-600">
                        SQLite Result
                    </h3>
                    <p>
                        Execution Time:
                        <span class="font-mono p-1 bg-gray-200 rounded"
                            >{{ benchmarkResults.sqlite.time }} ms</span
                        >
                    </p>
                    <pre
                        class="mt-2 p-2 bg-gray-100 rounded-lg overflow-auto text-xs"
                    ><code>{{ benchmarkResults.sqlite.data }}</code></pre>
                </div>
                <hr />
                <div>
                    <h3 class="text-xl font-bold text-red-600">
                        IndexedDB Result
                    </h3>
                    <p>
                        Execution Time:
                        <span class="font-mono p-1 bg-gray-200 rounded"
                            >{{ benchmarkResults.indexedDb.time }} ms</span
                        >
                    </p>
                    <pre
                        class="mt-2 p-2 bg-gray-10 rounded-lg overflow-auto text-xs"
                    ><code>{{ benchmarkResults.indexedDb.data }}</code></pre>
                </div>
            </div>
            <div v-else class="text-center text-gray-500">
                Results will be displayed here.
            </div>
        </F7Block>

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
        </F7Block>
    </F7Page>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Capacitor } from "@capacitor/core";
import { sql } from "kysely";
import { db, powerSync } from "@/shared/services/database";

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

const benchmarkResults = ref<Benchmark>({
    sqlite: { time: null, data: undefined },
    indexedDb: { time: null, data: undefined },
});

const isSetupComplete = ref(false);
const isSchemaCreated = ref(false); // New state for tracking schema creation
const isSettingUpSQLite = ref(false);
const isSettingUpIndexedDB = ref(false);
const isInsertingDataSQLite = ref(false); // New state for tracking data insertion
const isInsertingDataIndexedDB = ref(false); // New state for tracking data insertion
const isBenchmarking = ref(false);
const isClearingSQLite = ref(false);
const isClearingIndexedDB = ref(false);
const setupMessage = ref("");

const setupTimings = ref({
    sqlite: {
        schema: null as string | null,
        insert: null as string | null,
    },
    indexedDb: {
        schema: null as string | null,
        insert: null as string | null,
    },
});

// Track row counts
const insertedRows = ref({
    sqlite: 0,
    indexedDb: 0,
});

// Track performance comparison
const performanceComparison = ref({
    sqlite: {
        schemaVsIndexedDB: null as string | null, // +X% or -X% better/worse
        insertVsIndexedDB: null as string | null,
        insertedRowsVsIndexedDB: null as string | null,
    },
    indexedDb: {
        schemaVsSQLite: null as string | null,
        insertVsSQLite: null as string | null,
        insertedRowsVsSQLite: null as string | null,
    },
});

// --- Database Connections ---
let idbConnection: IDBDatabase;

const NUM_REGIONS = 5;
const NUM_COUNTRIES_PER_REGION = 10;
const NUM_CUSTOMERS_PER_COUNTRY = 20;
const NUM_ORDERS_PER_CUSTOMER = 15;
const NUM_PRODUCTS = 10000;
const NUM_DETAILS_PER_ORDER = 3;

// --- SQLite Schema Creation ---
async function setupSQLite() {
    if (isSettingUpSQLite.value) return;
    isSettingUpSQLite.value = true;
    setupMessage.value = "Setting up SQLite...";
    const startTime = performance.now();

    try {
        // Completely wipe the existing OPFS database
        setupMessage.value = "Deleting existing OPFS database...";
        //await powerSync.disconnectAndClear();

        // Re-initialize PowerSync Database
        setupMessage.value = "Initializing fresh PowerSync database...";
        await powerSync.init();

        // Create tables with both id (UUID) and integer columns - in a transaction
        setupMessage.value = "Creating database schema...";
        const schemaStartTime = performance.now();

        await powerSync.writeTransaction(async (tx) => {
            await tx.execute(`
        CREATE TABLE regions (
          id TEXT PRIMARY KEY,
          region_id INTEGER NOT NULL,
          region_name TEXT
        )
      `);
            await tx.execute(`
        CREATE TABLE countries (
          id TEXT PRIMARY KEY,
          country_id INTEGER NOT NULL,
          country_name TEXT,
          region_id INTEGER
        )
      `);
            await tx.execute(`
        CREATE TABLE customers (
          id TEXT PRIMARY KEY,
          customer_id INTEGER NOT NULL,
          customer_name TEXT,
          email TEXT,
          country_id INTEGER
        )
      `);
            await tx.execute(`
        CREATE TABLE orders (
          id TEXT PRIMARY KEY,
          order_id INTEGER NOT NULL,
          order_date TEXT,
          customer_id INTEGER,
          amount REAL
        )
      `);
            await tx.execute(`
        CREATE TABLE products (
          id TEXT PRIMARY KEY,
          product_id INTEGER NOT NULL,
          product_name TEXT,
          unit_price REAL
        )
      `);
            await tx.execute(`
        CREATE TABLE order_details (
          id TEXT PRIMARY KEY,
          order_detail_id INTEGER,
          order_id INTEGER,
          product_id INTEGER,
          quantity INTEGER
        )
      `);
        });

        const schemaEndTime = performance.now();
        const schemaTime = (schemaEndTime - schemaStartTime).toFixed(2);
        setupTimings.value.sqlite.schema = schemaTime;
        setupMessage.value = `SQLite schema created in ${schemaTime}ms. Tables ready! Click 'Insert Data' to populate.`;
        isSchemaCreated.value = true;
    } catch (err: any) {
        console.error("SQLite schema creation error:", err);
        setupMessage.value = `Error: ${err.message ?? err}`;
    } finally {
        isSettingUpSQLite.value = false;
    }
}

// --- SQLite Data Insertion ---
async function insertSQLiteData() {
    if (isInsertingDataSQLite.value) return;
    isInsertingDataSQLite.value = true;
    setupMessage.value = "Inserting data into SQLite...";
    const startTime = performance.now();

    try {
        // --- Data Generation & Insertion (Using Kysely Batch Inserts) ---
        setupMessage.value = "Generating data...";

        await powerSync.writeTransaction(async (tx) => {
            // Regions - small dataset, insert directly
            const regions = [];
            for (let i = 1; i <= NUM_REGIONS; i++) {
                regions.push({
                    id: crypto.randomUUID(),
                    region_id: i,
                    region_name: `Region ${i}`,
                });
            }
            await tx.execute(
                `INSERT INTO regions (id, region_id, region_name) VALUES ${regions
                    .map(() => "(?, ?, ?)")
                    .join(", ")}`,
                regions.flatMap((r) => [r.id, r.region_id, r.region_name]),
            );

            // Countries
            const countries = [];
            let countryIdCounter = 1;
            for (let i = 1; i <= NUM_REGIONS; i++) {
                for (let j = 1; j <= NUM_COUNTRIES_PER_REGION; j++) {
                    countries.push({
                        id: crypto.randomUUID(),
                        country_id: countryIdCounter++,
                        country_name: `Country ${j} of Region ${i}`,
                        region_id: i,
                    });
                }
            }
            await tx.execute(
                `INSERT INTO countries (id, country_id, country_name, region_id) VALUES ${countries
                    .map(() => "(?, ?, ?, ?)")
                    .join(", ")}`,
                countries.flatMap((c) => [
                    c.id,
                    c.country_id,
                    c.country_name,
                    c.region_id,
                ]),
            );

            // Customers - use chunking for large datasets
            const customers = [];
            let customerIdCounter = 1;
            for (let i = 1; i < countryIdCounter; i++) {
                for (let k = 1; k <= NUM_CUSTOMERS_PER_COUNTRY; k++) {
                    customers.push({
                        id: crypto.randomUUID(),
                        customer_id: customerIdCounter++,
                        customer_name: `Customer ${k} of Country ${i}`,
                        email: `customer${customerIdCounter}@example.com`,
                        country_id: i,
                    });
                }
            }

            // Insert in chunks to avoid hitting SQL parameter limits
            const chunkSize = 500;
            for (let i = 0; i < customers.length; i += chunkSize) {
                const chunk = customers.slice(i, i + chunkSize);
                await tx.execute(
                    `INSERT INTO customers (id, customer_id, customer_name, email, country_id) VALUES ${chunk
                        .map(() => "(?, ?, ?, ?, ?)")
                        .join(", ")}`,
                    chunk.flatMap((c) => [
                        c.id,
                        c.customer_id,
                        c.customer_name,
                        c.email,
                        c.country_id,
                    ]),
                );
            }

            // Products
            setupMessage.value = "Inserting products...";
            const products = [];
            for (let i = 1; i <= NUM_PRODUCTS; i++) {
                products.push({
                    id: crypto.randomUUID(),
                    product_id: i,
                    product_name: `Product ${i}`,
                    unit_price: Math.random() * 100,
                });
            }
            for (let i = 0; i < products.length; i += chunkSize) {
                const chunk = products.slice(i, i + chunkSize);
                await tx.execute(
                    `INSERT INTO products (id, product_id, product_name, unit_price) VALUES ${chunk
                        .map(() => "(?, ?, ?, ?)")
                        .join(", ")}`,
                    chunk.flatMap((p) => [
                        p.id,
                        p.product_id,
                        p.product_name,
                        p.unit_price,
                    ]),
                );
            }

            // Orders
            setupMessage.value = "Inserting orders...";
            const orders = [];
            let orderIdCounter = 1;
            const orderDate = new Date().toISOString();
            for (let i = 1; i < customerIdCounter; i++) {
                for (let l = 1; l <= NUM_ORDERS_PER_CUSTOMER; l++) {
                    orders.push({
                        id: crypto.randomUUID(),
                        order_id: orderIdCounter++,
                        order_date: orderDate,
                        customer_id: i,
                        amount: Math.random() * 1000,
                    });
                }
            }
            for (let i = 0; i < orders.length; i += chunkSize) {
                const chunk = orders.slice(i, i + chunkSize);
                await tx.execute(
                    `INSERT INTO orders (id, order_id, order_date, customer_id, amount) VALUES ${chunk
                        .map(() => "(?, ?, ?, ?, ?)")
                        .join(", ")}`,
                    chunk.flatMap((o) => [
                        o.id,
                        o.order_id,
                        o.order_date,
                        o.customer_id,
                        o.amount,
                    ]),
                );
            }
        });

        // Order details in separate transaction (to avoid memory issues)
        setupMessage.value = "Generating order details...";
        const orderIds = await db
            .selectFrom("orders")
            .select("order_id")
            .execute();

        await powerSync.writeTransaction(async (tx) => {
            const chunkSize = 1000;
            let orderDetails = [];

            for (const order of orderIds) {
                const numItems = Math.floor(Math.random() * 5) + 1;
                for (let m = 0; m < numItems; m++) {
                    const productId =
                        Math.floor(Math.random() * NUM_PRODUCTS) + 1;
                    orderDetails.push({
                        id: crypto.randomUUID(),
                        order_id: order.order_id,
                        product_id: productId,
                        quantity: Math.floor(Math.random() * 10) + 1,
                    });

                    // Insert in chunks to manage memory
                    if (orderDetails.length >= chunkSize) {
                        await tx.execute(
                            `INSERT INTO order_details (id, order_id, product_id, quantity) VALUES ${orderDetails
                                .map(() => "(?, ?, ?, ?)")
                                .join(", ")}`,
                            orderDetails.flatMap((od) => [
                                od.id,
                                od.order_id,
                                od.product_id,
                                od.quantity,
                            ]),
                        );
                        orderDetails = [];
                    }
                }
            }

            // Insert remaining
            if (orderDetails.length > 0) {
                await tx.execute(
                    `INSERT INTO order_details (id, order_id, product_id, quantity) VALUES ${orderDetails
                        .map(() => "(?, ?, ?, ?)")
                        .join(", ")}`,
                    orderDetails.flatMap((od) => [
                        od.id,
                        od.order_id,
                        od.product_id,
                        od.quantity,
                    ]),
                );
            }
        });

        // Calculate total rows inserted
        const totalRows =
            NUM_REGIONS +
            NUM_REGIONS * NUM_COUNTRIES_PER_REGION +
            NUM_REGIONS * NUM_COUNTRIES_PER_REGION * NUM_CUSTOMERS_PER_COUNTRY +
            NUM_REGIONS *
                NUM_COUNTRIES_PER_REGION *
                NUM_CUSTOMERS_PER_COUNTRY *
                NUM_ORDERS_PER_CUSTOMER +
            NUM_PRODUCTS +
            NUM_REGIONS *
                NUM_COUNTRIES_PER_REGION *
                NUM_CUSTOMERS_PER_COUNTRY *
                NUM_ORDERS_PER_CUSTOMER *
                NUM_DETAILS_PER_ORDER; // approximate count for details

        insertedRows.value.sqlite = totalRows;

        setupMessage.value = `SQLite data insertion complete! ${totalRows.toLocaleString()} rows inserted.`;
        const endTime = performance.now();
        setupTimings.value.sqlite.insert = (endTime - startTime).toFixed(2);
        isSetupComplete.value = true;

        // Calculate performance comparison
        if (
            setupTimings.value.indexedDb.schema &&
            setupTimings.value.sqlite.schema
        ) {
            const indexedDBSchemaTime = parseFloat(
                setupTimings.value.indexedDb.schema,
            );
            const sqliteSchemaTime = parseFloat(
                setupTimings.value.sqlite.schema,
            );
            const schemaDiff =
                ((sqliteSchemaTime - indexedDBSchemaTime) /
                    indexedDBSchemaTime) *
                100;
            performanceComparison.value.sqlite.schemaVsIndexedDB =
                schemaDiff.toFixed(1);
            performanceComparison.value.indexedDb.schemaVsSQLite =
                (-schemaDiff).toFixed(1);
        }

        if (
            setupTimings.value.indexedDb.insert &&
            setupTimings.value.sqlite.insert
        ) {
            const indexedDBInsertTime = parseFloat(
                setupTimings.value.indexedDb.insert,
            );
            const sqliteInsertTime = parseFloat(
                setupTimings.value.sqlite.insert,
            );
            const insertDiff =
                ((sqliteInsertTime - indexedDBInsertTime) /
                    indexedDBInsertTime) *
                100;
            performanceComparison.value.sqlite.insertVsIndexedDB =
                insertDiff.toFixed(1);
            performanceComparison.value.indexedDb.insertVsSQLite =
                (-insertDiff).toFixed(1);
        }

        // Calculate row count comparison if both databases have data
        if (insertedRows.value.indexedDb > 0) {
            const rowDiff =
                ((insertedRows.value.sqlite - insertedRows.value.indexedDb) /
                    insertedRows.value.indexedDb) *
                100;
            performanceComparison.value.sqlite.insertedRowsVsIndexedDB =
                rowDiff.toFixed(1);
            performanceComparison.value.indexedDb.insertedRowsVsSQLite =
                (-rowDiff).toFixed(1);
        }
    } catch (err: any) {
        console.error("SQLite data insertion error:", err);
        setupMessage.value = `Error: ${err.message ?? err}`;
    } finally {
        isInsertingDataSQLite.value = false;
    }
}

async function benchmarkSQLite() {
    const startTime = performance.now();

    // Kysely Query Builder
    const result = await db
        .selectFrom("customers as c")
        .innerJoin("orders as o", "c.customer_id", "o.customer_id")
        .innerJoin("order_details as od", "o.order_id", "od.order_id")
        .innerJoin("products as p", "od.product_id", "p.product_id")
        .innerJoin("countries as ct", "c.country_id", "ct.country_id")
        .where("ct.region_id", "=", 1)
        .select([
            "c.customer_name",
            (eb) =>
                eb.fn
                    .sum(sql<number>`od.quantity * p.unit_price`)
                    .as("total_spent"),
            (eb) => eb.fn.count("o.order_id").as("order_count"),
        ])
        .groupBy("c.customer_id")
        .orderBy("total_spent", "desc")
        .limit(5)
        .execute();

    const endTime = performance.now();

    if (!benchmarkResults.value) return;

    benchmarkResults.value.sqlite.time = (endTime - startTime).toFixed(2);
    benchmarkResults.value.sqlite.data = result;
}

// --- IndexedDB Schema Creation ---
function setupIndexedDB() {
    return new Promise((resolve, reject) => {
        isSettingUpIndexedDB.value = true;
        setupMessage.value = "Setting up IndexedDB...";
        const startTime = performance.now();

        const deleteRequest = window.indexedDB.deleteDatabase("benchmarkIDB");
        deleteRequest.onsuccess = () => {
            const schemaStartTime = performance.now();
            const request = window.indexedDB.open("benchmarkIDB", 2); // Incremented version to trigger onupgradeneeded

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains("regions"))
                    db.createObjectStore("regions", { keyPath: "region_id" });
                if (!db.objectStoreNames.contains("countries"))
                    db.createObjectStore("countries", {
                        keyPath: "country_id",
                    }).createIndex("region_id", "region_id");
                if (!db.objectStoreNames.contains("customers"))
                    db.createObjectStore("customers", {
                        keyPath: "customer_id",
                    }).createIndex("country_id", "country_id");
                if (!db.objectStoreNames.contains("orders"))
                    db.createObjectStore("orders", {
                        keyPath: "order_id",
                    }).createIndex("customer_id", "customer_id");
                if (!db.objectStoreNames.contains("products"))
                    db.createObjectStore("products", { keyPath: "product_id" });
                if (!db.objectStoreNames.contains("order_details"))
                    db.createObjectStore("order_details", {
                        autoIncrement: true,
                        keyPath: "order_detail_id",
                    }).createIndex("order_id", "order_id");

                const schemaEndTime = performance.now();
                const schemaTime = (schemaEndTime - schemaStartTime).toFixed(2);
                setupMessage.value = `IndexedDB schema created in ${schemaTime}ms. Tables ready! Click 'Insert Data' to populate.`;
                setupTimings.value.indexedDb.schema = schemaTime;
                isSchemaCreated.value = true;
            };

            request.onsuccess = async (event) => {
                idbConnection = (event.target as IDBOpenDBRequest).result;
                setupMessage.value =
                    "IndexedDB schema creation complete. Click 'Insert IndexedDB Data' to populate.";
                const endTime = performance.now();
                resolve(true);
            };
            request.onerror = (event) => {
                isSettingUpIndexedDB.value = false;
                setupMessage.value = `Error: ${request.error}`;
                reject(request.error);
            };
        };
        deleteRequest.onerror = (event) => {
            isSettingUpIndexedDB.value = false;
            setupMessage.value = `Error: Could not delete old IndexedDB`;
            reject(deleteRequest.error);
        };
    });
}

// --- IndexedDB Data Insertion ---
function insertIndexedDBData() {
    return new Promise((resolve, reject) => {
        isInsertingDataIndexedDB.value = true;
        setupMessage.value = "Inserting data into IndexedDB...";
        const startTime = performance.now();

        const request = window.indexedDB.open("benchmarkIDB", 2);

        request.onsuccess = async (event) => {
            idbConnection = (event.target as IDBOpenDBRequest).result;
            setupMessage.value = "Clearing existing data before insertion...";

            try {
                // First clear existing data to avoid key conflicts
                const stores = [
                    "regions",
                    "countries",
                    "customers",
                    "orders",
                    "products",
                    "order_details",
                ];

                // Create transaction to clear all stores
                const clearTx = idbConnection.transaction(stores, "readwrite");

                for (const storeName of stores) {
                    clearTx.objectStore(storeName).clear();
                }

                // Wait for clear transaction to complete before inserting new data
                await promisifyTx(clearTx);

                setupMessage.value = "Populating IndexedDB with data...";

                // Now insert new data
                const tx = idbConnection.transaction(stores, "readwrite");
                let regionId = 1,
                    countryId = 100,
                    customerId = 1000,
                    orderId = 1000000;

                for (let i = 0; i < NUM_REGIONS; i++) {
                    await promisifyRequest(
                        tx.objectStore("regions").add({
                            region_id: regionId,
                            region_name: `Region ${i}`,
                        }),
                    );
                    for (let j = 0; j < NUM_COUNTRIES_PER_REGION; j++) {
                        await promisifyRequest(
                            tx.objectStore("countries").add({
                                country_id: countryId,
                                country_name: `Country ${j} of R${i}`,
                                region_id: regionId,
                            }),
                        );
                        for (let k = 0; k < NUM_CUSTOMERS_PER_COUNTRY; k++) {
                            await promisifyRequest(
                                tx.objectStore("customers").add({
                                    customer_id: customerId,
                                    customer_name: `Customer ${k}`,
                                    country_id: countryId,
                                }),
                            );
                            for (let l = 0; l < NUM_ORDERS_PER_CUSTOMER; l++) {
                                await promisifyRequest(
                                    tx.objectStore("orders").add({
                                        order_id: orderId,
                                        customer_id: customerId,
                                        order_date: "2025-01",
                                    }),
                                );
                                orderId++;
                            }
                            customerId++;
                        }
                        countryId++;
                    }
                    regionId++;
                }
                for (let i = 0; i < NUM_PRODUCTS; i++) {
                    await promisifyRequest(
                        tx.objectStore("products").add({
                            product_id: i + 1,
                            product_name: `Product ${i}`,
                            unit_price: parseFloat(
                                (Math.random() * 100).toFixed(2),
                            ),
                        }),
                    );
                }

                const orders = await getAllFromStore(tx, "orders");
                for (const order of orders) {
                    for (let i = 0; i < NUM_DETAILS_PER_ORDER; i++) {
                        const randomProductId =
                            Math.floor(Math.random() * NUM_PRODUCTS) + 1;
                        const randomQuantity =
                            Math.floor(Math.random() * 10) + 1;
                        await promisifyRequest(
                            tx.objectStore("order_details").add({
                                order_id: order.order_id,
                                product_id: randomProductId,
                                quantity: randomQuantity,
                            }),
                        );
                    }
                }

                await promisifyTx(tx);

                // Calculate total rows inserted
                const totalRows =
                    NUM_REGIONS +
                    NUM_REGIONS * NUM_COUNTRIES_PER_REGION +
                    NUM_REGIONS *
                        NUM_COUNTRIES_PER_REGION *
                        NUM_CUSTOMERS_PER_COUNTRY +
                    NUM_REGIONS *
                        NUM_COUNTRIES_PER_REGION *
                        NUM_CUSTOMERS_PER_COUNTRY *
                        NUM_ORDERS_PER_CUSTOMER +
                    NUM_PRODUCTS +
                    NUM_REGIONS *
                        NUM_COUNTRIES_PER_REGION *
                        NUM_CUSTOMERS_PER_COUNTRY *
                        NUM_ORDERS_PER_CUSTOMER *
                        NUM_DETAILS_PER_ORDER; // approximate count for details

                insertedRows.value.indexedDb = totalRows;

                setupMessage.value = `IndexedDB data insertion complete! ${totalRows.toLocaleString()} rows inserted.`;
                const endTime = performance.now();
                setupTimings.value.indexedDb.insert = (
                    endTime - startTime
                ).toFixed(2);
                isSetupComplete.value = true;

                // Calculate row count comparison if both databases have data
                if (insertedRows.value.sqlite > 0) {
                    const rowDiff =
                        ((insertedRows.value.indexedDb -
                            insertedRows.value.sqlite) /
                            insertedRows.value.sqlite) *
                        100;
                    performanceComparison.value.indexedDb.insertedRowsVsSQLite =
                        rowDiff.toFixed(1);
                    performanceComparison.value.sqlite.insertedRowsVsIndexedDB =
                        (-rowDiff).toFixed(1);
                }

                resolve(true);
            } catch (err: any) {
                setupMessage.value = `Error: ${err.message ?? err}`;
                reject(err);
            } finally {
                isInsertingDataIndexedDB.value = false;
            }
        };
        request.onerror = (event) => {
            isInsertingDataIndexedDB.value = false;
            setupMessage.value = `Error: ${request.error}`;
            reject(request.error);
        };
    });
}

// Helper functions for IndexedDB promises
function promisifyRequest<T>(request: IDBRequest<T>): Promise<T> {
    return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}
function promisifyTx(tx: IDBTransaction): Promise<void> {
    return new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}
function getAllFromStore(
    tx: IDBTransaction,
    storeName: string,
): Promise<any[]> {
    return promisifyRequest(tx.objectStore(storeName).getAll());
}

async function benchmarkIndexedDB() {
    const startTime = performance.now();

    const tx = idbConnection.transaction(
        ["countries", "customers", "orders", "order_details", "products"],
        "readonly",
    );

    const countryStore = tx.objectStore("countries");
    const countryIndex = countryStore.index("region_id");
    const region1Countries = await promisifyRequest(countryIndex.getAll(1));
    const region1CountryIds = region1Countries.map((c) => c.country_id);

    const customerStore = tx.objectStore("customers");
    const customerIndex = customerStore.index("country_id");
    let region1Customers = [];
    for (const id of region1CountryIds) {
        const customersInCountry = await promisifyRequest(
            customerIndex.getAll(id),
        );
        region1Customers.push(...customersInCountry);
    }
    const region1CustomerIds = region1Customers.map((c) => c.customer_id);

    const orderStore = tx.objectStore("orders");
    const orderIndex = orderStore.index("customer_id");
    let allOrders = [];
    for (const id of region1CustomerIds) {
        const ordersForCustomer = await promisifyRequest(orderIndex.getAll(id));
        allOrders.push(...ordersForCustomer);
    }
    const allOrderIds = allOrders.map((o) => o.order_id);

    const detailStore = tx.objectStore("order_details");
    const detailIndex = detailStore.index("order_id");
    let allDetails = [];
    for (const id of allOrderIds) {
        const detailsForOrder = await promisifyRequest(detailIndex.getAll(id));
        allDetails.push(...detailsForOrder);
    }

    const products = await getAllFromStore(tx, "products");
    const productPriceMap = new Map(
        products.map((p) => [p.product_id, p.unit_price]),
    );

    const customerTotals = new Map();
    for (const customer of region1Customers) {
        customerTotals.set(customer.customer_id, {
            customer_name: customer.customer_name,
            total_spent: 0,
            order_count: 0,
        });
    }

    for (const order of allOrders) {
        const customerData = customerTotals.get(order.customer_id);
        if (customerData) {
            customerData.order_count++;
        }
    }

    for (const detail of allDetails) {
        const order = allOrders.find((o) => o.order_id === detail.order_id);
        if (order) {
            const customerData = customerTotals.get(order.customer_id);
            const price = productPriceMap.get(detail.product_id);
            if (customerData && price) {
                customerData.total_spent += detail.quantity * price;
            }
        }
    }

    const finalResults = Array.from(customerTotals.values())
        .sort((a, b) => b.total_spent - a.total_spent)
        .slice(0, 5);

    const endTime = performance.now();

    benchmarkResults.value.indexedDb.time = (endTime - startTime).toFixed(2);
    benchmarkResults.value.indexedDb.data = finalResults;
}

async function runBenchmarks() {
    if (!isSetupComplete.value) {
        alert("Please set up the databases and insert data first.");
        return;
    }
    isBenchmarking.value = true;
    benchmarkResults.value = {
        sqlite: { time: null, data: undefined },
        indexedDb: { time: null, data: undefined },
    };

    await benchmarkSQLite();
    await benchmarkIndexedDB();

    isBenchmarking.value = false;
}

async function clearSQLite() {
    isClearingSQLite.value = true;
    setupMessage.value = "Clearing SQLite database...";
    try {
        // Delete all data from tables
        setupMessage.value = "Deleting data from all tables...";
        await db.deleteFrom("order_details").execute();
        await db.deleteFrom("orders").execute();
        await db.deleteFrom("products").execute();
        await db.deleteFrom("customers").execute();
        await db.deleteFrom("countries").execute();
        await db.deleteFrom("regions").execute();

        // Drop all tables
        setupMessage.value = "Dropping all tables...";
        await db.schema.dropTable("order_details").ifExists().execute();
        await db.schema.dropTable("orders").ifExists().execute();
        await db.schema.dropTable("products").ifExists().execute();
        await db.schema.dropTable("customers").ifExists().execute();
        await db.schema.dropTable("countries").ifExists().execute();
        await db.schema.dropTable("regions").ifExists().execute();

        // Completely wipe the OPFS database
        setupMessage.value = "Deleting entire OPFS database...";
        // await powerSync.disconnectAndClear();
        await purgeVFS();

        // Re-initialize for future use
        setupMessage.value = "Reinitializing PowerSync...";
        await powerSync.init();

        window.location.reload();

        // After clearing, the setup is no longer considered complete
        isSetupComplete.value = false;
        isSchemaCreated.value = false;
        setupMessage.value =
            "SQLite database completely deleted and reinitialized.";
    } catch (err: any) {
        console.error("Error clearing SQLite:", err);
        setupMessage.value = `Error clearing SQLite: ${err.message ?? err}`;
    } finally {
        isClearingSQLite.value = false;
    }
}

async function clearIndexedDB() {
    isClearingIndexedDB.value = true;
    setupMessage.value = "Clearing IndexedDB database...";

    return new Promise((resolve, reject) => {
        if (idbConnection) {
            idbConnection.close();
        }

        // First, try to open and clear all data from existing object stores
        const deleteRequest = window.indexedDB.open("benchmarkIDB", 1);

        deleteRequest.onsuccess = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            const tx = db.transaction(
                [
                    "regions",
                    "countries",
                    "customers",
                    "orders",
                    "products",
                    "order_details",
                ],
                "readwrite",
            );

            // Clear all object stores
            tx.objectStore("regions").clear();
            tx.objectStore("countries").clear();
            tx.objectStore("customers").clear();
            tx.objectStore("orders").clear();
            tx.objectStore("products").clear();
            tx.objectStore("order_details").clear();

            tx.oncomplete = () => {
                db.close();

                // Now delete the entire database
                const finalDeleteRequest =
                    window.indexedDB.deleteDatabase("benchmarkIDB");
                finalDeleteRequest.onsuccess = () => {
                    setupMessage.value = "IndexedDB database cleared.";
                    isSetupComplete.value = false;
                    isSchemaCreated.value = false;
                    isClearingIndexedDB.value = false;
                    resolve(true);
                };

                finalDeleteRequest.onerror = (event) => {
                    console.error(
                        "Error clearing IndexedDB:",
                        finalDeleteRequest.error,
                    );
                    setupMessage.value = `Error clearing IndexedDB: ${finalDeleteRequest.error}`;
                    isClearingIndexedDB.value = false;
                    reject(finalDeleteRequest.error);
                };

                finalDeleteRequest.onblocked = (event) => {
                    console.warn("IndexedDB deletion was blocked.");
                    setupMessage.value =
                        "Cannot clear IndexedDB. Please close any other tabs that may be using it.";
                    isClearingIndexedDB.value = false;
                    reject("IndexedDB deletion blocked by an open connection.");
                };
            };

            tx.onerror = (event) => {
                console.error("Error clearing object stores:", tx.error);
                db.close();

                // Still attempt to delete the database even if clearing failed
                const finalDeleteRequest =
                    window.indexedDB.deleteDatabase("benchmarkIDB");
                finalDeleteRequest.onsuccess = () => {
                    setupMessage.value = "IndexedDB database cleared.";
                    isSetupComplete.value = false;
                    isSchemaCreated.value = false;
                    isClearingIndexedDB.value = false;
                    resolve(true);
                };

                finalDeleteRequest.onerror = (event) => {
                    console.error(
                        "Error clearing IndexedDB:",
                        finalDeleteRequest.error,
                    );
                    setupMessage.value = `Error clearing IndexedDB: ${finalDeleteRequest.error}`;
                    isSetupComplete.value = false;
                    isSchemaCreated.value = false;
                    isClearingIndexedDB.value = false;
                    reject(finalDeleteRequest.error);
                };
            };
        };

        deleteRequest.onerror = (event) => {
            // If opening the database fails, just try to delete it directly
            const finalDeleteRequest =
                window.indexedDB.deleteDatabase("benchmarkIDB");
            finalDeleteRequest.onsuccess = () => {
                setupMessage.value = "IndexedDB database cleared.";
                isSetupComplete.value = false;
                isSchemaCreated.value = false;
                isClearingIndexedDB.value = false;
                resolve(true);
            };

            finalDeleteRequest.onerror = (event) => {
                console.error(
                    "Error clearing IndexedDB:",
                    finalDeleteRequest.error,
                );
                setupMessage.value = `Error clearing IndexedDB: ${finalDeleteRequest.error}`;
                isClearingIndexedDB.value = false;
                reject(finalDeleteRequest.error);
            };
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
        } finally {
            isClearingSQLite.value = false;
            window.location.reload();
        }
    }
}

// List OPFS entries
async function listVfsEntries() {
    const root = (await navigator.storage.getDirectory()) as any;
    for await (const [name, entry] of root.entries()) {
        console.log(`${entry.kind}: ${name}`);
    }
}
</script>
