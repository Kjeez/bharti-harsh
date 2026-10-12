"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import InviteForm from "@/components/InviteForm";
import { mergeData } from "@/lib/defaults";
import { Copy, Check, ExternalLink } from "lucide-react";

export default function EditPage({ params }) {
  const { token } = use(params);
  const [data, setData] = useState(null);
  const [slug, setSlug] = useState("");
  const [rsvps, setRsvps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [copied, setCopied] = useState(false);

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/invites/token/${token}`);
        if (!res.ok) throw new Error("Invitation not found");
        const json = await res.json();
        setData(mergeData(json.data));
        setSlug(json.slug);
        setRsvps(json.rsvps || []);
      } catch (e) {
        setErr(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const save = async () => {
    setErr(""); setMsg("");
    setSaving(true);
    try {
      const res = await fetch(`/api/invites/token/${token}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not save");
      setMsg("Saved! Your live invitation is updated.");
      setTimeout(() => setMsg(""), 3000);
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`${origin}/invite/${slug}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  if (loading) return <div className="center-load">Loading your invitation…</div>;
  if (err && !data) return <div className="center-load">{err}</div>;

  const yes = rsvps.filter((r) => r.attending === "yes").length;
  const no = rsvps.filter((r) => r.attending === "no").length;
  const inviteUrl = `${origin}/invite/${slug}`;
  const wa = `https://wa.me/?text=${encodeURIComponent(
    `You're invited! 💛\n${data.groom} & ${data.bride}\n${inviteUrl}`
  )}`;

  return (
    <div className="ed-page">
      <h1>Edit invitation</h1>
      <p className="lead">Changes go live on your invitation link the moment you save.</p>

      <div className="share-box">
        <h2>Your invitation link</h2>
        <div className="share-link">
          <code>{inviteUrl}</code>
          <button className="btn ghost" onClick={copy}>
            {copied ? <Check size={15} /> : <Copy size={15} />} Copy
          </button>
        </div>
        <div className="share-link" style={{ marginTop: 12 }}>
          <a className="btn" href={wa} target="_blank" rel="noreferrer">Share on WhatsApp</a>
          <Link className="btn ghost" href={`/invite/${slug}`} target="_blank">
            Open invitation <ExternalLink size={14} />
          </Link>
        </div>
      </div>

      <InviteForm data={data} setData={setData} />

      <div className="ed-actions">
        <button className="btn" onClick={save} disabled={saving}>
          {saving ? <span className="spin" /> : null} {saving ? "Saving…" : "Save changes"}
        </button>
      </div>
      {msg && <p className="ed-msg">{msg}</p>}
      {err && <p className="ed-err">{err}</p>}

      <div className="inbox">
        <h2>RSVP inbox</h2>
        <p className="stats">
          <b>{yes}</b> attending · <b>{no}</b> can&apos;t make it · <b>{rsvps.length}</b> total responses
        </p>
        {rsvps.length === 0 ? (
          <div className="inbox-empty">No responses yet — share your link on WhatsApp and they&apos;ll appear here.</div>
        ) : (
          rsvps.map((r, i) => (
            <div className="rsvp-card" key={i}>
              <div className="who">
                <span className="nm">{r.name}</span>
                {r.attending && (
                  <span className={`tag ${r.attending === "yes" ? "yes" : "no"}`}>
                    {r.attending === "yes" ? "Attending" : "Can't attend"}
                  </span>
                )}
              </div>
              {r.email && <div className="em">{r.email}</div>}
              {r.message && <div className="ms">“{r.message}”</div>}
              <div className="dt">{new Date(r.created_at).toLocaleString("en-IN")}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
