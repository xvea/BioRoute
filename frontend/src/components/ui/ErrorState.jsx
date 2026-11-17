import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function ErrorState({ judul, pesan, onRetry }) {
  return (
    <section
      role="alert"
      aria-live="assertive"
      className="max-w-xl mx-auto my-12 p-8 rounded-2xl bg-white border border-red-200 shadow-sm text-center"
    >
      <div className="w-12 h-12 rounded-full bg-red-50 text-[#C2413B] flex items-center justify-center mx-auto mb-4">
        <AlertTriangle className="w-6 h-6" aria-hidden="true" />
      </div>
      <h2 className="text-lg font-bold text-[#17231D]">{judul}</h2>
      <p className="text-xs text-[#66736C] mt-2 mb-6 leading-relaxed">{pesan}</p>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-2 bg-[#176B4D] hover:bg-[#104D38] text-white px-5 py-2.5 rounded-xl text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176B4D] cursor-pointer"
      >
        <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
        <span>Coba Lagi</span>
      </button>
    </section>
  );
}