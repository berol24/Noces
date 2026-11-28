import { wedding, type Speaker, type WeddingConfig } from "@/wedding.config";

export function coupleLine(data: WeddingConfig = wedding) {
  const { bride, groom, nameOrder } = data.couple;
  const first = nameOrder === "groom-bride" ? groom : bride;
  const second = nameOrder === "groom-bride" ? bride : groom;
  return `${first.firstName} & ${second.firstName}`;
}

export function familiesLine(data: WeddingConfig = wedding) {
  return data.families.filter(Boolean).join(" · ");
}

export function fullDate(data: WeddingConfig = wedding) {
  const d = data.date;
  return `${d.weekday} ${d.day} ${d.month} ${d.year}`;
}

export function numericDate(data: WeddingConfig = wedding) {
  const d = data.date;
  return `${d.day} · ${d.monthNumber} · ${d.year}`;
}

export function placeLine(data: WeddingConfig = wedding) {
  return `${data.date.city}, ${data.date.country}`;
}

export function personName(speaker: Speaker, data: WeddingConfig = wedding) {
  return data.couple[speaker].firstName;
}

export function pageTitle(data: WeddingConfig = wedding) {
  return data.seo.title || `${coupleLine(data)} — ${fullDate(data)}`;
}

export function pageDescription(data: WeddingConfig = wedding) {
  if (data.seo.description) return data.seo.description;
  const { bride, groom } = data.couple;
  return `Mariage de ${bride.firstName} ${bride.lastName} et ${groom.firstName} ${groom.lastName} · ${fullDate(data)} · ${placeLine(data)}`;
}

export function slugify(value: string) {
  const raw = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return raw || "mariage";
}

export function coupleSlug(data: WeddingConfig = wedding) {
  const { bride, groom, nameOrder } = data.couple;
  const first = nameOrder === "groom-bride" ? groom.firstName : bride.firstName;
  const second = nameOrder === "groom-bride" ? bride.firstName : groom.firstName;
  return slugify(`${first}-et-${second}`);
}
export function coupleFullLine(data: WeddingConfig = wedding) {
  const { bride, groom, nameOrder } = data.couple;
  const first = nameOrder === "groom-bride" ? groom : bride;
  const second = nameOrder === "groom-bride" ? bride : groom;
  const name = (person: { firstName: string; lastName: string }) => [person.firstName, person.lastName].filter(Boolean).join(" ");
  return `${name(first)} & ${name(second)}`;
}

export function shareTitle(data: WeddingConfig = wedding) {
  return data.seo?.shareTitle || `Mariage de ${coupleFullLine(data)}`;
}

export function shareText(data: WeddingConfig = wedding) {
  return data.seo?.shareText || `${fullDate(data)} · ${placeLine(data)} · ${familiesLine(data)}`;
}

export const publishedSite = "https://noces-mariage.vercel.app";

export function siteOrigin() {
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host !== "localhost" && host !== "127.0.0.1") return window.location.origin;
  }
  return publishedSite;
}

export function inviteUrl(slug: string) {
  return `${siteOrigin()}/i/${slug}`;
}

export function messageUrl(slug: string) {
  return `${inviteUrl(slug)}?livre=1`;
}

export function shareMessage(data: WeddingConfig, url: string) {
  const custom = data.seo?.shareText?.trim() || "";
  const body = custom || [
    `${coupleFullLine(data)} se marient`,
    "",
    data.invitation.trim() || "Nous avons la joie de vous inviter à célébrer notre mariage.",
    "",
    fullDate(data),
    placeLine(data),
    familiesLine(data),
  ].join("\n");
  return body.includes(url) ? body : `${body}\n\n${url}`;
}

export function footerLine(data: WeddingConfig = wedding) {
  const d = data.date;
  return `${data.footer.signature} · ${d.city}, ${d.country} · ${d.year}`;
}

export function asTime(value: string) {
  const match = String(value || "").match(/(\d{1,2})\s*[:hH]\s*(\d{2})/);
  if (!match) return "";
  return `${match[1].padStart(2, "0")}:${match[2]}`;
}

export function mapUrl(query: string) {
  if (/^https?:\/\//i.test(query)) return query;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function ceremonyQuery(
  ceremony: { venue: string; address: string; mapQuery: string },
  data: WeddingConfig = wedding,
) {
  const written = ceremony.mapQuery.trim();
  if (/^https?:\/\//i.test(written)) return written;
  const place = [ceremony.venue, ceremony.address].filter(Boolean).join(", ");
  if (!place) return "";
  return [place, data.date.city, data.date.country].filter(Boolean).join(", ");
}

export function siteUrl(data: WeddingConfig = wedding) {
  try {
    return data.seo.url ? new URL(data.seo.url) : null;
  } catch {
    return null;
  }
}

export function dayKey(ms: number, data: WeddingConfig = wedding) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: data.date.timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(ms);
}
