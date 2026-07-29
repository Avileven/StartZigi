// MentorModal 220226
// UPDATE 180426: When user runs out of credits, show a styled message with an Upgrade Plan button
//                linking to /pricing instead of plain text error.
// UPDATE — config-driven rewrite: prompts, categories, help-types and
// cross-field context now come from zigConfig.js (FIELD_CONFIG) instead of
// being hand-written per call. See zig-core-prompt.md for the full spec
// this implements.
import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogPortal,
  DialogOverlay
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { InvokeLLM } from '@/api/integrations';
import { supabase } from '@/lib/supabase';
import { Loader2, Lightbulb, Search, Globe, CheckCircle2 } from 'lucide-react';
import { getFieldConfig, buildFeedbackPrompt, STUCK_PROMPT, CATEGORY_HELP_PROMPT, CATEGORY_DESCRIPTIONS } from './zigConfig';

const HELP_TYPE_ICON = {
  thinking: Lightbulb,
  middle: Search,
  information: Globe,
};

// Parses category scores out of the model's plain-text response.
// Handles both "Clarity: 8/10 - reason" (single line) and "Clarity8/10"
// followed by the reason on the next line — models don't always follow
// the exact punctuation in the prompt, so this matches on the category
// name + score pattern only and treats colon/dash as optional.
function parseCategoryLines(text, categoryNames) {
  const lines = text.split('\n').map(l => l.trim());
  // Escape regex special chars, then let any internal spaces in a
  // multi-word category name (e.g. "Information Quality") match zero or
  // more spaces — models sometimes drop the space entirely
  // ("InformationQuality6/10"), which a literal match would miss.
  const escaped = categoryNames.map(n =>
    n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/ /g, '\\s*')
  );
  const startPattern = new RegExp(`^(${escaped.join('|')})\\s*:?\\s*(\\d{1,2})\\s*\\/\\s*10\\s*:?\\s*-?\\s*(.*)$`, 'i');
  const normalize = s => s.toLowerCase().replace(/\s+/g, '');

  const categories = [];
  let i = 0;
  const leadInLines = [];
  while (i < lines.length && !startPattern.test(lines[i])) {
    if (lines[i]) leadInLines.push(lines[i]);
    i++;
  }
  while (i < lines.length) {
    const m = lines[i].match(startPattern);
    if (!m) break;
    const matchedNormalized = normalize(m[1].trim());
    const canonicalName = categoryNames.find(c => normalize(c) === matchedNormalized) || m[1].trim();
    const score = parseInt(m[2], 10);
    let reason = m[3].trim();
    i++;
    if (!reason) {
      while (i < lines.length && !lines[i]) i++; // skip blank lines
      if (i < lines.length && !startPattern.test(lines[i])) {
        reason = lines[i];
        i++;
      }
    }
    categories.push({ name: canonicalName, score, reason });
  }
  const closingLines = lines.slice(i).filter(l => l && !startPattern.test(l));

  return {
    categories,
    leadIn: leadInLines.join(' '),
    closingLine: closingLines.join(' '),
  };
}

function scoreColor(score) {
  if (score >= 7) return { text: '#3B6D11', fill: '#639922' };
  if (score >= 4) return { text: '#8A5A17', fill: '#BA7517' };
  return { text: '#993C1D', fill: '#D85A30' };
}

