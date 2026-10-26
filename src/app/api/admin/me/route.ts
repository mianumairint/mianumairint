import { NextResponse } from "next/server";
import { withAdmin } from "@/lib/api/route";

export const GET = withAdmin("get admin user", async (_req, _ctx, admin) =>
  NextResponse.json({ user: admin })
);
