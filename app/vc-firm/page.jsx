import React, { useState, useEffect } from 'react';
import { VCFirm } from '@/src/api/entities';
import { Venture } from '@/src/api/entities';
import { VentureMessage } from '@/src/api/entities';
import { User } from '@/src/api/entities';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Building2, Target, DollarSign, TrendingUp, Users, Mail, CheckCircle, X, ChevronsRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createPageUrl } from '@/utils';

const VCFirmContactModal = ({ firm, venture, canApply }) => {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const router = useRouter();

  const handleApply = async () => {
    if (!venture) {
      alert("No active venture found.");
      return;
    }
    setIsSending(true);

    const params = firm.screening_parameters || {};
    let rejectionReason = null;
    let rejectionDetails = null;

    // Stage 1: Automated Screening
    if (params.freeze_investment) {
      rejectionReason = params.rejection_messages?.freeze || "Thank you for the time you've invested in this process. While we were very impressed by your presentation, we have made the difficult decision to pause all new investments at this time. This is not a reflection of your venture's potential, but rather a temporary shift in our fund's strategy.";
    } else if (params.team_focus && (venture.founders_count || 1) < 2) {
      rejectionReason = params.rejection_messages?.team || "Your venture's potential is clear, but we've found that our most successful partnerships are with teams that have multiple co-founders. We strongly believe that a diverse founding team is a key indicator of future success. We encourage you to seek out a co-founder who can help you build your vision.";
    } else if (params.sector_focus && !firm.focus_areas?.includes(venture.sector)) {
      rejectionReason = params.rejection_messages?.sector || "Thank you for sharing your innovative work with us. While your vision is compelling, it doesn't align with our current investment thesis. We wish you the best of luck in finding the right partner to help you grow.";
    } else if (params.phase_focus && !['mlp', 'growth', 'ma'].includes(venture.phase)) {
       rejectionReason = params.rejection_messages?.phase || "We typically invest in companies with more established traction. We encourage you to re-apply once you've reached the MLP phase or beyond.";
    }

    try {
      if (rejectionReason) {
        // Create rejection message
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
        // Create invitation message for Stage 2
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
      
      // Redirect to dashboard
      navigate(createPageUrl('Dashboard'));

    } catch (error) {
      console.error("Failed to send application:", error);
      alert("There was an error processing your application. Please try again.");
      setIsSending(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white" disabled={!canApply}>
          <Mail className="w-5 h-5 mr-2" />
          Contact Firm
        </Button>
      </DialogTrigger>
      <DialogContent>
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


export default function VCFirmPage() {
  const [firm, setFirm] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userVenture, setUserVenture] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const slug = urlParams.get('slug');

        if (slug) {
          const firms = await VCFirm.filter({ slug: slug });
          if (firms.length > 0) {
            setFirm(firms[0]);
          }
        }

        const user = await User.me();
        const userVentures = await Venture.filter({ created_by: user.email }, "-created_date");
        if (userVentures.length > 0) {
          setUserVenture(userVentures[0]);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      }
      setIsLoading(false);
    };

    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!firm) {
    return (
      <div className="flex h-full w-full items-center justify-center p-8">
        <Card className="text-center p-8">
          <CardTitle>Firm Not Found</CardTitle>
          <CardDescription>The VC firm you're looking for could not be found.</CardDescription>
        </Card>
      </div>
    );
  }

  const canApply = userVenture && userVenture.pitch_created && userVenture.funding_plan_completed;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row gap-8 items-start mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Building2 className="w-12 h-12 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2">{firm.name}</h1>
            <p className="text-lg text-gray-600">
              {firm.background}
            </p>
            <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
              {firm.founded && <span>Founded in {firm.founded}</span>}
              {firm.funding_info && <span className="hidden md:block">|</span>}
              {firm.funding_info && <span>{firm.funding_info}</span>}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mb-12">
          <VCFirmContactModal firm={firm} venture={userVenture} canApply={canApply} />
          {!canApply && (
            <p className="text-sm text-red-600 mt-2">
              You must complete your Venture Pitch and Funding Plan before contacting VC firms.
            </p>
          )}
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="md:col-span-2 space-y-8">
            {firm.portfolio && firm.portfolio.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Select Portfolio Companies</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {firm.portfolio.map((company, index) => (
                    <div key={index} className="border-b pb-4 last:border-b-0">
                      <h3 className="font-semibold text-gray-800">{company.name}</h3>
                      <p className="text-sm text-gray-600">{company.description}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {firm.exits && firm.exits.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Notable Exits</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {firm.exits.map((company, index) => (
                    <div key={index} className="border-b pb-4 last:border-b-0">
                      <h3 className="font-semibold text-gray-800">{company.name}</h3>
                      <p className="text-sm text-gray-600">{company.description}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column / Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-indigo-600" />
                  Investment Focus
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {firm.focus_areas && firm.focus_areas.length > 0 ? (
                    firm.focus_areas.map(area => (
                      <Badge key={area} variant="secondary">
                        {area.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Badge>
                    ))
                  ) : (
                    <Badge variant="secondary">Sector Agnostic</Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  Typical Check Size
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{firm.typical_check || "Not disclosed"}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Investment Stages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {firm.investment_stages && firm.investment_stages.length > 0 ? (
                    firm.investment_stages.map(stage => (
                      <Badge key={stage} variant="outline">{stage}</Badge>
                    ))
                  ) : (
                    <Badge variant="outline">All Stages</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}