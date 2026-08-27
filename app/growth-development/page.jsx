// app/growth-development/page.jsx
//
// [v3 — REPLACES v2 entirely] Rebuilt directly from the "צמיחה (1).docx"
// spec, not from earlier brainstorming. The core reframe from this session:
//
//   This page does NOT measure whether the product is good/interesting —
//   that's already measured by whether visitors click through and sign up.
//   It measures whether the FOUNDER is communicating accurately: does the
//   headline land, is the description clear, do the chosen features support
//   the product's purpose, does the pricing fit the value. A low score means
//   "the message isn't landing the way you think it is", not "your product
//   is bad". This framing is shown to the founder up front, and a "?" icon
//   next to each module reveals the same framing at the point of use.
//
// FOUR FOUNDER-SELECTABLE CATEGORIES (from the doc, verbatim intent):
//   1. Business Model   — founder defines pricing packages (MLP-style).
//   2. Core Features     — founder defines UP TO 3 features (not 3-5 — this
//      session narrowed it from the doc's "3–5" to 3, per explicit request).
//      Reviewer rates them together, ONCE — never per-feature. This is a
//      deliberate departure from the MVP per-feature rating mechanism.
//   3. Value Proposition — reuses growthData.headline (already collected in
//      the Page Content tab) rather than a duplicate field. Tests whether
//      the headline/slogan accurately represents the product.
//   4. Product Definition — reuses growthData.description (already collected
//      in Page Content) rather than a duplicate field. Tests whether the
//      description is clear and accurate.
//
// FIXED, NOT SELECTABLE (always shown to every reviewer, regardless of which
// of the 4 categories the founder turned on):
//   - "Did you visit the actual product?" Yes / No.
//     If Yes: "How well did it match what you expected?" slider + optional
//     "What was different from what you expected?" text.
//   - Final open question: "If you could change one thing about how this
//     product is defined, what would it be?"
//
// REMOVED FROM v2 ENTIRELY (was wrong direction, not part of the real spec):
//   Look & Feel, User Experience, per-feature MVP-style rating, Referral/NPS,
//   Competitor Substitute, Friction, Testimonial Request. None of these are
//   in the "צמיחה" doc. Deleted rather than kept-and-unchecked, since keeping
//   wrong options around invites confusion later.
//
// DB DEPENDENCY (proposed, not yet confirmed to exist):
//   ALTER TABLE ventures ADD COLUMN growth_data jsonb DEFAULT '{}';
//
// STILL NOT FIXED (explicit, not an oversight): no venture.phase guard on
// this page. Verified this session that mlp-development-center has none
// either — consistent with the rest of the codebase as it stands, not a new
// hole introduced here. Do not add without separate approval.
"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { Venture } from '@/api/entities.js';
import { User } from '@/api/entities.js';
import { UploadFile } from '@/api/integrations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input.jsx';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Rocket, Upload, Trash2, Loader2, CheckCircle, ArrowLeft, Link as LinkIcon, Plus, HelpCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createPageUrl } from '@/utils';

// ============================================================================
// Small reusable "?" icon that reveals an explanation on click. No shared
// Tooltip/Popover component was seen anywhere in the files read this
// session, so this is a plain local-state toggle, not a new dependency.
// ============================================================================
function ExplainToggle({ text }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="inline-block align-middle ml-1.5">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="inline-flex items-center justify-center w-4 h-4 rounded-full text-gray-400 hover:text-emerald-600"
        aria-label="Why this question?"
      >
        <HelpCircle className="w-4 h-4" />
      </button>
      {open && (
        <span className="block mt-1 text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded-md p-2 max-w-md">
          {text}
        </span>
      )}
    </span>
  );
}

const FRAMING_TEXT = "This isn't a popularity contest for your product. Whether people find it interesting enough to click through and sign up is a separate signal you'll already see for yourself. This page measures whether you're communicating it accurately — a low score means something isn't landing the way you think it is, not that the product is bad.";

// [REUSED verbatim from revenue-modeling-experience/page.jsx's MODEL_OPTIONS]
// Same 4 values and descriptions, so a founder sees the same model names
// here as they would in the revenue simulator elsewhere in the app.
const BUSINESS_MODEL_TYPES = [
  { value: 'subscription', name: 'Subscription', description: 'Monthly/Annual recurring fees.' },
  { value: 'freemium', name: 'Freemium', description: 'Ad-supported free tier with paid conversion.' },
  { value: 'transactional', name: 'Transactional', description: 'Per-transaction fees or commissions.' },
  { value: 'ad-driven', name: 'Ad-Driven', description: 'Free product, revenue solely from ads.' },
];

