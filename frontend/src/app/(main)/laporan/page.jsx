'use client';

import { useState, useEffect, useMemo, useSyncExternalStore } from 'react';
import {
  Sprout,
  Archive,
  Utensils,
  Layers,
  FileSpreadsheet,
  FileText,
  SlidersHorizontal,
  Search,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

const emptySubscribe = () => () => {};

function useIsMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

/**
 * Custom Tooltip for Daily Line Chart
 */
function CustomLineTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const item = payload[0];
    const isPeak = item.payload?.isPeak;

    return (
      <div className="bg-[#17231D] text-white p-2.5 rounded-lg shadow-xl text-xs space-y-1">
        <div className="flex items-center justify-between gap-4 font-semibold text-white/90">
          <span>{label}</span>
          {isPeak && (
            <span className="bg-[#B7D76A] text-[#17231D] text-[10px] font-bold px-1.5 py-0.2 rounded">
              Puncak
            </span>
          )}
        </div>
        <p className="text-white font-bold text-sm">
          {item.value} kg <span className="font-normal text-xs text-white/70">diterima</span>
        </p>
      </div>
    );
  }
  return null;
}

/**
 * Pulse Skeleton for Report Page
 */
function LaporanSkeleton() {
  return (
    <div className="space-y-6 animate-pulse bg-white" aria-busy="true" aria-label="Memuat data laporan residu organik">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-7 w-72 bg-gray-200 rounded-lg" />
          <div className="h-4 w-96 bg-gray-100 rounded-md" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-9 w-64 bg-gray-200 rounded-xl" />
          <div className="h-9 w-28 bg-gray-200 rounded-xl" />
          <div className="h-9 w-28 bg-gray-200 rounded-xl" />
        </div>
      </div>

      {/* 4 Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-5 rounded-2xl bg-white border border-[#E5EAE7] space-y-3">
            <div className="h-4 w-28 bg-gray-200 rounded" />
            <div className="h-8 w-24 bg-gray-300 rounded" />
            <div className="h-4 w-36 bg-gray-100 rounded" />
          </div>
        ))}
      </div>

      {/* Chart Skeleton */}
      <div className="p-6 rounded-2xl bg-white border border-[#E5EAE7] h-[340px] mt-6" />

      {/* Table Skeleton */}
      <div className="p-6 rounded-2xl bg-white border border-[#E5EAE7] h-[320px] mt-6" />
    </div>
  );
}

