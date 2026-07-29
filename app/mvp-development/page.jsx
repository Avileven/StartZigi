
// mvp-development 240126
"use client";

import React, { useState, useEffect, useRef } from 'react';

import { Venture } from '@/api/entities.js';
import { VentureMessage } from '@/api/entities.js';
import { User } from '@/api/entities.js';
import { businessPlan as businessPlanEntity } from '@/api/entities.js';
import { UploadFile, InvokeLLM } from '@/api/integrations';
import { buildFeatureAnalysisPrompt, buildFeatureSuggestionPrompt } from '@/components/mentor/zigConfig';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';

import { useRouter } from 'next/navigation';
import { createPageUrl } from '@/utils';

import {
  Loader2,
  Upload,
  FileText,
  CheckCircle,
  Rocket,
  Wrench,
  Plus,
  Trash2,
  Info,
  ExternalLink
} from 'lucide-react';

import StaticGuidanceViewer from '@/components/mentor/StaticGuidanceViewer';

export default function MVPDevelopment() {
  const [venture, setVenture] = useState(null);

  const [mvpData, setMvpData] = useState({
    feature_matrix: [],
    uploaded_files: []
  });

  const [isLoading, setIsLoading] = useState(true);
  const [showMvpExplainer, setShowMvpExplainer] = useState(false);

  // First-visit tooltip sequence explaining how to use the Feature
  // Matrix itself (name → Add → rate → select → review selection) —
  // triggered when the matrix actually scrolls into view, not on page
  // load, so it isn't missed while still reading the top of the page.
  const [hintStep, setHintStep] = useState(0); // 0 = not started, 1-4 = which hint is showing, 5 = done
  const matrixRef = useRef(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [staticGuidanceModal, setStaticGuidanceModal] = useState({
    isOpen: false,
    sectionId: ''
  });

  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [featureMatrix, setFeatureMatrix] = useState([]);

  // Business plan context, fetched once on load — used both for the
  // read-only summary card at the top and for the Feature Matrix
  // analysis/suggestions prompts.
  const [businessPlanContext, setBusinessPlanContext] = useState(null);

  // Feature Matrix Zig integration
  const [featureAnalysis, setFeatureAnalysis] = useState(null); // parsed: [{ name, text }]
  const [isAnalyzingFeatures, setIsAnalyzingFeatures] = useState(false);
  const [suggestedFeatures, setSuggestedFeatures] = useState([]); // [{ name, reason }]
  const [isSuggestingFeatures, setIsSuggestingFeatures] = useState(false);

  // [2026-01-06] FIX: force light theme tokens ONLY while this page is mounted
  // This fixes "Tips" modal showing dark background + gray text in dashboard theme.
  useEffect(() => {
    document.body.classList.add('startzig-force-light');
    return () => document.body.classList.remove('startzig-force-light');
  }, []);

  // Starts the 4-step hint sequence only once the Feature Matrix card
  // actually scrolls into view — not on page load, so it isn't missed.
  useEffect(() => {
    if (!matrixRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hintStep === 0) {
          setHintStep(1);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(matrixRef.current);
    return () => observer.disconnect();
  }, [hintStep]);

  useEffect(() => {
    if (hintStep === 0 || hintStep >= 5) return;
    const t = setTimeout(() => setHintStep(prev => prev + 1), 4500);
    return () => clearTimeout(t);
  }, [hintStep]);

  useEffect(() => {
    const loadVenture = async () => {
      try {
        const user = await User.me();
        const ventures = await Venture.filter({ created_by: user.email }, "-created_date");
        if (ventures.length > 0) {
          const currentVenture = ventures[0];
          setVenture(currentVenture);

          if (currentVenture.mvp_data) {
            setUploadedFiles(currentVenture.mvp_data.uploaded_files || []);
            setFeatureMatrix(currentVenture.mvp_data.feature_matrix || []);
          }

          // Business plan context — used both for the read-only summary
          // card and for the Feature Matrix analysis/suggestion prompts.
          try {
            const plans = await businessPlanEntity.filter({ venture_id: currentVenture.id });
            if (plans.length > 0) {
              setBusinessPlanContext({
                problem: plans[0].problem || '',
                solution: plans[0].solution || '',
                competition: plans[0].competition || '',
                product_details: plans[0].product_details || '',
              });
            }
          } catch (bpError) {
            console.error('Error loading business plan context:', bpError);
          }
        }
      } catch (error) {
        console.error("Error loading venture:", error);
      }
      setIsLoading(false);
    };

    loadVenture();
  }, []);

  const handleAddFeature = () => {
    const newFeature = {
      id: `feature_${Date.now()}`,
      featureName: '',
      userCriticality: 5,
      implementationEase: 5,
      priorityScore: 25,
      isSelected: false
    };

    setFeatureMatrix(prev => [...prev, newFeature]);
    setMvpData(prev => ({
      ...prev,
      feature_matrix: [...prev.feature_matrix, newFeature]
    }));
  };

  const handleRemoveFeature = (featureId) => {
    setFeatureMatrix(prev => prev.filter(f => f.id !== featureId));
    setMvpData(prev => ({
      ...prev,
      feature_matrix: prev.feature_matrix.filter(f => f.id !== featureId)
    }));
  };

  const handleFeatureChange = (featureId, field, value) => {
    setFeatureMatrix(prev =>
      prev.map(f => {
        if (f.id === featureId) {
          const updated = { ...f, [field]: value };
          if (field === 'userCriticality' || field === 'implementationEase') {
            const criticality = field === 'userCriticality' ? value : updated.userCriticality;
            const ease = field === 'implementationEase' ? value : updated.implementationEase;
            updated.priorityScore = criticality * ease;
          }
          return updated;
        }
        return f;
      })
    );

    setMvpData(prev => ({
      ...prev,
      feature_matrix: prev.feature_matrix.map(f => {
        if (f.id === featureId) {
          const updated = { ...f, [field]: value };
          if (field === 'userCriticality' || field === 'implementationEase') {
            const criticality = field === 'userCriticality' ? value : updated.userCriticality;
            const ease = field === 'implementationEase' ? value : updated.implementationEase;
            updated.priorityScore = criticality * ease;
          }
          return updated;
        }
        return f;
      })
    }));
  };

  // [ZIG] Analyzes the founder's SELECTED features against their own
  // Criticality/Ease ratings and the business plan context.
  const handleAnalyzeFeatures = async () => {
    const selected = featureMatrix.filter(f => f.isSelected && f.featureName?.trim());
    if (selected.length === 0) return;

    setIsAnalyzingFeatures(true);
    setFeatureAnalysis(null);
    try {
      const prompt = buildFeatureAnalysisPrompt({
        ventureDesc: venture?.description,
        businessPlanContext,
        features: selected,
      });
      const data = await InvokeLLM({ prompt, creditType: 'mentor' });
      const text = data?.response || '';

      // Parse "### Feature Name" / "### Next steps" blocks — all use the
      // same marker, so parsing is uniform (no fragile leftover-text
      // guessing).
      const parsed = [];
      let closingLine = '';
      const blocks = text.split(/^###\s*/m).filter(Boolean);
      for (const block of blocks) {
        const lines = block.split('\n');
        const name = lines[0].trim();
        const body = lines.slice(1).join('\n').trim();
        if (name.toLowerCase() === 'next steps') {
          closingLine = body;
        } else if (selected.some(f => f.featureName.trim().toLowerCase() === name.toLowerCase())) {
          parsed.push({ name, text: body });
        }
      }

      setFeatureAnalysis({ items: parsed, closingLine, raw: text });
    } catch (error) {
      setFeatureAnalysis({ items: [], raw: 'Error generating analysis. Please try again.' });
    }
    setIsAnalyzingFeatures(false);
  };

  // [ZIG] Suggests additional features on top of what's already listed —
  // never automatic, only runs when the founder clicks the button.
  const handleSuggestFeatures = async () => {
    setIsSuggestingFeatures(true);
    setSuggestedFeatures([]);
    try {
      const existingNames = featureMatrix.map(f => f.featureName).filter(Boolean);
      const prompt = buildFeatureSuggestionPrompt({
        ventureDesc: venture?.description,
        businessPlanContext,
        existingFeatureNames: existingNames,
      });
      const data = await InvokeLLM({ prompt, creditType: 'mentor' });
      const text = data?.response || '';
      const suggestions = text
        .split('\n')
        .map(l => l.trim())
        .filter(Boolean)
        .map(line => {
          const parts = line.split('|').map(p => p.trim());
          if (parts.length < 4) return null;
          const [name, criticalityStr, easeStr, reason] = parts;
          const criticality = parseInt(criticalityStr, 10);
          const ease = parseInt(easeStr, 10);
          if (!name || isNaN(criticality) || isNaN(ease)) return null;
          return { name, criticality, ease, reason };
        })
        .filter(Boolean);
      setSuggestedFeatures(suggestions);
    } catch (error) {
      setSuggestedFeatures([]);
    }
    setIsSuggestingFeatures(false);
  };

  // Adds a suggested feature straight into the matrix, pre-filled with
  // the AI's own Criticality/Ease estimate — the founder can still
  // adjust the sliders themselves afterward.
  const handleAddSuggestedFeature = (suggestion) => {
    const newFeature = {
      id: `feature_${Date.now()}`,
      featureName: suggestion.name,
      userCriticality: suggestion.criticality,
      implementationEase: suggestion.ease,
      priorityScore: suggestion.criticality * suggestion.ease,
      isSelected: true,
    };
    setFeatureMatrix(prev => [...prev, newFeature]);
    setMvpData(prev => ({ ...prev, feature_matrix: [...prev.feature_matrix, newFeature] }));
    setSuggestedFeatures(prev => prev.filter(s => s.name !== suggestion.name));
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      const uploadPromises = files.map(async (file) => {
        const result = await UploadFile({ file });
        return {
          name: file.name,
          url: result.file_url,
          uploaded_at: new Date().toISOString()
        };
      });

      const uploadedFilesResult = await Promise.all(uploadPromises);

      setUploadedFiles(uploadedFilesResult);
      setMvpData(prev => ({
        ...prev,
        uploaded_files: uploadedFilesResult
      }));

      alert(`${files.length} file(s) uploaded successfully! Previous files have been replaced.`);
    } catch (error) {
      console.error("Error uploading files:", error);
      alert("There was an error uploading your files. Please try again.");
    }
    setIsUploading(false);
  };

  const handleSaveDraft = async () => {
    if (!venture) return;
    setIsSaving(true);
    try {
      await Venture.update(venture.id, { mvp_data: mvpData });
      alert('Draft saved successfully!');
    } catch (error) {
      console.error("Error saving draft:", error);
      alert("Failed to save draft.");
    }
    setIsSaving(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const mvpPayload = {
        uploaded_files: uploadedFiles,
        feature_matrix: featureMatrix
      };

      await Venture.update(venture.id, {
        mvp_uploaded: true,
        mvp_data: mvpPayload,
        phase: 'mvp'
      });

      await VentureMessage.create({
        venture_id: venture.id,
        message_type: 'phase_complete',
        title: '🎉 MVP Uploaded Successfully!',
        content: `Great work! Your MVP for "${venture.name}" has been documented and uploaded. Use the Promotion Center to share it and collect user feedback — it will drive better product decisions and strengthen your investor case.You can now proceed to revenue modeling.`,
        phase: 'mvp',
        priority: 3
      });

      alert("MVP submitted successfully! You can now proceed to Revenue Modeling.");
      router.push(createPageUrl('Dashboard'));
    } catch (error) {
      console.error("Error submitting MVP:", error);
      alert("There was an error submitting your MVP. Please try again.");
    }

    setIsSubmitting(false);
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Submission now requires at least one selected feature — the three
  // text fields no longer exist to gate on.
  const canSubmit = featureMatrix.some(f => f.isSelected && f.featureName?.trim());

  return (
    <>
      {/* [2026-01-06] FIX: global CSS overrides for "Tips" modal + Slider track visibility */}
      <style jsx global>{`
        /* Force LIGHT tokens while on MVP page */
        body.startzig-force-light {
          --background: 0 0% 100%;
          --foreground: 222.2 84% 4.9%;
          --card: 0 0% 100%;
          --card-foreground: 222.2 84% 4.9%;
          --popover: 0 0% 100%;
          --popover-foreground: 222.2 84% 4.9%;
          --muted: 210 40% 96.1%;
          --muted-foreground: 215.4 16.3% 46.9%;
          --border: 214.3 31.8% 91.4%;
          --input: 214.3 31.8% 91.4%;
          --ring: 221.2 83.2% 53.3%;
        }

        /* Make Radix Dialog content readable even if some component uses dark styles */
        body.startzig-force-light [data-radix-dialog-content] {
          background: white !important;
          color: rgb(17 24 39) !important; /* gray-900 */
          border: 1px solid rgb(229 231 235) !important; /* gray-200 */
        }
      `}</style>

      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Rocket className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">MVP Development Center</h1>
            <p className="text-gray-600">Build and document your Minimum Viable Product</p>
          </div>

          <div className="mb-6">
            <button
              onClick={() => setShowMvpExplainer(prev => !prev)}
              className="flex items-center justify-center gap-2 w-full text-base font-medium text-indigo-700 hover:text-indigo-900"
            >
              <Info className="w-5 h-5" />
              What is an MVP, and how does Zig fit in here?
              <span className="text-sm">{showMvpExplainer ? '▲' : '▼'}</span>
            </button>
            {showMvpExplainer && (
              <div className="mt-3 p-4 bg-indigo-50 rounded-xl text-sm text-gray-700 space-y-2">
                <p>
                  An MVP is the earliest stage where you connect a raw idea to an actual product —
                  it's not final, and it's not supposed to be. The goal here is just to sharpen it as
                  you go, not to lock it down.
                </p>
                <p>
                  Zig helps in two ways on this page: it reviews the features you've selected against
                  your problem and solution, and it can suggest features you haven't thought of yet.
                </p>
                <p>
                  Once saved, this MVP data feeds into your landing page — where real users are
                  invited to give feedback on it and suggest additional features themselves.
                </p>
              </div>
            )}
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Your Product Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-gray-500 -mt-2">
                Pulled from your Plan — edit it there if anything here is out of date.
              </p>
              <div>
                <p className="text-xs font-semibold text-indigo-900 uppercase tracking-wide mb-1">Problem</p>
                <p className="text-sm text-gray-700">{businessPlanContext?.problem || 'Not filled in yet — head to your business plan first.'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-indigo-900 uppercase tracking-wide mb-1">Solution</p>
                <p className="text-sm text-gray-700">{businessPlanContext?.solution || 'Not filled in yet — head to your business plan first.'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-indigo-900 uppercase tracking-wide mb-1">Product Details</p>
                <p className="text-sm text-gray-700">{businessPlanContext?.product_details || 'Not filled in yet — head to your business plan first.'}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6" ref={matrixRef}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                1️⃣ Feature Evaluation Matrix
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">
                      List potential features and prioritize them to define the scope of your MVP.
                    </p>
                    <p className="text-sm text-blue-600 font-medium">
                      Priority Score Formula: User Criticality × Implementation Ease. A higher score indicates a higher priority feature.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setStaticGuidanceModal({ isOpen: true, sectionId: 'feature_evaluation_matrix' })}
                      // [2026-01-06] FIX
                      className="flex items-center gap-1 bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50 hover:text-indigo-800"
                    >
                      <Info className="w-4 h-4" />
                      Tips
                    </Button>
                 </div>
                </div>

                {featureMatrix.map((feature, idx) => (
                  <Card key={feature.id} className="bg-gray-50">
                    <CardContent className="p-4">
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="relative mt-1">
                            {idx === 0 && hintStep === 3 && (
                              <div className="absolute -top-16 left-0 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 w-48 z-10 shadow-lg text-center">
                                Check this box to mark a feature as part of your MVP.
                                <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                              </div>
                            )}
                            <Checkbox
                              checked={feature.isSelected}
                              onCheckedChange={(checked) => handleFeatureChange(feature.id, 'isSelected', checked)}
                            />
                          </div>

                          <div className="flex-1">
                            <div className="relative">
                              {idx === 0 && hintStep === 1 && (
                                <div className="absolute -top-16 left-0 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 w-56 z-10 shadow-lg text-center">
                                  Write the name of a feature you're considering here.
                                  <div className="absolute top-full left-8 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                                </div>
                              )}
                              <Input
                                value={feature.featureName}
                                onChange={(e) => handleFeatureChange(feature.id, 'featureName', e.target.value)}
                                placeholder="Feature name..."
                                className="font-semibold mb-3"
                              />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                              <div>
                                <Label className="text-xs mb-2 block">User Criticality (1-10)</Label>

                                <Slider
                                  value={[feature.userCriticality || 5]}
                                  onValueChange={(value) => handleFeatureChange(feature.id, 'userCriticality', value[0])}
                                  max={10}
                                  min={1}
                                  step={1}
                                  // [2026-01-06] FIX: make the slider TRACK + THUMB visible (not transparent)
                                  className="mb-2
                                    [&>span]:h-2 [&>span]:bg-gray-200 [&>span]:rounded-full
                                    [&>span>span]:bg-indigo-600 [&>span>span]:rounded-full
                                    [&_[role=slider]]:h-5 [&_[role=slider]]:w-5
                                    [&_[role=slider]]:bg-white [&_[role=slider]]:border-2 [&_[role=slider]]:border-indigo-600
                                    [&_[role=slider]]:shadow-md"
                                />

                                <div className="text-center text-sm font-semibold text-indigo-600">
                                  {feature.userCriticality || 5}
                                </div>
                              </div>

                              <div>
                                <Label className="text-xs mb-2 block">Implementation Ease (1-10)</Label>

                                <Slider
                                  value={[feature.implementationEase || 5]}
                                  onValueChange={(value) => handleFeatureChange(feature.id, 'implementationEase', value[0])}
                                  max={10}
                                  min={1}
                                  step={1}
                                  // [2026-01-06] FIX: same styling for the second slider
                                  className="mb-2
                                    [&>span]:h-2 [&>span]:bg-gray-200 [&>span]:rounded-full
                                    [&>span>span]:bg-indigo-600 [&>span>span]:rounded-full
                                    [&_[role=slider]]:h-5 [&_[role=slider]]:w-5
                                    [&_[role=slider]]:bg-white [&_[role=slider]]:border-2 [&_[role=slider]]:border-indigo-600
                                    [&_[role=slider]]:shadow-md"
                                />

                                <div className="text-center text-sm font-semibold text-indigo-600">
                                  {feature.implementationEase || 5}
                                </div>
                              </div>

                              <div>
                                <Label className="text-xs mb-2 block">Priority Score</Label>
                                <div className="h-10 bg-gradient-to-r from-green-100 to-green-200 rounded-lg flex items-center justify-center">
                                  <span className="text-2xl font-bold text-green-800">
                                    {feature.priorityScore || 25}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveFeature(feature.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <div className="relative">
                  {hintStep === 2 && (
                    <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 w-56 z-10 shadow-lg text-center">
                      Click here to add another feature to the list.
                      <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                    </div>
                  )}
                  <Button
                    onClick={handleAddFeature}
                    variant="outline"
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Feature
                  </Button>
                </div>

                {/* [ZIG] Suggest additional features — never automatic, opt-in only.
                    Moved up here, right after Add Feature, so founders see
                    suggestions before deciding what to select. */}
                <div className="flex items-center justify-center gap-3">
                  <Button
                    onClick={handleSuggestFeatures}
                    disabled={isSuggestingFeatures}
                    className="w-16 h-16 rounded-full bg-white border border-indigo-200 hover:bg-indigo-50 transition-all shadow-sm flex items-center justify-center p-0 shrink-0"
                  >
                    {isSuggestingFeatures ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <img src="/zig-it-logo.png" alt="Zig it" style={{ height: '36px', width: 'auto' }} />
                    )}
                  </Button>
                  <p className="text-sm text-gray-600">
                    Get AI-suggested features you haven't thought of yet.
                  </p>
                </div>

                {suggestedFeatures.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="text-left text-xs text-gray-500 border-b">
                          <th className="py-2 pr-2">Feature</th>
                          <th className="py-2 px-2 text-center">Criticality</th>
                          <th className="py-2 px-2 text-center">Ease</th>
                          <th className="py-2 px-2 text-center">Priority</th>
                          <th className="py-2 pl-2"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {suggestedFeatures.map((s, idx) => (
                          <tr key={idx} className="border-b border-gray-100 align-top">
                            <td className="py-2 pr-2">
                              <p className="font-semibold text-indigo-900">{s.name}</p>
                              <p className="text-xs text-gray-600">{s.reason}</p>
                            </td>
                            <td className="py-2 px-2 text-center font-medium text-indigo-600">{s.criticality}</td>
                            <td className="py-2 px-2 text-center font-medium text-indigo-600">{s.ease}</td>
                            <td className="py-2 px-2 text-center font-semibold text-green-700">{s.criticality * s.ease}</td>
                            <td className="py-2 pl-2">
                              <Button size="sm" onClick={() => handleAddSuggestedFeature(s)} className="bg-indigo-600 hover:bg-indigo-700 whitespace-nowrap">
                                Add
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {featureMatrix.length > 0 && (
                  <div className="relative">
                    {hintStep === 4 && (
                      <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 w-56 z-10 shadow-lg text-center">
                        This shows the features you've marked as part of your MVP.
                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                      </div>
                    )}
                    <div className="mt-4 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                    <h4 className="font-semibold text-sm text-indigo-900 mb-1">Selected MVP Features</h4>
                    <p className="text-xs text-indigo-700 mb-3">This is the core feature set for your initial product launch.</p>
                    <div className="space-y-2">
                      {featureMatrix.filter(f => f.isSelected).map(feature => {
                        const score = feature.priorityScore;
                        const badgeColor = score >= 49 ? 'bg-green-100 text-green-800' : score >= 25 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800';
                        return (
                          <div key={feature.id} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 shadow-sm">
                            <span className="text-sm font-medium text-gray-800">{feature.featureName || 'Unnamed Feature'}</span>
                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${badgeColor}`}>
                              {score}
                            </span>
                          </div>
                        );
                      })}
                      {featureMatrix.filter(f => f.isSelected).length === 0 && (
                        <p className="text-sm text-indigo-600">No features selected yet.</p>
                      )}
                    </div>
                    </div>
                  </div>
                )}

                {/* [ZIG] Analyze the selected features against venture context */}
                {featureMatrix.filter(f => f.isSelected && f.featureName?.trim()).length > 0 && (
                  <div className="flex items-center justify-center gap-3">
                    <Button
                      onClick={handleAnalyzeFeatures}
                      disabled={isAnalyzingFeatures}
                      className="w-16 h-16 rounded-full bg-white border border-indigo-200 hover:bg-indigo-50 transition-all shadow-sm flex items-center justify-center p-0 shrink-0"
                    >
                      {isAnalyzingFeatures ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        <img src="/zig-it-logo.png" alt="Zig it" style={{ height: '36px', width: 'auto' }} />
                      )}
                    </Button>
                    <p className="text-sm text-gray-600">
                      Get feedback on the features you've selected.
                    </p>
                  </div>
                )}

                {featureAnalysis && (
                  <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-4">
                    {featureAnalysis.items.length > 0 ? (
                      featureAnalysis.items.map((item, idx) => (
                        <div key={idx}>
                          <p className="font-semibold text-sm text-indigo-900 mb-1">{item.name}</p>
                          <p className="text-sm text-gray-700 leading-relaxed">{item.text}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-700 whitespace-pre-line">{featureAnalysis.raw}</p>
                    )}
                    {featureAnalysis.closingLine && (
                      <p className="text-sm text-gray-500 pt-2 border-t border-gray-100">{featureAnalysis.closingLine}</p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                2️⃣ Upload MVP Files
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="file-upload">Upload mockups, prototypes, or demo files</Label>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setStaticGuidanceModal({ isOpen: true, sectionId: 'mvp_files_demos' })}
                    // [2026-01-06] FIX
                    className="flex items-center gap-1 bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50 hover:text-indigo-800"
                  >
                    <Info className="w-4 h-4" />
                    Tips
                  </Button>
                </div>

                <div className="mb-4">
                  <a
                    href="https://startzig.vercel.app/zigforge"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      type="button"
                      className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                      size="lg"
                    >
                      <Wrench className="w-5 h-5 mr-2" />
                      Launch zigforge
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                  </a>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Our dedicated studio for designing mockups — free to get started, upgradeable with AI usage.
                  </p>
                </div>

                <Input
                  id="file-upload"
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="mt-2"
                />

                {isUploading && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading files...
                  </div>
                )}

                {uploadedFiles.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-gray-700">Uploaded Files:</p>
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                        <FileText className="w-4 h-4 text-gray-500" />
                        {file.url ? (
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline"
                          >
                            {file.name}
                          </a>
                        ) : (
                          <span className="text-sm text-gray-700">{file.name}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button
              onClick={handleSaveDraft}
              disabled={isSaving}
              variant="outline"
              className="flex-1"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Save Draft
            </Button>

            <Button
              onClick={handleSubmit}
              disabled={!canSubmit || isSubmitting}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Submit MVP Documentation
            </Button>
          </div>

          {!canSubmit && (
            <p className="text-sm text-amber-600 text-center mt-4">
              Select at least one feature in the matrix above to enable submission.
            </p>
          )}
        </div>
      </div>

      <StaticGuidanceViewer
        isOpen={staticGuidanceModal.isOpen}
        onClose={() => setStaticGuidanceModal({ isOpen: false, sectionId: '' })}
        sectionId={staticGuidanceModal.sectionId}
      />
    </>
  );
}

