/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../libs/authOptions";
import { connectToDatabase } from "../../../libs/mongodb";
import User from "../../../models/User"; // still used for school admin

const FLW_SECRET_KEY = process.env.NEXT_PUBLIC_FLW_PUBLIC_KEY as string;

// Plan pricing configuration
const PLAN_PRICES = {
  term: {
    Basic: 25000,
    Standard: 45000,
    Premium: 75000,
    Flex: 0, // Custom pricing
  },
  annual: {
    Basic: 63750, // 15% discount
    Standard: 114750, // 15% discount
    Premium: 191250, // 15% discount
    Flex: 0, // Custom pricing
  },
};

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const { planName, planType, email } = await req.json();

    if (!planName || !planType || !email) {
      return NextResponse.json(
        { error: "Missing plan details" },
        { status: 400 }
      );
    }

    // Get amount from pricing configuration
    const amount =
      PLAN_PRICES[planType as keyof typeof PLAN_PRICES]?.[
        planName as keyof typeof PLAN_PRICES.term
      ];

    if (amount === undefined) {
      return NextResponse.json(
        { error: "Invalid plan configuration" },
        { status: 400 }
      );
    }

    // For Flex plan, redirect to contact form
    if (planName === "Flex" && amount === 0) {
      return NextResponse.json({
        success: true,
        customPlan: true,
        message: "Please contact sales for custom pricing",
      });
    }
    // Generate unique transaction reference
    const txRef = `CLASSIKA-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Prepare Flutterwave payment
    const response = await fetch("https://api.flutterwave.com/v3/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${FLW_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tx_ref: txRef,
        amount: amount,
        currency: "NGN",
        redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/callback`,
        customer: {
          email: email,
          name: session.user.name || "School Admin",
        },
        customizations: {
          title: "Classika Subscription",
          description: `Subscription for ${planName} plan (${planType})`,
          logo: `${process.env.NEXT_PUBLIC_BASE_URL}/logo.png`,
        },
      }),
    });

    const data = await response.json();

    if (!data.status || data.status !== "success") {
      return NextResponse.json(
        { error: "Failed to initialize payment" },
        { status: 500 }
      );
    }

    // Save the pending subscription in the user's document
    const school = await User.findById(session.user.id);
    school.subscription = {
      planName,
      planType,
      amount,
      status: "inactive",
      txRef,
    };
    await school.save();

    return NextResponse.json({
      success: true,
      checkoutUrl: data.data.link, // Flutterwave checkout link
    });
  } catch (err: any) {
    console.error("Payment init error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
