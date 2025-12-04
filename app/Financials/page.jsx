"use client"
import React, { useState, useEffect, useCallback } from "react";
import { Venture } from "@/api/entities";
import { User } from "@/src/api/entities";
import { VentureMessage } from "@/src/api/entities";
import { PromotionCampaign } from "@/src/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Wallet, 
  TrendingUp, 
  DollarSign,
  ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import { createPageUrl } from "@/lib/utils";

export default function Financials() {
  const [venture, setVenture] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const router = useRouter();

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      const ventures = await Venture.filter({ created_by: currentUser.email }, "-created_date");
      if (ventures.length > 0) {
        const currentVenture = ventures[0];
        setVenture(currentVenture);
        const ventureMessages = await VentureMessage.filter({ venture_id: currentVenture.id }, "-created_date");
        setMessages(ventureMessages);
        const ventureCampaigns = await PromotionCampaign.filter({ venture_id: currentVenture.id }, "-created_date");
        setCampaigns(ventureCampaigns);
      } else {
        setVenture(null);
        setMessages([]);
        setCampaigns([]);
      }
    } catch (error) {
      console.error("Error loading financial data:", error);
      setVenture(null);
      setMessages([]);
      setCampaigns([]);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getTotalFundingReceived = () => {
    const totalFromInvestments = messages
      .filter(msg => msg.message_type === 'investment_offer' && msg.investment_offer_status === 'accepted')
      .reduce((sum, msg) => sum + (msg.investment_offer_checksize || 0), 0);
    
    return totalFromInvestments;
  };

  const getTotalPromotionSpending = () => {
    return campaigns.reduce((sum, campaign) => sum + (campaign.cost || 0), 0);
  };

  const getTotalSpent = () => {
    if (!venture) return 0;
    
    const startingCapital = 15000;
    const totalFunding = getTotalFundingReceived();
    const currentBalance = venture.virtual_capital || 0;
    
    const totalReceived = startingCapital + totalFunding;
    const totalSpent = totalReceived - currentBalance;
    
    return totalSpent > 0 ? totalSpent : 0;
  };

  const formatMoney = (amount) => {
    if (typeof amount !== 'number' || isNaN(amount)) {
      return '$0'; 
    }
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
    return `$${amount}`;
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!venture) {
    return (
      <div className="p-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">No Venture Found</h2>
          <p className="text-gray-600">Create a venture to track your finances.</p>
        </div>
      </div>
    );
  }

  const startingCapital = 15000;
  const totalFunding = getTotalFundingReceived();
  const currentBalance = venture.virtual_capital || 0;
  const totalSpent = getTotalSpent();
  const totalPromotionSpending = getTotalPromotionSpending();
  const monthlyBurn = venture.monthly_burn_rate || 0;

  const dashboardPath = createPageUrl('Dashboard');

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <Button variant="ghost" onClick={() => navigate(dashboardPath)} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Financial Overview</h1>
          <p className="text-gray-600">Track your venture's financial health</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Starting Capital</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-gray-900">${startingCapital.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">Initial funding</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Funding Received</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">${totalFunding.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">From angels & VCs</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Current Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-indigo-600">${currentBalance.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">Available now</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Spent</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-red-600">${totalSpent.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">All expenses</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-indigo-600" />
                Burn Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Monthly Burn Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{formatMoney(monthlyBurn)}</p>
                </div>
                {monthlyBurn > 0 && currentBalance > 0 ? (
                  <div>
                    <p className="text-sm text-gray-500">Runway</p>
                    <p className="text-lg font-semibold text-orange-600">
                      {Math.floor(currentBalance / monthlyBurn)} months
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">
                    {monthlyBurn === 0 
                      ? 'No burn rate set yet. This will be configured in future phases.'
                      : 'Insufficient funds to calculate runway.'}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Funding Sources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Initial Capital</span>
                  <span className="font-semibold">${startingCapital.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Angel & VC Investments</span>
                  <span className="font-semibold text-green-600">${totalFunding.toLocaleString()}</span>
                </div>
                <div className="border-t pt-3 flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-900">Total Raised</span>
                  <span className="font-bold text-lg">${(startingCapital + totalFunding).toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-red-600" />
                Spending Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Promotion Campaigns</span>
                  <span className="font-semibold text-red-600">${totalPromotionSpending.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Burn Rate Deductions</span>
                  <span className="font-semibold text-red-600">${(totalSpent - totalPromotionSpending).toLocaleString()}</span>
                </div>
                <div className="border-t pt-3 flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-900">Total Expenses</span>
                  <span className="font-bold text-lg text-red-600">${totalSpent.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Financial Health Check</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {currentBalance < 5000 && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm font-semibold text-red-800">⚠️ Critical: Low Balance</p>
                    <p className="text-xs text-red-600 mt-1">Your balance is below $5,000. Seek funding immediately.</p>
                  </div>
                )}
                {currentBalance >= 5000 && currentBalance < 10000 && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm font-semibold text-yellow-800">⚠️ Warning: Moderate Balance</p>
                    <p className="text-xs text-yellow-600 mt-1">Consider pitching to angels or VCs soon.</p>
                  </div>
                )}
                {currentBalance >= 10000 && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm font-semibold text-green-800">✅ Healthy: Good Balance</p>
                    <p className="text-xs text-green-600 mt-1">You have sufficient funds to continue development.</p>
                  </div>
                )}
                <div className="pt-2">
                  <p className="text-xs text-gray-500">
                    <strong>Note:</strong> Your balance will decrease over time due to burn rate and promotional spending. Secure funding through Angel Arena or VC Marketplace to grow your capital.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-indigo-600" />
              Investment History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {messages.filter(msg => msg.message_type === 'investment_offer' && msg.investment_offer_status === 'accepted').length === 0 ? (
              <p className="text-gray-500 text-center py-4">No investments received yet. Continue building and pitching!</p>
            ) : (
              <div className="space-y-3">
                {messages
                  .filter(msg => msg.message_type === 'investment_offer' && msg.investment_offer_status === 'accepted')
                  .map((msg, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                      <div>
                        <p className="font-medium text-gray-900">{msg.vc_firm_name || 'Angel Investor'}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(msg.created_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">
                          +${(msg.investment_offer_checksize || 0).toLocaleString()}
                        </p>
                        {msg.investment_offer_valuation && (
                          <p className="text-xs text-gray-500">
                            @ ${(msg.investment_offer_valuation || 0).toLocaleString()} valuation
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}