// VCAdvancedMeetingModal — v230326
// SCORING MODEL:
//   Advanced Meeting Score = (budgetStructureScore × 0.20) + (teamScore × 0.40) + (revenueScore × 0.40)
//   Final Score = (venture_screening_score + advancedMeetingScore) / 2
//   Investment Decision: advancedMeetingScore >= 5.0
//   Valuation: sectorBase × ventureMultiplier(finalScore)

// ─── IMPORTS ────────────────────────────────────────────────────────────────
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { VentureMessage } from '@/api/entities.js';
import { VCMeeting } from '@/api/entities.js';
import { Budget } from '@/api/entities.js';
import { Venture } from '@/api/entities.js';
import { InvokeLLM } from '@/api/integrations';
import { Button } from '@/components/ui/button';
import { Loader2, X, Send, User as UserIcon } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

// ─── HELPER: calculateBudgetStructureScore ───────────────────────────────────
// Scores the budget based on RATIOS only — no absolute minimums.
// Returns 0–10. Weights: Salaries 50%, Marketing 30%, Operations 20%.
const calculateBudgetStructureScore = (salariesPct, marketingPct, opsPct) => {
  let salariesScore = 0;
  if (salariesPct >= 35 && salariesPct <= 65) salariesScore = 10;
  else if ((salariesPct >= 25 && salariesPct < 35) || (salariesPct > 65 && salariesPct <= 75)) salariesScore = 6;
  else if (salariesPct > 0) salariesScore = 2;

  let marketingScore = 0;
  if (marketingPct >= 10 && marketingPct <= 30) marketingScore = 10;
  else if ((marketingPct >= 5 && marketingPct < 10) || (marketingPct > 30 && marketingPct <= 40)) marketingScore = 6;
  else if (marketingPct > 0) marketingScore = 2;

  let opsScore = 0;
  if (opsPct >= 5 && opsPct <= 20) opsScore = 10;
  else if ((opsPct >= 2 && opsPct < 5) || (opsPct > 20 && opsPct <= 30)) opsScore = 6;
  else if (opsPct > 0) opsScore = 2;

  return (salariesScore * 0.5) + (marketingScore * 0.3) + (opsScore * 0.2);
};

// ─── HELPER: getSectorBase ────────────────────────────────────────────────────
// Returns base valuation in dollars based on venture sector.
// AI/Cyber/Climate/Biotech=$5M | Fintech/Health/EdTech=$4M | else=$3M
const getSectorBase = (sector) => {
  const s = (sector || '').toLowerCase().replace(/[- ]/g, '_');
  const premium = ['ai', 'artificial_intelligence', 'cybersecurity', 'cyber', 'climate_tech', 'climate', 'cleantech', 'biotech', 'biotechnology'];
  const mid = ['fintech', 'financial_technology', 'healthtech', 'health_tech', 'digital_health', 'edtech', 'education_technology'];
  if (premium.some(k => s.includes(k))) return 5000000;
  if (mid.some(k => s.includes(k))) return 4000000;
  return 3000000;
};

// ─── HELPER: calculateInvestmentTerms ────────────────────────────────────────
// Calculates pre/post money valuation and equity.
// ventureMultiplier based on finalScore: >=9.6→2.0x | >=9.0→1.5x | >=8.0→1.2x | else→1.0x
const calculateInvestmentTerms = (finalScore, fundingAsk, ventureSector) => {
  const investmentAmount = fundingAsk;
  const sectorBase = getSectorBase(ventureSector);
  let ventureMultiplier = 1.0;
  if (finalScore >= 9.6) ventureMultiplier = 2.0;
  else if (finalScore >= 9.0) ventureMultiplier = 1.5;
  else if (finalScore >= 8.0) ventureMultiplier = 1.2;
  const preMoneyValuation = sectorBase * ventureMultiplier;
  const postMoneyValuation = preMoneyValuation + investmentAmount;
  const vcEquityPercentage = (investmentAmount / postMoneyValuation) * 100;
  return { investmentAmount, preMoneyValuation, postMoneyValuation, vcEquityPercentage, ventureMultiplier, sectorBase };
};

