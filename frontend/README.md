# BioRoute — Web Admin

Aplikasi web untuk **Admin** BioRoute: sistem pencatatan dan penyaluran residu pangan organik dari **Mitra Sumber** ke **Mitra Pengolah** untuk jalur **Kompos** dan **BSF / Maggot**. Mitra memakai aplikasi mobile (folder `mobile/`); web ini hanya untuk admin.

Dibuat dengan **Next.js 16** (App Router), **React 19**, **Tailwind CSS 4**, recharts, dan lucide-react. Unit test memakai **Vitest**, format kode memakai **Prettier**.

## Halaman

| Rute          | Halaman          | Isi                                                                                                        |
| ------------- | ---------------- | ---------------------------------------------------------------------------------------------------------- |
| `/login`      | Login admin      | Masuk dengan akun demo (lihat di bawah)                                                                    |
| `/dashboard`  | Dashboard        | Ringkasan berat, batch aktif, grafik per minggu, batch terbaru (Detail) dan mitra yang perlu ditinjau      |
| `/verifikasi` | Verifikasi Mitra | Tab Menunggu / Terverifikasi / Ditolak, cari, urutkan, verifikasi atau tolak (wajib alasan)                |
| `/batch`      | Batch Material   | Filter, pagination, detail batch, setujui & tawarkan ke pengolah, minta revisi, tolak, **Ekspor CSV**      |
| `/laporan`    | Laporan          | Berat per kategori, selisih berat vs toleransi, rekap kinerja mitra, **Unduh CSV** dan **Unduh PDF**       |
| `/pengaturan` | Pengaturan       | Kategori material (tambah, ubah, aktif/nonaktif), jalur pemanfaatan, toleransi selisih berat, waktu tinjau |

Alamat `/batch?kode=BR-2611-007` dan `/verifikasi?id=MTR-005` langsung membuka batch atau mitra tersebut (dipakai tombol Detail dan Tinjau di Dashboard).

## Menjalankan

Prasyarat:

- **Node.js 22.12 atau lebih baru** (dibutuhkan Vitest 5)
- **pnpm** (versi proyek tercatat di `packageManager` pada `package.json`)

```bash
cd frontend
pnpm install
pnpm dev
```

Buka http://localhost:3000, lalu masuk dengan akun demo:

| Email / username                 | Kata sandi |
| -------------------------------- | ---------- |
| `admin@bioroute.id` atau `admin` | `admin123` |

Sudah pernah `pnpm install` sebelum Vitest dan Prettier dipasang? Jalankan `pnpm install` sekali lagi.

## Skrip

| Perintah            | Fungsi                                                                      |
| ------------------- | --------------------------------------------------------------------------- |
| `pnpm dev`          | Menjalankan server pengembangan di http://localhost:3000                    |
| `pnpm build`        | Membuat versi produksi (sekaligus mengecek error build)                     |
| `pnpm start`        | Menjalankan hasil `pnpm build`                                              |
| `pnpm lint`         | Mengecek kode dengan ESLint                                                 |
| `pnpm test --run`   | Menjalankan semua unit test sekali                                          |
| `pnpm test`         | Unit test mode pantau (berjalan ulang saat file disimpan; `q` untuk keluar) |
| `pnpm format`       | Merapikan semua file dengan Prettier                                        |
| `pnpm format:check` | Mengecek format tanpa mengubah file                                         |

Sebelum commit, biasakan: `pnpm test --run`, `pnpm lint`, dan `pnpm format:check`.

## Unit test

Logika aplikasi dipisah dari tampilan supaya bisa diuji tanpa browser. File test berada di samping file yang diuji (`*.test.js`).

| File                                  | Yang diuji                                                                      |
| ------------------------------------- | ------------------------------------------------------------------------------- |
| `src/lib/format.test.js`              | Format kg, persen, tanggal (WIB)                                                |
| `src/lib/hitung.test.js`              | Total berat, batch aktif, per jalur/minggu/kategori, rekap mitra, selisih berat |
| `src/lib/tabel.test.js`               | Saring batch dan mitra, pagination, `halamanUntuk`                              |
| `src/lib/validasi.test.js`            | Alasan, form kategori, parameter verifikasi                                     |
| `src/lib/csv.test.js`                 | Penyusun CSV (escape koma/kutip, cegah rumus Excel, nama file)                  |
| `src/context/BioRouteReducer.test.js` | Aturan bisnis: keputusan batch, verifikasi mitra, kategori, jalur, parameter    |

Aturan di reducer (misalnya batch hanya boleh ditawarkan ke pengolah terverifikasi dengan jalur yang sama) menjadi acuan aturan bisnis untuk API backend nanti.

## Struktur folder

```
frontend/
├── public/logo.svg
└── src/
    ├── app/
    │   ├── login/page.jsx            ← W0 Login
    │   ├── (main)/layout.jsx         ← sidebar + topbar, BioRouteProvider
    │   ├── (main)/dashboard/         ← W1
    │   ├── (main)/verifikasi/        ← W2
    │   ├── (main)/batch/             ← W3
    │   ├── (main)/laporan/           ← W4
    │   ├── (main)/pengaturan/        ← W5
    │   └── api/auth/login/route.js   ← login demo (cookie JWT)
    ├── components/ui/                ← StatusBadge, RouteBadge, Toast, ErrorState, ModalAlasan
    ├── components/pengaturan/        ← ModalKategori
    ├── context/                      ← BioRouteContext (state bersama) + BioRouteReducer (aksi)
    ├── hooks/                        ← useToast, useIsMounted
    ├── lib/                          ← fungsi murni: format, hitung, tabel, validasi, csv (+ unit test), unduh
    │   └── data/                     ← data contoh: master data, mitra, batch
    └── proxy.js                      ← melindungi halaman admin (harus login)
```

## Batasan sementara (sebelum ada backend)

- **Data masih data contoh** dari `src/lib/data/` dan disimpan di memori browser. Semua perubahan (verifikasi, keputusan batch, pengaturan) **kembali ke awal saat halaman dimuat ulang (F5)**. Pindah halaman lewat sidebar tidak menghapus perubahan.
- **Login masih demo**: satu akun tetap di `src/app/api/auth/login/route.js`. Pilihan "Ingat sesi ini" belum berpengaruh (sesi selalu 24 jam). Akan diganti setelah backend dan database dibuat.
- **CSV** memakai pemisah koma dan UTF-8. Kalau Excel menampilkan semua isi dalam satu kolom (biasanya pada pengaturan wilayah Indonesia), buka lewat **Data → From Text/CSV** dan pilih pemisah **Comma**.
- **Unduh PDF** membuka dialog cetak browser; pilih tujuan **Save as PDF / Simpan sebagai PDF**.

## Alur kerja Git

- Kerjakan di branch fitur (contoh: `web/perbaikan-frontend`), lalu buat Pull Request ke `main`.
- Pesan commit memakai awalan: `feat:`, `fix:`, `test:`, `refactor:`, `style:`, `chore:`, `docs:`. Commit fitur dan commit test dipisah.
