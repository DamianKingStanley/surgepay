/* eslint-disable @typescript-eslint/no-unused-vars */
import { getServerSession } from "next-auth";
import { authOptions } from "./authOptions"; // Adjust path if needed
import { NextRequest, NextResponse } from "next/server";

// Middleware for admin-only access in API or server actions
export async function authAdminOnly(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user.id || session.user.userRole !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return session.user;
}
