'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Scale,
  ShieldCheck,
  Search,
  Download,
  Clock,
  Info,
  ChevronLeft,
  ChevronRight,
  Archive,
  Check,
  CheckSquare,
  FileText,
  XCircle,
} from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import RouteBadge from '@/components/ui/RouteBadge';
import Toast from '@/components/ui/Toast';
import useToast from '@/hooks/useToast';
import { useBioRoute } from '@/context/BioRouteContext';
import { JENIS_AKSI } from '@/context/BioRouteReducer';
import { STATUS_BATCH } from '@/lib/constants';
import { formatKg, formatTanggalJam } from '@/lib/format';
import {
  cariById,
  totalBeratDilaporkan,
  hitungBatchPerStatus,
  batchTerbaru,
  pengolahUntukJalur,
} from '@/lib/hitung';
import { saringBatch, ambilHalaman, halamanUntuk } from '@/lib/tabel';
import ModalAlasan from '@/components/ui/ModalAlasan';
// Jumlah baris tabel per halaman.
const PER_HALAMAN = 5;
// Filter awal: teks kosong berarti "semua".
const FILTER_AWAL = { kataKunci: '', status: '', kategoriId: '', jalurId: '' };

/**
 * Isi halaman Batch Material (W3): daftar batch, filter, pagination, dan detail batch dari state BioRoute.
 * kodeAwal = kode batch dari alamat (?kode=...), atau null kalau dibuka biasa.
 */
