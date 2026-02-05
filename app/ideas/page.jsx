"use client";

import React, { useState, useEffect } from "react"; // הוספתי useEffect למשיכת נתונים
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase"; // ייבוא הסופבייס שלך
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Rocket, ArrowRight, Search, Loader2 } from "lucide-react";

export default function IdeasBank() {
  const router = useRouter();
  const [ideas, setIdeas] = useState([]); // כאן יישמרו הרעיונות מהטבלה
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [ventureName, setVentureName] = useState("");

  // בלוק משיכת הנתונים: מושך את כל הרעיונות מהטבלה שלך ב-Supabase
  useEffect(() => {
    async function fetchIdeas() {
      try {
        const { data, error } = await supabase
          .from("ideas") // שם הטבלה שלך
          .select("*");
        
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

  // לוגיקה: מעביר את הנתונים לדף היצירה דרך ה-URL
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
    idea.sector?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-indigo-900">Idea Bank</h1>
        <p className="text-xl text-slate-600">Select a concept from our database and start building</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
        <Input
          className="pl-10"
          placeholder="Search ideas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          {filteredIdeas.map((idea) => (
            <Card 
              key={idea.id}
              className={`cursor-pointer transition-all ${selectedIdea?.id === idea.id ? 'ring-2 ring-indigo-500 bg-indigo-50' : 'hover:bg-slate-50'}`}
              onClick={() => {
                setSelectedIdea(idea);
                setVentureName(idea.name);
              }}
            >
              <CardHeader className="p-4">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{idea.name}</CardTitle>
                  <Badge variant="secondary">{idea.sector}</Badge>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>

        {selectedIdea && (
          <Card className="border-2 border-indigo-200 shadow-xl sticky top-6">
            <CardHeader className="bg-indigo-50 border-b border-indigo-100">
              <CardTitle className="text-indigo-900">Adopt this Idea</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label>Your Venture Name</Label>
                <Input 
                  value={ventureName}
                  onChange={(e) => setVentureName(e.target.value)}
                />
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-sm text-slate-500 uppercase">The Problem</h4>
                  <p className="text-slate-700">{selectedIdea.problem}</p>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-500 uppercase">The Solution</h4>
                  <p className="text-slate-700">{selectedIdea.solution}</p>
                </div>
              </div>

              <Button 
                className="w-full bg-indigo-600 py-6 text-lg"
                onClick={handleAdopt}
                disabled={ventureName.trim().length < 3}
              >
                Start with this Idea
                <ArrowRight className="ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}