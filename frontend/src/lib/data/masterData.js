// Master data adalah daftar acuan yang dikelola admin di halaman Pengaturan (W5).
// Nanti setiap array di file ini menjadi satu tabel di database.
export const kategoriMaterial = [
  {
    id: 'KAT-01',
    nama: 'Sisa sayur & buah',
    contoh: 'Sawi, kubis, kulit jeruk, kulit pisang, sisa kupasan buah segar',
    kriteria: ['Kadar air tinggi', 'Wadah basah terpisah'],
    aktif: true,
  },
  {
    id: 'KAT-02',
    nama: 'Sisa produksi',
    contoh: 'Ampas tahu, ampas kelapa, kulit kedelai',
    kriteria: ['Material seragam', 'Cocok untuk pakan maggot'],
    aktif: true,
  },
  {
    id: 'KAT-03',
    nama: 'Makanan olahan',
    contoh: 'Nasi sisa katering, roti afkir, lauk padat tidak berkuah',
    kriteria: ['Tidak berkuah atau berminyak', 'Maksimal 24 jam disimpan'],
    aktif: true,
  },
  {
    id: 'KAT-04',
    nama: 'Campuran terpilah',
    contoh: 'Residu dapur umum yang sudah dipisahkan dari plastik dan kaca',
    kriteria: ['Wajib bebas anorganik', 'Diarahkan ke kompos'],
    aktif: true,
  },
];

export const jalurPemanfaatan = [
  {
    id: 'JLR-01',
    nama: 'Kompos',
    deskripsi: 'Residu diurai menjadi pupuk organik oleh TPST dan kelompok tani.',
    materialDiterima: 'Sayur, buah, daun, dan residu dapur yang bebas plastik.',
    aktif: true,
  },
  {
    id: 'JLR-02',
    nama: 'BSF / Maggot',
    deskripsi: 'Residu dimakan larva Black Soldier Fly yang kemudian menjadi pakan ternak.',
    materialDiterima: 'Ampas tahu, sisa katering tidak berminyak, buah lunak.',
    aktif: true,
  },
];

export const parameterVerifikasi = {
  toleransiSelisihKg: 2.5,
  maksWaktuTinjauJam: 12,
};
