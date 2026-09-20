const { chromium } = require('playwright');
const fs=require('fs');
const BASE=process.env.AUDIT_BASE || 'https://sajuft.com/index.html';
const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));
async function waitDeployed(page){
  for(let i=0;i<24;i++){
    try{
      await page.goto(BASE+'?visual-audit='+Date.now(),{waitUntil:'domcontentloaded',timeout:30000});
      await page.waitForFunction(()=>typeof selectSplitMode==='function'&&globalThis.__UNNI_PRODUCTS_V1__?.version==='2.1.0',null,{timeout:10000});
      return;
    }catch(e){await sleep(5000);}
  }
  throw new Error('production not ready');
}
async function shot(page,name,locator=null){
  fs.mkdirSync('visual-audit',{recursive:true});
  if(locator){
    await locator.scrollIntoViewIfNeeded();
    await sleep(180);
    await locator.screenshot({path:`visual-audit/${name}.png`});
  }else{
    await page.screenshot({path:`visual-audit/${name}.png`});
  }
}
async function prepareResult(page,mode='F'){
  await page.locator(mode==='F'?'#panelRoa':'#panelSeoa').click();
  await page.waitForSelector('#sajuInputCardBox',{state:'visible'});
  await shot(page,'02-selected-counselor');
  await shot(page,'03-input-top',page.locator('#sajuInputCardBox'));
  await page.fill('#nameInput','지은');
  await page.locator('#concernGrid .concern-chip').filter({hasText:'연애 · 썸'}).click();
  await page.waitForSelector('#concernSituationBox',{state:'visible'});
  await shot(page,'04-concern-situation',page.locator('#concernSituationBox'));
  await page.locator('#concernSituationGrid [data-concern-situation="relationship"]').click();
  await page.fill('#birthDateInput','20010418');
  await page.fill('#birthTimeInput','1420');
  await shot(page,'05-input-filled',page.locator('#sajuInputCardBox'));
  await page.evaluate(()=>changeViewState('loading'));
  await sleep(250);
  await shot(page,'06-loading');
  await page.evaluate(()=>changeViewState('input'));
  await page.locator('#splitNextButton button').click();
  await page.waitForSelector('#resultSection',{state:'visible',timeout:30000});
  await page.waitForSelector('#lockedOverlay',{state:'visible',timeout:10000});
}
(async()=>{
  const browser=await chromium.launch({headless:true});
  const ctx=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1});
  const page=await ctx.newPage();
  await waitDeployed(page);
  await shot(page,'01-entry');
  await prepareResult(page,'F');

  await shot(page,'07-result-first');
  await shot(page,'08-core-insight',page.locator('#coreThreeLineSummary'));
  await shot(page,'09-five-elements',page.locator('#ohengBarContainer').locator('xpath=..'));
  const note1=page.locator('#notesListContainer > div').first();
  await shot(page,'10-note1',note1);
  await shot(page,'11-note2-preview',page.locator('#note2PreviewCard'));
  await shot(page,'12-paywall',page.locator('#paywallCard'));

  await page.evaluate(()=>{
    const fake=()=>({
      renderPaymentMethods(sel){document.querySelector(sel).innerHTML='<div style="padding:12px;border:1px solid #e2e8f0;border-radius:14px;background:white"><div style="font-size:12px;font-weight:800;margin-bottom:8px">결제수단</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px"><button style="padding:12px;border:1px solid #e2e8f0;border-radius:12px;background:white">카드</button><button style="padding:12px;border:1px solid #e2e8f0;border-radius:12px;background:white">간편결제</button></div></div>';return{};},
      renderAgreement(sel){document.querySelector(sel).innerHTML='<div style="padding:9px 2px;font-size:11px;color:#64748b">필수 약관 동의</div>';return{};},
      requestPayment:async()=>{}
    });
    fake.ANONYMOUS='ANONYMOUS';globalThis.PaymentWidget=fake;
  });
  await page.locator('#directPaymentOpenButton').click();
  await page.waitForSelector('#paymentWidgetArea',{state:'visible'});
  await shot(page,'13-note-payment',page.locator('#paywallCard'));

  await page.evaluate(()=>{
    unlockFullReport(null,true);
    const original=paymentAPI;
    paymentAPI=async(body)=>{
      if(body?.action==='entitlements')return {ok:true,verifiedPurchases:[],effectiveEntitlements:[],allInOneQuote:{targetProduct:'all_in_one',baseAmount:9900,creditAmount:0,amount:9900,alreadyOwned:false,creditedProducts:[]}};
      if(body?.action==='prepare')return {ok:true,productId:body?.data?.p,orderId:'audit',ticket:'audit',userKey:getUserUniqueKey(currentResultData),amount:body?.data?.p==='full_saju'?4900:5900,baseAmount:body?.data?.p==='full_saju'?4900:5900};
      return original(body);
    };
    renderUnniProductCatalog();
  });
  await page.waitForSelector('#unniProductLadder [data-unni-product]',{state:'visible',timeout:10000});
  const cards=page.locator('#notesListContainer > div');
  const count=await cards.count();
  for(let i=2;i<count;i++){
    await shot(page,`14-note${i+1}`,cards.nth(i));
  }
  await shot(page,'19-premium-recommendation',page.locator('#unniProductLadder'));
  await page.locator('#unniShowOtherProducts').click();
  await page.waitForSelector('#unniOtherProducts',{state:'visible'});
  await shot(page,'20-premium-expanded',page.locator('#unniProductLadder'));

  const full=page.locator('#unniProductLadder [data-unni-product="full_saju"]');
  if(!(await full.isVisible())){await page.locator('#unniShowOtherProducts').click();}
  await page.locator('#unniProductLadder [data-unni-product="full_saju"]').click();
  await page.waitForSelector('#unniProductModal',{state:'visible'});
  await page.waitForFunction(()=>document.querySelector('#unniProductAction')?.textContent?.includes('4,900'));
  await shot(page,'21-full-saju-modal',page.locator('#unniProductModal > div'));
  await page.locator('#unniProductAction').click();
  await page.waitForSelector('#unniProductPayment',{state:'visible'});
  await shot(page,'22-premium-payment',page.locator('#unniProductModal > div'));
  await page.locator('#unniProductClose').click();

  await page.evaluate(()=>{
    FREE_LAUNCH_MODE=true;
    openUnniProduct('full_saju');
  });
  await page.waitForSelector('#unniProductModal',{state:'visible'});
  await page.locator('#unniProductAction').click();
  await page.waitForSelector('#unniProductBody [data-export-kind="full"]',{state:'visible',timeout:10000});
  await shot(page,'23-premium-report-open',page.locator('#unniProductModal > div'));
  await page.locator('#unniProductClose').click();

  await page.locator('#mainShareBtn').scrollIntoViewIfNeeded();
  await shot(page,'24-share-entry',page.locator('#mainShareBtn').locator('xpath=..'));
  await page.locator('#mainShareBtn').click();
  await page.waitForSelector('#storyCaptureMode',{state:'visible',timeout:8000});
  await shot(page,'25-share-capture');

  const small=await browser.newContext({viewport:{width:360,height:740},deviceScaleFactor:1});
  const smallPage=await small.newPage();
  await waitDeployed(smallPage);
  await shot(smallPage,'26-small-entry');
  await small.close();

  await browser.close();
})().catch(e=>{console.error(e.stack||e);process.exit(1);});