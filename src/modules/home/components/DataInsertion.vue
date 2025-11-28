<template>
  <F7BlockTitle>Data Insertion</F7BlockTitle>
  <F7Block strong class="!rounded-2xl">
    <p>
      Now, insert the data into your databases. This will populate the tables with thousands of records. This step may take a moment.
    </p>
    <div
      v-if="isSchemaCreated"
      class="grid grid-cols-2 gap-4 mb-4"
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
    <div v-if="!isSchemaCreated" class="text-center text-gray-500 py-4">
      Please create the database schemas first before inserting data.
    </div>
    <div v-if="setupMessage" class="mt-4 text-center text-gray-500">
      {{ setupMessage }}
    </div>
  </F7Block>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { sql } from 'kysely';
import { db, powerSync } from '@/shared/services/database';

// Props to receive shared state
interface Props {
  isSchemaCreated: boolean;
  isInsertingDataSQLite: boolean;
  isInsertingDataIndexedDB: boolean;
  setupMessage: string;
  insertedRows: {
    sqlite: number;
    indexedDb: number;
  };
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

// Emit events for state changes
const emit = defineEmits([
  'update:is-inserting-data-sqlite',
  'update:is-inserting-data-indexeddb',
  'update:setup-message',
  'update:inserted-rows',
  'update:setup-timings',
  'update:performance-comparison',
  'data-insertion-complete'
]);

const NUM_REGIONS = 5;
const NUM_COUNTRIES_PER_REGION = 10;
const NUM_CUSTOMERS_PER_COUNTRY = 20;
const NUM_ORDERS_PER_CUSTOMER = 15;
const NUM_PRODUCTS = 10000;
const NUM_DETAILS_PER_ORDER = 3;

// --- Database Connections ---
let idbConnection: IDBDatabase;

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
  storeName: string
): Promise<any[]> {
  return promisifyRequest(tx.objectStore(storeName).getAll());
}

// --- SQLite Data Insertion ---
async function insertSQLiteData() {
  if (props.isInsertingDataSQLite) return;
  emit('update:is-inserting-data-sqlite', true);
  emit('update:setup-message', "Inserting data into SQLite...");
  const startTime = performance.now();

  try {
    // --- Data Generation & Insertion (Using Kysely Batch Inserts) ---
    emit('update:setup-message', "Generating data...");

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
        regions.flatMap((r) => [r.id, r.region_id, r.region_name])
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
        ])
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
          ])
        );
      }

      // Products
      emit('update:setup-message', "Inserting products...");
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
          ])
        );
      }

      // Orders
      emit('update:setup-message', "Inserting orders...");
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
          ])
        );
      }
    });

    // Order details in separate transaction (to avoid memory issues)
    emit('update:setup-message', "Generating order details...");
    const orderIds = await db.selectFrom("orders").select("order_id").execute();

    await powerSync.writeTransaction(async (tx) => {
      const chunkSize = 1000;
      let orderDetails = [];

      for (const order of orderIds) {
        const numItems = Math.floor(Math.random() * 5) + 1;
        for (let m = 0; m < numItems; m++) {
          const productId = Math.floor(Math.random() * NUM_PRODUCTS) + 1;
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
              ])
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
          ])
        );
      }
    });

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

    const updatedInsertedRows = {
      ...props.insertedRows,
      sqlite: totalRows
    };
    emit('update:inserted-rows', updatedInsertedRows);

    emit('update:setup-message', `SQLite data insertion complete! ${totalRows.toLocaleString()} rows inserted.`);
    const endTime = performance.now();

    // Update the timing in the parent component
    const updatedTimings = {
      ...props.setupTimings,
      sqlite: {
        ...props.setupTimings.sqlite,
        insert: (endTime - startTime).toFixed(2)
      }
    };
    emit('update:setup-timings', updatedTimings);

    // Calculate performance comparison
    if (props.setupTimings.indexedDb.schema && props.setupTimings.sqlite.schema) {
      const indexedDBSchemaTime = parseFloat(props.setupTimings.indexedDb.schema);
      const sqliteSchemaTime = parseFloat(props.setupTimings.sqlite.schema);
      const schemaDiff = ((sqliteSchemaTime - indexedDBSchemaTime) / indexedDBSchemaTime) * 100;

      const currentComparison = props.performanceComparison;
      const updatedComparison = {
        ...currentComparison,
        sqlite: {
          ...currentComparison.sqlite,
          schemaVsIndexedDB: schemaDiff.toFixed(1)
        },
        indexedDb: {
          ...currentComparison.indexedDb,
          schemaVsSQLite: (-schemaDiff).toFixed(1)
        }
      };
      emit('update:performance-comparison', updatedComparison);
    }

    if (props.setupTimings.indexedDb.insert && props.setupTimings.sqlite.insert) {
      const indexedDBInsertTime = parseFloat(props.setupTimings.indexedDb.insert);
      const sqliteInsertTime = parseFloat(props.setupTimings.sqlite.insert);
      const insertDiff = ((sqliteInsertTime - indexedDBInsertTime) / indexedDBInsertTime) * 100;

      const currentComparison = props.performanceComparison;
      const updatedComparison = {
        ...currentComparison,
        sqlite: {
          ...currentComparison.sqlite,
          insertVsIndexedDB: insertDiff.toFixed(1)
        },
        indexedDb: {
          ...currentComparison.indexedDb,
          insertVsSQLite: (-insertDiff).toFixed(1)
        }
      };
      emit('update:performance-comparison', updatedComparison);
    }

    // Calculate row count comparison if both databases have data
    if (props.insertedRows.indexedDb > 0) {
      const rowDiff = ((props.insertedRows.sqlite - props.insertedRows.indexedDb) / props.insertedRows.indexedDb) * 100;

      const currentComparison = props.performanceComparison;
      const updatedComparison = {
        ...currentComparison,
        sqlite: {
          ...currentComparison.sqlite,
          insertedRowsVsIndexedDB: rowDiff.toFixed(1)
        },
        indexedDb: {
          ...currentComparison.indexedDb,
          insertedRowsVsSQLite: (-rowDiff).toFixed(1)
        }
      };
      emit('update:performance-comparison', updatedComparison);
    }

    emit('data-insertion-complete');
  } catch (err: any) {
    console.error("SQLite data insertion error:", err);
    emit('update:setup-message', `Error: ${err.message ?? err}`);
  } finally {
    emit('update:is-inserting-data-sqlite', false);
  }
}

