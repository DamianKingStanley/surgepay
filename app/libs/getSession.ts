/* eslint-disable @typescript-eslint/no-unused-vars */
import { getServerSession } from "next-auth/next";
import { authOptions } from "./authOptions";
import { headers } from "next/headers";

export async function getSession() {
  try {
    const session = await getServerSession(authOptions);
    return session;
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
}

export async function getCurrentUser() {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return null;
    }

    const { connectToDatabase } = await import("./mongodb");
    const User = (await import("../models/User")).default;

    await connectToDatabase();

    const user = await User.findById(session.user.id).select("-password");
    return user;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}
