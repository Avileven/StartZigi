"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Venture, User, VentureMessage } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, TrendingUp, DollarSign, ArrowLeft, Landmark, PieChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { createPageUrl } from "@/lib/utils";

export default function Financials() {
  const [venture, setVenture] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const router = useRouter();

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const currentUser = await User.me();
      setUser(currentUser);

      const ventures = await Venture.filter(
        { created_by: currentUser.email },
        "-created_date"
      );

      if (ventures.length > 0) {
        setVenture(ventures[0]);
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

  // שליפת נתונים דינמית מהדאטהבייס
  const currentBalance = venture.virtual_capital || 0;
  const monthlyBurn = venture.monthly_burn_rate || 0;
  // הנחה: Starting Capital הוא 15,000 כבסיס, או הערך הראשוני אם תרצה לשמור אותו בשדה אחר
  const startingCapital = 15000; 

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push(createPageUrl("Dashboard"))}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Financial Overview</h1>
        </div>
      </div>

      {/* Main Financial Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* יתרה נוכחית - הכרטיס המרכזי */}
        <Card className="bg-indigo-600 text-white shadow-lg border-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90 flex items-center">
              <Wallet className="w-4 h-4 mr-2" />
              Current Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${currentBalance.toLocaleString()}</div>
            <p className="text-xs opacity-75 mt-1">Available funds for operations</p>
          </CardContent>
        </Card>

        {/* הון התחלתי */}
        <Card className="bg-white border-green-100 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
              <Landmark className="w-4 h-4 mr-2 text-green-600" />
              Starting Capital
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">${startingCapital.toLocaleString()}</div>
            <p className="text-xs text-green-600 mt-1 font-medium">Initial Seed Injection</p>
          </CardContent>
        </Card>

        {/* קצב שריפה */}
        <Card className="bg-white border-red-100 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2 text-red-600" />
              Monthly Burn
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${monthlyBurn.toLocaleString()}</div>
            <p className="text-xs text-red-500 mt-1 font-medium">Monthly Outflow</p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-blue-600" />
              Funding & Equity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Total Funding Received</span>
              <span className="font-semibold">$0</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Founder Equity Value</span>
              <span className="font-semibold text-green-600">$0</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Ownership</span>
              <span className="font-semibold text-blue-600">100%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-50 border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
            <PieChart className="w-12 h-12 text-gray-300 mb-4" />
            <h3 className="font-medium text-gray-900">Investor Insights</h3>
            <p className="text-sm text-gray-500 max-w-[200px]">
              Complete your MVP to unlock detailed equity and valuation tracking.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}