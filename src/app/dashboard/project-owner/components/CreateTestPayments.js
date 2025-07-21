'use client';

import { useState } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../../../lib/firebase';

export default function CreateTestPayments() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('');

  // Generate test payment data
  const generateTestPayments = () => {
    const projectTitles = [
      'Rumah Minimalis Jakarta Selatan',
      'Renovasi Villa Bogor',
      'Apartemen Design Modern',
      'Kantor Startup Jakarta Pusat',
      'Cafe Cozy Depok',
      'Rumah 2 Lantai Tangerang',
      'Interior Design Bekasi',
      'Konstruksi Ruko Serpong',
      'Pembangunan Warehouse',
      'Renovasi Gedung Perkantoran'
    ];

    const vendors = [
      'PT. Konstruksi Prima',
      'CV. Bangun Jaya',
      'PT. Interior Solutions',
      'CV. Mandiri Contractor',
      'PT. Mega Construction',
      'CV. Karya Utama',
      'PT. Professional Builder',
      'CV. Sukses Mandiri',
      'PT. Cipta Karya',
      'CV. Berkah Construction'
    ];

    const milestones = [
      'Foundation Work - 30%',
      'Structure Completion - 50%',
      'Roofing & Walls - 70%',
      'Interior & Finishing - 90%',
      'Final Completion - 100%',
      'Design Phase - 25%',
      'Material Purchase - 40%',
      'Installation Phase - 75%',
      'Site Preparation - 15%',
      'Quality Check - 95%'
    ];

    const statuses = ['pending', 'completed', 'overdue'];
    const categories = ['Construction', 'Design', 'Material', 'Labor', 'Equipment'];
    const priorities = ['High', 'Medium', 'Low'];
    const paymentMethods = ['Bank Transfer', 'Credit Card', 'E-Wallet', 'Cash'];
    
    const payments = [];

    // Generate 20 test payments
    for (let i = 0; i < 20; i++) {
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      const baseAmount = Math.floor(Math.random() * 300000000) + 5000000; // 5M - 305M
      
      // Generate dates
      const createdDate = new Date();
      createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 120)); // Last 120 days
      
      const dueDate = new Date(createdDate);
      dueDate.setDate(dueDate.getDate() + Math.floor(Math.random() * 60) + 7); // 7-67 days from creation
      
      let paidDate = null;
      if (randomStatus === 'completed') {
        paidDate = new Date(createdDate);
        paidDate.setDate(paidDate.getDate() + Math.floor(Math.random() * 45) + 1);
      } else if (randomStatus === 'overdue') {
        // Make sure due date is in the past for overdue payments
        const today = new Date();
        dueDate.setDate(today.getDate() - Math.floor(Math.random() * 30) - 1);
      }

      const payment = {
        projectTitle: projectTitles[Math.floor(Math.random() * projectTitles.length)],
        vendor: vendors[Math.floor(Math.random() * vendors.length)],
        vendorName: vendors[Math.floor(Math.random() * vendors.length)],
        milestone: milestones[Math.floor(Math.random() * milestones.length)],
        amount: `Rp ${baseAmount.toLocaleString('id-ID')}`,
        amountNumeric: baseAmount,
        status: randomStatus,
        createdAt: createdDate.toISOString(),
        dueDate: dueDate.toISOString(),
        paidDate: paidDate ? paidDate.toISOString() : null,
        projectOwnerId: user?.uid || 'test-user-id',
        paymentMethod: randomStatus === 'completed' ? paymentMethods[Math.floor(Math.random() * paymentMethods.length)] : null,
        invoiceNumber: `INV-${Date.now()}-${i.toString().padStart(3, '0')}`,
        description: `Payment for ${milestones[Math.floor(Math.random() * milestones.length)]}`,
        projectId: `proj_${Date.now()}_${i}`,
        vendorId: `vendor_${Math.floor(Math.random() * 10000)}`,
        category: categories[Math.floor(Math.random() * categories.length)],
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        notes: randomStatus === 'completed' ? 
          'Payment processed successfully via ' + (paymentMethods[Math.floor(Math.random() * paymentMethods.length)]) : 
          randomStatus === 'overdue' ? 
          'Payment is overdue. Please process immediately to avoid penalties.' : 
          'Awaiting approval for payment processing. All documents submitted.',
        
        // Additional realistic fields
        contractNumber: `CON-${Math.floor(Math.random() * 100000)}`,
        taxAmount: Math.floor(baseAmount * 0.11), // 11% tax
        netAmount: Math.floor(baseAmount * 0.89),
        currency: 'IDR',
        paymentTerms: ['Net 30', 'Net 15', 'Net 45', 'Upon Completion'][Math.floor(Math.random() * 4)],
        approvedBy: randomStatus !== 'pending' ? ['John Manager', 'Sarah Director', 'Mike Supervisor'][Math.floor(Math.random() * 3)] : null,
        bankAccount: randomStatus === 'completed' ? `${Math.floor(Math.random() * 9000000000) + 1000000000}` : null,
        referenceNumber: randomStatus === 'completed' ? `TXN${Date.now()}${Math.floor(Math.random() * 1000)}` : null
      };

      payments.push(payment);
    }

    return payments;
  };

  const createTestPayments = async () => {
    if (!user?.uid) {
      setStatus('❌ Please log in first to create test payments');
      return;
    }

    setIsLoading(true);
    setStatus('🚀 Starting to create test payments...');

    try {
      const testPayments = generateTestPayments();
      setStatus(`📊 Generated ${testPayments.length} test payments. Adding to Firebase...`);

      let successCount = 0;
      let errorCount = 0;

      // Add each payment to Firestore
      for (let i = 0; i < testPayments.length; i++) {
        try {
          const docRef = await addDoc(collection(db, 'payments'), testPayments[i]);
          successCount++;
          setStatus(`✅ Added payment ${i + 1}/${testPayments.length} (ID: ${docRef.id})`);
          
          // Small delay to avoid overwhelming Firestore
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          errorCount++;
          console.error(`Error adding payment ${i + 1}:`, error);
        }
      }

      const summary = testPayments.reduce((acc, payment) => {
        acc[payment.status] = (acc[payment.status] || 0) + 1;
        return acc;
      }, {});

      setStatus(`🎉 Test payments creation completed!
      
📈 Summary:
   ✅ Successfully added: ${successCount}
   ❌ Failed: ${errorCount}
   📊 Total payments: ${testPayments.length}
   ⏳ Pending: ${summary.pending || 0}
   ✅ Completed: ${summary.completed || 0}
   ⚠️ Overdue: ${summary.overdue || 0}
   
💡 You can now view them in the Payment Management section!`);

    } catch (error) {
      console.error('Error creating test payments:', error);
      setStatus(`❌ Error creating test payments: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-300 p-6 max-w-2xl mx-auto">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-black mb-4">Create Test Payment Data</h2>
        <p className="text-gray-600 mb-6">
          This will create realistic test payment data in Firebase for development and testing purposes.
        </p>
        
        {user?.uid ? (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>User:</strong> {user.email}<br/>
              <strong>User ID:</strong> {user.uid}
            </p>
          </div>
        ) : (
          <div className="mb-6 p-4 bg-red-50 rounded-lg">
            <p className="text-sm text-red-800">
              ⚠️ You need to be logged in to create test payments
            </p>
          </div>
        )}

        <button
          onClick={createTestPayments}
          disabled={isLoading || !user?.uid}
          className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
            isLoading || !user?.uid
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'text-white hover:opacity-90'
          }`}
          style={!isLoading && user?.uid ? { backgroundColor: '#2373FF' } : {}}
        >
          {isLoading ? '🔄 Creating Test Payments...' : '🚀 Create 20 Test Payments'}
        </button>

        {status && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg text-left">
            <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
              {status}
            </pre>
          </div>
        )}

        <div className="mt-6 text-sm text-gray-500">
          <p><strong>What this creates:</strong></p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>20 realistic payment records</li>
            <li>Mixed status: Pending, Completed, Overdue</li>
            <li>Indonesian project names and vendors</li>
            <li>Realistic amounts (5M - 305M IDR)</li>
            <li>Proper milestone descriptions</li>
            <li>Dates spanning last 120 days</li>
            <li>Invoice numbers and reference data</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
