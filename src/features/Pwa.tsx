import { useSyncExternalStore } from 'react';
import { pwaUpdates } from '../application/pwa';
export const usePwaState = () =>
  useSyncExternalStore(pwaUpdates.subscribe, pwaUpdates.getSnapshot);
export function PwaNotice() {
  const state = usePwaState();
  if (!state.available || state.dismissed) return null;
  return (
    <aside className="pwa-notice no-print" aria-label="Application update">
      {state.confirming ? (
        <section role="alertdialog" aria-label="Confirm application update">
          <h2>Update Reflex English?</h2>
          <p>
            Submitted answers and saved local progress will stay. Finish
            submitting first: text you have not submitted will be lost. Other
            open app tabs may reload too.
          </p>
          <div className="word-actions">
            <button
              disabled={state.applying}
              onClick={() => pwaUpdates.apply()}
            >
              {state.applying ? 'Updating…' : 'Update now'}
            </button>
            <button
              className="secondary"
              disabled={state.applying}
              onClick={() => pwaUpdates.later()}
            >
              Later
            </button>
          </div>
          {state.error && <p role="alert">{state.error}</p>}
        </section>
      ) : (
        <div className="word-actions">
          <p>A new version is ready.</p>
          <button onClick={() => pwaUpdates.requestConfirmation()}>
            Update available
          </button>
          <button className="secondary" onClick={() => pwaUpdates.later()}>
            Later
          </button>
        </div>
      )}
    </aside>
  );
}
export function PwaStatus() {
  const state = usePwaState();
  return (
    <section className="card" aria-label="Offline and updates">
      <h2>Offline & updates</h2>
      <p>
        {state.offlineReady ? 'Ready for offline practice.' : state.message}
      </p>
      {state.offlineReady &&
        state.message !== 'Ready for offline practice.' && (
          <p className="fine">{state.message}</p>
        )}
      {state.available ? (
        <button
          disabled={state.applying}
          onClick={() => pwaUpdates.requestConfirmation()}
        >
          Update available
        </button>
      ) : (
        <button
          className="secondary"
          disabled={!state.registered || state.checking || state.applying}
          onClick={() => pwaUpdates.check()}
        >
          {state.checking ? 'Checking…' : 'Check for updates'}
        </button>
      )}
    </section>
  );
}
