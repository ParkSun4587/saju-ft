const { chromium } = require('playwright');
const fs = require('fs');
const BASE='http://127.0.0.1:4173/index.html';
const shot=async(page,name,loc=null)=>{ if(loc){ await loc.screenshot({path:`audit/${name}.png`}); } else { await page.screenshot({path:`audit/${name}.png`,fullPage:true}); } };
async function enter(page){
  await page.goto(BASE,{waitUntil:'load'});
  await page.waitForFunction(()=>typeof selectSplitMode==='function'&&typeof calculateAccurateManse==='function',{timeout:60000});
  await page.locator('#panelRoa').click();
  await page.waitForSelector('#sajuInputCardBox',{state:'visible'});
  await page.fill('#nameInput','테스트');
  await page.locator('#concernGrid .concern-chip').filter({hasText:'연애 · 썸'}).click();
  await page.waitForSelector('#concernSituationBox',{state:'visible'});
  await page.locator('#concernSituationGrid [data-concern-situation="relationship"]').click();
  await page.fill('#birthDateInput','19980221');
  await page.fill('#birthTimeInput','0310');
  await page.evaluate(()=>{FREE_LAUNCH_MODE=false;});
  await page.locator('#splitNextButton button').click();
  await page.waitForSelector('#resultSection',{state:'visible',timeout:30000});
  await page.waitForSelector('#lockedOverlay',{state:'visible',timeout:10000});
}
(async()=>{
  fs.mkdirSync('audit',{recursive:true});
  const browser=await chromium.launch({headless:true});
  const ctx=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1});
  const page=await ctx.newPage();
  await enter(page);
  await page.locator('#lockedOverlay').scrollIntoViewIfNeeded();
  await shot(page,'01-paywall',page.locator('#paywallCard'));
  await page.evaluate(()=>{
    PaymentWidget=()=>({
      renderPaymentMethods(sel){document.querySelector(sel).innerHTML='<div style="padding:12px;border-radius:14px;background:#fff;border:1px solid #e5e7eb"><div style="font-size:12px;font-weight:900;margin-bottom:8px">결제수단</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px"><button style="padding:12px;border:1px solid #ddd;border-radius:12px;background:#fff;font-weight:800">카드</button><button style="padding:12px;border:1px solid #ddd;border-radius:12px;background:#fff;font-weight:800">간편결제</button></div></div>';return {};},
      renderAgreement(sel){document.querySelector(sel).innerHTML='<div style="padding:10px 4px;font-size:11px;color:#64748b">필수 결제 약관 동의</div>';return {getAgreementStatus:()=>({agreedRequiredTerms:true})};},
      requestPayment:async()=>{}
    });
    PaymentWidget.ANONYMOUS='ANON';
  });
  await page.locator('#directPaymentOpenButton').click();
  await page.waitForSelector('#paymentWidgetArea',{state:'visible'});
  await shot(page,'02-paywall-payment',page.locator('#paywallCard'));

  await page.evaluate(()=>{
    FREE_LAUNCH_MODE=true;
    unlockFullReport(null,true);
    if(typeof renderUnniProductCatalog==='function') renderUnniProductCatalog();
  });
  await page.waitForSelector('#unniProductLadder',{state:'visible'});
  await page.locator('#unniProductLadder').scrollIntoViewIfNeeded();
  await shot(page,'03-recommended',page.locator('#unniProductLadder'));
  await page.locator('#unniShowOtherProducts').click();
  await page.waitForSelector('#unniOtherProducts',{state:'visible'});
  await shot(page,'04-expanded-products',page.locator('#unniProductLadder'));

  await page.evaluate(()=>{
    FREE_LAUNCH_MODE=false;
    paymentAPI=async(body)=>{
      if(body?.action==='entitlements')return {ok:true,verifiedPurchases:[],effectiveEntitlements:[],allInOneQuote:{targetProduct:'all_in_one',baseAmount:9900,creditAmount:0,amount:9900,alreadyOwned:false,creditedProducts:[]}};
      if(body?.action==='prepare')return {ok:true,productId:body?.data?.p,orderId:'audit-order',ticket:'audit-ticket',userKey:getUserUniqueKey(currentResultData),amount:4900,baseAmount:4900};
      return {ok:true};
    };
    PaymentWidget=()=>({
      renderPaymentMethods(sel){document.querySelector(sel).innerHTML='<div style="padding:12px;border-radius:14px;background:#fff;border:1px solid #e5e7eb"><div style="font-size:12px;font-weight:900;margin-bottom:8px">결제수단</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px"><button style="padding:12px;border:1px solid #ddd;border-radius:12px;background:#fff;font-weight:800">카드</button><button style="padding:12px;border:1px solid #ddd;border-radius:12px;background:#fff;font-weight:800">간편결제</button></div></div>';return {};},
      renderAgreement(sel){document.querySelector(sel).innerHTML='<div style="padding:10px 4px;font-size:11px;color:#64748b">필수 결제 약관 동의</div>';return {getAgreementStatus:()=>({agreedRequiredTerms:true})};},
      requestPayment:async()=>{}
    });
    PaymentWidget.ANONYMOUS='ANON';
  });
  await page.evaluate(()=>openUnniProduct('full_saju'));
  await page.waitForSelector('#unniProductModal',{state:'visible'});
  await page.waitForFunction(()=>document.querySelector('#unniProductAction')?.textContent?.includes('4,900'));
  await shot(page,'05-full-saju-modal',page.locator('#unniProductModal > div'));
  await page.locator('#unniProductAction').click();
  await page.waitForSelector('#unniProductPayment',{state:'visible'});
  await shot(page,'06-full-saju-payment',page.locator('#unniProductModal > div'));
  await browser.close();
})().catch(e=>{console.error(e.stack||e);process.exit(1);});