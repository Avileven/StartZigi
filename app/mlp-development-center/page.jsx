// 080326 v with colors and public remark
"use client";
import React, { useState, useEffect } from 'react';
import { Venture } from '@/api/entities.js';
import { MVPFeatureFeedback } from '@/api/entities.js';
import { SuggestedFeature } from '@/api/entities.js';
import { User } from '@/api/entities.js';
import { VentureMessage } from '@/api/entities.js';
import { ProductFeedback as ProductFeedbackEntity } from '@/api/entities.js';
import { UploadFile } from '@/api/integrations';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx';
import { Loader2, Upload, FileText, Heart, Sparkles, TrendingUp, Users, Target, CheckCircle, ExternalLink, Info, Globe } from 'lucide-react';
import { useRouter } from 'next/navigation';
import MentorButton from '@/components/mentor/MentorButton.jsx';
import MentorModal from '@/components/mentor/MentorModal';
import StaticGuidanceViewer from '@/components/mentor/StaticGuidanceViewer';

export default function MLPDevelopmentCenter() {
  const [venture, setVenture] = useState(null);
  const [mvpFeedback, setMvpFeedback] = useState([]);
  const [suggestedFeatures, setSuggestedFeatures] = useState([]);
  const [mlpData, setMlpData] = useState({
    feedback_analysis: '',
    enhancement_strategy: '',
    wow_moments: '',
    user_journey: '',
    ui_ux_requirements: '',
    technical_excellence: '',
    visual_mockups: '',
    prototype_description: '',
    uploaded_files: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [toast, setToast] = useState(null);
  const [missingFields, setMissingFields] = useState([]);
  const [staticGuidanceModal, setStaticGuidanceModal] = useState({
    isOpen: false,
    sectionId: ''
  });
  const [mentorModal, setMentorModal] = useState({
    isOpen: false,
    sectionId: '',
    sectionTitle: '',
    fieldKey: ''
  });
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      try {
        const user = await User.me();
        const ventures = await Venture.filter({ created_by: user.email }, "-created_date");
        if (ventures.length > 0) {
          const currentVenture = ventures[0];
          setVenture(currentVenture);
          const feedback = await MVPFeatureFeedback.filter({ venture_id: currentVenture.id });
          setMvpFeedback(feedback);
          const suggestions = await SuggestedFeature.filter({ venture_id: currentVenture.id });
          setSuggestedFeatures(suggestions);
          if (currentVenture.mlp_data) {
            setMlpData(currentVenture.mlp_data);
          } else if (currentVenture.mlp_development_data) {
            setMlpData(currentVenture.mlp_development_data);
          }
        }
      } catch (error) {
        console.error("Error loading data:", error);
      }
      setIsLoading(false);
    };
    loadData();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Autosave every 30 seconds
  useEffect(() => {
    if (!venture) return;
    const interval = setInterval(async () => {
      try {
        await Venture.update(venture.id, { mlp_data: mlpData });
        showToast('Auto-saved', 'success');
      } catch (e) {}
    }, 30000);
    return () => clearInterval(interval);
  }, [venture, mlpData]);

  const handleInputChange = (field, value) => {
    setMlpData(prev => ({ ...prev, [field]: value }));
  };

  const openMentorModal = (sectionId, sectionTitle, fieldKey) => {
    setMentorModal({
      isOpen: true,
      sectionId,
      sectionTitle,
      fieldKey
    });
  };

  const closeMentorModal = () => {
    setMentorModal({
      isOpen: false,
      sectionId: '',
      sectionTitle: '',
      fieldKey: ''
    });
  };

  const handleMentorUpdate = (newValue) => {
    if (mentorModal.fieldKey) {
      setMlpData(prev => ({ ...prev, [mentorModal.fieldKey]: newValue }));
    }
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    setIsUploading(true);
    try {
      const uploadPromises = files.map(async (file) => {
        const result = await UploadFile({ file });
        return {
          name: file.name,
          url: result.file_url,
        };
      });
      const uploadedFiles = await Promise.all(uploadPromises);
      setMlpData(prev => ({
        ...prev,
        uploaded_files: uploadedFiles
      }));
      if (files.length > 0) {
        alert(`${files.length} file(s) uploaded successfully! Previous files have been replaced.`);
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Error uploading files. Please try again.');
    }
    setIsUploading(false);
  };

  const handleRemoveFile = (fileIndex) => {
    setMlpData(prev => ({
      ...prev,
      uploaded_files: prev.uploaded_files.filter((_, index) => index !== fileIndex)
    }));
  };

  const handleSaveDraft = async () => {
    if (!venture) return;
    setIsSaving(true);
    try {
      await Venture.update(venture.id, { mlp_data: mlpData });
      showToast('Draft saved successfully!');
    } catch (error) {
      console.error("Error saving draft:", error);
      showToast('Error saving draft. Please try again.', 'error');
    }
    setIsSaving(false);
  };

  const handleComplete = async () => {
    if (!venture) return;
    const missing = [];
    if (!mlpData.feedback_analysis.trim()) missing.push('Feedback Analysis');
    if (!mlpData.enhancement_strategy.trim()) missing.push('Enhancement Strategy');
    if (!mlpData.wow_moments.trim()) missing.push('"Wow" Moments');
    if (!mlpData.user_journey.trim()) missing.push('User Journey');
    if (!mlpData.ui_ux_requirements.trim()) missing.push('UI/UX Requirements');
    if (!mlpData.technical_excellence.trim()) missing.push('Technical Excellence');
    if (!mlpData.visual_mockups.trim()) missing.push('Visual Mockups');
    if (!mlpData.prototype_description.trim()) missing.push('Prototype Description');
    if (mlpData.uploaded_files.length === 0) missing.push('Uploaded Files');
    if (missing.length > 0) {
      setMissingFields(missing);
      showToast(`Please complete: ${missing.join(', ')}`, 'error');
      return;
    }
    setMissingFields([]);
    setIsCompleting(true);
    try {
      // Check how many MLP feedback responses exist
      const feedbacks = await ProductFeedbackEntity.filter({ venture_id: venture.id });
      const feedbackCount = feedbacks.length;

      if (feedbackCount < 10) {
        // Save MLP as completed but don't move to beta yet
        await Venture.update(venture.id, {
          mlp_development_completed: true,
          mlp_completed: true,
          mlp_data: mlpData,
        });

        // [CHANGED] removed mlp_feedback_message_sent column (does not exist in DB).
        // [ADDED] check if message already exists in venture_messages to avoid duplicates.
        const existingFeedbackMsg = await VentureMessage.filter({
          venture_id: venture.id,
          title: '🎉 MLP Complete — Now Collect Feedback!'
        });
        if (existingFeedbackMsg.length === 0) {
          await VentureMessage.create({
            venture_id: venture.id,
            message_type: 'action_required',
            title: '🎉 MLP Complete — Now Collect Feedback!',
            content: `Great work completing your MLP! Before moving to Beta, you need to collect feedback from at least 10 visitors. You currently have ${feedbackCount}. Share your MLP page using the Promotion Center and come back when you have 10 responses.`,
            phase: 'mlp',
            priority: 5
          });
        }

        showToast(`MLP saved! You need ${10 - feedbackCount} more feedback responses before moving to Beta.`, 'error');
        router.push(createPageUrl('Dashboard'));
      } else {
        // 10+ feedbacks — move to beta
        await Venture.update(venture.id, {
          mlp_development_completed: true,
          mlp_completed: true,
          mlp_data: mlpData,
          phase: 'beta'
        });
        await VentureMessage.create({
          venture_id: venture.id,
          message_type: 'phase_complete',
          title: '🎉 MLP Phase Complete!',
          content: `Congratulations! You completed your MLP and collected ${feedbackCount} feedback responses. You are now entering the Beta phase! Next: complete your Venture Pitch to unlock the VC Marketplace.`,
          phase: 'mlp',
          priority: 4
        });
        await VentureMessage.create({
          venture_id: venture.id,
          message_type: 'phase_welcome',
          title: '🧪 Welcome to Beta Testing!',
          content: `It's time to get real users! Set up your beta testing page and start gathering sign-ups.`,
          phase: 'beta',
          priority: 3
        });
        showToast('MLP Complete! You have moved to the Beta phase.');
        router.push(createPageUrl('Dashboard'));
      }
    } catch (error) {
      console.error("Error completing MLP:", error);
      showToast('There was an error completing your MLP. Please try again.', 'error');
    }
    setIsCompleting(false);
  };

  const calculateFeedbackStats = () => {
    if (mvpFeedback.length === 0) return [];
    const featureStats = {};
    mvpFeedback.forEach(fb => {
      if (!featureStats[fb.feature_name]) {
        featureStats[fb.feature_name] = { ratings: [], count: 0 };
      }
      featureStats[fb.feature_name].ratings.push(fb.rating);
      featureStats[fb.feature_name].count++;
    });
    const summary = Object.entries(featureStats).map(([name, data]) => {
      const avgRating = data.ratings.reduce((a, b) => a + b, 0) / data.count;
      let category = '';
      if (avgRating >= 0 && avgRating <= 2) category = 'Never use';
      else if (avgRating >= 3 && avgRating <= 4) category = 'Confusing';
      else if (avgRating >= 5 && avgRating <= 7) category = 'Nice To Have';
      else if (avgRating >= 8 && avgRating <= 10) category = 'Essential';
      let recommendation = '';
      if (avgRating <= 4) recommendation = 'Remove';
      else if (avgRating <= 7) recommendation = 'Keep & Polish';
      else recommendation = 'Keep & Enhance';
      return { name, avgRating: avgRating.toFixed(1), category, recommendation, responses: data.count };
    });
    return summary;
  };

  const getFileDisplay = (fileName, fileUrl) => {
    const extension = fileName.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension)) {
      return (
        <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
          <img src={fileUrl} alt={fileName} className="w-10 h-10 object-cover rounded-md border border-gray-200" />
          <span className="text-blue-600 hover:underline">{fileName}</span>
        </a>
      );
    } else if (extension === 'pdf') {
      return (
        <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-2">
          <FileText className="w-5 h-5 text-red-600" />
          {fileName}
        </a>
      );
    } else if (['html', 'htm'].includes(extension)) {
      return (
        <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-2">
          <ExternalLink className="w-5 h-5 text-green-600" />
          {fileName}
        </a>
      );
    } else {
      return (
        <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-2">
          <FileText className="w-5 h-5 text-gray-600" />
          {fileName}
        </a>
      );
    }
  };

  const completionPct = React.useMemo(() => {
    const fields = [mlpData.feedback_analysis, mlpData.enhancement_strategy, mlpData.wow_moments, mlpData.user_journey, mlpData.ui_ux_requirements, mlpData.technical_excellence, mlpData.visual_mockups, mlpData.prototype_description];
    const filesOk = mlpData.uploaded_files.length > 0 ? 1 : 0;
    const completed = fields.filter(f => f && f.trim()).length + filesOk;
    return Math.round((completed / 9) * 100);
  }, [mlpData]);

  const feedbackStats = calculateFeedbackStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!venture) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-600">Please create a venture first.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-xl shadow-lg text-white font-medium transition-all ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
          {toast.message}
        </div>
      )}

      <div className="p-4 md:p-8 bg-gradient-to-br from-gray-50 to-purple-50 min-h-screen">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2">MLP Development Center</h1>
            <p className="text-lg text-gray-600">Transform your MVP into a Minimum Lovable Product</p>
          </div>

          {/* Intro paragraph */}
          <div className="mb-8 p-6 bg-white rounded-2xl border border-purple-100 shadow-sm">
            <p className="text-gray-700 leading-relaxed">
              <span className="font-bold text-purple-700">Well done on reaching this stage! 🎉</span>
              <br /><br />
              The MVP phase was your first step — you built the skeleton of your product and proved it can work. Now it's time to make it lovable.
              <br /><br />
              The MLP phase is about precision: refining your product based on real user feedback, sharpening the experience, and building the moments that make users say "I can't live without this." Less about adding features, more about getting the details right.
            </p>
          </div>

          {/* Progress bar */}
          <div className="mb-6 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-gray-700">Overall Completion</span>
              <span className="text-sm font-bold text-purple-700">{completionPct}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3">
              <div className="bg-gradient-to-r from-pink-500 to-purple-600 h-3 rounded-full transition-all duration-500" style={{ width: `${completionPct}%` }} />
            </div>
          </div>

          <Tabs defaultValue="phase1" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="phase1" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Phase 1: Feedback</TabsTrigger>
              <TabsTrigger value="phase2" className="data-[state=active]:bg-pink-600 data-[state=active]:text-white">Phase 2: Experience</TabsTrigger>
              <TabsTrigger value="phase3" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">Phase 3: Visualization</TabsTrigger>
              <TabsTrigger value="phase4" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">Phase 4: Review</TabsTrigger>
            </TabsList>

            <TabsContent value="phase1" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-indigo-700">
                    <Target className="w-5 h-5 text-indigo-600" />
                    1.1 Analyze Your MVP Feedback
                    <div className="ml-auto flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setStaticGuidanceModal({ isOpen: true, sectionId: 'mlp_feedback_analysis' })}
                        className="flex items-center gap-1 text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                      >
                        <Info className="w-4 h-4" />
                        Tips
                      </Button>
                      <MentorButton
                        onClick={() => openMentorModal('mlp_feedback_analysis', 'Feedback Analysis', 'feedback_analysis')}
                      />
                    </div>
                  </CardTitle>
                  <CardDescription>Review the feedback collected from your MVP users</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {feedbackStats && feedbackStats.length > 0 ? (
                    <div>
                      <h3 className="font-semibold mb-3">MVP Feature Feedback Summary</h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>MVP Feature</TableHead>
                            <TableHead>Avg Rating</TableHead>
                            <TableHead>User Perception</TableHead>
                            <TableHead>Responses</TableHead>
                            <TableHead>Recommendation</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {feedbackStats.map((stat, idx) => (
                            <TableRow key={idx}>
                              <TableCell className="font-medium">{stat.name}</TableCell>
                              <TableCell>{stat.avgRating}</TableCell>
                              <TableCell><Badge>{stat.category}</Badge></TableCell>
                              <TableCell>{stat.responses}</TableCell>
                              <TableCell><Badge variant="outline">{stat.recommendation}</Badge></TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <p className="text-gray-500">No MVP feedback collected yet.</p>
                  )}
                  {suggestedFeatures.length > 0 && (
                    <div className="mt-6">
                      <h3 className="font-semibold mb-3">User-Suggested Features</h3>
                      <ul className="space-y-2">
                        {suggestedFeatures.map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                            <Sparkles className="w-4 h-4 text-blue-500" />
                            <span>{feature.feature_name}</span>
                            {feature.user_email && <span className="text-xs text-gray-500">- by {feature.user_email}</span>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="mt-6">
                    <Label htmlFor="feedback_analysis">Feedback Analysis Summary <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5 ml-1"><Globe className="w-3 h-3" /> Visible on public MLP page</span></Label>
                    <Textarea
                      id="feedback_analysis"
                      value={mlpData.feedback_analysis}
                      onChange={(e) => handleInputChange('feedback_analysis', e.target.value)}
                      placeholder="Summarize the key insights from your MVP feedback. What did users love? What frustrated them? What features had high/low engagement?"
                      className="h-40 mt-2"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-indigo-700">
                    <TrendingUp className="w-5 h-5 text-indigo-600" />
                    1.2 Define MLP Enhancement Strategy
                    <div className="ml-auto flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setStaticGuidanceModal({ isOpen: true, sectionId: 'mlp_enhancement_strategy' })}
                        className="flex items-center gap-1 text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                      >
                        <Info className="w-4 h-4" />
                        Tips
                      </Button>
                      <MentorButton
                        onClick={() => openMentorModal('mlp_enhancement_strategy', 'Enhancement Strategy', 'enhancement_strategy')}
                      />
                    </div>
                  </CardTitle>
                  <CardDescription>For each feature you're keeping, define what needs to be FIXED, POLISHED, and ADDED</CardDescription>
                </CardHeader>
                <CardContent>
                  <Label htmlFor="enhancement_strategy">Enhancement Strategy <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5 ml-1"><Globe className="w-3 h-3" /> Visible on public MLP page</span></Label>
                  <Textarea
                    id="enhancement_strategy"
                    value={mlpData.enhancement_strategy}
                    onChange={(e) => handleInputChange('enhancement_strategy', e.target.value)}
                    placeholder="For each MVP feature: What needs to be FIXED? (bugs, performance). What needs to be POLISHED? (better UI, clearer messaging). What needs to be ADDED? (small delightful enhancements)."
                    className="h-40 mt-2"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-yellow-500" />
                    1.3 Identify "Wow" Moments to Add
                    <div className="ml-auto flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setStaticGuidanceModal({ isOpen: true, sectionId: 'mlp_wow_moments' })}
                        className="flex items-center gap-1 text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                      >
                        <Info className="w-4 h-4" />
                        Tips
                      </Button>
                      <MentorButton
                        onClick={() => openMentorModal('mlp_wow_moments', '"Wow" Moments', 'wow_moments')}
                      />
                    </div>
                  </CardTitle>
                  <CardDescription>What small features will surprise and delight users?</CardDescription>
                </CardHeader>
                <CardContent>
                  <Label htmlFor="wow_moments">"Wow" Moments & Delight Factors <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5 ml-1"><Globe className="w-3 h-3" /> Visible on public MLP page</span></Label>
                  <Textarea
                    id="wow_moments"
                    value={mlpData.wow_moments}
                    onChange={(e) => handleInputChange('wow_moments', e.target.value)}
                    placeholder="Examples: keyboard shortcuts, smart defaults, congratulations on achievements, undo functionality, dark mode, personalized recommendations, etc."
                    className="h-32 mt-2"
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="phase2" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-pink-700">
                    <Users className="w-5 h-5 text-pink-600" />
                    2.1 User Journey Map
                    <div className="ml-auto flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setStaticGuidanceModal({ isOpen: true, sectionId: 'mlp_user_journey' })}
                        className="flex items-center gap-1 text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                      >
                        <Info className="w-4 h-4" />
                        Tips
                      </Button>
                      <MentorButton
                        onClick={() => openMentorModal('mlp_user_journey', 'User Journey Map', 'user_journey')}
                      />
                    </div>
                  </CardTitle>
                  <CardDescription>Define the user experience from awareness to advocacy</CardDescription>
                </CardHeader>
                <CardContent>
                  <Label htmlFor="user_journey">User Journey (Awareness → Onboarding → First Use → Regular Use → Advocacy) <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5 ml-1"><Globe className="w-3 h-3" /> Visible on public MLP page</span></Label>
                  <Textarea
                    id="user_journey"
                    value={mlpData.user_journey}
                    onChange={(e) => handleInputChange('user_journey', e.target.value)}
                    placeholder="For each stage: What does the user experience? How should they feel? What makes it 'lovable'?"
                    className="h-40 mt-2"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-pink-700">
                    2.2 UI/UX Requirements
                    <div className="ml-auto flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setStaticGuidanceModal({ isOpen: true, sectionId: 'mlp_ui_ux' })}
                        className="flex items-center gap-1 text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                      >
                        <Info className="w-4 h-4" />
                        Tips
                      </Button>
                      <MentorButton
                        onClick={() => openMentorModal('mlp_ui_ux', 'UI/UX Requirements', 'ui_ux_requirements')}
                      />
                    </div>
                  </CardTitle>
                  <CardDescription>Visual design, interaction design, and delight factors</CardDescription>
                </CardHeader>
                <CardContent>
                  <Label htmlFor="ui_ux_requirements">UI/UX Requirements</Label>
                  <Textarea
                    id="ui_ux_requirements"
                    value={mlpData.ui_ux_requirements}
                    onChange={(e) => handleInputChange('ui_ux_requirements', e.target.value)}
                    placeholder="Visual Design: consistent design system, high-quality visuals, responsive, accessible. Interaction Design: smooth animations, intuitive navigation, clear CTAs. Delight Factors: micro-interactions, personalization, celebrations."
                    className="h-40 mt-2"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-pink-700">
                    2.3 Technical Excellence
                    <div className="ml-auto flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setStaticGuidanceModal({ isOpen: true, sectionId: 'mlp_technical' })}
                        className="flex items-center gap-1 text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                      >
                        <Info className="w-4 h-4" />
                        Tips
                      </Button>
                      <MentorButton
                        onClick={() => openMentorModal('mlp_technical', 'Technical Excellence', 'technical_excellence')}
                      />
                    </div>
                  </CardTitle>
                  <CardDescription>Fast, bug-free, secure, and smooth</CardDescription>
                </CardHeader>
                <CardContent>
                  <Label htmlFor="technical_excellence">Technical Excellence Goals</Label>
                  <Textarea
                    id="technical_excellence"
                    value={mlpData.technical_excellence}
                    onChange={(e) => handleInputChange('technical_excellence', e.target.value)}
                    placeholder="Fast load times (<3s), no critical bugs, works offline (if applicable), data security, smooth performance"
                    className="h-32 mt-2"
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="phase3" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-700">
                    <FileText className="w-5 h-5 text-green-600" />
                    3.1 Visual Mockups
                    <div className="ml-auto flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setStaticGuidanceModal({ isOpen: true, sectionId: 'mlp_visual_mockups' })}
                        className="flex items-center gap-1 text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                      >
                        <Info className="w-4 h-4" />
                        Tips
                      </Button>
                      <MentorButton
                        onClick={() => openMentorModal('mlp_visual_mockups', 'Visual Mockups', 'visual_mockups')}
                      />
                    </div>
                  </CardTitle>
                  <CardDescription>Describe your high-fidelity designs</CardDescription>
                </CardHeader>
                <CardContent>
                  <Label htmlFor="visual_mockups">Visual Mockups Description</Label>
                  <Textarea
                    id="visual_mockups"
                    value={mlpData.visual_mockups}
                    onChange={(e) => handleInputChange('visual_mockups', e.target.value)}
                    placeholder="Describe your landing page, onboarding flow, core feature screens, key user flows, empty/error/success states."
                    className="h-32 mt-2"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-700">
                    3.2 Interactive Prototype
                    <div className="ml-auto flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setStaticGuidanceModal({ isOpen: true, sectionId: 'mlp_prototype' })}
                        className="flex items-center gap-1 text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                      >
                        <Info className="w-4 h-4" />
                        Tips
                      </Button>
                      <MentorButton
                        onClick={() => openMentorModal('mlp_prototype', 'Interactive Prototype', 'prototype_description')}
                      />
                    </div>
                  </CardTitle>
                  <CardDescription>Describe your clickable prototype</CardDescription>
                </CardHeader>
                <CardContent>
                  <Label htmlFor="prototype_description">Prototype Description</Label>
                  <Textarea
                    id="prototype_description"
                    value={mlpData.prototype_description}
                    onChange={(e) => handleInputChange('prototype_description', e.target.value)}
                    placeholder="Describe your interactive prototype: main user flows, realistic data, branding, key animations. Tools: Figma, InVision, etc."
                    className="h-32 mt-2"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="w-5 h-5 text-green-600" />
                    3.3 Upload MLP Files
                  </CardTitle>
                  <CardDescription>Upload mockups, prototypes, demo videos, or any visual assets. New uploads will replace previous files. <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5 ml-1"><Globe className="w-3 h-3" /> Shown on public MLP page</span></CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-5 rounded-xl border-2 border-purple-200 mb-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                        <ExternalLink className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-purple-800">Create your prototype with ZigForge</p>
                        <p className="text-sm text-purple-600">Build a visual prototype of your MLP before uploading</p>
                      </div>
                    </div>
                    <a href={createPageUrl('zigforge')} target="_blank" rel="noopener noreferrer">
                      <Button type="button" className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Open ZigForge Studio
                      </Button>
                    </a>
                  </div>
                  <div>
                    <Label htmlFor="mlp_files">MLP Visual Assets</Label>
                    <Input
                      id="mlp_files"
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      disabled={isUploading}
                      className="mt-2"
                    />
                    {isUploading && <p className="text-sm text-gray-500 mt-2">Uploading files...</p>}
                    <p className="text-xs text-gray-500 mt-1">Note: New uploads will replace all previous files</p>
                  </div>
                  {mlpData.uploaded_files && mlpData.uploaded_files.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Uploaded Files</h4>
                      <div className="space-y-2">
                        {mlpData.uploaded_files.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            {getFileDisplay(file.name, file.url)}
                            <Button variant="ghost" size="sm" onClick={() => handleRemoveFile(index)}>Remove</Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="phase4" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    MLP Development Summary
                  </CardTitle>
                  <CardDescription>Review your MLP development before submitting</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-sm text-gray-600">Feedback Analysis</h4>
                      <p className="text-sm">{mlpData.feedback_analysis ? '✓ Completed' : '✗ Not completed'}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-gray-600">Enhancement Strategy</h4>
                      <p className="text-sm">{mlpData.enhancement_strategy ? '✓ Completed' : '✗ Not completed'}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-gray-600">"Wow" Moments</h4>
                      <p className="text-sm">{mlpData.wow_moments ? '✓ Completed' : '✗ Not completed'}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-gray-600">User Journey</h4>
                      <p className="text-sm">{mlpData.user_journey ? '✓ Completed' : '✗ Not completed'}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-gray-600">UI/UX Requirements</h4>
                      <p className="text-sm">{mlpData.ui_ux_requirements ? '✓ Completed' : '✗ Not completed'}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-gray-600">Technical Excellence</h4>
                      <p className="text-sm">{mlpData.technical_excellence ? '✓ Completed' : '✗ Not completed'}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-gray-600">Visual Mockups</h4>
                      <p className="text-sm">{mlpData.visual_mockups ? '✓ Completed' : '✗ Not completed'}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-gray-600">Prototype Description</h4>
                      <p className="text-sm">{mlpData.prototype_description ? '✓ Completed' : '✗ Not completed'}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-gray-600">Uploaded Files</h4>
                      <p className="text-sm">{mlpData.uploaded_files.length > 0 ? `✓ ${mlpData.uploaded_files.length} files` : '✗ No files'}</p>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 mt-6">
                    <Button variant="outline" onClick={handleSaveDraft} disabled={isSaving}>
                      {isSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : 'Save Draft'}
                    </Button>
                    <Button onClick={handleComplete} disabled={isCompleting} className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700">
                      {isCompleting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Completing...</> : 'Complete MLP Development'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <StaticGuidanceViewer
        isOpen={staticGuidanceModal.isOpen}
        onClose={() => setStaticGuidanceModal({ isOpen: false, sectionId: '' })}
        sectionId={staticGuidanceModal.sectionId}
      />

      <MentorModal
        isOpen={mentorModal.isOpen}
        onClose={closeMentorModal}
        sectionId={mentorModal.sectionId}
        sectionTitle={mentorModal.sectionTitle}
        fieldValue={mlpData[mentorModal.fieldKey]}
        onUpdateField={handleMentorUpdate}
      />
    </>
  );
}

