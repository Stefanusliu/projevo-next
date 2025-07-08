import fetch from 'node-fetch';

async function testOTPVerification() {
  const email = 'test.vendor@example.com';
  const otp = '1473'; // From the server logs
  const userId = 'test-user-id-12345'; // Simulate a Firebase user ID

  console.log('Testing OTP verification...');
  console.log('Email:', email);
  console.log('OTP:', otp);
  console.log('UserId:', userId);

  try {
    const response = await fetch('http://localhost:3000/api/auth/verify-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        otp: otp,
        userId: userId
      }),
    });

    const result = await response.json();
    console.log('\nOTP Verification Response:', result);

    if (!response.ok) {
      console.error('OTP Verification failed:', result);
    } else {
      console.log('\nOTP verification successful!');
      console.log('Check the server logs to see what document was created/updated.');
    }
    
  } catch (error) {
    console.error('Error testing OTP verification:', error);
  }
}

testOTPVerification();
