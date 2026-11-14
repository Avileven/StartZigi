"use client";
// components/ventures/GrowthUI.jsx
//
// Shared by the two Growth pages:
//   app/growth-development/page.jsx           (step 1: venture profile)
//   app/growth-development/feedback/page.jsx  (step 2: feedback questions)
// Holds the constants, the data loader helper and the interactive UI pieces.
import React, { useState, useEffect } from 'react';
import {
  Lightbulb, PenTool, Package, ChevronRight, ChevronDown, CheckCircle, Check,
  Sparkles, Coins, HeartPulse, GraduationCap, ShoppingBag, Briefcase, Gamepad2, Plane, Leaf, Wrench, HelpCircle,
} from 'lucide-react';

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return isMobile;
}

// [FIX — real root cause, not styling] A native <input> can never wrap
// text to a second line or scroll vertically, no matter what CSS is
// applied — text just keeps extending sideways and scrolls out of view.
// That's what "gets stuck in the middle, can't see what you're typing" was
// — a fundamental HTML constraint, not a border/sizing bug. When value/
// onChange are passed, this component now owns the editing surface itself
// and always renders a real <textarea>, regardless of what element the
// caller's `children` uses on desktop. `children` is only used for the
// multi-field categories (Business Model, Core Features, Social Links)
// where several short inputs sit together — those still render as-is,
// with border removed but no forced full-screen height, since forcing
// full height there breaks a multi-field layout (confirmed by screenshot
// last round) more than it helps a genuinely short field like a price.
export function MobileFieldWrapper({ label, summary, isMobile, children, value, onChange, placeholder }) {
  const [open, setOpen] = useState(false);
  if (!isMobile) return <>{children}</>;
  const useOwnTextarea = value !== undefined && onChange !== undefined;
  return (
    <>
      {/* [FIX] mt-2 added — was sitting flush against the Label above it. */}
      <button type="button" onClick={() => setOpen(true)} className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-white text-left mt-2">
        <div className="min-w-0">
          {/* [FIX] Was showing {label} again here too, duplicating the
              Label already rendered above this component by the caller.
              Shows only the current value now (or the empty-state hint). */}
          {summary ? <p className="text-sm text-gray-900 truncate">{summary}</p> : <p className="text-sm text-gray-400">Tap to fill in</p>}
        </div>
        <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
      </button>
      {open && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
            <h3 className="font-semibold text-gray-900">{label}</h3>
            <button type="button" onClick={() => setOpen(false)} className="text-emerald-600 font-semibold flex items-center gap-1">
              <CheckCircle className="w-4 h-4" /> Save
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {useOwnTextarea ? (
              <textarea
                autoFocus
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full h-full min-h-[60vh] text-xl leading-relaxed border-0 focus:ring-0 focus:outline-none resize-none bg-transparent"
              />
            ) : (
              <div className="[&_textarea]:!min-h-[50vh] [&_textarea]:!border-0 [&_textarea]:!rounded-none [&_textarea]:!shadow-none [&_textarea]:!ring-0 [&_textarea]:!p-0 [&_textarea]:!text-xl
                [&_input]:!border-0 [&_input]:!rounded-none [&_input]:!shadow-none [&_input]:!ring-0">
                {children}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export const BUSINESS_MODEL_TYPES = [
  { value: 'subscription', name: 'Subscription', description: 'Recurring fees, with an optional free tier.' },
  { value: 'transactional', name: 'Transactional', description: 'Per-transaction fees or commissions.' },
  { value: 'ad-driven', name: 'Ad-Driven', description: 'Free product, revenue solely from ads.' },
];

export const STAGES = [
  { value: 'idea', name: 'Idea', description: 'You have an idea and want to find out if it is worth pursuing.' },
  { value: 'prototype', name: 'Prototype', description: 'You have a demo, an interactive sketch or a first prototype and want to know what to improve. A working product is not required.' },
  { value: 'product', name: 'Product', description: 'You have a live product and want feedback from real people.' },
];

export const SECTORS = [
  { value: 'ai_dev_tools', label: 'AI & Developer Tools' },
  { value: 'fintech_web3', label: 'FinTech & Web3' },
  { value: 'health_wellness', label: 'Health & Wellness' },
  { value: 'education', label: 'Education & Learning' },
  { value: 'ecommerce_retail', label: 'E-commerce & Retail' },
  { value: 'business_productivity', label: 'Business & Productivity' },
  { value: 'media_social_gaming', label: 'Media, Social & Gaming' },
  { value: 'lifestyle_travel_realestate', label: 'Lifestyle, Travel & Real Estate' },
  { value: 'climate_energy_agri', label: 'Climate, Energy & Agriculture' },
  { value: 'hardware_iot', label: 'Hardware & IoT' },
];

export const NOT_SURE = { value: 'not_sure', label: 'Not sure yet' };

export const LEGACY_SECTORS = {
  ai_deep_tech: 'ai_dev_tools',
  fintech: 'fintech_web3',
  web3_blockchain: 'fintech_web3',
  digital_health_biotech: 'health_wellness',
  b2b_saas: 'business_productivity',
  climatetech_energy: 'climate_energy_agri',
  consumer_apps: 'not_sure',
  other: 'not_sure',
};

export const STAGE_STYLE = {
  idea: { Icon: Lightbulb, card: 'bg-gradient-to-br from-amber-400 via-orange-400 to-rose-400', soft: 'bg-amber-50 border-amber-200', iconBg: 'bg-amber-100 text-amber-600', title: 'text-amber-800', chip: 'bg-amber-100 text-amber-800' },
  prototype: { Icon: PenTool, card: 'bg-gradient-to-br from-violet-500 via-indigo-500 to-blue-500', soft: 'bg-violet-50 border-violet-200', iconBg: 'bg-violet-100 text-violet-600', title: 'text-violet-800', chip: 'bg-violet-100 text-violet-800' },
  product: { Icon: Package, card: 'bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500', soft: 'bg-emerald-50 border-emerald-200', iconBg: 'bg-emerald-100 text-emerald-600', title: 'text-emerald-800', chip: 'bg-emerald-100 text-emerald-800' },
};

export const CATEGORY_EXPLANATIONS = {
  business_model: "Tests whether your pricing feels like it fits the value you're offering — not whether this reviewer personally thinks it's cheap or expensive.",
  core_features: "Tests whether the features you chose to highlight actually support what you say the product does — not whether reviewers find each feature exciting.",
  value_proposition: "This only affects whether reviewers are asked to rate your slogan's accuracy — your slogan itself is always shown regardless. Useful if you're unsure your slogan is landing the way you intend it to.",
  product_definition: "This only affects whether reviewers are asked to rate your description's clarity — your description itself is always shown regardless. Useful if you're unsure your description is landing the way you intend it to.",
  media: "Asks reviewers how clear your media was and whether it helped them understand the idea or product. Available once you upload a file.",
};

export const ExplainBlock = ({ text, extra, flush }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={flush ? 'mt-2' : 'pl-8 mt-2'}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border bg-white hover:bg-sky-50"
        style={{ color: '#0369A1', borderColor: '#BAE6FD' }}
      >
        Read more
        <ChevronDown className="w-3.5 h-3.5 transition-transform" style={{ transform: open ? 'rotate(180deg)' : 'none' }} />
      </button>
      {open && (
        <div className="mt-2 text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-2">
          {extra && <p>{extra}</p>}
          <p>{text}</p>
        </div>
      )}
    </div>
  );
};

// Normalises venture.growth_data (+ name and sector) into the shape both pages use.
export function normalizeGrowthData(currentVenture) {
  const loaded = { ...(currentVenture.growth_data || {}) };
  loaded.name = currentVenture.name || '';
  loaded.stage = ['idea', 'prototype', 'product'].includes(loaded.stage) ? loaded.stage : 'product';
  // Old values are translated; anything unknown shows as nothing selected.
  loaded.sector = LEGACY_SECTORS[currentVenture.sector] || currentVenture.sector || '';
  loaded.need = loaded.need || '';
  loaded.solution = loaded.solution || '';
  loaded.product_url = loaded.product_url || '';
  loaded.uploaded_files = (loaded.uploaded_files || []).slice(0, 1); // enforce single-file cap even on old data
  loaded.is_imported = loaded.is_imported === true;
  loaded.selected_categories = loaded.selected_categories || [];
  loaded.core_features = loaded.core_features || [];
  // [NEW] Core questions are always part of the selection: Core Features outside Idea, Innovation in Idea.
  if (loaded.stage === 'idea') { if (!loaded.selected_categories.includes('idea_alternatives')) loaded.selected_categories = [...loaded.selected_categories, 'idea_alternatives']; }
  else if (!loaded.selected_categories.includes('core_features')) loaded.selected_categories = [...loaded.selected_categories, 'core_features'];
  loaded.custom_question = loaded.custom_question || '';
  loaded.early_incentive = loaded.early_incentive || '';
  loaded.early_offer_text = loaded.early_offer_text || '';
  loaded.business_model_data = {
    model_type: loaded.business_model_data?.model_type || '',
    has_free_tier: loaded.business_model_data?.has_free_tier || false,
    free_tier_description: loaded.business_model_data?.free_tier_description || '',
    packages: loaded.business_model_data?.packages || [],
    transaction_fee_description: loaded.business_model_data?.transaction_fee_description || '',
  };
  loaded.social_links = {
    linkedin: loaded.social_links?.linkedin || '',
    facebook: loaded.social_links?.facebook || '',
    twitter: loaded.social_links?.twitter || '',
    instagram: loaded.social_links?.instagram || '',
    website: loaded.social_links?.website || '',
  };
  return loaded;
}

// ---------------------------------------------------------------------------
// Interactive pieces (animations are CSS only, all class names start with "zg-")
// ---------------------------------------------------------------------------
const GROWTH_CSS = `
@keyframes zg-rise{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@keyframes zg-pop{0%{transform:scale(.4);opacity:0}70%{transform:scale(1.18);opacity:1}100%{transform:scale(1);opacity:1}}
@keyframes zg-bounce{0%{transform:scale(1)}40%{transform:scale(1.25) rotate(-6deg)}70%{transform:scale(.95)}100%{transform:scale(1)}}
@keyframes zg-zfill{0%{clip-path:inset(0 100% 0 0);opacity:1}55%{clip-path:inset(0 0 0 0);opacity:1}85%{clip-path:inset(0 0 0 0);opacity:1}95%{clip-path:inset(0 0 0 0);opacity:0}100%{clip-path:inset(0 100% 0 0);opacity:0}}
@keyframes zg-tip{0%,68%,100%{fill:rgba(251,191,36,0);filter:none}76%,90%{fill:#FDE68A;filter:drop-shadow(0 0 5px rgba(251,191,36,.9))}}
@keyframes zg-dscale{0%{transform:scale(.3);opacity:0}60%{transform:scale(1.1);opacity:1}100%{transform:scale(1);opacity:1}}
@keyframes zg-ddraw{to{stroke-dashoffset:0}}
@keyframes zg-dtext{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
.zg-step{opacity:0;animation:zg-rise .5s ease forwards}
.zg-ficon-done svg{animation:zg-pop .45s ease backwards}
.zg-tile{transition:transform .2s ease,box-shadow .2s ease,border-color .2s ease,background-color .2s ease}
.zg-tile-on{transform:scale(1.05)}
.zg-tile-on .zg-tile-icon{animation:zg-bounce .5s ease}
.zg-zfill{animation:zg-zfill 5s ease-in-out infinite}
.zg-tipbulb{animation:zg-tip 6s ease-in-out infinite}
.zg-dcircle{animation:zg-dscale .6s ease forwards}
.zg-dcheck{stroke-dasharray:60;stroke-dashoffset:60;animation:zg-ddraw .6s ease .5s forwards}
.zg-dtext{opacity:0;animation:zg-dtext .6s ease 1s forwards}
@media (prefers-reduced-motion:reduce){
  .zg-step,.zg-dtext{opacity:1;animation:none}
  .zg-ficon-done svg,.zg-tile-on .zg-tile-icon,.zg-zfill,.zg-tipbulb,.zg-dcircle{animation:none}
  .zg-dcheck{animation:none;stroke-dashoffset:0}
}
`;

export const GrowthStyles = () => <style dangerouslySetInnerHTML={{ __html: GROWTH_CSS }} />;

// "Z" badge used in How It Works (the AI analysis button).
export const ZBadge = () => (
  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-extrabold text-white" style={{ background: 'linear-gradient(135deg,#F49A58,#7045DC)' }}>Z</span>
);

// Opening window of each page, same idea as the Idealization window on the onboarding screen:
// a small label, a title, and the steps. The steps appear one after another, once, and stay.
export function HowItWorks({ kicker, title, steps }) {
  return (
    <div className="rounded-3xl bg-white border border-gray-200 shadow-sm p-5 md:p-8">
      <p className="text-xs md:text-sm font-bold tracking-widest uppercase text-emerald-700">{kicker}</p>
      <h2 className="mt-1 text-2xl md:text-3xl font-extrabold text-gray-900">{title}</h2>
      <ol className="mt-4 space-y-3">
        {steps.map((s, i) => (
          <li key={i} className="zg-step flex items-start gap-3" style={{ animationDelay: `${0.3 + i * 1.0}s` }}>
            <span className="flex-shrink-0 w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">{s.icon}</span>
            <span className="text-base text-gray-700 pt-2 min-w-0">{s.text}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

// The Z (AI analysis) logo: it slowly fills with colour from left to right, then starts again.
export function ZLogo({ height = 44 }) {
  return (
    <span className="relative inline-block" style={{ height }}>
      <img src="/zig-it-logo.png" alt="Zig it" style={{ height, width: 'auto', opacity: 0.4, filter: 'grayscale(1)' }} />
      <img className="zg-zfill" src="/zig-it-logo.png" alt="" aria-hidden="true" style={{ position: 'absolute', left: 0, top: 0, height, width: 'auto' }} />
    </span>
  );
}

// Tips bulb: lights up now and then.
export function TipBulb({ size = 44 }) {
  return <Lightbulb className="zg-tipbulb" style={{ height: size, width: size }} strokeWidth={1.5} />;
}

// Animated 'done' screen (used after the profile is saved and after the feedback setup is saved): an animated "done" screen, then the feedback page opens.
export function ProfileDone({ title, text, note, onContinue }) {
  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center gap-6 p-6 text-center">
      <svg className="zg-dcircle" width="132" height="132" viewBox="0 0 132 132" fill="none">
        <circle cx="66" cy="66" r="62" fill="#ECFDF5" stroke="#10B981" strokeWidth="6" />
        <path className="zg-dcheck" d="M40 68l18 18 34-38" stroke="#10B981" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div className="zg-dtext space-y-2">
        <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">{title}</h2>
        {text && <p className="text-base md:text-lg text-gray-600 max-w-md mx-auto">{text}</p>}
        {note && <p className="text-sm text-amber-700 max-w-md mx-auto">{note}</p>}
      </div>
      <button type="button" onClick={onContinue} className="zg-dtext px-8 py-3 rounded-full bg-emerald-600 text-white font-semibold text-base" style={{ animationDelay: '1.4s' }}>Continue</button>
    </div>
  );
}

// One profile field = one card with an animated icon next to it.
// done: shows a check that pops in. active: the next field to fill, its icon pulses.
export function FieldCard({ Icon, title, description, done, active, children }) {
  return (
    <div className={`rounded-2xl border p-4 md:p-6 shadow-sm transition-colors ${done ? 'border-emerald-300 bg-emerald-50/50' : 'border-gray-200 bg-white'}`}>
      <div className="flex items-start gap-3 md:gap-4">
        <div className={`zg-ficon ${done ? 'zg-ficon-done' : ''} flex-shrink-0 w-11 h-11 md:w-12 md:h-12 rounded-xl flex items-center justify-center ${done ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}`}>
          {done ? <Check key="done" className="w-5 h-5 md:w-6 md:h-6" strokeWidth={3} /> : <Icon className="w-5 h-5 md:w-6 md:h-6" />}
        </div>
        <div className="min-w-0 flex-1 pt-0.5">
          <h3 className="text-base md:text-lg font-semibold text-gray-900">{title}</h3>
          {description && <p className="text-sm text-gray-500 mt-0.5">{description}</p>}
        </div>
      </div>
      <div className="mt-3 md:mt-4">{children}</div>
    </div>
  );
}

const SECTOR_ICONS = {
  ai_dev_tools: Sparkles,
  fintech_web3: Coins,
  health_wellness: HeartPulse,
  education: GraduationCap,
  ecommerce_retail: ShoppingBag,
  business_productivity: Briefcase,
  media_social_gaming: Gamepad2,
  lifestyle_travel_realestate: Plane,
  climate_energy_agri: Leaf,
  hardware_iot: Wrench,
};

// Industry picker: big tiles with an icon each. The chosen tile grows and its icon bounces.
export function SectorTiles({ value, onChange }) {
  const tile = (sec, Icon, full) => {
    const on = value === sec.value;
    return (
      <button
        type="button"
        key={sec.value}
        onClick={() => onChange(on ? '' : sec.value)}
        aria-pressed={on}
        className={`zg-tile ${on ? 'zg-tile-on border-emerald-500 bg-emerald-50 shadow-md' : 'border-gray-200 bg-white hover:border-emerald-300'} ${value && !on ? 'opacity-70' : ''} ${full ? 'col-span-2 md:col-span-3 flex-row' : 'flex-col'} flex items-center justify-center gap-2 text-center rounded-2xl border p-3 min-h-[88px]`}
      >
        <span className={`zg-tile-icon w-11 h-11 rounded-full flex items-center justify-center ${on ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}`}><Icon className="w-5 h-5" /></span>
        <span className={`text-sm leading-snug ${on ? 'font-semibold text-emerald-800' : 'text-gray-700'}`}>{sec.label}</span>
      </button>
    );
  };
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
      {SECTORS.map((sec) => tile(sec, SECTOR_ICONS[sec.value] || HelpCircle, false))}
      {tile(NOT_SURE, HelpCircle, true)}
    </div>
  );
}
