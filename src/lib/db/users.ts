import { getUserSupabase, selectOne, selectPage } from "@/lib/supabase/server";
import { TABLES, type UserRow } from "@/lib/supabase/types";

/**
 * USER PROFILE QUERIES
 * ====================
 * Passwords are not here. Supabase Auth owns credentials, and `User` is only
 * the profile: name, phone, role and the link to orders and reviews. Rows are
 * created by a database trigger when an account is added, so this module never
 * inserts one.
 *
 * Every query uses the session-bound client, because the policies only expose
 * a user their own profile -- and an admin everyone's.
 */

export type PublicUser = Pick<
  UserRow,
  "id" | "name" | "email" | "role" | "phone" | "createdAt"
>;

const PUBLIC_COLUMNS = "id,name,email,role,phone,createdAt";

export async function getPublicUserById(id: string): Promise<PublicUser | null> {
  return selectOne<PublicUser>(
    getUserSupabase().from(TABLES.user).select(PUBLIC_COLUMNS).eq("id", id).maybeSingle()
  );
}

export interface CustomerCard extends PublicUser {
  _count: { orders: number };
}

/** Customer list for the dashboard, with each customer's order count. */
export async function listCustomers(
  from: number,
  to: number
): Promise<{ rows: CustomerCard[]; total: number }> {
  type Raw = PublicUser & { orders: { count: number }[] };

  const { rows, total } = await selectPage<Raw>(
    getUserSupabase()
      .from(TABLES.user)
      .select(`${PUBLIC_COLUMNS},orders:Order(count)`, { count: "exact" })
      .eq("role", "CUSTOMER")
      .order("createdAt", { ascending: false })
      .range(from, to)
  );

  return {
    total,
    rows: rows.map(({ orders, ...user }) => ({
      ...user,
      _count: { orders: orders[0]?.count ?? 0 },
    })),
  };
}
