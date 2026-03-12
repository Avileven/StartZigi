//dashboard 120326 
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
// [ADDED] Angel Arena screening flow
import { InvestorMeeting } from '@/api/entities';
import { Investor } from '@/api/entities';
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
  Megaphone,
  CalendarClock
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import VCMeetingModal from '@/components/vc/VCMeetingModal';
import VCAdvancedMeetingModal from '@/components/vc/VCAdvancedMeetingModal';
// [ADDED] Angel Arena scheduling
import ScheduleMeetingModal from '@/components/angels/ScheduleMeetingModal';
// [ADDED] PitchModal for joining angel meeting from dashboard
import PitchModal from '@/components/angels/PitchModal';

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
  // [ADDED] Angel Arena schedule modal
  const [isAngelScheduleModalOpen, setIsAngelScheduleModalOpen] = useState(false);
  const [selectedAngelMeeting, setSelectedAngelMeeting] = useState(null);
  const [selectedAngelInvestor, setSelectedAngelInvestor] = useState(null);
  // [ADDED] PitchModal state for joining angel meeting from dashboard
  const [isAngelPitchOpen, setIsAngelPitchOpen] = useState(false);
  const [pitchInvestor, setPitchInvestor] = useState(null);
  // [ADDED] Scheduled meeting time — loaded on dashboard load for button state
  const [angelScheduledAt, setAngelScheduledAt] = useState(null);
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

  // [CHANGED] updateBalance: removed hardcoded initialCapital=15000 and totalFunding from messages.
  // [ADDED] now reads virtual_capital from DB as single source of truth.
  // virtual_capital is written to DB by loadDashboard (phase sync) and handleInvestmentDecision (investments).
  const updateBalance = useCallback(() => {
    if (!currentVenture) return;
    const startingCapital = currentVenture.virtual_capital || 0;
    const monthlyBurn = currentVenture.monthly_burn_rate || 5000;
    if (!currentVenture.burn_rate_start) {
      setLiveBalance(startingCapital);
      return;
    }
    const startTime = new Date(currentVenture.burn_rate_start).getTime();
    const now = new Date().getTime();
    const secondsElapsed = (now - startTime) / 1000;
    const burnPerSecond = monthlyBurn / (30 * 24 * 60 * 60);
    const calculated = Math.floor(Math.max(0, startingCapital - (secondsElapsed * burnPerSecond)));
    setLiveBalance(calculated);
  }, [currentVenture]);
  
