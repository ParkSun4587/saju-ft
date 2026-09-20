const { chromium } = require('playwright');
const fs = require('fs');

function assert(cond,msg){ if(!cond) throw new Error(msg); }

(async()=>{
  const browser=await chromium.launch({headless:true});
  const page=await browser.newPage({viewport:{width:390,height:844}});
  const errors=[];
  page.on('pageerror',e=>errors.push('[pageerror] '+(e.stack||e.message)));
  page.on('console',m=>{ if(m.type()==='error') errors.push('[console] '+m.text()); });

  await page.goto('http://127.0.0.1:4173/index.html',{waitUntil:'load',timeout:60000});
  await page.waitForFunction(()=>(
    globalThis.__CLASSICAL_REASONING_V1__?.version==='1.2.0' &&
    globalThis.__CONCERN_NOTE_ENGINE_V2__?.version==='3.2.1' &&
    globalThis.__UNNI_PRODUCT_CONTENT_POLICY_V1__?.version==='1.1.0' &&
    globalThis.__UNNI_PRODUCTS_V1__?.version==='2.0.1'
  ),null,{timeout:60000});

  const source=fs.readFileSync('index.html','utf8');
  assert(!source.includes('getTrueBaziTiming'),'legacy getTrueBaziTiming remains in index.html');
  assert(!source.includes('buildNoteSixTiming'),'legacy buildNoteSixTiming remains in index.html');
  assert(!source.includes('2026-2027'),'legacy 2026-2027 NOTE6 badge remains in index.html');
  assert(!/\by2026\b|\by2027\b/.test(source),'legacy y2026/y2027 timing keys remain in index.html');

  const runtime=await page.evaluate(()=>{
    const d=calculateAccurateManse(1998,2,21,'03:10','female');
    d.__testNowYmd='2026-09-20';
    d.concernKey='career';
    d.concernSituation='current';
    const notes=generateConcernNotes(d,'F');
    const timing=d.classicalReasoningV1?.timing||{};
    return {
      oldGet:typeof globalThis.getTrueBaziTiming,
      oldBuild:typeof globalThis.buildNoteSixTiming,
      wrapped:!!globalThis.generateConcernNotes?.__classicalCausal,
      note6Badge:notes[5]?.badge||'',
      note6Text:String(notes[5]?.desc||'').replace(/<[^>]+>/g,' '),
      meta:notes[5]?.__timingQA||{},
      audit:d.noteV3Audit,
      timing:{
        today:timing.today,detailEnd:timing.detailEnd,horizonEnd:timing.horizonEnd,
        internalHorizonEnd:timing.internalHorizonEnd,
        nearCount:timing.concernNearTerm?.months?.length||0,
        publicYears:timing.fullSajuTimeline?.years?.map(x=>x.year)||[],
        internalYears:timing.fullHorizon?.years?.map(x=>x.year)||[],
      },
    };
  });

  assert(runtime.oldGet==='undefined'&&runtime.oldBuild==='undefined','legacy timing functions still exist at runtime '+JSON.stringify(runtime));
  assert(runtime.wrapped&&runtime.audit?.engine==='classical-causal','runtime NOTE path is not classical concern-note engine');
  assert(!runtime.note6Badge.includes('2026-2027')&&!runtime.note6Text.includes('2026-2027'),'legacy fixed-year NOTE6 badge/text generated');
  assert(runtime.meta.disclosureContract==='basic_concern'&&runtime.meta.fullFiveYearAllowed===false,'basic NOTE6 disclosure policy not enforced '+JSON.stringify(runtime.meta));
  assert(runtime.timing.nearCount>=17&&runtime.timing.publicYears.length>=5&&runtime.timing.internalYears.length>=10,'rolling timing coverage missing '+JSON.stringify(runtime.timing));

  async function mockedTiming(ymd){
    return page.evaluate((ymd)=>{
      const RealDate=Date;
      const fakeIso=ymd+'T03:00:00.000Z';
      class FakeDate extends RealDate {
        constructor(...args){ super(...(args.length?args:[fakeIso])); }
        static now(){ return new RealDate(fakeIso).getTime(); }
      }
      globalThis.Date=FakeDate;
      try{
        const d=calculateAccurateManse(1998,2,21,'03:10','female');
        d.__testNowYmd=ymd;
        d.concernKey='money'; d.concernSituation='saving';
        const notes=generateConcernNotes(d,'F');
        const t=d.classicalReasoningV1.timing;
        return {
          ymd,
          today:t.today,detailEnd:t.detailEnd,horizonEnd:t.horizonEnd,internalHorizonEnd:t.internalHorizonEnd,
          nearCount:t.concernNearTerm?.months?.length||0,
          publicYears:t.fullSajuTimeline?.years?.map(x=>x.year)||[],
          internalYears:t.fullHorizon?.years?.map(x=>x.year)||[],
          note6Meta:notes[5]?.__timingQA||{},
        };
      } finally {
        globalThis.Date=RealDate;
      }
    },ymd);
  }

  const mocked2027=await mockedTiming('2027-03-15');
  const mocked2028=await mockedTiming('2028-08-01');
  for(const row of [mocked2027,mocked2028]){
    const startYear=Number(row.ymd.slice(0,4));
    assert(row.today===row.ymd,'mocked rolling today drift '+JSON.stringify(row));
    assert(row.nearCount>=17,'mocked +18 month detail missing '+JSON.stringify(row));
    assert(row.publicYears[0]===startYear&&row.publicYears.at(-1)>=startYear+5,'mocked five-year horizon did not roll '+JSON.stringify(row));
    assert(row.internalYears[0]===startYear&&row.internalYears.at(-1)>=startYear+10,'mocked internal ten-year horizon did not roll '+JSON.stringify(row));
    assert(row.note6Meta.detailEnd===row.detailEnd&&row.note6Meta.horizonEnd===row.horizonEnd,'NOTE6 did not consume same rolling timing '+JSON.stringify(row));
  }

  const policy=await page.evaluate(()=>{
    const p=globalThis.__UNNI_PRODUCT_CONTENT_POLICY_V1__;
    return {
      featureMatrix:p.featureMatrix,
      basicFull:p.canRenderFeature('basic_concern','full-five-year'),
      bundleFull:p.canRenderFeature('concern_bundle3','full-five-year'),
      fullCompat:p.canRenderFeature('full_saju','compatibility',{secondPersonPresent:true}),
      allCompat:p.canRenderFeature('all_in_one','compatibility',{secondPersonPresent:true}),
      compatMissing:p.validateProductPayload('compatibility',{features:['compatibility','second-person','monthly-detail'],months:18,secondPersonPresent:false,concernCount:0}),
      compatPresent:p.validateProductPayload('compatibility',{features:['compatibility','second-person','monthly-detail'],months:18,secondPersonPresent:true,concernCount:0}),
      bundleLeak:p.validateProductPayload('concern_bundle3',{features:['additional-concerns','full-five-year'],months:18,concernCount:3}),
      fullLeak:p.validateProductPayload('full_saju',{features:['full-five-year','compatibility'],months:18,secondPersonPresent:true,concernCount:0}),
      allLeak:p.validateProductPayload('all_in_one',{features:['all-six-concerns','compatibility'],months:18,secondPersonPresent:true,concernCount:6}),
      basicFiltered:(()=>{
        const d=calculateAccurateManse(1998,2,21,'03:10','female');
        d.__testNowYmd='2026-09-20'; d.concernKey='career'; d.concernSituation='current';
        generateConcernNotes(d,'F');
        const f=p.filterTimingForProduct('basic_concern',d.classicalReasoningV1.timing);
        return {hasFull:!!f.fullSajuTimeline,hasNear:!!f.concernNearTerm,pivots:f.longTermPivots.length};
      })(),
    };
  });

  assert(policy.basicFull===false,'basic_concern centrally allows full-five-year');
  assert(policy.bundleFull===false,'concern_bundle3 centrally allows full-five-year');
  assert(policy.fullCompat===false,'full_saju centrally allows compatibility');
  assert(policy.allCompat===false,'all_in_one centrally allows compatibility');
  assert(!policy.compatMissing.ok&&policy.compatMissing.errors.includes('second-person-required'),'compatibility did not enforce second person');
  assert(policy.compatPresent.ok,'compatibility blocked with valid second person '+JSON.stringify(policy.compatPresent));
  assert(!policy.bundleLeak.ok&&policy.bundleLeak.deniedFeatures.includes('full-five-year'),'bundle gate failed to block full-five-year');
  assert(!policy.fullLeak.ok&&policy.fullLeak.deniedFeatures.includes('compatibility'),'full_saju gate failed to block compatibility');
  assert(!policy.allLeak.ok&&policy.allLeak.deniedFeatures.includes('compatibility'),'all_in_one gate failed to block compatibility');
  assert(!policy.basicFiltered.hasFull&&policy.basicFiltered.hasNear&&policy.basicFiltered.pivots<=2,'basic timing filter leaked full timeline');

  const render=await page.evaluate(()=>{
    const product=globalThis.__UNNI_PRODUCTS_V1__;
    const d=calculateAccurateManse(1998,2,21,'03:10','female');
    d.__testNowYmd='2026-09-20'; d.concernKey='money'; d.concernSituation='saving'; d.currentMode='F';
    generateConcernNotes(d,'F');
    const dom=(html)=>{const root=document.createElement('div');root.innerHTML=html;return root;};
    const bundle=dom(product.buildProductBody('concern_bundle3',d,{concerns:['career','love','mental'],situations:{career:'current',love:'relationship',mental:'burnout'},fullSajuTimeline:{leak:true}}));
    const full=dom(product.buildProductBody('full_saju',d,{partner:{b:'19990511',c:'solar',l:false}}));
    const all=dom(product.buildProductBody('all_in_one',d,{partner:{b:'19990511',c:'solar',l:false},situations:{money:'saving',career:'current',love:'relationship',path:'current',people:'friend',mental:'burnout'}}));
    const blocked=dom(product.buildProductBody('compatibility',d,{}));
    const compat=dom(product.buildProductBody('compatibility',d,{partner:{n:'상대',b:'19990511',t:'12:00',g:'female',c:'solar',l:false}}));
    return {
      bundle:{full:bundle.querySelectorAll('[data-export-kind="full"]').length,blocked:!!bundle.querySelector('[data-policy-blocked]')},
      full:{compat:full.querySelectorAll('[data-export-compat-timing]').length,blocked:!!full.querySelector('[data-policy-blocked]')},
      all:{compat:all.querySelectorAll('[data-export-compat-timing]').length,compatExclusive:all.querySelectorAll('[data-product-exclusive="compatibility"]').length,blocked:!!all.querySelector('[data-policy-blocked]')},
      blockedCompat:{blocked:!!blocked.querySelector('[data-content-blocked="compatibility"]'),policy:!!blocked.querySelector('[data-policy-blocked]')},
      compat:{sections:compat.querySelectorAll('[data-export-kind="compat"]').length,blocked:!!compat.querySelector('[data-policy-blocked]')},
    };
  });

  assert(render.bundle.full===0&&!render.bundle.blocked,'bundle render leaked/blocked unexpectedly '+JSON.stringify(render.bundle));
  assert(render.full.compat===0&&!render.full.blocked,'full_saju compatibility leak '+JSON.stringify(render.full));
  assert(render.all.compat===0&&render.all.compatExclusive===0&&!render.all.blocked,'all_in_one compatibility leak '+JSON.stringify(render.all));
  assert(render.blockedCompat.blocked&&render.blockedCompat.policy,'compatibility without second person was not blocked by central policy');
  assert(render.compat.sections===16&&!render.compat.blocked,'compatibility with second person did not render');

  const lunar=await page.evaluate(()=>{
    const regular=koreanLunarToSolar(2020,4,1,false);
    const leap=koreanLunarToSolar(2020,4,1,true);
    const product=globalThis.__UNNI_PRODUCTS_V1__;
    const d=calculateAccurateManse(1998,2,21,'03:10','female');
    d.__testNowYmd='2026-09-20';d.concernKey='love';d.concernSituation='relationship';d.currentMode='F';
    generateConcernNotes(d,'F');
    const getFp=(isLeap,time)=>{
      const html=product.buildProductBody('compatibility',d,{partner:{n:'상대',b:'20200401',t:time,g:'female',c:'lunar',l:isLeap}});
      const root=document.createElement('div');root.innerHTML=html;
      return {
        blocked:!!root.querySelector('[data-content-blocked]'),
        bFp:root.querySelector('[data-export-intro="compat"]')?.getAttribute('data-person-b-fingerprint')||'',
      };
    };
    return {regular,leap,regularUnknown:getFp(false,'unknown'),leapUnknown:getFp(true,'unknown'),leapTimed:getFp(true,'15:20')};
  });

  const regularDate=[lunar.regular.year,lunar.regular.month,lunar.regular.day].join('-');
  const leapDate=[lunar.leap.year,lunar.leap.month,lunar.leap.day].join('-');
  assert(regularDate!==leapDate,'regular lunar and leap lunar converted to same solar date '+regularDate);
  assert(lunar.regularUnknown.bFp&&lunar.leapUnknown.bFp&&lunar.regularUnknown.bFp!==lunar.leapUnknown.bFp,'partnerChart ignored leap flag '+JSON.stringify(lunar));
  assert(!lunar.leapUnknown.blocked&&!lunar.leapTimed.blocked&&lunar.leapTimed.bFp,'unknown/timed compatibility fixture failed');

  await page.evaluate(()=>{
    const d=calculateAccurateManse(1998,2,21,'03:10','female');
    d.__testNowYmd='2026-09-20';d.concernKey='love';d.concernSituation='relationship';d.currentMode='F';
    generateConcernNotes(d,'F');
    currentResultData=d;
    selectedSplitMode='F';
  });
  await page.evaluate(()=>openUnniProduct('compatibility'));
  const leapWrap=page.locator('#partnerLeapWrap');
  assert(!(await leapWrap.isVisible()),'leap UI visible for solar calendar');
  await page.selectOption('#partnerCalendar','lunar');
  assert(await leapWrap.isVisible(),'leap UI did not appear for lunar calendar');
  await page.check('#partnerLeapMonth');
  await page.selectOption('#partnerCalendar','solar');
  assert(!(await leapWrap.isVisible()),'leap UI stayed visible for solar calendar');
  assert(!(await page.locator('#partnerLeapMonth').isChecked()),'leap checkbox was not cleared when switching to solar');
  await page.selectOption('#partnerCalendar','lunar');
  await page.check('#partnerLeapMonth');
  await page.fill('#partnerBirth','20200401');
  await page.check('#partnerTimeUnknown');
  await page.click('#unniProductAction');
  await page.waitForSelector('#unniProductBody [data-export-intro="compat"]',{timeout:10000});
  const uiLeapFp=await page.locator('#unniProductBody [data-export-intro="compat"]').getAttribute('data-person-b-fingerprint');
  assert(uiLeapFp===lunar.leapUnknown.bFp,'FREE_LAUNCH collectExtra did not preserve lunar leap selection');
  await page.click('#unniProductClose');

  await page.evaluate(()=>openUnniProduct('compatibility'));
  await page.fill('#partnerBirth','19990511');
  await page.selectOption('#partnerCalendar','solar');
  await page.selectOption('#partnerAmpm','pm');
  await page.selectOption('#partnerHour12','3');
  await page.selectOption('#partnerMinute','20');
  await page.click('#unniProductAction');
  await page.waitForSelector('#unniProductBody [data-export-intro="compat"]',{timeout:10000});
  assert(await page.locator('#unniProductBody [data-export-kind="compat"]').count()===16,'timed solar partner failed through UI');
  await page.click('#unniProductClose');

  const grant=await page.evaluate(async()=>{
    const restored=calculateAccurateManse(1998,2,21,'03:10','female');
    restored.__testNowYmd='2026-09-20';restored.concernKey='love';restored.concernSituation='relationship';restored.currentMode='F';
    generateConcernNotes(restored,'F');
    currentResultData=restored;
    const extra={partner:{n:'윤달상대',b:'20200401',t:'unknown',g:'female',c:'lunar',l:true}};
    const oldConfirm=confirmPaymentOnServer;
    const oldVerify=verifyAccessToken;
    confirmPaymentOnServer=async()=> 'test-grant-token';
    verifyAccessToken=async()=> 'valid';
    try{
      const params=new URLSearchParams('payment=success&paymentKey=pk_test&orderId=order_test&amount=5900');
      const resume={productId:'compatibility',orderId:'order_test',amount:5900,userKey:'grant-user',data:{x:extra}};
      await globalThis.handleUnniProductPaymentReturn(params,resume,restored,'ticket_test');
      const storedKeys=Object.keys(localStorage).filter(k=>k.startsWith('unni_product_grant_v1_compatibility_'));
      const stored=storedKeys.map(k=>JSON.parse(localStorage.getItem(k)||'null')).find(x=>x?.orderId==='order_test')||null;
      document.querySelector('#unniProductClose')?.click();
      await globalThis.openUnniProduct('compatibility');
      const action=document.querySelector('#unniProductAction');
      const reopenLabel=action?.textContent||'';
      action?.click();
      await new Promise(r=>setTimeout(r,30));
      const restoredFp=document.querySelector('#unniProductBody [data-export-intro="compat"]')?.getAttribute('data-person-b-fingerprint')||'';
      return {storedLeap:stored?.extra?.partner?.l,reopenLabel,restoredFp};
    } finally {
      confirmPaymentOnServer=oldConfirm;
      verifyAccessToken=oldVerify;
    }
  });
  assert(grant.storedLeap===true,'grant save dropped partner.l '+JSON.stringify(grant));
  assert(grant.reopenLabel.includes('구매한 리포트 다시 열기'),'grant restore path not offered '+JSON.stringify(grant));
  assert(grant.restoredFp===lunar.leapUnknown.bFp,'grant restore did not reuse leap-month partner extra '+JSON.stringify(grant));

  assert(errors.length===0,'browser errors: '+errors.join(' | '));

  console.log('TECH_DEBT_POLICY_LEAP_PASS',JSON.stringify({
    legacyRemoved:true,
    rolling:{current:runtime.timing,mocked2027,mocked2028},
    policy:{
      basicFull:policy.basicFull,bundleFull:policy.bundleFull,fullCompat:policy.fullCompat,allCompat:policy.allCompat,
      compatMissing:policy.compatMissing.errors,
    },
    lunar:{regularDate,leapDate,regularFp:lunar.regularUnknown.bFp,leapFp:lunar.leapUnknown.bFp,grant},
  }));
  await browser.close();
})().catch(err=>{console.error(err.stack||err);process.exit(1);});
