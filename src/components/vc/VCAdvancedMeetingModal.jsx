// update 021026 add budget que
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { VentureMessage } from '@/api/entities.js';
import { Budget } from '@/api/entities.js';
import { FundingEvent } from '@/api/entities.js';
import { Venture } from '@/api/entities.js';
import { Button } from '@/components/ui/button';
import { Loader2, X, Send, User as UserIcon, Bot } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

const calculateBudgetScore = (budget) => {
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

  let score = 0;
  let details = {
    coreViabilityPoints: 0,
    salariesMinPoints: 0,
    salariesPercentPoints: 0,
    marketingMinPoints: 0,
    marketingPercentPoints: 0,
    operationalMinPoints: 0,
    operationalPercentPoints: 0
  };

  // Core Viability Check (20 points)
  if (totalBudget >= 730000) {
    score += 20;
    details.coreViabilityPoints = 20;
  }

  // Salaries scoring logic
  const salariesMinRatio = totalSalaries / 500000;
  if (salariesMinRatio >= 1.0) {
    details.salariesMinPoints = 17;
  } else if (salariesMinRatio >= 0.9) {
    details.salariesMinPoints = 12;
  } else if (salariesMinRatio >= 0.8) {
    details.salariesMinPoints = 8;
  }

  const salariesPercent = breakdown.salariesPercentage;
  if (salariesPercent >= 40 && salariesPercent <= 60) {
    details.salariesPercentPoints = 26;
  } else if ((salariesPercent >= 35 && salariesPercent < 40) || (salariesPercent > 60 && salariesPercent <= 65)) {
    details.salariesPercentPoints = 20;
  } else if ((salariesPercent >= 25 && salariesPercent < 35) || (salariesPercent > 65 && salariesPercent <= 75)) {
    details.salariesPercentPoints = 13;
  }

  // Marketing scoring logic
  const marketingMinRatio = totalMarketing / 150000;
  if (marketingMinRatio >= 1.0) {
    details.marketingMinPoints = 12;
  } else if (marketingMinRatio >= 0.9) {
    details.marketingMinPoints = 9;
  } else if (marketingMinRatio >= 0.8) {
    details.marketingMinPoints = 6;
  }

  const marketingPercent = breakdown.marketingPercentage;
  if (marketingPercent >= 15 && marketingPercent <= 25) {
    details.marketingPercentPoints = 20;
  } else if ((marketingPercent >= 12 && marketingPercent < 15) || (marketingPercent > 25 && marketingPercent <= 28)) {
    details.marketingPercentPoints = 15;
  } else if ((marketingPercent >= 9 && marketingPercent < 12) || (marketingPercent > 28 && marketingPercent <= 31)) {
    details.marketingPercentPoints = 10;
  }

  // Operational scoring logic
  const operationalMinRatio = totalOperational / 80000;
  if (operationalMinRatio >= 1.0) {
    details.operationalMinPoints = 2;
  } else if (operationalMinRatio >= 0.9) {
    details.operationalMinPoints = 1.5;
  } else if (operationalMinRatio >= 0.8) {
    details.operationalMinPoints = 1;
  }

  const operationalPercent = breakdown.operationalPercentage;
  if (operationalPercent >= 5 && operationalPercent <= 10) {
    details.operationalPercentPoints = 3;
  } else if ((operationalPercent >= 3 && operationalPercent < 5) || (operationalPercent > 10 && operationalPercent <= 12)) {
    details.operationalPercentPoints = 2;
  } else if ((operationalPercent >= 1 && operationalPercent < 3) || (operationalPercent > 12 && operationalPercent <= 15)) {
    details.operationalPercentPoints = 1;
  }

  const totalCategoryScore = details.salariesMinPoints + details.salariesPercentPoints + 
                           details.marketingMinPoints + details.marketingPercentPoints + 
                           details.operationalMinPoints + details.operationalPercentPoints;
  
  score += totalCategoryScore;
  const decision = score >= 70 ? 'Invest' : 'Not to Invest';

  return { score: Math.round(score), decision, breakdown, details };
};

