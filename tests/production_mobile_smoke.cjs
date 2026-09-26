const { chromium } = require('playwright');
const BASE = process.env.PRODUCTION_BASE || 'https://sajuft.com/index.html';
const assert = (v,m) => { if (!v) throw new Error(m); };
const sleep = (ms) => new Promise(r => setTimeout(r,ms));
const norm = (v) => String(v || '').replace(/<[^>]+>/g,' ').replace(/[\s.,!?·‘’'"“”()\[\]]/g,'');
const LOCAL = /127\.0\.0\.1|localhost/.test(BASE);
function mockConsultation(question, mode='F') {
  const q=String(question||'').trim();
  const t=mode==='T';
  const evidence=['CHART_STRENGTH','CHART_STRUCTURE','CHART_TENGODS'];
  const claim=(headline,answer)=>({
    headline,
    answer,
    why:'태어난 계절에서 받는 힘, 일간이 실제로 기대는 뿌리, 십신의 배치와 격의 상태를 같이 봤어. 한 가지 오행 개수만으로 정한 답이 아니야.',
    technicalBasis:'월령과 통근, 신강·신약, 정관과 식상의 실제 세력, 격국에서 도움과 방해가 되는 관계를 함께 교차해서 봤어.',
    evidenceIds:evidence,
    counterEvidenceIds:[],
    certainty:'supported',
  });
  return {
    ok:true,model:'ci-mock',
    questionPlan:{primaryIntent:'자유질문',intentTags:['자유질문'],directQuestions:[q],decisionType:'판단',timeRange:'질문에 필요할 때만',needsClarification:false,clarifyingQuestion:''},
    directAnswer:claim(
      t?'결론부터 보면, 질문의 핵심은 선택 기준이야':'네가 물어본 것부터 말하면, 선택 기준이 먼저 보여',
      t?'둘 중 하나를 무조건 좋다고 정하기보다 네 사주에서 오래 버틸 수 있는 구조를 먼저 고르는 쪽이 맞아.':'지금은 남들이 좋다는 답보다 네 사주가 오래 힘을 쓸 수 있는 구조를 고르는 게 더 중요해.'
    ),
    centralThesis:claim(
      '이번 질문을 관통하는 사주의 중심',
      '겉으로 드러난 오행 개수보다 계절과 뿌리, 십신의 실제 힘이 서로 어떻게 이어지는지가 이번 선택을 가르는 핵심이야.'
    ),
    sections:[
      {id:'why',type:'explanation',label:'왜 이런 답인지',title:'겉개수보다 실제 세력이 더 중요해',answer:'같은 오행 비율이어도 계절과 뿌리, 격에서 맡는 역할이 다르면 현실에서 쓰이는 방식이 달라져.',why:'그래서 다섯 큰 성향 중 하나로 줄이지 않고 여러 근거를 같이 읽었어.',technicalBasis:'득령·득지·득세와 통근, 십신 위치, 격국 상태를 함께 확인했어.',nextAction:'지금 선택지마다 내가 통제할 수 있는 범위와 오래 버틸 조건을 적어봐.',evidenceIds:evidence,counterEvidenceIds:[],certainty:'supported'},
      {id:'risk',type:'caution',label:'특히 조심할 것',title:'잘 맞는 길도 이 조건이면 소모돼',answer:'책임만 커지고 결정권은 적은 구조라면 같은 분야라도 오래 갈수록 소모가 커질 수 있어.',why:'사주에서 강하게 들어오는 요구를 내가 받아내는 방식과 실제 뿌리를 같이 봤기 때문이야.',technicalBasis:'관성의 실제 세력과 일간의 감당력, 통근 여부를 같이 확인했어.',nextAction:'선택 전에 책임과 결정권이 같이 오는지 확인해.',evidenceIds:evidence,counterEvidenceIds:[],certainty:'supported'},
      {id:'action',type:'action',label:'지금 할 일',title:'정답을 믿기 전에 작은 검증부터 해',answer:'큰 결정을 한 번에 확정하기보다 네가 직접 통제할 수 있는 작은 결과를 먼저 만들어보는 게 좋아.',why:'이번 사주 구조에서는 실제 결과를 만들어 확인할 때 판단이 더 선명해지는 쪽으로 읽혀.',technicalBasis:'식상과 관성의 관계, 일간의 감당력과 구조 보완 순서를 함께 봤어.',nextAction:'이번 주 안에 가장 작은 실행 하나를 정해서 실제 반응을 확인해.',evidenceIds:evidence,counterEvidenceIds:[],certainty:'supported'},
    ],
  };
}
function mockConsultationPreview(question, mode='F') {
  const q=String(question||'').trim();
  const t=mode==='T';
  const evidence=['CHART_STRENGTH','CHART_STRUCTURE','CHART_TENGODS'];
  return {
    ok:true,
    model:'ci-preview-mock',
    directAnswer:{
      headline:t?'결론부터 보면 지금은 선택 기준부터 잡아야 해':'네가 물어본 것부터 보면, 지금은 선택 기준이 먼저 보여',
      answer:t?'당장 하나를 끊기보다 네가 오래 버틸 수 있는 조건을 먼저 확인하는 쪽이 맞아.':'지금은 남들이 좋다는 답보다 네가 오래 힘을 쓸 수 있는 조건부터 확인하는 게 더 중요해.',
      why:'태어난 계절에서 받는 힘, 실제 뿌리, 십신의 배치와 격의 상태를 같이 봤어. 오행 개수 하나만으로 정한 답은 아니야.',
      technicalBasis:'월령과 통근, 신강·신약, 정관과 식상의 실제 세력을 함께 교차했어.',
      evidenceIds:evidence,
      counterEvidenceIds:[],
      certainty:'supported',
    },
    followUp:{
      question:t?'지금 판단을 가장 흔드는 건 뭐야?':'그중에서도 지금 네 마음을 제일 흔드는 건 뭐야?',
      options:[
        {label:'지금 자리가 너무 힘들어',response:'그럼 버티는 힘보다 소모 조건을 먼저 봐야 해. 여기서부터는 언제까지 버티는 게 유리한지도 같이 확인해야 해.',focus:'소모 조건과 이동 시기'},
        {label:'다음 선택이 안 보여',response:'그럼 지금 자리를 끊는 것보다 다음 방향을 먼저 잡는 게 핵심이야. 네 사주에서 맞는 환경과 움직일 순서를 더 봐야 해.',focus:'맞는 환경과 다음 방향'},
        {label:'결정했다가 후회할까 봐',response:'그럼 결론보다 판단이 바뀌는 조건부터 확인해야 해. 어떤 신호가 오면 움직여도 되는지까지 연결해볼게.',focus:'판단 기준과 위험 조건'},
      ],
    },
    paidScope:[
      {title:'이 판단이 달라지는 조건'},
      {title:'너한테 맞는 선택과 소모되는 조건'},
      {title:'실제로 움직일 시기와 지금 할 행동'},
    ],
    handoff:'여기서부터는 네 사주 전체에서 이번 질문에 필요한 부분을 더 깊게 연결해서 봐야 해.',
  };
}

async function installConsultationMock(page) {
  await page.route('**/api/consultation-preview', async route => {
    const req=route.request();
    if(req.method()!=='POST') {
      if (LOCAL) return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,service:'ci-preview-mock',configured:true,enabled:true,model:'gpt-6-sol'})});
      return route.continue();
    }
    let body={}; try{body=req.postDataJSON()||{};}catch{}
    const packet=body.evidencePacket||{};
    return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(mockConsultationPreview(packet?.question?.text,packet?.requestMode))});
  });
  await page.route('**/api/consultation', async route => {
    const req=route.request();
    if(req.method()!=='POST') {
      if (LOCAL) return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,service:'ci-mock',configured:true,enabled:true,model:'gpt-6-sol'})});
      return route.continue();
    }
    let body={}; try{body=req.postDataJSON()||{};}catch{}
    const packet=body.evidencePacket||{};
    return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(mockConsultation(packet?.question?.text,packet?.requestMode))});
  });
}


