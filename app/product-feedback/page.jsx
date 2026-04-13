// 130426
"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Venture } from '@/api/entities.js';
import { MVPFeatureFeedback } from '@/api/entities.js';
import { SuggestedFeature } from '@/api/entities.js';
import { BetaTester } from '@/api/entities.js';
import { ProductFeedback as ProductFeedbackEntity } from '@/api/entities.js';
import { User } from '@/api/entities.js';
import { businessPlan } from '@/api/entities.js';
import { InvokeLLM } from '@/api/integrations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Loader2, BarChart3, MessageSquare, TrendingUp, Lightbulb, Users, Star, Sparkles, MessageCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function ProductFeedbackPage() {
  const [venture, setVenture] = useState(null);
  const [featureFeedback, setFeatureFeedback] = useState([]);
  const [suggestedFeatures, setSuggestedFeatures] = useState([]);
  const [betaTesters, setBetaTesters] = useState([]);
  const [userPlan, setUserPlan] = useState(null);
  const [productFeedbacks, setProductFeedbacks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [analytics, setAnalytics] = useState({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [businessPlanData, setBusinessPlanData] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const user = await User.me();
        console.log('[FeedbackHub] user:', user?.email);

        // Fetch user plan for Export button visibility
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('plan')
          .eq('id', user.id)
          .single();
        if (profile) setUserPlan(profile.plan);

        const ventures = await Venture.filter({ created_by: user.email }, "-created_date");
        console.log('[FeedbackHub] ventures found:', ventures.length);

        if (ventures.length > 0) {
          const currentVenture = ventures[0];
          console.log('[FeedbackHub] venture id:', currentVenture.id, 'name:', currentVenture.name);
          setVenture(currentVenture);

          const feedback = await MVPFeatureFeedback.filter({ venture_id: currentVenture.id });
          console.log('[FeedbackHub] MVP feature feedback:', feedback.length);
          setFeatureFeedback(feedback);

          const suggestions = await SuggestedFeature.filter({ venture_id: currentVenture.id });
          setSuggestedFeatures(suggestions);

          const testers = await BetaTester.filter({ venture_id: currentVenture.id });
          setBetaTesters(testers);

          const pfeedback = await ProductFeedbackEntity.filter({ venture_id: currentVenture.id }, '-created_date');
          console.log('[FeedbackHub] MLP product feedbacks:', pfeedback.length);
          setProductFeedbacks(pfeedback);

          const bp = await businessPlan.filter({ venture_id: currentVenture.id });
          if (bp.length > 0) setBusinessPlanData(bp[0]);

          if (currentVenture.mvp_data && currentVenture.mvp_data.feature_matrix) {
            const featureAnalytics = {};
            currentVenture.mvp_data.feature_matrix
              .filter(f => f.isSelected)
              .forEach(feature => {
                const feedbackForFeature = feedback.filter(f => f.feature_id === feature.id);
                if (feedbackForFeature.length > 0) {
                  const ratings = feedbackForFeature.map(f => f.rating);
                  const avgRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
                  const total = ratings.length;
                  featureAnalytics[feature.id] = {
                    name: feature.featureName,
                    avgRating: avgRating.toFixed(1),
                    totalResponses: total,
                    breakdown: {
                      neverUse: ratings.filter(r => r >= 0 && r <= 2).length,
                      confusing: ratings.filter(r => r >= 3 && r <= 4).length,
                      niceToHave: ratings.filter(r => r >= 5 && r <= 7).length,
                      essential: ratings.filter(r => r >= 8 && r <= 10).length,
                    }
                  };
                }
              });
            setAnalytics(featureAnalytics);
          }
        }
      } catch (error) {
        console.error('[FeedbackHub] Error loading feedback data:', error);
      }
      setIsLoading(false);
    };
    loadData();
  }, []);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setAiAnalysis(null);
    try {
      const featureSummary = Object.entries(analytics).map(([, data]) =>
        'Feature: "' + data.name + '" - Avg: ' + data.avgRating + '/10 (' + data.totalResponses + ' responses). Never use: ' + data.breakdown.neverUse + ', Confusing: ' + data.breakdown.confusing + ', Nice to have: ' + data.breakdown.niceToHave + ', Essential: ' + data.breakdown.essential + '.'
      ).join('\n');
      const mlpSummary = productFeedbacks.map(fb => '- "' + fb.feedback_text + '"').join('\n');
      const suggestedSummary = suggestedFeatures.map(s => '- ' + s.feature_name).join('\n');
      const bpContext = businessPlanData
        ? 'Mission: ' + (businessPlanData.mission || 'N/A') + '\nProblem: ' + (businessPlanData.problem || 'N/A') + '\nSolution: ' + (businessPlanData.solution || 'N/A') + '\nTarget customers: ' + (businessPlanData.target_customers || 'N/A')
        : 'No business plan data available.';

      const prompt = 'You are a sharp product strategist. Analyze this startup feedback data and respond in exactly 3 short sections. Each section: 1 header line in caps followed by max 2-3 bullet points, one sentence each. No fluff, no explanations.\n\n'
        + 'Startup: "' + (venture?.name || '') + '"\n\n'
        + 'BUSINESS CONTEXT:\n' + bpContext + '\n\n'
        + 'MVP FEATURE RATINGS:\n' + (featureSummary || 'No feature ratings yet.') + '\n\n'
        + 'MLP USER FEEDBACK:\n' + (mlpSummary || 'No MLP feedback yet.') + '\n\n'
        + 'SUGGESTED FEATURES FROM USERS:\n' + (suggestedSummary || 'No suggestions yet.') + '\n\n'
        + 'Respond with EXACTLY this structure, nothing else:\n\n'
        + "WHAT'S WORKING:\n"
        + '- [one sentence]\n'
        + '- [one sentence]\n\n'
        + 'WHAT NEEDS ATTENTION:\n'
        + '- [one sentence]\n'
        + '- [one sentence]\n\n'
        + 'RECOMMENDED NEW FEATURES:\n'
        + '1. [feature name] — [one sentence reason, referencing business plan or user suggestions]\n'
        + '2. [feature name] — [one sentence reason]\n'
        + '3. [feature name] — [one sentence reason]\n\n'
        + 'Plain text only. No markdown. No extra commentary.';

      const data = await InvokeLLM({ prompt, creditType: 'mentor' });
      setAiAnalysis(data?.response || 'No analysis generated.');
    } catch (error) {
      if (error.message === 'NO_CREDITS') {
        setAiAnalysis('You have used all your mentor credits this month. Upgrade your plan to get more.');
      } else {
        setAiAnalysis('Error generating analysis. Please try again.');
      }
    }
    setIsAnalyzing(false);
  };

  const getCategoryFromRating = (avgRating) => {
    const rating = parseFloat(avgRating);
    if (rating >= 8) return { label: 'Essential', color: 'bg-green-100 text-green-800', dot: 'bg-green-500' };
    if (rating >= 5) return { label: 'Nice To Have', color: 'bg-blue-100 text-blue-800', dot: 'bg-blue-500' };
    if (rating >= 3) return { label: 'Confusing', color: 'bg-yellow-100 text-yellow-800', dot: 'bg-yellow-500' };
    return { label: 'Never use', color: 'bg-red-100 text-red-800', dot: 'bg-red-500' };
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!venture) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600">No venture found.</p>
      </div>
    );
  }

  const totalFeedback = productFeedbacks.length + (venture.mvp_feedback_count || 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Venture Feedback Hub</h1>
          <p className="text-gray-500 text-lg">All feedback collected across your startup journey</p>
        </div>

        {/* AI Analysis */}
        <div className="mb-10">
          <p className="text-sm text-gray-500 text-center mb-3">Strategic insights based on all your feedback data</p>
          <div className="flex justify-center">
            <Button
              type="button"
              variant="outline"
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 border-indigo-200 px-8 py-3 text-base"
            >
              {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <MessageCircle className="w-5 h-5" />}
              {isAnalyzing ? 'Analyzing...' : 'Mentor'}
            </Button>
          </div>
          {aiAnalysis && (
            <Card className="border-0 shadow-sm mt-5">
              <CardContent className="p-5">
                {aiAnalysis.split('\n').map((line, i) => {
                  const trimmed = line.trim();
                  if (!trimmed) return null;
                  const isHeader = /^[A-Z][A-Z\s']+:/.test(trimmed);
                  return isHeader
                    ? <h4 key={i} className="font-bold text-indigo-800 mt-4 mb-1 text-sm">{trimmed}</h4>
                    : <p key={i} className="text-gray-700 leading-relaxed text-sm mb-1">{trimmed}</p>;
                })}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Total Feedback', value: totalFeedback, icon: <MessageSquare className="w-5 h-5 text-indigo-500" />, bg: 'bg-indigo-50' },
            { label: 'Features Analyzed', value: Object.keys(analytics).length, icon: <TrendingUp className="w-5 h-5 text-green-500" />, bg: 'bg-green-50' },
            { label: 'Suggested Features', value: suggestedFeatures.length, icon: <Lightbulb className="w-5 h-5 text-yellow-500" />, bg: 'bg-yellow-50' },
            { label: 'Beta Sign-ups', value: betaTesters.length, icon: <Users className="w-5 h-5 text-purple-500" />, bg: 'bg-purple-50' },
          ].map((stat, i) => (
            <Card key={i} className="border-0 shadow-sm">
              <CardContent className="p-5">
                <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}>
                  {stat.icon}
                </div>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* MVP Feature Ratings */}
        {Object.keys(analytics).length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-1 h-7 bg-indigo-500 rounded-full" />
              <h2 className="text-2xl font-bold text-gray-900">MVP Feature Ratings</h2>
            </div>
            <div className="space-y-4">
              {Object.entries(analytics).map(([featureId, data]) => {
                const category = getCategoryFromRating(data.avgRating);
                const total = data.totalResponses;
                const pNever = Math.round((data.breakdown.neverUse / total) * 100);
                const pConfusing = Math.round((data.breakdown.confusing / total) * 100);
                const pNice = Math.round((data.breakdown.niceToHave / total) * 100);
                const pEssential = Math.round((data.breakdown.essential / total) * 100);

                return (
                  <Card key={featureId} className="border-0 shadow-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${category.dot}`} />
                          <h3 className="font-semibold text-gray-900 text-lg">{data.name}</h3>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            <span className="font-bold text-gray-900 text-lg">{data.avgRating}</span>
                            <span className="text-gray-400 text-sm">/10</span>
                          </div>
                          <Badge className={category.color}>{category.label}</Badge>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="h-3 rounded-full overflow-hidden flex mb-3">
                        {pNever > 0 && <div className="bg-red-400 h-full transition-all" style={{ width: `${pNever}%` }} title={`Never use: ${pNever}%`} />}
                        {pConfusing > 0 && <div className="bg-yellow-400 h-full transition-all" style={{ width: `${pConfusing}%` }} title={`Confusing: ${pConfusing}%`} />}
                        {pNice > 0 && <div className="bg-blue-400 h-full transition-all" style={{ width: `${pNice}%` }} title={`Nice to have: ${pNice}%`} />}
                        {pEssential > 0 && <div className="bg-green-400 h-full transition-all" style={{ width: `${pEssential}%` }} title={`Essential: ${pEssential}%`} />}
                      </div>

                      <div className="flex gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" />Never use {pNever}%</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" />Confusing {pConfusing}%</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />Nice to have {pNice}%</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400 inline-block" />Essential {pEssential}%</span>
                        <span className="ml-auto">{total} response{total !== 1 ? 's' : ''}</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Suggested Features */}
        {suggestedFeatures.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-1 h-7 bg-yellow-400 rounded-full" />
              <h2 className="text-2xl font-bold text-gray-900">Suggested Features</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {suggestedFeatures.map((suggestion) => (
                <Card key={suggestion.id} className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-yellow-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Lightbulb className="w-4 h-4 text-yellow-500" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{suggestion.feature_name}</p>
                        {suggestion.user_email && (
                          <p className="text-sm text-gray-400 mt-1">by {suggestion.user_email}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Beta Sign-ups */}
        {betaTesters.length > 0 && (() => {
          const exportCSV = () => {
            const rows = [
              ['Full Name', 'Email', 'Date', 'Interest Reason'],
              ...betaTesters.map(t => [
                t.full_name || '',
                t.email || '',
                new Date(t.created_date).toLocaleDateString('en-US'),
                t.interest_reason || ''
              ])
            ];
            const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'beta-testers.csv';
            a.click();
            URL.revokeObjectURL(url);
          };

          return (
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-1 h-7 bg-purple-500 rounded-full" />
              <h2 className="text-2xl font-bold text-gray-900">Beta Sign-ups</h2>
              <Badge className="bg-purple-100 text-purple-800 ml-2">{betaTesters.length}</Badge>
              {userPlan === 'unicorn' && (
                <Button
                  onClick={exportCSV}
                  size="sm"
                  variant="outline"
                  className="ml-auto border-purple-300 text-purple-700 hover:bg-purple-50"
                >
                  Export CSV
                </Button>
              )}
            </div>
            <div className="space-y-3">
              {betaTesters
                .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
                .map((tester) => (
                  <Card key={tester.id} className="border-0 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-purple-700">
                          {tester.full_name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{tester.full_name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {new Date(tester.created_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </p>
                          {tester.interest_reason && (
                            <p className="text-sm text-gray-600 mt-2 italic">"{tester.interest_reason}"</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
          );
        })()}

        {/* MLP User Feedback */}
        {productFeedbacks.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-1 h-7 bg-pink-500 rounded-full" />
              <h2 className="text-2xl font-bold text-gray-900">MLP User Feedback</h2>
              <Badge className="bg-pink-100 text-pink-800 ml-2">{productFeedbacks.length}</Badge>
            </div>
            <div className="space-y-3">
              {productFeedbacks.map((fb) => (
                <Card key={fb.id} className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-pink-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="w-4 h-4 text-pink-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-700">{fb.feedback_text}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(fb.created_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {totalFeedback === 0 && Object.keys(analytics).length === 0 && (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-12 text-center">
              <MessageSquare className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No feedback yet</h3>
              <p className="text-gray-400">Share your landing page to start collecting feedback from users.</p>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
}
