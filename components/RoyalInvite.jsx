"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { MapPin, Play, Pause, Check, Phone, CalendarPlus } from "lucide-react";
import "./royal-invite.css";

// Baraat: 24 November 2026, 6:00 PM IST
const WEDDING_TARGET_ISO = "2026-11-24T18:00:00+05:30";

const CALENDAR_URL =
  "https://calendar.google.com/calendar/render?action=TEMPLATE" +
  "&text=" + encodeURIComponent("Harsh & Bharti — Wedding Ceremony") +
  "&dates=20261124T123000Z/20261124T183000Z" +
  "&location=" + encodeURIComponent("Radisson Blu Hotel, Plot 4, Sector 13, Dwarka, New Delhi 110075");

const SCHEDULE = [
  {
    day: "Monday",
    date: "23 November",
    items: [{ time: "7:00 PM", title: "Ring Ceremony & Sangeet", note: "The Grand Ballroom" }],
  },
  {
    day: "Tuesday",
    date: "24 November",
    items: [
      { time: "6:00 PM", title: "Baraat", note: "Radisson Blu, Dwarka" },
      { time: "7:00 PM", title: "Wedding Ceremony", note: "Vivah Sanskar" },
      { time: "10:00 PM", title: "Pheras", note: "Under the stars" },
    ],
  },
  {
    day: "Wednesday",
    date: "25 November",
    items: [{ time: "7:30 PM", title: "Grand Reception", note: "Mystique Banquet" }],
  },
];

const VENUES = [
  {
    key: "sangeet",
    tab: "Sangeet",
    event: "Ring Ceremony & Sangeet · 23 Nov",
    name: "The Grand Ballroom",
    address: "New Delhi",
    sketch: "/images/sketch_palace.png",
    maps: "https://maps.google.com/?q=New+Delhi",
  },
  {
    key: "wedding",
    tab: "Wedding",
    event: "Wedding Ceremony · 24 Nov",
    name: "Radisson Blu Hotel",
    address: "Plot 4, Sector 13, Dwarka, New Delhi — 110075",
    sketch: "/images/sketch_wedding.png",
    maps: "https://maps.google.com/?q=Radisson+Blu+Hotel+New+Delhi+Dwarka",
  },
  {
    key: "reception",
    tab: "Reception",
    event: "Grand Reception · 25 Nov",
    name: "Mystique Banquet",
    address: "New Delhi",
    sketch: "/images/sketch_reception.png",
    maps: "https://maps.google.com/?q=Mystique+banquet+New+Delhi",
  },
];

const RSVP_EVENTS = ["Sangeet · 23 Nov", "Wedding · 24 Nov", "Reception · 25 Nov"];

/* =========================================================
   Deterministic randomness (identical on server and client)
   ========================================================= */
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const f = (n) => n.toFixed(1);

function tornPath(seed, lift = 0) {
  const r = rng(seed);
  const ph = r() * 6.28;
  const ph2 = r() * 6.28;
  const yAt = (x) => 17 - lift + Math.sin(x / 38 + ph) * 4 + Math.sin(x / 13 + ph2) * 1.6 + (r() - 0.5) * 4.4;
  let d = `M0 34 L0 ${f(yAt(0))}`;
  for (let x = 0; x < 400; ) {
    x = Math.min(400, x + 2 + r() * 6);
    d += ` L${f(x)} ${f(yAt(x))}`;
  }
  return d + " L400 34 Z";
}

