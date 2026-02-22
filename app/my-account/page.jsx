// 220226
"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@/api/entities';
import Link from 'next/link';
import { UserCircle, CreditCard, Calendar, Zap, ArrowUpRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// [MY ACCOUNT] מיפוי תכניות לקרדיטים
const PLAN_CREDITS = {
  free: 5,
  vision: 25,
  impact: 100,
  unicorn: 500,
};

export default function MyAccount() {
  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const currentUser = await User.me();
        setUser(currentUser);

        const { data } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', currentUser.id)
          .single();

        setProfile(data);
      } catch (error) {
        console.error('Error loading profile:', error);
      }
      setIsLoading(false);
    };

    loadProfile();
  }, []);

  if (isLoading) return <div className="p-8 text-center font-bold">Loading...</div>;

  const plan = profile?.plan || 'free';
  const creditsUsed = profile?.credits_used || 0;
  const creditsLimit = profile?.credits_limit || PLAN_CREDITS[plan] || 5;
  const creditsLeft = creditsLimit - creditsUsed;
  const resetDate = profile?.credits_reset_date
    ? new Date(profile.credits_reset_date)
    : null;
  const nextReset = resetDate
    ? new Date(resetDate.getFullYear(), resetDate.getMonth() + 1, resetDate.getDate())
    : null;
  const joinedDate = profile?.accepted_tos_date
    ? new Date(profile.accepted_tos_date)
    : null;

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <UserCircle className="w-8 h-8 text-indigo-600" />
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">My Account</h1>
      </div>

      {/* פרטי משתמש */}
      <Card className="border-t-4 border-t-indigo-500 shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
            <UserCircle className="w-4 h-4" /> Account Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-gray-700"><span className="font-semibold">Email:</span> {user?.email || '—'}</p>
          <p className="text-gray-700">
            <span className="font-semibold">Member since:</span>{' '}
            {joinedDate ? joinedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
          </p>
        </CardContent>
      </Card>

      {/* תכנית נוכחית */}
      <Card className="border-t-4 border-t-purple-500 shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
            <CreditCard className="w-4 h-4" /> Current Plan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-3xl font-bold text-gray-900 capitalize">{plan}</p>
          <p className="text-gray-500 text-sm">
            {plan === 'free' ? '$0/month' : plan === 'vision' ? '$5/month' : plan === 'impact' ? '$9.6/month' : '$28/month'}
          </p>
        </CardContent>
      </Card>

      {/* קרדיטים */}
      <Card className="border-t-4 border-t-green-500 shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
            <Zap className="w-4 h-4" /> Mentor Credits
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-end gap-2">
            <span className={`text-4xl font-bold ${creditsLeft <= 0 ? 'text-red-600' : 'text-gray-900'}`}>
              {creditsLeft}
            </span>
            <span className="text-gray-500 text-lg mb-1">/ {creditsLimit} remaining</span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${creditsLeft <= 0 ? 'bg-red-500' : 'bg-green-500'}`}
              style={{ width: `${Math.max(0, (creditsLeft / creditsLimit) * 100)}%` }}
            />
          </div>

          {nextReset && (
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Resets on {nextReset.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          )}
        </CardContent>
      </Card>

      {/* כפתור שדרוג */}
      <Link href="/pricing">
        <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-2 h-12 text-base">
          <ArrowUpRight className="w-5 h-5" />
          Upgrade Plan
        </Button>
      </Link>
    </div>
  );
}
