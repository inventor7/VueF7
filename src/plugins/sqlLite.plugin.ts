import { defineCustomElements as jeepSqlite } from "jeep-sqlite/loader";
import { Capacitor } from "@capacitor/core";
import { CapacitorSQLite, SQLiteConnection } from "@capacitor-community/sqlite";

const sqLite = () => {
  if (Capacitor.getPlatform() === "web") {
    jeepSqlite(window);

    const jeepEl = document.createElement("jeep-sqlite");
    document.body.appendChild(jeepEl);

    window.addEventListener("DOMContentLoaded", async () => {
      const sqlite = new SQLiteConnection(CapacitorSQLite);

      try {
        await sqlite.initWebStore();
      } catch (err) {
        console.error("Error initializing SQLite web store:", err);
      }
    });
  }
};

export default sqLite;
