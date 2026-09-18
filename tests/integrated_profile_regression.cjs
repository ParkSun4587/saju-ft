const { chromium } = require('playwright');

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(`[pageerror] ${e.stack || e.message}`));
  page.on('console', m => { if (m.type() === 'error') errors.push(`[console] ${m.text()}`); });
  await page.goto('http://127.0.0.1:4173/index.html', { waitUntil: 'load' });
  await page.waitForFunction(() => typeof buildIntegratedSajuProfile === 'function' && typeof generateConcernNotes === 'function');

  const result = await page.evaluate(() => {
    window.gtag = () => {};
    const exact = calculateAccurateManse(1998, 2, 21, '03:10', 'female');
    const other = calculateAccurateManse(1990, 1, 2, '12:00', 'female');
    const concerns = ['money','career','love','path','people','mental'];

    function prepare(r, concern) {
      return {
        ...r,
        concernKey: concern,
        userBirthStr: '19980221',
        userTimeKey: '03:10',
        userGender: 'female',
        userCalendar: 'solar',
        rawSolutionTemplate: {
          F: { acts: [{d:'a'},{d:'b'}] },
          T: { acts: [{d:'a'},{d:'b'}] },
        },
      };
    }

    const exactProfile = buildIntegratedSajuProfile(prepare(exact, 'love'));
    renderOhengDistribution(
      exact.elements,
      exact.pillars.day.gan,
      exact.dayOheng,
      exact.pillars,
      exact.elementProfiles || exact.analysisProfile?.elementProfiles || null,
      'F',
    );
    const ohengCards = [...document.querySelectorAll('#ohengBarContainer > div')]
      .map((el) => el.innerText.replace(/\s+/g, ' ').trim());
    const ohengSummaryF = document.getElementById('ohengSummaryTxt')?.innerText || '';
    renderOhengDistribution(
      exact.elements,
      exact.pillars.day.gan,
      exact.dayOheng,
      exact.pillars,
      exact.elementProfiles || exact.analysisProfile?.elementProfiles || null,
      'T',
    );
    const ohengSummaryT = document.getElementById('ohengSummaryTxt')?.innerText || '';

    const otherProfile = buildIntegratedSajuProfile({
      ...other,
      concernKey: 'love',
      userBirthStr: '19900102',
      userTimeKey: '12:00',
      userGender: 'female',
      userCalendar: 'solar',
      rawSolutionTemplate: {
        F: { acts: [{d:'a'},{d:'b'}] },
        T: { acts: [{d:'a'},{d:'b'}] },
      },
    });

    const rows = [];
    for (const concern of concerns) {
      for (const mode of ['F','T']) {
        const data = prepare(exact, concern);
        const base = generateConcernNotes.__base ? generateConcernNotes.__base(data, mode) : null;
        const notes = generateConcernNotes(data, mode);
        rows.push({
          concern,
          mode,
          count: notes.length,
          enriched: !!base && notes.slice(0, 5).every((n, i) => (n.desc || '').length > (base[i]?.desc || '').length) && !!notes[5]?.__timingQA?.profileFingerprint,
          fingerprint: data.integratedSajuProfile?.fingerprint || '',
          missing: data.integratedSajuProfile?.audit?.missing || [],
          text: notes.map(n => `${n.title}\n${n.desc}\n${n.checklist || ''}`).join('\n'),
          descs: notes.map(n => n.desc || ''),
        });
      }
    }

    const a = prepare(exact, 'career');
    const b = {
      ...other,
      concernKey: 'career',
      userBirthStr: '19900102',
      userTimeKey: '12:00',
      userGender: 'female',
      userCalendar: 'solar',
      rawSolutionTemplate: {
        F: { acts: [{d:'a'},{d:'b'}] },
        T: { acts: [{d:'a'},{d:'b'}] },
      },
    };
    const notesA = generateConcernNotes(a, 'F');
    const notesB = generateConcernNotes(b, 'F');
    let diffCount = 0;
    for (let i = 0; i < 6; i++) if (notesA[i].desc !== notesB[i].desc) diffCount++;

    return {
      engine: window.__INTEGRATED_SAJU_PROFILE_V1__,
      wrapper: !!generateConcernNotes.__integratedProfileWrapped,
      exactPillars: [exact.pillars.year.gan + exact.pillars.year.zhi, exact.pillars.month.gan + exact.pillars.month.zhi, exact.pillars.day.gan + exact.pillars.day.zhi, exact.pillars.hour.gan + exact.pillars.hour.zhi],
      exactRaw: exact.elementProfiles.raw,
      ohengCards,
      ohengSummaryF,
      ohengSummaryT,
      exactProfile,
      otherFingerprint: otherProfile.fingerprint,
      rows,
      diffCount,
    };
  });

  assert(result.engine?.version === '1.0.0', 'integrated profile engine version missing');
  assert(result.wrapper, 'generateConcernNotes wrapper not installed');
  assert(result.exactPillars.join(',') === '戊寅,甲寅,己亥,乙丑', `exact pillars drift: ${result.exactPillars.join(',')}`);
  assert(JSON.stringify(result.exactRaw) === JSON.stringify({mok:4,hwa:0,to:3,geum:0,su:1}), `exact raw elements drift: ${JSON.stringify(result.exactRaw)}`);
  assert(result.ohengCards.length === 5, `oheng card count ${result.ohengCards.length}`);
  assert(result.ohengCards[1].includes('(0개)') && result.ohengCards[1].includes('0%'), `zero fire must display 0%: ${result.ohengCards[1]}`);
  assert(result.ohengCards[3].includes('(0개)') && result.ohengCards[3].includes('0%'), `zero metal must display 0%: ${result.ohengCards[3]}`);
  assert(result.ohengSummaryF.includes('언니가 보기엔') && !result.ohengSummaryF.includes('로아가'), `F oheng generic sister voice missing: ${result.ohengSummaryF}`);
  assert(result.ohengSummaryT.includes('언니가 딱 정리하면') && !result.ohengSummaryT.includes('서아가'), `T oheng generic sister voice missing: ${result.ohengSummaryT}`);
  assert(!/(이 공백|누수)/.test(result.ohengSummaryF + result.ohengSummaryT), 'stiff oheng copy leaked');
  assert(result.exactProfile.fingerprint !== result.otherFingerprint, 'different charts share integrated fingerprint');
  assert(result.exactProfile.audit.missing.length === 0, `semantic layer coverage missing: ${result.exactProfile.audit.missing.join(',')}`);
  assert(result.rows.length === 12, `expected 12 concern/mode rows, got ${result.rows.length}`);

  const jargon = /(신강|신약|중화|격국|용신|상신|기신|지장간|월령|조후|통관|사령)/;
  for (const row of result.rows) {
    assert(row.count === 6, `${row.concern}/${row.mode}: expected six notes`);
    assert(row.enriched, `${row.concern}/${row.mode}: not all notes consumed integrated profile`);
    assert(row.fingerprint, `${row.concern}/${row.mode}: integrated fingerprint missing`);
    assert(row.missing.length === 0, `${row.concern}/${row.mode}: missing semantic layers ${row.missing.join(',')}`);
    assert(!jargon.test(row.text), `${row.concern}/${row.mode}: hard saju jargon leaked into user copy`);
    assert(!/(undefined|NaN|null)/.test(row.text), `${row.concern}/${row.mode}: bad token leaked`);
  }
  assert(result.diffCount >= 5, `personalization too weak: only ${result.diffCount}/6 NOTE descs differ across charts`);
  assert(errors.length === 0, `browser errors: ${errors.join(' | ')}`);

  console.log('INTEGRATED_PROFILE_PASS', JSON.stringify({
    version: result.engine.version,
    exactFingerprint: result.exactProfile.fingerprint,
    semanticLayers: result.exactProfile.audit.semanticLayers.length,
    differentChartNotes: result.diffCount,
    rows: result.rows.length,
  }));
  await browser.close();
})().catch(err => {
  console.error(err.stack || err);
  process.exit(1);
});
