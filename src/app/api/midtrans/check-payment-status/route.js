import { NextResponse } from 'next/server';

const MIDTRANS_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.midtrans.com/v2' 
  : 'https://api.sandbox.midtrans.com/v2';

const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    if (!MIDTRANS_SERVER_KEY) {
      console.error('❌ MIDTRANS_SERVER_KEY not configured');
      return NextResponse.json(
        { error: 'Payment service not configured' },
        { status: 500 }
      );
    }

    console.log('🔍 Checking payment status for order:', orderId);

    // Check transaction status with Midtrans
    const response = await fetch(`${MIDTRANS_BASE_URL}/${orderId}/status`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(MIDTRANS_SERVER_KEY + ':').toString('base64')}`
      }
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ Midtrans API error:', response.status, errorData);
      
      if (response.status === 404) {
        return NextResponse.json({
          success: false,
          status: 'not_found',
          message: 'Transaction not found'
        });
      }
      
      throw new Error(`Midtrans API error: ${response.status}`);
    }

    const paymentData = await response.json();
    console.log('💳 Midtrans payment data:', paymentData);

    // Determine payment status based on Midtrans response
    let paymentStatus = 'pending';
    let isCompleted = false;
    let message = '';

    switch (paymentData.transaction_status) {
      case 'capture':
        if (paymentData.payment_type === 'credit_card') {
          if (paymentData.fraud_status === 'accept') {
            paymentStatus = 'completed';
            isCompleted = true;
            message = 'Payment completed successfully';
          } else {
            paymentStatus = 'pending';
            message = 'Payment under review';
          }
        } else {
          paymentStatus = 'completed';
          isCompleted = true;
          message = 'Payment completed successfully';
        }
        break;
      
      case 'settlement':
        paymentStatus = 'completed';
        isCompleted = true;
        message = 'Payment settled successfully';
        break;
      
      case 'pending':
        paymentStatus = 'pending';
        message = 'Payment is pending';
        break;
      
      case 'deny':
      case 'cancel':
      case 'expire':
        paymentStatus = 'failed';
        message = `Payment ${paymentData.transaction_status}`;
        break;
      
      default:
        paymentStatus = 'unknown';
        message = `Unknown status: ${paymentData.transaction_status}`;
    }

    return NextResponse.json({
      success: true,
      orderId: paymentData.order_id,
      status: paymentStatus,
      isCompleted,
      message,
      transactionStatus: paymentData.transaction_status,
      paymentType: paymentData.payment_type,
      grossAmount: paymentData.gross_amount,
      transactionTime: paymentData.transaction_time,
      fraudStatus: paymentData.fraud_status,
      rawData: paymentData
    });

  } catch (error) {
    console.error('❌ Error checking payment status:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to check payment status',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
