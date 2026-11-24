import { JALUR } from '@/lib/constants';

export default function RouteBadge({ jalur }) {
  const isKompos = jalur === JALUR.KOMPOS;

  return (
    <span
      className={`inline-flex items-center whitespace-nowrap px-2 py-0.5 rounded-full text-xs font-semibold border ${
        isKompos ? 'bg-[#EAF5F0] text-[#16805D] border-[#16805D]/15' : 'bg-[#EFF6FF] text-[#2563EB] border-[#2563EB]/15'
      }`}
    >
      {jalur}
    </span>
  );
}