function IsiHalamanBatch({ kodeAwal }) {
  const { state, dispatch } = useBioRoute();
  const { daftarBatch, daftarMitra, kategoriMaterial, jalurPemanfaatan } = state;
  // State tampilan saja (bukan data): filter, halaman, dan batch yang sedang dipilih.
  const [filter, setFilter] = useState(FILTER_AWAL);
  // Mulai dari halaman tempat batch kodeAwal berada (fungsi di dalam useState hanya dijalankan sekali).
  const [halaman, setHalaman] = useState(() =>
    halamanUntuk(batchTerbaru(daftarBatch, daftarBatch.length), (batch) => batch.kode === kodeAwal, PER_HALAMAN)
  );
  const [kodeTerpilih, setKodeTerpilih] = useState(kodeAwal);
  // State untuk keputusan admin: pengolah yang dipilih dan modal alasan.
  const [pengolahDipilih, setPengolahDipilih] = useState(null);
  const [jenisModal, setJenisModal] = useState(null); // null | 'revisi' | 'tolak'
  // Toast feedback
  const { toast, tampilkanToast } = useToast();

  /**
   * Mengubah satu bagian filter, lalu kembali ke halaman 1.
   */
  const ubahFilter = (nama, nilai) => {
    setFilter((sebelumnya) => ({ ...sebelumnya, [nama]: nilai }));
    setHalaman(1);
  };

  /**
   * Mengembalikan semua filter ke awal.
   */
  const handleResetFilters = () => {
    setFilter(FILTER_AWAL);
    setHalaman(1);
  };
  // Urutkan dari yang paling baru, saring, lalu potong per halaman.
  const batchUrut = batchTerbaru(daftarBatch, daftarBatch.length);
  const hasilSaring = saringBatch(batchUrut, daftarMitra, filter);
  const halamanTabel = ambilHalaman(hasilSaring, halaman, PER_HALAMAN);
  // Batch terpilih harus terlihat di halaman ini; kalau tidak ada, pakai baris pertama halaman ini.
  const batchTerpilih =
    halamanTabel.isi.find((batch) => batch.kode === kodeTerpilih) ?? halamanTabel.isi[0] ?? null;
  const sumberTerpilih = batchTerpilih ? cariById(daftarMitra, batchTerpilih.sumberId) : null;
  const pengolahTerpilih = batchTerpilih ? cariById(daftarMitra, batchTerpilih.pengolahId) : null;
  // Nomor tombol halaman: [1, 2, 3, ...]
  const nomorHalaman = Array.from({ length: halamanTabel.totalHalaman }, (_, i) => i + 1);
  // Keputusan admin hanya untuk batch berstatus Diajukan.
  const bisaDiputuskan = batchTerpilih?.status === STATUS_BATCH.DIAJUKAN;
  const daftarPengolah = batchTerpilih ? pengolahUntukJalur(daftarMitra, batchTerpilih.jalurId) : [];
  // pilihan pengolah dari batch lain tidak berlaku untuk batch ini
  const pengolahValid = daftarPengolah.some((mitra) => mitra.id === pengolahDipilih);

  /**
   * Menyetujui batch dan menawarkannya ke pengolah yang dipilih (status → Tersedia).
   */
  const handleSetujui = () => {
    if (!bisaDiputuskan || !pengolahValid) return;
    const pengolah = cariById(daftarMitra, pengolahDipilih);
    dispatch({
      type: JENIS_AKSI.SETUJUI_BATCH,
      payload: { kode: batchTerpilih.kode, pengolahId: pengolahDipilih, waktu: new Date().toISOString() },
    });
    setPengolahDipilih(null);
    tampilkanToast('success', `Batch ${batchTerpilih.kode} disetujui dan ditawarkan ke ${pengolah.nama}.`);
  };

  /**
   * Membuka modal alasan untuk 'revisi' atau 'tolak'.
   */
  const bukaModal = (jenis) => {
    setJenisModal(jenis);
  };

  /**
   * Menutup modal tanpa menyimpan apa pun.
   */
  const tutupModal = () => {
    setJenisModal(null);
  };
  /**
   * Menerima alasan yang sudah valid dari ModalAlasan, dispatch sesuai jenis modal, lalu tutup modal.
   */
  const handleKirimAlasan = (alasan) => {
    const waktu = new Date().toISOString();
    if (jenisModal === 'revisi') {
      dispatch({
        type: JENIS_AKSI.MINTA_REVISI_BATCH,
        payload: { kode: batchTerpilih.kode, alasan, waktu },
      });
      tampilkanToast('warning', `Permintaan revisi untuk ${batchTerpilih.kode} dikirim ke ${sumberTerpilih?.nama}.`);
    } else {
      dispatch({
        type: JENIS_AKSI.TOLAK_BATCH,
        payload: { kode: batchTerpilih.kode, alasan, waktu },
      });
      tampilkanToast('error', `Batch ${batchTerpilih.kode} ditolak.`);
    }
    setJenisModal(null);
  };

  return (
    <div className="space-y-6 bg-white">

      {/* Toast Alert Feedback */}
      <Toast toast={toast} />

      {/* Modal alasan (Minta revisi / Tolak) */}
      {jenisModal && (
        <ModalAlasan
          judul={`${jenisModal === 'revisi' ? 'Minta revisi' : 'Tolak batch'} ${batchTerpilih?.kode}`}
          keterangan={`Alasan ini dikirim ke ${sumberTerpilih?.nama} dan tampil di detail batch.`}
          labelKirim={jenisModal === 'revisi' ? 'Kirim permintaan revisi' : 'Tolak batch'}
          varian={jenisModal === 'revisi' ? 'peringatan' : 'bahaya'}
          onBatal={tutupModal}
          onKirim={handleKirimAlasan}
        />
      )}

      {/* 3. PAGE HEADER & METRIC KPI CARDS */}
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
          {/* Card 1: Berat tercatat */}
          <article className="p-3.5 rounded-2xl bg-white border border-[#E5EAE7] shadow-xs flex items-center gap-3 min-w-[140px]">
            <div className="p-2 rounded-xl bg-[#EAF5F0] text-[#176B4D]">
              <Scale className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#66736C] tracking-wider uppercase leading-tight">
                BERAT TERCATAT
              </p>
              <p className="text-xl font-bold text-[#17231D] leading-tight mt-0.5">
                {formatKg(totalBeratDilaporkan(daftarBatch))}
              </p>
            </div>
          </article>

          {/* Card 2: Menunggu keputusan admin */}
          <article className="p-3.5 rounded-2xl bg-white border border-[#E5EAE7] shadow-xs flex items-center gap-3 min-w-[140px]">
            <div className="p-2 rounded-xl bg-[#EFF6FF] text-[#2563EB]">
              <ShieldCheck className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#66736C] tracking-wider uppercase leading-tight">
                MENUNGGU KEPUTUSAN
              </p>
              <p className="text-xl font-bold text-[#17231D] leading-tight mt-0.5">
                {hitungBatchPerStatus(daftarBatch, STATUS_BATCH.DIAJUKAN)} batch
              </p>
            </div>
          </article>
        </div>
      </section>

      {/* 4. FILTER CONTROLS & ACTIVE CHIPS BAR */}
      <section aria-label="Filter Kontrol Batch" className="space-y-3">
        {/* Filter Inputs Row (4 Columns) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* 1. Search Input */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#66736C]">
              <Search className="w-4 h-4" aria-hidden="true" />
            </span>
            <input
              type="text"
              value={filter.kataKunci}
              onChange={(e) => ubahFilter('kataKunci', e.target.value)}
              placeholder="Cari kode atau sumber"
              aria-label="Cari kode atau nama sumber"
              className="w-full pl-9 pr-3.5 py-2 bg-[#F4F6F5] text-xs text-[#17231D] placeholder-[#66736C] rounded-xl border border-[#E5EAE7] focus:outline-none focus:ring-2 focus:ring-[#176B4D] focus:border-[#176B4D] transition-all"
            />
          </div>

          {/* 2. Status Select (pilihan dari STATUS_BATCH) */}
          <div>
            <select
              value={filter.status}
              onChange={(e) => ubahFilter('status', e.target.value)}
              aria-label="Filter Status"
              className="w-full bg-[#F4F6F5] border border-[#E5EAE7] text-xs font-medium text-[#17231D] px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#176B4D] cursor-pointer">
              <option value="">Semua Status</option>
              {Object.values(STATUS_BATCH).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Kategori Select (pilihan dari master data) */}
          <div>
            <select
              value={filter.kategoriId}
              onChange={(e) => ubahFilter('kategoriId', e.target.value)}
              aria-label="Filter Kategori"
              className="w-full bg-[#F4F6F5] border border-[#E5EAE7] text-xs font-medium text-[#17231D] px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#176B4D] cursor-pointer">
              <option value="">Semua Kategori</option>
              {kategoriMaterial.map((kategori) => (
                <option key={kategori.id} value={kategori.id}>
                  {kategori.nama}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Jalur Select (pilihan dari master data) */}
          <div>
            <select
              value={filter.jalurId}
              onChange={(e) => ubahFilter('jalurId', e.target.value)}
              aria-label="Filter Jalur"
              className="w-full bg-[#F4F6F5] border border-[#E5EAE7] text-xs font-medium text-[#17231D] px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#176B4D] cursor-pointer">
              <option value="">Semua Jalur</option>
              {jalurPemanfaatan.map((jalur) => (
                <option key={jalur.id} value={jalur.id}>
                  {jalur.nama}
                </option>
              ))}
            </select>
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
              <span>Kategori: {cariById(kategoriMaterial, filter.kategoriId)?.nama ?? 'Semua'}</span>
              <button
                type="button"
                onClick={() => ubahFilter('kategoriId', '')}
                className="hover:text-[#C2413B] text-[#66736C] cursor-pointer"
                aria-label="Hapus filter kategori">
                ✕
              </button>
            </span>

            {/* Chip 2 */}
            <span className="inline-flex items-center gap-1.5 bg-[#F4F6F5] border border-[#E5EAE7] rounded-lg px-2.5 py-1 text-xs font-medium text-[#17231D]">
              <span>Jalur: {cariById(jalurPemanfaatan, filter.jalurId)?.nama ?? 'Semua'}</span>
              <button
                type="button"
                onClick={() => ubahFilter('jalurId', '')}
                className="hover:text-[#C2413B] text-[#66736C] cursor-pointer"
                aria-label="Hapus filter jalur">
                ✕
              </button>
            </span>
          </div>

          {/* Reset Filter Button */}
          <button
            type="button"
            onClick={handleResetFilters}
            className="hover:text-[#176B4D] font-medium transition cursor-pointer text-xs underline decoration-dotted">
            Reset Filter
          </button>
        </div>
      </section>

      {/* 5. TWO-COLUMN SPLIT LAYOUT (7:5 DESKTOP GRID) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* A. LEFT COLUMN: BATCH LIST TABLE (lg:col-span-7) */}
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

              {/* Action Button: Export */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  title="Ekspor CSV"
                  aria-label="Ekspor CSV"
                  onClick={() =>
                    tampilkanToast('success', 'Data batch material berhasil diekspor (Format CSV).')
                  }
                  className="border border-[#E5EAE7] rounded-lg p-2 text-[#66736C] hover:bg-[#F4F6F5] hover:text-[#17231D] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176B4D] cursor-pointer">
                  <Download className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Table Body */}
            {hasilSaring.length === 0 ? (
              <div className="p-10 text-center border border-dashed border-[#E5EAE7] rounded-xl my-4">
                <Archive className="w-8 h-8 text-[#66736C] mx-auto mb-2" />
                <p className="text-sm font-semibold text-[#17231D]">Tidak ada batch yang cocok</p>
                <p className="text-xs text-[#66736C] mt-1">
                  Ubah kata kunci pencarian atau reset filter untuk menampilkan kembali daftar batch.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="mt-3 text-xs font-semibold text-[#176B4D] hover:underline">
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
                      <th scope="col" className="pb-3 font-medium hidden xl:table-cell">Kategori</th>
                      <th scope="col" className="pb-3 pr-3 font-medium">Berat</th>
                      <th scope="col" className="pb-3 font-medium">Jalur</th>
                      <th scope="col" className="pb-3 pr-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5EAE7]/60">
                    {halamanTabel.isi.map((batch) => {
                      const isSelected = batchTerpilih?.kode === batch.kode;
                      const sumber = cariById(daftarMitra, batch.sumberId);

                      return (
                        <tr
                          key={batch.kode}
                          onClick={() => setKodeTerpilih(batch.kode)}
                          tabIndex={0}
                          role="button"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              setKodeTerpilih(batch.kode);
                            }
                          }}
                          className={`cursor-pointer transition-colors ${isSelected
                            ? 'bg-[#F4F6F5]/70 border-l-4 border-l-[#176B4D]'
                            : 'hover:bg-[#F4F6F5]/50'
                            }`}
                        >
                          {/* Kode Batch */}
                          <td className="py-3.5 pl-3">
                            <div className="flex items-center gap-1.5 font-bold text-[#17231D]">
                              <span className="text-[#176B4D] text-[10px] leading-none">●</span>
                              <span>{batch.kode}</span>
                            </div>
                          </td>

                          {/* Sumber Material */}
                          <td className="py-3.5">
                            <p className="font-semibold text-[#17231D] leading-tight">
                              {sumber?.nama}
                            </p>
                            <p className="text-[11px] text-[#66736C] mt-0.5">
                              {sumber?.kecamatan}
                            </p>
                          </td>

                          {/* Kategori */}
                          <td className="py-3.5 text-[#66736C] hidden xl:table-cell">
                            {cariById(kategoriMaterial, batch.kategoriId)?.nama}
                          </td>

                          {/* Berat */}
                          <td className="py-3.5 pr-3 font-bold text-[#17231D]">
                            {formatKg(batch.beratKg)}
                          </td>

                          {/* Jalur */}
                          <td className="py-3.5">
                            <RouteBadge jalur={cariById(jalurPemanfaatan, batch.jalurId)?.nama} />
                          </td>

                          {/* Status */}
                          <td className="py-3.5 pr-3">
                            <StatusBadge status={batch.status} />
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
              Menampilkan {halamanTabel.dari}–{halamanTabel.sampai} dari {halamanTabel.total} batch
            </span>

            {/* Pagination */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="Halaman sebelumnya"
                onClick={() => setHalaman(halamanTabel.halaman - 1)}
                disabled={halamanTabel.halaman === 1}
                className="w-7 h-7 rounded-lg border border-[#E5EAE7] flex items-center justify-center text-[#66736C] hover:bg-[#F4F6F5] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              {nomorHalaman.map((nomor) => {
                const isAktif = nomor === halamanTabel.halaman;
                return (
                  <button
                    key={nomor}
                    type="button"
                    onClick={() => setHalaman(nomor)}
                    aria-label={`Halaman ${nomor}`}
                    aria-current={isAktif ? 'page' : undefined}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer ${isAktif
                      ? 'bg-[#176B4D] text-white font-semibold shadow-xs'
                      : 'border border-[#E5EAE7] text-[#17231D] hover:bg-[#F4F6F5]'
                      }`}>
                    {nomor}
                  </button>
                );
              })}
              <button
                type="button"
                aria-label="Halaman selanjutnya"
                onClick={() => setHalaman(halamanTabel.halaman + 1)}
                disabled={halamanTabel.halaman === halamanTabel.totalHalaman}
                className="w-7 h-7 rounded-lg border border-[#E5EAE7] flex items-center justify-center text-[#66736C] hover:bg-[#F4F6F5] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </footer>
        </section>

        {/* B. RIGHT COLUMN: BATCH DETAIL PANEL (lg:col-span-5) */}
        <aside className="lg:col-span-5 bg-white border border-[#E5EAE7] rounded-2xl p-6 shadow-sm flex flex-col gap-5">
          {batchTerpilih ? (
            <>
              {/* 1. Header Row */}
              <header className="pb-3 border-b border-[#E5EAE7]">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-lg font-bold text-[#17231D] tracking-tight">
                    Detail Batch {batchTerpilih.kode}
                  </h2>
                  <StatusBadge status={batchTerpilih.status} />
                </div>

                <div className="flex items-center gap-1.5 text-xs text-[#66736C] mt-1.5">
                  <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Diajukan {formatTanggalJam(batchTerpilih.diajukanPada)}</span>
                </div>
              </header>

              {/* 2. Alasan revisi / penolakan (hanya kalau ada) */}
              {batchTerpilih.alasan && (
                <section className="bg-[#FEF3C7]/60 border border-[#B7791F]/20 rounded-xl p-3 text-xs">
                  <p className="font-semibold text-[#B7791F]">Alasan {batchTerpilih.status.toLowerCase()}:</p>
                  <p className="text-[#17231D] mt-0.5">{batchTerpilih.alasan}</p>
                </section>
              )}

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
                      {sumberTerpilih?.nama} ({sumberTerpilih?.penanggungJawab})
                    </p>
                    <p className="text-[11px] text-[#66736C] mt-0.5">
                      {sumberTerpilih?.alamat}, {sumberTerpilih?.kecamatan}
                    </p>
                  </div>

                  {/* Berat */}
                  <div className="pt-2 border-t border-[#E5EAE7]">
                    <span className="text-[#66736C] block">Berat Dilaporkan Sumber:</span>
                    <p className="text-2xl font-bold text-[#176B4D] mt-0.5">
                      {formatKg(batchTerpilih.beratKg)}
                    </p>
                    <p className="text-[11px] text-[#66736C] mt-0.5">
                      Ditimbang pengolah: {formatKg(batchTerpilih.beratDiterimaKg)}
                    </p>
                  </div>

                  {/* Kategori Residu */}
                  <div className="pt-2 border-t border-[#E5EAE7]">
                    <span className="text-[#66736C] block">Kategori Residu:</span>
                    <p className="font-medium text-[#17231D] mt-0.5">
                      {cariById(kategoriMaterial, batchTerpilih.kategoriId)?.nama} — {batchTerpilih.namaMaterial}
                    </p>
                  </div>

                  {/* Metode & Pengolah */}
                  <div className="pt-2 border-t border-[#E5EAE7]">
                    <span className="text-[#66736C] block">Metode Penjemputan:</span>
                    <p className="font-medium text-[#17231D] mt-0.5">
                      {batchTerpilih.metode}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-[#E5EAE7]">
                    <span className="text-[#66736C] block">Mitra Pengolah:</span>
                    <p className="font-medium text-[#17231D] mt-0.5">
                      {pengolahTerpilih?.nama ?? 'Belum ditentukan'}
                    </p>
                  </div>
                </div>
              </section>

              {/* 4. Riwayat Batch (Timeline Stepper) */}
              <section aria-labelledby="timeline-heading" className="space-y-3">
                <h3 id="timeline-heading" className="text-xs font-bold text-[#66736C] uppercase tracking-wider">
                  RIWAYAT BATCH
                </h3>
                <div className="relative pl-6 space-y-4">
                  {/* Connecting Line */}
                  <div className="absolute top-2 bottom-2 left-2 w-0.5 bg-[#E5EAE7]" />

                  {batchTerpilih.riwayat.map((item) => (
                    <div key={item.waktu + item.keterangan} className="relative flex items-start gap-2.5">
                      {/* Dot indicator */}
                      <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full ring-4 ring-white bg-[#176B4D]" />
                      <div className="text-xs">
                        <p className="font-bold text-[#17231D]">{item.keterangan}</p>
                        <p className="text-[11px] text-[#66736C] mt-0.5">
                          {formatTanggalJam(item.waktu)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* 5. Regulatory Disclaimer */}
              <aside className="bg-[#F4F6F5] border border-[#E5EAE7] rounded-xl p-3 text-xs text-[#66736C] flex items-start gap-2">
                <Info className="w-4 h-4 text-[#176B4D] shrink-0 mt-0.5" aria-hidden="true" />
                <p className="text-[11px] leading-relaxed">
                  Kelayakan material ditentukan oleh mitra pengolah, bukan oleh aplikasi.
                </p>
              </aside>

              {/* 6. Keputusan admin */}
              {bisaDiputuskan ? (
                <section aria-labelledby="keputusan-heading" className="space-y-3">
                  <h3 id="keputusan-heading" className="text-xs font-bold text-[#66736C] uppercase tracking-wider">
                    TAWARKAN KE MITRA PENGOLAH
                  </h3>

                  {daftarPengolah.length === 0 ? (
                    <p className="text-xs text-[#66736C]">
                      Belum ada mitra pengolah terverifikasi untuk jalur ini.
                    </p>
                  ) : (
                    <div role="radiogroup" aria-label="Pilih mitra pengolah" className="space-y-2">
                      {daftarPengolah.map((mitra) => {
                        const isDipilih = pengolahDipilih === mitra.id;
                        return (
                          <button
                            key={mitra.id}
                            type="button"
                            role="radio"
                            aria-checked={isDipilih}
                            onClick={() => setPengolahDipilih(mitra.id)}
                            className={`w-full text-left p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-start gap-2.5 ${isDipilih
                              ? 'border-[#176B4D] bg-[#EAF5F0]/60 ring-1 ring-[#176B4D]'
                              : 'border-[#E5EAE7] bg-[#F4F6F5]/40 hover:bg-[#F4F6F5]'
                              }`}>
                            <span
                              className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${isDipilih ? 'border-[#176B4D] bg-[#176B4D] text-white' : 'border-[#66736C] bg-white'
                                }`}>
                              {isDipilih && <Check className="w-2.5 h-2.5" aria-hidden="true" />}
                            </span>
                            <span>
                              <span className="block font-bold text-[#17231D]">{mitra.nama}</span>
                              <span className="block text-[11px] text-[#66736C] mt-0.5">
                                {mitra.kecamatan} • Kapasitas {formatKg(mitra.kapasitasKgPerHari)}/hari
                              </span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Tombol keputusan */}
                  <button
                    type="button"
                    onClick={handleSetujui}
                    disabled={!pengolahValid}
                    className="w-full bg-[#176B4D] hover:bg-[#104D38] text-white text-sm font-medium py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                    <CheckSquare className="w-4 h-4" aria-hidden="true" />
                    <span>Setujui &amp; Tawarkan</span>
                  </button>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => bukaModal('revisi')}
                      className="border border-[#E5EAE7] hover:bg-[#F4F6F5] text-sm font-medium py-2.5 rounded-xl text-[#17231D] flex items-center justify-center gap-1.5 transition-colors cursor-pointer">
                      <FileText className="w-4 h-4 text-[#B7791F]" aria-hidden="true" />
                      <span>Minta Revisi</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => bukaModal('tolak')}
                      className="border border-[#E5EAE7] hover:bg-[#FEE2E2] text-sm font-medium py-2.5 rounded-xl text-[#C2413B] flex items-center justify-center gap-1.5 transition-colors cursor-pointer">
                      <XCircle className="w-4 h-4" aria-hidden="true" />
                      <span>Tolak</span>
                    </button>
                  </div>
                  {!pengolahValid && daftarPengolah.length > 0 && (
                    <p className="text-[11px] text-[#66736C]">
                      Pilih mitra pengolah dulu untuk menyetujui batch ini.
                    </p>
                  )}
                </section>
              ) : (
                <p className="text-xs text-[#66736C] bg-[#F4F6F5] border border-[#E5EAE7] rounded-xl p-3">
                  Batch ini berstatus <strong>{batchTerpilih.status}</strong>. Keputusan admin hanya untuk batch
                  berstatus Diajukan.
                </p>
              )}
            </>) : (
            <div className="p-8 text-center text-[#66736C] text-xs">
              Pilih salah satu batch dari tabel di sebelah kiri untuk melihat rincian batch.
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

/**
 * Halaman Batch Material. Membaca ?kode= dari alamat (tombol Detail di Dashboard). key membuat isi halaman dimulai ulang setiap kode berubah, supaya batch yang terbuka selalu sesuai alamat.
 */
export default function BatchPage() {
  const kodeDariUrl = useSearchParams().get('kode');
  return <IsiHalamanBatch key={kodeDariUrl} kodeAwal={kodeDariUrl} />;
}