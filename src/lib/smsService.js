// lib/smsService.js
// SMS service integration for phone verification

/**
 * SMS Service Provider Options:
 * 1. Twilio - Most popular, reliable
 * 2. AWS SNS - Good for AWS infrastructure
 * 3. MessageBird - European alternative
 * 4. Vonage (Nexmo) - Good global coverage
 */

// Example Twilio Integration
export async function sendSMSWithTwilio(phoneNumber, message) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;
  
  if (!accountSid || !authToken || !fromNumber) {
    throw new Error('Twilio credentials not configured');
  }
  
  const twilio = require('twilio')(accountSid, authToken);
  
  try {
    const result = await twilio.messages.create({
      body: message,
      from: fromNumber,
      to: phoneNumber
    });
    
    return {
      success: true,
      messageId: result.sid,
      status: result.status
    };
  } catch (error) {
    console.error('Twilio SMS error:', error);
    throw new Error(`Failed to send SMS: ${error.message}`);
  }
}

// Example AWS SNS Integration
export async function sendSMSWithAWS(phoneNumber, message) {
  const AWS = require('aws-sdk');
  
  // Configure AWS
  AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'us-east-1'
  });
  
  const sns = new AWS.SNS();
  
  const params = {
    Message: message,
    PhoneNumber: phoneNumber,
    MessageAttributes: {
      'AWS.SNS.SMS.SMSType': {
        DataType: 'String',
        StringValue: 'Transactional'
      }
    }
  };
  
  try {
    const result = await sns.publish(params).promise();
    return {
      success: true,
      messageId: result.MessageId
    };
  } catch (error) {
    console.error('AWS SNS error:', error);
    throw new Error(`Failed to send SMS: ${error.message}`);
  }
}

// Indonesian SMS Provider Example (for local market)
export async function sendSMSWithLocal(phoneNumber, message) {
  // Example with Indonesian SMS providers like:
  // - Zenziva
  // - Kirim.Email
  // - SMS Gateway Indonesia
  
  const apiKey = process.env.SMS_GATEWAY_API_KEY;
  const apiUrl = process.env.SMS_GATEWAY_URL;
  
  if (!apiKey || !apiUrl) {
    throw new Error('SMS Gateway credentials not configured');
  }
  
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        phone: phoneNumber,
        message: message,
        type: 'sms'
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      return {
        success: true,
        messageId: result.id
      };
    } else {
      throw new Error(result.message || 'SMS sending failed');
    }
  } catch (error) {
    console.error('Local SMS Gateway error:', error);
    throw new Error(`Failed to send SMS: ${error.message}`);
  }
}

// Main SMS sending function
export async function sendOTPSMS(phoneNumber, otp) {
  const message = `Your Projevo verification code is: ${otp}. This code will expire in 5 minutes. Do not share this code with anyone.`;
  
  // Choose your SMS provider based on environment variables
  const smsProvider = process.env.SMS_PROVIDER || 'development';
  
  switch (smsProvider) {
    case 'twilio':
      return await sendSMSWithTwilio(phoneNumber, message);
    
    case 'aws':
      return await sendSMSWithAWS(phoneNumber, message);
    
    case 'local':
      return await sendSMSWithLocal(phoneNumber, message);
    
    case 'development':
    default:
      // Development mode - just log the message
      console.log(`📱 SMS would be sent to ${phoneNumber}: ${message}`);
      return {
        success: true,
        messageId: 'dev-' + Date.now(),
        development: true
      };
  }
}

// Environment variables needed for each provider:

/*
## Twilio Setup (.env.local):
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token  
TWILIO_PHONE_NUMBER=+1234567890
SMS_PROVIDER=twilio

## AWS SNS Setup (.env.local):
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
SMS_PROVIDER=aws

## Local Provider Setup (.env.local):
SMS_GATEWAY_API_KEY=your_api_key
SMS_GATEWAY_URL=https://api.smsgateway.com/send
SMS_PROVIDER=local

## Development (default):
SMS_PROVIDER=development
*/
