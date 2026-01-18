// 16126 FIX MULTIQUES WORKING + BUSINESS QUESTION FINAL
"use client";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Investor, MasterQuestion, PitchAnswer, Venture, VentureMessage, BusinessPlan } from '@/api/entities.js';
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

CALCULATION: final_score = (specificity * 0.3) + (credibility * 0.4) + (strategic_thinking * 0.3)

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

const calculateInvestmentOffer = (investor, venture, effectiveTeamScore, competitorScore) => {
    if (competitorScore < 4.0) {
        return {
            decision: 'Reject',
            reason: `The response to the competitor challenge did not meet our investment threshold (Score: ${competitorScore.toFixed(1)}/10). A deeper understanding of the competitive landscape is required.`,
            competitorScore,
            effectiveTeamScore,
            threshold: 4.0
        };
    }

    if (investor.investor_type === 'no_go') {
        return { 
            decision: 'Reject', 
            reason: 'Thank you for your time, but we have decided not to move forward as we are currently only advising our existing portfolio companies.',
            competitorScore,
            effectiveTeamScore
        };
    }

    if (investor.investor_type === 'team_focused' && (venture.founders_count || 1) < 2) {
        return { 
            decision: 'Reject', 
            reason: 'We have a strong focus on ventures with multiple co-founders and have decided to pass at this time.',
            competitorScore,
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
        
        finalCheckSize = Math.round((50000 + (150000 - 50000) * effectiveTeamScoreMultiplier * checkMultiplier) / 1000) * 1000;
        finalValuation = Math.round((1000000 + (2500000 - 1000000) * effectiveTeamScoreMultiplier * valuationMultiplier) / 100000) * 100000;

        return {
            decision: 'Invest',
            checkSize: finalCheckSize,
            valuation: finalValuation,
            reason: `We are pleased to offer an investment. ${!isFocusSector ? 'While your venture is outside our primary focus areas, we see potential and have adjusted our offer accordingly.' : 'Your venture aligns well with our investment thesis.'}`,
            competitorScore,
            effectiveTeamScore,
            isFocusSector,
            checkMultiplier,
            valuationMultiplier,
            calculationDetails: {
              investorType: investor.investor_type,
              isFocusSector,
              checkMultiplier,
              valuationMultiplier,
              baseCheckRange: [50000, 150000],
              baseValuationRange: [1000000, 2500000]
            }
        };
    }

    if (investor.investor_type === 'team_focused') {
         finalCheckSize = Math.round((60000 + (130000 - 60000) * effectiveTeamScoreMultiplier) / 1000) * 1000;
         finalValuation = Math.round((1000000 + (4000000 - 1000000) * effectiveTeamScoreMultiplier) / 100000) * 100000;
         return {
            decision: 'Invest',
            checkSize: finalCheckSize,
            valuation: finalValuation,
            reason: 'Your team shows great promise, and we believe you have the right foundation to succeed. We would be delighted to invest.',
            competitorScore,
            effectiveTeamScore,
            calculationDetails: {
              investorType: investor.investor_type,
              isFocusSector: true,
              checkMultiplier: 1.0,
              valuationMultiplier: 1.0,
              baseCheckRange: [60000, 130000],
              baseValuationRange: [1000000, 4000000]
            }
         };
    }
    
    return { 
        decision: 'Reject', 
        reason: 'After careful consideration, we have decided not to proceed at this time. We wish you the best of luck.',
        competitorScore,
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
  const timePressureTimeoutsRef = useRef([]);
  const isInitialLoadDone = useRef(false);
  const competitorQuestionIndexRef = useRef(-1);

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
      // טעינת business plan מה-DB
      const businessPlans = await BusinessPlan.filter({ venture_id: venture.id });
      const businessPlan = businessPlans[0];
      
      console.log("Business plan data:", businessPlan);

      const ids = localInvestor.assigned_question_ids;
      const fetchPromises = ids.map(id => MasterQuestion.filter({ 'question_id': id }));
      const results = await Promise.all(fetchPromises);
      const fetchedQuestions = results.flat().filter(Boolean);
     
      const baseQuestions = ids
        .map(id => fetchedQuestions.find(q => q.question_id === id))
        .filter(Boolean);
     
      // שאלת פתיחה
      const openingQuestion = {
        question_id: 'OPENING_PERSONAL',
        question_text: `Nice to meet you. Before we dive into the business details, I'm curious about the person behind the idea. How did you personally come up with this concept, and what made you choose the name '${venture.name}' for your project? I'd love to hear the story behind it.`
      };
      
      // שאלה עסקית עם נתונים מה-business plan
      const businessQuestion = {
        question_id: 'BUSINESS_DEEP_DIVE',
        question_text: `I've reviewed your business plan for ${venture.name}${businessPlan?.mission ? `, and I'm intrigued by your mission to ${businessPlan.mission.substring(0, 150)}...` : ''}. However, I want to dig deeper into the economics. ${businessPlan?.revenue_model ? `You mentioned your revenue model - ${businessPlan.revenue_model.substring(0, 100)}... ` : ''}Can you walk me through the unit economics? Specifically, what's your customer acquisition cost, expected lifetime value${businessPlan?.funding_requirements ? `, and how did you arrive at your ${businessPlan.funding_requirements.split('.')[0]} funding ask` : ''}? I need to understand if the math really works here.`
      };
     
      // בחירת שאלת competitor אקראית
      const randomCompetitorQuestion = COMPETITOR_QUESTIONS_BANK[
        Math.floor(Math.random() * COMPETITOR_QUESTIONS_BANK.length)
      ];
     
      // הזרקת competitor למיקום אקראי
      const insertPosition = Math.floor(Math.random() * (baseQuestions.length + 1));
      const questionsWithCompetitor = [
        ...baseQuestions.slice(0, insertPosition),
        randomCompetitorQuestion,
        ...baseQuestions.slice(insertPosition)
      ];
      
      // סידור סופי: פתיחה → עסקית → שאלות רגילות+competitor
      const finalQuestions = [openingQuestion, businessQuestion, ...questionsWithCompetitor];
      
      // עדכון index של competitor (+2 כי יש 2 שאלות קבועות לפני)
      competitorQuestionIndexRef.current = insertPosition + 2;
     
      setQuestions(finalQuestions);
     
      setConversation([{
        type: 'bot',
        text: `Hi, I'm ${localInvestor.name}. I've gone over your business plan and have a few questions for you.`
      }]);
     
      setTimeout(() => {
        setConversation(prev => [
          ...prev,
          { type: 'bot', text: finalQuestions[0].question_text }
        ]);
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
      competitorQuestionIndexRef.current = -1;
     
      if (localInvestor) loadQuestions();
    }
  }, [isOpen, loadQuestions, localInvestor]);

  const startTimePressureMessages = useCallback(() => {
    timePressureTimeoutsRef.current.forEach(timeoutId => clearTimeout(timeoutId));
    timePressureTimeoutsRef.current = [];

    const timeout1 = setTimeout(() => {
      setConversation(prev => [...prev, { type: 'bot', text: "Take your time, but I need a concise answer." }]);
    }, 30000);
    
    const timeout2 = setTimeout(() => {
      setConversation(prev => [...prev, { type: 'bot', text: "I have another meeting in 10 minutes..." }]);
    }, 60000);
    
    const timeout3 = setTimeout(() => {
      setConversation(prev => [...prev, { type: 'bot', text: "How are you thinking about this?" }]);
    }, 180000);

    timePressureTimeoutsRef.current = [timeout1, timeout2, timeout3];
  }, []);

  useEffect(() => {
    if (currentQuestionIndex === competitorQuestionIndexRef.current && competitorQuestionIndexRef.current !== -1 && !isFinished) {
      startTimePressureMessages();
    } else {
      timePressureTimeoutsRef.current.forEach(timeoutId => clearTimeout(timeoutId));
      timePressureTimeoutsRef.current = [];
    }

    return () => {
      timePressureTimeoutsRef.current.forEach(timeoutId => clearTimeout(timeoutId));
    };
  }, [currentQuestionIndex, isFinished, startTimePressureMessages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!userInput.trim() || isAnswering) return;

    setIsAnswering(true);
    const userAnswer = userInput;
    setUserInput('');
   
    setConversation(prev => [...prev, { type: 'user', text: userAnswer }]);
   
    const currentQuestion = questions[currentQuestionIndex];
    answersRef.current.push({
      question_id: currentQuestion.question_id,
      answer_text: userAnswer
    });

    if (currentQuestion.question_id?.startsWith('COMPETITOR_CHALLENGE')) {
        timePressureTimeoutsRef.current.forEach(timeoutId => clearTimeout(timeoutId));
        timePressureTimeoutsRef.current = [];
    }

    // אי-שמירה ב-DB לשאלות מיוחדות
    if (!currentQuestion.question_id?.startsWith('COMPETITOR_CHALLENGE') && 
        currentQuestion.question_id !== 'OPENING_PERSONAL' &&
        currentQuestion.question_id !== 'BUSINESS_DEEP_DIVE') {
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
        setConversation(prev => [
          ...prev,
          { type: 'bot', text: randomAck },
          { type: 'bot', text: questions[nextIndex].question_text }
        ]);
        setCurrentQuestionIndex(nextIndex);
        setIsAnswering(false);
      } else {
        setConversation(prev => [
          ...prev,
          { type: 'bot', text: "Thank you for your time and for answering my questions. I will consider everything we discussed and let you know shortly about our decision." }
        ]);
        setIsFinished(true);
        
        setTimeout(async () => {
          await evaluateAndMakeDecision();
        }, 3000);
      }
    }, 1000);
  };

  const evaluateAndMakeDecision = async () => {
    try {
      let competitorScore = 0;
      let competitorEvaluationText = "Competitor question was not asked in this session.";
      let specificityScore = 0;
      let credibilityScore = 0;
      let strategicThinkingScore = 0;
      
      const competitorAnswer = answersRef.current.find(a => 
        a.question_id?.startsWith('COMPETITOR_CHALLENGE')
      );
      const currentCompetitorAnswerText = competitorAnswer?.answer_text || '';
      
      if (currentCompetitorAnswerText && currentCompetitorAnswerText.trim()) {
        try {
          const evaluationPrompt = `${COMPETITOR_EVALUATION_PROMPT}\n\nVENTURE CONTEXT:\nName: ${venture.name}\nDescription: ${venture.description}\nProblem: ${venture.problem}\nSolution: ${venture.solution}\n\nENTREPRENEUR'S RESPONSE:\n"${currentCompetitorAnswerText}"`;
          
          const { response: competitorResponse } = await InvokeLLM({ 
            prompt: evaluationPrompt
          });
          
          competitorEvaluationText = competitorResponse;
          
          const specificityMatch = competitorResponse.match(/Specificity:\s*(\d+(?:\.\d+)?)/i);
          const credibilityMatch = competitorResponse.match(/Credibility:\s*(\d+(?:\.\d+)?)/i);
          const strategicMatch = competitorResponse.match(/Strategic Thinking:\s*(\d+(?:\.\d+)?)/i);
          const finalScoreMatch = competitorResponse.match(/Final Score:\s*(\d+(?:\.\d+)?)/i);
          
          if (specificityMatch) specificityScore = parseFloat(specificityMatch[1]);
          if (credibilityMatch) credibilityScore = parseFloat(credibilityMatch[1]);
          if (strategicMatch) strategicThinkingScore = parseFloat(strategicMatch[1]);
          if (finalScoreMatch) {
            competitorScore = parseFloat(finalScoreMatch[1]);
          } else {
            competitorScore = (specificityScore * 0.3) + (credibilityScore * 0.4) + (strategicThinkingScore * 0.3);
          }
        } catch (error) {
          console.error("Error evaluating competitor challenge:", error);
          competitorScore = 0;
          competitorEvaluationText = `Error occurred during evaluation: ${error.message}`;
        }
      }
      
      const baseTeamScore = calculateTeamScore(venture);
      const effectiveTeamScore = (baseTeamScore * 0.7) + (competitorScore * 10 * 0.3); 
      
      await Venture.update(venture.id, { team_score: effectiveTeamScore });
      
      const proposal = calculateInvestmentOffer(localInvestor, venture, effectiveTeamScore, competitorScore);

      const calculationBreakdown = `
---
**DECISION CALCULATION BREAKDOWN**

**Team Evaluation:**
• Base Team Score: ${baseTeamScore.toFixed(1)}/100 
  - Founders: ${venture.founders_count || 1} (${(venture.founders_count || 1) >= 2 ? '100 points' : '70 points'})
  - Weekly Commitment: ${venture.weekly_commitment || 'low'} (${venture.weekly_commitment === 'high' ? '100' : venture.weekly_commitment === 'medium' ? '50' : '30'} points)
  
**Competitor Challenge Performance:**
• Competitor Score: ${competitorScore.toFixed(1)}/10
${currentCompetitorAnswerText && currentCompetitorAnswerText.trim() ? `• Individual Dimension Scores:
  - Specificity: ${specificityScore.toFixed(1)}/10
  - Credibility: ${credibilityScore.toFixed(1)}/10
  - Strategic Thinking: ${strategicThinkingScore.toFixed(1)}/10
• AI Evaluation Details:
${competitorEvaluationText}` : '• AI Evaluation Details:\nCompetitor question was not asked in this session.'}

**Final Effective Team Score:**
• Formula: (Base Team Score × 0.7) + (Competitor Score × 10 × 0.3)
• Calculation: (${baseTeamScore.toFixed(1)} × 0.7) + (${competitorScore.toFixed(1)} × 10 × 0.3) = ${effectiveTeamScore.toFixed(1)}/100

**Investment Decision Logic:**
• Competitor Score Threshold: 4.0/10 (${competitorScore >= 4.0 ? 'PASSED ✓' : 'FAILED ✗'})
• Investor Type: ${localInvestor.investor_type}
• Decision: ${proposal.decision}

${proposal.decision === 'Invest' ? `
**Investment Terms Calculation:**
• Investment Range: $${proposal.calculationDetails?.baseCheckRange?.[0]?.toLocaleString() || 'N/A'} - $${proposal.calculationDetails?.baseCheckRange?.[1]?.toLocaleString() || 'N/A'}
• Valuation Range: $${proposal.calculationDetails?.baseValuationRange?.[0]?.toLocaleString() || 'N/A'} - $${proposal.calculationDetails?.baseValuationRange?.[1]?.toLocaleString() || 'N/A'}
• Effective Team Score Multiplier: ${(effectiveTeamScore / 100).toFixed(2)}
• Sector Alignment: ${proposal.isFocusSector ? 'Yes' : 'No'} (${proposal.isFocusSector ? '1.0x' : '0.5x'} multiplier)

**Final Offer:**
• Investment Amount: $${proposal.checkSize?.toLocaleString()}
• Pre-Money Valuation: $${proposal.valuation?.toLocaleString()}
` : ''}
---
        `;

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
          investment_offer_status: 'pending'
        });
      } else {
        await VentureMessage.create({
          venture_id: venture.id,
          message_type: 'system',
          title: `📋 Response from ${localInvestor.name}`,
          content: `${localInvestor.name} has decided not to invest at this time.\n\n"${proposal.reason}"\n${calculationBreakdown}`,
          phase: venture.phase,
          priority: 2
        });
      }
      
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (error) {
      console.error("Error in evaluation:", error);
      await VentureMessage.create({
          venture_id: venture.id,
          message_type: 'system',
          title: `📋 Response from ${localInvestor.name}`,
          content: `There was an issue processing the meeting results. Error: ${error.message}. Please try again later.`,
          phase: venture.phase,
          priority: 2
      });
      
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl h-[80vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">Meeting with {localInvestor.name}</h2>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isAnswering && !isFinished}>
            Close
          </Button>
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