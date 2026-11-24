import { describe, it, expect } from 'vitest';
import { formatKg, formatPersen, formatTanggal, formatTanggalJam } from '@/lib/format';

// Unit test untuk src/lib/format.js
// Pola setiap test: siapkan input → panggil fungsi → bandingkan hasil dengan yang diharapkan.

describe('formatKg', () => {
  it('menampilkan bilangan bulat tanpa koma', () => {
    expect(formatKg(12)).toBe('12 kg');
  });

  it('memakai koma untuk desimal', () => {
    expect(formatKg(11.5)).toBe('11,5 kg');
  });

  it('membulatkan ke 1 angka di belakang koma', () => {
    expect(formatKg(2.46)).toBe('2,5 kg');
  });

  it('menampilkan strip kalau berat belum ada', () => {
    expect(formatKg(null)).toBe('–');
    expect(formatKg(undefined)).toBe('–');
  });
});

describe('formatPersen', () => {
  it('menampilkan persen dengan 1 angka di belakang koma', () => {
    expect(formatPersen(59.0909)).toBe('59,1%');
  });

  it('menampilkan strip kalau angka kosong', () => {
    expect(formatPersen(null)).toBe('–');
  });
});

describe('formatTanggal', () => {
  it('mengubah tanggal ISO menjadi tanggal Indonesia', () => {
    expect(formatTanggal('2026-11-02T08:30:00+07:00')).toBe('02 Nov 2026');
  });

  it('menampilkan strip kalau tanggal kosong', () => {
    expect(formatTanggal('')).toBe('–');
  });
});

describe('formatTanggalJam', () => {
  it('menampilkan tanggal dan jam WIB', () => {
    expect(formatTanggalJam('2026-11-02T08:30:00+07:00')).toBe('02 Nov 2026, 08.30 WIB');
  });

  it('tetap WIB walaupun waktu aslinya dalam UTC', () => {
    // 01.30 UTC = 08.30 WIB
    expect(formatTanggalJam('2026-11-02T01:30:00Z')).toBe('02 Nov 2026, 08.30 WIB');
  });
});
