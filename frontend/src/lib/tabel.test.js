import { describe, it, expect } from 'vitest';
import { STATUS_BATCH, STATUS_VERIFIKASI } from '@/lib/constants';
import { saringBatch, ambilHalaman, saringMitra, halamanUntuk } from '@/lib/tabel';

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
    const hasil = saringBatch(batchUji, mitraUji, { ...tanpaFilter, kategoriId: 'KAT-01', jalurId: 'JLR-02' });
    expect(kode(hasil)).toEqual(['BR-03']);
  });

  it('mengembalikan array kosong kalau tidak ada yang cocok', () => {
    expect(saringBatch(batchUji, mitraUji, { ...tanpaFilter, kataKunci: 'xyz' })).toEqual([]);
  });
});

// 12 data, 5 per halaman → 3 halaman (5, 5, 2)
describe('ambilHalaman', () => {
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

describe('saringMitra', () => {
  const mitraVerifikasi = [
    {
      id: 'M1',
      nama: 'Warung Bu Slamet',
      penanggungJawab: 'Slamet Riyadi',
      kecamatan: 'Purwokerto Timur',
      statusVerifikasi: STATUS_VERIFIKASI.MENUNGGU,
      diajukanPada: '2026-11-14T10:00:00+07:00',
    },
    {
      id: 'M2',
      nama: 'Dapur Organik',
      penanggungJawab: 'Hendra Setiawan',
      kecamatan: 'Purwokerto Barat',
      statusVerifikasi: STATUS_VERIFIKASI.MENUNGGU,
      diajukanPada: '2026-11-16T09:00:00+07:00',
    },
    {
      id: 'M3',
      nama: 'Bank Sampah Mandiri',
      penanggungJawab: 'Dewi Lestari',
      kecamatan: 'Karanglewas',
      statusVerifikasi: STATUS_VERIFIKASI.TERVERIFIKASI,
      diajukanPada: '2026-11-15T08:00:00+07:00',
    },
    {
      id: 'M4',
      nama: 'Agro Maggot',
      penanggungJawab: 'Budi Hartono',
      kecamatan: 'Sokaraja',
      statusVerifikasi: STATUS_VERIFIKASI.MENUNGGU,
      diajukanPada: '2026-11-15T12:00:00+07:00',
    },
  ];
  const filterMenunggu = { status: STATUS_VERIFIKASI.MENUNGGU, kataKunci: '', urutan: 'terbaru' };

  /**
   * Mengambil id mitra saja, supaya hasil test mudah dibaca.
   */
  function id(daftar) {
    return daftar.map((mitra) => mitra.id);
  }

  it('menyaring status Menunggu dan mengurutkan dari pengajuan terbaru', () => {
    expect(id(saringMitra(mitraVerifikasi, filterMenunggu))).toEqual(['M2', 'M4', 'M1']);
  });

  it('mengurutkan dari pengajuan terlama', () => {
    expect(id(saringMitra(mitraVerifikasi, { ...filterMenunggu, urutan: 'terlama' }))).toEqual(['M1', 'M4', 'M2']);
  });

  it('mengurutkan berdasarkan nama A–Z', () => {
    expect(id(saringMitra(mitraVerifikasi, { ...filterMenunggu, urutan: 'nama' }))).toEqual(['M4', 'M2', 'M1']);
  });

  it('status kosong berarti semua status', () => {
    expect(id(saringMitra(mitraVerifikasi, { status: '', kataKunci: '', urutan: 'nama' }))).toEqual([
      'M4',
      'M3',
      'M2',
      'M1',
    ]);
  });

  it('mencari nama, penanggung jawab, atau kecamatan tanpa peduli huruf besar/kecil dan spasi di tepi', () => {
    const cari = (kataKunci) => id(saringMitra(mitraVerifikasi, { status: '', kataKunci, urutan: 'terbaru' }));
    expect(cari('  AGRO ')).toEqual(['M4']); // nama
    expect(cari('dewi')).toEqual(['M3']); // penanggung jawab
    expect(cari('sokaraja')).toEqual(['M4']); // kecamatan
  });

  it('mengembalikan array kosong kalau tidak ada yang cocok', () => {
    expect(saringMitra(mitraVerifikasi, { ...filterMenunggu, kataKunci: 'xyz' })).toEqual([]);
  });
});

describe('halamanUntuk', () => {
  // 12 data, 5 per halaman → halaman 1: 1–5, halaman 2: 6–10, halaman 3: 11–12
  const angka = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  it('item di tengah halaman pertama ada di halaman 1', () => {
    expect(halamanUntuk(angka, (n) => n === 3, 5)).toBe(1);
  });

  it('batas halaman: item ke-5 di halaman 1, item ke-6 di halaman 2', () => {
    expect(halamanUntuk(angka, (n) => n === 5, 5)).toBe(1);
    expect(halamanUntuk(angka, (n) => n === 6, 5)).toBe(2);
  });

  it('item terakhir ada di halaman terakhir', () => {
    expect(halamanUntuk(angka, (n) => n === 12, 5)).toBe(3);
  });

  it('kalau beberapa item cocok, yang dipakai item pertama', () => {
    // 8, 9, 10, 11, 12 cocok → item pertama (8) ada di halaman 2, bukan halaman 3
    expect(halamanUntuk(angka, (n) => n > 7, 5)).toBe(2);
  });

  it('tidak ada yang cocok atau daftar kosong → halaman 1', () => {
    expect(halamanUntuk(angka, (n) => n === 99, 5)).toBe(1);
    expect(halamanUntuk([], (n) => n === 1, 5)).toBe(1);
  });

  it('mencari batch berdasarkan kode dengan jumlah per halaman lain', () => {
    // 2 per halaman → BR-01, BR-02 | BR-03, BR-04
    expect(halamanUntuk(batchUji, (batch) => batch.kode === 'BR-03', 2)).toBe(2);
  });
});
