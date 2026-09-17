"use client";
import React, { useEffect, useRef } from "react";

const BORDER = "#E9E9F0";
const TEXT_PRIMARY = "#111827";
const FONT = "Inter, sans-serif";
const COLORS = { community: "#1D9E75", ai: "#BA7517", product: "#7F77DD" };

const CENTER = { x: 340, y: 220 };
const NODE_POS = {
  community: { x: 200, y: 320 },
  ai: { x: 480, y: 320 },
  product: { x: 340, y: 100 },
};
const BASE_TRANSFORM = {
  community: "translate(200px,320px)",
  ai: "translate(480px,320px) scale(0.8)",
  product: "translate(340px,100px)",
};
const SEGMENTS = [
  { from: NODE_POS.community, ctrl: { x: 340, y: 260 }, to: NODE_POS.ai, key: "community", nextKey: "ai" },
  { from: NODE_POS.ai, ctrl: { x: 460, y: 160 }, to: NODE_POS.product, key: "ai", nextKey: "product" },
  { from: NODE_POS.product, ctrl: { x: 220, y: 160 }, to: NODE_POS.community, key: "product", nextKey: "community" },
];

// A traveling dot loops between three icons — community, AI, product — each with its own
// color. The line it crosses lights up in the destination's color, that icon shakes and
// changes color on arrival, and a steering wheel labeled "Founder" rotates to point at the
// active icon. Runs continuously.
export default function CommunityAiFounderLoop({ className = "w-[82vw] sm:w-full max-w-xl mx-auto" }) {
  const iconCommunityRef = useRef(null);
  const iconAiRef = useRef(null);
  const iconProductRef = useRef(null);
  const labelCommunityRef = useRef(null);
  const labelAiRef = useRef(null);
  const labelProductRef = useRef(null);
  const wheelRef = useRef(null);
  const wheelRotatorRef = useRef(null);
  const founderLabelRef = useRef(null);
  const travelDotRef = useRef(null);
  const visLineRef = useRef(null);

  useEffect(() => {
    const icons = {
      community: { el: iconCommunityRef.current, label: labelCommunityRef.current },
      ai: { el: iconAiRef.current, label: labelAiRef.current },
      product: { el: iconProductRef.current, label: labelProductRef.current },
    };
    const wheel = wheelRef.current;
    const wheelRotator = wheelRotatorRef.current;
    const founderLabel = founderLabelRef.current;
    const travelDot = travelDotRef.current;
    const visLine = visLineRef.current;

    if (
      !icons.community.el || !icons.ai.el || !icons.product.el ||
      !wheel || !wheelRotator || !founderLabel || !travelDot || !visLine
    ) {
      return;
    }

    let cancelled = false;
    const timers = [];
    const T = (fn, ms) => {
      const id = setTimeout(() => {
        if (!cancelled) fn();
      }, ms);
      timers.push(id);
      return id;
    };

    function angleTo(key) {
      const p = NODE_POS[key];
      const deg = (Math.atan2(p.y - CENTER.y, p.x - CENTER.x) * 180) / Math.PI;
      return deg + 90;
    }

    function shake(el, baseTransform) {
      el.animate(
        [
          { transform: baseTransform + " translate(0,0)" },
          { transform: baseTransform + " translate(-4px,0)" },
          { transform: baseTransform + " translate(4px,0)" },
          { transform: baseTransform + " translate(-3px,0)" },
          { transform: baseTransform + " translate(3px,0)" },
          { transform: baseTransform + " translate(0,0)" },
        ],
        { duration: 400, easing: "ease-in-out" }
      );
    }

    function setActive(key, active) {
      const n = icons[key];
      n.label.style.opacity = active ? "1" : "0";
      if (active) {
        n.el.setAttribute("color", COLORS[key]);
        n.label.setAttribute("fill", COLORS[key]);
        wheel.setAttribute("color", COLORS[key]);
        wheelRotator.style.transform = "rotate(" + angleTo(key) + "deg)";
        founderLabel.setAttribute("fill", COLORS[key]);
        shake(n.el, BASE_TRANSFORM[key]);
      } else {
        n.el.setAttribute("color", BORDER);
      }
    }

    function quadPoint(p0, p1, p2, t) {
      const x = (1 - t) * (1 - t) * p0.x + 2 * (1 - t) * t * p1.x + t * t * p2.x;
      const y = (1 - t) * (1 - t) * p0.y + 2 * (1 - t) * t * p1.y + t * t * p2.y;
      return { x, y };
    }

    let segIdx = 0;
    let start = null;
    const travelMs = 1000;
    const holdMs = 700;
    let rafId = null;

    function animateSegment(ts) {
      if (cancelled) return;
      const seg = SEGMENTS[segIdx];
      if (!start) {
        start = ts;
        visLine.setAttribute("stroke", COLORS[seg.nextKey]);
        travelDot.setAttribute("fill", COLORS[seg.nextKey]);
      }
      const t = Math.min((ts - start) / travelMs, 1);
      const pos = quadPoint(seg.from, seg.ctrl, seg.to, t);
      travelDot.setAttribute("cx", pos.x);
      travelDot.setAttribute("cy", pos.y);

      let d = "M " + seg.from.x + " " + seg.from.y;
      const steps = 24;
      for (let i = 1; i <= steps * t; i++) {
        const p = quadPoint(seg.from, seg.ctrl, seg.to, i / steps);
        d += " L " + p.x + " " + p.y;
      }
      visLine.setAttribute("d", d);

      if (t < 1) {
        rafId = requestAnimationFrame(animateSegment);
      } else {
        visLine.setAttribute("d", "");
        setActive(seg.nextKey, true);
        setActive(seg.key, false);
        T(() => {
          segIdx = (segIdx + 1) % SEGMENTS.length;
          start = null;
          rafId = requestAnimationFrame(animateSegment);
        }, holdMs);
      }
    }

    setActive("community", true);
    T(() => {
      rafId = requestAnimationFrame(animateSegment);
    }, holdMs);

    return () => {
      cancelled = true;
      if (rafId) cancelAnimationFrame(rafId);
      timers.forEach((id) => clearTimeout(id));
    };
  }, []);

  return (
    <div className={className}>
      <svg width="100%" viewBox="0 0 680 420" role="img" style={{ display: "block" }}>
        <title>Community, AI, product loop with founder at center</title>
        <desc>
          Three icons, a connected-people network for community, a chip for AI, and a small
          screen for product, sit with no background circles behind them. A single dot travels
          around a triangular path continuously, leaving a colored trail matching the destination
          icon. The moment the line touches an icon, that icon changes to its own color, teal for
          community, amber for AI, purple for product, and shakes briefly. A steering wheel
          labeled founder sits in the center and rotates toward whichever icon is active, matching
          its color. Each icon shows a two-word label while active: Community perspective, Pattern
          analysis, Product update. This repeats in a loop.
        </desc>

        {/* Community icon */}
        <g ref={iconCommunityRef} color={BORDER} style={{ transition: "color 0.3s ease" }} transform="translate(200,320)">
          <g stroke="currentColor" strokeWidth="2.2" fill="none">
            <line x1="-19" y1="10" x2="0" y2="-16" />
            <line x1="19" y1="10" x2="0" y2="-16" />
            <line x1="-19" y1="10" x2="19" y2="10" />
          </g>
          <g fill="currentColor">
            <circle cx="0" cy="-16" r="8" />
            <circle cx="-19" cy="10" r="8" />
            <circle cx="19" cy="10" r="8" />
          </g>
        </g>

        {/* AI icon: chip */}
        <g ref={iconAiRef} color={BORDER} style={{ transition: "color 0.3s ease" }} transform="translate(480,320) scale(0.8)">
          <g stroke="currentColor" strokeWidth="2.4">
            <rect x="-20" y="-20" width="40" height="40" rx="5" fill="none" />
            <line x1="-10" y1="-30" x2="-10" y2="-20" />
            <line x1="10" y1="-30" x2="10" y2="-20" />
            <line x1="-10" y1="20" x2="-10" y2="30" />
            <line x1="10" y1="20" x2="10" y2="30" />
            <line x1="-30" y1="-10" x2="-20" y2="-10" />
            <line x1="-30" y1="10" x2="-20" y2="10" />
            <line x1="20" y1="-10" x2="30" y2="-10" />
            <line x1="20" y1="10" x2="30" y2="10" />
          </g>
          <circle cx="0" cy="0" r="5.5" fill="currentColor" />
        </g>

        {/* Product icon: small screen */}
        <g ref={iconProductRef} color={BORDER} style={{ transition: "color 0.3s ease" }} transform="translate(340,100)">
          <rect x="-22" y="-22" width="44" height="44" rx="6" fill="none" stroke="currentColor" strokeWidth="2.2" />
          <line x1="-13" y1="-9" x2="13" y2="-9" stroke="currentColor" strokeWidth="2.2" />
          <line x1="-13" y1="1" x2="6" y2="1" stroke="currentColor" strokeWidth="2.2" />
          <line x1="-13" y1="11" x2="-2" y2="11" stroke="currentColor" strokeWidth="2.2" />
        </g>

        {/* Founder: steering wheel, center, rotates toward active icon */}
        <g ref={wheelRotatorRef} style={{ transition: "transform 0.6s cubic-bezier(.4,0,.2,1)", transformOrigin: "340px 220px" }}>
          <g ref={wheelRef} style={{ transition: "color 0.4s ease" }} color={BORDER}>
            <circle cx="340" cy="220" r="28" fill="none" stroke="currentColor" strokeWidth="3" />
            <circle cx="340" cy="220" r="6" fill="currentColor" />
            <line x1="340" y1="220" x2="340" y2="194" stroke="currentColor" strokeWidth="3" />
            <line x1="340" y1="220" x2="318" y2="234" stroke="currentColor" strokeWidth="3" />
            <line x1="340" y1="220" x2="362" y2="234" stroke="currentColor" strokeWidth="3" />
          </g>
        </g>
        <text
          ref={founderLabelRef}
          x="340"
          y="268"
          textAnchor="middle"
          fill={BORDER}
          fontFamily={FONT}
          fontWeight="800"
          fontSize="17"
          style={{ transition: "fill 0.4s ease" }}
        >
          Founder
        </text>

        <text
          ref={labelCommunityRef}
          x="200"
          y="358"
          textAnchor="middle"
          fontFamily={FONT}
          fontWeight="700"
          fontSize="14"
          fill={BORDER}
          style={{ opacity: 0, transition: "opacity 0.4s ease, fill 0.4s ease" }}
        >
          Community perspective
        </text>
        <text
          ref={labelAiRef}
          x="480"
          y="358"
          textAnchor="middle"
          fontFamily={FONT}
          fontWeight="700"
          fontSize="14"
          fill={BORDER}
          style={{ opacity: 0, transition: "opacity 0.4s ease, fill 0.4s ease" }}
        >
          Pattern analysis
        </text>
        <text
          ref={labelProductRef}
          x="340"
          y="50"
          textAnchor="middle"
          fontFamily={FONT}
          fontWeight="700"
          fontSize="14"
          fill={BORDER}
          style={{ opacity: 0, transition: "opacity 0.4s ease, fill 0.4s ease" }}
        >
          Product update
        </text>

        <circle ref={travelDotRef} cx="200" cy="320" r="7" fill={COLORS.community} />
        <path ref={visLineRef} d="" fill="none" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    </div>
  );
}
