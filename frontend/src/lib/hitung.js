import { STATUS_BATCH, STATUS_VERIFIKASI } from '@/lib/constants';
// Fungsi-fungsi untuk mencari dan menghitung data (total berat, jumlah batch, dll.).

// Batch dengan status ini dianggap sudah tidak berjalan lagi.
const STATUS_TIDAK_AKTIF = [STATUS_BATCH.SELESAI, STATUS_BATCH.DITOLAK];

// Pemformat untuk mengambil tanggal (1–31) menurut WIB, bukan menurut zona waktu komputer.
const pemformatTanggalWib = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  timeZone: 'Asia/Jakarta',
});

/**
 * Minggu ke berapa dalam bulan (tanggal 1–7 = 1, 8–14 = 2, dst.). Dipakai di dalam file ini saja.
 */
function mingguKe(iso) {
  const tanggal = Number(pemformatTanggalWib.format(new Date(iso)));
  return Math.ceil(tanggal / 7);
}

/**
 * Mencari satu item berdasarkan id. Mengembalikan null kalau tidak ketemu.
 */
export function cariById(daftar, id) {
  return daftar.find((item) => item.id === id) ?? null;
}

/**
 * Total berat yang dilaporkan mitra sumber (batch yang ditolak tidak dihitung).
 */
export function totalBeratDilaporkan(daftarBatch) {
  return daftarBatch
    .filter((batch) => batch.status !== STATUS_BATCH.DITOLAK)
    .reduce((total, batch) => total + batch.beratKg, 0);
}

/**
 * Total berat hasil timbang pengolah (hanya batch yang sudah ditimbang).
 */
export function totalBeratDiterima(daftarBatch) {
  return daftarBatch
    .filter((batch) => batch.beratDiterimaKg !== null)
    .reduce((total, batch) => total + batch.beratDiterimaKg, 0);
}

/**
 * Total berat batch yang ditolak.
 */
export function totalBeratDitolak(daftarBatch) {
  return daftarBatch
    .filter((batch) => batch.status === STATUS_BATCH.DITOLAK)
    .reduce((total, batch) => total + batch.beratKg, 0);
}

/**
 * Jumlah batch yang masih berjalan (belum Selesai dan tidak Ditolak).
 */
export function hitungBatchAktif(daftarBatch) {
  return daftarBatch.filter((batch) => !STATUS_TIDAK_AKTIF.includes(batch.status)).length;
}

/**
 * Berat diterima per jalur pemanfaatan beserta persentasenya.
 */
export function beratDiterimaPerJalur(daftarBatch, daftarJalur) {
  const totalSemua = totalBeratDiterima(daftarBatch);

  return daftarJalur.map((jalur) => {
    const batchJalurIni = daftarBatch.filter((batch) => batch.jalurId === jalur.id);
    const kg = totalBeratDiterima(batchJalurIni);
    // kalau belum ada yang diterima, hindari pembagian dengan nol
    const persen = totalSemua === 0 ? 0 : (kg / totalSemua) * 100;
    return { id: jalur.id, nama: jalur.nama, kg, persen };
  });
}

/**
 * Jumlah batch yang statusnya sama dengan status yang diminta.
 */
export function hitungBatchPerStatus(daftarBatch, status) {
  return daftarBatch.filter((batch) => batch.status === status).length;
}

/**
 * Berat dilaporkan per minggu untuk setiap jalur (untuk grafik Dashboard).
 * Hasil: [{ minggu: 'Minggu 1', 'JLR-01': 26, 'JLR-02': 8 }, ...]
 */
export function beratPerMinggu(daftarBatch, daftarJalur) {
  // batch yang ditolak tidak dihitung, jadi juga tidak boleh menambah jumlah minggu
  const batchDihitung = daftarBatch.filter((batch) => batch.status !== STATUS_BATCH.DITOLAK);
  if (batchDihitung.length === 0) return [];

  const mingguTerakhir = Math.max(...batchDihitung.map((batch) => mingguKe(batch.diajukanPada)));

  const hasil = [];
  for (let minggu = 1; minggu <= mingguTerakhir; minggu++) {
    const baris = { minggu: `Minggu ${minggu}` };
    for (const jalur of daftarJalur) {
      const batchIni = batchDihitung.filter(
        (batch) => batch.jalurId === jalur.id && mingguKe(batch.diajukanPada) === minggu
      );
      baris[jalur.id] = totalBeratDilaporkan(batchIni);
    }
    hasil.push(baris);
  }
  return hasil;
}

/**
 * Batch yang paling baru diajukan, sebanyak `jumlah`.
 */
export function batchTerbaru(daftarBatch, jumlah) {
  // sort() mengubah array aslinya
  return [...daftarBatch].sort((a, b) => new Date(b.diajukanPada) - new Date(a.diajukanPada)).slice(0, jumlah);
}

