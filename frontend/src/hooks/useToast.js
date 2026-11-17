import { useCallback, useEffect, useRef, useState } from 'react';

// Custom hook untuk notifikasi singkat (toast).
export default function useToast(durasi = 3500) {
    const [toast, setToast] = useState(null);
    const timerRef = useRef(null);

// Hentikan timer toast sebelumnya agar toast baru tidak ikut tertutup lebih cepat.
    const tampilkanToast = useCallback(
        (type, message) => {
            clearTimeout(timerRef.current);
            setToast({ type, message });
            timerRef.current = setTimeout(() => setToast(null), durasi);
        },
        [durasi]
    );

// Bersihkan timer saat halaman ditinggalkan (komponen di-unmount).
    useEffect(() => {
        return () => clearTimeout(timerRef.current);
    }, []);
    
    return { toast, tampilkanToast };
}