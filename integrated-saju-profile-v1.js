(function (global) {
  "use strict";

  const VERSION = "2.1.0";
  const ELEMENTS = ["mok", "hwa", "to", "geum", "su"];

  function safeNum(v, fallback) {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  }

  function stableHash(input) {
    const s = typeof input === "string" ? input : JSON.stringify(input || {});
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return (h >>> 0).toString(16).padStart(8, "0");
  }

  function rankElements(obj) {
    const order = ELEMENTS.map((key) => [key, safeNum(obj && obj[key], 0)])
      .sort((a, b) => b[1] - a[1] || ELEMENTS.indexOf(a[0]) - ELEMENTS.indexOf(b[0]));
    return {
      strongest: order[0]?.[0] || "to",
      weakest: order[order.length - 1]?.[0] || "to",
      order: order.map((x) => x[0]),
      values: Object.fromEntries(order),
      spread: order.length ? Math.round((order[0][1] - order[order.length - 1][1]) * 100) / 100 : 0,
    };
  }

  function normalizeDominant(raw) {
    if (typeof raw === "string") return raw;
    return raw && typeof raw.name === "string" ? raw.name : "";
  }

  function topGods(count, dominant) {
    const rows = Object.entries(count || {}).map(([k, v]) => [k, safeNum(v, 0)])
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "ko"));
    const first = dominant || rows[0]?.[0] || "";
    const second = rows.find((r) => r[0] !== first)?.[0] || "";
    return { first, second, rows };
  }

  function buildIntegratedSajuProfile(data) {
    data = data || {};
    const ap = data.analysisProfile || {};
    const classical = ap.classical || {};
    const structure = ap.structure || {};
    const strength = data.strengthDetail || ap.strengthDetail || classical.jeokcheon || {};
    const elementProfiles = data.elementProfiles || ap.elementProfiles || classical.elements || {};
    const raw = elementProfiles.raw || elementProfiles.rawVisible || classical.elements?.rawVisible || data.elements || {};
    const influence = elementProfiles.influence || classical.elements?.influence || {};
    const rawRank = rankElements(raw);
    const influenceRank = rankElements(influence);
    const gods = topGods(ap.sipsin?.count || {}, normalizeDominant(ap.sipsin?.dominant));
    const yong = data.yongshinDetail || ap.yongshinDetail || classical.yongshin || {};
    const status = data.gyeokStatus?.status || structure.status || "평격";
    const sangsin = data.gyeokStatus?.sangsinFound || structure.sangsin || "";
    const gisin = data.gyeokStatus?.gisinFound || structure.gisin || "";
    const timing = data.realYeonun || ap.timing?.yeonun || {};
    const pillars = data.pillars || {};
    const hasClash = !!(ap.relations?.hasChung || data.hasChung);
    const supportRatio = safeNum(strength.supportRatio ?? ap.dayMaster?.supportRatio, 0.5);
    const verdict = strength.verdict || ap.dayMaster?.strength || "중화";

    const coverage = {
      pillars: !!(pillars.year || pillars.month || pillars.day || pillars.hour),
      rawElements: Object.keys(raw || {}).length > 0,
      influenceElements: Object.keys(influence || {}).length > 0,
      monthSeason: !!(classical.japyeong?.monthBranch || pillars.month?.zhi),
      hiddenAndCommanding: !!(
        structure.saryeongGan ||
        structure.hiddenGans?.length ||
        structure.candidates?.length ||
        data.gyeokguk?.hiddenGans?.length
      ),
      strength: !!verdict,
      strengthForces: Number.isFinite(Number(strength.supportForce)) && Number.isFinite(Number(strength.drainForce)),
      roots: Array.isArray(strength.roots),
      sipsin: !!gods.first || Array.isArray(ap.sipsin?.all),
      gyeok: !!(structure.gyeokName || data.gyeokguk?.name),
      gyeokStatus: !!status,
      sangsinGisin: !!sangsin || !!gisin || status === "평격",
      touchul: typeof (structure.touchul ?? data.gyeokguk?.touchul) === "boolean",
      yongshin: !!(yong.primary || data.yongshin),
      bridge: Object.prototype.hasOwnProperty.call(yong, "bridge"),
      relations: typeof hasClash === "boolean",
      timing: Object.keys(timing || {}).length > 0,
    };

    const profile = {
      version: VERSION,
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
        deukryeong: strength.deukryeong || null,
        deukji: strength.deukji || null,
        deukse: strength.deukse || null,
        components: Array.isArray(strength.components) ? strength.components : [],
        evidence: Array.isArray(strength.evidence) ? strength.evidence : [],
        method: strength.method || "",
      },
      elements: {
        raw,
        influence,
        rawRank,
        influenceRank,
        rawVsInfluenceMismatch:
          rawRank.strongest !== influenceRank.strongest ||
          rawRank.weakest !== influenceRank.weakest,
      },
      sipsin: {
        dominant: gods.first,
        secondary: gods.second,
        counts: ap.sipsin?.count || {},
        all: Array.isArray(ap.sipsin?.all) ? ap.sipsin.all : [],
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
        touchul: !!(structure.touchul ?? data.gyeokguk?.touchul),
        branchType: structure.branchType || data.gyeokguk?.branchType || "",
        saryeongGan: structure.saryeongGan || data.gyeokguk?.saryeongGan || "",
        hiddenGans: Array.isArray(data.gyeokguk?.hiddenGans)
          ? data.gyeokguk.hiddenGans
          : (Array.isArray(structure.hiddenGans) ? structure.hiddenGans : []),
        visibleHidden: Array.isArray(data.gyeokguk?.visibleHidden)
          ? data.gyeokguk.visibleHidden
          : (Array.isArray(structure.visibleHidden) ? structure.visibleHidden : []),
        candidates: Array.isArray(data.gyeokguk?.candidates)
          ? data.gyeokguk.candidates
          : (Array.isArray(structure.candidates) ? structure.candidates : []),
        confidence: data.gyeokguk?.confidence || structure.confidence || "",
        statusEvidence: Array.isArray(data.gyeokStatus?.evidence) ? data.gyeokStatus.evidence : [],
      },
      balance: {
        primary: yong.primary || data.yongshin || "",
        secondary: yong.secondary || "",
        avoid: yong.avoid || "",
        scores: yong.scores || {},
        detail: yong.detail || {},
        strengthVerdict: yong.strengthVerdict || verdict,
        bridge: yong.bridge || null,
        method: yong.method || "",
        caveat: yong.caveat || "",
      },
      relations: {
        hasClash,
        raw: ap.relations || {},
      },
      behavior: {
        stats: data.stats || ap.stats || {},
      },
      calendarMeta: data.calendarMeta || null,
      classical: {
        japyeong: classical.japyeong || null,
        jeokcheon: classical.jeokcheon || null,
        yongshin: classical.yongshin || null,
        elements: classical.elements || null,
      },
      timing: {
        raw: timing,
        hash: stableHash(timing),
      },
      audit: {
        coverage,
        missing: Object.keys(coverage).filter((k) => !coverage[k]),
        note: "이 프로필은 계산 데이터를 보존하는 전달층이며 NOTE 결론을 generic 성향값으로 압축하지 않는다.",
      },
    };

    profile.fingerprint = [
      pillars.year?.gan || "", pillars.year?.zhi || "",
      pillars.month?.gan || "", pillars.month?.zhi || "",
      pillars.day?.gan || "", pillars.day?.zhi || "",
      pillars.hour?.gan || "", pillars.hour?.zhi || "",
      verdict, Math.round(supportRatio * 1000),
      influenceRank.order.join(""),
      profile.sipsin.all.map((x) => `${x.pillar || ""}:${x.position || ""}:${x.value || ""}`).join(","),
      profile.structure.gyeokName,
      profile.structure.basisGan,
      profile.structure.saryeongGan,
      profile.structure.status,
      profile.structure.sangsin,
      profile.structure.gisin,
      profile.structure.touchul ? "out" : "in",
      profile.strength.deukryeong?.active ? "deukryeong" : "not-deukryeong",
      profile.strength.deukji?.quality || "",
      profile.strength.deukse?.active ? "deukse" : "not-deukse",
      profile.balance.primary,
      profile.balance.secondary,
      profile.balance.avoid,
      hasClash ? "clash" : "steady",
    ].join("|");

    return profile;
  }

  global.buildIntegratedSajuProfile = buildIntegratedSajuProfile;
  global.__INTEGRATED_SAJU_PROFILE_V1__ = { version: VERSION };
})(globalThis);
