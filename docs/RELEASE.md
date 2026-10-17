# Reflex English 1.0.0 release checklist

This release stabilizes the existing learning application. It adds no learning mode, curriculum system, AI, account, backend or synchronization.

## Build and target

- Repository: `JindrichProchazka/reflex-english`.
- Expected production URL: **https://JindrichProchazka.github.io/reflex-english/**.
- Node 24 LTS; install with `npm install` locally / `npm ci` in CI.
- `npm run dev`: normal localhost root (usually port 5173).
- `npm run build` then `npm run preview`: **http://localhost:4173/reflex-english/**.
- Production/preview base, manifest ID/start/scope and worker scope are `/reflex-english/`. HashRouter preserves nested routes without server rewrites.
- `.github/workflows/pages.yml` runs on pushes to main, PRs to main and manual dispatch. PRs only validate. Deployment requires main and successful dependency/lint/unit/build/browser checks. Build artifact is `dist/`; Pages deploy uses its `github-pages` environment and OIDC. Failure traces are retained for seven days.

## Required GitHub actions by the owner

The implementation is local; no commit, push, repository setting change or public deployment is implied by successful local tests.

1. Review `git status`, commit the intended application/config/docs/tests (most source files in this checkout have not yet been committed), then push **main** to origin. Ignored dependencies/build/test outputs/environment files must stay out of source control.
2. Set **Settings → Pages → Build and deployment → Source → GitHub Actions**. Ensure Actions are enabled and the github-pages environment allows main. Approve a deployment if your environment protection rules require it.
3. Watch **Actions → Validate and deploy Reflex English**. Both build and deploy must succeed. If necessary, run the workflow manually from main after setting Pages up.
4. Open the production URL shown by the deployment. A workflow file on disk does not publish anything; the initial remote Actions run and settings can only be verified after the owner performs these steps.

Reference: [GitHub Pages custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages) and [publishing-source configuration](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site). Actions versions were checked against the official repositories/docs during implementation.

## PWA and safe updates

The production Workbox service worker precaches the shell, every built-in lesson, lazy feature bundles, icons and manifest. Initial online loading prepares the offline copy. Hash routes reopen from the cached shell. IndexedDB remains the source of learning history; assets and learning records have separate lifecycles.

Registration, returning to a visible app, returning online and hourly checks discover new builds. Data / Backup provides a manual check. While the app remains open, waiting workers wait for Update available → Update now; Later postpones activation. When all old app tabs close, the browser can activate a waiting worker normally for the next opening. Unsubmitted text may be lost on reload; saved answers/progress remain. Other app tabs can reload after a confirmed activation.

Before activation and reload, a read transaction spanning all learning tables waits behind pending writes; the current UI is inert during this transition. No update calls database deletion or clears learning tables. A native controller-change handler covers first-install-page and cross-tab update cases independently of Workbox's initial-install classification. Registration/update failures do not make local learning require a network. An already active worker is recognized as offline-ready on reopening.

The real update test creates two independently generated Workbox precache builds from the production artifact at one static-server origin. Only a test marker in the HTML differs. It installs build A, creates personal vocabulary and a learning attempt, serves build B, verifies no activation/reload before confirmation, confirms, observes build B's shell, resumes the saved session, verifies data and reloads again with the test server disconnected. The test server is a test fixture, not an application backend or deployment requirement.

## iPhone polish and installation

Viewport permits zoom and uses viewport-fit=cover. Native safe-area insets pad the header/sides/bottom. Form fields have normal readable text, manual answers disable autocorrection, controls wrap and important touch controls are at least 44px. Focus visibility follows the browser's VisualViewport resize/focus events without user-agent detection or fixed keyboard heights. Printer-specific A4 styles hide navigation/update controls and remain distinct from mobile screens.

Apple metadata names the Home Screen app Reflex and enables supported standalone display. A 180px Apple touch icon, normal 192/512px PNGs, a maskable 512px icon and SVG are shipped. The repository vector mark can be rerendered with `npm run icons` after installing Playwright Chromium; no image service is involved.

After publication, perform this physical-iPhone check:

1. Open the exact HTTPS production URL in Safari.
2. Tap Share (or Safari's menu then Share), choose Add to Home Screen, leave Open as Web App enabled if offered, and tap Add.
3. Launch Reflex from the Home Screen. Confirm version 1.0.0 in Data / Backup and wait for offline readiness while online.
4. Visit Home, Lessons/Learn, Vocabulary Test, Use in Context, Weak Areas, personal vocabulary, Printable Practice configuration and Data / Backup. Check notch/Dynamic Island/home-indicator spacing, portrait/landscape, readable wrapping and touch targets.
5. Type an answer with the physical software keyboard open. Confirm the field remains visible, submit an incorrect answer, inspect the hint/correction, and continue practice. Check the Czech keyboard too.
6. Export JSON to Files. If moving existing data, import the intended JSON into this app, inspect the summary, confirm replacement and verify restored progress. Backups replace rather than merge. Keep the temporary safety copy if needed.
7. Complete an answer, close the app, enable Airplane Mode and reopen Reflex from Home Screen. Confirm saved progress, open built-in lessons and save another local answer; reopen again. Disable Airplane Mode afterward.
8. On a later deployment, verify the update action waits for confirmation and progress remains after accepting it.

Playwright WebKit emulates Safari's engine and iPhone sizes, but cannot verify actual Add to Home Screen, Dynamic Island hardware, OS storage eviction, the real iOS keyboard or Files/share dialogs. Those remain on-device checks, not claims made by automated tests.

## Data movement and V1 limits

Data is local to each browser/device/origin. Desktop, iPhone and localhost/public hosting do not synchronize. Use JSON export/import to protect or transfer progress; verify the destination installation after import. Browser clearing/private browsing/eviction may remove local data. No account or cloud copy can recover data without a retained backup. Import is replacement-only, at most 50 MB, in memory and unencrypted.

Existing controlled vocabulary/context evaluation, manual paper grading and mastery rules are unchanged. This release does not claim arbitrary semantic evaluation or certified CEFR proficiency. Physical iPhone installation and the actual GitHub-hosted release must be checked after publishing.

## Automated release commands

Local release verification completed on 2026-10-17: lint passed, all 104 unit/integration tests passed, production build passed, and all 75 Playwright tests passed across desktop Chromium, Pixel-sized Chromium and iPhone-sized WebKit at 375/390/430 px. The real waiting-worker update test also passed twice at each iPhone size (six additional checks). A separate localhost-development smoke check passed at the root path with service workers disabled. These are local results, not a claim of public deployment or physical-iPhone verification.

```sh
npm run lint
npm test
npm run build
npx playwright install chromium webkit
npm run test:e2e
```

The regression matrix uses a separate project-path preview on port 4186, isolated test contexts and test-only update servers. It covers Home, IN / ON / AT correction/retry/completion, lesson Learn, both recall directions, context completion, Weak Areas, personal vocabulary, A4 print/key/results, full backup replacement/reload, manifest/icons/scope, nested hash route refresh, offline reopening/writing, and confirmed updates with retained records. Desktop/Pixel Chromium and WebKit at 375/390/430 px all run the learning flows. Native PDF export is tested in Chromium; all engines inspect print CSS and paper interactions.