// --- IndexedDB Data Insertion ---
function insertIndexedDBData() {
  return new Promise((resolve, reject) => {
    if (props.isInsertingDataIndexedDB) return;
    emit('update:is-inserting-data-indexeddb', true);
    emit('update:setup-message', "Inserting data into IndexedDB...");
    const startTime = performance.now();

    const request = window.indexedDB.open("benchmarkIDB", 2);

    request.onsuccess = async (event) => {
      idbConnection = (event.target as IDBOpenDBRequest).result;
      emit('update:setup-message', "Clearing existing data before insertion...");

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

        emit('update:setup-message', "Populating IndexedDB with data...");

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

        const updatedInsertedRows = {
          ...props.insertedRows,
          indexedDb: totalRows
        };
        emit('update:inserted-rows', updatedInsertedRows);

        emit('update:setup-message', `IndexedDB data insertion complete! ${totalRows.toLocaleString()} rows inserted.`);
        const endTime = performance.now();

        // Update the timing in the parent component
        const updatedTimings = {
          ...props.setupTimings,
          indexedDb: {
            ...props.setupTimings.indexedDb,
            insert: (endTime - startTime).toFixed(2)
          }
        };
        emit('update:setup-timings', updatedTimings);

        // Calculate row count comparison if both databases have data
        if (props.insertedRows.sqlite > 0) {
          const rowDiff = ((props.insertedRows.indexedDb - props.insertedRows.sqlite) / props.insertedRows.sqlite) * 100;

          const currentComparison = props.performanceComparison;
          const updatedComparison = {
            ...currentComparison,
            sqlite: {
              ...currentComparison.sqlite,
              insertedRowsVsIndexedDB: (-rowDiff).toFixed(1)
            },
            indexedDb: {
              ...currentComparison.indexedDb,
              insertedRowsVsSQLite: rowDiff.toFixed(1)
            }
          };
          emit('update:performance-comparison', updatedComparison);
        }

        emit('data-insertion-complete');
        resolve(true);
      } catch (err: any) {
        emit('update:setup-message', `Error: ${err.message ?? err}`);
        reject(err);
      } finally {
        emit('update:is-inserting-data-indexeddb', false);
      }
    };
    request.onerror = (event) => {
      emit('update:is-inserting-data-indexeddb', false);
      emit('update:setup-message', `Error: ${request.error}`);
      reject(request.error);
    };
  });
}
</script>
