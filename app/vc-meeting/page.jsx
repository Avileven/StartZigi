// 2426v1
"use client";
import React, { useState, useEffect } from 'react';
import { MasterQuestion } from '@/api/entities.js';
import { VentureMessage } from '@/api/entities.js';
import { VCFirm } from '@/api/entities.js';
import { Venture } from '@/api/entities.js';
import { User } from '@/api/entities.js';
import { InvokeLLM } from '@/api/integrations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useRouter } from 'next/navigation';
import { createPageUrl } from '@/utils';
import { Users, MessageSquare, CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function VCMeeting() {
  const [questions, setQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [meetingComplete, setMeetingComplete] = useState(false);
  const [evaluationResults, setEvaluationResults] = useState(null);
  const [venture, setVenture] = useState(null);
  const [vcFirm, setVcFirm] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const loadMeetingData = async () => {
      setIsLoading(true);
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const vcFirmId = urlParams.get('vc_firm_id');
        const messageId = urlParams.get('message_id');

        if (!vcFirmId) {
          alert('Invalid meeting link');
          router.push(createPageUrl('Dashboard'));
          return;
        }

        // Load VC firm
        const firms = await VCFirm.filter({ id: vcFirmId });
        if (firms.length === 0) {
          alert('VC firm not found');
          router.push(createPageUrl('Dashboard'));
          return;
        }
        setVcFirm(firms[0]);

        // Load user's venture
        const currentUser = await User.me();
        const ventures = await Venture.filter({ created_by: currentUser.email });
        if (ventures.length === 0) {
          alert('No venture found');
          router.push(createPageUrl('Dashboard'));
          return;
        }
        setVenture(ventures[0]);

        // Load all questions
        const allQuestions = await MasterQuestion.list();
        setQuestions(allQuestions);

        // Randomly select 3 questions
        const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
        setSelectedQuestions(shuffled.slice(0, 3));

      } catch (error) {
        console.error('Error loading meeting data:', error);
        alert('Error loading meeting data');
        router.push(createPageUrl('Dashboard'));
      }
      setIsLoading(false);
    };

    loadMeetingData();
  }, [router]);

  const handleAnswerSubmit = () => {
    if (!currentAnswer.trim()) {
      alert('Please provide an answer before continuing.');
      return;
    }

    const updatedAnswers = {
      ...answers,
      [selectedQuestions[currentQuestionIndex].question_id]: {
        question: selectedQuestions[currentQuestionIndex].question_text,
        answer: currentAnswer.trim()
      }
    };
    setAnswers(updatedAnswers);
    setCurrentAnswer('');

    if (currentQuestionIndex < selectedQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // All questions answered, process evaluation
      processEvaluation(updatedAnswers);
    }
  };

  const processEvaluation = async (finalAnswers) => {
    setIsSubmitting(true);
    try {
      // Build evaluation prompt
      const answersText = Object.entries(finalAnswers)
        .map(([id, item], index) => `Question ${index + 1}: ${item.question}\nAnswer: ${item.answer}`)
        .join('\n\n');

      const evaluationPrompt = `You are a VC investor at ${vcFirm.name} evaluating a startup founder during a meeting.
Venture: ${venture.name}

Questions and answers from the meeting:
${answersText}

Evaluate each answer with a score from 1-10 and a rationale.
If the average score is >= 6, the decision is "Go". Otherwise "No-Go".

Return ONLY valid JSON, no markdown, no backticks:
{
  "decision": "Go" or "No-Go",
  "evaluations": [
    { "question_id": "<id>", "score": <number 1-10>, "rationale": "<string>" }
  ],
  "average_score": <number>,
  "overall_rationale": "<string>"
}`;

      console.log("DEBUG 1: Sending to AI...");

      const result = await InvokeLLM({
        prompt: evaluationPrompt,
      });

      const rawResponse = result.response;

      // Parse safely - could be string or object
      let evaluation;
      if (typeof rawResponse === 'string') {
        const cleaned = rawResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        evaluation = JSON.parse(cleaned);
      } else {
        evaluation = rawResponse;
      }

      console.log("DEBUG 2: AI Raw Response:", evaluation);

      setEvaluationResults(evaluation);

      console.log("DEBUG 3: Decision is:", evaluation?.decision);

      const isGo = evaluation.decision === 'Go';
      const messageTitle = isGo 
        ? `🎉 Great Meeting with ${vcFirm.name}!`
        : `📋 Meeting Update from ${vcFirm.name}`;

      // Build message content
      const messageContent = `Meeting with ${vcFirm.name} is complete.\n\nScore: ${evaluation.average_score.toFixed(1)}/10\nDecision: ${evaluation.decision}\n\n${evaluation.overall_rationale}`;
      
      console.log("DEBUG 4: Attempting to create message in DB...");
      
      await VentureMessage.create({
        venture_id: venture.id,
        message_type: 'system',
        title: messageTitle,
        content: messageContent,
        phase: venture.phase,
        priority: isGo ? 3 : 2,
        vc_firm_id: vcFirm.id,
        vc_stage: isGo ? 'stage_3_ready' : 'stage_2_complete'
      });

      console.log("DEBUG 5: Message created successfully!");
      setMeetingComplete(true);

    } catch (error) {
      console.error('DEBUG ERROR:', error);
      alert('Error processing evaluation. Please try again.');
    }
    setIsSubmitting(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (meetingComplete && evaluationResults) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                evaluationResults.decision === 'Go' ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {evaluationResults.decision === 'Go' ? 
                  <CheckCircle className="w-8 h-8 text-green-600" /> : 
                  <XCircle className="w-8 h-8 text-red-600" />
                }
              </div>
              <CardTitle className="text-2xl">
                Meeting with {vcFirm.name} Complete
              </CardTitle>
              <p className="text-gray-600 mt-2">
                {evaluationResults.decision === 'Go' ? 'Congratulations!' : 'Thank you for your time'}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">
                  {evaluationResults.average_score.toFixed(1)}/10
                </div>
                <Badge className={`text-lg px-4 py-2 ${
                  evaluationResults.decision === 'Go' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {evaluationResults.decision === 'Go' ? '✅ Go' : '❌ No-Go'}
                </Badge>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Evaluation Breakdown:</h3>
                {evaluationResults.evaluations.map((evaluation, index) => (
                  <div key={evaluation.question_id} className="border-l-4 border-indigo-500 pl-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">Question {index + 1}</h4>
                      <Badge variant="outline">{evaluation.score}/10</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{evaluation.rationale}</p>
                  </div>
                ))}
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Overall Assessment:</h4>
                <p className="text-gray-700">{evaluationResults.overall_rationale}</p>
              </div>

              <div className="text-center pt-4">
                <Button onClick={() => router.push(createPageUrl('Dashboard'))} className="bg-indigo-600 hover:bg-indigo-700">
                  Return to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isSubmitting) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Processing your answers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-8 h-8 text-indigo-600" />
              <div>
                <CardTitle className="text-2xl">Meeting with {vcFirm.name}</CardTitle>
                <p className="text-gray-600">AI-Powered Investment Screening</p>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Question {currentQuestionIndex + 1} of {selectedQuestions.length}
              </div>
              <Progress value={(currentQuestionIndex / selectedQuestions.length) * 100} className="w-32" />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {selectedQuestions.length > 0 && (
              <>
                <div className="bg-indigo-50 p-6 rounded-lg">
                  <div className="flex items-start gap-3">
                    <MessageSquare className="w-6 h-6 text-indigo-600 mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold text-indigo-900 mb-2">
                        Question {currentQuestionIndex + 1}
                      </h3>
                      <p className="text-indigo-800">
                        {selectedQuestions[currentQuestionIndex].question_text}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Answer:
                  </label>
                  <Textarea
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    placeholder="Please provide a detailed answer (2-5 short paragraphs)..."
                    className="min-h-[150px]"
                  />
                </div>

                <div className="flex justify-between">
                  <div className="text-sm text-gray-500">
                    {Object.keys(answers).length} of {selectedQuestions.length} questions answered
                  </div>
                  <Button onClick={handleAnswerSubmit} className="bg-indigo-600 hover:bg-indigo-700">
                    {currentQuestionIndex < selectedQuestions.length - 1 ? 'Next Question' : 'Complete Meeting'}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
