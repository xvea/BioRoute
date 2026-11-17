// Data mitra (Mitra Sumber dan Mitra Pengolah).
// Mitra mendaftar lewat aplikasi mobile, lalu diverifikasi admin di halaman Verifikasi Mitra (W2).

export const daftarMitra = [
  {
    id: 'MTR-001',                          // ID unik, dirujuk oleh batch
    nama: 'Dapur Sehat Purwokerto',
    peran: 'sumber',                        // 'sumber' atau 'pengolah'
    penanggungJawab: 'Rina Marlina',
    telepon: '0812-1111-2201',
    email: 'rina@dapursehat.id',
    alamat: 'Jl. HR Bunyamin No. 42, Grendeng',
    kecamatan: 'Purwokerto Utara',
    koordinat: { lat: -7.4045, lng: 109.2482 },  // objek di dalam objek
    kategoriIds: ['KAT-01', 'KAT-02', 'KAT-04'], // array ID kategori yang dihasilkan
    estimasiKgPerHari: 15,
    statusVerifikasi: 'Terverifikasi',      // 'Menunggu' | 'Terverifikasi' | 'Ditolak'
    diajukanPada: '2026-10-20T09:00:00+07:00',
  },
  // ... mitra lain: salin dari file lampiran
];