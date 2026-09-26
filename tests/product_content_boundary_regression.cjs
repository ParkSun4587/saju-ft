const { chromium } = require('playwright');
const fs = require('fs');

function assert(cond,msg){ if(!cond) throw new Error(msg); }
function plain(v){ return String(v||'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim(); }
function yearTokens(v){ return [...new Set((String(v||'').match(/20\d{2}년/g)||[]).map(x=>Number(x.slice(0,4))))]; }

(async()=>{
  const browser=await chromium.launch({headless:true});
  const page=await browser.newPage({viewport:{width:390,height:844}});
  const errors=[];
  page.on('pageerror',e=>errors.push('[pageerror] '+(e.stack||e.message)));
  page.on('console',m=>{ if(m.type()==='error') errors.push('[console] '+m.text()); });
  await page.goto('http://127.0.0.1:4173/index.html',{waitUntil:'load',timeout:60000});
  await page.waitForFunction(()=>(
    globalThis.__CLASSICAL_REASONING_V1__?.version==='2.1.1' &&
    globalThis.__CONCERN_NOTE_ENGINE_V2__?.version==='6.7.0' &&
    globalThis.__UNNI_PRODUCT_CONTENT_POLICY_V1__?.version==='1.2.0' &&
    globalThis.__UNNI_PRODUCTS_V1__?.version==='2.3.1'
  ),null,{timeout:60000});

  const r=await page.evaluate(()=>{
    const plain=v=>String(v||'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
    const charts=[
      {id:'canonical',args:[1998,2,21,'03:10','female'],concern:'money',situation:'saving'},
      {id:'career-strong',args:[1990,1,2,'12:00','female'],concern:'career',situation:'move'},
      {id:'love',args:[1994,7,18,'21:20','female'],concern:'love',situation:'relationship'},
      {id:'path',args:[2001,11,9,'08:45','male'],concern:'path',situation:'switch'},
      {id:'people',args:[1987,4,26,'15:10','female'],concern:'people',situation:'work'},
    ];
    const runs=[];
    for(const c of charts){
      const d=calculateAccurateManse(...c.args);
      d.__testNowYmd='2026-09-20';
      d.concernKey=c.concern; d.concernSituation=c.situation; d.currentMode='F';
      const notes=generateConcernNotes(d,'F');
      const rr=d.classicalReasoningV1;
      runs.push({
        id:c.id,concern:c.concern,situation:c.situation,data:d,notes,
        structureFingerprint:rr.structureFingerprint,timingFingerprint:rr.timingFingerprint,
        claimConclusions:rr.claims.map(x=>x.conclusion),
        timing:rr.timing,
        timingAnswer:plain(notes[5]?.desc),
        timingMeta:notes[5]?.__timingQA||{},
      });
    }

    const canonical=runs[0];
    const baseData=canonical.data;
    const product=globalThis.__UNNI_PRODUCTS_V1__;
    const contracts=globalThis.__UNNI_PRODUCT_CONTENT_POLICY_V1__.contracts;

    const consultCards=[
      {badge:'네 질문의 답',title:'사업 선택에서 먼저 볼 기준',desc:'지금 질문에 대한 직접 답이야.'},
      {badge:'왜 이런 답인지',title:'같은 능력도 오래 가는 구조가 달라',desc:'계절과 뿌리, 십신의 실제 힘을 함께 본 이유야.'},
      {badge:'특히 조심할 것',title:'책임만 크고 결정권이 적으면 소모돼',desc:'감당력과 역할의 균형을 같이 봐야 해.'},
      {badge:'지금 할 일',title:'작은 실행으로 먼저 검증해',desc:'큰 결정을 한 번에 확정하지 않는 기준이야.'},
    ];
    const consultData={
      ...baseData,
      concernKey:'consultation',
      concernSituation:'free',
      userQuestion:'사업하려는데 AI 앱이랑 음식점 중 뭐가 더 맞고 언제 시작하는 게 좋아?',
      __consultationV1:{cards:consultCards},
    };
    const fullHtml=product.buildProductBody('full_saju',consultData,{});
    const bundleExtra={
      questions:[
        '지금 회사에 남는 게 나아, 옮기는 게 나아?',
        '올해 새로운 인연은 언제쯤 들어와?',
        '사업하면 어떤 방식이 나한테 맞아?',
      ],
    };
    const bundleHtml=product.buildProductBody('concern_bundle3',consultData,bundleExtra);
    const allHtml=product.buildProductBody('all_in_one',consultData,{});

    const compatBlocked=product.buildProductBody('compatibility',baseData,{});
    const compatExtra={partner:{n:'상대',b:'19990511',t:'12:00',g:'female',c:'solar',l:false}};
    const compatHtml=product.buildProductBody('compatibility',baseData,compatExtra);

    const dom=(html)=>{
      const root=document.createElement('div'); root.innerHTML=html; return root;
    };
    const fullRoot=dom(fullHtml),bundleRoot=dom(bundleHtml),allRoot=dom(allHtml),compatRoot=dom(compatHtml),blockedRoot=dom(compatBlocked);

    const fpAfter=baseData.classicalReasoningV1?.structureFingerprint;
    const claimsAfter=(baseData.classicalReasoningV1?.claims||[]).map(x=>x.conclusion);

    // Same natal across all six concerns must keep causal core exactly.
    const six=['money','career','love','path','people','mental'];
    const sit={money:'saving',career:'current',love:'relationship',path:'current',people:'friend',mental:'burnout'};
    const concernInvariant=six.map(key=>{
      const d={...baseData,concernKey:key,concernSituation:sit[key],currentMode:'F'};
      delete d.classicalReasoningV1; delete d.noteV3Audit; delete d.noteV2Audit;
      const notes=generateConcernNotes(d,'F');
      return {
        concern:key,fp:d.classicalReasoningV1.structureFingerprint,
        core:d.classicalReasoningV1.claims.slice(0,5).map(x=>x.conclusion),
        timingAnswer:plain(notes[5]?.desc),
      };
    });

    const pairIntro=compatRoot.querySelector('[data-export-intro="compat"]');
    const pairTiming=compatRoot.querySelector('[data-export-compat-timing="1"]');

    return {
      versions:{
        reasoning:globalThis.__CLASSICAL_REASONING_V1__?.version,
        note:globalThis.__CONCERN_NOTE_ENGINE_V2__?.version,
        products:product.version,
        policy:globalThis.__UNNI_PRODUCT_CONTENT_POLICY_V1__?.version,
      },
      contracts,
      runs:runs.map(x=>({
        id:x.id,concern:x.concern,situation:x.situation,
        fp:x.structureFingerprint,timingFp:x.timingFingerprint,
        timingAnswer:x.timingAnswer,timingMeta:x.timingMeta,
        pivots:(x.timing.longTermPivots||[]).map(p=>({year:p.year,class:p.class,sourceRuleIds:p.sourceRuleIds||[]})),
        nearCount:x.timing.concernNearTerm?.months?.length||0,
        fullPublicYears:(x.timing.fullSajuTimeline?.years||[]).map(y=>y.year),
        fullInternalYears:(x.timing.fullHorizon?.years||[]).map(y=>y.year),
        internalEnd:x.timing.internalHorizonEnd,
        horizonEnd:x.timing.horizonEnd,
        detailEnd:x.timing.detailEnd,
      })),
      products:{
        full:{
          text:plain(fullHtml),
          sections:fullRoot.querySelectorAll('[data-export-kind="full"]').length,
          contract:fullRoot.querySelector('[data-product-contract="full_saju"]')?.getAttribute('data-product-contract')||'',
          fp:fullRoot.querySelector('[data-structure-fingerprint]')?.getAttribute('data-structure-fingerprint')||'',
          timingFp:fullRoot.querySelector('[data-timing-fingerprint]')?.getAttribute('data-timing-fingerprint')||'',
        },
        bundle:{
          text:plain(bundleHtml),
          articles:bundleRoot.querySelectorAll('article').length,
          questions:bundleRoot.querySelectorAll('[data-export-kind="question"]').length,
          exclusive:!!bundleRoot.querySelector('[data-product-exclusive="concern_bundle3"]'),
          fullSections:bundleRoot.querySelectorAll('[data-export-kind="full"]').length,
        },
        all:{
          text:plain(allHtml),
          articles:allRoot.querySelectorAll('article').length,
          fullSections:allRoot.querySelectorAll('[data-export-kind="full"]').length,
          questionLink:!!allRoot.querySelector('[data-product-exclusive="all_in_one-question"]'),
          exclusive:!!allRoot.querySelector('[data-product-exclusive="all_in_one"]'),
          compatTiming:allRoot.querySelectorAll('[data-export-compat-timing]').length,
          compatExclusive:allRoot.querySelectorAll('[data-product-exclusive="compatibility"]').length,
        },
        compatBlocked:{
          blocked:!!blockedRoot.querySelector('[data-content-blocked="compatibility"]'),
          text:plain(compatBlocked),
          sections:blockedRoot.querySelectorAll('[data-export-kind="compat"]').length,
        },
        compat:{
          text:plain(compatHtml),
          sections:compatRoot.querySelectorAll('[data-export-kind="compat"]').length,
          pairTiming:!!pairTiming,
          aFp:pairIntro?.getAttribute('data-person-a-fingerprint')||'',
          bFp:pairIntro?.getAttribute('data-person-b-fingerprint')||'',
          overlayFp:pairTiming?.getAttribute('data-overlay-fingerprint')||'',
        },
      },
      baseIntegrity:{
        beforeFp:canonical.structureFingerprint,afterFp:fpAfter,
        beforeClaims:canonical.claimConclusions,afterClaims:claimsAfter,
      },
      concernInvariant,
      samples:{
        basicTiming:canonical.timingAnswer,
        fullSaju:plain(fullRoot.querySelector('[data-export-index="10"]')?.innerText||''),
        fullNear:plain(fullRoot.querySelector('[data-export-index="9"]')?.innerText||''),
        bundleExclusive:plain(bundleRoot.querySelector('[data-product-exclusive="concern_bundle3"]')?.innerText||''),
        compatExclusive:plain(pairTiming?.innerText||''),
        allExclusive:plain(allRoot.querySelector('[data-product-exclusive="all_in_one"]')?.innerText||''),
      },
    };
  });

  assert(r.versions.reasoning==='2.1.1'&&r.versions.note==='6.7.0'&&r.versions.products==='2.3.1'&&r.versions.policy==='1.2.0','runtime versions drift');

  const c=r.contracts;
  assert(c.basic_concern.longTermDetail==='teaser-only'&&c.basic_concern.questionCount===1&&!c.basic_concern.compatibilityAllowed,'basic free-question contract invalid');
  assert(c.concern_bundle3.questionCount===3&&c.concern_bundle3.allowedDomains==='three-free-questions'&&c.concern_bundle3.longTermDetail==='teaser-only','question pack contract invalid');
  assert(c.full_saju.longTermDetail==='full-five-year'&&c.full_saju.secondPersonRequired===false,'full contract invalid');
  assert(c.compatibility.secondPersonRequired===true&&c.compatibility.compatibilityAllowed===true,'compat contract invalid');
  assert(c.all_in_one.questionCount===1&&c.all_in_one.includesQuestionPack3===true&&c.all_in_one.compatibilityAllowed===false,'all-in-one free-question contract invalid');

  for(const run of r.runs){
    assert(run.nearCount>=17,'basic timing should retain ~18 months: '+run.id+' '+run.nearCount);
    assert(run.fullPublicYears.length>=5,'public full_saju five-year computation missing: '+run.id);
    assert(run.fullInternalYears.length>=6,'internal horizon is not longer than product disclosure: '+run.id);
    assert(run.pivots.length<=2,'basic long-term teaser exceeds two real pivots: '+run.id);
    for(const pivot of run.pivots) assert(pivot.sourceRuleIds.length>0,'long-term pivot lacks classical rule provenance: '+run.id+' '+JSON.stringify(pivot));
    assert(!run.timingAnswer.includes('앞으로 5년 큰 흐름'),'basic timing answer leaked full_saju five-year heading: '+run.id);
    // "2028년 전후"처럼 월이 없는 연도만 장기 연도다. "2027년 6월 6일"은 가까운 18개월 안의 달 표기라 따로 확인한다.
    const shownYears=[...new Set((run.timingAnswer.match(/20\d{2}년(?!\s*\d{1,2}월)/g)||[]).map(x=>Number(x.slice(0,4))))];
    const monthDates=[...run.timingAnswer.matchAll(/(20\d{2})년 (\d{1,2})월 (\d{1,2})일/g)].map(m=>`${m[1]}-${String(m[2]).padStart(2,'0')}-${String(m[3]).padStart(2,'0')}`);
    assert(monthDates.every(d=>!run.detailEnd||d<=run.detailEnd),'basic timing month date is outside the near-term window: '+run.id+' '+JSON.stringify({monthDates,detailEnd:run.detailEnd}));
    const pivotYears=run.pivots.map(x=>x.year);
    assert(shownYears.every(y=>pivotYears.includes(y)),'basic timing answer invented/non-pivot long-term year: '+run.id+' '+JSON.stringify({shownYears,pivotYears}));
    if(!pivotYears.length) assert(!(run.timingMeta.longTermPivotYears||[]).length,'basic timing answer invented teaser without a real pivot: '+run.id);
    if(pivotYears.length) assert(run.timingMeta.longTermPivotYears?.every(y=>pivotYears.includes(y)),'timing meta teaser not sourced from timing.longTermPivots: '+run.id);
    assert(!/(대운|세운|월운|원국|격국|용신|상신|기신|통관|압박|구조)/.test(run.timingAnswer),'basic timing answer leaked internal jargon: '+run.id+' '+run.timingAnswer);
  }

  assert(r.products.full.sections===12&&r.products.full.contract==='full_saju','full_saju 12-section whole-chart report missing');
  assert(r.products.full.fp===r.baseIntegrity.beforeFp&&r.products.full.timingFp,'full_saju did not reuse same reasoning result');
  assert(r.products.full.text.includes('앞으로 5년 큰 흐름'),'full_saju does not disclose the long-term detail hidden from basic timing answer');
  const fullYears=[...new Set((r.products.full.text.match(/20\d{2}년/g)||[]))];
  assert(fullYears.length>=5,'full_saju must expose five annual flow rows, got '+JSON.stringify(fullYears));

  assert(r.products.bundle.questions===3&&r.products.bundle.exclusive,'question pack must render exactly three free-question slots');
  assert(r.products.bundle.articles===0,'question pack must not prefill answers from the legacy fixed-concern engine');
  assert(r.products.bundle.fullSections===0,'question pack leaked full_saju whole-chart chapters');
  assert(!r.products.bundle.text.includes('앞으로 5년 큰 흐름'),'question pack leaked full five-year roadmap');
  assert(r.products.bundle.text.includes('질문 1')&&r.products.bundle.text.includes('질문 2')&&r.products.bundle.text.includes('질문 3'),'question pack labels missing');

  assert(r.products.compatBlocked.blocked&&r.products.compatBlocked.sections===0,'compatibility generated without second-person chart');
  assert(r.products.compat.sections===16&&r.products.compat.pairTiming,'two-person compatibility unique overlay/timing missing');
  assert(r.products.compat.aFp&&r.products.compat.bFp&&r.products.compat.aFp!==r.products.compat.bFp&&r.products.compat.overlayFp,'compatibility does not prove two distinct charts + overlay');
  assert(!r.products.full.text.includes('둘이 같이 있을 때의 시기 흐름')&&!r.products.all.text.includes('둘이 같이 있을 때의 시기 흐름'),'one-person products leaked pair-specific result');

  assert(r.products.all.articles===4&&r.products.all.fullSections===12&&r.products.all.questionLink&&r.products.all.exclusive,'all_in_one must include whole chart + current free-question link + synthesis');
  assert(r.products.all.compatTiming===0&&r.products.all.compatExclusive===0,'all_in_one swallowed compatibility');
  assert(r.products.all.text.includes('두 사람 궁합은 이 상품에 포함하지 않아'),'all_in_one boundary not explicit');

  assert(r.baseIntegrity.beforeFp===r.baseIntegrity.afterFp,'rendering a product changed natal classical conclusion');
  assert(JSON.stringify(r.baseIntegrity.beforeClaims)===JSON.stringify(r.baseIntegrity.afterClaims),'rendering a product changed classical claim conclusions');
  assert(new Set(r.concernInvariant.map(x=>x.fp)).size===1,'changing concern changed natal fingerprint');
  assert(new Set(r.concernInvariant.map(x=>JSON.stringify(x.core))).size===1,'changing concern changed NOTE1-5 causal core');

  const index=fs.readFileSync('index.html','utf8');
  assert(!index.includes('[2026, 2027]')&&!index.includes('for (const year of [2026, 2027])'),'2026/2027 hardcode remains in runtime');
  assert(index.includes('Array.from({ length: 11 }'),'internal timing horizon is not rolling current+10');

  assert(errors.length===0,'browser errors: '+errors.join(' | '));

  console.log('PRODUCT_CONTENT_BOUNDARY_PASS',JSON.stringify({
    fiveCharts:r.runs.map(x=>({id:x.id,concern:x.concern,near:x.nearCount,publicYears:x.fullPublicYears.length,internalYears:x.fullInternalYears.length,pivots:x.pivots})),
    concernInvariant:r.concernInvariant.map(x=>({concern:x.concern,fp:x.fp})),
  }));
  console.log('BASIC_TIMING_SAMPLE',JSON.stringify(r.samples.basicTiming));
  console.log('FULL_SAJU_TIMELINE_SAMPLE',JSON.stringify({near:r.samples.fullNear,long:r.samples.fullSaju}));
  console.log('PRODUCT_EXCLUSIVE_SAMPLES',JSON.stringify({bundle:r.samples.bundleExclusive,compat:r.samples.compatExclusive,all:r.samples.allExclusive}));
  console.log('PRODUCT_CONTRACT_SAMPLE',JSON.stringify(r.contracts));
  await browser.close();
})().catch(err=>{console.error(err.stack||err);process.exit(1);});
