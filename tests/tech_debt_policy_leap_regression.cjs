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
    globalThis.__UNNI_PRODUCTS_V1__?.version==='2.1.1'
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
  assert(!noteSource.includes('손실과 과로를 먼저 줄여'),'generic NOTE6 caution copy remains');
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


  const copyQa=await page.evaluate(()=>{
    const ui=globalThis.__CONCERN_SITUATIONS__||{};
    const engine=globalThis.__CONCERN_NOTE_ENGINE_V2__?.situations||{};
    const routes=[];
    const failures=[];
    let josaChecks=0;
    let noteSurfaceChecks=0;
    const forbiddenJoinPatterns=[
      ['명사+이야/야 공백',/[가-힣]\s+(?:이야|야)(?=[.!?]|$)/],
      ['느냐 야',/느냐\s+야\b/],
      ['것 마침표 공백',/것\s+\./],
      ['것+조사 공백',/것\s+(?:이|가|을|를)\b/],
      ['하기 만',/하기\s+만\b/],
      ['해야 해 언니',/해야 해\s+언니/],
      ['맞아 쉽게 풀면',/맞아\s+쉽게 풀면/],
      ['마침표 앞 공백',/\s+[.!?]/],
      ['문장 경계 누락',/(?:해야 해|맞아|중요해|좋아|쉬워|커져|보여|않아|돼|있어|없어)\s+(?:언니가|쉽게 풀면|그래서|그리고|그다음)\b/],
      ['모음 명사+을',/(?:연애|진로|관계)을 볼 때/],
    ];
    const visibleText=(html)=>{
      const el=document.createElement('div');
      el.innerHTML=String(html||'');
      return String(el.innerText||el.textContent||'').replace(/\s+/g,' ').trim();
    };
    const hasBatchim=(value)=>{
      const chars=Array.from(String(value||'').trim());
      for(let i=chars.length-1;i>=0;i-=1){
        const code=chars[i].charCodeAt(0);
        if(code>=0xAC00&&code<=0xD7A3) return (code-0xAC00)%28!==0;
      }
      return false;
    };
    const withJosa=(value,withBatchim,withoutBatchim)=>String(value||'')+(hasBatchim(value)?withBatchim:withoutBatchim);
    const claimCore=(claims)=>(claims||[]).map((claim)=>{
      const copy={...claim};
      delete copy.noteSentence;
      return copy;
    });
    const renderRoute=(concern,key,mode)=>{
      const d=calculateAccurateManse(1998,2,21,'03:10','female');
      d.__testNowYmd='2026-09-20';
      d.concernKey=concern;
      d.concernSituation=key;
      d.currentMode=mode;
      const notes=generateConcernNotes(d,mode);
      return {
        notes,
        label:d.noteDiagnosisV2?.situation?.label||'',
        situationKey:d.noteDiagnosisV2?.situation?.key||'',
        structureFingerprint:d.noteV3Audit?.structureFingerprint||'',
        timingFingerprint:d.noteV3Audit?.timingFingerprint||'',
        claims:claimCore(d.noteV3Audit?.claims),
        claimSentences:(d.noteV3Audit?.claims||[]).map((claim)=>String(claim?.noteSentence||'')),
      };
    };
    for(const [concern,config] of Object.entries(ui)){
      for(const option of (config?.options||[])){
        const [key,label]=option;
        routes.push({concern,key,label});
        const engineRow=engine?.[concern]?.[key];
        if(!engineRow) {
          failures.push(concern+'/'+key+': engine situation missing');
          continue;
        }
        if(engineRow.label!==label) failures.push(concern+'/'+key+': label parity '+JSON.stringify({ui:label,engine:engineRow.label}));
        const f=renderRoute(concern,key,'F');
        const t=renderRoute(concern,key,'T');
        const subjectGood=withJosa(engineRow.object,'이','가');
        const subjectBad=withJosa(engineRow.object,'가','이');
        const objectGood=withJosa(engineRow.object,'을','를');
        const objectBad=withJosa(engineRow.object,'를','을');
        const pressureText=String(f.notes?.[1]?.desc||'');
        const causeText=String(f.notes?.[2]?.desc||'');
        const neutralCurrentRelationship = concern==='love' && key==='relationship';
        if (neutralCurrentRelationship) {
          if(!pressureText.includes(engineRow.object+'에서 반복되는 장면보다') ||
             pressureText.includes(subjectGood+' 꼬인') ||
             pressureText.includes(subjectBad+' 꼬인')) {
            failures.push(concern+'/'+key+': 현재 연애 중립 문구 오류 '+JSON.stringify({object:engineRow.object,text:pressureText}));
          } else {
            josaChecks+=1;
          }
        } else if(!pressureText.includes(subjectGood+' 꼬인')||pressureText.includes(subjectBad+' 꼬인')) {
          failures.push(concern+'/'+key+': 이/가 조사 오류 '+JSON.stringify({object:engineRow.object,expected:subjectGood,bad:subjectBad,text:pressureText}));
        } else {
          josaChecks+=1;
        }
        if(!causeText.includes(objectGood+' 볼 때')||causeText.includes(objectBad+' 볼 때')) {
          failures.push(concern+'/'+key+': 을/를 조사 오류 '+JSON.stringify({object:engineRow.object,expected:objectGood,bad:objectBad,text:causeText}));
        } else {
          josaChecks+=1;
        }
        for(const [mode,row] of [['F',f],['T',t]]){
          if(row.situationKey!==key||row.label!==label) failures.push(concern+'/'+key+'/'+mode+': selected situation changed '+JSON.stringify({key:row.situationKey,label:row.label}));
          if(row.notes.length!==6) failures.push(concern+'/'+key+'/'+mode+': note count '+row.notes.length);
          if(!String(row.notes[0]?.title||'').includes(label)) failures.push(concern+'/'+key+'/'+mode+': NOTE1 title lost selected label');
          const visible=row.notes.map(n=>[n?.badge,n?.title,n?.desc,n?.checklist].join(' ')).join(' ');
          if(/\bundefined\b|\bnull\b/.test(visible)) failures.push(concern+'/'+key+'/'+mode+': undefined/null leaked');
          if(/20%|24시간|세 번/.test(visible)) failures.push(concern+'/'+key+'/'+mode+': unsupported precision leaked');
          row.notes.forEach((note,noteIndex)=>{
            const finalText=[String(note?.title||''),visibleText(note?.desc),String(note?.checklist||'')].join(' ').replace(/\s+/g,' ').trim();
            const auditText=String(row.claimSentences?.[noteIndex]||'').replace(/\s+/g,' ').trim();
            for(const [patternName,pattern] of forbiddenJoinPatterns){
              if(pattern.test(finalText)) failures.push(concern+'/'+key+'/'+mode+'/NOTE'+(noteIndex+1)+': runtime '+patternName+' => '+finalText);
              pattern.lastIndex=0;
              if(pattern.test(auditText)) failures.push(concern+'/'+key+'/'+mode+'/NOTE'+(noteIndex+1)+': claim sentence '+patternName+' => '+auditText);
              pattern.lastIndex=0;
            }
            noteSurfaceChecks+=1;
          });
        }
        if(f.structureFingerprint!==t.structureFingerprint||f.timingFingerprint!==t.timingFingerprint) {
          failures.push(concern+'/'+key+': F/T factual fingerprint drift');
        }
        if(JSON.stringify(f.claims)!==JSON.stringify(t.claims)) failures.push(concern+'/'+key+': F/T claim core drift');
      }
    }
    return {routeCount:routes.length,josaChecks,noteSurfaceChecks,concernKeys:Object.keys(ui),failures};
  });
  assert(copyQa.routeCount===24,'expected all 24 current concern/situation routes, got '+copyQa.routeCount);
  assert(copyQa.josaChecks===copyQa.routeCount*2,'dynamic 이/가·을/를 checks incomplete '+JSON.stringify(copyQa));
  assert(copyQa.noteSurfaceChecks===24*2*6,'expected 24 situations × F/T × NOTE1~6 runtime sentence checks, got '+copyQa.noteSurfaceChecks);
  assert(copyQa.failures.length===0,'copy QA2 route regression: '+copyQa.failures.join(' | '));
  const cautionStart=noteSource.indexOf('const cautionAction = ({');
  const cautionEnd=noteSource.indexOf('})[situation.concern]',cautionStart);
  const cautionBlock=noteSource.slice(cautionStart,cautionEnd);
  assert(cautionStart>=0&&cautionEnd>cautionStart,'NOTE6 concern caution map missing');
  for(const concern of copyQa.concernKeys){
    assert(new RegExp('\\b'+concern+':').test(cautionBlock),'NOTE6 caution language missing for current concern '+concern);
  }

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
  assert(grant.reopenLabel.includes('구매한')&&grant.reopenLabel.includes('다시 보기'),'grant restore path not offered '+JSON.stringify(grant));
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
