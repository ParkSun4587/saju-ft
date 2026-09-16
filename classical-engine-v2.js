(function (global) {
  "use strict";

  const ELEMENTS = ["mok", "hwa", "to", "geum", "su"];
  const ELEMENT_KR = { mok: "목(木)", hwa: "화(火)", to: "토(土)", geum: "금(金)", su: "수(水)" };
  const GAN_ELEMENT = {
    甲: "mok", 乙: "mok", 丙: "hwa", 丁: "hwa", 戊: "to",
    己: "to", 庚: "geum", 辛: "geum", 壬: "su", 癸: "su",
  };
  const ZHI_ELEMENT = {
    子: "su", 丑: "to", 寅: "mok", 卯: "mok", 辰: "to", 巳: "hwa",
    午: "hwa", 未: "to", 申: "geum", 酉: "geum", 戌: "to", 亥: "su",
  };
  // 본기 → 중기 → 여기 순서. 세력 계산은 아래 비율을 별도로 적용한다.
  const HIDDEN = {
    子: ["癸"], 丑: ["己", "癸", "辛"], 寅: ["甲", "丙", "戊"], 卯: ["乙"],
    辰: ["戊", "乙", "癸"], 巳: ["丙", "戊", "庚"], 午: ["丁", "己"], 未: ["己", "丁", "乙"],
    申: ["庚", "壬", "戊"], 酉: ["辛"], 戌: ["戊", "辛", "丁"], 亥: ["壬", "甲"],
  };
  const HIDDEN_RATIOS = {
    1: [1],
    2: [0.7, 0.3],
    3: [0.6, 0.25, 0.15],
  };
  const STEM_WEIGHT = { year: 0.8, month: 1.15, hour: 0.9 };
  const BRANCH_WEIGHT = { year: 1.0, month: 3.2, day: 1.7, hour: 1.2 };
  const WANG = new Set(["子", "午", "卯", "酉"]);
  const GRAVE = new Set(["辰", "戌", "丑", "未"]);
  const BIRTH = new Set(["寅", "申", "巳", "亥"]);
  const YANG_GAN = new Set(["甲", "丙", "戊", "庚", "壬"]);
  const LU = { 甲: "寅", 乙: "卯", 丙: "巳", 丁: "午", 戊: "巳", 己: "午", 庚: "申", 辛: "酉", 壬: "亥", 癸: "子" };
  const YANG_REN = { 甲: "卯", 丙: "午", 戊: "午", 庚: "酉", 壬: "子" };

  // 인원사령은 여러 학파에서 운용 방식이 갈리므로 '격의 근거 후보'로만 사용한다.
  const SILYEONG = {
    子: [["壬", 10], ["癸", 20]],
    丑: [["癸", 9], ["辛", 3], ["己", 18]],
    寅: [["戊", 7], ["丙", 7], ["甲", 16]],
    卯: [["甲", 10], ["乙", 20]],
    辰: [["乙", 9], ["癸", 3], ["戊", 18]],
    巳: [["戊", 7], ["庚", 7], ["丙", 16]],
    午: [["丙", 10], ["己", 9], ["丁", 11]],
    未: [["丁", 9], ["乙", 3], ["己", 18]],
    申: [["戊", 7], ["壬", 7], ["庚", 16]],
    酉: [["庚", 10], ["辛", 20]],
    戌: [["辛", 9], ["丁", 3], ["戊", 18]],
    亥: [["戊", 7], ["甲", 5], ["壬", 18]],
  };

  const GYEOK_NAME = {
    정관: "정관격", 편관: "편관격", 정인: "정인격", 편인: "편인격",
    식신: "식신격", 상관: "상관격", 정재: "정재격", 편재: "편재격",
    비견: "비견격", 겁재: "겁재격",
  };

  const GYEOK_RULE = {
    정관격: { flow: "순용", sangsin: ["정재", "편재", "정인", "편인"], gisin: ["상관"] },
    편관격: { flow: "역용", sangsin: ["식신", "정인", "편인"], gisin: ["정재", "편재"] },
    정인격: { flow: "순용", sangsin: ["정관", "편관"], gisin: ["정재", "편재"] },
    편인격: { flow: "역용", sangsin: ["정재", "편재", "편관"], gisin: ["식신"] },
    식신격: { flow: "순용", sangsin: ["정재", "편재"], gisin: ["편인"] },
    상관격: { flow: "복합", sangsin: ["정재", "편재", "정인", "편인"], gisin: ["정관"] },
    정재격: { flow: "순용", sangsin: ["정관", "편관", "식신"], gisin: ["겁재"] },
    편재격: { flow: "순용", sangsin: ["정관", "편관", "식신"], gisin: ["겁재"] },
    건록격: { flow: "역용", sangsin: ["정관", "편관", "정재", "편재"], gisin: [] },
    양인격: { flow: "역용", sangsin: ["편관", "정관"], gisin: [] },
    비견격: { flow: "역용", sangsin: ["정관", "편관", "정재", "편재"], gisin: [] },
    겁재격: { flow: "역용", sangsin: ["편관", "정관"], gisin: [] },
  };

  function nextElement(e) { return ELEMENTS[(ELEMENTS.indexOf(e) + 1) % 5]; }
  function prevElement(e) { return ELEMENTS[(ELEMENTS.indexOf(e) + 4) % 5]; }
  function controls(e) { return ELEMENTS[(ELEMENTS.indexOf(e) + 2) % 5]; }
  function controllerOf(e) { return ELEMENTS[(ELEMENTS.indexOf(e) + 3) % 5]; }

  function ganPolarity(gan) { return YANG_GAN.has(gan) ? "yang" : "yin"; }
  function relationGroup(dayGan, targetGan) {
    const day = GAN_ELEMENT[dayGan];
    const other = GAN_ELEMENT[targetGan];
    if (!day || !other) return "unknown";
    if (other === day) return "self";
    if (other === prevElement(day)) return "print";
    if (other === nextElement(day)) return "output";
    if (other === controls(day)) return "wealth";
    if (other === controllerOf(day)) return "officer";
    return "unknown";
  }
  function tenGod(dayGan, targetGan) {
    const group = relationGroup(dayGan, targetGan);
    const samePolarity = ganPolarity(dayGan) === ganPolarity(targetGan);
    if (group === "self") return samePolarity ? "비견" : "겁재";
    if (group === "output") return samePolarity ? "식신" : "상관";
    if (group === "wealth") return samePolarity ? "편재" : "정재";
    if (group === "officer") return samePolarity ? "편관" : "정관";
    if (group === "print") return samePolarity ? "편인" : "정인";
    return "";
  }
  function tenGodElement(dayGan, tg) {
    const day = GAN_ELEMENT[dayGan];
    if (!day) return null;
    if (["비견", "겁재"].includes(tg)) return day;
    if (["식신", "상관"].includes(tg)) return nextElement(day);
    if (["정재", "편재"].includes(tg)) return controls(day);
    if (["정관", "편관"].includes(tg)) return controllerOf(day);
    if (["정인", "편인"].includes(tg)) return prevElement(day);
    return null;
  }

  function emptyElements() { return { mok: 0, hwa: 0, to: 0, geum: 0, su: 0 }; }
  function clonePillars(input) {
    const out = {};
    for (const pos of ["year", "month", "day", "hour"]) {
      const p = input && input[pos];
      if (p && p.gan && p.zhi) out[pos] = { gan: p.gan, zhi: p.zhi };
    }
    return out;
  }
  function pillarsFromBaZi(baZi, hourKnown) {
    const p = {
      year: { gan: baZi.getYearGan(), zhi: baZi.getYearZhi() },
      month: { gan: baZi.getMonthGan(), zhi: baZi.getMonthZhi() },
      day: { gan: baZi.getDayGan(), zhi: baZi.getDayZhi() },
    };
    if (hourKnown !== false) {
      const gan = baZi.getTimeGan();
      const zhi = baZi.getTimeZhi();
      if (gan && zhi) p.hour = { gan, zhi };
    }
    return p;
  }

  function getElementProfilesV2(pillarsInput) {
    const pillars = clonePillars(pillarsInput);
    const raw = emptyElements();
    const influence = emptyElements();
    for (const pos of Object.keys(pillars)) {
      const { gan, zhi } = pillars[pos];
      if (GAN_ELEMENT[gan]) raw[GAN_ELEMENT[gan]] += 1;
      if (ZHI_ELEMENT[zhi]) raw[ZHI_ELEMENT[zhi]] += 1;
      const stemWeight = pos === "day" ? 1.0 : (STEM_WEIGHT[pos] || 0.8);
      influence[GAN_ELEMENT[gan]] += stemWeight;
      const hidden = HIDDEN[zhi] || [];
      const ratios = HIDDEN_RATIOS[hidden.length] || [];
      const bw = BRANCH_WEIGHT[pos] || 1;
      hidden.forEach((g, i) => { influence[GAN_ELEMENT[g]] += bw * (ratios[i] || 0); });
    }
    const rounded = {};
    for (const e of ELEMENTS) rounded[e] = Math.round(influence[e] * 100) / 100;
    return { raw, influence: rounded };
  }

  function analyzeDayMasterStrengthV2(input) {
    const pillars = clonePillars(input && input.pillars ? input.pillars : input);
    if (!pillars.day || !pillars.month) throw new Error("신강·신약 판정에는 최소 월주와 일주가 필요합니다.");
    const dayGan = pillars.day.gan;
    const dayEl = GAN_ELEMENT[dayGan];
    let supportForce = 0;
    let drainForce = 0;
    const evidence = [];
    const roots = [];
    const components = [];

    function addForce(group, amount, label) {
      if (group === "self") supportForce += amount;
      else if (group === "print") supportForce += amount * 0.84;
      else if (group === "output") drainForce += amount * 0.62;
      else if (group === "wealth") drainForce += amount * 0.74;
      else if (group === "officer") drainForce += amount * 0.98;
      components.push({ label, group, amount: Math.round(amount * 100) / 100 });
    }

    for (const pos of ["year", "month", "hour"]) {
      if (!pillars[pos]) continue;
      const gan = pillars[pos].gan;
      addForce(relationGroup(dayGan, gan), STEM_WEIGHT[pos] || 0.8, `${pos}간 ${gan}`);
    }
    for (const pos of ["year", "month", "day", "hour"]) {
      if (!pillars[pos]) continue;
      const zhi = pillars[pos].zhi;
      const hidden = HIDDEN[zhi] || [];
      const ratios = HIDDEN_RATIOS[hidden.length] || [];
      const bw = BRANCH_WEIGHT[pos] || 1;
      hidden.forEach((gan, i) => {
        const ratio = ratios[i] || 0;
        const group = relationGroup(dayGan, gan);
        addForce(group, bw * ratio, `${pos}지 ${zhi}·${gan}`);
        if (group === "self") roots.push({ pos, zhi, gan, weight: Math.round(bw * ratio * 100) / 100 });
      });
    }

    // 통근은 이미 지장간 세력에 포함되지만, 월지/일지의 실제 비겁 뿌리는 '득지'로 소폭 보강한다.
    let rootBonus = 0;
    for (const r of roots) {
      if (r.pos === "month") rootBonus += 0.45 * r.weight;
      else if (r.pos === "day") rootBonus += 0.32 * r.weight;
      else rootBonus += 0.15 * r.weight;
    }
    supportForce += rootBonus;

    const total = supportForce + drainForce || 1;
    const supportRatio = supportForce / total;
    let verdict = "중화";
    if (supportRatio >= 0.58) verdict = "신강";
    else if (supportRatio <= 0.42) verdict = "신약";
    const extreme = supportRatio >= 0.72 ? "극강" : supportRatio <= 0.28 ? "극약" : null;
    const score = (supportRatio - 0.5) * 20;
    const monthZhi = pillars.month.zhi;
    const monthMain = (HIDDEN[monthZhi] || [])[0] || "";
    const monthGroup = relationGroup(dayGan, monthMain);
    const monthState = ["self", "print"].includes(monthGroup) ? "득령 쪽" : "설·극 쪽";
    evidence.push(`월령 ${monthZhi} 본기 ${monthMain}: ${monthState}`);
    evidence.push(`비겁 통근: ${roots.length ? roots.map(r => `${r.pos}:${r.zhi}`).join(", ") : "뚜렷하지 않음"}`);
    evidence.push(`부조 ${supportForce.toFixed(2)} / 설·재·관 ${drainForce.toFixed(2)} / 부조비 ${Math.round(supportRatio * 100)}%`);

    return {
      verdict,
      extreme,
      score: Math.round(score * 100) / 100,
      supportRatio: Math.round(supportRatio * 1000) / 1000,
      supportForce: Math.round(supportForce * 100) / 100,
      drainForce: Math.round(drainForce * 100) / 100,
      roots,
      monthCommand: { zhi: monthZhi, mainGan: monthMain, relation: monthGroup },
      components,
      evidence,
      method: "월령·지장간·통근·천간 부조/설극 통합",
    };
  }

  function saryeongGan(zhi, daysFromJie) {
    if (!Number.isFinite(daysFromJie) || !SILYEONG[zhi]) return null;
    let cursor = 0;
    const d = Math.max(0, daysFromJie);
    for (const [gan, days] of SILYEONG[zhi]) {
      cursor += days;
      if (d < cursor) return gan;
    }
    return SILYEONG[zhi][SILYEONG[zhi].length - 1][0];
  }

  function gyeokNameFor(dayGan, monthZhi, basisGan) {
    if (LU[dayGan] === monthZhi) return "건록격";
    if (YANG_REN[dayGan] === monthZhi) return "양인격";
    const tg = tenGod(dayGan, basisGan);
    return GYEOK_NAME[tg] || "평격";
  }

  function determineGyeokgukFromPillarsV2(pillarsInput, calendarMeta) {
    const p = clonePillars(pillarsInput);
    if (!p.day || !p.month) return { name: "평격", sipsin: "", basisGan: "", touchul: false, basis: "자료 부족" };
    const dayGan = p.day.gan;
    const monthZhi = p.month.zhi;
    const hidden = (HIDDEN[monthZhi] || []).slice();
    const otherGans = [p.year, p.month, p.hour].filter(Boolean).map(x => x.gan);
    const visibleHidden = hidden.filter(g => otherGans.includes(g));
    const days = Number(calendarMeta && calendarMeta.daysFromJie);
    const commanding = saryeongGan(monthZhi, days);
    let basisGan = hidden[0] || "";
    let basis = "월령 본기";
    let branchType = "기타";

    if (WANG.has(monthZhi)) {
      branchType = "왕지";
      basisGan = hidden[0];
      basis = "왕지 본기 고정";
    } else if (GRAVE.has(monthZhi)) {
      branchType = "고지";
      if (commanding && hidden.includes(commanding)) {
        basisGan = commanding;
        basis = "고지 사령";
      } else if (visibleHidden.length) {
        basisGan = visibleHidden[0];
        basis = "고지 투출 지장간";
      }
    } else if (BIRTH.has(monthZhi)) {
      branchType = "생지";
      if (visibleHidden.includes(hidden[0]) || visibleHidden.length === 0) {
        basisGan = hidden[0];
        basis = "생지 본기";
      } else {
        basisGan = visibleHidden[0];
        basis = "생지 투출 지장간";
      }
    }

    const tg = tenGod(dayGan, basisGan);
    const name = gyeokNameFor(dayGan, monthZhi, basisGan);
    const candidates = [];
    function addCandidate(gan, why) {
      if (!gan || candidates.some(c => c.gan === gan)) return;
      candidates.push({ gan, sipsin: tenGod(dayGan, gan), name: gyeokNameFor(dayGan, monthZhi, gan), basis: why });
    }
    addCandidate(basisGan, basis);
    addCandidate(hidden[0], "월령 본기");
    visibleHidden.forEach(g => addCandidate(g, "투출"));
    if (commanding) addCandidate(commanding, "사령 후보");

    return {
      name,
      sipsin: tg,
      basisGan,
      touchul: otherGans.includes(basisGan),
      basis,
      branchType,
      saryeongGan: commanding,
      hiddenGans: hidden,
      visibleHidden,
      candidates,
      confidence: WANG.has(monthZhi) ? "high" : Number.isFinite(days) ? "high" : "medium",
    };
  }

  function determineGyeokgukV2(baZi, candidateGans, calendarMeta) {
    const p = pillarsFromBaZi(baZi, true);
    // candidateGans는 기존 호출부 호환용. 실제 판정은 원국 천간을 직접 사용한다.
    return determineGyeokgukFromPillarsV2(p, calendarMeta || {});
  }

  function evaluateGyeokStatusV2(gyeokguk, pillarSipsin) {
    const rule = GYEOK_RULE[gyeokguk && gyeokguk.name];
    if (!rule) return { status: "평격", sangsinFound: null, gisinFound: null, flow: "중립", evidence: ["정격 규칙 미적용"] };
    const visible = [];
    for (const pos of ["year", "month", "hour"]) {
      const x = pillarSipsin && pillarSipsin[pos];
      if (x && x.gan) visible.push(x.gan);
      else if (typeof x === "string") visible.push(x);
    }
    const sangsinFound = rule.sangsin.find(x => visible.includes(x)) || null;
    const gisinFound = rule.gisin.find(x => visible.includes(x)) || null;
    let status = "평격";
    if (sangsinFound && !gisinFound) status = "성격";
    else if (sangsinFound && gisinFound) status = "성중유패";
    else if (!sangsinFound && gisinFound) status = "파격";
    return {
      status,
      sangsinFound,
      gisinFound,
      flow: rule.flow,
      evidence: [
        `${gyeokguk.name} ${rule.flow}`,
        `상신 후보 ${rule.sangsin.join("·") || "없음"}`,
        `기신 후보 ${rule.gisin.join("·") || "없음"}`,
        `천간 노출 ${visible.join("·") || "없음"}`,
      ],
    };
  }

  function climateScores(monthZhi) {
    const score = emptyElements();
    const reasons = [];
    if (["亥", "子", "丑"].includes(monthZhi)) {
      score.hwa += 2.1;
      score.mok += 0.35;
      reasons.push("겨울 한기 보정: 화를 우선, 목은 화를 돕는 보조");
    } else if (["巳", "午", "未"].includes(monthZhi)) {
      score.su += 2.1;
      score.geum += 0.35;
      reasons.push("여름 열기·건조 보정: 수를 우선, 금은 수를 돕는 보조");
    } else if (monthZhi === "戌") {
      score.su += 0.7;
      reasons.push("술월의 건조 보정: 수에 소폭 가점");
    } else if (monthZhi === "辰") {
      score.hwa += 0.35;
      reasons.push("진월의 습기를 고려해 화에 소폭 가점");
    }
    return { score, reasons };
  }

  function bridgeElement(influence) {
    const vals = ELEMENTS.map(e => influence[e] || 0);
    const avg = vals.reduce((a,b) => a+b,0) / 5;
    let best = null;
    for (const controller of ELEMENTS) {
      const controlled = controls(controller);
      if ((influence[controller] || 0) < avg * 1.15 || (influence[controlled] || 0) < avg * 1.15) continue;
      const bridge = nextElement(controller);
      if (nextElement(bridge) !== controlled) continue;
      const pressure = (influence[controller] || 0) + (influence[controlled] || 0);
      if (!best || pressure > best.pressure) best = { controller, controlled, bridge, pressure };
    }
    return best;
  }

  function selectYongshinV2(input) {
    const p = clonePillars(input.pillars);
    const dayGan = p.day.gan;
    const day = GAN_ELEMENT[dayGan];
    const strength = input.strength || analyzeDayMasterStrengthV2({ pillars: p });
    const profiles = input.elementProfiles || getElementProfilesV2(p);
    const influence = profiles.influence;
    const scores = {};
    const detail = {};
    for (const e of ELEMENTS) { scores[e] = 0; detail[e] = []; }
    const roles = {
      [day]: "self",
      [prevElement(day)]: "print",
      [nextElement(day)]: "output",
      [controls(day)]: "wealth",
      [controllerOf(day)]: "officer",
    };
    const strongWeight = { self: -2.5, print: -2.0, output: 2.4, wealth: 2.1, officer: 2.5 };
    const weakWeight = { self: 2.3, print: 2.6, output: -1.3, wealth: -1.7, officer: -2.3 };
    const neutralWeight = { self: -0.15, print: 0.1, output: 0.25, wealth: 0.2, officer: 0.2 };
    const table = strength.verdict === "신강" ? strongWeight : strength.verdict === "신약" ? weakWeight : neutralWeight;
    for (const e of ELEMENTS) {
      const v = table[roles[e]] || 0;
      scores[e] += v;
      detail[e].push({ layer: "억부", value: v, reason: `${strength.verdict}·${roles[e]}` });
    }

    const climate = climateScores(p.month.zhi);
    for (const e of ELEMENTS) {
      if (climate.score[e]) {
        scores[e] += climate.score[e];
        detail[e].push({ layer: "조후", value: climate.score[e], reason: climate.reasons.join(" / ") });
      }
    }

    const bridge = bridgeElement(influence);
    if (bridge) {
      scores[bridge.bridge] += 1.15;
      detail[bridge.bridge].push({ layer: "통관", value: 1.15, reason: `${ELEMENT_KR[bridge.controller]}↔${ELEMENT_KR[bridge.controlled]} 충돌 사이 통관` });
    }

    const rule = GYEOK_RULE[input.gyeokguk && input.gyeokguk.name];
    if (rule && rule.sangsin.length) {
      const seen = new Set();
      for (const tg of rule.sangsin) {
        const e = tenGodElement(dayGan, tg);
        if (!e || seen.has(e)) continue;
        seen.add(e);
        scores[e] += 0.85;
        detail[e].push({ layer: "격국", value: 0.85, reason: `${input.gyeokguk.name} 상신 후보 ${tg}` });
      }
    }

    const totalInfluence = ELEMENTS.reduce((s,e) => s + (influence[e] || 0), 0) || 1;
    for (const e of ELEMENTS) {
      const share = (influence[e] || 0) / totalInfluence;
      if (share > 0.34) {
        const penalty = Math.min(1.25, (share - 0.34) * 6);
        scores[e] -= penalty;
        detail[e].push({ layer: "과다", value: -penalty, reason: `원국 영향도 ${Math.round(share*100)}%로 이미 과다` });
      }
    }

    const ranked = ELEMENTS.slice().sort((a,b) => scores[b] - scores[a] || (influence[a]||0) - (influence[b]||0));
    const primary = ranked[0];
    const secondary = ranked[1];
    const avoid = ranked[ranked.length - 1];
    return {
      primary,
      secondary,
      avoid,
      scores: Object.fromEntries(ELEMENTS.map(e => [e, Math.round(scores[e]*100)/100])),
      detail,
      strengthVerdict: strength.verdict,
      bridge,
      climateReasons: climate.reasons,
      method: "억부 + 한난조습 보정 + 통관 + 격국 상신 보정",
      caveat: "용신은 학파별 판정 차이가 있어 이 앱은 위 규칙을 고정해 일관되게 계산합니다.",
    };
  }

  function buildClassicalLayersV2(input) {
    const p = clonePillars(input.pillars);
    const strength = input.strength || analyzeDayMasterStrengthV2({ pillars: p });
    const profiles = input.elementProfiles || getElementProfilesV2(p);
    const gyeokguk = input.gyeokguk || determineGyeokgukFromPillarsV2(p, input.calendarMeta || {});
    const yong = input.yongshinDetail || selectYongshinV2({ pillars: p, strength, elementProfiles: profiles, gyeokguk });
    return {
      japyeong: {
        principle: "월령·지장간·투출을 먼저 보고 격의 뼈대를 정함",
        monthBranch: p.month && p.month.zhi,
        gyeokName: gyeokguk.name,
        basisGan: gyeokguk.basisGan,
        basis: gyeokguk.basis,
        branchType: gyeokguk.branchType,
        candidates: gyeokguk.candidates || [],
      },
      jeokcheon: {
        principle: "일간 자체 숫자보다 득령·통근·부조와 설·재·관의 전체 기세를 함께 비교",
        dayMasterStrength: strength.verdict,
        score: strength.score,
        supportForce: strength.supportForce,
        drainForce: strength.drainForce,
        evidence: strength.evidence,
      },
      qiongtong: {
        principle: "월령의 한난조습을 별도 보정층으로 반영",
        direction: yong.climateReasons.length ? yong.climateReasons.join(" / ") : "극단적 한난조습 보정이 크지 않은 계절",
        caveat: "고전의 일간×월령 원문을 그대로 자동 대입한 것이 아니라, 한난조습 원리를 보조 점수로만 사용합니다.",
      },
      yongshin: {
        primary: yong.primary,
        primaryName: ELEMENT_KR[yong.primary],
        secondary: yong.secondary,
        secondaryName: ELEMENT_KR[yong.secondary],
        avoid: yong.avoid,
        avoidName: ELEMENT_KR[yong.avoid],
        method: yong.method,
        scores: yong.scores,
        detail: yong.detail,
        caveat: yong.caveat,
      },
      elements: {
        rawVisible: profiles.raw,
        influence: profiles.influence,
        note: "rawVisible은 겉으로 보이는 6~8글자 개수, influence는 월령·지장간·자리 가중치를 반영한 해석용 세력값입니다.",
      },
    };
  }

  global.getElementProfilesV2 = getElementProfilesV2;
  global.analyzeDayMasterStrengthV2 = analyzeDayMasterStrengthV2;
  global.determineGyeokgukV2 = determineGyeokgukV2;
  global.determineGyeokgukFromPillarsV2 = determineGyeokgukFromPillarsV2;
  global.evaluateGyeokStatusV2 = evaluateGyeokStatusV2;
  global.selectYongshinV2 = selectYongshinV2;
  global.buildClassicalLayersV2 = buildClassicalLayersV2;
  global.__CLASSICAL_ENGINE_V2__ = {
    version: "2.0.0",
    elements: ELEMENTS.slice(),
    hidden: HIDDEN,
    lu: LU,
    yangRen: YANG_REN,
    tenGod,
    relationGroup,
    tenGodElement,
    saryeongGan,
  };
})(globalThis);
