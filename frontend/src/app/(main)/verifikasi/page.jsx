'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  MapPin,
  Phone,
  Mail,
  User,
  Info,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Building2,
} from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import Toast from '@/components/ui/Toast';
import ModalAlasan from '@/components/ui/ModalAlasan';
import useToast from '@/hooks/useToast';
import { useBioRoute } from '@/context/BioRouteContext';
import { JENIS_AKSI } from '@/context/BioRouteReducer';
import { STATUS_VERIFIKASI } from '@/lib/constants';
import { formatKg, formatTanggal, formatTanggalJam } from '@/lib/format';
import { cariById, hitungMitraPerStatus } from '@/lib/hitung';
import { saringMitra, ambilHalaman, halamanUntuk } from '@/lib/tabel';

// Jumlah baris tabel per halaman.
const PER_HALAMAN = 5;
// Urutan tab mengikuti alur verifikasi: Menunggu → Terverifikasi / Ditolak.
const DAFTAR_TAB = [STATUS_VERIFIKASI.MENUNGGU, STATUS_VERIFIKASI.TERVERIFIKASI, STATUS_VERIFIKASI.DITOLAK];
// Pilihan urutan untuk saringMitra.
const PILIHAN_URUTAN = [
  { nilai: 'terbaru', label: 'Paling Baru' },
  { nilai: 'terlama', label: 'Paling Lama' },
  { nilai: 'nama', label: 'Nama A–Z' },
];
// Label dan warna badge peran mitra.
const PERAN = {
  sumber: { label: 'Mitra Sumber', gaya: 'bg-[#EAF5F0] text-[#16805D]' },
  pengolah: { label: 'Mitra Pengolah', gaya: 'bg-[#EFF6FF] text-[#2563EB]' },
};

/**
 * Isi halaman Verifikasi Mitra (W2): daftar pendaftaran mitra per status, detail mitra, serta keputusan Verifikasi / Tolak dari state BioRoute. idAwal = id mitra dari alamat (?id=...), atau null kalau dibuka biasa.
 */
