"use client";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Investor, MasterQuestion, PitchAnswer, Venture, VentureMessage } from '@/api/entities.js';
import { InvokeLLM } from '@/api/integrations';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send, User, Bot } from 'lucide-react';

const COMPETITOR_QUESTIONS_BANK = [
  {
    question_id: 'COMPETITOR_CHALLENGE_1',
    question_text: "Look, I invest in a lot of companies and I see this pattern repeatedly - entrepreneurs come in thinking they have a unique idea, but there are always competitors they don't know about. How confident are you that you really understand who you're up against?"
  },
  {
    question_id: 'COMPETITOR_CHALLENGE_2',
    question_text: "I've seen many startups blindsided by competitors they never saw coming. Walk me through your competitive analysis. Who are you really competing against for customers' attention?"
  },
  {
    question_id: 'COMPETITOR_CHALLENGE_3',
    question_text: "Beyond the obvious players, what are the real alternatives your customers are considering? And why would they pick you over just sticking with what they have?"
  }
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
  const timeoutsRef = useRef([]);
  const isInitialLoadDone = useRef(false);

  // פונקציה לניקוי טיימרים
  const clearPressureTimers = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  // מנגנון הזירוז - מופעל בכל פעם שהשאלה מתחלפת
  useEffect(() => {
    if (questions.length > 0 && !isFinished && !isAnswering) {
      clearPressureTimers();

      // הודעת זירוז 1 - אחרי 30 שניות
      const t1 = setTimeout(() => {
        setConversation(prev => [...prev, { 
          type: 'bot', 
          text: "I'm still waiting for your answer. Efficiency is key here." 
        }]);
      }, 30000);

      // הודעת זירוז 2 - אחרי 60 שניות
      const t2 = setTimeout(() => {
        setConversation(prev => [...prev, { 
          type: 'bot', 
          text: "If you need more time to think we can stop, but I have a meeting in 5 minutes." 
        }]);
      }, 60000);

      timeoutsRef.current = [t1, t2];
    }
    return () => clearPressureTimers();
  }, [currentQuestionIndex, questions.length, isFinished, isAnswering, clearPressureTimers]);

  const loadQuestions = useCallback(async () => {
    if (!investor?.assigned_question_ids || isInitialLoadDone.current) return;
    isInitialLoadDone.current = true;
    setIsLoading(true);

    try {
      const ids = investor.assigned_question_ids;
      const results = await Promise.all(ids.map(id => MasterQuestion.filter({ 'question_id': id })));
      const baseQuestions = ids.map(id => results.flat().find(q => q.question_id === id)).filter(Boolean);
      
      const randomCompQ = COMPETITOR_QUESTIONS_BANK[Math.floor(Math.random() * COMPETITOR_QUESTIONS_BANK.length)];
      const insertPos = Math.floor(Math.random() * (baseQuestions.length + 1));
      const finalQuestions = [...baseQuestions.slice(0, insertPos), randomCompQ, ...baseQuestions.slice(insertPos)];
      
      setQuestions(finalQuestions);
      setConversation([
        { type: 'bot', text: `Hi, I'm ${investor.name}. Let's jump right in.` },
        { type: 'bot', text: finalQuestions[0].question_text }
      ]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [investor]);

  useEffect(() => {
    if (isOpen) {
      isInitialLoadDone.current = false;
      setCurrentQuestionIndex(0);
      setConversation([]);
      loadQuestions();
    }
    return () => clearPressureTimers();
  }, [isOpen, loadQuestions, clearPressureTimers]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!userInput.trim() || isAnswering) return;

    clearPressureTimers(); // עצירת זירוז מיד עם שליחת תשובה
    setIsAnswering(true);
    const userAnswer = userInput;
    setUserInput('');
    setConversation(prev => [...prev, { type: 'user', text: userAnswer }]);
    
    const currentQ = questions[currentQuestionIndex];
    answersRef.current.push({ question_id: currentQ.question_id, answer_text: userAnswer });

    // שמירה ב-DB (רק לשאלות רגילות)
    if (!currentQ.question_id.startsWith('COMPETITOR_CHALLENGE')) {
      await PitchAnswer.create({ 
        venture_id: venture.id, 
        investor_id: investor.id, 
        question_id: currentQ.question_id, 
        answer_text: userAnswer 
      });
    }

    setTimeout(() => {
      const nextIdx = currentQuestionIndex + 1;
      if (nextIdx < questions.length) {
        setConversation(prev => [
          ...prev, 
          { type: 'bot', text: "Got it." }, 
          { type: 'bot', text: questions[nextIdx].question_text }
        ]);
        setCurrentQuestionIndex(nextIdx);
        setIsAnswering(false);
      } else {
        setConversation(prev => [...prev, { type: 'bot', text: "Thank you. I'll review everything and get back to you." }]);
        setIsFinished(true);
        // כאן מופעל ה-Decision (פונקציית evaluateAndMakeDecision שלך)
      }
    }, 1000);
  };

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [conversation]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl h-[80vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">Meeting with {investor.name}</h2>
          <Button variant="ghost" onClick={onClose}>Exit</Button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {conversation.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-3 rounded-lg ${msg.type === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
        {!isFinished && !isLoading && (
          <form onSubmit={handleSendMessage} className="p-4 border-t flex gap-2">
            <Textarea value={userInput} onChange={(e) => setUserInput(e.target.value)} className="flex-1" />
            <Button type="submit" disabled={isAnswering}><Send size={18} /></Button>
          </form>
        )}
      </div>
    </div>
  );
}