// ─── HELPER: parseFundingAsk ──────────────────────────────────────────────────
// Parses free text "$1.5M", "2000000", "500k", "1.5" → returns number (dollars) or 0.
// FIX: if amount < 1000 and no unit specified, assume millions (e.g. "1.5" → $1,500,000)
const parseFundingAsk = (answer) => {
  const clean = (answer || '').replace(/[,$]/g, '').toLowerCase().trim();
  let amount = 0;
  if (clean.includes('m')) amount = parseFloat(clean) * 1000000;
  else if (clean.includes('k')) amount = parseFloat(clean) * 1000;
  else {
    amount = parseFloat(clean);
    // If no unit and amount < 1000, assume user meant millions (e.g. "1.5" → $1,500,000)
    if (!isNaN(amount) && amount > 0 && amount < 1000) amount = amount * 1000000;
  }
  return isNaN(amount) || amount <= 0 ? 0 : amount;
};

// ─── HELPER: formatCalculationBreakdown ──────────────────────────────────────
// Builds scoring breakdown text for VentureMessage.
const formatCalculationBreakdown = (budgetTotal, salariesPct, marketingPct, opsPct, budgetStructureScore, teamScore, revenueScore, advancedMeetingScore, ventureScreeningScore, finalScore, fundingAsk) => {
  return `

--- SCORING BREAKDOWN ---

Funding Ask: $${fundingAsk.toLocaleString()}
2-Year Budget: $${budgetTotal.toLocaleString()}
  - Salaries: ${salariesPct.toFixed(1)}%
  - Marketing: ${marketingPct.toFixed(1)}%
  - Operations: ${opsPct.toFixed(1)}%

ADVANCED MEETING SCORE: ${advancedMeetingScore.toFixed(1)}/10
  Budget Structure (20%): ${budgetStructureScore.toFixed(1)}/10
  Team Question (40%): ${teamScore.toFixed(1)}/10
  Revenue Model (40%): ${revenueScore.toFixed(1)}/10

VENTURE SCREENING SCORE: ${ventureScreeningScore.toFixed(1)}/10
FINAL SCORE (average): ${finalScore.toFixed(1)}/10
THRESHOLD: 5.0 required for investment`;
};

// ─── HELPER: formatInvestmentProposal ────────────────────────────────────────
// Builds investment proposal text for VentureMessage when approved.
const formatInvestmentProposal = (terms, finalScore) => {
  return `

--- INVESTMENT PROPOSAL ---

Final Score: ${finalScore.toFixed(1)}/10
Sector Base: $${terms.sectorBase.toLocaleString()} x ${terms.ventureMultiplier}x = Pre-Money $${terms.preMoneyValuation.toLocaleString()}
Investment Amount: $${terms.investmentAmount.toLocaleString()}
Post-Money Valuation: $${terms.postMoneyValuation.toLocaleString()}
VC Equity: ${terms.vcEquityPercentage.toFixed(1)}%
Founder Equity: ${(100 - terms.vcEquityPercentage).toFixed(1)}%`;
};

