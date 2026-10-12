"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  MapPin, Volume2, VolumeX, Heart, Calendar, Check,
  Clock, Sparkles
} from "lucide-react";
import "./royal-invite.css";

// Target Wedding Ceremony Date: 24 November 2026 06:00 PM (IST)
const WEDDING_TARGET_ISO = "2026-11-24T18:00:00";

function useCountdown(targetIso) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, past: false });

  useEffect(() => {
    const calculate = () => {
      const diff = new Date(targetIso).getTime() - new Date().getTime();
      if (isNaN(diff) || diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, past: true });
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
        past: false,
      });
    };
    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [targetIso]);

  return timeLeft;
}

/* =========================================================
   Interactive Scratch Card with Gold Heart Foil
   ========================================================= */
function ScratchHeartCard({ onReveal }) {
  const canvasRef = useRef(null);
  const [revealed, setRevealed] = useState(false);
  const isScratching = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.offsetWidth || 280;
    const h = canvas.offsetHeight || 260;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    // Draw rich metallic gold gradient fill
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, "#b88a2a");
    grad.addColorStop(0.25, "#f3d97c");
    grad.addColorStop(0.5, "#fff6be");
    grad.addColorStop(0.75, "#d4af37");
    grad.addColorStop(1, "#8e6718");

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Subtle sparkles/text on foil
    ctx.fillStyle = "rgba(74, 8, 18, 0.75)";
    ctx.font = "600 13px 'Cinzel', serif";
    ctx.textAlign = "center";
    ctx.fillText("✦ SCRATCH TO REVEAL ✦", w / 2, h / 2 + 10);
  }, []);

  const scratch = useCallback(
    (e) => {
      if (revealed) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      const x = clientX - rect.left;
      const y = clientY - rect.top;

      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(x, y, 32, 0, Math.PI * 2);
      ctx.fill();

      // Check percentage cleared periodically
      if (Math.random() < 0.3) {
        try {
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          let transparentPixels = 0;
          const totalSamples = imgData.data.length / 32;
          for (let i = 3; i < imgData.data.length; i += 32) {
            if (imgData.data[i] === 0) transparentPixels++;
          }
          if (transparentPixels / totalSamples > 0.35) {
            setRevealed(true);
            if (onReveal) onReveal();
          }
        } catch {
          // Fallback
        }
      }
    },
    [revealed, onReveal]
  );

  return (
    <div className="ry-scratch-container ry-heart-shape-mask">
      {/* SVG Clip Path Definition */}
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <clipPath id="ryHeartClip" clipPathUnits="objectBoundingBox">
            <path d="M 0.5, 0.94 C 0.22, 0.72, 0.04, 0.52, 0.04, 0.31 C 0.04, 0.12, 0.17, 0.03, 0.32, 0.03 C 0.42, 0.03, 0.48, 0.1, 0.5, 0.18 C 0.52, 0.1, 0.58, 0.03, 0.68, 0.03 C 0.83, 0.03, 0.96, 0.12, 0.96, 0.31 C 0.96, 0.52, 0.78, 0.72, 0.5, 0.94 Z" />
          </clipPath>
        </defs>
      </svg>

      {/* Underneath: The revealed date inside heart */}
      <div className="ry-heart-revealed">
        <span className="ry-sec-eyebrow" style={{ fontSize: "11px", marginBottom: "2px" }}>SAVE THE DATE</span>
        <span className="ry-date-day">24</span>
        <span className="ry-date-month">NOVEMBER</span>
        <span className="ry-date-year">2026</span>
        <span style={{ fontSize: "13px", color: "var(--ry-gold-dark)", marginTop: "3px", fontStyle: "italic", fontWeight: 600 }}>
          Tuesday • Vivah Sanskar
        </span>
      </div>

      {/* Gold Scratch Foil Overlay */}
      <canvas
        ref={canvasRef}
        className={`ry-scratch-canvas ${revealed ? "fade-revealed" : ""}`}
        onMouseDown={(e) => {
          isScratching.current = true;
          scratch(e);
        }}
        onMouseMove={(e) => {
          if (isScratching.current) scratch(e);
        }}
        onMouseUp={() => (isScratching.current = false)}
        onMouseLeave={() => (isScratching.current = false)}
        onTouchStart={scratch}
        onTouchMove={scratch}
      />
    </div>
  );
}

/* =========================================================
   Confetti Explosion Component
   ========================================================= */
