'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { FiX, FiCalendar, FiMapPin, FiExternalLink, FiStar } from 'react-icons/fi';
import Image from 'next/image';

export default function VendorPortfolioModal({ isOpen, onClose, vendorId, vendorName }) {
  const [vendorProfile, setVendorProfile] = useState(null);
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && vendorId) {
      loadVendorData();
    }
  }, [isOpen, vendorId]);

  const loadVendorData = async () => {
    setLoading(true);
    try {
      // Load vendor profile
      const vendorRef = doc(db, 'vendorProfiles', vendorId);
      const vendorDoc = await getDoc(vendorRef);
      
      if (vendorDoc.exists()) {
        setVendorProfile(vendorDoc.data());
      }

      // Load portfolio items
      const portfolioRef = collection(db, 'vendorProfiles', vendorId, 'portfolio');
      const portfolioSnapshot = await getDocs(portfolioRef);
      const items = [];
      portfolioSnapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });
      setPortfolioItems(items);
    } catch (error) {
      console.error('Error loading vendor data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{vendorName}</h2>
            <p className="text-gray-600">Portfolio & Company Profile</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading vendor portfolio...</p>
            </div>
          ) : (
            <div className="p-6 space-y-8">
              {/* Company Profile */}
              {vendorProfile && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Company Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Company Name</p>
                      <p className="font-medium">{vendorProfile.companyName || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Industry</p>
                      <p className="font-medium">{vendorProfile.industry || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Years of Experience</p>
                      <p className="font-medium">{vendorProfile.yearsOfExperience || 'Not specified'} years</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Company Size</p>
                      <p className="font-medium">{vendorProfile.companySize || 'Not specified'}</p>
                    </div>
                    {vendorProfile.location && (
                      <div className="md:col-span-2">
                        <p className="text-sm text-gray-600">Location</p>
                        <p className="font-medium flex items-center gap-1">
                          <FiMapPin size={16} />
                          {vendorProfile.location}
                        </p>
                      </div>
                    )}
                    {vendorProfile.description && (
                      <div className="md:col-span-2">
                        <p className="text-sm text-gray-600">Company Description</p>
                        <p className="font-medium">{vendorProfile.description}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Portfolio Projects */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Portfolio Projects ({portfolioItems.length})
                </h3>
                
                {portfolioItems.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {portfolioItems.map((item) => (
                      <div key={item.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                        {item.imageUrl && (
                          <div className="relative h-48 bg-gray-100">
                            <Image
                              src={item.imageUrl}
                              alt={item.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="p-4">
                          <h4 className="font-semibold text-gray-900 mb-2">{item.title}</h4>
                          {item.description && (
                            <p className="text-gray-600 text-sm mb-3 line-clamp-3">{item.description}</p>
                          )}
                          
                          <div className="space-y-2">
                            {item.client && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <span className="font-medium">Client:</span>
                                <span>{item.client}</span>
                              </div>
                            )}
                            
                            {item.completionDate && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <FiCalendar size={14} />
                                <span>Completed: {new Date(item.completionDate).toLocaleDateString('id-ID')}</span>
                              </div>
                            )}
                            
                            {item.projectValue && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <span className="font-medium">Value:</span>
                                <span>Rp {parseInt(item.projectValue).toLocaleString('id-ID')}</span>
                              </div>
                            )}
                            
                            {item.technologies && item.technologies.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {item.technologies.map((tech, index) => (
                                  <span 
                                    key={index}
                                    className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                                  >
                                    {tech}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No portfolio items available for this vendor.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4 bg-gray-50">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
