// One origin per document, shared by the sender and the app listener. Different
// BroadcastChannel objects in the SAME document otherwise receive each other.
export const restoreChannel = 'reflex-data-restored';
export const dataOrigin = crypto.randomUUID();
export function announceRestore() {
  if (typeof BroadcastChannel === 'undefined') return;
  try {
    const channel = new BroadcastChannel(restoreChannel);
    channel.postMessage({ origin: dataOrigin });
    channel.close();
  } catch {
    // Notification is best effort, after a verified commit. It must never turn
    // a successful restore into a reported transaction failure.
  }
}
