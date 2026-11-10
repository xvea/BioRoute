'use client';

import { useState, useEffect, useSyncExternalStore } from 'react';
import Link from 'next/link';
import {
  Scale,
  TrendingUp,
  AlertTriangle,
  Layers,
  GitFork,
  Sprout,
  Bug,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Info,
  Plus,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LabelList,
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
 * Status Badge Component for Batches
 */
function BatchStatusBadge({ status }) {
  const statusStyles = {
    Tersedia: 'bg-[#EAF5F0] text-[#16805D] border-[#16805D]/20',
    Diproses: 'bg-[#FEF3C7] text-[#B7791F] border-[#B7791F]/20',
    Dijadwalkan: 'bg-[#EFF6FF] text-[#2563EB] border-[#2563EB]/20',
    'Perlu revisi': 'bg-[#FEE2E2] text-[#C2413B] border-[#C2413B]/20',
    'Diterima di tujuan': 'bg-[#EAF5F0] text-[#16805D] border-[#16805D]/20',
    Selesai: 'bg-[#F4F6F5] text-[#66736C] border-[#E5EAE7]',
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
 * Custom Tooltip for Recharts
 */
function CustomChartTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-xl border border-[#E5EAE7] shadow-lg text-xs">
        <p className="font-semibold text-[#17231D] mb-1.5">{label}</p>
        <div className="space-y-1">
          <p className="text-[#176B4D] flex items-center justify-between gap-4 font-medium">
            <span>Kompos:</span>
            <strong>{payload[0]?.value} kg</strong>
          </p>
          <p className="text-[#2563EB] flex items-center justify-between gap-4 font-medium">
            <span>BSF / Maggot:</span>
            <strong>{payload[1]?.value} kg</strong>
          </p>
        </div>
      </div>
    );
  }
  return null;
}

/**
 * Skeleton Loader matching exact dashboard dimensions
 */
function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse bg-white" aria-busy="true" aria-label="Memuat data dashboard">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="h-7 w-64 bg-gray-200 rounded-lg" />
          <div className="h-4 w-96 bg-gray-100 rounded-md mt-2" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-8 w-44 bg-gray-200 rounded-full" />
          <div className="h-9 w-32 bg-gray-200 rounded-xl" />
        </div>
      </div>

      {/* 4 Metric Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-5 rounded-2xl bg-white border border-[#E5EAE7] space-y-3"
          >
            <div className="h-4 w-28 bg-gray-200 rounded" />
            <div className="h-8 w-32 bg-gray-300 rounded" />
            <div className="h-4 w-36 bg-gray-100 rounded" />
            <div className="h-3 w-40 bg-gray-100 rounded pt-2" />
          </div>
        ))}
      </div>

      {/* Middle Section Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 p-6 rounded-2xl bg-white border border-[#E5EAE7] h-[360px]" />
        <div className="lg:col-span-5 p-6 rounded-2xl bg-white border border-[#E5EAE7] h-[360px]" />
      </div>

      {/* Bottom Section Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 p-6 rounded-2xl bg-white border border-[#E5EAE7] h-[320px]" />
        <div className="lg:col-span-5 p-6 rounded-2xl bg-white border border-[#E5EAE7] h-[320px]" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const isClient = useIsMounted();

  /**
   * Dedicated fetchDashboardData caller using native fetch()
   * Targets process.env.NEXT_PUBLIC_API_URL or local static JSON fallback
   * Handles Strict Tri-State: Loading, Error with Retry, Success / Empty State
   */
  useEffect(() => {
    let active = true;

    async function fetchDashboardData() {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
        const endpoint = API_URL ? `${API_URL}/api/dashboard` : '/data/dashboard.json';

        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Gagal memuat data operasional (HTTP ${response.status})`);
        }

        const json = await response.json();
        if (active) {
          setData(json);
          setIsLoading(false);
          setError(null);
        }
      } catch (err) {
        if (active) {
          console.error('Fetch dashboard error:', err);
          setError(
            err?.message || 'Terjadi gangguan saat mengambil data agregasi material organik.'
          );
          setIsLoading(false);
        }
      }
    }

    fetchDashboardData();

    return () => {
      active = false;
    };
  }, [retryCount]);

  /**
   * Interactive Retry Action
   */
  const handleRetry = () => {
    setIsLoading(true);
    setError(null);
    setRetryCount((prev) => prev + 1);
  };

  // 1. Loading State (Pulse Skeleton)
  if (isLoading) {
    return <DashboardSkeleton />;
  }

  // 2. Error State (Clear accessible card with Retry button)
  if (error) {
    return (
      <section
        role="alert"
        aria-live="assertive"
        className="max-w-xl mx-auto my-12 p-6 rounded-2xl bg-white border border-red-200 shadow-sm text-center"
      >
        <div className="w-12 h-12 rounded-full bg-red-50 text-[#C2413B] flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-6 h-6" aria-hidden="true" />
        </div>
        <h2 className="text-lg font-bold text-[#17231D]">
          Gagal Memuat Data Operasional
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
          <span>Coba Muat Ulang</span>
        </button>
      </section>
    );
  }

  // 3. Empty State Check
  const isEmpty =
    !data ||
    (!data.metrics && !data.recentBatches?.length && !data.weeklyChart?.length);

  if (isEmpty) {
    return (
      <section className="p-10 rounded-2xl bg-white border border-[#E5EAE7] text-center my-8 shadow-xs">
        <div className="w-12 h-12 rounded-full bg-[#F4F6F5] text-[#66736C] flex items-center justify-center mx-auto mb-3">
          <Layers className="w-6 h-6" aria-hidden="true" />
        </div>
        <h2 className="text-base font-bold text-[#17231D]">
          Belum Ada Data Operasional
        </h2>
        <p className="text-xs text-[#66736C] mt-1 mb-5 max-w-sm mx-auto">
          Tidak ada data pencatatan alokasi material organik atau batch aktif untuk wilayah Banyumas pada periode ini.
        </p>
        <button
          type="button"
          onClick={handleRetry}
          className="inline-flex items-center gap-2 bg-[#176B4D] hover:bg-[#104D38] text-white px-4 py-2 rounded-xl text-xs font-medium cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Segarkan Tampilan</span>
        </button>
      </section>
    );
  }

  const { metrics, weeklyChart, utilizationRoutes, recentBatches, pendingPartners } =
    data;

  return (
    <div className="space-y-6 bg-white">
      
      {/* ========================================================= */}
      {/* HEADER SECTION                                            */}
      {/* ========================================================= */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-bold text-[#17231D] tracking-tight">
            Ringkasan Operasional Wilayah
          </h1>
          <p className="text-sm text-[#66736C] mt-1">
            Konsolidasi penimbangan material organik dan status sirkulasi residu aktif Banyumas.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-1.5 bg-[#EAF5F0] text-[#16805D] text-xs font-semibold px-3 py-1.5 rounded-full border border-[#16805D]/15">
            <span className="text-[10px] leading-none">●</span>
            <span>Siklus Verifikasi Terbuka</span>
          </div>

          {/* Primary CTA */}
          <button
            type="button"
            className="inline-flex items-center gap-1.5 bg-[#176B4D] hover:bg-[#104D38] active:bg-[#0e3b2b] text-white px-4 py-2 rounded-xl text-sm font-medium shadow-xs hover:shadow transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176B4D] cursor-pointer"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>Audit Manual</span>
          </button>
        </div>
      </section>

      {/* ========================================================= */}
      {/* METRIC CARDS ROW (4 COLUMNS GRID)                         */}
      {/* ========================================================= */}
      <section
        aria-label="Metrik Utama Operasional"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5"
      >
        {/* Metric 1: Berat tercatat */}
        <article className="p-5 rounded-2xl bg-white border border-[#E5EAE7] shadow-xs flex flex-col justify-between hover:border-[#176B4D]/30 transition-colors">
          <div className="flex items-start justify-between">
            <span className="text-xs font-medium text-[#66736C]">
              Berat tercatat
            </span>
            <div className="p-1.5 rounded-lg bg-[#EAF5F0] text-[#16805D]">
              <Scale className="w-3.5 h-3.5" aria-hidden="true" />
            </div>
          </div>
          <div className="my-2.5">
            <h2 className="text-2xl font-bold text-[#17231D] tracking-tight">
              {metrics?.totalWeight?.value || '1.284 kg'}
            </h2>
            <span className="inline-flex items-center text-[11px] font-semibold text-[#16805D] mt-0.5">
              {metrics?.totalWeight?.badge || '+8,4% vs pekan lalu'}
            </span>
          </div>
          <p className="text-[11px] text-[#66736C] pt-2 border-t border-[#E5EAE7]/70 truncate">
            {metrics?.totalWeight?.footer || 'Kapasitas agregat 24 batch masuk'}
          </p>
        </article>

        {/* Metric 2: Diterima pengolah */}
        <article className="p-5 rounded-2xl bg-white border border-[#E5EAE7] shadow-xs flex flex-col justify-between hover:border-[#176B4D]/30 transition-colors">
          <div className="flex items-start justify-between">
            <span className="text-xs font-medium text-[#66736C]">
              Diterima pengolah
            </span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-[#2563EB]">
              <TrendingUp className="w-3.5 h-3.5" aria-hidden="true" />
            </div>
          </div>
          <div className="my-2.5">
            <h2 className="text-2xl font-bold text-[#17231D] tracking-tight">
              {metrics?.accepted?.value || '1.102 kg'}
            </h2>
            <span className="inline-flex items-center text-[11px] font-semibold text-[#2563EB] mt-0.5">
              {metrics?.accepted?.badge || '85,8% tingkat konversi'}
            </span>
          </div>
          <p className="text-[11px] text-[#66736C] pt-2 border-t border-[#E5EAE7]/70 truncate">
            {metrics?.accepted?.footer || 'Fasilitas aktif 3 TPST & Maggot'}
          </p>
        </article>

        {/* Metric 3: Ditolak */}
        <article className="p-5 rounded-2xl bg-white border border-[#E5EAE7] shadow-xs flex flex-col justify-between hover:border-[#176B4D]/30 transition-colors">
          <div className="flex items-start justify-between">
            <span className="text-xs font-medium text-[#66736C]">
              Ditolak
            </span>
            <div className="p-1.5 rounded-lg bg-red-50 text-[#C2413B]">
              <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
            </div>
          </div>
          <div className="my-2.5">
            <h2 className="text-2xl font-bold text-[#17231D] tracking-tight">
              {metrics?.rejected?.value || '46 kg'}
            </h2>
            <span className="inline-flex items-center text-[11px] font-semibold text-[#C2413B] mt-0.5">
              {metrics?.rejected?.badge || '3,5% deviasi kualitas'}
            </span>
          </div>
          <p className="text-[11px] text-[#66736C] pt-2 border-t border-[#E5EAE7]/70 truncate">
            {metrics?.rejected?.footer || 'Kategori utama Kontaminasi anorganik'}
          </p>
        </article>

        {/* Metric 4: Batch aktif */}
        <article className="p-5 rounded-2xl bg-white border border-[#E5EAE7] shadow-xs flex flex-col justify-between hover:border-[#176B4D]/30 transition-colors">
          <div className="flex items-start justify-between">
            <span className="text-xs font-medium text-[#66736C]">
              Batch aktif
            </span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-[#B7791F]">
              <Layers className="w-3.5 h-3.5" aria-hidden="true" />
            </div>
          </div>
          <div className="my-2.5">
            <h2 className="text-2xl font-bold text-[#17231D] tracking-tight">
              {metrics?.activeBatches?.value || '18 lot'}
            </h2>
            <span className="inline-flex items-center text-[11px] font-semibold text-[#B7791F] mt-0.5">
              {metrics?.activeBatches?.badge || '12 dalam proses'}
            </span>
          </div>
          <p className="text-[11px] text-[#66736C] pt-2 border-t border-[#E5EAE7]/70 truncate">
            {metrics?.activeBatches?.footer || 'Verifikasi awal 6 slot tersedia'}
          </p>
        </article>
      </section>

      {/* ========================================================= */}
      {/* MIDDLE SECTION (7:5 DESKTOP GRID)                         */}
      {/* ========================================================= */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Card: Berat per minggu (kg) */}
        <article className="lg:col-span-7 p-6 rounded-2xl bg-white border border-[#E5EAE7] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h2 className="text-base font-bold text-[#17231D]">
                  Berat per minggu (kg)
                </h2>
                <p className="text-xs text-[#66736C] mt-0.5">
                  Perbandingan alokasi material ke jalur Kompos dan BSF / Maggot (Nov 2026)
                </p>
              </div>

              {/* Custom Legend */}
              <div className="flex items-center gap-4 text-xs font-medium self-start sm:self-auto">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#176B4D]" />
                  <span className="text-[#17231D]">Kompos</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#2563EB]" />
                  <span className="text-[#17231D]">BSF / Maggot</span>
                </div>
              </div>
            </div>

            {/* Recharts Bar Chart */}
            <div className="w-full h-[260px] pt-2">
              {isClient && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={weeklyChart}
                    margin={{ top: 22, right: 10, left: -20, bottom: 0 }}
                    barGap={6}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5EAE7" />
                    <XAxis
                      dataKey="week"
                      tick={{ fill: '#66736C', fontSize: 11 }}
                      stroke="#E5EAE7"
                      axisLine={{ stroke: '#E5EAE7' }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: '#66736C', fontSize: 11 }}
                      stroke="#E5EAE7"
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomChartTooltip />} />
                    <Bar
                      dataKey="kompos"
                      name="Kompos"
                      fill="#176B4D"
                      radius={[4, 4, 0, 0]}
                    >
                      <LabelList
                        dataKey="kompos"
                        position="top"
                        fill="#176B4D"
                        fontSize={10}
                        fontWeight={600}
                      />
                    </Bar>
                    <Bar
                      dataKey="bsf"
                      name="BSF / Maggot"
                      fill="#2563EB"
                      radius={[4, 4, 0, 0]}
                    >
                      <LabelList
                        dataKey="bsf"
                        position="top"
                        fill="#2563EB"
                        fontSize={10}
                        fontWeight={600}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Card Footer */}
          <footer className="pt-4 mt-2 border-t border-[#E5EAE7] flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] text-[#66736C]">
            <span>Catatan log penimbangan divalidasi tiap pukul 18:00 WIB</span>
            <span className="font-medium text-[#17231D]">Deviasi rerata timbang: ±0.3%</span>
          </footer>
        </article>

        {/* Right Card: Jalur pemanfaatan */}
        <article className="lg:col-span-5 p-6 rounded-2xl bg-white border border-[#E5EAE7] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <GitFork className="w-4 h-4 text-[#176B4D]" aria-hidden="true" />
              <h2 className="text-base font-bold text-[#17231D]">
                Jalur pemanfaatan
              </h2>
            </div>
            <p className="text-xs text-[#66736C] mb-5">
              Distribusi residu aktif bulan November 2026
            </p>

            {/* Allocation Items */}
            <div className="space-y-4">
              {utilizationRoutes?.map((route) => {
                const isKompos = route.id === 'kompos';
                const Icon = isKompos ? Sprout : Bug;
                const barColor = isKompos ? 'bg-[#176B4D]' : 'bg-[#2563EB]';
                const iconBg = isKompos ? 'bg-[#EAF5F0] text-[#176B4D]' : 'bg-blue-50 text-[#2563EB]';

                return (
                  <div key={route.id} className="p-3.5 rounded-xl bg-[#F4F6F5] border border-[#E5EAE7]">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg ${iconBg}`}>
                          <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                        </div>
                        <span className="text-xs font-semibold text-[#17231D]">
                          {route.title}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-[#17231D]">
                          {route.weight}
                        </span>
                        <span className="text-[11px] text-[#66736C] ml-1">
                          ({route.percentage}%)
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-[#E5EAE7] h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${barColor} transition-all duration-500 rounded-full`}
                        style={{ width: `${route.percentage}%` }}
                      />
                    </div>

                    <p className="text-[11px] text-[#66736C] mt-2">
                      {route.subtext}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Summary Box */}
          <div className="mt-5 p-3.5 rounded-xl bg-[#EAF5F0] border border-[#16805D]/20 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#16805D] shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-xs text-[#16805D] leading-snug">
              <strong>Total terkelola: 1.102 kg</strong> — dari 2 jalur pemrosesan regional aktif
            </p>
          </div>
        </article>

      </section>

      {/* ========================================================= */}
      {/* BOTTOM SECTION (BATCHES & VERIFICATION)                   */}
      {/* ========================================================= */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Card: Batch terbaru (7 cols) */}
        <article className="lg:col-span-7 p-6 rounded-2xl bg-white border border-[#E5EAE7] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[#17231D]">
                Batch terbaru
              </h2>
              <span className="bg-[#EAF5F0] text-[#16805D] text-xs font-medium px-2.5 py-0.5 rounded-full border border-[#16805D]/15">
                6 batch hari ini
              </span>
            </div>
            <Link
              href="/batch"
              className="text-xs font-medium text-[#176B4D] hover:underline flex items-center gap-1"
            >
              <span>Lihat semua</span>
              <ArrowRight className="w-3 h-3" aria-hidden="true" />
            </Link>
          </div>

          {/* Responsive Table */}
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#E5EAE7] text-[#66736C] font-semibold">
                  <th scope="col" className="pb-2.5 font-medium">Kode</th>
                  <th scope="col" className="pb-2.5 font-medium">Sumber</th>
                  <th scope="col" className="pb-2.5 font-medium hidden sm:table-cell">Kategori</th>
                  <th scope="col" className="pb-2.5 font-medium">Berat</th>
                  <th scope="col" className="pb-2.5 font-medium hidden md:table-cell">Jalur</th>
                  <th scope="col" className="pb-2.5 font-medium">Status</th>
                  <th scope="col" className="pb-2.5 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5EAE7]/60">
                {recentBatches?.map((batch) => (
                  <tr key={batch.id} className="hover:bg-[#F4F6F5]/50 transition-colors">
                    <td className="py-3 font-mono text-[11px] text-[#17231D] font-medium">
                      {batch.id}
                    </td>
                    <td className="py-3 font-medium text-[#17231D]">
                      {batch.source}
                    </td>
                    <td className="py-3 text-[#66736C] hidden sm:table-cell">
                      {batch.category}
                    </td>
                    <td className="py-3 font-semibold text-[#17231D]">
                      {batch.weight}
                    </td>
                    <td className="py-3 text-[#66736C] hidden md:table-cell">
                      {batch.route}
                    </td>
                    <td className="py-3">
                      <BatchStatusBadge status={batch.status} />
                    </td>
                    <td className="py-3 text-right">
                      <button
                        type="button"
                        className="text-xs font-semibold text-[#176B4D] hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#176B4D] rounded px-1.5 py-0.5 cursor-pointer"
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        {/* Right Card: Perlu verifikasi (5 cols) */}
        <article className="lg:col-span-5 p-6 rounded-2xl bg-white border border-[#E5EAE7] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-bold text-[#17231D]">
                Perlu verifikasi
              </h2>
              <span className="bg-red-50 text-red-600 font-bold px-2.5 py-0.5 rounded-full text-xs">
                3 menunggu
              </span>
            </div>
            <p className="text-xs text-[#66736C] mb-4">
              Mitra baru mendaftar di Purwokerto
            </p>

            {/* Partner List */}
            <div className="space-y-3">
              {pendingPartners?.map((partner) => (
                <div
                  key={partner.id}
                  className="p-3 rounded-xl border border-[#E5EAE7] hover:border-[#176B4D]/30 transition-all flex items-center justify-between gap-3 bg-[#F4F6F5]/40"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-[#17231D] truncate">
                        {partner.name}
                      </p>
                      <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-white border border-[#E5EAE7] text-[#66736C]">
                        {partner.type}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#66736C] truncate mt-0.5">
                      {partner.location} • {partner.category}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="shrink-0 text-xs font-medium bg-white hover:bg-[#EAF5F0] text-[#176B4D] border border-[#E5EAE7] hover:border-[#176B4D]/30 px-3 py-1.5 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176B4D] cursor-pointer"
                  >
                    Tinjau
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Note Banner */}
          <aside className="mt-5 p-3 rounded-xl bg-[#F4F6F5] border border-[#E5EAE7] flex items-start gap-2.5 text-[#66736C]">
            <Info className="w-4 h-4 text-[#176B4D] shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-[11px] leading-relaxed">
              Kelayakan material ditentukan oleh mitra pengolah, bukan oleh aplikasi.
            </p>
          </aside>
        </article>

      </section>

    </div>
  );
}
