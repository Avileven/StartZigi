// update 190326 — updated scoring model v2
// Advanced Meeting Score: 20% budget ratios + 20% funding ask ratio + 60% AI
// Final Score = avg(venture_screening_score, advanced_meeting_score)
// Valuation base by sector: AI/Cyber/Climate/Bio=$5M, Fintech/Health/EdTech=$4M, else=$3M
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { VentureMessage } from '@/api/entities.js';
import { VCMeeting } from '@/api/entities.js';
import { Budget } from '@/api/entities.js';
import { FundingEvent } from '@/api/entities.js';
import { Venture } from '@/api/entities.js';
import { InvokeLLM } from '@/api/integrations';
import { Button } from '@/components/ui/button';
import { Loader2, X, Send, User as UserIcon, Bot } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

/*
 * ============================================================
 * SCORING MODEL OVERVIEW — v2
 * ============================================================
 *
 * ADVANCED MEETING SCORE (0–10):
 *   20% = Budget Structure Score (ratio-based, no absolute minimums)
 *          - Salaries 35–65% → good | outside → penalty
 *          - Marketing 10–30% → good | outside → penalty
 *          - Operations 5–20% → good | outside → penalty
 *   20% = Funding Ask Ratio Score
 *          - fundingAsk / totalBudget: 1.5x–3x = 10pts, 1.0–1.5x = 6pts
 *            3.0–4.0x = 5pts, >4.0x = 2pts, <1.0x = 1pt
 *   60% = AI Score (Revenue Model — Question 2)
 *          - Clarity 40%, Alignment 35%, Realism 25%
 *
 * INVESTMENT DECISION:
 *   advanced_meeting_score >= 6.0 → qualifies
 *   final_score = (venture_screening_score + advanced_meeting_score) / 2
 *   final_score determines valuation multiplier
 *
 * VALUATION:
 *   Base by sector:
 *     AI, cybersecurity, climate_tech, biotech → $5M
 *     fintech, healthtech, edtech → $4M
 *     everything else → $3M
 *   Pre-Money = sectorBase × ventureMultiplier(final_score)
 *   Investment Amount = fundingAsk
 *   Post-Money = Pre-Money + fundingAsk
 *   VC Equity % = fundingAsk / Post-Money × 100
 *
 * ventureMultiplier (from final_score):
 *   >= 9.6 → 2.0x | >= 9.0 → 1.5x | >= 8.0 → 1.2x | >= 7.0 → 1.0x
 *
 * ============================================================
 */

// calculateBudgetStructureScore — ratio-based only, no absolute minimums (0–10)
// Lean budgets are not penalized as long as ratios are logical
const calculateBudgetStructureScore = (budget) => {
  const salaries = budget.salaries || [];
  const marketing = budget.marketing_costs || [];
  const operational = budget.operational_costs || [];

  const totalSalaries = salaries.reduce((sum, item) => sum + (item.avg_salary * item.count * (item.percentage || 100) / 100 * 24), 0);
  const totalMarketing = marketing.reduce((sum, item) => sum + (item.cost * 24), 0);
  const totalOperational = operational.reduce((sum, item) => sum + (item.cost * 24), 0);
  const totalBudget = totalSalaries + totalMarketing + totalOperational;

  const breakdown = {
    totalBudget,
    totalSalaries,
    totalMarketing,
    totalOperational,
    salariesPercentage: totalBudget > 0 ? (totalSalaries / totalBudget * 100) : 0,
    marketingPercentage: totalBudget > 0 ? (totalMarketing / totalBudget * 100) : 0,
    operationalPercentage: totalBudget > 0 ? (totalOperational / totalBudget * 100) : 0
  };

  // Score each category: good range = full points, acceptable = partial, bad = 0
  let salariesScore = 0;
  const sPct = breakdown.salariesPercentage;
  if (sPct >= 35 && sPct <= 65) salariesScore = 10;
  else if ((sPct >= 25 && sPct < 35) || (sPct > 65 && sPct <= 75)) salariesScore = 6;
  else if (sPct > 0) salariesScore = 2;

  let marketingScore = 0;
  const mPct = breakdown.marketingPercentage;
  if (mPct >= 10 && mPct <= 30) marketingScore = 10;
  else if ((mPct >= 5 && mPct < 10) || (mPct > 30 && mPct <= 40)) marketingScore = 6;
  else if (mPct > 0) marketingScore = 2;

  let opsScore = 0;
  const oPct = breakdown.operationalPercentage;
  if (oPct >= 5 && oPct <= 20) opsScore = 10;
  else if ((oPct >= 2 && oPct < 5) || (oPct > 20 && oPct <= 30)) opsScore = 6;
  else if (oPct > 0) opsScore = 2;

  // Weighted: salaries most important
  const structureScore = (salariesScore * 0.5) + (marketingScore * 0.3) + (opsScore * 0.2);

  return { score: structureScore, breakdown, salariesScore, marketingScore, opsScore };
};

