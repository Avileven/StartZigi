// PITCH MODAL - AI SCORE MODEL v2.0
"use client";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Investor, MasterQuestion, PitchAnswer, Venture, VentureMessage, businessPlan } from '@/api/entities.js';
import { InvokeLLM } from '@/api/integrations';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send, User, Bot } from 'lucide-react';

const COMPETITOR_QUESTIONS_BANK = [
  {
    question_id: 'COMPETITOR_CHALLENGE_1',
    question_text: "Look, I invest in a lot of companies and I see this pattern repeatedly - entrepreneurs come in thinking they have a unique idea, but there are always competitors they don't know about. Sometimes it's an established player expanding into their space, sometimes it's another startup pivoting, sometimes it's a big tech company building this internally. How confident are you that you really understand who you're up against? And more importantly - what happens to your business when you discover there's more competition than you thought?"
  },
  {
    question_id: 'COMPETITOR_CHALLENGE_2',
    question_text: "I've seen many startups blindsided by competitors they never saw coming - a well-funded startup in stealth mode, an enterprise player moving downmarket, or even a free open-source alternative. Walk me through your competitive analysis. Who are you really competing against for customers' attention and budget? And what's your honest assessment of your advantages versus theirs?"
  },
  {
    question_id: 'COMPETITOR_CHALLENGE_3',
    question_text: "Here's what worries me: most founders can name their direct competitors, but they miss the indirect ones - the incumbent solutions, the 'good enough' alternatives, or even customers just choosing to do nothing. Beyond the obvious players, what are the real alternatives your customers are considering? And why would they pick you over just sticking with what they have?"
  },
  {
    question_id: 'COMPETITOR_CHALLENGE_4',
    question_text: "Let's talk about competitive moats. I've funded companies that had great products but no defensibility - competitors copied them in months. What's stopping a bigger, better-funded company from replicating what you're doing? And please don't say 'execution' or 'first-mover advantage' - I need something more concrete than that."
  },
  {
    question_id: 'COMPETITOR_CHALLENGE_5',
    question_text: "Every market has a 500-pound gorilla - whether it's an incumbent, a well-funded competitor, or a tech giant. In your space, who's that player? What's their strategy, and how are you positioning yourself to win despite their advantages in resources, brand, and market presence? I want to understand if you're being realistic or overly optimistic about competing with them."
  }
];

const SOLUTION_EVALUATION_PROMPT = `You are evaluating an entrepreneur's response to a solution/technical challenge question. Use this detailed scoring framework:

SCORING DIMENSIONS (1-10 each):

TECHNICAL DEPTH (40% weight):
• 1-3: Vague, no real technical understanding
• 4-6: Surface-level technical knowledge
• 7-10: Deep technical insight, specific technologies, realistic constraints

FEASIBILITY (30% weight):
• 1-3: Unrealistic, ignores major challenges
• 4-6: Somewhat realistic but hand-waves difficulties
• 7-10: Honest about challenges, concrete mitigation plans

CLARITY (30% weight):
• 1-3: Confusing, scattered, doesn't answer the question
• 4-6: Partially clear, some relevant points
• 7-10: Crystal clear, well-structured, directly addresses the question

CALCULATION: solution_score = (technical_depth × 0.4) + (feasibility × 0.3) + (clarity × 0.3)

Please evaluate the response and provide EXACTLY this format:

SOLUTION EVALUATION:
Technical Depth: [score]/10 - [brief rationale]
Feasibility: [score]/10 - [brief rationale]
Clarity: [score]/10 - [brief rationale]
Final Score: [calculated score]/10

INVESTOR FEEDBACK: [2-3 sentences of feedback based on score]`;

const COMPETITOR_EVALUATION_PROMPT = `You are evaluating an entrepreneur's response to a competitor challenge question. Use this detailed scoring framework:

SCORING DIMENSIONS (1-10 each):

SPECIFICITY (30% weight):
• 1-3: Vague generalizations ("we're different", "better quality")
• 4-6: Some specifics but mostly general claims  
• 7-10: Concrete details, numbers, examples, specific use cases

CREDIBILITY (40% weight):
• 1-3: Obviously fabricating, contradicts original pitch, unrealistic claims
• 4-6: Plausible but unverifiable claims, some hedge words
• 7-10: Honest admissions, verifiable claims, or realistic differentiation

STRATEGIC THINKING (30% weight):
• 1-3: No clear strategy, scattered thoughts, missing the point
• 4-6: Basic understanding, surface-level differences
• 7-10: Deep strategic insight, clear competitive positioning, market awareness

CALCULATION: competitor_score = (specificity × 0.3) + (credibility × 0.4) + (strategic_thinking × 0.3)

Please evaluate the response and provide EXACTLY this format:

COMPETITOR CHALLENGE EVALUATION:
Specificity: [score]/10 - [brief rationale]
Credibility: [score]/10 - [brief rationale] 
Strategic Thinking: [score]/10 - [brief rationale]
Final Score: [calculated score]/10

INVESTOR FEEDBACK: [2-3 sentences of feedback based on score]`;

