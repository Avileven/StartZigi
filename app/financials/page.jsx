"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Venture, User, VentureMessage } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, TrendingUp, DollarSign, ArrowLeft, Landmark, History } from "lucide-react";
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

  if (isLoading) return <div className="p-8 text-center font-bold">Loading...</div>;
  if (!venture) return <div className="p-8 text-center">Venture not found.</div>;

  // Pure Database Values
  const currentBalance = venture.virtual_capital || 0;
  const monthlyBurn = venture.monthly_burn_rate || 0;
  // Dynamic starting capital from DB
  const initialCapital = venture.initial_virtual_capital || 0; 

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <Button variant="outline" size="icon" onClick={() => router.push(createPageUrl("Dashboard"))}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Financial Management</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Current Balance - Main Card */}
        <Card className="bg-indigo-600 text-white shadow-xl border-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 opacity-90">
              <Wallet className="w-5 h-5" />
              Current Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">${currentBalance.toLocaleString()}</div>
            <p className="text-xs mt-2 opacity-80 italic">Real-time funds available</p>
          </CardContent>
        </Card>

        {/* Initial Capital - From DB */}
        <Card className="border-t-4 border-t-green-500 shadow-md bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <Landmark className="w-5 h-5 text-green-600" />
              Starting Capital
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">${initialCapital.toLocaleString()}</div>
            <p className="text-xs text-green-600 mt-1 font-medium italic">Initial database allocation</p>
          </CardContent>
        </Card>

        {/* Burn Rate */}
        <Card className="border-t-4 border-t-red-500 shadow-md bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-red-600" />
              Monthly Burn Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">${monthlyBurn.toLocaleString()}</div>
            <p className="text-xs text-red-400 mt-1 font-medium italic">Operational expenses</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-sm border-gray-200">
          <CardHeader className="bg-gray-50 border-b">
            <CardTitle className="text-lg font-bold flex items-center gap-2 text-gray-800">
              <DollarSign className="w-5 h-5 text-blue-600" />
              Equity & Funding
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Total External Funding</span>
              <span className="font-bold text-gray-900">$0</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Current Ownership</span>
              <span className="font-bold text-indigo-600">100%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-gray-200">
          <CardHeader className="bg-gray-50 border-b">
            <CardTitle className="text-lg font-bold flex items-center gap-2 text-gray-800">
              <History className="w-5 h-5" />
              Transaction History
            </CardTitle>
          </CardHeader>
          <CardContent className="py-10 text-center text-gray-400 italic">
            No external transactions found in database.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}