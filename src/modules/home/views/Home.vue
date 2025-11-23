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
        First, set up the databases. This will create a complex schema of 10+
        tables and populate them with thousands of records. This step may take a
        moment.
      </p>
      <div class="grid grid-cols-2 gap-4 mb-4">
        <F7Button fill @click="setupSQLite" :loading="isSettingUpSQLite"
          >Setup SQLite</F7Button
        >
        <F7Button fill @click="setupIndexedDB" :loading="isSettingUpIndexedDB"
          >Setup IndexedDB</F7Button
        >
      </div>
      <div v-if="setupMessage" class="mt-4 text-center text-gray-500">
        {{ setupMessage }}
      </div>
      <div
        class="mt-4 grid grid-cols-2 gap-4"
        v-if="setupTimings.sqlite || setupTimings.indexedDb"
      >
        <div
          v-if="setupTimings.sqlite"
          class="text-center p-2 bg-green-100 rounded-lg"
        >
          <p class="font-bold text-green-600">SQLite Setup Time</p>
          <p class="font-mono">{{ setupTimings.sqlite }} ms</p>
        </div>
        <div
          v-if="setupTimings.indexedDb"
          class="text-center p-2 bg-red-100 rounded-lg"
        >
          <p class="font-bold text-red-600">IndexedDB Setup Time</p>
          <p class="font-mono">{{ setupTimings.indexedDb }} ms</p>
        </div>
      </div>
    </F7Block>

    <F7BlockTitle>Run Benchmark</F7BlockTitle>
    <F7Block strong class="!rounded-2xl">
      <p>
        Now, run the benchmark. This executes a complex query to find the top 5
        customers by total sales value in a specific region. The time taken for
        each database will be displayed below.
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
          <h3 class="text-xl font-bold text-green-600">SQLite Result</h3>
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
          <h3 class="text-xl font-bold text-red-600">IndexedDB Result</h3>
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
import {
  CapacitorSQLite,
  SQLiteConnection,
  SQLiteDBConnection,
  type capSQLiteSet,
} from "@capacitor-community/sqlite";
import { Capacitor } from "@capacitor/core";

type Benchmark = {
  sqlite: {
    time: string | null;
    data: any[] | undefined;
  };
  indexedDb: {
    time: string | null;
    data: any[] | undefined;
  };
};

// --- Reactive State ---
const isSettingUpSQLite = ref(false);
const isSettingUpIndexedDB = ref(false);
const isBenchmarking = ref(false);
const setupMessage = ref("");
const isSetupComplete = ref(false);
const isClearingSQLite = ref(false);
const isClearingIndexedDB = ref(false);

const setupTimings = ref({
  sqlite: null as string | null,
  indexedDb: null as string | null,
});

const benchmarkResults = ref<Benchmark>({
  sqlite: { time: null, data: undefined },
  indexedDb: { time: null, data: undefined },
});

// --- Database Connections ---
const sqlite = new SQLiteConnection(CapacitorSQLite);
let db: SQLiteDBConnection;
let indexedDB: IDBDatabase;

// --- Schemas (Subset for Demonstration) ---
const schemas = `
  CREATE TABLE IF NOT EXISTS regions (
      region_id INTEGER PRIMARY KEY,
      region_name TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS countries (
      country_id INTEGER PRIMARY KEY,
      country_name TEXT NOT NULL,
      region_id INTEGER,
      FOREIGN KEY (region_id) REFERENCES regions(region_id)
  );
  CREATE TABLE IF NOT EXISTS customers (
      customer_id INTEGER PRIMARY KEY,
      customer_name TEXT NOT NULL,
      country_id INTEGER,
      FOREIGN KEY (country_id) REFERENCES countries(country_id)
  );
  CREATE TABLE IF NOT EXISTS orders (
      order_id INTEGER PRIMARY KEY,
      customer_id INTEGER,
      order_date TEXT NOT NULL,
      FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
  );
  CREATE TABLE IF NOT EXISTS products (
      product_id INTEGER PRIMARY KEY,
      product_name TEXT NOT NULL,
      unit_price REAL
  );
  CREATE TABLE IF NOT EXISTS order_details (
      order_detail_id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER,
      product_id INTEGER,
      quantity INTEGER,
      FOREIGN KEY (order_id) REFERENCES orders(order_id),
      FOREIGN KEY (product_id) REFERENCES products(product_id)
  );
`;

