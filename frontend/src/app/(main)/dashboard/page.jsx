'use client';

import { useSyncExternalStore } from 'react';
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
import StatusBadge from '@/components/ui/StatusBadge';
import { useBioRoute } from '@/context/BioRouteContext';
import { STATUS_BATCH } from '@/lib/constants';
import { formatKg, formatPersen, formatTanggal } from '@/lib/format';
import {
  cariById,
  totalBeratDilaporkan,
  totalBeratDiterima,
  totalBeratDitolak,
  hitungBatchAktif,
  beratDiterimaPerJalur,
  hitungBatchPerStatus,
  beratPerMinggu,
  batchTerbaru,
  mitraMenunggu,
} from '@/lib/hitung';

// Warna dan ikon tiap jalur, dipilih berdasarkan urutan jalur di master data. Kalau admin menambah jalur baru, gayanya mengulang dari awal.
const GAYA_JALUR = [
  { warna: '#176B4D', Ikon: Sprout, latarIkon: 'bg-[#EAF5F0] text-[#176B4D]' },
  { warna: '#2563EB', Ikon: Bug, latarIkon: 'bg-blue-50 text-[#2563EB]' },
  { warna: '#B7791F', Ikon: Layers, latarIkon: 'bg-amber-50 text-[#B7791F]' },
];

/**
 * Mengambil gaya jalur berdasarkan urutannya (0, 1, 2, 3 → gaya 0, 1, 2, 0, ...).
 */
function gayaJalur(index) {
  return GAYA_JALUR[index % GAYA_JALUR.length];
}

const emptySubscribe = () => () => {};

function useIsMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

/**
 * Tooltip grafik: menampilkan berat setiap jalur pada minggu yang disorot.
 */
function CustomChartTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-xl border border-[#E5EAE7] shadow-lg text-xs">
        <p className="font-semibold text-[#17231D] mb-1.5">{label}</p>
        <div className="space-y-1">
          {payload.map((item) => (
            <p
              key={item.dataKey}
              className="flex items-center justify-between gap-4 font-medium"
              style={{ color: item.color }}
            >
              <span>{item.name}:</span>
              <strong>{formatKg(item.value)}</strong>
            </p>
          ))}
        </div>
      </div>
    );
  }
  return null;
}

/**
 * Halaman Dashboard (W1): ringkasan operasional yang seluruh angkanya dihitung dari state BioRoute.
 */
