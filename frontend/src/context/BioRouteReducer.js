import { STATUS_BATCH, STATUS_VERIFIKASI } from '@/lib/constants';
import { cariById, pengolahUntukJalur } from '@/lib/hitung';
import { cekKategori, cekParameter, ubahKeAngka } from '@/lib/validasi';
import { daftarBatch } from '@/lib/data/batch';
import { daftarMitra } from '@/lib/data/mitra';
import { kategoriMaterial, jalurPemanfaatan, parameterVerifikasi } from '@/lib/data/masterData';

// Reducer = satu-satunya tempat yang boleh mengubah data BioRoute di web admin.
// Halaman tidak mengubah data sendiri; halaman hanya mengirim "aksi" (dispatch), lalu reducer memutuskan data baru berdasarkan aturan bisnis.

/**
 * Daftar jenis aksi yang boleh dikirim ke reducer.
 * Memakai konstanta supaya salah ketik langsung diketahui.
 */
export const JENIS_AKSI = {
  SETUJUI_BATCH: 'SETUJUI_BATCH',
  MINTA_REVISI_BATCH: 'MINTA_REVISI_BATCH',
  TOLAK_BATCH: 'TOLAK_BATCH',
  VERIFIKASI_MITRA: 'VERIFIKASI_MITRA',
  TOLAK_MITRA: 'TOLAK_MITRA',
  UBAH_STATUS_KATEGORI: 'UBAH_STATUS_KATEGORI',
  UBAH_STATUS_JALUR: 'UBAH_STATUS_JALUR',
  TAMBAH_KATEGORI: 'TAMBAH_KATEGORI',
  UBAH_KATEGORI: 'UBAH_KATEGORI',
  UBAH_PARAMETER: 'UBAH_PARAMETER',
};

/**
 * Data awal aplikasi, diambil dari data contoh di src/lib/data.
 */
export const stateAwal = {
  daftarBatch,
  daftarMitra,
  kategoriMaterial,
  jalurPemanfaatan,
  parameterVerifikasi,
};

/**
 * Mencari batch yang masih berstatus Diajukan (hanya batch ini yang boleh diputuskan admin), dengan mengembalikan null kalau batch tidak ada atau statusnya sudah bukan Diajukan.
 */
function cariBatchDiajukan(state, kode) {
  const batch = state.daftarBatch.find((item) => item.kode === kode);
  if (!batch || batch.status !== STATUS_BATCH.DIAJUKAN) return null;
  return batch;
}

/**
 * Membuat state baru dengan satu batch diganti versi barunya.
 */
function gantiBatch(state, batchBaru) {
  return {
    ...state,
    daftarBatch: state.daftarBatch.map((batch) => (batch.kode === batchBaru.kode ? batchBaru : batch)),
  };
}
/**
 * Mencari mitra yang masih berstatus Menunggu.
 */
function cariMitraMenunggu(state, id) {
  const mitra = cariById(state.daftarMitra, id);
  if (!mitra || mitra.statusVerifikasi !== STATUS_VERIFIKASI.MENUNGGU) return null;
  return mitra;
}

/**
 * Membuat state baru dengan satu mitra diganti versi barunya.
 */
function gantiMitra(state, mitraBaru) {
  return {
    ...state,
    daftarMitra: state.daftarMitra.map((mitra) => (mitra.id === mitraBaru.id ? mitraBaru : mitra)),
  };
}

/**
 * Membalik nilai aktif (true ↔ false) satu item di dalam daftar, berdasarkan id.
 * Dipakai untuk kategori material dan jalur pemanfaatan.
 */
function balikStatusAktif(daftar, id) {
  return daftar.map((item) => (item.id === id ? { ...item, aktif: !item.aktif } : item));
}

/**
 * Membuat id kategori berikutnya dari nomor terbesar yang sudah ada (KAT-01, KAT-07 → KAT-08).
 * Memakai nomor terbesar, bukan jumlah kategori, supaya id tidak pernah kembar.
 */
function idKategoriBerikutnya(daftarKategori) {
  const nomorTerbesar = Math.max(0, ...daftarKategori.map((kategori) => Number(kategori.id.replace('KAT-', ''))));
  return `KAT-${String(nomorTerbesar + 1).padStart(2, '0')}`;
}

/**
 * Reducer utama: (state lama, aksi) berarti state baru. Kalo action tidak sah (batch tidak ada, status salah, alasan kosong), state lama dikembalikan seadanya.
 */
