import { JALUR } from '@/lib/constants';

export default function RouteBadge({ jalur }) {
  const isKompos = jalur === JALUR.KOMPOS;

  return (
    <span
      className={`inline-flex items-center whitespace-nowrap px-2 py-0.5 rounded-full text-xs font-semibold border ${
        isKompos ? 'bg-sukses-muda text-sukses border-sukses/15' : 'bg-info-muda text-info border-info/15'
      }`}
    >
      {jalur}
    </span>
  );
}
