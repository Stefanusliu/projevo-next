'use client';

import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { createTestProject, createTestTenderProject, createTestCompletedProject } from '../../test-create-project';
import { createDiverseTestProjects } from '../../test-create-diverse-projects';
import { createAllStatusTestProjects } from '../../test-create-all-status-projects';
import CreateTestPayments from '../dashboard/project-owner/components/CreateTestPayments';

export default function TestDataPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleCreateTestProject = async () => {
    if (!user?.uid) {
      setMessage('Please log in first');
      return;
    }

    setLoading(true);
    try {
      const projectId = await createTestProject(user.uid);
      setMessage(`Test project created successfully with ID: ${projectId}`);
    } catch (error) {
      setMessage(`Error creating test project: ${error.message}`);
    }
    setLoading(false);
  };

  const handleCreateTenderProject = async () => {
    if (!user?.uid) {
      setMessage('Please log in first');
      return;
    }

    setLoading(true);
    try {
      const projectId = await createTestTenderProject(user.uid);
      setMessage(`Test tender project created successfully with ID: ${projectId}`);
    } catch (error) {
      setMessage(`Error creating test tender project: ${error.message}`);
    }
    setLoading(false);
  };

  const handleCreateCompletedProject = async () => {
    if (!user?.uid) {
      setMessage('Please log in first');
      return;
    }

    setLoading(true);
    try {
      const projectId = await createTestCompletedProject(user.uid);
      setMessage(`Test completed project created successfully with ID: ${projectId}`);
    } catch (error) {
      setMessage(`Error creating test completed project: ${error.message}`);
    }
    setLoading(false);
  };

  const handleCreateDiverseProjects = async () => {
    if (!user?.uid) {
      setMessage('Please log in first');
      return;
    }

    setLoading(true);
    try {
      const projects = await createDiverseTestProjects(user.uid);
      setMessage(`Created ${projects.length} diverse test projects successfully:\n${projects.map(p => `- ${p.title} (${p.procurementMethod} - ${p.status})`).join('\n')}`);
    } catch (error) {
      setMessage(`Error creating diverse test projects: ${error.message}`);
    }
    setLoading(false);
  };

  const handleCreateAllStatusProjects = async () => {
    if (!user?.uid) {
      setMessage('Please log in first');
      return;
    }

    setLoading(true);
    try {
      const projects = await createAllStatusTestProjects(user.uid);
      setMessage(`Created ${projects.length} projects with all statuses successfully:\n${projects.map(p => `- ${p.title} (${p.status})`).join('\n')}`);
    } catch (error) {
      setMessage(`Error creating all status test projects: ${error.message}`);
    }
    setLoading(false);
  };

  const handleShowPayments = async () => {
    if (!user?.uid) {
      setMessage('Please log in first');
      return;
    }

    setLoading(true);
    try {
      // Query for payments specifically
      const { collection, query, where, getDocs } = await import('firebase/firestore');
      const { db } = await import('../../lib/firebase');
      
      const paymentsQuery = query(
        collection(db, 'payments'),
        where('projectOwnerId', '==', user.uid)
      );
      
      const snapshot = await getDocs(paymentsQuery);
      const payments = [];
      snapshot.forEach((doc) => {
        payments.push({ id: doc.id, ...doc.data() });
      });
      
      setMessage(`Found ${payments.length} payments for user ${user.uid}:\n${JSON.stringify(payments, null, 2)}`);
    } catch (error) {
      setMessage(`Error fetching payments: ${error.message}`);
    }
    setLoading(false);
  };

  const handleShowProjects = async () => {
    if (!user?.uid) {
      setMessage('Please log in first');
      return;
    }

    setLoading(true);
    try {
      // Use the same query as the dashboard to see what's returned
      const { collection, query, where, getDocs } = await import('firebase/firestore');
      const { db } = await import('../../lib/firebase');
      
      const projectsQuery = query(
        collection(db, 'projects'),
        where('ownerId', '==', user.uid)
      );
      
      const snapshot = await getDocs(projectsQuery);
      const projects = [];
      snapshot.forEach((doc) => {
        projects.push({ id: doc.id, ...doc.data() });
      });
      
      setMessage(`Found ${projects.length} projects:\n${JSON.stringify(projects, null, 2)}`);
    } catch (error) {
      setMessage(`Error fetching projects: ${error.message}`);
    }
    setLoading(false);
  };

  const handleShowTenderProjects = async () => {
    if (!user?.uid) {
      setMessage('Please log in first');
      return;
    }

    setLoading(true);
    try {
      // Query for tender projects specifically
      const { collection, query, where, getDocs } = await import('firebase/firestore');
      const { db } = await import('../../lib/firebase');
      
      const tenderQuery = query(
        collection(db, 'projects'),
        where('procurementMethod', '==', 'Tender')
      );
      
      const snapshot = await getDocs(tenderQuery);
      const projects = [];
      snapshot.forEach((doc) => {
        projects.push({ id: doc.id, ...doc.data() });
      });
      
      setMessage(`Found ${projects.length} tender projects:\n${JSON.stringify(projects, null, 2)}`);
    } catch (error) {
      setMessage(`Error fetching tender projects: ${error.message}`);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Test Data Creation</h1>
      
      <div className="space-y-4">
        <button
          onClick={handleCreateTestProject}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg"
        >
          {loading ? 'Creating...' : 'Create Test Active Project'}
        </button>
        
        <button
          onClick={handleCreateTenderProject}
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg ml-4"
        >
          {loading ? 'Creating...' : 'Create Test Tender Project'}
        </button>
        
        <button
          onClick={handleCreateCompletedProject}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg ml-4"
        >
          {loading ? 'Creating...' : 'Create Test Completed Project'}
        </button>

        <button
          onClick={handleCreateDiverseProjects}
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg ml-4"
        >
          {loading ? 'Creating...' : 'Create Diverse Test Projects (All Types)'}
        </button>

        <button
          onClick={handleCreateAllStatusProjects}
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg ml-4"
        >
          {loading ? 'Creating...' : 'Create All Status Projects (On Going, Open, Completed, etc.)'}
        </button>

        <button
          onClick={handleShowProjects}
          disabled={loading}
          className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg ml-4"
        >
          {loading ? 'Loading...' : 'Show All Projects'}
        </button>

        <button
          onClick={handleShowTenderProjects}
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg ml-4"
        >
          {loading ? 'Loading...' : 'Show Tender Projects'}
        </button>

        <button
          onClick={handleShowPayments}
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg ml-4"
        >
          {loading ? 'Loading...' : 'Show Payments'}
        </button>
      </div>
      
      {message && (
        <div className="mt-4 p-4 bg-gray-100 rounded-lg">
          <pre className="whitespace-pre-wrap text-sm overflow-auto max-h-96">
            {message}
          </pre>
        </div>
      )}
      
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Payment Test Data</h2>
        <CreateTestPayments />
      </div>
      
      <div className="mt-8">
        <p className="text-gray-600">
          User ID: {user?.uid || 'Not logged in'}
        </p>
      </div>
    </div>
  );
}
