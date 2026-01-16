"use client";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Investor, MasterQuestion, PitchAnswer, Venture, VentureMessage } from '@/api/entities.js';
import { InvokeLLM } from '@/api/integrations';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send, User, Bot } from 'lucide-react';

const COMPETITOR_QUESTION = {
  question_id: 'COMPETITOR_CHALLENGE',
  question_text: "Look, I invest in a lot of companies and I see this pattern repeatedly - entrepreneurs come in thinking they have a unique idea, but there are always competitors they don't know about. Sometimes it's an established player expanding into their space, sometimes it's another startup pivoting, sometimes it's a big tech company building this internally. How confident are you that you really understand who you're up against? And more importantly - what happens to your business when you discover there's more competition than you thought?"
};

// ... (קבועי הפרומפטים והחישובים שלך נשארים ללא שינוי)

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
  // ✅ מנעול קריטי למניעת ריצה כפולה של טעינת השאלות
  const isInitialLoadDone = useRef(false);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  const loadQuestions = useCallback(async () => {
    // ✅ בדיקה אם כבר טענו או שאין נתונים - מונע כפילות שאלות
    if (!localInvestor?.assigned_question_ids || isInitialLoadDone.current) return;
    
    isInitialLoadDone.current = true;
    setIsLoading(true);

    try {
      const ids = localInvestor.assigned_question_ids;
      const fetchPromises = ids.map(id => MasterQuestion.filter({ 'question_id': id }));
      const results = await Promise.all(fetchPromises);
      const fetchedQuestions = results.flat().filter(Boolean);
      
      const baseQuestions = ids
        .map(id => fetchedQuestions.find(q => q.question_id === id))
        .filter(Boolean);
      
      // ✅ יצירת המערך הסופי פעם אחת בלבד (Immutable)
      const insertPosition = Math.floor(Math.random() * (baseQuestions.length + 1));
      const finalQuestions = [
        ...baseQuestions.slice(0, insertPosition),
        COMPETITOR_QUESTION,
        ...baseQuestions.slice(insertPosition)
      ];
      
      setQuestions(finalQuestions);
      
      // ✅ הודעת פתיחה
      setConversation([{ 
        type: 'bot', 
        text: `Hi, I'm ${localInvestor.name}. I've gone over your business plan and have a few questions for you.` 
      }]);
      
      // ✅ שליחת השאלה הראשונה בלבד
      setTimeout(() => {
        setConversation(prev => [
          ...prev, 
          { type: 'bot', text: finalQuestions[0].question_text }
        ]);
      }, 1500);

    } catch (error) {
      console.error("Error loading questions:", error);
      isInitialLoadDone.current = false;
    } finally {
      setIsLoading(false);
    }
  }, [localInvestor]);

  useEffect(() => {
    if (isOpen) {
      // ✅ איפוס מוחלט בכל פתיחה מחדש
      isInitialLoadDone.current = false;
      setQuestions([]);
      setCurrentQuestionIndex(0);
      setConversation([]);
      setIsFinished(false);
      answersRef.current = [];
      
      // טעינת נתונים
      if (localInvestor) loadQuestions();
    }
  }, [isOpen]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!userInput.trim() || isAnswering) return;

    setIsAnswering(true);
    const userAnswer = userInput;
    setUserInput('');
    
    // הצגת תשובת המשתמש בשיחה
    setConversation(prev => [...prev, { type: 'user', text: userAnswer }]);
    
    // שמירה ב-Ref לצרכי החלטת ה-AI בסוף
    const currentQuestion = questions[currentQuestionIndex];
    answersRef.current.push({
      question_id: currentQuestion.question_id,
      answer_text: userAnswer
    });

    // ✅ איחוד הודעות הבוט למניעת "קפיצות" ובלגן ב-State
    setTimeout(() => {
      const nextIndex = currentQuestionIndex + 1;
      
      if (nextIndex < questions.length) {
        setConversation(prev => [
          ...prev, 
          { type: 'bot', text: "I see. Next question:" },
          { type: 'bot', text: questions[nextIndex].question_text }
        ]);
        setCurrentQuestionIndex(nextIndex);
        setIsAnswering(false);
      } else {
        setConversation(prev => [
          ...prev, 
          { type: 'bot', text: "Thank you. I have enough information to make a decision." }
        ]);
        setIsFinished(true);
        // כאן תקרא לפונקציה המקורית שלך evaluateAndMakeDecision();
      }
    }, 1000);
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
          {isLoading ? (
            <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
          ) : (
            conversation.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-lg ${msg.type === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
                  {msg.text}
                </div>
              </div>
            ))
          )}
          <div ref={chatEndRef} />
        </div>

        {!isFinished && !isLoading && (
          <form onSubmit={handleSendMessage} className="p-4 border-t flex gap-2">
            <Textarea 
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              className="flex-1 min-h-[60px]"
              placeholder="Type your answer..."
              disabled={isAnswering}
            />
            <Button type="submit" disabled={isAnswering || !userInput.trim()}>
              {isAnswering ? <Loader2 className="animate-spin" /> : <Send size={18} />}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}