'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shield, MapPin, Award, Building2, User, LogOut, FileText, CheckCircle2 } from 'lucide-react';

export default function Navbar() {
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string; roles: string[] } | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    fetch('/api/v1/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data.user) {
          setCurrentUser(data.data.user);
        }
      })
      .catch(() => {});

    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await fetch('/api/v1/auth/logout', { method: 'POST' });
    setCurrentUser(null);
    window.location.reload();
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b ${
        scrolled ? 'bg-[#F9F8F6]/90 backdrop-blur-md border-[#D1D0CE]/40 py-3 shadow-sm' : 'bg-transparent border-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Brand Logo & Tagline */}
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="w-8 h-8 rounded-sm bg-[#2C2B29] text-[#F9F8F6] flex items-center justify-center font-serif font-bold text-lg">
            W
          </div>
          <div>
            <span className="font-serif text-xl tracking-tight text-[#2C2B29] group-hover:text-[#C28F7B] transition-colors">
              WAY2HUMANITY
            </span>
            <span className="hidden md:inline-block ml-2 text-xs uppercase tracking-widest text-[#42403D] font-sans font-medium">
              / THE TRUST LAYER
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-[#2C2B29]">
          <Link href="/radar" className="flex items-center space-x-1.5 hover:text-[#C28F7B] transition-colors">
            <MapPin className="w-4 h-4 text-[#8A9A86]" />
            <span>Humanity Radar</span>
          </Link>
          <Link href="/helper" className="flex items-center space-x-1.5 hover:text-[#C28F7B] transition-colors">
            <CheckCircle2 className="w-4 h-4 text-[#8A9A86]" />
            <span>Helper Hub</span>
          </Link>
          <Link href="/passport" className="flex items-center space-x-1.5 hover:text-[#C28F7B] transition-colors">
            <Award className="w-4 h-4 text-[#D9A05B]" />
            <span>Passport</span>
          </Link>
          <Link href="/csr" className="flex items-center space-x-1.5 hover:text-[#C28F7B] transition-colors">
            <Building2 className="w-4 h-4 text-[#C28F7B]" />
            <span>CSR Portal</span>
          </Link>
          {(currentUser?.roles?.includes('ADMIN') || currentUser?.roles?.includes('VERIFIER') || currentUser?.roles?.includes('admin') || currentUser?.roles?.includes('verifier')) && (
            <Link href="/admin" className="flex items-center space-x-1.5 hover:text-[#C28F7B] transition-colors">
              <Shield className="w-4 h-4 text-[#42403D]" />
              <span>Operations & Admin</span>
            </Link>
          )}
        </nav>

        {/* Action Buttons & Profile State */}
        <div className="flex items-center space-x-4">
          <Link
            href="/report"
            className="hidden sm:inline-flex items-center px-4 py-2 bg-[#2C2B29] hover:bg-[#1A1A1A] text-[#F9F8F6] text-xs uppercase tracking-wider font-semibold rounded-sm transition-all shadow-sm"
          >
            <FileText className="w-3.5 h-3.5 mr-1.5 text-[#C28F7B]" />
            Report a Need
          </Link>

          {currentUser ? (
            <div className="flex items-center space-x-3 bg-[#E3DCD2]/40 px-3 py-1.5 rounded-sm border border-[#D1D0CE]">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-semibold text-[#2C2B29]">{currentUser.name}</div>
                <div className="text-[10px] text-[#42403D] uppercase tracking-wider">{currentUser.roles[0]}</div>
              </div>
              <button
                onClick={handleLogout}
                title="Sign out"
                className="p-1.5 text-[#2C2B29] hover:text-[#C28F7B] transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                href="/login"
                className="px-3.5 py-1.5 text-xs font-medium text-[#2C2B29] hover:text-[#C28F7B] transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-3.5 py-1.5 border border-[#2C2B29] text-xs font-medium text-[#2C2B29] hover:bg-[#2C2B29] hover:text-[#F9F8F6] transition-all rounded-sm"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
