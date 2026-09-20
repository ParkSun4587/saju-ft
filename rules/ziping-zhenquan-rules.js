(function (global) {
  "use strict";

  function has(set,...gods){return gods.some(g=>set.has(g));}
  function list(set,...gods){return gods.filter(g=>set.has(g));}
  function occurrences(ctx,gods,visibleOnly){
    const want=new Set((gods||[]).filter(Boolean));
    return (ctx.godOccurrences||[]).filter(x=>want.has(x.god)&&(!visibleOnly||x.visible));
  }
  function locs(ctx,gods,visibleOnly){
    return occurrences(ctx,gods,visibleOnly).map(x=>({
      god:x.god,pillar:x.pillar,position:x.position,sourceType:x.sourceType,hiddenOrder:x.hiddenOrder||null,
      gan:x.gan||null,zhi:x.zhi||null,weight:x.weight||0,visible:!!x.visible,
    }));
  }
  function rooted(ctx,god){
    return (ctx.hiddenGodOccurrences||[]).some(x=>x.god===god);
  }
  function monthRelationAssessment(ctx){
    const rows=ctx.monthRelations||[];
    return {
      severe:rows.filter(x=>x.type==="clash"),
      conditional:rows.filter(x=>["punishment","break","harm"].includes(x.type)),
    };
  }
  function finding(id,sourceIds,ctx,payload){
    const steps=payload?.causalSteps||[];
    const hasDamage=steps.some(x=>x.step==="damage");
    const hasRescue=steps.some(x=>x.step==="rescue");
    const hasSupport=steps.some(x=>x.step==="support");
    const sequenceStatus=hasDamage&&hasRescue
      ?"패중유성·구응"
      :hasDamage&&hasSupport
        ?"성중유패"
        :hasDamage
          ?"파격"
          :hasSupport
            ?"성격"
            :"미정";
    return {id,sourceIds,kind:"gyeok",gyeokName:ctx.structure?.gyeokName||"평격",sequenceStatus,...payload};
  }
  function chain(ctx,label,supportGods,harmGods,rescueGods,extraDamage){
    const sLoc=locs(ctx,supportGods,true),hLoc=locs(ctx,harmGods,true),rLoc=locs(ctx,rescueGods,true);
    return [
      {step:"establish",text:`월령 ${ctx.monthBranch||"미상"}에서 ${label}의 중심을 세움`,facts:{basisGan:ctx.structure?.basisGan||null,saryeongGan:ctx.structure?.saryeongGan||null,touchul:!!ctx.structure?.touchul}},
      sLoc.length?{step:"support",text:"격을 세우거나 이어주는 힘이 천간에 드러남",facts:{locations:sLoc,rootedGods:[...new Set(sLoc.filter(x=>rooted(ctx,x.god)).map(x=>x.god))]}}:null,
      (hLoc.length||(extraDamage||[]).length)?{step:"damage",text:"격을 깨거나 흔드는 조건이 확인됨",facts:{locations:hLoc,relations:extraDamage||[]}}:null,
      rLoc.length?{step:"rescue",text:"깨진 흐름을 다시 구하는 힘이 확인됨",facts:{locations:rLoc,rootedGods:[...new Set(rLoc.filter(x=>rooted(ctx,x.god)).map(x=>x.god))]}}:null,
    ].filter(Boolean);
  }

  const RULES=[
    {
      id:"ZZ_MONTH_101",
      sourceIds:["ZZ_MONTH_001","ZZ_POSITION_019"],
      applies:()=>true,
      evaluate(ctx){
        const s=ctx.structure||{};
        const hiddenLayers=(ctx.monthHidden||[]).map(x=>({gan:x.gan,god:x.god,hiddenOrder:x.hiddenOrder,weight:x.weight}));
        return finding(this.id,this.sourceIds,ctx,{
          conclusion:s.gyeokName
            ?`월령을 기준으로 ${s.gyeokName}의 구조를 먼저 세우고 본기·중기·여기, 사령 후보와 투출을 함께 보존한다.`
            :"월령 자료가 부족해 격의 중심을 확정하지 않는다.",
          facts:{
            monthBranch:ctx.monthBranch||null,basisGan:s.basisGan||null,basis:s.basis||null,saryeongGan:s.saryeongGan||null,
            flow:s.flow||null,touchul:!!s.touchul,hiddenGans:s.hiddenGans||[],hiddenLayers,visibleHidden:s.visibleHidden||[],candidates:s.candidates||[],
            branchType:s.branchType||null,confidence:s.confidence||null,
          },
          conditions:["월령을 격의 출발점으로 사용","본기·중기·여기와 투출·사령 후보를 구분해 보존"],
          exceptions:s.confidence==="medium"?["절기 내 사령 일수 자료가 없어 격 확정 근거가 중간 신뢰도"]:[],
          supportGods:[],harmGods:[],rescueGods:[],
          causalSteps:[{step:"establish",text:"월령의 지장간·사령·투출을 비교해 격의 출발점을 정하고 순용·역용 방향을 보존",facts:{basisGan:s.basisGan||null,basis:s.basis||null,flow:s.flow||null}}],
          tags:["month-frame"],
        });
      },
    },
    {
      id:"ZZ_OFFICER_111",
      sourceIds:["ZZ_FLOW_002","ZZ_OFFICER_011","ZZ_SUCCESS_010","ZZ_RESCUE_020","ZZ_SEQUENCE_021","ZZ_POSITION_019","ZZ_RELATION_022"],
      applies:ctx=>ctx.structure?.gyeokName==="정관격",
      evaluate(ctx){
        const v=ctx.visibleGods;
        const supportGods=list(v,"정재","편재","정인","편인");
        const harmGods=list(v,"상관");
        const relationAssessment=monthRelationAssessment(ctx);
        const relDamage=relationAssessment.severe;
        const conditionalRelations=relationAssessment.conditional;
        const rescueGods=(harmGods.length&&has(v,"정인","편인"))?list(v,"정인","편인"):[];
        let state="undetermined";
        if(supportGods.length&&!harmGods.length&&!relDamage.length)state="supported";
        else if((harmGods.length||relDamage.length)&&rescueGods.length)state="rescued";
        else if(harmGods.length||relDamage.length)state="damaged";
        const causalSteps=chain(ctx,"정관격",supportGods,harmGods,rescueGods,relDamage);
        if(conditionalRelations.length) causalSteps.push({
          step:"conditional-relation",
          text:"월령에 형·파·해가 있으나 단독 파격으로 확정하지 않고 경중 판단 근거로 보존",
          facts:{relations:conditionalRelations},
        });
        return finding(this.id,this.sourceIds,ctx,{
          conclusion:state==="supported"
            ?"정관의 기준·책임을 재성이나 인성이 이어주고 월령을 흔드는 관계가 두드러지지 않아 구조가 비교적 곧게 작동한다."
            :state==="rescued"
              ?"정관을 해치는 신호가 있지만 인성이 천간에서 받아내는 구응 경로가 확인된다."
              :state==="damaged"
                ?"상관 또는 월령의 형·충·파·해가 정관의 중심을 흔드는데 현재 확인된 구응이 충분하지 않다."
                :"정관격은 확인되지만 성패를 결정할 투출 배합이 선명하지 않다.",
          facts:{
            supportGods,harmGods,rescueGods,state,monthRelationDamage:relDamage,conditionalMonthRelations:conditionalRelations,
            supportLocations:locs(ctx,supportGods,true),harmLocations:locs(ctx,harmGods,true),rescueLocations:locs(ctx,rescueGods,true),
          },
          conditions:["정관격","재·인·상관의 천간 위치를 확인","월령 충은 직접 손상 조건으로 보고 형·파·해는 경중 판단용으로 분리"],
          exceptions:[
            ...(conditionalRelations.length?["형·파·해는 단독으로 모두 파격 처리하지 않고 다른 배합과 함께 판단"]:[]),
            ...(relDamage.length?["회합이 실제로 충을 해소하는지는 합화·회국 규칙 미구현으로 확정하지 않음"]:[]),
          ],
          supportGods,harmGods,rescueGods,state,causalSteps,tags:["officer","structure-state"],
        });
      },
    },
    {
      id:"ZZ_WEALTH_112",
      sourceIds:["ZZ_FLOW_002","ZZ_WEALTH_012","ZZ_SUCCESS_010","ZZ_RESCUE_020","ZZ_SEQUENCE_021","ZZ_POSITION_019"],
      applies:ctx=>["정재격","편재격"].includes(ctx.structure?.gyeokName),
      evaluate(ctx){
        const v=ctx.visibleGods;
        const output=list(v,"식신","상관"),officer=list(v,"정관","편관"),rivals=list(v,"비견","겁재");
        const supportGods=[...output,...officer],harmGods=rivals;
        const rescueGods=harmGods.length?[...output,...officer]:[];
        const bodyWeak=ctx.strength?.verdict==="신약";
        let state="undetermined";
        if(supportGods.length&&!harmGods.length)state=bodyWeak?"mixed":"supported";
        else if(harmGods.length&&rescueGods.length)state="rescued";
        else if(harmGods.length)state="damaged";
        const causalSteps=chain(ctx,ctx.structure?.gyeokName,supportGods,harmGods,rescueGods,[]);
        return finding(this.id,this.sourceIds,ctx,{
          conclusion:state==="supported"
            ?"재성은 식상으로 생기거나 관으로 이어지는 길이 천간에 드러나 실제 결과·관리로 연결될 조건이 있다."
            :state==="mixed"
              ?"재성의 연결은 있으나 일간이 약해 결과를 좇는 비용을 함께 봐야 한다."
              :state==="rescued"
                ?"비겁이 재를 흔드는 조건 뒤에 식상 또는 관의 연결이 있어 구응 순서가 남아 있다."
                :state==="damaged"
                  ?"비겁이 재성의 집중을 분산시키는데 이를 다시 정리할 천간 연결이 선명하지 않다."
                  :"재격은 확인되지만 생재·호재·파재의 투출 순서가 선명하지 않다.",
          facts:{supportGods,harmGods,rescueGods,bodyWeak,state,supportLocations:locs(ctx,supportGods,true),harmLocations:locs(ctx,harmGods,true),rescueLocations:locs(ctx,rescueGods,true)},
          conditions:["재격","식상·관·비겁의 투출 위치와 일간 감당력을 확인"],
          exceptions:["재성 자체의 세근과 합으로 묶이는 세부 성패는 미구현 부분을 보존"],
          supportGods,harmGods,rescueGods,state,causalSteps,tags:["wealth","structure-state"],
        });
      },
    },
    {
      id:"ZZ_PRINT_113",
      sourceIds:["ZZ_FLOW_002","ZZ_PRINT_013","ZZ_SUCCESS_010","ZZ_RESCUE_020","ZZ_SEQUENCE_021","ZZ_POSITION_019"],
      applies:ctx=>["정인격","편인격"].includes(ctx.structure?.gyeokName),
      evaluate(ctx){
        const v=ctx.visibleGods;
        const officer=list(v,"정관","편관"),output=list(v,"식신","상관"),wealth=list(v,"정재","편재"),rivals=list(v,"비견","겁재");
        const bodyStrong=ctx.strength?.verdict==="신강";
        const supportGods=[...officer,...(bodyStrong?output:[])],harmGods=wealth;
        const rescueGods=wealth.length?rivals:[];
        let state="undetermined";
        if(supportGods.length&&!wealth.length)state="supported";
        else if(wealth.length&&rescueGods.length)state="rescued";
        else if(wealth.length)state=bodyStrong?"mixed":"damaged";
        const causalSteps=chain(ctx,ctx.structure?.gyeokName,supportGods,harmGods,rescueGods,[]);
        return finding(this.id,this.sourceIds,ctx,{
          conclusion:state==="supported"
            ?(bodyStrong&&output.length?"인성이 충분한 상태에서 식상이 설기 경로를 만들어 준비가 산출로 이어질 수 있다.":"관살이 인성을 생조하는 투출 경로가 확인된다.")
            :state==="rescued"
              ?"재성이 인성을 손상시키지만 비겁이 재를 제어해 인성을 보존하는 구응 순서가 확인된다."
              :state==="damaged"
                ?"일간이 약한데 재성이 인성을 손상시켜 받쳐주는 축이 약해질 수 있다."
                :state==="mixed"
                  ?"재성이 인성을 덜어내는 작용은 있으나 일간이 강한 만큼 실제 경중을 더 봐야 한다."
                  :"인격은 확인되지만 생조·설기·손상의 투출 순서가 선명하지 않다.",
          facts:{supportGods,harmGods,rescueGods,bodyStrong,state,supportLocations:locs(ctx,supportGods,true),harmLocations:locs(ctx,harmGods,true),rescueLocations:locs(ctx,rescueGods,true)},
          conditions:["인격","관살 생조·식상 설기·재성 손상과 비겁 구응을 순서대로 확인"],
          exceptions:["인성의 세근과 재성의 실제 강도 비교는 현재 세력값을 보조로만 사용"],
          supportGods,harmGods,rescueGods,state,causalSteps,tags:["print","structure-state"],
        });
      },
    },
    {
      id:"ZZ_KILL_114",
      sourceIds:["ZZ_FLOW_002","ZZ_KILL_014","ZZ_SUCCESS_010","ZZ_RESCUE_020","ZZ_SEQUENCE_021","ZZ_POSITION_019"],
      applies:ctx=>ctx.structure?.gyeokName==="편관격",
      evaluate(ctx){
        const v=ctx.visibleGods;
        const food=list(v,"식신"),print=list(v,"정인","편인"),wealth=list(v,"정재","편재");
        const bodyWeak=ctx.strength?.verdict==="신약";
        let path="none";
        if(food.length&&!bodyWeak)path="food-control";
        else if(print.length&&bodyWeak)path="print-transform";
        else if(food.length&&bodyWeak)path="mixed-control-cost";
        else if(print.length)path="print-buffer";
        const supportGods=[...food,...print],harmGods=wealth,rescueGods=path==="print-transform"||path==="print-buffer"?print:food;
        let state=path!=="none"?"supported":(wealth.length?"damaged":"undetermined");
        if(wealth.length&&path!=="none")state="mixed";
        const causalSteps=chain(ctx,"편관격",supportGods,harmGods,rescueGods,[]);
        return finding(this.id,this.sourceIds,ctx,{
          conclusion:path==="food-control"
            ?"편관의 압박을 식신이 직접 제어하고 일간도 그 제어를 감당할 조건이 있다."
            :path==="print-transform"
              ?"일간이 약해 편관을 정면으로 버티기보다 인성이 압박을 받아내는 전환 경로가 우선된다."
              :path==="mixed-control-cost"
                ?"식신이 편관을 줄이지만 일간도 함께 설기되어 제어 자체의 비용을 같이 본다."
                :path==="print-buffer"
                  ?"인성이 편관 압박을 완충할 투출 경로가 있으나 강약상 경중을 더 확인해야 한다."
                  :wealth.length
                    ?"재성이 편관 압박을 더 키우는데 제어·전환 투출이 선명하지 않다."
                    :"편관격은 확인되지만 압박을 제어하거나 전환할 경로가 천간에서 선명하지 않다.",
          facts:{food,print,wealth,bodyWeak,path,state,supportLocations:locs(ctx,supportGods,true),harmLocations:locs(ctx,harmGods,true),rescueLocations:locs(ctx,rescueGods,true)},
          conditions:["편관격","식신 제어·인성 전환·재성 증압을 일간 강약과 위치로 비교"],
          exceptions:["살인상생과 식신제살이 동시에 성립하는 복합 배합은 한쪽으로 강제 확정하지 않음"],
          supportGods,harmGods,rescueGods,state,causalSteps,tags:["seven-kill","structure-state"],
        });
      },
    },
    {
      id:"ZZ_FOOD_115",
      sourceIds:["ZZ_FLOW_002","ZZ_OUTPUT_015","ZZ_SUCCESS_010","ZZ_RESCUE_020","ZZ_SEQUENCE_021","ZZ_POSITION_019"],
      applies:ctx=>ctx.structure?.gyeokName==="식신격",
      evaluate(ctx){
        const v=ctx.visibleGods;
        const wealth=list(v,"정재","편재"),owl=list(v,"편인");
        const supportGods=wealth,harmGods=owl,rescueGods=owl.length?wealth:[];
        let state=wealth.length&&!owl.length?"supported":owl.length&&rescueGods.length?"rescued":owl.length?"damaged":"undetermined";
        const causalSteps=chain(ctx,"식신격",supportGods,harmGods,rescueGods,[]);
        return finding(this.id,this.sourceIds,ctx,{
          conclusion:state==="supported"
            ?"식신이 재성으로 이어져 산출이 실제 결과와 자원으로 연결될 길이 있다."
            :state==="rescued"
              ?"편인이 식신을 누르지만 재성이 천간에 드러나 식신을 보호하는 구응 순서가 있다."
              :state==="damaged"
                ?"편인이 식신의 산출 경로를 막는데 이를 보호할 재성 투출이 선명하지 않다."
                :"식신격은 확인되지만 생재·탈식의 투출 배합이 선명하지 않다.",
          facts:{supportGods,harmGods,rescueGods,state,supportLocations:locs(ctx,supportGods,true),harmLocations:locs(ctx,harmGods,true),rescueLocations:locs(ctx,rescueGods,true)},
          conditions:["식신격","재성 생재와 편인 탈식을 위치로 확인"],
          exceptions:[],
          supportGods,harmGods,rescueGods,state,causalSteps,tags:["food","structure-state"],
        });
      },
    },
    {
      id:"ZZ_HURT_116",
      sourceIds:["ZZ_FLOW_002","ZZ_HURT_016","ZZ_SUCCESS_010","ZZ_RESCUE_020","ZZ_SEQUENCE_021","ZZ_POSITION_019"],
      applies:ctx=>ctx.structure?.gyeokName==="상관격",
      evaluate(ctx){
        const v=ctx.visibleGods;
        const wealth=list(v,"정재","편재"),print=list(v,"정인","편인"),officer=list(v,"정관");
        const supportGods=[...wealth,...print],harmGods=officer,rescueGods=officer.length?print:[];
        let path=wealth.length?"wealth-release":print.length?"print-control":"none";
        let state=supportGods.length&&!officer.length?"supported":officer.length&&rescueGods.length?"rescued":officer.length?"damaged":"undetermined";
        if(wealth.length&&officer.length&&!rescueGods.length)state="mixed";
        const causalSteps=chain(ctx,"상관격",supportGods,harmGods,rescueGods,[]);
        return finding(this.id,this.sourceIds,ctx,{
          conclusion:path==="wealth-release"&&state!=="damaged"
            ?"상관의 설기 힘이 재성으로 이어져 결과와 실익으로 빠질 길이 있다."
            :path==="print-control"
              ?"인성이 상관의 과한 분출을 제어해 표현을 정리된 결과로 바꿀 여지가 있다."
              :officer.length
                ?"상관과 정관의 충돌이 드러나 기준과 표현이 정면으로 부딪힐 수 있다."
                :"상관격은 확인되지만 설기·제어 경로가 선명하지 않다.",
          facts:{wealth,print,officer,path,state,supportLocations:locs(ctx,supportGods,true),harmLocations:locs(ctx,harmGods,true),rescueLocations:locs(ctx,rescueGods,true)},
          conditions:["상관격","재성 설기·인성 제어·정관 충돌의 위치를 확인"],
          exceptions:["상관견관의 계절별 세부 예외는 현재 미구현"],
          supportGods,harmGods,rescueGods,state,causalSteps,tags:["hurt-officer","structure-state"],
        });
      },
    },
    {
      id:"ZZ_BLADE_117",
      sourceIds:["ZZ_FLOW_002","ZZ_BLADE_017","ZZ_SUCCESS_010","ZZ_SEQUENCE_021","ZZ_POSITION_019"],
      applies:ctx=>ctx.structure?.gyeokName==="양인격",
      evaluate(ctx){
        const v=ctx.visibleGods;
        const officer=list(v,"정관","편관"),output=list(v,"식신","상관");
        const supportGods=officer,harmGods=output,rescueGods=[];
        const state=officer.length?(output.length?"mixed":"supported"):"damaged";
        const causalSteps=chain(ctx,"양인격",supportGods,harmGods,rescueGods,[]);
        return finding(this.id,this.sourceIds,ctx,{
          conclusion:officer.length&&!output.length
            ?"양인의 강한 자기 힘을 관살이 제어해 결단력을 역할·책임으로 정리할 길이 있다."
            :officer.length&&output.length
              ?"관살 제어는 있으나 식상이 관살을 다시 흔드는 조건을 함께 본다."
              :"양인의 강한 힘을 제어할 관살 투출이 보이지 않는다.",
          facts:{supportGods,harmGods,rescueGods,state,supportLocations:locs(ctx,supportGods,true),harmLocations:locs(ctx,harmGods,true)},
          conditions:["양인격","관살 제어와 식상 손상을 위치로 확인"],
          exceptions:["재·인으로 관살을 보호하는 세부 배합은 추가 규칙 필요"],
          supportGods,harmGods,rescueGods,state,causalSteps,tags:["blade","structure-state"],
        });
      },
    },
    {
      id:"ZZ_LUJIE_118",
      sourceIds:["ZZ_FLOW_002","ZZ_LUJIE_018","ZZ_SUCCESS_010","ZZ_RESCUE_020","ZZ_SEQUENCE_021","ZZ_POSITION_019"],
      applies:ctx=>["건록격","비견격","겁재격"].includes(ctx.structure?.gyeokName),
      evaluate(ctx){
        const v=ctx.visibleGods;
        const officer=list(v,"정관","편관"),wealth=list(v,"정재","편재"),output=list(v,"식신","상관");
        let path="none";
        if(officer.length)path="officer-control";
        else if(wealth.length&&output.length)path="output-to-wealth";
        else if(wealth.length)path="wealth-use";
        else if(has(v,"편관")&&output.length)path="kill-with-control";
        const supportGods=[...officer,...wealth,...output],harmGods=[],rescueGods=[];
        const state=path==="none"?"undetermined":"supported";
        const causalSteps=chain(ctx,ctx.structure?.gyeokName,supportGods,harmGods,rescueGods,[]);
        return finding(this.id,this.sourceIds,ctx,{
          conclusion:path==="officer-control"
            ?"강한 자기 힘을 관살이 역할과 기준으로 묶어주는 길이 있다."
            :path==="output-to-wealth"
              ?"자기 힘이 식상으로 빠지고 재성으로 이어져 독립성이 실제 결과로 연결될 길이 있다."
              :path==="wealth-use"
                ?"재성을 통해 자기 힘을 현실 자원과 선택으로 쓰는 길이 있다."
                :"건록·월겁 계열은 확인되지만 재·관·식상으로 힘을 쓸 구체 경로가 천간에서 선명하지 않다.",
          facts:{officer,wealth,output,path,state,supportLocations:locs(ctx,supportGods,true)},
          conditions:["건록·월겁 계열","월령 자체보다 외부 재·관·식상 배합과 위치를 찾음"],
          exceptions:["살을 쓸 때 제복·보호가 복합되는 세부 조합은 추가 규칙 필요"],
          supportGods,harmGods,rescueGods,state,causalSteps,tags:["lu-jie","structure-state"],
        });
      },
    },
    {
      id:"ZZ_CHANGE_130",
      sourceIds:["ZZ_CHANGE_030","ZZ_COMBINE_023","ZZ_RELATION_022"],
      applies:ctx=>(ctx.stemCombines?.length||ctx.branchCombines?.length||ctx.branchTriads?.length||ctx.monthRelations?.length),
      evaluate(ctx){
        const relationFacts={
          stemCombines:ctx.stemCombines||[],branchCombines:ctx.branchCombines||[],branchTriads:ctx.branchTriads||[],
          monthRelations:ctx.monthRelations||[],
        };
        return finding(this.id,this.sourceIds,ctx,{
          conclusion:"합·회·형·충·파·해가 월령이나 격의 작동을 건드릴 수 있는 신호는 보존하지만, 합화·회국으로 격 자체가 바뀌었다고 확정하지 않는다.",
          facts:relationFacts,
          conditions:["합·회 또는 월령 관계 신호 존재"],
          exceptions:["합화·회국 성립과 그에 따른 격 변화 규칙은 현재 미구현"],
          supportGods:[],harmGods:[],rescueGods:[],state:"unimplemented",implementationStatus:"unimplemented",
          causalSteps:[{step:"observe-change",text:"관계 신호를 감지하되 격 변화는 확정하지 않음",facts:relationFacts}],
          tags:["change","unimplemented"],
        });
      },
    },
  ];

  global.__ZIPING_ZHENQUAN_RULES__={version:"1.1.0",rules:RULES};
})(globalThis);
