const { chromium } = require('playwright');
const fs = require('fs');
// Vault/auth UI regression: Kakao -> Naver -> Google -> Apple -> email.
// Story-card v2 and persona-copy regressions live in this suite.

function assert(cond, msg) { if (!cond) throw new Error(msg); }
function norm(v) {
  return String(v || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\d{4}년/g, 'YEAR')
    .replace(/\d{1,2}월/g, 'MONTH')
    .replace(/[\s.,!?·‘’'"“”()\[\]]/g, '');
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on('pageerror', e => errors.push(`[pageerror] ${e.stack || e.message}`));
  page.on('console', m => { if (m.type() === 'error') errors.push(`[console] ${m.text()}`); });
  await page.goto('http://127.0.0.1:4173/index.html', { waitUntil: 'load', timeout: 60000 });
  await page.waitForFunction(() =>
    globalThis.__PAID_VALUE_LAYER_V1__?.version === '1.4.0' &&
    globalThis.__UNNI_PRODUCTS_V1__?.version === '1.6.0' &&
    typeof generateConcernNotes === 'function' &&
    typeof auditPaidValueNotes === 'function', null, { timeout: 60000 });

  const concernUx = await page.evaluate(() => {
    const initial = {
      box:getComputedStyle(document.getElementById('concernSituationBox')).display,
      summary:getComputedStyle(document.getElementById('concernSituationSummary')).display,
      concern:document.getElementById('selectedConcernKey').value,
      selectedCount:document.querySelectorAll('#concernGrid .concern-chip.selected').length,
    };
    renderConcernSituationPicker('love');
    const opened = {
      box:getComputedStyle(document.getElementById('concernSituationBox')).display,
      count:document.querySelectorAll('#concernSituationGrid [data-concern-situation]').length,
    };
    document.getElementById('selectedConcernKey').value = 'love';
    selectConcernSituation('relationship');
    const collapsed = {
      box:getComputedStyle(document.getElementById('concernSituationBox')).display,
      summary:getComputedStyle(document.getElementById('concernSituationSummary')).display,
      text:document.getElementById('concernSituationSummaryText').innerText,
    };
    editConcernSituation();
    const edited = getComputedStyle(document.getElementById('concernSituationBox')).display;
    document.getElementById('concernSituationBox').style.display = 'none';
    document.getElementById('concernSituationSummary').style.display = 'none';
    document.getElementById('selectedConcernKey').value = 'money';
    document.getElementById('selectedConcernSituation').value = '';
    return { initial, opened, collapsed, edited };
  });
  assert(concernUx.initial.box === 'none' && concernUx.initial.summary === 'none' && concernUx.initial.concern === '' && concernUx.initial.selectedCount === 0, `mobile concern must start with no default choice: ${JSON.stringify(concernUx)}`);
  assert(concernUx.opened.box !== 'none' && concernUx.opened.count === 4, 'selected concern must reveal four situation choices');
  assert(concernUx.collapsed.box === 'none' && concernUx.collapsed.summary !== 'none' && concernUx.collapsed.text.includes('지금 연애 중'), `selected situation should collapse into summary: ${JSON.stringify(concernUx.collapsed)}`);
  assert(concernUx.edited !== 'none', 'situation edit must reopen choices');

  const qa = await page.evaluate(() => {
    window.gtag = () => {};
    const concerns = ['money','career','love','path','people','mental'];
    const exact = calculateAccurateManse(1998,2,21,'03:10','female');
    const maleExact = calculateAccurateManse(1998,2,21,'03:10','male');
    const rows = [];
    for (const concern of concerns) {
      for (const mode of ['F','T']) {
        const data = {
          ...exact,
          name:'박태양',
          concernKey:concern,
          userBirthStr:'19980221',
          userTimeKey:'03:10',
          userGender:'female',
          userCalendar:'solar',
          currentMode:mode,
          rawSolutionTemplate:{ F:{acts:[{d:'a'},{d:'b'}]}, T:{acts:[{d:'a'},{d:'b'}]} },
        };
        const notes = generateConcernNotes(data, mode);
        const audit = data.paidValueAudit || auditPaidValueNotes(notes, mode);
        const n6 = notes[5];
        rows.push({
          concern, mode,
          count:notes.length,
          first:n6?.__timingQA?.firstBody || '',
          second:n6?.__timingQA?.secondBody || '',
          firstDate:n6?.__timingQA?.firstDate || '',
          secondDate:n6?.__timingQA?.secondDate || '',
          desc:n6?.desc || '',
          duplicateCount:audit.duplicates.length,
          hardTerms:audit.hardTerms,
          timingDuplicate:audit.timingDuplicate,
          toneScore:audit.toneScore,
          allText:notes.map(n => `${n.title} ${n.desc} ${n.checklist || ''}`).join(' '),
        });
      }
    }
    const maleBase = {
      ...maleExact,
      name:'박태양',
      userBirthStr:'19980221',
      userTimeKey:'03:10',
      userGender:'male',
      userCalendar:'solar',
      currentMode:'F',
    };
    const maleMoney = generateConcernNotes({ ...maleBase, concernKey:'money' }, 'F')[5];
    const maleLove = generateConcernNotes({ ...maleBase, concernKey:'love' }, 'F')[5];

    const situationRows = [];
    const profiles = globalThis.__PAID_VALUE_LAYER_V1__?.situationProfiles || {};
    for (const concern of concerns) {
      for (const situation of Object.keys(profiles[concern] || {})) {
        for (const mode of ['F','T']) {
          const data = {
            ...exact,
            name:'박태양',
            concernKey:concern,
            concernSituation:situation,
            userBirthStr:'19980221',
            userTimeKey:'03:10',
            userGender:'female',
            userCalendar:'solar',
            currentMode:mode,
            rawSolutionTemplate:{ F:{acts:[{d:'a'},{d:'b'}]}, T:{acts:[{d:'a'},{d:'b'}]} },
          };
          const notes = generateConcernNotes(data, mode);
          const audit = data.paidValueAudit || auditPaidValueNotes(notes, mode);
          situationRows.push({
            concern,
            situation,
            mode,
            label:profiles[concern][situation]?.label || '',
            count:notes.length,
            n1:notes[0],
            n6:notes[5],
            notes:notes.map((n) => ({
              badge:n.badge || '',
              title:n.title || '',
              desc:n.desc || '',
              checklist:n.checklist || '',
            })),
            audit,
            allText:notes.map((n) => `${n.badge} ${n.title} ${n.desc} ${n.checklist || ''}`).join(' '),
          });
        }
      }
    }

    return {
      paidVersion:globalThis.__PAID_VALUE_LAYER_V1__,
      productVersion:globalThis.__UNNI_PRODUCTS_V1__,
      products:globalThis.__UNNI_PRODUCTS_V1__.products,
      wrappers:{ paid:!!generateConcernNotes.__paidValueWrapped, integrated:!!generateConcernNotes.__integratedProfileWrapped },
      rows,
      maleShared: {
        money: maleMoney?.__timingQA || {},
        love: maleLove?.__timingQA || {},
        moneyDesc: maleMoney?.desc || '',
        loveDesc: maleLove?.desc || '',
      },
      situationRows,
    };
  });

  assert(qa.paidVersion.version === '1.4.0', 'paid value layer missing');
  assert(qa.productVersion.version === '1.6.0', 'product layer missing');
  assert(qa.wrappers.paid, 'paid-value wrapper missing');
  assert(qa.wrappers.integrated, 'integrated wrapper metadata lost');
  const expectedPrices = { concern_bundle3:2900, full_saju:4900, compatibility:5900, all_in_one:9900 };
  for (const [id, price] of Object.entries(expectedPrices)) assert(qa.products[id]?.price === price, `${id} price drift`);
  assert(qa.products.concern_bundle3.desc.includes('총 18개') && qa.products.concern_bundle3.desc.includes('지금 상황'), 'bundle3 delivered-volume/situation copy missing');
  assert(qa.products.full_saju.desc.includes('12개 챕터'), 'full-saju delivered-volume copy missing');
  assert(qa.products.compatibility.desc.includes('16개 챕터'), 'compatibility delivered-volume copy missing');
  assert(qa.products.all_in_one.desc.includes('NOTE 36개') && qa.products.all_in_one.desc.includes('지금 상황'), 'all-in-one delivered-volume/situation copy missing');
  assert(qa.products.all_in_one.name === '내 사주 완전판' && qa.products.all_in_one.badge.includes('고민 6개'), `all-in-one naming drift: ${JSON.stringify(qa.products.all_in_one)}`);
  assert(qa.rows.length === 12, `expected 12 rows, got ${qa.rows.length}`);
  assert(qa.maleShared.money.firstDate === qa.maleShared.love.firstDate, 'male money/love first timing should legitimately share the same sensitive axis');
  assert(qa.maleShared.money.secondDate === qa.maleShared.love.secondDate, 'male money/love second timing should legitimately share the same sensitive axis');
  assert(qa.maleShared.money.sharedTimingWith === 'love' && qa.maleShared.love.sharedTimingWith === 'money', 'shared timing pairing metadata missing');
  assert(qa.maleShared.moneyDesc.includes('복붙 아니야') && qa.maleShared.loveDesc.includes('복붙 아니야'), 'shared timing explanation missing from F copy');
  assert(norm(qa.maleShared.money.firstBody) !== norm(qa.maleShared.love.firstBody), 'same date must still produce concern-specific first action');
  assert(norm(qa.maleShared.money.secondBody) !== norm(qa.maleShared.love.secondBody), 'same date must still produce concern-specific second action');

  assert(qa.situationRows.length === 48, `expected 48 situation/mode rows, got ${qa.situationRows.length}`);
  for (const row of qa.situationRows) {
    assert(row.count === 6, `${row.concern}/${row.situation}/${row.mode}: note count ${row.count}`);
    const note1Plain = String(row.notes?.[0]?.desc || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const note2Plain = String(row.notes?.[1]?.desc || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    assert(note1Plain.length >= 210, `${row.concern}/${row.situation}/${row.mode}: NOTE1 teaser too thin (${note1Plain.length})`);
    assert(note2Plain.length >= 210, `${row.concern}/${row.situation}/${row.mode}: NOTE2 teaser too thin (${note2Plain.length})`);
    assert(/사주 전체|사주 전체랑|사주 전체를/.test(note1Plain), `${row.concern}/${row.situation}/${row.mode}: NOTE1 lacks personalized why-context`);
    assert(/반복|패턴|같은 데서/.test(note2Plain), `${row.concern}/${row.situation}/${row.mode}: NOTE2 lacks pattern explanation`);
    assert(row.n6?.__timingQA?.concernSituation === row.situation, `${row.concern}/${row.situation}/${row.mode}: NOTE6 situation metadata missing`);
    assert(norm(row.n6?.__timingQA?.firstBody) !== norm(row.n6?.__timingQA?.secondBody), `${row.concern}/${row.situation}/${row.mode}: NOTE6 period copy duplicated`);
    assert(row.audit?.hardTerms?.length === 0, `${row.concern}/${row.situation}/${row.mode}: technical terms leaked`);
    assert((row.audit?.badgeTooLong || []).length === 0, `${row.concern}/${row.situation}/${row.mode}: compact NOTE badge too long ${JSON.stringify(row.audit?.badgeTooLong)}`);
    for (const [idx, note] of row.notes.entries()) {
      assert(note.badge.length <= 16, `${row.concern}/${row.situation}/${row.mode}: NOTE${idx + 1} badge too long: ${note.badge}`);
      const voice = `${note.title} ${note.desc} ${note.checklist}`;
      if (row.mode === 'F') {
        assert(/언니|우리|같이|마음|괜찮|해보자|보자|돼/.test(voice), `${row.concern}/${row.situation}/F: NOTE${idx + 1} lost Roa 1:1 voice`);
      } else {
        assert(/내가|딱|바로|먼저|확인|보자|끊|기준|해\b/.test(voice), `${row.concern}/${row.situation}/T: NOTE${idx + 1} lost Seoa direct 1:1 voice`);
      }
    }
    assert(!/(undefined|NaN|null)/.test(row.allText), `${row.concern}/${row.situation}/${row.mode}: bad token leaked`);
  }
  for (const concern of ['money','career','love','path','people','mental']) {
    for (const mode of ['F','T']) {
      const rows = qa.situationRows.filter((row) => row.concern === concern && row.mode === mode);
      assert(rows.length === 4, `${concern}/${mode}: expected four situations`);
      const signatures = new Set(rows.map((row) => norm(`${row.n1?.title} ${row.n1?.desc} ${row.n6?.__timingQA?.firstBody}`)));
      assert(signatures.size === 4, `${concern}/${mode}: situation outputs are not distinct`);
    }
  }

  const loveSituation = Object.fromEntries(
    qa.situationRows
      .filter((row) => row.concern === 'love' && row.mode === 'F')
      .map((row) => [row.situation, row])
  );
  assert(loveSituation.relationship?.notes?.[0]?.badge === '연애가 꼬이는 이유', 'relationship direct NOTE badge missing');
  assert(!/(새 인연|새로운 사람을 만날|새 사람을 만날 접점|소개·모임)/.test(loveSituation.relationship?.allText || ''), 'relationship mode leaked new-person advice');
  assert(loveSituation.new?.notes?.[0]?.badge === '연애가 꼬이는 이유', 'new-person direct NOTE badge missing');
  assert(/소개|모임|취미|앱/.test(loveSituation.new?.allText || ''), 'new-person mode needs actual meeting opportunities');
  assert(!/(우리 관계|지금 둘 사이|미뤄둔 대화나 약속)/.test(loveSituation.new?.allText || ''), 'new-person mode assumed an existing relationship');
  assert(loveSituation.breakup?.notes?.[0]?.badge === '연애가 꼬이는 이유' && /재회|헤어진/.test(loveSituation.breakup?.allText || ''), 'breakup mode lacks breakup/reunion context');
  assert(loveSituation.crush?.notes?.[0]?.badge === '연애가 꼬이는 이유', 'crush direct NOTE badge missing');
  assert(norm(loveSituation.relationship?.n6?.__timingQA?.firstBody) !== norm(loveSituation.new?.n6?.__timingQA?.firstBody), 'same love timing must produce situation-specific action');

  for (const r of qa.rows) {
    assert(r.count === 6, `${r.concern}/${r.mode}: note count ${r.count}`);
    assert(r.first && r.second, `${r.concern}/${r.mode}: timing bodies missing`);
    assert(r.firstDate && r.secondDate, `${r.concern}/${r.mode}: timing dates missing`);
    assert(norm(r.first) !== norm(r.second), `${r.concern}/${r.mode}: NOTE6 period body copied`);
    assert(!r.timingDuplicate, `${r.concern}/${r.mode}: timing duplicate audit failed`);
    assert(r.hardTerms.length === 0, `${r.concern}/${r.mode}: hard terms leaked ${JSON.stringify(r.hardTerms)}`);
    assert(r.toneScore >= 3, `${r.concern}/${r.mode}: persona tone too weak ${r.toneScore}`);
    assert(r.desc.includes('먼저 ·') && r.desc.includes('그다음 ·') && r.desc.includes('둘은 이렇게 달라'), `${r.concern}/${r.mode}: NOTE6 conversational distinction headings missing`);
    assert(!/[💕❤♥💖💗💓💞💘💝]/u.test(r.desc), `${r.concern}/${r.mode}: decorative heart leaked into NOTE6`);
    assert(!/(undefined|NaN|null)/.test(r.allText), `${r.concern}/${r.mode}: bad token leaked`);
  }

  // Production-like result path: verify catalog is actually visible and free-launch previews work.
  const ui = await page.evaluate(() => {
    window.gtag = () => {};
    window.setTimeout = (fn) => { fn(); return 1; };
    window.clearTimeout = () => {};
    document.getElementById('nameInput').value = '박태양';
    document.getElementById('selectedConcernKey').value = 'mental';
    renderConcernSituationPicker('mental');
    selectConcernSituation('burnout');
    document.getElementById('birthDateInput').value = '19980221';
    document.getElementById('calendarSelect').value = 'solar';
    document.getElementById('genderValue').value = 'female';
    const ub = document.getElementById('birthTimeUnknown');
    ub.checked = false;
    document.getElementById('birthTimeInput').value = '0310';
    toggleBirthTimeUnknown(ub, false);
    startAnalysis('F');
    renderUnniProductCatalog();
    const notes = generateConcernNotes(currentResultData, 'F');
    const note6 = notes[5];
    const catalog = document.getElementById('unniProductLadder');
    const fChem = {
      best:document.getElementById('chemBestCard')?.className || '',
      worst:document.getElementById('chemWorstCard')?.className || '',
      bestTitle:document.getElementById('chemBestTitle')?.innerText || '',
      worstTitle:document.getElementById('chemWorstTitle')?.innerText || '',
    };
    const fOheng = document.getElementById('ohengSummaryTxt')?.innerText || '';
    updateResultContentByMode('T');
    const tChem = {
      best:document.getElementById('chemBestCard')?.className || '',
      worst:document.getElementById('chemWorstCard')?.className || '',
      bestTitle:document.getElementById('chemBestTitle')?.innerText || '',
      worstTitle:document.getElementById('chemWorstTitle')?.innerText || '',
    };
    const tOheng = document.getElementById('ohengSummaryTxt')?.innerText || '';
    updateResultContentByMode('F');
    const mbtiInfo = {
      gradeText:document.getElementById('gradeSection')?.innerText || '',
      fontSize:parseFloat(getComputedStyle(document.getElementById('resultBigMbti')).fontSize || '0'),
      oneLineBeforeThreeLine:(document.getElementById('sazuCharacterTitle').compareDocumentPosition(document.getElementById('manualBulletList')) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0,
      threeLineBeforeMbti:(document.getElementById('manualBulletList').compareDocumentPosition(document.getElementById('gradeSection')) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0,
      mbtiBeforeChem:(document.getElementById('gradeSection').compareDocumentPosition(document.getElementById('chemBestCard')) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0,
      criterionOpacity:getComputedStyle(document.querySelector('#coreThreeLineSummary .text-slate-300')).color,
    };
    openShareModal();
    const story = document.getElementById('storyCard');
    const share = {
      version: story?.dataset?.shareVersion || '',
      text: story?.innerText || '',
      core: document.getElementById('cardCoreElement')?.innerText || '',
      strong: document.getElementById('cardStrongElement')?.innerText || '',
      need: document.getElementById('cardNeedElement')?.innerText || '',
      avatar: document.getElementById('cardSisterAvatar')?.getAttribute('src') || '',
    };
    return {
      result:!!currentResultData,
      catalog:!!catalog,
      buttons:catalog ? catalog.querySelectorAll('[data-unni-product]').length : 0,
      visibleProducts:catalog ? [...catalog.querySelectorAll('[data-unni-product]')].filter((el) => getComputedStyle(el).display !== 'none').length : 0,
      secondaryProducts:catalog ? catalog.querySelectorAll('[data-secondary-product="1"]').length : 0,
      mbtiInfo,
      fChem,
      tChem,
      fOheng,
      tOheng,
      note6First:note6?.__timingQA?.firstBody || '',
      note6Second:note6?.__timingQA?.secondBody || '',
      note6Text:note6?.desc || '',
      resultGreeting:document.getElementById('resultSisterGreeting')?.innerText || '',
      catalogText:catalog?.innerText || '',
      noteBadges:notes.map((n) => n.badge || ''),
      share,
    };
  });
  assert(ui.result, 'production-like result missing');
  assert(ui.catalog, 'product catalog not rendered');
  assert(ui.buttons === 4, `product catalog buttons ${ui.buttons}`);
  assert(ui.visibleProducts === 4 && ui.secondaryProducts === 3, `premium catalog should keep one recommendation prominent while all alternatives stay discoverable: ${JSON.stringify({visible:ui.visibleProducts,secondary:ui.secondaryProducts})}`);
  assert(norm(ui.note6First) !== norm(ui.note6Second), 'production-like NOTE6 copied');
  assert(ui.resultGreeting.includes('딱 우리') && ui.resultGreeting.includes('언니랑 같이 보자'), `F result greeting lost 1:1 voice: ${ui.resultGreeting}`);
  assert(ui.catalogText.includes('언니가 지금 하나만 먼저 골라줄게') && ui.catalogText.includes('다른 리포트도 있어') && !ui.catalogText.includes('다른 리포트 3개 보기'), 'F premium recommendation/discoverability handoff missing');
  assert(ui.mbtiInfo.gradeText.includes('재미로 보는 사주 MBTI 번역') && ui.mbtiInfo.gradeText.includes('실제 검사 MBTI와 다를 수 있어'), `MBTI risk framing missing: ${JSON.stringify(ui.mbtiInfo)}`);
  assert(ui.mbtiInfo.fontSize <= 38 && ui.mbtiInfo.oneLineBeforeThreeLine && ui.mbtiInfo.threeLineBeforeMbti && ui.mbtiInfo.mbtiBeforeChem, `result hierarchy must be one-line → 3-line → MBTI → chemistry: ${JSON.stringify(ui.mbtiInfo)}`);
  assert(ui.fChem.best.includes('rose') && ui.fChem.worst.includes('violet') && ui.fChem.bestTitle === '환상의 찰떡 깐부' && ui.fChem.worstTitle === '기 빨리는 상극', `F chemistry theme drift: ${JSON.stringify(ui.fChem)}`);
  assert(ui.tChem.best.includes('sky') && ui.tChem.worst.includes('slate') && ui.tChem.bestTitle === '최강 시너지' && ui.tChem.worstTitle === '충돌 많은 상극', `T chemistry theme drift: ${JSON.stringify(ui.tChem)}`);
  assert(ui.fOheng.includes('언니가') && !ui.fOheng.includes('로아가'), `F five-element voice should use generic 언니: ${ui.fOheng}`);
  assert(ui.tOheng.includes('언니가') && !ui.tOheng.includes('서아가'), `T five-element voice should use generic 언니: ${ui.tOheng}`);
  assert(await page.locator('#sisterSwitchCard').count() === 0, 'bottom F/T mode-switch CTA must be removed');
  assert(ui.noteBadges.every((x) => x.length <= 16), `visible NOTE badges too long: ${JSON.stringify(ui.noteBadges)}`);
  assert(ui.noteBadges.join('|').includes('유독 지치는 이유') && ui.noteBadges.join('|').includes('번아웃 패턴') && ui.noteBadges.join('|').includes('지금 진짜 문제') && ui.noteBadges.join('|').includes('회복 처방') && ui.noteBadges.join('|').includes('나를 편하게 하는 사람') && ui.noteBadges.join('|').includes('회복 흐름이 들어올 때'), `mental NOTE badges are not direct enough: ${JSON.stringify(ui.noteBadges)}`);
  assert(!ui.noteBadges.some((x) => /·|핵심|사람 필터|7일 처방/.test(x)), `old technical NOTE badges remain: ${JSON.stringify(ui.noteBadges)}`);
  assert(ui.share.version === '4', `story card version ${ui.share.version}`);
  assert(ui.share.text.includes('사주 성향을 MBTI로 번역하면') && ui.share.text.includes('나를 설명하는 3문장') && ui.share.text.includes('링크 스티커 붙이는 자리'), 'story card identity/share copy missing');
  assert(ui.share.core && ui.share.strong && ui.share.need, `story card element strip missing: ${JSON.stringify(ui.share)}`);
  assert(ui.share.avatar === './로아.png', `F story avatar mismatch: ${ui.share.avatar}`);
  assert(await page.locator('#mainShareBtnText').innerText() === '이거, 한 장으로 예쁘게 뽑아볼까?', 'F share CTA persona copy missing');
  assert(await page.locator('#shareModalClose').isVisible(), 'top share-modal close button missing');
  assert(await page.locator('#storyShareBtn').count() === 0, 'duplicate Instagram/share action must be removed');
  assert((await page.locator('#storySaveBtn').innerText()).includes('화면 그대로 캡처하기'), 'story CTA must use direct capture mode');

  const modalCardBox = await page.locator('#storyCard').boundingBox();
  assert(modalCardBox && modalCardBox.width <= 332, `share-modal card should stay compact before capture: ${JSON.stringify(modalCardBox)}`);

  await page.locator('#storySaveBtn').click();
  await page.waitForSelector('#storyCaptureMode', { state:'visible', timeout:5000 });
  const captureOpen = await page.evaluate(() => {
    const layer = document.getElementById('storyCaptureMode');
    const card = document.getElementById('storyCard');
    const top = document.elementFromPoint(4,4);
    return {
      cardParent:card?.parentElement?.id || '',
      layerDisplay:getComputedStyle(layer).display,
      layerZ:Number(getComputedStyle(layer).zIndex || 0),
      shareZ:Number(getComputedStyle(document.getElementById('shareModal')).zIndex || 0),
      topInsideCapture:!!top?.closest?.('#storyCaptureMode'),
      chromeDisplay:getComputedStyle(document.getElementById('storyCaptureChrome')).display,
    };
  });
  assert(captureOpen.cardParent === 'storyCaptureCardSlot' && captureOpen.layerDisplay !== 'none', `real card was not moved into capture layer: ${JSON.stringify(captureOpen)}`);
  assert(captureOpen.layerZ > captureOpen.shareZ && captureOpen.topInsideCapture, `capture layer does not fully cover the app UI: ${JSON.stringify(captureOpen)}`);
  assert(captureOpen.chromeDisplay !== 'none', 'capture instructions should be visible before clean mode');

  const captureCardBox = await page.locator('#storyCard').boundingBox();
  assert(captureCardBox && captureCardBox.x >= 0 && captureCardBox.y >= 0 && captureCardBox.width <= 390 && captureCardBox.width >= 350, `capture card is not maximizing the mobile viewport: ${JSON.stringify(captureCardBox)}`);
  assert(Math.abs(captureCardBox.height / captureCardBox.width - 16/9) < 0.03, `capture card ratio drift: ${JSON.stringify(captureCardBox)}`);

  await page.locator('#storyCaptureReady').click();
  await page.waitForFunction(() => getComputedStyle(document.getElementById('storyCaptureChrome')).display === 'none');
  const cleanCapture = await page.evaluate(() => {
    const layer = document.getElementById('storyCaptureMode');
    const top = document.elementFromPoint(4,4);
    return {
      clean:layer?.dataset?.clean,
      topInsideCapture:!!top?.closest?.('#storyCaptureMode'),
      bodyOverflow:getComputedStyle(document.body).overflow,
      oldImageFallback:!!document.getElementById('unniImageFallback') && getComputedStyle(document.getElementById('unniImageFallback')).display !== 'none',
      oldKakaoGuide:!!document.getElementById('unniKakaoCardQualityGuide'),
    };
  });
  assert(cleanCapture.clean === '1' && cleanCapture.topInsideCapture && cleanCapture.bodyOverflow === 'hidden', `clean capture mode is not isolated: ${JSON.stringify(cleanCapture)}`);
  assert(!cleanCapture.oldImageFallback && !cleanCapture.oldKakaoGuide, 'capture mode must not use rendered-image fallbacks');

  await page.locator('#storyCaptureMode').click({ position:{ x:4, y:4 } });
  await page.waitForFunction(() => getComputedStyle(document.getElementById('storyCaptureChrome')).display !== 'none');
  await page.locator('#storyCaptureClose').click();
  await page.waitForFunction(() => getComputedStyle(document.getElementById('storyCaptureMode')).display === 'none');
  assert(await page.locator('#storyCard').evaluate((el) => el.parentElement?.id !== 'storyCaptureCardSlot'), 'story card was not restored after capture mode');

  const shareEngine = await page.evaluate(async () => {
    const engine = window.__UNNI_IMAGE_EXPORT_V2__;
    let called = false;
    let fileCount = 0;
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: async (payload) => { called = true; fileCount = payload?.files?.length || 0; },
    });
    Object.defineProperty(navigator, 'canShare', {
      configurable: true,
      value: (payload) => Array.isArray(payload?.files) && payload.files.length > 0,
    });
    const ok = await engine.nativeSharePng(new Blob(['png'], { type:'image/png' }), 'mobile-test.png', 'test');
    return { version:engine?.version, called, fileCount, ok };
  });
  assert(shareEngine.version === '2.5.0' && shareEngine.ok && shareEngine.called && shareEngine.fileCount === 1, `shared paid-image engine path failed: ${JSON.stringify(shareEngine)}`);

  await page.evaluate(() => history.back());
  await page.waitForFunction(() => !isShareModalOpen());
  const backState = await page.evaluate(() => ({
    modalOpen:isShareModalOpen(),
    resultDisplay:getComputedStyle(document.getElementById('resultSection')).display,
    hasResult:!!currentResultData,
  }));
  assert(!backState.modalOpen && backState.hasResult && backState.resultDisplay !== 'none', `browser back did not return to result: ${JSON.stringify(backState)}`);

  const originalUA = await page.evaluate(() => navigator.userAgent);
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'userAgent', {
      configurable:true,
      get:() => 'Mozilla/5.0 (Linux; Android 15) AppleWebKit/537.36 KAKAOTALK/25.7.1',
    });
    openShareModal();
  });
  await page.locator('#storySaveBtn').click();
  await page.waitForSelector('#storyCaptureMode', { state:'visible', timeout:5000 });
  assert(await page.locator('#unniKakaoCardQualityGuide').count() === 0, 'Kakao should use the same direct screenshot mode, not a degraded-image warning');
  assert(await page.evaluate(() => window.__UNNI_IMAGE_EXPORT_V2__.isKakaoInApp('KAKAOTALK/25.7.1')), 'Kakao UA detection failed');
  await page.locator('#storyCaptureClose').click();
  await page.evaluate((ua) => {
    Object.defineProperty(navigator, 'userAgent', { configurable:true, get:() => ua });
    history.back();
  }, originalUA);
  await page.waitForFunction(() => !isShareModalOpen());

  assert(await page.locator('#landingVaultEntry').evaluate((el) => getComputedStyle(el).display) === 'none', 'landing vault must stay hidden while feature is paused');
  assert(await page.locator('#unniVaultEntry').evaluate((el) => getComputedStyle(el).display) === 'none', 'result vault must stay hidden while feature is paused');
  await page.evaluate(() => openUnniVault());
  assert(await page.locator('#unniVaultModal').evaluate((el) => getComputedStyle(el).display) === 'none', 'paused vault must not open');

  await page.evaluate(() => openUnniProduct('full_saju'));
  await page.waitForSelector('#unniProductModal', { state:'visible' });
  let modal = await page.locator('#unniProductModal').innerText();
  assert(modal.includes('내 전체 사주판') && modal.includes('무료 이벤트로 미리보기'), 'full_saju modal setup missing');
  await page.locator('#unniProductAction').click();
  modal = await page.locator('#unniProductModal').innerText();
  const fullSections = await page.locator('#unniProductBody section').count();
  assert(fullSections === 12, `full_saju section count ${fullSections}`);
  assert(modal.includes('내 사주 전체 한 줄 요약') && modal.includes('평생 가져갈 내 사용법 3가지'), 'full_saju preview content missing');
  assert(modal.includes('지금 선택한 고민을 또 풀어쓰는 리포트가 아니야'), 'full_saju differentiation copy missing');
  assert(await page.locator('#unniProductSaveAll').isVisible(), 'full_saju full-report save button missing');
  assert((await page.locator('#unniProductSaveAll').innerText()).includes('사진으로 한 번에 저장하기'), 'one-action paid save CTA missing');
  assert(await page.locator('#unniProductSavePdf').isVisible(), 'single-file PDF keep action missing');
  await page.evaluate(() => {
    window.__originalPrintForTest = window.print;
    window.__paidPrintCallCount = 0;
    window.print = () => { window.__paidPrintCallCount += 1; };
  });
  await page.locator('#unniProductSavePdf').click();
  const pdfPrint = await page.evaluate(() => ({
    calls:window.__paidPrintCallCount || 0,
    host:document.getElementById('unniPaidPrintHost')?.innerText || '',
    sections:document.querySelectorAll('#unniPaidPrintHost section').length,
  }));
  assert(pdfPrint.calls === 1 && pdfPrint.host.includes('내 전체 사주판') && pdfPrint.sections >= 12, `PDF button must call current-window print with a complete print view: ${JSON.stringify(pdfPrint)}`);
  await page.evaluate(() => {
    window.print = window.__originalPrintForTest;
    delete window.__originalPrintForTest;
    document.getElementById('unniPaidPrintHost')?.remove();
    document.getElementById('unniPaidPrintStyle')?.remove();
  });
  assert(await page.locator('#unniProductStickyHead').evaluate((el) => getComputedStyle(el).position) === 'sticky', 'paid report header must remain sticky');
  await page.waitForFunction(() => document.getElementById('unniProductSaveHint')?.innerText.includes('저장 준비 완료'), null, { timeout:30000 });
  assert(await page.locator('#unniProductSaveAll').isEnabled(), 'paid save must be tappable as soon as prewarm is ready');
  const fullReportDownload = await Promise.all([
    page.waitForEvent('download', { timeout: 20000 }),
    page.locator('#unniProductSaveAll').click(),
  ]).then(([download]) => download);
  assert(fullReportDownload.suggestedFilename().includes('01_나를_이해하는_법') && fullReportDownload.suggestedFilename().endsWith('.png'), `semantic full report filename ${fullReportDownload.suggestedFilename()}`);

  await page.evaluate(() => {
    const e = window.__UNNI_IMAGE_EXPORT_V2__;
    window.__paidShareTest = { count:0, originals:{
      isMobileDevice:e.isMobileDevice,
      isKakaoInApp:e.isKakaoInApp,
      isAndroidDevice:e.isAndroidDevice,
      isIOSDevice:e.isIOSDevice,
    }};
    e.isMobileDevice = () => true;
    e.isKakaoInApp = () => false;
    e.isAndroidDevice = () => true;
    e.isIOSDevice = () => false;
    Object.defineProperty(navigator, 'share', {
      configurable:true,
      value:async (payload) => { window.__paidShareTest.count = payload?.files?.length || 0; },
    });
    Object.defineProperty(navigator, 'canShare', {
      configurable:true,
      value:(payload) => Array.isArray(payload?.files) && payload.files.length > 1,
    });
  });
  await page.locator('#unniProductSaveAll').click();
  await page.waitForFunction(() => window.__paidShareTest?.count > 1, null, { timeout:10000 });
  const mobilePaidShareCount = await page.evaluate(() => {
    const count = window.__paidShareTest.count;
    const e = window.__UNNI_IMAGE_EXPORT_V2__;
    Object.assign(e, window.__paidShareTest.originals);
    return count;
  });
  assert(mobilePaidShareCount === 4, `mobile full-saju should share four prepared images in one action, got ${mobilePaidShareCount}`);
  await page.locator('#unniProductClose').click();

  await page.evaluate(() => openUnniProduct('concern_bundle3'));
  const bundleChecked = await page.locator('#unniBundleChecks input:checked').evaluateAll((els) => els.map((el) => el.value));
  for (const key of bundleChecked) {
    const select = page.locator(`[data-bundle-situation="${key}"]`);
    const firstValue = await select.locator('option').nth(1).getAttribute('value');
    await select.selectOption(firstValue);
  }
  await page.locator('#unniProductAction').click();
  modal = await page.locator('#unniProductModal').innerText();
  const bundleArticles = await page.locator('#unniProductBody article').count();
  assert(bundleArticles === 18, `bundle3 NOTE card count ${bundleArticles}`);
  assert(await page.locator('#unniProductSaveAll').isVisible(), 'bundle3 full-report save missing');
  await page.locator('#unniProductClose').click();

  await page.evaluate(() => openUnniProduct('compatibility'));
  modal = await page.locator('#unniProductModal').innerText();
  assert(modal.includes('오전/오후') && modal.includes('몇 시') && modal.includes('몇 분') && modal.includes('태어난 시간을 몰라요'), 'human-readable partner time UI missing');
  assert(!modal.includes('HH:MM'), 'technical HH:MM leaked into compatibility UI');
  await page.fill('#partnerName', '상대');
  await page.fill('#partnerBirth', '19990511');
  await page.selectOption('#partnerAmpm', 'pm');
  await page.selectOption('#partnerHour12', '12');
  await page.selectOption('#partnerMinute', '00');
  await page.locator('#unniProductAction').click();
  modal = await page.locator('#unniProductModal').innerText();
  const compatibilitySections = await page.locator('#unniProductBody section').count();
  assert(compatibilitySections === 16, `compatibility section count ${compatibilitySections}`);
  assert(modal.includes('우리 둘 궁합 · 16개 챕터'), 'compatibility chapter intro missing');
  assert(modal.includes('처음 서로에게 끌리는 이유') && modal.includes('싸움이 커지는 순서') && modal.includes('싸운 뒤 화해하는 법') && modal.includes('돈과 현실 문제를 같이 다룰 때') && modal.includes('둘이 실제로 지키면 좋은 약속'), 'compatibility deep content missing');
  assert(await page.locator('#unniProductSaveAll').isVisible(), 'compatibility full-report save missing');
  await page.locator('#unniProductClose').click();

  await page.evaluate(() => openUnniProduct('all_in_one'));
  for (const key of ['money','career','love','path','people','mental']) {
    const select = page.locator(`[data-all-situation="${key}"]`);
    if (!(await select.inputValue())) {
      const firstValue = await select.locator('option').nth(1).getAttribute('value');
      await select.selectOption(firstValue);
    }
  }
  await page.locator('#unniProductAction').click();
  modal = await page.locator('#unniProductModal').innerText();
  for (const label of ['돈·재물','학업·직장','연애·썸','진로·적성','사람·관계','마음·스트레스']) assert(modal.includes(label), `all-in-one missing ${label}`);
  const allInOneArticles = await page.locator('#unniProductBody article').count();
  assert(allInOneArticles === 36, `all-in-one NOTE card count ${allInOneArticles}`);
  assert(await page.locator('#unniProductSaveAll').isVisible(), 'all-in-one full-report save missing');
  await page.locator('#unniProductClose').click();

  const html = fs.readFileSync('index.html','utf8');
  assert(html.includes('./paid-value-layer-v1.js?v=1.4.0'), 'paid value script include missing');
  assert(html.includes('./premium-products-v1.js?v=1.6.0'), 'product script include missing');
  assert(html.indexOf('integrated-saju-profile-v1.js') < html.indexOf('paid-value-layer-v1.js'), 'script wrapper order wrong');
  assert(html.indexOf('paid-value-layer-v1.js') < html.indexOf('premium-products-v1.js'), 'product script order wrong');
  assert(html.includes('resume.productId !== "concern_single"'), 'product payment return delegation missing');
  assert(html.includes('__UNNI_IMAGE_EXPORT_V2__'), 'shared image export engine missing');
  assert(html.includes('UNNI_VAULT_ENABLED = false') && html.includes('id="unniVaultEntry"') && html.includes('id="unniVaultModal"'), 'paused vault scaffolding missing');
  assert(html.indexOf('data-unni-auth="kakao"') < html.indexOf('data-unni-auth="naver"'), 'Naver must follow Kakao in auth order');
  assert(html.includes('completeUnniAuth') && html.includes('__UNNI_AUTH_BRIDGE__'), 'auth bridge scaffolding missing');
  const premium = fs.readFileSync('premium-products-v1.js','utf8');
  assert(!premium.includes('unniProductKeepsake') && !premium.includes('keepsakeCardHtml') && !premium.includes('renderPaidKeepsake'), 'paid keepsake-card subsystem should be removed');
  assert(premium.includes('saveFullPaidReport') && premium.includes('unniProductSaveAll'), 'full paid-report image save missing');
  assert(premium.includes('prewarmPaidExport') && premium.includes('preparePaidExportAssets') && premium.includes('저장 준비 완료'), 'background paid-export preparation missing');
  assert(premium.includes('requiresFreshShareGesture') && premium.includes('setPaidExportButtonReady(root, false)') && premium.includes('setPaidExportButtonReady(root, true)'), 'mobile save must wait for prewarm before fresh-tap multi-share');
  assert(premium.includes('isCurrentPaidExport') && premium.includes('EXPORT_IDLE_CANCELLED'), 'stale paid-export jobs must stop when the report changes');
  assert(premium.includes('paidExportCache.clear()') && premium.includes('paidExportCache.set(key, prepared)'), 'paid PNG blob cache must stay bounded to the current report');
  assert(premium.includes('nativeSharePngFiles') && premium.includes('isMobileDevice'), 'one-action mobile multi-image share path missing');
  assert(premium.includes('recommendedProductId') && premium.includes('data-secondary-product') && premium.includes('다른 리포트도 있어'), 'personalized premium recommendation + discoverable alternatives missing');
  assert(!premium.includes('unniShowOtherProducts') && !premium.includes('다른 리포트 3개 보기'), 'premium alternatives should not be hidden behind a disclosure toggle');
  assert(premium.includes('unniProductSavePdf') && premium.includes('printPaidReport') && premium.includes('window.print()') && premium.includes('unniPaidPrintHost'), 'single-file PDF current-window print path missing');
  assert(premium.includes('buildPaidExportGroups') && premium.includes('data-export-kind="full"') && premium.includes('data-export-kind="compat"') && premium.includes('data-export-kind="concern"'), 'semantic paid-report grouping missing');
  assert(premium.includes('나를 이해하는 법') && premium.includes('대화하고 싸우고 화해하는 법') && premium.includes('어떻게 움직일지'), 'human-readable export group titles missing');
  assert(html.includes('showImagePagesFallback'), 'multi-image mobile fallback missing');
  assert(!html.includes('id="storyShareBtn"') && !html.includes('인스타에 올릴 사진 열기'), 'duplicate Instagram save/share UI remains');
  assert(html.includes('isKakaoInApp') && html.includes('showImageSaveFallback'), 'Kakao in-app save fallback missing');
  assert(html.includes('openStoryCaptureMode') && html.includes('storyCaptureMode') && html.includes('storyCaptureCardSlot') && html.includes('화면 그대로 캡처하기'), 'direct card screenshot mode missing');
  assert(html.includes('requestFullscreen') && html.includes('storyCaptureReady'), 'capture clean-view/fullscreen enhancement missing');
  assert(!html.includes('showKakaoCardQualityGuide') && !html.includes('saveInstaCardImage') && !html.includes('prepareStoryCardAsset'), 'obsolete rendered story-card save path remains');
  assert(html.includes('__UNNI_IMAGE_EXPORT_V2__') && html.includes('version: "2.5.0"'), 'image export behavior version missing');
  assert(html.includes('history.pushState') && html.includes('shareModal: true'), 'share modal history guard missing');
  assert(html.includes('CONCERN_SITUATIONS') && html.includes('selectedConcernSituation'), 'concern situation picker missing');
  assert(html.includes('concernSituationSummary') && html.includes('editConcernSituation'), 'progressive mobile concern summary/edit flow missing');
  assert(!html.includes('정확한 만세력 조회를 위해 적어줘') && !html.includes('출생기록에 적힌 시각을 입력하면 더 정확해'), 'old birth-time helper copy remains');
  assert(!html.includes('🥺') && !html.includes('💕') && !html.includes('💌') && !html.includes('ㅠㅠ'), 'excessive F emoticon copy remains in the main journey');
  assert(!html.includes('id="sisterSwitchCard"') && !html.includes('switchSisterMode()'), 'bottom F/T mode-switch CTA code remains');
  assert(!html.includes('로아가 보기엔') && !html.includes('서아가 딱 정리하면') && html.includes('언니가 보기엔') && html.includes('언니가 딱 정리하면'), 'five-element narrator should be generic 언니 in both modes');
  assert(!html.includes('사주 데이터로 까본 내 진짜 MBTI'), 'MBTI is still framed as a true diagnostic result');
  assert(html.includes('재미로 보는 사주 MBTI 번역') && html.includes('실제 검사 MBTI와 다를 수 있어'), 'MBTI playful-translation framing missing');
  assert(!html.includes('font-bold truncate text-right flex-1 min-w-0'), 'NOTE badge still forces ellipsis');
  assert(!html.includes('팩트만 적어뒀으니까 정신 똑바로 차리고 읽어봐'), 'old generic harsh T greeting remains');
  assert(premium.includes('data-bundle-situation') && premium.includes('data-all-situation'), 'premium situation selectors missing');
  assert(fs.readFileSync('paid-value-layer-v1.js','utf8').includes('SITUATION_PROFILES'), 'situation-aware paid copy layer missing');
  for (const staleCopy of ['내 본캐 스탯','내 사주 본캐 카드 저장하기','본캐 카드 저장']) assert(!html.includes(staleCopy), `stale share copy remains: ${staleCopy}`);

  for (const prodPath of ['index.html','premium-products-v1.js','paid-value-layer-v1.js','integrated-saju-profile-v1.js','classical-engine-v2.js','manse-korea-v2.js']) {
    const prodText = fs.readFileSync(prodPath, 'utf8');
    assert(!prodText.includes('원국'), `technical 원국 wording remains in ${prodPath}`);
  }

  const server = fs.readFileSync('functions/api/confirm-payment.js','utf8');
  for (const [id, price] of Object.entries({concern_single:990, ...expectedPrices})) {
    assert(server.includes(`${id}: { amount: ${price}`), `server product price missing ${id}/${price}`);
  }
  assert(server.includes('const product = productFor(order.data);'), 'server does not resolve signed product price');
  assert(server.includes('Number(body.amount) !== product.amount'), 'server does not reject amount mismatch');
  assert(server.includes('if (!d.p || d.p === "concern_single") return legacy;'), 'legacy 990 result key compatibility missing');

  assert(errors.length === 0, `browser errors: ${errors.join(' | ')}`);
  console.log('PAID_VALUE_PRODUCT_PASS', JSON.stringify({
    rows:qa.rows.length,
    prices:expectedPrices,
    catalogButtons:ui.buttons,
    note6Distinct:true,
  }));
  await browser.close();
})().catch(err => { console.error(err.stack || err); process.exit(1); });
