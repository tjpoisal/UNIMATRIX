// Helpers to convert between string content and Prisma Bytes (Uint8Array)
export function textToBytes(s?: string | null): Uint8Array | undefined {
  if (s === undefined || s === null) return undefined;
  // Buffer is a subclass of Uint8Array and is accepted by Prisma for Bytes
  return Buffer.from(String(s), 'utf8');
}

export function bytesToText(b: unknown): string {
  if (!b) return '';
  if (b instanceof Uint8Array) return new TextDecoder().decode(b);
  return String(b);
}
