
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Venture } from '@/src/api/entities';
import { User } from '@/src/api/entities';
import { InvokeLLM } from '@/src/api/integrations';
import { 
  Clock, 
  Target,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Bot,
  User as UserIcon
} from 'lucide-react';

const EVALUATION_PROMPT = `You are evaluating an entrepreneur's response to a competitor challenge question. Use this detailed scoring framework:

CORE Question Context:
"Look, I invest in a lot of companies and I see this pattern repeatedly - entrepreneurs come in thinking they have a unique idea, but there are always competitors they don't know about. Sometimes it's an established player expanding into their space, sometimes it's another startup pivoting, sometimes it's a big tech company building this internally. How confident are you that you really understand who you're up against? And more importantly - what happens to your business when you discover there's more competition than you thought?"

MULTI-LAYERED ANALYSIS MODEL

Layer 1: Content Signals Analysis
- Specificity signals: numbers, proper nouns, features, examples
- Credibility signals: hedge words, confidence words, buzzwords, contradictions
- Market knowledge signals: industry terms, competitor mentions, market insights

Layer 2: Response Pattern Recognition
- Honest Admission Pattern: "don't know", "not familiar", "need to research" (Honesty: +5, Preparation: -2, Confidence: -1)
- Specific Differentiation Pattern: "we focus on X while they focus on Y", concrete examples (Strategy: +4, Credibility: +3, Specificity: +3)
- Market Dismissal Pattern: "not really competitors", "market is big enough" (Naivety: +3, Arrogance: +2, Strategic Thinking: -2)
- Tech Superiority Pattern: "better technology", "more advanced", "superior algorithm" (Confidence: +3, Credibility: -1, Risk: +2)
- Deflection Pattern: asking investor questions, changing subject (Unusual: +2, Annoyance: +3, Strategic: -1)

Layer 3: Consistency Cross-Check
- Does claimed differentiation align with original pitch?
- Are new features/capabilities mentioned that weren't in original summary?
- Does response contradict earlier statements?

SCORING DIMENSIONS (1-10 each):

SPECIFICITY (30% weight):
• 1-3: Vague generalizations ("we're different", "better quality")
• 4-6: Some specifics but mostly general claims
• 7-10: Concrete details, numbers, examples, specific use cases

CREDIBILITY (40% weight):
• 1-3: Obviously fabricating, contradicts original pitch, unrealistic claims
• 4-6: Plausible but unverifiable claims, some hedge words
• 7-10: Honest admissions, verifiable claims, or realistic differentiation

STRATEGIC THINKING (30% weight):
• 1-3: No clear strategy, scattered thoughts, missing the point
• 4-6: Basic understanding, surface-level differences
• 7-10: Deep strategic insight, clear competitive positioning, market awareness

CALCULATION: final_score = (specificity * 0.3) + (credibility * 0.4) + (strategic_thinking * 0.3)

INVESTOR RESPONSE GENERATION:
HIGH SCORES (7-10):
• "That's a thoughtful differentiation. How did you identify this market gap?"
• "I can see you've done your homework on the competitive landscape."
• "Interesting positioning. Have you validated this with potential customers?"

MEDIUM SCORES (4-6):
• "I see the difference, but is it significant enough for customers to switch?"
• "That sounds reasonable, though I'd want to see more market validation."
• "How sustainable is this competitive advantage long-term?"

LOW SCORES (1-3):
• "I'm not convinced this is a meaningful differentiation."
• "This market seems more competitive than you realize."
• "That doesn't align with what I know about this space."

TIMEOUT (120 seconds, no response):
• "I think we're done here. Come back when you know your market better."
• "Basic market knowledge is essential. Let's reconnect when you're better prepared."

Please evaluate the response and provide:
1. Individual scores for each dimension (Specificity, Credibility, Strategic Thinking)
2. Final calculated score (1-10, one decimal)
3. Appropriate investor feedback based on the score range
4. Brief explanation of the scoring rationale`;

