// financials 21226
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Venture, User, VentureMessage, PromotionCampaign, FundingEvent } from "@/api/entities";
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
  const [liveBalance, setLiveBalance] = useState(0);
  // [FIX] מקור אמת אחד: funding_events במקום venture_messages
  const [fundingEvents, setFundingEvents] = useState([]);
  const router = useRouter();

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const currentUser = await User.me();
      const ventures = await Venture.filter({ created_by: currentUser.email }, "-created_date");

      if (ventures.length > 0) {
        const v = ventures[0];
        setVenture(v);
        // [FIX] טוענים funding_events כמקור אמת להשקעות
        const events = await FundingEvent.filter({ venture_id: v.id }, "-created_date");
        const cmps = await PromotionCampaign.filter({ venture_id: v.id }, "-created_date");
        setFundingEvents(events);
        setCampaigns(cmps);
      }
    } catch (e) {
      console.error("Load error:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // [FIX] חישוב יתרה מ-venture.virtual_capital (מקור אמת בDB) + שריפה בזמן אמת
  // לא מחשבים מהודעות - הDB כבר מעודכן נכון כשיש השקעה
  const updateTick = useCallback(() => {
    if (!venture) return;

    const startingCapital = venture.virtual_capital || 15000;
    const monthlyBurn = venture.monthly_burn_rate || 5000;

    if (!venture.burn_rate_start) {
      setLiveBalance(startingCapital);
      return;
    }

    const startTime = new Date(venture.burn_rate_start).getTime();
    const now = new Date().getTime();
    const secondsElapsed = (now - startTime) / 1000;
    const burnPerSecond = monthlyBurn / (30 * 24 * 60 * 60);

    const calculated = Math.floor(Math.max(0, startingCapital - (secondsElapsed * burnPerSecond)));
    setLiveBalance(calculated);
  }, [venture]);

  useEffect(() => {
    updateTick();
    const interval = setInterval(updateTick, 1000);
    return () => clearInterval(interval);
  }, [updateTick]);

  if (isLoading) return <div className="p-8 text-center font-bold">Loading...</div>;
  if (!venture) return <div className="p-8 text-center">No Venture Found</div>;

  // משתני עזר לתצוגה
  const displayBurnRate = venture.monthly_burn_rate || 5000;

  // [FIX] סה"כ השקעות מ-funding_events (מקור אמת) ולא מהודעות
  const displayTotalFunding = fundingEvents.reduce((s, e) => s + (e.amount || 0), 0);

  // [FIX] ערך אחזקות מייסד: venture.valuation מ-DB הוא מקור האמת
  // ה-valuation מתעדכן בDB בכל השקעה (ב-handleInvestmentDecision בדשבורד)
  const founderEquityValue = (() => {
    let founderEquity = 1;
    // עוברים על כל אירועי ההשקעה ומחשבים אחוז מניות שנמכר
    fundingEvents.forEach(e => {
      if (e.amount && venture.valuation) {
        const sold = e.amount / venture.valuation;
        founderEquity *= (1 - sold);
      }
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-indigo-600 text-white shadow-xl border-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 opacity-90 text-white">
              <Wallet className="w-5 h-5" /> Current Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold font-mono">${liveBalance.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-red-500 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-red-600" /> Monthly Burn Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-red-600 font-mono">${displayBurnRate.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-t-4 border-t-green-500 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" /> Total Funding Received
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">${displayTotalFunding.toLocaleString()}</div>
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
       <Card className="border-t-4 border-t-purple-500 shadow-md">
  <CardHeader className="pb-2">
    <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
      <TrendingUp className="w-5 h-5 text-purple-600" /> Company Valuation
    </CardTitle>
  </CardHeader>
  <CardContent>
    <div className="text-3xl font-bold text-gray-900">
      ${(venture.valuation || 0).toLocaleString()}
    </div>
  </CardContent>
</Card>

      </div>

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
          <CardContent className="pt-4 max-h-[200px] overflow-y-auto">
            {/* [FIX] קריאה מ-funding_events עם פרטי משקיע מלאים */}
            {fundingEvents.length === 0 ? (
              <p className="text-gray-400 text-sm italic py-2">No investments recorded yet.</p>
            ) : (
              fundingEvents.map((e, i) => (
                <div key={i} className="py-2 border-b last:border-0">
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-gray-800">{e.investor_name || 'Unknown Investor'}</span>
                    <span className="font-bold text-green-600">${(e.amount || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-0.5">
                    <span>{e.investor_name || e.investment_type || 'VC'}</span>
                    {venture.valuation && (
                      <span>@ ${venture.valuation.toLocaleString()} valuation</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}