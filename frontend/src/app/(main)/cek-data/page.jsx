'use client';

import { useBioRoute } from '@/context/BioRouteContext';
import { JENIS_AKSI } from '@/context/BioRouteReducer';
import { formatKg, formatPersen, formatTanggalJam } from '@/lib/format';
import {
  cariById,
  totalBeratDilaporkan,
  totalBeratDiterima,
  totalBeratDitolak,
  hitungBatchAktif,
  beratDiterimaPerJalur,
} from '@/lib/hitung';

// Halaman sementara untuk melihat hasil format.js, hitung.js, dan Context.
// Data sekarang dibaca dari Context (bukan import langsung), jadi perubahan dari tombol uji tetap ada saat pindah halaman.

// Batch yang dipakai untuk uji coba
const KODE_UJI = 'BR-2611-010';

/**
 * Halaman cek data (client component, karena memakai hook dan tombol).
 */
export default function CekDataPage() {
  const { state, dispatch } = useBioRoute();
  const { daftarBatch, daftarMitra, jalurPemanfaatan } = state;

  const batchPertama = daftarBatch[0];
  const sumberPertama = cariById(daftarMitra, batchPertama.sumberId);
  const perJalur = beratDiterimaPerJalur(daftarBatch, jalurPemanfaatan);
  const batchUji = daftarBatch.find((batch) => batch.kode === KODE_UJI);

  /**
   * Mengirim aksi "setujui & tawarkan" untuk batch uji ke reducer.
   */
  const handleSetujui = () => {
    dispatch({
      type: JENIS_AKSI.SETUJUI_BATCH,
      // waktu dibuat di sini supaya reducer tetap murni
      payload: { kode: KODE_UJI, pengolahId: 'MTR-101', waktu: new Date().toISOString() },
    });
  };

  /**
   * Mengirim aksi "tolak" untuk batch uji ke reducer.
   */
  const handleTolak = () => {
    dispatch({
      type: JENIS_AKSI.TOLAK_BATCH,
      payload: { kode: KODE_UJI, alasan: 'Uji coba dari halaman cek data', waktu: new Date().toISOString() },
    });
  };

  return (
    <div className="max-w-xl space-y-4">
      <div className="rounded-2xl border border-[#E5EAE7] bg-white p-6">
        <h1 className="mb-4 text-xl font-semibold text-[#104D38]">Cek Data (sementara)</h1>

        <ul className="space-y-1 text-[#17231D]">
          <li>Jumlah batch: {daftarBatch.length}</li>
          <li>Berat dilaporkan: {formatKg(totalBeratDilaporkan(daftarBatch))}</li>
          <li>Berat diterima: {formatKg(totalBeratDiterima(daftarBatch))}</li>
          <li>Berat ditolak: {formatKg(totalBeratDitolak(daftarBatch))}</li>
          <li>Batch aktif: {hitungBatchAktif(daftarBatch)}</li>
          <li>
            Batch pertama: {batchPertama.kode} dari {sumberPertama?.nama}, diajukan{' '}
            {formatTanggalJam(batchPertama.diajukanPada)}
          </li>
        </ul>

        <h2 className="mt-6 mb-2 font-semibold text-[#104D38]">Berat diterima per jalur</h2>
        <ul className="space-y-1 text-[#17231D]">
          {perJalur.map((jalur) => (
            // key wajib di map supaya React bisa membedakan setiap baris
            <li key={jalur.id}>
              {jalur.nama}: {formatKg(jalur.kg)} ({formatPersen(jalur.persen)})
            </li>
          ))}
        </ul>
      </div>

      {/* Uji Context: tombol mengirim aksi ke reducer */}
      <div className="rounded-2xl border border-[#E5EAE7] bg-white p-6">
        <h2 className="mb-2 font-semibold text-[#104D38]">Uji Context</h2>
        <p className="text-[#17231D]">
          {KODE_UJI}: <strong>{batchUji?.status}</strong>
        </p>
        <p className="mb-4 text-sm text-[#66736C]">
          Riwayat terakhir: {batchUji?.riwayat.at(-1)?.keterangan}
        </p>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleSetujui}
            className="rounded-xl bg-[#176B4D] px-4 py-2 text-sm font-semibold text-white hover:bg-[#104D38]"
          >
            Setujui & tawarkan
          </button>
          <button
            type="button"
            onClick={handleTolak}
            className="rounded-xl border border-[#C2413B] px-4 py-2 text-sm font-semibold text-[#C2413B] hover:bg-[#C2413B]/5"
          >
            Tolak
          </button>
        </div>
      </div>
    </div>
  );
}