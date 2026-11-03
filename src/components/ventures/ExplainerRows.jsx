"use client";
// [NEW — ZigPulse] Short "how to use" rows: an icon tile on the left and the
// explanation on the right. Used at the top of the Venture Profile and Feedback
// tabs, the Promotion Center round screen and the Idea Analysis (plan) page.
import React from 'react';

// rows: [{ icon: <ReactNode>, text: <ReactNode>, wide?: boolean }]
export default function ExplainerRows({ rows, className = '' }) {
  return (
    <div className={`space-y-1 ${className}`}>
      {rows.map((row, i) => (
        <div key={i} className="flex items-center gap-3.5 py-1.5">
          <div className={`flex-none h-14 rounded-xl bg-gray-100 flex items-center justify-center gap-1.5 ${row.wide ? 'w-[150px]' : 'w-14'}`}>
            {row.icon}
          </div>
          <p className="min-w-0 text-sm leading-snug text-gray-700">{row.text}</p>
        </div>
      ))}
    </div>
  );
}

// The round "Z" (Zig it) button, as shown inside the Zig it window.
export function ZigItBadge() {
  return (
    <span className="w-9 h-9 rounded-full bg-white border border-indigo-200 flex items-center justify-center shrink-0">
      <img src="/zig-it-logo.png" alt="Zig it" style={{ height: '18px', width: 'auto' }} />
    </span>
  );
}

// The "Feedback" / "Help me" mode buttons next to the Z, highlighted.
export function ModePill({ children }) {
  return (
    <span className="px-2 h-7 rounded-lg text-[11px] font-medium bg-indigo-600 text-white border border-indigo-600 whitespace-nowrap flex items-center">
      {children}
    </span>
  );
}
