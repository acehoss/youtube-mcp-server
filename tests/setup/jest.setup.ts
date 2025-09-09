// Suppress excessively noisy youtubei.js parser warnings during tests
// without muting other warnings. We filter by the library's log prefix.
import { jest } from '@jest/globals';
const originalConsoleWarn = console.warn;

beforeAll(() => {
  // Spy on console.warn and filter specific noisy messages
  jest.spyOn(console, 'warn').mockImplementation((...args: unknown[]) => {
    try {
      const message = args
        .map((arg) => {
          if (typeof arg === 'string') return arg;
          if (arg && typeof arg === 'object' && 'message' in (arg as any)) {
            return String((arg as any).message);
          }
          return '';
        })
        .join(' ');

      // youtubei.js parser warnings commonly start with this prefix
      // Example: "[YOUTUBEJS][Parser]: TicketEvent changed! ..."
      if (
        message.includes('[YOUTUBEJS]') ||
        message.includes('youtubei.js') ||
        message.includes('TicketEvent changed')
      ) {
        return; // swallow the noisy warning
      }
    } catch {
      // If anything goes wrong, fall through to original warn
    }

    // Delegate to the original console.warn for everything else
    originalConsoleWarn(...(args as [any]));
  });
});

afterAll(() => {
  // Restore the original console.warn if it was mocked
  const mocked = console.warn as unknown as { mockRestore?: () => void };
  mocked.mockRestore?.();
});


