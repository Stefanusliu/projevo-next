# Projevo - Project Management Platform

Projevo is a comprehensive project management platform that connects project owners with qualified vendors for construction, interior design, architecture, and renovation projects in Indonesia.

## 🚀 Features

### Core Platform
- **Project Management**: Create, manage, and track construction projects
- **Vendor Marketplace**: Browse and connect with qualified contractors and vendors
- **Proposal System**: Submit, review, and negotiate project proposals
- **BOQ Management**: Handle Bill of Quantities with detailed pricing
- **User Management**: Separate dashboards for project owners and vendors

### 💳 Payment Integration (NEW)
- **Midtrans Snap Integration**: Secure payment processing for vendor selection
- **50% Down Payment**: Automatic payment requirement when selecting a vendor for the first time
- **Payment Notifications**: Email notifications for both project owners and vendors
- **Webhook Processing**: Automatic vendor selection upon successful payment

### 📧 Communication
- **Email Notifications**: Automated notifications for project updates
- **Proposal Negotiations**: Built-in negotiation system with counter-offers
- **Status Updates**: Real-time project and proposal status tracking

## 🛠 Technology Stack

- **Frontend**: Next.js 15, React, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth with custom phone verification
- **Email**: SMTP integration (Hostinger)
- **Payment**: Midtrans Snap payment gateway
- **File Storage**: Firebase Storage

## 📋 Prerequisites

- Node.js 18+ 
- Firebase project with Firestore enabled
- Midtrans account (for payment processing)
- SMTP email service (configured with Hostinger)

## 🚀 Getting Started

### 1. Clone and Install
```bash
git clone <repository-url>
cd projevo
npm install
```

### 2. Environment Setup
Copy `.env.example` to `.env.local` and configure:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
# ... other Firebase config

# Midtrans Payment Gateway
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=your_client_key
MIDTRANS_SERVER_KEY=your_server_key
MIDTRANS_IS_PRODUCTION=false
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Email Configuration
EMAIL_HOST=smtp.hostinger.com
EMAIL_PORT=465
EMAIL_USER=your_email
EMAIL_PASS=your_password
EMAIL_FROM=your_email
```

### 3. Firebase Setup
1. Create a Firebase project
2. Enable Firestore Database
3. Configure authentication methods
4. Add your Firebase config to `.env.local`

### 4. Midtrans Setup
1. Create a Midtrans account
2. Get sandbox credentials for testing
3. Configure webhook URL: `your-domain/api/midtrans/webhook`
4. Add credentials to `.env.local`

### 5. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 🧪 Testing

### Payment Flow Testing
Visit [http://localhost:3000/test/midtrans](http://localhost:3000/test/midtrans) to test the payment integration.

**Test Cards (Sandbox):**
- Success: `4811 1111 1111 1114`
- Failure: `4011 1111 1111 1112`
- CVV: Any 3 digits
- Expiry: Any future date

### User Flow Testing
1. **Project Owner**: Create projects, review proposals, select vendors
2. **Vendor**: Browse projects, submit proposals, negotiate terms
3. **Payment**: Test the 50% down payment flow when selecting vendors

## 📁 Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── midtrans/      # Payment processing endpoints
│   │   ├── auth/          # Authentication endpoints
│   │   └── ...
│   ├── dashboard/         # User dashboards
│   │   ├── project-owner/ # Project owner interface
│   │   ├── vendor/        # Vendor interface
│   │   └── admin/         # Admin interface
│   └── ...
├── components/            # Reusable React components
│   ├── payments/          # Payment-related components
│   ├── ui/               # UI components
│   └── ...
├── contexts/             # React contexts
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
└── utils/                # Helper utilities
```

## 🔧 Key Components

### Payment System
- `MidtransPaymentModal`: Payment interface component
- `/api/midtrans/create-payment`: Creates payment tokens
- `/api/midtrans/webhook`: Processes payment notifications

### Project Management
- `ProjectOwnerDetailPage`: Manage projects and vendor selection
- `VendorDashboard`: Vendor project marketplace and proposal management
- `BOQDisplay`: Bill of Quantities management

### User Management
- `AuthContext`: Authentication state management
- `LoginForm`: User authentication interface
- Role-based access control

## 🔐 Security Features

- Firebase Authentication with phone verification
- Server-side API route protection
- Secure payment processing with Midtrans
- Email verification and validation
- Environment variable protection

## 📧 Email Notifications

Automated emails are sent for:
- Vendor selection and payment confirmation
- Proposal acceptance/rejection
- Project status updates
- Account verification

## 🚀 Deployment

### Vercel Deployment
1. Connect your repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Set up custom domain and SSL
4. Configure Midtrans webhook with production URL

### Environment Variables for Production
- Set `MIDTRANS_IS_PRODUCTION=true`
- Use production Midtrans credentials
- Update `NEXT_PUBLIC_APP_URL` to your domain
- Configure production email settings

## 📚 Documentation

- [Midtrans Setup Guide](./MIDTRANS_SETUP_GUIDE.md) - Detailed payment integration setup
- [Security Guide](./PRODUCTION_SECURITY_GUIDE.md) - Production security checklist
- [API Documentation](./docs/api.md) - API endpoints documentation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For technical support or questions:
- Email: support@projevo.com
- Documentation: See guides in the repository
- Midtrans Support: [Midtrans Help Center](https://help.midtrans.com)

## 📄 License

This project is proprietary software. All rights reserved.
