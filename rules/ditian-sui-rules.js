(function (global) {
  "use strict";

  function round(v, d) {
    const n = Number(v);
    if (!Number.isFinite(n)) return null;
    const p = Math.pow(10, d == null ? 3 : d);
    return Math.round(n * p) / p;
  }

  const RULES = [
    {
      id: "DTS_FORCE_101",
      sourceIds: ["DTS_FORCE_001", "DTS_FORCE_002"],
      kind: "strength",
      evaluate(ctx) {
        const s = ctx.strength;
        if (!s || !Number.isFinite(Number(s.supportRatio))) return null;
        const ratio = Number(s.supportRatio);
        const support = Number(s.supportForce || 0);
        const drain = Number(s.drainForce || 0);
        const pressure = ctx.groupForces || {};
        const dominantPressure = Object.entries(pressure)
          .filter(([k]) => !["self", "print"].includes(k))
          .sort((a,b) => b[1]-a[1])[0] || ["unknown",0];
        return {
          conclusion: s.verdict === "신약"
            ? "일간을 받치는 힘보다 밖으로 빠지거나 눌리는 힘이 우세하다."
            : s.verdict === "신강"
              ? "일간을 받치는 힘이 충분해 스스로 버티고 밀어붙일 여지가 크다."
              : "받치는 힘과 소모·압박의 차이가 극단적이지 않다.",
          facts: {
            verdict: s.verdict,
            supportRatio: round(ratio),
            supportForce: round(support,2),
            drainForce: round(drain,2),
            dominantPressureGroup: dominantPressure[0],
            dominantPressureForce: round(dominantPressure[1],2),
          },
          conditions: [
            "월령·지장간·천간 부조·설재관 세력값이 계산되어 있음",
            "부조비율과 전체 손익을 함께 사용",
          ],
          exceptions: ratio <= 0.18 || ratio >= 0.82
            ? ["극단 구간이므로 종격·전왕성 여부를 일반 강약 규칙만으로 확정하지 않음"]
            : [],
          tags: ["core-strength"],
        };
      },
    },
    {
      id: "DTS_ROOT_104",
      sourceIds: ["DTS_ROOT_004"],
      kind: "root",
      evaluate(ctx) {
        const roots = Array.isArray(ctx.strength?.roots) ? ctx.strength.roots : [];
        const totalWeight = roots.reduce((a,r) => a + Number(r.weight || 0), 0);
        const month = roots.filter(r => r.pos === "month").reduce((a,r)=>a+Number(r.weight||0),0);
        const day = roots.filter(r => r.pos === "day").reduce((a,r)=>a+Number(r.weight||0),0);
        const quality = month > 0 ? "month-rooted" : day > 0 ? "day-rooted" : totalWeight > 0 ? "other-rooted" : "rootless";
        return {
          conclusion: quality === "rootless"
            ? "통근이 확인되지 않아 외부 압력을 받아낼 자기 기반이 약하다."
            : quality === "month-rooted"
              ? "월지에 직접 뿌리가 있어 같은 신약 판정 안에서도 버티는 축이 분명하다."
              : quality === "day-rooted"
                ? "일지에 뿌리가 있어 완전히 떠 있는 구조는 아니다."
                : "월지·일지보다는 약하지만 다른 지지에 통근이 있어 완전 무근은 아니다.",
          facts: { rootCount: roots.length, totalRootWeight: round(totalWeight,2), monthRootWeight: round(month,2), dayRootWeight: round(day,2), quality, roots },
          conditions: ["지장간에서 일간과 같은 오행·동류 뿌리를 탐색"],
          exceptions: [],
          tags: ["root"],
        };
      },
    },
    {
      id: "DTS_DOMINANT_107",
      sourceIds: ["DTS_FLOW_007"],
      kind: "flow",
      evaluate(ctx) {
        const top = ctx.elementRanking?.[0];
        const second = ctx.elementRanking?.[1];
        if (!top) return null;
        return {
          conclusion: `${top.element}의 실제 세력이 가장 크며, 겉 글자 수보다 월령·지장간 가중치를 반영한 기세를 우선한다.`,
          facts: {
            strongestElement: top.element,
            strongestForce: round(top.force,2),
            strongestShare: round(top.share,3),
            secondElement: second?.element || null,
            secondForce: round(second?.force,2),
            rawStrongest: ctx.rawRanking?.[0]?.element || null,
            rawInfluenceMismatch: !!ctx.rawInfluenceMismatch,
          },
          conditions: ["오행 영향도 합계가 0보다 큼"],
          exceptions: [],
          tags: ["dominant-force"],
        };
      },
    },
    {
      id: "DTS_PRESSURE_109",
      sourceIds: ["DTS_FORCE_001", "DTS_FLOW_007"],
      kind: "pressure",
      evaluate(ctx) {
        const g = ctx.groupForces || {};
        const rows = ["output","wealth","officer"].map(k=>[k,Number(g[k]||0)]).sort((a,b)=>b[1]-a[1]);
        const [group, force] = rows[0] || ["unknown",0];
        if (!(force > 0)) return null;
        const support = Number(g.self||0) + Number(g.print||0);
        const overload = force > support * 0.9;
        return {
          conclusion: overload
            ? `${group} 계열의 힘이 일간을 받치는 힘에 비해 크게 작동해 현재 압력의 주된 원인이 된다.`
            : `${group} 계열이 가장 큰 외부 작용이지만 받치는 힘이 함께 있어 곧바로 과부하로 보지는 않는다.`,
          facts: { group, force: round(force,2), supportGroupForce: round(support,2), overload },
          conditions: ["설기·재성·관성의 실제 가중 합을 서로 비교"],
          exceptions: [],
          tags: ["pressure"],
        };
      },
    },
    {
      id: "DTS_BRIDGE_112",
      sourceIds: ["DTS_BRIDGE_012"],
      kind: "bridge",
      evaluate(ctx) {
        const b = ctx.bridge;
        if (!b) return null;
        return {
          conclusion: `${b.controller}와 ${b.controlled}의 직접 충돌 사이에서 ${b.bridge}가 생의 연결고리로 작동할 여지가 있다.`,
          facts: { controller: b.controller, controlled: b.controlled, bridge: b.bridge, pressure: round(b.pressure,2) },
          conditions: ["서로 제어 관계인 두 오행이 모두 평균 이상 세력", "중간 오행이 생의 연쇄를 만들 수 있음"],
          exceptions: ["중간 오행의 실제 세력·위치가 너무 약하면 통관 효과를 확정하지 않음"],
          tags: ["bridge"],
        };
      },
    },
    {
      id: "DTS_SPECIAL_120",
      sourceIds: ["DTS_SPECIAL_020"],
      kind: "special-structure",
      evaluate(ctx) {
        const ratio = Number(ctx.strength?.supportRatio);
        const roots = Array.isArray(ctx.strength?.roots) ? ctx.strength.roots : [];
        const topShare = Number(ctx.elementRanking?.[0]?.share || 0);
        const flags = [];
        if (Number.isFinite(ratio) && ratio <= 0.18 && roots.length === 0) flags.push("follow-structure-candidate");
        if (Number.isFinite(ratio) && ratio >= 0.82) flags.push("extreme-strong-candidate");
        if (topShare >= 0.55) flags.push("one-direction-dominance-candidate");
        if (!flags.length) return null;
        return {
          conclusion: "일반 신강·신약 규칙만으로 확정하면 안 되는 극단 구조 후보가 감지되었다.",
          facts: { supportRatio: round(ratio), rootCount: roots.length, strongestShare: round(topShare,3), flags },
          conditions: ["극단 부조비 또는 단일 오행 편중"],
          exceptions: ["종격·가종·전왕 확정 규칙은 현재 미구현"],
          implementationStatus: "unimplemented",
          tags: ["special-structure","unimplemented"],
        };
      },
    },
    {
      id: "DTS_COMBINE_121",
      sourceIds: ["DTS_COMBINE_021"],
      kind: "stem-combine",
      evaluate(ctx) {
        const pairs = Array.isArray(ctx.stemCombines) ? ctx.stemCombines : [];
        if (!pairs.length) return null;
        return {
          conclusion: "천간합은 확인되지만 실제 합화로 세력이 바뀌었다고 확정하지 않는다.",
          facts: { pairs },
          conditions: ["천간 합쌍 존재"],
          exceptions: ["합화 성립을 위한 계절·근·조력 조건 판정은 현재 미구현"],
          implementationStatus: "detect-only",
          tags: ["combine","unimplemented"],
        };
      },
    },
  ];

  global.__DITIAN_SUI_RULES__ = {
    version: "1.0.0",
    rules: RULES,
  };
})(globalThis);
