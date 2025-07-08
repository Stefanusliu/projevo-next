'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BOQGeneratorComponent() {
  const router = useRouter();
  const [currentView, setCurrentView] = useState('editor');
  const [currentBOQId, setCurrentBOQId] = useState(null);
  const [boqTitle, setBoqTitle] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [tahapanKerja, setTahapanKerja] = useState([
    {
      id: 1,
      name: '',
      jenisKerja: [
        {
          id: 2,
          name: '',
          uraian: [
            {
              id: 3,
              name: '',
              spec: [
                {
                  id: 4,
                  description: '',
                  satuan: '',
                  volume: null,
                  pricePerPcs: null
                }
              ]
            }
          ]
        }
      ]
    }
  ]);
  const [savedBOQs, setSavedBOQs] = useState([]);
  const [editMode, setEditMode] = useState(true);
  const [draggedTahapan, setDraggedTahapan] = useState(null);
  const [draggedJenis, setDraggedJenis] = useState(null);
  const [draggedUraian, setDraggedUraian] = useState(null);
  const [lastAutoSave, setLastAutoSave] = useState(null);
  const [showAutosaveNotification, setShowAutosaveNotification] = useState(false);
  const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0, tahapanId: null, jenisId: null, uraianId: null, type: null });
  const [tooltip, setTooltip] = useState({ show: false, text: '', x: 0, y: 0 });
  const [bulkAddModal, setBulkAddModal] = useState({ show: false, type: '', tahapanId: null, jenisId: null, uraianId: null, count: 1 });

  useEffect(() => {
    const savedData = localStorage.getItem('projevo_boqs');
    if (savedData) {
      setSavedBOQs(JSON.parse(savedData));
    }

    // Load autosaved draft on component mount
    const autosaveData = localStorage.getItem('projevo_boq_autosave');
    if (autosaveData) {
      try {
        const draft = JSON.parse(autosaveData);
        // Only load if it's recent (within last 24 hours) and has content
        const hoursSinceAutosave = (Date.now() - draft.timestamp) / (1000 * 60 * 60);
        if (hoursSinceAutosave < 24 && (draft.boqTitle.trim() || draft.tahapanKerja.some(t => t.name.trim()))) {
          setBoqTitle(draft.boqTitle);
          setTahapanKerja(draft.tahapanKerja);
          setCurrentBOQId(draft.currentBOQId);
          setLastAutoSave(new Date(draft.timestamp));
          setShowAutosaveNotification(true);
          
          // Hide notification after 5 seconds
          setTimeout(() => setShowAutosaveNotification(false), 5000);
        }
      } catch (error) {
        console.error('Error loading autosave data:', error);
      }
    }
  }, []);

  // Autosave effect - saves draft every few seconds when changes are made
  useEffect(() => {
    const autosaveTimer = setTimeout(() => {
      // Only autosave if there's meaningful content
      if (boqTitle.trim() || tahapanKerja.some(t => t.name.trim() || 
          t.jenisKerja.some(j => j.name.trim() || 
            j.uraian.some(u => u.name.trim() || 
              u.spec.some(s => s.description.trim() || s.satuan.trim() || s.volume || s.pricePerPcs))))) {
        
        const autosaveData = {
          boqTitle,
          tahapanKerja,
          currentBOQId,
          timestamp: Date.now()
        };
        
        localStorage.setItem('projevo_boq_autosave', JSON.stringify(autosaveData));
        setLastAutoSave(new Date());
      }
    }, 3000); // Autosave every 3 seconds

    return () => clearTimeout(autosaveTimer);
  }, [boqTitle, tahapanKerja, currentBOQId]);

  // Click outside to close context menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (contextMenu.show) {
        setContextMenu({ show: false, x: 0, y: 0, tahapanId: null, jenisId: null, uraianId: null, type: null });
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [contextMenu.show]);

  // Generate unique ID
  const generateId = () => {
    return Date.now() + Math.random();
  };

  // Add new tahapan kerja
  const addTahapan = () => {
    const newTahapan = {
      id: generateId(),
      name: '',
      jenisKerja: [
        {
          id: generateId(),
          name: '',
          uraian: [
            {
              id: generateId(),
              name: '',
              spec: [
                {
                  id: generateId(),
                  description: '',
                  satuan: '',
                  volume: null,
                  pricePerPcs: null
                }
              ]
            }
          ]
        }
      ]
    };
    setTahapanKerja([...tahapanKerja, newTahapan]);
  };

  // Add new jenis kerja
  const addJenisKerja = (tahapanId) => {
    const newJenis = {
      id: generateId(),
      name: '',
      uraian: [
        {
          id: generateId(),
          name: '',
          spec: [
            {
              id: generateId(),
              description: '',
              satuan: '',
              volume: null,
              pricePerPcs: null
            }
          ]
        }
      ]
    };

    setTahapanKerja(tahapanKerja.map(tahapan => {
      if (tahapan.id === tahapanId) {
        return {
          ...tahapan,
          jenisKerja: [...tahapan.jenisKerja, newJenis]
        };
      }
      return tahapan;
    }));
  };

  // Add new uraian
  const addUraian = (tahapanId, jenisId) => {
    const newUraian = {
      id: generateId(),
      name: '',
      spec: [
        {
          id: generateId(),
          description: '',
          satuan: '',
          volume: null,
          pricePerPcs: null
        }
      ]
    };

    setTahapanKerja(tahapanKerja.map(tahapan => {
      if (tahapan.id === tahapanId) {
        return {
          ...tahapan,
          jenisKerja: tahapan.jenisKerja.map(jenis => {
            if (jenis.id === jenisId) {
              return {
                ...jenis,
                uraian: [...jenis.uraian, newUraian]
              };
            }
            return jenis;
          })
        };
      }
      return tahapan;
    }));
  };

  // Add new spec
  const addSpec = (tahapanId, jenisId, uraianId) => {
    const newSpec = {
      id: generateId(),
      description: '',
      satuan: '',
      volume: null,
      pricePerPcs: null
    };

    setTahapanKerja(tahapanKerja.map(tahapan => {
      if (tahapan.id === tahapanId) {
        return {
          ...tahapan,
          jenisKerja: tahapan.jenisKerja.map(jenis => {
            if (jenis.id === jenisId) {
              return {
                ...jenis,
                uraian: jenis.uraian.map(uraian => {
                  if (uraian.id === uraianId) {
                    return {
                      ...uraian,
                      spec: [...uraian.spec, newSpec]
                    };
                  }
                  return uraian;
                })
              };
            }
            return jenis;
          })
        };
      }
      return tahapan;
    }));
  };

  // Handle key press for inputs
  const handleKeyPress = (e, tahapanId, jenisId, uraianId, currentIndex, fieldType) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSpec(tahapanId, jenisId, uraianId);
      // Focus on the first input of the new row after a short delay
      setTimeout(() => {
        const nextRowIndex = tahapanKerja[0]?.jenisKerja[0]?.uraian[0]?.spec.length - 1;
        const nextInput = document.querySelector(`input[data-row-index="${nextRowIndex}"][data-field="description"]`);
        if (nextInput) {
          nextInput.focus();
        }
      }, 50);
    } else if (e.key === 'Tab') {
      // Let default tab behavior handle navigation between inputs
      return;
    }
  };

  // Handle number input validation
  const handleNumberInput = (e, tahapanId, jenisId, uraianId, specId, field) => {
    const value = e.target.value;
    // Allow empty string, numbers, and decimal points
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      updateSpec(tahapanId, jenisId, uraianId, specId, field, value === '' ? null : parseFloat(value) || null);
    }
  };

  // Delete tahapan
  const deleteTahapan = (tahapanId) => {
    const tahapan = tahapanKerja.find(t => t.id === tahapanId);
    if (!tahapan) return;
    
    const confirmMessage = tahapan.name.trim() 
      ? `Are you sure you want to delete "${tahapan.name}"? This action cannot be undone.`
      : 'Are you sure you want to delete this work stage? This action cannot be undone.';
    
    if (window.confirm(confirmMessage)) {
      setTahapanKerja(tahapanKerja.filter(t => t.id !== tahapanId));
    }
  };

  // Delete jenis kerja
  const deleteJenisKerja = (tahapanId, jenisId) => {
    setTahapanKerja(tahapanKerja.map(tahapan => {
      if (tahapan.id === tahapanId) {
        return {
          ...tahapan,
          jenisKerja: tahapan.jenisKerja.filter(jenis => jenis.id !== jenisId)
        };
      }
      return tahapan;
    }));
  };

  // Delete uraian
  const deleteUraian = (tahapanId, jenisId, uraianId) => {
    setTahapanKerja(tahapanKerja.map(tahapan => {
      if (tahapan.id === tahapanId) {
        return {
          ...tahapan,
          jenisKerja: tahapan.jenisKerja.map(jenis => {
            if (jenis.id === jenisId) {
              return {
                ...jenis,
                uraian: jenis.uraian.filter(uraian => uraian.id !== uraianId)
              };
            }
            return jenis;
          })
        };
      }
      return tahapan;
    }));
  };

  // Delete spec
  const deleteSpec = (tahapanId, jenisId, uraianId, specId) => {
    setTahapanKerja(tahapanKerja.map(tahapan => {
      if (tahapan.id === tahapanId) {
        return {
          ...tahapan,
          jenisKerja: tahapan.jenisKerja.map(jenis => {
            if (jenis.id === jenisId) {
              return {
                ...jenis,
                uraian: jenis.uraian.map(uraian => {
                  if (uraian.id === uraianId) {
                    return {
                      ...uraian,
                      spec: uraian.spec.filter(spec => spec.id !== specId)
                    };
                  }
                  return uraian;
                })
              };
            }
            return jenis;
          })
        };
      }
      return tahapan;
    }));
  };

  // Update functions for different levels
  const updateTahapan = (tahapanId, name) => {
    setTahapanKerja(tahapanKerja.map(tahapan => 
      tahapan.id === tahapanId ? { ...tahapan, name } : tahapan
    ));
  };

  const updateJenisKerja = (tahapanId, jenisId, name) => {
    setTahapanKerja(tahapanKerja.map(tahapan => {
      if (tahapan.id === tahapanId) {
        return {
          ...tahapan,
          jenisKerja: tahapan.jenisKerja.map(jenis => 
            jenis.id === jenisId ? { ...jenis, name } : jenis
          )
        };
      }
      return tahapan;
    }));
  };

  const updateUraian = (tahapanId, jenisId, uraianId, name) => {
    setTahapanKerja(tahapanKerja.map(tahapan => {
      if (tahapan.id === tahapanId) {
        return {
          ...tahapan,
          jenisKerja: tahapan.jenisKerja.map(jenis => {
            if (jenis.id === jenisId) {
              return {
                ...jenis,
                uraian: jenis.uraian.map(uraian => 
                  uraian.id === uraianId ? { ...uraian, name } : uraian
                )
              };
            }
            return jenis;
          })
        };
      }
      return tahapan;
    }));
  };

  const updateSpec = (tahapanId, jenisId, uraianId, specId, field, value) => {
    setTahapanKerja(tahapanKerja.map(tahapan => {
      if (tahapan.id === tahapanId) {
        return {
          ...tahapan,
          jenisKerja: tahapan.jenisKerja.map(jenis => {
            if (jenis.id === jenisId) {
              return {
                ...jenis,
                uraian: jenis.uraian.map(uraian => {
                  if (uraian.id === uraianId) {
                    return {
                      ...uraian,
                      spec: uraian.spec.map(spec => 
                        spec.id === specId ? { ...spec, [field]: value } : spec
                      )
                    };
                  }
                  return uraian;
                })
              };
            }
            return jenis;
          })
        };
      }
      return tahapan;
    }));
  };

  // Calculate total for a spec
  const calculateSpecTotal = (volume, pricePerPcs) => {
    if (!volume || !pricePerPcs) return 0;
    return volume * pricePerPcs;
  };

  // Calculate grand total
  const calculateGrandTotal = () => {
    let total = 0;
    tahapanKerja.forEach(tahapan => {
      tahapan.jenisKerja.forEach(jenis => {
        jenis.uraian.forEach(uraian => {
          uraian.spec.forEach(spec => {
            total += calculateSpecTotal(spec.volume, spec.pricePerPcs);
          });
        });
      });
    });
    return total;
  };

  // Save BOQ
  const saveBOQ = () => {
    if (!boqTitle.trim()) {
      alert('Please enter a BOQ title');
      return;
    }

    // Check if there's at least one meaningful entry
    const hasContent = tahapanKerja.some(tahapan => 
      tahapan.name.trim() || 
      tahapan.jenisKerja.some(jenis => 
        jenis.name.trim() || 
        jenis.uraian.some(uraian => 
          uraian.name.trim() || 
          uraian.spec.some(spec => 
            spec.description.trim() || spec.satuan.trim() || spec.volume || spec.pricePerPcs
          )
        )
      )
    );

    if (!hasContent) {
      alert('Please add at least one work item to save the BOQ');
      return;
    }

    const boqData = {
      id: currentBOQId || generateId(),
      title: boqTitle,
      tahapanKerja: tahapanKerja,
      createdAt: currentBOQId ? getSavedBOQ(currentBOQId)?.createdAt || new Date().toISOString() : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      total: calculateGrandTotal()
    };

    let updatedBOQs;
    if (currentBOQId) {
      // Update existing BOQ
      updatedBOQs = savedBOQs.map(boq => boq.id === currentBOQId ? boqData : boq);
    } else {
      // Add new BOQ
      updatedBOQs = [...savedBOQs, boqData];
      setCurrentBOQId(boqData.id);
    }

    setSavedBOQs(updatedBOQs);
    localStorage.setItem('projevo_boqs', JSON.stringify(updatedBOQs));
    
    // Clear autosave after successful save
    localStorage.removeItem('projevo_boq_autosave');
    
    setShowSuccessModal(true);
  };

  // Export to CSV
  const exportToCSV = () => {
    if (!boqTitle.trim()) {
      alert('Please enter a BOQ title before exporting');
      return;
    }

    let csvContent = 'Work Stage,Work Type,Work Description,Specification,Unit,Volume,Price per Unit,Total\n';
    
    tahapanKerja.forEach(tahapan => {
      tahapan.jenisKerja.forEach(jenis => {
        jenis.uraian.forEach(uraian => {
          uraian.spec.forEach(spec => {
            const total = calculateSpecTotal(spec.volume, spec.pricePerPcs);
            csvContent += `"${tahapan.name}","${jenis.name}","${uraian.name}","${spec.description}","${spec.satuan}","${spec.volume || ''}","${spec.pricePerPcs || ''}","${total}"\n`;
          });
        });
      });
    });

    csvContent += `\n,,,,,,"Grand Total","${calculateGrandTotal()}"`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${boqTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_boq.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Load existing BOQ
  const loadBOQ = (boqId) => {
    const boq = savedBOQs.find(b => b.id === boqId);
    if (boq) {
      setBoqTitle(boq.title);
      setTahapanKerja(boq.tahapanKerja);
      setCurrentBOQId(boq.id);
      setCurrentView('editor');
    }
  };

  // Create new BOQ
  const createNewBOQ = () => {
    setCurrentBOQId(null);
    setBoqTitle('');
    setTahapanKerja([
      {
        id: generateId(),
        name: '',
        jenisKerja: [
          {
            id: generateId(),
            name: '',
            uraian: [
              {
                id: generateId(),
                name: '',
                spec: [
                  {
                    id: generateId(),
                    description: '',
                    satuan: '',
                    volume: null,
                    pricePerPcs: null
                  }
                ]
              }
            ]
          }
        ]
      }
    ]);
    setCurrentView('editor');
  };

  // Get saved BOQ by ID
  const getSavedBOQ = (id) => {
    return savedBOQs.find(boq => boq.id === id);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Bulk add functions for BOQ Generator
  const openBulkAddModal = (type, tahapanId = null, jenisId = null, uraianId = null) => {
    setBulkAddModal({
      show: true,
      type,
      tahapanId,
      jenisId,
      uraianId,
      count: 1
    });
  };

  const closeBulkAddModal = () => {
    setBulkAddModal({
      show: false,
      type: '',
      tahapanId: null,
      jenisId: null,
      uraianId: null,
      count: 1
    });
  };

  const handleBulkAdd = () => {
    const { type, tahapanId, jenisId, uraianId, count } = bulkAddModal;
    
    for (let i = 0; i < count; i++) {
      // Add a small delay to ensure unique IDs
      setTimeout(() => {
        if (type === 'spec') {
          addSpec(tahapanId, jenisId, uraianId);
        }
      }, i * 10); // 10ms delay between each addition
    }
    
    closeBulkAddModal();
  };

  return (
    <div className="bg-white rounded-lg border border-gray-300">
      {/* Main Content without Header/Footer */}
      <div className="p-6">
        {currentView === 'list' ? (
          // List View
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-black">Draft BOQ Generator</h3>
              <button
                onClick={createNewBOQ}
                className="text-white px-4 py-2 rounded-lg transition-colors"
                style={{ backgroundColor: '#2373FF' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#1d63ed'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#2373FF'}
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
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No BOQs yet</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">Create your first Bill of Quantities to get started.</p>
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
                        Total: Rp {(boq.total || 0).toLocaleString('id-ID')}
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
          </div>
        ) : (
          // Editor View
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">BOQ Editor</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentView('list')}
                  className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  View Saved BOQs
                </button>
                <button
                  onClick={saveBOQ}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Save BOQ
                </button>
                <button
                  onClick={exportToCSV}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Export CSV
                </button>
              </div>
            </div>

            {/* BOQ Title Input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                BOQ Title
              </label>
              <input
                type="text"
                value={boqTitle}
                onChange={(e) => setBoqTitle(e.target.value)}
                placeholder="Enter BOQ title..."
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
              />
            </div>

            {/* Simple BOQ Form - Basic version for dashboard */}
            <div className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                <h4 className="font-medium text-slate-900 dark:text-white mb-4">Quick BOQ Entry</h4>
                <div className="grid grid-cols-5 gap-4 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  <div>Description</div>
                  <div>Unit</div>
                  <div>Volume</div>
                  <div>Price/Unit</div>
                  <div>Total</div>
                </div>
                <div className="space-y-2">
                  {tahapanKerja[0]?.jenisKerja[0]?.uraian[0]?.spec.map((spec, index) => (
                    <div key={spec.id} className="grid grid-cols-5 gap-4">
                      <input
                        type="text"
                        value={spec.description}
                        onChange={(e) => updateSpec(tahapanKerja[0].id, tahapanKerja[0].jenisKerja[0].id, tahapanKerja[0].jenisKerja[0].uraian[0].id, spec.id, 'description', e.target.value)}
                        onKeyDown={(e) => handleKeyPress(e, tahapanKerja[0].id, tahapanKerja[0].jenisKerja[0].id, tahapanKerja[0].jenisKerja[0].uraian[0].id, index, 'description')}
                        placeholder="Item description"
                        className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-600 dark:text-white text-sm h-10"
                        data-row-index={index}
                        data-field="description"
                      />
                      <input
                        type="text"
                        value={spec.satuan}
                        onChange={(e) => updateSpec(tahapanKerja[0].id, tahapanKerja[0].jenisKerja[0].id, tahapanKerja[0].jenisKerja[0].uraian[0].id, spec.id, 'satuan', e.target.value)}
                        onKeyDown={(e) => handleKeyPress(e, tahapanKerja[0].id, tahapanKerja[0].jenisKerja[0].id, tahapanKerja[0].jenisKerja[0].uraian[0].id, index, 'satuan')}
                        placeholder="Unit"
                        className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-600 dark:text-white text-sm h-10"
                        data-row-index={index}
                        data-field="satuan"
                      />
                      <input
                        type="text"
                        value={spec.volume || ''}
                        onChange={(e) => handleNumberInput(e, tahapanKerja[0].id, tahapanKerja[0].jenisKerja[0].id, tahapanKerja[0].jenisKerja[0].uraian[0].id, spec.id, 'volume')}
                        onKeyDown={(e) => handleKeyPress(e, tahapanKerja[0].id, tahapanKerja[0].jenisKerja[0].id, tahapanKerja[0].jenisKerja[0].uraian[0].id, index, 'volume')}
                        placeholder="0"
                        inputMode="decimal"
                        style={{ 
                          MozAppearance: 'textfield',
                          WebkitAppearance: 'none'
                        }}
                        className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-600 dark:text-white text-sm h-10 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        data-row-index={index}
                        data-field="volume"
                      />
                      <input
                        type="text"
                        value={spec.pricePerPcs || ''}
                        onChange={(e) => handleNumberInput(e, tahapanKerja[0].id, tahapanKerja[0].jenisKerja[0].id, tahapanKerja[0].jenisKerja[0].uraian[0].id, spec.id, 'pricePerPcs')}
                        onKeyDown={(e) => handleKeyPress(e, tahapanKerja[0].id, tahapanKerja[0].jenisKerja[0].id, tahapanKerja[0].jenisKerja[0].uraian[0].id, index, 'pricePerPcs')}
                        placeholder="0"
                        inputMode="decimal"
                        style={{ 
                          MozAppearance: 'textfield',
                          WebkitAppearance: 'none'
                        }}
                        className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-600 dark:text-white text-sm h-10 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        data-row-index={index}
                        data-field="pricePerPcs"
                      />
                      <div className="px-3 py-2 bg-slate-100 dark:bg-slate-600 rounded text-sm font-medium flex items-center h-10">
                        Rp {calculateSpecTotal(spec.volume, spec.pricePerPcs).toLocaleString('id-ID')}
                      </div>
                    </div>
                  ))}
                </div>
                {/* Add Item button moved outside of table */}
                <div className="mt-4 pt-4 border-t border-slate-300 dark:border-slate-600">
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      <button
                        onClick={() => addSpec(tahapanKerja[0].id, tahapanKerja[0].jenisKerja[0].id, tahapanKerja[0].jenisKerja[0].uraian[0].id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                        tabIndex={-1}
                      >
                        Add Item
                      </button>
                      <button
                        onClick={() => openBulkAddModal('spec', tahapanKerja[0].id, tahapanKerja[0].jenisKerja[0].id, tahapanKerja[0].jenisKerja[0].uraian[0].id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                        tabIndex={-1}
                      >
                        + Add Multiple
                      </button>
                    </div>
                    <div className="text-lg font-bold text-slate-900 dark:text-white">
                      Grand Total: Rp {calculateGrandTotal().toLocaleString('id-ID')}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center pt-4">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Need more advanced features? Use the full BOQ Maker.
              </p>
              <button
                onClick={() => router.push('/boq-maker')}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold"
              >
                Open Full BOQ Maker
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-3">BOQ Saved Successfully!</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">Your Bill of Quantities has been saved and is ready for use.</p>
              
              <div className="space-y-3">
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold"
                >
                  Continue Editing
                </button>
                <button
                  onClick={() => {
                    setShowSuccessModal(false);
                    setCurrentView('list');
                  }}
                  className="w-full border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 px-6 py-3 rounded-lg hover:border-blue-500 hover:text-blue-600 transition-all duration-200 font-semibold"
                >
                  View All BOQs
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Add Modal */}
      {bulkAddModal.show && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 max-w-md mx-4 border border-slate-200 dark:border-slate-600">
            <div className="text-center">
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">
                Add Multiple Specifications
              </h3>
              <p className="text-slate-600 dark:text-slate-300 mb-6">
                How many specifications would you like to add at once?
              </p>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={bulkAddModal.count}
                  onChange={(e) => setBulkAddModal(prev => ({
                    ...prev,
                    count: Math.max(1, Math.min(50, parseInt(e.target.value) || 1))
                  }))}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-100 dark:bg-slate-700 text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleBulkAdd();
                    } else if (e.key === 'Escape') {
                      closeBulkAddModal();
                    }
                  }}
                  autoFocus
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Maximum 50 items</p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={closeBulkAddModal}
                  className="flex-1 px-4 py-2 bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg transition-all duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkAdd}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 font-medium"
                >
                  Add {bulkAddModal.count} Items
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
