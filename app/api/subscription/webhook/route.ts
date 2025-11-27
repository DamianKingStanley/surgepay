import { NextResponse } from "next/server";

// /api/subscription/webhook/route.ts
export async function POST(req: Request) {
  const payload = await req.json();

  // Verify the secret hash
  const secret = process.env.FLW_WEBHOOK_SECRET;
  const signature = req.headers.get("verif-hash");
  if (signature !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Process event
  if (payload.event === "charge.completed") {
    // find user by tx_ref and activate plan same as verify route
  }

  return NextResponse.json({ received: true });
}