function smoothClosed(pts) {
  const N = pts.length;
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 0; i < N; i++) {
    const p0 = pts[(i - 1 + N) % N], p1 = pts[i], p2 = pts[(i + 1) % N], p3 = pts[(i + 2) % N];
    d += ` C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d + "Z";
}

const SEAL_OUTER = (() => {
  const r = rng(11);
  const pts = [];
  for (let i = 0; i < 34; i++) {
    const a = (i / 34) * Math.PI * 2;
    const rad = 52 + Math.sin(a * 7 + 1) * 2.2 + (r() - 0.5) * 4;
    pts.push([Math.cos(a) * rad, Math.sin(a) * rad]);
  }
  return smoothClosed(pts);
})();

/* =========================================================
   Classic damask, embossed tone-on-tone on the envelope
   ========================================================= */
// Right half of a Victorian damask medallion (mirrored to make the whole).
// FILL marks the shapes that get a soft fill.
const DAMASK_HALF = `
  <path d='M0-50C12-44 28-32 31-14C34 6 24 22 10 31C5 34 2 39 0 44'/>
  <path d='M0-50C5-56 6-62 2-70C1-72 0-74 0-76M0-60C3-63 3-67 0-70'/>
  <path fill='FILL' d='M8-46C14-54 22-54 24-48C20-46 14-45 8-46Z'/>
  <path d='M30-20C40-30 54-26 54-14C54-5 46-1 40-5C36-8 38-14 43-13'/>
  <path fill='FILL' d='M38-24C44-38 56-40 62-34C56-30 48-26 38-24Z'/>
  <path fill='FILL' d='M10 31C22 30 34 38 36 52C26 50 16 44 10 31Z'/>
  <path d='M28 46C38 50 44 60 40 66C37 70 32 67 34 63'/>
  <path fill='FILL' d='M0-30C8-28 16-20 16-10C16 0 8 6 0 14'/>
  <path d='M0-20C4-18 7-13 6-8C5-4 2-2 0 0M20-40a2 2 0 1 0 .1 0M46 26a1.8 1.8 0 1 0 .1 0'/>`;

const DAMASK_MOTIF = (fill) => {
  const half = DAMASK_HALF.replaceAll("FILL", fill);
  return `<g>${half}</g><g transform='scale(-1 1)'>${half}</g>`;
};

function damaskTile() {
  // half-drop repeat: one medallion in the middle, quarters in the corners
  const spots = ["60 85", "0 0", "120 0", "0 170", "120 170"];
  const layer = (dx, dy, stroke, fill) =>
    `<g transform='translate(${dx} ${dy})' fill='none' stroke='${stroke}' stroke-width='1.3' stroke-linecap='round' stroke-linejoin='round'>
      ${spots.map((p) => `<g transform='translate(${p}) scale(.62)'>${DAMASK_MOTIF(fill)}</g>`).join("")}
    </g>`;
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='120' height='170' viewBox='0 0 120 170'>
    ${layer(0.9, 1.1, "rgba(8,0,6,.45)", "rgba(8,0,6,.18)")}
    ${layer(-0.6, -0.7, "rgba(255,214,170,.08)", "rgba(255,214,170,.025)")}
    ${layer(0, 0, "rgba(128,52,100,.42)", "rgba(118,44,92,.2)")}
  </svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg.replace(/\s+/g, " "))}")`;
}

const GRAIN = `url("data:image/svg+xml,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .25  0 0 0 0 .1  0 0 0 0 .12  0 0 0 .09 0'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>"
)}")`;

const ROOT_STYLE = { "--damask": damaskTile(), "--grain": GRAIN };

/* Gold filigree that draws itself into the envelope's corners (corner at 0,0) */
const FILIGREE = [
  "M4 4H40C48 4 52 8 52 14C52 19 47 21 44 18C42 15 45 12 47 14",
  "M4 4V40C4 48 8 52 14 52C19 52 21 47 18 44C15 42 12 45 14 47",
  "M4 4C14 14 20 20 24 28",
  "M24 28C22 18 28 12 36 12C34 20 30 26 24 28Z",
  "M24 28C18 26 12 30 12 36C20 34 26 30 24 28Z",
  "M12 4C12 10 16 14 22 14M4 12C10 12 14 16 14 22",
  "M30 31a2 2 0 1 0 .1 0",
];

/* =========================================================
   Roses, leaves & doves (SVG)
   ========================================================= */
const PETAL_LAYERS = [
  { n: 5, L: 47, W: 30, off: 0, g: "o" },
  { n: 5, L: 39, W: 27, off: 36, g: "o" },
  { n: 5, L: 30, W: 22, off: 12, g: "m" },
  { n: 4, L: 21, W: 17, off: 52, g: "m" },
  { n: 3, L: 13, W: 12, off: 20, g: "i" },
];

function petalD(L, W) {
  return `M0 0C${f(-W)} ${f(-L * 0.25)} ${f(-W * 0.95)} ${f(-L * 0.95)} ${f(-W * 0.25)} ${f(-L)}Q0 ${f(-L * 1.07)} ${f(W * 0.25)} ${f(-L)}C${f(W * 0.95)} ${f(-L * 0.95)} ${f(W)} ${f(-L * 0.25)} 0 0Z`;
}

