"use client";
import React, { useState, useEffect, useCallback, useRef } from 'react';
// הוספנו את BusinessPlan לייבוא כדי לגשת לטבלה business_plans
import { Investor, MasterQuestion, PitchAnswer, Venture, VentureMessage, BusinessPlan } from '@/api/entities.js';
import { InvokeLLM } from '@/api/integrations';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send, User, Bot } from 'lucide-react';


// ✅ בנק של 5 שאלות competitor - תיבחר אחת אקראית
const COMPETITOR_QUESTIONS_BANK = [
  {
    question_id: 'COMPETITOR_CHALLENGE_1',
    question_text: "Look, I invest in a lot of companies and I see this pattern repeatedly - entrepreneurs come in thinking they have a unique idea, but there are always competitors they don't know about. How confident are you that you really understand who you're up against?"
  },
  {
    question_id: 'COMPETITOR_CHALLENGE_2',
    question_text: "I've seen many startups blindsided by competitors they never saw coming. Walk me through your competitive analysis. Who are you really competing against for customers' attention and budget?"
  },
  {
    question_id: 'COMPETITOR_CHALLENGE_3',
    question_text: "Here's what worries me: most founders can name their direct competitors, but they miss the indirect ones. Beyond the obvious players, what are the real alternatives your customers are considering?"
  },
  {
    question_id: 'COMPETITOR_CHALLENGE_4',
    question_text: "Let's talk about competitive moats. What's stopping a bigger, better-funded company from replicating what you're doing? And please don't say 'execution' - I need something more concrete."
  },
  {
    question_id: 'COMPETITOR_CHALLENGE_5',
    question_text: "Every market has a 500-pound gorilla. In your space, who's that player? What's their strategy, and how are you positioning yourself to win despite their advantages?"
  }
];


