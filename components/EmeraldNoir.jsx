"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  MapPin, Volume2, VolumeX, Clock, Shirt, PartyPopper,
  Car, Building2, Gift, Mail, Send, Check, Heart,
} from "lucide-react";
import "./emerald-noir.css";

/* ---------------------------- helpers ----------------------------- */

const fmtDate = (iso) => {
  const d = new Date(iso);
  return isNaN(d)
    ? "—"
    : d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
};
const fmtTime = (iso) => {
  const d = new Date(iso);
  return isNaN(d) ? "" : d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
};

function useCountdown(iso) {
  const [t, setT] = useState({ d: 0, h: 0, m: 0, s: 0, past: false });
  useEffect(() => {
    const tick = () => {
      const diff = new Date(iso) - new Date();
      if (isNaN(diff) || diff <= 0) return setT({ d: 0, h: 0, m: 0, s: 0, past: true });
      setT({
        d: Math.floor(diff / 864e5),
        h: Math.floor(diff / 36e5) % 24,
        m: Math.floor(diff / 6e4) % 60,
        s: Math.floor(diff / 1e3) % 60,
        past: false,
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [iso]);
  return t;
}

function useReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && e.target.classList.add("in")),
      { threshold: 0.15 }
    );
    document.querySelectorAll(".en-root .rv").forEach((el) => io.observe(el));
    return () => io.disconnect();
  });
}

/* ------------------------ decorative pieces ----------------------- */

const Flourish = () => (
  <svg className="flourish" viewBox="0 0 640 40" fill="none" aria-hidden="true">
    <path d="M10 22 C 120 2, 200 38, 320 20 S 520 4, 630 24" stroke="var(--en-gold-dim)" strokeWidth="1" />
    <circle cx="90" cy="14" r="1.6" fill="var(--en-gold)" />
    <circle cx="240" cy="30" r="1.6" fill="var(--en-gold)" />
    <circle cx="320" cy="8" r="1.6" fill="var(--en-gold)" />
    <circle cx="430" cy="28" r="1.6" fill="var(--en-gold)" />
    <circle cx="560" cy="12" r="1.6" fill="var(--en-gold)" />
  </svg>
);

const HeartRule = () => (
  <div className="hrule" aria-hidden="true">
    <i /><Heart size={10} fill="var(--en-gold)" stroke="none" /><i />
  </div>
);

const DiamondRule = () => (
  <div className="drule" aria-hidden="true"><i /><span className="dm" /><i /></div>
);

const PalaceArt = () => (
  <svg className="palace" viewBox="0 0 360 110" fill="none" stroke="var(--en-gold-dim)" strokeWidth="1" aria-hidden="true">
    <path d="M20 100 h320 M30 100 v-45 h40 v45 M290 100 v-45 h40 v45" />
    <path d="M35 55 a15 15 0 0 1 30 0 M295 55 a15 15 0 0 1 30 0" />
    <path d="M120 100 v-55 h120 v55 M150 100 v-25 a15 15 0 0 1 30 0 v25 M195 100 v-25 a12 12 0 0 1 24 0 v25" />
    <path d="M140 45 a40 40 0 0 1 80 0" />
    <path d="M168 22 a12 14 0 0 1 24 0" />
    <path d="M180 8 l0 14" />
    <path d="M130 65 a8 8 0 0 1 16 0 M214 65 a8 8 0 0 1 16 0" />
    <path d="M40 70 a8 8 0 0 1 16 0 M304 70 a8 8 0 0 1 16 0" />
  </svg>
);

function SecHead({ icon: Icon, title }) {
  return (
    <div className="sec-head rv">
      {Icon && <span className="sec-ic"><Icon size={26} strokeWidth={1.2} /></span>}
      <h2 className="script">{title}</h2>
      <HeartRule />
    </div>
  );
}

/* ------------------------- scratch card --------------------------- */

