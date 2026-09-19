(function (global) {
  "use strict";

  function has(set, ...gods) {
    return gods.some((g) => set.has(g));
  }
  function list(set, ...gods) {
    return gods.filter((g) => set.has(g));
  }
  function count(ctx, god) {
    return Number(ctx.allGodCounts?.[god] || 0);
  }
  function finding(id, sourceIds, ctx, payload) {
    return {
      id,
      sourceIds,
      kind: "gyeok",
      gyeokName: ctx.structure?.gyeokName || "평격",
      ...payload,
    };
  }

  const RULES = [
    {
      id: "ZZ_MONTH_101",
      sourceIds: ["ZZ_MONTH_001"],
      applies: () => true,
      evaluate(ctx) {
        const s = ctx.structure || {};
        return finding(this.id, this.sourceIds, ctx, {
          conclusion: s.gyeokName
            ? `월령을 기준으로 ${s.gyeokName}의 구조를 먼저 세우고 다른 힘을 이 틀에 맞춰 읽는다.`
            : "월령 자료가 부족해 격의 중심을 확정하지 않는다.",
          facts: {
            monthBranch: ctx.monthBranch || null,
            basisGan: s.basisGan || null,
            basis: s.basis || null,
            saryeongGan: s.saryeongGan || null,
            touchul: !!s.touchul,
            hiddenGans: s.hiddenGans || [],
            visibleHidden: s.visibleHidden || [],
          },
          conditions: ["월령과 일간의 관계를 우선"],
          exceptions: s.confidence === "medium" ? ["절기 내 사령 일수 자료가 없어 격 확정 근거가 중간 신뢰도"] : [],
          supportGods: [],
          harmGods: [],
          rescueGods: [],
          tags: ["month-frame"],
        });
      },
    },
    {
      id: "ZZ_OFFICER_111",
      sourceIds: ["ZZ_FLOW_002", "ZZ_OFFICER_011", "ZZ_SUCCESS_010", "ZZ_RESCUE_020"],
      applies: (ctx) => ctx.structure?.gyeokName === "정관격",
      evaluate(ctx) {
        const v = ctx.visibleGods;
        const supportGods = list(v, "정재","편재","정인","편인");
        const harmGods = list(v, "상관");
        const rescueGods = harmGods.length && has(v,"정인","편인") ? list(v,"정인","편인") : [];
        const clashes = ctx.monthClashes || [];
        let state = "undetermined";
        if (supportGods.length && !harmGods.length && !clashes.length) state = "supported";
        else if ((harmGods.length || clashes.length) && rescueGods.length) state = "rescued";
        else if (harmGods.length || clashes.length) state = "damaged";
        return finding(this.id, this.sourceIds, ctx, {
          conclusion: state === "supported"
            ? "정관의 기준·책임을 재성이나 인성이 이어주어 구조가 비교적 곧게 작동한다."
            : state === "rescued"
              ? "정관을 해치는 신호가 있지만 인성이 중간에서 손상을 완화하는 구응 경로가 있다."
              : state === "damaged"
                ? "정관의 기준을 상관이나 월령 충이 흔들어 구조가 바로 작동하기 어렵다."
                : "정관격은 확인되지만 생호·손상의 결정적 배합이 천간에서 선명하지 않다.",
          facts: { supportGods, harmGods, rescueGods, monthClashes: clashes, state },
          conditions: ["정관격", "천간 투출 십신과 월령 충을 함께 확인"],
          exceptions: ["형·해·합으로 손상이 실제 해소되는 세부 규칙은 현재 미구현"],
          supportGods, harmGods, rescueGods, state,
          tags: ["officer","structure-state"],
        });
      },
    },
    {
      id: "ZZ_WEALTH_112",
      sourceIds: ["ZZ_FLOW_002", "ZZ_WEALTH_012", "ZZ_SUCCESS_010", "ZZ_RESCUE_020"],
      applies: (ctx) => ["정재격","편재격"].includes(ctx.structure?.gyeokName),
      evaluate(ctx) {
        const v = ctx.visibleGods;
        const supportGods = list(v,"식신","상관","정관","편관");
        const harmGods = list(v,"비견","겁재");
        const rescueGods = harmGods.length ? list(v,"식신","상관","정관","편관") : [];
        const bodyWeak = ctx.strength?.verdict === "신약";
        let state = "undetermined";
        if (supportGods.length && !harmGods.length) state = bodyWeak ? "mixed" : "supported";
        else if (harmGods.length && rescueGods.length) state = "rescued";
        else if (harmGods.length) state = "damaged";
        return finding(this.id, this.sourceIds, ctx, {
          conclusion: state === "supported"
            ? "재성의 흐름이 식상으로 생기거나 관으로 이어져 실제 결과와 관리로 연결될 길이 있다."
            : state === "mixed"
              ? "재성의 흐름은 살아 있지만 일간이 약해 결과를 좇을수록 본체 소모가 커질 수 있어 감당력 확인이 먼저다."
              : state === "rescued"
                ? "비겁이 재를 흔드는 신호가 있으나 식상·관의 연결로 재성 흐름을 다시 살릴 여지가 있다."
                : state === "damaged"
                  ? "비겁이 재성의 집중을 분산시키는 신호가 강해 재를 그대로 좇는 방식은 손실이 커질 수 있다."
                  : "재격은 확인되지만 생재·호재·파재 배합이 선명하지 않다.",
          facts: { supportGods, harmGods, rescueGods, bodyWeak, state },
          conditions: ["재격", "식상·관·비겁의 투출 배합과 일간 감당력 확인"],
          exceptions: ["재의 실제 경중과 위치에 따른 세부 성패는 추가 규칙이 필요"],
          supportGods, harmGods, rescueGods, state,
          tags: ["wealth","structure-state"],
        });
      },
    },
    {
      id: "ZZ_PRINT_113",
      sourceIds: ["ZZ_FLOW_002", "ZZ_PRINT_013", "ZZ_SUCCESS_010", "ZZ_RESCUE_020"],
      applies: (ctx) => ["정인격","편인격"].includes(ctx.structure?.gyeokName),
      evaluate(ctx) {
        const v = ctx.visibleGods;
        const supportGods = list(v,"정관","편관");
        const outputGods = list(v,"식신","상관");
        const wealthGods = list(v,"정재","편재");
        const bodyStrong = ctx.strength?.verdict === "신강";
        const harmGods = wealthGods;
        const rescueGods = wealthGods.length && has(v,"비견","겁재") ? list(v,"비견","겁재") : [];
        let state = "undetermined";
        if (supportGods.length && !wealthGods.length) state = "supported";
        else if (bodyStrong && outputGods.length && !wealthGods.length) state = "supported";
        else if (wealthGods.length && rescueGods.length) state = "rescued";
        else if (wealthGods.length) state = bodyStrong ? "mixed" : "damaged";
        return finding(this.id, this.sourceIds, ctx, {
          conclusion: state === "supported"
            ? (bodyStrong && outputGods.length
              ? "인성이 충분한 상태에서 식상이 설기 경로를 만들어 준비·보호가 실제 산출로 이어질 수 있다."
              : "관살이 인성을 생조해 보호·학습·정리의 구조가 이어질 길이 있다.")
            : state === "rescued"
              ? "재성이 인성을 손상시키는 신호가 있지만 비겁이 그 손상을 막는 구응 경로가 있다."
              : state === "damaged"
                ? "일간이 약한데 재성이 인성을 손상시켜 받쳐주는 힘이 약해질 수 있다."
                : state === "mixed"
                  ? "재성이 인성을 덜어내는 작용이 있어 과한 인성을 줄일 수 있지만, 실제 경중을 더 봐야 한다."
                  : "인격은 확인되지만 생조·설기·손상의 우선순위가 선명하지 않다.",
          facts: { supportGods, outputGods, wealthGods, rescueGods, bodyStrong, state },
          conditions: ["인격", "관살 생조·식상 설기·재성 손상과 일간 강약 확인"],
          exceptions: ["인성의 경중과 재성의 뿌리 강도를 정밀 비교하는 규칙은 추가 필요"],
          supportGods: [...supportGods, ...(bodyStrong ? outputGods : [])],
          harmGods,
          rescueGods,
          state,
          tags: ["print","structure-state"],
        });
      },
    },
    {
      id: "ZZ_KILL_114",
      sourceIds: ["ZZ_FLOW_002", "ZZ_KILL_014", "ZZ_SUCCESS_010", "ZZ_RESCUE_020"],
      applies: (ctx) => ctx.structure?.gyeokName === "편관격",
      evaluate(ctx) {
        const v = ctx.visibleGods;
        const food = list(v,"식신");
        const print = list(v,"정인","편인");
        const wealth = list(v,"정재","편재");
        const bodyWeak = ctx.strength?.verdict === "신약";
        const supportGods = [...food, ...print];
        const harmGods = wealth;
        let path = "none";
        if (food.length && !bodyWeak) path = "food-control";
        else if (print.length && bodyWeak) path = "print-transform";
        else if (food.length && bodyWeak) path = "mixed-control-cost";
        else if (print.length) path = "print-buffer";
        let state = path !== "none" ? "supported" : (wealth.length ? "damaged" : "undetermined");
        if (wealth.length && path !== "none") state = "mixed";
        return finding(this.id, this.sourceIds, ctx, {
          conclusion: path === "food-control"
            ? "편관의 압박을 식신이 직접 제어할 길이 있고 일간도 그 제어를 감당할 힘이 있다."
            : path === "print-transform"
              ? "일간이 약한 편이라 편관을 정면으로 버티기보다 인성이 압박을 받아내고 보호·학습·자격의 형태로 바꾸는 경로가 더 중요하다."
              : path === "mixed-control-cost"
                ? "식신이 편관을 줄일 수는 있지만 일간도 함께 소모되므로 제어 자체가 또 다른 부담이 될 수 있다."
                : path === "print-buffer"
                  ? "인성이 편관 압박을 완충할 여지는 있으나 일간 강약상 어느 정도까지 감당 가능한지 함께 봐야 한다."
                  : wealth.length
                    ? "재성이 편관 압박을 더 키우는 방향인데 뚜렷한 제어·전환 경로가 보이지 않는다."
                    : "편관격은 확인되지만 압박을 제어하거나 전환할 경로가 천간에서 선명하지 않다.",
          facts: { food, print, wealth, bodyWeak, path, state },
          conditions: ["편관격", "식신 제어·인성 완충·재성 증압을 일간 강약과 함께 비교"],
          exceptions: ["살인상생과 식신제살이 동시에 성립하는 복합 배합의 경중 판정은 보수적으로 mixed 처리"],
          supportGods,
          harmGods,
          rescueGods: print,
          state,
          tags: ["seven-kill","structure-state"],
        });
      },
    },
    {
      id: "ZZ_FOOD_115",
      sourceIds: ["ZZ_FLOW_002", "ZZ_OUTPUT_015", "ZZ_SUCCESS_010", "ZZ_RESCUE_020"],
      applies: (ctx) => ctx.structure?.gyeokName === "식신격",
      evaluate(ctx) {
        const v = ctx.visibleGods;
        const supportGods = list(v,"정재","편재");
        const harmGods = list(v,"편인");
        const rescueGods = harmGods.length ? list(v,"정재","편재") : [];
        let state = supportGods.length && !harmGods.length ? "supported"
          : harmGods.length && rescueGods.length ? "rescued"
          : harmGods.length ? "damaged" : "undetermined";
        return finding(this.id, this.sourceIds, ctx, {
          conclusion: state === "supported"
            ? "식신이 재성으로 이어져 만든 것·표현한 것이 실제 결과와 자원으로 연결될 길이 있다."
            : state === "rescued"
              ? "편인이 식신을 누르는 신호가 있지만 재성이 식신을 보호하는 구응 경로가 함께 있다."
              : state === "damaged"
                ? "편인이 식신의 산출·표현 경로를 막아 준비가 결과로 이어지는 흐름이 끊기기 쉽다."
                : "식신격은 확인되지만 생재·탈식의 배합이 선명하지 않다.",
          facts:{supportGods,harmGods,rescueGods,state},
          conditions:["식신격","재성 생재와 편인 탈식 확인"],
          exceptions:[],
          supportGods,harmGods,rescueGods,state,
          tags:["food","structure-state"],
        });
      },
    },
    {
      id: "ZZ_HURT_116",
      sourceIds: ["ZZ_FLOW_002", "ZZ_HURT_016", "ZZ_SUCCESS_010", "ZZ_RESCUE_020"],
      applies: (ctx) => ctx.structure?.gyeokName === "상관격",
      evaluate(ctx) {
        const v=ctx.visibleGods;
        const wealth=list(v,"정재","편재");
        const print=list(v,"정인","편인");
        const officer=list(v,"정관");
        const supportGods=[...wealth,...print];
        const harmGods=officer;
        let path=wealth.length?"wealth-release":print.length?"print-control":"none";
        let state=supportGods.length && !officer.length?"supported"
          : officer.length && supportGods.length?"mixed"
          : officer.length?"damaged":"undetermined";
        return finding(this.id,this.sourceIds,ctx,{
          conclusion:path==="wealth-release"
            ? "상관의 강한 표현·설기 힘이 재성으로 이어져 결과와 실익으로 빠질 길이 있다."
            : path==="print-control"
              ? "인성이 상관의 과한 분출을 제어해 표현을 정리된 결과로 바꿀 여지가 있다."
              : officer.length
                ? "상관과 정관의 충돌이 드러나 기준과 표현이 정면으로 부딪힐 수 있다."
                : "상관격은 확인되지만 설기·제어 경로가 선명하지 않다.",
          facts:{wealth,print,officer,path,state},
          conditions:["상관격","재성 설기·인성 제어·정관 충돌 확인"],
          exceptions:["상관견관의 세부 예외와 일간·계절별 특수 판정은 현재 미구현"],
          supportGods,harmGods,rescueGods:print,state,
          tags:["hurt-officer","structure-state"],
        });
      },
    },
    {
      id: "ZZ_BLADE_117",
      sourceIds: ["ZZ_FLOW_002", "ZZ_BLADE_017", "ZZ_SUCCESS_010"],
      applies: (ctx) => ctx.structure?.gyeokName === "양인격",
      evaluate(ctx) {
        const v=ctx.visibleGods;
        const supportGods=list(v,"정관","편관");
        const harmGods=[];
        const state=supportGods.length?"supported":"damaged";
        return finding(this.id,this.sourceIds,ctx,{
          conclusion:supportGods.length
            ? "양인의 강한 자기 힘을 관살이 제어해 결단력이 역할·책임 쪽으로 정리될 길이 있다."
            : "양인의 강한 힘을 제어할 관살이 천간에 보이지 않아 힘이 직접적으로 튀어나오기 쉽다.",
          facts:{supportGods,state},
          conditions:["양인격","관살 제어 여부 확인"],
          exceptions:["재·인·식상이 관살을 돕거나 해치는 세부 배합은 추가 규칙 필요"],
          supportGods,harmGods,rescueGods:[],state,
          tags:["blade","structure-state"],
        });
      },
    },
    {
      id: "ZZ_LUJIE_118",
      sourceIds: ["ZZ_FLOW_002", "ZZ_LUJIE_018", "ZZ_SUCCESS_010", "ZZ_RESCUE_020"],
      applies: (ctx) => ["건록격","비견격","겁재격"].includes(ctx.structure?.gyeokName),
      evaluate(ctx) {
        const v=ctx.visibleGods;
        const officer=list(v,"정관","편관");
        const wealth=list(v,"정재","편재");
        const output=list(v,"식신","상관");
        const supportGods=[...officer,...wealth,...output];
        let path="none";
        if(officer.length) path="officer-control";
        else if(wealth.length && output.length) path="output-to-wealth";
        else if(wealth.length) path="wealth-use";
        else if(has(v,"편관") && output.length) path="kill-with-control";
        const state=path==="none"?"undetermined":"supported";
        return finding(this.id,this.sourceIds,ctx,{
          conclusion:path==="officer-control"
            ? "강한 자기 힘을 관살이 역할과 기준으로 묶어주는 길이 있다."
            : path==="output-to-wealth"
              ? "자기 힘이 식상으로 빠지고 재성으로 이어져 독립성이 실제 결과로 연결될 길이 있다."
              : path==="wealth-use"
                ? "재성을 통해 자기 힘을 현실 자원과 선택으로 쓰는 길이 있다."
                : "건록·월겁 계열은 확인되지만 재·관·식상으로 힘을 쓸 구체 경로가 아직 선명하지 않다.",
          facts:{officer,wealth,output,path,state},
          conditions:["건록·월겁 계열","월령 자체보다 외부 재·관·식상 배합을 찾음"],
          exceptions:["살을 쓸 때의 제복 여부 등 세부 조합은 추가 규칙 필요"],
          supportGods,harmGods:[],rescueGods:[],state,
          tags:["lu-jie","structure-state"],
        });
      },
    },
    {
      id: "ZZ_CHANGE_130",
      sourceIds: ["ZZ_CHANGE_030"],
      applies: (ctx) => (ctx.stemCombines?.length || ctx.branchCombines?.length),
      evaluate(ctx) {
        return finding(this.id,this.sourceIds,ctx,{
          conclusion:"합·회가 감지되었지만 그것 때문에 월령의 실제 기세나 격 자체가 변했다고 확정하지 않는다.",
          facts:{stemCombines:ctx.stemCombines||[],branchCombines:ctx.branchCombines||[]},
          conditions:["합 또는 회 신호 존재"],
          exceptions:["합화·회국 성립과 격 변화 규칙은 현재 미구현"],
          supportGods:[],harmGods:[],rescueGods:[],
          state:"unimplemented",
          implementationStatus:"unimplemented",
          tags:["change","unimplemented"],
        });
      },
    },
  ];

  global.__ZIPING_ZHENQUAN_RULES__ = {
    version: "1.0.0",
    rules: RULES,
  };
})(globalThis);
