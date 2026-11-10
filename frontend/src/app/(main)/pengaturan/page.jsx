'use client';

import { useState, useEffect } from 'react';
import {
  Layers,
  GitFork,
  Scale,
  Package,
  CheckCircle2,
  CheckCircle,
  ShieldCheck,
  Clock,
  Plus,
  Sprout,
  Archive,
  Utensils,
  Bug,
  Camera,
  FileText,
  Pencil,
  Trash2,
  AlertTriangle,
  RefreshCw,
  X,
  Check,
  ChevronRight,
  Info,
} from 'lucide-react';

/**
 * Toggle Switch Component
 */
function ToggleSwitch({ active, onToggle, ariaLabel }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={active}
      aria-label={ariaLabel}
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176B4D] focus-visible:ring-offset-2 ${
        active ? 'bg-[#176B4D]' : 'bg-[#E5EAE7]'
      }`}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
          active ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

/**
 * Pulse Skeleton for Settings Page
 */
function PengaturanSkeleton() {
  return (
    <div className="space-y-6 animate-pulse bg-white" aria-busy="true" aria-label="Memuat pengaturan master data">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div className="space-y-2">
          <div className="h-4 w-72 bg-gray-200 rounded" />
          <div className="h-7 w-80 bg-gray-200 rounded-lg" />
          <div className="h-4 w-96 bg-gray-100 rounded" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-9 w-32 bg-gray-200 rounded-xl" />
          <div className="h-9 w-32 bg-gray-200 rounded-xl" />
        </div>
      </div>

      {/* 4 KPI Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-5 rounded-2xl bg-white border border-[#E5EAE7] space-y-3">
            <div className="h-4 w-28 bg-gray-200 rounded" />
            <div className="h-7 w-36 bg-gray-300 rounded" />
            <div className="h-3 w-40 bg-gray-100 rounded" />
          </div>
        ))}
      </div>

      {/* Section 1 Skeleton */}
      <div className="p-6 rounded-2xl bg-white border border-[#E5EAE7] space-y-4 mt-6">
        <div className="h-6 w-56 bg-gray-200 rounded" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 w-full bg-gray-100 rounded-xl" />
          ))}
        </div>
      </div>

      {/* Section 2 Skeleton */}
      <div className="p-6 rounded-2xl bg-white border border-[#E5EAE7] space-y-4 mt-6">
        <div className="h-6 w-56 bg-gray-200 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-48 bg-gray-100 rounded-xl" />
          <div className="h-48 bg-gray-100 rounded-xl" />
        </div>
      </div>

      {/* Section 3 Skeleton */}
      <div className="p-6 rounded-2xl bg-white border border-[#E5EAE7] space-y-4 mt-6">
        <div className="h-6 w-56 bg-gray-200 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="h-20 bg-gray-100 rounded-xl" />
          <div className="h-20 bg-gray-100 rounded-xl" />
          <div className="h-20 bg-gray-100 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export default function PengaturanPage() {
  // State for loaded data
  const [kpiCards, setKpiCards] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pathways, setPathways] = useState([]);
  const [parameters, setParameters] = useState({
    toleransiMassa: 2.5,
    maksimalWaktuJam: 12,
    satuanBaku: 'Kilogram (kg)',
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // Modal / Drawer state for adding category
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [modalForm, setModalForm] = useState({
    nama: '',
    deskripsi: '',
    badge1: '',
    badge2: '',
  });

  // Parameter validation errors
  const [paramErrors, setParamErrors] = useState({});

  // Toast feedback
  const [toast, setToast] = useState(null);

  /**
   * Fetch data dynamically from /data/pengaturan-master.json
   */
  useEffect(() => {
    let active = true;

    async function fetchSettingsData() {
      try {
        const response = await fetch('/data/pengaturan-master.json', {
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Gagal memuat pengaturan master (HTTP ${response.status})`);
        }

        const json = await response.json();
        if (active) {
          setKpiCards(json.kpiCards || []);
          setCategories(json.kategoriMaterial || []);
          setPathways(json.jalurPemanfaatan || []);
          if (json.parameterTeknis) {
            setParameters(json.parameterTeknis);
          }
          setIsLoading(false);
          setError(null);
        }
      } catch (err) {
        if (active) {
          console.error('Fetch settings error:', err);
          setError(err?.message || 'Terjadi gangguan saat mengambil data pengaturan master.');
          setIsLoading(false);
        }
      }
    }

    fetchSettingsData();

    return () => {
      active = false;
    };
  }, [retryCount]);

  /**
   * Functional Retry Action
   */
  const handleRetry = () => {
    setIsLoading(true);
    setError(null);
    setRetryCount((prev) => prev + 1);
  };

  /**
   * Toggle Category Active / Nonaktif
   */
  const handleToggleCategory = (id) => {
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id === id) {
          const newStatus = !cat.active;
          setToast({
            type: 'info',
            message: `Kategori "${cat.nama}" diubah ke status ${newStatus ? 'Aktif' : 'Nonaktif'}.`,
          });
          setTimeout(() => setToast(null), 3000);
          return { ...cat, active: newStatus };
        }
        return cat;
      })
    );
  };

  /**
   * Toggle Pathway Active
   */
  const handleTogglePathway = (id) => {
    setPathways((prev) =>
      prev.map((pw) => {
        if (pw.id === id) {
          const newStatus = !pw.active;
          setToast({
            type: 'info',
            message: `Jalur "${pw.nama}" dialihkan ke status ${newStatus ? 'Aktif' : 'Nonaktif'}.`,
          });
          setTimeout(() => setToast(null), 3000);
          return { ...pw, active: newStatus };
        }
        return pw;
      })
    );
  };

  /**
   * Delete Category Action
   */
  const handleDeleteCategory = (cat) => {
    setCategories((prev) => prev.filter((c) => c.id !== cat.id));
    setToast({
      type: 'warning',
      message: `Kategori "${cat.nama}" berhasil dihapus dari daftar master.`,
    });
    setTimeout(() => setToast(null), 3500);
  };

  /**
   * Open Modal to Edit or Add
   */
  const handleOpenModal = (cat = null) => {
    if (cat) {
      setEditingCategory(cat);
      setModalForm({
        nama: cat.nama || '',
        deskripsi: cat.deskripsi || '',
        badge1: cat.badges?.[0] || '',
        badge2: cat.badges?.[1] || '',
      });
    } else {
      setEditingCategory(null);
      setModalForm({
        nama: '',
        deskripsi: '',
        badge1: '',
        badge2: '',
      });
    }
    setIsAddModalOpen(true);
  };

  /**
   * Submit Modal Form (Add or Edit)
   */
  const handleModalSubmit = (e) => {
    e.preventDefault();
    if (!modalForm.nama.trim()) return;

    if (editingCategory) {
      setCategories((prev) =>
        prev.map((c) =>
          c.id === editingCategory.id
            ? {
                ...c,
                nama: modalForm.nama.trim(),
                deskripsi: modalForm.deskripsi.trim(),
                badges: [modalForm.badge1, modalForm.badge2].filter(Boolean),
              }
            : c
        )
      );
      setToast({
        type: 'success',
        message: `Kategori "${modalForm.nama}" berhasil diperbarui.`,
      });
    } else {
      const newCat = {
        id: `CAT-ORG-0${categories.length + 1}`,
        nama: modalForm.nama.trim(),
        icon: 'Layers',
        deskripsi: modalForm.deskripsi.trim() || 'Deskripsi material organik terverifikasi',
        badges: [modalForm.badge1 || 'Material terpilah', modalForm.badge2].filter(Boolean),
        active: true,
      };
      setCategories((prev) => [...prev, newCat]);
      setToast({
        type: 'success',
        message: `Kategori baru "${newCat.nama}" berhasil ditambahkan.`,
      });
    }

    setIsAddModalOpen(false);
    setTimeout(() => setToast(null), 3500);
  };

  /**
   * Handle Parameter Input Changes with Validation
   */
  const handleParamChange = (field, value) => {
    setParameters((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (paramErrors[field]) {
      setParamErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  /**
   * Save Technical Parameters Action
   */
  const handleSaveParameters = (e) => {
    e.preventDefault();
    const errors = {};

    const tol = parseFloat(parameters.toleransiMassa);
    if (isNaN(tol) || tol < 0) {
      errors.toleransiMassa = 'Toleransi massa harus berupa angka positif';
    }

    const hours = parseInt(parameters.maksimalWaktuJam, 10);
    if (isNaN(hours) || hours <= 0) {
      errors.maksimalWaktuJam = 'Maksimal waktu tinjau harus lebih dari 0 jam';
    }

    if (Object.keys(errors).length > 0) {
      setParamErrors(errors);
      return;
    }

    setToast({
      type: 'success',
      message: 'Parameter teknis verifikasi wilayah berhasil disimpan ke sistem konsol.',
    });
    setTimeout(() => setToast(null), 4000);
  };

  // 1. Loading State
  if (isLoading) {
    return <PengaturanSkeleton />;
  }

  // 2. Error State with Functional Retry Button
  if (error) {
    return (
      <section
        role="alert"
        aria-live="assertive"
        className="max-w-xl mx-auto my-12 p-8 rounded-2xl bg-white border border-red-200 shadow-sm text-center"
      >
        <div className="w-12 h-12 rounded-full bg-red-50 text-[#C2413B] flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-6 h-6" aria-hidden="true" />
        </div>
        <h2 className="text-lg font-bold text-[#17231D]">
          Gagal Memuat Pengaturan Master
        </h2>
        <p className="text-xs text-[#66736C] mt-2 mb-6 leading-relaxed">
          {error}
        </p>
        <button
          type="button"
          onClick={handleRetry}
          className="inline-flex items-center gap-2 bg-[#176B4D] hover:bg-[#104D38] text-white px-5 py-2.5 rounded-xl text-xs font-semibold shadow-xs hover:shadow transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176B4D] cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Coba Lagi</span>
        </button>
      </section>
    );
  }

  return (
    <div className="space-y-6 bg-white">
      
      {/* Toast Alert Feedback */}
      {toast && (
        <aside
          role="status"
          aria-live="polite"
          className={`fixed bottom-6 right-6 z-50 p-4 rounded-xl shadow-xl border flex items-center gap-3 text-xs font-medium max-w-md animate-fade-in ${
            toast.type === 'success'
              ? 'bg-[#EAF5F0] border-[#16805D]/20 text-[#16805D]'
              : toast.type === 'warning'
              ? 'bg-amber-50 border-amber-200 text-[#B7791F]'
              : 'bg-white border-[#E5EAE7] text-[#17231D]'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 text-[#16805D]" />
          ) : (
            <Info className="w-5 h-5 shrink-0 text-[#B7791F]" />
          )}
          <span className="leading-snug">{toast.message}</span>
        </aside>
      )}

      {/* Add / Edit Category Modal */}
      {isAddModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E5EAE7] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5EAE7]">
              <h3 className="font-bold text-base text-[#17231D]">
                {editingCategory ? 'Edit Kategori Material' : 'Tambah Kategori Material'}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-[#66736C] hover:text-[#17231D] p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleModalSubmit} className="space-y-3.5">
              <div>
                <label htmlFor="cat-nama" className="text-xs font-semibold text-[#17231D] block mb-1">
                  Nama Kategori
                </label>
                <input
                  id="cat-nama"
                  type="text"
                  required
                  value={modalForm.nama}
                  onChange={(e) => setModalForm({ ...modalForm, nama: e.target.value })}
                  placeholder="Contoh: Sisa buah & sayur"
                  className="w-full px-3 py-2 bg-[#F4F6F5] text-xs text-[#17231D] rounded-xl border border-[#E5EAE7] focus:outline-none focus:ring-2 focus:ring-[#176B4D]"
                />
              </div>

              <div>
                <label htmlFor="cat-desc" className="text-xs font-semibold text-[#17231D] block mb-1">
                  Contoh Residu &amp; Kriteria Fisik
                </label>
                <textarea
                  id="cat-desc"
                  rows={2}
                  value={modalForm.deskripsi}
                  onChange={(e) => setModalForm({ ...modalForm, deskripsi: e.target.value })}
                  placeholder="Sawi, ampas, kulit pisang, dll."
                  className="w-full px-3 py-2 bg-[#F4F6F5] text-xs text-[#17231D] rounded-xl border border-[#E5EAE7] focus:outline-none focus:ring-2 focus:ring-[#176B4D]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="cat-badge1" className="text-xs font-semibold text-[#17231D] block mb-1">
                    Label Kriteria 1
                  </label>
                  <input
                    id="cat-badge1"
                    type="text"
                    value={modalForm.badge1}
                    onChange={(e) => setModalForm({ ...modalForm, badge1: e.target.value })}
                    placeholder="Kadar air tinggi"
                    className="w-full px-3 py-2 bg-[#F4F6F5] text-xs text-[#17231D] rounded-xl border border-[#E5EAE7] focus:outline-none focus:ring-2 focus:ring-[#176B4D]"
                  />
                </div>
                <div>
                  <label htmlFor="cat-badge2" className="text-xs font-semibold text-[#17231D] block mb-1">
                    Label Kriteria 2
                  </label>
                  <input
                    id="cat-badge2"
                    type="text"
                    value={modalForm.badge2}
                    onChange={(e) => setModalForm({ ...modalForm, badge2: e.target.value })}
                    placeholder="Kontainer basah"
                    className="w-full px-3 py-2 bg-[#F4F6F5] text-xs text-[#17231D] rounded-xl border border-[#E5EAE7] focus:outline-none focus:ring-2 focus:ring-[#176B4D]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E5EAE7]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-[#E5EAE7] text-xs font-medium rounded-xl hover:bg-[#F4F6F5]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#176B4D] hover:bg-[#104D38] text-white text-xs font-semibold rounded-xl"
                >
                  {editingCategory ? 'Simpan Perubahan' : 'Tambah Kategori'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. PAGE HEADER & AUDIT ACTIONS                            */}
      {/* ========================================================= */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-1">
        <div>
          {/* Top Metadata */}
          <p className="text-xs font-semibold text-[#66736C] tracking-wider uppercase">
            KONSOL KONFIGURASI WILAYAH • Purwokerto • Banyumas
          </p>
          {/* Main Title & Subtitle */}
          <h1 className="text-2xl font-bold text-[#17231D] tracking-tight mt-1">
            Pengaturan Master Data &amp; Sirkulasi
          </h1>
          <p className="text-sm text-[#66736C] mt-0.5">
            Konfigurasi klasifikasi material organik, standardisasi jalur pemanfaatan, dan parameter verifikasi wilayah Purwokerto.
          </p>
        </div>

        {/* Top Right Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <span className="inline-flex items-center gap-1.5 border border-[#E5EAE7] bg-white text-[#17231D] text-xs font-medium px-3 py-1.5 rounded-xl shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-[#176B4D]" aria-hidden="true" />
            <span>Versi Standar 2.4</span>
          </span>

          <button
            type="button"
            onClick={() => {
              setToast({
                type: 'info',
                message: 'Riwayat log perubahan konfigurasi telah disinkronkan ke audit trail DLH.',
              });
              setTimeout(() => setToast(null), 3500);
            }}
            className="inline-flex items-center gap-1.5 border border-[#E5EAE7] bg-white hover:bg-[#F4F6F5] text-[#17231D] text-xs font-medium px-3 py-1.5 rounded-xl shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176B4D] cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5 text-[#66736C]" aria-hidden="true" />
            <span>Riwayat Log</span>
          </button>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. 4-COLUMN KPI CARDS ROW                                 */}
      {/* ========================================================= */}
      <section
        aria-label="Ringkasan Master Data"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6"
      >
        {kpiCards.map((kpi) => {
          let IconComponent = Layers;
          if (kpi.icon === 'GitFork') IconComponent = GitFork;
          if (kpi.icon === 'Scale') IconComponent = Scale;
          if (kpi.icon === 'Package') IconComponent = Package;

          return (
            <article
              key={kpi.id}
              className="p-5 rounded-2xl bg-white border border-[#E5EAE7] shadow-xs flex flex-col justify-between hover:border-[#176B4D]/30 transition-colors"
            >
              <div className="flex items-start justify-between">
                <span className="text-xs font-medium text-[#66736C]">
                  {kpi.header}
                </span>
                <div className="p-1.5 rounded-lg bg-[#F4F6F5] text-[#66736C]">
                  <IconComponent className="w-4 h-4" aria-hidden="true" />
                </div>
              </div>

              <div className="my-1.5">
                <p className="text-xl font-bold text-[#17231D] tracking-tight">
                  {kpi.value}
                </p>
              </div>

              <div className="pt-2 border-t border-[#E5EAE7]/70">
                <p
                  className={`text-xs flex items-center gap-1 ${
                    kpi.subtextSuccess ? 'text-[#16805D] font-medium' : 'text-[#66736C]'
                  }`}
                >
                  {kpi.subtextSuccess && <CheckCircle className="w-3.5 h-3.5" aria-hidden="true" />}
                  <span>{kpi.subtext}</span>
                </p>
              </div>
            </article>
          );
        })}
      </section>

      {/* ========================================================= */}
      {/* 5. SECTION 1: KATEGORI MATERIAL ORGANIK                   */}
      {/* ========================================================= */}
      <section className="bg-white border border-[#E5EAE7] rounded-2xl p-6 shadow-sm mt-6">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5EAE7]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[#176B4D] text-xs leading-none">●</span>
              <h2 className="text-base font-bold text-[#17231D]">
                Kategori Material Organik
              </h2>
            </div>
            <p className="text-xs text-[#66736C] mt-0.5">
              Daftar jenis residu organik yang dapat dicatat oleh mitra sumber dan diterima oleh pengolah di wilayah Banyumas.
            </p>
          </div>

          <button
            type="button"
            onClick={() => handleOpenModal()}
            className="inline-flex items-center gap-1.5 bg-[#104D38] hover:bg-[#176B4D] text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176B4D] cursor-pointer self-start sm:self-auto shrink-0"
          >
            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Tambah Kategori</span>
          </button>
        </div>

        {/* Table Structure */}
        <div className="overflow-x-auto -mx-6 px-6 pt-2">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#E5EAE7] text-[#66736C] font-semibold">
                <th scope="col" className="pb-3 pl-2 font-medium w-12">Ikon</th>
                <th scope="col" className="pb-3 font-medium w-52">Nama Kategori</th>
                <th scope="col" className="pb-3 font-medium">Contoh Residu &amp; Kriteria Fisik</th>
                <th scope="col" className="pb-3 font-medium text-center w-28">Status</th>
                <th scope="col" className="pb-3 pr-2 font-medium text-right w-20">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5EAE7]/60">
              {categories.map((cat) => {
                let IconComp = Sprout;
                if (cat.icon === 'Archive') IconComp = Archive;
                if (cat.icon === 'Utensils') IconComp = Utensils;
                if (cat.icon === 'Layers') IconComp = Layers;

                return (
                  <tr key={cat.id} className="hover:bg-[#F4F6F5]/40 transition-colors">
                    {/* Ikon */}
                    <td className="py-4 pl-2">
                      <div className="w-8 h-8 rounded-xl bg-[#F4F6F5] border border-[#E5EAE7] flex items-center justify-center text-[#176B4D]">
                        <IconComp className="w-4 h-4" aria-hidden="true" />
                      </div>
                    </td>

                    {/* Nama Kategori */}
                    <td className="py-4">
                      <p className="font-bold text-sm text-[#17231D] leading-tight">
                        {cat.nama}
                      </p>
                      <span className="text-xs text-[#66736C] font-mono mt-0.5 block">
                        Kode: {cat.id}
                      </span>
                    </td>

                    {/* Contoh Residu & Kriteria Fisik */}
                    <td className="py-4 pr-4">
                      <p className="text-xs text-[#17231D] leading-relaxed">
                        {cat.deskripsi}
                      </p>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                        {cat.badges?.map((b, idx) => (
                          <span
                            key={idx}
                            className="bg-[#F4F6F5] text-[11px] text-[#66736C] px-2 py-0.5 rounded border border-[#E5EAE7]"
                          >
                            {b}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Interactive Toggle Switch */}
                    <td className="py-4 text-center">
                      <div className="flex flex-col items-center justify-center gap-1">
                        <ToggleSwitch
                          active={cat.active}
                          onToggle={() => handleToggleCategory(cat.id)}
                          ariaLabel={`Ubah status ${cat.nama}`}
                        />
                        <span
                          className={`text-[10px] font-semibold ${
                            cat.active ? 'text-[#16805D]' : 'text-[#66736C]'
                          }`}
                        >
                          {cat.active ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </div>
                    </td>

                    {/* Actions: Edit & Delete */}
                    <td className="py-4 pr-2 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          title="Edit Kategori"
                          aria-label={`Edit ${cat.nama}`}
                          onClick={() => handleOpenModal(cat)}
                          className="p-1.5 rounded-lg text-[#66736C] hover:text-[#17231D] hover:bg-[#F4F6F5] transition-colors cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          title="Hapus Kategori"
                          aria-label={`Hapus ${cat.nama}`}
                          onClick={() => handleDeleteCategory(cat)}
                          className="p-1.5 rounded-lg text-[#66736C] hover:text-[#C2413B] hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Notice Banner (Below Table) */}
        <aside className="bg-[#F4F6F5] border border-[#E5EAE7] rounded-xl p-3.5 flex items-start gap-3 mt-4">
          <Camera className="w-5 h-5 text-[#176B4D] shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <h3 className="text-xs font-bold text-[#17231D]">
              Standardisasi Dokumentasi Fisik Lapangan
            </h3>
            <p className="text-xs text-[#66736C] mt-0.5 leading-relaxed">
              Format foto standar pada aplikasi mobile mewajibkan mitra sumber mencantumkan wadah ember/kontainer dan timbangan fisik manual. Seluruh batch tanpa visual skala timbangan yang jelas akan diarahkan ke status Perlu Revisi oleh pemeriksa.
            </p>
          </div>
        </aside>
      </section>

      {/* ========================================================= */}
      {/* 6. SECTION 2: JALUR PEMANFAATAN & ALOKASI                 */}
      {/* ========================================================= */}
      <section className="bg-white border border-[#E5EAE7] rounded-2xl p-6 shadow-sm mt-6">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5EAE7]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[#176B4D] text-xs leading-none">●</span>
              <h2 className="text-base font-bold text-[#17231D]">
                Jalur Pemanfaatan &amp; Alokasi
              </h2>
            </div>
            <p className="text-xs text-[#66736C] mt-0.5">
              Pemetaan fasilitas hilir untuk pemrosesan sirkular material organik terdaftar di Banyumas.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setToast({
                type: 'info',
                message: 'Pendaftaran jalur pemanfaatan baru memerlukan verifikasi izin lingkungan DLH.',
              });
              setTimeout(() => setToast(null), 3500);
            }}
            className="border border-[#E5EAE7] text-xs font-semibold px-3.5 py-2 rounded-xl hover:bg-[#F4F6F5] flex items-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176B4D] cursor-pointer self-start sm:self-auto shrink-0"
          >
            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Tambah Jalur</span>
          </button>
        </div>

        {/* 2 Pathway Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {pathways.map((pw) => {
            const isKompos = pw.id === 'PTH-CMP-01';
            const IconComponent = isKompos ? Sprout : Bug;

            return (
              <article
                key={pw.id}
                className="p-5 rounded-xl border border-[#E5EAE7] bg-white shadow-xs flex flex-col justify-between hover:border-[#176B4D]/30 transition-all"
              >
                <div>
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-[#EAF5F0] text-[#176B4D] flex items-center justify-center shrink-0">
                        <IconComponent className="w-4 h-4" aria-hidden="true" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-[#17231D]">
                          {pw.nama}
                        </h3>
                        <p className="text-[11px] text-[#66736C] font-mono mt-0.5">
                          {pw.subtitle}
                        </p>
                      </div>
                    </div>

                    {/* Active Toggle Switch */}
                    <ToggleSwitch
                      active={pw.active}
                      onToggle={() => handleTogglePathway(pw.id)}
                      ariaLabel={`Ubah status jalur ${pw.nama}`}
                    />
                  </div>

                  {/* Description */}
                  <p className="text-xs text-[#66736C] leading-relaxed my-3">
                    {pw.deskripsi}
                  </p>

                  {/* Box Karakteristik */}
                  <div className="bg-[#F4F6F5] rounded-xl p-3 text-xs mb-3 border border-[#E5EAE7]">
                    <span className="text-[10px] font-bold text-[#66736C] uppercase tracking-wider block">
                      KARAKTERISTIK YANG DITERIMA
                    </span>
                    <p className="text-[11px] text-[#17231D] mt-1 leading-relaxed">
                      {pw.karakteristik}
                    </p>
                  </div>

                  {/* Mitra Pengolah Aktif */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#66736C] font-medium">Mitra Pengolah Aktif:</span>
                      <span className="bg-[#EAF5F0] text-[#16805D] text-xs px-2 py-0.5 rounded font-medium border border-[#16805D]/15">
                        {pw.facilitiesCount}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {pw.facilities?.map((f, idx) => (
                        <span
                          key={idx}
                          className="border border-[#E5EAE7] bg-white rounded-lg px-2.5 py-1 text-xs text-[#17231D]"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="pt-3 mt-4 border-t border-[#E5EAE7] flex items-center justify-between text-xs text-[#66736C]">
                  <span>{pw.footer}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setToast({
                        type: 'info',
                        message: `Membuka pengaturan alokasi kuota untuk ${pw.nama}.`,
                      });
                      setTimeout(() => setToast(null), 3000);
                    }}
                    className="font-semibold text-[#176B4D] hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    <span>Kelola Jalur</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        {/* Notice Banner (Below Cards) */}
        <aside className="bg-[#F4F6F5] border border-[#E5EAE7] rounded-xl p-3.5 flex items-start gap-3 mt-4">
          <FileText className="w-5 h-5 text-[#176B4D] shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <h3 className="text-xs font-bold text-[#17231D]">
              Ketentuan Verifikasi &amp; Kewenangan Fasilitas Hilir
            </h3>
            <p className="text-xs text-[#66736C] mt-0.5 leading-relaxed">
              Kelayakan material ditentukan oleh mitra pengolah, bukan oleh aplikasi. Penolakan material di tingkat fasilitas wajib menyertakan alasan fisik untuk validasi audit.
            </p>
          </div>
        </aside>
      </section>

      {/* ========================================================= */}
      {/* 7. SECTION 3: PARAMETER TEKNIS VERIFIKASI WILAYAH        */}
      {/* ========================================================= */}
      <section className="bg-white border border-[#E5EAE7] rounded-2xl p-6 shadow-sm mt-6">
        <form onSubmit={handleSaveParameters}>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5EAE7]">
            <div>
              <h2 className="text-base font-bold text-[#17231D]">
                Parameter Teknis Verifikasi Wilayah
              </h2>
              <p className="text-xs text-[#66736C] mt-0.5">
                Batas toleransi massa manual dan waktu verifikasi batch harian.
              </p>
            </div>

            <button
              type="submit"
              className="bg-[#176B4D] hover:bg-[#104D38] text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176B4D] cursor-pointer self-start sm:self-auto shrink-0"
            >
              Simpan Perubahan
            </button>
          </div>

          {/* 3-Column Interactive Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">
            {/* Field 1: Toleransi Selisih Massa (kg) */}
            <div>
              <label
                htmlFor="param-toleransi"
                className="text-xs font-semibold text-[#17231D] block mb-1.5"
              >
                Toleransi Selisih Massa (kg)
              </label>
              <div className="relative">
                <input
                  id="param-toleransi"
                  type="number"
                  step="0.1"
                  min="0"
                  value={parameters.toleransiMassa}
                  onChange={(e) => handleParamChange('toleransiMassa', e.target.value)}
                  className={`w-full pl-3 pr-10 py-2.5 bg-[#F4F6F5] text-sm font-semibold text-[#17231D] rounded-xl border transition-all focus:outline-none focus:ring-2 ${
                    paramErrors.toleransiMassa
                      ? 'border-[#C2413B] focus:ring-[#C2413B]'
                      : 'border-[#E5EAE7] focus:ring-[#176B4D] focus:border-[#176B4D]'
                  }`}
                />
                <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs font-semibold text-[#66736C] pointer-events-none">
                  kg
                </span>
              </div>
              {paramErrors.toleransiMassa && (
                <p className="text-[11px] text-[#C2413B] mt-1 font-medium">
                  {paramErrors.toleransiMassa}
                </p>
              )}
              <p className="text-[11px] text-[#66736C] mt-1.5 leading-relaxed">
                Batas maksimal perbedaan timbangan sumber vs pengolah sebelum flag audit.
              </p>
            </div>

            {/* Field 2: Maksimal Waktu Tinjau Batch */}
            <div>
              <label
                htmlFor="param-waktu"
                className="text-xs font-semibold text-[#17231D] block mb-1.5"
              >
                Maksimal Waktu Tinjau Batch
              </label>
              <div className="relative">
                <input
                  id="param-waktu"
                  type="number"
                  min="1"
                  value={parameters.maksimalWaktuJam}
                  onChange={(e) => handleParamChange('maksimalWaktuJam', e.target.value)}
                  className={`w-full pl-3 pr-12 py-2.5 bg-[#F4F6F5] text-sm font-semibold text-[#17231D] rounded-xl border transition-all focus:outline-none focus:ring-2 ${
                    paramErrors.maksimalWaktuJam
                      ? 'border-[#C2413B] focus:ring-[#C2413B]'
                      : 'border-[#E5EAE7] focus:ring-[#176B4D] focus:border-[#176B4D]'
                  }`}
                />
                <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs font-semibold text-[#66736C] pointer-events-none">
                  Jam
                </span>
              </div>
              {paramErrors.maksimalWaktuJam && (
                <p className="text-[11px] text-[#C2413B] mt-1 font-medium">
                  {paramErrors.maksimalWaktuJam}
                </p>
              )}
              <p className="text-[11px] text-[#66736C] mt-1.5 leading-relaxed">
                Batas antrean verifikasi sebelum pengingat visual admin diaktifkan.
              </p>
            </div>

            {/* Field 3: Satuan Pengukuran Baku */}
            <div>
              <label
                htmlFor="param-satuan"
                className="text-xs font-semibold text-[#17231D] block mb-1.5"
              >
                Satuan Pengukuran Baku
              </label>
              <div className="relative">
                <input
                  id="param-satuan"
                  type="text"
                  readOnly
                  disabled
                  value={parameters.satuanBaku}
                  className="w-full px-3 py-2.5 bg-[#F4F6F5] text-sm font-semibold text-[#17231D] rounded-xl border border-[#E5EAE7] cursor-not-allowed opacity-90"
                />
              </div>
              <p className="text-[11px] text-[#66736C] mt-1.5 leading-relaxed">
                Standar permanen seluruh master konsol BioRoute Banyumas.
              </p>
            </div>
          </div>
        </form>
      </section>

    </div>
  );
}
