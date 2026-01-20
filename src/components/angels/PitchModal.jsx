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

const SOLUTION_EVALUATION_PROMPT = `You are evaluating an entrepreneur's response to a solution/technical challenge question. Provide score 1-10 for Technical Depth, Feasibility, and Clarity. Format: SOLUTION EVALUATION: [Scores] Final Score: [X]/10.`;
const COMPETITOR_EVALUATION_PROMPT = `You are evaluating an entrepreneur's response to a competitor challenge question. Provide score 1-10 for Specificity, Credibility, and Strategic Thinking. Format: COMPETITOR CHALLENGE EVALUATION: [Scores] Final Score: [X]/10.`;

const calculateTeamScore = (venture) => {
    const founderPoints = (venture.founders_count || 1) >= 2 ? 100 : 70;
    let commitmentPoints = 30;
    if (venture.weekly_commitment === 'medium') commitmentPoints = 50;
    if (venture.weekly_commitment === 'high') commitmentPoints = 100;
    return (founderPoints * 0.60) + (commitmentPoints * 0.40);
};

const getInvestorMessage = (aiScore) => {
  if (aiScore >= 6.5) return { tier: 'IMPRESSED', message: "I'm genuinely impressed. Your strategic thinking and understanding of the market technicalities are top-notch. I'm offering" };
  if (aiScore >= 4.0) return { tier: 'BELIEVE', message: "I see potential here. You have a solid grasp of the core challenges, even if some details need work. I'm offering" };
  if (aiScore >= 2.5) return { tier: 'RISKY', message: "It's a risky bet, and I have some reservations, but I like your spirit. I'm offering" };
  return { tier: 'REJECT', message: "Unfortunately, I've decided to pass at this time. I'm not fully convinced by the technical defensibility or the competitive strategy." };
};

