import type { Kysely } from "kysely";
import type { GroupRecord, MemberRecord } from "@/modules/groups/types";
import type {
  ExpenseRecord,
  SplitRecord,
  SettlementRecord,
} from "@/modules/expenses/types";

export interface Database {
  groups: GroupRecord;
  members: MemberRecord;
  expenses: ExpenseRecord;
  splits: SplitRecord;
  settlements: SettlementRecord;
}

export type KyselyDatabase = Kysely<Database>;

export type {
  GroupRecord,
  MemberRecord,
  ExpenseRecord,
  SplitRecord,
  SettlementRecord,
};
