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
    globalThis.__PAID_VALUE_LAYER_V1__?.version === '1.5.0' &&
    globalThis.__CONCERN_NOTE_ENGINE_V2__?.version === '3.2.1' &&
    globalThis.__UNNI_PRODUCTS_V1__?.version === '2.1.0' &&
    globalThis.__UNNI_PRODUCT_CONTENT_POLICY_V1__?.version === '1.1.0' &&
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
    const localNorm = (v) => String(v || '').replace(/<[^>]+>/g,' ').replace(/[\\s.,!?·‘’'"“”()\\[\\]]/g,'');
    const concerns = ['money','career','love','path','people','mental'];
    const exact = calculateAccurateManse(1998,2,21,'03:10','female');
    const other = calculateAccurateManse(1990,1,2,'12:00','female');
    const situations = globalThis.__CONCERN_NOTE_ENGINE_V2__?.situations || {};

    function prep(r, concern, situation, mode, birth='19980221', time='03:10') {
      return {
        ...r,
        name:'박태양',
        concernKey:concern,
        concernSituation:situation,
        userBirthStr:birth,
        userTimeKey:time,
        userGender:'female',
        userCalendar:'solar',
        currentMode:mode,
        rawSolutionTemplate:{F:{acts:[{d:'a'},{d:'b'}]},T:{acts:[{d:'a'},{d:'b'}]}},
      };
    }

    const situationRows = [];
    for (const concern of concerns) {
      for (const situation of Object.keys(situations[concern] || {})) {
        for (const mode of ['F','T']) {
          const data=prep(exact,concern,situation,mode);
          const diagnosis=buildConcernDiagnosisV2(data);
          const notes=generateConcernNotes(data,mode);
          const audit=auditPaidValueNotes(notes,mode);
          situationRows.push({
            concern,situation,mode,
            label:situations[concern][situation]?.label || '',
            diagnosis:{
              structureFingerprint:diagnosis.structureFingerprint,
              timingFingerprint:diagnosis.timingFingerprint,
            },
            noteAudit:data.noteV2Audit,
            notes:notes.map(n=>({
              badge:n.badge||'', title:n.title||'', desc:n.desc||'', checklist:n.checklist||'',
              timing:n.__timingQA||null,
            })),
            audit,
            allText:notes.map(n=>`${n.badge} ${n.title} ${n.desc} ${n.checklist||''}`).join(' '),
          });
        }
      }
    }

    const chartA=prep(exact,'love','relationship','F');
    const chartB=prep(other,'love','relationship','F','19900102','12:00');
    const diagA=buildConcernDiagnosisV2(chartA);
    const diagB=buildConcernDiagnosisV2(chartB);
    const notesA=generateConcernNotes(chartA,'F');
    const notesB=generateConcernNotes(chartB,'F');

    return {
      paidVersion:globalThis.__PAID_VALUE_LAYER_V1__,
      noteVersion:globalThis.__CONCERN_NOTE_ENGINE_V2__,
      productVersion:globalThis.__UNNI_PRODUCTS_V1__,
      products:globalThis.__UNNI_PRODUCTS_V1__.products,
      contracts:globalThis.__UNNI_PRODUCTS_V1__.contracts,
      policyVersion:globalThis.__UNNI_PRODUCT_CONTENT_POLICY_V1__?.version,
      wrappers:{
        noteV2:!!generateConcernNotes.__noteV2Wrapped,
        causal:!!generateConcernNotes.__classicalCausal,
      },
      situationRows,
      chartCompare:{
        diagA:{structureFingerprint:diagA.structureFingerprint,timingFingerprint:diagA.timingFingerprint},
        diagB:{structureFingerprint:diagB.structureFingerprint,timingFingerprint:diagB.timingFingerprint},
        diffs:notesA.map((n,i)=>localNorm(n.desc)!==localNorm(notesB[i].desc)),
      },
    };
  });

  assert(qa.paidVersion.version === '1.5.0', 'paid value layer missing');
  assert(qa.noteVersion.version === '3.2.1', 'NOTE v3 engine missing');
  assert(qa.productVersion.version === '2.1.0' && qa.policyVersion === '1.1.0', 'product/content policy layer missing');
  assert(qa.wrappers.noteV2 && qa.wrappers.causal, 'NOTE v3 causal wrapper missing');

  const expectedPrices = { concern_bundle3:2900, full_saju:4900, compatibility:5900, all_in_one:9900 };
  for (const [id, price] of Object.entries(expectedPrices)) assert(qa.products[id]?.price === price, `${id} price drift`);
  assert(qa.products.concern_bundle3.badge === '다른 고민 3개 확장' && qa.products.concern_bundle3.desc.includes('공통 구조'), 'bundle3 unique-value copy missing');
  assert(qa.products.full_saju.badge === '전체 구조 + 5년 흐름' && qa.products.full_saju.desc.includes('향후 5년'), 'full-saju long-horizon value copy missing');
  assert(qa.products.compatibility.badge === '두 사람 사주 교차' && qa.products.compatibility.desc.includes('상대 사주'), 'compatibility two-person value copy missing');
  assert(qa.products.all_in_one.name === '내 사주 완전판' && qa.products.all_in_one.badge === '나 한 사람 전체판' && qa.products.all_in_one.desc.includes('두 사람 궁합은 포함하지 않아'), 'all-in-one single-person boundary copy drift');
  for (const p of Object.values(qa.products)) assert(!/챕터|NOTE \d+/.test(`${p.badge} ${p.desc}`), 'technical product-volume wording remains');
  assert(qa.contracts.basic_concern?.timelineDepth === 'near-term-plus-long-pivot-teaser' && qa.contracts.basic_concern?.longTermDetail === 'teaser-only', 'basic concern disclosure contract missing');
  assert(qa.contracts.concern_bundle3?.concernCount === 3 && qa.contracts.concern_bundle3?.longTermDetail === 'teaser-only', 'bundle3 contract drift');
  assert(qa.contracts.full_saju?.longTermDetail === 'full-five-year' && qa.contracts.full_saju?.secondPersonRequired === false, 'full_saju contract drift');
  assert(qa.contracts.compatibility?.secondPersonRequired === true && qa.contracts.compatibility?.compatibilityAllowed === true, 'compatibility contract drift');
  assert(qa.contracts.all_in_one?.concernCount === 6 && qa.contracts.all_in_one?.compatibilityAllowed === false, 'all-in-one contract drift');

  assert(qa.situationRows.length === 48, `expected 48 situation/mode rows, got ${qa.situationRows.length}`);
  for (const row of qa.situationRows) {
    assert(row.notes.length === 6, `${row.concern}/${row.situation}/${row.mode}: note count ${row.notes.length}`);
    assert(row.noteAudit?.version === '3.2.1' && row.noteAudit?.structureFingerprint, `${row.concern}/${row.situation}/${row.mode}: NOTE v3 audit missing`);
    assert(row.noteAudit?.genericClusterDependency === false, `${row.concern}/${row.situation}/${row.mode}: generic cluster dependency returned`);
    assert(Array.isArray(row.noteAudit?.claims) && row.noteAudit.claims.length === 6, `${row.concern}/${row.situation}/${row.mode}: six causal claims missing`);
    for (const claim of row.noteAudit.claims) {
      assert(claim.rawFacts && claim.ditianRuleIds?.filter(Boolean).length && claim.zipingRuleIds?.filter(Boolean).length && claim.noteSentence,
        `${row.concern}/${row.situation}/${row.mode}: auditable rule provenance missing`);
    }

    const n1=String(row.notes[0]?.desc||'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
    const n2=String(row.notes[1]?.desc||'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
    const n4=String(row.notes[3]?.desc||'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
    const n5=String(row.notes[4]?.desc||'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();

    assert(n1.length >= 140 && n1.length <= 1200, `${row.concern}/${row.situation}/${row.mode}: NOTE1 classical-fusion size drift (${n1.length})`);
    assert(n2.length >= 140 && n2.length <= 1200, `${row.concern}/${row.situation}/${row.mode}: NOTE2 classical-fusion size drift (${n2.length})`);
    assert(n4.length >= 150 && n4.length <= 1400, `${row.concern}/${row.situation}/${row.mode}: NOTE4 classical-fusion action size drift (${n4.length})`);
    assert(n5.length >= 120 && n5.length <= 760, `${row.concern}/${row.situation}/${row.mode}: NOTE5 domain-fit size drift (${n5.length})`);
    assert(/시작|보통/.test(n2) && /갈림길|여기서|그리고/.test(n2), `${row.concern}/${row.situation}/${row.mode}: NOTE2 lacks concrete causal sequence`);
    assert(row.notes[5]?.timing?.concernSituation === row.situation, `${row.concern}/${row.situation}/${row.mode}: NOTE6 situation metadata missing`);
    assert(norm(row.notes[5]?.timing?.firstBody) !== norm(row.notes[5]?.timing?.secondBody), `${row.concern}/${row.situation}/${row.mode}: NOTE6 timing roles duplicated`);
    assert(row.audit?.hardTerms?.length === 0, `${row.concern}/${row.situation}/${row.mode}: hard saju jargon leaked`);
    assert(!row.allText.includes('계산값 그대로'), `${row.concern}/${row.situation}/${row.mode}: raw calculation dump leaked`);
    assert(!/(undefined|NaN|null)/.test(row.allText), `${row.concern}/${row.situation}/${row.mode}: bad token leaked`);
    for (const note of row.notes) assert((note.badge||'').length <= 16, `${row.concern}/${row.situation}/${row.mode}: NOTE badge too long ${note.badge}`);

  }

  for (const concern of ['money','career','love','path','people','mental']) {
    for (const mode of ['F','T']) {
      const rows=qa.situationRows.filter(r=>r.concern===concern && r.mode===mode);
      assert(rows.length===4, `${concern}/${mode}: expected four situations`);
      const sig=new Set(rows.map(r=>norm(`${r.notes[0].title} ${r.notes[1].desc} ${r.notes[3].desc}`)));
      assert(sig.size===4, `${concern}/${mode}: four situation outputs are not distinct`);
    }
    const fRows=qa.situationRows.filter(r=>r.concern===concern && r.mode==='F');
    const tRows=qa.situationRows.filter(r=>r.concern===concern && r.mode==='T');
    for (const fRow of fRows) {
      const tRow=tRows.find(r=>r.situation===fRow.situation);
      assert(tRow && fRow.diagnosis.structureFingerprint===tRow.diagnosis.structureFingerprint, `${concern}/${fRow.situation}: F/T natal reasoning diverged`);
      assert(fRow.diagnosis.timingFingerprint===tRow.diagnosis.timingFingerprint, `${concern}/${fRow.situation}: F/T timing reasoning diverged`);
      assert(norm(fRow.notes[0].desc)!==norm(tRow.notes[0].desc), `${concern}/${fRow.situation}: F/T voice renderer did not differ`);
    }
  }

  const loveF=Object.fromEntries(qa.situationRows.filter(r=>r.concern==='love'&&r.mode==='F').map(r=>[r.situation,r]));
  assert(/연락|서운|현재 연애/.test(loveF.relationship?.allText||''), 'relationship path lost current-relationship context');
  assert(/새 인연|새 사람/.test(loveF.new?.allText||'') && !/헤어진 이유/.test(loveF.new?.allText||''), 'new-person path mixed another love situation');
  assert(/이별|재회|헤어진/.test(loveF.breakup?.allText||''), 'breakup path lacks breakup context');
  assert(/썸|상대 반응/.test(loveF.crush?.allText||''), 'crush path lacks crush context');

  assert(qa.chartCompare.diagA.structureFingerprint !== qa.chartCompare.diagB.structureFingerprint, 'different charts share NOTE v3 structure fingerprint');
  assert(qa.chartCompare.diffs.filter(Boolean).length >= 4, 'different charts do not materially change enough NOTE outputs');

  // Production-like result path: verify catalog is actually visible and free-launch previews work.
  const ui = await page.evaluate(async () => {
    window.gtag = () => {};
    const originalPaymentAPI = paymentAPI;
    paymentAPI = async (body) => {
      if (body?.action === 'entitlements') {
        return {
          ok:true,
          verifiedPurchases:[],
          effectiveEntitlements:[],
          allInOneQuote:{
            targetProduct:'all_in_one',baseAmount:9900,creditAmount:0,amount:9900,
            alreadyOwned:false,creditedProducts:[],
          },
        };
      }
      return originalPaymentAPI(body);
    };
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

    const lockedCatalog = document.getElementById('unniProductLadder');
    const note2Preview = document.getElementById('note2PreviewCard');
    const fPaywallText = document.getElementById('lockedOverlay')?.innerText || '';
    const fNextTeaser = document.getElementById('paywallNextTeaser')?.innerText || '';
    const fFeatureCount = document.querySelectorAll('#payBoxFeatures > div').length;
    const previewPlain = note2Preview?.innerText || '';
    const previewBodyPlain = document.getElementById('note2PreviewBody')?.innerText || '';
    updateResultContentByMode('T');
    const tPaywallText = document.getElementById('lockedOverlay')?.innerText || '';
    const tNextTeaser = document.getElementById('paywallNextTeaser')?.innerText || '';
    const tFeatureCount = document.querySelectorAll('#payBoxFeatures > div').length;
    updateResultContentByMode('F');

    unlockFullReport(null, true);
    renderUnniProductCatalog();
    if (!FREE_LAUNCH_MODE) {
      for (let i=0; i<8 && !document.querySelector('#unniProductLadder [data-unni-product]'); i++) {
        await Promise.resolve();
      }
    }
    const catalog = document.getElementById('unniProductLadder');
    const unlockedNoteCards = document.querySelectorAll('#notesListContainer > div').length;
    const previewAfterUnlock = !!document.getElementById('note2PreviewCard');
    const fChem = {
      best:document.getElementById('chemBestCard')?.className || '',
      worst:document.getElementById('chemWorstCard')?.className || '',
      bestTitle:document.getElementById('chemBestTitle')?.textContent || '',
      worstTitle:document.getElementById('chemWorstTitle')?.textContent || '',
    };
    const fOheng = document.getElementById('ohengSummaryTxt')?.innerText || '';
    updateResultContentByMode('T');
    const tChem = {
      best:document.getElementById('chemBestCard')?.className || '',
      worst:document.getElementById('chemWorstCard')?.className || '',
      bestTitle:document.getElementById('chemBestTitle')?.textContent || '',
      worstTitle:document.getElementById('chemWorstTitle')?.textContent || '',
    };
    const tOheng = document.getElementById('ohengSummaryTxt')?.innerText || '';
    const tGreeting = document.getElementById('resultSisterGreeting')?.innerText || '';
    updateResultContentByMode('F');
    const fGreeting = document.getElementById('resultSisterGreeting')?.innerText || '';
    const mbtiInfo = {
      gradeText:document.getElementById('gradeSection')?.textContent || '',
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
      sourceFreeLaunch:FREE_LAUNCH_MODE,
      previewVisible:!!note2Preview && getComputedStyle(note2Preview).display !== 'none',
      paywallVisible:!!document.getElementById('lockedOverlay') && getComputedStyle(document.getElementById('lockedOverlay')).display !== 'none',
      result:!!currentResultData,
      lockedCatalog:!!lockedCatalog,
      previewPlain,
      previewBodyPlain,
      fullNote2Plain:String(notes[1]?.desc || '').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim(),
      fPaywallText,
      tPaywallText,
      fNextTeaser,
      tNextTeaser,
      fFeatureCount,
      tFeatureCount,
      unlockedNoteCards,
      previewAfterUnlock,
      catalog:!!catalog,
      buttons:catalog ? catalog.querySelectorAll('[data-unni-product]').length : 0,
      visibleProducts:catalog ? [...catalog.querySelectorAll('[data-unni-product]')].filter((el) => el.offsetParent !== null).length : 0,
      secondaryProducts:catalog ? catalog.querySelectorAll('[data-secondary-product="1"]').length : 0,
      otherToggle:!!catalog?.querySelector('#unniShowOtherProducts'),
      otherExpanded:catalog?.querySelector('#unniShowOtherProducts')?.getAttribute('aria-expanded') || '',
      otherVisible:catalog?.querySelector('#unniOtherProducts') ? getComputedStyle(catalog.querySelector('#unniOtherProducts')).display !== 'none' : false,
      mbtiInfo,
      fChem,
      tChem,
      fOheng,
      tOheng,
      tGreeting,
      fGreeting,
      note6First:note6?.__timingQA?.firstBody || '',
      note6Second:note6?.__timingQA?.secondBody || '',
      note6Text:note6?.desc || '',
      resultGreeting:document.getElementById('resultSisterGreeting')?.innerText || '',
      catalogText:catalog?.innerText || '',
      catalogReason:catalog?.querySelector('[data-recommendation-reason="1"]')?.innerText || '',
      noteBadges:notes.map((n) => n.badge || ''),
      share,
    };
  });
  assert(ui.result, 'production-like result missing');
  if (ui.sourceFreeLaunch) {
    assert(ui.lockedCatalog, 'free-launch mode should expose the post-report product catalog');
    assert(!ui.previewVisible && !ui.paywallVisible, 'free-launch mode must keep the 990 won lock UI hidden');
  } else {
    assert(!ui.lockedCatalog, 'premium upsells must not appear before the 990 won unlock');
    assert(ui.previewPlain && /NOTE 0?2/.test(ui.previewPlain), 'NOTE2 teaser missing before paywall');
    assert(ui.previewBodyPlain.length >= 30 && ui.previewBodyPlain.length < ui.fullNote2Plain.length, `NOTE2 teaser must show only a meaningful first slice: ${JSON.stringify({preview:ui.previewBodyPlain.length,full:ui.fullNote2Plain.length})}`);
    assert(ui.fPaywallText.includes('로아 언니 · 여기서 하나만 더 보자') && ui.fPaywallText.includes('무엇부터 덜어야') && ui.fPaywallText.includes('언니, 그것도 봐줘') && ui.fPaywallText.includes('990원'), `F conversion paywall handoff missing: ${ui.fPaywallText}`);
    assert(ui.tPaywallText.includes('서아 언니 · 마지막 기준만 보면 돼') && ui.tPaywallText.includes('부하 제거') && ui.tPaywallText.includes('응, 끝까지 봐줘') && ui.tPaywallText.includes('990원'), `T conversion paywall handoff missing: ${ui.tPaywallText}`);
    assert(ui.fFeatureCount === 3 && ui.tFeatureCount === 3, `paywall should stay compact with three benefit lines: ${JSON.stringify({f:ui.fFeatureCount,t:ui.tFeatureCount})}`);
    assert(ui.fNextTeaser.length >= 12 && ui.tNextTeaser.length >= 12 && ui.fNextTeaser !== ui.tNextTeaser, `actual locked-content teaser should be mode-specific: ${JSON.stringify({f:ui.fNextTeaser,t:ui.tNextTeaser})}`);
    assert(ui.fPaywallText.includes('NOTE2 다음부터 NOTE6까지') && ui.tPaywallText.includes('NOTE2 다음부터 NOTE6까지') && !/오픈 체험가/.test(ui.fPaywallText + ui.tPaywallText), '990 won unlock scope or stale sale badge drift');
  }
  assert(ui.unlockedNoteCards === 6 && !ui.previewAfterUnlock, `unlock must replace teaser with all six full notes: ${JSON.stringify({cards:ui.unlockedNoteCards,preview:ui.previewAfterUnlock})}`);
  assert(ui.catalog, 'product catalog should render after the 990 won report unlock');
  assert(ui.buttons === 4, `product catalog buttons ${ui.buttons}`);
  assert(ui.visibleProducts === 1 && ui.secondaryProducts === 3 && ui.otherToggle && ui.otherExpanded === 'false' && !ui.otherVisible, `premium catalog should show one recommendation first and keep three alternatives folded but discoverable: ${JSON.stringify({visible:ui.visibleProducts,secondary:ui.secondaryProducts,otherToggle:ui.otherToggle,otherExpanded:ui.otherExpanded,otherVisible:ui.otherVisible})}`);
  assert(norm(ui.note6First) !== norm(ui.note6Second), 'production-like NOTE6 copied');
  assert(ui.fGreeting.includes('언니가 보니까') && ui.fGreeting.includes('제일 먼저 눈에 들어오는 건 이거야') && !ui.fGreeting.includes('ㅎㅎ') && ui.fGreeting.length <= 90, `F result intro should feel warm and distinct: ${ui.fGreeting}`);
  assert(ui.tGreeting.includes('먼저 봐야 할 건 이거야') && ui.tGreeting.length <= 80, `T result intro should feel concise but caring: ${ui.tGreeting}`);
  assert(
    ui.catalogReason.length >= 10 &&
    ui.catalogText.includes('다른 방향 3개도 보기') &&
    (ui.catalogText.includes('상대 사주까지 겹쳐야 나오는') || ui.catalogText.includes('나 전체 구조 · 영역 연결 · 5년 흐름')) &&
    !ui.catalogText.includes('언니라면 이걸 먼저 이어서 볼 것 같아') &&
    !ui.catalogText.includes('다음으로 볼 가치는 이게 제일 커') &&
    !ui.catalogText.includes('방금 같이 본 얘기는 반복하지 않고') &&
    !ui.catalogText.includes('방금 본 내용과 겹치는 건 빼고'),
    'post-NOTE6 continuation is not compact enough'
  );
  assert(ui.mbtiInfo.gradeText.includes('재미로 보는 사주 MBTI 번역') && ui.mbtiInfo.gradeText.includes('실제 검사 MBTI와 다를 수 있어'), `MBTI risk framing missing: ${JSON.stringify(ui.mbtiInfo)}`);
  assert(ui.mbtiInfo.fontSize <= 38 && ui.mbtiInfo.oneLineBeforeThreeLine && ui.mbtiInfo.threeLineBeforeMbti && ui.mbtiInfo.mbtiBeforeChem, `result hierarchy must preserve one-line → 3-line and optional MBTI → chemistry order: ${JSON.stringify(ui.mbtiInfo)}`);
  assert(ui.fChem.best.includes('rose') && ui.fChem.worst.includes('violet') && ui.fChem.bestTitle === '환상의 찰떡 깐부' && ui.fChem.worstTitle === '기 빨리는 상극', `F chemistry theme drift: ${JSON.stringify(ui.fChem)}`);
  assert(ui.tChem.best.includes('sky') && ui.tChem.worst.includes('slate') && ui.tChem.bestTitle === '최강 시너지' && ui.tChem.worstTitle === '충돌 많은 상극', `T chemistry theme drift: ${JSON.stringify(ui.tChem)}`);
  assert(ui.fOheng.includes('이 제일 강해') && ui.fOheng.includes('같은 장면이 반복되는 부분이 보여') && ui.fOheng.includes('바로 아래 비밀 메모') && !/\d+%/.test(ui.fOheng) && ui.fOheng.length <= 260, `F five-element secret-note teaser drift: ${ui.fOheng}`);
  assert(ui.tOheng.includes('중요한 건 이 차이가 지금 고민에서 어떤 반복을 만드는지야') && ui.tOheng.includes('바로 아래 비밀 메모') && !/\d+%/.test(ui.tOheng) && ui.tOheng.length <= 235, `T five-element secret-note teaser drift: ${ui.tOheng}`);
  assert(await page.locator('#sisterSwitchCard').count() === 0, 'bottom F/T mode-switch CTA must be removed');
  assert(ui.noteBadges.every((x) => x.length <= 16), `visible NOTE badges too long: ${JSON.stringify(ui.noteBadges)}`);
  assert(ui.noteBadges.join('|').includes('마음 핵심') && ui.noteBadges.join('|').includes('지치는 패턴') && ui.noteBadges.join('|').includes('진짜 원인') && ui.noteBadges.join('|').includes('이번 주 행동') && ui.noteBadges.join('|').includes('회복 환경') && ui.noteBadges.join('|').includes('회복 시기'), `mental NOTE v2 badges are not direct enough: ${JSON.stringify(ui.noteBadges)}`);
  assert(!ui.noteBadges.some((x) => /·|사람 필터|7일 처방|놓친 포인트/.test(x)), `old technical NOTE badges remain: ${JSON.stringify(ui.noteBadges)}`);
  assert(ui.share.version === '5', `story card version ${ui.share.version}`);
  assert(ui.share.text.includes('사주 성향을 MBTI로 번역하면') && ui.share.text.includes('나를 설명하는 3문장') && ui.share.text.includes('너는 뭐 나왔어?') && ui.share.text.includes('나도 내 결과 보기') && ui.share.text.includes('sajuft.com'), 'story card viral/share copy missing');
  assert(ui.share.core && ui.share.strong && ui.share.need, `story card element strip missing: ${JSON.stringify(ui.share)}`);
  assert(ui.share.avatar === './로아.png', `F story avatar mismatch: ${ui.share.avatar}`);
  await page.evaluate(() => closeShareModal(true));
  assert((await page.locator('#mainShareBtnText').innerText()).includes('인스타 스토리'), 'main share CTA should keep the actual story action explicit');
  assert(await page.locator('#storyShareBtn').count() === 0, 'duplicate Instagram/share action must be removed');

  await page.locator('#mainShareBtn').click();
  await page.waitForSelector('#storyCaptureMode', { state:'visible', timeout:5000 });
  assert(await page.locator('#shareModal').isHidden(), 'one-tap story CTA should bypass the intermediate share modal');
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
  const captureGuideText = await page.locator('#storyCaptureChrome').innerText();
  assert(captureGuideText.includes('화면 아무 데나 한 번 톡') && captureGuideText.includes('바로 결과로 돌아가'), 'capture prep must make the return gesture obvious');

  const captureCardBox = await page.locator('#storyCard').boundingBox();
  assert(captureCardBox && captureCardBox.x >= 0 && captureCardBox.y >= 0 && captureCardBox.width <= 390 && captureCardBox.width >= 350, `capture card is not maximizing the mobile viewport: ${JSON.stringify(captureCardBox)}`);
  assert(Math.abs(captureCardBox.height / captureCardBox.width - 16/9) < 0.03, `capture card ratio drift: ${JSON.stringify(captureCardBox)}`);
  const cardFill = await page.evaluate(() => {
    const card = document.getElementById('storyCard').getBoundingClientRect();
    const sticker = document.getElementById('cardStickerBox').getBoundingClientRect();
    const viral = document.getElementById('cardViralPrompt').getBoundingClientRect();
    return {
      bottomGap:card.bottom - sticker.bottom,
      viralVisible:viral.top > card.top && viral.bottom < card.bottom,
      viralHeight:viral.height,
      stickerInside:sticker.bottom <= card.bottom + 1,
    };
  });
  assert(cardFill.bottomGap >= 0 && cardFill.bottomGap < 42 && cardFill.viralVisible && cardFill.viralHeight >= 66 && cardFill.stickerInside, `story card should use the lower space cleanly: ${JSON.stringify(cardFill)}`);

  await page.evaluate(() => {
    window.__fullscreenCalls = 0;
    document.documentElement.requestFullscreen = async () => { window.__fullscreenCalls += 1; };
  });
  const cleanStartedAt = Date.now();
  await page.locator('#storyCaptureReady').click();
  await page.waitForFunction(() => getComputedStyle(document.getElementById('storyCaptureChrome')).display === 'none', null, { timeout:6000 });
  const fullscreenQA = await page.evaluate(() => ({
    calls:window.__fullscreenCalls || 0,
    clean:getComputedStyle(document.getElementById('storyCaptureChrome')).display === 'none',
  }));
  assert(fullscreenQA.calls === 1 && fullscreenQA.clean, `fullscreen clean flow failed: ${JSON.stringify(fullscreenQA)}`);
  assert(fs.readFileSync('index.html','utf8').includes('fullscreenEntered ? 3200 : 180'), 'fullscreen system-notice delay source missing');
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

  assert(await page.locator('#storyCaptureMode').isVisible(), 'clean capture should stay open until the user taps');
  await page.locator('#storyCaptureMode').click({ position:{ x:4, y:4 }, force:true });
  await page.waitForFunction(() => getComputedStyle(document.getElementById('storyCaptureMode')).display === 'none');
  assert(await page.locator('#storyCard').evaluate((el) => el.parentElement?.id !== 'storyCaptureCardSlot'), 'story card was not restored after capture mode');
  assert(await page.locator('#shareModal').isHidden(), 'direct capture close should return straight to the result');

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
  assert(shareEngine.version === '2.8.0' && shareEngine.ok && shareEngine.called && shareEngine.fileCount === 1, `shared paid-image engine path failed: ${JSON.stringify(shareEngine)}`);

  const originalUA = await page.evaluate(() => navigator.userAgent);
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'userAgent', {
      configurable:true,
      get:() => 'Mozilla/5.0 (Linux; Android 15) AppleWebKit/537.36 KAKAOTALK/25.7.1',
    });
  });
  await page.locator('#mainShareBtn').click();
  await page.waitForSelector('#storyCaptureMode', { state:'visible', timeout:5000 });
  assert(await page.locator('#unniKakaoCardQualityGuide').count() === 0, 'Kakao should use the same direct screenshot mode, not a degraded-image warning');
  assert(await page.evaluate(() => window.__UNNI_IMAGE_EXPORT_V2__.isKakaoInApp('KAKAOTALK/25.7.1')), 'Kakao UA detection failed');
  await page.locator('#storyCaptureClose').click();
  await page.evaluate((ua) => {
    Object.defineProperty(navigator, 'userAgent', { configurable:true, get:() => ua });
  }, originalUA);
  assert(await page.locator('#shareModal').isHidden(), 'Kakao direct capture should return straight to result');

  assert(await page.locator('#landingVaultEntry').evaluate((el) => getComputedStyle(el).display) === 'none', 'landing vault must stay hidden while feature is paused');
  assert(await page.locator('#unniVaultEntry').evaluate((el) => getComputedStyle(el).display) === 'none', 'result vault must stay hidden while feature is paused');
  await page.evaluate(() => openUnniVault());
  assert(await page.locator('#unniVaultModal').evaluate((el) => getComputedStyle(el).display) === 'none', 'paused vault must not open');

  await page.evaluate(() => openUnniProduct('full_saju'));
  await page.waitForSelector('#unniProductModal', { state:'visible' });
  let modal = await page.locator('#unniProductModal').innerText();
  const sourceFreeLaunch = await page.evaluate(() => FREE_LAUNCH_MODE);
  const initialActionText = await page.locator('#unniProductAction').innerText();
  assert(modal.includes('내 전체 사주판'), 'full_saju modal setup missing');
  assert(
    sourceFreeLaunch
      ? initialActionText.includes('무료 이벤트')
      : initialActionText.includes('내 전체 사주판 보기 · 4,900원'),
    `free/paid toggle UI mismatch: sourceFreeLaunch=${sourceFreeLaunch}, action=${initialActionText}`
  );

  // Always verify the opposite state too, without changing the source file.
  // Paid mode first verifies entitlements and intentionally fails closed if the
  // server is unavailable. Stub only that read so this assertion tests the
  // FREE_LAUNCH_MODE UI switch rather than local-server availability.
  await page.evaluate(() => {
    const originalPaymentAPI = paymentAPI;
    paymentAPI = async (body) => {
      if (body?.action === 'entitlements') {
        return {
          ok:true,
          verifiedPurchases:[],
          effectiveEntitlements:[],
          allInOneQuote:{
            targetProduct:'all_in_one',baseAmount:9900,creditAmount:0,amount:9900,
            alreadyOwned:false,creditedProducts:[],
          },
        };
      }
      return originalPaymentAPI(body);
    };
    FREE_LAUNCH_MODE = !FREE_LAUNCH_MODE;
  });
  await page.locator('#unniProductClose').click();
  await page.evaluate(() => openUnniProduct('full_saju'));
  await page.waitForSelector('#unniProductModal', { state:'visible' });
  const oppositeActionText = await page.locator('#unniProductAction').innerText();
  assert(
    sourceFreeLaunch
      ? oppositeActionText.includes('내 전체 사주판 보기 · 4,900원')
      : oppositeActionText.includes('무료 이벤트'),
    `opposite free/paid toggle UI mismatch: sourceFreeLaunch=${sourceFreeLaunch}, action=${oppositeActionText}`
  );

  // The rest of this regression inspects the unlocked report without opening a real checkout.
  await page.evaluate(() => { FREE_LAUNCH_MODE = true; });
  await page.locator('#unniProductClose').click();
  await page.evaluate(() => openUnniProduct('full_saju'));
  await page.waitForSelector('#unniProductModal', { state:'visible' });
  await page.locator('#unniProductAction').click();
  modal = await page.locator('#unniProductModal').innerText();
  const fullSections = await page.locator('#unniProductBody section').count();
  assert(fullSections === 12, `full_saju section count ${fullSections}`);
  assert(modal.includes('내 사주 전체 핵심') && modal.includes('큰 흐름 전환 + 평생 사용법'), 'full_saju preview content missing');
  assert((modal.includes('방금 본 고민 하나를 길게 반복하는 결과가 아니야') || modal.includes('지금 고민 하나를 또 풀어쓰는 결과가 아니야')) && modal.includes('앞으로 5년 큰 흐름'), 'full_saju differentiation/long-term content missing');
  assert(await page.locator('#unniProductBody [data-product-contract="full_saju"]').count()===1,'full_saju contract marker missing');
  assert(await page.locator('#unniProductBody [data-structure-fingerprint]').getAttribute('data-structure-fingerprint'),'full_saju reasoning fingerprint missing');
  assert(await page.locator('#unniProductSaveAll').isVisible(), 'full_saju full-report save button missing');
  assert((await page.locator('#unniProductSaveAll').innerText()).includes('사진으로 한 번에 저장하기'), 'one-action paid save CTA missing');
  assert(await page.locator('#unniProductSavePdf').count() === 0, 'PDF save UI must be removed');
  assert(await page.locator('#unniProductStickyHead').evaluate((el) => getComputedStyle(el).position) === 'sticky', 'paid report header must remain sticky');
  await page.waitForFunction(() => /저장할 사진 준비됐어|저장 준비 완료/.test(document.getElementById('unniProductSaveHint')?.innerText || ''), null, { timeout:30000 });
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
  assert(await page.locator('#unniProductBody [data-product-exclusive="concern_bundle3"]').count()===1,'bundle3 shared-structure exclusive block missing');
  assert(await page.locator('#unniProductBody [data-export-kind="full"]').count()===0,'bundle3 leaked full_saju chapters');
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
  assert(await page.locator('#unniProductBody [data-export-compat-timing="1"]').count()===1,'compatibility pair timing missing');
  const pairFps=await page.locator('#unniProductBody [data-export-intro="compat"]').evaluate(el=>({
    a:el.getAttribute('data-person-a-fingerprint'),b:el.getAttribute('data-person-b-fingerprint')
  }));
  assert(pairFps.a&&pairFps.b&&pairFps.a!==pairFps.b,'compatibility must contain two distinct person fingerprints '+JSON.stringify(pairFps));
  assert(modal.includes('우리 둘 관계를 깊게 보는 궁합') && !modal.includes('16개 챕터'), 'compatibility intro should explain the outcome, not chapter volume');
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
  assert(await page.locator('#unniProductBody [data-product-exclusive="all_in_one"]').count()===1,'all-in-one cross-domain exclusive block missing');
  assert(await page.locator('#unniProductBody [data-export-compat-timing]').count()===0,'all-in-one must not include compatibility timeline');
  assert(await page.locator('#unniProductBody [data-product-exclusive="compatibility"]').count()===0,'all-in-one swallowed compatibility content');
  assert(await page.locator('#unniProductSaveAll').isVisible(), 'all-in-one full-report save missing');
  await page.locator('#unniProductClose').click();

  const html = fs.readFileSync('index.html','utf8');
  assert(html.includes('./paid-value-layer-v1.js?v=1.5.0'), 'paid value script include missing');
  assert(html.includes('./product-content-policy-v1.js?v=1.1.0'),'product content policy script include missing');
  assert(html.includes('./product-entitlements-v1.js?v=1.0.0') && html.includes('./premium-products-v1.js?v=2.1.0'), 'entitlement/product script include missing');
  assert(html.indexOf('integrated-saju-profile-v1.js') < html.indexOf('paid-value-layer-v1.js'), 'script wrapper order wrong');
  assert(html.indexOf('paid-value-layer-v1.js') < html.indexOf('concern-note-engine-v2.js'),'paid/note script order wrong');
  assert(html.indexOf('concern-note-engine-v2.js') < html.indexOf('product-content-policy-v1.js') && html.indexOf('product-content-policy-v1.js') < html.indexOf('premium-products-v1.js'),'policy/product script order wrong');
  assert(html.includes('resume.productId !== "concern_single"'), 'product payment return delegation missing');
  assert(html.includes('__UNNI_IMAGE_EXPORT_V2__'), 'shared image export engine missing');
  assert(html.includes('UNNI_VAULT_ENABLED = false') && html.includes('id="unniVaultEntry"') && html.includes('id="unniVaultModal"'), 'paused vault scaffolding missing');
  assert(html.indexOf('data-unni-auth="kakao"') < html.indexOf('data-unni-auth="naver"'), 'Naver must follow Kakao in auth order');
  assert(html.includes('completeUnniAuth') && html.includes('__UNNI_AUTH_BRIDGE__'), 'auth bridge scaffolding missing');
  const premium = fs.readFileSync('premium-products-v1.js','utf8');
  const contentPolicySource = fs.readFileSync('product-content-policy-v1.js','utf8');
  assert(!premium.includes('unniProductKeepsake') && !premium.includes('keepsakeCardHtml') && !premium.includes('renderPaidKeepsake'), 'paid keepsake-card subsystem should be removed');
  assert(premium.includes('saveFullPaidReport') && premium.includes('unniProductSaveAll'), 'full paid-report image save missing');
  assert(premium.includes('어떤언니 상담 기록') && !premium.includes('어떤언니 리포트'), 'paid native-share title slipped back into report voice');
  assert(!premium.includes('다른 브라우저') && !premium.includes('외부 브라우저'), 'paid image save should not tell users to switch browsers');
  assert(premium.includes('prewarmPaidExport') && premium.includes('preparePaidExportAssets') && premium.includes('저장 준비 완료'), 'background paid-export preparation missing');
  assert(premium.includes('requiresFreshShareGesture') && premium.includes('setPaidExportButtonReady(root, false)') && premium.includes('setPaidExportButtonReady(root, true)'), 'mobile save must wait for prewarm before fresh-tap multi-share');
  assert(premium.includes('isCurrentPaidExport') && premium.includes('EXPORT_IDLE_CANCELLED'), 'stale paid-export jobs must stop when the report changes');
  assert(premium.includes('paidExportCache.clear()') && premium.includes('paidExportCache.set(key, prepared)'), 'paid PNG blob cache must stay bounded to the current report');
  assert(premium.includes('nativeSharePngFiles') && premium.includes('isMobileDevice'), 'one-action mobile multi-image share path missing');
  assert(premium.includes('recommendedProductId') && premium.includes('recommendationReason') && premium.includes('const unlocked = typeof isUnlocked') && premium.includes('if (!unlocked)') && premium.includes('data-secondary-product'), 'post-unlock personalized premium recommendation missing');
  assert(premium.includes('unniShowOtherProducts') && premium.includes('unniOtherProducts') && premium.includes('다른 방향') && premium.includes('aria-expanded="false"'), 'recommended-first folded but discoverable alternatives missing');
  assert(!premium.includes('unniProductSavePdf') && !premium.includes('printPaidReport') && !premium.includes('unniPaidPrintHost') && !premium.includes('PDF로 한 파일 보관하기'), 'PDF save code must be fully removed');
  assert(premium.includes('buildPaidExportGroups') && premium.includes('data-export-kind="full"') && premium.includes('data-export-kind="compat"') && premium.includes('data-export-kind="concern"'), 'semantic paid-report grouping missing');
  assert(premium.includes('나를 이해하는 법') && premium.includes('대화하고 싸우고 화해하는 법') && premium.includes('어떻게 움직일지'), 'human-readable export group titles missing');
  assert(html.includes('showImagePagesFallback'), 'multi-image mobile fallback missing');
  assert(!html.includes('id="storyShareBtn"') && !html.includes('인스타에 올릴 사진 열기'), 'duplicate Instagram save/share UI remains');
  assert(html.includes('isKakaoInApp') && html.includes('showImageSaveFallback'), 'Kakao in-app save fallback missing');
  assert(html.includes('openStoryCaptureFromResult') && html.includes('onclick="openStoryCaptureFromResult()"') && html.includes('openStoryCaptureMode') && html.includes('storyCaptureMode') && html.includes('storyCaptureCardSlot'), 'one-tap direct card screenshot mode missing');
  assert(html.includes('화면 아무 데나 한 번 톡') && html.includes('바로 결과로 돌아가') && html.includes('너는 뭐 나왔어?') && html.includes('나도 내 결과 보기'), 'story share/viral guidance missing');
  assert(html.includes('requestFullscreen') && html.includes('exitFullscreen') && html.includes('storyCaptureCleanTimer') && html.includes('3200'), 'fullscreen capture with notice-delay cleanup missing');
  assert(!html.includes('showKakaoCardQualityGuide') && !html.includes('saveInstaCardImage') && !html.includes('prepareStoryCardAsset'), 'obsolete rendered story-card save path remains');
  assert(html.includes('__UNNI_IMAGE_EXPORT_V2__') && html.includes('version: "2.8.0"'), 'image export behavior version missing');
  assert(html.includes('history.pushState') && html.includes('shareModal: true'), 'share modal history guard missing');
  assert(html.includes('CONCERN_SITUATIONS') && html.includes('selectedConcernSituation'), 'concern situation picker missing');
  assert(html.includes('concernSituationSummary') && html.includes('editConcernSituation'), 'progressive mobile concern summary/edit flow missing');
  assert(!html.includes('정확한 만세력 조회를 위해 적어줘') && !html.includes('출생기록에 적힌 시각을 입력하면 더 정확해'), 'old birth-time helper copy remains');
  assert(!html.includes('🥺') && !html.includes('💕') && !html.includes('💌') && !html.includes('ㅠㅠ'), 'excessive F emoticon copy remains in the main journey');
  assert(!html.includes('id="sisterSwitchCard"') && !html.includes('switchSisterMode()'), 'bottom F/T mode-switch CTA code remains');
  assert(html.includes('같은 장면이 반복되는 부분이 보여') && html.includes('바로 아래 비밀 메모에 이어서 적어뒀어') && html.includes('바로 아래 비밀 메모에서 이어서 보면 돼'), 'five-element secret-note teaser copy missing');
  for (const oldOheng of ['목(나무)','화(불)','토(흙)','금(쇠)','수(물)']) assert(!html.includes(oldOheng), `old parenthetical five-element label remains: ${oldOheng}`);
  for (const oldStoryOheng of ['목 · 나무','화 · 불','토 · 흙','금 · 쇠','수 · 물']) assert(!html.includes(oldStoryOheng), `story card five-element label should stay simple: ${oldStoryOheng}`);
  assert(!html.includes('사주 데이터로 까본 내 진짜 MBTI'), 'MBTI is still framed as a true diagnostic result');
  assert(html.includes('재미로 보는 사주 MBTI 번역') && html.includes('실제 검사 MBTI와 다를 수 있어'), 'MBTI playful-translation framing missing');
  assert(!html.includes('font-bold truncate text-right flex-1 min-w-0'), 'NOTE badge still forces ellipsis');
  assert(!html.includes('팩트만 적어뒀으니까 정신 똑바로 차리고 읽어봐'), 'old generic harsh T greeting remains');
  for (const harsh of ['아이고 왔어?', '시간 낭비 말고', '똑바로 찍어', '똥고집', '미련 곰탱이', '팩트 꽂힌', '팩폭 모드', '징징대지 말고 와', '살인 충동 느낌', '상대방 사람 취급', '멍청한 질문 3번']) assert(!html.includes(harsh), `harsh/old sister copy remains: ${harsh}`);
  assert(
    html.includes('응, 좋아. 편하게 적어줘<br>언니가 사주랑 고민 같이 볼게') &&
    html.includes('좋아, 바로 보자<br>사주랑 고민 적어주면 돼') &&
    html.includes('로아 언니, 내 얘기 들어줘') &&
    html.includes('서아 언니, 바로 봐줘') &&
    html.includes('prompt.textContent = config.prompt;') &&
    !html.includes('CONCERN_CONVERSATION_PROMPTS') &&
    !html.includes('concernSituationAck') &&
    html.includes('응 봤어. 잠깐만') &&
    html.includes('확인했어. 잠깐만.') &&
    html.includes('응, 이제 좀 잡혔어') &&
    html.includes('됐어, 정리됐어.') &&
    html.includes('resultSisterHandoff') &&
    html.includes('이번엔 뭐가 마음에 걸려?') &&
    html.includes('좋아. 이번엔 뭐부터 볼까?') &&
    !html.includes('note-bridge') &&
    !html.includes('bg-[#fee500]') &&
    !html.includes('ㅎㅎ'),
    'distinct F/T counselor voice or restored situation flow missing'
  );
  assert(html.includes('function currentVoiceMode(') && html.includes('function voiceText(') && html.includes('function showVoiceToast('), 'main journey counselor voice router missing');
  assert(premium.includes('function productVoice(') && premium.includes('function applyProductModalVoice('), 'premium counselor voice router missing');
  assert(
    premium.includes('기존 구매 확인이 조금 늦어지고 있어. 구매 내역은 그대로 두고 확인 중이니까 걱정하지 않아도 돼. 중복 결제되지 않게 지금은 새 결제를 열지 않을게.') &&
    premium.includes('구매 확인이 지연 중이야. 중복 결제 방지를 위해 새 결제는 열지 않을게.') &&
    !premium.includes('기존 구매 확인이 지연되고 있어. 중복 결제를 막기 위해 지금은 새 결제를 열지 않을게.'),
    'premium purchase-history failure copy is not split by F/T voice'
  );
  assert(
    html.includes('data-consult-mode="${targetMode}"') &&
    html.includes('#analysisSubmitButton[data-consult-mode="F"]') &&
    html.includes('#analysisSubmitButton[data-consult-mode="T"]') &&
    !html.includes('class="w-full py-3 bg-[#fee500] hover:brightness-95 active:scale-98 text-[#3c1e1e]') &&
    !html.includes('#fee500') &&
    html.includes('function recoveryActionButtonStyle('),
    'counseling continuation or payment recovery CTA still uses legacy Kakao-yellow styling'
  );
  assert(/(?:const|let) FREE_LAUNCH_MODE\s*=\s*false/.test(html), 'FREE_LAUNCH_MODE must remain false');
  assert(
    html.includes('어떤 고민인지 하나만 골라줄래? 그거부터 언니가 볼게') &&
    html.includes('지금 제일 궁금한 고민 하나만 골라줘. 그거부터 볼게.') &&
    html.includes('이름도 같이 적어줘. 그래야 언니가 편하게 불러주지') &&
    html.includes('이름도 입력해줘. 빠진 것만 채우면 돼.'),
    'F/T validation voice handoff missing'
  );
  assert(
    html.includes('결제 확인됐어. 언니가 이어서 적어둔 내용까지 전부 열어뒀어.') &&
    html.includes('결제 확인됐어. 이어지는 내용까지 전부 열어뒀어.') &&
    html.includes('결제가 잘 확인됐는지 보고 있어.') &&
    html.includes('결제 완료 여부를 확인 중이야.'),
    'F/T payment/recovery voice handoff missing'
  );
  assert(
    premium.includes('로아 언니가 이어서 정리한 상담 기록') &&
    premium.includes('서아 언니가 이어서 정리한 상담 기록') &&
    premium.includes('좋아, 여기서부터 이어서 볼게') &&
    premium.includes('결제수단만 선택해') &&
    premium.includes('아까 보던 상담에서 이어서, 여기서는 새로 볼 수 있는 것만 보여줄게.') &&
    premium.includes('앞에서 본 내용은 반복하지 않을게. 여기서 새로 확인할 정보만 정리해.') &&
    premium.includes('결제 확인됐어. 아까 보던 상담에서 그대로 이어갈게.') &&
    premium.includes('결제 확인됐어. 바로 이어서 정리할게.'),
    'premium modal lost counselor continuity'
  );
  for (const staleGeneric of [
    '태어난 시간을 4자리(예: 1430)로 입력하거나 시간 모름을 체크해주세요.',
    '이름을 입력해주세요.',
    '생년월일 8자리(예: 19991230)를 정확히 입력해주세요.',
    '분석 결과를 안전하게 표시하지 못했어요. 다시 분석해주세요.',
    '이제 언니가 네 결과 챙겨둘게 ♡',
    '이 사진 저장해서 인스타에서 불러오면 돼 ♡',
    '사진 길게 눌러 저장하면 돼 ♡'
  ]) assert(!html.includes(staleGeneric), `generic/system voice remains: ${staleGeneric}`);
  assert(!html.includes('내 보관함 ♡') && !html.includes('내 사주 ♡'), 'vault copy still uses decorative heart as dialogue text');
  assert(html.includes('analysisErrorText(') && !html.includes('calcErr.message || {'), 'raw analysis-engine errors can still leak into user copy');
  assert(
    html.includes('똑같은 내 사주, 누구한테 먼저 털어놓을래?') &&
    html.includes('원하는 상담 스타일을 골라봐') &&
    html.includes('감정 공감형') &&
    html.includes('핵심 정리형') &&
    html.includes('왔어? 요즘 뭐가 제일 마음에 걸려<br>언니한테 편하게 얘기해봐') &&
    html.includes('왔어? 뭐가 제일 궁금해<br>중요한 것부터 바로 보자') &&
    html.includes('언니한테 얘기해볼래') &&
    html.includes('좋아, 바로 봐줘') &&
    !html.includes('선택한 언니의 말투로 결과 끝까지 이어져') &&
    !html.includes('응, 언니랑 천천히 풀어볼래') &&
    !html.includes('좋아, 핵심만 바로 알려줘'),
    'immersive first counselor-choice copy missing'
  );
  for (const staleIntro of ['응, 내 얘기부터 천천히 같이 봐줘','좋아. 돌려 말하지 말고 필요한 것만 알려줘','괜히 겁주거나 포장 안 해. 좋은 건 좋다, 아닌 건 아니다 말하고 지금 필요한 것만 정리해줄게.']) {
    assert(!html.includes(staleIntro), `stale first-screen copy remains: ${staleIntro}`);
  }
  assert(
    html.includes('사주정보는 그대로 · 새 고민만 고르면 돼') &&
    html.includes('사주정보는 그대로 · 새 고민만 고르면 돼') &&
    html.includes('이번엔 다른 사람도 봐줄까?') &&
    html.includes('다른 사람 사주 새로 보기') &&
    html.includes('필요한 내용은 상담 기록으로 남겨둘 수 있어.') &&
    html.includes('마음에 남는 얘기가 있으면 상담 기록으로 남겨둬도 돼') &&
    !html.includes('추가 처방전 990원 즉시 확인') &&
    !html.includes('사주도 까보기'),
    'post-consultation continuation slipped back into sales/report voice'
  );
  assert(
    html.includes('/* final result containment pass */') &&
    html.includes('--result-gutter:20px') &&
    html.includes('--result-axis-max:392px') &&
    html.includes('#resultPillarCard .grid>div+div{border-left:1px solid #eee7e1!important}') &&
    html.includes('#ohengBarContainer>div>div:nth-child(2){') &&
    html.includes('#resultConcernHandoff{display:none!important}') &&
    html.includes('#consultationCloseoutSub{display:none!important}') &&
    html.includes('#resultShareLead{display:none!important}') &&
    html.includes('#resultFunExtrasEyebrow{display:none!important}') &&
    html.includes('#consultationNotesHeader>div:first-child>span:last-child{display:none!important}') &&
    html.includes('#unniProductLadder [data-unni-product]{'),
    'result-screen containment system missing or regressed'
  );
  assert(html.includes('note2PreviewCard') && html.includes('getPaywallConversionCopy(data, isT)') && html.includes('PAYWALL_CONVERSION_COPY') && html.includes('paywallNextTeaser') && html.includes('언니, 그것도 봐줘') && html.includes('응, 끝까지 봐줘') && !html.includes('const previewParts = String(nextNote.desc || "")'), 'paid teaser must keep NOTE1 full, stop NOTE2 at the answer edge, and use situation-specific F/T 990 handoff');
  assert(!html.includes('storyCaptureReturnTimer') && !html.includes('7000') && html.includes('storyCaptureCleanTimer'), 'capture should use delayed fullscreen-clean transition, not timed auto-return');
  const finalNotePaymentAt = html.indexOf('id="finalNotePaymentButton"');
  const finalNotePaymentSlice = finalNotePaymentAt >= 0 ? html.slice(finalNotePaymentAt, finalNotePaymentAt + 900) : '';
  assert(finalNotePaymentAt >= 0 && finalNotePaymentSlice.includes('방금 보던 내용 이어보기') && !finalNotePaymentSlice.includes('이어보기 · 990원') && html.includes('선택한 결제수단으로 결제돼') && html.includes('id="paywallPriceSummary"') && html.includes('priceSummary.style.display = "none"') && !finalNotePaymentSlice.includes('bg-[#fee500]') && !finalNotePaymentSlice.includes('bg-gradient-to-r'), '990 won final payment CTA must use brand-primary copy/style instead of Kakao-like yellow');
  assert(premium.includes('data-bundle-situation') && premium.includes('data-all-situation'), 'premium situation selectors missing');
  assert(premium.includes('<option value="solar">양력</option><option value="lunar">음력</option>') && !premium.includes('양력 생일') && !premium.includes('음력 생일'), 'compatibility calendar labels should be simple');
  assert(!premium.includes('예: 오후 3시 20분이면'), 'compatibility birth-time helper should be removed');
  assert(
    contentPolicySource.includes('다른 고민 3개도 같은 사주로 각각 깊게 풀어보기') &&
    contentPolicySource.includes('내 사주 전체 구조와 앞으로 5년의 큰 흐름 보기') &&
    contentPolicySource.includes('두 사람 사주를 겹쳐 관계의 이유와 시기 보기') &&
    contentPolicySource.includes('나 한 사람의 전체 사주판과 6개 고민을 한 번에 열기') &&
    premium.includes('data-recommendation-reason="1"') &&
    premium.includes('wrap.innerHTML = `<div style="display:grid;gap:0">') &&
    !premium.includes('왜 이걸 먼저 보냐면</span>') &&
    premium.includes('내 전체 사주판 보기') &&
    premium.includes('완전판으로 이어보기'),
    'young-user outcome-led product copy missing'
  );
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
  assert(server.includes('all_in_one: { amount: 9900, name: "어떤언니 내 사주 완전판" }'), 'Toss all-in-one order name is stale');
  assert(!server.includes('어떤언니 올인원'), 'old all-in-one order name remains in Toss server');
  assert(server.includes('const product = productFor(order.data);'), 'server does not resolve signed product price');
  assert(server.includes('const expectedAmount = Number(order.amount ?? product.amount)') && server.includes('Number(body.amount) !== expectedAmount'), 'server does not reject client amount against signed server quote');
  assert(server.includes('body:JSON.stringify({ paymentKey:body.paymentKey,orderId:order.orderId,amount:expectedAmount })'), 'Toss confirm is not bound to server-quoted amount');
  assert(server.includes('resolveVerifiedEntitlements(data,body.entitlementTokens,secret,signing)') && server.includes('calculateUpgradeQuote(data.p,entitlementState.verifiedPurchases)'), 'server-side verified entitlement upgrade quote missing');
  assert(server.includes('if (!d.p || d.p === "concern_single") return legacy;'), 'legacy 990 result key compatibility missing');

  assert(errors.length === 0, `browser errors: ${errors.join(' | ')}`);
  console.log('PAID_VALUE_PRODUCT_PASS', JSON.stringify({
    rows:qa.situationRows.length,
    prices:expectedPrices,
    catalogButtons:ui.buttons,
    note6Distinct:true,
  }));
  await browser.close();
})().catch(err => { console.error(err.stack || err); process.exit(1); });