const calculateInvestmentTerms = (ventureScreeningScore, budgetScore, totalBudget) => {
  // Investment Amount = 2-Year Budget (no multiplier needed as budget is already for 2 years)
  const investmentAmount = totalBudget;
  
  // Venture Multiplier based on screening score
  let ventureMultiplier = 1.0;
  if (ventureScreeningScore >= 9.6) ventureMultiplier = 2.0;
  else if (ventureScreeningScore >= 9.0) ventureMultiplier = 1.5;
  else if (ventureScreeningScore >= 8.0) ventureMultiplier = 1.2;
  else if (ventureScreeningScore >= 7.0) ventureMultiplier = 1.0;
  
  // Budget Multiplier based on budget score
  let budgetMultiplier = 1.0;
  if (budgetScore >= 95) budgetMultiplier = 1.3;
  else if (budgetScore >= 85) budgetMultiplier = 1.1;
  else if (budgetScore >= 75) budgetMultiplier = 1.0;
  
  // Pre-Money Valuation = $3M × Venture Multiplier × Budget Multiplier
  const baseValuation = 3000000;
  const preMoneyValuation = baseValuation * ventureMultiplier * budgetMultiplier;
  
  // Post-Money Valuation = Pre-Money + Investment
  const postMoneyValuation = preMoneyValuation + investmentAmount;
  
  // VC Equity % = Investment ÷ Post-Money × 100
  const vcEquityPercentage = (investmentAmount / postMoneyValuation) * 100;
  
  return {
    investmentAmount,
    preMoneyValuation,
    postMoneyValuation,
    vcEquityPercentage,
    ventureMultiplier,
    budgetMultiplier
  };
};

const formatCalculationBreakdown = (evaluation) => {
  const { breakdown, details, score, decision } = evaluation;
  
  return `

--- BUDGET CALCULATION BREAKDOWN ---

Total 2-Year Budget: $${breakdown.totalBudget.toLocaleString()}
- Salaries: $${breakdown.totalSalaries.toLocaleString()} (${breakdown.salariesPercentage.toFixed(1)}%)
- Marketing: $${breakdown.totalMarketing.toLocaleString()} (${breakdown.marketingPercentage.toFixed(1)}%)
- Operations: $${breakdown.totalOperational.toLocaleString()} (${breakdown.operationalPercentage.toFixed(1)}%)

SCORING BREAKDOWN:

1. Core Viability Check (20 points max):
   - Required: $730,000+ → ${details.coreViabilityPoints}/20 points

2. Salaries Category (43 points max):
   - Minimum Spend ($500,000): ${details.salariesMinPoints}/17 points
   - Percentage Range (40-60%): ${details.salariesPercentPoints}/26 points
   - Category Subtotal: ${details.salariesMinPoints + details.salariesPercentPoints}/43 points

3. Marketing Category (32 points max):
   - Minimum Spend ($150,000): ${details.marketingMinPoints}/12 points
   - Percentage Range (15-25%): ${details.marketingPercentPoints}/20 points
   - Category Subtotal: ${details.marketingMinPoints + details.marketingPercentPoints}/32 points

4. Operational Category (5 points max):
   - Minimum Spend ($80,000): ${details.operationalMinPoints}/2 points
   - Percentage Range (5-10%): ${details.operationalPercentPoints}/3 points
   - Category Subtotal: ${details.operationalMinPoints + details.operationalPercentPoints}/5 points

FINAL SCORE: ${score}/100
DECISION: ${decision}
THRESHOLD: 70+ points required for investment`;
};

const formatInvestmentProposal = (terms, ventureScreeningScore, budgetScore) => {
  return `

--- INVESTMENT PROPOSAL DETAILS ---

Venture Screening Score: ${ventureScreeningScore.toFixed(1)}/10
Budget Viability Score: ${budgetScore}/100

VALUATION CALCULATION:
Base Valuation: $3,000,000
Venture Multiplier: ${terms.ventureMultiplier}x (based on screening score)
Budget Multiplier: ${terms.budgetMultiplier}x (based on budget score)

Pre-Money Valuation: $${terms.preMoneyValuation.toLocaleString()}
Investment Amount: $${terms.investmentAmount.toLocaleString()}
Post-Money Valuation: $${terms.postMoneyValuation.toLocaleString()}

VC Equity Stake: ${terms.vcEquityPercentage.toFixed(1)}%
Founder Equity Remaining: ${(100 - terms.vcEquityPercentage).toFixed(1)}%`;
};

