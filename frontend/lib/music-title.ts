function prettyFileName(name: string) {
  const base = name.replace(/\.[a-z0-9]+$/i, "").replace(/[_]+/g, " ").trim();
  if (!base || /^[0-9a-f-]{8,}$/i.test(base)) return "Morceau";
  return base;
}

function textFrom(bytes: Uint8Array, start: number, length: number, encoding: number) {
  const slice = bytes.slice(start, start + length);
  const end = slice.indexOf(0);
  const data = end >= 0 ? slice.slice(0, end) : slice;
  if (encoding === 1 || encoding === 2) {
    return new TextDecoder("utf-16").decode(data).replace(/\0/g, "").trim();
  }
  return new TextDecoder(encoding === 3 ? "utf-8" : "latin1").decode(data).replace(/\0/g, "").trim();
}

function readId3(bytes: Uint8Array) {
  if (bytes.length < 10 || bytes[0] !== 0x49 || bytes[1] !== 0x44 || bytes[2] !== 0x33) return "";
  let offset = 10;
  while (offset + 10 < bytes.length) {
    const id = String.fromCharCode(bytes[offset], bytes[offset + 1], bytes[offset + 2], bytes[offset + 3]);
    if (!/^[A-Z0-9]{4}$/.test(id)) break;
    const size = (bytes[offset + 4] << 24) | (bytes[offset + 5] << 16) | (bytes[offset + 6] << 8) | bytes[offset + 7];
    if (size <= 0 || offset + 10 + size > bytes.length) break;
    if (id === "TIT2") return textFrom(bytes, offset + 11, size - 1, bytes[offset + 10]);
    offset += 10 + size;
  }
  return "";
}

function readM4aName(bytes: Uint8Array) {
  for (let index = 0; index < bytes.length - 12; index += 1) {
    if (bytes[index] !== 0xa9 || bytes[index + 1] !== 0x6e || bytes[index + 2] !== 0x61 || bytes[index + 3] !== 0x6d) continue;
    const dataAt = index + 4;
    const mark = String.fromCharCode(bytes[dataAt + 4] || 0, bytes[dataAt + 5] || 0, bytes[dataAt + 6] || 0, bytes[dataAt + 7] || 0);
    const start = mark === "data" ? dataAt + 16 : dataAt;
    const title = textFrom(bytes, start, Math.min(180, bytes.length - start), 3);
    if (title) return title;
  }
  return "";
}

function readId3v1(bytes: Uint8Array) {
  if (bytes.length < 128) return "";
  const start = bytes.length - 128;
  if (String.fromCharCode(bytes[start], bytes[start + 1], bytes[start + 2]) !== "TAG") return "";
  return textFrom(bytes, start + 3, 30, 0);
}

export async function musicTitle(file: File) {
  try {
    const head = new Uint8Array(await file.slice(0, 256 * 1024).arrayBuffer());
    const tail = file.size > head.length ? new Uint8Array(await file.slice(-256 * 1024).arrayBuffer()) : head;
    const title = readId3(head) || readM4aName(head) || readM4aName(tail) || readId3v1(tail);
    if (title) return title;
  } catch {
    /* Le nom du fichier suffit si le morceau n'a pas de titre. */
  }
  return prettyFileName(file.name);
}
