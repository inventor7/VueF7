import { defineStore } from "pinia";
import { ref } from "vue";
import database from "@/shared/database/index";
import type { ExpenseRecord } from "@/shared/database/schemas/AppSchema";
import { useAuthStore } from "./auth.store";
import type { Transaction } from "@powersync/web";

export const useExpensesStore = defineStore("expenses", () => {
  const expenses = ref<ExpenseRecord[]>([]);
  const loading = ref(false);
  const authStore = useAuthStore();

  let watchAbort: AbortController | null = null;

  async function watchGroupExpenses(groupId: string) {
    if (watchAbort) watchAbort.abort();
    watchAbort = new AbortController();

    try {
      const query = `
        SELECT * FROM expenses 
        WHERE group_id = ? 
        ORDER BY date DESC, created_at DESC
      `;

      for await (const result of database.watch(query, [groupId], {
        signal: watchAbort.signal,
      })) {
        expenses.value = Array.from(
          result.rows?._array || result.rows || []
        ) as ExpenseRecord[];
        console.log(
          `💵 Loaded ${expenses.value.length} expenses for group ${groupId}:`,
          expenses.value
        );
      }
    } catch (error: any) {
      if (error.name !== "AbortError") {
        console.error("Error watching expenses:", error);
      }
    }
  }

  async function addExpense(
    groupId: string,
    amount: number,
    description: string,
    splitsData: { userId: string; amount: number }[],
    paidBy?: string,
    date?: string
  ) {
    if (!authStore.user) throw new Error("User must be logged in");

    const expenseId = crypto.randomUUID();
    const now = new Date().toISOString();
    const userId = paidBy || authStore.user.id;
    const expenseDate = date || now;

    await database.writeTransaction(async (tx: Transaction) => {
      // 1. Create Expense
      await tx.execute(
        `INSERT INTO expenses (id, group_id, paid_by, amount, description, category, date, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          expenseId,
          groupId,
          userId,
          amount,
          description,
          "general",
          expenseDate,
          now,
        ]
      );

      // 2. Create Splits
      for (const split of splitsData) {
        await tx.execute(
          `INSERT INTO splits (id, expense_id, user_id, amount_owed, group_id)
           VALUES (?, ?, ?, ?, ?)`,
          [crypto.randomUUID(), expenseId, split.userId, split.amount, groupId]
        );
      }
    });
  }

  async function settleUp(groupId: string, receiverId: string, amount: number) {
    if (!authStore.user) throw new Error("User must be logged in");

    const settlementId = crypto.randomUUID();
    const now = new Date().toISOString();
    const payerId = authStore.user.id;

    await database.writeTransaction(async (tx: Transaction) => {
      await tx.execute(
        `INSERT INTO settlements (id, group_id, payer_id, receiver_id, amount, date)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [settlementId, groupId, payerId, receiverId, amount, now]
      );
    });
  }

  function stopWatching() {
    if (watchAbort) {
      watchAbort.abort();
      watchAbort = null;
    }
  }

  return {
    expenses,
    loading,
    watchGroupExpenses,
    addExpense,
    settleUp,
    stopWatching,
  };
});
