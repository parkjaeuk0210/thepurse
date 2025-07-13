let counter = 0;

export function generateId(prefix: string = ''): string {
  if (typeof window === 'undefined') {
    // Server-side: use a simple counter
    return `${prefix}${counter++}`;
  }
  // Client-side: use timestamp + counter
  return `${prefix}${Date.now()}-${counter++}`;
}

export function resetCounter() {
  counter = 0;
}