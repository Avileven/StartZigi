import React, { useState, useMemo } from 'react';
import { MVPFeatureFeedback } from '@/api/entities.js';
import { SuggestedFeature } from '@/api/entities.js';
import { Venture } from '@/api/entities.js';
import { User } from '@/api/entities.js';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { MessageSquare, Loader2, CheckCircle, Plus } from 'lucide-react';

export default function InteractiveFeedbackForm({ venture, onFeedbackSubmitted }) {
  const [feedbackData, setFeedbackData] = useState({});
  const [newFeatureName, setNewFeatureName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const selectedFeatures = useMemo(() => {
    if (!venture || !venture.mvp_data || !Array.isArray(venture.mvp_data.feature_matrix)) {
      return [];
    }
    return venture.mvp_data.feature_matrix.filter(f => f.isSelected);
  }, [venture]);

  if (selectedFeatures.length === 0) {
    return null;
  }

  const handleRatingChange = (featureId, value) => {
    const ratingValue = value[0]; // Slider returns array, get first value
    console.log(`Rating change for feature ${featureId}:`, ratingValue);
    setFeedbackData(prev => ({
      ...prev,
      [featureId]: ratingValue
    }));
  };

  const handleAddSuggestedFeature = async () => {
    if (!newFeatureName.trim()) return;

    try {
      let currentUser = null;
      try {
        currentUser = await User.me();
      } catch (error) { /* User not logged in */ }

      await SuggestedFeature.create({
        venture_id: venture.id,
        feature_name: newFeatureName,
        user_email: currentUser ? currentUser.email : null
      });

      setNewFeatureName('');
      alert('Feature suggestion added successfully!');
    } catch (error) {
      console.error('Error adding suggested feature:', error);
      alert('Error adding feature suggestion. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Object.keys(feedbackData).length === 0) {
      alert("Please provide some feedback before submitting.");
      return;
    }
    setIsSubmitting(true);

    try {
      const submissionId = `submission_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      let currentUser = null;
      try {
        currentUser = await User.me();
      } catch (error) { /* User not logged in */ }

      console.log('About to submit feedback data:', feedbackData);

      const feedbackPromises = selectedFeatures.map(feature => {
        const rating = feedbackData[feature.id];
        console.log(`Submitting feedback for feature ${feature.id} (${feature.featureName}): rating=${rating}`);
        if (rating !== undefined && rating !== null) {
          return MVPFeatureFeedback.create({
            venture_id: venture.id,
            feature_id: feature.id,
            feature_name: feature.featureName || "Unnamed Feature",
            rating: rating,
            submission_id: submissionId,
            user_email: currentUser ? currentUser.email : null,
          });
        }
        return Promise.resolve();
      });

      await Promise.all(feedbackPromises);

      const newFeedbackCount = (venture.mvp_feedback_count || 0) + 1;
      await Venture.update(venture.id, { mvp_feedback_count: newFeedbackCount });

      setIsSubmitted(true);
      if (onFeedbackSubmitted) {
        onFeedbackSubmitted();
      }

    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert("An error occurred while submitting your feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryFromRating = (rating) => {
    if (rating >= 0 && rating <= 2) return { label: 'Never use', color: 'text-red-600 bg-red-100' };
    if (rating >= 3 && rating <= 4) return { label: 'Confusing', color: 'text-yellow-600 bg-yellow-100' };
    if (rating >= 5 && rating <= 7) return { label: 'Nice To Have', color: 'text-blue-600 bg-blue-100' };
    if (rating >= 8 && rating <= 10) return { label: 'Essential', color: 'text-green-600 bg-green-100' };
    return { label: '', color: 'text-gray-600 bg-gray-100' };
  };

  if (isSubmitted) {
    return (
      <Card className="max-w-4xl mx-auto shadow-xl bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-0">
        <CardContent className="p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
            Thank You!
          </h3>
          <p className="text-lg text-gray-600">Your feedback has been submitted and will help improve this venture.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
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
              <div className="text-center">
                <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-3 rounded-xl font-bold shadow-lg">
                  Never use
                </div>
                <div className="text-xs text-red-600 mt-2 font-semibold">0-2</div>
              </div>
              <div className="text-center">
                <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-4 py-3 rounded-xl font-bold shadow-lg">
                  Confusing
                </div>
                <div className="text-xs text-yellow-600 mt-2 font-semibold">3-4</div>
              </div>
              <div className="text-center">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3 rounded-xl font-bold shadow-lg">
                  Nice To Have
                </div>
                <div className="text-xs text-blue-600 mt-2 font-semibold">5-7</div>
              </div>
              <div className="text-center">
                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-3 rounded-xl font-bold shadow-lg">
                  Essential
                </div>
                <div className="text-xs text-green-600 mt-2 font-semibold">8-10</div>
              </div>
            </div>

            {/* Features */}
            {selectedFeatures.map((feature) => (
              <div key={feature.id} className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 shadow-lg border-2 border-gray-200 hover:border-indigo-300 transition-all duration-300">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">{feature.featureName}</h3>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-bold text-indigo-600">
                      {feedbackData[feature.id] !== undefined ? feedbackData[feature.id] : 0}
                    </span>
                    {feedbackData[feature.id] !== undefined && (
                      <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getCategoryFromRating(feedbackData[feature.id]).color}`}>
                        {getCategoryFromRating(feedbackData[feature.id]).label}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="relative">
                  <Slider
                    value={[feedbackData[feature.id] || 0]}
                    onValueChange={(value) => handleRatingChange(feature.id, value)}
                    max={10}
                    min={0}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-3">
                    <span className="font-semibold">0</span>
                    <span className="font-semibold">10</span>
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
                  placeholder="Describe a feature you'd like to see..."
                  className="flex-1 text-lg py-3 border-2 border-emerald-200 focus:border-emerald-400 rounded-xl"
                />
                <Button 
                  type="button" 
                  onClick={handleAddSuggestedFeature}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-8 py-3 text-lg font-semibold shadow-lg rounded-xl"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add
                </Button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="text-center pt-6">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white text-xl px-16 py-4 rounded-full shadow-2xl transform transition hover:scale-105 font-bold"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}