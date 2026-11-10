'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Scale,
  ShieldCheck,
  Search,
  Calendar,
  Download,
  RefreshCw,
  Clock,
  Camera,
  Info,
  FileText,
  CheckSquare,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Check,
  Building2,
  Archive,
} from 'lucide-react';

/**
 * Status Badge for Batches
 */
function BatchStatusBadge({ status }) {
  const statusStyles = {
    Tersedia: 'bg-[#EAF5F0] text-[#16805D] border-[#16805D]/20',
    Selesai: 'bg-[#EAF5F0] text-[#16805D] border-[#16805D]/20',
    Diproses: 'bg-[#FEF3C7] text-[#B7791F] border-[#B7791F]/20',
    Dijadwalkan: 'bg-[#EFF6FF] text-[#2563EB] border-[#2563EB]/20',
    'Perlu revisi': 'bg-[#FEE2E2] text-[#C2413B] border-[#C2413B]/20',
  };

  const style = statusStyles[status] || 'bg-[#F4F6F5] text-[#66736C] border-[#E5EAE7]';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${style}`}
    >
      {status}
    </span>
  );
}

/**
 * Route Badge (Kompos vs BSF)
 */
function RouteBadge({ jalur }) {
  const isKompos = jalur === 'Kompos';
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
        isKompos
          ? 'bg-[#EAF5F0] text-[#16805D] border border-[#16805D]/15'
          : 'bg-[#EFF6FF] text-[#2563EB] border border-[#2563EB]/15'
      }`}
    >
      {jalur}
    </span>
  );
}

/**
 * Pulse Skeleton matching exact layout dimensions
 */
