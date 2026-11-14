"use client";
// app/growth-development/page.jsx   (STEP 1 of 2: venture profile)
//
// The Growth flow is now two separate pages:
//   1. this page: the founder builds the venture profile. "Save and continue" saves it and
//      opens /growth-development/feedback.
//   2. app/growth-development/feedback/page.jsx: choose the feedback questions and finish.
// Two pages make it simpler for the founder and let us see at which step someone stops.
//
// Everything else about saving is unchanged: same growth_data column, same checks, same
// welcome message / email / plan on first creation. The shared pieces (constants, loader helper,
// interactive UI) live in components/ventures/GrowthUI.jsx.
//
// DB DEPENDENCY (pending, unchanged): ALTER TABLE ventures ADD COLUMN growth_data jsonb DEFAULT '{}';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Venture } from '@/api/entities.js';
import { VentureMessage } from '@/api/entities.js';
import { User } from '@/api/entities.js';
import { UploadFile } from '@/api/integrations';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input.jsx';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card.jsx';
import {
  Lightbulb, Check, Upload, Trash2, Loader2, ArrowRight, ChevronDown, Link as LinkIcon,
  Tag, Compass, Megaphone, FileText, Target, Image as ImageIcon, Share2, Pencil,
  Linkedin, Facebook, Twitter, Instagram, Globe, Sparkles,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import MentorModal from '@/components/mentor/MentorModal';
import StaticGuidanceViewer from '@/components/mentor/StaticGuidanceViewer';
import {
  useIsMobile, MobileFieldWrapper, STAGES, STAGE_STYLE, normalizeGrowthData,
  GrowthStyles, HowItWorks, FieldCard, SectorTiles, ZBadge, ZLogo, TipBulb, ProfileDone,
} from '@/components/ventures/GrowthUI';

const GROWTH_FRAMING_SHORT = "On this page, you choose what to show potential viewers, and which categories of feedback you want to collect on your product. This also exposes your live product to the community, helping you grow your first users.";
const GROWTH_FRAMING_MORE = "This is a dynamic process. At any stage, you can update your content and feedback categories to focus on specific aspects, gather feedback after making changes, or invite users to try a new version.\n\nOnce you're done, you'll return to your Dashboard. To actually send out feedback requests, head to the Promotion Center, name your brief, and choose how many users to reach. After that, you can track how your page is reaching the community on the Product Feedback page.\n\nYou're also part of the StartZig community. Other founders will likely invite you to give feedback on their own ideas and products at various stages. When you do, you're not just helping them — you also earn Zigback, which you can use toward your own feedback requests.";

// [NEW — Idea stage] Which existing Zig it config / Tips entry each ZigPulse
// field maps to. 'problem' and 'solution' are the business_plan fields in
// zigConfig.js; 'problem_statement' and 'proposed_solution' are the Tips
// entries in StaticGuidance.jsx.
// Idea: Need + Your Solution. Prototype: Need + The Product (same two page fields).
const getZigFields = (stage) => ({
  need: { fieldKey: 'problem', title: 'The Need', tipsId: 'problem_statement' },
  solution: stage === 'prototype'
    ? { fieldKey: 'product_details', title: 'The Product', tipsId: 'product_details' }
    : { fieldKey: 'solution', title: 'Your Solution', tipsId: 'proposed_solution' },
});

// Two equal-width buttons: Z (AI analysis, the logo slowly fills with colour) and Tips (the bulb lights up now and then).
const ZigTipsButtons = ({ onZig, onTips }) => (
  <div className="mt-3 grid grid-cols-2 gap-3">
    <div className="flex flex-col items-center text-center">
      <button type="button" onClick={onZig} className="flex items-center justify-center hover:opacity-80" aria-label="Zig it">
        <ZLogo height={44} />
      </button>
      <p className="text-xs text-gray-500 mt-1">AI analysis</p>
    </div>
    <div className="flex flex-col items-center text-center">
      <button type="button" onClick={onTips} className="flex flex-col items-center justify-center text-indigo-700 hover:opacity-80" aria-label="Tips">
        <TipBulb size={44} />
      </button>
      <p className="text-xs text-gray-500 mt-1">Tips</p>
    </div>
  </div>
);

export default function GrowthDevelopment() {
  const [venture, setVenture] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  // 'stage' = card selection screen, 'build' = the profile builder for the chosen stage.
  const [step, setStep] = useState('stage');
  const [pickedStage, setPickedStage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showFramingMore, setShowFramingMore] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [nameError, setNameError] = useState('');
  const [profileDone, setProfileDone] = useState(false);
  const router = useRouter();
  const isMobile = useIsMobile();
  // Which field's Zig it / Tips is open ('need' | 'solution' | null).
  const [zigField, setZigField] = useState(null);
  const [tipsField, setTipsField] = useState(null);

  const [growthData, setGrowthData] = useState({
    stage: 'product',
    sector: '',
    need: '',
    solution: '',
    name: '',
    headline: '',
    description: '',
    product_url: '',
    uploaded_files: [], // [CHANGED] capped at 1 item now, see handleFileUpload
    social_links: { linkedin: '', facebook: '', twitter: '', instagram: '', website: '' },
    is_imported: false,
    selected_categories: [],
    core_features: [],
    // [CHANGED — merged model] Subscription now covers the old
    // Subscription+Freemium split. packages replaces tier1/tier2 with an
    // unlimited list.
    business_model_data: {
      model_type: '',
      has_free_tier: false,
      free_tier_description: '',
      packages: [], // [{ id, name, description, price }]
      transaction_fee_description: '',
    },
    custom_question: '',
    early_incentive: '',
    early_offer_text: '',
  });

  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const user = await User.me();
      setCurrentUser(user);
      const ventures = await Venture.filter({ created_by: user.email }, "-created_date");
      if (ventures.length > 0) {
        const currentVenture = ventures[0];
        setVenture(currentVenture);
        const loaded = normalizeGrowthData(currentVenture);
        setGrowthData(prev => ({ ...prev, ...loaded }));
        // Already set up before: go straight to the builder for its stage.
        const gdRaw = currentVenture.growth_data || {};
        if (['idea', 'prototype', 'product'].includes(gdRaw.stage) || (gdRaw.selected_categories || []).length > 0) {
          // Profile already saved: entering the Growth page opens the feedback page (the profile is one link away there).
          // Coming from the onboarding stage choice (?stage=...) or a profile link (?view=profile) opens the profile.
          const qs = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
          const fromStageChoice = qs && (qs.get('stage') || qs.get('view') === 'profile');
          if (!fromStageChoice) {
            router.replace('/growth-development/feedback');
            return;
          }
          setPickedStage(loaded.stage);
          setStep('build');
        }
      }
    } catch (error) {
      console.error("Error loading venture:", error);
    }
    setIsLoading(false);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    if (!venture) return;
    const interval = setInterval(async () => {
      try {
        await Venture.update(venture.id, { growth_data: growthData });
        showToast('Auto-saved', 'success');
      } catch (e) {}
    }, 30000);
    return () => clearInterval(interval);
  }, [venture, growthData]);

  const handleChange = (field, value) => setGrowthData(prev => ({ ...prev, [field]: value }));
  const handleSocialLinkChange = (platform, value) =>
    setGrowthData(prev => ({ ...prev, social_links: { ...prev.social_links, [platform]: value } }));
  const handleBusinessModelChange = (field, value) =>
    setGrowthData(prev => ({ ...prev, business_model_data: { ...prev.business_model_data, [field]: value } }));

  // Switching stage resets the category list to what that stage supports.
  // 'idea_problem' + 'idea_solution' + 'idea_alternatives' (Idea) and 'proto_product' (Prototype) are the
  // always-asked questions of their stage and cannot be unticked.
  const setStage = (stage) => {
    setGrowthData(prev => {
      const keep = (keys) => prev.selected_categories.filter(k => keys.includes(k));
      let selected_categories;
      if (stage === 'idea') selected_categories = ['idea_problem', 'idea_solution', 'idea_alternatives', ...keep(['idea_pay', 'idea_value', 'media'])];
      else if (stage === 'prototype') selected_categories = ['proto_product', 'core_features', ...keep(['business_model', 'media', 'early_users'])];
      else selected_categories = ['core_features', ...keep(['business_model', 'value_proposition', 'product_definition', 'media', 'early_users'])];
      return { ...prev, stage, selected_categories };
    });
  };

  // [NEW — onboarding] Arriving from the new "Where are you now?" screen with
  // ?stage=idea|prototype|product: skip this page's own stage picker and open the
  // builder for that stage. A venture that was already set up keeps its own stage
  // (loadData has already moved it to 'build' by then).
  const stageParamApplied = useRef(false);
  useEffect(() => {
    if (isLoading || stageParamApplied.current) return;
    stageParamApplied.current = true;
    if (step !== 'stage' || typeof window === 'undefined') return;
    const wanted = new URLSearchParams(window.location.search).get('stage');
    if (['idea', 'prototype', 'product'].includes(wanted)) {
      setPickedStage(wanted);
      setStage(wanted);
      setStep('build');
    }
  }, [isLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  // [FIX] Single file only — replaces the previous one instead of
  // accumulating. The old "files accumulate" behavior was never requested;
  // this reverts to a one-file cap per explicit instruction.
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // [NEW] Allowed formats and size limits (Idea: images only).
    const fileExt = file.name.split('.').pop().toLowerCase();
    const isHTML = ['html', 'htm'].includes(fileExt);
    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(fileExt);
    const isVideo = ['mov', 'mp4', 'webm'].includes(fileExt);
    const allowed = growthData.stage === 'idea' ? isImage : (isImage || isVideo || isHTML);
    if (!allowed) {
      showToast(growthData.stage === 'idea' ? 'Please upload an image: JPG, PNG, GIF, WebP or SVG.' : 'Unsupported file. Use an image, an MP4/MOV/WebM video or an HTML file.', 'error');
      e.target.value = '';
      return;
    }
    const limitMB = isVideo ? 20 : 5;
    if (file.size > limitMB * 1024 * 1024) {
      showToast(`This file is too large. The limit is ${limitMB}MB.`, 'error');
      e.target.value = '';
      return;
    }
    setIsUploading(true);
    try {
      const result = await UploadFile({ file });
      const uploaded = { type: isHTML ? 'html' : (isImage ? 'image' : (isVideo ? 'video' : 'other')), name: file.name, url: result.file_url };
      setGrowthData(prev => ({ ...prev, uploaded_files: [uploaded] })); // replaces, not appends
      showToast('File uploaded successfully!');
    } catch (error) {
      console.error('Error uploading file:', error);
      showToast('Error uploading file. Please try again.', 'error');
    }
    setIsUploading(false);
    e.target.value = '';
  };
  // Removing the file also unticks "Get feedback on my Media" — nothing left to ask about.
  const removeUploadedFile = () => setGrowthData(prev => ({ ...prev, uploaded_files: [], selected_categories: prev.selected_categories.filter(k => k !== 'media') }));

  const createVentureFromScratch = async () => {
    const { data: existing, error: checkError } = await supabase
      .from('ventures').select('id').eq('name', growthData.name.trim()).limit(1);
    if (checkError) throw checkError;
    if (existing && existing.length > 0) throw new Error('NAME_TAKEN');
    const venturePayload = {
      name: growthData.name.trim(),
      description: growthData.stage === 'product' ? growthData.description : growthData.solution,
      phase: "growth",
      sector: growthData.sector || 'not_sure',
      virtual_capital: 0,
      monthly_burn_rate: 0,
      founder_user_ids: [String(currentUser.id)],
      founders_count: 1,
      likes_count: 0,
      messages_count: 0,
      business_plan_completion: 0,
      mvp_uploaded: false,
      revenue_model_completed: false,
      mlp_completed: false,
      mlp_development_completed: false,
      pitch_created: false,
      funding_plan_completed: false,
      mvp_feedback_count: 0,
      pressure_challenge_completed: false,
      created_by: currentUser.email,
      created_by_id: String(currentUser.id),
      // ZigPulse free: one-time bank of 30 feedback requests (the column's DB default is 20).
      feedback_request_pool: 30,
    };
    const { data: newVenture, error: createError } = await supabase
      .from('ventures').insert([venturePayload]).select().single();
    if (createError) {
      if (createError.code === '23505') throw new Error('NAME_TAKEN');
      throw createError;
    }
    // [FIX — confirmed real gap] createventure/page.jsx sets this
    // right after venture creation for the normal journey; this
    // skip-the-journey path never did, which would leave the sidebar's
    // "Landing Page" nav item pointing at "#" (broken) for any venture
    // created directly through Growth. Same URL pattern as createventure.
    const landingPageUrl = `${window.location.origin}/venture-landing?id=${newVenture.id}`;
    const { error: landingUpdateError } = await supabase
      .from('ventures').update({ landing_page_url: landingPageUrl }).eq('id', newVenture.id);
    if (landingUpdateError) console.error('Could not set landing_page_url:', landingUpdateError);
    return { ...newVenture, landing_page_url: landingPageUrl };
  };

  // Saves the venture (create on first save, update after) and moves on to step 2: the feedback page.
  const handleSave = async () => {
    setNameError('');
    if (!venture && !growthData.name.trim()) {
      setNameError('Venture name is required.');
      return;
    }
    setIsSaving(true);
    try {
      let targetVenture = venture;
      const isNewVenture = !targetVenture;
      if (!targetVenture) {
        try {
          targetVenture = await createVentureFromScratch();
          setVenture(targetVenture);
        } catch (err) {
          if (err.message === 'NAME_TAKEN') {
            setNameError(`The name "${growthData.name}" is already taken. Please choose a different name.`);
            setIsSaving(false);
            return;
          }
          throw err;
        }
      } else if (growthData.name.trim() !== targetVenture.name) {
        await Venture.update(targetVenture.id, { name: growthData.name.trim() });
      }
      // [NEW] Industry lives in ventures.sector (same column as the long track).
      if (!isNewVenture && growthData.sector && growthData.sector !== targetVenture.sector) {
        await Venture.update(targetVenture.id, { sector: growthData.sector });
      }
      await Venture.update(targetVenture.id, { growth_data: growthData });
      // [DIAGNOSTIC — save verification] Read the venture back and compare the
      // fields that were reported as not saving. Shows a red toast naming any
      // field whose stored value differs from what was just sent.
      try {
        const saved = await Venture.get(targetVenture.id);
        const same = (a, b) => {
          if (a === b) return true;
          if (typeof a !== 'object' || typeof b !== 'object' || !a || !b) return false;
          const ka = Object.keys(a), kb = Object.keys(b);
          return ka.length === kb.length && ka.every((k) => same(a[k], b[k]));
        };
        const checkFields = ['need', 'solution', 'custom_question', 'business_model_data', 'core_features', 'selected_categories', 'product_url', 'headline', 'description', 'early_incentive', 'early_offer_text'];
        const mismatched = checkFields.filter((f) => !same((saved.growth_data || {})[f] ?? '', growthData[f] ?? ''));
        if (mismatched.length > 0) {
          console.error('[Save verification] NOT saved:', mismatched, { sent: growthData, stored: saved.growth_data });
          showToast('Not saved: ' + mismatched.join(', '), 'error');
          setIsSaving(false);
          return;
        }
      } catch (verifyErr) {
        console.error('[Save verification] could not read back:', verifyErr);
      }
      // [FIX — real gap, caught after the fact] This is the primary path
      // this whole feature exists for (someone with an existing product
      // coming straight to Growth), and it was the ONE path that never
      // sent the "Welcome to Growth" message — only the regular
      // Beta→Growth automatic transition did. Same exact title/content,
      // sent once, only on first creation (not on every subsequent save).
      if (isNewVenture) {
        await VentureMessage.create({
          venture_id: targetVenture.id,
          message_type: 'phase_welcome',
          title: '📈 Welcome to ZigPulse!',
          content: `Your page is ready. Head to the Promotion Center to send it to the community and start collecting feedback. You can update your content and questions at any time.`,
          phase: 'growth',
        });
        // [NEW] Same email as the regular-journey Beta→Growth transition
        // (dashboard-page.jsx) — via the existing generic
        // /api/send-phase-transition route. Non-blocking.
        try {
          await fetch("/api/send-phase-transition", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: currentUser.email,
              founderName: currentUser.username || currentUser.full_name || currentUser.name || "",
              ventureName: targetVenture.name,
              newPhaseTitle: "📈 Welcome to ZigPulse!",
              newPhaseMessage: "Your ZigPulse page is ready. Head to the Promotion Center, name your brief and choose how many people to reach. You can follow the results on the Product Feedback page.\n\nWant more feedback requests? You earn them for free by giving feedback to other founders. You can also upgrade to ZigPulse Boost at any time to increase your quota.",
            }),
          });
        } catch (emailErr) {
          console.error("Growth welcome email failed (non-critical):", emailErr);
        }
        // [NEW] Same plan assignment as the regular-journey path
        // (dashboard-page.jsx) — displayed as "GrowthZig" in my-account.jsx
        // (that file's display mapping needs updating separately).
        try {
          await supabase.from('user_profiles').update({ plan: 'growth', credits_limit: 50 }).eq('id', currentUser.id);
        } catch (planErr) {
          console.error("Growth plan assignment failed (non-critical):", planErr);
        }
      }
      setProfileDone(true);
    } catch (error) {
      console.error("Error saving growth data:", error);
      showToast("Error saving. Please try again.", "error");
    }
    setIsSaving(false);
  };

  // [NEW] Idea stage: save what is written so far, then open ZigForge, which reads the Need and Solution from the saved venture.
  const openForge = async () => {
    try {
      await Venture.update(venture.id, { growth_data: growthData });
      router.push('/zigforge');
    } catch (e) {
      console.error('Could not save before opening ZigForge:', e);
      showToast('Could not save. Please try again.', 'error');
    }
  };

  // After saving: show the animated 'profile complete' screen, then open the feedback page.
  useEffect(() => {
    if (!profileDone) return;
    const t = setTimeout(() => router.push('/growth-development/feedback'), 3200);
    return () => clearTimeout(t);
  }, [profileDone]); // eslint-disable-line react-hooks/exhaustive-deps

  const isIdea = growthData.stage === 'idea';
  const isPrototype = growthData.stage === 'prototype';
  const isProduct = growthData.stage === 'product';
  const isNameComplete = growthData.name.trim().length >= 2;
  const isNeedComplete = growthData.need.trim().length >= 30;
  const isSolutionComplete = growthData.solution.trim().length >= 30;
  const isHeadlineComplete = growthData.headline.trim().length >= 10;
  const isDescriptionComplete = growthData.description.trim().length >= 50;
  const hasDemoFile = growthData.uploaded_files.length > 0;
  const hasSector = !!growthData.sector;

  // Step 1 only needs the basics. Questions, features and the business model belong to step 2.
  const profileMissing = [];
  if (!isNameComplete) profileMissing.push('Add a venture name (at least 2 characters)');
  if (!hasSector) profileMissing.push('Choose an industry');
  if ((isIdea || isPrototype) && !isNeedComplete) profileMissing.push(`The Need needs at least 30 characters (${growthData.need.trim().length} now)`);
  if ((isIdea || isPrototype) && !isSolutionComplete) profileMissing.push(`${isIdea ? 'Your Solution' : 'The Product'} needs at least 30 characters (${growthData.solution.trim().length} now)`);
  const canSaveProfile = profileMissing.length === 0;

  // The next field to fill gets the pulsing icon.
  const pendingOrder = [
    ['name', isNameComplete], ['sector', hasSector],
    ...(isProduct ? [['headline', isHeadlineComplete], ['description', isDescriptionComplete]] : [['need', isNeedComplete], ['solution', isSolutionComplete]]),
  ];
  const activeKey = (pendingOrder.find(([, done]) => !done) || [])[0];

  if (isLoading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>;

  if (step === 'stage') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center pt-4 mb-6 md:mb-10">
            <h1 className="text-3xl md:text-4xl font-bold"><span style={{ color: '#F49A58' }}>Zig</span><span style={{ color: '#7045DC' }}>Pulse</span></h1>
            <h2 className="mt-3 text-2xl md:text-3xl font-bold text-gray-900">Where are you now?</h2>
            <p className="mt-2 text-sm md:text-base text-gray-500">Pick your stage. We will tailor the guide and the questions to it.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {STAGES.map((st) => {
              const sty = STAGE_STYLE[st.value];
              const Icon = sty.Icon;
              const selected = pickedStage === st.value;
              return (
                <button type="button" key={st.value} onClick={() => setPickedStage(st.value)}
                  className={`relative text-left text-white rounded-3xl p-5 md:p-8 md:min-h-[320px] flex md:flex-col items-center md:items-start gap-4 md:gap-6 shadow-lg transition-all ${sty.card} ${selected ? 'ring-4 ring-offset-2 ring-gray-900/70 scale-[1.02]' : pickedStage ? 'opacity-60' : 'hover:shadow-xl'}`}>
                  {selected && <span className="absolute top-3 right-3 md:top-5 md:right-5 w-7 h-7 rounded-full bg-white flex items-center justify-center"><Check className="w-4 h-4 text-gray-900" /></span>}
                  <div className="w-14 h-14 md:w-20 md:h-20 rounded-2xl bg-white/25 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-7 h-7 md:w-10 md:h-10 text-white" />
                  </div>
                  <div className="min-w-0 pr-8 md:pr-0">
                    <p className="text-xl md:text-3xl font-bold">{st.name}</p>
                    <p className="mt-1 md:mt-3 text-sm md:text-base text-white/90 leading-snug">{st.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
          <div className="mt-8 flex justify-center md:justify-end pb-6">
            <Button size="lg" disabled={!pickedStage} onClick={() => { setStage(pickedStage); setStep('build'); }} className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-base px-10">
              Next<ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <GrowthStyles />
      {profileDone && <ProfileDone title="Your profile is complete" text="You are now part of the StartZig community." onContinue={() => router.push('/growth-development/feedback')} />}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-xl shadow-lg text-white font-medium transition-all ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>{toast.message}</div>
      )}

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50 p-4 md:p-8">
        <div className="max-w-3xl mx-auto space-y-5 md:space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold"><span style={{ color: '#F49A58' }}>Zig</span><span style={{ color: '#7045DC' }}>Pulse</span></h1>
            <div className="mt-3 flex items-center justify-center gap-2">
              {(() => { const st = STAGE_STYLE[growthData.stage]; const StageIcon = st.Icon; return (
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold ${st.chip}`}><StageIcon className="w-4 h-4" />{STAGES.find(x => x.value === growthData.stage)?.name}</span>
              ); })()}
              <button type="button" onClick={() => { setPickedStage(growthData.stage); setStep('stage'); }} className="text-xs text-gray-500 underline">Change</button>
            </div>
          </div>

          {!isMobile && isProduct && (
          <Card className="shadow-sm border-emerald-200 bg-emerald-50">
            <CardContent className="p-5">
              <p className="text-base font-bold text-emerald-700 mb-2">Welcome to ZigPulse</p>
              <p className="text-sm text-emerald-900 leading-relaxed">{GROWTH_FRAMING_SHORT}</p>
              {showFramingMore && GROWTH_FRAMING_MORE.split('\n\n').map((para, i) => (
                <p key={i} className="text-sm text-emerald-900 leading-relaxed mt-3">{para}</p>
              ))}
              <button
                type="button"
                onClick={() => setShowFramingMore(v => !v)}
                className="text-xs font-medium text-emerald-700 mt-3 flex items-center gap-1"
              >
                {showFramingMore ? 'Show less' : 'Read more'}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showFramingMore ? 'rotate-180' : ''}`} />
              </button>
            </CardContent>
          </Card>
          )}

          <HowItWorks kicker="Venture profile" title="Build your venture profile" steps={[
            { icon: <Pencil className="w-5 h-5" />, text: 'Fill in the details in the fields.' },
            { icon: <Lightbulb className="w-5 h-5" />, text: <>Click <b>TIP</b> to get general guidance.</> },
            { icon: <ZBadge />, text: <>Click <b>Z</b> to get AI analysis and insights on what you wrote.</> },
          ]} />

          <FieldCard Icon={Tag} title={`${isIdea ? 'Idea Name' : 'Venture Name'} *`} done={isNameComplete} active={activeKey === 'name'}>
            <MobileFieldWrapper label="Venture Name" summary={growthData.name} isMobile={isMobile} value={growthData.name} onChange={(e) => handleChange('name', e.target.value)} placeholder="e.g., PocketVet">
              <Input value={growthData.name} onChange={(e) => handleChange('name', e.target.value)} placeholder="e.g., PocketVet" />
              {nameError && <p className="text-xs text-red-500 mt-1">{nameError}</p>}
            </MobileFieldWrapper>
            {nameError && isMobile && <p className="text-xs text-red-500 mt-1">{nameError}</p>}
          </FieldCard>

          <FieldCard Icon={Compass} title="Industry *" done={hasSector} active={activeKey === 'sector'}>
            <SectorTiles value={growthData.sector} onChange={(v) => handleChange('sector', v)} />
          </FieldCard>

          {isProduct && (
            <FieldCard Icon={Megaphone} title="Slogan" description="Your hero line." done={isHeadlineComplete} active={activeKey === 'headline'}>
              <MobileFieldWrapper label="Slogan" summary={growthData.headline} isMobile={isMobile} value={growthData.headline} onChange={(e) => handleChange('headline', e.target.value)} placeholder="e.g., The fastest way to plan a solo trip">
                <Input value={growthData.headline} onChange={(e) => handleChange('headline', e.target.value)} placeholder="e.g., The fastest way to plan a solo trip" />
              </MobileFieldWrapper>
            </FieldCard>
          )}

          {isProduct ? (
            <FieldCard Icon={FileText} title="Short Description" description="What the product is and who it's for." done={isDescriptionComplete} active={activeKey === 'description'}>
              <MobileFieldWrapper label="Short Description" summary={growthData.description} isMobile={isMobile}>
                <Textarea value={growthData.description} onChange={(e) => handleChange('description', e.target.value)} placeholder="Describe what the product does and who it's for..." className="h-28" />
              </MobileFieldWrapper>
            </FieldCard>
          ) : (
            <>
              <FieldCard Icon={Target} title="The Need" description="What need are you addressing, and what is missing in the market today?" done={isNeedComplete} active={activeKey === 'need'}>
                <MobileFieldWrapper label="The Need" summary={growthData.need} isMobile={isMobile} value={growthData.need} onChange={(e) => handleChange('need', e.target.value)} placeholder="e.g., Pet owners wait days for a vet appointment, even for simple questions.">
                  <Textarea value={growthData.need} onChange={(e) => handleChange('need', e.target.value)} placeholder="e.g., Pet owners wait days for a vet appointment, even for simple questions." className="h-28" />
                </MobileFieldWrapper>
                <p className={`text-xs mt-1 ${isNeedComplete ? 'text-emerald-600' : 'text-gray-500'}`}>{growthData.need.trim().length}/30 characters minimum</p>
                <ZigTipsButtons onZig={() => setZigField('need')} onTips={() => setTipsField('need')} />
              </FieldCard>
              <FieldCard Icon={Lightbulb} title={isIdea ? 'Your Solution' : 'The Product'} description={isIdea ? 'What is your solution, and who is it for?' : 'Describe your product: what it does and who it is for.'} done={isSolutionComplete} active={activeKey === 'solution'}>
                <MobileFieldWrapper label={isIdea ? 'Your Solution' : 'The Product'} summary={growthData.solution} isMobile={isMobile} value={growthData.solution} onChange={(e) => handleChange('solution', e.target.value)} placeholder="e.g., A 10-minute video call with a licensed vet, for urban pet owners without a vet nearby.">
                  <Textarea value={growthData.solution} onChange={(e) => handleChange('solution', e.target.value)} placeholder="e.g., A 10-minute video call with a licensed vet, for urban pet owners without a vet nearby." className="h-28" />
                </MobileFieldWrapper>
                <p className={`text-xs mt-1 ${isSolutionComplete ? 'text-emerald-600' : 'text-gray-500'}`}>{growthData.solution.trim().length}/30 characters minimum</p>
                <ZigTipsButtons onZig={() => setZigField('solution')} onTips={() => setTipsField('solution')} />
              </FieldCard>
            </>
          )}

          {isProduct && (
            <FieldCard Icon={LinkIcon} title="Product Link" description="Link to your product">
              <MobileFieldWrapper label="Product Link" summary={growthData.product_url} isMobile={isMobile} value={growthData.product_url} onChange={(e) => handleChange('product_url', e.target.value)} placeholder="https://yourproduct.com">
                <Input type="url" value={growthData.product_url} onChange={(e) => handleChange('product_url', e.target.value)} placeholder="https://yourproduct.com" />
              </MobileFieldWrapper>
            </FieldCard>
          )}

          {/* Single file only, replaces on new upload. */}
          <FieldCard Icon={ImageIcon} title={isIdea ? 'Image (optional)' : 'Demo'} done={hasDemoFile}>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">Upload a unique media file, or one you already use on your site, to explain and visualize your idea or product.</p>
              {!hasDemoFile ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <Label htmlFor="growth-file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-emerald-600 hover:text-emerald-500">
                    <span>Upload a file</span>
                    <Input id="growth-file-upload" type="file" className="sr-only" onChange={handleFileUpload} accept={isIdea ? '.jpg,.jpeg,.png,.gif,.webp,.svg' : '.jpg,.jpeg,.png,.gif,.webp,.svg,.mp4,.mov,.webm,.html,.htm'} disabled={isUploading} />
                  </Label>
                  {isUploading && <Loader2 className="w-5 h-5 animate-spin mx-auto mt-4" />}
                </div>
              ) : (
                <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                  <p className="font-medium text-sm">{growthData.uploaded_files[0].name}</p>
                  <Button variant="ghost" size="icon" onClick={removeUploadedFile}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                </div>
              )}
              <p className="text-xs text-gray-400">{isIdea
                ? 'Image: JPG, PNG, GIF, WebP or SVG. Max 5MB. One file only.'
                : 'Image (JPG, PNG, GIF, WebP, SVG, max 5MB), video (MP4, MOV, WebM, max 20MB) or HTML file (max 5MB). One file only.'}</p>
              {!hasDemoFile && !isIdea && <p className="text-xs text-gray-500">You can save without it, but you'll need to add media before you can ask for feedback.</p>}
            </div>
          </FieldCard>

          {isIdea && venture && isNeedComplete && isSolutionComplete && (
            <FieldCard Icon={Sparkles} title="Show your idea in one page" description="No image? ZigForge reads your Need and Solution and builds a one-page visual for your public page.">
              <Button type="button" variant="outline" onClick={openForge} className="w-full md:w-auto">
                <Sparkles className="w-4 h-4 mr-2" />Create it with ZigForge
              </Button>
            </FieldCard>
          )}

          {isProduct && (
            <FieldCard Icon={Share2} title="Social Links" description="Shown on your public page.">
                  <MobileFieldWrapper label="Social Links" summary={Object.values(growthData.social_links).some(v => v) ? 'Some links added' : null} isMobile={isMobile}>
              <div className="space-y-3">
                <div className="flex items-center gap-2"><Linkedin className="w-4 h-4 text-gray-400 flex-shrink-0" /><Input placeholder="LinkedIn URL" value={growthData.social_links.linkedin} onChange={(e) => handleSocialLinkChange('linkedin', e.target.value)} /></div>
                <div className="flex items-center gap-2"><Facebook className="w-4 h-4 text-gray-400 flex-shrink-0" /><Input placeholder="Facebook URL" value={growthData.social_links.facebook} onChange={(e) => handleSocialLinkChange('facebook', e.target.value)} /></div>
                <div className="flex items-center gap-2"><Twitter className="w-4 h-4 text-gray-400 flex-shrink-0" /><Input placeholder="X / Twitter URL" value={growthData.social_links.twitter} onChange={(e) => handleSocialLinkChange('twitter', e.target.value)} /></div>
                <div className="flex items-center gap-2"><Instagram className="w-4 h-4 text-gray-400 flex-shrink-0" /><Input placeholder="Instagram URL" value={growthData.social_links.instagram} onChange={(e) => handleSocialLinkChange('instagram', e.target.value)} /></div>
                <div className="flex items-center gap-2"><Globe className="w-4 h-4 text-gray-400 flex-shrink-0" /><Input placeholder="Website URL (company site, not the product itself)" value={growthData.social_links.website} onChange={(e) => handleSocialLinkChange('website', e.target.value)} /></div>
              </div>
              </MobileFieldWrapper>
            </FieldCard>
          )}

          {profileMissing.length > 0 && (
            <div className="max-w-md mx-auto rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm">
              <p className="font-semibold text-amber-900 mb-2">To continue, you still need to:</p>
              <ul className="space-y-1 text-amber-900">
                {profileMissing.map((t, i) => (<li key={i}>• {t}</li>))}
              </ul>
            </div>
          )}
          <div className="flex flex-col items-center gap-3 pt-2 pb-6">
            <Button onClick={handleSave} disabled={!canSaveProfile || isSaving} className="bg-emerald-600 hover:bg-emerald-700 w-full md:w-auto md:px-10" size="lg">
              {isSaving ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>) : (<>Save and continue<ArrowRight className="w-4 h-4 ml-2" /></>)}
            </Button>
            {venture && (
              <button type="button" onClick={() => router.push('/growth-development/feedback')} className="text-sm text-gray-500 underline">Go to the feedback questions</button>
            )}
          </div>
        </div>
      </div>

      {/* [NEW — Idea stage] Zig it + Tips. MentorModal stays mounted (isOpen
          toggles) so its in-session score history ("+N from last time") survives
          between runs, same as in the Plan. Before the first save there is no
          venture yet, so ventureId is undefined and the modal relies only on the
          fields passed in. */}
      <MentorModal
        isOpen={!!zigField}
        onClose={() => setZigField(null)}
        documentType="business_plan"
        fieldKey={getZigFields(growthData.stage)[zigField || 'need'].fieldKey}
        sectionTitle={getZigFields(growthData.stage)[zigField || 'need'].title}
        fieldValue={zigField ? growthData[zigField] : ''}
        allFieldValues={isPrototype ? { problem: growthData.need, product_details: growthData.solution } : { problem: growthData.need, solution: growthData.solution }}
        firstPass={true}
        onUpdateField={(text) => { if (zigField) handleChange(zigField, text); }}
        ventureId={venture?.id}
        analysisOnly
      />
      <StaticGuidanceViewer
        isOpen={!!tipsField}
        onClose={() => setTipsField(null)}
        sectionId={tipsField ? getZigFields(growthData.stage)[tipsField].tipsId : null}
      />
    </>
  );
}
