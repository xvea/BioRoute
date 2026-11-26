/**
 * Kepala halaman admin: judul, deskripsi singkat, dan aksi opsional di kanan (tombol atau kartu ringkasan).
 */
export default function KepalaHalaman({ judul, deskripsi, aksi, className = '' }) {
  return (
    <section className={`flex flex-col md:flex-row md:items-center justify-between gap-4 ${className}`}>
      <div>
        <h1 className="text-2xl font-bold text-teks tracking-tight">{judul}</h1>
        {deskripsi && <p className="text-sm text-teks-redup mt-1">{deskripsi}</p>}
      </div>
      {aksi}
    </section>
  );
}
