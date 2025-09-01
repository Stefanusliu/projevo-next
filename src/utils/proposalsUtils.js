// Utility function to normalize proposals data structure
// Handles both array and object formats from Firestore

export function normalizeProposals(proposals) {
  if (!proposals) {
    return [];
  }
  
  // If it's already an array, return as-is
  if (Array.isArray(proposals)) {
    return proposals;
  }
  
  // If it's an object (map), convert to array
  if (typeof proposals === 'object') {
    console.log('🔄 Converting proposals object to array format');
    
    const proposalsArray = [];
    
    // Get all keys and sort them numerically to maintain order
    const sortedKeys = Object.keys(proposals).sort((a, b) => {
      const numA = parseInt(a);
      const numB = parseInt(b);
      
      // Handle non-numeric keys by putting them at the end
      if (isNaN(numA) && isNaN(numB)) return a.localeCompare(b);
      if (isNaN(numA)) return 1;
      if (isNaN(numB)) return -1;
      
      return numA - numB;
    });
    
    // Convert object entries to array maintaining order
    sortedKeys.forEach(key => {
      if (proposals[key]) {
        proposalsArray.push(proposals[key]);
      }
    });
    
    console.log(`✅ Converted ${sortedKeys.length} proposals from object to array`);
    return proposalsArray;
  }
  
  // Fallback for unexpected data types
  console.warn('⚠️ Unexpected proposals data type:', typeof proposals);
  return [];
}

export function getProposalsLength(proposals) {
  if (!proposals) return 0;
  
  if (Array.isArray(proposals)) {
    return proposals.length;
  }
  
  if (typeof proposals === 'object') {
    return Object.keys(proposals).length;
  }
  
  return 0;
}
