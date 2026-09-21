const { chromium } = require('playwright');

const BASE = process.env.PRODUCTION_BASE || 'https://sajuft.com/index.html';
const assert = (v,m) => { if (!v) throw new Error(m); };
const sleep = ms => new Promise(r=>setTimeout(r,ms));

async function deployed(page) {
  for (let i=0;i<36;i++) {
    try {
      await page.goto(BASE + '?longshot=v1-' + i, {waitUntil:'domcontentloaded',timeout:30000});
      await page.waitForFunction(() => {
        const flow=document.getElementById('resultConsultationFlow');
        const core=document.getElementById('resultCoreCard');
        return globalThis.__PAID_VALUE_LAYER_V1__?.version === '1.5.0' &&
          globalThis.__CONCERN_NOTE_ENGINE_V2__?.version === '3.2.1' &&
          globalThis.__UNNI_PRODUCTS_V1__?.version === '2.1.0' &&
          typeof selectSplitMode === 'function' &&
          flow && core &&
          getComputedStyle(flow).paddingLeft === '12px' &&
          getComputedStyle(core).borderRadius === '0px';
      }, null, {timeout:8000});
      return;
    } catch (_) {
      await sleep(10000);
    }
  }
  throw new Error('production did not reach the final containment build');
}

async function enter(page, mode) {
  await page.locator(mode === 'F' ? '#panelRoa' : '#panelSeoa').click();
  await page.waitForSelector('#sajuInputCardBox',{state:'visible',timeout:10000});
  await page.fill('#nameInput','테스트');
  const concern = mode === 'F' ? '연애 · 썸' : '마음 · 스트레스';
  const situation = mode === 'F' ? 'relationship' : 'burnout';
  await page.locator('#concernGrid .concern-chip').filter({hasText:concern}).click();
  await page.waitForSelector('#concernSituationBox',{state:'visible'});
  await page.locator('#concernSituationGrid [data-concern-situation="'+situation+'"]').click();
  await page.fill('#birthDateInput','19980221');
  await page.fill('#birthTimeInput','0310');
  await page.locator('#splitNextButton button').click();
  await page.waitForSelector('#resultSection',{state:'visible',timeout:30000});
  await page.waitForSelector('#note2PreviewCard',{state:'visible',timeout:10000});
}

async function expandResultForShot(page) {
  return page.evaluate(() => {
    const result=document.getElementById('resultSection');
    if(!result) return 0;
    result.scrollTop=0;
    const h=Math.max(result.scrollHeight,result.getBoundingClientRect().height);
    result.style.position='relative';
    result.style.inset='auto';
    result.style.height=h+'px';
    result.style.minHeight=h+'px';
    result.style.overflow='visible';
    document.documentElement.style.height='auto';
    document.body.style.height='auto';
    document.body.style.minHeight=h+'px';
    window.scrollTo(0,0);
    return h;
  });
}

async function captureLong(page, path, label) {
  const h=await expandResultForShot(page);
  assert(h>1600,label+' result did not expand: '+h);
  const fullHeight=await page.evaluate(()=>document.documentElement.scrollHeight);
  assert(fullHeight>1600,label+' document did not become long: '+fullHeight);
  await page.screenshot({path,fullPage:true,animations:'disabled'});
}

(async()=>{
  const browser=await chromium.launch({headless:true});
  const viewports=[
    {width:360,height:800,mode:'F'},
    {width:375,height:812,mode:'T'},
    {width:390,height:844,mode:'F'},
    {width:393,height:852,mode:'T'},
    {width:430,height:932,mode:'F'},
  ];

  for(const vp of viewports){
    const ctx=await browser.newContext({viewport:{width:vp.width,height:vp.height}});
    const page=await ctx.newPage();
    await deployed(page);
    await enter(page,vp.mode);

    await captureLong(
      page,
      '/tmp/result-ui-'+vp.width+'x'+vp.height+'-'+vp.mode+'-locked-long.png',
      vp.width+'x'+vp.height+' '+vp.mode+' locked'
    );

    await page.evaluate(()=>{
      FREE_LAUNCH_MODE=true;
      unlockFullReport(null,true);
      renderUnniProductCatalog();
    });
    await page.waitForSelector('#reAnalyzeBox',{state:'visible',timeout:10000});
    await page.waitForSelector('#unniProductLadder',{state:'visible',timeout:10000});

    const unlocked=await page.evaluate(()=>({
      notes:document.querySelectorAll('#notesListContainer > div').length,
      preview:!!document.getElementById('note2PreviewCard'),
      products:document.querySelectorAll('#unniProductLadder [data-unni-product]').length,
      overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth,
    }));
    assert(unlocked.notes===6 && !unlocked.preview && unlocked.products===4 && !unlocked.overflow,
      'unlocked longshot state drift '+JSON.stringify({vp,unlocked}));

    await captureLong(
      page,
      '/tmp/result-ui-'+vp.width+'x'+vp.height+'-'+vp.mode+'-unlocked-long.png',
      vp.width+'x'+vp.height+' '+vp.mode+' unlocked'
    );
    await ctx.close();
  }

  console.log('RESULT_UI_LONGSHOT_PASS');
  await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
