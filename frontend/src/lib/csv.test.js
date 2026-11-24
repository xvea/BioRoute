import { describe, it, expect } from 'vitest';
import { STATUS_BATCH } from '@/lib/constants';
import { selCsv, buatCsv, csvBatch, csvRekapMitra, namaFileUnduhan } from '@/lib/csv';

describe('selCsv', () => {
  it('teks biasa dan angka tidak diubah', () => {
    expect(selCsv('Kompos')).toBe('Kompos');
    expect(selCsv(11.5)).toBe('11.5');
    expect(selCsv(0)).toBe('0');
  });

  it('null dan undefined menjadi sel kosong', () => {
    expect(selCsv(null)).toBe('');
    expect(selCsv(undefined)).toBe('');
  });

  it('teks berisi koma atau baris baru dibungkus tanda kutip', () => {
    expect(selCsv('Dapur, Sehat')).toBe('"Dapur, Sehat"');
    expect(selCsv('baris 1\nbaris 2')).toBe('"baris 1\nbaris 2"');
  });

  it('tanda kutip di dalam teks digandakan', () => {
    expect(selCsv('Katering "Bu Joko"')).toBe('"Katering ""Bu Joko"""');
  });

  it('teks yang diawali = + - @ diberi tanda kutip satu supaya tidak dijalankan sebagai rumus', () => {
    expect(selCsv('=SUM(A1:A9)')).toBe("'=SUM(A1:A9)");
    expect(selCsv('+62 812')).toBe("'+62 812");
    expect(selCsv('-rusak')).toBe("'-rusak");
    expect(selCsv('@admin')).toBe("'@admin");
    // rumus yang juga berisi koma dan tanda kutip: diberi kutip satu dulu, lalu dibungkus
    expect(selCsv('=HYPERLINK("x","y")')).toBe('"\'=HYPERLINK(""x"",""y"")"');
  });

  it('angka negatif tetap angka, bukan dianggap rumus', () => {
    expect(selCsv(-0.5)).toBe('-0.5');
  });
});

describe('buatCsv', () => {
  const kolom = [
    { judul: 'Kode', nilai: (data) => data.kode },
    { judul: 'Berat, kg', nilai: (data) => data.berat },
  ];

  it('baris judul lalu satu baris per data, dipisah \\r\\n', () => {
    const hasil = buatCsv(kolom, [
      { kode: 'BR-01', berat: 12 },
      { kode: 'BR-02', berat: 8.5 },
    ]);
    // judul "Berat, kg" berisi koma, jadi ikut dibungkus tanda kutip
    expect(hasil).toBe('Kode,"Berat, kg"\r\nBR-01,12\r\nBR-02,8.5');
  });

  it('daftar kosong menghasilkan baris judul saja', () => {
    expect(buatCsv(kolom, [])).toBe('Kode,"Berat, kg"');
  });
});