const calculateTeamScore = (venture) => {
    const founderPoints = (venture.founders_count || 1) >= 2 ? 100 : 70;
    let commitmentPoints = 30;
    if (venture.weekly_commitment === 'medium') commitmentPoints = 50;
    if (venture.weekly_commitment === 'high') commitmentPoints = 100;
    return (founderPoints * 0.60) + (commitmentPoints * 0.40);
};

const getInvestorMessage = (aiScore) => {
  if (aiScore >= 6.5) {
    return {
      tier: 'IMPRESSED',
      message: "I'm genuinely impressed with both your venture and your team. You've demonstrated a clear understanding of the competitive landscape, strong strategic thinking about your solution, and realistic plans for execution. I'm confident in your ability to succeed and I'm pleased to offer an investment of"
    };
  }
  if (aiScore >= 4.0) {
    return {
      tier: 'BELIEVE',
      message: "While I didn't get all the information I was hoping for in our conversation, I still believe in you and see the potential in what you're building. Your passion is evident and I think with some additional strategic work, you can make this successful. There's work to be done, but I think you have what it takes. I'm offering"
    };
  }
  if (aiScore >= 2.5) {
    return {
      tier: 'RISKY',
      message: "I can see you still have significant work ahead on this venture. Your competitive analysis needs more depth, the technical execution plan requires further development, and your go-to-market strategy needs refinement. However, I see a spark of something interesting and I'm willing to take the risk and make a smaller investment to help you get started and prove the concept. My offer is"
    };
  }
  return {
    tier: 'REJECT',
    message: "Thank you for your time and for sharing your vision with me. Unfortunately, after careful consideration of our conversation, I've decided to pass on this opportunity at this time. I encourage you to continue refining your strategy and business plan. I wish you the best of luck with your venture."
  };
};

const calculateInvestmentOffer = (investor, venture, effectiveTeamScore, aiScore) => {
    if (aiScore < 2.5) {
        return {
            decision: 'Reject',
            reason: getInvestorMessage(aiScore).message,
            aiScore,
            effectiveTeamScore,
            threshold: 2.5
        };
    }
    if (investor.investor_type === 'no_go') {
        return { 
            decision: 'Reject', 
            reason: 'Thank you for your time, but we have decided not to move forward as we are currently only advising our existing portfolio companies.',
            aiScore,
            effectiveTeamScore
        };
    }
    if (investor.investor_type === 'team_focused' && (venture.founders_count || 1) < 2) {
        return { 
            decision: 'Reject', 
            reason: 'We have a strong focus on ventures with multiple co-founders and have decided to pass at this time.',
            aiScore,
            effectiveTeamScore
        };
    }

    let finalCheckSize;
    let finalValuation;
    const effectiveTeamScoreMultiplier = effectiveTeamScore / 100;

    if (investor.investor_type === 'flexible') {
        const isFocusSector = investor.focus_sectors?.some(sector => 
            venture.sector === sector || 
            (sector === 'food_and_beverage' && venture.sector === 'consumer_apps') ||
            (sector === 'sustainable_fashion' && venture.sector === 'climatetech_energy')
        );
        const checkMultiplier = isFocusSector ? 1.0 : 0.5;
        const valuationMultiplier = isFocusSector ? 1.0 : 0.4;
        finalCheckSize = Math.round((50000 + (150000 * effectiveTeamScoreMultiplier * checkMultiplier)) / 1000) * 1000;
        finalValuation = Math.round((1000000 + (2000000 * effectiveTeamScoreMultiplier * valuationMultiplier)) / 100000) * 100000;
        const investorMsg = getInvestorMessage(aiScore);
        return {
            decision: 'Invest',
            checkSize: finalCheckSize,
            valuation: finalValuation,
            reason: `${investorMsg.message} $${finalCheckSize.toLocaleString()} at a pre-money valuation of $${finalValuation.toLocaleString()}.`,
            tier: investorMsg.tier,
            aiScore,
            effectiveTeamScore,
            isFocusSector,
            calculationDetails: {
              investorType: investor.investor_type,
              isFocusSector,
              checkMultiplier,
              valuationMultiplier,
              baseCheckRange: [50000, 200000],
              baseValuationRange: [1000000, 3000000]
            }
        };
    }
    if (investor.investor_type === 'team_focused') {
         finalCheckSize = Math.round((60000 + (130000 * effectiveTeamScoreMultiplier)) / 1000) * 1000;
         finalValuation = Math.round((1000000 + (3000000 * effectiveTeamScoreMultiplier)) / 100000) * 100000;
         const investorMsg = getInvestorMessage(aiScore);
         return {
            decision: 'Invest',
            checkSize: finalCheckSize,
            valuation: finalValuation,
            reason: `${investorMsg.message} $${finalCheckSize.toLocaleString()} at a pre-money valuation of $${finalValuation.toLocaleString()}.`,
            tier: investorMsg.tier,
            aiScore,
            effectiveTeamScore,
            calculationDetails: {
              investorType: investor.investor_type,
              isFocusSector: true,
              checkMultiplier: 1.0,
              valuationMultiplier: 1.0,
              baseCheckRange: [60000, 190000],
              baseValuationRange: [1000000, 4000000]
            }
         };
    }
    return { 
        decision: 'Reject', 
        reason: 'After careful consideration, we have decided not to proceed at this time. We wish you the best of luck.',
        aiScore,
        effectiveTeamScore
    };
};

