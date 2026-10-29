/**
 * Minimal ZIP writer (stored, no compression): media files are already compressed,
 * and this keeps downloads dependency-free. Browser- and server-safe (Uint8Array only).
 * Files under 4 GB each.
 */
let table: Uint32Array | null = null;

export function crc32(data: Uint8Array): number {
  if (!table) {
    table = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[n] = c >>> 0;
    }
  }
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) crc = table[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

export function zip(entries: { name: string; data: Uint8Array; date?: Date }[]): Uint8Array<ArrayBuffer> {
  const enc = new TextEncoder();
  const prepared = entries.map((e) => {
    const name = enc.encode(e.name);
    const d = e.date ?? new Date();
    return {
      name,
      data: e.data,
      crc: crc32(e.data),
      time: (d.getHours() << 11) | (d.getMinutes() << 5) | Math.floor(d.getSeconds() / 2),
      date: ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate(),
    };
  });
  const total = prepared.reduce((n, e) => n + 30 + e.name.length + e.data.length + 46 + e.name.length, 22);
  const out = new Uint8Array(total);
  const view = new DataView(out.buffer);
  let pos = 0;
  const offsets: number[] = [];
  for (const e of prepared) {
    offsets.push(pos);
    view.setUint32(pos, 0x04034b50, true);
    view.setUint16(pos + 4, 20, true); // version needed
    view.setUint16(pos + 6, 0x0800, true); // UTF-8 names
    view.setUint16(pos + 8, 0, true); // stored
    view.setUint16(pos + 10, e.time, true);
    view.setUint16(pos + 12, e.date, true);
    view.setUint32(pos + 14, e.crc, true);
    view.setUint32(pos + 18, e.data.length, true);
    view.setUint32(pos + 22, e.data.length, true);
    view.setUint16(pos + 26, e.name.length, true);
    view.setUint16(pos + 28, 0, true);
    out.set(e.name, pos + 30);
    out.set(e.data, pos + 30 + e.name.length);
    pos += 30 + e.name.length + e.data.length;
  }
  const dirStart = pos;
  prepared.forEach((e, i) => {
    view.setUint32(pos, 0x02014b50, true);
    view.setUint16(pos + 4, 20, true);
    view.setUint16(pos + 6, 20, true);
    view.setUint16(pos + 8, 0x0800, true);
    view.setUint16(pos + 10, 0, true);
    view.setUint16(pos + 12, e.time, true);
    view.setUint16(pos + 14, e.date, true);
    view.setUint32(pos + 16, e.crc, true);
    view.setUint32(pos + 20, e.data.length, true);
    view.setUint32(pos + 24, e.data.length, true);
    view.setUint16(pos + 28, e.name.length, true);
    view.setUint32(pos + 42, offsets[i], true);
    out.set(e.name, pos + 46);
    pos += 46 + e.name.length;
  });
  view.setUint32(pos, 0x06054b50, true);
  view.setUint16(pos + 8, prepared.length, true);
  view.setUint16(pos + 10, prepared.length, true);
  view.setUint32(pos + 12, pos - dirStart, true);
  view.setUint32(pos + 16, dirStart, true);
  return out;
}
