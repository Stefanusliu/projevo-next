'use client';

import { useState, useEffect } from 'react';

export default function SavedBOQSelector({ onSelect, onClose }) {
  const [selectedBOQ, setSelectedBOQ] = useState(null);
  const [savedBOQs, setSavedBOQs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load saved BOQs from local storage
    const loadSavedBOQs = () => {
      try {
        const savedData = localStorage.getItem('projevo_boqs');
        if (savedData) {
          const boqs = JSON.parse(savedData);
          setSavedBOQs(boqs);
        } else {
          setSavedBOQs([]);
        }
      } catch (error) {
        console.error('Error loading saved BOQs:', error);
        setSavedBOQs([]);
      } finally {
        setLoading(false);
      }
    };

    loadSavedBOQs();
  }, []);

  const handleSelect = () => {
    if (selectedBOQ) {
      onSelect(selectedBOQ);
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Unknown date';
    }
  };

  const calculateBOQStats = (boq) => {
    if (!boq.tahapanKerja || !Array.isArray(boq.tahapanKerja)) {
      return { tahapanCount: 0, totalItems: 0 };
    }

    let totalItems = 0;
    boq.tahapanKerja.forEach(tahapan => {
      if (tahapan.jenisKerja && Array.isArray(tahapan.jenisKerja)) {
        tahapan.jenisKerja.forEach(jenis => {
          if (jenis.uraian && Array.isArray(jenis.uraian)) {
            totalItems += jenis.uraian.length;
          }
        });
      }
    });

    return { 
      tahapanCount: boq.tahapanKerja.length, 
      totalItems 
    };
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Select Saved BOQ
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500 text-sm">Loading saved BOQs...</p>
            </div>
          ) : savedBOQs.length === 0 ? (
            <div className="text-center py-8">
              <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-500 text-sm">No saved BOQs found</p>
              <p className="text-gray-400 text-xs mt-1">Create a BOQ first using the BOQ Maker to attach it to your project</p>
              <a 
                href="/boq-maker" 
                className="inline-block mt-3 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                Create New BOQ
              </a>
            </div>
          ) : (
            <div className="space-y-3">
              {savedBOQs.map((boq) => {
                const stats = calculateBOQStats(boq);
                return (
                  <div
                    key={boq.id}
                    onClick={() => setSelectedBOQ(boq)}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedBOQ?.id === boq.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 mb-1">{boq.title || 'Untitled BOQ'}</h4>
                        <div className="flex items-center space-x-4 text-xs text-gray-500 mb-2">
                          <span>{stats.tahapanCount} work phases</span>
                          <span>{stats.totalItems} total items</span>
                          <span>Created: {formatDate(boq.createdAt)}</span>
                        </div>
                        {boq.updatedAt && boq.updatedAt !== boq.createdAt && (
                          <p className="text-xs text-gray-400">
                            Last updated: {formatDate(boq.updatedAt)}
                          </p>
                        )}
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        selectedBOQ?.id === boq.id
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'
                      }`}>
                        {selectedBOQ?.id === boq.id && (
                          <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSelect}
            disabled={!selectedBOQ}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedBOQ
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Select BOQ
          </button>
        </div>
      </div>
    </div>
  );
}