export function bioRouteReducer(state, aksi) {
  switch (aksi.type) {
    case JENIS_AKSI.SETUJUI_BATCH: {
      const { kode, pengolahId, waktu } = aksi.payload;
      const batch = cariBatchDiajukan(state, kode);
      if (!batch) return state;

      // Tujuan wajib Mitra Pengolah yang Terverifikasi dan melayani jalur batch ini (aturan yang sama dengan pilihan di halaman Batch)
      const pengolah = pengolahUntukJalur(state.daftarMitra, batch.jalurId).find((mitra) => mitra.id === pengolahId);
      if (!pengolah) return state;
      return gantiBatch(state, {
        ...batch,
        status: STATUS_BATCH.TERSEDIA,
        pengolahId,
        riwayat: [...batch.riwayat, { waktu, keterangan: `Disetujui admin dan ditawarkan ke ${pengolah.nama}` }],
      });
    }

    case JENIS_AKSI.MINTA_REVISI_BATCH: {
      const { kode, alasan, waktu } = aksi.payload;
      const batch = cariBatchDiajukan(state, kode);

      // ini alasan wajib diisi (spasi saja dianggap kosong)
      if (!batch || !alasan?.trim()) return state;

      return gantiBatch(state, {
        ...batch,
        status: STATUS_BATCH.PERLU_REVISI,
        alasan: alasan.trim(),
        riwayat: [...batch.riwayat, { waktu, keterangan: 'Diminta revisi oleh admin' }],
      });
    }

    case JENIS_AKSI.TOLAK_BATCH: {
      const { kode, alasan, waktu } = aksi.payload;
      const batch = cariBatchDiajukan(state, kode);
      if (!batch || !alasan?.trim()) return state;

      return gantiBatch(state, {
        ...batch,
        status: STATUS_BATCH.DITOLAK,
        alasan: alasan.trim(),
        riwayat: [...batch.riwayat, { waktu, keterangan: 'Ditolak admin' }],
      });
    }

    case JENIS_AKSI.VERIFIKASI_MITRA: {
      const mitra = cariMitraMenunggu(state, aksi.payload.id);
      if (!mitra) return state;
      return gantiMitra(state, { ...mitra, statusVerifikasi: STATUS_VERIFIKASI.TERVERIFIKASI });
    }

    case JENIS_AKSI.TOLAK_MITRA: {
      const { id, alasan } = aksi.payload;
      const mitra = cariMitraMenunggu(state, id);
      if (!mitra || !alasan?.trim()) return state;

      return gantiMitra(state, {
        ...mitra,
        statusVerifikasi: STATUS_VERIFIKASI.DITOLAK,
        alasan: alasan.trim(),
      });
    }

    case JENIS_AKSI.UBAH_STATUS_KATEGORI: {
      const { id } = aksi.payload;
      if (!cariById(state.kategoriMaterial, id)) return state;
      return { ...state, kategoriMaterial: balikStatusAktif(state.kategoriMaterial, id) };
    }

    case JENIS_AKSI.UBAH_STATUS_JALUR: {
      const { id } = aksi.payload;
      const jalur = cariById(state.jalurPemanfaatan, id);
      if (!jalur) return state;

      // Minimal satu jalur harus tetap aktif, supaya batch selalu punya tujuan pemanfaatan
      const jumlahAktif = state.jalurPemanfaatan.filter((item) => item.aktif).length;
      if (jalur.aktif && jumlahAktif === 1) return state;
      return { ...state, jalurPemanfaatan: balikStatusAktif(state.jalurPemanfaatan, id) };
    }

    case JENIS_AKSI.TAMBAH_KATEGORI: {
      const { nama, contoh, kriteria } = aksi.payload;
      // Aturan yang sama dengan form di halaman Pengaturan (nama wajib, unik, contoh wajib)
      if (Object.keys(cekKategori({ nama, contoh }, state.kategoriMaterial)).length > 0) return state;

      const kategoriBaru = {
        id: idKategoriBerikutnya(state.kategoriMaterial),
        nama: nama.trim(),
        contoh: contoh.trim(),
        kriteria,
        aktif: true,
      };
      return { ...state, kategoriMaterial: [...state.kategoriMaterial, kategoriBaru] };
    }

    case JENIS_AKSI.UBAH_KATEGORI: {
      const { id, nama, contoh, kriteria } = aksi.payload;
      if (!cariById(state.kategoriMaterial, id)) return state;
      if (Object.keys(cekKategori({ nama, contoh }, state.kategoriMaterial, id)).length > 0) return state;

      // id dan status aktif tidak berubah; batch lama tetap merujuk id yang sama
      return {
        ...state,
        kategoriMaterial: state.kategoriMaterial.map((kategori) =>
          kategori.id === id ? { ...kategori, nama: nama.trim(), contoh: contoh.trim(), kriteria } : kategori
        ),
      };
    }

    case JENIS_AKSI.UBAH_PARAMETER: {
      const { toleransiSelisihKg, maksWaktuTinjauJam } = aksi.payload;
      if (Object.keys(cekParameter({ toleransiSelisihKg, maksWaktuTinjauJam })).length > 0) return state;

      return {
        ...state,
        parameterVerifikasi: {
          ...state.parameterVerifikasi,
          toleransiSelisihKg: ubahKeAngka(toleransiSelisihKg),
          maksWaktuTinjauJam: ubahKeAngka(maksWaktuTinjauJam),
        },
      };
    }

    default:
      // Jenis aksi tidak dikenal = salah ketik di kode, jadi diberhentikan dengan error yang jelas
      throw new Error(`Aksi tidak dikenal: ${aksi.type}`);
  }
}