// calculateFundingAskScore — ratio of fundingAsk to totalBudget (0–10)
const calculateFundingAskScore = (fundingAsk, totalBudget) => {
  if (!totalBudget || totalBudget === 0 || !fundingAsk || fundingAsk === 0) return 5;
  const ratio = fundingAsk / totalBudget;
  if (ratio >= 1.5 && ratio <= 3.0) return 10;
  if (ratio >= 1.0 && ratio < 1.5) return 6;
  if (ratio > 3.0 && ratio <= 4.0) return 5;
  if (ratio > 4.0) return 2;
  return 1; // ratio < 1.0 — underfunded
};

const parseFundingAsk = (answer) => {
  // Parses "$1.2M", "1200000", "500k", etc. Returns number or 0
  const clean = answer.replace(/[,$]/g, '').toLowerCase();
  let amount = 0;
  if (clean.includes('m')) amount = parseFloat(clean) * 1000000;
  else if (clean.includes('k')) amount = parseFloat(clean) * 1000;
  else amount = parseFloat(clean);
  return isNaN(amount) || amount <= 0 ? 0 : amount;
};

// getSectorBase — base valuation by venture sector
const getSectorBase = (sector) => {
  const s = (sector || '').toLowerCase().replace(/[- ]/g, '_');
  const premium = ['ai', 'artificial_intelligence', 'cybersecurity', 'cyber', 'climate_tech', 'climate', 'cleantech', 'biotech', 'biotechnology'];
  const mid = ['fintech', 'financial_technology', 'healthtech', 'health_tech', 'digital_health', 'edtech', 'education_technology'];
  if (premium.some(k => s.includes(k))) return 5000000;
  if (mid.some(k => s.includes(k))) return 4000000;
  return 3000000;
};

