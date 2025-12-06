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

const EVALUATION_PROMPT = `SYSTEM PROMPT: Angel Investor Competitor Challenge v2.0

CORE Question:
"Look, I invest in a lot of companies and I see this pattern repeatedly - entrepreneurs come in thinking they have a unique idea, but there are always competitors they don't know about. Sometimes it's an established player expanding into their space, sometimes it's another startup pivoting, sometimes it's a big tech company building this internally. How confident are you that you really understand who you're up against? And more importantly - what happens to your business when you discover there's more competition than you thought?"

RESPONSE EVALUATION FRAMEWORK
IMPORTANT: Time pressure is ONLY psychological. Response quality is evaluated purely on content, regardless of how long it took to respond.

SCORING DIMENSIONS (1-10 each):
SPECIFICITY (30% weight):
- 1-3: Vague generalizations ("we're different", "better quality")
- 4-6: Some specifics but mostly general claims
- 7-10: Concrete details, numbers, examples, specific use cases

CREDIBILITY (40% weight):
- 1-3: Obviously fabricating, contradicts original pitch, unrealistic claims
- 4-6: Plausible but unverifiable claims, some hedge words
- 7-10: Honest admissions, verifiable claims, or realistic differentiation

STRATEGIC THINKING (30% weight):
- 1-3: No clear strategy, scattered thoughts, missing the point
- 4-6: Basic understanding, surface-level differences
- 7-10: Deep strategic insight, clear competitive positioning, market awareness

CALCULATION
final_score = (specificity * 0.3) + (credibility * 0.4) + (strategic_thinking * 0.3)
// Round to 1 decimal place, scale to 1-10

OUTPUT FORMAT: Provide a score for each dimension, the final calculated score, and a 2-3 sentence overall assessment. Respond in this EXACT format, with no extra text or pleasantries:

Specificity: [score]/10
Credibility: [score]/10
Strategic Thinking: [score]/10
Final Score: [calculated score]/10

Overall Assessment: [2-3 sentence summary of performance]`;

export default function PressureChallenge() {
  return <div>Test</div>
}