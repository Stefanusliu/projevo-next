// lib/emailService.js
import nodemailer from 'nodemailer';

// Create email transporter with better error handling
const createTransporter = () => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT) || 465, // Default to 465 for SSL
      secure: true, // Use SSL for port 465
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      debug: process.env.NODE_ENV === 'development', // Enable debug in development
      logger: process.env.NODE_ENV === 'development', // Enable logging in development
    });
    
    console.log('Email transporter created successfully');
    return transporter;
  } catch (error) {
    console.error('Failed to create email transporter:', error);
    throw error;
  }
};

const transporter = createTransporter();

// Generate 4-digit OTP
export function generateOTP() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// Send OTP email
export async function sendOTPEmail(email, otp, name = '') {
  console.log('Attempting to send OTP email to:', email);
  console.log('Email config check:', {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    user: process.env.EMAIL_USER,
    from: process.env.EMAIL_FROM,
    hasPassword: !!process.env.EMAIL_PASS
  });

  // Simplified email template to avoid JSON parsing issues
  const emailTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Email Verification - Projevo</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%); padding: 30px; text-align: center; color: white; border-radius: 10px;">
    <h1 style="margin: 0; font-size: 24px;">Projevo</h1>
    <p style="margin: 10px 0 0 0;">Construction Platform</p>
  </div>
  
  <div style="padding: 30px 0; text-align: center;">
    <h2 style="color: #2563eb;">Hello${name ? ` ${name}` : ''}! 👋</h2>
    
    <p>Thank you for signing up with <strong>Projevo</strong>! To complete your registration, please use this verification code:</p>
    
    <div style="background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 10px; padding: 20px; margin: 20px 0; display: inline-block;">
      <div style="font-size: 12px; color: #64748b; margin-bottom: 5px;">VERIFICATION CODE</div>
      <div style="font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 4px; font-family: monospace;">${otp}</div>
    </div>
    
    <p>This code is valid for <strong>10 minutes</strong>.</p>
    
    <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 5px; padding: 15px; margin: 20px 0;">
      ⚠️ <strong>Security Notice:</strong> Never share this code with anyone.
    </div>
  </div>
  
  <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center; color: #64748b; font-size: 14px;">
    <p><strong>Projevo Team</strong></p>
    <p>© 2025 Projevo. All rights reserved.</p>
  </div>
</body>
</html>`.trim();

  const mailOptions = {
    from: {
      name: process.env.EMAIL_FROM_NAME || 'Projevo',
      address: process.env.EMAIL_FROM
    },
    to: email,
    subject: `${otp} is your Projevo verification code`,
    html: emailTemplate,
    text: `Hello${name ? ` ${name}` : ''}! Your Projevo verification code is: ${otp}. This code is valid for 10 minutes. Never share this code with anyone.`
  };

  try {
    console.log('Sending email with options:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject
    });
    
    const info = await transporter.sendMail(mailOptions);
    console.log('OTP email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending OTP email:', error);
    console.error('Error details:', {
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode
    });
    throw new Error(`Failed to send verification email: ${error.message}`);
  }
}

// Generic send email function
export async function sendEmail({ to, subject, html }) {
  try {
    console.log('Attempting to send email to:', to);
    console.log('Subject:', subject);

    const mailOptions = {
      from: {
        name: 'Projevo Platform',
        address: process.env.EMAIL_FROM
      },
      to: to,
      subject: subject,
      html: html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return {
      success: true,
      messageId: info.messageId
    };
  } catch (error) {
    console.error('Email sending failed:', {
      error: error.message,
      code: error.code,
      responseCode: error.responseCode
    });
    throw new Error(`Failed to send email: ${error.message}`);
  }
}

// Verify email configuration
export async function verifyEmailConfig() {
  try {
    await transporter.verify();
    console.log('Email configuration is valid');
    return true;
  } catch (error) {
    console.error('Email configuration error:', error);
    return false;
  }
}
