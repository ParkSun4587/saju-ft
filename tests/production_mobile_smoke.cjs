const { chromium } = require('playwright');
const BASE = process.env.PRODUCTION_BASE || 'https://sajuft.com/index.html';
const assert = (v,m) => { if (!v) throw new Error(m); };
const sleep = (ms) => new Promise(r => setTimeout(r,ms));

async function deployed(page) {
  for (let i=0;i<36;i++) {
    try {
      await page.goto(BASE + '?smoke=v16-' + i, {waitUntil:'domcontentloaded',timeout:30000});
      await page.waitForFunction(() =>
        globalThis.__PAID_VALUE_LAYER_V1__?.version === '1.4.0' &&
        globalThis.__UNNI_PRODUCTS_V1__?.version === '1.6.0' &&
        typeof selectSplitMode === 'function', null, {timeout:8000});
      return;
    } catch (_) { await sleep(10000); }
  }
  throw new Error('production did not reach paid 1.4.0 / products 1.6.0');
}

async function enter(page, mode, concern, situation) {
  await page.locator(mode === 'F' ? '#panelRoa' : '#panelSeoa').click();
  await page.waitForSelector('#sajuInputCardBox',{state:'visible',timeout:10000});
  const firstState = await page.evaluate(() => ({
    concern:document.getElementById('selectedConcernKey')?.value || '',
    selected:document.querySelectorAll('#concernGrid .concern-chip.selected').length,
    details:getComputedStyle(document.getElementById('concernSituationBox')).display,
    summary:getComputedStyle(document.getElementById('concernSituationSummary')).display,
    submitDisabled:!!document.getElementById('analysisSubmitButton')?.disabled,
    oldManseCopy:document.body.innerText.includes('정확한 만세력 조회를 위해 적어줘'),
    oldTimeHint:document.body.innerText.includes('출생기록에 적힌 시각을 입력하면 더 정확해'),
    timeHintExists:!!document.getElementById('birthTimeHint'),
  }));
  assert(firstState.concern==='' && firstState.selected===0 && firstState.details==='none' && firstState.summary==='none' && firstState.submitDisabled,
    'fresh input must require an explicit concern '+JSON.stringify(firstState));
  assert(!firstState.oldManseCopy && !firstState.oldTimeHint && !firstState.timeHintExists,
    'birth input still shows old technical/helper copy '+JSON.stringify(firstState));
  await page.fill('#nameInput','테스트');
  const label = concern === 'love' ? '연애 · 썸' : '마음 · 스트레스';
  await page.locator('#concernGrid .concern-chip').filter({hasText:label}).click();
  await page.waitForSelector('#concernSituationBox',{state:'visible'});
  assert(await page.locator('#concernSituationGrid [data-concern-situation]').count() === 4,'situation count');
  await page.locator('#concernSituationGrid [data-concern-situation="'+situation+'"]').click();
  await page.waitForSelector('#concernSituationSummary',{state:'visible'});
  assert(!(await page.locator('#analysisSubmitButton').isDisabled()),'send button should unlock after concern and situation');
  assert(await page.locator('#concernSituationBox').isHidden(),'situation did not collapse');
  await page.locator('#concernSituationSummary button').click();
  await page.waitForSelector('#concernSituationBox',{state:'visible'});
  await page.locator('#concernSituationGrid [data-concern-situation="'+situation+'"]').click();
  await page.fill('#birthDateInput','19980221');
  await page.fill('#birthTimeInput','0310');
  await page.locator('#splitNextButton button').click();
  await page.waitForSelector('#resultSection',{state:'visible',timeout:30000});
  await page.waitForSelector('#unniProductLadder',{state:'visible',timeout:10000});
}

