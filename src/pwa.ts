import { registerSW } from 'virtual:pwa-register';
import { db } from './data/database';
import { pwaUpdates } from './application/pwa';

async function waitForLocalWrites() {
  // A transaction spanning every table waits for in-flight learning/import
  // writes. Updating assets never clears databases or learning records.
  await db.transaction('r', db.tables, async () => {
    await Promise.all(db.tables.map((table) => table.count()));
  });
}
export function registerOfflineApp() {
  if (!import.meta.env.PROD) {
    pwaUpdates.unavailable(
      'Offline installation is enabled in the production build.',
    );
    return;
  }
  if (!('serviceWorker' in navigator)) {
    pwaUpdates.unavailable(
      'This browser does not support offline installation.',
    );
    return;
  }
  let controller = navigator.serviceWorker.controller;
  let reloading = false;
  let registered: ServiceWorkerRegistration | undefined;
  const reloadSafely = async () => {
    if (reloading) return;
    reloading = true;
    pwaUpdates.prepareReload();
    try {
      await waitForLocalWrites();
      window.location.reload();
    } catch {
      reloading = false;
      pwaUpdates.reloadFailed();
    }
  };
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    const previous = controller;
    controller = navigator.serviceWorker.controller;
    // Workbox's isUpdate flag can still be false on a page that installed its
    // FIRST worker earlier in this same visit. A subsequent controller change
    // is nevertheless a real update, and must reload the new cached shell.
    if (previous && controller && previous !== controller) void reloadSafely();
  });
  const update = registerSW({
    immediate: true,
    onNeedRefresh: () => pwaUpdates.needRefresh(registered?.waiting),
    onOfflineReady: () => pwaUpdates.ready(),
    onRegisteredSW: (_url, registration) => {
      registered = registration;
      if (registration) {
        pwaUpdates.registered(registration);
        if (registration.active?.state === 'activated') pwaUpdates.ready();
      }
    },
    onRegisterError: () =>
      navigator.serviceWorker.controller
        ? pwaUpdates.ready()
        : pwaUpdates.registrationError(),
    onNeedReload: reloadSafely,
  });
  pwaUpdates.configure(async () => {
    if (!registered?.waiting)
      throw new Error('No installed update is waiting.');
    await update();
  }, waitForLocalWrites);
  // Reopening/focusing the installed app and returning online check for a new
  // build. Long-running tabs also check hourly, without reloading mid-practice.
  const check = () => {
    if (document.visibilityState === 'visible' && navigator.onLine)
      void pwaUpdates.check();
  };
  window.addEventListener('online', check);
  document.addEventListener('visibilitychange', check);
  window.setInterval(check, 60 * 60 * 1000);
}
