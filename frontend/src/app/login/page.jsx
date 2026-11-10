'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  MapPin,
  Loader2,
  AlertCircle,
  Check,
  ArrowRight,
} from 'lucide-react';

/**
 * Topographical Contour Overlay (Subtle organic background vector)
 */
function TopoContourBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-15"
    >
      <svg
        className="w-full h-full object-cover scale-125"
        viewBox="0 0 500 700"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M-50 120C30 90 120 160 210 130C300 100 370 20 460 60C550 100 620 220 620 220"
          stroke="white"
          strokeWidth="1.2"
        />
        <path
          d="M-40 210C50 170 140 250 240 200C340 150 400 90 490 130C580 170 610 310 610 310"
          stroke="white"
          strokeWidth="1.2"
        />
        <path
          d="M-30 300C70 260 160 330 260 280C360 230 430 180 520 220C610 260 630 400 630 400"
          stroke="white"
          strokeWidth="1.2"
        />
        <path
          d="M-20 400C80 350 180 430 280 370C380 310 450 280 540 310C630 340 650 490 650 490"
          stroke="white"
          strokeWidth="1.2"
        />
        <path
          d="M-10 500C90 440 200 520 300 460C400 400 480 370 560 410C640 450 670 590 670 590"
          stroke="white"
          strokeWidth="1.2"
        />
        <path
          d="M0 600C110 540 220 610 320 560C420 510 510 470 580 520C650 570 690 680 690 680"
          stroke="white"
          strokeWidth="1.2"
        />
      </svg>
    </div>
  );
}

