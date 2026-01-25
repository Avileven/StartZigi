"use client";
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { DollarSign, Users, TrendingUp, Zap, Briefcase, Monitor, Shuffle, Speaker, Info, MessageSquare } from 'lucide-react';
import { Venture } from '@/api/entities.js';
import { User } from '@/api/entities.js';
import { VentureMessage } from '@/api/entities.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { createPageUrl } from "@/utils";
import { useRouter } from "next/navigation";
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

// --- Extended Guidance Content with Detailed Examples ---
const EXTENDED_GUIDANCE = {
  tier1Price: {
    overview: "How much users pay or how much you earn per user (ARPU).",
    content: `**Level Breakdown:**

**Low (Weak/Risky) - $0-5:**
Too weak/commodity pricing that struggles to cover CAC. 
CAC Recovery: 12+ months

Examples:
• Grammarly Free/Basic ($0-12/month)
• Simple browser extensions and utilities
• Basic password managers (Bitwarden: $10/year)
• Simple note-taking apps

**Middle (Healthy) - $8-30:**
Standard SMB SaaS or premium consumer pricing.
CAC Recovery: 6-12 months

Examples:
• Notion Personal Pro ($10/month)
• Canva Pro ($12.99/month)
• Slack Pro per user ($7.25/month)
• Spotify Premium ($10.99/month)
• LinkedIn Premium Career ($29.99/month)
• GitHub Pro ($4/month per user)

**High (Ambitious) - $100+:**
Enterprise-only, mission-critical functionality.
CAC Recovery: 3-6 months

Examples:
• Salesforce Sales Cloud ($75-300/user/month)
• Adobe Creative Cloud for Teams ($84.99/user/month)
• Veeva CRM ($100+/user/month)
• Workday HCM ($100-200+/user/month)
• SAP enterprise solutions

**Success Indicators:**
• Low: Must have viral coefficient >0.7 to compensate
• Middle: LTV:CAC ratio of 3:1 or better
• High: Annual contracts, dedicated account management`
  },
  tier2Price: {
    overview: "The monthly price for your premium tier.",
    content: `**Level Breakdown:**

**Low (Weak) - <$40:**
Minimal LTV boost, <30% revenue increase

Examples:
• Evernote Premium ($7.99 → $10.99, +$3)
• Additional cloud storage (Google One: $1.99 → $2.99)
• Minor feature unlocks
• Ad removal only

**Middle (Healthy) - $40-150:**
Strong upgrade path, 50-150% revenue increase

Examples:
• Canva Pro → Canva Teams ($12.99 → $29.99/user)
• Notion Personal → Team ($10 → $15/user)
• Shopify Basic → Shopify ($29 → $79/month)
• Zoom Pro → Business ($14.99 → $19.99/user)
• Mailchimp Essentials → Standard ($13 → $20/month)
• HubSpot Starter → Professional ($45 → $450/month)

**High (Extreme) - $300+:**
Usage-based or enterprise scaling, 200%+ revenue increase

Examples:
• Twilio (usage-based, can scale from $0 to $10,000+)
• AWS compute services (elastic scaling)
• Stripe (volume-based pricing)
• Snowflake (consumption-based, $100s to $100,000s)
• OpenAI API usage tiers

**Key Differentiation Features:**
• Low: Cosmetic changes, minor convenience
• Middle: Collaboration, automation, integrations, analytics
• High: API access, white-labeling, dedicated support, SLAs`
  },
  tier2ConversionSplit: {
    overview: "The percentage of your total paying users who subscribe to Tier 2.",
    content: `**Level Breakdown:**

**Low (Failure) - <50%:**
Weak product differentiation. User never hits limits.

Examples:
• Free tier is "too good" - users never need upgrade
• Dropbox (historically struggled with ~2-4% free-to-paid)
• Products with weak premium features
• Minimal enforcement of limits

**Middle (Healthy) - 50-80%:**
Clear PMF and value ladder. Usage-based triggers.

Examples:
• Miro: Free → Team conversion via board limits
• Zapier: Task limits drive upgrades (strong 60-70% conversion)
• Slack: Message history limits create natural upgrade path
• Figma: Project/collaboration limits
• Calendly: Meeting type limits and branding removal
• Loom: Video limit enforcement

**High (Impossible) - 100%:**
Unrealistic assumption.

**Conversion Optimization Tactics:**
• Hard limits vs. soft limits
• Time-based trials vs. feature-based trials
• Usage notifications ("You've used 80% of your quota")
• Collaboration-forced upgrades (inviting teammates)
• Seasonal/promotional offers

**Best Practices:**
• Show value before hitting paywall
• Make limits predictable and transparent
• Offer annual discounts (20-30% off)
• Provide upgrade path during moments of high engagement`
  },
  freeToPaidConversion: {
    overview: "The share of free users who become paying users each month.",
    content: `**Why It Matters:**
Small increases here dramatically impact revenue. 100K free users with a 2% conversion = 2,000 new paying users/month. If conversion rises to 4%, you double paid users.

**Optimization Strategies:**
• Improve onboarding to showcase value faster
• Use time-limited trials to create urgency
• Implement usage limits that encourage upgrades
• Add social proof and testimonials
• Offer limited-time discounts for new users

**Benchmarks:**
• 0.5-2%: Low conversion, needs improvement
• 2-5%: Industry standard for freemium
• 5-10%: Excellent conversion, strong value prop`
  },
  adRevenuePer1000: {
    overview: "How much you earn per 1000 users from advertising.",
    content: `**Revenue Efficiency:**
This defines how effective your ad monetization is. Higher values mean better targeting, engagement, and ad placement.

**Examples:**
• Low ($0.50-2): Basic display ads, low engagement
• Medium ($2-5): Targeted ads, good engagement
• High ($5-10): Premium ad rates, high-value audience

**Key Factors:**
• User demographics and purchasing power
• Engagement time (more time = more ad views)
• Ad placement quality
• Advertiser competition in your niche`
  },
  avgTransactionValue: {
    overview: "The average commission, fee, or markup earned per transaction.",
    content: `**Revenue Model:**
This is your take-rate per transaction. With 1M users at 0.5% activity rate → 5,000 transactions/month.

**Examples:**
• Low ($1-10): Microtransactions, food delivery tips
• Medium ($10-50): Ride-sharing, freelance platforms
• High ($50-100+): Real estate, high-value B2B marketplaces

**Optimization:**
• Increase transaction frequency
• Add premium transaction tiers
• Introduce value-added services
• Optimize pricing without hurting volume`
  },
  monthlyMarketingBudget: {
    overview: "The money you spend monthly on marketing to attract users.",
    content: `**Level Breakdown:**

**Low (<$5K/month):**
Strategy: Organic-only, contradicts high growth. LTV:CAC Target: 5:1+ required

Examples:
• Pure SEO/content marketing (Buffer's early strategy)
• Community-driven growth (Reddit, forums)
• Product-led growth (PLG) only
• Bootstrapped companies pre-revenue
• Example: Basecamp (minimal paid acquisition)

**Middle ($10K-100K/month):**
Strategy: Balanced paid/organic. LTV:CAC Target: 3:1 standard

Channel Mix:
• Google Ads: 30-40% of budget
• Content marketing: 20-25%
• SEO tools & outsourced content: 15%
• Social media ads (LinkedIn, Facebook): 15-20%
• Affiliate/referral programs: 10%

Examples:
• Ahrefs (heavy SEO focus, moderate paid)
• ConvertKit (content + paid social)
• Most Series A SaaS companies

**High ($200K-1M+/month):**
Strategy: Aggressive market capture. LTV:CAC Target: 2:1 acceptable early

Channel Mix:
• Performance marketing (Google, Meta): 40-50%
• TV/OOH advertising: 15-20%
• Influencer partnerships: 10-15%
• Events/sponsorships: 10%
• Content & SEO: 10-15%

Examples:
• Chime Bank (massive TV campaigns)
• Monday.com (Super Bowl ads)
• Brex (aggressive B2B campaigns)
• Webull (paid social blitz)

**CAC Benchmarks by Channel:**
• SEO/Organic: $50-200
• Content marketing: $100-300
• Paid search: $200-500
• Paid social: $100-400
• Outbound sales: $500-2,000
• Enterprise: $5,000-50,000`
  },
  acquisitionCost: {
    overview: "How much you spend to acquire a single new user.",
    content: `**Why It Matters:**
Lower CAC = more users for the same budget. High CAC means inefficient marketing.

Example: $10 CAC with a $100K budget = 10,000 users; $50 CAC = only 2,000 users.

**Benchmarks:**
• $0-10: Viral/organic growth, rare
• $10-50: Efficient paid acquisition
• $50-100: Standard for competitive markets
• $100+: Enterprise or highly competitive

**Optimization Strategies:**
• Improve landing page conversion rates
• Better targeting to reduce wasted spend
• A/B test ad creatives and copy
• Focus on higher-intent channels
• Leverage referral programs

**Critical Ratio:**
LTV:CAC should be at least 3:1 for sustainable growth.
CAC payback period should be <12 months.`
  },
  initialUsers: {
    overview: "The number of users you start with at month 1.",
    content: `**Level Breakdown:**

**Small Beta (<50 users):**
Risk: Friends/family bias, too homogeneous

What to measure:
• Qualitative feedback, bug reports

**Medium Beta (50-500 users):**
Ideal for: True product validation

Examples:
• Superhuman (invite-only, 300-500 initial users)
• Clubhouse (2,000 initial beta, but grew fast)
• Product Hunt waitlist campaigns
• Newsletter-driven beta signups
• Targeted LinkedIn/Reddit outreach

What to measure:
• Week 1 retention: >40% is excellent
• Week 4 retention: >20% is strong
• NPS score: >50 is excellent
• Feature usage patterns
• Time to "aha moment"

**Large Beta (2000+ users):**
Can signal:
• Strong PMF and market pull
• Successful pre-launch marketing
• OR: Low barrier to entry (many sign-ups, few actives)

Examples:
• Gmail (1M+ waitlist, invite-only for years)
• Notion (10K+ waitlist before public launch)
• Robinhood (1M+ waitlist before launch)
• Superhuman (grew to 180K waitlist)

Critical Metric: Waitlist → Active User conversion (should be >30%)

**Red Flags:**
• High sign-up, low activation (<30%)
• Users don't return after Day 1 (<40% D1 retention)
• No clear "power users" emerging
• Feedback is lukewarm (NPS <30)`
  },
  churnRisk: {
    overview: "The percentage of users who leave each month.",
    content: `**Level Breakdown:**

**Low (Excellent) - 1-6% monthly / 12-72% annual:**
Category: Enterprise/Sticky B2B

Examples:
• Enterprise HR systems (Workday: <1% monthly)
• Payroll software (ADP, Gusto: 1-2%)
• CRM systems (Salesforce: 0.8-1.2%)
• Developer tools with deep integration (GitHub)
• Accounting software (QuickBooks: 2-3%)

Why: High switching costs, mission-critical, deep integration

**Middle (Standard) - 7-10% monthly / 84-120% annual:**
Category: SMB SaaS/Premium B2C

Examples:
• Project management tools (Asana, Monday: 5-8%)
• Marketing automation (Mailchimp: 6-9%)
• SMB productivity tools
• B2B collaboration software
• Zoom Business tier: ~5-7%

Why: Budget sensitivity, alternative options, seasonal business

**High (Severe) - >10% monthly / >120% annual:**
Category: Commodity B2C/EdTech

Examples:
• Meal kit subscriptions (HelloFresh: 8-12%)
• Fitness apps (Strava, Peloton app: 10-15%)
• Language learning (Duolingo Plus: 8-12%)
• Dating apps (Tinder Gold: 10-14%)
• B2C streaming (Netflix: 2-3% monthly)
• EdTech/course platforms: 9-12%

**Churn Reduction Strategies:**
• Contract-based: Annual prepay with discount
• Usage milestones: Celebrate user achievements
• Win-back campaigns: Re-engagement before cancellation
• Exit surveys: Understand and address reasons
• Pause options: Alternative to cancellation
• Improved onboarding: First 30 days are critical

**Cohort Analysis Best Practices:**
• Track churn by acquisition channel
• Identify "aha moments" that reduce churn
• Monitor leading indicators (DAU/MAU decline)
• Calculate: Gross churn, Net churn (accounting for expansions)`
  },
  targetMarketFactor: {
    overview: "The maximum possible user base (market cap).",
    content: `**Level Breakdown:**

**Low (Risky) - Local/Regional:**
TAM Impact: <$100M TAM
Execution Complexity: Low complexity, limited scale

Examples:
• Gusto (initially US-only payroll)
• Australian-only finance apps (Up Bank)
• UK-specific tax software (FreeAgent)
• Regional food delivery (initially)
• Local compliance tools

**Middle (Healthy) - National:**
TAM Impact: $500M-5B TAM
Execution Complexity: Moderate complexity, proven playbook

Examples:
• Robinhood (US-focused fintech)
• US-exclusive insurance platforms (Oscar Health)
• Canada-specific tax software (Wealthsimple Tax)
• Single-country e-commerce platforms
• Venmo (US payment network)

**High (Ambitious) - International:**
TAM Impact: $5B+ TAM
Execution Complexity: High complexity, regulatory challenges

Examples:
• Stripe (40+ countries)
• PayPal (200+ markets)
• Shopify (175+ countries)
• Zoom (global from near-launch)
• Netflix (190+ countries)
• Spotify (180+ markets)
• TransferWise/Wise (80+ countries)

**Expansion Considerations:**
• Market Entry Sequence: UK/Canada/Australia first (English, similar regulations)
• Localization Needs: Language, currency, payment methods
• Regulatory Hurdles: GDPR, local data residency, financial licensing
• Support Infrastructure: Time zones, local customer service
• Partnership Requirements: Local payment processors, banks`
  }
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

// --- Guidance Modal (kept for business model guidance) ---
import { createPortal } from 'react-dom';

const GuidanceModal = ({ content, onClose }) => {
  // בדיקה למניעת שגיאת SSR ב-Next.js
  if (!content || typeof document === 'undefined') return null;

  return createPortal(
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.85)', // רקע שחור כמעט אטום
        backdropFilter: 'blur(5px)'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          backgroundColor: '#FFFFFF', // לבן מוחלט
          color: '#000000',
          width: '90%',
          maxWidth: '500px',
          padding: '30px',
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ borderBottom: '1px solid #eee', marginBottom: '20px', paddingBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1a56db' }}>{content.title}</h3>
          <button onClick={onClose} style={{ fontSize: '24px', cursor: 'pointer', background: 'none', border: 'none' }}>&times;</button>
        </div>
        
        <div style={{ fontSize: '16px', lineHeight: '1.6' }}>
          <p>{content.body}</p>
          <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fef3c7', borderRadius: '8px', borderLeft: '4px solid #f59e0b' }}>
            <p style={{ fontWeight: 'bold', color: '#92400e' }}>Why it matters:</p>
            <p>{content.why}</p>
          </div>
        </div>

        <button 
          onClick={onClose}
          style={{
            marginTop: '25px',
            width: '100%',
            padding: '12px',
            backgroundColor: '#1a56db',
            color: 'white',
            borderRadius: '10px',
            border: 'none',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          הבנתי
        </button>
      </div>
    </div>,
    document.body // זה שולח את המודאל מחוץ לכל הבלגן השקוף
  );
};

// --- Helper functions for dynamic slider labels and examples ---
const getParameterLabel = (paramKey, value) => {
  const labels = {
    tier1Price: {
      getLabel: (val) => {
        if (val <= 5) return "💤 Too Weak / Commodity";
        if (val <= 30) return "✅ Healthy Base Case";
        if (val <= 70) return "🚀 Ambitious";
        if (val <= 100) return "💎 Really Rare / Premium Enterprise";
        return "💎 Extreme Enterprise";
      },
      getColor: (val) => {
        if (val <= 5) return "text-red-500";
        if (val <= 30) return "text-green-600";
        if (val <= 70) return "text-blue-500";
        return "text-purple-600";
      },
      getExamples: (val) => {
        if (val <= 5) return ["Grammarly Free/Basic ($0-12/month)", "Simple browser extensions", "Basic password managers (Bitwarden: $10/year)"];
        if (val <= 30) return ["Notion Personal Pro ($10/month)", "Canva Pro ($12.99/month)", "Slack Pro per user ($7.25/month)", "Spotify Premium ($10.99/month)", "LinkedIn Premium Career ($29.99/month)"];
        if (val <= 70) return ["Salesforce Sales Cloud ($75/user/month)", "Adobe Creative Cloud for Teams ($84.99/user/month)", "GitHub Enterprise ($21/user/month)"];
        if (val <= 100) return ["Veeva CRM ($100+/user/month)", "Workday HCM ($100-200/user/month)", "Palantir Enterprise Solutions"];
        return ["SAP enterprise solutions", "Oracle Enterprise", "Specialized vertical SaaS ($200+/user/month)"];
      }
    },
    tier2Price: {
      getLabel: (val) => {
        if (val < 40) return "💤 Weak upsell";
        if (val <= 150) return "✅ Healthy Base Case";
        if (val <= 300) return "🚀 Ambitious";
        return "💎 Premium Enterprise / Usage-Based";
      },
      getColor: (val) => {
        if (val < 40) return "text-red-500";
        if (val <= 150) return "text-green-600";
        if (val <= 300) return "text-blue-500";
        return "text-purple-600";
      },
      getExamples: (val) => {
        if (val < 40) return ["Evernote Premium ($7.99 → $10.99, +$3)", "Google One storage upgrade ($1.99 → $2.99)", "Ad removal only"];
        if (val <= 150) return ["Canva Pro → Teams ($12.99 → $29.99/user)", "Notion Personal → Team ($10 → $15/user)", "Shopify Basic → Shopify ($29 → $79/month)", "Zoom Pro → Business ($14.99 → $19.99/user)", "HubSpot Starter → Professional ($45 → $450/month)"];
        if (val <= 300) return ["Twilio (usage-based, $0 to $10,000+)", "AWS compute services (elastic)", "Stripe (volume-based)", "Snowflake (consumption starts here)"];
        return ["OpenAI API usage tiers ($500+)", "Databricks Enterprise", "Advanced analytics platforms", "Mission-critical infrastructure ($500-$2000+)"];
      }
    },
    tier2ConversionSplit: {
      getLabel: (val) => {
        if (val < 50) return "💤 Upsell Failure";
        if (val <= 80) return "✅ Healthy Base Case";
        if (val < 100) return "⚠️ Investor Scrutiny";
        return "❌ Impossible";
      },
      getColor: (val) => {
        if (val < 50) return "text-red-500";
        if (val <= 80) return "text-green-600";
        if (val < 100) return "text-yellow-600";
        return "text-red-600";
      },
      getExamples: (val) => {
        if (val < 50) return ["Dropbox (struggled with ~2-4% conversion)", "Products with weak premium features", "Free tier is 'too good'"];
        if (val <= 80) return ["Miro: Free → Team via board limits", "Zapier: Task limits drive upgrades (60-70%)", "Slack: Message history limits", "Figma: Project limits", "Calendly: Meeting limits"];
        // The outline did not provide examples for val >= 100, leaving this as is based on existing code structure.
        return ["Unrealistic to achieve", "Requires rethinking product value"];
      }
    },
    freeToPaidConversion: {
      getLabel: (val) => {
        if (val < 2) return "💤 Low conversion";
        if (val <= 5) return "✅ Healthy Base Case";
        return "🚀 Very Ambitious";
      },
      getColor: (val) => {
        if (val < 2) return "text-red-500";
        if (val <= 5) return "text-green-600";
        return "text-blue-500";
      },
      getExamples: (val) => {
        if (val < 2) return ["Needs significant improvement in value prop", "Consider usage limits", "Improve onboarding"];
        if (val <= 5) return ["Industry standard for freemium", "Time-limited trials work well", "Usage-based triggers effective"];
        return ["Excellent conversion rate", "Strong product-market fit", "Effective value ladder"];
      }
    },
    adRevenuePer1000: {
      getLabel: (val) => {
        if (val < 2) return "💤 Low ad efficiency";
        if (val <= 5) return "✅ Healthy Base Case";
        return "🚀 Premium ad rates";
      },
      getColor: (val) => {
        if (val < 2) return "text-red-500";
        if (val <= 5) return "text-green-600";
        return "text-blue-500";
      },
      getExamples: (val) => {
        if (val < 2) return ["Basic display ads", "Low engagement audience", "Minimal targeting"];
        if (val <= 5) return ["Targeted ads", "Good engagement", "Standard ad rates"];
        return ["Premium ad placements", "High-value audience", "Excellent targeting"];
      }
    },
    avgTransactionValue: {
      getLabel: (val) => {
        if (val < 10) return "💤 Low transaction value";
        if (val <= 50) return "✅ Moderate Base Case";
        return "🚀 High value transactions";
      },
      getColor: (val) => {
        if (val < 10) return "text-red-500";
        if (val <= 50) return "text-green-600";
        return "text-blue-500";
      },
      getExamples: (val) => {
        if (val < 10) return ["Microtransactions", "Food delivery tips", "Small service fees"];
        if (val <= 50) return ["Ride-sharing commissions", "Freelance platform fees", "Standard marketplace take-rates"];
        return ["Real estate transactions", "High-value B2B marketplace", "Premium service commissions"];
      }
    },
    monthlyMarketingBudget: {
      getLabel: (val) => {
        if (val < 10000) return "💤 Low / Inconsistent";
        if (val <= 100000) return "✅ Balanced / Base Case";
        if (val <= 500000) return "🚀 Aggressive Growth";
        return "💎 Hyper-Growth / Unsustainable";
      },
      getColor: (val) => {
        if (val < 10000) return "text-red-500";
        if (val <= 100000) return "text-green-600";
        if (val <= 500000) return "text-blue-500";
        return "text-purple-600";
      },
      getExamples: (val) => {
        if (val < 10000) return ["Buffer's early organic strategy", "Community-driven growth", "Bootstrapped pre-revenue"];
        if (val <= 100000) return ["Ahrefs (heavy SEO + moderate paid)", "ConvertKit (content + paid social)", "Most Series A SaaS"];
        if (val <= 500000) return ["Chime Bank (massive TV campaigns)", "Monday.com (aggressive campaigns)", "Brex (B2B blitz)"];
        return ["Uber/Lyft hyper-growth phase ($1M+/month)", "DoorDash market expansion", "Unsustainable without massive funding"];
      }
    },
    acquisitionCost: {
      getLabel: (val) => {
        if (val <= 25) return "✅ Efficient CAC";
        if (val <= 75) return "⚠️ High CAC";
        return "💤 Very expensive";
      },
      getColor: (val) => {
        if (val <= 25) return "text-green-600";
        if (val <= 75) return "text-yellow-600";
        return "text-red-500";
      },
      getExamples: (val) => {
        if (val <= 25) return ["Viral/organic growth", "Efficient paid acquisition", "Strong word-of-mouth"];
        if (val <= 75) return ["Standard competitive markets", "Balanced channel mix", "Good targeting"];
        return ["Enterprise sales", "Highly competitive", "Needs optimization"];
      }
    },
    initialUsers: {
      getLabel: (val) => {
        if (val < 50) return "💤 Too small to validate";
        if (val <= 500) return "✅ Base Case test cohort";
        if (val <= 2000) return "🚀 Strong validation";
        return "🚀 Should show revenue";
      },
      getColor: (val) => {
        if (val < 50) return "text-red-500";
        if (val <= 500) return "text-green-600";
        if (val <= 2000) return "text-blue-500";
        return "text-purple-600";
      },
      getExamples: (val) => {
        if (val < 50) return ["Friends/family only", "Too homogeneous", "Need broader testing"];
        if (val <= 500) return ["Superhuman (300-500 initial)", "Product Hunt waitlist", "Targeted outreach"];
        if (val <= 2000) return ["Clubhouse (2K initial beta)", "Strong PMF signal", "Good validation size"];
        return ["Gmail (1M+ waitlist)", "Notion (10K+ waitlist)", "Robinhood (1M+ waitlist)"];
      }
    },
    churnRisk: {
      getLabel: (val) => {
        if (val <= 6) return "✅ Excellent PMF";
        if (val <= 10) return "⚠️ Industry Standard";
        return "💤 Severe churn problem";
      },
      getColor: (val) => {
        if (val <= 6) return "text-green-600";
        if (val <= 10) return "text-yellow-600";
        return "text-red-500";
      },
      getExamples: (val) => {
        if (val <= 6) return ["Workday (<1% monthly)", "Salesforce (0.8-1.2%)", "GitHub (deep integration)", "QuickBooks (2-3%)"];
        if (val <= 10) return ["Asana/Monday (5-8%)", "Mailchimp (6-9%)", "SMB productivity tools", "Zoom Business (5-7%)"];
        return ["HelloFresh (8-12%)", "Fitness apps (10-15%)", "Duolingo Plus (8-12%)", "Dating apps (10-14%)"];
      }
    },
    targetMarketFactor: {
      getLabel: (val) => {
        if (val < 3) return "💤 Local, too small";
        if (val <= 7) return "✅ National, Base Case";
        return "🚀 International, Ambitious";
      },
      getColor: (val) => {
        if (val < 3) return "text-red-500";
        if (val <= 7) return "text-green-600";
        return "text-blue-500";
      },
      getExamples: (val) => {
        if (val < 3) return ["Gusto (US-only payroll initially)", "Up Bank (Australian-only)", "Regional tools"];
        if (val <= 7) return ["Robinhood (US-focused)", "Oscar Health (US insurance)", "Venmo (US payment)"];
        return ["Stripe (40+ countries)", "PayPal (200+ markets)", "Shopify (175+ countries)", "Zoom (global)", "Spotify (180+ markets)"];
      }
    }
  };

  const config = labels[paramKey];
  if (!config) return { label: "", color: "", examples: [] };
  
  return {
    label: config.getLabel(value),
    color: config.getColor(value),
    examples: config.getExamples ? config.getExamples(value) : []
  };
};

// --- Slider Modal (NO COLORS, STANDARD GRAY/BLUE) ---
const SliderModal = ({ isOpen, onClose, parameter, onSave }) => {
  const [localValue, setLocalValue] = useState(parameter.value);

  useEffect(() => {
    setLocalValue(parameter.value);
  }, [parameter.value, isOpen]);

  const handleSave = () => {
    onSave(localValue);
    onClose();
  };

  if (!isOpen) return null;

  const dynamicLabel = getParameterLabel(parameter.key, localValue);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{parameter.label}</DialogTitle>
        </DialogHeader>
        <div className="py-6 px-6">
          <div className="flex justify-between items-center mb-6">
            <span className="text-sm text-gray-600">Adjust the value:</span>
            <span className="text-3xl font-bold text-blue-600">
              {parameter.unit}{typeof localValue === 'number' ? localValue.toFixed(parameter.unit === '%' || parameter.unit === 'X' ? 0 : 2) : localValue}
            </span>
          </div>
          
          <div className="px-8">
            <input 
              type="range" 
              min={parameter.min} 
              max={parameter.max} 
              step={parameter.step} 
              value={localValue} 
              onChange={(e) => setLocalValue(parseFloat(e.target.value))} 
              className="w-full accent-blue-500"
            />
            
            {/* Dynamic Label with Emoji and Color */}
            <div className={`text-center font-semibold text-lg mt-6 mb-4 ${dynamicLabel.color}`}>
              {parameter.unit}{typeof localValue === 'number' ? localValue.toFixed(parameter.unit === '%' || parameter.unit === 'X' ? 0 : 2) : localValue} — {dynamicLabel.label}
            </div>

            {/* Dynamic Examples */}
            {dynamicLabel.examples && dynamicLabel.examples.length > 0 && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h5 className="text-sm font-semibold text-gray-700 mb-2">Examples at this level:</h5>
                <ul className="text-xs text-gray-600 space-y-1">
                  {dynamicLabel.examples.map((example, idx) => (
                    <li key={idx}>• {example}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        {/* Buttons now correctly placed in DialogFooter */}
        <DialogFooter className="flex justify-end gap-2 mt-6 px-8">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700">Apply Value</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// --- Parameter Input Component (EMPTY and EDITABLE) ---
const ParameterInput = ({ label, value, onChange, unit, overview, onMentorClick }) => {
  return (
    <div className="mb-6 p-4 bg-white rounded-xl shadow-md border border-gray-200">
      <div className="flex items-center justify-between mb-2">
        <div className="flex-1">
          <Label className="text-sm font-semibold text-gray-700">{label}</Label>
          {overview && (
            <p className="text-xs text-gray-500 mt-1 italic">{overview}</p>
          )}
        </div>
        <Button
          size="sm"
          onClick={onMentorClick}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs ml-2"
        >
          <MessageSquare className="w-3 h-3 mr-1" />
          Mentor
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          value={value === 0 ? '0' : value} // Display '0' explicitly when value is 0
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="flex-1"
          placeholder="0" // Placeholder for empty input
        />
        <span className="text-sm font-semibold text-gray-600">{unit}</span>
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
    const effectiveAcquisitionCost = Math.max(0.01, acquisitionCost); // Ensure acquisitionCost is not zero

    for (let month = 1; month <= MONTHS; month++) {
      const marketSaturationFactor = targetMarketSize > 0 ? (1 - (totalUsers / targetMarketSize)) : 1; // Prevent division by zero if targetMarketSize is 0
      
      let newUsersFromPaid = Math.floor(monthlyMarketingBudget / effectiveAcquisitionCost);
      const organicAcquisitionRate = 0.15 * ORGANIC_K_FACTOR * marketSaturationFactor;
      let newUsersFromOrganic = Math.floor(totalUsers * organicAcquisitionRate);
      let newUsers = newUsersFromPaid + newUsersFromOrganic;
      let churnedUsers = Math.floor(totalUsers * churnRateDecimal);
      totalUsers = Math.max(initialUsers, totalUsers + newUsers - churnedUsers); // Users cannot drop below initial users

      let freeUsers = totalUsers - payingUsers; // Recalculate free users before conversion logic

      if (businessModel === 'freemium' || businessModel === 'subscription') {
        let newlyPaidUsers = Math.floor(freeUsers * conversionRateDecimal);
        let churnedPaidUsers = Math.floor(payingUsers * churnRateDecimal);
        payingUsers = Math.max(0, payingUsers + newlyPaidUsers - churnedPaidUsers);
        freeUsers = totalUsers - payingUsers; // Update free users after paid conversion
      } else if (businessModel === 'transactional') {
        // For transactional, new users are directly added to the 'active' (paying) pool as there's no free tier concept
        let churnedPaidUsers = Math.floor(payingUsers * churnRateDecimal);
        let newlyPaidUsers = Math.floor(newUsers); // All new users are considered "paying" or "active"
        payingUsers = Math.max(0, payingUsers + newlyPaidUsers - churnedPaidUsers);
        freeUsers = 0; // No free users in transactional model
      } else if (businessModel === 'ad-driven') {
        // All users are considered 'free' and monetize via ads
        payingUsers = 0;
        freeUsers = totalUsers;
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
        // For transactional, totalUsers are the active user base making transactions.
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

// --- Helper functions with corrected marker positions ---
const getRevenueParameters = (businessModel) => {
  const baseParams = {
    subscription: [
      { 
        id: 1, 
        key: 'tier1Price', 
        label: "1. Tier 1 Price (Monthly ARPU)", 
        min: 0, 
        max: 200, 
        step: 1, 
        unit: "$",
      },
      { 
        id: 2, 
        key: 'tier2Price', 
        label: "2. Tier 2 Price (Upsell ARPU)", 
        min: 0, 
        max: 500, 
        step: 5, 
        unit: "$",
      },
      { 
        id: 3, 
        key: 'tier2ConversionSplit', 
        label: "3. Tier 2 Conversion Split (% of Paid Users)", 
        min: 0, 
        max: 100, 
        step: 1, 
        unit: "%",
      },
      { 
        id: 4, 
        key: 'freeToPaidConversion', 
        label: "4. Free-to-Paid Conversion Rate (Monthly %)", 
        min: 0, 
        max: 10, 
        step: 0.1, 
        unit: "%",
      },
    ],
    freemium: [
      { 
        id: 1, 
        key: 'tier1Price', 
        label: "1. Tier 1 Price (Monthly ARPU)", 
        min: 0, 
        max: 200, 
        step: 1, 
        unit: "$",
      },
      { 
        id: 2, 
        key: 'tier2Price', 
        label: "2. Tier 2 Price (Upsell ARPU)", 
        min: 0, 
        max: 500, 
        step: 5, 
        unit: "$",
      },
      { 
        id: 3, 
        key: 'tier2ConversionSplit', 
        label: "3. Tier 2 Conversion Split (% of Paid Users)", 
        min: 0, 
        max: 100, 
        step: 1, 
        unit: "%",
      },
      { 
        id: 4, 
        key: 'freeToPaidConversion', 
        label: "4. Free-to-Paid Conversion Rate (Monthly %)", 
        min: 0, 
        max: 10, 
        step: 0.1, 
        unit: "%",
      },
      { 
        id: 5, 
        key: 'adRevenuePer1000', 
        label: "5. Ad Revenue Per 1000 Free Users (Monthly)", 
        min: 0, 
        max: 10, 
        step: 0.5, 
        unit: "$",
      },
    ],
    'ad-driven': [
      { 
        id: 1, 
        key: 'adRevenuePer1000', 
        label: "1. Ad Revenue Per 1000 Users (Monthly)", 
        min: 0, 
        max: 10, 
        step: 0.5, 
        unit: "$",
      },
    ],
    transactional: [
      { 
        id: 1, 
        key: 'avgTransactionValue', 
        label: "1. Average Transaction Value (Fee/Commission)", 
        min: 0, 
        max: 100, 
        step: 1, 
        unit: "$",
      },
    ]
  };
  return baseParams[businessModel] || [];
};

const getGrowthParameters = () => {
  return [
    { 
      id: 10, 
      key: 'monthlyMarketingBudget', 
      label: "Monthly Marketing Budget", 
      min: 0, 
      max: 1000000, 
      step: 5000, 
      unit: "$",
    },
    { 
      id: 11, 
      key: 'acquisitionCost', 
      label: "Customer Acquisition Cost (CAC) Per User", 
      min: 0, 
      max: 100, 
      step: 1, 
      unit: "$",
    },
    { 
      id: 12, 
      key: 'initialUsers', 
      label: "Initial Users (beta/waitlist)", 
      min: 0, 
      max: 10000, 
      step: 10, 
      unit: "",
    },
    { 
      id: 13, 
      key: 'churnRisk', 
      label: "Churn Risk (Monthly %)", 
      min: 0, 
      max: 15, 
      step: 0.5, 
      unit: "%",
    },
    { 
      id: 14, 
      key: 'targetMarketFactor', 
      label: "Target Market Factor (1-10) - Scaled Capacity", 
      min: 0, 
      max: 10, 
      step: 0.5, 
      unit: "X",
    },
  ];
};

// --- Main App Component ---
export default function RevenueModelingExperience() {
  const router = useRouter();

  const [venture, setVenture] = useState(null); // State to hold the current venture
  const [businessModel, setBusinessModel] = useState('subscription');
  const [tier1Price, setTier1Price] = useState(0); // Default to 0
  const [tier2Price, setTier2Price] = useState(0); // Default to 0
  const [tier2ConversionSplit, setTier2ConversionSplit] = useState(0); // Default to 0
  const [adRevenuePer1000, setAdRevenuePer1000] = useState(0); // Default to 0
  const [avgTransactionValue, setAvgTransactionValue] = useState(0); // Default to 0
  const [monthlyMarketingBudget, setMonthlyMarketingBudget] = useState(0); // Default to 0
  const [acquisitionCost, setAcquisitionCost] = useState(0); // Default to 0
  const [initialUsers, setInitialUsers] = useState(0); // Default to 0
  const [churnRisk, setChurnRisk] = useState(0); // Default to 0
  const [freeToPaidConversion, setFreeToPaidConversion] = useState(0); // Default to 0
  const [targetMarketFactor, setTargetMarketFactor] = useState(0); // Default to 0
  const targetMarketValue = targetMarketFactor * TARGET_MARKET_SCALING;

  const [sliderModalOpen, setSliderModalOpen] = useState(false);
  const [currentParameter, setCurrentParameter] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchCurrentVenture = async () => {
      const currentUser = await User.me();
      const ventures = await Venture.filter({ created_by: currentUser.email }, "-created_date");
      if (ventures.length > 0) {
        setVenture(ventures[0]);
      }
    };
    fetchCurrentVenture();
  }, []); // Run once on component mount

  const openSliderModal = useCallback((param) => {
    setCurrentParameter(param);
    setSliderModalOpen(true);
  }, []);

  const closeSliderModal = useCallback(() => {
    setSliderModalOpen(false);
    setCurrentParameter(null);
  }, []);

  const handleSliderSave = useCallback((value) => {
    if (currentParameter) {
      const setters = {
        tier1Price: setTier1Price,
        tier2Price: setTier2Price,
        tier2ConversionSplit: setTier2ConversionSplit,
        adRevenuePer1000: setAdRevenuePer1000,
        avgTransactionValue: setAvgTransactionValue,
        monthlyMarketingBudget: setMonthlyMarketingBudget,
        acquisitionCost: setAcquisitionCost,
        initialUsers: setInitialUsers,
        churnRisk: setChurnRisk,
        freeToPaidConversion: setFreeToPaidConversion,
        targetMarketFactor: setTargetMarketFactor
      };
      setters[currentParameter.key](value);
    }
  }, [currentParameter]);

  // Define revenueData to capture all current parameters
  const revenueData = useMemo(() => ({
    businessModel,
    tier1Price,
    tier2Price,
    tier2ConversionSplit,
    adRevenuePer1000,
    avgTransactionValue,
    monthlyMarketingBudget,
    acquisitionCost,
    initialUsers,
    churnRisk,
    freeToPaidConversion,
    targetMarketFactor,
    targetMarketValue,
  }), [businessModel, tier1Price, tier2Price, tier2ConversionSplit, adRevenuePer1000, avgTransactionValue, monthlyMarketingBudget, acquisitionCost, initialUsers, churnRisk, freeToPaidConversion, targetMarketFactor, targetMarketValue]);

  const canFinalize = useCallback(() => {
    if (!venture) { // Must have a venture to finalize
      return false;
    }
    if (initialUsers <= 0 || targetMarketFactor <= 0) {
      return false;
    }

    // Check model-specific revenue parameters
    if (businessModel === 'subscription' || businessModel === 'freemium') {
      if (tier1Price <= 0) return false;
    } else if (businessModel === 'ad-driven') {
      if (adRevenuePer1000 <= 0) return false;
    } else if (businessModel === 'transactional') {
      if (avgTransactionValue <= 0) return false;
    }

    // monthlyMarketingBudget, acquisitionCost, churnRisk can be 0 or small for certain models/stages.
    // For a basic "complete" check, non-negative values are implicitly handled by input types.
    return true;
  }, [venture, initialUsers, targetMarketFactor, businessModel, tier1Price, adRevenuePer1000, avgTransactionValue]);


  const handleFinalizeModel = async () => {
    if (!canFinalize()) {
      alert("Please ensure all critical revenue and growth parameters (like Initial Users, Target Market Factor, and your primary revenue driver) are set to meaningful values before finalizing.");
      return;
    }

    if (!window.confirm("Are you sure you want to finalize your revenue model? You won't be able to edit it after this.")) {
      return;
    }

    setIsSubmitting(true);
    try {
      if (!venture) {
        alert("No venture found. Please refresh and try again.");
        setIsSubmitting(false); // Ensure submitting state is reset on early exit
        return;
      }

      // Update the venture with revenue model completion and data, and directly transition phase to 'mlp'
      await Venture.update(venture.id, {
        revenue_model_data: {
          ...revenueData,
          finalized_date: new Date().toISOString()
        },
        revenue_model_completed: true,
        phase: 'mlp' // Direct transition to MLP phase
      });

      // System message for revenue model completion (completed in MVP phase)
      await VentureMessage.create({
        venture_id: venture.id,
        message_type: 'phase_complete',
        title: '✅ Revenue Model Finalized!',
        content: `Your revenue model for "${venture.name}" is now finalized.`,
        phase: 'mvp', // Message relates to MVP phase completion
        priority: 3
      });

      // Create MLP welcome message
      await VentureMessage.create({
        venture_id: venture.id,
        message_type: 'phase_welcome',
        title: '💖 Welcome to the MLP Phase!',
        content: `Great progress! You're now in the Minimum Lovable Product phase. Your mission is to gather user feedback and make your product truly lovable.

Key tasks:
• Complete the MLP Development Center to plan your enhancements
• Share your landing page to collect feedback from users
• Use the Promotion Center to invite users for feedback
• Analyze feedback in the Product Feedback Center

Once you've completed MLP development, you'll be ready to move to the Beta phase.`,
        phase: 'mlp',
        priority: 3
      });

      alert('Revenue model finalized successfully! You\'ve progressed to the MLP phase. Redirecting to dashboard...');
      router.push(createPageUrl('Dashboard')); // Navigate to Dashboard
    } catch (error) {
      console.error("Error finalizing revenue model:", error);
      alert("There was an error finalizing your revenue model. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const modelData = useFinancialModel({
    businessModel, tier1Price, tier2Price, tier2ConversionSplit, adRevenuePer1000,
    avgTransactionValue, initialUsers, churnRisk, targetMarketSize: targetMarketValue,
    freeToPaidConversion, monthlyMarketingBudget, acquisitionCost
  });

  const year2CumulativeRevenue = modelData.reduce((sum, d) => sum + d.TotalRevenue, 0);
  const totalUsersMonth24 = modelData.length > 0 ? modelData[MONTHS - 1].TotalUsers : 0;
  const payingUsersMonth24 = modelData.length > 0 ? modelData[MONTHS - 1].PayingUsers : 0;

  const year1Revenue = modelData.slice(0, 12).reduce((sum, d) => sum + d.TotalRevenue, 0);
  const year1TotalUsers = modelData.length > 0 ? modelData[11].TotalUsers : 0;
  const year1PayingUsers = modelData.length > 0 ? modelData[11].PayingUsers : 0;

  const totalUsersLineName = (businessModel === 'transactional') ? "Total Active Users" : "Total Users";

  const values = {
    tier1Price,
    tier2Price,
    tier2ConversionSplit,
    adRevenuePer1000,
    avgTransactionValue,
    monthlyMarketingBudget,
    acquisitionCost,
    initialUsers,
    churnRisk,
    freeToPaidConversion,
    targetMarketFactor
  };

  const setters = {
    tier1Price: setTier1Price,
    tier2Price: setTier2Price,
    tier2ConversionSplit: setTier2ConversionSplit,
    adRevenuePer1000: setAdRevenuePer1000,
    avgTransactionValue: setAvgTransactionValue,
    monthlyMarketingBudget: setMonthlyMarketingBudget,
    acquisitionCost: setAcquisitionCost,
    initialUsers: setInitialUsers,
    churnRisk: setChurnRisk,
    freeToPaidConversion: setFreeToPaidConversion,
    targetMarketFactor: setTargetMarketFactor
  };

  const revenueParams = getRevenueParameters(businessModel);
  const growthParams = getGrowthParameters();

  const getModelCardClasses = (modelValue) => {
    const isSelected = businessModel === modelValue;
    const model = MODEL_OPTIONS.find(m => m.value === modelValue);
    if (!model) return "";
    
    if (isSelected) {
      return `${model.borderColor} ${model.bgColor} border-2 shadow-lg text-blue-800`;
    }
    return "border-gray-300 bg-white hover:bg-gray-50 text-gray-700";
  };

  const getGuidanceBoxClasses = () => {
    const model = MODEL_OPTIONS.find(m => m.value === businessModel);
    if (!model) return "bg-white";
    return model.bgColor;
  };

  const getSelectedModelBgColor = () => {
    const model = MODEL_OPTIONS.find(m => m.value === businessModel);
    if (!model) return "bg-white";
    return model.bgColor;
  };

  const getSelectedModelBorderColor = () => {
    const model = MODEL_OPTIONS.find(m => m.value === businessModel);
    if (!model) return "border-gray-200";
    return model.borderColor;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-extrabold text-blue-800 tracking-tight sm:text-4xl">
            Dynamic Business Model Simulator- big fuck
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
            {MODEL_OPTIONS.map((model) => (
              <button
                key={model.value}
                onClick={() => setBusinessModel(model.value)}
                className={`p-4 rounded-xl text-left transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-opacity-50 ${getModelCardClasses(model.value)}`}
              >
                <div className="flex items-center mb-1">
                  <div className={`w-3 h-3 rounded-full mr-2 ${model.indicatorColor} ${businessModel === model.value ? 'shadow-[0_0_8px_0_currentColor]' : 'bg-gray-400'}`}></div>
                  <span className="font-bold text-lg">{model.name}</span>
                </div>
                <p className="text-sm text-gray-500">{model.description}</p>
              </button>
            ))}
          </div>

          {BUSINESS_MODEL_GUIDANCE[businessModel] && (
            <div className={`mt-6 p-4 rounded-lg border-2 ${getGuidanceBoxClasses()} ${getSelectedModelBorderColor()}`}>
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

        <div className={`mb-8 p-6 rounded-xl shadow-lg border-2 ${getSelectedModelBgColor()} ${getSelectedModelBorderColor()}`}>
          <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-2 flex items-center">
            <DollarSign className="w-6 h-6 mr-2 text-green-600"/>
            Revenue Assumptions
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {revenueParams.map(param => (
              <ParameterInput
                key={param.id}
                label={param.label}
                value={values[param.key]}
                onChange={setters[param.key]}
                unit={param.unit}
                overview={EXTENDED_GUIDANCE[param.key]?.overview}
                onMentorClick={() => openSliderModal({ ...param, value: values[param.key] })}
              />
            ))}
          </div>
        </div>

        <div className={`mb-8 p-6 rounded-xl shadow-lg border-2 ${getSelectedModelBgColor()} ${getSelectedModelBorderColor()}`}>
          <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-2 flex items-center">
            <Shuffle className="w-6 h-6 mr-2 text-red-600"/>
            Core Growth & Market Assumptions
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {growthParams.map(param => (
              <ParameterInput
                key={param.id}
                label={param.label}
                value={values[param.key]}
                onChange={setters[param.key]}
                unit={param.unit}
                overview={EXTENDED_GUIDANCE[param.key]?.overview}
                onMentorClick={() => openSliderModal({ ...param, value: values[param.key] })}
              />
            ))}
          </div>
        </div>

        <h2 className="text-3xl font-bold text-gray-800 mb-6 mt-12 border-b pb-2 flex items-center">
          <Zap className="w-6 h-6 mr-2 text-yellow-600"/>
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
            {typeof window !== "undefined" && (
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
            )}
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
                {businessModel === 'ad-driven' && (
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
              {businessModel === 'ad-driven' && (
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

        <div className={`mt-12 p-6 rounded-xl border-2 shadow-lg ${getSelectedModelBgColor()} ${getSelectedModelBorderColor()}`}>
          <h3 className="text-2xl font-bold text-gray-700 mb-4 flex items-center">
            <Monitor className="w-5 h-5 mr-2 text-gray-600"/>
            Selected Model Assumptions
          </h3>

          <div className="mb-6">
            <h4 className="text-base font-semibold text-gray-700 mb-3 uppercase tracking-wide">Your Selections:</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div className="p-3 bg-white rounded-lg border">
                <p className="text-gray-500 text-xs mb-1">Business Model</p>
                <p className="font-semibold text-gray-800">{businessModel}</p>
              </div>
              {(businessModel === 'subscription' || businessModel === 'freemium') && (
                <>
                  <div className="p-3 bg-white rounded-lg border">
                    <p className="text-gray-500 text-xs mb-1">Tier 1 Price</p>
                    <p className="font-semibold text-gray-800">${tier1Price}</p>
                  </div>
                  <div className="p-3 bg-white rounded-lg border">
                    <p className="text-gray-500 text-xs mb-1">Tier 2 Price</p>
                    <p className="font-semibold text-gray-800">${tier2Price}</p>
                  </div>
                  <div className="p-3 bg-white rounded-lg border">
                    <p className="text-gray-500 text-xs mb-1">T2 Conversion</p>
                    <p className="font-semibold text-gray-800">{tier2ConversionSplit}%</p>
                  </div>
                  <div className="p-3 bg-white rounded-lg border">
                    <p className="text-gray-500 text-xs mb-1">Free-to-Paid Conversion</p>
                    <p className="font-semibold text-gray-800">{freeToPaidConversion}%</p>
                  </div>
                </>
              )}
              {['freemium', 'ad-driven'].includes(businessModel) && (
                <div className="p-3 bg-white rounded-lg border">
                  <p className="text-gray-500 text-xs mb-1">Ad Revenue/1000</p>
                  <p className="font-semibold text-gray-800">${adRevenuePer1000}</p>
                </div>
              )}
              {businessModel === 'transactional' && (
                <div className="p-3 bg-white rounded-lg border">
                  <p className="text-gray-500 text-xs mb-1">Avg. Transaction Value</p>
                  <p className="font-semibold text-gray-800">${avgTransactionValue}</p>
                </div>
              )}
              <div className="p-3 bg-white rounded-lg border">
                <p className="text-gray-500 text-xs mb-1">Initial Users</p>
                <p className="font-semibold text-gray-800">{initialUsers}</p>
              </div>
              <div className="p-3 bg-white rounded-lg border">
                <p className="text-gray-500 text-xs mb-1">Churn Risk</p>
                <p className="font-semibold text-gray-800">{churnRisk}%</p>
              </div>
              <div className="p-3 bg-white rounded-lg border">
                <p className="text-gray-500 text-xs mb-1">Marketing Budget</p>
                <p className="font-semibold text-gray-800">${formatNumber(monthlyMarketingBudget)}</p>
              </div>
              <div className="p-3 bg-white rounded-lg border">
                <p className="text-gray-500 text-xs mb-1">CAC</p>
                <p className="font-semibold text-gray-800">${acquisitionCost}</p>
              </div>
              <div className="p-3 bg-white rounded-lg border">
                <p className="text-gray-500 text-xs mb-1">Market Factor</p>
                <p className="font-semibold text-gray-800">{targetMarketFactor}X</p>
              </div>
            </div>
          </div>

          <h4 className="text-base font-semibold text-gray-700 mb-3 uppercase tracking-wide">Fixed:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-white rounded-lg border">
              <p className="font-semibold text-sm mb-1">Timeframe: 24 Months</p>
              <p className="text-xs text-gray-600">The simulation provides a 2-year (24-month) mid-term financial forecast.</p>
            </div>
            <div className="p-3 bg-white rounded-lg border">
              <p className="font-semibold text-sm mb-1">Organic K-Factor: {ORGANIC_K_FACTOR}</p>
              <p className="text-xs text-gray-600">Measures viral spread — how many users each existing user recruits. With 100K users, a 0.65 K-Factor adds ~65K organically.</p>
            </div>
            <div className="p-3 bg-white rounded-lg border">
              <p className="font-semibold text-sm mb-1">Market Saturation (S-Curve)</p>
              <p className="text-xs text-gray-600">Growth slows as you approach the market cap. This prevents unrealistic "infinite" growth.</p>
            </div>
            <div className="p-3 bg-white rounded-lg border">
              <p className="font-semibold text-sm mb-1">Transactional Activity Rate: {TRANSACTION_RATE * 100}%</p>
              <p className="text-xs text-gray-600">For the Transactional model, only 0.5% of active users purchase monthly.</p>
            </div>
          </div>
        </div>

        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>Disclaimer: Financial results are illustrative, based on a modified S-curve growth model incorporating paid and organic acquisition.</p>
        </footer>

        <div className="mt-8 flex justify-center">
          <Button 
            onClick={handleFinalizeModel}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Finalizing...' : 'Finalize Revenue Model'}
          </Button>
        </div>

        {currentParameter && (
          <SliderModal
            isOpen={sliderModalOpen}
            onClose={closeSliderModal}
            parameter={currentParameter}
            onSave={handleSliderSave}
          />
        )}
      </div>
    </div>
  );
}
