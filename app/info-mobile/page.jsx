"use client";
// ============================================================
// FILE DESTINATION: app/info-mobile/page.jsx
// This file creates the route /info-mobile (the Info icon's page).
// ============================================================

// [ADDED 020826] Mobile Companion project — full page for the Info icon in
// ClientLayout's mobile icon row. Was a small popover over the clock on
// MobileHome.jsx; per this session's decision, every icon now navigates to
// a real page instead, so the icon row (which lives in ClientLayout, not
// here) stays visible and shows this as the active tab.
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import JourneyClock, { PHASE_HEX_COLORS } from '@/components/ventures/JourneyClock';

const PHASE_LABELS = { idea: 'Idea', business_plan: 'Plan', mvp: 'MVP', mlp: 'MLP', beta: 'Beta', growth: 'Growth' };
const PHASE_DESCRIPTIONS = {
  idea: 'Turn your spark into a clear venture concept.',
  business_plan: 'Define your mission, market, and business model.',
  mvp: 'Build a minimum viable product and test it with real users.',
  mlp: 'Turn feedback into a more lovable, polished product.',
  beta: 'Open your product to real beta testers.',
  growth: 'Scale what is already working.',
};

export default function JourneyPage() {
  const [venture, setVenture] = useState(null);

  useEffect(() => {
    const load = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const email = userData?.user?.email;
      if (!email) return;
      const { data: ventures } = await supabase
        .from('ventures')
        .select('id, name, phase')
        .eq('created_by', email)
        .order('created_date', { ascending: false })
        .limit(1);
      if (ventures?.[0]) setVenture(ventures[0]);
    };
    load();
  }, []);

  if (!venture) {
    return <div className="p-6 text-center text-gray-400 text-sm">Loading your journey…</div>;
  }

  return (
    <div className="p-4">
      <h1 className="font-bold text-xl text-gray-900 mb-1 text-center">Your Journey</h1>
      <p className="text-sm font-semibold text-center mb-4" style={{ color: PHASE_HEX_COLORS[venture.phase] }}>
        {venture.name} — {PHASE_LABELS[venture.phase]}
      </p>

      <div className="flex justify-center mb-6">
        <JourneyClock currentPhase={venture.phase} maxWidth={260} />
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: PHASE_HEX_COLORS[venture.phase] }}>
          {PHASE_LABELS[venture.phase]}
        </p>
        <p className="text-sm text-gray-600">{PHASE_DESCRIPTIONS[venture.phase]}</p>
      </div>
    </div>
  );
}
