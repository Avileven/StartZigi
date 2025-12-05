"use client";
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Venture } from '@/api/entities.js';
import { User } from '@/api/entities.js';
import { VentureMessage } from '@/api/entities.js';
import { BusinessPlan } from '@/api/entities.js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Lightbulb, Target, Users, TrendingUp, CheckCircle, Eye, HandCoins } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createPageUrl } from '@/utils';
import MentorButton from '@/components/mentor/MentorButton.jsx';
import MentorModal from '@/components/mentor/MentorModal';

export default function VenturePitchPage() {
    const [venture, setVenture] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [pitchData, setPitchData] = useState({
        tagline: '',
        problem: '',
        solution: '',
        market: '',
        team: '',
        vision: '',
        the_ask: '',
    });
    const [mentorModal, setMentorModal] = useState({
        isOpen: false,
        sectionId: '',
        sectionTitle: '',
        fieldKey: ''
    });
    const router = useRouter();

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const currentUser = await User.me();
            const ventures = await Venture.filter({ created_by: currentUser.email }, "-created_date");
            if (ventures.length > 0) {
                const currentVenture = ventures[0];
                setVenture(currentVenture);
                
                const businessPlans = await BusinessPlan.filter({ venture_id: currentVenture.id });
                const businessPlan = businessPlans.length > 0 ? businessPlans[0] : null;

                setPitchData(prev => ({
                    ...prev,
                    ...(currentVenture.pitch_data || {}),
                    problem: currentVenture.pitch_data?.problem || currentVenture.problem || '',
                    solution: currentVenture.pitch_data?.solution || currentVenture.solution || '',
                    market: currentVenture.pitch_data?.market || businessPlan?.market_size || '',
                    team: currentVenture.pitch_data?.team || businessPlan?.entrepreneur_background || '',
                    vision: currentVenture.pitch_data?.vision || '',
                    the_ask: currentVenture.pitch_data?.the_ask || businessPlan?.funding_requirements || '',
                }));
            }
        } catch (error) {
            console.error("Error loading venture data:", error);
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const openMentorModal = (sectionId, sectionTitle, fieldKey) => {
        setMentorModal({
            isOpen: true,
            sectionId,
            sectionTitle,
            fieldKey
        });
    };

    const closeMentorModal = () => {
        setMentorModal({ isOpen: false, sectionId: '', sectionTitle: '', fieldKey: '' });
    };

    const handleMentorUpdate = (newValue) => {
        if (mentorModal.fieldKey) {
            handleDataChange(mentorModal.fieldKey, newValue);
        }
    };

    const handleDataChange = (field, value) => {
        setPitchData(prev => ({ ...prev, [field]: value }));
    };

    const isSectionComplete = (field) => {
        return pitchData[field]?.trim().length > 0;
    };

    const completionPercentage = useMemo(() => {
        const fields = ['tagline', 'problem', 'solution', 'market', 'team', 'vision', 'the_ask'];
        const filledFields = fields.filter(field => pitchData[field]?.trim());
        return (filledFields.length / fields.length) * 100;
    }, [pitchData]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await Venture.update(venture.id, { pitch_data: pitchData });
            alert('Pitch progress saved!');
        } catch (error) {
            console.error("Error saving pitch:", error);
            alert("Failed to save pitch.");
        }
        setIsSaving(false);
    };

    const handleFinalizePitch = async () => {
        setIsSubmitting(true);
        try {
            const updatedPitchData = { ...pitchData, is_finalized: true };
            
            await Venture.update(venture.id, { 
                pitch_data: updatedPitchData,
                pitch_created: true 
            });

            // Send message about VC Marketplace being available
            await VentureMessage.create({
                venture_id: venture.id,
                message_type: 'system',
                title: '🏢 Pitch Finalized - VC Marketplace Now Available!',
                content: 'Excellent! Your investor pitch is now complete and professional. You can now access the VC Marketplace in the navigation to connect with top-tier venture capital firms and start seeking investment.',
                phase: venture.phase,
                priority: 4
            });

            setPitchData(updatedPitchData);
            alert('Pitch finalized successfully!');
            navigate(createPageUrl('Dashboard'));
        } catch (error) {
            console.error("Error finalizing pitch:", error);
            alert("Failed to finalize pitch.");
        }
        setIsSubmitting(false);
    };

    if (isLoading) {
        return <div className="p-8">Loading...</div>;
    }

    if (!venture) {
        return <div className="p-8">Create a venture to build your pitch deck.</div>;
    }
    
    const isComplete = venture.pitch_created;

    return (
        <>
            <div className="bg-gray-50 p-4 md:p-8 min-h-screen">
                <div className="max-w-4xl mx-auto">
                    <header className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Venture Pitch Deck Builder</h1>
                        <p className="text-gray-600">Craft a compelling narrative for investors. Fill out each section to complete your deck.</p>
                    </header>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2">
                                      {isSectionComplete('tagline') && <CheckCircle className="w-5 h-5 text-green-500" />}
                                      <Lightbulb className="text-yellow-500" /> 
                                      The Big Idea
                                    </CardTitle>
                                    <MentorButton onClick={() => openMentorModal('pitch_tagline', 'Pitch Tagline', 'tagline')} />
                                </div>
                                <CardDescription>A one-sentence summary of your venture.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Label htmlFor="tagline">Tagline</Label>
                                <Input 
                                  id="tagline" 
                                  value={pitchData.tagline} 
                                  onChange={(e) => handleDataChange('tagline', e.target.value)} 
                                  placeholder="e.g., The AI-powered personal finance coach for millennials." 
                                  readOnly={isComplete}
                                />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2">
                                      {(isSectionComplete('problem') && isSectionComplete('solution')) && <CheckCircle className="w-5 h-5 text-green-500" />}
                                      <Target className="text-red-500" /> 
                                      Problem & Solution
                                    </CardTitle>
                                    <MentorButton onClick={() => openMentorModal('pitch_problem_solution', 'Problem & Solution', null)} />
                                </div>
                                <CardDescription>What significant problem are you solving, and how?</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="problem">The Problem</Label>
                                    <Textarea 
                                      id="problem" 
                                      value={pitchData.problem} 
                                      onChange={(e) => handleDataChange('problem', e.target.value)} 
                                      placeholder="Describe the customer's pain point." 
                                      className="h-24" 
                                      readOnly={isComplete}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="solution">Your Solution</Label>
                                    <Textarea 
                                      id="solution" 
                                      value={pitchData.solution} 
                                      onChange={(e) => handleDataChange('solution', e.target.value)} 
                                      placeholder="Explain how your product or service solves this problem." 
                                      className="h-24" 
                                      readOnly={isComplete}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2">
                                      {isSectionComplete('market') && <CheckCircle className="w-5 h-5 text-green-500" />}
                                      <TrendingUp className="text-green-500" /> 
                                      Market Opportunity
                                    </CardTitle>
                                    <MentorButton onClick={() => openMentorModal('pitch_market', 'Market Opportunity', 'market')} />
                                </div>
                                <CardDescription>Describe your target market and its size.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Label htmlFor="market">Market Analysis</Label>
                                <Textarea 
                                  id="market" 
                                  value={pitchData.market} 
                                  onChange={(e) => handleDataChange('market', e.target.value)} 
                                  placeholder="Who are your customers? How big is the market (TAM, SAM, SOM)?" 
                                  className="h-24" 
                                  readOnly={isComplete}
                                />
                            </CardContent>
                        </Card>
                        
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2">
                                      {isSectionComplete('team') && <CheckCircle className="w-5 h-5 text-green-500" />}
                                      <Users className="text-blue-500" /> 
                                      The Team
                                    </CardTitle>
                                    <MentorButton onClick={() => openMentorModal('pitch_team', 'The Team', 'team')} />
                                </div>
                                <CardDescription>Why are you the right people to build this?</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Label htmlFor="team">Team Background</Label>
                                <Textarea 
                                  id="team" 
                                  value={pitchData.team} 
                                  onChange={(e) => handleDataChange('team', e.target.value)} 
                                  placeholder="Highlight relevant experience and expertise of the founding team." 
                                  className="h-24" 
                                  readOnly={isComplete}
                                />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2">
                                      {isSectionComplete('vision') && <CheckCircle className="w-5 h-5 text-green-500" />}
                                      <Eye className="text-purple-500" /> 
                                      Our Vision
                                    </CardTitle>
                                    <MentorButton onClick={() => openMentorModal('pitch_vision', 'Our Vision', 'vision')} />
                                </div>
                                <CardDescription>What is the long-term vision and ultimate impact of your venture?</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Label htmlFor="vision">Vision Statement</Label>
                                <Textarea 
                                  id="vision" 
                                  value={pitchData.vision} 
                                  onChange={(e) => handleDataChange('vision', e.target.value)} 
                                  placeholder="Describe the future you are trying to create." 
                                  className="h-24" 
                                  readOnly={isComplete}
                                />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2">
                                      {isSectionComplete('the_ask') && <CheckCircle className="w-5 h-5 text-green-500" />}
                                      <HandCoins className="text-teal-500" /> 
                                      The Ask
                                    </CardTitle>
                                    <MentorButton onClick={() => openMentorModal('pitch_ask', 'The Ask', 'the_ask')} />
                                </div>
                                <CardDescription>How much are you raising, and how will you use the funds?</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Label htmlFor="the_ask">Funding Ask</Label>
                                <Textarea 
                                  id="the_ask" 
                                  value={pitchData.the_ask} 
                                  onChange={(e) => handleDataChange('the_ask', e.target.value)} 
                                  placeholder="Specify the investment amount and a brief breakdown of how it will be allocated." 
                                  className="h-24" 
                                  readOnly={isComplete}
                                />
                            </CardContent>
                        </Card>
                    </div>
                    
                     {!isComplete && (
                        <div className="mt-8 flex justify-end gap-4">
                            <Button 
                                variant="outline" 
                                onClick={handleSave} 
                                disabled={isSaving || isSubmitting}>
                                {isSaving ? 'Saving...' : 'Save Draft'}
                            </Button>
                            <Button 
                                onClick={handleFinalizePitch}
                                disabled={isSaving || isSubmitting || completionPercentage < 100}>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                {isSubmitting ? 'Finalizing...' : 'Finalize Pitch'}
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            <MentorModal
                isOpen={mentorModal.isOpen}
                onClose={closeMentorModal}
                sectionId={mentorModal.sectionId}
                sectionTitle={mentorModal.sectionTitle}
                fieldValue={pitchData[mentorModal.fieldKey]}
                onUpdateField={handleMentorUpdate}
            />
        </>
    );
}
