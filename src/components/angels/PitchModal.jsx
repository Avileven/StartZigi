"use client";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Investor, MasterQuestion, PitchAnswer, Venture, VentureMessage } from '@/api/entities.js';
import { InvokeLLM } from '@/api/integrations';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send, User, Bot } from 'lucide-react';

const COMPETITOR_QUESTIONS_BANK = [
  { question_id: 'COMPETITOR_CHALLENGE_1', question_text: "Look, I invest in a lot of companies and I see this pattern repeatedly - entrepreneurs come in thinking they have a unique idea, but there are always competitors they don't know about... How confident are you that you really understand who you're up against?" },
  { question_id: 'COMPETITOR_CHALLENGE_2', question_text: "I've seen many startups blindsided by competitors they never saw coming... Walk me through your competitive analysis. Who are you really competing against?" },
  { question_id: 'COMPETITOR_CHALLENGE_3', question_text: "Beyond the obvious players, what are the real alternatives your customers are considering? And why would they pick you over just sticking with what they have?" },
  { question_id: 'COMPETITOR_CHALLENGE_4', question_text: "What's stopping a bigger, better-funded company from replicating what you're doing? I need something more concrete than 'execution'." },
  { question_id: 'COMPETITOR_CHALLENGE_5', question_text: "In your space, who is the 500-pound gorilla? How are you positioning yourself to win despite their advantages?" }
];

export default function PitchModal({ investor, venture, isOpen, onClose }) {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [conversation, setConversation] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAnswering, setIsAnswering] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
 
  const chatEndRef = useRef(null);
  const answersRef = useRef([]);
  const timePressureTimeoutsRef = useRef([]);
  const isInitialLoadDone = useRef(false);
  const competitorQuestionIndexRef = useRef(-1);

  // פונקציה לניקוי כל הטיימרים הקיימים
  const clearTimers = useCallback(() => {
    timePressureTimeoutsRef.current.forEach(clearTimeout);
    timePressureTimeoutsRef.current = [];
  }, []);

  // פונקציה להפעלת טיימרים חדשים לשאלה הנוכחית
  const startTimers = useCallback((isAIQuestion) => {
    clearTimers();
    
    // הודעה ראשונה אחרי 20 שניות
    timePressureTimeoutsRef.current.push(setTimeout(() => {
      setConversation(prev => [...prev, { type: 'bot', text: "I'm still waiting for your thoughts on this." }]);
    }, 20000));

    // הודעה שנייה (יותר לוחצת) אחרי 45 שניות
    timePressureTimeoutsRef.current.push(setTimeout(() => {
      const msg = isAIQuestion 
        ? "This competitive piece is critical. Don't go silent on me now." 
        : "Let's speed things up, I have a busy schedule today.";
      setConversation(prev => [...prev, { type: 'bot', text: msg }]);
    }, 45000));
  }, [clearTimers]);

  const loadQuestions = useCallback(async () => {
    if (!investor?.assigned_question_ids || isInitialLoadDone.current) return;
    isInitialLoadDone.current = true;
    setIsLoading(true);

    try {
      const ids = investor.assigned_question_ids;
      const results = await Promise.all(ids.map(id => MasterQuestion.filter({ 'question_id': id })));
      const fetchedQuestions = results.flat().filter(Boolean);
      const baseQuestions = ids.map(id => fetchedQuestions.find(q => q.question_id === id)).filter(Boolean);
      
      const randomCompetitorQuestion = COMPETITOR_QUESTIONS_BANK[Math.floor(Math.random() * COMPETITOR_QUESTIONS_BANK.length)];
      const insertPosition = Math.floor(Math.random() * (baseQuestions.length + 1));
      const finalQuestions = [...baseQuestions.slice(0, insertPosition), randomCompetitorQuestion, ...baseQuestions.slice(insertPosition)];
      
      competitorQuestionIndexRef.current = insertPosition;
      setQuestions(finalQuestions);
      setConversation([{ type: 'bot', text: `Hi, I'm ${investor.name}. Let's discuss your venture.` }]);
      
      setTimeout(() => {
        setConversation(prev => [...prev, { type: 'bot', text: finalQuestions[0].question_text }]);
        startTimers(insertPosition === 0); // הפעלת טיימר לשאלה הראשונה
      }, 1500);
    } catch (e) { console.error(e); } finally { setIsLoading(false); }
  }, [investor, startTimers]);

  useEffect(() => {
    if (isOpen) {
      isInitialLoadDone.current = false;
      loadQuestions();
    }
    return () => clearTimers();
  }, [isOpen, loadQuestions, clearTimers]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!userInput.trim() || isAnswering) return;

    clearTimers(); // ניקוי טיימרים ברגע שהמשתמש שלח תשובה
    setIsAnswering(true);
    const userAnswer = userInput;
    setUserInput('');
    setConversation(prev => [...prev, { type: 'user', text: userAnswer }]);
    
    const currentQuestion = questions[currentQuestionIndex];
    answersRef.current.push({ question_id: currentQuestion.question_id, answer_text: userAnswer });

    // לוגיקת שמירה (בדומה לקוד המקור שלך)
    if (!currentQuestion.question_id?.startsWith('COMPETITOR_CHALLENGE')) {
      try {
        await PitchAnswer.create({
          venture_id: venture.id,
          investor_id: investor.id,
          question_id: currentQuestion.question_id,
          answer_text: userAnswer
        });
      } catch(err) { console.error(err); }
    }

    setTimeout(() => {
      const nextIndex = currentQuestionIndex + 1;
      if (nextIndex < questions.length) {
        const isNextAI = nextIndex === competitorQuestionIndexRef.current;
        setConversation(prev => [...prev, { type: 'bot', text: "Understood. Moving on..." }, { type: 'bot', text: questions[nextIndex].question_text }]);
        setCurrentQuestionIndex(nextIndex);
        setIsAnswering(false);
        startTimers(isNextAI); // הפעלת טיימרים מחדש לשאלה הבאה
      } else {
        setConversation(prev => [...prev, { type: 'bot', text: "Thank you. I've heard enough to make a decision." }]);
        setIsFinished(true);
        // כאן מופעל הניתוח הסופי
      }
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl h-[80vh] flex flex-col overflow-hidden">
        <div className="p-4 border-b flex justify-between bg-gray-50">
          <h2 className="font-bold">Pitching {investor.name}</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {conversation.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3 rounded-lg ${msg.type === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}>
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
        {!isFinished && (
          <form onSubmit={handleSendMessage} className="p-4 border-t flex gap-2">
            <Textarea value={userInput} onChange={(e) => setUserInput(e.target.value)} className="flex-1" />
            <Button type="submit" disabled={isAnswering}><Send size={18} /></Button>
          </form>
        )}
      </div>
    </div>
  );
}