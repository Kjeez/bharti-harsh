"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { MapPin, Play, Pause, Check, Phone, CalendarPlus } from "lucide-react";
import "./royal-invite.css";

// Baraat: 24 November 2026, 6:00 PM IST
const WEDDING_TARGET_ISO = "2026-11-24T18:00:00+05:30";

const calendarUrl = (names) =>
  "https://calendar.google.com/calendar/render?action=TEMPLATE" +
  "&text=" + encodeURIComponent(`${names} — Wedding Ceremony`) +
  "&dates=20261124T123000Z/20261124T183000Z" +
  "&location=" + encodeURIComponent("Radisson Blu Hotel, Plot 4, Sector 13, Dwarka, New Delhi 110075");

const SCHEDULE = [
  {
    day: "Tuesday",
    date: "24 November",
    items: [
      {
        time: "6:00 PM",
        title: "Departure of Baraat",
        note: "Baraat will reassemble at Reliance Digital, Sector 13, Dwarka and proceed to Hotel Radisson Blu, Dwarka",
      },
      { time: "7:30 PM", title: "Dinner", note: "Radisson Blu, Dwarka" },
      { time: "10:00 PM", title: "Wedding Ceremony", note: "Radisson Blu, Dwarka" },
    ],
  },
  {
    day: "Wednesday",
    date: "25 November",
    items: [{ time: "6:00 PM", title: "Grand Reception", note: "Mystique Banquet, Kirti Nagar" }],
  },
];

/* The same invite is shared three ways: by both families, by Bharti's side
   (her name first, Hindi blessing, her family's details) and by Harsh's side
   (his name first, Gurbani and Punjabi lines, his family's details). */
const BRIDE = { side: "bride", name: "Bharti", full: "Bharti Sharma", parents: "Daughter of Smt. Pushpa Sharma & Sh. Rajesh Sharma" };
const GROOM = { side: "groom", name: "Harsh", full: "Harsh Saib", parents: "Son of Smt. Jasvinder Kaur & Dr. Harbhajan Singh" };
const BRIDE_CONTACT = { name: "Rajesh Sharma", tel: "+919210870136", shown: "+91 92108 70136" };
const GROOM_CONTACT = { name: "Dr. Harbhajan Singh", tel: "+919811512518", shown: "+91 98115 12518" };
const GROOM_GRANDPARENTS = "Late Smt. Harbans Kaur & Late Sh. Joginder Singh";
const BRIDE_GRANDPARENTS = "Smt. Sumitra Devi & Late Sh. Ram Ji Das";
const GROOM_PARENTS = "Jasvinder Kaur & Dr. Harbhajan Singh";
const BRIDE_PARENTS = "Pushpa & Rajesh Sharma";
const COMPLIMENTS = ["With Best Compliments", "All Near & Dear Ones"];

const SIDES = {
  both: {
    couple: [BRIDE, GROOM],
    hindi: true,
    punjabi: true,
    onkar: false,
    song: "/audio/wedding-bgm.mp3",
    family: [
      ["Grandparents", `${GROOM_GRANDPARENTS}\n${BRIDE_GRANDPARENTS}`],
      ["Parents", `${GROOM_PARENTS}\n${BRIDE_PARENTS}`],
      ["Family & Relatives", "Sharma & Saib Parivar"],
      COMPLIMENTS,
    ],
    contacts: [GROOM_CONTACT, BRIDE_CONTACT],
  },
  bride: {
    couple: [BRIDE, GROOM],
    hindi: true,
    punjabi: false,
    onkar: false,
    song: "/audio/wedding-bgm.mp3",
    family: [
      ["Grandparents", BRIDE_GRANDPARENTS],
      ["Parents", `${BRIDE_PARENTS}\n${GROOM_PARENTS}`],
      ["Family & Relatives", "Sharma Parivar"],
      COMPLIMENTS,
    ],
    contacts: [BRIDE_CONTACT],
  },
  groom: {
    couple: [GROOM, BRIDE],
    hindi: false,
    punjabi: true,
    onkar: true,
    song: "/audio/harsh-song.mp3",
    family: [
      ["Grandparents", GROOM_GRANDPARENTS],
      ["Parents", `${GROOM_PARENTS}\n${BRIDE_PARENTS}`],
      ["Family & Relatives", "Saib Parivar"],
      COMPLIMENTS,
    ],
    contacts: [GROOM_CONTACT],
  },
};

const VENUES = [
  {
    key: "wedding",
    tab: "Wedding",
    event: "Wedding Ceremony · 24 Nov",
    name: "Radisson Blu Hotel",
    address: "Plot 4, Sector 13, Dwarka, New Delhi — 110075",
    sketch: "/images/sketch_wedding.png",
    photo: {
      src: "/images/venue_radisson.jpg",
      credit: "Kmrpreetam",
      license: "CC BY-SA 3.0",
      link: "https://commons.wikimedia.org/wiki/File:1_Hotel_Exterior_View.JPG",
    },
    maps: "https://maps.google.com/?q=Radisson+Blu+Hotel+New+Delhi+Dwarka",
  },
  {
    key: "reception",
    tab: "Reception",
    event: "Grand Reception · 25 Nov",
    name: "Mystique Banquet",
    address: "Rama Road, Kirti Nagar, Shivaji Marg, New Delhi — 110015",
    sketch: "/images/sketch_reception.png",
    photo: { src: "/images/venue_mystique.jpg", credit: "Mystique Banquet" },
    maps: "https://maps.google.com/?q=Mystique+Banquet+Rama+Road+Kirti+Nagar+New+Delhi+110015",
  },
];

