"use client";

import React, { useState } from "react";
import { supabase, auth } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { Lightbulb, Rocket, ArrowRight, AlertCircle } from "lucide-react";

const SECTORS = [
  { value: "ai_deep_tech", label: "AI / Deep Tech" },
  { value: "fintech", label: "FinTech" },
  { value: "digital_health_biotech", label: "Digital Health / Biotech" },
  { value: "b2b_saas", label: "B2B SaaS" },
  { value: "consumer_apps", label: "Consumer Apps / Marketplaces" },
  { value: "climatetech_energy", label: "ClimateTech / Energy / AgriTech" },
  { value: "web3_blockchain", label: "Web3 / Blockchain" }
];

export default function CreateVenture() {
  const [ventureData, setVentureData] = useState({
    name: "",
    description: "",
    problem: "",
    solution: "",
    sector: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [errorMessage, setErrorMessage] = useState(""); // ✅ הוספתי state לשגיאה
  const router = useRouter();

  const handleChange = (field, value) => {
    setVentureData(prev => ({ ...prev, [field]: value }));
    // ✅ נקה שגיאה כשהמשתמש משנה את השם
    if (field === "name" && errorMessage.includes("name")) {
      setErrorMessage("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(""); // ✅ נקה שגיאות קודמות
    
    if (step < 3) {
      setStep(step + 1);
      return;
    }

    setIsLoading(true);
    try {
      const user = await auth.me();

      if (!user || !user.email || !user.id) {
          throw new Error("User not authenticated or user data missing.");
      }

      // ✅ בדיקה אם השם כבר קיים לפני היצירה
      const { data: existingVentures, error: checkError } = await supabase
        .from('ventures')
        .select('id')
        .eq('name', ventureData.name.trim())
        .limit(1);

      if (checkError) throw checkError;

      if (existingVentures && existingVentures.length > 0) {
        setErrorMessage(`The venture name "${ventureData.name}" is already taken. Please choose a different name.`);
        setIsLoading(false);
        setStep(1); // ✅ חזור לשלב הראשון כדי שהמשתמש יוכל לשנות את השם
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
        virtual_capital: 15000,
        monthly_burn_rate: 0,
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
        created_by_id: user.id
      };

      const { data: newVentures, error: ventureCreateError } = await supabase
        .from('ventures')
        .insert([venturePayload])
        .select()
        .single();

      // ✅ טיפול בשגיאת unique constraint מ-Supabase
      if (ventureCreateError) {
        if (ventureCreateError.code === '23505') { // PostgreSQL unique violation code
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
          title: '📋 Welcome to Business Planning!',
          content: `It's time to build a solid foundation. Complete your business plan to unlock the next phase.`,
          phase: 'business_plan',
          priority: 2,
          created_by: user.email,
          created_by_id: user.id
        }]);

      if (message2Error) throw message2Error;

      router.push(`/venture-landing?id=${newVenture.id}&welcome=true`);

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
              <p className="text-gray-600">Select the sector that best describes your venture.</p>
            </div>

            <div>
              <Label htmlFor="sector">Industry Sector *</Label>
              <Select value={ventureData.sector} onValueChange={(value) => handleChange("sector", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your industry sector" />
                </SelectTrigger>
                <SelectContent>
                  {SECTORS.map((sector) => (
                    <SelectItem key={sector.value} value={sector.value}>
                      {sector.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Ready to Launch!</h3>
              <p className="text-blue-700 text-sm">
                Once you create your venture, you'll receive $15,000 in virtual capital to get started. 
                The only way to increase your capital is by securing funding from angels or VCs as you progress through different phases.
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
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
          <p className="text-center text-sm text-gray-500">
            Step {step} of 3: {step === 1 ? 'Basic Info' : step === 2 ? 'Problem & Solution' : 'Industry'}
          </p>
        </div>

        {/* ✅ הצגת הודעת שגיאה */}
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

              <div className="flex justify-between mt-8">
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
    </div>
  );
}