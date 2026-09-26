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
    globalThis.__CLASSICAL_REASONING_V1__?.version==='2.1.1' &&
    globalThis.__CONCERN_NOTE_ENGINE_V2__?.version==='6.6.0' &&
    globalThis.__UNNI_PRODUCT_CONTENT_POLICY_V1__?.version==='1.1.0' &&
    globalThis.__UNNI_PRODUCTS_V1__?.version==='2.3.1'
  ),null,{timeout:60000});

  const source=fs.readFileSync('index.html','utf8');
  assert(!source.includes('getTrueBaziTiming'),'legacy getTrueBaziTiming remains in index.html');
  assert(!source.includes('buildNoteSixTiming'),'legacy buildNoteSixTiming remains in index.html');
  assert(!source.includes('2026-2027'),'legacy 2026-2027 NOTE6 badge remains in index.html');
  assert(!/\by2026\b|\by2027\b/.test(source),'legacy y2026/y2027 timing keys remain in index.html');

  // Copy QA2: user-facing text must preserve the selected situation and must not
  // present raw five-element counts or editorial action units as calculated facts.
  const noteSource=fs.readFileSync('concern-note-engine-v2.js','utf8');
  const productSource=fs.readFileSync('premium-products-v1.js','utf8');
  const sneakStart=source.indexOf('const sazuSneakPeek = {');
  const sneakEnd=source.indexOf('const targetMsgObj',sneakStart);
  const rawResultStart=source.indexOf('const maxOheng =');
  const rawResultEnd=source.indexOf('function renderResultView',rawResultStart);
  const rawCountCopy=source.slice(sneakStart,sneakEnd)+source.slice(rawResultStart,rawResultEnd);
  assert(sneakStart>=0&&sneakEnd>sneakStart&&rawResultStart>=0&&rawResultEnd>rawResultStart,'raw-count copy blocks not found');
  assert(!/(화가 강하네|수가 강하네|목이 강하네|금이 강하네|토가 강하네|제일 강해|약한 편)/.test(rawCountCopy),'raw five-element count is still described as actual strength');
  assert(/겉으로|비중/.test(rawCountCopy),'raw five-element copy no longer explains visible count/share');
  assert(!noteSource.includes('${situation.object}이')&&!noteSource.includes('${situation.object}을'),'fixed Korean particles remain on dynamic situation.object');
  for(const bad of ['힘 이야','환경 이야','느냐 야','것 .','것 을','것 이','하기 만','해야 해 언니','맞아 쉽게 풀면']){
    assert(!noteSource.includes(bad),'forbidden Korean join remains in NOTE source: '+bad);
  }
  assert(!noteSource.includes('replace(/<[^>]+>/g," ")'),'stripHtml must not create spaces at inline tag boundaries');
  assert(noteSource.includes('function hasBatchim(value)')&&noteSource.includes('function withJosa(value, withBatchim, withoutBatchim)'),'Korean josa helper missing');
  assert(!noteSource.includes('손실과 과로를 먼저 줄여'),'generic timing caution copy remains');
  assert(!noteSource.includes('평소보다 20% 이상'),'unsupported 20% threshold remains in NOTE copy');
  assert(!noteSource.includes('서운함 하나를 24시간'),'unsupported 24-hour relationship threshold remains in NOTE copy');
  assert(!productSource.includes('서운함은 24시간 안에'),'unsupported 24-hour compatibility threshold remains');
  assert(!productSource.includes('같은 싸움이 세 번 반복되면'),'unsupported three-fights compatibility threshold remains');
  assert(!productSource.includes('표현 강도는 맞기 쉽다')&&!productSource.includes('마음을 쓰는 속도가 비슷해서'),'sameStrength still overclaims affection expression');
  assert(!productSource.includes('서로의 강점을 빠르게 이해하는 조합')&&!productSource.includes('시간이 지나면 서로 왜 그렇게 행동하는지 더 빨리'),'strong-element match still overclaims relationship behavior');
  assert(!productSource.includes('연애 감정보다 생활 규칙에서 갈등이 오래 간다'),'fixed compatibility conflict claim remains');
  assert(!productSource.includes('classical reasoning'),'internal classical reasoning phrase leaked to product copy');
  assert(!productSource.includes('같은 원판')&&!productSource.includes('사주 원판'),'internal plate metaphor remains in product copy');
  assert(!productSource.includes('다음 정보 가치')&&!productSource.includes('1인 분석 대표'),'internal product-planning language remains');
  assert(!source.includes('왜 돈이 안 모이는지는 보였어')&&!source.includes('취업이 막히는 이유는 보여')&&!source.includes('현재 직장의 답답한 핵심은 보여'),'paywall still claims locked analysis was already shown');
  assert(source.includes('TODO(legal/privacy audit)'),'separate legal/privacy TODO missing');

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
      timingBadge:notes[4]?.badge||'',
      timingText:String(notes[4]?.desc||'').replace(/<[^>]+>/g,' '),
      meta:notes[4]?.__timingQA||{},
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
  assert(runtime.wrapped&&runtime.audit?.engine==='classical-causal-full-evidence','runtime NOTE path is not classical concern-note engine');
  assert(!runtime.timingBadge.includes('2026-2027')&&!runtime.timingText.includes('2026-2027'),'legacy fixed-year timing badge/text generated');
  assert(runtime.meta.disclosureContract==='basic_concern'&&runtime.meta.fullFiveYearAllowed===false,'basic timing disclosure policy not enforced '+JSON.stringify(runtime.meta));
  assert(runtime.timing.nearCount>=17&&runtime.timing.publicYears.length>=5&&runtime.timing.internalYears.length>=10,'rolling timing coverage missing '+JSON.stringify(runtime.timing));


  const copyQa=await page.evaluate(()=>{
    const ui=globalThis.__CONCERN_SITUATIONS__||{};
    const engine=globalThis.__CONCERN_NOTE_ENGINE_V2__?.situations||{};
    const failures=[];
    let routeCount=0;
    let answerChecks=0;
    const signatures=new Set();
    const plain=(v)=>String(v||'').replace(/<br\s*\/?\s*>/gi,' ').replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim();
    const forbidden=/(비밀\s*메모|실전 룰|반복 패턴|압박|구조|원국|격국|용신|상신|기신|통관|월령|지장간|신강|신약)/;
    const badJoins=[
      /[가-힣]\s+(?:이야|야)(?=[.!?]|$)/,
      /느냐\s+야\b/,
      /것\s+\./,
      /것\s+(?:이|가|을|를)\b/,
      /하기\s+만\b/,
      /\s+[.!?]/,
    ];
    for(const [concern,config] of Object.entries(ui)){
      for(const option of (config?.options||[])){
        const [key,label]=option;
        routeCount+=1;
        const engineRow=engine?.[concern]?.[key];
        if(!engineRow){ failures.push(concern+'/'+key+': engine situation missing'); continue; }
        if(engineRow.label!==label) failures.push(concern+'/'+key+': label parity drift');
        for(const mode of ['F','T']){
          const d=calculateAccurateManse(1998,2,21,'03:10','female');
          d.__testNowYmd='2026-09-20';
          d.concernKey=concern; d.concernSituation=key; d.currentMode=mode;
          const notes=generateConcernNotes(d,mode);
          if(notes.length!==6) failures.push(concern+'/'+key+'/'+mode+': answer count '+notes.length);
          if(notes.map(n=>n.badge).join('|')!=='핵심|질문에 대한 답|왜 그런지|어떻게 할지|가까운 흐름|조심할 것') failures.push(concern+'/'+key+'/'+mode+': answer roles drift');
          if(!plain(notes[0]?.desc).includes(label)||!/[가-힣]{2}일주/.test(String(notes[0]?.title||''))) failures.push(concern+'/'+key+'/'+mode+': first answer lost day-pillar title or selected label');
          const visible=notes.map(n=>plain([n?.badge,n?.title,n?.desc,n?.checklist].join(' '))).join(' ');
          if(/\bundefined\b|\bnull\b|NaN/.test(visible)) failures.push(concern+'/'+key+'/'+mode+': undefined/null leaked');
          if(/20%|24시간|세 번/.test(visible)) failures.push(concern+'/'+key+'/'+mode+': unsupported precision leaked');
          if(forbidden.test(visible)) failures.push(concern+'/'+key+'/'+mode+': old/abstract wording leaked');
          notes.forEach((note,i)=>{
            const text=plain(note?.desc);
            if(text.length<110||text.length>1600) failures.push(concern+'/'+key+'/'+mode+': answer '+(i+1)+' length '+text.length);
            if(!text.includes('결론')) failures.push(concern+'/'+key+'/'+mode+': answer '+(i+1)+' missing conclusion');
            for(const pattern of badJoins){ if(pattern.test(text)) failures.push(concern+'/'+key+'/'+mode+': Korean join error '+text); pattern.lastIndex=0; }
            answerChecks+=1;
          });
          const coverage=d.noteV3Audit?.evidenceCoverage;
          if(coverage?.coverageRate!==1 || coverage?.missingRuleIds?.length) failures.push(concern+'/'+key+'/'+mode+': supported evidence dropped '+JSON.stringify(coverage));
          const links=d.noteV3Audit?.outputClaimMap||[];
          if(links.length!==6) failures.push(concern+'/'+key+'/'+mode+': output claim plan missing');
          for(const link of links){
            const note=notes[link.noteNum-1];
            if(!link.claimId || note?.__claim?.id!==link.claimId) failures.push(concern+'/'+key+'/'+mode+': claim-first binding '+link.noteNum);
          }
          if(
            d.noteV3Audit?.behaviorTemplateDependency!==true ||
            d.noteV3Audit?.behaviorTemplateEvidenceDependency!==false ||
            d.noteV3Audit?.behaviorTemplateRole!=='claim-bounded-domain-translation'
          ) failures.push(concern+'/'+key+'/'+mode+': behavior template audit drift');
          signatures.add(concern+'/'+key+'/'+mode+'|'+plain(notes[0]?.desc)+'|'+plain(notes[1]?.desc));
        }
        const f={...calculateAccurateManse(1998,2,21,'03:10','female'),concernKey:concern,concernSituation:key,currentMode:'F',__testNowYmd:'2026-09-20'};
        const t={...calculateAccurateManse(1998,2,21,'03:10','female'),concernKey:concern,concernSituation:key,currentMode:'T',__testNowYmd:'2026-09-20'};
        generateConcernNotes(f,'F'); generateConcernNotes(t,'T');
        if(f.noteV3Audit?.structureFingerprint!==t.noteV3Audit?.structureFingerprint||f.noteV3Audit?.timingFingerprint!==t.noteV3Audit?.timingFingerprint) failures.push(concern+'/'+key+': F/T factual fingerprint drift');
      }
    }
    return {routeCount,answerChecks,signatureCount:signatures.size,concernKeys:Object.keys(ui),failures};
  });
  assert(copyQa.routeCount===24,'expected all 24 current concern/situation routes, got '+copyQa.routeCount);
  assert(copyQa.answerChecks===24*2*6,'expected 24 situations × F/T × six answers, got '+copyQa.answerChecks);
  assert(copyQa.signatureCount===48,'all 24 paths × F/T should keep distinct rendered signatures');
  assert(copyQa.failures.length===0,'six-answer route regression: '+copyQa.failures.join(' | '));


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
          timingMeta:notes[4]?.__timingQA||{},
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
    assert(row.timingMeta.detailEnd===row.detailEnd&&row.timingMeta.horizonEnd===row.horizonEnd,'timing answer did not consume same rolling timing '+JSON.stringify(row));
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
    // This block validates the paid compatibility checkout payload itself.
    // Force paid mode locally so the repository's launch-mode toggle cannot bypass the payment UI.
    FREE_LAUNCH_MODE=false;

    const originalPaymentAPI=paymentAPI;
    globalThis.__techDebtPreparePayload=null;
    paymentAPI=async(body)=>{
      if(body?.action==='entitlements'){
        return {
          ok:true,
          verifiedPurchases:[],
          effectiveEntitlements:[],
          allInOneQuote:{
            targetProduct:'all_in_one',baseAmount:100,creditAmount:0,amount:100,
            alreadyOwned:false,creditedProducts:[],
          },
        };
      }
      if(body?.action==='prepare'){
        globalThis.__techDebtPreparePayload=body;
        return {
          ok:true,
          productId:body?.data?.p,
          orderId:'tech-debt-compat-order',
          ticket:'tech-debt-compat-ticket',
          userKey:getUserUniqueKey(currentResultData),
          amount:100,
          baseAmount:100,
        };
      }
      return originalPaymentAPI(body);
    };
    const fakePaymentWidget=()=>({
      renderPaymentMethods(){ return {}; },
      renderAgreement(){ return { getAgreementStatus:()=>({agreedRequiredTerms:true}) }; },
      requestPayment:async()=>{},
    });
    fakePaymentWidget.ANONYMOUS='ANONYMOUS';
    globalThis.PaymentWidget=fakePaymentWidget;
  });

  await page.evaluate(()=>openUnniProduct('compatibility'));
  await page.waitForFunction(()=>document.querySelector('#unniProductAction')?.textContent?.includes('우리 둘 궁합 보기'),null,{timeout:10000});
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
  assert((await page.locator('#partnerTimeBranch').inputValue())==='unknown','compatibility unknown-time default should stay selected');
  assert(await page.locator('#partnerTimeDirectToggle').count()===0,'removed compatibility direct-time toggle returned');
  assert(await page.locator('#partnerTimeInput').count()===0,'removed compatibility direct-time input returned');
  await page.click('#unniProductAction');
  await page.waitForSelector('#unniProductPayment',{state:'visible',timeout:10000});
  const uiLeap=await page.evaluate(()=>{
    const extra=globalThis.__techDebtPreparePayload?.data?.x;
    const html=globalThis.__UNNI_PRODUCTS_V1__.buildProductBody('compatibility',currentResultData,extra);
    const root=document.createElement('div');root.innerHTML=html;
    return {
      leap:extra?.partner?.l,
      bFp:root.querySelector('[data-export-intro="compat"]')?.getAttribute('data-person-b-fingerprint')||'',
    };
  });
  assert(uiLeap.leap===true&&uiLeap.bFp===lunar.leapUnknown.bFp,'paid-mode collectExtra did not preserve lunar leap selection '+JSON.stringify(uiLeap));
  await page.click('#unniProductClose');

  await page.evaluate(()=>{ globalThis.__techDebtPreparePayload=null; openUnniProduct('compatibility'); });
  await page.waitForFunction(()=>document.querySelector('#unniProductAction')?.textContent?.includes('우리 둘 궁합 보기'),null,{timeout:10000});
  await page.fill('#partnerBirth','19990511');
  await page.selectOption('#partnerCalendar','solar');
  await page.selectOption('#partnerTimeBranch','未');
  await page.click('#unniProductAction');
  await page.waitForSelector('#unniProductPayment',{state:'visible',timeout:10000});
  const uiTimed=await page.evaluate(()=>{
    const extra=globalThis.__techDebtPreparePayload?.data?.x;
    const html=globalThis.__UNNI_PRODUCTS_V1__.buildProductBody('compatibility',currentResultData,extra);
    const root=document.createElement('div');root.innerHTML=html;
    return {
      partner:extra?.partner||null,
      sections:root.querySelectorAll('[data-export-kind="compat"]').length,
    };
  });
  assert(uiTimed.partner?.t==='未'&&uiTimed.sections===16,'branch-time solar partner failed through paid-mode UI '+JSON.stringify(uiTimed));
  await page.click('#unniProductClose');

  const grant=await page.evaluate(async()=>{
    const restored=calculateAccurateManse(1998,2,21,'03:10','female');
    restored.__testNowYmd='2026-09-20';restored.concernKey='love';restored.concernSituation='relationship';restored.currentMode='F';
    restored.name='테스트';
    restored.userName='테스트';
    restored.userBirthStr='19980221';
    restored.userTimeKey='03:10';
    restored.userGender='female';
    restored.userCalendar='solar';
    restored.isLeapMonth=false;
    generateConcernNotes(restored,'F');
    currentResultData=restored;
    const extraA={partner:{n:'윤달상대',b:'20200401',t:'unknown',g:'female',c:'lunar',l:true}};
    const extraB={partner:{n:'다른상대',b:'20010101',t:'unknown',g:'male',c:'solar',l:false}};
    const baseUserKey='sazu_v2_'+JSON.stringify(['테스트','19980221','03:10','female','solar',false,'love']);
    const userKeyA=baseUserKey+'::compatibility::'+JSON.stringify(extraA);
    const userKeyB=baseUserKey+'::compatibility::'+JSON.stringify(extraB);
    const oldConfirm=confirmPaymentOnServer;
    const oldVerify=verifyAccessToken;
    const oldPaymentAPI=paymentAPI;
    confirmPaymentOnServer=async(paymentKey,orderId,amount,userKey)=> userKey===userKeyB ? 'test-grant-token-b' : 'test-grant-token-a';
    verifyAccessToken=async()=> 'valid';
    try{
      await globalThis.handleUnniProductPaymentReturn(
        new URLSearchParams('payment=success&paymentKey=pk_a&orderId=order_a&amount=100'),
        {productId:'compatibility',orderId:'order_a',amount:100,userKey:userKeyA,data:{x:extraA}},
        restored,'ticket_a'
      );
      document.querySelector('#unniProductClose')?.click();
      await new Promise(r=>setTimeout(r,5));
      await globalThis.handleUnniProductPaymentReturn(
        new URLSearchParams('payment=success&paymentKey=pk_b&orderId=order_b&amount=100'),
        {productId:'compatibility',orderId:'order_b',amount:100,userKey:userKeyB,data:{x:extraB}},
        restored,'ticket_b'
      );
      document.querySelector('#unniProductClose')?.click();

      paymentAPI=async(body)=>{
        if(body?.action==='entitlements') return {
          ok:true,
          verifiedPurchases:[
            {productId:'compatibility',userKey:userKeyA},
            {productId:'compatibility',userKey:userKeyB},
          ],
          effectiveEntitlements:['compatibility'],
          allInOneQuote:{targetProduct:'all_in_one',baseAmount:100,creditAmount:0,amount:100,alreadyOwned:false,creditedProducts:[]},
        };
        if(body?.action==='prepare') {
          globalThis.__techDebtPreparePayload=body;
          return {ok:true,productId:'compatibility',baseAmount:100,amount:100,orderId:'order_new_pair',ticket:'ticket_new_pair',userKey:'new_pair_user'};
        }
        return oldPaymentAPI(body);
      };
      globalThis.__UNNI_PRODUCTS_V1__.invalidateEntitlementCache();
      await globalThis.openUnniProduct('compatibility');
      const listCount=document.querySelectorAll('[data-compat-reopen]').length;
      const listText=document.querySelector('#unniCompatibilityPurchases')?.innerText||'';
      const newPairButton=document.querySelector('#unniCompatibilityNewPair');
      const reopenLabel=document.querySelector('#unniProductAction')?.textContent||'';
      document.querySelector('[data-compat-reopen="0"]')?.click();
      await new Promise(r=>setTimeout(r,30));
      const latestFp=document.querySelector('#unniProductBody [data-export-intro="compat"]')?.getAttribute('data-person-b-fingerprint')||'';
      document.querySelector('#unniProductClose')?.click();
      await globalThis.openUnniProduct('compatibility');
      document.querySelector('#unniCompatibilityNewPair')?.click();
      await new Promise(r=>setTimeout(r,30));
      const newPairMode={
        birth:document.querySelector('#partnerBirth')?.value||'',
        action:document.querySelector('#unniProductAction')?.textContent||'',
        price:document.querySelector('#unniProductPrice')?.textContent||'',
      };
      const storedKeys=Object.keys(localStorage).filter(k=>k.startsWith('unni_product_grant_v1_compatibility_'));
      const stored=storedKeys.map(k=>JSON.parse(localStorage.getItem(k)||'null')).filter(x=>x?.userKey===userKeyA||x?.userKey===userKeyB);
      return {listCount,listText,reopenLabel,latestFp,newPairMode,storedCount:stored.length,storedLeap:stored.find(x=>x?.userKey===userKeyA)?.extra?.partner?.l};
    } finally {
      confirmPaymentOnServer=oldConfirm;
      verifyAccessToken=oldVerify;
      paymentAPI=oldPaymentAPI;
      globalThis.__UNNI_PRODUCTS_V1__.invalidateEntitlementCache();
    }
  });
  assert(grant.storedCount===2,'multiple compatibility grants were overwritten '+JSON.stringify(grant));
  assert(grant.storedLeap===true,'grant save dropped partner.l '+JSON.stringify(grant));
  assert(grant.listCount===2&&grant.listText.includes('윤달상대')&&grant.listText.includes('다른상대'),'purchased compatibility list missing '+JSON.stringify(grant));
  assert(grant.reopenLabel.includes('구매한 궁합')&&grant.reopenLabel.includes('다시 보기'),'grant restore path not offered '+JSON.stringify(grant));
  assert(grant.latestFp,'compatibility saved report did not reopen '+JSON.stringify(grant));
  assert(grant.newPairMode.birth===''&&grant.newPairMode.action.includes('우리 둘 궁합 보기')&&grant.newPairMode.price.includes('100원'),'new compatibility partner checkout mode did not reset '+JSON.stringify(grant));

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
