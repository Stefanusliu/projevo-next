import React, { useState } from 'react';
import ProjectDetailModal from '../components/ProjectDetailModal';
import ProposalSubmissionModal from '../components/ProposalSubmissionModal';
import Toast from '../components/Toast';
import { useVendorDashboard } from '../hooks/useVendorDashboard';

const ProjectMarketplace = () => {
  const { submitProposal, loading } = useVendorDashboard();
  
  const [marketData] = useState([
    {
      id: 1,
      category: "Construction",
      subcategory: "Commercial Building",
      type: "Construction",
      industry: "Retail",
      name: "Shopping Mall Extension - Kemang",
      budget: "Rp 2,500,000,000",
      timeEstimation: "8 months",
      bidCountdown: "5 days left",
      description: "Major extension project for existing shopping mall including new wing construction, modern facilities, and infrastructure upgrades.",
      client: "Kemang Properties Ltd",
      location: "Jakarta Selatan",
      requirements: ["Licensed contractor", "Minimum 5 years experience", "Portfolio in commercial construction"],
      proposals: 12,
      match: 95
    },
    {
      id: 2,
      category: "Interior Design",
      subcategory: "Restaurant Design",
      type: "Interior",
      industry: "Food & Beverage",
      name: "Modern Restaurant Interior - PIK Jakarta",
      budget: "Rp 750,000,000",
      timeEstimation: "4 months",
      bidCountdown: "2 days left",
      description: "Complete interior design and fitout for high-end restaurant with contemporary design theme and premium finishes.",
      client: "Culinary Ventures Indonesia",
      location: "Jakarta Utara",
      requirements: ["Interior design certification", "F&B experience", "3D visualization capability"],
      proposals: 8,
      match: 88
    },
    {
      id: 3,
      category: "Architecture",
      subcategory: "Residential Complex",
      type: "Architecture",
      industry: "Real Estate",
      name: "Luxury Apartment Design - Sudirman",
      budget: "Rp 5,200,000,000",
      timeEstimation: "12 months",
      bidCountdown: "10 days left",
      description: "Architectural design for 40-story luxury apartment complex with world-class amenities and sustainable design features.",
      client: "Metropolitan Realty Group",
      location: "Jakarta Pusat",
      requirements: ["Licensed architect", "High-rise experience", "Green building certification"],
      proposals: 15,
      match: 92
    },
    {
      id: 4,
      category: "Construction",
      subcategory: "Office Building",
      type: "Construction",
      industry: "Corporate",
      name: "Corporate Headquarters - Thamrin",
      budget: "Rp 3,200,000,000",
      timeEstimation: "10 months",
      bidCountdown: "3 days left",
      description: "Construction of modern corporate headquarters with smart building technology and LEED certification requirements.",
      client: "TechCorp Solutions",
      location: "Jakarta Pusat",
      requirements: ["Grade A contractor license", "Smart building experience", "LEED certification"],
      proposals: 20,
      match: 85
    },
    {
      id: 5,
      category: "Interior Design",
      subcategory: "Bar & Lounge",
      type: "Interior",
      industry: "Entertainment",
      name: "Rooftop Bar Design - SCBD Jakarta",
      budget: "Rp 850,000,000",
      timeEstimation: "4 months",
      bidCountdown: "15 days left",
      description: "Design and build luxury rooftop bar with panoramic city views, premium materials, and atmospheric lighting.",
      client: "Nightlife Hospitality",
      location: "Jakarta Selatan",
      requirements: ["Bar/restaurant design experience", "Outdoor design capability", "Premium material knowledge"],
      proposals: 6,
      match: 78
    },
    {
      id: 6,
      category: "Construction",
      subcategory: "Renovation",
      type: "Renovation",
      industry: "Food & Beverage",
      name: "Bakery Shop Renovation - Kelapa Gading",
      budget: "Rp 180,000,000",
      timeEstimation: "8 weeks",
      bidCountdown: "7 days left",
      description: "Complete renovation of existing bakery including kitchen upgrade, dining area redesign, and facade improvement.",
      client: "Golden Bread Bakery",
      location: "Jakarta Utara",
      requirements: ["Small scale renovation experience", "Food service facility knowledge", "Quick turnaround capability"],
      proposals: 25,
      match: 82
    },
    {
      id: 7,
      category: "Interior Design",
      subcategory: "Office Design",
      type: "Interior",
      industry: "Corporate",
      name: "Startup Office Interior - Kuningan",
      budget: "Rp 320,000,000",
      timeEstimation: "10 weeks",
      bidCountdown: "9 days left",
      description: "Modern, flexible workspace design for tech startup with collaborative spaces, meeting rooms, and recreational areas.",
      client: "InnovateTech Startup",
      location: "Jakarta Selatan",
      requirements: ["Modern office design experience", "Flexible workspace knowledge", "Budget-conscious approach"],
      proposals: 18,
      match: 90
    },
    {
      id: 8,
      category: "Architecture",
      subcategory: "Facade Design",
      type: "Architecture",
      industry: "Food & Beverage",
      name: "Street Food Court Design - Senopati",
      budget: "Rp 420,000,000",
      timeEstimation: "12 weeks",
      bidCountdown: "6 days left",
      description: "Architectural design for modern street food court with open-air concept, traditional Indonesian elements, and contemporary aesthetics.",
      client: "Senopati Food Ventures",
      location: "Jakarta Selatan",
      requirements: ["Food court design experience", "Cultural design sensitivity", "Outdoor space planning"],
      proposals: 14,
      match: 76
    },
  ]);

  const [filteredData, setFilteredData] = useState(marketData);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedIndustry, setSelectedIndustry] = useState("All");
  const [sortBy, setSortBy] = useState("match");
  
  // Modal states
  const [selectedProject, setSelectedProject] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  
  // Toast notification state
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });

  const categories = ["All", "Construction", "Interior Design", "Architecture"];
  const industries = ["All", "Retail", "Food & Beverage", "Real Estate", "Corporate", "Entertainment"];

  const getBidCountdownColor = (countdown) => {
    const days = parseInt(countdown.split(" ")[0]);
    if (days <= 3)
      return "text-red-600 bg-red-50";
    if (days <= 7)
      return "text-blue-600 bg-blue-50";
    return "text-gray-600 bg-gray-50";
  };

  const getMatchColor = (match) => {
    if (match >= 90) return "text-blue-600 bg-blue-50";
    if (match >= 80) return "text-gray-600 bg-gray-50";
    return "text-gray-500 bg-gray-50";
  };

  const filterAndSortData = () => {
    let filtered = marketData;

    if (selectedCategory !== "All") {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    if (selectedIndustry !== "All") {
      filtered = filtered.filter(item => item.industry === selectedIndustry);
    }

    // Sort data
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "match":
          return b.match - a.match;
        case "budget":
          return parseInt(b.budget.replace(/[^\d]/g, '')) - parseInt(a.budget.replace(/[^\d]/g, ''));
        case "deadline":
          return parseInt(a.bidCountdown.split(" ")[0]) - parseInt(b.bidCountdown.split(" ")[0]);
        case "proposals":
          return a.proposals - b.proposals;
        default:
          return 0;
      }
    });

    setFilteredData(filtered);
  };

  React.useEffect(() => {
    filterAndSortData();
  }, [selectedCategory, selectedIndustry, sortBy]);

  // Modal handlers
  const handleViewProject = (project) => {
    setSelectedProject(project);
    setIsDetailModalOpen(true);
  };

  const handleCreateProposal = (project) => {
    setSelectedProject(project);
    setIsDetailModalOpen(false);
    setIsProposalModalOpen(true);
  };

  const handleSubmitProposal = async (proposalData) => {
    // Enhance proposal data with project information
    const enhancedProposalData = {
      ...proposalData,
      projectTitle: selectedProject?.name,
      client: selectedProject?.client,
      budget: selectedProject?.budget,
      category: selectedProject?.category,
      location: selectedProject?.location,
      description: selectedProject?.description
    };
    
    const result = await submitProposal(enhancedProposalData);
    
    if (result.success) {
      setToast({
        isVisible: true,
        message: 'Proposal submitted successfully! You can track its progress in the Proposals section.',
        type: 'success'
      });
    } else {
      setToast({
        isVisible: true,
        message: 'Failed to submit proposal. Please try again.',
        type: 'error'
      });
    }
  };

  const closeToast = () => {
    setToast({ ...toast, isVisible: false });
  };

  const closeModals = () => {
    setIsDetailModalOpen(false);
    setIsProposalModalOpen(false);
    setSelectedProject(null);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Project Marketplace 🏗️
        </h1>
        <p className="text-slate-600">
          Discover projects and submit proposals to win new business opportunities.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Industry
            </label>
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {industries.map((industry) => (
                <option key={industry} value={industry}>
                  {industry}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="match">Best Match</option>
              <option value="budget">Highest Budget</option>
              <option value="deadline">Urgent Deadline</option>
              <option value="proposals">Least Competition</option>
            </select>
          </div>
          <div className="flex items-end">
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Project Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredData.map((project) => (
          <div
            key={project.id}
            className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-700">
                      {project.category}
                    </span>
                    <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-700">
                      {project.industry}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-1">
                    {project.name}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {project.client} • {project.location}
                  </p>
                </div>
                <div className="text-right ml-4">
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getMatchColor(project.match)}`}>
                    {project.match}% Match
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-slate-600 mb-4 line-clamp-3">
                {project.description}
              </p>

              {/* Requirements */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-slate-900 mb-2">Requirements</h4>
                <div className="flex flex-wrap gap-1">
                  {project.requirements.slice(0, 2).map((req, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded"
                    >
                      {req}
                    </span>
                  ))}
                  {project.requirements.length > 2 && (
                    <span className="px-2 py-1 text-xs bg-slate-100 text-slate-600 rounded">
                      +{project.requirements.length - 2} more
                    </span>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-slate-500">Budget</p>
                  <p className="text-sm font-semibold text-slate-900">{project.budget}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Duration</p>
                  <p className="text-sm font-semibold text-slate-900">{project.timeEstimation}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-xs text-slate-500">Proposals</p>
                  <p className="text-sm font-semibold text-slate-900">{project.proposals} submitted</p>
                </div>
                <div>
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getBidCountdownColor(project.bidCountdown)}`}>
                    {project.bidCountdown}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3">
                <button 
                  onClick={() => handleCreateProposal(project)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Tender
                </button>
                <button 
                  onClick={() => handleViewProject(project)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      <div className="text-center mt-8">
        <button className="px-6 py-3 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors">
          Load More Projects
        </button>
      </div>

      {/* Modals */}
      <ProjectDetailModal
        project={selectedProject}
        isOpen={isDetailModalOpen}
        onClose={closeModals}
        onCreateProposal={handleCreateProposal}
      />
      
      <ProposalSubmissionModal
        project={selectedProject}
        isOpen={isProposalModalOpen}
        onClose={closeModals}
        onSubmit={handleSubmitProposal}
      />

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={closeToast}
      />
    </main>
  );
};

export default ProjectMarketplace;