async function probeLivePaymentPrepare(page) {
  if (LOCAL) return;
  const url=new URL('/api/confirm-payment',BASE).href;
  const question='결제 준비 상태를 확인하는 테스트 질문';
  const payload={
    action:'prepare',
    data:{
      n:'결제점검',
      b:'20000101',
      t:'unknown',
      g:'female',
      c:'solar',
      k:'consultation',
      q:question,
      m:'F',
      l:false
    }
  };
  const res=await page.request.post(url,{
    headers:{'content-type':'application/json'},
    data:payload,
    timeout:10000,
  });
  const body=await res.json().catch(()=>({}));
  if(!res.ok()||!body?.ok){
    throw new Error('payment prepare probe failed '+res.status()+' '+JSON.stringify(body));
  }
  if(body.amount!==100||body.productId!=='concern_single'||!body.orderId||!body.ticket){
    throw new Error('payment prepare probe contract drift '+JSON.stringify(body));
  }
  if(!String(body.userKey||'').includes(question)){
    throw new Error('payment prepare probe lost free-question scope '+JSON.stringify(body));
  }
}

async function deployed(page) {
  await installConsultationMock(page);
  for (let i=0;i<36;i++) {
    try {
      await page.goto(BASE + '?smoke=v22-' + i, {waitUntil:'domcontentloaded',timeout:30000});
      await page.waitForFunction(() =>
        globalThis.__PAID_VALUE_LAYER_V1__?.version === '1.5.3' &&
        globalThis.__CONCERN_NOTE_ENGINE_V2__?.version === '6.7.0' &&
        globalThis.__UNNI_CONSULTATION_V1__?.version === '1.1.0' &&
        globalThis.__UNNI_PRODUCTS_V1__?.version === '2.3.1' &&
        globalThis.__UNNI_PRODUCT_CONTENT_POLICY_V1__?.version === '1.2.0' &&
        typeof selectSplitMode === 'function', null, {timeout:8000});
      if (!LOCAL) {
        await probeLivePaymentPrepare(page);
        const healthUrl=new URL('/api/consultation',BASE).href;
        const healthRes=await page.request.get(healthUrl,{timeout:8000});
        if(!healthRes.ok()) throw new Error('consultation health '+healthRes.status());
        const health=await healthRes.json();
        if(!health?.ok||!health?.configured||!health?.enabled||health?.model!=='gpt-6-sol') {
          throw new Error('consultation API not production-ready '+JSON.stringify(health));
        }
      }
      return;
    } catch (_) { await sleep(10000); }
  }
  throw new Error('production did not reach consultation v1 / paid 1.5.3 / products 2.3.1');
}

async function clickCatalogProduct(page, productId) {
  const target=page.locator(`#unniProductLadder [data-unni-product="${productId}"]`);
  assert(await target.isVisible(),'catalog product should be immediately visible '+productId);
  await target.click();
}

async function checkRestartCta(page, mode) {
  await page.evaluate(()=>unlockFullReport(null,true));
  await page.locator('#reAnalyzeMainBtn').waitFor({state:'visible',timeout:5000});
  await page.locator('#reAnalyzeMainBtn').click();
  await page.waitForSelector('#consultationQuestionContinueButton',{state:'visible',timeout:5000});
  const state=await page.evaluate(()=>({
    question:document.getElementById('consultationQuestion')?.value||'',
    key:document.getElementById('selectedConcernKey')?.value||'',
    situation:document.getElementById('selectedConcernSituation')?.value||'',
    identityVisible:document.getElementById('sajuIdentityFields')?.offsetParent!==null,
    continueText:document.getElementById('consultationQuestionContinueButton')?.innerText||'',
    known:document.getElementById('sajuIdentityFields')?.dataset.knownSaju||'',
  }));
  assert(state.question===''&&state.key==='consultation'&&state.situation==='free',
    'follow-up did not reset to free question '+JSON.stringify(state));
  assert(!state.identityVisible&&state.known==='1','revisit should ask only the new concern first '+JSON.stringify(state));
  assert(mode==='F'?state.continueText.includes('이 얘기로'):state.continueText.includes('이 질문으로'),
    'question-first revisit CTA lost F/T voice '+JSON.stringify(state));
}