function IsiHalamanVerifikasi({ idAwal }) {
  const { state, dispatch } = useBioRoute();
  const { daftarMitra, kategoriMaterial, jalurPemanfaatan } = state;
  // State tampilan saja (bukan data): tab, pencarian, urutan, halaman, mitra terpilih, dan modal tolak.
  const [tab, setTab] = useState(STATUS_VERIFIKASI.MENUNGGU);
  const [kataKunci, setKataKunci] = useState('');
  const [urutan, setUrutan] = useState('terbaru');
  // Mulai dari halaman tempat mitra idAwal berada di tab Menunggu (urutan terbaru).
  const [halaman, setHalaman] = useState(() =>
    halamanUntuk(
      saringMitra(daftarMitra, { status: STATUS_VERIFIKASI.MENUNGGU, kataKunci: '', urutan: 'terbaru' }),
      (mitra) => mitra.id === idAwal,
      PER_HALAMAN
    )
  );
  const [idTerpilih, setIdTerpilih] = useState(idAwal);
  const [modalTolakTerbuka, setModalTolakTerbuka] = useState(false);
  // Toast feedback
  const { toast, tampilkanToast } = useToast();

  // Angka di setiap tab, lalu saring → urutkan → potong per halaman.
  const jumlahPerStatus = hitungMitraPerStatus(daftarMitra);
  const hasilSaring = saringMitra(daftarMitra, { status: tab, kataKunci, urutan });
  const halamanTabel = ambilHalaman(hasilSaring, halaman, PER_HALAMAN);
  // Mitra terpilih harus terlihat di halaman ini; kalau tidak ada, pakai baris pertama halaman ini.
  const mitraTerpilih =
    halamanTabel.isi.find((mitra) => mitra.id === idTerpilih) ?? halamanTabel.isi[0] ?? null;
  const jalurPengolah = mitraTerpilih ? cariById(jalurPemanfaatan, mitraTerpilih.jalurId) : null;
  // Nomor tombol halaman: [1, 2, 3, ...]
  const nomorHalaman = Array.from({ length: halamanTabel.totalHalaman }, (_, i) => i + 1);
  // Keputusan admin hanya untuk mitra berstatus Menunggu.
  const bisaDiputuskan = mitraTerpilih?.statusVerifikasi === STATUS_VERIFIKASI.MENUNGGU;

  /**
   * Pindah tab status, lalu kembali ke halaman 1.
   */
  const gantiTab = (status) => {
    setTab(status);
    setHalaman(1);
    setIdTerpilih(null);
  };

  /**
   * Mengubah kata kunci pencarian, lalu kembali ke halaman 1.
   */
  const ubahKataKunci = (nilai) => {
    setKataKunci(nilai);
    setHalaman(1);
  };

  /**
   * Mengubah urutan, lalu kembali ke halaman 1.
   */
  const ubahUrutan = (nilai) => {
    setUrutan(nilai);
    setHalaman(1);
  };

  /**
   * Memverifikasi mitra terpilih (status → Terverifikasi).
   */
  const handleVerifikasi = () => {
    if (!bisaDiputuskan) return;
    dispatch({ type: JENIS_AKSI.VERIFIKASI_MITRA, payload: { id: mitraTerpilih.id } });
    tampilkanToast('success', `${mitraTerpilih.nama} berhasil diverifikasi.`);
  };

  /**
   * Menerima alasan yang sudah valid dari ModalAlasan, menolak mitra terpilih, lalu menutup modal.
   */
  const handleTolak = (alasan) => {
    dispatch({ type: JENIS_AKSI.TOLAK_MITRA, payload: { id: mitraTerpilih.id, alasan } });
    setModalTolakTerbuka(false);
    tampilkanToast('error', `Pendaftaran ${mitraTerpilih.nama} ditolak.`);
  };

  return (
    <div className="space-y-6 bg-white">

      {/* Toast Alert Feedback */}
      <Toast toast={toast} />

      {/* Modal alasan penolakan */}
      {modalTolakTerbuka && (
        <ModalAlasan
          judul={`Tolak pendaftaran ${mitraTerpilih?.nama}`}
          keterangan="Alasan ini disimpan dan tampil di detail mitra pada tab Ditolak."
          labelKirim="Tolak pendaftaran"
          varian="bahaya"
          onBatal={() => setModalTolakTerbuka(false)}
          onKirim={handleTolak}
        />
      )}

      {/* Judul halaman */}
      <section className="pb-1">
        <h1 className="text-2xl font-bold text-[#17231D] tracking-tight">Verifikasi Mitra</h1>
        <p className="text-sm text-[#66736C] mt-1">
          Periksa identitas, lokasi, dan kapasitas mitra sebelum akunnya diaktifkan.
        </p>
      </section>

      {/* Tab status (angka dihitung dari state) */}
      <nav aria-label="Status verifikasi mitra" className="border-b border-[#E5EAE7]">
        <div role="tablist" className="flex items-center gap-8">
          {DAFTAR_TAB.map((status) => {
            const isAktif = tab === status;
            return (
              <button
                key={status}
                type="button"
                role="tab"
                aria-selected={isAktif}
                onClick={() => gantiTab(status)}
                className={`pb-3 inline-flex items-center gap-2 text-sm font-medium transition-all cursor-pointer ${isAktif
                  ? 'text-[#176B4D] font-bold border-b-2 border-[#176B4D]'
                  : 'text-[#66736C] hover:text-[#17231D]'
                  }`}>
                <span>{status}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-semibold ${status === STATUS_VERIFIKASI.MENUNGGU && jumlahPerStatus[status] > 0
                    ? 'bg-red-50 text-red-600'
                    : 'bg-[#F4F6F5] text-[#66736C]'
                    }`}>
                  {jumlahPerStatus[status]}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Dua kolom: tabel (kiri) dan detail mitra (kanan) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* Kolom kiri: tabel mitra */}
        <section className="lg:col-span-7 rounded-2xl bg-white border border-[#E5EAE7] shadow-xs p-5 flex flex-col justify-between min-h-[480px]">
          <div>
            {/* Pencarian & urutan */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#66736C]">
                  <Search className="w-4 h-4" aria-hidden="true" />
                </span>
                <input
                  type="text"
                  value={kataKunci}
                  onChange={(e) => ubahKataKunci(e.target.value)}
                  placeholder="Cari nama, penanggung jawab, atau kecamatan"
                  aria-label="Cari nama, penanggung jawab, atau kecamatan"
                  className="w-full pl-9 pr-3.5 py-2 bg-[#F4F6F5] text-xs text-[#17231D] placeholder-[#66736C] rounded-xl border border-[#E5EAE7] focus:outline-none focus:ring-2 focus:ring-[#176B4D] focus:border-[#176B4D] transition-all"
                />
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <label htmlFor="pilih-urutan" className="text-[11px] font-semibold text-[#66736C] uppercase">
                  Urutkan:
                </label>
                <select
                  id="pilih-urutan"
                  value={urutan}
                  onChange={(e) => ubahUrutan(e.target.value)}
                  className="bg-[#F4F6F5] border border-[#E5EAE7] text-xs font-medium text-[#17231D] px-2.5 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#176B4D] cursor-pointer">
                  {PILIHAN_URUTAN.map((pilihan) => (
                    <option key={pilihan.nilai} value={pilihan.nilai}>
                      {pilihan.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tabel atau keadaan kosong */}
            {hasilSaring.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-[#E5EAE7] rounded-xl my-4">
                <Building2 className="w-8 h-8 text-[#66736C] mx-auto mb-2" aria-hidden="true" />
                <p className="text-sm font-semibold text-[#17231D]">Tidak ada mitra yang cocok</p>
                <p className="text-xs text-[#66736C] mt-1">
                  Belum ada mitra berstatus {tab}
                  {kataKunci.trim() ? ` dengan kata kunci "${kataKunci.trim()}"` : ''}.
                </p>
                {kataKunci.trim() && (
                  <button
                    type="button"
                    onClick={() => ubahKataKunci('')}
                    className="mt-3 text-xs font-semibold text-[#176B4D] hover:underline cursor-pointer">
                    Hapus pencarian
                  </button>
                )}
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
                      <th scope="col" className="pb-3 pr-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5EAE7]/60">
                    {halamanTabel.isi.map((mitra) => {
                      const isSelected = mitraTerpilih?.id === mitra.id;
                      const peran = PERAN[mitra.peran];

                      return (
                        <tr
                          key={mitra.id}
                          onClick={() => setIdTerpilih(mitra.id)}
                          tabIndex={0}
                          role="button"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              setIdTerpilih(mitra.id);
                            }
                          }}
                          className={`cursor-pointer transition-colors ${isSelected
                            ? 'bg-[#F4F6F5]/70 border-l-4 border-l-[#176B4D]'
                            : 'hover:bg-[#F4F6F5]/50'
                            }`}>
                          {/* Nama & penanggung jawab */}
                          <td className="py-3.5 pl-3">
                            <p className="font-bold text-[#17231D] leading-tight">{mitra.nama}</p>
                            <p className="text-[11px] text-[#66736C] mt-0.5">PJ: {mitra.penanggungJawab}</p>
                          </td>

                          {/* Jenis (peran) */}
                          <td className="py-3.5">
                            <span className={`inline-flex items-center whitespace-nowrap px-2 py-0.5 rounded-full text-[11px] font-semibold ${peran.gaya}`}>
                              {peran.label}
                            </span>
                          </td>

                          {/* Lokasi */}
                          <td className="py-3.5 text-[#17231D] hidden md:table-cell">{mitra.kecamatan}</td>

                          {/* Tanggal pengajuan */}
                          <td className="py-3.5 text-[#66736C] hidden sm:table-cell">
                            {formatTanggal(mitra.diajukanPada)}
                          </td>

                          {/* Status */}
                          <td className="py-3.5 pr-3">
                            <StatusBadge status={mitra.statusVerifikasi} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Footer tabel: keterangan & pagination */}
          <footer className="pt-4 mt-4 border-t border-[#E5EAE7] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#66736C]">
            <span>
              Menampilkan {halamanTabel.dari}–{halamanTabel.sampai} dari {halamanTabel.total} mitra
            </span>

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
                    className={`w-7 h-7 rounded-lg text-xs font-semibold cursor-pointer ${isAktif
                      ? 'bg-[#176B4D] text-white'
                      : 'border border-[#E5EAE7] text-[#17231D] hover:bg-[#F4F6F5]'
                      }`}>
                    {nomor}
                  </button>
                );
              })}
              <button
                type="button"
                aria-label="Halaman berikutnya"
                onClick={() => setHalaman(halamanTabel.halaman + 1)}
                disabled={halamanTabel.halaman === halamanTabel.totalHalaman}
                className="w-7 h-7 rounded-lg border border-[#E5EAE7] flex items-center justify-center text-[#66736C] hover:bg-[#F4F6F5] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </footer>
        </section>

        {/* Kolom kanan: detail mitra terpilih */}
        <aside className="lg:col-span-5 rounded-2xl bg-white border border-[#E5EAE7] shadow-xs p-6 space-y-6">
          {!mitraTerpilih ? (
            <p className="text-sm text-[#66736C] text-center py-10">Pilih mitra di tabel untuk melihat detailnya.</p>
          ) : (
            <>
              {/* Judul detail */}
              <header className="pb-4 border-b border-[#E5EAE7]">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-xl font-bold text-[#104D38] tracking-tight">{mitraTerpilih.nama}</h2>
                  <StatusBadge status={mitraTerpilih.statusVerifikasi} />
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-[#66736C]">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${PERAN[mitraTerpilih.peran].gaya}`}>
                    {PERAN[mitraTerpilih.peran].label}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                    Diajukan {formatTanggalJam(mitraTerpilih.diajukanPada)}
                  </span>
                  <span>• ID: {mitraTerpilih.id}</span>
                </div>
              </header>

              {/* Alasan penolakan (hanya kalau Ditolak) */}
              {mitraTerpilih.statusVerifikasi === STATUS_VERIFIKASI.DITOLAK && (
                <div className="p-3 rounded-xl bg-[#FEE2E2] border border-[#C2413B]/20 text-xs">
                  <p className="font-semibold text-[#C2413B]">Alasan penolakan:</p>
                  <p className="text-[#17231D] mt-0.5">{mitraTerpilih.alasan}</p>
                </div>
              )}

              {/* Identitas & kapasitas */}
              <section aria-labelledby="judul-identitas" className="space-y-3">
                <h3 id="judul-identitas" className="text-xs font-bold text-[#66736C] tracking-wider uppercase">
                  Identitas &amp; kapasitas
                </h3>
                <div className="p-4 rounded-2xl bg-[#F4F6F5] grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="text-[#66736C] flex items-center gap-1">
                      <User className="w-3.5 h-3.5" aria-hidden="true" /> Penanggung jawab
                    </p>
                    <p className="font-semibold text-[#17231D] mt-0.5">{mitraTerpilih.penanggungJawab}</p>
                  </div>
                  <div>
                    <p className="text-[#66736C] flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" aria-hidden="true" /> Telepon
                    </p>
                    <p className="font-semibold text-[#17231D] mt-0.5">{mitraTerpilih.telepon}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-[#66736C] flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5" aria-hidden="true" /> Email
                    </p>
                    <p className="font-semibold text-[#17231D] mt-0.5">{mitraTerpilih.email}</p>
                  </div>
                  <div className="sm:col-span-2 pt-3 border-t border-[#E5EAE7]">
                    {mitraTerpilih.peran === 'sumber' ? (
                      <>
                        <p className="text-[#66736C]">Estimasi residu harian</p>
                        <p className="text-2xl font-bold text-[#176B4D] mt-0.5">
                          {formatKg(mitraTerpilih.estimasiKgPerHari)}
                          <span className="text-xs font-semibold text-[#17231D]"> / hari</span>
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-[#66736C]">Kapasitas olah harian</p>
                        <p className="text-2xl font-bold text-[#176B4D] mt-0.5">
                          {formatKg(mitraTerpilih.kapasitasKgPerHari)}
                          <span className="text-xs font-semibold text-[#17231D]"> / hari</span>
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </section>

              {/* Alamat & titik lokasi */}
              <section aria-labelledby="judul-lokasi" className="space-y-3">
                <h3 id="judul-lokasi" className="text-xs font-bold text-[#66736C] tracking-wider uppercase">
                  Alamat &amp; titik lokasi
                </h3>
                <p className="text-xs text-[#17231D] flex items-start gap-1.5">
                  <MapPin className="w-4 h-4 text-[#176B4D] shrink-0" aria-hidden="true" />
                  <span>
                    {mitraTerpilih.alamat}, {mitraTerpilih.kecamatan}, Kab. Banyumas
                  </span>
                </p>
                <p className="text-[11px] text-[#66736C] font-mono">
                  Koordinat: {mitraTerpilih.koordinat.lat}, {mitraTerpilih.koordinat.lng}
                </p>
              </section>

              {/* Material (sumber) atau jalur pemanfaatan (pengolah) */}
              {mitraTerpilih.peran === 'sumber' ? (
                <section aria-labelledby="judul-material" className="space-y-3">
                  <h3 id="judul-material" className="text-xs font-bold text-[#66736C] tracking-wider uppercase">
                    Kategori material yang dihasilkan
                  </h3>
                  <ul className="flex flex-wrap gap-2">
                    {mitraTerpilih.kategoriIds.map((kategoriId) => (
                      <li
                        key={kategoriId}
                        className="px-3 py-1.5 rounded-xl border border-[#E5EAE7] text-xs font-semibold text-[#17231D]">
                        {cariById(kategoriMaterial, kategoriId)?.nama}
                      </li>
                    ))}
                  </ul>
                </section>
              ) : (
                <section aria-labelledby="judul-jalur" className="space-y-3">
                  <h3 id="judul-jalur" className="text-xs font-bold text-[#66736C] tracking-wider uppercase">
                    Jalur pemanfaatan
                  </h3>
                  <div className="p-3 rounded-xl border border-[#E5EAE7] text-xs">
                    <p className="font-semibold text-[#17231D]">{jalurPengolah?.nama}</p>
                    <p className="text-[#66736C] mt-0.5">Material diterima: {jalurPengolah?.materialDiterima}</p>
                  </div>
                </section>
              )}

              {/* Catatan batas peran aplikasi */}
              <div className="p-3 rounded-xl bg-[#F4F6F5] text-xs text-[#66736C] flex items-start gap-2">
                <Info className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                <p>
                  Kelayakan material ditentukan oleh mitra pengolah, bukan oleh aplikasi. Verifikasi akun hanya
                  memastikan identitas, lokasi, dan penanggung jawab mitra.
                </p>
              </div>

              {/* Keputusan admin (hanya status Menunggu) */}
              {bisaDiputuskan ? (
                <div className="pt-4 border-t border-[#E5EAE7] space-y-3">
                  {mitraTerpilih.peran === 'pengolah' && (
                    <p className="text-[11px] text-[#66736C]">
                      Setelah diverifikasi, mitra ini bisa dipilih saat menyetujui batch jalur {jalurPengolah?.nama}.
                    </p>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setModalTolakTerbuka(true)}
                      className="border border-[#E5EAE7] hover:bg-[#FEE2E2] text-sm font-medium py-2.5 rounded-xl text-[#C2413B] flex items-center justify-center gap-1.5 transition-colors cursor-pointer">
                      <XCircle className="w-4 h-4" aria-hidden="true" />
                      <span>Tolak Pendaftaran</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleVerifikasi}
                      className="bg-[#176B4D] hover:bg-[#104D38] text-sm font-medium py-2.5 rounded-xl text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer">
                      <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                      <span>Verifikasi Mitra</span>
                    </button>
                  </div>
                </div>
              ) : (
                <p className="pt-4 border-t border-[#E5EAE7] text-xs text-[#66736C]">
                  Mitra ini berstatus <strong>{mitraTerpilih.statusVerifikasi}</strong>. Keputusan admin hanya
                  untuk mitra berstatus Menunggu.
                </p>
              )}
            </>
          )}
        </aside>
      </div>
    </div>
  );
}

/**
 * Halaman Verifikasi Mitra. Membaca ?id= dari alamat (tombol Tinjau di Dashboard).
 * key membuat isi halaman dimulai ulang setiap id berubah, supaya mitra yang terbuka selalu sesuai alamat.
 */
export default function VerifikasiPage() {
  const idDariUrl = useSearchParams().get('id');
  return <IsiHalamanVerifikasi key={idDariUrl} idAwal={idDariUrl} />;
}