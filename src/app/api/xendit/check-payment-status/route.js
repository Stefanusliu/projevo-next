import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

export async function POST(request) {
  try {
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "Order ID is required" },
        { status: 400 }
      );
    }

    console.log("🔍 Checking Xendit payment status for order:", orderId);

    // Read Xendit API key from CSV file
    const csvPath = join(process.cwd(), "secret", "xendit_secret_api_key.csv");
    const csvContent = readFileSync(csvPath, "utf-8");
    const lines = csvContent.trim().split("\n");

    if (lines.length < 2) {
      throw new Error("Invalid CSV format");
    }

    const headers = lines[0].split(",");
    const values = lines[1].split(",");
    const keyIndex = headers.findIndex(
      (h) =>
        h.toLowerCase().includes("key") || h.toLowerCase().includes("secret")
    );

    if (keyIndex === -1 || !values[keyIndex]) {
      throw new Error("API key not found in CSV");
    }

    const apiKey = values[keyIndex].trim();
    console.log("🔑 Xendit API key loaded from CSV");

    // Check Xendit invoice status using the invoice ID (orderId)
    const xenditUrl = `https://api.xendit.co/v2/invoices/${orderId}`;

    console.log("📡 Checking Xendit invoice status:", xenditUrl);

    const response = await fetch(xenditUrl, {
      method: "GET",
      headers: {
        Authorization: `Basic ${Buffer.from(apiKey + ":").toString("base64")}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("❌ Xendit API error:", response.status, errorData);

      if (response.status === 404) {
        return NextResponse.json({
          success: false,
          status: "not_found",
          message: "Invoice not found",
        });
      }

      throw new Error(`Xendit API error: ${response.status}`);
    }

    const invoiceData = await response.json();
    console.log("💳 Xendit invoice data:", invoiceData);

    // Determine payment status based on Xendit response
    let paymentStatus = "pending";
    let isCompleted = false;
    let message = "";

    switch (invoiceData.status) {
      case "PAID":
        paymentStatus = "completed";
        isCompleted = true;
        message = "Payment completed successfully";
        break;
      case "PENDING":
        paymentStatus = "pending";
        message = "Payment is pending";
        break;
      case "EXPIRED":
        paymentStatus = "failed";
        message = "Payment expired";
        break;
      case "SETTLED":
        paymentStatus = "completed";
        isCompleted = true;
        message = "Payment settled successfully";
        break;
      default:
        paymentStatus = "unknown";
        message = `Unknown status: ${invoiceData.status}`;
    }

    return NextResponse.json({
      success: true,
      orderId: invoiceData.id,
      status: paymentStatus,
      isCompleted,
      message,
      invoiceStatus: invoiceData.status,
      amount: invoiceData.amount,
      paidAmount: invoiceData.paid_amount,
      paymentMethod: invoiceData.payment_method,
      paidAt: invoiceData.paid_at,
      createdAt: invoiceData.created,
      expiryDate: invoiceData.expiry_date,
      rawData: invoiceData,
    });
  } catch (error) {
    console.error("❌ Error checking Xendit payment status:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
