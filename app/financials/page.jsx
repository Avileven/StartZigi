"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Venture, User, VentureMessage } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, TrendingUp, DollarSign, ArrowLeft, Zap, Target } from "lucide-react";
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
      const ventures = await Venture.filter(
        { created_by: currentUser.email },
        "-created_date"
      );

      if (ventures.length > 0) {
        const v = ventures[0];
        setVenture(v);
        
        // משיכת הודעות אמיתיות מהטבלה עבור ה-Promotion
        const m = await VentureMessage.filter({ venture_id: v.id });
        setMessages(m);
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

  if (isLoading) return <div className="p-8 text-center">Loading Financials...</div>;
  if (!venture) return <div className="p-8 text-center">No venture found.</div>;

  // נתונים דינמיים מהטבלה
  const currentBalance = venture.virtual_capital || 0;
  const monthlyBurn = venture.monthly_burn_rate || 0;

  // קוד ה-Promotion המקורי שבודק הודעות בטבלה
  const promotionMessage = messages.find(m => m.message_type === 'promotion');

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push(createPageUrl("Dashboard"))}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">Financial Overview</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-indigo-600 text-white shadow-lg border-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              Current Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">${currentBalance.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="border-red-100 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-red-500" />
              Monthly Burn Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">${monthlyBurn.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* קוד ה-PROMOTION האמיתי שביקשת להחזיר */}
      {promotionMessage && (
        <Card className="bg-amber-50 border-amber-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-amber-800 flex items-center gap-2">
              <Zap className="w-5 h-5 fill-amber-500" />
              {promotionMessage.subject || "Growth Opportunity"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-amber-900 text-sm leading-relaxed">
              {promotionMessage.content}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-sm border-gray-100">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              Equity & Funding
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500">Ownership</span>
              <span className="font-bold">100%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Total Funding</span>
              <span className="font-bold">$0</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-50 flex items-center justify-center p-8 border-dashed border-2">
          <div className="text-center">
            <Target className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500 italic">No investment history yet</p>
          </div>
        </Card>
      </div>
    </div>
  );
}