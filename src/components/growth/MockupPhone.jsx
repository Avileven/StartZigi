"use client";

import React from "react";
import { ChevronLeft, Phone, Send, CheckCircle } from "lucide-react";

// Shared by ZigForge (the founder's preview) and the public page, so both look exactly the same.
// mockup = { header: { name, role }, messages: [{ side: 'user' | 'product', text }], result: { label, title, text } }
export default function MockupPhone({ mockup }) {
  if (!mockup) return null;
  const header = mockup.header || {};
  const messages = Array.isArray(mockup.messages) ? mockup.messages.filter((m) => m && m.text && m.text.trim()).slice(0, 4) : [];
  const result = mockup.result || {};
  const initials = (header.name || "?").split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="mx-auto w-[270px] max-w-full rounded-[2.4rem] bg-[#1c2b2a] p-[9px] shadow-[0_18px_50px_rgba(31,111,92,0.25)]">
      <div className="rounded-[1.9rem] bg-[#fffdf9] overflow-hidden relative flex flex-col min-h-[480px]">
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-5 rounded-full bg-[#1c2b2a]" />
        <div className="bg-[#1f6f5c] text-white pt-9 pb-3 px-4 flex items-center gap-3">
          <ChevronLeft className="w-4 h-4 opacity-80 flex-none" />
          <div className="w-8 h-8 flex-none rounded-full bg-[#bfe6d9] text-[#1f6f5c] text-xs font-bold flex items-center justify-center">{initials}</div>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold leading-tight truncate">{header.name}</p>
            {header.role && <p className="text-[10px] text-[#bfe6d9] leading-tight truncate">{header.role}</p>}
          </div>
          <Phone className="w-4 h-4 opacity-80 flex-none" />
        </div>
        <div className="flex-1 bg-[#f6f1e9] px-3 py-3 flex flex-col gap-2.5 text-[12px] leading-snug">
          {messages.map((m, i) => (
            m.side === "user" ? (
              <div key={i} className="self-end max-w-[80%] bg-[#e8743b] text-white rounded-2xl rounded-br-md px-3 py-2 break-words">{m.text}</div>
            ) : (
              <div key={i} className="self-start max-w-[85%] bg-[#fffdf9] text-[#1c2b2a] rounded-2xl rounded-bl-md px-3 py-2 shadow-sm break-words">{m.text}</div>
            )
          ))}
          {(result.title || result.text) && (
            <div className="self-stretch mt-1 rounded-2xl bg-[#1f6f5c] text-white px-3 py-2.5">
              {result.label && (
                <p className="text-[10px] uppercase tracking-[0.1em] text-[#bfe6d9] font-semibold flex items-center gap-1"><CheckCircle className="w-3 h-3" />{result.label}</p>
              )}
              {result.title && <p className="text-[13px] font-semibold mt-0.5 break-words">{result.title}</p>}
              {result.text && <p className="text-[11px] text-[#d6efe6] mt-0.5 break-words">{result.text}</p>}
            </div>
          )}
        </div>
        <div className="bg-[#fffdf9] px-3 py-2.5 flex items-center gap-2 border-t border-[#e6ddcc]">
          <div className="flex-1 rounded-full bg-[#f6f1e9] text-[#8a9794] text-[11px] px-3 py-2">Type a message…</div>
          <span className="w-7 h-7 rounded-full bg-[#1f6f5c] text-white flex items-center justify-center"><Send className="w-3.5 h-3.5" /></span>
        </div>
      </div>
    </div>
  );
}
