import fetch from 'node-fetch';

async function testSignup() {
  const testData = {
    firstName: 'Test',
    lastName: 'Vendor',
    email: 'test.vendor@example.com',
    phoneNumber: '+628123456789',
    userType: 'vendor',
    companyName: 'Test Company',
    displayName: 'Test Vendor'
  };

  console.log('Testing signup flow...');
  console.log('Test data:', testData);
  console.log('userType:', testData.userType);
  console.log('typeof userType:', typeof testData.userType);

  try {
    // Step 1: Send OTP
    console.log('\n--- Step 1: Sending OTP ---');
    const otpResponse = await fetch('http://localhost:3000/api/auth/send-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testData.email,
        name: `${testData.firstName} ${testData.lastName}`,
        userData: testData
      }),
    });

    const otpResult = await otpResponse.json();
    console.log('OTP Response:', otpResult);

    if (!otpResponse.ok) {
      console.error('Failed to send OTP:', otpResult);
      return;
    }

    console.log('\nOTP sent successfully!');
    console.log('Check the server logs to see the userData being stored.');
    
  } catch (error) {
    console.error('Error testing signup:', error);
  }
}

testSignup();
