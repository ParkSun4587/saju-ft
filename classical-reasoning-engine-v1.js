(function (global) {
  "use strict";

  const VERSION="1.1.0";
  const ELEMENTS=["mok","hwa","to","geum","su"];
  const GAN_ELEMENT={甲:"mok",乙:"mok",丙:"hwa",丁:"hwa",戊:"to",己:"to",庚:"geum",辛:"geum",壬:"su",癸:"su"};
  const ELEMENT_KR={mok:"목",hwa:"화",to:"토",geum:"금",su:"수"};
  const GROUP_KR={
    self:"자기 힘과 경계",print:"받쳐주고 회복시키는 힘",output:"표현·산출로 빠져나가는 힘",
    wealth:"현실 결과·자원을 다루는 힘",officer:"기준·책임·압박으로 들어오는 힘",unknown:"정리되지 않은 힘",
  };
  const TEN_GOD_GROUP={
    비견:"self",겁재:"self",정인:"print",편인:"print",식신:"output",상관:"output",
    정재:"wealth",편재:"wealth",정관:"officer",편관:"officer",
  };
  const POSITIONS=["year","month","day","hour"];
  const HIDDEN_ORDER=["본기","중기","여기"];

  const STEM_COMBINE={
    "甲己":"to","己甲":"to","乙庚":"geum","庚乙":"geum","丙辛":"su","辛丙":"su","丁壬":"mok","壬丁":"mok","戊癸":"hwa","癸戊":"hwa",
  };
  function pairSet(pairs){
    const s=new Set();
    for(const [a,b] of pairs){s.add(a+b);s.add(b+a);}
    return s;
  }
  const BRANCH_COMBINE=pairSet([["子","丑"],["寅","亥"],["卯","戌"],["辰","酉"],["巳","申"],["午","未"]]);
  const CLASH=pairSet([["子","午"],["丑","未"],["寅","申"],["卯","酉"],["辰","戌"],["巳","亥"]]);
  const HARM=pairSet([["子","未"],["丑","午"],["寅","巳"],["卯","辰"],["申","亥"],["酉","戌"]]);
  const BREAK=pairSet([["子","酉"],["丑","辰"],["寅","亥"],["卯","午"],["巳","申"],["未","戌"]]);
  const PUNISH=pairSet([["寅","巳"],["巳","申"],["申","寅"],["丑","戌"],["戌","未"],["未","丑"],["子","卯"]]);
  const SELF_PUNISH=new Set(["辰","午","酉","亥"]);
  const TRIADS=[
    {element:"mok",branches:["亥","卯","未"]},
    {element:"hwa",branches:["寅","午","戌"]},
    {element:"geum",branches:["巳","酉","丑"]},
    {element:"su",branches:["申","子","辰"]},
  ];

  function nextElement(e){return ELEMENTS[(ELEMENTS.indexOf(e)+1)%5];}
  function prevElement(e){return ELEMENTS[(ELEMENTS.indexOf(e)+4)%5];}
  function controls(e){return ELEMENTS[(ELEMENTS.indexOf(e)+2)%5];}
  function controllerOf(e){return ELEMENTS[(ELEMENTS.indexOf(e)+3)%5];}
  function stableHash(input){
    const s=JSON.stringify(input||{});let h=2166136261;
    for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}
    return (h>>>0).toString(16).padStart(8,"0");
  }
  function round(v,d=3){
    const n=Number(v);if(!Number.isFinite(n))return null;
    const p=Math.pow(10,d);return Math.round(n*p)/p;
  }
  function uniq(arr){return [...new Set((arr||[]).filter(Boolean))];}
  function tenGod(dayGan,targetGan){
    const fn=global.__CLASSICAL_ENGINE_V2__?.tenGod;
    return typeof fn==="function"?fn(dayGan,targetGan):"";
  }
  function tenGodElement(dayGan,god){
    const fn=global.__CLASSICAL_ENGINE_V2__?.tenGodElement;
    return typeof fn==="function"?fn(dayGan,god):null;
  }
  function relationGroup(dayGan,targetGan){
    const fn=global.__CLASSICAL_ENGINE_V2__?.relationGroup;
    return typeof fn==="function"?fn(dayGan,targetGan):"unknown";
  }
  function groupForGod(god){return TEN_GOD_GROUP[god]||"unknown";}
  function hiddenMap(){return global.__CLASSICAL_ENGINE_V2__?.hidden||{};}
  function hiddenRatios(){return global.__CLASSICAL_ENGINE_V2__?.hiddenRatios||{};}
  function branchWeights(){return global.__CLASSICAL_ENGINE_V2__?.branchWeights||{};}
  function stemWeights(){return global.__CLASSICAL_ENGINE_V2__?.stemWeights||{};}
  function ganElement(gan){return global.__CLASSICAL_ENGINE_V2__?.ganElement?.[gan]||GAN_ELEMENT[gan]||null;}

  function ranking(obj){
    const rows=ELEMENTS.map(element=>({element,force:Number(obj?.[element]||0)}));
    const total=rows.reduce((a,r)=>a+r.force,0)||1;
    rows.forEach(r=>r.share=r.force/total);
    rows.sort((a,b)=>b.force-a.force||ELEMENTS.indexOf(a.element)-ELEMENTS.indexOf(b.element));
    return rows;
  }

  function branchPairRows(pillars,set,type){
    const out=[];
    for(let i=0;i<POSITIONS.length;i++){
      const aPos=POSITIONS[i],a=pillars?.[aPos];
      if(!a?.zhi)continue;
      for(let j=i+1;j<POSITIONS.length;j++){
        const bPos=POSITIONS[j],b=pillars?.[bPos];
        if(!b?.zhi)continue;
        if(set.has(a.zhi+b.zhi))out.push({type,aPos,bPos,aZhi:a.zhi,bZhi:b.zhi});
      }
    }
    return out;
  }

  function detectRelations(pillars){
    const stemCombines=[];
    for(let i=0;i<POSITIONS.length;i++){
      const aPos=POSITIONS[i],a=pillars?.[aPos];
      if(!a?.gan)continue;
      for(let j=i+1;j<POSITIONS.length;j++){
        const bPos=POSITIONS[j],b=pillars?.[bPos];
        if(!b?.gan)continue;
        const key=a.gan+b.gan;
        if(STEM_COMBINE[key]) stemCombines.push({type:"stem-combine",aPos,bPos,aGan:a.gan,bGan:b.gan,targetElement:STEM_COMBINE[key],transformationStatus:"not-evaluated"});
      }
    }
    const branchCombines=branchPairRows(pillars,BRANCH_COMBINE,"combine");
    const clashes=branchPairRows(pillars,CLASH,"clash");
    const harms=branchPairRows(pillars,HARM,"harm");
    const breaks=branchPairRows(pillars,BREAK,"break");
    const punishments=branchPairRows(pillars,PUNISH,"punishment");
    for(let i=0;i<POSITIONS.length;i++){
      const aPos=POSITIONS[i],a=pillars?.[aPos];if(!a?.zhi||!SELF_PUNISH.has(a.zhi))continue;
      for(let j=i+1;j<POSITIONS.length;j++){
        const bPos=POSITIONS[j],b=pillars?.[bPos];
        if(b?.zhi===a.zhi)punishments.push({type:"self-punishment",aPos,bPos,aZhi:a.zhi,bZhi:b.zhi});
      }
    }
    const branches=POSITIONS.map(p=>pillars?.[p]?.zhi).filter(Boolean);
    const branchTriads=TRIADS.filter(t=>t.branches.every(z=>branches.includes(z))).map(t=>({type:"triad",element:t.element,branches:t.branches.slice(),transformationStatus:"not-evaluated"}));
    const branchHalfTriads=TRIADS.map(t=>({type:"half-triad",element:t.element,branches:t.branches.filter(z=>branches.includes(z)),transformationStatus:"not-evaluated"}))
      .filter(t=>t.branches.length===2);
    const allBranchRelations=[...branchCombines,...clashes,...harms,...breaks,...punishments];
    const monthRelations=allBranchRelations.filter(x=>x.aPos==="month"||x.bPos==="month");
    return {
      stemCombines,branchCombines,branchTriads,branchHalfTriads,clashes,harms,breaks,punishments,
      monthRelations,monthClashes:clashes.filter(x=>x.aPos==="month"||x.bPos==="month"),
    };
  }

  function aggregateGroupForces(strength){
    const coeff={self:1,print:0.84,output:0.62,wealth:0.74,officer:0.98};
    const out={self:0,print:0,output:0,wealth:0,officer:0,unknown:0};
    for(const row of(strength?.components||[])){
      const g=row?.group||"unknown";out[g]=(out[g]||0)+Number(row?.amount||0)*(coeff[g]||1);
    }
    for(const k of Object.keys(out))out[k]=round(out[k],3)||0;
    return out;
  }

  function buildGodOccurrences(pillars,dayGan){
    const out=[];
    const hidden=hiddenMap(),ratiosMap=hiddenRatios(),bw=branchWeights(),sw=stemWeights();
    for(const pos of POSITIONS){
      const p=pillars?.[pos];if(!p)continue;
      if(pos!=="day"&&p.gan){
        const god=tenGod(dayGan,p.gan);
        if(god)out.push({pillar:pos,position:"천간",sourceType:"visible-stem",gan:p.gan,god,group:groupForGod(god),weight:Number(sw[pos]||0.8),visible:true});
      }
      const hs=hidden[p.zhi]||[],rs=ratiosMap[hs.length]||[];
      hs.forEach((gan,i)=>{
        const god=tenGod(dayGan,gan);if(!god)return;
        out.push({
          pillar:pos,position:"지지",sourceType:i===0?"branch-main":"hidden-stem",hiddenOrder:HIDDEN_ORDER[i]||`지장간${i+1}`,
          zhi:p.zhi,gan,god,group:groupForGod(god),ratio:Number(rs[i]||0),weight:round(Number(bw[pos]||1)*Number(rs[i]||0),3),visible:false,
        });
      });
    }
    return out;
  }

  function findBridge(influence){
    const total=ELEMENTS.reduce((a,e)=>a+Number(influence?.[e]||0),0)||1;
    const candidates=[];
    for(const controller of ELEMENTS){
      const controlled=controls(controller);
      const cf=Number(influence?.[controller]||0),tf=Number(influence?.[controlled]||0);
      if(!(cf>0&&tf>0))continue;
      const bridge=nextElement(controller),bf=Number(influence?.[bridge]||0);
      candidates.push({
        controller,controlled,bridge,controllerForce:cf,controlledForce:tf,bridgeForce:bf,
        controllerShare:cf/total,controlledShare:tf/total,bridgeShare:bf/total,
        oppositionStrength:Math.min(cf,tf),
      });
    }
    candidates.sort((a,b)=>b.oppositionStrength-a.oppositionStrength||(b.controllerForce+b.controlledForce)-(a.controllerForce+a.controlledForce));
    const best=candidates[0]||null;
    return best?{...best,pressure:best.controllerForce+best.controlledForce,candidates}:null;
  }

  function buildContext(data){
    const profile=data?.integratedSajuProfile||(typeof global.buildIntegratedSajuProfile==="function"?global.buildIntegratedSajuProfile(data||{}):null);
    if(data&&profile)data.integratedSajuProfile=profile;
    const pillars=profile?.pillars||data?.pillars||{};
    const dayGan=pillars?.day?.gan||data?.dayGan||"";
    const dayElement=ganElement(dayGan)||data?.dayOheng||"to";
    const strength=profile?.strength||data?.strengthDetail||{};
    const influence=profile?.elements?.influence||data?.elementProfiles?.influence||{};
    const raw=profile?.elements?.raw||data?.elementProfiles?.raw||data?.elements||{};
    const relations=detectRelations(pillars);
    const godOccurrences=buildGodOccurrences(pillars,dayGan);
    const visibleGodOccurrences=godOccurrences.filter(x=>x.visible);
    const hiddenGodOccurrences=godOccurrences.filter(x=>!x.visible);
    const visibleGods=new Set(visibleGodOccurrences.map(x=>x.god));
    const allGodCounts={};
    for(const x of godOccurrences)allGodCounts[x.god]=(allGodCounts[x.god]||0)+1;
    const monthHidden=hiddenGodOccurrences.filter(x=>x.pillar==="month");
    const ctx={
      data,profile,pillars,dayGan,dayElement,strength,influence,raw,
      structure:profile?.structure||{},
      elementRanking:ranking(influence),rawRanking:ranking(raw),
      rawInfluenceMismatch:ranking(influence)?.[0]?.element!==ranking(raw)?.[0]?.element||ranking(influence)?.at(-1)?.element!==ranking(raw)?.at(-1)?.element,
      groupForces:aggregateGroupForces(strength),
      bridge:findBridge(influence),
      godOccurrences,visibleGodOccurrences,hiddenGodOccurrences,visibleGods,allGodCounts,monthHidden,
      ...relations,
      monthBranch:pillars?.month?.zhi||profile?.classical?.japyeong?.monthBranch||null,
    };
    return ctx;
  }

  function sourceDetails(ids,pack){
    const src=pack?.sources||{};return(ids||[]).map(id=>({id,...(src[id]||{})}));
  }
  function runRulePack(rulePack,sourcePack,ctx){
    const out=[];
    for(const rule of(rulePack?.rules||[])){
      try{
        if(typeof rule.applies==="function"&&!rule.applies(ctx))continue;
        const row=typeof rule.evaluate==="function"?rule.evaluate(ctx):null;
        if(!row)continue;
        const resolvedSourceIds=(row.sourceIds||rule.sourceIds||[]).filter(Boolean);
        out.push({...row,id:row.id||rule.id,kind:row.kind||rule.kind||"unknown",sourceIds:resolvedSourceIds,sources:sourceDetails(resolvedSourceIds,sourcePack)});
      }catch(err){
        out.push({id:rule.id,sourceIds:rule.sourceIds||[],sources:sourceDetails(rule.sourceIds||[],sourcePack),kind:"rule-error",conclusion:"규칙 실행 오류로 이 판단은 사용하지 않는다.",facts:{error:String(err?.message||err)},conditions:[],exceptions:["rule-error"],implementationStatus:"error"});
      }
    }
    return out;
  }
  function byKind(rows,kind){return rows.find(r=>r.kind===kind)||null;}
  function mainZipingFinding(rows){
    return rows.find(r=>r.id!=="ZZ_MONTH_101"&&r.kind==="gyeok"&&r.implementationStatus!=="unimplemented")
      ||rows.find(r=>r.id==="ZZ_MONTH_101")||null;
  }
  function unionGods(rows,key){return uniq(rows.flatMap(r=>Array.isArray(r?.[key])?r[key]:[]));}
  function groupElement(dayElement,group){
    if(group==="self")return dayElement;
    if(group==="print")return prevElement(dayElement);
    if(group==="output")return nextElement(dayElement);
    if(group==="wealth")return controls(dayElement);
    if(group==="officer")return controllerOf(dayElement);
    return null;
  }

  function buildPrescription(ctx,ditianRows,zipingRows){
    const strength=byKind(ditianRows,"strength"), regulation=byKind(ditianRows,"regulation"), bridge=byKind(ditianRows,"bridge");
    const zMain=mainZipingFinding(zipingRows);
    const helpful=unionGods(zipingRows,"supportGods"), rescue=unionGods(zipingRows,"rescueGods"), harmful=unionGods(zipingRows,"harmGods");
    const ditianOperations=regulation?.facts?.operations||[];
    const ditianElements=[];
    if(bridge?.facts?.bridge&&bridge.facts.status==="missing")ditianElements.push(bridge.facts.bridge);
    if(strength?.facts?.verdict==="신약"){
      ditianElements.push(groupElement(ctx.dayElement,"print"),groupElement(ctx.dayElement,"self"));
    }else if(strength?.facts?.verdict==="신강"){
      ditianElements.push(groupElement(ctx.dayElement,"output"),groupElement(ctx.dayElement,"officer"));
    }else if(bridge?.facts?.bridge){
      ditianElements.push(bridge.facts.bridge);
    }
    const zipingGods=uniq([...rescue,...helpful]);
    const zipingElements=uniq(zipingGods.map(g=>tenGodElement(ctx.dayGan,g)));
    const harmfulElements=uniq(harmful.map(g=>tenGodElement(ctx.dayGan,g)));
    const dEls=uniq(ditianElements), overlap=dEls.filter(e=>zipingElements.includes(e));
    const conflicts=[];
    for(const god of zipingGods){
      const group=groupForGod(god);
      if(strength?.facts?.verdict==="신약"&&["output","wealth","officer"].includes(group)){
        conflicts.push({type:"body-vs-structure",god,group,reason:"격을 살리는 역할이지만 약한 일간에는 먼저 비용이 될 수 있음",priority:"생조 또는 통관으로 감당력을 확보한 뒤 격의 역할을 사용"});
      }
      if(strength?.facts?.verdict==="신강"&&["self","print"].includes(group)){
        conflicts.push({type:"body-vs-structure",god,group,reason:"격을 살리는 역할이지만 이미 강한 일간을 더 받칠 수 있음",priority:"과한 부조 여부를 먼저 확인한 뒤 격의 보호 기능을 사용"});
      }
    }
    let sequence=[];
    let priorityPolicy="두 체계가 같은 방향이면 공통 작용을 우선한다.";
    if(overlap.length)sequence=overlap.map(e=>({source:"overlap",element:e,reason:"적천수의 필요한 작용과 자평진전의 격 보완이 일치"}));
    if(!sequence.length&&bridge?.facts?.bridge&&bridge.facts.status==="missing"){
      sequence.push({source:"ditian-bridge",element:bridge.facts.bridge,reason:"원국의 상극 흐름을 잇는 통관 기운이 비어 있음"});
    }
    if(!sequence.length)dEls.forEach(e=>sequence.push({source:"ditian",element:e,reason:"강약·기세 쪽에서 필요한 작용"}));
    zipingElements.filter(e=>!sequence.some(x=>x.element===e)).forEach(e=>sequence.push({source:"ziping",element:e,reason:"격의 성패·구응 쪽에서 필요한 작용"}));
    if(conflicts.length)priorityPolicy="두 체계를 평균내지 않고, 일간의 감당력·통관을 먼저 확인한 뒤 격의 성패 조건을 적용한다.";
    const evidenceStatus=strength&&regulation&&zMain?"sufficient":"insufficient-evidence";
    return {
      evidenceStatus,ditianOperations,ditianElements:dEls,zipingGods,zipingElements,harmfulGods:harmful,harmfulElements,
      overlapElements:overlap,conflicts,priorityPolicy,sequence:sequence.slice(0,4),
      compatibilityNote:"기존 balance.primary/secondary/avoid는 통합 프로필에만 보존하며 이 처방 순서에는 사용하지 않음",
    };
  }

  function buildCrossValidation(ctx,ditianRows,zipingRows){
    const strength=ctx.strength?.verdict||"중화";
    const zMain=mainZipingFinding(zipingRows);
    const helpful=unionGods(zipingRows,"supportGods"),rescue=unionGods(zipingRows,"rescueGods"),harmful=unionGods(zipingRows,"harmGods");
    const bridge=byKind(ditianRows,"bridge"),special=byKind(ditianRows,"special-structure"),root=byKind(ditianRows,"root"),pressure=byKind(ditianRows,"pressure");
    const prescription=buildPrescription(ctx,ditianRows,zipingRows);
    return {
      strength,rootQuality:root?.facts?.quality||null,pressureGroup:pressure?.facts?.group||null,
      pressureHuman:GROUP_KR[pressure?.facts?.group]||"",helpfulGods:helpful,rescueGods:rescue,harmfulGods:harmful,
      neededGroups:strength==="신약"?["print","self"]:strength==="신강"?["output","officer"]:[],
      bridgeElement:bridge?.facts?.bridge||ctx.bridge?.bridge||null,
      bridgeElementName:(bridge?.facts?.bridge||ctx.bridge?.bridge)?ELEMENT_KR[bridge?.facts?.bridge||ctx.bridge?.bridge]:"",
      bridgeStatus:bridge?.facts?.status||null,
      zipingState:zMain?.state||zMain?.facts?.state||"undetermined",zipingPath:zMain?.facts?.path||null,zipingConclusion:zMain?.conclusion||"",
      conflicts:prescription.conflicts,priorityPolicy:prescription.priorityPolicy,specialStructureStatus:special?.implementationStatus||"none",
      prescription,
    };
  }

  function actualRuleIds(rows,requested){
    const available=new Set(rows.filter(r=>r.implementationStatus!=="error").map(r=>r.id));
    return uniq((requested||[]).filter(id=>id&&available.has(id)));
  }
  function evidenceFor(rows,ids){
    const set=new Set(ids||[]);return rows.filter(r=>set.has(r.id));
  }
  function makeClaim(noteNum,rawFacts,ditianRows,zipingRows,dRequested,zRequested,causalSteps,conclusion){
    const ditianRuleIds=actualRuleIds(ditianRows,dRequested),zipingRuleIds=actualRuleIds(zipingRows,zRequested);
    const refs=[...evidenceFor(ditianRows,ditianRuleIds),...evidenceFor(zipingRows,zipingRuleIds)];
    const evidenceStatus=ditianRuleIds.length&&zipingRuleIds.length?"sufficient":"insufficient-evidence";
    return {
      id:`NOTE${noteNum}_claim_core`,noteNum,rawFacts,ditianRuleIds,zipingRuleIds,
      conditions:uniq(refs.flatMap(r=>r.conditions||[])),exceptions:uniq(refs.flatMap(r=>r.exceptions||[])),
      causalSteps:(causalSteps||[]).filter(Boolean),evidenceStatus,certainty:evidenceStatus==="sufficient"?"supported":"guarded",
      conclusion,noteSentence:null,
    };
  }

  function buildIntegratedClaims(ctx,ditianRows,zipingRows,cross){
    const strength=byKind(ditianRows,"strength"),season=byKind(ditianRows,"season-strength"),ground=byKind(ditianRows,"ground-strength"),
      party=byKind(ditianRows,"party-strength"),root=byKind(ditianRows,"root"),dominant=byKind(ditianRows,"flow"),flowChain=byKind(ditianRows,"flow-chain"),
      pressure=byKind(ditianRows,"pressure"),regulation=byKind(ditianRows,"regulation"),bridge=byKind(ditianRows,"bridge"),relations=byKind(ditianRows,"branch-relations");
    const zMonth=zipingRows.find(r=>r.id==="ZZ_MONTH_101")||null,zMain=mainZipingFinding(zipingRows),zChange=zipingRows.find(r=>r.id==="ZZ_CHANGE_130")||null;
    const structure=ctx.structure||{};
    const monthFacts={monthBranch:ctx.monthBranch,gyeokName:structure.gyeokName||"",basisGan:structure.basisGan||"",basis:structure.basis||"",saryeongGan:structure.saryeongGan||"",touchul:!!structure.touchul,hiddenGans:structure.hiddenGans||[],visibleHidden:structure.visibleHidden||[]};
    const p=cross.prescription||{};

    const c1=[
      season?.conclusion,ground?.conclusion,party?.conclusion,strength?.conclusion,pressure?.conclusion,
    ].filter(Boolean);
    const c2=[dominant?.conclusion,flowChain?.conclusion,pressure?.conclusion,zMain?.conclusion].filter(Boolean);
    const c3=[zMonth?.conclusion,zMain?.conclusion,relations?.conclusion,bridge?.conclusion,cross.priorityPolicy].filter(Boolean);
    const c4=[
      regulation?.conclusion,
      p.sequence?.length?`처방 순서는 ${p.sequence.map(x=>x.element).join(" → ")}로 정리된다.`:"",
      p.overlapElements?.length?`두 체계가 공통으로 요구하는 오행은 ${p.overlapElements.join("·")}이다.`:"",
      p.conflicts?.length?p.priorityPolicy:"",
    ].filter(Boolean);
    const c5=[zMain?.conclusion,dominant?.conclusion,`격을 돕는 신호는 ${cross.helpfulGods.join("·")||"명확하지 않음"}, 방해 신호는 ${cross.harmfulGods.join("·")||"뚜렷하지 않음"}이다.`].filter(Boolean);
    const c6=["원국 결론은 유지한다.","시간축에서는 대운·세운·월운이 원국의 뿌리·통관·격의 도움/방해·지지 관계를 어떻게 건드리는지 비교한다."].filter(Boolean);

    return [
      makeClaim(1,{...monthFacts,strength:strength?.facts,season:season?.facts,ground:ground?.facts,party:party?.facts,pressure:pressure?.facts},ditianRows,zipingRows,
        [strength?.id,season?.id,ground?.id,party?.id,root?.id,pressure?.id],[zMonth?.id,zMain?.id],
        c1,c1.join(" → ")),
      makeClaim(2,{...monthFacts,dominant:dominant?.facts,flow:flowChain?.facts,pressure:pressure?.facts,zipingState:cross.zipingState},ditianRows,zipingRows,
        [dominant?.id,flowChain?.id,pressure?.id,relations?.id],[zMonth?.id,zMain?.id],
        c2,c2.join(" → ")),
      makeClaim(3,{...monthFacts,pressure:pressure?.facts,root:root?.facts,bridge:bridge?.facts,relations:relations?.facts,zipingCausalSteps:zMain?.causalSteps||[]},ditianRows,zipingRows,
        [pressure?.id,root?.id,bridge?.id,relations?.id],[zMonth?.id,zMain?.id,zChange?.id],
        c3,c3.join(" → ")),
      makeClaim(4,{...monthFacts,prescription:p},ditianRows,zipingRows,
        [regulation?.id,bridge?.id,root?.id,flowChain?.id],[zMain?.id],
        c4,c4.join(" → ")),
      makeClaim(5,{...monthFacts,helpfulGods:cross.helpfulGods,harmfulGods:cross.harmfulGods,dominant:dominant?.facts,zipingState:cross.zipingState},ditianRows,zipingRows,
        [strength?.id,dominant?.id,flowChain?.id],[zMain?.id],
        c5,c5.join(" → ")),
      makeClaim(6,{...monthFacts,helpfulGods:cross.helpfulGods,harmfulGods:cross.harmfulGods,bridge:bridge?.facts,relations:relations?.facts},ditianRows,zipingRows,
        [strength?.id,bridge?.id,relations?.id],[zMonth?.id,zMain?.id],
        c6,c6.join(" → ")),
    ];
  }

  function relationBetweenTransitAndNatal(zhi,pillars){
    const rows=[];
    if(!zhi)return rows;
    for(const pos of POSITIONS){
      const nz=pillars?.[pos]?.zhi;if(!nz)continue;
      const key=zhi+nz;
      if(CLASH.has(key))rows.push({type:"clash",natalPos:pos,natalZhi:nz,transitZhi:zhi});
      if(HARM.has(key))rows.push({type:"harm",natalPos:pos,natalZhi:nz,transitZhi:zhi});
      if(BREAK.has(key))rows.push({type:"break",natalPos:pos,natalZhi:nz,transitZhi:zhi});
      if(PUNISH.has(key)||(zhi===nz&&SELF_PUNISH.has(zhi)))rows.push({type:"punishment",natalPos:pos,natalZhi:nz,transitZhi:zhi});
      if(BRANCH_COMBINE.has(key))rows.push({type:"combine",natalPos:pos,natalZhi:nz,transitZhi:zhi,transformationStatus:"not-evaluated"});
    }
    return rows;
  }

  function transitLayer(ctx,cross,ganZhi,god,layer){
    const gan=String(ganZhi||"").charAt(0),zhi=String(ganZhi||"").charAt(1);
    const ganEl=ganElement(gan),hidden=hiddenMap()[zhi]||[],hiddenEls=uniq(hidden.map(ganElement));
    const group=groupForGod(god||tenGod(ctx.dayGan,gan));
    const supportSignals=[],cautionSignals=[],neutralSignals=[];
    const add=(arr,code,severity,reason,facts)=>arr.push({code,severity,layer,reason,facts:facts||{}});
    if(cross.rescueGods.includes(god))add(supportSignals,"ziping-rescue","major","격의 손상을 다시 구하는 신호",{god});
    else if(cross.helpfulGods.includes(god))add(supportSignals,"ziping-support","major","격을 살리는 신호",{god});
    if(cross.harmfulGods.includes(god))add(cautionSignals,"ziping-harm","major","격을 흔드는 신호",{god});

    if(cross.strength==="신약"){
      if(group==="print")add(supportSignals,"ditian-generate","major","약한 일간을 생하는 작용",{group});
      if(group==="self")add(supportSignals,"ditian-assist","support","약한 일간을 직접 돕는 작용",{group});
      if(["officer","wealth"].includes(group))add(cautionSignals,"body-cost","support","약한 일간의 부담을 키울 수 있는 작용",{group});
    }else if(cross.strength==="신강"){
      if(group==="output")add(supportSignals,"ditian-discharge","major","강한 힘을 설하는 작용",{group});
      if(group==="officer")add(supportSignals,"ditian-control","major","강한 힘을 제어하는 작용",{group});
      if(group==="wealth")add(supportSignals,"ditian-consume","support","강한 힘을 현실 결과로 소모하는 작용",{group});
      if(["self","print"].includes(group))add(cautionSignals,"over-support","support","이미 강한 일간을 더 받칠 수 있는 작용",{group});
    }

    if(cross.bridgeElement&&(ganEl===cross.bridgeElement||hiddenEls.includes(cross.bridgeElement))){
      add(supportSignals,"bridge-activation",cross.bridgeStatus==="missing"?"major":"support","원국의 상극 사이를 잇는 통관 기운이 운에서 들어옴",{element:cross.bridgeElement,natalStatus:cross.bridgeStatus});
    }
    const transitHasSelf=hidden.some(h=>relationGroup(ctx.dayGan,h)==="self");
    if(cross.strength==="신약"&&transitHasSelf)add(supportSignals,"root-add","support","지지에서 일간의 뿌리를 보태는 조건",{zhi});

    const rels=relationBetweenTransitAndNatal(zhi,ctx.pillars);
    const roots=ctx.strength?.roots||[];
    for(const rel of rels){
      if(rel.type==="clash"&&roots.some(r=>r.pos===rel.natalPos)&&cross.strength==="신약"){
        add(cautionSignals,"root-clash","major","약한 일간이 의지하는 원국 뿌리를 충함",rel);
      }else if(rel.type==="clash"&&rel.natalPos==="month"){
        add(cautionSignals,"month-clash","support","월령 자리를 충해 구조 작동을 흔들 수 있음",rel);
      }else if(["harm","break","punishment"].includes(rel.type)&&rel.natalPos==="month"&&ctx.structure?.gyeokName==="정관격"){
        add(neutralSignals,`officer-${rel.type}-observe`,"observe","정관격의 월령에 형·파·해가 걸리지만 단독 손상으로 점수화하지 않고 경중 판단 근거로만 보존",rel);
      }else{
        add(neutralSignals,`branch-${rel.type}`,"observe","지지 관계는 감지하되 단독 길흉으로 확정하지 않음",rel);
      }
    }
    for(const pos of POSITIONS){
      const ng=ctx.pillars?.[pos]?.gan;if(!gan||!ng)continue;
      const target=STEM_COMBINE[gan+ng];
      if(target)add(neutralSignals,"stem-combine","observe","천간합은 감지하지만 합화는 확정하지 않음",{transitGan:gan,natalPos:pos,natalGan:ng,targetElement:target});
    }
    return {layer,ganZhi,gan,zhi,god:god||tenGod(ctx.dayGan,gan),group,ganElement:ganEl,branchHiddenElements:hiddenEls,supportSignals,cautionSignals,neutralSignals,relations:rels};
  }

  function signalValue(rows){
    return(rows||[]).reduce((sum,x)=>sum+(x.severity==="major"?2:x.severity==="support"?1:0),0);
  }
  function combineTransitLayers(layers){
    const supportSignals=layers.flatMap(x=>x?.supportSignals||[]),cautionSignals=layers.flatMap(x=>x?.cautionSignals||[]),neutralSignals=layers.flatMap(x=>x?.neutralSignals||[]);
    const support=signalValue(supportSignals),caution=signalValue(cautionSignals),net=support-caution;
    const cls=net>=3?"supportive":net<=-3?"caution":net>0?"mild-support":net<0?"mild-caution":"neutral";
    return {supportSignals,cautionSignals,neutralSignals,support,caution,net,class:cls};
  }
  function parseYmd(v){const m=String(v||"").match(/^(\d{4})-(\d{2})-(\d{2})$/);return m?Date.UTC(+m[1],+m[2]-1,+m[3]):null;}
  function ymdFromMs(ms){const d=new Date(ms);return `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,"0")}-${String(d.getUTCDate()).padStart(2,"0")}`;}
  function addMonthsYmd(ymd,n){const ms=parseYmd(ymd);if(ms==null)return ymd;const d=new Date(ms);d.setUTCMonth(d.getUTCMonth()+n);return ymdFromMs(d.getTime());}
  function addYearsYmd(ymd,n){const ms=parseYmd(ymd);if(ms==null)return ymd;const d=new Date(ms);d.setUTCFullYear(d.getUTCFullYear()+n);return ymdFromMs(d.getTime());}
  function seoulYmd(now){
    try{
      const parts=new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Seoul",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(now||new Date());
      const bag=Object.fromEntries(parts.filter(p=>p.type!=="literal").map(p=>[p.type,p.value]));
      return `${bag.year}-${bag.month}-${bag.day}`;
    }catch(_){return new Date().toISOString().slice(0,10);}
  }
  function monthEndYmd(w,year){
    if(w?.endYmd)return w.endYmd;
    if(w?.endYear&&w?.endMonth&&w?.endDay)return `${String(w.endYear).padStart(4,"0")}-${String(w.endMonth).padStart(2,"0")}-${String(w.endDay).padStart(2,"0")}`;
    if(w?.endMonth&&w?.endDay){
      const ey=Number(w.endMonth)<Number(w.startMonth||1)?Number(year)+1:Number(year);
      return `${ey}-${String(w.endMonth).padStart(2,"0")}-${String(w.endDay).padStart(2,"0")}`;
    }
    return w?.startYmd||"";
  }

  function buildTiming(ctx,cross){
    const raw=ctx.data?.realYeonun||ctx.profile?.timing?.raw||{};
    const today=ctx.data?.__testNowYmd||seoulYmd(new Date());
    const detailEnd=addMonthsYmd(today,18),horizonEnd=addYearsYmd(today,5);
    const yearKeys=Object.keys(raw).filter(k=>/^y\d{4}$/.test(k)).sort((a,b)=>Number(a.slice(1))-Number(b.slice(1)));
    const years=[],nearMonths=[];
    for(const key of yearKeys){
      const entry=raw[key],year=Number(key.slice(1));
      if(!entry||String(year)>horizonEnd.slice(0,4))continue;
      const daeunGanZhi=entry.daeunGanZhi||"",seyunGanZhi=entry.seyunGanZhi||"";
      const daeunGod=tenGod(ctx.dayGan,String(daeunGanZhi).charAt(0));
      const seyunGod=entry.seyunGanSipsin||tenGod(ctx.dayGan,String(seyunGanZhi).charAt(0));
      const daeun=transitLayer(ctx,cross,daeunGanZhi,daeunGod,"daeun");
      const seyun=transitLayer(ctx,cross,seyunGanZhi,seyunGod,"seyun");
      const yearCombined=combineTransitLayers([daeun,seyun]);
      const monthRows=(entry.wolun||[]).map(w=>{
        const start=w.startYmd||"",end=monthEndYmd(w,year);
        const monthLayer=transitLayer(ctx,cross,w.ganZhi||"",w.sipsin||tenGod(ctx.dayGan,String(w.ganZhi||"").charAt(0)),"wolun");
        const combined=combineTransitLayers([daeun,seyun,monthLayer]);
        return {...w,startYmd:start,endYmd:end,year,daeunGanZhi,seyunGanZhi,layers:{daeun,seyun,wolun:monthLayer},...combined};
      });
      const active=monthRows.filter(w=>w.endYmd>=today&&w.startYmd<=detailEnd);
      nearMonths.push(...active);
      const best=[...monthRows].sort((a,b)=>b.net-a.net||b.support-a.support||String(a.startYmd).localeCompare(String(b.startYmd)))[0]||null;
      const caution=[...monthRows].sort((a,b)=>a.net-b.net||b.caution-a.caution||String(a.startYmd).localeCompare(String(b.startYmd)))[0]||null;
      years.push({
        year,status:"ok",daeunGanZhi,daeunGod,seyunGanZhi,seyunGod,
        score:yearCombined.net,baseScore:yearCombined.net,class:yearCombined.class,
        supportSignals:yearCombined.supportSignals,cautionSignals:yearCombined.cautionSignals,neutralSignals:yearCombined.neutralSignals,
        bestMonth:best,cautionMonth:caution&&best&&caution.startYmd!==best.startYmd?caution:null,
      });
    }
    nearMonths.sort((a,b)=>String(a.startYmd).localeCompare(String(b.startYmd)));
    const pointPool=[
      ...nearMonths.map(m=>({scope:"month",date:m.startYmd,label:m.ganZhi,net:m.net,support:m.support,caution:m.caution,class:m.class,supportSignals:m.supportSignals,cautionSignals:m.cautionSignals})),
      ...years.filter(y=>String(y.year)>detailEnd.slice(0,4)).map(y=>({scope:"year",date:`${y.year}-01-01`,label:String(y.year),net:y.score,support:signalValue(y.supportSignals),caution:signalValue(y.cautionSignals),class:y.class,supportSignals:y.supportSignals,cautionSignals:y.cautionSignals})),
    ];
    const opportunities=[...pointPool].filter(x=>x.net>0).sort((a,b)=>b.net-a.net||b.support-a.support||String(a.date).localeCompare(String(b.date))).slice(0,3);
    const cautions=[...pointPool].filter(x=>x.net<0).sort((a,b)=>a.net-b.net||b.caution-a.caution||String(a.date).localeCompare(String(b.date))).slice(0,2);
    const timing={
      today,detailEnd,horizonEnd,nearMonths,years,turningPoints:{opportunities,cautions},
      coverage:{availableYears:years.map(y=>y.year),nearMonthCount:nearMonths.length},
      method:"원국 강약·뿌리·통관 + 자평진전 격의 도움/방해/구응 + 대운·세운·월운 천간·지지 + 원국과의 합·충·형·파·해를 신호별로 분리 비교. 합화와 특수격 변화는 확정하지 않음.",
    };
    timing.fingerprint=stableHash({today:timing.today,detailEnd:timing.detailEnd,horizonEnd:timing.horizonEnd,nearMonths:timing.nearMonths.map(x=>({start:x.startYmd,ganZhi:x.ganZhi,net:x.net,s:x.supportSignals.map(v=>v.code),c:x.cautionSignals.map(v=>v.code)})),years:timing.years.map(y=>({year:y.year,daeun:y.daeunGanZhi,seyun:y.seyunGanZhi,score:y.score,s:y.supportSignals.map(v=>v.code),c:y.cautionSignals.map(v=>v.code)}))});
    return timing;
  }

  function buildClassicalReasoningV1(data){
    const ctx=buildContext(data||{});
    const dRows=runRulePack(global.__DITIAN_SUI_RULES__,global.__DITIAN_SUI_SOURCES__,ctx);
    const zRows=runRulePack(global.__ZIPING_ZHENQUAN_RULES__,global.__ZIPING_ZHENQUAN_SOURCES__,ctx);
    const cross=buildCrossValidation(ctx,dRows,zRows);
    const claims=buildIntegratedClaims(ctx,dRows,zRows,cross);
    const timing=buildTiming(ctx,cross);
    const unsupported=[
      ...dRows.filter(r=>["unimplemented","detect-only"].includes(r.implementationStatus)).map(r=>({ruleId:r.id,reason:r.exceptions?.join(" / ")||r.conclusion})),
      ...zRows.filter(r=>["unimplemented","detect-only"].includes(r.implementationStatus)).map(r=>({ruleId:r.id,reason:r.exceptions?.join(" / ")||r.conclusion})),
    ];
    const structureFingerprint=stableHash({
      pillars:ctx.pillars,
      strength:{verdict:ctx.strength?.verdict,ratio:ctx.strength?.supportRatio,deukryeong:ctx.strength?.deukryeong,deukji:ctx.strength?.deukji,deukse:ctx.strength?.deukse,forces:ctx.groupForces,roots:ctx.strength?.roots},
      influence:ctx.influence,structure:ctx.structure,
      relations:{clashes:ctx.clashes,harms:ctx.harms,breaks:ctx.breaks,punishments:ctx.punishments,stemCombines:ctx.stemCombines,branchCombines:ctx.branchCombines,branchTriads:ctx.branchTriads},
      ditian:dRows.map(r=>({id:r.id,conclusion:r.conclusion,facts:r.facts,implementationStatus:r.implementationStatus||"implemented"})),
      ziping:zRows.map(r=>({id:r.id,conclusion:r.conclusion,facts:r.facts,state:r.state,causalSteps:r.causalSteps,implementationStatus:r.implementationStatus||"implemented"})),
      prescription:cross.prescription,
    });
    const result={
      version:VERSION,structureFingerprint,timingFingerprint:timing.fingerprint,profile:ctx.profile,
      context:{
        dayGan:ctx.dayGan,dayElement:ctx.dayElement,groupForces:ctx.groupForces,elementRanking:ctx.elementRanking,rawRanking:ctx.rawRanking,
        rawInfluenceMismatch:ctx.rawInfluenceMismatch,clashes:ctx.clashes,harms:ctx.harms,breaks:ctx.breaks,punishments:ctx.punishments,
        monthRelations:ctx.monthRelations,stemCombines:ctx.stemCombines,branchCombines:ctx.branchCombines,branchTriads:ctx.branchTriads,branchHalfTriads:ctx.branchHalfTriads,
        bridge:ctx.bridge,godOccurrences:ctx.godOccurrences,monthHidden:ctx.monthHidden,
      },
      ditian:{findings:dRows},ziping:{findings:zRows},integrated:cross,claims,timing,unsupported,
    };
    if(data&&typeof data==="object")data.classicalReasoningV1=result;
    return result;
  }

  global.buildClassicalReasoningV1=buildClassicalReasoningV1;
  global.__CLASSICAL_REASONING_V1__={version:VERSION};
})(globalThis);
