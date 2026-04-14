// beta-testing\300326
// FIXED 180226: Made page PUBLIC - no authentication required
// 
// HOW IT WORKS:
// - This is a PUBLIC beta sign-up page (not the actual product)
// - Users can register to become beta testers by providing name, email, and reason
// - Entrepreneur can share this page via Promotion Center to invite people to sign up
// - Access via: /beta-testing?id=venture_id (no token needed - just venture ID)
// - Registered users are saved to beta_testers table and shown in Product Feedback Center
// 
// PREVIOUS FIX (180226): Added missing required fields (id, created_date, updated_date, created_by) 
// to BetaTester.create() - fixed "null value in column created_by violates not-null constraint" error
"use client";
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase'; // For public access without auth
import { BetaTester } from '@/api/entities.js';
import { VentureMessage } from '@/api/entities.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input.jsx';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card.jsx';
import { Rocket, Lock, Users, Lightbulb, PartyPopper, Loader2, Sparkles } from 'lucide-react';

const defaultBenefits = [
  { icon: 'Rocket', title: 'Speed & Time-Saving', description: 'Experience a faster, more efficient way to accomplish your goals.' },
  { icon: 'Lock', title: 'Privacy & Security', description: 'Your data is protected with top-tier security measures.' },
  { icon: 'Users', title: 'Exclusive Community', description: 'Join a private community of beta testers to share feedback.' },
  { icon: 'Lightbulb', title: 'First Access', description: 'Be the first to try new features and influence development.' },
];

const benefitIcons = {
    Rocket,
    Lock,
    Users,
    Lightbulb,
    Sparkles,
};

