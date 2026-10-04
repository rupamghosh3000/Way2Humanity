'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Footer() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetch('/api/v1/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.user) {
          const roles: string[] = data.data.user.roles || [];
          if (roles.includes('ADMIN') || roles.includes('VERIFIER') || roles.includes('admin') || roles.includes('verifier')) {
            setIsAdmin(true);
          }
        }
      })
      .catch(() => {});
  }, []);

  return (
    <footer className="bg-[#2C2B29] text-[#F9F8F6] py-16 border-t border-[#42403D]">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="md:col-span-2 space-y-4">
          <div className="font-serif text-2xl tracking-tight text-[#F9F8F6]">WAY2HUMANITY</div>
          <p className="text-sm text-[#D1D0CE] max-w-md font-sans leading-relaxed">
            “Growing Humanity Through Technology” — An auditable community trust layer connecting Seekers, Helpers, Donors, and CSR organizations through verified evidence and transparent impact records.
          </p>
          <div className="pt-4 font-serif text-lg text-[#C28F7B]">
            DIFFERENT PEOPLE. ONE HUMANITY.
          </div>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-widest text-[#D9A05B] font-semibold mb-4">Platform</h4>
          <ul className="space-y-2.5 text-sm text-[#D1D0CE]">
            <li><Link href="/radar" className="hover:text-[#F9F8F6] transition-colors">Humanity Radar</Link></li>
            <li><Link href="/helper" className="hover:text-[#F9F8F6] transition-colors">Helper Portal</Link></li>
            <li><Link href="/report" className="hover:text-[#F9F8F6] transition-colors">Report a Need</Link></li>
            <li><Link href="/passport" className="hover:text-[#F9F8F6] transition-colors">Humanity Passport</Link></li>
            <li><Link href="/csr" className="hover:text-[#F9F8F6] transition-colors">CSR Command Center</Link></li>
            {isAdmin && (
              <li><Link href="/admin" className="hover:text-[#F9F8F6] transition-colors text-[#C28F7B]">Operations & Admin</Link></li>
            )}
          </ul>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-widest text-[#D9A05B] font-semibold mb-4">Integrity & Trust</h4>
          <ul className="space-y-2.5 text-sm text-[#D1D0CE]">
            <li><span className="text-[#8A9A86]">✓ SHA-256 Evidence Hashing</span></li>
            <li><span className="text-[#8A9A86]">✓ AI-Assisted Risk Signals</span></li>
            <li><span className="text-[#8A9A86]">✓ Human Review Fallback</span></li>
            <li><span className="text-[#8A9A86]">✓ Razorpay Webhook Verification</span></li>
            <li><span className="text-[#8A9A86]">✓ Immutable Audit Logging</span></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-12 mt-12 border-t border-[#42403D]/60 flex flex-col md:flex-row items-center justify-between text-xs text-[#D1D0CE]">
        <div>© 2026 Way2Humanity Foundation. All rights reserved.</div>
        <div className="mt-4 md:mt-0 flex space-x-6">
          <span className="hover:underline cursor-pointer">Privacy Specification</span>
          <span className="hover:underline cursor-pointer">Security Protocol</span>
          <span className="hover:underline cursor-pointer">Audit Ledger</span>
        </div>
      </div>
    </footer>
  );
}
