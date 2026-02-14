"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { VCFirm } from '@/api/entities';
import { Venture } from '@/api/entities';
import { User } from '@/api/entities';
import { VentureMessage } from '@/api/entities';
import { useRouter } from 'next/navigation';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Building2, 
  Loader2,
  X,
  DollarSign,
  Target,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Mail
} from 'lucide-react';

const VCFirmContactModal = ({ firm, venture }) => {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const router = useRouter();
  const canApply = venture && venture.pitch_created && venture.funding_plan_completed;

  const handleApply = async () => {
    if (!venture) {
      alert("No active venture found.");
      return;
    }
    setIsSending(true);

    const params = firm.screening_parameters || {};
    let rejectionReason = null;

    // Stage 1: Automated Screening
    if (params.freeze_investment) {
      rejectionReason = params.rejection_messages?.freeze || "Thank you for the time you've invested in this process. While we were very impressed by your presentation, we have made the difficult decision to pause all new investments at this time.";
    } else if (params.team_focus && (venture.founders_count || 1) < 2) {
      rejectionReason = params.rejection_messages?.team || "Your venture's potential is clear, but we've found that our most successful partnerships are with teams that have multiple co-founders.";
    } else if (params.sector_focus && !firm.focus_areas?.includes(venture.sector)) {
      rejectionReason = params.rejection_messages?.sector || "Thank you for sharing your innovative work with us. While your vision is compelling, it doesn't align with our current investment thesis.";
    } else if (params.phase_focus && !['mlp', 'growth', 'ma'].includes(venture.phase)) {
       rejectionReason = params.rejection_messages?.phase || "We typically invest in companies with more established traction. We encourage you to re-apply once you've reached the MLP phase or beyond.";
    }

    try {
      if (rejectionReason) {
        await VentureMessage.create({
          venture_id: venture.id,
          message_type: 'system',
          title: `Update from ${firm.name}`,
          content: rejectionReason,
          phase: venture.phase,
          priority: 2,
          vc_firm_id: firm.id,
          vc_stage: 'stage_1_rejected'
        });
      } else {
        await VentureMessage.create({
          venture_id: venture.id,
          message_type: 'system',
          title: `Invitation to Meeting: ${firm.name}`,
          content: `Congratulations! You've passed the initial screening with ${firm.name}. Click 'Join Meeting' to begin the automated evaluation process.`,
          phase: venture.phase,
          priority: 4,
          vc_firm_id: firm.id,
          vc_stage: 'stage_2_ready'
        });
      }
      
      router.push(createPageUrl('Dashboard'));
    } catch (error) {
      console.error("Failed to send application:", error);
      alert("There was an error processing your application. Please try again.");
      setIsSending(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="lg" className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-6 text-lg shadow-lg rounded-xl" disabled={!canApply}>
          <Mail className="w-5 h-5 mr-2" />
          Contact Firm
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white text-gray-900 shadow-2xl border border-gray-200">
        <DialogHeader>
          <DialogTitle>Contact {firm.name}</DialogTitle>
          <DialogDescription>
            Send a brief message to introduce your venture.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="message">Your Message</Label>
            <Textarea
              id="message"
              placeholder="e.g., We are developing a groundbreaking solution in the AI space and believe we align with your firm's investment thesis..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[120px]"
            />
          </div>
          <p className="text-xs text-gray-500 italic">
            attached is an executive summary of the venture.
          </p>
        </div>
        <DialogFooter>
          <Button onClick={handleApply} disabled={isSending}>
            {isSending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : "Send Application"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const GRADIENTS = [
  'bg-gradient-to-br from-blue-500 to-indigo-600',
  'bg-gradient-to-br from-purple-500 to-pink-600',
  'bg-gradient-to-br from-green-500 to-teal-600',
  'bg-gradient-to-br from-orange-500 to-red-600',
  'bg-gradient-to-br from-indigo-500 to-purple-700',
  'bg-gradient-to-br from-cyan-500 to-blue-600',
  'bg-gradient-to-br from-rose-500 to-pink-600',
  'bg-gradient-to-br from-amber-500 to-orange-600',
  'bg-gradient-to-br from-violet-500 to-purple-600',
  'bg-gradient-to-br from-emerald-500 to-green-600',
];

const getGradientForFirm = (name) => {
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return GRADIENTS[hash % GRADIENTS.length];
};

const parseFundingAmount = (fundingInfo) => {
  if (!fundingInfo) return 0;
  const match = fundingInfo.match(/\$(\d+(?:\.\d+)?)\s*(M|B|K)?/i);
  if (!match) return 0;
  
  const amount = parseFloat(match[1]);
  const unit = match[2]?.toUpperCase();
  
  if (unit === 'B') return amount * 1000;
  if (unit === 'M') return amount;
  if (unit === 'K') return amount / 1000;
  return amount;
};

const formatFunding = (fundingInfo) => {
  if (!fundingInfo) return 'N/A';
  const match = fundingInfo.match(/\$(\d+(?:\.\d+)?)\s*(M|B|K)?/i);
  if (!match) return fundingInfo;
  return `$${match[1]}${match[2] || ''}`;
};

const getCircleSize = (fundingInfo) => {
  const amount = parseFundingAmount(fundingInfo);
  if (amount >= 500) return 'w-48 h-48'; // $500M+
  if (amount >= 200) return 'w-40 h-40'; // $200M+
  if (amount >= 100) return 'w-36 h-36'; // $100M+
  return 'w-32 h-32'; // < $100M
};

export default function VCMarketplace() {
  const [firms, setFirms] = useState([]);
  const [venture, setVenture] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFirm, setSelectedFirm] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [allFirms, user] = await Promise.all([
          VCFirm.list("-created_date"),
          User.me(),
        ]);
        
        setFirms(allFirms);

        if (user?.id) {
          let userVentures = [];
          try {
            userVentures = await Venture.filter(
              { founder_user_id: user.id },
              "-created_date"
            );
          } catch (e) {
            userVentures = [];
          }

          if (!userVentures || userVentures.length === 0) {
            userVentures = await Venture.filter(
              { created_by: user.email },
              "-created_date"
            );
          }

          if (userVentures.length > 0) {
            setVenture(userVentures[0]);
          }
        }
      } catch (error) {
        console.error("Error loading data:", error);
      }
      setIsLoading(false);
    };
    loadData();
  }, []);

  const handleFirmClick = (firm) => {
    setSelectedFirm(firm);
  };

  const handleClose = () => {
    setSelectedFirm(null);
  };

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Building2 className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-black text-gray-900 mb-2">
              VC Marketplace
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Connect with top-tier venture capital firms
            </p>
          </div>

          {/* VC Firms Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
            {firms.map((firm, index) => {
              const gradientClass = getGradientForFirm(firm.name);
              const sizeClass = getCircleSize(firm.funding_info);
              
              return (
                <div
                  key={firm.id}
                  className="flex flex-col items-center"
                  style={{ 
                    animation: `slideIn 0.6s ease-out forwards`,
                    animationDelay: `${index * 0.05}s`,
                    opacity: 0
                  }}
                >
                  <button
                    onClick={() => handleFirmClick(firm)}
                    className={`
                      relative rounded-full flex items-center justify-center
                      transition-all duration-300 shadow-lg
                      cursor-pointer hover:scale-110 hover:shadow-2xl
                      ${gradientClass}
                      ${sizeClass}
                    `}
                  >
                    {/* Funding Amount */}
                    <span 
                      className="text-2xl font-black text-white relative z-10 text-center px-3"
                      style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}
                    >
                      {formatFunding(firm.funding_info)}
                    </span>
                  </button>

                  {/* Firm Name */}
                  <p className="mt-3 text-center font-semibold text-gray-900 text-sm max-w-[150px]">
                    {firm.name}
                  </p>
                </div>
              );
            })}
          </div>

        </div>
      </div>

      {/* Details Modal */}
      {selectedFirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-8 duration-500 shadow-2xl bg-white border-0">
            
            {/* Header */}
            <CardHeader className="relative pb-4 border-b">
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-start gap-4">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg ${getGradientForFirm(selectedFirm.name)}`}>
                  <Building2 className="w-10 h-10 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold mb-1">
                    {selectedFirm.name}
                  </CardTitle>
                  {selectedFirm.founded && (
                    <p className="text-sm text-gray-600">Founded in {selectedFirm.founded}</p>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-6 space-y-6">
              
              {/* Background */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  About
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {selectedFirm.background}
                </p>
              </div>

              {/* Fund Info & Check Size */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedFirm.funding_info && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-600 mb-1">Latest Fund</p>
                    <p className="text-lg font-bold text-blue-600">
                      {selectedFirm.funding_info}
                    </p>
                  </div>
                )}

                {selectedFirm.typical_check && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-600 mb-1">Check Size</p>
                    <p className="text-lg font-bold text-green-600">
                      {selectedFirm.typical_check}
                    </p>
                  </div>
                )}
              </div>

              {/* Investment Stages */}
              {selectedFirm.investment_stages && selectedFirm.investment_stages.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-3">Investment Stages</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedFirm.investment_stages.map(stage => (
                      <Badge key={stage} variant="outline">
                        {stage}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Focus Areas */}
              {selectedFirm.focus_areas && selectedFirm.focus_areas.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-3">Focus Areas</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedFirm.focus_areas.map((area, idx) => {
                      const colors = [
                        'bg-green-100 text-green-700',
                        'bg-blue-100 text-blue-700',
                        'bg-orange-100 text-orange-700',
                        'bg-purple-100 text-purple-700',
                      ];
                      return (
                        <span
                          key={area}
                          className={`px-3 py-1 rounded-full text-sm font-medium ${colors[idx % colors.length]}`}
                        >
                          {area.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Portfolio Companies */}
              {selectedFirm.portfolio && selectedFirm.portfolio.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-3">Select Portfolio Companies</p>
                  <div className="space-y-3">
                    {selectedFirm.portfolio.slice(0, 3).map((company, index) => (
                      <div key={index} className="border-l-4 border-indigo-500 pl-3 py-1">
                        <h4 className="font-semibold text-gray-800">{company.name}</h4>
                        <p className="text-sm text-gray-600">{company.description}</p>
                      </div>
                    ))}
                    {selectedFirm.portfolio.length > 3 && (
                      <p className="text-sm text-gray-500 italic">+{selectedFirm.portfolio.length - 3} more companies</p>
                    )}
                  </div>
                </div>
              )}

              {/* Notable Exits */}
              {selectedFirm.exits && selectedFirm.exits.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-3">Notable Exits</p>
                  <div className="space-y-3">
                    {selectedFirm.exits.slice(0, 3).map((company, index) => (
                      <div key={index} className="border-l-4 border-green-500 pl-3 py-1">
                        <h4 className="font-semibold text-gray-800">{company.name}</h4>
                        <p className="text-sm text-gray-600">{company.description}</p>
                      </div>
                    ))}
                    {selectedFirm.exits.length > 3 && (
                      <p className="text-sm text-gray-500 italic">+{selectedFirm.exits.length - 3} more exits</p>
                    )}
                  </div>
                </div>
              )}

              {/* Investment Criteria */}
              {selectedFirm.internal_parameters && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-3">Investment Criteria</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedFirm.internal_parameters.sector_restriction && (
                      <Badge variant="destructive" className="text-xs">Sector Restricted</Badge>
                    )}
                    {selectedFirm.internal_parameters.revenue_only && (
                      <Badge variant="destructive" className="text-xs">Revenue Required</Badge>
                    )}
                    {selectedFirm.internal_parameters.team_required && (
                      <Badge variant="destructive" className="text-xs">Team Required</Badge>
                    )}
                    {selectedFirm.internal_parameters.investment_frozen && (
                      <Badge variant="secondary" className="text-xs bg-gray-200 text-gray-700">Investment Frozen</Badge>
                    )}
                    {(!selectedFirm.internal_parameters.sector_restriction && 
                      !selectedFirm.internal_parameters.revenue_only && 
                      !selectedFirm.internal_parameters.team_required && 
                      !selectedFirm.internal_parameters.investment_frozen) && (
                      <Badge variant="default" className="text-xs bg-green-100 text-green-800">Open to All</Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Contact Button */}
              <div className="pt-4">
                <VCFirmContactModal firm={selectedFirm} venture={venture} />
                {venture && (!venture.pitch_created || !venture.funding_plan_completed) && (
                  <p className="mt-3 text-sm text-red-600 text-center">
                    You must complete your Venture Pitch and Funding Plan before contacting VC firms.
                  </p>
                )}
              </div>

            </CardContent>
          </Card>
        </div>
      )}

      <style jsx global>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}
