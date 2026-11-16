"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, Phone, Send, CheckCircle, RotateCcw } from "lucide-react";

// Shared by ZigForge (the founder's preview) and the public page, so both look exactly the same.
// mockup = {
//   type: 'chat' | 'steps' | 'before_after'   (missing = 'chat', for mockups saved before types existed)
//   title: section heading on the public page,
//   header: { name, role },
//   messages: [{ side: 'user' | 'product', text }]      (chat)
//   rows: [{ title, text }]                              (steps, max 3)
//   before: { text }, after: { text }                    (before_after)
//   result: { label, title, text }
// }
// animate = true: items appear one after another once the phone scrolls into view (public page only).
export const MOCKUP_TYPES = [
  { key: "chat", label: "Conversation" },
  { key: "steps", label: "Steps" },
  { key: "before_after", label: "Before & after" },
];

const clean = (s) => (typeof s === "string" ? s.trim() : "");

export function mockupItems(mockup) {
  const type = mockup && MOCKUP_TYPES.some((t) => t.key === mockup.type) ? mockup.type : "chat";
  let body = [];
  if (type === "chat") {
    body = (Array.isArray(mockup.messages) ? mockup.messages : [])
      .filter((m) => m && clean(m.text)).slice(0, 4)
      .map((m) => ({ kind: m.side === "product" ? "product" : "user", text: clean(m.text) }));
  } else if (type === "steps") {
    body = (Array.isArray(mockup.rows) ? mockup.rows : [])
      .filter((r) => r && (clean(r.title) || clean(r.text))).slice(0, 3)
      .map((r, i) => ({ kind: "row", n: i + 1, title: clean(r.title), text: clean(r.text) }));
  } else {
    if (mockup.before && clean(mockup.before.text)) body.push({ kind: "before", text: clean(mockup.before.text) });
    if (mockup.after && clean(mockup.after.text)) body.push({ kind: "after", text: clean(mockup.after.text) });
  }
  const r = mockup.result || {};
  const result = clean(r.title) || clean(r.text) ? { kind: "result", label: clean(r.label), title: clean(r.title), text: clean(r.text) } : null;
  return { type, items: result ? [...body, result] : body };
}

const Typing = () => (
  <div className="absolute left-0 top-0 bg-[#fffdf9] rounded-2xl rounded-bl-md px-3 py-2.5 shadow-sm flex gap-1">
    {[0, 1, 2].map((d) => (
      <span key={d} className="w-1.5 h-1.5 rounded-full bg-[#8a9794] animate-bounce" style={{ animationDelay: d * 140 + "ms" }} />
    ))}
  </div>
);

