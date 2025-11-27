/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/subscription/check-expiry/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../libs/mongodb";
import User from "../../../models/User";

export async function GET() {
  try {
    await connectToDatabase();

    const now = new Date();

    // Find all active subscriptions that have expired
    const expiredSubscriptions = await User.find({
      "subscription.status": "active",
      "subscription.expiryDate": { $lt: now },
    });

    // Update expired subscriptions
    const updatePromises = expiredSubscriptions.map(async (user) => {
      user.subscription.status = "expired";
      // Reset to free plan limits
      user.subscription.limits = {
        teachers: 2,
        students: 5,
        quizzes: 2,
        attendance: 2,
        lessonnotes: 2,
        exams: 2,
        jobs: 3,
      };
      await user.save();

      // Send expiration notification (you can implement this)
    });

    await Promise.all(updatePromises);

    return NextResponse.json({
      success: true,
      expiredCount: expiredSubscriptions.length,
      message: `Checked ${expiredSubscriptions.length} expired subscriptions`,
    });
  } catch (error: any) {
    console.error("Subscription check error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
