import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';

const GAYA_TOAST = {
  success: {
    kotak: 'bg-[#EAF5F0] border-[#16805D]/20 text-[#16805D]',
    Ikon: CheckCircle2,
  },
  warning: {
    kotak: 'bg-amber-50 border-amber-200 text-[#B7791F]',
    Ikon: Info,
  },
  error: {
    kotak: 'bg-[#FEE2E2] border-[#C2413B]/20 text-[#C2413B]',
    Ikon: AlertTriangle,
  },
};

export default function Toast({ toast }) {
  if (!toast) return null;
  const { kotak, Ikon } = GAYA_TOAST[toast.type] ?? GAYA_TOAST.success;
  
  return (
    <aside
      role="status"
      aria-live="polite"
      className={`fixed bottom-6 right-6 z-50 p-4 rounded-xl shadow-xl border flex items-center gap-3 text-xs font-medium max-w-md animate-fade-in ${kotak}`}
    >
      <Ikon className="w-5 h-5 shrink-0" aria-hidden="true" />
      <span className="leading-snug">{toast.message}</span>
    </aside>
  );
}