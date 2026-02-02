//dashboard 260126 plus  balance
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
import VCAdvancedMeetingModal from '@/components/vc/VCAdvancedMeetingModal';

// FIX: Always convert path to lowercase to prevent case sensitivity issues on Linux/Vercel
const createPageUrl = (path) => `/${path.toLowerCase()}`;

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
  const [liveBalance, setLiveBalance] = useState(0);
  //new valuation
  const [currentValuation, setCurrentValuation] = useState(0);
  const formatValuation = (val) => {
  if (!val) return "$0";
  if (val >= 1000000) return `$${Math.floor(val / 1000000)}M`;
  return `$${Math.floor(val / 1000)}K`;
};
  const router = useRouter();

  // new valuation
  const updateBalance = useCallback(() => {
    if (!currentVenture) return;
    const totalFunding = messages.filter(m => m.message_type === "investment_offer" && m.investment_offer_status === "accepted").reduce((s, m) => s + (m.investment_offer_checksize || 0), 0);
    const initialCapital = 15000;
    const totalStartingCapital = initialCapital + totalFunding;
    const monthlyBurn = currentVenture.monthly_burn_rate || 5000;
    if (!currentVenture.burn_rate_start) {
      setLiveBalance(totalStartingCapital);
      return;
    }
    const startTime = new Date(currentVenture.burn_rate_start).getTime();
    const now = new Date().getTime();
    const secondsElapsed = (now - startTime) / 1000;
    const burnPerSecond = monthlyBurn / (30 * 24 * 60 * 60);
    const calculated = Math.floor(Math.max(0, totalStartingCapital - (secondsElapsed * burnPerSecond)));
    setLiveBalance(calculated);
  }, [currentVenture, messages]);
  
