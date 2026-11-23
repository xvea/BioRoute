import { describe, it, expect } from 'vitest';
import { STATUS_BATCH } from '@/lib/constants';
import { saringBatch, ambilHalaman } from '@/lib/tabel';

const mitraUji = [
  { id: 'S1', nama: 'Warung Bu Slamet' },
  { id: 'S2', nama: 'Katering Berkah' },
];

const batchUji = [
  { kode: 'BR-01', sumberId: 'S1', status: STATUS_BATCH.DIAJUKAN, kategoriId: 'KAT-01', jalurId: 'JLR-01' },
  { kode: 'BR-02', sumberId: 'S2', status: STATUS_BATCH.DIAJUKAN, kategoriId: 'KAT-02', jalurId: 'JLR-02' },
  { kode: 'BR-03', sumberId: 'S1', status: STATUS_BATCH.SELESAI, kategoriId: 'KAT-01', jalurId: 'JLR-02' },
  { kode: 'BR-04', sumberId: 'S2', status: STATUS_BATCH.DITOLAK, kategoriId: 'KAT-01', jalurId: 'JLR-01' },
];

// Filter awal: semua kosong = tampilkan semua
const tanpaFilter = { kataKunci: '', status: '', kategoriId: '', jalurId: '' };

/**
 * Mengambil kode batch saja, supaya hasil test mudah dibaca.
 */
function kode(daftar) {
  return daftar.map((batch) => batch.kode);
}

describe('saringBatch', () => {
  it('tanpa filter mengembalikan semua batch', () => {
    expect(kode(saringBatch(batchUji, mitraUji, tanpaFilter))).toEqual(['BR-01', 'BR-02', 'BR-03', 'BR-04']);
  });

  it('mencari kode tanpa peduli huruf besar/kecil dan spasi di tepi', () => {
    const hasil = saringBatch(batchUji, mitraUji, { ...tanpaFilter, kataKunci: '  br-02 ' });
    expect(kode(hasil)).toEqual(['BR-02']);
  });

  it('mencari berdasarkan nama sumber', () => {
    const hasil = saringBatch(batchUji, mitraUji, { ...tanpaFilter, kataKunci: 'WARUNG' });
    expect(kode(hasil)).toEqual(['BR-01', 'BR-03']);
  });

  it('menyaring berdasarkan status', () => {
    const hasil = saringBatch(batchUji, mitraUji, { ...tanpaFilter, status: STATUS_BATCH.DIAJUKAN });
    expect(kode(hasil)).toEqual(['BR-01', 'BR-02']);
  });

  it('menggabungkan filter kategori dan jalur', () => {
    // KAT-01 saja → BR-01, BR-03, BR-04; JLR-02 saja → BR-02, BR-03; keduanya → hanya BR-03
    const hasil = saringBatch(batchUji, mitraUji, { ...tanpaFilter, kategoriId: 'KAT-01', jalurId: 'JLR-02' });
    expect(kode(hasil)).toEqual(['BR-03']);
  });

  it('mengembalikan array kosong kalau tidak ada yang cocok', () => {
    expect(saringBatch(batchUji, mitraUji, { ...tanpaFilter, kataKunci: 'xyz' })).toEqual([]);
  });
});

describe('ambilHalaman', () => {
  // 12 data, 5 per halaman → 3 halaman (5, 5, 2)
  const angka = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  it('mengambil halaman pertama beserta keterangannya', () => {
    expect(ambilHalaman(angka, 1, 5)).toEqual({
      isi: [1, 2, 3, 4, 5],
      halaman: 1,
      totalHalaman: 3,
      dari: 1,
      sampai: 5,
      total: 12,
    });
  });

  it('halaman terakhir hanya berisi sisa data', () => {
    const hasil = ambilHalaman(angka, 3, 5);
    expect(hasil.isi).toEqual([11, 12]);
    expect(hasil.dari).toBe(11);
    expect(hasil.sampai).toBe(12);
  });

  it('halaman terlalu besar dikoreksi ke halaman terakhir', () => {
    expect(ambilHalaman(angka, 9, 5).halaman).toBe(3);
  });

  it('halaman 0 atau negatif dikoreksi ke halaman 1', () => {
    expect(ambilHalaman(angka, 0, 5).halaman).toBe(1);
  });

  it('daftar kosong tetap punya 1 halaman dan keterangan 0', () => {
    expect(ambilHalaman([], 1, 5)).toEqual({
      isi: [],
      halaman: 1,
      totalHalaman: 1,
      dari: 0,
      sampai: 0,
      total: 0,
    });
  });
});