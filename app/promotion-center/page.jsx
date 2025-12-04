"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Venture } from '@/api/entities.js';
import { PromotionCampaign } from '@/api/entities.js';
import { User } from '@/api/entities.js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx';
import { createPageUrl } from '@/utils/index.js';
import { ArrowLeft, Users, Mail, TrendingUp, DollarSign, BarChart3, Eye, MousePointerClick } from 'lucide-react';

export default function PromotionCenter() {
  const [venture, setVenture] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const user = await User.me();
        const ventures = await Venture.filter({ created_by: user.email }, "-created_date");
        if (ventures.length > 0) {
          const currentVenture = ventures[0];
          setVenture(currentVenture);
          
          const ventureCampaigns = await PromotionCampaign.filter({ venture_id: currentVenture.id }, "-created_date");
          setCampaigns(ventureCampaigns);
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!venture) {
    return (
      <div className="p-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">No Venture Found</h2>
          <p className="text-gray-600 mb-6">Please create a venture before accessing the promotion center.</p>
          <Button onClick={() => navigate(createPageUrl('CreateVenture'))}>Create Venture</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <Button variant="ghost" onClick={() => navigate(createPageUrl('Dashboard'))} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Promotion Center</h1>
          <p className="text-gray-600">Launch campaigns to market your venture and track results.</p>
        </div>

        <div className="mb-6 bg-white rounded-lg p-4 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Your Venture</p>
              <p className="text-lg font-semibold">{venture.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Virtual Capital</p>
              <p className="text-2xl font-bold text-green-600">
                ${(venture.virtual_capital || 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {campaigns.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Campaign Results</h2>
            <div className="space-y-4">
              {campaigns.map((campaign) => (
                <Card key={campaign.id} className="bg-white">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {campaign.campaign_type === 'in-app' ? 'In-App Promotion' : 'Email Campaign'}
                        </CardTitle>
                        <CardDescription>
                          {campaign.campaign_type === 'in-app' && campaign.tagline && `"${campaign.tagline}"`}
                          {campaign.campaign_type === 'email' && campaign.sender_name && `From: ${campaign.sender_name}`}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Cost</p>
                        <p className="text-lg font-bold text-red-600">-${campaign.cost.toLocaleString()}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <BarChart3 className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-blue-600">{campaign.audience_size}</p>
                        <p className="text-xs text-gray-600">
                          {campaign.campaign_type === 'in-app' ? 'Invites Sent' : 'Emails Sent'}
                        </p>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <Eye className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-purple-600">{campaign.views || 0}</p>
                        <p className="text-xs text-gray-600">
                          {campaign.campaign_type === 'in-app' ? 'Invites Viewed' : 'Emails Opened'}
                        </p>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <MousePointerClick className="w-6 h-6 text-green-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-green-600">{campaign.clicks || 0}</p>
                        <p className="text-xs text-gray-600">Landing Page Clicks</p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-xs text-gray-500">
                        Launched on {new Date(campaign.created_date).toLocaleDateString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Launch New Campaign</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(createPageUrl('Promotion?type=in-app'))}>
            <CardHeader>
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-indigo-600" />
              </div>
              <CardTitle>In-App Promotion Package</CardTitle>
              <CardDescription>
                Reach registered platform users with targeted invitations to visit your landing page and provide feedback.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600 mb-4">
                <li className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  Target platform community
                </li>
                <li className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-green-500" />
                  Choose audience size (50-500 users)
                </li>
                <li className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-yellow-500" />
                  Costs virtual currency
                </li>
              </ul>
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                Select In-App Package
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(createPageUrl('Promotion?type=email'))}>
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Mail className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle>Invite a Friend (via Email)</CardTitle>
              <CardDescription>
                Send personalized email invitations to external contacts, providing temporary access to your landing page.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                <p className="text-sm font-semibold text-green-800">This service is currently FREE!</p>
              </div>
              <ul className="space-y-2 text-sm text-gray-600 mb-4">
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-green-500" />
                  Reach external audiences
                </li>
                <li className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-green-500" />
                  Temporary page access
                </li>
                <li className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-500" />
                  Completely free
                </li>
              </ul>
              <Button className="w-full bg-green-600 hover:bg-green-700">
                Create Email Invite
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}