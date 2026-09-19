(function (global) {
  "use strict";

  const VERSION = "1.0.1";
  const ELEMENTS = ["mok","hwa","to","geum","su"];
  const GAN_ELEMENT = {
    甲:"mok",乙:"mok",丙:"hwa",丁:"hwa",戊:"to",己:"to",庚:"geum",辛:"geum",壬:"su",癸:"su",
  };
  const ELEMENT_KR = { mok:"목", hwa:"화", to:"토", geum:"금", su:"수" };
  const GROUP_KR = {
    self:"자기 힘과 경계",
    print:"받쳐주고 회복시키는 힘",
    output:"표현·산출로 빠져나가는 힘",
    wealth:"현실 결과·자원을 다루는 힘",
    officer:"기준·책임·압박으로 들어오는 힘",
    unknown:"정리되지 않은 힘",
  };
  const TEN_GOD_GROUP = {
    비견:"self",겁재:"self",정인:"print",편인:"print",식신:"output",상관:"output",
    정재:"wealth",편재:"wealth",정관:"officer",편관:"officer",
  };
  const STEM_COMBINE = {
    "甲己":"to","己甲":"to","乙庚":"geum","庚乙":"geum","丙辛":"su","辛丙":"su","丁壬":"mok","壬丁":"mok","戊癸":"hwa","癸戊":"hwa",
  };
  const BRANCH_COMBINE = new Set(["子丑","丑子","寅亥","亥寅","卯戌","戌卯","辰酉","酉辰","巳申","申巳","午未","未午"]);
  const CLASH = new Set(["子午","午子","丑未","未丑","寅申","申寅","卯酉","酉卯","辰戌","戌辰","巳亥","亥巳"]);
  const POSITIONS = ["year","month","day","hour"];

  function nextElement(e) { return ELEMENTS[(ELEMENTS.indexOf(e)+1)%5]; }
  function prevElement(e) { return ELEMENTS[(ELEMENTS.indexOf(e)+4)%5]; }
  function controls(e) { return ELEMENTS[(ELEMENTS.indexOf(e)+2)%5]; }
  function controllerOf(e) { return ELEMENTS[(ELEMENTS.indexOf(e)+3)%5]; }

  function stableHash(input) {
    const s=JSON.stringify(input||{});
    let h=2166136261;
    for(let i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619); }
    return (h>>>0).toString(16).padStart(8,"0");
  }
  function round(v,d=3){
    const n=Number(v);
    if(!Number.isFinite(n)) return null;
    const p=Math.pow(10,d);
    return Math.round(n*p)/p;
  }
  function uniq(arr){ return [...new Set((arr||[]).filter(Boolean))]; }
  function tenGod(dayGan,targetGan){
    const fn=global.__CLASSICAL_ENGINE_V2__?.tenGod;
    return typeof fn==="function" ? fn(dayGan,targetGan) : "";
  }
  function tenGodElement(dayGan,god){
    const fn=global.__CLASSICAL_ENGINE_V2__?.tenGodElement;
    return typeof fn==="function" ? fn(dayGan,god) : null;
  }
  function groupForGod(god){ return TEN_GOD_GROUP[god] || "unknown"; }

  function ranking(obj){
    const rows=ELEMENTS.map(element=>({element,force:Number(obj?.[element]||0)}));
    const total=rows.reduce((a,r)=>a+r.force,0)||1;
    rows.forEach(r=>r.share=r.force/total);
    rows.sort((a,b)=>b.force-a.force || ELEMENTS.indexOf(a.element)-ELEMENTS.indexOf(b.element));
    return rows;
  }

  function detectRelations(pillars){
    const stemCombines=[], branchCombines=[], clashes=[];
    for(let i=0;i<POSITIONS.length;i++){
      const aPos=POSITIONS[i], a=pillars?.[aPos];
      if(!a) continue;
      for(let j=i+1;j<POSITIONS.length;j++){
        const bPos=POSITIONS[j], b=pillars?.[bPos];
        if(!b) continue;
        const stemKey=String(a.gan||"")+String(b.gan||"");
        if(STEM_COMBINE[stemKey]){
          stemCombines.push({aPos,bPos,aGan:a.gan,bGan:b.gan,targetElement:STEM_COMBINE[stemKey],transformationStatus:"not-evaluated"});
        }
        const branchKey=String(a.zhi||"")+String(b.zhi||"");
        if(BRANCH_COMBINE.has(branchKey)){
          branchCombines.push({aPos,bPos,aZhi:a.zhi,bZhi:b.zhi,transformationStatus:"not-evaluated"});
        }
        if(CLASH.has(branchKey)){
          clashes.push({aPos,bPos,aZhi:a.zhi,bZhi:b.zhi});
        }
      }
    }
    return {stemCombines,branchCombines,clashes,monthClashes:clashes.filter(x=>x.aPos==="month"||x.bPos==="month")};
  }

  function aggregateGroupForces(strength){
    const coeff={self:1,print:0.84,output:0.62,wealth:0.74,officer:0.98};
    const out={self:0,print:0,output:0,wealth:0,officer:0,unknown:0};
    for(const row of (strength?.components||[])){
      const g=row?.group||"unknown";
      out[g]=(out[g]||0)+Number(row?.amount||0)*(coeff[g]||1);
    }
    for(const k of Object.keys(out)) out[k]=round(out[k],3)||0;
    return out;
  }

  function findBridge(influence){
    const avg=ELEMENTS.reduce((a,e)=>a+Number(influence?.[e]||0),0)/5;
    let best=null;
    for(const controller of ELEMENTS){
      const controlled=controls(controller);
      if(Number(influence?.[controller]||0)<avg*1.15 || Number(influence?.[controlled]||0)<avg*1.15) continue;
      const bridge=nextElement(controller);
      if(nextElement(bridge)!==controlled) continue;
      const pressure=Number(influence?.[controller]||0)+Number(influence?.[controlled]||0);
      if(!best||pressure>best.pressure) best={controller,controlled,bridge,pressure};
    }
    return best;
  }

  function buildContext(data){
    const profile=data?.integratedSajuProfile || (typeof global.buildIntegratedSajuProfile==="function" ? global.buildIntegratedSajuProfile(data||{}) : null);
    if(data && profile) data.integratedSajuProfile=profile;
    const pillars=profile?.pillars||data?.pillars||{};
    const dayGan=pillars?.day?.gan||data?.dayGan||"";
    const dayElement=GAN_ELEMENT[dayGan]||data?.dayOheng||"to";
    const strength=profile?.strength||data?.strengthDetail||{};
    const influence=profile?.elements?.influence||data?.elementProfiles?.influence||{};
    const raw=profile?.elements?.raw||data?.elementProfiles?.raw||data?.elements||{};
    const elementRanking=ranking(influence);
    const rawRanking=ranking(raw);
    const relations=detectRelations(pillars);
    const visibleGods=new Set();
    const allGodCounts={};
    for(const row of (profile?.sipsin?.all||[])){
      const god=row?.value;
      if(!TEN_GOD_GROUP[god]) continue;
      allGodCounts[god]=(allGodCounts[god]||0)+1;
      if(row?.position==="천간" && row?.pillar!=="day") visibleGods.add(god);
    }
    for(const [god,n] of Object.entries(profile?.sipsin?.counts||{})){
      if(TEN_GOD_GROUP[god]) allGodCounts[god]=Math.max(Number(allGodCounts[god]||0),Number(n||0));
    }
    const ctx={
      data,profile,pillars,dayGan,dayElement,strength,
      structure:profile?.structure||{},
      influence,raw,elementRanking,rawRanking,
      rawInfluenceMismatch:elementRanking?.[0]?.element!==rawRanking?.[0]?.element || elementRanking?.[elementRanking.length-1]?.element!==rawRanking?.[rawRanking.length-1]?.element,
      groupForces:aggregateGroupForces(strength),
      bridge:findBridge(influence),
      visibleGods,allGodCounts,
      ...relations,
      monthBranch:pillars?.month?.zhi||profile?.classical?.japyeong?.monthBranch||null,
    };
    return ctx;
  }

  function sourceDetails(ids,pack){
    const src=pack?.sources||{};
    return (ids||[]).map(id=>({id,...(src[id]||{})}));
  }

  function runRulePack(rulePack, sourcePack, ctx){
    const out=[];
    for(const rule of (rulePack?.rules||[])){
      try{
        if(typeof rule.applies==="function" && !rule.applies(ctx)) continue;
        const row=typeof rule.evaluate==="function" ? rule.evaluate(ctx) : null;
        if(!row) continue;
        const resolvedSourceIds = (row.sourceIds || rule.sourceIds || []).filter(Boolean);
        out.push({
          ...row,
          id: row.id || rule.id,
          kind: row.kind || rule.kind || "unknown",
          sourceIds: resolvedSourceIds,
          sources: sourceDetails(resolvedSourceIds, sourcePack),
        });
      }catch(err){
        out.push({
          id:rule.id,
          sourceIds:rule.sourceIds||[],
          sources:sourceDetails(rule.sourceIds||[],sourcePack),
          kind:"rule-error",
          conclusion:"규칙 실행 오류로 이 판단은 사용하지 않는다.",
          facts:{error:String(err?.message||err)},
          conditions:[],
          exceptions:["rule-error"],
          implementationStatus:"error",
        });
      }
    }
    return out;
  }

  function mainZipingFinding(rows){
    return rows.find(r=>r.id!=="ZZ_MONTH_101" && r.kind==="gyeok" && r.implementationStatus!=="unimplemented")
      || rows.find(r=>r.id==="ZZ_MONTH_101") || null;
  }
  function byKind(rows,kind){ return rows.find(r=>r.kind===kind)||null; }

  function unionGods(rows,key){
    return uniq(rows.flatMap(r=>Array.isArray(r?.[key])?r[key]:[]));
  }

  function buildCrossValidation(ctx,ditianRows,zipingRows){
    const strength=ctx.strength?.verdict||"중화";
    const zMain=mainZipingFinding(zipingRows);
    const helpful=unionGods(zipingRows,"supportGods");
    const rescue=unionGods(zipingRows,"rescueGods");
    const harmful=unionGods(zipingRows,"harmGods");
    const bridge=byKind(ditianRows,"bridge");
    const special=byKind(ditianRows,"special-structure");
    const root=byKind(ditianRows,"root");
    const pressure=byKind(ditianRows,"pressure");
    const conflicts=[];

    const desiredGroups = strength==="신약" ? new Set(["self","print"]) :
      strength==="신강" ? new Set(["output","wealth","officer"]) : new Set(["self","print","output","wealth","officer"]);
    for(const god of helpful){
      const group=groupForGod(god);
      if(strength==="신약" && ["output","wealth","officer"].includes(group)){
        conflicts.push({
          type:"body-vs-structure",
          god,group,
          reason:"격 구조에는 도움이 될 수 있지만 약한 일간에는 비용이 큰 역할이다.",
          priority:"받치는 힘·통관을 먼저 확보한 뒤 구조용 신호를 쓴다.",
        });
      } else if(strength==="신강" && ["self","print"].includes(group)){
        conflicts.push({
          type:"body-vs-structure",
          god,group,
          reason:"격 구조에는 도움이 될 수 있지만 이미 강한 일간을 더 받칠 수 있다.",
          priority:"격의 보호 기능은 인정하되 과한 부조가 되는지 먼저 확인한다.",
        });
      }
    }

    let priorityPolicy="두 체계가 같은 방향이면 그 인과를 강화한다.";
    if(conflicts.length) priorityPolicy="두 체계를 평균내지 않고, 일간 감당력과 격의 성패를 순서대로 적용한다.";
    if(special?.implementationStatus==="unimplemented") priorityPolicy="특수 구조 후보가 있어 일반 규칙의 확정도를 낮추고 미구현 상태를 보존한다.";

    const pressureGroup=pressure?.facts?.group||null;
    const rootQuality=root?.facts?.quality||null;
    const bridgeElement=bridge?.facts?.bridge||ctx.bridge?.bridge||null;
    const neededGroups=strength==="신약" ? ["print","self"] : strength==="신강" ? ["output","wealth","officer"] : [];

    return {
      strength,
      rootQuality,
      pressureGroup,
      pressureHuman:GROUP_KR[pressureGroup]||"",
      helpfulGods:helpful,
      rescueGods:rescue,
      harmfulGods:harmful,
      neededGroups,
      bridgeElement,
      bridgeElementName:bridgeElement?ELEMENT_KR[bridgeElement]:"",
      zipingState:zMain?.state||zMain?.facts?.state||"undetermined",
      zipingPath:zMain?.facts?.path||null,
      zipingConclusion:zMain?.conclusion||"",
      conflicts,
      priorityPolicy,
      specialStructureStatus:special?.implementationStatus||"none",
    };
  }

  function coreRuleIds(rows){
    return uniq(
      rows
        .filter(r=>r.implementationStatus!=="error")
        .map(r=>r.id)
        .filter(Boolean)
    );
  }

  function validRuleIds(requested, fallback){
    const ids=uniq((requested||[]).filter(Boolean));
    return ids.length ? ids : uniq((fallback||[]).filter(Boolean));
  }

  function buildIntegratedClaims(ctx, ditianRows, zipingRows, cross){
    const dIds=coreRuleIds(ditianRows);
    const zIds=coreRuleIds(zipingRows);
    const strength=byKind(ditianRows,"strength");
    const root=byKind(ditianRows,"root");
    const dominant=byKind(ditianRows,"flow");
    const pressure=byKind(ditianRows,"pressure");
    const bridge=byKind(ditianRows,"bridge");
    const zMain=mainZipingFinding(zipingRows);
    const structure=ctx.structure||{};
    const monthFacts={
      monthBranch:ctx.monthBranch,
      gyeokName:structure.gyeokName||"",
      basisGan:structure.basisGan||"",
      basis:structure.basis||"",
      saryeongGan:structure.saryeongGan||"",
      touchul:!!structure.touchul,
    };

    function claim(noteNum, conclusion, extraFacts, dRuleIds, zRuleIds, exceptions){
      return {
        id:`NOTE${noteNum}_claim_core`,
        noteNum,
        rawFacts:{...monthFacts,...extraFacts},
        ditianRuleIds:validRuleIds(dRuleIds,dIds),
        zipingRuleIds:validRuleIds(zRuleIds,zIds),
        conditions:[
          ...(strength?.conditions||[]),
          ...(zMain?.conditions||[]),
        ],
        exceptions:uniq([...(strength?.exceptions||[]),...(zMain?.exceptions||[]),...(exceptions||[])]),
        conclusion,
        noteSentence:null,
      };
    }

    const coreConclusion=[
      structure.gyeokName ? `월령 중심은 ${structure.gyeokName}` : "월령 중심은 미확정",
      strength?.conclusion||"",
      pressure?.conclusion||"",
      root?.conclusion||"",
    ].filter(Boolean).join(" → ");

    const patternConclusion=[
      dominant?.conclusion||"",
      cross.zipingConclusion,
      cross.conflicts.length ? cross.priorityPolicy : "",
    ].filter(Boolean).join(" → ");

    const causeConclusion=[
      `현재 압력의 주축은 ${cross.pressureHuman||"한쪽으로 단정하기 어려운 힘"}이다.`,
      cross.zipingConclusion,
      cross.bridgeElement ? `${cross.bridgeElementName}이 중간 연결 후보로 잡힌다.` : "뚜렷한 통관 후보가 자동 검출되지는 않았다.",
    ].join(" ");

    const changeConclusion=cross.bridgeElement
      ? `${cross.bridgeElementName}의 연결을 먼저 만든 뒤 ${cross.helpfulGods.join("·")||"격을 살리는 신호"}를 쓰는 순서가 구조 변화의 핵심이다.`
      : cross.strength==="신약"
        ? `먼저 일간을 받치는 힘을 확보하고, 그다음 ${cross.helpfulGods.join("·")||"격의 도움 신호"}를 쓰는 순서가 안전하다.`
        : cross.strength==="신강"
          ? `쌓인 힘을 결과·표현·역할 쪽으로 빼면서 ${cross.helpfulGods.join("·")||"격의 도움 신호"}를 연결하는 게 핵심이다.`
          : `${cross.helpfulGods.join("·")||"격의 도움 신호"}가 실제로 작동하는 조건을 하나씩 확인하는 게 핵심이다.`;

    const fitConclusion=`잘 맞는 환경은 ${cross.helpfulGods.join("·")||"도움 신호"}가 실제로 작동하고 ${cross.harmfulGods.join("·")||"방해 신호"}가 과해지지 않는 곳이다.`;
    const timingConclusion="원국의 핵심은 유지하고 대운·세운·월운이 도움 신호와 방해 신호를 얼마나 강화하는지만 시간축에서 따로 본다.";

    return [
      claim(1,coreConclusion,{strength:strength?.facts,root:root?.facts,pressure:pressure?.facts},[strength?.id,root?.id,pressure?.id],[ "ZZ_MONTH_101", zMain?.id ]),
      claim(2,patternConclusion,{dominant:dominant?.facts,zipingState:cross.zipingState,conflicts:cross.conflicts},[dominant?.id,pressure?.id],[ "ZZ_MONTH_101", zMain?.id ]),
      claim(3,causeConclusion,{pressure:pressure?.facts,bridge:bridge?.facts,helpfulGods:cross.helpfulGods,harmfulGods:cross.harmfulGods},[pressure?.id,bridge?.id,root?.id],[ "ZZ_MONTH_101", zMain?.id ]),
      claim(4,changeConclusion,{bridgeElement:cross.bridgeElement,neededGroups:cross.neededGroups,helpfulGods:cross.helpfulGods,rescueGods:cross.rescueGods},[strength?.id,root?.id,bridge?.id],[ "ZZ_MONTH_101", zMain?.id ]),
      claim(5,fitConclusion,{helpfulGods:cross.helpfulGods,harmfulGods:cross.harmfulGods,zipingState:cross.zipingState},[strength?.id,dominant?.id],[ "ZZ_MONTH_101", zMain?.id ]),
      claim(6,timingConclusion,{helpfulGods:cross.helpfulGods,harmfulGods:cross.harmfulGods},[strength?.id,bridge?.id],[ "ZZ_MONTH_101", zMain?.id ]),
    ];
  }

  function scoreTransitGod(ctx,cross,god){
    if(!god) return {score:0,reasons:[]};
    const group=groupForGod(god);
    let score=0;
    const reasons=[];
    if(cross.rescueGods.includes(god)){ score+=2.6; reasons.push("격의 구응 신호"); }
    else if(cross.helpfulGods.includes(god)){ score+=2.0; reasons.push("격을 살리는 신호"); }
    if(cross.harmfulGods.includes(god)){ score-=2.4; reasons.push("격을 흔드는 신호"); }

    if(cross.strength==="신약"){
      if(group==="self"||group==="print"){ score+=1.2; reasons.push("약한 일간을 받침"); }
      if(group==="officer"||group==="wealth"){ score-=0.9; reasons.push("약한 일간의 부담 증가"); }
      if(group==="output"){ score-=0.45; reasons.push("약한 일간의 설기"); }
    }else if(cross.strength==="신강"){
      if(["output","wealth","officer"].includes(group)){ score+=0.8; reasons.push("강한 일간의 힘을 밖으로 씀"); }
      if(group==="self"||group==="print"){ score-=0.55; reasons.push("이미 강한 일간을 더 받침"); }
    }

    const e=tenGodElement(ctx.dayGan,god);
    if(cross.bridgeElement && e===cross.bridgeElement){ score+=1.15; reasons.push("통관 연결 기운"); }
    return {score:round(score,2),reasons,group,element:e};
  }

  function seoulYmd(now){
    try{
      const parts=new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Seoul",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(now||new Date());
      const bag=Object.fromEntries(parts.filter(p=>p.type!=="literal").map(p=>[p.type,p.value]));
      return `${bag.year}-${bag.month}-${bag.day}`;
    }catch(_){
      return new Date().toISOString().slice(0,10);
    }
  }
  function classifyScore(score){
    if(score>=3.2) return "supportive";
    if(score<=-1.8) return "caution";
    if(score>=1.0) return "mild-support";
    if(score<=-0.8) return "mild-caution";
    return "neutral";
  }

  function buildTiming(ctx,cross){
    const raw=ctx.data?.realYeonun||ctx.profile?.timing?.raw||{};
    const today=ctx.data?.__testNowYmd||seoulYmd(new Date());
    const years=[];
    for(const year of [2026,2027]){
      const entry=raw?.["y"+year];
      if(!entry){ years.push({year,status:"missing",score:0}); continue; }
      const daeunGan=String(entry.daeunGanZhi||"").charAt(0);
      const daeunGod=tenGod(ctx.dayGan,daeunGan);
      const daeun=scoreTransitGod(ctx,cross,daeunGod);
      const seyunGod=entry.seyunGanSipsin||tenGod(ctx.dayGan,String(entry.seyunGanZhi||"").charAt(0));
      const seyun=scoreTransitGod(ctx,cross,seyunGod);
      const base=Number(daeun.score||0)*1.4+Number(seyun.score||0)*1.0;
      const months=(entry.wolun||[]).filter(w=>{
        const end=w.endYmd || (w.endYear&&w.endMonth&&w.endDay ? `${String(w.endYear).padStart(4,"0")}-${String(w.endMonth).padStart(2,"0")}-${String(w.endDay).padStart(2,"0")}` : w.startYmd);
        return year>Number(today.slice(0,4)) || !end || end>=today;
      }).map(w=>{
        const m=scoreTransitGod(ctx,cross,w.sipsin);
        const total=base+Number(m.score||0)*0.75;
        return {
          startYmd:w.startYmd||"",
          startMonth:w.startMonth||null,
          startDay:w.startDay||null,
          ganZhi:w.ganZhi||"",
          sipsin:w.sipsin||"",
          score:round(total,2),
          class:classifyScore(total),
          reasons:[...daeun.reasons.map(x=>"대운:"+x),...seyun.reasons.map(x=>"세운:"+x),...m.reasons.map(x=>"월운:"+x)],
        };
      }).sort((a,b)=>b.score-a.score || String(a.startYmd).localeCompare(String(b.startYmd)));
      const best=months[0]||null;
      const worst=[...months].sort((a,b)=>a.score-b.score || String(a.startYmd).localeCompare(String(b.startYmd)))[0]||null;
      years.push({
        year,
        status:"ok",
        daeunGanZhi:entry.daeunGanZhi||"",
        daeunGod,
        daeunScore:daeun.score,
        seyunGanZhi:entry.seyunGanZhi||"",
        seyunGod,
        seyunScore:seyun.score,
        baseScore:round(base,2),
        class:classifyScore(base),
        bestMonth:best,
        cautionMonth:worst && best && worst.startYmd!==best.startYmd ? worst : null,
      });
    }
    return {
      today,
      years,
      fingerprint:stableHash(years),
      method:"대운 천간 십신 + 세운 천간 십신 + 월운 천간 십신을 원국의 강약·격국 도움/방해·통관 조건에 대조",
    };
  }

  function buildClassicalReasoningV1(data){
    const ctx=buildContext(data||{});
    const dRows=runRulePack(global.__DITIAN_SUI_RULES__,global.__DITIAN_SUI_SOURCES__,ctx);
    const zRows=runRulePack(global.__ZIPING_ZHENQUAN_RULES__,global.__ZIPING_ZHENQUAN_SOURCES__,ctx);
    const cross=buildCrossValidation(ctx,dRows,zRows);
    const claims=buildIntegratedClaims(ctx,dRows,zRows,cross);
    const timing=buildTiming(ctx,cross);
    const unsupported=[
      ...dRows.filter(r=>r.implementationStatus==="unimplemented"||r.implementationStatus==="detect-only").map(r=>({ruleId:r.id,reason:r.exceptions?.join(" / ")||r.conclusion})),
      ...zRows.filter(r=>r.implementationStatus==="unimplemented").map(r=>({ruleId:r.id,reason:r.exceptions?.join(" / ")||r.conclusion})),
    ];
    const structureFingerprint=stableHash({
      pillars:ctx.pillars,
      strength:{verdict:ctx.strength?.verdict,ratio:ctx.strength?.supportRatio,forces:ctx.groupForces,roots:ctx.strength?.roots},
      influence:ctx.influence,
      structure:ctx.structure,
      relations:{clashes:ctx.clashes,stemCombines:ctx.stemCombines,branchCombines:ctx.branchCombines},
      ditian:dRows.map(r=>({id:r.id,conclusion:r.conclusion,facts:r.facts,implementationStatus:r.implementationStatus||"implemented"})),
      ziping:zRows.map(r=>({id:r.id,conclusion:r.conclusion,facts:r.facts,state:r.state,implementationStatus:r.implementationStatus||"implemented"})),
      cross,
    });

    const result={
      version:VERSION,
      structureFingerprint,
      timingFingerprint:timing.fingerprint,
      profile:ctx.profile,
      context:{
        dayGan:ctx.dayGan,
        dayElement:ctx.dayElement,
        groupForces:ctx.groupForces,
        elementRanking:ctx.elementRanking,
        rawRanking:ctx.rawRanking,
        rawInfluenceMismatch:ctx.rawInfluenceMismatch,
        clashes:ctx.clashes,
        monthClashes:ctx.monthClashes,
        stemCombines:ctx.stemCombines,
        branchCombines:ctx.branchCombines,
        bridge:ctx.bridge,
      },
      ditian:{findings:dRows},
      ziping:{findings:zRows},
      integrated:cross,
      claims,
      timing,
      unsupported,
    };
    if(data && typeof data==="object") data.classicalReasoningV1=result;
    return result;
  }

  global.buildClassicalReasoningV1=buildClassicalReasoningV1;
  global.__CLASSICAL_REASONING_V1__={version:VERSION};
})(globalThis);
