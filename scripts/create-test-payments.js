const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp } = require('firebase/firestore');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');

// Firebase configuration (use your actual config)
const firebaseConfig = {
  apiKey: "REDACTED",
  authDomain: "projevo-cc635.firebaseapp.com",
  projectId: "projevo-cc635",
  storageBucket: "projevo-cc635.firebasestorage.app",
  messagingSenderId: "756299030623",
  appId: "1:756299030623:web:d1f1b43f5c8b63bdcf6e90",
  measurementId: "G-9X2MXEJHDY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Test payment data generator
const generateTestPayments = () => {
  const projectTitles = [
    'Rumah Minimalis Jakarta Selatan',
    'Renovasi Villa Bogor',
    'Apartemen Design Modern',
    'Kantor Startup Jakarta Pusat',
    'Cafe Cozy Depok',
    'Rumah 2 Lantai Tangerang',
    'Interior Design Bekasi',
    'Kontruksi Ruko Serpong'
  ];

  const vendors = [
    'PT. Konstruksi Prima',
    'CV. Bangun Jaya',
    'PT. Interior Solutions',
    'CV. Mandiri Contractor',
    'PT. Mega Construction',
    'CV. Karya Utama',
    'PT. Professional Builder',
    'CV. Sukses Mandiri'
  ];

  const milestones = [
    'Foundation Work - 30%',
    'Structure Completion - 50%',
    'Roofing & Walls - 70%',
    'Interior & Finishing - 90%',
    'Final Completion - 100%',
    'Design Phase - 25%',
    'Material Purchase - 40%',
    'Installation Phase - 75%'
  ];

  const statuses = ['pending', 'completed', 'overdue'];
  
  const payments = [];

  // Generate 15 test payments
  for (let i = 0; i < 15; i++) {
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    const baseAmount = Math.floor(Math.random() * 200000000) + 10000000; // 10M - 210M
    const formattedAmount = `Rp ${baseAmount.toLocaleString('id-ID')}`;
    
    // Generate dates
    const createdDate = new Date();
    createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 90)); // Last 90 days
    
    const dueDate = new Date(createdDate);
    dueDate.setDate(dueDate.getDate() + Math.floor(Math.random() * 45) + 7); // 7-52 days from creation
    
    let paidDate = null;
    if (randomStatus === 'completed') {
      paidDate = new Date(createdDate);
      paidDate.setDate(paidDate.getDate() + Math.floor(Math.random() * 30) + 1);
    } else if (randomStatus === 'overdue') {
      // Make sure due date is in the past for overdue payments
      dueDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 15) - 1);
    }

    const payment = {
      projectTitle: projectTitles[Math.floor(Math.random() * projectTitles.length)],
      vendor: vendors[Math.floor(Math.random() * vendors.length)],
      milestone: milestones[Math.floor(Math.random() * milestones.length)],
      amount: formattedAmount,
      amountNumeric: baseAmount,
      status: randomStatus,
      createdAt: createdDate,
      dueDate: dueDate,
      paidDate: paidDate,
      projectOwnerId: '', // This will be set when we add to Firebase
      paymentMethod: randomStatus === 'completed' ? ['Bank Transfer', 'Credit Card', 'E-Wallet'][Math.floor(Math.random() * 3)] : null,
      invoiceNumber: `INV-${Date.now()}-${i.toString().padStart(3, '0')}`,
      description: `Payment for ${milestones[Math.floor(Math.random() * milestones.length)]}`,
      projectId: `proj_${Date.now()}_${i}`,
      vendorId: `vendor_${Math.floor(Math.random() * 1000)}`,
      category: ['Construction', 'Design', 'Material', 'Labor'][Math.floor(Math.random() * 4)],
      priority: ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)],
      notes: randomStatus === 'completed' ? 'Payment processed successfully' : 
             randomStatus === 'overdue' ? 'Payment is overdue, please process immediately' : 
             'Awaiting approval for payment processing'
    };

    payments.push(payment);
  }

  return payments;
};

// Function to add payments to Firebase
const addPaymentsToFirebase = async (userEmail, userPassword, projectOwnerId) => {
  try {
    console.log('🔑 Authenticating with Firebase...');
    
    // Sign in if credentials provided
    if (userEmail && userPassword) {
      await signInWithEmailAndPassword(auth, userEmail, userPassword);
      console.log('✅ Authenticated successfully');
    }

    console.log('📊 Generating test payment data...');
    const testPayments = generateTestPayments();
    
    console.log('💾 Adding payments to Firebase...');
    
    // Add each payment to Firestore
    for (let i = 0; i < testPayments.length; i++) {
      const payment = {
        ...testPayments[i],
        projectOwnerId: projectOwnerId || 'test-user-id',
        createdAt: testPayments[i].createdAt,
        dueDate: testPayments[i].dueDate,
        paidDate: testPayments[i].paidDate
      };

      const docRef = await addDoc(collection(db, 'payments'), payment);
      console.log(`✅ Payment ${i + 1}/15 added with ID:`, docRef.id);
    }

    console.log('🎉 All test payments created successfully!');
    console.log(`📈 Summary:`);
    console.log(`   - Total payments: ${testPayments.length}`);
    console.log(`   - Pending: ${testPayments.filter(p => p.status === 'pending').length}`);
    console.log(`   - Completed: ${testPayments.filter(p => p.status === 'completed').length}`);
    console.log(`   - Overdue: ${testPayments.filter(p => p.status === 'overdue').length}`);
    
  } catch (error) {
    console.error('❌ Error creating test payments:', error);
    throw error;
  }
};

// Function to create payments for current logged in user
const createTestPaymentsForCurrentUser = async () => {
  try {
    // Get current user from auth
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.log('❌ No user is currently logged in');
      console.log('💡 Please provide email and password, or log in first');
      return;
    }

    console.log(`👤 Creating payments for user: ${currentUser.email}`);
    await addPaymentsToFirebase(null, null, currentUser.uid);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
};

// Export functions for use in other scripts
module.exports = {
  generateTestPayments,
  addPaymentsToFirebase,
  createTestPaymentsForCurrentUser
};

// If running directly
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length >= 2) {
    const email = args[0];
    const password = args[1];
    const userId = args[2] || null;
    
    console.log('🚀 Starting test payment creation...');
    addPaymentsToFirebase(email, password, userId)
      .then(() => {
        console.log('✅ Script completed successfully');
        process.exit(0);
      })
      .catch((error) => {
        console.error('❌ Script failed:', error);
        process.exit(1);
      });
  } else {
    console.log('📖 Usage:');
    console.log('   node create-test-payments.js <email> <password> [userId]');
    console.log('');
    console.log('📝 Example:');
    console.log('   node create-test-payments.js user@example.com password123 user123');
    console.log('');
    console.log('💡 This will create 15 test payments with realistic data');
    process.exit(1);
  }
}