async function enter(page, mode, concern, situation) {
  const intro = await page.evaluate(() => {
    const title=document.getElementById('topTitleBox');
    const hint=document.getElementById('splitContinuityHint');
    const roa=document.getElementById('panelRoa');
    const seoa=document.getElementById('panelSeoa');
    const boxes=[title,hint,roa,seoa].map(el=>el?.getBoundingClientRect()).filter(Boolean);
    return {
      visible:getComputedStyle(document.getElementById('splitIntroSection')).display!=='none',
      inViewport:boxes.every(b=>b.top>=-1&&b.left>=-1&&b.right<=innerWidth+1&&b.bottom<=innerHeight+1),
      titleHeight:title?.getBoundingClientRect().height||0,
      hintVisible:!!hint && getComputedStyle(hint).opacity!=='0',
    };
  });
  assert(intro.visible && intro.inViewport && intro.titleHeight<=82 && !intro.hintVisible,'first counselor-choice viewport broken '+JSON.stringify(intro));
  await page.locator(mode === 'F' ? '#panelRoa' : '#panelSeoa').click();
  await page.waitForSelector('#sajuInputCardBox',{state:'visible',timeout:10000});
  await page.waitForSelector('#consultationQuestionContinueButton',{state:'visible',timeout:5000});

  const firstState=await page.evaluate(()=>({
    question:document.getElementById('consultationQuestion')?.value||'',
    key:document.getElementById('selectedConcernKey')?.value||'',
    situation:document.getElementById('selectedConcernSituation')?.value||'',
    identityVisible:document.getElementById('sajuIdentityFields')?.offsetParent!==null,
    prompt:document.getElementById('concernPickerPrompt')?.innerText||'',
    examples:document.querySelectorAll('#consultationQuestionExamples button').length,
    timeOptions:document.querySelectorAll('#birthTimeBranch option').length,
  }));
  assert(firstState.question===''&&firstState.key==='consultation'&&firstState.situation==='free'&&!firstState.identityVisible,
    'fresh consultation must ask the concern before birth data '+JSON.stringify(firstState));
  assert(firstState.examples>=4&&firstState.prompt.includes('그대로'),'free-question guidance missing '+JSON.stringify(firstState));
  assert(firstState.timeOptions===13,'12-branch birth-time selector drift');

  const question = mode==='F'
    ? '지금 만나는 사람이랑 계속 가도 될까? 관계에서 내가 꼭 봐야 할 기준도 알려줘.'
    : '지금 회사에 남는 게 나아, 옮기는 게 나아? 움직이기 좋은 시기도 같이 봐줘.';
  await page.fill('#consultationQuestion',question);
  await page.locator('#consultationQuestionContinueButton').click();
  await page.waitForSelector('#sajuIdentityFields',{state:'visible',timeout:5000});

  await page.fill('#nameInput','테스트');
  await page.fill('#birthDateInput','19980221');
  assert(await page.locator('#birthTimeBranch option').count()===13,'birth-time selector should include unknown and 12 branches');
  if(mode==='F') {
    await page.selectOption('#birthTimeBranch','寅');
  } else {
    await page.check('#birthTimeExactToggle');
    await page.fill('#birthTimeInput','0942');
    assert((await page.locator('#birthTimeInput').inputValue())==='09:42','exact HH:MM auto-format failed');
  }

  await page.locator('#analysisSubmitButton').click();
  await page.waitForSelector('#resultSection',{state:'visible',timeout:90000});
  await page.waitForFunction(()=>!!currentResultData?.__consultationPreviewV1?.directAnswer,null,{timeout:90000});
  await page.waitForSelector('#freeConsultationFollowUp',{state:'visible',timeout:5000});

  const beforeChoice=await page.evaluate(()=>({
    deepCards:currentResultData?.__consultationV1?.cards?.length||0,
    paywallVisible:document.getElementById('lockedOverlay')?.offsetParent!==null,
  }));
  assert(beforeChoice.deepCards===0&&!beforeChoice.paywallVisible,
    'deep consultation or paywall appeared before the free follow-up '+JSON.stringify(beforeChoice));

  await page.locator('#freeConsultationFollowUp button').first().click();
  await page.waitForSelector('#lockedOverlay',{state:'visible',timeout:5000});

  const applied=await page.evaluate(()=>({
    concern:currentResultData?.concernKey,
    situation:currentResultData?.concernSituation,
    question:currentResultData?.userQuestion,
    preview:!!currentResultData?.__consultationPreviewV1?.directAnswer,
    selected:Number.isInteger(currentResultData?.__consultationPreviewV1?.selectedOption),
    deepCards:currentResultData?.__consultationV1?.cards?.length||0,
    key:currentResultData?.userTimeKey||'',
    hourZhi:currentResultData?.pillars?.hour?.zhi||'',
  }));
  assert(applied.concern==='consultation'&&applied.situation==='free'&&applied.question===question&&applied.preview&&applied.selected&&applied.deepCards===0,
    'free preview did not stay lightweight '+JSON.stringify(applied));
  if(mode==='F') assert(applied.key==='寅'&&applied.hourZhi==='寅','branch birth time did not propagate '+JSON.stringify(applied));
  else assert(applied.key==='09:42'&&applied.hourZhi==='巳','exact birth time did not propagate '+JSON.stringify(applied));
}


