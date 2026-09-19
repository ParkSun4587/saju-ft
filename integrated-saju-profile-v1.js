(function (global) {
  "use strict";

  const ELEMENTS = ["mok", "hwa", "to", "geum", "su"];
  const ELEMENT_BEHAVIOR = {
    mok: { noun: "새로 시작하고 넓히는 힘", verb: "작게 시작해서 키우는 것" },
    hwa: { noun: "밖으로 표현하고 반응을 받는 힘", verb: "말하고 보여주고 반응을 확인하는 것" },
    to: { noun: "흔들리지 않게 쌓고 유지하는 힘", verb: "루틴과 기록으로 굳히는 것" },
    geum: { noun: "기준을 세우고 정리하는 힘", verb: "기준을 숫자로 세우고 불필요한 걸 자르는 것" },
    su: { noun: "정보를 모으고 여백을 만드는 힘", verb: "급히 결론내리지 않고 정보를 모아 판단하는 것" },
  };

  const TEN_GOD_BEHAVIOR = {
    비견: "내 기준과 내 방식을 지키려는 성향",
    겁재: "비교와 경쟁에서 밀리지 않으려는 성향",
    식신: "내 페이스로 꾸준히 해내고 싶은 성향",
    상관: "답답한 통제에서 벗어나고 직접 말하고 싶은 성향",
    정재: "확실한 기준과 안정적인 결과를 챙기려는 성향",
    편재: "기회가 보이면 빠르게 움직이고 판을 넓히려는 성향",
    정관: "책임과 기준을 지키고 인정받고 싶은 성향",
    편관: "압박이 와도 버티고 결과를 내고 싶은 성향",
    정인: "이해하고 준비한 뒤 안전하게 움직이려는 성향",
    편인: "남들과 다른 방식으로 깊게 파고들려는 성향",
  };

  const TEN_GOD_HELP = {
    비견: "내 선택을 존중하고 같이 버텨주는 사람",
    겁재: "경쟁심을 자극하기보다 내 속도를 인정해주는 사람",
    식신: "조급하게 재촉하지 않고 꾸준함을 알아주는 사람",
    상관: "말을 막지 않고 솔직한 표현을 받아주는 사람",
    정재: "약속과 기준이 분명해서 불안을 줄여주는 사람",
    편재: "새 기회를 열어주되 선택을 강요하지 않는 사람",
    정관: "역할과 책임을 명확히 해주는 사람",
    편관: "압박만 주지 않고 목표와 경계를 분명히 해주는 사람",
    정인: "충분히 생각할 시간을 주고 안정감을 주는 사람",
    편인: "다른 관점을 이상하게 보지 않고 탐색을 허용하는 사람",
  };

  const TEN_GOD_DRAIN = {
    비견: "항상 네가 맞춰야 한다고 몰아붙이는 관계",
    겁재: "계속 비교하고 경쟁시키는 관계",
    식신: "쉬는 틈 없이 속도를 올리라고 재촉하는 관계",
    상관: "말을 끊고 감정을 무시하는 관계",
    정재: "모든 걸 손익으로만 재고 여유를 없애는 관계",
    편재: "충동과 과한 기회를 부추기는 관계",
    정관: "규칙만 앞세우고 네 사정을 보지 않는 관계",
    편관: "긴장과 압박을 계속 높이는 관계",
    정인: "준비만 더 하게 만들고 행동을 늦추는 관계",
    편인: "생각만 복잡하게 만들고 현실 확인을 막는 관계",
  };

  function safeNum(v, fallback) {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  }

  function toEntries(obj) {
    return ELEMENTS.map((key) => [key, safeNum(obj && obj[key], 0)]);
  }

  function rankElements(obj) {
    const arr = toEntries(obj).sort((a, b) => b[1] - a[1]);
    return {
      strongest: arr[0] ? arr[0][0] : "to",
      weakest: arr[arr.length - 1] ? arr[arr.length - 1][0] : "to",
      order: arr.map((x) => x[0]),
      spread: arr.length ? Math.round((arr[0][1] - arr[arr.length - 1][1]) * 100) / 100 : 0,
    };
  }

  function stableHash(input) {
    const s = typeof input === "string" ? input : JSON.stringify(input || {});
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function normalizeDominant(raw) {
    if (typeof raw === "string") return raw;
    if (raw && typeof raw.name === "string") return raw.name;
    return "";
  }

  function getTopGods(count, dominant) {
    const rows = Object.keys(count || {}).map((k) => [k, safeNum(count[k], 0)]);
    rows.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "ko"));
    const first = dominant || (rows[0] && rows[0][0]) || "";
    const second = rows.find((r) => r[0] !== first)?.[0] || "";
    return { first, second, rows };
  }

  function weakestStat(stats) {
    const keys = ["wealth", "mental", "drive", "network"].filter((k) => Number.isFinite(Number(stats && stats[k])));
    if (!keys.length) return null;
    keys.sort((a, b) => Number(stats[a]) - Number(stats[b]));
    return keys[0];
  }

  function strengthHuman(verdict) {
    if (verdict === "신강") return {
      F: "너는 버티고 밀어붙이는 힘이 꽤 있는 편이라, 더 하는 것보다 멈출 기준을 정해주는 게 중요해",
      T: "추진력은 부족하지 않아. 문제는 더 하는 게 아니라 멈출 기준이 늦는 거야",
      code: "push",
    };
    if (verdict === "신약") return {
      F: "너는 주변 분위기와 변수에 빨리 반응하는 편이라, 네 마음과 체력을 먼저 확인해줘야 오래 가",
      T: "주변 변수에 반응이 빠르다. 행동 단위를 작게 쪼개야 흔들림이 줄어",
      code: "sensitive",
    };
    return {
      F: "너는 밀어붙일 때와 내려놓을 때를 꽤 잘 아는데, 애매한 상황이 길어지면 결정이 늦어질 수 있어",
      T: "기본 균형은 괜찮다. 대신 애매한 상황에서 결정을 미루는 게 손실이야",
      code: "balanced",
    };
  }

  function statusHuman(status) {
    const map = {
      성격: "방향만 맞으면 힘이 한쪽으로 모여 결과가 빨리 나는 편",
      성중유패: "잘 풀리다가도 특정 지점에서 스스로 흐름을 끊기 쉬운 편",
      파격: "익숙한 방식 그대로 밀면 마찰이 생겨 우회가 필요한 편",
      평격: "한 가지 공식보다 상황에 맞춰 조정할 때 더 잘 풀리는 편",
    };
    return map[status] || map.평격;
  }

  function structureDepth(structure) {
    const candidateCount = Array.isArray(structure && structure.candidates) ? structure.candidates.length : 0;
    if (candidateCount >= 3) return "상황에 따라 여러 반응이 번갈아 나오기 쉬워 한 장면만 보고 너를 단정하면 안 돼";
    if (structure && structure.touchul) return "속에서 움직이는 기준이 겉으로 하는 선택에도 비교적 바로 드러나는 편이야";
    return "겉으로 보이는 모습보다 속에서 오래 작동하는 기준이 더 중요한 편이야";
  }

  function climateHuman(reasons) {
    const text = Array.isArray(reasons) ? reasons.join(" ") : String(reasons || "");
    if (!text) return "속도를 무리하게 바꾸기보다 네 리듬을 유지하는 쪽";
    if (text.includes("겨울") || text.includes("한기")) return "생각만 오래 품기보다 밖으로 표현하고 반응을 받는 쪽";
    if (text.includes("여름") || text.includes("열기") || text.includes("건조")) return "열이 오른 상태에서 바로 결정하지 말고 식힐 시간을 두는 쪽";
    if (text.includes("습기")) return "멈춰 생각만 하기보다 실제 행동으로 순환시키는 쪽";
    return "한쪽으로 과하게 몰리지 않도록 속도를 조절하는 쪽";
  }

  function statHuman(key) {
    return ({
      wealth: "손익과 내 몫을 숫자로 확인하는 것",
      mental: "회복시간과 감정 경계를 먼저 확보하는 것",
      drive: "마감과 첫 행동을 밖에 걸어두는 것",
      network: "혼자 버티기보다 실제 도움과 연결을 요청하는 것",
    })[key] || "한 번에 하나의 기준만 정해서 확인하는 것";
  }

  function concernWord(key) {
    return ({
      money: "돈과 선택",
      career: "일과 평가",
      love: "연애와 상대 반응",
      path: "진로와 선택",
      people: "사람과 경계",
      mental: "마음과 회복",
    })[key] || "지금 고민";
  }

  function buildIntegratedSajuProfile(data) {
    data = data || {};
    const ap = data.analysisProfile || {};
    const structure = ap.structure || {};
    const classical = ap.classical || {};
    const strength = data.strengthDetail || ap.strengthDetail || classical.jeokcheon || {};
    const elementProfiles = data.elementProfiles || ap.elementProfiles || classical.elements || {};
    const raw = elementProfiles.raw || elementProfiles.rawVisible || classical.elements?.rawVisible || data.elements || {};
    const influence = elementProfiles.influence || classical.elements?.influence || data.elements || {};
    const rawRank = rankElements(raw);
    const influenceRank = rankElements(influence);
    const dominantRaw = normalizeDominant(ap.sipsin && ap.sipsin.dominant);
    const gods = getTopGods(ap.sipsin && ap.sipsin.count, dominantRaw);
    const yong = data.yongshinDetail || ap.yongshinDetail || classical.yongshin || {};
    const primary = yong.primary || data.yongshin || "to";
    const secondary = yong.secondary || primary;
    const avoid = yong.avoid || influenceRank.strongest;
    const status = (data.gyeokStatus && data.gyeokStatus.status) || structure.status || "평격";
    const sangsin = (data.gyeokStatus && data.gyeokStatus.sangsinFound) || structure.sangsin || "";
    const gisin = (data.gyeokStatus && data.gyeokStatus.gisinFound) || structure.gisin || "";
    const hasClash = !!(ap.relations && ap.relations.hasChung) || !!data.hasChung;
    const weakStat = weakestStat(data.stats || ap.stats || {});
    const supportRatio = safeNum(strength.supportRatio ?? ap.dayMaster?.supportRatio, 0.5);
    const verdict = strength.verdict || ap.dayMaster?.strength || "중화";
    const strengthText = strengthHuman(verdict);
    const climateReasons = yong.climateReasons || [];
    const bridge = yong.bridge || null;
    const rawVsInfluenceMismatch = rawRank.strongest !== influenceRank.strongest || rawRank.weakest !== influenceRank.weakest;
    const candidateCount = Array.isArray(structure.candidates) ? structure.candidates.length : 0;
    const timing = data.realYeonun || ap.timing?.yeonun || {};
    const timingHash = stableHash(timing);
    const pillars = data.pillars || {};

    const coverage = {
      pillars: !!(pillars.year || pillars.month || pillars.day || pillars.hour),
      rawElements: Object.keys(raw || {}).length > 0,
      influenceElements: Object.keys(influence || {}).length > 0,
      monthSeason: !!(classical.japyeong?.monthBranch || pillars.month?.zhi),
      hiddenAndCommanding: !!(structure.saryeongGan || candidateCount || classical.japyeong?.candidates?.length),
      strength: !!verdict,
      strengthForces: Number.isFinite(Number(strength.supportForce)) || Number.isFinite(Number(strength.drainForce)),
      sipsin: !!gods.first || (ap.sipsin?.all || []).length > 0,
      gyeok: !!(structure.gyeokName || data.gyeokguk?.name),
      gyeokStatus: !!status,
      sangsinGisin: !!sangsin || !!gisin || status === "평격",
      touchul: typeof structure.touchul === "boolean",
      yongshin: !!primary,
      yongshinSecondaryAvoid: !!secondary && !!avoid,
      climate: Array.isArray(climateReasons),
      bridge: bridge !== undefined,
      yongshinScores: !!yong.scores,
      relations: typeof hasClash === "boolean",
      appStats: !!weakStat || !!data.stats,
      timing: Object.keys(timing || {}).length > 0,
    };

    const fingerprint = [
      pillars.year?.gan || "", pillars.year?.zhi || "",
      pillars.month?.gan || "", pillars.month?.zhi || "",
      pillars.day?.gan || "", pillars.day?.zhi || "",
      pillars.hour?.gan || "", pillars.hour?.zhi || "",
      verdict, Math.round(supportRatio * 100),
      rawRank.strongest, rawRank.weakest,
      influenceRank.strongest, influenceRank.weakest,
      gods.first, gods.second,
      structure.gyeokName || data.gyeokguk?.name || "",
      status, sangsin, gisin,
      structure.touchul ? "out" : "in",
      structure.branchType || "",
      structure.saryeongGan || "",
      primary, secondary, avoid,
      bridge ? (bridge.bridge || "bridge") : "no-bridge",
      hasClash ? "clash" : "steady",
      weakStat || "",
      timingHash,
    ].join("|");

    return {
      version: "1.1.0",
      fingerprint,
      coverage,
      pillars,
      strength: {
        verdict,
        extreme: strength.extreme || null,
        score: safeNum(strength.score, null),
        supportRatio,
        supportForce: safeNum(strength.supportForce, null),
        drainForce: safeNum(strength.drainForce, null),
        roots: Array.isArray(strength.roots) ? strength.roots : [],
        monthCommand: strength.monthCommand || null,
        components: Array.isArray(strength.components) ? strength.components : [],
        evidence: Array.isArray(strength.evidence) ? strength.evidence : [],
        method: strength.method || "",
        code: strengthText.code,
        F: strengthText.F,
        T: strengthText.T,
      },
      elements: {
        raw,
        influence,
        rawRank,
        influenceRank,
        rawVsInfluenceMismatch,
        primaryBehavior: ELEMENT_BEHAVIOR[primary],
        secondaryBehavior: ELEMENT_BEHAVIOR[secondary],
        avoidBehavior: ELEMENT_BEHAVIOR[avoid],
      },
      sipsin: {
        dominant: gods.first,
        secondary: gods.second,
        counts: ap.sipsin?.count || {},
        all: Array.isArray(ap.sipsin?.all) ? ap.sipsin.all : [],
        dominantHuman: TEN_GOD_BEHAVIOR[gods.first] || "상황을 오래 읽고 자기 기준을 찾는 성향",
        secondaryHuman: TEN_GOD_BEHAVIOR[gods.second] || "",
      },
      structure: {
        gyeokName: structure.gyeokName || data.gyeokguk?.name || "",
        gyeokSipsin: structure.gyeokSipsin || data.gyeokguk?.sipsin || "",
        basisGan: structure.basisGan || data.gyeokguk?.basisGan || "",
        basis: structure.basis || data.gyeokguk?.basis || "",
        status,
        flow: structure.flow || data.gyeokStatus?.flow || "",
        sangsin,
        gisin,
        touchul: !!structure.touchul,
        branchType: structure.branchType || data.gyeokguk?.branchType || "",
        saryeongGan: structure.saryeongGan || data.gyeokguk?.saryeongGan || "",
        hiddenGans: Array.isArray(data.gyeokguk?.hiddenGans) ? data.gyeokguk.hiddenGans : [],
        visibleHidden: Array.isArray(data.gyeokguk?.visibleHidden) ? data.gyeokguk.visibleHidden : [],
        candidates: Array.isArray(structure.candidates) ? structure.candidates : (Array.isArray(data.gyeokguk?.candidates) ? data.gyeokguk.candidates : []),
        candidateCount,
        confidence: data.gyeokguk?.confidence || "",
        statusEvidence: Array.isArray(data.gyeokStatus?.evidence) ? data.gyeokStatus.evidence : [],
        depthHuman: structureDepth(structure),
        statusHuman: statusHuman(status),
      },
      balance: {
        primary,
        secondary,
        avoid,
        scores: yong.scores || {},
        detail: yong.detail || {},
        strengthVerdict: yong.strengthVerdict || verdict,
        bridge,
        climateReasons,
        climateHuman: climateHuman(climateReasons),
        method: yong.method || "",
        caveat: yong.caveat || "",
      },
      relations: {
        hasClash,
        raw: ap.relations || {},
      },
      behavior: {
        weakStat,
        weakStatHuman: statHuman(weakStat),
        stats: data.stats || ap.stats || {},
      },
      calendarMeta: data.calendarMeta || null,
      classical: {
        japyeong: classical.japyeong || null,
        jeokcheon: classical.jeokcheon || null,
        qiongtong: classical.qiongtong || null,
        yongshin: classical.yongshin || null,
        elements: classical.elements || null,
      },
      timing: { raw: timing, hash: timingHash },
      audit: {
        semanticLayers: [
          "pillars", "rawElements", "influenceElements", "monthSeason", "hiddenAndCommanding",
          "strength", "strengthForces", "sipsin", "gyeok", "gyeokStatus", "sangsinGisin",
          "touchul", "yongshin", "yongshinSecondaryAvoid", "climate", "bridge",
          "yongshinScores", "relations", "appStats", "timing",
        ],
        missing: Object.keys(coverage).filter((k) => !coverage[k]),
      },
    };
  }

  function integratedAddon(profile, concernKey, noteNum, isT) {
    const mode = isT ? "T" : "F";
    const c = concernWord(concernKey);
    const dominant = profile.sipsin.dominantHuman;
    const second = profile.sipsin.secondaryHuman;
    const strongB = ELEMENT_BEHAVIOR[profile.elements.influenceRank.strongest] || ELEMENT_BEHAVIOR.to;
    const weakB = ELEMENT_BEHAVIOR[profile.elements.influenceRank.weakest] || ELEMENT_BEHAVIOR.to;
    const primaryB = ELEMENT_BEHAVIOR[profile.balance.primary] || ELEMENT_BEHAVIOR.to;
    const secondaryB = ELEMENT_BEHAVIOR[profile.balance.secondary] || primaryB;
    const avoidB = ELEMENT_BEHAVIOR[profile.balance.avoid] || ELEMENT_BEHAVIOR.to;
    const clashLineF = profile.relations.hasClash
      ? "그리고 변수가 한꺼번에 겹치면 네가 참고 있다가 갑자기 방향을 확 바꾸는 순간도 생길 수 있어."
      : "그리고 큰 변수보다 작은 불편함이 오래 쌓일 때 네 판단이 늦어지는 편이야.";
    const clashLineT = profile.relations.hasClash
      ? "변수가 겹치면 한 번에 뒤집는 반응이 나온다. 그래서 결정 전에 중간 확인이 필요해."
      : "큰 사건보다 작은 불편함을 오래 미루는 쪽이 손실을 만든다.";

    if (noteNum === 1) {
      if (isT) {
        return `네 기본 반응은 <b>${dominant}</b> 쪽이 강하고${second ? `, 그다음엔 ${second}` : ""}. 실제 힘은 <b>${strongB.noun}</b>에 더 몰리고 <b>${weakB.noun}</b>은 상대적으로 약해. ${profile.strength.T}.`;
      }
      return `언니가 너를 오래 봤을 때 제일 먼저 느껴지는 건 <b>${dominant}</b> 쪽이야${second ? `. 그 안에는 ${second}도 같이 있고` : ""}. <b>${strongB.noun}</b>은 네가 힘주지 않아도 자연스럽게 나오는데, <b>${weakB.noun}</b>은 바쁠수록 자꾸 뒤로 밀릴 수 있어. ${profile.strength.F}. 그러니까 이건 부족하다는 뜻보다, 네가 어디서 덜 애써도 되고 어디를 조금 더 챙기면 편해지는지 알려주는 힌트로 봐줘.`;
    }

    if (noteNum === 2) {
      const structure = profile.structure.statusHuman;
      if (isT) return `${structure}. ${clashLineT} 그래서 ${c}에서는 네 감정보다 <b>반복되는 행동 순서</b>를 먼저 끊는 게 맞아.`;
      return `${structure}이야. ${clashLineF} 그래서 ${c}에서 비슷한 일이 또 생겨도 ‘내가 왜 이러지’부터 하지 않았으면 좋겠어. 언니가 같이 찾고 싶은 건 네 잘못이 아니라, 마음이 지치기 시작하는 첫 장면이야. 거기만 조금 빨리 알아채도 뒤가 훨씬 덜 힘들어.`;
    }

    if (noteNum === 3) {
      const mismatchF = profile.elements.rawVsInfluenceMismatch
        ? "겉으로 많이 보이는 모습과 실제로 힘을 쓰는 방식이 조금 달라서, 스스로 원인을 엉뚱한 데서 찾기 쉬워"
        : "겉으로 보이는 모습과 실제 힘을 쓰는 방향이 비교적 같은 편이라, 문제는 ‘뭘 몰라서’보다 ‘알면서 늦게 움직이는 것’에 가까워";
      const mismatchT = profile.elements.rawVsInfluenceMismatch
        ? "겉으로 드러나는 모습과 실제 힘의 중심이 다르다. 원인 오판이 생기기 쉬운 구조야"
        : "겉과 실제 힘의 방향은 크게 다르지 않다. 핵심은 인식보다 실행 지연이야";
      if (isT) return `${mismatchT}. 또 ${profile.structure.depthHuman}. 그러니까 ${c}의 원인을 하나로 단정하지 말고 <b>겉으로 보인 문제와 실제 반복된 행동</b>을 분리해.`;
      return `${mismatchF}. 게다가 ${profile.structure.depthHuman}. 그래서 ${c} 때문에 마음 복잡할수록 첫 번째 이유 하나로 너를 단정하지 말자. 언니는 네가 실제로 반복했던 장면을 같이 봐야 진짜 원인이 더 선명해진다고 봐.`;
    }

    if (noteNum === 4) {
      const bridgeF = profile.balance.bridge
        ? "너처럼 서로 다른 힘이 부딪칠 때는 중간 단계를 하나 넣어주면 훨씬 덜 지쳐."
        : "너는 한 번에 너무 많은 걸 바꾸기보다 한 가지를 먼저 고정하는 게 더 잘 맞아.";
      const bridgeT = profile.balance.bridge
        ? "상반된 힘이 부딪히는 구조라 중간 단계 하나가 필요해. 바로 결론내리지 마."
        : "변수 여러 개를 동시에 바꾸지 마. 하나씩 고정하고 결과를 봐.";
      if (isT) return `처방의 우선순위는 <b>${primaryB.verb}</b>, 그다음 <b>${secondaryB.verb}</b>이야. 반대로 <b>${avoidB.verb}</b>을 과하게 쓰면 다시 꼬인다. ${bridgeT} 특히 ${profile.behavior.weakStatHuman}을 숫자로 확인해.`;
      return `우리 너무 한꺼번에 바꾸지는 말자. 너한테는 먼저 <b>${primaryB.verb}</b>이 제일 잘 맞고, 그게 조금 익숙해지면 <b>${secondaryB.verb}</b>을 붙이면 돼. 반대로 <b>${avoidB.verb}</b>만 계속하면 잘하려고 애쓴 만큼 더 지칠 수 있어. ${bridgeF} 그리고 ${profile.behavior.weakStatHuman}도 언니랑 같이 챙긴다고 생각해줘.`;
    }

    if (noteNum === 5) {
      const help = TEN_GOD_HELP[profile.structure.sangsin] || TEN_GOD_HELP[profile.sipsin.dominant] || "네 선택과 속도를 존중해주는 사람";
      const drain = TEN_GOD_DRAIN[profile.structure.gisin] || TEN_GOD_DRAIN[profile.sipsin.dominant] || "네 기준을 흐리고 계속 긴장시키는 관계";
      if (isT) return `사람 필터는 감정이 아니라 반응으로 봐. <b>${help}</b>은 남기고, <b>${drain}</b>은 거리를 둬. ${profile.relations.hasClash ? "특히 갈등이 생겼을 때 바로 끊기보다 경계선을 먼저 말해보고 반응을 확인해." : "불편함을 오래 참은 뒤 한 번에 정리하지 말고 작은 선부터 빨리 보여줘."}`;
      return `이건 꼭 기억해줘. 너한테 잘 맞는 사람은 <b>${help}</b>이야. 반대로 <b>${drain}</b>에서는 네가 괜찮은 척해도 마음이 생각보다 빨리 닳을 수 있어. ${profile.relations.hasClash ? "마음이 확 돌아서기 전에 작은 불편함부터 말해보자. 그걸 받아주는 사람인지 보는 것도 사랑이고 관계야." : "괜찮은 척 오래 참기 전에 작은 선부터 보여줘도 돼. 네가 편해야 좋은 관계도 오래 가."}`;
    }

    if (noteNum === 6) {
      const phase = profile.timing.hash % 3;
      const phaseF = [
        "좋은 구간이 와도 한 번에 인생을 뒤집으려 하지 말고, 첫 구간에서는 반응을 보고 다음 구간에서 확정해보자.",
        "타이밍이 열릴 때는 준비만 더 하지 말고 작은 행동을 먼저 내보내야 네 흐름이 실제 결과로 이어져.",
        "좋은 때와 쉬어야 할 때를 같은 속도로 보내지 않는 게 중요해. 움직일 때 움직이고, 아닐 땐 체력을 남겨두자.",
      ][phase];
      const phaseT = [
        "첫 좋은 구간은 테스트, 다음 좋은 구간은 확정으로 써. 한 번에 올인하지 마.",
        "좋은 구간엔 준비를 끝내고 실제 행동을 넣어. 준비만 하면 타이밍을 버리는 거야.",
        "밀 달과 지킬 달의 속도를 같게 두지 마. 실행 구간에 행동을 몰아.",
      ][phase];
      if (isT) return `${phaseT} 전체 흐름에서 네가 결과를 만들기 쉬운 방식은 <b>${profile.balance.climateHuman}</b>이야.`;
      return `${phaseF} 그리고 언니가 네 사주에서 꼭 챙겨주고 싶은 건 <b>${profile.balance.climateHuman}</b>이야. 남들 속도 말고 네 리듬으로 움직일 때 훨씬 덜 지치고, 결과도 오래 남아.`;
    }

    return "";
  }

  function applyIntegratedSajuToNotes(notes, data, mode) {
    if (!Array.isArray(notes)) return notes;
    const profile = buildIntegratedSajuProfile(data);
    data.integratedSajuProfile = profile;
    const concernKey = data.concernKey || "money";
    const isT = mode === "T";
    return notes.map((note, idx) => {
      if (!note || typeof note !== "object") return note;
      const addon = integratedAddon(profile, concernKey, idx + 1, isT);
      if (!addon) return note;
      return {
        ...note,
        desc: `${note.desc || ""}<br><br>${addon}`,
      };
    });
  }

  global.buildIntegratedSajuProfile = buildIntegratedSajuProfile;
  global.applyIntegratedSajuToNotes = applyIntegratedSajuToNotes;
  global.__INTEGRATED_SAJU_PROFILE_V1__ = { version: "1.1.0" };

  const base = global.generateConcernNotes;
  if (typeof base === "function" && !base.__integratedProfileWrapped) {
    const wrapped = function (data, mode) {
      const notes = base(data, mode);
      return applyIntegratedSajuToNotes(notes, data || {}, mode);
    };
    wrapped.__integratedProfileWrapped = true;
    wrapped.__base = base;
    global.generateConcernNotes = wrapped;
  }
})(globalThis);
