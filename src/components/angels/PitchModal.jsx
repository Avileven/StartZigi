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
  if (aiScore >= 6.5) return { tier: 'IMPRESSED', message: "I'm genuinely impressed. I'm offering" };
  if (aiScore >= 4.0) return { tier: 'BELIEVE', message: "I see potential. I'm offering" };
  if (aiScore >= 2.5) return { tier: 'RISKY', message: "It's risky, but I'll take a chance. I'm offering" };
  return { tier: 'REJECT', message: "Unfortunately, I've decided to pass." };
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
      const results = await Promise.all(ids.map(id => MasterQuestion.filter({ 'question_id': id })));
      const dbQuestions = results.flat().filter(Boolean);

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
        question_text: `What is the biggest technical challenge you anticipate in building your solution, and how will you overcome it?`
      };
      const randomComp = COMPETITOR_QUESTIONS_BANK[Math.floor(Math.random() * COMPETITOR_QUESTIONS_BANK.length)];
      
      const finalQuestions = [greetingQuestion, openingQuestion, solutionQuestion, randomComp].filter(Boolean);
      setQuestions(finalQuestions);
      setConversation([{ type: 'bot', text: greetingQuestion.question_text }]);
    } catch (error) {
      console.error("Error loading questions:", error);
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
    answersRef.current.push({ question_id: currentQuestion.question_id, answer_text: userAnswer });
    
    setTimeout(() => {
      const nextIndex = currentQuestionIndex + 1;
      if (nextIndex < questions.length) {
        const wasGreeting = questions[currentQuestionIndex].question_id === 'GREETING_WARMUP';
        if (wasGreeting) {
          setConversation(prev => [...prev, { type: 'bot', text: questions[nextIndex].question_text }]);
        } else {
          const ack = ["I see.", "Got it.", "Makes sense."];
          const randomAck = ack[Math.floor(Math.random() * ack.length)];
          setConversation(prev => [...prev, { type: 'bot', text: randomAck }, { type: 'bot', text: questions[nextIndex].question_text }]);
        }
        setCurrentQuestionIndex(nextIndex);
        setIsAnswering(false);
      } else {
        setConversation(prev => [...prev, { type: 'bot', text: "Thank you. I'll evaluate and get back to you." }]);
        setIsFinished(true);
        setTimeout(evaluateAndMakeDecision, 2000);
      }
    }, 1000);
  };

  const evaluateAndMakeDecision = async () => {
    try {
      const aiScore = 5; // Simplified for this version
      const baseTeamScore = calculateTeamScore(venture);
      const effectiveTeamScore = (baseTeamScore * 0.3) + (aiScore * 10 * 0.7);
      await Venture.update(venture.id, { team_score: effectiveTeamScore });
      const proposal = calculateInvestmentOffer(localInvestor, venture, effectiveTeamScore, aiScore);
      
      await VentureMessage.create({
        venture_id: venture.id,
        message_type: 'system',
        title: `Response from ${localInvestor.name}`,
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
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl h-[80vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">Meeting with {localInvestor.name}</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoading ? <Loader2 className="animate-spin mx-auto" /> : conversation.map((msg, idx) => (
            <div key={idx} className={`flex items-end gap-2 ${msg.type === 'user' ? 'justify-end' : ''}`}>
              <div className={`max-w-md p-3 rounded-lg ${msg.type === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}>
                <p className="whitespace-pre-wrap">{msg.text}</p>
              </div>
            </div>
          ))}
          {isFinished && <div className="text-center p-4 bg-green-50">Processing...</div>}
          <div ref={chatEndRef} />
        </div>
        {!isFinished && !isLoading && (
          <form onSubmit={handleSendMessage} className="p-4 border-t flex gap-2">
            <Textarea value={userInput} onChange={(e) => setUserInput(e.target.value)} placeholder="Type your answer..." className="flex-1" />
            <Button type="submit" disabled={!userInput.trim() || isAnswering}>
              {isAnswering ? <Loader2 className="animate-spin" /> : <Send />}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}