import { Kysely } from "kysely";
import CapacitorSQLiteKyselyDialect from "capacitor-sqlite-kysely";
import {
  CapacitorSQLite,
  SQLiteConnection,
  type SQLiteDBConnection,
} from "@capacitor-community/sqlite";
import type { Database } from "@/shared/services/database/database.schema";

export const sqlite = new SQLiteConnection(CapacitorSQLite);

let _kyselyInstance: Kysely<Database> | null = null;

/**
 * Typed database instance for all Kysely operations (queries, schema, transactions).
 * Lazy-loaded to avoid jeep-sqlite timing issues on web.
 *
 * @example
 * ```ts
 * // Queries
 * const customers = await db.selectFrom("customers").selectAll().execute();
 *
 * // Schema
 * await db.schema.createTable("users").addColumn("id", "integer").execute();
 *
 * // Transactions
 * await db.transaction().execute(async (trx) => {
 *   await trx.insertInto("users").values({ name: "Alice" }).execute();
 * });
 * ```
 */
export const db = new Proxy({} as Kysely<Database>, {
  get(target, prop) {
    if (!_kyselyInstance) {
      _kyselyInstance = new Kysely<Database>({
        dialect: new CapacitorSQLiteKyselyDialect(sqlite, {
          name: "benchmarkDB",
        }),
      });
    }
    const value = (_kyselyInstance as any)[prop];
    if (typeof value === "function") {
      return value.bind(_kyselyInstance);
    }
    return value;
  },
});

/**
 * Get raw SQLite connection for native operations not supported by Kysely.
 *
 * Use this for:
 * - `executeSet()` for high-performance bulk inserts
 * - Native SQLite features (e.g., PRAGMA, ATTACH DATABASE)
 * - Raw SQL when needed
 *
 * @param dbName - Database name (default: "benchmarkDB")
 *
 * @example
 * ```ts
 * const conn = await getRawConnection();
 * await conn.executeSet([{
 *   statement: "INSERT INTO users (name) VALUES (?)",
 *   values: [["Alice"], ["Bob"], ["Charlie"]]
 * }]);
 * ```
 */
export async function getRawConnection(
  dbName: string = "benchmarkDB"
): Promise<SQLiteDBConnection> {
  return await sqlite.retrieveConnection(dbName, false);
}
