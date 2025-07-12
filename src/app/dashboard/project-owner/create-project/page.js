'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiSave } from 'react-icons/fi';

export default function CreateProjectPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    procurementMethod: 'Contract',
    projectType: 'Construction',
    location: '',
    budget: '',
    duration: '',
    startDate: ''
  });

  // Helper function to format budget with Rp and thousand separators
  const formatBudget = (value) => {
    if (!value) return '';
    // Remove non-numeric characters except for digits
    const numericValue = value.toString().replace(/[^\d]/g, '');
    if (!numericValue) return '';
    // Add thousand separators
    const formatted = parseInt(numericValue).toLocaleString('id-ID');
    return `Rp ${formatted}`;
  };

  // Helper function to parse budget input (remove Rp and separators)
  const parseBudgetInput = (value) => {
    return value.replace(/[^\d]/g, '');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'budget') {
      // Handle budget formatting
      const rawValue = parseBudgetInput(value);
      setFormData(prev => ({
        ...prev,
        [name]: rawValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement project creation logic
    console.log('Creating project:', formData);
    // For now, just navigate back
    router.back();
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#d9d9d9' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <FiArrowLeft className="w-5 h-5 mr-2" />
              Back
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Create New Project</h1>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Project Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Project Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter project title"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe your project"
              />
            </div>

            {/* Two column layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Procurement Method */}
              <div>
                <label htmlFor="procurementMethod" className="block text-sm font-medium text-gray-700 mb-2">
                  Procurement Method *
                </label>
                <select
                  id="procurementMethod"
                  name="procurementMethod"
                  value={formData.procurementMethod}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Contract">Contract</option>
                  <option value="Tender">Tender</option>
                  <option value="Draft">Draft</option>
                  <option value="Negotiation">Negotiation</option>
                  <option value="Penunjukan Langsung">Penunjukan Langsung</option>
                </select>
              </div>

              {/* Project Type */}
              <div>
                <label htmlFor="projectType" className="block text-sm font-medium text-gray-700 mb-2">
                  Project Type *
                </label>
                <select
                  id="projectType"
                  name="projectType"
                  value={formData.projectType}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Construction">Construction</option>
                  <option value="Interior Design">Interior Design</option>
                  <option value="Architecture">Architecture</option>
                  <option value="Renovation">Renovation</option>
                </select>
              </div>

              {/* Location */}
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter project location"
                />
              </div>

              {/* Budget */}
              <div>
                <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">
                  Budget
                </label>
                <input
                  type="text"
                  id="budget"
                  name="budget"
                  value={formatBudget(formData.budget)}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Rp 150,000,000"
                />
              </div>

              {/* Duration */}
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                  Duration
                </label>
                <input
                  type="text"
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 3 months"
                />
              </div>

              {/* Start Date */}
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center px-6 py-2 text-white rounded-lg font-medium transition-colors"
                style={{ backgroundColor: '#2373FF' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#1d63ed'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#2373FF'}
              >
                <FiSave className="w-4 h-4 mr-2" />
                Create Project
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
