<template>
  <F7BlockTitle>Database Schema Setup</F7BlockTitle>
  <F7Block strong class="!rounded-2xl">
    <p>
      First, set up the database schemas. This will create a complex schema
      of 10+ tables. This step may take a moment.
    </p>
    <div class="grid grid-cols-2 gap-4 mb-4">
      <F7Button
        fill
        @click="setupSQLite"
        :loading="isSettingUpSQLite"
        >Setup SQLite Schema</F7Button
      >
      <F7Button
        fill
        @click="setupIndexedDB"
        :loading="isSettingUpIndexedDB"
        >Setup IndexedDB Schema</F7Button
      >
    </div>
    <div v-if="setupMessage" class="mt-4 text-center text-gray-500">
      {{ setupMessage }}
    </div>
    <div
      class="mt-4 grid grid-cols-2 gap-4"
      v-if="setupTimings.sqlite.schema || setupTimings.indexedDb.schema"
    >
      <div
        v-if="setupTimings.sqlite.schema"
        class="text-center p-2 bg-green-100 rounded-lg"
      >
        <p class="font-bold text-green-600">SQLite Schema Time</p>
        <p class="font-mono">{{ setupTimings.sqlite.schema }} ms</p>
      </div>
      <div
        v-if="setupTimings.indexedDb.schema"
        class="text-center p-2 bg-red-100 rounded-lg"
      >
        <p class="font-bold text-red-600">IndexedDB Schema Time</p>
        <p class="font-mono">{{ setupTimings.indexedDb.schema }} ms</p>
      </div>
    </div>
  </F7Block>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Capacitor } from '@capacitor/core';
import { sql } from 'kysely';
import { db, powerSync } from '@/shared/services/database';

// Props to receive shared state
interface Props {
  isSettingUpSQLite: boolean;
  isSettingUpIndexedDB: boolean;
  isSchemaCreated: boolean;
  setupMessage: string;
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
}

const props = defineProps<Props>();

// Emit events for state changes
const emit = defineEmits([
  'update:is-setting-up-sqlite',
  'update:is-setting-up-indexeddb',
  'update:is-schema-created',
  'update:setup-message',
  'update:setup-timings',
  'sqlite-schema-complete',
  'indexeddb-schema-complete'
]);

const NUM_REGIONS = 5;
const NUM_COUNTRIES_PER_REGION = 10;
const NUM_CUSTOMERS_PER_COUNTRY = 20;
const NUM_ORDERS_PER_CUSTOMER = 15;
const NUM_PRODUCTS = 10000;
const NUM_DETAILS_PER_ORDER = 3;

// --- Database Connections ---
let idbConnection: IDBDatabase;

// --- SQLite Schema Creation ---
async function setupSQLite() {
  if (props.isSettingUpSQLite) return;
  emit('update:is-setting-up-sqlite', true);
  emit('update:setup-message', "Setting up SQLite...");
  const startTime = performance.now();

  try {
    // Completely wipe the existing OPFS database
    emit('update:setup-message', "Deleting existing OPFS database...");
    //await powerSync.disconnectAndClear();

    // Re-initialize PowerSync Database
    emit('update:setup-message', "Initializing fresh PowerSync database...");
    await powerSync.init();

    // Create tables with both id (UUID) and integer columns - in a transaction
    emit('update:setup-message', "Creating database schema...");
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

    // Update the timing in the parent component
    const updatedTimings = {
      ...props.setupTimings,
      sqlite: {
        ...props.setupTimings.sqlite,
        schema: schemaTime
      }
    };
    emit('update:setup-timings', updatedTimings);
    emit('update:setup-message', `SQLite schema created in ${schemaTime}ms. Tables ready! Click 'Insert Data' to populate.`);
    emit('update:is-schema-created', true);
    emit('sqlite-schema-complete');
  } catch (err: any) {
    console.error("SQLite schema creation error:", err);
    emit('update:setup-message', `Error: ${err.message ?? err}`);
  } finally {
    emit('update:is-setting-up-sqlite', false);
  }
}

// --- IndexedDB Schema Creation ---
function setupIndexedDB() {
  return new Promise((resolve, reject) => {
    if (props.isSettingUpIndexedDB) return;
    emit('update:is-setting-up-indexeddb', true);
    emit('update:setup-message', "Setting up IndexedDB...");
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

        // Update the timing in the parent component
        const updatedTimings = {
          ...props.setupTimings,
          indexedDb: {
            ...props.setupTimings.indexedDb,
            schema: schemaTime
          }
        };
        emit('update:setup-timings', updatedTimings);
        emit('update:setup-message', `IndexedDB schema created in ${schemaTime}ms. Tables ready! Click 'Insert Data' to populate.`);
        emit('update:is-schema-created', true);
        emit('indexeddb-schema-complete');
      };

      request.onsuccess = async (event) => {
        idbConnection = (event.target as IDBOpenDBRequest).result;
        emit('update:setup-message', "IndexedDB schema creation complete. Click 'Insert IndexedDB Data' to populate.");
        const endTime = performance.now();
        resolve(true);
      };
      request.onerror = (event) => {
        emit('update:is-setting-up-indexeddb', false);
        emit('update:setup-message', `Error: ${request.error}`);
        reject(request.error);
      };
    };
    deleteRequest.onerror = (event) => {
      emit('update:is-setting-up-indexeddb', false);
      emit('update:setup-message', `Error: Could not delete old IndexedDB`);
      reject(deleteRequest.error);
    };
  });
}
</script>
