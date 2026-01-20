"use client";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Investor, MasterQuestion, PitchAnswer, Venture, VentureMessage, businessPlan } from '@/api/entities.js';
import { InvokeLLM } from '@/api/integrations';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send, User, Bot } from 'lucide-react';

const COMPETITOR_QUESTIONS_BANK = [
  { question_id: 'COMPETITOR_CHALLENGE_1', question_text: "Look, I invest in a lot of companies and I see this pattern repeatedly... How confident are you that you really understand who you're up against?" },
  { question_id: 'COMPETITOR_CHALLENGE_2', question_text: "Walk me through your competitive analysis. Who are you really competing against for customers' attention?" },
  { question_id: 'COMPETITOR_CHALLENGE_3', question_text: "Beyond the obvious players, what are the real alternatives your customers are considering?" }
];

export default function PitchModal({ investor, venture, isOpen, onClose }) {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [conversation, setConversation] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAnswering, setIsAnswering] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [localInvestor] = useState(investor);
  const chatEndRef = useRef(null);
  const answersRef = useRef([]);
  const isInitialLoadDone = useRef(false);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [conversation]);

  const loadQuestions = useCallback(async () => {
    if (!localInvestor?.assigned_question_ids || isInitialLoadDone.current) return;
    isInitialLoadDone.current = true;
    setIsLoading(true);
    try {
      const plans = await businessPlan.filter({ venture_id: venture.id });
      const plan = plans[0];
      const ids = localInvestor.assigned_question_ids;
      const results = await Promise.all(ids.map(id => MasterQuestion.filter({ 'question_id': id })));
      const dbQuestions = results.flat().filter(Boolean);

      // הגדרת השאלות לפי הסדר
      const greeting = { question_id: 'GREETING', question_text: `Hi, I'm ${localInvestor.name}. How are you today?` };
      const opening = { question_id: 'OPENING', question_text: `Nice to meet you. I've gone over your business plan for '${venture.name}' and have a few questions. How did you personally come up with this concept?` };
      const solution = { question_id: 'SOLUTION', question_text: `What is the biggest technical challenge in building this, and how will you overcome it?` };
      const randomComp = COMPETITOR_QUESTIONS_BANK[Math.floor(Math.random() * COMPETITOR_QUESTIONS_BANK.length)];
      
      const finalQuestions = [greeting, opening, solution, randomComp].filter(Boolean);
      setQuestions(finalQuestions);
      setConversation([{ type: 'bot', text: greeting.question_text }]);
    } catch (error) {
      console.error("Load error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [localInvestor, venture.id, venture.name]);

  useEffect(() => {
    if (isOpen) {
      isInitialLoadDone.current = false;
      setConversation([]);
      setIsFinished(false);
      setCurrentQuestionIndex(0);
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
    
    answersRef.current.push({ question_id: questions[currentQuestionIndex].question_id, answer_text: userAnswer });
    
    setTimeout(() => {
      const nextIndex = currentQuestionIndex + 1;
      if (nextIndex < questions.length) {
        // המפתח לשינוי שביקשת: אם זו הברכה, מדלגים על ה-Ack
        if (questions[currentQuestionIndex].question_id === 'GREETING') {
          setConversation(prev => [...prev, { type: 'bot', text: questions[nextIndex].question_text }]);
        } else {
          const acks = ["I see.", "Got it.", "Makes sense."];
          const randomAck = acks[Math.floor(Math.random() * acks.length)];
          setConversation(prev => [...prev, { type: 'bot', text: randomAck }, { type: 'bot', text: questions[nextIndex].question_text }]);
        }
        setCurrentQuestionIndex(nextIndex);
        setIsAnswering(false);
      } else {
        setConversation(prev => [...prev, { type: 'bot', text: "Thank you. I'll evaluate everything and let you know." }]);
        setIsFinished(true);
        setTimeout(onClose, 3000);
      }
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 text-black">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl h-[80vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-lg">
          <h2 className="text-xl font-bold">Meeting with {localInvestor.name}</h2>
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoading ? <Loader2 className="animate-spin mx-auto mt-10" /> : conversation.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3 rounded-lg ${msg.type === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
        {!isFinished && !isLoading && (
          <form onSubmit={handleSendMessage} className="p-4 border-t flex gap-2">
            <Textarea value={userInput} onChange={(e) => setUserInput(e.target.value)} placeholder="Your answer..." className="flex-1" />
            <Button type="submit" disabled={!userInput.trim() || isAnswering}><Send /></Button>
          </form>
        )}
      </div>
    </div>
  );
}