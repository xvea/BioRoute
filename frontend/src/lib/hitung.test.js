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
  pengolahUntukJalur,
  hitungMitraPerStatus,
  persenDiterima,
  ringkasanPerKategori,
  rekapPerMitra,
  selisihBerat,
} from '@/lib/hitung';

// Unit test untuk src/lib/hitung.js
// Data uji dibuat kecil dan sengaja di sini, supaya:
// - hasil yang benar mudah dihitung dengan kepala, dan
// - test tidak rusak kalau data contoh di src/lib/data diubah.

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
  {
    kode: 'M1',
    status: STATUS_BATCH.SELESAI,
    jalurId: 'JLR-01',
    beratKg: 10,
    diajukanPada: '2026-11-02T08:00:00+07:00',
  },
  {
    kode: 'M2',
    status: STATUS_BATCH.DIAJUKAN,
    jalurId: 'JLR-02',
    beratKg: 4,
    diajukanPada: '2026-11-07T23:00:00+07:00',
  },
  {
    kode: 'M3',
    status: STATUS_BATCH.DIPROSES,
    jalurId: 'JLR-01',
    beratKg: 6,
    diajukanPada: '2026-11-08T03:00:00+07:00',
  }, // tanggal 8 jam 03.00 WIB = masih tanggal 7 di zona UTC
  {
    kode: 'M4',
    status: STATUS_BATCH.DITOLAK,
    jalurId: 'JLR-02',
    beratKg: 5,
    diajukanPada: '2026-11-30T10:00:00+07:00',
  }, // ditolak dan ada di minggu ke-5: tidak boleh dihitung
  {
    kode: 'M5',
    status: STATUS_BATCH.TERSEDIA,
    jalurId: 'JLR-02',
    beratKg: 3,
    diajukanPada: '2026-11-22T09:00:00+07:00',
  },
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

describe('hitungMitraPerStatus', () => {
  it('menghitung mitra untuk setiap status verifikasi', () => {
    expect(hitungMitraPerStatus(mitraUji)).toEqual({ Menunggu: 2, Terverifikasi: 1, Ditolak: 1 });
  });

  it('status tanpa mitra tetap muncul dengan nilai 0', () => {
    expect(hitungMitraPerStatus([])).toEqual({ Menunggu: 0, Terverifikasi: 0, Ditolak: 0 });
  });
});

describe('persenDiterima', () => {
  it('membandingkan berat diterima dengan berat dilaporkan, hanya untuk batch yang sudah ditimbang', () => {
    // batchUji: A (10 → 9) dan B (5 → 3) sudah ditimbang → 12 / 15 = 80%
    expect(persenDiterima(batchUji)).toBe(80);
  });

  it('mengembalikan null kalau belum ada batch yang ditimbang', () => {
    expect(persenDiterima([{ beratKg: 4, beratDiterimaKg: null }])).toBeNull();
  });
});

// Data uji Laporan: 2 sumber terverifikasi, 1 pengolah terverifikasi, 1 sumber yang masih Menunggu.
const mitraLaporan = [
  {
    id: 'S1',
    nama: 'Sumber Satu',
    peran: 'sumber',
    kecamatan: 'Purwokerto Utara',
    statusVerifikasi: STATUS_VERIFIKASI.TERVERIFIKASI,
  },
  {
    id: 'S2',
    nama: 'Sumber Dua',
    peran: 'sumber',
    kecamatan: 'Purwokerto Timur',
    statusVerifikasi: STATUS_VERIFIKASI.TERVERIFIKASI,
  },
  {
    id: 'P1',
    nama: 'Pengolah Satu',
    peran: 'pengolah',
    kecamatan: 'Karanglewas',
    statusVerifikasi: STATUS_VERIFIKASI.TERVERIFIKASI,
  },
  {
    id: 'S3',
    nama: 'Sumber Baru',
    peran: 'sumber',
    kecamatan: 'Sokaraja',
    statusVerifikasi: STATUS_VERIFIKASI.MENUNGGU,
  },
];

