'use client';

import { useState } from 'react';
import { cekAlasan } from '@/lib/validasi';

// Warna tombol kirim: 'peringatan' (kuning, untuk minta revisi) atau 'bahaya' (merah, untuk tolak).
const WARNA_TOMBOL = {
  peringatan: 'bg-peringatan hover:bg-peringatan-tua',
  bahaya: 'bg-bahaya hover:bg-bahaya-tua',
};

/**
 * Modal untuk menulis alasan (minta revisi / tolak), dipakai di Batch Material dan Verifikasi Mitra. Isian alasan dan validasinya diurus di sini; halaman hanya menerima alasan yang sudah valid lewat onKirim.
 */
export default function ModalAlasan({ judul, keterangan, labelKirim, varian = 'bahaya', onBatal, onKirim }) {
  const [alasan, setAlasan] = useState('');
  const [tampilkanError, setTampilkanError] = useState(false);
  const pesanError = cekAlasan(alasan);

  /**
   * Kalau alasan belum valid, tampilkan pesan error; kalau valid, kirim alasan (tanpa spasi di ujung) ke halaman.
   */
  const handleKirim = () => {
    if (pesanError) {
      setTampilkanError(true);
      return;
    }
    onKirim(alasan.trim());
  };

  return (
    <div
      className="fixed inset-0 z-40 bg-black/40 flex items-center justify-center p-4 animate-muncul"
      onKeyDown={(e) => {
        if (e.key === 'Escape') onBatal();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="judul-modal-alasan"
        className="bg-white rounded-kartu border border-garis shadow-xl w-full max-w-md p-6 space-y-4 animate-fade-in"
      >
        <div>
          <h2 id="judul-modal-alasan" className="text-lg font-bold text-teks">
            {judul}
          </h2>
          <p className="text-xs text-teks-redup mt-1">{keterangan}</p>
        </div>

        <div>
          <label htmlFor="isian-alasan" className="text-xs font-semibold text-teks">
            Alasan
          </label>
          <textarea
            id="isian-alasan"
            value={alasan}
            onChange={(e) => setAlasan(e.target.value)}
            rows={4}
            autoFocus
            placeholder="Contoh: Foto timbangan tidak terlihat jelas, mohon unggah ulang."
            className="mt-1 w-full p-3 bg-latar-redup text-xs text-teks rounded-xl border border-garis focus:outline-none focus:ring-2 focus:ring-brand"
          />
          {tampilkanError && pesanError && (
            <p role="alert" className="text-xs text-bahaya mt-1">
              {pesanError}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onBatal}
            className="border border-garis hover:bg-latar-redup text-sm font-medium px-4 py-2 rounded-xl text-teks cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleKirim}
            className={`text-sm font-medium px-4 py-2 rounded-xl text-white cursor-pointer ${WARNA_TOMBOL[varian]}`}
          >
            {labelKirim}
          </button>
        </div>
      </div>
    </div>
  );
}
