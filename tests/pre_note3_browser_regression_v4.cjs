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
function norm(v) { return String(v || '').replace(/<[^>]+>/g,' ').replace(/[\s.,!?·‘’'"“”()\[\]]/g,''); }
function isExpectedBoundaryDiagnostic(text) {
  const value = String(text);
  return value.includes('이 생일은 절기가 바뀌는 날이라 태어난 시간을 모르면') ||
    value.includes('만세력 엔진이 최신 버전으로 갱신되지 않았어요.');
}

const CASES = [
  { id:'user-branch-love-F', birth:'19980221', time:'丑', gender:'male', calendar:'solar', leap:false, concern:'love', mode:'F', viewport:{width:390,height:844} },
  { id:'user-unknown-love-T', birth:'19980221', time:'unknown', gender:'male', calendar:'solar', leap:false, concern:'love', mode:'T', viewport:{width:390,height:844} },
  { id:'money-female-F', birth:'19991231', time:'子', gender:'female', calendar:'solar', leap:false, concern:'money', mode:'F', viewport:{width:390,height:844} },
  { id:'career-female-T', birth:'20010506', time:'未', gender:'female', calendar:'solar', leap:false, concern:'career', mode:'T', viewport:{width:1280,height:900} },
  { id:'path-lunar-regular-F', birth:'19560121', time:'午', gender:'male', calendar:'lunar', leap:false, concern:'path', mode:'F', viewport:{width:390,height:844} },
  { id:'people-lunar-leap-T', birth:'20170501', time:'亥', gender:'female', calendar:'lunar', leap:true, concern:'people', mode:'T', viewport:{width:390,height:844} },
  { id:'mental-dst-F', birth:'19880701', time:'午', gender:'male', calendar:'solar', leap:false, concern:'mental', mode:'F', viewport:{width:390,height:844} },
  { id:'love-female-T', birth:'19940517', time:'辰', gender:'female', calendar:'solar', leap:false, concern:'love', mode:'T', viewport:{width:390,height:844} },
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
    typeof globalThis.buildNoteSixTiming === 'undefined' &&
    typeof globalThis.getTrueBaziTiming === 'undefined' &&
    typeof renderConcernNotesV2 === 'function' &&
    globalThis.generateConcernNotes?.__classicalCausal === true &&
    typeof buildConcernDiagnosisV2 === 'function' &&
    globalThis.__CONCERN_NOTE_ENGINE_V2__?.version === '5.0.0' &&
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
    assert(['japyeong','jeokcheon','yongshin'].every(k => r.exact.classical.includes(k)) && !r.exact.classical.includes('qiongtong'), `classical layers invalid ${r.exact.classical}`);
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
            evidenceCoverage:data.noteV3Audit?.evidenceCoverage||null,
          });
        }
      }
      const aData={...base,concernKey:'career',concernSituation:'current',userGender:'male',userBirthStr:'19980221'};
      const bData={...other,concernKey:'career',concernSituation:'current',userGender:'male',userBirthStr:'19900102'};
      const a=generateConcernNotes(aData,'F');
      const b=generateConcernNotes(bData,'F');
      return {
        out,
        personalized:a.filter((n,i)=>String(n.desc)!==String(b[i]?.desc)).length>=3,
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
    const fMarkers = ['언니','마음','같이','보자','해보자','덜','편','괜찮'];
    const tMarkers = ['먼저','확인','기준','바로','끊','결론','정리','하지'];
    let fText = '';
    let tText = '';
    const summary = [];
    for (const set of copyAudit.out) {
      assert(set.notes.length === 5, `answer count ${set.key}/${set.mode}: ${set.notes.length}`);
      assert(new Set(set.notes.map(n => n.title)).size === 5, `duplicate answer title ${set.key}/${set.mode}`);
      const full = set.notes.map(n => `${n.badge} ${n.title} ${n.desc} ${n.checklist}`).join(' ');
      assert(!/(undefined|NaN|null)/.test(full), `bad token ${set.key}/${set.mode}`);
      for (const phrase of banned) assert(!full.includes(phrase), `banned phrase ${phrase} in ${set.key}/${set.mode}`);
      for (const phrase of jargon) assert(!full.includes(phrase), `hard jargon ${phrase} in ${set.key}/${set.mode}`);
      for (const n of set.notes) {
        assert(n.badge && n.title && n.desc, `empty answer field ${set.key}/${set.mode}`);
        const body=String(n.desc||'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
        const len=body.length;
        assert(len>=110 && len<=950, `answer length drift ${set.key}/${set.mode}: ${len}`);
        assert(body.includes('결론'), `answer does not lead with conclusion ${set.key}/${set.mode}: ${body}`);
      }
      assert(set.evidenceCoverage?.coverageRate===1 && set.evidenceCoverage?.missingRuleIds?.length===0,
        `supported evidence dropped ${set.key}/${set.mode}: ${JSON.stringify(set.evidenceCoverage)}`);
      assert(!/(비밀\s*메모|실전 룰|반복 패턴|압박|구조)/.test(full), `old/abstract answer wording ${set.key}/${set.mode}`);
      if (set.mode === 'F') fText += ' ' + full; else tText += ' ' + full;
      summary.push({key:set.key, mode:set.mode, titles:set.notes.map(n=>n.title)});
    }
    for (const phrase of banned) assert(!copyAudit.pageText.includes(phrase), `banned visible UI phrase ${phrase}`);
    const fScore = fMarkers.filter(x => fText.includes(x)).length;
    const tScore = tMarkers.filter(x => tText.includes(x)).length;
    assert(fScore >= 4, `F persona too weak: ${fScore}`);
    assert(tScore >= 4, `T persona too weak: ${tScore}`);
    assert(copyAudit.personalized, 'NOTE1 did not vary across different charts');
    for (const key of Object.keys(LABELS)) {
      const f = copyAudit.out.find(x => x.key === key && x.mode === 'F');
      const t = copyAudit.out.find(x => x.key === key && x.mode === 'T');
      const bodyDiffs=f.notes.filter((n,i)=>n.desc!==t.notes[i]?.desc).length;
      assert(bodyDiffs >= 2, `F/T voice did not materially differ for ${key}: ${bodyDiffs}`);
    }
    console.log('COPY_QA_PASS', JSON.stringify({fScore,tScore,personalized:copyAudit.personalized,summary}));

    await page.close();
  }

  // B. A middle-strength chart must still render plain user language, not internal strength jargon.
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
                  concernSituation:'saving',
                };
                const notes=generateConcernNotes(data,'F');
                found = {
                  date: data.userBirthStr,
                  ratio: r.analysisProfile.dayMaster.supportRatio,
                  count:notes.length,
                  text:notes.map(n=>String(n.desc||'').replace(/<[^>]+>/g,' ')).join(' '),
                };
                break outer;
              }
            } catch (_) {}
          }
        }
      }
      return found;
    });
    assert(middle, 'could not locate deterministic middle-strength sample');
    assert(middle.count===5,'middle-strength sample did not render five answers');
    assert(!/(신강|신약|중화|압박|구조|월령|지장간|격국|용신)/.test(middle.text), 'internal strength/classical jargon leaked into user copy');
    assert(errs.length === 0, `middle-strength browser errors: ${errs.join(' | ')}`);
    console.log('MIDDLE_STRENGTH_PASS', JSON.stringify({date:middle.date, ratio:middle.ratio}));
    await page.close();
  }

  // B2. Every concern/situation must have a concrete conversion bridge in both voices.
  {
    const page = await context.newPage();
    const errs = [];
    page.on('pageerror', e => errs.push(e.stack || e.message));
    page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    await load(page);
    const coverage = await page.evaluate(() => {
      const situations = {
        money:['saving','income','side','flow'],
        career:['exam','jobsearch','move','current'],
        love:['crush','relationship','breakup','new'],
        path:['lost','current','switch','strength'],
        people:['friend','work','family','distance'],
        mental:['burnout','overthink','low','recover'],
      };
      const rows = [];
      for (const [concernKey, keys] of Object.entries(situations)) {
        for (const concernSituation of keys) {
          for (const isT of [false, true]) {
            const copy = getPaywallConversionCopy({concernKey, concernSituation}, isT);
            rows.push({
              id: concernKey + '/' + concernSituation + '/' + (isT ? 'T' : 'F'),
              hook:copy?.hook || '',
              sub:copy?.sub || '',
              preview:copy?.preview || '',
              teaser:copy?.teaser || '',
              priceTitle:copy?.priceTitle || '',
              features:Array.isArray(copy?.features) ? copy.features : [],
            });
          }
        }
      }
      return rows;
    });
    assert(coverage.length === 48, `paywall coverage rows=${coverage.length}`);
    for (const row of coverage) {
      assert(row.hook.length >= 18, `${row.id}: hook too weak/missing`);
      assert(row.sub.length >= 14, `${row.id}: sub missing`);
      assert(row.preview.length >= 18, `${row.id}: preview missing`);
      assert(row.teaser.length >= 14 && row.teaser.includes('…'), `${row.id}: cliffhanger missing`);
      assert(row.priceTitle.length >= 8, `${row.id}: price title missing`);
      assert(row.features.length === 3 && row.features.every(Boolean), `${row.id}: paid outcomes must be exactly 3`);
    }
    assert(new Set(coverage.filter(x => x.id.endsWith('/F')).map(x => x.teaser)).size === 24,
      'F cliffhangers are not situation-specific across all 24 paths');
    assert(new Set(coverage.filter(x => x.id.endsWith('/T')).map(x => x.teaser)).size === 24,
      'T cliffhangers are not situation-specific across all 24 paths');
    assert(errs.length === 0, `paywall coverage browser errors: ${errs.join(' | ')}`);
    await page.close();
    console.log('PAYWALL_CONVERSION_COVERAGE_PASS');
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
      const branch = document.getElementById('birthTimeBranch');
      branch.value = c.time;
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
        classical:[!!data.analysisProfile?.classical?.japyeong, !!data.analysisProfile?.classical?.jeokcheon, !!data.analysisProfile?.classical?.yongshin, !('qiongtong' in (data.analysisProfile?.classical || {}))],
        noteCount:Array.isArray(notes) ? notes.length : -1,
        noteNums:Array.isArray(notes) ? notes.map(x=>x.themeNum) : [],
        note1Valid:!!(notes?.[0]?.title && notes?.[0]?.desc && notes?.[0]?.badge),
        note2Valid:!!(notes?.[1]?.title && notes?.[1]?.desc && notes?.[1]?.badge),
        note3Valid:!!(notes?.[2]?.title && notes?.[2]?.desc && notes?.[2]?.badge),
        note3Integrated:!!(data.noteV3Audit?.structureFingerprint && data.noteV3Audit?.outputClaimMap?.length===5 && diagnosis?.structureFingerprint === data.noteV3Audit?.structureFingerprint),
        note4Valid:!!(notes?.[3]?.title && notes?.[3]?.desc && notes?.[3]?.badge),
        note5Valid:!!(notes?.[4]?.title && notes?.[4]?.desc && notes?.[4]?.badge && notes?.[4]?.__timingQA),
        noteV2Version:data.noteV3Audit?.version || '',
        noteV2Primary:data.noteV3Audit?.claims?.[0]?.ditianRuleIds?.[0] || '',
        noteV2Secondary:data.noteV3Audit?.claims?.[0]?.zipingRuleIds?.[0] || '',
        forbiddenVisible:[
          '언니가 잡은 사주 근거','언니가 잡은 계산 근거','왜 이 처방이 너한테 맞나','왜 이런 필터가 맞나','타이밍 읽는 법',
          '개수는 원국 겉글자 기준','한국 만세력 기준','시간 -30분 보정'
        ].some(x => visible.includes(x)),
        badText:/(^|[^가-힣a-zA-Z])(undefined|NaN)([^가-힣a-zA-Z]|$)/.test(generated),
        failureToast:visible.includes('만세력 연산에 실패했습니다') || visible.includes('연산 중 오류가 발생했습니다'),
        resultVisible:document.getElementById('resultSection')?.style.display !== 'none',
        firstNoteRendered:(document.getElementById('notesListContainer')?.innerText || '').includes('1/5'),
        paywallHook:document.getElementById('payBoxHookMsg')?.innerText || '',
        paywallTeaser:document.getElementById('paywallNextTeaser')?.innerText || '',
        paywallFeatures:[...document.querySelectorAll('#payBoxFeatures > div')].map(x => x.querySelector('span:last-child')?.innerText.trim() || ''),
        paywallSubcopy:document.getElementById('payBtnSubText')?.innerText || '',
        note2PreviewText:document.getElementById('note2PreviewBody')?.innerText || '',
        expectedPaywall:(() => {
          const copy = getPaywallConversionCopy(data, c.mode === 'T');
          const actualPreview=String(notes[1]?.desc||'').split(/<br\s*\/?>\s*<br\s*\/?>/i)[0].replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
          return {hook:copy.hook, teaser:copy.teaser, actualPreview, features:copy.features};
        })(),
        funExtrasDisplay:document.getElementById('resultFunExtras')?.style.display || '',
        shareActionsDisplay:document.getElementById('resultShareActions')?.style.display || '',
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
    assert(report.noteCount === 5, `${c.id}: answers=${report.noteCount}`);
    assert(report.noteNums.join(',') === '01,02,03,04,05', `${c.id}: numbering ${report.noteNums.join(',')}`);
    assert(report.note1Valid, `${c.id}: core answer missing`);
    assert(report.note2Valid, `${c.id}: real-scene answer missing`);
    assert(report.note3Valid, `${c.id}: fit answer missing`);
    assert(report.note3Integrated, `${c.id}: classical diagnosis not integrated into five answers`);
    assert(report.noteV2Version === '5.0.0' && report.noteV2Primary && report.noteV2Secondary, `${c.id}: five-answer rule provenance audit missing`);
    assert(report.note4Valid, `${c.id}: filter answer missing`);
    assert(report.note5Valid, `${c.id}: timing/action answer missing`);
    assert(!report.forbiddenVisible, `${c.id}: removed meta/explanation copy leaked into UI`);
    assert(!report.badText, `${c.id}: undefined/NaN leaked into generated note text`);
    assert(!report.failureToast, `${c.id}: calculation failure toast visible`);
    assert(report.resultVisible, `${c.id}: result section not visible`);
    assert(report.firstNoteRendered, `${c.id}: first 1/5 answer not rendered into result DOM`);
    assert(report.paywallHook === report.expectedPaywall.hook, `${c.id}: paywall hook not situation-specific`);
    assert(report.paywallTeaser.includes(report.expectedPaywall.teaser), `${c.id}: paywall teaser not situation-specific`);
    assert(report.note2PreviewText.includes('결론') && norm(report.note2PreviewText).length >= 35 && norm(report.expectedPaywall.actualPreview).includes(norm(report.note2PreviewText).slice(0, Math.min(35, norm(report.note2PreviewText).length))), `${c.id}: second-answer preview lost the generated conclusion edge`);
    assert(report.paywallFeatures.join('|') === report.expectedPaywall.features.join('|'), `${c.id}: paid outcomes mismatch`);
    assert(report.paywallSubcopy === '맞는 조건 · 거를 신호 · 가까운 흐름까지', `${c.id}: paid scope copy drift`);
    assert(report.funExtrasDisplay === 'none', `${c.id}: MBTI/fun extras must not divert locked users`);
    assert(report.shareActionsDisplay === 'none', `${c.id}: share action must not divert locked users`);
    if (c.id === 'user-branch-love-F') {
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
      document.getElementById('birthTimeBranch').value = '午';
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