async function resultLayoutSnapshot(page) {
  return page.evaluate(() => {
    const rect = (id) => {
      const el=document.getElementById(id);
      if(!el) return null;
      const cs=getComputedStyle(el);
      if(cs.display==='none') return null;
      const r=el.getBoundingClientRect();
      return {left:r.left,right:r.right,width:r.width,top:r.top,bottom:r.bottom};
    };
    const axisIds=[
      'resultSisterHandoff',
      'resultConsultationFlow',
      'consultationNotesShell',
      'resultFunExtras',
      'resultShareActions',
      'postConsultationProductsSlot',
    ];
    const axis=Object.fromEntries(axisIds.map(id=>[id,rect(id)]));
    const active=Object.values(axis).filter(Boolean);
    const lefts=active.map(r=>r.left);
    const rights=active.map(r=>r.right);
    const title=document.getElementById('sazuCharacterTitle');
    const titleRect=title?.getBoundingClientRect();
    const titleStyle=title?getComputedStyle(title):null;
    const lineHeight=parseFloat(titleStyle?.lineHeight||'0')||1;
    const pillarItems=[...document.querySelectorAll('#resultPillarCard .grid>div')].map(el=>{
      const cs=getComputedStyle(el);
      return {radius:cs.borderRadius,bg:cs.backgroundColor,top:cs.borderTopWidth,right:cs.borderRightWidth,bottom:cs.borderBottomWidth};
    });
    const ohengItems=[...document.querySelectorAll('#ohengBarContainer>div')].map(el=>{
      const cs=getComputedStyle(el);
      return {radius:cs.borderRadius,bg:cs.backgroundColor,top:cs.borderTopWidth,right:cs.borderRightWidth,bottom:cs.borderBottomWidth};
    });
    const flat=(id)=>{
      const el=document.getElementById(id);
      const cs=el?getComputedStyle(el):null;
      return cs?{radius:cs.borderRadius,bg:cs.backgroundColor,top:cs.borderTopWidth,right:cs.borderRightWidth,bottom:cs.borderBottomWidth}:null;
    };
    const metaRight=document.querySelector('#consultationNotesHeader>div:first-child>span:last-child');
    const bridge=document.getElementById('resultConcernHandoff');
    const bridgeAvatar=document.getElementById('resultConcernHandoffAvatar');
    const bridgeName=document.getElementById('resultConcernHandoffName');
    const shareLead=document.getElementById('resultShareLead');
    const funEyebrow=document.getElementById('resultFunExtrasEyebrow');
    const closeoutSub=document.getElementById('consultationCloseoutSub');
    const share=document.getElementById('mainShareBtn')?.getBoundingClientRect();
    const shareWrap=document.getElementById('resultShareActions')?.getBoundingClientRect();
    const funCards=[document.getElementById('chemBestCard'),document.getElementById('chemWorstCard')].filter(Boolean).map(el=>{
      const cs=getComputedStyle(el);
      return {radius:cs.borderRadius,bg:cs.backgroundColor,top:cs.borderTopWidth,right:cs.borderRightWidth,bottom:cs.borderBottomWidth};
    });
    const graphFirst=(()=>{
      const first=document.querySelector('#ohengBarContainer>div');
      if(!first) return false;
      const label=first.children[0], graph=first.children[1], pct=first.children[2];
      return Number(getComputedStyle(graph).order) < Number(getComputedStyle(label).order) &&
        Number(getComputedStyle(graph).order) < Number(getComputedStyle(pct).order);
    })();
    return {
      viewport:{width:document.documentElement.clientWidth,height:innerHeight},
      overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth,
      axis,
      axisCount:active.length,
      leftSpread:lefts.length?Math.max(...lefts)-Math.min(...lefts):999,
      rightSpread:rights.length?Math.max(...rights)-Math.min(...rights):999,
      minSide:active.length?Math.min(...active.map(r=>Math.min(r.left,document.documentElement.clientWidth-r.right))):0,
      titleFont:parseFloat(titleStyle?.fontSize||'0'),
      titleLines:titleRect?Math.ceil((titleRect.height+0.5)/lineHeight):99,
      overview:{
        core:flat('resultCoreCard'),
        pillars:flat('resultPillarCard'),
        oheng:flat('resultOhengCard'),
        pillarItems,
        ohengItems,
        graphFirst,
      },
      memoMetaDisplay:metaRight?getComputedStyle(metaRight).display:'',
      memoMetaText:metaRight?.innerText||'',
      bridgeDisplay:bridge?getComputedStyle(bridge).display:'',
      bridgeAvatarDisplay:bridgeAvatar?getComputedStyle(bridgeAvatar).display:'',
      bridgeNameDisplay:bridgeName?getComputedStyle(bridgeName).display:'',
      shareLeadDisplay:shareLead?getComputedStyle(shareLead).display:'',
      funEyebrowDisplay:funEyebrow?getComputedStyle(funEyebrow).display:'',
      closeoutSubDisplay:closeoutSub?getComputedStyle(closeoutSub).display:'',
      funCards,
      shareWidthDelta:share&&shareWrap?Math.abs(share.width-shareWrap.width):999,
    };
  });
}

function assertResultLayout(layout, label) {
  const transparent=(v)=>v==='rgba(0, 0, 0, 0)'||v==='transparent';
  assert(!layout.overflow,label+' horizontal overflow '+JSON.stringify(layout));
  assert(layout.axisCount>=4 && layout.axisCount<=6 && layout.leftSpread<=1.5 && layout.rightSpread<=1.5 && layout.minSide>=14.5,
    label+' result reading axis/gutter drift '+JSON.stringify(layout));
  for(const [id,r] of Object.entries(layout.axis)) {
    if(!r) continue;
    assert(r.left>=-1 && r.right<=layout.viewport.width+1,label+' section escaped viewport '+id+' '+JSON.stringify(r));
  }
  assert(layout.titleFont<=18 && layout.titleLines<=3,label+' result title dominates mobile fold '+JSON.stringify({font:layout.titleFont,lines:layout.titleLines}));
  for(const key of ['core','pillars','oheng']) {
    const box=layout.overview[key];
    assert(box && box.radius==='0px' && transparent(box.bg) && box.top==='0px' && box.right==='0px' && box.bottom==='0px',
      label+' nested overview card returned '+key+' '+JSON.stringify(box));
  }
  assert(layout.overview.pillarItems.length===4 && layout.overview.pillarItems.every(x=>x.radius==='0px'&&transparent(x.bg)&&x.top==='0px'&&x.right==='0px'&&x.bottom==='0px'),
    label+' four pillars look like independent cards '+JSON.stringify(layout.overview.pillarItems));
  const ohengBase=layout.overview.ohengItems[0];
  assert(
    layout.overview.ohengItems.length===5 &&
    !!ohengBase &&
    layout.overview.ohengItems.every(x=>
      x.radius===ohengBase.radius &&
      x.bg===ohengBase.bg &&
      x.top===ohengBase.top &&
      x.right===ohengBase.right &&
      x.bottom===ohengBase.bottom
    ) &&
    !transparent(ohengBase.bg) &&
    ohengBase.top!=='0px' &&
    !layout.overview.graphFirst,
    label+' five elements lost uniform compact-card hierarchy '+JSON.stringify(layout.overview)
  );
  assert(layout.memoMetaDisplay!=='none' && layout.memoMetaText.includes('1:1 맞춤 상담 기록'),
    label+' memo-book header metadata missing '+JSON.stringify({display:layout.memoMetaDisplay,text:layout.memoMetaText}));
  assert(layout.bridgeDisplay==='none',
    label+' concern handoff still interrupts the document '+JSON.stringify({bridge:layout.bridgeDisplay,avatar:layout.bridgeAvatarDisplay,name:layout.bridgeNameDisplay}));
  assert(layout.shareLeadDisplay==='none' && layout.funEyebrowDisplay==='none' && layout.closeoutSubDisplay==='none',
    label+' post-consultation helper copy is still visually competing '+JSON.stringify({shareLead:layout.shareLeadDisplay,funEyebrow:layout.funEyebrowDisplay,closeoutSub:layout.closeoutSubDisplay}));
  assert(layout.funCards.length===2 && layout.funCards.every(x=>x.radius==='0px'&&transparent(x.bg)),
    label+' secondary fun extras returned to flashy cards '+JSON.stringify(layout.funCards));
  assert(layout.shareWidthDelta<=1.5,label+' share CTA width left the reading axis '+layout.shareWidthDelta);
}

