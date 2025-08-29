const admin = require('firebase-admin');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize Firebase Admin (you'll need to add your service account key)
// For now, this is just a template - you'll need proper credentials

const addTestDocumentation = async (projectId) => {
  try {
    const db = getFirestore();
    
    // Sample documentation images
    const testImages = [
      {
        url: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=500',
        name: 'construction-progress-1.jpg',
        originalName: 'construction-progress-1.jpg',
        uploadedAt: new Date(),
        uploadedBy: 'test-vendor-id',
        uploaderName: 'Test Vendor',
        size: 245760,
        type: 'image/jpeg'
      },
      {
        url: 'https://images.unsplash.com/photo-1590479773265-7464e5d48118?w=500',
        name: 'foundation-work.jpg',
        originalName: 'foundation-work.jpg',
        uploadedAt: new Date(),
        uploadedBy: 'test-vendor-id',
        uploaderName: 'Test Vendor',
        size: 189432,
        type: 'image/jpeg'
      },
      {
        url: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=500',
        name: 'wall-construction.jpg',
        originalName: 'wall-construction.jpg',
        uploadedAt: new Date(),
        uploadedBy: 'test-vendor-id',
        uploaderName: 'Test Vendor',
        size: 301842,
        type: 'image/jpeg'
      }
    ];

    // Update the project with test documentation
    await db.collection('projects').doc(projectId).update({
      documentationImages: testImages,
      updatedAt: new Date()
    });

    console.log(`✅ Added ${testImages.length} test documentation images to project ${projectId}`);
    
  } catch (error) {
    console.error('❌ Error adding test documentation:', error);
  }
};

// Export the function
module.exports = { addTestDocumentation };

// If run directly
if (require.main === module) {
  const projectId = process.argv[2];
  if (!projectId) {
    console.log('Usage: node addTestDocumentation.js <project-id>');
    process.exit(1);
  }
  
  addTestDocumentation(projectId);
}
