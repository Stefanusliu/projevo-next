// Simple script to create test payments - can be copy-pasted into browser console
// Make sure you're logged in to the dashboard first

const createTestPayments = async () => {
  // Check if we're in the right environment
  if (typeof window === 'undefined' || !window.location.href.includes('dashboard')) {
    console.log('❌ Please run this in the browser on the dashboard page while logged in');
    return;
  }

  console.log('🚀 Creating test payment data...');

  const testPayments = [
    {
      projectTitle: 'Rumah Minimalis Jakarta Selatan',
      vendor: 'PT. Konstruksi Prima',
      milestone: 'Foundation Work - 30%',
      amount: 'Rp 45,000,000',
      amountNumeric: 45000000,
      status: 'pending',
      dueDate: new Date('2024-12-15'),
      createdAt: new Date('2024-11-01'),
      category: 'Construction',
      priority: 'High',
      invoiceNumber: 'INV-2024-001',
      description: 'Payment for foundation work completion',
      notes: 'Awaiting approval for payment processing'
    },
    {
      projectTitle: 'Renovasi Villa Bogor',
      vendor: 'CV. Interior Solutions',
      milestone: 'Interior & Finishing - 90%',
      amount: 'Rp 125,500,000',
      amountNumeric: 125500000,
      status: 'completed',
      dueDate: new Date('2024-11-20'),
      paidDate: new Date('2024-11-18'),
      createdAt: new Date('2024-10-15'),
      category: 'Interior',
      priority: 'Medium',
      invoiceNumber: 'INV-2024-002',
      description: 'Payment for interior finishing work',
      paymentMethod: 'Bank Transfer',
      notes: 'Payment processed successfully'
    },
    {
      projectTitle: 'Kantor Startup Jakarta Pusat',
      vendor: 'PT. Mega Construction',
      milestone: 'Structure Completion - 50%',
      amount: 'Rp 89,750,000',
      amountNumeric: 89750000,
      status: 'overdue',
      dueDate: new Date('2024-11-10'),
      createdAt: new Date('2024-10-01'),
      category: 'Construction',
      priority: 'High',
      invoiceNumber: 'INV-2024-003',
      description: 'Payment for structural work completion',
      notes: 'Payment is overdue. Please process immediately.'
    },
    {
      projectTitle: 'Cafe Cozy Depok',
      vendor: 'CV. Bangun Jaya',
      milestone: 'Design Phase - 25%',
      amount: 'Rp 32,500,000',
      amountNumeric: 32500000,
      status: 'pending',
      dueDate: new Date('2024-12-05'),
      createdAt: new Date('2024-11-15'),
      category: 'Design',
      priority: 'Low',
      invoiceNumber: 'INV-2024-004',
      description: 'Payment for design phase completion',
      notes: 'Design approval pending from client'
    },
    {
      projectTitle: 'Apartemen Design Modern',
      vendor: 'PT. Professional Builder',
      milestone: 'Roofing & Walls - 70%',
      amount: 'Rp 156,000,000',
      amountNumeric: 156000000,
      status: 'completed',
      dueDate: new Date('2024-11-25'),
      paidDate: new Date('2024-11-23'),
      createdAt: new Date('2024-10-20'),
      category: 'Construction',
      priority: 'High',
      invoiceNumber: 'INV-2024-005',
      description: 'Payment for roofing and wall construction',
      paymentMethod: 'Credit Card',
      notes: 'Payment completed via corporate credit card'
    }
  ];

  // Add current user ID and additional fields
  const currentUser = window.firebase?.auth?.currentUser;
  if (!currentUser) {
    console.log('❌ No user logged in. Please log in first.');
    return;
  }

  console.log(`👤 Creating payments for user: ${currentUser.email}`);

  try {
    // You'll need to import Firebase functions or use them from window if available
    const { collection, addDoc, getFirestore } = window.firebase?.firestore || {};
    
    if (!collection || !addDoc || !getFirestore) {
      console.log('❌ Firebase Firestore not available. Please make sure Firebase is loaded.');
      return;
    }

    const db = getFirestore();
    
    for (let i = 0; i < testPayments.length; i++) {
      const payment = {
        ...testPayments[i],
        projectOwnerId: currentUser.uid,
        projectId: `proj_test_${Date.now()}_${i}`,
        vendorId: `vendor_${Math.floor(Math.random() * 1000)}`,
        contractNumber: `CON-${Math.floor(Math.random() * 100000)}`,
        taxAmount: Math.floor(testPayments[i].amountNumeric * 0.11),
        netAmount: Math.floor(testPayments[i].amountNumeric * 0.89),
        currency: 'IDR',
        paymentTerms: 'Net 30'
      };

      const docRef = await addDoc(collection(db, 'payments'), payment);
      console.log(`✅ Payment ${i + 1}/5 created with ID: ${docRef.id}`);
    }

    console.log('🎉 All test payments created successfully!');
    console.log('💡 You can now view them in the Payment Management section!');
    
  } catch (error) {
    console.error('❌ Error creating payments:', error);
  }
};

// Usage instructions
console.log(`
📖 USAGE INSTRUCTIONS:
1. Make sure you're logged into the dashboard
2. Open browser developer tools (F12)
3. Go to Console tab
4. Copy and paste this entire script
5. Run: createTestPayments()

This will create 5 realistic test payments in your Firebase database.
`);

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { createTestPayments };
}