const NUM_REGIONS = 5;
const NUM_COUNTRIES_PER_REGION = 10;
const NUM_CUSTOMERS_PER_COUNTRY = 20;
const NUM_ORDERS_PER_CUSTOMER = 15;
const NUM_PRODUCTS = 10000;
const NUM_DETAILS_PER_ORDER = 3;

// --- SQLite Implementation (Using the correct `executeSet` method) ---
async function setupSQLite() {
  isSettingUpSQLite.value = true;
  setupMessage.value = "Setting up SQLite...";
  const startTime = performance.now();
  try {
    const platform = Capacitor.getPlatform();
    db = await sqlite.createConnection(
      "benchmarkDB",
      true,
      "no-encryption",
      1,
      false
    );
    await db.open();
    await db.execute(schemas, false);

    setupMessage.value = "Generating SQLite data...";

    // --- REFACTOR START ---
    // The key change is using `db.executeSet` for bulk inserts.
    // We create an array of `capSQLiteSet` objects.

    const sets: capSQLiteSet[] = [];

    const regions: any[][] = [];
    const countries: any[][] = [];
    const customers: any[][] = [];
    const orders: any[][] = [];
    const products: any[][] = [];

    let regionId = 1,
      countryId = 100,
      customerId = 100000,
      orderId = 1000000;

    for (let i = 0; i < NUM_REGIONS; i++) {
      regions.push([regionId, `Region ${i}`]);
      for (let j = 0; j < NUM_COUNTRIES_PER_REGION; j++) {
        countries.push([countryId, `Country ${j} of R${i}`, regionId]);
        for (let k = 0; k < NUM_CUSTOMERS_PER_COUNTRY; k++) {
          customers.push([customerId, `Customer ${k}`, countryId]);
          for (let l = 0; l < NUM_ORDERS_PER_CUSTOMER; l++) {
            orders.push([orderId, customerId, "2025-01-01"]);
            orderId++;
          }
          customerId++;
        }
        countryId++;
      }
      regionId++;
    }

    for (let i = 0; i < NUM_PRODUCTS; i++) {
      products.push([
        i + 1,
        `Product ${i}`,
        parseFloat((Math.random() * 100).toFixed(2)),
      ]);
    }

    // Add each bulk insert operation as a `capSQLiteSet` object to the `sets` array
    sets.push({
      statement: "INSERT INTO regions (region_id, region_name) VALUES (?, ?);",
      values: regions,
    });
    sets.push({
      statement:
        "INSERT INTO countries (country_id, country_name, region_id) VALUES (?, ?, ?);",
      values: countries,
    });
    sets.push({
      statement:
        "INSERT INTO customers (customer_id, customer_name, country_id) VALUES (?, ?, ?);",
      values: customers,
    });
    sets.push({
      statement:
        "INSERT INTO orders (order_id, customer_id, order_date) VALUES (?, ?, ?);",
      values: orders,
    });
    sets.push({
      statement:
        "INSERT INTO products (product_id, product_name, unit_price) VALUES (?, ?, ?);",
      values: products,
    });

    setupMessage.value = "Executing main data set...";
    await db.executeSet(sets); // Use executeSet for all main data

    setupMessage.value = "Querying orders to create details...";
    const ordersResult = await db.query("SELECT order_id FROM orders");
    const orderIds = ordersResult.values?.map((v) => v.order_id) ?? [];
    const detailValues: any[][] = [];
    for (const id of orderIds) {
      for (let i = 0; i < NUM_DETAILS_PER_ORDER; i++) {
        const randomProductId = Math.floor(Math.random() * NUM_PRODUCTS) + 1;
        const randomQuantity = Math.floor(Math.random() * 10) + 1;
        detailValues.push([id, randomProductId, randomQuantity]);
      }
    }

    setupMessage.value = "Executing final data set for order details...";
    if (detailValues.length > 0) {
      await db.executeSet([
        {
          statement:
            "INSERT INTO order_details (order_id, product_id, quantity) VALUES (?, ?, ?);",
          values: detailValues,
        },
      ]);
    }
    // --- REFACTOR END ---

    if (platform === "web") {
      await sqlite.saveToStore("benchmarkDB");
    }
    setupMessage.value = "SQLite setup complete!";
    const endTime = performance.now();
    setupTimings.value.sqlite = (endTime - startTime).toFixed(2);
    isSetupComplete.value = true;
  } catch (err: any) {
    console.error("SQLite setup error:", err);
    setupMessage.value = `Error: ${err.message ?? err}`;
  } finally {
    isSettingUpSQLite.value = false;
  }
}