const evaluateFundingAsk = (answer, totalBudget) => {
  // Extract number from answer (handles $1.2M, 1200000, etc.)
  const cleanAnswer = answer.replace(/[,$]/g, '').toLowerCase();
  let fundingAsk = 0;
  
  if (cleanAnswer.includes('m')) {
    fundingAsk = parseFloat(cleanAnswer) * 1000000;
  } else if (cleanAnswer.includes('k')) {
    fundingAsk = parseFloat(cleanAnswer) * 1000;
  } else {
    fundingAsk = parseFloat(cleanAnswer);
  }
  
  if (isNaN(fundingAsk) || fundingAsk <= 0) {
    return {
      score: 0,
      feedback: "Unable to parse funding request",
      ratio: 0,
      fundingAsk: 0
    };
  }
  
  const ratio = fundingAsk / totalBudget;
  
  let score = 0;
  let feedback = "";
  
  if (ratio >= 1.8 && ratio <= 2.2) {
    score = 10;
    feedback = "Perfect alignment with budget runway needs";
  } else if (ratio >= 1.5 && ratio < 1.8) {
    score = 8;
    feedback = "Reasonable, though slightly tight on buffer";
  } else if (ratio >= 1.0 && ratio < 1.5) {
    score = 5;
    feedback = "Concerning - limited buffer for execution risks";
  } else if (ratio > 2.2 && ratio <= 3.0) {
    score = 6;
    feedback = "Ask exceeds budget justification significantly";
  } else if (ratio > 3.0) {
    score = 2;
    feedback = "Unrealistic ask relative to stated budget";
  } else {
    score = 1;
    feedback = "Insufficient funding to execute the stated plan";
  }
  
  return { score, feedback, ratio, fundingAsk };
};

const generateBudgetQuestion = (breakdown) => {
  const { salariesPercentage, marketingPercentage, operationalPercentage } = breakdown;
  
  if (salariesPercentage > 65) {
    return `Your team salaries are ${salariesPercentage.toFixed(1)}% of the budget. Can you explain why you need such a large team early on?`;
  }
  if (marketingPercentage < 12) {
    return `Your marketing budget is only ${marketingPercentage.toFixed(1)}%. How do you plan to acquire customers with such limited marketing spend?`;
  }
  if (operationalPercentage > 25) {
    return `Operational costs are ${operationalPercentage.toFixed(1)}% of your budget. Can you break down what's included here?`;
  }
  
  return "Your budget allocation looks balanced. Do you have any concerns about executing this plan?";
};

const QUESTIONS = [
  "Could you tell us how much money you would like to raise now?",
  "DYNAMIC_BUDGET_QUESTION", // Will be replaced dynamically
  "Before we make our final decision, would you like to add any more data or thoughts?"
];

