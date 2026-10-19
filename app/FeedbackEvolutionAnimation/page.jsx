// [NEW] Home page animation: "From Feedback to Product Evolution".
// Tells one short story with an invented product (SitNow, a last-minute
// babysitter app): a founder posts about the product and gets friendly but
// useless comments, then StartZig's structured feedback (two scale questions
// + one open question) turns responses into signals, an insight, and a change
// in the product and business model. Illustrative only, not live data.
//
// Place this file at: ./FeedbackEvolutionAnimation/page.jsx (same pattern as
// InsightMetricsAnimation), then import it in the home page with:
//   import FeedbackEvolutionAnimation from "./FeedbackEvolutionAnimation/page";
//
// Notes:
// - Self-contained: scoped CSS (classes prefixed fe-), no images, no video.
// - Fixed portrait stage (480x600) scaled to the container width, so the
//   same layout stays readable on mobile and desktop.
// - Starts when it scrolls into view and pauses while off screen. Plays the
//   story once, stops on the final frame (the product change), then shows a
//   Replay button.
"use client";
import React, { useEffect, useRef } from "react";

const CSS = `
.fe-frame{position:relative;width:100%;aspect-ratio:4/5;overflow:hidden;border-radius:18px;background:#f6f7fb;border:1px solid #e3e6f0;color:#141a33;font-family:-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}
.fe-stage{position:absolute;left:0;top:0;width:480px;height:600px;transform-origin:0 0}
.fe-abs{position:absolute}
.fe-tag{left:24px;top:20px;font-size:12px;letter-spacing:.14em;font-weight:700;color:#e8920c;transition:opacity .5s}
.fe-title{left:24px;top:40px;width:340px;font-size:20px;font-weight:700;line-height:1.2;transition:opacity .5s}
.fe-cnt{right:22px;top:18px;text-align:right;opacity:0;transition:opacity .5s}
.fe-cnt .n{font-size:28px;font-weight:800;color:#3457D5;line-height:1;font-variant-numeric:tabular-nums}
.fe-cnt .l{font-size:10px;letter-spacing:.12em;font-weight:700;color:#5d6685}
.fe-card{position:absolute;background:#fff;border:1.5px solid #dfe3f0;border-radius:13px;padding:11px 15px;font-size:17px;line-height:1.25;opacity:0;box-sizing:border-box;transition:left .8s ease,top .8s ease,width .8s ease,opacity .6s ease,transform .7s ease}
.fe-card.q{border-color:#3457D5;background:#e8edff;font-weight:600}
.fe-card.hot{border-color:#F0A020;background:#fff3dc}
.fe-card.insight{padding:18px 20px;border-color:#F0A020;background:#fff3dc}
.fe-card.insight .k{font-size:11px;letter-spacing:.14em;font-weight:700;color:#e8920c;margin-bottom:8px}
.fe-card.insight .t{font-size:22px;font-weight:700;line-height:1.25}
.fe-panel{position:absolute;background:#fff;border:1.5px solid #dfe3f0;border-radius:16px;opacity:0;box-sizing:border-box;transition:opacity .6s}
.fe-who{display:flex;align-items:center;gap:10px;padding:14px 16px 4px;font-size:15px;font-weight:700}
.fe-av{width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#3457D5,#6E5AD6);flex:none}
.fe-ptxt{padding:6px 18px 10px;font-size:18px;line-height:1.35;min-height:80px}
.fe-caret{display:inline-block;width:2px;height:1em;background:#141a33;vertical-align:-2px;margin-left:1px;animation:fe-bl 1s steps(1) infinite}
@keyframes fe-bl{50%{opacity:0}}
.fe-cm{position:absolute;left:12px;right:12px;background:#f6f7fb;border:1px solid #dfe3f0;border-radius:11px;padding:8px 12px;font-size:16px;opacity:0;transform:translateY(12px);transition:opacity .5s,transform .5s}
.fe-cm.on{opacity:1;transform:none}
.fe-shot{position:absolute;background:#fff;border:1.5px solid #dfe3f0;border-radius:14px;overflow:hidden;opacity:0;box-sizing:border-box;transition:opacity .6s,transform .7s}
.fe-shot .tb{height:20px;background:#e8edff;display:flex;align-items:center;gap:5px;padding:0 10px}
.fe-shot .tb b{width:7px;height:7px;border-radius:50%;background:#dfe3f0;display:block}
.fe-shot .row{display:flex;align-items:center;gap:10px;padding:6px 14px}
.fe-shot .row u{width:26px;height:26px;border-radius:50%;background:#e8edff;flex:none;display:block}
.fe-shot .row s{flex:1;display:block}
.fe-shot .row s i{display:block;height:7px;border-radius:4px;background:#dfe3f0;margin:4px 0}
.fe-shot .row s i+i{width:55%}
.fe-shot .row em{font-style:normal;font-size:10px;font-weight:700;color:#e8920c;border:1px solid #F0A020;border-radius:999px;padding:1px 7px}
.fe-shot .cap{font-size:12px;color:#5d6685;padding:2px 14px 8px}
.fe-qa{position:absolute;background:#fff;border:1.5px solid #dfe3f0;border-radius:14px;padding:10px 14px;box-sizing:border-box;opacity:0;transition:opacity .6s,transform .7s}
.fe-qa .ql{font-size:11px;letter-spacing:.08em;font-weight:700;color:#3457D5;margin-bottom:3px}
.fe-qa .qt{font-size:14px;color:#5d6685;margin-bottom:8px;line-height:1.25}
.fe-sc{display:flex;gap:6px}
.fe-sc b{width:26px;height:26px;border-radius:50%;border:1.5px solid #dfe3f0;box-sizing:border-box;font-size:12px;line-height:23px;text-align:center;font-weight:700;color:transparent;display:block;transition:all .3s}
.fe-sc b.s{background:#F0A020;border-color:#F0A020;color:#fff}
.fe-ends{display:flex;justify-content:space-between;font-size:11px;color:#5d6685;margin-top:4px;width:314px}
.fe-ans{position:absolute;background:#fff;border:1.5px solid #dfe3f0;border-radius:12px;padding:9px 14px;font-size:16px;box-sizing:border-box;opacity:0;transition:opacity .6s,transform .7s}
.fe-mini{position:absolute;width:150px;height:44px;border-radius:12px;background:#fff;border:1.5px solid #dfe3f0;opacity:0;transform:scale(.85);transition:opacity .18s,transform .18s;box-sizing:border-box;padding:9px 12px}
.fe-mini.on{opacity:1;transform:none}
.fe-mini i{display:block;height:7px;border-radius:4px;background:#dfe3f0;margin-bottom:7px}
.fe-mini i:last-child{width:60%;margin:0}
.fe-mini.o{border-color:#F0A020}.fe-mini.o i{background:#fff3dc}
.fe-mt{position:absolute;background:#fff;border:2px solid #dfe3f0;border-radius:16px;padding:11px 16px;box-sizing:border-box;opacity:0;transition:opacity .6s,transform .7s}
.fe-mt .r{display:flex;justify-content:space-between;align-items:baseline;font-weight:700;font-size:17px}
.fe-mt .r span{font-size:13px;color:#5d6685}
.fe-mt .m{position:relative;height:10px;border-radius:6px;background:linear-gradient(90deg,#e2536b,#f0a020,#4caf7a);margin-top:12px}
.fe-mt .m i{position:absolute;top:-4px;left:0;width:18px;height:18px;border-radius:50%;background:#fff;border:3px solid #141a33;margin-left:-9px;transition:left 1.4s ease}
.fe-small{position:absolute;font-size:14px;color:#5d6685;opacity:0;transition:opacity .6s}
.fe-replay{position:absolute;left:170px;top:430px;width:140px;padding:9px 0;border-radius:999px;border:1.5px solid #3457D5;background:#fff;color:#3457D5;font:inherit;font-size:14px;font-weight:700;cursor:pointer;opacity:0;pointer-events:none;transition:opacity .5s,background .2s}
.fe-replay:hover{background:#e8edff}
.fe-bar{left:14px;top:524px;width:452px;height:62px;background:#fff;border:1.5px solid #dfe3f0;border-radius:15px;display:flex;align-items:center;justify-content:space-between;padding:0 14px;box-sizing:border-box;opacity:0;transition:opacity .6s}
.fe-bar .nm{font-weight:800;font-size:18px}
.fe-bar .ds{font-size:12px;color:#5d6685;margin-top:2px;transition:opacity .35s}
.fe-upd{display:inline-block;font-size:9px;font-weight:700;letter-spacing:.1em;color:#e8920c;border:1px solid #F0A020;border-radius:999px;padding:1px 6px;margin-left:7px;vertical-align:middle;opacity:0;transition:opacity .4s}
.fe-upd.on{opacity:1}
.fe-pill{font-size:12px;font-weight:700;border:1.5px solid #dfe3f0;border-radius:999px;padding:7px 11px;transition:opacity .35s,background .5s,border-color .5s;white-space:nowrap}
.fe-pill.hot{background:#fff3dc;border-color:#F0A020}
`;

