import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import axios from "axios";

// Read Xendit secret API key from CSV
const secretPath = path.resolve(
  process.cwd(),
  "secret/xendit_secret_api_key.csv"
);
const csvContent = fs.readFileSync(secretPath, "utf8");
// Parse CSV to get the API key from the second row, second column
const lines = csvContent.split("\n");
const secretApiKey = lines[1].split(",")[1].replace(/"/g, "").trim();

export async function POST(req) {
  try {
    const body = await req.json();
    const { amount, payerEmail, description, projectId } = body;

    // Create unique external ID with project info for better tracking
    const externalId = `proj-${projectId}-${Date.now()}`;
    
    // Create invoice via Xendit API
    const response = await axios.post(
      "https://api.xendit.co/v2/invoices",
      {
        external_id: externalId,
        amount,
        payer_email: payerEmail,
        description,
        // Add metadata for better tracking
        metadata: {
          project_id: projectId,
          payment_type: "termin_payment",
          environment: "development"
        },
        // Set longer expiry for testing (24 hours)
        invoice_duration: 86400,
        success_redirect_url: `${
          process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
        }/payment-success?external_id=${externalId}`,
        failure_redirect_url: `${
          process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
        }/payment-failure?external_id=${externalId}`,
      },
      {
        auth: {
          username: secretApiKey,
          password: "",
        },
      }
    );

    console.log("✅ Xendit invoice created:", {
      external_id: externalId,
      invoice_id: response.data.id,
      amount,
      status: response.data.status
    });

    return NextResponse.json({ 
      invoice_url: response.data.invoice_url,
      external_id: externalId,
      invoice_id: response.data.id,
      status: response.data.status
    });
  } catch (error) {
    console.error("Xendit API Error:", error.response?.data || error.message);
    return NextResponse.json(
      {
        error: error.response?.data?.message || error.message,
      },
      { status: 500 }
    );
  }
}
