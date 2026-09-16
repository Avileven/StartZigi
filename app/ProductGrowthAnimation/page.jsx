"use client";
import React, { useEffect, useRef } from "react";

// Colors matched to the real site palette (same family as PhaseClock's colors).
const BLUE = "#2563EB"; // primary accent (idea / product)
const ORANGE = "#F97316"; // feedback / insights
const GREEN = "#10B981"; // users
const GRAY = "#9CA3AF"; // passive watchers
const SURFACE = "#FFFFFF"; // card background
const BORDER = "#E9E9F0"; // card border / lines
const TEXT_PRIMARY = "#111827";
const TEXT_SECONDARY = "#6B7280";
const FONT = "Inter, sans-serif";

// Five distinct stages, each finishing fully before the next begins, with a pause in between:
// 1. Idea      - a thinking figure, a thought bubble, and a lightning-bolt spark; their eyes open.
// 2. Feedback   - a demo app appears, surrounded by many gray eyes; some light up orange, lean in,
//                and turn into feedback speech-bubble icons inside it, while an "Insights" counter rises.
// 3. Product    - the demo fills in for real: header -> two colored blocks -> a bar chart. Ends here.
// 4. Feature    - as its own separate stage, one more feature (a small list of rows) is added below.
// 5. Users      - fresh eyes appear again; the app goes semi-transparent, some eyes light up green,
//                lean in, and turn into person-shaped user icons, while a "Users" counter rises to 8.
// Then it loops back to the idea stage.
export default function ProductGrowthAnimation({ className = "w-full max-w-xl mx-auto" }) {
  const personRef = useRef(null);
  const eyesClosedRef = useRef(null);
  const eyesOpenRef = useRef(null);
  const tb1Ref = useRef(null);
  const tb2Ref = useRef(null);
  const cloudRef = useRef(null);
  const ideaDotRef = useRef(null);
  const boltRef = useRef(null);

  const frameRef = useRef(null);
  const headerBarRef = useRef(null);
  const block1Ref = useRef(null);
  const block2Ref = useRef(null);
  const pChartRef = useRef(null);
  const barRefs = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)];
  const rowsGRef = useRef(null);

  const counterRef = useRef(null);
  const counterLabelRef = useRef(null);
  const counterNumRef = useRef(null);
  const eyeHolderRef = useRef(null);
  const feedbackIconsRef = useRef(null);

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
    const tb1 = tb1Ref.current;
    const tb2 = tb2Ref.current;
    const cloud = cloudRef.current;
    const ideaDot = ideaDotRef.current;
    const bolt = boltRef.current;

    const frame = frameRef.current;
    const headerBar = headerBarRef.current;
    const block1 = block1Ref.current;
    const block2 = block2Ref.current;
    const pChart = pChartRef.current;
    const bars = barRefs.map((r) => r.current);
    const rowsG = rowsGRef.current;

    const counter = counterRef.current;
    const counterLabel = counterLabelRef.current;
    const counterNum = counterNumRef.current;
    const eyeHolder = eyeHolderRef.current;
    const feedbackIconsG = feedbackIconsRef.current;

    if (
      !person || !eyesClosed || !eyesOpen || !tb1 || !tb2 || !cloud || !ideaDot || !bolt ||
      !frame || !headerBar || !block1 || !block2 || !pChart || !rowsG ||
      !counter || !counterLabel || !counterNum || !eyeHolder || !feedbackIconsG
    ) {
      return;
    }

    const timers = [];
    const T = (fn, ms) => {
      const id = setTimeout(fn, ms);
      timers.push(id);
      return id;
    };

    /* ===== STAGE 1: idea ===== */
    function playIdea() {
      person.style.transition = "none";
      person.style.opacity = "0";
      eyesClosed.style.opacity = "1";
      eyesOpen.style.opacity = "0";
      tb1.style.transition = "none";
      tb1.style.opacity = "0";
      tb2.style.transition = "none";
      tb2.style.opacity = "0";
      cloud.style.transition = "none";
      cloud.style.opacity = "0";
      ideaDot.style.transition = "none";
      ideaDot.style.opacity = "0";
      ideaDot.setAttribute("r", "3");
      bolt.style.transition = "none";
      bolt.style.opacity = "0";
      bolt.style.transform = "scale(0.35)";

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          person.style.transition = "opacity 0.6s ease";
          person.style.opacity = "1";
        });
      });
      T(() => {
        tb1.style.transition = "opacity 0.3s ease";
        tb1.style.opacity = "1";
      }, 700);
      T(() => {
        tb2.style.transition = "opacity 0.3s ease";
        tb2.style.opacity = "1";
      }, 1000);
      T(() => {
        cloud.style.transition = "opacity 0.5s ease";
        cloud.style.opacity = "1";
      }, 1350);
      T(() => {
        ideaDot.style.transition = "opacity 0.3s ease";
        ideaDot.style.opacity = "1";
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            ideaDot.style.transition = "r 0.8s ease-in-out";
            ideaDot.setAttribute("r", "6");
          });
        });
      }, 2000);
      T(() => {
        ideaDot.style.opacity = "0";
        bolt.style.opacity = "1";
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            bolt.style.transition = "transform 1.6s ease-in-out";
            bolt.style.transform = "scale(1)";
          });
        });
        eyesClosed.style.opacity = "0";
        eyesOpen.style.opacity = "1";
      }, 2800);
    }
    function hideIdea() {
      person.style.transition = "opacity 0.6s ease";
      person.style.opacity = "0";
      tb1.style.opacity = "0";
      tb2.style.opacity = "0";
      cloud.style.transition = "opacity 0.6s ease";
      cloud.style.opacity = "0";
      bolt.style.transition = "opacity 0.6s ease";
      bolt.style.opacity = "0";
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

    let countValue = 0;
    function showCounter(label, color) {
      countValue = 0;
      counterLabel.textContent = label;
      counterLabel.setAttribute("fill", color);
      counterNum.setAttribute("fill", color);
      counterNum.textContent = "0";
      counterNum.setAttribute("y", "365");
      counterNum.style.opacity = "1";
      counter.style.opacity = "1";
    }
    function hideCounter() {
      counter.style.opacity = "0";
    }
    function bumpCounter() {
      countValue++;
      counterNum.style.transition = "none";
      counterNum.setAttribute("y", "378");
      counterNum.style.opacity = "0";
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          counterNum.textContent = countValue;
          counterNum.style.transition = "y 0.35s ease-out, opacity 0.35s ease-out";
          counterNum.setAttribute("y", "365");
          counterNum.style.opacity = "1";
        });
      });
    }

    let eyeEls = [];
    function showAllEyesGray() {
      eyeHolder.innerHTML = "";
      eyeEls = [];
      ringItems.forEach((it, i) => {
        const eye = makeEye();
        eyeHolder.appendChild(eye.g);
        eye.g.style.transform = `translate(${it.x}px,${it.y}px) scale(0.85)`;
        eye.g.style.transitionDelay = `${i * 0.04}s`;
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

    function runMoverEye(eye, pos, insidePos, color, makeIcon, iconTarget, done) {
      const leanX = cx + (pos.x - cx) * 0.55;
      const leanY = cy + (pos.y - cy) * 0.55;
      const leanT = `translate(${leanX}px,${leanY}px) scale(1.35)`;

      eye.g.style.color = color;
      eye.g.style.transitionDelay = "0s";
      eye.g.style.transition = "opacity 0.35s ease";
      eye.g.style.opacity = "1";
      eye.g.animate(
        [{ transform: "scale(1)" }, { transform: "scale(1.5)" }, { transform: "scale(1)" }],
        { duration: 400, easing: "ease-out" }
      );

      T(() => {
        eye.g.style.transition = "transform 0.7s cubic-bezier(.4,0,.2,1)";
        eye.g.style.transform = leanT;
      }, 350);

      T(() => {
        eye.g.style.transition = "opacity 0.35s ease";
        eye.g.style.opacity = "0";
        const icon = makeIcon(insidePos.x, insidePos.y);
        iconTarget.appendChild(icon);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            icon.style.opacity = "1";
            bumpCounter();
          });
        });
      }, 1150);

      T(() => done(), 1650);
    }
    function runMovers(color, makeIcon, iconTarget, callback) {
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
        runMoverEye(m.eye, { x: m.pos.x, y: m.pos.y }, { x: cx + off[0], y: cy + off[1] }, color, makeIcon, iconTarget, next);
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

    function runLoop() {
      resetAll();

      playIdea();
      T(() => {
        hideIdea();

        T(() => {
          frame.style.transition = "opacity 0.6s ease";
          frame.style.opacity = "1";
          showCounter("Insights", ORANGE);
          showAllEyesGray();
          T(() => {
            runMovers(ORANGE, makeFeedbackIcon, feedbackIconsG, () => {
              hideAllEyes();
              hideCounter();

              T(() => {
                fillProduct(() => {
                  T(() => {
                    addFeature(() => {
                      T(() => {
                        feedbackIconsG.innerHTML = "";
                        showCounter("Users", GREEN);
                        showAllEyesGray();
                        T(() => {
                          frame.style.transition = "opacity 0.8s ease";
                          frame.style.opacity = "0.45";
                          runMovers(GREEN, makeUserIcon, feedbackIconsG, () => {
                            T(() => {
                              hideAllEyes();
                              hideCounter();
                              frame.style.transition = "opacity 0.8s ease";
                              frame.style.opacity = "1";
                              T(runLoop, 1800);
                            }, 700);
                          });
                        }, 1600);
                      }, 900);
                    });
                  }, 900);
                });
              }, 900);
            });
          }, 1600);
        }, 900);
      }, 3600);
    }

    runLoop();

    return () => {
      timers.forEach((id) => clearTimeout(id));
    };
  }, []);

  return (
    <div className={className}>
      <svg width="100%" viewBox="0 0 680 400" role="img" style={{ display: "block" }}>
        <title>Idea to product to users</title>
        <desc>
          A person figure has an idea, shown as a thought bubble with a lightning bolt and their eyes
          opening. A demo app frame then appears, surrounded by many gray eye icons; some light up
          orange, lean in, and turn into feedback speech-bubble icons inside the frame while an
          insights counter rises. As a separate stage, the frame fills in with a header, colorful
          blocks and a bar chart. As another separate stage after that, one more feature, a small
          list of rows, is added below. Finally, new eyes appear around the finished app; the app
          becomes semi-transparent, and some eyes light up green, lean in, and turn into
          person-shaped user icons inside it while a green users counter rises to eight. This
          repeats in a loop.
        </desc>

        <g ref={personRef} style={{ opacity: 0, transition: "opacity 0.6s ease", color: BLUE }}>
          <rect x="308" y="286" width="64" height="72" rx="30" fill="currentColor" />
          <circle cx="340" cy="262" r="17" fill="currentColor" />
        </g>
        <g ref={eyesClosedRef} style={{ transition: "opacity 0.25s ease" }}>
          <line x1="329" y1="261" x2="337" y2="261" stroke={SURFACE} strokeWidth="2" strokeLinecap="round" />
          <line x1="343" y1="261" x2="351" y2="261" stroke={SURFACE} strokeWidth="2" strokeLinecap="round" />
        </g>
        <g ref={eyesOpenRef} style={{ opacity: 0, transition: "opacity 0.25s ease" }}>
          <circle cx="333" cy="261" r="3.4" fill={SURFACE} />
          <circle cx="347" cy="261" r="3.4" fill={SURFACE} />
          <circle cx="333" cy="261" r="1.4" fill={BLUE} />
          <circle cx="347" cy="261" r="1.4" fill={BLUE} />
        </g>
        <circle ref={tb1Ref} cx="360" cy="234" r="4" fill={BORDER} style={{ opacity: 0, transition: "opacity 0.3s ease" }} />
        <circle ref={tb2Ref} cx="371" cy="216" r="6" fill={BORDER} style={{ opacity: 0, transition: "opacity 0.3s ease" }} />
        <ellipse
          ref={cloudRef}
          cx="390"
          cy="174"
          rx="46"
          ry="30"
          fill={SURFACE}
          stroke={BORDER}
          strokeWidth="1.5"
          style={{ opacity: 0, transition: "opacity 0.5s ease" }}
        />
        <circle ref={ideaDotRef} cx="390" cy="174" r="4" fill={BLUE} style={{ opacity: 0, transition: "opacity 0.4s ease" }} />
        <path
          ref={boltRef}
          d="M 394 158 L 380 176 L 388 176 L 383 190 L 402 168 L 392 168 Z"
          fill={ORANGE}
          style={{ opacity: 0, transition: "opacity 0.35s ease", transformOrigin: "390px 174px" }}
        />

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
            y="345"
            textAnchor="middle"
            fill={ORANGE}
            fontFamily={FONT}
            fontWeight="700"
            fontSize="14"
          >
            Insights
          </text>
          <text
            ref={counterNumRef}
            x="340"
            y="365"
            textAnchor="middle"
            fill={ORANGE}
            fontFamily={FONT}
            fontWeight="800"
            fontSize="20"
          >
            0
          </text>
        </g>

        <g ref={feedbackIconsRef} />
        <g ref={eyeHolderRef} />
      </svg>
    </div>
  );
}
