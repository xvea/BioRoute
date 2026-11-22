import { describe, it, expect } from 'vitest';
import { STATUS_BATCH, STATUS_VERIFIKASI } from '@/lib/constants';
import { bioRouteReducer, JENIS_AKSI } from '@/context/BioRouteReducer';

// Unit test untuk BioRouteReducer.js
// State uji dibuat kecil: 2 batch dan 2 mitra.

const WAKTU = '2026-11-21T10:00:00+07:00';

const stateUji = {
  daftarBatch: [
    { kode: 'BR-UJI-1', status: STATUS_BATCH.DIAJUKAN, pengolahId: null, riwayat: [] },
    { kode: 'BR-UJI-2', status: STATUS_BATCH.SELESAI, pengolahId: 'MTR-101', riwayat: [] },
  ],
  daftarMitra: [
    { id: 'MTR-001', nama: 'Sumber Uji', peran: 'sumber', statusVerifikasi: STATUS_VERIFIKASI.TERVERIFIKASI },
    { id: 'MTR-002', nama: 'Sumber Baru', peran: 'sumber', statusVerifikasi: STATUS_VERIFIKASI.MENUNGGU },
    { id: 'MTR-101', nama: 'Pengolah Uji', peran: 'pengolah', statusVerifikasi: STATUS_VERIFIKASI.TERVERIFIKASI },
  ],
  kategoriMaterial: [
    { id: 'KAT-01', nama: 'Sisa sayur & buah', aktif: true },
    { id: 'KAT-02', nama: 'Sisa produksi', aktif: false },
  ],
  jalurPemanfaatan: [
    { id: 'JLR-01', nama: 'Kompos', aktif: true },
    { id: 'JLR-02', nama: 'BSF / Maggot', aktif: false },
  ],
  parameterVerifikasi: {},
};

describe('SETUJUI_BATCH', () => {
  it('mengubah status jadi Tersedia, mengisi pengolah, dan menambah riwayat', () => {
    const stateBaru = bioRouteReducer(stateUji, {
      type: JENIS_AKSI.SETUJUI_BATCH,
      payload: { kode: 'BR-UJI-1', pengolahId: 'MTR-101', waktu: WAKTU },
    });
    const batch = stateBaru.daftarBatch[0];

    expect(batch.status).toBe(STATUS_BATCH.TERSEDIA);
    expect(batch.pengolahId).toBe('MTR-101');
    expect(batch.riwayat).toEqual([
      { waktu: WAKTU, keterangan: 'Disetujui admin dan ditawarkan ke Pengolah Uji' },
    ]);
  });

  it('tidak mengubah state lama (immutable)', () => {
    bioRouteReducer(stateUji, {
      type: JENIS_AKSI.SETUJUI_BATCH,
      payload: { kode: 'BR-UJI-1', pengolahId: 'MTR-101', waktu: WAKTU },
    });

    expect(stateUji.daftarBatch[0].status).toBe(STATUS_BATCH.DIAJUKAN);
    expect(stateUji.daftarBatch[0].riwayat).toEqual([]);
  });

  it('menolak batch yang statusnya bukan Diajukan', () => {
    const stateBaru = bioRouteReducer(stateUji, {
      type: JENIS_AKSI.SETUJUI_BATCH,
      payload: { kode: 'BR-UJI-2', pengolahId: 'MTR-101', waktu: WAKTU },
    });

    // toBe pada objek = "benda yang sama persis", artinya reducer tidak membuat state baru
    expect(stateBaru).toBe(stateUji);
  });

  it('menolak tujuan yang bukan Mitra Pengolah', () => {
    const stateBaru = bioRouteReducer(stateUji, {
      type: JENIS_AKSI.SETUJUI_BATCH,
      payload: { kode: 'BR-UJI-1', pengolahId: 'MTR-001', waktu: WAKTU },
    });

    expect(stateBaru).toBe(stateUji);
  });
});

describe('MINTA_REVISI_BATCH', () => {
  it('mengubah status jadi Perlu revisi dan menyimpan alasan', () => {
    const stateBaru = bioRouteReducer(stateUji, {
      type: JENIS_AKSI.MINTA_REVISI_BATCH,
      payload: { kode: 'BR-UJI-1', alasan: '  Foto timbangan buram  ', waktu: WAKTU },
    });
    const batch = stateBaru.daftarBatch[0];

    expect(batch.status).toBe(STATUS_BATCH.PERLU_REVISI);
    expect(batch.alasan).toBe('Foto timbangan buram');
    expect(batch.riwayat).toHaveLength(1);
  });

  it('menolak alasan kosong', () => {
    const stateBaru = bioRouteReducer(stateUji, {
      type: JENIS_AKSI.MINTA_REVISI_BATCH,
      payload: { kode: 'BR-UJI-1', alasan: '   ', waktu: WAKTU },
    });

    expect(stateBaru).toBe(stateUji);
  });
});

