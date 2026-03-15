"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Venture, VentureMessage, User } from '@/api/entities.js';
import { InvokeLLM } from '@/api/integrations';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send, User as UserIcon, Bot, RefreshCw, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

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

OUTPUT FORMAT:
Specificity: [score]/10
Credibility: [score]/10
Strategic Thinking: [score]/10
Final Score: [calculated score]/10

Overall Assessment: [2-3 sentence summary]`;

export default function PressureChallenge() {
  const [venture, setVenture] = useState(null);
  const [conversation, setConversation] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAnswering, setIsAnswering] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const [isVCFollowUp, setIsVCFollowUp] = useState(false);
  const [followUpParams, setFollowUpParams] = useState(null);
  const [challengeAlreadyCompleted, setChallengeAlreadyCompleted] = useState(false);
  const chatEndRef = useRef(null);
  const timerRefs = useRef([]);
  const router = useRouter();
  const searchParams = useSearchParams();

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  const handleTimeout = useCallback(async () => {
    if (isVCFollowUp && venture && followUpParams) {
      try {
        const vcFirmId = followUpParams.firmId || followUpParams.vcFirmId;
        const vcFirmName = followUpParams.vcFirmName || 'the VC firm';
        await VentureMessage.create({
          venture_id: venture.id,
          message_type: 'system',
          title: `Investment Decision from ${vcFirmName}`,
          content: `Unfortunately, we have to pass at this time. We did not receive a response during our follow-up call.`,
          phase: venture.phase,
          priority: 2,
          vc_firm_id: vcFirmId,
          vc_firm_name: vcFirmName,
          vc_stage: 'stage_3_rejected'
        });
        setTimeout(() => router.push('/dashboard'), 3000);
      } catch (error) {
        console.error("Error handling VC follow-up timeout:", error);
      }
    }
    setIsFinished(true);
  }, [isVCFollowUp, venture, followUpParams, router]);

  const startTimePressure = useCallback(() => {
    timerRefs.current.forEach(timer => clearTimeout(timer));
    timerRefs.current = [];
    TIME_PRESSURE_MESSAGES.forEach((message) => {
      const timer = setTimeout(() => {
        if (isFinished) return;
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

  const startChallenge = useCallback((currentVenture, vcFollowUp, vcFirmName) => {
    setConversation([]);
    setUserInput('');
    setIsAnswering(false);
    setIsFinished(false);
    setHasTimedOut(false);
    setChallengeAlreadyCompleted(false);

    const introText = vcFollowUp
      ? `Thanks for joining the follow-up call. As we discussed, I have one final question for you.`
      : `Hello. I'm an angel investor considering your venture "${currentVenture.name}". I have one specific question that I ask every entrepreneur I meet.`;

    setConversation([{ type: 'bot', text: introText }]);
    setTimeout(() => {
      setConversation(prev => [...prev, { type: 'bot', text: CORE_QUESTION }]);
      startTimePressure();
    }, 2000);
  }, [startTimePressure]);

  useEffect(() => {
    const vcFollowUp = searchParams.get('vcFollowUp') === 'true';
    const messageId = searchParams.get('messageId');
    const firmId = searchParams.get('firmId') || searchParams.get('vcFirmId');
    const vcFirmName = searchParams.get('vcFirmName') ? decodeURIComponent(searchParams.get('vcFirmName')) : null;

    if (vcFollowUp) {
      setIsVCFollowUp(true);
      setFollowUpParams({ messageId, firmId, vcFirmId: firmId, vcFirmName });
    }

    const loadVenture = async () => {
      try {
        const user = await User.me();
        const ventures = await Venture.filter({ created_by: user.email }, "-created_date");
        if (ventures.length > 0) {
          const currentVenture = ventures[0];
          setVenture(currentVenture);

          if (!vcFollowUp && currentVenture.pressure_challenge_completed) {
            setIsFinished(true);
            setChallengeAlreadyCompleted(true);
            setConversation([
              { type: 'bot', text: `You have already completed the Pressure Challenge. Your score was ${currentVenture.pressure_challenge_score}/10.` }
            ]);
          } else {
            startChallenge(currentVenture, vcFollowUp, vcFirmName);
          }
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
    return () => { timerRefs.current.forEach(timer => clearTimeout(timer)); };
  }, [searchParams]);

  const handleRestartChallenge = async () => {
    if (!venture) return;
    setIsLoading(true);
    try {
      await Venture.update(venture.id, {
        pressure_challenge_completed: false,
        pressure_challenge_evaluation: null,
        pressure_challenge_score: null
      });
      const updatedVenture = await Venture.get(venture.id);
      if (updatedVenture) {
        setVenture(updatedVenture);
        startChallenge(updatedVenture, false, null);
      }
    } catch (error) {
      console.error("Error restarting challenge:", error);
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

          // [FIX] InvokeLLM returns {response, usage} — extract .response before calling .match()
          const evaluationResult = await InvokeLLM({ prompt: evaluationPrompt });
          const evaluationResponse = evaluationResult.response || "";

          const scoreMatch = evaluationResponse.match(/Final Score:\s*(\d+(?:\.\d+)?)/);
          const finalScore = scoreMatch ? parseFloat(scoreMatch[1]) : 0;

          if (isVCFollowUp && venture && followUpParams) {
            const vcFirmId = followUpParams.firmId || followUpParams.vcFirmId;
            const vcFirmName = followUpParams.vcFirmName || 'the VC firm';
            const passThreshold = 4.0;

            if (finalScore >= passThreshold) {
              await VentureMessage.create({
                venture_id: venture.id,
                message_type: 'system',
                title: `✅ Follow-Up Passed — ${vcFirmName}`,
                content: `Your response gave us the confidence to move forward. Please check your dashboard for the next step.`,
                phase: venture.phase,
                priority: 4,
                vc_firm_id: vcFirmId,
                vc_firm_name: vcFirmName,
                vc_stage: 'stage_2_passed'
              });
              setConversation(prev => [...prev, { type: 'bot', text: "Your response was sufficient. We will be in touch via your dashboard." }]);
            } else {
              await VentureMessage.create({
                venture_id: venture.id,
                message_type: 'system',
                title: `Investment Decision from ${vcFirmName}`,
                content: `Thank you for your time. After final consideration, we've decided that this isn't the right fit for us at the moment.`,
                phase: venture.phase,
                priority: 2,
                vc_firm_id: vcFirmId,
                vc_firm_name: vcFirmName,
                vc_stage: 'stage_3_rejected'
              });
              setConversation(prev => [...prev, { type: 'bot', text: "Thank you for your time. We will send our final decision to your dashboard." }]);
            }

            if (followUpParams.messageId) {
              await VentureMessage.update(followUpParams.messageId, { is_dismissed: true });
            }
            setTimeout(() => router.push('/dashboard'), 3000);

          } else {
            await Venture.update(venture.id, {
              pressure_challenge_evaluation: evaluationResponse,
              pressure_challenge_score: finalScore,
              pressure_challenge_completed: true
            });
            setConversation(prev => [...prev, {
              type: 'bot',
              text: `I've completed my evaluation. Your score was ${finalScore}/10.`
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

  // Title: venture name + mode
  const pageTitle = venture
    ? isVCFollowUp
      ? `${venture.name} — Follow-Up Meeting`
      : `${venture.name} — Pressure Challenge`
    : isVCFollowUp ? "Follow-Up Meeting" : "Pressure Challenge";

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    // Modal overlay — same pattern as VCMeetingModal
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl h-[80vh] flex flex-col">

        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-lg">
          <h2 className="text-xl font-bold text-gray-900">{pageTitle}</h2>
          <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Chat */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
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

          {isFinished && isAnswering === false && !challengeAlreadyCompleted && (
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-green-800 font-medium">Processing complete. Redirecting to dashboard...</p>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        {!isFinished && !hasTimedOut && !challengeAlreadyCompleted && (
          <div className="p-4 border-t bg-gray-50 rounded-b-lg">
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
          </div>
        )}

        {challengeAlreadyCompleted && (
          <div className="p-4 border-t text-center">
            <p className="text-gray-600 mb-4">You have already completed this challenge.</p>
            <Button onClick={handleRestartChallenge}>
              <RefreshCw className="w-4 h-4 mr-2"/>
              Take Challenge Again
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
