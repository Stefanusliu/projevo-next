'use client';

import { useState } from 'react';

export default function BOQMaker() {
  const [tahapanKerja, setTahapanKerja] = useState([
    {
      id: 1,
      name: '',
      jenisKerja: []
    }
  ]);

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

  const deleteTahapanKerja = (id) => {
    setTahapanKerja(tahapanKerja.filter(tahapan => tahapan.id !== id));
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
                uraian: []
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
                        specs: []
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
                            specs: [
                              ...uraian.specs,
                              {
                                id: Date.now(),
                                spesifikasi: '',
                                satuan: '',
                                volume: 0,
                                hargaSatuan: 0,
                                hargaTotal: 0
                              }
                            ]
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
                            specs: uraian.specs.map(spec => {
                              if (spec.id === specId) {
                                const updatedSpec = { ...spec, [field]: value };
                                if (field === 'volume' || field === 'hargaSatuan') {
                                  updatedSpec.hargaTotal = updatedSpec.volume * updatedSpec.hargaSatuan;
                                }
                                return updatedSpec;
                              }
                              return spec;
                            })
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
                            specs: uraian.specs.filter(spec => spec.id !== specId)
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

  const calculateSubtotal = () => {
    return tahapanKerja.reduce((total, tahapan) => {
      return total + tahapan.jenisKerja.reduce((jenisTotal, jenis) => {
        return jenisTotal + jenis.uraian.reduce((uraianTotal, uraian) => {
          return uraianTotal + uraian.specs.reduce((specTotal, spec) => {
            return specTotal + spec.hargaTotal;
          }, 0);
        }, 0);
      }, 0);
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const ppn = subtotal * 0.11;
  const grandTotal = subtotal + ppn;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const exportToCSV = () => {
    let csvContent = "Tahapan Kerja,Jenis Pekerjaan,Uraian Pekerjaan,Spesifikasi,Satuan,Volume,Harga Satuan,Harga Total\n";
    
    tahapanKerja.forEach(tahapan => {
      if (tahapan.jenisKerja.length === 0) {
        csvContent += `"${tahapan.name}",-,-,-,-,-,-,-\n`;
      } else {
        tahapan.jenisKerja.forEach(jenis => {
          if (jenis.uraian.length === 0) {
            csvContent += `"${tahapan.name}","${jenis.name}",-,-,-,-,-,-\n`;
          } else {
            jenis.uraian.forEach(uraian => {
              if (uraian.specs.length === 0) {
                csvContent += `"${tahapan.name}","${jenis.name}","${uraian.name}",-,-,-,-,-\n`;
              } else {
                uraian.specs.forEach(spec => {
                  csvContent += `"${tahapan.name}","${jenis.name}","${uraian.name}","${spec.spesifikasi}","${spec.satuan}",${spec.volume},${spec.hargaSatuan},${spec.hargaTotal}\n`;
                });
              }
            });
          }
        });
      }
    });

    csvContent += `\nSubtotal:,,,,,,,${subtotal}\n`;
    csvContent += `PPN 11%:,,,,,,,${ppn}\n`;
    csvContent += `Total:,,,,,,,${grandTotal}\n`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'BOQ.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">BOQ Maker</h1>
                <p className="text-blue-100">Create detailed Bill of Quantities with automatic calculations</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={exportToCSV}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 font-medium"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Export CSV</span>
                </button>
                <button
                  onClick={addTahapanKerja}
                  className="bg-white hover:bg-slate-50 text-blue-700 px-6 py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 font-medium border"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Tahapan Kerja</span>
                </button>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-8">
            {tahapanKerja.map((tahapan, tahapanIndex) => (
              <div key={tahapan.id} className="bg-gradient-to-r from-slate-50 to-slate-100 border-2 border-slate-200 rounded-xl mb-6 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                  <div className="flex items-center space-x-4 flex-1 w-full">
                    <div className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-lg flex-shrink-0">
                      {tahapanIndex + 1}
                    </div>
                    <input
                      type="text"
                      placeholder="Nama Tahapan Kerja"
                      value={tahapan.name}
                      onChange={(e) => updateTahapanKerja(tahapan.id, e.target.value)}
                      className="flex-1 px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-800 font-medium text-lg bg-white shadow-sm"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => addJenisKerja(tahapan.id)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span>Jenis Kerja</span>
                    </button>
                    <button
                      onClick={() => deleteTahapanKerja(tahapan.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span>Delete</span>
                    </button>
                  </div>
                </div>

                {tahapan.jenisKerja.map((jenis, jenisIndex) => (
                  <div key={jenis.id} className="ml-6 border-l-4 border-indigo-300 pl-6 mb-6 bg-white rounded-r-lg p-4 shadow-sm">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
                      <div className="flex items-center space-x-4 flex-1 w-full">
                        <div className="bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-md flex-shrink-0">
                          {tahapanIndex + 1}.{jenisIndex + 1}
                        </div>
                        <input
                          type="text"
                          placeholder="Nama Jenis Pekerjaan"
                          value={jenis.name}
                          onChange={(e) => updateJenisKerja(tahapan.id, jenis.id, e.target.value)}
                          className="flex-1 px-4 py-2 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-800 font-medium bg-slate-50"
                        />
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <button
                          onClick={() => addUraian(tahapan.id, jenis.id)}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg flex items-center justify-center space-x-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          <span>Uraian</span>
                        </button>
                        <button
                          onClick={() => deleteJenisKerja(tahapan.id, jenis.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg flex items-center justify-center"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {jenis.uraian.map((uraian, uraianIndex) => (
                      <div key={uraian.id} className="ml-4 border-l-4 border-purple-300 pl-4 mb-4 bg-slate-50 rounded-r-lg p-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
                          <div className="flex items-center space-x-4 flex-1 w-full">
                            <div className="bg-purple-600 text-white w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shadow-md flex-shrink-0">
                              {tahapanIndex + 1}.{jenisIndex + 1}.{uraianIndex + 1}
                            </div>
                            <input
                              type="text"
                              placeholder="Uraian Pekerjaan"
                              value={uraian.name}
                              onChange={(e) => updateUraian(tahapan.id, jenis.id, uraian.id, e.target.value)}
                              className="flex-1 px-3 py-2 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-slate-800 font-medium bg-white"
                            />
                          </div>
                          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                            <button
                              onClick={() => addSpec(tahapan.id, jenis.id, uraian.id)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg flex items-center justify-center space-x-1"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                              <span>Spec</span>
                            </button>
                            <button
                              onClick={() => deleteUraian(tahapan.id, jenis.id, uraian.id)}
                              className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg flex items-center justify-center"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>

                        {uraian.specs.length > 0 && (
                          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                            <div className="overflow-x-auto">
                              <table className="min-w-full">
                                <thead className="bg-gradient-to-r from-slate-100 to-slate-200">
                                  <tr>
                                    <th className="px-4 py-3 text-left text-sm font-bold text-slate-700 uppercase tracking-wider border-b border-slate-300">Spesifikasi</th>
                                    <th className="px-4 py-3 text-left text-sm font-bold text-slate-700 uppercase tracking-wider border-b border-slate-300">Satuan</th>
                                    <th className="px-4 py-3 text-left text-sm font-bold text-slate-700 uppercase tracking-wider border-b border-slate-300">Volume</th>
                                    <th className="px-4 py-3 text-left text-sm font-bold text-slate-700 uppercase tracking-wider border-b border-slate-300">Harga/Satuan</th>
                                    <th className="px-4 py-3 text-left text-sm font-bold text-slate-700 uppercase tracking-wider border-b border-slate-300">Total</th>
                                    <th className="px-4 py-3 text-left text-sm font-bold text-slate-700 uppercase tracking-wider border-b border-slate-300">Action</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                  {uraian.specs.map((spec, specIndex) => (
                                    <tr key={spec.id} className={`${specIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50'} hover:bg-blue-50 transition-colors`}>
                                      <td className="px-4 py-3">
                                        <input
                                          type="text"
                                          value={spec.spesifikasi}
                                          onChange={(e) => updateSpec(tahapan.id, jenis.id, uraian.id, spec.id, 'spesifikasi', e.target.value)}
                                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800"
                                          placeholder="Spesifikasi"
                                        />
                                      </td>
                                      <td className="px-4 py-3">
                                        <input
                                          type="text"
                                          value={spec.satuan}
                                          onChange={(e) => updateSpec(tahapan.id, jenis.id, uraian.id, spec.id, 'satuan', e.target.value)}
                                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800"
                                          placeholder="Satuan"
                                        />
                                      </td>
                                      <td className="px-4 py-3">
                                        <input
                                          type="number"
                                          value={spec.volume}
                                          onChange={(e) => updateSpec(tahapan.id, jenis.id, uraian.id, spec.id, 'volume', parseFloat(e.target.value) || 0)}
                                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800"
                                          placeholder="0"
                                        />
                                      </td>
                                      <td className="px-4 py-3">
                                        <input
                                          type="number"
                                          value={spec.hargaSatuan}
                                          onChange={(e) => updateSpec(tahapan.id, jenis.id, uraian.id, spec.id, 'hargaSatuan', parseFloat(e.target.value) || 0)}
                                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800"
                                          placeholder="0"
                                        />
                                      </td>
                                      <td className="px-4 py-3 text-sm font-bold text-emerald-700">
                                        {formatCurrency(spec.hargaTotal)}
                                      </td>
                                      <td className="px-4 py-3">
                                        <button
                                          onClick={() => deleteSpec(tahapan.id, jenis.id, uraian.id, spec.id)}
                                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-xs transition-all duration-200 shadow-md hover:shadow-lg"
                                        >
                                          Delete
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}

            {/* Summary Section */}
            <div className="border-t-4 border-blue-500 mt-8">
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-b-xl p-8">
                <div className="max-w-md ml-auto">
                  <h3 className="text-2xl font-bold mb-6 text-slate-800 flex items-center">
                    <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    Summary
                  </h3>
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-4 shadow-md border border-slate-200 flex justify-between items-center">
                      <span className="font-semibold text-slate-700 text-lg">Subtotal:</span>
                      <span className="font-bold text-xl text-slate-800">{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-md border border-slate-200 flex justify-between items-center">
                      <span className="font-semibold text-slate-700 text-lg">PPN 11%:</span>
                      <span className="font-bold text-xl text-orange-600">{formatCurrency(ppn)}</span>
                    </div>
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg p-6 shadow-lg border-2 border-blue-300 flex justify-between items-center">
                      <span className="font-bold text-white text-xl">Grand Total:</span>
                      <span className="font-bold text-2xl text-white">{formatCurrency(grandTotal)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
