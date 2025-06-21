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
      jenisKerja: []
    }
  ]);
  const [savedBOQs, setSavedBOQs] = useState([]);
  const [editMode, setEditMode] = useState(true);

  useEffect(() => {
    const savedData = localStorage.getItem('projevo_boqs');
    if (savedData) {
      setSavedBOQs(JSON.parse(savedData));
    }
  }, []);

  const addTahapanKerja = () => {
    setTahapanKerja([
      ...tahapanKerja,
      {
        id: Date.now(),
        name: '',
        jenisKerja: []
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

    if (specId) {
      // If we have a specId, delete just this spec
      deleteSpec(tahapanId, jenisId, uraianId, specId);
    } else if (uraianId) {
      // If we have uraianId, delete this uraian
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

  const addJenisKerja = (tahapanId) => {
    setTahapanKerja(tahapanKerja.map(tahapan => 
      tahapan.id === tahapanId 
        ? { 
            ...tahapan, 
            jenisKerja: [...tahapan.jenisKerja, { id: Date.now(), name: '', uraian: [] }] 
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
                    uraian: [...jenis.uraian, { id: Date.now(), name: '', spec: [] }] 
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
                            spec: [...uraian.spec, { 
                              id: Date.now(), 
                              description: '', 
                              satuan: '', 
                              volume: 0, 
                              pricePerPcs: 0 
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
    return spec.volume * spec.pricePerPcs;
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
    setTahapanKerja([{ id: 1, name: '', jenisKerja: [] }]);
    setCurrentBOQId(null);
    setEditMode(true);
    setCurrentView('editor');
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
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
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
              </div>
            </div>

            <div className="flex h-[calc(100vh-200px)] flex-col">
              {/* Main Table Area */}
              <div className="flex-1 p-8 pb-0 overflow-hidden">
                {/* Table View */}
                <div className="bg-white border border-slate-200 rounded-t-xl overflow-hidden shadow-sm h-full flex flex-col">
                  <div className="flex-1 overflow-auto">
                    <table className="w-full min-w-full">
                      <thead className="bg-gradient-to-r from-slate-100 to-slate-200 sticky top-0 z-10">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-bold text-slate-700 border-r border-slate-300 min-w-[200px]">
                            Tahapan Kerja
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-bold text-slate-700 border-r border-slate-300 min-w-[200px]">
                            Jenis Pekerjaan
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-bold text-slate-700 border-r border-slate-300 min-w-[200px]">
                            Uraian
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-bold text-slate-700 border-r border-slate-300 min-w-[250px]">
                            Spesifikasi
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-bold text-slate-700 border-r border-slate-300 min-w-[100px]">
                            Volume
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-bold text-slate-700 border-r border-slate-300 min-w-[100px]">
                            Satuan
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-bold text-slate-700 border-r border-slate-300 min-w-[150px]">
                            Harga per Pcs
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-bold text-slate-700 border-r border-slate-300 min-w-[150px]">
                            Total
                          </th>
                          {editMode && (
                            <th className="px-4 py-3 text-center text-sm font-bold text-slate-700 min-w-[120px]">
                              Actions
                            </th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                      {tahapanKerja.map((tahapan, tahapanIndex) => {
                        // Create rows for each specification or empty rows for each level
                        const rows = [];
                        
                        if (tahapan.jenisKerja.length === 0) {
                          // Empty tahapan row - show tahapan but allow adding jenis or direct uraian
                          rows.push({
                            key: `tahapan-${tahapan.id}`,
                            tahapanId: tahapan.id,
                            tahapanName: tahapan.name,
                            tahapanIndex,
                            type: 'tahapan-empty',
                            canAddJenis: true,
                            canAddUraian: true
                          });
                        } else {
                          tahapan.jenisKerja.forEach((jenis, jenisIndex) => {
                            if (jenis.uraian.length === 0) {
                              // Empty jenis row - show tahapan + jenis but allow adding uraian or direct spec
                              rows.push({
                                key: `jenis-${jenis.id}`,
                                tahapanId: tahapan.id,
                                tahapanName: tahapan.name,
                                tahapanIndex,
                                jenisId: jenis.id,
                                jenisName: jenis.name,
                                jenisIndex,
                                type: 'jenis-empty',
                                canAddUraian: true,
                                canAddSpec: true
                              });
                            } else {
                              jenis.uraian.forEach((uraian, uraianIndex) => {
                                if (uraian.spec.length === 0) {
                                  // Empty uraian row - show tahapan + jenis + uraian but allow adding spec
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
                                    type: 'uraian-empty',
                                    canAddSpec: true
                                  });
                                } else {
                                  uraian.spec.forEach((spec, specIndex) => {
                                    rows.push({
                                      key: `spec-${spec.id}`,
                                      tahapanId: tahapan.id,
                                      tahapanName: tahapan.name,
                                      tahapanIndex,
                                      jenisId: jenis.id,
                                      jenisName: jenis.name,
                                      jenisIndex,
                                      uraianId: uraian.id,
                                      uraianName: uraian.name,
                                      uraianIndex,
                                      specId: spec.id,
                                      spec: spec,
                                      specIndex,
                                      type: 'spec'
                                    });
                                  });
                                }
                              });
                              
                              // Add a special row at the end of each jenis to allow adding more uraian
                              rows.push({
                                key: `add-uraian-${jenis.id}`,
                                tahapanId: tahapan.id,
                                tahapanName: tahapan.name,
                                tahapanIndex,
                                jenisId: jenis.id,
                                jenisName: jenis.name,
                                jenisIndex,
                                type: 'add-uraian-row',
                                canAddUraian: true
                              });
                            }
                          });
                          
                          // Add a special row at the end of each tahapan to allow adding more jenis
                          rows.push({
                            key: `add-jenis-${tahapan.id}`,
                            tahapanId: tahapan.id,
                            tahapanName: tahapan.name,
                            tahapanIndex,
                            type: 'add-jenis-row',
                            canAddJenis: true
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
                          <tr key={row.key} className={`border-b border-slate-200 hover:bg-slate-50 ${rowIndex % 2 === 0 ? 'bg-white' : 'bg-slate-25'}`}>
                            {/* Tahapan Kerja - Show only on first row of each tahapan, with rowspan */}
                            {isFirstTahapanRow && (
                              <td 
                                className="px-4 py-3 border-r border-slate-200 align-middle"
                                rowSpan={tahapanRowSpan}
                              >
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
                                </div>
                              </td>
                            )}

                            {/* Jenis Pekerjaan - Show only on first row of each jenis, with rowspan */}
                            {row.jenisId && isFirstJenisRow ? (
                              <td 
                                className="px-4 py-3 border-r border-slate-200 align-middle"
                                rowSpan={jenisRowSpan}
                              >
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
                                </div>
                              </td>
                            ) : !row.jenisId ? (
                              <td className="px-4 py-3 border-r border-slate-200">
                                {editMode && (row.type === 'tahapan-empty' || row.type === 'add-jenis-row') ? (
                                  <button
                                    onClick={() => addJenisKerja(row.tahapanId)}
                                    className="text-blue-600 hover:text-blue-700 text-sm underline"
                                  >
                                    + Add Jenis
                                  </button>
                                ) : null}
                              </td>
                            ) : null}

                            {/* Uraian */}
                            <td className="px-4 py-3 border-r border-slate-200">
                              {row.uraianId && (row.type.includes('uraian') || isFirstUraianRow) ? (
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
                                </div>
                              ) : row.uraianId ? (
                                <div className="text-slate-400 text-sm">↳</div>
                              ) : editMode ? (
                                <div className="flex flex-col space-y-1">
                                  {(row.jenisId || row.canAddUraian) && (
                                    <button
                                      onClick={() => row.jenisId ? addUraian(row.tahapanId, row.jenisId) : addJenisKerja(row.tahapanId)}
                                      className="text-purple-600 hover:text-purple-700 text-sm underline text-left"
                                    >
                                      {row.jenisId ? '+ Add Uraian' : '+ Add Uraian (via Jenis)'}
                                    </button>
                                  )}
                                  {row.canAddUraian && !row.jenisId && (
                                    <button
                                      onClick={() => {
                                        // Add a default jenis first, then add uraian to it
                                        addJenisKerja(row.tahapanId);
                                        setTimeout(() => {
                                          const updatedTahapan = tahapanKerja.find(t => t.id === row.tahapanId);
                                          if (updatedTahapan && updatedTahapan.jenisKerja.length > 0) {
                                            const lastJenis = updatedTahapan.jenisKerja[updatedTahapan.jenisKerja.length - 1];
                                            addUraian(row.tahapanId, lastJenis.id);
                                          }
                                        }, 100);
                                      }}
                                      className="text-green-600 hover:text-green-700 text-sm underline text-left"
                                    >
                                      + Quick Add Uraian
                                    </button>
                                  )}
                                </div>
                              ) : null}
                            </td>

                            {/* Spesifikasi */}
                            <td className="px-4 py-3 border-r border-slate-200">
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
                              ) : editMode ? (
                                <div className="flex flex-col space-y-1">
                                  {row.uraianId && (
                                    <button
                                      onClick={() => addSpec(row.tahapanId, row.jenisId, row.uraianId)}
                                      className="text-emerald-600 hover:text-emerald-700 text-sm underline text-left"
                                    >
                                      + Add Spec
                                    </button>
                                  )}
                                  {row.canAddSpec && !row.uraianId && row.jenisId && (
                                    <button
                                      onClick={() => {
                                        // Add a default uraian first, then add spec to it
                                        addUraian(row.tahapanId, row.jenisId);
                                        setTimeout(() => {
                                          const updatedTahapan = tahapanKerja.find(t => t.id === row.tahapanId);
                                          const updatedJenis = updatedTahapan?.jenisKerja.find(j => j.id === row.jenisId);
                                          if (updatedJenis && updatedJenis.uraian.length > 0) {
                                            const lastUraian = updatedJenis.uraian[updatedJenis.uraian.length - 1];
                                            addSpec(row.tahapanId, row.jenisId, lastUraian.id);
                                          }
                                        }, 100);
                                      }}
                                      className="text-green-600 hover:text-green-700 text-sm underline text-left"
                                    >
                                      + Quick Add Spec
                                    </button>
                                  )}
                                  {!row.jenisId && !row.uraianId && (
                                    <button
                                      onClick={() => {
                                        // Add jenis -> uraian -> spec in sequence
                                        addJenisKerja(row.tahapanId);
                                        setTimeout(() => {
                                          const updatedTahapan = tahapanKerja.find(t => t.id === row.tahapanId);
                                          if (updatedTahapan && updatedTahapan.jenisKerja.length > 0) {
                                            const lastJenis = updatedTahapan.jenisKerja[updatedTahapan.jenisKerja.length - 1];
                                            addUraian(row.tahapanId, lastJenis.id);
                                            setTimeout(() => {
                                              const updatedJenis = updatedTahapan.jenisKerja.find(j => j.id === lastJenis.id);
                                              if (updatedJenis && updatedJenis.uraian.length > 0) {
                                                const lastUraian = updatedJenis.uraian[updatedJenis.uraian.length - 1];
                                                addSpec(row.tahapanId, lastJenis.id, lastUraian.id);
                                              }
                                            }, 100);
                                          }
                                        }, 100);
                                      }}
                                      className="text-blue-600 hover:text-blue-700 text-sm underline text-left"
                                    >
                                      + Quick Add Full Item
                                    </button>
                                  )}
                                </div>
                              ) : null}
                            </td>

                            {/* Volume */}
                            <td className="px-4 py-3 border-r border-slate-200">
                              {row.spec ? (
                                <input
                                  type="number"
                                  step="0.01"
                                  value={row.spec.volume}
                                  onChange={(e) => updateSpec(row.tahapanId, row.jenisId, row.uraianId, row.specId, 'volume', parseFloat(e.target.value) || 0)}
                                  disabled={!editMode}
                                  className={
                                    editMode 
                                      ? "w-full px-2 py-1 border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-slate-800 bg-white text-sm" 
                                      : "w-full px-2 py-1 border border-slate-200 rounded transition-all text-slate-800 bg-slate-50 cursor-not-allowed text-sm"
                                  }
                                />
                              ) : null}
                            </td>

                            {/* Satuan */}
                            <td className="px-4 py-3 border-r border-slate-200">
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
                              ) : null}
                            </td>

                            {/* Harga per Pcs */}
                            <td className="px-4 py-3 border-r border-slate-200">
                              {row.spec ? (
                                <input
                                  type="number"
                                  value={row.spec.pricePerPcs}
                                  onChange={(e) => updateSpec(row.tahapanId, row.jenisId, row.uraianId, row.specId, 'pricePerPcs', parseFloat(e.target.value) || 0)}
                                  disabled={!editMode}
                                  className={
                                    editMode 
                                      ? "w-full px-2 py-1 border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-slate-800 bg-white text-sm" 
                                      : "w-full px-2 py-1 border border-slate-200 rounded transition-all text-slate-800 bg-slate-50 cursor-not-allowed text-sm"
                                  }
                                />
                              ) : null}
                            </td>

                            {/* Total */}
                            <td className="px-4 py-3 border-r border-slate-200">
                              {row.spec ? (
                                <div className="px-2 py-1 text-slate-800 font-medium text-sm">
                                  Rp {calculateSpecTotal(row.spec).toLocaleString('id-ID')}
                                </div>
                              ) : null}
                            </td>

                            {/* Actions */}
                            {editMode && (
                              <td className="px-4 py-3 text-center">
                                <div className="flex justify-center">
                                  {/* Smart Delete Button - shows appropriate tooltip based on what will be deleted */}
                                  {(isFirstTahapanRow || row.jenisId || row.uraianId || row.specId) && (
                                    <button
                                      onClick={() => smartDelete(row.tahapanId, row.jenisId, row.uraianId, row.specId)}
                                      className="bg-white text-red-500 hover:bg-red-50 w-8 h-8 rounded flex items-center justify-center text-xl font-bold transition-all duration-200"
                                      title={
                                        row.specId ? "Delete Spec" :
                                        row.uraianId ? "Delete Uraian" :
                                        row.jenisId ? 
                                          (tahapanKerja.find(t => t.id === row.tahapanId)?.jenisKerja.find(j => j.id === row.jenisId)?.uraian.length > 0 ? 
                                            "Delete All Uraian" : "Delete Jenis") :
                                        (isFirstTahapanRow && tahapanKerja.length > 1) ? "Delete Tahapan" : ""
                                      }
                                    >
                                      ×
                                    </button>
                                  )}
                                </div>
                              </td>
                            )}
                          </tr>
                          );
                        });
                      })}
                      
                      {/* Add Tahapan Kerja row */}
                      {editMode && (
                        <tr className="border-b border-slate-200 hover:bg-blue-50">
                          <td colSpan={editMode ? 9 : 8} className="px-4 py-4 text-center">
                            <button
                              onClick={addTahapanKerja}
                              className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center justify-center space-x-2 mx-auto transition-colors duration-200"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                              <span>Tambah Tahapan Kerja</span>
                            </button>
                          </td>
                        </tr>
                      )}
                    </tbody>                    </table>
                  </div>
                </div>
              </div>
              
              {/* Summary Section - Full Width */}
              <div className="px-8 py-6 bg-gradient-to-r from-slate-100 to-slate-200 border-t-2 border-slate-300">
                <div className="bg-white border-2 border-slate-300 rounded-xl p-6 shadow-lg">
                  <h3 className="text-xl font-bold text-slate-800 mb-4">Summary</h3>
                  <div className="space-y-2 text-lg">
                    <div className="flex justify-between">
                      <span className="font-medium text-slate-700">Subtotal:</span>
                      <span className="font-bold text-slate-800">Rp {calculateGrandTotal().toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-slate-700">PPN (11%):</span>
                      <span className="font-bold text-slate-800">Rp {(calculateGrandTotal() * 0.11).toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between border-t-2 border-slate-400 pt-2">
                      <span className="font-bold text-slate-900 text-xl">Total:</span>
                      <span className="font-bold text-slate-900 text-xl">Rp {(calculateGrandTotal() * 1.11).toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
