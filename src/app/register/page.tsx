'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('HELPER');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await res.json();
      if (data.success) {
        window.location.href = '/';
      } else {
        setErrorMsg(data.error?.message || 'Registration failed.');
      }
    } catch {
      setErrorMsg('Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-[#2C2B29]">
      <Navbar />

      <main className="max-w-md mx-auto px-6 pt-36 pb-24">
        <div className="text-center mb-8 space-y-2">
          <span className="text-xs uppercase tracking-widest text-[#C28F7B] font-semibold">Join the Trust Network</span>
          <h1 className="font-serif text-3xl font-normal">Create an Account</h1>
          <p className="text-xs text-[#42403D]">Select your role to start making verified impact.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 bg-[#FFFFFF] border border-[#D1D0CE] rounded-sm space-y-5 shadow-sm">
          {errorMsg && (
            <div className="p-3 bg-[#C28F7B]/10 border border-[#C28F7B] text-[#A8715E] text-xs rounded-sm">
              {errorMsg}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wider font-semibold text-[#42403D]">Full Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Rupam Kumar"
              className="w-full p-3 bg-[#F4F2ED] border border-[#D1D0CE] rounded-sm text-sm text-[#2C2B29]"
            />
          </div>

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
            <label className="text-xs uppercase tracking-wider font-semibold text-[#42403D]">Password (min 8 chars) *</label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full p-3 bg-[#F4F2ED] border border-[#D1D0CE] rounded-sm text-sm text-[#2C2B29]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wider font-semibold text-[#42403D]">Primary Role *</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full p-3 bg-[#F4F2ED] border border-[#D1D0CE] rounded-sm text-sm text-[#2C2B29]"
            >
              <option value="HELPER">HELPER (Volunteer & Assist)</option>
              <option value="SEEKER">SEEKER (Report Needs)</option>
              <option value="DONOR">DONOR (Fund Missions)</option>
              <option value="CSR_ORGANIZATION">CSR_ORGANIZATION (Corporate Sponsor)</option>
              <option value="VERIFIER">VERIFIER (Community Reviewer)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#2C2B29] hover:bg-[#1A1A1A] text-[#F9F8F6] text-xs uppercase tracking-widest font-semibold rounded-sm transition-all shadow-sm"
          >
            {loading ? 'Creating Account...' : 'Register Account'}
          </button>

          <div className="text-center pt-2 text-xs text-[#42403D]">
            Already have an account?{' '}
            <Link href="/login" className="text-[#C28F7B] font-semibold hover:underline">
              Sign in here
            </Link>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}
