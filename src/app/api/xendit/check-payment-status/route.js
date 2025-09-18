import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

export async function POST(request) {
  try {
    const { orderId, external_id } = await request.json();

    // Accept both orderId and external_id for backward compatibility
    const paymentId = orderId || external_id;

    if (!paymentId) {
      return NextResponse.json(
        { success: false, error: "Order ID or External ID is required" },
        { status: 400 }
      );
    }

    console.log("🔍 Checking Xendit payment status for payment ID:", paymentId);

    // Read Xendit API key from CSV file (same method as create-payment)
    const csvPath = join(process.cwd(), "secret", "xendit_secret_api_key.csv");
    const csvContent = readFileSync(csvPath, "utf-8");
    const lines = csvContent.split("\n");
    const apiKey = lines[1].split(",")[1].replace(/"/g, "").trim();
    console.log("🔑 Xendit API key loaded from CSV");

    let xenditUrl;
    let isExternalIdQuery = false;

    // If the payment ID looks like our external_id format (proj-xxx-xxx), use the invoice lookup
    if (paymentId.startsWith("proj-")) {
      // Use Xendit's GET invoices endpoint with external_id filter for invoices
      xenditUrl = `https://api.xendit.co/v2/invoices?external_id=${paymentId}`;
      isExternalIdQuery = true;
      console.log("📡 Searching for invoice by external_id:", xenditUrl);
    } else {
      // Use direct invoice lookup with invoice ID
      xenditUrl = `https://api.xendit.co/v2/invoices/${paymentId}`;
      console.log("📡 Looking up invoice by ID:", xenditUrl);
    }

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

    let invoiceData;
    if (isExternalIdQuery) {
      // When searching by external_id, we get an array of invoices
      const responseData = await response.json();
      console.log(
        "📋 External ID search response:",
        JSON.stringify(responseData, null, 2)
      );

      if (Array.isArray(responseData) && responseData.length > 0) {
        // Get the most recent invoice with this external_id
        invoiceData = responseData[0];
        console.log("✅ Found invoice via external_id:", invoiceData.id);
      } else if (responseData.data && responseData.data.length > 0) {
        // Alternative response format with data wrapper
        invoiceData = responseData.data[0];
        console.log(
          "✅ Found invoice via external_id (wrapped):",
          invoiceData.id
        );
      } else {
        console.log(
          "❌ No invoices found in response for external_id:",
          paymentId
        );
        return NextResponse.json({
          success: false,
          status: "not_found",
          message: "No invoice found with this external_id",
          debug: {
            external_id: paymentId,
            response_format: typeof responseData,
            response_keys: Object.keys(responseData || {}),
            response_sample: responseData,
          },
        });
      }
    } else {
      // Direct invoice lookup returns a single invoice object
      invoiceData = await response.json();
    }

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
