import { wedding, type WeddingConfig } from "@/wedding.config";
import { coupleLine } from "@/lib/text";

function stamp(date: Date) {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function escapeIcs(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

export function calendarEvent(data: WeddingConfig = wedding) {
  const start = new Date(data.date.iso);
  const end = new Date(data.date.endIso);
  const title = `Mariage de ${coupleLine(data)}`;
  const location = data.ceremonies
    .map((item) => [item.venue, item.address].filter(Boolean).join(", "))
    .filter(Boolean)
    .join(" | ");
  const details = [data.invitation, location].filter(Boolean).join("\n");
  return { start, end, title, location, details };
}

export function googleCalendarUrl(data: WeddingConfig = wedding) {
  const event = calendarEvent(data);
  const dates = `${stamp(event.start)}/${stamp(event.end)}`;
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates,
    details: event.details,
    location: event.location,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function outlookCalendarUrl(data: WeddingConfig = wedding) {
  const event = calendarEvent(data);
  const params = new URLSearchParams({
    rru: "addevent",
    subject: event.title,
    startdt: event.start.toISOString(),
    enddt: event.end.toISOString(),
    body: event.details,
    location: event.location,
  });
  return `https://outlook.live.com/calendar/0/action/compose?${params.toString()}`;
}

export function downloadCalendar(data: WeddingConfig = wedding) {
  const event = calendarEvent(data);
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Noces//Mariage//FR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${coupleLine(data).replace(/\s+/g, "-").toLowerCase()}@noces`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(event.start)}`,
    `DTEND:${stamp(event.end)}`,
    `SUMMARY:${escapeIcs(event.title)}`,
    `LOCATION:${escapeIcs(event.location)}`,
    `DESCRIPTION:${escapeIcs(event.details)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "mariage.ics";
  link.click();
  URL.revokeObjectURL(url);
}