export default function BetaTesting() {
  const [venture, setVenture] = useState(null);
  const [founderPlan, setFounderPlan] = useState(null);
  const [campaignId, setCampaignId] = useState(null);
  const [testerCount, setTesterCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ fullName: '', email: '', interest: '' });
  const [demoHtmlContent, setDemoHtmlContent] = useState(null);
  const formRef = useRef(null);
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const ventureId = urlParams.get('id');
        // [ADDED] Read campaign_id from URL — passed when user comes via In-App promotion.
        // Stored with the beta tester record to track which campaign drove the sign-up.
        // null if user arrived directly (manual share or email invite).
        const campaignId = urlParams.get('campaign') || null;
        setCampaignId(campaignId);
        
        if (ventureId) {
          // PUBLIC ACCESS: Fetch venture data without authentication
          // Using supabase directly instead of Venture.filter() which requires auth
          const { data: ventureData, error: ventureError } = await supabase
            .from('ventures')
            .select('*')
            .eq('id', ventureId)
            .single();
          
          if (ventureError) {
            console.error('Error fetching venture:', ventureError);
            setIsLoading(false);
            return;
          }
          
          // Fetch existing beta testers count (public data)
          const { data: testersData, error: testersError } = await supabase
            .from('beta_testers')
            .select('*')
            .eq('venture_id', ventureId);
          
          if (testersError) {
            console.error('Error fetching testers:', testersError);
          }
          
          if (ventureData) {
            setVenture(ventureData);
            setTesterCount(testersData?.length || 0);

            // Fetch founder's plan to determine if Pro badge should show
            if (ventureData.created_by_id) {
              const { data: founderProfile } = await supabase
                .from('user_profiles')
                .select('plan')
                .eq('id', ventureData.created_by_id)
                .single();
              if (founderProfile) setFounderPlan(founderProfile.plan);
            }
            
            const featuredDemo = ventureData.beta_data?.featured_demo;
            if (featuredDemo) {
              if (featuredDemo.type === 'html' && featuredDemo.htmlContent) {
                setDemoHtmlContent(featuredDemo.htmlContent);
              } else if (featuredDemo.type === 'html' && featuredDemo.url) {
                try {
                  const response = await fetch(featuredDemo.url);
                  if (response.ok) {
                    const htmlText = await response.text();
                    setDemoHtmlContent(htmlText);
                  }
                } catch (err) {
                  console.error('Failed to load HTML demo:', err);
                }
              }
            }
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email) {
      alert('Please fill in your name and email.');
      return;
    }
    setIsSubmitting(true);
    try {
      // FIX: Add all required fields for beta_testers table
      // Schema requires: id, created_date, updated_date, created_by (all NOT NULL)
      const now = new Date().toISOString();
      const newId = crypto.randomUUID();
      
      await BetaTester.create({
        // Required system fields
        id: newId,
        created_date: now,
        updated_date: now,
        created_by: formData.email,
        created_by_id: null,
        // Venture and tester data
        venture_id: venture.id,
        full_name: formData.fullName,
        email: formData.email,
        interest_reason: formData.interest || null,
        // [ADDED] campaign_id — links this sign-up to the promotion campaign that brought the user here.
        // null if user arrived directly (not via In-App campaign).
        // Used in promotion-report to count beta sign-ups per campaign.
        campaign_id: campaignId,
      });
      setSubmitted(true);
      
      // Update tester count (public access)
      const { data: updatedTesters } = await supabase
        .from('beta_testers')
        .select('*')
        .eq('venture_id', venture.id);
      
      const newTesterCount = updatedTesters?.length || 0;
      setTesterCount(newTesterCount);

      await VentureMessage.create({
        venture_id: venture.id,
        message_type: 'system',
        title: '🎉 New Beta Tester!',
        content: `You got a new beta tester! You now have ${newTesterCount}/50 sign-ups.`,
        phase: venture.phase,
        priority: 2
      });

      if (venture.phase === 'beta' && newTesterCount >= 50) {
        await Venture.update(venture.id, { phase: 'growth' });
        await VentureMessage.create({
            venture_id: venture.id,
            message_type: 'phase_complete',
            title: '🚀 Beta Phase Complete!',
            content: `Congratulations! You've hit 50 beta sign-ups and demonstrated significant user interest. You are now entering the Growth phase.`,
            phase: 'beta',
            priority: 4
        });
        await VentureMessage.create({
            venture_id: venture.id,
            message_type: 'phase_welcome',
            title: '📈 Welcome to Growth Phase!',
            content: `Time to scale! Focus on user acquisition, retention, and building sustainable growth channels.`,
            phase: 'growth',
            priority: 3
        });
      }

    } catch (error) {
      console.error("Submission error:", error);
      alert('There was an error submitting your request. Please try again.');
    }
    setIsSubmitting(false);
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!venture) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 text-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Venture Not Found</h1>
          <p className="text-gray-600">This beta testing page is not available.</p>
        </div>
      </div>
    );
  }

  const betaHeadline = venture.beta_data?.headline || `The application that will help you achieve more.`;
  const betaDescription = venture.beta_data?.description || `Be the first to experience ${venture.name}. Join our exclusive beta program and help shape the future of our application.`;
  const featuredDemo = venture.beta_data?.featured_demo;
  const benefits = venture.beta_data?.benefits || defaultBenefits;

  return (
    <div className="bg-gray-50 font-sans">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="relative grid md:grid-cols-2 gap-12 items-center mb-16">
          <div className="text-center md:text-left">
            {['pro_founder', 'unicorn'].includes(founderPlan) && (
              <div className="absolute top-4 left-4 flex items-center gap-1 bg-purple-50 border border-purple-200 text-purple-700 font-semibold px-3 py-1.5 rounded-full">
                <span className="text-[9px] text-purple-400 uppercase tracking-widest">StartZig</span>
                <span className="text-xs">Pro Founder</span>
              </div>
            )}
            <span className="inline-block bg-indigo-100 text-indigo-700 text-sm font-semibold px-3 py-1 rounded-full mb-4">
              {venture.name} Beta Program
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-4">
              {betaHeadline}
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              {betaDescription}
            </p>
            <Button size="lg" onClick={() => formRef.current?.scrollIntoView({ behavior: 'smooth' })}>
              Join the Beta
            </Button>
          </div>
          
          <div className="flex flex-col gap-4">
            {featuredDemo && featuredDemo.type === 'html' && demoHtmlContent ? (
              <div className="w-full border-2 border-gray-300 rounded-xl overflow-hidden shadow-2xl bg-white">
                <div className="bg-gray-800 px-4 py-2 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="flex-1 text-center">
                    <span className="text-xs text-gray-400">{venture.name} Beta</span>
                  </div>
                </div>
                <iframe
                  srcDoc={demoHtmlContent}
                  className="w-full h-[600px] border-0"
                  title={featuredDemo.name || 'Product Demo'}
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-popups-to-escape-sandbox allow-downloads allow-top-navigation"
                  loading="lazy"
                />
              </div>
            ) : featuredDemo && featuredDemo.type === 'image' ? (
              <div className="w-full border-2 border-gray-300 rounded-xl overflow-hidden shadow-2xl">
                <img src={featuredDemo.url} alt="Product preview" className="w-full h-auto"/>
              </div>
            ) : (
              <div className="w-full max-w-md bg-white border-2 border-gray-300 rounded-xl overflow-hidden shadow-2xl p-12 text-center">
                <Rocket className="w-24 h-24 text-indigo-500 mx-auto mb-6"/>
                <h2 className="text-3xl font-bold text-gray-800">{venture.name}</h2>
                <p className="text-gray-500 mt-2">Beta Version</p>
              </div>
            )}

            {/* Social links — only shown if founder filled them in */}
            {venture.beta_data?.social_links && Object.values(venture.beta_data.social_links).some(v => v) && (
              <div className="w-full max-w-md bg-white border border-gray-200 rounded-xl p-4">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Stay connected</p>
                <div className="flex flex-wrap gap-2">
                  {venture.beta_data.social_links.linkedin && (
                    <a href={venture.beta_data.social_links.linkedin} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs font-medium rounded-lg px-3 py-1.5 transition-colors"
                      style={{background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE'}}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
                      LinkedIn
                    </a>
                  )}
                  {venture.beta_data.social_links.twitter && (
                    <a href={venture.beta_data.social_links.twitter} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs font-medium rounded-lg px-3 py-1.5 transition-colors"
                      style={{background: '#F1F5F9', color: '#0F172A', border: '1px solid #CBD5E1'}}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                      X
                    </a>
                  )}
                  {venture.beta_data.social_links.instagram && (
                    <a href={venture.beta_data.social_links.instagram} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs font-medium rounded-lg px-3 py-1.5 transition-colors"
                      style={{background: '#FDF2F8', color: '#9D174D', border: '1px solid #FBCFE8'}}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>
                      Instagram
                    </a>
                  )}
                  {venture.beta_data.social_links.website && (
                    <a href={venture.beta_data.social_links.website} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs font-medium rounded-lg px-3 py-1.5 transition-colors"
                      style={{background: '#F0FDF4', color: '#166534', border: '1px solid #BBF7D0'}}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                      Website
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="my-24">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Why Should You Join?</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefitIcons[benefit.icon];
              return (
                <div key={index} className="text-center p-6 bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-full mx-auto mb-4">
                    {Icon && <Icon className="w-6 h-6 text-indigo-600" />}
                  </div>
                  <h3 className="font-semibold text-lg text-gray-800 mb-2">{benefit.title}</h3>
                  <p className="text-gray-600 text-sm">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div ref={formRef} className="max-w-2xl mx-auto">
          <Card className="shadow-2xl">
            <CardContent className="p-8 md:p-12">
              {submitted ? (
                <div className="text-center">
                  <PartyPopper className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900">You're on the list!</h2>
                  <p className="text-gray-600 mt-2">Thank you for joining the beta program for {venture.name}. We'll be in touch soon with next steps.</p>
                </div>
              ) : (
                <>
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900">Become a Beta Tester</h2>
                    <p className="text-gray-600 mt-2">Influence the development and receive special benefits at launch.</p>
                  </div>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input id="fullName" value={formData.fullName} onChange={handleInputChange} required />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" value={formData.email} onChange={handleInputChange} required />
                    </div>
                    <div>
                      <Label htmlFor="interest">Why are you interested in joining?</Label>
                      <Textarea id="interest" value={formData.interest} onChange={handleInputChange} />
                    </div>
                    <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                      {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting...</> : 'Join Now'}
                    </Button>
                  </form>
                  <p className="text-center text-sm text-gray-500 mt-6 font-semibold">
                    {testerCount > 0 && `Already ${testerCount} ${testerCount === 1 ? 'person' : 'people'} joined!`}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}