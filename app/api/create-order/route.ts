import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, receipt_id } = body;

    // Razorpay Integration Mock
    // Normally you'd do:
    // const razorpay = new Razorpay({ key_id: '...', key_secret: '...' });
    // const order = await razorpay.orders.create({ amount: amount * 100, currency: "INR", receipt: receipt_id });

    // Mock successful creation
    const mockOrder = {
      id: "order_" + Math.random().toString(36).substring(2, 10),
      amount: amount * 100,
      currency: "INR",
      receipt: receipt_id,
      status: "created"
    };

    return NextResponse.json(mockOrder);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
