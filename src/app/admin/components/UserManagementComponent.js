'use client';

import { useState } from 'react';
import { 
  MdPeople, 
  MdVerifiedUser, 
  MdSupervisorAccount, 
  MdWarning 
} from 'react-icons/md';

export default function UserManagementComponent() {
  const [users] = useState([
    {
      id: 1,
      name: "Sarah Johnson",
      email: "sarah@example.com",
      role: "project_owner",
      status: "active",
      joinDate: "2024-01-15",
      lastLogin: "2024-06-19",
      projectsCount: 8,
      totalSpent: "Rp 450M",
      phone: "+62812345678",
      company: "PT. Kuliner Modern",
      verified: true
    },
    {
      id: 2,
      name: "Ahmad Pratama",
      email: "ahmad@constructionpro.co.id",
      role: "vendor",
      status: "active",
      joinDate: "2024-02-20",
      lastLogin: "2024-06-18",
      projectsCount: 15,
      totalEarned: "Rp 820M",
      phone: "+62812345679",
      company: "CV. Construction Pro",
      verified: true,
      specialties: ["Construction", "Renovation"]
    },
    {
      id: 3,
      name: "Lisa Chen",
      email: "lisa@designstudio.com",
      role: "vendor",
      status: "pending",
      joinDate: "2024-06-10",
      lastLogin: "2024-06-17",
      projectsCount: 0,
      totalEarned: "Rp 0",
      phone: "+62812345680",
      company: "Modern Design Studio",
      verified: false,
      specialties: ["Interior Design", "Architecture"]
    },
    {
      id: 4,
      name: "Budi Santoso",
      email: "budi@berkahproperty.co.id",
      role: "project_owner",
      status: "suspended",
      joinDate: "2024-03-10",
      lastLogin: "2024-06-01",
      projectsCount: 3,
      totalSpent: "Rp 125M",
      phone: "+62812345681",
      company: "PT. Berkah Property",
      verified: true,
      suspensionReason: "Payment disputes"
    }
  ]);

  const [selectedUser, setSelectedUser] = useState(null);
  const [actionModal, setActionModal] = useState(false);
  const [actionType, setActionType] = useState('');
  const [actionReason, setActionReason] = useState('');

  const getRoleColor = (role) => {
    switch (role) {
      case 'project_owner':
        return 'bg-blue-100 text-blue-800 ';
      case 'vendor':
        return 'bg-green-100 text-green-800 ';
      case 'admin':
        return 'bg-purple-100 text-purple-800 ';
      default:
        return 'bg-gray-100 text-gray-800 ';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 ';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 ';
      case 'suspended':
        return 'bg-red-100 text-red-800 ';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 ';
      default:
        return 'bg-gray-100 text-gray-800 ';
    }
  };

  const handleAction = (user, action) => {
    setSelectedUser(user);
    setActionType(action);
    setActionModal(true);
  };

  const submitAction = () => {
    console.log('Action submitted:', {
      user: selectedUser,
      action: actionType,
      reason: actionReason
    });
    
    setActionModal(false);
    setSelectedUser(null);
    setActionType('');
    setActionReason('');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            User Management
          </h1>
          <p className="text-slate-600 mt-2">
            Manage project owners, vendors, and user accounts
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select className="px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-900">
            <option>All Roles</option>
            <option>Project Owners</option>
            <option>Vendors</option>
          </select>
          
          <select className="px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-900">
            <option>All Status</option>
            <option>Active</option>
            <option>Pending</option>
            <option>Suspended</option>
          </select>

          <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors">
            Add User
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Users</p>
              <p className="text-2xl font-bold text-slate-900 mt-2">432</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <MdPeople className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Project Owners</p>
              <p className="text-2xl font-bold text-slate-900 mt-2">189</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <MdPeople className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Vendors</p>
              <p className="text-2xl font-bold text-slate-900 mt-2">243</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <MdPeople className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Pending Approval</p>
              <p className="text-2xl font-bold text-slate-900 mt-2">12</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <MdPeople className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">All Users</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  User
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Activity
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Performance
                </th>
                <th className="text-right px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-medium text-slate-900">{user.name}</p>
                          {user.verified && (
                            <MdPeople className="w-6 h-6 text-blue-600" />
                          )}
                        </div>
                        <p className="text-sm text-slate-500">{user.email}</p>
                        <p className="text-sm text-slate-500">{user.company}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(user.role)}`}>
                        {user.role.replace('_', ' ').toUpperCase()}
                      </span>
                      {user.specialties && (
                        <div className="flex flex-wrap gap-1">
                          {user.specialties.map((specialty, index) => (
                            <span key={index} className="px-2 py-1 text-xs bg-slate-100 text-slate-600 rounded">
                              {specialty}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(user.status)}`}>
                        {user.status.toUpperCase()}
                      </span>
                      {user.suspensionReason && (
                        <p className="text-xs text-red-600">{user.suspensionReason}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <p className="text-slate-900">Joined: {formatDate(user.joinDate)}</p>
                      <p className="text-slate-500">Last: {formatDate(user.lastLogin)}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <p className="text-slate-900">{user.projectsCount} projects</p>
                      {user.role === 'project_owner' ? (
                        <p className="text-slate-500">Spent: {user.totalSpent}</p>
                      ) : (
                        <p className="text-slate-500">Earned: {user.totalEarned}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="text-indigo-600 hover:text-indigo-700 text-sm"
                      >
                        View
                      </button>
                      {user.status === 'pending' && (
                        <button
                          onClick={() => handleAction(user, 'approve')}
                          className="text-green-600 hover:text-green-700 text-sm"
                        >
                          Approve
                        </button>
                      )}
                      {user.status === 'active' && (
                        <button
                          onClick={() => handleAction(user, 'suspend')}
                          className="text-red-600 hover:text-red-700 text-sm"
                        >
                          Suspend
                        </button>
                      )}
                      {user.status === 'suspended' && (
                        <button
                          onClick={() => handleAction(user, 'reactivate')}
                          className="text-green-600 hover:text-green-700 text-sm"
                        >
                          Reactivate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Detail Modal */}
      {selectedUser && !actionModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">{selectedUser.name}</h2>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <MdPeople className="w-6 h-6 text-blue-600" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Contact Information</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-slate-500">Email</p>
                      <p className="font-medium text-slate-900">{selectedUser.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Phone</p>
                      <p className="font-medium text-slate-900">{selectedUser.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Company</p>
                      <p className="font-medium text-slate-900">{selectedUser.company}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Account Details</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-slate-500">Role</p>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(selectedUser.role)}`}>
                        {selectedUser.role.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Status</p>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedUser.status)}`}>
                        {selectedUser.status.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Verified</p>
                      <p className="font-medium text-slate-900">
                        {selectedUser.verified ? '✅ Verified' : '❌ Not Verified'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Activity</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-slate-500">Join Date</p>
                    <p className="font-medium text-slate-900">{formatDate(selectedUser.joinDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Last Login</p>
                    <p className="font-medium text-slate-900">{formatDate(selectedUser.lastLogin)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Projects</p>
                    <p className="font-medium text-slate-900">{selectedUser.projectsCount}</p>
                  </div>
                </div>
              </div>

              {selectedUser.specialties && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Specialties</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedUser.specialties.map((specialty, index) => (
                      <span key={index} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Action Modal */}
      {actionModal && selectedUser && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">
                {actionType === 'approve' ? 'Approve User' : 
                 actionType === 'suspend' ? 'Suspend User' : 'Reactivate User'}
              </h2>
              <p className="text-slate-600 mt-1">{selectedUser.name}</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {actionType === 'approve' ? 'Approval Notes' : 
                   actionType === 'suspend' ? 'Suspension Reason' : 'Reactivation Notes'}
                </label>
                <textarea
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900"
                  placeholder={`Enter ${actionType} reason...`}
                />
              </div>
            </div>
            
            <div className="p-6 border-t border-slate-200 flex justify-end space-x-3">
              <button
                onClick={() => setActionModal(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitAction}
                className={`px-6 py-2 text-white rounded-lg transition-colors ${
                  actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' :
                  actionType === 'suspend' ? 'bg-red-600 hover:bg-red-700' :
                  'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {actionType === 'approve' ? 'Approve' : 
                 actionType === 'suspend' ? 'Suspend' : 'Reactivate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
