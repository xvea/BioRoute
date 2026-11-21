import { daftarBatch } from '@/lib/data/batch';
import { daftarMitra } from '@/lib/data/mitra';
import { jalurPemanfaatan } from '@/lib/data/masterData';
import { formatKg, formatPersen, formatTanggalJam } from '@/lib/format';
import {
  cariById,
  totalBeratDilaporkan,
  totalBeratDiterima,
  totalBeratDitolak,
  hitungBatchAktif,
  beratDiterimaPerJalur,
} from '@/lib/hitung';

// Halaman untuk melihat hasil format.js dan hitung.js dengan data asli.

/**
 * Halaman cek data
 */
export default function CekDataPage() {
  const batchPertama = daftarBatch[0];
  // ?. → kalau mitra tidak ketemu (null), hasilnya undefined, bukan error
  const sumberPertama = cariById(daftarMitra, batchPertama.sumberId);
  const perJalur = beratDiterimaPerJalur(daftarBatch, jalurPemanfaatan);

  return (
    <div className="max-w-xl rounded-2xl border border-[#E5EAE7] bg-white p-6">
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

          // key yang harus ada di map supaya React bisa membedakan setiap baris
          <li key={jalur.id}>
            {jalur.nama}: {formatKg(jalur.kg)} ({formatPersen(jalur.persen)})
          </li>
        ))}
      </ul>
    </div>
  );
}