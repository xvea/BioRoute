import { describe, it, expect } from 'vitest';
import { STATUS_BATCH } from '@/lib/constants';
import {
  cariById,
  totalBeratDilaporkan,
  totalBeratDiterima,
  totalBeratDitolak,
  hitungBatchAktif,
  beratDiterimaPerJalur,
} from '@/lib/hitung';

// Unit test untuk src/lib/hitung.js
// Data uji dibuat kecil dan sengaja di sini, supaya:
// 1) hasil yang benar mudah dihitung dengan kepala, dan
// 2) test tidak rusak kalau data contoh di src/lib/data diubah.

const batchUji = [
  { kode: 'A', status: STATUS_BATCH.SELESAI, jalurId: 'JLR-01', beratKg: 10, beratDiterimaKg: 9 },
  { kode: 'B', status: STATUS_BATCH.DIPROSES, jalurId: 'JLR-02', beratKg: 5, beratDiterimaKg: 3 },
  { kode: 'C', status: STATUS_BATCH.DIAJUKAN, jalurId: 'JLR-01', beratKg: 4, beratDiterimaKg: null },
  { kode: 'D', status: STATUS_BATCH.DITOLAK, jalurId: 'JLR-02', beratKg: 6, beratDiterimaKg: null },
  { kode: 'E', status: STATUS_BATCH.DIJADWALKAN, jalurId: 'JLR-01', beratKg: 3, beratDiterimaKg: null },
];

const jalurUji = [
  { id: 'JLR-01', nama: 'Kompos' },
  { id: 'JLR-02', nama: 'BSF / Maggot' },
];

describe('cariById', () => {
  it('mengembalikan item yang id-nya cocok', () => {
    expect(cariById(jalurUji, 'JLR-02')).toEqual({ id: 'JLR-02', nama: 'BSF / Maggot' });
  });

  it('mengembalikan null kalau id tidak ada', () => {
    expect(cariById(jalurUji, 'JLR-99')).toBeNull();
  });
});

describe('totalBeratDilaporkan', () => {
  it('menjumlah berat semua batch kecuali yang ditolak', () => {
    expect(totalBeratDilaporkan(batchUji)).toBe(22);
  });

  it('menghasilkan 0 untuk daftar kosong', () => {
    expect(totalBeratDilaporkan([])).toBe(0);
  });
});

describe('totalBeratDiterima', () => {
  it('hanya menjumlah batch yang sudah ditimbang', () => {
    expect(totalBeratDiterima(batchUji)).toBe(12);
  });
});

describe('totalBeratDitolak', () => {
  it('hanya menjumlah batch yang ditolak', () => {
    expect(totalBeratDitolak(batchUji)).toBe(6);
  });
});

describe('hitungBatchAktif', () => {
  it('tidak menghitung batch Selesai dan Ditolak', () => {
    expect(hitungBatchAktif(batchUji)).toBe(3);
  });
});

describe('beratDiterimaPerJalur', () => {
  it('menghitung kg dan persen untuk setiap jalur', () => {
    const hasil = beratDiterimaPerJalur(batchUji, jalurUji);
    expect(hasil).toHaveLength(2);
    expect(hasil[0]).toEqual({ id: 'JLR-01', nama: 'Kompos', kg: 9, persen: 75 });
    expect(hasil[1]).toEqual({ id: 'JLR-02', nama: 'BSF / Maggot', kg: 3, persen: 25 });
  });

  it('memberi persen 0 (bukan NaN) kalau belum ada yang diterima', () => {
    const hasil = beratDiterimaPerJalur([], jalurUji);
    expect(hasil[0].persen).toBe(0);
    expect(hasil[1].persen).toBe(0);
  });
});