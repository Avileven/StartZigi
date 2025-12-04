"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge'; // Badge is imported but not used in the final code, keeping it for consistency if it was there before.
import { Progress } from '@/components/ui/progress';
import { Venture } from '@/api/entities.js';
import { User } from '@/api/entities.js';
import { InvokeLLM } from '@/api/integrations';
import { 
  Clock, 
  Brain,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Bot,
  User as UserIcon
} from 'lucide-react';

const SYSTEM_PROMPT = `You are an AI system that creates personal leadership challenges for entrepreneurs during investor pitch simulations. Your role is to analyze startup pitches and generate unexpected personal stress tests that evaluate the entrepreneur's mental resilience, self-awareness, and readiness for the entrepreneurial journey.

CHALLENGE GENERATION: Create a personalized leadership stress test using these components:
Industry-Specific Stress Factors:
• Fintech: Regulatory pressure, security breaches, compliance costs
• Healthcare: Long sales cycles, regulatory approval, life-or-death responsibility
• B2B SaaS: High churn rates, competitive pricing pressure, long customer acquisition
• Consumer Apps: User retention challenges, platform dependency, viral growth pressure
• E-commerce: Inventory management, logistics complexity, thin margins
• AI/Deep Tech: Long development cycles, uncertain market adoption, regulatory uncertainty
• ClimateTech/Energy: Capital intensity, regulatory changes, long payback periods
• Web3/Blockchain: Regulatory uncertainty, market volatility, technical complexity

Universal Entrepreneurial Stressors:
• 80-hour weeks for extended periods
• Months without salary/income uncertainty
• Constant rejection from customers and investors
• Team members quitting under pressure
• Multiple pivots and strategic changes
• Public failure and reputation risk
• Family/relationship strain
• Competitor threats and market changes

Focus on psychological/emotional resilience, not technical capabilities. Tailor stress scenarios to the specific industry and venture stage. Present challenge in a confrontational but professional investor voice.`;

const EVALUATION_PROMPT = `You are evaluating an entrepreneur's response to a leadership stress test challenge. Use this detailed scoring framework:

SCORING DIMENSIONS (1-10 each):

AUTHENTICITY (40% weight):
• 9-10: Admits specific fears, shares vulnerable personal examples, genuine emotional honesty
• 7-8: Some honest admission mixed with confidence, shows real self-reflection
• 5-6: Generic honesty, acknowledges challenges but stays surface level
• 3-4: Mostly confident facade with minimal authentic moments
• 1-2: Pure bravado, complete denial of any concerns, unrealistic optimism

SELF-AWARENESS (30% weight):
• 9-10: Clearly articulates personal strengths AND weaknesses, has specific coping strategies
• 7-8: Good self-knowledge, understands personal patterns and triggers
• 5-6: General self-awareness, some introspection about capabilities
• 3-4: Limited self-reflection, overconfident or vague about personal traits
• 1-2: No self-awareness, completely unrealistic about personal capabilities

RESILIENCE EVIDENCE (20% weight):
• 9-10: Multiple concrete examples of overcoming significant adversity with specific details
• 7-8: Clear examples of handling stress/pressure with measurable outcomes
• 5-6: Some examples of resilience, general statements about overcoming challenges
• 3-4: Vague claims about toughness, limited concrete evidence
• 1-2: No evidence provided, just assertions about being "tough" or "determined"

MATURITY (10% weight):
• 9-10: Perfectly balanced view - acknowledges difficulty while showing realistic confidence
• 7-8: Mostly balanced, minor overconfidence or underconfidence
• 5-6: Somewhat balanced but leans too confident OR too uncertain
• 3-4: Either significant arrogance or excessive self-doubt
• 1-2: Extreme: pure arrogance ("I can handle anything") or complete lack of confidence

CALCULATION: final_score = (authenticity * 0.4) + (self_awareness * 0.3) + (resilience_evidence * 0.2) + (maturity * 0.1)

INVESTOR RESPONSE GENERATION:
HIGH SCORES (7.5-10):
• "I appreciate that level of honesty and self-awareness. Founders who acknowledge the challenge usually handle it better."
• "That's exactly the kind of realistic confidence I want to hear. You clearly know what you're signing up for."

MEDIUM SCORES (5-7.4):
• "I hear what you're saying, but I'd like to see more evidence of how you handle sustained pressure."
• "You seem confident, but this journey will test you in ways you can't imagine yet."

LOW SCORES (1-4.9):
• "That level of overconfidence actually makes me more worried, not less."
• "Your response suggests you haven't really thought through how difficult this will be."

Please evaluate the response and provide:
1. Individual scores for each dimension
2. Final calculated score (1-10, one decimal)
3. Appropriate investor feedback based on the score range
4. Brief explanation of the scoring rationale`;

