'use client';

import { useState } from 'react';

export default function SavedBOQSelector({ onSelect, onClose }) {
  const [selectedBOQ, setSelectedBOQ] = useState(null);

  // Mock BOQ data - replace with actual data from database
  const mockBOQs = [
    {
      id: 1,
      title: 'Construction Project BOQ Template',
      tahapanKerja: ['Foundation', 'Structure', 'Finishing'],
      createdAt: '2024-01-15',
      description: 'Standard BOQ template for construction projects'
    },
    {
      id: 2,
      title: 'Interior Design BOQ',
      tahapanKerja: ['Design', 'Materials', 'Installation'],
      createdAt: '2024-01-10',
      description: 'BOQ template for interior design projects'
    },
    {
      id: 3,
      title: 'Renovation Project BOQ',
      tahapanKerja: ['Demolition', 'Reconstruction', 'Finishing'],
      createdAt: '2024-01-05',
      description: 'BOQ template for renovation projects'
    }
  ];

  const handleSelect = () => {
    if (selectedBOQ) {
      onSelect(selectedBOQ);
    }
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
          {mockBOQs.length === 0 ? (
            <div className="text-center py-8">
              <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-500 text-sm">No saved BOQs found</p>
              <p className="text-gray-400 text-xs mt-1">Create a BOQ first to attach it to your project</p>
            </div>
          ) : (
            <div className="space-y-3">
              {mockBOQs.map((boq) => (
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
                      <h4 className="font-medium text-gray-900 mb-1">{boq.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{boq.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>{boq.tahapanKerja.length} work phases</span>
                        <span>Created: {new Date(boq.createdAt).toLocaleDateString()}</span>
                      </div>
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
              ))}
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
