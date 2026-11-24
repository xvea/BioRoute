import { describe, it, expect } from 'vitest';
import { cekAlasan, MIN_PANJANG_ALASAN, cekKategori, cekParameter, pisahKriteria, ubahKeAngka } from '@/lib/validasi';

// Unit test untuk src/lib/validasi.js.

describe('cekAlasan', () => {
  it('menolak alasan kosong', () => {
    expect(cekAlasan('')).toBe('Alasan wajib diisi.');
  });

  it('menolak alasan yang isinya hanya spasi', () => {
    expect(cekAlasan('     ')).toBe('Alasan wajib diisi.');
  });

  it('menolak alasan yang terlalu pendek', () => {
    expect(cekAlasan('Kotor')).toBe('Alasan minimal 10 karakter.');
  });

  it('spasi di tepi tidak ikut dihitung', () => {
    // 9 huruf + spasi di kiri dan kanan → tetap terlalu pendek
    expect(cekAlasan('   Bercampur   ')).toBe('Alasan minimal 10 karakter.');
  });

  it('menerima alasan tepat sepanjang batas minimal', () => {
    expect('Tidak rapi'.length).toBe(MIN_PANJANG_ALASAN);
    expect(cekAlasan('Tidak rapi')).toBeNull();
  });

  it('menerima alasan yang jelas', () => {
    expect(cekAlasan('Material tercampur plastik.')).toBeNull();
  });
});

describe('cekKategori', () => {
  const daftarKategori = [
    { id: 'KAT-01', nama: 'Sisa sayur & buah' },
    { id: 'KAT-02', nama: 'Sisa produksi' },
  ];
  const formBenar = { nama: 'Ampas kopi', contoh: 'Ampas kopi dari kafe' };

  it('menerima form yang benar (objek error kosong)', () => {
    expect(cekKategori(formBenar, daftarKategori)).toEqual({});
  });

  it('menolak nama kosong atau hanya spasi', () => {
    expect(cekKategori({ ...formBenar, nama: '   ' }, daftarKategori)).toEqual({ nama: 'Nama kategori wajib diisi.' });
  });

  it('menolak nama yang terlalu pendek', () => {
    expect(cekKategori({ ...formBenar, nama: ' Ab ' }, daftarKategori)).toEqual({
      nama: 'Nama kategori minimal 3 karakter.',
    });
  });

  it('menolak nama yang sudah dipakai kategori lain, tanpa peduli huruf besar/kecil dan spasi', () => {
    expect(cekKategori({ ...formBenar, nama: '  sisa PRODUKSI ' }, daftarKategori)).toEqual({
      nama: 'Nama kategori sudah dipakai.',
    });
  });

  it('saat mengubah kategori, namanya sendiri tidak dianggap duplikat', () => {
    expect(cekKategori({ ...formBenar, nama: 'Sisa produksi' }, daftarKategori, 'KAT-02')).toEqual({});
  });

  it('menolak contoh residu yang kosong', () => {
    expect(cekKategori({ ...formBenar, contoh: '  ' }, daftarKategori)).toEqual({
      contoh: 'Contoh residu wajib diisi.',
    });
  });
});

describe('cekParameter', () => {
  const formBenar = { toleransiSelisihKg: '2,5', maksWaktuTinjauJam: '12' };

  it('menerima isian yang benar, termasuk koma desimal dan number', () => {
    expect(cekParameter(formBenar)).toEqual({});
    expect(cekParameter({ toleransiSelisihKg: 0.8, maksWaktuTinjauJam: 24 })).toEqual({});
  });

  it('toleransi wajib diisi dan harus berupa angka', () => {
    expect(cekParameter({ ...formBenar, toleransiSelisihKg: ' ' })).toEqual({
      toleransiSelisihKg: 'Toleransi wajib diisi.',
    });
    expect(cekParameter({ ...formBenar, toleransiSelisihKg: 'dua' })).toEqual({
      toleransiSelisihKg: 'Toleransi harus berupa angka.',
    });
  });

  it('toleransi harus lebih dari 0 dan paling besar 10 kg', () => {
    const pesan = 'Toleransi harus lebih dari 0 dan paling besar 10 kg.';
    expect(cekParameter({ ...formBenar, toleransiSelisihKg: '0' })).toEqual({ toleransiSelisihKg: pesan });
    expect(cekParameter({ ...formBenar, toleransiSelisihKg: '10' })).toEqual({});
    expect(cekParameter({ ...formBenar, toleransiSelisihKg: '10,5' })).toEqual({ toleransiSelisihKg: pesan });
  });

  it('waktu tinjau wajib diisi, bilangan bulat, dan antara 1–72 jam', () => {
    expect(cekParameter({ ...formBenar, maksWaktuTinjauJam: '' })).toEqual({
      maksWaktuTinjauJam: 'Waktu tinjau wajib diisi.',
    });
    expect(cekParameter({ ...formBenar, maksWaktuTinjauJam: '1,5' })).toEqual({
      maksWaktuTinjauJam: 'Waktu tinjau harus bilangan bulat.',
    });
    expect(cekParameter({ ...formBenar, maksWaktuTinjauJam: '0' })).toEqual({
      maksWaktuTinjauJam: 'Waktu tinjau harus antara 1 dan 72 jam.',
    });
    expect(cekParameter({ ...formBenar, maksWaktuTinjauJam: '72' })).toEqual({});
    expect(cekParameter({ ...formBenar, maksWaktuTinjauJam: '73' })).toEqual({
      maksWaktuTinjauJam: 'Waktu tinjau harus antara 1 dan 72 jam.',
    });
  });
});

describe('ubahKeAngka', () => {
  it('menerima koma desimal, membuang spasi, dan isian kosong atau spasi saja menjadi NaN', () => {
    expect(ubahKeAngka('2,5')).toBe(2.5);
    expect(ubahKeAngka(' 3 ')).toBe(3);
    expect(ubahKeAngka('')).toBeNaN();
    expect(ubahKeAngka('   ')).toBeNaN();
  });
});

describe('pisahKriteria', () => {
  it('memecah teks berkoma menjadi array tanpa spasi di tepi dan tanpa isian kosong', () => {
    expect(pisahKriteria(' Kadar air tinggi,  Wadah basah , ,')).toEqual(['Kadar air tinggi', 'Wadah basah']);
  });
});
