// 16126 TEST
"use client";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Investor } from '@/api/entities.js';
import { MasterQuestion } from '@/api/entities.js';
import { PitchAnswer } from '@/api/entities.js';
import { Venture } from '@/api/entities.js';
import { VentureMessage } from '@/api/entities.js';
import { InvokeLLM } from '@/api/integrations';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send, User, Bot } from 'lucide-react';

const COMPETITOR_QUESTION = {
  question_id: 'COMPETITOR_CHALLENGE',
  question_text: "Look, I invest in a lot of companies and I see this pattern repeatedly - entrepreneurs come in thinking they have a unique idea, but there are always competitors they don't know about. Sometimes it's an established player expanding into their space, sometimes it's another startup pivoting, sometimes it's a big tech company building this internally. How confident are you that you really understand who you're up against? And more importantly - what happens to your business when you discover there's more competition than you thought?"
};

// ... (שאר הקבועים והפרומפטים שלך נשארים אותו דבר)
const COMPETITOR_EVALUATION_PROMPT = `You are evaluating an entrepreneur's response to a competitor challenge question...`;

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
            reason: `The response to the competitor challenge did not meet our investment threshold (Score: ${competitorScore.toFixed(1)}/10).`,
            competitorScore,
            effectiveTeamScore,
            threshold: 4.0
        };
    }
    // ... שאר לוגיקת ההצעה שלך
    if (investor.investor_type === 'no_go') return { decision: 'Reject', reason: '...' };
    if (investor.investor_type === 'team_focused' && (venture.founders_count || 1) < 2) return { decision: 'Reject', reason: '...' };
    
    let finalCheckSize;
    let finalValuation;
    const effectiveTeamScoreMultiplier = effectiveTeamScore / 100;

    if (investor.investor_type === 'flexible') {
        const isFocusSector = investor.focus_sectors.some(sector => venture.sector === sector);
        const checkMultiplier = isFocusSector ? 1.0 : 0.5;
        const valuationMultiplier = isFocusSector ? 1.0 : 0.4;
        finalCheckSize = Math.round((50000 + (150000 - 50000) * effectiveTeamScoreMultiplier * checkMultiplier) / 1000) * 1000;
        finalValuation = Math.round((1000000 + (2500000 - 1000000) * effectiveTeamScoreMultiplier * valuationMultiplier) / 100000) * 100000;
        return { decision: 'Invest', checkSize: finalCheckSize, valuation: finalValuation, reason: '...', competitorScore, effectiveTeamScore, isFocusSector, calculationDetails: { baseCheckRange: [50000, 150000], baseValuationRange: [1000000, 2500000] }};
    }
    return { decision: 'Reject', reason: '...' };
};

