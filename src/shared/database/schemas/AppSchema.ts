import { column, Schema, Table } from "@powersync/web";

const groups = new Table({
  name: column.text,
  currency: column.text,
  created_by: column.text,
  created_at: column.text,
});

const members = new Table(
  {
    group_id: column.text,
    user_id: column.text,
    joined_at: column.text,
  },
  { indexes: { group: ["group_id"] } }
);

const expenses = new Table(
  {
    group_id: column.text,
    paid_by: column.text,
    amount: column.real,
    description: column.text,
    category: column.text,
    date: column.text,
    created_at: column.text,
  },
  { indexes: { group: ["group_id"] } }
);

const splits = new Table(
  {
    expense_id: column.text,
    user_id: column.text,
    amount_owed: column.real,
    group_id: column.text,
  },
  { indexes: { expense: ["expense_id"], group: ["group_id"] } }
);

const settlements = new Table(
  {
    group_id: column.text,
    payer_id: column.text,
    receiver_id: column.text,
    amount: column.real,
    date: column.text,
  },
  { indexes: { group: ["group_id"] } }
);

export const AppSchema = new Schema({
  groups,
  members,
  expenses,
  splits,
  settlements,
});

export type Database = (typeof AppSchema)["types"];
export type GroupRecord = Database["groups"];
export type MemberRecord = Database["members"];
export type ExpenseRecord = Database["expenses"];
export type SplitRecord = Database["splits"];
export type SettlementRecord = Database["settlements"];
