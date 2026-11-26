'use client';

import { useState } from 'react';
import { Layers, GitFork, Scale, Package, Plus, Sprout, Archive, Utensils, Bug, Pencil, Info } from 'lucide-react';
import Toast from '@/components/ui/Toast';
import ModalKategori from '@/components/pengaturan/ModalKategori';
import Kartu from '@/components/ui/Kartu';
import KepalaHalaman from '@/components/ui/KepalaHalaman';
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
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ${
        active ? 'bg-brand' : 'bg-garis'
      }`}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
          active ? 'translate-x-5' : 'translate-x-0'
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

      {/* Judul halaman */}
      <KepalaHalaman
        judul="Pengaturan Master Data"
        deskripsi="Kelola kategori material, jalur pemanfaatan, dan parameter verifikasi yang dipakai di seluruh aplikasi."
        className="pb-1"
      />

      {/* Kartu ringkasan (dihitung dari state) */}
      <section aria-label="Ringkasan pengaturan" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Kartu as="article" className="p-4">
          <div className="flex items-center justify-between text-xs text-teks-redup">
            <span>Kategori aktif</span>
            <Layers className="w-4 h-4" aria-hidden="true" />
          </div>
          <p className="text-2xl font-bold text-teks mt-1">
            {jumlahKategoriAktif}{' '}
            <span className="text-xs font-medium text-teks-redup">dari {kategoriMaterial.length} kategori</span>
          </p>
        </Kartu>
        <Kartu as="article" className="p-4">
          <div className="flex items-center justify-between text-xs text-teks-redup">
            <span>Jalur aktif</span>
            <GitFork className="w-4 h-4" aria-hidden="true" />
          </div>
          <p className="text-2xl font-bold text-teks mt-1">
            {jumlahJalurAktif}{' '}
            <span className="text-xs font-medium text-teks-redup">dari {jalurPemanfaatan.length} jalur</span>
          </p>
        </Kartu>
        <Kartu as="article" className="p-4">
          <div className="flex items-center justify-between text-xs text-teks-redup">
            <span>Toleransi selisih</span>
            <Scale className="w-4 h-4" aria-hidden="true" />
          </div>
          <p className="text-2xl font-bold text-teks mt-1">{formatKg(parameterVerifikasi.toleransiSelisihKg)}</p>
        </Kartu>
        <Kartu as="article" className="p-4">
          <div className="flex items-center justify-between text-xs text-teks-redup">
            <span>Satuan baku</span>
            <Package className="w-4 h-4" aria-hidden="true" />
          </div>
          <p className="text-2xl font-bold text-teks mt-1">
            Kilogram <span className="text-xs font-medium text-teks-redup">(kg)</span>
          </p>
        </Kartu>
      </section>

      {/* Tabel kategori material */}
      <Kartu as="section" className="overflow-hidden">
        <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-teks">Kategori material organik</h2>
            <p className="text-xs text-teks-redup mt-0.5">
              Kategori nonaktif tidak bisa dipilih untuk batch baru; batch lama tetap memakai kategorinya.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setModalKategori('tambah')}
            className="inline-flex items-center gap-1.5 bg-brand hover:bg-brand-tua text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>Tambah Kategori</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-latar-redup text-teks-redup">
              <tr>
                <th scope="col" className="py-3 pl-6 font-medium">
                  Ikon
                </th>
                <th scope="col" className="py-3 font-medium">
                  Nama Kategori
                </th>
                <th scope="col" className="py-3 font-medium">
                  Contoh Residu &amp; Kriteria
                </th>
                <th scope="col" className="py-3 font-medium">
                  Status
                </th>
                <th scope="col" className="py-3 pr-6 font-medium text-right">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-garis/60">
              {kategoriMaterial.map((kategori, index) => {
                const Ikon = IKON_KATEGORI[index % IKON_KATEGORI.length];
                return (
                  <tr key={kategori.id} className={kategori.aktif ? '' : 'bg-latar-redup/50'}>
                    <td className="py-4 pl-6">
                      <div className="w-9 h-9 rounded-xl border border-garis bg-latar-redup flex items-center justify-center text-brand">
                        <Ikon className="w-4 h-4" aria-hidden="true" />
                      </div>
                    </td>
                    <td className="py-4">
                      <p className="text-sm font-semibold text-teks">{kategori.nama}</p>
                      <p className="text-[11px] font-mono text-teks-redup mt-0.5">Kode: {kategori.id}</p>
                    </td>
                    <td className="py-4 max-w-sm">
                      <p className="text-teks">{kategori.contoh}</p>
                      {kategori.kriteria.length > 0 && (
                        <ul className="flex flex-wrap gap-1.5 mt-1.5">
                          {kategori.kriteria.map((kriteria) => (
                            <li
                              key={kriteria}
                              className="px-2 py-0.5 rounded border border-garis bg-latar-redup text-[11px] font-medium text-teks-redup"
                            >
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
                        <span className="font-semibold text-teks">{kategori.aktif ? 'Aktif' : 'Nonaktif'}</span>
                      </div>
                    </td>
                    <td className="py-4 pr-6 text-right">
                      <button
                        type="button"
                        onClick={() => setModalKategori(kategori)}
                        aria-label={`Ubah kategori ${kategori.nama}`}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-garis text-teks-redup hover:bg-latar-redup hover:text-teks cursor-pointer"
                      >
                        <Pencil className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Kartu>

      {/* Kartu jalur pemanfaatan */}
      <Kartu as="section" className="p-6 space-y-5">
        <div>
          <h2 className="text-base font-bold text-teks">Jalur pemanfaatan</h2>
          <p className="text-xs text-teks-redup mt-0.5">
            Batch hanya bisa ditawarkan ke mitra pengolah terverifikasi pada jalur yang sama. Minimal satu jalur harus
            tetap aktif.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jalurPemanfaatan.map((jalur, index) => {
            const Ikon = IKON_JALUR[index % IKON_JALUR.length];
            const daftarPengolah = pengolahUntukJalur(daftarMitra, jalur.id);
            return (
              <article
                key={jalur.id}
                className={`p-5 rounded-2xl border border-garis space-y-4 ${jalur.aktif ? 'bg-white' : 'bg-latar-redup/60'}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-brand-muda text-brand flex items-center justify-center">
                      <Ikon className="w-4 h-4" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-teks">{jalur.nama}</h3>
                      <p className="text-[11px] font-mono text-teks-redup">ID: {jalur.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-teks">{jalur.aktif ? 'Aktif' : 'Nonaktif'}</span>
                    <ToggleSwitch
                      active={jalur.aktif}
                      onToggle={() => handleToggleJalur(jalur)}
                      ariaLabel={`Status jalur ${jalur.nama}`}
                    />
                  </div>
                </div>

                <p className="text-xs text-teks-redup">{jalur.deskripsi}</p>

                <div className="p-3 rounded-xl bg-latar-redup text-xs">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-teks-redup">Material diterima</p>
                  <p className="text-teks mt-1">{jalur.materialDiterima}</p>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-teks-redup">Mitra pengolah terverifikasi</span>
                    <span className="px-2 py-0.5 rounded-full bg-sukses-muda text-sukses font-semibold">
                      {daftarPengolah.length} pengolah
                    </span>
                  </div>
                  {daftarPengolah.length === 0 ? (
                    <p className="text-xs text-teks-redup mt-2">
                      Belum ada mitra pengolah terverifikasi untuk jalur ini.
                    </p>
                  ) : (
                    <ul className="flex flex-wrap gap-2 mt-2">
                      {daftarPengolah.map((mitra) => (
                        <li key={mitra.id} className="px-2.5 py-1 rounded-lg border border-garis text-xs text-teks">
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
      </Kartu>

      {/* Form parameter verifikasi */}
      <Kartu as="section" className="p-6">
        <form onSubmit={handleSimpanParameter} noValidate className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-teks">Parameter verifikasi</h2>
              <p className="text-xs text-teks-redup mt-0.5">Batas toleransi timbang manual dan waktu tinjau batch.</p>
            </div>
            <button
              type="submit"
              className="bg-brand hover:bg-brand-tua text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors cursor-pointer shrink-0"
            >
              Simpan Perubahan
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label htmlFor="param-toleransi" className="text-xs font-semibold text-teks">
                Toleransi selisih berat (kg)
              </label>
              <input
                id="param-toleransi"
                type="text"
                inputMode="decimal"
                value={formParameter.toleransiSelisihKg}
                onChange={(e) => ubahParameter('toleransiSelisihKg', e.target.value)}
                className="mt-1 w-full px-3 py-2 bg-latar-redup text-sm text-teks rounded-xl border border-garis focus:outline-none focus:ring-2 focus:ring-brand"
              />
              {tampilkanErrorParameter && errorParameter.toleransiSelisihKg ? (
                <p role="alert" className="text-xs text-bahaya mt-1">
                  {errorParameter.toleransiSelisihKg}
                </p>
              ) : (
                <p className="text-[11px] text-teks-redup mt-1">
                  Selisih timbang di atas angka ini ditandai &quot;Melebihi toleransi&quot; di halaman Laporan.
                </p>
              )}
            </div>

            <div>
              <label htmlFor="param-waktu" className="text-xs font-semibold text-teks">
                Maksimal waktu tinjau batch (jam)
              </label>
              <input
                id="param-waktu"
                type="text"
                inputMode="numeric"
                value={formParameter.maksWaktuTinjauJam}
                onChange={(e) => ubahParameter('maksWaktuTinjauJam', e.target.value)}
                className="mt-1 w-full px-3 py-2 bg-latar-redup text-sm text-teks rounded-xl border border-garis focus:outline-none focus:ring-2 focus:ring-brand"
              />
              {tampilkanErrorParameter && errorParameter.maksWaktuTinjauJam ? (
                <p role="alert" className="text-xs text-bahaya mt-1">
                  {errorParameter.maksWaktuTinjauJam}
                </p>
              ) : (
                <p className="text-[11px] text-teks-redup mt-1">
                  Batas waktu admin meninjau batch baru (dipakai untuk pengingat setelah backend tersedia).
                </p>
              )}
            </div>

            <div>
              <label htmlFor="param-satuan" className="text-xs font-semibold text-teks">
                Satuan pengukuran
              </label>
              <input
                id="param-satuan"
                type="text"
                value="Kilogram (kg)"
                disabled
                className="mt-1 w-full px-3 py-2 bg-latar-redup text-sm text-teks-redup rounded-xl border border-garis cursor-not-allowed"
              />
              <p className="text-[11px] text-teks-redup mt-1">Satuan dikunci agar semua laporan bisa dibandingkan.</p>
            </div>
          </div>
        </form>
      </Kartu>

      {/* Catatan peran aplikasi */}
      <aside className="p-4 rounded-2xl bg-latar-redup border border-garis flex items-start gap-3 text-xs text-teks-redup">
        <Info className="w-4 h-4 text-brand shrink-0 mt-0.5" aria-hidden="true" />
        <p>Kelayakan material ditentukan oleh mitra pengolah, bukan oleh aplikasi.</p>
      </aside>
    </div>
  );
}
