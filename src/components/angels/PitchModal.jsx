"use client";
import React, { useState, useEffect, useCallback, useRef } from 'react';
// ✅ ייבוא מדויק לפי הלוגים שלך: MasterQuestion ו-PitchAnswer גדולות, השאר קטנות
import { 
  investor as investorEntity, 
  MasterQuestion, 
  PitchAnswer, 
  venture as ventureEntity, 
  ventureMessage, 
  businessPlan 
} from '@/api/entities.js';
import { InvokeLLM } from '@/api/integrations';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send } from 'lucide-react';

// --- שאלות מתחרים (הלוגיקה המקורית שלך) ---
const COMPETITOR_QUESTIONS_BANK = [
  {
    question_id: 'COMPETITOR_CHALLENGE_1',
    question_text: "How confident are you that you really understand who you're up against? What if a giant enters the market?"
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
  const isInitialLoadDone = useRef(false);
  const competitorQuestionIndexRef = useRef(-1);

  const loadQuestions = useCallback(async () => {
    // מניעת הרצה כפולה ובדיקת קיום נתונים
    if (!investor?.assigned_question_ids || !venture?.id || isInitialLoadDone.current) return;
   
    isInitialLoadDone.current = true;
    setIsLoading(true);

    try {
      // 1. שליפה מהטבלה business_plans עבור המיזם הספציפי
      const plans = await businessPlan.filter({ 'venture_id': venture.id });
      const revenueData = plans?.[0]?.revenue_model || "not provided";

      // 2. שליפת השאלות המוגדרות למשקיע
      const ids = investor.assigned_question_ids;
      const results = await Promise.all(ids.map(id => MasterQuestion.filter({ 'question_id': id })));
      const fetchedQuestions = results.flat().filter(Boolean);
     
      // 3. בניית מערך השאלות עם הזרקת ה-Revenue Model
      const baseQuestions = ids.map(id => {
        const q = fetchedQuestions.find(foundQ => foundQ.question_id === id);
        if (!q) return null;

        if (id === 'REVENUE_MODEL_CHALLENGE') {
          return {
            ...q,
            question_text: `I've been looking at your business plan. Regarding your revenue model: "${revenueData}" - how do you justify this strategy?`
          };
        }
        return q;
      }).filter(Boolean);
     
      // שאלת פתיחה
      const opening = { question_id: 'OPENING', question_text: `Hi, tell me about ${venture.name}.` };
      
      // הזרקת שאלת מתחרים אקראית
      const randomComp = COMPETITOR_QUESTIONS_BANK[0];
      const insertPos = Math.floor(Math.random() * (baseQuestions.length + 1));
      
      const finalQuestions = [opening, ...baseQuestions.slice(0, insertPos), randomComp, ...baseQuestions.slice(insertPos)];
      competitorQuestionIndexRef.current = insertPos + 1;
     
      setQuestions(finalQuestions);
      setConversation([{ type: 'bot', text: finalQuestions[0].question_text }]);
    } catch (error) {
      console.error("Critical Failure:", error);
    } finally {
      setIsLoading(false);
    }
  }, [investor, venture]);

  useEffect(() => {
    if (isOpen) {
      isInitialLoadDone.current = false;
      setCurrentQuestionIndex(0);
      setConversation([]);
      setIsFinished(false);
      answersRef.current = [];
      loadQuestions();
    }
  }, [isOpen, loadQuestions]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!userInput.trim() || isAnswering) return;

    setIsAnswering(true);
    const userAnswer = userInput;
    setUserInput('');
    setConversation(prev => [...prev, { type: 'user', text: userAnswer }]);
   
    const currentQ = questions[currentQuestionIndex];
    answersRef.current.push({ question_id: currentQ.question_id, answer_text: userAnswer });

    // שמירה לטבלת התשובות (רק לשאלות שאינן פתיחה/מתחרים)
    if (currentQ.question_id !== 'OPENING' && !currentQ.question_id.includes('COMPETITOR')) {
        try {
          await PitchAnswer.create({ 
            venture_id: venture.id, 
            investor_id: investor.id, 
            question_id: currentQ.question_id, 
            answer_text: userAnswer 
          });
        } catch(err) { console.error("DB Save Error:", err); }
    }

    // מעבר לשאלה הבאה או סיום
    setTimeout(() => {
      const nextIdx = currentQuestionIndex + 1;
      if (nextIdx < questions.length) {
        setConversation(prev => [...prev, { type: 'bot', text: questions[nextIdx].question_text }]);
        setCurrentQuestionIndex(nextIdx);
        setIsAnswering(false);
      } else {
        setIsFinished(true);
        setTimeout(onClose, 2000);
      }
    }, 800);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl h-[80vh] flex flex-col shadow-xl">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="font-bold">Pitch Session: {investor?.name}</h2>
          <button onClick={onClose}>✕</button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoading ? <Loader2 className="animate-spin mx-auto" /> : conversation.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3 rounded-xl ${msg.type === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>
                <p className="text-sm">{msg.text}</p>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
        {!isFinished && !isLoading && (
          <form onSubmit={handleSendMessage} className="p-4 border-t flex gap-2">
            <Textarea value={userInput} onChange={(e) => setUserInput(e.target.value)} className="flex-1 min-h-[50px]" />
            <Button type="submit" disabled={isAnswering}><Send size={18} /></Button>
          </form>
        )}
      </div>
    </div>
  );
}