const updateValuation = useCallback(() => {
  if (!currentVenture) return;

  const baseValues = {
    idea: 500000,
    business_plan: 500000,
    mvp: 2000000,
    mlp: 4000000,
    beta: 6000000,
    growth: 10000000
  };

  const multipliers = {
    ai_deep_tech: 1.5,
    digital_health_biotech: 1.4,
    fintech: 1.2,
    web3_blockchain: 1.2,
    b2b_saas: 1.0,
    climatetech_energy: 0.9,
    consumer_apps: 0.7
  };

  const base = baseValues[currentVenture.phase] || 500000;
  const mult = multipliers[currentVenture.sector] || 1.0;
  
  setCurrentValuation(base * mult);
}, [currentVenture]);

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
            userVentures = await Venture.filter({ founder_user_id: currentUser.id }, "-created_date");
            localStorage.removeItem('admin_selected_venture_id');
          }
        } else {
          userVentures = await Venture.filter( { founder_user_id: currentUser.id }, "-created_date"
          );
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
              content: `Set up your beta testing page to start gathering sign-ups. Next: plan your investor pitch and access the VC Marketplace.`,
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

          // updateBurnRate removed - using updateBalance instead
        }
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error loading dashboard:", error);
      router.push('/login');
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);
// update valuation
  useEffect(() => {
  if (!currentVenture || !messages) return;
  
  updateBalance();
  updateValuation(); // הזרקה 1: הרצה ראשונית
  
  const balanceInterval = setInterval(() => {
    updateBalance();
    updateValuation(); // הזרקה 2: הרצה בכל שנייה
  }, 1000);
  
  return () => clearInterval(balanceInterval);
}, [currentVenture, messages, updateBalance, updateValuation]); // הזרקה 3: הוספת התלות בסוף
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
    // Reloading data after accepting ToS
    loadDashboard();
  } catch (error) {
    console.error('Error accepting ToS:', error);
    // Using a custom message box instead of alert, but keeping as alert for minimal change
    // for this one instance as it's a non-critical simulation logic.
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
        // Using a custom message box instead of alert, but keeping as alert for minimal change
        alert(`Investment accepted! You received $${message.investment_offer_checksize.toLocaleString()} and your venture is now valued at $${message.investment_offer_valuation.toLocaleString()}.`);
    } else {
        // Using a custom message box instead of alert, but keeping as alert for minimal change
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
      // Using a custom message box instead of alert
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
        // Using a custom message box instead of alert
        alert("Could not find the VC Firm details. The firm may have been deleted.");
      }
    } catch (error) {
      console.error("Error fetching VC Firm for meeting:", error);
      // Using a custom message box instead of alert
      alert("An error occurred while preparing the meeting.");
    }
  };
 
  const handleFollowUpCall = (message) => {
    // Path `PressureChallenge` will be converted to `pressurechallenge` by createPageUrl
    router.push(createPageUrl(`PressureChallenge?vcFollowUp=true&messageId=${message.id}&firmId=${message.vc_firm_id}`));
  };

  const handleJoinVCAdvancedMeeting = async (message) => {
    if (!message.vc_firm_id) {
      // Using a custom message box instead of alert
      alert("Error: VC Firm ID is missing from the message for advanced meeting.");
      return;
    }
    if (!currentVenture) {
      // Using a custom message box instead of alert
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
        // Using a custom message box instead of alert
        alert("Could not find the VC Firm details for advanced meeting.");
      }
    } catch (error) {
      console.error("Error fetching VC Firm for advanced meeting:", error);
      // Using a custom message box instead of alert
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

 

// [2026-01-04] CHANGE: add username to greeting
const getGreeting = (username) => {
  const hour = new Date().getHours();

  let greeting;
  if (hour < 12) greeting = "Good morning";
  else if (hour < 17) greeting = "Good afternoon";
  else greeting = "Good evening";

  return username
    ? `${greeting}, ${username}!`
    : `${greeting}!`;
};


  const getAssetsAndTools = () => {
    if (!currentVenture) return [];

    const assets = [];
    const currentPhaseIndex = PHASES_ORDER.indexOf(currentVenture.phase);

    assets.push({
      id: 'edit_landing_page',
      title: 'Edit Landing Page',
      icon: Lightbulb,
      page: 'edit-landing-page' // createPageUrl will convert to /editlandingpage
    });
   
    assets.push({
      id: 'financials',
      title: 'Financials',
      icon: Wallet,
      page: 'financials' // createPageUrl will convert to /financials
    });
   
    if (currentPhaseIndex >= PHASES_ORDER.indexOf('business_plan')) {
      assets.push({
        id: 'business_plan',
        title: 'Business Plan',
        icon: FileText,
        page: 'businessPlan' // createPageUrl will convert to /businessplan
      });
     
      assets.push({
        id: 'invite_cofounder',
        title: 'Invite Co-Founder',
        icon: UserPlus,
        page: 'invite-cofounder' // createPageUrl will convert to /invitecofounder
      });
     
      assets.push({
        id: 'promotion_center',
        title: 'Promotion Center',
        icon: Megaphone,
        page: 'promotion-center' // createPageUrl will convert to /promotioncenter
      });
    }

    if (currentVenture.phase === 'mvp' && !currentVenture.mvp_uploaded) {
      assets.push({
        id: 'mvp_development',
        title: 'MVP Development Center',
        icon: Rocket,
        page: 'mvp-development' // createPageUrl will convert to /mvpdevelopment
      });
    }

    if (currentVenture.phase === 'mvp' && currentVenture.mvp_uploaded && !currentVenture.revenue_model_completed) {
      assets.push({
        id: 'revenue_modeling',
        title: 'Revenue Modeling',
        icon: BarChart3,
        page: 'revenue-modeling-experience', // createPageUrl will convert to /revenuemodeling-experience
        openInNewWindow: true
      });
    }

    if (currentPhaseIndex >= PHASES_ORDER.indexOf('beta')) {
      assets.push({
        id: 'revenue_modeling',
        title: 'revenue-modeling-experience',
        icon: BarChart3,
        page: 'revenue-modeling', // createPageUrl will convert to /revenuemodeling-experience
        openInNewWindow: true
      });
    }
   
    if (currentVenture.phase === 'mlp') {
      if (!currentVenture.mlp_development_completed) {
        assets.push({
          id: 'mlp_development_center',
          title: 'MLP Development Center',
          icon: Heart,
          page: 'mlp-development-center' // createPageUrl will convert to /mlpdevelopmentcenter
        });
      }

      assets.push({
        id: 'product_feedback',
        title: 'Product Feedback Center',
        icon: MessageSquare,
        page: 'product-feedback' // createPageUrl will convert to /productfeedback
      });
    }

    if (currentPhaseIndex >= PHASES_ORDER.indexOf('beta')) {
      assets.push({
        id: 'beta_development',
        title: 'Beta Testing Page',
        icon: FlaskConical,
        page: 'beta-development' // createPageUrl will convert to /betadevelopment
      });
     
      assets.push({
        id: 'venture_pitch',
        title: 'Venture Pitch',
        icon: TrendingUp,
        page: 'venture-pitch' // createPageUrl will convert to /venturepitch
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

 
// [2026-01-03] ToS Dialog UI fix: force solid background, readable text, proper spacing, z-index, and button styling
if (showToS) {
  return (
    <Dialog open={showToS} onOpenChange={setShowToS}>
      <DialogContent
        // [2026-01-03] FIX: ensure dialog isn't "transparent" due to inherited styles
        className="sm:max-w-[520px] bg-white text-gray-900 border border-gray-200 shadow-xl rounded-xl z-[60]"
        // [2026-01-03] keep modal from closing by clicking outside
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="space-y-2">
          <DialogTitle
            // [2026-01-03] FIX: make title visible + align icon properly
            className="flex items-center gap-2 text-lg font-semibold text-gray-900"
          >
            <ShieldCheck className="w-5 h-5 text-indigo-600" /> {/* [2026-01-03] FIX: visible icon color/size */}
            Terms of Service
          </DialogTitle>

          <DialogDescription
            // [2026-01-03] FIX: description readability
            className="text-sm text-gray-600"
          >
            Before you continue, please read and agree to our terms.
          </DialogDescription>
        </DialogHeader>

        <div
          // [2026-01-03] FIX: solid readable content box + consistent text color
          className="p-4 bg-gray-50 border border-gray-200 rounded-lg max-h-72 overflow-y-auto text-sm text-gray-800 leading-relaxed"
        >
          <p className="font-medium text-gray-900">
            Welcome to StartZig! By using our platform, you agree to:
          </p>

          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Engage respectfully and constructively with all users.</li>
            <li>Provide honest and helpful feedback.</li>
            <li>Not share any hateful, abusive, or infringing content.</li>
            <li>
              Understand that this is a simulation. All currency, valuations, and investments are virtual.
            </li>
          </ul>

          <p className="mt-4 text-gray-700">
            For the full document, please visit our{" "}
            <Link
              href={createPageUrl("terms")}
              target="_blank"
              // [2026-01-03] FIX: ensure link is visible on gray background
              className="text-indigo-700 font-medium hover:underline"
            >
              Terms of Service page
            </Link>
            .<br />
            <Link
              href={createPageUrl("privacypolicy")}
              target="_blank"
              className="text-indigo-700 font-medium hover:underline"
            >
              Privacy Policy
            </Link>
            .<br />
            <Link
              href={createPageUrl("disclaimer")}
              target="_blank"
              className="text-indigo-700 font-medium hover:underline"
            >
              Disclaimer
            </Link>
            .
          </p>
        </div>

        <DialogFooter
          // [2026-01-03] FIX: spacing so button isn't glued / hidden
          className="mt-2 flex gap-2"
        >
          <Button
            onClick={handleAcceptToS}
            // [2026-01-03] FIX: force primary styling in case Button variants are overridden elsewhere
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            I Read and Agree
          </Button>
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
              {getGreeting(user?.username)}
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
            <Link href={createPageUrl("createVenture")}>
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

      <VCMeetingModal
        isOpen={isMeetingModalOpen}
        onClose={() => setIsMeetingModalOpen(false)}
        vcFirm={selectedVCFirm}
        venture={currentVenture}
        messageId={selectedMessageId}
        onSuccess={() => {
          // Update messages list to mark it as dismissed/completed
          loadDashboard();
          setIsMeetingModalOpen(false);
        }}
        router={router}
      />

      <VCAdvancedMeetingModal
        isOpen={isAdvancedMeetingModalOpen}
        onClose={() => setIsAdvancedMeetingModalOpen(false)}
        vcFirm={selectedVCFirm}
        venture={currentVenture}
        messageId={selectedMessageId}
        onSuccess={() => {
          // Update messages list to mark it as dismissed/completed
          loadDashboard();
          setIsAdvancedMeetingModalOpen(false);
        }}
        router={router}
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
                 
                  <Link href={createPageUrl('invite-cofounder')}>
                    <Button size="sm" variant="outline" className="w-full border-amber-300 hover:bg-amber-100 mt-2">
                      <UserPlus className="w-3 h-3 mr-2" />
                      invite-cofounder
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
                  {getGreeting(user?.username)}
                 
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
                  <span className="flex items-center gap-1">
                   <Wallet className="w-4 h-4 " />
                     <span> Balance:</span>
                     <span className="font-mono">
                      ${liveBalance?.toLocaleString()}
                     </span>
                     
                  </span>
                 <span className="flex items-center gap-1 border-l border-gray-200 pl-4 ml-2 text-gray-500 font-normal">
  <BarChart3 className="w-4 h-4" />
  <span>
    <span>Val:</span>
    ${currentValuation >= 1000000 
      ? Math.floor(currentValuation/1000000) + 'M' 
      : Math.floor(currentValuation/1000) + 'K'}
  </span>
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
                    const isInvestmentOffer = message.message_type === 'investment_offer';
                    const isRejection = message.message_type === 'investment_rejection';
                    const isVCMeeting = message.message_type === 'vc_meeting_request';
                    const isVCAdvancedMeeting = message.message_type === 'vc_advanced_meeting_request';
                    const isFeedbackRequest = message.message_type === 'feedback_request';
                    const isPromotion = message.message_type === 'promotion';
                    const isSystem = message.message_type === 'system' || message.message_type === 'phase_complete' || message.message_type === 'phase_welcome';

                    let cardClass = 'bg-white border-l-4';
                    let icon = MessageSquare;
                    let iconClass = 'text-gray-500';

                    if (isInvestmentOffer) {
                      cardClass = 'bg-green-50 border-l-4 border-green-500';
                      icon = DollarSign;
                      iconClass = 'text-green-600';
                    } else if (isRejection) {
                      cardClass = 'bg-red-50 border-l-4 border-red-500';
                      icon = X;
                      iconClass = 'text-red-600';
                    } else if (isVCMeeting || isVCAdvancedMeeting) {
                      cardClass = 'bg-indigo-50 border-l-4 border-indigo-500';
                      icon = PhoneForwarded;
                      iconClass = 'text-indigo-600';
                    } else if (isPromotion) {
                      cardClass = 'bg-blue-50 border-l-4 border-blue-500';
                      icon = Megaphone;
                      iconClass = 'text-blue-600';
                    } else if (isFeedbackRequest) {
                      cardClass = 'bg-yellow-50 border-l-4 border-yellow-500';
                      icon = BookOpen;
                      iconClass = 'text-yellow-600';
                    } else if (isSystem) {
                       cardClass = 'bg-gray-100 border-l-4 border-gray-400';
                       icon = Code;
                       iconClass = 'text-gray-500';
                    }

                    const Icon = icon;

                    return (
                      <Card key={message.id} className={cardClass}>
                        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                          <div className="flex items-center gap-3">
                            <Icon className={`w-5 h-5 ${iconClass}`} />
                            <CardTitle className="text-md font-semibold">{message.title}</CardTitle>
                          </div>
                          <div className="text-xs text-gray-500 text-right">
                            <p className="font-medium">
                              {message.vc_firm_name || message.message_type.replace('_', ' ').toUpperCase()}
                            </p>
                            <p className="text-xs">
                              {format(new Date(message.created_date), 'MMM dd, yyyy')}
                            </p>
                           
                          </div>
                        </CardHeader>
                        <CardContent className="pt-2">
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">{message.content}</p>
{/* כפתור מחיקה להזמנת שותף */}
{message.message_type === 'co_founder_invite' && (
  <Button
    variant="outline"
    size="sm"
    className="mt-2 text-red-500 hover:bg-red-50"
    onClick={() => dismissMessage(message)}
  >
    X Dismiss
  </Button>
)}
                          {isInvestmentOffer && message.investment_offer_status === 'pending' && (
                            <div className="mt-4 p-4 border rounded-lg bg-white space-y-3">
                              <p className="text-sm font-medium">Investment Offer Details:</p>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <p><strong>Check Size:</strong> ${message.investment_offer_checksize.toLocaleString()}</p>
                                <p><strong>Valuation:</strong> ${message.investment_offer_valuation.toLocaleString()}</p>
                                <p><strong>Equity Given:</strong> {(message.investment_offer_checksize / message.investment_offer_valuation * 100).toFixed(1)}%</p>
                                <p><strong>Investor:</strong> {message.vc_firm_name}</p>
                              </div>
                              <div className="flex gap-2 pt-2">
                                <Button
                                  onClick={() => handleInvestmentDecision(message, 'accepted')}
                                  className="bg-green-600 hover:bg-green-700 text-white flex-1"
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" /> Accept
                                </Button>
                                <Button
                                  onClick={() => handleInvestmentDecision(message, 'rejected')}
                                  variant="outline"
                                  className="flex-1"
                                >
                                  <X className="w-4 h-4 mr-2" /> Decline
                                </Button>
                              </div>
                            </div>
                          )}

                          {isVCMeeting && (
                            <div className="mt-4 flex gap-2">
                              <Button onClick={() => handleJoinVCMeeting(message)} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                                <PhoneForwarded className="w-4 h-4 mr-2" /> Join VC Meeting
                              </Button>
                              <Button onClick={() => dismissMessage(message)} variant="outline">
                                <X className="w-4 h-4 mr-2" /> Dismiss
                              </Button>
                            </div>
                          )}
                         
                          {isVCAdvancedMeeting && (
                            <div className="mt-4 flex flex-col sm:flex-row gap-2">
                              <Button onClick={() => handleJoinVCAdvancedMeeting(message)} className="bg-purple-600 hover:bg-purple-700 text-white">
                                <Zap className="w-4 h-4 mr-2" /> Advanced VC Meeting
                              </Button>
                              <Button onClick={() => handleFollowUpCall(message)} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                                <Repeat className="w-4 h-4 mr-2" /> Schedule Follow-Up
                              </Button>
                              <Button onClick={() => dismissMessage(message)} variant="outline">
                                <X className="w-4 h-4 mr-2" /> Dismiss
                              </Button>
                            </div>
                          )}

                          {isRejection && message.rejection_details && (
                            <div className="mt-4">
                                <Button onClick={() => handleReadOn(message.rejection_details)} variant="outline" className="text-red-600 border-red-300 hover:bg-red-100">
                                    <BookOpen className="w-4 h-4 mr-2" /> Read Committee Feedback
                                </Button>
                                <Button onClick={() => dismissMessage(message)} variant="ghost" className="ml-2">
                                    <X className="w-4 h-4 mr-2" /> Dismiss
                                </Button>
                            </div>
                          )}

                          {isFeedbackRequest && (
                            <div className="mt-4 flex gap-2">
                              <Button onClick={() => handleVisitPage(message)} className="bg-yellow-600 hover:bg-yellow-700 text-white">
                                <ExternalLink className="w-4 h-4 mr-2" /> View Feedback Form
                              </Button>
                              <Button onClick={() => dismissMessage(message)} variant="outline">
                                <X className="w-4 h-4 mr-2" /> Dismiss
                              </Button>
                            </div>
                          )}

                          {isPromotion && (
                            <div className="mt-4 flex gap-2">
                              <Button onClick={() => handleVisitVenture(message)} className="bg-blue-600 hover:bg-blue-700 text-white">
                                <ExternalLink className="w-4 h-4 mr-2" /> View Your Venture Page
                              </Button>
                              <Button onClick={() => dismissMessage(message, true)} variant="outline">
                                <X className="w-4 h-4 mr-2" /> Dismiss & Track View
                              </Button>
                            </div>
                          )}
                           
                          {isSystem && !isRejection && (
                            <div className="mt-4">
                                <Button onClick={() => dismissMessage(message)} variant="outline">
                                    <X className="w-4 h-4 mr-2" /> Dismiss
                                </Button>
                            </div>
                          )}
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
    </>
  );
}


