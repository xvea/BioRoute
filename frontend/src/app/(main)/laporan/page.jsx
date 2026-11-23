'use client';

import { useState, useSyncExternalStore } from 'react';
import {
  Sprout,
  Archive,
  Utensils,
  Layers,
  FileSpreadsheet,
  FileText,
  AlertTriangle,
  Info,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import Toast from '@/components/ui/Toast';
import useToast from '@/hooks/useToast';
import { useBioRoute } from '@/context/BioRouteContext';
import { formatKg, formatPersen } from '@/lib/format';
import {
  cariById,
  totalBeratDilaporkan,
  totalBeratDiterima,
  totalBeratDitolak,
  persenDiterima,
  ringkasanPerKategori,
  rekapPerMitra,
  selisihBerat,
} from '@/lib/hitung';

// Ikon kartu kategori, dipilih berdasarkan urutan kategori. Kalau admin menambah kategori baru, ikonnya mengulang dari awal.
const IKON_KATEGORI = [Sprout, Archive, Utensils, Layers];
// Pilihan filter peran di tabel rekap ('' = semua).
const PILIHAN_PERAN = [
  { nilai: '', label: 'Semua peran' },
  { nilai: 'sumber', label: 'Mitra Sumber' },
  { nilai: 'pengolah', label: 'Mitra Pengolah' },
];
// Label dan warna badge peran mitra.
const PERAN = {
  sumber: { label: 'Mitra Sumber', gaya: 'bg-[#EAF5F0] text-[#16805D]' },
  pengolah: { label: 'Mitra Pengolah', gaya: 'bg-[#EFF6FF] text-[#2563EB]' },
};

const emptySubscribe = () => () => {};

/**
 * true hanya di browser. Grafik recharts butuh ukuran layar, jadi baru digambar setelah halaman tampil di browser.
 */
function useIsMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

/**
 * Halaman Laporan (W4): ringkasan per kategori, selisih berat dilaporkan vs diterima, dan rekap kinerja mitra dari state BioRoute.
 */
export default function LaporanPage() {
  const { state } = useBioRoute();
  const { daftarBatch, daftarMitra, kategoriMaterial, parameterVerifikasi } = state;
  // State tampilan saja: filter peran di tabel rekap.
  const [filterPeran, setFilterPeran] = useState('');
  const { toast, tampilkanToast } = useToast();
  const isClient = useIsMounted();

  // Semua angka dihitung dari state; toleransi diambil dari Pengaturan (parameterVerifikasi).
  const toleransiKg = parameterVerifikasi.toleransiSelisihKg;
  const ringkasanKategori = ringkasanPerKategori(daftarBatch, kategoriMaterial);
  const daftarSelisih = selisihBerat(daftarBatch, toleransiKg);
  const jumlahPerluDicek = daftarSelisih.filter((baris) => baris.melebihiToleransi).length;
  const rekapMitra = rekapPerMitra(daftarBatch, daftarMitra);
  const rekapTampil = rekapMitra.filter((baris) => !filterPeran || baris.peran === filterPeran);

  /**
   * Unduh CSV (diisi di W-05).
   */
  const handleUnduhCsv = () => {
    tampilkanToast('warning', 'Unduh CSV sedang disiapkan dan akan tersedia di tahap berikutnya.');
  };

  /**
   * Unduh PDF (diisi di W-05).
   */
  const handleUnduhPdf = () => {
    tampilkanToast('warning', 'Unduh PDF sedang disiapkan dan akan tersedia di tahap berikutnya.');
  };

  return (
    <div className="space-y-6 bg-white">

      {/* Toast Alert Feedback */}
      <Toast toast={toast} />

      {/* 1. Judul halaman & tombol unduh */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E5EAE7]">
        <div>
          <h1 className="text-2xl font-bold text-[#17231D] tracking-tight">Laporan Residu Organik</h1>
          <p className="text-sm text-[#66736C] mt-1">
            Rekap berat residu, hasil timbang, dan kinerja mitra dari seluruh batch yang tercatat.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleUnduhCsv}
            className="inline-flex items-center gap-2 border border-[#E5EAE7] bg-white hover:bg-[#F4F6F5] text-sm font-medium text-[#17231D] px-4 py-2 rounded-xl transition-colors cursor-pointer">
            <FileSpreadsheet className="w-4 h-4" aria-hidden="true" />
            <span>Unduh CSV</span>
          </button>
          <button
            type="button"
            onClick={handleUnduhPdf}
            className="inline-flex items-center gap-2 bg-[#176B4D] hover:bg-[#104D38] text-sm font-medium text-white px-4 py-2 rounded-xl transition-colors cursor-pointer">
            <FileText className="w-4 h-4" aria-hidden="true" />
            <span>Unduh PDF</span>
          </button>
        </div>
      </section>

      {/* 2. Kartu per kategori material */}
      <section aria-label="Berat dilaporkan per kategori" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {ringkasanKategori.map((kategori, index) => {
          const Ikon = IKON_KATEGORI[index % IKON_KATEGORI.length];
          return (
            <article
              key={kategori.id}
              className="p-5 rounded-2xl bg-white border border-[#E5EAE7] shadow-xs flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <p className="uppercase text-[10px] text-[#66736C] font-bold tracking-wider">Kategori material</p>
                  <h2 className="text-sm font-bold text-[#17231D] mt-1">{kategori.nama}</h2>
                </div>
                <div className="p-1.5 rounded-lg bg-[#F4F6F5] text-[#176B4D]">
                  <Ikon className="w-4 h-4" aria-hidden="true" />
                </div>
              </div>
              <p className="text-3xl font-bold text-[#17231D] tracking-tight my-3">{formatKg(kategori.kg)}</p>
              <div className="pt-3 border-t border-[#E5EAE7]/70 flex items-center justify-between text-xs text-[#66736C]">
                <span>{formatPersen(kategori.persen)} dari total</span>
                <span className="bg-[#F4F6F5] text-[#17231D] font-medium px-2 py-0.5 rounded border border-[#E5EAE7]">
                  {kategori.jumlahBatch} batch
                </span>
              </div>
            </article>
          );
        })}
      </section>

      {/* 3. Selisih berat dilaporkan vs diterima */}
      <section className="p-6 rounded-2xl bg-white border border-[#E5EAE7] shadow-xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div>
            <h2 className="font-bold text-base text-[#17231D]">Selisih berat dilaporkan vs diterima</h2>
            <p className="text-xs text-[#66736C] mt-0.5">
              Batch yang sudah ditimbang mitra pengolah saat serah terima (kg).
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="px-3 py-1.5 rounded-lg bg-[#F4F6F5] border border-[#E5EAE7] text-[#66736C]">
              Toleransi: <strong className="text-[#17231D]">{formatKg(toleransiKg)}</strong>
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-[#F4F6F5] border border-[#E5EAE7] text-[#66736C]">
              Tingkat penerimaan: <strong className="text-[#17231D]">{formatPersen(persenDiterima(daftarBatch))}</strong>
            </span>
            <span
              className={`px-3 py-1.5 rounded-lg border font-semibold ${jumlahPerluDicek > 0
                ? 'bg-[#FEF3C7] border-[#B7791F]/20 text-[#B7791F]'
                : 'bg-[#EAF5F0] border-[#16805D]/20 text-[#16805D]'
                }`}>
              Perlu dicek: {jumlahPerluDicek} batch
            </span>
          </div>
        </div>

        {daftarSelisih.length === 0 ? (
          <p className="p-8 text-center text-xs text-[#66736C] border border-dashed border-[#E5EAE7] rounded-xl">
            Belum ada batch yang ditimbang.
          </p>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
            {/* Grafik batang: dilaporkan vs diterima per batch */}
            <div className="w-full h-64">
              {isClient && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={daftarSelisih} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5EAE7" />
                    <XAxis dataKey="kode" tick={{ fill: '#66736C', fontSize: 10 }} axisLine={{ stroke: '#E5EAE7' }} tickLine={false} />
                    <YAxis tick={{ fill: '#66736C', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(nilai) => formatKg(nilai)} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="dilaporkanKg" name="Dilaporkan" fill="#B7D76A" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="diterimaKg" name="Diterima" fill="#176B4D" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Tabel selisih per batch */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#E5EAE7] text-[#66736C]">
                    <th scope="col" className="pb-2 font-medium">Kode Batch</th>
                    <th scope="col" className="pb-2 font-medium">Sumber</th>
                    <th scope="col" className="pb-2 font-medium text-right">Dilaporkan</th>
                    <th scope="col" className="pb-2 font-medium text-right">Diterima</th>
                    <th scope="col" className="pb-2 font-medium text-right">Selisih</th>
                    <th scope="col" className="pb-2 pl-3 font-medium">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5EAE7]/60">
                  {daftarSelisih.map((baris) => (
                    <tr key={baris.kode}>
                      <td className="py-2.5 font-bold text-[#17231D]">{baris.kode}</td>
                      <td className="py-2.5 text-[#66736C]">{cariById(daftarMitra, baris.sumberId)?.nama}</td>
                      <td className="py-2.5 text-right">{formatKg(baris.dilaporkanKg)}</td>
                      <td className="py-2.5 text-right">{formatKg(baris.diterimaKg)}</td>
                      <td className="py-2.5 text-right font-semibold">{formatKg(baris.selisihKg)}</td>
                      <td className="py-2.5 pl-3">
                        {baris.melebihiToleransi ? (
                          <span className="inline-flex items-center gap-1 whitespace-nowrap px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#B7791F] font-semibold">
                            <AlertTriangle className="w-3 h-3" aria-hidden="true" />
                            Melebihi toleransi
                          </span>
                        ) : (
                          <span className="inline-flex whitespace-nowrap px-2 py-0.5 rounded-full bg-[#EAF5F0] text-[#16805D] font-semibold">
                            Wajar
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* 4. Rekap kinerja mitra terverifikasi */}
      <section className="p-6 rounded-2xl bg-white border border-[#E5EAE7] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-base text-[#17231D]">Rekap kinerja mitra</h2>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#F4F6F5] border border-[#E5EAE7] text-[#66736C]">
              {rekapMitra.length} mitra terverifikasi
            </span>
          </div>
          <select
            value={filterPeran}
            onChange={(e) => setFilterPeran(e.target.value)}
            aria-label="Filter peran mitra"
            className="bg-[#F4F6F5] border border-[#E5EAE7] text-xs font-medium text-[#17231D] px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#176B4D] cursor-pointer">
            {PILIHAN_PERAN.map((pilihan) => (
              <option key={pilihan.nilai} value={pilihan.nilai}>
                {pilihan.label}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#E5EAE7] text-[#66736C]">
                <th scope="col" className="pb-3 font-medium">Mitra</th>
                <th scope="col" className="pb-3 font-medium">Peran</th>
                <th scope="col" className="pb-3 font-medium text-center">Total Batch</th>
                <th scope="col" className="pb-3 font-medium text-right">Dilaporkan</th>
                <th scope="col" className="pb-3 font-medium text-right">Diterima</th>
                <th scope="col" className="pb-3 font-medium text-right">Ditolak</th>
                <th scope="col" className="pb-3 font-medium text-right">Tingkat Penerimaan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5EAE7]/60">
              {rekapTampil.map((baris) => (
                <tr key={baris.id}>
                  <td className="py-3">
                    <p className="font-bold text-[#17231D]">{baris.nama}</p>
                    <p className="text-[11px] text-[#66736C]">{baris.kecamatan}</p>
                  </td>
                  <td className="py-3">
                    <span className={`inline-flex whitespace-nowrap px-2 py-0.5 rounded-full text-[11px] font-semibold ${PERAN[baris.peran].gaya}`}>
                      {PERAN[baris.peran].label}
                    </span>
                  </td>
                  <td className="py-3 text-center">{baris.jumlahBatch} batch</td>
                  <td className="py-3 text-right">{formatKg(baris.dilaporkanKg)}</td>
                  <td className="py-3 text-right font-semibold text-[#176B4D]">{formatKg(baris.diterimaKg)}</td>
                  <td className={`py-3 text-right ${baris.ditolakKg > 0 ? 'text-[#C2413B] font-semibold' : 'text-[#66736C]'}`}>
                    {formatKg(baris.ditolakKg)}
                  </td>
                  <td className="py-3 text-right font-semibold">{formatPersen(baris.persenDiterima)}</td>
                </tr>
              ))}
            </tbody>
            {/* Total dihitung dari seluruh batch, bukan menjumlah baris: satu batch muncul di baris sumber DAN di baris pengolah */}
            <tfoot>
              <tr className="border-t-2 border-[#E5EAE7] font-bold text-[#17231D]">
                <td className="pt-3" colSpan={2}>Total seluruh batch</td>
                <td className="pt-3 text-center">{daftarBatch.length} batch</td>
                <td className="pt-3 text-right">{formatKg(totalBeratDilaporkan(daftarBatch))}</td>
                <td className="pt-3 text-right text-[#176B4D]">{formatKg(totalBeratDiterima(daftarBatch))}</td>
                <td className="pt-3 text-right text-[#C2413B]">{formatKg(totalBeratDitolak(daftarBatch))}</td>
                <td className="pt-3 text-right">{formatPersen(persenDiterima(daftarBatch))}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      {/* 5. Catatan */}
      <aside className="p-4 rounded-2xl bg-[#F4F6F5] border border-[#E5EAE7] flex items-start gap-3 text-xs text-[#66736C]">
        <Info className="w-4 h-4 text-[#176B4D] shrink-0 mt-0.5" aria-hidden="true" />
        <p>
          Kelayakan material ditentukan oleh mitra pengolah, bukan oleh aplikasi. Berat diterima berasal dari
          timbangan manual saat serah terima; batch Ditolak tidak dihitung sebagai berat dilaporkan.
        </p>
      </aside>
    </div>
  );
}