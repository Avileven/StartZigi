// 300326 - UPDATED 010526: UX improvements
import React, { useState, useMemo } from 'react';
import { MVPFeatureFeedback, SuggestedFeature, User } from '@/api/entities.js';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input.jsx';
import { Slider } from '@/components/ui/slider';
import { MessageSquare, Loader2, CheckCircle, Plus } from 'lucide-react';

export default function InteractiveFeedbackForm({ venture, onFeedbackSubmitted, reviewerVenture }) {
  const [feedbackData, setFeedbackData] = useState({});
  const [newFeatureName, setNewFeatureName] = useState('');
  const [pendingFeatures, setPendingFeatures] = useState([]); // [CHANGED] local list before submit
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const selectedFeatures = useMemo(() => {
    if (!venture || !venture.mvp_data || !Array.isArray(venture.mvp_data.feature_matrix)) return [];
    return venture.mvp_data.feature_matrix.filter(f => f.isSelected);
  }, [venture]);

  if (selectedFeatures.length === 0) return null;

  const handleRatingChange = (featureId, value) => {
    setFeedbackData(prev => ({ ...prev, [featureId]: value[0] }));
  };

  // [CHANGED] Add to local list only — send to DB on Submit
  const handleAddSuggestedFeature = () => {
    if (!newFeatureName.trim()) return;
    setPendingFeatures(prev => [...prev, newFeatureName.trim()]);
    setNewFeatureName('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Object.keys(feedbackData).length === 0) return;
    setIsSubmitting(true);

    try {
      const submissionId = crypto.randomUUID();
      let currentUser = null;
      try { currentUser = await User.me(); } catch (error) {}

      const now = new Date().toISOString();
      const createdByEmail = currentUser ? currentUser.email : 'anonymous_user';
      const createdById = currentUser ? currentUser.id : null;

      // Submit ratings
      const feedbackPromises = selectedFeatures.map(feature => {
        const rating = feedbackData[feature.id];
        if (rating === undefined || rating === null) return Promise.resolve();
        return MVPFeatureFeedback.create({
          id: crypto.randomUUID(),
          created_date: now, updated_date: now,
          created_by: createdByEmail, created_by_id: createdById,
          venture_id: venture.id,
          feature_id: feature.id,
          feature_name: feature.featureName || "Unnamed Feature",
          rating,
          submission_id: submissionId,
          user_email: createdByEmail,
          reviewer_venture_id: reviewerVenture?.id || null,
          reviewer_venture_name: reviewerVenture?.name || null,
        });
      });

      // [CHANGED] Submit pending feature suggestions together with ratings
      const suggestionPromises = pendingFeatures.map(name =>
        SuggestedFeature.create({
          id: crypto.randomUUID(),
          created_date: now, updated_date: now,
          created_by: createdByEmail, created_by_id: createdById,
          venture_id: venture.id,
          feature_name: name,
          user_email: createdByEmail,
        })
      );

      await Promise.all([...feedbackPromises, ...suggestionPromises]);
      setIsSubmitted(true);
      if (onFeedbackSubmitted) onFeedbackSubmitted();

    } catch (error) {
      console.error("Error submitting feedback:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryFromRating = (rating) => {
    if (rating <= 2) return { label: 'Never use', color: 'text-red-600 bg-red-100' };
    if (rating <= 4) return { label: 'Confusing', color: 'text-yellow-600 bg-yellow-100' };
    if (rating <= 7) return { label: 'Nice To Have', color: 'text-blue-600 bg-blue-100' };
    return { label: 'Essential', color: 'text-green-600 bg-green-100' };
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* [ADDED] Thumb color override */}
      <style>{`
        .feedback-slider [role="slider"] {
          background-color: #6366f1 !important;
          border: 3px solid #4338ca !important;
          width: 24px !important;
          height: 24px !important;
          box-shadow: 0 2px 8px rgba(99,102,241,0.5) !important;
        }
      `}</style>

      <Card className="shadow-2xl bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border-0 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white">
          <CardTitle className="text-3xl font-bold text-center flex items-center justify-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <MessageSquare className="w-6 h-6" />
            </div>
            MVP Feature Feedback
          </CardTitle>
          <CardDescription className="text-purple-100 text-center text-lg font-medium mt-2">
            Rate the features below to help this venture improve
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 bg-white">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Category Headers */}
            <div className="grid grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Never use', range: '0-2', from: 'from-red-500', to: 'to-red-600', text: 'text-red-600' },
                { label: 'Confusing', range: '3-4', from: 'from-yellow-500', to: 'to-yellow-600', text: 'text-yellow-600' },
                { label: 'Nice To Have', range: '5-7', from: 'from-blue-500', to: 'to-blue-600', text: 'text-blue-600' },
                { label: 'Essential', range: '8-10', from: 'from-green-500', to: 'to-green-600', text: 'text-green-600' },
              ].map(c => (
                <div key={c.label} className="text-center">
                  <div className={`bg-gradient-to-r ${c.from} ${c.to} text-white px-4 py-3 rounded-xl font-bold shadow-lg`}>{c.label}</div>
                  <div className={`text-xs ${c.text} mt-2 font-semibold`}>{c.range}</div>
                </div>
              ))}
            </div>

            {/* Features */}
            {selectedFeatures.map((feature) => (
              <div key={feature.id} className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 shadow-lg border-2 border-gray-200 hover:border-indigo-300 transition-all duration-300">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">{feature.featureName}</h3>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-bold text-indigo-600">
                      {feedbackData[feature.id] !== undefined ? feedbackData[feature.id] : '—'}
                    </span>
                    {feedbackData[feature.id] !== undefined && (
                      <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getCategoryFromRating(feedbackData[feature.id]).color}`}>
                        {getCategoryFromRating(feedbackData[feature.id]).label}
                      </div>
                    )}
                  </div>
                </div>
                <div className="relative feedback-slider">
                  <Slider
                    value={[feedbackData[feature.id] ?? 5]}
                    onValueChange={(value) => handleRatingChange(feature.id, value)}
                    max={10} min={0} step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-sm font-semibold text-gray-500">0</span>
                    <span className="text-xs text-gray-400 italic">← Drag to rate →</span>
                    <span className="text-sm font-semibold text-gray-500">10</span>
                  </div>
                </div>
              </div>
            ))}

            {/* Suggest New Feature */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 shadow-lg border-2 border-emerald-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Suggest a new feature</h3>
              <div className="flex gap-4">
                <Input
                  value={newFeatureName}
                  onChange={(e) => setNewFeatureName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSuggestedFeature(); }}}
                  placeholder="Describe a feature you'd like to see..."
                  className="flex-1 text-lg py-3 border-2 border-emerald-200 focus:border-emerald-400 rounded-xl"
                />
                <Button
                  type="button"
                  onClick={handleAddSuggestedFeature}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-8 py-3 text-lg font-semibold shadow-lg rounded-xl"
                >
                  <Plus className="w-5 h-5 mr-2" /> Add
                </Button>
              </div>
              {/* [ADDED] Pending features list */}
              {pendingFeatures.length > 0 && (
                <div className="mt-4 space-y-2">
                  {pendingFeatures.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-emerald-700 text-sm font-medium">
                      <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="text-center pt-6">
              {isSubmitted ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-8 py-4 text-green-700 font-bold text-lg">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                    Thank you! Your feedback has been submitted.
                  </div>
                  <p className="text-gray-400 text-sm">Redirecting you back in a few seconds...</p>
                </div>
              ) : (
                <Button
                  type="submit"
                  disabled={isSubmitting || Object.keys(feedbackData).length === 0}
                  className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white text-xl px-16 py-4 rounded-full shadow-2xl transform transition hover:scale-105 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-6 h-6 mr-3 animate-spin" /> Submitting...</>
                  ) : (
                    'Submit All Feedback'
                  )}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
