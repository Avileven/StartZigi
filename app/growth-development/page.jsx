// app/growth-development/page.jsx
//
// [v6 — all changes explicitly confirmed this round]
//   1. Business Model: Subscription and Freemium MERGED into one option.
//      No more two near-identical model types. Now: a "Free tier
//      available" checkbox (+ description if checked) plus an unlimited
//      list of paid packages (name + description + price, "+" to add more
//      — not capped at 2 like the old Tier 1/Tier 2). Transactional and
//      Ad-Driven unchanged.
//   2. Demo: exactly ONE file, replaces on new upload (not accumulating
//      anymore — that was a v4/v5 change nobody asked for). Small note
//      about supported formats and the one-file limit.
//   3. Copy fixes: "Product Link" description now just "Link to your
//      product" (the previous explanatory sentence was never asked for).
//
// DB DEPENDENCY (pending, unchanged): ALTER TABLE ventures ADD COLUMN growth_data jsonb DEFAULT '{}';
// DB DEPENDENCY (pending, unchanged): ALTER TABLE growth_feedback ADD COLUMN custom_question_answer text;
// STILL NOT FIXED (explicit): no venture.phase guard.
"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { Venture } from '@/api/entities.js';
import { VentureMessage } from '@/api/entities.js';
import { User } from '@/api/entities.js';
import { UploadFile } from '@/api/integrations';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input.jsx';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Rocket, Upload, Trash2, Loader2, CheckCircle, ArrowLeft, Link as LinkIcon,
  Plus, HelpCircle, ChevronRight, X, MessageCircleQuestion, ChevronDown,
  Linkedin, Facebook, Twitter, Instagram, Globe,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createPageUrl } from '@/utils';

