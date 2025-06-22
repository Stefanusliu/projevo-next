'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function BOQMaker() {
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
  const [lastAutoSave, setLastAutoSave] = useState(null);
  const [showAutosaveNotification, setShowAutosaveNotification] = useState(false);

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

  const addTahapanKerja = () => {
    setTahapanKerja([
      ...tahapanKerja,
      {
        id: Date.now(),
        name: '',
        jenisKerja: [
          {
            id: Date.now() + 1,
            name: '',
            uraian: [
              {
                id: Date.now() + 2,
                name: '',
                spec: [
                  {
                    id: Date.now() + 3,
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
  };

  const updateTahapanKerja = (id, name) => {
    setTahapanKerja(tahapanKerja.map(tahapan => 
      tahapan.id === id ? { ...tahapan, name } : tahapan
    ));
  };

  const smartDelete = (tahapanId, jenisId, uraianId, specId) => {
    const tahapan = tahapanKerja.find(t => t.id === tahapanId);
    if (!tahapan) return;

    if (uraianId) {
      // If we have uraianId, delete this uraian (spec is inline, so it gets deleted with uraian)
      deleteUraian(tahapanId, jenisId, uraianId);
    } else if (jenisId) {
      const jenis = tahapan.jenisKerja.find(j => j.id === jenisId);
      if (jenis) {
        if (jenis.uraian.length > 0) {
          // If jenis has uraian, delete all uraian first
          jenis.uraian.forEach(uraian => {
            deleteUraian(tahapanId, jenisId, uraian.id);
          });
        } else {
          // If jenis has no uraian, delete the jenis
          deleteJenisKerja(tahapanId, jenisId);
        }
      }
    } else {
      // Delete tahapan if there are multiple tahapans
      if (tahapanKerja.length > 1) {
        deleteTahapanKerja(tahapanId);
      }
    }
  };

  const deleteTahapanKerja = (id) => {
    setTahapanKerja(tahapanKerja.filter(tahapan => tahapan.id !== id));
  };

  const handleDragStart = (e, tahapanId) => {
    setDraggedTahapan(tahapanId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetTahapanId) => {
    e.preventDefault();
    
    if (!draggedTahapan || draggedTahapan === targetTahapanId) {
      setDraggedTahapan(null);
      return;
    }

    const newTahapanKerja = [...tahapanKerja];
    const draggedIndex = newTahapanKerja.findIndex(t => t.id === draggedTahapan);
    const targetIndex = newTahapanKerja.findIndex(t => t.id === targetTahapanId);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedTahapan(null);
      return;
    }

    // Remove dragged item and insert at target position
    const [draggedItem] = newTahapanKerja.splice(draggedIndex, 1);
    newTahapanKerja.splice(targetIndex, 0, draggedItem);

    setTahapanKerja(newTahapanKerja);
    setDraggedTahapan(null);
  };

  const handleDragEnd = () => {
    setDraggedTahapan(null);
  };

  const addJenisKerja = (tahapanId) => {
    setTahapanKerja(tahapanKerja.map(tahapan => 
      tahapan.id === tahapanId 
        ? { 
            ...tahapan, 
            jenisKerja: [
              ...tahapan.jenisKerja, 
              { 
                id: Date.now(), 
                name: '', 
                uraian: [
                  {
                    id: Date.now() + 1,
                    name: '',
                    spec: [
                      {
                        id: Date.now() + 2,
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
        : tahapan
    ));
  };

  const updateJenisKerja = (tahapanId, jenisId, name) => {
    setTahapanKerja(tahapanKerja.map(tahapan => 
      tahapan.id === tahapanId 
        ? { 
            ...tahapan, 
            jenisKerja: tahapan.jenisKerja.map(jenis => 
              jenis.id === jenisId ? { ...jenis, name } : jenis
            )
          }
        : tahapan
    ));
    
    // No auto-add for jenis - use manual button instead
  };

  const deleteJenisKerja = (tahapanId, jenisId) => {
    setTahapanKerja(tahapanKerja.map(tahapan => 
      tahapan.id === tahapanId 
        ? { 
            ...tahapan, 
            jenisKerja: tahapan.jenisKerja.filter(jenis => jenis.id !== jenisId)
          }
        : tahapan
    ));
  };

  const addUraian = (tahapanId, jenisId) => {
    setTahapanKerja(tahapanKerja.map(tahapan => 
      tahapan.id === tahapanId 
        ? { 
            ...tahapan, 
            jenisKerja: tahapan.jenisKerja.map(jenis => 
              jenis.id === jenisId 
                ? { 
                    ...jenis, 
                    uraian: [
                      ...jenis.uraian, 
                      { 
                        id: Date.now(), 
                        name: '', 
                        spec: [
                          {
                            id: Date.now() + 1,
                            description: '',
                            satuan: '',
                            volume: null,
                            pricePerPcs: null
                          }
                        ]
                      }
                    ] 
                  }
                : jenis
            )
          }
        : tahapan
    ));
  };

  const updateUraian = (tahapanId, jenisId, uraianId, name) => {
    setTahapanKerja(tahapanKerja.map(tahapan => 
      tahapan.id === tahapanId 
        ? { 
            ...tahapan, 
            jenisKerja: tahapan.jenisKerja.map(jenis => 
              jenis.id === jenisId 
                ? { 
                    ...jenis, 
                    uraian: jenis.uraian.map(uraian => 
                      uraian.id === uraianId ? { ...uraian, name } : uraian
                    )
                  }
                : jenis
            )
          }
        : tahapan
    ));
    
    // No auto-add for uraian - use manual button instead
  };

  const deleteUraian = (tahapanId, jenisId, uraianId) => {
    setTahapanKerja(tahapanKerja.map(tahapan => 
      tahapan.id === tahapanId 
        ? { 
            ...tahapan, 
            jenisKerja: tahapan.jenisKerja.map(jenis => 
              jenis.id === jenisId 
                ? { 
                    ...jenis, 
                    uraian: jenis.uraian.filter(uraian => uraian.id !== uraianId)
                  }
                : jenis
            )
          }
        : tahapan
    ));
  };

  const addSpec = (tahapanId, jenisId, uraianId) => {
    setTahapanKerja(tahapanKerja.map(tahapan => 
      tahapan.id === tahapanId 
        ? { 
            ...tahapan, 
            jenisKerja: tahapan.jenisKerja.map(jenis => 
              jenis.id === jenisId 
                ? { 
                    ...jenis, 
                    uraian: jenis.uraian.map(uraian => 
                      uraian.id === uraianId 
                        ? { 
                            ...uraian, 
                            spec: [...uraian.spec,                            { 
                              id: Date.now(), 
                              description: '', 
                              satuan: '', 
                              volume: null, 
                              pricePerPcs: null 
                            }]
                          }
                        : uraian
                    )
                  }
                : jenis
            )
          }
        : tahapan
    ));
  };

  const updateSpec = (tahapanId, jenisId, uraianId, specId, field, value) => {
    setTahapanKerja(tahapanKerja.map(tahapan => 
      tahapan.id === tahapanId 
        ? { 
            ...tahapan, 
            jenisKerja: tahapan.jenisKerja.map(jenis => 
              jenis.id === jenisId 
                ? { 
                    ...jenis, 
                    uraian: jenis.uraian.map(uraian => 
                      uraian.id === uraianId 
                        ? { 
                            ...uraian, 
                            spec: uraian.spec.map(spec => 
                              spec.id === specId ? { ...spec, [field]: value } : spec
                            )
                          }
                        : uraian
                    )
                  }
                : jenis
            )
          }
        : tahapan
    ));
    
    // No auto-add for specs - they are inline with uraian
  };

  const deleteSpec = (tahapanId, jenisId, uraianId, specId) => {
    setTahapanKerja(tahapanKerja.map(tahapan => 
      tahapan.id === tahapanId 
        ? { 
            ...tahapan, 
            jenisKerja: tahapan.jenisKerja.map(jenis => 
              jenis.id === jenisId 
                ? { 
                    ...jenis, 
                    uraian: jenis.uraian.map(uraian => 
                      uraian.id === uraianId 
                        ? { 
                            ...uraian, 
                            spec: uraian.spec.filter(spec => spec.id !== specId)
                          }
                        : uraian
                    )
                  }
                : jenis
            )
          }
        : tahapan
    ));
  };

  const calculateSpecTotal = (spec) => {
    const volume = spec.volume || 0;
    const pricePerPcs = spec.pricePerPcs || 0;
    return volume * pricePerPcs;
  };

  const calculateGrandTotal = () => {
    let total = 0;
    tahapanKerja.forEach(tahapan => {
      tahapan.jenisKerja.forEach(jenis => {
        jenis.uraian.forEach(uraian => {
          uraian.spec.forEach(spec => {
            total += calculateSpecTotal(spec);
          });
        });
      });
    });
    return total;
  };

  const exportToCSV = () => {
    if (!boqTitle.trim()) {
      alert('Please enter a title for your BOQ before exporting');
      return;
    }

    const grandTotal = calculateGrandTotal();
    const ppn = grandTotal * 0.11;
    const totalWithPPN = grandTotal + ppn;

    let csvContent = '\ufeff'; // UTF-8 BOM
    csvContent += `BOQ: ${boqTitle}\n`;
    csvContent += `Generated: ${new Date().toLocaleDateString('id-ID')}\n\n`;
    csvContent += 'Tahapan Kerja,Jenis Pekerjaan,Uraian,Spesifikasi,Volume,Satuan,Harga per Pcs,Total\n';

    tahapanKerja.forEach(tahapan => {
      if (tahapan.jenisKerja.length === 0) {
        csvContent += `"${tahapan.name}",,,,,,,\n`;
      } else {
        tahapan.jenisKerja.forEach(jenis => {
          if (jenis.uraian.length === 0) {
            csvContent += `"${tahapan.name}","${jenis.name}",,,,,,\n`;
          } else {
            jenis.uraian.forEach(uraian => {
              if (uraian.spec.length === 0) {
                csvContent += `"${tahapan.name}","${jenis.name}","${uraian.name}",,,,,\n`;
              } else {
                uraian.spec.forEach(spec => {
                  const total = calculateSpecTotal(spec);
                  csvContent += `"${tahapan.name}","${jenis.name}","${uraian.name}","${spec.description}",${spec.volume},"${spec.satuan}","Rp ${spec.pricePerPcs.toLocaleString('id-ID')}","Rp ${total.toLocaleString('id-ID')}"\n`;
                });
              }
            });
          }
        });
      }
    });

    csvContent += '\n';
    csvContent += `,,,,,,Subtotal,"Rp ${grandTotal.toLocaleString('id-ID')}"\n`;
    csvContent += `,,,,,,PPN (11%),"Rp ${ppn.toLocaleString('id-ID')}"\n`;
    csvContent += `,,,,,,Total,"Rp ${totalWithPPN.toLocaleString('id-ID')}"\n`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `BOQ_${boqTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const saveBOQ = () => {
    if (!boqTitle.trim()) {
      alert('Please enter a title for your BOQ');
      return;
    }

    const boqData = {
      id: currentBOQId || Date.now(),
      title: boqTitle.trim(),
      tahapanKerja: tahapanKerja,
      createdAt: currentBOQId ? getSavedBOQ(currentBOQId)?.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedBOQs = currentBOQId 
      ? savedBOQs.map(boq => boq.id === currentBOQId ? boqData : boq)
      : [...savedBOQs, boqData];

    setSavedBOQs(updatedBOQs);
    localStorage.setItem('projevo_boqs', JSON.stringify(updatedBOQs));
    setCurrentBOQId(boqData.id);
    
    // Clear autosave after successful save
    localStorage.removeItem('projevo_boq_autosave');
    setLastAutoSave(null);
    
    setShowSuccessModal(true);
  };

  const loadBOQ = (id, mode = 'edit') => {
    const boq = savedBOQs.find(b => b.id === id);
    if (boq) {
      setBoqTitle(boq.title);
      setTahapanKerja(boq.tahapanKerja);
      setCurrentBOQId(id);
      setEditMode(mode === 'edit');
      setCurrentView('editor');
      
      // Clear autosave when loading existing BOQ
      localStorage.removeItem('projevo_boq_autosave');
      setLastAutoSave(null);
    }
  };

  const deleteBOQ = (id) => {
    if (confirm('Are you sure you want to delete this BOQ?')) {
      const updatedBOQs = savedBOQs.filter(boq => boq.id !== id);
      setSavedBOQs(updatedBOQs);
      localStorage.setItem('projevo_boqs', JSON.stringify(updatedBOQs));
      
      if (currentBOQId === id) {
        createNewBOQ();
      }
    }
  };

  const createNewBOQ = () => {
    setBoqTitle('');
    setTahapanKerja([
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
    setCurrentBOQId(null);
    setEditMode(true);
    setCurrentView('editor');
    
    // Clear autosave when creating new BOQ
    localStorage.removeItem('projevo_boq_autosave');
    setLastAutoSave(null);
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Header />
      
      <main className="relative">
        {/* Background gradient effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-indigo-50/30 to-purple-50/20 dark:from-slate-900 dark:via-blue-900/20 dark:to-indigo-900/20"></div>
        
        <div className="relative w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {currentView === 'list' ? (
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">Saved BOQs</h1>
                  <p className="text-blue-100">Manage your saved Bill of Quantities</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => router.push('/')}
                    className="bg-white hover:bg-slate-50 text-blue-700 px-6 py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl font-medium border border-blue-200"
                  >
                    ← Home
                  </button>
                  <button
                    onClick={createNewBOQ}
                    className="bg-white hover:bg-slate-50 text-blue-700 px-6 py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 font-medium border"
                  >
                    <span>Create New BOQ</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="p-8">
              {savedBOQs.length === 0 ? (
                <div className="text-center py-12">
                  <h3 className="text-xl font-medium text-slate-700 mb-2">No BOQs Found</h3>
                  <p className="text-slate-500 mb-4">Create your first BOQ to get started.</p>
                  <button
                    onClick={createNewBOQ}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-all duration-200 shadow-lg"
                  >
                    Create New BOQ
                  </button>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {savedBOQs.map((boq) => (
                    <div key={boq.id} className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border-2 border-slate-200 p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-slate-800 mb-2">{boq.title}</h3>
                          <div className="space-y-1 text-sm text-slate-600">
                            <p>Created: {formatDate(boq.createdAt)}</p>
                            {boq.updatedAt !== boq.createdAt && (
                              <p>Updated: {formatDate(boq.updatedAt)}</p>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                          <button
                            onClick={() => loadBOQ(boq.id, 'view')}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium"
                          >
                            View
                          </button>
                          <button
                            onClick={() => loadBOQ(boq.id, 'edit')}
                            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium"
                          >
                            Edit
                          </button>
                        </div>
                        <button
                          onClick={() => deleteBOQ(boq.id)}
                          className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">BOQ Maker</h1>
                  <p className="text-blue-100">Create detailed Bill of Quantities with local storage</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => router.push('/')}
                    className="bg-white hover:bg-slate-50 text-blue-700 px-6 py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl font-medium border border-blue-200"
                  >
                    ← Home
                  </button>
                  <button
                    onClick={() => setCurrentView('list')}
                    className="bg-slate-600 hover:bg-slate-700 text-white px-6 py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
                  >
                    Saved BOQs
                  </button>
                  {editMode && (
                    <button
                      onClick={saveBOQ}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
                    >
                      {currentBOQId ? 'Update' : 'Save'} BOQ
                    </button>
                  )}
                  {!editMode && (
                    <button
                      onClick={() => setEditMode(true)}
                      className="bg-white hover:bg-slate-50 text-blue-700 px-6 py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl font-medium border"
                    >
                      Edit Mode
                    </button>
                  )}
                  {editMode && (
                    <button
                      onClick={exportToCSV}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
                    >
                      Export CSV
                    </button>
                  )}
                  {!editMode && (
                    <button
                      onClick={exportToCSV}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
                    >
                      Export CSV
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="px-8 py-6 border-b border-slate-200 bg-slate-50">
              <div className="max-w-2xl">
                <label htmlFor="boqTitle" className="block text-sm font-medium text-slate-700 mb-2">
                  BOQ Title / Project Name
                </label>
                <input
                  id="boqTitle"
                  type="text"
                  placeholder="Enter BOQ title or project name..."
                  value={boqTitle}
                  onChange={(e) => setBoqTitle(e.target.value)}
                  disabled={!editMode}
                  className={
                    editMode 
                      ? "w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-800 font-medium text-lg bg-white shadow-sm" 
                      : "w-full px-4 py-3 border-2 border-slate-200 rounded-lg transition-all text-slate-800 font-medium text-lg bg-slate-100 shadow-sm cursor-not-allowed"
                  }
                />
                <p className="mt-2 text-sm text-slate-500">
                  This title will be used when saving your BOQ.
                </p>
                {/* Autosave indicator */}
                {lastAutoSave && (
                  <div className="mt-2 flex items-center space-x-2 text-sm text-green-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>
                      Auto-saved at {lastAutoSave.toLocaleTimeString('id-ID', { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col">
              {/* Main Table Area */}
              <div className="p-8 pb-8">
                {/* Table View */}
                <div className="bg-white border border-slate-200 rounded-t-xl shadow-sm">
                  <div className="w-full">
                    <table className="w-full table-fixed">
                      <thead className="bg-gradient-to-r from-slate-100 to-slate-200 sticky top-0 z-10">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-bold text-slate-700 border-r border-slate-300" style={{width: '18%'}}>
                            Tahapan Kerja
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-bold text-slate-700 border-r border-slate-300" style={{width: '18%'}}>
                            Jenis Pekerjaan
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-bold text-slate-700 border-r border-slate-300" style={{width: '18%'}}>
                            Uraian
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-bold text-slate-700 border-r border-slate-300" style={{width: '16%'}}>
                            Spesifikasi
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-bold text-slate-700 border-r border-slate-300" style={{width: '8%'}}>
                            Volume
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-bold text-slate-700 border-r border-slate-300" style={{width: '8%'}}>
                            Satuan
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-bold text-slate-700 border-r border-slate-300" style={{width: '14%'}}>
                            Harga Satuan
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-bold text-slate-700" style={{width: '16%'}}>
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                      {tahapanKerja.map((tahapan, tahapanIndex) => {
                        // Create rows for each specification or empty rows for each level
                        const rows = [];
                        const isLastTahapan = tahapanIndex === tahapanKerja.length - 1;
                        
                        if (tahapan.jenisKerja.length === 0) {
                          // Empty tahapan row - show tahapan but allow adding jenis
                          rows.push({
                            key: `tahapan-${tahapan.id}`,
                            tahapanId: tahapan.id,
                            tahapanName: tahapan.name,
                            tahapanIndex,
                            isLastTahapan,
                            type: 'tahapan-empty'
                          });
                        } else {
                          tahapan.jenisKerja.forEach((jenis, jenisIndex) => {
                            const isLastJenis = jenisIndex === tahapan.jenisKerja.length - 1;
                            
                            if (jenis.uraian.length === 0) {
                              // Empty jenis row - show tahapan + jenis but allow adding uraian
                              rows.push({
                                key: `jenis-${jenis.id}`,
                                tahapanId: tahapan.id,
                                tahapanName: tahapan.name,
                                tahapanIndex,
                                jenisId: jenis.id,
                                jenisName: jenis.name,
                                jenisIndex,
                                isLastTahapan,
                                isLastJenis,
                                type: 'jenis-empty'
                              });
                            } else {
                              jenis.uraian.forEach((uraian, uraianIndex) => {
                                const isLastUraian = uraianIndex === jenis.uraian.length - 1;
                                
                                // Always show uraian row with inline spec data
                                rows.push({
                                  key: `uraian-${uraian.id}`,
                                  tahapanId: tahapan.id,
                                  tahapanName: tahapan.name,
                                  tahapanIndex,
                                  jenisId: jenis.id,
                                  jenisName: jenis.name,
                                  jenisIndex,
                                  uraianId: uraian.id,
                                  uraianName: uraian.name,
                                  uraianIndex,
                                  spec: uraian.spec.length > 0 ? uraian.spec[0] : null, // Use first (and only) spec
                                  specId: uraian.spec.length > 0 ? uraian.spec[0].id : null,
                                  isLastTahapan,
                                  isLastJenis,
                                  isLastUraian,
                                  type: 'uraian-with-spec'
                                });
                              });
                            }
                          });
                        }

                        return rows.map((row, rowIndex) => {
                          // Check if this is the first row for this jenis
                          const isFirstJenisRow = rows.findIndex(r => r.jenisId === row.jenisId) === rowIndex;
                          // Check if this is the first row for this uraian
                          const isFirstUraianRow = rows.findIndex(r => r.uraianId === row.uraianId) === rowIndex;
                          // Check if this is the first row for this tahapan
                          const isFirstTahapanRow = rows.findIndex(r => r.tahapanId === row.tahapanId) === rowIndex;
                          
                          // Calculate rowspan for tahapan (how many rows belong to this tahapan)
                          const tahapanRowSpan = rows.filter(r => r.tahapanId === row.tahapanId).length;
                          // Calculate rowspan for jenis (how many rows belong to this jenis)
                          const jenisRowSpan = rows.filter(r => r.jenisId === row.jenisId && r.jenisId).length;

                          return (
                          <tr 
                            key={row.key} 
                            className={`border-b border-slate-200 hover:bg-slate-50 ${rowIndex % 2 === 0 ? 'bg-white' : 'bg-slate-25'}`}
                          >
                            {/* Regular table content */}
                            {/* Tahapan Kerja - Show only on first row of each tahapan, with rowspan */}
                            {isFirstTahapanRow && (
                              <td 
                                className={`px-4 py-3 border-r border-slate-200 align-middle ${row.isLastTahapan ? 'group' : ''}`}
                                rowSpan={tahapanRowSpan}
                              >
                                <div className="space-y-2">
                                  <div className="flex items-center space-x-2">
                                    <div className="text-blue-600 font-bold text-lg min-w-[24px]">
                                      {row.tahapanIndex + 1}.
                                    </div>
                                    <input
                                      type="text"
                                      placeholder="Tahapan Kerja"
                                      value={row.tahapanName}
                                      onChange={(e) => updateTahapanKerja(row.tahapanId, e.target.value)}
                                      disabled={!editMode}
                                      className={
                                        editMode 
                                          ? "flex-1 px-2 py-1 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-800 bg-white text-sm" 
                                          : "flex-1 px-2 py-1 border border-slate-200 rounded transition-all text-slate-800 bg-slate-50 cursor-not-allowed text-sm"
                                      }
                                    />
                                    {/* Delete Tahapan button - show on hover */}
                                    {editMode && tahapanKerja.length > 1 && (
                                      <button
                                        onClick={() => deleteTahapanKerja(row.tahapanId)}
                                        className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-all duration-200"
                                        title="Delete Tahapan Kerja"
                                      >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                      </button>
                                    )}
                                  </div>
                                  {/* Add Tahapan Kerja button - only show on last tahapan when hovering */}
                                  {editMode && row.isLastTahapan && (
                                    <div className="flex justify-start pl-10">
                                      <button
                                        onClick={addTahapanKerja}
                                        className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center space-x-1 transition-all duration-200 opacity-0 group-hover:opacity-100"
                                        title="Tambah Tahapan Kerja"
                                      >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        <span className="text-xs">Tambah Tahapan Kerja</span>
                                      </button>
                                    </div>
                                  )}
                                  {/* Add Jenis Pekerjaan button for empty tahapan */}
                                  {editMode && row.type === 'tahapan-empty' && (
                                    <div className="flex justify-start pl-10">
                                      <button
                                        onClick={() => addJenisKerja(row.tahapanId)}
                                        className="text-indigo-600 hover:text-indigo-700 font-medium text-sm flex items-center space-x-1 transition-all duration-200"
                                        title="Tambah Jenis Pekerjaan"
                                      >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        <span className="text-xs">Tambah Jenis Pekerjaan</span>
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </td>
                            )}

                            {/* Jenis Pekerjaan - Show only on first row of each jenis, with rowspan */}
                            {row.jenisId && isFirstJenisRow ? (
                              <td 
                                className={`px-4 py-3 border-r border-slate-200 align-middle ${row.isLastJenis ? 'group' : ''}`}
                                rowSpan={jenisRowSpan}
                              >
                                <div className="space-y-2">
                                  <div className="flex items-center space-x-2">
                                    <div className="text-indigo-600 font-bold text-base min-w-[20px]">
                                      {row.jenisIndex + 1}.
                                    </div>
                                    <input
                                      type="text"
                                      placeholder="Jenis Pekerjaan"
                                      value={row.jenisName}
                                      onChange={(e) => updateJenisKerja(row.tahapanId, row.jenisId, e.target.value)}
                                      disabled={!editMode}
                                      className={
                                        editMode 
                                          ? "flex-1 px-2 py-1 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-800 bg-white text-sm" 
                                          : "flex-1 px-2 py-1 border border-slate-200 rounded transition-all text-slate-800 bg-slate-50 cursor-not-allowed text-sm"
                                      }
                                    />
                                    {/* Delete Jenis button - show on hover */}
                                    {editMode && (
                                      <button
                                        onClick={() => deleteJenisKerja(row.tahapanId, row.jenisId)}
                                        className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-all duration-200"
                                        title="Delete Jenis Pekerjaan"
                                      >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                      </button>
                                    )}
                                  </div>
                                  {/* Add Jenis Pekerjaan button - only show on last jenis when hovering */}
                                  {editMode && row.isLastJenis && (
                                    <div className="flex justify-start pl-6">
                                      <button
                                        onClick={() => addJenisKerja(row.tahapanId)}
                                        className="text-indigo-600 hover:text-indigo-700 font-medium text-sm flex items-center space-x-1 transition-all duration-200 opacity-0 group-hover:opacity-100"
                                        title="Tambah Jenis Pekerjaan"
                                      >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        <span className="text-xs">Tambah Jenis Pekerjaan</span>
                                      </button>
                                    </div>
                                  )}
                                  {/* Add Uraian button for empty jenis */}
                                  {editMode && row.type === 'jenis-empty' && (
                                    <div className="flex justify-start pl-6">
                                      <button
                                        onClick={() => addUraian(row.tahapanId, row.jenisId)}
                                        className="text-purple-600 hover:text-purple-700 font-medium text-sm flex items-center space-x-1 transition-all duration-200"
                                        title="Tambah Uraian"
                                      >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        <span className="text-xs">Tambah Uraian</span>
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </td>
                            ) : !row.jenisId ? (
                              <td className="px-4 py-3 border-r border-slate-200">
                                {/* Empty cell for tahapan without jenis */}
                              </td>
                            ) : null}

                            {/* Uraian */}
                            <td className="px-4 py-3 border-r border-slate-200 align-middle">
                              {row.uraianId && (row.type.includes('uraian') || isFirstUraianRow) ? (
                                <div className={`space-y-2 ${row.isLastUraian ? 'group' : ''}`}>
                                  <div className="flex items-center space-x-2">
                                    <div className="text-purple-600 font-bold text-sm min-w-[16px]">
                                      {row.uraianIndex + 1}.
                                    </div>
                                    <input
                                      type="text"
                                      placeholder="Uraian"
                                      value={row.uraianName}
                                      onChange={(e) => updateUraian(row.tahapanId, row.jenisId, row.uraianId, e.target.value)}
                                      disabled={!editMode}
                                      className={
                                        editMode 
                                          ? "flex-1 px-2 py-1 border border-slate-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-slate-800 bg-white text-sm" 
                                          : "flex-1 px-2 py-1 border border-slate-200 rounded transition-all text-slate-800 bg-slate-50 cursor-not-allowed text-sm"
                                      }
                                    />
                                    {/* Delete Uraian button - show on hover */}
                                    {editMode && (
                                      <button
                                        onClick={() => deleteUraian(row.tahapanId, row.jenisId, row.uraianId)}
                                        className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-all duration-200"
                                        title="Delete Uraian"
                                      >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                      </button>
                                    )}
                                  </div>
                                  {/* Add Uraian button - only show on last uraian when hovering */}
                                  {editMode && row.isLastUraian && (
                                    <div className="flex justify-start pl-5">
                                      <button
                                        onClick={() => addUraian(row.tahapanId, row.jenisId)}
                                        className="text-purple-600 hover:text-purple-700 font-medium text-sm flex items-center space-x-1 transition-all duration-200 opacity-0 group-hover:opacity-100"
                                        title="Tambah Uraian"
                                      >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        <span className="text-xs">Tambah Uraian</span>
                                      </button>
                                    </div>
                                  )}
                                </div>
                              ) : row.uraianId ? (
                                <div className="text-slate-400 text-sm text-center">↳</div>
                              ) : (
                                <div></div>
                              )}
                            </td>

                            {/* Spesifikasi */}
                            <td className="px-4 py-3 border-r border-slate-200 align-middle">
                              {row.spec ? (
                                <input
                                  type="text"
                                  placeholder="Spesifikasi"
                                  value={row.spec.description}
                                  onChange={(e) => updateSpec(row.tahapanId, row.jenisId, row.uraianId, row.specId, 'description', e.target.value)}
                                  disabled={!editMode}
                                  className={
                                    editMode 
                                      ? "w-full px-2 py-1 border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-slate-800 bg-white text-sm" 
                                      : "w-full px-2 py-1 border border-slate-200 rounded transition-all text-slate-800 bg-slate-50 cursor-not-allowed text-sm"
                                  }
                                />
                              ) : (
                                <div className="w-full h-8"></div>
                              )}
                            </td>

                            {/* Volume */}
                            <td className="px-4 py-3 border-r border-slate-200 align-middle">
                              {row.spec ? (
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  placeholder="0"
                                  value={row.spec.volume === null || row.spec.volume === undefined ? '' : row.spec.volume}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                      updateSpec(row.tahapanId, row.jenisId, row.uraianId, row.specId, 'volume', value === '' ? null : parseFloat(value) || 0);
                                    }
                                  }}
                                  onKeyPress={(e) => {
                                    if (!/[\d.]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab' && e.key !== 'Enter') {
                                      e.preventDefault();
                                    }
                                  }}
                                  disabled={!editMode}
                                  className={
                                    editMode 
                                      ? `w-full px-2 py-1 border ${row.spec.volume === null || row.spec.volume === undefined ? 'border-red-300' : 'border-slate-300'} rounded focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-slate-800 bg-white text-sm` 
                                      : "w-full px-2 py-1 border border-slate-200 rounded transition-all text-slate-800 bg-slate-50 cursor-not-allowed text-sm"
                                  }
                                />
                              ) : (
                                <div className="w-full h-8"></div>
                              )}
                            </td>

                            {/* Satuan */}
                            <td className="px-4 py-3 border-r border-slate-200 align-middle">
                              {row.spec ? (
                                <input
                                  type="text"
                                  placeholder="Unit"
                                  value={row.spec.satuan}
                                  onChange={(e) => updateSpec(row.tahapanId, row.jenisId, row.uraianId, row.specId, 'satuan', e.target.value)}
                                  disabled={!editMode}
                                  className={
                                    editMode 
                                      ? "w-full px-2 py-1 border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-slate-800 bg-white text-sm" 
                                      : "w-full px-2 py-1 border border-slate-200 rounded transition-all text-slate-800 bg-slate-50 cursor-not-allowed text-sm"
                                  }
                                />
                              ) : (
                                <div className="w-full h-8"></div>
                              )}
                            </td>

                            {/* Harga per Pcs */}
                            <td className="px-4 py-3 border-r border-slate-200 align-middle">
                              {row.spec ? (
                                <input
                                  type="number"
                                  min="0"
                                  placeholder="0"
                                  value={row.spec.pricePerPcs === null || row.spec.pricePerPcs === undefined ? '' : row.spec.pricePerPcs}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                      updateSpec(row.tahapanId, row.jenisId, row.uraianId, row.specId, 'pricePerPcs', value === '' ? null : parseFloat(value) || 0);
                                    }
                                  }}
                                  onKeyPress={(e) => {
                                    if (!/[\d.]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab' && e.key !== 'Enter') {
                                      e.preventDefault();
                                    }
                                  }}
                                  disabled={!editMode}
                                  className={
                                    editMode 
                                      ? `w-full px-2 py-1 border ${row.spec.pricePerPcs === null || row.spec.pricePerPcs === undefined ? 'border-red-300' : 'border-slate-300'} rounded focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-slate-800 bg-white text-sm` 
                                      : "w-full px-2 py-1 border border-slate-200 rounded transition-all text-slate-800 bg-slate-50 cursor-not-allowed text-sm"
                                  }
                                />
                              ) : (
                                <div className="w-full h-8"></div>
                              )}
                            </td>

                            {/* Total */}
                            <td className="px-4 py-3 align-middle">
                              {row.spec ? (
                                <div className="px-2 py-1 text-slate-800 font-medium text-sm text-center">
                                  Rp {calculateSpecTotal(row.spec).toLocaleString('id-ID')}
                                </div>
                              ) : (
                                <div className="w-full h-8"></div>
                              )}
                            </td>
                          </tr>
                          );
                        });
                      })}
                      
                      {/* Summary rows inside table */}
                      <tr className="border-t-2 border-slate-300 bg-white">
                        <td colSpan="7" className="px-4 py-3 text-right font-medium text-slate-700">
                          Subtotal:
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-800">
                          Rp {calculateGrandTotal().toLocaleString('id-ID')}
                        </td>
                      </tr>
                      <tr className="bg-white">
                        <td colSpan="7" className="px-4 py-3 text-right font-medium text-slate-700">
                          PPN (11%):
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-700">
                          Rp {(calculateGrandTotal() * 0.11).toLocaleString('id-ID')}
                        </td>
                      </tr>
                      <tr className="border-t border-slate-300 bg-white">
                        <td colSpan="7" className="px-4 py-4 text-right font-bold text-slate-800 text-lg">
                          Total:
                        </td>
                        <td className="px-4 py-4 font-bold text-slate-900 text-lg">
                          Rp {(calculateGrandTotal() * 1.11).toLocaleString('id-ID')}
                        </td>
                      </tr>
                    </tbody>                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Autosave Notification */}
        {showAutosaveNotification && (
          <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium">Draft restored from autosave</span>
            <button
              onClick={() => setShowAutosaveNotification(false)}
              className="ml-2 text-green-200 hover:text-white"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        
        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 border border-slate-200">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-3">BOQ Saved Successfully!</h3>
                <p className="text-slate-600 mb-8 leading-relaxed">Your Bill of Quantities has been saved. Ready to take the next step in your project journey?</p>
                
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setShowSuccessModal(false);
                      router.push('/dashboard/project-owner');
                    }}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold text-lg transform hover:-translate-y-0.5"
                  >
                    Go to Project Owner Dashboard
                  </button>
                  <button
                    onClick={() => {
                      setShowSuccessModal(false);
                      router.push('/dashboard/vendor');
                    }}
                    className="w-full border-2 border-slate-300 text-slate-700 px-6 py-4 rounded-xl hover:border-blue-500 hover:text-blue-600 transition-all duration-200 font-semibold text-lg transform hover:-translate-y-0.5"
                  >
                    Browse as Vendor
                  </button>
                  <button
                    onClick={() => setShowSuccessModal(false)}
                    className="w-full text-slate-500 hover:text-slate-700 px-6 py-3 rounded-xl transition-all duration-200 font-medium"
                  >
                    Continue Editing BOQ
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
