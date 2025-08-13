import { NextResponse } from 'next/server';
import { adminDb } from '../../../../lib/firebase-admin';

const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY;
const MIDTRANS_IS_PRODUCTION = process.env.MIDTRANS_IS_PRODUCTION === 'true';
const MIDTRANS_BASE_URL = MIDTRANS_IS_PRODUCTION 
  ? 'https://app.midtrans.com/snap/v1/transactions'
  : 'https://app.sandbox.midtrans.com/snap/v1/transactions';

export async function POST(request) {
  try {
    const requestBody = await request.json();
    console.log('💰 CREATE PAYMENT API DEBUG:');
    console.log('  - Received request body:', requestBody);
    
    const { 
      projectId, 
      vendorId, 
      vendorName, 
      amount, 
      projectTitle, 
      projectOwnerEmail, 
      projectOwnerName,
      projectOwnerId, // Add user ID
      proposalIndex 
    } = requestBody;

    console.log('  - Extracted fields:', {
      projectId,
      vendorId,
      vendorName,
      amount,
      projectTitle,
      projectOwnerEmail,
      projectOwnerName,
      projectOwnerId,
      proposalIndex
    });

    // Validate required fields
    if (!projectId || !vendorId || !amount || !projectOwnerEmail) {
      console.log('Missing required fields:', { projectId, vendorId, amount, projectOwnerEmail });
      return NextResponse.json(
        { error: 'Missing required fields', missing: { projectId: !projectId, vendorId: !vendorId, amount: !amount, projectOwnerEmail: !projectOwnerEmail } },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(projectOwnerEmail)) {
      console.log('Invalid email format:', projectOwnerEmail);
      return NextResponse.json(
        { error: 'Invalid email format', email: projectOwnerEmail },
        { status: 400 }
      );
    }

    // Validate amount is a number
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      console.log('Invalid amount:', amount);
      return NextResponse.json(
        { error: 'Invalid amount', amount },
        { status: 400 }
      );
    }

    // Calculate 50% payment amount - ensure it's an integer (Midtrans requirement)
    const paymentAmount = Math.round(numericAmount * 0.5);
    
    // Validate minimum amount (Midtrans minimum is usually 1000 IDR)
    if (paymentAmount < 1000) {
      console.log('Payment amount too small:', paymentAmount);
      return NextResponse.json(
        { error: 'Payment amount must be at least 1000 IDR', paymentAmount },
        { status: 400 }
      );
    }

    // Create order ID with only alphanumeric and dash characters (Midtrans requirement)
    // Order ID must be unique and can contain alphanumeric, dash, underscore, and dot
    const timestamp = Date.now();
    const projectIdClean = projectId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10);
    const vendorIdClean = vendorId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10);
    const orderId = `PRJ-${projectIdClean}-VND-${vendorIdClean}-${timestamp}`;

    console.log('Payment calculation:', { 
      originalAmount: numericAmount, 
      paymentAmount,
      orderId,
      orderIdLength: orderId.length
    });

    // Prepare Midtrans Snap payload
    const payload = {
      transaction_details: {
        order_id: orderId,
        gross_amount: paymentAmount
      },
      customer_details: {
        first_name: projectOwnerName || 'Project Owner',
        email: projectOwnerEmail.trim().toLowerCase(),
        phone: "+628123456789" // Default phone number for testing
      },
      item_details: [
        {
          id: `payment-${projectId.slice(0, 8)}`,
          price: paymentAmount,
          quantity: 1,
          name: "50% Down Payment",
          category: "project_payment"
        }
      ],
      credit_card: {
        secure: true
      },
      custom_field1: projectId,
      custom_field2: vendorId,
      custom_field3: proposalIndex?.toString() || '0',
      callbacks: {
        finish: `${process.env.NEXT_PUBLIC_APP_URL || 'https://localhost:3000'}/dashboard/project-owner?payment=success&order_id=${orderId}`,
        error: `${process.env.NEXT_PUBLIC_APP_URL || 'https://localhost:3000'}/dashboard/project-owner?payment=error&order_id=${orderId}`,
        pending: `${process.env.NEXT_PUBLIC_APP_URL || 'https://localhost:3000'}/dashboard/project-owner?payment=pending&order_id=${orderId}`
      }
    };

    // Validate that gross_amount equals sum of item_details
    const itemTotal = payload.item_details.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (payload.transaction_details.gross_amount !== itemTotal) {
      console.error('Amount validation failed:', {
        gross_amount: payload.transaction_details.gross_amount,
        item_total: itemTotal,
        item_details: payload.item_details
      });
      return NextResponse.json(
        { error: 'Internal calculation error - amount mismatch', gross_amount: payload.transaction_details.gross_amount, item_total: itemTotal },
        { status: 500 }
      );
    }

    console.log('Creating Midtrans payment with payload:', JSON.stringify(payload, null, 2));
    console.log('Payload validation:', {
      order_id_length: payload.transaction_details.order_id.length,
      gross_amount: payload.transaction_details.gross_amount,
      item_name_length: payload.item_details[0].name.length,
      item_total: payload.item_details.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      email_format: payload.customer_details.email
    });

    // Create Midtrans Snap transaction
    const response = await fetch(MIDTRANS_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(MIDTRANS_SERVER_KEY + ':').toString('base64')}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    console.log('Midtrans response status:', response.status);
    console.log('Midtrans response data:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      console.error('Midtrans API error:', data);
      return NextResponse.json(
        { error: 'Failed to create payment token', details: data, status: response.status },
        { status: response.status }
      );
    }

    // Save payment information to Firebase
    const paymentId = `payment_${orderId}`;
    const paymentDocData = {
      orderId: orderId,
      projectId: projectId,
      vendorId: vendorId,
      projectOwnerId: projectOwnerId || projectOwnerEmail, // Use user ID if available, fallback to email
      amount: paymentAmount,
      originalAmount: numericAmount,
      paymentType: '50% Down Payment',
      status: 'process', // Set to process so it appears in payment management
      snapToken: data.token,
      snapUrl: data.redirect_url,
      projectTitle: projectTitle || 'Untitled Project',
      vendorName: vendorName || 'Unknown Vendor',
      projectOwnerName: projectOwnerName || 'Unknown Owner',
      projectOwnerEmail: projectOwnerEmail,
      proposalIndex: proposalIndex || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      paymentProvider: 'midtrans',
      environment: MIDTRANS_IS_PRODUCTION ? 'production' : 'sandbox'
    };

    try {
      // Save to payments collection using admin SDK
      await adminDb.collection('payments').doc(paymentId).set(paymentDocData);
      console.log('✅ Payment saved to Firebase successfully:', paymentId);
      console.log('💾 Payment data saved:', JSON.stringify(paymentDocData, null, 2));

      // Also update the project with payment information using admin SDK
      const projectUpdateData = {
        payment: {
          orderId: orderId,
          paymentId: paymentId,
          snapToken: data.token,
          snapUrl: data.redirect_url,
          amount: paymentAmount,
          status: 'process', // Set to process so it appears in payment management
          paymentType: '50% Down Payment',
          vendorId: vendorId,
          vendorName: vendorName,
          proposalIndex: proposalIndex || 0,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        updatedAt: new Date()
      };

      await adminDb.collection('projects').doc(projectId).update(projectUpdateData);
      console.log('✅ Project updated with payment info:', projectId);
      console.log('💾 Project payment data:', JSON.stringify(projectUpdateData, null, 2));

    } catch (firebaseError) {
      console.error('❌ Error saving payment to Firebase:', firebaseError);
      // Continue anyway since Midtrans token was created successfully
    }

    console.log('Midtrans response:', data);

    return NextResponse.json({
      token: data.token,
      redirect_url: data.redirect_url,
      order_id: orderId,
      paymentId: paymentId,
      amount: paymentAmount,
      status: 'success'
    });

  } catch (error) {
    console.error('Error creating Midtrans payment:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
