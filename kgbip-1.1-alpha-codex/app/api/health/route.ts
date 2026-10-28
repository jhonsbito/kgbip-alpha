import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({ service: "kgbip", status: "ok", timestamp: new Date().toISOString() });
}
