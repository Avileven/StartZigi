// app/growth-development/page.jsx
// [NEW] Growth Development Center — modeled directly on beta-development/page.jsx
// (same data-loading pattern, same autosave, same MentorModal/StaticGuidanceViewer
// wiring), adapted for the Growth stage per the External Venture Import project.
//
// DB DEPENDENCY (not yet migrated — see project definition doc section on DB changes):
//   ALTER TABLE ventures ADD COLUMN growth_data jsonb DEFAULT '{}';
//   ALTER TABLE ventures ADD COLUMN growth_development_completed boolean DEFAULT false;
//
// SCOPE NOTE: this page only covers the "founder defines their Growth page" step.
// It does NOT cover the public page itself (separate file, still to be built —
// see project definition doc section 7a on merging venture-landing's
// slider/feedback mechanism with beta-testing's fully-public access pattern),
// and does NOT cover the "skip the journey, enter Growth directly" entry point
// (explicitly deferred per this session's decision).
"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { Venture } from '@/api/entities.js';
import { VentureMessage } from '@/api/entities.js';
import { User } from '@/api/entities.js';
import { supabase } from '@/lib/supabase';
import { UploadFile } from '@/api/integrations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input.jsx';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Rocket, Upload, Trash2, Loader2, CheckCircle, ArrowRight, ArrowLeft, Info, Link as LinkIcon, MessageSquare, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createPageUrl } from '@/utils';
import MentorButton from "@/components/mentor/MentorButton";
import MentorModal from "@/components/mentor/MentorModal";
import StaticGuidanceViewer from "@/components/mentor/StaticGuidanceViewer";

const MIN_HEADLINE_LENGTH = 20;
const MIN_DESCRIPTION_LENGTH = 50;

// [FROM "צמיחה" doc] The A–E feedback-focus options the founder chooses from.
// Stored as an array of selected keys in growth_data.feedback_focus.topics —
// a founder can select more than one. "other" unlocks the custom text field.
const FEEDBACK_FOCUS_OPTIONS = [
  { key: 'would_use', label: 'Would people actually use this?' },
  { key: 'most_valuable_feature', label: 'Which feature is most valuable?' },
  { key: 'confusing', label: "What's confusing about the product?" },
  { key: 'would_pay', label: 'Would you pay for it?' },
  { key: 'other', label: 'Something else (specify below)' },
];

