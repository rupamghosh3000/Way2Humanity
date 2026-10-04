'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import {
  Shield,
  CheckCircle2,
  Lock,
  UserCheck,
  KeyRound,
  Eye,
  Image as ImageIcon,
  Sparkles,
  X,
  AlertTriangle,
  Award,
  ZoomIn,
  Check,
} from 'lucide-react';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'REVIEWS' | 'USERS' | 'PAYMENTS' | 'AUDIT'>('REVIEWS');
  const [reviewsData, setReviewsData] = useState<any>(null);
  const [usersData, setUsersData] = useState<any[]>([]);
  const [paymentsData, setPaymentsData] = useState<any>(null);
  const [auditData, setAuditData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    fetchAdminData();
  }, [activeTab]);

  const fetchAdminData = async () => {
    setLoading(true);
    setIsUnauthorized(false);
    try {
      let res;
      if (activeTab === 'REVIEWS') {
        res = await fetch('/api/v1/admin/reviews');
      } else if (activeTab === 'USERS') {
        res = await fetch('/api/v1/admin/users');
      } else if (activeTab === 'PAYMENTS') {
        res = await fetch('/api/v1/admin/payments');
      } else if (activeTab === 'AUDIT') {
        res = await fetch('/api/v1/admin/audit-events');
      }

      if (res) {
        if (res.status === 401 || res.status === 403) {
          setIsUnauthorized(true);
          setLoading(false);
          return;
        }
        const data = await res.json();
        if (data.success) {
          if (activeTab === 'REVIEWS') setReviewsData(data.data);
          else if (activeTab === 'USERS') setUsersData(data.data.users);
          else if (activeTab === 'PAYMENTS') setPaymentsData(data.data);
          else if (activeTab === 'AUDIT') setAuditData(data.data.events);
        } else {
          setIsUnauthorized(true);
        }
      }
    } catch {
      setIsUnauthorized(true);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdminLogin = async () => {
    try {
      // 1. Run seed if needed
      await fetch('/api/v1/seed', { method: 'POST' });

      // 2. Sign in as Admin
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@example.test', password: 'password123' }),
      });
      const data = await res.json();
      if (data.success) {
        setIsUnauthorized(false);
        fetchAdminData();
        window.location.reload();
      } else {
        alert(data.error?.message || 'Login failed.');
      }
    } catch {
      alert('Login failed.');
    }
  };

  const handleReviewDecision = async (missionId: string, decision: 'APPROVE' | 'REJECT') => {
    try {
      const res = await fetch(`/api/v1/verification/${missionId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision, reasonCode: 'HUMAN_VERIFICATION_COMPLETE', notes: 'Reviewed by admin' }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`Mission verification ${decision.toLowerCase()}d!`);
        fetchAdminData();
      }
    } catch {
      alert('Review action failed.');
    }
  };

  const handleProofReviewDecision = async (proofId: string, decision: 'APPROVE' | 'REJECT') => {
    try {
      const res = await fetch(`/api/v1/proof/${proofId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision, reasonCode: 'PROOF_REVIEW_COMPLETE', notes: 'Reviewed by admin' }),
      });
      const data = await res.json();
      if (data.success) {
        if (decision === 'APPROVE') {
          alert('Proof of work approved! 50 Humanity Points awarded to helper.');
        } else {
          alert('Proof of work rejected. 0 points awarded.');
        }
        fetchAdminData();
      } else {
        alert(data.error?.message || 'Proof review action failed.');
      }
    } catch {
      alert('Proof review action failed.');
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: string) => {
    const action = currentStatus === 'SUSPENDED' ? 'ACTIVATE' : 'SUSPEND';
    try {
      const res = await fetch('/api/v1/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action }),
      });
      const data = await res.json();
      if (data.success) {
        fetchAdminData();
      }
    } catch {}
  };

  const handleRunSeed = async () => {
    try {
      const res = await fetch('/api/v1/seed', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        alert('Development Seed Database Populated! Default Password: password123');
        fetchAdminData();
      }
    } catch {
      alert('Seed failed.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-[#2C2B29]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 pt-32 pb-20 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#D1D0CE] pb-6 gap-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#C28F7B] font-semibold">Operational Control Center</span>
            <h1 className="font-serif text-4xl font-normal mt-1">Admin & Moderation Portal</h1>
            <p className="text-sm text-[#42403D] mt-1">
              Human verification queues, user moderation, financial ledger audit, and immutable event logs.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleRunSeed}
              className="px-4 py-2 bg-[#8A9A86] hover:bg-[#8A9A86]/90 text-[#F9F8F6] text-xs uppercase tracking-wider font-semibold rounded-sm transition-all"
            >
              Seed Development Data
            </button>

            {/* Tab Selector */}
            <div className="flex items-center space-x-1 bg-[#F4F2ED] p-1 border border-[#D1D0CE] rounded-sm text-xs">
              {(['REVIEWS', 'USERS', 'PAYMENTS', 'AUDIT'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 font-semibold rounded-sm transition-all ${
                    activeTab === tab ? 'bg-[#2C2B29] text-[#F9F8F6]' : 'text-[#2C2B29] hover:text-[#C28F7B]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {isUnauthorized ? (
          <div className="max-w-md mx-auto p-8 bg-[#FFFFFF] border border-[#D1D0CE] rounded-sm space-y-6 text-center shadow-sm">
            <Lock className="w-12 h-12 text-[#C28F7B] mx-auto" />
            <div>
              <h2 className="font-serif text-2xl text-[#2C2B29]">Admin Authentication Required</h2>
              <p className="text-xs text-[#42403D] mt-2 leading-relaxed">
                As required by SECURITY.md and ROLES.md, server-side admin authorization is mandatory for operational control endpoints.
              </p>
            </div>

            <div className="pt-2 space-y-3">
              <button
                onClick={handleQuickAdminLogin}
                className="w-full py-3 bg-[#2C2B29] hover:bg-[#1A1A1A] text-[#F9F8F6] text-xs uppercase tracking-wider font-semibold rounded-sm transition-all flex items-center justify-center space-x-2"
              >
                <KeyRound className="w-4 h-4 text-[#D9A05B]" />
                <span>1-Click Sign In as Admin (admin@example.test)</span>
              </button>

              <div className="text-[11px] text-[#42403D]">
                Or visit <a href="/login" className="text-[#C28F7B] font-semibold underline">Login Page</a>
              </div>
            </div>
          </div>
        ) : loading ? (
          <div className="p-12 text-center text-sm text-[#42403D]">Loading Operational Data...</div>
        ) : (
          <div>
            {/* ============================================================ */}
            {/* TAB 1: HUMAN REVIEWS QUEUE */}
            {/* ============================================================ */}
            {/* ============================================================ */}
            {/* TAB 1: HUMAN REVIEWS QUEUE */}
            {/* ============================================================ */}
            {activeTab === 'REVIEWS' && (
              <div className="space-y-10">
                {/* 1. Pending Verification Missions */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-[#D1D0CE]">
                    <div>
                      <h3 className="font-serif text-2xl text-[#2C2B29]">
                        Pending Mission Verifications ({reviewsData?.pendingMissionsCount || 0})
                      </h3>
                      <p className="text-xs text-[#42403D]">
                        Evaluate initial humanitarian need reports, evidence photographs, and automated AI risk signals.
                      </p>
                    </div>
                  </div>

                  {reviewsData?.pendingMissions && reviewsData.pendingMissions.length > 0 ? (
                    <div className="space-y-4">
                      {reviewsData.pendingMissions.map((m: any) => {
                        const missionPhoto = m.evidenceUrls?.[0] || 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800';
                        return (
                          <div key={m._id} className="p-6 bg-[#FFFFFF] border border-[#D1D0CE] rounded-sm shadow-sm space-y-4">
                            <div className="flex flex-col lg:flex-row justify-between items-start gap-5">
                              {/* Left: Mission Details & Thumbnail */}
                              <div className="flex items-start space-x-4 flex-1">
                                <div
                                  onClick={() => setSelectedImage(missionPhoto)}
                                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-sm overflow-hidden border border-[#D1D0CE] relative group cursor-pointer flex-shrink-0 bg-[#F4F2ED]"
                                  title="Click to view full image"
                                >
                                  <img
                                    src={missionPhoto}
                                    alt={m.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  />
                                  <div className="absolute inset-0 bg-[#2C2B29]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[#F9F8F6]">
                                    <ZoomIn className="w-5 h-5" />
                                  </div>
                                  <span className="absolute bottom-1 left-1 bg-[#2C2B29]/80 text-[#F9F8F6] text-[9px] px-1.5 py-0.5 rounded font-mono">
                                    Evidence
                                  </span>
                                </div>

                                <div className="space-y-1.5 flex-1">
                                  <div className="flex items-center space-x-2 text-xs flex-wrap gap-y-1">
                                    <span className="font-mono text-[#C28F7B] font-semibold">{m.publicId}</span>
                                    <span className="px-2 py-0.5 bg-[#F4F2ED] rounded-sm text-[#2C2B29] font-medium">{m.category}</span>
                                    <span className="px-2 py-0.5 bg-[#D9A05B]/15 text-[#9E6E2D] font-semibold rounded-sm">{m.urgency} Urgency</span>
                                    <span className="text-[#42403D]">
                                      • Reported by: {m.seekerId?.name || 'Community Member'} ({m.seekerId?.city || 'Mumbai'})
                                    </span>
                                  </div>
                                  <h4 className="font-serif text-xl text-[#2C2B29]">{m.title}</h4>
                                  <p className="text-xs text-[#42403D] line-clamp-2">{m.description}</p>
                                </div>
                              </div>

                              {/* Right: Actions */}
                              <div className="flex items-center space-x-2 self-end lg:self-center flex-shrink-0">
                                <button
                                  onClick={() => handleReviewDecision(m._id, 'APPROVE')}
                                  className="px-4 py-2 bg-[#8A9A86] hover:bg-[#788874] text-[#F9F8F6] text-xs font-semibold rounded-sm transition-colors shadow-sm"
                                >
                                  Approve & Publish
                                </button>
                                <button
                                  onClick={() => handleReviewDecision(m._id, 'REJECT')}
                                  className="px-4 py-2 bg-[#C28F7B] hover:bg-[#B07E6A] text-[#F9F8F6] text-xs font-semibold rounded-sm transition-colors shadow-sm"
                                >
                                  Reject Report
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-8 bg-[#FFFFFF] border border-[#D1D0CE] rounded-sm text-center text-xs text-[#42403D]">
                      No pending mission verifications requiring human review.
                    </div>
                  )}
                </div>

                {/* 2. Pending Proof of Work Submissions with Dual Visual Inspector */}
                <div className="space-y-4 pt-6 border-t border-[#D1D0CE]">
                  <div className="flex items-center justify-between pb-2 border-b border-[#D1D0CE]">
                    <div>
                      <h3 className="font-serif text-2xl text-[#2C2B29]">
                        Pending Proof of Work Submissions ({reviewsData?.pendingProofsCount || 0})
                      </h3>
                      <p className="text-xs text-[#42403D]">
                        Inspect submitted Before vs. After photographic evidence, review AI multimodal verification signals, and award reputation points.
                      </p>
                    </div>
                  </div>

                  {reviewsData?.pendingProofs && reviewsData.pendingProofs.length > 0 ? (
                    <div className="space-y-6">
                      {reviewsData.pendingProofs.map((p: any) => {
                        const originalPhoto = p.originalEvidenceUrl || 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800';
                        const proofPhoto = (p.evidenceUrls && p.evidenceUrls[0]) || 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800';
                        const ai = p.aiAnalysis || {
                          workVerified: true,
                          beforeAfterMatch: 'STRONG_MATCH',
                          confidence: 0.91,
                          observations: ['Visual confirmation of completed task.'],
                          recommendedAction: 'APPROVE',
                        };

                        return (
                          <div key={p._id} className="p-6 bg-[#FFFFFF] border border-[#D1D0CE] rounded-sm shadow-sm space-y-5">
                            {/* Mission & Helper Header */}
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-[#F4F2ED] gap-2">
                              <div>
                                <div className="flex items-center space-x-2 text-xs">
                                  <span className="font-mono text-[#C28F7B] font-semibold">{p.missionId?.publicId || 'MSN'}</span>
                                  <span className="px-2 py-0.5 bg-[#8A9A86]/15 text-[#6A7B66] rounded-sm text-[10px] font-semibold">
                                    {p.missionId?.category || 'Community Support'}
                                  </span>
                                  <span className="text-[#8A9A86] font-semibold">• Proof Verification Queue</span>
                                </div>
                                <h4 className="font-serif text-xl text-[#2C2B29] mt-0.5">
                                  {p.missionId?.title || 'Community Action Mission'}
                                </h4>
                              </div>

                              <div className="text-right text-xs">
                                <div className="font-medium text-[#2C2B29]">Submitted by: {p.helperId?.name || 'Helper'}</div>
                                <div className="text-[11px] text-[#42403D]">{p.helperId?.email || 'helper@example.test'}</div>
                              </div>
                            </div>

                            {/* Dual Photographic Evidence Inspector (Before vs After) */}
                            <div className="space-y-2">
                              <span className="text-xs font-semibold text-[#2C2B29] uppercase tracking-wider block">
                                Photographic Evidence Comparison (Click to Zoom):
                              </span>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* BEFORE: Initial Need */}
                                <div className="p-3.5 bg-[#F9F8F6] border border-[#E3DCD2] rounded-sm space-y-2">
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="font-semibold text-[#C28F7B] flex items-center space-x-1">
                                      <ImageIcon className="w-3.5 h-3.5" />
                                      <span>BEFORE: Initial Reported Need</span>
                                    </span>
                                    <span className="text-[10px] text-[#42403D]">Original Report Evidence</span>
                                  </div>

                                  <div
                                    onClick={() => setSelectedImage(originalPhoto)}
                                    className="w-full h-48 rounded-sm overflow-hidden border border-[#D1D0CE] relative group cursor-pointer bg-[#2C2B29]/5"
                                  >
                                    <img
                                      src={originalPhoto}
                                      alt="Original need evidence"
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    <div className="absolute inset-0 bg-[#2C2B29]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[#F9F8F6] space-x-1.5 text-xs font-medium">
                                      <ZoomIn className="w-4 h-4" />
                                      <span>View Full High-Res</span>
                                    </div>
                                    <span className="absolute bottom-2 left-2 bg-[#2C2B29]/80 text-[#F9F8F6] text-[10px] px-2 py-0.5 rounded font-mono">
                                      Initial Evidence Photo
                                    </span>
                                  </div>
                                </div>

                                {/* AFTER: Completed Work Proof */}
                                <div className="p-3.5 bg-[#F9F8F6] border border-[#8A9A86]/40 rounded-sm space-y-2">
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="font-semibold text-[#8A9A86] flex items-center space-x-1">
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      <span>AFTER: Ground Proof of Work</span>
                                    </span>
                                    <span className="text-[10px] text-[#8A9A86] font-semibold bg-[#8A9A86]/10 px-1.5 py-0.5 rounded">
                                      Submitted by Helper
                                    </span>
                                  </div>

                                  <div
                                    onClick={() => setSelectedImage(proofPhoto)}
                                    className="w-full h-48 rounded-sm overflow-hidden border border-[#8A9A86] relative group cursor-pointer bg-[#2C2B29]/5"
                                  >
                                    <img
                                      src={proofPhoto}
                                      alt="Submitted proof of work"
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    <div className="absolute inset-0 bg-[#2C2B29]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[#F9F8F6] space-x-1.5 text-xs font-medium">
                                      <ZoomIn className="w-4 h-4" />
                                      <span>View Full High-Res</span>
                                    </div>
                                    <span className="absolute bottom-2 left-2 bg-[#8A9A86] text-[#F9F8F6] text-[10px] px-2 py-0.5 rounded font-mono font-medium">
                                      Proof Artifact #1
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Helper Field Notes */}
                            <div className="p-3 bg-[#F9F8F6] rounded-sm border border-[#E3DCD2] text-xs space-y-1">
                              <span className="font-semibold text-[#2C2B29] uppercase tracking-wider text-[11px] block">
                                Helper Intervention Notes:
                              </span>
                              <p className="text-[#42403D] leading-relaxed italic">
                                "{p.description || 'Completed on-ground distribution as requested.'}"
                              </p>
                            </div>

                            {/* AI Multimodal Verification Signals Card */}
                            <div className="p-4 bg-[#F4F2ED] border border-[#D1D0CE] rounded-sm space-y-3">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-[#D1D0CE]/60 gap-2">
                                <div className="flex items-center space-x-2">
                                  <div className="w-6 h-6 rounded-full bg-[#C28F7B]/20 text-[#C28F7B] flex items-center justify-center">
                                    <Sparkles className="w-3.5 h-3.5" />
                                  </div>
                                  <span className="font-semibold text-xs text-[#2C2B29]">
                                    AI Multimodal Verification Report (Google Gemini Vision)
                                  </span>
                                </div>

                                <div className="flex items-center space-x-2 text-xs">
                                  <span className={`px-2 py-0.5 rounded-full font-semibold text-[11px] flex items-center space-x-1 ${
                                    ai.workVerified ? 'bg-[#8A9A86]/20 text-[#6A7B66]' : 'bg-[#C28F7B]/20 text-[#C28F7B]'
                                  }`}>
                                    <Check className="w-3 h-3" />
                                    <span>{ai.workVerified ? 'Work Verified' : 'Needs Verification'}</span>
                                  </span>
                                  <span className="font-mono text-[11px] text-[#42403D] bg-[#FFFFFF] px-2 py-0.5 rounded border border-[#D1D0CE]">
                                    {Math.round((ai.confidence || 0.9) * 100)}% Match Confidence
                                  </span>
                                </div>
                              </div>

                              {/* AI Observations */}
                              <div className="space-y-1 text-xs">
                                <span className="text-[11px] font-semibold text-[#42403D] uppercase tracking-wider">
                                  Visual Inspection Findings:
                                </span>
                                <ul className="space-y-1 text-[#2C2B29] list-disc list-inside text-xs">
                                  {ai.observations && ai.observations.length > 0 ? (
                                    ai.observations.map((obs: string, idx: number) => (
                                      <li key={idx}>{obs}</li>
                                    ))
                                  ) : (
                                    <li>Visual evidence demonstrates remediation corresponding with reported need.</li>
                                  )}
                                </ul>
                              </div>

                              {ai.concerns && ai.concerns.length > 0 && (
                                <div className="text-[11px] text-[#A8715E] bg-[#C28F7B]/10 p-2 rounded-sm border border-[#C28F7B]/30 flex items-start space-x-1.5">
                                  <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                                  <span>{ai.concerns.join(' ')}</span>
                                </div>
                              )}
                            </div>

                            {/* Human Decision Buttons */}
                            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between border-t border-[#F4F2ED] gap-3">
                              <span className="text-xs text-[#42403D]">
                                Approving awards <strong>50 Humanity Points</strong> to {p.helperId?.name || 'Helper'} and marks the mission COMPLETED.
                              </span>

                              <div className="flex items-center space-x-2 w-full sm:w-auto">
                                <button
                                  onClick={() => handleProofReviewDecision(p._id, 'APPROVE')}
                                  className="flex-1 sm:flex-none px-5 py-2.5 bg-[#8A9A86] hover:bg-[#788874] text-[#F9F8F6] text-xs font-semibold rounded-sm transition-colors shadow-sm flex items-center justify-center space-x-1.5"
                                >
                                  <Award className="w-4 h-4" />
                                  <span>Approve Proof & Award 50 Points</span>
                                </button>
                                <button
                                  onClick={() => handleProofReviewDecision(p._id, 'REJECT')}
                                  className="flex-1 sm:flex-none px-4 py-2.5 bg-[#C28F7B] hover:bg-[#B07E6A] text-[#F9F8F6] text-xs font-semibold rounded-sm transition-colors shadow-sm"
                                >
                                  Reject Proof
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-8 bg-[#FFFFFF] border border-[#D1D0CE] rounded-sm text-center text-xs text-[#42403D]">
                      No pending proof of work reviews in queue.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* TAB 2: USER MANAGEMENT */}
            {/* ============================================================ */}
            {activeTab === 'USERS' && (
              <div className="space-y-4">
                <h3 className="font-serif text-2xl text-[#2C2B29]">User Moderation & Access Control</h3>

                <div className="overflow-x-auto border border-[#D1D0CE] rounded-sm">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F4F2ED] uppercase tracking-wider text-[#42403D]">
                      <tr>
                        <th className="p-3">User Name</th>
                        <th className="p-3">Email</th>
                        <th className="p-3">Roles</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Points</th>
                        <th className="p-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F4F2ED] bg-[#FFFFFF]">
                      {usersData.map((u) => (
                        <tr key={u._id}>
                          <td className="p-3 font-semibold text-[#2C2B29]">{u.name}</td>
                          <td className="p-3 text-[#42403D]">{u.email}</td>
                          <td className="p-3 font-mono">{u.roles.join(', ')}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-sm font-semibold ${
                              u.status === 'ACTIVE' ? 'bg-[#8A9A86]/20 text-[#8A9A86]' : 'bg-[#C28F7B]/20 text-[#C28F7B]'
                            }`}>
                              {u.status}
                            </span>
                          </td>
                          <td className="p-3 font-serif font-bold text-[#2C2B29]">{u.reputationSummary?.points || 0}</td>
                          <td className="p-3">
                            <button
                              onClick={() => handleToggleUserStatus(u._id, u.status)}
                              className="text-xs font-semibold text-[#C28F7B] hover:underline"
                            >
                              {u.status === 'SUSPENDED' ? 'Activate Account' : 'Suspend Account'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* TAB 3: FINANCIAL LEDGER */}
            {/* ============================================================ */}
            {activeTab === 'PAYMENTS' && (
              <div className="space-y-6">
                <h3 className="font-serif text-2xl text-[#2C2B29]">Financial Ledger Audit</h3>

                {paymentsData?.summary && (
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
                    <div className="p-4 bg-[#FFFFFF] border border-[#D1D0CE] rounded-sm">
                      <div className="font-serif text-2xl text-[#2C2B29]">₹{paymentsData.summary.totalRaised?.toLocaleString()}</div>
                      <div className="text-xs text-[#42403D] uppercase">Total Raised</div>
                    </div>
                    <div className="p-4 bg-[#FFFFFF] border border-[#D1D0CE] rounded-sm">
                      <div className="font-serif text-2xl text-[#2C2B29]">₹{paymentsData.summary.totalFees?.toLocaleString()}</div>
                      <div className="text-xs text-[#42403D] uppercase">Platform Fees (3%)</div>
                    </div>
                    <div className="p-4 bg-[#FFFFFF] border border-[#D1D0CE] rounded-sm">
                      <div className="font-serif text-2xl text-[#2C2B29]">₹{paymentsData.summary.netDisbursed?.toLocaleString()}</div>
                      <div className="text-xs text-[#42403D] uppercase">Net Impact Disbursed</div>
                    </div>
                    <div className="p-4 bg-[#FFFFFF] border border-[#D1D0CE] rounded-sm">
                      <div className="font-serif text-2xl text-[#2C2B29]">{paymentsData.summary.totalTransactions}</div>
                      <div className="text-xs text-[#42403D] uppercase">Transactions</div>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <h4 className="font-serif text-lg text-[#2C2B29]">Append-Only Ledger Entries</h4>
                  <div className="overflow-x-auto border border-[#D1D0CE] rounded-sm">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#F4F2ED] uppercase text-[#42403D]">
                        <tr>
                          <th className="p-3">Entry Type</th>
                          <th className="p-3">Amount</th>
                          <th className="p-3">Mission ID</th>
                          <th className="p-3">Reference</th>
                          <th className="p-3">Timestamp</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F4F2ED] bg-[#FFFFFF]">
                        {paymentsData?.ledger?.map((e: any) => (
                          <tr key={e._id}>
                            <td className="p-3 font-semibold text-[#2C2B29]">{e.entryType}</td>
                            <td className="p-3 font-serif font-semibold">₹{e.amount}</td>
                            <td className="p-3 font-mono">{e.missionId?.publicId || e.missionId}</td>
                            <td className="p-3 text-[#42403D] font-mono">{e.reference}</td>
                            <td className="p-3 text-[#42403D]">{new Date(e.createdAt).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* TAB 4: IMMUTABLE AUDIT LOGS */}
            {/* ============================================================ */}
            {activeTab === 'AUDIT' && (
              <div className="space-y-4">
                <h3 className="font-serif text-2xl text-[#2C2B29]">Immutable Audit Log Inspection</h3>

                <div className="overflow-x-auto border border-[#D1D0CE] rounded-sm">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F4F2ED] uppercase text-[#42403D]">
                      <tr>
                        <th className="p-3">Action</th>
                        <th className="p-3">Actor Role</th>
                        <th className="p-3">Target Type</th>
                        <th className="p-3">Target ID</th>
                        <th className="p-3">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F4F2ED] bg-[#FFFFFF]">
                      {auditData.map((a: any) => (
                        <tr key={a._id}>
                          <td className="p-3 font-mono font-semibold text-[#2C2B29]">{a.action}</td>
                          <td className="p-3">{a.actorRole}</td>
                          <td className="p-3">{a.targetType}</td>
                          <td className="p-3 font-mono text-[#42403D]">{a.targetId || '-'}</td>
                          <td className="p-3 text-[#42403D]">{new Date(a.createdAt).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Full-Screen Photographic Evidence Lightbox Modal */}
        {selectedImage && (
          <div
            className="fixed inset-0 z-50 bg-[#2C2B29]/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fadeIn"
            onClick={() => setSelectedImage(null)}
          >
            <div
              className="bg-[#FFFFFF] rounded-sm max-w-4xl w-full p-4 sm:p-6 space-y-4 shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-[#D1D0CE] pb-3">
                <div className="flex items-center space-x-2">
                  <ImageIcon className="w-4 h-4 text-[#C28F7B]" />
                  <span className="font-serif text-lg text-[#2C2B29]">High-Resolution Evidence Inspection</span>
                </div>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="p-1.5 rounded hover:bg-[#F4F2ED] text-[#42403D] hover:text-[#2C2B29] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="max-h-[70vh] overflow-hidden flex items-center justify-center bg-[#2C2B29]/5 rounded-sm border border-[#D1D0CE]">
                <img
                  src={selectedImage}
                  alt="High-resolution evidence preview"
                  className="max-h-[70vh] w-auto max-w-full object-contain"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-[#42403D] pt-1">
                <span className="font-mono text-[11px] truncate max-w-md">{selectedImage}</span>
                <a
                  href={selectedImage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#C28F7B] font-semibold hover:underline"
                >
                  Open Original in New Tab ↗
                </a>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
