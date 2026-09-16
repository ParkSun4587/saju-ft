const { chromium } = require('playwright');

const BASE = 'http://127.0.0.1:4173/index.html';
const CONCERN_LABELS = {
  money: '재물·돈복',
  career: '학업·커리어',
  love: '연애·썸',
  path: '진로·미래',
  people: '인간관계',
  mental: '번아웃·멘탈',
};

function assert(cond, message) {
  if (!cond) throw new Error(message);
}

function badText(value) {
  const s = String(value ?? '');
  return /(^|[^가-힣a-zA-Z])(undefined|NaN)([^가-힣a-zA-Z]|$)/.test(s);
}

const CASES = [
  { id: 'user-exact-love-F', birth: '19980221', time: '0310', gender: 'male', calendar: 'solar', leap: false, concern: 'love', mode: 'F', viewport: { width: 390, height: 844 } },
  { id: 'user-unknown-love-T', birth: '19980221', time: 'unknown', gender: 'male', calendar: 'solar', leap: false, concern: 'love', mode: 'T', viewport: { width: 390, height: 844 } },
  { id: 'money-female-F', birth: '19991231', time: '2359', gender: 'female', calendar: 'solar', leap: false, concern: 'money', mode: 'F', viewport: { width: 390, height: 844 } },
  { id: 'career-female-T', birth: '20010506', time: '1430', gender: 'female', calendar: 'solar', leap: false, concern: 'career', mode: 'T', viewport: { width: 1280, height: 900 } },
  { id: 'path-lunar-regular-F', birth: '19560121', time: '1200', gender: 'male', calendar: 'lunar', leap: false, concern: 'path', mode: 'F', viewport: { width: 390, height: 844 } },
  { id: 'people-lunar-leap-T', birth: '20170501', time: '2300', gender: 'female', calendar: 'lunar', leap: true, concern: 'people', mode: 'T', viewport: { width: 390, height: 844 } },
  { id: 'mental-dst-F', birth: '19880701', time: '1200', gender: 'male', calendar: 'solar', leap: false, concern: 'mental', mode: 'F', viewport: { width: 390, height: 844 } },
  { id: 'love-female-T', birth: '19940517', time: '0815', gender: 'female', calendar: 'solar', leap: false, concern: 'love', mode: 'T', viewport: { width: 390, height: 844 } },
];

