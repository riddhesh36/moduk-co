import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function escapeCSV(val: unknown): string {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET() {
  try {
    const { data: orders, error } = await supabaseAdmin
      .from('orders')
      .select('*, delivery_slots(label)')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    const headers = [
      'Order ID',
      'Created At',
      'Customer Name',
      'Mobile',
      'Email',
      'Items',
      'Delivery Option',
      'Address Line 1',
      'Area',
      'City',
      'Pincode',
      'Slot Date',
      'Slot Label',
      'Total Amount',
      'Payment Method',
      'Payment Status',
      'Order Status',
      'Notes'
    ];

    const rows = (orders || []).map(order => {
      // Format items array into a readable string
      const itemsArr = Array.isArray(order.items) ? order.items : [];
      const itemsStr = itemsArr.map((item: unknown) => {
        const itemObj = item as Record<string, unknown>;
        const qty = (itemObj.quantity as number) || (itemObj.qty as number) || 1;
        const product = itemObj.product as Record<string, unknown> | undefined;
        const name = (product?.name as string) || (itemObj.name as string) || 'Unknown Item';
        return `${qty}x ${name}`;
      }).join('; ');

      return [
        order.display_id || '',
        order.created_at || '',
        order.customer_name || '',
        order.customer_mobile || '',
        order.customer_email || '',
        itemsStr,
        order.delivery_option || '',
        order.address_line1 || '',
        order.address_area || '',
        order.address_city || '',
        order.address_pincode || '',
        order.slot_date || '',
        order.delivery_slots?.label || order.slot_id || '',
        order.total_amount || 0,
        order.payment_method || '',
        order.payment_status || '',
        order.status || '',
        order.order_notes || ''
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(escapeCSV).join(','))
    ].join('\n');

    return new Response(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="orders.csv"',
      },
    });
  } catch (err: unknown) {
    const errorBody = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: errorBody }, { status: 500 });
  }
}