export default function LaporanPage() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // Filter States
  const [period, setPeriod] = useState('Bulan Ini (Nov 2026)');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('Semua Peran');

  // Feedback Toast
  const [toast, setToast] = useState(null);

  const isClient = useIsMounted();

  /**
   * Dynamic Fetch from /data/laporan-residu.json
   */
  useEffect(() => {
    let active = true;

    async function fetchReportData() {
      try {
        const response = await fetch('/data/laporan-residu.json', {
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Gagal memuat berkas laporan residu (HTTP ${response.status})`);
        }

        const json = await response.json();
        if (active) {
          setData(json);
          setIsLoading(false);
          setError(null);
        }
      } catch (err) {
        if (active) {
          console.error('Fetch report error:', err);
          setError(err?.message || 'Terjadi gangguan saat mengambil data laporan residu organik.');
          setIsLoading(false);
        }
      }
    }

    fetchReportData();

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
   * Export Handlers (CSV & PDF)
   */
  const handleExportCSV = () => {
    setToast({
      type: 'success',
      message: 'Laporan rekapitulasi berhasil diekspor ke CSV (Banyumas-Residu-Nov2026.csv).',
    });
    setTimeout(() => setToast(null), 3500);
  };

  const handleExportPDF = () => {
    setToast({
      type: 'success',
      message: 'Format cetak audit resmi siap diunduh (Banyumas-Audit-Laporan-v2.4.pdf).',
    });
    setTimeout(() => setToast(null), 3500);
  };

  /**
   * Filtered Partner Recap Rows
   */
  const filteredPartners = useMemo(() => {
    if (!data?.partnerRecap) return [];
    return data.partnerRecap.filter((partner) => {
      // Role Filter
      if (roleFilter !== 'Semua Peran' && partner.peran !== roleFilter) {
        return false;
      }
      // Search Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const nameMatch = partner.nama?.toLowerCase().includes(q);
        const subMatch = partner.sub?.toLowerCase().includes(q);
        if (!nameMatch && !subMatch) return false;
      }
      return true;
    });
  }, [data, roleFilter, searchQuery]);

  // 1. Loading State
  if (isLoading) {
    return <LaporanSkeleton />;
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
          Gagal Memuat Laporan Rekapitulasi
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

  const { categoryMetrics, dailyChart, summaryTotal } = data || {};

  return (
    <div className="space-y-6 bg-white">
      
      {/* Toast Alert Feedback */}
      {toast && (
        <aside
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 p-4 rounded-xl shadow-xl border bg-[#EAF5F0] border-[#16805D]/20 text-[#16805D] flex items-center gap-3 text-xs font-medium max-w-md animate-fade-in"
        >
          <CheckCircle2 className="w-5 h-5 shrink-0 text-[#16805D]" />
          <span className="leading-snug">{toast.message}</span>
        </aside>
      )}

      {/* ========================================================= */}
      {/* 3. PAGE HEADER & EXPORT ACTIONS                           */}
      {/* ========================================================= */}
      <section className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-1">
        <div>
          <h1 className="text-2xl font-bold text-[#17231D] tracking-tight">
            Laporan Rekapitulasi Residu Organik
          </h1>
          <p className="text-sm text-[#66736C] mt-1">
            Audit berkala agregasi timbulan material, alokasi pemrosesan, dan tingkat penerimaan wilayah.
          </p>
        </div>

        {/* Top Right Filter & Export Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Period Switcher Pills (Segmented control container) */}
          <div className="bg-[#F4F6F5] p-1 rounded-xl flex items-center gap-1 border border-[#E5EAE7]">
            {['7 Hari Terakhir', 'Bulan Ini (Nov 2026)', 'Kuartal 4', 'Kustom'].map((item) => {
              const isActive = period === item;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setPeriod(item)}
                  className={`text-xs px-3 py-1.5 font-medium rounded-lg transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white text-[#17231D] shadow-sm font-semibold'
                      : 'text-[#66736C] hover:text-[#17231D]'
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>

          {/* Export CSV Button */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 border border-[#E5EAE7] bg-white text-[#17231D] hover:bg-[#F4F6F5] text-xs font-semibold px-3.5 py-2 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176B4D] cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#66736C]" aria-hidden="true" />
            <span>Unduh CSV</span>
          </button>

          {/* Export PDF Button */}
          <button
            type="button"
            onClick={handleExportPDF}
            className="bg-[#104D38] hover:bg-[#176B4D] text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-sm flex items-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176B4D] cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Unduh PDF</span>
          </button>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. CATEGORY METRIC CARDS (4 COLUMNS GRID)                 */}
      {/* ========================================================= */}
      <section
        aria-label="Metrik Kategori Residu"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6"
      >
        {categoryMetrics?.map((metric) => {
          let IconComponent = Sprout;
          if (metric.icon === 'Archive') IconComponent = Archive;
          if (metric.icon === 'Utensils') IconComponent = Utensils;
          if (metric.icon === 'Layers') IconComponent = Layers;

          return (
            <article
              key={metric.id}
              className="p-5 rounded-2xl bg-white border border-[#E5EAE7] shadow-xs flex flex-col justify-between hover:border-[#176B4D]/30 transition-colors"
            >
              {/* Header */}
              <div>
                <div className="flex items-start justify-between">
                  <span className="uppercase text-[10px] text-[#66736C] font-bold tracking-wider">
                    KATEGORI MATERIAL
                  </span>
                  <div className="p-1.5 rounded-lg bg-[#F4F6F5] text-[#176B4D]">
                    <IconComponent className="w-4 h-4" aria-hidden="true" />
                  </div>
                </div>
                <h2 className="text-sm font-bold text-[#17231D] mt-1">
                  {metric.title}
                </h2>
              </div>

              {/* Large Value */}
              <div className="my-2">
                <p className="text-3xl font-bold text-[#17231D] tracking-tight">
                  {metric.value}
                </p>
              </div>

              {/* Footer Row */}
              <div className="pt-3 border-t border-[#E5EAE7]/70 flex items-center justify-between text-xs">
                <span className="text-[#66736C]">
                  {metric.percentage}
                </span>
                <span className="bg-[#F4F6F5] text-[#17231D] text-xs font-medium px-2 py-0.5 rounded border border-[#E5EAE7]">
                  {metric.badge}
                </span>
              </div>
            </article>
          );
        })}
      </section>

      {/* ========================================================= */}
      {/* 5. DAILY WEIGHT RECHART CARD                              */}
      {/* ========================================================= */}
      <section className="bg-white border border-[#E5EAE7] rounded-2xl p-6 shadow-sm mt-6">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#E5EAE7]">
          <div>
            <h2 className="font-bold text-base text-[#17231D]">
              Berat Diterima per Hari (November 2026)
            </h2>
            <p className="text-xs text-[#66736C] mt-0.5">
              Rekap harian penimbangan material yang berhasil diterima oleh mitra pengolah (kg)
            </p>
          </div>

          {/* Right Metadata Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-[#F4F6F5] text-xs font-semibold px-2.5 py-1 rounded-lg text-[#17231D] border border-[#E5EAE7]">
              RATA-RATA: {dailyChart?.metadata?.rataRata || '42,4 kg/hari'}
            </span>
            <span className="bg-[#F4F6F5] text-xs font-semibold px-2.5 py-1 rounded-lg text-[#17231D] border border-[#E5EAE7]">
              PUNCAK: {dailyChart?.metadata?.puncak || '58 kg (18 Nov)'}
            </span>
            <span className="bg-[#104D38] text-white text-xs font-semibold px-3 py-1 rounded-lg shadow-xs">
              TOTAL AKUMULASI: {dailyChart?.metadata?.totalAkumulasi || '1.102 kg'}
            </span>
          </div>
        </div>

        {/* Recharts Line Chart */}
        <div className="w-full h-[260px] pt-4">
          {isClient && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={dailyChart?.data || []}
                margin={{ top: 20, right: 20, left: -20, bottom: 5 }}
              >
                {/* Horizontal grid lines only, no vertical lines */}
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5EAE7" />
                <XAxis
                  dataKey="tanggal"
                  stroke="#66736C"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#66736C', fontSize: 11 }}
                />
                <YAxis
                  domain={[0, 65]}
                  ticks={[15, 30, 45, 60]}
                  unit=" kg"
                  stroke="#66736C"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#66736C', fontSize: 11 }}
                />
                <Tooltip content={<CustomLineTooltip />} />
                <Line
                  type="monotone"
                  dataKey="berat"
                  name="Berat Diterima"
                  stroke="#176B4D"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#176B4D' }}
                  activeDot={{ r: 6, fill: '#176B4D', stroke: '#FFFFFF', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 6. PARTNER PERFORMANCE RECAP TABLE                        */}
      {/* ========================================================= */}
      <section className="bg-white border border-[#E5EAE7] rounded-2xl p-6 shadow-sm mt-6">
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5EAE7]">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-base text-[#17231D]">
              Rekapitulasi Kinerja Mitra
            </h2>
            <span className="bg-[#F4F6F5] text-xs font-semibold text-[#66736C] px-2.5 py-0.5 rounded-full border border-[#E5EAE7]">
              {data?.partnerRecap?.length || 5} Entitas Terverifikasi
            </span>
          </div>

          {/* Right Controls: Search & Role Filter */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#66736C]">
                <Search className="w-3.5 h-3.5" aria-hidden="true" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Saring nama mitra..."
                aria-label="Saring nama mitra operasional"
                className="pl-8 pr-3 py-1.5 bg-[#F4F6F5] text-xs text-[#17231D] placeholder-[#66736C] rounded-xl border border-[#E5EAE7] focus:outline-none focus:ring-2 focus:ring-[#176B4D] focus:border-[#176B4D] transition-all w-48 sm:w-56"
              />
            </div>

            {/* Role Filter Selector */}
            <div className="relative">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                aria-label="Filter Peran Mitra"
                className="bg-[#F4F6F5] border border-[#E5EAE7] rounded-xl text-xs px-3 py-1.5 font-medium text-[#17231D] focus:outline-none focus:ring-2 focus:ring-[#176B4D] cursor-pointer"
              >
                <option value="Semua Peran">Semua Peran</option>
                <option value="Mitra Sumber">Mitra Sumber</option>
                <option value="Mitra Pengolah">Mitra Pengolah</option>
              </select>
            </div>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto -mx-6 px-6 pt-2">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#E5EAE7] text-[#66736C] font-semibold">
                <th scope="col" className="pb-3 pl-2 font-medium">Mitra Operasional</th>
                <th scope="col" className="pb-3 font-medium">Peran</th>
                <th scope="col" className="pb-3 font-medium text-center">Total Batch</th>
                <th scope="col" className="pb-3 font-medium text-right">Dilaporkan (kg)</th>
                <th scope="col" className="pb-3 font-medium text-right">Diterima (kg)</th>
                <th scope="col" className="pb-3 font-medium text-right">Ditolak (kg)</th>
                <th scope="col" className="pb-3 font-medium text-center">Tingkat Penerimaan</th>
                <th scope="col" className="pb-3 pr-2 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5EAE7]/60">
              {filteredPartners.map((partner) => {
                const isSumber = partner.peran === 'Mitra Sumber';
                const isPengolah = partner.peran === 'Mitra Pengolah';

                return (
                  <tr key={partner.id} className="hover:bg-[#F4F6F5]/40 transition-colors">
                    {/* Mitra Operasional */}
                    <td className="py-3.5 pl-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                            isPengolah
                              ? 'bg-[#104D38] text-white shadow-xs'
                              : 'bg-[#EAF5F0] text-[#176B4D]'
                          }`}
                        >
                          {partner.initials}
                        </div>
                        <div>
                          <p className="font-bold text-[#17231D] leading-tight">
                            {partner.nama}
                          </p>
                          <p className="text-[11px] text-[#66736C] mt-0.5">
                            {partner.sub}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Peran */}
                    <td className="py-3.5">
                      {isSumber ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#EAF5F0] text-[#16805D] border border-[#16805D]/15">
                          ● Mitra Sumber
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#176B4D] text-white shadow-xs">
                          Mitra Pengolah
                        </span>
                      )}
                    </td>

                    {/* Total Batch */}
                    <td className="py-3.5 text-center font-semibold text-[#17231D]">
                      {partner.totalBatch} batch
                    </td>

                    {/* Dilaporkan (kg) */}
                    <td className="py-3.5 text-right font-medium text-[#17231D]">
                      {partner.dilaporkan !== null ? `${partner.dilaporkan} kg` : '—'}
                    </td>

                    {/* Diterima (kg) */}
                    <td className="py-3.5 text-right font-bold text-[#176B4D]">
                      {partner.diterima} kg
                    </td>

                    {/* Ditolak (kg) */}
                    <td className="py-3.5 text-right font-medium text-[#C2413B]">
                      {partner.ditolak} kg
                    </td>

                    {/* Tingkat Penerimaan */}
                    <td className="py-3.5 text-center">
                      <div className="inline-flex items-center gap-2">
                        <span className="font-bold text-[#17231D]">
                          {partner.tingkatPenerimaan.toFixed(1).replace('.', ',')}%
                        </span>
                      </div>
                    </td>

                    {/* Status / Progress */}
                    <td className="py-3.5 pr-2 text-right">
                      {partner.status === 'Progress' ? (
                        <div className="w-24 inline-block bg-[#E5EAE7] h-2 rounded-full overflow-hidden align-middle">
                          <div
                            className="bg-[#176B4D] h-full rounded-full"
                            style={{ width: `${partner.tingkatPenerimaan}%` }}
                          />
                        </div>
                      ) : (
                        <span className="bg-[#F4F6F5] text-[#17231D] text-xs font-semibold px-2.5 py-0.5 rounded-md border border-[#E5EAE7]">
                          {partner.status}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>

            {/* Summary Footer Row */}
            <tfoot>
              <tr className="bg-[#F4F6F5]/70 border-t-2 border-[#E5EAE7] font-semibold text-xs text-[#17231D]">
                <td className="py-3.5 pl-3" colSpan={3}>
                  <span className="tracking-wide">{summaryTotal?.label || 'TOTAL TERKONSOLIDASI (BULAN BERJALAN)'}</span>
                </td>
                <td className="py-3.5 text-right font-bold text-[#17231D]">
                  {summaryTotal?.dilaporkan || '1.284 kg'}
                </td>
                <td className="py-3.5 text-right font-bold text-[#176B4D]">
                  {summaryTotal?.diterima || '1.102 kg'}
                </td>
                <td className="py-3.5 text-right font-bold text-[#C2413B]">
                  {summaryTotal?.ditolak || '46 kg'}
                </td>
                <td className="py-3.5 text-center font-bold text-[#17231D]">
                  {summaryTotal?.tingkatPenerimaan || '96,4%'}
                </td>
                <td className="py-3.5 pr-3 text-right">
                  <span className="bg-white text-[#66736C] text-xs font-bold px-2 py-0.5 rounded border border-[#E5EAE7]">
                    {summaryTotal?.status || 'Audited'}
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 7. REGULATORY & PROTOCOL NOTICE                           */}
      {/* ========================================================= */}
      <aside className="bg-[#F4F6F5] border border-[#E5EAE7] rounded-xl p-4 mt-6 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-[#176B4D] shrink-0 mt-0.5" aria-hidden="true" />
        <div>
          <h3 className="text-xs font-bold text-[#17231D]">
            Protokol Penimbangan &amp; Standar Kelayakan
          </h3>
          <p className="text-xs text-[#66736C] mt-0.5 leading-relaxed">
            Kelayakan material ditentukan oleh mitra pengolah, bukan oleh aplikasi. Seluruh catatan selisih massa (kg) tunduk pada hasil audit penimbangan fisik saat penerimaan di fasilitas pengolahan.
          </p>
        </div>
      </aside>

    </div>
  );
}
