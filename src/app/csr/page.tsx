'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Building2, Download, Plus, FileText, CheckCircle2 } from 'lucide-react';

export default function CSRPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [targetAmount, setTargetAmount] = useState(100000);
  const [slug, setSlug] = useState('');
  const [loading, setLoading] = useState(false);
  const [createdMsg, setCreatedMsg] = useState('');

  useEffect(() => {
    fetch('/api/v1/csr/campaigns')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data.campaigns) {
          setCampaigns(data.data.campaigns);
        }
      })
      .catch(() => {});
  }, []);

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setCreatedMsg('');

    try {
      const res = await fetch('/api/v1/csr/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          targetAmount: Number(targetAmount),
          brandedPageSlug: slug || name.toLowerCase().replace(/\s+/g, '-'),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setCreatedMsg('CSR Campaign created successfully!');
        setName('');
        setDescription('');
        setSlug('');
        // Refresh campaign list
        fetch('/api/v1/csr/campaigns')
          .then((r) => r.json())
          .then((d) => d.success && setCampaigns(d.data.campaigns));
      } else {
        alert(data.error?.message || 'Failed to create campaign. Ensure logged in as CSR Organization.');
      }
    } catch {
      alert('Failed to create campaign. Ensure logged in as CSR Organization.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-[#2C2B29]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 pt-32 pb-20 space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#D1D0CE] pb-6 gap-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#C28F7B] font-semibold">Corporate Social Responsibility</span>
            <h1 className="font-serif text-4xl font-normal mt-1">CSR Command Center</h1>
            <p className="text-sm text-[#42403D] mt-1">
              Fund community impact campaigns, generate branded impact pages, and export verified CSV audit reports.
            </p>
          </div>
        </div>

        {/* CSR Metrics Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          <div className="p-6 bg-[#FFFFFF] border border-[#D1D0CE] rounded-sm text-center">
            <div className="font-serif text-3xl text-[#2C2B29]">₹2,50,000</div>
            <div className="text-xs text-[#42403D] uppercase tracking-wider mt-1">Deployed Impact Funding</div>
          </div>
          <div className="p-6 bg-[#FFFFFF] border border-[#D1D0CE] rounded-sm text-center">
            <div className="font-serif text-3xl text-[#2C2B29]">12</div>
            <div className="text-xs text-[#42403D] uppercase tracking-wider mt-1">Funded Community Missions</div>
          </div>
          <div className="p-6 bg-[#FFFFFF] border border-[#D1D0CE] rounded-sm text-center">
            <div className="font-serif text-3xl text-[#2C2B29]">100%</div>
            <div className="text-xs text-[#42403D] uppercase tracking-wider mt-1">Verified Audit Completion Rate</div>
          </div>
          <div className="p-6 bg-[#FFFFFF] border border-[#D1D0CE] rounded-sm text-center">
            <div className="font-serif text-3xl text-[#2C2B29]">485</div>
            <div className="text-xs text-[#42403D] uppercase tracking-wider mt-1">Direct Beneficiaries Reached</div>
          </div>
        </div>

        {/* Create Campaign Form & Active Campaigns Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create Campaign */}
          <div className="p-6 bg-[#FFFFFF] border border-[#D1D0CE] rounded-sm space-y-4">
            <h3 className="font-serif text-2xl text-[#2C2B29]">Launch CSR Campaign</h3>

            {createdMsg && (
              <div className="p-3 bg-[#8A9A86]/10 border border-[#8A9A86] text-[#8A9A86] text-xs rounded-sm">
                {createdMsg}
              </div>
            )}

            <form onSubmit={handleCreateCampaign} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase text-[#42403D]">Campaign Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Clean Water Initiative 2026"
                  className="w-full p-2.5 bg-[#F4F2ED] border border-[#D1D0CE] rounded-sm text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase text-[#42403D]">Description *</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Campaign impact vision..."
                  className="w-full p-2.5 bg-[#F4F2ED] border border-[#D1D0CE] rounded-sm text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase text-[#42403D]">Target Funding Goal (INR) *</label>
                <input
                  type="number"
                  required
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(Number(e.target.value))}
                  className="w-full p-2.5 bg-[#F4F2ED] border border-[#D1D0CE] rounded-sm text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase text-[#42403D]">Branded Page Slug *</label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. clean-water-2026"
                  className="w-full p-2.5 bg-[#F4F2ED] border border-[#D1D0CE] rounded-sm text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#2C2B29] hover:bg-[#1A1A1A] text-[#F9F8F6] text-xs uppercase tracking-wider font-semibold rounded-sm transition-all"
              >
                {loading ? 'Launching Campaign...' : 'Launch CSR Campaign'}
              </button>
            </form>
          </div>

          {/* Active Campaigns List */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-serif text-2xl text-[#2C2B29]">Active Impact Campaigns</h3>

            {campaigns.length > 0 ? (
              <div className="space-y-4">
                {campaigns.map((camp) => (
                  <div key={camp._id} className="p-6 bg-[#FFFFFF] border border-[#D1D0CE] rounded-sm space-y-4 shadow-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-serif text-xl text-[#2C2B29]">{camp.name}</h4>
                        <div className="text-xs text-[#42403D]">Slug: /csr/{camp.brandedPageSlug}</div>
                      </div>
                      <a
                        href={`/api/v1/csr/campaigns/${camp._id}/report`}
                        download
                        className="px-3.5 py-1.5 border border-[#2C2B29] hover:bg-[#2C2B29] hover:text-[#F9F8F6] text-xs font-medium rounded-sm flex items-center space-x-1.5 transition-all"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Export CSV Audit Report</span>
                      </a>
                    </div>

                    <p className="text-xs text-[#42403D] leading-relaxed">{camp.description}</p>

                    <div className="p-3 bg-[#F4F2ED] rounded-sm flex justify-between text-xs font-medium">
                      <span>Funding Target: ₹{camp.targetAmount?.toLocaleString()}</span>
                      <span className="text-[#8A9A86]">Status: {camp.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 bg-[#FFFFFF] border border-[#D1D0CE] rounded-sm text-center text-xs text-[#42403D]">
                No CSR campaigns created yet. Launch your first corporate impact campaign above!
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
