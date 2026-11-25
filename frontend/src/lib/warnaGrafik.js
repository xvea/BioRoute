/**
 * Warna grafik recharts di satu tempat.
 * Props grafik (fill, stroke) tidak bisa memakai kelas Tailwind, jadi warnanya membaca token di
 * src/app/globals.css lewat variabel CSS. Untuk mengganti warna, ubah nilai tokennya di globals.css;
 * untuk mengganti token mana yang dipakai grafik, ubah file ini.
 */

/** Garis bantu dan sumbu grafik. */
export const WARNA_GRAFIK = {
  garisBantu: 'var(--color-garis)',
  labelSumbu: 'var(--color-teks-redup)',
};

/** Warna batang tiap jalur, berdasarkan urutan jalur di master data (Kompos, BSF / Maggot, jalur berikutnya). */
export const WARNA_JALUR = ['var(--color-brand)', 'var(--color-info)', 'var(--color-peringatan)'];

/** Warna batang grafik selisih berat di Laporan. */
export const WARNA_SELISIH = {
  dilaporkan: 'var(--color-aksen)',
  diterima: 'var(--color-brand)',
};
