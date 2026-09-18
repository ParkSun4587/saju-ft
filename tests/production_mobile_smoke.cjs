const { chromium } = require('playwright');
const BASE = process.env.PRODUCTION_BASE || 'https://sajuft.com/index.html';
const assert = (v,m) => { if (!v) throw new Error(m); };
const sleep = (ms) => new Promise(r => setTimeout(r,ms));

async function deployed(page) {
  for (let i=0;i<36;i++) {
    try {
      await page.goto(BASE + '?smoke=v14-' + i, {waitUntil:'domcontentloaded',timeout:30000});
      await page.waitForFunction(() =>
        globalThis.__PAID_VALUE_LAYER_V1__?.version === '1.3.0' &&
        globalThis.__UNNI_PRODUCTS_V1__?.version === '1.4.0' &&
        typeof selectSplitMode === 'function', null, {timeout:8000});
      return;
    } catch (_) { await sleep(10000); }
  }
  throw new Error('production did not reach paid 1.3.0 / products 1.4.0');
}

async function enter(page, mode, concern, situation) {
  await page.locator(mode === 'F' ? '#panelRoa' : '#panelSeoa').click();
  await page.waitForSelector('#sajuInputCardBox',{state:'visible',timeout:10000});
  await page.fill('#nameInput','테스트');
  const label = concern === 'love' ? '연애 · 썸' : '마음 · 스트레스';
  await page.locator('#concernGrid .concern-chip').filter({hasText:label}).click();
  await page.waitForSelector('#concernSituationBox',{state:'visible'});
  assert(await page.locator('#concernSituationGrid [data-concern-situation]').count() === 4,'situation count');
  await page.locator('#concernSituationGrid [data-concern-situation="'+situation+'"]').click();
  await page.waitForSelector('#concernSituationSummary',{state:'visible'});
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
    };
  },mode);
  assert(r.n1.length>=210,mode+' NOTE1 too short '+r.n1.length);
  assert(r.n2.length>=210,mode+' NOTE2 too short '+r.n2.length);
  assert(r.n1.includes('사주 전체'),mode+' NOTE1 personalization missing');
  assert(/반복|패턴|같은 데서/.test(r.n2),mode+' NOTE2 pattern missing');
  assert(r.oheng.includes('언니가')&&!r.oheng.includes('로아가')&&!r.oheng.includes('서아가'),mode+' oheng voice '+r.oheng);
  assert(r.count===4&&r.visible===4,'premium products hidden '+JSON.stringify(r));
  assert(r.catalog.includes('다른 리포트도 있어')&&!r.catalog.includes('다른 리포트 3개 보기'),'old product disclosure remains');
  assert(r.switchCount===0,'bottom F/T CTA remains');
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
