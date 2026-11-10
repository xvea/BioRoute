'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  SlidersHorizontal,
  Download,
  Search,
  MoreHorizontal,
  MapPin,
  Sprout,
  Package,
  Bug,
  FileText,
  Info,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye,
  Check,
  Building2,
  Phone,
  User,
} from 'lucide-react';

/**
 * Pulse Skeleton for Table & Detail Panel
 */
function VerifikasiSkeleton() {
  return (
    <div className="space-y-6 animate-pulse bg-white" aria-busy="true" aria-label="Memuat data verifikasi mitra">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div className="space-y-2">
          <div className="h-7 w-64 bg-gray-200 rounded-lg" />
          <div className="h-4 w-96 bg-gray-100 rounded-md" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-9 w-36 bg-gray-200 rounded-xl" />
          <div className="h-9 w-32 bg-gray-200 rounded-xl" />
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="flex gap-4 border-b border-gray-200 pb-3">
        <div className="h-6 w-28 bg-gray-200 rounded-md" />
        <div className="h-6 w-28 bg-gray-100 rounded-md" />
        <div className="h-6 w-28 bg-gray-100 rounded-md" />
      </div>

      {/* Grid 7:5 Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column Table Skeleton */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-white border border-[#E5EAE7] space-y-4">
          <div className="h-10 w-full bg-gray-100 rounded-xl" />
          <div className="space-y-3 pt-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 w-full bg-gray-100 rounded-xl" />
            ))}
          </div>
          <div className="h-6 w-48 bg-gray-100 rounded mt-4" />
        </div>

        {/* Right Column Detail Skeleton */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-white border border-[#E5EAE7] space-y-5">
          <div className="flex justify-between items-center">
            <div className="h-6 w-44 bg-gray-200 rounded" />
            <div className="h-6 w-24 bg-gray-100 rounded-full" />
          </div>
          <div className="h-24 w-full bg-gray-100 rounded-xl" />
          <div className="h-32 w-full bg-gray-100 rounded-xl" />
          <div className="h-28 w-full bg-gray-100 rounded-xl" />
          <div className="h-10 w-full bg-gray-200 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export default function VerifikasiPage() {
  const [partners, setPartners] = useState([]);
  const [selectedPartnerId, setSelectedPartnerId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // Filter & Toolbar States
  const [activeTab, setActiveTab] = useState('menunggu');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest' | 'name'

  // Interactive feedback
  const [toast, setToast] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);

  /**
   * Client-side native fetch inside useEffect strictly pointing to '/data/verifikasi-mitra.json'
   */
  useEffect(() => {
    let active = true;

    async function fetchPartners() {
      try {
        const response = await fetch('/data/verifikasi-mitra.json', {
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Gagal memuat berkas mitra (HTTP ${response.status})`);
        }

        const data = await response.json();
        if (active) {
          setPartners(Array.isArray(data) ? data : []);
          if (Array.isArray(data) && data.length > 0) {
            setSelectedPartnerId(data[0].id);
          }
          setIsLoading(false);
          setError(null);
        }
      } catch (err) {
        if (active) {
          console.error('Fetch error:', err);
          setError(err?.message || 'Terjadi gangguan saat mengambil data verifikasi mitra.');
          setIsLoading(false);
        }
      }
    }

    fetchPartners();

    return () => {
      active = false;
    };
  }, [retryCount]);

  /**
   * Functional Retry Handler
   */
  const handleRetry = () => {
    setIsLoading(true);
    setError(null);
    setRetryCount((prev) => prev + 1);
  };

  /**
   * Filtered & Sorted Partners List
   */
  const filteredPartners = useMemo(() => {
    return partners
      .filter((partner) => {
        // Match Tab
        if (activeTab === 'menunggu' && partner.status !== 'Menunggu') return false;
        if (activeTab === 'terverifikasi' && partner.status !== 'Terverifikasi') return false;
        if (activeTab === 'ditolak' && partner.status !== 'Ditolak') return false;

        // Match Search Query
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        const nama = partner.nama?.toLowerCase() || '';
        const pj = partner.pj?.toLowerCase() || '';
        const lokasi = partner.lokasi?.toLowerCase() || '';
        return nama.includes(q) || pj.includes(q) || lokasi.includes(q);
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.nama.localeCompare(b.nama);
        if (sortBy === 'oldest') return a.id.localeCompare(b.id);
        return b.id.localeCompare(a.id); // newest by default
      });
  }, [partners, activeTab, searchQuery, sortBy]);

  // Selected Active Partner Object
  const selectedPartner = useMemo(() => {
    if (!partners.length) return null;
    return partners.find((p) => p.id === selectedPartnerId) || filteredPartners[0] || partners[0];
  }, [partners, selectedPartnerId, filteredPartners]);

  /**
   * Action Handlers for Partner Verification / Rejection
   */
  const handleVerifyPartner = (partner) => {
    setPartners((prev) =>
      prev.map((p) =>
        p.id === partner.id ? { ...p, status: 'Terverifikasi' } : p
      )
    );
    setToast({
      type: 'success',
      message: `Akun mitra "${partner.nama}" berhasil diverifikasi dan diaktifkan.`,
    });
    setTimeout(() => setToast(null), 4000);
  };

  const handleRejectPartner = (partner) => {
    setPartners((prev) =>
      prev.map((p) =>
        p.id === partner.id ? { ...p, status: 'Ditolak' } : p
      )
    );
    setToast({
      type: 'danger',
      message: `Permohonan mitra "${partner.nama}" telah ditolak. Notifikasi perbaikan berkas dikirimkan.`,
    });
    setTimeout(() => setToast(null), 4000);
  };

  // 1. Loading State
  if (isLoading) {
    return <VerifikasiSkeleton />;
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
          Gagal Memuat Data Verifikasi
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

  // Counts for Tabs
  const countMenunggu = partners.filter((p) => p.status === 'Menunggu').length;
  const countTerverifikasi = partners.filter((p) => p.status === 'Terverifikasi').length + 42;
  const countDitolak = partners.filter((p) => p.status === 'Ditolak').length + 5;

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
              : 'bg-red-50 border-red-200 text-[#C2413B]'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 text-[#16805D]" />
          ) : (
            <XCircle className="w-5 h-5 shrink-0 text-[#C2413B]" />
          )}
          <span className="leading-snug">{toast.message}</span>
        </aside>
      )}

      {/* Document Quick Preview Modal */}
      {previewDoc && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E5EAE7] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5EAE7]">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#176B4D]" />
                <h3 className="font-bold text-sm text-[#17231D]">{previewDoc.nama}</h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="text-[#66736C] hover:text-[#17231D] p-1 rounded-lg"
              >
                ✕
              </button>
            </div>
            <div className="p-6 bg-[#F4F6F5] rounded-xl text-center border border-[#E5EAE7]">
              <p className="text-xs text-[#66736C] font-mono">{previewDoc.sub}</p>
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF5F0] text-[#16805D] text-xs font-semibold">
                <Check className="w-3.5 h-3.5" />
                <span>Dokumen Sah &amp; Terlampir</span>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="bg-[#176B4D] hover:bg-[#104D38] text-white text-xs font-medium px-4 py-2 rounded-xl"
              >
                Tutup Pratinjau
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* PAGE HEADER & TOP ACTIONS                                 */}
      {/* ========================================================= */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <h1 className="text-2xl font-bold text-[#17231D] tracking-tight">
            Verifikasi Mitra Operasional
          </h1>
          <p className="text-sm text-[#66736C] mt-1">
            Evaluasi legalitas, fasilitas, dan kelayakan penanganan material organik sebelum aktivasi akun.
          </p>
        </div>

        {/* Top Right Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            className="inline-flex items-center gap-2 bg-white border border-[#E5EAE7] hover:bg-[#F4F6F5] text-xs font-medium text-[#17231D] px-3.5 py-2 rounded-xl shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176B4D] cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#66736C]" aria-hidden="true" />
            <span>Wilayah: Banyumas</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setToast({
                type: 'success',
                message: 'Log verifikasi operasional berhasil diekspor (Format CSV).',
              });
              setTimeout(() => setToast(null), 3000);
            }}
            className="inline-flex items-center gap-2 bg-white border border-[#E5EAE7] hover:bg-[#F4F6F5] text-xs font-medium text-[#17231D] px-3.5 py-2 rounded-xl shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176B4D] cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#66736C]" aria-hidden="true" />
            <span>Ekspor Log</span>
          </button>
        </div>
      </section>

      {/* ========================================================= */}
      {/* STATUS TABS ROW                                           */}
      {/* ========================================================= */}
      <nav aria-label="Status Permohonan Mitra" className="border-b border-[#E5EAE7]">
        <div className="flex items-center gap-8">
          {/* Tab Menunggu */}
          <button
            type="button"
            onClick={() => setActiveTab('menunggu')}
            className={`pb-3 inline-flex items-center gap-2 text-sm font-medium transition-all relative ${
              activeTab === 'menunggu'
                ? 'text-[#176B4D] font-bold border-b-2 border-[#176B4D]'
                : 'text-[#66736C] hover:text-[#17231D]'
            }`}
          >
            <span>Menunggu</span>
            <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded-full text-xs font-semibold">
              {countMenunggu}
            </span>
          </button>

          {/* Tab Terverifikasi */}
          <button
            type="button"
            onClick={() => setActiveTab('terverifikasi')}
            className={`pb-3 inline-flex items-center gap-2 text-sm font-medium transition-all relative ${
              activeTab === 'terverifikasi'
                ? 'text-[#176B4D] font-bold border-b-2 border-[#176B4D]'
                : 'text-[#66736C] hover:text-[#17231D]'
            }`}
          >
            <span>Terverifikasi</span>
            <span className="bg-[#F4F6F5] text-[#66736C] px-2 py-0.5 rounded-full text-xs font-semibold">
              {countTerverifikasi}
            </span>
          </button>

          {/* Tab Ditolak */}
          <button
            type="button"
            onClick={() => setActiveTab('ditolak')}
            className={`pb-3 inline-flex items-center gap-2 text-sm font-medium transition-all relative ${
              activeTab === 'ditolak'
                ? 'text-[#176B4D] font-bold border-b-2 border-[#176B4D]'
                : 'text-[#66736C] hover:text-[#17231D]'
            }`}
          >
            <span>Ditolak</span>
            <span className="bg-[#F4F6F5] text-[#66736C] px-2 py-0.5 rounded-full text-xs font-semibold">
              {countDitolak}
            </span>
          </button>
        </div>
      </nav>

      {/* ========================================================= */}
      {/* TWO-COLUMN SPLIT LAYOUT (7:5 DESKTOP GRID)                */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ======================================================= */}
        {/* A. LEFT COLUMN: APPLICATION TABLE (lg:col-span-7)       */}
        {/* ======================================================= */}
        <section className="lg:col-span-7 rounded-2xl bg-white border border-[#E5EAE7] shadow-xs p-5 flex flex-col justify-between min-h-[580px]">
          <div>
            {/* Search & Sort Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
              {/* Search Input */}
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#66736C]">
                  <Search className="w-4 h-4" aria-hidden="true" />
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Saring antrean nama atau PJ..."
                  aria-label="Saring antrean permohonan mitra"
                  className="w-full pl-9 pr-3.5 py-2 bg-[#F4F6F5] text-xs text-[#17231D] placeholder-[#66736C] rounded-xl border border-[#E5EAE7] focus:outline-none focus:ring-2 focus:ring-[#176B4D] focus:border-[#176B4D] transition-all"
                />
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-1.5 shrink-0">
                <label htmlFor="sort-select" className="text-[11px] font-semibold text-[#66736C] uppercase">
                  URUTKAN:
                </label>
                <select
                  id="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-[#F4F6F5] border border-[#E5EAE7] text-xs font-medium text-[#17231D] px-2.5 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#176B4D] cursor-pointer"
                >
                  <option value="newest">Paling Baru</option>
                  <option value="oldest">Paling Awal</option>
                  <option value="name">Nama Mitra</option>
                </select>
              </div>
            </div>

            {/* Interactive Table View */}
            {filteredPartners.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-[#E5EAE7] rounded-xl my-4">
                <Building2 className="w-8 h-8 text-[#66736C] mx-auto mb-2" />
                <p className="text-sm font-semibold text-[#17231D]">Tidak ada permohonan</p>
                <p className="text-xs text-[#66736C] mt-1">
                  Tidak ditemukan mitra untuk kategori status atau kata kunci yang dipilih.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-5 px-5">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#E5EAE7] text-[#66736C] font-semibold">
                      <th scope="col" className="pb-3 pl-3 font-medium">Nama Mitra</th>
                      <th scope="col" className="pb-3 font-medium">Jenis</th>
                      <th scope="col" className="pb-3 font-medium hidden md:table-cell">Lokasi</th>
                      <th scope="col" className="pb-3 font-medium hidden sm:table-cell">Pengajuan</th>
                      <th scope="col" className="pb-3 font-medium">Status</th>
                      <th scope="col" className="pb-3 pr-3 font-medium text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5EAE7]/60">
                    {filteredPartners.map((partner) => {
                      const isSelected = selectedPartner?.id === partner.id;
                      const isSumber = partner.jenis === 'Mitra Sumber';

                      return (
                        <tr
                          key={partner.id}
                          onClick={() => setSelectedPartnerId(partner.id)}
                          tabIndex={0}
                          role="button"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              setSelectedPartnerId(partner.id);
                            }
                          }}
                          className={`cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-[#EAF5F0]/50 border-l-4 border-l-[#176B4D]'
                              : 'hover:bg-[#F4F6F5]/60'
                          }`}
                        >
                          {/* Nama Mitra & PJ */}
                          <td className="py-3.5 pl-3">
                            <p className="font-bold text-[#17231D] leading-tight">
                              {partner.nama}
                            </p>
                            <p className="text-[11px] text-[#66736C] mt-0.5">
                              PJ: {partner.pj}
                            </p>
                          </td>

                          {/* Jenis Badge */}
                          <td className="py-3.5">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                                isSumber
                                  ? 'bg-[#EAF5F0] text-[#16805D]'
                                  : 'bg-[#EFF6FF] text-[#2563EB]'
                              }`}
                            >
                              {partner.jenis}
                            </span>
                          </td>

                          {/* Lokasi */}
                          <td className="py-3.5 text-[#17231D] hidden md:table-cell">
                            {partner.lokasi}
                          </td>

                          {/* Pengajuan */}
                          <td className="py-3.5 text-[#66736C] hidden sm:table-cell">
                            {partner.pengajuan}
                          </td>

                          {/* Status Badge */}
                          <td className="py-3.5">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                                partner.status === 'Terverifikasi'
                                  ? 'bg-[#EAF5F0] text-[#16805D]'
                                  : partner.status === 'Ditolak'
                                  ? 'bg-[#FEE2E2] text-[#C2413B]'
                                  : 'bg-[#FEF3C7] text-[#B7791F]'
                              }`}
                            >
                              {partner.status}
                            </span>
                          </td>

                          {/* Action indicator button */}
                          <td className="py-3.5 pr-3 text-right">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                                isSelected
                                  ? 'bg-[#176B4D] text-white shadow-xs'
                                  : 'bg-white border border-[#E5EAE7] text-[#176B4D] hover:bg-[#EAF5F0]'
                              }`}
                            >
                              {isSelected ? 'Aktif' : 'Detail'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Table Footer: Count & Pagination */}
          <footer className="pt-4 mt-4 border-t border-[#E5EAE7] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#66736C]">
            <span>
              Menampilkan 1–{filteredPartners.length} dari {partners.length} permohonan baru
            </span>

            {/* Pagination Controls */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="Halaman sebelumnya"
                disabled
                className="w-7 h-7 rounded-lg border border-[#E5EAE7] flex items-center justify-center text-[#66736C] opacity-50 cursor-not-allowed"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                aria-current="page"
                className="w-7 h-7 rounded-lg bg-[#176B4D] text-white font-semibold flex items-center justify-center shadow-xs"
              >
                1
              </button>
              <button
                type="button"
                aria-label="Halaman selanjutnya"
                disabled
                className="w-7 h-7 rounded-lg border border-[#E5EAE7] flex items-center justify-center text-[#66736C] opacity-50 cursor-not-allowed"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </footer>
        </section>

        {/* ======================================================= */}
        {/* B. RIGHT COLUMN: DETAIL PANEL (lg:col-span-5)           */}
        {/* ======================================================= */}
        <aside className="lg:col-span-5 border border-[#E5EAE7] rounded-2xl bg-white p-6 shadow-sm flex flex-col gap-6">
          {selectedPartner ? (
            <>
              {/* 1. Partner Header */}
              <header className="pb-4 border-b border-[#E5EAE7]">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="text-xl font-bold text-[#17231D] tracking-tight">
                      {selectedPartner.nama}
                    </h2>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          selectedPartner.jenis === 'Mitra Sumber'
                            ? 'bg-[#EAF5F0] text-[#16805D]'
                            : 'bg-[#EFF6FF] text-[#2563EB]'
                        }`}
                      >
                        {selectedPartner.jenis}
                      </span>
                      <span className="text-xs text-[#66736C]">
                        • Status: <strong className="text-[#17231D]">{selectedPartner.status}</strong>
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    aria-label="Opsi tambahan permohonan"
                    className="p-1.5 text-[#66736C] hover:text-[#17231D] rounded-lg hover:bg-[#F4F6F5] transition-colors"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-[#66736C] mt-2 font-mono">
                  Diajukan: {selectedPartner.pengajuan} • ID: {selectedPartner.id}
                </p>
              </header>

              {/* 2. Identitas & Kapasitas Section */}
              <section aria-labelledby="identitas-heading" className="space-y-3">
                <h3 id="identitas-heading" className="text-xs font-bold text-[#66736C] tracking-wider uppercase">
                  IDENTITAS &amp; KAPASITAS
                </h3>
                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-[#F4F6F5] border border-[#E5EAE7]">
                  <div>
                    <span className="text-[11px] text-[#66736C] flex items-center gap-1">
                      <User className="w-3 h-3" /> Penanggung Jawab
                    </span>
                    <p className="font-semibold text-sm text-[#17231D] mt-0.5">
                      {selectedPartner.pj}
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] text-[#66736C] flex items-center gap-1">
                      <Phone className="w-3 h-3" /> Kontak Telepon
                    </span>
                    <p className="font-semibold text-sm text-[#17231D] mt-0.5">
                      {selectedPartner.telepon}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#F4F6F5] border border-[#E5EAE7] flex items-center justify-between">
                  <span className="text-xs text-[#66736C]">Estimasi Timbulan Harian:</span>
                  <span className="text-lg font-bold text-[#17231D]">
                    {selectedPartner.estimasiTimbulan}
                  </span>
                </div>
              </section>

              {/* 3. Alamat & Titik Lokasi Section */}
              <section aria-labelledby="lokasi-heading" className="space-y-3">
                <h3 id="lokasi-heading" className="text-xs font-bold text-[#66736C] tracking-wider uppercase">
                  ALAMAT &amp; TITIK LOKASI
                </h3>
                <div className="flex items-start gap-2 text-xs text-[#17231D] leading-relaxed">
                  <MapPin className="w-4 h-4 text-[#176B4D] shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{selectedPartner.alamatLengkap}</span>
                </div>

                {/* Static Map Simulation Box */}
                <div className="bg-[#F4F6F5] border border-[#E5EAE7] rounded-xl p-4 text-center relative overflow-hidden">
                  <div className="flex items-center justify-between text-[11px] mb-6">
                    <span className="inline-flex items-center gap-1 bg-[#EAF5F0] text-[#16805D] px-2 py-0.5 rounded-md font-semibold border border-[#16805D]/15">
                      <Check className="w-3 h-3" /> Koordinat Valid
                    </span>
                    <span className="font-mono text-[#66736C] bg-white px-2 py-0.5 rounded border border-[#E5EAE7]">
                      {selectedPartner.koordinat}
                    </span>
                  </div>

                  {/* Simulated Center Pin Marker */}
                  <div className="my-2">
                    <span className="bg-white shadow-sm border border-[#E5EAE7] px-3.5 py-1.5 rounded-full text-xs font-medium text-[#17231D] inline-flex items-center gap-1.5">
                      <span className="text-[#176B4D] text-xs">●</span>
                      <span>{selectedPartner.markerLabel}</span>
                    </span>
                  </div>

                  <p className="text-[11px] text-[#66736C] mt-6">
                    Basis Peta Statis Banyumas • Presisi Geotagging GPS
                  </p>
                </div>
              </section>

              {/* 4. Kategori Material Yang Dihasilkan Section */}
              <section aria-labelledby="material-heading" className="space-y-3">
                <h3 id="material-heading" className="text-xs font-bold text-[#66736C] tracking-wider uppercase">
                  KATEGORI MATERIAL YANG DIHASILKAN
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedPartner.kategoriMaterial?.map((item, idx) => {
                    const isSprout = item.icon === 'Sprout';
                    const isBug = item.icon === 'Bug';
                    const IconComponent = isSprout ? Sprout : isBug ? Bug : Package;

                    return (
                      <div
                        key={idx}
                        className="bg-[#F4F6F5] border border-[#E5EAE7] rounded-xl p-3 flex items-start gap-2.5"
                      >
                        <div className="p-1.5 rounded-lg bg-white border border-[#E5EAE7] text-[#176B4D] shrink-0">
                          <IconComponent className="w-4 h-4" aria-hidden="true" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#17231D] truncate">
                            {item.title}
                          </p>
                          <p className="text-[11px] text-[#66736C] truncate mt-0.5">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* 5. Kelengkapan Dokumen & Bukti Section */}
              <section aria-labelledby="dokumen-heading" className="space-y-3">
                <h3 id="dokumen-heading" className="text-xs font-bold text-[#66736C] tracking-wider uppercase">
                  KELENGKAPAN DOKUMEN &amp; BUKTI
                </h3>
                <div className="space-y-2.5">
                  {selectedPartner.dokumen?.map((doc, idx) => (
                    <div
                      key={idx}
                      className="border border-[#E5EAE7] rounded-xl p-3 flex items-center justify-between gap-2 bg-white hover:border-[#176B4D]/30 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FileText className="w-4 h-4 text-[#176B4D] shrink-0" aria-hidden="true" />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#17231D] truncate">
                            {doc.nama}
                          </p>
                          <p className="text-[11px] text-[#66736C] truncate">
                            {doc.sub}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="bg-[#EAF5F0] text-[#16805D] text-xs font-semibold px-2 py-0.5 rounded">
                          {doc.status}
                        </span>
                        <button
                          type="button"
                          onClick={() => setPreviewDoc(doc)}
                          className="border border-[#E5EAE7] text-xs font-medium px-3 py-1 rounded-lg hover:bg-[#F4F6F5] text-[#17231D] transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3 h-3 text-[#66736C]" />
                          <span>Lihat</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* 6. Regulatory Disclaimer Notice */}
              <aside className="p-3.5 rounded-xl bg-[#F4F6F5] border border-[#E5EAE7] flex items-start gap-2.5 text-[#66736C]">
                <Info className="w-4 h-4 text-[#176B4D] shrink-0 mt-0.5" aria-hidden="true" />
                <p className="text-[11px] leading-relaxed">
                  Kelayakan material ditentukan oleh mitra pengolah, bukan oleh aplikasi. Verifikasi akun ini semata-mata mengesahkan keberadaan fisik fasilitas dan penanggung jawab sah.
                </p>
              </aside>

              {/* 7. Action Footer Buttons */}
              <footer className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleRejectPartner(selectedPartner)}
                  className="bg-[#FEE2E2] hover:bg-red-200 text-[#C2413B] font-medium py-2.5 rounded-xl text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C2413B] cursor-pointer"
                >
                  Tolak Pendaftaran
                </button>

                <button
                  type="button"
                  onClick={() => handleVerifyPartner(selectedPartner)}
                  className="bg-[#176B4D] hover:bg-[#104D38] text-white font-medium py-2.5 rounded-xl text-sm flex items-center justify-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176B4D] cursor-pointer shadow-xs"
                >
                  <Check className="w-4 h-4" />
                  <span>Verifikasi Mitra</span>
                </button>
              </footer>
            </>
          ) : (
            <div className="p-8 text-center text-[#66736C] text-xs">
              Pilih salah satu mitra dari tabel di sebelah kiri untuk melihat rincian verifikasi.
            </div>
          )}
        </aside>

      </div>

    </div>
  );
}