function ScratchCard({ dateISO }) {
  const cvRef = useRef(null);
  const [done, setDone] = useState(false);
  const moves = useRef(0);

  useEffect(() => {
    const cv = cvRef.current;
    if (!cv) return;
    const dpr = window.devicePixelRatio || 1;
    const w = cv.offsetWidth, h = cv.offsetHeight;
    cv.width = w * dpr; cv.height = h * dpr;
    const ctx = cv.getContext("2d");
    ctx.scale(dpr, dpr);
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, "#a8811f"); g.addColorStop(0.45, "#e9c96a");
    g.addColorStop(0.55, "#d4af37"); g.addColorStop(1, "#8f6f1d");
    ctx.fillStyle = g;
    if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(0, 0, w, h, 14); ctx.fill(); }
    else ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "rgba(40,32,8,.75)";
    ctx.font = "600 14px 'EB Garamond', serif";
    ctx.textAlign = "center";
    ctx.fillText("✦  Scratch to Reveal  ✦", w / 2, h / 2 + 5);
  }, []);

  const scratch = useCallback((e) => {
    const cv = cvRef.current;
    if (!cv || done) return;
    const r = cv.getBoundingClientRect();
    const p = e.touches ? e.touches[0] : e;
    const ctx = cv.getContext("2d");
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(p.clientX - r.left, p.clientY - r.top, 26, 0, Math.PI * 2);
    ctx.fill();
    if (++moves.current % 12 === 0) {
      const img = ctx.getImageData(0, 0, cv.width, cv.height).data;
      let clear = 0;
      for (let i = 3; i < img.length; i += 64) if (img[i] === 0) clear++;
      if (clear / (img.length / 64) > 0.45) setDone(true);
    }
  }, [done]);

  return (
    <div className="scratch-wrap rv">
      <div className="scratch-under">
        <span className="sc-eyebrow">Save the date</span>
        <span className="sc-date">{fmtDate(dateISO)}</span>
        <span className="sc-time">{fmtTime(dateISO)} onwards</span>
      </div>
      <canvas
        ref={cvRef}
        className={`scratch-foil ${done ? "gone" : ""}`}
        onMouseDown={scratch} onMouseMove={(e) => e.buttons === 1 && scratch(e)}
        onTouchStart={scratch} onTouchMove={scratch}
      />
    </div>
  );
}

/* ---------------------------- slideshow --------------------------- */

