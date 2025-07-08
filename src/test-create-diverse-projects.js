// Test script to create diverse sample projects for testing dashboard
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './lib/firebase'; // Use existing Firebase instance

export async function createDiverseTestProjects(userId) {
  try {
    const projects = [];
    
    // 1. Create "On Going" Contract project
    const onGoingProject = {
      title: 'Modern Office Interior Design',
      projectTitle: 'Modern Office Interior Design',
      description: 'Complete interior design and renovation for a modern corporate office space',
      
      city: 'Jakarta Selatan',
      province: 'DKI Jakarta',
      location: 'Jakarta Selatan',
      fullAddress: 'Jl. Sudirman No. 123, Jakarta Selatan',
      
      projectType: 'Interior Design',
      category: 'Interior Design',
      procurementMethod: 'Contract',
      propertyType: 'Commercial',
      estimatedBudget: 'Rp 150,000,000',
      budget: 'Rp 150,000,000',
      estimatedDuration: '3 months',
      duration: '3 months',
      estimatedStartDate: '2025-02-01',
      startDate: '2025-02-01',
      deadline: '2025-05-01',
      
      status: 'In Progress',
      progress: 45,
      
      ownerId: userId,
      client: 'PT. Modern Office Solutions',
      
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      
      team: ['Designer A', 'Project Manager B'],
      milestones: [
        { name: 'Initial Design', completed: true, date: '2025-02-15' },
        { name: 'Material Selection', completed: true, date: '2025-03-01' },
        { name: 'Installation', completed: false, date: '2025-04-15' },
        { name: 'Final Review', completed: false, date: '2025-04-30' }
      ],
      
      scope: ['Interior Design', 'Furniture Selection'],
      scopes: ['Interior Design', 'Furniture Selection']
    };

    // 2. Create "Open" Tender project
    const currentDate = new Date();
    const tenderDeadline = new Date(currentDate.getTime() + (5 * 24 * 60 * 60 * 1000)); // 5 days from now
    
    const openTenderProject = {
      title: 'Luxury Villa Construction Project',
      projectTitle: 'Luxury Villa Construction Project',
      description: 'Complete construction of a modern luxury villa with eco-friendly materials and smart home integration.',
      
      city: 'Jakarta Utara',
      province: 'DKI Jakarta',
      location: 'Jakarta Utara',
      fullAddress: 'Jl. Pantai Indah Kapuk No. 456, Jakarta Utara',
      
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
      
      status: 'Open for Tender',
      progress: 0,
      
      ownerId: userId,
      client: 'PT. Luxury Home Development',
      
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      
      team: [],
      milestones: [
        { name: 'Foundation', completed: false, date: '2025-04-01' },
        { name: 'Structure', completed: false, date: '2025-06-01' },
        { name: 'Finishing', completed: false, date: '2025-09-01' },
        { name: 'Handover', completed: false, date: '2025-10-01' }
      ],
      
      scope: ['Construction', 'Architecture', 'Interior Design'],
      scopes: ['Construction', 'Architecture', 'Interior Design']
    };

    // 3. Create "Completed" Contract project
    const completedProject = {
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
      
      scope: ['Renovation', 'Kitchen Design'],
      scopes: ['Renovation', 'Kitchen Design']
    };

    // 4. Create "Pending Signature" Draft project
    const pendingProject = {
      title: 'Shopping Mall Expansion Draft',
      projectTitle: 'Shopping Mall Expansion Draft',
      description: 'Preliminary plans for shopping mall expansion with new retail spaces',
      
      city: 'Bekasi',
      province: 'Jawa Barat',
      location: 'Bekasi',
      fullAddress: 'Jl. Raya Bekasi No. 789, Bekasi',
      
      projectType: 'Construction',
      category: 'Construction',
      procurementMethod: 'Draft',
      propertyType: 'Commercial',
      estimatedBudget: 'Rp 5,000,000,000',
      budget: 'Rp 5,000,000,000',
      estimatedDuration: '12 months',
      duration: '12 months',
      estimatedStartDate: '2025-04-01',
      startDate: '2025-04-01',
      deadline: '2026-04-01',
      
      status: 'Pending',
      progress: 0,
      
      ownerId: userId,
      client: 'PT. Retail Expansion Corp',
      
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      
      team: [],
      milestones: [
        { name: 'Planning', completed: false, date: '2025-05-01' },
        { name: 'Approval', completed: false, date: '2025-06-01' },
        { name: 'Construction', completed: false, date: '2025-12-01' },
        { name: 'Opening', completed: false, date: '2026-04-01' }
      ],
      
      scope: ['Construction', 'Planning', 'Architecture'],
      scopes: ['Construction', 'Planning', 'Architecture']
    };

    // Add all projects to Firestore
    const projectsToCreate = [onGoingProject, openTenderProject, completedProject, pendingProject];
    
    for (const projectData of projectsToCreate) {
      const docRef = await addDoc(collection(db, 'projects'), projectData);
      projects.push({ id: docRef.id, ...projectData });
      console.log(`Created project: ${projectData.title} with ID: ${docRef.id}`);
    }

    console.log('All diverse test projects created successfully');
    return projects;
  } catch (error) {
    console.error('Error creating diverse test projects:', error);
    throw error;
  }
}
