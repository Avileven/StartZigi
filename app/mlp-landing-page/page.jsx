"use client";
import React, { useState, useEffect } from "react";
import { Venture } from "@/api/entities";
import { ProductFeedback } from "@/src/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Heart, Sparkles, Target, FileText, Send, MessageSquare } from "lucide-react";

export default function MLPLandingPage() {
  const [venture, setVenture] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [feedbackText, setFeedbackText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [htmlContents, setHtmlContents] = useState({});

  useEffect(() => {
    const loadVenture = async () => {
      setIsLoading(true);
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const ventureId = urlParams.get('id');

        if (ventureId) {
          const ventures = await Venture.filter({ id: ventureId });
          if (ventures.length > 0) {
            const loadedVenture = ventures[0];
            setVenture(loadedVenture);
            
            // Load HTML content for all HTML files - check both mlp_development_data and mlp_data
            const mlpFiles = loadedVenture.mlp_development_data?.uploaded_files || loadedVenture.mlp_data?.uploaded_files;
            if (mlpFiles) {
              const htmlPromises = mlpFiles.map(async (file) => {
                const isHTML = /\.html?$/i.test(file.name);
                if (isHTML && file.url) {
                  try {
                    const response = await fetch(file.url);
                    const text = await response.text();
                    return { url: file.url, content: text };
                  } catch (err) {
                    console.error('Failed to load HTML:', err);
                    return null;
                  }
                }
                return null;
              });
              
              const results = await Promise.all(htmlPromises);
              const contentMap = {};
              results.forEach(result => {
                if (result) {
                  contentMap[result.url] = result.content;
                }
              });
              setHtmlContents(contentMap);
            }
          }
        }
      } catch (error) {
        console.error("Error loading venture:", error);
      }
      setIsLoading(false);
    };
    loadVenture();
  }, []);

  const handleLike = async () => {
    if (!venture) return;
    try {
      const newLikesCount = (venture.likes_count || 0) + 1;
      await Venture.update(venture.id, { likes_count: newLikesCount });
      setVenture(prev => ({ ...prev, likes_count: newLikesCount }));
    } catch (error) {
      console.error("Error liking venture:", error);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!feedbackText.trim() || !venture) return;

    setIsSubmitting(true);
    try {
      await ProductFeedback.create({
        venture_id: venture.id,
        feedback_text: feedbackText,
        feedback_type: 'other'
      });

      alert("Thank you! Your feedback has been sent.");
      setFeedbackText("");
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert("There was an error submitting your feedback. Please try again.");
    }
    setIsSubmitting(false);
  };

  const getSectorLabel = (sector) => {
    const labels = {
      ai_deep_tech: "AI / Deep Tech",
      fintech: "FinTech",
      digital_health_biotech: "Digital Health / Biotech",
      b2b_saas: "B2B SaaS",
      consumer_apps: "Consumer Apps / Marketplaces",
      climatetech_energy: "ClimateTech / Energy / AgriTech",
      web3_blockchain: "Web3 / Blockchain"
    };
    return labels[sector] || sector;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!venture) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Venture Not Found</h1>
          <p className="text-gray-600">The venture you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  // Check both mlp_development_data (new) and mlp_data (old)
  const mlpDataSource = venture.mlp_development_data || venture.mlp_data;
  const isMLPCompleted = venture.mlp_development_completed || venture.mlp_completed;

  if (!isMLPCompleted || !mlpDataSource) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">MLP Not Available Yet</h2>
            <p className="text-gray-600">This venture hasn't completed their Minimum Lovable Product development yet.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const mlpData = mlpDataSource;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <header className="bg-white shadow-sm py-4 px-6 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{venture.name}</h1>
              <Badge className="mt-1">{getSectorLabel(venture.sector)}</Badge>
            </div>
          </div>

          <Button variant="outline" onClick={handleLike} className="flex items-center gap-2">
            <Heart className="w-4 h-4" />
            {venture.likes_count || 0}
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto py-12 px-6">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-extrabold text-gray-900 mb-4">Our Lovable Product</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {venture.description}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-red-500" />
                The Problem
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">{venture.problem}</p>
            </CardContent>
          </Card>

          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-500" />
                Our Solution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">{venture.solution}</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8 mb-12">
          {mlpData.feedback_analysis && (
            <Card className="shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardHeader>
                <CardTitle>What We Learned from Users</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{mlpData.feedback_analysis}</p>
              </CardContent>
            </Card>
          )}

          {mlpData.enhancement_strategy && (
            <Card className="shadow-xl bg-gradient-to-br from-green-50 to-emerald-50">
              <CardHeader>
                <CardTitle>How We're Making It Better</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{mlpData.enhancement_strategy}</p>
              </CardContent>
            </Card>
          )}

          {mlpData.wow_moments && (
            <Card className="shadow-xl bg-gradient-to-br from-yellow-50 to-amber-50">
              <CardHeader>
                <CardTitle>Delightful Moments You'll Love</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{mlpData.wow_moments}</p>
              </CardContent>
            </Card>
          )}

          {mlpData.user_journey && (
            <Card className="shadow-xl bg-gradient-to-br from-purple-50 to-pink-50">
              <CardHeader>
                <CardTitle>Your Journey with Us</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{mlpData.user_journey}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {mlpData.uploaded_files && mlpData.uploaded_files.length > 0 && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Product Showcase</h2>
            <div className="space-y-6">
              {mlpData.uploaded_files.map((file, index) => {
                const fileName = file.name || '';
                const fileUrl = file.url || '';
                const fileExt = fileName.split('.').pop().toLowerCase();
                
                const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(fileExt);
                const isPDF = fileExt === 'pdf';
                const isHTML = ['html', 'htm'].includes(fileExt);
                
                if (isImage) {
                  return (
                    <div key={index} className="border-2 rounded-xl overflow-hidden shadow-lg bg-white">
                      <div className="bg-gray-100 px-4 py-2 border-b">
                        <h4 className="text-sm font-medium text-gray-900">{fileName}</h4>
                      </div>
                      <div className="p-4">
                        <img src={fileUrl} alt={fileName} className="w-full h-auto" />
                      </div>
                    </div>
                  );
                }

                if (isPDF) {
                  return (
                    <div key={index} className="border-2 rounded-xl overflow-hidden shadow-lg bg-white">
                      <div className="bg-gray-100 px-4 py-2 border-b">
                        <h4 className="text-sm font-medium text-gray-900">{fileName}</h4>
                      </div>
                      <iframe
                        src={fileUrl}
                        className="w-full h-[800px] border-0"
                        title={fileName}
                      />
                    </div>
                  );
                }

                if (isHTML) {
                  const htmlContent = htmlContents[fileUrl];
                  if (htmlContent) {
                    return (
                      <div key={index} className="border-2 rounded-xl overflow-hidden shadow-lg bg-white">
                        <div className="bg-gray-100 px-4 py-2 border-b">
                          <h4 className="text-sm font-medium text-gray-900">{fileName}</h4>
                        </div>
                        <iframe
                          srcDoc={htmlContent}
                          className="w-full h-[800px] border-0"
                          title={fileName}
                          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                        />
                      </div>
                    );
                  } else {
                    return (
                      <div key={index} className="border-2 rounded-xl overflow-hidden shadow-lg bg-white p-6">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
                        <p className="text-center text-gray-500 mt-2">Loading {fileName}...</p>
                      </div>
                    );
                  }
                }

                return (
                  <div key={index} className="border-2 rounded-xl shadow-lg bg-white p-6">
                    <a href={fileUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 hover:bg-gray-50 transition-colors p-4 rounded-lg">
                      <FileText className="w-12 h-12 text-indigo-500 flex-shrink-0" />
                      <div className="flex-1">
                        <span className="text-lg text-indigo-600 hover:underline font-medium block">{fileName}</span>
                        <span className="text-sm text-gray-500">Click to view</span>
                      </div>
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="mb-12">
          <Card className="max-w-2xl mx-auto shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-600" />
                Share Your Feedback
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="feedback">What do you think about our MLP?</Label>
                  <Textarea
                    id="feedback"
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Your feedback helps us make this product even better..."
                    className="min-h-[100px] mt-2"
                    required
                  />
                </div>
                <Button type="submit" disabled={isSubmitting} className="w-full bg-indigo-600 hover:bg-indigo-700">
                  {isSubmitting ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...</>
                  ) : (
                    <><Send className="w-4 h-4 mr-2" /> Send Feedback</>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
