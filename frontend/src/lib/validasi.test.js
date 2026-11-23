import { describe, it, expect } from 'vitest';
import { cekAlasan, MIN_PANJANG_ALASAN } from '@/lib/validasi';

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