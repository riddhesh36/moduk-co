import { NextResponse } from "next/server";

// In a real app, these would be in .env.local
// const INTERAKT_API_KEY = process.env.INTERAKT_API_KEY || "YOUR_INTERAKT_API_KEY";
// const INTERAKT_API_URL = "https://api.interakt.ai/v1/public/message/";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderDetails, waNumber, customerName } = body;

    if (!waNumber) {
      return NextResponse.json({ error: "WhatsApp number is required" }, { status: 400 });
    }

    // Prepare Interakt payload
    // Template: order_confirmation
    // Expected variables: customer_name, order_id, total_amount
    const payload = {
      phoneNumber: waNumber.startsWith('+') ? waNumber : `+91${waNumber}`, // Assuming India for now
      event: "Order Confirmation",
      traits: {
        name: customerName,
        orderId: orderDetails.id,
        totalAmount: orderDetails.totalAmount
      }
    };

    console.log(`[WHATSAPP] Sending confirmation to ${payload.phoneNumber} for order ${orderDetails.id}`);

    // Real API call (commented out until API key is provided)
    /*
    const response = await fetch(INTERAKT_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${INTERAKT_API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to send WhatsApp message");
    }
    */

    return NextResponse.json({ 
      success: true, 
      message: "Notification queued",
      mock: true 
    });
  } catch (err: unknown) {
    const errorBody = err instanceof Error ? err.message : String(err);
    console.error("[WHATSAPP ERROR]", errorBody);
    return NextResponse.json({ error: errorBody }, { status: 500 });
  }
}
