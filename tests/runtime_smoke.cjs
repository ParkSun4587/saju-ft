const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const diagnostics = [];
  page.on('console', msg => {
    if (msg.type() === 'error' || msg.type() === 'warning') diagnostics.push(`[console:${msg.type()}] ${msg.text()}`);
  });
  page.on('pageerror', err => diagnostics.push(`[pageerror] ${err.stack || err.message}`));
  page.on('requestfailed', req => diagnostics.push(`[requestfailed] ${req.url()} :: ${req.failure()?.errorText || ''}`));

  await page.goto('http://127.0.0.1:4173/index.html', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForFunction(() =>
    typeof window.calculateAccurateManse === 'function' &&
    typeof window.createKoreanHybridBaZi === 'function' &&
    typeof window.analyzeDayMasterStrengthV2 === 'function',
    null,
    { timeout: 60000 }
  );

  const globals = await page.evaluate(() => ({
    Solar: typeof window.Solar,
    KoreanLunarCalendar: typeof window.KoreanLunarCalendar,
    calculateAccurateManse: typeof window.calculateAccurateManse,
    createKoreanHybridBaZi: typeof window.createKoreanHybridBaZi,
    analyzeDayMasterStrengthV2: typeof window.analyzeDayMasterStrengthV2,
  }));
  console.log('GLOBALS', JSON.stringify(globals));

  const result = await page.evaluate(() => {
    const run = (label, fn) => {
      try {
        const value = fn();
        return {
          label,
          ok: true,
          keys: value && typeof value === 'object' ? Object.keys(value) : [],
          calendarMeta: value?.calendarMeta || null,
          strength: value?.strength || value?.strengthV2?.verdict || null,
          gyeokguk: value?.gyeokguk?.name || null,
        };
      } catch (e) {
        return { label, ok: false, error: e?.message || String(e), stack: e?.stack || '' };
      }
    };
    return [
      run('hybrid-1998-02-21-0310', () => window.createKoreanHybridBaZi(1998, 2, 21, 3, 10, true)),
      run('manse-1998-02-21-0310', () => window.calculateAccurateManse(1998, 2, 21, '03:10', 'male')),
      run('manse-1998-02-21-unknown', () => window.calculateAccurateManse(1998, 2, 21, null, 'male')),
      run('manse-2000-01-01-2300', () => window.calculateAccurateManse(2000, 1, 1, '23:00', 'male')),
    ];
  });

  console.log('RESULTS', JSON.stringify(result, null, 2));
  if (diagnostics.length) console.log('DIAGNOSTICS\n' + diagnostics.join('\n'));

  const failed = result.filter(x => !x.ok);
  await browser.close();
  if (failed.length) {
    console.error('SMOKE_FAILED', JSON.stringify(failed, null, 2));
    process.exit(1);
  }
  console.log('SMOKE_PASS');
})().catch(err => {
  console.error(err.stack || err);
  process.exit(1);
});

// rerun marker: runtime-order-fix
