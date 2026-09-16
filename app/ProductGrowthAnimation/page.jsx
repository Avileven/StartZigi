"use client";
import React, { useEffect, useRef, useState } from "react";

// Colors matched to the real site palette (same family as PhaseClock's colors).
const BLUE = "#2563EB"; // primary accent (idea / product)
const ORANGE = "#F97316"; // feedback / insights
const GREEN = "#10B981"; // users
const GRAY = "#9CA3AF"; // passive watchers
const SURFACE = "#FFFFFF"; // card background
const BORDER = "#E9E9F0"; // card border / lines
const TEXT_PRIMARY = "#111827";
const FONT = "Inter, sans-serif";

// Five distinct stages, each finishing fully before the next begins, with a pause in between:
// 1. Idea      - a person thinks; a faint lightbulb above his head lights up the moment his eyes open.
// 2. Feedback   - a demo app appears, surrounded by many gray eyes, all sitting still first.
//                Some light up orange one at a time, lean in, and turn into feedback bubbles
//                inside it, while an "Insights" counter rises.
// 3. Product    - the demo fills in for real: header -> two colored blocks -> a bar chart. Ends here.
// 4. Feature    - as its own separate stage, one more feature (a small list of rows) is added below.
// 5. Users      - fresh eyes appear again, all sitting still first; the app goes semi-transparent,
//                some eyes light up green, lean in, and turn into person-shaped user icons, while
//                a "Users" counter rises to 8.
// Runs once when scrolled into view, then shows a Replay button.
export default function ProductGrowthAnimation({ className = "w-full max-w-xl mx-auto" }) {
  const wrapRef = useRef(null);
  const [finished, setFinished] = useState(false);
  const playRef = useRef(null); // holds the "play once" function once the effect sets it up
  const hasStartedRef = useRef(false);

  const personRef = useRef(null);
  const eyesClosedRef = useRef(null);
  const eyesOpenRef = useRef(null);
  const bulbOffRef = useRef(null);
  const bulbOnRef = useRef(null);

  const frameRef = useRef(null);
  const headerBarRef = useRef(null);
  const block1Ref = useRef(null);
  const block2Ref = useRef(null);
  const pChartRef = useRef(null);
  const barRefs = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)];
  const rowsGRef = useRef(null);

  const counterRef = useRef(null);
  const counterLabelRef = useRef(null);
  const eyeHolderRef = useRef(null);
  const feedbackIconsRef = useRef(null);

  // Build the whole "play once" sequence, wire it to playRef, then start it via IntersectionObserver.
  useEffect(() => {
    const svgns = "http://www.w3.org/2000/svg";
    const cx = 340,
      cy = 175;
    const barHeights = [22, 34, 16, 40, 28];
    const rowY = [258, 275, 292];
    const N = 18;
    const moverSlots = [2, 4, 6, 9, 11, 13, 15, 17];
    const ringRadius = 175;
    const insideOffsets = [
      [-34, 36],
      [0, 32],
      [34, 36],
      [-34, 60],
      [0, 64],
      [34, 60],
      [-18, 84],
      [18, 84],
    ];

    const person = personRef.current;
    const eyesClosed = eyesClosedRef.current;
    const eyesOpen = eyesOpenRef.current;
    const bulbOff = bulbOffRef.current;
    const bulbOn = bulbOnRef.current;

    const frame = frameRef.current;
    const headerBar = headerBarRef.current;
    const block1 = block1Ref.current;
    const block2 = block2Ref.current;
    const pChart = pChartRef.current;
    const bars = barRefs.map((r) => r.current);
    const rowsG = rowsGRef.current;

    const counter = counterRef.current;
    const counterLabel = counterLabelRef.current;
    const eyeHolder = eyeHolderRef.current;
    const feedbackIconsG = feedbackIconsRef.current;

    if (
      !person || !eyesClosed || !eyesOpen || !bulbOff || !bulbOn ||
      !frame || !headerBar || !block1 || !block2 || !pChart || !rowsG ||
      !counter || !counterLabel || !eyeHolder || !feedbackIconsG
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

    /* ===== STAGE 1: idea ===== */
    function playIdea() {
      person.style.transition = "none";
      person.style.opacity = "0";
      eyesClosed.style.opacity = "1";
      eyesOpen.style.opacity = "0";
      bulbOff.style.transition = "none";
      bulbOff.style.opacity = "0";
      bulbOn.style.transition = "none";
      bulbOn.style.opacity = "0";
      bulbOn.style.transform = "scale(0.9)";

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          person.style.transition = "opacity 0.6s ease";
          person.style.opacity = "1";
        });
      });
      // The bulb sits there almost invisible while he's thinking.
      T(() => {
        bulbOff.style.transition = "opacity 0.8s ease";
        bulbOff.style.opacity = "0.28";
      }, 700);
      // The moment his eyes open, the bulb lights up.
      T(() => {
        eyesClosed.style.opacity = "0";
        eyesOpen.style.opacity = "1";
        bulbOff.style.transition = "opacity 0.3s ease";
        bulbOff.style.opacity = "0";
        bulbOn.style.transition = "opacity 0.3s ease";
        bulbOn.style.opacity = "1";
        bulbOn.animate(
          [{ transform: "scale(0.9)" }, { transform: "scale(1.25)" }, { transform: "scale(1)" }],
          { duration: 500, easing: "ease-out" }
        );
      }, 2200);
    }
    function hideIdea() {
      person.style.transition = "opacity 0.6s ease";
      person.style.opacity = "0";
      bulbOff.style.opacity = "0";
      bulbOn.style.transition = "opacity 0.6s ease";
      bulbOn.style.opacity = "0";
    }

    /* ===== shared builders ===== */
    function makeEye() {
      const g = document.createElementNS(svgns, "g");
      g.style.color = GRAY;
      g.style.opacity = "0";
      g.style.transition = "opacity 0.6s ease";
      const brow = document.createElementNS(svgns, "path");
      brow.setAttribute("d", "M -8 -7 Q 0 -11.5 8 -7");
      brow.setAttribute("fill", "none");
      brow.setAttribute("stroke", "currentColor");
      brow.setAttribute("stroke-width", "1.6");
      brow.setAttribute("stroke-linecap", "round");
      g.appendChild(brow);
      const sclera = document.createElementNS(svgns, "ellipse");
      sclera.setAttribute("rx", 8);
      sclera.setAttribute("ry", 5.3);
      sclera.setAttribute("fill", SURFACE);
      sclera.setAttribute("stroke", "currentColor");
      sclera.setAttribute("stroke-width", "1.3");
      g.appendChild(sclera);
      const pupil = document.createElementNS(svgns, "circle");
      pupil.setAttribute("r", 2.6);
      pupil.setAttribute("fill", "currentColor");
      g.appendChild(pupil);
      return { g };
    }
    function makeFeedbackIcon(x, y) {
      const g = document.createElementNS(svgns, "g");
      g.style.color = ORANGE;
      g.setAttribute("transform", `translate(${x},${y}) scale(0.6)`);
      g.style.opacity = "0";
      g.style.transition = "opacity 0.4s ease";
      const bubble = document.createElementNS(svgns, "rect");
      bubble.setAttribute("x", -10);
      bubble.setAttribute("y", -8);
      bubble.setAttribute("width", 20);
      bubble.setAttribute("height", 14);
      bubble.setAttribute("rx", 4);
      bubble.setAttribute("fill", "currentColor");
      g.appendChild(bubble);
      const tail = document.createElementNS(svgns, "path");
      tail.setAttribute("d", "M -3 6 L 0 12 L 3 6 Z");
      tail.setAttribute("fill", "currentColor");
      g.appendChild(tail);
      [-4, 0, 4].forEach((dx) => {
        const d = document.createElementNS(svgns, "circle");
        d.setAttribute("cx", dx);
        d.setAttribute("cy", -1);
        d.setAttribute("r", 1.3);
        d.setAttribute("fill", SURFACE);
        g.appendChild(d);
      });
      return g;
    }
    function makeUserIcon(x, y) {
      const g = document.createElementNS(svgns, "g");
      g.style.color = GREEN;
      g.setAttribute("transform", `translate(${x},${y}) scale(0.85)`);
      g.style.opacity = "0";
      g.style.transition = "opacity 0.4s ease";
      const bg = document.createElementNS(svgns, "circle");
      bg.setAttribute("r", 9);
      bg.setAttribute("fill", "currentColor");
      g.appendChild(bg);
      const head = document.createElementNS(svgns, "circle");
      head.setAttribute("cy", -2.6);
      head.setAttribute("r", 2.4);
      head.setAttribute("fill", SURFACE);
      g.appendChild(head);
      const body = document.createElementNS(svgns, "path");
      body.setAttribute("d", "M -4.5 5.5 Q 0 -0.5 4.5 5.5");
      body.setAttribute("fill", "none");
      body.setAttribute("stroke", SURFACE);
      body.setAttribute("stroke-width", "1.8");
      body.setAttribute("stroke-linecap", "round");
      g.appendChild(body);
      return g;
    }
    function makeRow(y) {
      const g = document.createElementNS(svgns, "g");
      g.style.opacity = "0";
      g.style.transition = "opacity 0.5s ease, transform 0.5s ease";
      g.style.transform = "translateY(10px)";
      const dot = document.createElementNS(svgns, "circle");
      dot.setAttribute("cx", 289);
      dot.setAttribute("cy", y);
      dot.setAttribute("r", 5);
      dot.setAttribute("fill", BLUE);
      g.appendChild(dot);
      const line1 = document.createElementNS(svgns, "rect");
      line1.setAttribute("x", 300);
      line1.setAttribute("y", y - 5);
      line1.setAttribute("width", 66);
      line1.setAttribute("height", 6);
      line1.setAttribute("rx", 3);
      line1.setAttribute("fill", TEXT_PRIMARY);
      g.appendChild(line1);
      const line2 = document.createElementNS(svgns, "rect");
      line2.setAttribute("x", 300);
      line2.setAttribute("y", y + 4);
      line2.setAttribute("width", 40);
      line2.setAttribute("height", 5);
      line2.setAttribute("rx", 2.5);
      line2.setAttribute("fill", BORDER);
      g.appendChild(line2);
      return g;
    }

    const ringItems = [];
    for (let i = 0; i < N; i++) {
      const isMover = moverSlots.indexOf(i) !== -1;
      const angle = (i / N) * Math.PI * 2 - Math.PI / 2;
      ringItems.push({
        x: cx + Math.cos(angle) * ringRadius,
        y: cy + Math.sin(angle) * ringRadius + 25,
        isMover,
      });
    }

    function showCounter(label, color) {
      counterLabel.textContent = label;
      counterLabel.setAttribute("fill", color);
      counter.style.opacity = "1";
    }
    function hideCounter() {
      counter.style.opacity = "0";
    }

    let eyeEls = [];
    // Eyes fade in and settle in place first; nothing moves yet.
    function showAllEyesGray() {
      eyeHolder.innerHTML = "";
      eyeEls = [];
      ringItems.forEach((it, i) => {
        const eye = makeEye();
        eyeHolder.appendChild(eye.g);
        eye.g.style.transform = `translate(${it.x}px,${it.y}px) scale(0.85)`;
        eye.g.style.transitionDelay = `${i * 0.05}s`;
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            eye.g.style.opacity = "0.5";
          });
        });
        eyeEls.push(eye);
      });
    }
    function hideAllEyes() {
      eyeEls.forEach((eye) => {
        eye.g.style.transitionDelay = "0s";
        eye.g.style.opacity = "0";
      });
    }

    function runMoverEye(eye, pos, insidePos, color, makeIcon, iconTarget, speed, done) {
      const leanX = cx + (pos.x - cx) * 0.55;
      const leanY = cy + (pos.y - cy) * 0.55;
      const leanT = `translate(${leanX}px,${leanY}px) scale(1.35)`;

      // Light up in place first — still not moving yet.
      eye.g.style.color = color;
      eye.g.style.transitionDelay = "0s";
      eye.g.style.transition = "opacity 0.35s ease";
      eye.g.style.opacity = "1";
      eye.g.animate(
        [
          { transform: eye.g.style.transform },
          { transform: eye.g.style.transform.replace("scale(0.85)", "scale(1.15)") },
          { transform: eye.g.style.transform },
        ],
        { duration: 450 * speed, easing: "ease-out" }
      );

      // Only after lighting up, it leans in.
      T(() => {
        eye.g.style.transform = `translate(${pos.x}px,${pos.y}px) scale(1)`;
        T(() => {
          eye.g.style.transition = `transform ${0.7 * speed}s cubic-bezier(.4,0,.2,1)`;
          eye.g.style.transform = leanT;
        }, 20);
      }, 500 * speed);

      T(() => {
        eye.g.style.transition = "opacity 0.25s ease";
        eye.g.style.opacity = "0";
        const icon = makeIcon(insidePos.x, insidePos.y);
        iconTarget.appendChild(icon);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            icon.style.opacity = "1";
          });
        });
      }, 1350 * speed);

      T(() => done(), 1850 * speed);
    }
    function runMovers(color, makeIcon, iconTarget, speed, callback) {
      const movers = [];
      ringItems.forEach((it, i) => {
        if (it.isMover) movers.push({ pos: it, eye: eyeEls[i] });
      });
      let idx = 0;
      function next() {
        if (idx >= movers.length) {
          callback();
          return;
        }
        const m = movers[idx];
        const off = insideOffsets[idx % insideOffsets.length];
        idx++;
        runMoverEye(m.eye, { x: m.pos.x, y: m.pos.y }, { x: cx + off[0], y: cy + off[1] }, color, makeIcon, iconTarget, speed, next);
      }
      next();
    }

    /* ===== STAGE 3: product fills — ends cleanly here ===== */
    function fillProduct(callback) {
      T(() => {
        headerBar.style.transition = "opacity 0.7s ease";
        headerBar.style.opacity = "1";
      }, 300);
      T(() => {
        block1.style.transition = "opacity 0.7s ease";
        block1.style.opacity = "1";
        block2.style.transition = "opacity 0.7s ease";
        block2.style.opacity = "1";
      }, 1100);
      T(() => {
        pChart.style.transition = "opacity 0.4s ease";
        pChart.style.opacity = "1";
        bars.forEach((b, idx) => {
          T(() => {
            b.style.transition = "height 0.5s ease-out, y 0.5s ease-out";
            b.setAttribute("height", barHeights[idx]);
            b.setAttribute("y", 228 - barHeights[idx]);
          }, idx * 150);
        });
      }, 2000);
      T(callback, 3700);
    }

    /* ===== STAGE 4: one more feature — its own separate stage ===== */
    function addFeature(callback) {
      rowY.forEach((y, i) => {
        const row = makeRow(y);
        rowsG.appendChild(row);
        T(() => {
          row.style.opacity = "1";
          row.style.transform = "translateY(0px)";
        }, i * 450);
      });
      T(callback, 1700);
    }

    function resetAll() {
      eyeHolder.innerHTML = "";
      eyeEls = [];
      feedbackIconsG.innerHTML = "";
      hideCounter();
      frame.style.transition = "none";
      frame.style.opacity = "0";
      headerBar.style.transition = "none";
      headerBar.style.opacity = "0.7";
      block1.style.transition = "none";
      block1.style.opacity = "0.55";
      block2.style.transition = "none";
      block2.style.opacity = "0.5";
      pChart.style.opacity = "0";
      bars.forEach((b) => {
        b.style.transition = "none";
        b.setAttribute("height", "0");
        b.setAttribute("y", "228");
      });
      rowsG.innerHTML = "";
    }

    // Runs the whole thing exactly once, then flips `finished` to true (no looping).
    function playOnce() {
      cancelled = false;
      resetAll();

      playIdea();
      T(() => {
        hideIdea();

        T(() => {
          frame.style.transition = "opacity 0.6s ease";
          frame.style.opacity = "1";
          showCounter("PRODUCT INSIGHT", ORANGE);
          showAllEyesGray();
          // Eyes settle and sit still for a beat before any of them light up.
          T(() => {
            runMovers(ORANGE, makeFeedbackIcon, feedbackIconsG, 0.55, () => {
              hideAllEyes();
              hideCounter();

              T(() => {
                showCounter("PRODUCT SCALE", BLUE);
                fillProduct(() => {
                  T(() => {
                    addFeature(() => {
                      T(() => {
                        hideCounter();
                      }, 0);
                      T(() => {
                        feedbackIconsG.innerHTML = "";
                        showCounter("NEW USERS", GREEN);
                        showAllEyesGray();
                        T(() => {
                          frame.style.transition = "opacity 0.8s ease";
                          frame.style.opacity = "0.45";
                          runMovers(GREEN, makeUserIcon, feedbackIconsG, 0.35, () => {
                            T(() => {
                              hideAllEyes();
                              hideCounter();
                              frame.style.transition = "opacity 0.8s ease";
                              frame.style.opacity = "1";
                              T(() => {
                                if (!cancelled) setFinished(true);
                              }, 400);
                            }, 700);
                          });
                        }, 2000);
                      }, 900);
                    });
                  }, 900);
                });
              }, 900);
            });
          }, 2000);
        }, 900);
      }, 4200);
    }

    playRef.current = playOnce;

    return () => {
      cancelled = true;
      timers.forEach((id) => clearTimeout(id));
    };
  }, []);

  // Start automatically the first time this section is ~50% visible on screen.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasStartedRef.current && playRef.current) {
            hasStartedRef.current = true;
            setFinished(false);
            playRef.current();
            observer.disconnect();
          }
        });
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  function handleReplay() {
    setFinished(false);
    if (playRef.current) playRef.current();
  }

  return (
    <div ref={wrapRef} className={className} style={{ position: "relative" }}>
      <svg width="100%" viewBox="0 0 680 380" role="img" style={{ display: "block" }}>
        <title>Idea to product to users</title>
        <desc>
          A person thinks, with a faint lightbulb above his head. The moment his eyes
          opening. A demo app frame then appears, surrounded by many gray eye icons that all sit
          still first; some then light up orange, lean in, and turn into feedback speech-bubble
          icons inside the frame while an insights counter rises. As a separate stage, the frame
          fills in with a header, colorful blocks and a bar chart. As another separate stage after
          that, one more feature, a small list of rows, is added below. Finally, new eyes appear
          around the finished app and sit still first; the app becomes semi-transparent, and some
          eyes light up green, lean in, and turn into person-shaped user icons inside it while a
          green users counter rises to eight. Plays once, with a replay button at the end.
        </desc>

        {/* Person: head + a classic flat-shoulder pictogram body, not a snowman */}
        <g ref={personRef} style={{ opacity: 0, transition: "opacity 0.6s ease", color: BLUE }}>
          <path d="M 314 300 L 366 300 L 373 360 L 307 360 Z" fill="currentColor" />
          <circle cx="340" cy="258" r="16" fill="currentColor" />
        </g>
        <g ref={eyesClosedRef} style={{ transition: "opacity 0.25s ease" }}>
          <line x1="329" y1="254" x2="337" y2="254" stroke={SURFACE} strokeWidth="2" strokeLinecap="round" />
          <line x1="343" y1="254" x2="351" y2="254" stroke={SURFACE} strokeWidth="2" strokeLinecap="round" />
        </g>
        <g ref={eyesOpenRef} style={{ opacity: 0, transition: "opacity 0.25s ease" }}>
          <circle cx="333" cy="254" r="3.4" fill={SURFACE} />
          <circle cx="347" cy="254" r="3.4" fill={SURFACE} />
          <circle cx="333" cy="254" r="1.4" fill="#FBBF24" />
          <circle cx="347" cy="254" r="1.4" fill="#FBBF24" />
        </g>

        {/* Lightbulb above his head: almost invisible while he thinks, then lights up */}
        <g ref={bulbOffRef} style={{ opacity: 0, transition: "opacity 0.8s ease", transformOrigin: "340px 216px" }}>
          <circle cx="340" cy="210" r="15" fill="none" stroke={GRAY} strokeWidth="1.5" />
          <rect x="332" y="222" width="16" height="9" rx="2" fill="none" stroke={GRAY} strokeWidth="1.5" />
          <line x1="334" y1="226" x2="346" y2="226" stroke={GRAY} strokeWidth="1" />
        </g>
        <g ref={bulbOnRef} style={{ opacity: 0, transition: "opacity 0.3s ease", transformOrigin: "340px 216px" }}>
          <circle cx="340" cy="210" r="15" fill="#FBBF24" />
          <rect x="332" y="222" width="16" height="9" rx="2" fill="#FBBF24" />
          <line x1="334" y1="226" x2="346" y2="226" stroke="#B45309" strokeWidth="1" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
            const rad = (deg * Math.PI) / 180;
            const x1 = 340 + Math.cos(rad) * 19;
            const y1 = 210 + Math.sin(rad) * 19;
            const x2 = 340 + Math.cos(rad) * 26;
            const y2 = 210 + Math.sin(rad) * 26;
            return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" />;
          })}
        </g>

        <g ref={frameRef} style={{ opacity: 0, transition: "opacity 0.6s ease", color: BLUE }}>
          <rect x="265" y="95" width="150" height="215" rx="18" fill={SURFACE} stroke="currentColor" strokeWidth="2" />
          <rect ref={headerBarRef} x="283" y="112" width="90" height="14" rx="4" fill={BLUE} opacity="0.7" />
          <rect ref={block1Ref} x="283" y="136" width="52" height="30" rx="6" fill={BLUE} opacity="0.55" />
          <rect ref={block2Ref} x="341" y="136" width="52" height="30" rx="6" fill={ORANGE} opacity="0.5" />
          <g ref={pChartRef} style={{ opacity: 0, transition: "opacity 0.6s ease" }}>
            <rect ref={barRefs[0]} x="283" y="228" width="10" height="0" rx="2" fill={BLUE} />
            <rect ref={barRefs[1]} x="299" y="228" width="10" height="0" rx="2" fill={BLUE} />
            <rect ref={barRefs[2]} x="315" y="228" width="10" height="0" rx="2" fill={BLUE} />
            <rect ref={barRefs[3]} x="331" y="228" width="10" height="0" rx="2" fill={BLUE} />
            <rect ref={barRefs[4]} x="347" y="228" width="10" height="0" rx="2" fill={ORANGE} />
            <line x1="280" y1="228" x2="380" y2="228" stroke={BORDER} strokeWidth="1" />
          </g>
          <g ref={rowsGRef} />
        </g>

        <g ref={counterRef} style={{ opacity: 0, transition: "opacity 0.5s ease" }}>
          <text
            ref={counterLabelRef}
            x="340"
            y="350"
            textAnchor="middle"
            fill={ORANGE}
            fontFamily={FONT}
            fontWeight="700"
            fontSize="11"
            letterSpacing="0.03em"
          >
            PRODUCT INSIGHT
          </text>
        </g>

        <g ref={feedbackIconsRef} />
        <g ref={eyeHolderRef} />
      </svg>

      {finished && (
        <button
          onClick={handleReplay}
          style={{
            position: "absolute",
            bottom: 8,
            left: "50%",
            transform: "translateX(-50%)",
            padding: "8px 18px",
            borderRadius: 999,
            border: `1px solid ${BORDER}`,
            background: SURFACE,
            color: BLUE,
            fontFamily: FONT,
            fontWeight: 600,
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          ↻ Replay
        </button>
      )}
    </div>
  );
}
