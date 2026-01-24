"use client";
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { DollarSign, Users, TrendingUp, Zap, MinusCircle, Globe, Briefcase, Lock, Monitor, Shuffle, Speaker, Target, Info, MessageSquare } from 'lucide-react';
import { InvokeLLM } from '@/api/integrations';
import { Venture } from '@/api/entities.js';
import { User } from '@/api/entities.js';

// --- Configuration Constants ---
const MONTHS = 24;
const TRANSACTION_RATE = 0.005;
const TARGET_MARKET_SCALING = 10000000;
const ORGANIC_K_FACTOR = 0.65;

// --- Helper for formatting large numbers ---
const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(0) + 'K';
  return Math.floor(num).toLocaleString();
};

// --- Guidance Content Data Structure (Updated with PDF content) ---
const GUIDANCE_CONTENT = {
  Tier1Price: {
    title: "Tier 1 Price (Monthly ARPU)",
    body: "How much users pay or how much you earn per user (ARPU).",
    why: "Revenue per user directly shapes profitability.",
    example: "Subscription: $9.99 per month."
  },
  Tier2Price: {
    title: "Tier 2 Price (Upsell ARPU)",
    body: "The monthly price for your premium tier.",
    why: "Higher-tier pricing is essential for maximizing ARPU.",
    example: "A $50 Tier 1 user upgrading to $150 Tier 2 triples their value."
  },
  Tier2ConversionSplit: {
    title: "Tier 2 Conversion Split (% of Paid Users)",
    body: "The percentage of your total paying users who subscribe to Tier 2.",
    why: "This is crucial for predicting revenue mix.",
    example: "If you have 1,000 paying users and a 70% Tier 2 split, 700 are on Tier 2."
  },
  TrialToPaidConversion: {
    title: "Free-to-Paid Conversion Rate",
    body: "The share of free users who become paying users each month.",
    why: "Small increases here dramatically impact revenue.",
    example: "100K free users with a 2% conversion = 2,000 new paying users/month. If conversion rises to 4%, you double paid users."
  },
  AdRevenuePer1000: {
    title: "Ad Revenue Per 1000 Users (Monthly)",
    body: "How much you earn per 1000 users from advertising.",
    why: "This defines the efficiency of your ad monetization.",
    example: "Ad-driven: $0.05 ad revenue per active user."
  },
  AvgTransactionValue: {
    title: "Average Transaction Value (Fee/Commission)",
    body: "The average commission, fee, or markup earned per transaction.",
    why: "This defines revenue in Transactional models.",
    example: "Transactional: $2 per purchase. With 1M users → 5,000 transactions/month at 0.5% activity rate."
  },
  MonthlyMarketingBudget: {
    title: "Monthly Marketing Budget",
    body: "The money you spend monthly on marketing to attract users.",
    why: "Bigger budgets mean more users, but only if acquisition costs are reasonable.",
    example: "Spending $50K/month at $25 CAC = 2,000 new users each month."
  },
  CACPerUser: {
    title: "Customer Acquisition Cost (CAC)",
    body: "How much you spend to acquire a single new user.",
    why: "Lower CAC = more users for the same budget. High CAC means inefficient marketing.",
    example: "$10 CAC with a $100K budget = 10,000 users; $50 CAC = only 2,000 users."
  },
  InitialUsers: {
    title: "Initial Users (Beta/Waitlist)",
    body: "The number of users you start with at month 1.",
    why: "This sets the starting point for your growth trajectory.",
    example: "Starting with 10,000 initial users gives you a much stronger base than starting with 100."
  },
  ChurnRisk: {
    title: "Churn Risk (Monthly %)",
    body: "The percentage of users who leave each month.",
    why: "High churn kills growth. Even huge marketing spend can't overcome massive losses.",
    example: "At 5% churn with 100K users, you lose 5K per month. Cutting churn to 2% keeps 3K more users monthly — compounding to tens of thousands over time."
  },
  TargetMarketFactor: {
    title: "Target Market Factor (Scaled Capacity)",
    body: "The maximum possible user base (market cap).",
    why: "Even with viral growth, you can't exceed your market size. Growth slows as you approach the market cap.",
    example: "At 3X, your ceiling is 30M users. Growth slows as you approach that cap."
  },
};

// --- Business Model Data & Styling ---
const MODEL_OPTIONS = [
  { value: 'subscription', name: 'Subscription', description: 'Monthly/Annual recurring fees.', indicatorColor: 'text-blue-500', borderColor: 'border-blue-500', bgColor: 'bg-blue-500/20' },
  { value: 'freemium', name: 'Freemium', description: 'Ad-supported free tier with paid conversion.', indicatorColor: 'text-green-500', borderColor: 'border-green-500', bgColor: 'bg-green-500/20' },
  { value: 'transactional', name: 'Transactional', description: 'Per-transaction fees or commissions.', indicatorColor: 'text-red-500', borderColor: 'border-red-500', bgColor: 'bg-red-500/20' },
  { value: 'ad-driven', name: 'Ad-Driven', description: 'Free product, revenue solely from ads.', indicatorColor: 'text-yellow-500', borderColor: 'border-yellow-500', bgColor: 'bg-yellow-500/20' },
];

const BUSINESS_MODEL_GUIDANCE = {
  subscription: {
    name: "Subscription",
    description: "Revenue comes solely from recurring fees (Tier 1 & Tier 2). Focus is on maximizing ARPU and minimizing Churn.",
    example: "Spotify Premium is subscription-based. Different models rely on different revenue levers."
  },
  freemium: {
    name: "Freemium",
    description: "Hybrid model: Free users generate Ad Revenue, while a subset converts to Paid Tiers (Tier 1 & 2). Focus is on Conversion Rate and Ad Revenue Per 1000.",
    example: "Subscription depends on recurring fees, while ad-driven relies on engagement."
  },
  'ad-driven': {
    name: "Ad-Driven",
    description: "All revenue comes from advertisements served to the entire user base. Focus is exclusively on Total Users and Ad Revenue Per 1000.",
    example: "YouTube is ad-driven. Large user bases drive brand power, ad reach, and market dominance."
  },
  transactional: {
    name: "Transactional",
    description: "Revenue is generated from fees or commissions on individual transactions (e.g., marketplaces). Focus is on Total Active Users and Average Transaction Value.",
    example: "With 1M users and 0.5% activity rate → 5,000 transactions/month."
  }
};