const DESC0 = "Verified babysitters in 30 minutes";
const PILL0 = "Commission per booking";

export default function FeedbackEvolutionAnimation({ className = "" }) {
  const frameRef = useRef(null);
  const stageRef = useRef(null);

  useEffect(() => {
    const frame = frameRef.current;
    const stage = stageRef.current;
    if (!frame || !stage) return;

    const $ = (sel) => stage.querySelector(sel);
    const dyn = $(".fe-dyn");
    let run = 0;
    let visible = false;
    let alive = true;
    let started = false;
    const timers = new Set();
    const later = (fn, ms) => {
      const t = setTimeout(() => { timers.delete(t); fn(); }, ms);
      timers.add(t);
      return t;
    };

    const fit = () => { stage.style.transform = "scale(" + frame.clientWidth / 480 + ")"; };
    fit();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(fit) : null;
    if (ro) ro.observe(frame);

    // Sleep that only counts down while the animation is on screen.
    const sleep = (ms, id) => new Promise((res) => {
      let left = ms;
      const tick = () => {
        if (!alive || id !== run) return res(false);
        if (visible) left -= 50;
        if (left <= 0) return res(true);
        later(tick, 50);
      };
      tick();
    });

    const mk = (cls, html, x, y, w) => {
      const d = document.createElement("div");
      d.className = cls;
      d.innerHTML = html;
      d.style.left = x + "px";
      d.style.top = y + "px";
      if (w) d.style.width = w + "px";
      dyn.appendChild(d);
      return d;
    };
    const enter = (el, dx, dy) => {
      el.style.transform = "translate(" + (dx || 0) + "px," + (dy || 0) + "px)";
      void el.offsetWidth;
      requestAnimationFrame(() => { el.style.transform = "none"; el.style.opacity = 1; });
    };
    const show = (el) => requestAnimationFrame(() => { el.style.opacity = 1; });
    const hide = (el) => { el.style.opacity = 0; };
    const head = (tag, title) => {
      $(".fe-tag").style.opacity = 0; $(".fe-title").style.opacity = 0;
      later(() => {
        $(".fe-tag").textContent = tag; $(".fe-title").textContent = title;
        $(".fe-tag").style.opacity = 1; $(".fe-title").style.opacity = 1;
      }, 350);
    };
    const swap = (sel, text) => {
      const el = $(sel); el.style.opacity = 0;
      later(() => { el.textContent = text; el.style.opacity = 1; }, 380);
    };
    const resetAll = () => {
      dyn.innerHTML = "";
      $(".fe-desc").textContent = DESC0;
      $(".fe-pill").textContent = PILL0;
      $(".fe-pill").className = "fe-pill";
      $(".fe-upd").className = "fe-upd";
      $(".fe-bar").style.opacity = 0;
      $(".fe-replay").style.opacity = 0;
      $(".fe-cnt").style.opacity = 0;
      $(".fe-cn").textContent = "0";
    };

    async function play(id) {
      resetAll();
      let i;

      /* TODAY: a post and friendly, useless comments */
      head("TODAY", "A founder asks for feedback in a post.");
      if (!(await sleep(700, id))) return;
      const post = mk("fe-panel", '<div class="fe-who"><span class="fe-av"></span>Founder</div><div class="fe-ptxt"><span class="fe-pt"></span><span class="fe-caret"></span></div>', 20, 100, 440);
      post.style.height = "360px";
      show(post);
      if (!(await sleep(500, id))) return;
      const msg = "I built SitNow: it finds a verified babysitter near you in 30 minutes. Would love your feedback!";
      const pt = post.querySelector(".fe-pt");
      for (i = 1; i <= msg.length; i++) { pt.textContent = msg.slice(0, i); if (!(await sleep(22, id))) return; }
      const car = post.querySelector(".fe-caret"); if (car) car.style.display = "none";
      if (!(await sleep(600, id))) return;
      const cms = ["Looks great!", "Cool idea", "Good luck!", "Would maybe use"];
      const cel = [];
      for (i = 0; i < cms.length; i++) {
        const c = document.createElement("div");
        c.className = "fe-cm"; c.textContent = cms[i]; c.style.top = 168 + i * 46 + "px";
        post.appendChild(c); cel.push(c);
        void c.offsetWidth; c.classList.add("on");
        if (!(await sleep(600, id))) return;
      }
      if (!(await sleep(400, id))) return;
      const fq = mk("fe-card q", "So… what do I change?", 50, 474, 380);
      fq.style.textAlign = "center";
      enter(fq, 0, 16);
      if (!(await sleep(900, id))) return;
      for (i = 0; i < cel.length; i++) {
        cel[i].style.textDecoration = "line-through"; cel[i].style.opacity = 0.35;
        if (!(await sleep(300, id))) return;
      }
      fq.textContent = "No insight here to improve my product.";
      if (!(await sleep(1800, id))) return;
      post.style.opacity = 0; fq.style.opacity = 0;
      if (!(await sleep(700, id))) return;
      dyn.innerHTML = "";

      /* STARTZIG SOLUTION: structured feedback */
      head("STARTZIG SOLUTION", "Structured feedback on your product.");
      $(".fe-bar").style.opacity = 1;
      if (!(await sleep(700, id))) return;
      const rowh = '<div class="row"><u></u><s><i></i><i></i></s><em>VERIFIED</em></div>';
      const shot = mk("fe-shot", '<div class="tb"><b></b><b></b><b></b></div>' + rowh + rowh + rowh + '<div class="cap">Screen uploaded by the founder</div>', 20, 100, 440);
      enter(shot, 0, -16);
      if (!(await sleep(800, id))) return;
      const qas = [
        ["QUESTION 1", "A babysitter within 30 minutes solves a problem I have.", 9],
        ["QUESTION 2", "A verified ID makes me comfortable booking a babysitter.", 5],
      ];
      const qel = qas.map((t, k) => {
        let dots = "";
        for (let d = 1; d <= 10; d++) dots += '<b data-v="' + d + '">' + d + "</b>";
        return mk("fe-qa", '<div class="ql">' + t[0] + '</div><div class="qt">' + t[1] + '</div><div class="fe-sc">' + dots + '</div><div class="fe-ends"><span>Disagree</span><span>Agree</span></div>', 20, 276 + k * 112, 440);
      });
      for (i = 0; i < qel.length; i++) {
        enter(qel[i], 0, 20);
        if (!(await sleep(600, id))) return;
        qel[i].querySelector('b[data-v="' + qas[i][2] + '"]').classList.add("s");
        if (!(await sleep(700, id))) return;
      }
      if (!(await sleep(400, id))) return;

      /* the open question is the one that changes the product */
      qel.forEach(hide); shot.style.opacity = 0;
      if (!(await sleep(600, id))) return;
      const oq = mk("fe-card q", "What would you add to SitNow?", 50, 112, 380);
      enter(oq, 0, -14);
      const oa = ["Babysitters other parents recommend", "Reviews from people I know", "A babysitter my friend already uses"].map((t, k) =>
        mk("fe-ans", t, 50 + (k % 2) * 30, 190 + k * 66, 380));
      for (i = 0; i < oa.length; i++) { if (!(await sleep(700, id))) return; enter(oa[i], 0, 12); }
      if (!(await sleep(900, id))) return;

      /* many responses, counter running */
      oq.style.opacity = 0; oa.forEach(hide);
      $(".fe-cnt").style.opacity = 1;
      const minis = [];
      for (i = 0; i < 15; i++) {
        const m = document.createElement("div");
        m.className = "fe-mini" + (i % 3 === 0 ? " o" : "");
        m.innerHTML = "<i></i><i></i>";
        m.style.left = 20 + Math.random() * 290 + "px";
        m.style.top = 130 + Math.random() * 300 + "px";
        dyn.appendChild(m); minis.push(m);
      }
      for (i = 0; i < minis.length; i++) {
        const m = minis[i];
        m.classList.add("on");
        later(() => m.classList.remove("on"), 1000);
        $(".fe-cn").textContent = i + 1;
        if (!(await sleep(90, id))) return;
      }
      if (!(await sleep(800, id))) return;
      minis.forEach((m) => m.classList.remove("on"));
      dyn.innerHTML = "";

      /* signals */
      head("STARTZIG SOLUTION", "Responses turn into clear signals.");
      const rows = [["Solves a real need", 8.6, "Strong", "#16a34a"], ["Trust in verified babysitters", 5.2, "Mixed", "#d97706"]];
      const rel = rows.map((r, k) => {
        const el = mk("fe-mt", '<div class="r">' + r[0] + "<span>" + r[2] + " · " + r[1].toFixed(1) + '</span></div><div class="m"><i></i></div>', 20, 112 + k * 92, 440);
        el.style.borderColor = r[3]; el._v = r[1]; return el;
      });
      for (i = 0; i < rel.length; i++) {
        enter(rel[i], 0, 16);
        const el = rel[i];
        later(() => { el.querySelector("i").style.left = el._v * 10 + "%"; }, 300);
        if (!(await sleep(700, id))) return;
      }
      const th = mk("fe-card hot", "<b>Most requested addition</b><br>Babysitters other parents recommend", 20, 306, 440);
      enter(th, 0, 16);
      if (!(await sleep(2400, id))) return;
      rel.forEach(hide); th.style.opacity = 0; $(".fe-cnt").style.opacity = 0;
      if (!(await sleep(600, id))) return;
      dyn.innerHTML = "";

      /* insight and product change */
      head("INSIGHT", "Something worth checking.");
      if (!(await sleep(600, id))) return;
      const ins = mk("fe-card insight", '<div class="k">PRODUCT INSIGHT</div><div class="t">Worth checking: parents like the speed, but trust holds them back. Many ask for babysitters other parents recommend.</div>', 20, 140, 440);
      enter(ins, 0, 20);
      const sub = mk("fe-small", "A suggestion, not a decision. The founder decides.", 20, 360, 440);
      if (!(await sleep(900, id))) return;
      show(sub);
      if (!(await sleep(2400, id))) return;
      head("THE PRODUCT EVOLVES", "The founder changes the product.");
      swap(".fe-desc", "Babysitters your friends recommend");
      swap(".fe-pill", "Monthly parent circle");
      later(() => { $(".fe-pill").className = "fe-pill hot"; $(".fe-upd").className = "fe-upd on"; }, 450);
      if (!(await sleep(1500, id))) return false;
      return true;
    }

    // Plays the story once, stops on the final frame, then offers Replay.
    const replayBtn = $(".fe-replay");
    async function start() {
      const id = ++run;
      replayBtn.style.opacity = 0;
      replayBtn.style.pointerEvents = "none";
      const done = await play(id);
      if (done && alive && id === run) {
        replayBtn.style.opacity = 1;
        replayBtn.style.pointerEvents = "auto";
      }
    }
    replayBtn.addEventListener("click", start);

    const io = typeof IntersectionObserver !== "undefined"
      ? new IntersectionObserver((entries) => {
          entries.forEach((e) => {
            visible = e.isIntersecting;
            if (visible && !started) { started = true; start(); }
          });
        }, { threshold: 0.25 })
      : null;
    if (io) io.observe(frame);
    else { visible = true; started = true; start(); }

    return () => {
      alive = false;
      run++;
      replayBtn.removeEventListener("click", start);
      timers.forEach(clearTimeout);
      timers.clear();
      if (ro) ro.disconnect();
      if (io) io.disconnect();
    };
  }, []);

  return (
    <div className={className}>
      <style>{CSS}</style>
      <div ref={frameRef} className="fe-frame">
        <div ref={stageRef} className="fe-stage">
          <div className="fe-abs fe-cnt"><div className="n fe-cn">0</div><div className="l">FEEDBACK RECEIVED</div></div>
          <div className="fe-abs fe-tag" />
          <div className="fe-abs fe-title" />
          <div className="fe-dyn" />
          <button type="button" className="fe-replay">{"\u21BB"} Replay</button>
          <div className="fe-abs fe-bar">
            <div>
              <div className="nm">SitNow<span className="fe-upd">UPDATED</span></div>
              <div className="ds fe-desc">{DESC0}</div>
            </div>
            <div className="fe-pill">{PILL0}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
