"use client";

import { Check } from "lucide-react";

function F({ label, children }) {
  return (
    <label className="wf-field">
      <span>{label}</span>
      {children}
    </label>
  );
}

const SECTION_LABELS = {
  scratch: "Scratch card",
  slideshow: "Photos",
  countdown: "Countdown",
  timeline: "Timeline",
  dress: "Dress code",
  preEvents: "Pre-wedding",
  transport: "Transport",
  stay: "Stay",
  gifts: "Gifts",
  rsvp: "Messages",
};

export default function InviteForm({ data, setData }) {
  const up = (k, v) => setData((d) => ({ ...d, [k]: v }));
  const upArr = (arr, i, k, v) =>
    setData((d) => ({ ...d, [arr]: d[arr].map((e, j) => (j === i ? { ...e, [k]: v } : e)) }));
  const upShow = (k) => setData((d) => ({ ...d, show: { ...d.show, [k]: !d.show[k] } }));

  return (
    <div className="wf">
      <div className="wf-sub">Couple</div>
      <div className="wf-row2">
        <F label="Groom *"><input value={data.groom} onChange={(e) => up("groom", e.target.value)} /></F>
        <F label="Bride *"><input value={data.bride} onChange={(e) => up("bride", e.target.value)} /></F>
      </div>
      <F label="Groom — parents line"><input value={data.groomParents} onChange={(e) => up("groomParents", e.target.value)} placeholder="Son of Mr. & Mrs. Sharma" /></F>
      <div className="wf-row2">
        <F label="Groom extra line 1"><input value={data.groomLine1} onChange={(e) => up("groomLine1", e.target.value)} placeholder="MBBS, M.D. (optional)" /></F>
        <F label="Groom extra line 2"><input value={data.groomLine2} onChange={(e) => up("groomLine2", e.target.value)} placeholder="(optional)" /></F>
      </div>
      <F label="Bride — parents line"><input value={data.brideParents} onChange={(e) => up("brideParents", e.target.value)} placeholder="Daughter of Mr. & Mrs. Kapoor" /></F>
      <div className="wf-row2">
        <F label="Bride extra line 1"><input value={data.brideLine1} onChange={(e) => up("brideLine1", e.target.value)} placeholder="(optional)" /></F>
        <F label="Bride extra line 2"><input value={data.brideLine2} onChange={(e) => up("brideLine2", e.target.value)} placeholder="(optional)" /></F>
      </div>
      <F label="Welcome message">
        <textarea rows={3} value={data.welcomeMsg} onChange={(e) => up("welcomeMsg", e.target.value)} />
      </F>
      <F label="Wedding date & time *">
        <input type="datetime-local" value={data.dateISO} onChange={(e) => up("dateISO", e.target.value)} />
      </F>
      <F label="Photo URLs (comma separated)">
        <textarea
          rows={2}
          value={data.photos.join(", ")}
          placeholder="https://…jpg, https://…jpg"
          onChange={(e) => up("photos", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
        />
      </F>
      <F label="Music URL (mp3 — optional)">
        <input value={data.musicUrl} onChange={(e) => up("musicUrl", e.target.value)} placeholder="https://…mp3" />
      </F>

      <div className="wf-sub">Program timeline</div>
      {data.timeline.map((ev, i) => (
        <div className="wf-block" key={i}>
          <div className="wf-row2">
            <F label={`Item ${i + 1}`}><input value={ev.title} onChange={(e) => upArr("timeline", i, "title", e.target.value)} /></F>
            <F label="When"><input value={ev.when} onChange={(e) => upArr("timeline", i, "when", e.target.value)} placeholder="6 Dec 2026, 7:00 PM" /></F>
          </div>
          <F label="Note"><input value={ev.desc} onChange={(e) => upArr("timeline", i, "desc", e.target.value)} /></F>
        </div>
      ))}

      <div className="wf-sub">Venue</div>
      <F label="Venue name"><input value={data.venueName} onChange={(e) => up("venueName", e.target.value)} /></F>
      <F label="Address"><input value={data.venueAddress} onChange={(e) => up("venueAddress", e.target.value)} /></F>
      <F label="Google Maps link"><input value={data.mapsUrl} onChange={(e) => up("mapsUrl", e.target.value)} placeholder="https://maps.google.com/?q=…" /></F>

      <div className="wf-sub">Dress code</div>
      <F label="Women"><input value={data.dressWomen} onChange={(e) => up("dressWomen", e.target.value)} /></F>
      <F label="Men"><input value={data.dressMen} onChange={(e) => up("dressMen", e.target.value)} /></F>

      <div className="wf-sub">Pre-wedding events</div>
      {data.preEvents.map((ev, i) => (
        <div className="wf-block" key={i}>
          <div className="wf-row2">
            <F label={`Event ${i + 1}`}><input value={ev.title} onChange={(e) => upArr("preEvents", i, "title", e.target.value)} /></F>
            <F label="When"><input value={ev.when} onChange={(e) => upArr("preEvents", i, "when", e.target.value)} placeholder="4 Dec 2026, 8:00 PM" /></F>
          </div>
          <F label="Where"><input value={ev.where} onChange={(e) => upArr("preEvents", i, "where", e.target.value)} /></F>
        </div>
      ))}

      <div className="wf-sub">Guest info</div>
      <F label="Transportation"><textarea rows={2} value={data.transport} onChange={(e) => up("transport", e.target.value)} /></F>
      <F label="Accommodation"><textarea rows={2} value={data.accommodation} onChange={(e) => up("accommodation", e.target.value)} /></F>
      <F label="Gifts note"><textarea rows={2} value={data.giftsNote} onChange={(e) => up("giftsNote", e.target.value)} /></F>
      <F label="Closing line"><input value={data.closing} onChange={(e) => up("closing", e.target.value)} /></F>

      <div className="wf-sub">Sections</div>
      <div className="wf-toggles">
        {Object.entries(SECTION_LABELS).map(([k, label]) => (
          <button type="button" key={k} className={`wf-toggle ${data.show[k] ? "on" : ""}`} onClick={() => upShow(k)}>
            {data.show[k] && <Check size={13} />} {label}
          </button>
        ))}
      </div>
    </div>
  );
}
