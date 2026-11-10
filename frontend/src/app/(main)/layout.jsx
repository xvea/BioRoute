'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutGrid,
  ShieldCheck,
  Package,
  BarChart2,
  Settings,
  LogOut,
  Search,
  Calendar,
  ChevronDown,
  Bell,
  User,
  Menu,
  X,
} from 'lucide-react';

export default function MainLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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
      badge: '3',
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
    <div className="min-h-screen bg-white flex flex-col md:flex-row font-sans text-[#17231D]">
      
      {/* MOBILE HEADER */}
      <div className="md:hidden bg-white border-b border-[#E5EAE7] px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#104D38] flex items-center justify-center p-1.5 shrink-0">
            <Image
              src="/logo.svg"
              alt="BioRoute Logo"
              width={18}
              height={18}
              className="w-4 h-4 object-contain brightness-0 invert"
            />
          </div>
          <span className="font-bold text-base text-[#17231D] tracking-tight">
            BioRoute
          </span>
          <span className="bg-[#F4F6F5] text-[#17231D] text-[10px] font-semibold px-2 py-0.5 rounded border border-[#E5EAE7]">
            Admin
          </span>
        </div>
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
          className="p-2 rounded-xl text-[#66736C] hover:text-[#17231D] hover:bg-[#F4F6F5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176B4D] transition-colors"
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
        className={`fixed md:sticky top-0 left-0 z-50 h-screen w-64 bg-white border-r border-[#E5EAE7] flex flex-col justify-between transition-transform duration-300 ease-in-out md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:shadow-none'
        }`}
      >
        <div className="p-5">
          {/* Brand Header */}
          <div className="flex items-center gap-3 pb-6 border-b border-[#E5EAE7]">
            <div className="w-9 h-9 rounded-xl bg-[#104D38] flex items-center justify-center p-2 shrink-0 shadow-xs">
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
              <span className="font-bold text-lg text-[#17231D] tracking-tight">
                BioRoute
              </span>
              <span className="bg-[#F4F6F5] text-[#17231D] text-xs font-semibold px-2 py-0.5 rounded border border-[#E5EAE7]">
                Admin
              </span>
            </div>
          </div>

          {/* Navigation List */}
          <nav className="mt-6" aria-label="Navigasi Utama">
            <h2 className="text-xs font-semibold text-[#66736C] tracking-wider uppercase mb-2 px-3">
              NAVIGASI OPERASIONAL
            </h2>
            <ul className="space-y-1">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));
                const IconComponent = item.icon;

                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176B4D] ${
                        isActive
                          ? 'bg-[#EAF5F0] text-[#176B4D] font-semibold shadow-xs'
                          : 'text-[#66736C] hover:text-[#17231D] hover:bg-[#F4F6F5]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <IconComponent
                          className={`w-4 h-4 shrink-0 transition-colors ${
                            isActive ? 'text-[#176B4D]' : 'text-[#66736C] group-hover:text-[#17231D]'
                          }`}
                          aria-hidden="true"
                        />
                        <span>{item.name}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-bold leading-none ${item.badgeColor}`}
                        >
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
        <div className="p-4 border-t border-[#E5EAE7] bg-white">
          <div className="flex items-center justify-between p-2 rounded-xl bg-[#F4F6F5] border border-[#E5EAE7]/70">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="bg-[#104D38] text-white font-bold text-xs w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-xs">
                AD
              </div>
              <div className="min-w-0 truncate">
                <p className="text-sm font-semibold text-[#17231D] truncate leading-tight">
                  Admin Banyumas
                </p>
                <p className="text-xs text-[#66736C] truncate mt-0.5">
                  admin@bioroute.id
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              aria-label="Keluar sesi administrator"
              title="Keluar sesi"
              className="p-2 text-[#66736C] hover:text-[#C2413B] hover:bg-white rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C2413B] shrink-0 disabled:opacity-50 cursor-pointer"
            >
              <LogOut className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-[#E5EAE7] px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <nav aria-label="Breadcrumb" className="min-w-0">
            <p className="text-xs text-[#66736C] truncate">
              Ringkasan Sistem / <strong className="font-semibold text-[#17231D]">Console Wilayah</strong>
            </p>
          </nav>

          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block w-52 md:w-64">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#66736C]">
                <Search className="w-4 h-4" aria-hidden="true" />
              </span>
              <input
                type="text"
                placeholder="Cari batch, mitra..."
                aria-label="Cari batch atau mitra"
                className="w-full pl-9 pr-3.5 py-1.5 bg-[#F4F6F5] text-xs text-[#17231D] placeholder-[#66736C] rounded-xl border border-[#E5EAE7] focus:outline-none focus:ring-2 focus:ring-[#176B4D] focus:border-[#176B4D] transition-all"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-[#F4F6F5] border border-[#E5EAE7] px-3 py-1.5 rounded-xl text-xs font-medium text-[#17231D] cursor-pointer hover:bg-[#EAF5F0] transition-colors">
              <Calendar className="w-3.5 h-3.5 text-[#176B4D]" aria-hidden="true" />
              <span>Nov 2026</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#66736C]" aria-hidden="true" />
            </div>

            <button
              type="button"
              aria-label="Notifikasi operasional"
              className="relative p-2 rounded-xl text-[#66736C] hover:text-[#17231D] hover:bg-[#F4F6F5] border border-transparent hover:border-[#E5EAE7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176B4D] transition-colors cursor-pointer"
            >
              <Bell className="w-4 h-4" aria-hidden="true" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#C2413B] rounded-full ring-2 ring-white" />
            </button>

            <div
              className="w-8 h-8 rounded-full bg-[#176B4D]/10 text-[#176B4D] border border-[#176B4D]/20 flex items-center justify-center font-bold text-xs"
              aria-label="Profil Akun"
            >
              <User className="w-4 h-4" aria-hidden="true" />
            </div>
          </div>
        </header>

        {/* Dynamic Page Views */}
        <main className="flex-1 bg-white p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

    </div>
  );
}