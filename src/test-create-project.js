// Test script to create a sample project for testing dashboard
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './lib/firebase'; // Use existing Firebase instance

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
      ],
      
      // Scope
      scope: ['Interior Design', 'Furniture Selection'],
      scopes: ['Interior Design', 'Furniture Selection']
    };

    const docRef = await addDoc(collection(db, 'projects'), projectData);
    console.log('Test project created with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error creating test project:', error);
    throw error;
  }
}

export async function createTestTenderProject(userId) {
  try {
    const currentDate = new Date();
    const tenderDeadline = new Date(currentDate.getTime() + (7 * 24 * 60 * 60 * 1000)); // 7 days from now
    
    const projectData = {
      // Basic project info
      title: 'Luxury Villa Construction Project',
      projectTitle: 'Luxury Villa Construction Project',
      description: 'Complete construction of a modern luxury villa with eco-friendly materials and smart home integration.',
      
      // Location info
      city: 'Jakarta Utara',
      province: 'DKI Jakarta',
      location: 'Jakarta Utara',
      fullAddress: 'Jl. Pantai Indah Kapuk No. 456, Jakarta Utara',
      
      // Project details
      projectType: 'Construction',
      category: 'Construction',
      procurementMethod: 'Tender',
      propertyType: 'Residential',
      estimatedBudget: 'Rp 2,500,000,000',
      budget: 'Rp 2,500,000,000',
      estimatedDuration: '8 months',
      duration: '8 months',
      estimatedStartDate: '2025-03-01',
      startDate: '2025-03-01',
      deadline: tenderDeadline.toISOString().split('T')[0],
      tenderDeadline: tenderDeadline.toISOString().split('T')[0],
      
      // Status and progress
      status: 'Open for Tender',
      progress: 0,
      
      // Owner info
      ownerId: userId,
      client: 'PT. Luxury Home Development',
      
      // Timestamps
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      
      // Additional fields
      team: [],
      milestones: [
        { name: 'Foundation', completed: false, date: '2025-04-01' },
        { name: 'Structure', completed: false, date: '2025-06-01' },
        { name: 'Finishing', completed: false, date: '2025-09-01' },
        { name: 'Handover', completed: false, date: '2025-10-01' }
      ],
      
      // Scope
      scope: ['Construction', 'Architecture', 'Interior Design'],
      scopes: ['Construction', 'Architecture', 'Interior Design']
    };

    const docRef = await addDoc(collection(db, 'projects'), projectData);
    console.log('Test tender project created with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error creating test tender project:', error);
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
      contractType: 'Contract',
      
      // Scope
      scope: ['Renovation', 'Kitchen Design'],
      scopes: ['Renovation', 'Kitchen Design']
    };

    const docRef = await addDoc(collection(db, 'projects'), projectData);
    console.log('Test completed project created with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error creating test completed project:', error);
    throw error;
  }
}
