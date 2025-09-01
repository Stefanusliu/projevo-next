import { NextResponse } from 'next/server';
import { adminDb } from '../../../../lib/firebase-admin';
import { sendEmail } from '../../../../lib/emailService';
import { doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db as clientDb } from '../../../../lib/firebase';

const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY;

export async function POST(request) {
  try {
    const body = await request.text();
    const notification = JSON.parse(body);

    console.log('Midtrans webhook received:', notification);

    // Verify the signature (recommended for production)
    // You should implement signature verification here for security

    const { 
      order_id, 
      transaction_status, 
      fraud_status,
      gross_amount,
      custom_field1: projectId,
      custom_field2: vendorId,
      custom_field3: proposalIndex
    } = notification;

    // Determine payment status
    let paymentStatus = 'pending';
    let shouldCompleteVendorSelection = false;

    if (transaction_status === 'capture' || transaction_status === 'settlement') {
      if (fraud_status === 'accept' || !fraud_status) {
        paymentStatus = 'success';
        shouldCompleteVendorSelection = true;
      }
    } else if (transaction_status === 'cancel' || transaction_status === 'deny' || transaction_status === 'expire') {
      paymentStatus = 'failed';
    } else if (transaction_status === 'pending') {
      paymentStatus = 'pending';
    }

    console.log(`Payment status for order ${order_id}: ${paymentStatus}`);

    // Store payment record in Firestore
    const paymentData = {
      orderId: order_id,
      projectId,
      vendorId,
      proposalIndex: parseInt(proposalIndex) || 0,
      amount: parseFloat(gross_amount),
      paymentType: 'vendor_selection_downpayment',
      status: paymentStatus,
      transactionStatus: transaction_status,
      fraudStatus: fraud_status,
      midtransResponse: notification,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Save payment record (existing logic)
    await db.collection('payments').doc(order_id).set(paymentData);

    // Also update our new payment structure
    try {
      const paymentId = `payment_${order_id}`;
      const paymentRef = doc(clientDb, 'payments', paymentId);
      const paymentDoc = await getDoc(paymentRef);
      
      if (paymentDoc.exists()) {
        const updateData = {
          status: paymentStatus === 'success' ? 'completed' : paymentStatus === 'failed' ? 'failed' : 'pending',
          transactionStatus: transaction_status,
          fraudStatus: fraud_status,
          updatedAt: serverTimestamp(),
          webhookData: notification
        };

        await updateDoc(paymentRef, updateData);
        console.log('New payment structure updated:', paymentId);
      }
    } catch (clientDbError) {
      console.error('Error updating client DB payment:', clientDbError);
    }

    // Update project payment status
    try {
      const projectRef = doc(clientDb, 'projects', projectId);
      const projectDoc = await getDoc(projectRef);
      
      if (projectDoc.exists()) {
        const projectData = projectDoc.data();
        if (projectData.payment && projectData.payment.orderId === order_id) {
          const projectPaymentUpdate = {
            'payment.status': paymentStatus === 'success' ? 'completed' : paymentStatus === 'failed' ? 'failed' : 'pending',
            'payment.transactionStatus': transaction_status,
            'payment.fraudStatus': fraud_status,
            'payment.updatedAt': serverTimestamp(),
            'payment.webhookData': notification,
            updatedAt: serverTimestamp()
          };

          await updateDoc(projectRef, projectPaymentUpdate);
          console.log('✅ Project payment status updated:', projectId, 'Status:', paymentStatus);
        }
      }
    } catch (projectUpdateError) {
      console.error('❌ Error updating project payment status:', projectUpdateError);
    }

    if (shouldCompleteVendorSelection) {
      try {
        // Complete the vendor selection process
        await completeVendorSelection(projectId, vendorId, parseInt(proposalIndex) || 0, order_id);
        
        console.log(`✅ Vendor selection completed for project ${projectId}, vendor ${vendorId}`);
      } catch (error) {
        console.error('❌ Error completing vendor selection:', error);
        // Don't fail the webhook, but log the error
      }
    }

    return NextResponse.json({ status: 'OK' });

  } catch (error) {
    console.error('Error processing Midtrans webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function completeVendorSelection(projectId, vendorId, proposalIndex, orderId) {
  try {
    // Get project data
    const projectRef = db.collection('projects').doc(projectId);
    const projectDoc = await projectRef.get();
    
    if (!projectDoc.exists) {
      throw new Error(`Project ${projectId} not found`);
    }

    const projectData = projectDoc.data();
    const proposals = projectData.proposals || [];
    
    if (proposalIndex >= proposals.length) {
      throw new Error(`Proposal index ${proposalIndex} out of range`);
    }

    const selectedProposal = proposals[proposalIndex];
    const now = new Date();

    // Update the selected proposal status
    const updatedProposals = [...proposals];
    updatedProposals[proposalIndex] = {
      ...selectedProposal,
      status: 'selected',
      selectedAt: now,
      paymentOrderId: orderId,
      negotiation: {
        ...selectedProposal.negotiation,
        status: 'selected',
        selectedAt: now,
        paymentCompleted: true,
        paymentOrderId: orderId,
        history: [
          ...(selectedProposal.negotiation?.history || []),
          {
            action: 'vendor_selected_payment_completed',
            by: 'system',
            timestamp: now,
            message: `Payment completed. Vendor ${selectedProposal.vendorName} has been selected for this project.`,
            orderId: orderId
          }
        ]
      }
    };

    // Update project with vendor selection
    const projectUpdates = {
      proposals: updatedProposals,
      status: 'vendor_selected',
      selectedVendorId: vendorId,
      selectedVendorName: selectedProposal.vendorName,
      selectedProposalIndex: proposalIndex,
      vendorSelectedAt: now,
      paymentOrderId: orderId,
      isPaymentCompleted: true,
      updatedAt: now,
      lastModifiedBy: 'system_payment'
    };

    await projectRef.update(projectUpdates);

    // Send notification email to vendor
    try {
      await sendVendorNotification(projectData, selectedProposal, orderId);
    } catch (emailError) {
      console.error('❌ Error sending vendor notification email:', emailError);
      // Don't fail the entire process if email fails
    }

    // Send confirmation email to project owner
    try {
      await sendProjectOwnerConfirmation(projectData, selectedProposal, orderId);
    } catch (emailError) {
      console.error('❌ Error sending project owner confirmation email:', emailError);
      // Don't fail the entire process if email fails
    }

    console.log(`✅ Successfully completed vendor selection for project ${projectId}`);

  } catch (error) {
    console.error('❌ Error in completeVendorSelection:', error);
    throw error;
  }
}

async function sendVendorNotification(projectData, selectedProposal, orderId) {
  const vendorEmail = selectedProposal.vendorEmail;
  const vendorName = selectedProposal.vendorName;
  const projectTitle = projectData.title || projectData.projectTitle || 'Project';
  
  if (!vendorEmail) {
    console.warn('⚠️ No vendor email found, skipping vendor notification');
    return;
  }

  const emailContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2373FF;">🎉 Congratulations! You've Been Selected!</h2>
      
      <p>Dear ${vendorName},</p>
      
      <p>Great news! Your proposal has been accepted and you have been selected as the vendor for the following project:</p>
      
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #333;">Project Details</h3>
        <p><strong>Project:</strong> ${projectTitle}</p>
        <p><strong>Client:</strong> ${projectData.ownerName || projectData.client || 'Project Owner'}</p>
        <p><strong>Order ID:</strong> ${orderId}</p>
        <p><strong>Status:</strong> Payment Completed ✅</p>
      </div>
      
      <p>The project owner has completed the 50% down payment, and the project is now ready to begin.</p>
      
      <div style="background-color: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h4 style="margin-top: 0; color: #1976d2;">Next Steps:</h4>
        <ul style="margin-bottom: 0;">
          <li>Log into your vendor dashboard to view project details</li>
          <li>Contact the project owner to coordinate project kickoff</li>
          <li>Begin work according to your proposed timeline</li>
          <li>Submit progress updates through the platform</li>
        </ul>
      </div>
      
      <p>You can access your project dashboard to view all details and communicate with the project owner.</p>
      
      <p style="margin-top: 30px;">
        Best regards,<br>
        <strong>Projevo Team</strong>
      </p>
    </div>
  `;

  await sendEmail({
    to: vendorEmail,
    subject: `🎉 Project Award Confirmation - ${projectTitle}`,
    html: emailContent
  });

  console.log(`✅ Vendor notification email sent to ${vendorEmail}`);
}

async function sendProjectOwnerConfirmation(projectData, selectedProposal, orderId) {
  const ownerEmail = projectData.ownerEmail;
  const ownerName = projectData.ownerName || 'Project Owner';
  const projectTitle = projectData.title || projectData.projectTitle || 'Project';
  
  if (!ownerEmail) {
    console.warn('⚠️ No project owner email found, skipping owner confirmation');
    return;
  }

  const emailContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2373FF;">✅ Payment Successful - Vendor Selection Completed</h2>
      
      <p>Dear ${ownerName},</p>
      
      <p>Your payment has been successfully processed and your vendor selection is now complete!</p>
      
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #333;">Project & Payment Details</h3>
        <p><strong>Project:</strong> ${projectTitle}</p>
        <p><strong>Selected Vendor:</strong> ${selectedProposal.vendorName}</p>
        <p><strong>Order ID:</strong> ${orderId}</p>
        <p><strong>Payment Status:</strong> Completed ✅</p>
      </div>
      
      <div style="background-color: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h4 style="margin-top: 0; color: #2e7d32;">What Happens Next:</h4>
        <ul style="margin-bottom: 0;">
          <li>The selected vendor has been notified of their selection</li>
          <li>Your project is now ready to begin</li>
          <li>You can communicate with your vendor through the platform</li>
          <li>Track project progress in your dashboard</li>
        </ul>
      </div>
      
      <p>You can now coordinate with your selected vendor to begin the project. All communication and progress tracking can be done through your project dashboard.</p>
      
      <p style="margin-top: 30px;">
        Thank you for using Projevo!<br>
        <strong>Projevo Team</strong>
      </p>
    </div>
  `;

  await sendEmail({
    to: ownerEmail,
    subject: `✅ Payment Successful - Vendor Selected for ${projectTitle}`,
    html: emailContent
  });

  console.log(`✅ Project owner confirmation email sent to ${ownerEmail}`);
}
