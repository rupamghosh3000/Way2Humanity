'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { KeyRound, Shield, UserCheck } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (loginEmail?: string, loginPassword?: string) => {
    const targetEmail = loginEmail || email;
    const targetPassword = loginPassword || password;

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail, password: targetPassword }),
      });
      const data = await res.json();
      if (data.success) {
        window.location.href = data.data.user.roles.includes('ADMIN') ? '/admin' : '/';
      } else {
        setErrorMsg(data.error?.message || 'Login failed.');
      }
    } catch {
      setErrorMsg('Login failed. Please check network connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLogin();
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-[#2C2B29]">
      <Navbar />

      <main className="max-w-md mx-auto px-6 pt-36 pb-24 space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs uppercase tracking-widest text-[#C28F7B] font-semibold">Authentication</span>
          <h1 className="font-serif text-3xl font-normal">Sign In to Way2Humanity</h1>
          <p className="text-xs text-[#42403D]">Access your humanitarian passport, missions, or admin portal.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 bg-[#FFFFFF] border border-[#D1D0CE] rounded-sm space-y-5 shadow-sm">
          {errorMsg && (
            <div className="p-3 bg-[#C28F7B]/10 border border-[#C28F7B] text-[#A8715E] text-xs rounded-sm">
              {errorMsg}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wider font-semibold text-[#42403D]">Email Address *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full p-3 bg-[#F4F2ED] border border-[#D1D0CE] rounded-sm text-sm text-[#2C2B29]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wider font-semibold text-[#42403D]">Password *</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full p-3 bg-[#F4F2ED] border border-[#D1D0CE] rounded-sm text-sm text-[#2C2B29]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#2C2B29] hover:bg-[#1A1A1A] text-[#F9F8F6] text-xs uppercase tracking-widest font-semibold rounded-sm transition-all shadow-sm"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>

          {/* Quick Demo Sign-In Buttons */}
          <div className="pt-2 border-t border-[#D1D0CE] space-y-2 text-center">
            <span className="text-[11px] text-[#42403D] uppercase tracking-wider block mb-1 font-medium">
              Demo Quick Sign-In Options:
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleLogin('admin@example.test', 'password123')}
                className="py-2 bg-[#F4F2ED] hover:bg-[#E3DCD2] text-[#2C2B29] font-semibold rounded-sm border border-[#D1D0CE] flex items-center justify-center space-x-1"
              >
                <Shield className="w-3.5 h-3.5 text-[#C28F7B]" />
                <span>Admin Login</span>
              </button>
              <button
                type="button"
                onClick={() => handleLogin('helper@example.test', 'password123')}
                className="py-2 bg-[#F4F2ED] hover:bg-[#E3DCD2] text-[#2C2B29] font-semibold rounded-sm border border-[#D1D0CE] flex items-center justify-center space-x-1"
              >
                <UserCheck className="w-3.5 h-3.5 text-[#8A9A86]" />
                <span>Helper Login</span>
              </button>
            </div>
          </div>

          <div className="text-center pt-2 text-xs text-[#42403D]">
            Don't have an account?{' '}
            <Link href="/register" className="text-[#C28F7B] font-semibold hover:underline">
              Register here
            </Link>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}
