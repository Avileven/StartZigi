"use client";
import React, { useState, useEffect } from 'react';
import { PromotionCampaign } from '@/api/entities.js';
import { Venture } from '@/api/entities.js';
import { User } from '@/api/entities.js';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx';
import { Badge } from '@/components/ui/badge';
import { Loader2, Users, Mail, BarChart3, Eye, MousePointerClick } from 'lucide-react';
import { format } from 'date-fns';

export default function PromotionReport() {
  const [campaigns, setCampaigns] = useState([]);
  const [ventures, setVentures] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadReports = async () => {
      try {
        const user = await User.me();
        const userCampaigns = await PromotionCampaign.filter({ created_by: user.email }, "-created_date");
        setCampaigns(userCampaigns);

        const ventureIds = [...new Set(userCampaigns.map(c => c.venture_id))];
        const ventureData = {};
        for (const id of ventureIds) {
          const venture = await Venture.filter({ id });
          if(venture.length > 0) {
            ventureData[id] = venture[0];
          }
        }
        setVentures(ventureData);

      } catch (error) {
        console.error("Error loading promotion reports:", error);
      }
      setIsLoading(false);
    };
    loadReports();
  }, []);

  if (isLoading) {
    return <div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto"/></div>;
  }

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
            <div className="w-16 h-16 bg-gradient-to-r from-teal-400 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Promotion Reports</h1>
            <p className="text-lg text-gray-600">Review the performance of your marketing campaigns.</p>
        </div>

        {campaigns.length === 0 ? (
          <Card className="text-center p-8">
            <CardTitle>No Campaigns Found</CardTitle>
            <CardDescription>You haven't launched any promotion campaigns yet. Go to the Promotion Center to get started.</CardDescription>
          </Card>
        ) : (
          <div className="space-y-6">
            {campaigns.map(campaign => {
              const ventureName = ventures[campaign.venture_id]?.name || 'Unknown Venture';
              const isEmail = campaign.campaign_type === 'email';
              return (
                <Card key={campaign.id} className="overflow-hidden">
                  <CardHeader className="bg-gray-100/80 p-4 border-b">
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="text-lg">{ventureName} - {isEmail ? 'Email' : 'In-App'} Campaign</CardTitle>
                        <CardDescription>{format(new Date(campaign.created_date), 'MMMM d, yyyy')}</CardDescription>
                      </div>
                      <Badge variant={isEmail ? 'success' : 'info'}>{isEmail ? 'Email' : 'In-App'}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-500 flex items-center justify-center gap-2 mb-1">{isEmail ? <Mail className="w-4 h-4"/> : <Users className="w-4 h-4"/>} {isEmail ? 'Emails Sent' : 'Invites Sent'}</p>
                            <p className="text-2xl font-bold">{campaign.audience_size}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-500 flex items-center justify-center gap-2 mb-1"><Eye className="w-4 h-4"/> {isEmail ? 'Opens (N/A)' : 'Views'}</p>
                            <p className="text-2xl font-bold">{isEmail ? 'N/A' : campaign.views}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-500 flex items-center justify-center gap-2 mb-1"><MousePointerClick className="w-4 h-4"/> Clicks</p>
                            <p className="text-2xl font-bold">{isEmail ? 'N/A' : campaign.clicks}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-500 mb-1">Cost</p>
                            <p className="text-2xl font-bold text-red-600">${campaign.cost.toLocaleString()}</p>
                        </div>
                    </div>
                    {(campaign.tagline || campaign.sender_name) &&
                      <div className="mt-4 text-sm text-gray-600 bg-gray-50 p-2 rounded-md">
                        <strong>{isEmail ? 'Sender:' : 'Tagline:'}</strong> <em>"{isEmail ? campaign.sender_name : campaign.tagline}"</em>
                      </div>
                    }
                    {isEmail && <p className="text-xs text-center mt-4 text-gray-500">Email open and click tracking is not available for this campaign type.</p>}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  );
}