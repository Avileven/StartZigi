"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Venture, VentureMessage, User } from '@/api/entities.js';
import { InvokeLLM } from '@/api/integrations';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Loader2, Send, User as UserIcon, Bot, Target, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createPageUrl } from '@/lib/utils';

const CORE_QUESTION = `Look, I invest in a lot of companies and I see this pattern repeatedly - entrepreneurs come in thinking they have a unique idea, but there are always competitors they don't know about. Sometimes it's an established player expanding into their space, sometimes it's another startup pivoting, sometimes it's a big tech company building this internally. How confident are you that you really understand who you're up against? And more importantly - what happens to your business when you discover there's more competition than you thought?`;

const TIME_PRESSURE_MESSAGES = [
  { delay: 30000, text: "Hmm... need a moment to think about this?" },
  { delay: 60000, text: "This is a pretty basic question about your market..." },
  { delay: 90000, text: "I'm starting to lose interest here..." },
  { delay: 120000, text: "Okay, let's move on. Thanks for your time.", isTimeout: true }
];

export default function PressureChallenge() {
  return <div>Test</div>
}