// [FIX — real root cause, not styling] A native <input> can never wrap
// text to a second line or scroll vertically, no matter what CSS is
// applied — text just keeps extending sideways and scrolls out of view.
// That's what "gets stuck in the middle, can't see what you're typing" was
// — a fundamental HTML constraint, not a border/sizing bug. When value/
// onChange are passed, this component now owns the editing surface itself
// and always renders a real <textarea>, regardless of what element the
// caller's `children` uses on desktop. `children` is only used for the
// multi-field categories (Business Model, Core Features, Social Links)
// where several short inputs sit together — those still render as-is,
// with border removed but no forced full-screen height, since forcing
// full height there breaks a multi-field layout (confirmed by screenshot
// last round) more than it helps a genuinely short field like a price.
function MobileFieldWrapper({ label, summary, isMobile, children, value, onChange, placeholder }) {
  const [open, setOpen] = useState(false);
  if (!isMobile) return <>{children}</>;
  const useOwnTextarea = value !== undefined && onChange !== undefined;
  return (
    <>
      {/* [FIX] mt-2 added — was sitting flush against the Label above it. */}
      <button type="button" onClick={() => setOpen(true)} className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-white text-left mt-2">
        <div className="min-w-0">
          {/* [FIX] Was showing {label} again here too, duplicating the
              Label already rendered above this component by the caller.
              Shows only the current value now (or the empty-state hint). */}
          {summary ? <p className="text-sm text-gray-900 truncate">{summary}</p> : <p className="text-sm text-gray-400">Tap to fill in</p>}
        </div>
        <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
      </button>
      {open && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
            <h3 className="font-semibold text-gray-900">{label}</h3>
            <button type="button" onClick={() => setOpen(false)} className="text-emerald-600 font-semibold flex items-center gap-1">
              <CheckCircle className="w-4 h-4" /> Save
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {useOwnTextarea ? (
              <textarea
                autoFocus
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full h-full min-h-[60vh] text-xl leading-relaxed border-0 focus:ring-0 focus:outline-none resize-none bg-transparent"
              />
            ) : (
              <div className="[&_textarea]:!min-h-[50vh] [&_textarea]:!border-0 [&_textarea]:!rounded-none [&_textarea]:!shadow-none [&_textarea]:!ring-0 [&_textarea]:!p-0 [&_textarea]:!text-xl
                [&_input]:!border-0 [&_input]:!rounded-none [&_input]:!shadow-none [&_input]:!ring-0">
                {children}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return isMobile;
}

// [CHANGED] Down to 3 model types — Subscription now covers what used to
// be two separate (and functionally identical) options.
const BUSINESS_MODEL_TYPES = [
  { value: 'subscription', name: 'Subscription', description: 'Recurring fees, with an optional free tier.' },
  { value: 'transactional', name: 'Transactional', description: 'Per-transaction fees or commissions.' },
  { value: 'ad-driven', name: 'Ad-Driven', description: 'Free product, revenue solely from ads.' },
];

const CATEGORY_EXPLANATIONS = {
  business_model: "Tests whether your pricing feels like it fits the value you're offering — not whether this reviewer personally thinks it's cheap or expensive.",
  core_features: "Tests whether the features you chose to highlight actually support what you say the product does — not whether reviewers find each feature exciting.",
  value_proposition: "This only affects whether reviewers are asked to rate your slogan's accuracy — your slogan itself is always shown regardless. Useful if you're unsure your slogan is landing the way you intend it to.",
  product_definition: "This only affects whether reviewers are asked to rate your description's clarity — your description itself is always shown regardless. Useful if you're unsure your description is landing the way you intend it to.",
};

const ALWAYS_INCLUDED_EXPLANATION = "Every reviewer is always asked: \"Did you visit the actual product?\" (Yes/No — if Yes, also \"How well did it match what you expected?\" plus an optional \"What was different?\"), but only if you provided a product link. And at the very end, regardless of which categories above you selected, one open question. This doesn't change what's shown on your public page — it only affects what feedback is collected.";

const ExplainToggle = ({ text }) => {
  const [open, setOpen] = useState(false);
  return (
    <span className="inline-block align-middle ml-1.5">
      <button type="button" onClick={() => setOpen(o => !o)} className="inline-flex items-center justify-center w-4 h-4 rounded-full text-gray-400 hover:text-emerald-600" aria-label="Why this question?">
        <HelpCircle className="w-4 h-4" />
      </button>
      {open && <span className="block mt-1 text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded-md p-2 max-w-md">{text}</span>}
    </span>
  );
};

// [FIX — full rewrite] Replaces the old "not a popularity contest" framing,
// which read like a napkin note, not a real welcome message for someone
// who just reached this stage. Short version always shown (~3 lines);
// GROWTH_FRAMING_MORE is the same welcome content used in info-mobile,
// revealed behind the expand toggle.
const GROWTH_FRAMING_SHORT = "On this page, you choose what to show potential viewers, and which categories of feedback you want to collect on your product. This also exposes your live product to the community, helping you grow your first users.";
const GROWTH_FRAMING_MORE = "This is a dynamic process. At any stage, you can update your content and feedback categories to focus on specific aspects, gather feedback after making changes, or invite users to try a new version.\n\nOnce you're done, you'll return to your Dashboard. To actually send out feedback requests, head to the Promotion Center, name your campaign, and choose how many users to reach. After that, you can track how your page is reaching the community on the Product Feedback page.\n\nYou're also part of the StartZig community. Other founders will likely invite you to give feedback on their own ideas and products at various stages. When you do, you're not just helping them — you also earn Insight Credits, which you can use toward your own feedback requests.";

export default function GrowthDevelopment() {
  const [venture, setVenture] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showFramingMore, setShowFramingMore] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [nameError, setNameError] = useState('');
  const router = useRouter();
  const isMobile = useIsMobile();

  const [growthData, setGrowthData] = useState({
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
  });

  const [newFeatureName, setNewFeatureName] = useState('');
  const [newFeatureDesc, setNewFeatureDesc] = useState('');
  const [newPackageName, setNewPackageName] = useState('');
  const [newPackageDesc, setNewPackageDesc] = useState('');
  const [newPackagePrice, setNewPackagePrice] = useState('');

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
        const loaded = { ...(currentVenture.growth_data || {}) };
        loaded.name = currentVenture.name || '';
        loaded.product_url = loaded.product_url || '';
        loaded.uploaded_files = (loaded.uploaded_files || []).slice(0, 1); // enforce single-file cap even on old data
        loaded.is_imported = loaded.is_imported === true;
        loaded.selected_categories = loaded.selected_categories || [];
        loaded.core_features = loaded.core_features || [];
        loaded.custom_question = loaded.custom_question || '';
        loaded.business_model_data = {
          model_type: loaded.business_model_data?.model_type || '',
          has_free_tier: loaded.business_model_data?.has_free_tier || false,
          free_tier_description: loaded.business_model_data?.free_tier_description || '',
          packages: loaded.business_model_data?.packages || [],
          transaction_fee_description: loaded.business_model_data?.transaction_fee_description || '',
        };
        loaded.social_links = {
          linkedin: loaded.social_links?.linkedin || '',
          facebook: loaded.social_links?.facebook || '',
          twitter: loaded.social_links?.twitter || '',
          instagram: loaded.social_links?.instagram || '',
          website: loaded.social_links?.website || '',
        };
        setGrowthData(prev => ({ ...prev, ...loaded }));
      }
    } catch (error) {
      console.error("Error loading venture:", error);
    }
    setIsLoading(false);
  }, []);

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

  const toggleCategory = (key) => {
    setGrowthData(prev => {
      const has = prev.selected_categories.includes(key);
      const selected_categories = has ? prev.selected_categories.filter(k => k !== key) : [...prev.selected_categories, key];
      return { ...prev, selected_categories };
    });
  };

  const addFeature = () => {
    if (!newFeatureName.trim() || growthData.core_features.length >= 3) return;
    setGrowthData(prev => ({ ...prev, core_features: [...prev.core_features, { id: `feat_${Date.now()}`, name: newFeatureName.trim(), description: newFeatureDesc.trim() }] }));
    setNewFeatureName(''); setNewFeatureDesc('');
  };
  const removeFeature = (id) => setGrowthData(prev => ({ ...prev, core_features: prev.core_features.filter(f => f.id !== id) }));

  // [NEW] Unlimited packages, replacing the old fixed Tier 1/Tier 2 fields.
  const addPackage = () => {
    if (!newPackageName.trim()) return;
    setGrowthData(prev => ({
      ...prev,
      business_model_data: {
        ...prev.business_model_data,
        packages: [...prev.business_model_data.packages, {
          id: `pkg_${Date.now()}`, name: newPackageName.trim(), description: newPackageDesc.trim(), price: newPackagePrice.trim(),
        }],
      },
    }));
    setNewPackageName(''); setNewPackageDesc(''); setNewPackagePrice('');
  };
  const removePackage = (id) => setGrowthData(prev => ({
    ...prev,
    business_model_data: { ...prev.business_model_data, packages: prev.business_model_data.packages.filter(p => p.id !== id) },
  }));

  // [FIX] Single file only — replaces the previous one instead of
  // accumulating. The old "files accumulate" behavior was never requested;
  // this reverts to a one-file cap per explicit instruction.
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const result = await UploadFile({ file });
      const fileExt = file.name.split('.').pop().toLowerCase();
      const isHTML = ['html', 'htm'].includes(fileExt);
      const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(fileExt);
      const isVideo = ['mp4', 'mov', 'webm'].includes(fileExt);
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
  const removeUploadedFile = () => setGrowthData(prev => ({ ...prev, uploaded_files: [] }));

  const createVentureFromScratch = async () => {
    const { data: existing, error: checkError } = await supabase
      .from('ventures').select('id').eq('name', growthData.name.trim()).limit(1);
    if (checkError) throw checkError;
    if (existing && existing.length > 0) throw new Error('NAME_TAKEN');
    const venturePayload = {
      name: growthData.name.trim(),
      description: growthData.description,
      phase: "growth",
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
      await Venture.update(targetVenture.id, { growth_data: growthData });
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
          title: '📈 Welcome to Growth!',
          content: `Welcome to the Growth stage! It's time to set up your first campaign, get feedback from the community and expose your product to more users.`,
          phase: 'growth',
        });
      }
      showToast("Growth page saved!");
      router.push(createPageUrl("Dashboard"));
    } catch (error) {
      console.error("Error saving growth data:", error);
      showToast("Error saving. Please try again.", "error");
    }
    setIsSaving(false);
  };

  const isNameComplete = growthData.name.trim().length >= 2;
  const isHeadlineComplete = growthData.headline.trim().length >= 10;
  const isDescriptionComplete = growthData.description.trim().length >= 50;
  const hasAtLeastOneCategory = growthData.selected_categories.length > 0;
  const featuresReady = !growthData.selected_categories.includes('core_features') || growthData.core_features.length > 0;
  const bmd = growthData.business_model_data;
  const businessModelReady = (() => {
    if (!growthData.selected_categories.includes('business_model')) return true;
    if (!bmd.model_type) return false;
    if (bmd.model_type === 'subscription') {
      const packagesOk = bmd.packages.length > 0 && bmd.packages.every(p => p.name.trim() && p.price.trim());
      const freeTierOk = !bmd.has_free_tier || bmd.free_tier_description.trim().length > 0;
      return packagesOk && freeTierOk;
    }
    if (bmd.model_type === 'transactional') return bmd.transaction_fee_description.trim().length > 0;
    if (bmd.model_type === 'ad-driven') return true;
    return false;
  })();
  const valuePropReady = !growthData.selected_categories.includes('value_proposition') || isHeadlineComplete;
  const definitionReady = !growthData.selected_categories.includes('product_definition') || isDescriptionComplete;
  const hasDemoFile = growthData.uploaded_files.length > 0;

  const canSave = isNameComplete && hasAtLeastOneCategory && featuresReady && businessModelReady && valuePropReady && definitionReady && hasDemoFile;

  if (isLoading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>;

  return (
    <>
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-xl shadow-lg text-white font-medium transition-all ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>{toast.message}</div>
      )}

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50 p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Rocket className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Growth Development Center</h1>
          </div>

          <Card className="shadow-sm border-emerald-200 bg-emerald-50">
            <CardContent className="p-5">
              <p className="text-base font-bold text-emerald-700 mb-2">Welcome to the Growth stage</p>
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

          {/* [FIX] "You don't have a venture yet..." message removed
              entirely — the only way to reach this page without a venture
              is by explicitly choosing "I have a product" on the entry
              screen, so re-explaining that here was redundant. */}

          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">Venture Profile</TabsTrigger>
              <TabsTrigger value="feedback" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">Feedback</TabsTrigger>
            </TabsList>

            {/* ===================== VENTURE PROFILE ===================== */}
            <TabsContent value="profile" className="space-y-6">
              {!venture && (
                <Card className={isNameComplete ? 'shadow-lg border-emerald-400 bg-emerald-50/40' : 'shadow-lg'}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">{isNameComplete && <CheckCircle className="w-5 h-5 text-green-500" />}Venture Name *</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <MobileFieldWrapper label="Venture Name" summary={growthData.name} isMobile={isMobile} value={growthData.name} onChange={(e) => handleChange('name', e.target.value)} placeholder="e.g., PocketVet">
                      <Input value={growthData.name} onChange={(e) => handleChange('name', e.target.value)} placeholder="e.g., PocketVet" />
                      {nameError && <p className="text-xs text-red-500 mt-1">{nameError}</p>}
                    </MobileFieldWrapper>
                  </CardContent>
                </Card>
              )}

              <Card className={isHeadlineComplete ? 'shadow-lg border-emerald-400 bg-emerald-50/40' : 'shadow-lg'}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">{isHeadlineComplete && <CheckCircle className="w-5 h-5 text-green-500" />}Slogan</CardTitle>
                  <CardDescription>Your hero line.</CardDescription>
                </CardHeader>
                <CardContent>
                  <MobileFieldWrapper label="Slogan" summary={growthData.headline} isMobile={isMobile} value={growthData.headline} onChange={(e) => handleChange('headline', e.target.value)} placeholder="e.g., The fastest way to plan a solo trip">
                    <Input value={growthData.headline} onChange={(e) => handleChange('headline', e.target.value)} placeholder="e.g., The fastest way to plan a solo trip" />
                  </MobileFieldWrapper>
                </CardContent>
              </Card>

              <Card className={isDescriptionComplete ? 'shadow-lg border-emerald-400 bg-emerald-50/40' : 'shadow-lg'}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">{isDescriptionComplete && <CheckCircle className="w-5 h-5 text-green-500" />}Short Description</CardTitle>
                  <CardDescription>What the product is and who it's for.</CardDescription>
                </CardHeader>
                <CardContent>
                  <MobileFieldWrapper label="Short Description" summary={growthData.description} isMobile={isMobile}>
                    <Textarea value={growthData.description} onChange={(e) => handleChange('description', e.target.value)} placeholder="Describe what the product does and who it's for..." className="h-28" />
                  </MobileFieldWrapper>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><LinkIcon className="w-5 h-5 text-emerald-600" />Product Link</CardTitle>
                  {/* [FIX] Was a longer explanatory sentence never asked for — now just this. */}
                  <CardDescription>Link to your product</CardDescription>
                </CardHeader>
                <CardContent>
                  <MobileFieldWrapper label="Product Link" summary={growthData.product_url} isMobile={isMobile} value={growthData.product_url} onChange={(e) => handleChange('product_url', e.target.value)} placeholder="https://yourproduct.com">
                    <Input type="url" value={growthData.product_url} onChange={(e) => handleChange('product_url', e.target.value)} placeholder="https://yourproduct.com" />
                  </MobileFieldWrapper>
                </CardContent>
              </Card>

              {/* [FIX] Single file only now, replaces on new upload. */}
              <Card className={hasDemoFile ? 'shadow-lg border-emerald-400 bg-emerald-50/40' : 'shadow-lg'}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">{hasDemoFile && <CheckCircle className="w-5 h-5 text-green-500" />}Demo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!hasDemoFile ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <Label htmlFor="growth-file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-emerald-600 hover:text-emerald-500">
                        <span>Upload a file</span>
                        <Input id="growth-file-upload" type="file" className="sr-only" onChange={handleFileUpload} accept="image/*,video/*,.html" disabled={isUploading} />
                      </Label>
                      {isUploading && <Loader2 className="w-5 h-5 animate-spin mx-auto mt-4" />}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                      <p className="font-medium text-sm">{growthData.uploaded_files[0].name}</p>
                      <Button variant="ghost" size="icon" onClick={removeUploadedFile}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                    </div>
                  )}
                  <p className="text-xs text-gray-400">Supports images or a short video. One file only, to keep it focused for reviewers.</p>
                  {!hasDemoFile && <p className="text-xs text-red-500">Required — upload one file before you can save.</p>}
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Social Links</CardTitle>
                  <CardDescription>Shown on your public Growth page.</CardDescription>
                </CardHeader>
                <CardContent>
                  <MobileFieldWrapper label="Social Links" summary={Object.values(growthData.social_links).some(v => v) ? 'Some links added' : null} isMobile={isMobile}>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2"><Linkedin className="w-4 h-4 text-gray-400 flex-shrink-0" /><Input placeholder="LinkedIn URL" value={growthData.social_links.linkedin} onChange={(e) => handleSocialLinkChange('linkedin', e.target.value)} /></div>
                    <div className="flex items-center gap-2"><Facebook className="w-4 h-4 text-gray-400 flex-shrink-0" /><Input placeholder="Facebook URL" value={growthData.social_links.facebook} onChange={(e) => handleSocialLinkChange('facebook', e.target.value)} /></div>
                    <div className="flex items-center gap-2"><Twitter className="w-4 h-4 text-gray-400 flex-shrink-0" /><Input placeholder="X / Twitter URL" value={growthData.social_links.twitter} onChange={(e) => handleSocialLinkChange('twitter', e.target.value)} /></div>
                    <div className="flex items-center gap-2"><Instagram className="w-4 h-4 text-gray-400 flex-shrink-0" /><Input placeholder="Instagram URL" value={growthData.social_links.instagram} onChange={(e) => handleSocialLinkChange('instagram', e.target.value)} /></div>
                    <div className="flex items-center gap-2"><Globe className="w-4 h-4 text-gray-400 flex-shrink-0" /><Input placeholder="Website URL (company site, not the product itself)" value={growthData.social_links.website} onChange={(e) => handleSocialLinkChange('website', e.target.value)} /></div>
                  </div>
                  </MobileFieldWrapper>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ===================== FEEDBACK ===================== */}
            <TabsContent value="feedback" className="space-y-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><MessageCircleQuestion className="w-5 h-5 text-emerald-600" />Your Own Question (optional)</CardTitle>
                  <CardDescription>Ask reviewers anything you want, in your own words. Shown first, before everything else.</CardDescription>
                </CardHeader>
                <CardContent>
                  <MobileFieldWrapper label="Your Own Question" summary={growthData.custom_question} isMobile={isMobile} value={growthData.custom_question} onChange={(e) => handleChange('custom_question', e.target.value)} placeholder="e.g., What almost stopped you from signing up?">
                    <Input value={growthData.custom_question} onChange={(e) => handleChange('custom_question', e.target.value)} placeholder="e.g., What almost stopped you from signing up?" />
                  </MobileFieldWrapper>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className={hasAtLeastOneCategory ? 'flex items-center gap-2' : ''}>{hasAtLeastOneCategory && <CheckCircle className="w-5 h-5 text-green-500" />}Choose which categories appear on your page</CardTitle>
                  <CardDescription>Pick at least one. You can change this anytime, even after your page is live.</CardDescription>
                  {!hasAtLeastOneCategory && <p className="text-xs text-red-500 mt-1">Required — select at least one category before you can save.</p>}
                </CardHeader>
                <CardContent className="space-y-4">

                  {/* --- Business Model (merged Subscription/Freemium) --- */}
                  <div className={`border rounded-lg p-4 ${businessModelReady && growthData.selected_categories.includes('business_model') ? 'border-emerald-400 bg-emerald-50/40' : 'border-gray-200'}`}>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <Checkbox checked={growthData.selected_categories.includes('business_model')} onCheckedChange={() => toggleCategory('business_model')} />
                      <span className="text-sm font-medium text-gray-900 flex items-center">
                        {businessModelReady && growthData.selected_categories.includes('business_model') && <CheckCircle className="w-4 h-4 text-green-500 mr-1.5" />}
                        Business Model<ExplainToggle text={CATEGORY_EXPLANATIONS.business_model} />
                      </span>
                    </label>
                    {growthData.selected_categories.includes('business_model') && (
                      <MobileFieldWrapper label="Business Model" summary={bmd.model_type || null} isMobile={isMobile}>
                      <div className="mt-3 pl-8 space-y-3">
                        <div>
                          <Label className="text-xs">Business model</Label>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-1">
                            {BUSINESS_MODEL_TYPES.map((m) => (
                              <button type="button" key={m.value} onClick={() => handleBusinessModelChange('model_type', m.value)}
                                className={`text-left p-2 rounded-lg border text-sm ${bmd.model_type === m.value ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 bg-white hover:bg-gray-50'}`}>
                                <p className="font-medium text-gray-900">{m.name}</p>
                                <p className="text-xs text-gray-500">{m.description}</p>
                              </button>
                            ))}
                          </div>
                        </div>

                        {bmd.model_type === 'subscription' && (
                          <>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <Checkbox checked={bmd.has_free_tier} onCheckedChange={(checked) => handleBusinessModelChange('has_free_tier', checked === true)} />
                              <span className="text-sm text-gray-800">Free tier available</span>
                            </label>
                            {bmd.has_free_tier && (
                              <div>
                                <Input value={bmd.free_tier_description} onChange={(e) => handleBusinessModelChange('free_tier_description', e.target.value)} placeholder="What's included in the free tier" />
                                {!bmd.free_tier_description.trim() && <p className="text-xs text-red-500 mt-1">Required — describe the free tier, or uncheck it above.</p>}
                              </div>
                            )}

                            <div className="space-y-2">
                              <Label className="text-xs">Paid packages</Label>
                              {bmd.packages.map((p) => (
                                <div key={p.id}>
                                  <div className="flex items-center justify-between bg-gray-50 rounded p-2">
                                    <div><p className="text-sm font-medium">{p.name} — {p.price}</p><p className="text-xs text-gray-500">{p.description}</p></div>
                                    <Button variant="ghost" size="icon" onClick={() => removePackage(p.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                                  </div>
                                  {!p.price.trim() && <p className="text-xs text-red-500 mt-1">This package is missing a price.</p>}
                                </div>
                              ))}
                              {/* [FIX] Stacks vertically on small screens — was
                                  3 inputs crammed side by side, unusable on a
                                  phone even inside the fullscreen sheet. */}
                              <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
                                <div className="flex-1"><Label className="text-xs">Package name</Label><Input value={newPackageName} onChange={(e) => setNewPackageName(e.target.value)} placeholder="e.g., Pro" /></div>
                                <div className="sm:w-24"><Label className="text-xs">Price</Label><Input value={newPackagePrice} onChange={(e) => setNewPackagePrice(e.target.value)} placeholder="$9/mo" /></div>
                                <div className="flex-1"><Label className="text-xs">Description</Label><Input value={newPackageDesc} onChange={(e) => setNewPackageDesc(e.target.value)} placeholder="What's included" /></div>
                                <Button size="sm" onClick={addPackage} className="w-full sm:w-auto">Add package</Button>
                              </div>
                              {bmd.packages.length === 0 && <p className="text-xs text-red-500">Add at least one package.</p>}
                            </div>
                          </>
                        )}
                        {bmd.model_type === 'transactional' && (
                          <div><Label className="text-xs">Fee / commission per transaction</Label><Input value={bmd.transaction_fee_description} onChange={(e) => handleBusinessModelChange('transaction_fee_description', e.target.value)} placeholder="e.g., 5% per booking" />
                            {!bmd.transaction_fee_description.trim() && <p className="text-xs text-red-500 mt-1">Required — describe your fee before you can save.</p>}
                          </div>
                        )}
                        {bmd.model_type === 'ad-driven' && <p className="text-xs text-gray-500">Free to use — no pricing input needed.</p>}
                        {!bmd.model_type && <p className="text-xs text-red-500">Choose a business model.</p>}
                      </div>
                      </MobileFieldWrapper>
                    )}
                  </div>

                  <div className={`border rounded-lg p-4 ${featuresReady && growthData.selected_categories.includes('core_features') ? 'border-emerald-400 bg-emerald-50/40' : 'border-gray-200'}`}>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <Checkbox checked={growthData.selected_categories.includes('core_features')} onCheckedChange={() => toggleCategory('core_features')} />
                      <span className="text-sm font-medium text-gray-900 flex items-center">
                        {featuresReady && growthData.selected_categories.includes('core_features') && <CheckCircle className="w-4 h-4 text-green-500 mr-1.5" />}
                        Core Features (up to 3)<ExplainToggle text={CATEGORY_EXPLANATIONS.core_features} />
                      </span>
                    </label>
                    {growthData.selected_categories.includes('core_features') && (
                      <MobileFieldWrapper label="Core Features" summary={growthData.core_features.length > 0 ? `${growthData.core_features.length} added` : null} isMobile={isMobile}>
                      <div className="mt-3 pl-8 space-y-2">
                        <p className="text-xs text-gray-500">Reviewers see all of these together and rate them once — not one score per feature.</p>
                        {growthData.core_features.map((f) => (
                          <div key={f.id} className="flex items-center justify-between bg-gray-50 rounded p-2">
                            <div><p className="text-sm font-medium">{f.name}</p><p className="text-xs text-gray-500">{f.description}</p></div>
                            <Button variant="ghost" size="icon" onClick={() => removeFeature(f.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                          </div>
                        ))}
                        {growthData.core_features.length < 3 && (
                          <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
                            <div className="flex-1"><Label className="text-xs">Feature name</Label><Input value={newFeatureName} onChange={(e) => setNewFeatureName(e.target.value)} placeholder="e.g., Smart itinerary builder" /></div>
                            <div className="flex-1"><Label className="text-xs">Short description</Label><Input value={newFeatureDesc} onChange={(e) => setNewFeatureDesc(e.target.value)} placeholder="What it does" /></div>
                            <Button size="sm" onClick={addFeature} className="w-full sm:w-auto">Add feature</Button>
                          </div>
                        )}
                        {growthData.core_features.length === 0 && <p className="text-xs text-red-500">Add at least one feature.</p>}
                      </div>
                      </MobileFieldWrapper>
                    )}
                  </div>

                  <div className={`border rounded-lg p-4 ${valuePropReady && growthData.selected_categories.includes('value_proposition') ? 'border-emerald-400 bg-emerald-50/40' : 'border-gray-200'}`}>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <Checkbox checked={growthData.selected_categories.includes('value_proposition')} onCheckedChange={() => toggleCategory('value_proposition')} />
                      <span className="text-sm font-medium text-gray-900 flex items-center">
                        {valuePropReady && growthData.selected_categories.includes('value_proposition') && <CheckCircle className="w-4 h-4 text-green-500 mr-1.5" />}
                        Get feedback on my Slogan<ExplainToggle text={CATEGORY_EXPLANATIONS.value_proposition} />
                      </span>
                    </label>
                    <p className="text-xs text-gray-500 mt-1 pl-8">Your slogan is always shown to reviewers as context. Check this if you also want a specific rating on how accurately it represents the product.</p>
                    {growthData.selected_categories.includes('value_proposition') && !isHeadlineComplete && <p className="text-xs text-red-500 mt-1 pl-8">Fill in your slogan in the Venture Profile tab first.</p>}
                  </div>

                  <div className={`border rounded-lg p-4 ${definitionReady && growthData.selected_categories.includes('product_definition') ? 'border-emerald-400 bg-emerald-50/40' : 'border-gray-200'}`}>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <Checkbox checked={growthData.selected_categories.includes('product_definition')} onCheckedChange={() => toggleCategory('product_definition')} />
                      <span className="text-sm font-medium text-gray-900 flex items-center">
                        {definitionReady && growthData.selected_categories.includes('product_definition') && <CheckCircle className="w-4 h-4 text-green-500 mr-1.5" />}
                        Get feedback on my Product Definition<ExplainToggle text={CATEGORY_EXPLANATIONS.product_definition} />
                      </span>
                    </label>
                    <p className="text-xs text-gray-500 mt-1 pl-8">Your description is always shown to reviewers as context. Check this if you also want a specific rating on how clear and accurate it is.</p>
                    {growthData.selected_categories.includes('product_definition') && !isDescriptionComplete && <p className="text-xs text-red-500 mt-1 pl-8">Fill in your description in the Venture Profile tab first (min 50 characters).</p>}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-emerald-200">
                <CardHeader><CardTitle className="text-base flex items-center">Always included (not optional)<ExplainToggle text={ALWAYS_INCLUDED_EXPLANATION} /></CardTitle></CardHeader>
              </Card>
            </TabsContent>
          </Tabs>

          {/* [FIX] "Back to Dashboard" removed per explicit request —
              unnecessary, and was also pushing the Save button off-screen
              on mobile (confirmed via screenshot) since both shared one
              row with no wrapping. Save now gets the full row. */}
          <div className="flex justify-center items-center pt-6">
            <Button onClick={handleSave} disabled={!canSave || isSaving} className="bg-emerald-600 hover:bg-emerald-700" size="lg">
              {isSaving ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>) : (<>Save Growth Page<CheckCircle className="w-4 h-4 ml-2" /></>)}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
