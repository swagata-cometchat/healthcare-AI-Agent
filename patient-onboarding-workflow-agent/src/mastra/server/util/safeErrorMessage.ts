export function safeErrorMessage(err: unknown): string {
  try {
    if (err && typeof err === 'object') {
      const msg = (err as any) && (err as any)['message'];
      if (typeof msg === 'string') return msg;
      const toStr = (err as any) && (err as any)['toString'];
      if (typeof toStr === 'function') return String(err);
    }
  } catch {
    // ignore
  }
  return 'unexpected error';
}