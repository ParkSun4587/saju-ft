const { chromium } = require('playwright');

const BASE = 'http://127.0.0.1:4173/index.html';
const LABELS = {
  money: '재물·돈복',
  career: '학업·커리어',
  love: '연애·썸',
  path: '진로·미래',
  people: '인간관계',
  mental: '번아웃·멘탈',
};
function assert(cond, msg) { if (!cond) throw new Error(msg); }
function isExpectedBoundaryDiagnostic(text) {
  return String(text).includes('이 생일은 절기가 바뀌는 날이라 태어난 시간을 모르면');
}

const CASES = [
  { id:'user-exact-love-F', birth:'19980221', time:'0310', gender:'male', calendar:'solar', leap:false, concern:'love', mode:'F', viewport:{width:390,height:844} },
  { id:'user-unknown-love-T', birth:'19980221', time:'unknown', gender:'male', calendar:'solar', leap:false, concern:'love', mode:'T', viewport:{width:390,height:844} },
  { id:'money-female-F', birth:'19991231', time:'2359', gender:'female', calendar:'solar', leap:false, concern:'money', mode:'F', viewport:{width:390,height:844} },
  { id:'career-female-T', birth:'20010506', time:'1430', gender:'female', calendar:'solar', leap:false, concern:'career', mode:'T', viewport:{width:1280,height:900} },
  { id:'path-lunar-regular-F', birth:'19560121', time:'1200', gender:'male', calendar:'lunar', leap:false, concern:'path', mode:'F', viewport:{width:390,height:844} },
  { id:'people-lunar-leap-T', birth:'20170501', time:'2300', gender:'female', calendar:'lunar', leap:true, concern:'people', mode:'T', viewport:{width:390,height:844} },
  { id:'mental-dst-F', birth:'19880701', time:'1200', gender:'male', calendar:'solar', leap:false, concern:'mental', mode:'F', viewport:{width:390,height:844} },
  { id:'love-female-T', birth:'19940517', time:'0815', gender:'female', calendar:'solar', leap:false, concern:'love', mode:'T', viewport:{width:390,height:844} },
];

async function load(page) {
  await page.goto(BASE, {waitUntil:'domcontentloaded', timeout:60000});
  await page.waitForFunction(() =>
    typeof startAnalysis === 'function' &&
    typeof calculateAccurateManse === 'function' &&
    typeof createKoreanHybridBaZi === 'function' &&
    typeof generateConcernNotes === 'function' &&
    typeof buildNoteOneInsight === 'function' &&
    typeof buildNoteTwoPattern === 'function' &&
    typeof analyzeDayMasterStrengthV2 === 'function',
    null, {timeout:60000}
  );
}

