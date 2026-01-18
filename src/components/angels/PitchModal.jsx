"use client";
import React, { useState, useEffect, useCallback, useRef } from 'react';
// אני מייבא כאן את השמות הכי נפוצים, תבדוק אם masterQuestion אצלך באות גדולה ב-Entities
import { investor as investorEntity, masterQuestion, pitchAnswer, venture as ventureEntity, ventureMessage, businessPlan } from '@/api/entities.js';
import { InvokeLLM } from '@/api/integrations';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send } from 'lucide-react';

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

  const loadQuestions = useCallback(async () => {
    if (!investor?.assigned_question_ids || !venture?.id || isInitialLoadDone.current) return;
   
    // בדיקה מהירה: אם משהו כאן undefined, זה יופיע לך ישר ב-Console
    console.log("Checking entities:", { masterQuestion, businessPlan, pitchAnswer });

    isInitialLoadDone.current = true;
    setIsLoading(true);

    try {
      // 1. שליפת המודל העסקי
      const plans = await businessPlan.filter({ 'venture_id': venture.id });
      const revenueModelText = plans?.[0]?.revenue_model || "not specified";

      // 2. שליפת השאלות - כאן קרתה השגיאה
      const ids = investor.assigned_question_ids;
      
      // ביצוע השאילתות
      const results = await Promise.all(ids.map(id => masterQuestion.filter({ 'question_id': id })));
      const fetchedQuestions = results.flat().filter(Boolean);
     
      const baseQuestions = ids.map(id => {
        const q = fetchedQuestions.find(foundQ => foundQ.question_id === id);
        if (!q) return null;

        if (id === 'REVENUE_MODEL_CHALLENGE') {
          return {
            ...q,
            question_text: `Regarding your business plan: I saw your revenue model is "${revenueModelText}". How do you plan to scale this?`
          };
        }
        return q;
      }).filter(Boolean);
     
      const finalQuestions = [
        { question_id: 'OPENING', question_text: `Hi, tell me about ${venture.name}.` },
        ...baseQuestions
      ];
     
      setQuestions(finalQuestions);
      setConversation([{ type: 'bot', text: `Hi, I'm ${investor.name}.` }, { type: 'bot', text: finalQuestions[0].question_text }]);
    } catch (error) {
      console.error("The code failed here:", error);
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

    if (currentQ.question_id !== 'OPENING') {
        await pitchAnswer.create({ 
          venture_id: venture.id, 
          investor_id: investor.id, 
          question_id: currentQ.question_id, 
          answer_text: userAnswer 
        });
    }

    const nextIdx = currentQuestionIndex + 1;
    if (nextIdx < questions.length) {
      setConversation(prev => [...prev, { type: 'bot', text: questions[nextIdx].question_text }]);
      setCurrentQuestionIndex(nextIdx);
      setIsAnswering(false);
    } else {
      setIsFinished(true);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl h-[80vh] flex flex-col p-4">
        <div className="flex justify-between border-b pb-2 mb-4">
          <h2 className="font-bold">Meeting with {investor?.name}</h2>
          <button onClick={onClose}>Close</button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-4">
          {isLoading ? <Loader2 className="animate-spin mx-auto" /> : conversation.map((msg, i) => (
            <div key={i} className={msg.type === 'user' ? 'text-right' : 'text-left'}>
              <span className={`inline-block p-2 rounded ${msg.type === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
                {msg.text}
              </span>
            </div>
          ))}
        </div>
        <form onSubmit={handleSendMessage} className="mt-4 flex gap-2">
          <Textarea value={userInput} onChange={(e) => setUserInput(e.target.value)} className="flex-1" />
          <Button type="submit" disabled={isAnswering}><Send size={18} /></Button>
        </form>
      </div>
    </div>
  );
}