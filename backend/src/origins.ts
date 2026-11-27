function clean(value: string) {
  return value.trim().replace(/^"|"$/g, "").replace(/\/$/, "");
}

export function primaryOrigin() {
  const first = (process.env.CLIENT_ORIGIN || "").split(",").map(clean).find(Boolean);
  return first || "http://localhost:3000";
}

export function safeOrigin(value: unknown) {
  const origin = typeof value === "string" ? clean(value) : "";
  try {
    const url = new URL(origin);
    if (url.protocol === "https:" || url.protocol === "http:") return url.origin;
  } catch {
    /* Une adresse illisible retombe sur le site par défaut. */
  }
  return primaryOrigin();
}
