'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SavedBOQComponent() {
  const router = useRouter();
  const [savedBOQs, setSavedBOQs] = useState([]);

  useEffect(() => {
    const savedData = localStorage.getItem('projevo_boqs');
    if (savedData) {
      setSavedBOQs(JSON.parse(savedData));
    }
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const loadBOQ = (boqId) => {
    // Navigate to full BOQ Maker with the BOQ loaded
    router.push(`/boq-maker?load=${boqId}`);
  };

  const createNewBOQ = () => {
    router.push('/boq-maker');
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
      <div className="p-6">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Draft BOQ Generator</h3>
            <button
              onClick={createNewBOQ}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Create New BOQ
            </button>
          </div>

          {savedBOQs.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-slate-400 dark:text-slate-500 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No BOQ Drafts yet</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">Create your first Bill of Quantities draft to get started.</p>
              <button
                onClick={createNewBOQ}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Create Your First BOQ
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {savedBOQs.map((boq) => (
                <div key={boq.id} className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 flex justify-between items-center">
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-white">{boq.title}</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Created: {formatDate(boq.createdAt)}
                    </p>
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                      Total: Rp {boq.total.toLocaleString('id-ID')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => loadBOQ(boq.id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center pt-4 border-t border-slate-200 dark:border-slate-600">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Need to create a new BOQ or edit existing ones?
            </p>
            <button
              onClick={() => router.push('/boq-maker')}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold"
            >
              Open Full BOQ Maker
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
