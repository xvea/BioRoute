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
      const cocok = batch.kode.toLowerCase().includes(kataKunci) || namaSumber.toLowerCase().includes(kataKunci);
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

/**
 * Menyaring mitra berdasarkan status verifikasi dan kata kunci (nama, penanggung jawab, atau kecamatan), lalu mengurutkannya.
 * Nilai status '' berarti semua status. Urutan: 'terbaru' / 'terlama' tanggal pengajuan atau 'nama' (A–Z).
 */
export function saringMitra(daftarMitra, filter) {
  const kataKunci = filter.kataKunci.trim().toLowerCase();

  const hasil = daftarMitra.filter((mitra) => {
    if (filter.status && mitra.statusVerifikasi !== filter.status) return false;
    if (!kataKunci) return true;
    return [mitra.nama, mitra.penanggungJawab, mitra.kecamatan].some((teks) => teks.toLowerCase().includes(kataKunci));
  });

  // filter() sudah membuat array baru, jadi sort() di sini tidak mengubah daftarMitra asli
  return hasil.sort((a, b) => {
    if (filter.urutan === 'nama') return a.nama.localeCompare(b.nama, 'id');
    const selisih = new Date(b.diajukanPada) - new Date(a.diajukanPada);
    return filter.urutan === 'terlama' ? -selisih : selisih;
  });
}

/**
 * Nomor halaman tempat item pertama yang cocok berada. Kalau tidak ada yang cocok, kembali ke halaman 1.
 */
export function halamanUntuk(daftar, cocok, perHalaman) {
  const indeks = daftar.findIndex(cocok);
  if (indeks === -1) return 1;
  return Math.floor(indeks / perHalaman) + 1;
}