async function inspect(page, mode) {
  const r=await page.evaluate((mode)=>{
    const preview=currentResultData?.__consultationPreviewV1||{};
    const visibleText=document.getElementById('notesListContainer')?.innerText||'';
    const details=[...document.querySelectorAll('#notesListContainer details.consultation-evidence')];
    return {
      preview:!!preview.directAnswer,
      selected:Number.isInteger(preview.selectedOption),
      deepCardCount:currentResultData?.__consultationV1?.cards?.length||0,
      visibleText,
      question:currentResultData?.userQuestion||'',
      concern:currentResultData?.concernKey||'',
      situation:currentResultData?.concernSituation||'',
      evidenceCount:Array.isArray(preview.directAnswer?.evidenceIds)?preview.directAnswer.evidenceIds.length:0,
      detailsCount:details.length,
      rawEvidenceIdsVisible:/CHART_|DITIAN|ZIPING|RULE[_:-]/.test(visibleText),
      oldSix:/핵심\s*\|\s*질문에 대한 답|1\/6|2\/6/.test(visibleText),
      sourceFreeLaunch:FREE_LAUNCH_MODE,
      paywallVisible:document.getElementById('lockedOverlay')?.offsetParent!==null,
      followUpVisible:document.getElementById('freeConsultationFollowUp')?.offsetParent!==null,
    };
  },mode);
  r.resultLayout=await resultLayoutSnapshot(page);
  assertResultLayout(r.resultLayout,mode+' primary result');
  assert(r.concern==='consultation'&&r.situation==='free','old fixed concern path rendered '+JSON.stringify(r));
  assert(r.preview&&r.selected&&r.deepCardCount===0,'free stage must contain preview only '+JSON.stringify(r));
  assert(r.evidenceCount>0&&r.detailsCount>=1,'grounded preview evidence missing '+JSON.stringify(r));
  assert(r.followUpVisible&&r.paywallVisible,'follow-up / paywall handoff missing '+JSON.stringify(r));
  assert(!r.rawEvidenceIdsVisible&&!r.oldSix,'internal or fixed NOTE wording leaked '+r.visibleText);
  assert(!/[undefined|null|NaN]/.test(r.visibleText),'bad token leaked into consultation');
  return {
    ...r,
    n1:r.visibleText,
    n2:r.visibleText,
    n4:r.visibleText,
    n5:r.visibleText,
    n6:r.visibleText,
  };
}

