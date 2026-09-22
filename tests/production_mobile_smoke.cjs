const { chromium } = require('playwright');
const BASE = process.env.PRODUCTION_BASE || 'https://sajuft.com/index.html';
const assert = (v,m) => { if (!v) throw new Error(m); };
const sleep = (ms) => new Promise(r => setTimeout(r,ms));
const norm = (v) => String(v || '').replace(/<[^>]+>/g,' ').replace(/[\s.,!?·‘’'"“”()\[\]]/g,'');

async function deployed(page) {
  for (let i=0;i<36;i++) {
    try {
      await page.goto(BASE + '?smoke=v21-' + i, {waitUntil:'domcontentloaded',timeout:30000});
      await page.waitForFunction(() =>
        globalThis.__PAID_VALUE_LAYER_V1__?.version === '1.5.0' &&
        globalThis.__CONCERN_NOTE_ENGINE_V2__?.version === '3.2.1' &&
        globalThis.__UNNI_PRODUCTS_V1__?.version === '2.1.0' &&
        typeof selectSplitMode === 'function', null, {timeout:8000});
      return;
    } catch (_) { await sleep(10000); }
  }
  throw new Error('production did not reach NOTE v3 / paid 1.5.0 / products 2.1.0');
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
  await page.waitForSelector('#analysisSubmitButton',{state:'visible',timeout:5000});
  const cta=await page.locator('#analysisSubmitButton').evaluate((el)=>({
    mode:el.dataset.consultMode||'',
    text:el.innerText||'',
    className:el.className||'',
    background:getComputedStyle(el).backgroundImage||'',
    color:getComputedStyle(el).color||'',
  }));
  assert(cta.mode===mode,'other-concern CTA lost F/T design hook '+JSON.stringify(cta));
  assert(
    mode==='F'
      ? cta.text.includes('로아 언니한테 새 고민 말하기')
      : cta.text.includes('서아 언니한테 새 고민 말하기'),
    'other-concern CTA copy changed '+JSON.stringify(cta)
  );
  assert(!cta.className.includes('fee500')&&cta.background.includes('linear-gradient')&&cta.color==='rgb(255, 255, 255)',
    'other-concern CTA still uses legacy Kakao-yellow styling '+JSON.stringify(cta));
  const returnBubble=await page.locator('#welcomeSisterBubble').evaluate((el)=>({
    voice:document.getElementById('welcomeSisterText')?.innerText||'',
    bg:getComputedStyle(el).backgroundColor,
    border:getComputedStyle(el).borderColor,
    color:getComputedStyle(document.getElementById('welcomeSisterText')).color,
    mode:el.dataset.consultMode||'',
  }));
  if(mode==='F') {
    assert(returnBubble.voice.includes('이번엔 뭐가 마음에 걸려?'),'F other-concern return lost warm continuity '+returnBubble.voice);
    assert(returnBubble.mode==='F'&&returnBubble.color.includes('123, 49, 69'),'F return bubble palette drift '+JSON.stringify(returnBubble));
  } else {
    assert(returnBubble.voice.includes('좋아. 이번엔 뭐부터 볼까?'),'T other-concern return lost concise continuity '+returnBubble.voice);
    assert(returnBubble.mode==='T'&&returnBubble.color.includes('49, 93, 112'),'T return bubble should use blue palette '+JSON.stringify(returnBubble));
  }
}

async function enter(page, mode, concern, situation) {
  const intro = await page.evaluate(() => {
    const title=document.getElementById('topTitleBox');
    const hint=document.getElementById('splitContinuityHint');
    const roa=document.getElementById('panelRoa');
    const seoa=document.getElementById('panelSeoa');
    const bodyText=document.getElementById('splitIntroSection')?.innerText||'';
    const roaCta=roa?.querySelector('.split-choice-cta');
    const seoaCta=seoa?.querySelector('.split-choice-cta');
    const boxes=[title,hint,roa,seoa].map(el=>el?.getBoundingClientRect()).filter(Boolean);
    return {
      bodyText,
      visible:getComputedStyle(document.getElementById('splitIntroSection')).display!=='none',
      inViewport:boxes.every(b=>b.top>=-1&&b.left>=-1&&b.right<=innerWidth+1&&b.bottom<=innerHeight+1),
      titleHeight:title?.getBoundingClientRect().height||0,
      hintVisible:!!hint && getComputedStyle(hint).opacity!=='0',
      panelHeightDelta:Math.abs((roa?.getBoundingClientRect().height||0)-(seoa?.getBoundingClientRect().height||0)),
      ctaHeightDelta:Math.abs((roaCta?.getBoundingClientRect().height||0)-(seoaCta?.getBoundingClientRect().height||0)),
    };
  });
  assert(intro.visible && intro.inViewport && intro.titleHeight<=82 && !intro.hintVisible && intro.panelHeightDelta<=2 && intro.ctaHeightDelta<=2,'first counselor-choice viewport/layout balance broken '+JSON.stringify(intro));
  for(const copy of ['똑같은 내 사주, 누구한테 먼저 털어놓을래?','로아 · 감정 공감형','서아 · 핵심 정리형','요즘 뭐가 제일 마음에 걸려?','언니한테 편하게 얘기해봐','뭐가 제일 궁금해?','중요한 것부터 바로 보자','언니한테 얘기해볼래','좋아, 바로 봐줘']) {
    assert(intro.bodyText.includes(copy),'first counselor-choice copy missing '+copy);
  }
  for(const removedCopy of ['말해주는 방식만 골라봐','마음부터 들어주는','핵심부터 짚어주는','선택한 언니의 말투로 결과 끝까지 이어져','응, 언니랑 천천히 풀어볼래','좋아, 핵심만 바로 알려줘','원하는 상담 스타일을 골라봐','왔어? 요즘 뭐가 제일 마음에 걸려','왔어? 뭐가 제일 궁금해']) {
    assert(!intro.bodyText.includes(removedCopy),'removed first counselor-choice copy remains '+removedCopy);
  }
  await page.locator(mode === 'F' ? '#panelRoa' : '#panelSeoa').click();
  await page.waitForSelector('#sajuInputCardBox',{state:'visible',timeout:10000});
  const firstState = await page.evaluate(() => ({
    concern:document.getElementById('selectedConcernKey')?.value || '',
    timeSelect:(()=>{
      const el=document.getElementById('birthTimeBranch');
      return el?{
        value:el.value,
        text:el.options[el.selectedIndex]?.text || '',
        color:getComputedStyle(el).color,
      }:null;
    })(),
    selected:document.querySelectorAll('#concernGrid .concern-chip.selected').length,
    details:getComputedStyle(document.getElementById('concernSituationBox')).display,
    summary:getComputedStyle(document.getElementById('concernSituationSummary')).display,
    submitDisabled:!!document.getElementById('analysisSubmitButton')?.disabled,
    submitOpacity:parseFloat(getComputedStyle(document.getElementById('analysisSubmitButton')).opacity||'1'),
    concernPrompt:document.getElementById('concernPickerPrompt')?.innerText||'',
    oldManseCopy:document.body.innerText.includes('정확한 만세력 조회를 위해 적어줘'),
    oldTimeHint:document.body.innerText.includes('출생기록에 적힌 시각을 입력하면 더 정확해'),
    timeHintExists:!!document.getElementById('birthTimeHint'),
    sisterText:document.getElementById('welcomeSisterText')?.innerText||'',
  }));
  assert(firstState.concern==='' && firstState.selected===0 && firstState.details==='none' && firstState.summary==='none' && firstState.submitDisabled,
    'fresh input must require an explicit concern '+JSON.stringify(firstState));
  assert(!firstState.oldManseCopy && !firstState.oldTimeHint && !firstState.timeHintExists,
    'birth input still shows old technical/helper copy '+JSON.stringify(firstState));
  assert(firstState.timeSelect && firstState.timeSelect.value==='' && firstState.timeSelect.text==='(선택)',
    'birth-time selector should open in neutral selection state '+JSON.stringify(firstState.timeSelect));
  assert(firstState.timeSelect.color.includes('176, 180, 188'),
    'birth-time selection placeholder color drift '+JSON.stringify(firstState.timeSelect));
  assert(firstState.submitOpacity<=0.4,'disabled consultation CTA is still too visually active '+JSON.stringify(firstState));
  if (mode==='F') assert(
    firstState.sisterText.includes('아, 왔구나. 편하게 적어줘.') &&
    firstState.sisterText.includes('언니가 하나씩 잘 봐줄게.') &&
    firstState.concernPrompt==='요즘 제일 마음에 걸리는 건?' &&
    !firstState.sisterText.includes('ㅎㅎ'),
    'F input lost warm concise counselor voice '+JSON.stringify(firstState)
  );
  if (mode==='T') assert(
    firstState.sisterText.includes('왔어. 적어줘.') &&
    firstState.sisterText.includes('핵심부터 바로 볼게.') &&
    firstState.concernPrompt==='지금 제일 궁금한 건?' &&
    !firstState.sisterText.includes('ㅎㅎ'),
    'T input lost concise counselor voice '+JSON.stringify(firstState)
  );
  await page.fill('#nameInput','테스트');
  const label = concern === 'love' ? '연애 · 썸' : '마음 · 스트레스';
  await page.locator('#concernGrid .concern-chip').filter({hasText:label}).click();
  await page.waitForSelector('#concernSituationBox',{state:'visible'});
  const situationPrompt=(await page.locator('#concernSituationPrompt').innerText()).trim();
  const expectedSituationPrompt=concern==='love'
    ? '연애 얘기, 지금 너랑 제일 가까운 건 뭐야?'
    : '마음이 힘든데, 지금 제일 가까운 느낌은 뭐야?';
  assert(situationPrompt===expectedSituationPrompt,'restored situation prompt drift '+situationPrompt);
  assert(await page.locator('#concernSituationGrid [data-concern-situation]').count() === 4,'situation count');
  await page.locator('#concernSituationGrid [data-concern-situation="'+situation+'"]').click();
  await page.waitForSelector('#concernSituationSummary',{state:'visible'});
  assert(await page.locator('#concernSituationAck').count()===0,'extra situation acknowledgement should stay removed');
  assert(!(await page.locator('#analysisSubmitButton').isDisabled()),'send button should unlock after concern and situation');
  assert(await page.locator('#concernSituationBox').isHidden(),'situation did not collapse');
  await page.locator('#concernSituationSummary button').click();
  await page.waitForSelector('#concernSituationBox',{state:'visible'});
  await page.locator('#concernSituationGrid [data-concern-situation="'+situation+'"]').click();
  await page.fill('#birthDateInput','19980221');
  assert(await page.locator('#birthTimeBranch option').count()===14,'birth-time selector should include placeholder, unknown, and 12 branches');
  assert((await page.locator('#birthTimeBranch option').first().innerText())==='(선택)','birth-time selection default missing');
  assert(await page.locator('#birthTimeBranch option').first().getAttribute('hidden')!==null,'birth-time placeholder must stay hidden once menu opens');
  assert((await page.locator('#birthTimeBranch option').nth(1).innerText())==='모름','birth-time unknown choice must be first visible option');
  assert((await page.locator('#birthTimeBranch option[value="子"]').innerText()).includes('23:30~01:29'),'manse-corrected 子 range missing');
  assert(await page.locator('#birthTimeDirectToggle').count()===0,'removed direct-time checkbox returned');
  assert(await page.locator('#birthTimeInput').count()===0,'removed direct-time field returned');
  await page.selectOption('#birthTimeBranch','寅');
  await page.locator('#splitNextButton button').click();
  await page.waitForSelector('#resultSection',{state:'visible',timeout:30000});
  const sourceFreeLaunch=await page.evaluate(()=>FREE_LAUNCH_MODE);
  if(sourceFreeLaunch){
    await page.waitForSelector('#unniProductLadder',{state:'visible',timeout:10000});
  }else{
    await page.waitForSelector('#note2PreviewCard',{state:'visible',timeout:10000});
    await page.waitForSelector('#lockedOverlay',{state:'visible',timeout:10000});
  }
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
  assert(layout.overview.ohengItems.length===5 && layout.overview.ohengItems.every(x=>x.radius==='0px'&&transparent(x.bg)&&x.top==='0px'&&x.right==='0px'&&x.bottom==='0px') && layout.overview.graphFirst,
    label+' five elements lost single-graph hierarchy '+JSON.stringify(layout.overview));
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
  const r = await page.evaluate((mode) => {
    const plain = v => String(v||'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
    const notes = generateConcernNotes(currentResultData,mode);
    const products=[...document.querySelectorAll('#unniProductLadder [data-unni-product]')];
    return {
      n1:plain(notes[0]?.desc), n2:plain(notes[1]?.desc),
      n4:plain(notes[3]?.desc), n5:plain(notes[4]?.desc),
      noteV2Audit:currentResultData?.noteV2Audit || null,
      note6Timing:notes[5]?.__timingQA || null,
      oheng:document.getElementById('ohengSummaryTxt')?.innerText||'',
      dayMasterTag:document.getElementById('dayMasterTag')?.innerText||'',
      sourceFreeLaunch:FREE_LAUNCH_MODE,
      count:products.length,
      visible:products.filter(x=>x.offsetParent!==null).length,
      catalog:document.getElementById('unniProductLadder')?.innerText||'',
      recommendedReason:document.querySelector('#unniProductLadder [data-recommendation-reason="1"]')?.innerText||'',
      otherToggle:!!document.getElementById('unniShowOtherProducts'),
      otherVisible:document.getElementById('unniOtherProducts') ? getComputedStyle(document.getElementById('unniOtherProducts')).display!=='none' : false,
      note2Preview:document.getElementById('note2PreviewCard')?.innerText||'',
      paywall:document.getElementById('lockedOverlay')?.innerText||'',
      paywallNextTeaser:document.getElementById('paywallNextTeaser')?.innerText||'',
      paywallFeatureCount:document.querySelectorAll('#payBoxFeatures > div').length,
      paywallVisible:document.getElementById('lockedOverlay') ? getComputedStyle(document.getElementById('lockedOverlay')).display!=='none' : false,
      paywallPrice:(()=>{
        const badge=document.getElementById('paywallPriceBadge');
        const amount=document.getElementById('paywallPriceAmount');
        return {
          badge:badge?.className||'',
          amount:amount?.className||'',
          text:amount?.innerText||'',
        };
      })(),
      paywallTurn:(()=>{
        const el=document.querySelector('#note2PreviewCard .note-preview-continuation');
        if(!el) return null;
        const cs=getComputedStyle(el);
        const before=getComputedStyle(el,'::before');
        return {
          radius:cs.borderRadius||'',
          borderLeft:parseFloat(cs.borderLeftWidth||'0'),
          bg:cs.backgroundImage||cs.backgroundColor||'',
          font:parseFloat(getComputedStyle(el.querySelector('p')).fontSize||'0'),
          before:before.content||'',
          text:el.innerText.trim(),
        };
      })(),
      funExtrasDisplay:document.getElementById('resultFunExtras') ? getComputedStyle(document.getElementById('resultFunExtras')).display : '',
      shareActionsDisplay:document.getElementById('resultShareActions') ? getComputedStyle(document.getElementById('resultShareActions')).display : '',
      switchCount:document.querySelectorAll('#sisterSwitchCard').length,
      badges:notes.map(n=>n.badge||''),
      resultGreeting:document.getElementById('resultSisterGreeting')?.innerText||'',
      resultBadge:document.getElementById('resultModeBadge')?.innerText||'',
      hierarchy:{
        oneLineBeforeThreeLine:(document.getElementById('sazuCharacterTitle').compareDocumentPosition(document.getElementById('manualBulletList')) & Node.DOCUMENT_POSITION_FOLLOWING)!==0,
        threeLineBeforeMbti:(document.getElementById('manualBulletList').compareDocumentPosition(document.getElementById('gradeSection')) & Node.DOCUMENT_POSITION_FOLLOWING)!==0,
        mbtiBeforeChem:(document.getElementById('gradeSection').compareDocumentPosition(document.getElementById('chemBestCard')) & Node.DOCUMENT_POSITION_FOLLOWING)!==0,
        ohengBeforeNotes:(document.getElementById('resultOhengCard').compareDocumentPosition(document.getElementById('consultationNotesShell')) & Node.DOCUMENT_POSITION_FOLLOWING)!==0,
        notesBeforeMbti:(document.getElementById('consultationNotesShell').compareDocumentPosition(document.getElementById('gradeSection')) & Node.DOCUMENT_POSITION_FOLLOWING)!==0,
        notesBeforeShare:(document.getElementById('consultationNotesShell').compareDocumentPosition(document.getElementById('resultShareActions')) & Node.DOCUMENT_POSITION_FOLLOWING)!==0,
        shareBeforeProducts:document.getElementById('unniProductLadder')
          ? (document.getElementById('resultShareActions').compareDocumentPosition(document.getElementById('unniProductLadder')) & Node.DOCUMENT_POSITION_FOLLOWING)!==0
          : true,
        mbtiSize:parseFloat(getComputedStyle(document.getElementById('resultBigMbti')).fontSize||'0'),
        extrasOpen:document.getElementById('resultFunExtras')?.open===true,
        firstLook:document.getElementById('resultFirstLookLabel')?.innerText||'',
        concernHandoff:document.getElementById('resultConcernHandoffText')?.innerText||'',
        shareText:document.getElementById('mainShareBtnText')?.innerText||'',
        shareLead:document.getElementById('resultShareLead')?.innerText||'',
        reAnalyzeSub:document.getElementById('reAnalyzeSubText')?.innerText||'',
        freshAnalysisText:document.getElementById('freshAnalysisBtnText')?.innerText||'',
      },
      memoLayout:(()=>{
        const shell=document.getElementById('consultationNotesShell');
        const paper=document.getElementById('consultationNotesPaper');
        const note=document.querySelector('#notesListContainer .note-editorial');
        const metaRight=document.querySelector('#consultationNotesHeader>div:first-child>span:last-child');
        const sr=shell?.getBoundingClientRect();
        const pr=paper?.getBoundingClientRect();
        const nr=note?.getBoundingClientRect();
        const ns=note?getComputedStyle(note):null;
        return {
          viewport:document.documentElement.clientWidth,
          shell:sr?{left:sr.left,right:sr.right,width:sr.width}:null,
          paper:pr?{left:pr.left,right:pr.right,width:pr.width}:null,
          note:nr?{left:nr.left,right:nr.right,width:nr.width}:null,
          noteRadius:ns?.borderRadius||'',
          noteBackground:ns?.backgroundColor||'',
          metaRightDisplay:metaRight?getComputedStyle(metaRight).display:'',
          metaRightText:metaRight?.innerText||'',
          overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth,
        };
      })(),
    };
  },mode);
  r.resultLayout=await resultLayoutSnapshot(page);
  assertResultLayout(r.resultLayout,mode+' primary result');
  assert(r.noteV2Audit?.version==='3.2.1'&&r.noteV2Audit?.structureFingerprint,mode+' NOTE v3 audit missing');
  assert(r.noteV2Audit?.genericClusterDependency===false,mode+' generic cluster dependency returned');
  assert(Array.isArray(r.noteV2Audit?.claims)&&r.noteV2Audit.claims.length===6,mode+' six causal claims missing');
  for(const claim of r.noteV2Audit.claims) assert(claim.ditianRuleIds?.filter(Boolean).length&&claim.zipingRuleIds?.filter(Boolean).length&&claim.noteSentence,mode+' claim provenance missing');
  assert(r.n1.length>=140&&r.n1.length<=1200,mode+' NOTE1 classical-fusion size drift '+r.n1.length);
  assert(r.n2.length>=140&&r.n2.length<=1200,mode+' NOTE2 classical-fusion size drift '+r.n2.length);
  assert(r.n4.length>=150&&r.n4.length<=1400,mode+' NOTE4 classical-fusion action size drift '+r.n4.length);
  assert(r.n5.length>=100&&r.n5.length<=760,mode+' NOTE5 domain-fit size drift '+r.n5.length);
  assert(/시작|보통/.test(r.n2)&&/갈림길|여기서|그리고/.test(r.n2),mode+' NOTE2 causal chain missing '+r.n2);
  assert(r.note6Timing?.concernSituation,mode+' NOTE6 situation metadata missing');
  assert(norm(r.note6Timing?.firstBody)!==norm(r.note6Timing?.secondBody),mode+' NOTE6 timing roles duplicated');
  if (mode==='F') assert(r.oheng.includes('겉으로 가장 많이 보여')&&r.oheng.includes('눈에 보이는 오행 분포')&&r.oheng.includes('계절·뿌리·위치')&&r.oheng.includes('아래 비밀 메모')&&!/제일 강해|약한 편/.test(r.oheng)&&!/\d+%/.test(r.oheng)&&r.oheng.length<=260,'F oheng raw-count wording '+r.oheng);
  if (mode==='T') assert(r.oheng.includes('비중이 가장 커')&&r.oheng.includes('오행 개수 기준 분포')&&r.oheng.includes('실제 세력 강약')&&r.oheng.includes('아래 비밀 메모')&&!/제일 강해|약한 편/.test(r.oheng)&&!/\d+%/.test(r.oheng)&&r.oheng.length<=235,'T oheng raw-count wording '+r.oheng);
  assert(!/[나무불흙쇠물]\)/.test(r.oheng+r.dayMasterTag),'old parenthetical five-element wording remains '+JSON.stringify({oheng:r.oheng,day:r.dayMasterTag}));
  if(r.sourceFreeLaunch){
    assert(r.count===4&&r.visible===4&&!r.otherToggle&&r.otherVisible,'free-launch should show all four premium products immediately '+JSON.stringify(r));
  }else{
    assert(r.count===0&&r.visible===0&&!r.catalog,'premium upsells must stay hidden before the 990 won unlock '+JSON.stringify(r));
    assert(/NOTE 0?2/.test(r.note2Preview)&&r.paywallVisible,'NOTE2 teaser/paywall missing '+JSON.stringify({preview:r.note2Preview,paywall:r.paywall}));
    if(mode==='F') assert(r.paywall.includes('로아 언니 · 여기서 하나만 더 보자')&&r.paywall.includes('지금 연애에서 기준을 맞출 때 반복되는 흐름이 조금 보여')&&r.paywall.includes('언니, 그것도 봐줘'),'live F conversion paywall drift '+r.paywall);
    if(mode==='T') assert(r.paywall.includes('서아 언니 · 마지막 기준만 보면 돼')&&r.paywall.includes('부하 제거')&&r.paywall.includes('응, 끝까지 봐줘'),'T 990 paywall sister header should be restored '+r.paywall);
    assert(r.paywall.includes('990원')&&r.paywallFeatureCount===3&&r.paywallNextTeaser.length>=12,'compact 990 paywall or locked-content teaser missing '+JSON.stringify({paywall:r.paywall,teaser:r.paywallNextTeaser,count:r.paywallFeatureCount}));
    if(mode==='F') assert(r.paywallPrice.text==='990원'&&r.paywallPrice.badge.trim()==='shrink-0 text-right'&&!/rounded|bg-|border/.test(r.paywallPrice.badge)&&r.paywallPrice.amount.includes('rose-600'),'F 990 simple price display drift '+JSON.stringify(r.paywallPrice));
    if(mode==='T') assert(r.paywallPrice.text==='990원'&&r.paywallPrice.badge.trim()==='shrink-0 text-right'&&!/rounded|bg-|border/.test(r.paywallPrice.badge)&&r.paywallPrice.amount.includes('sky-600'),'T 990 simple price display drift '+JSON.stringify(r.paywallPrice));
    assert(
      r.paywallTurn &&
      r.paywallTurn.borderLeft>=3 &&
      r.paywallTurn.font>=12.5 &&
      (!r.paywallTurn.before || r.paywallTurn.before==='none' || r.paywallTurn.before==='normal') &&
      /이제 (중요한 건|핵심은) 하나야/.test(r.paywallTurn.text) &&
      /어디서 끊고, 뭘 바꿀지/.test(r.paywallTurn.text),
      'NOTE2 conversion turn should be one compact impact line '+JSON.stringify(r.paywallTurn)
    );
    assert(r.paywall.includes('NOTE2 다음부터 NOTE6까지')&&!/오픈 체험가/.test(r.paywall),'990 won unlock scope or stale sale copy drift '+r.paywall);
    assert(r.funExtrasDisplay==='none'&&r.shareActionsDisplay==='none','locked 990 flow should hide MBTI/share diversions '+JSON.stringify({fun:r.funExtrasDisplay,share:r.shareActionsDisplay}));
  }
  if(r.catalog){
    assert(r.recommendedReason.length>=10&&r.visible===4&&!r.catalog.includes('다른 방향 3개도 보기'),'all premium products should stay visible under one recommendation '+JSON.stringify({visible:r.visible,catalog:r.catalog}));
    assert(r.catalog.includes('상대 사주까지 겹쳐야 나오는')||r.catalog.includes('나 전체 구조 · 영역 연결 · 5년 흐름'),'premium catalog does not explain product value boundary');
    assert(!r.catalog.includes('언니라면 이걸 먼저 이어서 볼 것 같아')&&!r.catalog.includes('다음으로 볼 가치는 이게 제일 커'),'premium catalog headline is still over-explaining');
    assert(!/16챕터|12챕터|NOTE 36/.test(r.catalog),'product catalog still uses technical volume labels '+r.catalog);
  }
  assert(r.switchCount===0,'bottom F/T CTA remains');
  assert(
    r.hierarchy.oneLineBeforeThreeLine &&
    r.hierarchy.threeLineBeforeMbti &&
    r.hierarchy.ohengBeforeNotes &&
    r.hierarchy.notesBeforeMbti &&
    r.hierarchy.mbtiBeforeChem &&
    r.hierarchy.notesBeforeShare &&
    r.hierarchy.shareBeforeProducts &&
    r.hierarchy.mbtiSize<=38 &&
    !r.hierarchy.extrasOpen,
    'consultation-first result hierarchy is wrong '+JSON.stringify(r.hierarchy)
  );
  if(mode==='F') assert(
    r.hierarchy.firstLook.includes('언니가 먼저 본 너') &&
    r.hierarchy.concernHandoff.includes('아까 말한 고민 있지?') &&
    r.hierarchy.shareText.includes('인스타 스토리') &&
    r.hierarchy.shareLead.includes('상담 기록') &&
    r.hierarchy.reAnalyzeSub.includes('새 고민만 고르면 돼') &&
    r.hierarchy.freshAnalysisText.includes('다른 사람도 봐줄까'),
    'F counseling handoff disappeared '+JSON.stringify(r.hierarchy)
  );
  if(mode==='T') assert(
    r.hierarchy.firstLook.includes('언니가 먼저 정리한 너') &&
    r.hierarchy.concernHandoff.includes('아까 말한 고민에선 이 부분이 핵심이야') &&
    r.hierarchy.shareText.includes('인스타 스토리') &&
    r.hierarchy.shareLead.includes('상담 기록') &&
    r.hierarchy.reAnalyzeSub.includes('새 고민만 고르면 돼') &&
    r.hierarchy.freshAnalysisText.includes('다른 사람 사주 새로 보기'),
    'T counseling handoff disappeared '+JSON.stringify(r.hierarchy)
  );
  assert(
    r.memoLayout.shell &&
    r.memoLayout.paper &&
    r.memoLayout.note &&
    r.memoLayout.shell.width<=386.5 &&
    Math.abs(r.memoLayout.shell.left-(r.memoLayout.viewport-r.memoLayout.shell.right))<=2 &&
    r.memoLayout.note.left>=r.memoLayout.paper.left-1 &&
    r.memoLayout.note.right<=r.memoLayout.paper.right+1 &&
    r.memoLayout.noteRadius==='0px' &&
    r.memoLayout.metaRightDisplay!=='none' &&
    r.memoLayout.metaRightText.includes('1:1 맞춤 상담 기록') &&
    !r.memoLayout.overflow,
    'consultation memo containment drift '+JSON.stringify(r.memoLayout)
  );
  assert(!r.badges.some(x=>x.includes('·')||x.includes('사람 필터')||x.includes('7일 처방')||x.includes('놓친 포인트')),
    'old NOTE badge wording remains '+JSON.stringify(r.badges));
  assert(!/[💕🥺💌🌸🧊]/u.test(r.resultGreeting+r.resultBadge),'result persona still depends on decorative emoji '+JSON.stringify({greeting:r.resultGreeting,badge:r.resultBadge}));
  if (mode==='F') assert(r.resultGreeting.includes('언니가 보니까')&&r.resultGreeting.includes('제일 먼저 눈에 들어오는 건 이거야')&&!r.resultGreeting.includes('ㅎㅎ')&&r.resultGreeting.length<=90,'F result warm close-sister intro drift '+r.resultGreeting);
  if (mode==='T') assert(r.resultGreeting.includes('먼저 봐야 할 건 이거야')&&r.resultGreeting.length<=80,'T result concise direct-care intro drift '+r.resultGreeting);
  assert(!r.resultGreeting.includes('ㅎㅎ'),'repeated laughter remains in result '+r.resultGreeting);
  if (mode==='T') assert(!/징징|살인 충동|사람 취급|멍청한 질문/.test(r.resultGreeting+r.catalog),'harsh T voice leaked into live journey '+JSON.stringify({greeting:r.resultGreeting,catalog:r.catalog}));
  return r;
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
  await deployed(page);
  await enter(page,'F','love','relationship');
  const f=await inspect(page,'F');
  if(f.sourceFreeLaunch){
    assert(await page.locator('#unniShowOtherProducts').count()===0,'folded alternatives toggle should be removed');
    assert(await page.locator('#unniOtherProducts').isVisible(),'premium alternatives should be immediately visible');
    const visibleAlternatives=await page.locator('#unniOtherProducts [data-unni-product]').evaluateAll(els=>els.filter(el=>el.offsetParent!==null).length);
    assert(visibleAlternatives===3,'all three alternative products should be visible, got '+visibleAlternatives);
  }

  if(!f.sourceFreeLaunch){
    await page.evaluate(()=>unlockFullReport(null,true));
    await page.waitForSelector('#resultShareActions',{state:'visible',timeout:5000});
    assert(await page.locator('#resultFunExtras').isVisible(),'fun extras should return after 990 unlock');
    assert(await page.locator('#resultShareActions').isVisible(),'share action should return after 990 unlock');
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
    note5Presentation:(()=>{
      const note=document.querySelector('#notesListContainer [data-note-role="05"]');
      return {
        good:note?.querySelector('.note-fit-good .note-fit-copy')?.innerText?.trim()||'',
        drain:note?.querySelector('.note-fit-drain .note-fit-copy')?.innerText?.trim()||'',
        criterion:note?.querySelector('.note-fit-criterion .note-fit-copy')?.innerText?.trim()||'',
        labels:[...note?.querySelectorAll('.note-fit-kicker,.note-fit-criterion-label')||[]].map(x=>x.innerText.trim()),
      };
    })(),
  }));
  assert(postUnlock.cards===6&&!postUnlock.preview&&postUnlock.catalogAfterNotes,'990 unlock must reveal NOTE2-6 before post-report upsells '+JSON.stringify(postUnlock));
  assert(
    postUnlock.note5Presentation.good.length>=8 &&
    postUnlock.note5Presentation.drain.length>=8 &&
    postUnlock.note5Presentation.criterion.length>=8 &&
    postUnlock.note5Presentation.labels.includes('잘 맞는 쪽') &&
    postUnlock.note5Presentation.labels.includes('오래 두면 소모되는 쪽') &&
    postUnlock.note5Presentation.labels.includes('마지막 판단 기준'),
    'NOTE5 three-part decision presentation missing '+JSON.stringify(postUnlock.note5Presentation)
  );
  assert(postUnlock.reasonCount===1&&postUnlock.reasonText.length>=10,'premium recommendation should keep one compact reason '+JSON.stringify(postUnlock));
  assert(!postUnlock.catalogText.includes('언니라면 이걸 먼저 이어서 볼 것 같아')&&!postUnlock.catalogText.includes('다음으로 볼 가치는 이게 제일 커')&&!postUnlock.catalogText.includes('방금 같이 본 얘기는 반복하지 않고')&&!postUnlock.catalogText.includes('방금 본 내용과 겹치는 건 빼고'),
    'premium recommendation still renders marketing-style preamble '+postUnlock.catalogText);

  await clickCatalogProduct(page,'compatibility');
  await page.waitForSelector('#unniProductModal',{state:'visible'});
  assert((await page.locator('#unniProductBadge').innerText()).includes('로아 언니'),'F premium modal lost Roa continuity');
  const compatibilitySetup=await page.locator('#unniProductModal').innerText();
  assert(compatibilitySetup.includes('이번엔 상대 사주도 같이 놓고 볼게.'),'F compatibility setup lost Roa voice');
  assert(compatibilitySetup.includes('양력')&&compatibilitySetup.includes('음력')&&!compatibilitySetup.includes('양력 생일')&&!compatibilitySetup.includes('음력 생일'),'live compatibility calendar labels are not simplified');
  assert(compatibilitySetup.includes('자시 · 23:30~01:29')&&compatibilitySetup.includes('(시간 모름)'),'live compatibility manse-corrected time UI missing');
  assert(await page.locator('#partnerTimeBranch option').count()===13,'compatibility 12-branch selector missing');
  assert(await page.locator('#partnerTimeDirectToggle').isVisible(),'compatibility direct-time checkbox missing');
  assert(await page.locator('#partnerTimeInput').isHidden(),'compatibility direct-time field should be hidden by default');
  await page.check('#partnerTimeDirectToggle');
  assert(await page.locator('#partnerTimeInput').isVisible(),'compatibility direct-time field did not open');
  assert((await page.locator('#partnerTimeInput').getAttribute('placeholder'))==='예: 오후 1:30 → 1330','live compatibility direct-time placeholder missing');
  await page.uncheck('#partnerTimeDirectToggle');
  assert(!compatibilitySetup.includes('태어난 시간을 몰라요')&&!compatibilitySetup.includes('정확한 분을 몰라도')&&!compatibilitySetup.includes('오전/오후')&&!compatibilitySetup.includes('몇 분'),'old compatibility time helper UI remains');
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
      : productActionText.includes('내 전체 사주판 보기 · 4,900원'),
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
  await page.waitForFunction(()=>document.querySelectorAll('#unniProductBody section').length===12,null,{timeout:10000});
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
    if(mode==='F') assert(
      voice.includes('아, 왔구나. 편하게 적어줘.') &&
      voice.includes('언니가 하나씩 잘 봐줄게.'),
      '360px F voice drift '+voice
    );
    else assert(
      voice.includes('왔어. 적어줘.') &&
      voice.includes('핵심부터 바로 볼게.'),
      '360px T voice drift '+voice
    );
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
    f:[f.n1.length,f.n2.length,f.n4.length,f.n5.length],
    t:[tr.n1.length,tr.n2.length,tr.n4.length,tr.n5.length],
    expectedEntitlement400s:httpErrors.filter(expectedEntitlementFailure).length+thttpErrors.filter(expectedEntitlementFailure).length,
    pdfRemoved:true
  }));
  await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
