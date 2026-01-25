// financials 250126
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Venture, User, VentureMessage, PromotionCampaign } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, TrendingUp, DollarSign, ArrowLeft, History, PieChart, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { createPageUrl } from "@/lib/utils";

export default function Financials() {
  const [venture, setVenture] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const router = useRouter();

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const currentUser = await User.me();
      const ventures = await Venture.filter({ created_by: currentUser.email }, "-created_date");

      if (ventures.length > 0) {
        const v = ventures[0];
        setVenture(v);
        setMessages(await VentureMessage.filter({ venture_id: v.id }, "-created_date"));
        setCampaigns(await PromotionCampaign.filter({ venture_id: v.id }, "-created_date"));
      }
    } catch (e) {
      console.error("Load error:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  if (isLoading) return <div className="p-8 text-center font-bold">Loading...</div>;
  if (!venture) return <div className="p-8 text-center">No Venture Found</div>;

  // חישובים מהקובץ המקורי
  const currentBalance = venture.virtual_capital || 0;
  const monthlyBurn = venture.monthly_burn_rate || 0;
  const totalFunding = messages
    .filter(m => m.message_type === "investment_offer" && m.investment_offer_status === "accepted")
    .reduce((s, m) => s + (m.investment_offer_checksize || 0), 0);

  const founderEquityValue = (() => {
    let founderEquity = 1;
    messages
      .filter(m => m.message_type === "investment_offer" && m.investment_offer_status === "accepted" && m.investment_offer_checksize && m.investment_offer_valuation)
      .forEach(m => {
        const sold = m.investment_offer_checksize / m.investment_offer_valuation;
        founderEquity *= (1 - sold);
      });
    return Math.round(founderEquity * (venture.valuation || 0));
  })();

  const totalPromotionSpending = campaigns.reduce((s, c) => s + (c.cost || 0), 0);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <Button variant="outline" size="icon" onClick={() => router.push(createPageUrl("Dashboard"))}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Financials</h1>
      </div>

      {/* Row A: Current Balance, Burn Rate */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-indigo-600 text-white shadow-xl border-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 opacity-90 text-white">
              <Wallet className="w-5 h-5" /> Current Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">${currentBalance.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-red-500 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-red-600" /> Monthly Burn Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-red-600">${monthlyBurn.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Row B: Total Funding Received, Founder Equity Value */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-t-4 border-t-green-500 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" /> Total Funding Received
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">${totalFunding.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-blue-500 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-blue-600" /> Founder Equity Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">${founderEquityValue.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Row C: Promotion Spending, Investment History */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-l-4 border-l-amber-500 bg-amber-50/30 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-amber-800">
              <Zap className="w-5 h-5 text-amber-500" /> Promotion Spending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-700">${totalPromotionSpending.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-gray-200">
          <CardHeader className="bg-gray-50/50 border-b py-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-gray-700">
              <History className="w-5 h-5" /> Investment History
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 max-h-[150px] overflow-y-auto">
            {messages.filter(m => m.message_type === 'investment_offer' && m.investment_offer_status === 'accepted').length === 0 ? (
              <p className="text-gray-400 text-sm italic py-2">No investments recorded yet.</p>
            ) : (
              messages
                .filter(m => m.message_type === 'investment_offer' && m.investment_offer_status === 'accepted')
                .map((m, i) => (
                  <div key={i} className="flex justify-between text-sm py-1 border-b last:border-0">
                    <span className="text-gray-600">{m.vc_firm_name || 'Seed Round'}</span>
                    <span className="font-bold text-green-600">${(m.investment_offer_checksize || 0).toLocaleString()}</span>
                  </div>
                ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}