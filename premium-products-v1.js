(function (global) {
  "use strict";

  const CONCERNS = {
    money: "돈·재물",
    career: "학업·직장",
    love: "연애·썸",
    path: "진로·적성",
    people: "사람·관계",
    mental: "마음·스트레스",
  };

  const FALLBACK_SITUATIONS = {
    money: [["saving","돈이 잘 안 모여"],["income","수입을 더 늘리고 싶어"],["side","부업·새 수입을 만들고 싶어"],["flow","앞으로 돈 흐름이 궁금해"]],
    career: [["exam","시험·합격이 궁금해"],["jobsearch","취업 준비 중이야"],["move","이직·퇴사를 고민 중이야"],["current","지금 자리에서 잘 풀리고 싶어"]],
    love: [["crush","썸·짝사랑 중이야"],["relationship","지금 연애 중이야"],["breakup","헤어진 사람이 있어"],["new","새로운 인연을 만나고 싶어"]],
    path: [["lost","뭘 해야 할지 모르겠어"],["current","지금 가는 길이 맞는지 궁금해"],["switch","다른 분야로 바꾸고 싶어"],["strength","내 적성·강점을 알고 싶어"]],
    people: [["friend","친구·지인 때문에 힘들어"],["work","직장 사람 때문에 힘들어"],["family","가족과 자꾸 부딪혀"],["distance","계속 볼지 거리를 둘지 고민이야"]],
    mental: [["burnout","번아웃이 온 것 같아"],["overthink","생각이 너무 많아"],["low","아무것도 하기 싫어"],["recover","다시 컨디션을 찾고 싶어"]],
  };

  function situationRows(key) {
    const live = global.__CONCERN_SITUATIONS__?.[key]?.options;
    if (Array.isArray(live) && live.length) {
      return live.map((row) => [row[0], row[1]]);
    }
    return FALLBACK_SITUATIONS[key] || [];
  }

  function situationLabel(key, situation) {
    return situationRows(key).find((row) => row[0] === situation)?.[1] || "";
  }

  function situationSelectOptions(key, selected) {
    return `<option value="">지금 상황 선택</option>${situationRows(key)
      .map(([value,label]) => `<option value="${esc(value)}" ${selected === value ? "selected" : ""}>${esc(label)}</option>`)
      .join("")}`;
  }


  const PRODUCTS = {
    concern_bundle3: {
      id: "concern_bundle3",
      name: "고민 3개 더 깊게",
      price: 2900,
      badge: "다른 고민 3개 확장",
      desc: "지금 고민은 그대로 두고, 다른 고민 3개를 각각 같은 깊이로 풀어. 세 고민에 반복되는 공통 구조도 마지막에 묶어봐.",
    },
    full_saju: {
      id: "full_saju",
      name: "내 전체 사주판",
      price: 4900,
      badge: "전체 구조 + 5년 흐름",
      desc: "고민 하나가 아니라 내 사주 전체 구조, 여러 삶의 영역이 연결되는 이유, 가까운 핵심 시기와 향후 5년 큰 흐름을 한 장으로 이어서 봐.",
    },
    compatibility: {
      id: "compatibility",
      name: "우리 둘 궁합",
      price: 5900,
      badge: "두 사람 사주 교차",
      desc: "내 사주만으로는 만들 수 없는 결과야. 상대 사주까지 겹쳐 끌림·오해·갈등·보완과 둘만의 관계 시기를 같이 봐.",
    },
    all_in_one: {
      id: "all_in_one",
      name: "내 사주 완전판",
      price: 9900,
      badge: "나 한 사람 전체판",
      desc: "전체 사주판과 6가지 고민, 고민 간 공통패턴, 5년 흐름과 영역 간 변곡점을 한 번에 열어. 두 사람 궁합은 포함하지 않아.",
    },
  };

  const ELEMENT_WORD = {
    mok: "시작하고 넓히는 힘",
    hwa: "표현하고 반응을 만드는 힘",
    to: "쌓고 지키는 힘",
    geum: "기준을 세우고 정리하는 힘",
    su: "정보를 모으고 여백을 만드는 힘",
  };

  function esc(v) {
    return String(v == null ? "" : v)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function won(v) { return Number(v || 0).toLocaleString("ko-KR") + "원"; }

  function getData() {
    try { return typeof currentResultData !== "undefined" ? currentResultData : null; }
    catch (_) { return null; }
  }

  function getMode(data) {
    return data?.currentMode || (typeof selectedSplitMode !== "undefined" && selectedSplitMode) || "F";
  }

  function productVoice(data, copy) {
    const mode = getMode(data) === "T" ? "T" : "F";
    if (typeof copy === "string") return copy;
    return copy?.[mode] || copy?.F || copy?.T || "";
  }

  function productToast(data, copy) {
    if (typeof showToast === "function") showToast(productVoice(data, copy));
  }

  function applyProductModalVoice(root, data) {
    if (!root) return;
    const paymentTitle = root.querySelector("#unniProductPaymentTitle");
    const paymentSub = root.querySelector("#unniProductPaymentSub");
    const actionHint = root.querySelector("#unniProductActionHint");
    const accessNote = root.querySelector("#unniProductAccessNote");
    if (paymentTitle) {
      paymentTitle.textContent = productVoice(data, {
        F: "응, 그럼 이걸로 더 보자",
        T: "좋아. 결제수단만 고르면 돼",
      });
    }
    if (paymentSub) {
      paymentSub.textContent = productVoice(data, {
        F: "원하는 결제수단만 골라줘. 확인되면 바로 이어서 볼게",
        T: "결제수단만 고르면 돼. 확인되면 바로 이어서 보자.",
      });
    }
    if (actionHint) {
      actionHint.textContent = productVoice(data, {
        F: "선택한 결제수단으로 결제돼.",
        T: "선택한 결제수단으로 결제돼.",
      });
    }
    if (accessNote) {
      accessNote.textContent = productVoice(data, {
        F: "한 번 결제한 내용은 이 브라우저에서 추가 결제 없이 다시 볼 수 있어.",
        T: "한 번 결제한 내용은 이 브라우저에서 추가 결제 없이 다시 볼 수 있어.",
      });
    }
  }

  function getProfile(data) {
    if (!data) return null;
    if (data.integratedSajuProfile) return data.integratedSajuProfile;
    if (typeof global.buildIntegratedSajuProfile === "function") {
      try { return global.buildIntegratedSajuProfile(data); } catch (_) {}
    }
    return null;
  }

  function getReasoning(data) {
    if (!data) return null;
    if (data.classicalReasoningV1) return data.classicalReasoningV1;
    if (typeof global.buildClassicalReasoningV1 === "function") {
      try { return global.buildClassicalReasoningV1(data); } catch (_) {}
    }
    return null;
  }

  function contentPolicy(productId) {
    return global.__UNNI_PRODUCT_CONTENT_POLICY_V1__?.getContract?.(productId)
      || global.__UNNI_PRODUCT_CONTENT_POLICY_V1__?.contracts?.[productId]
      || null;
  }

  function productPolicyApi() {
    return global.__UNNI_PRODUCT_CONTENT_POLICY_V1__ || null;
  }

  function policyGate(productId, features, context) {
    const api = productPolicyApi();
    if (!api?.validateProductPayload) {
      return { ok:false, errors:["policy-unavailable"], deniedFeatures:features || [] };
    }
    return api.validateProductPayload(productId, {
      features: features || [],
      ...(context || {}),
    });
  }

  function policyBlockedHtml(productId, gate) {
    const reason = (gate?.errors || []).join(",");
    const blockedKind = productId === "compatibility" ? "compatibility" : "policy";
    return `<p data-content-blocked="${blockedKind}" data-policy-blocked="1" data-product-contract="${esc(productId)}" data-policy-errors="${esc(reason)}" style="font-size:13px;line-height:1.8;color:#475569">이 내용은 지금 선택한 상품 범위에서는 보여줄 수 없어.</p>`;
  }

  function policyTiming(productId, timing) {
    const api = productPolicyApi();
    return api?.filterTimingForProduct
      ? api.filterTimingForProduct(productId, timing || {})
      : { concernNearTerm:null,longTermPivots:[],fullSajuTimeline:null,compatibilityTimeline:null,fullHorizon:null };
  }

  function productValueCopy(productId) {
    return global.__UNNI_PRODUCT_CONTENT_POLICY_V1__?.valueCopy?.[productId] || null;
  }

  function entitlementApi() {
    return global.__UNNI_PRODUCT_ENTITLEMENTS_V1__ || null;
  }

  let entitlementCacheKey = "";
  let entitlementCache = null;
  let entitlementPromise = null;

  function entitlementSubjectKey(data) {
    return JSON.stringify([
      data?.name || data?.userName || "",
      data?.userBirthStr || "",
      data?.userTimeKey || "unknown",
      data?.userGender || "female",
      data?.userCalendar || "solar",
      data?.isLeapMonth === true,
    ]);
  }

  function invalidateEntitlementCache() {
    entitlementCacheKey = "";
    entitlementCache = null;
    entitlementPromise = null;
  }

  function collectStoredPremiumGrants() {
    const rows = [];
    const prefix = "unni_product_grant_v1_";
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i) || "";
        if (!key.startsWith(prefix)) continue;
        let grant = null;
        try { grant = JSON.parse(localStorage.getItem(key) || "null"); } catch (_) {}
        if (!grant?.token || !grant?.userKey) continue;
        rows.push({ key, grant, userKey:grant.userKey, token:grant.token });
      }
    } catch (_) {}
    const seen = new Set();
    return rows.filter((row) => {
      const sig = row.userKey + "|" + row.token;
      if (seen.has(sig)) return false;
      seen.add(sig);
      return true;
    });
  }

  function entitlementTokenRecords() {
    return collectStoredPremiumGrants().map((row) => ({ userKey:row.userKey, token:row.token }));
  }

  async function resolveVerifiedEntitlements(data, { force = false } = {}) {
    const key = entitlementSubjectKey(data);
    if (!force && entitlementCache && entitlementCacheKey === key) return entitlementCache;
    if (!force && entitlementPromise && entitlementCacheKey === key) return entitlementPromise;
    if (typeof paymentAPI !== "function" || typeof resultSnapshot !== "function") {
      return { verifiedPurchases:[], effectiveEntitlements:[], allInOneQuote:null, unavailable:true };
    }
    entitlementCacheKey = key;
    const records = entitlementTokenRecords();
    entitlementPromise = paymentAPI({
      action:"entitlements",
      data:resultSnapshot(data),
      tokens:records,
    }).then((state) => {
      entitlementCache = state;
      entitlementPromise = null;
      return state;
    }).catch((error) => {
      entitlementPromise = null;
      throw error;
    });
    return entitlementPromise;
  }

  function cachedEntitlements(data) {
    return entitlementCacheKey === entitlementSubjectKey(data) ? entitlementCache : null;
  }

  function verifiedGrantFor(state, productId) {
    const purchase = (state?.verifiedPurchases || []).find((row) => row.productId === productId);
    if (!purchase) return null;
    return collectStoredPremiumGrants().find((row) => row.userKey === purchase.userKey)?.grant || null;
  }

  function productStateFor(productId, state) {
    return entitlementApi()?.getProductState?.(productId,state)
      || { kind:"unpurchased", productId, amount:PRODUCTS[productId]?.price || 0, label:`${won(PRODUCTS[productId]?.price || 0)}에 열기` };
  }

  const TEN_GOD_WORD = {
    비견:"내 기준과 버티는 힘",겁재:"내 몫을 확보하는 힘",
    식신:"꾸준히 만들어 밖으로 빼는 힘",상관:"막힌 걸 표현하고 바꾸는 힘",
    정재:"안정적으로 현실 조건을 관리하는 힘",편재:"기회와 자원을 넓게 움직이는 힘",
    정관:"기준과 책임을 세우는 힘",편관:"강한 압박을 다루는 힘",
    정인:"배우고 보호받아 기반을 세우는 힘",편인:"깊게 파고들어 다른 길을 찾는 힘",
  };

  function stripTags(v) {
    return String(v || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  }

  function reasoningMainZiping(reasoning) {
    return reasoning?.ziping?.findings?.find((x) => x.id !== "ZZ_MONTH_101" && x.kind === "gyeok" && x.implementationStatus !== "unimplemented")
      || reasoning?.ziping?.findings?.find((x) => x.id === "ZZ_MONTH_101")
      || null;
  }

  function strengthCopy(profile, isT) {
    if (!profile) return isT ? "한 가지 장면만 보고 판단하지 말고 반복되는 반응을 봐." : "한 장면만으로 너를 단정하지 않아도 돼.";
    return isT ? profile.strength?.T : profile.strength?.F;
  }

  function fullSajuSections(data, mode) {
    const p = getProfile(data);
    const r = getReasoning(data);
    const isT = mode === "T";
    if (!p || !r) return [];

    const dom = p.sipsin?.dominantHuman || "자기 기준을 찾고 움직이는 성향";
    const second = p.sipsin?.secondaryHuman || "";
    const strongEl = p.elements?.influenceRank?.strongest || r.context?.elementRanking?.[0]?.element || "";
    const weakEl = p.elements?.influenceRank?.weakest || r.context?.elementRanking?.at?.(-1)?.element || "";
    const strong = ELEMENT_WORD[strongEl] || "익숙한 방식으로 밀어가는 힘";
    const weak = ELEMENT_WORD[weakEl] || "일부러 챙겨야 하는 힘";
    const strength = r.profile?.strength || {};
    const finding = (id) => r.ditian?.findings?.find((x) => x.id === id) || null;
    const force = finding("DTS_FORCE_101");
    const season = finding("DTS_SEASON_102");
    const root = finding("DTS_ROOT_104");
    const party = finding("DTS_PARTY_105");
    const flow = finding("DTS_FLOW_108");
    const pressure = finding("DTS_PRESSURE_109");
    const balance = finding("DTS_BALANCE_110");
    const bridge = finding("DTS_BRIDGE_112");
    const relationFinding = finding("DTS_RELATION_114");
    const z = reasoningMainZiping(r);
    const prescription = r.integrated?.prescription || {};
    const disclosedTiming = policyTiming("full_saju", r.timing);
    const timeline = disclosedTiming.fullSajuTimeline || {};
    const years = Array.isArray(timeline.years) ? timeline.years : [];
    const nearHighlights = Array.isArray(timeline.nearHighlights) ? timeline.nearHighlights : [];
    const daeunPeriods = Array.isArray(timeline.daeunPeriods) ? timeline.daeunPeriods : [];

    const uniq = (rows) => [...new Set((rows || []).filter(Boolean))];
    const ids = (...rows) => uniq(rows.flat().map((x) => typeof x === "string" ? x : x?.id));
    const textFact = (label,value) => `${label}:${value == null || value === "" ? "none" : String(value)}`;

    function godFacts(names) {
      const counts = p.sipsin?.counts || {};
      const all = Array.isArray(p.sipsin?.all) ? p.sipsin.all : [];
      const count = names.reduce((sum,name) => sum + Number(counts[name] || 0),0);
      const rows = all.filter((row) => names.includes(row?.value));
      const placements = uniq(rows.map((row) => `${row.pillar || ""}${row.position ? "/" + row.position : ""}`).filter(Boolean));
      return { count, placements };
    }

    const wealth = godFacts(["정재","편재"]);
    const officer = godFacts(["정관","편관"]);
    const selfGod = godFacts(["비견","겁재"]);
    const outputGod = godFacts(["식신","상관"]);
    const printGod = godFacts(["정인","편인"]);

    function forceCopy() {
      const verdict = strength.verdict || "중화";
      if (verdict === "신약") return isT
        ? "받치는 힘보다 밖으로 빠지거나 눌리는 힘이 더 커서, 무조건 버티는 방식보다 먼저 기반과 연결을 만들어야 해."
        : "너는 못 버티는 사람이 아니라, 처음부터 네 힘보다 바깥 압력이 더 크게 들어오는 쪽이야. 더 세게 참는 것보다 먼저 받쳐주는 힘과 연결을 만들어야 편해져.";
      if (verdict === "신강") return isT
        ? "스스로 버티고 밀어붙일 힘이 충분해서, 더 채우기보다 어디로 빼고 정리할지가 중요해."
        : "기본 힘이 약한 편은 아니야. 더 많이 쥐는 것보다 가진 힘을 어디에 쓰고 어디서 덜어낼지가 훨씬 중요해.";
      return isT
        ? "받치는 힘과 소모되는 힘이 한쪽으로 극단적이지 않아, 강약 하나보다 흐름이 막히는 지점을 보는 게 중요해."
        : "한쪽으로 너무 치우친 편은 아니라서 ‘강하다/약하다’보다 네 힘이 어디서 막히고 어디서 잘 이어지는지를 보는 게 더 정확해.";
    }

    function rootCopy() {
      const q = root?.facts?.quality || strength.deukji?.quality || "rootless";
      const seasonOn = !!(season?.facts?.active ?? strength.deukryeong?.active);
      const partyOn = !!(party?.facts?.active ?? strength.deukse?.active);
      const qCopy = q === "month-rooted" ? "태어난 계절 자리에도 직접 뿌리가 있어"
        : q === "day-rooted" ? "가까운 생활 자리에서 직접 뿌리가 확인돼"
          : q === "other-rooted" ? "바깥 자리에는 뿌리가 있지만 중심 자리보다 간접적이야"
            : "직접 기대는 뿌리가 선명하지 않아";
      return `${qCopy}. 계절의 도움은 <b>${seasonOn ? "받는 쪽" : "바로 받는 쪽은 아니고"}</b>, 다른 자리의 지원은 <b>${partyOn ? "붙는 쪽" : "크게 우세하지 않은 쪽"}</b>이야.`;
    }

    function structureCopy() {
      if (!z) return "태어난 계절의 중심은 잡히지만, 그 구조가 잘 굴러가는 조건은 근거 부족 때문에 한쪽으로 단정하지 않았어.";
      const support = uniq([...(z.supportGods || []),...(z.rescueGods || [])]).map((g) => TEN_GOD_WORD[g] || g);
      const harm = uniq(z.harmGods || []).map((g) => TEN_GOD_WORD[g] || g);
      const state = z.sequenceStatus || z.state || "판단 보류";
      const supportText = support.length ? `살리는 쪽은 <b>${support.slice(0,2).join(" · ")}</b>` : "살리는 힘은 현재 확인된 범위에서 뚜렷하게 하나로 못 박지 않았고";
      const harmText = harm.length ? `흔드는 쪽은 <b>${harm.slice(0,2).join(" · ")}</b>` : "크게 흔드는 힘도 한쪽으로 과장하지 않았어";
      return `중심 구조의 현재 판정은 <b>${state}</b>이야. ${supportText}, ${harmText}. 그래서 ‘좋은 요소 하나 더하기’보다 무엇이 구조를 세우고 무엇이 끊는지 순서를 봐야 해.`;
    }

    function flowCopy() {
      const blocked = flow?.facts?.blockedAt;
      if (blocked?.to) {
        const bridgeName = ELEMENT_WORD[blocked.to] || blocked.to;
        return `가장 강한 힘이 다음 단계로 넘어갈 때 <b>${bridgeName}</b> 쪽 연결이 비어 있어. 잘하는 걸 더 세게 하는 것만으로는 풀리지 않고, 그 힘을 다음 단계로 넘기는 장치가 필요해.`;
      }
      return "강한 힘이 다음 단계로 이어질 길이 사주 안에 어느 정도 있어. 힘의 총량보다 그 흐름을 중간에서 끊지 않고 현실 결과까지 연결하는 게 핵심이야.";
    }

    function prescriptionSteps() {
      return (prescription.sequence || []).map((x) => ELEMENT_WORD[x.element]).filter(Boolean);
    }

    function firstPrescriptionCopy() {
      const actions = prescriptionSteps();
      if (actions.length >= 2) return `먼저 <b>${actions[0]}</b>을 만들고, 다음에 <b>${actions[1]}</b>으로 넘기는 순서가 반복해서 유효해.`;
      if (actions.length === 1) return `가장 먼저 챙길 건 <b>${actions[0]}</b>이야.`;
      return "한 가지 처방을 억지로 고르지 않고 실제로 막히는 지점을 먼저 확인하는 게 맞아.";
    }

    function signalWhy(row, positive) {
      const rows = positive ? row?.supportSignals : row?.cautionSignals;
      const sig = (rows || []).find((x) => x.severity === "major") || (rows || [])[0];
      if (!sig) return positive ? "도움 조건이 겹침" : "주의 조건이 겹침";
      const code = sig.code || "";
      if (/rescue|generate/.test(code)) return "기반과 회복을 보태는 힘이 들어옴";
      if (/assist|root-add/.test(code)) return "버티는 힘과 뿌리가 보강됨";
      if (/bridge|flow-unblock/.test(code)) return "막혔던 연결이 이어짐";
      if (/discharge/.test(code)) return "쌓인 힘을 밖으로 빼는 길이 생김";
      if (/control/.test(code)) return "힘을 역할과 기준으로 정리하는 조건이 생김";
      if (/ziping-support/.test(code)) return "중심 구조를 살리는 힘이 붙음";
      if (/root-clash/.test(code)) return "기존 버팀목이 흔들림";
      if (/body-cost/.test(code)) return "내가 감당할 부담이 커짐";
      if (/ziping-harm/.test(code)) return "중심 구조를 흔드는 힘이 붙음";
      return positive ? "도움 조건이 겹침" : "주의 조건이 겹침";
    }

    function nearTimelineCopy() {
      const rows = nearHighlights.slice(0,3);
      if (!rows.length) return "가까운 18개월에서는 특정 달 하나를 억지로 고르지 않고 준비 상태를 보면서 움직이는 편이 맞아.";
      return rows.map((row) => {
        const when = row.startMonth ? `${row.startMonth}월 ${row.startDay ? row.startDay+"일 무렵" : ""}` : (row.startYmd || "가까운 시기");
        if (["supportive","mild-support"].includes(row.class)) {
          return `<b>${when}</b><br>왜: ${signalWhy(row,true)}.<br>전체판에서의 쓰임: 한 영역에만 몰지 말고 일·돈·관계 중 실제 반응이 오는 곳부터 작게 확정해.`;
        }
        if (["caution","mild-caution"].includes(row.class)) {
          return `<b>${when}</b><br>왜: ${signalWhy(row,false)}.<br>전체판에서의 쓰임: 새 판을 크게 벌리기보다 일정·지출·관계 약속 중 과부하가 큰 것부터 줄여.`;
        }
        return `<b>${when}</b><br>왜: 도움과 주의 신호가 함께 잡혀.<br>전체판에서의 쓰임: 잘되는 영역과 버거운 영역을 분리해서 움직여.`;
      }).join("<br><br>");
    }

    function yearTimelineCopy() {
      if (!years.length) return "5년 흐름 데이터가 충분하지 않아 연도별 이야기를 억지로 만들지 않았어.";
      const currentYear = Number(String(r.timing?.today || "").slice(0,4)) || 0;
      const annualRows = years.filter((y) => y.year > currentYear).slice(0,5);
      return annualRows.map((y) => {
        const positive = ["supportive","mild-support"].includes(y.class);
        const negative = ["caution","mild-caution"].includes(y.class);
        const direction = positive ? "준비한 걸 현실 선택으로 옮기기 쉬운 쪽"
          : negative ? "확장보다 조정과 방어를 먼저 보는 쪽"
            : y.class === "mixed" ? "잘되는 부분과 부담되는 부분이 동시에 커지는 쪽"
              : "한쪽으로 크게 기울지 않는 쪽";
        const why = positive ? signalWhy(y,true) : negative ? signalWhy(y,false)
          : `${signalWhy(y,true)} / ${signalWhy(y,false)}`;
        const use = positive ? "활용: 이미 검증한 일·돈·관계 선택을 한 단계 확정해."
          : negative ? "주의: 손실·과로·갈등이 커지기 전에 범위와 속도를 줄여."
            : y.class === "mixed" ? "활용: 잘되는 영역만 키우고 부담이 큰 영역은 같은 속도로 밀지 마."
              : "활용: 새 판보다 앞에서 만든 기반을 유지하고 다음 강한 구간을 준비해.";
        return `<b>${y.year}년 · ${direction}</b><br>왜: ${why}.<br>${use}`;
      }).join("<br><br>");
    }

    function daeunCopy() {
      if (!daeunPeriods.length) return "10년 단위 큰 흐름을 읽을 자료가 충분하지 않아 전환점을 만들지 않았어.";
      const current = daeunPeriods[0];
      const next = daeunPeriods[1];
      const currentGod = TEN_GOD_WORD[current.god] || "현재 삶의 과제를 밀어주는 힘";
      const nextText = next
        ? `<br><br><b>${next.startYear}년 무렵</b> 계산 범위 안에서 큰 흐름의 결이 바뀌면 <b>${TEN_GOD_WORD[next.god] || "다른 방식의 힘"}</b>이 더 앞에 나와. 지금 잘되던 방식 그대로만 밀기보다 역할과 선택 기준을 다시 맞추는 전환점으로 보는 게 좋아.`
        : "<br><br>계산 범위 안에서는 다음 큰 흐름 전환을 억지로 만들지 않았어.";
      return `지금 큰 흐름에서는 <b>${currentGod}</b>이 반복해서 개입해. 지금의 장점도 이 힘을 잘 쓸 때 커지고, 과부하도 이 힘이 지나칠 때 먼저 보여.${nextText}`;
    }

    const pressureHuman = r.integrated?.pressureHuman || "여러 조건이 한꺼번에 들어오는 압박";
    const mismatch = !!p.elements?.rawVsInfluenceMismatch;
    const mismatchCopy = mismatch
      ? "겉으로 보이는 오행 개수와 실제 힘의 순위가 달라. 그래서 ‘몇 개 있나’보다 계절·뿌리·위치까지 반영한 실제 세력을 기준으로 봐야 해."
      : "겉으로 보이는 오행 개수와 실제 힘의 방향이 크게 어긋나진 않지만, 계절·뿌리·위치가 최종 세기를 결정해.";
    const bridgeStatus = bridge?.facts?.status || "unknown";
    const blockedTo = flow?.facts?.blockedAt?.to || "";
    const relationRaw = p.relations?.raw || {};
    const hasClash = !!p.relations?.hasClash;
    const actions = prescriptionSteps();
    const timingRuleIds = (rows) => uniq((rows || []).flatMap((row) => [...(row.supportSignals || []),...(row.cautionSignals || [])].flatMap((sig) => sig.sourceRuleIds || [])));

    const sections = [
      {
        title:"01 · 내 사주 전체 핵심",
        body:`<b>핵심</b> · ${dom}${second ? `, 그 안에 ${second}` : ""}.<br><br><b>왜</b> · ${forceCopy()} 지금 가장 크게 걸리는 쪽은 <b>${pressureHuman}</b>이야.<br><br><b>실제</b> · 한 고민에서만 나타나는 성격이 아니라 선택·관계·성과를 다룰 때 같은 구조가 반복될 가능성이 커.<br><br><b>이렇게 써</b> · 전체판에서는 ‘무슨 성격인가’보다 압박을 어떤 순서로 받아내고 결과로 바꾸는지를 기준으로 볼게.`,
        claim:{ section:1,sourceRuleIds:ids(force,pressure,z),newFacts:[textFact("strength",strength.verdict),textFact("pressure",pressure?.facts?.group),textFact("gyeok",z?.gyeokName)],conclusion:`전체 선택을 묶는 핵심은 ${dom}과 ${pressureHuman}의 결합이다.` },
      },
      {
        title:"02 · 계절·뿌리·버티는 힘",
        body:`<b>핵심</b> · ${rootCopy()}<br><br><b>왜</b> · 계절의 지원, 실제 뿌리 위치, 다른 자리의 도움이 각각 따로 계산돼 있어. ${mismatchCopy}<br><br><b>실제</b> · 같은 일을 맡아도 ‘처음부터 버틸 수 있는 양’과 ‘밖에서 받쳐줘야 버틸 수 있는 양’이 달라져.<br><br><b>이렇게 써</b> · 힘들 때 의지부터 탓하지 말고, 지금 과제가 네 기본 버팀보다 큰지부터 확인해.`,
        claim:{ section:2,sourceRuleIds:ids(season,root,party),newFacts:[textFact("deukryeong",season?.facts?.active),textFact("rootQuality",root?.facts?.quality || strength.deukji?.quality),textFact("deukse",party?.facts?.active)],conclusion:"버티는 힘은 계절·뿌리·주변 지원을 분리해서 봐야 한다." },
      },
      {
        title:"03 · 실제 기세의 흐름",
        body:`<b>핵심</b> · 가장 자연스럽게 커지는 쪽은 <b>${strong}</b>, 의식적으로 챙겨야 하는 쪽은 <b>${weak}</b>이야.<br><br><b>왜</b> · ${flowCopy()}<br><br><b>실제</b> · 강한 힘이 많아도 다음 단계로 못 넘어가면 ‘열심히 하는데 결과가 안 붙는’ 느낌이 날 수 있어.<br><br><b>이렇게 써</b> · ${blockedTo ? `막힌 다음 단계인 <b>${ELEMENT_WORD[blockedTo] || blockedTo}</b>을 실제 행동으로 하나 넣어.` : "이미 이어지는 흐름을 끊지 않도록 중간 과정을 생략하지 마."}`,
        claim:{ section:3,sourceRuleIds:ids(flow,bridge),newFacts:[textFact("strongElement",strongEl),textFact("weakElement",weakEl),textFact("blockedTo",blockedTo),textFact("bridge",bridgeStatus)],conclusion:"강한 힘의 양보다 다음 단계로 이어지는지 여부가 현실 결과를 좌우한다." },
      },
      {
        title:"04 · 중심 구조가 서는 조건과 깨지는 조건",
        body:`<b>핵심</b> · ${structureCopy()}<br><br><b>왜</b> · 태어난 계절에서 잡힌 중심과, 그 중심을 살리는 힘·흔드는 힘·다시 살리는 힘의 순서를 따로 확인했어.<br><br><b>실제</b> · 같은 압박도 받쳐주는 연결이 있으면 책임과 성과로 바뀌고, 그 연결이 끊기면 부담으로 먼저 느껴질 수 있어.<br><br><b>이렇게 써</b> · 구조가 흔들릴 때는 좋은 걸 더 얹기 전에 무엇이 먼저 깨졌는지부터 찾아.`,
        claim:{ section:4,sourceRuleIds:ids(z,relationFinding),newFacts:[textFact("zipingState",z?.sequenceStatus || z?.state),textFact("supportGods",(z?.supportGods || []).join(",")),textFact("harmGods",(z?.harmGods || []).join(",")),textFact("rescueGods",(z?.rescueGods || []).join(","))],conclusion:"중심 구조는 세우는 힘→깨뜨리는 힘→다시 구하는 힘의 순서로 읽는다." },
      },
      {
        title:"05 · 돈과 현실 결과",
        body:`<b>핵심</b> · 돈을 직접 다루는 신호는 현재 계산에서 <b>${wealth.count}개</b> 잡혀 있어. 이 숫자만으로 돈복을 정하지 않고, 돈이 네 힘을 빼는지 결과로 연결하는지까지 같이 봐.<br><br><b>왜</b> · 돈 관련 힘의 분포와 <b>${pressureHuman}</b>, 그리고 실제 흐름이 결과 단계까지 이어지는지를 함께 봤어.<br><br><b>실제</b> · ${wealth.count >= 2 ? "기회·가격·지출처럼 돈과 관련된 선택이 여러 장면에서 동시에 들어오면 관리 기준이 흐려질 수 있어." : wealth.count === 1 ? "돈 문제는 한 번의 큰 승부보다 조건 하나를 정확히 관리할 때 결과가 더 선명해질 수 있어." : "돈 신호가 전면에 많이 드러난 구조는 아니라서 ‘돈 자체를 쫓는 것’보다 네 강점을 결과·가격으로 연결하는 과정이 더 중요해."}<br><br><b>이렇게 써</b> · 수입·가격·지출을 한 덩어리로 보지 말고 각각 기준을 정해. ${firstPrescriptionCopy()}`,
        claim:{ section:5,sourceRuleIds:ids(pressure,flow,balance,z),newFacts:[textFact("wealthCount",wealth.count),textFact("wealthPlacements",wealth.placements.join(",")),textFact("pressureGroup",pressure?.facts?.group)],conclusion:"돈은 추상적인 돈복보다 자원·가격·성과가 현실 결과로 이어지는 방식으로 판단한다." },
      },
      {
        title:"06 · 일·직업·진로",
        body:`<b>핵심</b> · 역할·기준·책임을 다루는 신호는 <b>${officer.count}개</b> 잡혀 있어. 특정 직업명을 찍기보다 어떤 평가 구조에서 네 힘이 살아나는지가 중요해.<br><br><b>왜</b> · 역할 압력의 위치와 네 기본 버팀, 강한 힘이 다음 결과로 넘어가는 흐름을 같이 봤어.<br><br><b>실제</b> · ${officer.count >= 2 ? "책임과 평가가 동시에 커지는 환경에서는 잘해도 업무 범위가 계속 넓어질 수 있어서 권한·보상 기준이 중요해." : officer.count === 1 ? "명확한 역할 하나를 맡고 결과를 확인받는 구조에서 강점이 보이기 쉬워." : "직함 자체보다 실제 성과를 만들어 역할을 확보하는 과정이 더 중요하게 작동할 수 있어."}<br><br><b>이렇게 써</b> · <b>${strong}</b>을 쓸 수 있으면서 역할·평가·보상의 기준이 분명한 환경을 골라.`,
        claim:{ section:6,sourceRuleIds:ids(pressure,flow,force,z),newFacts:[textFact("officerCount",officer.count),textFact("officerPlacements",officer.placements.join(",")),textFact("forceVerdict",strength.verdict)],conclusion:"일은 직업명보다 역할 압력과 평가 구조가 개인의 힘과 맞는지로 판단한다." },
      },
      {
        title:"07 · 연애와 가까운 관계",
        body:`<b>핵심</b> · 이 장은 특정 상대 궁합이 아니라 <b>너 한 사람의 가까운 관계 패턴</b>만 봐. 네 기준을 지키는 힘은 <b>${selfGod.count}개</b>, 관계에서 밖으로 표현하는 힘은 <b>${outputGod.count}개</b>로 잡혀 있어.<br><br><b>왜</b> · 내 기준을 지키는 힘, 표현하는 힘, 실제 합·충 같은 관계 신호를 같이 보되 상대방 성격은 만들어내지 않아.<br><br><b>실제</b> · ${hasClash ? "관계 안에서 기준이 부딪히는 장면이 생기면 감정을 오래 참기보다 무엇이 충돌했는지 빨리 확인하는 편이 중요해." : "관계 신호 하나만으로 충돌을 과장하지 않고, 표현을 미루는지 기준을 너무 단단히 잡는지 같은 네 반응을 더 중요하게 봐."}<br><br><b>이렇게 써</b> · 상대 마음을 추측하기보다 불편함이 시작된 장면과 말한 뒤 실제 조정 반응을 확인해. 특정 사람과의 궁합은 별도 상품에서만 계산해.`,
        claim:{ section:7,sourceRuleIds:ids(relationFinding,pressure),newFacts:[textFact("selfGodCount",selfGod.count),textFact("outputCount",outputGod.count),textFact("hasClash",hasClash),textFact("relationKeys",Object.keys(relationRaw).sort().join(","))],conclusion:"가까운 관계는 본인의 기준·표현·충돌 신호만 해석하고 특정 상대 정보는 생성하지 않는다." },
      },
      {
        title:"08 · 사람과 환경",
        body:`<b>핵심</b> · 사람을 많이 만나는지보다 <b>네 힘을 쓰고 다음 단계로 넘길 수 있는 환경인지</b>가 중요해.<br><br><b>왜</b> · 다른 자리의 지원 여부와 뿌리의 질, 실제 흐름을 함께 보면 ‘혼자 버티는 환경’과 ‘받쳐주면서 결과를 내는 환경’의 차이가 보여.<br><br><b>실제</b> · ${party?.facts?.active ? "주변 도움을 실제 자원으로 바꿀 여지가 있어서 역할과 피드백이 분명한 조직에서 힘을 덜 낭비할 수 있어." : "주변 도움을 기본값으로 기대하기보다 역할·요청·경계를 명시적으로 만드는 편이 안정적이야."}<br><br><b>이렇게 써</b> · ${root?.facts?.quality === "rootless" ? "사람 수보다 반복해서 기대어도 되는 한두 개의 기준과 지원선을 먼저 만들어." : "이미 있는 버팀목을 유지하면서 네 강점을 다음 결과로 넘겨주는 사람·환경을 남겨."}`,
        claim:{ section:8,sourceRuleIds:ids(party,root,flow),newFacts:[textFact("partyActive",party?.facts?.active),textFact("rootQuality",root?.facts?.quality),textFact("flowBlocked",!!flow?.facts?.blockedAt)],conclusion:"환경 적합성은 주변 지원·뿌리·흐름이 실제 결과를 돕는지로 판단한다." },
      },
      {
        title:"09 · 마음·스트레스·회복",
        body:`<b>핵심</b> · 의료 진단이 아니라 <b>과부하가 생기는 구조와 회복 순서</b>만 봐. 받아들이고 기반을 만드는 힘은 <b>${printGod.count}개</b>, 밖으로 빼고 표현하는 힘은 <b>${outputGod.count}개</b> 잡혀 있어.<br><br><b>왜</b> · 기본 버팀보다 압력이 큰지, 쌓인 힘을 밖으로 빼는 통로가 있는지를 같이 확인했어.<br><br><b>실제</b> · ${strength.verdict === "신약" ? "과제가 한꺼번에 늘면 회복 전에 버티는 데 에너지를 써버릴 수 있어." : strength.verdict === "신강" ? "버티는 힘이 있어도 계속 쥐고만 있으면 쉬는 동안에도 머리와 몸이 일을 놓지 못하는 느낌이 생길 수 있어." : "힘의 총량보다 여러 요구가 동시에 겹칠 때 회복 리듬이 깨지는지 보는 게 중요해."}<br><br><b>이렇게 써</b> · ${firstPrescriptionCopy()} 이 장은 질병이나 정신건강 진단을 대신하지 않아.`,
        claim:{ section:9,sourceRuleIds:ids(force,pressure,balance),newFacts:[textFact("printCount",printGod.count),textFact("outputCount",outputGod.count),textFact("strength",strength.verdict)],conclusion:"회복은 진단이 아니라 과부하와 배출·기반의 순서를 조정하는 문제로 해석한다." },
      },
      {
        title:"10 · 가까운 18개월",
        body:`<b>핵심</b> · 기본 NOTE6는 지금 고른 고민에 필요한 달만 골랐다면, 전체판에서는 <b>삶 전체에 영향을 주는 가까운 구간</b>을 본다.<br><br>${nearTimelineCopy()}<br><br><b>이렇게 써</b> · 같은 달이어도 돈·일·관계 중 실제 반응이 먼저 오는 영역부터 작게 움직이고, 나머지는 그 결과를 본 뒤 따라가.`,
        claim:{ section:10,sourceRuleIds:timingRuleIds(nearHighlights),newFacts:nearHighlights.slice(0,3).map((x) => textFact("near",`${x.startYmd}:${x.class}`)),conclusion:"가까운 시기는 특정 고민 하나가 아니라 한 사람 전체판의 동시 반응 가능성을 기준으로 사용한다." },
      },
      {
        title:"11 · 앞으로 5년",
        body:`<b>핵심</b> · 여기부터는 기본 NOTE6에서 전부 공개하지 않았던 연도별 큰 흐름이야. 각 해를 ‘좋다/나쁘다’로 끝내지 않고 방향·근거·활용 또는 주의까지 이어서 볼게.<br><br>${yearTimelineCopy()}`,
        claim:{ section:11,sourceRuleIds:timingRuleIds(years),newFacts:years.slice(0,6).map((x) => textFact("year",`${x.year}:${x.class}`)),conclusion:"5년 흐름은 각 연도의 방향·발화 근거·활용 또는 주의 행동까지 묶어서 공개한다." },
      },
      {
        title:"12 · 큰 흐름 전환 + 평생 사용법",
        body:`<b>핵심 · 큰 흐름</b><br>${daeunCopy()}<br><br><b>왜</b> · 지금과 다음 큰 흐름에서 앞에 나오는 힘이 달라지면 같은 장점도 쓰는 방식과 과부하 지점이 달라져.<br><br><b>이렇게 써 · 반복해서 가져갈 사용법</b><br><b>1.</b> ${pressureHuman}이 커질수록 무작정 버티지 말고 네 기본 버팀보다 과제가 큰지 먼저 확인해.<br><b>2.</b> ${blockedTo ? `${ELEMENT_WORD[blockedTo] || blockedTo} 쪽 연결을 생략하지 마.` : `${strong}을 현실 결과까지 넘기는 중간 단계를 지켜.`}<br><b>3.</b> ${actions.length ? `${actions.slice(0,2).join(" → ")} 순서를 기억해.` : "좋은 시기에도 작은 검증 → 확정 순서를 지켜."}<br><br>이 세 가지는 돈·일·관계·마음이 달라져도 같은 사주판에서 반복해서 남는 사용법이야.`,
        claim:{ section:12,sourceRuleIds:uniq([...timingRuleIds(years),...ids(pressure,flow,bridge,balance)]),newFacts:[textFact("daeunPeriods",daeunPeriods.map((x) => `${x.startYear}-${x.endYear}:${x.ganZhi}`).join("|")),textFact("prescription",actions.join("→"))],conclusion:"현재 큰 흐름과 다음 전환을 평생 반복되는 행동 순서에 연결한다." },
      },
    ];

    if (isT) return sections;
    const roaBody = (body) => String(body || "")
      .replace(/<b>핵심<\/b> ·/g, "<b>먼저 보면</b> ·")
      .replace(/<b>왜<\/b> ·/g, "<b>왜냐면</b> ·")
      .replace(/<b>실제<\/b> ·/g, "<b>현실에서는</b> ·")
      .replace(/<b>이렇게 써<\/b> ·/g, "<b>그래서</b> ·")
      .replace(/<b>핵심 · 큰 흐름<\/b>/g, "<b>큰 흐름부터 보면</b>")
      .replace(/<b>이렇게 써 · 반복해서 가져갈 사용법<\/b>/g, "<b>언니가 마지막으로 남길 기준</b>")
      .replace("기준으로 볼게.", "기준으로 같이 볼게.")
      .replace("지금 과제가 네 기본 버팀보다 큰지부터 확인해.", "지금 과제가 네 기본 버팀보다 큰지부터 확인해보자.")
      .replace("실제 행동으로 하나 넣어.", "실제 행동으로 하나 넣어보자.")
      .replace("무엇이 먼저 깨졌는지부터 찾아.", "무엇이 먼저 흔들렸는지부터 같이 보자.")
      .replace("계절의 지원, 실제 뿌리 위치, 다른 자리의 도움이 각각 따로 계산돼 있어.", "언니는 계절에서 받는 힘, 실제 뿌리, 다른 자리의 도움을 따로 봤어.")
      .replace(/돈을 직접 다루는 신호는 현재 계산에서 <b>(\d+)개<\/b> 잡혀 있어\./g, "돈을 직접 다루는 신호는 <b>$1개</b> 보여.")
      .replace("돈 관련 힘의 분포와", "언니는 돈 관련 힘이 어디에 있는지와")
      .replace(/역할·기준·책임을 다루는 신호는 <b>(\d+)개<\/b> 잡혀 있어\./g, "역할·기준·책임 쪽 신호는 <b>$1개</b> 보여.")
      .replace("역할 압력의 위치와 네 기본 버팀, 강한 힘이 다음 결과로 넘어가는 흐름을 같이 봤어.", "언니는 역할·평가가 어디서 들어오는지, 네가 얼마나 버틸 수 있는지, 그 힘이 결과까지 이어지는지를 같이 봤어.")
      .replace("이 장은 특정 상대 궁합이 아니라", "여기서는 특정 상대 궁합이 아니라")
      .replace("내 기준을 지키는 힘, 표현하는 힘, 실제 합·충 같은 관계 신호를 같이 보되 상대방 성격은 만들어내지 않아.", "언니는 내 기준을 지키는 힘, 표현하는 힘, 실제 합·충 신호까지만 같이 보고 상대 성격은 지어내지 않을게.")
      .replace("다른 자리의 지원 여부와 뿌리의 질, 실제 흐름을 함께 보면", "언니는 다른 자리에서 받는 도움, 뿌리의 상태, 실제 흐름을 같이 봤어. 그래서")
      .replace("의료 진단이 아니라", "여기서는 의료 진단을 하는 게 아니라")
      .replace("기본 버팀보다 압력이 큰지, 쌓인 힘을 밖으로 빼는 통로가 있는지를 같이 확인했어.", "언니는 네가 버틸 수 있는 힘보다 압박이 큰지, 쌓인 힘을 밖으로 뺄 길이 있는지 같이 봤어.")
      .replace("기본 NOTE6는 지금 고른 고민에 필요한 달만 골랐다면, 전체판에서는", "NOTE6에서는 지금 고른 고민에 필요한 달만 봤지. 여기서는")
      .replace("여기부터는 기본 NOTE6에서 전부 공개하지 않았던 연도별 큰 흐름이야.", "NOTE6에서는 다 보여주지 않았던 연도별 큰 흐름도 여기서는 이어서 볼게.")
      .replace("실제 흐름이 결과 단계까지 이어지는지를 함께 봤어.", "실제 흐름이 결과까지 이어지는지도 같이 봤어.")
      .replace(/네 기준을 지키는 힘은 <b>(\d+)개<\/b>, 관계에서 밖으로 표현하는 힘은 <b>(\d+)개<\/b>로 잡혀 있어\./g, "네 기준을 지키는 힘은 <b>$1개</b>, 관계에서 표현하는 힘은 <b>$2개</b> 보여.")
      .replace(/받아들이고 기반을 만드는 힘은 <b>(\d+)개<\/b>, 밖으로 빼고 표현하는 힘은 <b>(\d+)개<\/b> 잡혀 있어\./g, "받아들이고 기반을 만드는 힘은 <b>$1개</b>, 밖으로 표현하는 힘은 <b>$2개</b> 보여.")
      .replace("반복해서 개입해.", "계속 앞에 나와.")
      .replace("계산 범위 안에서 큰 흐름의 결이 바뀌면", "지금 보는 범위 안에서 큰 흐름의 결이 바뀌면");
    return sections.map((section) => ({ ...section, body:roaBody(section.body) }));
  }

  function noteCards(notes) {
    return (notes || []).map((n) => `<article style="padding:16px 0;border-bottom:1px solid #eef2f7"><div style="font-size:11px;font-weight:900;color:#f43f5e;margin-bottom:7px">${esc(n.badge || n.themeNum || "NOTE")}</div><h4 style="font-size:16px;font-weight:900;line-height:1.45;margin:0 0 9px">${n.title || ""}</h4><div style="font-size:13px;line-height:1.8;color:#475569">${n.desc || ""}</div>${n.checklist ? `<div style="margin-top:11px;padding:10px 12px;border-radius:12px;background:#f8fafc;font-size:12px;line-height:1.6;color:#334155"><b>이번에 해볼 것</b><br>${esc(n.checklist)}</div>` : ""}</article>`).join("");
  }

  function fullSajuHtml(data, mode) {
    const gate = policyGate("full_saju", ["full-five-year","monthly-detail","cross-domain","daewoon-context"], { months:18, concernCount:0 });
    if (!gate.ok) return policyBlockedHtml("full_saju", gate);
    const isT = mode === "T";
    const reasoning = getReasoning(data);
    const contract = contentPolicy("full_saju");
    const intro = isT
      ? "방금 본 고민 하나를 길게 반복하는 결과가 아니야. 한 사람의 전체 구조, 삶의 여러 영역이 이어지는 이유, 가까운 핵심 시기와 5년 큰 흐름까지 한 장으로 묶어."
      : "이건 지금 고민 하나를 또 풀어쓰는 결과가 아니야. 언니가 네 사주 전체를 펼쳐놓고, 돈·일·관계·마음이 왜 같은 사주 구조에서 다르게 나타나는지와 앞으로 5년 큰 흐름까지 이어서 보는 전체 지도야.";
    const sections = fullSajuSections(data, mode);
    const fp = reasoning?.structureFingerprint || "";
    const tfp = reasoning?.timingFingerprint || "";
    return `<div data-product-contract="full_saju" data-structure-fingerprint="${esc(fp)}" data-timing-fingerprint="${esc(tfp)}" data-export-intro="full" style="padding:14px 15px;border-radius:16px;background:#fff7ed;border:1px solid #fed7aa;font-size:12.5px;line-height:1.8;color:#7c2d12;margin-bottom:8px"><b>이 전체판에서 새로 열리는 것</b><br>${intro}<br><span style="font-size:10.5px;color:#9a3412">기본 고민에서는 가까운 시기를 중심으로 보고 · 이 전체판에서는 향후 5년의 큰 흐름까지 이어서 공개</span></div>${sections.map((row,index)=>`<section data-export-kind="full" data-full-saju-section="${row.claim?.section || index+1}" data-export-index="${index}" data-source-rules="${esc((row.claim?.sourceRuleIds || []).join(","))}" data-new-facts="${esc((row.claim?.newFacts || []).join("|"))}" data-section-conclusion="${esc(row.claim?.conclusion || "")}" style="padding:18px 0;border-bottom:1px solid #eef2f7"><h4 style="font-size:15px;font-weight:900;margin:0 0 8px">${row.title}</h4><div style="font-size:13px;line-height:1.85;color:#475569">${row.body}</div></section>`).join("")}`;
  }

  function bundleHtml(data, mode, extra) {
    const keys = Array.isArray(extra?.concerns) ? extra.concerns : [];
    const gate = policyGate("concern_bundle3", ["additional-concerns","monthly-detail"], { months:18, concernCount:keys.length });
    if (!gate.ok) return policyBlockedHtml("concern_bundle3", gate);
    const runs = keys.map((key) => {
      const concernSituation = extra?.situations?.[key] || "";
      const d = { ...data, concernKey:key, concernSituation };
      const notes = typeof global.generateConcernNotes === "function" ? global.generateConcernNotes(d, mode) : [];
      return { key, concernSituation, data:d, notes, reasoning:d.classicalReasoningV1 || getReasoning(d) };
    });
    const firstR = runs[0]?.reasoning;
    const pressure = firstR?.integrated?.pressureHuman || "여러 조건이 동시에 들어오는 압박";
    const firstActionEl = firstR?.integrated?.prescription?.sequence?.[0]?.element || "";
    const firstAction = ELEMENT_WORD[firstActionEl] || "작게 확인하고 다음 행동을 고르는 힘";
    const sharedFp = firstR?.structureFingerprint || "";
    const shared = runs.length
      ? `<div data-product-exclusive="concern_bundle3" data-product-contract="concern_bundle3" data-structure-fingerprint="${esc(sharedFp)}" style="padding:14px 15px;border-radius:16px;background:#f8fafc;border:1px solid #e2e8f0;margin-bottom:18px;font-size:12.5px;line-height:1.8;color:#475569"><b>세 고민을 같이 보면 보이는 공통축</b><br>세 고민에서 사주 전체 구조 자체는 바뀌지 않아. 공통으로 먼저 걸리는 건 <b>${esc(pressure)}</b>이고, 풀 때는 <b>${esc(firstAction)}</b> 쪽을 먼저 만드는 흐름이 반복돼. 아래에서는 그 같은 구조가 돈·일·관계 같은 서로 다른 고민에서 어떻게 다르게 나타나는지만 각각 깊게 풀어.</div>`
      : "";
    const body = runs.map(({key,concernSituation,notes}) => {
      const situLabel = situationLabel(key, concernSituation);
      return `<section data-export-kind="concern" data-concern="${esc(key)}" data-concern-situation="${esc(concernSituation)}" style="margin-bottom:26px"><h3 style="font-size:19px;font-weight:950;margin:0 0 5px">${esc(CONCERNS[key] || key)}</h3>${situLabel ? `<div style="font-size:11px;font-weight:850;color:#f43f5e;margin-bottom:10px">지금 상황 · ${esc(situLabel)}</div>` : ""}${noteCards(notes)}</section>`;
    }).join("");
    return shared + body;
  }

  function allInOneHtml(data, mode, extra) {
    const sanitized = productPolicyApi()?.sanitizeProductPayload?.("all_in_one", { extra }) || { extra };
    extra = sanitized.extra || {};
    const gate = policyGate("all_in_one", ["all-six-concerns","full-five-year","monthly-detail","cross-domain","daewoon-context"], { months:18, concernCount:Object.keys(CONCERNS).length });
    if (!gate.ok) return policyBlockedHtml("all_in_one", gate);
    const baseReasoning = getReasoning(data);
    const allRuns = Object.keys(CONCERNS).map((key) => {
      const concernSituation = extra?.situations?.[key] || (key === data?.concernKey ? data?.concernSituation || "" : "");
      const d = { ...data, concernKey:key, concernSituation };
      const notes = typeof global.generateConcernNotes === "function" ? global.generateConcernNotes(d, mode) : [];
      return { key, concernSituation, notes, reasoning:d.classicalReasoningV1 || getReasoning(d) };
    });
    const commonPressure = baseReasoning?.integrated?.pressureHuman || "여러 조건이 동시에 들어오는 압박";
    const pivots = baseReasoning?.timing?.longTermPivots || [];
    const pivotText = pivots.length ? pivots.map((x) => `${x.year}년`).join(" · ") : "강한 장기 변곡점 없음";
    const actions = (baseReasoning?.integrated?.prescription?.sequence || []).map((x) => ELEMENT_WORD[x.element]).filter(Boolean);
    const firstAction = actions[0] || "현재 부담을 줄이고 실제 반응을 확인하는 것";
    const secondAction = actions[1] || "확인된 선택만 다음 단계로 확정하는 것";
    const domains = Object.keys(CONCERNS).map((key) => CONCERNS[key]).join(" · ");

    const crossDomain = `<div data-product-exclusive="all_in_one" data-product-contract="all_in_one" data-structure-fingerprint="${esc(baseReasoning?.structureFingerprint || "")}" style="padding:15px;border-radius:18px;background:#fff1f2;border:1px solid #fecdd3;margin:22px 0;font-size:12.5px;line-height:1.85;color:#881337"><b>6개 고민을 가로지르는 공통 구조</b><br>${domains}은 서로 다른 문제처럼 보여도 <b>${esc(commonPressure)}</b>이 커질 때 비슷한 반응이 반복돼. 완전판에서는 같은 사주 구조가 각 고민에서 어디서 다르게 나타나는지까지 나란히 비교해.<br><span style="font-size:10.5px;color:#be123c">이 완전판은 나 한 사람 전체 분석이야. 두 사람 궁합은 포함하지 않아.</span></div>`;

    const simultaneous = `<div data-product-exclusive="all_in_one-timing" style="padding:15px;border-radius:18px;background:#f8fafc;border:1px solid #e2e8f0;margin:14px 0;font-size:12.5px;line-height:1.85;color:#334155"><b>여러 영역이 같이 움직이는 시점</b><br>${pivots.length ? `현재 5년 계산에서 공통으로 강하게 잡힌 변곡점은 <b>${esc(pivotText)}</b>이야. 같은 시기라도 돈은 조건 조정, 일은 역할 선택, 관계는 거리·약속 조정처럼 적용 방식이 달라져. 그래서 한 영역의 변화만 보고 인생 전체가 좋아지거나 나빠진다고 단정하지 않아.` : "5년 안에서 여러 영역을 동시에 크게 흔드는 강한 변곡점이 따로 잡히지 않아. 없는 변곡점을 만들지 않고 각 고민의 가까운 시기를 따로 쓰는 편이 맞아."}</div>`;

    const strategy = `<div data-product-exclusive="all_in_one-strategy" style="padding:15px;border-radius:18px;background:#fff7ed;border:1px solid #fed7aa;margin:14px 0 22px;font-size:12.5px;line-height:1.85;color:#7c2d12"><b>마지막 종합 행동 전략</b><br><b>1.</b> 먼저 ${esc(firstAction)}.<br><b>2.</b> 그다음 ${esc(secondAction)}.<br><b>3.</b> 좋은 시기에도 6개 영역을 한꺼번에 바꾸지 말고 실제 반응이 먼저 오는 영역부터 확정해.<br>이건 새로운 판단을 덧붙인 게 아니라, 같은 사주 판단에서 나온 행동 순서를 6개 고민에 공통으로 적용한 거야.</div>`;

    const all = allRuns.map(({key,concernSituation,notes}) => {
      const situLabel = situationLabel(key, concernSituation);
      return `<section data-export-kind="concern" data-concern="${esc(key)}" data-concern-situation="${esc(concernSituation)}" style="margin:26px 0"><h3 style="font-size:19px;font-weight:950;margin:0 0 5px">${esc(CONCERNS[key])}</h3>${situLabel ? `<div style="font-size:11px;font-weight:850;color:#f43f5e;margin-bottom:10px">지금 상황 · ${esc(situLabel)}</div>` : ""}${noteCards(notes)}</section>`;
    }).join("");
    return `<h3 style="font-size:19px;font-weight:950;margin:0 0 10px">내 전체 사주판</h3>${fullSajuHtml(data, mode)}${crossDomain}${simultaneous}${strategy}<div style="height:8px"></div>${all}`;
  }

  function parseDate8(v) {
    const s = String(v || "").replace(/\D/g, "");
    if (!/^\d{8}$/.test(s)) return null;
    return { y: +s.slice(0,4), m: +s.slice(4,6), d: +s.slice(6,8), raw: s };
  }

  function partnerChart(extra) {
    const p = extra?.partner || {};
    const dt = parseDate8(p.b);
    if (!dt || typeof global.calculateAccurateManse !== "function") return null;
    let y = dt.y, m = dt.m, d = dt.d;
    if (p.c === "lunar" && typeof global.koreanLunarToSolar === "function") {
      const solar = global.koreanLunarToSolar(y, m, d, p.l === true);
      y = solar.year; m = solar.month; d = solar.day;
    }
    return global.calculateAccurateManse(y, m, d, p.t === "unknown" ? null : p.t, p.g || "female");
  }

  function elementOf(data) {
    return data?.dayOheng || data?.analysisProfile?.dayMaster?.element || data?.integratedSajuProfile?.balance?.primary || "to";
  }

  function relationCopy(a, b, isT) {
    const gen = { mok:"hwa", hwa:"to", to:"geum", geum:"su", su:"mok" };
    const ctrl = { mok:"to", to:"su", su:"hwa", hwa:"geum", geum:"mok" };
    if (a === b) return isT ? "두 사람의 기본 오행이 같아 공통된 성향 축은 있어. 다만 관계 반응이나 약점까지 같다는 뜻은 아니야." : "둘의 기본 오행이 같아서 공통된 성향 축은 있어. 그렇다고 마음 쓰는 속도나 관계 방식까지 같다고 단정하진 않을게.";
    if (gen[a] === b || gen[b] === a) return isT ? "두 사람의 기본 오행 사이에 생하는 관계가 있어. 도움 방향으로 읽을 수 있지만 실제 도움 방식은 다른 궁합 신호와 함께 봐야 해." : "둘의 기본 오행 사이에 생하는 관계가 있어. 서로 힘을 보태는 방향은 볼 수 있지만, 실제로 누가 어떻게 돕는지까지 이 관계 하나로 정하진 않을게.";
    if (ctrl[a] === b || ctrl[b] === a) return isT ? "두 사람의 기본 오행 사이에 제어 관계가 있어. 조정이 필요한 축은 볼 수 있지만, 이걸 끌림이나 마찰로 바로 단정하진 않아." : "둘의 기본 오행 사이에 제어 관계가 있어. 서로 조정해야 할 축은 볼 수 있지만, 그 자체가 끌림이나 싸움을 뜻한다고 단정하진 않을게.";
    return isT ? "두 사람의 기본 오행 관계만으로 관계 방식을 단정하기 어려워. 실제 궁합 신호와 역할·기대치를 같이 봐." : "기본 오행 관계 하나만으로 둘의 관계 방식을 정하진 않을게. 실제 궁합 신호와 서로 기대하는 걸 같이 보는 게 더 정확해.";
  }

  function compatibilityHtml(data, mode, extra) {
    const secondPersonPresent = !!extra?.partner?.b;
    const gate = policyGate("compatibility", ["compatibility","second-person","monthly-detail"], { months:18, secondPersonPresent, concernCount:0 });
    if (!gate.ok) return policyBlockedHtml("compatibility", gate);
    const isT = mode === "T";
    let partner;
    try { partner = partnerChart(extra); } catch (e) { partner = null; }
    if (!partner) return `<p data-content-blocked="compatibility" style="font-size:13px;line-height:1.8;color:#475569">상대 생년월일 정보를 다시 확인해줘. 두 번째 사람의 정확한 사주가 계산돼야 둘 사이 궁합을 만들 수 있어.</p>`;

    const pName = extra?.partner?.n || "상대";
    const safeName = esc(pName);
    const a = elementOf(data);
    const b = elementOf(partner);
    const myP = getProfile(data);
    const partnerP = getProfile(partner);
    const myR = getReasoning(data);
    const partnerR = getReasoning(partner);
    const overlay = typeof global.buildCompatibilityOverlayV1 === "function"
      ? global.buildCompatibilityOverlayV1(data, partner)
      : null;

    if (!myP || !partnerP || !myR || !partnerR || !overlay) {
      return `<p data-content-blocked="compatibility" style="font-size:13px;line-height:1.8;color:#475569">두 사람의 사주 정보를 충분히 읽지 못했어. 상대 사주까지 계산돼야 둘 사이 결과를 만들 수 있어.</p>`;
    }

    const relation = relationCopy(a, b, isT);

    const myDom = myP.sipsin?.dominantHuman || "내 기준을 찾고 움직이는 성향";
    const partnerDom = partnerP.sipsin?.dominantHuman || "자기 기준을 찾고 움직이는 성향";
    const mySecond = myP.sipsin?.secondaryHuman || "";
    const partnerSecond = partnerP.sipsin?.secondaryHuman || "";
    const myStrong = ELEMENT_WORD[myP.elements?.influenceRank?.strongest] || "익숙한 방식으로 밀어가는 힘";
    const partnerStrong = ELEMENT_WORD[partnerP.elements?.influenceRank?.strongest] || "익숙한 방식으로 밀어가는 힘";
    const myWeak = ELEMENT_WORD[myP.elements?.influenceRank?.weakest] || "일부러 챙겨야 하는 힘";
    const partnerWeak = ELEMENT_WORD[partnerP.elements?.influenceRank?.weakest] || "일부러 챙겨야 하는 힘";
    const myNeed = myP.elements?.primaryBehavior?.verb || "내 기준을 먼저 확인하는 것";
    const partnerNeed = partnerP.elements?.primaryBehavior?.verb || "자기 기준을 먼저 확인하는 것";
    const mySecondNeed = myP.elements?.secondaryBehavior?.verb || myNeed;
    const partnerSecondNeed = partnerP.elements?.secondaryBehavior?.verb || partnerNeed;
    const myAvoid = myP.elements?.avoidBehavior?.verb || "한 가지 방식만 계속 밀어붙이는 것";
    const partnerAvoid = partnerP.elements?.avoidBehavior?.verb || "한 가지 방식만 계속 밀어붙이는 것";
    const myClimate = myP.balance?.climateHuman || "속도를 조절하면서 현실 반응을 확인하는 쪽";
    const partnerClimate = partnerP.balance?.climateHuman || "속도를 조절하면서 현실 반응을 확인하는 쪽";
    const myWeakStat = myP.behavior?.weakStatHuman || "내가 실제로 소모되는 지점을 확인하는 것";
    const partnerWeakStat = partnerP.behavior?.weakStatHuman || "자기가 실제로 소모되는 지점을 확인하는 것";
    const myClash = !!myP.relations?.hasClash;
    const partnerClash = !!partnerP.relations?.hasClash;
    const sameStrength = myP.strength?.code === partnerP.strength?.code;
    const sameStrongElement = myP.elements?.influenceRank?.strongest === partnerP.elements?.influenceRank?.strongest;
    const bothClash = myClash && partnerClash;

    const dayRelations = overlay.dayBranchRelations || [];
    const directPairRelation = dayRelations.find(x=>x.type==="clash")
      || dayRelations.find(x=>x.type==="combine")
      || dayRelations.find(x=>["harm","break","punishment"].includes(x.type))
      || null;
    const directPairCopy = directPairRelation?.type === "clash"
      ? (isT ? "둘의 가까운 관계 자리가 직접 부딪히는 신호가 있어, 감정이 커졌을 때 바로 결론내리면 충돌이 증폭될 수 있어." : "둘의 가까운 관계 자리가 정면으로 부딪히는 신호가 있어서, 좋아하는 마음과 별개로 감정이 커진 순간엔 서로를 밀어내듯 반응할 수 있어.")
      : directPairRelation?.type === "combine"
        ? (isT ? "둘의 가까운 관계 자리에 서로 묶이는 신호가 있어 반응을 빠르게 의식할 수 있어. 다만 실제 합화까지 확정하진 않아." : "둘의 가까운 관계 자리에 서로를 의식하고 묶이기 쉬운 신호가 있어. 다만 ‘무조건 잘 맞는다’로 단정하지는 않을게.")
        : directPairRelation
          ? (isT ? "둘의 가까운 관계 자리에 미세한 마찰 신호가 있어. 이 관계 하나만으로 길흉을 확정하지 않고 실제 반복패턴과 함께 봐." : "둘의 가까운 관계 자리에는 작은 마찰 신호가 있어. 이 신호 하나로 관계를 나쁘다고 말하지 않고, 실제로 어떤 장면에서 반복되는지 같이 봐야 해.")
          : (isT ? "가까운 관계 자리에서 직접적인 합·충 신호가 강하게 잡히진 않아. 실제 차이는 두 사람의 힘 쓰는 방식에서 더 본다." : "가까운 관계 자리끼리 바로 부딪히거나 강하게 묶이는 신호는 두드러지지 않아. 그래서 둘 사이 차이는 서로 힘을 쓰는 방식에서 더 선명하게 보여.");

    const complement = overlay.complement || {};
    const complementCopy = complement.aStrongSupportsB && complement.bStrongSupportsA
      ? (isT ? "서로의 강점이 상대에게 필요한 방향과 양쪽 모두 맞물리는 부분이 있어. 도움은 되지만 대신 결정해주지는 않는 게 중요해." : "서로 잘하는 힘이 상대에게 필요한 방향과 양쪽 모두 맞물리는 부분이 있어. 잘 쓰면 ‘내가 없는 걸 저 사람이 채워준다’는 느낌이 들 수 있어.")
      : complement.aStrongSupportsB || complement.bStrongSupportsA
        ? (isT ? "한쪽의 강점이 다른 쪽에게 필요한 방향과 맞물리는 비대칭 보완이 있어. 도움과 의존을 구분해." : "한 사람의 강점이 다른 사람에게 필요한 방향과 맞물리는 부분이 있어. 그래서 한쪽이 자연스럽게 끌어주거나 정리해주는 장면이 생길 수 있어.")
        : (isT ? "서로의 강점이 상대의 필요한 방향을 바로 채우는 구조는 아니야. 보완을 기대하기보다 역할과 기대를 명확히 맞추는 게 중요해." : "서로 잘하는 힘이 상대가 필요한 방향을 바로 채워주는 조합은 아니야. 그래서 ‘알아서 채워주겠지’보다 필요한 걸 직접 말해주는 게 더 중요해.");

    const intro = isT
      ? `궁합은 ‘좋다/나쁘다’ 한 줄로 끝내면 쓸모가 없어. 너와 ${safeName}의 사주를 따로 본 다음, 실제 관계에서 어디가 맞고 어디서 충돌하는지 처음부터 오래 가는 방식까지 나눠서 볼게.`
      : `궁합은 그냥 “둘이 잘 맞아” 한마디 듣고 끝내면 너무 아깝잖아. 언니가 너랑 ${safeName} 사주를 따로 펼쳐놓고, 왜 끌리고 어디서 서운해지고 어떻게 해야 오래 편한지까지 관계 흐름대로 차근차근 풀어줄게.`;

    const cards = [
      {
        title: "01 · 둘 사이를 한 문장으로 보면",
        body: isT
          ? `${relation} ${directPairCopy} 너는 <b>${myDom}</b> 쪽, ${safeName}은 <b>${partnerDom}</b> 쪽이 강하다. 둘의 차이는 애정의 크기보다 반응 방식 차이로 보는 게 정확해.`
          : `${relation} ${directPairCopy} 너는 <b>${myDom}</b> 쪽으로 마음이 움직이고, ${safeName}은 <b>${partnerDom}</b> 쪽으로 반응하는 편이야. 그래서 같은 마음이어도 표현되는 모양은 꽤 다를 수 있어.`
      },
      {
        title: "02 · 서로에게 먼저 보이는 강점",
        body: isT
          ? `너는 <b>${myStrong}</b>, ${safeName}은 <b>${partnerStrong}</b>이 각자 강하게 드러나는 힘이야. ${complementCopy}`
          : `너한테는 <b>${myStrong}</b>, ${safeName}한테는 <b>${partnerStrong}</b>이 각자 강하게 드러나. ${complementCopy}`
      },
      {
        title: "03 · 내가 사랑할 때 나오는 모습",
        body: isT
          ? `너는 연애에서도 <b>${myDom}</b>이 기본 반응으로 나온다. ${myP.strength?.T || ""}. 사랑한다고 해서 네 기본 작동 방식이 사라지지는 않아.`
          : `너는 좋아하는 사람이 생겨도 기본적으로 <b>${myDom}</b> 쪽으로 마음을 써. ${myP.strength?.F || ""}. 그러니까 사랑할수록 잘해주려고 애쓰는 부분과, 혼자 견디려고 하는 부분을 같이 봐줘야 해.`
      },
      {
        title: `04 · ${safeName}이 사랑할 때 나오는 모습`,
        body: isT
          ? `${safeName}은 <b>${partnerDom}</b> 쪽이 먼저 나온다${partnerSecond ? `, 그다음에는 ${partnerSecond}` : ""}. ${partnerP.strength?.T || ""}. 상대 반응을 네 방식으로만 해석하면 오판할 수 있어.`
          : `${safeName}은 마음이 생겼을 때 <b>${partnerDom}</b> 쪽으로 먼저 표현하는 편이야${partnerSecond ? `. 그 안에는 ${partnerSecond}도 같이 있고` : ""}. ${partnerP.strength?.F || ""}. 네가 기대한 표현이 아니어도 저 사람 나름의 사랑 방식일 수 있다는 걸 같이 봐야 해.`
      },
      {
        title: "05 · 말이 잘 통할 때와 엇갈릴 때",
        body: isT
          ? `대화가 잘 될 때는 서로 결론보다 기준을 먼저 공개할 때다. 너는 <b>${myNeed}</b>, ${safeName}은 <b>${partnerNeed}</b>이 필요하다. 상대가 알아서 눈치채길 기다리지 마.`
          : `둘이 대화할 때 제일 중요한 건 “왜 그것밖에 몰라?”가 아니라 각자 필요한 걸 먼저 말해주는 거야. 너는 <b>${myNeed}</b>이 필요하고, ${safeName}은 <b>${partnerNeed}</b>이 필요해. 서로 마음을 맞히는 게임처럼 만들지 않았으면 좋겠어.`
      },
      {
        title: "06 · 서로 부담이 커질 수 있는 포인트",
        body: isT
          ? `너는 <b>${myWeak}</b> 쪽을 일부러 챙겨야 하고, ${safeName}은 <b>${partnerWeak}</b> 쪽을 따로 챙겨야 해. 둘 사이에서 이 힘이 필요한 상황이 겹치면 상대 반응을 추측하지 말고 실제로 무엇이 부족한지 확인해.`
          : `너는 <b>${myWeak}</b> 쪽을 일부러 챙겨야 하고, ${safeName}은 <b>${partnerWeak}</b> 쪽을 따로 챙겨야 해. 둘 사이에서 이 힘이 필요한 상황이 겹치면 “왜 저래?”라고 해석하기 전에 지금 뭐가 부족한지 먼저 확인해보자.`
      },
      {
        title: "07 · 갈등이 생겼을 때 확인할 신호",
        body: isT
          ? `${bothClash ? "둘 다 각자 사주 안에 충 신호가 있어." : myClash ? "너의 사주 안에 충 신호가 있어." : partnerClash ? safeName + "의 사주 안에 충 신호가 있어." : "두 사람 모두 사주 안의 충 신호가 핵심 변수로 잡히진 않아."} 이 신호만으로 ‘참다가 폭발한다’ 같은 반응을 단정하진 않아. 갈등이 생기면 너의 <b>${myAvoid}</b>, 상대의 <b>${partnerAvoid}</b>이 실제로 겹치는지부터 확인해.`
          : `${bothClash ? "둘 다 각자 사주 안에 충 신호가 있어." : myClash ? "네 사주 안에 충 신호가 있어." : partnerClash ? `${safeName}의 사주 안에 충 신호가 있어.` : "둘 다 사주 안의 충 신호가 핵심 변수로 잡히진 않아."} 이것만 보고 누가 참다가 폭발한다거나 갑자기 선을 긋는다고 정하진 않을게. 실제 갈등에서는 네 <b>${myAvoid}</b>과 상대의 <b>${partnerAvoid}</b>이 겹치는지부터 보자.`
      },
      {
        title: "08 · 싸운 뒤 화해하는 법",
        body: isT
          ? `화해 순서는 감정 정리 → 사실 확인 → 다음 규칙 합의가 맞다. 너는 <b>${mySecondNeed}</b>, ${safeName}은 <b>${partnerSecondNeed}</b>을 넣어야 같은 싸움이 반복되지 않는다.`
          : `화해할 때 “미안해, 됐지?”로 빨리 덮기보다 서로 뭐가 아팠는지 한 번은 확인해줘. 너한테는 <b>${mySecondNeed}</b>이 도움이 되고, ${safeName}에게는 <b>${partnerSecondNeed}</b>이 필요해. 사과보다 다음번에 달라지는 행동이 둘 마음을 더 안심시켜줘.`
      },
      {
        title: "09 · 애정 표현이 어긋나는 순간",
        body: isT
          ? `${sameStrength ? "둘의 기본적인 힘 쓰는 방식은 비슷하게 잡혀 있어. 다만 이게 애정 표현 방식까지 같다는 뜻은 아니야." : "둘의 기본적인 힘 쓰는 방식은 다르게 잡혀 있어. 이 차이만으로 애정 표현 방식까지 다르다고 단정할 수는 없어."} 말, 연락, 행동 중 무엇을 애정의 증거로 보는지 직접 맞춰.`
          : `${sameStrength ? "둘은 기본적인 힘 쓰는 방식이 비슷하게 잡혀 있어. 그렇다고 마음을 표현하는 속도까지 같다고 보진 않을게." : "둘은 기본적인 힘 쓰는 방식이 다르게 잡혀 있어. 그렇다고 애정 표현이 꼭 어긋난다고 단정하진 않을게."} 그래서 “난 연락이 이 정도면 안심돼”, “난 말보다 행동이 더 중요해”처럼 사랑받는 느낌이 드는 방식을 구체적으로 말해주는 게 좋아.`
      },
      {
        title: "10 · 연락과 혼자 있는 시간",
        body: isT
          ? `너는 <b>${myClimate}</b>, ${safeName}은 <b>${partnerClimate}</b>이 편하다. 연락 빈도를 사랑의 점수로 쓰지 말고 각자 회복에 필요한 시간을 먼저 정해.`
          : `연락이 많아야 사랑이고 혼자 있고 싶으면 식은 마음이라고 단정하지 말자. 너는 <b>${myClimate}</b>일 때 편하고, ${safeName}은 <b>${partnerClimate}</b>일 때 자기 리듬을 찾기 쉬워. 서로 숨 돌릴 시간을 인정해주면 오히려 관계가 덜 불안해져.`
      },
      {
        title: "11 · 일상에서 같이 살기 편하려면",
        body: isT
          ? `일정, 약속시간, 집안일, 휴식 방식처럼 생활 기준은 감정과 별개로 미리 맞춰두는 편이 안전해. 실제로 반복해서 부딪히는 항목이 있다면 담당과 기준을 명확히 해.`
          : `좋아하는 마음이 커도 생활 리듬이 계속 안 맞으면 사소한 일로 지치기 쉬워. 약속시간, 쉬는 방식, 집안일, 주말 계획 같은 건 “사랑하면 알아서 맞겠지” 하지 말고 둘만의 기준을 만들어두는 게 훨씬 편해.`
      },
      {
        title: "12 · 돈과 현실 문제를 같이 다룰 때",
        body: isT
          ? `관계에서 돈은 감정보다 기준 문제다. 너는 <b>${myWeakStat}</b>, ${safeName}은 <b>${partnerWeakStat}</b>을 놓치면 현실 스트레스가 관계 감정으로 번질 수 있다. 비용·선물·여행·저축 기준을 미리 말해.`
          : `돈 얘기는 사랑이 부족해서 불편한 게 아니라 서로 기준이 다르면 누구나 조심스러워져. 너는 <b>${myWeakStat}</b>을, ${safeName}은 <b>${partnerWeakStat}</b>을 놓치지 않는 게 중요해. 데이트비, 선물, 여행, 큰 지출은 마음 눈치 보지 말고 미리 얘기하는 게 오히려 덜 상처받아.`
      },
      {
        title: "13 · 질투·경계·사생활",
        body: isT
          ? `경계선은 애매하게 두지 마. 친구 관계, 전 연인, SNS, 연락 공개 범위처럼 싸움이 날 수 있는 항목은 허용/불편 기준을 구체적으로 맞춰. 통제와 배려를 섞지 않는 게 핵심이다.`
          : `사랑하면 다 보여줘야 한다거나, 믿으면 아무 말도 하면 안 된다는 식으로 극단적으로 가지 않았으면 좋겠어. 친구, 전 연인, SNS, 개인시간처럼 민감한 부분은 “난 여기까지는 괜찮고 여기부터는 불편해”라고 말해도 돼. 경계를 말하는 건 상대를 못 믿는다는 뜻이 아니야.`
      },
      {
        title: "14 · 오래 만날수록 좋아지는 부분",
        body: isT
          ? `${sameStrongElement ? "두 사람의 실제 세력에서 가장 강한 오행이 같아 공통된 강점 축이 있어. 그렇다고 잘하는 역할까지 같다는 뜻은 아니야." : "두 사람의 실제 세력에서 가장 강한 오행이 달라 강점 축도 다르게 잡혀 있어. 이 차이가 자동으로 보완된다고 단정하진 않아."} 실제 생활에서 각자 잘하는 영역을 확인해 나누는 게 핵심이야.`
          : `${sameStrongElement ? "둘의 실제 세력에서 가장 강한 오행이 같아 공통된 강점 축은 있어. 그래도 서로 잘하는 역할까지 같다고 보진 않을게." : "둘의 실제 세력에서 가장 강한 오행이 달라 강점 축도 다르게 잡혀 있어. 그렇다고 저절로 서로를 보완한다고 말하진 않을게."} 실제로 같이 있을 때 각자 잘하는 영역을 확인해 나누는 게 더 정확해.`
      },
      {
        title: "15 · 이 관계에서 꼭 조심할 신호",
        body: isT
          ? `위험 신호는 세 가지다. <b>말 안 하고 시험하기</b>, <b>상대 방식만 문제라고 단정하기</b>, <b>작은 불편함을 쌓아 한 번에 정리하기</b>. 이 셋이 반복되면 궁합보다 운영 방식이 문제다.`
          : `언니가 이 관계에서 제일 조심하라고 하고 싶은 건 세 가지야. 마음을 말하지 않고 상대가 알아채나 시험하는 것, 내 방식만 사랑의 정답이라고 생각하는 것, 괜찮은 척 쌓아두다가 한 번에 끝내버리는 것. 이게 반복되면 원래 잘 맞는 부분도 점점 안 보이게 돼.`
      },
      {
        title: "16 · 둘이 실제로 지키면 좋은 약속",
        body: isT
          ? `<b>1.</b> 서운함은 너무 오래 묵히지 말고 말하기.<br><b>2.</b> 싸울 때 관계 전체를 평가하지 않기.<br><b>3.</b> 연락·돈·개인시간 기준을 미리 합의하기.<br><b>4.</b> 너는 ${myNeed}, ${safeName}은 ${partnerNeed}을 존중하기.<br><b>5.</b> 같은 싸움이 반복되면 감정보다 둘의 규칙을 먼저 바꾸기.`
          : `언니가 마지막으로 둘한테 약속 다섯 개만 남겨줄게.<br><br><b>1.</b> 서운한 건 너무 오래 묵히지 않기.<br><b>2.</b> 싸운 날 “우리 원래 안 맞아”까지 가지 않기.<br><b>3.</b> 연락·돈·혼자 있는 시간은 미리 기준 맞추기.<br><b>4.</b> 너한테 필요한 <b>${myNeed}</b>과 ${safeName}에게 필요한 <b>${partnerNeed}</b>을 서로 존중하기.<br><b>5.</b> 같은 싸움이 반복되면 사랑을 의심하기 전에 둘의 방식부터 바꿔보기.<br><br>궁합은 둘 사이를 결정하는 판정표라기보다, 잘 맞는 부분은 더 잘 쓰고 부딪히는 부분은 덜 다치게 만드는 지도처럼 봐주면 돼.`
      },
    ];

    const pairTimeline = overlay.compatibilityTimeline || { nearMonths:[], years:[] };
    const interestingMonths = (pairTimeline.nearMonths || []).filter(x=>x.pairClass!=="neutral").slice(0,3);
    const interestingYears = (pairTimeline.years || []).filter(x=>x.pairClass!=="neutral").slice(0,5);
    const pairClassCopy = (row) => {
      if (row.pairClass === "aligned-support") return "둘 다 움직일 여유가 같이 생기는 구간";
      if (row.pairClass === "shared-caution") return "둘 다 여유가 줄어 갈등 관리가 먼저인 구간";
      if (row.pairClass === "asymmetric") return "한쪽은 앞으로 가고 한쪽은 버거울 수 있어 속도차 조정이 필요한 구간";
      if (row.pairClass === "one-side-support") return "한쪽의 여유가 관계를 받쳐줄 수 있는 구간";
      if (row.pairClass === "one-side-caution") return "한쪽의 부담을 다른 쪽이 오해하지 않게 확인할 구간";
      return "도움과 부담이 섞여 한쪽 결론으로 밀지 않는 구간";
    };
    const pairTimingBody = `
      <div data-export-compat-timing="1" data-product-exclusive="compatibility" data-product-contract="compatibility" data-overlay-fingerprint="${esc(overlay.fingerprint)}" style="padding:14px 15px;border-radius:16px;background:#f8fafc;border:1px solid #e2e8f0;margin:14px 0 6px;font-size:12.5px;line-height:1.8;color:#475569">
        <b>둘이 같이 있을 때의 시기 흐름</b><br>
        ${interestingMonths.length ? interestingMonths.map(x=>`<span><b>${esc(x.startYmd)}</b> · ${esc(pairClassCopy(x))}</span>`).join("<br>") : "가까운 18개월에는 둘 사이에서 한쪽으로 강하게 기운 달을 억지로 만들지 않았어."}
        <br><br><b>연도 단위 관계 흐름</b><br>
        ${interestingYears.length ? interestingYears.map(x=>`<span><b>${x.year}년</b> · ${esc(pairClassCopy(x))}</span>`).join("<br>") : "5년 안에서 둘의 흐름이 동시에 크게 꺾이는 해는 따로 잡지 않았어."}
      </div>`;
    const summary = `<div data-export-intro="compat" data-product-contract="compatibility" data-person-a-fingerprint="${esc(overlay.personAFingerprint)}" data-person-b-fingerprint="${esc(overlay.personBFingerprint)}" style="padding:15px;border-radius:18px;background:#fff7ed;border:1px solid #fed7aa;margin-bottom:10px"><div style="font-size:11px;font-weight:900;color:#c2410c;margin-bottom:6px">우리 둘 관계를 깊게 보는 궁합</div><div style="font-size:13px;line-height:1.85;color:#7c2d12">${intro}</div></div>`;
    const pairCard = `<div data-export-pair="compat" style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:10px 0 6px"><div style="padding:12px;border-radius:14px;background:#fff;border:1px solid #e2e8f0"><div style="font-size:10px;font-weight:900;color:#94a3b8">나</div><div style="font-size:12px;font-weight:900;color:#0f172a;margin-top:4px">${esc(myDom)}</div></div><div style="padding:12px;border-radius:14px;background:#fff;border:1px solid #e2e8f0"><div style="font-size:10px;font-weight:900;color:#94a3b8">${safeName}</div><div style="font-size:12px;font-weight:900;color:#0f172a;margin-top:4px">${esc(partnerDom)}</div></div></div>`;
    return summary + pairCard + pairTimingBody + cards.map((row, index) => `<section data-export-kind="compat" data-export-index="${index}" style="padding:18px 0;border-bottom:1px solid #eef2f7"><h4 style="font-size:15px;font-weight:950;margin:0 0 8px;color:#0f172a">${row.title}</h4><div style="font-size:13px;line-height:1.9;color:#475569">${row.body}</div></section>`).join("");
  }


  function cloneForExport(node) {
    if (!node) return null;
    const copy = node.cloneNode(true);
    copy.removeAttribute?.("id");
    copy.querySelectorAll?.("[id]").forEach((el) => el.removeAttribute("id"));
    copy.style.maxWidth = "none";
    return copy;
  }

  function exportGroup(title, subtitle, nodes, slug) {
    return {
      title,
      subtitle,
      slug,
      nodes: (nodes || []).filter(Boolean),
    };
  }

  function buildPaidExportGroups(productId, body) {
    const groups = [];

    if (productId === "full_saju" || productId === "all_in_one") {
      const full = [...body.querySelectorAll('[data-export-kind="full"]')];
      const intro = body.querySelector('[data-export-intro="full"]');
      const fullTitles = [
        ["1장 · 나를 이해하는 법", "기본 성향 · 겉과 속 · 강점", "01_나를_이해하는_법"],
        ["2장 · 지치고 결정하고 일하는 법", "과부하 · 결정 · 일", "02_일하고_결정하는_법"],
        ["3장 · 돈·연애·사람", "돈 · 사랑 · 관계", "03_돈_연애_사람"],
        ["4장 · 회복하고 앞으로 가는 법", "회복 · 변화 · 평생 사용법", "04_회복과_사용법"],
      ];
      for (let i = 0; i < 4; i++) {
        const chunk = full.slice(i * 3, i * 3 + 3);
        if (!chunk.length) continue;
        const extra = i === 0 && intro ? [intro] : [];
        groups.push(exportGroup(
          fullTitles[i][0],
          fullTitles[i][1],
          [...extra, ...chunk],
          fullTitles[i][2],
        ));
      }
    }

    if (productId === "compatibility") {
      const sections = [...body.querySelectorAll('[data-export-kind="compat"]')];
      const intro = body.querySelector('[data-export-intro="compat"]');
      const pair = body.querySelector('[data-export-pair="compat"]');
      const timing = body.querySelector('[data-export-compat-timing="1"]');
      const titles = [
        ["1장 · 우리는 왜 끌릴까", "첫인상 · 나의 연애 방식 · 상대의 연애 방식", "01_우리는_왜_끌릴까"],
        ["2장 · 대화하고 싸우고 화해하는 법", "대화 · 서운함 · 갈등 · 화해", "02_대화_갈등_화해"],
        ["3장 · 애정표현·연락·생활·돈", "현실에서 자주 부딪히는 부분", "03_연락_생활_돈"],
        ["4장 · 경계와 오래 가는 법", "사생활 · 장기 강점 · 위험신호 · 약속", "04_오래_가는_법"],
      ];
      for (let i = 0; i < 4; i++) {
        const chunk = sections.slice(i * 4, i * 4 + 4);
        if (!chunk.length) continue;
        const extra = i === 0 ? [intro, pair, timing].filter(Boolean) : [];
        groups.push(exportGroup(
          titles[i][0],
          titles[i][1],
          [...extra, ...chunk],
          titles[i][2],
        ));
      }
    }

    if (productId === "concern_bundle3" || productId === "all_in_one") {
      const concernSections = [...body.querySelectorAll('[data-export-kind="concern"]')];
      const synthesis = productId === "concern_bundle3"
        ? body.querySelector('[data-product-exclusive="concern_bundle3"]')
        : body.querySelector('[data-product-exclusive="all_in_one"]');
      concernSections.forEach((section, concernIndex) => {
        const key = section.getAttribute("data-concern") || "";
        const label = CONCERNS[key] || section.querySelector("h3")?.textContent?.trim() || "고민";
        const articles = [...section.querySelectorAll("article")];
        const halves = [
          {
            title: `${label} · 나를 이해하기`,
            subtitle: "핵심 성향 · 반복 패턴 · 내가 잘못 짚는 부분",
            nodes: concernIndex === 0 && synthesis ? [synthesis, ...articles.slice(0, 3)] : articles.slice(0, 3),
            suffix: "01_나를_이해하기",
          },
          {
            title: `${label} · 어떻게 움직일지`,
            subtitle: "실제 처방 · 맞는 사람/환경 · 움직일 시기",
            nodes: articles.slice(3, 6),
            suffix: "02_어떻게_움직일지",
          },
        ];
        halves.forEach((half) => {
          if (!half.nodes.length) return;
          groups.push(exportGroup(
            half.title,
            half.subtitle,
            half.nodes,
            `${String(concernIndex + 1).padStart(2, "0")}_${key || "concern"}_${half.suffix}`,
          ));
        });
      });
    }

    if (!groups.length) {
      groups.push(exportGroup(
        PRODUCTS[productId]?.name || "전체 결과",
        "전체 결과",
        [body],
        "01_전체결과",
      ));
    }
    return groups;
  }

  function buildPaidExportPage(product, group, index, total) {
    const page = document.createElement("div");
    page.style.cssText = "position:fixed;left:-12000px;top:0;width:480px;max-width:none;background:#fff;color:#0f172a;padding:26px 24px 32px;box-sizing:border-box;font-family:-apple-system,BlinkMacSystemFont,'Pretendard','Segoe UI',sans-serif;contain:layout style";
    page.innerHTML = `
      <div style="padding-bottom:16px;margin-bottom:12px;border-bottom:1px solid #e2e8f0">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:12px">
          <div style="font-size:12px;font-weight:950;color:#f43f5e">어떤언니 · ${esc(product?.name || "내 상담 기록")}</div>
          <div style="font-size:10px;font-weight:900;color:#94a3b8">${index + 1} / ${total}</div>
        </div>
        <div style="font-size:23px;line-height:1.28;font-weight:950;letter-spacing:-.04em;color:#0f172a;margin-top:8px">${esc(group.title)}</div>
        <div style="font-size:11px;line-height:1.6;font-weight:800;color:#94a3b8;margin-top:5px">${esc(group.subtitle || "")}</div>
      </div>
      <div data-export-page-body></div>
    `;
    const slot = page.querySelector("[data-export-page-body]");
    group.nodes.forEach((node) => {
      const copy = cloneForExport(node);
      if (copy) slot.appendChild(copy);
    });
    document.body.appendChild(page);
    return page;
  }

  function safeFilePart(value) {
    return String(value || "")
      .replace(/[\\/:*?"<>|]+/g, "_")
      .replace(/\s+/g, "_")
      .replace(/_+/g, "_")
      .slice(0, 70);
  }

  const paidExportCache = new Map();
  const paidExportJobs = new Map();
  const paidExportPriority = new Map();

  function paidExportSignature(productId, body) {
    const text = String(body?.innerText || "");
    let hash = 2166136261;
    for (let i = 0; i < text.length; i += Math.max(1, Math.floor(text.length / 600))) {
      hash ^= text.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return `${productId}:${text.length}:${hash >>> 0}`;
  }

  function isCurrentPaidExport(root, productId, key) {
    const body = root?.querySelector("#unniProductBody");
    if (!body || root?.style?.display === "none") return false;
    return paidExportSignature(productId, body) === key;
  }

  function requiresFreshShareGesture() {
    const exporter = global.__UNNI_IMAGE_EXPORT_V2__;
    return !!(exporter?.isMobileDevice?.() && !exporter?.isKakaoInApp?.());
  }

  function setPaidExportButtonReady(root, ready) {
    const button = root?.querySelector("#unniProductSaveAll");
    if (!button) return;
    button.disabled = !ready;
    button.style.opacity = ready ? "1" : ".62";
    if (ready) button.removeAttribute("aria-busy");
    else button.setAttribute("aria-busy", "true");
  }

  function setPaidExportProgress(root, current, total, ready = false) {
    const button = root?.querySelector("#unniProductSaveAll");
    const hint = root?.querySelector("#unniProductSaveHint");
    if (!button || !hint) return;
    hint.style.display = "block";
    if (ready) {
      button.textContent = "사진으로 한 번에 저장하기";
      hint.textContent = productVoice(getData(), {
        F: `저장할 사진 준비됐어 · ${total}장`,
        T: `저장 준비 완료 · ${total}장`,
      });
      return;
    }
    button.textContent = current > 0
      ? `사진으로 한 번에 저장하기 · ${current}/${total}`
      : "사진으로 한 번에 저장하기";
    hint.textContent = total > 0
      ? productVoice(getData(), {
          F: `읽는 동안 사진도 같이 준비 중 · ${current}/${total}장`,
          T: `결과 읽는 동안 미리 준비 중 · ${current}/${total}장`,
        })
      : productVoice(getData(), {
          F: "읽는 동안 저장할 사진도 같이 준비해둘게",
          T: "읽는 동안 저장할 사진도 준비해둘게.",
        });
  }

  function waitForExportIdle(key, root, productId) {
    const ensureCurrent = () => {
      if (!isCurrentPaidExport(root, productId, key)) {
        throw new Error("EXPORT_IDLE_CANCELLED");
      }
    };
    if (paidExportPriority.get(key)) {
      try {
        ensureCurrent();
        return Promise.resolve();
      } catch (error) {
        return Promise.reject(error);
      }
    }
    return new Promise((resolve, reject) => {
      const finish = () => {
        try {
          ensureCurrent();
          resolve();
        } catch (error) {
          reject(error);
        }
      };
      if (typeof requestIdleCallback === "function") {
        requestIdleCallback(finish, { timeout: 500 });
      } else {
        setTimeout(finish, 90);
      }
    });
  }

  async function preparePaidExportAssets(root, productId, { priority = false } = {}) {
    const exporter = global.__UNNI_IMAGE_EXPORT_V2__;
    const body = root?.querySelector("#unniProductBody");
    const product = PRODUCTS[productId];
    if (!body || !exporter?.renderElementToPngBlob) throw new Error("EXPORT_ENGINE_MISSING");
    const key = paidExportSignature(productId, body);

    if (paidExportCache.has(key)) {
      const cached = paidExportCache.get(key);
      if (isCurrentPaidExport(root, productId, key)) {
        setPaidExportProgress(root, cached.blobs.length, cached.blobs.length, true);
      }
      return cached;
    }
    // 새 리포트를 만들기 시작하는 순간 이전 PNG Blob을 먼저 놓아준다.
    // 올인원 16장 뒤에 다른 올인원을 열어도 두 세트가 동시에 메모리에 남지 않게 한다.
    paidExportCache.clear();
    if (priority) paidExportPriority.set(key, true);
    if (paidExportJobs.has(key)) return paidExportJobs.get(key);

    const job = (async () => {
      const groups = buildPaidExportGroups(productId, body);
      const blobs = [];
      const filenames = [];
      const pages = [];
      setPaidExportProgress(root, 0, groups.length, false);

      try {
        for (let index = 0; index < groups.length; index++) {
          await waitForExportIdle(key, root, productId);
          const group = groups[index];
          const page = buildPaidExportPage(product, group, index, groups.length);
          pages.push(page);
          if (document.fonts?.ready) {
            try { await document.fonts.ready; } catch (_) {}
          }
          await new Promise((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(resolve)),
          );
          // 모바일은 화면에서 읽을 때 충분히 선명한 820px로 렌더링해 대기시간을 줄인다.
          const targetWidth = exporter.isMobileDevice?.() ? 820 : 900;
          const blob = await exporter.renderElementToPngBlob(page, targetWidth);
          if (!blob || blob.size < 1000) throw new Error("PAID_EXPORT_EMPTY");
          if (!isCurrentPaidExport(root, productId, key)) {
            throw new Error("EXPORT_IDLE_CANCELLED");
          }
          blobs.push(blob);
          filenames.push(
            `어떤언니_${safeFilePart(product?.name || "상담기록")}_${safeFilePart(group.slug || group.title)}.png`,
          );
          page.remove();
          pages.pop();
          setPaidExportProgress(root, blobs.length, groups.length, false);
        }
        if (!isCurrentPaidExport(root, productId, key)) {
          throw new Error("EXPORT_IDLE_CANCELLED");
        }
        const prepared = { key, blobs, filenames };
        // 모바일에서 16장 올인원까지 열어본 뒤 다른 리포트를 보면 Blob이 계속 누적되지 않게
        // 현재 리포트 한 세트만 보관한다.
        paidExportCache.clear();
        paidExportCache.set(key, prepared);
        setPaidExportProgress(root, blobs.length, blobs.length, true);
        return prepared;
      } finally {
        pages.forEach((page) => page.remove());
        paidExportJobs.delete(key);
        paidExportPriority.delete(key);
      }
    })();

    paidExportJobs.set(key, job);
    return job;
  }

  function prewarmPaidExport(root, productId) {
    const body = root?.querySelector("#unniProductBody");
    if (!body) return;
    const key = paidExportSignature(productId, body);
    const freshGesture = requiresFreshShareGesture();

    // iOS/Android의 다중 파일 공유는 사용자 탭 직후의 activation이 중요하다.
    // 준비가 끝나기 전에 탭해서 렌더링을 기다리게 하지 않고, 준비 완료 후 한 번 탭하면
    // 곧바로 navigator.share(files)로 넘어가도록 모바일 브라우저에서만 잠깐 잠근다.
    if (freshGesture) setPaidExportButtonReady(root, false);

    const start = () => {
      if (!isCurrentPaidExport(root, productId, key)) return;
      preparePaidExportAssets(root, productId, { priority:false })
        .then((prepared) => {
          if (!isCurrentPaidExport(root, productId, key)) return;
          setPaidExportProgress(root, prepared.blobs.length, prepared.blobs.length, true);
          if (freshGesture) setPaidExportButtonReady(root, true);
        })
        .catch((error) => {
          if (!isCurrentPaidExport(root, productId, key)) return;
          if (freshGesture) setPaidExportButtonReady(root, true);
          if (error?.message !== "EXPORT_IDLE_CANCELLED") {
            const hint = root?.querySelector("#unniProductSaveHint");
            if (hint) {
              hint.textContent = productVoice(getData(), {
                F: "사진 준비가 잠깐 꼬였어. 저장을 누르면 언니가 다시 준비할게.",
                T: "사진 준비가 잠깐 실패했어. 저장을 누르면 다시 준비할게.",
              });
            }
            console.warn("유료 리포트 저장 미리 준비 실패:", error);
          }
        });
    };
    if (typeof requestIdleCallback === "function") {
      requestIdleCallback(start, { timeout: 1400 });
    } else {
      setTimeout(start, 700);
    }
  }

  async function saveFullPaidReport(root, productId) {
    const exporter = global.__UNNI_IMAGE_EXPORT_V2__;
    const product = PRODUCTS[productId];
    const button = root?.querySelector("#unniProductSaveAll");
    if (!exporter || !button) {
      productToast(getData(), {
        F: "사진 저장 기능을 불러오지 못했어. 지금 결과는 그대로 있으니까 한 번만 다시 해보자.",
        T: "사진 저장 기능을 불러오지 못했어. 결과는 유지됐어. 다시 실행해줘.",
      });
      return;
    }

    const originalText = button.textContent;
    button.disabled = true;
    button.style.opacity = ".72";
    try {
      const { blobs, filenames } = await preparePaidExportAssets(root, productId, { priority:true });
      if (!blobs.length) throw new Error("PAID_EXPORT_EMPTY");

      if (blobs.length === 1) {
        const blob = blobs[0];
        if (exporter.isKakaoInApp?.()) {
          await exporter.showImageSaveFallback(blob, "save");
        } else if (exporter.isMobileDevice?.()) {
          const shared = await exporter.nativeSharePng(blob, filenames[0], product?.name || "어떤언니 상담 기록");
          if (!shared) exporter.downloadPngBlob(blob, filenames[0]);
        } else {
          exporter.downloadPngBlob(blob, filenames[0]);
        }
        return;
      }

      // 모바일은 iOS/Android 모두 가능한 경우 여러 장을 네이티브 공유창에 한 번에 넘긴다.
      if (!exporter.isKakaoInApp?.() && exporter.isMobileDevice?.()) {
        let shared = false;
        try {
          shared = await exporter.nativeSharePngFiles(
            blobs,
            filenames,
            product?.name || "어떤언니 상담 기록",
          );
        } catch (error) {
          if (error?.name !== "AbortError") console.warn("다중 이미지 공유 실패:", error);
        }
        if (shared) return;

        if (exporter.isAndroidDevice?.()) {
          blobs.forEach((blob, index) =>
            setTimeout(() => exporter.downloadPngBlob(blob, filenames[index]), index * 120),
          );
          productToast(getData(), {
            F: `${blobs.length}장 저장을 시작했어. 순서대로 들어갈 거야.`,
            T: `${blobs.length}장 저장을 시작했어.`,
          });
          return;
        }
      }

      if (exporter.isKakaoInApp?.() || exporter.isIOSDevice?.()) {
        await exporter.showImagePagesFallback(
          blobs,
          `${product?.name || "내 상담 기록"} · ${blobs.length}장`,
        );
        return;
      }

      blobs.forEach((blob, index) => {
        setTimeout(() => exporter.downloadPngBlob(blob, filenames[index]), index * 120);
      });
      productToast(getData(), {
        F: `주제별로 ${blobs.length}장 저장을 시작했어. 하나씩 이어서 저장될 거야.`,
        T: `주제별로 ${blobs.length}장 저장을 시작했어.`,
      });
    } catch (error) {
      console.error("유료 리포트 전체 저장 실패:", error);
      productToast(getData(), {
        F: "전체 결과 저장이 잠깐 꼬였어. 결과는 그대로니까 한 번만 다시 눌러줘.",
        T: "전체 결과 저장이 잠깐 실패했어. 결과는 유지됐어. 다시 눌러줘.",
      });
    } finally {
      button.disabled = false;
      button.style.opacity = "1";
      if (!button.textContent || button.textContent.includes("준비")) {
        button.textContent = originalText || "사진으로 한 번에 저장하기";
      }
    }
  }


  function productBody(productId, data, extra) {
    const mode = getMode(data);
    const sanitized = productPolicyApi()?.sanitizeProductPayload?.(productId, { extra }) || { extra };
    const safeExtra = sanitized.extra || {};
    if (productId === "concern_bundle3") return bundleHtml(data, mode, safeExtra);
    if (productId === "full_saju") return fullSajuHtml(data, mode);
    if (productId === "all_in_one") return allInOneHtml(data, mode, safeExtra);
    if (productId === "compatibility") return compatibilityHtml(data, mode, safeExtra);
    return "";
  }

  function ensureModal() {
    let root = document.getElementById("unniProductModal");
    if (root) return root;
    root = document.createElement("div");
    root.id = "unniProductModal";
    root.style.cssText = "display:none;position:fixed;inset:0;z-index:99999;background:rgba(24,21,25,.36);padding:10px;overflow:auto;-webkit-overflow-scrolling:touch;backdrop-filter:blur(5px)";
    root.innerHTML = `<div data-premium-modal-card="1" style="max-width:520px;margin:max(8px,env(safe-area-inset-top)) auto max(14px,env(safe-area-inset-bottom));background:#fffdfa;border:1px solid #e8e2dc;border-radius:25px;padding:0 16px 20px;box-shadow:0 22px 58px rgba(38,30,28,.14);overflow:visible"><div id="unniProductStickyHead" style="position:sticky;top:0;z-index:8;display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin:0 -16px;padding:16px 16px 13px;background:rgba(255,253,250,.97);backdrop-filter:blur(14px);border-radius:25px 25px 15px 15px;border-bottom:1px solid #e8e2dc"><div style="min-width:0;flex:1"><div id="unniProductBadge" style="font-size:9.5px;font-weight:800;color:#c9365b"></div><div style="display:flex;align-items:flex-end;justify-content:space-between;gap:10px;margin-top:5px"><h2 id="unniProductTitle" style="min-width:0;font-size:21px;line-height:1.28;font-weight:850;letter-spacing:-.025em;margin:0;color:#172033"></h2><div id="unniProductPrice" style="flex:none;padding:2px 0;font-size:11px;font-weight:820;color:#b83e5c;white-space:nowrap"></div></div></div><button id="unniProductClose" style="flex:none;border:1px solid #e8e2dc;background:#f8f6f3;border-radius:999px;width:38px;height:38px;font-size:18px;color:#697181;cursor:pointer">×</button></div><div id="unniProductBody" style="margin-top:14px"></div><div id="unniProductSetup" style="margin-top:14px"></div><div id="unniProductPayment" style="display:none;margin-top:14px;padding:13px 0 0;border-radius:0;background:transparent;border:0;border-top:1px solid #e8e2dc"><div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:9px"><div><div id="unniProductPaymentTitle" style="font-size:12px;font-weight:820;color:#354052">결제수단 선택</div><div id="unniProductPaymentSub" style="margin-top:2px;font-size:10px;font-weight:600;color:#8a9099">원하는 수단을 고른 뒤 아래에서 이어봐</div></div><div id="unniProductPaymentAmount" style="font-size:11px;font-weight:820;color:#c9365b"></div></div><div id="unniProductPaymentMethod"></div><div id="unniProductPaymentAgreement"></div></div><button id="unniProductSaveAll" type="button" style="display:none;width:100%;margin-top:22px;border:0;border-radius:15px;background:linear-gradient(90deg,#e94f72,#ed6a87);color:white;padding:14px 16px;font-size:13px;font-weight:820;cursor:pointer;box-shadow:0 8px 20px rgba(205,68,101,.13)">이 결과 사진으로 남기기</button><div id="unniProductSaveHint" style="display:none;margin-top:7px;text-align:center;font-size:10px;font-weight:650;line-height:1.55;color:#969ba4">결과 읽는 동안 저장용 사진을 미리 준비해둘게.</div><button id="unniProductAction" style="width:100%;margin-top:14px;border:0;border-radius:15px;background:linear-gradient(90deg,#e94f72,#ed6a87);color:white;padding:14px 16px;font-size:14px;font-weight:830;cursor:pointer;box-shadow:0 9px 22px rgba(205,68,101,.15)"></button><div id="unniProductActionHint" style="display:none;margin-top:7px;text-align:center;font-size:10px;font-weight:650;line-height:1.55;color:#969ba4">선택한 결제수단으로 결제돼</div><div id="unniProductAccessNote" style="display:none;margin-top:8px;text-align:center;font-size:10.5px;font-weight:650;line-height:1.6;color:#7d8490">한 번 결제하면 이 브라우저에서 추가 결제 없이 다시 볼 수 있어.</div></div>`;
    document.body.appendChild(root);
    root.querySelector("#unniProductClose").onclick = () => { root.style.display = "none"; document.body.style.overflow = ""; };
    root.addEventListener("click", (e) => { if (e.target === root) root.querySelector("#unniProductClose").click(); });
    return root;
  }

  function defaultBundle(data) {
    const current = data?.concernKey || "money";
    return Object.keys(CONCERNS).filter((k) => k !== current).slice(0,3);
  }

  function setupHtml(productId, data) {
    const isT = getMode(data) === "T";
    if (productId === "concern_bundle3") {
      const defaults = new Set(defaultBundle(data));
      const keys = Object.keys(CONCERNS).filter((k) => k !== data?.concernKey);
      return `
        <div style="font-size:12px;font-weight:900;margin-bottom:5px">${isT ? "추가로 볼 고민 3개를 골라줘" : "이번엔 더 마음에 걸리는 고민 3개만 골라줘"}</div>
        <div style="font-size:10.5px;line-height:1.6;color:#94a3b8;margin-bottom:10px">${isT ? "각 고민의 지금 상황도 하나씩 골라줘. 그 기준으로 정확히 나눠서 볼게." : "고른 고민마다 지금 상황도 하나씩 알려줘. 그래야 다른 경우 안 섞고 네 얘기로 같이 볼 수 있어."}</div>
        <div id="unniBundleChecks" style="display:grid;gap:8px">
          ${keys.map((k) => `
            <div data-bundle-row="${k}" style="padding:11px;border:1px solid #e2e8f0;border-radius:14px;background:#fff">
              <label style="display:flex;align-items:center;gap:7px;font-size:12px;font-weight:850;color:#334155">
                <input type="checkbox" value="${k}" ${defaults.has(k) ? "checked" : ""}> ${CONCERNS[k]}
              </label>
              <select data-bundle-situation="${k}" style="width:100%;margin-top:8px;padding:9px 10px;border:1px solid #cbd5e1;border-radius:10px;background:#f8fafc;font-size:11px;font-weight:750;color:#475569">
                ${situationSelectOptions(k, "")}
              </select>
            </div>`).join("")}
        </div>`;
    }
    if (productId === "all_in_one") {
      return `
        <div style="font-size:12px;font-weight:900;margin-bottom:5px">${isT ? "6가지 고민의 지금 상황을 맞춰줘" : "6가지 고민의 지금 상황만 하나씩 알려줘"}</div>
        <div style="font-size:10.5px;line-height:1.6;color:#94a3b8;margin-bottom:10px">${isT ? "각 고민을 네 상황에 맞게 보려면 이것만 맞춰주면 돼." : "각 고민을 네 상황에 맞게 보려면 이것만 골라주면 돼."}</div>
        <div id="unniAllInOneSituations" style="display:grid;gap:8px">
          ${Object.keys(CONCERNS).map((k) => {
            const selected = k === data?.concernKey ? data?.concernSituation || "" : "";
            return `<label style="display:grid;grid-template-columns:92px 1fr;align-items:center;gap:8px;padding:9px 10px;border:1px solid #e2e8f0;border-radius:13px;background:#fff"><span style="font-size:11px;font-weight:900;color:#334155">${CONCERNS[k]}</span><select data-all-situation="${k}" style="width:100%;min-width:0;padding:9px 10px;border:1px solid #cbd5e1;border-radius:10px;background:#f8fafc;font-size:10.5px;font-weight:750;color:#475569">${situationSelectOptions(k, selected)}</select></label>`;
          }).join("")}
        </div>`;
    }
    if (productId === "compatibility") {
      const branchOpts = [
        ["子","자시 · 23:30~01:29"],["丑","축시 · 01:30~03:29"],
        ["寅","인시 · 03:30~05:29"],["卯","묘시 · 05:30~07:29"],
        ["辰","진시 · 07:30~09:29"],["巳","사시 · 09:30~11:29"],
        ["午","오시 · 11:30~13:29"],["未","미시 · 13:30~15:29"],
        ["申","신시 · 15:30~17:29"],["酉","유시 · 17:30~19:29"],
        ["戌","술시 · 19:30~21:29"],["亥","해시 · 21:30~23:29"],
      ].map(([value,label]) => `<option value="${value}">${label}</option>`).join("");
      return `<div style="display:grid;gap:10px">
        <div style="font-size:11px;line-height:1.6;color:#64748b;padding:10px 11px;border-radius:12px;background:#f8fafc">${isT ? "궁합은 상대 사주가 필요해. 아는 정보부터 입력해줘." : "이번엔 상대 사주도 같이 놓고 볼게. 아는 만큼만 편하게 알려줘."}</div>
        <div><div style="font-size:11px;font-weight:900;color:#475569;margin:0 0 5px">상대 이름</div><input id="partnerName" placeholder="이름 또는 별명" style="width:100%;box-sizing:border-box;padding:12px;border:1px solid #e2e8f0;border-radius:12px"></div>
        <div><div style="font-size:11px;font-weight:900;color:#475569;margin:0 0 5px">상대 생년월일</div><input id="partnerBirth" inputmode="numeric" maxlength="8" placeholder="예: 1999년 2월 14일 → 19990214" style="width:100%;box-sizing:border-box;padding:12px;border:1px solid #e2e8f0;border-radius:12px"></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px"><select id="partnerGender" style="padding:12px;border:1px solid #e2e8f0;border-radius:12px"><option value="female">여성</option><option value="male">남성</option></select><select id="partnerCalendar" style="padding:12px;border:1px solid #e2e8f0;border-radius:12px"><option value="solar">양력</option><option value="lunar">음력</option></select></div>
        <div id="partnerLeapWrap" style="display:none;padding:10px 12px;border-radius:12px;background:#fff7ed;border:1px solid #fed7aa">
          <label style="display:flex;align-items:center;gap:7px;font-size:11px;font-weight:850;color:#9a3412;cursor:pointer"><input id="partnerLeapMonth" type="checkbox"> 윤달이에요</label>
        </div>
        <div style="padding:12px;border-radius:14px;background:#f8fafc;border:1px solid #e2e8f0">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:7px">
            <div style="font-size:11px;font-weight:900;color:#334155">상대가 태어난 시간</div>
            <label style="display:inline-flex;align-items:center;gap:6px;padding:5px 9px;border-radius:999px;background:#fff1f2;border:1px solid #fecdd3;font-size:9.5px;font-weight:850;color:#be123c;cursor:pointer"><input id="partnerTimeDirectToggle" type="checkbox"> 정확한 시간 직접 입력</label>
          </div>
          <div id="partnerTimeBranchWrap"><select id="partnerTimeBranch" style="width:100%;padding:10px 9px;border:1px solid #cbd5e1;border-radius:10px;background:white;font-size:11px;font-weight:750;color:#475569"><option value="">(시간 모름)</option>${branchOpts}</select></div>
          <div id="partnerTimeDirectWrap" style="display:none"><input id="partnerTimeInput" inputmode="numeric" maxlength="5" placeholder="예: 오후 1:30 → 1330" oninput="if(window.formatBirthTime)window.formatBirthTime(this)" style="width:100%;box-sizing:border-box;padding:10px 9px;border:1px solid #fecdd3;border-radius:10px;background:#fff7f8;font-size:11px;font-weight:750;color:#475569;text-align:center"></div>
        </div>
      </div>`;
    }
    return "";
  }

  function syncPartnerLeapUi(root) {
    const calendar = root?.querySelector("#partnerCalendar");
    const wrap = root?.querySelector("#partnerLeapWrap");
    const check = root?.querySelector("#partnerLeapMonth");
    if (!calendar || !wrap || !check) return;
    const isLunar = calendar.value === "lunar";
    wrap.style.display = isLunar ? "block" : "none";
    if (!isLunar) check.checked = false;
  }

  function bindProductSetup(productId, root) {
    if (productId !== "compatibility") return;
    const calendar = root?.querySelector("#partnerCalendar");
    if (!calendar) return;
    calendar.addEventListener("change", () => syncPartnerLeapUi(root));
    syncPartnerLeapUi(root);

    const directToggle = root.querySelector("#partnerTimeDirectToggle");
    const branchWrap = root.querySelector("#partnerTimeBranchWrap");
    const directWrap = root.querySelector("#partnerTimeDirectWrap");
    const branch = root.querySelector("#partnerTimeBranch");
    const input = root.querySelector("#partnerTimeInput");
    directToggle?.addEventListener("change", () => {
      const direct = !!directToggle.checked;
      if (direct) {
        if (branch) branch.value = "";
        if (branchWrap) branchWrap.style.display = "none";
        if (directWrap) directWrap.style.display = "block";
        input?.focus();
      } else {
        if (input) input.value = "";
        if (directWrap) directWrap.style.display = "none";
        if (branchWrap) branchWrap.style.display = "block";
      }
    });
  }

  function collectExtra(productId, data, root) {
    if (productId === "concern_bundle3") {
      const picked = [...root.querySelectorAll('#unniBundleChecks input:checked')].map((x) => x.value);
      if (picked.length !== 3)
        throw new Error(productVoice(data, {
          F: "더 보고 싶은 고민을 딱 3개만 골라줘. 그 세 개부터 같이 보자",
          T: "추가로 볼 고민을 정확히 3개 골라줘.",
        }));
      const situations = {};
      for (const key of picked) {
        const value = root.querySelector(`[data-bundle-situation="${key}"]`)?.value || "";
        if (!situationRows(key).some(([s]) => s === value)) {
          throw new Error(productVoice(data, {
            F: `${CONCERNS[key]}의 지금 상황도 하나 알려줘. 그래야 네 경우로 맞춰 볼 수 있어.`,
            T: `${CONCERNS[key]}의 지금 상황도 하나 골라줘.`,
          }));
        }
        situations[key] = value;
      }
      return { concerns: picked, situations };
    }
    if (productId === "all_in_one") {
      const situations = {};
      for (const key of Object.keys(CONCERNS)) {
        const value = root.querySelector(`[data-all-situation="${key}"]`)?.value || "";
        if (!situationRows(key).some(([s]) => s === value)) {
          throw new Error(productVoice(data, {
            F: `${CONCERNS[key]}의 지금 상황도 하나 알려줘.`,
            T: `${CONCERNS[key]}의 지금 상황을 골라줘.`,
          }));
        }
        situations[key] = value;
      }
      return { situations };
    }
    if (productId === "compatibility") {
      const b = root.querySelector("#partnerBirth")?.value.replace(/\D/g, "") || "";
      if (!/^\d{8}$/.test(b))
        throw new Error(productVoice(data, {
          F: "상대 생년월일을 8자리로 한 번만 확인해줘.",
          T: "상대 생년월일을 8자리로 입력해줘.",
        }));
      const directEnabled = !!root.querySelector("#partnerTimeDirectToggle")?.checked;
      let tRaw = "unknown";
      if (directEnabled) {
        const direct = root.querySelector("#partnerTimeInput")?.value || "";
        const clean = direct.replace(/\D/g, "");
        if (clean.length !== 4 || Number(clean.slice(0,2)) > 23 || Number(clean.slice(2)) > 59)
          throw new Error(productVoice(data, {
            F: "상대 시간을 직접 입력하려면 4자리로 적어줘. 예: 1330",
            T: "상대 직접 입력 시간은 4자리로 적어줘. 예: 1330",
          }));
        tRaw = `${clean.slice(0,2)}:${clean.slice(2)}`;
      } else {
        const branch = root.querySelector("#partnerTimeBranch")?.value || "";
        if (/^[子丑寅卯辰巳午未申酉戌亥]$/.test(branch)) tRaw = branch;
      }
      const calendar = root.querySelector("#partnerCalendar")?.value || "solar";
      const leap = calendar === "lunar" && !!root.querySelector("#partnerLeapMonth")?.checked;
      return { partner: { n: root.querySelector("#partnerName")?.value.trim() || "상대", b, t: tRaw, g: root.querySelector("#partnerGender")?.value || "female", c: calendar, l: leap } };
    }
    return {};
  }

  function grantStoreKey(data, productId) {
    let base = "";
    try { base = typeof getUserUniqueKey === "function" ? getUserUniqueKey(data) : JSON.stringify([data?.userBirthStr, data?.userTimeKey, data?.userGender]); }
    catch (_) { base = JSON.stringify([data?.userBirthStr, data?.userTimeKey]); }
    return "unni_product_grant_v1_" + productId + "_" + base;
  }

  function saveGrant(data, productId, grant) {
    try { localStorage.setItem(grantStoreKey(data, productId), JSON.stringify(grant)); } catch (_) {}
  }

  function readGrant(data, productId) {
    try { return JSON.parse(localStorage.getItem(grantStoreKey(data, productId)) || "null"); } catch (_) { return null; }
  }

  function showReport(productId, data, extra) {
    const root = ensureModal();
    const product = PRODUCTS[productId];
    applyProductModalVoice(root, data);
    root.querySelector("#unniProductBadge").textContent = productVoice(data, {
      F: "로아 언니랑 이어서 본 내용",
      T: "서아 언니랑 이어서 본 내용",
    });
    root.querySelector("#unniProductTitle").textContent = product.name;
    root.querySelector("#unniProductPrice").textContent = "";
    root.querySelector("#unniProductSetup").innerHTML = "";
    root.querySelector("#unniProductPayment").style.display = "none";
    const actionHint = root.querySelector("#unniProductActionHint");
    if (actionHint) actionHint.style.display = "none";
    const accessNote = root.querySelector("#unniProductAccessNote");
    if (accessNote) accessNote.style.display = "none";
    root.querySelector("#unniProductBody").innerHTML = productBody(productId, data, extra);

    const saveAll = root.querySelector("#unniProductSaveAll");
    const saveHint = root.querySelector("#unniProductSaveHint");
    if (saveAll) {
      saveAll.style.display = "block";
      saveAll.textContent = "사진으로 한 번에 저장하기";
      saveAll.onclick = () => saveFullPaidReport(root, productId);
    }
    if (saveHint) {
      saveHint.style.display = "block";
      saveHint.textContent = productVoice(data, {
        F: "읽는 동안 저장용 사진도 같이 준비해둘게.",
        T: "결과 읽는 동안 저장용 사진을 미리 준비해둘게.",
      });
    }

    const action = root.querySelector("#unniProductAction");
    action.textContent = "닫기";
    action.style.background = "#f3f0ec";
    action.style.color = "#536071";
    action.style.boxShadow = "none";
    action.onclick = () => root.querySelector("#unniProductClose").click();
    root.style.display = "block";
    root.scrollTop = 0;
    document.body.style.overflow = "hidden";

    // 사용자가 상담 기록을 읽는 동안 뒤에서 천천히 준비해 저장 버튼 대기를 줄인다.
    prewarmPaidExport(root, productId);
  }

  async function beginPaidCheckout(productId, data, extra, root, verifiedState) {
    applyProductModalVoice(root, data);
    if (typeof paymentAPI !== "function" || typeof resultSnapshot !== "function")
      throw new Error(productVoice(data, {
        F: "결제 준비가 잠깐 안 됐어. 지금 결과는 그대로니까 한 번만 다시 해보자.",
        T: "결제 준비 기능을 불러오지 못했어. 결과는 유지됐어. 다시 실행해줘.",
      }));
    const snap = { ...resultSnapshot(data), p:productId, x:extra };
    const entitlementTokens = entitlementTokenRecords();
    const order = await paymentAPI({ action:"prepare", data:snap, entitlementTokens });
    const product = PRODUCTS[productId];
    if (!order?.ok || order.productId !== productId || Number(order.baseAmount || product.price) !== product.price || !(Number(order.amount) > 0)) {
      throw new Error(productVoice(data, {
        F: "상품 주문 정보가 맞지 않아. 다시 결제하지 말고 현재 상품을 한 번만 다시 열어줘.",
        T: "상품 주문 정보가 일치하지 않아. 재결제하지 말고 상품을 다시 열어 확인해줘.",
      }));
    }
    const state = productStateFor(productId, verifiedState || cachedEntitlements(data));
    if (productId === "all_in_one" && state.kind === "upgrade" && Number(order.amount) !== Number(state.amount)) {
      // 화면에 표시한 가격과 서버 quote가 달라졌다면 서버 값을 우선하고 사용자가 다시 확인하게 한다.
      throw new Error(productVoice(data, {
        F: "구매 상태가 방금 바뀌었어. 다시 결제하지 말고 상품을 다시 열어서 최종 업그레이드 금액부터 확인해줘.",
        T: "구매 상태가 갱신됐어. 재결제하지 말고 상품을 다시 열어 최종 업그레이드 금액을 확인해줘.",
      }));
    }
    if (typeof PaymentWidget === "undefined")
      throw new Error(productVoice(data, {
        F: "결제창을 불러오지 못했어. 지금 내용은 그대로 있으니까 새로고침하고 다시 해보자.",
        T: "결제창을 불러오지 못했어. 새로고침한 뒤 다시 해줘.",
      }));
    root.querySelector("#unniProductPrice").textContent = productId === "all_in_one" && Number(order.amount) < product.price
      ? `${won(product.price)} → ${won(order.amount)}`
      : won(order.amount);
    root.querySelector("#unniProductPayment").style.display = "block";
    const paymentAmount = root.querySelector("#unniProductPaymentAmount");
    if (paymentAmount) paymentAmount.textContent = `최종 ${won(order.amount)}`;
    root.querySelector("#unniProductPaymentMethod").innerHTML = "";
    root.querySelector("#unniProductPaymentAgreement").innerHTML = "";
    const widget = PaymentWidget(TOSS_CLIENT_KEY, PaymentWidget.ANONYMOUS);
    widget.renderPaymentMethods("#unniProductPaymentMethod", { value:order.amount, currency:"KRW" }, { variantKey:"saju" });
    widget.renderAgreement("#unniProductPaymentAgreement");
    const action = root.querySelector("#unniProductAction");
    const finalState = productId === "all_in_one" && Number(order.amount) < product.price
      ? { kind:"upgrade", amount:Number(order.amount) }
      : { kind:"unpurchased", amount:Number(order.amount) };
    action.textContent = productActionLabel(productId,finalState,Number(order.amount));
    const actionHint = root.querySelector("#unniProductActionHint");
    if (actionHint) {
      actionHint.style.display = "block";
      actionHint.textContent = productVoice(data, {
        F: "고른 결제수단으로 결제할게.",
        T: "선택한 결제수단으로 결제돼.",
      });
    }
    action.onclick = async () => {
      action.disabled = true;
      try {
        const base = (location.hostname === "sajuft.com" || location.hostname === "www.sajuft.com" ? "https://sajuft.com" : location.origin) + location.pathname;
        const ticket = encodeURIComponent(order.ticket);
        await widget.requestPayment({
          orderId:order.orderId,
          orderName:product.name,
          customerName:data.name || data.userName || "구매자",
          successUrl:`${base}?payment=success&state=${ticket}`,
          failUrl:`${base}?payment=fail&state=${ticket}`,
        });
      } catch (e) {
        action.disabled = false;
        if (e?.code === "USER_CANCEL") {
          productToast(data, {
            F: "결제를 취소했어. 지금 보던 결과는 그대로 있어.",
            T: "결제를 취소했어. 현재 결과는 그대로 유지돼.",
          });
        } else if (typeof window.preparePaymentFailureRetry === "function") {
          window.preparePaymentFailureRetry(data, getMode(data));
        } else {
          productToast(data, {
            F: "결제창을 열지 못했어. 새로고침을 한 번 누른 뒤 다시 결제해줘.",
            T: "결제창을 열지 못했어. 새로고침 후 다시 결제해줘.",
          });
        }
      }
    };
  }

  async function openProduct(productId) {
    const data = getData();
    const product = PRODUCTS[productId];
    if (!data || !product) return;
    const root = ensureModal();
    const ux = productUx(productId);
    applyProductModalVoice(root, data);
    root.querySelector("#unniProductBadge").textContent = productVoice(data, {
      F: `로아 언니 · ${ux.eyebrow || product.badge}`,
      T: `서아 언니 · ${ux.eyebrow || product.badge}`,
    });
    root.querySelector("#unniProductTitle").textContent = product.name;
    root.querySelector("#unniProductPrice").textContent = won(product.price);
    root.querySelector("#unniProductSetup").innerHTML = setupHtml(productId, data);
    bindProductSetup(productId, root);
    root.querySelector("#unniProductPayment").style.display = "none";
    const saveAll = root.querySelector("#unniProductSaveAll");
    const saveHint = root.querySelector("#unniProductSaveHint");
    if (saveAll) { saveAll.style.display = "none"; saveAll.onclick = null; }
    if (saveHint) saveHint.style.display = "none";
    const valueCopy = productValueCopy(productId);
    const body = root.querySelector("#unniProductBody");
    const unlockRows = String(valueCopy?.unlocks || "").split("·").map((x)=>x.trim()).filter(Boolean);
    body.innerHTML = `<div data-product-voice-intro="1" style="margin-bottom:10px;font-size:11px;line-height:1.65;color:#64748b">${productVoice(data, {
      F: "아까 본 얘기랑 겹치는 건 빼고, 여기서는 새로 볼 것만 볼게",
      T: "앞에서 본 건 빼고, 여기서 새로 볼 것만 확인하자.",
    })}</div><div data-product-value-intro="${esc(productId)}" style="padding:10px 0 10px 11px;border-left:2px solid #dfb0bb"><div style="font-size:12.5px;font-weight:950;line-height:1.5;color:#8f334a">${esc(ux.value)}</div><p style="margin:5px 0 0;font-size:11.5px;line-height:1.65;color:#64748b">${esc(ux.difference)}</p></div>${unlockRows.length ? `<div style="margin-top:10px;padding:10px 0 0;border-top:1px solid #ebe5df"><div style="font-size:10.5px;font-weight:900;color:#59616c;margin-bottom:6px">여기서 새로 보게 되는 것</div><div style="display:grid;gap:4px">${unlockRows.map((row)=>`<div style="font-size:10.5px;line-height:1.55;font-weight:700;color:#707985">· ${esc(row)}</div>`).join("")}</div></div>` : ""}`;
    const isFreeLaunch = typeof FREE_LAUNCH_MODE !== "undefined" && FREE_LAUNCH_MODE;
    const accessNote = root.querySelector("#unniProductAccessNote");
    if (accessNote) accessNote.style.display = isFreeLaunch ? "none" : "block";
    const action = root.querySelector("#unniProductAction");
    action.style.background = "linear-gradient(90deg,#e94f72,#ed6a87)";
    action.style.color = "white";
    action.style.boxShadow = "0 9px 22px rgba(205,68,101,.15)";
    const actionHint = root.querySelector("#unniProductActionHint");
    if (actionHint) actionHint.style.display = "none";
    action.disabled = true;
    action.textContent = isFreeLaunch ? "무료 이벤트로 미리보기" : "구매 상태 확인 중…";
    root.style.display = "block";
    document.body.style.overflow = "hidden";

    const directStoredGrant = readGrant(data,productId);
    let directGrantVerified = false;
    if (directStoredGrant?.token && directStoredGrant?.userKey && typeof verifyAccessToken === "function") {
      try { directGrantVerified = (await verifyAccessToken(directStoredGrant.userKey,directStoredGrant.token)) === "valid"; }
      catch (_) { directGrantVerified = false; }
    }

    let verifiedState = isFreeLaunch
      ? { verifiedPurchases:[], effectiveEntitlements:[], allInOneQuote:null }
      : null;
    try {
      if (!isFreeLaunch) verifiedState = await resolveVerifiedEntitlements(data);
    } catch (error) {
      if (directGrantVerified) {
        verifiedState = { verifiedPurchases:[{ productId, userKey:directStoredGrant.userKey }], effectiveEntitlements:[productId], allInOneQuote:null };
      } else if (!isFreeLaunch) {
        action.disabled = false;
        action.textContent = "구매 내역 다시 확인";
        action.onclick = async () => {
          invalidateEntitlementCache();
          root.querySelector("#unniProductClose")?.click();
          await openProduct(productId);
        };
        body.insertAdjacentHTML("beforeend", `<div style="margin-top:10px;padding:10px 12px;border-radius:12px;background:#fff7ed;border:1px solid #fed7aa;font-size:11px;line-height:1.6;color:#9a3412">${productVoice(data, {
          F: "기존 구매 확인이 조금 늦어지고 있어. 구매 내역은 그대로 두고 확인 중이니까 걱정하지 않아도 돼. 중복 결제되지 않게 지금은 새 결제를 열지 않을게.",
          T: "구매 확인이 지연 중이야. 중복 결제 방지를 위해 새 결제는 열지 않을게.",
        })}</div>`);
        return;
      }
      verifiedState = { verifiedPurchases:[], effectiveEntitlements:[], allInOneQuote:null };
    }

    const state = directGrantVerified
      ? { kind:"purchased", productId, amount:0, label:productId === "full_saju" ? "구매한 전체판 다시 보기" : "구매한 상품 다시 보기" }
      : productStateFor(productId, verifiedState);
    const directGrant = directGrantVerified ? directStoredGrant : verifiedGrantFor(verifiedState, productId);
    action.disabled = false;

    if (state.kind === "purchased") {
      root.querySelector("#unniProductPrice").textContent = "구매 완료";
      action.textContent = productActionLabel(productId,state);
      if (productId === "all_in_one") {
        const savedSituations = directGrant?.extra?.situations || {};
        for (const key of Object.keys(CONCERNS)) {
          const select = root.querySelector(`[data-all-situation="${key}"]`);
          if (select && situationRows(key).some(([value]) => value === savedSituations[key])) select.value = savedSituations[key];
        }
        action.onclick = () => {
          try {
            const extra = collectExtra(productId,data,root);
            showReport(productId,data,extra);
          } catch (e) {
            productToast(data, e?.message || {
              F: "6개 고민의 지금 상황을 한 번씩만 확인해줘. 빠진 것부터 같이 채우면 돼.",
              T: "6개 고민의 지금 상황을 확인해줘. 빠진 항목을 채우면 돼.",
            });
          }
        };
      } else {
        action.onclick = () => {
          if (!directGrant) {
            productToast(data, {
              F: "구매 정보를 다시 불러오지 못했어. 다시 결제하지 말고 저장된 구매 내역부터 확인해보자.",
              T: "구매 정보를 다시 불러오지 못했어. 재결제하지 말고 저장된 구매 내역을 확인해줘.",
            });
            return;
          }
          showReport(productId,data,directGrant.extra || {});
        };
      }
      return;
    }

    if (state.kind === "included") {
      root.querySelector("#unniProductPrice").textContent = "완전판에 포함";
      action.textContent = productActionLabel(productId,state);
      action.onclick = () => {
        try {
          const extra = productId === "concern_bundle3" ? collectExtra(productId,data,root) : {};
          showReport(productId,data,extra);
        } catch (e) {
          productToast(data, e?.message || {
            F: "선택한 내용을 한 번만 확인해줘. 빠진 게 있으면 같이 채우면 돼.",
            T: "선택값을 확인해줘. 빠진 항목을 채우면 돼.",
          });
        }
      };
      return;
    }

    if (state.kind === "upgrade") {
      root.querySelector("#unniProductPrice").textContent = `${won(product.price)} → ${won(state.amount)}`;
      body.insertAdjacentHTML("beforeend", `<div data-upgrade-quote="all_in_one" style="margin-top:10px;padding:10px 12px;border-radius:12px;background:#fff1f2;border:1px solid #fecdd3;font-size:11px;line-height:1.65;color:#9f1239"><b>이미 산 1인 상품 금액을 빼고 계산했어.</b><br>${esc((state.quote?.creditedProducts || []).map((id)=>PRODUCTS[id]?.name || id).join(" + "))} 구매가 서버에서 확인돼서 <b>${won(state.amount)}</b>만 결제하면 완전판으로 올라가.</div>`);
      action.textContent = productActionLabel(productId,state);
      action.onclick = async () => {
        action.disabled = true;
        try {
          const extra = collectExtra(productId,data,root);
          if (isFreeLaunch) return showReport(productId,data,extra);
          await beginPaidCheckout(productId,data,extra,root,verifiedState);
        } catch (e) {
          productToast(data, e?.message || {
            F: "업그레이드를 열지 못했어. 지금 구매 내역은 그대로니까 한 번만 다시 해보자.",
            T: "업그레이드를 열지 못했어. 구매 내역은 유지됐어. 다시 실행해줘.",
          });
        } finally { action.disabled = false; }
      };
      return;
    }

    action.textContent = isFreeLaunch ? "무료 이벤트로 미리보기" : productActionLabel(productId,state);
    action.onclick = async () => {
      action.disabled = true;
      try {
        const extra = collectExtra(productId,data,root);
        if (isFreeLaunch) return showReport(productId,data,extra);
        await beginPaidCheckout(productId,data,extra,root,verifiedState);
      } catch (e) {
        productToast(data, e?.message || {
          F: "상품을 열지 못했어. 지금 결과는 그대로니까 한 번만 다시 눌러줘.",
          T: "상품을 열지 못했어. 현재 결과는 유지됐어. 다시 눌러줘.",
        });
      } finally { action.disabled = false; }
    };
  }

  function recommendedProductId(data, entitlementState = null) {
    const api = entitlementApi();
    const direct = api?.verifiedProductIds?.(entitlementState) || [];
    const has = (id) => direct.includes(id);
    const explicitIntent = data?.premiumIntent || "";
    const concern = data?.concernKey || "money";
    const situation = data?.concernSituation || "";
    const relationshipIntent = explicitIntent === "relationship-person" || (concern === "love" && ["crush","relationship","breakup"].includes(situation));

    if (has("all_in_one")) return "compatibility";
    if (relationshipIntent && !has("compatibility")) return "compatibility";
    if (has("full_saju") && has("concern_bundle3")) return "all_in_one";
    if (has("full_saju")) return "all_in_one";
    if (has("concern_bundle3")) {
      if (explicitIntent === "everything") return "all_in_one";
      return "full_saju";
    }

    if (explicitIntent === "everything") return "all_in_one";
    if (explicitIntent === "other-concerns") return "concern_bundle3";
    if (relationshipIntent && !has("compatibility")) return "compatibility";
    return "full_saju";
  }

  const PRODUCT_UX = {
    concern_bundle3: {
      eyebrow:"다른 고민 3개 확장",
      value:"다른 고민 3개를 각각 NOTE 깊이로",
      difference:"방금 본 고민은 빼고, 새로 고른 3개 고민을 각각 따로 풀어.",
      cta:"고민 3개 더 깊게 보기",
    },
    full_saju: {
      eyebrow:"내 사주 전체판",
      value:"나 전체 구조 · 영역 연결 · 5년 흐름",
      difference:"방금 본 고민 하나를 반복하지 않고, 돈·일·연애·관계가 왜 같이 움직이는지 한 판으로 연결해.",
      cta:"내 전체 사주판 보기",
    },
    compatibility: {
      eyebrow:"두 사람 사주 교차",
      value:"상대 사주까지 겹쳐야 나오는 둘 사이 계산",
      difference:"내 사주를 더 길게 보는 게 아니라, 상대 사주를 실제로 겹쳐 둘 사이를 계산해.",
      cta:"우리 둘 궁합 보기",
    },
    all_in_one: {
      eyebrow:"나 한 사람 전체판",
      value:"전체 사주판 + 6개 고민 + 종합 연결",
      difference:"전체 사주판과 6개 고민을 따로 보지 않고, 나 한 사람의 흐름으로 한 번에 연결해.",
      cta:"내 사주 완전판 보기",
    },
  };

  function productUx(productId) {
    return PRODUCT_UX[productId] || { eyebrow:PRODUCTS[productId]?.badge || "", value:PRODUCTS[productId]?.desc || "", difference:PRODUCTS[productId]?.desc || "", cta:PRODUCTS[productId]?.name || "상품 보기" };
  }

  function productActionLabel(productId, state, amountOverride) {
    const ux = productUx(productId);
    const amount = Number(amountOverride ?? state?.amount ?? PRODUCTS[productId]?.price ?? 0);
    if (state?.kind === "purchased") {
      return productId === "full_saju" ? "구매한 전체판 다시 보기" : productId === "all_in_one" ? "구매한 완전판 다시 보기" : "구매한 상품 다시 보기";
    }
    if (state?.kind === "included") return "완전판에 포함됨 · 바로 보기";
    if (state?.kind === "upgrade") return `완전판으로 이어보기 · +${won(amount)}`;
    return `${ux.cta} · ${won(amount)}`;
  }

  function productShort(productId) {
    return productValueCopy(productId)?.short || PRODUCTS[productId]?.desc || "";
  }

  function recommendationReason(productId, data, isT, entitlementState) {
    const direct = entitlementApi()?.verifiedProductIds?.(entitlementState) || [];
    const situation = situationLabel(data?.concernKey, data?.concernSituation);
    if (productId === "compatibility") {
      return direct.includes("all_in_one")
        ? "나 한 사람에 대한 건 완전판에 이미 들어 있어. 여기서 새로 열 수 있는 건 특정 상대와 둘 사이 계산이야."
        : isT
          ? "지금 질문에는 네 사주만 더 보는 것보다 상대 사주까지 겹쳐야 새로 알 수 있는 정보가 많아."
          : `${situation ? "방금 말한 ‘" + situation + "’라면 " : ""}상대 사주까지 같이 놓고 둘 사이 이유를 보는 게 완전히 다른 답을 줄 수 있어.`;
    }
    if (productId === "full_saju") {
      return direct.includes("concern_bundle3")
        ? "다른 고민 3개는 이미 깊게 봤으니까, 이제 새로 볼 건 네 전체 구조와 5년 흐름이야."
        : isT
          ? "기본 NOTE에서 가까운 시기는 충분히 봤어. 다음엔 5년 전체 흐름과 여러 영역이 같이 바뀌는 이유를 보면 돼."
          : "지금 고민 하나의 가까운 시기는 이미 충분히 봤으니까, 다음에는 네 인생 전체 구조와 5년 큰 흐름을 이어서 보는 게 새 정보가 제일 많아.";
    }
    if (productId === "concern_bundle3") {
      return isT
        ? "지금 고민은 여기서 닫고, 다른 고민 3개에 같은 사주 구조가 어떻게 다르게 나타나는지 보는 게 중복이 적어."
        : "지금 고민 하나는 충분히 풀었으니까, 아직 마음에 남은 다른 고민 3개를 같은 깊이로 보는 게 새 정보가 많아.";
    }
    const quote = entitlementApi()?.calculateUpgradeQuote?.({ targetProduct:"all_in_one", verifiedEntitlements:direct });
    if (quote?.creditAmount > 0) {
      return `이미 산 1인 상품 ${quote.creditedProducts.map((id)=>PRODUCTS[id]?.name || id).join(" + ")} 금액을 인정해서, 중복 결제 없이 완전판으로 합칠 수 있어.`;
    }
    return isT
      ? "한 사람 기준으로 전체 구조·6개 고민·5년 흐름을 따로 열기 싫다면 한 번에 묶는 구성이 맞아."
      : "내 전체 사주판도 보고 6가지 고민도 하나씩 다 풀고 싶다면, 나 한 사람에 대한 내용을 한 번에 여는 쪽이 제일 편해.";
  }

  function productButtonHtml(p, { recommended = false, secondary = false, reason = "", state = null } = {}) {
    const resolvedState = state || { kind:"unpurchased", amount:p.price, label:`${won(p.price)}에 열기` };
    const ux = productUx(p.id);
    const border = recommended ? "#e8d7dc" : "#ebe5df";
    const bg = recommended ? "#fffaf9" : "transparent";
    const pad = recommended ? "14px 12px" : "12px 2px";
    const priceLabel = resolvedState.kind === "purchased" ? "구매 완료"
      : resolvedState.kind === "included" ? "완전판 포함"
        : resolvedState.kind === "upgrade" ? `+${won(resolvedState.amount)}`
          : won(p.price);
    const stateCopy = resolvedState.kind === "purchased"
      ? "구매한 내용 다시 이어보기"
      : resolvedState.kind === "included" ? "완전판에 포함 · 바로 이어보기"
        : resolvedState.kind === "upgrade" ? `완전판으로 이어보기 · +${won(resolvedState.amount)}`
          : "이어서 보기 →";
    const topLabel = ux.eyebrow;
    const description = productShort(p.id);
    const stateColor = ["purchased","included"].includes(resolvedState.kind) ? "#047857" : resolvedState.kind === "upgrade" ? "#b83e5c" : "#657080";
    const stateBg = ["purchased","included"].includes(resolvedState.kind) ? "#ecfdf5" : resolvedState.kind === "upgrade" ? "#fff2f5" : "#f7f5f2";
    const reasonLine = recommended && reason
      ? `<div data-recommendation-reason="1" style="font-size:10.8px;line-height:1.55;font-weight:600;color:#7a7175;margin:0 0 8px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${reason}</div>`
      : "";
    const labelLine = secondary
      ? `<div style="font-size:9.5px;font-weight:760;color:#969ba4;margin-bottom:4px">${topLabel}</div>`
      : "";
    const detailLine = recommended
      ? `<div style="margin-top:7px;font-size:11.5px;line-height:1.55;font-weight:650;color:#48515f">${ux.value}</div>`
      : `<div style="font-size:11px;line-height:1.6;color:#76808d;margin-top:5px">${description}</div>`;
    return `<button data-unni-product="${p.id}" data-product-state="${resolvedState.kind}" ${secondary ? 'data-secondary-product="1"' : ""} style="text-align:left;width:100%;padding:${pad};border:${recommended ? `1px solid ${border}` : "0"};border-top:${recommended ? "none" : `1px solid ${border}`};border-radius:${recommended ? "16px" : "0"};background:${bg};cursor:pointer;box-shadow:none">${reasonLine}<div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start"><div style="min-width:0">${labelLine}<div style="font-size:${recommended ? "15px" : "14px"};line-height:1.35;font-weight:820;letter-spacing:-.02em;color:#172033">${p.name}</div></div><div style="flex:none;padding:2px 0;font-size:11px;font-weight:800;color:${recommended ? "#b83e5c" : "#66707d"};white-space:nowrap">${priceLabel}</div></div>${detailLine}<div style="display:inline-flex;margin-top:7px;font-size:10px;font-weight:760;color:${stateColor}">${stateCopy}</div></button>`;
  }

  function foldedProductGroups(products, states) {
    const order = ["full_saju","concern_bundle3","all_in_one"];
    const single = products.filter((p) => p.id !== "compatibility").sort((a,b) => order.indexOf(a.id) - order.indexOf(b.id));
    const pair = products.filter((p) => p.id === "compatibility");
    const block = (title, rows) => rows.length
      ? `<div data-product-group="${title === "나를 더 보기" ? "single" : "pair"}"><div style="font-size:10px;font-weight:760;color:#969ba4;margin:5px 2px 8px">${title}</div><div style="display:grid;gap:9px">${rows.map((p)=>productButtonHtml(p,{secondary:true,state:states[p.id]})).join("")}</div></div>`
      : "";
    return block("나를 더 보기",single) + block("둘 사이 보기",pair);
  }

  function renderCatalog() {
    const data = getData();
    const slot = document.getElementById("postConsultationProductsSlot");
    const existing = document.getElementById("unniProductLadder");
    const unlocked = typeof isUnlocked === "undefined" ? true : !!isUnlocked;
    if (!data || !slot) {
      existing?.remove();
      return;
    }
    if (!unlocked) {
      existing?.remove();
      return;
    }
    if (existing) return;

    const isFreeLaunch = typeof FREE_LAUNCH_MODE !== "undefined" && FREE_LAUNCH_MODE;
    const state = isFreeLaunch ? { verifiedPurchases:[], effectiveEntitlements:[], allInOneQuote:null } : cachedEntitlements(data);
    if (!isFreeLaunch && !state) {
      if (!entitlementPromise) {
        resolveVerifiedEntitlements(data).then(() => {
          document.getElementById("unniProductLadder")?.remove();
          renderCatalog();
        }).catch(() => {
          const pending = document.getElementById("unniProductLadder");
          pending?.querySelector("[data-entitlement-status]")?.replaceChildren(
            document.createTextNode(productVoice(data, {
              F: "구매 내역 확인이 조금 늦네. 언니가 한 번만 더 확인해볼게.",
              T: "구매 내역 확인이 늦어지고 있어. 한 번 더 확인할게.",
            })),
          );
          setTimeout(async () => {
            try {
              await resolveVerifiedEntitlements(data, { force:true });
              document.getElementById("unniProductLadder")?.remove();
              renderCatalog();
            } catch (_) {
              const stillPending = document.getElementById("unniProductLadder");
              stillPending?.querySelector("[data-entitlement-status]")?.replaceChildren(
                document.createTextNode(productVoice(data, {
                  F: "기존 구매 확인이 조금 늦어지고 있어. 구매 내역은 그대로 두고 확인 중이니까 걱정하지 않아도 돼. 중복 결제되지 않게 지금은 새 결제를 열지 않을게.",
                  T: "구매 확인이 지연 중이야. 중복 결제 방지를 위해 새 결제는 열지 않을게.",
                })),
              );
            }
          }, 1200);
        });
      }
      const wrap = document.createElement("section");
      wrap.id = "unniProductLadder";
      wrap.style.cssText = "margin-top:20px;padding:15px 2px 0;border-top:1px solid #e8e1db;background:transparent";
      wrap.innerHTML = `<div data-entitlement-status style="font-size:11.5px;line-height:1.6;color:#64748b">${productVoice(data, {
        F: "구매 내역 확인하고 있어. 잠깐만",
        T: "구매 내역 확인 중…",
      })}</div>`;
      slot.replaceChildren(wrap);
      return;
    }

    const direct = entitlementApi()?.verifiedProductIds?.(state) || [];
    const allOwned = direct.includes("all_in_one");
    const visibleProducts = allOwned ? [PRODUCTS.compatibility] : Object.values(PRODUCTS);
    const states = Object.fromEntries(visibleProducts.map((p)=>[p.id,productStateFor(p.id,state)]));
    const isT = data?.currentMode === "T";
    let recommendedId = recommendedProductId(data,state);
    if (!visibleProducts.some((p)=>p.id === recommendedId)) recommendedId = visibleProducts[0]?.id;
    const recommended = PRODUCTS[recommendedId] || visibleProducts[0];
    if (!recommended) return;
    const others = visibleProducts.filter((p) => p.id !== recommended.id);
    const reason = recommendationReason(recommended.id,data,isT,state);

    const wrap = document.createElement("section");
    wrap.id = "unniProductLadder";
    wrap.dataset.verifiedPremium = isFreeLaunch ? "free-launch" : "server";
    wrap.style.cssText = "margin-top:20px;padding:16px 2px 0;border-top:1px solid #e8e1db;background:transparent;box-shadow:none";
    const eyebrow = allOwned
      ? (isT ? "나에 대한 정리는 이미 전부 열려 있어" : "너에 대한 건 이미 전부 열어뒀어")
      : (isT ? "더 볼 거면, 다음 정보는 여기야" : "더 궁금한 게 남았다면");
    const headline = allOwned
      ? "이제 둘 사이를 따로 볼 수 있어"
      : (isT ? "다음으로 볼 거면 이게 가장 연결돼" : "지금 얘기 다음으로는 이게 제일 자연스러워");
    const sub = allOwned
      ? "완전판에 포함된 1인 내용은 다시 권하지 않을게. 궁합만 상대 사주가 필요한 별도 계산이야."
      : (isT
          ? "방금 본 내용과 겹치지 않게, 새로 볼 정보가 많은 걸 먼저 뒀어."
          : "아까 본 얘기는 빼고, 여기서 새로 볼 게 많은 걸 먼저 뒀어.");
    const otherHtml = others.length
      ? `<div id="unniOtherProducts" style="display:grid;gap:14px;margin-top:10px">${foldedProductGroups(others,states)}</div>`
      : "";
    wrap.innerHTML = `<div style="display:grid;gap:0">${productButtonHtml(recommended,{recommended:true,reason,state:states[recommended.id]})}${otherHtml}</div>`;
    slot.replaceChildren(wrap);

    wrap.querySelectorAll("[data-unni-product]").forEach((btn)=>btn.addEventListener("click",()=>openProduct(btn.dataset.unniProduct)));
  }

  global.handleUnniProductPaymentReturn = async function (params, resume, restored, ticket) {
    const productId = resume?.productId;
    const product = PRODUCTS[productId];
    if (!product) return false;
    if (params.get("payment") === "fail") {
      if (typeof window.preparePaymentFailureRetry === "function") {
        window.preparePaymentFailureRetry(restored, getMode(restored));
      } else {
        productToast(restored, {
          F: "결제가 완료되지 않았어. 새로고침을 한 번 누른 뒤 다시 결제해줘.",
          T: "결제가 완료되지 않았어. 새로고침 후 다시 결제해줘.",
        });
      }
      return true;
    }
    if (params.get("payment") !== "success") return true;
    const paymentKey = params.get("paymentKey"), orderId = params.get("orderId"), amount = Number(params.get("amount"));
    if (!paymentKey || orderId !== resume.orderId || amount !== Number(resume.amount))
      throw new Error(productVoice(restored, {
        F: "상품 결제 복귀 정보가 맞지 않아. 다시 결제하지 말고 주문번호로 문의해줘.",
        T: "상품 결제 복귀 정보가 일치하지 않아. 재결제하지 말고 주문번호로 문의해줘.",
      }));
    const token = await confirmPaymentOnServer(paymentKey, orderId, amount, resume.userKey, ticket);
    saveGrant(restored, productId, {
      userKey:resume.userKey,
      token,
      extra:resume.data?.x || {},
      orderId,
      amount:Number(resume.amount),
      baseAmount:Number(resume.baseAmount || product.price),
      quote:resume.quote || null,
    });
    invalidateEntitlementCache();
    try { sessionStorage.removeItem("unni_pending_approval"); } catch (_) {}
    showReport(productId, restored, resume.data?.x || {});
    productToast(restored, {
      F: "응, 확인됐어. 그럼 여기서 계속 보자",
      T: "확인됐어. 바로 이어서 보자.",
    });
    return true;
  };

  global.openUnniProduct = openProduct;
  global.renderUnniProductCatalog = renderCatalog;
  global.__UNNI_PRODUCTS_V1__ = {
    version:"2.1.0",
    products:PRODUCTS,
    contracts:global.__UNNI_PRODUCT_CONTENT_POLICY_V1__?.contracts || {},
    buildProductBody:productBody,
    buildFullSajuSections:fullSajuSections,
    recommendedProductId,
    resolveVerifiedEntitlements,
    productStateFor,
    collectStoredPremiumGrants,
    invalidateEntitlementCache,
  };

  const observer = new MutationObserver(() => renderCatalog());
  if (document.documentElement) observer.observe(document.documentElement, { childList: true, subtree: true });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", renderCatalog);
  else setTimeout(renderCatalog, 0);
})(globalThis);