async function waitForApp(page) {
  await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForFunction(() =>
    typeof window.startAnalysis === 'function' &&
    typeof window.calculateAccurateManse === 'function' &&
    typeof window.createKoreanHybridBaZi === 'function' &&
    typeof window.generateConcernNotes === 'function' &&
    typeof window.buildNoteOneInsight === 'function' &&
    typeof window.buildNoteTwoPattern === 'function' &&
    typeof window.analyzeDayMasterStrengthV2 === 'function',
    null,
    { timeout: 60000 },
  );
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const diagnostics = [];

  // 1) Core runtime + known boundary cases in the actual browser environment.
  {
    const page = await context.newPage();
    page.on('pageerror', (e) => diagnostics.push(`[core pageerror] ${e.stack || e.message}`));
    page.on('console', (m) => {
      if (m.type() === 'error') diagnostics.push(`[core console] ${m.text()}`);
    });
    await waitForApp(page);
    const core = await page.evaluate(() => {
      const exact = calculateAccurateManse(1998, 2, 21, '03:10', 'male');
      const unknown = calculateAccurateManse(1998, 2, 21, null, 'male');
      const lateZi = calculateAccurateManse(2000, 1, 1, '23:00', 'male');
      const leap = koreanLunarToSolar(2017, 5, 1, true);
      const regular = koreanLunarToSolar(1956, 1, 21, false);
      let boundaryCode = '';
      let boundaryMessage = '';
      try {
        calculateAccurateManse(2026, 2, 4, null, 'female');
      } catch (e) {
        boundaryCode = e.code || '';
        boundaryMessage = e.message || '';
      }
      return {
        exact: {
          year: exact.pillars.year.gan + exact.pillars.year.zhi,
          month: exact.pillars.month.gan + exact.pillars.month.zhi,
          day: exact.pillars.day.gan + exact.pillars.day.zhi,
          hour: exact.pillars.hour ? exact.pillars.hour.gan + exact.pillars.hour.zhi : null,
          strength: exact.analysisProfile?.dayMaster?.strength,
          gyeok: exact.gyeokguk?.name,
          yongshin: exact.yongshin,
          tz: exact.calendarMeta?.timeZone,
        },
        unknown: {
          hour: unknown.pillars.hour,
          hourKnown: unknown.calendarMeta?.hourKnown,
          strength: unknown.analysisProfile?.dayMaster?.strength,
          gyeok: unknown.gyeokguk?.name,
        },
        lateZi: {
          day: lateZi.pillars.day.gan + lateZi.pillars.day.zhi,
          hour: lateZi.pillars.hour.gan + lateZi.pillars.hour.zhi,
        },
        leap,
        regular,
        boundaryCode,
        boundaryMessage,
      };
    });

    assert(core.exact.year === '戊寅', `1998 exact year pillar drift: ${core.exact.year}`);
    assert(core.exact.month === '甲寅', `1998 exact month pillar drift: ${core.exact.month}`);
    assert(['신강', '중화', '신약'].includes(core.exact.strength), `invalid strength ${core.exact.strength}`);
    assert(core.exact.gyeok === '정관격', `1998 gyeok regression: ${core.exact.gyeok}`);
    assert(core.exact.yongshin, '1998 yongshin missing');
    assert(core.exact.tz === 'Asia/Seoul', `timezone drift: ${core.exact.tz}`);
    assert(core.unknown.hour === null, 'unknown-time result leaked a fake hour pillar');
    assert(core.unknown.hourKnown === false, 'unknown-time calendarMeta.hourKnown must be false');
    assert(core.lateZi.hour === '甲子', `23:00 hour regression: ${core.lateZi.hour}`);
    assert(core.leap.year === 2017 && core.leap.month === 6 && core.leap.day === 24, `leap lunar regression: ${JSON.stringify(core.leap)}`);
    assert(core.regular.year === 1956 && core.regular.month === 3 && core.regular.day === 3, `regular lunar regression: ${JSON.stringify(core.regular)}`);
    assert(core.boundaryCode === 'KST_TERM_TIME_REQUIRED', `unknown term-boundary must be specifically blocked, got ${core.boundaryCode}: ${core.boundaryMessage}`);
    await page.close();
    console.log('CORE_PASS', JSON.stringify(core));
  }

  // 2) Real UI flow: form fields -> startAnalysis -> result render -> all six notes.
  const caseReports = [];
  for (const c of CASES) {
    const page = await context.newPage();
    await page.setViewportSize(c.viewport);
    const localDiagnostics = [];
    page.on('pageerror', (e) => localDiagnostics.push(`[pageerror] ${e.stack || e.message}`));
    page.on('console', (m) => {
      if (m.type() === 'error') localDiagnostics.push(`[console] ${m.text()}`);
    });

    await waitForApp(page);
    const report = await page.evaluate((c) => {
      // The production path uses delayed chat animation. Run the same callbacks immediately
      // so CI validates the complete path without sleeping several seconds per case.
      window.gtag = () => {};
      window.setTimeout = (fn) => {
        fn();
        return 1;
      };
      window.clearTimeout = () => {};

      document.getElementById('nameInput').value = '박태양';
      document.getElementById('selectedConcernKey').value = c.concern;
      document.getElementById('birthDateInput').value = c.birth;
      document.getElementById('calendarSelect').value = c.calendar;
      document.getElementById('genderValue').value = c.gender;

      const unknown = c.time === 'unknown';
      const timeInput = document.getElementById('birthTimeInput');
      const unknownBox = document.getElementById('birthTimeUnknown');
      unknownBox.checked = unknown;
      timeInput.value = unknown ? '' : c.time;
      toggleBirthTimeUnknown(unknownBox, false);

      const leap = document.getElementById('leapMonthCheck');
      if (leap) leap.checked = !!c.leap;

      startAnalysis(c.mode);

      const data = currentResultData;
      if (!data) return { ok: false, reason: 'currentResultData missing', body: document.body.innerText.slice(-800) };

      const notes = generateConcernNotes(data, c.mode);
      const note1 = buildNoteOneInsight(data, c.concern, CONCERN_LABELS[c.concern], c.mode === 'T');
      const note2 = buildNoteTwoPattern(data, c.concern, CONCERN_LABELS[c.concern], c.mode === 'T');
      const notesJson = JSON.stringify(notes);
      const note12Json = JSON.stringify([note1, note2]);
      const visible = document.body.innerText;

      return {
        ok: true,
        mbtiKey: data.mbtiKey,
        concern: data.concernKey,
        mode: data.currentMode,
        calendar: data.userCalendar,
        leap: data.isLeapMonth,
        hourKnown: data.calendarMeta?.hourKnown,
        timeZone: data.calendarMeta?.timeZone,
        strength: data.analysisProfile?.dayMaster?.strength,
        strengthRatio: data.analysisProfile?.dayMaster?.supportRatio,
        gyeok: data.gyeokguk?.name,
        gyeokStatus: data.gyeokStatus?.status,
        yongshin: data.yongshin,
        classicalJapyeong: !!data.analysisProfile?.classical?.japyeong,
        classicalJeokcheon: !!data.analysisProfile?.classical?.jeokcheon,
        classicalQiongtong: !!data.analysisProfile?.classical?.qiongtong,
        noteCount: Array.isArray(notes) ? notes.length : -1,
        noteNums: Array.isArray(notes) ? notes.map((n) => n.themeNum) : [],
        note1Title: note1?.title || '',
        note2Title: note2?.title || '',
        note1HasEvidence: !!note1?.evidence,
        note2HasEvidence: !!note2?.evidence,
        badNoteText: /(^|[^가-힣a-zA-Z])(undefined|NaN)([^가-힣a-zA-Z]|$)/.test(notesJson + note12Json),
        visibleFailureToast: visible.includes('만세력 연산에 실패했습니다') || visible.includes('연산 중 오류가 발생했습니다'),
        resultViewVisible: !document.getElementById('resultView')?.classList.contains('hidden'),
        premiumBuffered: !!premiumBuffer,
      };
    }, c);

    caseReports.push({ id: c.id, report, diagnostics: localDiagnostics });
    assert(report.ok, `${c.id}: ${report.reason || 'UI flow failed'}`);
    assert(report.concern === c.concern, `${c.id}: concern drift ${report.concern}`);
    assert(report.mode === c.mode, `${c.id}: mode drift ${report.mode}`);
    assert(report.calendar === c.calendar, `${c.id}: calendar drift ${report.calendar}`);
    assert(report.timeZone === 'Asia/Seoul', `${c.id}: timezone missing ${report.timeZone}`);
    assert(['신강', '중화', '신약'].includes(report.strength), `${c.id}: invalid strength ${report.strength}`);
    assert(Number.isFinite(report.strengthRatio), `${c.id}: support ratio invalid ${report.strengthRatio}`);
    assert(report.gyeok, `${c.id}: gyeok missing`);
    assert(report.yongshin, `${c.id}: yongshin missing`);
    assert(report.classicalJapyeong && report.classicalJeokcheon && report.classicalQiongtong, `${c.id}: classical layer missing`);
    assert(report.noteCount === 6, `${c.id}: expected 6 notes, got ${report.noteCount}`);
    assert(report.noteNums.join(',') === '01,02,03,04,05,06', `${c.id}: note numbering broken ${report.noteNums.join(',')}`);
    assert(report.note1Title && report.note2Title, `${c.id}: NOTE1/2 title missing`);
    assert(report.note1HasEvidence && report.note2HasEvidence, `${c.id}: NOTE1/2 evidence missing`);
    assert(!report.badNoteText, `${c.id}: undefined/NaN leaked into note text`);
    assert(!report.visibleFailureToast, `${c.id}: generic calculation failure shown`);
    assert(report.resultViewVisible, `${c.id}: result view not visible after analysis`);
    assert(report.premiumBuffered, `${c.id}: paid report buffer was not generated`);
    assert(localDiagnostics.length === 0, `${c.id}: browser errors: ${localDiagnostics.join(' | ')}`);
    await page.close();
  }

  console.log('UI_CASES_PASS', JSON.stringify(caseReports, null, 2));

  // 3) Invalid UI inputs should be rejected without crashing the page.
  {
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await waitForApp(page);
    const invalid = await page.evaluate(() => {
      window.gtag = () => {};
      document.getElementById('nameInput').value = '테스트';
      document.getElementById('selectedConcernKey').value = 'money';
      document.getElementById('calendarSelect').value = 'lunar';
      document.getElementById('genderValue').value = 'female';
      document.getElementById('birthDateInput').value = '20170301';
      document.getElementById('birthTimeInput').value = '1200';
      document.getElementById('birthTimeUnknown').checked = false;
      document.getElementById('leapMonthCheck').checked = true;
      startAnalysis('F');
      return {
        stillNoResult: currentResultData === null,
        text: document.body.innerText,
      };
    });
    assert(invalid.stillNoResult, 'invalid leap lunar date unexpectedly produced a result');
    assert(errors.length === 0, `invalid input caused pageerror: ${errors.join(' | ')}`);
    await page.close();
  }

  if (diagnostics.length) {
    throw new Error(`Core browser diagnostics: ${diagnostics.join(' | ')}`);
  }

  await browser.close();
  console.log('PRE_NOTE3_BROWSER_REGRESSION_PASS');
})().catch((err) => {
  console.error(err.stack || err);
  process.exit(1);
});
