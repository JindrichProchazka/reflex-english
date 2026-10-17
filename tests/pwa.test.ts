import { afterEach, expect, it, vi } from 'vitest';
import { createPwaUpdates } from '../src/application/pwa';
import { keepFocusedInputVisible } from '../src/application/viewport';

afterEach(() => {
  document.body.replaceChildren();
  vi.restoreAllMocks();
});
it('requires explicit confirmation and waits for saved writes before activating an update', async () => {
  const pwa = createPwaUpdates(),
    calls: string[] = [];
  pwa.configure(
    async () => {
      calls.push('activate');
    },
    async () => {
      calls.push('flushed');
    },
  );
  pwa.needRefresh();
  await pwa.apply();
  expect(calls).toEqual([]);
  pwa.requestConfirmation();
  pwa.later();
  await pwa.apply();
  expect(calls).toEqual([]);
  pwa.requestConfirmation();
  await pwa.apply();
  expect(calls).toEqual(['flushed', 'activate']);
  expect(pwa.getSnapshot().applying).toBe(true);
});
it('keeps the old application usable if storage cannot be checked before updating', async () => {
  const pwa = createPwaUpdates(),
    apply = vi.fn();
  pwa.configure(apply, async () => {
    throw new Error('storage unavailable');
  });
  pwa.needRefresh();
  pwa.requestConfirmation();
  await pwa.apply();
  expect(apply).not.toHaveBeenCalled();
  expect(pwa.getSnapshot()).toMatchObject({ available: true, applying: false });
  expect(pwa.getSnapshot().error).toContain('not been removed');
});
it('handles activation failure and notifies subscribed UI without mutating learning records', async () => {
  const pwa = createPwaUpdates(),
    listener = vi.fn(),
    unsubscribe = pwa.subscribe(listener);
  pwa.configure(
    async () => {
      throw new Error('activation failure');
    },
    async () => {},
  );
  pwa.needRefresh();
  pwa.requestConfirmation();
  await pwa.apply();
  expect(pwa.getSnapshot().applying).toBe(false);
  expect(listener).toHaveBeenCalled();
  unsubscribe();
  listener.mockClear();
  pwa.later();
  expect(listener).not.toHaveBeenCalled();
});
it('checks for waiting updates and permits postponing them without suppressing future checks', async () => {
  const pwa = createPwaUpdates(),
    registration = { update: vi.fn(async () => {}), waiting: {} };
  pwa.registered(registration);
  expect(pwa.getSnapshot().available).toBe(true);
  pwa.later();
  expect(pwa.getSnapshot().dismissed).toBe(true);
  await pwa.check();
  expect(registration.update).toHaveBeenCalledOnce();
  expect(pwa.getSnapshot().dismissed).toBe(true);
  registration.waiting = {};
  await pwa.check();
  expect(pwa.getSnapshot().dismissed).toBe(false);
});
it('does not resurrect a postponed banner for duplicate notifications of the same worker', () => {
  const pwa = createPwaUpdates(),
    worker = {};
  pwa.needRefresh(worker);
  pwa.later();
  pwa.needRefresh(worker);
  pwa.needRefresh();
  expect(pwa.getSnapshot()).toMatchObject({
    available: true,
    dismissed: true,
    confirming: false,
  });
  pwa.requestConfirmation();
  expect(pwa.getSnapshot().confirming).toBe(true);
});
it('offline or failed update checks do not make learning depend on a network', async () => {
  const pwa = createPwaUpdates(),
    registration = {
      update: vi.fn(async () => {
        throw new Error('offline');
      }),
    };
  pwa.registered(registration);
  pwa.ready();
  await pwa.check();
  expect(pwa.getSnapshot()).toMatchObject({
    offlineReady: true,
    applying: false,
    checking: false,
  });
  expect(pwa.getSnapshot().message).toContain('still available');
  vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
  await pwa.check();
  expect(registration.update).toHaveBeenCalledOnce();
  expect(pwa.getSnapshot().message).toContain('Connect');
});
it('keeps a focused text field inside a reduced visual viewport without fixed keyboard dimensions', () => {
  const input = document.createElement('textarea');
  document.body.append(input);
  input.focus();
  Object.defineProperty(input, 'scrollIntoView', {
    value: vi.fn(),
    configurable: true,
  });
  vi.spyOn(input, 'getBoundingClientRect').mockReturnValue({
    top: 800,
    bottom: 900,
  } as DOMRect);
  keepFocusedInputVisible();
  expect(input.scrollIntoView).toHaveBeenCalledWith({
    block: 'center',
    behavior: 'instant',
  });
  vi.mocked(input.scrollIntoView).mockClear();
  vi.spyOn(input, 'getBoundingClientRect').mockReturnValue({
    top: 40,
    bottom: 90,
  } as DOMRect);
  keepFocusedInputVisible();
  expect(input.scrollIntoView).not.toHaveBeenCalled();
});
