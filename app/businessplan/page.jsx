//business plan 230226 updated
"use client"
import React, { useState, useEffect, useCallback, useRef } from "react";
import { businessPlan as businessPlanEntity } from "@/api/entities";
import { Budget } from "@/api/entities";
import { Venture } from "@/api/entities";
import { VentureMessage } from "@/api/entities";
import { User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Save, Loader2, Plus, Trash2 } from "lucide-react";
import { useRouter } from 'next/navigation';
import { createPageUrl } from "@/lib/utils";
import MentorButton from "@/components/mentor/MentorButton";
import MentorModal from "@/components/mentor/MentorModal";
import StaticGuidanceViewer from "@/components/mentor/StaticGuidanceViewer";


export default function businessPlan() {
  const [venture, setVenture] = useState(null);
  const [mission, setMission] = useState("");
  const [problem, setProblem] = useState("");
  const [solution, setSolution] = useState("");
  const [productDetails, setProductDetails] = useState("");
  const [marketSize, setMarketSize] = useState("");
  const [targetCustomers, setTargetCustomers] = useState("");
  const [competition, setCompetition] = useState("");
  const [entrepreneurBackground, setEntrepreneurBackground] = useState("");
  const [revenueModel, setRevenueModel] = useState("");
  const [fundingRequirements, setFundingRequirements] = useState("");

  // Maps this component's local (camelCase) field keys to the snake_case
  // keys used in zigConfig.js's FIELD_CONFIG — the two are named
  // differently on purpose (local state vs. AI-facing config), so this is
  // the single place that bridges them.
  const ZIG_KEY_MAP = {
    problem: 'problem',
    targetCustomers: 'target_customers',
    competition: 'competitive_landscape',
    marketSize: 'market_size',
    solution: 'solution',
    productDetails: 'product_details',
    entrepreneurBackground: 'founding_team',
    revenueModel: 'revenue_model',
    mission: 'mission',
    fundingRequirements: 'funding_requirements',
  };


  const [salaries, setSalaries] = useState([{ id: '1', role: 'Founder', count: 1, percentage: 100, avg_salary: 5000 }]);
  const [marketingCosts, setMarketingCosts] = useState([{ id: '1', channel: 'Social Media Ads', cost: 1000 }]);
  const [operationalCosts, setOperationalCosts] = useState([{ id: '1', item: 'Office Rent', cost: 2000 }]);


  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [staticGuidanceModal, setStaticGuidanceModal] = useState({ isOpen: false, sectionId: '' });
  const [mentorModal, setMentorModal] = useState({ isOpen: false, sectionId: '', sectionTitle: '', fieldKey: '' });
  const [showTipsHint, setShowTipsHint] = useState(true);
  const [showZigItHint, setShowZigItHint] = useState(false);
  // [ADDED 020826] Mobile Plan flow — one dominant "Continue with" card +
  // horizontal progress dots, confirmed this session. Same fields, same
  // autoSave, same handleSave as desktop — only the container/navigation
  // differs.
  const [isMobile, setIsMobile] = useState(false);
  const [expandedField, setExpandedField] = useState(null);
  // [FIX 020826] showNotifications/ventureMessages removed — notifications
  // now live in the global icon row (ClientLayout.jsx) + /notifications
  // page, not a dropdown built into this page.

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    const t1 = setTimeout(() => { setShowTipsHint(false); setShowZigItHint(true); }, 5000);
    const t2 = setTimeout(() => setShowZigItHint(false), 10000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // Browser tab label only — the route stays /businessplan, the file
  // and function name stay businessPlan, nothing else changes. This is
  // purely what the user sees in the tab.
  useEffect(() => {
    document.title = 'Plan';
  }, []);

  const router = useRouter();


  const debugSupabaseError = async (context, error, payload = null) => {
  console.groupCollapsed(`❌ [Supabase ${context}]`);
  console.error("Message:", error?.message || error);


  if (payload) console.log("Payload:", payload);


  // Supabase v2 returns richer error objects
  if (error && typeof error === "object") {
    for (const key of Object.keys(error)) {
      console.log(`${key}:`, error[key]);
    }
  }


  // In case it's a fetch response:
  if (error?.response) {
    try {
      const data = await error.response.json();
      console.log("Response JSON:", data);
    } catch (_) {}
  }


  console.groupEnd();
};




  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const user = await User.me();
      const ventures = await Venture.filter({ created_by: user.email }, "-created_date");


      if (ventures.length > 0) {
        const currentVenture = ventures[0];
        setVenture(currentVenture);

        const existingPlans = await businessPlanEntity.filter({ venture_id: currentVenture.id });


        if (existingPlans.length > 0) {
          const plan = existingPlans[0];
          setMission(plan.mission || "");
          setProblem(plan.problem || "");
          setSolution(plan.solution || "");
          setProductDetails(plan.product_details || "");
          setMarketSize(plan.market_size || "");
          setTargetCustomers(plan.target_customers || "");
          setCompetition(plan.competition || "");
          setEntrepreneurBackground(plan.founding_team || "");
          setRevenueModel(plan.revenue_model || "");
          setFundingRequirements(plan.funding_requirements || "");
        }


        const existingBudgets = await Budget.filter({ venture_id: currentVenture.id });
        if (existingBudgets.length > 0) {
          const budget = existingBudgets[0];
          if (budget.salaries && budget.salaries.length > 0) setSalaries(budget.salaries);
          if (budget.marketing_costs && budget.marketing_costs.length > 0) setMarketingCosts(budget.marketing_costs);
          if (budget.operational_costs && budget.operational_costs.length > 0) setOperationalCosts(budget.operational_costs);
        }
      }
    } catch (error) {
      debugSupabaseError("loadData", error);
      console.error("Error loading business plan:", error);
    }
    setIsLoading(false);
  }, []);


  useEffect(() => {
    loadData();
  }, [loadData]);


  const addSalaryRow = (role = '') => {
    setSalaries([...salaries, { id: Date.now().toString(), role: role, count: 1, percentage: 100, avg_salary: 0 }]);
  };


  const removeSalaryRow = (id) => {
    setSalaries(salaries.filter(s => s.id !== id));
  };


  const updateSalary = (id, field, value) => {
    setSalaries(salaries.map(s => s.id === id ? { ...s, [field]: value } : s));
  };


  const addMarketingRow = (channel = '') => {
    setMarketingCosts([...marketingCosts, { id: Date.now().toString(), channel: channel, cost: 0 }]);
  };


  const removeMarketingRow = (id) => {
    setMarketingCosts(marketingCosts.filter(m => m.id !== id));
  };


  const updateMarketing = (id, field, value) => {
    setMarketingCosts(marketingCosts.map(m => m.id === id ? { ...m, [field]: value } : m));
  };


  const addOperationalRow = (item = '') => {
    setOperationalCosts([...operationalCosts, { id: Date.now().toString(), item: item, cost: 0 }]);
  };


  const removeOperationalRow = (id) => {
    setOperationalCosts(operationalCosts.filter(o => o.id !== id));
  };


  const updateOperational = (id, field, value) => {
    setOperationalCosts(operationalCosts.map(o => o.id === id ? { ...o, [field]: value } : o));
  };


  const calculateTotalBudget = () => {
    const totalSalaries = salaries.reduce((sum, s) => sum + (s.count * s.avg_salary * (s.percentage / 100) * 24), 0);
    const totalMarketing = marketingCosts.reduce((sum, m) => sum + (m.cost * 24), 0);
    const totalOperational = operationalCosts.reduce((sum, o) => sum + (o.cost * 24), 0);
    return {
      salaries: totalSalaries,
      marketing: totalMarketing,
      operational: totalOperational,
      total: totalSalaries + totalMarketing + totalOperational,
      monthlyBurn: (totalSalaries + totalMarketing + totalOperational) / 12
    };
  };


  const calculateCompletion = () => {
    const sections = [
      mission, problem, solution, productDetails, marketSize,
      targetCustomers, competition, entrepreneurBackground, revenueModel, fundingRequirements
    ];
    const completed = sections.filter(s => s.trim().length >= 50).length;
    return Math.round((completed / sections.length) * 100);
  };


  const openMentorModal = (sectionId, sectionTitle, fieldKey) => {
    setMentorModal({ isOpen: true, sectionId, sectionTitle, fieldKey });
  };


  const closeMentorModal = () => {
    setMentorModal({ isOpen: false, sectionId: '', sectionTitle: '', fieldKey: '' });
  };


  const handleMentorUpdate = (newValue) => {
    if (mentorModal.fieldKey) {
      const setters = {
        mission: setMission,
        problem: setProblem,
        solution: setSolution,
        productDetails: setProductDetails,
        marketSize: setMarketSize,
        targetCustomers: setTargetCustomers,
        competition: setCompetition,
        entrepreneurBackground: setEntrepreneurBackground,
        revenueModel: setRevenueModel,
        fundingRequirements: setFundingRequirements
      };
      if (setters[mentorModal.fieldKey]) {
        setters[mentorModal.fieldKey](newValue);
      }
    }
  };


  // Safe getter instead of eval()
  const getFieldValue = (fieldKey) => {
    switch (fieldKey) {
      case 'mission': return mission;
      case 'problem': return problem;
      case 'solution': return solution;
      case 'productDetails': return productDetails;
      case 'marketSize': return marketSize;
      case 'targetCustomers': return targetCustomers;
      case 'competition': return competition;
      case 'entrepreneurBackground': return entrepreneurBackground;
      case 'revenueModel': return revenueModel;
      case 'fundingRequirements': return fundingRequirements;
      default: return '';
    }
  };


  const handleSave = async () => {
    if (!venture) return;


    setIsSaving(true);
    try {
      const user = await User.me();   // need this!
      const planData = {
        venture_id: venture.id,
        created_by_id: user.id || null,
        created_by: user.email,     // ←  Supabase ז400
        mission,
        problem,
        solution,
        product_details: productDetails,
        market_size: marketSize,
        target_customers: targetCustomers,
        competition,
        founding_team: entrepreneurBackground,
        revenue_model: revenueModel,
        funding_requirements: fundingRequirements,
        completion_percentage: calculateCompletion()
      };


      const existingPlans = await businessPlanEntity.filter({ venture_id: venture.id });
      if (existingPlans.length > 0) {
        await businessPlanEntity.update(existingPlans[0].id, planData);
      } else {
        await businessPlanEntity.create(planData);
      }


      const budgetData = {
        venture_id: venture.id,
        salaries,
        marketing_costs: marketingCosts,
        operational_costs: operationalCosts,
        is_complete: true,
        created_by: user.email,
        created_by_id: user.id || null,
      };


      const existingBudgets = await Budget.filter({ venture_id: venture.id });
      if (existingBudgets.length > 0) {
        await Budget.update(existingBudgets[0].id, budgetData);
      } else {
        await Budget.create(budgetData);
      }


      const completion = calculateCompletion();
      await Venture.update(venture.id, {
        business_plan_completion: completion,
        funding_plan_completed: true
      });


      if (completion === 100 && venture.phase === 'business_plan') {
  // 1. עדכון הנתונים הפיננסיים ב-Database
  await Venture.update(venture.id, { 
    phase: 'mvp',
    virtual_capital: 30000,          // הזרקת התקציב
    monthly_burn_rate: 5000,        // הגדרת קצב השריפה
   burn_rate_start: new Date().toISOString() // כאן השעון מתחיל לתקתק
  });

  // 2. יצירת ההודעה באנגלית כפי שביקשת
  // 1. קודם כל - הודעה על סיום התוכנית העסקית וקבלת הכסף
await VentureMessage.create({
  venture_id: venture.id,
  message_type: 'phase_complete',
  title: '💰 Capital Injection: $30,000',
  content: `Congratulations! Your plan is 100% complete. A starting capital of $30,000 has been deposited. Note: Your monthly burn rate is now set to $5,000.`,
  phase: 'business_plan',
  priority: 1,
  created_by: user.email,
  created_by_id: user.id || null
});

// 2. ורק אז - הודעת ברוכים הבאים לשלב הבא (MVP)
await VentureMessage.create({
  venture_id: venture.id,
  message_type: 'phase_welcome',
  title: '🚀 Welcome to MVP Phase!',
  content: 'Time to build your Minimum Viable Product. ZigForge is now available to design a visual prototype of your app. ',
  phase: 'mvp',
  priority: 2, // עדיפות גבוהה יותר כדי שזה יהיה הדבר הראשון שרואים מעל הודעת הכסף
  created_by: user.email,
  created_by_id: user.id || null
});

// [ADDED 020826] Example Projects — separate message, own type/icon, not
// merged into the phase_welcome message above. Links to a real example
// venture (PocketVet.zig) via from_venture_id/from_venture_landing_page_url,
// the same fields already used for cross-venture references elsewhere
// (feedback_request messages). is_sample marks this as system-generated
// content, not a real founder's activity.
await VentureMessage.create({
  venture_id: venture.id,
  message_type: 'example_project',
  title: '📚 Want to see how it works?',
  content: 'Explore an example project at this stage, see what the founder has built, and share your perspective.',
  phase: 'mvp',
  priority: 3,
  from_venture_id: 'ab85b600-875b-4755-b7af-ee155b0bdc34',
  from_venture_name: 'PocketVet.zig',
  from_venture_landing_page_url: '/venture-landing?id=ab85b600-875b-4755-b7af-ee155b0bdc34',
  is_sample: true,
  created_by: user.email,
  created_by_id: user.id || null
});
}


      alert("Business plan and funding plan saved successfully!");
      router.push(createPageUrl("Dashboard"));
    } catch (error) {
      debugSupabaseError("handleSave", error, { ventureId: venture?.id });
      console.error("Error saving business plan:", error);
      alert("There was an error saving your business plan. Please try again.");
    }
    setIsSaving(false);
  };


  const [activeTab, setActiveTab] = useState(0);

  // חישוב התקדמות לכל לשונית
  const tab1Fields = [problem, targetCustomers, competition, marketSize, solution, productDetails];
  const tab2Fields = [entrepreneurBackground, revenueModel, mission, fundingRequirements];

  const tabProgress = (fields) => {
    const completed = fields.filter(f => f.trim().length >= 50).length;
    return Math.round((completed / fields.length) * 100);
  };

  const tab1Progress = tabProgress(tab1Fields);
  const tab2Progress = tabProgress(tab2Fields);

  const getTabColor = (progress) => {
    if (progress === 100) return 'text-green-600 border-green-500 bg-green-50';
    if (progress > 0) return 'text-orange-600 border-orange-400 bg-orange-50';
    return 'text-gray-500 border-gray-200 bg-white';
  };

  const getTabDot = (progress) => {
    if (progress === 100) return '🟢';
    if (progress > 0) return '🟠';
    return '⚪';
  };

  // שמירה אוטומטית בין לשוניות (ללא מעבר שלב)
  const autoSave = async () => {
    if (!venture) return;
    try {
      const user = await User.me();
      const planData = {
        venture_id: venture.id,
        created_by_id: user.id || null,
        created_by: user.email,
        mission, problem, solution,
        product_details: productDetails,
        market_size: marketSize,
        target_customers: targetCustomers,
        competition,
        founding_team: entrepreneurBackground,
        revenue_model: revenueModel,
        funding_requirements: fundingRequirements,
        completion_percentage: calculateCompletion()
      };
      const existingPlans = await businessPlanEntity.filter({ venture_id: venture.id });
      if (existingPlans.length > 0) {
        await businessPlanEntity.update(existingPlans[0].id, planData);
      } else {
        await businessPlanEntity.create(planData);
      }
    } catch (e) {
      console.error('Auto-save failed:', e);
    }
  };

  // Timer-based autosave every 30s, on top of the existing tab-change
  // autosave. Uses a ref so the interval itself is created once (on
  // mount) but always calls the latest version of autoSave — otherwise
  // a plain setInterval would close over stale field values from
  // whichever render created it.
  const autoSaveRef = useRef(autoSave);
  useEffect(() => {
    autoSaveRef.current = autoSave;
  });

  useEffect(() => {
    const interval = setInterval(() => {
      autoSaveRef.current();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleTabChange = async (idx) => {
    await autoSave();
    setActiveTab(idx);
  };

  const tabs = [
    { label: 'Foundation', progress: tab1Progress, activeClass: 'border-indigo-500 bg-indigo-50 text-indigo-700', dotActive: 'bg-indigo-500', color: 'indigo' },
    { label: 'Venture Plan', progress: tab2Progress, activeClass: 'border-purple-500 bg-purple-50 text-purple-700', dotActive: 'bg-purple-500', color: 'purple' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const budget = calculateTotalBudget();
  const allComplete = calculateCompletion() === 100;

  // [FIX 020826] Mobile Plan — was 10 text fields + 3 budget categories
  // (13 sections). Budget removed from mobile entirely per this session's
  // decision — it doesn't map well to "one field per screen" and the
  // founder confirmed it shouldn't appear on mobile at all, not even
  // as an optional section. Desktop still has budget (now optional, see
  // below), just not mirrored here.
  const MOBILE_SECTIONS = [
    { key: 'mission', label: 'Mission', type: 'text', value: mission, setter: setMission, placeholder: "What's your venture's mission?", mentorId: 'mission_statement', mentorTitle: 'Mission Statement', tipsId: 'mission_statement' },
    { key: 'problem', label: 'The Problem', type: 'text', value: problem, setter: setProblem, placeholder: 'What problem are you solving?', mentorId: 'problem_statement', mentorTitle: 'Problem Statement', tipsId: 'problem_statement' },
    { key: 'solution', label: 'Your Solution', type: 'text', value: solution, setter: setSolution, placeholder: 'How do you solve it?', mentorId: 'proposed_solution', mentorTitle: 'Solution Overview', tipsId: 'proposed_solution' },
    { key: 'productDetails', label: 'Product Details', type: 'text', value: productDetails, setter: setProductDetails, placeholder: 'Describe your product.', mentorId: 'product_details', mentorTitle: 'Product/Service Details', tipsId: 'product_details' },
    { key: 'targetCustomers', label: 'Target Customers', type: 'text', value: targetCustomers, setter: setTargetCustomers, placeholder: 'Who is this for?', mentorId: 'target_customers', mentorTitle: 'Target Customers', tipsId: 'target_customers' },
    { key: 'marketSize', label: 'Market Size', type: 'text', value: marketSize, setter: setMarketSize, placeholder: 'How big is the opportunity?', mentorId: 'market_size', mentorTitle: 'Market Size & Opportunity', tipsId: 'market_size' },
    { key: 'competition', label: 'Competition', type: 'text', value: competition, setter: setCompetition, placeholder: 'Who else solves this?', mentorId: 'competition', mentorTitle: 'Competitive Landscape', tipsId: 'competitive_landscape' },
    { key: 'entrepreneurBackground', label: 'Founding Team', type: 'text', value: entrepreneurBackground, setter: setEntrepreneurBackground, placeholder: 'Why are you the right team?', mentorId: 'founding_team', mentorTitle: 'Founding Team', tipsId: 'founding_team' },
    { key: 'revenueModel', label: 'Revenue Model', type: 'text', value: revenueModel, setter: setRevenueModel, placeholder: 'How will you make money?', mentorId: 'revenue_model', mentorTitle: 'Revenue Model', tipsId: 'revenue_model' },
    { key: 'fundingRequirements', label: 'Funding Requirements', type: 'text', value: fundingRequirements, setter: setFundingRequirements, placeholder: 'What funding do you need?', mentorId: 'funding_requirements', mentorTitle: 'Funding Requirements', tipsId: 'funding_requirements' },
  ];

  const isMobileSectionDone = (s) => s.value.trim().length >= 50;

  // [FIX 020826] Moved these two up from further down in the file — they
  // used to be declared *after* this mobile early-return, which meant
  // referencing them from inside the mobile branch (needed for the newly
  // added MentorModal render there) threw a real ReferenceError at
  // runtime ("Cannot access before initialization" — a temporal-dead-zone
  // violation, since the mobile branch returns before the original
  // declaration line was ever reached). This was the actual cause of the
  // on-screen crash after adding Zig it to mobile.
  const allFieldValuesForZig = {
    problem,
    target_customers: targetCustomers,
    competitive_landscape: competition,
    market_size: marketSize,
    solution,
    product_details: productDetails,
    founding_team: entrepreneurBackground,
    revenue_model: revenueModel,
    mission,
    funding_requirements: fundingRequirements,
  };
  const firstPass = !venture?.phase || venture.phase === 'business_plan';

  if (isMobile) {
    const nextSection = MOBILE_SECTIONS.find(s => !isMobileSectionDone(s));
    const completedCount = MOBILE_SECTIONS.filter(isMobileSectionDone).length;
    const section = MOBILE_SECTIONS.find(s => s.key === expandedField);

    if (section) {
      return (
        <div className="fixed inset-0 bg-white z-50 flex flex-col p-4 overflow-y-auto">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={async () => { await autoSave(); setExpandedField(null); }} className="p-2 -ml-2">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <p className="font-semibold text-gray-900">{section.label}</p>
          </div>

          {section.type === 'text' && (
            <>
              <Textarea
                autoFocus
                value={section.value}
                onChange={(e) => section.setter(e.target.value)}
                placeholder={section.placeholder}
                className="flex-1 text-base resize-none border-0 focus-visible:ring-0 p-0"
              />
              <p className="text-xs text-gray-400 mb-2">{section.value.trim().length}/50 characters minimum</p>
              {/* [FIX 020826] Item 13: equal-width columns for Tips and Zig
                  it (Tips used to dominate the row, Zig it was a small
                  circle squeezed to the side). Item 14: short caption above
                  each button, explaining what it does — first time a
                  founder sees these on this screen. */}
              <div className="flex items-start gap-3 mb-3">
                <div className="flex-1 flex flex-col items-center gap-1">
                  <p className="text-[11px] text-gray-400 text-center">Writing guidance and examples</p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStaticGuidanceModal({ isOpen: true, sectionId: section.tipsId })}
                    className="w-full text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                  >
                    Tips
                  </Button>
                </div>
                <div className="flex-1 flex flex-col items-center gap-1">
                  <p className="text-[11px] text-gray-400 text-center">Get AI feedback or help writing</p>
                  <MentorButton onClick={() => openMentorModal(section.mentorId, section.mentorTitle, section.key)} />
                </div>
              </div>
            </>
          )}

          <Button onClick={async () => { await autoSave(); setExpandedField(null); }} className="w-full bg-indigo-600 hover:bg-indigo-700 mt-4">
            Save and continue
          </Button>

          {/* [ADDED 020826] These modals previously only rendered inside
              desktop's JSX tree — the Zig it/Tips buttons above would have
              opened nothing at all on mobile without this. */}
          <StaticGuidanceViewer
            isOpen={staticGuidanceModal.isOpen}
            onClose={() => setStaticGuidanceModal({ isOpen: false, sectionId: '' })}
            sectionId={staticGuidanceModal.sectionId}
          />
          <MentorModal
            isOpen={mentorModal.isOpen}
            onClose={closeMentorModal}
            documentType="business_plan"
            fieldKey={ZIG_KEY_MAP[mentorModal.fieldKey] || mentorModal.fieldKey}
            sectionTitle={mentorModal.sectionTitle}
            fieldValue={getFieldValue(mentorModal.fieldKey)}
            allFieldValues={allFieldValuesForZig}
            firstPass={firstPass}
            onUpdateField={handleMentorUpdate}
            ventureId={venture?.id}
          />
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50 p-4 relative">
        {/* [FIX 020826] Removed the duplicate name/phase header and bell —
            this was built before the icon row + notifications page were
            centralized into ClientLayout.jsx; it was a leftover from before
            that, causing a second bell icon with its own count on screen. */}
        <div className="mb-6">
          <p className="font-bold text-lg text-gray-900">{venture?.name || 'Plan'}</p>
          <p className="text-xs text-gray-400">Current phase: Plan</p>
        </div>

        {/* [FIX 020826] Replaced circles-with-numbers (which either
            overflowed off-screen or wrapped to a second, ugly row) with a
            single-row segmented bar — always fits in one line regardless of
            section count, per this session's decision. */}
        <div className="flex gap-1 mb-2">
          {MOBILE_SECTIONS.map((s, i) => {
            const done = isMobileSectionDone(s);
            const isCurrent = nextSection?.key === s.key;
            return (
              <div
                key={s.key}
                className={`flex-1 h-1.5 rounded-full ${
                  done ? 'bg-green-500' : isCurrent ? 'bg-indigo-600' : 'bg-gray-200'
                }`}
              />
            );
          })}
        </div>

        {/* Dominant "Continue with" card */}
        {nextSection ? (
          <button
            onClick={() => setExpandedField(nextSection.key)}
            className="w-full text-left bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-center justify-between mb-4"
          >
            <div>
              <p className="text-xs text-indigo-600 mb-0.5">Continue with</p>
              <p className="font-semibold text-gray-900">{nextSection.label}</p>
            </div>
            <ArrowLeft className="w-5 h-5 text-indigo-600 rotate-180" />
          </button>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4 text-center">
            <p className="font-semibold text-green-700">All sections complete!</p>
          </div>
        )}

        <p className="text-xs text-gray-400 text-center mb-6">{completedCount} of {MOBILE_SECTIONS.length} sections complete</p>

        <Button
          onClick={handleSave}
          disabled={isSaving || !allComplete}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
          size="lg"
        >
          {isSaving ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>) : (<><Save className="w-4 h-4 mr-2" />Save Plan</>)}
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">

          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Plan &amp; Foundation</h1>
              <p className="text-gray-600 mt-1 text-sm max-w-2xl">
                To sharpen a raw idea into something grounded and concrete, you need to connect it to the entrepreneurial and business environment it actually operates in. This stage isn't asking for deep competitor analysis or precise financial modeling — but it's where you start building the foundations for that, and put your core assumptions to the test.
              </p>
              <p className="text-gray-600 mt-2 text-sm max-w-2xl">
                Like any lean business plan, this isn't a document you fill out once and file away — it's a <strong>living document</strong>. In practice, new insights keep surfacing throughout the journey, and you're expected to come back and update the plan as you learn.
              </p>
            </div>
            <Button variant="outline" onClick={() => router.push(createPageUrl("Dashboard"))}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>

          {/* Overall progress */}
          <Card className="mb-6">
            <CardContent className="pt-4 pb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Overall Completion</span>
                <span className="text-sm text-gray-600">{calculateCompletion()}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-indigo-600 h-2 rounded-full transition-all" style={{ width: `${calculateCompletion()}%` }} />
              </div>
              <p className="text-xs text-gray-500 mt-2">Each section requires at least 50 characters</p>
            </CardContent>
          </Card>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            {tabs.map((tab, idx) => (
              <button
                key={idx}
                onClick={() => handleTabChange(idx)}
                className={`flex-1 py-3 px-4 rounded-xl border-2 font-semibold text-sm transition-all ${
                  activeTab === idx
                    ? tab.activeClass
                    : getTabColor(tab.progress)
                }`}
              >
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span>{getTabDot(tab.progress)}</span>
                  <span>{tab.label}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1">
                  <div
                    className={`h-1 rounded-full transition-all ${tab.progress === 100 ? 'bg-green-500' : 'bg-orange-400'}`}
                    style={{ width: `${tab.progress}%` }}
                  />
                </div>
                <div className="text-xs mt-1 opacity-70">{tab.progress}%</div>
              </button>
            ))}
          </div>

          {/* Tab 1 - Foundation */}
          {activeTab === 0 && (
            <div className="space-y-6">
              <Card className="border-indigo-200">
                <CardHeader className="bg-indigo-50 rounded-t-xl">
                  <div className="flex justify-between items-start">
                    <div><CardTitle className="text-indigo-800">1. Problem Statement</CardTitle><CardDescription>What specific problem does your venture solve?</CardDescription></div>
                    <div className="flex gap-2">
                      <div className="relative">
                        {showTipsHint && (
                          <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 w-44 z-10 shadow-lg text-center">
                            A quick look at what belongs here
                            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                          </div>
                        )}
                        <Button type="button" variant="outline" size="sm" onClick={() => setStaticGuidanceModal({ isOpen: true, sectionId: 'problem_statement' })} className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200">Tips</Button>
                      </div>
                      <div className="relative">
                        {showZigItHint && (
                          <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 w-52 z-10 shadow-lg text-center">
                            Get feedback and a quality score on what you've written
                            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                          </div>
                        )}
                        <MentorButton onClick={() => openMentorModal('problem_statement', 'Problem Statement', 'problem')} />
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Textarea value={problem} onChange={(e) => setProblem(e.target.value)} placeholder="Describe the problem..." className="min-h-[100px]" />
                  <p className="text-xs text-gray-500 mt-1">{problem.trim().length}/50 characters minimum</p>
                </CardContent>
              </Card>

              <Card className="border-indigo-200">
                <CardHeader className="bg-indigo-50 rounded-t-xl">
                  <div className="flex justify-between items-start">
                    <div><CardTitle className="text-indigo-800">2. Target Customers</CardTitle><CardDescription>Who are your ideal customers?</CardDescription></div>
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => setStaticGuidanceModal({ isOpen: true, sectionId: 'target_customers' })} className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200">Tips</Button>
                      <MentorButton onClick={() => openMentorModal('target_customers', 'Target Customers', 'targetCustomers')} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Textarea value={targetCustomers} onChange={(e) => setTargetCustomers(e.target.value)} placeholder="Describe your target customers..." className="min-h-[100px]" />
                  <p className="text-xs text-gray-500 mt-1">{targetCustomers.trim().length}/50 characters minimum</p>
                </CardContent>
              </Card>

              <Card className="border-indigo-200">
                <CardHeader className="bg-indigo-50 rounded-t-xl">
                  <div className="flex justify-between items-start">
                    <div><CardTitle className="text-indigo-800">3. Competitive Landscape</CardTitle><CardDescription>Who are your main competitors and what's your advantage?</CardDescription></div>
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => setStaticGuidanceModal({ isOpen: true, sectionId: 'competitive_landscape' })} className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200">Tips</Button>
                      <MentorButton onClick={() => openMentorModal('competition', 'Competitive Landscape', 'competition')} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Textarea value={competition} onChange={(e) => setCompetition(e.target.value)} placeholder="Describe your competition..." className="min-h-[100px]" />
                  <p className="text-xs text-gray-500 mt-1">{competition.trim().length}/50 characters minimum</p>
                </CardContent>
              </Card>

              <Card className="border-indigo-200">
                <CardHeader className="bg-indigo-50 rounded-t-xl">
                  <div className="flex justify-between items-start">
                    <div><CardTitle className="text-indigo-800">4. Market Size & Opportunity</CardTitle><CardDescription>What is the size of your target market?</CardDescription></div>
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => setStaticGuidanceModal({ isOpen: true, sectionId: 'market_size' })} className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200">Tips</Button>
                      <MentorButton onClick={() => openMentorModal('market_size', 'Market Size & Opportunity', 'marketSize')} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Textarea value={marketSize} onChange={(e) => setMarketSize(e.target.value)} placeholder="Describe your market..." className="min-h-[100px]" />
                  <p className="text-xs text-gray-500 mt-1">{marketSize.trim().length}/50 characters minimum</p>
                </CardContent>
              </Card>

              <Card className="border-indigo-200">
                <CardHeader className="bg-indigo-50 rounded-t-xl">
                  <div className="flex justify-between items-start">
                    <div><CardTitle className="text-indigo-800">5. Solution Overview</CardTitle><CardDescription>How does your venture solve this problem?</CardDescription></div>
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => setStaticGuidanceModal({ isOpen: true, sectionId: 'proposed_solution' })} className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200">Tips</Button>
                      <MentorButton onClick={() => openMentorModal('proposed_solution', 'Solution Overview', 'solution')} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Textarea value={solution} onChange={(e) => setSolution(e.target.value)} placeholder="Describe your solution..." className="min-h-[100px]" />
                  <p className="text-xs text-gray-500 mt-1">{solution.trim().length}/50 characters minimum</p>
                </CardContent>
              </Card>

              <Card className="border-indigo-200">
                <CardHeader className="bg-indigo-50 rounded-t-xl">
                  <div className="flex justify-between items-start">
                    <div><CardTitle className="text-indigo-800">6. Product/Service Details</CardTitle><CardDescription>Describe your product or service features</CardDescription></div>
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => setStaticGuidanceModal({ isOpen: true, sectionId: 'product_details' })} className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200">Tips</Button>
                      <MentorButton onClick={() => openMentorModal('product_details', 'Product/Service Details', 'productDetails')} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Textarea value={productDetails} onChange={(e) => setProductDetails(e.target.value)} placeholder="Describe your product..." className="min-h-[100px]" />
                  <p className="text-xs text-gray-500 mt-1">{productDetails.trim().length}/50 characters minimum</p>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button onClick={() => handleTabChange(1)} className="bg-indigo-600 hover:bg-indigo-700">
                  Next: Venture Plan →
                </Button>
              </div>
            </div>
          )}

          {/* Tab 2 - Venture Plan */}
          {activeTab === 1 && (
            <div className="space-y-6">
              <Card className="border-purple-200">
                <CardHeader className="bg-purple-50 rounded-t-xl">
                  <div className="flex justify-between items-start">
                    <div><CardTitle className="text-purple-800">7. Founding Team</CardTitle><CardDescription>What roles or expertise will this venture need, and where are the gaps today?</CardDescription></div>
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => setStaticGuidanceModal({ isOpen: true, sectionId: 'founding_team' })} className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200">Tips</Button>
                      <MentorButton onClick={() => openMentorModal('founding_team', 'Founding Team', 'entrepreneurBackground')} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Textarea value={entrepreneurBackground} onChange={(e) => setEntrepreneurBackground(e.target.value)} placeholder="Describe the team and roles this venture will need..." className="min-h-[100px]" />
                  <p className="text-xs text-gray-500 mt-1">{entrepreneurBackground.trim().length}/50 characters minimum</p>
                </CardContent>
              </Card>

              {/* Revenue Model */}
              <Card className="border-purple-200">
                <CardHeader className="bg-purple-50 rounded-t-xl">
                  <div className="flex justify-between items-start">
                    <div><CardTitle className="text-purple-800">8. Revenue Model</CardTitle><CardDescription>How will your venture make money?</CardDescription></div>
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => setStaticGuidanceModal({ isOpen: true, sectionId: 'revenue_model' })} className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200">Tips</Button>
                      <MentorButton onClick={() => openMentorModal('revenue_model', 'Revenue Model', 'revenueModel')} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Textarea value={revenueModel} onChange={(e) => setRevenueModel(e.target.value)} placeholder="Describe how you'll make money..." className="min-h-[100px]" />
                  <p className="text-xs text-gray-500 mt-1">{revenueModel.trim().length}/50 characters minimum</p>
                </CardContent>
              </Card>

              {/* Mission Statement */}
              <Card className="border-purple-200">
                <CardHeader className="bg-purple-50 rounded-t-xl">
                  <div className="flex justify-between items-start">
                    <div><CardTitle className="text-purple-800">9. Mission Statement</CardTitle><CardDescription>Now that you've mapped the problem, market, and solution — what's the core purpose behind it?</CardDescription></div>
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => setStaticGuidanceModal({ isOpen: true, sectionId: 'mission_statement' })} className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200">Tips</Button>
                      <MentorButton onClick={() => openMentorModal('mission_statement', 'Mission Statement', 'mission')} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Textarea value={mission} onChange={(e) => setMission(e.target.value)} placeholder="Describe your company's mission..." className="min-h-[100px]" />
                  <p className="text-xs text-gray-500 mt-1">{mission.trim().length}/50 characters minimum</p>
                </CardContent>
              </Card>

              {/* Funding Requirements */}
              <Card className="border-purple-200">
                <CardHeader className="bg-purple-50 rounded-t-xl">
                  <div className="flex justify-between items-start">
                    <div><CardTitle className="text-purple-800">10. Funding Requirements</CardTitle><CardDescription>How much funding do you need and how will you use it?</CardDescription></div>
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => setStaticGuidanceModal({ isOpen: true, sectionId: 'funding_requirements' })} className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200">Tips</Button>
                      <MentorButton onClick={() => openMentorModal('funding_requirements', 'Funding Requirements', 'fundingRequirements')} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Textarea value={fundingRequirements} onChange={(e) => setFundingRequirements(e.target.value)} placeholder="Describe your funding needs..." className="min-h-[100px]" />
                  <p className="text-xs text-gray-500 mt-1">{fundingRequirements.trim().length}/50 characters minimum</p>
                </CardContent>
              </Card>

              {/* Budget */}
              <Card className="border-purple-200">
                <CardHeader className="bg-purple-50 rounded-t-xl">
                  <div className="flex justify-between items-start">
                    <div><CardTitle className="text-purple-800">Funding Plan & Budget Breakdown</CardTitle><CardDescription>Plan your monthly operational expenses and funding requirements for your first two years</CardDescription></div>
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => setStaticGuidanceModal({ isOpen: true, sectionId: 'budget_planning' })} className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200">Tips</Button>
                      <MentorButton onClick={() => openMentorModal('budget_planning', 'Budget Planning', '')} />
                    </div>
                  </div>
                  {/* [FIX 020826] Explicit "this is optional" note — was
                      never actually enforced as required (not part of
                      calculateCompletion), but that wasn't stated anywhere,
                      so it read as mandatory. */}
                  <p className="text-xs text-purple-700 bg-purple-100/60 rounded-lg px-3 py-2 mt-2">
                    This section is optional. If it feels too early to plan your budget in detail, feel free to skip it for now — you can always come back to it later.
                  </p>
                </CardHeader>
                <CardContent className="space-y-8">
                  {/* Team Salaries */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">Team Salaries (Monthly)</h3>
                      <div className="flex gap-2">
                        <select onChange={(e) => { if (e.target.value) { addSalaryRow(e.target.value); e.target.value = ''; } }} className="border rounded px-3 py-1 text-sm">
                          <option value="">Select Role...</option>
                          <optgroup label="Engineering">
                            <option value="CTO">CTO</option>
                            <option value="Full Stack Developer">Full Stack Developer</option>
                            <option value="Frontend Developer">Frontend Developer</option>
                            <option value="Backend Developer">Backend Developer</option>
                            <option value="Mobile Developer">Mobile Developer</option>
                            <option value="DevOps Engineer">DevOps Engineer</option>
                          </optgroup>
                          <optgroup label="Product & Design">
                            <option value="Product Manager">Product Manager</option>
                            <option value="UI/UX Designer">UI/UX Designer</option>
                            <option value="Product Designer">Product Designer</option>
                          </optgroup>
                          <optgroup label="Business & Operations">
                            <option value="CEO">CEO</option>
                            <option value="COO">COO</option>
                            <option value="CFO">CFO</option>
                            <option value="Business Development">Business Development</option>
                          </optgroup>
                          <optgroup label="Marketing & Sales">
                            <option value="CMO">CMO</option>
                            <option value="Marketing Manager">Marketing Manager</option>
                            <option value="Sales Manager">Sales Manager</option>
                            <option value="Content Creator">Content Creator</option>
                          </optgroup>
                          <optgroup label="Other">
                            <option value="HR Manager">HR Manager</option>
                            <option value="Customer Support">Customer Support</option>
                          </optgroup>
                        </select>
                        <Button type="button" onClick={() => addSalaryRow('')} size="sm"><Plus className="w-4 h-4 mr-2" />Custom Role</Button>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {salaries.map((salary) => (
                        <div key={salary.id} className="grid grid-cols-12 gap-3 items-center">
                          <div className="col-span-3"><Input value={salary.role} onChange={(e) => updateSalary(salary.id, 'role', e.target.value)} placeholder="Role" /></div>
                          <div className="col-span-2"><Input type="number" value={salary.count} onChange={(e) => updateSalary(salary.id, 'count', parseInt(e.target.value) || 0)} placeholder="Count" /></div>
                          <div className="col-span-2">
                            <select value={salary.percentage} onChange={(e) => updateSalary(salary.id, 'percentage', parseInt(e.target.value))} className="w-full border rounded px-3 py-2">
                              <option value="25">25%</option>
                              <option value="50">50%</option>
                              <option value="75">75%</option>
                              <option value="100">100%</option>
                            </select>
                          </div>
                          <div className="col-span-2"><Input type="number" value={salary.avg_salary} onChange={(e) => updateSalary(salary.id, 'avg_salary', parseInt(e.target.value) || 0)} placeholder="Salary" /></div>
                          <div className="col-span-2 text-sm font-medium">${((salary.count * salary.avg_salary * (salary.percentage / 100))).toLocaleString()}</div>
                          <div className="col-span-1"><Button type="button" variant="ghost" size="sm" onClick={() => removeSalaryRow(salary.id)} disabled={salaries.length === 1}><Trash2 className="w-4 h-4" /></Button></div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg"><p className="text-sm font-medium">Total 2-Year Salaries: ${budget.salaries.toLocaleString()}</p></div>
                  </div>

                  {/* Marketing Costs */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">Marketing Costs (Monthly)</h3>
                      <div className="flex gap-2">
                        <select onChange={(e) => { if (e.target.value) { addMarketingRow(e.target.value); e.target.value = ''; } }} className="border rounded px-3 py-1 text-sm">
                          <option value="">Select Channel...</option>
                          <optgroup label="Digital Marketing">
                            <option value="Google Ads">Google Ads</option>
                            <option value="Facebook Ads">Facebook Ads</option>
                            <option value="Instagram Ads">Instagram Ads</option>
                            <option value="LinkedIn Ads">LinkedIn Ads</option>
                            <option value="TikTok Ads">TikTok Ads</option>
                            <option value="Twitter Ads">Twitter Ads</option>
                          </optgroup>
                          <optgroup label="Content & SEO">
                            <option value="SEO Services">SEO Services</option>
                            <option value="Content Creation">Content Creation</option>
                            <option value="Video Production">Video Production</option>
                            <option value="Influencer Marketing">Influencer Marketing</option>
                          </optgroup>
                          <optgroup label="Traditional">
                            <option value="PR & Media">PR & Media</option>
                            <option value="Events & Sponsorships">Events & Sponsorships</option>
                            <option value="Print Advertising">Print Advertising</option>
                          </optgroup>
                          <optgroup label="Tools & Software">
                            <option value="Email Marketing (Mailchimp)">Email Marketing (Mailchimp)</option>
                            <option value="Marketing Automation">Marketing Automation</option>
                            <option value="Analytics Tools">Analytics Tools</option>
                          </optgroup>
                        </select>
                        <Button type="button" onClick={() => addMarketingRow('')} size="sm"><Plus className="w-4 h-4 mr-2" />Custom</Button>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {marketingCosts.map((marketing) => (
                        <div key={marketing.id} className="grid grid-cols-12 gap-3 items-center">
                          <div className="col-span-6"><Input value={marketing.channel} onChange={(e) => updateMarketing(marketing.id, 'channel', e.target.value)} placeholder="Marketing Channel" /></div>
                          <div className="col-span-5"><Input type="number" value={marketing.cost} onChange={(e) => updateMarketing(marketing.id, 'cost', parseInt(e.target.value) || 0)} placeholder="Monthly Cost" /></div>
                          <div className="col-span-1"><Button type="button" variant="ghost" size="sm" onClick={() => removeMarketingRow(marketing.id)} disabled={marketingCosts.length === 1}><Trash2 className="w-4 h-4" /></Button></div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 p-3 bg-green-50 rounded-lg"><p className="text-sm font-medium">Total 2-Year Marketing: ${budget.marketing.toLocaleString()}</p></div>
                  </div>

                  {/* Operational Costs */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">Operational Costs (Monthly)</h3>
                      <div className="flex gap-2">
                        <select onChange={(e) => { if (e.target.value) { addOperationalRow(e.target.value); e.target.value = ''; } }} className="border rounded px-3 py-1 text-sm">
                          <option value="">Select Item...</option>
                          <optgroup label="Office & Infrastructure">
                            <option value="Office Rent">Office Rent</option>
                            <option value="Co-working Space">Co-working Space</option>
                            <option value="Utilities (Electric, Water)">Utilities (Electric, Water)</option>
                            <option value="Internet & Telecom">Internet & Telecom</option>
                            <option value="Office Supplies">Office Supplies</option>
                          </optgroup>
                          <optgroup label="Software & Tools">
                            <option value="AWS/Cloud Hosting">AWS/Cloud Hosting</option>
                            <option value="SaaS Subscriptions">SaaS Subscriptions</option>
                            <option value="Design Tools (Figma, Adobe)">Design Tools (Figma, Adobe)</option>
                            <option value="Project Management Tools">Project Management Tools</option>
                            <option value="CRM Software">CRM Software</option>
                          </optgroup>
                          <optgroup label="Legal & Finance">
                            <option value="Legal Services">Legal Services</option>
                            <option value="Accounting Services">Accounting Services</option>
                            <option value="Insurance">Insurance</option>
                            <option value="Banking Fees">Banking Fees</option>
                          </optgroup>
                          <optgroup label="Other">
                            <option value="Travel & Transportation">Travel & Transportation</option>
                            <option value="Training & Development">Training & Development</option>
                            <option value="Customer Support Tools">Customer Support Tools</option>
                          </optgroup>
                        </select>
                        <Button type="button" onClick={() => addOperationalRow('')} size="sm"><Plus className="w-4 h-4 mr-2" />Custom</Button>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {operationalCosts.map((operational) => (
                        <div key={operational.id} className="grid grid-cols-12 gap-3 items-center">
                          <div className="col-span-6"><Input value={operational.item} onChange={(e) => updateOperational(operational.id, 'item', e.target.value)} placeholder="Operational Item" /></div>
                          <div className="col-span-5"><Input type="number" value={operational.cost} onChange={(e) => updateOperational(operational.id, 'cost', parseInt(e.target.value) || 0)} placeholder="Monthly Cost" /></div>
                          <div className="col-span-1"><Button type="button" variant="ghost" size="sm" onClick={() => removeOperationalRow(operational.id)} disabled={operationalCosts.length === 1}><Trash2 className="w-4 h-4" /></Button></div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 p-3 bg-purple-50 rounded-lg"><p className="text-sm font-medium">Total 2-Year Operations: ${budget.operational.toLocaleString()}</p></div>
                  </div>

                  <div className="p-6 bg-indigo-50 rounded-lg border-2 border-indigo-200">
                    <h3 className="text-xl font-bold text-indigo-900 mb-4">Total 2-Year Budget</h3>
                    <p className="text-3xl font-bold text-indigo-600 mb-2">${budget.total.toLocaleString()}</p>
                    <p className="text-sm text-indigo-700">Monthly Burn: ${budget.monthlyBurn.toLocaleString()}</p>
                    <p className="text-xs text-indigo-600 mt-3 italic">This budget serves as a projection for investors and will not impact your actual venture balance until funding is secured.</p>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between items-center">
                <Button variant="outline" onClick={() => handleTabChange(0)}>← Back</Button>


                {!allComplete && (
                  <p className="text-sm text-amber-600 font-medium">⚠️ Complete all sections to save your plan</p>
                )}

                <Button
                  onClick={handleSave}
                  disabled={isSaving || !allComplete}
                  className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
                  size="lg"
                >
                  {isSaving ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
                  ) : (
                    <><Save className="w-4 h-4 mr-2" />Save Plan</>
                  )}
                </Button>
              </div>
            </div>
          )}

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
        documentType="business_plan"
        fieldKey={ZIG_KEY_MAP[mentorModal.fieldKey] || mentorModal.fieldKey}
        sectionTitle={mentorModal.sectionTitle}
        fieldValue={getFieldValue(mentorModal.fieldKey)}
        allFieldValues={allFieldValuesForZig}
        firstPass={firstPass}
        onUpdateField={handleMentorUpdate}
        ventureId={venture?.id}
      />
    </>
  );
}

