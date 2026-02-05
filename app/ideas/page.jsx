"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, ArrowRight, Search, Loader2, ArrowLeft, Sparkles, TrendingUp } from "lucide-react";

export default function IdeasBank() {
  const router = useRouter();
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [ventureName, setVentureName] = useState("");

  useEffect(() => {
    async function fetchIdeas() {
      try {
        const { data, error } = await supabase
          .from("ideas")
          .select("*")
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setIdeas(data || []);
      } catch (err) {
        console.error("Error fetching ideas:", err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchIdeas();
  }, []);

  const handleAdopt = () => {
    if (!selectedIdea || ventureName.trim().length < 3) return;

    const params = new URLSearchParams({
      name: ventureName.trim(),
      description: selectedIdea.description || "",
      problem: selectedIdea.problem || "",
      solution: selectedIdea.solution || "",
      sector: selectedIdea.sector || ""
    });

    router.push(`/ventures/new?${params.toString()}`);
  };

  const filteredIdeas = ideas.filter(idea => 
    idea.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    idea.sector?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    idea.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading ideas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/ventures/new')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Create Venture
          </Button>
        </div>

        {/* Hero Section */}
        <div className="text-center space-y-4 py-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-900 via-purple-800 to-indigo-900 bg-clip-text text-transparent">
            Ideas Bank
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Explore curated startup concepts and kickstart your entrepreneurial journey
          </p>
          <div className="flex items-center justify-center gap-6 text-sm text-slate-500 pt-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span>{ideas.length} Ideas Available</span>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              className="pl-12 py-6 text-lg border-2 border-slate-200 focus:border-indigo-400 rounded-xl shadow-sm"
              placeholder="Search by name, sector, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Empty State */}
        {filteredIdeas.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No ideas found</h3>
            <p className="text-slate-600">Try adjusting your search terms</p>
          </div>
        )}

        {/* Ideas Grid */}
        {filteredIdeas.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Ideas List */}
            <div className="space-y-4">
              {filteredIdeas.map((idea) => (
                <Card 
                  key={idea.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                    selectedIdea?.id === idea.id 
                      ? 'ring-2 ring-indigo-500 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-md' 
                      : 'hover:bg-slate-50 hover:border-indigo-200'
                  }`}
                  onClick={() => {
                    setSelectedIdea(idea);
                    setVentureName(idea.name);
                  }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2 flex items-center gap-2">
                          {idea.name}
                          {selectedIdea?.id === idea.id && (
                            <Sparkles className="w-4 h-4 text-indigo-600" />
                          )}
                        </CardTitle>
                        <CardDescription className="text-sm line-clamp-2">
                          {idea.description || "No description available"}
                        </CardDescription>
                      </div>
                      <Badge 
                        variant="secondary" 
                        className="bg-indigo-100 text-indigo-800 border-indigo-200"
                      >
                        {idea.sector}
                      </Badge>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>

            {/* Right Column - Selected Idea Details */}
            <div className="lg:sticky lg:top-6 h-fit">
              {selectedIdea ? (
                <Card className="border-2 border-indigo-300 shadow-2xl bg-gradient-to-br from-white to-indigo-50">
                  <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-b">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        <Lightbulb className="w-6 h-6" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl">Adopt This Idea</CardTitle>
                        <p className="text-indigo-100 text-sm mt-1">Customize and make it yours</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    {/* Venture Name Input */}
                    <div className="space-y-2">
                      <Label className="text-base font-semibold">Your Venture Name *</Label>
                      <Input 
                        value={ventureName}
                        onChange={(e) => setVentureName(e.target.value)}
                        placeholder="Give your venture a unique name"
                        className="text-lg py-6 border-2 focus:border-indigo-400"
                      />
                      <p className="text-xs text-slate-500">
                        {ventureName.trim().length}/3 characters minimum
                      </p>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-slate-200 pt-6 space-y-5">
                      {/* Original Idea Name */}
                      <div className="bg-indigo-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-sm text-indigo-900 uppercase mb-1">
                          Original Idea
                        </h4>
                        <p className="text-indigo-800 font-medium">{selectedIdea.name}</p>
                      </div>

                      {/* Description */}
                      {selectedIdea.description && (
                        <div>
                          <h4 className="font-semibold text-sm text-slate-600 uppercase mb-2">
                            Description
                          </h4>
                          <p className="text-slate-700 leading-relaxed">{selectedIdea.description}</p>
                        </div>
                      )}

                      {/* Problem */}
                      <div>
                        <h4 className="font-semibold text-sm text-slate-600 uppercase mb-2 flex items-center gap-2">
                          <span className="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xs">!</span>
                          The Problem
                        </h4>
                        <p className="text-slate-700 leading-relaxed">{selectedIdea.problem}</p>
                      </div>

                      {/* Solution */}
                      <div>
                        <h4 className="font-semibold text-sm text-slate-600 uppercase mb-2 flex items-center gap-2">
                          <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs">✓</span>
                          The Solution
                        </h4>
                        <p className="text-slate-700 leading-relaxed">{selectedIdea.solution}</p>
                      </div>
                    </div>

                    {/* Action Button */}
                    <Button 
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-7 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                      onClick={handleAdopt}
                      disabled={ventureName.trim().length < 3}
                    >
                      Start Building with This Idea
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>

                    {ventureName.trim().length < 3 && (
                      <p className="text-sm text-amber-600 text-center">
                        Please enter at least 3 characters for your venture name
                      </p>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-2 border-dashed border-slate-300 bg-slate-50">
                  <CardContent className="p-12 text-center">
                    <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Lightbulb className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      Select an Idea
                    </h3>
                    <p className="text-slate-600">
                      Click on any idea from the list to see more details and adopt it
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