const calculateInvestmentOffer = (investor, venture, effectiveTeamScore, aiScore) => {
    if (aiScore < 2.5) return { decision: 'Reject', reason: getInvestorMessage(aiScore).message, aiScore, effectiveTeamScore };
    let finalCheckSize = Math.round((50000 + (150000 * (effectiveTeamScore / 100))) / 1000) * 1000;
    let finalValuation = Math.round((1000000 + (2000000 * (effectiveTeamScore / 100))) / 100000) * 100000;
    const investorMsg = getInvestorMessage(aiScore);
    return {
        decision: 'Invest',
        checkSize: finalCheckSize,
        valuation: finalValuation,
        reason: `${investorMsg.message} $${finalCheckSize.toLocaleString()} at $${finalValuation.toLocaleString()} valuation.`,
        tier: investorMsg.tier,
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
  const timePressureTimeoutsRef = useRef([]);
  const isInitialLoadDone = useRef(false);

  const scrollToBottom = () => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); };
  useEffect(() => { scrollToBottom(); }, [conversation]);

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

      const greetingQuestion = {
        question_id: 'GREETING_WARMUP',
        question_text: `Hi, I'm ${localInvestor.name}. How are you today?`
      };

      const openingQuestion = {
        question_id: 'OPENING_PERSONAL',
        question_text: `Nice to meet you. I've gone over your business plan and have a few questions for you. Before we dive into the details, I'm curious: How did you personally come up with this concept, and what made you choose the name '${venture.name}'?`
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
      
      const finalQuestions = [
        greetingQuestion, 
        openingQuestion, 
        solutionQuestion, 
        scalabilityQuestion, 
        dbQuestions[0], 
        randomCompetitorQuestion, 
        dbQuestions[1]
      ].filter(Boolean);

      setQuestions(finalQuestions);
      setConversation([{ type: 'bot', text: greetingQuestion.question_text }]);
      
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
      setConversation([]);
      setIsFinished(false);
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
    
    // שמירת התשובה במערך לצורך ה-AI (חשוב מאוד!)
    answersRef.current.push({ question_id: currentQuestion.question_id, answer_text: userAnswer });
    
    if (currentQuestion.question_id?.startsWith('COMPETITOR_CHALLENGE')) {
        timePressureTimeoutsRef.current.forEach(timeoutId => clearTimeout(timeoutId));
        timePressureTimeoutsRef.current = [];
    }
    
    if (!currentQuestion.question_id?.startsWith('COMPETITOR_CHALLENGE') && 
        currentQuestion.question_id !== 'OPENING_PERSONAL' &&
        currentQuestion.question_id !== 'SOLUTION_DEPTH' &&
        currentQuestion.question_id !== 'GREETING_WARMUP' &&
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
      const nextIndex = currentQuestionIndex + 1;
      if (nextIndex < questions.length) {
        if (currentQuestion.question_id === 'GREETING_WARMUP') {
          setConversation(prev => [...prev, { type: 'bot', text: questions[nextIndex].question_text }]);
        } else {
          const ack = ["I see.", "That's an interesting point.", "Got it.", "Makes sense.", "Thank you for that insight."];
          const randomAck = ack[Math.floor(Math.random() * ack.length)];
          setConversation(prev => [...prev, { type: 'bot', text: randomAck }, { type: 'bot', text: questions[nextIndex].question_text }]);
        }
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
      const solutionAns = answersRef.current.find(a => a.question_id === 'SOLUTION_DEPTH')?.answer_text || '';
      const competitorAns = answersRef.current.find(a => a.question_id?.startsWith('COMPETITOR_CHALLENGE'))?.answer_text || '';
      
      const [solResult, compResult] = await Promise.all([
        InvokeLLM(`${SOLUTION_EVALUATION_PROMPT}\nResponse: ${solutionAns}`),
        InvokeLLM(`${COMPETITOR_EVALUATION_PROMPT}\nResponse: ${competitorAns}`)
      ]);

      const solScore = parseFloat(solResult.match(/Final Score: (\d+(\.\d+)?)\/10/)?.[1] || "5");
      const compScore = parseFloat(compResult.match(/Final Score: (\d+(\.\d+)?)\/10/)?.[1] || "5");
      
      const aiScore = (solScore + compScore) / 2;
      const baseTeamScore = calculateTeamScore(venture);
      const effectiveTeamScore = (baseTeamScore * 0.3) + (aiScore * 10 * 0.7);
      
      await Venture.update(venture.id, { team_score: effectiveTeamScore });
      const proposal = calculateInvestmentOffer(localInvestor, venture, effectiveTeamScore, aiScore);
      
      await VentureMessage.create({
        venture_id: venture.id,
        message_type: 'system',
        title: `Investment Decision: ${localInvestor.name}`,
        content: proposal.reason,
        phase: venture.phase
      });

      onClose();
    } catch (error) {
      console.error("Evaluation error:", error);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl h-[90vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Bot className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">{localInvestor.name}</h2>
              <p className="text-sm text-gray-500">Live Pitch Session</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              <p className="text-gray-500 font-medium">Reviewing your business plan...</p>
            </div>
          ) : (
            <>
              {conversation.map((msg, idx) => (
                <div key={idx} className={`flex items-start gap-3 ${msg.type === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.type === 'user' ? 'bg-blue-600' : 'bg-gray-200'}`}>
                    {msg.type === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-gray-600" />}
                  </div>
                  <div className={`max-w-[75%] p-4 rounded-2xl shadow-sm ${msg.type === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-gray-100 text-gray-800 rounded-tl-none'}`}>
                    <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  </div>
                </div>
              ))}
              {isFinished && (
                <div className="flex justify-center p-4">
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-full flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm font-medium">Analyzing pitch and making decision...</span>
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={chatEndRef} />
        </div>

        {!isFinished && !isLoading && (
          <div className="p-4 border-t bg-gray-50 rounded-b-lg">
            <form onSubmit={handleSendMessage} className="flex gap-3 max-w-4xl mx-auto">
              <Textarea 
                value={userInput} 
                onChange={(e) => setUserInput(e.target.value)} 
                placeholder="Type your response here..." 
                className="flex-1 min-h-[80px] bg-white border-gray-200 focus:ring-blue-500 focus:border-blue-500 resize-none rounded-xl"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
              />
              <Button 
                type="submit" 
                disabled={!userInput.trim() || isAnswering}
                className="self-end h-12 w-12 rounded-xl bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                {isAnswering ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </Button>
            </form>
            <p className="text-[10px] text-gray-400 text-center mt-2 uppercase tracking-wider font-semibold">Press Enter to send</p>
          </div>
        )}
      </div>
    </div>
  );
}