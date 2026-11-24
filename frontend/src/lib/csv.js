import { cariById } from '@/lib/hitung';
import { formatTanggalJam } from '@/lib/format';

const pemformatTanggalFile = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' });

/**
 * Mengubah satu nilai menjadi satu sel CSV.
 * - null / undefined → sel kosong.
 * - Teks yang diawali = + - @ diberi tanda kutip satu di depan, supaya Excel tidak menjalankannya sebagai rumus.
 * - Teks berisi koma, tanda kutip, atau baris baru dibungkus tanda kutip; tanda kutip di dalamnya digandakan.
 */
export function selCsv(nilai) {
  if (nilai === null || nilai === undefined) return '';
  let teks = String(nilai);
  // hanya teks yang dicek; angka negatif seperti -0.5 tetap angka
  if (typeof nilai === 'string' && /^[=+\-@]/.test(teks)) teks = `'${teks}`;
  if (/[",\r\n]/.test(teks)) return `"${teks.replaceAll('"', '""')}"`;
  return teks;
}

/**
 * Menyusun teks CSV: baris judul kolom, lalu satu baris untuk setiap data. kolom = [{ judul: 'Kode', nilai: (data) => data.kode }, ...]. Antarbaris dipisah \r\n (standar CSV).
 */
export function buatCsv(kolom, daftarData) {
  const barisJudul = kolom.map((k) => selCsv(k.judul)).join(',');
  const barisData = daftarData.map((data) => kolom.map((k) => selCsv(k.nilai(data))).join(','));
  return [barisJudul, ...barisData].join('\r\n');
}

/**
 * CSV daftar batch. Id mitra, kategori, dan jalur diubah menjadi nama; berat ditulis sebagai angka (kg) supaya bisa dijumlahkan.
 */
export function csvBatch(daftarBatch, { daftarMitra, kategoriMaterial, jalurPemanfaatan }) {
  return buatCsv(
    [
      { judul: 'Kode', nilai: (batch) => batch.kode },
      { judul: 'Diajukan', nilai: (batch) => formatTanggalJam(batch.diajukanPada) },
      { judul: 'Mitra sumber', nilai: (batch) => cariById(daftarMitra, batch.sumberId)?.nama },
      { judul: 'Kategori', nilai: (batch) => cariById(kategoriMaterial, batch.kategoriId)?.nama },
      { judul: 'Nama material', nilai: (batch) => batch.namaMaterial },
      { judul: 'Jalur', nilai: (batch) => cariById(jalurPemanfaatan, batch.jalurId)?.nama },
      { judul: 'Metode', nilai: (batch) => batch.metode },
      { judul: 'Mitra pengolah', nilai: (batch) => cariById(daftarMitra, batch.pengolahId)?.nama },
      { judul: 'Berat dilaporkan (kg)', nilai: (batch) => batch.beratKg },
      { judul: 'Berat diterima (kg)', nilai: (batch) => batch.beratDiterimaKg },
      { judul: 'Status', nilai: (batch) => batch.status },
      { judul: 'Alasan', nilai: (batch) => batch.alasan },
    ],
    daftarBatch
  );
}

/**
 * CSV rekap kinerja mitra (hasil rekapPerMitra). Tingkat penerimaan dibulatkan 1 angka di belakang koma.
 */
export function csvRekapMitra(daftarRekap) {
  return buatCsv(
    [
      { judul: 'Mitra', nilai: (rekap) => rekap.nama },
      { judul: 'Peran', nilai: (rekap) => (rekap.peran === 'sumber' ? 'Mitra Sumber' : 'Mitra Pengolah') },
      { judul: 'Kecamatan', nilai: (rekap) => rekap.kecamatan },
      { judul: 'Total batch', nilai: (rekap) => rekap.jumlahBatch },
      { judul: 'Dilaporkan (kg)', nilai: (rekap) => rekap.dilaporkanKg },
      { judul: 'Diterima (kg)', nilai: (rekap) => rekap.diterimaKg },
      { judul: 'Ditolak (kg)', nilai: (rekap) => rekap.ditolakKg },
      {
        judul: 'Tingkat penerimaan (%)',
        nilai: (rekap) => (rekap.persenDiterima === null ? null : Math.round(rekap.persenDiterima * 10) / 10),
      },
    ],
    daftarRekap
  );
}

/**
 * Nama file unduhan, misalnya bioroute-batch-2026-11-24.csv (tanggal WIB).
 */
export function namaFileUnduhan(jenis, tanggal = new Date()) {
  return `bioroute-${jenis}-${pemformatTanggalFile.format(tanggal)}.csv`;
}