const COMPETITOR_EVALUATION_PROMPT = `You are evaluating an entrepreneur's response to a competitor challenge question. Use this detailed scoring framework:
SCORING DIMENSIONS (1-10 each):
SPECIFICITY (30% weight), CREDIBILITY (40% weight), STRATEGIC THINKING (30% weight).
CALCULATION: final_score = (specificity * 0.3) + (credibility * 0.4) + (strategic_thinking * 0.3)
Please provide the evaluation in the specified format with Final Score.`;


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
            reason: `The response to the competitor challenge did not meet our threshold (Score: ${competitorScore.toFixed(1)}/10).`,
            competitorScore,
            effectiveTeamScore
        };
    }

    if (investor.investor_type === 'no_go') {
        return { decision: 'Reject', reason: 'Currently only advising existing portfolio companies.' };
    }

    if (investor.investor_type === 'team_focused' && (venture.founders_count || 1) < 2) {
        return { decision: 'Reject', reason: 'We focus on ventures with multiple co-founders.' };
    }

    let finalCheckSize;
    let finalValuation;
    const effectiveTeamScoreMultiplier = effectiveTeamScore / 100;

    if (investor.investor_type === 'flexible') {
        const isFocusSector = investor.focus_sectors?.some(sector => venture.sector === sector);
        const checkMultiplier = isFocusSector ? 1.0 : 0.5;
        const valuationMultiplier = isFocusSector ? 1.0 : 0.4;
       
        finalCheckSize = Math.round((50000 + (150000 - 50000) * effectiveTeamScoreMultiplier * checkMultiplier) / 1000) * 1000;
        finalValuation = Math.round((1000000 + (2500000 - 1000000) * effectiveTeamScoreMultiplier * valuationMultiplier) / 100000) * 100000;

        return { decision: 'Invest', checkSize: finalCheckSize, valuation: finalValuation, reason: 'Your venture aligns well with our thesis.', isFocusSector, calculationDetails: { baseCheckRange: [50000, 150000], baseValuationRange: [1000000, 2500000] } };
    }

    if (investor.investor_type === 'team_focused') {
         finalCheckSize = Math.round((60000 + (130000 - 60000) * effectiveTeamScoreMultiplier) / 1000) * 1000;
         finalValuation = Math.round((1000000 + (4000000 - 1000000) * effectiveTeamScoreMultiplier) / 100000) * 100000;
         return { decision: 'Invest', checkSize: finalCheckSize, valuation: finalValuation, reason: 'Team shows great promise.' };
    }
   
    return { decision: 'Reject', reason: 'Decided not to proceed at this time.' };
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
      // 🚀 הוספה: שליפת המודל העסקי מהטבלה business_plans לפי ה-venture.id
      const plans = await BusinessPlan.filter({ 'venture_id': venture.id });
      const businessPlan = plans[0]; 
      const revenueModelFromDb = businessPlan?.revenue_model || "not explicitly defined";

      const ids = localInvestor.assigned_question_ids;
      const results = await Promise.all(ids.map(id => MasterQuestion.filter({ 'question_id': id })));
      const fetchedQuestions = results.flat().filter(Boolean);
     
      // ✅ עיבוד השאלות ובדיקת ID לשאלת מודל הכנסות
      const baseQuestions = ids.map(id => {
        const q = fetchedQuestions.find(foundQ => foundQ.question_id === id);
        if (!q) return null;

        // הזרקת המידע מהטבלה לתוך השאלה הנכונה
        if (id === 'REVENUE_MODEL_CHALLENGE') {
          return {
            ...q,
            question_text: `I was looking at your business plan, specifically the revenue model: "${revenueModelFromDb}". How do you plan to scale this pricing strategy effectively?`
          };
        }
        return q;
      }).filter(Boolean);
     
      const openingQuestion = {
        question_id: 'OPENING_PERSONAL',
        question_text: `Nice to meet you. Before we dive into the business details, I'm curious about the person behind the idea. How did you personally come up with this concept, and what made you choose the name '${venture.name}' for your project?`
      };
     
      const randomCompetitorQuestion = COMPETITOR_QUESTIONS_BANK[Math.floor(Math.random() * COMPETITOR_QUESTIONS_BANK.length)];
     
      const insertPosition = Math.floor(Math.random() * (baseQuestions.length + 1));
      const questionsWithCompetitor = [
        ...baseQuestions.slice(0, insertPosition),
        randomCompetitorQuestion,
        ...baseQuestions.slice(insertPosition)
      ];
     
      const finalQuestions = [openingQuestion, ...questionsWithCompetitor];
      competitorQuestionIndexRef.current = insertPosition + 1;
     
      setQuestions(finalQuestions);
      setConversation([{ type: 'bot', text: `Hi, I'm ${localInvestor.name}. I've gone over your business plan and have a few questions.` }]);
     
      setTimeout(() => {
        setConversation(prev => [...prev, { type: 'bot', text: finalQuestions[0].question_text }]);
      }, 1500);

    } catch (error) {
      console.error("Error loading data:", error);
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

  const startTimePressureMessages = useCallback(() => {
    timePressureTimeoutsRef.current.forEach(clearTimeout);
    timePressureTimeoutsRef.current = [
      setTimeout(() => setConversation(prev => [...prev, { type: 'bot', text: "Take your time, but I need a concise answer." }]), 30000),
      setTimeout(() => setConversation(prev => [...prev, { type: 'bot', text: "I have another meeting in 10 minutes..." }]), 60000)
    ];
  }, []);

  useEffect(() => {
    if (currentQuestionIndex === competitorQuestionIndexRef.current && !isFinished) {
      startTimePressureMessages();
    } else {
      timePressureTimeoutsRef.current.forEach(clearTimeout);
    }
    return () => timePressureTimeoutsRef.current.forEach(clearTimeout);
  }, [currentQuestionIndex, isFinished, startTimePressureMessages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!userInput.trim() || isAnswering) return;

    setIsAnswering(true);
    const userAnswer = userInput;
    setUserInput('');
    setConversation(prev => [...prev, { type: 'user', text: userAnswer }]);
   
    const currentQuestion = questions[currentQuestionIndex];
    answersRef.current.push({ question_id: currentQuestion.question_id, answer_text: userAnswer });

    if (currentQuestion.question_id?.startsWith('COMPETITOR_CHALLENGE')) {
        timePressureTimeoutsRef.current.forEach(clearTimeout);
    }

    // שמירה ל-DB (רק לשאלות רגילות)
    if (!currentQuestion.question_id?.startsWith('COMPETITOR_CHALLENGE') && currentQuestion.question_id !== 'OPENING_PERSONAL') {
        try {
          await PitchAnswer.create({ venture_id: venture.id, investor_id: localInvestor.id, question_id: currentQuestion.question_id, answer_text: userAnswer });
        } catch(err) { console.error("Failed to save answer", err); }
    }

    setTimeout(() => {
      const nextIndex = currentQuestionIndex + 1;
      if (nextIndex < questions.length) {
        setConversation(prev => [...prev, { type: 'bot', text: "I see." }, { type: 'bot', text: questions[nextIndex].question_text }]);
        setCurrentQuestionIndex(nextIndex);
        setIsAnswering(false);
      } else {
        setConversation(prev => [...prev, { type: 'bot', text: "Thank you. I will let you know my decision shortly." }]);
        setIsFinished(true);
        setTimeout(evaluateAndMakeDecision, 3000);
      }
    }, 1000);
  };

  const evaluateAndMakeDecision = async () => {
    try {
      let competitorScore = 0;
      const compAnswer = answersRef.current.find(a => a.question_id?.startsWith('COMPETITOR_CHALLENGE'))?.answer_text;
      
      if (compAnswer) {
        const { response } = await InvokeLLM({ prompt: `${COMPETITOR_EVALUATION_PROMPT}\nResponse: ${compAnswer}` });
        const match = response.match(/Final Score:\s*(\d+(?:\.\d+)?)/i);
        competitorScore = match ? parseFloat(match[1]) : 5;
      }
     
      const baseTeamScore = calculateTeamScore(venture);
      const effectiveTeamScore = (baseTeamScore * 0.7) + (competitorScore * 10 * 0.3);
      await Venture.update(venture.id, { team_score: effectiveTeamScore });
     
      const proposal = calculateInvestmentOffer(localInvestor, venture, effectiveTeamScore, competitorScore);

      await VentureMessage.create({
        venture_id: venture.id,
        message_type: proposal.decision === 'Invest' ? 'investment_offer' : 'system',
        title: proposal.decision === 'Invest' ? `💰 Offer from ${localInvestor.name}` : `📋 Response from ${localInvestor.name}`,
        content: proposal.reason,
        investment_offer_checksize: proposal.checkSize,
        investment_offer_valuation: proposal.valuation
      });
     
      setTimeout(onClose, 2000);
    } catch (error) { console.error("Error in evaluation:", error); onClose(); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl h-[80vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">Meeting with {localInvestor.name}</h2>
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoading ? <Loader2 className="animate-spin mx-auto" /> : conversation.map((msg, idx) => (
            <div key={idx} className={`flex items-end gap-2 ${msg.type === 'user' ? 'justify-end' : ''}`}>
              <div className={`max-w-md p-3 rounded-lg ${msg.type === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}>
                <p className="whitespace-pre-wrap">{msg.text}</p>
              </div>
            </div>
          ))}
          {isFinished && <div className="text-center p-4"><Loader2 className="animate-spin mx-auto" /><p>Processing decision...</p></div>}
          <div ref={chatEndRef} />
        </div>
        {!isFinished && !isLoading && (
          <div className="p-4 border-t">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Textarea value={userInput} onChange={(e) => setUserInput(e.target.value)} placeholder="Type your answer..." className="flex-1" />
              <Button type="submit" disabled={isAnswering}><Send className="w-4 h-4" /></Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}