describe('csvBatch', () => {
  const data = {
    daftarMitra: [
      { id: 'S1', nama: 'Dapur Sehat' },
      { id: 'P1', nama: 'Kompos Tani' },
    ],
    kategoriMaterial: [{ id: 'KAT-01', nama: 'Sisa sayur & buah' }],
    jalurPemanfaatan: [{ id: 'JLR-01', nama: 'Kompos' }],
  };
  const batchUji = [
    {
      kode: 'BR-01',
      diajukanPada: '2026-11-02T08:30:00+07:00',
      sumberId: 'S1',
      kategoriId: 'KAT-01',
      namaMaterial: 'Kulit buah',
      jalurId: 'JLR-01',
      metode: 'Diambil pengolah',
      pengolahId: 'P1',
      beratKg: 12,
      beratDiterimaKg: 11.5,
      status: STATUS_BATCH.SELESAI,
    },
    {
      kode: 'BR-02',
      diajukanPada: '2026-11-03T14:05:00+07:00',
      sumberId: 'S1',
      kategoriId: 'KAT-01',
      namaMaterial: 'Kuah sayur',
      jalurId: 'JLR-01',
      metode: 'Diantar sumber',
      pengolahId: null,
      beratKg: 6,
      beratDiterimaKg: null,
      status: STATUS_BATCH.DITOLAK,
      alasan: 'Tercampur plastik, berminyak',
    },
  ];

  it('baris judul berisi 12 kolom', () => {
    const [judul] = csvBatch(batchUji, data).split('\r\n');
    expect(judul).toBe(
      'Kode,Diajukan,Mitra sumber,Kategori,Nama material,Jalur,Metode,Mitra pengolah,Berat dilaporkan (kg),Berat diterima (kg),Status,Alasan'
    );
  });

  it('id diubah menjadi nama dan tanggal ditulis dalam WIB', () => {
    const baris = csvBatch(batchUji, data).split('\r\n');
    expect(baris[1]).toBe(
      'BR-01,"02 Nov 2026, 08.30 WIB",Dapur Sehat,Sisa sayur & buah,Kulit buah,Kompos,Diambil pengolah,Kompos Tani,12,11.5,Selesai,'
    );
  });

  it('pengolah, berat diterima, dan alasan yang kosong menjadi sel kosong; alasan berkoma dibungkus kutip', () => {
    const baris = csvBatch(batchUji, data).split('\r\n');
    expect(baris[2]).toBe(
      'BR-02,"03 Nov 2026, 14.05 WIB",Dapur Sehat,Sisa sayur & buah,Kuah sayur,Kompos,Diantar sumber,,6,,Ditolak,"Tercampur plastik, berminyak"'
    );
  });

  it('jumlah baris = 1 judul + jumlah batch', () => {
    expect(csvBatch(batchUji, data).split('\r\n')).toHaveLength(3);
    expect(csvBatch([], data).split('\r\n')).toHaveLength(1);
  });
});

describe('csvRekapMitra', () => {
  const rekapUji = [
    { nama: 'Warung Bu Slamet', peran: 'sumber', kecamatan: 'Purwokerto Timur', jumlahBatch: 3, dilaporkanKg: 25, diterimaKg: 13, ditolakKg: 6, persenDiterima: 92.857142 },
    { nama: 'Bank Sampah Mandiri', peran: 'pengolah', kecamatan: 'Purwokerto Barat', jumlahBatch: 0, dilaporkanKg: 0, diterimaKg: 0, ditolakKg: 0, persenDiterima: null },
  ];

  it('menulis peran dengan label dan membulatkan tingkat penerimaan 1 angka desimal', () => {
    const baris = csvRekapMitra(rekapUji).split('\r\n');
    expect(baris[0]).toBe('Mitra,Peran,Kecamatan,Total batch,Dilaporkan (kg),Diterima (kg),Ditolak (kg),Tingkat penerimaan (%)');
    expect(baris[1]).toBe('Warung Bu Slamet,Mitra Sumber,Purwokerto Timur,3,25,13,6,92.9');
  });

  it('tingkat penerimaan null (belum ada yang ditimbang) menjadi sel kosong', () => {
    const baris = csvRekapMitra(rekapUji).split('\r\n');
    expect(baris[2]).toBe('Bank Sampah Mandiri,Mitra Pengolah,Purwokerto Barat,0,0,0,0,');
  });
});

describe('namaFileUnduhan', () => {
  it('memakai jenis dan tanggal dengan format YYYY-MM-DD', () => {
    expect(namaFileUnduhan('batch', new Date('2026-11-24T10:00:00+07:00'))).toBe('bioroute-batch-2026-11-24.csv');
  });

  it('tanggal mengikuti WIB, bukan UTC', () => {
    // 24 Nov 20.00 UTC = 25 Nov 03.00 WIB
    expect(namaFileUnduhan('laporan-mitra', new Date('2026-11-24T20:00:00Z'))).toBe('bioroute-laporan-mitra-2026-11-25.csv');
  });
});