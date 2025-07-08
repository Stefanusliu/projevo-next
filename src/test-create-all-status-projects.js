// Test script to create projects with all possible statuses
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './lib/firebase';

export async function createAllStatusTestProjects(userId) {
  try {
    const projects = [];
    const currentDate = new Date();
    
    // 1. "On Going" (In Progress) Contract project
    const onGoingProject = {
      title: 'Modern Office Interior Design',
      projectTitle: 'Modern Office Interior Design',
      description: 'Complete interior design and renovation for a modern corporate office space with modern furniture and lighting systems.',
      
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
      progress: 65,
      
      ownerId: userId,
      client: 'PT. Modern Office Solutions',
      
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      
      team: ['Designer A', 'Project Manager B', 'Contractor C'],
      milestones: [
        { name: 'Initial Design', completed: true, date: '2025-02-15' },
        { name: 'Material Selection', completed: true, date: '2025-03-01' },
        { name: 'Installation Phase', completed: true, date: '2025-04-15' },
        { name: 'Final Review', completed: false, date: '2025-04-30' },
        { name: 'Handover', completed: false, date: '2025-05-15' }
      ],
      
      scope: ['Interior Design', 'Furniture Selection'],
      scopes: ['Interior Design', 'Furniture Selection']
    };

    // 2. "Open" (Open for Tender) Tender project
    const tenderDeadline = new Date(currentDate.getTime() + (7 * 24 * 60 * 60 * 1000)); // 7 days from now
    const openTenderProject = {
      title: 'Luxury Villa Construction Project',
      projectTitle: 'Luxury Villa Construction Project',
      description: 'Complete construction of a modern luxury villa with eco-friendly materials, smart home integration, and premium finishes.',
      
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
        { name: 'Site Preparation', completed: false, date: '2025-04-01' },
        { name: 'Foundation Work', completed: false, date: '2025-05-01' },
        { name: 'Structure Building', completed: false, date: '2025-08-01' },
        { name: 'Interior Work', completed: false, date: '2025-10-01' },
        { name: 'Final Handover', completed: false, date: '2025-11-01' }
      ],
      
      scope: ['Construction', 'Architecture', 'Interior Design'],
      scopes: ['Construction', 'Architecture', 'Interior Design']
    };

    // 3. "Completed" Contract project
    const completedProject = {
      title: 'Restaurant Kitchen Renovation',
      projectTitle: 'Restaurant Kitchen Renovation',
      description: 'Complete renovation of commercial kitchen with modern equipment, new ventilation system, and improved workflow design.',
      
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
      
      team: ['Contractor A', 'Architect B', 'Engineer C', 'Project Manager D'],
      rating: 4.8,
      finalStatus: 'Successfully Completed',
      contractType: 'Contract',
      
      milestones: [
        { name: 'Planning & Permits', completed: true, date: '2024-10-15' },
        { name: 'Demolition Work', completed: true, date: '2024-10-30' },
        { name: 'Equipment Installation', completed: true, date: '2024-11-15' },
        { name: 'Final Inspection', completed: true, date: '2024-11-25' },
        { name: 'Handover Complete', completed: true, date: '2024-11-28' }
      ],
      
      scope: ['Renovation', 'Kitchen Design'],
      scopes: ['Renovation', 'Kitchen Design']
    };

    // 4. "Pending Signature" Draft project
    const pendingSignatureProject = {
      title: 'Shopping Mall Expansion Project',
      projectTitle: 'Shopping Mall Expansion Project',
      description: 'Major expansion of existing shopping mall with new retail spaces, food court, and entertainment facilities.',
      
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
      progress: 15,
      
      ownerId: userId,
      client: 'PT. Retail Expansion Corp',
      
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      
      team: ['Architect A', 'Planning Manager B'],
      milestones: [
        { name: 'Initial Planning', completed: true, date: '2025-01-15' },
        { name: 'Design Phase', completed: true, date: '2025-02-28' },
        { name: 'Permit Applications', completed: false, date: '2025-05-01' },
        { name: 'Construction Start', completed: false, date: '2025-06-01' },
        { name: 'Phase 1 Completion', completed: false, date: '2025-12-01' }
      ],
      
      scope: ['Construction', 'Planning', 'Architecture'],
      scopes: ['Construction', 'Planning', 'Architecture']
    };

    // 5. "Under Review" Tender project
    const underReviewProject = {
      title: 'Corporate Headquarters Design',
      projectTitle: 'Corporate Headquarters Design',
      description: 'Architectural design and planning for a new 20-story corporate headquarters building with modern facilities.',
      
      city: 'Jakarta Barat',
      province: 'DKI Jakarta',
      location: 'Jakarta Barat',
      fullAddress: 'Jl. Kebon Jeruk No. 321, Jakarta Barat',
      
      projectType: 'Architecture',
      category: 'Architecture',
      procurementMethod: 'Tender',
      propertyType: 'Commercial',
      estimatedBudget: 'Rp 3,500,000,000',
      budget: 'Rp 3,500,000,000',
      estimatedDuration: '18 months',
      duration: '18 months',
      estimatedStartDate: '2025-06-01',
      startDate: '2025-06-01',
      deadline: '2026-12-01',
      
      status: 'Under Review',
      progress: 25,
      
      ownerId: userId,
      client: 'PT. Corporate Solutions',
      
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      
      team: ['Lead Architect', 'Structural Engineer'],
      milestones: [
        { name: 'Concept Development', completed: true, date: '2025-01-30' },
        { name: 'Preliminary Design', completed: true, date: '2025-03-15' },
        { name: 'Detailed Design', completed: false, date: '2025-06-01' },
        { name: 'Construction Documents', completed: false, date: '2025-08-01' },
        { name: 'Project Completion', completed: false, date: '2026-12-01' }
      ],
      
      scope: ['Architecture', 'Structural Design', 'MEP Design'],
      scopes: ['Architecture', 'Structural Design', 'MEP Design']
    };

    // 6. Additional "On Going" project with different type
    const onGoing2Project = {
      title: 'Hotel Lobby Renovation',
      projectTitle: 'Hotel Lobby Renovation',
      description: 'Complete transformation of hotel lobby with luxury finishes, new lighting, and modern reception area.',
      
      city: 'Bandung',
      province: 'Jawa Barat',
      location: 'Bandung',
      fullAddress: 'Jl. Dago No. 555, Bandung',
      
      projectType: 'Renovation',
      category: 'Renovation',
      procurementMethod: 'Contract',
      propertyType: 'Commercial',
      estimatedBudget: 'Rp 800,000,000',
      budget: 'Rp 800,000,000',
      estimatedDuration: '4 months',
      duration: '4 months',
      estimatedStartDate: '2025-01-15',
      startDate: '2025-01-15',
      deadline: '2025-05-15',
      
      status: 'In Progress',
      progress: 40,
      
      ownerId: userId,
      client: 'PT. Hospitality Excellence',
      
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      
      team: ['Interior Designer', 'Project Coordinator', 'Site Manager'],
      milestones: [
        { name: 'Design Approval', completed: true, date: '2025-02-01' },
        { name: 'Material Procurement', completed: true, date: '2025-02-20' },
        { name: 'Installation Work', completed: false, date: '2025-04-01' },
        { name: 'Quality Check', completed: false, date: '2025-05-01' },
        { name: 'Final Handover', completed: false, date: '2025-05-15' }
      ],
      
      scope: ['Renovation', 'Interior Design', 'Lighting'],
      scopes: ['Renovation', 'Interior Design', 'Lighting']
    };

    // Add all projects to Firestore
    const projectsToCreate = [
      onGoingProject, 
      openTenderProject, 
      completedProject, 
      pendingSignatureProject, 
      underReviewProject,
      onGoing2Project
    ];
    
    for (const projectData of projectsToCreate) {
      const docRef = await addDoc(collection(db, 'projects'), projectData);
      projects.push({ id: docRef.id, ...projectData });
      console.log(`Created project: ${projectData.title} (${projectData.status}) with ID: ${docRef.id}`);
    }

    console.log('All status test projects created successfully');
    return projects;
  } catch (error) {
    console.error('Error creating all status test projects:', error);
    throw error;
  }
}