export default function DashboardPage() {
  const isClient = useIsMounted();
  const { state } = useBioRoute();
  const { daftarBatch, daftarMitra, kategoriMaterial, jalurPemanfaatan } = state;

  // Semua angka di bawah dihitung dari state, tidak ada yang ditulis manual.
  const jumlahDitolak = hitungBatchPerStatus(daftarBatch, STATUS_BATCH.DITOLAK);
  const jumlahDitimbang =
    hitungBatchPerStatus(daftarBatch, STATUS_BATCH.DITERIMA) +
    hitungBatchPerStatus(daftarBatch, STATUS_BATCH.DIPROSES) +
    hitungBatchPerStatus(daftarBatch, STATUS_BATCH.SELESAI);
  const totalDiterima = totalBeratDiterima(daftarBatch);
  const dataMingguan = beratPerMinggu(daftarBatch, jalurPemanfaatan);
  const perJalur = beratDiterimaPerJalur(daftarBatch, jalurPemanfaatan);
  const daftarBatchTerbaru = batchTerbaru(daftarBatch, 6);
  const daftarMitraMenunggu = mitraMenunggu(daftarMitra);
  
  return (
    <div className="space-y-6 bg-white">
      
      {/* HEADER SECTION */}
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

      {/* METRIC CARDS ROW (4 COLUMNS GRID) */}
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
              {formatKg(totalBeratDilaporkan(daftarBatch))}
            </h2>
            <span className="inline-flex items-center text-[11px] font-semibold text-[#16805D] mt-0.5">
              {daftarBatch.length - jumlahDitolak} batch tercatat
            </span>
          </div>
          <p className="text-[11px] text-[#66736C] pt-2 border-t border-[#E5EAE7]/70 truncate">
            Batch yang ditolak tidak dihitung
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
              {formatKg(totalDiterima)}
            </h2>
            <span className="inline-flex items-center text-[11px] font-semibold text-[#2563EB] mt-0.5">
              {jumlahDitimbang} batch sudah ditimbang
            </span>
          </div>
          <p className="text-[11px] text-[#66736C] pt-2 border-t border-[#E5EAE7]/70 truncate">
            Hasil timbang manual saat serah terima
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
              {formatKg(totalBeratDitolak(daftarBatch))}
            </h2>
            <span className="inline-flex items-center text-[11px] font-semibold text-[#C2413B] mt-0.5">
              {jumlahDitolak} batch ditolak
            </span>
          </div>
          <p className="text-[11px] text-[#66736C] pt-2 border-t border-[#E5EAE7]/70 truncate">
            Alasan penolakan wajib dicatat
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
              {hitungBatchAktif(daftarBatch)} batch
            </h2>
            <span className="inline-flex items-center text-[11px] font-semibold text-[#B7791F] mt-0.5">
              {hitungBatchPerStatus(daftarBatch, STATUS_BATCH.DIAJUKAN)} menunggu persetujuan
            </span>
          </div>
          <p className="text-[11px] text-[#66736C] pt-2 border-t border-[#E5EAE7]/70 truncate">
            {hitungBatchPerStatus(daftarBatch, STATUS_BATCH.DIPROSES)} sedang diproses pengolah
          </p>
        </article>
      </section>

      {/* MIDDLE SECTION (7:5 DESKTOP GRID) */}
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
                  Berat dilaporkan per minggu pengajuan (batch ditolak tidak dihitung)
                </p>
            </div>

              {/* Legenda dibuat dari daftar jalur */}
              <div className="flex items-center gap-4 text-xs font-medium self-start sm:self-auto">
                {jalurPemanfaatan.map((jalur, index) => (
                  <div key={jalur.id} className="flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-xs"
                      style={{ backgroundColor: gayaJalur(index).warna }}
                    />
                    <span className="text-[#17231D]">{jalur.nama}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recharts Bar Chart */}
            <div className="w-full h-65 pt-2">
              {isClient && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={dataMingguan}
                    margin={{ top: 22, right: 10, left: -20, bottom: 0 }}
                    barGap={6}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5EAE7" />
                    <XAxis
                      dataKey="minggu"
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
                    {/* Satu batang untuk setiap jalur */}
                    {jalurPemanfaatan.map((jalur, index) => (
                      <Bar
                        key={jalur.id}
                        dataKey={jalur.id}
                        name={jalur.nama}
                        fill={gayaJalur(index).warna}
                        radius={[4, 4, 0, 0]}
                      >
                        <LabelList
                          dataKey={jalur.id}
                          position="top"
                          fill={gayaJalur(index).warna}
                          fontSize={10}
                          fontWeight={600}
                        />
                      </Bar>
                    ))}
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
              Berat hasil timbang pengolah per jalur
            </p>

            {/* Allocation Items */}
            <div className="space-y-4">
              {perJalur.map((jalur, index) => {
                const { warna, Ikon, latarIkon } = gayaJalur(index);
                const detailJalur = cariById(jalurPemanfaatan, jalur.id);

                return (
                  <div key={jalur.id} className="p-3.5 rounded-xl bg-[#F4F6F5] border border-[#E5EAE7]">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg ${latarIkon}`}>
                          <Ikon className="w-3.5 h-3.5" aria-hidden="true" />
                        </div>
                        <span className="text-xs font-semibold text-[#17231D]">
                          {jalur.nama}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-[#17231D]">
                          {formatKg(jalur.kg)}
                        </span>
                        <span className="text-[11px] text-[#66736C] ml-1">
                          ({formatPersen(jalur.persen)})
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-[#E5EAE7] h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full transition-all duration-500 rounded-full"
                        style={{ width: `${jalur.persen}%`, backgroundColor: warna }}
                      />
                    </div>

                    <p className="text-[11px] text-[#66736C] mt-2">
                      {detailJalur?.materialDiterima}
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
              <strong>Total diterima: {formatKg(totalDiterima)}</strong> — dari {jalurPemanfaatan.length} jalur pemanfaatan
            </p>
          </div>
        </article>

      </section>

      {/* BOTTOM SECTION (BATCHES & VERIFICATION) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Card: Batch terbaru (7 cols) */}
        <article className="lg:col-span-7 p-6 rounded-2xl bg-white border border-[#E5EAE7] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[#17231D]">
                Batch terbaru
              </h2>
              <span className="bg-[#EAF5F0] text-[#16805D] text-xs font-medium px-2.5 py-0.5 rounded-full border border-[#16805D]/15">
                {daftarBatchTerbaru.length} terbaru dari {daftarBatch.length}
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
                {daftarBatchTerbaru.map((batch) => (
                  <tr key={batch.kode} className="hover:bg-[#F4F6F5]/50 transition-colors">
                    <td className="py-3 font-mono text-[11px] text-[#17231D] font-medium">
                      {batch.kode}
                    </td>
                    <td className="py-3 font-medium text-[#17231D]">
                      {cariById(daftarMitra, batch.sumberId)?.nama}
                    </td>
                    <td className="py-3 text-[#66736C] hidden sm:table-cell">
                      {cariById(kategoriMaterial, batch.kategoriId)?.nama}
                    </td>
                    <td className="py-3 font-semibold text-[#17231D]">
                      {formatKg(batch.beratKg)}
                    </td>
                    <td className="py-3 text-[#66736C] hidden md:table-cell">
                      {cariById(jalurPemanfaatan, batch.jalurId)?.nama}
                    </td>
                    <td className="py-3">
                      <StatusBadge status={batch.status} />                      
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
                {daftarMitraMenunggu.length} menunggu
              </span>
            </div>
            <p className="text-xs text-[#66736C] mb-4">
              Mitra baru mendaftar di Purwokerto
            </p>

            {/* Partner List */}
            <div className="space-y-3">
              {daftarMitraMenunggu.length === 0 && (
                <p className="text-xs text-[#66736C]">Tidak ada mitra yang menunggu verifikasi.</p>
              )}
              {daftarMitraMenunggu.map((mitra) => (
                <div
                  key={mitra.id}
                  className="p-3 rounded-xl border border-[#E5EAE7] hover:border-[#176B4D]/30 transition-all flex items-center justify-between gap-3 bg-[#F4F6F5]/40"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-[#17231D] truncate">
                        {mitra.nama}
                      </p>
                      <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-white border border-[#E5EAE7] text-[#66736C]">
                        {mitra.peran === 'sumber' ? 'Sumber' : 'Pengolah'}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#66736C] truncate mt-0.5">
                      {mitra.kecamatan} • Daftar {formatTanggal(mitra.diajukanPada)}
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
