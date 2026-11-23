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

// Batas parameter verifikasi di halaman Pengaturan.
export const BATAS_TOLERANSI_KG = 10;
export const BATAS_WAKTU_TINJAU_JAM = 72;

/**
 * Mengubah isian angka menjadi number. Koma desimal ala Indonesia ("2,5") diterima. Isian kosong menjadi NaN (bukan 0).
 */
export function ubahKeAngka(nilai) {
  const bersih = String(nilai ?? '').trim().replace(',', '.');
  if (bersih === '') return NaN;
  return Number(bersih);
}

/**
 * Memecah isian kriteria yang dipisah koma menjadi array, tanpa spasi di tepi dan tanpa isian kosong.
 */
export function pisahKriteria(teks) {
  return teks
    .split(',')
    .map((kriteria) => kriteria.trim())
    .filter((kriteria) => kriteria !== '');
}

/**
 * Memeriksa form kategori material. Mengembalikan objek pesan error per kolom, atau {} kalau semua benar.
 * idDiubah diisi saat mengubah kategori, supaya nama kategori itu sendiri tidak dianggap duplikat.
 */
export function cekKategori(form, daftarKategori, idDiubah = null) {
  const error = {};
  const nama = form.nama.trim();

  if (nama === '') {
    error.nama = 'Nama kategori wajib diisi.';
  } else if (nama.length < 3) {
    error.nama = 'Nama kategori minimal 3 karakter.';
  } else {
    const sudahDipakai = daftarKategori.some(
      (kategori) => kategori.id !== idDiubah && kategori.nama.trim().toLowerCase() === nama.toLowerCase()
    );
    if (sudahDipakai) error.nama = 'Nama kategori sudah dipakai.';
  }

  if (form.contoh.trim() === '') error.contoh = 'Contoh residu wajib diisi.';
  return error;
}

/**
 * Memeriksa form parameter verifikasi (boleh berisi teks dari input atau number). Mengembalikan objek pesan error per kolom, atau {} kalau semua benar.
 */
export function cekParameter(form) {
  const error = {};

  const toleransi = ubahKeAngka(form.toleransiSelisihKg);
  if (String(form.toleransiSelisihKg ?? '').trim() === '') {
    error.toleransiSelisihKg = 'Toleransi wajib diisi.';
  } else if (Number.isNaN(toleransi)) {
    error.toleransiSelisihKg = 'Toleransi harus berupa angka.';
  } else if (toleransi <= 0 || toleransi > BATAS_TOLERANSI_KG) {
    error.toleransiSelisihKg = `Toleransi harus lebih dari 0 dan paling besar ${BATAS_TOLERANSI_KG} kg.`;
  }

  const jam = ubahKeAngka(form.maksWaktuTinjauJam);
  if (String(form.maksWaktuTinjauJam ?? '').trim() === '') {
    error.maksWaktuTinjauJam = 'Waktu tinjau wajib diisi.';
  } else if (!Number.isInteger(jam)) {
    error.maksWaktuTinjauJam = 'Waktu tinjau harus bilangan bulat.';
  } else if (jam < 1 || jam > BATAS_WAKTU_TINJAU_JAM) {
    error.maksWaktuTinjauJam = `Waktu tinjau harus antara 1 dan ${BATAS_WAKTU_TINJAU_JAM} jam.`;
  }

  return error;
}