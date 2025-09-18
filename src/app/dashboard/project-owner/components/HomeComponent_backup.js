import XenditPaymentModal from "../../../../components/payments/XenditPaymentModal";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../../contexts/AuthContext";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  addDoc,
  serverTimestamp,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../../../lib/firebase";
import {
  FiChevronDown,
  FiFilter,
  FiRefreshCw,
  FiFileText,
  FiExternalLink,
  FiLoader,
  FiPlus,
  FiEdit,
  FiClock,
  FiLock,
  FiMessageSquare,
  FiCreditCard,
  FiXCircle,
  FiTrash2,
  FiX,
  FiCheck,
} from "react-icons/fi";
import { MdSort, MdHome, MdFolder } from "react-icons/md";
import ProjectOwnerDetailModal from "./ProjectOwnerDetailModal";
import ModernTooltip from "../../../../components/ui/ModernTooltip";
import ProjectOwnerDetailPage from "./ProjectOwnerDetailPage";

// Create Project Modal Component
function CreateProjectModal({ onClose }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    // I. Informasi Umum Proyek
    projectTitle: "",
    province: "",
    city: "",
    fullAddress: "",

    // II. Klasifikasi & Ruang Lingkup Proyek
    projectType: "",
    procurementMethod: "",
    projectScope: [],
    propertyType: "",
    otherProperty: "",
    estimatedBudget: "",
    estimatedDuration: "",
    tenderDuration: "",
    estimatedStartDate: "",

    // Documents
    supportingDocuments: [], // For Desain projects
    boqDocuments: [], // For Bangun & Renovasi projects
    drawingDocuments: [], // For Bangun & Renovasi projects
    documentTitles: {},

    // BOQ Data from BOQ Maker
    selectedBOQ: null,
    boqData: null,

    // Special Notes
    specialNotes: "",

    // Agreements
    agreementTerms: false,
    agreementData: false,
    agreementValidation: false,
  });

  const [showBOQSelector, setShowBOQSelector] = useState(false);
  const [savedBOQs, setSavedBOQs] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Load saved BOQs from localStorage when component mounts
  useEffect(() => {
    const savedData = localStorage.getItem("projevo_boqs");
    if (savedData) {
      setSavedBOQs(JSON.parse(savedData));
    }
  }, []);

  const projectTypes = ["Desain", "Bangun", "Renovasi"];

  const procurementMethods = ["Penunjukan Langsung", "Tender"];

  const projectScopes = [
    "Interior",
    "Furniture",
    "Sipil",
    "Eksterior",
    "Taman & Hardscape",
  ];

  const propertyTypes = [
    "Rumah Tinggal",
    "Apartemen",
    "Ruko",
    "Kantor",
    "Gudang",
    "Restoran",
    "Sekolah",
    "Hotel / Penginapan",
    "Other",
  ];

  const provinces = [
    "DKI Jakarta",
    "Jawa Barat",
    "Jawa Tengah",
    "Jawa Timur",
    "Banten",
    "Sumatera Utara",
    "Sumatera Barat",
    "Sumatera Selatan",
    "Bali",
    "Other",
  ];

  const cities = {
    "DKI Jakarta": [
      "Jakarta Selatan",
      "Jakarta Pusat",
      "Jakarta Barat",
      "Jakarta Utara",
      "Jakarta Timur",
    ],
    "Jawa Barat": ["Bandung", "Bekasi", "Depok", "Bogor", "Tangerang"],
    "Jawa Tengah": ["Semarang", "Solo", "Yogyakarta", "Magelang"],
    "Jawa Timur": ["Surabaya", "Malang", "Kediri", "Blitar"],
    Banten: ["Tangerang", "Tangerang Selatan", "Serang", "Cilegon"],
    Other: ["Other"],
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Format number with thousand separators for display
  const formatNumberWithCommas = (num) => {
    if (!num) return "";
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Remove commas and return clean number
  const cleanNumber = (str) => {
    return str.replace(/,/g, "");
  };

  // Handle budget input with automatic formatting
  const handleBudgetChange = (value) => {
    // Remove any non-digit characters except commas
    const cleanValue = value.replace(/[^\d,]/g, "");
    // Remove existing commas to get pure number
    const numberOnly = cleanValue.replace(/,/g, "");

    // Update the form data with clean number
    setFormData((prev) => ({ ...prev, estimatedBudget: numberOnly }));
  };

  // Get formatted budget for display
  const getFormattedBudget = () => {
    return formatNumberWithCommas(formData.estimatedBudget);
  };

  const handleScopeToggle = (scope) => {
    setFormData((prev) => ({
      ...prev,
      projectScope: prev.projectScope.includes(scope)
        ? prev.projectScope.filter((s) => s !== scope)
        : [...prev.projectScope, scope],
    }));
  };

  const handleFileUpload = (event, documentType) => {
    const files = Array.from(event.target.files);
    setFormData((prev) => ({
      ...prev,
      [documentType]: [...prev[documentType], ...files],
    }));
  };

  const handleDocumentTitleChange = (fileName, title, documentType) => {
    setFormData((prev) => ({
      ...prev,
      documentTitles: {
        ...prev.documentTitles,
        [`${documentType}_${fileName}`]: title,
      },
    }));
  };

  const removeDocument = (fileName, documentType) => {
    setFormData((prev) => ({
      ...prev,
      [documentType]: prev[documentType].filter(
        (file) => file.name !== fileName
      ),
      documentTitles: Object.fromEntries(
        Object.entries(prev.documentTitles).filter(
          ([key]) => key !== `${documentType}_${fileName}`
        )
      ),
    }));
  };

  const selectBOQ = (boqId) => {
    const selectedBOQ = savedBOQs.find((boq) => boq.id === boqId);
    setFormData((prev) => ({
      ...prev,
      selectedBOQ: boqId,
      boqData: selectedBOQ,
    }));
    setShowBOQSelector(false);
  };

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user?.uid) {
      alert("Silakan login untuk membuat proyek");
      return;
    }

    // Validation for required fields
    if (
      !formData.agreementTerms ||
      !formData.agreementData ||
      !formData.agreementValidation
    ) {
      alert("Silakan setujui semua persetujuan yang diperlukan");
      return;
    }

    // Validate required fields
    if (
      !formData.projectTitle ||
      !formData.province ||
      !formData.city ||
      !formData.fullAddress ||
      !formData.projectType ||
      !formData.procurementMethod ||
      formData.projectScope.length === 0 ||
      !formData.propertyType ||
      !formData.estimatedBudget ||
      !formData.estimatedDuration ||
      !formData.tenderDuration ||
      !formData.estimatedStartDate
    ) {
      alert("Silakan lengkapi semua field yang wajib diisi (*)");
      return;
    }

    setLoading(true);
    try {
      // Generate custom project ID
      console.log(
        "About to generate custom project ID for project type:",
        formData.projectType
      );
      const customProjectId = await generateProjectId(formData.projectType);
      console.log("Generated custom project ID:", customProjectId);

      const projectData = {
        customId: customProjectId, // Add custom ID field
        ...formData,
        title: formData.projectTitle,
        ownerId: user.uid,
        ownerEmail: user.email,
        ownerName: user.displayName || user.email,
        status: "Menunggu Persetujuan",
        moderationStatus: "pending",
        progress: 0,
        isPublished: false,
        publishedAt: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        submittedAt: serverTimestamp(),
        team: [],
        milestones: [
          { name: "Perencanaan", completed: false, date: "" },
          { name: "Desain", completed: false, date: "" },
          { name: "Pembangunan", completed: false, date: "" },
          { name: "Review", completed: false, date: "" },
          { name: "Penyelesaian", completed: false, date: "" },
        ],
        marketplace: {
          category: formData.projectType,
          tags: formData.projectScope,
          budget: formData.estimatedBudget,
          duration: formData.estimatedDuration,
          location: {
            province: formData.province,
            city: formData.city,
            fullAddress: formData.fullAddress,
          },
        },
      };

      // Include BOQ data if selected
      if (formData.selectedBOQ && formData.boqData) {
        projectData.attachedBOQ = {
          id: formData.selectedBOQ,
          title: formData.boqData.title,
          tahapanKerja: formData.boqData.tahapanKerja,
          createdAt: formData.boqData.createdAt,
          updatedAt: formData.boqData.updatedAt,
          attachedAt: new Date().toISOString(),
        };
      }

      console.log("About to save project data:", {
        customId: projectData.customId,
        projectType: projectData.projectType,
        title: projectData.title,
        ownerId: projectData.ownerId,
      });

      const docRef = await addDoc(collection(db, "projects"), projectData);
      console.log(
        "Project created with Firestore ID:",
        docRef.id,
        "Custom ID:",
        customProjectId
      );
      console.log("Full project data saved:", projectData);

      alert(
        `Proyek berhasil dikirim! ID proyek Anda: ${customProjectId}. Proyek Anda sedang menunggu persetujuan dan akan tersedia di marketplace setelah disetujui.`
      );
      onClose();
    } catch (error) {
      console.error("Error creating project:", error);
      alert("Gagal membuat proyek. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!user?.uid) {
      alert("Silakan login untuk menyimpan draft");
      return;
    }

    // Basic validation - only require project title
    if (!formData.projectTitle.trim()) {
      alert("Judul proyek harus diisi untuk menyimpan draft");
      return;
    }

    setSubmitting(true);
    try {
      // Generate custom project ID for drafts too
      console.log(
        "Generating custom project ID for draft:",
        formData.projectType || "Unknown"
      );
      const customProjectId = await generateProjectId(
        formData.projectType || "Unknown"
      );
      console.log("Generated custom project ID for draft:", customProjectId);

      const draftData = {
        customId: customProjectId, // Add custom ID field for drafts
        ...formData,
        title: formData.projectTitle,
        ownerId: user.uid,
        ownerEmail: user.email,
        ownerName: user.displayName || user.email,
        status: "Draft", // Set status as Draft (backend still uses 'Draft', getProjectStatus converts to 'In Progress')
        moderationStatus: "draft",
        progress: 0,
        isPublished: false,
        isDraft: true, // Mark as draft
        publishedAt: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        submittedAt: null, // No submission date for drafts
        team: [],
        milestones: [
          { name: "Perencanaan", completed: false, date: "" },
          { name: "Desain", completed: false, date: "" },
          { name: "Pembangunan", completed: false, date: "" },
          { name: "Review", completed: false, date: "" },
          { name: "Penyelesaian", completed: false, date: "" },
        ],
        // Add metadata for marketplace (but won't be published)
        marketplace: {
          category: formData.projectType,
          tags: formData.projectScope,
          budget: formData.estimatedBudget,
          duration: formData.estimatedDuration,
          location: {
            province: formData.province,
            city: formData.city,
            fullAddress: formData.fullAddress,
          },
        },
      };

      const docRef = await addDoc(collection(db, "projects"), draftData);
      console.log(
        "Draft saved with Firestore ID:",
        docRef.id,
        "Custom ID:",
        customProjectId
      );
      console.log("Full draft data saved:", draftData);

      alert(
        `Draft berhasil disimpan! ID draft Anda: ${customProjectId}. Anda dapat melanjutkan mengedit proyek ini nanti.`
      );
      onClose();
    } catch (error) {
      console.error("Error saving draft:", error);
      alert("Gagal menyimpan draft. Silakan coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  const getAvailableCities = () => {
    return cities[formData.province] || [];
  };

  const isDesignProject = () => formData.projectType === "Desain";
  const isBuildRenovateProject = () =>
    ["Bangun", "Renovasi"].includes(formData.projectType);

  // Function to generate custom project ID
  const generateProjectId = async (projectType) => {
    console.log("generateProjectId called with projectType:", projectType);

    const now = new Date();
    const year = String(now.getFullYear()).slice(-2); // Get last 2 digits of year (25 for 2025)
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const dateString = `${year}${month}`; // Format: 2507 for July 2025

    // Map project type to 3-letter code
    let typePrefix;
    switch (projectType) {
      case "Desain":
        typePrefix = "DES";
        break;
      case "Bangun":
        typePrefix = "BUI";
        break;
      case "Renovasi":
        typePrefix = "REN";
        break;
      default:
        typePrefix = "PRJ"; // Default fallback
    }

    // Country code for Indonesia
    const countryCode = "ID";

    console.log("Date components:", {
      year,
      month,
      dateString,
      typePrefix,
      countryCode,
    });

    try {
      // Query existing projects to get the count for today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      console.log("Querying projects between:", today, "and", tomorrow);

      const q = query(
        collection(db, "projects"),
        where("createdAt", ">=", today),
        where("createdAt", "<", tomorrow),
        orderBy("createdAt", "desc")
      );

      const querySnapshot = await getDocs(q);
      const todayCount = querySnapshot.size + 1;
      const sequentialNumber = String(todayCount).padStart(4, "0");

      const finalCustomId = `${typePrefix}-${countryCode}-${dateString}-${sequentialNumber}`;
      console.log("Generated custom ID:", finalCustomId);

      return finalCustomId;
    } catch (error) {
      console.error("Error generating project ID:", error);
      // Fallback to timestamp-based ID if query fails
      const fallbackNumber = String(
        Math.floor(Math.random() * 9999) + 1
      ).padStart(4, "0");
      const fallbackId = `${typePrefix}-${countryCode}-${dateString}-${fallbackNumber}`;
      console.log("Using fallback custom ID:", fallbackId);
      return fallbackId;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Buat Proyek Baru</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-blue-200 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-120px)]">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* I. Informasi Umum Proyek */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-600 pb-2">
                I. Informasi Umum Proyek
              </h3>

              {/* 1. Judul Proyek */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  1. Judul Proyek *
                </label>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                  [Jenis Proyek] - [Ruang Lingkup] - [Property] - [Lokasi] -
                  [Detail Opsional]
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 italic">
                  Bangun Interior Rumah BSD Minimalis Modern
                </p>
                <input
                  type="text"
                  value={formData.projectTitle}
                  onChange={(e) =>
                    handleInputChange("projectTitle", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Masukkan judul proyek sesuai format"
                  required
                />
              </div>

              {/* 2. Lokasi Proyek */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">
                  2. Lokasi Proyek
                </label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                      Provinsi *
                    </label>
                    <select
                      value={formData.province}
                      onChange={(e) => {
                        handleInputChange("province", e.target.value);
                        handleInputChange("city", "");
                      }}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Pilih Provinsi</option>
                      {provinces.map((province) => (
                        <option key={province} value={province}>
                          {province}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                      Kota *
                    </label>
                    <select
                      value={formData.city}
                      onChange={(e) =>
                        handleInputChange("city", e.target.value)
                      }
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      disabled={!formData.province}
                    >
                      <option value="">Pilih Kota</option>
                      {getAvailableCities().map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                    Alamat Lengkap *
                  </label>
                  <textarea
                    value={formData.fullAddress}
                    onChange={(e) =>
                      handleInputChange("fullAddress", e.target.value)
                    }
                    rows={3}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Masukkan alamat lengkap proyek"
                    required
                  />
                </div>
              </div>
            </div>

            {/* II. Klasifikasi & Ruang Lingkup Proyek */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-600 pb-2">
                II. Klasifikasi & Ruang Lingkup Proyek
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Penjelasan ruang lingkup harus jelas dan spesifik agar vendor
                bisa memahami kebutuhan klien secara tepat, serta menjadi dasar
                dalam pembuatan kontrak dan milestone.
              </p>

              {/* 1. Jenis Proyek */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  1. Jenis Proyek *
                </label>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                  This is a required question
                </p>
                <select
                  value={formData.projectType}
                  onChange={(e) =>
                    handleInputChange("projectType", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Pilih Jenis Proyek</option>
                  {projectTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Ruang Lingkup */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  2. Ruang Lingkup *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {projectScopes.map((scope) => (
                    <label
                      key={scope}
                      className="flex items-center space-x-2 cursor-pointer p-3 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
                    >
                      <input
                        type="checkbox"
                        checked={formData.projectScope.includes(scope)}
                        onChange={() => handleScopeToggle(scope)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-700 dark:text-slate-300">
                        {scope}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 3. Properti */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  3. Properti *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {propertyTypes.map((property) => (
                    <label
                      key={property}
                      className="flex items-center space-x-2 cursor-pointer p-3 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
                    >
                      <input
                        type="radio"
                        name="propertyType"
                        value={property}
                        checked={formData.propertyType === property}
                        onChange={(e) =>
                          handleInputChange("propertyType", e.target.value)
                        }
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-700 dark:text-slate-300">
                        {property}
                      </span>
                    </label>
                  ))}
                </div>

                {formData.propertyType === "Other" && (
                  <div className="mt-3">
                    <input
                      type="text"
                      value={formData.otherProperty}
                      onChange={(e) =>
                        handleInputChange("otherProperty", e.target.value)
                      }
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Other:"
                    />
                  </div>
                )}
              </div>

              {/* 4. Estimasi Anggaran */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  4. Estimasi Anggaran *
                </label>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                  Masukkan estimasi anggaran tetap Anda sebagai referensi bagi
                  vendor. Angka ini tidak mengikat.
                </p>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 dark:text-slate-400">
                    Rp
                  </span>
                  <input
                    type="text"
                    value={getFormattedBudget()}
                    onChange={(e) => handleBudgetChange(e.target.value)}
                    className="w-full pl-12 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="50,000,000"
                    required
                  />
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  Contoh: 50,000,000 (untuk Rp 50.000.000)
                </p>
              </div>

              {/* 5. Estimasi Durasi Proyek */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  5. Estimasi Durasi Proyek *
                </label>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                  Pilih estimasi durasi pekerjaan proyek Anda sebagai referensi
                  bagi vendor.
                </p>
                <select
                  value={formData.estimatedDuration}
                  onChange={(e) =>
                    handleInputChange("estimatedDuration", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Pilih durasi proyek</option>
                  <option value="&lt; 3 Bulan">&lt; 3 Bulan</option>
                  <option value="3-6 Bulan">3-6 Bulan</option>
                  <option value="&lt; 1 Tahun">&lt; 1 Tahun</option>
                  <option value="&gt; 1 Tahun">&gt; 1 Tahun</option>
                </select>
              </div>

              {/* 6. Durasi Tender */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  6. Durasi Tender *
                </label>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                  Pilih berapa lama tender akan dibuka untuk menerima penawaran
                  dari vendor.
                </p>
                <select
                  value={formData.tenderDuration}
                  onChange={(e) =>
                    handleInputChange("tenderDuration", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Pilih durasi tender</option>
                  <option value="2 Minggu">2 Minggu</option>
                  <option value="1 Bulan">1 Bulan</option>
                  <option value="2 Bulan">2 Bulan</option>
                  <option value="3 Bulan">3 Bulan</option>
                  <option value="4 Bulan">4 Bulan</option>
                  <option value="5 Bulan">5 Bulan</option>
                </select>
              </div>

              {/* 7. Estimasi Mulai Proyek */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  7. Estimasi Mulai Proyek *
                </label>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                  Masukkan estimasi durasi pekerjaan proyek Anda sebagai
                  referensi bagi vendor. Angka ini bisa berupa kisaran dan tidak
                  mengikat.
                </p>
                <input
                  type="date"
                  value={formData.estimatedStartDate}
                  onChange={(e) =>
                    handleInputChange("estimatedStartDate", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* 8. Metode Pengadaan */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  8. Metode Pengadaan *
                </label>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                  Pilih metode pengadaan untuk proyek ini
                </p>
                <select
                  value={formData.procurementMethod}
                  onChange={(e) =>
                    handleInputChange("procurementMethod", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Pilih Metode Pengadaan</option>
                  {procurementMethods.map((method) => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
                </select>
              </div>

              {/* 9. Upload Dokumen Pendukung */}
              {isDesignProject() && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    9. Upload Dokumen Pendukung (Referensi)
                  </label>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                    Hanya muncul untuk jenis proyek desain.
                  </p>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileUpload(e, "supportingDocuments")}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />

                  {/* Display uploaded files with title input */}
                  {formData.supportingDocuments.map((file, index) => (
                    <div
                      key={index}
                      className="mt-3 p-3 border border-slate-200 dark:border-slate-600 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-700 dark:text-slate-300">
                          {file.name}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            removeDocument(file.name, "supportingDocuments")
                          }
                          className="text-red-500 hover:text-red-700"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                      <input
                        type="text"
                        placeholder="Masukkan judul dokumen"
                        value={
                          formData.documentTitles[
                            `supportingDocuments_${file.name}`
                          ] || ""
                        }
                        onChange={(e) =>
                          handleDocumentTitleChange(
                            file.name,
                            e.target.value,
                            "supportingDocuments"
                          )
                        }
                        className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* BOQ & Gambar Kerja for Bangun & Renovasi */}
              {isBuildRenovateProject() && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    9. Upload Dokumen Pendukung (BOQ & Gambar Kerja)
                  </label>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                    Hanya muncul untuk jenis proyek bangun & renovasi.
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                    Bagian ini pada saat upload ada judulnya. jika upload BOQ,
                    harus masukin judul dulu BOQ, dan seterusnya.
                  </p>

                  {/* BOQ Section */}
                  <div className="mb-4">
                    <div className="flex items-center gap-4 mb-3">
                      <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        BOQ (Bill of Quantity)
                      </h4>
                      <button
                        type="button"
                        onClick={() => setShowBOQSelector(true)}
                        className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Muat dari BOQ Studio
                      </button>
                    </div>

                    {formData.selectedBOQ && (
                      <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg mb-3">
                        <p className="text-sm text-green-700 dark:text-green-300">
                          BOQ Dimuat:{" "}
                          {formData.boqData?.title || "BOQ Terpilih"}
                        </p>
                      </div>
                    )}

                    <input
                      type="file"
                      multiple
                      accept=".pdf,.xls,.xlsx"
                      onChange={(e) => handleFileUpload(e, "boqDocuments")}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />

                    {formData.boqDocuments.map((file, index) => (
                      <div
                        key={index}
                        className="mt-3 p-3 border border-slate-200 dark:border-slate-600 rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-slate-700 dark:text-slate-300">
                            {file.name}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              removeDocument(file.name, "boqDocuments")
                            }
                            className="text-red-500 hover:text-red-700"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                        <input
                          type="text"
                          placeholder="BOQ - [Nama Proyek/Bagian]"
                          value={
                            formData.documentTitles[
                              `boqDocuments_${file.name}`
                            ] || ""
                          }
                          onChange={(e) =>
                            handleDocumentTitleChange(
                              file.name,
                              e.target.value,
                              "boqDocuments"
                            )
                          }
                          className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Gambar Kerja Section */}
                  <div>
                    <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                      Gambar Kerja
                    </h4>
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.dwg,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileUpload(e, "drawingDocuments")}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />

                    {formData.drawingDocuments.map((file, index) => (
                      <div
                        key={index}
                        className="mt-3 p-3 border border-slate-200 dark:border-slate-600 rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-slate-700 dark:text-slate-300">
                            {file.name}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              removeDocument(file.name, "drawingDocuments")
                            }
                            className="text-red-500 hover:text-red-700"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                        <input
                          type="text"
                          placeholder="Gambar Kerja - [Nama Bagian]"
                          value={
                            formData.documentTitles[
                              `drawingDocuments_${file.name}`
                            ] || ""
                          }
                          onChange={(e) =>
                            handleDocumentTitleChange(
                              file.name,
                              e.target.value,
                              "drawingDocuments"
                            )
                          }
                          className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Catatan Khusus */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Catatan Khusus (Opsional)
              </label>
              <textarea
                value={formData.specialNotes}
                onChange={(e) =>
                  handleInputChange("specialNotes", e.target.value)
                }
                rows={4}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Tambahkan catatan khusus atau requirements tambahan..."
              />
            </div>

            {/* Persetujuan */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Persetujuan
              </h3>

              <div className="space-y-3">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.agreementTerms}
                    onChange={(e) =>
                      handleInputChange("agreementTerms", e.target.checked)
                    }
                    className="mt-1 text-blue-600 focus:ring-blue-500"
                    required
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    Saya menyetujui seluruh ketentuan dan tata cara di platform
                    Projevo. *
                  </span>
                </label>

                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.agreementData}
                    onChange={(e) =>
                      handleInputChange("agreementData", e.target.checked)
                    }
                    className="mt-1 text-blue-600 focus:ring-blue-500"
                    required
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    Saya menyatakan data yang diisi sudah benar dan sesuai
                    kondisi yang sebenarnya. *
                  </span>
                </label>

                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.agreementValidation}
                    onChange={(e) =>
                      handleInputChange("agreementValidation", e.target.checked)
                    }
                    className="mt-1 text-blue-600 focus:ring-blue-500"
                    required
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    Saya mengizinkan admin untuk validasi draft ini sebelum
                    dipublikasikan. *
                  </span>
                </label>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-between items-center pt-6 border-t border-slate-200 dark:border-slate-600">
              <button
                type="button"
                onClick={handleSaveDraft}
                className="px-6 py-2 bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-colors"
              >
                Simpan Draft
              </button>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Membuat..." : "Buat Proyek"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* BOQ Selector Modal */}
      {showBOQSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-60">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[70vh] overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 text-white">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">Pilih BOQ dari BOQ Studio</h3>
                <button
                  onClick={() => setShowBOQSelector(false)}
                  className="text-white hover:text-green-200"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(70vh-80px)]">
              {savedBOQs.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-500 dark:text-slate-400">
                    Tidak ada BOQ yang tersimpan.
                  </p>
                  <p className="text-sm text-slate-400 dark:text-slate-500 mt-2">
                    Silakan buat BOQ terlebih dahulu di BOQ Studio.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {savedBOQs.map((boq, index) => (
                    <div
                      key={boq.id || index}
                      className="p-4 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
                      onClick={() => selectBOQ(boq.id || index)}
                    >
                      <h4 className="font-medium text-slate-900 dark:text-white">
                        {boq.title || `BOQ ${index + 1}`}
                      </h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {boq.tahapanKerja?.length || 0} tahapan kerja
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                        Dibuat:{" "}
                        {boq.createdAt
                          ? new Date(boq.createdAt).toLocaleDateString()
                          : "Tidak diketahui"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function HomeComponent({ activeProjectTab, onCreateProject }) {
  const { user, userProfile } = useAuth();
  const router = useRouter();
  const [selectedProject, setSelectedProject] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [sortBy, setSortBy] = useState("Terbaru");
  const [filterBy, setFilterBy] = useState("Semua");
  const [showDetailsView, setShowDetailsView] = useState(false);
  const [activeProjectFilter, setActiveProjectFilter] = useState(null); // Internal project filter state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedProposalForPayment, setSelectedProposalForPayment] =
    useState(null);
  const sortDropdownRef = useRef(null);
  const filterDropdownRef = useRef(null);

  // Project filter tabs
  const projectFilterTabs = [
    "Semua",
    "Dalam Proses",
    "Tender",
    "Kontrak",
    "Negosiasi",
    "Penunjukan Langsung",
  ];

  // Function to check payment status with Xendit
  const checkPaymentStatus = async (project) => {
    try {
      console.log("🔄 Checking Xendit payment status for project:", project.id);

      if (!project.payment?.orderId) {
        console.log("❌ No payment order ID found for project:", project.id);
        return project;
      }

      const response = await fetch("/api/xendit/check-payment-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: project.payment.orderId,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        console.error("❌ Payment status check failed:", result.error);
        return project;
      }

      console.log("💳 Payment status result:", result);

      // Update project payment status if completed
      if (result.isCompleted && project.payment.status !== "completed") {
        console.log("✅ Payment completed, updating project status");

        // Update the project in Firestore
        const projectRef = doc(db, "projects", project.id);
        const updateData = {
          "payment.status": "completed",
          firstPaymentCompleted: true,
          initialPaymentCompleted: true,
          updatedAt: new Date(),
        };

        await updateDoc(projectRef, updateData);

        // Return updated project data
        return {
          ...project,
          payment: {
            ...project.payment,
            status: "completed",
          },
          firstPaymentCompleted: true,
          initialPaymentCompleted: true,
        };
      }

      // Return project with updated payment status
      return {
        ...project,
        payment: {
          ...project.payment,
          status: result.status,
        },
      };
    } catch (error) {
      console.error("❌ Error checking payment status:", error);
      return project;
    }
  };

  // Load projects from Firestore
  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    console.log("Loading projects for user:", user.uid);
    setLoading(true);

    // Query projects where the current user is the owner
    const projectsQuery = query(
      collection(db, "projects"),
      where("ownerId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      projectsQuery,
      async (snapshot) => {
        const projectsData = [];
        snapshot.forEach((doc) => {
          projectsData.push({
            id: doc.id,
            ...doc.data(),
          });
        });

        console.log("Loaded projects:", projectsData);

        // Check payment status for projects that have payments
        const projectsWithUpdatedPayments = await Promise.all(
          projectsData.map(async (project) => {
            // Only check payment status for projects that:
            // 1. Have payment information
            // 2. Are in awarded status or have pending payments
            // 3. Don't already have completed payments
            if (
              project.payment &&
              project.payment.orderId &&
              project.initialPaymentCompleted !== true &&
              (project.payment.status === "process" ||
                project.payment.status === "waiting-approval" ||
                getProjectStatus(project) === "Awarded")
            ) {
              console.log("🔄 Checking payment for project:", project.id);
              return await checkPaymentStatus(project);
            }

            return project;
          })
        );

        console.log(
          "Projects with updated payment status:",
          projectsWithUpdatedPayments
        );
        setProjects(projectsWithUpdatedPayments);
        setLoading(false);
      },
      (error) => {
        console.error("Error loading projects:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  // Handle click outside dropdowns
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        sortDropdownRef.current &&
        !sortDropdownRef.current.contains(event.target)
      ) {
        setShowSortDropdown(false);
      }
      if (
        filterDropdownRef.current &&
        !filterDropdownRef.current.contains(event.target)
      ) {
        setShowFilterDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleViewProject = (project) => {
    setSelectedProject(project);
    setShowDetailsView(true);
  };

  const handleCloseDetailModal = () => {
    // Legacy function - kept for compatibility
    setSelectedProject(null);
  };

  const handleBackToList = () => {
    setShowDetailsView(false);
    setSelectedProject(null);
  };

  const handleEditProject = (project) => {
    // Navigate to project creation page with edit mode
    console.log("Edit project:", project);

    // Store the project data in localStorage for editing
    localStorage.setItem("editProject", JSON.stringify(project));

    // Call the onCreateProject function to show the create project component
    // This will trigger the parent component to show the CreateProjectComponent
    if (onCreateProject) {
      onCreateProject();
    }
  };

  const handleProjectUpdate = (updatedProject) => {
    // Update the selected project with the latest data
    setSelectedProject(updatedProject);

    // Also update the project in the projects list
    setProjects((prevProjects) =>
      prevProjects.map((project) =>
        project.id === updatedProject.id ? updatedProject : project
      )
    );

    console.log("✅ Project updated locally:", updatedProject.id);
  };

  const handleViewOffers = (project) => {
    // Navigate to proposal tab directly
    setSelectedProject(project);
    setShowDetailsView(true);
    // TODO: Add logic to auto-navigate to proposals tab in detail view
    console.log("View offers for project:", project);
  };

  const handlePayment = async (project) => {
    console.log("🎯 HANDLE PAYMENT DEBUG:");
    console.log("  - Project passed to handlePayment:", project);
    console.log("  - Project ID:", project.id);
    console.log("  - Project customId:", project.customId);
    console.log("  - Project ownerId:", project.ownerId);
    console.log("  - Project ownerEmail:", project.ownerEmail);

    // Find the selected vendor proposal
    const selectedProposal = project.proposals?.find(
      (proposal) =>
        proposal.status === "accepted" ||
        (proposal.negotiation && proposal.negotiation.status === "accepted") ||
        proposal.vendorId === project.selectedVendorId
    );

    const proposalIndex = project.proposals?.findIndex(
      (proposal) =>
        proposal.status === "accepted" ||
        (proposal.negotiation && proposal.negotiation.status === "accepted") ||
        proposal.vendorId === project.selectedVendorId
    );

    console.log("  - Selected proposal:", selectedProposal);
    console.log("  - Proposal index:", proposalIndex);
    console.log("  - All project proposals:", project.proposals);
    console.log(
      "  - Full proposal structure:",
      JSON.stringify(selectedProposal, null, 2)
    );

    if (!selectedProposal) {
      alert(
        "Penawaran vendor yang dipilih tidak ditemukan. Silakan hubungi dukungan."
      );
      return;
    }

    // 🔍 Check if payment already exists before creating new one
    console.log("🔍 Checking existing payment data...");

    // Support both old single payment structure and new multiple payments structure
    const existingPayments =
      project.payments || (project.payment ? [project.payment] : []);
    console.log("💳 Found existing payments:", existingPayments);

    // Check if we already have a payment for "Termin 1 & 2"
    const termin12Payment = existingPayments.find(
      (payment) =>
        payment.title === "Termin 1 & 2" ||
        payment.paymentType === "first_payment" ||
        (!payment.title && !payment.paymentType) // For backward compatibility with old single payment
    );

    if (termin12Payment && termin12Payment.invoiceUrl) {
      console.log(
        "💳 Found existing Termin 1 & 2 payment URL:",
        termin12Payment.invoiceUrl
      );

      // Check if payment is already completed in our local data first
      if (
        termin12Payment.status === "paid" ||
        project.initialPaymentCompleted === true ||
        project.firstPaymentCompleted === true
      ) {
        console.log(
          "✅ Termin 1 & 2 payment already completed! Proceeding to next phase..."
        );

        try {
          await updateDoc(doc(db, "projects", project.id), {
            initialPaymentCompleted: true,
            firstPaymentCompleted: true,
            status: "On Going",
            updatedAt: new Date(),
            // Update the specific payment status in the array
            [`payments.${existingPayments.findIndex(
              (p) => p === termin12Payment
            )}.status`]: "paid",
          });

          await fetchProjects();
          alert(
            "Pembayaran Termin 1 & 2 sudah selesai! Proyek berlanjut ke fase berikutnya."
          );
          return;
        } catch (updateError) {
          console.error("❌ Error updating project status:", updateError);
          alert(
            "Pembayaran sudah selesai, namun gagal memperbarui status proyek. Silakan refresh halaman."
          );
          return;
        }
      }

      // If we have an existing URL and payment is not completed, use the existing URL
      console.log(
        "🔗 Using existing Termin 1 & 2 payment URL instead of creating new one"
      );
      window.open(termin12Payment.invoiceUrl, "_blank");
      return;
    } else if (termin12Payment && termin12Payment.invoiceId) {
      console.log(
        "💳 Found existing Termin 1 & 2 payment with invoiceId but no URL:",
        termin12Payment
      );

      // Try to check status via API only if we don't have a URL but have invoiceId
      try {
        console.log(
          "🔄 Checking Xendit payment status for Termin 1 & 2:",
          project.id
        );

        const response = await fetch("/api/xendit/check-payment-status", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderId: termin12Payment.invoiceId,
          }),
        });

        const result = await response.json();

        if (result.success && result.paymentStatus === "paid") {
          console.log(
            "✅ Termin 1 & 2 payment already completed via API! Proceeding to next phase..."
          );

          try {
            await updateDoc(doc(db, "projects", project.id), {
              initialPaymentCompleted: true,
              firstPaymentCompleted: true,
              status: "On Going",
              updatedAt: new Date(),
              [`payments.${existingPayments.findIndex(
                (p) => p === termin12Payment
              )}.status`]: "paid",
            });

            await fetchProjects();
            alert(
              "Pembayaran Termin 1 & 2 sudah selesai! Proyek berlanjut ke fase berikutnya."
            );
            return;
          } catch (updateError) {
            console.error("❌ Error updating project status:", updateError);
            alert(
              "Pembayaran sudah selesai, namun gagal memperbarui status proyek. Silakan refresh halaman."
            );
            return;
          }
        }

        console.log(
          "⚠️ Termin 1 & 2 payment not completed or API check failed. Creating new payment..."
        );
      } catch (error) {
        console.error("❌ Error checking payment status:", error);
        console.log("🔄 API check failed. Creating new payment...");
      }
    } else {
      console.log(
        "📝 No existing Termin 1 & 2 payment found. Creating new payment..."
      );
    }

    console.log(
      "Initiate payment for project:",
      project,
      "proposal:",
      selectedProposal
    );

    // Calculate payment amounts based on vendor proposal amount (not project budget)
    let totalAmount = 0;

    // Try different fields where vendor proposal amount might be stored
    if (selectedProposal?.totalAmount) {
      totalAmount = Number(selectedProposal.totalAmount);
    } else if (selectedProposal?.totalBidAmount) {
      totalAmount = Number(selectedProposal.totalBidAmount);
    } else if (selectedProposal?.currentPrice) {
      totalAmount = Number(selectedProposal.currentPrice);
    } else if (selectedProposal?.totalPrice) {
      totalAmount = Number(selectedProposal.totalPrice);
    } else if (selectedProposal?.finalPrice) {
      totalAmount = Number(selectedProposal.finalPrice);
    } else if (selectedProposal?.originalPrice) {
      totalAmount = Number(selectedProposal.originalPrice);
    } else if (selectedProposal?.proposedPrice) {
      totalAmount = Number(selectedProposal.proposedPrice);
    } else if (selectedProposal?.price) {
      totalAmount = Number(selectedProposal.price);
    } else if (selectedProposal?.bidAmount) {
      totalAmount = Number(selectedProposal.bidAmount);
    } else if (selectedProposal?.amount) {
      totalAmount = Number(selectedProposal.amount);
    } else if (selectedProposal?.total) {
      totalAmount = Number(selectedProposal.total);
    } else {
      console.error(
        "❌ Could not find vendor proposal amount in:",
        selectedProposal
      );
      alert(
        "Jumlah penawaran vendor tidak ditemukan. Silakan hubungi dukungan."
      );
      return;
    }

    console.log(
      "💰 Using vendor deal amount:",
      totalAmount,
      "from proposal:",
      selectedProposal
    );

    // Default to 3 phases if not specified
    const projectPhases = project.projectPhases || 3;
    const terminAmount = Math.round(totalAmount / projectPhases);
    const firstPaymentAmount = terminAmount * 2; // Termin 1 + 2
    const remainingAmount = totalAmount - firstPaymentAmount;

    // Enhanced project data with payment calculations
    const enhancedProjectData = {
      ...project,
      paymentType: "first_payment",
      paymentTitle: "Termin 1 & 2",
      paymentIndex: existingPayments.length, // Next payment index
      totalProjectAmount: totalAmount,
      projectPhases: projectPhases,
      terminAmount: terminAmount,
      firstPaymentAmount: firstPaymentAmount,
      remainingAmount: remainingAmount,
    };

    console.log("💰 Payment calculation debug:", {
      totalAmount,
      projectPhases,
      terminAmount,
      firstPaymentAmount,
      remainingAmount,
    });

    // Prepare data for the payment modal
    setSelectedProposalForPayment({
      projectData: enhancedProjectData,
      proposal: selectedProposal,
      proposalIndex: proposalIndex,
    });
    setShowPaymentModal(true);
  };

  // Function to handle subsequent payments (Termin 3, 4, etc.)
  const handleSubsequentPayment = async (project, terminNumber) => {
    console.log(`🎯 HANDLE TERMIN ${terminNumber} PAYMENT:`, project);

    const selectedProposal = project.proposals?.find(
      (proposal) =>
        proposal.status === "accepted" ||
        (proposal.negotiation && proposal.negotiation.status === "accepted") ||
        proposal.vendorId === project.selectedVendorId
    );

    if (!selectedProposal) {
      alert("Penawaran vendor yang dipilih tidak ditemukan.");
      return;
    }

    // Get total amount from proposal
    let totalAmount = selectedProposal?.totalAmount || 0;
    const projectPhases = project.projectPhases || 3;
    const terminAmount = Math.round(totalAmount / projectPhases);

    // Get existing payments
    const existingPayments = project.payments || [];
    const paymentTitle = `Termin ${terminNumber}`;

    // Check if this termin payment already exists
    const existingTerminPayment = existingPayments.find(
      (payment) => payment.title === paymentTitle
    );

    if (existingTerminPayment && existingTerminPayment.invoiceUrl) {
      console.log(`🔗 Using existing ${paymentTitle} payment URL`);
      window.open(existingTerminPayment.invoiceUrl, "_blank");
      return;
    }

    // Enhanced project data for subsequent payment
    const enhancedProjectData = {
      ...project,
      paymentType: "subsequent_payment",
      paymentTitle: paymentTitle,
      paymentIndex: existingPayments.length,
      totalProjectAmount: totalAmount,
      projectPhases: projectPhases,
      terminAmount: terminAmount,
      firstPaymentAmount: terminAmount, // Single termin amount
      remainingAmount: totalAmount - terminAmount * terminNumber,
    };

    setSelectedProposalForPayment({
      projectData: enhancedProjectData,
      proposal: selectedProposal,
      proposalIndex: 0,
    });
    setShowPaymentModal(true);
  };

  // Function to determine what payment button to show
  const getPaymentButton = (project) => {
    const existingPayments =
      project.payments || (project.payment ? [project.payment] : []);
    const termin12Payment = existingPayments.find(
      (payment) =>
        payment.title === "Termin 1 & 2" ||
        payment.paymentType === "first_payment" ||
        (!payment.title && !payment.paymentType)
    );

    // If no Termin 1 & 2 payment or it's not paid yet
    if (!termin12Payment || termin12Payment.status !== "paid") {
      return (
        <button
          onClick={() => handlePayment(project)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors duration-200 border border-blue-600 flex items-center justify-center gap-2 whitespace-nowrap flex-1 h-[80px]"
        >
          <FiCreditCard className="w-4 h-4" />
          Bayar Termin 1 & 2
        </button>
      );
    }

    // Check for next termin needed
    const projectPhases = project.projectPhases || 3;
    for (let i = 3; i <= projectPhases; i++) {
      const terminPayment = existingPayments.find(
        (payment) => payment.title === `Termin ${i}`
      );

      if (!terminPayment || terminPayment.status !== "paid") {
        return (
          <button
            onClick={() => handleSubsequentPayment(project, i)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors duration-200 border border-green-600 flex items-center justify-center gap-2 whitespace-nowrap flex-1 h-[80px]"
          >
            <FiCreditCard className="w-4 h-4" />
            Bayar Termin {i}
          </button>
        );
      }
    }

    // All payments completed
    return (
      <button
        onClick={() => handleViewProject(project)}
        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors duration-200 border border-gray-600 flex items-center justify-center gap-2 whitespace-nowrap flex-1 h-[80px]"
      >
        <FiCheck className="w-4 h-4" />
        Semua Pembayaran Selesai
      </button>
    );
  };

  const handleResubmitProject = (project) => {
    // Reopen the project for tender
    console.log("Resubmit project for tender:", project);
    // TODO: Implement project resubmission logic
    // This should reset project status and open it for new tender
    alert(
      "Fitur kirim ulang proyek akan diimplementasikan. Ini akan mengatur ulang batas waktu tender dan membuka proyek untuk penawaran baru."
    );
  };

  const handleDeleteProject = async (project) => {
    // Show confirmation dialog
    if (
      window.confirm(
        `Are you sure you want to delete "${
          project.title || project.projectTitle
        }"? This action cannot be undone.`
      )
    ) {
      try {
        console.log("Deleting project:", project.id);

        // Delete project from Firestore
        await deleteDoc(doc(db, "projects", project.id));

        console.log("Project deleted successfully:", project.id);

        // Show success message
        alert("Proyek berhasil dihapus!");

        // The projects list will automatically update due to the real-time listener
      } catch (error) {
        console.error("Error deleting project:", error);
        alert("Gagal menghapus proyek. Silakan coba lagi.");
      }
    }
  };

  const handleCreateProject = () => {
    if (onCreateProject) {
      onCreateProject();
    }
  };

  // Helper function to map procurementMethod to display name
  const getProjectType = (procurementMethod) => {
    switch (procurementMethod) {
      case "Contract":
        return "Contract";
      case "Tender":
        return "Tender";
      case "Draft":
        return "Draft";
      case "Negotiation":
        return "Negotiation";
      case "Penunjukan Langsung":
        return "Penunjukan Langsung";
      default:
        return "Contract"; // Default fallback
    }
  };

  // Helper function to normalize status display
  const getDisplayStatus = (project) => {
    // Use the new project status logic
    return getProjectStatus(project);
  };

  // Helper function to format budget with thousand separators
  const formatBudget = (budget) => {
    if (!budget) return "Not specified";

    // Convert to number if it's a string
    const numBudget =
      typeof budget === "string"
        ? parseInt(budget.replace(/[^\d]/g, ""))
        : budget;

    if (isNaN(numBudget)) return "Not specified";

    return `Rp ${numBudget.toLocaleString("id-ID")}`;
  };

  const getCompanyName = (project) => {
    // Try to get from user profile first
    if (userProfile?.companyName) {
      return userProfile.companyName;
    }

    // Fallback to owner name or email
    if (project.ownerName && project.ownerName !== project.ownerEmail) {
      return project.ownerName;
    }

    if (project.ownerEmail) {
      return project.ownerEmail.split("@")[0];
    }

    return "Unknown Company";
  };

  // Helper function to get milestones from BOQ data
  const getMilestones = (project) => {
    // If project has attached BOQ, create milestones from tahapan kerja
    if (project.attachedBOQ && project.attachedBOQ.tahapanKerja) {
      console.log("BOQ tahapanKerja found:", project.attachedBOQ.tahapanKerja);
      return project.attachedBOQ.tahapanKerja.map((tahapan, index) => {
        const milestoneName =
          tahapan.name || tahapan.nama || `Tahapan ${index + 1}`;
        console.log(
          `Milestone ${index + 1}:`,
          milestoneName,
          "from tahapan:",
          tahapan
        );
        return {
          name: milestoneName,
          completed: false,
          date: "",
        };
      });
    }

    // Fallback to existing milestones or default ones
    if (project.milestones && project.milestones.length > 0) {
      return project.milestones;
    }

    // Default milestones based on project type
    const defaultMilestones = {
      Desain: [
        { name: "Concept Design", completed: false, date: "" },
        { name: "Design Development", completed: false, date: "" },
        { name: "Final Design", completed: false, date: "" },
        { name: "Design Approval", completed: false, date: "" },
      ],
      Bangun: [
        { name: "Site Preparation", completed: false, date: "" },
        { name: "Foundation", completed: false, date: "" },
        { name: "Structure", completed: false, date: "" },
        { name: "Finishing", completed: false, date: "" },
      ],
      Renovasi: [
        { name: "Demolition", completed: false, date: "" },
        { name: "Reconstruction", completed: false, date: "" },
        { name: "Finishing", completed: false, date: "" },
        { name: "Final Inspection", completed: false, date: "" },
      ],
    };

    return (
      defaultMilestones[project.projectType] || [
        { name: "Planning", completed: false, date: "" },
        { name: "Execution", completed: false, date: "" },
        { name: "Review", completed: false, date: "" },
        { name: "Completion", completed: false, date: "" },
      ]
    );
  };

  // Helper function to determine if project has started (entered execution phase)
  const isProjectStarted = (project) => {
    const status = project.status;
    const moderationStatus = project.moderationStatus;

    // Project is considered started ONLY when:
    // 1. Initial payment has been made, OR
    // 2. Project is in "On Going" status, OR
    // 3. A vendor has been formally selected AND negotiation is completed (not just started)

    if (
      project.initialPaymentCompleted === true ||
      project.paymentCompleted === true
    ) {
      return true;
    }

    if (status === "On Going" || status === "Active") {
      return true;
    }

    // Check if any proposal has been FULLY accepted (vendor completed negotiation)
    if (project.proposals && Array.isArray(project.proposals)) {
      const hasAcceptedProposal = project.proposals.some(
        (proposal) =>
          proposal.status === "accepted" ||
          (proposal.negotiation && proposal.negotiation.status === "accepted")
      );
      if (hasAcceptedProposal) {
        return true;
      }
    }

    // Check if vendor has been awarded AND payment is required
    if (
      project.selectedVendorId &&
      project.status === "Awarded" &&
      project.negotiationAccepted
    ) {
      return true;
    }

    return false;
  };

  // Helper function to calculate tender deadline from createdAt + tenderDuration
  const calculateTenderDeadline = (createdAt, tenderDuration) => {
    if (!createdAt || !tenderDuration) {
      console.log("Missing createdAt or tenderDuration:", {
        createdAt,
        tenderDuration,
      });
      return null;
    }

    try {
      let startDate;

      // Parse createdAt to Date object
      if (createdAt?.toDate) {
        startDate = createdAt.toDate();
      } else if (typeof createdAt === "string") {
        startDate = new Date(createdAt);
      } else if (createdAt instanceof Date) {
        startDate = createdAt;
      } else if (typeof createdAt === "object" && createdAt.seconds) {
        // Firestore timestamp object format
        startDate = new Date(createdAt.seconds * 1000);
      } else {
        console.log("Invalid createdAt format:", createdAt);
        return null;
      }

      // Validate start date
      if (!startDate || isNaN(startDate.getTime())) {
        console.log("Invalid start date:", startDate);
        return null;
      }

      // Parse tender duration (e.g., "1 bulan", "2 minggu", "30 hari")
      const duration = tenderDuration.toLowerCase().trim();
      const deadline = new Date(startDate);

      console.log("Calculating deadline for:", {
        startDate: startDate.toISOString(),
        duration,
      });

      if (duration.includes("bulan")) {
        const months = parseInt(duration.match(/(\d+)/)?.[1] || 1);
        deadline.setMonth(deadline.getMonth() + months);
        console.log(
          `Added ${months} months, deadline:`,
          deadline.toISOString()
        );
      } else if (duration.includes("minggu")) {
        const weeks = parseInt(duration.match(/(\d+)/)?.[1] || 1);
        deadline.setDate(deadline.getDate() + weeks * 7);
        console.log(`Added ${weeks} weeks, deadline:`, deadline.toISOString());
      } else if (duration.includes("hari")) {
        const days = parseInt(duration.match(/(\d+)/)?.[1] || 1);
        deadline.setDate(deadline.getDate() + days);
        console.log(`Added ${days} days, deadline:`, deadline.toISOString());
      } else {
        // Try to parse as pure number (assume days)
        const numericValue = parseInt(duration.match(/(\d+)/)?.[1]);
        if (!isNaN(numericValue)) {
          deadline.setDate(deadline.getDate() + numericValue);
          console.log(
            `Added ${numericValue} numeric days, deadline:`,
            deadline.toISOString()
          );
        } else {
          console.log(
            "Could not parse tender duration, using 30 days default:",
            tenderDuration
          );
          // Default to 30 days (1 month)
          deadline.setDate(deadline.getDate() + 30);
        }
      }

      // Validate the calculated deadline
      if (isNaN(deadline.getTime())) {
        console.error("Invalid deadline calculated:", {
          createdAt,
          tenderDuration,
          startDate,
          deadline,
        });
        return null;
      }

      return deadline;
    } catch (error) {
      console.error("Error calculating tender deadline:", error);
      return null;
    }
  };

  // Helper function to calculate tender time left
  const getTenderTimeLeft = (project) => {
    // First try to calculate deadline from createdAt + tenderDuration if it's a tender project
    let deadline = null;

    if (
      project.procurementMethod === "Tender" &&
      project.createdAt &&
      project.tenderDuration
    ) {
      deadline = calculateTenderDeadline(
        project.createdAt,
        project.tenderDuration
      );
    }

    // Fallback to pre-existing deadline fields
    if (!deadline) {
      deadline = project.tenderDeadline || project.deadline;
    }

    if (!deadline) {
      return "No deadline set";
    }

    let deadlineDate;

    try {
      if (deadline?.toDate) {
        deadlineDate = deadline.toDate();
      } else if (typeof deadline === "string") {
        deadlineDate = new Date(deadline);
      } else if (deadline instanceof Date) {
        deadlineDate = deadline;
      } else if (typeof deadline === "object" && deadline.seconds) {
        deadlineDate = new Date(deadline.seconds * 1000);
      } else {
        deadlineDate = new Date(deadline);
      }

      const now = new Date();
      const diffMs = deadlineDate.getTime() - now.getTime();

      if (diffMs <= 0) {
        return "Deadline passed";
      }

      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor(
        (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );

      if (diffDays > 0) {
        return `${diffDays} day${diffDays > 1 ? "s" : ""} left`;
      } else if (diffHours > 0) {
        return `${diffHours} hour${diffHours > 1 ? "s" : ""} left`;
      } else {
        return "Less than 1 hour left";
      }
    } catch (error) {
      return "Invalid deadline";
    }
  };

  // Helper function to get the project status for display and logic
  const getProjectStatus = useCallback((project) => {
    console.log("Getting status for project:", project.id, {
      status: project.status,
      moderationStatus: project.moderationStatus,
      procurementMethod: project.procurementMethod,
      createdAt: project.createdAt,
      tenderDuration: project.tenderDuration,
      deadline: project.deadline,
    });

    // Draft Mode Statuses
    if (project.status === "Draft" || project.moderationStatus === "draft") {
      return "Dalam Proses"; // Owner still creates the project draft
    }

    if (
      project.moderationStatus === "pending" ||
      project.status === "Under Review" ||
      project.status === "Review"
    ) {
      return "Ditinjau"; // Owner clicks "Submit Draft"
    }

    if (
      project.moderationStatus === "rejected" ||
      project.status === "Revise" ||
      project.moderationStatus === "revision_required"
    ) {
      return "Revisi"; // Admin require project owner to edit/revise the project details
    }

    if (
      project.moderationStatus === "approved" &&
      project.procurementMethod !== "Tender"
    ) {
      return "Approve"; // Admin approve the project and it's live in Project Market Place
    }

    // Tender Mode Statuses
    if (
      project.moderationStatus === "approved" &&
      project.procurementMethod === "Tender"
    ) {
      // Check if tender is locked (less than 24 hours to deadline)
      const timeLeft = getTimeToDeadlineInHours(project);

      // Check if any proposal has been accepted (vendor accepted negotiation)
      const hasAcceptedProposal =
        project.proposals &&
        project.proposals.some(
          (proposal) =>
            proposal.status === "accepted" ||
            (proposal.negotiation && proposal.negotiation.status === "accepted")
        );

      // Get the selected vendor from accepted proposal
      const selectedVendor = project.proposals?.find(
        (proposal) =>
          proposal.status === "accepted" ||
          (proposal.negotiation && proposal.negotiation.status === "accepted")
      );

      console.log("Tender time analysis:", {
        timeLeft,
        hasNegotiationOffer: project.hasNegotiationOffer,
        selectedVendorId: project.selectedVendorId,
        negotiationAccepted: project.negotiationAccepted,
        paymentCompleted: project.paymentCompleted,
        initialPaymentCompleted: project.initialPaymentCompleted,
        hasAcceptedProposal,
        selectedVendor: selectedVendor
          ? {
              id: selectedVendor.vendorId,
              status: selectedVendor.status,
              negotiationStatus: selectedVendor.negotiation?.status,
            }
          : null,
      });

      // Check if vendor was awarded/selected (negotiation was accepted)
      if (
        project.selectedVendorId ||
        project.status === "Awarded" ||
        project.negotiationAccepted ||
        hasAcceptedProposal
      ) {
        // Set the selected vendor ID if not already set
        if (!project.selectedVendorId && selectedVendor) {
          project.selectedVendorId = selectedVendor.vendorId;
        }

        // If first payment (termin 1 & 2) is completed, project is ongoing
        if (
          project.firstPaymentCompleted === true ||
          project.initialPaymentCompleted === true
        ) {
          return "Berjalan"; // Project started, work in progress
        }
        // If vendor is selected but payment not completed, show payment needed
        return "Diberikan"; // Show awarded status with payment needed
      }

      // Check for active negotiation status (vendor hasn't accepted yet)
      if (
        project.hasNegotiationOffer ||
        project.status === "Negotiate" ||
        project.status === "negotiation" ||
        project.negotiationStatus === "active" ||
        (project.proposals &&
          project.proposals.some(
            (proposal) =>
              proposal.status === "negotiating" ||
              proposal.status === "negotiate" ||
              proposal.status === "counter_offer" ||
              proposal.status === "resubmitted" ||
              proposal.status === "negotiated" ||
              proposal.status === "pending_review" ||
              (proposal.negotiation &&
                proposal.negotiation.status === "pending")
          ))
      ) {
        // Only show negotiate if negotiation hasn't been accepted yet
        if (!project.negotiationAccepted && !hasAcceptedProposal) {
          return "Negosiasi";
        }
        // If negotiation was accepted, fall through to check other conditions
      }

      if (timeLeft !== null) {
        if (timeLeft <= 24 && timeLeft > 0) {
          return "Terkunci"; // Locked if less than 24 hours to deadline
        }
        if (timeLeft <= 0) {
          return "Gagal"; // No winner chosen until deadline
        }
      }

      return "Terbuka"; // Default for approved tender projects
    }

    // Default fallback
    console.log(
      "Using fallback status for project:",
      project.id,
      project.status
    );
    return project.status || "Dalam Proses";
  }, []);

  // Helper function to calculate hours to deadline
  const getTimeToDeadlineInHours = (project) => {
    // First try to calculate deadline from createdAt + tenderDuration if it's a tender project
    let deadline = null;

    if (
      project.procurementMethod === "Tender" &&
      project.createdAt &&
      project.tenderDuration
    ) {
      deadline = calculateTenderDeadline(
        project.createdAt,
        project.tenderDuration
      );
    }

    // Fallback to pre-existing deadline fields
    if (!deadline) {
      deadline = project.tenderDeadline || project.deadline;
    }

    if (!deadline) return null;

    try {
      let deadlineDate;

      if (deadline instanceof Date) {
        deadlineDate = deadline;
      } else if (deadline?.toDate) {
        deadlineDate = deadline.toDate();
      } else if (typeof deadline === "string") {
        deadlineDate = new Date(deadline);
      } else if (typeof deadline === "object" && deadline.seconds) {
        deadlineDate = new Date(deadline.seconds * 1000);
      } else {
        return null;
      }

      if (!deadlineDate || isNaN(deadlineDate.getTime())) {
        return null;
      }

      const now = new Date();
      const diffTime = deadlineDate.getTime() - now.getTime();
      return diffTime / (1000 * 60 * 60); // Convert to hours
    } catch (error) {
      console.error("Error calculating time to deadline:", error);
      return null;
    }
  };

  // Helper function to determine project phase
  const getProjectPhase = (project) => {
    const status = getProjectStatus(project);

    // Draft Phase: In Progress, Review, Revise, Approved
    if (["Dalam Proses", "Ditinjau", "Revisi", "Approve"].includes(status)) {
      return "Draft";
    }

    // Tender Phase: Open, Locked, Negotiate, Awarded, Failed
    if (["Open", "Locked", "Negotiate", "Awarded", "Failed"].includes(status)) {
      return "Tender";
    }

    // Bid Phase: Submitted, Won, Lost, Revised, Withdrawn
    if (
      ["Submitted", "Won", "Lost", "Revised", "Withdrawn", "On Going"].includes(
        status
      )
    ) {
      return "Bid";
    }

    // Default fallback
    return "Draft";
  };

  // Helper function to determine action button based on status
  const getActionButton = (project) => {
    const projectStatus = getProjectStatus(project);

    switch (projectStatus) {
      case "Dalam Proses":
        return (
          <div className="flex items-stretch gap-3 w-full">
            {/* Enhanced In Progress Status Card */}
            <div className="bg-white border border-gray-600 rounded-lg p-3 flex-1 h-[80px] flex flex-col justify-center">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <span className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                    Phase: {getProjectPhase(project)}
                  </span>
                </div>
                <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
              </div>

              <div className="text-sm font-semibold text-gray-800">
                Status: {getDisplayStatus(project)}
              </div>

              <div className="text-xs text-gray-600 mt-1">
                {/* Continue editing */}
              </div>
            </div>

            {/* Stacked Action Buttons */}
            <div className="flex flex-col gap-2 flex-1">
              {/* Edit Project Button */}
              <button
                onClick={() => handleEditProject(project)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors duration-200 flex items-center justify-center gap-2 whitespace-nowrap h-[36px]"
              >
                <FiEdit className="w-4 h-4" />
                Edit Proyek
              </button>

              {/* Delete Project Button */}
              <button
                onClick={() => handleDeleteProject(project)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors duration-200 flex items-center justify-center gap-2 whitespace-nowrap h-[36px]"
              >
                <FiTrash2 className="w-4 h-4" />
                Hapus Proyek
              </button>
            </div>
          </div>
        );

      case "Ditinjau":
        return (
          <div className="flex items-stretch gap-3 w-full">
            {/* Enhanced Review Status Card */}
            <div className="bg-white border border-gray-600 rounded-lg p-3 flex-1 h-[80px] flex flex-col justify-center">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <span className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                    Phase: {getProjectPhase(project)}
                  </span>
                </div>
                <div className="flex space-x-1">
                  <div className="w-1 h-1 bg-gray-600 rounded-full animate-pulse"></div>
                  <div
                    className="w-1 h-1 bg-gray-600 rounded-full animate-pulse"
                    style={{ animationDelay: "0.5s" }}
                  ></div>
                  <div
                    className="w-1 h-1 bg-gray-600 rounded-full animate-pulse"
                    style={{ animationDelay: "1s" }}
                  ></div>
                </div>
              </div>

              <div className="text-sm font-semibold text-gray-800">
                Status: {getDisplayStatus(project)}
              </div>

              <div className="text-xs text-gray-600 mt-1">
                {/* Admin approval pending */}
              </div>
            </div>

            {/* Modern Disabled Button */}
            <button
              disabled
              className="bg-gray-300 text-gray-500 px-4 py-2 rounded-lg font-medium text-sm cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap flex-1 h-[80px]"
              title="Wait Admin To Approve"
            >
              <FiClock className="w-4 h-4" />
              Menunggu Tinjauan
            </button>
          </div>
        );

      case "Revisi":
        return (
          <div className="flex items-stretch gap-3 w-full">
            {/* Enhanced Revision Status Card */}
            <div className="bg-white border border-gray-600 rounded-lg p-3 flex-1 h-[80px] flex flex-col justify-center">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <span className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                    Phase: {getProjectPhase(project)}
                  </span>
                </div>
                <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"></div>
              </div>

              <div className="text-sm font-semibold text-gray-800">
                Status: {getDisplayStatus(project)}
              </div>

              <div className="text-xs text-gray-600 mt-1">
                {/* Admin feedback received */}
              </div>
            </div>

            {/* Modern Action Button */}
            <button
              onClick={() => handleEditProject(project)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors duration-200 border border-blue-600 flex items-center justify-center gap-2 whitespace-nowrap flex-1 h-[80px]"
              title={
                project.adminNotes ||
                "Admin requires revision. Please check admin notes for details."
              }
            >
              <FiEdit className="w-4 h-4" />
              Perbaiki & Kirim Ulang
            </button>
          </div>
        );

      case "Approve":
        return (
          <div className="flex items-stretch gap-3 w-full">
            {/* Enhanced Approved Status Card */}
            <div className="bg-white border border-gray-600 rounded-lg p-3 flex-1 h-[80px] flex flex-col justify-center">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <span className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                    Phase: {getProjectPhase(project)}
                  </span>
                </div>
              </div>

              <div className="text-sm font-semibold text-gray-800">
                Status: {getDisplayStatus(project)}
              </div>

              <div className="text-xs text-gray-600 mt-1">
                {/* Receiving proposals */}
              </div>
            </div>

            {/* Modern Action Button */}
            <button
              onClick={() => handleViewProject(project)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors duration-200 border border-blue-600 flex items-center justify-center gap-2 whitespace-nowrap flex-1 h-[80px]"
            >
              <FiExternalLink className="w-4 h-4" />
              View Details
            </button>
          </div>
        );

      case "Terbuka":
        const timeLeft = getTenderTimeLeft(project);
        return (
          <div className="flex items-stretch gap-3 w-full">
            {/* Enhanced Tender Status Card */}
            <div className="bg-white border border-gray-600 rounded-lg p-3 flex-1 h-[80px] flex flex-col justify-center">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <span className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                    Phase: {getProjectPhase(project)}
                  </span>
                </div>
              </div>

              <div className="text-sm font-semibold text-gray-800">
                Status: {getDisplayStatus(project)}
              </div>

              <div className="text-xs text-gray-600 mt-1">{timeLeft}</div>
            </div>

            {/* Modern Action Button */}
            <button
              onClick={() => handleViewProject(project)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors duration-200 border border-blue-600 flex items-center justify-center gap-2 whitespace-nowrap flex-1 h-[80px]"
            >
              <FiExternalLink className="w-4 h-4" />
              View Details
            </button>
          </div>
        );

      case "Terkunci":
        const lockedTimeLeft = getTenderTimeLeft(project);
        return (
          <div className="flex items-stretch gap-3 w-full">
            {/* Enhanced Locked Status Card */}
            <div className="bg-white border border-gray-600 rounded-lg p-3 flex-1 h-[80px] flex flex-col justify-center">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <span className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                    Phase: {getProjectPhase(project)}
                  </span>
                </div>
                <div className="w-2 h-2 bg-gray-600 rounded-full animate-pulse"></div>
              </div>

              <div className="text-sm font-semibold text-gray-800">
                Status: {getDisplayStatus(project)}
              </div>

              <div className="text-xs text-gray-600 mt-1">{lockedTimeLeft}</div>
            </div>

            {/* Modern Action Button */}
            <button
              onClick={() => handleViewProject(project)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors duration-200 border border-blue-600 flex items-center justify-center gap-2 whitespace-nowrap flex-1 h-[80px]"
            >
              <FiLock className="w-4 h-4" />
              View Details
            </button>
          </div>
        );

      case "Negosiasi":
        return (
          <div className="flex items-stretch gap-3 w-full">
            {/* Enhanced Negotiation Status Card */}
            <div className="bg-white border border-gray-600 rounded-lg p-3 flex-1 h-[80px] flex flex-col justify-center">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <span className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                    Phase: {getProjectPhase(project)}
                  </span>
                </div>
                <div className="flex space-x-1">
                  <div className="w-1 h-1 bg-gray-600 rounded-full animate-bounce"></div>
                  <div
                    className="w-1 h-1 bg-gray-600 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-1 h-1 bg-gray-600 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>

              <div className="text-sm font-semibold text-gray-800">
                Status: {getDisplayStatus(project)}
              </div>

              <div className="text-xs text-gray-600 mt-1">
                {/* Vendor selected */}
              </div>
            </div>

            {/* Modern Action Button */}
            <button
              onClick={() => handleViewOffers(project)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors duration-200 border border-blue-600 flex items-center justify-center gap-2 whitespace-nowrap flex-1 h-[80px]"
            >
              <FiMessageSquare className="w-4 h-4" />
              Lihat Penawaran
            </button>
          </div>
        );

      case "Diberikan":
        return (
          <div className="flex items-stretch gap-3 w-full">
            {/* Enhanced Payment Status Card */}
            <div className="bg-white border border-gray-600 rounded-lg p-3 flex-1 h-[80px] flex flex-col justify-center">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <span className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                    Phase: {getProjectPhase(project)}
                  </span>
                </div>
                <div className="w-2 h-2 bg-gray-600 rounded-full animate-ping"></div>
              </div>

              <div className="text-sm font-semibold text-gray-800">
                Status: {getDisplayStatus(project)}
              </div>

              <div className="text-xs text-gray-600 mt-1">
                {/* Pay first 2 terms to start project */}
              </div>
            </div>

            {/* Dynamic Payment Button */}
            {getPaymentButton(project)}
          </div>
        );

      case "Gagal":
        return (
          <div className="flex items-stretch gap-3 w-full">
            {/* Enhanced Failed Status Card */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex-1 h-[80px] flex flex-col justify-center">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <span className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                    Phase: {getProjectPhase(project)}
                  </span>
                </div>
              </div>

              <div className="text-sm font-semibold text-gray-800">
                Status: {getDisplayStatus(project)}
              </div>

              <div className="text-xs text-gray-600 mt-1">
                {/* Tender ended */}
              </div>
            </div>

            {/* Resubmit Button Only */}
            <button
              onClick={() => handleResubmitProject(project)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2 whitespace-nowrap flex-1 h-[80px]"
            >
              <FiRefreshCw className="w-4 h-4" />
              Kirim Ulang
            </button>
          </div>
        );

      case "Berjalan":
        return (
          <div className="flex items-stretch gap-3 w-full">
            {/* Enhanced Ongoing Status Card */}
            <div className="bg-white border border-gray-600 rounded-lg p-3 flex-1 h-[80px] flex flex-col justify-center">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <span className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                    Phase: {getProjectPhase(project)}
                  </span>
                </div>
              </div>

              <div className="text-sm font-semibold text-gray-800">
                Status: {getDisplayStatus(project)}
              </div>

              <div className="text-xs text-gray-600 mt-1">
                {/* Work in progress */}
              </div>
            </div>

            {/* Modern Action Button */}
            <button
              onClick={() => handleViewProject(project)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors duration-200 border border-blue-600 flex items-center justify-center gap-2 whitespace-nowrap flex-1 h-[80px]"
            >
              <FiExternalLink className="w-4 h-4" />
              Pantau Progres
            </button>
          </div>
        );

      case "Selesai":
        return (
          <div className="flex items-stretch gap-3 w-full">
            {/* Enhanced Completed Status Card */}
            <div className="bg-white border border-gray-600 rounded-lg p-3 flex-1 h-[80px] flex flex-col justify-center">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <span className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                    Phase: {getProjectPhase(project)}
                  </span>
                </div>
              </div>

              <div className="text-sm font-semibold text-gray-800">
                Status: {getDisplayStatus(project)}
              </div>

              <div className="text-xs text-gray-600 mt-1">
                {/* Successfully delivered */}
              </div>
            </div>

            {/* Modern Action Button */}
            <button
              onClick={() => handleViewProject(project)}
              className="bg-white hover:bg-gray-100 text-gray-800 px-4 py-2 rounded-lg font-medium text-sm transition-colors duration-200 border border-gray-600 flex items-center justify-center gap-2 whitespace-nowrap flex-1 h-[80px]"
            >
              <FiExternalLink className="w-4 h-4" />
              Lihat Hasil
            </button>
          </div>
        );

      default:
        return (
          <div className="flex items-stretch gap-3 w-full">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex-1 h-[80px] flex flex-col justify-center">
              <div className="text-sm font-semibold text-gray-800">
                Project Details
              </div>
              <div className="text-xs text-gray-600 mt-1">
                View project information
              </div>
            </div>
            <button
              onClick={() => handleViewProject(project)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2 whitespace-nowrap flex-1 h-[80px]"
            >
              <FiExternalLink className="w-4 h-4" />
              View Details
            </button>
          </div>
        );
    }
  };

  // Helper function to get status color
  const getStatusColor = (project) => {
    const projectStatus = getProjectStatus(project);

    switch (projectStatus) {
      case "Draft":
        return "#6B7280"; // Gray color for drafts
      case "Ditinjau":
        return "#F59E0B"; // Orange for pending/review
      case "Revisi":
        return "#EF4444"; // Red for revision required
      case "Approve":
        return "#8B5CF6"; // Purple for approved
      case "Terbuka":
        return "#10B981"; // Green for open tender
      case "Terkunci":
        return "#F59E0B"; // Orange for locked tender
      case "Negosiasi":
        return "#8B5CF6"; // Purple for negotiation
      case "Diberikan":
        return "#EF4444"; // Red for payment needed
      case "Berjalan":
        return "#2373FF"; // Blue for in progress/ongoing
      case "Gagal":
        return "#6B7280"; // Gray for failed
      case "Menunggu Persetujuan":
      case "Pending Approval":
      case "Under Review":
        return "#F59E0B"; // Orange for pending/review
      case "Active":
      case "Open for Tender":
        return "#10B981"; // Green for active/open
      case "Selesai":
        return "#10B981"; // Green for completed
      case "Rejected":
        return "#EF4444"; // Red for rejected
      default:
        return "#2373FF"; // Default blue
    }
  };

  const sortOptions = ["Terbaru", "Terlama", "A-Z", "Z-A"];
  const filterOptions = [
    "Semua",
    "Draft",
    "Ditinjau",
    "Revisi",
    "Terbuka",
    "Terkunci",
    "Negosiasi",
    "Diberikan",
    "Berjalan",
    "Selesai",
    "Gagal",
  ];

  // Filter projects based on internal project filter and dropdown filter
  const getFilteredProjects = () => {
    let filtered = projects;

    // First apply the tab filter (Draft, Tender, Contract, etc.)
    const currentTabFilter = activeProjectFilter || activeProjectTab;

    if (currentTabFilter && currentTabFilter !== "Semua") {
      filtered = filtered.filter((project) => {
        switch (currentTabFilter) {
          case "Dalam Proses":
            return (
              project.status === "Draft" ||
              project.isDraft === true ||
              project.moderationStatus === "draft"
            );
          case "Tender":
            // Only show projects that are available for bidding (not awarded)
            return (
              project.procurementMethod === "Tender" &&
              project.status !== "awarded" &&
              project.status !== "Draft" && // Exclude drafts
              project.isAvailableForBidding !== false &&
              !project.selectedVendorId
            );
          case "Kontrak":
            return (
              project.procurementMethod === "Contract" &&
              project.status !== "Draft"
            );
          case "Negosiasi":
            return (
              project.procurementMethod === "Negotiation" &&
              project.status !== "Draft"
            );
          case "Penunjukan Langsung":
            return (
              project.procurementMethod === "Penunjukan Langsung" &&
              project.status !== "Draft"
            );
          case "Diberikan":
            // Show projects that have been awarded to vendors
            return (
              (project.status === "awarded" || project.selectedVendorId) &&
              project.status !== "Draft"
            );
          default:
            return true;
        }
      });
    }

    // Then apply the dropdown filter (by status)
    if (filterBy && filterBy !== "Semua") {
      filtered = filtered.filter((project) => {
        const projectStatus = getProjectStatus(project);
        return projectStatus === filterBy;
      });
    }

    // Apply sorting
    if (sortBy) {
      filtered = [...filtered].sort((a, b) => {
        switch (sortBy) {
          case "Terbaru":
            // Sort by creation date, most recent first
            const aDate = a.createdAt?.toDate
              ? a.createdAt.toDate()
              : new Date(a.createdAt || 0);
            const bDate = b.createdAt?.toDate
              ? b.createdAt.toDate()
              : new Date(b.createdAt || 0);
            return bDate.getTime() - aDate.getTime();
          case "Terlama":
            // Sort by creation date, oldest first
            const aDateOld = a.createdAt?.toDate
              ? a.createdAt.toDate()
              : new Date(a.createdAt || 0);
            const bDateOld = b.createdAt?.toDate
              ? b.createdAt.toDate()
              : new Date(b.createdAt || 0);
            return aDateOld.getTime() - bDateOld.getTime();
          case "A-Z":
            // Sort by title alphabetically
            const aTitle = (a.title || a.projectTitle || "").toLowerCase();
            const bTitle = (b.title || b.projectTitle || "").toLowerCase();
            return aTitle.localeCompare(bTitle);
          case "Z-A":
            // Sort by title reverse alphabetically
            const aTitleRev = (a.title || a.projectTitle || "").toLowerCase();
            const bTitleRev = (b.title || b.projectTitle || "").toLowerCase();
            return bTitleRev.localeCompare(aTitleRev);
          default:
            return 0;
        }
      });
    }

    return filtered;
  };

  const filteredProjects = getFilteredProjects();

  // Get the current tab display name
  const getTabDisplayName = () => {
    const currentFilter = activeProjectFilter || activeProjectTab;
    const statusFilter =
      filterBy && filterBy !== "Semua" ? ` - ${filterBy}` : "";

    if (!currentFilter || currentFilter === "Semua") {
      return `Semua Proyek${statusFilter}`;
    }
    return `Proyek ${currentFilter}${statusFilter}`;
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FiLoader
          className="animate-spin h-12 w-12"
          style={{ color: "#2373FF" }}
        />
        <span className="ml-3 text-gray-600">Memuat proyek...</span>
      </div>
    );
  }

  // Show project detail view
  if (showDetailsView && selectedProject) {
    return (
      <ProjectOwnerDetailPage
        project={selectedProject}
        onBack={handleBackToList}
        onEditProject={handleEditProject}
        onProjectUpdate={handleProjectUpdate}
      />
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header with All Project text and buttons */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {getTabDisplayName()}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Menampilkan {filteredProjects.length} dari {projects.length} proyek
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Clear Filters Button - show when filters are applied */}
          {(filterBy !== "Semua" || sortBy !== "Terbaru") && (
            <button
              onClick={() => {
                setFilterBy("Semua");
                setSortBy("Terbaru");
              }}
              className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
            >
              <FiX className="w-4 h-4 mr-1" />
              Hapus
            </button>
          )}

          {/* Sort Button */}
          <div className="relative" ref={sortDropdownRef}>
            <button
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <MdSort className="w-4 h-4 mr-2" />
              Urut: {sortBy}
              <FiChevronDown className="w-4 h-4 ml-1" />
            </button>

            {showSortDropdown && (
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                {sortOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setSortBy(option);
                      setShowSortDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                      sortBy === option ? "text-white" : "text-gray-700"
                    } ${option === sortOptions[0] ? "rounded-t-lg" : ""} ${
                      option === sortOptions[sortOptions.length - 1]
                        ? "rounded-b-lg"
                        : ""
                    }`}
                    style={
                      sortBy === option ? { backgroundColor: "#2373FF" } : {}
                    }
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Filter Button */}
          <div className="relative" ref={filterDropdownRef}>
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <FiFilter className="w-4 h-4 mr-2" />
              Filter: {filterBy}
              <FiChevronDown className="w-4 h-4 ml-1" />
            </button>

            {showFilterDropdown && (
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                {filterOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setFilterBy(option);
                      setShowFilterDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                      filterBy === option ? "text-white" : "text-gray-700"
                    } ${option === filterOptions[0] ? "rounded-t-lg" : ""} ${
                      option === filterOptions[filterOptions.length - 1]
                        ? "rounded-b-lg"
                        : ""
                    }`}
                    style={
                      filterBy === option ? { backgroundColor: "#2373FF" } : {}
                    }
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Create New Project Button */}
          <button
            onClick={handleCreateProject}
            className="flex items-center justify-center text-white w-10 h-10 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
            style={{ backgroundColor: "#2373FF" }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#1d63ed")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "#2373FF")}
          >
            <FiPlus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Project Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto">
        {projectFilterTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveProjectFilter(tab === "Semua" ? null : tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeProjectFilter === tab ||
              (tab === "Semua" && !activeProjectFilter)
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
            style={
              activeProjectFilter === tab ||
              (tab === "Semua" && !activeProjectFilter)
                ? { backgroundColor: "#2373FF" }
                : {}
            }
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Projects List */}
      <div>
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-300">
            <p className="text-gray-500">Tidak ada proyek yang ditemukan</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-lg shadow-sm border border-gray-300 overflow-hidden hover:shadow-md transition-all duration-200 hover:-translate-y-1 flex flex-col relative"
              >
                {/* Delete Icon for Failed Projects - Absolute Top Right Corner */}
                {getProjectStatus(project) === "Failed" && (
                  <button
                    onClick={() => handleDeleteProject(project)}
                    className="absolute top-2 right-2 p-1.5 rounded-full hover:bg-red-100 transition-colors duration-200 group z-20"
                    title="Delete Failed Project"
                  >
                    <FiTrash2 className="w-3.5 h-3.5 text-gray-400 group-hover:text-red-600" />
                  </button>
                )}

                <div className="p-6 flex flex-col">
                  {/* Project ID */}
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-1">Project ID</p>
                    <p className="text-sm font-mono text-gray-800 font-medium">
                      {project.customId || `#${project.id}`}
                    </p>
                  </div>

                  {/* Project Header */}
                  <div className="mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-black mb-1 truncate">
                        {project.title || project.projectTitle}
                      </h3>
                      <p className="text-sm text-gray-600 truncate">
                        {project.marketplace?.location?.city ||
                          project.city ||
                          "Unknown Location"}
                        , Indonesia
                      </p>
                    </div>

                    {/* Progress Bar under name */}
                    <div className="mt-3">
                      {isProjectStarted(project) &&
                      project.progress &&
                      project.progress > 0 ? (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-gray-700">
                              Progress Proyek
                            </span>
                            <span className="text-xs text-gray-600">
                              {project.progress}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-4">
                            <div
                              className="h-4 rounded-full transition-all duration-300"
                              style={{
                                width: `${project.progress}%`,
                                backgroundColor: "#2373FF",
                              }}
                            ></div>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-gray-700">
                              Progress Proyek
                            </span>
                            <span className="text-xs text-gray-600">0%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-4 relative">
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-xs text-gray-500 font-medium">
                                Proyek Belum Mulai
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Project Details */}
                  <div>
                    <div className="space-y-4">
                      {/* Anggaran */}
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Anggaran</p>
                        <p className="text-base font-bold text-black">
                          {formatBudget(
                            project.marketplace?.budget ||
                              project.estimatedBudget ||
                              project.budget
                          )}
                        </p>
                      </div>

                      {/* Jenis Proyek & Properti */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            Jenis Proyek
                          </p>
                          <p className="text-sm font-bold text-black">
                            {project.projectType || "Not specified"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Properti</p>
                          <p className="text-sm font-bold text-black">
                            {project.propertyType || "Not specified"}
                          </p>
                        </div>
                      </div>

                      {/* Ruang Lingkup & Metode Pengadaan */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            Ruang Lingkup
                          </p>
                          <p className="text-sm font-bold text-black">
                            {(project.projectScope || project.scope || [])
                              .length > 0
                              ? (project.projectScope || project.scope || [])[0]
                              : "No scope"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            Metode Pengadaan
                          </p>
                          <p className="text-sm font-bold text-black">
                            {project.procurementMethod === "Tender"
                              ? "Tender"
                              : project.procurementMethod ===
                                "Penunjukan Langsung"
                              ? "Langsung"
                              : "Langsung"}
                          </p>
                        </div>
                      </div>

                      {/* Durasi Tender, Durasi Proyek, Estimasi Mulai, Pemilik Proyek - 4 columns in one row */}
                      <div className="grid grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            Durasi Tender
                          </p>
                          <p className="text-sm font-bold text-black">
                            {project.tenderDuration || "Not specified"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            Durasi Proyek
                          </p>
                          <p className="text-sm font-bold text-black">
                            {project.estimatedDuration || "Not specified"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            Estimasi Mulai
                          </p>
                          <p className="text-sm font-bold text-black">
                            {project.estimatedStartDate
                              ? new Date(
                                  project.estimatedStartDate
                                ).toLocaleDateString("id-ID", {
                                  year: "numeric",
                                  month: "long",
                                })
                              : "Not specified"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            Pemilik Proyek
                          </p>
                          <p className="text-sm font-bold text-black">
                            {getCompanyName(project)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex-shrink-0 mt-5">
                    {getActionButton(project)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Removed Enhanced Project Detail Modal - now using in-page view */}

      <XenditPaymentModal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setSelectedProposalForPayment(null);
        }}
        projectData={selectedProposalForPayment?.projectData}
        selectedProposal={selectedProposalForPayment?.proposal}
        proposalIndex={selectedProposalForPayment?.proposalIndex}
        onPaymentSuccess={async (paymentData) => {
          console.log("🎉 Payment successful:", paymentData);

          // Update project status to "Berjalan" after successful first payment
          if (
            selectedProposalForPayment?.projectData?.paymentType ===
            "first_payment"
          ) {
            try {
              const projectId = selectedProposalForPayment.projectData.id;
              const paymentTitle =
                selectedProposalForPayment.projectData.paymentTitle ||
                "Termin 1 & 2";
              const paymentIndex =
                selectedProposalForPayment.projectData.paymentIndex || 0;

              // Get existing payments array or convert old payment structure
              const currentProject = selectedProposalForPayment.projectData;
              let existingPayments = currentProject.payments || [];

              // If there's an old single payment structure, convert it to array
              if (currentProject.payment && !currentProject.payments) {
                existingPayments = [currentProject.payment];
              }

              // Create new payment object
              const newPayment = {
                title: paymentTitle,
                paymentType: "first_payment",
                status: "pending", // Will be updated by webhook when actually paid
                externalId: paymentData.external_id,
                invoiceId: paymentData.invoice_id,
                invoiceUrl: paymentData.invoice_url,
                createdAt: new Date(),
                amount:
                  selectedProposalForPayment.projectData.firstPaymentAmount,
                description: `Pembayaran ${paymentTitle} - ${
                  currentProject.projectTitle || currentProject.title
                }`,
              };

              // Add new payment to the array
              const updatedPayments = [...existingPayments];
              if (paymentIndex < updatedPayments.length) {
                // Replace existing payment at index
                updatedPayments[paymentIndex] = newPayment;
              } else {
                // Add new payment
                updatedPayments.push(newPayment);
              }

              const paymentInfo = {
                payments: updatedPayments,
                // Keep old structure for backward compatibility
                payment: newPayment,
                paymentInitiated: true,
                paymentInitiatedAt: new Date(),
                // Don't set firstPaymentCompleted yet - wait for webhook
                updatedAt: new Date(),
              };

              // Update project in Firestore with payment tracking info
              await updateDoc(doc(db, "projects", projectId), paymentInfo);

              console.log(
                "✅ Payment initiated and tracked, waiting for webhook confirmation"
              );

              alert(
                "💳 Pembayaran telah dibuat!\n\n" +
                  `✓ Invoice pembayaran telah dibuat\n` +
                  `✓ Status akan diperbarui otomatis setelah pembayaran dikonfirmasi\n` +
                  `✓ Silakan selesaikan pembayaran di tab yang baru dibuka\n\n` +
                  "Proyek akan berubah status menjadi 'Berjalan' setelah pembayaran terkonfirmasi."
              );
            } catch (error) {
              console.error("❌ Error updating payment tracking:", error);
              alert(
                "⚠️ Pembayaran telah dibuat, tetapi gagal menyimpan informasi tracking.\n" +
                  "Silakan hubungi support untuk memperbarui status proyek secara manual."
              );
            }
          } else {
            alert(
              "🎉 Pembayaran berhasil! Silakan cek email Anda untuk detail pembayaran."
            );
          }

          // Close modal
          setShowPaymentModal(false);
          setSelectedProposalForPayment(null);
        }}
        onPaymentError={(error) => {
          console.error("❌ Payment failed:", error);
          alert("Pembayaran gagal: " + error);
        }}
      />
    </div>
  );
}