export default function CompetitorChallenge() {
  const [venture, setVenture] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [challengePhase, setChallengePhase] = useState('start'); // start, responding, evaluating, results
  const [conversation, setConversation] = useState([]);
  const [response, setResponse] = useState('');
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState('');
  const [isOneTimeChallengeTaken, setIsOneTimeChallengeTaken] = useState(false);
  
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [conversation]);
  
  useEffect(() => {
    const loadVentureAndStart = async () => {
      setIsLoading(true);
      try {
        const user = await User.me();
        const userVentures = await Venture.filter({ created_by: user.email }, "-created_date");
        
        if (userVentures.length > 0) {
          const currentVenture = userVentures[0];
          setVenture(currentVenture);
          
          // Check if challenge has been taken before
          if (currentVenture.competitor_challenge_evaluation) {
            setEvaluation(currentVenture.competitor_challenge_evaluation);
            setChallengePhase('results');
            setIsOneTimeChallengeTaken(true);
          } else {
            setChallengePhase('start');
          }
        } else {
          // No venture found, set phase to start (will be handled by the !venture condition)
          setChallengePhase('start'); 
        }
      } catch (error) {
        console.error('Error loading venture:', error);
        setChallengePhase('start'); // Fallback in case of error
      }
      setIsLoading(false);
    };

    loadVentureAndStart();
  }, []);

  const handleTimeout = useCallback(async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    setChallengePhase('evaluating');
    setIsEvaluating(true);
    
    const timeoutFeedback = `TIMEOUT (120 seconds, no response):

COMPETITOR CHALLENGE EVALUATION:
Specificity: 1/10 - No response provided within time limit
Credibility: 1/10 - Unable to articulate competitive understanding
Strategic Thinking: 1/10 - No strategic response to competitive concerns
Final Score: 1.0/10

INVESTOR FEEDBACK: I think we're done here. Come back when you know your market better. Basic market knowledge is essential.`;
    
    if (venture) {
      await Venture.update(venture.id, { competitor_challenge_evaluation: timeoutFeedback });
    }
    setEvaluation(timeoutFeedback);
    setChallengePhase('results');
    setIsOneTimeChallengeTaken(true);
    setIsEvaluating(false);
  }, [venture]);

  useEffect(() => {
    if (challengePhase === 'responding') {
      startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setTimeElapsed(elapsed);
        
        // Time pressure messages
        if (elapsed === 30) {
          setConversation(prev => [...prev, { type: 'bot', text: "Hmm... need a moment to think about this?" }]);
        } else if (elapsed === 60) {
          setConversation(prev => [...prev, { type: 'bot', text: "This is a pretty basic question about your market..." }]);
        } else if (elapsed === 90) {
          setConversation(prev => [...prev, { type: 'bot', text: "I'm starting to lose interest here..." }]);
        } else if (elapsed === 120) {
          handleTimeout();
        }
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [challengePhase, handleTimeout]);

  const startChallenge = () => {
    setChallengePhase('responding');
    setConversation([
      { type: 'bot', text: "Look, I invest in a lot of companies and I see this pattern repeatedly - entrepreneurs come in thinking they have a unique idea, but there are always competitors they don't know about. Sometimes it's an established player expanding into their space, sometimes it's another startup pivoting, sometimes it's a big tech company building this internally. How confident are you that you really understand who you're up against? And more importantly - what happens to your business when you discover there's more competition than you thought?" }
    ]);
    setTimeElapsed(0); // Reset timer
  };

  const handleSubmitResponse = async () => {
    if (!response.trim() || !venture) return;
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    setChallengePhase('evaluating');
    setIsEvaluating(true);
    
    setConversation(prev => [...prev, 
      { type: 'user', text: response },
      { type: 'bot', text: "Thank you for your response. Let me evaluate your understanding of the competitive landscape..." }
    ]);
    setResponse(''); // Clear the input field after sending

    try {
      const evaluationPrompt = `${EVALUATION_PROMPT}

VENTURE CONTEXT:
Name: ${venture.name || 'Unknown'}
Description: ${venture.description || 'N/A'}
Problem: ${venture.problem || 'N/A'}
Solution: ${venture.solution || 'N/A'}

ENTREPRENEUR'S RESPONSE:
"${response}"`;

      const result = await InvokeLLM({ prompt: evaluationPrompt });
      
      await Venture.update(venture.id, { competitor_challenge_evaluation: result });
      
      setEvaluation(result);
      setChallengePhase('results');
      setIsOneTimeChallengeTaken(true);
    } catch (error) {
      console.error("Error evaluating response:", error);
      setEvaluation("Error occurred during evaluation. Please try again.");
      setChallengePhase('results'); // Even if error, go to results to show error message
    }
    
    setIsEvaluating(false);
  };

  const handleRestart = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    // Reset all state for testing purposes
    setChallengePhase('start');
    setConversation([]);
    setResponse('');
    setTimeElapsed(0);
    setIsEvaluating(false);
    setEvaluation('');
    setIsOneTimeChallengeTaken(false);
    
    // Optionally clear the evaluation from the backend for a true restart
    if (venture) {
      await Venture.update(venture.id, { competitor_challenge_evaluation: null });
      setVenture(prev => prev ? { ...prev, competitor_challenge_evaluation: null } : null);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!venture && !isLoading) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="text-center p-8">
            <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Active Venture Found</h2>
            <p className="text-gray-600">You need to create a venture first to take the Competitor Challenge.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (challengePhase === 'results') {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8 flex justify-center items-center">
        <Card className="w-full max-w-4xl h-[80vh] flex flex-col shadow-2xl">
          <CardHeader className="flex flex-row justify-between items-center border-b p-4">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <CheckCircle className="w-6 h-6 text-green-600" />
              Competitor Challenge - Results
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                {evaluation || "No evaluation found."}
              </pre>
            </div>
            
            <div className="flex gap-4">
              <Button onClick={() => window.history.back()} variant="outline">
                Back to Dashboard
              </Button>
              <Button onClick={handleRestart} className="bg-blue-600 hover:bg-blue-700">
                Take Challenge Again (Testing)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 flex justify-center items-center">
      <Card className="w-full max-w-2xl h-[80vh] flex flex-col shadow-2xl">
        <CardHeader className="flex flex-row justify-between items-center border-b p-4">
           <CardTitle className="flex items-center gap-2 text-lg font-semibold">
             <Target className="w-5 h-5 text-indigo-600"/>
             Competitor Analysis
           </CardTitle>
           {challengePhase === 'responding' && (
             <div className="flex items-center gap-2">
               <Clock className="w-4 h-4 text-gray-500" />
               <span className="text-sm text-gray-600">{timeElapsed}s</span>
               <div className="w-20">
                 <Progress value={(timeElapsed / 120) * 100} className="h-2" />
               </div>
             </div>
           )}
        </CardHeader>
        
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {challengePhase === 'start' && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <h2 className="text-2xl font-bold mb-4">Competitor Challenge</h2>
              <p className="text-gray-600 mb-6">
                Test your understanding of the competitive landscape. An investor will pose a challenge, and you'll have 120 seconds to respond.
              </p>
              <Button onClick={startChallenge} className="bg-green-600 hover:bg-green-700">
                Start Challenge
              </Button>
            </div>
          )}

          {(challengePhase === 'responding' || challengePhase === 'evaluating') && (
            <>
              {conversation.map((msg, index) => (
                <div key={index} className={`flex items-start gap-3 my-4 ${msg.type === 'user' ? 'justify-end' : ''}`}>
                  {msg.type === 'bot' && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-5 h-5 text-white"/>
                    </div>
                  )}
                  <div className={`max-w-md p-3 rounded-lg ${msg.type === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}>
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>
                  {msg.type === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                      <UserIcon className="w-5 h-5 text-white"/>
                    </div>
                  )}
                </div>
              ))}
            </>
          )}

          {challengePhase === 'evaluating' && (
            <div className="flex justify-center items-center p-4">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              <p className="text-gray-600">Evaluating your response...</p>
            </div>
          )}
          
          <div ref={chatEndRef} />
        </CardContent>

        {challengePhase === 'responding' && (
          <div className="p-4 border-t">
            <div className="flex items-center gap-2">
              <Textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="Type your response here..."
                className="flex-1 resize-none"
                disabled={challengePhase !== 'responding'}
                 onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmitResponse();
                  }
                }}
              />
              <Button onClick={handleSubmitResponse} disabled={!response.trim() || challengePhase !== 'responding'}>
                Send
              </Button>
            </div>
          </div>
        )}

      </Card>
    </div>
  );
}
