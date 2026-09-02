//createVenture - Updated with Ideas Bank integration
"use client";

import React, { useState, useEffect, Suspense } from "react";
import { supabase, auth } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter, useSearchParams } from "next/navigation";
import { Lightbulb, Rocket, ArrowRight, AlertCircle, Sparkles, Tag, FileText, Target, Building2 } from "lucide-react";

const SECTORS = [
  { value: "not_sure", label: "Not sure yet" },
  { value: "ai_deep_tech", label: "AI / Deep Tech" },
  { value: "fintech", label: "FinTech" },
  { value: "digital_health_biotech", label: "Digital Health / Biotech" },
  { value: "b2b_saas", label: "B2B SaaS" },
  { value: "consumer_apps", label: "Consumer Apps / Marketplaces" },
  { value: "climatetech_energy", label: "ClimateTech / Energy / AgriTech" },
  { value: "web3_blockchain", label: "Web3 / Blockchain" },
  { value: "other", label: "Other" }
];

function CreateVentureForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // ✅ קריאת פרמטרים מה-URL ואתחול ventureData
  const [ventureData, setVentureData] = useState({
    name: searchParams.get('name') || "",
    description: searchParams.get('description') || "",
    problem: searchParams.get('problem') || "",
    solution: searchParams.get('solution') || "",
    sector: searchParams.get('sector') || ""
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [errorMessage, setErrorMessage] = useState("");
  // [ADDED 020826] Mobile — every field opens fullscreen when editing.
  // Desktop's 3-step/multi-field-per-step flow (below) is untouched; this
  // is a separate render path using the same ventureData state and
  // handleChange, flattened to one field at a time.
  const [isMobile, setIsMobile] = useState(false);
  const [expandedField, setExpandedField] = useState(null);
  // [NEW] Entry choice gate — null shows the two big cards; 'idea' reveals
  // the existing form below; 'product' navigates straight to
  // growth-development (handled in the click handler, not by setting this).
  // Defaults straight to 'idea' when arriving from Ideas Bank (name param
  // already set) — that's already an explicit choice, no need to ask again.
  const [entryChoice, setEntryChoice] = useState(searchParams.get('name') ? 'idea' : null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const handleChange = (field, value) => {
    setVentureData(prev => ({ ...prev, [field]: value }));
    if (field === "name" && errorMessage.includes("name")) {
      setErrorMessage("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    
    // [FIX 020826] This step-advancement only applies to desktop's 3-step
    // flow. Mobile calls handleSubmit directly from "Launch Venture" (all
    // fields already validated via MOBILE_FIELDS/mobileAllComplete), so it
    // must skip straight to the actual creation logic below, not advance a
    // step it never uses.
    if (!isMobile && step < 3) {
      setStep(step + 1);
      return;
    }

    setIsLoading(true);
    try {
      const user = await auth.me();

      if (!user || !user.email || !user.id) {
          throw new Error("User not authenticated or user data missing.");
      }

      // בדיקה אם השם כבר קיים
      const { data: existingVentures, error: checkError } = await supabase
        .from('ventures')
        .select('id')
        .eq('name', ventureData.name.trim())
        .limit(1);

      if (checkError) throw checkError;

      if (existingVentures && existingVentures.length > 0) {
        setErrorMessage(`The venture name "${ventureData.name}" is already taken. Please choose a different name.`);
        setIsLoading(false);
        setStep(1);
        return;
      }
      
      const generateScore = () => Math.floor(Math.random() * 30) + 70;
      const teamScore = generateScore();
      const opportunityScore = generateScore();
      const statusScore = 80;
      const totalScore = (teamScore + opportunityScore + statusScore) / 3;

      const venturePayload = {
        name: ventureData.name,
        description: ventureData.description,
        problem: ventureData.problem,
        solution: ventureData.solution,
        sector: ventureData.sector,

        team_score: teamScore,
        opportunity_score: opportunityScore,
        status_score: statusScore,
        total_score: totalScore,

        phase: "business_plan",
        virtual_capital: 0,
        monthly_burn_rate: 0,

        founder_user_ids: [String(user.id)],
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

        created_by: user.email,
        created_by_id: String(user.id),
      };

      const { data: newVentures, error: ventureCreateError } = await supabase
        .from('ventures')
        .insert([venturePayload])
        .select()
        .single();

      if (ventureCreateError) {
        if (ventureCreateError.code === '23505') {
          setErrorMessage(`The venture name "${ventureData.name}" is already taken. Please choose a different name.`);
          setStep(1);
          setIsLoading(false);
          return;
        }
        throw ventureCreateError;
      }

      const newVenture = newVentures;

      const landingPageUrl = `${window.location.origin}/venture-landing?id=${newVenture.id}`;

      const { error: ventureUpdateError } = await supabase
        .from('ventures')
        .update({ landing_page_url: landingPageUrl })
        .eq('id', newVenture.id);

      if (ventureUpdateError) throw ventureUpdateError;

      const { error: message1Error } = await supabase
        .from('venture_messages')
        .insert([{
          venture_id: newVenture.id,
          message_type: 'phase_complete',
          title: '🎉 Idea Phase Complete!',
          content: `Congratulations! You've launched "${newVenture.name}" and completed the Idea phase.`,
          phase: 'idea',
          priority: 3,
          created_by: user.email,
          created_by_id: user.id
        }]);

      if (message1Error) throw message1Error;

      const { error: message2Error } = await supabase
        .from('venture_messages')
        .insert([{
          venture_id: newVenture.id,
          message_type: 'phase_welcome',
          title: '📋 Welcome to Plan & Foundation!',
          content: `It's time to build a solid foundation. Complete your plan to unlock the next phase.`,
          phase: 'business_plan',
          priority: 2,
          created_by: user.email,
          created_by_id: user.id
        }]);

      if (message2Error) throw message2Error;

      // [ADDED 300426] Send welcome email after venture is created
      try {
        await fetch("/api/send-welcome-early-adopter", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: user.email,
            founderName: user.username || user.full_name || user.name || "",
            ventureName: newVenture.name,
          }),
        });
      } catch (emailErr) {
        // Non-blocking — venture creation already succeeded
        console.error("Welcome email failed (non-critical):", emailErr);
      }

      router.replace(`/dashboard`);

    } catch (error) {
      console.error("Error creating venture:", error);
      setErrorMessage("There was an error creating your venture. Please try again.");
    }
    setIsLoading(false);
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return ventureData.name.trim().length >= 3 && ventureData.description.trim().length >= 20;
      case 2:
        return ventureData.problem.trim().length >= 50 && ventureData.solution.trim().length >= 50;
      case 3:
        return ventureData.sector;
      default:
        return false;
    }
  };

  const getValidationMessage = () => {
    switch (step) {
      case 1:
        const nameLength = ventureData.name.trim().length;
        const descLength = ventureData.description.trim().length;
        if (nameLength < 3) return "Venture name needs at least 3 characters";
        if (descLength < 20) return `Description needs at least 20 characters (${descLength}/20)`;
        return "";
      case 2:
        const problemLength = ventureData.problem.trim().length;
        const solutionLength = ventureData.solution.trim().length;
        if (problemLength < 50) return `Problem statement needs at least 50 characters (${problemLength}/50)`;
        if (solutionLength < 50) return `Solution description needs at least 50 characters (${solutionLength}/50)`;
        return "";
      default:
        return "";
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lightbulb className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">What's Your Big Idea?</h2>
              <p className="text-gray-600">Start by giving your venture a name and describing what it does.</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Venture Name * (minimum 3 characters)</Label>
                <Input
                  id="name"
                  value={ventureData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="e.g., QuitFlow, EcoWaste AI, UrbanConnect"
                  className="text-lg"
                />
                <p className="text-xs text-gray-500 mt-1">{ventureData.name.trim().length}/3 characters minimum</p>
              </div>
              
              <div>
                <Label htmlFor="description">Brief Description * (minimum 20 characters)</Label>
                <Textarea
                  id="description"
                  value={ventureData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Describe your venture in one sentence..."
                  className="h-24"
                />
                <p className="text-xs text-gray-500 mt-1">{ventureData.description.trim().length}/20 characters minimum</p>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Rocket className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">The Problem & Solution</h2>
              <p className="text-gray-600">Define the problem you're solving and your proposed solution.</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="problem">What Problem Are You Solving? * (minimum 50 characters)</Label>
                <Textarea
                  id="problem"
                  value={ventureData.problem}
                  onChange={(e) => handleChange("problem", e.target.value)}
                  placeholder="Describe the pain point or challenge your venture addresses..."
                  className="h-32"
                />
                <p className="text-xs text-gray-500 mt-1">{ventureData.problem.trim().length}/50 characters minimum</p>
              </div>
              
              <div>
                <Label htmlFor="solution">Your Proposed Solution * (minimum 50 characters)</Label>
                <Textarea
                  id="solution"
                  value={ventureData.solution}
                  onChange={(e) => handleChange("solution", e.target.value)}
                  placeholder="How does your venture solve this problem?"
                  className="h-32"
                />
                <p className="text-xs text-gray-500 mt-1">{ventureData.solution.trim().length}/50 characters minimum</p>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <ArrowRight className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Industry</h2>
              <p className="text-gray-600">Select the industry that best describes your venture.</p>
            </div>

            <div>
              {/* [FIX 020826] Unified wording to "Industry" everywhere on this
                  step (was "Industry Sector" here vs. "Choose Your Industry"
                  in the heading above — same thing, two different words). */}
              <Label htmlFor="sector">Industry *</Label>
              <Select
                value={ventureData.sector}
                onValueChange={(value) => handleChange("sector", value)}
              >
                <SelectTrigger className="bg-white border border-gray-300">
                  <SelectValue placeholder="Select your industry" />
                </SelectTrigger>

                <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                  {SECTORS.map((sector) => (
                    <SelectItem
                      key={sector.value}
                      value={sector.value}
                      className="cursor-pointer hover:bg-indigo-50 hover:text-indigo-900 focus:bg-indigo-50 focus:text-indigo-900"
                    >
                      {sector.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* [FIX 020826] Only shown once an industry is actually selected —
                previously always visible regardless of form progress.
                Content rewritten: was about $15,000 virtual capital (also
                had a copy/behavior mismatch — the actual insert always sets
                virtual_capital: 0, unrelated bug not fixed here), now
                describes the journey ahead instead. */}
            {ventureData.sector && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Ready to Launch!</h3>
                <p className="text-blue-700 text-sm">
                  Once you create your venture, you'll land on your Dashboard. It's your home base for the entire journey. From there you'll shape your business plan, build your MVP, collect feedback from other founders, and track your progress every step of the way.
                </p>
              </div>
            )}
          </div>
        );
    }
  };

  // [ADDED 020826] Mobile — same 5 fields as the desktop steps, flattened
  // into one list. minLength drives both the checkmark and validation,
  // matching canProceed()'s existing thresholds exactly (3/20/50/50, sector
  // just needs any value).
  const MOBILE_FIELDS = [
    { key: 'name', label: 'Venture Name', type: 'input', minLength: 3, placeholder: 'e.g., QuitFlow, EcoWaste AI, UrbanConnect', icon: Tag },
    { key: 'description', label: 'Brief Description', type: 'textarea', minLength: 20, placeholder: 'Describe your venture in one sentence...', icon: FileText },
    { key: 'problem', label: 'The Problem', type: 'textarea', minLength: 50, placeholder: 'Describe the pain point or challenge your venture addresses...', icon: Target },
    { key: 'solution', label: 'Your Solution', type: 'textarea', minLength: 50, placeholder: 'How does your venture solve this problem?', icon: Lightbulb },
    { key: 'sector', label: 'Industry', type: 'select', minLength: 1, placeholder: 'Select your industry', icon: Building2 },
  ];

  const isMobileFieldDone = (field) => (ventureData[field.key] || '').trim().length >= field.minLength;
  const mobileAllComplete = MOBILE_FIELDS.every(isMobileFieldDone);

  if (isMobile) {
    if (expandedField) {
      const field = MOBILE_FIELDS.find(f => f.key === expandedField);
      return (
        <div className="fixed inset-0 bg-white z-50 flex flex-col p-4">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => setExpandedField(null)} className="p-2 -ml-2">
              <ArrowRight className="w-5 h-5 rotate-180" />
            </button>
            <p className="font-semibold text-gray-900">{field.label}</p>
          </div>

          {field.type === 'input' && (
            <Input
              autoFocus
              value={ventureData[field.key]}
              onChange={(e) => handleChange(field.key, e.target.value)}
              placeholder={field.placeholder}
              className="text-lg"
            />
          )}
          {field.type === 'textarea' && (
            <Textarea
              autoFocus
              value={ventureData[field.key]}
              onChange={(e) => handleChange(field.key, e.target.value)}
              placeholder={field.placeholder}
              className="flex-1 text-base resize-none border-0 focus-visible:ring-0 p-0"
            />
          )}
          {field.type === 'select' && (
            <Select value={ventureData.sector} onValueChange={(value) => handleChange('sector', value)}>
              <SelectTrigger className="bg-white border border-gray-300 text-lg h-14">
                <SelectValue placeholder={field.placeholder} />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                {SECTORS.map((sector) => (
                  <SelectItem key={sector.value} value={sector.value}>{sector.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {field.type !== 'select' && (
            <p className="text-xs text-gray-400 mt-3 mb-3">{(ventureData[field.key] || '').trim().length}/{field.minLength} characters minimum</p>
          )}

          <Button
            onClick={() => setExpandedField(null)}
            className="w-full bg-indigo-600 hover:bg-indigo-700 mt-auto"
            size="lg"
          >
            Save and continue
          </Button>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50 p-4">
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{errorMessage}</p>
          </div>
        )}

        {/* [NEW] Entry choice gate — replaces the old small "Skip to
            Growth" side card entirely. Everything else (form, Ideas Bank)
            is hidden until a choice is made. */}
        {entryChoice === null ? (
          <div className="space-y-3 mt-6">
            <h1 className="text-xl font-bold text-gray-900 mb-4 text-center">How would you like to start?</h1>
            <button
              onClick={() => setEntryChoice('idea')}
              className="w-full text-left border-2 border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-5 flex items-center gap-4"
            >
              <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Lightbulb className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">I have an idea</p>
                <p className="text-xs text-gray-500">Start your full journey and become involved in StartZig's community</p>
              </div>
            </button>
            <button
              onClick={() => router.push('/growth-development')}
              className="w-full text-left border-2 border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-5 flex items-center gap-4"
            >
              <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Rocket className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">I have a product</p>
                <p className="text-xs text-gray-500">Invite the community to visit your product</p>
              </div>
            </button>
          </div>
        ) : (
        <>
        {/* [NEW] Back to the choice screen. */}
        <button onClick={() => setEntryChoice(null)} className="flex items-center gap-1 text-sm text-gray-500 mb-3">
          <ArrowRight className="w-4 h-4 rotate-180" /> Back
        </button>

        {/* [FIX 020826] Ideas Bank moved to the top on mobile — was below
            the form, easy to miss since it required scrolling past the
            whole form first. */}
        {!searchParams.get('name') && (
          <Card className="border-2 border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 mb-4">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900">Don't have an idea yet?</h3>
              </div>
              <Button onClick={() => router.push('/ideas')} className="w-full bg-indigo-600 hover:bg-indigo-700" size="sm">
                <Lightbulb className="w-4 h-4 mr-2" />
                Browse Ideas Bank
              </Button>
            </CardContent>
          </Card>
        )}

        <h1 className="text-xl font-bold text-gray-900 mb-4">Create your venture</h1>

        <div className="space-y-2 mb-6">
          {MOBILE_FIELDS.map((field) => {
            const value = ventureData[field.key];
            const displayValue = field.key === 'sector' ? (SECTORS.find(s => s.value === value)?.label || '') : value;
            const FieldIcon = field.icon;
            return (
              <button
                key={field.key}
                onClick={() => setExpandedField(field.key)}
                className="w-full text-left border border-gray-200 rounded-lg p-3 bg-white flex items-center justify-between"
              >
                <div className="min-w-0">
                  <p className="text-xs text-gray-400 mb-0.5">{field.label}</p>
                  <p className={`text-sm truncate ${displayValue ? 'text-gray-900' : 'text-gray-400'}`}>
                    {displayValue || 'Tap to edit'}
                  </p>
                </div>
                {/* [FIX 020826] Was the same green Rocket icon on every
                    field (only shown once filled in); now each field shows
                    its own content-matching icon, always, in blue. */}
                <FieldIcon className="w-4 h-4 text-blue-500 flex-shrink-0 ml-2" />
              </button>
            );
          })}
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!mobileAllComplete || isLoading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
          size="lg"
        >
          {isLoading ? "Creating..." : "Launch Venture"}
        </Button>
        </>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-8 pt-20">
      <div className="max-w-5xl mx-auto">
        {/* [NEW] Entry choice gate — replaces the old small "Skip to
            Growth" side card entirely. Everything else (form, Ideas Bank)
            is hidden until a choice is made. */}
        {entryChoice === null ? (
          <div className="max-w-2xl mx-auto mt-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-8 text-center">How would you like to start?</h1>
            <div className="grid md:grid-cols-2 gap-6">
              <button
                onClick={() => setEntryChoice('idea')}
                className="text-left border-2 border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-8 hover:shadow-lg transition-shadow"
              >
                <div className="w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center mb-4">
                  <Lightbulb className="w-7 h-7 text-white" />
                </div>
                <p className="text-lg font-semibold text-gray-900 mb-1">I have an idea</p>
                <p className="text-sm text-gray-600">Start your full journey and become involved in StartZig's community</p>
              </button>
              <button
                onClick={() => router.push('/growth-development')}
                className="text-left border-2 border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-8 hover:shadow-lg transition-shadow"
              >
                <div className="w-14 h-14 bg-emerald-600 rounded-full flex items-center justify-center mb-4">
                  <Rocket className="w-7 h-7 text-white" />
                </div>
                <p className="text-lg font-semibold text-gray-900 mb-1">I have a product</p>
                <p className="text-sm text-gray-600">Invite the community to visit your product</p>
              </button>
            </div>
          </div>
        ) : (
        <>
        {/* [NEW] Back to the choice screen. */}
        <button onClick={() => setEntryChoice(null)} className="flex items-center gap-1 text-sm text-gray-500 mb-4">
          <ArrowRight className="w-4 h-4 rotate-180" /> Back
        </button>
        <div className="flex flex-col md:flex-row gap-6 items-start">

          {/* עמודה ראשית - Create Your Venture */}
          <div className="flex-1 min-w-0">
            {errorMessage && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800">{errorMessage}</p>
                </div>
              </div>
            )}

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-center text-2xl">Create Your Venture</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit}>
                  {renderStep()}

                  {getValidationMessage() && (
                    <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
                      <p className="text-sm text-amber-800">{getValidationMessage()}</p>
                    </div>
                  )}

                  {/* [FIX 020826] Moved here from the top of the page — the
                      step indicator was out of view by the time founders
                      scrolled down to fill fields and click Continue, so
                      progressing between steps felt invisible. Now it sits
                      right next to the action that triggers it. */}
                  <div className="mt-8">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      {[1, 2, 3].map((num) => (
                        <div
                          key={num}
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                            num <= step
                              ? 'bg-indigo-600 text-white'
                              : 'bg-gray-200 text-gray-500'
                          }`}
                        >
                          {num}
                        </div>
                      ))}
                    </div>
                    <p className="text-center text-sm text-gray-500 mb-4">
                      Step {step} of 3: {step === 1 ? 'Basic Info' : step === 2 ? 'Problem & Solution' : 'Industry'}
                    </p>
                  </div>

                  <div className="flex justify-between">
                    {step > 1 && (
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setStep(step - 1)}
                      >
                        Back
                      </Button>
                    )}
                    
                    <Button 
                      type="submit" 
                      disabled={!canProceed() || isLoading}
                      className={`${step === 1 ? 'ml-auto' : ''} bg-indigo-600 hover:bg-indigo-700`}
                    >
                      {isLoading ? "Creating..." : step === 3 ? "Launch Venture" : "Continue"}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* עמודה צדדית - Ideas Bank (רק בשלב 1) */}
          {step === 1 && !searchParams.get('name') && (
            <div className="w-full md:w-56 flex-shrink-0">
              <Card className="border-2 border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-base font-semibold text-gray-900">
                      Don't have an idea yet?
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Browse our curated startup concepts and get started quickly!
                  </p>
                  <Button 
                    onClick={() => router.push('/ideas')}
                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                  >
                    <Lightbulb className="w-4 h-4 mr-2" />
                    Browse Ideas Bank
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

        </div>
        </>
        )}
      </div>
    </div>
  );
}

// ✅ עטיפה ב-Suspense - דרישת Next.js עבור useSearchParams
export default function CreateVenture() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Lightbulb className="w-12 h-12 text-indigo-600 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <CreateVentureForm />
    </Suspense>
  );
}
