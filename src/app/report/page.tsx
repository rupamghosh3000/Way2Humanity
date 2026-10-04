'use client';

import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Shield, Sparkles, CheckCircle2, AlertTriangle, Upload, FileCheck, MapPin } from 'lucide-react';

export default function ReportPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Food Support');
  const [urgency, setUrgency] = useState('MEDIUM');
  const [city, setCity] = useState('Mumbai');
  const [address, setAddress] = useState('Sector 3, Dharavi');
  const [fundingEnabled, setFundingEnabled] = useState(true);
  const [fundingTarget, setFundingTarget] = useState(25000);
  const [evidenceUrl, setEvidenceUrl] = useState('https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800');
  const [fileObj, setFileObj] = useState<File | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadedFileMeta, setUploadedFileMeta] = useState<any>(null);

  const [loading, setLoading] = useState(false);
  const [copilotLoading, setCopilotLoading] = useState(false);
  const [successMission, setSuccessMission] = useState<any>(null);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileObj(file);
    setUploadingFile(true);
    setErrorMsg('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/v1/uploads/file', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error?.message || 'File upload failed.');
      }

      setEvidenceUrl(data.data.url);
      setUploadedFileMeta(data.data);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'File upload failed.');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleCopilotAutoFill = async () => {
    if (!description.trim()) {
      setErrorMsg('Please enter a problem description first to use AI Copilot.');
      return;
    }
    setCopilotLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/v1/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: description }),
      });
      const data = await res.json();
      if (data.success) {
        const copilot = data.data.copilot;
        if (copilot.title && !title) setTitle(copilot.title);
        if (copilot.category) setCategory(copilot.category);
        if (copilot.urgency) setUrgency(copilot.urgency);
        if (copilot.suggestedLocation) setAddress(copilot.suggestedLocation);
      }
    } catch (err: unknown) {
      setErrorMsg('AI Copilot failed. You can fill the fields manually.');
    } finally {
      setCopilotLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setVerificationResult(null);

    try {
      // 1. Create Mission Report
      const res = await fetch('/api/v1/missions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          category,
          urgency,
          location: {
            addressApprox: address,
            city,
            region: 'Maharashtra',
            latitude: 19.0402,
            longitude: 72.8553,
          },
          fundingEnabled,
          fundingTarget: fundingEnabled ? Number(fundingTarget) : 0,
          evidenceUrls: [evidenceUrl],
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to create report.');
      }

      const createdMission = data.data.mission;

      // 2. Submit for REAL Multimodal AI Verification Pipeline
      const submitRes = await fetch(`/api/v1/missions/${createdMission.publicId}/submit`, {
        method: 'POST',
      });
      const submitData = await submitRes.json();

      setSuccessMission(submitData.data?.mission || createdMission);
      setVerificationResult(submitData.data?.verificationResult || null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Submission failed.';
      if (msg.includes('401') || msg.toLowerCase().includes('auth') || msg.toLowerCase().includes('session')) {
        setErrorMsg('Authentication Required: Please sign in as a Seeker to report a mission.');
      } else {
        setErrorMsg(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSeekerLogin = async () => {
    try {
      await fetch('/api/v1/seed', { method: 'POST' });
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'seeker@example.test', password: 'password123' }),
      });
      const data = await res.json();
      if (data.success) {
        setErrorMsg('');
        alert('Signed in as Seeker (seeker@example.test). You can now submit your report!');
      } else {
        alert(data.error?.message || 'Login failed.');
      }
    } catch {
      alert('Login failed.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-[#2C2B29]">
      <Navbar />

      <main className="max-w-3xl mx-auto px-6 pt-32 pb-20">
        <div className="mb-10 text-center space-y-2">
          <span className="text-xs uppercase tracking-widest text-[#C28F7B] font-semibold">Community Assistance</span>
          <h1 className="font-serif text-4xl font-normal">Report a Real-World Need</h1>
          <p className="text-sm text-[#42403D] max-w-lg mx-auto">
            Your report will be processed by our Multimodal AI Evidence Verification pipeline and routed to trusted human verifiers when required.
          </p>
        </div>

        {successMission ? (
          <div className="p-8 bg-[#FFFFFF] border border-[#8A9A86] rounded-sm space-y-6 text-left shadow-sm">
            <div className="flex items-center space-x-3">
              <CheckCircle2 className="w-8 h-8 text-[#8A9A86]" />
              <div>
                <h2 className="font-serif text-2xl text-[#2C2B29]">Report Submitted & Verification Processed</h2>
                <p className="text-xs text-[#42403D]">Public Mission ID: {successMission.publicId}</p>
              </div>
            </div>

            {/* AI Verification Assessment Results Card */}
            {verificationResult && (
              <div className="p-6 bg-[#F4F2ED] border border-[#D1D0CE] rounded-sm space-y-4 text-xs">
                <div className="flex justify-between items-center pb-3 border-b border-[#D1D0CE]">
                  <span className="font-semibold uppercase text-[#42403D]">AI Verification Status:</span>
                  <span
                    className={`font-semibold px-2.5 py-1 rounded-sm text-[11px] ${
                      verificationResult.status === 'AI_VERIFICATION_UNAVAILABLE'
                        ? 'bg-[#C28F7B]/20 text-[#A8715E]'
                        : verificationResult.overallRisk === 'LOW_RISK'
                        ? 'bg-[#8A9A86]/20 text-[#4A6447]'
                        : 'bg-[#D9A05B]/20 text-[#8C5D23]'
                    }`}
                  >
                    {verificationResult.status === 'AI_VERIFICATION_UNAVAILABLE'
                      ? 'AI VERIFICATION UNAVAILABLE'
                      : `RISK: ${verificationResult.overallRisk}`}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[#42403D] block">Model Provider:</span>
                    <span className="font-mono font-medium">{verificationResult.provider || 'Google Gemini Vision'}</span>
                  </div>
                  <div>
                    <span className="text-[#42403D] block">Requires Human Review:</span>
                    <span className="font-semibold">{verificationResult.requiresHumanReview ? 'YES' : 'NO'}</span>
                  </div>
                </div>

                {verificationResult.reasons?.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[#42403D] font-semibold block">Assessment Findings:</span>
                    <ul className="list-disc list-inside text-[#2C2B29] space-y-1">
                      {verificationResult.reasons.map((r: string, idx: number) => (
                        <li key={idx}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div className="pt-4 flex justify-center space-x-4">
              <a
                href="/radar"
                className="px-6 py-2.5 bg-[#2C2B29] text-[#F9F8F6] text-xs uppercase tracking-wider font-semibold rounded-sm"
              >
                View on Humanity Radar
              </a>
              <button
                onClick={() => {
                  setSuccessMission(null);
                  setVerificationResult(null);
                }}
                className="px-6 py-2.5 border border-[#2C2B29] text-[#2C2B29] text-xs uppercase tracking-wider font-semibold rounded-sm"
              >
                Submit Another Report
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-8 bg-[#FFFFFF] border border-[#D1D0CE] rounded-sm space-y-6 shadow-sm">
            {errorMsg && (
              <div className="p-4 bg-[#C28F7B]/10 border border-[#C28F7B] text-[#A8715E] text-xs rounded-sm space-y-2">
                <div className="flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
                {errorMsg.includes('Authentication Required') && (
                  <button
                    type="button"
                    onClick={handleQuickSeekerLogin}
                    className="mt-2 px-3 py-1.5 bg-[#2C2B29] text-[#F9F8F6] text-xs font-semibold rounded-sm tracking-wider uppercase block"
                  >
                    1-Click Sign In as Seeker (seeker@example.test)
                  </button>
                )}
              </div>
            )}

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs uppercase tracking-wider font-semibold text-[#42403D]">
                  Problem Description *
                </label>
                <button
                  type="button"
                  onClick={handleCopilotAutoFill}
                  disabled={copilotLoading}
                  className="text-xs text-[#C28F7B] hover:underline flex items-center"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1" />
                  {copilotLoading ? 'Copilot Analyzing...' : 'Auto-structure with AI Copilot'}
                </button>
              </div>
              <textarea
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the problem, affected people, and what assistance is required..."
                className="w-full p-4 bg-[#F4F2ED] border border-[#D1D0CE] rounded-sm text-sm text-[#2C2B29] focus:outline-none focus:border-[#C28F7B]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider font-semibold text-[#42403D]">
                Mission Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Emergency Ration Support for 40 Families in Dharavi"
                className="w-full p-3 bg-[#F4F2ED] border border-[#D1D0CE] rounded-sm text-sm text-[#2C2B29] focus:outline-none focus:border-[#C28F7B]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider font-semibold text-[#42403D]">Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-3 bg-[#F4F2ED] border border-[#D1D0CE] rounded-sm text-sm text-[#2C2B29] focus:outline-none focus:border-[#C28F7B]"
                >
                  {[
                    'Food Support',
                    'Education',
                    'Healthcare Support',
                    'Infrastructure',
                    'Emergency Assistance',
                    'Elder Support',
                    'Accessibility',
                    'Environmental Cleanup',
                    'Community Resources',
                    'Other',
                  ].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider font-semibold text-[#42403D]">Urgency Level *</label>
                <select
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value)}
                  className="w-full p-3 bg-[#F4F2ED] border border-[#D1D0CE] rounded-sm text-sm text-[#2C2B29] focus:outline-none focus:border-[#C28F7B]"
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="CRITICAL">CRITICAL</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider font-semibold text-[#42403D]">City / Region *</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full p-3 bg-[#F4F2ED] border border-[#D1D0CE] rounded-sm text-sm text-[#2C2B29]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider font-semibold text-[#42403D]">Approximate Locality *</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-3 bg-[#F4F2ED] border border-[#D1D0CE] rounded-sm text-sm text-[#2C2B29]"
                />
              </div>
            </div>

            {/* Evidence File Upload Section */}
            <div className="space-y-3 p-4 bg-[#F4F2ED] border border-[#D1D0CE] rounded-sm">
              <label className="text-xs uppercase tracking-wider font-semibold text-[#42403D] block">
                Visual Evidence Attachment (Photo / Document) *
              </label>

              <div className="flex items-center space-x-4">
                <label className="px-4 py-2 bg-[#2C2B29] text-[#F9F8F6] text-xs font-semibold uppercase tracking-wider rounded-sm cursor-pointer hover:bg-[#1A1A1A]">
                  {uploadingFile ? 'Hashing & Uploading...' : 'Upload Image File'}
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                <span className="text-xs text-[#42403D]">or enter photo URL below</span>
              </div>

              {uploadedFileMeta && (
                <div className="p-3 bg-[#FFFFFF] border border-[#8A9A86] rounded-sm text-xs space-y-1 font-mono">
                  <div className="flex items-center text-[#4A6447]">
                    <FileCheck className="w-4 h-4 mr-1.5" />
                    <span className="font-semibold">Binary File SHA-256 Hashed & Stored</span>
                  </div>
                  <div className="text-[11px] text-[#42403D] truncate">
                    SHA-256: {uploadedFileMeta.sha256}
                  </div>
                  <div className="text-[11px] text-[#42403D]">
                    Size: {(uploadedFileMeta.size / 1024).toFixed(1)} KB | MIME: {uploadedFileMeta.mimeType}
                  </div>
                </div>
              )}

              <input
                type="url"
                required
                value={evidenceUrl}
                onChange={(e) => setEvidenceUrl(e.target.value)}
                placeholder="https://..."
                className="w-full p-2.5 bg-[#FFFFFF] border border-[#D1D0CE] rounded-sm text-xs text-[#2C2B29]"
              />
            </div>

            <div className="p-4 bg-[#F4F2ED] rounded-sm space-y-3">
              <label className="flex items-center space-x-2 text-xs font-semibold text-[#2C2B29] cursor-pointer">
                <input
                  type="checkbox"
                  checked={fundingEnabled}
                  onChange={(e) => setFundingEnabled(e.target.checked)}
                  className="rounded-sm"
                />
                <span>Enable Transparent Fundraising for this Mission</span>
              </label>
              {fundingEnabled && (
                <div className="space-y-1">
                  <label className="text-[11px] text-[#42403D] uppercase">Target Amount (INR):</label>
                  <input
                    type="number"
                    value={fundingTarget}
                    onChange={(e) => setFundingTarget(Number(e.target.value))}
                    className="w-full p-2 bg-[#FFFFFF] border border-[#D1D0CE] rounded-sm text-sm text-[#2C2B29]"
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#2C2B29] hover:bg-[#1A1A1A] text-[#F9F8F6] text-xs uppercase tracking-widest font-semibold rounded-sm transition-all shadow-md"
            >
              {loading ? 'Submitting & Running Multimodal AI Verification...' : 'Submit Mission Report'}
            </button>
          </form>
        )}
      </main>

      <Footer />
    </div>
  );
}
