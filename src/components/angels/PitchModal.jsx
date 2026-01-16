"use client";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Investor, MasterQuestion, PitchAnswer, Venture, VentureMessage } from '@/api/entities.js';
import { InvokeLLM } from '@/api/integrations';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send, User, Bot } from 'lucide-react';

// ✅ וריאציות לשאלת המתחרים כדי למנוע שיעמום
const COMPETITOR_VARIANTS = [
  {
    question_id: 'COMPETITOR_CHALLENGE',
    question_text: "Look, I see this pattern repeatedly - entrepreneurs think they have a unique idea, but there are always competitors they don't know about. How confident are you that you really understand who you're up against? And what happens when you discover there's more competition than you thought?"
  },
  {
    question_id: 'COMPETITOR_CHALLENGE',
    question_text: "The market is crowded, even if it doesn't look like it. If a big tech player or a well-funded startup decided to pivot into your exact niche tomorrow, what's your actual 'moat'? Do you really know your competition well enough to survive that?"
  },
  {
    question_id: 'COMPETITOR_CHALLENGE',
    question_text: "I've heard 'we have no direct competitors' too many times. Usually, it just means the founder hasn't looked hard enough. Talk to me about the indirect threats—the companies solving the same problem differently. How do you stay ahead of them?"
  }
];

// ✅ מערך תגובות מגוון לבוט
const BOT_ACKNOWLEDGMENTS = [
  "I see, thanks for explaining that.",
  "Interesting perspective. Let's move on.",
  "Got it. That makes sense.",
  "I understand your point. Next question:",
  "Clear enough. I'd like to ask about something else now.",
  "Helpful context, thank you."
];

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
  const isInitialLoadDone = useRef(false);

  const loadQuestions = useCallback(async () => {
    if (!localInvestor?.assigned_question_ids || isInitialLoadDone.current) return;
    
    isInitialLoadDone.current = true;
    setIsLoading(true);

    try {
      const ids = localInvestor.assigned_question_ids;
      const results = await Promise.all(ids.map(id => MasterQuestion.filter({ 'question_id': id })));
      const fetchedQuestions = results.flat().filter(Boolean);
      
      const baseQuestions = ids
        .map(id => fetchedQuestions.find(q => q.question_id === id))
        .filter(Boolean);
      
      // ✅ בחירת וריאציה אקראית לשאלת המתחרים
      const randomCompetitorQ = COMPETITOR_VARIANTS[Math.floor(Math.random() * COMPETITOR_VARIANTS.length)];
      
      const insertPosition = Math.floor(Math.random() * (baseQuestions.length + 1));
      const finalQuestions = [
        ...baseQuestions.slice(0, insertPosition),
        randomCompetitorQ,
        ...baseQuestions.slice(insertPosition)
      ];
      
      setQuestions(finalQuestions);
      
      setConversation([{ 
        type: 'bot', 
        text: `Hi, I'm ${localInvestor.name}. I've reviewed your materials and have a few specific questions for you.` 
      }]);
      
      setTimeout(() => {
        setConversation(prev => [...prev, { type: 'bot', text: finalQuestions[0].question_text }]);
      }, 1500);

    } catch (error) {
      console.error(error);
      isInitialLoadDone.current = false;
    } finally {
      setIsLoading(false);
    }
  }, [localInvestor]);

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
  }, [isOpen, localInvestor, loadQuestions]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!userInput.trim() || isAnswering) return;

    setIsAnswering(true);
    const userAnswer = userInput;
    setUserInput('');
    setConversation(prev => [...prev, { type: 'user', text: userAnswer }]);
    
    answersRef.current.push({
      question_id: questions[currentQuestionIndex].question_id,
      answer_text: userAnswer
    });

    setTimeout(() => {
      const nextIndex = currentQuestionIndex + 1;
      
      if (nextIndex < questions.length) {
        // ✅ בחירת תגובה אקראית מהמערך
        const randomAck = BOT_ACKNOWLEDGMENTS[Math.floor(Math.random() * BOT_ACKNOWLEDGMENTS.length)];
        
        setConversation(prev => [
          ...prev, 
          { type: 'bot', text: randomAck },
          { type: 'bot', text: questions[nextIndex].question_text }
        ]);
        setCurrentQuestionIndex(nextIndex);
        setIsAnswering(false);
      } else {
        setConversation(prev => [
          ...prev, 
          { type: 'bot', text: "Thank you for the transparency. I've got what I need to make a decision now." }
        ]);
        setIsFinished(true);
        // evaluateAndMakeDecision();
      }
    }, 1000);
  };

  // ... (שאר ה-JSX נשאר אותו דבר)
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