import React, { useState, useEffect } from 'react';
import { Venture } from '@/api/entities';
import { VentureMessage } from '@/api/entities';
import { PromotionCampaign } from '@/api/entities';
import { User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Megaphone, ArrowLeft, AlertTriangle } from 'lucide-react';

const PACKAGES = [
  { size: 50, cost: 500 },
  { size: 100, cost: 900 },
  { size: 250, cost: 2000 },
  { size: 500, cost: 3500 },
];

const MAX_MESSAGES_PER_VENTURE_PER_WEEK = 3;

export default function InAppPromotion({ goBack }) {
  const [venture, setVenture] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [tagline, setTagline] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadVenture = async () => {
      setIsLoading(true);
      try {
        const user = await User.me();
        const ventures = await Venture.filter({ created_by: user.email }, '-created_date');
        if (ventures.length > 0) {
          setVenture(ventures[0]);
        }
      } catch (error) {
        console.error('Error loading venture:', error);
      }
      setIsLoading(false);
    };
    loadVenture();
  }, []);

  const handleLaunchCampaign = async () => {
    if (!selectedPackage || !tagline.trim() || !venture) {
      alert('Please select a package and provide a tagline.');
      return;
    }

    if (venture.virtual_capital < selectedPackage.cost) {
      alert('Insufficient virtual capital for this package.');
      return;
    }

    setIsSubmitting(true);
    try {
      const allVentures = await Venture.list('-created_date', 1000);
      const targetVentures = allVentures.filter(v => v.id !== venture.id);

      if (targetVentures.length === 0) {
        alert('No other ventures available to promote to at this time.');
        setIsSubmitting(false);
        return;
      }

      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const oneWeekAgoISO = oneWeekAgo.toISOString();

      const eligibleVentures = [];
      for (const targetVenture of targetVentures) {
        const recentMessages = await VentureMessage.filter({
          venture_id: targetVenture.id,
          message_type: 'feedback_request',
          created_date: { $gte: oneWeekAgoISO }
        });
        
        if (recentMessages.length < MAX_MESSAGES_PER_VENTURE_PER_WEEK) {
          eligibleVentures.push(targetVenture);
        }
      }

      if (eligibleVentures.length === 0) {
        alert('All ventures have reached their weekly message limit. Please try again later.');
        setIsSubmitting(false);
        return;
      }

      const actualAudienceSize = Math.min(selectedPackage.size, eligibleVentures.length);
      const shuffled = eligibleVentures.sort(() => 0.5 - Math.random());
      const selectedTargets = shuffled.slice(0, actualAudienceSize);

      const campaign = await PromotionCampaign.create({
        venture_id: venture.id,
        campaign_type: 'in-app',
        audience_size: actualAudienceSize,
        cost: selectedPackage.cost,
        tagline: tagline,
      });

      let messageTitle = '';
      let messageContent = '';
      
      if (venture.phase === 'mvp' || venture.phase === 'mlp') {
        messageTitle = `💡 Check out ${venture.name}!`;
        messageContent = `${tagline}\n\nThey're looking for feedback on their ${venture.phase === 'mvp' ? 'MVP' : 'MLP'}. Visit their page and share your thoughts!`;
      } else if (venture.phase === 'beta' || venture.phase === 'growth') {
        messageTitle = `🚀 Join ${venture.name}'s Beta Program!`;
        messageContent = `${tagline}\n\nThey're looking for beta testers! Sign up to be among the first to try their product.`;
      } else {
        messageTitle = `✨ Discover ${venture.name}!`;
        messageContent = `${tagline}\n\nCheck out what they're building!`;
      }

      for (const target of selectedTargets) {
        await VentureMessage.create({
          venture_id: target.id,
          message_type: 'feedback_request',
          title: messageTitle,
          content: messageContent,
          from_venture_id: venture.id,
          from_venture_name: venture.name,
          from_venture_landing_page_url: venture.landing_page_url,
          campaign_id: campaign.id,
          phase: target.phase,
          priority: 1,
        });
      }

      await Venture.update(venture.id, {
        virtual_capital: venture.virtual_capital - selectedPackage.cost,
      });

      await VentureMessage.create({
        venture_id: venture.id,
        message_type: 'system',
        title: '📣 Campaign Launched!',
        content: `Your in-app promotion campaign has been launched to ${actualAudienceSize} ventures. Track results in your Promotion Reports.`,
        phase: venture.phase,
        priority: 2,
      });

      alert(`Campaign launched successfully to ${actualAudienceSize} ventures!`);
      goBack();
    } catch (error) {
      console.error('Error launching campaign:', error);
      alert('There was an error launching your campaign. Please try again.');
    }
    setIsSubmitting(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!venture) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">No Venture Found</h2>
            <p className="text-gray-600 mb-4">You need to create a venture first.</p>
            <Button onClick={goBack}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={goBack} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Promotion Center
        </Button>

        <Card className="shadow-xl">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <Megaphone className="w-8 h-8 text-indigo-600" />
              In-App Promotion Package
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-4">Select Your Package</h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {PACKAGES.map((pkg) => (
                    <Card
                      key={pkg.size}
                      className={`cursor-pointer transition-all ${
                        selectedPackage?.size === pkg.size
                          ? 'border-2 border-indigo-600 shadow-lg'
                          : 'hover:shadow-md'
                      }`}
                      onClick={() => setSelectedPackage(pkg)}
                    >
                      <CardContent className="p-4 text-center">
                        <p className="text-3xl font-bold text-indigo-600 mb-2">{pkg.size}</p>
                        <p className="text-sm text-gray-600 mb-3">ventures reached</p>
                        <p className="text-lg font-semibold">${pkg.cost.toLocaleString()}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="tagline">Campaign Tagline *</Label>
                <Textarea
                  id="tagline"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="Write a compelling tagline that will appear in the notification (e.g., 'Revolutionary AI tool that saves you 10 hours per week!')"
                  className="mt-2 min-h-[100px]"
                />
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">How It Works:</h4>
                <ul className="text-sm text-blue-800 space-y-1 list-disc pl-5">
                  <li>Your message appears on other entrepreneurs' dashboards</li>
                  <li>Message content is customized based on your venture's phase (feedback request for MVP/MLP, beta signup for Beta/Growth)</li>
                  <li>Users can click to visit your landing page</li>
                  <li>Track clicks and views in Promotion Reports</li>
                  <li>Each venture receives max {MAX_MESSAGES_PER_VENTURE_PER_WEEK} promotional messages per week (to prevent spam)</li>
                </ul>
              </div>

              {selectedPackage && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total Cost:</span>
                    <span className="text-2xl font-bold text-indigo-600">
                      ${selectedPackage.cost.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2 text-sm">
                    <span>Your Virtual Capital:</span>
                    <span className={venture.virtual_capital < selectedPackage.cost ? 'text-red-600 font-semibold' : 'text-gray-600'}>
                      ${venture.virtual_capital.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              <Button
                onClick={handleLaunchCampaign}
                disabled={!selectedPackage || !tagline.trim() || isSubmitting || (venture.virtual_capital < (selectedPackage?.cost || 0))}
                className="w-full"
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Launching Campaign...
                  </>
                ) : (
                  <>
                    <Megaphone className="w-4 h-4 mr-2" />
                    Launch Campaign
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}