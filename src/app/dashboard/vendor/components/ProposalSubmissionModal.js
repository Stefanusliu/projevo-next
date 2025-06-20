'use client';

import { useState } from 'react';

export default function ProposalSubmissionModal({ project, isOpen, onClose, onSubmit }) {
  const [proposalData, setProposalData] = useState({
    bidAmount: '',
    timeline: '',
    coverLetter: '',
    keyDifferentiators: ['']
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !project) return null;

  const addKeyDifferentiator = () => {
    setProposalData(prev => ({
      ...prev,
      keyDifferentiators: [...prev.keyDifferentiators, '']
    }));
  };

  const updateKeyDifferentiator = (index, value) => {
    setProposalData(prev => ({
      ...prev,
      keyDifferentiators: prev.keyDifferentiators.map((item, i) => 
        i === index ? value : item
      )
    }));
  };

  const removeKeyDifferentiator = (index) => {
    if (proposalData.keyDifferentiators.length > 1) {
      setProposalData(prev => ({
        ...prev,
        keyDifferentiators: prev.keyDifferentiators.filter((_, i) => i !== index)
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!proposalData.bidAmount) {
      newErrors.bidAmount = 'Bid amount is required';
    } else if (isNaN(proposalData.bidAmount) || parseFloat(proposalData.bidAmount) <= 0) {
      newErrors.bidAmount = 'Please enter a valid amount';
    }
    
    if (!proposalData.timeline) {
      newErrors.timeline = 'Timeline is required';
    }
    
    if (!proposalData.coverLetter || proposalData.coverLetter.trim().length < 100) {
      newErrors.coverLetter = 'Cover letter must be at least 100 characters';
    }

    if (proposalData.keyDifferentiators.filter(d => d.trim()).length === 0) {
      newErrors.keyDifferentiators = 'At least one key differentiator is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      await onSubmit(proposalData);
      
      // Reset form
      setProposalData({
        bidAmount: '',
        timeline: '',
        coverLetter: '',
        keyDifferentiators: ['']
      });
      
      onClose();
      
    } catch (error) {
      console.error('Error submitting proposal:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const budgetRange = project.budget.replace(/[^0-9,-]/g, '');
  const [minBudget, maxBudget] = budgetRange.includes('-') 
    ? budgetRange.split('-').map(b => parseInt(b.replace(/,/g, '')))
    : [0, parseInt(budgetRange.replace(/,/g, ''))];

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Submit Proposal</h2>
            <p className="text-slate-600 dark:text-slate-400">{project.name} • {project.budget}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Header Note */}
        <div className="px-6 py-3 bg-blue-50 dark:bg-blue-900/20 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Note:</strong> Your portfolio and experience from your profile will be automatically included with this proposal. 
              <a href="#" className="underline hover:no-underline ml-1">Update profile →</a>
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
              {/* Bid Amount */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Your Bid Amount *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">$</span>
                    <input
                      type="number"
                      value={proposalData.bidAmount}
                      onChange={(e) => setProposalData(prev => ({ ...prev, bidAmount: e.target.value }))}
                      className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        errors.bidAmount 
                          ? 'border-red-300 bg-red-50 dark:bg-red-900/20' 
                          : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700'
                      } text-slate-900 dark:text-white`}
                      placeholder="Enter your bid amount"
                    />
                  </div>
                  {errors.bidAmount && (
                    <p className="text-red-500 text-sm mt-1">{errors.bidAmount}</p>
                  )}
                  {maxBudget > 0 && (
                    <p className="text-sm text-slate-500 mt-1">
                      Client budget: ${minBudget.toLocaleString()} - ${maxBudget.toLocaleString()}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Project Timeline *
                  </label>
                  <select
                    value={proposalData.timeline}
                    onChange={(e) => setProposalData(prev => ({ ...prev, timeline: e.target.value }))}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.timeline 
                        ? 'border-red-300 bg-red-50 dark:bg-red-900/20' 
                        : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700'
                    } text-slate-900 dark:text-white`}
                  >
                    <option value="">Select timeline</option>
                    <option value="1-2 weeks">1-2 weeks</option>
                    <option value="2-4 weeks">2-4 weeks</option>
                    <option value="1-2 months">1-2 months</option>
                    <option value="2-3 months">2-3 months</option>
                    <option value="3-6 months">3-6 months</option>
                    <option value="6+ months">6+ months</option>
                  </select>
                  {errors.timeline && (
                    <p className="text-red-500 text-sm mt-1">{errors.timeline}</p>
                  )}
                </div>
              </div>

              {/* Cover Letter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Cover Letter *
                </label>
                <textarea
                  value={proposalData.coverLetter}
                  onChange={(e) => setProposalData(prev => ({ ...prev, coverLetter: e.target.value }))}
                  rows={6}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.coverLetter 
                      ? 'border-red-300 bg-red-50 dark:bg-red-900/20' 
                      : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700'
                  } text-slate-900 dark:text-white resize-none`}
                  placeholder="Explain why you're the best fit for this project. Include your approach, relevant experience, and what makes you unique..."
                />
                <div className="flex justify-between items-center mt-1">
                  {errors.coverLetter && (
                    <p className="text-red-500 text-sm">{errors.coverLetter}</p>
                  )}
                  <p className="text-sm text-slate-500 ml-auto">
                    {proposalData.coverLetter.length}/1000 characters
                  </p>
                </div>
              </div>

              {/* Key Differentiators */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Key Differentiators *
                </label>
                <p className="text-sm text-slate-500 mb-3">
                  What makes your approach unique? List your competitive advantages.
                </p>
                {proposalData.keyDifferentiators.map((differentiator, index) => (
                  <div key={index} className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      value={differentiator}
                      onChange={(e) => updateKeyDifferentiator(index, e.target.value)}
                      className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder={`Differentiator ${index + 1}`}
                    />
                    {proposalData.keyDifferentiators.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeKeyDifferentiator(index)}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addKeyDifferentiator}
                  className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center space-x-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Add Another</span>
                </button>
                {errors.keyDifferentiators && (
                  <p className="text-red-500 text-sm mt-1">{errors.keyDifferentiators}</p>
                )}
              </div>
            </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-6 border-t border-slate-200 dark:border-slate-700 mt-8">
            <div className="text-sm text-slate-500">
              <p>💡 Focus on your proposal - portfolio and experience are pulled from your profile</p>
            </div>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Submitting...</span>
                  </div>
                ) : (
                  'Submit Proposal'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