/**
 * Daftar mitra yang masih menunggu verifikasi admin.
 */
export function mitraMenunggu(daftarMitra) {
  return daftarMitra.filter((mitra) => mitra.statusVerifikasi === STATUS_VERIFIKASI.MENUNGGU);
}

/**
 * Mitra pengolah yang boleh ditawari batch: sudah terverifikasi dan melayani jalur yang sama.
 */
export function pengolahUntukJalur(daftarMitra, jalurId) {
  return daftarMitra.filter(
    (mitra) =>
      mitra.peran === 'pengolah' &&
      mitra.statusVerifikasi === STATUS_VERIFIKASI.TERVERIFIKASI &&
      mitra.jalurId === jalurId
  );
}

/**
 * Jumlah mitra untuk setiap status verifikasi (untuk angka di tab Verifikasi Mitra).
 * Hasil: { Menunggu: 3, Terverifikasi: 6, Ditolak: 1 }. Status tanpa mitra tetap muncul dengan nilai 0.
 */
export function hitungMitraPerStatus(daftarMitra) {
  const hasil = {};
  for (const status of Object.values(STATUS_VERIFIKASI)) {
    hasil[status] = daftarMitra.filter((mitra) => mitra.statusVerifikasi === status).length;
  }
  return hasil;
}

/**
 * Persentase berat yang benar-benar diterima pengolah dibanding berat yang dilaporkan, khusus batch yang sudah ditimbang.
 * Mengembalikan null kalau belum ada batch yang ditimbang (supaya tampil "–", bukan 0%).
 */
export function persenDiterima(daftarBatch) {
  const batchTertimbang = daftarBatch.filter((batch) => batch.beratDiterimaKg !== null);
  const dilaporkan = batchTertimbang.reduce((total, batch) => total + batch.beratKg, 0);
  if (dilaporkan === 0) return null;
  return (totalBeratDiterima(batchTertimbang) / dilaporkan) * 100;
}

/**
 * Berat dilaporkan per kategori material beserta jumlah batch dan persentasenya (batch Ditolak tidak dihitung).
 * Semua kategori tetap muncul, termasuk yang belum punya batch (0 kg).
 */
export function ringkasanPerKategori(daftarBatch, daftarKategori) {
  const batchDihitung = daftarBatch.filter((batch) => batch.status !== STATUS_BATCH.DITOLAK);
  const totalSemua = totalBeratDilaporkan(batchDihitung);

  return daftarKategori.map((kategori) => {
    const batchKategoriIni = batchDihitung.filter((batch) => batch.kategoriId === kategori.id);
    const kg = totalBeratDilaporkan(batchKategoriIni);
    const persen = totalSemua === 0 ? 0 : (kg / totalSemua) * 100;
    return { id: kategori.id, nama: kategori.nama, kg, persen, jumlahBatch: batchKategoriIni.length };
  });
}

/**
 * Rekap kinerja setiap mitra Terverifikasi: batch milik mitra sumber (sumberId) atau batch yang ditangani mitra pengolah (pengolahId).
 */
export function rekapPerMitra(daftarBatch, daftarMitra) {
  return daftarMitra
    .filter((mitra) => mitra.statusVerifikasi === STATUS_VERIFIKASI.TERVERIFIKASI)
    .map((mitra) => {
      const kolomId = mitra.peran === 'sumber' ? 'sumberId' : 'pengolahId';
      const batchMitra = daftarBatch.filter((batch) => batch[kolomId] === mitra.id);
      return {
        id: mitra.id,
        nama: mitra.nama,
        peran: mitra.peran,
        kecamatan: mitra.kecamatan,
        jumlahBatch: batchMitra.length,
        dilaporkanKg: totalBeratDilaporkan(batchMitra),
        diterimaKg: totalBeratDiterima(batchMitra),
        ditolakKg: totalBeratDitolak(batchMitra),
        persenDiterima: persenDiterima(batchMitra),
      };
    });
}

/**
 * Selisih berat dilaporkan − diterima untuk batch yang sudah ditimbang, diurutkan dari selisih terbesar (positif atau negatif).
 * Batch ditandai melebihiToleransi kalau besar selisihnya lebih dari toleransi (nilai yang sama persis masih dianggap wajar).
 */
export function selisihBerat(daftarBatch, toleransiKg) {
  return daftarBatch
    .filter((batch) => batch.beratDiterimaKg !== null)
    .map((batch) => {
      const selisihKg = batch.beratKg - batch.beratDiterimaKg;
      return {
        kode: batch.kode,
        sumberId: batch.sumberId,
        dilaporkanKg: batch.beratKg,
        diterimaKg: batch.beratDiterimaKg,
        selisihKg,
        melebihiToleransi: Math.abs(selisihKg) > toleransiKg,
      };
    })
    .sort((a, b) => Math.abs(b.selisihKg) - Math.abs(a.selisihKg));
}
