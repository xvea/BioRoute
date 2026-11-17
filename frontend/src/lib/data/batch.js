import { STATUS_BATCH } from '@/lib/constants';

// Data batch material. Satu batch = satu kali setoran residu dari Mitra Sumber.
// Kode batch: BR-<tahun 2 digit><bulan 2 digit>-<nomor urut>, contoh BR-2611-001 = Nov 2026, batch ke-1.
// sumberId, kategoriId, jalurId, dan pengolahId merujuk ke id di mitra.js dan masterData.js.

export const daftarBatch = [
  {
    kode: 'BR-2611-001',
    sumberId: 'MTR-001',          // → Dapur Sehat Purwokerto
    kategoriId: 'KAT-01',         // → Sisa sayur & buah
    jalurId: 'JLR-01',            // → Kompos
    namaMaterial: 'Sisa sayur dan kulit buah',
    beratKg: 12,                  // berat yang dilaporkan mitra sumber
    beratDiterimaKg: 11.5,        // berat hasil timbang pengolah (null = belum ditimbang)
    metode: 'Diambil pengolah',   // atau 'Diantar sumber'
    pengolahId: 'MTR-101',        // → Kompos Tani Lestari (null = belum ada pengolah)
    status: STATUS_BATCH.SELESAI, // memakai konstanta dari Langkah 2
    diajukanPada: '2026-11-02T08:30:00+07:00',
    riwayat: [
      { waktu: '2026-11-02T08:30:00+07:00', keterangan: 'Diajukan oleh mitra sumber' },
      { waktu: '2026-11-02T09:10:00+07:00', keterangan: 'Disetujui admin dan ditawarkan ke Kompos Tani Lestari' },
      { waktu: '2026-11-02T10:00:00+07:00', keterangan: 'Diterima pengolah, dijadwalkan diambil' },
      { waktu: '2026-11-02T14:00:00+07:00', keterangan: 'Tiba dan ditimbang 11,5 kg' },
      { waktu: '2026-11-06T16:00:00+07:00', keterangan: 'Proses pengolahan selesai' },
    ],
  },
  // ... batch lain: salin dari file lampiran
];