export default function LeadershipChallenge() {
  const [venture, setVenture] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [challengePhase, setChallengePhase] = useState('start'); // start, generating_challenge, responding, evaluating, results
  const [conversation, setConversation] = useState([]);
  const [response, setResponse] = useState('');
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [evaluation, setEvaluation] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
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
  
  const handleTimeout = useCallback(async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    setChallengePhase('evaluating');
    setIsEvaluating(true);
    
    const timeoutFeedback = `TIMEOUT (120 seconds, no response):

SCORES:
Authenticity: 1/10
Self-Awareness: 1/10  
Resilience Evidence: 1/10
Maturity: 1/10
Final Score: 1.0/10

INVESTOR FEEDBACK:
A founder who can't even articulate their own resilience level concerns me deeply. If a simple question about mental toughness stumps you, how will you handle actual crises?

RATIONALE:
Inability to respond within reasonable time suggests lack of self-reflection and preparation for the entrepreneurial journey.`;
    
    if (venture) {
      await Venture.update(venture.id, { leadership_challenge_evaluation: timeoutFeedback });
    }
    setEvaluation(timeoutFeedback);
    setChallengePhase('results');
    setIsOneTimeChallengeTaken(true);
    setIsEvaluating(false);
  }, [venture]);

  useEffect(() => {
    const loadVentureAndStart = async () => {
      setIsLoading(true);
      try {
        const user = await User.me();
        const userVentures = await Venture.filter({ created_by: user.email }, "-created_date");
        
        if (userVentures.length > 0) {
          const currentVenture = userVentures[0];
          setVenture(currentVenture);
          
          // FOR TESTING: Allow restart by checking existing evaluation but not blocking
          if (currentVenture.leadership_challenge_evaluation) {
            setEvaluation(currentVenture.leadership_challenge_evaluation);
            setChallengePhase('results');
            setIsOneTimeChallengeTaken(true); // Mark as taken, but allow restart via button
          } else {
            setChallengePhase('start'); // Ready to start if no challenge taken yet
          }
        } else {
          setChallengePhase('no_venture'); // Indicate no venture exists
        }
      } catch (error) {
        console.error("Error loading venture:", error);
        setChallengePhase('error'); // Handle potential loading errors
      }
      setIsLoading(false);
    };

    loadVentureAndStart();
  }, []);

  useEffect(() => {
    if (challengePhase === 'responding') {
      startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setTimeElapsed(elapsed);
        
        // Time pressure messages
        if (elapsed === 30) {
          setConversation(prev => [...prev, { type: 'bot', text: "This isn't a trick question - I really want to understand your mental toughness" }]);
        } else if (elapsed === 60) {
          setConversation(prev => [...prev, { type: 'bot', text: "The fact that this is taking you so long to answer is concerning me" }]);
        } else if (elapsed === 90) {
          setConversation(prev => [...prev, { type: 'bot', text: "A strong founder should know their own resilience level" }]);
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

  const generateChallenge = async (currentVenture) => {
    if (!currentVenture) {
      setChallengePhase('start'); // Revert if no venture
      return;
    }
    
    const challengeFormats = [
      `Format A - Direct Capability Question: "I've seen a lot of founders burn out in [sector]. You're looking at [SPECIFIC_STRESSORS]. Looking at you honestly - do you have what it takes to push through when things get really tough?"`,
      `Format B - Statistical Reality Check: "[X]% of entrepreneurs in your space fail within 3 years, usually due to [SPECIFIC_CHALLENGE]. Most underestimate how brutal this journey is. What makes you think you can handle that level of stress better than the majority who give up?"`,
      `Format C - Worst-Case Scenario: "Let's say 18 months from now: you're working 90-hour weeks, your co-founder wants to quit, customers are churning, and you're down to your last $5K. Will you keep fighting or fold?"`,
      `Format D - Competitor Threat: "A well-funded competitor just launched a very similar product, stealing market share and investor interest. They're moving faster than you. How do you respond to this existential threat, not just strategically, but personally, when the pressure to give up feels overwhelming?"`
    ];
    const selectedFormat = challengeFormats[Math.floor(Math.random() * challengeFormats.length)];
    
    try {
      const prompt = `${SYSTEM_PROMPT}

VENTURE DETAILS:
Name: ${currentVenture.name}
Description: ${currentVenture.description}
Sector: ${currentVenture.sector}
Problem: ${currentVenture.problem || 'Not specified'}
Solution: ${currentVenture.solution || 'Not specified'}

Based on the above venture details, generate a single, personalized leadership stress test challenge using this specific format:
${selectedFormat}

Respond with ONLY the challenge question, nothing else.`;

      const challengeResponse = await InvokeLLM({ prompt });
      setConversation([{ type: 'bot', text: challengeResponse }]);
      setChallengePhase('responding');
    } catch (error) {
      console.error('Error generating challenge:', error);
      setConversation([{ type: 'bot', text: 'Error generating challenge. Please try again.' }]);
      setChallengePhase('start'); // Go back to start to allow retry
    }
  };

  const startChallengeProcess = async () => {
    if (!venture) return;
    setChallengePhase('generating_challenge'); // Temporary state for showing a loader
    setIsLoading(true); // Indicate overall loading for LLM call
    try {
      await generateChallenge(venture);
    } catch (error) {
      console.error('Error initiating challenge:', error);
      setConversation([{ type: 'bot', text: 'Error initiating challenge. Please try again.' }]);
      setChallengePhase('start'); // Go back to start if error
    } finally {
      setIsLoading(false); // Ensure loading is off
    }
  };

  const handleSubmitResponse = async () => {
    if (!response.trim() || isEvaluating || challengePhase !== 'responding') return;
    
    setConversation(prev => [...prev, { type: 'user', text: response }]);

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    setChallengePhase('evaluating');
    setIsEvaluating(true);
    
    try {
      const challengeText = conversation.find(msg => msg.type === 'bot')?.text || '';
      const evaluationPrompt = `${EVALUATION_PROMPT}

ORIGINAL CHALLENGE: ${challengeText}

ENTREPRENEUR'S RESPONSE: ${response}

TIME TAKEN: ${timeElapsed} seconds

Please provide a detailed evaluation in the following format:
SCORES:
Authenticity: X/10
Self-Awareness: X/10  
Resilience Evidence: X/10
Maturity: X/10
Final Score: X.X/10

INVESTOR FEEDBACK:
[Appropriate feedback based on score range]

RATIONALE:
[Brief explanation of scoring rationale]`;

      const evaluationResponse = await InvokeLLM({ prompt: evaluationPrompt });
      await Venture.update(venture.id, { leadership_challenge_evaluation: evaluationResponse });
      setEvaluation(evaluationResponse);
      setChallengePhase('results');
      setIsOneTimeChallengeTaken(true);
    } catch (error) {
      console.error('Error evaluating response:', error);
      setEvaluation('Error evaluating response. Please try again.');
      setChallengePhase('results'); // Show error in results phase
    }
    
    setIsEvaluating(false);
  };

  const handleRestart = () => {
    // Reset all state for testing purposes
    setChallengePhase('start');
    setConversation([]);
    setResponse('');
    setTimeElapsed(0);
    setIsEvaluating(false);
    setEvaluation('');
    setIsOneTimeChallengeTaken(false); // Can be reset for testing
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    // Optionally clear saved evaluation from venture if truly restarting
    // await Venture.update(venture.id, { leadership_challenge_evaluation: null });
  };

  if (isLoading && challengePhase !== 'results') { // Only show global loader if not in results and still loading
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        <p className="ml-2 text-gray-600">Loading venture data...</p>
      </div>
    );
  }

  if (challengePhase === 'no_venture') {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="text-center p-8">
            <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Active Venture Found</h2>
            <p className="text-gray-600">You need to create a venture first to take the Leadership Challenge.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (challengePhase === 'error') {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="text-center p-8">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Error Loading Data</h2>
            <p className="text-gray-600">An unexpected error occurred. Please try refreshing the page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (challengePhase === 'results') {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8 flex justify-center items-center">
        <Card className="w-full max-w-2xl shadow-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              Leadership Stress Test - Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                {evaluation}
              </pre>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={() => window.history.back()} variant="outline">
                Back to Dashboard
              </Button>
              {/* Only show restart button if the challenge was actually taken */}
              {isOneTimeChallengeTaken && ( 
                <Button onClick={handleRestart} className="bg-blue-600 hover:bg-blue-700">
                  Take Challenge Again (Testing)
                </Button>
              )}
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
             <Brain className="w-5 h-5 text-indigo-600"/>
             Leadership Stress Test
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
            <div className="text-center p-8">
              <h2 className="text-xl font-semibold mb-4">Ready for your Leadership Stress Test?</h2>
              <p className="text-gray-600 mb-6">This challenge evaluates your mental resilience and self-awareness as an entrepreneur. You will be given an unexpected scenario and asked to respond honestly.</p>
              <Button onClick={startChallengeProcess} disabled={!venture || isLoading}>
                Start Challenge
              </Button>
            </div>
          )}

          {challengePhase === 'generating_challenge' && (
            <div className="text-center p-8">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">Preparing your personalized leadership challenge...</p>
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
                    <p className="whitespace-pre-wrap italic ${msg.type === 'user' ? 'text-white' : 'text-gray-800'}">{msg.text}</p>
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

        {(challengePhase === 'responding' || (challengePhase === 'evaluating' && isEvaluating)) && (
          <div className="p-4 border-t">
            <div className="flex items-center gap-2">
              <Textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="Type your honest response here..."
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