export default function PitchModal({ investor, venture, isOpen, onClose }) {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [conversation, setConversation] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAnswering, setIsAnswering] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [localInvestor, setLocalInvestor] = useState(investor);
  const chatEndRef = useRef(null);
  const answersRef = useRef([]);
  const isInitialLoadDone = useRef(false);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  const loadQuestions = useCallback(async () => {
    if (!localInvestor?.assigned_question_ids || isInitialLoadDone.current) return;
    isInitialLoadDone.current = true;
    setIsLoading(true);
    try {
      const businessPlans = await businessPlan.filter({ venture_id: venture.id });
      const plan = businessPlans[0];
      const ids = localInvestor.assigned_question_ids;
      const fetchPromises = ids.map(id => MasterQuestion.filter({ 'question_id': id }));
      const results = await Promise.all(fetchPromises);
      const fetchedQuestions = results.flat().filter(Boolean);
      const dbQuestions = ids.map(id => fetchedQuestions.find(q => q.question_id === id)).filter(Boolean);
      const openingQuestion = {
        question_id: 'OPENING_PERSONAL',
        question_text: `Nice to meet you. Before we dive into the business details, I'm curious about the person behind the idea. How did you personally come up with this concept, and what made you choose the name '${venture.name}' for your project? I'd love to hear the story behind it.`
      };
      const solutionQuestion = {
        question_id: 'SOLUTION_DEPTH',
        question_text: plan?.solution 
          ? `Regarding your solution: ${plan.solution.substring(0, 200)}... What is the biggest technical challenge you anticipate in building this specifically, and how will you overcome it?`
          : `What is the biggest technical challenge you anticipate in building your solution, and how will you overcome it?`
      };
      const scalabilityQuestion = {
        question_id: 'SCALABILITY_TARGETING',
        question_text: plan?.target_customers
          ? `You specified your target customers as ${plan.target_customers.substring(0, 150)}... How do you plan to scale your acquisition of these specific users during the first 12 months?`
          : `How do you plan to scale your customer acquisition during the first 12 months?`
      };
      const randomCompetitorQuestion = COMPETITOR_QUESTIONS_BANK[Math.floor(Math.random() * COMPETITOR_QUESTIONS_BANK.length)];
      const finalQuestions = [openingQuestion, solutionQuestion, scalabilityQuestion, dbQuestions[0], randomCompetitorQuestion, dbQuestions[1]].filter(Boolean);
      setQuestions(finalQuestions);
      setConversation([{ type: 'bot', text: `Hi, I'm ${localInvestor.name}. I've gone over your business plan and have a few questions for you.` }]);
      setTimeout(() => {
        setConversation(prev => [...prev, { type: 'bot', text: finalQuestions[0].question_text }]);
      }, 1500);
    } catch (error) {
      console.error("Error loading questions:", error);
      isInitialLoadDone.current = false;
    } finally {
      setIsLoading(false);
    }
  }, [localInvestor, venture.id, venture.name]);

  useEffect(() => {
    if (isOpen) {
      isInitialLoadDone.current = false;
      setQuestions([]);
      setCurrentQuestionIndex(0);
      setConversation([]);
      setIsFinished(false);
      answersRef.current = [];
      if (localInvestor) loadQuestions();
    }
  }, [isOpen, loadQuestions, localInvestor]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!userInput.trim() || isAnswering) return;
    setIsAnswering(true);
    const userAnswer = userInput;
    setUserInput('');
    setConversation(prev => [...prev, { type: 'user', text: userAnswer }]);
    const currentQuestion = questions[currentQuestionIndex];
    answersRef.current.push({ question_id: currentQuestion.question_id, answer_text: userAnswer });
    if (!currentQuestion.question_id?.startsWith('COMPETITOR_CHALLENGE') && 
        currentQuestion.question_id !== 'OPENING_PERSONAL' &&
        currentQuestion.question_id !== 'SOLUTION_DEPTH' &&
        currentQuestion.question_id !== 'SCALABILITY_TARGETING') {
        try {
          await PitchAnswer.create({
            venture_id: venture.id,
            investor_id: localInvestor.id,
            question_id: currentQuestion.question_id,
            answer_text: userAnswer,
            created_by: venture.created_by || 'system'
          });
        } catch(err) {
          console.error("Failed to save answer", err);
        }
    }
    setTimeout(() => {
      const ack = ["I see.", "That's an interesting point.", "Got it.", "Makes sense.", "Thank you for that insight."];
      const randomAck = ack[Math.floor(Math.random() * ack.length)];
      const nextIndex = currentQuestionIndex + 1;
      if (nextIndex < questions.length) {
        setConversation(prev => [...prev, { type: 'bot', text: randomAck }, { type: 'bot', text: questions[nextIndex].question_text }]);
        setCurrentQuestionIndex(nextIndex);
        setIsAnswering(false);
      } else {
        setConversation(prev => [...prev, { type: 'bot', text: "Thank you for your time and for answering my questions. I will consider everything we discussed and let you know shortly about our decision." }]);
        setIsFinished(true);
        setTimeout(async () => { await evaluateAndMakeDecision(); }, 3000);
      }
    }, 1000);
  };

  const evaluateAndMakeDecision = async () => {
    try {
      let competitorScore = 0;
      let solutionScore = 0;
      let competitorEvaluationText = "Not evaluated.";
      let solutionEvaluationText = "Not evaluated.";
      let competitorDimensions = { specificity: 0, credibility: 0, strategicThinking: 0 };
      let solutionDimensions = { technicalDepth: 0, feasibility: 0, clarity: 0 };
      const competitorAnswer = answersRef.current.find(a => a.question_id?.startsWith('COMPETITOR_CHALLENGE'));
      const solutionAnswer = answersRef.current.find(a => a.question_id === 'SOLUTION_DEPTH');
      if (competitorAnswer?.answer_text?.trim()) {
        try {
          const evaluationPrompt = `${COMPETITOR_EVALUATION_PROMPT}\n\nVENTURE CONTEXT:\nName: ${venture.name}\nDescription: ${venture.description}\nProblem: ${venture.problem}\nSolution: ${venture.solution}\n\nENTREPRENEUR'S RESPONSE:\n"${competitorAnswer.answer_text}"`;
          const { response: competitorResponse } = await InvokeLLM({ prompt: evaluationPrompt });
          competitorEvaluationText = competitorResponse;
          const specificityMatch = competitorResponse.match(/Specificity:\s*(\d+(?:\.\d+)?)/i);
          const credibilityMatch = competitorResponse.match(/Credibility:\s*(\d+(?:\.\d+)?)/i);
          const strategicMatch = competitorResponse.match(/Strategic Thinking:\s*(\d+(?:\.\d+)?)/i);
          const finalScoreMatch = competitorResponse.match(/Final Score:\s*(\d+(?:\.\d+)?)/i);
          if (specificityMatch) competitorDimensions.specificity = parseFloat(specificityMatch[1]);
          if (credibilityMatch) competitorDimensions.credibility = parseFloat(credibilityMatch[1]);
          if (strategicMatch) competitorDimensions.strategicThinking = parseFloat(strategicMatch[1]);
          if (finalScoreMatch) {
            competitorScore = parseFloat(finalScoreMatch[1]);
          } else {
            competitorScore = (competitorDimensions.specificity * 0.3) + (competitorDimensions.credibility * 0.4) + (competitorDimensions.strategicThinking * 0.3);
          }
        } catch (error) {
          console.error("Error evaluating competitor:", error);
          competitorScore = 0;
          competitorEvaluationText = `Error: ${error.message}`;
        }
      }
      if (solutionAnswer?.answer_text?.trim()) {
        try {
          const evaluationPrompt = `${SOLUTION_EVALUATION_PROMPT}\n\nVENTURE CONTEXT:\nName: ${venture.name}\nSolution: ${venture.solution}\n\nENTREPRENEUR'S RESPONSE:\n"${solutionAnswer.answer_text}"`;
          const { response: solutionResponse } = await InvokeLLM({ prompt: evaluationPrompt });
          solutionEvaluationText = solutionResponse;
          const technicalMatch = solutionResponse.match(/Technical Depth:\s*(\d+(?:\.\d+)?)/i);
          const feasibilityMatch = solutionResponse.match(/Feasibility:\s*(\d+(?:\.\d+)?)/i);
          const clarityMatch = solutionResponse.match(/Clarity:\s*(\d+(?:\.\d+)?)/i);
          const finalScoreMatch = solutionResponse.match(/Final Score:\s*(\d+(?:\.\d+)?)/i);
          if (technicalMatch) solutionDimensions.technicalDepth = parseFloat(technicalMatch[1]);
          if (feasibilityMatch) solutionDimensions.feasibility = parseFloat(feasibilityMatch[1]);
          if (clarityMatch) solutionDimensions.clarity = parseFloat(clarityMatch[1]);
          if (finalScoreMatch) {
            solutionScore = parseFloat(finalScoreMatch[1]);
          } else {
            solutionScore = (solutionDimensions.technicalDepth * 0.4) + (solutionDimensions.feasibility * 0.3) + (solutionDimensions.clarity * 0.3);
          }
        } catch (error) {
          console.error("Error evaluating solution:", error);
          solutionScore = 0;
          solutionEvaluationText = `Error: ${error.message}`;
        }
      }
      const aiScore = (competitorScore * 0.6) + (solutionScore * 0.4);
      const baseTeamScore = calculateTeamScore(venture);
      const effectiveTeamScore = (baseTeamScore * 0.3) + (aiScore * 10 * 0.7);
      await Venture.update(venture.id, { team_score: effectiveTeamScore });
      const proposal = calculateInvestmentOffer(localInvestor, venture, effectiveTeamScore, aiScore);
      const calculationBreakdown = `
---
**DECISION CALCULATION BREAKDOWN**

**Team Evaluation:**
• Base Team Score: ${baseTeamScore.toFixed(1)}/100 
  - Founders: ${venture.founders_count || 1} (${(venture.founders_count || 1) >= 2 ? '100 points' : '70 points'})
  - Weekly Commitment: ${venture.weekly_commitment || 'low'} (${venture.weekly_commitment === 'high' ? '100' : venture.weekly_commitment === 'medium' ? '50' : '30'} points)
  
**AI Performance Analysis:**

• Competitor Challenge Score: ${competitorScore.toFixed(1)}/10
${competitorAnswer?.answer_text?.trim() ? `  - Specificity: ${competitorDimensions.specificity.toFixed(1)}/10
  - Credibility: ${competitorDimensions.credibility.toFixed(1)}/10
  - Strategic Thinking: ${competitorDimensions.strategicThinking.toFixed(1)}/10
  
${competitorEvaluationText}` : '  - Not answered'}

• Solution Depth Score: ${solutionScore.toFixed(1)}/10
${solutionAnswer?.answer_text?.trim() ? `  - Technical Depth: ${solutionDimensions.technicalDepth.toFixed(1)}/10
  - Feasibility: ${solutionDimensions.feasibility.toFixed(1)}/10
  - Clarity: ${solutionDimensions.clarity.toFixed(1)}/10
  
${solutionEvaluationText}` : '  - Not answered'}

• **AI Score: ${aiScore.toFixed(1)}/10**
  Formula: (Competitor × 0.6) + (Solution × 0.4)
  Calculation: (${competitorScore.toFixed(1)} × 0.6) + (${solutionScore.toFixed(1)} × 0.4) = ${aiScore.toFixed(1)}

**Final Effective Team Score:**
• Formula: (Base Team Score × 0.3) + (AI Score × 10 × 0.7)
• Calculation: (${baseTeamScore.toFixed(1)} × 0.3) + (${aiScore.toFixed(1)} × 10 × 0.7) = ${effectiveTeamScore.toFixed(1)}/100

**Investment Decision Logic:**
• AI Score Threshold: 2.5/10 (${aiScore >= 2.5 ? 'PASSED ✓' : 'FAILED ✗'})
• Investor Type: ${localInvestor.investor_type}
• Decision: ${proposal.decision}

${proposal.decision === 'Invest' ? `
**Investment Terms Calculation:**
• Investment Range: $${proposal.calculationDetails?.baseCheckRange?.[0]?.toLocaleString() || 'N/A'} - $${proposal.calculationDetails?.baseCheckRange?.[1]?.toLocaleString() || 'N/A'}
• Valuation Range: $${proposal.calculationDetails?.baseValuationRange?.[0]?.toLocaleString() || 'N/A'} - $${proposal.calculationDetails?.baseValuationRange?.[1]?.toLocaleString() || 'N/A'}
• Effective Team Score Multiplier: ${(effectiveTeamScore / 100).toFixed(2)}
• Sector Alignment: ${proposal.isFocusSector ? 'Yes' : 'No'} (${proposal.isFocusSector ? '1.0x' : '0.5x'} multiplier)
• Message Tier: ${proposal.tier}

**Final Offer:**
• Investment Amount: $${proposal.checkSize?.toLocaleString()}
• Pre-Money Valuation: $${proposal.valuation?.toLocaleString()}
• Equity: ${((proposal.checkSize / proposal.valuation) * 100).toFixed(2)}%
` : ''}
---`;
      if (proposal.decision === 'Invest') {
        await VentureMessage.create({
          venture_id: venture.id,
          message_type: 'investment_offer',
          title: `💰 Investment Offer from ${localInvestor.name}!`,
          content: `Great news! ${localInvestor.name} has decided to invest.\n\n"${proposal.reason}"\n${calculationBreakdown}`,
          phase: venture.phase,
          priority: 4,
          investment_offer_checksize: proposal.checkSize,
          investment_offer_valuation: proposal.valuation,
          investment_offer_status: 'pending',
          is_dismissed: false,
          created_by: venture.created_by || 'system',
          created_by_id: venture.created_by_id
        });
      } else {
        await VentureMessage.create({
          venture_id: venture.id,
          message_type: 'system',
          title: `📋 Response from ${localInvestor.name}`,
          content: `${localInvestor.name} has decided not to invest at this time.\n\n"${proposal.reason}"\n${calculationBreakdown}`,
          phase: venture.phase,
          priority: 2,
          is_dismissed: false,
          created_by: venture.created_by || 'system',
          created_by_id: venture.created_by_id
        });
      }
      setTimeout(() => { onClose(); }, 2000);
    } catch (error) {
      console.error("Error in evaluation:", error);
      await VentureMessage.create({
          venture_id: venture.id,
          message_type: 'system',
          title: `📋 Response from ${localInvestor.name}`,
          content: `There was an issue processing the meeting results. Error: ${error.message}. Please try again later.`,
          phase: venture.phase,
          priority: 2,
          is_dismissed: false,
          created_by: venture.created_by || 'system',
          created_by_id: venture.created_by_id
      });
      setTimeout(() => { onClose(); }, 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl h-[80vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">Meeting with {localInvestor.name}</h2>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isAnswering && !isFinished}>Close</Button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
          ) : (
            conversation.map((msg, idx) => (
              <div key={idx} className={`flex items-end gap-2 ${msg.type === 'user' ? 'justify-end' : ''}`}>
                {msg.type === 'bot' && (
                  localInvestor.avatar_url ? (
                    <img src={localInvestor.avatar_url} alt={localInvestor.name} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-5 h-5 text-white"/>
                    </div>
                  )
                )}
                <div className={`max-w-md p-3 rounded-lg ${msg.type === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}>
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
                {msg.type === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-white"/>
                  </div>
                )}
              </div>
            ))
          )}
          {isFinished && (
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-green-600" />
              <p className="text-green-800 font-medium">Processing your meeting results...</p>
              <p className="text-green-600 text-sm mt-1">You'll receive the decision on your dashboard shortly.</p>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
        {!isFinished && !isLoading && (
          <div className="p-4 border-t">
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <Textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Type your answer..."
                className="flex-1 resize-none min-h-[60px]"
                disabled={isAnswering}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
              />
              <Button type="submit" disabled={!userInput.trim() || isAnswering}>
                {isAnswering ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}