function BatchSkeleton() {
  return (
    <div className="space-y-6 animate-pulse bg-white" aria-busy="true" aria-label="Memuat data batch material">
      {/* Top Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-5 w-72 bg-gray-200 rounded-full" />
          <div className="h-7 w-64 bg-gray-200 rounded-lg" />
          <div className="h-4 w-96 bg-gray-100 rounded-md" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-16 w-36 bg-gray-200 rounded-2xl" />
          <div className="h-16 w-36 bg-gray-200 rounded-2xl" />
        </div>
      </div>

      {/* Filter Row Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-10 bg-gray-100 rounded-xl" />
        ))}
      </div>

      {/* Grid 7:5 Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 p-6 rounded-2xl bg-white border border-[#E5EAE7] space-y-4">
          <div className="h-6 w-48 bg-gray-200 rounded" />
          <div className="space-y-3 pt-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-14 w-full bg-gray-100 rounded-xl" />
            ))}
          </div>
        </div>
        <div className="lg:col-span-5 p-6 rounded-2xl bg-white border border-[#E5EAE7] space-y-5">
          <div className="h-7 w-48 bg-gray-200 rounded" />
          <div className="h-24 w-full bg-gray-100 rounded-xl" />
          <div className="h-32 w-full bg-gray-100 rounded-xl" />
          <div className="h-28 w-full bg-gray-100 rounded-xl" />
          <div className="h-10 w-full bg-gray-200 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export default function BatchPage() {
  const [batches, setBatches] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua Status');
  const [categoryFilter, setCategoryFilter] = useState('Semua Kategori');
  const [routeFilter, setRouteFilter] = useState('Semua Jalur');
  const [dateRange, setDateRange] = useState('26 Nov 2026');

  // Selected processor for offering in Section 5
  const [selectedProcessorId, setSelectedProcessorId] = useState('PGL-01');

  // Toast feedback
  const [toast, setToast] = useState(null);

  /**
   * Fetch batch records dynamically from /data/batch-material.json
   */
  useEffect(() => {
    let active = true;

    async function fetchBatches() {
      try {
        const response = await fetch('/data/batch-material.json', {
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Gagal memuat batch material (HTTP ${response.status})`);
        }

        const data = await response.json();
        if (active) {
          setBatches(Array.isArray(data) ? data : []);
          if (Array.isArray(data) && data.length > 0) {
            setSelectedBatchId(data[0].id);
          }
          setIsLoading(false);
          setError(null);
        }
      } catch (err) {
        if (active) {
          console.error('Fetch batch error:', err);
          setError(err?.message || 'Terjadi gangguan saat mengambil data batch material.');
          setIsLoading(false);
        }
      }
    }

    fetchBatches();

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
   * Reset All Filters to Defaults
   */
  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('Semua Status');
    setCategoryFilter('Semua Kategori');
    setRouteFilter('Semua Jalur');
    setDateRange('26 Nov 2026');
  };

  /**
   * Filtered Batches based on controls
   */
  const filteredBatches = useMemo(() => {
    return batches.filter((batch) => {
      // Search by Code or Source
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const idMatch = batch.id?.toLowerCase().includes(q);
        const refMatch = batch.refId?.toLowerCase().includes(q);
        const sourceMatch = batch.sumber?.toLowerCase().includes(q);
        if (!idMatch && !refMatch && !sourceMatch) return false;
      }

      // Status Filter
      if (statusFilter !== 'Semua Status' && batch.status !== statusFilter) {
        return false;
      }

      // Category Filter
      if (categoryFilter !== 'Semua Kategori' && batch.kategori !== categoryFilter) {
        return false;
      }

      // Route Filter
      if (routeFilter !== 'Semua Jalur' && batch.jalur !== routeFilter) {
        return false;
      }

      return true;
    });
  }, [batches, searchQuery, statusFilter, categoryFilter, routeFilter]);

  // Selected Active Batch
  const selectedBatch = useMemo(() => {
    if (!batches.length) return null;
    return batches.find((b) => b.id === selectedBatchId) || filteredBatches[0] || batches[0];
  }, [batches, selectedBatchId, filteredBatches]);

  /**
   * Action: Approve & Offer to Processor
   */
  const handleApproveAndOffer = (batch) => {
    const processor = batch.pengolahSekitar?.find((p) => p.id === selectedProcessorId) || batch.pengolahSekitar?.[0];
    const processorName = processor?.nama || 'Pengolah Terpilih';

    setBatches((prev) =>
      prev.map((b) =>
        b.id === batch.id ? { ...b, status: 'Diproses' } : b
      )
    );

    setToast({
      type: 'success',
      message: `Batch ${batch.id} (${batch.berat}) berhasil disetujui & ditawarkan ke "${processorName}".`,
    });
    setTimeout(() => setToast(null), 4000);
  };

  /**
   * Action: Request Revision
   */
  const handleRequestRevision = (batch) => {
    setBatches((prev) =>
      prev.map((b) =>
        b.id === batch.id ? { ...b, status: 'Perlu revisi' } : b
      )
    );

    setToast({
      type: 'warning',
      message: `Permintaan revisi manifest telah dikirimkan ke mitra sumber "${batch.sumber}".`,
    });
    setTimeout(() => setToast(null), 4000);
  };

  // 1. Loading State
  if (isLoading) {
    return <BatchSkeleton />;
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
          Gagal Memuat Data Batch Material
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

  // Metrics KPI calculations
  const totalVolumeKg = batches.reduce((acc, curr) => acc + (curr.beratAngka || 0), 0);
  const openVerificationCount = batches.filter((b) => b.status === 'Tersedia' || b.status === 'Diproses').length;

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
              : 'bg-amber-50 border-amber-200 text-[#B7791F]'
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

      {/* ========================================================= */}
      {/* 3. PAGE HEADER & METRIC KPI CARDS                         */}
      {/* ========================================================= */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-1">
        <div>
          {/* Top Meta Tag / Breadcrumb */}
          <div className="flex items-center flex-wrap gap-1.5">
            <span className="inline-flex items-center rounded-full uppercase text-[11px] font-semibold bg-[#F4F6F5] text-[#17231D] px-2.5 py-0.5 border border-[#E5EAE7]">
              WILAYAH OPERASIONAL BANYUMAS
            </span>
            <span className="text-xs text-[#66736C]">
              Pusat Distribusi Purwokerto
            </span>
          </div>

          {/* Main Title & Subtitle */}
          <h1 className="text-2xl font-bold text-[#17231D] tracking-tight mt-1">
            Tata Kelola Batch Material
          </h1>
          <p className="text-sm text-[#66736C] mt-0.5">
            Monitoring penimbangan, alokasi jalur sirkular, dan persetujuan pengolah di Purwokerto
          </p>
        </div>

        {/* Top Right Metric KPI Cards */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Card 1: Volume Aktif */}
          <article className="p-3.5 rounded-2xl bg-white border border-[#E5EAE7] shadow-xs flex items-center gap-3 min-w-[140px]">
            <div className="p-2 rounded-xl bg-[#EAF5F0] text-[#176B4D]">
              <Scale className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#66736C] tracking-wider uppercase leading-tight">
                VOLUME AKTIF
              </p>
              <p className="text-xl font-bold text-[#17231D] leading-tight mt-0.5">
                {totalVolumeKg} kg
              </p>
            </div>
          </article>

          {/* Card 2: Verifikasi Terbuka */}
          <article className="p-3.5 rounded-2xl bg-white border border-[#E5EAE7] shadow-xs flex items-center gap-3 min-w-[140px]">
            <div className="p-2 rounded-xl bg-[#EFF6FF] text-[#2563EB]">
              <ShieldCheck className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#66736C] tracking-wider uppercase leading-tight">
                VERIFIKASI TERBUKA
              </p>
              <p className="text-xl font-bold text-[#17231D] leading-tight mt-0.5">
                {openVerificationCount} batch
              </p>
            </div>
          </article>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. FILTER CONTROLS & ACTIVE CHIPS BAR                     */}
      {/* ========================================================= */}
      <section aria-label="Filter Kontrol Batch" className="space-y-3">
        {/* Filter Inputs Row (5 Columns) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {/* 1. Search Input */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#66736C]">
              <Search className="w-4 h-4" aria-hidden="true" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="BR-2611"
              aria-label="Cari kode atau nama sumber"
              className="w-full pl-9 pr-3.5 py-2 bg-[#F4F6F5] text-xs text-[#17231D] placeholder-[#66736C] rounded-xl border border-[#E5EAE7] focus:outline-none focus:ring-2 focus:ring-[#176B4D] focus:border-[#176B4D] transition-all"
            />
          </div>

          {/* 2. Status Select */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter Status"
              className="w-full bg-[#F4F6F5] border border-[#E5EAE7] text-xs font-medium text-[#17231D] px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#176B4D] cursor-pointer"
            >
              <option value="Semua Status">Semua Status</option>
              <option value="Tersedia">Tersedia</option>
              <option value="Diproses">Diproses</option>
              <option value="Dijadwalkan">Dijadwalkan</option>
              <option value="Perlu revisi">Perlu revisi</option>
              <option value="Selesai">Selesai</option>
            </select>
          </div>

          {/* 3. Kategori Select */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              aria-label="Filter Kategori"
              className="w-full bg-[#F4F6F5] border border-[#E5EAE7] text-xs font-medium text-[#17231D] px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#176B4D] cursor-pointer"
            >
              <option value="Semua Kategori">Semua Kategori</option>
              <option value="Sisa sayur & buah">Sisa sayur &amp; buah</option>
              <option value="Sisa olahan dapur">Sisa olahan dapur</option>
              <option value="Limbah pasar">Limbah pasar</option>
              <option value="Dedaunan & ranting">Dedaunan &amp; ranting</option>
            </select>
          </div>

          {/* 4. Jalur Select */}
          <div>
            <select
              value={routeFilter}
              onChange={(e) => setRouteFilter(e.target.value)}
              aria-label="Filter Jalur"
              className="w-full bg-[#F4F6F5] border border-[#E5EAE7] text-xs font-medium text-[#17231D] px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#176B4D] cursor-pointer"
            >
              <option value="Semua Jalur">Semua Jalur</option>
              <option value="Kompos">Kompos</option>
              <option value="BSF / Maggot">BSF / Maggot</option>
            </select>
          </div>

          {/* 5. Date Range */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#176B4D]">
              <Calendar className="w-4 h-4" aria-hidden="true" />
            </span>
            <input
              type="text"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              aria-label="Rentang Tanggal"
              className="w-full pl-9 pr-3.5 py-2 bg-[#F4F6F5] text-xs font-medium text-[#17231D] rounded-xl border border-[#E5EAE7] focus:outline-none focus:ring-2 focus:ring-[#176B4D] focus:border-[#176B4D] transition-all"
            />
          </div>
        </div>

        {/* Filter Aktif Row & Chips */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-[#66736C]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold uppercase tracking-wider text-[11px] text-[#66736C]">
              FILTER AKTIF:
            </span>

            {/* Chip 1 */}
            <span className="inline-flex items-center gap-1.5 bg-[#F4F6F5] border border-[#E5EAE7] rounded-lg px-2.5 py-1 text-xs font-medium text-[#17231D]">
              <span>Kategori: {categoryFilter === 'Semua Kategori' ? 'Semua' : categoryFilter}</span>
              <button
                type="button"
                onClick={() => setCategoryFilter('Semua Kategori')}
                className="hover:text-[#C2413B] text-[#66736C] cursor-pointer"
                aria-label="Hapus filter kategori"
              >
                ✕
              </button>
            </span>

            {/* Chip 2 */}
            <span className="inline-flex items-center gap-1.5 bg-[#F4F6F5] border border-[#E5EAE7] rounded-lg px-2.5 py-1 text-xs font-medium text-[#17231D]">
              <span>Jalur: {routeFilter === 'Semua Jalur' ? 'Kompos + BSF' : routeFilter}</span>
              <button
                type="button"
                onClick={() => setRouteFilter('Semua Jalur')}
                className="hover:text-[#C2413B] text-[#66736C] cursor-pointer"
                aria-label="Hapus filter jalur"
              >
                ✕
              </button>
            </span>

            {/* Chip 3 */}
            <span className="inline-flex items-center gap-1.5 bg-[#F4F6F5] border border-[#E5EAE7] rounded-lg px-2.5 py-1 text-xs font-medium text-[#17231D]">
              <span>Rentang: 7 Hari Terakhir</span>
              <button
                type="button"
                onClick={() => setDateRange('26 Nov 2026')}
                className="hover:text-[#C2413B] text-[#66736C] cursor-pointer"
                aria-label="Hapus filter rentang waktu"
              >
                ✕
              </button>
            </span>
          </div>

          {/* Reset Filter Button */}
          <button
            type="button"
            onClick={handleResetFilters}
            className="hover:text-[#176B4D] font-medium transition cursor-pointer text-xs underline decoration-dotted"
          >
            Reset Filter
          </button>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 5. TWO-COLUMN SPLIT LAYOUT (7:5 DESKTOP GRID)             */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ======================================================= */}
        {/* A. LEFT COLUMN: BATCH LIST TABLE (lg:col-span-7)        */}
        {/* ======================================================= */}
        <section className="lg:col-span-7 bg-white border border-[#E5EAE7] rounded-2xl p-5 shadow-sm flex flex-col justify-between min-h-[580px]">
          <div>
            {/* Table Header Section */}
            <div className="flex items-center justify-between pb-3 mb-2">
              <div>
                <h2 className="font-bold text-base text-[#17231D] tracking-tight">
                  Daftar Batch Terdaftar
                </h2>
                <p className="text-xs text-[#66736C]">
                  Antrean batch residu organik siap proses dan perlu tindak lanjut
                </p>
              </div>

              {/* Action Buttons: Export & Refresh */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  title="Ekspor CSV"
                  aria-label="Ekspor CSV"
                  onClick={() => {
                    setToast({
                      type: 'success',
                      message: 'Data batch material berhasil diekspor (Format CSV).',
                    });
                    setTimeout(() => setToast(null), 3000);
                  }}
                  className="border border-[#E5EAE7] rounded-lg p-2 text-[#66736C] hover:bg-[#F4F6F5] hover:text-[#17231D] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176B4D] cursor-pointer"
                >
                  <Download className="w-4 h-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  title="Segarkan data batch"
                  aria-label="Segarkan data batch"
                  onClick={handleRetry}
                  className="border border-[#E5EAE7] rounded-lg p-2 text-[#66736C] hover:bg-[#F4F6F5] hover:text-[#17231D] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176B4D] cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Table Body */}
            {filteredBatches.length === 0 ? (
              <div className="p-10 text-center border border-dashed border-[#E5EAE7] rounded-xl my-4">
                <Archive className="w-8 h-8 text-[#66736C] mx-auto mb-2" />
                <p className="text-sm font-semibold text-[#17231D]">Tidak ada batch yang cocok</p>
                <p className="text-xs text-[#66736C] mt-1">
                  Ubah kata kunci pencarian atau reset filter untuk menampilkan kembali daftar batch.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="mt-3 text-xs font-semibold text-[#176B4D] hover:underline"
                >
                  Reset Semua Filter
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-5 px-5">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#E5EAE7] text-[#66736C] font-semibold">
                      <th scope="col" className="pb-3 pl-3 font-medium">Kode Batch</th>
                      <th scope="col" className="pb-3 font-medium">Sumber Material</th>
                      <th scope="col" className="pb-3 font-medium hidden sm:table-cell">Kategori</th>
                      <th scope="col" className="pb-3 font-medium">Berat</th>
                      <th scope="col" className="pb-3 pr-3 font-medium">Jalur</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5EAE7]/60">
                    {filteredBatches.map((batch) => {
                      const isSelected = selectedBatch?.id === batch.id;

                      return (
                        <tr
                          key={batch.id}
                          onClick={() => setSelectedBatchId(batch.id)}
                          tabIndex={0}
                          role="button"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              setSelectedBatchId(batch.id);
                            }
                          }}
                          className={`cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-[#F4F6F5]/70 border-l-4 border-l-[#176B4D]'
                              : 'hover:bg-[#F4F6F5]/50'
                          }`}
                        >
                          {/* Kode Batch */}
                          <td className="py-3.5 pl-3">
                            <div className="flex items-center gap-1.5 font-bold text-[#17231D]">
                              <span className="text-[#176B4D] text-[10px] leading-none">●</span>
                              <span>{batch.id}</span>
                            </div>
                            <span className="text-[10px] text-[#66736C] font-mono block pl-3">
                              {batch.refId}
                            </span>
                          </td>

                          {/* Sumber Material */}
                          <td className="py-3.5">
                            <p className="font-semibold text-[#17231D] leading-tight">
                              {batch.sumber}
                            </p>
                            <p className="text-[11px] text-[#66736C] mt-0.5">
                              {batch.lokasiSubtext}
                            </p>
                          </td>

                          {/* Kategori */}
                          <td className="py-3.5 text-[#66736C] hidden sm:table-cell">
                            {batch.kategori}
                          </td>

                          {/* Berat */}
                          <td className="py-3.5 font-bold text-[#17231D]">
                            {batch.berat}
                          </td>

                          {/* Jalur */}
                          <td className="py-3.5 pr-3">
                            <RouteBadge jalur={batch.jalur} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Table Footer */}
          <footer className="pt-4 mt-4 border-t border-[#E5EAE7] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#66736C]">
            <span>
              Menampilkan 1–{filteredBatches.length} dari {batches.length} batch aktif
            </span>

            {/* Pagination */}
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
                className="w-7 h-7 rounded-lg border border-[#E5EAE7] text-[#17231D] hover:bg-[#F4F6F5] flex items-center justify-center"
              >
                2
              </button>
              <button
                type="button"
                className="w-7 h-7 rounded-lg border border-[#E5EAE7] text-[#17231D] hover:bg-[#F4F6F5] flex items-center justify-center"
              >
                3
              </button>
              <button
                type="button"
                aria-label="Halaman selanjutnya"
                className="w-7 h-7 rounded-lg border border-[#E5EAE7] flex items-center justify-center text-[#66736C] hover:bg-[#F4F6F5] cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </footer>
        </section>

        {/* ======================================================= */}
        {/* B. RIGHT COLUMN: BATCH DETAIL PANEL (lg:col-span-5)     */}
        {/* ======================================================= */}
        <aside className="lg:col-span-5 bg-white border border-[#E5EAE7] rounded-2xl p-6 shadow-sm flex flex-col gap-5">
          {selectedBatch ? (
            <>
              {/* 1. Header Row */}
              <header className="pb-3 border-b border-[#E5EAE7]">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-lg font-bold text-[#17231D] tracking-tight">
                    Detail Batch {selectedBatch.id}
                  </h2>
                  <div className="flex items-center gap-1.5">
                    <BatchStatusBadge status={selectedBatch.status} />
                    <span className="text-[11px] font-mono bg-[#F4F6F5] text-[#17231D] px-2 py-0.5 rounded border border-[#E5EAE7]">
                      ID: {selectedBatch.refId}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-[#66736C] mt-1.5">
                  <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{selectedBatch.waktuPengajuan}</span>
                </div>
              </header>

              {/* 2. Dokumentasi Verifikasi Sumber */}
              <section aria-labelledby="doc-heading" className="space-y-2.5">
                <h3 id="doc-heading" className="text-xs font-bold text-[#66736C] uppercase tracking-wider">
                  DOKUMENTASI VERIFIKASI SUMBER
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {/* Box 1: Wadah */}
                  <div className="bg-[#F4F6F5] border border-[#E5EAE7] rounded-xl p-3 text-center text-xs space-y-1">
                    <div className="w-8 h-8 rounded-lg bg-white border border-[#E5EAE7] text-[#176B4D] flex items-center justify-center mx-auto mb-1">
                      <Camera className="w-4 h-4" aria-hidden="true" />
                    </div>
                    <p className="font-semibold text-[#17231D] leading-tight">
                      {selectedBatch.dokumentasi?.wadah || 'Wadah ember organik'}
                    </p>
                    <p className="text-[11px] text-[#66736C] font-mono">
                      {selectedBatch.dokumentasi?.wadahFormat || 'Format: JPG • 2.1 MB'}
                    </p>
                  </div>

                  {/* Box 2: Timbangan */}
                  <div className="bg-[#F4F6F5] border border-[#E5EAE7] rounded-xl p-3 text-center text-xs space-y-1">
                    <div className="w-8 h-8 rounded-lg bg-white border border-[#E5EAE7] text-[#176B4D] flex items-center justify-center mx-auto mb-1">
                      <Scale className="w-4 h-4" aria-hidden="true" />
                    </div>
                    <p className="font-semibold text-[#17231D] leading-tight">
                      {selectedBatch.dokumentasi?.timbangan || 'Timbangan fisik'}
                    </p>
                    <p className="text-[11px] text-[#66736C]">
                      {selectedBatch.dokumentasi?.timbanganDetail || 'Tervalidasi digital'}
                    </p>
                  </div>
                </div>
              </section>

              {/* 3. Data Key-Value Overview */}
              <section aria-labelledby="overview-heading" className="space-y-2.5 bg-[#F4F6F5]/50 border border-[#E5EAE7] rounded-xl p-4 text-xs">
                <h3 id="overview-heading" className="sr-only">
                  Ringkasan Kunci Material
                </h3>
                <div className="space-y-3">
                  {/* Sumber Material */}
                  <div>
                    <span className="text-[#66736C] block">Sumber Material:</span>
                    <p className="font-semibold text-[#17231D] mt-0.5">
                      {selectedBatch.sumber} ({selectedBatch.pj})
                    </p>
                    <p className="text-[11px] text-[#66736C] mt-0.5">
                      {selectedBatch.alamat}
                    </p>
                  </div>

                  {/* Berat Terverifikasi */}
                  <div className="pt-2 border-t border-[#E5EAE7]">
                    <span className="text-[#66736C] block">Berat Terverifikasi:</span>
                    <p className="text-2xl font-bold text-[#176B4D] mt-0.5">
                      {selectedBatch.berat}
                    </p>
                  </div>

                  {/* Kategori Residu */}
                  <div className="pt-2 border-t border-[#E5EAE7]">
                    <span className="text-[#66736C] block">Kategori Residu:</span>
                    <p className="font-medium text-[#17231D] mt-0.5">
                      {selectedBatch.kategoriDetail || selectedBatch.kategori}
                    </p>
                  </div>

                  {/* Metode Penjemputan */}
                  <div className="pt-2 border-t border-[#E5EAE7]">
                    <span className="text-[#66736C] block">Metode Penjemputan:</span>
                    <p className="font-medium text-[#17231D] mt-0.5">
                      {selectedBatch.metodePenjemputan}
                    </p>
                  </div>
                </div>
              </section>

              {/* 4. Riwayat Audit Operasional (Timeline Stepper) */}
              <section aria-labelledby="timeline-heading" className="space-y-3">
                <h3 id="timeline-heading" className="text-xs font-bold text-[#66736C] uppercase tracking-wider">
                  RIWAYAT AUDIT OPERASIONAL
                </h3>
                <div className="relative pl-6 space-y-4">
                  {/* Connecting Line */}
                  <div className="absolute top-2 bottom-2 left-2 w-0.5 bg-[#E5EAE7]" />

                  {selectedBatch.auditHistory?.map((item, idx) => {
                    const isDone = item.status === 'done';
                    return (
                      <div key={idx} className="relative flex items-start gap-2.5">
                        {/* Dot indicator */}
                        <div
                          className={`absolute -left-6 top-1 w-2.5 h-2.5 rounded-full ring-4 ring-white ${
                            isDone ? 'bg-[#176B4D]' : 'bg-[#B7791F]'
                          }`}
                        />
                        <div className="text-xs">
                          <p className="font-bold text-[#17231D]">
                            {item.step} <span className="text-[#66736C] font-normal">| {item.time}</span>
                          </p>
                          <p className="text-[11px] text-[#66736C] mt-0.5">
                            {item.subtext}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* 5. Tawarkan ke Pengolah Sekitar */}
              <section aria-labelledby="offer-heading" className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 id="offer-heading" className="text-xs font-bold text-[#66736C] uppercase tracking-wider">
                    TAWARKAN KE PENGOLAH SEKITAR
                  </h3>
                  <span className="text-[11px] text-[#66736C]">
                    Purwokerto Radius 5 km
                  </span>
                </div>

                <div className="space-y-2">
                  {selectedBatch.pengolahSekitar?.map((opt) => {
                    const isSelected = selectedProcessorId === opt.id;
                    return (
                      <div
                        key={opt.id}
                        role="radio"
                        aria-checked={isSelected}
                        tabIndex={0}
                        onClick={() => setSelectedProcessorId(opt.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            setSelectedProcessorId(opt.id);
                          }
                        }}
                        className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-start justify-between gap-3 ${
                          isSelected
                            ? 'border-[#176B4D] bg-[#EAF5F0]/60 ring-1 ring-[#176B4D]'
                            : 'border-[#E5EAE7] bg-[#F4F6F5]/40 hover:bg-[#F4F6F5]'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <div
                            className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                              isSelected
                                ? 'border-[#176B4D] bg-[#176B4D] text-white'
                                : 'border-[#66736C] bg-white'
                            }`}
                          >
                            {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 font-bold text-[#17231D]">
                              <span>{opt.nama}</span>
                              <span className="text-[#66736C] font-normal">• {opt.jarak}</span>
                            </div>
                            <p className="text-[11px] text-[#66736C] mt-0.5">
                              Jalur: {opt.jalur} • Kapasitas sisa: {opt.sisaKapasitas}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* 6. Regulatory Disclaimer */}
              <aside className="bg-[#F4F6F5] border border-[#E5EAE7] rounded-xl p-3 text-xs text-[#66736C] flex items-start gap-2">
                <Info className="w-4 h-4 text-[#176B4D] shrink-0 mt-0.5" aria-hidden="true" />
                <p className="text-[11px] leading-relaxed">
                  Kelayakan material ditentukan oleh mitra pengolah, bukan oleh aplikasi.
                </p>
              </aside>

              {/* 7. Action Bottom Buttons */}
              <footer className="grid grid-cols-2 gap-3 pt-2">
                {/* Minta Revisi */}
                <button
                  type="button"
                  onClick={() => handleRequestRevision(selectedBatch)}
                  className="border border-[#E5EAE7] hover:bg-[#F4F6F5] text-sm font-medium py-2.5 rounded-xl text-[#17231D] flex items-center justify-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176B4D] cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-[#66736C]" aria-hidden="true" />
                  <span>Minta Revisi</span>
                </button>

                {/* Setujui & Tawarkan */}
                <button
                  type="button"
                  onClick={() => handleApproveAndOffer(selectedBatch)}
                  className="bg-[#176B4D] hover:bg-[#104D38] text-white text-sm font-medium py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176B4D] cursor-pointer"
                >
                  <CheckSquare className="w-4 h-4" aria-hidden="true" />
                  <span>Setujui &amp; Tawarkan</span>
                </button>
              </footer>
            </>
          ) : (
            <div className="p-8 text-center text-[#66736C] text-xs">
              Pilih salah satu batch dari tabel di sebelah kiri untuk melihat rincian manifest material.
            </div>
          )}
        </aside>

      </div>

    </div>
  );
}
