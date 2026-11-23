// Fungsi-fungsi validasi isian form.

// Panjang minimal alasan revisi/penolakan, supaya mitra sumber paham apa yang harus diperbaiki.
export const MIN_PANJANG_ALASAN = 10;

/**
 * Memeriksa alasan revisi atau penolakan. Mengembalikan pesan error (teks), atau null kalau alasan sudah benar.
 */
export function cekAlasan(teks) {
  const bersih = teks.trim();
  if (bersih === '') return 'Alasan wajib diisi.';
  if (bersih.length < MIN_PANJANG_ALASAN) {
    return `Alasan minimal ${MIN_PANJANG_ALASAN} karakter.`;
  }
  return null;
}