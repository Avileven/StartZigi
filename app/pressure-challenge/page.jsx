"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Venture } from '@/api/entities.js';
import { VentureMessage } from '@/api/entities.js';
import { User } from '@/api/entities.js';
import { InvokeLLM } from '@/src/api/integrations';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Send, User as UserIcon, Bot, Target, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createPageUrl } from '@/utils';

const CORE_QUESTION = `Look, I invest in a lot of companies and I see this pattern repeatedly - entrepreneurs come in thinking they have a unique idea, but there are always competitors they don't know about. Sometimes it's an established player expanding into their space, sometimes it's another startup pivoting, sometimes it's a big tech company building this internally. How confident are you that you really understand who you're up against? And more importantly - what happens to your business when you discover there's more competition than you thought?`;

const TIME_PRESSURE_MESSAGES = [
  { delay: 30000, text: "Hmm... need a moment to think about this?" },
  { delay: 60000, text: "This is a pretty basic question about your market..." },
  { delay: 90000, text: "I'm starting to lose interest here..." },
  { delay: 120000, text: "Okay, let's move on. Thanks for your time.", isTimeout: true }
];

const EVALUATION_PROMPT = `SYSTEM PROMPT: Angel Investor Competitor Challenge v2.0

CORE Question:
"Look, I invest in a lot of companies and I see this pattern repeatedly - entrepreneurs come in thinking they have a unique idea, but there are always competitors they don't know about. Sometimes it's an established player expanding into their space, sometimes it's another startup pivoting, sometimes it's a big tech company building this internally. How confident are you that you really understand who you're up against? And more importantly - what happens to your business when you discover there's more competition than you thought?"

RESPONSE EVALUATION FRAMEWORK
IMPORTANT: Time pressure is ONLY psychological. Response quality is evaluated purely on content, regardless of how long it took to respond.

SCORING DIMENSIONS (1-10 each):
SPECIFICITY (30% weight):
- 1-3: Vague generalizations ("we're different", "better quality")
- 4-6: Some specifics but mostly general claims
- 7-10: Concrete details, numbers, examples, specific use cases

CREDIBILITY (40% weight):
- 1-3: Obviously fabricating, contradicts original pitch, unrealistic claims
- 4-6: Plausible but unverifiable claims, some hedge words
- 7-10: Honest admissions, verifiable claims, or realistic differentiation

STRATEGIC THINKING (30% weight):
- 1-3: No clear strategy, scattered thoughts, missing the point
- 4-6: Basic understanding, surface-level differences
- 7-10: Deep strategic insight, clear competitive positioning, market awareness

CALCULATION
final_score = (specificity * 0.3) + (credibility * 0.4) + (strategic_thinking * 0.3)
// Round to 1 decimal place, scale to 1-10

OUTPUT FORMAT: Provide a score for each dimension, the final calculated score, and a 2-3 sentence overall assessment. Respond in this EXACT format, with no extra text or pleasantries:

Specificity: [score]/10
Credibility: [score]/10
Strategic Thinking: [score]/10
Final Score: [calculated score]/10

Overall Assessment: [2-3 sentence summary of performance]`;

