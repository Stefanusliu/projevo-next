// Script to fix proposals data structure from object to array
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';

// Initialize Firebase - You'll need to get these values from your Firebase project settings
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com", 
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
  // Replace with your actual Firebase config
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function fixProposalsStructure() {
  try {
    console.log('🔄 Starting proposals structure fix...');
    
    const projectsRef = collection(db, 'projects');
    const snapshot = await getDocs(projectsRef);
    
    let fixedCount = 0;
    let totalProjects = 0;
    
    for (const docSnapshot of snapshot.docs) {
      const projectData = docSnapshot.data();
      const projectId = docSnapshot.id;
      totalProjects++;
      
      console.log(`\n📋 Checking project: ${projectId}`);
      console.log(`Project title: ${projectData.projectTitle || projectData.title || 'Untitled'}`);
      
      // Check if proposals exists and what type it is
      if (projectData.proposals) {
        const isArray = Array.isArray(projectData.proposals);
        const isObject = typeof projectData.proposals === 'object' && !isArray;
        
        console.log(`Proposals type: ${isArray ? 'Array' : isObject ? 'Object' : 'Other'}`);
        
        if (isObject) {
          console.log(`� Found object-based proposals in project: ${projectId}`);
          
          // Convert object to array
          const proposalsArray = [];
          const proposalsObj = projectData.proposals;
          
          // Get all keys and sort them numerically
          const sortedKeys = Object.keys(proposalsObj).sort((a, b) => {
            const numA = parseInt(a);
            const numB = parseInt(b);
            
            // Handle non-numeric keys
            if (isNaN(numA) && isNaN(numB)) return a.localeCompare(b);
            if (isNaN(numA)) return 1;
            if (isNaN(numB)) return -1;
            
            return numA - numB;
          });
          
          console.log(`Found proposal keys: ${sortedKeys.join(', ')}`);
          
          // Convert to array maintaining order
          sortedKeys.forEach(key => {
            const proposal = proposalsObj[key];
            if (proposal) {
              // Ensure the proposal has proper vendor information
              if (!proposal.vendorName && proposal.vendorEmail) {
                proposal.vendorName = proposal.vendorEmail.split('@')[0];
                console.log(`Added missing vendorName: ${proposal.vendorName}`);
              }
              
              proposalsArray.push(proposal);
              console.log(`Added proposal from vendor: ${proposal.vendorName || proposal.vendorId || 'Unknown'}`);
            }
          });
          
          // Update the document
          await updateDoc(doc(db, 'projects', projectId), {
            proposals: proposalsArray,
            updatedAt: new Date(),
            _migrated: new Date() // Mark as migrated
          });
          
          console.log(`✅ Fixed project ${projectId}: converted ${sortedKeys.length} proposals from object to array`);
          fixedCount++;
        } else if (isArray) {
          console.log(`✓ Project ${projectId} already has array-based proposals (${projectData.proposals.length} items)`);
        } else {
          console.log(`⚠️ Project ${projectId} has unexpected proposals type: ${typeof projectData.proposals}`);
        }
      } else {
        console.log(`- Project ${projectId} has no proposals`);
      }
    }
    
    console.log(`\n🎉 Migration completed!`);
    console.log(`📊 Summary:`);
    console.log(`   - Total projects checked: ${totalProjects}`);
    console.log(`   - Projects fixed: ${fixedCount}`);
    console.log(`   - Projects already correct: ${totalProjects - fixedCount}`);
    
  } catch (error) {
    console.error('❌ Error fixing proposals structure:', error);
    console.error('Make sure you have:');
    console.error('1. Added your Firebase config above');
    console.error('2. Proper Firebase permissions');
    console.error('3. Network connectivity');
  }
}

// Uncomment the line below and add your Firebase config to run the migration
// fixProposalsStructure();

console.log('📝 To run this migration:');
console.log('1. Add your Firebase config above');
console.log('2. Uncomment the last line');
console.log('3. Run: node scripts/fixProposalsStructure.js');

export { fixProposalsStructure };
