import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Investor, MasterQuestion, PitchAnswer, Venture, VentureMessage } from '@/api/entities.js';
import { InvokeLLM } from '@/api/integrations';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send, Bot } from 'lucide-react';

// Competitor challenge variants for AI variety
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

const BOT_ACKNOWLEDGMENTS = [
  "I see, thanks for explaining that.",
  "Interesting perspective. Let's move on.",
  "Got it. That makes sense.",
  "Clear enough. Next point.",
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
  
  const chatEndRef = useRef(null);
  const answersRef = useRef([]);
  const isInitialLoadDone = useRef(false);
  const timePressureTimeoutsRef = useRef([]);

  // Clear all pending timeouts
  const clearAllTimeouts = () => {
    timePressureTimeoutsRef.current.forEach(clearTimeout);
    timePressureTimeoutsRef.current = [];
  };

  // Time pressure mechanism
  const startTimePressure = (questionText) => {
    clearAllTimeouts();
    if (!questionText) return;

    timePressureTimeoutsRef.current.push(setTimeout(() => {
      setConversation(prev => [...prev, { type: 'bot', text: "I'm waiting... time is money here." }]);
    }, 15000));

    timePressureTimeoutsRef.current.push(setTimeout(() => {
      setConversation(prev => [...prev, { type: 'bot', text: "If you don't have an answer, we can stop right now." }]);
    }, 30000));
  };

  // AI Evaluation using the provided API structure
  const evaluateAndMakeDecision = async () => {
    setIsLoading(true);
    try {
      const compAns = answersRef.current.find(a => a.question_id === 'COMPETITOR_CHALLENGE');
      const compQ = questions.find(q => q.question_id === 'COMPETITOR_CHALLENGE');

      const apiKey = ""; // Runtime managed
      const systemPrompt = "Evaluate the entrepreneur's response to the competitor challenge. Assess market realism and strategy. Return JSON: { \"score\": number (1-10), \"analysis\": \"string\" }";
      const userQuery = `Question: ${compQ?.question_text}\nAnswer: ${compAns?.answer_text}`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: userQuery }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: { responseMimeType: "application/json" }
        })
      });

      const resultData = await response.json();
      const rawText = resultData.candidates?.[0]?.content?.parts?.[0]?.text;
      const evaluation = JSON.parse(rawText);

      setConversation(prev => [
        ...prev,
        { type: 'bot', text: `I've finished my analysis. Your market strategy score is ${evaluation.score}/10.` },
        { type: 'bot', text: evaluation.score >= 7 
            ? "I like your depth of thinking. Let's talk numbers—I'm interested in investing." 
            : "To be honest, I don't think you're ready for this market yet. I'll pass." }
      ]);
    } catch (error) {
      console.error("AI Evaluation failed:", error);
      setConversation(prev => [...prev, { type: 'bot', text: "I've heard enough. I need some time to process this. I'll get back to you." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadQuestions = useCallback(async () => {
    if (!investor?.assigned_question_ids || isInitialLoadDone.current) return;
    isInitialLoadDone.current = true;
    setIsLoading(true);

    try {
      const ids = investor.assigned_question_ids;
      const results = await Promise.all(ids.map(id => MasterQuestion.filter({ 'question_id': id })));
      const baseQuestions = results.flat().filter(Boolean);
      
      const randomCompQ = COMPETITOR_VARIANTS[Math.floor(Math.random() * COMPETITOR_VARIANTS.length)];
      const insertPos = Math.floor(Math.random() * (baseQuestions.length + 1));
      const finalQuestions = [...baseQuestions.slice(0, insertPos), randomCompQ, ...baseQuestions.slice(insertPos)];
      
      setQuestions(finalQuestions);
      setConversation([{ type: 'bot', text: `Hi, I'm ${investor.name}. Let's get started.` }]);
      
      setTimeout(() => {
        if (finalQuestions[0]) {
          setConversation(prev => [...prev, { type: 'bot', text: finalQuestions[0].question_text }]);
          startTimePressure(finalQuestions[0].question_text);
        }
        setIsLoading(false);
      }, 1500);
    } catch (e) {
      setIsLoading(false);
      isInitialLoadDone.current = false;
    }
  }, [investor]);

  useEffect(() => {
    if (isOpen) {
      isInitialLoadDone.current = false;
      setQuestions([]);
      setCurrentQuestionIndex(0);
      setConversation([]);
      setIsFinished(false);
      answersRef.current = [];
      loadQuestions();
    }
    return () => clearAllTimeouts();
  }, [isOpen, loadQuestions]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!userInput.trim() || isAnswering) return;

    clearAllTimeouts();
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
        const ack = BOT_ACKNOWLEDGMENTS[Math.floor(Math.random() * BOT_ACKNOWLEDGMENTS.length)];
        setConversation(prev => [
          ...prev, 
          { type: 'bot', text: ack }, 
          { type: 'bot', text: questions[nextIndex].question_text }
        ]);
        setCurrentQuestionIndex(nextIndex);
        setIsAnswering(false);
        startTimePressure(questions[nextIndex].question_text);
      } else {
        setConversation(prev => [...prev, { type: 'bot', text: "Thank you. Let me think for a moment..." }]);
        setIsFinished(true);
        evaluateAndMakeDecision();
      }
    }, 1000);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[85vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h2 className="font-bold text-gray-800">Pitch to {investor.name}</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {conversation.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-4 rounded-2xl ${msg.type === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && <div className="flex justify-center p-4"><Loader2 className="animate-spin text-blue-500" /></div>}
          <div ref={chatEndRef} />
        </div>
        {!isFinished && !isLoading && (
          <form onSubmit={handleSendMessage} className="p-4 border-t flex gap-2">
            <Textarea 
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              className="flex-1 min-h-[80px]"
              placeholder="Enter your answer..."
            />
            <Button type="submit" disabled={isAnswering || !userInput.trim()}><Send size={20} /></Button>
          </form>
        )}
      </div>
    </div>
  );
}