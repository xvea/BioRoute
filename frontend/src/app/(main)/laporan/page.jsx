'use client';

import { useState } from 'react';
import { Sprout, Archive, Utensils, Layers, FileSpreadsheet, FileText, AlertTriangle, Info } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import Toast from '@/components/ui/Toast';
import Kartu from '@/components/ui/Kartu';
import KepalaHalaman from '@/components/ui/KepalaHalaman';
import useToast from '@/hooks/useToast';
import useIsMounted from '@/hooks/useIsMounted';
import { useBioRoute } from '@/context/BioRouteContext';
import { formatKg, formatPersen } from '@/lib/format';
import { WARNA_GRAFIK, WARNA_SELISIH } from '@/lib/warnaGrafik';
import { csvRekapMitra, namaFileUnduhan } from '@/lib/csv';
import { unduhCsv } from '@/lib/unduh';
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
  sumber: { label: 'Mitra Sumber', gaya: 'bg-sukses-muda text-sukses' },
  pengolah: { label: 'Mitra Pengolah', gaya: 'bg-info-muda text-info' },
};

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
   * Mengunduh CSV rekap kinerja mitra sesuai filter peran yang sedang dipilih.
   */
  const handleUnduhCsv = () => {
    const jenis = filterPeran ? `rekap-mitra-${filterPeran}` : 'rekap-mitra';
    unduhCsv(namaFileUnduhan(jenis), csvRekapMitra(rekapTampil));
    tampilkanToast('success', `Rekap ${rekapTampil.length} mitra diunduh sebagai CSV.`);
  };

  /**
   * Membuka dialog cetak browser. Pilih tujuan "Simpan sebagai PDF" (Save as PDF) untuk menyimpan laporan sebagai file PDF.
   */
  const handleUnduhPdf = () => {
    window.print();
  };

  return (
    <div className="space-y-6 bg-white">
      {/* Toast Alert Feedback */}
      <Toast toast={toast} />

      {/* Judul halaman & tombol unduh */}
      <KepalaHalaman
        judul="Laporan Residu Organik"
        deskripsi="Rekap berat residu, hasil timbang, dan kinerja mitra dari seluruh batch yang tercatat."
        className="pb-4 border-b border-garis"
        aksi={
          <div className="print:hidden flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleUnduhCsv}
              className="inline-flex items-center gap-2 border border-garis bg-white hover:bg-latar-redup text-sm font-medium text-teks px-4 py-2 rounded-xl transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" aria-hidden="true" />
              <span>Unduh CSV</span>
            </button>
            <button
              type="button"
              onClick={handleUnduhPdf}
              className="inline-flex items-center gap-2 bg-brand hover:bg-brand-tua text-sm font-medium text-white px-4 py-2 rounded-xl transition-colors cursor-pointer"
            >
              <FileText className="w-4 h-4" aria-hidden="true" />
              <span>Unduh PDF</span>
            </button>
          </div>
        }
      />

      {/* Kartu per kategori material */}
      <section
        aria-label="Berat dilaporkan per kategori"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {ringkasanKategori.map((kategori, index) => {
          const Ikon = IKON_KATEGORI[index % IKON_KATEGORI.length];
          return (
            <Kartu as="article" key={kategori.id} className="p-5 flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <p className="uppercase text-[10px] text-teks-redup font-bold tracking-wider">Kategori material</p>
                  <h2 className="text-sm font-bold text-teks mt-1">{kategori.nama}</h2>
                </div>
                <div className="p-1.5 rounded-lg bg-latar-redup text-brand">
                  <Ikon className="w-4 h-4" aria-hidden="true" />
                </div>
              </div>
              <p className="text-3xl font-bold text-teks tracking-tight my-3">{formatKg(kategori.kg)}</p>
              <div className="pt-3 border-t border-garis/70 flex items-center justify-between text-xs text-teks-redup">
                <span>{formatPersen(kategori.persen)} dari total</span>
                <span className="bg-latar-redup text-teks font-medium px-2 py-0.5 rounded border border-garis">
                  {kategori.jumlahBatch} batch
                </span>
              </div>
            </Kartu>
          );
        })}
      </section>

      {/* Selisih berat dilaporkan vs diterima */}
      <Kartu as="section" className="p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div>
            <h2 className="font-bold text-base text-teks">Selisih berat dilaporkan vs diterima</h2>
            <p className="text-xs text-teks-redup mt-0.5">
              Batch yang sudah ditimbang mitra pengolah saat serah terima (kg).
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="px-3 py-1.5 rounded-lg bg-latar-redup border border-garis text-teks-redup">
              Toleransi: <strong className="text-teks">{formatKg(toleransiKg)}</strong>
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-latar-redup border border-garis text-teks-redup">
              Tingkat penerimaan: <strong className="text-teks">{formatPersen(persenDiterima(daftarBatch))}</strong>
            </span>
            <span
              className={`px-3 py-1.5 rounded-lg border font-semibold ${
                jumlahPerluDicek > 0
                  ? 'bg-peringatan-muda border-peringatan/20 text-peringatan'
                  : 'bg-sukses-muda border-sukses/20 text-sukses'
              }`}
            >
              Perlu dicek: {jumlahPerluDicek} batch
            </span>
          </div>
        </div>

        {daftarSelisih.length === 0 ? (
          <p className="p-8 text-center text-xs text-teks-redup border border-dashed border-garis rounded-xl">
            Belum ada batch yang ditimbang.
          </p>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
            {/* Grafik batang: dilaporkan vs diterima per batch */}
            <div className="w-full h-64">
              {isClient && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={daftarSelisih} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={WARNA_GRAFIK.garisBantu} />
                    <XAxis
                      dataKey="kode"
                      tick={{ fill: WARNA_GRAFIK.labelSumbu, fontSize: 10 }}
                      axisLine={{ stroke: WARNA_GRAFIK.garisBantu }}
                      tickLine={false}
                    />
                    <YAxis tick={{ fill: WARNA_GRAFIK.labelSumbu, fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(nilai) => formatKg(nilai)} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar
                      dataKey="dilaporkanKg"
                      name="Dilaporkan"
                      fill={WARNA_SELISIH.dilaporkan}
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar dataKey="diterimaKg" name="Diterima" fill={WARNA_SELISIH.diterima} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Tabel selisih per batch */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-garis text-teks-redup">
                    <th scope="col" className="pb-2 font-medium">
                      Kode Batch
                    </th>
                    <th scope="col" className="pb-2 font-medium">
                      Sumber
                    </th>
                    <th scope="col" className="pb-2 font-medium text-right">
                      Dilaporkan
                    </th>
                    <th scope="col" className="pb-2 font-medium text-right">
                      Diterima
                    </th>
                    <th scope="col" className="pb-2 font-medium text-right">
                      Selisih
                    </th>
                    <th scope="col" className="pb-2 pl-3 font-medium">
                      Keterangan
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-garis/60">
                  {daftarSelisih.map((baris) => (
                    <tr key={baris.kode}>
                      <td className="py-2.5 font-bold text-teks">{baris.kode}</td>
                      <td className="py-2.5 text-teks-redup">{cariById(daftarMitra, baris.sumberId)?.nama}</td>
                      <td className="py-2.5 text-right">{formatKg(baris.dilaporkanKg)}</td>
                      <td className="py-2.5 text-right">{formatKg(baris.diterimaKg)}</td>
                      <td className="py-2.5 text-right font-semibold">{formatKg(baris.selisihKg)}</td>
                      <td className="py-2.5 pl-3">
                        {baris.melebihiToleransi ? (
                          <span className="inline-flex items-center gap-1 whitespace-nowrap px-2 py-0.5 rounded-full bg-peringatan-muda text-peringatan font-semibold">
                            <AlertTriangle className="w-3 h-3" aria-hidden="true" />
                            Melebihi toleransi
                          </span>
                        ) : (
                          <span className="inline-flex whitespace-nowrap px-2 py-0.5 rounded-full bg-sukses-muda text-sukses font-semibold">
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
      </Kartu>

      {/* Rekap kinerja mitra terverifikasi */}
      <Kartu as="section" className="p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-base text-teks">Rekap kinerja mitra</h2>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-latar-redup border border-garis text-teks-redup">
              {rekapMitra.length} mitra terverifikasi
            </span>
          </div>
          <select
            value={filterPeran}
            onChange={(e) => setFilterPeran(e.target.value)}
            aria-label="Filter peran mitra"
            className="bg-latar-redup border border-garis text-xs font-medium text-teks px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand cursor-pointer"
          >
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
              <tr className="border-b border-garis text-teks-redup">
                <th scope="col" className="pb-3 font-medium">
                  Mitra
                </th>
                <th scope="col" className="pb-3 font-medium">
                  Peran
                </th>
                <th scope="col" className="pb-3 font-medium text-center">
                  Total Batch
                </th>
                <th scope="col" className="pb-3 font-medium text-right">
                  Dilaporkan
                </th>
                <th scope="col" className="pb-3 font-medium text-right">
                  Diterima
                </th>
                <th scope="col" className="pb-3 font-medium text-right">
                  Ditolak
                </th>
                <th scope="col" className="pb-3 font-medium text-right">
                  Tingkat Penerimaan
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-garis/60">
              {rekapTampil.map((baris) => (
                <tr key={baris.id}>
                  <td className="py-3">
                    <p className="font-bold text-teks">{baris.nama}</p>
                    <p className="text-[11px] text-teks-redup">{baris.kecamatan}</p>
                  </td>
                  <td className="py-3">
                    <span
                      className={`inline-flex whitespace-nowrap px-2 py-0.5 rounded-full text-[11px] font-semibold ${PERAN[baris.peran].gaya}`}
                    >
                      {PERAN[baris.peran].label}
                    </span>
                  </td>
                  <td className="py-3 text-center">{baris.jumlahBatch} batch</td>
                  <td className="py-3 text-right">{formatKg(baris.dilaporkanKg)}</td>
                  <td className="py-3 text-right font-semibold text-brand">{formatKg(baris.diterimaKg)}</td>
                  <td
                    className={`py-3 text-right ${baris.ditolakKg > 0 ? 'text-bahaya font-semibold' : 'text-teks-redup'}`}
                  >
                    {formatKg(baris.ditolakKg)}
                  </td>
                  <td className="py-3 text-right font-semibold">{formatPersen(baris.persenDiterima)}</td>
                </tr>
              ))}
            </tbody>
            {/* Total dihitung dari seluruh batch, bukan menjumlah baris: satu batch muncul di baris sumber DAN di baris pengolah */}
            <tfoot>
              <tr className="border-t-2 border-garis font-bold text-teks">
                <td className="pt-3" colSpan={2}>
                  Total seluruh batch
                </td>
                <td className="pt-3 text-center">{daftarBatch.length} batch</td>
                <td className="pt-3 text-right">{formatKg(totalBeratDilaporkan(daftarBatch))}</td>
                <td className="pt-3 text-right text-brand">{formatKg(totalBeratDiterima(daftarBatch))}</td>
                <td className="pt-3 text-right text-bahaya">{formatKg(totalBeratDitolak(daftarBatch))}</td>
                <td className="pt-3 text-right">{formatPersen(persenDiterima(daftarBatch))}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Kartu>

      {/* Catatan peran aplikasi */}
      <aside className="p-4 rounded-2xl bg-latar-redup border border-garis flex items-start gap-3 text-xs text-teks-redup">
        <Info className="w-4 h-4 text-brand shrink-0 mt-0.5" aria-hidden="true" />
        <p>
          Kelayakan material ditentukan oleh mitra pengolah, bukan oleh aplikasi. Berat diterima berasal dari timbangan
          manual saat serah terima; batch Ditolak tidak dihitung sebagai berat dilaporkan.
        </p>
      </aside>
    </div>
  );
}
