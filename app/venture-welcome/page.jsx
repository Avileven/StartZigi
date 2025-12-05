"use client";
import React, { useState, useEffect } from 'react';
import { Venture } from '@/api/entities.js';
import { VentureMessage } from '@/api/entities.js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { createPageUrl } from '@/utils';
import { 
  Rocket, 
  Lightbulb, 
  FileText, 
  TrendingUp, 
  DollarSign,
  Users,
  Trophy,
  ArrowRight,
  Sparkles
} from 'lucide-react';

const JOURNEY_PHASES = [
  { 
    id: 'idea', 
    name: 'Idea', 
    icon: Lightbulb, 
    color: 'text-yellow-500',
    description: 'Create your concept and landing page',
    status: 'complete'
  },
  { 
    id: 'business_plan', 
    name: 'Business Plan', 
    icon: FileText, 
    color: 'text-blue-500',
    description: 'Develop your strategy and business model',
    status: 'next'
  },
  { 
    id: 'mvp', 
    name: 'MVP', 
    icon: Rocket, 
    color: 'text-purple-500',
    description: 'Build your minimum viable product',
    status: 'future'
  },
  { 
    id: 'mlp', 
    name: 'MLP', 
    icon: Sparkles, 
    color: 'text-pink-500',
    description: 'Create your minimum lovable product',
    status: 'future'
  },
  { 
    id: 'growth', 
    name: 'Growth', 
    icon: TrendingUp, 
    color: 'text-green-500',
    description: 'Scale your venture and raise funding',
    status: 'future'
  }
];

export default function VentureWelcome() {
  const [venture, setVenture] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const createWelcomeMessages = async (venture) => {
      // Create idea phase completion message
      await VentureMessage.create({
        venture_id: venture.id,
        message_type: 'phase_complete',
        title: '🎉 Idea Phase Complete!',
        content: `Congratulations! You've successfully launched "${venture.name}" and completed the Idea phase. Your venture now has a compelling concept, a clear problem-solution fit, and a live landing page. You've been awarded $15,000 in virtual capital to get started!`,
        phase: 'idea',
        priority: 3
      });

      // Create business plan phase welcome message
      await VentureMessage.create({
        venture_id: venture.id,
        message_type: 'phase_welcome',
        title: '📋 Welcome to Business Planning!',
        content: `You've now entered the Business Plan phase! Time to build a solid foundation for "${venture.name}". Complete all 10 sections of your business plan to unlock the next phase and start building your MVP. Focus on defining your target market, competition analysis, and revenue model.`,
        phase: 'business_plan',
        priority: 2
      });
    };

    const loadVenture = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const ventureId = urlParams.get('ventureId');
        
        if (ventureId) {
          const ventures = await Venture.filter({ id: ventureId });
          if (ventures.length > 0) {
            const currentVenture = ventures[0];
            setVenture(currentVenture);
            
            // Create welcome messages now that idea phase is complete
            await createWelcomeMessages(currentVenture);
            
            // Update venture to business_plan phase
            await Venture.update(currentVenture.id, { phase: 'business_plan' });
          }
        }
      } catch (error) {
        console.error("Error loading venture:", error);
      }
      setIsLoading(false);
    };

    loadVenture();
  }, []); // Empty dependency array ensures this effect runs only once on mount

  const handleContinue = () => {
    router.push(createPageUrl("Dashboard"));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!venture) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Venture Not Found</h1>
          <p className="text-gray-600">Something went wrong. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto">
        {/* Celebration Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-extrabold text-gray-900 mb-4">
            🎉 Congratulations!
          </h1>
          <p className="text-2xl text-gray-700 mb-2">
            You've successfully launched <span className="font-bold text-purple-600">{venture.name}</span>
          </p>
          <p className="text-lg text-gray-600">
            Your entrepreneurial journey has officially begun!
          </p>
        </div>

        {/* Venture Stats */}
        <Card className="mb-8 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-t-lg">
            <CardTitle className="text-center text-xl">Your Venture Stats</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-purple-600 mb-2">$15,000</div>
                <p className="text-gray-600">Virtual Capital</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600 mb-2">{Math.round(venture.team_score)}</div>
                <p className="text-gray-600">Team Score</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600 mb-2">{Math.round(venture.opportunity_score)}</div>
                <p className="text-gray-600">Opportunity Score</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-orange-600 mb-2">{Math.round(venture.total_score)}</div>
                <p className="text-gray-600">Overall Score</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Journey Roadmap */}
        <Card className="mb-8 shadow-xl">
          <CardHeader>
            <CardTitle className="text-center text-xl">Your Entrepreneurial Journey</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {JOURNEY_PHASES.map((phase, index) => {
                const Icon = phase.icon;
                const isComplete = phase.status === 'complete';
                const isNext = phase.status === 'next';
                const isFuture = phase.status === 'future';
                
                return (
                  <div key={phase.id} className={`flex items-center p-4 rounded-lg ${
                    isComplete ? 'bg-green-50 border-2 border-green-200' :
                    isNext ? 'bg-blue-50 border-2 border-blue-200' :
                    'bg-gray-50 border-2 border-gray-200'
                  }`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${
                      isComplete ? 'bg-green-500' :
                      isNext ? 'bg-blue-500' :
                      'bg-gray-400'
                    }`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{phase.name}</h3>
                      <p className="text-gray-600">{phase.description}</p>
                    </div>
                    <div className="ml-4">
                      {isComplete && <Badge className="bg-green-100 text-green-800">Complete ✓</Badge>}
                      {isNext && <Badge className="bg-blue-100 text-blue-800">Next Up</Badge>}
                      {isFuture && <Badge variant="outline">Coming Soon</Badge>}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="shadow-xl">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">What's Next?</h3>
            <p className="text-gray-600 mb-6">
              You're now ready to start building your business plan. This is where you'll define your strategy, 
              analyze your market, and create a roadmap for success.
            </p>
            <Button 
              onClick={handleContinue}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3"
            >
              Continue to Dashboard
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
