"use client";

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

const MEETING_QUESTIONS = [
  {
    id: 'q1',
    question: 'What is your go-to-market strategy?',
    options: [
      { value: 'direct_sales', label: 'Direct sales to enterprises', score: 8 },
      { value: 'inbound', label: 'Inbound marketing and content', score: 7 },
      { value: 'partnerships', label: 'Strategic partnerships and integrations', score: 6 },
      { value: 'unsure', label: 'Still figuring it out', score: 3 }
    ]
  },
  {
    id: 'q2',
    question: 'How do you plan to scale your team in the next 12 months?',
    options: [
      { value: 'aggressive', label: 'Aggressively hiring across all functions', score: 8 },
      { value: 'strategic', label: 'Strategic hires in key areas only', score: 9 },
      { value: 'conservative', label: 'Keeping the team lean and focused', score: 6 },
      { value: 'unsure', label: 'Depends on funding', score: 4 }
    ]
  },
  {
    id: 'q3',
    question: 'What is your biggest competitive advantage?',
    options: [
      { value: 'technology', label: 'Proprietary technology/IP', score: 9 },
      { value: 'team', label: 'Experienced founding team', score: 8 },
      { value: 'network', label: 'Strong network and partnerships', score: 7 },
      { value: 'timing', label: 'First mover advantage', score: 6 }
    ]
  },
  {
    id: 'q4',
    question: 'How do you measure product-market fit?',
    options: [
      { value: 'retention', label: 'User retention and engagement metrics', score: 9 },
      { value: 'growth', label: 'Month-over-month growth rate', score: 8 },
      { value: 'feedback', label: 'Customer feedback and NPS', score: 7 },
      { value: 'revenue', label: 'Revenue and unit economics', score: 8 }
    ]
  },
  {
    id: 'q5',
    question: 'What keeps you up at night about your business?',
    options: [
      { value: 'competition', label: 'Competition moving faster than us', score: 7 },
      { value: 'execution', label: 'Execution and operational challenges', score: 8 },
      { value: 'funding', label: 'Running out of runway', score: 5 },
      { value: 'talent', label: 'Attracting and retaining top talent', score: 9 }
    ]
  }
];

export default function VCMeetingModal({ isOpen, onClose, vcFirm, venture, messageId }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const router = useRouter();

  const handleAnswer = (questionId, value, score) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: { value, score }
    }));
  };

  const handleNext = () => {
    if (currentQuestion < MEETING_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setIsProcessing(true);

    try {
      const totalScore = Object.values(answers).reduce((sum, answer) => sum + answer.score, 0);
      const maxScore = MEETING_QUESTIONS.length * 9;
      const percentageScore = (totalScore / maxScore) * 100;

      // עדכון ציון הסקר של ה-venture
      await supabase
        .from('ventures')
        .update({ venture_screening_score: percentageScore })
        .eq('id', venture.id);

      // עדכון ההודעה המקורית
      if (messageId) {
        await supabase
          .from('venture_messages')
          .update({ is_dismissed: true })
          .eq('id', messageId);
      }

      // החלטה על סמך הציון
      if (percentageScore >= 75) {
        // מעבר לשלב הבא - פגישת המשך
        await supabase
          .from('venture_messages')
          .insert({
            venture_id: venture.id,
            message_type: 'vc_follow_up_required',
            title: `${vcFirm.name} - Follow-Up Required`,
            content: `Great news! You've passed the initial screening with a score of ${percentageScore.toFixed(1)}%. ${vcFirm.name} wants to schedule a follow-up call to discuss how you handle pressure and challenging scenarios. Click below to join the call.`,
            phase: venture.phase,
            priority: 4,
            vc_firm_id: vcFirm.id,
            vc_stage: 'stage_2_followup'
          });
      } else if (percentageScore >= 50) {
        // משוב אבל לא ממשיכים
        await supabase
          .from('venture_messages')
          .insert({
            venture_id: venture.id,
            message_type: 'system',
            title: `Update from ${vcFirm.name}`,
            content: `Thank you for meeting with us. After careful consideration, we've decided not to move forward at this time. Your screening score was ${percentageScore.toFixed(1)}%. We encourage you to continue refining your strategy and pitch.`,
            phase: venture.phase,
            priority: 3,
            vc_firm_id: vcFirm.id,
            vc_stage: 'stage_2_rejected'
          });
      } else {
        // דחייה
        await supabase
          .from('venture_messages')
          .insert({
            venture_id: venture.id,
            message_type: 'system',
            title: `Update from ${vcFirm.name}`,
            content: `Thank you for your time. Unfortunately, we won't be moving forward with your application. Your screening score was ${percentageScore.toFixed(1)}%.`,
            phase: venture.phase,
            priority: 2,
            vc_firm_id: vcFirm.id,
            vc_stage: 'stage_2_rejected'
          });
      }

      setIsComplete(true);
    } catch (error) {
      console.error('Error processing meeting:', error);
      alert('An error occurred while processing the meeting. Please try again.');
    }

    setIsProcessing(false);
  };

  const currentQ = MEETING_QUESTIONS[currentQuestion];
  const hasAnswer = answers[currentQ?.id];
  const progress = ((currentQuestion + 1) / MEETING_QUESTIONS.length) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {isComplete ? 'Meeting Complete' : `Meeting with ${vcFirm?.name}`}
          </DialogTitle>
        </DialogHeader>

        {!isComplete ? (
          <div className="space-y-6">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>

            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-gray-500 mb-2">
                  Question {currentQuestion + 1} of {MEETING_QUESTIONS.length}
                </p>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {currentQ.question}
                </h3>

                <RadioGroup
                  value={answers[currentQ.id]?.value}
                  onValueChange={(value) => {
                    const option = currentQ.options.find(opt => opt.value === value);
                    handleAnswer(currentQ.id, value, option.score);
                  }}
                >
                  {currentQ.options.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2 mb-3">
                      <RadioGroupItem value={option.value} id={option.value} />
                      <Label htmlFor={option.value} className="cursor-pointer">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                disabled={currentQuestion === 0}
              >
                Previous
              </Button>
              <Button
                onClick={handleNext}
                disabled={!hasAnswer || isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : currentQuestion === MEETING_QUESTIONS.length - 1 ? 'Submit' : 'Next'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-6 text-center">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-green-900 mb-2">Meeting Complete!</h3>
                <p className="text-green-800">
                  Thank you for your time. Check your dashboard for the next steps.
                </p>
              </CardContent>
            </Card>

            <Button onClick={onClose} className="w-full">
              Return to Dashboard
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}