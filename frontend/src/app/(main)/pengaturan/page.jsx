'use client';

import { useState } from 'react';
import {
  Layers,
  GitFork,
  Scale,
  Package,
  Plus,
  Sprout,
  Archive,
  Utensils,
  Bug,
  Pencil,
  Info,
} from 'lucide-react';
import Toast from '@/components/ui/Toast';
import ModalKategori from '@/components/pengaturan/ModalKategori';
import useToast from '@/hooks/useToast';
import { useBioRoute } from '@/context/BioRouteContext';
import { JENIS_AKSI } from '@/context/BioRouteReducer';
import { formatKg } from '@/lib/format';
import { pengolahUntukJalur } from '@/lib/hitung';
import { cekParameter, ubahKeAngka } from '@/lib/validasi';

// Ikon kategori dan jalur, dipilih berdasarkan urutan. Kalau admin menambah data baru, ikonnya mengulang dari awal.
const IKON_KATEGORI = [Sprout, Archive, Utensils, Layers];
const IKON_JALUR = [Sprout, Bug];

/**
 * Tombol geser aktif/nonaktif.
 */
function ToggleSwitch({ active, onToggle, ariaLabel }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={active}
      aria-label={ariaLabel}
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176B4D] focus-visible:ring-offset-2 ${active ? 'bg-[#176B4D]' : 'bg-[#E5EAE7]'
        }`}>
      <span
        aria-hidden="true"
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${active ? 'translate-x-5' : 'translate-x-0'
          }`}
      />
    </button>
  );
}

/**
 * Mengubah angka parameter menjadi teks isian dengan koma desimal (2.5 → "2,5").
 */
function keIsian(angka) {
  return String(angka).replace('.', ',');
}

/**
 * Halaman Pengaturan (W5): kategori material, jalur pemanfaatan, dan parameter verifikasi dari state BioRoute.
 */
