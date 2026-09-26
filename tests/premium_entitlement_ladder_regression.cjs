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
  const bundleExtra={questions:[
    '지금 회사에 남는 게 나아, 옮기는 게 나아?',
    '올해 새로운 인연은 언제쯤 들어와?',
    '사업하면 어떤 방식이 나한테 맞아?',
  ]};
  const paymentRows={};

  sandbox.fetch=async(url,options={})=>{
    const key=decodeURIComponent(String(url).split('/').pop());
    if(key==='confirm'){
      const body=JSON.parse(options.body||'{}');
      if(body.paymentKey==='pay_declined'){
        return new Response(JSON.stringify({code:'REJECT_CARD_COMPANY',message:'잔액이 부족합니다.'}),{status:400,headers:{'Content-Type':'application/json'}});
      }
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

  const full=await purchaseRecord('full_saju',100,'pay_full',{});
  const bundle=await purchaseRecord('concern_bundle3',100,'pay_bundle',bundleExtra);
  const compat=await purchaseRecord('compatibility',100,'pay_compat',{partner:{n:'상대',b:'19990511',t:'12:00',g:'female',c:'solar',l:false}});
  const all=await purchaseRecord('all_in_one',100,'pay_all',{});

  const verifiedFull=await call({action:'verify',userKey:full.userKey,token:full.token,expectedProductId:'full_saju'});
  assert(verifiedFull.status===200&&verifiedFull.json.ok===true,'matching premium grant verification failed');
  const crossFullToAll=await call({action:'verify',userKey:full.userKey,token:full.token,expectedProductId:'all_in_one'});
  assert(crossFullToAll.status===200&&crossFullToAll.json.ok===false,'full_saju grant unlocked all_in_one');
  const crossCompatToFull=await call({action:'verify',userKey:compat.userKey,token:compat.token,expectedProductId:'full_saju'});
  assert(crossCompatToFull.status===200&&crossCompatToFull.json.ok===false,'compatibility grant unlocked full_saju');
  const includedAllToFull=await call({action:'verify',userKey:all.userKey,token:all.token,expectedProductId:'full_saju'});
  assert(includedAllToFull.status===200&&includedAllToFull.json.ok===true,'all_in_one should include full_saju access');
  const crossAllToCompat=await call({action:'verify',userKey:all.userKey,token:all.token,expectedProductId:'compatibility'});
  assert(crossAllToCompat.status===200&&crossAllToCompat.json.ok===false,'all_in_one incorrectly unlocked compatibility');

  const q=server.__test.calculateUpgradeQuote;
  assert(q('all_in_one',[]).amount===100,'QA no-purchase quote must be 100');
  assert(q('all_in_one',[{productId:'full_saju'}]).amount===100,'QA full_saju state must keep all_in_one payable at 100');
  assert(q('all_in_one',[{productId:'concern_bundle3'}]).amount===100,'QA bundle state must keep all_in_one payable at 100');
  assert(q('all_in_one',[{productId:'full_saju'},{productId:'concern_bundle3'}]).amount===100,'QA prior purchases must keep all_in_one payable at 100');
  assert(q('all_in_one',[{productId:'compatibility'}]).amount===100,'compatibility must keep all_in_one at QA price');
  assert(q('all_in_one',[{productId:'full_saju'},{productId:'compatibility'}]).amount===100,'compatibility must not alter QA price');
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
  const questionA=server.__test.snapshot({...base,k:'consultation',q:'사업하면 AI 앱이랑 음식점 중 뭐가 더 맞아?',p:'concern_single',x:{}});
  const questionB=server.__test.snapshot({...base,k:'consultation',q:'올해 새로운 인연은 언제 들어와?',p:'concern_single',x:{}});
  const questionKeyA=server.__test.resultKey(questionA);
  const questionKeyB=server.__test.resultKey(questionB);
  assert(questionKeyA!==questionKeyB,'different free questions must never share a basic purchase key');
  assert(server.__test.ownerKey(questionA)===server.__test.ownerKey(questionB),'same person free questions must still share the owner scope');

  const branchPrepare=await call({action:'prepare',data:branchBase,entitlementTokens:[]});
  assert(branchPrepare.status===200&&branchPrepare.json.ok&&branchPrepare.json.amount===100,'12-branch birth time must reach payment prepare');
  const branchResume=await call({action:'resume',ticket:branchPrepare.json.ticket});
  assert(branchResume.status===200&&branchResume.json.data.t==='寅'&&branchResume.json.data.q==='saving','payment ticket resume lost branch time or concern situation');
  const declined=await call({
    action:'confirm',
    paymentKey:'pay_declined',
    orderId:branchPrepare.json.orderId,
    amount:branchPrepare.json.amount,
    userKey:branchPrepare.json.userKey,
    ticket:branchPrepare.json.ticket,
  });
  assert(
    declined.status===409 &&
    declined.json.paymentFailed===true &&
    declined.json.code==='REJECT_CARD_COMPANY' &&
    /잔액/.test(declined.json.message||''),
    'definitive card decline must not fall into ambiguous same-order retry '+JSON.stringify(declined)
  );
  const branchCompat=server.__test.snapshot({...base,p:'compatibility',x:{partner:{n:'상대',b:'19990511',t:'子',g:'female',c:'solar',l:false}}});
  assert(branchCompat.x.partner.t==='子','compatibility partner 12-branch birth time must be accepted');

  const none=(await call({action:'entitlements',data:entitlementData,tokens:[]})).json;
  assert(none.allInOneQuote.amount===100&&none.verifiedPurchases.length===0,'empty entitlement server quote drift');

  const fullState=(await call({action:'entitlements',data:entitlementData,tokens:[full]})).json;
  assert(fullState.allInOneQuote.amount===100&&fullState.effectiveEntitlements.includes('full_saju'),'verified full_saju server quote failed');

  const bundleState=(await call({action:'entitlements',data:entitlementData,tokens:[bundle]})).json;
  assert(bundleState.allInOneQuote.amount===100,'verified bundle server quote failed');

  const bothState=(await call({action:'entitlements',data:entitlementData,tokens:[full,bundle]})).json;
  assert(bothState.allInOneQuote.amount===100,'verified double-credit server quote failed');

  const compatState=(await call({action:'entitlements',data:entitlementData,tokens:[compat]})).json;
  assert(compatState.allInOneQuote.amount===100&&!compatState.effectiveEntitlements.includes('full_saju'),'compatibility leaked into single-person credit');

  const allState=(await call({action:'entitlements',data:entitlementData,tokens:[all]})).json;
  assert(allState.effectiveEntitlements.includes('full_saju')&&allState.effectiveEntitlements.includes('concern_bundle3')&&allState.effectiveEntitlements.includes('question_pack3')&&!allState.effectiveEntitlements.includes('compatibility'),'all_in_one entitlement graph invalid');

  const fake=(await call({action:'entitlements',data:entitlementData,tokens:[{userKey:full.userKey,token:'v3.fake.fake'}]})).json;
  assert(fake.allInOneQuote.amount===100&&fake.verifiedPurchases.length===0,'fake local grant produced credit');

  const fullSnap=server.__test.snapshot({...base,p:'full_saju',x:{}});
  const expiredGrant={userKey:server.__test.resultKey(fullSnap),ownerKey:server.__test.ownerKey(fullSnap),orderId:'expired',paymentKey:'pay_expired',productId:'full_saju',amount:100,exp:Date.now()-1000};
  const expiredToken=await server.__test.signedGrantToken(expiredGrant,signing,'v3');
  const expired=(await call({action:'entitlements',data:entitlementData,tokens:[{userKey:expiredGrant.userKey,token:expiredToken}]})).json;
  assert(expired.allInOneQuote.amount===100&&expired.verifiedPurchases.length===0,'expired entitlement produced credit');

  const allData={...base,p:'all_in_one',x:{}};
  const preparedFull=await call({action:'prepare',data:allData,entitlementTokens:[full]});
  assert(preparedFull.status===200&&preparedFull.json.amount===100&&preparedFull.json.baseAmount===100,'server prepare ignored full_saju credit');
  const preparedBundle=await call({action:'prepare',data:allData,entitlementTokens:[bundle]});
  assert(preparedBundle.json.amount===100,'server prepare ignored bundle credit');
  const preparedBoth=await call({action:'prepare',data:allData,entitlementTokens:[full,bundle]});
  assert(preparedBoth.json.amount===100,'server prepare ignored combined credit');
  const preparedCompat=await call({action:'prepare',data:allData,entitlementTokens:[compat]});
  assert(preparedCompat.json.amount===100,'server prepare credited compatibility');

  const blockedFullFromAll=await call({action:'prepare',data:{...base,p:'full_saju',x:{}},entitlementTokens:[all]});
  assert(blockedFullFromAll.status===409&&!blockedFullFromAll.json.ok,'all_in_one owner can repurchase included full_saju');
  const blockedBundleFromAll=await call({action:'prepare',data:{...base,p:'concern_bundle3',x:bundleExtra},entitlementTokens:[all]});
  assert(blockedBundleFromAll.status===409&&!blockedBundleFromAll.json.ok,'all_in_one owner can repurchase included concern bundle');
  const compatAfterAll=await call({action:'prepare',data:{...base,p:'compatibility',x:{partner:{n:'다른상대',b:'20010101',t:'unknown',g:'male',c:'solar',l:false}}},entitlementTokens:[all]});
  assert(compatAfterAll.status===200&&compatAfterAll.json.amount===100,'all_in_one incorrectly entitles or discounts compatibility');
  const sameCompatAgain=await call({
    action:'prepare',
    data:{...base,p:'compatibility',x:{partner:{n:'이름변경',b:'19990511',t:'12:00',g:'female',c:'solar',l:false}}},
    entitlementTokens:[compat],
  });
  assert(
    sameCompatAgain.status===409&&!sameCompatAgain.json.ok,
    'same compatibility pair could be charged again after nickname change '+JSON.stringify(sameCompatAgain)
  );
  const differentCompat=await call({
    action:'prepare',
    data:{...base,p:'compatibility',x:{partner:{n:'다른상대',b:'20010101',t:'unknown',g:'male',c:'solar',l:false}}},
    entitlementTokens:[compat],
  });
  assert(
    differentCompat.status===200&&differentCompat.json.amount===100,
    'existing compatibility purchase blocked a different partner '+JSON.stringify(differentCompat)
  );


  const tampered=await call({action:'confirm',paymentKey:'pay_upgrade_bad',orderId:preparedFull.json.orderId,amount:101,userKey:preparedFull.json.userKey,ticket:preparedFull.json.ticket});
  assert(tampered.status===400&&!tampered.json.ok,'tampered return amount was accepted');

  const confirmed=await call({action:'confirm',paymentKey:'pay_upgrade_ok',orderId:preparedFull.json.orderId,amount:100,userKey:preparedFull.json.userKey,ticket:preparedFull.json.ticket});
  assert(confirmed.status===200&&confirmed.json.ok&&confirmed.json.amount===100&&confirmed.json.baseAmount===100,'server did not confirm ticket-quoted upgrade amount');

  const browser=await chromium.launch({headless:true});
  const page=await browser.newPage({viewport:{width:390,height:844}});
  const browserErrors=[];
  page.on('pageerror',e=>browserErrors.push(e.stack||e.message));
  await page.goto('http://127.0.0.1:4173/index.html',{waitUntil:'load',timeout:60000});
  await page.waitForFunction(()=>(
    globalThis.__UNNI_PRODUCT_ENTITLEMENTS_V1__?.version==='1.0.0' &&
    globalThis.__UNNI_PRODUCTS_V1__?.version==='2.3.1'
  ),null,{timeout:60000});

  const report=await page.evaluate(()=>{
    const plain=v=>String(v||'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
    const product=globalThis.__UNNI_PRODUCTS_V1__;
    const ent=globalThis.__UNNI_PRODUCT_ENTITLEMENTS_V1__;
    const d=calculateAccurateManse(1998,2,21,'03:10','female');
    d.__testNowYmd='2026-09-20';d.concernKey='money';d.concernSituation='saving';d.currentMode='F';
    const notes=generateConcernNotes(d,'F');
    const before={fp:d.classicalReasoningV1.structureFingerprint,claims:d.classicalReasoningV1.claims.map(x=>x.conclusion),timingAnswer:plain(notes[4]?.desc)};
    const consultationData={
      ...d,
      concernKey:'consultation',
      concernSituation:'free',
      userQuestion:'사업하면 어떤 방식이 맞고 언제 시작하는 게 좋아?',
      __consultationV1:{cards:[
        {badge:'네 질문의 답',title:'사업 선택의 기준',desc:'직접 답'},
        {badge:'왜 이런 답인지',title:'왜 이런 구조인지',desc:'근거'},
        {badge:'특히 조심할 것',title:'어디서 소모되는지',desc:'주의'},
        {badge:'지금 할 일',title:'무엇부터 검증할지',desc:'행동'},
      ]},
    };
    const sections=product.buildFullSajuSections(consultationData,'F');
    const full=product.buildProductBody('full_saju',consultationData,{});
    const allHtml=product.buildProductBody('all_in_one',consultationData,{});
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
      fullPrompt:product.buildPremiumConsultationPrompt('full_saju',consultationData),
      deepPrompt:product.buildPremiumConsultationPrompt('all_in_one',consultationData),
      annualYears,
      fullText,
      section10:plain(root.querySelector('[data-full-saju-section="10"]')?.innerText||''),
      section11:plain(root.querySelector('[data-full-saju-section="11"]')?.innerText||''),
      all:{
        fullSections:allRoot.querySelectorAll('[data-full-saju-section]').length,
        notes:allRoot.querySelectorAll('article').length,
        common:allRoot.querySelectorAll('[data-product-exclusive="all_in_one"]').length,
        questionLink:allRoot.querySelectorAll('[data-product-exclusive="all_in_one-question"]').length,
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

  assert(report.sections.length===12&&report.renderedSections===0,'legacy full-saju builder may remain, but the new product must not render its fixed 12-section report');
  assert(report.fullPrompt.includes('5~7개 카드')&&report.fullPrompt.includes('장기 변곡점은 이 상담에 넣지 마'),'4,900 dynamic whole-consultation contract drift');
  assert(report.deepPrompt.includes('현재 질문')&&report.deepPrompt.includes('12~18개월')&&report.deepPrompt.includes('5년 변곡점'),'9,900 deep-consultation contract drift');
  assert(report.annualYears.length===5&&!report.fullText.includes('앞으로 5년 큰 흐름'),'4,900 full_saju must keep five-year detail out of its rendered product');
  assert(report.fullText.includes('사주 전체')&&report.fullText.includes('중요한 주제'),'full_saju dynamic consultation shell missing');
  assert(report.before.fp===report.after.fp&&JSON.stringify(report.before.claims)===JSON.stringify(report.after.claims),'premium rendering changed classical reasoning');
  assert(report.all.fullSections===0&&report.all.notes===0&&report.all.common===0&&report.all.questionLink===0&&report.all.timing===0&&report.all.strategy===0,'all_in_one should render a dynamic deep-consultation shell instead of duplicating full_saju '+JSON.stringify(report.all));
  assert(report.all.compat===0,'all_in_one contains compatibility data');
  assert(report.graph.allFull&&report.graph.allBundle&&!report.graph.allCompat,'client entitlement graph invalid');
  assert(JSON.stringify([report.graph.none,report.graph.full,report.graph.bundle,report.graph.both,report.graph.compat])===JSON.stringify([100,100,100,100,100]),'client upgrade quotes drift '+JSON.stringify(report.graph));
  assert(report.graph.states.fullOwned.kind==='purchased'&&report.graph.states.fullIncluded.kind==='included','purchased/included states drift');
  assert(report.graph.states.upgradeFull.kind==='unpurchased'&&report.graph.states.upgradeFull.amount===100&&report.graph.states.upgradeBoth.kind==='unpurchased'&&report.graph.states.upgradeBoth.amount===100,'upgrade UI states drift');
  assert(report.graph.recs.none==='full_saju','no-premium default recommendation must be full_saju');
  assert(report.graph.recs.full==='all_in_one'&&report.graph.recs.bundle==='full_saju'&&report.graph.recs.both==='all_in_one'&&report.graph.recs.all==='compatibility'&&report.graph.recs.compat==='full_saju','retired question-pack must never be a new recommendation '+JSON.stringify(report.graph.recs));

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
    serverSrc.includes('Number(body.amount) !== expectedAmount') &&
    premiumSrc.includes('verifyAccessToken(directStoredGrant.userKey,directStoredGrant.token,productId)') &&
    serverSrc.includes('expectedProductId') &&
    serverSrc.includes('grant.productId === expectedProductId'),
    'checkout/server amount or product-bound grant binding missing'
  );

  console.log('PREMIUM_ENTITLEMENT_LADDER_PASS',JSON.stringify({
    quotes:{none:100,full:100,bundle:100,both:100,compatibility:100},
    graph:report.graph,
    fullSections:report.sections.map(x=>({title:x.title,sourceRuleIds:x.claim.sourceRuleIds,newFacts:x.claim.newFacts,conclusion:x.claim.conclusion})),
    allInOne:report.all,
    freeGrant,
  }));
  await browser.close();
})().catch(err=>{console.error(err.stack||err);process.exit(1);});
