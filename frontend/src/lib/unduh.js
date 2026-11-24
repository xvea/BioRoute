/**
 * Mengunduh teks CSV sebagai file.
 * BOM (\uFEFF) di awal file memberi tahu Excel bahwa isinya UTF-8, supaya huruf seperti "–" atau "é" tidak berubah jadi simbol aneh.
 */
export function unduhCsv(namaFile, teksCsv) {
  const berkas = new Blob(['\uFEFF' + teksCsv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(berkas);

  // Tautan sementara yang diklik lewat kode, lalu dibuang lagi.
  const tautan = document.createElement('a');
  tautan.href = url;
  tautan.download = namaFile;
  document.body.appendChild(tautan);
  tautan.click();
  tautan.remove();

  // Lepaskan memori Blob setelah browser sempat memulai unduhan.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}