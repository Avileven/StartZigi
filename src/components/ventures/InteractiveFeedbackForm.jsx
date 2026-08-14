// 010526 - UPDATED UX improvements
import React, { useState, useMemo } from 'react';
import { MVPFeatureFeedback, SuggestedFeature, User } from '@/api/entities.js';
import { supabase } from '@/lib/supabase';
import InsightEarnedAnimation from '@/components/ventures/InsightEarnedAnimation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input.jsx';
import { Slider } from '@/components/ui/slider';
import { MessageSquare, Loader2, CheckCircle, Plus } from 'lucide-react';

export default function InteractiveFeedbackForm({ venture, onFeedbackSubmitted, reviewerVenture, campaignId }) {
  const [feedbackData, setFeedbackData] = useState({});
  const [newFeatureName, setNewFeatureName] = useState('');
  const [pendingFeatures, setPendingFeatures] = useState([]); // [CHANGED] local list before submit
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  // [ADDED 020826] Insight Credits project, step 2.
  const [showInsightAnimation, setShowInsightAnimation] = useState(false);
  // [ADDED 020826] Follower — same mechanism as MLP's, unified wording,
  // available at MVP too (originally MLP-only, extended this session).
  const [wantsToFollow, setWantsToFollow] = useState(false);
  // [ADDED 020826] Part G.6 — product-level question, shown before the
  // per-feature list. PRODUCT_SCORE_THRESHOLD is the "low score" cutoff
  // below which the optional follow-up appears — proposed as <6 this
  // session, not finalized.
  const PRODUCT_SCORE_THRESHOLD = 6;
  const [productScore, setProductScore] = useState(null);
  const [productNote, setProductNote] = useState('');
  // [ADDED 020826] Part G.6 — lightweight per-feature toggle, replacing what
  // would otherwise have been a second full rating axis.
  const [hardToSeeMap, setHardToSeeMap] = useState({});

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
    // [FIX 020826] Now also requires the product-level question to be
    // answered — it's the first thing asked, per G.6's design.
    if (productScore === null || Object.keys(feedbackData).length === 0) return;
    setIsSubmitting(true);

    try {
      const submissionId = crypto.randomUUID();
      let currentUser = null;
      try { currentUser = await User.me(); } catch (error) {}

      const now = new Date().toISOString();
      const createdByEmail = currentUser ? currentUser.email : 'anonymous_user';
      const createdById = currentUser ? currentUser.id : null;

      // [ADDED 020826] Part G.6 — the product-level question. Stored in the
      // same table as a sentinel row (feature_id: 'product_overall') rather
      // than a new table, since it's conceptually "one more rating," just
      // not tied to a specific feature. The optional open-text follow-up
      // goes in the new `note` column.
      const productLevelPromise = MVPFeatureFeedback.create({
        id: crypto.randomUUID(),
        created_date: now, updated_date: now,
        created_by: createdByEmail, created_by_id: createdById,
        venture_id: venture.id,
        feature_id: 'product_overall',
        feature_name: 'Product Overall',
        rating: productScore,
        note: productScore < PRODUCT_SCORE_THRESHOLD ? (productNote.trim() || null) : null,
        submission_id: submissionId,
        user_email: createdByEmail,
        reviewer_venture_id: reviewerVenture?.id || null,
        reviewer_venture_name: reviewerVenture?.name || null,
        campaign_id: campaignId || null,
      });

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
          // [ADDED 020826] Part G.6 — the lightweight mockup-clarity toggle.
          hard_to_see_in_mockup: Boolean(hardToSeeMap[feature.id]),
          submission_id: submissionId,
          user_email: createdByEmail,
          reviewer_venture_id: reviewerVenture?.id || null,
          reviewer_venture_name: reviewerVenture?.name || null,
          // [ADDED 020826] Links this feedback back to the promotion round
          // that generated it (Validation Center's "Feedback Received" count).
          campaign_id: campaignId || null,
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
          // [ADDED 020826] Same campaign linkage as MVP ratings above.
          campaign_id: campaignId || null,
        })
      );

      await Promise.all([productLevelPromise, ...feedbackPromises, ...suggestionPromises]);
      setIsSubmitted(true);

      // [ADDED 020826] Follower — same fire-and-forget pattern used on the
      // MLP side. Only for a real logged-in reviewer.
      if (wantsToFollow && currentUser) {
        supabase.from('venture_followers').insert({
          venture_id: venture.id,
          user_id: currentUser.id,
        }).then(({ error: followError }) => {
          if (followError && followError.code !== '23505') {
            console.error('Could not save Follower:', followError);
          }
        });
      }

      // [ADDED 020826] Insight Credits project, step 2 — only awarded to a
      // real logged-in founder (currentUser here comes from User.me() above,
      // not the anonymous fallback), since anonymous/token-invited reviewers
      // have no profile to credit. Fire-and-forget: a credit-award failure
      // shouldn't block the thank-you flow the reviewer already sees.
      if (currentUser) {
        supabase.rpc('increment_insight_credits', { p_user_id: currentUser.id, p_amount: 3 })
          .then(() => setShowInsightAnimation(true))
          .catch((err) => console.error('Could not award Insight Credits:', err));
      }

      setTimeout(() => { if (onFeedbackSubmitted) onFeedbackSubmitted(); }, 2000);

    } catch (error) {
      console.error("Error submitting feedback:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // [FIX 020826] Part G.6 — redefined from the old Never Use/Confusing/Nice
  // To Have/Essential scale (which mixed desirability with an unrelated
  // clarity signal) to a single, coherent "importance" scale. The clarity
  // signal now lives separately in the "Hard to see in the mockup" toggle.
  const getImportance = (rating) => {
    if (rating <= 3) return { label: 'Unnecessary', color: 'text-red-600 bg-red-100' };
    if (rating <= 7) return { label: 'Somewhat Important', color: 'text-blue-600 bg-blue-100' };
    return { label: 'Critical', color: 'text-green-600 bg-green-100' };
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 px-3 sm:px-0">
      <Card className="shadow-2xl bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border-0 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white p-4 sm:p-6">
          <CardTitle className="text-xl sm:text-3xl font-bold text-center flex items-center justify-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            MVP Feature Feedback
          </CardTitle>
          <CardDescription className="text-purple-100 text-center text-sm sm:text-lg font-medium mt-2">
            Rate the features below to help this venture improve
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-8 bg-white">
          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
            {/* [ADDED 020826] Part G.6 — product-level question, shown first,
                before any per-feature rating (deliberately, to capture a
                general impression before feature-level details anchor it). */}
            <div className="bg-white border-2 border-indigo-200 rounded-2xl p-4 sm:p-6">
              <h3 className="text-base sm:text-xl font-bold text-gray-900 mb-1">
                Does the mockup succeed in capturing the idea and answering the need?
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 mb-4">Based on the problem and solution described above.</p>
              <div className="relative px-2">
                <Slider
                  value={[productScore ?? 0]}
                  onValueChange={(value) => setProductScore(value[0])}
                  max={10} min={0} step={1}
                  className="w-full [&_span:first-child]:bg-indigo-200 [&_span:first-child]:h-1 [&_span:nth-child(2)]:bg-indigo-600 [&_span:nth-child(3)]:bg-gray-700 data-[state=active]:ring-2 data-[state=active]:ring-gray-700/50"
                />
                <div className="flex justify-between items-center mt-3">
                  <span className="text-sm font-semibold text-gray-500">0</span>
                  <span className="text-lg sm:text-2xl font-bold text-indigo-600">{productScore ?? '—'}</span>
                  <span className="text-sm font-semibold text-gray-500">10</span>
                </div>
              </div>
              {/* [ADDED 020826] Optional follow-up, only shown below the
                  threshold — can always be skipped, per this session's
                  decision ("can't force it"). */}
              {productScore !== null && productScore < PRODUCT_SCORE_THRESHOLD && (
                <div className="mt-4">
                  <label className="text-sm font-medium text-gray-700">
                    How would you improve it to better match the problem and solution described? <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <textarea
                    value={productNote}
                    onChange={(e) => setProductNote(e.target.value)}
                    placeholder="Share what would make this more convincing..."
                    className="w-full mt-2 border border-gray-300 rounded-lg p-3 text-sm min-h-[80px]"
                  />
                </div>
              )}
            </div>

            {/* Category Headers */}
            {/* [FIX 020826] Part G.6 — reduced from 4 bands to 3, matching
                the redefined importance scale (getImportance above). */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              {[
                { label: 'Unnecessary', range: '0-3', from: 'from-red-500', to: 'to-red-600', text: 'text-red-600' },
                { label: 'Somewhat Important', range: '4-7', from: 'from-blue-500', to: 'to-blue-600', text: 'text-blue-600' },
                { label: 'Critical', range: '8-10', from: 'from-green-500', to: 'to-green-600', text: 'text-green-600' },
              ].map(c => (
                <div key={c.label} className="text-center">
                  <div className={`bg-gradient-to-r ${c.from} ${c.to} text-white px-2 py-2 sm:px-4 sm:py-3 rounded-xl font-bold shadow-lg text-xs sm:text-base leading-tight`}>{c.label}</div>
                  <div className={`text-[10px] sm:text-xs ${c.text} mt-1 sm:mt-2 font-semibold`}>{c.range}</div>
                </div>
              ))}
            </div>

            {/* Features */}
            {selectedFeatures.map((feature) => (
              <div key={feature.id} className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-4 sm:p-6 shadow-lg border-2 border-gray-200 hover:border-indigo-300 transition-all duration-300">
                <div className="flex items-center justify-between gap-2 mb-4 sm:mb-6">
                  <div className="min-w-0">
                    <h3 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">{feature.featureName}</h3>
                    {/* [ADDED 020826] Part G.6 follow-up — the short
                        value-prop description set at feature-definition time
                        (mvp-development/page.jsx), shown here in small text
                        under the large name so reviewers rate something
                        meaningful, not a bare label. */}
                    {feature.description && (
                      <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{feature.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                    <span className="text-xl sm:text-3xl font-bold text-indigo-600">
                      {feedbackData[feature.id] !== undefined ? feedbackData[feature.id] : '—'}
                    </span>
                    {feedbackData[feature.id] !== undefined && (
                      <div className={`px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap ${getImportance(feedbackData[feature.id]).color}`}>
                        {getImportance(feedbackData[feature.id]).label}
                      </div>
                    )}
                  </div>
                </div>
                <div className="relative px-2">
                  {/* [FIX 020826] The slider thumb extends slightly past the
                      track's edges at min/max values — combined with the
                      outer Card's overflow-hidden and tighter mobile padding,
                      this was clipping the thumb on small screens. This px-2
                      wrapper gives it room without touching the Card itself. */}
                  <Slider
                    value={[feedbackData[feature.id] !== undefined ? feedbackData[feature.id] : 0]}
                    onValueChange={(value) => handleRatingChange(feature.id, value)}
                    max={10} min={0} step={1}
                    className="w-full [&_span:first-child]:bg-indigo-200 [&_span:first-child]:h-1 [&_span:nth-child(2)]:bg-indigo-600 [&_span:nth-child(3)]:bg-gray-700 data-[state=active]:ring-2 data-[state=active]:ring-gray-700/50"
                  />
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-sm font-semibold text-gray-500">0</span>
                    <span className="text-[10px] sm:text-xs text-gray-400 italic">← Drag or click to rate →</span>
                    <span className="text-sm font-semibold text-gray-500">10</span>
                  </div>
                </div>
                {/* [ADDED 020826] Part G.6 — lightweight clarity signal,
                    replacing what would otherwise have been a second full
                    rating axis. */}
                <label className="flex items-center gap-2 mt-4 text-sm text-gray-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={Boolean(hardToSeeMap[feature.id])}
                    onChange={(e) => setHardToSeeMap(prev => ({ ...prev, [feature.id]: e.target.checked }))}
                    className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  Hard to see in the mockup
                </label>
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

            {/* [ADDED 020826] Follower checkbox — extended to MVP this
                session (originally MLP-only). Only shown if the reviewer is
                actually logged in — handled below via currentUser check at
                submit time, but the checkbox itself is harmless to show to
                everyone; the save is simply skipped for anonymous
                reviewers. */}
            <label className="flex items-start gap-2 text-sm text-gray-600 cursor-pointer select-none border border-gray-200 rounded-lg p-3">
              <input
                type="checkbox"
                checked={wantsToFollow}
                onChange={(e) => setWantsToFollow(e.target.checked)}
                disabled={isSubmitting}
                className="w-4 h-4 mt-0.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>
                <span className="font-medium text-gray-800">Want to keep contributing to this venture?</span>
                <br />
                <span className="text-xs text-gray-400">(You may be invited for future feedback rounds or Beta testing — that's up to the founder.)</span>
              </span>
            </label>

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
                  disabled={isSubmitting || productScore === null || Object.keys(feedbackData).length === 0}
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
      {showInsightAnimation && (
        <InsightEarnedAnimation onComplete={() => setShowInsightAnimation(false)} />
      )}
    </div>
  );
}
