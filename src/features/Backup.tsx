import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../data/database';
import { APP_VERSION } from '../config';
import { PwaStatus } from './Pwa';
import { announceRestore } from '../application/data-events';
import { backupSummary, parseBackup, type Backup } from '../domain/backup';
import {
  exportBackup,
  localDataStatus,
  markExported,
  personalVocabularyCsv,
  restoreBackup,
} from '../application/backup';

function download(text: string, name: string, type = 'application/json') {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = name;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function downloadJson(backup: Backup, safety = false) {
  download(
    JSON.stringify(backup, null, 2),
    `reflex-english-${safety ? 'safety-' : ''}${backup.exportedAt.replaceAll(':', '-')}.json`,
  );
}
function Summary({ backup }: { backup: Backup }) {
  const summary = backupSummary(backup);
  return (
    <ul aria-label="Backup contents">
      {Object.entries(summary).map(([name, count]) => (
        <li key={name}>
          {name === 'lessonProgress'
            ? 'Lesson progress records'
            : name === 'worksheetResults'
              ? 'Worksheet results'
              : name[0].toUpperCase() + name.slice(1)}
          : {count}
        </li>
      ))}
    </ul>
  );
}
export function BackupPage() {
  const [status, setStatus] =
    useState<Awaited<ReturnType<typeof localDataStatus>>>();
  const [candidate, setCandidate] = useState<Backup>();
  const [safety, setSafety] = useState<Backup>();
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let active = true;
    localDataStatus(db)
      .then((s) => {
        if (active) setStatus(s);
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, []);
  async function exportFile(csv = false) {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      const backup = await exportBackup(db);
      if (csv)
        download(
          personalVocabularyCsv(backup),
          'reflex-english-personal-vocabulary.csv',
          'text/csv;charset=utf-8',
        );
      else {
        downloadJson(backup);
        await markExported(db, backup.exportedAt);
      }
      setStatus(await localDataStatus(db));
      setNotice(
        csv
          ? 'Personal vocabulary CSV prepared.'
          : 'Backup download prepared. Keep the JSON file somewhere safe.',
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function selectFile(file?: File) {
    if (busy) return;
    setCandidate(undefined);
    setNotice('');
    setError('');
    if (!file) return;
    setBusy(true);
    try {
      if (file.size > 50 * 1024 * 1024)
        throw new Error('Choose a backup smaller than 50 MB.');
      setCandidate(parseBackup(await file.text()));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function replace() {
    if (busy || !candidate) return;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const verified = await restoreBackup(db, candidate, {
        confirmed: true,
        onSafetyBackup: setSafety,
      });
      // Other pages read IndexedDB on mount; this page refreshes its state now.
      setCandidate(undefined);
      setStatus({
        backup: verified,
        lastExport: verified.data.settings.find(
          (s) => s.key === 'lastBackupExportAt',
        )?.value,
      });
      setNotice(
        'Backup restored successfully. Restored local data has been verified.',
      );
      announceRestore();
    } catch (e) {
      setError(`Restore failed. ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section>
      <Link to="/">← Home</Link>
      <p className="eyebrow">YOUR LOCAL LEARNING DATA</p>
      <h1>Data / Backup</h1>
      <p className="fine">Reflex English · Version {APP_VERSION}</p>
      <p>
        Your progress lives in this browser. Export a JSON backup to keep a copy
        outside it.
      </p>
      <p>
        Back up occasionally, especially before changing devices or clearing
        browser data. Desktop and iPhone progress do not automatically
        synchronize. Use JSON export/import to move a copy.
      </p>
      <PwaStatus />
      <section className="card" aria-label="Current local data">
        <h2>Current local data</h2>
        {status ? (
          <>
            <Summary backup={status.backup} />
            <p>
              Last export:{' '}
              {typeof status.lastExport === 'string'
                ? new Date(status.lastExport).toLocaleString()
                : 'Not yet exported'}
            </p>
          </>
        ) : (
          <p>Reading local data…</p>
        )}
        <div className="word-actions">
          <button disabled={busy || !status} onClick={() => exportFile()}>
            Export backup
          </button>
          <button
            className="secondary"
            disabled={busy || !status}
            onClick={() => exportFile(true)}
          >
            Export personal vocabulary CSV
          </button>
        </div>
      </section>
      <section className="card">
        <h2>Import backup</h2>
        <p>
          Select a Reflex English JSON backup. You can review it before
          replacing anything.
        </p>
        <label htmlFor="backup-file">Import backup</label>
        <input
          id="backup-file"
          type="file"
          accept=".json,application/json"
          disabled={busy}
          onChange={(e) => {
            void selectFile(e.target.files?.[0]);
            e.target.value = '';
          }}
        />
      </section>
      {candidate && (
        <section className="card" role="region" aria-label="Restore preview">
          <h2>Review backup before restoring</h2>
          <p>
            Exported {new Date(candidate.exportedAt).toLocaleString()} · App{' '}
            {candidate.appVersion} · Schema {candidate.schemaVersion} · Data{' '}
            {candidate.dataVersion}
          </p>
          <Summary backup={candidate} />
          <p>
            <strong>All current local learning data will be replaced.</strong>{' '}
            This includes personal words, progress, history, worksheets and
            settings. No merging is performed.
          </p>
          <p>
            A temporary safety backup of the current data will be held in this
            tab. Download it before closing or reloading the tab.
          </p>
          <div className="word-actions">
            <button disabled={busy} onClick={replace}>
              Replace current local learning data
            </button>
            <button
              className="secondary"
              disabled={busy}
              onClick={() => {
                setCandidate(undefined);
                setNotice('Import cancelled. Your local data was not changed.');
              }}
            >
              Cancel
            </button>
          </div>
        </section>
      )}
      {safety && (
        <section className="card">
          <h2>Before-restore safety backup</h2>
          <p>
            This copy is held in memory until you leave this page. It can be
            imported like any other backup.
          </p>
          <button disabled={busy} onClick={() => downloadJson(safety, true)}>
            Download safety backup
          </button>
        </section>
      )}
      <p role="status" aria-live="polite">
        {busy ? 'Working…' : notice}
      </p>
      {error && <p role="alert">{error}</p>}
    </section>
  );
}
