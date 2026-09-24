(function (global) {
  "use strict";

  const ELEMENTS=["mok","hwa","to","geum","su"];
  function round(v,d){
    const n=Number(v);
    if(!Number.isFinite(n)) return null;
    const p=Math.pow(10,d==null?3:d);
    return Math.round(n*p)/p;
  }
  function nextElement(e){ return ELEMENTS[(ELEMENTS.indexOf(e)+1)%5]; }
  // 결론 문장에는 내부 코드(mok, officer 등) 대신 한국어 이름을 쓴다.
  const ELEMENT_NAME={mok:"목(木)",hwa:"화(火)",to:"토(土)",geum:"금(金)",su:"수(水)"};
  const GROUP_NAME={self:"비겁",print:"인성",output:"식상",wealth:"재성",officer:"관성"};
  function el(e){ return ELEMENT_NAME[e]||e; }
  function grp(g){ return GROUP_NAME[g]||g; }

  const RULES=[
    {
      id:"DTS_FORCE_101",
      sourceIds:["DTS_FORCE_001","DTS_FORCE_002","DTS_STRENGTH_005"],
      kind:"strength",
      evaluate(ctx){
        const s=ctx.strength;
        if(!s||!Number.isFinite(Number(s.supportRatio))) return null;
        const ratio=Number(s.supportRatio);
        const pressure=ctx.groupForces||{};
        const dominantPressure=Object.entries(pressure)
          .filter(([k])=>!["self","print"].includes(k))
          .sort((a,b)=>b[1]-a[1])[0]||["unknown",0];
        return {
          conclusion:s.verdict==="신약"
            ?"일간을 받치는 힘보다 밖으로 빠지거나 눌리는 힘이 우세하다."
            :s.verdict==="신강"
              ?"일간을 받치는 힘이 충분해 스스로 버티고 밀어붙일 여지가 크다."
              :"받치는 힘과 소모·압박의 차이가 극단적이지 않다.",
          facts:{
            verdict:s.verdict,
            extreme:s.extreme||null,
            supportRatio:round(ratio),
            supportForce:round(s.supportForce,2),
            drainForce:round(s.drainForce,2),
            dominantPressureGroup:dominantPressure[0],
            dominantPressureForce:round(dominantPressure[1],2),
          },
          conditions:["월령·지장간·천간 부조·설재관 세력값이 계산되어 있음","부조비율과 전체 손익을 함께 사용"],
          exceptions:ratio<=0.18||ratio>=0.82?["극단 구간은 일반 강약 규칙만으로 특수 구조를 확정하지 않음"]:[],
          tags:["core-strength"],
        };
      },
    },
    {
      id:"DTS_SEASON_102",
      sourceIds:["DTS_STRENGTH_005"],
      kind:"season-strength",
      evaluate(ctx){
        const d=ctx.strength?.deukryeong||ctx.strength?.monthCommand;
        if(!d) return null;
        const active=!!(d.active??d.deukryeong);
        return {
          conclusion:active
            ?"월령의 본기가 일간을 생조하는 편이라 계절의 직접 지원을 받는다."
            :"월령의 본기가 일간을 직접 생조하는 쪽은 아니어서 다른 자리의 보완을 함께 봐야 한다.",
          facts:{active,monthZhi:d.monthZhi||d.zhi||null,mainGan:d.mainGan||null,relation:d.relation||null},
          conditions:["월령 본기와 일간의 생극 관계 확인"],
          exceptions:["득령 하나만으로 전체 강약을 확정하지 않음"],
          tags:["deukryeong","strength-component"],
        };
      },
    },
    {
      id:"DTS_GROUND_103",
      sourceIds:["DTS_ROOT_004","DTS_ROOT_006"],
      kind:"ground-strength",
      evaluate(ctx){
        const d=ctx.strength?.deukji;
        if(!d) return null;
        return {
          conclusion:d.quality==="month-rooted"
            ?(Number(d.monthRootWeight||0)>=Math.max(Number(d.dayRootWeight||0),Number(d.otherRootWeight||0))
              ?"월지에 직접 뿌리를 두어 지지 기반이 가장 강하게 확인된다."
              :"월지에도 뿌리가 있지만 비중은 작고, 더 큰 뿌리는 다른 지지에 있다.")
            :d.quality==="day-rooted"
              ?"일지에 직접 뿌리를 두어 가까운 자리의 기반이 확인된다."
              :d.quality==="other-rooted"
                ?"년지나 시지에 뿌리가 있으나 월지·일지의 직접 기반보다는 간접적이다."
                :"지지에서 일간의 직접 뿌리가 확인되지 않는다.",
          facts:{...d},
          conditions:["지장간에서 일간과 같은 오행의 통근 위치와 weight를 분리"],
          exceptions:["뿌리가 충·합으로 실제 변하는지는 관계 규칙과 함께 판단"],
          tags:["deukji","strength-component"],
        };
      },
    },
    {
      id:"DTS_ROOT_104",
      sourceIds:["DTS_ROOT_004","DTS_ROOT_006"],
      kind:"root",
      evaluate(ctx){
        const roots=Array.isArray(ctx.strength?.roots)?ctx.strength.roots:[];
        const totalWeight=roots.reduce((a,r)=>a+Number(r.weight||0),0);
        const month=roots.filter(r=>r.pos==="month").reduce((a,r)=>a+Number(r.weight||0),0);
        const day=roots.filter(r=>r.pos==="day").reduce((a,r)=>a+Number(r.weight||0),0);
        const quality=month>0?"month-rooted":day>0?"day-rooted":totalWeight>0?"other-rooted":"rootless";
        const rootClashes=(ctx.clashes||[]).filter(c=>roots.some(r=>r.pos===c.aPos||r.pos===c.bPos));
        return {
          conclusion:quality==="rootless"
            ?"통근이 확인되지 않아 외부 압력을 받아낼 자기 기반이 약하다."
            :rootClashes.length&&ctx.strength?.verdict==="신약"
              ?"통근은 있지만 약한 일간이 의지하는 뿌리에 충이 걸려 있어 기반이 흔들리는 조건을 별도로 봐야 한다."
              :quality==="month-rooted"
                ?(ctx.strength?.verdict==="신약"
                  ?"월지에 직접 뿌리가 있어 같은 신약 판정 안에서도 버티는 축이 확인된다."
                  :"월지에 직접 뿌리가 있어 버티는 축이 확인된다.")
                :quality==="day-rooted"
                  ?"일지에 뿌리가 있어 완전히 떠 있는 구조는 아니다."
                  :"월지·일지보다는 약하지만 다른 지지에 통근이 있어 완전 무근은 아니다.",
          facts:{rootCount:roots.length,totalRootWeight:round(totalWeight,2),monthRootWeight:round(month,2),dayRootWeight:round(day,2),quality,roots,rootClashes},
          conditions:["통근의 위치·강도와 뿌리에 걸린 충을 함께 확인"],
          exceptions:["형·해는 충과 같은 강도로 자동 손상 처리하지 않음"],
          tags:["root"],
        };
      },
    },
    {
      id:"DTS_PARTY_105",
      sourceIds:["DTS_STRENGTH_005"],
      kind:"party-strength",
      evaluate(ctx){
        const d=ctx.strength?.deukse;
        if(!d) return null;
        return {
          conclusion:d.active
            ?"월지·일지의 직접 뿌리를 제외한 다른 자리에서도 생조 쪽 세력이 더 커 득세가 보강된다."
            :"다른 자리의 생조가 설·극 쪽보다 우세하지 않아 득세로 강하게 보강되지는 않는다.",
          facts:{...d},
          conditions:["월지·일지 직접 뿌리와 분리해 천간·기타 자리의 부조/설극을 비교"],
          exceptions:["득세는 전체 강약을 구성하는 한 축이며 단독 판정으로 쓰지 않음"],
          tags:["deukse","strength-component"],
        };
      },
    },
    {
      id:"DTS_DOMINANT_107",
      sourceIds:["DTS_FLOW_007","DTS_FLOW_008"],
      kind:"flow",
      evaluate(ctx){
        const top=ctx.elementRanking?.[0], second=ctx.elementRanking?.[1];
        if(!top) return null;
        return {
          conclusion:`${el(top.element)}의 실제 세력이 가장 크며, 겉 글자 수보다 월령·지장간 가중치를 반영한 기세를 우선한다.`,
          facts:{
            strongestElement:top.element,strongestForce:round(top.force,2),strongestShare:round(top.share,3),
            secondElement:second?.element||null,secondForce:round(second?.force,2),
            rawStrongest:ctx.rawRanking?.[0]?.element||null,rawInfluenceMismatch:!!ctx.rawInfluenceMismatch,
          },
          conditions:["오행 영향도 합계가 0보다 큼"],
          exceptions:[],
          tags:["dominant-force"],
        };
      },
    },
    {
      id:"DTS_FLOW_108",
      sourceIds:["DTS_FLOW_008"],
      kind:"flow-chain",
      evaluate(ctx){
        const top=ctx.elementRanking?.[0];
        if(!top) return null;
        const path=[];
        let current=top.element;
        for(let i=0;i<4;i++){
          const next=nextElement(current);
          const currentForce=Number(ctx.influence?.[current]||0);
          const nextForce=Number(ctx.influence?.[next]||0);
          path.push({from:current,to:next,fromForce:round(currentForce,2),toForce:round(nextForce,2),present:nextForce>0,ratio:currentForce>0?round(nextForce/currentForce,3):null});
          if(!(nextForce>0)) break;
          current=next;
        }
        const blocked=path.find(x=>!x.present)||null;
        return {
          conclusion:blocked
            ?`가장 강한 ${el(top.element)}에서 생의 흐름을 따라가면 ${el(blocked.from)}→${el(blocked.to)} 구간에서 연결 기운이 비어 흐름이 끊긴다.`
            :`가장 강한 ${el(top.element)}에서 시작한 생의 연결이 원국 안에서 다음 단계들까지 존재한다.`,
          facts:{sourceElement:top.element,path,blockedAt:blocked?{from:blocked.from,to:blocked.to}:null},
          conditions:["실제 오행 세력 순위의 최강 오행을 원류의 출발점으로 사용","생의 다음 오행이 원국 세력값에 실제 존재하는지 확인"],
          exceptions:["세력의 존재만으로 흐름의 질을 완전 확정하지 않고 위치·충합 조건을 별도 보존"],
          tags:["source-flow"],
        };
      },
    },
    {
      id:"DTS_PRESSURE_109",
      sourceIds:["DTS_FORCE_001","DTS_FLOW_007"],
      kind:"pressure",
      evaluate(ctx){
        const g=ctx.groupForces||{};
        const rows=["output","wealth","officer"].map(k=>[k,Number(g[k]||0)]).sort((a,b)=>b[1]-a[1]);
        const [group,force]=rows[0]||["unknown",0];
        if(!(force>0)) return null;
        const support=Number(g.self||0)+Number(g.print||0);
        const overload=force>support*0.9;
        return {
          conclusion:overload
            ?`${grp(group)} 계열의 힘이 일간을 받치는 힘에 비해 크게 작동해 현재 압력의 주된 원인이 된다.`
            :`${grp(group)} 계열이 가장 큰 외부 작용이지만 받치는 힘이 함께 있어 곧바로 과부하로 보지는 않는다.`,
          facts:{group,force:round(force,2),supportGroupForce:round(support,2),overload},
          conditions:["설기·재성·관성의 실제 가중 합을 서로 비교"],
          exceptions:[],
          tags:["pressure"],
        };
      },
    },
    {
      id:"DTS_BALANCE_110",
      sourceIds:["DTS_FORCE_002","DTS_BALANCE_009"],
      kind:"regulation",
      evaluate(ctx){
        const verdict=ctx.strength?.verdict||"중화";
        const rootQuality=ctx.strength?.deukji?.quality||"rootless";
        let operations=[];
        if(verdict==="신약") operations=["generate-support","assist-self"];
        else if(verdict==="신강") operations=["discharge","control"];
        else operations=["preserve-flow","resolve-block"];
        return {
          conclusion:verdict==="신약"
            ?"약한 쪽은 생해주는 힘과 직접 돕는 힘을 구분해 보고, 어느 쪽을 먼저 쓸지는 뿌리와 격의 요구를 함께 본다."
            :verdict==="신강"
              ?"강한 쪽은 힘을 설하는 길과 제어하는 길을 구분해 보고, 어떤 방식이 맞는지는 실제 주도 기세와 격의 요구를 함께 본다."
              :"중화권에서는 단순 증감보다 이미 이어진 흐름을 살리고 막힌 곳을 푸는 조건을 우선한다.",
          facts:{verdict,rootQuality,operations},
          conditions:["강약 판정 이후 처방 작용을 생·조 또는 설·제로 분리"],
          exceptions:["이 규칙만으로 특정 오행을 최종 용신으로 확정하지 않음","특수 구조 후보에서는 일반 억부 처방의 확정도를 낮춤"],
          tags:["regulation","prescription-input"],
        };
      },
    },
    {
      id:"DTS_BRIDGE_112",
      sourceIds:["DTS_BRIDGE_012","DTS_TRANSIT_013"],
      kind:"bridge",
      evaluate(ctx){
        const b=ctx.bridge;
        if(!b) return null;
        const bridgeForce=Number(ctx.influence?.[b.bridge]||0);
        const status=bridgeForce>0?"present-candidate":"missing";
        return {
          conclusion:status==="present-candidate"
            ?`${el(b.controller)}와 ${el(b.controlled)}의 직접 제어 사이에 ${el(b.bridge)}가 원국에 존재해 통관 후보는 성립하지만, 실제 효과의 충분성은 위치·세력 조건을 더 봐야 한다.`
            :`${el(b.controller)}와 ${el(b.controlled)}가 맞서지만 필요한 중간 기운 ${el(b.bridge)}가 원국에서 비어 있어 운에서 연결될 때 변화 가능성을 본다.`,
          facts:{controller:b.controller,controlled:b.controlled,bridge:b.bridge,pressure:round(b.pressure,2),bridgeForce:round(bridgeForce,2),status},
          conditions:["서로 제어 관계인 두 오행의 실제 세력이 함께 확인됨","통관 오행이 원국에 존재하는지 별도 확인"],
          exceptions:["통관 오행이 존재해도 실제 효과의 충분성을 단순 세력 임계값으로 확정하지 않음","합화·회국을 통관 성립 근거로 자동 사용하지 않음"],
          tags:["bridge","prescription-input"],
        };
      },
    },
    {
      id:"DTS_RELATION_114",
      sourceIds:["DTS_RELATION_014","DTS_ROOT_006"],
      kind:"branch-relations",
      evaluate(ctx){
        const total=(ctx.clashes?.length||0)+(ctx.punishments?.length||0)+(ctx.harms?.length||0)+(ctx.breaks?.length||0);
        if(!total) return null;
        return {
          conclusion:(ctx.clashes?.length||0)
            ?"지지 관계에서는 충을 우선적으로 실제 움직임으로 보고, 형·파·해는 같은 강도로 단정하지 않고 보조 조건으로 남긴다."
            :"형·파·해 관계가 있으나 충과 같은 강도의 변동으로 자동 판정하지 않는다.",
          facts:{clashes:ctx.clashes||[],punishments:ctx.punishments||[],harms:ctx.harms||[],breaks:ctx.breaks||[],monthClashes:ctx.monthClashes||[]},
          conditions:["지지 관계의 종류와 관여 위치를 구분"],
          exceptions:["형·파·해의 구체 길흉은 전체 기세와 격의 성패 조건 없이 단독 확정하지 않음"],
          tags:["relations"],
        };
      },
    },
    {
      id:"DTS_SPECIAL_120",
      sourceIds:["DTS_SPECIAL_020"],
      kind:"special-structure",
      evaluate(ctx){
        const ratio=Number(ctx.strength?.supportRatio);
        const roots=Array.isArray(ctx.strength?.roots)?ctx.strength.roots:[];
        const topShare=Number(ctx.elementRanking?.[0]?.share||0);
        const flags=[];
        if(Number.isFinite(ratio)&&ratio<=0.18&&roots.length===0) flags.push("follow-structure-candidate");
        if(Number.isFinite(ratio)&&ratio>=0.82) flags.push("extreme-strong-candidate");
        if(topShare>=0.55) flags.push("one-direction-dominance-candidate");
        if(!flags.length) return null;
        return {
          conclusion:"일반 신강·신약 규칙만으로 확정하면 안 되는 극단 구조 후보가 감지되었다.",
          facts:{supportRatio:round(ratio),rootCount:roots.length,strongestShare:round(topShare,3),flags},
          conditions:["극단 부조비 또는 단일 오행 편중"],
          exceptions:["종격·가종·전왕 확정 규칙은 현재 미구현"],
          implementationStatus:"unimplemented",
          tags:["special-structure","unimplemented"],
        };
      },
    },
    {
      id:"DTS_COMBINE_121",
      sourceIds:["DTS_COMBINE_021"],
      kind:"stem-combine",
      evaluate(ctx){
        const pairs=Array.isArray(ctx.stemCombines)?ctx.stemCombines:[];
        if(!pairs.length) return null;
        return {
          conclusion:"천간합은 확인되지만 실제 합화로 세력이 바뀌었다고 확정하지 않는다.",
          facts:{pairs},
          conditions:["천간 합쌍 존재"],
          exceptions:["합화 성립을 위한 계절·근·조력 조건 판정은 현재 미구현"],
          implementationStatus:"detect-only",
          tags:["combine","unimplemented"],
        };
      },
    },
    {
      id:"DTS_BRANCH_COMBINE_122",
      sourceIds:["DTS_RELATION_014"],
      kind:"branch-combine",
      evaluate(ctx){
        const pairs=Array.isArray(ctx.branchCombines)?ctx.branchCombines:[];
        const groups=Array.isArray(ctx.branchTriads)?ctx.branchTriads:[];
        if(!pairs.length&&!groups.length) return null;
        return {
          conclusion:"지지의 합·회는 확인하지만 실제 오행 기세가 변했다고 자동 확정하지 않는다.",
          facts:{pairs,groups},
          conditions:["육합 또는 삼합 구성 감지"],
          exceptions:["합화·회국 성립과 실제 기세 전환은 현재 미구현"],
          implementationStatus:"detect-only",
          tags:["branch-combine","unimplemented"],
        };
      },
    },
  ];

  global.__DITIAN_SUI_RULES__={version:"1.2.0",rules:RULES};
})(globalThis);