const RSVP_EVENTS = ["Wedding · 24 Nov", "Reception · 25 Nov"];

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

function smoothClosed(pts) {
  const N = pts.length;
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 0; i < N; i++) {
    const p0 = pts[(i - 1 + N) % N], p1 = pts[i], p2 = pts[(i + 1) % N], p3 = pts[(i + 2) % N];
    d += ` C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d + "Z";
}

// Heart-shaped wax seal: the classic heart curve, with a little melted-wax wobble on the outer edge.
function heartPath(scale, wobble, seed) {
  const r = rng(seed);
  const pts = [];
  for (let i = 0; i < 44; i++) {
    const t = (i / 44) * Math.PI * 2;
    const k = 1 + (wobble ? Math.sin(t * 9 + 1) * 0.022 + (r() - 0.5) * 0.03 : 0);
    const x = 16 * Math.sin(t) ** 3;
    const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) - 2.5;
    pts.push([x * scale * k, y * scale * k]);
  }
  return smoothClosed(pts);
}
const SEAL_OUTER = heartPath(3.25, true, 11);
const SEAL_INNER = heartPath(2.35, false, 0);
const SEAL_RING = heartPath(2.0, false, 0);
const HEART = "M0 5C-4 2.5-7 0-7-3C-7-5.5-5-7-3-7C-1.5-7-.5-6 0-5C.5-6 1.5-7 3-7C5-7 7-5.5 7-3C7 0 4 2.5 0 5Z";

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

const LINER_HEART = "C3.5 7.2 2 6 2 4.5C2 3.3 3 2.5 4 2.5C4.7 2.5 5.2 2.9 5.5 3.4C5.8 2.9 6.3 2.5 7 2.5C8 2.5 9 3.3 9 4.5C9 6 7.5 7.2 5.5 8.5Z";
const LINER = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='22' height='22'><rect width='22' height='22' fill='#f4e4c1'/><path d='M5.5 8.5${LINER_HEART}' fill='#c99a45' opacity='.5'/><path d='M16.5 19.5${LINER_HEART}' transform='translate(11 11)' fill='#c99a45' opacity='.5'/></svg>`
)}")`;

const ROOT_STYLE = { "--damask": damaskTile(), "--grain": GRAIN, "--liner": LINER };

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

/* Hand-drawn journey: Himachal hills, Shri Ram Mandir, Punjab's wheat (viewBox 0 0 400 300) */
const SKY_FILL = [
  // plinth, pillared ground floor and upper storey
  "M64 262V250H76V240H92V203H84L92 197H104V180H98L106 175H294L302 180H296V197H308L316 203H308V240H324V250H336V262Z",
  // main shikhara with its attached half-spires
  "M150 175C150 150 156 132 166 120H171C174 98 182 76 192 58H208C218 76 226 98 229 120H234C244 132 250 150 250 175Z",
  // stepped roofs over the halls
  "M106 175L126 140H146L166 175Z",
  "M234 175L254 140H274L294 175Z",
  // corner spires
  "M88 197C88 184 91 174 94 168H98C101 174 104 184 104 197Z",
  "M296 197C296 184 299 174 302 168H306C309 174 312 184 312 197Z",
];
const SKY_FLAG = "M200 22L216 27L200 32Z";