export default function AdminLoginPage() {
  const router = useRouter();

  // Form input state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  // UI interaction states
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Tri-State Network States: 'idle' | 'loading' | 'error' | 'success'
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [authenticatedUser, setAuthenticatedUser] = useState(null);

  /**
   * Handle text and checkbox changes
   */
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear validation error when user begins typing
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }

    // Reset API error alert when user alters credentials
    if (status === 'error') {
      setStatus('idle');
      setErrorMessage('');
    }
  };

  /**
   * Client-side explicit validation
   */
  const validateForm = () => {
    const errors = {};
    const emailTrimmed = formData.email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailTrimmed) {
      errors.email = 'Username atau email admin wajib diisi';
    } else if (emailTrimmed.toLowerCase() !== 'admin' && !emailRegex.test(emailTrimmed)) {
      errors.email = 'Format email tidak valid (contoh: admin atau admin@bioroute.id)';
    }

    if (!formData.password) {
      errors.password = 'Kata sandi wajib diisi';
    } else if (formData.password.length < 6) {
      errors.password = 'Kata sandi minimal 6 karakter';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Submit handler with native fetch API & Tri-State UI handling
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      // Native fetch API invocation
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.email.trim(),
          email: formData.email.trim(),
          password: formData.password,
          rememberMe: formData.rememberMe,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result?.success) {
        throw new Error(result?.message || 'Otentikasi gagal. Periksa kembali kredensial Anda.');
      }

      // Success State
      setStatus('success');
      setAuthenticatedUser(result.user || result.data);

      // Smooth transition to dashboard using Next.js router
      setTimeout(() => {
        router.push('/dashboard');
      }, 700);
    } catch (err) {
      // Error State
      setStatus('error');
      setErrorMessage(
        err?.message || 'Terjadi kesalahan sistem saat menghubungi server otentikasi.'
      );
    }
  };

  /**
   * Interactive Retry Action
   */
  const handleRetry = () => {
    setStatus('idle');
    setErrorMessage('');
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-white font-sans antialiased">
      {/* Centerpiece: Split Two-Column Authentication Card */}
      <section className="max-w-4xl w-full rounded-3xl overflow-hidden border border-[#E5EAE7] shadow-xl grid grid-cols-1 md:grid-cols-2 bg-white">
        
        {/* ========================================================= */}
        {/* LEFT PANEL: BRANDING & OPERATIONAL CONTEXT                */}
        {/* ========================================================= */}
        <article className="relative bg-[#104D38] p-8 sm:p-10 flex flex-col justify-between text-white overflow-hidden min-h-[460px] md:min-h-[580px]">
          {/* Subtle Organic Topographical Contour Vector Overlay */}
          <TopoContourBackground />

          {/* Top Section */}
          <header className="relative z-10">
            {/* Brand Header */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shadow-inner shrink-0">
                <Image
                  src="/logo.svg"
                  alt="BioRoute Logo"
                  width={22}
                  height={22}
                  className="w-5 h-5 object-contain"
                  priority
                />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white leading-tight">
                  BioRoute Admin
                </h1>
                <p className="text-[10px] sm:text-xs font-semibold text-white/70 uppercase tracking-widest mt-0.5">
                  SISTEM AGREGASI MATERIAL ORGANIK
                </p>
              </div>
            </div>

            {/* Main Headline */}
            <h2 className="text-2xl sm:text-3xl font-semibold leading-snug mt-6 text-white tracking-tight">
              Menghubungkan residu organik ke pemanfaatan berikutnya
            </h2>

            {/* Description */}
            <p className="text-sm text-white/80 leading-relaxed mt-4">
              Infrastruktur tata kelola terintegrasi untuk verifikasi mitra sumber, pengawasan alokasi residu, dan validasi batch di Banyumas Raya.
            </p>
          </header>

          {/* Bottom Section */}
          <footer className="relative z-10 mt-8 pt-6 border-t border-white/15">
            {/* Location Identifier */}
            <div className="flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5 text-white/95 font-medium">
                <MapPin className="w-4 h-4 text-[#B7D76A] shrink-0" aria-hidden="true" />
                <span>Hub Operasional Purwokerto</span>
              </div>
              <span className="font-mono text-[11px] bg-white/10 px-2 py-0.5 rounded text-white/90 border border-white/15 tracking-wide">
                Kode: 33.02.PWK
              </span>
            </div>

            {/* 2 Grid Cards / Metrics */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-3.5 mt-4 grid grid-cols-2 gap-3">
              {/* Metric 1 */}
              <div>
                <span className="text-xs text-white/70 block leading-tight">
                  Cakupan Wilayah
                </span>
                <span className="font-bold text-sm text-white block mt-1 leading-tight">
                  27 Kecamatan
                </span>
                <span className="text-[11px] text-white/60 block mt-0.5">
                  Kabupaten Banyumas
                </span>
              </div>

              {/* Metric 2 */}
              <div className="border-l border-white/10 pl-3">
                <span className="text-xs text-white/70 block leading-tight">
                  Tipe Pemrosesan
                </span>
                <span className="font-bold text-sm text-white block mt-1 leading-tight">
                  Kompos &amp; BSF
                </span>
                <span className="text-[11px] text-white/60 block mt-0.5">
                  Fasilitas Terdaftar
                </span>
              </div>
            </div>
          </footer>
        </article>

        {/* ========================================================= */}
        {/* RIGHT PANEL: AUTHENTICATION FORM                          */}
        {/* ========================================================= */}
        <section className="bg-white p-8 sm:p-10 flex flex-col justify-between">
          <div>
            {/* Header: Chip Badge & Titles */}
            <header>
              <div className="inline-flex items-center gap-1.5 bg-[#EAF5F0] text-[#16805D] text-xs font-medium px-3 py-1 rounded-full mb-3">
                <span className="text-xs leading-none">●</span>
                <span>Portal Terotentikasi</span>
              </div>
              <h2 className="text-2xl font-bold text-[#17231D] tracking-tight">
                Masuk sebagai Admin
              </h2>
              <p className="text-xs text-[#66736C] mt-1 mb-6">
                Kelola verifikasi mitra dan alokasi residu organik wilayah Purwokerto
              </p>
            </header>

            {/* Success State View */}
            {status === 'success' ? (
              <div
                role="status"
                className="bg-[#EAF5F0] border border-[#16805D]/20 rounded-2xl p-6 text-center animate-fade-in my-4"
              >
                <div className="w-12 h-12 rounded-full bg-[#16805D] text-white flex items-center justify-center mx-auto mb-3 shadow-sm">
                  <Check className="w-6 h-6 stroke-[2.5]" aria-hidden="true" />
                </div>
                <h3 className="text-base font-bold text-[#17231D]">
                  Otentikasi Berhasil
                </h3>
                <p className="text-xs text-[#66736C] mt-1.5 leading-relaxed">
                  Selamat datang, <strong className="text-[#17231D]">{authenticatedUser?.name}</strong>. Mengarahkan sesi ke panel kendali wilayah Banyumas...
                </p>
                <div className="mt-4 pt-3 border-t border-[#16805D]/15 flex items-center justify-center gap-2 text-xs text-[#16805D] font-medium">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                  <span>Membuka Dashboard Operasional...</span>
                </div>
              </div>
            ) : (
              /* Interactive Form */
              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                
                {/* Robust Error Alert with Interactive Retry */}
                {status === 'error' && (
                  <aside
                    role="alert"
                    aria-live="assertive"
                    className="bg-red-50 border border-red-200 rounded-xl p-3.5 flex items-start justify-between gap-3 text-[#C2413B]"
                  >
                    <div className="flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#C2413B]" aria-hidden="true" />
                      <div className="text-xs leading-relaxed">
                        <strong className="font-semibold block">Gagal Masuk:</strong>
                        <span>{errorMessage}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRetry}
                      className="shrink-0 text-xs font-semibold text-[#C2413B] hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C2413B] rounded px-1.5 py-0.5 cursor-pointer"
                    >
                      Coba Lagi
                    </button>
                  </aside>
                )}

                {/* Email Input Field */}
                <div>
                  <label
                    htmlFor="admin-email"
                    className="text-xs font-semibold text-[#17231D] mb-1.5 block"
                  >
                    Email Admin
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#66736C]">
                      <Mail className="w-4 h-4" aria-hidden="true" />
                    </span>
                    <input
                      id="admin-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="admin@bioroute.id"
                      aria-required="true"
                      aria-invalid={Boolean(validationErrors.email)}
                      aria-describedby={validationErrors.email ? 'email-error' : undefined}
                      className={`w-full pl-9 pr-3.5 py-2.5 bg-[#F4F6F5] text-sm text-[#17231D] placeholder-[#66736C] rounded-xl border transition-all focus:outline-none focus:ring-2 ${
                        validationErrors.email
                          ? 'border-[#C2413B] focus:border-[#C2413B] focus:ring-[#C2413B]'
                          : 'border-[#E5EAE7] focus:border-[#176B4D] focus:ring-[#176B4D]'
                      }`}
                    />
                  </div>
                  {validationErrors.email && (
                    <p
                      id="email-error"
                      role="alert"
                      className="text-xs text-[#C2413B] mt-1.5 flex items-center gap-1 font-medium"
                    >
                      <span>⚠</span>
                      <span>{validationErrors.email}</span>
                    </p>
                  )}
                </div>

                {/* Password Input Field */}
                <div>
                  <label
                    htmlFor="admin-password"
                    className="text-xs font-semibold text-[#17231D] mb-1.5 block"
                  >
                    Kata Sandi
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#66736C]">
                      <Lock className="w-4 h-4" aria-hidden="true" />
                    </span>
                    <input
                      id="admin-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="••••••••"
                      aria-required="true"
                      aria-invalid={Boolean(validationErrors.password)}
                      aria-describedby={
                        validationErrors.password ? 'password-error' : undefined
                      }
                      className={`w-full pl-9 pr-10 py-2.5 bg-[#F4F6F5] text-sm text-[#17231D] placeholder-[#66736C] rounded-xl border transition-all focus:outline-none focus:ring-2 ${
                        validationErrors.password
                          ? 'border-[#C2413B] focus:border-[#C2413B] focus:ring-[#C2413B]'
                          : 'border-[#E5EAE7] focus:border-[#176B4D] focus:ring-[#176B4D]'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#66736C] hover:text-[#17231D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176B4D] rounded-lg transition-colors cursor-pointer"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" aria-hidden="true" />
                      ) : (
                        <Eye className="w-4 h-4" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                  {validationErrors.password && (
                    <p
                      id="password-error"
                      role="alert"
                      className="text-xs text-[#C2413B] mt-1.5 flex items-center gap-1 font-medium"
                    >
                      <span>⚠</span>
                      <span>{validationErrors.password}</span>
                    </p>
                  )}
                </div>

                {/* Helper Row: Remember Me & Forgot Password */}
                <div className="flex items-center justify-between pt-1">
                  <label
                    htmlFor="remember-session"
                    className="inline-flex items-center gap-2 text-xs text-[#17231D] cursor-pointer select-none group"
                  >
                    <input
                      id="remember-session"
                      name="rememberMe"
                      type="checkbox"
                      checked={formData.rememberMe}
                      onChange={handleInputChange}
                      className="w-4 h-4 rounded text-[#176B4D] accent-[#176B4D] border-[#E5EAE7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176B4D] focus-visible:ring-offset-1 cursor-pointer transition-colors"
                    />
                    <span className="group-hover:text-black transition-colors">
                      Ingat sesi ini
                    </span>
                  </label>

                  <a
                    href="#forgot-password"
                    onClick={(e) => {
                      e.preventDefault();
                      alert('Untuk pemulihan akun administrator, hubungi Unit TI DLH Banyumas di hotline operasional.');
                    }}
                    className="text-xs font-medium text-[#176B4D] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176B4D] focus-visible:ring-offset-1 rounded transition-colors"
                  >
                    Lupa kata sandi?
                  </a>
                </div>

                {/* Submit Action Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full flex items-center justify-center gap-2 bg-[#176B4D] hover:bg-[#104D38] active:bg-[#0d3c2b] text-white text-sm font-medium rounded-xl py-3 px-4 shadow-sm hover:shadow transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176B4D] focus-visible:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {status === 'loading' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" aria-hidden="true" />
                        <span>Memverifikasi Kredensial...</span>
                      </>
                    ) : (
                      <>
                        <span>Masuk</span>
                        <ArrowRight className="w-4 h-4" aria-hidden="true" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Footer Notice */}
          <footer className="pt-6 mt-6 border-t border-[#E5EAE7]">
            <p className="text-[11px] font-medium text-[#66736C] text-center">
              Sistem Terkonsolidasi Dinas Lingkungan Hidup &amp; Pengolah Organik Banyumas • v2.4
            </p>
            <p className="text-[10px] text-[#66736C]/80 text-center mt-1">
              Akses terbatas untuk personil verifikasi dan administrator operasional BioRoute.
            </p>
          </footer>
        </section>

      </section>
    </main>
  );
}