(async () => {
  const browser = await chromium.launch({headless:true});
  const context = await browser.newContext();

  // A. Core runtime checks in the same browser environment users run.
  {
    const page = await context.newPage();
    const errs = [];
    page.on('pageerror', e => errs.push(e.stack || e.message));
    page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    await load(page);
    const r = await page.evaluate(() => {
      const exact = calculateAccurateManse(1998,2,21,'03:10','male');
      const unknown = calculateAccurateManse(1998,2,21,null,'male');
      const late = calculateAccurateManse(2000,1,1,'23:00','male');
      const leap = koreanLunarToSolar(2017,5,1,true);
      const regular = koreanLunarToSolar(1956,1,21,false);
      let boundary = {code:'', message:''};
      try { calculateAccurateManse(2026,2,4,null,'female'); }
      catch (e) { boundary = {code:e.code || '', message:e.message || ''}; }
      return {
        exact: {
          year: exact.pillars.year.gan + exact.pillars.year.zhi,
          month: exact.pillars.month.gan + exact.pillars.month.zhi,
          day: exact.pillars.day.gan + exact.pillars.day.zhi,
          hour: exact.pillars.hour.gan + exact.pillars.hour.zhi,
          correction: exact.calendarMeta?.hourCorrectionMinutes,
          manseClock: exact.calendarMeta?.manseClock,
          rawElements: exact.elementProfiles?.raw,
          strength: exact.analysisProfile?.dayMaster?.strength,
          ratio: exact.analysisProfile?.dayMaster?.supportRatio,
          gyeok: exact.gyeokguk?.name,
          yongshin: exact.yongshin,
          tz: exact.calendarMeta?.timeZone,
          classical: Object.keys(exact.analysisProfile?.classical || {}),
        },
        unknown: {hour:unknown.pillars.hour, hourKnown:unknown.calendarMeta?.hourKnown, gyeok:unknown.gyeokguk?.name},
        late: {hour:late.pillars.hour.gan + late.pillars.hour.zhi},
        leap, regular, boundary,
      };
    });
    assert(r.exact.year === '戊寅', `1998 year drift ${r.exact.year}`);
    assert(r.exact.month === '甲寅', `1998 month drift ${r.exact.month}`);
    assert(r.exact.day === '己亥', `1998 day drift ${r.exact.day}`);
    assert(r.exact.hour === '乙丑', `1998 corrected hour drift ${r.exact.hour}`);
    assert(r.exact.correction === -30, `1998 correction drift ${r.exact.correction}`);
    assert(r.exact.manseClock.endsWith('02:40'), `1998 manse clock drift ${r.exact.manseClock}`);
    assert(JSON.stringify(r.exact.rawElements) === JSON.stringify({mok:4,hwa:0,to:3,geum:0,su:1}),
      `1998 raw element drift ${JSON.stringify(r.exact.rawElements)}`);
    assert(['신강','중화','신약'].includes(r.exact.strength), `strength invalid ${r.exact.strength}`);
    assert(Number.isFinite(r.exact.ratio), `strength ratio invalid ${r.exact.ratio}`);
    assert(r.exact.gyeok === '정관격', `1998 gyeok drift ${r.exact.gyeok}`);
    assert(!!r.exact.yongshin, 'yongshin missing');
    assert(r.exact.tz === 'Asia/Seoul', `timezone invalid ${r.exact.tz}`);
    assert(['japyeong','jeokcheon','qiongtong'].every(k => r.exact.classical.includes(k)), `classical layers missing ${r.exact.classical}`);
    assert(r.unknown.hour === null && r.unknown.hourKnown === false, 'unknown time leaked hour pillar');
    assert(r.late.hour === '甲子', `late zi regression ${r.late.hour}`);
    assert(r.leap.year===2017 && r.leap.month===6 && r.leap.day===24, `leap lunar mismatch ${JSON.stringify(r.leap)}`);
    assert(r.regular.year===1956 && r.regular.month===3 && r.regular.day===3, `regular lunar mismatch ${JSON.stringify(r.regular)}`);
    assert(r.boundary.code === 'KST_TERM_TIME_REQUIRED', `term unknown-time code ${r.boundary.code}: ${r.boundary.message}`);
    const unexpected = errs.filter(x => !isExpectedBoundaryDiagnostic(x));
    assert(unexpected.length === 0, `core browser errors: ${unexpected.join(' | ')}`);
    console.log('CORE_PASS', JSON.stringify(r));
    await page.close();
  }

  // B. Explicitly find a 中和 chart and ensure NOTE 1/2 no longer treat it as 신약.
  {
    const page = await context.newPage();
    const errs = [];
    page.on('pageerror', e => errs.push(e.stack || e.message));
    page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    await load(page);
    const middle = await page.evaluate(() => {
      let found = null;
      outer:
      for (let y = 1990; y <= 2005; y++) {
        for (let m = 1; m <= 12; m++) {
          for (const d of [2, 9, 16, 23]) {
            try {
              const r = calculateAccurateManse(y,m,d,'12:00','female');
              if (r.analysisProfile?.dayMaster?.strength === '중화') {
                const data = {
                  ...r,
                  userBirthStr: `${y}${String(m).padStart(2,'0')}${String(d).padStart(2,'0')}`,
                  userTimeKey: '12:00',
                  userGender: 'female',
                  userCalendar: 'solar',
                  concernKey: 'money',
                };
                const n1 = buildNoteOneInsight(data, 'money', '재물·돈복', false);
                const n2 = buildNoteTwoPattern(data, 'money', '재물·돈복', false);
                found = {
                  date: data.userBirthStr,
                  ratio: r.analysisProfile.dayMaster.supportRatio,
                  n1: n1.desc,
                  n2: n2.desc,
                };
                break outer;
              }
            } catch (_) {}
          }
        }
      }
      return found;
    });
    assert(middle, 'could not locate deterministic 중화 sample');
    assert(middle.n1.includes('중화(한쪽으로 치우치지 않은 균형형)'), 'NOTE1 basis does not label 중화 explicitly');
    assert(middle.n1.includes('<b>중화</b>라 한쪽 반응으로 고정되기보다'), 'NOTE1 still collapses 중화 into binary copy');
    assert(middle.n2.includes('신강·신약 한쪽으로 치우치지 않아'), 'NOTE2 still collapses 중화 into 신약 copy');
    assert(!middle.n2.includes('주변 반응을 빠르게 흡수해서 작은 신호에도 마음이 먼저 흔들리고'), 'NOTE2 used legacy 신약-only reason for 중화');
    assert(errs.length === 0, `middle-strength browser errors: ${errs.join(' | ')}`);
    console.log('MIDDLE_STRENGTH_PASS', JSON.stringify({date:middle.date, ratio:middle.ratio}));
    await page.close();
  }

  // C. Full production-like UI path across all six concerns, F/T, solar/lunar/leap/time variants.
  const reports = [];
  for (const c of CASES) {
    const page = await context.newPage();
    await page.setViewportSize(c.viewport);
    const errs = [];
    page.on('pageerror', e => errs.push(`[pageerror] ${e.stack || e.message}`));
    page.on('console', m => { if (m.type() === 'error') errs.push(`[console] ${m.text()}`); });
    await load(page);

    const report = await page.evaluate((c) => {
      const labels = { money:'재물·돈복', career:'학업·커리어', love:'연애·썸', path:'진로·미래', people:'인간관계', mental:'번아웃·멘탈' };
      window.gtag = () => {};
      window.setTimeout = (fn) => { fn(); return 1; };
      window.clearTimeout = () => {};

      document.getElementById('nameInput').value = '박태양';
      document.getElementById('selectedConcernKey').value = c.concern;
      document.getElementById('birthDateInput').value = c.birth;
      document.getElementById('calendarSelect').value = c.calendar;
      document.getElementById('genderValue').value = c.gender;
      const unknown = c.time === 'unknown';
      const time = document.getElementById('birthTimeInput');
      const ub = document.getElementById('birthTimeUnknown');
      ub.checked = unknown;
      time.value = unknown ? '' : c.time;
      toggleBirthTimeUnknown(ub, false);
      const leap = document.getElementById('leapMonthCheck');
      if (leap) leap.checked = !!c.leap;

      startAnalysis(c.mode);
      const data = currentResultData;
      if (!data) return {ok:false, reason:'currentResultData missing', body:document.body.innerText.slice(-1200)};

      const notes = generateConcernNotes(data, c.mode);
      const n1 = buildNoteOneInsight(data, c.concern, labels[c.concern], c.mode === 'T');
      const n2 = buildNoteTwoPattern(data, c.concern, labels[c.concern], c.mode === 'T');
      const generated = JSON.stringify([notes,n1,n2]);
      const visible = document.body.innerText;
      return {
        ok:true,
        concern:data.concernKey,
        mode:data.currentMode,
        calendar:data.userCalendar,
        leap:data.isLeapMonth,
        hourKnown:data.calendarMeta?.hourKnown,
        tz:data.calendarMeta?.timeZone,
        strength:data.analysisProfile?.dayMaster?.strength,
        ratio:data.analysisProfile?.dayMaster?.supportRatio,
        gyeok:data.gyeokguk?.name,
        status:data.gyeokStatus?.status,
        yongshin:data.yongshin,
        classical:[!!data.analysisProfile?.classical?.japyeong, !!data.analysisProfile?.classical?.jeokcheon, !!data.analysisProfile?.classical?.qiongtong],
        noteCount:Array.isArray(notes) ? notes.length : -1,
        noteNums:Array.isArray(notes) ? notes.map(x=>x.themeNum) : [],
        note1Valid:!!(n1?.title && n1?.desc && n1?.checklist && n1.desc.includes('언니가 잡은 사주 근거')),
        note2Valid:!!(n2?.title && n2?.desc && n2?.checklist && n2.desc.includes('1. 시작 신호') && n2.desc.includes('왜 반복되냐면')),
        note6Valid:!!(notes?.[5]?.desc && notes[5].desc.includes('2026') && notes[5].desc.includes('2027')),
        badText:/(^|[^가-힣a-zA-Z])(undefined|NaN)([^가-힣a-zA-Z]|$)/.test(generated),
        failureToast:visible.includes('만세력 연산에 실패했습니다') || visible.includes('연산 중 오류가 발생했습니다'),
        resultVisible:document.getElementById('resultSection')?.style.display !== 'none',
        firstNoteRendered:(document.getElementById('notesListContainer')?.innerText || '').includes('NOTE 01'),
        pillarText:[
          document.getElementById('pillarYear')?.innerText || '',
          document.getElementById('pillarMonth')?.innerText || '',
          document.getElementById('pillarDay')?.innerText || '',
          document.getElementById('pillarHour')?.innerText || '',
        ],
        pillarBasis:document.getElementById('pillarBasisTag')?.innerText || '',
        ohengText:document.getElementById('ohengBarContainer')?.innerText || '',
      };
    }, c);

    assert(report.ok, `${c.id}: ${report.reason || 'UI failed'}`);
    assert(report.concern === c.concern, `${c.id}: concern drift ${report.concern}`);
    assert(report.mode === c.mode, `${c.id}: mode drift ${report.mode}`);
    assert(report.calendar === c.calendar, `${c.id}: calendar drift ${report.calendar}`);
    assert(report.tz === 'Asia/Seoul', `${c.id}: timezone missing`);
    assert(['신강','중화','신약'].includes(report.strength), `${c.id}: bad strength ${report.strength}`);
    assert(Number.isFinite(report.ratio), `${c.id}: bad support ratio ${report.ratio}`);
    assert(!!report.gyeok, `${c.id}: gyeok missing`);
    assert(!!report.yongshin, `${c.id}: yongshin missing`);
    assert(report.classical.every(Boolean), `${c.id}: classical layer missing ${report.classical}`);
    assert(report.noteCount === 6, `${c.id}: notes=${report.noteCount}`);
    assert(report.noteNums.join(',') === '01,02,03,04,05,06', `${c.id}: numbering ${report.noteNums.join(',')}`);
    assert(report.note1Valid, `${c.id}: NOTE1 structure/evidence block missing`);
    assert(report.note2Valid, `${c.id}: NOTE2 structure/reason block missing`);
    assert(report.note6Valid, `${c.id}: NOTE6 2026/2027 timeline missing`);
    assert(!report.badText, `${c.id}: undefined/NaN leaked into generated note text`);
    assert(!report.failureToast, `${c.id}: calculation failure toast visible`);
    assert(report.resultVisible, `${c.id}: result section not visible`);
    assert(report.firstNoteRendered, `${c.id}: NOTE01 not rendered into result DOM`);
    if (c.id === 'user-exact-love-F') {
      assert(report.pillarText.join(',') === '무인,갑인,기해,을축',
        `${c.id}: pillar UI drift ${report.pillarText.join(',')}`);
      assert(report.pillarBasis.includes('-30분 보정'),
        `${c.id}: correction basis missing ${report.pillarBasis}`);
      assert(report.ohengText.includes('목\n(4개)') || report.ohengText.includes('목 (4개)') || report.ohengText.includes('목(4개)'),
        `${c.id}: mok raw count missing ${report.ohengText}`);
      assert(report.ohengText.includes('화\n(0개)') || report.ohengText.includes('화 (0개)') || report.ohengText.includes('화(0개)'),
        `${c.id}: hwa raw count should be zero ${report.ohengText}`);
    }
    const unexpected = errs.filter(x => !isExpectedBoundaryDiagnostic(x));
    assert(unexpected.length === 0, `${c.id}: browser errors: ${unexpected.join(' | ')}`);
    reports.push({id:c.id, strength:report.strength, gyeok:report.gyeok, yongshin:report.yongshin});
    await page.close();
  }
  console.log('UI_PASS', JSON.stringify(reports));

  // D. Invalid leap-month input must fail cleanly, not crash or create a result.
  {
    const page = await context.newPage();
    const errs = [];
    page.on('pageerror', e => errs.push(e.message));
    await load(page);
    const r = await page.evaluate(() => {
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
      return {noResult:currentResultData === null};
    });
    assert(r.noResult, 'invalid leap month unexpectedly produced result');
    assert(errs.length === 0, `invalid leap caused pageerror: ${errs.join(' | ')}`);
    await page.close();
  }

  await browser.close();
  console.log('PRE_NOTE3_BROWSER_REGRESSION_PASS');
})().catch(err => { console.error(err.stack || err); process.exit(1); });