const CATEGORY_EXPLANATIONS = {
  business_model: "Tests whether your pricing feels like it fits the value you're offering — not whether this reviewer personally thinks it's cheap or expensive.",
  core_features: "Tests whether the features you chose to highlight actually support what you say the product does — not whether reviewers find each feature exciting.",
  value_proposition: "Tests whether your headline/slogan accurately represents the product — not whether the product itself sounds appealing.",
  product_definition: "Tests whether your description is clear and accurate — not whether the product itself sounds appealing.",
};

export default function GrowthDevelopment() {
  const [venture, setVenture] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();

  const [growthData, setGrowthData] = useState({
    headline: '',          // also serves as the Value Proposition module's content
    description: '',       // also serves as the Product Definition module's content
    product_url: '',
    uploaded_files: [],    // accumulates, never replaces
    social_links: { linkedin: '', twitter: '', instagram: '', website: '' },
    is_imported: false,

    // Which of the 4 categories the founder turned on. Can be changed any
    // time per the doc ("They can add, remove, or change categories at any
    // time"venturemessage — no lock-in once published).
    selected_categories: [], // subset of: business_model, core_features, value_proposition, product_definition

    core_features: [],       // [{ id, name, description }], max 3

    // [CHANGED — was a generic pricing_packages list] Reuses the exact 4
    // model types from revenue-modeling-experience/page.jsx (MODEL_OPTIONS),
    // not a SaaS-only assumption. Only price fields relevant to a reviewer
    // judging "does this fit the product" are kept — CAC/Churn/Marketing
    // Budget/etc. from the full revenue simulator are deliberately excluded,
    // per this session's explicit confirmation ("רק סוג מודל ומחירים").
    business_model_data: {
      model_type: '',              // 'subscription' | 'freemium' | 'transactional' | 'ad-driven'
      tier1_price: '',             // subscription, freemium
      tier2_price: '',             // subscription, freemium — optional premium tier
      transaction_fee_description: '', // transactional — kept as free text since fees are sometimes % and sometimes flat
      // ad-driven: no price field at all — the product is free, that's the whole model.
    },
  });

  const [newFeatureName, setNewFeatureName] = useState('');
  const [newFeatureDesc, setNewFeatureDesc] = useState('');

  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const user = await User.me();
      const ventures = await Venture.filter({ created_by: user.email }, "-created_date");
      if (ventures.length > 0) {
        const currentVenture = ventures[0];
        setVenture(currentVenture);
        if (currentVenture.growth_data) {
          const loaded = { ...currentVenture.growth_data };
          loaded.product_url = loaded.product_url || '';
          loaded.uploaded_files = loaded.uploaded_files || [];
          loaded.is_imported = loaded.is_imported === true;
          loaded.selected_categories = loaded.selected_categories || [];
          loaded.core_features = loaded.core_features || [];
          loaded.business_model_data = {
            model_type: loaded.business_model_data?.model_type || '',
            tier1_price: loaded.business_model_data?.tier1_price || '',
            tier2_price: loaded.business_model_data?.tier2_price || '',
            transaction_fee_description: loaded.business_model_data?.transaction_fee_description || '',
          };
          loaded.social_links = {
            linkedin: loaded.social_links?.linkedin || '',
            twitter: loaded.social_links?.twitter || '',
            instagram: loaded.social_links?.instagram || '',
            website: loaded.social_links?.website || '',
          };
          setGrowthData(prev => ({ ...prev, ...loaded }));
        }
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

  const toggleCategory = (key) => {
    setGrowthData(prev => {
      const has = prev.selected_categories.includes(key);
      const selected_categories = has
        ? prev.selected_categories.filter(k => k !== key)
        : [...prev.selected_categories, key];
      return { ...prev, selected_categories };
    });
  };

  // --- Core Features sub-form (max 3, per this session's explicit narrowing from the doc's 3–5) ---
  const addFeature = () => {
    if (!newFeatureName.trim() || growthData.core_features.length >= 3) return;
    setGrowthData(prev => ({
      ...prev,
      core_features: [...prev.core_features, { id: `feat_${Date.now()}`, name: newFeatureName.trim(), description: newFeatureDesc.trim() }],
    }));
    setNewFeatureName('');
    setNewFeatureDesc('');
  };
  const removeFeature = (id) =>
    setGrowthData(prev => ({ ...prev, core_features: prev.core_features.filter(f => f.id !== id) }));

  // --- Business model sub-form ---
  const handleBusinessModelChange = (field, value) =>
    setGrowthData(prev => ({ ...prev, business_model_data: { ...prev.business_model_data, [field]: value } }));

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setIsUploading(true);
    try {
      const uploadedResults = await Promise.all(files.map(async (file) => {
        const result = await UploadFile({ file });
        const fileExt = file.name.split('.').pop().toLowerCase();
        const isHTML = ['html', 'htm'].includes(fileExt);
        const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(fileExt);
        return { type: isHTML ? 'html' : (isImage ? 'image' : 'other'), name: file.name, url: result.file_url };
      }));
      setGrowthData(prev => ({ ...prev, uploaded_files: [...prev.uploaded_files, ...uploadedResults] }));
      showToast(`${uploadedResults.length} file(s) uploaded successfully!`);
    } catch (error) {
      console.error('Error uploading file:', error);
      showToast('Error uploading file. Please try again.', 'error');
    }
    setIsUploading(false);
    e.target.value = '';
  };
  const removeUploadedFile = (index) =>
    setGrowthData(prev => ({ ...prev, uploaded_files: prev.uploaded_files.filter((_, i) => i !== index) }));

  const handleSave = async () => {
    if (!venture) return;
    setIsSaving(true);
    try {
      await Venture.update(venture.id, { growth_data: growthData });
      showToast("Growth page saved!");
      router.push(createPageUrl("Dashboard"));
    } catch (error) {
      console.error("Error saving growth data:", error);
      showToast("Error saving. Please try again.", "error");
    }
    setIsSaving(false);
  };

  const isHeadlineComplete = growthData.headline.trim().length >= 10;
  const isDescriptionComplete = growthData.description.trim().length >= 50;
  const hasAtLeastOneCategory = growthData.selected_categories.length > 0;
  const featuresReady = !growthData.selected_categories.includes('core_features') || growthData.core_features.length > 0;
  const bmd = growthData.business_model_data;
  const businessModelReady = (() => {
    if (!growthData.selected_categories.includes('business_model')) return true;
    if (!bmd.model_type) return false;
    if (bmd.model_type === 'subscription' || bmd.model_type === 'freemium') return bmd.tier1_price.trim().length > 0;
    if (bmd.model_type === 'transactional') return bmd.transaction_fee_description.trim().length > 0;
    if (bmd.model_type === 'ad-driven') return true; // no price field needed
    return false;
  })();
  const valuePropReady = !growthData.selected_categories.includes('value_proposition') || isHeadlineComplete;
  const definitionReady = !growthData.selected_categories.includes('product_definition') || isDescriptionComplete;

  const canSave = hasAtLeastOneCategory && featuresReady && businessModelReady && valuePropReady && definitionReady;

  if (isLoading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>;
  if (!venture) return (
    <div className="p-8 text-center">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">No Venture Found</h1>
      <p className="text-gray-600">Please create a venture first to access this page.</p>
    </div>
  );

  return (
    <>
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-xl shadow-lg text-white font-medium transition-all ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
          {toast.message}
        </div>
      )}

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50 p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Rocket className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Growth Development Center</h1>
          </div>

          {/* Framing, shown once up front — same text also available per-category via the "?" icon */}
          <Card className="shadow-sm border-emerald-200 bg-emerald-50">
            <CardContent className="p-5">
              <p className="text-sm text-emerald-900 leading-relaxed">{FRAMING_TEXT}</p>
            </CardContent>
          </Card>

          <Tabs defaultValue="content" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="content">Page Content</TabsTrigger>
              <TabsTrigger value="categories">Feedback Categories</TabsTrigger>
              <TabsTrigger value="demo">Demo &amp; Links</TabsTrigger>
            </TabsList>

            {/* ===================== PAGE CONTENT ===================== */}
            <TabsContent value="content" className="space-y-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {isHeadlineComplete && <CheckCircle className="w-5 h-5 text-green-500" />}
                    Headline / Slogan
                  </CardTitle>
                  <CardDescription>Your hero line — what the Value Proposition category will test.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Input value={growthData.headline} onChange={(e) => handleChange('headline', e.target.value)} placeholder="e.g., The fastest way to plan a solo trip" />
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {isDescriptionComplete && <CheckCircle className="w-5 h-5 text-green-500" />}
                    Short Description
                  </CardTitle>
                  <CardDescription>What the product is and who it's for — what the Product Definition category will test.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea value={growthData.description} onChange={(e) => handleChange('description', e.target.value)} placeholder="Describe what the product does and who it's for..." className="h-28" />
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><LinkIcon className="w-5 h-5 text-emerald-600" />Product Link</CardTitle>
                  <CardDescription>If your product already exists outside StartZig, link to it here.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Input type="url" value={growthData.product_url} onChange={(e) => handleChange('product_url', e.target.value)} placeholder="https://yourproduct.com" />
                </CardContent>
              </Card>
            </TabsContent>

            {/* ===================== FEEDBACK CATEGORIES ===================== */}
            <TabsContent value="categories" className="space-y-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className={hasAtLeastOneCategory ? 'flex items-center gap-2' : ''}>
                    {hasAtLeastOneCategory && <CheckCircle className="w-5 h-5 text-green-500" />}
                    Choose which categories appear on your page
                  </CardTitle>
                  <CardDescription>Pick at least one. You can change this anytime, even after your page is live.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">

                  {/* --- Business Model --- */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <Checkbox checked={growthData.selected_categories.includes('business_model')} onCheckedChange={() => toggleCategory('business_model')} />
                      <span className="text-sm font-medium text-gray-900">
                        Business Model
                        <ExplainToggle text={CATEGORY_EXPLANATIONS.business_model} />
                      </span>
                    </label>
                    {growthData.selected_categories.includes('business_model') && (
                      <div className="mt-3 pl-8 space-y-3">
                        <div>
                          <Label className="text-xs">Business model</Label>
                          <div className="grid grid-cols-2 gap-2 mt-1">
                            {BUSINESS_MODEL_TYPES.map((m) => (
                              <button
                                type="button"
                                key={m.value}
                                onClick={() => handleBusinessModelChange('model_type', m.value)}
                                className={`text-left p-2 rounded-lg border text-sm ${bmd.model_type === m.value ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 bg-white hover:bg-gray-50'}`}
                              >
                                <p className="font-medium text-gray-900">{m.name}</p>
                                <p className="text-xs text-gray-500">{m.description}</p>
                              </button>
                            ))}
                          </div>
                        </div>

                        {(bmd.model_type === 'subscription' || bmd.model_type === 'freemium') && (
                          <div className="flex gap-2">
                            <div className="flex-1">
                              <Label className="text-xs">Tier 1 price (monthly)</Label>
                              <Input value={bmd.tier1_price} onChange={(e) => handleBusinessModelChange('tier1_price', e.target.value)} placeholder="$9.99" />
                            </div>
                            <div className="flex-1">
                              <Label className="text-xs">Tier 2 price (optional, premium)</Label>
                              <Input value={bmd.tier2_price} onChange={(e) => handleBusinessModelChange('tier2_price', e.target.value)} placeholder="$29.99" />
                            </div>
                          </div>
                        )}

                        {bmd.model_type === 'transactional' && (
                          <div>
                            <Label className="text-xs">Fee / commission per transaction</Label>
                            <Input value={bmd.transaction_fee_description} onChange={(e) => handleBusinessModelChange('transaction_fee_description', e.target.value)} placeholder="e.g., 5% per booking, or $2 flat fee" />
                          </div>
                        )}

                        {bmd.model_type === 'ad-driven' && (
                          <p className="text-xs text-gray-500">Free to use — no pricing input needed for this model.</p>
                        )}

                        {!bmd.model_type && <p className="text-xs text-red-500">Choose a business model.</p>}
                      </div>
                    )}
                  </div>

                  {/* --- Core Features --- */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <Checkbox checked={growthData.selected_categories.includes('core_features')} onCheckedChange={() => toggleCategory('core_features')} />
                      <span className="text-sm font-medium text-gray-900">
                        Core Features (up to 3)
                        <ExplainToggle text={CATEGORY_EXPLANATIONS.core_features} />
                      </span>
                    </label>
                    {growthData.selected_categories.includes('core_features') && (
                      <div className="mt-3 pl-8 space-y-2">
                        <p className="text-xs text-gray-500">Reviewers see all of these together and rate them once — not one score per feature.</p>
                        {growthData.core_features.map((f) => (
                          <div key={f.id} className="flex items-center justify-between bg-gray-50 rounded p-2">
                            <div><p className="text-sm font-medium">{f.name}</p><p className="text-xs text-gray-500">{f.description}</p></div>
                            <Button variant="ghost" size="icon" onClick={() => removeFeature(f.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                          </div>
                        ))}
                        {growthData.core_features.length < 3 && (
                          <div className="flex gap-2 items-end">
                            <div className="flex-1"><Label className="text-xs">Feature name</Label><Input value={newFeatureName} onChange={(e) => setNewFeatureName(e.target.value)} placeholder="e.g., Smart itinerary builder" /></div>
                            <div className="flex-1"><Label className="text-xs">Short description</Label><Input value={newFeatureDesc} onChange={(e) => setNewFeatureDesc(e.target.value)} placeholder="What it does" /></div>
                            <Button size="sm" onClick={addFeature}><Plus className="w-4 h-4" /></Button>
                          </div>
                        )}
                        {growthData.core_features.length === 0 && <p className="text-xs text-red-500">Add at least one feature.</p>}
                      </div>
                    )}
                  </div>

                  {/* --- Value Proposition (reuses headline) --- */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <Checkbox checked={growthData.selected_categories.includes('value_proposition')} onCheckedChange={() => toggleCategory('value_proposition')} />
                      <span className="text-sm font-medium text-gray-900">
                        Value Proposition
                        <ExplainToggle text={CATEGORY_EXPLANATIONS.value_proposition} />
                      </span>
                    </label>
                    {growthData.selected_categories.includes('value_proposition') && (
                      <div className="mt-2 pl-8">
                        <p className="text-xs text-gray-500">Uses your Headline / Slogan from the Page Content tab.</p>
                        {!isHeadlineComplete && <p className="text-xs text-red-500 mt-1">Fill in your headline in the Page Content tab first.</p>}
                      </div>
                    )}
                  </div>

                  {/* --- Product Definition (reuses description) --- */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <Checkbox checked={growthData.selected_categories.includes('product_definition')} onCheckedChange={() => toggleCategory('product_definition')} />
                      <span className="text-sm font-medium text-gray-900">
                        Product Definition
                        <ExplainToggle text={CATEGORY_EXPLANATIONS.product_definition} />
                      </span>
                    </label>
                    {growthData.selected_categories.includes('product_definition') && (
                      <div className="mt-2 pl-8">
                        <p className="text-xs text-gray-500">Uses your Short Description from the Page Content tab.</p>
                        {!isDescriptionComplete && <p className="text-xs text-red-500 mt-1">Fill in your description in the Page Content tab first (min 50 characters).</p>}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Fixed, non-optional, shown for visibility only — not a toggle */}
              <Card className="shadow-lg border-emerald-200">
                <CardHeader><CardTitle className="text-base">Always included (not optional)</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-sm text-gray-700">
                  <p>"Did you visit the actual product?" — Yes / No. If Yes: "How well did it match what you expected?" + optional "What was different?"</p>
                  <p>Final question, regardless of category selection: "If you could change one thing about how this product is defined, what would it be?"</p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ===================== DEMO & LINKS ===================== */}
            <TabsContent value="demo" className="space-y-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Demo Files</CardTitle>
                  <CardDescription>Optional if you provided a Product Link. Files accumulate — new uploads don't remove earlier ones.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <Label htmlFor="growth-file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-emerald-600 hover:text-emerald-500">
                      <span>Upload file(s)</span>
                      <Input id="growth-file-upload" type="file" multiple className="sr-only" onChange={handleFileUpload} accept="image/*,.html" disabled={isUploading} />
                    </Label>
                    {isUploading && <Loader2 className="w-5 h-5 animate-spin mx-auto mt-4" />}
                  </div>
                  {growthData.uploaded_files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                      <p className="font-medium text-sm">{file.name}</p>
                      <Button variant="ghost" size="icon" onClick={() => removeUploadedFile(index)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader><CardTitle>Social Links</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <Input placeholder="LinkedIn URL" value={growthData.social_links.linkedin} onChange={(e) => handleSocialLinkChange('linkedin', e.target.value)} />
                  <Input placeholder="X / Twitter URL" value={growthData.social_links.twitter} onChange={(e) => handleSocialLinkChange('twitter', e.target.value)} />
                  <Input placeholder="Instagram URL" value={growthData.social_links.instagram} onChange={(e) => handleSocialLinkChange('instagram', e.target.value)} />
                  <Input placeholder="Website URL" value={growthData.social_links.website} onChange={(e) => handleSocialLinkChange('website', e.target.value)} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-between items-center pt-6">
            <Button variant="outline" onClick={() => router.push(createPageUrl("Dashboard"))}><ArrowLeft className="w-4 h-4 mr-2" />Back to Dashboard</Button>
            <Button onClick={handleSave} disabled={!canSave || isSaving} className="bg-emerald-600 hover:bg-emerald-700" size="lg">
              {isSaving ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>) : (<>Save Growth Page<CheckCircle className="w-4 h-4 ml-2" /></>)}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