function ConfettiOverlay({ active }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ["#d4af37", "#f5df93", "#e9c96a", "#cfa851", "#ffffff", "#e05263"];
    const particles = Array.from({ length: 70 }, () => ({
      x: canvas.width / 2 + (Math.random() - 0.5) * 120,
      y: canvas.height * 0.45 + (Math.random() - 0.5) * 100,
      vx: (Math.random() - 0.5) * 10,
      vy: (Math.random() - 1.2) * 12,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      vRot: (Math.random() - 0.5) * 10,
      alpha: 1,
    }));

    let animationId;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.28; // gravity
        p.rotation += p.vRot;
        p.alpha -= 0.008;

        if (p.alpha > 0) {
          alive = true;
          ctx.save();
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.4);
          ctx.restore();
        }
      });

      if (alive) {
        animationId = requestAnimationFrame(render);
      }
    };

    animationId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationId);
  }, [active]);

  if (!active) return null;
  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 9999,
      }}
    />
  );
}

/* =========================================================
   Main Royal Wedding Invitation Component
   ========================================================= */
export default function RoyalInvite() {
  // Gate state: 'closed' -> 'opening' -> 'open'
  const [gateState, setGateState] = useState("closed");
  const [isPlaying, setIsPlaying] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    // Clear any previous stale session key to ensure clean hydration
    try {
      sessionStorage.removeItem("royal_gate_opened");
    } catch {}
  }, []);

  // RSVP Form state
  const [rsvpData, setRsvpData] = useState({
    name: "",
    contact: "",
    events: ["Wedding Ceremony (24 Nov)"],
    message: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const countdown = useCountdown(WEDDING_TARGET_ISO);

  // Audio Play / Pause
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

  // Tap to Begin gate opening action
  const handleOpenGate = () => {
    if (gateState !== "closed") return;
    setGateState("opening");

    // Start playing gentle background instrumental automatically
    const audio = audioRef.current;
    if (audio) {
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    }

    // Sequence gate opening and smooth disappearance after full 1.8s animation
    setTimeout(() => {
      setGateState("open");
    }, 1800);
  };

  const handleHeartRevealed = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3500);
  };

  const handleToggleEvent = (eventName) => {
    setRsvpData((prev) => {
      if (prev.events.includes(eventName)) {
        return { ...prev, events: prev.events.filter((e) => e !== eventName) };
      } else {
        return { ...prev, events: [...prev.events, eventName] };
      }
    });
  };

  const handleRsvpSubmit = (e) => {
    e.preventDefault();
    if (!rsvpData.name.trim()) return;
    setIsSubmitted(true);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  return (
    <div className="ry-wrapper">
      {/* Background Audio Player: Ed Sheeran - Thinking Out Loud */}
      <audio
        ref={audioRef}
        src="/audio/wedding-bgm.mp3"
        loop
        preload="auto"
      />

      {/* Confetti Explosion */}
      <ConfettiOverlay active={showConfetti} />

      {/* Floating Vinyl Music Disc Button */}
      <button
        className={`ry-vinyl-player ${isPlaying ? "playing" : ""}`}
        onClick={toggleAudio}
        aria-label="Toggle Background Music"
        title={isPlaying ? "Pause Music" : "Play Music"}
      >
        <div className="ry-vinyl-disc">
          <div className="ry-vinyl-center-gold" />
        </div>
      </button>

      {/* =========================================================
          1. INTERACTIVE ROYAL GATE OVERLAY
          ========================================================= */}
      {gateState !== "open" && (
        <div
          className={`ry-gate-overlay ${gateState === "opening" ? "open" : ""}`}
        >
          <div className="ry-gate-scene" onClick={handleOpenGate}>
            {/* Palace Moonlight Preview revealed as doors swing open (NO closed door behind) */}
            <img
              src="/images/palace_night_hb.jpg"
              alt="Royal Palace Night"
              className="ry-gate-palace-preview"
            />

            {/* 3D Dual Swing Doors */}
            <div className="ry-gate-doors-wrap">
              <div className="ry-gate-door ry-gate-door-left">
                <img src="/images/gate_hb_left.jpg" alt="Left Royal Door" />
              </div>
              <div className="ry-gate-door ry-gate-door-right">
                <img src="/images/gate_hb_right.jpg" alt="Right Royal Door" />
              </div>
            </div>

            {/* Central Ribbon, HB Wax Seal & "TAP TO OPEN" */}
            <div className="ry-ribbon-seal-container">
              <span className="ry-tap-label">✦ TAP TO OPEN ✦</span>
              <div className="ry-seal-ribbon-box">
                <div className="ry-ribbon-band" />
                <img
                  src="/images/wax_seal_hb.png"
                  alt="HB Monogram Royal Wax Seal"
                  className="ry-wax-seal"
                />
              </div>
              <span className="ry-tap-sub">HARSH &amp; BHARTI</span>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MAIN INVITATION CONTENT CONTAINER
          ========================================================= */}
      <div className="ry-phone-container">
        {/* =========================================================
            2. PALACE HERO SECTION (UNDER MOONLIGHT)
            ========================================================= */}
        <section className="ry-hero-section">
          <img
            src="/images/palace_night_hb.jpg"
            alt="Royal Palace Courtyard Under Moonlight"
            className="ry-hero-bg"
          />
          <div className="ry-hero-overlay-gradient" />

          <div className="ry-hero-content">
            <div className="ry-hero-names">
              <div className="ry-hero-blessing">॥ श्री गणेशाय नमः ॥</div>
              <div className="ry-hero-sub">Together with our families</div>
              <h1 className="ry-hero-groom">Harsh Wadhera</h1>
              <div className="ry-hero-weds">✦ WEDS ✦</div>
              <h1 className="ry-hero-bride">Bharti Sharma</h1>
              <div className="ry-hero-date-banner">
                <span>24 • NOVEMBER • 2026</span>
                <span className="ry-hero-loc">NEW DELHI</span>
              </div>
            </div>
          </div>

          <div className="ry-scroll-down-hint">
            <span>Scroll</span>
            <span className="ry-scroll-arrow">⌄</span>
          </div>
        </section>

        {/* =========================================================
            3. SACRED TRADITIONAL BLESSING & FORMAL INVITATION CARD
            ========================================================= */}
        <div className="ry-formal-card-wrap">
          <div className="ry-formal-card">
            {/* Ganesh Ji Motif */}
            <div className="ry-ganesh-symbol">ॐ</div>

            {/* Sanskrit Shloka */}
            <p className="ry-shloka-verse">
              वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ।<br />
              निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥
            </p>

            <h2 className="ry-cordially-title">We Cordially Invite You</h2>

            <p className="ry-formal-lead">
              With the divine grace of the Almighty and the heartfelt blessings of
              our elders, we request the honour of your gracious presence to
              celebrate the auspicious wedding ceremony of
            </p>

            <div className="ry-couple-names-block">
              <div>
                <div className="ry-person-name">Harsh Wadhera</div>
                <div className="ry-person-parents">
                  Son of Smt. Anita Wadhera &amp; Sh. Rajesh Wadhera
                </div>
              </div>

              <div className="ry-formal-with">With</div>

              <div>
                <div className="ry-person-name">Bharti Sharma</div>
                <div className="ry-person-parents">
                  Daughter of Smt. Sunita Sharma &amp; Sh. Sunil Sharma
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================
            4. SCRATCH TO REVEAL WEDDING DATE
            ========================================================= */}
        <section className="ry-scratch-section">
          <div className="ry-sec-eyebrow">A SPECIAL SURPRISE</div>
          <h2 className="ry-sec-title">SCRATCH THE HEART TO REVEAL OUR WEDDING DATE</h2>

          <ScratchHeartCard onReveal={handleHeartRevealed} />

          <div className="ry-scratch-hint">
            <Sparkles size={16} />
            <span>SCRATCH TO REVEAL! ✨</span>
          </div>
        </section>

        {/* =========================================================
            5. COUNTDOWN & POLAROID PHOTO
            ========================================================= */}
        <section className="ry-countdown-section">
          <h2 className="ry-countdown-heading">The Big Day Approaches</h2>

          <div className="ry-timer-grid">
            <div className="ry-timer-box">
              <span className="ry-timer-num">
                {String(countdown.days).padStart(2, "0")}
              </span>
              <span className="ry-timer-label">DAYS</span>
            </div>
            <div className="ry-timer-box">
              <span className="ry-timer-num">
                {String(countdown.hours).padStart(2, "0")}
              </span>
              <span className="ry-timer-label">HOURS</span>
            </div>
            <div className="ry-timer-box">
              <span className="ry-timer-num">
                {String(countdown.minutes).padStart(2, "0")}
              </span>
              <span className="ry-timer-label">MINUTES</span>
            </div>
            <div className="ry-timer-box">
              <span className="ry-timer-num">
                {String(countdown.seconds).padStart(2, "0")}
              </span>
              <span className="ry-timer-label">SECONDS</span>
            </div>
          </div>

          {/* Polaroid Frame of Couple */}
          <div className="ry-polaroid-card">
            <img
              src="/images/couple_portrait_hb.jpg"
              alt="Harsh Wadhera & Bharti Sharma"
              className="ry-polaroid-img"
            />
            <div style={{ textAlign: "center", marginTop: "12px", fontFamily: "Cinzel, serif", fontSize: "13px", color: "var(--ry-gold-dark)", letterSpacing: "2px" }}>
              HARSH &amp; BHARTI • FOREVER
            </div>
          </div>
        </section>

        {/* =========================================================
            6. OUR STORY SECTION
            ========================================================= */}
        <section className="ry-story-section">
          <h2 className="ry-story-title">Our Story</h2>

          <div className="ry-story-text">
            <p>
              Our journey began with a simple conversation that effortlessly turned
              into hours of shared laughter, quiet understandings, and an instant
              connection that felt like home.
            </p>
            <p>
              Between shared passions, spontaneous food runs across Delhi, and
              unconditional support through every high and low, we realized that
              the best adventures in life are the ones lived together.
            </p>
            <p>
              Harsh found in Bharti his greatest confidante and brightest smile,
              while Bharti found in Harsh her rock, partner-in-crime, and easiest
              source of joy.
            </p>
            <p>
              As we step into this sacred lifelong union, we cannot wait to
              celebrate our love and embark on forever, surrounded by the warmth
              and blessings of our cherished family and friends!
            </p>
          </div>
        </section>

        {/* =========================================================
            7. WEDDING EVENTS SECTION
            ========================================================= */}
        <section className="ry-events-section">
          <div className="ry-events-header">
            <h2 className="ry-events-title">Wedding Events</h2>
          </div>

          {/* Event 1: Ring Ceremony & Sangeet */}
          <div className="ry-event-card">
            <h3 className="ry-event-name">Ring Ceremony &amp; Sangeet</h3>
            <div className="ry-event-date">23 NOVEMBER 2026</div>
            <div className="ry-event-time">MONDAY • 7 PM ONWARDS</div>

            <div className="ry-event-photo-wrap">
              <img
                src="/images/event_sangeet.jpg"
                alt="Ring Ceremony & Sangeet"
                className="ry-event-photo"
              />
            </div>

            <div className="ry-venue-label">VENUE</div>
            <div className="ry-venue-name">THE GRAND BALLROOM</div>
            <div className="ry-venue-address">NEW DELHI</div>

            <a
              href="https://maps.google.com/?q=New+Delhi"
              target="_blank"
              rel="noreferrer"
              className="ry-maps-btn"
            >
              <MapPin size={13} />
              <span>VIEW ON MAPS</span>
            </a>
          </div>

          {/* Event 2: Wedding Ceremony (Radisson Blu Hotel, New Delhi Dwarka) */}
          <div className="ry-event-card">
            <h3 className="ry-event-name">Wedding Ceremony</h3>
            <div className="ry-event-date">24 NOVEMBER 2026</div>
            <div className="ry-event-time">TUESDAY • 7 PM ONWARDS<br /><small style={{ fontSize: "12px", opacity: 0.85 }}>Baraat: 6 PM • Pheras: 10 PM</small></div>

            <div className="ry-event-photo-wrap">
              <img
                src="/images/event_wedding_hb.jpg"
                alt="Wedding Mandap at Radisson Blu Hotel Dwarka"
                className="ry-event-photo"
              />
            </div>

            <div className="ry-venue-label">VENUE</div>
            <div className="ry-venue-name">RADISSON BLU HOTEL</div>
            <div className="ry-venue-address">
              PLOT 4, SECTOR 13, DWARKA<br />NEW DELHI - 110075
            </div>

            <a
              href="https://maps.google.com/?q=Radisson+Blu+Hotel+New+Delhi+Dwarka"
              target="_blank"
              rel="noreferrer"
              className="ry-maps-btn"
            >
              <MapPin size={13} />
              <span>VIEW ON MAPS</span>
            </a>
          </div>

          {/* Event 3: Grand Reception (Mystique Banquet, New Delhi) */}
          <div className="ry-event-card">
            <h3 className="ry-event-name">Grand Reception</h3>
            <div className="ry-event-date">25 NOVEMBER 2026</div>
            <div className="ry-event-time">WEDNESDAY • 7:30 PM ONWARDS</div>

            <div className="ry-event-photo-wrap">
              <img
                src="/images/event_reception_hb.jpg"
                alt="Grand Reception at Mystique Banquet"
                className="ry-event-photo"
              />
            </div>

            <div className="ry-venue-label">VENUE</div>
            <div className="ry-venue-name">MYSTIQUE BANQUET</div>
            <div className="ry-venue-address">
              NEW DELHI
            </div>

            <a
              href="https://maps.google.com/?q=Mystique+banquet+New+Delhi"
              target="_blank"
              rel="noreferrer"
              className="ry-maps-btn"
            >
              <MapPin size={13} />
              <span>VIEW ON MAPS</span>
            </a>
          </div>

          {/* =========================================================
              8. FAMILY BLESSINGS SECTION
              ========================================================= */}
          <div className="ry-family-card">
            <div className="ry-family-group">
              <div className="ry-family-role">GRANDPARENTS</div>
              <div className="ry-family-names">
                Smt. &amp; Sh. Wadhera • Smt. &amp; Sh. Sharma
              </div>
            </div>

            <div className="ry-family-group">
              <div className="ry-family-role">PARENTS</div>
              <div className="ry-family-names">
                Anita &amp; Rajesh Wadhera<br />
                Sunita &amp; Sunil Sharma
              </div>
            </div>

            <div className="ry-family-group">
              <div className="ry-family-role">FAMILY &amp; RELATIVES</div>
              <div className="ry-family-names">
                Wadhera &amp; Sharma Parivar
              </div>
            </div>

            <div className="ry-family-group">
              <div className="ry-family-role">WITH BEST COMPLIMENTS</div>
              <div className="ry-family-names">
                All Near &amp; Dear Ones
              </div>
            </div>
          </div>

          {/* =========================================================
              9. RSVP FORM SECTION
              ========================================================= */}
          <div className="ry-rsvp-card">
            <h3 className="ry-rsvp-title">RSVP</h3>
            <p className="ry-rsvp-sub">We eagerly look forward to celebrating with you.</p>

            {isSubmitted ? (
              <div className="ry-rsvp-success">
                <Check size={24} style={{ display: "inline-block", marginBottom: "6px" }} />
                <p>Thank you, {rsvpData.name}!</p>
                <p style={{ fontSize: "14px", fontWeight: "normal", marginTop: "4px" }}>
                  Your RSVP and blessings have been warmly received.
                </p>
              </div>
            ) : (
              <form onSubmit={handleRsvpSubmit}>
                <div className="ry-input-group">
                  <label className="ry-input-label">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    className="ry-input-field"
                    value={rsvpData.name}
                    onChange={(e) => setRsvpData({ ...rsvpData, name: e.target.value })}
                  />
                </div>

                <div className="ry-input-group">
                  <label className="ry-input-label">Contact / Phone / WhatsApp</label>
                  <input
                    type="text"
                    placeholder="e.g. +91 98111..."
                    className="ry-input-field"
                    value={rsvpData.contact}
                    onChange={(e) => setRsvpData({ ...rsvpData, contact: e.target.value })}
                  />
                </div>

                <div className="ry-input-group">
                  <label className="ry-input-label" style={{ marginBottom: "10px" }}>
                    Which wedding events will you be attending?
                  </label>
                  <div className="ry-events-checklist">
                    {[
                      "Sangeet & Ring Ceremony (23 Nov)",
                      "Wedding Ceremony (24 Nov)",
                      "Grand Reception (25 Nov)",
                      "Unfortunately, I cannot attend",
                    ].map((event) => {
                      const isChecked = rsvpData.events.includes(event);
                      return (
                        <div
                          key={event}
                          className={`ry-check-item ${isChecked ? "active" : ""}`}
                          onClick={() => handleToggleEvent(event)}
                        >
                          <div className="ry-check-circle">
                            {isChecked && <div className="ry-check-dot" />}
                          </div>
                          <span className="ry-check-text">{event}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="ry-input-group">
                  <label className="ry-input-label">Your Message &amp; Wishes</label>
                  <textarea
                    rows={3}
                    placeholder="Write your blessings for Harsh & Bharti..."
                    className="ry-textarea-field"
                    value={rsvpData.message}
                    onChange={(e) => setRsvpData({ ...rsvpData, message: e.target.value })}
                  />
                </div>

                <button type="submit" className="ry-rsvp-submit-btn">
                  CONFIRM RSVP
                </button>
              </form>
            )}
          </div>
        </section>

        {/* =========================================================
            10. THANK YOU & CONTACT FOOTER
            ========================================================= */}
        <footer className="ry-footer-section">
          <h2 className="ry-footer-title">Thank You</h2>

          <div className="ry-contact-item">
            <div className="ry-contact-name">RAJESH WADHERA</div>
            <a href="tel:+919810012345" className="ry-contact-phone">
              (+91 98100 12345)
            </a>
          </div>

          <div className="ry-contact-item">
            <div className="ry-contact-name">SUNIL SHARMA</div>
            <a href="tel:+919811154321" className="ry-contact-phone">
              (+91 98111 54321)
            </a>
          </div>

          <div className="ry-footer-brand">
            Harsh Wadhera &amp; Bharti Sharma Wedding • 2026
          </div>
        </footer>
      </div>
    </div>
  );
}
