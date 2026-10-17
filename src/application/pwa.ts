export interface PwaState {
  available: boolean;
  confirming: boolean;
  dismissed: boolean;
  applying: boolean;
  offlineReady: boolean;
  checking: boolean;
  registered: boolean;
  message: string;
  error: string;
}
type Registration = { update: () => Promise<unknown>; waiting?: unknown };
/** Update policy contains no cache deletion or IndexedDB migration operations. */
export function createPwaUpdates() {
  let state: PwaState = {
    available: false,
    confirming: false,
    dismissed: false,
    applying: false,
    offlineReady: false,
    checking: false,
    registered: false,
    message: 'Preparing offline support…',
    error: '',
  };
  const listeners = new Set<() => void>();
  let registration: Registration | undefined;
  let notifiedWorker: unknown;
  let update: (() => Promise<void>) | undefined;
  let beforeApply: () => Promise<void> = async () => {};
  const patch = (next: Partial<PwaState>) => {
    state = { ...state, ...next };
    listeners.forEach((listener) => listener());
  };
  const api = {
    getSnapshot: () => state,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    configure: (apply: () => Promise<void>, flush: () => Promise<void>) => {
      update = apply;
      beforeApply = flush;
    },
    registered: (value: Registration) => {
      registration = value;
      patch({ registered: true, message: 'Offline cache is being prepared.' });
      if (value.waiting) api.needRefresh(value.waiting);
    },
    needRefresh: (worker?: unknown) => {
      // registration.update() and Workbox's delayed waiting event can report
      // the same worker twice. Do not undo the learner's Later choice.
      if (
        state.available &&
        (worker === undefined || worker === notifiedWorker)
      )
        return;
      notifiedWorker = worker;
      patch({
        available: true,
        dismissed: false,
        message: 'An update is ready to install.',
        error: '',
      });
    },
    ready: () =>
      patch({ offlineReady: true, message: 'Ready for offline practice.' }),
    unavailable: (message: string) => patch({ message }),
    registrationError: () =>
      patch({
        message:
          'Offline caching could not be prepared. Online practice and saved local data are still available.',
      }),
    requestConfirmation: () => {
      if (state.available)
        patch({ confirming: true, dismissed: false, error: '' });
    },
    later: () => patch({ confirming: false, dismissed: true }),
    async check() {
      if (!registration || state.checking || state.applying) return;
      if (!navigator.onLine) {
        patch({ message: 'Connect to the internet to check for updates.' });
        return;
      }
      patch({ checking: true, error: '' });
      try {
        await registration.update();
        if (registration.waiting) api.needRefresh(registration.waiting);
        else
          patch({
            message:
              'Update check requested. New builds appear here when ready.',
          });
      } catch {
        patch({
          message:
            'Could not check for updates. Your local practice is still available.',
        });
      } finally {
        patch({ checking: false });
      }
    },
    async apply() {
      if (!state.available || !state.confirming || !update || state.applying)
        return;
      patch({ applying: true, error: '' });
      try {
        await beforeApply();
        await update();
      } catch {
        patch({
          applying: false,
          error:
            'The update could not be applied safely. Your saved progress has not been removed. Try again when ready.',
        });
      }
    },
    prepareReload: () => patch({ applying: true }),
    reloadFailed: () =>
      patch({
        applying: false,
        available: true,
        confirming: true,
        dismissed: false,
        error:
          'The new build is installed, but local storage could not be checked. Reload once storage is available.',
      }),
  };
  return api;
}
export const pwaUpdates = createPwaUpdates();
