// Default data for a new Emerald Noir invitation.
// Everything here is editable from the editor.

export const DEFAULT_DATA = {
  groom: "Aarav",
  groomParents: "Son of Mr. & Mrs. Sharma",
  groomLine1: "",
  groomLine2: "",
  bride: "Meher",
  brideParents: "Daughter of Mr. & Mrs. Kapoor",
  brideLine1: "",
  brideLine2: "",
  welcomeMsg:
    "With hearts full of joy, we welcome you to our wedding. As we begin our journey together in faith and love, we thank you for being part of this blessed occasion.",
  dateISO: "2026-12-06T19:00",
  photos: [],
  musicUrl: "",
  timeline: [
    { title: "Guest Arrival", when: "", desc: "We welcome you..!" },
    { title: "Wedding Ceremony", when: "", desc: "" },
    { title: "Reception", when: "", desc: "" },
  ],
  venueName: "",
  venueAddress: "",
  mapsUrl: "",
  dressWomen: "Elegant formal attire in pastel or jewel tones",
  dressMen: "Suit or traditional formal wear",
  preEvents: [
    { title: "Mehndi", when: "", where: "" },
    { title: "Haldi", when: "", where: "" },
    { title: "Sangeet", when: "", where: "" },
  ],
  transport: "",
  accommodation: "",
  giftsNote:
    "Your love, blessings, and presence are the greatest gifts we could ever ask for.",
  closing: "We can't wait to celebrate with you!",
  show: {
    scratch: true,
    slideshow: true,
    countdown: true,
    timeline: true,
    dress: true,
    preEvents: true,
    transport: false,
    stay: false,
    gifts: true,
    rsvp: true,
  },
};

export function slugify(groom, bride) {
  const base = `${groom}-weds-${bride}`
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-");
  const rand = Math.random().toString(36).slice(2, 6);
  return `${base}-${rand}`;
}

export function mergeData(input = {}) {
  return {
    ...DEFAULT_DATA,
    ...input,
    timeline: (input.timeline?.length ? input.timeline : DEFAULT_DATA.timeline).slice(0, 8),
    preEvents: (input.preEvents?.length ? input.preEvents : DEFAULT_DATA.preEvents).slice(0, 8),
    photos: (input.photos || []).slice(0, 10),
    show: { ...DEFAULT_DATA.show, ...(input.show || {}) },
  };
}
