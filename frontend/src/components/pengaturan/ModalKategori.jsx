'use client';

import { useState } from 'react';
import { cekKategori, pisahKriteria } from '@/lib/validasi';

/**
 * Modal form untuk menambah atau mengubah kategori material di halaman Pengaturan.
 * kategoriAwal = null berarti mode tambah; berisi objek kategori berarti mode ubah.
 * Validasi memakai cekKategori (aturan yang sama dengan reducer); halaman hanya menerima data yang sudah valid lewat onSimpan.
 */
export default function ModalKategori({ kategoriAwal, daftarKategori, onBatal, onSimpan }) {
  const modeUbah = kategoriAwal !== null;
  // Kriteria disimpan sebagai array, tetapi diketik sebagai satu teks yang dipisah koma.
  const [form, setForm] = useState({
    nama: kategoriAwal?.nama ?? '',
    contoh: kategoriAwal?.contoh ?? '',
    kriteria: kategoriAwal?.kriteria.join(', ') ?? '',
  });
  const [tampilkanError, setTampilkanError] = useState(false);
  const error = cekKategori(form, daftarKategori, kategoriAwal?.id ?? null);

  /**
   * Mengubah satu kolom form.
   */
  const ubahKolom = (nama, nilai) => {
    setForm((sebelumnya) => ({ ...sebelumnya, [nama]: nilai }));
  };

  /**
   * Kalau form belum valid, tampilkan pesan error; kalau valid, kirim data yang sudah dirapikan ke halaman.
   */
  const handleSimpan = (e) => {
    e.preventDefault();
    if (Object.keys(error).length > 0) {
      setTampilkanError(true);
      return;
    }
    onSimpan({ nama: form.nama.trim(), contoh: form.contoh.trim(), kriteria: pisahKriteria(form.kriteria) });
  };

  return (
    <div
      className="fixed inset-0 z-40 bg-black/40 flex items-center justify-center p-4"
      onKeyDown={(e) => {
        if (e.key === 'Escape') onBatal();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="judul-modal-kategori"
        className="bg-white rounded-2xl border border-[#E5EAE7] shadow-xl w-full max-w-md p-6"
      >
        <h2 id="judul-modal-kategori" className="text-lg font-bold text-[#17231D]">
          {modeUbah ? `Ubah kategori ${kategoriAwal.id}` : 'Tambah kategori material'}
        </h2>
        <p className="text-xs text-[#66736C] mt-1">
          Kategori dipakai mitra sumber saat mencatat batch dan tampil di Laporan.
        </p>

        <form onSubmit={handleSimpan} noValidate className="space-y-4 mt-4">
          <div>
            <label htmlFor="kategori-nama" className="text-xs font-semibold text-[#17231D]">
              Nama kategori
            </label>
            <input
              id="kategori-nama"
              type="text"
              value={form.nama}
              onChange={(e) => ubahKolom('nama', e.target.value)}
              autoFocus
              placeholder="Contoh: Ampas kopi"
              className="mt-1 w-full px-3 py-2 bg-[#F4F6F5] text-xs text-[#17231D] rounded-xl border border-[#E5EAE7] focus:outline-none focus:ring-2 focus:ring-[#176B4D]"
            />
            {tampilkanError && error.nama && (
              <p role="alert" className="text-xs text-[#C2413B] mt-1">
                {error.nama}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="kategori-contoh" className="text-xs font-semibold text-[#17231D]">
              Contoh residu
            </label>
            <textarea
              id="kategori-contoh"
              rows={2}
              value={form.contoh}
              onChange={(e) => ubahKolom('contoh', e.target.value)}
              placeholder="Contoh: Ampas kopi dari kafe dan kedai"
              className="mt-1 w-full px-3 py-2 bg-[#F4F6F5] text-xs text-[#17231D] rounded-xl border border-[#E5EAE7] focus:outline-none focus:ring-2 focus:ring-[#176B4D]"
            />
            {tampilkanError && error.contoh && (
              <p role="alert" className="text-xs text-[#C2413B] mt-1">
                {error.contoh}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="kategori-kriteria" className="text-xs font-semibold text-[#17231D]">
              Kriteria fisik (opsional, pisahkan dengan koma)
            </label>
            <input
              id="kategori-kriteria"
              type="text"
              value={form.kriteria}
              onChange={(e) => ubahKolom('kriteria', e.target.value)}
              placeholder="Contoh: Kering, Bebas plastik"
              className="mt-1 w-full px-3 py-2 bg-[#F4F6F5] text-xs text-[#17231D] rounded-xl border border-[#E5EAE7] focus:outline-none focus:ring-2 focus:ring-[#176B4D]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onBatal}
              className="border border-[#E5EAE7] hover:bg-[#F4F6F5] text-sm font-medium px-4 py-2 rounded-xl text-[#17231D] cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="bg-[#176B4D] hover:bg-[#104D38] text-sm font-medium px-4 py-2 rounded-xl text-white cursor-pointer"
            >
              {modeUbah ? 'Simpan perubahan' : 'Tambah kategori'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