describe('TOLAK_BATCH', () => {
  it('mengubah status jadi Ditolak dan menyimpan alasan', () => {
    const stateBaru = bioRouteReducer(stateUji, {
      type: JENIS_AKSI.TOLAK_BATCH,
      payload: { kode: 'BR-UJI-1', alasan: 'Tercampur plastik', waktu: WAKTU },
    });
    const batch = stateBaru.daftarBatch[0];

    expect(batch.status).toBe(STATUS_BATCH.DITOLAK);
    expect(batch.alasan).toBe('Tercampur plastik');
  });

  it('menolak alasan kosong', () => {
    const stateBaru = bioRouteReducer(stateUji, {
      type: JENIS_AKSI.TOLAK_BATCH,
      payload: { kode: 'BR-UJI-1', alasan: '', waktu: WAKTU },
    });

    expect(stateBaru).toBe(stateUji);
  });
});

describe('aksi tidak dikenal', () => {
  it('melempar error supaya salah ketik langsung ketahuan', () => {
    expect(() => bioRouteReducer(stateUji, { type: 'SETUJU_BATCH', payload: {} })).toThrow(
      'Aksi tidak dikenal: SETUJU_BATCH'
    );
  });
});


describe('VERIFIKASI_MITRA', () => {
  it('mengubah status mitra Menunggu jadi Terverifikasi', () => {
    const stateBaru = bioRouteReducer(stateUji, {
      type: JENIS_AKSI.VERIFIKASI_MITRA,
      payload: { id: 'MTR-002' },
    });

    expect(stateBaru.daftarMitra[1].statusVerifikasi).toBe(STATUS_VERIFIKASI.TERVERIFIKASI);
  });

  it('menolak mitra yang statusnya bukan Menunggu', () => {
    const stateBaru = bioRouteReducer(stateUji, {
      type: JENIS_AKSI.VERIFIKASI_MITRA,
      payload: { id: 'MTR-001' },
    });

    expect(stateBaru).toBe(stateUji);
  });
});

describe('TOLAK_MITRA', () => {
  it('mengubah status jadi Ditolak dan menyimpan alasan', () => {
    const stateBaru = bioRouteReducer(stateUji, {
      type: JENIS_AKSI.TOLAK_MITRA,
      payload: { id: 'MTR-002', alasan: 'Alamat tidak lengkap' },
    });
    const mitra = stateBaru.daftarMitra[1];

    expect(mitra.statusVerifikasi).toBe(STATUS_VERIFIKASI.DITOLAK);
    expect(mitra.alasan).toBe('Alamat tidak lengkap');
  });

  it('menolak alasan kosong', () => {
    const stateBaru = bioRouteReducer(stateUji, {
      type: JENIS_AKSI.TOLAK_MITRA,
      payload: { id: 'MTR-002', alasan: '  ' },
    });

    expect(stateBaru).toBe(stateUji);
  });
});

describe('UBAH_STATUS_KATEGORI', () => {
  it('menonaktifkan kategori yang aktif', () => {
    const stateBaru = bioRouteReducer(stateUji, {
      type: JENIS_AKSI.UBAH_STATUS_KATEGORI,
      payload: { id: 'KAT-01' },
    });

    expect(stateBaru.kategoriMaterial[0].aktif).toBe(false);
    // Kategori lain tidak ikut berubah
    expect(stateBaru.kategoriMaterial[1].aktif).toBe(false);
  });

  it('mengaktifkan kategori yang nonaktif', () => {
    const stateBaru = bioRouteReducer(stateUji, {
      type: JENIS_AKSI.UBAH_STATUS_KATEGORI,
      payload: { id: 'KAT-02' },
    });

    expect(stateBaru.kategoriMaterial[1].aktif).toBe(true);
    // Kategori lain tidak ikut berubah
    expect(stateBaru.kategoriMaterial[0].aktif).toBe(true);
  });

  it('mengabaikan id yang tidak ada', () => {
    const stateBaru = bioRouteReducer(stateUji, {
      type: JENIS_AKSI.UBAH_STATUS_KATEGORI,
      payload: { id: 'KAT-99' },
    });

    expect(stateBaru).toBe(stateUji);
  });
});

describe('UBAH_STATUS_JALUR', () => {
  it('tidak boleh menonaktifkan jalur aktif yang terakhir', () => {
    const stateBaru = bioRouteReducer(stateUji, {
      type: JENIS_AKSI.UBAH_STATUS_JALUR,
      payload: { id: 'JLR-01' },
    });

    expect(stateBaru).toBe(stateUji);
  });

  it('boleh menonaktifkan jalur kalau masih ada jalur aktif lain', () => {
    // Langkah 1 aktifkan BSF dulu → sekarang ada 2 jalur aktif
    const stateDuaAktif = bioRouteReducer(stateUji, {
      type: JENIS_AKSI.UBAH_STATUS_JALUR,
      payload: { id: 'JLR-02' },
    });
    // Langkah 2 baru Kompos boleh dinonaktifkan
    const stateBaru = bioRouteReducer(stateDuaAktif, {
      type: JENIS_AKSI.UBAH_STATUS_JALUR,
      payload: { id: 'JLR-01' },
    });

    expect(stateDuaAktif.jalurPemanfaatan[1].aktif).toBe(true);
    expect(stateBaru.jalurPemanfaatan[0].aktif).toBe(false);
  });
});