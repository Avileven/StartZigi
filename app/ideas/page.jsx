"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Rocket, Lightbulb, AlertTriangle } from "lucide-react";

export default function PublicIdeasBank() {
  const [ideas, setIdeas] = useState([]);
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [ventureName, setVentureName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDeploying, setIsDeploying] = useState(false);

  const MOCK_USER = {
    id: "99999999-9999-4999-a999-999999999999",
    email: "tester_temp@example.com"
  };

  useEffect(() => {
    async function fetchIdeas() {
      setIsLoading(true);
      setError(null);
      try {
        const { data, error: supabaseError } = await supabase
          .from("ideas")
          .select("*");
        
        if (supabaseError) throw supabaseError;
        
        if (!data || data.length === 0) {
          setError("No ideas found in the database table 'ideas'.");
        } else {
          setIdeas(data);
        }
      } catch (err) {
        setError(err.message || "Failed to fetch ideas");
      } finally {
        setIsLoading(false);
      }
    }
    fetchIdeas();
  }, []);

  const handleAdopt = async () => {
    if (!selectedIdea || ventureName.trim().length < 3) return;
    setIsDeploying(true);

    try {
      const { data: newVenture, error: vError } = await supabase
        .from("ventures")
        .insert([{
          name: ventureName.trim(),
          description: selectedIdea.description,
          problem: selectedIdea.problem,
          solution: selectedIdea.solution,
          sector: selectedIdea.sector,
          phase: "business_plan",
          created_by: MOCK_USER.email,
          created_by_id: MOCK_USER.id,
          founder_user_ids: [MOCK_USER.id],
          is_sample: true,
          team_score: 85,
          opportunity_score: 82,
          status_score: 80,
          total_score: 82.3
        }])
        .select().single();

      if (vError) throw vError;

      await supabase.from("venture_messages").insert([
        {
          venture_id: newVenture.id,
          message_type: 'phase_complete',
          title: '🎉 Idea Phase Complete!',
          content: `Venture "${newVenture.name}" created via Public Idea Bank.`,
          phase: 'idea',
          created_by_id: MOCK_USER.id
        },
        {
          venture_id: newVenture.id,
          message_type: 'phase_welcome',
          title: '📋 Welcome to Planning!',
          content: `Time to build your business plan for ${newVenture.name}.`,
          phase: 'business_plan',
          created_by_id: MOCK_USER.id
        }
      ]);

      alert(`Success! Venture "${ventureName}" created for Mock User.`);
      setVentureName("");
      setSelectedIdea(null);

    } catch (err) {
      alert("Error creating venture: " + err.message);
    } finally {
      setIsDeploying(false);
    }
  };

  if (isLoading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-indigo-600" /></div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8 border-b pb-4">
        <h1 className="text-3xl font-bold flex items-center gap-3"><Lightbulb className="text-yellow-500" /> Ideas Bank</h1>
        <p className="text-gray-500 mt-2">Browse the bank and launch a pre-vetted business idea instantly.</p>
      </div>

      {error ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 flex items-center gap-4 text-red-800">
            <AlertTriangle className="h-6 w-6" />
            <p className="font-medium">{error}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* רשימת רעיונות (צד שמאל) */}
          <div className="md:col-span-2 space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {ideas.map(idea => (
                <Card 
                  key={idea.id} 
                  className={`cursor-pointer border-2 transition-all hover:shadow-md ${selectedIdea?.id === idea.id ? 'border-indigo-600 bg-indigo-50/50' : 'border-gray-100'}`}
                  onClick={() => setSelectedIdea(idea)}
                >
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">{idea.sector}</Badge>
                    </div>
                    <p className="font-semibold text-lg text-gray-900 leading-tight">{idea.problem}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* לוח בקרה ופרטים (צד ימין) */}
          <div className="md:col-span-1">
            {selectedIdea ? (
              <Card className="sticky top-6 shadow-xl border-indigo-200 overflow-hidden">
                <div className="bg-indigo-600 p-4 text-white">
                  <h3 className="font-bold">Review Idea</h3>
                </div>
                <CardContent className="p-6 space-y-6">
                  <div>
                    <label className="text-xs font-bold uppercase text-gray-400 tracking-wider">Solution Proposal</label>
                    <p className="text-sm text-gray-700 mt-2 leading-relaxed">{selectedIdea.solution}</p>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <label className="text-xs font-bold uppercase text-gray-400 tracking-wider">New Venture Name</label>
                    <Input 
                      className="mt-2"
                      value={ventureName} 
                      onChange={(e) => setVentureName(e.target.value)} 
                      placeholder="e.g. EcoGrowth AI" 
                    />
                  </div>

                  <Button 
                    className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 text-lg font-semibold" 
                    disabled={isDeploying || ventureName.trim().length < 3}
                    onClick={handleAdopt}
                  >
                    {isDeploying ? <Loader2 className="animate-spin" /> : <Rocket className="mr-2 h-5 w-5" />}
                    Launch Venture
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="text-center p-12 border-2 border-dashed rounded-2xl text-gray-400 flex flex-col items-center gap-3">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center">
                   <Lightbulb className="h-6 w-6" />
                </div>
                <p>Select an idea from the list to view the full solution and launch</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}