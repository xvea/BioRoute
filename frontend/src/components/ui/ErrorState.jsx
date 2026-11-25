import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function ErrorState({ judul, pesan, onRetry }) {
  return (
    <section
      role="alert"
      aria-live="assertive"
      className="max-w-xl mx-auto my-12 p-8 rounded-2xl bg-white border border-bahaya/20 shadow-sm text-center"
    >
      <div className="w-12 h-12 rounded-full bg-bahaya-muda text-bahaya flex items-center justify-center mx-auto mb-4">
        <AlertTriangle className="w-6 h-6" aria-hidden="true" />
      </div>
      <h2 className="text-lg font-bold text-teks">{judul}</h2>
      <p className="text-xs text-teks-redup mt-2 mb-6 leading-relaxed">{pesan}</p>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-2 bg-brand hover:bg-brand-tua text-white px-5 py-2.5 rounded-xl text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand cursor-pointer"
      >
        <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
        <span>Coba Lagi</span>
      </button>
    </section>
  );
}
