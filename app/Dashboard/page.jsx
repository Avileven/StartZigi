"use client";
import { supabase } from '@/lib/supabase';
import React, { useState, useEffect, useCallback } from "react";
// תיקון: הוסרה src/ מכל הייבואות של entities.
import { Venture } from "@/api/entities";
import { VentureMessage } from "@/api/entities";
import { User } from "@/api/entities";
import { PromotionCampaign } from "@/api/entities";
import { BetaTester } from "@/api/entities";
// תיקון: הוסרה סיומת .js מיותרת
import { VCFirm } from '@/api/entities';
import { FundingEvent } from '@/api/entities';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
// ... שאר הייבואות ...
import Link from "next/link";
import {
  Calendar,
  DollarSign,
  TrendingUp,
  Clock,
  Wallet,
  Users,
  MessageSquare,
  Heart,
  X,
  Lightbulb,
  FileText,
  Rocket,
  Plus,
  Briefcase,
  CheckCircle,
  ExternalLink,
  UserPlus,
  BarChart3,
  BookOpen,
  MessagesSquare,
  Repeat,
  ShieldCheck,
  FlaskConical,
  Zap,
  Brain,
  PhoneForwarded,
  Code,
  Sparkles,
  Megaphone
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import VCMeetingModal from '@/components/vc/VCMeetingModal';
import { VCFirm } from '@/api/entities.js';
import { FundingEvent } from '@/api/entities.js';
import VCAdvancedMeetingModal from '@/components/vc/VCAdvancedMeetingModal';

// Helper function to create page URLs
const createPageUrl = (path) => `/${path}`;

const PHASES_ORDER = ["idea", "business_plan", "mvp", "mlp", "beta", "growth", "ma"];

const RejectionDetailsModal = ({ isOpen, onClose, details }) => {
  if (!isOpen) return null;
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Investment Committee Feedback</DialogTitle>
          <DialogDescription>
            The following feedback was provided by the investment committee during their review.
          </DialogDescription>
        </DialogHeader>
        <div className="prose prose-sm max-w-none max-h-96 overflow-y-auto p-4 bg-gray-50 rounded-md">
          <pre className="whitespace-pre-wrap font-sans">{details}</pre>
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default function Dashboard() {
  const [ventures, setVentures] = useState([]);
  const [currentVenture, setCurrentVenture] = useState(null);
  const [messages, setMessages] = useState([]);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showToS, setShowToS] = useState(false);
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [isAdvancedMeetingModalOpen, setIsAdvancedMeetingModalOpen] = useState(false);
  const [selectedVCFirm, setSelectedVCFirm] = useState(null);
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const [showRejectionDetails, setShowRejectionDetails] = useState(false);
  const [rejectionDetailsContent, setRejectionDetailsContent] = useState('');
  const [cofounderExpanded, setCofounderExpanded] = useState(false);
  const router = useRouter();

  const updateBurnRate = useCallback(async (venture) => {
    if (!venture.monthly_burn_rate || venture.monthly_burn_rate === 0) return;

    const lastBurn = venture.last_burn_deduction ? new Date(venture.last_burn_deduction) : new Date(venture.created_date);
    const daysSinceLastBurn = differenceInDays(new Date(), lastBurn);
    const DAILY_BURN_RATE = venture.monthly_burn_rate / 30;

    if (daysSinceLastBurn >= 7) {
      const weeksToDeduct = Math.floor(daysSinceLastBurn / 7);
      const totalDeduction = (DAILY_BURN_RATE * 7) * weeksToDeduct;

      const newCapital = Math.max(0, venture.virtual_capital - totalDeduction);
      await Venture.update(venture.id, {
        virtual_capital: newCapital,
        last_burn_deduction: new Date().toISOString().split('T')[0]
      });

      setCurrentVenture(prev => ({
        ...prev,
        virtual_capital: newCapital,
      }));

      if (newCapital < 5000 && venture.virtual_capital >= 5000) {
        await VentureMessage.create({
            venture_id: venture.id,
            message_type: 'system',
            title: '⚠️ Low Balance Alert!',
            content: `Your virtual capital has dropped below $5,000. It's crucial to secure funding soon to avoid running out of money.`,
            phase: venture.phase,
            priority: 4
        });
      }
    }
  }, []);

  const loadDashboard = useCallback(async () => {
    try {
      const currentUser = await User.me();
      
      if (!currentUser) {
        router.push('/login');
        return;
      }
      
      setUser(currentUser);

      if (!currentUser.accepted_tos_date) {
        setShowToS(true);
      } else {
        const adminSelectedVentureId = localStorage.getItem('admin_selected_venture_id');
        let userVentures = [];
        
        if (adminSelectedVentureId && currentUser.role === 'admin') {
          const specificVenture = await Venture.filter({ id: adminSelectedVentureId });
          if (specificVenture.length > 0) {
            userVentures = specificVenture;
            localStorage.removeItem('admin_selected_venture_id');
          } else {
            userVentures = await Venture.filter({ created_by: currentUser.email }, "-created_date");
            localStorage.removeItem('admin_selected_venture_id');
          }
        } else {
          userVentures = await Venture.filter({ created_by: currentUser.email }, "-created_date");
        }
        
        setVentures(userVentures);

        if (userVentures.length > 0) {
          const activeVenture = userVentures[0];
          
          // AUTO-FIX: If mlp_development_completed is true but mlp_completed is false, fix it
          if (activeVenture.mlp_development_completed && !activeVenture.mlp_completed) {
            await Venture.update(activeVenture.id, {
              mlp_completed: true,
              phase: 'beta'
            });
            
            await VentureMessage.create({
              venture_id: activeVenture.id,
              message_type: 'phase_complete',
              title: '🎉 MLP Phase Complete!',
              content: `Congratulations! You've successfully completed your Minimum Lovable Product. You are now entering the Beta phase.`,
              phase: 'mlp',
              priority: 4
            });

            await VentureMessage.create({
              venture_id: activeVenture.id,
              message_type: 'phase_welcome',
              title: '🧪 Welcome to Beta Testing!',
              content: `It's time to get real users! Set up your beta testing page and start gathering sign-ups.`,
              phase: 'beta',
              priority: 3
            });

            const currentTesters = await BetaTester.filter({ venture_id: activeVenture.id });
            await VentureMessage.create({
              venture_id: activeVenture.id,
              message_type: 'system',
              title: '📊 Beta Phase Requirements',
              content: `You need 50 beta sign-ups to move to Growth phase. You currently have ${currentTesters.length}. Use the Promotion Center to reach more potential testers!`,
              phase: 'beta',
              priority: 3
            });
            
            activeVenture.mlp_completed = true;
            activeVenture.phase = 'beta';
          }
          
          // AUTO-FIX: If in Beta phase and no "50 testers" message exists, create it
          if (activeVenture.phase === 'beta') {
            const existingMessages = await VentureMessage.filter({
              venture_id: activeVenture.id,
              title: '📊 Beta Phase Requirements',
              is_dismissed: false
            });
            
            const currentTesters = await BetaTester.filter({ venture_id: activeVenture.id });

            if (existingMessages.length === 0 && currentTesters.length < 50) {
              await VentureMessage.create({
                venture_id: activeVenture.id,
                message_type: 'system',
                title: '📊 Beta Phase Requirements',
                content: `You need 50 beta sign-ups to move to Growth phase. You currently have ${currentTesters.length}. Use the Promotion Center to reach more potential testers!`,
                phase: 'beta',
                priority: 3
              });
            }
          }
          
          setCurrentVenture(activeVenture);

          const ventureMessages = await VentureMessage.filter(
            { venture_id: activeVenture.id, is_dismissed: false },
            "-created_date"
          );
          setMessages(ventureMessages);

          await updateBurnRate(activeVenture);
        }
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error loading dashboard:", error);
      router.push('/login');
      setIsLoading(false);
    }
  }, [updateBurnRate, router]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleAcceptToS = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    await supabase
      .from('user_profiles')
      .upsert({ 
        id: user.id, 
        accepted_tos_date: new Date().toISOString() 
      });
    
    setShowToS(false);
    loadData();
  } catch (error) {
    console.error('Error accepting ToS:', error);
    alert('Failed to accept terms. Please try again.');
  }
};

  const dismissMessage = async (message, shouldTrackView = false) => {
    await VentureMessage.update(message.id, { is_dismissed: true });
    if (shouldTrackView && message.campaign_id) {
      try {
        const campaigns = await PromotionCampaign.filter({ id: message.campaign_id });
        if (campaigns.length > 0) {
          const campaign = campaigns[0];
          await PromotionCampaign.update(campaign.id, { views: (campaign.views || 0) + 1 });
        }
      } catch (error) {
        console.error("Error tracking view:", error);
      }
    }
    setMessages(prev => prev.filter(msg => msg.id !== message.id));
  };

  const handleVisitPage = async (message) => {
    const isFeedbackRequest = message.message_type === 'feedback_request';

    if (isFeedbackRequest) {
        if (message.campaign_id) {
            try {
                const campaigns = await PromotionCampaign.filter({ id: message.campaign_id });
                if (campaigns.length > 0) {
                    const campaign = campaigns[0];
                    await PromotionCampaign.update(campaign.id, {
                        clicks: (campaign.clicks || 0) + 1,
                        views: (campaign.views || 0) + 1
                    });
                }
            } catch (error) {
                console.error("Error tracking click:", error);
            }
        }
        await VentureMessage.update(message.id, { is_dismissed: true });
        setMessages(prev => prev.filter(msg => msg.id !== message.id));
        if (message.from_venture_landing_page_url) {
            window.open(message.from_venture_landing_page_url, '_blank');
        }
    }
  };

  const handleVisitVenture = async (message) => {
    if (message.from_venture_landing_page_url) {
      window.open(message.from_venture_landing_page_url, '_blank');
    }
  };

  const handleInvestmentDecision = async (message, decision) => {
    if (decision === 'accepted') {
        const newCapital = (currentVenture.virtual_capital || 0) + message.investment_offer_checksize;
        await Venture.update(currentVenture.id, {
            virtual_capital: newCapital,
            valuation: message.investment_offer_valuation
        });
        setCurrentVenture(prev => ({
          ...prev, 
          virtual_capital: newCapital, 
          valuation: message.investment_offer_valuation
        }));

        await FundingEvent.create({
          venture_id: currentVenture.id,
          venture_name: currentVenture.name,
          venture_tagline: currentVenture.description,
          venture_landing_page_url: currentVenture.landing_page_url,
          investor_name: message.vc_firm_name,
          investment_type: 'VC',
          amount: message.investment_offer_checksize
        });

        await VentureMessage.create({
          venture_id: currentVenture.id,
          message_type: 'system',
          title: `🎉 Congratulations on your investment!`,
          content: `Fantastic news! You have successfully secured $${message.investment_offer_checksize.toLocaleString()} from ${message.vc_firm_name}. The funds have been added to your virtual capital, and your venture is now valued at $${message.investment_offer_valuation.toLocaleString()}. This achievement will be featured on our home page. Keep building and growing!`,
          phase: currentVenture.phase,
          priority: 4
        });
    }

    await VentureMessage.update(message.id, {
        investment_offer_status: decision
    });

    if (decision === 'accepted') {
        alert(`Investment accepted! You received $${message.investment_offer_checksize.toLocaleString()} and your venture is now valued at $${message.investment_offer_valuation.toLocaleString()}.`);
    } else {
        alert('Investment offer declined.');
    }

    setMessages(prev => prev.map(msg => 
      msg.id === message.id 
        ? {...msg, investment_offer_status: decision} 
        : msg
    ));
  };

  const handleJoinVCMeeting = async (message) => {
    if (!message.vc_firm_id) {
      alert("Error: VC Firm ID is missing from the message.");
      return;
    }
    try {
      const firms = await VCFirm.filter({ id: message.vc_firm_id });
      if (firms.length > 0) {
        setSelectedVCFirm(firms[0]);
        setSelectedMessageId(message.id);
        setIsMeetingModalOpen(true);
      } else {
        alert("Could not find the VC Firm details. The firm may have been deleted.");
      }
    } catch (error) {
      console.error("Error fetching VC Firm for meeting:", error);
      alert("An error occurred while preparing the meeting.");
    }
  };
  
  const handleFollowUpCall = (message) => {
    router.push(createPageUrl(`PressureChallenge?vcFollowUp=true&messageId=${message.id}&firmId=${message.vc_firm_id}`));
  };

  const handleJoinVCAdvancedMeeting = async (message) => {
    if (!message.vc_firm_id) {
      alert("Error: VC Firm ID is missing from the message for advanced meeting.");
      return;
    }
    if (!currentVenture) {
      alert("Error: No active venture found.");
      return;
    }

    try {
      const firms = await VCFirm.filter({ id: message.vc_firm_id });
      if (firms.length > 0) {
        setSelectedVCFirm(firms[0]);
        setSelectedMessageId(message.id);
        setIsAdvancedMeetingModalOpen(true);
      } else {
        alert("Could not find the VC Firm details for advanced meeting.");
      }
    } catch (error) {
      console.error("Error fetching VC Firm for advanced meeting:", error);
      alert("An error occurred while preparing the advanced meeting.");
    }
  };

  const handleReadOn = (details) => {
    setRejectionDetailsContent(details);
    setShowRejectionDetails(true);
  };

  const getPhaseColor = (phase) => {
    const colors = {
      idea: "bg-yellow-100 text-yellow-800",
      business_plan: "bg-blue-100 text-blue-800",
      mvp: "bg-purple-100 text-purple-800",
      mlp: "bg-pink-100 text-pink-800",
      beta: "bg-orange-100 text-orange-800",
      growth: "bg-indigo-100 text-indigo-800",
      ma: "bg-gray-800 text-white"
    };
    return colors[phase] || "bg-gray-100 text-gray-800";
  };

  const getPhaseIcon = (phase) => {
    const icons = {
      idea: Lightbulb,
      business_plan: FileText,
      mvp: Rocket,
      mlp: Heart,
      beta: FlaskConical,
      vc_funding: DollarSign,
      growth: TrendingUp,
      ma: Briefcase
    };
    return icons[phase] || Lightbulb;
  };

  const formatMoney = (amount) => {
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
    return `$${amount}`;
  };

  const getVentureAge = (venture) => {
    if (!venture) return 0;
    return differenceInDays(new Date(), new Date(venture.created_date));
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const getAssetsAndTools = () => {
    if (!currentVenture) return [];

    const assets = [];
    const currentPhaseIndex = PHASES_ORDER.indexOf(currentVenture.phase);

    assets.push({
      id: 'edit_landing_page',
      title: 'Edit Landing Page',
      icon: Lightbulb,
      page: 'EditLandingPage'
    });
    
    assets.push({
      id: 'financials',
      title: 'Financials',
      icon: Wallet,
      page: 'Financials'
    });
    
    if (currentPhaseIndex >= PHASES_ORDER.indexOf('business_plan')) {
      assets.push({
        id: 'business_plan',
        title: 'Business Plan',
        icon: FileText,
        page: 'BusinessPlan'
      });
      
      assets.push({
        id: 'invite_cofounder',
        title: 'Invite Co-Founder',
        icon: UserPlus,
        page: 'InviteCoFounder'
      });
      
      assets.push({
        id: 'promotion_center',
        title: 'Promotion Center',
        icon: Megaphone,
        page: 'PromotionCenter'
      });
    }

    if (currentVenture.phase === 'mvp' && !currentVenture.mvp_uploaded) {
      assets.push({
        id: 'mvp_development',
        title: 'MVP Development Center',
        icon: Rocket,
        page: 'MVPDevelopment'
      });
    }

    if (currentVenture.phase === 'mvp' && currentVenture.mvp_uploaded && !currentVenture.revenue_model_completed) {
      assets.push({
        id: 'revenue_modeling',
        title: 'Revenue Modeling',
        icon: BarChart3,
        page: 'RevenueModeling-Experience',
        openInNewWindow: true
      });
    }

    if (currentPhaseIndex >= PHASES_ORDER.indexOf('beta')) {
      assets.push({
        id: 'revenue_modeling',
        title: 'Revenue Modeling',
        icon: BarChart3,
        page: 'RevenueModeling-Experience',
        openInNewWindow: true
      });
    }
    
    if (currentVenture.phase === 'mlp') {
      if (!currentVenture.mlp_development_completed) {
        assets.push({
          id: 'mlp_development_center',
          title: 'MLP Development Center',
          icon: Heart,
          page: 'MLPDevelopmentCenter'
        });
      }

      assets.push({
        id: 'product_feedback',
        title: 'Product Feedback Center',
        icon: MessageSquare,
        page: 'ProductFeedback'
      });
    }

    if (currentPhaseIndex >= PHASES_ORDER.indexOf('beta')) {
      assets.push({
        id: 'beta_development',
        title: 'Beta Testing Page',
        icon: FlaskConical,
        page: 'BetaDevelopment' 
      });
      
      assets.push({
        id: 'venture_pitch',
        title: 'Venture Pitch',
        icon: TrendingUp,
        page: 'VenturePitch'
      });
    }

    return assets;
  };

  if (isLoading && !showToS) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-300 rounded w-1/4"></div>
          <div className="grid grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (showToS) {
    return (
      <Dialog open={showToS} onOpenChange={setShowToS}>
        <DialogContent className="sm:max-w-[425px]" onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><ShieldCheck/> Terms of Service</DialogTitle>
            <DialogDescription>
              Before you continue, please read and agree to our terms.
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 bg-gray-50 rounded-lg max-h-60 overflow-y-auto text-sm">
            Welcome to StartZig! By using our platform, you agree to:
            <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Engage respectfully and constructively with all users.</li>
                <li>Provide honest and helpful feedback.</li>
                <li>Not share any hateful, abusive, or infringing content.</li>
                <li>Understand that this is a simulation. All currency, valuations, and investments are virtual.</li>
            </ul>
             <p className="mt-4">
              For the full document, please visit our <Link href={createPageUrl("TermsOfService")} target="_blank" className="text-indigo-600 hover:underline">Terms of Service page</Link>.<br />
              <Link href={createPageUrl("PrivacyPolicy")} target="_blank" className="text-indigo-600 hover:underline">Privacy Policy</Link>.<br />
              <Link href={createPageUrl("Disclaimer")} target="_blank" className="text-indigo-600 hover:underline">Disclaimer</Link>.
            </p>
          </div>
          <DialogFooter>
            <Button onClick={handleAcceptToS}>I Read and Agree</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  if (!currentVenture) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {getGreeting()}, {user?.full_name || 'Entrepreneur'}!
            </h1>
            <p className="text-lg text-gray-600">Ready to start your entrepreneurial journey?</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <div className="w-24 h-24 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lightbulb className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Create Your First Venture</h2>
            <p className="text-gray-600 mb-6">
              Transform your ideas into reality. Our platform will guide you through every step of building a successful startup.
            </p>
            <Link href={createPageUrl("CreateVenture")}>
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-lg px-8 py-3">
                <Plus className="w-5 h-5 mr-2" />
                Start Your Venture
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6 text-left">
            <Card>
              <CardHeader>
                <Lightbulb className="w-8 h-8 text-yellow-500 mb-2" />
                <CardTitle className="text-lg">Idea Phase</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Start with your concept and create a compelling landing page</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <FileText className="w-8 h-8 text-blue-500 mb-2" />
                <CardTitle className="text-lg">Business Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Develop a comprehensive strategy and business model</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <DollarSign className="w-8 h-8 text-green-500 mb-2" />
                <CardTitle className="text-lg">Get Funded</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Connect with angels and VCs to secure investment</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const assetsAndTools = getAssetsAndTools();

  return (
    <>
      <RejectionDetailsModal
        isOpen={showRejectionDetails}
        onClose={() => setShowRejectionDetails(false)}
        details={rejectionDetailsContent}
      />

      <div className="min-h-screen bg-gray-50 flex">
        <div className="w-80 bg-white border-r border-gray-200 flex-shrink-0 overflow-y-auto p-4 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-3 px-2">Toolbox</h3>
            <div className="space-y-2">
              {assetsAndTools.map((asset) => {
                const Icon = asset.icon;
                return (
                  <div key={asset.id}>
                    {asset.openInNewWindow ? (
                      <a href={createPageUrl(asset.page)} target="_blank" rel="noopener noreferrer" className="block">
                        <div className="flex items-center gap-3 p-3 hover:bg-gray-100 transition-colors rounded-lg border">
                          <Icon className="w-4 h-4 text-gray-600" />
                          <span className="flex-1 text-sm">{asset.title}</span>
                          <ExternalLink className="w-3 h-3 text-gray-400" />
                        </div>
                      </a>
                    ) : asset.external ? (
                      <a href={asset.url} target="_blank" rel="noopener noreferrer" className="block">
                        <div className="flex items-center gap-3 p-3 hover:bg-gray-100 transition-colors rounded-lg border">
                          <Icon className="w-4 h-4 text-gray-600" />
                          <span className="flex-1 text-sm">{asset.title}</span>
                          <ExternalLink className="w-3 h-3 text-gray-400" />
                        </div>
                      </a>
                    ) : (
                      <Link href={createPageUrl(asset.page)} className="block">
                        <div className="flex items-center gap-3 p-3 hover:bg-gray-100 transition-colors rounded-lg border">
                          <Icon className="w-4 h-4 text-gray-600" />
                          <span className="flex-1 text-sm">{asset.title}</span>
                        </div>
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {(currentVenture.founders_count || 1) < 2 && (
            <Card className="bg-amber-50 border-amber-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-600" />
                  Why Do You Need a Co-Founder?
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-xs text-amber-800 space-y-2">
                  {!cofounderExpanded ? (
                    <>
                      <p>Solo founders get funded 30-50% less than teams...</p>
                      <Button 
                        variant="link" 
                        size="sm" 
                        onClick={() => setCofounderExpanded(true)}
                        className="p-0 h-auto text-amber-700 hover:text-amber-800"
                      >
                        Read more
                      </Button>
                    </>
                  ) : (
                    <>
                      <p>Solo founders get funded 30-50% less than teams. A co-founder signals commitment and validation - someone else believed enough to join.</p>
                      <div className="mt-2 space-y-2">
                        <p><strong>Key Benefits:</strong></p>
                        <ul className="list-disc pl-4 space-y-1">
                          <li>Investors trust teams more than solo founders</li>
                          <li>Shared workload and complementary skills</li>
                          <li>Better decision-making through diverse perspectives</li>
                          <li>Emotional support during tough times</li>
                          <li>Higher chance of securing funding</li>
                        </ul>
                      </div>
                      <Button 
                        variant="link" 
                        size="sm" 
                        onClick={() => setCofounderExpanded(false)}
                        className="p-0 h-auto text-amber-700 hover:text-amber-800"
                      >
                        Read less
                      </Button>
                    </>
                  )}
                  
                  <Link href={createPageUrl('InviteCoFounder')}>
                    <Button size="sm" variant="outline" className="w-full border-amber-300 hover:bg-amber-100 mt-2">
                      <UserPlus className="w-3 h-3 mr-2" />
                      Invite Co-Founder
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  {getGreeting()}, {user?.full_name || 'Entrepreneur'}!
                </h1>
                <p className="text-sm text-gray-500">
                  {format(new Date(), "EEEE, MMMM d, yyyy")}
                </p>
              </div>
              <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg border">
                {currentVenture && (() => {
                  const PhaseIcon = getPhaseIcon(currentVenture.phase);
                  return <PhaseIcon className="w-5 h-5 text-indigo-600" />;
                })()}
                <div>
                  <p className="text-sm text-gray-500">Current Phase</p>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPhaseColor(currentVenture.phase)}`}>
                    {currentVenture.phase.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg font-bold">{currentVenture.name}</CardTitle>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-4 h-4" />
                    {messages.length} messages
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    {currentVenture.likes_count || 0} likes
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {getVentureAge(currentVenture)} days old
                  </span>
                </div>
              </CardHeader>
            </Card>

            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Board</h2>

              {messages.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No new messages. Keep building your venture!</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => {
                    let cardClass = "bg-blue-50 border-blue-200";
                    if (message.message_type === 'feedback_request') cardClass = "bg-yellow-50 border-yellow-200";
                    if (message.message_type === 'investment_offer') cardClass = "bg-green-50 border-green-200";
                    if (message.message_type === 'like_notification' || message.message_type === 'user_feedback') cardClass = "bg-purple-50 border-purple-200";
                    if (message.message_type === 'vc_follow_up_required') cardClass = "bg-amber-50 border-amber-200";
                    if (message.vc_stage === 'stage_2_ready') cardClass = "bg-emerald-50 border-emerald-200";
                    if (message.vc_stage === 'stage_1_rejected' || message.vc_stage === 'stage_2_rejected') cardClass = "bg-red-50 border-red-200";
                    if (message.vc_stage === 'stage_3_ready') cardClass = "bg-green-50 border-green-200";

                    const shouldShowDismissButton = !(message.message_type === 'investment_offer' && message.investment_offer_status === 'pending') && message.message_type !== 'vc_follow_up_required';

                    return (
                    <Card key={message.id} className={cardClass}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            {message.title && (
                              <h3 className="font-semibold text-gray-900 mb-2">{message.title}</h3>
                            )}
                            <p className="text-gray-700 text-sm mb-4">{message.content}</p>

                            {message.message_type === 'like_notification' && (
                              <div className="flex gap-2">
                                <Button size="sm" onClick={() => handleVisitVenture(message)}>
                                  Visit Their Venture
                                </Button>
                              </div>
                            )}

                            {message.message_type === 'feedback_request' && (
                              <div className="flex gap-2">
                                <Button size="sm" onClick={() => handleVisitPage(message)}>
                                  Visit Venture Page
                                </Button>
                              </div>
                            )}

                            {message.message_type === 'vc_follow_up_required' && (
                              <div className="flex gap-2">
                                <Button size="sm" onClick={() => handleFollowUpCall(message)} className="bg-amber-600 hover:bg-amber-700">
                                  <PhoneForwarded className="w-4 h-4 mr-2"/>
                                  Join Follow-up Call
                                </Button>
                              </div>
                            )}

                            {message.vc_stage === 'stage_2_ready' && (
                              <div className="flex gap-2">
                                <Button size="sm" onClick={() => handleJoinVCMeeting(message)}>
                                  Join Meeting
                                </Button>
                              </div>
                            )}
                            
                            {(message.vc_stage === 'stage_1_rejected' || message.vc_stage === 'stage_2_rejected' || message.vc_stage === 'stage_3_rejected') && message.rejection_details && (
                              <div className="flex gap-2">
                                <Button size="sm" onClick={() => handleReadOn(message.rejection_details)}>
                                  Read Feedback
                                </Button>
                              </div>
                            )}

                            {message.vc_stage === 'stage_3_ready' && (
                              <div className="flex gap-2">
                                <Button size="sm" onClick={() => handleJoinVCAdvancedMeeting(message)}>
                                  Join Advanced Meeting
                                </Button>
                              </div>
                            )}

                            {message.message_type === 'investment_offer' && (
                               <div className="mt-4 p-4 bg-white rounded-lg border">
                                  <h4 className="font-bold">Investment Offer Details:</h4>
                                  <p><strong>Investment Amount:</strong> ${message.investment_offer_checksize.toLocaleString()}</p>
                                  <p><strong>Venture Valuation:</strong> ${message.investment_offer_valuation.toLocaleString()}</p>
                                  {message.investment_offer_status === 'pending' ? (
                                      <div className="flex gap-2 mt-4">
                                      <Button
                                        size="sm"
                                        className="bg-green-600 hover:bg-green-700"
                                        onClick={() => handleInvestmentDecision(message, 'accepted')}
                                      >
                                          <CheckCircle className="w-4 h-4 mr-2"/>
                                          Accept Offer
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => handleInvestmentDecision(message, 'declined')}
                                      >
                                          <X className="w-4 h-4 mr-2"/>
                                          Decline Offer
                                      </Button>
                                      </div>
                                  ) : (
                                      <p className="mt-4 font-semibold text-sm">
                                        Status: {message.investment_offer_status === 'accepted' ? '✅ Accepted' : '❌ Declined'}
                                      </p>
                                  )}
                                </div>
                            )}
                          </div>
                          
                          {shouldShowDismissButton && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => dismissMessage(message)}
                                className="ml-4 text-gray-400 hover:text-red-600"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {selectedVCFirm && (
        <VCMeetingModal
          isOpen={isMeetingModalOpen}
          onClose={() => {
            setIsMeetingModalOpen(false);
            setSelectedVCFirm(null);
            setSelectedMessageId(null);
            loadDashboard();
          }}
          vcFirm={selectedVCFirm}
          venture={currentVenture}
          messageId={selectedMessageId}
        />
      )}

      {selectedVCFirm && (
        <VCAdvancedMeetingModal
          isOpen={isAdvancedMeetingModalOpen}
          onClose={() => {
            setIsAdvancedMeetingModalOpen(false);
            setSelectedVCFirm(null);
            setSelectedMessageId(null);
            loadDashboard();
          }}
          vcFirm={selectedVCFirm}
          venture={currentVenture}
          messageId={selectedMessageId}
        />
      )}
    </>
  );
}