export default function GrowthDevelopment() {
  const [venture, setVenture] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();

  const [growthData, setGrowthData] = useState({
    headline: '',
    description: '',
    // [NEW vs beta_data] External product link — the core field for a
    // founder bringing an existing product, per the project definition doc
    // section 2. Optional for a founder who journeyed here normally (their
    // MLP demo files already exist), required in spirit for an imported one.
    product_url: '',
    // [NEW] Feedback focus — replaces the fixed MVP/MLP rating sliders with
    // founder-chosen topics, per the "צמיחה" doc's A–E options. Kept as an
    // object (not a flat array) so a free-text "other" note has somewhere
    // to live without overloading the topics array with mixed types.
    feedback_focus: {
      topics: [],
      other_note: '',
    },
    // [FIX vs mlp-development-center] Multiple files that ACCUMULATE across
    // uploads. The MLP builder's existing comment says "New uploads will
    // replace all previous files" — deliberately not repeating that bug
    // here; handleFileUpload below appends instead of overwriting.
    uploaded_files: [],
    // [REUSED as-is from beta_data] Same shape, same fields, same public
    // rendering pattern already proven in beta-testing/page.jsx.
    social_links: {
      linkedin: '',
      twitter: '',
      instagram: '',
      website: '',
    },
    // [NEW] Set true only via the (deferred, not built yet) skip-the-journey
    // entry point. A founder who reached Growth through the normal journey
    // always has this false. Drives the "Externally Built / Imported
    // Venture" label on the public page — never hidden, per the project
    // definition doc's explicit non-goal of disguising imported ventures.
    is_imported: false,
  });

  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const [mentorModal, setMentorModal] = useState({
    isOpen: false,
    sectionId: '',
    sectionTitle: '',
    fieldKey: '',
    fieldValue: ''
  });
  const [staticGuidanceModal, setStaticGuidanceModal] = useState({
    isOpen: false,
    sectionId: ''
  });

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
          // Defensive defaults — same pattern as beta-development's loadData,
          // so older/partial growth_data rows don't crash the form.
          loaded.product_url = loaded.product_url || '';
          loaded.uploaded_files = loaded.uploaded_files || [];
          loaded.is_imported = loaded.is_imported === true;
          loaded.feedback_focus = {
            topics: loaded.feedback_focus?.topics || [],
            other_note: loaded.feedback_focus?.other_note || '',
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

  // Autosave every 30 seconds — identical pattern to beta-development.
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

  const openMentorModal = (sectionId, sectionTitle, fieldKey) => {
    setMentorModal({
      isOpen: true,
      sectionId,
      sectionTitle,
      fieldKey,
      fieldValue: fieldKey ? growthData[fieldKey] || '' : ''
    });
  };
  const closeMentorModal = () => setMentorModal({ isOpen: false, sectionId: '', sectionTitle: '', fieldKey: '', fieldValue: '' });
  const handleMentorUpdate = (newValue) => {
    if (mentorModal.fieldKey) setGrowthData(prev => ({ ...prev, [mentorModal.fieldKey]: newValue }));
  };

  const handleChange = (field, value) => setGrowthData(prev => ({ ...prev, [field]: value }));
  const handleSocialLinkChange = (platform, value) =>
    setGrowthData(prev => ({ ...prev, social_links: { ...prev.social_links, [platform]: value } }));

  const toggleFeedbackTopic = (key) => {
    setGrowthData(prev => {
      const has = prev.feedback_focus.topics.includes(key);
      const topics = has
        ? prev.feedback_focus.topics.filter(t => t !== key)
        : [...prev.feedback_focus.topics, key];
      return { ...prev, feedback_focus: { ...prev.feedback_focus, topics } };
    });
  };
  const handleOtherNoteChange = (value) =>
    setGrowthData(prev => ({ ...prev, feedback_focus: { ...prev.feedback_focus, other_note: value } }));

  // [FIX vs mlp-development-center] Appends to uploaded_files instead of
  // replacing them — multiple calls (or multiple files in one call) all
  // accumulate. This was flagged as a known limitation to fix, not repeat,
  // in the project definition doc.
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
        if (isHTML) {
          try {
            const response = await fetch(result.file_url);
            const htmlContent = response.ok ? await response.text() : '<p>Error loading interactive content.</p>';
            return { type: 'html', name: file.name, url: result.file_url, htmlContent };
          } catch {
            return { type: 'html', name: file.name, url: result.file_url, htmlContent: '<p>Error loading interactive content.</p>' };
          }
        }
        return { type: isImage ? 'image' : 'other', name: file.name, url: result.file_url };
      }));
      setGrowthData(prev => ({ ...prev, uploaded_files: [...prev.uploaded_files, ...uploadedResults] }));
      showToast(`${uploadedResults.length} file(s) uploaded successfully!`);
    } catch (error) {
      console.error('Error uploading file:', error);
      showToast('Error uploading file. Please try again.', 'error');
    }
    setIsUploading(false);
    e.target.value = ''; // allow re-selecting the same file name later
  };

  const removeUploadedFile = (index) => {
    setGrowthData(prev => ({ ...prev, uploaded_files: prev.uploaded_files.filter((_, i) => i !== index) }));
  };

  const handleSave = async () => {
    if (!venture) return;
    setIsSaving(true);
    try {
      await Venture.update(venture.id, {
        growth_data: growthData,
        growth_development_completed: true,
      });

      // Send the "your Growth page is live" message only once — same
      // existing-message-check pattern as beta-development's handleSave.
      const existingMsg = await VentureMessage.filter({
        venture_id: venture.id,
        title: '📈 Growth Page Requirements'
      });
      if (existingMsg.length === 0) {
        await VentureMessage.create({
          venture_id: venture.id,
          message_type: 'system',
          title: '📈 Growth Page Requirements',
          content: `Your Growth page is now live. Use it to invite the community to try your product and give structured feedback.`,
          phase: 'growth',
          priority: 3
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

  const canSave = () => {
    const headlineComplete = growthData.headline.trim().length >= MIN_HEADLINE_LENGTH;
    const descriptionComplete = growthData.description.trim().length >= MIN_DESCRIPTION_LENGTH;
    const focusChosen = growthData.feedback_focus.topics.length > 0;
    return headlineComplete && descriptionComplete && focusChosen;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!venture) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">No Venture Found</h1>
        <p className="text-gray-600">Please create a venture first to access this page.</p>
      </div>
    );
  }

  const isHeadlineComplete = growthData.headline.trim().length >= MIN_HEADLINE_LENGTH;
  const isDescriptionComplete = growthData.description.trim().length >= MIN_DESCRIPTION_LENGTH;
  const isFocusChosen = growthData.feedback_focus.topics.length > 0;
  const areFilesUploaded = growthData.uploaded_files.length > 0;

  const completionPct = (() => {
    const checks = [isHeadlineComplete, isDescriptionComplete, isFocusChosen, areFilesUploaded];
    const filled = checks.filter(Boolean).length;
    return Math.round((filled / checks.length) * 100);
  })();

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
            <p className="text-gray-600 mt-2">Configure your public Growth page to invite the community to try your product and give feedback.</p>
          </div>

          {/* Intro — same "this is not your product" framing as Beta's intro,
              adapted: here it's explicit that a real external product is fine. */}
          <div className="p-6 bg-white rounded-2xl border border-emerald-100 shadow-sm">
            <p className="text-gray-700 leading-relaxed">
              <span className="font-bold text-emerald-700">You've reached Growth! 🚀</span>
              <br /><br />
              This page invites the community to try your product and give you structured feedback on exactly what you want to learn.
              If your product already exists outside StartZig, link to it directly — you don't need to rebuild anything here.
            </p>
          </div>

          <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-gray-700">Page Completion</span>
              <span className="text-sm font-bold text-emerald-700">{completionPct}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-600 h-3 rounded-full transition-all duration-500" style={{ width: `${completionPct}%` }} />
            </div>
          </div>

          <Tabs defaultValue="content" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="content" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">Page Content</TabsTrigger>
              <TabsTrigger value="focus" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">Feedback Focus</TabsTrigger>
              <TabsTrigger value="demo" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">Demo &amp; Links</TabsTrigger>
            </TabsList>

            {/* ===================== PAGE CONTENT ===================== */}
            <TabsContent value="content" className="space-y-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2">
                      {isHeadlineComplete && isDescriptionComplete && <CheckCircle className="w-5 h-5 text-green-500" />}
                      Headline &amp; Description
                    </CardTitle>
                    <MentorButton onClick={() => openMentorModal('growth_headline', 'Headline & Description', 'headline')} />
                  </div>
                  <CardDescription>What is this product, and why should someone spend time on it?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="headline">Headline * (minimum {MIN_HEADLINE_LENGTH} characters)</Label>
                    <Input
                      id="headline"
                      value={growthData.headline}
                      onChange={(e) => handleChange('headline', e.target.value)}
                      placeholder="e.g., The fastest way to plan a solo trip"
                    />
                    <p className="text-xs text-gray-500 mt-1">{growthData.headline.trim().length}/{MIN_HEADLINE_LENGTH} characters minimum</p>
                  </div>
                  <div>
                    <Label htmlFor="description">Description * (minimum {MIN_DESCRIPTION_LENGTH} characters)</Label>
                    <Textarea
                      id="description"
                      value={growthData.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                      placeholder="Describe what the product does and who it's for..."
                      className="h-28"
                    />
                    <p className="text-xs text-gray-500 mt-1">{growthData.description.trim().length}/{MIN_DESCRIPTION_LENGTH} characters minimum</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LinkIcon className="w-5 h-5 text-emerald-600" />
                    Product Link
                  </CardTitle>
                  <CardDescription>
                    If your product already exists outside StartZig, link to it here. Optional if you're relying only on the files in the Demo tab.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Label htmlFor="product_url">Product / Demo URL</Label>
                  <Input
                    id="product_url"
                    type="url"
                    value={growthData.product_url}
                    onChange={(e) => handleChange('product_url', e.target.value)}
                    placeholder="https://yourproduct.com"
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* ===================== FEEDBACK FOCUS ===================== */}
            <TabsContent value="focus" className="space-y-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2">
                      {isFocusChosen && <CheckCircle className="w-5 h-5 text-green-500" />}
                      <MessageSquare className="w-5 h-5 text-emerald-600" />
                      What do you want the community to help you understand?
                    </CardTitle>
                    <Button
                      type="button" variant="outline" size="sm"
                      onClick={() => setStaticGuidanceModal({ isOpen: true, sectionId: 'growth_feedback_focus' })}
                      className="flex items-center gap-1 text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                    >
                      <Info className="w-4 h-4" /> Tips
                    </Button>
                  </div>
                  <CardDescription>
                    Select at least one. This drives the exact question(s) shown to reviewers on your public page — replacing generic ratings with what actually matters to you right now.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {FEEDBACK_FOCUS_OPTIONS.map((opt) => (
                    <label key={opt.key} className="flex items-start gap-3 border border-gray-200 rounded-lg p-3 cursor-pointer hover:bg-gray-50">
                      <Checkbox
                        checked={growthData.feedback_focus.topics.includes(opt.key)}
                        onCheckedChange={() => toggleFeedbackTopic(opt.key)}
                      />
                      <span className="text-sm text-gray-800">{opt.label}</span>
                    </label>
                  ))}
                  {growthData.feedback_focus.topics.includes('other') && (
                    <div>
                      <Label htmlFor="other_note">What specifically? *</Label>
                      <Textarea
                        id="other_note"
                        value={growthData.feedback_focus.other_note}
                        onChange={(e) => handleOtherNoteChange(e.target.value)}
                        placeholder="Describe the specific thing you want feedback on..."
                        className="h-20 mt-1"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* ===================== DEMO & LINKS ===================== */}
            <TabsContent value="demo" className="space-y-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2">
                      {areFilesUploaded && <CheckCircle className="w-5 h-5 text-green-500" />}
                      Demo Files
                    </CardTitle>
                  </div>
                  <CardDescription>Upload screenshots, an HTML prototype, or other assets (optional if you provided a Product Link above). Multiple files accumulate — uploading more doesn't remove earlier ones.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <Label htmlFor="growth-file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-emerald-600 hover:text-emerald-500">
                      <span>Upload file(s)</span>
                      <Input id="growth-file-upload" name="growth-file-upload" type="file" multiple className="sr-only" onChange={handleFileUpload} accept="image/*,.html" disabled={isUploading} />
                    </Label>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, or HTML files</p>
                    {isUploading && <Loader2 className="w-5 h-5 animate-spin mx-auto mt-4" />}
                  </div>

                  {growthData.uploaded_files.length > 0 && (
                    <div className="space-y-2">
                      {growthData.uploaded_files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                              {file.type === 'image' ? '🖼️' : file.type === 'html' ? '📄' : <FileText className="w-4 h-4" />}
                            </div>
                            <p className="font-medium text-sm">{file.name}</p>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => removeUploadedFile(index)}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* [REUSED as-is from beta-development's social_links block] */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Social Links</CardTitle>
                  <CardDescription>Shown on your public Growth page, same as your Beta page.</CardDescription>
                </CardHeader>
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
            <Button variant="outline" onClick={() => router.push(createPageUrl("Dashboard"))}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
            </Button>
            <div className="flex items-center gap-3">
              {venture && (
                <Button
                  variant="outline"
                  // [TBD — project definition doc section 8.1] Route name not
                  // finalized (growth-page? launch-page?). Using a placeholder
                  // that matches the beta-testing preview pattern exactly.
                  onClick={() => window.open(`/growth-page?id=${venture.id}`, '_blank')}
                  className="border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                >
                  <ArrowRight className="w-4 h-4 mr-2" /> Preview Growth Page
                </Button>
              )}
              <Button onClick={handleSave} disabled={!canSave() || isSaving} className="bg-emerald-600 hover:bg-emerald-700" size="lg">
                {isSaving ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>) : (<>Save Growth Page<CheckCircle className="w-4 h-4 ml-2" /></>)}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <MentorModal
        isOpen={mentorModal.isOpen}
        onClose={closeMentorModal}
        sectionId={mentorModal.sectionId}
        sectionTitle={mentorModal.sectionTitle}
        fieldValue={mentorModal.fieldValue}
        onUpdateField={handleMentorUpdate}
      />
      <StaticGuidanceViewer
        isOpen={staticGuidanceModal.isOpen}
        onClose={() => setStaticGuidanceModal({ isOpen: false, sectionId: '' })}
        sectionId={staticGuidanceModal.sectionId}
      />
    </>
  );
}