// ─── COMPONENT ────────────────────────────────────────────────────────────────
export default function VCAdvancedMeetingModal({ isOpen, onClose, vcFirm, venture, messageId }) {
  const [conversation, setConversation] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isAnswering, setIsAnswering] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [userAnswers, setUserAnswers] = useState([]);
  const [questions, setQuestions] = useState([]);
  const chatEndRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // ─── INIT: open modal → reset state → set 3 questions → show Q1 ─────────────
  useEffect(() => {
    if (isOpen) {
      setConversation([]);
      setUserInput('');
      setCurrentQuestionIndex(0);
      setIsAnswering(false);
      setIsFinished(false);
      setUserAnswers([]);
      const q1 = 'Could you tell us how much money you would like to raise now?';
      setQuestions([q1, 'TEAM_QUESTION', 'REVENUE_MODEL_QUESTION']);
      setConversation([{ type: 'bot', text: `Nice to see you again. We have reviewed all of your venture data, especially the funding plan. ${q1}` }]);
    }
  }, [isOpen]);

  useEffect(() => { scrollToBottom(); }, [conversation, scrollToBottom]);

  // ─── SEND MESSAGE: collect answer → build next question → or process decision ─
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!userInput.trim() || isAnswering || isFinished) return;

    setIsAnswering(true);
    const userAnswer = userInput.trim();
    setUserInput('');
    const updatedAnswers = [...userAnswers, userAnswer];
    setUserAnswers(updatedAnswers);
    setConversation(prev => [...prev, { type: 'user', text: userAnswer }]);

    setTimeout(async () => {
      const acks = ['I see.', 'Got it.', 'Understood.', "That's helpful information."];
      setConversation(prev => [...prev, { type: 'bot', text: acks[Math.floor(Math.random() * acks.length)] }]);

      const nextIndex = currentQuestionIndex + 1;

      if (nextIndex < questions.length) {
        // ─── Build dynamic question ────────────────────────────────────────────
        setTimeout(async () => {
          let nextQuestion = questions[nextIndex];

          if (nextQuestion === 'TEAM_QUESTION') {
            // Check if budget has sales/business role → ask accordingly
            let hasSalesRole = false;
            try {
              const budgets = await Budget.filter({ venture_id: venture.id });
              if (budgets.length > 0) {
                const salesKw = ['sales', 'business', 'biz dev', 'account', 'revenue', 'growth', 'commercial', 'partnerships'];
                hasSalesRole = (budgets[0].salaries || []).some(s =>
                  salesKw.some(kw => (s.role || s.title || s.name || '').toLowerCase().includes(kw))
                );
              }
            } catch (e) { console.error('Budget load error (team Q):', e); }

            nextQuestion = hasSalesRole
              ? 'Looking at your team, you have sales and business talent. How do you plan to coordinate between product development and go-to-market — what is your approach to prioritizing between them?'
              : 'Looking at your budget, we do not see a dedicated sales or business development role. Customer acquisition is often a startup\'s biggest challenge — how do you plan to drive growth without a dedicated sales function?';
            setQuestions(prev => { const u = [...prev]; u[nextIndex] = nextQuestion; return u; });
          }

          if (nextQuestion === 'REVENUE_MODEL_QUESTION') {
            // Parse Q1 amount. If unclear → ask again instead of revenue Q.
            const fundingAsk = parseFundingAsk(updatedAnswers[0] || '');
            if (fundingAsk === 0) {
              nextQuestion = 'I want to make sure I understood correctly — could you please specify the exact amount you are looking to raise? For example, $1.5M or $2,000,000.';
            } else {
              let budgetTotal = 0;
              try {
                const budgets = await Budget.filter({ venture_id: venture.id });
                if (budgets.length > 0) {
                  const b = budgets[0];
                  const tS = (b.salaries || []).reduce((s, i) => s + (i.avg_salary * i.count * (i.percentage || 100) / 100 * 24), 0);
                  const tM = (b.marketing_costs || []).reduce((s, i) => s + (i.cost * 24), 0);
                  const tO = (b.operational_costs || []).reduce((s, i) => s + (i.cost * 24), 0);
                  budgetTotal = tS + tM + tO;
                }
              } catch (e) { console.error('Budget load error (revenue Q):', e); }
              const budgetStr = budgetTotal > 0 ? `$${budgetTotal.toLocaleString()}` : 'your stated budget';
              nextQuestion = `I see you are looking to raise $${fundingAsk.toLocaleString()} and your 2-year budget is ${budgetStr}. Can you walk me through your revenue model during this period and what revenue projections you are targeting?`;
            }
            setQuestions(prev => { const u = [...prev]; u[nextIndex] = nextQuestion; return u; });
          }

          setConversation(prev => [...prev, { type: 'bot', text: nextQuestion }]);
          setCurrentQuestionIndex(nextIndex);
          setIsAnswering(false);
        }, 1500);

      } else {
        // ─── All 3 answers collected → evaluate → decide ───────────────────────
        setIsFinished(true);
        setConversation(prev => [...prev, { type: 'bot', text: 'Thank you for your time. We will review the information and get back to you within a week with our final decision.' }]);

        setTimeout(async () => {
          try {
            // Load budget
            const budgets = await Budget.filter({ venture_id: venture.id });
            if (budgets.length === 0 || !budgets[0].is_complete) {
              await VentureMessage.create({ venture_id: venture.id, message_type: 'system', title: `Update from ${vcFirm.name}`, content: 'We cannot proceed as your funding plan is incomplete. Please complete it and try again.', phase: venture.phase, priority: 2, vc_firm_id: vcFirm.id, vc_firm_name: vcFirm.name, vc_stage: 'stage_2_rejected' });
              setTimeout(() => { onClose(); }, 2000);
              return;
            }

            const budget = budgets[0];

            // Calculate budget totals and ratios
            const tSal = (budget.salaries || []).reduce((s, i) => s + (i.avg_salary * i.count * (i.percentage || 100) / 100 * 24), 0);
            const tMkt = (budget.marketing_costs || []).reduce((s, i) => s + (i.cost * 24), 0);
            const tOps = (budget.operational_costs || []).reduce((s, i) => s + (i.cost * 24), 0);
            const budgetTotal = tSal + tMkt + tOps;
            const salariesPct = budgetTotal > 0 ? (tSal / budgetTotal * 100) : 0;
            const marketingPct = budgetTotal > 0 ? (tMkt / budgetTotal * 100) : 0;
            const opsPct = budgetTotal > 0 ? (tOps / budgetTotal * 100) : 0;

            // Budget structure score (20%)
            const budgetStructureScore = calculateBudgetStructureScore(salariesPct, marketingPct, opsPct);

            // Parse funding ask from Q1
            const fundingAsk = parseFundingAsk(updatedAnswers[0] || '0');

            // Dismiss original message
            if (messageId) { await VentureMessage.update(messageId, { is_dismissed: true }); }

            const ventureScreeningScore = venture.venture_screening_score || 7.0;

            // AI: team score (40%)
            let teamScore = 5.0;
            try {
              const teamResult = await InvokeLLM({ prompt: `You are a VC partner evaluating a founder's answer about their team and go-to-market capability.\n\nFOUNDER'S ANSWER:\n"${updatedAnswers[1] || ''}"\n\nScore 0-10. Pass=5. 8-10: specific credible plan. 5-7: reasonable but vague. 0-4: no real plan.\n\nRespond with ONLY: Overall Score: [0.0-10.0]` });
              const m = (teamResult.response || '').match(/Overall Score:\s*(\d+(?:\.\d+)?)/);
              if (m) teamScore = parseFloat(m[1]);
              console.log('Team AI Score:', teamScore);
            } catch (e) { console.error('Team AI error:', e); }

            // AI: revenue score (40%)
            let revenueScore = 5.0;
            try {
              const revResult = await InvokeLLM({ prompt: `You are a VC partner evaluating a founder's answer about their revenue model.\n\nCONTEXT:\n- Funding ask: $${fundingAsk.toLocaleString()}\n- 2-year budget: $${budgetTotal.toLocaleString()}\n\nFOUNDER'S ANSWER:\n"${updatedAnswers[2] || ''}"\n\nScore 0-10. Pass=5. 8-10: specific ARR targets and realistic projections. 5-7: good direction, missing specifics. 0-4: vague or unrealistic.\n\nRespond with ONLY: Overall Score: [0.0-10.0]` });
              const m = (revResult.response || '').match(/Overall Score:\s*(\d+(?:\.\d+)?)/);
              if (m) revenueScore = parseFloat(m[1]);
              console.log('Revenue AI Score:', revenueScore);
            } catch (e) { console.error('Revenue AI error:', e); }

            // Final scores
            const advancedMeetingScore = (budgetStructureScore * 0.20) + (teamScore * 0.40) + (revenueScore * 0.40);
            const finalScore = (ventureScreeningScore + advancedMeetingScore) / 2;
            const shouldInvest = advancedMeetingScore >= 5.0;

            console.group('VC DECISION');
            console.log('Budget:', budgetStructureScore.toFixed(1), '| Team:', teamScore.toFixed(1), '| Revenue:', revenueScore.toFixed(1));
            console.log('Advanced:', advancedMeetingScore.toFixed(2), '| Final:', finalScore.toFixed(2), '| Invest:', shouldInvest);
            console.groupEnd();

            const terms = calculateInvestmentTerms(finalScore, fundingAsk, venture.sector);
            const breakdown = formatCalculationBreakdown(budgetTotal, salariesPct, marketingPct, opsPct, budgetStructureScore, teamScore, revenueScore, advancedMeetingScore, ventureScreeningScore, finalScore, fundingAsk);

            // Update vc_meetings
            try {
              const vcMts = await VCMeeting.filter({ venture_id: venture.id, vc_firm_id: vcFirm.id });
              if (vcMts.length > 0) { await VCMeeting.update(vcMts[0].id, { status: shouldInvest ? 'meeting_completed' : 'screening_rejected' }); }
            } catch (e) { console.error('VCMeeting update error:', e); }

            // Send VentureMessage
            if (shouldInvest) {
              await VentureMessage.create({ venture_id: venture.id, message_type: 'investment_offer', title: `Investment Proposal from ${vcFirm.name}`, content: `We are pleased to present our investment proposal for ${venture.name}.${formatInvestmentProposal(terms, finalScore)}${breakdown}\n\nPlease review the terms above and let us know your decision.`, phase: venture.phase, priority: 4, vc_firm_id: vcFirm.id, vc_firm_name: vcFirm.name, vc_stage: 'investment_proposal', investment_offer_checksize: terms.investmentAmount, investment_offer_valuation: terms.postMoneyValuation, investment_offer_status: 'pending' });
            } else {
              await VentureMessage.create({ venture_id: venture.id, message_type: 'system', title: `Investment Decision from ${vcFirm.name}`, content: `After careful review, we have decided not to proceed with investment in your venture at this time.${breakdown}`, phase: venture.phase, priority: 2, vc_firm_id: vcFirm.id, vc_firm_name: vcFirm.name, vc_stage: 'stage_3_rejected' });
            }

            setTimeout(() => { onClose(); }, 2000);
          } catch (error) {
            console.error('Investment decision error:', error);
            setTimeout(() => { onClose(); }, 2000);
          }
        }, 2000);

        setIsAnswering(false);
      }
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold">Advanced Meeting with {vcFirm.name}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="w-5 h-5" /></Button>
        </div>

        {/* Chat */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {conversation.map((msg, index) => (
            <div key={index} className={`flex items-start gap-3 ${msg.type === 'user' ? 'justify-end' : ''}`}>
              {msg.type === 'bot' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
                  {vcFirm?.name?.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()}
                </div>
              )}
              <div className={`max-w-md p-3 rounded-lg shadow-sm ${msg.type === 'user' ? 'bg-blue-500 text-white rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-bl-none'}`}>
                <p className="whitespace-pre-wrap">{msg.text}</p>
              </div>
              {msg.type === 'user' && (
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                  <UserIcon className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
          ))}
          {isAnswering && !isFinished && <div className="flex justify-start"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div>}
          {isFinished && (
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
              <p className="text-blue-800 font-medium">Great meeting! we will be in touch.</p>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input — textarea for all questions, placeholder changes for Q1 */}
        {!isFinished && (
          <div className="p-4 border-t bg-gray-50">
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <Textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder={currentQuestionIndex === 0 ? 'e.g. $1.5M or $2,000,000' : 'Type your answer...'}
                className="flex-1 resize-none min-h-[40px]"
                disabled={isAnswering}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(e); } }}
              />
              <Button type="submit" disabled={!userInput.trim() || isAnswering} size="icon">
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
