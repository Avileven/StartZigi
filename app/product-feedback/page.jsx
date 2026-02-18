"use client";
import React, { useState, useEffect } from 'react';
import { Venture } from '@/api/entities.js';
import { MVPFeatureFeedback } from '@/api/entities.js';
import { SuggestedFeature } from '@/api/entities.js';
import { BetaTester } from '@/api/entities.js';
import { User } from '@/api/entities.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Loader2, BarChart3, MessageSquare, TrendingUp, Lightbulb, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function ProductFeedback() {
  const [venture, setVenture] = useState(null);
  const [featureFeedback, setFeatureFeedback] = useState([]);
  const [suggestedFeatures, setSuggestedFeatures] = useState([]);
  const [betaTesters, setBetaTesters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [analytics, setAnalytics] = useState({});

  useEffect(() => {
    const loadData = async () => {
      try {
        const user = await User.me();
        const ventures = await Venture.filter({ created_by: user.email }, "-created_date");
        
        if (ventures.length > 0) {
          const currentVenture = ventures[0];
          setVenture(currentVenture);

          const feedback = await MVPFeatureFeedback.filter({ venture_id: currentVenture.id });
          setFeatureFeedback(feedback);

          const suggestions = await SuggestedFeature.filter({ venture_id: currentVenture.id });
          setSuggestedFeatures(suggestions);

          // Load beta testers
          const testers = await BetaTester.filter({ venture_id: currentVenture.id });
          setBetaTesters(testers);

          // Calculate analytics
          if (currentVenture.mvp_data && currentVenture.mvp_data.feature_matrix) {
            const featureAnalytics = {};
            
            currentVenture.mvp_data.feature_matrix
              .filter(f => f.isSelected)
              .forEach(feature => {
                const feedbackForFeature = feedback.filter(f => f.feature_id === feature.id);
                
                if (feedbackForFeature.length > 0) {
                  const ratings = feedbackForFeature.map(f => f.rating);
                  const avgRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
                  
                  const neverUse = ratings.filter(r => r >= 0 && r <= 2).length;
                  const confusing = ratings.filter(r => r >= 3 && r <= 4).length;
                  const niceToHave = ratings.filter(r => r >= 5 && r <= 7).length;
                  const essential = ratings.filter(r => r >= 8 && r <= 10).length;
                  
                  featureAnalytics[feature.id] = {
                    name: feature.featureName,
                    avgRating: avgRating.toFixed(1),
                    totalResponses: feedbackForFeature.length,
                    breakdown: {
                      neverUse,
                      confusing,
                      niceToHave,
                      essential
                    }
                  };
                }
              });
            
            setAnalytics(featureAnalytics);
          }
        }
      } catch (error) {
        console.error("Error loading feedback data:", error);
      }
      setIsLoading(false);
    };

    loadData();
  }, []);

  const getCategoryFromRating = (avgRating) => {
    const rating = parseFloat(avgRating);
    if (rating >= 0 && rating <= 2) return { label: 'Never use', color: 'bg-red-100 text-red-800' };
    if (rating >= 3 && rating <= 4) return { label: 'Confusing', color: 'bg-yellow-100 text-yellow-800' };
    if (rating >= 5 && rating <= 7) return { label: 'Nice To Have', color: 'bg-blue-100 text-blue-800' };
    if (rating >= 8 && rating <= 10) return { label: 'Essential', color: 'bg-green-100 text-green-800' };
    return { label: '', color: 'bg-gray-100 text-gray-800' };
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
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

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Product Feedback Center</h1>
          <p className="text-gray-600">Analyze feedback from your MVP users</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Feedback</p>
                  <p className="text-3xl font-bold text-gray-900">{venture.mvp_feedback_count || 0}</p>
                </div>
                <MessageSquare className="w-10 h-10 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Features Tested</p>
                  <p className="text-3xl font-bold text-gray-900">{Object.keys(analytics).length}</p>
                </div>
                <TrendingUp className="w-10 h-10 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Suggested Features</p>
                  <p className="text-3xl font-bold text-gray-900">{suggestedFeatures.length}</p>
                </div>
                <Lightbulb className="w-10 h-10 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {Object.keys(analytics).length > 0 ? (
          <div className="space-y-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Feature Ratings</h2>
            {Object.entries(analytics).map(([featureId, data]) => {
              const category = getCategoryFromRating(data.avgRating);
              return (
                <Card key={featureId}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{data.name}</CardTitle>
                      <Badge className={category.color}>
                        {category.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className="text-4xl font-bold text-indigo-600">{data.avgRating}</div>
                          <div className="text-sm text-gray-500">Avg Rating</div>
                        </div>
                        <div className="flex-1">
                          <div className="grid grid-cols-4 gap-2 text-center">
                            <div className="p-2 bg-red-50 rounded">
                              <div className="font-bold text-red-700">{data.breakdown.neverUse}</div>
                              <div className="text-xs text-gray-600">Never use</div>
                            </div>
                            <div className="p-2 bg-yellow-50 rounded">
                              <div className="font-bold text-yellow-700">{data.breakdown.confusing}</div>
                              <div className="text-xs text-gray-600">Confusing</div>
                            </div>
                            <div className="p-2 bg-blue-50 rounded">
                              <div className="font-bold text-blue-700">{data.breakdown.niceToHave}</div>
                              <div className="text-xs text-gray-600">Nice To Have</div>
                            </div>
                            <div className="p-2 bg-green-50 rounded">
                              <div className="font-bold text-green-700">{data.breakdown.essential}</div>
                              <div className="text-xs text-gray-600">Essential</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        Based on {data.totalResponses} response{data.totalResponses !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="mb-8">
            <CardContent className="p-8 text-center">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No feedback received yet. Share your landing page to start collecting feedback!</p>
            </CardContent>
          </Card>
        )}

        {suggestedFeatures.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Suggested Features from Users</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {suggestedFeatures.map((suggestion) => (
                <Card key={suggestion.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Lightbulb className="w-5 h-5 text-yellow-500 mt-1" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{suggestion.feature_name}</p>
                        {suggestion.user_email && (
                          <p className="text-sm text-gray-500 mt-1">Suggested by: {suggestion.user_email}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Beta Sign-ups Section */}
        {betaTesters.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Beta Sign-ups</h2>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-600" />
                    Total Sign-ups: {betaTesters.length}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {betaTesters
                    .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
                    .map((tester) => (
                      <div key={tester.id} className="border-l-4 border-indigo-200 bg-indigo-50 p-4 rounded-r-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{tester.full_name}</h3>
                            <p className="text-sm text-gray-500 mt-1">
                              Signed up: {new Date(tester.created_date).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </p>
                            {tester.interest_reason && (
                              <div className="mt-2">
                                <p className="text-sm font-medium text-gray-700">Why they joined:</p>
                                <p className="text-sm text-gray-600 mt-1">{tester.interest_reason}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}