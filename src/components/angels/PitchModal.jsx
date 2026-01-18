"use client";
import React, { useState, useEffect, useCallback, useRef } from 'react';
// ✅ תיקון השמות לפי ה-Log שלך: MasterQuestion ו-PitchAnswer באות גדולה
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
   
    isInitialLoadDone.current = true;
    setIsLoading(true);

    try {
      // 1. שליפת המודל העסקי מהטבלה business_plans
      const plans = await businessPlan.filter({ 'venture_id': venture.id });
      const revenueModelText = plans?.[0]?.revenue_model || "not specified";

      // 2. שליפת השאלות המוקצות למשקיע
      const ids = investor.assigned_question_ids;
      
      // ✅ שימוש ב-MasterQuestion (אות גדולה) כפי שמופיע ב-DB שלכם
      const results = await Promise.all(ids.map(id => MasterQuestion.filter({ 'question_id': id })));
      const fetchedQuestions = results.flat().filter(Boolean);
     
      const baseQuestions = ids.map(id => {
        const q = fetchedQuestions.find(foundQ => foundQ.question_id === id);
        if (!q) return null;

        // הזרקת השאלה הדינמית מה-revenue_model
        if (id === 'REVENUE_MODEL_CHALLENGE') {
          return {
            ...q,
            question_text: `I noticed your revenue model is: "${revenueModelText}". How do you plan to scale this effectively?`
          };
        }
        return q;
      }).filter(Boolean);
     
      const finalQuestions = [
        { question_id: 'OPENING', question_text: `Hi, I'm ${investor.name}. Let's talk about ${venture.name}.` },
        ...baseQuestions
      ];
     
      setQuestions(finalQuestions);
      setConversation([
        { type: 'bot', text: `Meeting started with ${investor.name}.` },
        { type: 'bot', text: finalQuestions[0].question_text }
      ]);
    } catch (error) {
      console.error("Load error:", error);
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

    // ✅ שימוש ב-PitchAnswer (אות גדולה) לשמירה
    if (currentQ.question_id !== 'OPENING') {
        try {
          await PitchAnswer.create({ 
            venture_id: venture.id, 
            investor_id: investor.id, 
            question_id: currentQ.question_id, 
            answer_text: userAnswer 
          });
        } catch(err) { console.error("Save error:", err); }
    }

    const nextIdx = currentQuestionIndex + 1;
    if (nextIdx < questions.length) {
      setTimeout(() => {
        setConversation(prev => [...prev, { type: 'bot', text: questions[nextIdx].question_text }]);
        setCurrentQuestionIndex(nextIdx);
        setIsAnswering(false);
      }, 800);
    } else {
      setIsFinished(true);
      setTimeout(onClose, 1500);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl h-[80vh] flex flex-col shadow-2xl">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h2 className="font-bold">Pitch Session: {investor?.name}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-black">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin" /></div>
          ) : (
            conversation.map((msg, i) => (
              <div key={i} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-xl ${msg.type === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
                  {msg.text}
                </div>
              </div>
            ))
          )}
          <div ref={chatEndRef} />
        </div>
        {!isFinished && !isLoading && (
          <form onSubmit={handleSendMessage} className="p-4 border-t flex gap-2 bg-white">
            <Textarea value={userInput} onChange={(e) => setUserInput(e.target.value)} placeholder="Your answer..." className="flex-1 min-h-[50px]" />
            <Button type="submit" disabled={isAnswering} className="h-full"><Send size={18} /></Button>
          </form>
        )}
      </div>
    </div>
  );
}