'use client';

import { useAuth } from '../contexts/AuthContext';

export default function AuthDiagnostic() {
  const { user, userProfile, loading } = useAuth();

  return (
    <div className="p-4 bg-gray-100 border rounded">
      <h3 className="font-bold mb-2">Auth Diagnostic</h3>
      <div className="text-sm">
        <p><strong>Loading:</strong> {loading ? 'true' : 'false'}</p>
        <p><strong>User:</strong> {user ? user.uid : 'null'}</p>
        <p><strong>User Email:</strong> {user?.email || 'null'}</p>
        <p><strong>User Profile:</strong> {userProfile ? 'exists' : 'null'}</p>
        <p><strong>User Type:</strong> {userProfile?.userType || 'none'}</p>
        <p><strong>Profile Complete:</strong> {userProfile?.profileComplete ? 'true' : 'false'}</p>
      </div>
    </div>
  );
}
