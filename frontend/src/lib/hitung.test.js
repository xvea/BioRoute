import { describe, it, expect } from 'vitest';
import { STATUS_BATCH, STATUS_VERIFIKASI } from '@/lib/constants';
import {
  cariById,
  totalBeratDilaporkan,
  totalBeratDiterima,
  totalBeratDitolak,
  hitungBatchAktif,
  beratDiterimaPerJalur,
  hitungBatchPerStatus,
  beratPerMinggu,
  batchTerbaru,
  mitraMenunggu,
  pengolahUntukJalur
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

// Data uji untuk fungsi yang memakai tanggal (Langkah 3d-1).
const batchMingguan = [
  { kode: 'M1', status: STATUS_BATCH.SELESAI, jalurId: 'JLR-01', beratKg: 10, diajukanPada: '2026-11-02T08:00:00+07:00' },
  { kode: 'M2', status: STATUS_BATCH.DIAJUKAN, jalurId: 'JLR-02', beratKg: 4, diajukanPada: '2026-11-07T23:00:00+07:00' },
  { kode: 'M3', status: STATUS_BATCH.DIPROSES, jalurId: 'JLR-01', beratKg: 6, diajukanPada: '2026-11-08T03:00:00+07:00' },   // tanggal 8 jam 03.00 WIB = masih tanggal 7 di zona UTC
  { kode: 'M4', status: STATUS_BATCH.DITOLAK, jalurId: 'JLR-02', beratKg: 5, diajukanPada: '2026-11-30T10:00:00+07:00' },   // ditolak dan ada di minggu ke-5: tidak boleh dihitung
  { kode: 'M5', status: STATUS_BATCH.TERSEDIA, jalurId: 'JLR-02', beratKg: 3, diajukanPada: '2026-11-22T09:00:00+07:00' },
];

const mitraUji = [
  { id: 'X1', statusVerifikasi: STATUS_VERIFIKASI.MENUNGGU },
  { id: 'X2', statusVerifikasi: STATUS_VERIFIKASI.TERVERIFIKASI },
  { id: 'X3', statusVerifikasi: STATUS_VERIFIKASI.DITOLAK },
  { id: 'X4', statusVerifikasi: STATUS_VERIFIKASI.MENUNGGU },
];

describe('hitungBatchPerStatus', () => {
  it('menghitung batch dengan status yang diminta', () => {
    expect(hitungBatchPerStatus(batchUji, STATUS_BATCH.DITOLAK)).toBe(1);
  });

  it('menghasilkan 0 kalau tidak ada batch dengan status itu', () => {
    expect(hitungBatchPerStatus(batchUji, STATUS_BATCH.TERSEDIA)).toBe(0);
  });
});

describe('beratPerMinggu', () => {
  it('mengelompokkan berat per minggu dan per jalur, minggu kosong tetap muncul', () => {
    expect(beratPerMinggu(batchMingguan, jalurUji)).toEqual([
      { minggu: 'Minggu 1', 'JLR-01': 10, 'JLR-02': 4 },
      { minggu: 'Minggu 2', 'JLR-01': 6, 'JLR-02': 0 },
      { minggu: 'Minggu 3', 'JLR-01': 0, 'JLR-02': 0 },
      { minggu: 'Minggu 4', 'JLR-01': 0, 'JLR-02': 3 },
    ]);
  });

  it('batch Ditolak tidak menambah minggu', () => {
    expect(beratPerMinggu(batchMingguan, jalurUji)).toHaveLength(4);
  });

  it('memakai tanggal WIB (tgl 8 jam 03.00 WIB masuk Minggu 2)', () => {
    const hasil = beratPerMinggu(batchMingguan, jalurUji);
    expect(hasil[1]['JLR-01']).toBe(6);
  });

  it('mengembalikan array kosong kalau tidak ada batch', () => {
    expect(beratPerMinggu([], jalurUji)).toEqual([]);
  });
});

describe('batchTerbaru', () => {
  it('mengurutkan dari yang paling baru dan mengambil sejumlah yang diminta', () => {
    const kode = batchTerbaru(batchMingguan, 2).map((batch) => batch.kode);
    expect(kode).toEqual(['M4', 'M5']);
  });

  it('tidak mengubah urutan array asli', () => {
    batchTerbaru(batchMingguan, 2);
    expect(batchMingguan.map((batch) => batch.kode)).toEqual(['M1', 'M2', 'M3', 'M4', 'M5']);
  });

  it('mengembalikan semua batch kalau jumlah lebih besar dari data', () => {
    expect(batchTerbaru(batchMingguan, 10)).toHaveLength(5);
  });
});

describe('mitraMenunggu', () => {
  it('hanya mengambil mitra berstatus Menunggu', () => {
    const id = mitraMenunggu(mitraUji).map((mitra) => mitra.id);
    expect(id).toEqual(['X1', 'X4']);
  });
});

describe('pengolahUntukJalur', () => {
  // Setiap mitra gagal di satu syarat yang berbeda, kecuali P1.
  const mitraJalur = [
    { id: 'P1', peran: 'pengolah', statusVerifikasi: STATUS_VERIFIKASI.TERVERIFIKASI, jalurId: 'JLR-01' },
    { id: 'P2', peran: 'pengolah', statusVerifikasi: STATUS_VERIFIKASI.TERVERIFIKASI, jalurId: 'JLR-02' },
    { id: 'P3', peran: 'pengolah', statusVerifikasi: STATUS_VERIFIKASI.MENUNGGU, jalurId: 'JLR-01' },
    { id: 'S1', peran: 'sumber', statusVerifikasi: STATUS_VERIFIKASI.TERVERIFIKASI, jalurId: 'JLR-01' },
  ];

  it('hanya pengolah terverifikasi dengan jalur yang sama', () => {
    const id = pengolahUntukJalur(mitraJalur, 'JLR-01').map((mitra) => mitra.id);
    expect(id).toEqual(['P1']);
  });

  it('mengembalikan array kosong kalau tidak ada pengolah untuk jalur itu', () => {
    expect(pengolahUntukJalur(mitraJalur, 'JLR-09')).toEqual([]);
  });
});