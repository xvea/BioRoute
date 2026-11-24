import { useSyncExternalStore } from 'react';

// Tidak ada data luar yang perlu dipantau, jadi fungsi berlangganannya kosong.
const emptySubscribe = () => () => {};

/**
 * true hanya di browser, false saat halaman dirender di server. Dipakai untuk menunda grafik recharts yang butuh ukuran layar.
 */
export default function useIsMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}