export default function MockupPhone({ mockup, animate = false }) {
  const { type, items } = useMemo(() => (mockup ? mockupItems(mockup) : { type: "chat", items: [] }), [mockup]);
  const rootRef = useRef(null);
  const [shown, setShown] = useState(animate ? 0 : items.length); // how many items are visible
  const [started, setStarted] = useState(!animate);
  const [run, setRun] = useState(0);

  // Start when the phone is on screen. Reduced-motion visitors just see everything.
  useEffect(() => {
    if (!animate) { setShown(items.length); setStarted(true); return undefined; }
    const reduce = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || typeof IntersectionObserver === "undefined") { setShown(items.length); setStarted(true); return undefined; }
    setShown(0); setStarted(false);
    const el = rootRef.current;
    if (!el) return undefined;
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { setStarted(true); io.disconnect(); }
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, [animate, items.length, run]);

  // Reveal one item at a time. A product message is "typed" for a moment first.
  useEffect(() => {
    if (!animate || !started || shown >= items.length) return undefined;
    const next = items[shown];
    const wait = shown === 0 ? 500 : next.kind === "product" ? 1300 : 800;
    const t = setTimeout(() => setShown((n) => n + 1), wait);
    return () => clearTimeout(t);
  }, [animate, started, shown, items]);

  if (!mockup) return null;
  const header = mockup.header || {};
  const initials = (header.name || "?").split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const done = shown >= items.length;

  const wrap = (i, node, side) => {
    const visible = i < shown;
    const typing = animate && started && i === shown && items[i].kind === "product";
    return (
      <div key={i} className={"relative flex flex-col " + (side === "end" ? "items-end" : side === "stretch" ? "items-stretch" : "items-start")}>
        {typing && <Typing />}
        <div className={"transition-all duration-500 w-full flex flex-col " + (side === "end" ? "items-end" : side === "stretch" ? "items-stretch" : "items-start") + (visible ? " opacity-100 translate-y-0" : " opacity-0 translate-y-2")}>{node}</div>
      </div>
    );
  };

  const renderItem = (it, i) => {
    if (it.kind === "user") return wrap(i, <div className="max-w-[80%] bg-[#e8743b] text-white rounded-2xl rounded-br-md px-3 py-2 break-words text-left">{it.text}</div>, "end");
    if (it.kind === "product") return wrap(i, <div className="max-w-[85%] bg-[#fffdf9] text-[#1c2b2a] rounded-2xl rounded-bl-md px-3 py-2 shadow-sm break-words text-left">{it.text}</div>, "start");
    if (it.kind === "row") return wrap(i, (
      <div className="rounded-xl bg-[#fffdf9] shadow-sm px-3 py-2.5 flex gap-2.5 text-left">
        <span className="w-5 h-5 flex-none rounded-full bg-[#1f6f5c] text-white text-[10px] font-bold flex items-center justify-center mt-0.5">{it.n}</span>
        <span className="min-w-0">
          {it.title && <span className="block text-[12.5px] font-semibold text-[#1c2b2a] break-words">{it.title}</span>}
          {it.text && <span className="block text-[11px] text-[#566663] mt-0.5 break-words">{it.text}</span>}
        </span>
      </div>
    ), "stretch");
    if (it.kind === "before") return wrap(i, (
      <div className="rounded-xl bg-[#fffdf9] shadow-sm border border-[#e6ddcc] px-3 py-2.5 text-left">
        <span className="block text-[10px] uppercase tracking-[0.1em] font-semibold text-[#c2561f]">Before</span>
        <span className="block text-[12px] text-[#1c2b2a] mt-1 break-words">{it.text}</span>
      </div>
    ), "stretch");
    if (it.kind === "after") return wrap(i, (
      <div className="rounded-xl bg-[#e3f1ec] border border-[#bfe6d9] px-3 py-2.5 text-left">
        <span className="block text-[10px] uppercase tracking-[0.1em] font-semibold text-[#17594a]">After</span>
        <span className="block text-[12px] text-[#1c2b2a] mt-1 break-words">{it.text}</span>
      </div>
    ), "stretch");
    return wrap(i, (
      <div className="mt-1 rounded-2xl bg-[#1f6f5c] text-white px-3 py-2.5 text-left">
        {it.label && <p className="text-[10px] uppercase tracking-[0.1em] text-[#bfe6d9] font-semibold flex items-center gap-1"><CheckCircle className="w-3 h-3" />{it.label}</p>}
        {it.title && <p className="text-[13px] font-semibold mt-0.5 break-words">{it.title}</p>}
        {it.text && <p className="text-[11px] text-[#d6efe6] mt-0.5 break-words">{it.text}</p>}
      </div>
    ), "stretch");
  };

  return (
    <div ref={rootRef}>
      <div className="mx-auto w-[270px] max-w-full rounded-[2.4rem] bg-[#1c2b2a] p-[9px] shadow-[0_18px_50px_rgba(31,111,92,0.25)]">
        <div className="rounded-[1.9rem] bg-[#fffdf9] overflow-hidden relative flex flex-col min-h-[480px]">
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-5 rounded-full bg-[#1c2b2a]" />
          <div className="bg-[#1f6f5c] text-white pt-9 pb-3 px-4 flex items-center gap-3 text-left">
            <ChevronLeft className="w-4 h-4 opacity-80 flex-none" />
            <div className="w-8 h-8 flex-none rounded-full bg-[#bfe6d9] text-[#1f6f5c] text-xs font-bold flex items-center justify-center">{initials}</div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold leading-tight truncate">{header.name}</p>
              {header.role && <p className="text-[10px] text-[#bfe6d9] leading-tight truncate">{header.role}</p>}
            </div>
            {type === "chat" && <Phone className="w-4 h-4 opacity-80 flex-none" />}
          </div>
          <div className="flex-1 bg-[#f6f1e9] px-3 py-3 flex flex-col gap-2.5 text-[12px] leading-snug">
            {items.map(renderItem)}
          </div>
          {type === "chat" && (
            <div className="bg-[#fffdf9] px-3 py-2.5 flex items-center gap-2 border-t border-[#e6ddcc]">
              <div className="flex-1 rounded-full bg-[#f6f1e9] text-[#8a9794] text-[11px] px-3 py-2 text-left">Type a message…</div>
              <span className="w-7 h-7 rounded-full bg-[#1f6f5c] text-white flex items-center justify-center"><Send className="w-3.5 h-3.5" /></span>
            </div>
          )}
        </div>
      </div>
      {animate && done && items.length > 0 && (
        <button type="button" onClick={() => setRun((n) => n + 1)} className="mt-3 inline-flex items-center gap-1 text-xs text-[#6b7a77] hover:text-[#1f6f5c]">
          <RotateCcw className="w-3 h-3" /> Replay
        </button>
      )}
    </div>
  );
}
