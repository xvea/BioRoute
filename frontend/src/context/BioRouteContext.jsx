'use client';

import { createContext, useContext, useReducer } from 'react';
import { bioRouteReducer, stateAwal } from '@/context/BioRouteReducer';

// Context = "papan pengumuman" bersama: semua halaman di dalam Provider bisa membaca
// state dan memanggil dispatch tanpa harus mengoper props satu per satu.
const BioRouteContext = createContext(null);

/**
 * Pembungkus yang menyimpan state BioRoute (lewat useReducer) dan membagikannya ke semua komponen di dalamnya.
 */
export function BioRouteProvider({ children }) {
  const [state, dispatch] = useReducer(bioRouteReducer, stateAwal);

  return <BioRouteContext value={{ state, dispatch }}>{children}</BioRouteContext>;
}

/**
 * Hook untuk mengambil { state, dispatch } dari Context. Contoh: const { state, dispatch } = useBioRoute();
 */
export function useBioRoute() {
  const nilai = useContext(BioRouteContext);
  // null berarti komponen dipakai di luar <BioRouteProvider>
  if (!nilai) {
    throw new Error('useBioRoute harus dipakai di dalam <BioRouteProvider>');
  }
  return nilai;
}