async function inspect(page, mode) {
  const r = await page.evaluate((mode) => {
    const plain = v => String(v||'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
    const notes = generateConcernNotes(currentResultData,mode);
    const products=[...document.querySelectorAll('#unniProductLadder [data-unni-product]')];
    return {
      n1:plain(notes[0]?.desc), n2:plain(notes[1]?.desc),
      oheng:document.getElementById('ohengSummaryTxt')?.innerText||'',
      count:products.length,
      visible:products.filter(x=>getComputedStyle(x).display!=='none').length,
      catalog:document.getElementById('unniProductLadder')?.innerText||'',
      switchCount:document.querySelectorAll('#sisterSwitchCard').length,
      badges:notes.map(n=>n.badge||''),
      resultGreeting:document.getElementById('resultSisterGreeting')?.innerText||'',
      resultBadge:document.getElementById('resultModeBadge')?.innerText||'',
      hierarchy:{
        oneLineBeforeThreeLine:(document.getElementById('sazuCharacterTitle').compareDocumentPosition(document.getElementById('manualBulletList')) & Node.DOCUMENT_POSITION_FOLLOWING)!==0,
        threeLineBeforeMbti:(document.getElementById('manualBulletList').compareDocumentPosition(document.getElementById('gradeSection')) & Node.DOCUMENT_POSITION_FOLLOWING)!==0,
        mbtiBeforeChem:(document.getElementById('gradeSection').compareDocumentPosition(document.getElementById('chemBestCard')) & Node.DOCUMENT_POSITION_FOLLOWING)!==0,
        mbtiSize:parseFloat(getComputedStyle(document.getElementById('resultBigMbti')).fontSize||'0'),
      },
    };
  },mode);
  assert(r.n1.length>=210,mode+' NOTE1 too short '+r.n1.length);
  assert(r.n2.length>=210,mode+' NOTE2 too short '+r.n2.length);
  assert(r.n1.includes('사주 전체'),mode+' NOTE1 personalization missing');
  assert(/반복|패턴|같은 데서/.test(r.n2),mode+' NOTE2 pattern missing');
  assert(r.oheng.includes('언니가')&&!r.oheng.includes('로아가')&&!r.oheng.includes('서아가'),mode+' oheng voice '+r.oheng);
  assert(r.count===4&&r.visible===4,'premium products hidden '+JSON.stringify(r));
  assert(r.catalog.includes('다른 리포트도 있어')&&!r.catalog.includes('다른 리포트 3개 보기'),'old product disclosure remains');
  assert(r.catalog.includes('내 사주 완전판')&&!r.catalog.includes('어떤언니 올인원'),'all-in-one product name did not update');
  assert(r.switchCount===0,'bottom F/T CTA remains');
  assert(r.hierarchy.oneLineBeforeThreeLine&&r.hierarchy.threeLineBeforeMbti&&r.hierarchy.mbtiBeforeChem&&r.hierarchy.mbtiSize<=38,
    'result hierarchy is wrong '+JSON.stringify(r.hierarchy));
  assert(!r.badges.some(x=>x.includes('·')||x.includes('핵심')||x.includes('사람 필터')||x.includes('7일 처방')),
    'old NOTE badge wording remains '+JSON.stringify(r.badges));
  assert(!/[💕🥺💌🌸🧊]/u.test(r.resultGreeting+r.resultBadge),'result persona still depends on decorative emoji '+JSON.stringify({greeting:r.resultGreeting,badge:r.resultBadge}));
  return r;
}

(async()=>{
  const browser=await chromium.launch({headless:true});
  const ctx=await browser.newContext({viewport:{width:390,height:844}});
  const page=await ctx.newPage();
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error') errors.push(m.text());});
  await deployed(page);
  await enter(page,'F','love','relationship');
  const f=await inspect(page,'F');

  await page.locator('#mainShareBtn').click();
  await page.waitForSelector('#shareModal',{state:'visible',timeout:5000});
  assert((await page.locator('#storySaveBtn').innerText()).includes('화면 그대로 캡처하기'),'live share CTA did not switch to capture mode');
  await page.locator('#storySaveBtn').click();
  await page.waitForSelector('#storyCaptureMode',{state:'visible',timeout:5000});
  const captureOpen=await page.evaluate(()=>({
    parent:document.getElementById('storyCard')?.parentElement?.id||'',
    topInside:!!document.elementFromPoint(4,4)?.closest?.('#storyCaptureMode'),
    layerZ:Number(getComputedStyle(document.getElementById('storyCaptureMode')).zIndex||0),
    shareZ:Number(getComputedStyle(document.getElementById('shareModal')).zIndex||0),
  }));
  assert(captureOpen.parent==='storyCaptureCardSlot'&&captureOpen.topInside&&captureOpen.layerZ>captureOpen.shareZ,
    'live capture mode does not isolate the original card '+JSON.stringify(captureOpen));
  const liveCardBox=await page.locator('#storyCard').boundingBox();
  assert(liveCardBox&&liveCardBox.width>=350&&liveCardBox.width<=390&&Math.abs(liveCardBox.height/liveCardBox.width-16/9)<0.03,
    'live capture card is not viewport-sized '+JSON.stringify(liveCardBox));
  await page.locator('#storyCaptureReady').click();
  await page.waitForFunction(()=>getComputedStyle(document.getElementById('storyCaptureChrome')).display==='none',null,{timeout:5000});
  assert(await page.locator('#unniKakaoCardQualityGuide').count()===0,'old rendered-card quality warning exists');
  await page.locator('#storyCaptureMode').click({position:{x:4,y:4}});
  await page.waitForFunction(()=>getComputedStyle(document.getElementById('storyCaptureChrome')).display!=='none',null,{timeout:5000});
  await page.locator('#storyCaptureClose').click();
  await page.locator('#shareModalClose').click();
  await page.waitForFunction(()=>!isShareModalOpen(),null,{timeout:5000});

  await page.locator('#unniProductLadder [data-unni-product="full_saju"]').click();
  await page.waitForSelector('#unniProductModal',{state:'visible'});
  assert((await page.locator('#unniProductAction').innerText()).includes('무료 이벤트'),'free preview missing');
  await page.locator('#unniProductAction').click();
  await page.waitForFunction(()=>document.querySelectorAll('#unniProductBody section').length===12,null,{timeout:10000});
  assert(await page.locator('#unniProductStickyHead').evaluate(el=>getComputedStyle(el).position)==='sticky','sticky header broken');
  await page.evaluate(()=>{window.__oldPrint=window.print;window.__printCalls=0;window.print=()=>window.__printCalls++;});
  await page.locator('#unniProductSavePdf').click();
  await page.waitForFunction(()=>window.__printCalls===1,null,{timeout:5000});
  const pdf=await page.evaluate(()=>({
    calls:window.__printCalls,
    sections:document.querySelectorAll('#unniPaidPrintHost section').length,
    host:document.getElementById('unniPaidPrintHost')?.innerText||'',
    style:!!document.getElementById('unniPaidPrintStyle')
  }));
  assert(pdf.calls===1&&pdf.sections===12&&pdf.style&&pdf.host.includes('내 전체 사주판'),'PDF print path '+JSON.stringify(pdf));
  await page.emulateMedia({media:'print'});
  assert(await page.locator('#unniPaidPrintHost').evaluate(el=>getComputedStyle(el).display)==='block','print host hidden');
  await page.emulateMedia({media:'screen'});
  await page.evaluate(()=>{window.print=window.__oldPrint;document.getElementById('unniPaidPrintHost')?.remove();document.getElementById('unniPaidPrintStyle')?.remove();});
  await page.waitForFunction(()=>document.getElementById('unniProductSaveHint')?.innerText.includes('저장 준비 완료'),null,{timeout:45000});
  assert(await page.locator('#unniProductSaveAll').isEnabled(),'photo export prewarm not ready');

  const t=await ctx.newPage();
  const terr=[];
  t.on('pageerror',e=>terr.push(e.message));
  t.on('console',m=>{if(m.type()==='error') terr.push(m.text());});
  await deployed(t);
  await enter(t,'T','mental','burnout');
  const tr=await inspect(t,'T');
  assert(errors.length===0,'F browser errors '+errors.join(' | '));
  assert(terr.length===0,'T browser errors '+terr.join(' | '));
  console.log('PRODUCTION_MOBILE_SMOKE_PASS',JSON.stringify({f:[f.n1.length,f.n2.length],t:[tr.n1.length,tr.n2.length],pdf}));
  await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