const calculateInvestmentTerms = (finalScore, fundingAsk, ventureSector) => {
  /*
   * Pre-Money = sectorBase × ventureMultiplier(finalScore)
   * Investment Amount = fundingAsk
   * Post-Money = Pre-Money + fundingAsk
   * VC Equity % = fundingAsk / Post-Money × 100
   *
   * finalScore = avg(venture_screening_score, advanced_meeting_score)
   */
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

const formatCalculationBreakdown = (budgetEval, fundingAskScore, aiScore, advancedScore, ventureScore, finalScore, fundingAsk) => {
  const { breakdown, salariesScore, marketingScore, opsScore } = budgetEval;
  return `

--- SCORING BREAKDOWN ---

2-Year Budget: $${breakdown.totalBudget.toLocaleString()}
  - Salaries: $${breakdown.totalSalaries.toLocaleString()} (${breakdown.salariesPercentage.toFixed(1)}%) → ${salariesScore.toFixed(1)}/10
  - Marketing: $${breakdown.totalMarketing.toLocaleString()} (${breakdown.marketingPercentage.toFixed(1)}%) → ${marketingScore.toFixed(1)}/10
  - Operations: $${breakdown.totalOperational.toLocaleString()} (${breakdown.operationalPercentage.toFixed(1)}%) → ${opsScore.toFixed(1)}/10

ADVANCED MEETING SCORE: ${advancedScore ? advancedScore.toFixed(1) : 'N/A'}/10
  Budget Structure (20%): ${budgetEval.score.toFixed(1)}/10
  Funding Ask Ratio (20%): ${fundingAskScore.toFixed(1)}/10 (Ask: $${fundingAsk.toLocaleString()})
  Revenue Model AI (60%): ${aiScore ? aiScore.toFixed(1) : 'N/A'}/10

VENTURE SCREENING SCORE: ${ventureScore.toFixed(1)}/10
FINAL SCORE (average): ${finalScore ? finalScore.toFixed(1) : 'N/A'}/10
THRESHOLD: 6.0 required for investment`;
};

const formatInvestmentProposal = (terms, finalScore, ventureSector) => {
  return `

--- INVESTMENT PROPOSAL ---

Final Score: ${finalScore.toFixed(1)}/10
Sector: ${ventureSector || 'General'}

Valuation Base: $${terms.sectorBase.toLocaleString()} (sector-based)
Venture Multiplier: ${terms.ventureMultiplier}x (based on final score)
Pre-Money Valuation: $${terms.preMoneyValuation.toLocaleString()}
Investment Amount: $${terms.investmentAmount.toLocaleString()}
Post-Money Valuation: $${terms.postMoneyValuation.toLocaleString()}

VC Equity: ${terms.vcEquityPercentage.toFixed(1)}%
Founder Equity: ${(100 - terms.vcEquityPercentage).toFixed(1)}%`;
};

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
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (isOpen) {
      setConversation([]);
      setUserInput('');
      setCurrentQuestionIndex(0);
      setIsAnswering(false);
      setIsFinished(false);
      setUserAnswers([]);

      const startMeeting = async () => {
        // Q1: funding ask
        const q1 = "Could you tell us how much money you would like to raise now?";

        // Q2: revenue model — dynamic, uses funding ask + budget total
        // Will be generated after Q1 answer is received
        const q2 = "REVENUE_MODEL_QUESTION";

        setQuestions([q1, q2]);
        setConversation([{
          type: 'bot',
          text: `Nice to see you again. We have reviewed all of your venture's data, especially the funding plan. ${q1}`
        }]);
      };

      startMeeting();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [conversation, scrollToBottom]);

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
      const acks = ["I see.", "Got it.", "Understood.", "That's helpful information."];
      setConversation(prev => [...prev, { type: 'bot', text: acks[Math.floor(Math.random() * acks.length)] }]);

      const nextIndex = currentQuestionIndex + 1;

      if (nextIndex < questions.length) {
        setTimeout(async () => {
          let nextQuestion = questions[nextIndex];

          if (nextQuestion === "REVENUE_MODEL_QUESTION") {
            // Build dynamic question using Q1 answer + budget total
            const fundingAsk = parseFundingAsk(userAnswer);
            let budgetTotal = 0;
            try {
              const budgets = await Budget.filter({ venture_id: venture.id });
              if (budgets.length > 0) {
                const ev = calculateBudgetScore(budgets[0]);
                budgetTotal = ev.breakdown.totalBudget;
              }
            } catch (e) { console.error('Error loading budget for Q2:', e); }

            const askStr = fundingAsk > 0 ? `$${fundingAsk.toLocaleString()}` : 'the amount you mentioned';
            const budgetStr = budgetTotal > 0 ? `$${budgetTotal.toLocaleString()}` : 'your stated budget';

            nextQuestion = `I see you're looking to raise ${askStr} and your 2-year budget is ${budgetStr}. Can you walk me through your revenue model during this period and what revenue projections you're targeting?`;

            // Update questions state with the real question
            setQuestions(prev => {
              const updated = [...prev];
              updated[nextIndex] = nextQuestion;
              return updated;
            });
          }

          setConversation(prev => [...prev, { type: 'bot', text: nextQuestion }]);
          setCurrentQuestionIndex(nextIndex);
          setIsAnswering(false);
        }, 1500);

      } else {
        // All questions answered — process decision
        setIsFinished(true);
        setConversation(prev => [...prev, {
          type: 'bot',
          text: 'We want to thank you again for meeting with us. We will discuss your opportunity further in our investment board and contact you with our final decision.'
        }]);

        setTimeout(async () => {
          try {
            const budgets = await Budget.filter({ venture_id: venture.id });
            if (budgets.length === 0 || !budgets[0].is_complete) {
              await VentureMessage.create({
                venture_id: venture.id,
                message_type: 'system',
                title: `Update from ${vcFirm.name}`,
                content: `We cannot proceed with the investment decision as your funding plan appears to be incomplete. Please complete your funding plan and try again.`,
                phase: venture.phase,
                priority: 2,
                vc_firm_id: vcFirm.id,
                vc_firm_name: vcFirm.name,
                vc_stage: 'stage_2_rejected'
              });
              setTimeout(() => { onClose(); }, 2000);
              return;
            }

            const budget = budgets[0];
            const evaluation = calculateBudgetScore(budget);
            if (messageId) {
              await VentureMessage.update(messageId, { is_dismissed: true });
            }

            const fundingAsk = parseFundingAsk(updatedAnswers[0] || "0");

            // AI evaluation of Q2 (revenue model answer)
            let aiScore = 6.0; // fallback
            try {
              const revenueAnswer = updatedAnswers[1] || "";
              const prompt = `You are a VC partner evaluating a founder's answer about their revenue model and projections.

CONTEXT:
- Funding ask: $${fundingAsk.toLocaleString()}
- 2-year budget: $${evaluation.breakdown.totalBudget.toLocaleString()}
- Venture screening score: ${ventureScreeningScore}/10

FOUNDER'S ANSWER:
"${revenueAnswer}"

EVALUATION TASK:
Score the answer on 3 dimensions (1-10 each):
1. Revenue Model Clarity (40% weight) — Is the revenue model specific and well-defined?
2. Budget Alignment (35% weight) — Does the answer connect the funding ask to concrete growth milestones?
3. Realism (25% weight) — Are the revenue projections realistic given the raise amount and budget?

Respond in this exact format:
Revenue Model Clarity: [score]/10
Budget Alignment: [score]/10
Realism: [score]/10
Overall AI Score: [weighted score 0.0-10.0]`;

              const result = await InvokeLLM({ prompt });
              const text = result.response || "";
              const match = text.match(/Overall AI Score:\s*(\d+(?:\.\d+)?)/);
              if (match) aiScore = parseFloat(match[1]);
              console.log("AI Revenue Model Evaluation:", text);
            } catch (e) {
              console.error("AI evaluation error, using fallback score:", e);
            }

            // Advanced meeting score: 20% budget structure + 20% funding ask + 60% AI
            const budgetEval = calculateBudgetStructureScore(budget);
            const fundingAskScore = calculateFundingAskScore(fundingAsk, budgetEval.breakdown.totalBudget);
            const advancedMeetingScore = (budgetEval.score * 0.20) + (fundingAskScore * 0.20) + (aiScore * 0.60);

            // Final score = average of venture screening + advanced meeting
            const ventureScreeningScore = venture.venture_screening_score || 7.0;
            const finalScore = (ventureScreeningScore + advancedMeetingScore) / 2;

            const terms = calculateInvestmentTerms(finalScore, fundingAsk, venture.sector);
            const breakdown = formatCalculationBreakdown(budgetEval, fundingAskScore, aiScore, advancedMeetingScore, ventureScreeningScore, finalScore, fundingAsk);

            console.group('💼 VC INVESTMENT DECISION');
            console.log('Budget Structure Score:', budgetEval.score.toFixed(1) + '/10');
            console.log('Funding Ask Score:', fundingAskScore.toFixed(1) + '/10');
            console.log('AI Score (revenue model):', aiScore.toFixed(1) + '/10');
            console.log('Advanced Meeting Score:', advancedMeetingScore.toFixed(2) + '/10');
            console.log('Venture Screening Score:', ventureScreeningScore + '/10');
            console.log('Final Score (average):', finalScore.toFixed(2) + '/10');
            console.log('Sector Base:', '$' + (terms.sectorBase / 1000000) + 'M');
            console.log('Decision:', advancedMeetingScore >= 6.0 ? '✅ INVEST' : '❌ REJECT (advanced score too low)');
            console.groupEnd();

            const shouldInvest = advancedMeetingScore >= 6.0;

            // Update vc_meetings status to reflect advanced meeting outcome
            try {
              const vcMeetings = await VCMeeting.filter({ venture_id: venture.id, vc_firm_id: vcFirm.id });
              if (vcMeetings.length > 0) {
                const newStatus = shouldInvest ? 'meeting_completed' : 'screening_rejected';
                await VCMeeting.update(vcMeetings[0].id, { status: newStatus });
              }
            } catch (e) { console.error('Error updating vc_meetings after advanced meeting:', e); }

            if (shouldInvest) {
              const proposal = formatInvestmentProposal(terms, finalScore, venture.sector);
              await VentureMessage.create({
                venture_id: venture.id,
                message_type: 'investment_offer',
                title: `💰 Investment Proposal from ${vcFirm.name}`,
                content: `We are pleased to present our investment proposal for ${venture.name}.${proposal}${breakdown}\n\nPlease review the terms above and let us know your decision.`,
                phase: venture.phase,
                priority: 4,
                vc_firm_id: vcFirm.id,
                vc_firm_name: vcFirm.name,
                vc_stage: 'investment_proposal',
                investment_offer_checksize: terms.investmentAmount,
                investment_offer_valuation: terms.postMoneyValuation,
                investment_offer_status: 'pending'
              });
            } else {
              await VentureMessage.create({
                venture_id: venture.id,
                message_type: 'system',
                title: `Investment Decision from ${vcFirm.name}`,
                content: `After careful review, we have decided not to proceed with investment in your venture at this time.${breakdown}`,
                phase: venture.phase,
                priority: 2,
                vc_firm_id: vcFirm.id,
                vc_firm_name: vcFirm.name,
                vc_stage: 'stage_3_rejected'
              });
            }

            setTimeout(() => { onClose(); }, 2000);

          } catch (error) {
            console.error("Error processing investment decision:", error);
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
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold">Advanced Meeting with {vcFirm.name}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

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
                  <UserIcon className="w-5 h-5 text-white"/>
                </div>
              )}
            </div>
          ))}

          {isAnswering && !isFinished && (
            <div className="flex justify-start">
              <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            </div>
          )}

          {isFinished && (
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
              <p className="text-blue-800 font-medium">Thank you for meeting with us. Please wait while we process your application.</p>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {!isFinished && (
          <div className="p-4 border-t bg-gray-50">
            {currentQuestionIndex === 0 ? (
              // Q1: Amount selector
              <div className="space-y-3">
                <p className="text-xs text-gray-500">Select the amount you would like to raise:</p>
                <div className="grid grid-cols-3 gap-2">
                  {['$250K', '$500K', '$750K', '$1M', '$1.5M', '$2M', '$3M', '$5M', '$10M'].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setUserInput(amount)}
                      disabled={isAnswering}
                      className={`py-2 px-3 rounded-lg border text-sm font-medium transition-all ${
                        userInput === amount
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400'
                      }`}
                    >
                      {amount}
                    </button>
                  ))}
                </div>
                <Button
                  onClick={(e) => { e.preventDefault(); if (userInput) handleSendMessage({ preventDefault: () => {} }); }}
                  disabled={!userInput || isAnswering}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  Confirm Amount
                </Button>
              </div>
            ) : (
              // Q2: Free text
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <Textarea
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Type your answer..."
                  className="flex-1 resize-none min-h-[40px]"
                  disabled={isAnswering}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                />
                <Button type="submit" disabled={!userInput.trim() || isAnswering} size="icon">
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
