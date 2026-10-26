import { NextResponse } from "next/server";
import { readCart } from "@/lib/cart-cookie";

export async function GET() {
  return NextResponse.json({ items: readCart() });
}
