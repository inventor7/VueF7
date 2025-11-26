export interface GroupRecord {
  id: string;
  name: string;
  currency: string | null;
  created_by: string;
  created_at: string;
}

export interface MemberRecord {
  id: string;
  group_id: string;
  user_id: string;
  joined_at: string;
}
