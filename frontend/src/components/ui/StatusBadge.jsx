import { STATUS_BATCH, STATUS_VERIFIKASI } from '@/lib/constants';

// Warna setiap status batch.
const GAYA_STATUS = {
  [STATUS_BATCH.DIAJUKAN]: 'bg-latar-redup text-teks border-garis',
  [STATUS_BATCH.PERLU_REVISI]: 'bg-peringatan-muda text-peringatan border-peringatan/20',
  [STATUS_BATCH.TERSEDIA]: 'bg-sukses-muda text-sukses border-sukses/20',
  [STATUS_BATCH.DIJADWALKAN]: 'bg-info-muda text-info border-info/20',
  [STATUS_BATCH.DITERIMA]: 'bg-sukses-muda text-sukses border-sukses/20',
  [STATUS_BATCH.DIPROSES]: 'bg-aksen-muda text-aksen-tua border-aksen',
  [STATUS_BATCH.SELESAI]: 'bg-brand-tua text-white border-brand-tua',
  [STATUS_BATCH.DITOLAK]: 'bg-bahaya-muda text-bahaya border-bahaya/20',
  // Status verifikasi mitra ('Ditolak' sudah ada di atas, warnanya sama)
  [STATUS_VERIFIKASI.MENUNGGU]: 'bg-peringatan-muda text-peringatan border-peringatan/20',
  [STATUS_VERIFIKASI.TERVERIFIKASI]: 'bg-sukses-muda text-sukses border-sukses/20',
};
const GAYA_DEFAULT = 'bg-latar-redup text-teks-redup border-garis';

export default function StatusBadge({ status }) {
  const gaya = GAYA_STATUS[status] ?? GAYA_DEFAULT;

  return (
    <span
      className={`inline-flex items-center whitespace-nowrap px-2.5 py-0.5 rounded-full text-xs font-medium border ${gaya}`}
    >
      {status}
    </span>
  );
}
