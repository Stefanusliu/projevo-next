import { NextResponse } from 'next/server';

const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY;
const MIDTRANS_IS_PRODUCTION = process.env.MIDTRANS_IS_PRODUCTION === 'true';
const MIDTRANS_BASE_URL = MIDTRANS_IS_PRODUCTION 
  ? 'https://app.midtrans.com/snap/v1/transactions'
  : 'https://app.sandbox.midtrans.com/snap/v1/transactions';

export async function POST(request) {
  try {
    const { 
      projectId, 
      vendorId, 
      vendorName, 
      amount, 
      projectTitle, 
      projectOwnerEmail, 
      projectOwnerName,
      proposalIndex 
    } = await request.json();

    // Validate required fields
    if (!projectId || !vendorId || !amount || !projectOwnerEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Calculate 50% payment amount
    const paymentAmount = Math.round(amount * 0.5);
    const orderId = `PROJECT-${projectId}-${vendorId}-${Date.now()}`;

    // Prepare Midtrans Snap payload
    const payload = {
      transaction_details: {
        order_id: orderId,
        gross_amount: paymentAmount
      },
      customer_details: {
        first_name: projectOwnerName || 'Project Owner',
        email: projectOwnerEmail,
      },
      item_details: [
        {
          id: `vendor-selection-${projectId}`,
          price: paymentAmount,
          quantity: 1,
          name: `50% Down Payment for ${projectTitle || 'Project'}`,
          category: 'project_payment'
        }
      ],
      credit_card: {
        secure: true
      },
      custom_field1: projectId,
      custom_field2: vendorId,
      custom_field3: proposalIndex?.toString() || '0',
      callbacks: {
        finish: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/project-owner?payment=success&order_id=${orderId}`,
        error: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/project-owner?payment=error&order_id=${orderId}`,
        pending: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/project-owner?payment=pending&order_id=${orderId}`
      }
    };

    console.log('Creating Midtrans payment with payload:', payload);

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

    if (!response.ok) {
      console.error('Midtrans API error:', data);
      return NextResponse.json(
        { error: 'Failed to create payment token', details: data },
        { status: response.status }
      );
    }

    console.log('Midtrans response:', data);

    return NextResponse.json({
      token: data.token,
      redirect_url: data.redirect_url,
      order_id: orderId,
      amount: paymentAmount
    });

  } catch (error) {
    console.error('Error creating Midtrans payment:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