export default function PitchModal({ investor, venture, isOpen, onClose }) {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [conversation, setConversation] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAnswering, setIsAnswering] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [competitorQuestionIndex, setCompetitorQuestionIndex] = useState(-1);
  const [competitorAnswerText, setCompetitorAnswerText] = useState('');
  const [localInvestor, setLocalInvestor] = useState(investor);
  const chatEndRef = useRef(null);
  const timePressureTimeoutsRef = useRef([]);
  const answersRef = useRef([]);
  
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  const loadQuestions = useCallback(async () => {
    if (!localInvestor || !localInvestor.assigned_question_ids) return;
    setIsLoading(true);
    try {
      const ids = localInvestor.assigned_question_ids;
      const fetchPromises = ids.map(id => MasterQuestion.filter({ 'question_id': id }));
      const results = await Promise.all(fetchPromises);
      const fetchedQuestions = results.flat().filter(Boolean);
      
      const orderedQuestions = ids
        .map(id => fetchedQuestions.find(q => q.question_id === id))
        .filter(Boolean);
      
      // ✅ שינוי כירורגי 1: מניעת כפילות של שאלת המתחרים על ידי יצירת מערך חדש (במקום splice)
      const insertPosition = Math.floor(Math.random() * (orderedQuestions.length + 1));
      const finalQuestionsList = [
        ...orderedQuestions.slice(0, insertPosition),
        COMPETITOR_QUESTION,
        ...orderedQuestions.slice(insertPosition)
      ];
      
      setCompetitorQuestionIndex(insertPosition);
      setQuestions(finalQuestionsList);
      
      // ✅ שינוי כירורגי 2: מניעת כפילות הודעת פתיחה
      setConversation(prev => {
        if (prev.length > 0) return prev;
        return [{ type: 'bot', text: `Hi, I'm ${localInvestor.name}. I've gone over your business plan and have a few questions for you.` }];
      });
      
      // ✅ שינוי כירורגי 3: מניעת כפילות השאלה הראשונה בתוך ה-timeout
      setTimeout(() => {
        setConversation(prev => {
          const firstQuestion = finalQuestionsList[0]?.question_text;
          // אם השאלה כבר קיימת בשיחה (בגלל ריצה כפולה של React), אל תוסיף אותה שוב
          if (!firstQuestion || prev.some(m => m.text === firstQuestion)) return prev;
          return [...prev, { type: 'bot', text: firstQuestion }];
        });
      }, 1500);

    } catch (error) {
      console.error("Error loading questions:", error);
    }
    setIsLoading(false);
  }, [localInvestor]);
  
  useEffect(() => {
    const fetchLatestInvestorData = async () => {
      if (investor && investor.id) {
        try {
          const latestInvestors = await Investor.filter({ id: investor.id });
          if (latestInvestors.length > 0) setLocalInvestor(latestInvestors[0]);
        } catch { setLocalInvestor(investor); }
      }
    };

    if (isOpen) {
      fetchLatestInvestorData();
      setQuestions([]);
      setCurrentQuestionIndex(0);
      setConversation([]);
      setUserInput('');
      setIsLoading(true);
      setIsAnswering(false);
      setIsFinished(false);
      setAnswers([]);
      setCompetitorQuestionIndex(-1);
      setCompetitorAnswerText('');
      answersRef.current = [];
      timePressureTimeoutsRef.current.forEach(clearTimeout);
      timePressureTimeoutsRef.current = [];
    }
  }, [isOpen, investor]);

  useEffect(() => {
    if (isOpen && localInvestor) {
      loadQuestions();
    }
  }, [isOpen, localInvestor, loadQuestions]);

  // ... (שאר הפונקציות handleSendMessage, evaluateAndMakeDecision וכו' נשארות כפי שהיו בקוד המקורי שלך)
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!userInput.trim() || isAnswering) return;
    setIsAnswering(true);
    const userAnswer = userInput;
    setUserInput('');
    setConversation(prev => [...prev, { type: 'user', text: userAnswer }]);
    const currentQuestion = questions[currentQuestionIndex];
    const answerObj = { question_id: currentQuestion.question_id, answer_text: userAnswer };
    answersRef.current.push(answerObj);
    
    // אק (אישור) והצגת השאלה הבאה
    setTimeout(() => {
      setConversation(prev => [...prev, { type: 'bot', text: "Got it." }]);
      const nextIndex = currentQuestionIndex + 1;
      if (nextIndex < questions.length) {
        setTimeout(() => {
          setConversation(prev => [...prev, { type: 'bot', text: questions[nextIndex].question_text }]);
          setCurrentQuestionIndex(nextIndex);
          setIsAnswering(false);
        }, 1500);
      } else {
        // סיום וקבלת החלטה
        setIsFinished(true);
        setTimeout(() => evaluateAndMakeDecision(), 2000);
      }
    }, 1000);
  };

  const evaluateAndMakeDecision = async () => { /* הלוגיקה המקורית שלך */ };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl h-[80vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">Meeting with {localInvestor.name}</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {conversation.map((msg, index) => (
            <div key={index} className={`flex items-end gap-2 ${msg.type === 'user' ? 'justify-end' : ''}`}>
              {msg.type === 'bot' && <Bot className="w-8 h-8 p-1 rounded-full bg-gray-200"/>}
              <div className={`max-w-md p-3 rounded-lg ${msg.type === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}>
                <p className="whitespace-pre-wrap">{msg.text}</p>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
        {!isFinished && (
          <form onSubmit={handleSendMessage} className="p-4 border-t flex gap-2">
            <Textarea 
              value={userInput} 
              onChange={(e) => setUserInput(e.target.value)}
              className="flex-1"
              placeholder="Type your answer..."
            />
            <Button type="submit" disabled={!userInput.trim() || isAnswering}><Send className="w-4 h-4"/></Button>
          </form>
        )}
      </div>
    </div>
  );
}