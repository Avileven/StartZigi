"use client";
// app/growth-development/feedback/page.jsx   (STEP 2 of 2: feedback questions)
//
// Second page of the Growth flow. The venture profile was saved on step 1
// (app/growth-development/page.jsx). Here the founder chooses which questions reviewers answer,
// adds core features / business model / own question, and saves. After saving, a "your page is ready" screen opens /promotion?type=in-app.
//
// It reads the same venture.growth_data. On save it re-reads the stored value and only writes
// the fields that belong to this page, so the profile fields saved on step 1 are never overwritten.
import React, { useState, useEffect, useCallback } from 'react';
import { Venture } from '@/api/entities.js';
import { User } from '@/api/entities.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, Loader2, CheckCircle, ArrowLeft, MessageCircleQuestion, ListPlus, Image as ImageIcon, Pencil, Globe } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  useIsMobile, MobileFieldWrapper, ExplainBlock, BUSINESS_MODEL_TYPES, CATEGORY_EXPLANATIONS,
  STAGES, STAGE_STYLE, normalizeGrowthData, GrowthStyles, HowItWorks, ProfileDone,
} from '@/components/ventures/GrowthUI';

// The fields that belong to this page (everything else in growth_data is left as stored).
const feedbackFields = (g) => ({
  selected_categories: g.selected_categories,
  core_features: g.core_features,
  business_model_data: g.business_model_data,
  custom_question: g.custom_question,
  early_incentive: g.early_incentive,
  early_offer_text: g.early_offer_text,
});

