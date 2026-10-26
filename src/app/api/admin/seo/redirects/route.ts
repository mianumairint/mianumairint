import { NextResponse } from "next/server";
import { ApiError, omit, withAdmin } from "@/lib/api/route";
import { getUserSupabase, mutate, mutateOne, newRow, selectMany } from "@/lib/supabase/server";
import { TABLES, type SeoRedirectRow } from "@/lib/supabase/types";

export const GET = withAdmin("fetch redirects", async () => {
  const redirects = await selectMany<SeoRedirectRow>(
    getUserSupabase()
      .from(TABLES.seoRedirect)
      .select("*")
      .order("createdAt", { ascending: false })
  );

  return NextResponse.json({ redirects });
});

export const POST = withAdmin("create redirect", async (req) => {
  const data = await req.json();

  const redirect = await mutateOne<SeoRedirectRow>(
    getUserSupabase()
      .from(TABLES.seoRedirect)
      .insert(
        newRow({
          fromPath: data.fromPath,
          toPath: data.toPath,
          type: data.type || "PERMANENT",
          isActive: data.isActive ?? true,
        })
      )
      .select("*")
      .single()
  );

  return NextResponse.json({ redirect }, { status: 201 });
});

export const PUT = withAdmin("update redirect", async (req) => {
  const body = await req.json();
  const patch = omit(body, ["id", "createdAt"]);
  const { id } = body;
  if (!id) throw new ApiError(400, "ID is required");

  const redirect = await mutateOne<SeoRedirectRow>(
    getUserSupabase()
      .from(TABLES.seoRedirect)
      .update(patch)
      .eq("id", id)
      .select("*")
      .single()
  );

  return NextResponse.json({ redirect });
});

export const DELETE = withAdmin("delete redirect", async (req) => {
  const id = new URL(req.url).searchParams.get("id");
  if (!id) throw new ApiError(400, "ID is required");

  await mutate(getUserSupabase().from(TABLES.seoRedirect).delete().eq("id", id));

  return NextResponse.json({ success: true });
});
