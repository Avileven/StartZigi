"use client";
// [REPLACED — Zigback] Shown after a logged-in reviewer submits feedback.
// The ZigBack logo builds itself ("Zig" first, then "Back"), then a thank-you
// message shows how many Zigback were earned and stays until the reviewer
// clicks Continue. The logo is ONE transparent PNG (public/zigback-logo.png)
// shown through two clipped layers, cut in the empty gap between "g" and "B".
import React, { useEffect, useState } from "react";

const LOGO_SRC = "/zigback-logo.png";
const CUT = 43.3; // % of the image width where "Zig" ends and "Back" begins

export default function InsightEarnedAnimation({ credits = 1, onComplete }) {
  // 0 = nothing yet, 1 = "Zig" visible, 2 = "Back" visible, 3 = message visible
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setStage(1), 150);
    const t2 = setTimeout(() => setStage(2), 750);
    const t3 = setTimeout(() => setStage(3), 1700);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  const layer = (visible, clip, fromX) => ({
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    clipPath: clip,
    WebkitClipPath: clip,
    opacity: visible ? 1 : 0,
    transform: visible ? "translateX(0)" : `translateX(${fromX}px)`,
    transition: "opacity 0.55s ease, transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)",
  });

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-white/80 backdrop-blur-sm"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-6 px-6 text-center" style={{ maxWidth: 440 }}>
        {/* Logo: aspect ratio of the cropped PNG is 672 x 180 */}
        <div className="relative w-[260px] sm:w-[340px]" style={{ aspectRatio: "672 / 180" }}>
          <img src={LOGO_SRC} alt="" aria-hidden="true" style={layer(stage >= 1, `inset(0 ${100 - CUT}% 0 0)`, -24)} />
          <img src={LOGO_SRC} alt="ZigBack" style={layer(stage >= 2, `inset(0 0 0 ${CUT}%)`, 24)} />
        </div>

        <div
          className="flex flex-col items-center gap-4"
          style={{
            opacity: stage >= 3 ? 1 : 0,
            transform: stage >= 3 ? "translateY(0)" : "translateY(10px)",
            transition: "opacity 0.5s ease, transform 0.5s ease",
            pointerEvents: stage >= 3 ? "auto" : "none",
          }}
        >
          <div>
            <p className="text-xl font-bold text-gray-900">Thank you for your feedback!</p>
            <p className="text-base text-gray-600 mt-1">
              You earned <span className="font-extrabold" style={{ color: "#EF9F27" }}>{credits} Zigback</span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => onComplete?.()}
            className="px-6 py-2 rounded-full text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
