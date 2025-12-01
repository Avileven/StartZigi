"use client";

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';

const ADVANCED_SCENARIOS = [
  {
    id: 's1',
    title: 'Technical Challenge',
    scenario: 'Your CTO just quit unexpectedly, taking critical IP knowledge with them. You have a major product release in 2 weeks. How do you handle this?',
    type: 'crisis_management'
  },
  {
    id: 's2',
    title: 'Competitive Threat',
    scenario: 'A well-funded competitor just launched a feature that\'s nearly identical to your core product, but with better marketing. How do you respond?',
    type: 'strategic_thinking'
  },
  {
    id: 's3',
    title: 'Funding Runway',
    scenario: 'You have 3 months of runway left. A potential acquirer offers you 50% of your current valuation. Your revenue is growing but not fast enough. What do you do?',
    type: 'financial_decision'
  }
];

export default function VCAdvancedMeetingModal({ isOpen, onClose, vcFirm, venture, messageId }) {
  const [currentScenario, setCurrentScenario] = useState(0);
  const [responses, setResponses] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [finalResult, setFinalResult] = useState(null);
  const router = useRouter();

  const handleResponseChange = (scenarioId, value) => {
    setResponses(prev => ({
      ...prev,
      [scenarioId]: value
    }));
  };

  const handleNext = () => {
    if (currentScenario < ADVANCED_SCENARIOS.length - 1) {
      setCurrentScenario(currentScenario + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setIsProcessing(true);

    try {
      // קבלת ההודעה המקורית
      const { data: originalMessage } = await supabase
        .from('venture_messages')
        .select('*')
        .eq('id', messageId)
        .single();

      // סימולציה של החלטה (במקום AI אמיתי)
      const allResponsesFilled = ADVANCED_SCENARIOS.every(s => responses[s.id]?.trim().length > 50);
      const decision = allResponsesFilled && Math.random() > 0.3 ? 'invest' : 'pass';

      // עדכון ההודעה המקורית כנדחתה
      if (messageId) {
        await supabase
          .from('venture_messages')
          .update({ is_dismissed: true })
          .eq('id', messageId);
      }

      if (decision === 'invest') {
        const checkSize = Math.floor(Math.random() * (2000000 - 250000) + 250000);
        const valuation = Math.floor(Math.random() * (20000000 - 2000000) + 2000000);

        // יצירת הצעת השקעה
        await supabase
          .from('venture_messages')
          .insert({
            venture_id: venture.id,
            message_type: 'investment_offer',
            title: `🎉 Investment Offer from ${vcFirm.name}`,
            content: `Congratulations! After thorough evaluation, ${vcFirm.name} is excited to offer you an investment.`,
            phase: venture.phase,
            priority: 5,
            vc_firm_id: vcFirm.id,
            vc_firm_name: vcFirm.name,
            investment_offer_checksize: checkSize,
            investment_offer_valuation: valuation,
            investment_offer_status: 'pending',
            vc_stage: 'stage_3_complete'
          });

        setFinalResult({
          success: true,
          message: 'Investment offer received! Check your dashboard to review the terms.',
          details: { check_size: checkSize, valuation: valuation }
        });
      } else {
        // יצירת הודעת דחייה
        await supabase
          .from('venture_messages')
          .insert({
            venture_id: venture.id,
            message_type: 'system',
            title: `Update from ${vcFirm.name}`,
            content: `Thank you for your time throughout this process. After careful consideration by our investment committee, we've decided not to proceed with an investment at this time.`,
            phase: venture.phase,
            priority: 3,
            vc_firm_id: vcFirm.id,
            vc_stage: 'stage_3_rejected'
          });

        setFinalResult({
          success: false,
          message: 'Unfortunately, the investment committee has decided to pass.',
          details: {}
        });
      }

      setIsComplete(true);
    } catch (error) {
      console.error('Error processing advanced meeting:', error);
      alert('An error occurred. Please try again.');
    }

    setIsProcessing(false);
  };

  const currentScen = ADVANCED_SCENARIOS[currentScenario];
  const hasResponse = responses[currentScen?.id]?.trim().length > 50;
  const progress = ((currentScenario + 1) / ADVANCED_SCENARIOS.length) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {isComplete ? 'Final Decision' : `Investment Committee Meeting - ${vcFirm?.name}`}
          </DialogTitle>
        </DialogHeader>

        {!isComplete ? (
          <div className="space-y-6">
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>

            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-amber-900">Challenging Scenario</p>
                    <p className="text-xs text-amber-800">Think carefully and be honest about how you would handle this situation.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-gray-500 mb-2">
                  Scenario {currentScenario + 1} of {ADVANCED_SCENARIOS.length}
                </p>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {currentScen.title}
                </h3>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  {currentScen.scenario}
                </p>

                <div>
                  <Label htmlFor="response">Your Response (minimum 50 characters)</Label>
                  <Textarea
                    id="response"
                    value={responses[currentScen.id] || ''}
                    onChange={(e) => handleResponseChange(currentScen.id, e.target.value)}
                    placeholder="Explain your approach, decision-making process, and the steps you would take..."
                    className="min-h-[150px] mt-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {(responses[currentScen.id] || '').length}/50 characters minimum
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentScenario(Math.max(0, currentScenario - 1))}
                disabled={currentScenario === 0}
              >
                Previous
              </Button>
              <Button
                onClick={handleNext}
                disabled={!hasResponse || isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : currentScenario === ADVANCED_SCENARIOS.length - 1 ? 'Submit to Committee' : 'Next'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <Card className={finalResult.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  {finalResult.success ? (
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  ) : (
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                  )}
                  <h3 className="text-xl font-bold">
                    {finalResult.success ? 'Investment Offer!' : 'Not This Time'}
                  </h3>
                </div>
                <p className={finalResult.success ? "text-green-800" : "text-red-800"}>
                  {finalResult.message}
                </p>
              </CardContent>
            </Card>

            <Button onClick={() => router.push('/dashboard')} className="w-full">
              Return to Dashboard
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
