"use client";
import React, { useState, useEffect, useCallback, useRef } from 'react';
// ✅ וידוא שכל הישויות מיובאות באותיות קטנות כפי שמוגדר ב-Entity שלכם
import { investor as investorEntity, masterQuestion, pitchAnswer, venture as ventureEntity, ventureMessage, businessPlan } from '@/api/entities.js';
import { InvokeLLM } from '@/api/integrations';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send, User, Bot } from 'lucide-react';

// --- הגדרות קבועות ---
const COMPETITOR_QUESTIONS_BANK = [
  {
    question_id: 'COMPETITOR_CHALLENGE_1',
    question_text: "How confident are you that you really understand who you're up against? What happens if a tech giant enters your space?"
  }
];

const COMPETITOR_EVALUATION_PROMPT = `Evaluate the entrepreneur's response to the competitor challenge. Provide a 'Final Score: X/10'.`;

// --- פונקציות חישוב ---
const calculateTeamScore = (v) => {
    const founderPoints = (v.founders_count || 1) >= 2 ? 100 : 70;
    const commitmentPoints = v.weekly_commitment === 'high' ? 100 : (v.weekly_commitment === 'medium' ? 50 : 30);
    return (founderPoints * 0.60) + (commitmentPoints * 0.40);
};

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

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  const loadQuestions = useCallback(async () => {
    // 🛑 שגיאה 1 נפתרה: בדיקה שכל האובייקטים קיימים לפני תחילת העבודה
    if (!investor?.assigned_question_ids || !venture?.id || isInitialLoadDone.current) return;
   
    isInitialLoadDone.current = true;
    setIsLoading(true);

    try {
      // 🚀 שליפת המודל העסקי מהטבלה הנכונה
      const plans = await businessPlan.filter({ 'venture_id': venture.id });
      const revenueModelText = plans?.[0]?.revenue_model || "not specified";

      const ids = investor.assigned_question_ids;
      
      // 🛑 שגיאה 2 נפתרה: שימוש ב-masterQuestion (אות קטנה) ב-Promise.all
      const results = await Promise.all(ids.map(id => masterQuestion.filter({ 'question_id': id })));
      const fetchedQuestions = results.flat().filter(Boolean);
     
      const baseQuestions = ids.map(id => {
        const q = fetchedQuestions.find(foundQ => foundQ.question_id === id);
        if (!q) return null;

        if (id === 'REVENUE_MODEL_CHALLENGE') {
          return {
            ...q,
            question_text: `Regarding your business plan: You mentioned a revenue model of "${revenueModelText}". Why is this the most viable path for your startup?`
          };
        }
        return q;
      }).filter(Boolean);
     
      const openingQuestion = {
        question_id: 'OPENING_PERSONAL',
        question_text: `Nice to meet you. What's the story behind '${venture.name}'?`
      };
     
      const randomComp = COMPETITOR_QUESTIONS_BANK[0];
      const insertPos = Math.floor(Math.random() * (baseQuestions.length + 1));
      
      const finalQuestions = [openingQuestion, ...baseQuestions.slice(0, insertPos), randomComp, ...baseQuestions.slice(insertPos)];
     
      competitorQuestionIndexRef.current = insertPos + 1;
      setQuestions(finalQuestions);
     
      setConversation([{ type: 'bot', text: `Hi, I'm ${investor.name}. Let's get started.` }]);
      
      setTimeout(() => {
        setConversation(prev => [...prev, { type: 'bot', text: finalQuestions[0].question_text }]);
      }, 1000);

    } catch (error) {
      console.error("Critical Error in loadQuestions:", error);
    } finally {
      setIsLoading(false);
    }
    // 🛑 שגיאה 3 נפתרה: הוספת כל התלויות ל-useCallback
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

    // 🛑 שגיאה 4 נפתרה: שימוש ב-pitchAnswer (אות קטנה) לשמירה
    if (!currentQ.question_id?.startsWith('COMPETITOR') && currentQ.question_id !== 'OPENING_PERSONAL') {
        try {
          await pitchAnswer.create({ 
            venture_id: venture.id, 
            investor_id: investor.id, 
            question_id: currentQ.question_id, 
            answer_text: userAnswer 
          });
        } catch(err) { console.error("Database save error:", err); }
    }

    setTimeout(() => {
      const nextIdx = currentQuestionIndex + 1;
      if (nextIdx < questions.length) {
        setConversation(prev => [...prev, { type: 'bot', text: questions[nextIdx].question_text }]);
        setCurrentQuestionIndex(nextIdx);
        setIsAnswering(false);
      } else {
        setIsFinished(true);
        evaluateAndMakeDecision();
      }
    }, 1000);
  };

  const evaluateAndMakeDecision = async () => {
    try {
      const compAns = answersRef.current.find(a => a.question_id?.startsWith('COMPETITOR'))?.answer_text;
      let compScore = 5;
      
      if (compAns) {
        const { response } = await InvokeLLM({ prompt: `${COMPETITOR_EVALUATION_PROMPT}\nAnswer: ${compAns}` });
        const match = response.match(/Final Score:\s*(\d+)/i);
        compScore = match ? parseFloat(match[1]) : 5;
      }
     
      const teamScore = calculateTeamScore(venture);
      const effectiveScore = (teamScore * 0.7) + (compScore * 10 * 0.3);
      
      // עדכון הציון בטבלה
      await ventureEntity.update(venture.id, { team_score: effectiveScore });
     
      // יצירת הודעת סיכום
      await ventureMessage.create({
        venture_id: venture.id,
        message_type: 'system',
        title: `Summary from ${investor.name}`,
        content: `Meeting completed. Decision will be sent to your dashboard.`,
        phase: venture.phase
      });
     
      setTimeout(onClose, 2000);
    } catch (error) { 
      console.error("Decision error:", error); 
      onClose(); 
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl h-[80vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">Meeting with {investor?.name}</h2>
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoading ? <Loader2 className="animate-spin mx-auto" /> : (
            conversation.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-3 rounded-lg ${msg.type === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}>
                  {msg.text}
                </div>
              </div>
            ))
          )}
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