function RoseSymbol({ tone, seed }) {
  const r = rng(seed);
  return (
    <symbol id={`rose-${tone}`} viewBox="-52 -52 104 104">
      {PETAL_LAYERS.map((layer, li) => (
        <g key={li} filter={li ? `url(#rs-${tone})` : undefined}>
          {Array.from({ length: layer.n }, (_, i) => {
            const ang = layer.off + (360 / layer.n) * i + (r() - 0.5) * 12;
            const L = layer.L * (0.92 + r() * 0.12);
            const W = layer.W * (0.92 + r() * 0.12);
            return (
              <g key={i} transform={`rotate(${f(ang)})`}>
                <path d={petalD(L, W)} fill={`url(#rg-${tone}-${layer.g})`} />
                <path
                  d={`M${f(-W * 0.62)} ${f(-L * 0.84)}Q0 ${f(-L * 1.1)} ${f(W * 0.62)} ${f(-L * 0.84)}`}
                  className={`rose-rim rose-rim-${tone}`}
                />
              </g>
            );
          })}
        </g>
      ))}
      <circle r="6" fill={`url(#rg-${tone}-core)`} />
      <path d="M-1-1a2 2 0 1 1 2 3a4 4 0 1 1-5-5a6.5 6.5 0 1 1 8 7.5" className={`rose-swirl rose-swirl-${tone}`} />
    </symbol>
  );
}

function FloralDefs() {
  const grads = {
    white: { o: ["#b4a3a0", "#fffaf8"], m: ["#a28f89", "#fbf4f1"], i: ["#8a7570", "#f3e9e5"], core: ["#efe2de", "#9d8580"] },
  };
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true" focusable="false">
      <defs>
        {Object.entries(grads).map(([tone, g]) => (
          <g key={tone}>
            {["o", "m", "i"].map((k) => (
              <linearGradient key={k} id={`rg-${tone}-${k}`} x1="0" y1="1" x2="0" y2="0">
                <stop offset="0" stopColor={g[k][0]} />
                <stop offset="1" stopColor={g[k][1]} />
              </linearGradient>
            ))}
            <radialGradient id={`rg-${tone}-core`}>
              <stop offset="0" stopColor={g.core[1]} />
              <stop offset="1" stopColor={g.core[0]} />
            </radialGradient>
          </g>
        ))}
        <filter id="rs-white" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="1.4" stdDeviation="1.6" floodColor="#5b4040" floodOpacity="0.4" />
        </filter>
        <RoseSymbol tone="white" seed={8} />
      </defs>
    </svg>
  );
}

/* Gold lotus ornament that draws itself in */
const LOTUS = [
  "M110 8C98 26 97 48 110 66C123 48 122 26 110 8Z",
  "M110 66C92 58 80 42 82 22C96 30 106 46 110 66Z",
  "M110 66C128 58 140 42 138 22C124 30 114 46 110 66Z",
  "M110 66C84 66 64 54 56 36C76 36 98 48 110 66Z",
  "M110 66C136 66 156 54 164 36C144 36 122 48 110 66Z",
  "M110 20C106 32 106 46 110 56C114 46 114 32 110 20",
  "M66 71Q110 79 154 71",
  "M66 71C50 66 38 70 28 75C20 78 12 75 14 69C16 64 23 65 23 69",
  "M154 71C170 66 182 70 192 75C200 78 208 75 206 69C204 64 197 65 197 69",
  "M28 75C18 80 8 80 2 78M192 75C202 80 212 80 218 78",
];

function Lotus({ className = "" }) {
  return (
    <svg className={`lotus ${className}`} viewBox="0 0 220 84" aria-hidden="true">
      <defs>
        <linearGradient id="lotus-gold" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#b8893b" />
          <stop offset="0.5" stopColor="#fbe6b0" />
          <stop offset="1" stopColor="#b8893b" />
        </linearGradient>
      </defs>
      {LOTUS.map((d, i) => (
        <path key={i} d={d} pathLength="1" style={{ "--i": i }} />
      ))}
      <circle cx="110" cy="76" r="2.2" className="lotus-dot" />
    </svg>
  );
}

function Dove({ className }) {
  return (
    <svg className={`dove ${className}`} viewBox="-40 -32 80 52" aria-hidden="true">
      <path className="dove-wing dove-wing-far" d="M6 2C2-10-6-22-18-30C-6-29 8-19 16-2Z" />
      <path d="M-30 6C-22 2-10 0 2 2C10 3 16 0 22-4C25-6 29-6 31-3C32-1 34 0 37 0C34 2 31 3 29 5C24 11 12 14 0 13C-10 12-20 10-26 12L-37 17C-35 12-33 9-30 6Z" fill="#fdfbff" />
      <path className="dove-wing" d="M2 4C-2-8-12-21-30-28C-12-28 6-17 14 2Z" />
      <circle cx="27" cy="-3" r="0.9" fill="#3a2a40" />
    </svg>
  );
}

const PETALS = (() => {
  const r = rng(42);
  return Array.from({ length: 16 }, () => ({
    x: f(r() * 100),
    d: f(9 + r() * 8),
    delay: f(-r() * 16),
    s: f(0.6 + r() * 0.7),
    tone: r() > 0.45 ? "red" : "white",
  }));
})();