export default function PressureChallenge() {
  const [venture, setVenture] = useState(null);
  const [conversation, setConversation] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAnswering, setIsAnswering] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [isVCFollowUp, setIsVCFollowUp] = useState(false);
  const [followUpParams, setFollowUpParams] = useState(null);
  const [challengeAlreadyCompleted, setChallengeAlreadyCompleted] = useState(false);
  const chatEndRef = useRef(null);
  const timerRefs = useRef([]);
  const router = useRouter();

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  const handleTimeout = useCallback(async () => {
    if (isVCFollowUp && venture && followUpParams) {
      try {
        const originalMessage = await VentureMessage.get(followUpParams.messageId);
        if (originalMessage) {
          await VentureMessage.create({
            venture_id: venture.id,
            message_type: 'system',
            title: `Investment Decision from ${originalMessage.vc_firm_name}`,
            content: `Unfortunately, we have to pass at this time. We did not receive a response during our follow-up call.`,
            phase: venture.phase,
            priority: 2,
            vc_firm_id: originalMessage.vc_firm_id,
            vc_firm_name: originalMessage.vc_firm_name,
            vc_stage: 'stage_3_rejected'
          });
          await VentureMessage.update(followUpParams.messageId, { is_dismissed: true });
          setTimeout(() => navigate(createPageUrl('Dashboard')), 3000);
        }
      } catch (error) {
        console.error("Error handling VC follow-up timeout:", error);
        setConversation(prev => [...prev, { type: 'bot', text: "An error occurred during follow-up processing." }]);
      }
    }
    setIsFinished(true);
  }, [isVCFollowUp, venture, followUpParams, navigate]);

  const startTimePressure = useCallback(() => {
    timerRefs.current.forEach(timer => clearTimeout(timer));
    timerRefs.current = [];

    TIME_PRESSURE_MESSAGES.forEach((message) => {
      const timer = setTimeout(() => {
        if (isFinished) return; // Prevent further pressure messages if challenge is already finished
        if (message.isTimeout) {
          setHasTimedOut(true);
          setConversation(prev => [...prev, { type: 'bot', text: message.text }]);
          handleTimeout();
        } else {
          setConversation(prev => [...prev, { type: 'bot', text: message.text }]);
        }
      }, message.delay);
      
      timerRefs.current.push(timer);
    });
  }, [isFinished, handleTimeout]);

  const startChallenge = useCallback(() => {
    setConversation([]);
    setUserInput('');
    setIsAnswering(false);
    setIsFinished(false);
    setHasTimedOut(false);
    setEvaluation(null);
    setChallengeAlreadyCompleted(false);

    if (!venture) return; // Add a guard clause

    const introText = isVCFollowUp
      ? `Thanks for joining the follow-up call. As we discussed, I have one final question for you.`
      : `Hello. I'm an angel investor considering your venture "${venture.name}". I have one specific question that I ask every entrepreneur I meet.`;
    
    setConversation([{ type: 'bot', text: introText }]);
    
    setTimeout(() => {
      setConversation(prev => [...prev, { type: 'bot', text: CORE_QUESTION }]);
      startTimePressure();
    }, 2000);
  }, [isVCFollowUp, venture, startTimePressure]);


  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const vcFollowUp = urlParams.get('vcFollowUp') === 'true';
    const messageId = urlParams.get('messageId');
    const firmId = urlParams.get('firmId');

    if (vcFollowUp && messageId && firmId) {
      setIsVCFollowUp(true);
      setFollowUpParams({ messageId, firmId });
    }

    const loadVenture = async () => {
      try {
        const user = await User.me();
        const ventures = await Venture.filter({ created_by: user.email }, "-created_date");
        if (ventures.length > 0) {
          const currentVenture = ventures[0];
          setVenture(currentVenture); // Ensure venture state is set for the challenge
          
          if (!vcFollowUp && currentVenture.pressure_challenge_completed) {
            setEvaluation(currentVenture.pressure_challenge_evaluation);
            setIsFinished(true);
            setChallengeAlreadyCompleted(true);
            setConversation([
              { type: 'bot', text: `You have already completed the Pressure Challenge. Your score was ${currentVenture.pressure_challenge_score}/10.` }
            ]);
          }
          // No else block here for startChallenge, it will be handled by the new useEffect
        } else {
          setConversation([{ type: 'bot', text: "No venture found. Please create a venture first." }]);
          setIsFinished(true);
        }
      } catch (error) {
        console.error("Error loading venture:", error);
        setConversation([{ type: 'bot', text: "Error loading venture data." }]);
        setIsFinished(true);
      }
      setIsLoading(false);
    };

    loadVenture();
    
    return () => {
      timerRefs.current.forEach(timer => clearTimeout(timer));
    };
  }, []); // Removed startChallenge from dependency array

  useEffect(() => {
    if (venture && !challengeAlreadyCompleted) {
      startChallenge();
    }
  }, [venture, challengeAlreadyCompleted, startChallenge]);

  const handleRestartChallenge = async () => {
    if (!venture) return;
    setIsLoading(true);
    try {
      await Venture.update(venture.id, {
        pressure_challenge_completed: false,
        pressure_challenge_evaluation: null,
        pressure_challenge_score: null
      });
      // Re-fetch venture to ensure state is fresh before starting
      const updatedVenture = await Venture.get(venture.id);
      if (updatedVenture) {
        setVenture(updatedVenture); // Update the local venture state
        startChallenge(); // Call without argument, relies on state `venture`
      } else {
        console.error("Failed to re-fetch updated venture after reset.");
      }
    } catch (error) {
      console.error("Error restarting challenge:", error);
      setConversation(prev => [...prev, { type: 'bot', text: "An error occurred while trying to restart the challenge." }]);
      setIsFinished(true); // Prevent further interaction if restart failed
    }
    setIsLoading(false);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!userInput.trim() || isAnswering || hasTimedOut || isFinished || challengeAlreadyCompleted) return;

    timerRefs.current.forEach(timer => clearTimeout(timer));
    timerRefs.current = [];

    setIsAnswering(true);
    const userAnswer = userInput.trim();
    setUserInput('');
    setConversation(prev => [...prev, { type: 'user', text: userAnswer }]);

    setTimeout(() => {
      setConversation(prev => [...prev, { type: 'bot', text: "Thank you for your response. Let me evaluate your answer..." }]);
      
      setTimeout(async () => {
        try {
          const evaluationPrompt = `${EVALUATION_PROMPT}\n\nVENTURE CONTEXT:\nName: ${venture.name}\nDescription: ${venture.description}\nProblem: ${venture.problem}\nSolution: ${venture.solution}\n\nENTREPRENEUR'S RESPONSE:\n"${userAnswer}"`;

          const evaluationResponse = await InvokeLLM({ 
            prompt: evaluationPrompt
          });

          setEvaluation(evaluationResponse);
          
          const scoreMatch = evaluationResponse.match(/Final Score:\s*(\d+(?:\.\d+)?)/);
          const finalScore = scoreMatch ? parseFloat(scoreMatch[1]) : 0;

          if (isVCFollowUp && venture && followUpParams) {
            const originalMessage = await VentureMessage.get(followUpParams.messageId);
            const passThreshold = 4.0;

            if (finalScore >= passThreshold) {
              await VentureMessage.create({
                venture_id: venture.id,
                message_type: 'investment_offer',
                title: `💰 Investment Proposal from ${originalMessage.vc_firm_name}`,
                content: `Thank you for the follow-up. Your response has given us the confidence to move forward. We are pleased to present our investment proposal for ${venture.name}.\n\nPlease review the terms below.`,
                phase: venture.phase,
                priority: 4,
                vc_firm_id: originalMessage.vc_firm_id,
                vc_firm_name: originalMessage.vc_firm_name,
                vc_stage: 'investment_proposal',
                investment_offer_checksize: originalMessage.pending_investment_offer_checksize,
                investment_offer_valuation: originalMessage.pending_investment_offer_valuation,
                investment_offer_status: 'pending'
              });
               setConversation(prev => [...prev, { type: 'bot', text: "Your response was sufficient. We will be sending our investment proposal to your dashboard." }]);
            } else {
              await VentureMessage.create({
                venture_id: venture.id,
                message_type: 'system',
                title: `Investment Decision from ${originalMessage.vc_firm_name}`,
                content: `Thank you for your time. After final consideration, we've decided that this isn't the right fit for us at the moment. We wish you the best of luck.`,
                phase: venture.phase,
                priority: 2,
                vc_firm_id: originalMessage.vc_firm_id,
                vc_firm_name: originalMessage.vc_firm_name,
                vc_stage: 'stage_3_rejected'
              });
              setConversation(prev => [...prev, { type: 'bot', text: "Thank you for your time. We will be sending our final decision to your dashboard." }]);
            }
            await VentureMessage.update(followUpParams.messageId, { is_dismissed: true });
            
            setTimeout(() => navigate(createPageUrl('Dashboard')), 3000);

          } else {
             await Venture.update(venture.id, {
                pressure_challenge_evaluation: evaluationResponse,
                pressure_challenge_score: finalScore,
                pressure_challenge_completed: true
              });
              setConversation(prev => [...prev, { 
                type: 'bot', 
                text: `I've completed my evaluation. You can see the detailed breakdown below.` 
              }]);
          }

        } catch (error) {
          console.error("Error evaluating response:", error);
          setConversation(prev => [...prev, { 
            type: 'bot', 
            text: "There was an error processing your response. Please try again later." 
          }]);
        }
        
        setIsFinished(true);
        setIsAnswering(false);
      }, 3000);
    }, 1000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Pressure Challenge</h1>
          <p className="text-gray-600">Test your ability to articulate your competitive positioning under pressure</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <Card className="h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle>Angel Investor Meeting</CardTitle>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col">
                <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                  {conversation.map((msg, index) => (
                    <div key={index} className={`flex items-start gap-3 ${msg.type === 'user' ? 'justify-end' : ''}`}>
                      {msg.type === 'bot' && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-red-500 to-orange-600 flex items-center justify-center flex-shrink-0">
                          <Bot className="w-5 h-5 text-white"/>
                        </div>
                      )}
                      <div className={`max-w-md p-3 rounded-lg shadow-sm ${msg.type === 'user' ? 'bg-blue-500 text-white rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-bl-none'}`}>
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                      </div>
                      {msg.type === 'user' && (
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                          <UserIcon className="w-5 h-5 text-white"/>
                        </div>
                      )}
                    </div>
                  ))}

                  {isAnswering && !isFinished && (
                    <div className="flex justify-start">
                       <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                    </div>
                  )}

                  <div ref={chatEndRef} />
                </div>

                {!isFinished && !hasTimedOut && !challengeAlreadyCompleted && (
                  <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <Textarea
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      placeholder="Type your answer..."
                      className="flex-1 resize-none min-h-[60px]"
                      disabled={isAnswering}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(e);
                        }
                      }}
                    />
                    <Button type="submit" disabled={!userInput.trim() || isAnswering} size="icon">
                      <Send className="w-4 h-4" />
                    </Button>
                  </form>
                )}

                {challengeAlreadyCompleted && (
                  <div className="text-center p-4">
                    <p className="text-gray-600 mb-4">You have already completed this challenge.</p>
                    <Button onClick={handleRestartChallenge}>
                      <RefreshCw className="w-4 h-4 mr-2"/>
                      Take Challenge Again
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Evaluation Results */}
          <div className="lg:col-span-1">
            <Card className="h-[600px]">
              <CardHeader>
                <CardTitle>Detailed Evaluation</CardTitle>
              </CardHeader>
              <CardContent className="overflow-y-auto">
                {evaluation ? (
                  <div className="prose prose-sm max-w-none">
                    <pre className="whitespace-pre-wrap text-xs bg-gray-50 p-3 rounded border text-gray-800 font-mono">
                      {evaluation}
                    </pre>
                  </div>
                ) : isFinished && hasTimedOut ? (
                  <div className="text-center text-gray-500 p-4">
                    <p>Challenge timed out. No evaluation available.</p>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 p-4">
                    <p>Complete the challenge to see your detailed evaluation results here.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