export default function GrowthFeedbackSetup() {
  const [venture, setVenture] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const router = useRouter();
  const isMobile = useIsMobile();

  const [growthData, setGrowthData] = useState({
    stage: 'product',
    need: '',
    solution: '',
    name: '',
    headline: '',
    description: '',
    product_url: '',
    uploaded_files: [],
    selected_categories: [],
    core_features: [],
    business_model_data: { model_type: '', has_free_tier: false, free_tier_description: '', packages: [], transaction_fee_description: '' },
    custom_question: '',
    early_incentive: '',
    early_offer_text: '',
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
      const ventures = await Venture.filter({ created_by: user.email }, "-created_date");
      if (ventures.length > 0) {
        const currentVenture = ventures[0];
        setVenture(currentVenture);
        setGrowthData(prev => ({ ...prev, ...normalizeGrowthData(currentVenture) }));
      }
    } catch (error) {
      console.error("Error loading venture:", error);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);
  // Writes only this page's fields on top of what is stored now.
  const persist = async (g) => {
    const latest = await Venture.get(venture.id);
    await Venture.update(venture.id, { growth_data: { ...(latest.growth_data || {}), ...feedbackFields(g) } });
  };

  useEffect(() => {
    if (!venture) return;
    const interval = setInterval(async () => {
      try {
        await persist(growthData);
        showToast('Auto-saved', 'success');
      } catch (e) {}
    }, 30000);
    return () => clearInterval(interval);
  }, [venture, growthData]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (field, value) => setGrowthData(prev => ({ ...prev, [field]: value }));
  const handleSocialLinkChange = (platform, value) =>
    setGrowthData(prev => ({ ...prev, social_links: { ...prev.social_links, [platform]: value } }));
  const handleBusinessModelChange = (field, value) =>
    setGrowthData(prev => ({ ...prev, business_model_data: { ...prev.business_model_data, [field]: value } }));

  const toggleCategory = (key) => {
    if (['idea_problem', 'idea_solution', 'idea_alternatives', 'proto_product', 'core_features'].includes(key)) return;
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

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await persist(growthData);
      // Read back the fields of this page and compare, so a silent failure is never hidden.
      try {
        const saved = await Venture.get(venture.id);
        const same = (a, b) => {
          if (a === b) return true;
          if (typeof a !== 'object' || typeof b !== 'object' || !a || !b) return false;
          const ka = Object.keys(a), kb = Object.keys(b);
          return ka.length === kb.length && ka.every((k) => same(a[k], b[k]));
        };
        const checkFields = ['custom_question', 'business_model_data', 'core_features', 'selected_categories', 'early_incentive', 'early_offer_text'];
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
      // The public page is ready: show the animated screen, its button opens /promotion?type=in-app.
      setSaved(true);
    } catch (error) {
      console.error("Error saving growth data:", error);
      showToast("Error saving. Please try again.", "error");
    }
    setIsSaving(false);
  };

  const goProfile = () => router.push('/growth-development');

  const isIdea = growthData.stage === 'idea';
  const isPrototype = growthData.stage === 'prototype';
  const isProduct = growthData.stage === 'product';
  const isHeadlineComplete = growthData.headline.trim().length >= 10;
  const isDescriptionComplete = growthData.description.trim().length >= 50;
  const hasAtLeastOneCategory = growthData.selected_categories.length > 0;
  const featuresReady = isIdea || growthData.core_features.length > 0;
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

  const canSave = hasAtLeastOneCategory && featuresReady && businessModelReady && valuePropReady && definitionReady;

  // What is still missing before Save works, in plain words.
  const missingItems = [];
  if (growthData.selected_categories.includes('value_proposition') && !isHeadlineComplete) missingItems.push({ profile: true, text: `The Slogan needs at least 10 characters (${growthData.headline.trim().length} now)` });
  if (growthData.selected_categories.includes('product_definition') && !isDescriptionComplete) missingItems.push({ profile: true, text: `The Short Description needs at least 50 characters (${growthData.description.trim().length} now)` });
  if (!hasAtLeastOneCategory) missingItems.push({ text: 'Choose at least one question for reviewers' });
  if (!featuresReady) missingItems.push({ text: 'Add at least one core feature, with a name and a short description' });
  if (!businessModelReady) missingItems.push({ text: 'Finish your Business Model details' });

  if (isLoading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>;

  if (!venture) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50 p-4 md:p-8">
        <div className="max-w-md mx-auto mt-16 rounded-2xl bg-white border border-gray-200 shadow-sm p-6 text-center space-y-4">
          <p className="text-gray-800 font-medium">Create your venture profile first, then come back to choose the feedback questions.</p>
          <Button onClick={goProfile} className="bg-emerald-600 hover:bg-emerald-700">Go to the profile</Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <GrowthStyles />
      {saved && (
        <ProfileDone
          title="Your public page is ready"
          text="Now you can ask the community for feedback."
          note={growthData.stage !== 'idea' && (growthData.uploaded_files || []).length === 0 ? "You haven't uploaded any media yet. You'll need it before you can ask for feedback." : null}
          onContinue={() => router.push('/promotion?type=in-app')}
        />
      )}
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
            </div>
          </div>


          <HowItWorks kicker="Feedback" title="Choose your feedback questions" steps={[
            { icon: <ListPlus className="w-5 h-5" />, text: 'Beyond the basic questions, choose additional questions.' },
            { icon: <ImageIcon className="w-5 h-5" />, text: 'Check the box if you want feedback on the media you uploaded.' },
            { icon: <Pencil className="w-5 h-5" />, text: 'If needed, write a personal question.' },
            { icon: <Globe className="w-5 h-5" />, text: <>Click <b>Save</b>, and your public page is ready for feedback.</> },
          ]} />

              {/* [RESTRUCTURE] Core questions first (always asked), then the
                  optional questions to choose from, with the founder's own
                  question as the last item of that choice card. */}
              <Card className="shadow-lg border-emerald-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-green-500" />Core questions (always asked)</CardTitle>
                  <CardDescription>These are asked on every page at this stage.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isIdea && (
                    <>
                      <div className="border border-emerald-400 bg-emerald-50/40 rounded-lg p-4">
                        <p className="text-sm font-medium text-gray-900">The Need</p>
                        <p className="text-xs text-gray-500 mt-1">"The problem feels relevant and worth solving."</p>
                      </div>
                      <div className="border border-emerald-400 bg-emerald-50/40 rounded-lg p-4">
                        <p className="text-sm font-medium text-gray-900">Your Solution</p>
                        <p className="text-xs text-gray-500 mt-1">"The solution offers something meaningful, and its value is clear to me."</p>
                      </div>
                      <div className="border border-emerald-400 bg-emerald-50/40 rounded-lg p-4">
                        <p className="text-sm font-medium text-gray-900">Innovation</p>
                        <p className="text-xs text-gray-500 mt-1">"Based on what you know, is this idea innovative?"</p>
                      </div>
                    </>
                  )}
                  {isPrototype && (
                    <div className="border border-emerald-400 bg-emerald-50/40 rounded-lg p-4">
                      <p className="text-sm font-medium text-gray-900">The Product</p>
                      <p className="text-xs text-gray-500 mt-1">"How clearly and accurately is this product defined?"</p>
                    </div>
                  )}
                  {!isIdea && (
                  <div className={`border rounded-lg p-4 ${featuresReady ? 'border-emerald-400 bg-emerald-50/40' : 'border-gray-200'}`}>
                    <p className="text-sm font-medium text-gray-900 flex items-center">
                      {featuresReady && <CheckCircle className="w-4 h-4 text-green-500 mr-1.5" />}
                      Core Features (up to 3)
                    </p>
                    <ExplainBlock flush text={CATEGORY_EXPLANATIONS.core_features} extra="Reviewers see all of these together and rate them once — not one score per feature." />
                    <MobileFieldWrapper label="Core Features" summary={growthData.core_features.length > 0 ? `${growthData.core_features.length} added` : null} isMobile={isMobile}>
                    <div className="mt-3 space-y-2">
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
                      {growthData.core_features.length === 0 && <p className="text-xs text-red-500">Required — add at least one feature before you can save.</p>}
                      <div className="pt-2 space-y-1 text-xs text-gray-500">
                        <p>Reviewers are asked:</p>
                        <p>"How well do these features support what this product is meant to do? (1-10)"</p>
                        <p>"What feature do you think would add value to the product? (optional)"</p>
                      </div>
                    </div>
                    </MobileFieldWrapper>
                  </div>
                  )}
                  {isProduct && (
                    <>
                      <div className="border border-emerald-400 bg-emerald-50/40 rounded-lg p-4">
                        <p className="text-sm font-medium text-gray-900">Product visit</p>
                        <p className="text-xs text-gray-500 mt-1">"Did you visit the actual product?" Asked only if you added a product link. If yes: "How well did it match what you expected?", "What was different?" (optional) and a testimonial (optional).</p>
                      </div>
                      <div className="border border-emerald-400 bg-emerald-50/40 rounded-lg p-4">
                        <p className="text-sm font-medium text-gray-900">One Last Thing</p>
                        <p className="text-xs text-gray-500 mt-1">"What's the one thing you'd improve about this product?" Asked at the end.</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Choose additional questions</CardTitle>
                  <CardDescription>Optional. You can change this anytime, even after your page is live.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">

                  {isIdea && (
                    <>
                      {[
                        { key: 'idea_pay', label: 'Willingness to pay', hint: '"Would you pay for a product like this?" Answers appear in Feedback Details.' },
                        { key: 'idea_value', label: 'What would make it more valuable', hint: 'An open question for suggestions.' },
                      ].map((q) => (
                        <div key={q.key} className="border border-gray-200 rounded-lg p-4">
                          <label className="flex items-start gap-3 cursor-pointer">
                            <Checkbox checked={growthData.selected_categories.includes(q.key)} onCheckedChange={() => toggleCategory(q.key)} />
                            <span className="text-sm font-medium text-gray-900">{q.label}</span>
                          </label>
                          <p className="text-xs text-gray-500 mt-1 pl-8">{q.hint}</p>
                        </div>
                      ))}
                    </>
                  )}

                  {/* --- Business Model (merged Subscription/Freemium) --- */}
                  {!isIdea && (<>
                  <div className={`border rounded-lg p-4 ${businessModelReady && growthData.selected_categories.includes('business_model') ? 'border-emerald-400 bg-emerald-50/40' : 'border-gray-200'}`}>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <Checkbox checked={growthData.selected_categories.includes('business_model')} onCheckedChange={() => toggleCategory('business_model')} />
                      <span className="text-sm font-medium text-gray-900 flex items-center">
                        {businessModelReady && growthData.selected_categories.includes('business_model') && <CheckCircle className="w-4 h-4 text-green-500 mr-1.5" />}
                        Business Model
                      </span>
                    </label>
                    <ExplainBlock text={CATEGORY_EXPLANATIONS.business_model} />
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

                  {isProduct && (<>
                  <div className={`border rounded-lg p-4 ${valuePropReady && growthData.selected_categories.includes('value_proposition') ? 'border-emerald-400 bg-emerald-50/40' : 'border-gray-200'}`}>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <Checkbox checked={growthData.selected_categories.includes('value_proposition')} onCheckedChange={() => toggleCategory('value_proposition')} />
                      <span className="text-sm font-medium text-gray-900 flex items-center">
                        {valuePropReady && growthData.selected_categories.includes('value_proposition') && <CheckCircle className="w-4 h-4 text-green-500 mr-1.5" />}
                        Get feedback on my Slogan
                      </span>
                    </label>
                    <ExplainBlock text={CATEGORY_EXPLANATIONS.value_proposition} extra="Your slogan is always shown to reviewers as context. Check this if you also want a specific rating on how accurately it represents the product." />
                    {growthData.selected_categories.includes('value_proposition') && !isHeadlineComplete && <p className="text-xs text-red-500 mt-1 pl-8">Fill in your slogan on the profile page first (step 1).</p>}
                  </div>

                  <div className={`border rounded-lg p-4 ${definitionReady && growthData.selected_categories.includes('product_definition') ? 'border-emerald-400 bg-emerald-50/40' : 'border-gray-200'}`}>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <Checkbox checked={growthData.selected_categories.includes('product_definition')} onCheckedChange={() => toggleCategory('product_definition')} />
                      <span className="text-sm font-medium text-gray-900 flex items-center">
                        {definitionReady && growthData.selected_categories.includes('product_definition') && <CheckCircle className="w-4 h-4 text-green-500 mr-1.5" />}
                        Get feedback on my Product Definition
                      </span>
                    </label>
                    <ExplainBlock text={CATEGORY_EXPLANATIONS.product_definition} extra="Your description is always shown to reviewers as context. Check this if you also want a specific rating on how clear and accurate it is." />
                    {growthData.selected_categories.includes('product_definition') && !isDescriptionComplete && <p className="text-xs text-red-500 mt-1 pl-8">Fill in your description on the profile page first (step 1) (min 50 characters).</p>}
                  </div>
                  </>)}
                  </>)}

                  {hasDemoFile && (
                  <div className={`border rounded-lg p-4 ${growthData.selected_categories.includes('media') ? 'border-emerald-400 bg-emerald-50/40' : 'border-gray-200'}`}>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <Checkbox checked={growthData.selected_categories.includes('media')} onCheckedChange={() => toggleCategory('media')} />
                      <span className="text-sm font-medium text-gray-900 flex items-center">
                        {growthData.selected_categories.includes('media') && <CheckCircle className="w-4 h-4 text-green-500 mr-1.5" />}
                        Get feedback on my Media
                      </span>
                    </label>
                    <ExplainBlock text={CATEGORY_EXPLANATIONS.media} />
                  </div>
                  )}

                  {/* [NEW — Early Adopters] Not offered at the idea stage. */}
                  {!isIdea && (
                  <div className={`border rounded-lg p-4 ${growthData.selected_categories.includes('early_users') ? 'border-emerald-400 bg-emerald-50/40' : 'border-gray-200'}`}>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <Checkbox checked={growthData.selected_categories.includes('early_users')} onCheckedChange={() => toggleCategory('early_users')} />
                      <span className="text-sm font-medium text-gray-900 flex items-center">
                        {growthData.selected_categories.includes('early_users') && <CheckCircle className="w-4 h-4 text-green-500 mr-1.5" />}
                        I'm looking for Early Adopters
                      </span>
                    </label>
                    <ExplainBlock text="Early Adopters are the first people to try your product and help shape it. Reviewers are invited to join your Early Adopters Community. Those who say yes share their username and email with you, and you'll see them in Product Feedback." />
                    {growthData.selected_categories.includes('early_users') && (
                      <div className="mt-4 pl-8 border-t border-emerald-100 pt-4">
                        <p className="text-sm font-semibold text-gray-900">Offer an Incentive <span className="text-xs font-normal text-gray-400">(Optional)</span></p>
                        <p className="text-xs text-gray-500 mt-1">Give people a reason to join your Early Adopters Community.</p>
                        <div className="mt-3 space-y-2">
                          {[['free_access', 'Free access'], ['discount', 'Discount'], ['exclusive', 'Exclusive features or early access'], ['other', 'Other offer'], ['none', 'No special offer']].map(([val, label]) => (
                            <label key={val} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                              <input type="radio" name="early-incentive" checked={growthData.early_incentive === val} onChange={() => handleChange('early_incentive', val)} className="w-4 h-4 text-emerald-600 focus:ring-emerald-500" />
                              {label}
                            </label>
                          ))}
                        </div>
                        {growthData.early_incentive && growthData.early_incentive !== 'none' && (
                          <div className="mt-3">
                            <p className="text-sm font-medium text-gray-900 mb-1">Describe your offer</p>
                            <Input value={growthData.early_offer_text} onChange={(e) => handleChange('early_offer_text', e.target.value)} placeholder="e.g., 3 months of free access" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  )}

                  <div className="border border-gray-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-900 flex items-center gap-2"><MessageCircleQuestion className="w-4 h-4 text-emerald-600" />Your own question (optional)</p>
                    <ExplainBlock flush text="Ask reviewers anything you want, in your own words. It appears after the other questions." />
                    <div className="mb-2" />
                    <MobileFieldWrapper label="Your Own Question" summary={growthData.custom_question} isMobile={isMobile} value={growthData.custom_question} onChange={(e) => handleChange('custom_question', e.target.value)} placeholder={isIdea ? 'e.g., How do you deal with this problem today?' : 'e.g., What almost stopped you from signing up?'}>
                      <Input value={growthData.custom_question} onChange={(e) => handleChange('custom_question', e.target.value)} placeholder={isIdea ? 'e.g., How do you deal with this problem today?' : 'e.g., What almost stopped you from signing up?'} />
                    </MobileFieldWrapper>
                  </div>
                </CardContent>
              </Card>

          {missingItems.length > 0 && (
            <div className="max-w-md mx-auto rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm">
              <p className="font-semibold text-amber-900 mb-2">To save, you still need to:</p>
              <ul className="space-y-1">
                {missingItems.map((m, i) => (
                  <li key={i}>
                    {m.profile ? (
                      <button type="button" onClick={goProfile} className="text-left text-amber-900 hover:underline">• {m.text} <span className="text-amber-600">(profile page)</span></button>
                    ) : (
                      <span className="text-amber-900">• {m.text}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="flex flex-col items-center gap-3 pt-2 pb-6">
            <Button onClick={handleSave} disabled={!canSave || isSaving} className="bg-emerald-600 hover:bg-emerald-700 w-full md:w-auto md:px-10" size="lg">
              {isSaving ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>) : (<>Save<CheckCircle className="w-4 h-4 ml-2" /></>)}
            </Button>
            <button type="button" onClick={goProfile} className="text-sm text-gray-500 underline inline-flex items-center gap-1"><ArrowLeft className="w-3.5 h-3.5" />Back to the profile</button>
          </div>
        </div>
      </div>
    </>
  );
}
