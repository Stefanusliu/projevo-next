import { NextResponse } from "next/server";
import { db } from "../../../../lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";

// Xendit webhook verification token
const WEBHOOK_VERIFICATION_TOKEN =
  "sfDQ78ovuNRUh4dxDsyk4uXDJ99rwsawOUuWXu3By38NjwAb";

export async function POST(req) {
  try {
    // Verify webhook authenticity using x-callback-token header
    const callbackToken = req.headers.get("x-callback-token");

    if (!callbackToken || callbackToken !== WEBHOOK_VERIFICATION_TOKEN) {
      console.error("❌ Webhook verification failed:", {
        received_token: callbackToken ? "***REDACTED***" : "MISSING",
        expected: "***REDACTED***",
      });

      return NextResponse.json(
        { error: "Unauthorized webhook request" },
        { status: 401 }
      );
    }

    console.log("✅ Webhook verification successful");

    const body = await req.json();

    console.log("🔔 Xendit webhook received:", {
      external_id: body.external_id,
      status: body.status,
      amount: body.amount,
      paid_at: body.paid_at,
      payment_id: body.payment_id,
    });

    // Extract project ID from external_id (format: proj-{projectId}-{timestamp})
    const externalId = body.external_id;
    let projectId = null;

    if (externalId.startsWith("proj-")) {
      const parts = externalId.split("-");
      if (parts.length >= 3) {
        projectId = parts[1]; // Extract project ID from external_id
      }
    } else if (externalId.startsWith("invoice-")) {
      // Legacy format - we'll need to find project by other means
      console.log("⚠️ Legacy external_id format, searching by payment data");
    }

    // Validate webhook data
    if (!body.external_id || !body.status) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Handle payment status
    if (body.status === "PAID") {
      console.log("✅ Payment confirmed as PAID, updating project status");

      // Check for duplicate webhooks using payment_id
      if (await isDuplicateWebhook(body.payment_id)) {
        console.log("⚠️ Duplicate webhook detected, skipping processing");
        return NextResponse.json({
          message: "Duplicate webhook ignored",
          external_id: body.external_id,
          status: body.status,
          verified: true,
        });
      }

      if (projectId) {
        // Update specific project
        await updateProjectPaymentStatus(projectId, body);
      } else {
        // Search for project by external_id or other criteria
        await findAndUpdateProject(body);
      }
    } else if (body.status === "EXPIRED" || body.status === "FAILED") {
      console.log(`❌ Payment ${body.status}, no action needed`);
    } else {
      console.log(`⏳ Payment status: ${body.status}, monitoring...`);
    }

    // Always respond with 200 to acknowledge webhook
    return NextResponse.json({
      message: "Webhook processed successfully",
      external_id: body.external_id,
      status: body.status,
      verified: true,
    });
  } catch (error) {
    console.error("❌ Webhook processing error:", error);
    // Still return 200 to prevent Xendit from retrying
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message,
      },
      { status: 200 }
    );
  }
}

async function isDuplicateWebhook(paymentId) {
  try {
    // Check if we've already processed this payment_id
    const projectsRef = collection(db, "projects");
    const q = query(projectsRef, where("payment.orderId", "==", paymentId));

    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error("❌ Error checking for duplicate webhook:", error);
    return false; // If check fails, allow processing to avoid blocking legitimate webhooks
  }
}

async function updateProjectPaymentStatus(projectId, paymentData) {
  try {
    console.log(`🔄 Updating payment status for project: ${projectId}`);

    const projectRef = doc(db, "projects", projectId);
    const updateData = {
      firstPaymentCompleted: true,
      initialPaymentCompleted: true,
      paymentCompletedAt: new Date(paymentData.paid_at),
      status: "Berjalan", // Change status to running so vendor can start work
      payment: {
        status: "completed",
        orderId: paymentData.payment_id,
        externalId: paymentData.external_id,
        amount: paymentData.amount,
        paidAmount: paymentData.paid_amount,
        paymentMethod: paymentData.payment_method,
        paymentChannel: paymentData.payment_channel,
        paidAt: new Date(paymentData.paid_at),
        webhookProcessedAt: new Date(),
        updatedAt: new Date(),
      },
      webhookHistory: [
        {
          payment_id: paymentData.payment_id,
          status: paymentData.status,
          processedAt: new Date(),
          external_id: paymentData.external_id,
        },
      ],
      updatedAt: new Date(),
    };

    await updateDoc(projectRef, updateData);
    console.log(`✅ Project ${projectId} payment status updated successfully`);
  } catch (error) {
    console.error(`❌ Error updating project ${projectId}:`, error);
    throw error;
  }
}

async function findAndUpdateProject(paymentData) {
  try {
    console.log(
      "🔍 Searching for project with external_id:",
      paymentData.external_id
    );

    // Search for projects with matching payment external_id
    const projectsRef = collection(db, "projects");
    const q = query(
      projectsRef,
      where("payment.externalId", "==", paymentData.external_id)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log(
        "⚠️ No project found with external_id:",
        paymentData.external_id
      );
      return;
    }

    // Update all matching projects (should be only one)
    const updatePromises = [];
    querySnapshot.forEach((doc) => {
      console.log(`📝 Found project ${doc.id}, updating payment status`);

      const updateData = {
        firstPaymentCompleted: true,
        initialPaymentCompleted: true,
        paymentCompletedAt: new Date(paymentData.paid_at),
        status: "Berjalan", // Change status to running
        payment: {
          status: "completed",
          orderId: paymentData.payment_id,
          externalId: paymentData.external_id,
          amount: paymentData.amount,
          paidAmount: paymentData.paid_amount,
          paymentMethod: paymentData.payment_method,
          paymentChannel: paymentData.payment_channel,
          paidAt: new Date(paymentData.paid_at),
          webhookProcessedAt: new Date(),
          updatedAt: new Date(),
        },
        webhookHistory: [
          {
            payment_id: paymentData.payment_id,
            status: paymentData.status,
            processedAt: new Date(),
            external_id: paymentData.external_id,
          },
        ],
        updatedAt: new Date(),
      };

      updatePromises.push(updateDoc(doc.ref, updateData));
    });

    await Promise.all(updatePromises);
    console.log(`✅ Updated ${updatePromises.length} project(s)`);
  } catch (error) {
    console.error("❌ Error finding and updating project:", error);
    throw error;
  }
}
