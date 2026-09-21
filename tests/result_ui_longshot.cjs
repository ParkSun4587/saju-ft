const { chromium } = require('playwright');

const BASE = process.env.PRODUCTION_BASE || 'https://sajuft.com/index.html';
const assert = (v,m) => { if (!v) throw new Error(m); };
const sleep = ms => new Promise(r=>setTimeout(r,ms));

async function deployed(page) {
  for (let i=0;i<36;i++) {
    try {
      await page.goto(BASE + '?longshot=v2-' + i, {waitUntil:'domcontentloaded',timeout:30000});
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
  await page.check('#birthTimeDirectToggle');
  await page.fill('#birthTimeInput','0310');
  await page.locator('#splitNextButton button').click();
  await page.waitForSelector('#resultSection',{state:'visible',timeout:30000});
  await page.waitForSelector('#note2PreviewCard',{state:'visible',timeout:10000});
}

async function unlockForQa(page) {
  await page.evaluate(()=>{
    FREE_LAUNCH_MODE=true;
    unlockFullReport(null,true);
    renderUnniProductCatalog();
  });
  await page.waitForSelector('#reAnalyzeBox',{state:'visible',timeout:10000});
  await page.waitForSelector('#unniProductLadder',{state:'visible',timeout:10000});
  const state=await page.evaluate(()=>({
    notes:document.querySelectorAll('#notesListContainer > div').length,
    preview:!!document.getElementById('note2PreviewCard'),
    products:document.querySelectorAll('#unniProductLadder [data-unni-product]').length,
  }));
  assert(state.notes===6 && !state.preview && state.products===4,
    'unlocked longshot state drift '+JSON.stringify(state));
}

async function makeStaticLongshotDocument(page) {
  return page.evaluate(() => {
    const source=document.querySelector('#resultSection > div');
    const original=document.getElementById('resultSection');
    if(!source || !original) return {height:0,docHeight:0,overflow:true};

    const shot=document.createElement('main');
    shot.id='resultSection';
    shot.dataset.consultMode=original.dataset.consultMode || 'F';
    shot.style.setProperty('display','block','important');
    shot.style.setProperty('position','relative','important');
    shot.style.setProperty('inset','auto','important');
    shot.style.setProperty('width','100%','important');
    shot.style.setProperty('height','auto','important');
    shot.style.setProperty('min-height','0','important');
    shot.style.setProperty('overflow','visible','important');
    shot.style.setProperty('background','#fcfaf7','important');

    const inner=source.cloneNode(true);
    shot.appendChild(inner);

    document.body.replaceChildren(shot);
    document.body.className='';
    document.body.style.setProperty('display','block','important');
    document.body.style.setProperty('width','100%','important');
    document.body.style.setProperty('height','auto','important');
    document.body.style.setProperty('min-height','0','important');
    document.body.style.setProperty('overflow','visible','important');
    document.body.style.setProperty('margin','0','important');
    document.body.style.setProperty('padding','0','important');
    document.body.style.setProperty('background','#fcfaf7','important');

    document.documentElement.style.setProperty('height','auto','important');
    document.documentElement.style.setProperty('min-height','0','important');
    document.documentElement.style.setProperty('overflow','visible','important');
    document.documentElement.style.setProperty('background','#fcfaf7','important');

    window.scrollTo(0,0);
    return {
      height:shot.getBoundingClientRect().height,
      docHeight:document.documentElement.scrollHeight,
      overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth,
    };
  });
}

async function captureState(browser, vp, state) {
  const ctx=await browser.newContext({viewport:{width:vp.width,height:vp.height}});
  const page=await ctx.newPage();
  await deployed(page);
  await enter(page,vp.mode);
  if(state==='unlocked') await unlockForQa(page);

  const metrics=await makeStaticLongshotDocument(page);
  assert(metrics.height>1600,
    vp.width+'x'+vp.height+' '+vp.mode+' '+state+' longshot stayed viewport-sized '+JSON.stringify(metrics));
  assert(!metrics.overflow,
    vp.width+'x'+vp.height+' '+vp.mode+' '+state+' longshot overflow '+JSON.stringify(metrics));

  await page.locator('#resultSection').screenshot({
    path:'/tmp/result-ui-'+vp.width+'x'+vp.height+'-'+vp.mode+'-'+state+'-long.png',
    animations:'disabled',
  });
  await ctx.close();
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
    await captureState(browser,vp,'locked');
    await captureState(browser,vp,'unlocked');
  }

  console.log('RESULT_UI_LONGSHOT_PASS');
  await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
