"use client";
// ============================================================
// FILE DESTINATION: app/info-mobile/page.jsx
// This file creates the route /info-mobile (the Info icon's page).
// ============================================================
//
// [FIX 020826] Real per-stage content, from the founder's own doc
// ("Untitled document (3).docx") — replaces the placeholder one-liners.
// Corrections applied during review: "Your set up" -> "You've set up"
// (MVP), a comma splice fixed with a period ("...your first step. You
// built..." — MLP), and a double space removed ("continue  collecting" ->
// "continue collecting" — MLP).
//
// [NEW] Growth content added this session — not from the source doc (which
// had none), written to match the same voice/structure as the others.
//
// [FIX 020826] No JourneyClock here — it's already shown on the Home page
// (MobileHome.jsx); duplicating it here added nothing.
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { PHASE_HEX_COLORS } from '@/components/ventures/JourneyClock';

const PHASE_CONTENT = {
  business_plan: {
    title: "Let's start zigging!",
    body: "To sharpen a raw idea into something grounded and concrete, you need to connect it to the entrepreneurial and business environment it actually operates in. This stage isn't asking for deep competitor analysis or precise financial modeling, but it's where you start building the foundations for that, and put your core assumptions to the test.\n\nLike any lean plan, this isn't a document you fill out once and file away, it's a living document. In practice, new insights keep surfacing throughout the journey, and you're expected to come back and update the plan as you learn.",
  },
  mvp: {
    title: 'Well done!',
    body: "You've set up the foundations of your venture.\n\nAn MVP is the earliest stage where you connect a raw idea to an actual product, it's not final, and it's not supposed to be. The goal here is just to sharpen it as you go, not to lock it down.\n\nZig helps in two ways on this page: it reviews the features you've selected against your problem and solution, and it can suggest features you haven't thought of yet.\n\nOnce saved, this MVP data feeds into your landing page, where real users are invited to give feedback on it and suggest additional features themselves.\n\nDuring this stage you also need to complete your revenue model and start collecting feedback from the community.",
  },
  mlp: {
    title: 'Great progress!',
    body: "The MVP phase was your first step. You built the skeleton of your product and proved it can work. Now it's time to make it lovable.\n\nThe MLP phase is about precision: refining your product based on real user feedback, sharpening the experience, and building the moments that make users say \"I can't live without this.\" Less about adding features, more about getting the details right.\n\nDuring this stage you also need to continue collecting feedback from the community about your progress and updated demo.",
  },
  beta: {
    title: "You've made it to Beta!",
    body: "This page is not your product, it's your beta sign-up page. Its job is to attract early users, convince them to join your beta program, and collect their sign-ups. The more compelling it is, the more testers you'll attract.\n\nYou need 50 beta sign-ups to move to the Growth phase. Use the Promotion Center to share this page.",
  },
  // [FIX — full rewrite, several rounds of correction this session] The
  // previous version ("You've completed the founder journey!") was
  // explicitly rejected — it read like the founder's journey was over,
  // which is wrong framing. This is the final, explicitly approved content.
  growth: {
    title: "Welcome to the Growth stage",
    body: "On this page, you choose what to show potential viewers, and which categories of feedback you want to collect on your product. This page also exposes viewers to your live product, helping you grow your first user community.\n\nThis is a dynamic process. At any stage, you can update your content and feedback categories to focus on specific aspects, gather feedback after making changes, or invite users to try a new version.\n\nOnce you're done, you'll return to your Dashboard. To actually send out feedback requests, head to the Promotion Center, name your campaign, and choose how many users to reach.\n\nAfter that, you can track how your page is reaching the community on the Product Feedback page.\n\nYou're also part of the StartZig community. Other founders will likely invite you to give feedback on their own ideas and products at various stages. When you do, you're not just helping them — you also earn Insight Credits, which you can use toward your own feedback requests.\n\nHave a successful Zig!",
  },
};

const PHASE_LABELS = { idea: 'Idea', business_plan: 'Plan', mvp: 'MVP', mlp: 'MLP', beta: 'Beta', growth: 'Growth' };

export default function InfoMobilePage() {
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
    return <div className="p-6 text-center text-gray-400 text-sm">Loading…</div>;
  }

  // [ADDED 020826] Growth has no content in the source doc yet — falls back
  // to just the label, not a guessed description.
  const content = PHASE_CONTENT[venture.phase];

  return (
    <div className="p-4">
      {/* [FIX 020826] Was phase (colored, larger) on top and venture name
          (gray, smaller) below — swapped per this session's decision, to
          match the same name-big-blue/phase-small-orange pattern used
          everywhere else (Home page, Venture Profile card). */}
      <p className="text-xl font-bold text-blue-600 text-center mb-1">{venture.name}</p>
      <p className="text-sm font-semibold text-center mb-4" style={{ color: PHASE_HEX_COLORS[venture.phase] }}>
        {PHASE_LABELS[venture.phase]}
      </p>

      {content ? (
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h1 className={`font-bold text-lg mb-3 ${venture.phase === 'growth' ? 'text-emerald-700' : 'text-gray-900'}`}>{content.title}</h1>
          {content.body.split('\n\n').map((para, i) => (
            <p key={i} className="text-sm text-gray-600 leading-relaxed mb-3 last:mb-0">{para}</p>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-400 text-center mt-8">No details for this stage yet.</p>
      )}
    </div>
  );
}
