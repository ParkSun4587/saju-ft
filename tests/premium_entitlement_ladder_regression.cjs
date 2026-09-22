const fs=require('fs');
const vm=require('vm');
const { webcrypto }=require('crypto');
const { chromium }=require('playwright');

function assert(cond,msg){ if(!cond) throw new Error(msg); }
function plain(v){ return String(v||'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim(); }

function loadServer(){
  let src=fs.readFileSync('functions/api/confirm-payment.js','utf8');
  src=src.replace('export async function onRequestPost','async function onRequestPost');
  src=src.replace('export const __test =','const __test =');
  src+='\nglobalThis.__server={onRequestPost,__test};';
  const sandbox={
    crypto:webcrypto,TextEncoder,TextDecoder,Response,Request,Headers,AbortSignal,URL,URLSearchParams,
    JSON,Date,Uint8Array,console,setTimeout,clearTimeout,
    btoa:(v)=>Buffer.from(v,'binary').toString('base64'),
    atob:(v)=>Buffer.from(v,'base64').toString('binary'),
    fetch:async()=>{throw new Error('UNMOCKED_FETCH');},
  };
  vm.createContext(sandbox);
  vm.runInContext(src,sandbox,{filename:'confirm-payment.js'});
  return sandbox;
}

(async()=>{
  const sandbox=loadServer();
  const server=sandbox.__server;
  const signing='test-signing-secret';
  const secret='test-toss-secret';
  const base={n:'테스트',b:'19980221',t:'03:10',g:'female',c:'solar',k:'money',m:'F',l:false};
  const branchBase={...base,t:'寅',q:'saving'};
  const allSituations={money:'saving',career:'current',love:'relationship',path:'current',people:'friend',mental:'burnout'};
  const bundleExtra={concerns:['career','love','mental'],situations:{career:'current',love:'relationship',mental:'burnout'}};
  const paymentRows={};

  sandbox.fetch=async(url,options={})=>{
    const key=decodeURIComponent(String(url).split('/').pop());
    if(key==='confirm'){
      const body=JSON.parse(options.body||'{}');
      const row={status:'DONE',paymentKey:body.paymentKey,orderId:body.orderId,totalAmount:Number(body.amount),balanceAmount:Number(body.amount),currency:'KRW'};
      return new Response(JSON.stringify(row),{status:200,headers:{'Content-Type':'application/json'}});
    }
    const row=paymentRows[key];
    if(!row) return new Response(JSON.stringify({message:'not found'}),{status:404,headers:{'Content-Type':'application/json'}});
    return new Response(JSON.stringify(row),{status:200,headers:{'Content-Type':'application/json'}});
  };

  async function purchaseRecord(productId,amount,paymentKey,extra={}){
    const d=server.__test.snapshot({...base,p:productId,x:extra});
    const userKey=server.__test.resultKey(d);
    const ownerKey=server.__test.ownerKey(d);
    const orderId='ord_'+productId+'_'+paymentKey;
    paymentRows[paymentKey]={status:'DONE',paymentKey,orderId,totalAmount:amount,balanceAmount:amount,currency:'KRW'};
    const token=await server.__test.signedGrantToken({userKey,ownerKey,orderId,paymentKey,productId,amount,baseAmount:server.__test.PRODUCTS[productId].amount,issuedAt:Date.now()},signing,'v3');
    return {userKey,token};
  }

  const full=await purchaseRecord('full_saju',4900,'pay_full',{});
  const bundle=await purchaseRecord('concern_bundle3',2900,'pay_bundle',bundleExtra);
  const compat=await purchaseRecord('compatibility',5900,'pay_compat',{partner:{n:'상대',b:'19990511',t:'12:00',g:'female',c:'solar',l:false}});
  const all=await purchaseRecord('all_in_one',9900,'pay_all',{situations:allSituations});

  const q=server.__test.calculateUpgradeQuote;
  assert(q('all_in_one',[]).amount===9900,'no-purchase quote must be 9900');
  assert(q('all_in_one',[{productId:'full_saju'}]).amount===5000,'full_saju credit must yield 5000');
  assert(q('all_in_one',[{productId:'concern_bundle3'}]).amount===7000,'bundle credit must yield 7000');
  assert(q('all_in_one',[{productId:'full_saju'},{productId:'concern_bundle3'}]).amount===2100,'two credits must yield 2100');
  assert(q('all_in_one',[{productId:'compatibility'}]).amount===9900,'compatibility must not credit all_in_one');
  assert(q('all_in_one',[{productId:'full_saju'},{productId:'compatibility'}]).amount===5000,'compatibility must not add credit');
  assert(q('all_in_one',[{productId:'all_in_one'}]).alreadyOwned&&q('all_in_one',[{productId:'all_in_one'}]).amount===0,'all_in_one owned state invalid');

  async function call(body){
    const request=new Request('https://example.com/api/confirm-payment',{
      method:'POST',headers:{'Content-Type':'application/json','Origin':'https://example.com'},body:JSON.stringify(body)
    });
    const res=await server.onRequestPost({request,env:{TOSS_SECRET_KEY:secret,TOKEN_SIGNING_SECRET:signing}});
    return {status:res.status,json:await res.json()};
  }

  const entitlementData={...base};
  const branchSnapshot=server.__test.snapshot(branchBase);
  assert(branchSnapshot.t==='寅'&&branchSnapshot.q==='saving','server must preserve selected 12-branch birth time and concern situation');
  const branchPrepare=await call({action:'prepare',data:branchBase,entitlementTokens:[]});
  assert(branchPrepare.status===200&&branchPrepare.json.ok&&branchPrepare.json.amount===990,'12-branch birth time must reach payment prepare');
  const branchResume=await call({action:'resume',ticket:branchPrepare.json.ticket});
  assert(branchResume.status===200&&branchResume.json.data.t==='寅'&&branchResume.json.data.q==='saving','payment ticket resume lost branch time or concern situation');
  const branchCompat=server.__test.snapshot({...base,p:'compatibility',x:{partner:{n:'상대',b:'19990511',t:'子',g:'female',c:'solar',l:false}}});
  assert(branchCompat.x.partner.t==='子','compatibility partner 12-branch birth time must be accepted');

  const none=(await call({action:'entitlements',data:entitlementData,tokens:[]})).json;
  assert(none.allInOneQuote.amount===9900&&none.verifiedPurchases.length===0,'empty entitlement server quote drift');

  const fullState=(await call({action:'entitlements',data:entitlementData,tokens:[full]})).json;
  assert(fullState.allInOneQuote.amount===5000&&fullState.effectiveEntitlements.includes('full_saju'),'verified full_saju server quote failed');

  const bundleState=(await call({action:'entitlements',data:entitlementData,tokens:[bundle]})).json;
  assert(bundleState.allInOneQuote.amount===7000,'verified bundle server quote failed');

  const bothState=(await call({action:'entitlements',data:entitlementData,tokens:[full,bundle]})).json;
  assert(bothState.allInOneQuote.amount===2100,'verified double-credit server quote failed');

  const compatState=(await call({action:'entitlements',data:entitlementData,tokens:[compat]})).json;
  assert(compatState.allInOneQuote.amount===9900&&!compatState.effectiveEntitlements.includes('full_saju'),'compatibility leaked into single-person credit');

  const allState=(await call({action:'entitlements',data:entitlementData,tokens:[all]})).json;
  assert(allState.effectiveEntitlements.includes('full_saju')&&allState.effectiveEntitlements.includes('concern_bundle3')&&!allState.effectiveEntitlements.includes('compatibility'),'all_in_one entitlement graph invalid');

  const fake=(await call({action:'entitlements',data:entitlementData,tokens:[{userKey:full.userKey,token:'v3.fake.fake'}]})).json;
  assert(fake.allInOneQuote.amount===9900&&fake.verifiedPurchases.length===0,'fake local grant produced credit');

  const fullSnap=server.__test.snapshot({...base,p:'full_saju',x:{}});
  const expiredGrant={userKey:server.__test.resultKey(fullSnap),ownerKey:server.__test.ownerKey(fullSnap),orderId:'expired',paymentKey:'pay_expired',productId:'full_saju',amount:4900,exp:Date.now()-1000};
  const expiredToken=await server.__test.signedGrantToken(expiredGrant,signing,'v3');
  const expired=(await call({action:'entitlements',data:entitlementData,tokens:[{userKey:expiredGrant.userKey,token:expiredToken}]})).json;
  assert(expired.allInOneQuote.amount===9900&&expired.verifiedPurchases.length===0,'expired entitlement produced credit');

  const allData={...base,p:'all_in_one',x:{situations:allSituations}};
  const preparedFull=await call({action:'prepare',data:allData,entitlementTokens:[full]});
  assert(preparedFull.status===200&&preparedFull.json.amount===5000&&preparedFull.json.baseAmount===9900,'server prepare ignored full_saju credit');
  const preparedBundle=await call({action:'prepare',data:allData,entitlementTokens:[bundle]});
  assert(preparedBundle.json.amount===7000,'server prepare ignored bundle credit');
  const preparedBoth=await call({action:'prepare',data:allData,entitlementTokens:[full,bundle]});
  assert(preparedBoth.json.amount===2100,'server prepare ignored combined credit');
  const preparedCompat=await call({action:'prepare',data:allData,entitlementTokens:[compat]});
  assert(preparedCompat.json.amount===9900,'server prepare credited compatibility');

  const blockedFullFromAll=await call({action:'prepare',data:{...base,p:'full_saju',x:{}},entitlementTokens:[all]});
  assert(blockedFullFromAll.status===409&&!blockedFullFromAll.json.ok,'all_in_one owner can repurchase included full_saju');
  const blockedBundleFromAll=await call({action:'prepare',data:{...base,p:'concern_bundle3',x:bundleExtra},entitlementTokens:[all]});
  assert(blockedBundleFromAll.status===409&&!blockedBundleFromAll.json.ok,'all_in_one owner can repurchase included concern bundle');
  const compatAfterAll=await call({action:'prepare',data:{...base,p:'compatibility',x:{partner:{n:'다른상대',b:'20010101',t:'unknown',g:'male',c:'solar',l:false}}},entitlementTokens:[all]});
  assert(compatAfterAll.status===200&&compatAfterAll.json.amount===5900,'all_in_one incorrectly entitles or discounts compatibility');

  const tampered=await call({action:'confirm',paymentKey:'pay_upgrade_bad',orderId:preparedFull.json.orderId,amount:9900,userKey:preparedFull.json.userKey,ticket:preparedFull.json.ticket});
  assert(tampered.status===400&&!tampered.json.ok,'tampered return amount was accepted');

  const confirmed=await call({action:'confirm',paymentKey:'pay_upgrade_ok',orderId:preparedFull.json.orderId,amount:5000,userKey:preparedFull.json.userKey,ticket:preparedFull.json.ticket});
  assert(confirmed.status===200&&confirmed.json.ok&&confirmed.json.amount===5000&&confirmed.json.baseAmount===9900,'server did not confirm ticket-quoted upgrade amount');

  const browser=await chromium.launch({headless:true});
  const page=await browser.newPage({viewport:{width:390,height:844}});
  const browserErrors=[];
  page.on('pageerror',e=>browserErrors.push(e.stack||e.message));
  await page.goto('http://127.0.0.1:4173/index.html',{waitUntil:'load',timeout:60000});
  await page.waitForFunction(()=>(
    globalThis.__UNNI_PRODUCT_ENTITLEMENTS_V1__?.version==='1.0.0' &&
    globalThis.__UNNI_PRODUCTS_V1__?.version==='2.1.0'
  ),null,{timeout:60000});

  const report=await page.evaluate(()=>{
    const plain=v=>String(v||'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
    const product=globalThis.__UNNI_PRODUCTS_V1__;
    const ent=globalThis.__UNNI_PRODUCT_ENTITLEMENTS_V1__;
    const d=calculateAccurateManse(1998,2,21,'03:10','female');
    d.__testNowYmd='2026-09-20';d.concernKey='money';d.concernSituation='saving';d.currentMode='F';
    const notes=generateConcernNotes(d,'F');
    const before={fp:d.classicalReasoningV1.structureFingerprint,claims:d.classicalReasoningV1.claims.map(x=>x.conclusion),note6:plain(notes[5]?.desc)};
    const sections=product.buildFullSajuSections(d,'F');
    const full=product.buildProductBody('full_saju',d,{});
    const allExtra={situations:{money:'saving',career:'current',love:'relationship',path:'current',people:'friend',mental:'burnout'}};
    const allHtml=product.buildProductBody('all_in_one',d,allExtra);
    const root=document.createElement('div');root.innerHTML=full;
    const allRoot=document.createElement('div');allRoot.innerHTML=allHtml;
    const annualYears=(d.classicalReasoningV1.timing.fullSajuTimeline?.years||[]).filter(y=>y.year>Number(d.classicalReasoningV1.timing.today.slice(0,4))).slice(0,5).map(y=>y.year);
    const fullText=plain(full);
    const after={fp:d.classicalReasoningV1.structureFingerprint,claims:d.classicalReasoningV1.claims.map(x=>x.conclusion)};
    const state=(ids)=>({verifiedPurchases:ids.map((productId,i)=>({productId,userKey:'u'+i}))});
    return {
      before,after,
      sections:sections.map(x=>({title:x.title,body:plain(x.body),claim:x.claim})),
      renderedSections:root.querySelectorAll('[data-full-saju-section]').length,
      annualYears,
      fullText,
      section10:plain(root.querySelector('[data-full-saju-section="10"]')?.innerText||''),
      section11:plain(root.querySelector('[data-full-saju-section="11"]')?.innerText||''),
      all:{
        fullSections:allRoot.querySelectorAll('[data-full-saju-section]').length,
        notes:allRoot.querySelectorAll('article').length,
        common:allRoot.querySelectorAll('[data-product-exclusive="all_in_one"]').length,
        timing:allRoot.querySelectorAll('[data-product-exclusive="all_in_one-timing"]').length,
        strategy:allRoot.querySelectorAll('[data-product-exclusive="all_in_one-strategy"]').length,
        compat:allRoot.querySelectorAll('[data-export-compat-timing],[data-product-exclusive="compatibility"]').length,
      },
      graph:{
        allFull:ent.hasEntitlement(state(['all_in_one']),'full_saju'),
        allBundle:ent.hasEntitlement(state(['all_in_one']),'concern_bundle3'),
        allCompat:ent.hasEntitlement(state(['all_in_one']),'compatibility'),
        none:ent.calculateUpgradeQuote({targetProduct:'all_in_one',verifiedEntitlements:[]}).amount,
        full:ent.calculateUpgradeQuote({targetProduct:'all_in_one',verifiedEntitlements:['full_saju']}).amount,
        bundle:ent.calculateUpgradeQuote({targetProduct:'all_in_one',verifiedEntitlements:['concern_bundle3']}).amount,
        both:ent.calculateUpgradeQuote({targetProduct:'all_in_one',verifiedEntitlements:['full_saju','concern_bundle3']}).amount,
        compat:ent.calculateUpgradeQuote({targetProduct:'all_in_one',verifiedEntitlements:['compatibility']}).amount,
        states:{
          fullOwned:ent.getProductState('full_saju',state(['full_saju'])),
          fullIncluded:ent.getProductState('full_saju',state(['all_in_one'])),
          upgradeFull:ent.getProductState('all_in_one',state(['full_saju'])),
          upgradeBoth:ent.getProductState('all_in_one',state(['full_saju','concern_bundle3'])),
        },
        recs:{
          none:product.recommendedProductId(d,state([])),
          full:product.recommendedProductId(d,state(['full_saju'])),
          bundle:product.recommendedProductId(d,state(['concern_bundle3'])),
          both:product.recommendedProductId(d,state(['full_saju','concern_bundle3'])),
          all:product.recommendedProductId(d,state(['all_in_one'])),
          compat:product.recommendedProductId(d,state(['compatibility'])),
        },
      },
    };
  });

  assert(report.sections.length===12&&report.renderedSections===12,'full_saju must have 12 sections');
  assert(report.sections.every(x=>x.claim&&x.claim.newFacts?.length&&x.claim.conclusion),'every full_saju section needs a claim/new fact/conclusion');
  assert(new Set(report.sections.map(x=>JSON.stringify(x.claim.newFacts))).size===12,'full_saju sections repeat the same factual unit');
  assert(new Set(report.sections.map(x=>x.claim.conclusion)).size===12,'full_saju sections repeat the same conclusion');
  const fullSajuStructureWords=['핵심','먼저 보면','큰 흐름부터 보면','왜','왜냐면','실제','현실에서는','이렇게 써','그래서','언니가 마지막으로 남길 기준','활용','주의'];
  assert(report.sections.every(x=>fullSajuStructureWords.filter(k=>x.body.includes(k)).length>=2),'full_saju sections are too thin '+JSON.stringify(report.sections.map(x=>x.title)));
  assert(report.annualYears.length===5&&report.annualYears.every(y=>report.section11.includes(String(y))),'full_saju five-year section not sourced from classical timing '+JSON.stringify(report.annualYears));
  assert(!report.section10.includes(report.before.note6)&&report.section10!==report.before.note6,'full_saju near-term copied NOTE6 teaser verbatim');
  assert(report.before.fp===report.after.fp&&JSON.stringify(report.before.claims)===JSON.stringify(report.after.claims),'premium rendering changed classical reasoning');
  assert(report.all.fullSections===12&&report.all.notes===36&&report.all.common===1&&report.all.timing===1&&report.all.strategy===1,'all_in_one is not full_saju + 6 concerns + synthesis '+JSON.stringify(report.all));
  assert(report.all.compat===0,'all_in_one contains compatibility data');
  assert(report.graph.allFull&&report.graph.allBundle&&!report.graph.allCompat,'client entitlement graph invalid');
  assert(JSON.stringify([report.graph.none,report.graph.full,report.graph.bundle,report.graph.both,report.graph.compat])===JSON.stringify([9900,5000,7000,2100,9900]),'client upgrade quotes drift '+JSON.stringify(report.graph));
  assert(report.graph.states.fullOwned.kind==='purchased'&&report.graph.states.fullIncluded.kind==='included','purchased/included states drift');
  assert(report.graph.states.upgradeFull.amount===5000&&report.graph.states.upgradeBoth.amount===2100,'upgrade UI states drift');
  assert(report.graph.recs.none==='full_saju','no-premium default recommendation must be full_saju');
  assert(report.graph.recs.full==='all_in_one'&&report.graph.recs.bundle==='full_saju'&&report.graph.recs.both==='all_in_one'&&report.graph.recs.all==='compatibility'&&report.graph.recs.compat==='full_saju','entitlement-aware recommendations drift '+JSON.stringify(report.graph.recs));

  const freeGrant=await page.evaluate(async()=>{
    for(let i=localStorage.length-1;i>=0;i--){const k=localStorage.key(i);if(k?.startsWith('unni_product_grant_v1_'))localStorage.removeItem(k);}
    const d=calculateAccurateManse(1998,2,21,'03:10','female');
    d.__testNowYmd='2026-09-20';d.concernKey='money';d.concernSituation='saving';d.currentMode='F';
    generateConcernNotes(d,'F');
    currentResultData=d;selectedSplitMode='F';
    const before=[...Array(localStorage.length)].map((_,i)=>localStorage.key(i)).filter(k=>k?.startsWith('unni_product_grant_v1_')).length;
    await openUnniProduct('full_saju');
    document.querySelector('#unniProductAction')?.click();
    await new Promise(r=>setTimeout(r,20));
    const after=[...Array(localStorage.length)].map((_,i)=>localStorage.key(i)).filter(k=>k?.startsWith('unni_product_grant_v1_')).length;
    document.querySelector('#unniProductClose')?.click();
    return {before,after};
  });
  assert(freeGrant.before===0&&freeGrant.after===0,'FREE_LAUNCH_MODE created paid entitlement '+JSON.stringify(freeGrant));
  assert(browserErrors.length===0,'browser errors '+browserErrors.join(' | '));

  const premiumSrc=fs.readFileSync('premium-products-v1.js','utf8');
  const serverSrc=fs.readFileSync('functions/api/confirm-payment.js','utf8');
  assert(
    premiumSrc.includes('renderPaymentMethods("#unniProductPaymentMethod", { value:order.amount') &&
    serverSrc.includes('body:JSON.stringify({ paymentKey:body.paymentKey,orderId:order.orderId,amount:expectedAmount })') &&
    serverSrc.includes('Number(body.amount) !== expectedAmount'),
    'checkout/server amount binding missing'
  );

  console.log('PREMIUM_ENTITLEMENT_LADDER_PASS',JSON.stringify({
    quotes:{none:9900,full:5000,bundle:7000,both:2100,compatibility:9900},
    graph:report.graph,
    fullSections:report.sections.map(x=>({title:x.title,sourceRuleIds:x.claim.sourceRuleIds,newFacts:x.claim.newFacts,conclusion:x.claim.conclusion})),
    allInOne:report.all,
    freeGrant,
  }));
  await browser.close();
})().catch(err=>{console.error(err.stack||err);process.exit(1);});