export default function VCAdvancedMeetingModal({ isOpen, onClose, vcFirm, venture, messageId }) {
  const [conversation, setConversation] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isAnswering, setIsAnswering] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [userAnswers, setUserAnswers] = useState([]); // NEW: Store user answers
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
      setUserAnswers([]); // NEW: Reset answers

      const startMeeting = () => {
        setIsAnswering(true);
        setConversation([{ 
          type: 'bot', 
          text: `Nice to see you again. We have reviewed all of your venture's data, especially the funding plan. ${QUESTIONS[0]}` 
        }]);
        setIsAnswering(false);
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
    
    // Save user answer
    setUserAnswers(prev => [...prev, userAnswer]);
    
    setConversation(prev => [...prev, { type: 'user', text: userAnswer }]);

    setTimeout(async () => {
      const acks = ["I see.", "Got it.", "Understood.", "That's helpful information."];
      const randomAck = acks[Math.floor(Math.random() * acks.length)];
      setConversation(prev => [...prev, { type: 'bot', text: randomAck }]);

      const nextIndex = currentQuestionIndex + 1;
      if (nextIndex < QUESTIONS.length) {
        setTimeout(async () => {
          let nextQuestion = QUESTIONS[nextIndex];
          
          // Generate dynamic budget question if needed
          if (nextQuestion === "DYNAMIC_BUDGET_QUESTION") {
            try {
              const budgets = await Budget.filter({ venture_id: venture.id });
              if (budgets.length > 0) {
                const budget = budgets[0];
                const evaluation = calculateBudgetScore(budget);
                nextQuestion = generateBudgetQuestion(evaluation.breakdown);
              } else {
                nextQuestion = "Before we decide, any final thoughts to share?";
              }
            } catch (error) {
              console.error("Error generating dynamic question:", error);
              nextQuestion = "Before we decide, any final thoughts to share?";
            }
          }
          
          setConversation(prev => [...prev, { type: 'bot', text: nextQuestion }]);
          setCurrentQuestionIndex(nextIndex);
          setIsAnswering(false);
        }, 1500);
      } else {
        setIsFinished(true);
        setConversation(prev => [...prev, { 
          type: 'bot', 
          text: 'We want to thank you again for meeting with us. We will discuss your opportunity further in our investment board and contact you with our final decision.' 
        }]);
        
        // Process investment decision
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
            const calculationBreakdown = formatCalculationBreakdown(evaluation);

            if (messageId) {
              await VentureMessage.update(messageId, { is_dismissed: true });
            }
            
            const urlParams = new URLSearchParams(window.location.search);
            const testScore = urlParams.get('testScore');

            const ventureScreeningScore = venture.venture_screening_score || 7.0;
            const budgetScore = testScore ? parseFloat(testScore) : evaluation.score;
            
            // Evaluate funding ask from first answer
            const fundingAskEval = evaluateFundingAsk(userAnswers[0] || "0", evaluation.breakdown.totalBudget);
            
            const terms = calculateInvestmentTerms(ventureScreeningScore, budgetScore, evaluation.breakdown.totalBudget);
            
            // Investment decision with all 3 criteria
            const shouldInvest = (
              budgetScore >= 75 &&
              ventureScreeningScore >= 7.0 &&
              fundingAskEval.score >= 6.0
            );
            
            // Console logging for debugging
            console.group('💼 VC INVESTMENT DECISION ANALYSIS');
            
            console.log('📊 BUDGET EVALUATION:');
            console.log('  Total 2-Year Budget:', `$${evaluation.breakdown.totalBudget.toLocaleString()}`);
            console.log('  Budget Score:', `${budgetScore}/100`);
            console.log('  Breakdown:', {
              salaries: `${evaluation.breakdown.salariesPercentage.toFixed(1)}%`,
              marketing: `${evaluation.breakdown.marketingPercentage.toFixed(1)}%`,
              operational: `${evaluation.breakdown.operationalPercentage.toFixed(1)}%`
            });
            
            console.log('\n🎯 VENTURE SCREENING:');
            console.log('  Venture Score:', `${ventureScreeningScore}/10`);
            
            console.log('\n💰 FUNDING ASK EVALUATION:');
            console.log('  Requested Amount:', `$${fundingAskEval.fundingAsk.toLocaleString()}`);
            console.log('  Budget Ratio:', `${fundingAskEval.ratio.toFixed(2)}x`);
            console.log('  Funding Ask Score:', `${fundingAskEval.score}/10`);
            console.log('  Assessment:', fundingAskEval.feedback);
            
            console.log('\n✅ DECISION CRITERIA:');
            console.log('  Budget Score >= 75?', budgetScore >= 75 ? '✅' : '❌', `(${budgetScore})`);
            console.log('  Venture Score >= 7.0?', ventureScreeningScore >= 7.0 ? '✅' : '❌', `(${ventureScreeningScore})`);
            console.log('  Funding Ask Score >= 6.0?', fundingAskEval.score >= 6.0 ? '✅' : '❌', `(${fundingAskEval.score})`);
            
            console.log('\n🎲 FINAL DECISION:', shouldInvest ? '✅ APPROVED' : '❌ REJECTED');
            
            if (shouldInvest) {
              console.log('\n💎 INVESTMENT TERMS:');
              console.log('  Investment Amount:', `$${terms.investmentAmount.toLocaleString()}`);
              console.log('  Pre-Money Valuation:', `$${terms.preMoneyValuation.toLocaleString()}`);
              console.log('  Post-Money Valuation:', `$${terms.postMoneyValuation.toLocaleString()}`);
              console.log('  VC Equity:', `${terms.vcEquityPercentage.toFixed(2)}%`);
              console.log('  Venture Multiplier:', `${terms.ventureMultiplier}x`);
              console.log('  Budget Multiplier:', `${terms.budgetMultiplier}x`);
            }
            
            console.groupEnd();
            
            const proposalDetails = formatInvestmentProposal(terms, ventureScreeningScore, budgetScore);

            if (shouldInvest) { // Investment approved
              await VentureMessage.create({
                venture_id: venture.id,
                message_type: 'investment_offer',
                title: `💰 Investment Proposal from ${vcFirm.name}`,
                content: `We are pleased to present our investment proposal for ${venture.name}.${proposalDetails}${calculationBreakdown}\n\nPlease review the terms above and let us know your decision.`,
                phase: venture.phase,
                priority: 4,
                vc_firm_id: vcFirm.id,
                vc_firm_name: vcFirm.name,
                vc_stage: 'investment_proposal',
                investment_offer_checksize: terms.investmentAmount,
                investment_offer_valuation: terms.postMoneyValuation,
                investment_offer_status: 'pending'
              });
            } else { // Investment rejected
              await VentureMessage.create({
                venture_id: venture.id,
                message_type: 'system',
                title: `Investment Decision from ${vcFirm.name}`,
                content: `After careful review, we have decided not to proceed with investment in your venture at this time.${calculationBreakdown}`,
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
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-white"/>
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
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-green-600" />
              <p className="text-green-800 font-medium">Processing investment decision...</p>
              <p className="text-green-600 text-sm mt-1">You'll receive the final decision on your dashboard shortly.</p>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {!isFinished && (
          <div className="p-4 border-t bg-gray-50">
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
          </div>
        )}
      </div>
    </div>
  );
}
