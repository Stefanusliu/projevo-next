// Clear admin login rate limiting
// Run this in your browser console on the admin login page

console.log('Clearing admin login rate limiting...');

// Clear rate limiting from localStorage
localStorage.removeItem('adminLoginAttempts');
localStorage.removeItem('lastAdminLoginAttempt');

console.log('Rate limiting cleared! You can now try logging in again.');
console.log('Use credentials: admin@projevo.com / admin123');
