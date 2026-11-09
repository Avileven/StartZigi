// Founder journey intro animation, plays once when it scrolls into view, with a Replay button.
"use client";
import React, { useEffect, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";

const STAGE_W = 1200;
const STAGE_H = 800;
const OFF = 29800; // intro length (questions, community network, StartZig) before the phone scene

const QUESTIONS = [
  "Launched, but can't get users?",
  "Struggling to turn your idea into a product?",
  "Want to build a community around your app?",
  "Not sure which features to build?",
  "Struggling with your business model?",
  "Feeling alone?",
];

// StartZig wordmark, same letters and colors as the home page hero
const MARK = [
  { ch: "S", rest: "#3457D5", final: "#3457D5", op: 1 },
  { ch: "t", rest: "#4358D5", final: "#4358D5", op: 1 },
  { ch: "a", rest: "#5159D6", final: "#5159D6", op: 1 },
  { ch: "r", rest: "#5F59D6", final: "#5F59D6", op: 1 },
  { ch: "t", rest: "#6E5AD6", final: "#6E5AD6", op: 1 },
  { ch: "Z", rest: "#6E5AD6", final: "#F0A020", op: 0.4 },
  { ch: "i", rest: "#6E5AD6", final: "#F0A020", op: 0.7 },
  { ch: "g", rest: "#6E5AD6", final: "#F0A020", op: 1 },
];

const SKIN = ["#f3c9a5", "#d9a074", "#8d5a3b", "#f1d2b8", "#c68a62", "#e8b98f"];
const HAIR = ["#2b2118", "#5a3a22", "#111", "#a0522d", "#d9a441", "#3a2a4a"];
const BG = ["#dbe7ff", "#fde4cf", "#d9f5e6", "#fbe0ec", "#e9e0fb", "#fff1c2"];
const SHIRT = ["#3b6cf0", "#10b981", "#f97316", "#a855f7", "#ec4899", "#0ea5e9"];
const avatarSvg = (i) =>
  `<svg viewBox="0 0 64 64"><rect width="64" height="64" fill="${BG[i % 6]}"/><ellipse cx="32" cy="62" rx="22" ry="17" fill="${SHIRT[(i + 2) % 6]}"/><circle cx="32" cy="27" r="12" fill="${SKIN[i % 6]}"/><path d="M19 26c0-9 7-14 14-14s13 5 13 14c-3-5-8-7-13-7s-10 2-14 7z" fill="${HAIR[(i * 5 + 1) % 6]}"/></svg>`;

// Positions of the community faces around the founder (stage coordinates, inside the 1200x580 grid area)
const FP = [[130, 60], [300, 50], [470, 45], [740, 45], [900, 50], [1070, 60], [60, 170], [60, 300], [60, 420], [1140, 170], [1140, 300], [1140, 420], [130, 525], [300, 535], [470, 540], [730, 540], [900, 535], [1070, 525]];
const CX = 600;
const CY = 290;

// Phone-scene helpers
const XOFF = { far: 490, mid: 410, near: 330 };
const SCL = { far: 0.62, mid: 0.8, near: 1 };
const ROW = [190, 280, 370, 460, 550, 640];
const PERM = [2, 0, 4, 1, 5, 3];
const YR = Array.from({ length: 12 }, (_, i) => ROW[PERM[Math.floor(i / 2)]] + (i % 2 ? -20 : 20));

const FEAT_HTML = {
  bulb: '<div style="display:flex;justify-content:center"><svg width="46" height="58" viewBox="0 0 46 58"><path d="M23 3C12 3 5 11 5 20c0 7 4 11 8 15 2 2 3 4 3 7h14c0-3 1-5 3-7 4-4 8-8 8-15C41 11 34 3 23 3z" fill="#fbbf24"/><rect x="16" y="45" width="14" height="5" rx="2.5" fill="#94a3b8"/><rect x="18" y="52" width="10" height="4" rx="2" fill="#94a3b8"/></svg></div>',
  hero: '<div class="fj-hero"></div>',
  lines: '<div class="fj-tl"><i></i><i></i><i></i></div>',
  price: '<div class="fj-prices"><div><i></i><i style="width:22px"></i></div><div style="position:relative"><i></i><i style="width:22px"></i><u style="position:absolute;top:-9px;right:-6px;background:#10b981;color:#fff;font:800 9px sans-serif;padding:3px 6px;border-radius:99px;text-decoration:none">FREE</u></div></div>',
  icons: '<div class="fj-icons"><i></i><i></i><i></i></div>',
  nav: '<div style="display:flex;gap:6px"><i style="flex:1;height:8px;border-radius:4px;background:#3b6cf0"></i><i style="flex:1;height:8px;border-radius:4px;background:#d6def5"></i><i style="flex:1;height:8px;border-radius:4px;background:#d6def5"></i></div><div style="display:flex;gap:8px;margin-top:8px"><div style="flex:1;height:40px;border-radius:12px;background:#eef3ff"></div><div style="flex:1;height:40px;border-radius:12px;background:#eef3ff"></div></div>',
  heart: '<div style="display:flex;align-items:center;gap:8px"><svg width="26" height="24" viewBox="0 0 24 22"><path d="M12 21C5 15 1 11.5 1 7a5.5 5.5 0 0 1 11-1.5A5.5 5.5 0 0 1 23 7c0 4.5-4 8-11 14z" fill="#ef4444"/></svg><i style="display:block;height:8px;width:90px;border-radius:4px;background:#d6def5"></i></div>',
};

const CSS = `
.fj-wrap{width:100%}
.fj-box{position:relative;width:100%;border-radius:20px;overflow:hidden;background:#f3f5fb}
.fj-stage{position:absolute;left:0;top:0;width:${STAGE_W}px;height:${STAGE_H}px;transform-origin:0 0;background:#f3f5fb;overflow:hidden;font-family:inherit;color:#0f1f5c}
.fj-stage *{box-sizing:border-box}
.fj-ttl{position:absolute;left:0;top:24px;width:100%;text-align:center;font-size:42px;font-weight:800;letter-spacing:-.02em;color:#F0A020;transition:opacity .4s}
.fj-phone{position:absolute;left:450px;top:150px;width:300px;height:520px;border-radius:38px;background:#fff;border:7px solid #1e3a8a;box-shadow:0 18px 50px rgba(30,58,138,.22);transform:scale(.78);transform-origin:50% 50%;transition:transform 1.5s cubic-bezier(.4,0,.2,1),opacity .6s;overflow:hidden}
.fj-bar0{height:44px;background:#f4f7ff;display:flex;align-items:center;padding:0 16px;gap:10px}
.fj-bar0 i{width:22px;height:22px;border-radius:7px;background:#c7d4f5}
.fj-bar0 b{height:9px;width:90px;border-radius:5px;background:#c7d4f5}
.fj-scr{padding:12px;display:flex;flex-direction:column;gap:9px}
.fj-f{animation:fj-pop .6s cubic-bezier(.3,1.6,.5,1) both;transform-origin:50% 0}
@keyframes fj-pop{from{opacity:0;transform:scale(.6)}to{opacity:1;transform:none}}
.fj-hero{height:60px;border-radius:14px;background:linear-gradient(135deg,#fbbf24,#f97316)}
.fj-tl i{display:block;height:8px;border-radius:4px;background:#d6def5;margin-bottom:6px}
.fj-tl i:nth-child(1){width:92%}.fj-tl i:nth-child(2){width:76%}.fj-tl i:nth-child(3){width:60%}
.fj-prices{display:flex;gap:8px}
.fj-prices>div{flex:1;height:56px;border-radius:12px;border:2px solid #d6def5;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px}
.fj-prices>div:nth-child(2){border-color:#3b6cf0;background:#eef3ff}
.fj-prices i{display:block;width:34px;height:7px;border-radius:4px;background:#c7d4f5}
.fj-icons{display:flex;gap:8px}
.fj-icons i{flex:1;height:50px;border-radius:12px;background:#eef3ff;position:relative}
.fj-icons i:after{content:"";position:absolute;left:50%;top:50%;width:20px;height:20px;border-radius:6px;background:#3b6cf0;transform:translate(-50%,-50%);opacity:.7}
.fj-wait{display:flex;align-items:center;gap:8px;background:#e6f9ee;border-radius:99px;padding:8px 12px;position:absolute;left:12px;right:12px;bottom:14px;z-index:3}
.fj-wait b{height:8px;width:26px;border-radius:4px;background:#34d399}
.fj-chip{position:absolute;width:38px;height:30px;border-radius:14px;background:#fff;border:2px solid #c7d4f5;color:#6f82b8;box-shadow:0 4px 14px rgba(40,70,160,.2);z-index:5;opacity:0;transform:scale(.6);text-align:center;line-height:26px;letter-spacing:2px;font-size:20px;font-weight:800}
.fj-av2{position:absolute;width:64px;height:64px;border-radius:50%;overflow:hidden;opacity:0;transform:scale(.3);box-shadow:0 4px 12px rgba(40,70,160,.18);border:3px solid #fff}
.fj-av2 svg,.fj-gf svg,.fj-lone svg{width:100%;height:100%;display:block}
.fj-card{position:absolute;top:330px;background:#fff;border-radius:14px;font-weight:700;line-height:1.3;color:#0f1f5c;box-shadow:0 10px 30px rgba(30,58,138,.28);border-left:6px solid #f59e0b;opacity:0;transform:translateY(14px) scale(.9);transition:transform .45s cubic-bezier(.3,1.5,.5,1),opacity .35s;z-index:8}
.fj-card.b{border-left-color:#3b6cf0}.fj-card.show{opacity:1;transform:none}
.fj-slide{position:absolute;left:0;top:0;width:100%;height:100%;z-index:20;background:#f3f5fb;transition:opacity .6s}
.fj-grid{position:absolute;left:0;top:130px;width:${STAGE_W}px;height:580px;z-index:1;transition:opacity .7s}
.fj-svg{position:absolute;left:0;top:0;width:${STAGE_W}px;height:580px}
.fj-gf{position:absolute;width:44px;height:44px;border-radius:50%;overflow:hidden;border:3px solid #fff;box-shadow:0 4px 12px rgba(40,70,160,.12);filter:grayscale(1);opacity:.32;transition:filter 1.2s,opacity 1.2s,transform 2.6s ease-in-out}
.fj-gf.on{filter:none;opacity:1}.fj-gf.tw{filter:none;opacity:.9}
.fj-lone{position:absolute;width:86px;height:86px;border-radius:50%;overflow:hidden;border:4px solid #fff;box-shadow:0 4px 14px rgba(40,70,160,.2);filter:grayscale(1) brightness(.85);opacity:.5;animation:fj-fadeLone 3s ease-in-out infinite;z-index:2}
.fj-lone.lit{filter:none;opacity:1;animation:none}
.fj-lone.pulse{box-shadow:0 0 0 10px rgba(110,90,214,.18),0 4px 14px rgba(40,70,160,.2)}
@keyframes fj-fadeLone{0%,100%{opacity:.55}50%{opacity:.2}}
.fj-fb{position:absolute;width:48px;height:36px;border-radius:16px;background:#fff;text-align:center;font-weight:800;font-size:26px;line-height:26px;letter-spacing:1px;z-index:3;box-shadow:0 3px 10px rgba(40,70,160,.25);transition:left 1.1s cubic-bezier(.5,0,.3,1),top 1.1s cubic-bezier(.5,0,.3,1),transform 1.1s,opacity .3s .8s}
.fj-qq{position:absolute;left:100px;right:100px;top:130px;bottom:90px;display:flex;align-items:center;justify-content:center;text-align:center;font-size:52px;line-height:1.2;font-weight:700;color:#5d6780;opacity:0;transform:translateY(24px) scale(.97);transition:opacity .45s,transform .5s cubic-bezier(.3,1.3,.5,1);z-index:2}
.fj-qq.on{opacity:1;transform:none}
.fj-qq.last{font-size:74px}
.fj-qq.ans{font-size:70px;color:#6E5AD6;flex-direction:column;gap:30px}
.fj-qq.ans>div{max-width:100%}
.fj-tc{opacity:0;transition:opacity .25s}.fj-tc.s{opacity:1}
.fj-mark{font-size:96px;font-weight:800;line-height:1.2;white-space:nowrap}
.fj-ml{display:inline-block;opacity:0;transition:color .35s ease,filter .35s ease,opacity .35s ease}
.fj-lbl{position:absolute;left:0;top:705px;width:100%;text-align:center;font-size:28px;font-weight:800;letter-spacing:.14em;color:#f59e0b;transition:opacity .4s}
.fj-dots{position:absolute;left:0;top:752px;width:100%;display:flex;justify-content:center;gap:10px;transition:opacity .6s}
.fj-dots i{width:10px;height:10px;border-radius:50%;background:#d6def5;transition:all .4s}
.fj-dots i.on{background:#f59e0b;transform:scale(1.25)}
`;

function buildHtml() {
  const q = QUESTIONS.map((t, i) => {
    const words = t
      .split(" ")
      .map((w) => `<span style="white-space:nowrap">${[...w].map((c) => `<span class="fj-tc">${c.replace("'", "&#39;")}</span>`).join("")}</span>`)
      .join(" ");
    return `<div class="fj-qq${i === QUESTIONS.length - 1 ? " last" : ""}"><div>${words}</div></div>`;
  }).join("");
  const mark = MARK.map((m) => `<span class="fj-ml" data-rest="${m.rest}" data-final="${m.final}" data-op="${m.op}" style="color:${m.rest}">${m.ch}</span>`).join("");
  return (
    `<div class="fj-ttl"></div>` +
    `<div class="fj-slide"><div class="fj-grid"></div>${q}` +
    `<div class="fj-qq ans"><div>You Don&#39;t Have to Build Your Product Alone.</div><div class="fj-mark">${mark}</div></div></div>` +
    `<div class="fj-phone"><div class="fj-bar0"><i></i><b></b></div><div class="fj-scr"></div></div>` +
    `<div class="fj-lbl">IDEA</div><div class="fj-dots"><i class="on"></i><i></i><i></i></div>`
  );
}

export default function FounderJourneyAnimation({ className = "" }) {
  const boxRef = useRef(null);
  const stageRef = useRef(null);
  const playRef = useRef(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const box = boxRef.current;
    const root = stageRef.current;
    if (!box || !root) return undefined;

    // the stage markup is injected on the client only, so it can never mismatch the server HTML (React error #425)
    root.innerHTML = buildHtml();

    root.querySelectorAll("[data-persist]").forEach((n) => n.remove());

    const q = (sel) => root.querySelector(sel);
    const qa = (sel) => [...root.querySelectorAll(sel)];
    const ttl = q(".fj-ttl");
    const slide = q(".fj-slide");
    const grid = q(".fj-grid");
    const phone = q(".fj-phone");
    const scr = q(".fj-scr");
    const lbl = q(".fj-lbl");
    const dots = q(".fj-dots");
    const qs = qa(".fj-qq");
    const ml = qa(".fj-ml");
    const tcs = qs.slice(0, 6).map((el) => [...el.querySelectorAll(".fj-tc")]);

    let scale = 1;
    let timers = [];
    let intervals = [];
    let phoneScale = 0.78;
    let started = false;
    let alive = true;

    const T = (fn, ms) => {
      const id = setTimeout(() => { if (alive) fn(); }, ms);
      timers.push(id);
      return id;
    };
    const I = (fn, ms) => {
      const id = setInterval(fn, ms);
      intervals.push(id);
      return id;
    };
    const at = (ms, fn) => T(fn, ms + OFF);
    const clearAll = () => {
      timers.forEach(clearTimeout);
      intervals.forEach(clearInterval);
      timers = [];
      intervals = [];
      root.querySelectorAll("[data-dyn]").forEach((n) => n.remove());
    };
    const mk = (cls, parent, persist) => {
      const d = document.createElement("div");
      d.className = cls;
      if (persist) d.setAttribute("data-persist", "1");
      else d.setAttribute("data-dyn", "1");
      (parent || root).appendChild(d);
      return d;
    };

    // scale the 1200x800 stage to the container width
    const fit = () => {
      scale = box.clientWidth / STAGE_W;
      box.style.height = `${STAGE_H * scale}px`;
      root.style.transform = `scale(${scale})`;
    };
    fit();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(fit) : null;
    if (ro) ro.observe(box);

    // persistent actors: the 12 phone-scene people, the community faces, lines and the founder
    const avs = [];
    const place = (a, i, t) => {
      const side = i % 2 ? 1 : -1;
      const x = 600 + side * XOFF[t];
      const y = YR[i];
      a.style.left = `${x - 32}px`;
      a.style.top = `${y - 32}px`;
      a.dataset.cx = x;
      a.dataset.cy = y;
      a.dataset.sc = SCL[t];
    };
    const AV_TRANS = "left 1.6s cubic-bezier(.4,0,.2,1),top 1.6s cubic-bezier(.4,0,.2,1),transform .5s cubic-bezier(.3,1.6,.5,1),opacity .4s";
    for (let i = 0; i < 12; i++) {
      const a = mk("fj-av2", root, true);
      a.innerHTML = avatarSvg(i);
      a.style.transition = AV_TRANS;
      place(a, i, "far");
      avs.push(a);
    }

    const gcells = [];
    const glines = [];
    const svgNS = "http://www.w3.org/2000/svg";
    const sv = document.createElementNS(svgNS, "svg");
    sv.setAttribute("class", "fj-svg");
    sv.setAttribute("viewBox", `0 0 ${STAGE_W} 580`);
    sv.setAttribute("data-persist", "1");
    grid.appendChild(sv);
    FP.forEach((p, i) => {
      const len = Math.hypot(CX - p[0], CY - p[1]);
      const ln = document.createElementNS(svgNS, "line");
      ln.setAttribute("x1", p[0]);
      ln.setAttribute("y1", p[1]);
      ln.setAttribute("x2", CX);
      ln.setAttribute("y2", CY);
      ln.setAttribute("stroke", "#6E5AD6");
      ln.setAttribute("stroke-width", "1.6");
      ln.setAttribute("stroke-opacity", ".32");
      ln.style.strokeDasharray = len;
      ln.style.strokeDashoffset = len;
      ln.style.transition = "stroke-dashoffset 1.1s ease";
      ln.dataset.len = len;
      sv.appendChild(ln);
      glines.push(ln);
      const f = mk("fj-gf", grid, true);
      f.style.left = `${p[0] - 22}px`;
      f.style.top = `${p[1] - 22}px`;
      f.innerHTML = avatarSvg(i + 3);
      gcells.push(f);
    });
    const lone = mk("fj-lone", grid, true);
    lone.innerHTML = avatarSvg(0);
    const setLone = (x, y, anim) => {
      lone.style.transition = anim ? "filter 1s,opacity .8s,left 1.1s ease,top 1.1s ease" : "filter 1s,opacity .8s";
      lone.style.left = `${x - 43}px`;
      lone.style.top = `${y - 43}px`;
    };
    setLone(600, 480, false);

    // phone-scene helpers
    const add = (html, insertTop) => {
      const d = document.createElement("div");
      d.className = "fj-f";
      d.innerHTML = html;
      if (insertTop) scr.insertBefore(d, scr.firstChild);
      else scr.appendChild(d);
      return d;
    };
    const flash = () => {
      phone.style.boxShadow = "0 0 0 6px rgba(245,158,11,.35),0 18px 50px rgba(30,58,138,.22)";
      T(() => { phone.style.boxShadow = ""; }, 320);
    };
    const feat = (name) => {
      if (name === "nav") add(FEAT_HTML.nav, true);
      else if (name === "wait") {
        const d = mk("fj-wait fj-f", phone);
        d.innerHTML = '<span class="fj-wsp" style="display:inline-flex"></span><b></b>';
      } else add(FEAT_HTML[name]);
    };
    const setStage = (n, name, s) => {
      lbl.style.opacity = 0;
      T(() => { lbl.textContent = name; lbl.style.opacity = 1; }, 300);
      [...dots.children].forEach((d, i) => d.classList.toggle("on", i === n));
      phoneScale = s;
      phone.style.transform = `scale(${s})`;
    };
    const setT = (t) => {
      ttl.style.opacity = 0;
      T(() => { ttl.textContent = t; ttl.style.opacity = 1; }, 420);
    };
    const showAv = (a, b) => {
      for (let i = a; i < b; i++) {
        T(() => {
          avs[i].classList.add("on");
          avs[i].style.opacity = 1;
          avs[i].style.transform = `scale(${avs[i].dataset.sc})`;
        }, (i - a) * 260);
      }
    };
    const setTier = (t) => {
      avs.forEach((a, i) => {
        place(a, i, t);
        if (a.style.opacity === "1") a.style.transform = `scale(${SCL[t]})`;
      });
    };
    const bubble = (ai) => {
      const av = avs[ai];
      const ax = +av.dataset.cx;
      const ay = +av.dataset.cy;
      const c = mk("fj-chip", root);
      c.textContent = "···";
      c.style.left = `${ax - 19}px`;
      c.style.top = `${ay - 58 * +av.dataset.sc}px`;
      requestAnimationFrame(() => requestAnimationFrame(() => {
        c.style.transition = "transform .4s cubic-bezier(.3,1.5,.5,1),opacity .3s";
        c.style.opacity = 1;
        c.style.transform = "scale(1)";
      }));
      T(() => { c.style.opacity = 0; }, 1300);
      T(() => c.remove(), 1700);
    };
    const card = (text, cls, f) => {
      const w = 300 * phoneScale * 0.88;
      const d = mk(`fj-card ${cls || ""}`, root);
      d.textContent = text;
      d.style.width = `${w}px`;
      d.style.left = `${600 - w / 2}px`;
      d.style.fontSize = `${phoneScale < 0.85 ? 17 : 18}px`;
      d.style.padding = "11px 13px";
      requestAnimationFrame(() => requestAnimationFrame(() => d.classList.add("show")));
      T(() => { feat(f); flash(); }, 800);
      T(() => d.classList.remove("show"), 1800);
      T(() => d.remove(), 2300);
    };
    const enter = (ai) => {
      const a = avs[ai];
      const sp = q(".fj-wsp");
      if (!sp) return;
      a.style.transition = "left 1.2s cubic-bezier(.5,0,.3,1),top 1.2s cubic-bezier(.5,0,.3,1),transform 1.2s cubic-bezier(.5,0,.3,1)";
      const r = sp.getBoundingClientRect();
      const sr = root.getBoundingClientRect();
      const n = sp.children.length;
      const tx = (r.left - sr.left) / scale + n * 16 + 11;
      const ty = (r.top - sr.top) / scale + 11;
      a.style.left = `${tx - 32}px`;
      a.style.top = `${ty - 32}px`;
      a.style.transform = `scale(${22 / 64})`;
      T(() => {
        const m = document.createElement("div");
        m.style.cssText = "width:22px;height:22px;border-radius:50%;overflow:hidden;border:2px solid #fff;margin-right:-6px;animation:fj-pop .4s both";
        m.innerHTML = avatarSvg(ai);
        m.firstChild.style.cssText = "width:100%;height:100%;display:block";
        sp.appendChild(m);
        a.style.opacity = 0;
        flash();
      }, 1250);
    };

    const play = () => {
      clearAll();
      setDone(false);
      ttl.textContent = "";
      ttl.style.opacity = 1;
      scr.innerHTML = "";
      lbl.textContent = "IDEA";
      lbl.style.opacity = 1;
      [...dots.children].forEach((d, i) => d.classList.toggle("on", i === 0));
      phoneScale = 0.78;
      phone.style.transform = "scale(.78)";
      phone.style.opacity = 0;
      lbl.style.opacity = 0;
      dots.style.opacity = 0;
      slide.style.opacity = 1;
      slide.style.display = "block";
      qs.forEach((el) => el.classList.remove("on"));
      tcs.forEach((arr) => arr.forEach((c) => c.classList.remove("s")));

      // people in the phone scene start hidden and far away
      avs.forEach((a, i) => {
        a.style.transition = "none";
        a.style.opacity = 0;
        place(a, i, "far");
        a.style.transform = "scale(.3)";
      });
      T(() => avs.forEach((a) => { a.style.transition = AV_TRANS; }), 50);

      // intro part 1: the questions, typed letter by letter, over a faint community that drifts and flickers
      const SLOT = 3000;
      qs.slice(0, 6).forEach((el, i) => {
        const t0 = 300 + i * SLOT;
        const cs = tcs[i];
        T(() => el.classList.add("on"), t0);
        cs.forEach((c, k) => T(() => c.classList.add("s"), t0 + 250 + k * 40));
        T(() => el.classList.remove("on"), t0 + 250 + cs.length * 40 + (i < 5 ? 1000 : 1500));
      });
      const twI = I(() => {
        const f = gcells[Math.floor(Math.random() * gcells.length)];
        f.classList.add("tw");
        T(() => f.classList.remove("tw"), 1800);
      }, 210);
      const drift = () => gcells.forEach((f) => {
        f.style.transform = `translate(${(Math.random() - 0.5) * 44}px,${(Math.random() - 0.5) * 44}px)`;
      });
      drift();
      const dI = I(drift, 2400);
      T(() => {
        clearInterval(twI);
        clearInterval(dI);
        gcells.forEach((f) => { f.classList.remove("tw"); f.style.transform = "translate(0,0)"; });
      }, 17600);

      // intro part 2: the founder, the community lights up and gives feedback
      grid.style.transition = "none";
      grid.style.opacity = 1;
      void grid.offsetWidth;
      grid.style.transition = "opacity .7s";
      gcells.forEach((f) => f.classList.remove("on"));
      glines.forEach((l) => { l.style.transition = "none"; l.style.strokeDashoffset = l.dataset.len; });
      void grid.offsetWidth;
      glines.forEach((l) => { l.style.transition = "stroke-dashoffset 1.1s ease"; });
      lone.classList.remove("lit");
      setLone(600, 480, false);
      const L0 = 17800;
      T(() => setLone(CX, CY, true), L0);
      T(() => lone.classList.add("lit"), L0 + 500);
      gcells.forEach((f, j) => T(() => f.classList.add("on"), L0 + 700 + j * 90));
      glines.forEach((l, j) => T(() => { l.style.strokeDashoffset = 0; }, L0 + 1800 + j * 60));
      T(() => { grid.style.opacity = 0; }, 23300);
      const FC = ["#f59e0b", "#3b6cf0", "#10b981"];
      for (let k = 0; k < 11; k++) {
        T(() => {
          const p = FP[Math.floor(Math.random() * FP.length)];
          const col = FC[k % 3];
          const b = mk("fj-fb", grid);
          b.textContent = "···";
          b.style.color = col;
          b.style.border = `2px solid ${col}`;
          b.style.left = `${p[0] - 24}px`;
          b.style.top = `${p[1] - 18}px`;
          requestAnimationFrame(() => requestAnimationFrame(() => {
            b.style.left = `${CX - 24}px`;
            b.style.top = `${CY - 18}px`;
            b.style.transform = "scale(.7)";
            b.style.opacity = 0;
          }));
          T(() => {
            b.remove();
            lone.classList.add("pulse");
            T(() => lone.classList.remove("pulse"), 280);
          }, 1100);
        }, L0 + 2700 + k * 250);
      }

      // intro part 3: the answer, then StartZig, letter by letter
      T(() => qs[6].classList.add("on"), 24000);
      ml.forEach((l) => { l.style.opacity = 0; l.style.color = l.dataset.rest; l.style.filter = "brightness(1)"; });
      ml.forEach((l, i) => {
        const t = 24000 + 900 + i * 180;
        T(() => { l.style.opacity = 1; l.style.filter = "brightness(1.7)"; }, t);
        T(() => {
          l.style.filter = "brightness(1)";
          if (i >= 5) { l.style.color = l.dataset.final; l.style.opacity = l.dataset.op; }
        }, t + 220);
      });
      T(() => { slide.style.opacity = 0; }, OFF - 700);
      T(() => {
        slide.style.display = "none";
        phone.style.opacity = 1;
        lbl.style.opacity = 1;
        dots.style.opacity = 1;
      }, OFF - 100);

      // the phone scene: insights, feedback, people joining
      let liveN = 4;
      const chat = (from, to, n) => {
        for (let k = 0; k < n; k++) at(from + (k * (to - from)) / n, () => bubble(Math.floor(Math.random() * liveN)));
      };
      at(300, () => showAv(0, 4));
      at(500, () => { add(FEAT_HTML.bulb); flash(); });
      at(100, () => setT("Insights from the community"));
      chat(900, 4600, 6);
      at(1200, () => card("Who has this problem first?", "", "hero"));
      at(3200, () => card("What makes it different?", "", "lines"));
      at(5000, () => { setStage(1, "PROTOTYPE", 0.92); setTier("mid"); showAv(4, 8); liveN = 8; });
      chat(5400, 9400, 6);
      at(5800, () => card("Add a 3-month free trial", "", "price"));
      at(7800, () => card("The message isn't clear", "", "icons"));
      at(9800, () => { setT("Feedback on the product"); setStage(2, "PRODUCT", 1.06); setTier("near"); showAv(8, 12); liveN = 12; });
      chat(10200, 14000, 6);
      at(10600, () => card("Great browsing experience", "b", "nav"));
      at(12600, () => card("Let me save favorites", "b", "heart"));
      at(14600, () => { setT("Users joining the product's community"); feat("wait"); flash(); });
      for (let j = 0; j < 10; j++) at(15400 + j * 330, () => enter(j));
      at(15400 + 9 * 330 + 2200, () => setDone(true));
    };
    playRef.current = play;

    // start once, when the animation scrolls into view
    let io = null;
    const start = () => {
      if (started) return;
      started = true;
      play();
    };
    if (typeof IntersectionObserver !== "undefined") {
      io = new IntersectionObserver((entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          start();
          io.disconnect();
        }
      }, { threshold: 0.4 });
      io.observe(box);
    } else {
      start();
    }

    return () => {
      alive = false;
      if (io) io.disconnect();
      if (ro) ro.disconnect();
      clearAll();
      playRef.current = null;
    };
  }, []);

  return (
    <div className={`fj-wrap ${className}`}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div
        ref={boxRef}
        className="fj-box"
        role="img"
        aria-label="Animation: founders get insights, feedback and early users from a community while their product grows"
      >
        <div ref={stageRef} className="fj-stage" suppressHydrationWarning />
      </div>
      <div className="flex justify-center mt-4" style={{ minHeight: 40 }}>
        <button
          type="button"
          onClick={() => playRef.current && playRef.current()}
          className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 transition-opacity"
          style={{ opacity: done ? 1 : 0, pointerEvents: done ? "auto" : "none" }}
          aria-hidden={!done}
          tabIndex={done ? 0 : -1}
        >
          <RotateCcw className="w-4 h-4" />
          Replay
        </button>
      </div>
    </div>
  );
}
