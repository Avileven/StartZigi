"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Venture, User, VentureMessage } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, TrendingUp, DollarSign, ArrowLeft, History, PieChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { createPageUrl } from "@/lib/utils";

export default function Financials() {
  const [venture, setVenture] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const router = useRouter();

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const currentUser = await User.me();
      const ventures = await Venture.filter({ created_by: currentUser.email }, "-created_date");

      if (ventures.length > 0) {
        const currentVenture = ventures[0];
        setVenture(currentVenture);
        
        // טעינת הודעות לטובת היסטוריית גיוסים
        const ventureMessages = await VentureMessage.filter({ venture_id: currentVenture.id });
        setMessages(ventureMessages);
      }
    } catch (e) {
      console.error("Error loading financials:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (isLoading) return <div className="p-8 text-center font-medium">Loading Financials...</div>;
  if (!venture) return <div className="p-8 text-center">No venture found.</div>;

  // הנתונים הדינמיים מה-Database
  const currentBalance = venture.virtual_capital || 0;
  const monthlyBurn = venture.monthly_burn_rate || 0;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <Button variant="outline" size="icon" onClick={() => router.push(createPageUrl("Dashboard"))}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Financials</h1>
      </div>

      {/* מדדים מרכזיים */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* יתרה נוכחית - הכרטיס הכי בולט */}
        <Card className="bg-indigo-600 text-white shadow-xl border-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 opacity-90">
              <Wallet className="w-5 h-5" />
              Current Venture Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold">${currentBalance.toLocaleString()}</div>
            <p className="text-xs mt-3 opacity-80 italic">Remaining capital after operational burn</p>
          </CardContent>
        </Card>

        {/* קצב שריפה - באדום */}
        <Card className="border-t-4 border-t-red-500 shadow-md bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-red-600" />
              Monthly Burn Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">${monthlyBurn.toLocaleString()}</div>
            <p className="text-xs text-red-400 mt-1 font-medium italic">Fixed monthly deduction</p>
          </CardContent>
        </Card>
      </div>

      {/* פירוט נוסף */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* כרטיס אקוויטי */}
        <Card className="shadow-sm border-gray-200">
          <CardHeader className="bg-gray-50 border-b px-4 py-3">
            <CardTitle className="text-md font-bold text-gray-700 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-blue-600" />
              Equity & Ownership
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600 font-medium">Founder Ownership</span>
              <span className="font-bold text-indigo-600">100%</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600 font-medium">Total Funding Received</span>
              <span className="font-bold text-gray-900">$0</span>
            </div>
          </CardContent>
        </Card>

        {/* היסטוריית גיוסים */}
        <Card className="shadow-sm border-gray-200">
          <CardHeader className="bg-gray-50 border-b px-4 py-3">
            <CardTitle className="text-md font-bold text-gray-700 flex items-center gap-2">
              <History className="w-5 h-5 text-green-600" />
              Investment History
            </CardTitle>
          </CardHeader>
          <CardContent className="py-10 text-center text-gray-400 italic text-sm">
            No funding rounds yet. Complete your MVP to attract investors.
          </CardContent>
        </Card>

      </div>
    </div>
  );
}