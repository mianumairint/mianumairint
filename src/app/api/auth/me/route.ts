import { NextResponse } from "next/server";
import { withUser } from "@/lib/api/route";

export const GET = withUser("get user", async (_req, _ctx, user) =>
  NextResponse.json({ user })
);
