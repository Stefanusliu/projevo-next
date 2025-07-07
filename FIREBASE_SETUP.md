# Firebase Setup for Projevo

This document explains how to set up and configure Firebase for the Projevo project.

## 🔥 Firebase Services Used

- **Firebase Authentication**: Email/Password, Phone, Google Sign-in
- **Firestore Database**: Real-time NoSQL database for storing project data
- **Firebase Storage**: File storage for images, documents, and BOQ files
- **Firebase Admin SDK**: Server-side operations and authentication verification

## 📋 Prerequisites

1. Firebase project created at [Firebase Console](https://console.firebase.google.com/)
2. Authentication methods enabled (Email/Password, Phone, Google)
3. Firestore Database created in production mode
4. Storage bucket created
5. Service account key generated

## 🛠️ Setup Instructions

### 1. Environment Variables

Copy `.env.example` to `.env.local` and fill in your Firebase configuration:

```bash
cp .env.example .env.local
```

**Required Environment Variables:**

**Client-side (Firebase SDK):**
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

**Server-side (Admin SDK):**
- `FIREBASE_PROJECT_ID`
- `FIREBASE_PRIVATE_KEY`
- `FIREBASE_CLIENT_EMAIL`
- And other service account details...

### 2. Getting Firebase Configuration

#### Client-side Configuration:
1. Go to Firebase Console → Project Settings
2. Scroll down to "Your apps" section
3. Click on the web app or create one
4. Copy the configuration object values

#### Server-side Configuration:
1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate new private key"
3. Download the JSON file
4. Extract values from the JSON to environment variables

### 3. Firebase Security Rules

Deploy the security rules for Firestore and Storage:

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project
firebase init

# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Storage rules
firebase deploy --only storage
```

## 📱 Authentication Setup

### Enable Authentication Methods:

1. **Email/Password**: 
   - Go to Authentication → Sign-in method
   - Enable Email/Password

2. **Google Sign-in**:
   - Enable Google provider
   - Add your domain to authorized domains

3. **Phone Authentication**:
   - Enable Phone provider
   - Configure reCAPTCHA (automatic in production)

## 🗃️ Database Structure

### Collections:

- **users**: User profiles and settings
- **projects**: Project information and details
- **bids**: Vendor bids on projects
- **boqs**: Bill of Quantities documents
- **vendors**: Vendor profiles and portfolios
- **reviews**: Project and vendor reviews
- **payments**: Payment transactions

## 📁 Storage Structure

```
/profile-images/{userId}/
/project-files/{projectId}/
/boq-files/{userId}/
/vendor-portfolio/{vendorId}/
/documents/{userId}/
```

## 🔧 Usage Examples

### Authentication:
```javascript
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { user, signIn, signUp, logout } = useAuth();
  
  // Use authentication methods
}
```

### Firestore:
```javascript
import { useCollection, firestoreService } from '../hooks/useFirestore';

function ProjectList() {
  const { documents: projects, loading } = useCollection('projects');
  
  const addProject = async () => {
    await firestoreService.add('projects', { name: 'New Project' });
  };
}
```

### Storage:
```javascript
import { useStorage } from '../hooks/useStorage';

function FileUpload() {
  const { uploadFile, uploading, uploadProgress } = useStorage();
  
  const handleUpload = async (file) => {
    const url = await uploadFile(file, 'project-files/image.jpg');
  };
}
```

## 🚀 Deployment

### Vercel Environment Variables:

Add all environment variables from `.env.local` to your Vercel project:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add each variable from `.env.local`
3. Make sure to set the environment (Production, Preview, Development)

### Important Notes:

- Never commit `.env.local` to version control
- The service account private key should be properly escaped in environment variables
- Use `NEXT_PUBLIC_` prefix only for client-side variables
- Server-side variables (without `NEXT_PUBLIC_`) are only available in API routes

## 🧪 Testing Firebase Integration

A demo component is available at `/components/firebase/FirebaseDemo.js` that demonstrates:

- Authentication (Email/Password, Google)
- Real-time Firestore operations
- File upload to Storage
- Error handling

To test, add the component to any page:

```javascript
import FirebaseDemo from '../components/firebase/FirebaseDemo';

export default function TestPage() {
  return <FirebaseDemo />;
}
```

## 🔒 Security Considerations

1. **Firestore Rules**: Properly configured to restrict access based on user ownership
2. **Storage Rules**: File size limits and user-based access control
3. **Environment Variables**: Sensitive data properly separated
4. **Authentication**: Token verification on server-side API routes

## 📊 Real-time Features

The setup supports real-time updates for:
- **Live bidding**: Automatic updates when new bids are placed
- **Project status**: Real-time project status changes
- **Chat/messaging**: Real-time communication between users
- **Notifications**: Instant updates for important events

## 🛟 Troubleshooting

### Common Issues:

1. **Authentication errors**: Check if domains are added to Firebase authorized domains
2. **Firestore permission denied**: Verify security rules and user authentication
3. **Storage upload fails**: Check file size limits and storage rules
4. **Environment variables not working**: Ensure proper naming and restart development server

### Debug Mode:

Enable Firebase debug mode in development:

```javascript
// Add to firebase config
const app = initializeApp(firebaseConfig);
if (process.env.NODE_ENV === 'development') {
  // Enable debug mode
}
```

## 📞 Support

For Firebase-specific issues:
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Support](https://firebase.google.com/support)

For project-specific issues:
- Check the project's GitHub issues
- Contact the development team