const SKYLINE = (() => {
  const far = [];
  const near = [];
  // Dhauladhar range behind everything, with snow hatching on the peaks
  const peaks = [[50, 150], [84, 128], [132, 170], [228, 150], [270, 126], [350, 146]];
  far.push("M0 196L18 178L30 186L50 150L64 162L84 128L100 146L112 138L132 170L150 160L170 178L200 168L228 150L246 162L270 126L288 150L306 140L326 166L350 146L372 160L400 136");
  peaks.forEach(([x, y]) => far.push(`M${x - 7} ${y + 9}L${x - 3} ${y + 4}M${x + 2} ${y + 5}L${x + 6} ${y + 10}M${x - 2} ${y + 11}L${x + 1} ${y + 8}`));

  near.push("M0 262C60 258 120 265 200 262S340 258 400 263");
  // Himachal: deodars on the left
  [[12, 1], [28, 0.78]].forEach(([x, k]) => {
    const t = (dx, dy) => `${(x + dx * k).toFixed(1)} ${(262 - dy * k).toFixed(1)}`;
    near.push(`M${t(0, 0)}L${t(0, 10)}M${t(-10, 10)}L${t(10, 10)}L${t(4, 19)}L${t(8, 19)}L${t(3, 28)}L${t(6, 28)}L${t(0, 40)}L${t(-6, 28)}L${t(-3, 28)}L${t(-8, 19)}L${t(-4, 19)}L${t(-10, 10)}`);
  });
  // cypresses at the temple's corners
  [[50, 0.9], [350, 0.9]].forEach(([x, k]) => {
    const b = 262 - 12 * k;
    near.push(`M${x} 262V${b}C${x - 8 * k} ${262 - 24 * k} ${x - 6 * k} ${262 - 44 * k} ${x} ${262 - 58 * k}C${x + 6 * k} ${262 - 44 * k} ${x + 8 * k} ${262 - 24 * k} ${x} ${b}`);
  });

  // Shri Ram Mandir — plinth
  near.push("M64 262V250H336V262M64 256H336", "M76 250V240H324V250M76 245H324");
  // grand front steps
  let steps = "M176 262L182 240M224 262L218 240";
  for (let y = 258; y > 240; y -= 4) {
    const inset = ((262 - y) / 22) * 6;
    steps += `M${f(176 + inset)} ${y}H${f(224 - inset)}`;
  }
  near.push(steps);
  // ground floor: pillared bays with cusped arches, and the arched doorway
  near.push("M92 240V203H308V240");
  for (const side of [-1, 1]) {
    let bays = "";
    for (let k = 0; k < 6; k++) {
      const x = side < 0 ? 100 + k * 12 : 300 - k * 12;
      bays += `M${x} 240V206`;
      if (k < 5) {
        const x2 = x + side * 12;
        bays += `M${x} 214Q${(x + x2) / 2} 206 ${x2} 214`;
      }
    }
    near.push(bays);
  }
  near.push(
    "M172 240V206M228 240V206",
    "M180 240V218Q180 204 200 198Q220 204 220 218V240",
    "M188 240V222Q188 212 200 208Q212 212 212 222V240",
    "M84 203L92 197H308L316 203"
  );
  // upper storey with its own eave
  let upper = "M104 197V180H296V197";
  for (let x = 112; x <= 288; x += 12) upper += `M${x} 197V184`;
  near.push(upper, "M98 180L106 175H294L302 180");
  // stepped roofs over the side halls, each topped with an amalaka and kalash
  for (const cx of [136, 264]) {
    let roof = "";
    for (let k = 0; k < 5; k++) {
      const y = 175 - k * 7;
      const hw = 30 - k * 5;
      roof += `M${cx - hw} ${y}L${cx - hw + 3} ${y - 7}H${cx + hw - 3}L${cx + hw} ${y}`;
    }
    near.push(roof, `M${cx - 6} 140Q${cx} 133 ${cx + 6} 140ZM${cx - 2} 133Q${cx} 128 ${cx + 2} 133M${cx} 128V123`);
  }
  // corner spires
  for (const cx of [96, 304]) {
    near.push(
      `M${cx - 8} 197C${cx - 8} 184 ${cx - 5} 174 ${cx - 2} 168M${cx + 8} 197C${cx + 8} 184 ${cx + 5} 174 ${cx + 2} 168`,
      `M${cx - 7} 189H${cx + 7}M${cx - 6} 181H${cx + 6}M${cx - 4} 174H${cx + 4}M${cx - 3} 168Q${cx} 164 ${cx + 3} 168M${cx} 164V158`
    );
  }
  // half-spires hugging the main shikhara
  near.push(
    "M150 175C150 150 156 132 166 120M250 175C250 150 244 132 234 120",
    "M164 120Q166 114 168 120M232 120Q234 114 236 120",
    "M152 158H170M151 142H172M155 128H174M248 158H230M249 142H228M245 128H226"
  );
  // main shikhara: curved outline, ribs, horizontal tiers, amalaka, kalash and flagpole
  near.push("M162 175C162 128 174 88 192 58M238 175C238 128 226 88 208 58");
  near.push("M184 175C184 130 190 92 196 60M216 175C216 130 210 92 204 60");
  let tiers = "";
  for (const y of [160, 146, 132, 118, 104, 90, 76]) {
    const t = (175 - y) / 117;
    const hw = 38 - 30 * t ** 1.6;
    tiers += `M${f(200 - hw)} ${y}H${f(200 + hw)}`;
  }
  near.push(tiers);
  near.push("M190 58Q200 49 210 58ZM192 58H208", "M196 49Q195 43 200 41Q205 43 204 49Z", "M200 41V20", SKY_FLAG);

  // Punjab: wheat on the right
  [[382, 0], [392, 4]].forEach(([x, lean]) => {
    near.push(`M${x} 262C${x} 250 ${x + lean / 2} 240 ${x + lean + 4} 228`);
    let g = "";
    for (let i = 0; i < 4; i++) {
      const gx = x + lean + 4 - i * 0.8;
      const gy = 228 + i * 5;
      g += `M${gx.toFixed(1)} ${gy}l-3.4-4.4M${gx.toFixed(1)} ${gy}l3.4-4.4`;
    }
    near.push(g, `M${x} 252q-7-3-9-10M${x} 246q7-3 9-10`);
  });
  // a few drawn stars (the moon comes from the night-sky photo behind)
  [[40, 24], [150, 40], [262, 22], [386, 78], [110, 96], [20, 120]].forEach(([x, y]) =>
    near.push(`M${x} ${y - 4}L${x + 1} ${y - 1}L${x + 4} ${y}L${x + 1} ${y + 1}L${x} ${y + 4}L${x - 1} ${y + 1}L${x - 4} ${y}L${x - 1} ${y - 1}Z`)
  );
  return { far, near };
})();

