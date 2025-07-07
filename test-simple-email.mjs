// Simple email test
import { sendOTPEmail, generateOTP } from '../src/lib/emailService.js';

async function testSimpleEmail() {
  try {
    const otp = generateOTP();
    console.log('Testing with OTP:', otp);
    
    const result = await sendOTPEmail('kevinseptiansaputra@gmail.com', otp, 'Test User');
    console.log('✅ Email sent successfully:', result);
  } catch (error) {
    console.error('❌ Email test failed:', error);
    console.error('Error type:', typeof error);
    console.error('Error message:', error.message);
  }
}

testSimpleEmail();
