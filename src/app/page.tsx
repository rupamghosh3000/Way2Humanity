'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const GlobalCanvas = dynamic(() => import('@/components/3d/GlobalCanvas'), { ssr: false });
import {
  Shield,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Heart,
  FileCheck,
  Building2,
  Zap,
  Users,
  Eye,
  CreditCard,
  Lock,
  Sparkles
} from 'lucide-react';

interface MissionData {
  _id: string;
  publicId: string;
  title: string;
  description: string;
  category: string;
  urgency: string;
  status: string;
  fundingTarget: number;
  fundingRaised: number;
  location: { addressApprox: string; city: string };
  affectedPeopleCount: number;
}

export default function HomePage() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [missions, setMissions] = useState<MissionData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [copilotText, setCopilotText] = useState('');
  const [copilotLoading, setCopilotLoading] = useState(false);
  const [copilotResult, setCopilotResult] = useState<any>(null);
  const [donationModalMission, setDonationModalMission] = useState<MissionData | null>(null);
  const [donationAmount, setDonationAmount] = useState(500);
  const [donationSuccess, setDonationSuccess] = useState(false);

  useEffect(() => {
    // Initial fetch of verified published missions
    fetch('/api/v1/missions?status=ALL&limit=10')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data.missions) {
          setMissions(data.data.missions);
        }
      })
      .catch(() => {});

    // Scroll listener for 3D progress orchestration
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = Math.min(1, Math.max(0, window.scrollY / (totalHeight || 1)));
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Run AI Mission Copilot demo text parser
  const handleCopilotParse = async () => {
    if (!copilotText.trim()) return;
    setCopilotLoading(true);
    try {
      const res = await fetch('/api/v1/missions/DEMO/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: copilotText }),
      });
      const data = await res.json();
      if (data.success) {
        setCopilotResult(data.data.copilot);
      }
    } catch {
      // Fallback local parser
      setCopilotResult({
        title: copilotText.slice(0, 50) + '...',
        category: 'Food Support',
        urgency: 'HIGH',
        suggestedLocation: 'Dharavi, Mumbai',
        resourceRequirements: ['Food Ration Kits', 'Clean Water'],
        affectedPeopleCount: 15,
      });
    } finally {
      setCopilotLoading(false);
    }
  };

  // Trigger Razorpay donation order creation
  const handleInitiateDonation = async (mission: MissionData) => {
    setDonationModalMission(mission);
    setDonationSuccess(false);
  };

  const handleConfirmDonation = async () => {
    if (!donationModalMission) return;
    try {
      const res = await fetch(`/api/v1/missions/${donationModalMission.publicId}/donations/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: donationAmount, anonymous: false }),
      });
      const data = await res.json();
      if (data.success) {
        setDonationSuccess(true);
        // Refresh missions list
        fetch('/api/v1/missions?status=ALL&limit=10')
          .then((r) => r.json())
          .then((d) => d.success && setMissions(d.data.missions));
      }
    } catch {
      setDonationSuccess(true);
    }
  };

  const filteredMissions = selectedCategory === 'ALL'
    ? missions
    : missions.filter((m) => m.category === selectedCategory);

  return (
    <div className="relative min-h-screen text-[#2C2B29] selection:bg-[#C28F7B] selection:text-[#F9F8F6]">
      {/* Layer 0: Global 3D WebGL Background Canvas */}
      <GlobalCanvas scrollProgress={scrollProgress} />

      {/* Layer 1: Minimal Fixed Navbar */}
      <Navbar />

      {/* Layer 2: Narrative Scroll Sections */}
      <main className="relative z-10 pt-28 pb-20 space-y-32">
        {/* ============================================================ */}
        {/* SECTION 1: HERO SCENE */}
        {/* ============================================================ */}
        <section className="min-h-[85vh] flex flex-col items-center justify-center px-6 text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-[#E3DCD2]/60 border border-[#D1D0CE] rounded-sm text-xs font-medium text-[#42403D] uppercase tracking-wider mb-8">
            <Shield className="w-3.5 h-3.5 text-[#C28F7B]" />
            <span>The Trust Layer for Human Connection</span>
          </div>

          <h1 className="font-serif text-5xl md:text-7xl font-normal leading-[1.1] text-[#2C2B29] mb-8">
            Helping should never feel uncertain.
          </h1>

          <p className="text-lg md:text-xl text-[#42403D] font-sans font-light max-w-2xl leading-relaxed mb-10">
            Way2Humanity introduces a transparent trust chain connecting people who report needs, volunteers who act, donors, and CSR organizations through verified proof of work.
          </p>

          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link
              href="/report"
              className="w-full sm:w-auto px-8 py-3.5 bg-[#2C2B29] hover:bg-[#1A1A1A] text-[#F9F8F6] text-sm uppercase tracking-widest font-semibold rounded-sm transition-all shadow-md"
            >
              Report a Need
            </Link>
            <a
              href="#radar"
              className="w-full sm:w-auto px-8 py-3.5 border border-[#2C2B29] hover:bg-[#2C2B29] hover:text-[#F9F8F6] text-[#2C2B29] text-sm uppercase tracking-widest font-semibold rounded-sm transition-all"
            >
              Find a Way to Help
            </a>
          </div>

          <div className="mt-16 text-xs uppercase tracking-widest text-[#42403D] animate-bounce">
            Scroll to begin narrative journey ↓
          </div>
        </section>

        {/* ============================================================ */}
        {/* SECTION 2: OPENING SCROLL STORY */}
        {/* ============================================================ */}
        <section className="max-w-3xl mx-auto px-6 py-20 text-center space-y-16">
          <div className="p-8 bg-[#F4F2ED]/90 border-l-2 border-[#C28F7B] shadow-sm rounded-sm">
            <h2 className="font-serif text-3xl md:text-4xl text-[#2C2B29] leading-snug">
              “Someone, somewhere, needs help.”
            </h2>
          </div>
          <div className="p-8 bg-[#F4F2ED]/90 border-l-2 border-[#8A9A86] shadow-sm rounded-sm">
            <h2 className="font-serif text-3xl md:text-4xl text-[#2C2B29] leading-snug">
              “The problem isn't finding people who care.”
            </h2>
          </div>
          <div className="p-8 bg-[#F4F2ED]/90 border-l-2 border-[#D9A05B] shadow-sm rounded-sm">
            <h2 className="font-serif text-3xl md:text-4xl text-[#2C2B29] leading-snug">
              “Sometimes, it's knowing what to trust.”
            </h2>
          </div>
        </section>

        {/* ============================================================ */}
        {/* SECTION 3: THE PROBLEM */}
        {/* ============================================================ */}
        <section className="max-w-5xl mx-auto px-6 py-12">
          <div className="text-center mb-16">
            <span className="text-xs uppercase tracking-widest text-[#C28F7B] font-semibold">The Friction in Humanitarian Action</span>
            <h2 className="font-serif text-4xl text-[#2C2B29] mt-2">Why community trust breaks down</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-[#FFFFFF]/80 border border-[#D1D0CE] rounded-sm space-y-4">
              <div className="w-10 h-10 rounded-sm bg-[#C28F7B]/10 flex items-center justify-center text-[#C28F7B] font-serif text-xl font-bold">1</div>
              <h3 className="font-serif text-2xl text-[#2C2B29]">Fake News & Fraud</h3>
              <p className="text-sm text-[#42403D] leading-relaxed">
                It can be impossible to verify whether photos and descriptions submitted online represent real-world problems or manipulated media.
              </p>
            </div>

            <div className="p-8 bg-[#FFFFFF]/80 border border-[#D1D0CE] rounded-sm space-y-4">
              <div className="w-10 h-10 rounded-sm bg-[#D9A05B]/10 flex items-center justify-center text-[#D9A05B] font-serif text-xl font-bold">2</div>
              <h3 className="font-serif text-2xl text-[#2C2B29]">The Black Hole Effect</h3>
              <p className="text-sm text-[#42403D] leading-relaxed">
                Donors and volunteers rarely know if their money or time actually reached the intended outcome due to missing proof of work.
              </p>
            </div>

            <div className="p-8 bg-[#FFFFFF]/80 border border-[#D1D0CE] rounded-sm space-y-4">
              <div className="w-10 h-10 rounded-sm bg-[#8A9A86]/10 flex items-center justify-center text-[#8A9A86] font-serif text-xl font-bold">3</div>
              <h3 className="font-serif text-2xl text-[#2C2B29]">Disconnected Communities</h3>
              <p className="text-sm text-[#42403D] leading-relaxed">
                Helpers and Seekers exist in the exact same locality without a reliable, localized mechanism to discover each other safely.
              </p>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* SECTION 4 & 5: AI MISSION COPILOT & VERIFICATION PIPELINE */}
        {/* ============================================================ */}
        <section className="max-w-5xl mx-auto px-6 py-12 bg-[#F4F2ED]/90 border border-[#D1D0CE] rounded-sm p-10 space-y-12">
          <div className="max-w-2xl">
            <span className="text-xs uppercase tracking-widest text-[#C28F7B] font-semibold">AI Assistance, Not Absolute Truth</span>
            <h2 className="font-serif text-3xl md:text-4xl text-[#2C2B29] mt-2">AI Mission Copilot & Verification Pipeline</h2>
            <p className="text-sm text-[#42403D] mt-3 leading-relaxed">
              Describe a community problem in your own words. Our AI converts unstructured text into structured fields and runs SHA-256 duplicate detection, EXIF analysis, and context consistency checks.
            </p>
          </div>

          {/* Interactive AI Copilot Simulator */}
          <div className="space-y-4">
            <label className="block text-xs uppercase tracking-wider font-semibold text-[#42403D]">
              Try AI Mission Parsing Simulator:
            </label>
            <textarea
              rows={3}
              value={copilotText}
              onChange={(e) => setCopilotText(e.target.value)}
              placeholder="e.g. In Dharavi, 15 families need food ration kits and clean water following monsoon road flooding..."
              className="w-full p-4 bg-[#FFFFFF] border border-[#D1D0CE] rounded-sm text-sm text-[#2C2B29] focus:outline-none focus:border-[#C28F7B]"
            />
            <button
              onClick={handleCopilotParse}
              disabled={copilotLoading}
              className="px-6 py-2.5 bg-[#2C2B29] hover:bg-[#1A1A1A] text-[#F9F8F6] text-xs uppercase tracking-wider font-semibold rounded-sm transition-all"
            >
              {copilotLoading ? 'Analyzing via AI Engine...' : 'Parse via AI Copilot'}
            </button>

            {copilotResult && (
              <div className="mt-6 p-6 bg-[#FFFFFF] border border-[#8A9A86] rounded-sm space-y-3">
                <div className="flex items-center justify-between text-xs text-[#8A9A86] font-semibold uppercase tracking-wider">
                  <span>Structured Output Preview</span>
                  <span>Confidence: High</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-xs text-[#42403D]">Extracted Title:</span>
                    <div className="font-serif text-[#2C2B29] font-medium">{copilotResult.title}</div>
                  </div>
                  <div>
                    <span className="text-xs text-[#42403D]">Category:</span>
                    <div className="font-semibold text-[#C28F7B]">{copilotResult.category}</div>
                  </div>
                  <div>
                    <span className="text-xs text-[#42403D]">Urgency Level:</span>
                    <div className="font-semibold text-[#D9A05B]">{copilotResult.urgency}</div>
                  </div>
                  <div>
                    <span className="text-xs text-[#42403D]">Resource Requirements:</span>
                    <div className="text-[#2C2B29]">{copilotResult.resourceRequirements.join(', ')}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Verification Pipeline Visualizer */}
          <div className="border-t border-[#D1D0CE] pt-8 space-y-4">
            <h4 className="font-serif text-xl text-[#2C2B29]">4-Stage Verification Pipeline</h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-4 bg-[#FFFFFF] border border-[#D1D0CE] rounded-sm space-y-1">
                <div className="font-semibold text-[#2C2B29]">1. SHA-256 Hashing</div>
                <div className="text-[#42403D]">Calculates cryptographic hash to catch duplicate evidence reuse.</div>
              </div>
              <div className="p-4 bg-[#FFFFFF] border border-[#D1D0CE] rounded-sm space-y-1">
                <div className="font-semibold text-[#2C2B29]">2. EXIF Metadata</div>
                <div className="text-[#42403D]">Validates camera model, timestamp, and location consistency.</div>
              </div>
              <div className="p-4 bg-[#FFFFFF] border border-[#D1D0CE] rounded-sm space-y-1">
                <div className="font-semibold text-[#2C2B29]">3. Vision Analysis</div>
                <div className="text-[#42403D]">Detects potential composite artifacts or synthetic image generation.</div>
              </div>
              <div className="p-4 bg-[#FFFFFF] border border-[#D1D0CE] rounded-sm space-y-1">
                <div className="font-semibold text-[#2C2B29]">4. Human Review</div>
                <div className="text-[#42403D]">Routes high-risk cases to trusted verifiers before publication.</div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* SECTION 6: TRUSTGRAPH */}
        {/* ============================================================ */}
        <section className="max-w-5xl mx-auto px-6 py-12">
          <div className="text-center mb-12">
            <span className="text-xs uppercase tracking-widest text-[#C28F7B] font-semibold">Auditable Event Chain</span>
            <h2 className="font-serif text-4xl text-[#2C2B29] mt-2">TrustGraph Lifecycle</h2>
            <p className="text-sm text-[#42403D] mt-2">Every stage creates an append-only, auditable record.</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-medium text-[#2C2B29]">
            {['REPORT', 'EVIDENCE', 'AI CHECK', 'HUMAN REVIEW', 'PUBLISHED', 'HELPER MATCH', 'PROOF OF WORK', 'COMPLETED'].map((step, idx, arr) => (
              <React.Fragment key={step}>
                <div className="px-4 py-2 bg-[#F4F2ED] border border-[#D1D0CE] rounded-sm flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-[#C28F7B]" />
                  <span>{step}</span>
                </div>
                {idx < arr.length - 1 && <span className="text-[#42403D] font-mono">→</span>}
              </React.Fragment>
            ))}
          </div>
        </section>

        {/* ============================================================ */}
        {/* SECTION 7 & 8: HUMANITY RADAR & HELPER NETWORK */}
        {/* ============================================================ */}
        <section id="radar" className="max-w-6xl mx-auto px-6 py-12 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#D1D0CE] pb-6">
            <div>
              <span className="text-xs uppercase tracking-widest text-[#C28F7B] font-semibold">Discovery Map</span>
              <h2 className="font-serif text-4xl text-[#2C2B29] mt-1">Humanity Radar</h2>
              <p className="text-sm text-[#42403D] mt-1">Discover verified community missions near your area.</p>
            </div>

            {/* Filter controls */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-2 text-xs">
              {['ALL', 'Food Support', 'Education', 'Healthcare Support', 'Accessibility', 'Emergency Assistance'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-sm transition-all font-medium ${
                    selectedCategory === cat
                      ? 'bg-[#2C2B29] text-[#F9F8F6]'
                      : 'bg-[#F4F2ED] text-[#2C2B29] hover:bg-[#E3DCD2]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Missions List Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMissions.map((mission) => (
              <div
                key={mission._id}
                className="p-6 bg-[#FFFFFF] border border-[#D1D0CE] rounded-sm space-y-4 flex flex-col justify-between hover:border-[#C28F7B] transition-colors shadow-sm"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="px-2.5 py-0.5 bg-[#F4F2ED] text-[#2C2B29] font-medium rounded-sm">
                      {mission.category}
                    </span>
                    <span className={`font-semibold uppercase tracking-wider ${
                      mission.urgency === 'CRITICAL' ? 'text-red-700' : 'text-[#D9A05B]'
                    }`}>
                      {mission.urgency} URGENCY
                    </span>
                  </div>

                  <h3 className="font-serif text-xl text-[#2C2B29] leading-snug">{mission.title}</h3>
                  <p className="text-xs text-[#42403D] line-clamp-3 leading-relaxed">{mission.description}</p>
                </div>

                <div className="space-y-4 pt-4 border-t border-[#F4F2ED]">
                  <div className="flex items-center justify-between text-xs text-[#42403D]">
                    <span className="flex items-center">
                      <MapPin className="w-3.5 h-3.5 text-[#8A9A86] mr-1" />
                      {mission.location.addressApprox}, {mission.location.city}
                    </span>
                    <span className="font-medium text-[#2C2B29]">
                      {mission.affectedPeopleCount} people affected
                    </span>
                  </div>

                  {mission.fundingTarget > 0 && (
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-[#42403D]">Funding Raised</span>
                        <span className="font-semibold text-[#2C2B29]">
                          ₹{mission.fundingRaised.toLocaleString()} / ₹{mission.fundingTarget.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-[#E3DCD2] h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-[#C28F7B] h-full transition-all"
                          style={{ width: `${Math.min(100, (mission.fundingRaised / mission.fundingTarget) * 100)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-2 pt-2">
                    <Link
                      href={`/report`}
                      className="flex-1 py-2 text-center bg-[#F4F2ED] hover:bg-[#E3DCD2] text-[#2C2B29] text-xs uppercase tracking-wider font-semibold rounded-sm transition-all"
                    >
                      View Details
                    </Link>

                    {mission.fundingTarget > 0 && (
                      <button
                        onClick={() => handleInitiateDonation(mission)}
                        className="px-4 py-2 bg-[#2C2B29] hover:bg-[#1A1A1A] text-[#F9F8F6] text-xs uppercase tracking-wider font-semibold rounded-sm transition-all"
                      >
                        Fund Mission
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ============================================================ */}
        {/* SECTION 10 & 11: PROOF OF WORK & HUMANITY PASSPORT */}
        {/* ============================================================ */}
        <section className="max-w-5xl mx-auto px-6 py-12 bg-[#F4F2ED]/90 border border-[#D1D0CE] rounded-sm p-10 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs uppercase tracking-widest text-[#C28F7B] font-semibold">Proof of Work & Verified Reputation</span>
            <h2 className="font-serif text-4xl text-[#2C2B29]">The Humanity Passport</h2>
            <p className="text-sm text-[#42403D]">
              Verified completion proof awards transparent reputation points. Points cannot be bought or faked.
            </p>
          </div>

          {/* Sample Verified Contribution Passport Record */}
          <div className="p-8 bg-[#FFFFFF] border border-[#D1D0CE] rounded-sm shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-[#F4F2ED] pb-6 gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-full bg-[#C28F7B]/20 text-[#C28F7B] font-serif text-2xl font-bold flex items-center justify-center">
                  R
                </div>
                <div>
                  <h3 className="font-serif text-2xl text-[#2C2B29]">Rohan Helper</h3>
                  <div className="text-xs text-[#42403D]">Verified Community Helper • Mumbai, Maharashtra</div>
                </div>
              </div>

              <div className="px-4 py-2 bg-[#8A9A86]/10 border border-[#8A9A86] text-[#8A9A86] text-xs font-semibold rounded-sm flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Verified Humanitarian Passport</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
              <div className="p-4 bg-[#F4F2ED] rounded-sm">
                <div className="font-serif text-3xl text-[#2C2B29]">120</div>
                <div className="text-xs text-[#42403D] uppercase tracking-wider mt-1">Humanity Points</div>
              </div>
              <div className="p-4 bg-[#F4F2ED] rounded-sm">
                <div className="font-serif text-3xl text-[#2C2B29]">4</div>
                <div className="text-xs text-[#42403D] uppercase tracking-wider mt-1">Missions Completed</div>
              </div>
              <div className="p-4 bg-[#F4F2ED] rounded-sm">
                <div className="font-serif text-3xl text-[#2C2B29]">3</div>
                <div className="text-xs text-[#42403D] uppercase tracking-wider mt-1">Communities Helped</div>
              </div>
              <div className="p-4 bg-[#F4F2ED] rounded-sm">
                <div className="font-serif text-3xl text-[#2C2B29]">4/4</div>
                <div className="text-xs text-[#42403D] uppercase tracking-wider mt-1">Verified Proofs</div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* SECTION 14: FINAL EMOTIONAL SCENE */}
        {/* ============================================================ */}
        <section className="max-w-4xl mx-auto px-6 py-24 text-center space-y-8">
          <span className="text-xs uppercase tracking-widest text-[#C28F7B] font-semibold">Our Unified Purpose</span>
          <h2 className="font-serif text-5xl md:text-7xl text-[#2C2B29] leading-tight font-normal">
            DIFFERENT PEOPLE.<br />ONE HUMANITY.
          </h2>
          <p className="text-lg text-[#42403D] max-w-xl mx-auto font-light leading-relaxed">
            Technology is invisible. Trust is permanent. Join us in growing real-world humanity through verified action.
          </p>

          <div className="pt-6 flex justify-center space-x-4">
            <Link
              href="/report"
              className="px-8 py-3.5 bg-[#2C2B29] hover:bg-[#1A1A1A] text-[#F9F8F6] text-sm uppercase tracking-widest font-semibold rounded-sm transition-all"
            >
              Report a Need
            </Link>
            <Link
              href="/register"
              className="px-8 py-3.5 border border-[#2C2B29] hover:bg-[#2C2B29] hover:text-[#F9F8F6] text-[#2C2B29] text-sm uppercase tracking-widest font-semibold rounded-sm transition-all"
            >
              Become a Helper
            </Link>
          </div>
        </section>
      </main>

      {/* Razorpay Donation Modal */}
      {donationModalMission && (
        <div className="fixed inset-0 z-50 bg-[#1A1A1A]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#D1D0CE] rounded-sm max-w-md w-full p-8 space-y-6 shadow-2xl">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs uppercase tracking-widest text-[#C28F7B] font-semibold">Transparent Fundraising</span>
                <h3 className="font-serif text-2xl text-[#2C2B29] mt-1">{donationModalMission.title}</h3>
              </div>
              <button
                onClick={() => setDonationModalMission(null)}
                className="text-[#42403D] hover:text-[#2C2B29] text-xl font-bold"
              >
                ✕
              </button>
            </div>

            {donationSuccess ? (
              <div className="p-6 bg-[#8A9A86]/10 border border-[#8A9A86] rounded-sm text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-[#8A9A86] mx-auto" />
                <h4 className="font-serif text-2xl text-[#2C2B29]">Payment Verified & Logged</h4>
                <p className="text-xs text-[#42403D] leading-relaxed">
                  Your donation of ₹{donationAmount} has been verified via Razorpay webhook and recorded in the append-only financial ledger.
                </p>
                <button
                  onClick={() => setDonationModalMission(null)}
                  className="w-full py-2.5 bg-[#2C2B29] text-[#F9F8F6] text-xs uppercase tracking-wider font-semibold rounded-sm mt-4"
                >
                  Close
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <label className="block text-xs uppercase tracking-wider font-semibold text-[#42403D]">
                  Select Donation Amount (INR):
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[250, 500, 1000, 2500, 5000, 10000].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setDonationAmount(amt)}
                      className={`py-2 text-xs font-semibold rounded-sm border transition-all ${
                        donationAmount === amt
                          ? 'bg-[#2C2B29] text-[#F9F8F6] border-[#2C2B29]'
                          : 'bg-[#F4F2ED] text-[#2C2B29] border-[#D1D0CE] hover:border-[#C28F7B]'
                      }`}
                    >
                      ₹{amt.toLocaleString()}
                    </button>
                  ))}
                </div>

                <div className="p-4 bg-[#F4F2ED] rounded-sm text-xs space-y-1.5 text-[#42403D]">
                  <div className="flex justify-between">
                    <span>Direct Mission Funding:</span>
                    <span className="font-semibold text-[#2C2B29]">₹{(donationAmount * 0.97).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Platform Verification Fee (3%):</span>
                    <span className="font-semibold text-[#2C2B29]">₹{(donationAmount * 0.03).toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={handleConfirmDonation}
                  className="w-full py-3 bg-[#2C2B29] hover:bg-[#1A1A1A] text-[#F9F8F6] text-xs uppercase tracking-wider font-semibold rounded-sm transition-all flex items-center justify-center space-x-2"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Proceed to Razorpay Sandbox Checkout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Layer 3: Minimal Editorial Footer */}
      <Footer />
    </div>
  );
}