export default function PengaturanPage() {
  const { state, dispatch } = useBioRoute();
  const { kategoriMaterial, jalurPemanfaatan, daftarMitra, parameterVerifikasi } = state;
  // State tampilan: modal kategori (null = tertutup, 'tambah', atau objek kategori yang diubah) dan form parameter.
  const [modalKategori, setModalKategori] = useState(null);
  const [formParameter, setFormParameter] = useState({
    toleransiSelisihKg: keIsian(parameterVerifikasi.toleransiSelisihKg),
    maksWaktuTinjauJam: keIsian(parameterVerifikasi.maksWaktuTinjauJam),
  });
  const [tampilkanErrorParameter, setTampilkanErrorParameter] = useState(false);
  const { toast, tampilkanToast } = useToast();

  // Angka ringkasan dihitung dari state.
  const jumlahKategoriAktif = kategoriMaterial.filter((kategori) => kategori.aktif).length;
  const jumlahJalurAktif = jalurPemanfaatan.filter((jalur) => jalur.aktif).length;
  const errorParameter = cekParameter(formParameter);

  /**
   * Mengaktifkan / menonaktifkan kategori (kategori tidak pernah dihapus karena batch lama merujuk id-nya).
   */
  const handleToggleKategori = (kategori) => {
    dispatch({ type: JENIS_AKSI.UBAH_STATUS_KATEGORI, payload: { id: kategori.id } });
    tampilkanToast('success', `Kategori ${kategori.nama} ${kategori.aktif ? 'dinonaktifkan' : 'diaktifkan'}.`);
  };

  /**
   * Mengaktifkan / menonaktifkan jalur. Jalur aktif terakhir tidak boleh dimatikan (aturan yang sama dengan reducer).
   */
  const handleToggleJalur = (jalur) => {
    if (jalur.aktif && jumlahJalurAktif === 1) {
      tampilkanToast('warning', 'Minimal satu jalur pemanfaatan harus tetap aktif.');
      return;
    }
    dispatch({ type: JENIS_AKSI.UBAH_STATUS_JALUR, payload: { id: jalur.id } });
    tampilkanToast('success', `Jalur ${jalur.nama} ${jalur.aktif ? 'dinonaktifkan' : 'diaktifkan'}.`);
  };

  /**
   * Menerima data kategori yang sudah valid dari ModalKategori, lalu menambah atau mengubah kategori.
   */
  const handleSimpanKategori = (data) => {
    if (modalKategori === 'tambah') {
      dispatch({ type: JENIS_AKSI.TAMBAH_KATEGORI, payload: data });
      tampilkanToast('success', `Kategori ${data.nama} ditambahkan.`);
    } else {
      dispatch({ type: JENIS_AKSI.UBAH_KATEGORI, payload: { id: modalKategori.id, ...data } });
      tampilkanToast('success', `Kategori ${data.nama} diperbarui.`);
    }
    setModalKategori(null);
  };

  /**
   * Mengubah satu kolom form parameter.
   */
  const ubahParameter = (nama, nilai) => {
    setFormParameter((sebelumnya) => ({ ...sebelumnya, [nama]: nilai }));
  };

  /**
   * Menyimpan parameter: kalau belum valid, tampilkan pesan error; kalau valid, dispatch sebagai angka.
   */
  const handleSimpanParameter = (e) => {
    e.preventDefault();
    if (Object.keys(errorParameter).length > 0) {
      setTampilkanErrorParameter(true);
      return;
    }
    const toleransiSelisihKg = ubahKeAngka(formParameter.toleransiSelisihKg);
    const maksWaktuTinjauJam = ubahKeAngka(formParameter.maksWaktuTinjauJam);
    dispatch({ type: JENIS_AKSI.UBAH_PARAMETER, payload: { toleransiSelisihKg, maksWaktuTinjauJam } });
    setTampilkanErrorParameter(false);
    tampilkanToast('success', `Parameter disimpan. Toleransi selisih sekarang ${formatKg(toleransiSelisihKg)}.`);
  };

  return (
    <div className="space-y-6 bg-white">

      {/* Toast Alert Feedback */}
      <Toast toast={toast} />

      {/* Modal tambah / ubah kategori */}
      {modalKategori && (
        <ModalKategori
          kategoriAwal={modalKategori === 'tambah' ? null : modalKategori}
          daftarKategori={kategoriMaterial}
          onBatal={() => setModalKategori(null)}
          onSimpan={handleSimpanKategori}
        />
      )}

      {/* 1. Judul halaman */}
      <section className="pb-1">
        <h1 className="text-2xl font-bold text-[#17231D] tracking-tight">Pengaturan Master Data</h1>
        <p className="text-sm text-[#66736C] mt-1">
          Kelola kategori material, jalur pemanfaatan, dan parameter verifikasi yang dipakai di seluruh aplikasi.
        </p>
      </section>

      {/* 2. Kartu ringkasan (dihitung dari state) */}
      <section aria-label="Ringkasan pengaturan" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <article className="p-4 rounded-2xl bg-white border border-[#E5EAE7] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#66736C]">
            <span>Kategori aktif</span>
            <Layers className="w-4 h-4" aria-hidden="true" />
          </div>
          <p className="text-2xl font-bold text-[#17231D] mt-1">
            {jumlahKategoriAktif} <span className="text-xs font-medium text-[#66736C]">dari {kategoriMaterial.length} kategori</span>
          </p>
        </article>
        <article className="p-4 rounded-2xl bg-white border border-[#E5EAE7] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#66736C]">
            <span>Jalur aktif</span>
            <GitFork className="w-4 h-4" aria-hidden="true" />
          </div>
          <p className="text-2xl font-bold text-[#17231D] mt-1">
            {jumlahJalurAktif} <span className="text-xs font-medium text-[#66736C]">dari {jalurPemanfaatan.length} jalur</span>
          </p>
        </article>
        <article className="p-4 rounded-2xl bg-white border border-[#E5EAE7] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#66736C]">
            <span>Toleransi selisih</span>
            <Scale className="w-4 h-4" aria-hidden="true" />
          </div>
          <p className="text-2xl font-bold text-[#17231D] mt-1">{formatKg(parameterVerifikasi.toleransiSelisihKg)}</p>
        </article>
        <article className="p-4 rounded-2xl bg-white border border-[#E5EAE7] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#66736C]">
            <span>Satuan baku</span>
            <Package className="w-4 h-4" aria-hidden="true" />
          </div>
          <p className="text-2xl font-bold text-[#17231D] mt-1">
            Kilogram <span className="text-xs font-medium text-[#66736C]">(kg)</span>
          </p>
        </article>
      </section>

      {/* 3. Kategori material */}
      <section className="rounded-2xl bg-white border border-[#E5EAE7] shadow-xs overflow-hidden">
        <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-[#17231D]">Kategori material organik</h2>
            <p className="text-xs text-[#66736C] mt-0.5">
              Kategori nonaktif tidak bisa dipilih untuk batch baru; batch lama tetap memakai kategorinya.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setModalKategori('tambah')}
            className="inline-flex items-center gap-1.5 bg-[#176B4D] hover:bg-[#104D38] text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors cursor-pointer shrink-0">
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>Tambah Kategori</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-[#F4F6F5] text-[#66736C]">
              <tr>
                <th scope="col" className="py-3 pl-6 font-medium">Ikon</th>
                <th scope="col" className="py-3 font-medium">Nama Kategori</th>
                <th scope="col" className="py-3 font-medium">Contoh Residu &amp; Kriteria</th>
                <th scope="col" className="py-3 font-medium">Status</th>
                <th scope="col" className="py-3 pr-6 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5EAE7]/60">
              {kategoriMaterial.map((kategori, index) => {
                const Ikon = IKON_KATEGORI[index % IKON_KATEGORI.length];
                return (
                  <tr key={kategori.id} className={kategori.aktif ? '' : 'bg-[#F4F6F5]/50'}>
                    <td className="py-4 pl-6">
                      <div className="w-9 h-9 rounded-xl border border-[#E5EAE7] bg-[#F4F6F5] flex items-center justify-center text-[#176B4D]">
                        <Ikon className="w-4 h-4" aria-hidden="true" />
                      </div>
                    </td>
                    <td className="py-4">
                      <p className="text-sm font-semibold text-[#17231D]">{kategori.nama}</p>
                      <p className="text-[11px] font-mono text-[#66736C] mt-0.5">Kode: {kategori.id}</p>
                    </td>
                    <td className="py-4 max-w-sm">
                      <p className="text-[#17231D]">{kategori.contoh}</p>
                      {kategori.kriteria.length > 0 && (
                        <ul className="flex flex-wrap gap-1.5 mt-1.5">
                          {kategori.kriteria.map((kriteria) => (
                            <li key={kriteria} className="px-2 py-0.5 rounded border border-[#E5EAE7] bg-[#F4F6F5] text-[11px] font-medium text-[#66736C]">
                              {kriteria}
                            </li>
                          ))}
                        </ul>
                      )}
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <ToggleSwitch
                          active={kategori.aktif}
                          onToggle={() => handleToggleKategori(kategori)}
                          ariaLabel={`Status kategori ${kategori.nama}`}
                        />
                        <span className="font-semibold text-[#17231D]">{kategori.aktif ? 'Aktif' : 'Nonaktif'}</span>
                      </div>
                    </td>
                    <td className="py-4 pr-6 text-right">
                      <button
                        type="button"
                        onClick={() => setModalKategori(kategori)}
                        aria-label={`Ubah kategori ${kategori.nama}`}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-[#E5EAE7] text-[#66736C] hover:bg-[#F4F6F5] hover:text-[#17231D] cursor-pointer">
                        <Pencil className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* 4. Jalur pemanfaatan */}
      <section className="rounded-2xl bg-white border border-[#E5EAE7] shadow-xs p-6 space-y-5">
        <div>
          <h2 className="text-base font-bold text-[#17231D]">Jalur pemanfaatan</h2>
          <p className="text-xs text-[#66736C] mt-0.5">
            Batch hanya bisa ditawarkan ke mitra pengolah terverifikasi pada jalur yang sama. Minimal satu jalur harus tetap aktif.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jalurPemanfaatan.map((jalur, index) => {
            const Ikon = IKON_JALUR[index % IKON_JALUR.length];
            const daftarPengolah = pengolahUntukJalur(daftarMitra, jalur.id);
            return (
              <article
                key={jalur.id}
                className={`p-5 rounded-2xl border border-[#E5EAE7] space-y-4 ${jalur.aktif ? 'bg-white' : 'bg-[#F4F6F5]/60'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#EAF5F0] text-[#176B4D] flex items-center justify-center">
                      <Ikon className="w-4 h-4" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#17231D]">{jalur.nama}</h3>
                      <p className="text-[11px] font-mono text-[#66736C]">ID: {jalur.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#17231D]">{jalur.aktif ? 'Aktif' : 'Nonaktif'}</span>
                    <ToggleSwitch
                      active={jalur.aktif}
                      onToggle={() => handleToggleJalur(jalur)}
                      ariaLabel={`Status jalur ${jalur.nama}`}
                    />
                  </div>
                </div>

                <p className="text-xs text-[#66736C]">{jalur.deskripsi}</p>

                <div className="p-3 rounded-xl bg-[#F4F6F5] text-xs">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#66736C]">Material diterima</p>
                  <p className="text-[#17231D] mt-1">{jalur.materialDiterima}</p>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#66736C]">Mitra pengolah terverifikasi</span>
                    <span className="px-2 py-0.5 rounded-full bg-[#EAF5F0] text-[#16805D] font-semibold">
                      {daftarPengolah.length} pengolah
                    </span>
                  </div>
                  {daftarPengolah.length === 0 ? (
                    <p className="text-xs text-[#66736C] mt-2">Belum ada mitra pengolah terverifikasi untuk jalur ini.</p>
                  ) : (
                    <ul className="flex flex-wrap gap-2 mt-2">
                      {daftarPengolah.map((mitra) => (
                        <li key={mitra.id} className="px-2.5 py-1 rounded-lg border border-[#E5EAE7] text-xs text-[#17231D]">
                          {mitra.nama}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* 5. Parameter verifikasi */}
      <section className="rounded-2xl bg-white border border-[#E5EAE7] shadow-xs p-6">
        <form onSubmit={handleSimpanParameter} noValidate className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-[#17231D]">Parameter verifikasi</h2>
              <p className="text-xs text-[#66736C] mt-0.5">Batas toleransi timbang manual dan waktu tinjau batch.</p>
            </div>
            <button
              type="submit"
              className="bg-[#176B4D] hover:bg-[#104D38] text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors cursor-pointer shrink-0">
              Simpan Perubahan
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label htmlFor="param-toleransi" className="text-xs font-semibold text-[#17231D]">
                Toleransi selisih berat (kg)
              </label>
              <input
                id="param-toleransi"
                type="text"
                inputMode="decimal"
                value={formParameter.toleransiSelisihKg}
                onChange={(e) => ubahParameter('toleransiSelisihKg', e.target.value)}
                className="mt-1 w-full px-3 py-2 bg-[#F4F6F5] text-sm text-[#17231D] rounded-xl border border-[#E5EAE7] focus:outline-none focus:ring-2 focus:ring-[#176B4D]"
              />
              {tampilkanErrorParameter && errorParameter.toleransiSelisihKg ? (
                <p role="alert" className="text-xs text-[#C2413B] mt-1">{errorParameter.toleransiSelisihKg}</p>
              ) : (
                <p className="text-[11px] text-[#66736C] mt-1">
                  Selisih timbang di atas angka ini ditandai &quot;Melebihi toleransi&quot; di halaman Laporan.
                </p>
              )}
            </div>

            <div>
              <label htmlFor="param-waktu" className="text-xs font-semibold text-[#17231D]">
                Maksimal waktu tinjau batch (jam)
              </label>
              <input
                id="param-waktu"
                type="text"
                inputMode="numeric"
                value={formParameter.maksWaktuTinjauJam}
                onChange={(e) => ubahParameter('maksWaktuTinjauJam', e.target.value)}
                className="mt-1 w-full px-3 py-2 bg-[#F4F6F5] text-sm text-[#17231D] rounded-xl border border-[#E5EAE7] focus:outline-none focus:ring-2 focus:ring-[#176B4D]"
              />
              {tampilkanErrorParameter && errorParameter.maksWaktuTinjauJam ? (
                <p role="alert" className="text-xs text-[#C2413B] mt-1">{errorParameter.maksWaktuTinjauJam}</p>
              ) : (
                <p className="text-[11px] text-[#66736C] mt-1">
                  Batas waktu admin meninjau batch baru (dipakai untuk pengingat setelah backend tersedia).
                </p>
              )}
            </div>

            <div>
              <label htmlFor="param-satuan" className="text-xs font-semibold text-[#17231D]">
                Satuan pengukuran
              </label>
              <input
                id="param-satuan"
                type="text"
                value="Kilogram (kg)"
                disabled
                className="mt-1 w-full px-3 py-2 bg-[#F4F6F5] text-sm text-[#66736C] rounded-xl border border-[#E5EAE7] cursor-not-allowed"
              />
              <p className="text-[11px] text-[#66736C] mt-1">Satuan dikunci agar semua laporan bisa dibandingkan.</p>
            </div>
          </div>
        </form>
      </section>

      {/* 6. Catatan */}
      <aside className="p-4 rounded-2xl bg-[#F4F6F5] border border-[#E5EAE7] flex items-start gap-3 text-xs text-[#66736C]">
        <Info className="w-4 h-4 text-[#176B4D] shrink-0 mt-0.5" aria-hidden="true" />
        <p>Kelayakan material ditentukan oleh mitra pengolah, bukan oleh aplikasi.</p>
      </aside>
    </div>
  );
}