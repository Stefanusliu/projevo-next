// Quick test to check Firebase Storage connection
import { storage } from '../lib/firebase';
import { ref } from 'firebase/storage';

export function testStorageConnection() {
  try {
    console.log('Testing Firebase Storage connection...');
    console.log('Storage app:', storage.app.name);
    console.log('Storage bucket:', storage._delegate._bucket);
    
    // Try to create a simple reference
    const testRef = ref(storage, 'test/connection-test.txt');
    console.log('Test reference created:', testRef.fullPath);
    
    return true;
  } catch (error) {
    console.error('Storage connection test failed:', error);
    return false;
  }
}
