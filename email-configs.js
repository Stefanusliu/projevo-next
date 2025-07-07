// Alternative email configurations for testing

// Hostinger SMTP Alternative 1 (TLS instead of SSL)
const hostingerConfig1 = {
  host: 'smtp.hostinger.com',
  port: 587,
  secure: false, // TLS
  auth: {
    user: 'no-reply@projevo.com',
    pass: '3>jEWTDr'
  },
  tls: {
    rejectUnauthorized: false
  }
};

// Hostinger SMTP Alternative 2 (Different port)
const hostingerConfig2 = {
  host: 'smtp.hostinger.com',
  port: 465,
  secure: true, // SSL
  auth: {
    user: 'no-reply@projevo.com',
    pass: '3>jEWTDr'
  },
  tls: {
    rejectUnauthorized: false
  }
};

// Gmail SMTP (for testing purposes)
const gmailConfig = {
  service: 'gmail',
  auth: {
    user: 'your-gmail@gmail.com',
    pass: 'your-app-password' // App password from Google
  }
};

// Outlook/Hotmail SMTP
const outlookConfig = {
  host: 'smtp-mail.outlook.com',
  port: 587,
  secure: false,
  auth: {
    user: 'your-email@outlook.com',
    pass: 'your-password'
  }
};

module.exports = {
  hostingerConfig1,
  hostingerConfig2,
  gmailConfig,
  outlookConfig
};
