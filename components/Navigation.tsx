'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Menu, 
  X, 
  User, 
  FlaskConical, 
  FileText, 
  CheckCircle2, 
  BookmarkCheck, 
  Settings, 
  Languages, 
  LogOut, 
  Shield, 
  ChevronRight 
} from 'lucide-react';
import { getCurrentOperator, logoutCurrentOperator } from '@/lib/supabase/client';
import { OperatorProfile } from '@/types';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export const Navigation: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { language, toggleLanguage, t } = useLanguage();
  const [operator, setOperator] = useState<OperatorProfile | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    async function loadOp() {
      const op = await getCurrentOperator();
      setOperator(op);
    }
    loadOp();
  }, [pathname]);

  const handleLogout = async () => {
    await logoutCurrentOperator();
    setOperator(null);
    setDrawerOpen(false);
    router.push('/login');
  };

  const drawerMenuItems = [
    { href: '/profile', label: t.navProfile, icon: User },
    { href: '/select-kit', label: t.navNewTest, icon: FlaskConical },
    { href: '/history', label: t.navHistory, icon: FileText },
    { href: '/verify', label: t.navVerify, icon: CheckCircle2 },
    { href: '/history?saved=true', label: t.navSavedRecords, icon: BookmarkCheck },
    { href: '/profile', label: t.navSettings, icon: Settings },
  ];

  const isLoginPage = pathname === '/login';

  return (
    <>
      <header className="bg-[#0B1F3A] border-b-2 border-[#FF9933] text-white sticky top-0 z-40 shadow-lg shadow-[#0B1F3A]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            
            {/* Left: Upper-Left Hamburger & Branding */}
            <div className="flex items-center gap-3">
              {/* ☰ Hamburger Button */}
              {!isLoginPage && (
                <button
                  type="button"
                  onClick={() => setDrawerOpen(true)}
                  aria-label={t.navMenu}
                  className="p-2 rounded-xl text-slate-200 hover:text-white hover:bg-white/10 transition cursor-pointer flex items-center justify-center"
                >
                  <Menu className="w-6 h-6" />
                </button>
              )}

              {/* Emblem & App Title */}
              <Link href="/dashboard" className="flex items-center gap-2.5 sm:gap-3 group">
                <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full ring-2 ring-[#FF9933] ring-offset-2 ring-offset-[#0B1F3A] overflow-hidden bg-[#0B1F3A] shrink-0 shadow-md group-hover:scale-105 transition-transform">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src="/e-jaanch-emblem.jpg" 
                    alt="E-Jaanch Police Emblem" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-lg sm:text-2xl tracking-tight text-white">
                      {t.appName}
                    </span>
                    <span className="text-[10px] uppercase font-mono font-bold tracking-widest px-2 py-0.5 rounded-full bg-[#FF9933] text-[#0B1F3A] shadow-xs">
                      POLICE
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-[#FFB077] font-medium tracking-wide uppercase line-clamp-1">
                    {t.appSubtitle}
                  </p>
                </div>
              </Link>
            </div>

            {/* Right: Quick Language Toggle & Operator Status */}
            <div className="flex items-center gap-2 sm:gap-3">
              
              {/* Bilingual Language Switcher [ EN | हिंदी ] */}
              <button
                type="button"
                onClick={toggleLanguage}
                title={language === 'en' ? 'हिंदी में बदलें' : 'Switch to English'}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold tracking-wider text-amber-200 transition cursor-pointer shadow-xs"
              >
                <Languages className="w-3.5 h-3.5 text-[#FF9933]" />
                <span className={language === 'en' ? 'font-bold text-white' : 'text-slate-400'}>EN</span>
                <span className="text-slate-400">|</span>
                <span className={language === 'hi' ? 'font-bold text-white' : 'text-slate-400'}>हिंदी</span>
              </button>

              {/* Operator info (desktop) */}
              {operator ? (
                <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-slate-700">
                  <div className="text-right">
                    <div className="text-xs font-bold text-white flex items-center gap-1.5 justify-end">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span className="font-mono text-amber-300">{operator.operator_id}</span>
                    </div>
                    <div className="text-[11px] text-slate-300 truncate max-w-[140px]">
                      {operator.operator_name || operator.full_name}
                    </div>
                  </div>
                  <Link
                    href="/profile"
                    title={t.navProfile}
                    className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition"
                  >
                    <User className="w-4 h-4" />
                  </Link>
                </div>
              ) : !isLoginPage ? (
                <Link
                  href="/login"
                  className="text-xs font-bold px-3.5 py-2 rounded-xl bg-[#FF9933] hover:bg-[#e68a2e] text-[#0B1F3A] shadow-md transition"
                >
                  Login
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      {/* Backdrop for Navigation Drawer */}
      {drawerOpen && (
        <div
          onClick={() => setDrawerOpen(false)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
        />
      )}

      {/* Slide-out Navigation Drawer from Upper-Left */}
      <div
        className={`fixed top-0 left-0 bottom-0 z-50 w-72 sm:w-80 bg-[#0B1F3A] text-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${
          drawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-slate-700 flex items-center justify-between bg-[#071527]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-[#FF9933]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/e-jaanch-emblem.jpg" alt="Emblem" className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="font-black text-lg tracking-tight text-white">{t.appName}</h2>
              <p className="text-[10px] text-[#FF9933] font-mono font-semibold uppercase">{t.navMenu}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            className="p-2 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Active Operator Banner in Drawer */}
        {operator && (
          <Link
            href="/profile"
            onClick={() => setDrawerOpen(false)}
            className="p-4 bg-slate-900/60 border-b border-slate-800 hover:bg-slate-900 transition block"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#FF9933]/20 border border-[#FF9933] flex items-center justify-center text-[#FF9933] font-bold text-sm">
                  {(operator.operator_name || operator.full_name || 'O').charAt(0)}
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span className="font-mono text-amber-300">{operator.operator_id}</span>
                  </div>
                  <div className="text-xs text-slate-300 font-medium">
                    {operator.operator_name || operator.full_name}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </Link>
        )}

        {/* Drawer Menu Items */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1.5">
          <Link
            href="/dashboard"
            onClick={() => setDrawerOpen(false)}
            className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition ${
              pathname === '/dashboard'
                ? 'bg-[#FF9933] text-[#0B1F3A] shadow-md'
                : 'text-slate-200 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>{t.navDashboard}</span>
          </Link>

          {drawerMenuItems.map(item => {
            const Icon = item.icon;
            const currentSearch = typeof window !== 'undefined' ? window.location.search : '';
            const isActive = pathname === item.href || (item.href.includes('?') && pathname + currentSearch === item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setDrawerOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition ${
                  isActive
                    ? 'bg-[#FF9933] text-[#0B1F3A] shadow-md'
                    : 'text-slate-200 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}

          {/* Language Switch inside Drawer */}
          <div className="pt-3 mt-3 border-t border-slate-700">
            <div className="px-3.5 py-2 text-xs font-mono uppercase text-slate-400 font-semibold tracking-wider">
              {t.navLanguage}
            </div>
            <div className="grid grid-cols-2 gap-2 px-2">
              <button
                type="button"
                onClick={() => { toggleLanguage(); }}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  language === 'en'
                    ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => { toggleLanguage(); }}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  language === 'hi'
                    ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                हिंदी
              </button>
            </div>
          </div>
        </nav>

        {/* Drawer Footer with Logout */}
        <div className="p-4 border-t border-slate-800 bg-[#071527]">
          {operator ? (
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-rose-300 hover:bg-rose-950/40 border border-rose-800/40 transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>{t.navLogout}</span>
            </button>
          ) : (
            <Link
              href="/login"
              onClick={() => setDrawerOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold bg-[#FF9933] text-[#0B1F3A] hover:bg-[#e68a2e] transition"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </>
  );
};
