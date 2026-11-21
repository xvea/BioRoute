import { STATUS_BATCH } from '@/lib/constants';
// Fungsi-fungsi untuk mencari dan menghitung data (total berat, jumlah batch, dll.).

// Batch dengan status ini dianggap sudah tidak berjalan lagi.
const STATUS_TIDAK_AKTIF = [STATUS_BATCH.SELESAI, STATUS_BATCH.DITOLAK];

/**
 * Mencari satu item berdasarkan id. Mengembalikan null kalau tidak ketemu.
 */
export function cariById(daftar, id) {
  return daftar.find((item) => item.id === id) ?? null;
}

/**
 * Total berat yang dilaporkan mitra sumber (batch yang ditolak tidak dihitung).
 */
export function totalBeratDilaporkan(daftarBatch) {
  return daftarBatch
    .filter((batch) => batch.status !== STATUS_BATCH.DITOLAK)
    .reduce((total, batch) => total + batch.beratKg, 0);
}

/**
 * Total berat hasil timbang pengolah (hanya batch yang sudah ditimbang).
 */
export function totalBeratDiterima(daftarBatch) {
  return daftarBatch
    .filter((batch) => batch.beratDiterimaKg !== null)
    .reduce((total, batch) => total + batch.beratDiterimaKg, 0);
}

/**
 * Total berat batch yang ditolak.
 */
export function totalBeratDitolak(daftarBatch) {
  return daftarBatch
    .filter((batch) => batch.status === STATUS_BATCH.DITOLAK)
    .reduce((total, batch) => total + batch.beratKg, 0);
}

/**
 * Jumlah batch yang masih berjalan (belum Selesai dan tidak Ditolak).
 */
export function hitungBatchAktif(daftarBatch) {
  return daftarBatch.filter((batch) => !STATUS_TIDAK_AKTIF.includes(batch.status)).length;
}

/**
 * Berat diterima per jalur pemanfaatan beserta persentasenya.
 */
export function beratDiterimaPerJalur(daftarBatch, daftarJalur) {
  const totalSemua = totalBeratDiterima(daftarBatch);

  return daftarJalur.map((jalur) => {
    const batchJalurIni = daftarBatch.filter((batch) => batch.jalurId === jalur.id);
    const kg = totalBeratDiterima(batchJalurIni);
    // kalau belum ada yang diterima, hindari pembagian dengan nol
    const persen = totalSemua === 0 ? 0 : (kg / totalSemua) * 100;
    return { id: jalur.id, nama: jalur.nama, kg, persen };
  });
}