(async()=>{
  const browser=await chromium.launch({headless:true});
  const ctx=await browser.newContext({viewport:{width:390,height:844}});
  const page=await ctx.newPage();
  const errors=[];
  const httpErrors=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{
    if(m.type()!=='error') return;
    const msg=m.text();
    if(!/Failed to load resource: the server responded with a status of 400/.test(msg)) errors.push(msg);
  });
  page.on('response',res=>{
    if(res.status()<400) return;
    const req=res.request();
    let action='';
    try { action=req.postDataJSON()?.action||''; } catch {}
    httpErrors.push({status:res.status(),url:res.url(),action});
  });
  const aiNoteRequests=[];
  const previewRequests=[];
  const consultationRequests=[];
  page.on('request',req=>{
    if(req.url().includes('/api/ai-notes')) aiNoteRequests.push(req.method()+' '+req.url());
    const path=new URL(req.url()).pathname;
    if(path.endsWith('/api/consultation-preview')&&req.method()==='POST') previewRequests.push(req.method()+' '+req.url());
    if(path.endsWith('/api/consultation')&&req.method()==='POST') consultationRequests.push(req.method()+' '+req.url());
  });
  await deployed(page);
  await enter(page,'F','love','relationship');

  if(!LOCAL){
    const openPayment=page.locator('#directPaymentOpenButton');
    assert(await openPayment.isVisible(),'basic payment open button is not visible on locked result');
    await openPayment.click();
    await page.waitForFunction(() =>
      !!paymentWidget &&
      !!paymentMethodsWidget &&
      getComputedStyle(document.getElementById('paymentWidgetArea')).display !== 'none' &&
      document.getElementById('paymentMethod')?.childElementCount > 0,
      null,{timeout:15000}
    );
    const paymentWidgetProbe=await page.evaluate(()=>({
      hasWidget:!!paymentWidget,
      hasMethods:!!paymentMethodsWidget,
      areaDisplay:getComputedStyle(document.getElementById('paymentWidgetArea')).display,
      methodChildren:document.getElementById('paymentMethod')?.childElementCount||0,
      agreementChildren:document.getElementById('paymentAgreement')?.childElementCount||0,
      openDisplay:getComputedStyle(document.getElementById('directPaymentOpenButton')).display,
    }));
    assert(paymentWidgetProbe.hasWidget&&paymentWidgetProbe.hasMethods&&paymentWidgetProbe.methodChildren>0,
      'live Toss payment widget did not render '+JSON.stringify(paymentWidgetProbe));
    await page.evaluate(()=>resetPaymentWidgetUI());
    console.log('LIVE_TOSS_WIDGET_RENDER_PASS',JSON.stringify(paymentWidgetProbe));
  }

  const aiRuntimeOff = await page.evaluate(() => ({
    runtime:typeof globalThis.__UNNI_AI_NOTE_V4__,
    scripts:[...document.scripts].filter(x => (x.getAttribute('src')||'').includes('ai-note-test-v1.js')).length,
  }));
  assert(aiRuntimeOff.runtime==='undefined' && aiRuntimeOff.scripts===0,
    'ordinary production page must not load AI NOTE test client '+JSON.stringify(aiRuntimeOff));

  // 구형 AI-NOTE 테스트 클라이언트는 꺼져 있고, 기본 결과는 새 자유질문 상담 엔진을 반드시 탄다.
  await sleep(150);
  const primaryConsultation = await page.evaluate(()=>({
    cachedLegacyAi:!!currentResultData?.__aiNoteV4,
    precisionStatus:!!document.getElementById('aiNotePrecisionStatus'),
    consultationVersion:globalThis.__UNNI_CONSULTATION_V1__?.version||'',
    preview:!!currentResultData?.__consultationPreviewV1?.directAnswer,
    selected:Number.isInteger(currentResultData?.__consultationPreviewV1?.selectedOption),
    cards:currentResultData?.__consultationV1?.cards?.length||0,
    question:currentResultData?.userQuestion||'',
    visibleText:document.getElementById('notesListContainer')?.innerText||'',
  }));
  assert(
    aiNoteRequests.length===0 &&
    previewRequests.length===1 &&
    consultationRequests.length===0 &&
    !primaryConsultation.cachedLegacyAi &&
    !primaryConsultation.precisionStatus &&
    primaryConsultation.consultationVersion==='1.1.0' &&
    primaryConsultation.preview &&
    primaryConsultation.selected &&
    primaryConsultation.cards===0 &&
    primaryConsultation.question.length>=4 &&
    !/작동 방식|압력군|과부하 후보/.test(primaryConsultation.visibleText),
    'free stage must use one lightweight preview and zero deep consultations '+JSON.stringify({
      aiNoteRequests,previewRequests,consultationRequests,...primaryConsultation,
      visibleText:primaryConsultation.visibleText.slice(0,300),
    })
  );
  console.log('PRIMARY_LIGHTWEIGHT_PREVIEW_PASS');

  const f=await inspect(page,'F');

  // 결과 화면에서 첫 뒤로가기는 입력 화면으로 튕기지 않고 결과를 유지해야 한다.
  await page.evaluate(()=>history.back());
  await sleep(180);
  const backGuard=await page.evaluate(()=>({
    state:history.state||null,
    resultVisible:getComputedStyle(document.getElementById('resultSection')).display!=='none',
    inputVisible:getComputedStyle(document.getElementById('splitIntroSection')).display!=='none',
  }));
  assert(
    backGuard.resultVisible &&
    !backGuard.inputVisible &&
    backGuard.state?.view==='result' &&
    !backGuard.state?.resultGuard,
    'first back from result should stay on result '+JSON.stringify(backGuard)
  );

  if(f.sourceFreeLaunch){
    assert(await page.locator('#unniShowOtherProducts').count()===0,'folded alternatives toggle should be removed');
    assert(await page.locator('#unniOtherProducts').isVisible(),'premium alternatives should be immediately visible');
    const visibleAlternatives=await page.locator('#unniOtherProducts [data-unni-product]').evaluateAll(els=>els.filter(el=>el.offsetParent!==null).length);
    assert(visibleAlternatives===3,'all three alternative products should be visible, got '+visibleAlternatives);
  }

  if(!f.sourceFreeLaunch){
    await page.evaluate(async()=>{
      const key=getUserUniqueKey(currentResultData);
      writeStore('tok_'+key,'ci-paid-token');
      const ready=await ensurePaidConsultationReady(currentResultData);
      if(!ready) throw new Error('mock paid consultation did not generate');
      unlockFullReport(null,true);
    });
    await page.waitForSelector('#resultShareActions',{state:'visible',timeout:5000});
    assert(await page.locator('#resultFunExtras').isVisible(),'fun extras should return after paid unlock');
    assert(await page.locator('#resultShareActions').isVisible(),'share action should return after paid unlock');
    assert(consultationRequests.length===1,'deep consultation must be generated exactly once after paid access '+JSON.stringify(consultationRequests));
  }

  assert((await page.locator('#mainShareBtnText').innerText()).includes('인스타 스토리'),'main CTA should keep the story action explicit after counseling');
  assert(await page.evaluate(()=>window.__UNNI_IMAGE_EXPORT_V2__?.version)==='2.8.0','live image export version did not update');
  await page.locator('#mainShareBtn').click();
  await page.waitForSelector('#storyCaptureMode',{state:'visible',timeout:5000});
  assert(await page.locator('#shareModal').isHidden(),'live one-tap share should bypass intermediate modal');
  const captureOpen=await page.evaluate(()=>({
    parent:document.getElementById('storyCard')?.parentElement?.id||'',
    topInside:!!document.elementFromPoint(4,4)?.closest?.('#storyCaptureMode'),
    layerZ:Number(getComputedStyle(document.getElementById('storyCaptureMode')).zIndex||0),
    shareZ:Number(getComputedStyle(document.getElementById('shareModal')).zIndex||0),
  }));
  assert(captureOpen.parent==='storyCaptureCardSlot'&&captureOpen.topInside&&captureOpen.layerZ>captureOpen.shareZ,
    'live capture mode does not isolate the original card '+JSON.stringify(captureOpen));
  const guideText=await page.locator('#storyCaptureChrome').innerText();
  assert(guideText.includes('화면 아무 데나 한 번 톡')&&guideText.includes('바로 결과로 돌아가'),'live capture prep should make the exit gesture obvious');
  const liveCardBox=await page.locator('#storyCard').boundingBox();
  assert(liveCardBox&&liveCardBox.width>=350&&liveCardBox.width<=390&&Math.abs(liveCardBox.height/liveCardBox.width-16/9)<0.03,
    'live capture card is not viewport-sized '+JSON.stringify(liveCardBox));
  const viralFill=await page.evaluate(()=>({
    storyText:document.getElementById('storyCard')?.innerText||'',
    bottomGap:document.getElementById('storyCard').getBoundingClientRect().bottom-document.getElementById('cardStickerBox').getBoundingClientRect().bottom,
    viralHeight:document.getElementById('cardViralPrompt').getBoundingClientRect().height,
    stickerInside:document.getElementById('cardStickerBox').getBoundingClientRect().bottom<=document.getElementById('storyCard').getBoundingClientRect().bottom+1,
  }));
  assert(viralFill.storyText.includes('너는 뭐 나왔어?')&&viralFill.storyText.includes('나도 내 결과 보기')&&viralFill.storyText.includes('sajuft.com')&&viralFill.bottomGap>=0&&viralFill.bottomGap<42&&viralFill.viralHeight>=66&&viralFill.stickerInside,
    'live viral card is sparse or clipped '+JSON.stringify(viralFill));
  await page.evaluate(()=>{
    window.__fullscreenCalls=0;
    document.documentElement.requestFullscreen=async()=>{window.__fullscreenCalls+=1;};
  });
  const captureCleanAt=Date.now();
  await page.locator('#storyCaptureReady').click();
  await page.waitForFunction(()=>getComputedStyle(document.getElementById('storyCaptureChrome')).display==='none',null,{timeout:6000});
  assert(await page.locator('#unniKakaoCardQualityGuide').count()===0,'old rendered-card quality warning exists');
  const captureSource=await page.evaluate(()=>({
    calls:window.__fullscreenCalls||0,
    requestFullscreen:String(enterStoryCaptureCleanView).includes('requestFullscreen'),
    delay:String(enterStoryCaptureCleanView).includes('3200'),
    autoReturn:String(enterStoryCaptureCleanView).includes('7000'),
  }));
  assert(captureSource.calls===1&&captureSource.requestFullscreen&&captureSource.delay&&!captureSource.autoReturn&&Date.now()-captureCleanAt>=2800,
    'fullscreen capture path or system-notice delay missing '+JSON.stringify(captureSource));
  assert(await page.locator('#storyCaptureMode').isVisible(),'clean capture should remain until user taps');
  await page.locator('#storyCaptureMode').click({position:{x:4,y:4},force:true});
  await page.waitForFunction(()=>getComputedStyle(document.getElementById('storyCaptureMode')).display==='none',null,{timeout:5000});
  assert(await page.locator('#shareModal').isHidden(),'tap-to-return should go directly to result');
  assert(await page.locator('#resultSection').isVisible(),'tap-to-return lost the result view');

  if(await page.locator('#unniProductLadder').count()===0){
    await page.evaluate(()=>{
      FREE_LAUNCH_MODE=true;
      unlockFullReport(null,true);
      renderUnniProductCatalog();
    });
    await page.waitForSelector('#unniProductLadder',{state:'visible',timeout:10000});
  }
  const liveCatalogReady = await page.waitForFunction(
    ()=>!!document.querySelector('#unniProductLadder [data-recommendation-reason="1"]'),
    null,
    {timeout:3500},
  ).then(()=>true).catch(()=>false);
  if(!liveCatalogReady){
    const purchaseStatus = await page.locator('#unniProductLadder [data-entitlement-status]').innerText().catch(()=> '');
    assert(/구매|확인|지연/.test(purchaseStatus),'premium catalog failed for an unknown reason '+purchaseStatus);
    await page.evaluate(()=>{
      FREE_LAUNCH_MODE=true;
      document.getElementById('unniProductLadder')?.remove();
      renderUnniProductCatalog();
    });
    await page.waitForFunction(
      ()=>!!document.querySelector('#unniProductLadder [data-recommendation-reason="1"]'),
      null,
      {timeout:10000},
    );
  }
  const postUnlock=await page.evaluate(()=>({
    cards:document.querySelectorAll('#notesListContainer > div').length,
    preview:!!document.getElementById('note2PreviewCard'),
    catalogAfterNotes:(document.getElementById('notesListContainer').compareDocumentPosition(document.getElementById('unniProductLadder')) & Node.DOCUMENT_POSITION_FOLLOWING)!==0,
    reasonCount:document.querySelectorAll('#unniProductLadder [data-recommendation-reason="1"]').length,
    reasonText:document.querySelector('#unniProductLadder [data-recommendation-reason="1"]')?.innerText||'',
    catalogText:document.getElementById('unniProductLadder')?.innerText||'',
    roleLabelCount:document.querySelectorAll('#notesListContainer .note-role-label').length,
    roles:[...document.querySelectorAll('#notesListContainer [data-note-role]')].map(el=>({
      role:el.getAttribute('data-note-role'),
      title:el.querySelector('.note-editorial-title')?.innerText||'',
      text:el.innerText||'',
    })),
  }));
  const expectedDynamicCards=await page.evaluate(()=>currentResultData?.__consultationV1?.cards?.length||0);
  assert(postUnlock.cards===expectedDynamicCards&&expectedDynamicCards>=4&&expectedDynamicCards<=9&&!postUnlock.preview&&postUnlock.catalogAfterNotes,
    'basic unlock must reveal every dynamic consultation section before post-report upsells '+JSON.stringify({expectedDynamicCards,...postUnlock}));
  assert(postUnlock.roleLabelCount===0&&postUnlock.roles.length===expectedDynamicCards&&postUnlock.roles.every(x=>x.title.length>0),
    'dynamic consultation headers must use the bold generated title without tiny role labels '+JSON.stringify(postUnlock.roles));
  assert(postUnlock.roles[0]?.text.includes('네가 물어본 것부터') &&
         postUnlock.roles.some(x=>x.title.includes('잘 맞는 길도 이 조건이면 소모돼')) &&
         postUnlock.roles.some(x=>x.title.includes('작은 검증')),
    'direct answer / caution / action flow is not visible '+JSON.stringify(postUnlock.roles));
  assert(postUnlock.reasonCount===1&&postUnlock.reasonText.length>=10,'premium recommendation should keep one compact reason '+JSON.stringify(postUnlock));
  assert(!postUnlock.catalogText.includes('질문 3개 더 이어서'),'retired question-pack sale returned to the new catalog '+postUnlock.catalogText);
  assert(!postUnlock.catalogText.includes('언니라면 이걸 먼저 이어서 볼 것 같아')&&!postUnlock.catalogText.includes('다음으로 볼 가치는 이게 제일 커')&&!postUnlock.catalogText.includes('방금 같이 본 얘기는 반복하지 않고')&&!postUnlock.catalogText.includes('방금 본 내용과 겹치는 건 빼고'),
    'premium recommendation still renders marketing-style preamble '+postUnlock.catalogText);

  await clickCatalogProduct(page,'compatibility');
  await page.waitForSelector('#unniProductModal',{state:'visible'});
  assert((await page.locator('#unniProductBadge').innerText()).includes('로아 언니'),'F premium modal lost Roa continuity');
  const compatibilitySetup=await page.locator('#unniProductModal').innerText();
  assert(compatibilitySetup.includes('이번엔 상대 사주도 같이 놓고 볼게.'),'F compatibility setup lost Roa voice');
  assert(compatibilitySetup.includes('양력')&&compatibilitySetup.includes('음력')&&!compatibilitySetup.includes('양력 생일')&&!compatibilitySetup.includes('음력 생일'),'live compatibility calendar labels are not simplified');
  assert(compatibilitySetup.includes('자시 · 23:30~01:29')&&compatibilitySetup.includes('(모름)'),'live compatibility manse-corrected time UI missing');
  assert(await page.locator('#partnerTimeBranch option').count()===13,'compatibility unknown + 12-branch selector missing');
  assert((await page.locator('#partnerTimeBranch').inputValue())==='unknown','compatibility unknown-time default missing');
  assert(await page.locator('#partnerTimeDirectToggle').count()===0,'removed compatibility direct-time checkbox returned');
  assert(await page.locator('#partnerTimeInput').count()===0,'removed compatibility direct-time field returned');
  assert(!compatibilitySetup.includes('태어난 시간을 몰라요')&&!compatibilitySetup.includes('정확한 분을 몰라도')&&!compatibilitySetup.includes('오전/오후')&&!compatibilitySetup.includes('몇 분')&&!compatibilitySetup.includes('정확한 시간 직접 입력'),'old/technical compatibility time UI remains');
  assert(!(await page.locator('#partnerLeapWrap').isVisible()),'live leap-month UI must stay hidden for solar');
  await page.selectOption('#partnerCalendar','lunar');
  assert(await page.locator('#partnerLeapWrap').isVisible(),'live leap-month UI did not appear for lunar');
  await page.check('#partnerLeapMonth');
  await page.selectOption('#partnerCalendar','solar');
  assert(!(await page.locator('#partnerLeapWrap').isVisible())&&!(await page.locator('#partnerLeapMonth').isChecked()),'live leap-month UI did not hide/reset for solar');
  await page.locator('#unniProductClose').click();

  await clickCatalogProduct(page,'full_saju');
  await page.waitForSelector('#unniProductModal',{state:'visible'});
  const sourceFreeLaunch=await page.evaluate(()=>FREE_LAUNCH_MODE);
  const productActionText=await page.locator('#unniProductAction').innerText();
  assert(
    sourceFreeLaunch
      ? productActionText.includes('무료 이벤트')
      : productActionText.includes('내 사주 전체상담 보기 · 100원'),
    'live free/paid product toggle mismatch: '+JSON.stringify({sourceFreeLaunch,productActionText})
  );

  // Never open a real checkout in smoke tests. Temporarily unlock only inside this browser page.
  if(!sourceFreeLaunch){
    await page.evaluate(()=>{FREE_LAUNCH_MODE=true;});
    await page.locator('#unniProductClose').click();
    await clickCatalogProduct(page,'full_saju');
    await page.waitForSelector('#unniProductModal',{state:'visible'});
  }
  await page.locator('#unniProductAction').click();
  await page.waitForFunction(()=>{
    const slot=document.querySelector('[data-premium-consultation-report="full_saju"]');
    const count=slot?.querySelectorAll('article').length||0;
    return count>=4&&count<=9;
  },null,{timeout:10000});
  assert(await page.locator('#unniProductStickyHead').evaluate(el=>getComputedStyle(el).position)==='sticky','sticky header broken');
  assert(await page.locator('#unniProductSavePdf').count()===0,'PDF save UI must be removed');
  assert(!(await page.locator('#unniProductModal').innerText()).includes('다른 브라우저'),'paid save should not tell users to switch browsers');
  await page.waitForFunction(()=>/저장할 사진 준비됐어|저장 준비 완료/.test(document.getElementById('unniProductSaveHint')?.innerText||''),null,{timeout:45000});
  assert(await page.locator('#unniProductSaveAll').isEnabled(),'photo export prewarm not ready');
  await page.locator('#unniProductClose').click();
  await checkRestartCta(page,'F');

  const t=await ctx.newPage();
  const terr=[];
  const thttpErrors=[];
  t.on('pageerror',e=>terr.push(e.message));
  t.on('console',m=>{
    if(m.type()!=='error') return;
    const msg=m.text();
    if(!/Failed to load resource: the server responded with a status of 400/.test(msg)) terr.push(msg);
  });
  t.on('response',res=>{
    if(res.status()<400) return;
    const req=res.request();
    let action='';
    try { action=req.postDataJSON()?.action||''; } catch {}
    thttpErrors.push({status:res.status(),url:res.url(),action});
  });
  await deployed(t);
  await enter(t,'T','mental','burnout');
  const tr=await inspect(t,'T');
  if(await t.locator('#unniProductLadder').count()===0){
    await t.evaluate(()=>{
      FREE_LAUNCH_MODE=true;
      unlockFullReport(null,true);
      renderUnniProductCatalog();
    });
    await t.waitForSelector('#unniProductLadder',{state:'visible',timeout:10000});
  }
  await clickCatalogProduct(t,'compatibility');
  await t.waitForSelector('#unniProductModal',{state:'visible'});
  assert((await t.locator('#unniProductBadge').innerText()).includes('서아 언니'),'T premium modal lost Seoa continuity');
  const tCompatibilitySetup=await t.locator('#unniProductModal').innerText();
  assert(tCompatibilitySetup.includes('궁합은 상대 사주가 필요해. 아는 정보부터 입력해줘.'),'T compatibility setup lost Seoa voice');
  await t.locator('#unniProductClose').click();
  await checkRestartCta(t,'T');

  const smallCtx=await browser.newContext({viewport:{width:360,height:800}});
  for(const mode of ['F','T']){
    const small=await smallCtx.newPage();
    await deployed(small);
    const intro=await small.evaluate(()=>({
      text:document.getElementById('splitIntroSection')?.innerText||'',
      overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth,
      title:document.getElementById('topTitleBox')?.getBoundingClientRect(),
      roa:document.getElementById('panelRoa')?.getBoundingClientRect(),
      seoa:document.getElementById('panelSeoa')?.getBoundingClientRect(),
    }));
    assert(!intro.overflow,'360px first screen horizontal overflow');
    for(const box of [intro.title,intro.roa,intro.seoa]) {
      assert(box && box.left>=-1 && box.right<=361 && box.top>=-1 && box.bottom<=801,'360px first fold clipping '+JSON.stringify(intro));
    }
    await small.locator(mode==='F'?'#panelRoa':'#panelSeoa').click();
    await small.waitForSelector('#sajuInputCardBox',{state:'visible',timeout:10000});
    const voice=await small.locator('#welcomeSisterText').innerText();
    if(mode==='F') assert(voice==='응, 편하게 적어줘.','360px F voice drift '+voice);
    else assert(voice==='좋아. 필요한 것만 적어줘.','360px T voice drift '+voice);
    await small.close();
  }
  await smallCtx.close();

  const resultViewports=[
    {width:360,height:800,mode:'F'},
    {width:375,height:812,mode:'T'},
    {width:390,height:844,mode:'F'},
    {width:393,height:852,mode:'T'},
    {width:430,height:932,mode:'F'},
  ];
  for(const vp of resultViewports){
    const vctx=await browser.newContext({viewport:{width:vp.width,height:vp.height}});
    const vpage=await vctx.newPage();
    await deployed(vpage);
    await enter(vpage,vp.mode,vp.mode==='F'?'love':'mental',vp.mode==='F'?'relationship':'burnout');
    const layout=await resultLayoutSnapshot(vpage);
    assertResultLayout(layout,vp.width+'x'+vp.height+' '+vp.mode);
    await vpage.screenshot({path:'/tmp/result-ui-'+vp.width+'x'+vp.height+'-'+vp.mode+'.png',fullPage:true,animations:'disabled'});
    await vctx.close();
  }

  const expectedEntitlementFailure=(x)=>
    x.status===400 &&
    x.url.includes('/api/confirm-payment') &&
    x.action==='entitlements';
  assert(errors.length===0,'F browser errors '+errors.join(' | '));
  assert(terr.length===0,'T browser errors '+terr.join(' | '));
  assert(httpErrors.every(expectedEntitlementFailure),'F unexpected HTTP errors '+JSON.stringify(httpErrors));
  assert(thttpErrors.every(expectedEntitlementFailure),'T unexpected HTTP errors '+JSON.stringify(thttpErrors));
  console.log('PRODUCTION_MOBILE_SMOKE_PASS',JSON.stringify({
    f:[f.n1.length,f.n2.length,f.n4.length,f.n5.length,f.n6.length],
    t:[tr.n1.length,tr.n2.length,tr.n4.length,tr.n5.length,tr.n6.length],
    expectedEntitlement400s:httpErrors.filter(expectedEntitlementFailure).length+thttpErrors.filter(expectedEntitlementFailure).length,
    pdfRemoved:true
  }));
  await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
