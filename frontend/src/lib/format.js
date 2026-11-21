// Fungsi-fungsi untuk mengubah data mentah
// Zona waktu dikunci ke WIB
const ZONA_WAKTU = 'Asia/Jakarta';
// Pemformat dibuat sekali saja, lalu dipakai ulang oleh fungsi di bawah (lebih hemat).
const pemformatAngka = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 1 });

const pemformatTanggal = new Intl.DateTimeFormat('id-ID', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  timeZone: ZONA_WAKTU,
});

const pemformatJam = new Intl.DateTimeFormat('id-ID', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: ZONA_WAKTU,
});

/**
 * Mengubah angka berat menjadi teks kg.
 */
export function formatKg(angka) {
  // null = belum ditimbang, jadi tampilkan tanda strip
  if (angka === null || angka === undefined) return '–';
  return `${pemformatAngka.format(angka)} kg`;
}

/**
 * Mengubah angka persen menjadi teks.
 */
export function formatPersen(angka) {
  if (angka === null || angka === undefined) return '–';
  return `${pemformatAngka.format(angka)}%`;
}

/**
 * Mengubah tanggal ISO menjadi tanggal saja.
 */
export function formatTanggal(iso) {
  if (!iso) return '–';
  return pemformatTanggal.format(new Date(iso));
}

/**
 * Mengubah tanggal ISO menjadi tanggal + jam WIB.
 */
export function formatTanggalJam(iso) {
  if (!iso) return '–';
  const tanggal = new Date(iso);
  return `${pemformatTanggal.format(tanggal)}, ${pemformatJam.format(tanggal)} WIB`;
}