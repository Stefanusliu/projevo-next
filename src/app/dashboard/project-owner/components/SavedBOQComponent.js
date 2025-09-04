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
    <div className="bg-white rounded-lg border border-gray-300">
      <div className="p-6">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-black">Generator Draft BOQ</h3>
            <button
              onClick={createNewBOQ}
              className="text-white px-4 py-2 rounded-lg transition-colors"
              style={{ backgroundColor: '#2373FF' }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#1d63ed'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#2373FF'}
            >
              Buat BOQ Baru
            </button>
          </div>

          {savedBOQs.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-black mb-2">Belum Ada Draft BOQ</h3>
              <p className="text-gray-500 mb-6">Buat draft Bill of Quantities pertama Anda untuk memulai.</p>
              <button
                onClick={createNewBOQ}
                className="text-white px-6 py-3 rounded-lg transition-colors"
                style={{ backgroundColor: '#2373FF' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#1d63ed'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#2373FF'}
              >
                Buat BOQ Pertama Anda
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {savedBOQs.map((boq) => (
                <div 
                  key={boq.id} 
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-black">{boq.title}</h4>
                      <p className="text-sm text-gray-600">
                        Dibuat: {formatDate(boq.createdAt)}
                      </p>
                      <p className="text-sm font-medium text-gray-600">
                        Total: Rp {(boq.total || 0).toLocaleString('id-ID')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => loadBOQ(boq.id)}
                        className="text-white px-3 py-1 rounded text-sm transition-colors"
                        style={{ backgroundColor: '#2373FF' }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#1d63ed'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#2373FF'}
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-4">
              Perlu membuat BOQ baru atau mengedit yang sudah ada?
            </p>
            <button
              onClick={() => router.push('/boq-maker')}
              className="text-white px-6 py-3 rounded-lg transition-colors font-semibold"
              style={{ backgroundColor: '#2373FF' }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#1d63ed'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#2373FF'}
            >
              Buka BOQ Maker Lengkap
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