const batchLaporan = [
  {
    kode: 'L1',
    sumberId: 'S1',
    pengolahId: 'P1',
    kategoriId: 'K1',
    status: STATUS_BATCH.SELESAI,
    beratKg: 10,
    beratDiterimaKg: 9,
  },
  {
    kode: 'L2',
    sumberId: 'S1',
    pengolahId: 'P1',
    kategoriId: 'K2',
    status: STATUS_BATCH.DIPROSES,
    beratKg: 4,
    beratDiterimaKg: 4,
  },
  {
    kode: 'L3',
    sumberId: 'S2',
    pengolahId: null,
    kategoriId: 'K1',
    status: STATUS_BATCH.DIAJUKAN,
    beratKg: 6,
    beratDiterimaKg: null,
  },
  {
    kode: 'L4',
    sumberId: 'S2',
    pengolahId: 'P1',
    kategoriId: 'K2',
    status: STATUS_BATCH.DITOLAK,
    beratKg: 5,
    beratDiterimaKg: null,
  },
];

const kategoriLaporan = [
  { id: 'K1', nama: 'Sisa sayur & buah' },
  { id: 'K2', nama: 'Sisa produksi' },
  { id: 'K3', nama: 'Makanan olahan' },
];

describe('ringkasanPerKategori', () => {
  it('menghitung kg, jumlah batch, dan persen per kategori tanpa batch Ditolak', () => {
    // Total dihitung = 10 + 4 + 6 = 20 kg (L4 ditolak tidak ikut)
    expect(ringkasanPerKategori(batchLaporan, kategoriLaporan)).toEqual([
      { id: 'K1', nama: 'Sisa sayur & buah', kg: 16, persen: 80, jumlahBatch: 2 },
      { id: 'K2', nama: 'Sisa produksi', kg: 4, persen: 20, jumlahBatch: 1 },
      { id: 'K3', nama: 'Makanan olahan', kg: 0, persen: 0, jumlahBatch: 0 },
    ]);
  });

  it('memberi persen 0 (bukan NaN) kalau belum ada batch', () => {
    expect(ringkasanPerKategori([], kategoriLaporan)[0].persen).toBe(0);
  });
});

describe('rekapPerMitra', () => {
  const rekap = rekapPerMitra(batchLaporan, mitraLaporan);

  it('hanya merekap mitra Terverifikasi', () => {
    expect(rekap.map((baris) => baris.id)).toEqual(['S1', 'S2', 'P1']);
  });

  it('mitra sumber dihitung dari batch miliknya (sumberId)', () => {
    expect(rekap[0]).toMatchObject({ jumlahBatch: 2, dilaporkanKg: 14, diterimaKg: 13, ditolakKg: 0 });
    expect(rekap[0].persenDiterima).toBeCloseTo(92.86, 2); // 13 / 14
  });

  it('batch Ditolak masuk kolom ditolak, dan persen null kalau belum ada yang ditimbang', () => {
    expect(rekap[1]).toMatchObject({
      jumlahBatch: 2,
      dilaporkanKg: 6,
      diterimaKg: 0,
      ditolakKg: 5,
      persenDiterima: null,
    });
  });

  it('mitra pengolah dihitung dari batch yang ditanganinya (pengolahId)', () => {
    expect(rekap[2]).toMatchObject({ jumlahBatch: 3, dilaporkanKg: 14, diterimaKg: 13, ditolakKg: 5 });
  });
});

describe('selisihBerat', () => {
  const batchTimbang = [
    { kode: 'T1', sumberId: 'S1', beratKg: 10, beratDiterimaKg: 10 }, // selisih 0
    { kode: 'T2', sumberId: 'S1', beratKg: 12, beratDiterimaKg: 11 }, // selisih 1
    { kode: 'T3', sumberId: 'S2', beratKg: 5, beratDiterimaKg: null }, // belum ditimbang
    { kode: 'T4', sumberId: 'S2', beratKg: 8, beratDiterimaKg: 9.5 }, // selisih -1,5 (diterima lebih berat)
  ];

  it('hanya batch yang sudah ditimbang, diurutkan dari selisih terbesar (positif atau negatif)', () => {
    const hasil = selisihBerat(batchTimbang, 1);
    expect(hasil.map((baris) => baris.kode)).toEqual(['T4', 'T2', 'T1']);
    expect(hasil.map((baris) => baris.selisihKg)).toEqual([-1.5, 1, 0]);
  });

  it('menandai selisih yang melebihi toleransi (sama persis dengan toleransi masih wajar)', () => {
    expect(selisihBerat(batchTimbang, 1).map((baris) => baris.melebihiToleransi)).toEqual([true, false, false]);
    expect(selisihBerat(batchTimbang, 0.5).map((baris) => baris.melebihiToleransi)).toEqual([true, true, false]);
  });
});
