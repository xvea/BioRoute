import { cariById } from '@/lib/hitung';
// Fungsi-fungsi untuk tabel menyaring data dan membaginya per halaman.

/**
 * Menyaring batch berdasarkan kata kunci (kode atau nama sumber), status, kategori, dan jalur. Nilai filter '' (teks kosong) berarti "semua".
 */
export function saringBatch(daftarBatch, daftarMitra, filter) {
  const kataKunci = filter.kataKunci.trim().toLowerCase();

  return daftarBatch.filter((batch) => {
    if (kataKunci) {
      const namaSumber = cariById(daftarMitra, batch.sumberId)?.nama ?? '';
      const cocok =
        batch.kode.toLowerCase().includes(kataKunci) ||
        namaSumber.toLowerCase().includes(kataKunci);
      if (!cocok) return false;
    }
    if (filter.status && batch.status !== filter.status) return false;
    if (filter.kategoriId && batch.kategoriId !== filter.kategoriId) return false;
    if (filter.jalurId && batch.jalurId !== filter.jalurId) return false;
    return true;
  });
}

/**
 * Mengambil isi satu halaman tabel beserta keterangannya.Nomor halaman di luar jangkauan dikoreksi otomatis (misalnya halaman 9 padahal hanya ada 3).
 */
export function ambilHalaman(daftar, halaman, perHalaman) {
  const total = daftar.length;
  // minimal 1 halaman, supaya tabel kosong tetap punya "halaman 1"
  const totalHalaman = Math.max(1, Math.ceil(total / perHalaman));
  const halamanAman = Math.min(Math.max(halaman, 1), totalHalaman);
  const awal = (halamanAman - 1) * perHalaman;

  return {
    isi: daftar.slice(awal, awal + perHalaman),
    halaman: halamanAman,
    totalHalaman,
    dari: total === 0 ? 0 : awal + 1,
    sampai: Math.min(awal + perHalaman, total),
    total,
  };
}