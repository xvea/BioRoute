'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutGrid, ShieldCheck, Package, BarChart2, Settings, LogOut, Info, Menu, X } from 'lucide-react';
import { BioRouteProvider, useBioRoute } from '@/context/BioRouteContext';
import { mitraMenunggu } from '@/lib/hitung';

/**
 * Kerangka halaman admin: sidebar, topbar, dan area konten.
 */
function AdminShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // AdminShell berada di dalam <BioRouteProvider>, jadi boleh membaca state bersama.
  const { state } = useBioRoute();
  const jumlahMitraMenunggu = mitraMenunggu(state.daftarMitra).length;

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutGrid,
    },
    {
      name: 'Verifikasi Mitra',
      href: '/verifikasi',
      icon: ShieldCheck,
      badge: jumlahMitraMenunggu,
      badgeColor: 'bg-red-100 text-red-600',
    },
    {
      name: 'Batch Material',
      href: '/batch',
      icon: Package,
    },
    {
      name: 'Laporan',
      href: '/laporan',
      icon: BarChart2,
    },
    {
      name: 'Pengaturan',
      href: '/pengaturan',
      icon: Settings,
    },
  ];

  /**
   * true kalau menu sedang dibuka. Dashboard harus sama persis, menu lain cukup diawali alamatnya.
   */
  const apakahAktif = (href) => pathname === href || (href !== '/dashboard' && pathname?.startsWith(href));

  // Menu yang sedang dibuka, dipakai untuk judul di topbar.
  const menuAktif = navigationItems.find((item) => apakahAktif(item.href));

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await fetch('/api/auth/login', {
        method: 'DELETE',
      });
    } catch (err) {
      console.error('Gagal keluar sesi:', err);
    } finally {
      router.push('/login');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row font-sans text-teks">
      {/* MOBILE HEADER */}
      <div className="print:hidden md:hidden bg-white border-b border-garis px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-brand-tua flex items-center justify-center p-1.5 shrink-0">
            <Image
              src="/logo.svg"
              alt="BioRoute Logo"
              width={18}
              height={18}
              className="w-4 h-4 object-contain brightness-0 invert"
            />
          </div>
          <span className="font-bold text-base text-teks tracking-tight">BioRoute</span>
          <span className="bg-latar-redup text-teks text-[10px] font-semibold px-2 py-0.5 rounded border border-garis">
            Admin
          </span>
        </div>
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
          className="p-2 rounded-xl text-teks-redup hover:text-teks hover:bg-latar-redup focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand transition-colors"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Tutup overlay menu"
          onClick={() => setMobileMenuOpen(false)}
          onKeyDown={(e) => {
            if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
              setMobileMenuOpen(false);
            }
          }}
          className="md:hidden fixed inset-0 bg-black/40 z-40 backdrop-blur-xs transition-opacity cursor-pointer"
        />
      )}

      {/* SIDEBAR NAVIGATION */}
      <aside
        className={`print:hidden fixed md:sticky top-0 left-0 z-50 h-screen w-64 bg-white border-r border-garis flex flex-col justify-between transition-transform duration-300 ease-in-out md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:shadow-none'
        }`}
      >
        <div className="p-5">
          {/* Brand Header */}
          <div className="flex items-center gap-3 pb-6 border-b border-garis">
            <div className="w-9 h-9 rounded-xl bg-brand-tua flex items-center justify-center p-2 shrink-0 shadow-xs">
              <Image
                src="/logo.svg"
                alt="BioRoute Logo"
                width={20}
                height={20}
                className="w-4 h-4 object-contain brightness-0 invert"
                priority
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-teks tracking-tight">BioRoute</span>
              <span className="bg-latar-redup text-teks text-xs font-semibold px-2 py-0.5 rounded border border-garis">
                Admin
              </span>
            </div>
          </div>

          {/* Navigation List */}
          <nav className="mt-6" aria-label="Navigasi Utama">
            <h2 className="text-xs font-semibold text-teks-redup tracking-wider uppercase mb-2 px-3">
              NAVIGASI OPERASIONAL
            </h2>
            <ul className="space-y-1">
              {navigationItems.map((item) => {
                const isActive = apakahAktif(item.href);
                const IconComponent = item.icon;

                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                        isActive
                          ? 'bg-brand-muda text-brand font-semibold shadow-xs'
                          : 'text-teks-redup hover:text-teks hover:bg-latar-redup'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <IconComponent
                          className={`w-4 h-4 shrink-0 transition-colors ${
                            isActive ? 'text-brand' : 'text-teks-redup group-hover:text-teks'
                          }`}
                          aria-hidden="true"
                        />
                        <span>{item.name}</span>
                      </div>
                      {/* > 0 supaya angka 0 tidak ikut tampil */}
                      {item.badge > 0 && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold leading-none ${item.badgeColor}`}>
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        {/* User Card */}
        <div className="p-4 border-t border-garis bg-white">
          <div className="flex items-center justify-between p-2 rounded-xl bg-latar-redup border border-garis/70">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="bg-brand-tua text-white font-bold text-xs w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-xs">
                AD
              </div>
              <div className="min-w-0 truncate">
                <p className="text-sm font-semibold text-teks truncate leading-tight">Admin Banyumas</p>
                <p className="text-xs text-teks-redup truncate mt-0.5">admin@bioroute.id</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              aria-label="Keluar sesi administrator"
              title="Keluar sesi"
              className="p-2 text-teks-redup hover:text-bahaya hover:bg-white rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bahaya shrink-0 disabled:opacity-50 cursor-pointer"
            >
              <LogOut className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        {/* Top Header Bar */}
        <header className="print:hidden sticky top-0 z-30 h-16 bg-white border-b border-garis px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <nav aria-label="Breadcrumb" className="min-w-0">
            <p className="text-xs text-teks-redup truncate">
              BioRoute Admin / <strong className="font-semibold text-teks">{menuAktif?.name}</strong>
            </p>
          </nav>

          {/* Pengingat jujur saat demo: data masih di memori browser, belum ada backend */}
          <p className="hidden sm:inline-flex items-center gap-1.5 bg-latar-redup border border-garis px-3 py-1.5 rounded-xl text-xs text-teks-redup">
            <Info className="w-3.5 h-3.5 text-brand shrink-0" aria-hidden="true" />
            <span>Data contoh · kembali ke awal saat halaman dimuat ulang</span>
          </p>
        </header>

        {/* Dynamic Page Views */}
        <main className="flex-1 bg-white p-4 sm:p-6 lg:p-8">
          {/* Suspense wajib karena halaman Batch & Verifikasi membaca alamat (useSearchParams) */}
          <Suspense>{children}</Suspense>
        </main>
      </div>
    </div>
  );
}

/**
 * Layout utama halaman admin. BioRouteProvider dipasang paling luar supaya
 * AdminShell (sidebar, topbar) dan semua halaman bisa memakai useBioRoute().
 */
export default function MainLayout({ children }) {
  return (
    <BioRouteProvider>
      <AdminShell>{children}</AdminShell>
    </BioRouteProvider>
  );
}