function Slideshow({ photos }) {
  const [i, setI] = useState(0);
  const [err, setErr] = useState({});
  useEffect(() => {
    if (photos.length < 2) return;
    const id = setInterval(() => setI((p) => (p + 1) % photos.length), 4000);
    return () => clearInterval(id);
  }, [photos.length]);
  if (!photos.length) return null;
  return (
    <div className="slide rv">
      {photos.map((src, j) => (
        <div key={j} className={`slide-img ${j === i ? "on" : ""}`}>
          {!err[j] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src} alt={`Photo ${j + 1}`} onError={() => setErr((e) => ({ ...e, [j]: true }))} />
          ) : (
            <div className="slide-fallback"><Heart size={30} strokeWidth={1} /></div>
          )}
        </div>
      ))}
      {photos.length > 1 && (
        <div className="slide-dots">
          {photos.map((_, j) => (
            <button key={j} className={j === i ? "on" : ""} onClick={() => setI(j)} aria-label={`Photo ${j + 1}`} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------ main ------------------------------ */

export default function EmeraldNoir({ data, slug, preview = false }) {
  const [rsvp, setRsvp] = useState({ name: "", email: "", attending: "", msg: "" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [musicOn, setMusicOn] = useState(false);
  const audioRef = useRef(null);
  const cd = useCountdown(data.dateISO);
  useReveal();

  const toggleMusic = () => {
    const a = audioRef.current;
    if (!a) return;
    if (musicOn) { a.pause(); setMusicOn(false); }
    else { a.play().catch(() => {}); setMusicOn(true); }
  };

  const submit = async () => {
    if (!rsvp.name.trim() || sending) return;
    if (preview) { setSent(true); setTimeout(() => setSent(false), 2000); return; }
    setSending(true);
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug, name: rsvp.name, email: rsvp.email,
          attending: rsvp.attending, message: rsvp.msg,
        }),
      });
      if (res.ok) {
        setSent(true);
        setRsvp({ name: "", email: "", attending: "", msg: "" });
        setTimeout(() => setSent(false), 3000);
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="en-root">
      <svg className="corner tl" viewBox="0 0 120 120" aria-hidden="true"><path d="M118 6 C 60 10, 14 44, 8 116" stroke="var(--en-gold-dim)" fill="none" /><path d="M100 14 C 60 20, 26 50, 18 100" stroke="var(--en-gold-faint)" fill="none" /></svg>
      <svg className="corner br" viewBox="0 0 120 120" aria-hidden="true"><path d="M2 114 C 60 110, 106 76, 112 4" stroke="var(--en-gold-dim)" fill="none" /><path d="M20 106 C 60 100, 94 70, 102 20" stroke="var(--en-gold-faint)" fill="none" /></svg>

      {data.musicUrl && (
        <>
          <audio ref={audioRef} src={data.musicUrl} loop preload="none" />
          <button className="sound" onClick={toggleMusic} aria-label="Toggle music">
            {musicOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
        </>
      )}

      <main className="page">
        {/* HERO */}
        <header className="hero">
          <DiamondRule />
          <p className="eyebrow rv">We are honoured to welcome you to the wedding ceremony of..</p>

          <h1 className="name rv">{data.groom}</h1>
          {data.groomParents && <p className="line rv">{data.groomParents}</p>}
          {data.groomLine1 && <p className="line rv">{data.groomLine1}</p>}
          {data.groomLine2 && <p className="line rv">{data.groomLine2}</p>}

          <DiamondRule />

          <h1 className="name rv">{data.bride}</h1>
          {data.brideParents && <p className="line rv">{data.brideParents}</p>}
          {data.brideLine1 && <p className="line rv">{data.brideLine1}</p>}
          {data.brideLine2 && <p className="line rv">{data.brideLine2}</p>}

          <div className="dotline" aria-hidden="true"><i /><b /><i /></div>
          <p className="request rv">Request the honour of your presence</p>

          <DiamondRule />
          <p className="scroll-lab">Scroll</p>
          <span className="scroll-arrow" aria-hidden="true">⌄</span>
        </header>

        {/* WELCOME */}
        {data.welcomeMsg && (
          <section className="sec">
            <Flourish />
            <p className="welcome rv">
              {data.welcomeMsg}{" "}
              <Heart className="wl-heart" size={16} fill="var(--en-ivory)" stroke="none" />
            </p>
            <Flourish />
          </section>
        )}

        {/* SCRATCH */}
        {data.show.scratch && (
          <section className="sec">
            <SecHead title="Scratch to Reveal" />
            <ScratchCard dateISO={data.dateISO} />
          </section>
        )}

        {/* PHOTOS */}
        {data.show.slideshow && data.photos.length > 0 && (
          <section className="sec">
            <HeartRule />
            <Slideshow photos={data.photos} />
          </section>
        )}

        {/* COUNTDOWN */}
        {data.show.countdown && (
          <section className="sec">
            <SecHead title="Counting Down to Forever" />
            {cd.past ? (
              <p className="cd-past rv">The celebrations have begun 🎉</p>
            ) : (
              <div className="cd rv">
                {[["Days", cd.d], ["Hours", cd.h], ["Minutes", cd.m], ["Seconds", cd.s]].map(([l, v]) => (
                  <div className="cd-cell" key={l}>
                    <span className="cd-num">{v}</span>
                    <span className="cd-lab">{l}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* TIMELINE */}
        {data.show.timeline && data.timeline.some((t) => t.title) && (
          <section className="sec">
            <SecHead icon={Clock} title="Program Timeline" />
            <div className="tl rv">
              {data.timeline.filter((t) => t.title).map((ev, i) => (
                <div className="tl-item" key={i}>
                  <span className="tl-dot" />
                  <div>
                    <span className="tl-title">{ev.title}</span>
                    {ev.when && <span className="tl-when">{ev.when}</span>}
                    {ev.desc && <span className="tl-desc">{ev.desc}</span>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* VENUE */}
        {data.venueName && (
          <section className="sec">
            <SecHead icon={MapPin} title="Venue" />
            <p className="venue-name rv">{data.venueName}</p>
            {data.venueAddress && <p className="venue-addr rv">{data.venueAddress}</p>}
            <PalaceArt />
            {data.mapsUrl && (
              <a className="btn-gold rv" href={data.mapsUrl} target="_blank" rel="noreferrer">
                View on Google Maps
              </a>
            )}
          </section>
        )}

        {/* DRESS CODE */}
        {data.show.dress && (
          <section className="sec">
            <SecHead icon={Shirt} title="Dress Code" />
            <div className="dress rv">
              <div><span className="dress-h">Women</span><p>{data.dressWomen}</p></div>
              <div><span className="dress-h">Men</span><p>{data.dressMen}</p></div>
            </div>
          </section>
        )}

        {/* PRE-WEDDING */}
        {data.show.preEvents && data.preEvents.some((e) => e.title && e.when) && (
          <section className="sec">
            <SecHead icon={PartyPopper} title="Pre-Wedding Events" />
            <div className="pre rv">
              {data.preEvents.filter((e) => e.title && e.when).map((ev, i) => (
                <div className="pre-item" key={i}>
                  <span className="pre-title">{ev.title}</span>
                  <span className="pre-when">{ev.when}</span>
                  {ev.where && <span className="pre-where">{ev.where}</span>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* TRANSPORT */}
        {data.show.transport && data.transport && (
          <section className="sec">
            <SecHead icon={Car} title="Transportation" />
            <p className="info rv">{data.transport}</p>
          </section>
        )}

        {/* STAY */}
        {data.show.stay && data.accommodation && (
          <section className="sec">
            <SecHead icon={Building2} title="Accommodation" />
            <p className="info rv">{data.accommodation}</p>
          </section>
        )}

        {/* GIFTS */}
        {data.show.gifts && data.giftsNote && (
          <section className="sec">
            <SecHead icon={Gift} title="Gifts" />
            <p className="info rv">{data.giftsNote}</p>
          </section>
        )}

        {/* RSVP */}
        {data.show.rsvp && (
          <section className="sec">
            <SecHead icon={Mail} title="Send a Message" />
            <div className="form rv">
              <label>Your Name
                <input placeholder="Your full name" value={rsvp.name}
                  onChange={(e) => setRsvp({ ...rsvp, name: e.target.value })} />
              </label>
              <label>Email
                <input placeholder="you@example.com" value={rsvp.email}
                  onChange={(e) => setRsvp({ ...rsvp, email: e.target.value })} />
              </label>
              <label>Will you be attending?
                <select value={rsvp.attending} onChange={(e) => setRsvp({ ...rsvp, attending: e.target.value })}>
                  <option value="">Select…</option>
                  <option value="yes">Joyfully attending</option>
                  <option value="no">Regretfully can&apos;t</option>
                </select>
              </label>
              <label>Your Message
                <textarea rows={3} placeholder="Write your wishes…" value={rsvp.msg}
                  onChange={(e) => setRsvp({ ...rsvp, msg: e.target.value })} />
              </label>
              <button className="btn-gold wide" onClick={submit} disabled={sending}>
                {sent ? <>Message sent <Check size={15} /></> : <>Send Message <Send size={14} /></>}
              </button>
            </div>
          </section>
        )}

        {/* CLOSING */}
        <section className="sec closing">
          <Flourish />
          <p className="script close-line rv">{data.closing}</p>
          <p className="script close-names rv">{data.groom} &amp; {data.bride}</p>
          <Flourish />
        </section>

        <footer className="foot">
          <span className="script foot-names">{data.groom} &amp; {data.bride}</span>
          <span className="foot-brand">
            Created with <a href="/"><b>WebAlchemy Invites</b></a> · Create your own wedding invitation
          </span>
        </footer>
      </main>
    </div>
  );
}
