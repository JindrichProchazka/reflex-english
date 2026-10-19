import { createServer } from 'vite';
import { writeFile } from 'node:fs/promises';

// Reuse the installed TypeScript transformer; no listening server or new dependency.
const server = await createServer({
  configFile: false,
  optimizeDeps: { noDiscovery: true, entries: [] },
  server: { middlewareMode: true },
  appType: 'custom',
});
try {
  const { drills } = await server.ssrLoadModule('/src/content/drills.ts');
  const { validateDrillContent } = await server.ssrLoadModule(
    '/src/content/drill-validation.ts',
  );
  const report = validateDrillContent(drills);
  await writeFile(
    'docs/DRILL_BANK_REPORT.json',
    JSON.stringify(report, null, 2) + '\n',
  );
  console.log(JSON.stringify(report, null, 2));
  if (report.errors.length || report.nearDuplicates.length)
    process.exitCode = 1;
} finally {
  await server.close();
}
