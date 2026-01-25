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

      if (!ventures.length) {
        setVenture(null);
        return;
      }

      const currentVenture = ventures[0];
      setVenture(currentVenture);

      setMessages(await VentureMessage.filter({ venture_id: currentVenture.id }, "-created_date"));
      setCampaigns(await PromotionCampaign.filter({ venture_id: currentVenture.id }, "-created_date"));
    } catch (e) {
      console.error("Financial load error:", e);
      setVenture(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // לוגיקה פיננסית מהקובץ המקורי
  const currentBalance = venture?.virtual_capital || 0; // היתרה הדינמית מה-DB
  const monthlyBurn = venture?.monthly_burn_rate || 0;

  // חישוב גיוסים (מתוך הקובץ)
  const totalFunding = messages
    .filter(m => m.message_type === "investment_offer" && m.investment_offer_status === "accepted")
    .reduce((s, m) => s + (m.investment_offer_checksize || 0), 0);

  // חישוב Equity (מתוך הקובץ)
  const founderEquityValue = (() => {
    if (!venture) return 0;
    let founderEquity = 1;
    messages
      .filter(m => m.message_type === "investment_offer" && m.investment_offer_status === "accepted" && m.investment_offer_checksize && m.investment_offer_valuation)
      .forEach(m => {
        const sold = m.investment_offer_checksize / m.investment_offer_valuation;
        founderEquity *= (1 - sold);
      });
    return Math.round(founderEquity * (venture.valuation || 0));
  })();

  // חישוב הוצאות קידום (ה-Promotion האמיתי מהקוד שלך)
  const totalPromotionSpending = campaigns.reduce((s, c) => s + (c.cost || 0), 0);

  const formatMoney = n =>
    n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M` :
    n >= 1_000 ? `$${Math.round(n / 1000)}K` :
    `$${n || 0}`;

  if (isLoading) return <div className="min-h-screen flex items-center justify-center font-bold">Loading...</div>;
  if (!venture) return <div className="p-8 text-center">No Venture Found</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        
        <Button variant="ghost" onClick={() => router.push(createPageUrl("Dashboard"))} className="mb-2">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </Button>

        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Financial Overview</h1>

        {/* METRICS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* היתרה הנוכחית - הזרקה של ה-15K שהופכים לדינמיים */}
          <Card className="bg-indigo-600 text-white shadow-xl border-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
                <Wallet className="w-4 h-4" /> Current Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">${currentBalance.toLocaleString()}</p>
              <p className="text-xs mt-1 opacity-70 italic">Available liquid capital</p>
            </CardContent>
          </Card>

          <Card className="border-t-4 border-t-green-500 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-500">Total Funding Received</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">${totalFunding.toLocaleString()}</p>
            </CardContent>
          </Card>

          <Card className="border-t-4 border-t-indigo-500 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-500">Founder Equity Value</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-indigo-600">${founderEquityValue.toLocaleString()}</p>
              <p className="text-xs text-gray-400 mt-1 italic">Post-dilution value</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* שריפה חודשית */}
          <Card className="border-l-4 border-l-red-500 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-700">
                <TrendingUp className="w-5 h-5 text-red-500" /> Burn Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-red-600">{formatMoney(monthlyBurn)}</p>
              <p className="text-xs text-gray-400 mt-1">Monthly operational cost</p>
            </CardContent>
          </Card>

          {/* PROMOTION SPENDING - מבוסס על ה-Campaigns מהקובץ */}
          <Card className="border-l-4 border-l-amber-500 shadow-sm bg-amber-50/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-800">
                <Zap className="w-5 h-5 text-amber-500" /> Promotion Spending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-amber-700">${totalPromotionSpending.toLocaleString()}</p>
              <p className="text-xs text-amber-600/70 mt-1 font-medium">Accumulated marketing costs</p>
            </CardContent>
          </Card>
        </div>

        {/* היסטוריית השקעות */}
        <Card className="shadow-sm border-gray-200">
          <CardHeader className="bg-gray-50/50 border-b">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-600" /> Investment History
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {messages.filter(msg => msg.message_type === 'investment_offer' && msg.investment_offer_status === 'accepted').length === 0 ? (
              <p className="text-gray-400 text-center py-8 italic">No investments received yet.</p>
            ) : (
              <div className="space-y-3">
                {messages
                  .filter(msg => msg.message_type === 'investment_offer' && msg.investment_offer_status === 'accepted')
                  .map((msg, index) => (
                    <div key={index} className="flex justify-between items-center p-4 bg-green-50 rounded-xl border border-green-100">
                      <div>
                        <p className="font-bold text-gray-900">{msg.vc_firm_name || 'Angel Investor'}</p>
                        <p className="text-xs text-gray-500">{new Date(msg.created_date).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-green-600">+${(msg.investment_offer_checksize || 0).toLocaleString()}</p>
                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Accepted</p>
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