function Petals() {
  return (
    <div className="petals" aria-hidden="true">
      {PETALS.map((p, i) => (
        <span
          key={i}
          className={`petal petal-${p.tone}`}
          style={{ "--x": `${p.x}%`, "--d": `${p.d}s`, "--delay": `${p.delay}s`, "--s": p.s }}
        >
          <i />
        </span>
      ))}
    </div>
  );
}

const SPARKS = (() => {
  const r = rng(77);
  return Array.from({ length: 26 }, () => ({
    x: f(r() * 100),
    y: f(r() * 100),
    s: f(1.5 + r() * 2.5),
    d: f(3 + r() * 4),
    delay: f(-r() * 7),
  }));
})();

function Sparkles({ className = "", count = 26 }) {
  return (
    <div className={`sparkles ${className}`} aria-hidden="true">
      {SPARKS.slice(0, count).map((p, i) => (
        <i
          key={i}
          style={{ left: `${p.x}%`, top: `${p.y}%`, "--sz": `${p.s}px`, "--d": `${p.d}s`, "--delay": `${p.delay}s` }}
        />
      ))}
    </div>
  );
}

function Title({ children }) {
  return (
    <div className="title rv">
      <h2 className="script sec-title">{children}</h2>
      <svg className="title-flourish" viewBox="0 0 160 16" aria-hidden="true">
        <path pathLength="1" d="M4 8C40 8 56 2 80 8C104 14 120 8 156 8" />
        <path className="tf-gem" d="M80 3l4 5-4 5-4-5Z" />
      </svg>
    </div>
  );
}

function Tear({ seed, tone }) {
  return (
    <svg className={`tear tear-${tone}`} viewBox="0 0 400 34" preserveAspectRatio="none" aria-hidden="true">
      {tone === "wine" && <path d={tornPath(seed + 7, 3)} className="tear-fibre" />}
      <path d={tornPath(seed)} className="tear-edge" />
    </svg>
  );
}

function Flourish() {
  return (
    <svg className="flourish" viewBox="0 0 220 24" aria-hidden="true">
      <path pathLength="1" d="M110 12C96 2 80 2 72 10C66 16 74 22 80 17M110 12C124 2 140 2 148 10C154 16 146 22 140 17M110 12H8M110 12H212" />
      <path d="M110 6l5 6-5 6-5-6Z" className="flourish-gem" />
    </svg>
  );
}

/* =========================================================
   Wax seal
   ========================================================= */
// Gold wax seal with the embossed HB monogram.
function Seal() {
  return (
    <svg viewBox="-60 -60 120 120" className="seal-svg" aria-hidden="true">
      <defs>
        <radialGradient id="seal-wax" cx="36%" cy="30%" r="78%">
          <stop offset="0" stopColor="#fff6d2" />
          <stop offset="0.32" stopColor="#efcd82" />
          <stop offset="0.68" stopColor="#c08d34" />
          <stop offset="1" stopColor="#7d5419" />
        </radialGradient>
        <radialGradient id="seal-well" cx="62%" cy="66%" r="82%">
          <stop offset="0" stopColor="#f7df9c" />
          <stop offset="0.6" stopColor="#d3a54c" />
          <stop offset="1" stopColor="#a87828" />
        </radialGradient>
      </defs>
      <path d={SEAL_OUTER} fill="url(#seal-wax)" />
      <circle r="37" fill="url(#seal-well)" />
      <circle r="37.5" fill="none" stroke="#fff3c6" strokeWidth="2" opacity="0.9" transform="translate(-0.8 -0.8)" />
      <circle r="37.5" fill="none" stroke="#6b4512" strokeWidth="1.6" opacity="0.6" transform="translate(0.8 0.9)" />
      <circle r="31" fill="none" stroke="#8a6020" strokeWidth=".8" opacity="0.45" strokeDasharray="1.5 3" />
      <g className="seal-mono">
        <text x="-1" y="11" transform="translate(1 1.2)" fill="#fff2c0">HB</text>
        <text x="-1" y="11" fill="#7a5214">HB</text>
      </g>
    </svg>
  );
}

/* =========================================================
   Hooks
   ========================================================= */