function Skyline() {
  // the ghost stroke draws alongside its main stroke, so both share an index
  const far = SKYLINE.far.length;
  const draw = (d, key, i) => <path key={key} d={d} pathLength="1" style={{ "--i": i }} />;
  return (
    <svg className="skyline" viewBox="0 0 400 300" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
      <defs>
        <linearGradient id="sk-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fbe7b2" />
          <stop offset="1" stopColor="#d4a24c" />
        </linearGradient>
        <filter id="sk-ink" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="7" />
          <feDisplacementMap in="SourceGraphic" scale="1.8" />
        </filter>
      </defs>
      <g className="sk-far">{SKYLINE.far.map((d, k) => draw(d, `f${k}`, k))}</g>
      <g className="sk-fill">
        {SKY_FILL.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
      <path className="sk-flag" d={SKY_FLAG} />
      <g className="sk-near" filter="url(#sk-ink)">
        <g className="sk-ghost" transform="translate(.7 .6)">
          {SKYLINE.near.map((d, k) => draw(d, `g${k}`, far + k))}
        </g>
        {SKYLINE.near.map((d, k) => draw(d, `n${k}`, far + k))}
      </g>
    </svg>
  );
}

/* Marigold strings draped across the top of the hero */
const GARLANDS = (() => {
  const strands = [
    [[-10, 4], [100, 62], [210, 4]],
    [[190, 4], [300, 62], [410, 4]],
    [[-10, 0], [200, 40], [410, 0]],
  ];
  return strands.map(([p0, c, p2], si) => {
    const beads = [];
    const n = si === 2 ? 26 : 16;
    for (let k = 1; k < n; k++) {
      const t = k / n;
      const x = (1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * c[0] + t * t * p2[0];
      const y = (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * c[1] + t * t * p2[1];
      beads.push({ x: f(x), y: f(y), big: k % 2 === 0 });
    }
    return { d: `M${p0[0]} ${p0[1]}Q${c[0]} ${c[1]} ${p2[0]} ${p2[1]}`, beads, back: si === 2 };
  });
})();

function Garland() {
  return (
    <svg className="garland" viewBox="0 0 400 90" preserveAspectRatio="xMidYMin slice" aria-hidden="true">
      <defs>
        <radialGradient id="marigold" cx="40%" cy="35%">
          <stop offset="0" stopColor="#ffe08a" />
          <stop offset="0.6" stopColor="#e9a23b" />
          <stop offset="1" stopColor="#b8641c" />
        </radialGradient>
      </defs>
      {GARLANDS.map((g, gi) => (
        <g key={gi} className={`garland-strand ${g.back ? "garland-back" : ""}`} style={{ "--gi": gi }}>
          <path d={g.d} className="garland-thread" />
          {g.beads.map((b, k) =>
            b.big ? (
              <circle key={k} cx={b.x} cy={b.y} r="3.4" fill="url(#marigold)" />
            ) : (
              <circle key={k} cx={b.x} cy={b.y} r="1.3" className="garland-bead" />
            )
          )}
        </g>
      ))}
      {[0, 200, 400].map((x) => (
        <g key={x} className="garland-drop">
          <path d={`M${x} 4V${x === 200 ? 26 : 22}`} className="garland-thread" />
          <circle cx={x} cy={x === 200 ? 30 : 26} r="4" fill="url(#marigold)" />
          <path d={`M${x - 2.5} ${x === 200 ? 35 : 31}h5l-2.5 6Z`} className="garland-bell" />
        </g>
      ))}
    </svg>
  );
}

/* Woven borders: Punjabi phulkari on wine sections, Himachali Kullu weave on ivory ones */
const KULLU = (() => {
  const steps = (cx, cy, r) => {
    let d = "";
    for (let y = -r; y < r; y += 2) {
      const w = r - Math.abs(y + 1);
      d += `M${cx - w} ${cy + y}h${w * 2}v2h${-w * 2}Z`;
    }
    return d;
  };
  return { outer: steps(16, 13, 8), inner: steps(16, 13, 4), left: steps(0, 13, 5), right: steps(32, 13, 5) };
})();

function TextileDefs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true" focusable="false">
      <defs>
        <pattern id="phk-gold" width="2.4" height="2.4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="1.35" height="2.4" fill="#f2b544" />
        </pattern>
        <pattern id="phk-saffron" width="2.2" height="2.2" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
          <rect width="1.2" height="2.2" fill="#e8762b" />
        </pattern>
        <pattern id="phulkari-tile" width="36" height="26" patternUnits="userSpaceOnUse">
          <rect width="36" height="26" fill="#3d0613" />
          <path d="M0 3H36M0 23H36" stroke="#e7b75a" strokeWidth="1.1" strokeDasharray="3 2" />
          <path d="M18 5L26 13L18 21L10 13Z" fill="url(#phk-gold)" />
          <path d="M18 9.5L21.5 13L18 16.5L14.5 13Z" fill="url(#phk-saffron)" />
          <circle cx="18" cy="13" r="1" fill="#fbe7b2" />
          <path d="M0 7L4.5 13L0 19ZM36 7L31.5 13L36 19Z" fill="url(#phk-saffron)" />
        </pattern>
        <pattern id="kullu-tile" width="32" height="26" patternUnits="userSpaceOnUse">
          <rect width="32" height="26" fill="#f1e7d3" />
          <rect y="1" width="32" height="2" fill="#7a1430" />
          <rect y="23" width="32" height="2" fill="#7a1430" />
          <rect y="4" width="32" height="1" fill="#2c3d63" />
          <rect y="21" width="32" height="1" fill="#2c3d63" />
          <path d={KULLU.outer} fill="#7a1430" />
          <path d={KULLU.inner} fill="#d9a441" />
          <path d={KULLU.left + KULLU.right} fill="#2f5d4a" />
        </pattern>
      </defs>
    </svg>
  );
}

function Band({ kind }) {
  return (
    <svg className={`band band-${kind}`} aria-hidden="true">
      <rect className="band-run" width="200%" height="100%" fill={`url(#${kind}-tile)`} />
    </svg>
  );
}

/* School-to-forever chapters, joined by a dotted Delhi route */
const STORY = [
  {
    icon: "book",
    title: "Where it all began",
    text: "It all began at a school in Delhi, where a girl and a boy crossed paths. Between classes, lunch breaks and endless conversations, a simple friendship slowly became something special.",
  },
  {
    icon: "pin",
    title: "Growing up, together",
    text: "From school corridors to spontaneous food runs across Delhi, from exam stress to life’s little adventures, we grew up side by side. Through every high and low, we found comfort, laughter and a constant in each other.",
  },
  {
    icon: "hearts",
    title: "Finding home",
    text: "For Harsh, Bharti became his favourite person to share life with. For Bharti, Harsh became her safe place, her partner-in-crime and the one who could always make her smile. Somewhere along the way, friendship turned into love, and love began to feel like home.",
  },
  {
    icon: "rings",
    title: "And now, forever",
    text: "What began in a Delhi school has brought us here, ready to begin our favourite chapter yet. Two people, two families, one beautiful journey ahead — and we can’t wait to celebrate this new beginning with all of you.",
  },
];

const STORY_ICONS = {
  book: [
    "M3 6.5C6 5 9 5 12 7C15 5 18 5 21 6.5V19C18 17.5 15 17.5 12 19C9 17.5 6 17.5 3 19Z",
    "M12 7V19",
    "M6.2 11c0-1.1 1.5-1.5 2.1-.4c.6-1.1 2.1-.7 2.1.4c0 1.2-2.1 2.3-2.1 2.3S6.2 12.2 6.2 11Z",
    "M14 10.5h4.5M14 13h4.5M14 15.5h3",
  ],
  pin: [
    "M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11Z",
    "M9.6 9.6c0-1.2 1.7-1.7 2.4-.5c.7-1.2 2.4-.7 2.4.5c0 1.3-2.4 2.6-2.4 2.6S9.6 10.9 9.6 9.6Z",
  ],
  hearts: [
    "M9 19s-6-3.8-6-8.2A3.4 3.4 0 0 1 9 8.6a3.4 3.4 0 0 1 6 2.2c0 4.4-6 8.2-6 8.2Z",
    "M14.6 6.6a2.7 2.7 0 0 1 5.9 1.4c0 3-3.6 5.4-3.6 5.4",
  ],
  rings: ["M3 15a5 5 0 1 0 10 0a5 5 0 1 0-10 0", "M10 13a5 5 0 1 0 10 0a5 5 0 1 0-10 0", "M13.5 4.6l1.6-2h2.8l1.6 2l-3 3.2Z"],
};
const CHAPTER = ["One", "Two", "Three", "Four"];

function StoryRoute() {
  return (
    <ol className="route">
      {STORY.map((c, i) => (
        <li key={c.title} className="route-stop rv rv-none">
          <span className="route-icon">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              {STORY_ICONS[c.icon].map((d) => (
                <path key={d} d={d} pathLength="1" />
              ))}
            </svg>
          </span>
          <div className="route-text">
            <span className="route-step">Chapter {CHAPTER[i]}</span>
            <h3 className="script route-title">{c.title}</h3>
            <p className="body-copy">{c.text}</p>
          </div>
        </li>
      ))}
    </ol>
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
/* Gold laurel wreath that grows in behind the seal */
const LAUREL = (() => {
  const R = 70;
  const pt = (deg) => [Math.cos((deg * Math.PI) / 180) * R, Math.sin((deg * Math.PI) / 180) * R];
  const [x1, y1] = pt(100);
  const [x2, y2] = pt(236);
  const leaves = [];
  for (let i = 0; i < 10; i++) {
    const deg = 106 + i * 13;
    const [x, y] = pt(deg);
    leaves.push({ x: f(x), y: f(y), r: f(deg + 90 - 34), i: i * 2 });
    leaves.push({ x: f(x), y: f(y), r: f(deg + 90 + 30), i: i * 2 + 1 });
  }
  return { stem: `M${f(x1)} ${f(y1)}A${R} ${R} 0 0 1 ${f(x2)} ${f(y2)}`, leaves };
})();

function Laurel() {
  return (
    <svg className="lt-laurel" viewBox="-100 -100 200 200" aria-hidden="true">
      <defs>
        <linearGradient id="laurel-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fbe7ae" />
          <stop offset="0.5" stopColor="#d4a24c" />
          <stop offset="1" stopColor="#8f651c" />
        </linearGradient>
      </defs>
      {[
        ["0 77", 1.15, 0],
        ["-41 -61", 0.75, 1],
        ["41 -61", 0.75, 2],
      ].map(([at, k, i]) => (
        <path
          key={at}
          className="laurel-heart"
          d={HEART}
          transform={`translate(${at}) scale(${k})`}
          style={{ "--i": i }}
        />
      ))}
      {[1, -1].map((sx) => (
        <g key={sx} transform={`scale(${sx} 1)`}>
          <path className="laurel-stem" d={LAUREL.stem} pathLength="1" />
          {LAUREL.leaves.map((l) => (
            <path
              key={l.i}
              className="laurel-leaf"
              d="M0 0C4-3.4 10-3.4 15 0C10 3.4 4 3.4 0 0Z"
              transform={`translate(${l.x} ${l.y}) rotate(${l.r})`}
              style={{ "--i": l.i }}
            />
          ))}
        </g>
      ))}
    </svg>
  );
}

/* Tiny gold and blush hearts drifting up over the envelope */
function LoveHearts() {
  return (
    <div className="love-hearts" aria-hidden="true">
      {SPARKS.slice(0, 16).map((p, i) => (
        <i
          key={i}
          style={{ left: `${p.x}%`, top: `${f(20 + Number(p.y) * 0.75)}%`, "--s": f(0.7 + Number(p.s) / 4), "--d": `${f(Number(p.d) * 1.6)}s`, "--delay": `${p.delay}s` }}
        />
      ))}
    </div>
  );
}

/* A little postage stamp and postmark, so the envelope reads as a love letter */
function Stamp() {
  return (
    <div className="env-stamp" aria-hidden="true">
      <div className="stamp-paper">
        <div className="stamp-inner">
          <svg viewBox="0 0 40 46">
            <path d="M8 40V18H32V40M13 40V29Q13 24 20 22Q27 24 27 29V40M6 18H34M9 18V13H31V18M12 13V10H28V13M16 10Q20 5 24 10M5 40H35" />
            <path d={HEART} transform="translate(20 33) scale(.42)" className="stamp-heart" />
          </svg>
          <span>Dilli · ₹ 24</span>
        </div>
      </div>
      <svg className="postmark" viewBox="0 0 70 40">
        <circle cx="20" cy="20" r="16" />
        <circle cx="20" cy="20" r="12.5" />
        <text x="20" y="18.5">DELHI</text>
        <text x="20" y="25.5">24·11·26</text>
        <path d="M40 12q5-3 10 0t10 0t10 0M40 20q5-3 10 0t10 0t10 0M40 28q5-3 10 0t10 0t10 0" />
      </svg>
    </div>
  );
}

// Heart-shaped gold wax seal with the couple's embossed monogram.
function Seal({ mono }) {
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
        <linearGradient id="seal-shine-g" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.75" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <clipPath id="seal-clip">
          <path d={SEAL_OUTER} />
        </clipPath>
      </defs>
      <path d={SEAL_OUTER} fill="url(#seal-wax)" />
      <path d={SEAL_INNER} fill="url(#seal-well)" />
      <path d={SEAL_INNER} fill="none" stroke="#fff3c6" strokeWidth="2" opacity="0.9" transform="translate(-0.8 -0.8)" />
      <path d={SEAL_INNER} fill="none" stroke="#6b4512" strokeWidth="1.6" opacity="0.6" transform="translate(0.8 0.9)" />
      <path d={SEAL_RING} fill="none" stroke="#8a6020" strokeWidth=".8" opacity="0.45" strokeDasharray="1.5 3" />
      <g className="seal-mono">
        <text x="-1" y="7" transform="translate(1 1.2)" fill="#fff2c0">{mono}</text>
        <text x="-1" y="7" fill="#7a5214">{mono}</text>
      </g>
      <g clipPath="url(#seal-clip)">
        <rect className="seal-shine" x="-90" y="-60" width="36" height="120" fill="url(#seal-shine-g)" />
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
        {v.photo ? (
          <figure className="venue-photo">
            <img src={v.photo.src} alt={v.name} loading="lazy" />
            <figcaption>
              Photo:{" "}
              {v.photo.link ? (
                <a href={v.photo.link} target="_blank" rel="noreferrer">
                  {v.photo.credit}
                </a>
              ) : (
                v.photo.credit
              )}
              {v.photo.license && ` · ${v.photo.license}`}
            </figcaption>
          </figure>
        ) : (
          <img className="venue-sketch" src={v.sketch} alt={`Sketch of ${v.name}`} loading="lazy" />
        )}
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
export default function RoyalInvite({ side = "both" }) {
  const cfg = SIDES[side] ?? SIDES.both;
  const [first, second] = cfg.couple;
  const names = `${first.name} & ${second.name}`;
  const mono = first.name[0] + second.name[0];

  // envelope: 'intro' -> 'ready' -> 'opening' -> 'done'
  const [stage, setStage] = useState("intro");
  const stageRef = useRef("intro");
  const [revealed, setRevealed] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const countdown = useCountdown(WEDDING_TARGET_ISO);

  const [rsvp, setRsvp] = useState({ name: "", contact: "", events: ["Wedding · 24 Nov"], message: "" });
  const [submitted, setSubmitted] = useState(false);

  useReveal(revealed);

  const flippedAt = useRef(0);
  const turnOver = useCallback(() => {
    if (stageRef.current !== "intro") return;
    stageRef.current = "ready";
    flippedAt.current = Date.now();
    setStage("ready");
  }, []);

  useEffect(() => {
    const id = setTimeout(turnOver, 1700);
    return () => clearTimeout(id);
  }, [turnOver]);

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
    if (["turning", "opening", "done"].includes(stageRef.current)) return;
    // A tap on the address side first turns the envelope over to the seal
    if (stageRef.current === "intro") turnOver();
    const wait = Math.max(0, flippedAt.current + 1100 - Date.now());
    if (wait > 0) {
      stageRef.current = "turning";
      setTimeout(() => {
        stageRef.current = "ready";
        openEnvelope();
      }, wait);
      return;
    }
    stageRef.current = "opening";
    setStage("opening");
    window.scrollTo(0, 0);

    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = 0;
      audio.volume = 0.8;
      audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }

    setTimeout(() => setRevealed(true), 3700);
    setTimeout(() => {
      stageRef.current = "done";
      setStage("done");
    }, 4700);
  }, [turnOver]);

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
  };

  const pad = (n) => String(n).padStart(2, "0");

  return (
    <div ref={rootRef} className={`inv ${revealed ? "revealed" : ""}`} style={ROOT_STYLE}>
      <div className="progress" aria-hidden="true" />
      <FloralDefs />
      <TextileDefs />
      <audio ref={audioRef} src={cfg.song} loop preload="auto" />

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
          <div className="env-frame" aria-hidden="true" />
          <LoveHearts />
          <div className="lt-stage">
            <div className="lt-envelope">
              {/* address side */}
              <div className="lt-face lt-front">
                <div className="lt-from">
                  {names}
                  <br />
                  New Delhi
                </div>
                <Stamp />
                <div className="lt-to">
                  <span className="lt-to-label">To,</span>
                  <span className="script lt-to-name">Someone very special</span>
                  <span className="lt-to-line" />
                </div>
                <span className="lt-handle">
                  Handle with love
                  <svg viewBox="-8 -8 16 14" aria-hidden="true">
                    <path d={HEART} />
                  </svg>
                </span>
              </div>

              {/* sealed side */}
              <div className="lt-face lt-back">
                <div className="lt-liner" />
                <div className="lt-card">
                  <div className="lt-card-inside">
                    {cfg.hindi && <span className="lt-kicker">॥ श्री गणेशाय नमः ॥</span>}
                    <span className="lt-sub">Together with their families</span>
                    <span className="script lt-names">{names}</span>
                    <span className="lt-invite">
                      request the pleasure of your company
                      <br />
                      as they begin their forever
                    </span>
                    <span className="lt-date">24 · 11 · 2026 · New Delhi</span>
                  </div>
                  <div className="lt-cover">
                    <div className="lt-cover-face lt-cover-front">
                      <span className="lt-cover-kicker">Wedding Invitation</span>
                      <span className="script lt-cover-mono">
                        {first.name[0]}
                        <svg viewBox="-8 -8 16 14" aria-hidden="true">
                          <path d={HEART} />
                        </svg>
                        {second.name[0]}
                      </span>
                      <span className="lt-cover-date">24 · 11 · 2026</span>
                    </div>
                    <div className="lt-cover-face lt-cover-back">
                      <span className="script">{cfg.punjabi ? "Sadde viyah te zaroor aana ji" : "Do join us in the celebration"}</span>
                    </div>
                  </div>
                </div>
                <div className="lt-pocket">
                  <svg className="lt-folds" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                    <path d="M0 0L50 55L100 0M0 100L50 58L100 100" vectorEffect="non-scaling-stroke" />
                  </svg>
                </div>
                <div className="lt-flap-wrap">
                  <div className="lt-flap">
                    <div className="lt-flap-face lt-flap-out">
                      <svg className="lt-folds" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                        <path d="M0 0L50 100L100 0" vectorEffect="non-scaling-stroke" />
                      </svg>
                    </div>
                    <div className="lt-flap-face lt-flap-in" />
                  </div>
                </div>
                <Laurel />
                <div className="lt-seal">
                  <Seal mono={mono} />
                </div>
                <span className="lt-burst" aria-hidden="true">
                  {Array.from({ length: 14 }, (_, i) => (
                    <i key={i} style={{ "--a": `${i * 25.7}deg`, "--r": `${64 + (i % 4) * 16}px` }} />
                  ))}
                </span>
              </div>
            </div>
          </div>
          <div className="env-hint">
            <span className="script">A wedding invitation</span>
            <span className="env-hint-cta">Tap the heart to open</span>
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

      <main className="inv-col">
        {/* =========================================================
            HERO
            ========================================================= */}
        <section className="hero">
          {/* Photo: "A full moon rises over a mountain range" by @photographsbyashish on Unsplash (Unsplash License) */}
          <div className="hero-photo" aria-hidden="true">
            <img src="/images/hero_moonrise.jpg" alt="" />
          </div>
          <Sparkles className="hero-stars" count={20} />
          <Garland />
          <div className="hero-copy-wrap">
            <div className="hero-copy">
              {cfg.onkar && (
                <p className="hero-onkar" lang="pa" aria-label="Ik Onkar">
                  ੴ
                </p>
              )}
              {cfg.hindi && <p className="hero-kicker">॥ श्री गणेशाय नमः ॥</p>}
              <p className="hero-pre">The wedding of</p>
              <h1 className="hero-names">
                <span className="hn-1">{first.name}</span>
                <span className="hn-amp">&amp;</span>
                <span className="hn-2">{second.name}</span>
              </h1>
              <p className="hero-date">
                <i />
                24 · 11 · 2026
                <i />
              </p>
              <p className="hero-tagline">From a Delhi school to forever</p>
            </div>
          </div>
          <button
            type="button"
            className="hero-cue"
            onClick={(e) => e.currentTarget.closest(".hero").nextElementSibling?.scrollIntoView({ behavior: "smooth" })}
            aria-label="Scroll down to the invitation"
          >
            <span className="cue-label">Scroll to begin</span>
            <span className="cue-orb" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M7 6l5 5 5-5" />
                <path d="M7 12l5 5 5-5" />
              </svg>
            </span>
          </button>
          <div className="hero-art">
            <Skyline />
            <p className="hero-route">
              Himachal <i /> Delhi <i /> Punjab
            </p>
          </div>
        </section>

        {/* =========================================================
            INVITATION LETTER
            ========================================================= */}
        <section className="sec wine">
          <Band kind="phulkari" />
          <Sparkles count={14} />
          <div className="blessings rv rv-blur">
            {cfg.punjabi && (
            <p className="gurbani" lang="pa">
              ਗੁਰੁ ਪੂਰਾ ਆਰਾਧੇ ॥ ਕਾਰਜ ਸਗਲੇ ਸਾਧੇ ॥
              <br />
              ਸਗਲ ਮਨੋਰਥ ਪੂਰੇ ॥ ਬਾਜੇ ਅਨਹਦ ਤੂਰੇ ॥੧॥
            </p>
            )}
            {cfg.punjabi && cfg.hindi && <span className="blessings-sep" aria-hidden="true" />}
            {cfg.hindi && (
            <p className="shloka" lang="sa">
              वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ।
              <br />
              निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥
            </p>
            )}
          </div>
          <Title>Dear Friends &amp; Family,</Title>
          <p className="body-copy rv rv-blur">
            With the divine grace of the Almighty and the heartfelt blessings of our elders, we request the
            honour of your gracious presence as we begin our forever.
          </p>
          <div className="couple">
            {cfg.couple.map((person, i) => (
              <div key={person.side} className="couple-part">
                {i > 0 && <div className="script couple-with rv rv-z">with</div>}
                <div className={`person rv ${i === 0 ? "rv-l" : "rv-r"}`}>
                  <div className="person-name">{person.full}</div>
                  <div className="person-parents">{person.parents}</div>
                </div>
              </div>
            ))}
          </div>
          <p className="body-copy rv rv-blur">
            Your love and support mean the world to us, and we would be honoured to have you by our side as we
            say &ldquo;forever.&rdquo;
          </p>
          {cfg.punjabi && <p className="script punjabi-line rv">Sadde viyah te zaroor aana ji</p>}
        </section>

        {/* =========================================================
            COUNTDOWN
            ========================================================= */}
        <section className="sec paper">
          <Band kind="kullu" />
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
          <a className="pill pill-wine rv" href={calendarUrl(names)} target="_blank" rel="noreferrer">
            <CalendarPlus size={14} /> Save the Date
          </a>
        </section>

        {/* =========================================================
            SCHEDULE
            ========================================================= */}
        <section className="sec wine">
          <Band kind="phulkari" />
          <Title>Schedule of Events</Title>
          <Schedule />
        </section>

        {/* =========================================================
            LOCATION
            ========================================================= */}
        <section className="sec paper">
          <Band kind="kullu" />
          <Title>Location</Title>
          <Venues />
        </section>

        {/* =========================================================
            FAMILY
            ========================================================= */}
        <section className="sec wine">
          <Band kind="phulkari" />
          <Title>With Love &amp; Blessings</Title>
          <div className="family">
            {cfg.family.map(([role, people], i) => (
              <div key={role} className="family-group rv">
                {i > 0 && <Flourish />}
                <div className="family-role">{role}</div>
                <div className="family-names">
                  {people.split("\n").map((line) => (
                    <span key={line}>{line}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* =========================================================
            OUR STORY
            ========================================================= */}
        <section className="sec paper sec-story">
          <Band kind="kullu" />
          <Title>Our Story</Title>
          <div className="frames rv rv-none">
            <figure className="frame frame-a">
              <img src="/images/couple_bw.jpg" alt={names} loading="lazy" />
            </figure>
            <figure className="frame frame-b">
              <img src="/images/couple_stairs.jpg" alt={names} loading="lazy" />
            </figure>
          </div>
          <p className="story-intro rv rv-blur">
            Ek Punjabi Munda, Ek Pahadi Kudi
            <span>and one Delhi school</span>
          </p>
          <StoryRoute />
        </section>

        {/* =========================================================
            RSVP
            ========================================================= */}
        <section className="sec wine sec-rsvp">
          <Band kind="phulkari" />
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
                  placeholder={`Write your blessings for ${names}…`}
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
            {cfg.punjabi ? (
              <>
                <p className="script finale-hope">Tuhaadi udeek rahegi</p>
                <p className="finale-en">We&rsquo;ll be waiting for you</p>
              </>
            ) : (
              <p className="script finale-hope">Hope to see you there!</p>
            )}
            <p className="finale-names">{names}</p>
          </div>

          <div className="contacts rv">
            <div className="contacts-title">For any assistance</div>
            <p className="contacts-hint">Tap to call</p>
            {cfg.contacts.map((c) => (
              <a key={c.tel} href={`tel:${c.tel}`} className="contact">
                <Phone size={13} />
                <span>{c.name}</span>
                <b>{c.shown}</b>
              </a>
            ))}
          </div>
        </section>

        <footer className="outro rv rv-none">
          <img src="/images/couple_twirl.jpg" alt={names} loading="lazy" />
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
