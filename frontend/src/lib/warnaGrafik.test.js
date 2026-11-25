import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { WARNA_GRAFIK, WARNA_JALUR, WARNA_SELISIH } from './warnaGrafik';

// Isi globals.css dibaca sebagai teks untuk memastikan setiap token yang dipakai grafik benar-benar ada.
const isiGlobalsCss = readFileSync(new URL('../app/globals.css', import.meta.url), 'utf8');
const semuaWarna = [...Object.values(WARNA_GRAFIK), ...WARNA_JALUR, ...Object.values(WARNA_SELISIH)];

/**
 * Mengambil nama token dari 'var(--color-brand)' → '--color-brand'. Mengembalikan null kalau formatnya lain.
 */
function namaToken(warna) {
  const cocok = /^var\((--color-[a-z-]+)\)$/.exec(warna);
  return cocok ? cocok[1] : null;
}

describe('warnaGrafik', () => {
  it('setiap warna grafik memakai variabel token, bukan kode hex', () => {
    for (const warna of semuaWarna) {
      expect(namaToken(warna), `format salah: ${warna}`).not.toBeNull();
    }
  });

  it('setiap token yang dipakai grafik didefinisikan di globals.css', () => {
    for (const warna of semuaWarna) {
      expect(isiGlobalsCss, `token ${namaToken(warna)} tidak ada di globals.css`).toContain(`${namaToken(warna)}:`);
    }
  });

  it('token ditulis dengan @theme static agar variabelnya selalu ada untuk grafik', () => {
    expect(isiGlobalsCss).toContain('@theme static {');
  });

  it('setiap jalur memakai warna yang berbeda (Kompos, BSF / Maggot, jalur berikutnya)', () => {
    expect(WARNA_JALUR.length).toBeGreaterThanOrEqual(2);
    expect(new Set(WARNA_JALUR).size).toBe(WARNA_JALUR.length);
  });

  it('batang dilaporkan dan diterima di Laporan berbeda warna', () => {
    expect(WARNA_SELISIH.dilaporkan).not.toBe(WARNA_SELISIH.diterima);
  });
});
