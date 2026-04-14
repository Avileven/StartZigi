//90326
"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { Venture } from '@/api/entities.js';
import { VentureMessage } from '@/api/entities.js'; // Keep for potential future use if phase transition is re-added
import { User } from '@/api/entities.js';
import { supabase } from '@/lib/supabase';
import { UploadFile } from '@/api/integrations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input.jsx';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'; // New import for Tabs
import { Rocket, Users, Lock, Lightbulb, Sparkles, Upload, Trash2, Loader2, CheckCircle, ArrowRight, ArrowLeft, Award, Gift, Zap, ThumbsUp, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createPageUrl } from '@/utils';
import MentorButton from "@/components/mentor/MentorButton";
import MentorModal from "@/components/mentor/MentorModal";
import StaticGuidanceViewer from "@/components/mentor/StaticGuidanceViewer";

const benefitIcons = {
    Rocket,
    Users,
    Lock,
    Lightbulb,
    Sparkles,
    Award,
    Gift,
    Zap,
    ThumbsUp,
};

const MIN_HEADLINE_LENGTH = 20;
const MIN_DESCRIPTION_LENGTH = 50;

export default function BetaDevelopment() {
    const [venture, setVenture] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const router = useRouter();

    const [betaData, setBetaData] = useState({
        headline: '',
        description: '',
        benefits: [
            { icon: 'Sparkles', title: '', description: '' },
        ],
        featured_demo: null,
        user_acquisition_strategy: '',
        feedback_collection_strategy: '',
        social_links: {
            linkedin: '',
            twitter: '',
            instagram: '',
            website: '',
        },
        logo_url: '',
    });
    const [userPlan, setUserPlan] = useState(null);

    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const [mentorModal, setMentorModal] = useState({
        isOpen: false,
        sectionId: '',
        sectionTitle: '',
        fieldKey: '',
        fieldValue: ''
    });

    const [staticGuidanceModal, setStaticGuidanceModal] = useState({
        isOpen: false,
        sectionId: ''
    });

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const user = await User.me();
            const { data: profile } = await supabase.from('user_profiles').select('plan').eq('id', user.id).single();
            if (profile) setUserPlan(profile.plan);
            const ventures = await Venture.filter({ created_by: user.email }, "-created_date");
            if (ventures.length > 0) {
                const currentVenture = ventures[0];
                setVenture(currentVenture);
                if (currentVenture.beta_data) {
                    // Ensure benefits array is not empty
                    const loadedBetaData = { ...currentVenture.beta_data };
                    if (!loadedBetaData.benefits || loadedBetaData.benefits.length === 0) {
                        loadedBetaData.benefits = [{ icon: 'Sparkles', title: '', description: '' }];
                    }
                    // Initialize new fields if they don't exist in loaded data
                    loadedBetaData.user_acquisition_strategy = loadedBetaData.user_acquisition_strategy || '';
                    loadedBetaData.feedback_collection_strategy = loadedBetaData.feedback_collection_strategy || '';
                    loadedBetaData.logo_url = loadedBetaData.logo_url || '';
                    loadedBetaData.social_links = {
                        linkedin: loadedBetaData.social_links?.linkedin || '',
                        twitter: loadedBetaData.social_links?.twitter || '',
                        instagram: loadedBetaData.social_links?.instagram || '',
                        website: loadedBetaData.social_links?.website || '',
                    };

                    setBetaData(prev => ({ ...prev, ...loadedBetaData }));
                }
            }
        } catch (error) {
            console.error("Error loading venture:", error);
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Autosave every 30 seconds
    useEffect(() => {
        if (!venture) return;
        const interval = setInterval(async () => {
            try {
                await Venture.update(venture.id, { beta_data: betaData });
                showToast('Auto-saved', 'success');
            } catch (e) {}
        }, 30000);
        return () => clearInterval(interval);
    }, [venture, betaData]);

    const openMentorModal = (sectionId, sectionTitle, fieldKey) => {
        let fieldValue = fieldKey ? betaData[fieldKey] || '' : '';
        if (sectionId === 'beta_benefits') {
            // For benefits, pass the stringified array for the mentor to analyze
            fieldValue = JSON.stringify(betaData.benefits.filter(b => b.title || b.description), null, 2);
        }

        setMentorModal({
            isOpen: true,
            sectionId,
            sectionTitle,
            fieldKey,
            fieldValue: fieldValue
        });
    };

    const closeMentorModal = () => {
        setMentorModal({
            isOpen: false,
            sectionId: '',
            sectionTitle: '',
            fieldKey: '',
            fieldValue: ''
        });
    };

    const handleMentorUpdate = (newValue) => {
        if (mentorModal.fieldKey) {
            setBetaData(prev => ({ ...prev, [mentorModal.fieldKey]: newValue }));
        }
    };

    // Renamed from handleInputChange to handleChange
    const handleChange = (field, value) => {
        setBetaData(prev => ({ ...prev, [field]: value }));
    };

    const handleBenefitChange = (index, field, value) => {
        const newBenefits = [...betaData.benefits];
        newBenefits[index] = { ...newBenefits[index], [field]: value };
        setBetaData(prev => ({ ...prev, benefits: newBenefits }));
    };

    const addBenefit = () => {
        setBetaData(prev => ({
            ...prev,
            benefits: [...prev.benefits, { icon: 'Sparkles', title: '', description: '' }]
        }));
    };

    const removeBenefit = (index) => {
        if (betaData.benefits.length > 1) {
            setBetaData(prev => ({
                ...prev,
                benefits: prev.benefits.filter((_, i) => i !== index)
            }));
        }
    };

    const handleFileUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setIsUploading(true);
        try {
            const file = files[0];
            const result = await UploadFile({ file });
            
            const fileExt = file.name.split('.').pop().toLowerCase();
            const isHTML = ['html', 'htm'].includes(fileExt);
            const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(fileExt);

            let demoData = {};

            if (isHTML) {
                try {
                    const response = await fetch(result.file_url);
                    if (!response.ok) {
                        throw new Error(`Failed to fetch HTML: ${response.status}`);
                    }
                    const htmlContent = await response.text();
                    
                    demoData = {
                        type: 'html',
                        name: file.name,
                        url: result.file_url,
                        htmlContent: htmlContent
                    };
                } catch (fetchError) {
                    console.error('Error fetching HTML content from URL:', fetchError);
                    alert('Uploaded HTML file but failed to load content from its URL. The file may not be accessible publicly or there was a network error.');
                    demoData = {
                        type: 'html',
                        name: file.name,
                        url: result.file_url,
                        htmlContent: '<p>Error loading interactive content. Please check the file\'s accessibility or try again.</p>'
                    };
                }
            } else if (isImage) {
                demoData = {
                    type: 'image',
                    name: file.name,
                    url: result.file_url
                };
            } else {
                demoData = {
                    type: 'other',
                    name: file.name,
                    url: result.file_url
                };
            }

            setBetaData(prev => ({
                ...prev,
                featured_demo: demoData
            }));

            showToast('File uploaded successfully!');
        } catch (error) {
            console.error('Error uploading file:', error);
            showToast('Error uploading file. Please try again.', 'error');
        }
        setIsUploading(false);
    };

    const removeFeaturedDemo = () => {
        setBetaData(prev => ({ ...prev, featured_demo: null }));
    };

    // Renamed from handleSaveAndPublish to handleSave
    const handleSave = async () => {
        if (!venture) return;

        setIsSaving(true);
        try {
            await Venture.update(venture.id, {
                beta_data: betaData,
                // Removed the phase transition logic for this change.
                // The venture.phase will not automatically change to 'beta' upon saving beta_data.
                // It will remain in its current phase until explicitly changed elsewhere.
            });

            // Send beta requirements message only once (first save)
            const existingMsg = await VentureMessage.filter({
                venture_id: venture.id,
                title: '📊 Beta Phase Requirements'
            });
            if (existingMsg.length === 0) {
                await VentureMessage.create({
                    venture_id: venture.id,
                    message_type: 'system',
                    title: '📊 Beta Phase Requirements',
                    content: `Congrats! Your beta page is now live. Your goal is to sign up 50 beta testers to move to the Growth phase. Use the Promotion Center to reach more potential testers!`,
                    phase: 'beta',
                    priority: 3
                });
            }

            // Send Venture Pitch nudge only once
            const existingPitchMsg = await VentureMessage.filter({
                venture_id: venture.id,
                title: '🎤 Complete Your Venture Pitch!'
            });
            if (existingPitchMsg.length === 0) {
                await VentureMessage.create({
                    venture_id: venture.id,
                    message_type: 'action_required',
                    title: '🎤 Complete Your Venture Pitch!',
                    content: `Your beta page is live! Next step: complete your Venture Pitch to unlock the VC Marketplace and start raising funding.`,
                    phase: 'beta',
                    priority: 4
                });
            }

            showToast("Beta configuration saved!");
            router.push(createPageUrl("Dashboard")); // Navigate back after saving
        } catch (error) {
            console.error("Error saving beta data:", error);
            showToast("Error saving. Please try again.", "error");
        }
        setIsSaving(false);
    };

    const canSave = () => {
        const headlineComplete = betaData.headline.trim().length >= MIN_HEADLINE_LENGTH;
        const descriptionComplete = betaData.description.trim().length >= MIN_DESCRIPTION_LENGTH;
        // Benefits and demo are optional for saving
        // User acquisition and feedback strategy are also optional fields for saving
        return headlineComplete && descriptionComplete;
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (!venture) {
        return (
            <div className="p-8 text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">No Venture Found</h1>
                <p className="text-gray-600">Please create a venture first to access this page.</p>
            </div>
        );
    }

    const isHeadlineComplete = betaData.headline.trim().length >= MIN_HEADLINE_LENGTH;
    const isDescriptionComplete = betaData.description.trim().length >= MIN_DESCRIPTION_LENGTH;
    const areBenefitsFilled = betaData.benefits.every(b => b.title.trim() && b.description.trim());
    const isDemoUploaded = !!betaData.featured_demo;

    const completionPct = (() => {
        const fields = [betaData.headline, betaData.description, betaData.user_acquisition_strategy, betaData.feedback_collection_strategy];
        const filled = fields.filter(f => f && f.trim().length > 0).length;
        const benefitsFilled = betaData.benefits.some(b => b.title.trim() && b.description.trim()) ? 1 : 0;
        const demoFilled = betaData.featured_demo ? 1 : 0;
        return Math.round(((filled + benefitsFilled + demoFilled) / 6) * 100);
    })();

    return (
        <>
            {/* Toast */}
            {toast && (
                <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-xl shadow-lg text-white font-medium transition-all ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
                    {toast.message}
                </div>
            )}

            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-8">
                <div className="max-w-4xl mx-auto space-y-6">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Rocket className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">Beta Development Center</h1>
                        <p className="text-gray-600 mt-2">Configure your public beta testing page to attract early users.</p>
                    </div>

                    {/* Intro */}
                    <div className="p-6 bg-white rounded-2xl border border-blue-100 shadow-sm">
                        <p className="text-gray-700 leading-relaxed">
                            <span className="font-bold text-blue-700">You've made it to Beta! 🚀</span>
                            <br /><br />
                            This page is <strong>not your product</strong> — it's your <strong>beta sign-up page</strong>. Its job is to attract early users, convince them to join your beta program, and collect their sign-ups. The more compelling it is, the more testers you'll attract.
                            <br /><br />
                            You need <strong>50 beta sign-ups</strong> to move to the Growth phase. Use the Promotion Center to share this page.
                        </p>
                    </div>

                    {/* Progress bar */}
                    <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-semibold text-gray-700">Page Completion</span>
                            <span className="text-sm font-bold text-blue-700">{completionPct}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-3">
                            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-500" style={{ width: `${completionPct}%` }} />
                        </div>
                    </div>

                    <Tabs defaultValue="content" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="content" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Page Content</TabsTrigger>
                            <TabsTrigger value="benefits" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Benefits</TabsTrigger>
                            <TabsTrigger value="demo" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">Featured Demo</TabsTrigger>
                        </TabsList>

                        <TabsContent value="content" className="space-y-6">
                            <Card className="shadow-lg">
                                <CardHeader>
                                    <CardTitle>Configure Your Beta Testing Page</CardTitle>
                                    <CardDescription>
                                        This is the public-facing page to attract beta testers. Make it compelling and clear.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <Label htmlFor="headline">Page Headline</Label>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setStaticGuidanceModal({ isOpen: true, sectionId: 'beta_page_setup' })}
                                                    className="flex items-center gap-1 text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                                                >
                                                    <Info className="w-4 h-4" />
                                                    Tips
                                                </Button>
                                                <MentorButton
                                                    onClick={() => openMentorModal('beta_page_setup', 'Beta Page Headline', 'headline')}
                                                />
                                            </div>
                                        </div>
                                        <Input
                                            id="headline"
                                            value={betaData.headline}
                                            onChange={(e) => handleChange('headline', e.target.value)}
                                            placeholder="e.g., The Future of [Your Industry]. Join Our Private Beta."
                                        />
                                        <div className="mt-1 flex items-center gap-2">
                                            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                <div className={`h-full rounded-full transition-all ${betaData.headline.trim().length >= MIN_HEADLINE_LENGTH ? 'bg-green-500' : 'bg-blue-400'}`} style={{ width: `${Math.min((betaData.headline.trim().length / MIN_HEADLINE_LENGTH) * 100, 100)}%` }} />
                                            </div>
                                            <span className={`text-xs ${betaData.headline.trim().length >= MIN_HEADLINE_LENGTH ? 'text-green-600' : 'text-gray-400'}`}>{betaData.headline.trim().length}/{MIN_HEADLINE_LENGTH}</span>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <Label htmlFor="description">Page Description</Label>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setStaticGuidanceModal({ isOpen: true, sectionId: 'beta_page_setup' })}
                                                    className="flex items-center gap-1 text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                                                >
                                                    <Info className="w-4 h-4" />
                                                    Tips
                                                </Button>
                                                <MentorButton
                                                    onClick={() => openMentorModal('beta_page_setup', 'Beta Page Description', 'description')}
                                                />
                                            </div>
                                        </div>
                                        <Textarea
                                            id="description"
                                            value={betaData.description}
                                            onChange={(e) => handleChange('description', e.target.value)}
                                            placeholder="Briefly describe your product and why someone should join the beta program."
                                            className="h-24"
                                        />
                                        <div className="mt-1 flex items-center gap-2">
                                            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                <div className={`h-full rounded-full transition-all ${betaData.description.trim().length >= MIN_DESCRIPTION_LENGTH ? 'bg-green-500' : 'bg-blue-400'}`} style={{ width: `${Math.min((betaData.description.trim().length / MIN_DESCRIPTION_LENGTH) * 100, 100)}%` }} />
                                            </div>
                                            <span className={`text-xs ${betaData.description.trim().length >= MIN_DESCRIPTION_LENGTH ? 'text-green-600' : 'text-gray-400'}`}>{betaData.description.trim().length}/{MIN_DESCRIPTION_LENGTH}</span>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <Label htmlFor="user_acquisition_strategy">User Acquisition Strategy</Label>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setStaticGuidanceModal({ isOpen: true, sectionId: 'user_acquisition_strategy' })}
                                                    className="flex items-center gap-1 text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                                                >
                                                    <Info className="w-4 h-4" />
                                                    Tips
                                                </Button>
                                                <MentorButton
                                                    onClick={() => openMentorModal('user_acquisition_strategy', 'User Acquisition Strategy', 'user_acquisition_strategy')}
                                                />
                                            </div>
                                        </div>
                                        <Textarea
                                            id="user_acquisition_strategy"
                                            value={betaData.user_acquisition_strategy}
                                            onChange={(e) => handleChange('user_acquisition_strategy', e.target.value)}
                                            placeholder="Describe how you plan to attract beta testers (e.g., social media, communities, ads)..."
                                            className="h-32"
                                        />
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <Label htmlFor="feedback_collection_strategy">Feedback Collection Strategy</Label>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setStaticGuidanceModal({ isOpen: true, sectionId: 'feedback_collection' })}
                                                    className="flex items-center gap-1 text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                                                >
                                                    <Info className="w-4 h-4" />
                                                    Tips
                                                </Button>
                                                <MentorButton
                                                    onClick={() => openMentorModal('feedback_collection', 'Feedback Collection Strategy', 'feedback_collection_strategy')}
                                                />
                                            </div>
                                        </div>
                                        <Textarea
                                            id="feedback_collection_strategy"
                                            value={betaData.feedback_collection_strategy}
                                            onChange={(e) => handleChange('feedback_collection_strategy', e.target.value)}
                                            placeholder="Explain how you'll collect and analyze beta user feedback (e.g., surveys, interviews, analytics)..."
                                            className="h-32"
                                        />
                                    </div>

                                    {/* Brand & Social Links — Unicorn only */}
                                    <div className="border-t pt-6 mt-2">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-sm font-semibold text-gray-700">Brand & Social Links</h3>
                                            <span className="text-[10px] font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Unicorn only</span>
                                        </div>
                                        <p className="text-xs text-gray-400 mb-4">Optional — will appear on your public beta page.</p>
                                        <div className={`space-y-4 ${userPlan !== 'unicorn' ? 'opacity-40 pointer-events-none select-none' : ''}`}>
                                            <div>
                                                <label className="text-xs font-medium text-gray-600 block mb-1">Logo URL</label>
                                                <Input
                                                    placeholder="https://yourdomain.com/logo.png"
                                                    value={betaData.logo_url || ''}
                                                    onChange={e => setBetaData(prev => ({ ...prev, logo_url: e.target.value }))}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-medium text-gray-600 block mb-1">LinkedIn</label>
                                                <Input
                                                    placeholder="https://linkedin.com/company/yourventure"
                                                    value={betaData.social_links?.linkedin || ''}
                                                    onChange={e => setBetaData(prev => ({ ...prev, social_links: { ...prev.social_links, linkedin: e.target.value } }))}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-medium text-gray-600 block mb-1">Twitter / X</label>
                                                <Input
                                                    placeholder="https://twitter.com/yourventure"
                                                    value={betaData.social_links?.twitter || ''}
                                                    onChange={e => setBetaData(prev => ({ ...prev, social_links: { ...prev.social_links, twitter: e.target.value } }))}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-medium text-gray-600 block mb-1">Instagram</label>
                                                <Input
                                                    placeholder="https://instagram.com/yourventure"
                                                    value={betaData.social_links?.instagram || ''}
                                                    onChange={e => setBetaData(prev => ({ ...prev, social_links: { ...prev.social_links, instagram: e.target.value } }))}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-medium text-gray-600 block mb-1">Website</label>
                                                <Input
                                                    placeholder="https://yourventure.com"
                                                    value={betaData.social_links?.website || ''}
                                                    onChange={e => setBetaData(prev => ({ ...prev, social_links: { ...prev.social_links, website: e.target.value } }))}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="benefits" className="space-y-6">
                            <Card className="shadow-lg">
                                <CardHeader>
                                    <div className="flex justify-between items-center">
                                        <CardTitle className="flex items-center gap-2">
                                            {areBenefitsFilled && <CheckCircle className="w-5 h-5 text-green-500" />}
                                            Beta Benefits
                                        </CardTitle>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setStaticGuidanceModal({ isOpen: true, sectionId: 'beta_benefits' })}
                                                className="flex items-center gap-1 text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                                            >
                                                <Info className="w-4 h-4" />
                                                Tips
                                            </Button>
                                            <MentorButton onClick={() => openMentorModal('beta_benefits', 'Beta Program Benefits', null)} />
                                        </div>
                                    </div>
                                    <CardDescription>
                                        Highlight the key benefits users get from joining your beta program. For each, write a title, description, and choose an icon.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {betaData.benefits.map((benefit, index) => (
                                            <Card key={index} className="bg-gray-50">
                                                <CardContent className="p-4">
                                                    <div className="flex items-start gap-4">
                                                        <Select value={benefit.icon} onValueChange={(value) => handleBenefitChange(index, 'icon', value)}>
                                                            <SelectTrigger className="w-36">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent className="z-[9999] bg-white border border-gray-200 shadow-xl">
                                                                <SelectItem value="Sparkles">✨ Sparkles</SelectItem>
                                                                <SelectItem value="Rocket">🚀 Rocket</SelectItem>
                                                                <SelectItem value="Users">👥 Users</SelectItem>
                                                                <SelectItem value="Lock">🔒 Lock</SelectItem>
                                                                <SelectItem value="Lightbulb">💡 Lightbulb</SelectItem>
                                                                <SelectItem value="Award">🏆 Award</SelectItem>
                                                                <SelectItem value="Gift">🎁 Gift</SelectItem>
                                                                <SelectItem value="Zap">⚡️ Zap</SelectItem>
                                                                <SelectItem value="ThumbsUp">👍 Thumbs Up</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <div className="flex-1 space-y-2">
                                                            <Input
                                                                value={benefit.title}
                                                                onChange={(e) => handleBenefitChange(index, 'title', e.target.value)}
                                                                placeholder="Benefit title"
                                                            />
                                                            <Textarea
                                                                value={benefit.description}
                                                                onChange={(e) => handleBenefitChange(index, 'description', e.target.value)}
                                                                placeholder="Benefit description"
                                                                className="h-16"
                                                            />
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => removeBenefit(index)}
                                                            disabled={betaData.benefits.length === 1}
                                                        >
                                                            <Trash2 className="w-4 h-4 text-red-500" />
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                        <Button onClick={addBenefit} variant="outline" className="w-full">
                                            Add Benefit
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="demo" className="space-y-6">
                            <Card className="shadow-lg">
                                <CardHeader>
                                    <div className="flex justify-between items-center">
                                        <CardTitle className="flex items-center gap-2">
                                            {isDemoUploaded && <CheckCircle className="w-5 h-5 text-green-500" />}
                                            Featured Demo
                                        </CardTitle>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setStaticGuidanceModal({ isOpen: true, sectionId: 'beta_featured_demo' })}
                                                className="flex items-center gap-1 text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                                            >
                                                <Info className="w-4 h-4" />
                                                Tips
                                            </Button>
                                            <MentorButton onClick={() => openMentorModal('beta_featured_demo', 'Featured Demo', null)} />
                                        </div>
                                    </div>
                                    <CardDescription>
                                        Upload a demo image or HTML prototype to showcase your product (optional)
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {!betaData.featured_demo ? (
                                        <div className="space-y-4">
                                            <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-5 rounded-xl border-2 border-purple-200">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                                                        <Sparkles className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-purple-800">Create a prototype with ZigForge</p>
                                                        <p className="text-sm text-purple-600">Build an HTML demo to showcase your product</p>
                                                    </div>
                                                </div>
                                                <a href={createPageUrl('zigforge')} target="_blank" rel="noopener noreferrer">
                                                    <Button type="button" className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
                                                        <Sparkles className="w-4 h-4 mr-2" />
                                                        Open ZigForge Studio
                                                    </Button>
                                                </a>
                                            </div>
                                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                                <Label htmlFor="demo-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500">
                                                    <span>Upload demo file</span>
                                                    <Input id="demo-upload" name="demo-upload" type="file" className="sr-only" onChange={handleFileUpload} accept="image/*,.html" disabled={isUploading} />
                                                </Label>
                                                <p className="text-xs text-gray-500 mt-1">PNG, JPG, or HTML files</p>
                                                {isUploading && <Loader2 className="w-5 h-5 animate-spin mx-auto mt-4" />}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                                                        {betaData.featured_demo.type === 'image' ? '🖼️' : '📄'}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{betaData.featured_demo.name}</p>
                                                        <p className="text-sm text-gray-500">
                                                            {betaData.featured_demo.type === 'image' ? 'Image Demo' :
                                                                betaData.featured_demo.type === 'html' ? 'Interactive Prototype' : 'File'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Button variant="ghost" size="icon" onClick={removeFeaturedDemo}>
                                                    <Trash2 className="w-4 h-4 text-red-500" />
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>

                    <div className="flex justify-between items-center pt-6">
                        <Button
                            variant="outline"
                            onClick={() => router.push(createPageUrl("Dashboard"))}
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Dashboard
                        </Button>

                        <div className="flex items-center gap-3">
                            {venture && (
                                <Button
                                    variant="outline"
                                    onClick={() => window.open(`/beta-testing?id=${venture.id}`, '_blank')}
                                    className="border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                                >
                                    <ArrowRight className="w-4 h-4 mr-2" />
                                    Preview Beta Page
                                </Button>
                            )}
                            <Button
                                onClick={handleSave}
                                disabled={!canSave() || isSaving}
                                className="bg-blue-600 hover:bg-blue-700"
                                size="lg"
                            >
                                {isSaving ? (
                                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
                                ) : (
                                    <>Save Beta Configuration<CheckCircle className="w-4 h-4 ml-2" /></>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <MentorModal
                isOpen={mentorModal.isOpen}
                onClose={closeMentorModal}
                sectionId={mentorModal.sectionId}
                sectionTitle={mentorModal.sectionTitle}
                fieldValue={mentorModal.fieldValue}
                onUpdateField={handleMentorUpdate}
            />
            <StaticGuidanceViewer
                isOpen={staticGuidanceModal.isOpen}
                onClose={() => setStaticGuidanceModal({ isOpen: false, sectionId: '' })}
                sectionId={staticGuidanceModal.sectionId}
            />
        </>
    );
}
