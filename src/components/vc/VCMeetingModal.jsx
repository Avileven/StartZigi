// VCmeetingModal4226
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { VentureMessage } from '@/api/entities.js';
import { Venture } from '@/api/entities.js';
import { InvokeLLM } from '@/api/integrations';
import { Button } from '@/components/ui/button';
import { Loader2, X, Send, User as UserIcon, Bot } from 'lucide-react';
import { MasterQuestion } from '@/api/entities.js';
import { Textarea } from '@/components/ui/textarea';

export default function VCMeetingModal({ isOpen, onClose, vcFirm, venture, messageId }) {
  const [conversation, setConversation] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [isAnswering, setIsAnswering] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [answers, setAnswers] = useState([]);
  const chatEndRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (isOpen) {
      // Reset state on open
      setConversation([]);
      setUserInput('');
      setCurrentQuestionIndex(0);
      setQuestions([]);
      setIsAnswering(false);
      setIsFinished(false);
      setAnswers([]);

      const loadAndStartMeeting = async () => {
        if (!venture || !vcFirm) return;
        setIsAnswering(true);

        try {
          const allMasterQuestions = await MasterQuestion.filter({});
          if (allMasterQuestions.length === 0) {
            console.warn("MasterQuestion entity is empty. Using fallback questions.");
            const fallbackQuestions = [
              { question_id: 'fallback_q1', question_text: 'What specific problem are you solving, and who experiences it most?' },
              { question_id: 'fallback_q2', question_text: 'What evidence do you have that people actually want this solved?' },
              { question_id: 'fallback_q3', question_text: 'What are the biggest risks or challenges you foresee?' }
            ];
            allMasterQuestions.push(...fallbackQuestions);
          }
          
          const shuffled = [...allMasterQuestions].sort(() => 0.5 - Math.random());
          const selectedQuestions = shuffled.slice(0, 3);
          setQuestions(selectedQuestions);
          
          setConversation([{ type: 'bot', text: `Hello from ${vcFirm.name}. I've reviewed your materials for ${venture.name} and have a few questions.` }]);
          
          setTimeout(() => {
            if (selectedQuestions.length > 0) {
              setConversation(prev => [...prev, { type: 'bot', text: selectedQuestions[0].question_text }]);
              setIsAnswering(false);
            } else {
              setConversation(prev => [...prev, { type: 'bot', text: "It seems we're having trouble preparing the questions. Please try again later." }]);
              setIsFinished(true);
            }
          }, 1500);

        } catch (error) {
          console.error("Error loading questions for VC meeting:", error);
          setConversation(prev => [...prev, { type: 'bot', text: "An error occurred while setting up the meeting. Please try again." }]);
          setIsFinished(true);
          setIsAnswering(false);
        }
      };

      loadAndStartMeeting();
    }
  }, [isOpen, vcFirm, venture]);

  useEffect(() => {
    scrollToBottom();
  }, [conversation, scrollToBottom]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!userInput.trim() || isAnswering || isFinished) return;

    setIsAnswering(true);
    const userAnswer = userInput.trim();
    setUserInput('');
    setConversation(prev => [...prev, { type: 'user', text: userAnswer }]);
    setAnswers(prev => [...prev, userAnswer]);

    setTimeout(() => {
      const acks = ["I see.", "Got it.", "Understood.", "That's helpful, thank you."];
      const randomAck = acks[Math.floor(Math.random() * acks.length)];
      setConversation(prev => [...prev, { type: 'bot', text: randomAck }]);

      const nextIndex = currentQuestionIndex + 1;
      if (nextIndex < questions.length) {
        setTimeout(() => {
          setConversation(prev => [...prev, { type: 'bot', text: questions[nextIndex].question_text }]);
          setCurrentQuestionIndex(nextIndex);
          setIsAnswering(false);
        }, 1500);
      } else {
        setIsFinished(true);
        setConversation(prev => [...prev, { type: 'bot', text: 'Thank you for your answers. I have what I need to make a decision. You will be notified on your dashboard shortly.' }]);
        
        // Process the evaluation with scoring
        setTimeout(async () => {
          try {
            const allAnswers = [...answers, userAnswer];
            
            const evaluationPrompt = `You are a VC partner conducting an interview. You've just finished asking 3 questions to an entrepreneur.

VENTURE CONTEXT (for understanding only):
Name: ${venture.name}
Description: ${venture.description}
Problem: ${venture.problem}
Solution: ${venture.solution}

INTERVIEW QUESTIONS AND ANSWERS:
${questions.map((q, idx) => `Question ${idx + 1}: ${q.question_text}\nAnswer: ${allAnswers[idx]}`).join('\n\n')}

EVALUATION TASK:
Evaluate ONLY the quality of the founder's 3 answers. Do NOT judge the business idea itself. Focus on:
- How well did they articulate their thoughts?
- Did they show clear thinking and understanding?
- Were their responses specific and thoughtful?

For each answer, provide a score (1-10) and brief rationale focusing on the quality of their response.

Then make an overall Go/No-Go decision based on whether they demonstrated good communication and thinking skills through their answers (average score >=7 = Go).

IMPORTANT: Also provide a single numerical overall score (0.0-10.0) representing the founder's performance.

Format your response as:
Answer 1 Evaluation: [score]/10 - [rationale focusing on answer quality]
Answer 2 Evaluation: [score]/10 - [rationale focusing on answer quality]  
Answer 3 Evaluation: [score]/10 - [rationale focusing on answer quality]

Overall Score: [numerical score 0.0-10.0]
Overall Decision: [Go/No-Go]
Reasoning: [2-3 sentences about their overall performance in answering questions]`;

            const result = await InvokeLLM({ 
              prompt: evaluationPrompt
            });

            // Extract the text response
            const evaluationText = result.response;

            // Extract numerical score from evaluation
            const scoreMatch = evaluationText.match(/Overall Score:\s*(\d+(?:\.\d+)?)/);
            const ventureScreeningScore = scoreMatch ? parseFloat(scoreMatch[1]) : 7.0; // default fallback

            const isGo = evaluationText.includes('Overall Decision: Go');
            
            if (messageId) {
              await VentureMessage.update(messageId, { is_dismissed: true });
            }

            // Save the venture screening score to the venture
            await Venture.update(venture.id, { 
              venture_screening_score: ventureScreeningScore 
            });

            if (isGo) {
              // Instead of immediate investment, ask for funding plan completion
              await VentureMessage.create({
                venture_id: venture.id,
                message_type: 'system',
                title: `Great Progress with ${vcFirm.name}!`,
                content: `Excellent performance in your initial meeting! Your venture screening score was ${ventureScreeningScore.toFixed(1)}/10. We're impressed and would like to move forward. Please join the advanced meeting to discuss the next steps and finalize the terms.`,
                phase: venture.phase,
                priority: 4,
                vc_firm_id: vcFirm.id,
                vc_firm_name: vcFirm.name,
                vc_stage: 'stage_3_ready'
              });
            } else {
              await VentureMessage.create({
                venture_id: venture.id,
                message_type: 'system',
                title: `Update from ${vcFirm.name}`,
                content: `Thank you for taking the time to meet with us. After careful consideration of our discussion, we have decided not to move forward at this time.\n\nYour venture screening score was ${ventureScreeningScore.toFixed(1)}/10.`,
                phase: venture.phase,
                priority: 2,
                vc_firm_id: vcFirm.id,
                vc_firm_name: vcFirm.name,
                vc_stage: 'stage_2_rejected',
                rejection_details: evaluationText
              });
            }

            setTimeout(() => {
              onClose();
            }, 2000);

          } catch (error) {
            console.error("Error processing VC meeting evaluation:", error);
            setTimeout(() => {
              onClose();
            }, 2000);
          }
        }, 3000);
      }
    }, 1000);
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl h-[80vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold">Meeting with {vcFirm.name}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {conversation.map((msg, index) => (
            <div key={index} className={`flex items-start gap-3 ${msg.type === 'user' ? 'justify-end' : ''}`}>
              {msg.type === 'bot' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
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

        {!isFinished && (
          <div className="p-4 border-t bg-gray-50">
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <Textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Type your answer..."
                className="flex-1 resize-none min-h-[40px]"
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
      </div>
    </div>
  );
}
