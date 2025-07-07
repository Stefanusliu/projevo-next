// diagnostic.js - Test multiple configurations
const nodemailer = require('nodemailer');

// Test configurations
const configs = [
  {
    name: 'SSL Port 465',
    config: {
      host: 'smtp.hostinger.com',
      port: 465,
      secure: true,
      auth: { user: 'no-reply@projevo.com', pass: '3>jEWTDr' }
    }
  },
  {
    name: 'TLS Port 587',  
    config: {
      host: 'smtp.hostinger.com',
      port: 587,
      secure: false,
      auth: { user: 'no-reply@projevo.com', pass: '3>jEWTDr' },
      tls: { rejectUnauthorized: false }
    }
  }
];

async function testConfigs() {
  for (const { name, config } of configs) {
    console.log(`\n=== Testing ${name} ===`);
    try {
      const transporter = nodemailer.createTransporter(config);
      await transporter.verify();
      console.log('✅ Connection successful!');
      
      const result = await transporter.sendMail({
        from: 'no-reply@projevo.com',
        to: 'kevinseptiansaputra@gmail.com',
        subject: `Test - ${name}`,
        text: `Test email using ${name}`,
      });
      console.log('✅ Email sent! ID:', result.messageId);
      break;
    } catch (error) {
      console.error('❌ Failed:', error.message);
    }
  }
}

testConfigs();
