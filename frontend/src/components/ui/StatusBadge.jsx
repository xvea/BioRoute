import { STATUS_BATCH, STATUS_VERIFIKASI } from "@/lib/constants";

// Warna setiap status batch.
const GAYA_STATUS = {
  [STATUS_BATCH.DIAJUKAN]: 'bg-[#F4F6F5] text-[#17231D] border-[#E5EAE7]',
  [STATUS_BATCH.PERLU_REVISI]: 'bg-[#FEF3C7] text-[#B7791F] border-[#B7791F]/20',
  [STATUS_BATCH.TERSEDIA]: 'bg-[#EAF5F0] text-[#16805D] border-[#16805D]/20',
  [STATUS_BATCH.DIJADWALKAN]: 'bg-[#EFF6FF] text-[#2563EB] border-[#2563EB]/20',
  [STATUS_BATCH.DITERIMA]: 'bg-[#EAF5F0] text-[#16805D] border-[#16805D]/20',
  [STATUS_BATCH.DIPROSES]: 'bg-[#F3F8E6] text-[#4D6B12] border-[#B7D76A]',
  [STATUS_BATCH.SELESAI]: 'bg-[#104D38] text-white border-[#104D38]',
  [STATUS_BATCH.DITOLAK]: 'bg-[#FEE2E2] text-[#C2413B] border-[#C2413B]/20',
  // Status verifikasi mitra ('Ditolak' sudah ada di atas, warnanya sama)
  [STATUS_VERIFIKASI.MENUNGGU]: 'bg-[#FEF3C7] text-[#B7791F] border-[#B7791F]/20',
  [STATUS_VERIFIKASI.TERVERIFIKASI]: 'bg-[#EAF5F0] text-[#16805D] border-[#16805D]/20',
};
const GAYA_DEFAULT = 'bg-[#F4F6F5] text-[#66736C] border-[#E5EAE7]';

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