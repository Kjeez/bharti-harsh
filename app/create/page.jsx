"use client";

import { useState } from "react";
import Link from "next/link";
import InviteForm from "@/components/InviteForm";
import { DEFAULT_DATA } from "@/lib/defaults";
import { Copy, Check, ExternalLink } from "lucide-react";

export default function CreatePage() {
  const [data, setData] = useState(DEFAULT_DATA);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [result, setResult] = useState(null); // { slug, editToken }
  const [copied, setCopied] = useState("");

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  const create = async () => {
    setErr("");
    if (!data.groom.trim() || !data.bride.trim()) {
      setErr("Groom and bride names are required.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Something went wrong");
      setResult(json);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  };

  const copy = async (text, key) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(""), 2000);
    } catch {}
  };

  if (result) {
    const inviteUrl = `${origin}/invite/${result.slug}`;
    const editUrl = `${origin}/edit/${result.editToken}`;
    const wa = `https://wa.me/?text=${encodeURIComponent(
      `You're invited! 💛\n${data.groom} & ${data.bride}\n${inviteUrl}`
    )}`;
    return (
      <div className="ed-page">
        <h1>Your invitation is live 🎉</h1>
        <p className="lead">Share the invitation link with guests. Keep the edit link private — it&apos;s your key to update details and read RSVPs.</p>

        <div className="share-box">
          <h2>Invitation link — share this</h2>
          <div className="share-link">
            <code>{inviteUrl}</code>
            <button className="btn ghost" onClick={() => copy(inviteUrl, "inv")}>
              {copied === "inv" ? <Check size={15} /> : <Copy size={15} />} Copy
            </button>
          </div>
          <div className="share-link" style={{ marginTop: 12 }}>
            <a className="btn" href={wa} target="_blank" rel="noreferrer">Share on WhatsApp</a>
            <Link className="btn ghost" href={`/invite/${result.slug}`} target="_blank">
              Open invitation <ExternalLink size={14} />
            </Link>
          </div>
        </div>

        <div className="share-box">
          <h2>Private edit link — save this</h2>
          <div className="share-link">
            <code>{editUrl}</code>
            <button className="btn ghost" onClick={() => copy(editUrl, "edit")}>
              {copied === "edit" ? <Check size={15} /> : <Copy size={15} />} Copy
            </button>
          </div>
          <p className="share-note">
            Bookmark this on your phone. Anyone with this link can edit the invitation and read
            your RSVP inbox — share only with your partner.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="ed-page">
      <h1>Create your invitation</h1>
      <p className="lead">
        Fill what you have — everything can be edited later from your phone. Empty sections are hidden automatically.
      </p>
      <InviteForm data={data} setData={setData} />
      <div className="ed-actions">
        <button className="btn" onClick={create} disabled={saving}>
          {saving ? <span className="spin" /> : null} {saving ? "Creating…" : "Create my invitation →"}
        </button>
        <Link href="/" className="btn ghost">Back</Link>
      </div>
      {err && <p className="ed-err">{err}</p>}
    </div>
  );
}
