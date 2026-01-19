
// app/financials 190126 — FIXED & COMMENTED
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Venture, User, VentureMessage, PromotionCampaign } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, TrendingUp, DollarSign, ArrowLeft } from "lucide-react";
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

  /* --------------------------------------------------
     LOAD DATA (NO FINANCIAL LOGIC HERE)
  -------------------------------------------------- */
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const currentUser = await User.me();
      setUser(currentUser);

      const ventures = await Venture.filter(
        { created_by: currentUser.email },
        "-created_date"
      );

      if (!ventures.length) {
        setVenture(null);
        return;
      }

      const currentVenture = ventures[0];
      setVenture(currentVenture);

      setMessages(
        await VentureMessage.filter(
          { venture_id: currentVenture.id },
          "-created_date"
        )
      );

      setCampaigns(
        await PromotionCampaign.filter(
          { venture_id: currentVenture.id },
          "-created_date"
        )
      );
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

  /* --------------------------------------------------
     FINANCIAL CALCULATIONS
  -------------------------------------------------- */

  const STARTING_CAPITAL = 15000;

  // ✅ Total funding actually accepted
  const totalFunding = messages
    .filter(
      m =>
        m.message_type === "investment_offer" &&
        m.investment_offer_status === "accepted"
    )
    .reduce((s, m) => s + (m.investment_offer_checksize || 0), 0);

  // ✅ Founder equity value (post-dilution, correct model)
  const founderEquityValue = (() => {
    if (!venture) return 0;

    let founderEquity = 1;

    messages
      .filter(
        m =>
          m.message_type === "investment_offer" &&
          m.investment_offer_status === "accepted" &&
          m.investment_offer_checksize &&
          m.investment_offer_valuation
      )
      .forEach(m => {
        const sold = m.investment_offer_checksize / m.investment_offer_valuation;
        founderEquity *= 1 - sold;
      });

    return Math.round(founderEquity * (venture.valuation || 0));
  })();

  const totalPromotionSpending = campaigns.reduce(
    (s, c) => s + (c.cost || 0),
    0
  );

  const monthlyBurn = venture?.monthly_burn_rate || 0;

  const formatMoney = n =>
    n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M` :
    n >= 1_000 ? `$${Math.round(n / 1000)}K` :
    `$${n || 0}`;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-b-2 border-indigo-600 rounded-full" />
      </div>
    );
  }

  if (!venture) {
    return <div className="p-8 text-center">No Venture Found</div>;
  }

  /* --------------------------------------------------
     UI
  -------------------------------------------------- */

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">

        <Button
          variant="ghost"
          onClick={() => router.push(createPageUrl("Dashboard"))}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <h1 className="text-3xl font-bold mb-8">Financial Overview</h1>

        {/* TOP METRICS */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">

          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-gray-500">Starting Capital</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">${STARTING_CAPITAL.toLocaleString()}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-gray-500">Total Funding Received</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">
                ${totalFunding.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-gray-500">
                Founder Equity Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-indigo-600">
                ${founderEquityValue.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">
                Post-dilution ownership value
              </p>
            </CardContent>
          </Card>

        </div>

        {/* BURN RATE */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              Burn Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatMoney(monthlyBurn)}</p>
            <p className="text-sm text-gray-500">
              Monthly burn (display only — deduction handled elsewhere)
            </p>
          </CardContent>
        </Card>

        {/* SPENDING */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Promotion Spending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold text-red-600">
              ${totalPromotionSpending.toLocaleString()}
            </p>
          </CardContent>
        </Card>
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
f