// --- Modal Component ---
const GuidanceModal = ({ content, onClose }) => {
  if (!content) return null;
  // The isModelGuidance logic is now effectively unused because BUSINESS_MODEL_GUIDANCE
  // is displayed inline, and this modal is only for individual slider guidance.
  // The structure expected for sections is not present in the new GUIDANCE_CONTENT
  // so this will correctly fall through to the non-model guidance rendering.
  const isModelGuidance = Array.isArray(content.sections);

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg transform transition-all scale-100 opacity-100 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-4 border-b pb-2">
          <h3 className="text-2xl font-bold text-blue-700">{content.title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition p-1 rounded-full hover:bg-gray-100" aria-label="Close modal">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        <div className="text-gray-700 leading-relaxed space-y-4">
          <p className="mb-4">
            <strong className="text-blue-600">Overview:</strong> {content.body}
          </p>
          {isModelGuidance ? (
            <div className="space-y-4">
              {/* This block is not reachable with the new GUIDANCE_CONTENT structure for individual sliders */}
              {content.sections.map((section, index) => (
                <div key={index} className="p-3 border-l-4 border-gray-300 rounded-md bg-gray-50">
                  <h4 className={`text-lg font-bold ${section.color}`}>{section.name} Model</h4>
                  <p className="mt-1 text-sm">{section.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <>
              <p>
                <strong className="text-red-600">Why it matters:</strong> {content.why}
              </p>
              <div className="p-3 bg-gray-100 border-l-4 border-gray-300 rounded-md">
                <p className="font-mono text-sm">
                  <strong className="text-gray-600">Example:</strong> {content.example}
                </p>
              </div>
            </>
          )}
        </div>
        <button onClick={onClose} className="mt-6 w-full py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition">
          Got It
        </button>
      </div>
    </div>
  );
};const GuidanceModal = ({ content, onClose }) => {
  if (!content) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'red', // רקע אדום בוהק - אי אפשר לפספס
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          backgroundColor: 'white',
          padding: '50px',
          color: 'black',
          fontSize: '30px',
          fontWeight: 'bold',
          border: '10px solid blue'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h1>זה הקובץ הנכון!</h1>
        <p>{content.title}</p>
        <button onClick={onClose} style={{ padding: '20px', background: 'black', color: 'white' }}>סגור אותי</button>
      </div>
    </div>
  );
};

// --- Custom Slider Component ---
const GradientSlider = ({ label, value, onChange, min, max, step, markers, unit, isHighValueGood = false, onInfoClick, guidanceKey }) => {
  const getPercent = useCallback((val) => ((val - min) / (max - min)) * 100, [min, max]);
  const standardGradient = "from-green-400 via-yellow-400 to-red-500";
  const reversedGradient = "from-red-500 via-yellow-400 to-green-400";
  const gradientColors = isHighValueGood ? reversedGradient : standardGradient;
  const gradientStyle = `w-full h-2 bg-gradient-to-r ${gradientColors} rounded-full appearance-none cursor-pointer`;

  return (
    <div className="mb-8 p-4 bg-white/50 rounded-xl shadow-lg border border-gray-100 backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-3">
        {onInfoClick && guidanceKey && (
          <button
            onClick={() => onInfoClick(GUIDANCE_CONTENT[guidanceKey])}
            className="flex items-center gap-1 text-green-600 hover:text-green-700 hover:bg-green-50 border border-green-200 rounded px-2 py-1 transition-colors"
            aria-label={`More info about ${label}`}
          >
            <Info className="w-4 h-4" />
            <span className="text-xs font-medium">Tips</span>
          </button>
        )}
        <div className="flex-1 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-700">
            {label}
          </h3>
          <span className="text-2xl font-bold text-blue-600">
            {unit}{typeof value === 'number' ? value.toFixed(unit === '%' || unit === 'X' ? 0 : 2) : value}
          </span>
        </div>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} className={gradientStyle} style={{ '--tw-ring-color': 'none', '--tw-shadow': 'none' }} />
      <div className="relative h-6 mt-1">
        {markers.map((marker, index) => (
          <div key={index} className="absolute text-center text-xs font-medium text-gray-600 transform -translate-x-1/2" style={{ left: `${getPercent(marker.position)}%` }}>
            <div className="h-2 w-px bg-gray-400 mx-auto"></div>
            <div className="mt-1 px-1 rounded-sm text-gray-700 font-semibold">{marker.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Model Logic ---
const useFinancialModel = (params) => {
  const { businessModel, tier1Price, tier2Price, tier2ConversionSplit, adRevenuePer1000, avgTransactionValue, initialUsers, churnRisk, targetMarketSize, freeToPaidConversion, monthlyMarketingBudget, acquisitionCost } = params;

  return useMemo(() => {
    const data = [];
    let totalUsers = initialUsers;
    let payingUsers = (businessModel === 'transactional') ? initialUsers : 0;
    const churnRateDecimal = churnRisk / 100;
    const tier2SplitDecimal = tier2ConversionSplit / 100;
    const conversionRateDecimal = freeToPaidConversion / 100;
    const effectiveAcquisitionCost = Math.max(0.01, acquisitionCost);

    for (let month = 1; month <= MONTHS; month++) {
      const marketSaturationFactor = 1 - (totalUsers / targetMarketSize);
      let newUsersFromPaid = Math.floor(monthlyMarketingBudget / effectiveAcquisitionCost);
      const organicAcquisitionRate = 0.15 * ORGANIC_K_FACTOR * marketSaturationFactor;
      let newUsersFromOrganic = Math.floor(totalUsers * organicAcquisitionRate);
      let newUsers = newUsersFromPaid + newUsersFromOrganic;
      let churnedUsers = Math.floor(totalUsers * churnRateDecimal);
      totalUsers = Math.max(initialUsers, totalUsers + newUsers - churnedUsers);
      let freeUsers = totalUsers - payingUsers;

      if (businessModel === 'freemium' || businessModel === 'subscription') {
        let newlyPaidUsers = Math.floor(freeUsers * conversionRateDecimal);
        let churnedPaidUsers = Math.floor(payingUsers * churnRateDecimal);
        payingUsers = Math.max(0, payingUsers + newlyPaidUsers - churnedPaidUsers);
        freeUsers = totalUsers - payingUsers;
      } else if (businessModel === 'transactional') {
        let churnedPaidUsers = Math.floor(payingUsers * churnRateDecimal);
        let newlyPaidUsers = Math.floor(newUsers); // In transactional, new users are immediately 'active/paying' in terms of potential transactions
        payingUsers = Math.max(0, payingUsers + newlyPaidUsers - churnedPaidUsers);
      }

      const paidUsersForRevenue = (businessModel === 'subscription' || businessModel === 'freemium') ? payingUsers : 0;
      const tier2Users = Math.floor(paidUsersForRevenue * tier2SplitDecimal);
      const tier1Users = paidUsersForRevenue - tier2Users;

      let subRevenueT1 = 0;
      let subRevenueT2 = 0;
      let adRevenue = 0;
      let transactionalRevenue = 0;

      if (businessModel === 'subscription' || businessModel === 'freemium') {
        subRevenueT1 = tier1Users * tier1Price;
        subRevenueT2 = tier2Users * tier2Price;
      }

      if (businessModel === 'ad-driven' || businessModel === 'freemium') {
        adRevenue = (freeUsers / 1000) * adRevenuePer1000;
      }

      if (businessModel === 'transactional') {
        transactionalRevenue = Math.floor(totalUsers * TRANSACTION_RATE) * avgTransactionValue;
      }

      const totalRevenue = subRevenueT1 + subRevenueT2 + adRevenue + transactionalRevenue;

      data.push({
        month: month,
        TotalUsers: totalUsers,
        FreeUsers: freeUsers,
        PayingUsers: payingUsers,
        SubT1: subRevenueT1,
        SubT2: subRevenueT2,
        Ad: adRevenue,
        Transaction: transactionalRevenue,
        TotalRevenue: totalRevenue,
      });
    }

    return data;
  }, [businessModel, tier1Price, tier2Price, tier2ConversionSplit, adRevenuePer1000, avgTransactionValue, initialUsers, churnRisk, targetMarketSize, freeToPaidConversion, monthlyMarketingBudget, acquisitionCost]);
};

// --- Helper functions ---
const getRevenueSliders = (setTier1Price, setTier2Price, setTier2ConversionSplit, setFreeToPaidConversion, setAdRevenuePer1000, setAvgTransactionValue, tier1Price, tier2Price, tier2ConversionSplit, freeToPaidConversion, adRevenuePer1000, avgTransactionValue, openModalCallback, businessModel) => {
  switch (businessModel) {
    case 'subscription':
      return [
        { id: 1, guidanceKey: 'Tier1Price', label: "1. Tier 1 Price (Monthly ARPU)", value: tier1Price, setter: setTier1Price, min: 0, max: 100, step: 1, unit: "$", markers: [{ position: 0, label: "$0" }, { position: 40, label: "$40" }, { position: 100, label: "$100" }] },
        { id: 2, guidanceKey: 'Tier2Price', label: "2. Tier 2 Price (Upsell ARPU)", value: tier2Price, setter: setTier2Price, min: 0, max: 300, step: 5, unit: "$", markers: [{ position: 0, label: "$0" }, { position: 150, label: "$150" }, { position: 300, label: "$300" }] },
        { id: 3, guidanceKey: 'Tier2ConversionSplit', label: "3. Tier 2 Conversion Split (% of Paid Users)", value: tier2ConversionSplit, setter: setTier2ConversionSplit, min: 0, max: 100, step: 1, unit: "%", markers: [{ position: 0, label: "0%" }, { position: 70, label: "70%" }, { position: 100, label: "100%" }] },
        { id: 4, guidanceKey: 'TrialToPaidConversion', label: "4. Free-to-Paid Conversion Rate (Monthly %)", value: freeToPaidConversion, setter: setFreeToPaidConversion, min: 0.5, max: 10, step: 0.1, unit: "%", markers: [{ position: 0.5, label: "0.5%" }, { position: 5.0, label: "5.0%" }, { position: 10, label: "10%" }] },
      ];
    case 'freemium':
      return [
        { id: 1, guidanceKey: 'Tier1Price', label: "1. Tier 1 Price (Monthly ARPU)", value: tier1Price, setter: setTier1Price, min: 0, max: 100, step: 1, unit: "$", markers: [{ position: 40, label: "$40" }] },
        { id: 2, guidanceKey: 'Tier2Price', label: "2. Tier 2 Price (Upsell ARPU)", value: tier2Price, setter: setTier2Price, min: 0, max: 300, step: 5, unit: "$", markers: [{ position: 150, label: "$150" }] },
        { id: 3, guidanceKey: 'Tier2ConversionSplit', label: "3. Tier 2 Conversion Split (% of Paid Users)", value: tier2ConversionSplit, setter: setTier2ConversionSplit, min: 0, max: 100, step: 1, unit: "%", markers: [{ position: 70, label: "70%" }] },
        { id: 4, guidanceKey: 'TrialToPaidConversion', label: "4. Free-to-Paid Conversion Rate (Monthly %)", value: freeToPaidConversion, setter: setFreeToPaidConversion, min: 0.5, max: 10, step: 0.1, unit: "%", markers: [{ position: 5.0, label: "5.0%" }] },
        { id: 5, guidanceKey: 'AdRevenuePer1000', label: "5. Ad Revenue Per 1000 Free Users (Monthly)", value: adRevenuePer1000, setter: setAdRevenuePer1000, min: 0.5, max: 10, step: 0.5, unit: "$", markers: [{ position: 4.0, label: "$4.00" }] },
      ];
    case 'ad-driven':
      return [
        { id: 1, guidanceKey: 'AdRevenuePer1000', label: "1. Ad Revenue Per 1000 Users (Monthly)", value: adRevenuePer1000, setter: setAdRevenuePer1000, min: 0.5, max: 10, step: 0.5, unit: "$", markers: [{ position: 4.0, label: "$4.00" }, { position: 10, label: "$10.00" }] },
      ];
    case 'transactional':
      return [
        { id: 1, guidanceKey: 'AvgTransactionValue', label: "1. Average Transaction Value (Fee/Commission)", value: avgTransactionValue, setter: setAvgTransactionValue, min: 1, max: 100, step: 1, unit: "$", markers: [{ position: 50, label: "$50" }, { position: 100, label: "$100" }] },
      ];
    default:
      return [];
  }
};

const getGrowthSliders = (setMonthlyMarketingBudget, setAcquisitionCost, setInitialUsers, setChurnRisk, setTargetMarketFactor, monthlyMarketingBudget, acquisitionCost, initialUsers, churnRisk, targetMarketFactor, openModal) => {
  return [
    { id: 10, guidanceKey: 'MonthlyMarketingBudget', label: "Monthly Marketing Budget", value: monthlyMarketingBudget, setter: setMonthlyMarketingBudget, min: 5000, max: 200000, step: 5000, unit: "$", markers: [{ position: 25000, label: "$25K" }, { position: 100000, label: "$100K" }], isHighValueGood: true },
    { id: 11, guidanceKey: 'CACPerUser', label: "Customer Acquisition Cost (CAC) Per User", value: acquisitionCost, setter: setAcquisitionCost, min: 0, max: 100, step: 1, unit: "$", markers: [{ position: 50, label: "$50" }, { position: 100, label: "$100" }], isHighValueGood: false },
    { id: 12, guidanceKey: 'InitialUsers', label: "Initial Users (beta/waitlist)", value: initialUsers, setter: setInitialUsers, min: 10, max: 2500, step: 10, unit: "", markers: [{ position: 1000, label: "1K" }, { position: 2500, label: "2.5K" }], isHighValueGood: true },
    { id: 13, guidanceKey: 'ChurnRisk', label: "Churn Risk (Monthly %)", value: churnRisk, setter: setChurnRisk, min: 0, max: 15, step: 0.5, unit: "%", markers: [{ position: 4, label: "4%" }, { position: 8.5, label: "8.5%" }], isHighValueGood: false },
    { id: 14, guidanceKey: 'TargetMarketFactor', label: "Target Market Factor (1-10) - Scaled Capacity", value: targetMarketFactor, setter: setTargetMarketFactor, min: 1, max: 10, step: 0.5, unit: "X", markers: [{ position: 5, label: "5X" }, { position: 10, label: "10X" }], isHighValueGood: true },
  ];
};


// --- Main App Component ---
const App = () => {
  const [businessModel, setBusinessModel] = useState('subscription');
  const [tier1Price, setTier1Price] = useState(40);
  const [tier2Price, setTier2Price] = useState(150);
  const [tier2ConversionSplit, setTier2ConversionSplit] = useState(70);
  const [adRevenuePer1000, setAdRevenuePer1000] = useState(4.0);
  const [avgTransactionValue, setAvgTransactionValue] = useState(50.0);
  const [monthlyMarketingBudget, setMonthlyMarketingBudget] = useState(25000);
  const [acquisitionCost, setAcquisitionCost] = useState(50);
  const [initialUsers, setInitialUsers] = useState(1000);
  const [churnRisk, setChurnRisk] = useState(4);
  const [freeToPaidConversion, setFreeToPaidConversion] = useState(5.0);
  const [targetMarketFactor, setTargetMarketFactor] = useState(10);
  const targetMarketValue = targetMarketFactor * TARGET_MARKET_SCALING;

  const [venture, setVenture] = useState(null);
  const [isLoadingVenture, setIsLoadingVenture] = useState(true);
  const [feedback, setFeedback] = useState({ overall_assessment: '', parameters_to_adjust: [] }); // Updated initial state to object
  const [isGenerating, setIsGenerating] = useState(false);
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [modalContent, setModalContent] = useState(null);

  const openModal = useCallback((content) => { setModalContent(content); }, []);
  const closeModal = useCallback(() => { setModalContent(null); }, []);

  // Load venture data on mount
  useEffect(() => {
    const loadVentureData = async () => {
      setIsLoadingVenture(true);
      try {
        const user = await User.me();
        // Assuming Venture.filter returns an array and we want the most recent one
        const ventures = await Venture.filter({ created_by: user.email }, "-created_date");
        if (ventures.length > 0) {
          setVenture(ventures[0]);
        }
      } catch (error) {
        console.error("Error loading venture:", error);
      }
      setIsLoadingVenture(false);
    };
    loadVentureData();
  }, []);

  const modelData = useFinancialModel({
    businessModel, tier1Price, tier2Price, tier2ConversionSplit, adRevenuePer1000,
    avgTransactionValue, initialUsers, churnRisk, targetMarketSize: targetMarketValue,
    freeToPaidConversion, monthlyMarketingBudget, acquisitionCost
  });

  const year2CumulativeRevenue = modelData.reduce((sum, d) => sum + d.TotalRevenue, 0);
  const totalUsersMonth24 = modelData.length > 0 ? modelData[MONTHS - 1].TotalUsers : 0;
  const payingUsersMonth24 = modelData.length > 0 ? modelData[MONTHS - 1].PayingUsers : 0;
  const avgMonthlyARPU = (payingUsersMonth24 > 0) ? modelData[MONTHS - 1].TotalRevenue / payingUsersMonth24 : 0;
  const customerLifetimeMonths = (churnRisk > 0) ? (1 / (churnRisk / 100)) : 100; // Cap at 100 months for practical purposes if churn is 0
  const estimatedLTV = avgMonthlyARPU * customerLifetimeMonths; // This variable is calculated but not used in the UI based on the prompt.

  const year1Revenue = modelData.slice(0, 12).reduce((sum, d) => sum + d.TotalRevenue, 0);
  const year1TotalUsers = modelData.length > 0 ? modelData[11].TotalUsers : 0;
  const year1PayingUsers = modelData.length > 0 ? modelData[11].PayingUsers : 0;

  const generateFeedback = async () => {
    setIsGenerating(true);
    setFeedbackVisible(true);
    setFeedback({ overall_assessment: '', parameters_to_adjust: [] }); // Clear previous feedback

    const ventureContext = venture 
      ? `Venture Name: ${venture.name}\nIndustry Sector: ${venture.sector?.replace(/_/g, ' ') || 'Not specified'}\nDescription: ${venture.description || 'Not provided'}\nProblem: ${venture.problem || 'Not provided'}\nSolution: ${venture.solution || 'Not provided'}`
      : 'Venture information not available';

    const systemPrompt = `SYSTEM PROMPT: Pragmatic Angel Investor Revenue Model Analysis v2.0

You are an experienced Angel Investor and pragmatic startup advisor. Your role is to critically assess the user's financial model for their venture against real-world industry benchmarks. You MUST use Google Search to find current, authoritative industry data.

Your feedback must be structured as follows:

1. **OVERALL ASSESSMENT** - Start with a high-level evaluation:
   - Is the overall model Too Optimistic, Too Conservative, or Reasonable?
   - What are the typical revenue ranges for similar ventures after 24 months?
   - Reference real-world examples from the industry when possible.

2. **SPECIFIC PARAMETER ADJUSTMENTS** - Only mention parameters that need adjustment:
   - For each parameter that needs change, explain WHY it's problematic
   - Provide the industry benchmark with source citation
   - Suggest a specific realistic value or range to use instead
   - Include an industry example if relevant

Return your response as a JSON object with this exact structure:
{
  "overall_assessment": "2-3 paragraph assessment covering: (1) Overall optimism/conservatism, (2) Expected 24-month performance for this industry, (3) Key insights",
  "parameters_to_adjust": [
    {
      "parameter": "Parameter Name",
      "current_value": "User's current value with unit",
      "issue": "Why this is problematic (too optimistic/conservative)",
      "industry_benchmark": "Benchmark range with source citation",
      "recommended_value": "Specific value or range to use instead",
      "industry_example": "Real-world example from similar ventures (optional)"
    }
  ]
}

If all parameters are reasonable, return an empty array for "parameters_to_adjust" but still provide the overall assessment.

Be direct, pragmatic, and actionable. Your goal is to help the entrepreneur build an investor-ready model.`;

    const userQuery = `Analyze my revenue model and provide pragmatic feedback.

VENTURE CONTEXT:
${ventureContext}

BUSINESS MODEL: ${businessModel}

CURRENT PARAMETERS:
- Tier 1 Price: $${tier1Price}/month
- Tier 2 Price: $${tier2Price}/month
- Tier 2 Split: ${tier2ConversionSplit}% of paying users
- Free-to-Paid Conversion: ${freeToPaidConversion}%/month
- Ad Revenue Per 1000 Users: $${adRevenuePer1000}/month
- Average Transaction Value: $${avgTransactionValue}
- Monthly Marketing Budget: $${monthlyMarketingBudget}
- Customer Acquisition Cost: $${acquisitionCost}
- Initial Users: ${initialUsers}
- Monthly Churn Risk: ${churnRisk}%
- Target Market Factor: ${targetMarketFactor}X (${targetMarketValue.toLocaleString()} users)

PROJECTED RESULTS:
- Year 1 Revenue: $${formatNumber(year1Revenue)}
- Year 2 Total Revenue: $${formatNumber(year2CumulativeRevenue)}
- Year 1 Total Users: ${formatNumber(year1TotalUsers)}
- Year 2 Total Users: ${formatNumber(totalUsersMonth24)}
- Year 1 Paying Users: ${formatNumber(year1PayingUsers)}
- Year 2 Paying Users: ${formatNumber(payingUsersMonth24)}

Use Google Search to find industry benchmarks and provide practical, actionable feedback.`;

    try {
      const result = await InvokeLLM({
        prompt: userQuery,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            overall_assessment: { type: "string" },
            parameters_to_adjust: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  parameter: { type: "string" },
                  current_value: { type: "string" },
                  issue: { type: "string" },
                  industry_benchmark: { type: "string" },
                  recommended_value: { type: "string" },
                  industry_example: { type: "string" }
                },
                required: ["parameter", "current_value", "issue", "industry_benchmark", "recommended_value"]
              }
            }
          },
          required: ["overall_assessment", "parameters_to_adjust"]
        },
        system_instruction: systemPrompt
      });

      if (result && result.overall_assessment) {
        setFeedback(result);
      } else {
        setFeedback({ 
          overall_assessment: "The AI generated an unexpected response format or incomplete data. Please try again.",
          parameters_to_adjust: []
        });
      }
    } catch (error) {
      console.error("Error generating feedback:", error);
      setFeedback({ 
        overall_assessment: `Failed to generate feedback: ${error.message}. Please try again.`,
        parameters_to_adjust: []
      });
    }

    setIsGenerating(false);
  };

  const totalUsersLineName = (businessModel === 'transactional') ? "Total Active Users" : "Total Users";

  return (
    <div className="min-h-screen bg-gray-50 p-6 sm:p-10 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-blue-800 tracking-tight sm:text-5xl">
            Dynamic Business Model Simulator
          </h1>
          <p className="mt-3 text-xl text-gray-500">
            Adjust the levers below and view the 24-month forecast instantly.
          </p>
        </header>

        <div className="mb-12 p-6 bg-blue-100 rounded-xl shadow-lg border-2 border-blue-200">
          <div className="flex items-center mb-4">
            <Briefcase className="w-6 h-6 mr-3 text-blue-800" />
            <h2 className="text-2xl font-bold text-blue-800">
              Select Your Core Business Model
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {MODEL_OPTIONS.map((model) => {
              const isSelected = businessModel === model.value;
              const defaultClasses = "border-gray-300 bg-white hover:bg-gray-50 text-gray-700";
              const selectedClasses = `${model.borderColor} ${model.bgColor} border-2 shadow-lg text-blue-800`;

              return (
                <button
                  key={model.value}
                  onClick={() => {
                    setBusinessModel(model.value);
                  }}
                  className={`p-4 rounded-xl text-left transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-opacity-50 ${isSelected ? selectedClasses : defaultClasses}`}
                >
                  <div className="flex items-center mb-1">
                    <div className={`w-3 h-3 rounded-full mr-2 ${model.indicatorColor} ${isSelected ? 'shadow-[0_0_8px_0_currentColor]' : 'bg-gray-400'}`}></div>
                    <span className="font-bold text-lg">{model.name}</span>
                  </div>
                  <p className="text-sm text-gray-500">{model.description}</p>
                </button>
              );
            })}
          </div>

          {/* Business Model Guidance Display */}
          {BUSINESS_MODEL_GUIDANCE[businessModel] && (
            <div className="mt-6 p-4 bg-white rounded-lg border-2 border-blue-300">
              <h3 className="text-lg font-bold text-blue-900 mb-2">
                {BUSINESS_MODEL_GUIDANCE[businessModel].name} Model
              </h3>
              <p className="text-gray-700 mb-2">
                {BUSINESS_MODEL_GUIDANCE[businessModel].description}
              </p>
              <p className="text-sm text-gray-600 italic">
                <strong>Example:</strong> {BUSINESS_MODEL_GUIDANCE[businessModel].example}
              </p>
            </div>
          )}
        </div>

        <h2 className="text-3xl font-bold text-gray-800 mb-6 mt-12 border-b pb-2 flex items-center">
          <DollarSign className="w-6 h-6 mr-2 text-green-600"/>
          Revenue Assumptions (Dynamic Levers for {businessModel.toUpperCase()})
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {getRevenueSliders(setTier1Price, setTier2Price, setTier2ConversionSplit, setFreeToPaidConversion, setAdRevenuePer1000, setAvgTransactionValue, tier1Price, tier2Price, tier2ConversionSplit, freeToPaidConversion, adRevenuePer1000, avgTransactionValue, openModal, businessModel).map(slider => (
            <GradientSlider
              key={slider.id}
              label={slider.label}
              value={slider.value}
              onChange={slider.setter}
              min={slider.min} max={slider.max} step={slider.step} unit={slider.unit}
              markers={slider.markers}
              isHighValueGood={true}
              onInfoClick={openModal}
              guidanceKey={slider.guidanceKey}
            />
          ))}
        </div>

        <h2 className="text-3xl font-bold text-gray-800 mb-6 mt-12 border-b pb-2 flex items-center">
          <Shuffle className="w-6 h-6 mr-2 text-red-600"/>
          Core Growth & Market Assumptions (Always Active)
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {getGrowthSliders(setMonthlyMarketingBudget, setAcquisitionCost, setInitialUsers, setChurnRisk, setTargetMarketFactor, monthlyMarketingBudget, acquisitionCost, initialUsers, churnRisk, targetMarketFactor, openModal).map(slider => (
            <GradientSlider
              key={slider.id}
              label={slider.label}
              value={slider.value}
              onChange={slider.setter}
              min={slider.min} max={slider.max} step={slider.step} unit={slider.unit}
              markers={slider.markers}
              isHighValueGood={slider.isHighValueGood}
              onInfoClick={openModal}
              guidanceKey={slider.guidanceKey}
            />
          ))}
        </div>

        <h2 className="text-3xl font-bold text-gray-800 mb-6 mt-12 border-b pb-2 flex items-center">
          <Speaker className="w-6 h-6 mr-2 text-purple-600"/>
          Venture Context for AI Analysis
        </h2>
        {isLoadingVenture ? (
          <div className="w-full p-4 border-2 border-gray-300 rounded-lg text-gray-800 text-center text-lg italic bg-gray-50 animate-pulse">
            Loading your venture details for AI analysis...
          </div>
        ) : (
          <div className="w-full p-4 border-2 border-gray-300 rounded-lg text-gray-800 bg-white">
            {venture ? (
              <>
                <p className="text-lg font-semibold text-blue-700 mb-1">{venture.name}</p>
                <p className="text-sm text-gray-600 mb-2">Industry: {venture.sector?.replace(/_/g, ' ') || 'Not specified'}</p>
                <p className="text-sm text-gray-700">{venture.description || 'No description provided.'}</p>
                <p className="text-sm text-gray-700 mt-1">Problem: {venture.problem || 'No problem statement provided.'}</p>
                <p className="text-sm text-gray-700 mt-1">Solution: {venture.solution || 'No solution statement provided.'}</p>
              </>
            ) : (
              <p className="text-lg italic text-red-600">No venture data found. Please create and save your venture details to enable detailed AI analysis.</p>
            )}
          </div>
        )}

        <div className="mt-8 text-center space-y-4">
          <button
            onClick={generateFeedback}
            disabled={isGenerating || isLoadingVenture}
            className={`px-8 py-3 bg-red-600 text-white font-bold text-xl rounded-xl shadow-lg transition transform hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-red-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto ${isGenerating ? 'animate-pulse' : ''}`}
          >
            {isGenerating ? (
              <>
                <Zap className="w-6 h-6 mr-3 animate-spin"/>
                Analyzing with Industry Data...
              </>
            ) : (
              <>
                <MessageSquare className="w-6 h-6 mr-3"/>
                Gain Insights
              </>
            )}
          </button>
          {(feedback.overall_assessment && !isGenerating) && (
            <button
              onClick={() => setFeedbackVisible(!feedbackVisible)}
              className="text-sm text-gray-600 hover:text-blue-600 transition"
            >
              {feedbackVisible ? 'Hide Analysis' : 'Show Last Analysis'}
            </button>
          )}
        </div>

        {feedbackVisible && feedback.overall_assessment && (
          <div className="mt-8 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl shadow-inner">
            <h3 className="text-2xl font-bold text-yellow-800 mb-4 flex items-center">
              <Zap className="w-6 h-6 mr-2"/>
              Industry Benchmark Analysis
            </h3>
            
            <div className="bg-white p-5 rounded-lg border-l-4 border-yellow-500 mb-6">
              <h4 className="text-lg font-bold text-gray-900 mb-3">Overall Assessment</h4>
              <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{feedback.overall_assessment}</p>
            </div>

            {feedback.parameters_to_adjust && feedback.parameters_to_adjust.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-lg font-bold text-gray-900 mb-3">Parameters to Adjust</h4>
                {feedback.parameters_to_adjust.map((item, index) => (
                  <div key={index} className="bg-white p-5 rounded-lg border-l-4 border-orange-500">
                    <h5 className="text-lg font-bold text-gray-900 mb-2">{item.parameter}</h5>
                    <div className="space-y-2 text-sm">
                      <p><strong className="text-gray-700">Current Value:</strong> <span className="text-gray-800">{item.current_value}</span></p>
                      <p><strong className="text-red-700">Issue:</strong> <span className="text-gray-800">{item.issue}</span></p>
                      <p><strong className="text-blue-700">Industry Benchmark:</strong> <span className="text-gray-800">{item.industry_benchmark}</span></p>
                      <p><strong className="text-green-700">Recommended Value:</strong> <span className="text-gray-800 font-semibold">{item.recommended_value}</span></p>
                      {item.industry_example && (
                        <p className="mt-2 p-3 bg-blue-50 rounded border border-blue-200">
                          <strong className="text-blue-800">Industry Example:</strong> <span className="text-gray-700 italic">{item.industry_example}</span>
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {feedback.parameters_to_adjust && feedback.parameters_to_adjust.length === 0 && (
              <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                <p className="text-green-800 font-medium">✓ All your parameters appear reasonable based on industry benchmarks. Your model looks solid!</p>
              </div>
            )}
          </div>
        )}

        <h2 className="text-3xl font-bold text-gray-800 mb-6 mt-12 border-b pb-2 flex items-center">
          <TrendingUp className="w-6 h-6 mr-2 text-blue-600"/>
          Key Metrics & Forecast Highlights
        </h2>

        <div className="grid grid-cols-2 gap-4 mb-10">
          <div className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-md text-white text-center">
            <p className="text-xl font-bold">Year 1</p>
          </div>
          <div className="p-4 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-md text-white text-center">
            <p className="text-xl font-bold">Year 2</p>
          </div>

          <div className="p-4 bg-white rounded-lg shadow-md border-l-4 border-blue-500">
            <p className="text-sm text-gray-500 uppercase font-semibold mb-1">Revenue</p>
            <p className="text-2xl font-extrabold text-blue-800">${formatNumber(year1Revenue)}</p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow-md border-l-4 border-purple-500">
            <p className="text-sm text-gray-500 uppercase font-semibold mb-1">Revenue</p>
            <p className="text-2xl font-extrabold text-purple-800">${formatNumber(year2CumulativeRevenue)}</p>
          </div>

          <div className="p-4 bg-white rounded-lg shadow-md border-l-4 border-green-500">
            <p className="text-sm text-gray-500 uppercase font-semibold mb-1">Total Users</p>
            <p className="text-2xl font-extrabold text-green-800">{formatNumber(year1TotalUsers)}</p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow-md border-l-4 border-green-600">
            <p className="text-sm text-gray-500 uppercase font-semibold mb-1">Total Users</p>
            <p className="text-2xl font-extrabold text-green-900">{formatNumber(totalUsersMonth24)}</p>
          </div>

          <div className="p-4 bg-white rounded-lg shadow-md border-l-4 border-orange-500">
            <p className="text-sm text-gray-500 uppercase font-semibold mb-1">Paying Users</p>
            <p className="text-2xl font-extrabold text-orange-800">{formatNumber(year1PayingUsers)}</p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow-md border-l-4 border-orange-600">
            <p className="text-sm text-gray-500 uppercase font-semibold mb-1">Paying Users</p>
            <p className="text-2xl font-extrabold text-orange-900">{formatNumber(payingUsersMonth24)}</p>
          </div>
        </div>

        <div className="space-y-10">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-bold mb-6 text-gray-700 border-b pb-2">User Growth Forecast ({totalUsersLineName})</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={modelData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="month" label={{ value: 'Month', position: 'bottom' }} />
                <YAxis tickFormatter={(value) => formatNumber(value)} domain={['auto', 'auto']} />
                <Tooltip formatter={(value, name) => [formatNumber(value), name]} />
                <Line type="monotone" dataKey="TotalUsers" name={totalUsersLineName} stroke="#3b82f6" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                {(businessModel === 'freemium' || businessModel === 'subscription') && (
                  <Line type="monotone" dataKey="PayingUsers" name="Paying Users" stroke="#10b981" strokeWidth={2} dot={false} />
                )}
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-6 flex justify-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 bg-blue-500"></div>
                <span className="text-sm text-gray-600">{totalUsersLineName}</span>
              </div>
              {(businessModel === 'freemium' || businessModel === 'subscription') && (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-1 bg-green-500"></div>
                  <span className="text-sm text-gray-600">Paying Users</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-bold mb-6 text-gray-700 border-b pb-2">Monthly Revenue Mix (Stacked)</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={modelData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="month" label={{ value: 'Month', position: 'bottom' }} />
                <YAxis tickFormatter={(value) => `$${formatNumber(value)}`} domain={['auto', 'auto']} />
                <Tooltip formatter={(value, name) => [`$${formatNumber(value)}`, name]} />
                {(businessModel === 'subscription' || businessModel === 'freemium') && (
                  <>
                    <Bar dataKey="SubT1" stackId="a" fill="#2563eb" name="Sub Revenue (Tier 1)" />
                    <Bar dataKey="SubT2" stackId="a" fill="#38bdf8" name="Sub Revenue (Tier 2)" />
                  </>
                )}
                {(businessModel === 'ad-driven' || businessModel === 'freemium') && (
                  <Bar dataKey="Ad" stackId="a" fill="#facc15" name="Ad Revenue" />
                )}
                {businessModel === 'transactional' && (
                  <Bar dataKey="Transaction" stackId="a" fill="#ef4444" name="Transactional Revenue" />
                )}
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-6 flex justify-center gap-6 flex-wrap">
              {(businessModel === 'subscription' || businessModel === 'freemium') && (
                <>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-[#2563eb]"></div>
                    <span className="text-sm text-gray-600">Sub Revenue (Tier 1)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-[#38bdf8]"></div>
                    <span className="text-sm text-gray-600">Sub Revenue (Tier 2)</span>
                  </div>
                </>
              )}
              {(businessModel === 'ad-driven' || businessModel === 'freemium') && (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-[#facc15]"></div>
                    <span className="text-sm text-gray-600">Ad Revenue</span>
                </div>
              )}
              {businessModel === 'transactional' && (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-[#ef4444]"></div>
                  <span className="text-sm text-gray-600">Transactional Revenue</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-12 p-6 bg-gray-100 rounded-xl border border-gray-200">
          <h3 className="text-2xl font-bold text-gray-700 mb-4 flex items-center">
            <Monitor className="w-5 h-5 mr-2 text-gray-600"/>
            Model Assumptions
          </h3>

          <h4 className="text-lg font-semibold text-purple-700 mb-3">Fixed:</h4>
          <ul className="list-disc ml-5 space-y-2 text-gray-600 mb-6">
            <li>
              <strong className="text-purple-700">Timeframe: 24 Months</strong>
              <p className="ml-5 text-sm">The simulation provides a 2-year (24-month) mid-term financial forecast.</p>
            </li>
            <li>
              <strong className="text-purple-700">Organic K-Factor: {ORGANIC_K_FACTOR}</strong>
              <p className="ml-5 text-sm">Measures viral spread — how many users each existing user recruits. With 100K users, a 0.65 K-Factor adds ~65K organically.</p>
            </li>
            <li>
              <strong className="text-purple-700">Market Saturation (S-Curve)</strong>
              <p className="ml-5 text-sm">Growth slows as you approach the market cap. This prevents unrealistic "infinite" growth.</p>
            </li>
            <li>
              <strong className="text-purple-700">Transactional Activity Rate: {TRANSACTION_RATE * 100}%</strong>
              <p className="ml-5 text-sm">For the Transactional model, only 0.5% of active users purchase monthly.</p>
            </li>
          </ul>

          <h4 className="text-lg font-semibold text-indigo-700 mb-3">Selected:</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 bg-white rounded-lg border-l-4 border-indigo-500">
              <p className="text-xs text-gray-500 font-semibold">Initial Users</p>
              <p className="text-lg font-bold text-indigo-800">{formatNumber(initialUsers)}</p>
            </div>
            <div className="p-3 bg-white rounded-lg border-l-4 border-red-500">
              <p className="text-xs text-gray-500 font-semibold">Churn Risk</p>
              <p className="text-lg font-bold text-red-800">{churnRisk}%</p>
            </div>
            {(businessModel === 'subscription' || businessModel === 'freemium') && (
              <>
                <div className="p-3 bg-white rounded-lg border-l-4 border-blue-500">
                  <p className="text-xs text-gray-500 font-semibold">Tier 1 Price</p>
                  <p className="text-lg font-bold text-blue-800">${tier1Price}</p>
                </div>
                <div className="p-3 bg-white rounded-lg border-l-4 border-purple-500">
                  <p className="text-xs text-gray-500 font-semibold">Tier 2 Price</p>
                  <p className="text-lg font-bold text-purple-800">${tier2Price}</p>
                </div>
              </>
            )}
            {businessModel === 'ad-driven' && (
                <div className="p-3 bg-white rounded-lg border-l-4 border-yellow-500">
                  <p className="text-xs text-gray-500 font-semibold">Ad Rev / 1000 Users</p>
                  <p className="text-lg font-bold text-yellow-800">${adRevenuePer1000.toFixed(2)}</p>
                </div>
              )}
            {businessModel === 'transactional' && (
                <div className="p-3 bg-white rounded-lg border-l-4 border-green-500">
                  <p className="text-xs text-gray-500 font-semibold">Avg. Transaction Value</p>
                  <p className="text-lg font-bold text-green-800">${avgTransactionValue.toFixed(2)}</p>
                </div>
              )}
            <div className="p-3 bg-white rounded-lg border-l-4 border-gray-500">
              <p className="text-xs text-gray-500 font-semibold">Marketing Budget</p>
              <p className="text-lg font-bold text-gray-800">${formatNumber(monthlyMarketingBudget)}</p>
            </div>
            <div className="p-3 bg-white rounded-lg border-l-4 border-orange-500">
              <p className="text-xs text-gray-500 font-semibold">CAC</p>
              <p className="text-lg font-bold text-orange-800">${acquisitionCost}</p>
            </div>
          </div>
        </div>

        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>Disclaimer: Financial results are illustrative, based on a modified S-curve growth model incorporating paid and organic acquisition.</p>
          <p className="mt-2 hidden print:block">This financial model was generated for the {businessModel.toUpperCase()} model.</p>
        </footer>

        <GuidanceModal content={modalContent} onClose={closeModal} />
      </div>
    </div>
  );
};

export default App;
