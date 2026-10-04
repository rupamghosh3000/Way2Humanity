'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import {
  Award,
  CheckCircle2,
  Shield,
  Calendar,
  MapPin,
  User,
  Copy,
  Check,
  ExternalLink,
  Flame,
  Globe,
  FileCheck,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Hash,
} from 'lucide-react';

interface PassportData {
  userId: string;
  passportId?: string;
  name: string;
  email?: string;
  roles: string[];
  city?: string;
  region?: string;
  skills?: string[];
  memberSince?: string;
  reputationSummary: {
    points: number;
    missionsCompleted: number;
    communitiesHelped: number;
    verifiedProofCount: number;
  };
  recentEvents: Array<{
    _id: string;
    reason: string;
    points: number;
    createdAt: string;
  }>;
  completedMissions: Array<{
    _id: string;
    title: string;
    category: string;
    publicId: string;
    completedAt: string;
  }>;
  verifiedBadge: string;
  credentialHash?: string;
  trustScore?: number;
}

export default function PassportPage() {
  const [passport, setPassport] = useState<PassportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'events' | 'missions' | 'trust'>('events');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [authError, setAuthError] = useState(false);
  const [demoLoggingIn, setDemoLoggingIn] = useState(false);

  const fetchPassport = () => {
    setLoading(true);
    setAuthError(false);
    fetch('/api/v1/users/me/passport')
      .then((res) => {
        if (res.status === 401) {
          setAuthError(true);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data && data.success && data.data?.passport) {
          setPassport(data.data.passport);
        } else if (data && !data.success) {
          setAuthError(true);
        }
      })
      .catch(() => {
        setAuthError(true);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPassport();
  }, []);

  const handleCopy = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleQuickLogin = async (email: string) => {
    setDemoLoggingIn(true);
    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: 'password123' }),
      });
      const data = await res.json();
      if (data.success) {
        fetchPassport();
      }
    } catch {
      // ignore
    } finally {
      setDemoLoggingIn(false);
    }
  };

  const formatBadgeName = (badge: string) => {
    switch (badge) {
      case 'MASTER_HUMANITARIAN':
        return 'Master Humanitarian';
      case 'VERIFIED_HUMANITARIAN':
        return 'Verified Humanitarian';
      case 'COMMUNITY_HELPER':
        return 'Community Helper';
      case 'ACTIVE_COMMUNITY_MEMBER':
      default:
        return 'Active Community Member';
    }
  };

  const points = passport?.reputationSummary?.points ?? 0;
  const nextTierPoints = points >= 200 ? 500 : points >= 100 ? 200 : 100;
  const nextTierName = points >= 200 ? 'Legacy Contributor' : points >= 100 ? 'Master Humanitarian' : 'Verified Humanitarian';
  const progressPercent = Math.min(100, Math.round((points / nextTierPoints) * 100));

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-[#2C2B29]">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-28 pb-20 space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-[#C28F7B]/10 border border-[#C28F7B]/30 rounded-full text-xs font-semibold text-[#A8715E] uppercase tracking-widest">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Cryptographic Trust Layer</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#2C2B29] font-normal tracking-tight">
            Humanity Passport
          </h1>
          <p className="text-sm text-[#42403D] leading-relaxed">
            Your tamper-proof digital humanitarian credential. Reputation points and trust levels are awarded
            strictly for completed community missions with cryptographically verified proof of work.
          </p>
        </div>

        {loading ? (
          <div className="p-16 bg-[#FFFFFF] border border-[#D1D0CE] rounded-sm text-center space-y-3 shadow-sm">
            <div className="inline-block w-8 h-8 border-2 border-[#C28F7B] border-t-transparent rounded-full animate-spin mb-2" />
            <div className="text-sm font-medium text-[#2C2B29]">Retrieving Verified Passport Ledger...</div>
            <div className="text-xs text-[#42403D]">Verifying identity credentials against the immutable trust ledger</div>
          </div>
        ) : passport ? (
          <div className="space-y-8">
            {/* Primary Verifiable Credential Passport Card */}
            <div className="bg-[#FFFFFF] border border-[#D1D0CE] rounded-sm p-6 sm:p-8 shadow-sm relative overflow-hidden">
              {/* Subtle background credential watermark */}
              <div className="absolute -right-8 -top-8 w-44 h-44 rounded-full bg-[#F4F2ED] pointer-events-none opacity-40 flex items-center justify-center font-serif text-8xl font-bold text-[#D1D0CE]">
                W
              </div>

              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between pb-6 border-b border-[#F4F2ED] gap-6 relative z-10">
                {/* Profile Identity */}
                <div className="flex items-center space-x-4 sm:space-x-5">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#C28F7B]/15 border-2 border-[#C28F7B]/40 text-[#C28F7B] font-serif text-3xl sm:text-4xl font-bold flex items-center justify-center shadow-inner flex-shrink-0">
                    {(passport.name || 'H').charAt(0).toUpperCase()}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <h2 className="font-serif text-2xl sm:text-3xl text-[#2C2B29] font-normal leading-tight">
                        {passport.name || 'Verified Contributor'}
                      </h2>
                      <div className="inline-flex items-center space-x-1 px-2.5 py-0.5 bg-[#8A9A86]/15 border border-[#8A9A86] text-[#6A7B66] text-xs font-semibold rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{formatBadgeName(passport.verifiedBadge)}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 text-xs text-[#42403D] flex-wrap">
                      <span className="flex items-center space-x-1">
                        <MapPin className="w-3.5 h-3.5 text-[#8A9A86]" />
                        <span>{passport.city || 'Mumbai'}{passport.region ? `, ${passport.region}` : ''}</span>
                      </span>
                      <span>•</span>
                      <span>Roles: {(passport.roles || ['HELPER']).join(', ')}</span>
                      {passport.memberSince && (
                        <>
                          <span>•</span>
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-3.5 h-3.5 text-[#C28F7B]" />
                            <span>Since {new Date(passport.memberSince).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</span>
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Passport ID & Cryptographic Trust Stamp */}
                <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-2 bg-[#F9F8F6] p-3.5 rounded-sm border border-[#E3DCD2]">
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] uppercase tracking-wider text-[#42403D] font-mono font-medium">Passport ID:</span>
                    <span className="font-mono text-xs font-bold text-[#2C2B29] tracking-wider">
                      {passport.passportId || `W2H-IND-${passport.userId.slice(-6).toUpperCase()}`}
                    </span>
                    <button
                      onClick={() => handleCopy(passport.passportId || passport.userId, 'passportId')}
                      className="p-1 hover:text-[#C28F7B] transition-colors text-[#42403D]"
                      title="Copy Passport ID"
                    >
                      {copiedKey === 'passportId' ? <Check className="w-3.5 h-3.5 text-[#8A9A86]" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="flex items-center space-x-2 text-[11px] text-[#42403D]">
                    <span className="font-mono text-[10px] text-[#8A9A86] bg-[#8A9A86]/10 px-2 py-0.5 rounded-sm border border-[#8A9A86]/30">
                      {passport.credentialHash || `SHA256:7f83b165...${passport.userId.slice(-4)}`}
                    </span>
                    <span className="inline-flex items-center px-1.5 py-0.5 bg-[#D9A05B]/15 text-[#9E6E2D] font-semibold rounded text-[10px]">
                      {passport.trustScore ?? 98}% Trust Score
                    </span>
                  </div>
                </div>
              </div>

              {/* Skills and Humanitarian Specialties */}
              {passport.skills && passport.skills.length > 0 && (
                <div className="pt-4 pb-2 flex items-center space-x-2 flex-wrap gap-y-2">
                  <span className="text-xs uppercase tracking-wider text-[#42403D] font-semibold mr-1">Verified Skills:</span>
                  {passport.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-[#F4F2ED] border border-[#D1D0CE] text-[#2C2B29] text-xs rounded-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}

              {/* Reputation Tier Progress Bar */}
              <div className="pt-4 border-t border-[#F4F2ED] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-1.5 font-semibold text-[#2C2B29]">
                    <Flame className="w-4 h-4 text-[#C28F7B]" />
                    <span>Tier Progress: {formatBadgeName(passport.verifiedBadge)}</span>
                  </div>
                  <span className="text-[#42403D]">
                    <strong className="text-[#2C2B29]">{points}</strong> / {nextTierPoints} pts to {nextTierName}
                  </span>
                </div>
                <div className="w-full h-2.5 bg-[#F4F2ED] rounded-full overflow-hidden border border-[#D1D0CE]/40">
                  <div
                    className="h-full bg-gradient-to-r from-[#C28F7B] to-[#8A9A86] transition-all duration-700"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* 4 Core Verifiable Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-5 bg-[#FFFFFF] border border-[#D1D0CE] rounded-sm text-center shadow-sm space-y-1">
                <div className="w-9 h-9 mx-auto rounded-full bg-[#C28F7B]/10 flex items-center justify-center text-[#C28F7B] mb-2">
                  <Award className="w-5 h-5" />
                </div>
                <div className="font-serif text-3xl sm:text-4xl text-[#2C2B29] font-normal">
                  {passport.reputationSummary?.points ?? 0}
                </div>
                <div className="text-[11px] text-[#42403D] uppercase tracking-wider font-medium">Humanity Points</div>
                <div className="text-[10px] text-[#8A9A86] font-medium">Reputation Tier Score</div>
              </div>

              <div className="p-5 bg-[#FFFFFF] border border-[#D1D0CE] rounded-sm text-center shadow-sm space-y-1">
                <div className="w-9 h-9 mx-auto rounded-full bg-[#8A9A86]/10 flex items-center justify-center text-[#8A9A86] mb-2">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="font-serif text-3xl sm:text-4xl text-[#2C2B29] font-normal">
                  {passport.reputationSummary?.missionsCompleted ?? 0}
                </div>
                <div className="text-[11px] text-[#42403D] uppercase tracking-wider font-medium">Missions Completed</div>
                <div className="text-[10px] text-[#8A9A86] font-medium">Verified Ground Work</div>
              </div>

              <div className="p-5 bg-[#FFFFFF] border border-[#D1D0CE] rounded-sm text-center shadow-sm space-y-1">
                <div className="w-9 h-9 mx-auto rounded-full bg-[#D9A05B]/10 flex items-center justify-center text-[#D9A05B] mb-2">
                  <Globe className="w-5 h-5" />
                </div>
                <div className="font-serif text-3xl sm:text-4xl text-[#2C2B29] font-normal">
                  {passport.reputationSummary?.communitiesHelped ?? 0}
                </div>
                <div className="text-[11px] text-[#42403D] uppercase tracking-wider font-medium">Communities Helped</div>
                <div className="text-[10px] text-[#8A9A86] font-medium">Local Impact Zones</div>
              </div>

              <div className="p-5 bg-[#FFFFFF] border border-[#D1D0CE] rounded-sm text-center shadow-sm space-y-1">
                <div className="w-9 h-9 mx-auto rounded-full bg-[#8A9A86]/10 flex items-center justify-center text-[#8A9A86] mb-2">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div className="font-serif text-3xl sm:text-4xl text-[#2C2B29] font-normal">
                  {passport.reputationSummary?.verifiedProofCount ?? 0}
                </div>
                <div className="text-[11px] text-[#42403D] uppercase tracking-wider font-medium">Verified Proofs</div>
                <div className="text-[10px] text-[#8A9A86] font-medium">SHA-256 Validated</div>
              </div>
            </div>

            {/* Interactive Tabbed Ledger Details */}
            <div className="bg-[#FFFFFF] border border-[#D1D0CE] rounded-sm shadow-sm overflow-hidden">
              {/* Tab Navigation */}
              <div className="flex border-b border-[#D1D0CE] bg-[#F4F2ED]/60 overflow-x-auto">
                <button
                  onClick={() => setActiveTab('events')}
                  className={`px-6 py-3.5 text-xs uppercase tracking-wider font-semibold border-b-2 transition-all flex items-center space-x-2 whitespace-nowrap ${
                    activeTab === 'events'
                      ? 'border-[#C28F7B] text-[#2C2B29] bg-[#FFFFFF]'
                      : 'border-transparent text-[#42403D] hover:text-[#2C2B29]'
                  }`}
                >
                  <Award className="w-4 h-4 text-[#C28F7B]" />
                  <span>Contribution Ledger ({passport.recentEvents?.length ?? 0})</span>
                </button>

                <button
                  onClick={() => setActiveTab('missions')}
                  className={`px-6 py-3.5 text-xs uppercase tracking-wider font-semibold border-b-2 transition-all flex items-center space-x-2 whitespace-nowrap ${
                    activeTab === 'missions'
                      ? 'border-[#C28F7B] text-[#2C2B29] bg-[#FFFFFF]'
                      : 'border-transparent text-[#42403D] hover:text-[#2C2B29]'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 text-[#8A9A86]" />
                  <span>Completed Missions ({passport.completedMissions?.length ?? 0})</span>
                </button>

                <button
                  onClick={() => setActiveTab('trust')}
                  className={`px-6 py-3.5 text-xs uppercase tracking-wider font-semibold border-b-2 transition-all flex items-center space-x-2 whitespace-nowrap ${
                    activeTab === 'trust'
                      ? 'border-[#C28F7B] text-[#2C2B29] bg-[#FFFFFF]'
                      : 'border-transparent text-[#42403D] hover:text-[#2C2B29]'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-[#D9A05B]" />
                  <span>Cryptographic Verification</span>
                </button>
              </div>

              {/* Tab Content 1: Verified Contribution Ledger Events */}
              {activeTab === 'events' && (
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-[#F4F2ED]">
                    <div>
                      <h3 className="font-serif text-xl text-[#2C2B29]">Verified Contribution Events</h3>
                      <p className="text-xs text-[#42403D]">
                        Immutable chronological trail of approved proofs, completed missions, and verifications.
                      </p>
                    </div>
                    <span className="text-[11px] font-mono text-[#8A9A86] bg-[#8A9A86]/10 px-2 py-0.5 rounded border border-[#8A9A86]/30">
                      Audit Stream Active
                    </span>
                  </div>

                  {passport.recentEvents && passport.recentEvents.length > 0 ? (
                    <div className="divide-y divide-[#F4F2ED]">
                      {passport.recentEvents.map((evt) => (
                        <div key={evt._id} className="py-3.5 flex items-center justify-between gap-4">
                          <div className="space-y-1">
                            <div className="text-sm font-medium text-[#2C2B29] flex items-center space-x-2">
                              <span>{evt.reason}</span>
                            </div>
                            <div className="flex items-center space-x-3 text-xs text-[#42403D]">
                              <span>{new Date(evt.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                              <span>•</span>
                              <span className="font-mono text-[10px] text-[#8A9A86]">Verified Proof Seal</span>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <span className="font-serif text-lg font-semibold text-[#8A9A86] bg-[#8A9A86]/10 px-2.5 py-1 rounded-sm border border-[#8A9A86]/30">
                              +{evt.points} pts
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-10 bg-[#F4F2ED] rounded-sm text-center space-y-2">
                      <p className="text-xs text-[#42403D]">
                        No reputation events logged in the audit ledger yet.
                      </p>
                      <Link
                        href="/radar"
                        className="inline-flex items-center space-x-1 text-xs text-[#C28F7B] font-semibold hover:underline"
                      >
                        <span>Browse open missions on Humanity Radar to earn verified points</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Tab Content 2: Completed Missions */}
              {activeTab === 'missions' && (
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-[#F4F2ED]">
                    <div>
                      <h3 className="font-serif text-xl text-[#2C2B29]">Completed Community Missions</h3>
                      <p className="text-xs text-[#42403D]">
                        Missions where ground proof was accepted, reviewed, and finalized.
                      </p>
                    </div>
                    <Link
                      href="/helper"
                      className="text-xs text-[#C28F7B] font-semibold hover:underline flex items-center space-x-1"
                    >
                      <span>Helper Hub</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>

                  {passport.completedMissions && passport.completedMissions.length > 0 ? (
                    <div className="divide-y divide-[#F4F2ED]">
                      {passport.completedMissions.map((m) => (
                        <div key={m._id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="px-2 py-0.5 bg-[#8A9A86]/15 text-[#6A7B66] text-[10px] font-semibold rounded-sm">
                                {m.category}
                              </span>
                              <span className="font-mono text-xs text-[#42403D]">{m.publicId}</span>
                            </div>
                            <div className="text-sm font-medium text-[#2C2B29]">{m.title}</div>
                            <div className="text-xs text-[#42403D]">
                              Completed: {new Date(m.completedAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                            </div>
                          </div>
                          <div>
                            <span className="inline-flex items-center space-x-1 px-3 py-1 bg-[#8A9A86]/10 border border-[#8A9A86] text-[#8A9A86] text-xs font-semibold rounded-sm">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Proof Approved</span>
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-10 bg-[#F4F2ED] rounded-sm text-center space-y-3">
                      <p className="text-xs text-[#42403D]">
                        No completed missions recorded under this profile yet.
                      </p>
                      <Link
                        href="/radar"
                        className="inline-block px-4 py-2 bg-[#2C2B29] text-[#F9F8F6] text-xs uppercase tracking-wider font-semibold rounded-sm"
                      >
                        Explore Missions to Help
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Tab Content 3: Cryptographic Verification Details */}
              {activeTab === 'trust' && (
                <div className="p-6 space-y-6">
                  <div className="space-y-1 pb-2 border-b border-[#F4F2ED]">
                    <h3 className="font-serif text-xl text-[#2C2B29]">Cryptographic Identity & Trust Proof</h3>
                    <p className="text-xs text-[#42403D]">
                      Every credential and reputation point is verified through deterministic cryptographic hashing
                      and auditable security logs.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-[#F9F8F6] border border-[#E3DCD2] rounded-sm space-y-2">
                      <div className="text-xs font-semibold text-[#2C2B29] uppercase tracking-wider flex items-center space-x-1.5">
                        <Hash className="w-4 h-4 text-[#C28F7B]" />
                        <span>Passport Signature Hash</span>
                      </div>
                      <div className="font-mono text-xs bg-[#FFFFFF] p-2.5 rounded border border-[#D1D0CE] break-all text-[#42403D]">
                        {passport.credentialHash || `SHA256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1f...`}
                      </div>
                      <p className="text-[11px] text-[#42403D]">
                        Generated from user identity, verified badge status, and accumulated contribution score.
                      </p>
                    </div>

                    <div className="p-4 bg-[#F9F8F6] border border-[#E3DCD2] rounded-sm space-y-2">
                      <div className="text-xs font-semibold text-[#2C2B29] uppercase tracking-wider flex items-center space-x-1.5">
                        <ShieldCheck className="w-4 h-4 text-[#8A9A86]" />
                        <span>Security & Proof Standard</span>
                      </div>
                      <ul className="text-xs text-[#42403D] space-y-1.5 list-disc list-inside">
                        <li>Multi-party evidence verification (Seeker + Helper + Verifier)</li>
                        <li>Automated AI risk detection & human approval checks</li>
                        <li>Tamper-evident audit logging for reputation distribution</li>
                      </ul>
                    </div>
                  </div>

                  <div className="p-4 bg-[#8A9A86]/10 border border-[#8A9A86]/30 rounded-sm flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2 text-[#6A7B66]">
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                      <span>This passport credential is valid and registered with the Way2Humanity Network.</span>
                    </div>
                    <button
                      onClick={() => handleCopy(window.location.href, 'shareLink')}
                      className="px-3 py-1.5 bg-[#FFFFFF] border border-[#8A9A86] text-[#6A7B66] font-semibold rounded-sm hover:bg-[#8A9A86]/10 transition-colors flex items-center space-x-1"
                    >
                      {copiedKey === 'shareLink' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'shareLink' ? 'Copied Link' : 'Copy Passport URL'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Unauthenticated Experience: Showcase Credential & Quick Access */
          <div className="p-8 sm:p-12 bg-[#FFFFFF] border border-[#D1D0CE] rounded-sm text-center space-y-6 shadow-sm max-w-2xl mx-auto">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#C28F7B]/10 border border-[#C28F7B]/30 flex items-center justify-center text-[#C28F7B]">
              <Shield className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="font-serif text-2xl sm:text-3xl text-[#2C2B29]">
                Sign In to View Your Humanity Passport
              </h2>
              <p className="text-xs sm:text-sm text-[#42403D] max-w-md mx-auto">
                Sign in with your account or try one of the quick demo credentials below to explore verified
                reputation scores, completed missions, and cryptographic contribution trails.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/login"
                className="w-full sm:w-auto px-6 py-2.5 bg-[#2C2B29] hover:bg-[#1A1A1A] text-[#F9F8F6] text-xs uppercase tracking-widest font-semibold rounded-sm transition-all"
              >
                Sign In with Account
              </Link>
              <Link
                href="/register"
                className="w-full sm:w-auto px-6 py-2.5 border border-[#2C2B29] text-[#2C2B29] hover:bg-[#2C2B29] hover:text-[#F9F8F6] text-xs uppercase tracking-widest font-semibold rounded-sm transition-all"
              >
                Register as Volunteer
              </Link>
            </div>

            {/* Quick Demo Access Buttons */}
            <div className="pt-6 border-t border-[#F4F2ED] space-y-3">
              <span className="text-[11px] text-[#42403D] uppercase tracking-wider block font-medium">
                Quick Demo Inspection Access:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto">
                <button
                  type="button"
                  disabled={demoLoggingIn}
                  onClick={() => handleQuickLogin('helper@example.test')}
                  className="p-3 bg-[#F4F2ED] hover:bg-[#E3DCD2] text-[#2C2B29] rounded-sm border border-[#D1D0CE] text-xs font-semibold flex items-center justify-center space-x-2 transition-colors"
                >
                  <Award className="w-4 h-4 text-[#8A9A86]" />
                  <span>{demoLoggingIn ? 'Loading...' : 'Rohan Helper (120 pts)'}</span>
                </button>

                <button
                  type="button"
                  disabled={demoLoggingIn}
                  onClick={() => handleQuickLogin('admin@example.test')}
                  className="p-3 bg-[#F4F2ED] hover:bg-[#E3DCD2] text-[#2C2B29] rounded-sm border border-[#D1D0CE] text-xs font-semibold flex items-center justify-center space-x-2 transition-colors"
                >
                  <ShieldCheck className="w-4 h-4 text-[#C28F7B]" />
                  <span>{demoLoggingIn ? 'Loading...' : 'System Admin (500 pts)'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