async function benchmarkSQLite() {
  const startTime = performance.now();
  const query = `
    SELECT
      c.customer_name,
      SUM(od.quantity * p.unit_price) as total_spent,
      COUNT(o.order_id) as order_count
    FROM customers c
    JOIN orders o ON c.customer_id = o.customer_id
    JOIN order_details od ON o.order_id = od.order_id
    JOIN products p ON od.product_id = p.product_id
    JOIN countries ct ON c.country_id = ct.country_id
    WHERE ct.region_id = 1
    GROUP BY c.customer_id
    ORDER BY total_spent DESC
    LIMIT 5;
  `;
  const result = await db.query(query);
  const endTime = performance.now();

  if (!benchmarkResults.value) return;

  benchmarkResults.value.sqlite.time = (endTime - startTime).toFixed(2);
  benchmarkResults.value.sqlite.data = result.values;
}

// --- IndexedDB Implementation ---
function setupIndexedDB() {
  return new Promise((resolve, reject) => {
    isSettingUpIndexedDB.value = true;
    setupMessage.value = "Setting up IndexedDB...";
    const startTime = performance.now();

    const deleteRequest = window.indexedDB.deleteDatabase("benchmarkIDB");
    deleteRequest.onsuccess = () => {
      const request = window.indexedDB.open("benchmarkIDB", 1);

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
          db.createObjectStore("orders", { keyPath: "order_id" }).createIndex(
            "customer_id",
            "customer_id"
          );
        if (!db.objectStoreNames.contains("products"))
          db.createObjectStore("products", { keyPath: "product_id" });
        if (!db.objectStoreNames.contains("order_details"))
          db.createObjectStore("order_details", {
            autoIncrement: true,
            keyPath: "order_detail_id",
          }).createIndex("order_id", "order_id");
      };

      request.onsuccess = async (event) => {
        indexedDB = (event.target as IDBOpenDBRequest).result;
        setupMessage.value = "Populating IndexedDB with data...";

        try {
          const stores = [
            "regions",
            "countries",
            "customers",
            "orders",
            "products",
            "order_details",
          ];
          const tx = indexedDB.transaction(stores, "readwrite");
          let regionId = 1,
            countryId = 100,
            customerId = 1000,
            orderId = 1000000;

          for (let i = 0; i < NUM_REGIONS; i++) {
            await promisifyRequest(
              tx
                .objectStore("regions")
                .add({ region_id: regionId, region_name: `Region ${i}` })
            );
            for (let j = 0; j < NUM_COUNTRIES_PER_REGION; j++) {
              await promisifyRequest(
                tx.objectStore("countries").add({
                  country_id: countryId,
                  country_name: `Country ${j} of R${i}`,
                  region_id: regionId,
                })
              );
              for (let k = 0; k < NUM_CUSTOMERS_PER_COUNTRY; k++) {
                await promisifyRequest(
                  tx.objectStore("customers").add({
                    customer_id: customerId,
                    customer_name: `Customer ${k}`,
                    country_id: countryId,
                  })
                );
                for (let l = 0; l < NUM_ORDERS_PER_CUSTOMER; l++) {
                  await promisifyRequest(
                    tx.objectStore("orders").add({
                      order_id: orderId,
                      customer_id: customerId,
                      order_date: "2025-01",
                    })
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
                unit_price: parseFloat((Math.random() * 100).toFixed(2)),
              })
            );
          }

          const orders = await getAllFromStore(tx, "orders");
          for (const order of orders) {
            for (let i = 0; i < NUM_DETAILS_PER_ORDER; i++) {
              const randomProductId =
                Math.floor(Math.random() * NUM_PRODUCTS) + 1;
              const randomQuantity = Math.floor(Math.random() * 10) + 1;
              await promisifyRequest(
                tx.objectStore("order_details").add({
                  order_id: order.order_id,
                  product_id: randomProductId,
                  quantity: randomQuantity,
                })
              );
            }
          }

          await promisifyTx(tx);
          setupMessage.value = "IndexedDB setup complete!";
          const endTime = performance.now();
          setupTimings.value.indexedDb = (endTime - startTime).toFixed(2);
          isSetupComplete.value = true;
          resolve(true);
        } catch (err: any) {
          setupMessage.value = `Error: ${err.message ?? err}`;
          reject(err);
        } finally {
          isSettingUpIndexedDB.value = false;
        }
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

async function benchmarkIndexedDB() {
  const startTime = performance.now();

  const tx = indexedDB.transaction(
    ["countries", "customers", "orders", "order_details", "products"],
    "readonly"
  );

  const countryStore = tx.objectStore("countries");
  const countryIndex = countryStore.index("region_id");
  const region1Countries = await promisifyRequest(countryIndex.getAll(1));
  const region1CountryIds = region1Countries.map((c) => c.country_id);

  const customerStore = tx.objectStore("customers");
  const customerIndex = customerStore.index("country_id");
  let region1Customers = [];
  for (const id of region1CountryIds) {
    const customersInCountry = await promisifyRequest(customerIndex.getAll(id));
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
    products.map((p) => [p.product_id, p.unit_price])
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

// --- Main Benchmark Runner ---
async function runBenchmarks() {
  if (!isSetupComplete.value) {
    alert("Please set up the databases first.");
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

/**
 * Completely deletes the SQLite database file.
 * This is the most reliable way to ensure a clean state.
 */
async function clearSQLite() {
  isClearingSQLite.value = true;
  setupMessage.value = "Clearing SQLite database...";
  try {
    // It's crucial to close any existing connection before trying to delete the database.
    // This prevents file lock issues.
    if (db && (await db.isDBOpen())) {
      await db.close();
    }

    // Use the main plugin method to delete the database file from storage.
    await sqlite.deleteOldDatabases("benchmarkDB");

    // After clearing, the setup is no longer considered complete
    isSetupComplete.value = false;
    setupMessage.value = "SQLite database completely deleted.";
  } catch (err: any) {
    console.error("Error clearing SQLite:", err);
    setupMessage.value = `Error clearing SQLite: ${err.message ?? err}`;
  } finally {
    isClearingSQLite.value = false;
  }
}
/**
 * Deletes the entire IndexedDB database.
 * This is the cleanest and most efficient way to clear it.
 */
async function clearIndexedDB() {
  isClearingIndexedDB.value = true;
  setupMessage.value = "Clearing IndexedDB database...";

  return new Promise((resolve, reject) => {
    // If a connection is open, it must be closed before the DB can be deleted.
    if (indexedDB) {
      indexedDB.close();
    }

    const deleteRequest = window.indexedDB.deleteDatabase("benchmarkIDB");

    deleteRequest.onsuccess = () => {
      setupMessage.value = "IndexedDB database cleared.";
      isSetupComplete.value = false; // The setup is no longer complete
      isClearingIndexedDB.value = false;
      resolve(true);
    };

    deleteRequest.onerror = (event) => {
      console.error("Error clearing IndexedDB:", deleteRequest.error);
      setupMessage.value = `Error clearing IndexedDB: ${deleteRequest.error}`;
      isClearingIndexedDB.value = false;
      reject(deleteRequest.error);
    };

    deleteRequest.onblocked = (event) => {
      // This is an important state to handle. It occurs if the DB is open in another tab.
      console.warn("IndexedDB deletion was blocked.");
      setupMessage.value =
        "Cannot clear IndexedDB. Please close any other tabs that may be using it.";
      isClearingIndexedDB.value = false;
      reject("IndexedDB deletion blocked by an open connection.");
    };
  });
}
</script>