// [CHANGED] updateValuation: removed local baseValues calculation.
// [ADDED] now reads valuation from DB as single source of truth.
// valuation is written to DB by loadDashboard (phase sync) and handleInvestmentDecision (investments).
const updateValuation = useCallback(() => {
  if (!currentVenture) return;
  setCurrentValuation(currentVenture.valuation || 0);
}, [currentVenture]);

  // [ADDED] Angel Arena — screening check. Runs on every dashboard load.
  // Checks pending screenings (after 36h) and missed meetings (after 20min window).
  // Silent fail — never crashes the dashboard.
  const runScreeningCheck = async (venture) => {
    try {
      // ── Pending screenings ──
      const pendingMeetings = await InvestorMeeting.filter({ venture_id: venture.id, status: 'pending_screening' });
      const now = new Date();

      for (const meeting of pendingMeetings) {
        const hoursElapsed = (now - new Date(meeting.screening_submitted_at)) / 1000 / 60 / 60;
      //if (hoursElapsed < 36) continue;
      if (hoursElapsed < 0.033) continue; // 2 דקות — לבדיקה בלבד

        const investors = await Investor.filter({ id: meeting.investor_id });
        if (!investors.length) continue;
        const investor = investors[0];

        let passed = true;
        let rejectReason = '';
        const fundingEvents = await FundingEvent.filter({ venture_id: venture.id });
        const hasAngelInvestment = fundingEvents.some(e => e.investment_type === 'angel');
        if (hasAngelInvestment) { passed = false; rejectReason = `Unfortunately, I have to pass. Your venture looks promising, but I don't co-invest alongside other angel investors. Best of luck!`; }

        if (investor.investor_type === 'no_go') {
          passed = false;
          rejectReason = `Thank you for reaching out. We are currently focusing on our existing portfolio and are not taking new investments at this time.`;
        } else if (investor.investor_type === 'team_focused' && (venture.founders_count || 1) < 2) {
          passed = false;
          rejectReason = `After reviewing your materials, we've decided to pass. We have a strong preference for ventures with multiple co-founders.`;
        } else if (investor.focus_sectors?.length > 0 && venture.sector && !investor.focus_sectors.includes(venture.sector)) {
          passed = false;
          rejectReason = `Thank you for sharing your business plan. Unfortunately, your venture's sector doesn't align with our current investment focus.`;
        }

        if (passed) {
          await InvestorMeeting.update(meeting.id, { status: 'screening_passed', screening_result: 'passed', screening_result_sent_at: now.toISOString() });
          await VentureMessage.create({
            venture_id: venture.id,
            message_type: 'angel_screening_passed',
            title: `🎉 ${investor.name} wants to meet you!`,
            content: `Great news! ${investor.name} reviewed your business plan and is interested in learning more. Go to Angel Arena to schedule your Zoom meeting. Good luck!`,
            phase: venture.phase,
            priority: 4,
            is_dismissed: false,
          });
        } else {
          await InvestorMeeting.update(meeting.id, { status: 'screening_rejected', screening_result: 'rejected', screening_result_sent_at: now.toISOString() });
          await VentureMessage.create({
            venture_id: venture.id,
            message_type: 'system',
            title: `📋 Response from ${investor.name}`,
            content: rejectReason,
            phase: venture.phase,
            priority: 2,
            is_dismissed: false,
          });
        }
      }

      // ── Missed meetings (scheduled but 20min window passed) ──
      const scheduledMeetings = await InvestorMeeting.filter({ venture_id: venture.id, meeting_status: 'scheduled' });
      for (const meeting of scheduledMeetings) {
        if (!meeting.meeting_scheduled_at) continue;
        const minutesSince = (now - new Date(meeting.meeting_scheduled_at)) / 1000 / 60;
        if (minutesSince <= 20) continue;

        const investors = await Investor.filter({ id: meeting.investor_id });
        const investorName = investors[0]?.name || 'The investor';
        await InvestorMeeting.update(meeting.id, { meeting_status: 'missed', status: 'screening_rejected' });
        await VentureMessage.create({
          venture_id: venture.id,
          message_type: 'system',
          title: `😔 Missed Meeting with ${investorName}`,
          content: `You missed your scheduled meeting with ${investorName}. The investor has moved on. You can try reaching out to other investors in the Angel Arena.`,
          phase: venture.phase,
          priority: 3,
          is_dismissed: false,
        });
      }
    } catch (err) {
      console.error('Angel screening check error:', err);
    }
  };

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
         
          // AUTO-FIX removed: previously forced phase='beta' when mlp_development_completed=true but mlp_completed=false.
          // This bypassed the 10 product_feedback requirement. Phase transition now happens exclusively in
          // mlp-development-center/page.jsx handleComplete().
         
          // Auto-check: if in beta phase and enough testers, move to growth
          if (activeVenture.phase === 'beta') {
            const betaTesters = await BetaTester.filter({ venture_id: activeVenture.id });
            if (betaTesters.length >= 10) {
              await Venture.update(activeVenture.id, { phase: 'growth' });
              await VentureMessage.create({
                venture_id: activeVenture.id,
                message_type: 'phase_complete',
                title: '🚀 Beta Phase Complete!',
                content: `Congratulations! You collected ${betaTesters.length} beta testers and are now moving to the Growth phase!`,
                phase: 'beta',
              });
              await VentureMessage.create({
                venture_id: activeVenture.id,
                message_type: 'phase_welcome',
                title: '📈 Welcome to Growth!',
                content: `It's time to scale your startup. Focus on growing your user base and securing funding.`,
                phase: 'growth',
              });
              activeVenture.phase = 'growth';
            }
          }

          // [ADDED] Sync valuation to DB based on current phase.
          // This ensures Financials page reads the correct value from DB.
          // Only updates if DB value is lower than expected (never overwrites a higher investment valuation).
          const phaseValuations = {
            business_plan: 250000,  // completed IDEA
            mvp: 500000,            // completed BUSINESS_PLAN
            mlp: 1000000,           // completed MVP
            beta: 2500000,          // completed MLP
            growth: 5000000,        // completed BETA
          };
          const expectedValuation = phaseValuations[activeVenture.phase];
          if (expectedValuation && (!activeVenture.valuation || activeVenture.valuation < expectedValuation)) {
            await Venture.update(activeVenture.id, { valuation: expectedValuation });
            activeVenture.valuation = expectedValuation;
          }

          // [ADDED] Sync virtual_capital to DB when entering MVP phase for the first time.
          // $15,000 is injected when Business Plan is completed and user moves to MVP.
          // Only sets it if not already set (so investments are never overwritten).
          if (activeVenture.phase === 'mvp' && !activeVenture.virtual_capital) {
            await Venture.update(activeVenture.id, { virtual_capital: 15000 });
            activeVenture.virtual_capital = 15000;
          }

          // [ADDED] Angel Arena — check pending screenings and missed meetings
          await runScreeningCheck(activeVenture);

          // [ADDED] Load scheduled angel meeting time for Join button state
          try {
            const scheduledMeetings = await InvestorMeeting.filter({ venture_id: activeVenture.id, meeting_status: 'scheduled' });
            if (scheduledMeetings.length > 0) {
              setAngelScheduledAt(new Date(scheduledMeetings[0].meeting_scheduled_at));
            } else {
              setAngelScheduledAt(null);
            }
          } catch (e) { setAngelScheduledAt(null); }

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
          investment_type: message.investment_type || 'VC',
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

  // [ADDED] Angel Arena — open schedule modal directly from dashboard message
  const handleAngelSchedule = async (message) => {
    try {
      // Find the meeting record via investor_meeting_id or by matching venture+screening_passed
      const meetings = await InvestorMeeting.filter({ venture_id: currentVenture.id, status: 'screening_passed' });
      if (!meetings.length) { alert("Could not find the meeting details."); return; }
      const meeting = meetings[0];
      const investors = await Investor.filter({ id: meeting.investor_id });
      if (!investors.length) { alert("Could not find the investor details."); return; }
      setSelectedAngelMeeting(meeting);
      setSelectedAngelInvestor(investors[0]);
      setIsAngelScheduleModalOpen(true);
    } catch (err) {
      console.error("Error opening angel schedule:", err);
    }
  };

  // [ADDED] Join angel meeting from dashboard — fetches meeting & investor from investor_meetings table
  // Checks meeting_scheduled_at to verify timing before opening PitchModal
  const handleJoinAngelMeeting = async () => {
    try {
      const meetings = await InvestorMeeting.filter({ venture_id: currentVenture.id, meeting_status: 'scheduled' });
      if (!meetings.length) { alert("Could not find the meeting details."); return; }
      const meeting = meetings[0];

      // Verify timing — must be within 20 minute window
      const now = new Date();
      const meetingTime = new Date(meeting.meeting_scheduled_at);
      // TESTING ONLY — remove after testing and uncomment the line below
     // const diffMin = 5;
      const diffMin = (now - meetingTime) / 1000 / 60;
      if (diffMin < 0 || diffMin > 20) { alert("The meeting is not active at this time."); return; }

      const investors = await Investor.filter({ id: meeting.investor_id });
      if (!investors.length) { alert("Could not find the investor details."); return; }
      setPitchInvestor(investors[0]);
      setIsAngelPitchOpen(true);
    } catch (err) {
      console.error("Error joining angel meeting:", err);
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

    // [CHANGED] Edit Landing Page hidden from MLP phase onwards
    if (currentPhaseIndex < PHASES_ORDER.indexOf('mlp')) {
      assets.push({
        id: 'edit_landing_page',
        title: 'Edit Landing Page',
        icon: Lightbulb,
        page: 'edit-landing-page' // createPageUrl will convert to /editlandingpage
      });
    }
   
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

if (currentPhaseIndex >= PHASES_ORDER.indexOf('mvp')) {
  assets.push({
  id: 'zigforge',
  title: 'ZigForge Studio',
  icon: Zap,
  page: 'zigforge'
});    
  assets.push({
        id: 'product_feedback',
        title: 'Product Feedback',
        icon: MessageSquare,
        page: 'product-feedback'
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
        title: 'Revenue Modeling',
        icon: BarChart3,
        page: 'revenue-modeling-experience', 
        openInNewWindow: true
      });
    }
   
    if (currentVenture.phase === 'mlp') {
      // [CHANGED] removed mlp_development_completed condition — show always while in MLP phase.
      // Button disappears automatically when user moves to Beta (phase changes).
      assets.push({
        id: 'mlp_development_center',
        title: 'MLP Development Center',
        icon: Heart,
        page: 'mlp-development-center'
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

      {/* [ADDED] Angel PitchModal — opened from dashboard Join Meeting button */}
      {isAngelPitchOpen && pitchInvestor && currentVenture && (
        <PitchModal
          investor={pitchInvestor}
          venture={currentVenture}
          isOpen={isAngelPitchOpen}
          onClose={() => {
            setIsAngelPitchOpen(false);
            setPitchInvestor(null);
            loadDashboard();
          }}
        />
      )}

      {/* [ADDED] Angel Arena Schedule Modal */}
      {isAngelScheduleModalOpen && selectedAngelInvestor && selectedAngelMeeting && (
        <ScheduleMeetingModal
          investor={selectedAngelInvestor}
          meeting={selectedAngelMeeting}
          onClose={() => {
            setIsAngelScheduleModalOpen(false);
            setSelectedAngelMeeting(null);
            setSelectedAngelInvestor(null);
            loadDashboard();
          }}
        />
      )}

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
                    console.log("Check message:", message);
                    const isInvestmentOffer = message.message_type === 'investment_offer';
                    const isRejection = message.message_type === 'investment_rejection';
                    const isVCMeeting = message.message_type === 'vc_meeting_request' || message.vc_stage === 'stage_2_ready';
                   const isVCAdvancedMeeting = message.message_type === 'vc_advanced_meeting_request' || message.vc_stage === 'stage_3_ready';

                    const isFeedbackRequest = message.message_type === 'feedback_request';
                    const isPromotion = message.message_type === 'promotion';
                    const isSystem = message.message_type === 'system' || message.message_type === 'phase_complete' || message.message_type === 'phase_welcome';
                    // [ADDED] Angel Arena messages
                    const isAngelScreeningPassed = message.message_type === 'angel_screening_passed';
                    const isAngelMeetingScheduled = message.message_type === 'angel_meeting_scheduled';

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
                    } else if (isAngelScreeningPassed) {
                      cardClass = 'bg-emerald-50 border-l-4 border-emerald-500';
                      icon = CheckCircle;
                      iconClass = 'text-emerald-600';
                    } else if (isAngelMeetingScheduled) {
                      cardClass = 'bg-indigo-50 border-l-4 border-indigo-400';
                      icon = Calendar;
                      iconClass = 'text-indigo-600';
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
{/* [ADDED] כפתור מחיקה להודעות action_required */}
{message.message_type === 'action_required' && (
  <Button
    variant="outline"
    size="sm"
    className="mt-2 text-gray-500 hover:bg-gray-50"
    onClick={() => dismissMessage(message)}
  >
    <X className="w-4 h-4 mr-2" /> Dismiss
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
                           
                          {message.message_type === 'external_feedback_invite' && (
                            <div className="mt-4">
                                <Button onClick={() => dismissMessage(message)} variant="outline">
                                    <X className="w-4 h-4 mr-2" /> Dismiss
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

                          {/* [ADDED] Angel screening passed — open schedule modal directly */}
                          {isAngelScreeningPassed && (
                            <div className="mt-4 flex gap-2">
                              <Button
                                onClick={() => handleAngelSchedule(message)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                              >
                                <CalendarClock className="w-4 h-4 mr-2" /> Schedule Meeting
                              </Button>
                              <Button onClick={() => dismissMessage(message)} variant="outline">
                                <X className="w-4 h-4 mr-2" /> Dismiss
                              </Button>
                            </div>
                          )}

                          {/* [ADDED] Angel meeting scheduled — show details, Dismiss only */}
                          {/* [ADDED] angel_meeting_scheduled — Join button active only during meeting window */}
                          {/* [ADDED] angel_meeting_scheduled — Join button disabled until meeting time */}
                          {isAngelMeetingScheduled && (() => {
                            const now = new Date();
                            const diffMin = angelScheduledAt ? (now - angelScheduledAt) / 1000 / 60 : -1;
                            const isActive = diffMin >= 0 && diffMin <= 20;
                            const meetingTimeStr = angelScheduledAt
                              ? angelScheduledAt.toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                              : '';
                            return (
                              <div className="mt-4 space-y-2">
                                <p className="text-xs text-gray-500">
                                  {isActive
                                    ? '🟢 Your meeting is live! You have 20 minutes to join.'
                                    : `⏰ Join button becomes active at ${meetingTimeStr}`
                                  }
                                </p>
                                <div className="flex gap-2">
                                  <Button
                                    onClick={handleJoinAngelMeeting}
                                    disabled={!isActive}
                                    className={isActive
                                      ? "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                    }
                                  >
                                    <Rocket className="w-4 h-4 mr-2" /> Join Meeting
                                  </Button>
                                  <Button onClick={() => dismissMessage(message)} variant="outline">
                                    <X className="w-4 h-4 mr-2" /> Dismiss
                                  </Button>
                                </div>
                              </div>
                            );
                          })()}
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


