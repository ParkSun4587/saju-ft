const { chromium } = require('playwright');

const BASE = 'http://127.0.0.1:4173/index.html';
const LABELS = {
  money: '돈·재물',
  career: '학업·직장',
  love: '연애·썸',
  path: '진로·적성',
  people: '사람·관계',
  mental: '마음·스트레스',
};
function assert(cond, msg) { if (!cond) throw new Error(msg); }
function isExpectedBoundaryDiagnostic(text) {
  const value = String(text);
  return value.includes('이 생일은 절기가 바뀌는 날이라 태어난 시간을 모르면') ||
    value.includes('만세력 엔진이 최신 버전으로 갱신되지 않았어요.');
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
    typeof buildNoteThreeBlindSpot === 'function' &&
    typeof buildNoteFourPrescription === 'function' &&
    typeof buildNoteFiveEnvironmentFilter === 'function' &&
    typeof buildNoteSixTiming === 'function' &&
    typeof analyzeDayMasterStrengthV2 === 'function' &&
    globalThis.__MANSE_KOREA_V2__?.version === '2.2.0',
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
      const manseScriptSrc = Array.from(document.scripts)
        .map((x) => x.getAttribute('src') || '')
        .find((src) => src.includes('manse-korea-v2.js')) || '';
      const runtimeVersion = globalThis.__MANSE_KOREA_V2__?.version || '';
      let staleGuard = { code:'', message:'' };
      const originalVersion = globalThis.__MANSE_KOREA_V2__.version;
      globalThis.__MANSE_KOREA_V2__.version = 'stale-test';
      try { calculateAccurateManse(1998,2,21,'03:10','male'); }
      catch (e) { staleGuard = { code:e.code || '', message:e.message || '' }; }
      globalThis.__MANSE_KOREA_V2__.version = originalVersion;
      return {
        manseScriptSrc,
        runtimeVersion,
        staleGuard,
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
    assert(r.manseScriptSrc.includes('manse-korea-v2.js?v=2.2.0'), `stale manse asset URL ${r.manseScriptSrc}`);
    assert(r.runtimeVersion === '2.2.0', `stale manse runtime ${r.runtimeVersion}`);
    assert(r.staleGuard.code === 'MANSE_ENGINE_STALE', `stale engine did not fail closed ${JSON.stringify(r.staleGuard)}`);
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
    assert(r.late.hour.endsWith('亥'), `23:00 recorded time should still be 亥 after Korean correction: ${r.late.hour}`);
    assert(r.leap.year===2017 && r.leap.month===6 && r.leap.day===24, `leap lunar mismatch ${JSON.stringify(r.leap)}`);
    assert(r.regular.year===1956 && r.regular.month===3 && r.regular.day===3, `regular lunar mismatch ${JSON.stringify(r.regular)}`);
    assert(r.boundary.code === 'KST_TERM_TIME_REQUIRED', `term unknown-time code ${r.boundary.code}: ${r.boundary.message}`);
    const unexpected = errs.filter(x => !isExpectedBoundaryDiagnostic(x));
    assert(unexpected.length === 0, `core browser errors: ${unexpected.join(' | ')}`);
    console.log('CORE_PASS', JSON.stringify(r));

    const copyAudit = await page.evaluate(() => {
      const labels = { money:'돈·재물', career:'학업·직장', love:'연애·썸', path:'진로·적성', people:'사람·관계', mental:'마음·스트레스' };
      const base = calculateAccurateManse(1998,2,21,'03:10','male');
      const other = calculateAccurateManse(2001,5,6,'14:30','female');
      const out = [];
      for (const key of Object.keys(labels)) {
        for (const mode of ['F','T']) {
          const data = {
            ...base,
            concernKey:key,
            userGender:'male',
            userBirthStr:'19980221',
            rawSolutionTemplate:{ F:{acts:[]}, T:{acts:[]} },
          };
          const notes = generateConcernNotes(data, mode);
          out.push({
            key,
            mode,
            notes: notes.map((n) => ({badge:n.badge,title:n.title,desc:n.desc,checklist:n.checklist})),
          });
        }
      }
      const a = buildNoteOneInsight({ ...base, concernKey:'career' }, 'career', labels.career, false);
      const b = buildNoteOneInsight({ ...other, concernKey:'career' }, 'career', labels.career, false);
      return {
        out,
        personalized: a.desc !== b.desc,
        pageText: document.body.innerText,
      };
    });

    assert(copyAudit.out.length === 12, `copy audit set count ${copyAudit.out.length}`);

    const situationUi = await page.evaluate(() => {
      const out = {};
      for (const key of ['money','career','love','path','people','mental']) {
        renderConcernSituationPicker(key);
        out[key] = {
          prompt:document.getElementById('concernSituationPrompt').innerText,
          count:document.querySelectorAll('#concernSituationGrid [data-concern-situation]').length,
          labels:[...document.querySelectorAll('#concernSituationGrid [data-concern-situation]')].map((el) => el.innerText),
        };
      }
      return out;
    });
    for (const [key, row] of Object.entries(situationUi)) {
      assert(row.count === 4, `${key} must expose 4 situations, got ${row.count}`);
      assert(row.prompt.length > 5, `${key} situation prompt missing`);
    }
    assert(situationUi.love.labels.some((x) => x.includes('지금 연애 중이야')), 'love relationship situation missing');
    assert(situationUi.love.labels.some((x) => x.includes('헤어진 사람이 있어')), 'love breakup situation missing');
    assert(situationUi.love.labels.some((x) => x.includes('새로운 인연을 만나고 싶어')), 'love new-person situation missing');
    const banned = [
      '언니가 잡은 사주 근거',
      '언니가 잡은 계산 근거',
      '왜 이 처방이 너한테 맞나',
      '왜 이런 필터가 맞나',
      '타이밍 읽는 법',
      '개수는 원국 겉글자 기준',
      '한국 만세력 기준',
      '시간 -30분 보정',
    ];
    const jargon = ['십신','격국','용신','신강','신약','월령','지장간','상신','기신','세운'];
    const fMarkers = ['언니','마음','같이','충분히','좋겠','편하','쉬어','자책','괜찮','애썼'];
    const tMarkers = ['딱','하지 마','문제야','금지','끊','정리','기준','바로','확장','데이터'];
    let fText = '';
    let tText = '';
    const summary = [];
    for (const set of copyAudit.out) {
      assert(set.notes.length === 6, `note count ${set.key}/${set.mode}: ${set.notes.length}`);
      assert(new Set(set.notes.map(n => n.title)).size === 6, `duplicate note title ${set.key}/${set.mode}`);
      const full = set.notes.map(n => `${n.badge} ${n.title} ${n.desc} ${n.checklist}`).join(' ');
      assert(!/(undefined|NaN|null)/.test(full), `bad token ${set.key}/${set.mode}`);
      for (const phrase of banned) assert(!full.includes(phrase), `banned phrase ${phrase} in ${set.key}/${set.mode}`);
      for (const phrase of jargon) assert(!full.includes(phrase), `hard jargon ${phrase} in ${set.key}/${set.mode}`);
      for (const n of set.notes) {
        assert(n.badge && n.title && n.desc && n.checklist, `empty note field ${set.key}/${set.mode}`);
      }
      if (set.mode === 'F') fText += ' ' + full; else tText += ' ' + full;
      summary.push({key:set.key, mode:set.mode, titles:set.notes.map(n=>n.title)});
    }
    for (const phrase of banned) assert(!copyAudit.pageText.includes(phrase), `banned visible UI phrase ${phrase}`);
    const fScore = fMarkers.filter(x => fText.includes(x)).length;
    const tScore = tMarkers.filter(x => tText.includes(x)).length;
    assert(fScore >= 7, `F persona too weak: ${fScore}`);
    assert(tScore >= 7, `T persona too weak: ${tScore}`);
    assert(copyAudit.personalized, 'NOTE1 did not vary across different charts');
    for (const key of Object.keys(LABELS)) {
      const f = copyAudit.out.find(x => x.key === key && x.mode === 'F');
      const t = copyAudit.out.find(x => x.key === key && x.mode === 'T');
      const sameTitles = f.notes.filter((n,i) => n.title === t.notes[i].title).length;
      assert(sameTitles <= 1, `F/T titles collapsed for ${key}: ${sameTitles}`);
      assert(f.notes.map(n=>n.desc).join('|') !== t.notes.map(n=>n.desc).join('|'), `F/T body collapsed for ${key}`);
    }
    console.log('COPY_QA_PASS', JSON.stringify({fScore,tScore,personalized:copyAudit.personalized,summary}));

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
                const n1 = buildNoteOneInsight(data, 'money', '돈·재물', false);
                const n2 = buildNoteTwoPattern(data, 'money', '돈·재물', false);
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
    assert(middle.n1.includes('버틸 때와 내려놓을 때를 꽤 잘 아는데'), 'NOTE1 middle-strength copy drift');
    assert(middle.n2.includes('버틸 때와 내려놓을 때를 꽤 잘 아는데'), 'NOTE2 middle-strength copy drift');
    assert(!middle.n1.includes('상황과 사람의 분위기를 빨리 읽는 만큼 네 마음이 뒤로 밀리기 쉬워'), 'NOTE1 collapsed middle into weak copy');
    assert(!middle.n2.includes('상황과 사람의 분위기를 빨리 읽는 만큼 네 마음이 뒤로 밀리기 쉬워'), 'NOTE2 collapsed middle into weak copy');
    assert(!middle.n1.includes('중화') && !middle.n2.includes('중화'), 'hard strength jargon leaked into user copy');
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
      const labels = { money:'돈·재물', career:'학업·직장', love:'연애·썸', path:'진로·적성', people:'사람·관계', mental:'마음·스트레스' };
      window.gtag = () => {};
      window.setTimeout = (fn) => { fn(); return 1; };
      window.clearTimeout = () => {};

      document.getElementById('nameInput').value = '박태양';
      document.getElementById('selectedConcernKey').value = c.concern;
      const situationDefaults = {
        money:'saving', career:'jobsearch', love:'new',
        path:'lost', people:'friend', mental:'burnout',
      };
      renderConcernSituationPicker(c.concern);
      selectConcernSituation(situationDefaults[c.concern]);
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

      const diagnosis = buildConcernDiagnosisV2(data);
      const notes = generateConcernNotes(data, c.mode);
      const generated = JSON.stringify([notes,diagnosis,data.noteV2Audit]);
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
        note1Valid:!!(notes?.[0]?.title && notes?.[0]?.desc && notes?.[0]?.checklist),
        note2Valid:!!(notes?.[1]?.title && notes?.[1]?.desc && notes?.[1]?.checklist),
        note3Valid:!!(notes?.[2]?.title && notes?.[2]?.desc && notes?.[2]?.checklist && notes?.[2]?.badge),
        note3Integrated:!!(data.noteV2Audit?.fingerprint && data.noteV2Audit?.primary?.cluster && diagnosis?.fingerprint === data.noteV2Audit?.fingerprint),
        note4Valid:!!(notes?.[3]?.title && notes?.[3]?.desc && notes?.[3]?.checklist && notes?.[3]?.badge),
        note5Valid:!!(notes?.[4]?.title && notes?.[4]?.desc && notes?.[4]?.checklist && notes?.[4]?.badge),
        note6Valid:!!(notes?.[5]?.title && notes?.[5]?.desc && notes?.[5]?.checklist && notes?.[5]?.__timingQA?.firstDate && notes?.[5]?.__timingQA?.secondDate),
        noteV2Version:data.noteV2Audit?.version || '',
        noteV2Primary:data.noteV2Audit?.primary?.cluster || '',
        noteV2Secondary:data.noteV2Audit?.secondary?.cluster || '',
        forbiddenVisible:[
          '언니가 잡은 사주 근거','언니가 잡은 계산 근거','왜 이 처방이 너한테 맞나','왜 이런 필터가 맞나','타이밍 읽는 법',
          '개수는 원국 겉글자 기준','한국 만세력 기준','시간 -30분 보정'
        ].some(x => visible.includes(x)),
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
        pillarBasisExists:!!document.getElementById('pillarBasisTag'),
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
    assert(report.note1Valid, `${c.id}: NOTE1 content missing`);
    assert(report.note2Valid, `${c.id}: NOTE2 content missing`);
    assert(report.note3Valid, `${c.id}: NOTE3 content missing`);
    assert(report.note3Integrated, `${c.id}: NOTE v2 diagnosis not integrated into generated notes`);
    assert(report.noteV2Version === '2.0.0' && report.noteV2Primary && report.noteV2Secondary, `${c.id}: NOTE v2 evidence audit missing`);
    assert(report.note4Valid, `${c.id}: NOTE4 prescription missing`);
    assert(report.note5Valid, `${c.id}: NOTE5 domain-specific fit section missing`);
    assert(report.note6Valid, `${c.id}: NOTE6 timing metadata missing`);
    assert(!report.forbiddenVisible, `${c.id}: removed meta/explanation copy leaked into UI`);
    assert(!report.badText, `${c.id}: undefined/NaN leaked into generated note text`);
    assert(!report.failureToast, `${c.id}: calculation failure toast visible`);
    assert(report.resultVisible, `${c.id}: result section not visible`);
    assert(report.firstNoteRendered, `${c.id}: NOTE01 not rendered into result DOM`);
    if (c.id === 'user-exact-love-F') {
      assert(report.pillarText.join(',') === '무인,갑인,기해,을축',
        `${c.id}: pillar UI drift ${report.pillarText.join(',')}`);
      assert(!report.pillarBasisExists,
        `${c.id}: hidden manse-basis label leaked back into UI`);
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
      renderConcernSituationPicker('money');
      selectConcernSituation('saving');
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
