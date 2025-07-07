// Test script to create a sample project for testing dashboard
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Firebase config (should match your .env.local)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export async function createTestProject(userId) {
  try {
    const projectData = {
      // Basic project info
      title: 'Modern Office Interior Design',
      projectTitle: 'Modern Office Interior Design',
      description: 'Complete interior design and renovation for a modern corporate office space',
      
      // Location info
      city: 'Jakarta Selatan',
      province: 'DKI Jakarta',
      location: 'Jakarta Selatan',
      fullAddress: 'Jl. Sudirman No. 123, Jakarta Selatan',
      
      // Project details
      projectType: 'Interior Design',
      category: 'Interior Design',
      procurementMethod: 'Tender',
      propertyType: 'Commercial',
      estimatedBudget: 'Rp 150,000,000',
      budget: 'Rp 150,000,000',
      estimatedDuration: '3 months',
      duration: '3 months',
      estimatedStartDate: '2025-02-01',
      startDate: '2025-02-01',
      deadline: '2025-05-01',
      
      // Status and progress
      status: 'In Progress',
      progress: 45,
      
      // Owner info
      ownerId: userId,
      client: 'PT. Modern Office Solutions',
      
      // Timestamps
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      
      // Additional fields
      team: ['Designer A', 'Project Manager B'],
      milestones: [
        { name: 'Initial Design', completed: true, date: '2025-02-15' },
        { name: 'Material Selection', completed: true, date: '2025-03-01' },
        { name: 'Installation', completed: false, date: '2025-04-15' },
        { name: 'Final Review', completed: false, date: '2025-04-30' }
      ]
    };

    const docRef = await addDoc(collection(db, 'projects'), projectData);
    console.log('Test project created with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error creating test project:', error);
    throw error;
  }
}

export async function createTestCompletedProject(userId) {
  try {
    const projectData = {
      title: 'Restaurant Kitchen Renovation',
      projectTitle: 'Restaurant Kitchen Renovation',
      description: 'Complete renovation of commercial kitchen with modern equipment',
      
      city: 'Jakarta Pusat',
      province: 'DKI Jakarta',
      location: 'Jakarta Pusat',
      fullAddress: 'Jl. Thamrin No. 456, Jakarta Pusat',
      
      projectType: 'Renovation',
      category: 'Renovation',
      procurementMethod: 'Contract',
      propertyType: 'Commercial',
      estimatedBudget: 'Rp 250,000,000',
      budget: 'Rp 250,000,000',
      estimatedDuration: '2 months',
      duration: '2 months',
      estimatedStartDate: '2024-10-01',
      startDate: '2024-10-01',
      deadline: '2024-12-01',
      
      status: 'Completed',
      progress: 100,
      
      ownerId: userId,
      client: 'CV. Kuliner Nusantara',
      profileName: 'CV. Kuliner Nusantara',
      
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      completedDate: '2024-11-28',
      
      team: ['Contractor A', 'Architect B', 'Engineer C'],
      rating: 4.5,
      finalStatus: 'Successfully Completed',
      contractType: 'Contract'
    };

    const docRef = await addDoc(collection(db, 'projects'), projectData);
    console.log('Test completed project created with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error creating test completed project:', error);
    throw error;
  }
}