function useCountdown(targetIso) {
  const [t, setT] = useState(null);
  useEffect(() => {
    const tick = () => {
      const diff = new Date(targetIso).getTime() - Date.now();
      if (diff <= 0) return setT({ past: true });
      setT({
        days: Math.floor(diff / 864e5),
        hours: Math.floor((diff / 36e5) % 24),
        minutes: Math.floor((diff / 6e4) % 60),
        seconds: Math.floor((diff / 1e3) % 60),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetIso]);
  return t;
}

function useReveal(enabled) {
  useEffect(() => {
    if (!enabled) return;
    const els = document.querySelectorAll(".rv:not(.in)");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -6% 0px" }
    );
    els.forEach((el) => io.observe(el));

    // A fast flick can jump an element past the viewport without an intersection
    // event, so anything already scrolled past is revealed too.
    let raf = 0;
    const sweep = () => {
      raf = 0;
      const limit = window.innerHeight * 0.94;
      document.querySelectorAll(".rv:not(.in)").forEach((el) => {
        if (el.getBoundingClientRect().top < limit) {
          el.classList.add("in");
          io.unobserve(el);
        }
      });
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(sweep);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, [enabled]);
}

/* =========================================================
   Sections
   ========================================================= */
function Schedule() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (window.innerHeight * 0.55 - r.top) / r.height));
      el.style.setProperty("--p", p.toFixed(4));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div className="tl" ref={ref}>
      <div className="tl-line" />
      <div className="tl-fill" />
      <svg className="tl-rose" viewBox="-52 -52 104 104" aria-hidden="true">
        <use href="#rose-white" />
      </svg>
      {SCHEDULE.map((day) => (
        <div key={day.date} className="tl-day">
          <div className="tl-day-label rv rv-z">
            <span>{day.day}</span>
            <b>{day.date}</b>
          </div>
          {day.items.map((it) => (
            <div key={it.title} className="tl-row rv rv-none">
              <div className="tl-time">{it.time}</div>
              <div className="tl-dot" />
              <div className="tl-what">
                <div className="tl-title">{it.title}</div>
                <div className="tl-note">{it.note}</div>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function Venues() {
  const [active, setActive] = useState("wedding");
  const v = VENUES.find((x) => x.key === active);
  return (
    <div className="venues rv rv-none">
      <div className="venue-tabs" role="tablist" aria-label="Choose an event">
        {VENUES.map((x) => (
          <button
            key={x.key}
            role="tab"
            aria-selected={active === x.key}
            className={active === x.key ? "on" : ""}
            onClick={() => setActive(x.key)}
          >
            {x.tab}
          </button>
        ))}
      </div>
      <div className="venue" key={v.key}>
        <div className="venue-event">{v.event}</div>
        <div className="venue-name">{v.name}</div>
        <div className="venue-addr">{v.address}</div>
        <img className="venue-sketch" src={v.sketch} alt={`Sketch of ${v.name}`} loading="lazy" />
        <a className="pill pill-wine" href={v.maps} target="_blank" rel="noreferrer">
          <MapPin size={14} /> Get Directions
        </a>
      </div>
    </div>
  );
}

/* =========================================================
   Main invitation
   ========================================================= */
export default function RoyalInvite() {
  // envelope: 'intro' -> 'ready' -> 'opening' -> 'done'
  const [stage, setStage] = useState("intro");
  const stageRef = useRef("intro");
  const [revealed, setRevealed] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [burst, setBurst] = useState(false);
  const audioRef = useRef(null);
  const countdown = useCountdown(WEDDING_TARGET_ISO);

  const [rsvp, setRsvp] = useState({ name: "", contact: "", events: ["Wedding · 24 Nov"], message: "" });
  const [submitted, setSubmitted] = useState(false);

  useReveal(revealed);

  useEffect(() => {
    const id = setTimeout(() => {
      if (stageRef.current === "intro") {
        stageRef.current = "ready";
        setStage("ready");
      }
    }, 3400);
    return () => clearTimeout(id);
  }, []);

  const rootRef = useRef(null);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = rootRef.current;
      if (!el) return;
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      el.style.setProperty("--sy", Math.min(y, 1200).toFixed(0));
      el.style.setProperty("--prog", max > 0 ? (y / max).toFixed(4) : "0");
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("inv-locked", stage !== "done");
    return () => document.documentElement.classList.remove("inv-locked");
  }, [stage]);

  const openEnvelope = useCallback(() => {
    if (stageRef.current === "opening" || stageRef.current === "done") return;
    stageRef.current = "opening";
    setStage("opening");
    window.scrollTo(0, 0);

    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = 0;
      audio.volume = 0.8;
      audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }

    setTimeout(() => setRevealed(true), 2500);
    setTimeout(() => {
      stageRef.current = "done";
      setStage("done");
    }, 3300);
  }, []);

  const toggleAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const toggleEvent = (name) =>
    setRsvp((prev) => ({
      ...prev,
      events: prev.events.includes(name) ? prev.events.filter((e) => e !== name) : [...prev.events, name],
    }));

  const submitRsvp = (e) => {
    e.preventDefault();
    if (!rsvp.name.trim()) return;
    setSubmitted(true);
    setBurst(true);
    setTimeout(() => setBurst(false), 5200);
  };

  const pad = (n) => String(n).padStart(2, "0");

  return (
    <div ref={rootRef} className={`inv ${revealed ? "revealed" : ""}`} style={ROOT_STYLE}>
      <div className="progress" aria-hidden="true" />
      <FloralDefs />
      <audio ref={audioRef} src="/audio/wedding-bgm.mp3" loop preload="auto" />

      {/* =========================================================
          ENVELOPE
          ========================================================= */}
      {stage !== "done" && (
        <div
          className={`env env-${stage}`}
          onClick={openEnvelope}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && openEnvelope()}
          role="button"
          tabIndex={0}
          aria-label="Open the wedding invitation"
        >
          <div className="env-inside" />
          <div className="env-card" aria-hidden="true">
            <div className="env-card-inner">
              <span className="env-card-kicker">॥ श्री गणेशाय नमः ॥</span>
              <span className="env-card-sub">Together with their families</span>
              <span className="script env-card-name">Harsh</span>
              <span className="script env-card-amp">&amp;</span>
              <span className="script env-card-name">Bharti</span>
              <span className="env-card-date">24 · 11 · 2026</span>
            </div>
          </div>
          <div className="env-body" />
          <svg className="env-shadow" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <filter id="flap-shadow" x="-10%" y="-10%" width="120%" height="140%">
              <feGaussianBlur stdDeviation="1.4" />
            </filter>
            <polygon points="0,0 100,0 50,47.5" filter="url(#flap-shadow)" />
          </svg>
          <svg className="env-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            {["M50 44L0 0", "M50 44L100 0", "M50 44L0 100", "M50 44L100 100"].map((d) => (
              <g key={d}>
                <path d={d} className="env-line" vectorEffect="non-scaling-stroke" />
                <path d={d} className="env-trace" pathLength="1" vectorEffect="non-scaling-stroke" />
              </g>
            ))}
          </svg>
          <svg className="env-florals" viewBox="0 0 100 216" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
            <defs>
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="1.1" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            {[
              "translate(6 9) scale(.3)",
              "translate(94 9) scale(-.3 .3)",
              "translate(6 207) scale(.3 -.3)",
              "translate(94 207) scale(-.3 -.3)",
            ].map((t, gi) => (
              <g key={t} transform={t} filter="url(#glow)" className="env-sprig" style={{ "--gi": gi }}>
                {FILIGREE.map((d, i) => (
                  <path key={i} d={d} pathLength="1" style={{ "--i": i }} />
                ))}
              </g>
            ))}
          </svg>
          <div className="env-light" />
          <div className="env-flap">
            <div className="env-flap-face env-flap-front" />
            <div className="env-flap-face env-flap-back" />
          </div>
          <div className="env-frame" aria-hidden="true" />
          <Sparkles className="env-dust" />
          <div className="env-seal">
            <Seal />
            <span className="seal-sheen" />
          </div>
          <span className="seal-dust" aria-hidden="true">
            {Array.from({ length: 16 }, (_, i) => (
              <i key={i} style={{ "--a": `${i * 22.5}deg`, "--r": `${70 + (i % 4) * 14}px` }} />
            ))}
          </span>
          <div className="env-hint">
            <span className="script">You are invited</span>
            <span className="env-hint-cta">Tap the seal to open</span>
          </div>
        </div>
      )}

      {/* Music */}
      <button
        className={`music ${isPlaying ? "playing" : ""}`}
        onClick={toggleAudio}
        aria-label={isPlaying ? "Pause music" : "Play music"}
      >
        {isPlaying ? <Pause size={16} /> : <Play size={16} />}
      </button>

      {burst && (
        <div className="petals petals-burst" aria-hidden="true">
          {PETALS.concat(PETALS).map((p, i) => (
            <span
              key={i}
              className={`petal petal-${p.tone}`}
              style={{ "--x": `${(Number(p.x) + i * 13) % 100}%`, "--d": `${(Number(p.d) * 0.45).toFixed(1)}s`, "--delay": `${((i % 9) * 0.12).toFixed(2)}s`, "--s": p.s }}
            >
              <i />
            </span>
          ))}
        </div>
      )}

      <main className="inv-col">
        {/* =========================================================
            HERO
            ========================================================= */}
        <section className="hero">
          <div className="hero-media">
            <img className="hero-bg" src="/images/palace_night_hb.jpg" alt="" />
          </div>
          <div className="hero-shade" />
          <Dove className="dove-1" />
          <Dove className="dove-2" />
          <Dove className="dove-3" />
          <Petals />
          <div className="hero-copy-wrap">
            <div className="hero-copy">
              <p className="hero-kicker">॥ श्री गणेशाय नमः ॥</p>
              <p className="script hero-day">Wedding Day</p>
              <p className="hero-date">
                <i />
                24 · 11 · 2026
                <i />
              </p>
              <p className="hero-place">New Delhi</p>
              <h1 className="hero-names">
                <span className="hn-1">Harsh</span>
                <span className="hn-amp">&amp;</span>
                <span className="hn-2">Bharti</span>
              </h1>
            </div>
          </div>
          <div className="hero-cue" aria-hidden="true">
            <span>Scroll</span>
            <i />
          </div>
          <div className="hero-ornament">
            <Lotus className="lotus-hero" />
          </div>
        </section>

        {/* =========================================================
            INVITATION LETTER
            ========================================================= */}
        <section className="sec wine">
          <Tear seed={1} tone="wine" />
          <Sparkles count={14} />
          <p className="shloka rv rv-blur">
            वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ।
            <br />
            निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥
          </p>
          <Title>Dear Friends &amp; Family,</Title>
          <p className="body-copy rv rv-blur">
            With the divine grace of the Almighty and the heartfelt blessings of our elders, we request the
            honour of your gracious presence as we begin our forever.
          </p>
          <div className="couple">
            <div className="person rv rv-l">
              <div className="person-name">Harsh Wadhera</div>
              <div className="person-parents">Son of Smt. Anita &amp; Sh. Rajesh Wadhera</div>
            </div>
            <div className="script couple-with rv rv-z">with</div>
            <div className="person rv rv-r">
              <div className="person-name">Bharti Sharma</div>
              <div className="person-parents">Daughter of Smt. Sunita &amp; Sh. Sunil Sharma</div>
            </div>
          </div>
          <p className="body-copy rv rv-blur">
            Your love and support mean the world to us, and we would be honoured to have you by our side as we
            say &ldquo;forever.&rdquo;
          </p>
        </section>

        {/* =========================================================
            COUNTDOWN
            ========================================================= */}
        <section className="sec paper">
          <Tear seed={2} tone="paper" />
          <Title>The Celebration Begins In</Title>
          {countdown?.past ? (
            <p className="cd-done rv">Just married — thank you for your blessings!</p>
          ) : (
            <div className="cd rv rv-none" aria-live="off">
              {[
                ["Days", countdown ? countdown.days : "—"],
                ["Hours", countdown ? pad(countdown.hours) : "—"],
                ["Minutes", countdown ? pad(countdown.minutes) : "—"],
                ["Seconds", countdown ? pad(countdown.seconds) : "—"],
              ].map(([label, value], i) => (
                <div key={label} className="cd-cell" style={{ "--ci": i }}>
                  {i > 0 && <span className="cd-sep">:</span>}
                  <span className="cd-num" key={value}>
                    {value}
                  </span>
                  <span className="cd-label">{label}</span>
                </div>
              ))}
            </div>
          )}
          <p className="cd-date rv">Tuesday, 24th November 2026</p>
          <a className="pill pill-wine rv" href={CALENDAR_URL} target="_blank" rel="noreferrer">
            <CalendarPlus size={14} /> Save the Date
          </a>
        </section>

        {/* =========================================================
            SCHEDULE
            ========================================================= */}
        <section className="sec wine">
          <Tear seed={3} tone="wine" />
          <Title>Schedule of Events</Title>
          <Schedule />
        </section>

        {/* =========================================================
            LOCATION
            ========================================================= */}
        <section className="sec paper">
          <Tear seed={4} tone="paper" />
          <Title>Location</Title>
          <Venues />
        </section>

        {/* =========================================================
            OUR STORY
            ========================================================= */}
        <section className="sec wine">
          <Tear seed={5} tone="wine" />
          <Title>Our Story</Title>
          <div className="frames rv rv-none">
            <figure className="frame frame-a">
              <img src="/images/couple_portrait_hb.jpg" alt="Harsh and Bharti" loading="lazy" />
            </figure>
            <figure className="frame frame-b">
              <img src="/images/event_wedding_hb.jpg" alt="The wedding mandap" loading="lazy" />
            </figure>
          </div>
          <div className="story">
            <p className="body-copy rv rv-blur">
              Our journey began with a simple conversation that effortlessly turned into hours of shared
              laughter, quiet understandings, and an instant connection that felt like home.
            </p>
            <p className="body-copy rv rv-blur">
              Between shared passions, spontaneous food runs across Delhi, and unconditional support through
              every high and low, we realised that the best adventures in life are the ones lived together.
            </p>
            <p className="body-copy rv rv-blur">
              Harsh found in Bharti his greatest confidante and brightest smile, while Bharti found in Harsh
              her rock, partner-in-crime, and easiest source of joy.
            </p>
            <p className="body-copy rv rv-blur">
              As we step into this sacred lifelong union, we cannot wait to celebrate surrounded by the warmth
              and blessings of our cherished family and friends.
            </p>
          </div>
        </section>

        {/* =========================================================
            FAMILY
            ========================================================= */}
        <section className="sec paper">
          <Tear seed={6} tone="paper" />
          <Title>With Love &amp; Blessings</Title>
          <div className="family">
            {[
              ["Grandparents", "Smt. & Sh. Wadhera · Smt. & Sh. Sharma"],
              ["Parents", "Anita & Rajesh Wadhera\nSunita & Sunil Sharma"],
              ["Family & Relatives", "Wadhera & Sharma Parivar"],
              ["With Best Compliments", "All Near & Dear Ones"],
            ].map(([role, names], i) => (
              <div key={role} className="family-group rv">
                {i > 0 && <Flourish />}
                <div className="family-role">{role}</div>
                <div className="family-names">{names}</div>
              </div>
            ))}
          </div>
        </section>

        {/* =========================================================
            RSVP
            ========================================================= */}
        <section className="sec wine sec-rsvp">
          <Tear seed={7} tone="wine" />
          <Lotus className="lotus-rsvp rv rv-none" />
          <Title>Confirm Your Attendance</Title>
          <p className="body-copy rv rv-blur">
            To help us prepare for a joyful celebration, kindly confirm your attendance.
          </p>

          {submitted ? (
            <div className="rsvp-done rv in">
              <span className="rsvp-check">
                <Check size={22} />
              </span>
              <p className="script">Thank you, {rsvp.name.split(" ")[0]}!</p>
              <p className="body-copy">Your RSVP and blessings have been warmly received.</p>
            </div>
          ) : (
            <form className="rsvp rv" onSubmit={submitRsvp}>
              <label className="field">
                <span>Your Name</span>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={rsvp.name}
                  onChange={(e) => setRsvp({ ...rsvp, name: e.target.value })}
                />
              </label>
              <label className="field">
                <span>Phone / WhatsApp</span>
                <input
                  type="tel"
                  placeholder="+91 98111 …"
                  value={rsvp.contact}
                  onChange={(e) => setRsvp({ ...rsvp, contact: e.target.value })}
                />
              </label>
              <div className="field">
                <span>I&rsquo;ll be attending</span>
                <div className="chips">
                  {RSVP_EVENTS.map((ev) => (
                    <button
                      type="button"
                      key={ev}
                      className={`chip ${rsvp.events.includes(ev) ? "on" : ""}`}
                      aria-pressed={rsvp.events.includes(ev)}
                      onClick={() => toggleEvent(ev)}
                    >
                      {ev}
                    </button>
                  ))}
                </div>
              </div>
              <label className="field">
                <span>Wishes for the couple</span>
                <textarea
                  rows={3}
                  placeholder="Write your blessings for Harsh & Bharti…"
                  value={rsvp.message}
                  onChange={(e) => setRsvp({ ...rsvp, message: e.target.value })}
                />
              </label>
              <button type="submit" className="pill pill-light">
                Send RSVP
              </button>
            </form>
          )}

          <div className="finale rv rv-none">
            <Sparkles count={18} />
            <p className="script finale-hope">Hope to see you there!</p>
            <p className="finale-names">Harsh &amp; Bharti</p>
          </div>

          <div className="contacts rv">
            <div className="contacts-title">For any assistance</div>
            <a href="tel:+919810012345" className="contact">
              <Phone size={13} />
              <span>Rajesh Wadhera</span>
              <b>+91 98100 12345</b>
            </a>
            <a href="tel:+919811154321" className="contact">
              <Phone size={13} />
              <span>Sunil Sharma</span>
              <b>+91 98111 54321</b>
            </a>
          </div>
        </section>

        <footer className="outro rv rv-none">
          <img src="/images/couple_portrait_hb.jpg" alt="Harsh and Bharti" loading="lazy" />
          <div className="outro-fade" />
          <div className="outro-copy">
            <span className="script">Forever begins</span>
            <span className="outro-date">24 · 11 · 2026</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
