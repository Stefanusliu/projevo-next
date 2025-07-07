// test-email.js
import { verifyEmailConfig, sendOTPEmail, generateOTP } from './src/lib/emailService.js';

async function testEmail() {
  console.log('Testing email configuration...');
  
  try {
    // Test email config
    const isValid = await verifyEmailConfig();
    console.log('Email config valid:', isValid);
    
    if (isValid) {
      // Test sending OTP
      const otp = generateOTP();
      console.log('Generated OTP:', otp);
      
      // Replace with a test email
      const result = await sendOTPEmail('kevinseptiansaputra@gmail.com', otp, 'Test User');
      console.log('Email sent result:', result);
    }
  } catch (error) {
    console.error('Email test failed:', error);
  }
}

testEmail();