function ScoreBar({ name, score, reason, previousScore, helpType, helpState, onHelp, onReveal, onDecline }) {
  const { text, fill } = scoreColor(score);
  const delta = previousScore != null ? score - previousScore : null;
  const Icon = HELP_TYPE_ICON[helpType] || Lightbulb;
  const description = CATEGORY_DESCRIPTIONS[name.toLowerCase().replace(/\s+/g, '')];
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', fontSize: 14, marginBottom: 2 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500 }}>
          <Icon size={14} className="text-gray-400" />
          {name}
        </span>
        <span style={{ color: text, fontWeight: 500 }}>
          {score}/10{delta ? ` (${delta > 0 ? '+' : ''}${delta} from last time)` : ''}
        </span>
      </div>
      {description && <p className="text-xs text-gray-400 mb-2">{description}</p>}
      <div style={{ height: 8, background: '#eee', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${score * 10}%`, background: fill, borderRadius: 4 }} />
      </div>
      {reason && <p className="text-sm text-gray-600 mt-1">{reason}</p>}

      {!helpState && (
        <button
          onClick={onHelp}
          className="text-xs font-medium text-indigo-600 hover:text-indigo-800 mt-2"
        >
          Help with {name}
        </button>
      )}

      {helpState?.loading && (
        <div className="mt-2"><Loader2 className="animate-spin w-4 h-4 text-indigo-600" /></div>
      )}

      {/* information-type: opt-in choice before any AI call */}
      {helpState?.stage === 'offer' && (
        <div className="mt-2 flex gap-2">
          <button onClick={onReveal} className="text-xs font-medium px-3 py-1 rounded border border-indigo-200 text-indigo-700 hover:bg-indigo-50">
            Show me
          </button>
          <button onClick={onDecline} className="text-xs font-medium px-3 py-1 rounded border border-gray-200 text-gray-600 hover:bg-gray-50">
            I'll look myself
          </button>
        </div>
      )}

      {helpState?.stage === 'declined' && (
        <p className="text-xs text-gray-500 mt-2 italic">No problem — come back and revise once you have more.</p>
      )}

      {(helpState?.stage === 'shown' || helpState?.stage === 'revealed') && helpState.text && (
        <div className="mt-2 p-3 bg-indigo-50 rounded-lg text-sm text-gray-700">
          {helpState.text}
          {helpState.sources && helpState.sources.length > 0 && (
            <div className="mt-2 pt-2 border-t border-indigo-100">
              <p className="text-xs font-medium text-indigo-900 mb-1">Sources — check these yourself:</p>
              <ul className="space-y-0.5">
                {helpState.sources.map((s, idx) => (
                  <li key={idx}>
                    <a href={s.uri} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:underline break-all">
                      {s.title || s.uri}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function MentorModal({
  isOpen,
  onClose,
  documentType = 'business_plan', // which document's config to use — defaults to the one built out so far
  fieldKey,         // e.g. 'problem', 'founding_team' — must match a key in FIELD_CONFIG[documentType]
  sectionTitle,      // display title, e.g. "Problem Statement"
  fieldValue,
  allFieldValues,    // { [fieldKey]: text } — every field currently in the plan, for cross-field context
  firstPass,         // boolean — has this venture completed Foundation once already?
  onUpdateField,
  ventureId
}) {
  const [currentText, setCurrentText] = useState('');
  const [isGettingFeedback, setIsGettingFeedback] = useState(false);
  const [rawFeedback, setRawFeedback] = useState(null); // raw text or 'NO_CREDITS'
  const [parsedCategories, setParsedCategories] = useState([]);
  const [leadIn, setLeadIn] = useState('');
  const [closingLine, setClosingLine] = useState('');
  const [ventureDesc, setVentureDesc] = useState('');
  const [isLoadingContext, setIsLoadingContext] = useState(false);

  // Session-level score history, keyed by fieldKey — persists across
  // different fields opened in the same page session because this
  // component stays mounted (isOpen just toggles the Dialog). NOT
  // persisted across page reloads; that needs a DB column (see
  // zig-core-prompt.md Data Model Notes).
  const [scoreHistory, setScoreHistory] = useState({});

  // helpStage: null (closed) | 'choosing' | 'dont_know' | 'searched_nothing'
  // Which mode is currently selected — the founder picks this FIRST,
  // then "Zig it" executes whichever one is selected.
  const [mode, setMode] = useState('feedback'); // 'feedback' | 'help'
  const responseRef = useRef(null);

  const [helpStage, setHelpStage] = useState(null);
  const [isGettingHelp, setIsGettingHelp] = useState(false);
  const [helpResponse, setHelpResponse] = useState(null);

  // Per-category "Help with X" state, keyed by category name.
  // { [categoryName]: { stage: 'offer'|'shown'|'revealed'|'declined', loading, text } }
  const [categoryHelp, setCategoryHelp] = useState({});

  const field = getFieldConfig(documentType, fieldKey); // null if not configured (e.g. MVP/MLP) — triggers legacy fallback below

  // Auto-scroll to the response the moment it's ready — the founder
  // shouldn't have to go looking for it.
  useEffect(() => {
    if ((rawFeedback || helpResponse) && responseRef.current) {
      responseRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [rawFeedback, helpResponse]);

  useEffect(() => {
    const fetchVentureContext = async () => {
      if (!ventureId || !isOpen) return;
      setIsLoadingContext(true);
      try {
        const { data } = await supabase
          .from('ventures')
          .select('description')
          .eq('id', ventureId)
          .single();
        if (data) setVentureDesc(data.description);
      } catch (err) {
        console.error('Context fetch failed:', err);
      } finally {
        setIsLoadingContext(false);
      }
    };

    if (isOpen) {
      setCurrentText(fieldValue || '');
      setMode('feedback');
      setRawFeedback(null);
      setParsedCategories([]);
      setLeadIn('');
      setClosingLine('');
      setHelpStage(null);
      setHelpResponse(null);
      setCategoryHelp({});
      fetchVentureContext();
    }
  }, [isOpen, fieldValue, ventureId]);

  const handleGetFeedback = async () => {
    if (!currentText.trim()) return;

    setIsGettingFeedback(true);
    setRawFeedback(null);
    setParsedCategories([]);
    setHelpStage(null);
    setHelpResponse(null);
    setCategoryHelp({});

    try {
      // LEGACY FALLBACK: this document/field isn't in zigConfig yet
      // (e.g. MVP/MLP screens still using the old generic behavior).
      // Keep this identical to the pre-rewrite prompt so nothing outside
      // business_plan breaks.
      if (!field) {
        const legacyPrompt = `
          You are an expert startup coach.
          Venture Context: "${ventureDesc}"
          Section: "${sectionTitle}"
          User's Draft: "${currentText}"

          Instruction:
          1. Start with the text "Zig Feedback" exactly.
          2. On the very next line, provide a 10-star scale using "★" for active and "☆" for empty (e.g., ★★★★☆☆☆☆☆☆).
          3. Provide sections: "Analysis:", "Strategic Hints:", and "Challenge Question:".
          4. CRITICAL: Do NOT use any markdown formatting like bolding (**), bullet points (*), or hashtags (#). Use plain text only.
          5. DO NOT provide the rewritten text for the user. Focus on hints.

          Language: English.
        `;
        const legacyData = await InvokeLLM({ prompt: legacyPrompt, creditType: 'mentor' });
        setRawFeedback(legacyData?.response || 'No response from AI.');
        setIsGettingFeedback(false);
        return;
      }

      const previous = scoreHistory[fieldKey] || null;
      const prompt = buildFeedbackPrompt({
        documentType,
        fieldKey,
        currentText,
        allFieldValues: allFieldValues || {},
        firstPass: firstPass !== false, // default true if not provided
        previousScore: previous ? previous.categories : null,
      });

      // [CREDITS] one credit per feedback call
      const data = await InvokeLLM({ prompt, creditType: 'mentor' });
      let responseText = data?.response || '';

      if (!responseText) {
        setRawFeedback('Error generating feedback.');
      } else {
        const categoryNames = field.categories.map(c => c.name);
        let { categories: parsed, leadIn: parsedLeadIn, closingLine: parsedClosing } = parseCategoryLines(responseText, categoryNames);

        // [RELIABILITY] Asking nicely in the prompt isn't enough — models
        // sometimes skip a category anyway. If the response is missing
        // any, retry once automatically before showing the founder
        // anything, rather than silently displaying a partial result.
        if (parsed.length < categoryNames.length) {
          try {
            const retryData = await InvokeLLM({ prompt, creditType: 'mentor' });
            const retryText = retryData?.response || '';
            const retryParsed = parseCategoryLines(retryText, categoryNames);
            if (retryParsed.categories.length > parsed.length) {
              responseText = retryText;
              parsed = retryParsed.categories;
              parsedLeadIn = retryParsed.leadIn;
              parsedClosing = retryParsed.closingLine;
            }
          } catch (retryError) {
            // if the retry itself fails (e.g. credits), just keep what we had
          }
        }

        setParsedCategories(parsed);
        setLeadIn(parsedLeadIn);
        setClosingLine(parsedClosing);
        setRawFeedback(responseText);

        // store this attempt as the new "previous" for next time
        if (parsed.length > 0) {
          const categoriesMap = {};
          parsed.forEach(p => { categoriesMap[p.name] = p.score; });
          setScoreHistory(prev => ({ ...prev, [fieldKey]: { text: currentText, categories: categoriesMap } }));
        }
      }
    } catch (error) {
      if (error.message === 'NO_CREDITS') {
        setRawFeedback('NO_CREDITS');
      } else {
        setRawFeedback('Error generating feedback.');
      }
    }
    setIsGettingFeedback(false);
  };

  // [HELP] Separate entry point — never scores, only teaches. Available
  // regardless of whether the field has text in it.
  const handleGetHelp = async (stage) => {
    setHelpStage(stage);
    setIsGettingHelp(true);
    setHelpResponse(null);
    setRawFeedback(null);
    setParsedCategories([]);
    try {
      // LEGACY FALLBACK: same reasoning as handleGetFeedback above.
      const alreadyTried = stage === 'searched_nothing'
        ? 'The founder already searched and could not find an answer.'
        : 'The founder has no idea where to even start looking.';

      const prompt = field
        ? STUCK_PROMPT(field, stage, ventureDesc)
        : `
          You are an expert startup coach.
          Venture Context: "${ventureDesc}"
          Section: "${sectionTitle}"
          Situation: ${alreadyTried}

          Instruction:
          1. Do NOT give the founder the answer. Teach a concrete method instead.
          2. If the situation is "searched and found nothing", be more concrete
             and directive than for "no idea where to start".
          3. Keep it to 3-5 sentences. Plain text only, no markdown.

          Language: English.
        `;

      const data = await InvokeLLM({ prompt, creditType: 'mentor' });
      setHelpResponse(data?.response || 'No response from AI.');
    } catch (error) {
      if (error.message === 'NO_CREDITS') {
        setHelpResponse('NO_CREDITS');
      } else {
        setHelpResponse('Error generating help.');
      }
    }
    setIsGettingHelp(false);
  };

  // [CATEGORY HELP] Clicking "Help with X" under a specific score.
  // Behavior branches by that category's configured help-type.
  const handleCategoryHelpClick = async (categoryName) => {
    const catConfig = field?.categories.find(c => c.name === categoryName);
    const helpType = catConfig?.helpType || 'thinking';

    if (helpType === 'information') {
      // Don't call the AI yet — offer the opt-in choice first.
      setCategoryHelp(prev => ({ ...prev, [categoryName]: { stage: 'offer' } }));
      return;
    }

    setCategoryHelp(prev => ({ ...prev, [categoryName]: { stage: 'shown', loading: true } }));
    try {
      const prompt = CATEGORY_HELP_PROMPT({ field, categoryName, helpType, currentText, ventureDesc });
      const data = await InvokeLLM({ prompt, creditType: 'mentor' });
      setCategoryHelp(prev => ({ ...prev, [categoryName]: { stage: 'shown', loading: false, text: data?.response || 'No response from AI.' } }));
    } catch (error) {
      setCategoryHelp(prev => ({ ...prev, [categoryName]: { stage: 'shown', loading: false, text: 'Error generating help.' } }));
    }
  };

  // [CATEGORY HELP] "Show me" — only fires the AI/search call after
  // explicit opt-in, per the information help-type rule (never automatic).
  // enableSearch: true grounds this specific call in live Google Search,
  // since this is exactly the case where factual accuracy matters (see
  // integrations.js for why this isn't on by default for every call).
  const handleCategoryReveal = async (categoryName) => {
    setCategoryHelp(prev => ({ ...prev, [categoryName]: { stage: 'revealed', loading: true } }));
    try {
      const prompt = CATEGORY_HELP_PROMPT({ field, categoryName, helpType: 'information', currentText, ventureDesc });
      const data = await InvokeLLM({ prompt, creditType: 'mentor', enableSearch: true });
      setCategoryHelp(prev => ({ ...prev, [categoryName]: { stage: 'revealed', loading: false, text: data?.response || 'No response from AI.', sources: data?.sources || [] } }));
    } catch (error) {
      setCategoryHelp(prev => ({ ...prev, [categoryName]: { stage: 'revealed', loading: false, text: 'Error generating help.' } }));
    }
  };

  // [CATEGORY HELP] "I'll look myself" — no AI call, just acknowledges.
  const handleCategoryDecline = (categoryName) => {
    setCategoryHelp(prev => ({ ...prev, [categoryName]: { stage: 'declined' } }));
  };

  const previousForThisField = scoreHistory[fieldKey]?.categories || null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9999]" />
        <DialogContent className="fixed left-[50%] top-[50%] z-[10000] w-full max-w-4xl translate-x-[-50%] translate-y-[-50%] bg-white shadow-2xl h-[90vh] flex flex-col p-0 overflow-hidden text-gray-900">

          <DialogHeader className="p-6 border-b bg-slate-50">
            <div className="flex justify-between items-start">
              <div className="space-y-1 text-left">
                <DialogTitle className="text-2xl font-bold text-indigo-900">
                  {sectionTitle}
                </DialogTitle>
                <p className="text-sm text-gray-500">
                  AI-driven strategic guidance for your venture.
                </p>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="max-w-3xl mx-auto space-y-4">
              <label className="text-sm font-semibold text-gray-700 block text-left">Your Draft:</label>
              <Textarea
                value={currentText}
                onChange={(e) => setCurrentText(e.target.value)}
                className="min-h-[180px] text-base border-gray-300 focus:ring-2 focus:ring-indigo-500 bg-white"
                placeholder="Describe your strategy..."
              />

              {/* Step 1: pick a mode. Step 2: click the circle to run it. */}
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setMode('feedback')}
                  className={`px-3 h-8 rounded-lg text-xs font-medium border transition-all ${
                    mode === 'feedback'
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Feedback
                </button>

                <Button
                  onClick={() => {
                    if (mode === 'feedback') {
                      handleGetFeedback();
                    } else {
                      setHelpStage('choosing');
                    }
                  }}
                  disabled={
                    isGettingFeedback || isGettingHelp || isLoadingContext ||
                    (mode === 'feedback' && !currentText.trim())
                  }
                  className="w-16 h-16 rounded-full bg-white border border-indigo-200 hover:bg-indigo-50 transition-all shadow-sm flex items-center justify-center p-0 shrink-0"
                >
                  {(isGettingFeedback || isGettingHelp) ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <img src="/zig-it-logo.png" alt="Zig it" style={{ height: '36px', width: 'auto' }} />
                  )}
                </Button>

                <button
                  onClick={() => setMode('help')}
                  className={`px-3 h-8 rounded-lg text-xs font-medium border transition-all ${
                    mode === 'help'
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Help me
                </button>
              </div>

              {!isGettingFeedback && !isGettingHelp && (rawFeedback || helpResponse) && (
                <div className="flex justify-center">
                  <span className="flex items-center gap-1 text-sm text-green-700 font-medium">
                    <CheckCircle2 size={16} /> Done
                  </span>
                </div>
              )}

              {mode === 'help' && helpStage === 'choosing' && (
                <div className="flex gap-3 animate-in fade-in">
                  <Button
                    onClick={() => handleGetHelp('dont_know')}
                    variant="outline"
                    className="flex-1 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                  >
                    I don't know where to start
                  </Button>
                  <Button
                    onClick={() => handleGetHelp('searched_nothing')}
                    variant="outline"
                    className="flex-1 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                  >
                    I tried and still couldn't land on it
                  </Button>
                </div>
              )}

              <div ref={responseRef} />

              {helpResponse === 'NO_CREDITS' && (
                <div className="p-6 bg-amber-50 border border-amber-200 rounded-xl text-center space-y-3 animate-in fade-in">
                  <p className="text-amber-800 font-semibold">You've used all your Zig It credits this month.</p>
                  <a href="/pricing" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-6 py-2 rounded-lg transition-colors">
                    Upgrade Plan
                  </a>
                </div>
              )}

              {helpResponse && helpResponse !== 'NO_CREDITS' && (
                <div className="p-6 bg-indigo-50 border border-indigo-200 rounded-2xl text-left space-y-2 animate-in fade-in slide-in-from-bottom-2">
                  <p className="text-sm font-semibold text-indigo-900">Where to look</p>
                  <p className="text-gray-700 leading-relaxed text-base">{helpResponse}</p>
                </div>
              )}

              {rawFeedback === 'NO_CREDITS' && (
                <div className="p-6 bg-amber-50 border border-amber-200 rounded-xl text-center space-y-3 animate-in fade-in">
                  <p className="text-amber-800 font-semibold">You've used all your Zig It credits this month.</p>
                  <a href="/pricing" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-6 py-2 rounded-lg transition-colors">
                    Upgrade Plan
                  </a>
                </div>
              )}

              {rawFeedback && rawFeedback !== 'NO_CREDITS' && rawFeedback !== 'Error generating feedback.' && (
                <div className="p-8 bg-white border border-slate-200 rounded-2xl shadow-sm animate-in fade-in slide-in-from-bottom-2">
                  {field ? (
                    // Configured field: categorized score bars
                    <>
                      {leadIn && <p className="text-gray-800 font-medium mb-4">{leadIn}</p>}
                      {parsedCategories.length > 0 ? (
                        <div className="space-y-1">
                          {parsedCategories.map((c, i) => (
                            <ScoreBar
                              key={i}
                              name={c.name}
                              score={c.score}
                              reason={c.reason}
                              previousScore={previousForThisField ? previousForThisField[c.name] : null}
                              helpType={field.categories.find(cat => cat.name === c.name)?.helpType}
                              helpState={categoryHelp[c.name]}
                              onHelp={() => handleCategoryHelpClick(c.name)}
                              onReveal={() => handleCategoryReveal(c.name)}
                              onDecline={() => handleCategoryDecline(c.name)}
                            />
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-700 leading-relaxed text-base whitespace-pre-line">{rawFeedback}</p>
                      )}
                      {closingLine && <p className="text-gray-700 mt-4">{closingLine}</p>}
                    </>
                  ) : (
                    // LEGACY FALLBACK rendering: original star-scale + section format
                    <div className="space-y-4 text-left">
                      {rawFeedback.split('\n').map((line, index) => {
                        const trimmedLine = line.trim();
                        if (!trimmedLine) return null;
                        if (trimmedLine.includes('★') || trimmedLine.includes('☆')) {
                          return (
                            <div key={index} className="text-2xl tracking-[0.3em] text-blue-600 font-mono my-2">
                              {trimmedLine}
                            </div>
                          );
                        }
                        if (trimmedLine === 'Zig Feedback') {
                          return (
                            <h3 key={index} className="text-xl font-bold text-indigo-900">
                              {trimmedLine}
                            </h3>
                          );
                        }
                        const subHeaders = ['Analysis:', 'Strategic Hints:', 'Challenge Question:'];
                        const isSubHeader = subHeaders.some(h => trimmedLine.startsWith(h));
                        if (isSubHeader) {
                          return (
                            <h4 key={index} className="text-lg font-bold text-indigo-900 mt-6 mb-1">
                              {trimmedLine.replace(':', '')}
                            </h4>
                          );
                        }
                        return (
                          <p key={index} className="text-gray-700 leading-relaxed text-base">
                            {trimmedLine}
                          </p>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {rawFeedback === 'Error generating feedback.' && (
                <p className="text-red-600 text-sm">Error generating feedback. Please try again.</p>
              )}

              {/* Fixed next-step guidance — shown after ANY successful response,
                  so the founder always knows what to do next. */}
              {((rawFeedback && rawFeedback !== 'NO_CREDITS' && rawFeedback !== 'Error generating feedback.') ||
                (helpResponse && helpResponse !== 'NO_CREDITS')) && (
                <p className="text-sm text-gray-500 text-center pt-2">
                  Update your draft above based on this, then click <span className="font-medium text-gray-700">Save &amp; Close</span> if you're done — or keep refining and run Zig it again.
                </p>
              )}
            </div>
          </div>

          <div className="p-4 bg-slate-50 border-t flex justify-end gap-3">
            <Button variant="outline" onClick={onClose} className="px-6">Cancel</Button>
            <Button
              onClick={() => { onUpdateField(currentText); onClose(); }}
              className="bg-green-600 hover:bg-green-700 text-white px-10 shadow-sm"
            >
              Save & Close
            </Button>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
