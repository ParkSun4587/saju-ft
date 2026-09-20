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
    return `<p data-content-blocked="${blockedKind}" data-policy-blocked="1" data-product-contract="${esc(productId)}" data-policy-errors="${esc(reason)}" style="font-size:13px;line-height:1.8;color:#475569">이 상품에서 허용되지 않은 정보 요청이 감지돼서 결과를 열지 않았어.</p>`;
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
    const pressure = r.ditian?.findings?.find(x=>x.id==="DTS_PRESSURE_109");
    const flow = r.ditian?.findings?.find(x=>x.id==="DTS_FLOW_108");
    const root = r.ditian?.findings?.find(x=>x.id==="DTS_ROOT_104");
    const season = r.ditian?.findings?.find(x=>x.id==="DTS_SEASON_102");
    const party = r.ditian?.findings?.find(x=>x.id==="DTS_PARTY_105");
    const bridge = r.ditian?.findings?.find(x=>x.id==="DTS_BRIDGE_112");
    const z = reasoningMainZiping(r);
    const prescription = r.integrated?.prescription || {};
    const disclosedTiming = policyTiming("full_saju", r.timing);
    const timeline = disclosedTiming.fullSajuTimeline || {};
    const years = Array.isArray(timeline.years) ? timeline.years : [];
    const nearHighlights = Array.isArray(timeline.nearHighlights) ? timeline.nearHighlights : [];
    const daeunPeriods = Array.isArray(timeline.daeunPeriods) ? timeline.daeunPeriods : [];

    function forceCopy() {
      const verdict = strength.verdict || "중화";
      const ratio = Number(strength.supportRatio);
      if (verdict === "신약") return isT
        ? "받치는 힘보다 밖으로 빠지거나 눌리는 힘이 더 커서, 무조건 버티는 방식보다 먼저 기반과 연결을 만들어야 해."
        : "너는 못 버티는 사람이 아니라, 처음부터 네 힘보다 바깥 압력이 더 크게 들어오는 쪽이야. 그래서 더 세게 참는 것보다 먼저 받쳐주는 힘과 연결을 만들어야 편해져.";
      if (verdict === "신강") return isT
        ? "스스로 버티고 밀어붙일 힘이 충분한 편이라, 더 채우기보다 어디로 빼고 정리할지가 중요해."
        : "기본 힘이 약한 편은 아니야. 그래서 더 많이 쥐는 것보다, 가진 힘을 어디에 쓰고 어디서 덜어낼지가 훨씬 중요해.";
      return isT
        ? "받치는 힘과 소모되는 힘이 한쪽으로 극단적이지 않아, 강약 하나보다 흐름이 막히는 지점을 보는 게 중요해."
        : "한쪽으로 너무 치우친 편은 아니라서, ‘강하다/약하다’ 한마디보다 네 힘이 어디서 막히고 어디서 잘 이어지는지를 보는 게 더 정확해.";
    }

    function rootCopy() {
      const q = root?.facts?.quality || strength.deukji?.quality || "rootless";
      const seasonOn = !!(season?.facts?.active ?? strength.deukryeong?.active);
      const partyOn = !!(party?.facts?.active ?? strength.deukse?.active);
      const qCopy = q === "month-rooted"
        ? "태어난 계절 자리에도 직접 뿌리가 있어"
        : q === "day-rooted"
          ? "가까운 생활 자리에서 직접 뿌리가 확인돼"
          : q === "other-rooted"
            ? "바깥 자리에는 뿌리가 있지만 중심 자리보다 간접적이야"
            : "직접 기대는 뿌리가 선명하지 않아";
      const seasonCopy = seasonOn ? "계절의 지원도 받는 편" : "계절 자체가 바로 받쳐주는 쪽은 아니고";
      const partyCopy = partyOn ? "다른 자리의 도움도 같이 붙어" : "다른 자리의 도움까지 크게 우세한 편은 아니야";
      return `${qCopy}. ${seasonCopy}, ${partyCopy}.`;
    }

    function structureCopy() {
      if (!z) return "태어난 계절의 중심은 잡히지만, 그 구조가 잘 굴러가는 조건은 한쪽으로 단정하지 않았어.";
      if (z.sequenceStatus?.includes("구응")) return "중심 구조를 흔드는 조건이 있어도 다시 받아주는 길이 함께 잡혀 있어. 무너짐 자체보다 ‘어떻게 다시 살리느냐’가 중요한 구조야.";
      if (z.sequenceStatus === "파격" || z.state === "damaged") return "중심 구조를 흔드는 조건이 실제로 보여. 그래서 좋은 힘을 더 넣기보다 먼저 깨지는 지점을 막는 순서가 중요해.";
      if (z.sequenceStatus === "성중유패") return "기본 구조는 서지만, 그 안에 다시 흔드는 조건이 섞여 있어. 잘될 때일수록 방해 신호를 같이 보는 게 중요해.";
      if (z.sequenceStatus === "성격" || z.state === "supported") return "중심 구조를 살리는 연결이 비교적 곧게 잡혀 있어. 맞는 조건에 들어가면 장점이 결과로 이어지기 쉬운 편이야.";
      return "중심 구조는 보이지만 살리는 힘과 흔드는 힘의 우선순위를 한쪽으로 과장하지 않는 게 맞아.";
    }

    function flowCopy() {
      const blocked = flow?.facts?.blockedAt;
      if (blocked?.to) {
        const bridgeName = ELEMENT_WORD[blocked.to] || blocked.to;
        return `가장 강한 힘에서 다음 단계로 넘어갈 때 <b>${bridgeName}</b> 쪽 연결이 비어 있어. 그래서 잘하는 걸 더 세게 하는 것만으로는 풀리지 않고, 그 다음 단계로 넘기는 행동이 필요해.`;
      }
      return "강한 힘이 다음 단계로 이어질 길이 원래 사주 안에 어느 정도 있어. 문제는 힘의 부족보다 그 흐름을 끊지 않고 현실 결과까지 연결하는 거야.";
    }

    function prescriptionCopy() {
      const seq = prescription.sequence || [];
      const actions = seq.map(x=>ELEMENT_WORD[x.element]).filter(Boolean);
      if (actions.length >= 2) return `전체판에서 반복되는 순서는 <b>${actions[0]}</b>을 먼저 만들고, 그다음 <b>${actions[1]}</b>으로 넘기는 쪽이야.`;
      if (actions.length === 1) return `전체판에서 가장 먼저 챙길 건 <b>${actions[0]}</b>이야.`;
      return "한 가지 보완법을 억지로 정하지 않고, 실제로 막히는 지점을 먼저 확인한 뒤 다음 행동을 붙이는 게 맞아.";
    }

    function signalWhy(row, positive) {
      const rows = positive ? row?.supportSignals : row?.cautionSignals;
      const sig = (rows||[]).find(x=>x.severity==="major") || (rows||[])[0];
      if (!sig) return positive ? "도움 조건" : "주의 조건";
      const code = sig.code || "";
      if (/rescue|generate/.test(code)) return "기반과 회복을 보태는 조건";
      if (/assist|root-add/.test(code)) return "버티는 힘을 보태는 조건";
      if (/bridge|flow-unblock/.test(code)) return "막힌 연결을 이어주는 조건";
      if (/discharge/.test(code)) return "쌓인 힘을 밖으로 빼는 조건";
      if (/control/.test(code)) return "힘을 역할과 기준으로 정리하는 조건";
      if (/ziping-support/.test(code)) return "중심 구조를 살리는 조건";
      if (/root-clash/.test(code)) return "기반을 흔드는 조건";
      if (/body-cost/.test(code)) return "부담을 키우는 조건";
      if (/ziping-harm/.test(code)) return "중심 흐름을 흔드는 조건";
      return positive ? "도움 조건" : "주의 조건";
    }

    function nearTimelineCopy() {
      const rows = nearHighlights.slice(0,3);
      if (!rows.length) return "가까운 18개월에서는 특정 달 하나를 억지로 고르기보다 준비 상태를 보면서 움직이는 편이 맞아.";
      return rows.map(row=>{
        const when = row.startMonth ? `${row.startMonth}월 ${row.startDay ? row.startDay+"일 무렵" : ""}` : (row.startYmd||"가까운 시기");
        if (row.class==="supportive"||row.class==="mild-support") return `<b>${when}</b> — ${signalWhy(row,true)}이 잡혀 있어 움직임을 시험해보기 좋은 구간.`;
        if (row.class==="caution"||row.class==="mild-caution") return `<b>${when}</b> — ${signalWhy(row,false)}이 잡혀 있어 확장보다 정리·확인이 먼저인 구간.`;
        return `<b>${when}</b> — 도움과 주의가 같이 보여 한 번에 크게 움직이기보다 조건을 나눠 보는 구간.`;
      }).join("<br><br>");
    }

    function yearTimelineCopy() {
      if (!years.length) return "5년 흐름 데이터가 충분하지 않아 연도별 이야기를 억지로 만들지 않았어.";
      const currentYear = Number(String(r.timing?.today || "").slice(0,4)) || 0;
      const annualRows = years.filter(y => y.year > currentYear).slice(0,5);
      return annualRows.map(y=>{
        if (y.class==="supportive") return `<b>${y.year}년</b> — 중요한 도움 조건이 분명한 해. 준비한 걸 실제 선택으로 옮기기 좋음.`;
        if (y.class==="mild-support") return `<b>${y.year}년</b> — 보조 도움 조건이 있는 해. 크게 벌리기보다 검증한 선택을 이어가기 좋음.`;
        if (y.class==="caution") return `<b>${y.year}년</b> — 중요한 주의 조건이 분명한 해. 확장보다 손실·과부하 관리가 먼저.`;
        if (y.class==="mild-caution") return `<b>${y.year}년</b> — 조정이 필요한 해. 같은 속도를 고집하지 말고 조건을 바꾸는 게 유리.`;
        if (y.class==="mixed") return `<b>${y.year}년</b> — 도움과 부담이 같이 오는 해. 잘되는 영역과 무리되는 영역을 분리해야 함.`;
        return `<b>${y.year}년</b> — 한쪽으로 강하게 기울지 않는 해. 앞에서 만든 기반을 이어가기 좋음.`;
      }).join("<br><br>");
    }

    function daeunCopy() {
      if (!daeunPeriods.length) return "10년 단위 큰 흐름을 읽을 자료가 충분하지 않아 전환점을 만들지 않았어.";
      const current = daeunPeriods[0];
      const next = daeunPeriods[1];
      const currentGod = TEN_GOD_WORD[current.god] || "현재 삶의 과제를 밀어주는 힘";
      const nextText = next
        ? ` 그리고 <b>${next.startYear}년 무렵</b>부터 계산 범위 안에서 큰 흐름의 결이 바뀌어, ${TEN_GOD_WORD[next.god] || "다른 방식의 힘"}이 더 앞에 나와.`
        : " 계산 범위 안에서는 다음 큰 흐름 전환이 아직 뚜렷하게 들어오지 않아.";
      return `지금 큰 흐름에서는 <b>${currentGod}</b>이 반복해서 개입해.${nextText}`;
    }

    const pressureHuman = r.integrated?.pressureHuman || "여러 조건이 한꺼번에 들어오는 압박";
    const mismatch = !!p.elements?.rawVsInfluenceMismatch;
    const mismatchCopy = mismatch
      ? "겉 글자 수와 실제 힘의 순위가 달라서 단순 오행 개수만 보고 판단하면 핵심을 놓칠 수 있어."
      : "겉 글자 수와 실제 힘의 방향이 크게 어긋나지 않지만, 계절·뿌리·위치까지 봐야 실제 세기가 정리돼.";

    return [
      {
        title: "01 · 내 사주 전체 한 줄 요약",
        body: isT
          ? `네 전체판의 핵심은 <b>${dom}</b>${second ? `, 보조로 ${second}` : ""}. ${forceCopy()} 지금 고민 하나가 아니라 네 선택 전반에 반복되는 기본 구조부터 잡는 게 이 상품의 시작이야.`
          : `언니가 네 사주 전체를 한 문장으로 잡으면 <b>${dom}</b>${second ? `, 그리고 그 안의 ${second}` : ""}이 먼저 보여. ${forceCopy()} 이건 지금 고민 하나를 길게 늘인 게 아니라, 여러 고민 밑에 깔린 같은 원판을 보는 거야.`
      },
      {
        title: "02 · 태어난 계절·뿌리·버티는 힘",
        body: `${rootCopy()}<br><br>${mismatchCopy} 그래서 같은 ‘약함’이나 ‘강함’ 안에서도 실제 버티는 방식이 사람마다 달라져.`
      },
      {
        title: "03 · 실제 기세는 어디로 흐르는가",
        body: `네 사주에서 가장 자연스럽게 커지는 쪽은 <b>${strong}</b>이고, 의식적으로 챙겨야 하는 쪽은 <b>${weak}</b>이야.<br><br>${flowCopy()}`
      },
      {
        title: "04 · 중심 구조가 잘 굴러갈 때와 깨질 때",
        body: `${structureCopy()}<br><br>지금 가장 크게 걸리는 쪽은 <b>${pressureHuman}</b>이야. ${bridge?.facts?.status==="missing" ? "서로 부딪히는 힘 사이에 필요한 연결이 비어 있는 구간도 있어서, 바로 정면승부하기보다 중간 단계를 만드는 게 중요해." : "중간 연결 후보가 이미 있어서 그 힘을 실제 행동으로 이어주는 방식이 중요해."}`
      },
      {
        title: "05 · 돈·성과·보상이 연결되는 방식",
        body: `돈에서는 ‘얼마나 욕심이 많은가’보다 네 힘이 현실 결과까지 넘어가는 순서를 봐야 해. ${prescriptionCopy()} 특히 <b>${pressureHuman}</b>이 커질 때 조건·가격·지출을 한 덩어리로 처리하지 말고 따로 나누면 손실이 줄어.`
      },
      {
        title: "06 · 일·진로에서 자리를 만드는 방식",
        body: `직업명보다 판의 구조가 중요해. <b>${strong}</b>을 실제 결과로 쓸 수 있고, 역할·평가·권한이 서로 맞는 곳에서 장점이 오래가. 반대로 ${pressureHuman}만 늘고 네가 힘을 넘길 다음 단계가 막히는 환경에서는 잘해도 소모가 먼저 쌓여.`
      },
      {
        title: "07 · 연애·관계에서 반복되는 구조",
        body: `연애든 친구든 네 기본 구조는 바뀌지 않아. 다만 가까운 관계에서는 <b>${pressureHuman}</b>이 감정으로 번역되기 쉬워. 상대 마음을 추측하는 것보다 불편함이 시작된 장면과 실제 조정 반응을 보는 게 더 정확해. 특정 사람과의 궁합은 이 한 사람 결과로 만들지 않아.`
      },
      {
        title: "08 · 사람·환경을 고르는 기준",
        body: `너한테 맞는 환경은 단순히 편한 곳이 아니라 <b>${strong}</b>을 쓰면서도 다음 단계로 힘을 넘길 수 있는 곳이야. ${prescriptionCopy()} 그 순서를 막고 같은 압박만 반복시키는 사람·환경은 오래 둘수록 비용이 커져.`
      },
      {
        title: "09 · 마음이 지칠 때 어디부터 무너지는가",
        body: `${forceCopy()} 그래서 지쳤을 때 의지를 더 넣는 게 항상 답은 아니야. 먼저 ${pressureHuman}을 줄일 수 있는 조건과, 네가 다시 기대어 설 수 있는 기반을 따로 확인하는 게 회복의 시작이야.`
      },
      {
        title: "10 · 가까운 18개월 핵심 시기",
        body: `기본 NOTE에서는 현재 고민에 필요한 시기만 골라 보여줬다면, 여기서는 한 사람 전체판 기준으로 가까운 핵심 구간을 같이 봐.<br><br>${nearTimelineCopy()}`
      },
      {
        title: "11 · 앞으로 5년 큰 흐름",
        body: `여기부터는 기본 NOTE6에서 전부 풀지 않았던 장기 흐름이야. 같은 사주 원판 위에 해마다 어떤 도움·주의 조건이 겹치는지 연도별로 압축해서 보면 이렇게 이어져.<br><br>${yearTimelineCopy()}`
      },
      {
        title: "12 · 평생 가져갈 내 사용법 3가지 + 큰 흐름 전환",
        body: `${daeunCopy()}<br><br><b>1.</b> 압박이 커질수록 바로 버티기보다 받쳐주는 조건과 다음 연결을 먼저 만들기.<br><b>2.</b> ${strong}만 과하게 반복하지 말고, 막힌 다음 단계가 무엇인지 확인하기.<br><b>3.</b> 좋은 시기에도 한 번에 전부 바꾸지 말고 작은 검증 → 확정 순서로 움직이기.<br><br>이 세 가지가 돈·일·관계·마음이 달라져도 반복해서 남는 네 전체 사용법이야.`
      },
    ];
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
      : "이건 지금 고민 하나를 또 풀어쓰는 결과가 아니야. 언니가 네 사주 전체를 펼쳐놓고, 돈·일·관계·마음이 왜 같은 원판에서 다르게 나타나는지와 앞으로 5년 큰 흐름까지 이어서 보는 전체 지도야.";
    const sections = fullSajuSections(data, mode);
    const fp = reasoning?.structureFingerprint || "";
    const tfp = reasoning?.timingFingerprint || "";
    return `<div data-product-contract="full_saju" data-structure-fingerprint="${esc(fp)}" data-timing-fingerprint="${esc(tfp)}" data-export-intro="full" style="padding:14px 15px;border-radius:16px;background:#fff7ed;border:1px solid #fed7aa;font-size:12.5px;line-height:1.8;color:#7c2d12;margin-bottom:8px"><b>이 전체판에서 새로 열리는 것</b><br>${intro}<br><span style="font-size:10.5px;color:#9a3412">기본 고민에서는 가까운 시기를 중심으로 보고 · 이 전체판에서는 향후 5년의 큰 흐름까지 이어서 공개</span></div>${sections.map((row,index)=>`<section data-export-kind="full" data-export-index="${index}" style="padding:18px 0;border-bottom:1px solid #eef2f7"><h4 style="font-size:15px;font-weight:900;margin:0 0 8px">${row.title}</h4><div style="font-size:13px;line-height:1.85;color:#475569">${row.body}</div></section>`).join("")}`;
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
      ? `<div data-product-exclusive="concern_bundle3" data-product-contract="concern_bundle3" data-structure-fingerprint="${esc(sharedFp)}" style="padding:14px 15px;border-radius:16px;background:#f8fafc;border:1px solid #e2e8f0;margin-bottom:18px;font-size:12.5px;line-height:1.8;color:#475569"><b>세 고민을 같이 보면 보이는 공통축</b><br>세 고민에서 사주 원판 자체는 바뀌지 않아. 공통으로 먼저 걸리는 건 <b>${esc(pressure)}</b>이고, 풀 때는 <b>${esc(firstAction)}</b> 쪽을 먼저 만드는 흐름이 반복돼. 아래에서는 그 같은 구조가 돈·일·관계 같은 서로 다른 고민에서 어떻게 다르게 나타나는지만 각각 깊게 풀어.</div>`
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
      const concernSituation =
        extra?.situations?.[key] ||
        (key === data?.concernKey ? data?.concernSituation || "" : "");
      const d = { ...data, concernKey:key, concernSituation };
      const notes = typeof global.generateConcernNotes === "function" ? global.generateConcernNotes(d, mode) : [];
      return { key, concernSituation, notes, reasoning:d.classicalReasoningV1 || getReasoning(d) };
    });
    const commonPressure = baseReasoning?.integrated?.pressureHuman || "여러 조건이 동시에 들어오는 압박";
    const pivots = baseReasoning?.timing?.longTermPivots || [];
    const pivotText = pivots.length
      ? pivots.map(x=>`${x.year}년`).join(" · ")
      : "장기 강한 변곡점은 억지로 만들지 않음";
    const crossDomain = `<div data-product-exclusive="all_in_one" data-product-contract="all_in_one" data-structure-fingerprint="${esc(baseReasoning?.structureFingerprint || "")}" style="padding:15px;border-radius:18px;background:#fff1f2;border:1px solid #fecdd3;margin:22px 0;font-size:12.5px;line-height:1.85;color:#881337"><b>6개 고민을 가로지르는 공통 구조</b><br>돈·일·연애·진로·사람·마음은 서로 다른 문제처럼 보여도 <b>${esc(commonPressure)}</b>이 커질 때 비슷한 반응이 반복돼. 중요한 장기 변곡점은 ${esc(pivotText)}. 각 고민에서는 같은 시기를 서로 다른 행동으로 적용하고, 마지막에는 어떤 영역이 동시에 흔들리는지 한 사람 기준으로 묶어봐.<br><span style="font-size:10.5px;color:#be123c">이 완전판은 나 한 사람 전체 분석이야. 두 사람 궁합은 포함하지 않아. 궁합은 두 번째 사람의 사주가 있어야만 따로 계산해.</span></div>`;
    const all = allRuns.map(({key,concernSituation,notes}) => {
      const situLabel = situationLabel(key, concernSituation);
      return `<section data-export-kind="concern" data-concern="${esc(key)}" data-concern-situation="${esc(concernSituation)}" style="margin:26px 0"><h3 style="font-size:19px;font-weight:950;margin:0 0 5px">${esc(CONCERNS[key])}</h3>${situLabel ? `<div style="font-size:11px;font-weight:850;color:#f43f5e;margin-bottom:10px">지금 상황 · ${esc(situLabel)}</div>` : ""}${noteCards(notes)}</section>`;
    }).join("");
    return `<h3 style="font-size:19px;font-weight:950;margin:0 0 10px">내 전체 사주판</h3>${fullSajuHtml(data, mode)}${crossDomain}<div style="height:8px"></div>${all}`;
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
    if (a === b) return isT ? "기본 속도가 비슷해서 이해는 빠르지만, 둘 다 같은 약점을 동시에 반복할 수 있어. 역할 분담이 필요해." : "둘이 비슷한 속도로 움직여서 말하지 않아도 통하는 순간이 많을 수 있어. 대신 둘 다 같은 데서 지칠 때는 한 명이 먼저 속도를 바꿔줘야 해.";
    if (gen[a] === b || gen[b] === a) return isT ? "한쪽의 강점이 다른 쪽의 다음 행동으로 이어지기 쉬운 조합이야. 도움과 간섭의 경계만 명확히 해." : "한 사람이 가진 힘이 다른 사람을 자연스럽게 밀어주는 장면이 생기기 쉬워. 다만 도와준다는 마음으로 상대 선택까지 대신하지는 말자.";
    if (ctrl[a] === b || ctrl[b] === a) return isT ? "끌림과 마찰이 같이 생기기 쉬워. 싸움의 원인은 애정 부족보다 속도·기준 충돌일 가능성을 먼저 봐." : "서로 다른 점이 매력으로 느껴지다가 같은 차이가 서운함이 될 수 있어. 누가 맞는지보다 서로의 기준을 번역해주는 게 중요해.";
    return isT ? "서로 쓰는 방식이 달라 보완 가능성이 있다. 추측하지 말고 역할과 기대치를 말로 맞춰." : "서로 다른 부분이 있어서 같이 있을 때 새로운 면을 꺼내줄 수 있어. 다름을 사랑의 크기로 해석하지 않는 게 중요해.";
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
        title: "02 · 처음 서로에게 끌리는 이유",
        body: isT
          ? `너의 <b>${myStrong}</b>과 ${safeName}의 <b>${partnerStrong}</b>이 관계의 첫 인상을 만든다. ${complementCopy}`
          : `처음에는 네 <b>${myStrong}</b>과 ${safeName}의 <b>${partnerStrong}</b>이 서로 눈에 들어오기 쉬워. ${complementCopy}`
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
        title: "06 · 서운함이 시작되는 포인트",
        body: isT
          ? `너는 <b>${myWeak}</b> 쪽이 밀리면 피로가 커지고, ${safeName}은 <b>${partnerWeak}</b> 쪽이 밀릴 때 예민해질 수 있다. 겉으로 드러난 말보다 그 직전 무엇이 부족했는지 봐.`
          : `싸움은 갑자기 생긴 것 같아도 그 전에 작은 서운함이 쌓여 있는 경우가 많아. 너는 <b>${myWeak}</b>이 부족해질 때 마음이 메말라지고, ${safeName}은 <b>${partnerWeak}</b>이 빠질 때 자기답지 않게 예민해질 수 있어. 그 순간을 빨리 알아보는 게 중요해.`
      },
      {
        title: "07 · 싸움이 커지는 순서",
        body: isT
          ? `${bothClash ? "둘 다 누적 후 한 번에 뒤집는 반응이 가능해서 싸움이 시작되면 확 커질 수 있다." : myClash ? "너는 참다가 한 번에 방향을 바꾸는 반응을 조심해야 한다." : partnerClash ? safeName + " 쪽이 쌓아두다 한 번에 반응할 수 있다." : "둘 다 큰 사건보다 작은 불편함을 방치하는 게 더 위험하다."} 특히 너의 <b>${myAvoid}</b>, 상대의 <b>${partnerAvoid}</b>이 동시에 나오면 대화를 중단하고 식히는 게 낫다.`
          : `${bothClash ? "둘 다 참다가 한 번에 확 돌아서는 순간이 생길 수 있어서, 작은 싸움도 타이밍이 나쁘면 크게 번질 수 있어." : myClash ? "너는 괜찮은 척 참다가 어느 순간 마음이 확 닫힐 수 있어." : partnerClash ? `${safeName}이 말이 없다가 갑자기 선을 긋는 순간이 생길 수 있어.` : "둘 다 작은 불편함을 ‘이 정도는 넘기자’ 하고 미루다가 서운함이 커질 수 있어."} 특히 네가 <b>${myAvoid}</b>, 상대가 <b>${partnerAvoid}</b>만 반복하고 있으면 그날은 결론까지 내지 말고 잠깐 식히자.`
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
          ? `${sameStrength ? "둘의 에너지 운용 방식이 비슷해서 표현 강도는 맞기 쉽다." : "에너지 운용 방식이 달라 한쪽은 충분히 표현했다고 느끼는데 다른 쪽은 부족하다고 느낄 수 있다."} 말, 연락, 행동 중 무엇을 애정의 증거로 보는지 직접 맞춰.`
          : `${sameStrength ? "둘은 마음을 쓰는 속도가 비슷해서 어느 정도 리듬을 맞추기 쉬운 편이야." : "한 사람은 충분히 하고 있다고 생각하는데 다른 사람은 ‘왜 이렇게 멀지?’ 하고 느끼는 순간이 생길 수 있어."} 그래서 “난 연락이 이 정도면 안심돼”, “난 말보다 행동이 더 중요해”처럼 사랑받는 느낌이 드는 방식을 구체적으로 말해주는 게 좋아.`
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
          ? `연애 감정보다 생활 규칙에서 갈등이 오래 간다. 일정, 약속시간, 집안일, 휴식 방식 중 반복 충돌하는 항목은 담당과 기준을 명확히 해. 추측 대신 규칙이 낫다.`
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
          ? `${sameStrongElement ? "서로의 강점을 빠르게 이해하는 조합이라 역할만 잘 나누면 안정감이 커질 수 있다." : "서로 다른 강점을 실제 생활에서 보완 관계로 쓰면 시간이 갈수록 효율이 좋아질 수 있다."} 핵심은 상대를 바꾸는 게 아니라 각자 잘하는 영역을 인정하는 것.`
          : `${sameStrongElement ? "시간이 지나면 서로 왜 그렇게 행동하는지 더 빨리 알아차릴 수 있어서 편안함이 커질 수 있어." : "서로 다른 장점을 경쟁시키지 않고 ‘이건 네가 더 잘하네’ 하고 맡길 수 있게 되면 관계가 훨씬 단단해질 수 있어."} 오래 갈수록 중요한 건 닮아지는 게 아니라 서로를 다루는 법을 익히는 거야.`
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
          ? `<b>1.</b> 서운함은 24시간 안에 말하기.<br><b>2.</b> 싸울 때 관계 전체를 평가하지 않기.<br><b>3.</b> 연락·돈·개인시간 기준을 미리 합의하기.<br><b>4.</b> 너는 ${myNeed}, ${safeName}은 ${partnerNeed}을 존중하기.<br><b>5.</b> 같은 싸움이 세 번 반복되면 감정이 아니라 규칙을 바꾸기.`
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
          <div style="font-size:12px;font-weight:950;color:#f43f5e">어떤언니 · ${esc(product?.name || "내 리포트")}</div>
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
      hint.textContent = `저장 준비 완료 · ${total}장`;
      return;
    }
    button.textContent = current > 0
      ? `사진으로 한 번에 저장하기 · ${current}/${total}`
      : "사진으로 한 번에 저장하기";
    hint.textContent = total > 0
      ? `결과 읽는 동안 미리 준비 중 · ${current}/${total}장`
      : "결과 읽는 동안 저장용 사진을 미리 준비해둘게.";
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
            `어떤언니_${safeFilePart(product?.name || "리포트")}_${safeFilePart(group.slug || group.title)}.png`,
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
            if (hint) hint.textContent = "미리 준비가 잠깐 꼬였어. 저장을 누르면 다시 준비할게.";
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
      if (typeof showToast === "function") showToast("이미지 저장 기능을 불러오지 못했어.");
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
          const shared = await exporter.nativeSharePng(blob, filenames[0], product?.name || "어떤언니 리포트");
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
            product?.name || "어떤언니 리포트",
          );
        } catch (error) {
          if (error?.name !== "AbortError") console.warn("다중 이미지 공유 실패:", error);
        }
        if (shared) return;

        if (exporter.isAndroidDevice?.()) {
          blobs.forEach((blob, index) =>
            setTimeout(() => exporter.downloadPngBlob(blob, filenames[index]), index * 120),
          );
          if (typeof showToast === "function") showToast(`${blobs.length}장 저장을 시작했어.`);
          return;
        }
      }

      if (exporter.isKakaoInApp?.() || exporter.isIOSDevice?.()) {
        await exporter.showImagePagesFallback(
          blobs,
          `${product?.name || "내 리포트"} · ${blobs.length}장`,
        );
        return;
      }

      blobs.forEach((blob, index) => {
        setTimeout(() => exporter.downloadPngBlob(blob, filenames[index]), index * 120);
      });
      if (typeof showToast === "function") {
        showToast(`주제별로 ${blobs.length}장 저장을 시작했어.`);
      }
    } catch (error) {
      console.error("유료 리포트 전체 저장 실패:", error);
      if (typeof showToast === "function") {
        showToast("전체 결과 저장이 잠깐 꼬였어. 한 번만 다시 눌러줘.");
      }
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
    root.style.cssText = "display:none;position:fixed;inset:0;z-index:99999;background:rgba(15,23,42,.48);padding:10px;overflow:auto;-webkit-overflow-scrolling:touch";
    root.innerHTML = `<div style="max-width:520px;margin:max(8px,env(safe-area-inset-top)) auto max(14px,env(safe-area-inset-bottom));background:#fff;border-radius:24px;padding:0 16px 18px;box-shadow:0 24px 70px rgba(15,23,42,.25);overflow:visible"><div id="unniProductStickyHead" style="position:sticky;top:0;z-index:8;display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin:0 -16px;padding:14px 16px 11px;background:rgba(255,255,255,.96);backdrop-filter:blur(14px);border-radius:24px 24px 14px 14px;border-bottom:1px solid #f1f5f9"><div><div id="unniProductBadge" style="font-size:10px;font-weight:900;color:#f43f5e"></div><h2 id="unniProductTitle" style="font-size:19px;font-weight:950;margin:4px 0 2px"></h2><div id="unniProductPrice" style="font-size:12px;font-weight:800;color:#64748b"></div></div><button id="unniProductClose" style="flex:none;border:0;background:#f1f5f9;border-radius:999px;width:36px;height:36px;font-size:19px;cursor:pointer">×</button></div><div id="unniProductSetup" style="margin-top:14px"></div><div id="unniProductPayment" style="display:none;margin-top:15px"><div id="unniProductPaymentMethod"></div><div id="unniProductPaymentAgreement"></div></div><div id="unniProductBody" style="margin-top:14px"></div><button id="unniProductSaveAll" type="button" style="display:none;width:100%;margin-top:22px;border:0;border-radius:15px;background:linear-gradient(90deg,#fb7185,#f472b6);color:white;padding:14px 16px;font-size:13px;font-weight:950;cursor:pointer">사진으로 한 번에 저장하기</button><div id="unniProductSaveHint" style="display:none;margin-top:7px;text-align:center;font-size:10px;font-weight:800;line-height:1.55;color:#94a3b8">결과 읽는 동안 저장용 사진을 미리 준비해둘게.</div><button id="unniProductAction" style="width:100%;margin-top:14px;border:0;border-radius:15px;background:#0f172a;color:white;padding:14px 16px;font-size:14px;font-weight:900;cursor:pointer"></button><div id="unniProductAccessNote" style="display:none;margin-top:9px;text-align:center;font-size:11px;font-weight:800;line-height:1.6;color:#a16207">🔐 한 번 결제하면 이 브라우저에서는 추가 결제 없이 계속 다시 볼 수 있어요.</div></div>`;
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
    if (productId === "concern_bundle3") {
      const defaults = new Set(defaultBundle(data));
      const keys = Object.keys(CONCERNS).filter((k) => k !== data?.concernKey);
      return `
        <div style="font-size:12px;font-weight:900;margin-bottom:5px">더 보고 싶은 고민 3개를 골라</div>
        <div style="font-size:10.5px;line-height:1.6;color:#94a3b8;margin-bottom:10px">고른 고민마다 지금 상황도 하나씩 맞춰줘. 그래야 결과가 엉뚱한 전제를 안 해.</div>
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
        <div style="font-size:12px;font-weight:900;margin-bottom:5px">6가지 고민의 지금 상황만 맞춰줘</div>
        <div style="font-size:10.5px;line-height:1.6;color:#94a3b8;margin-bottom:10px">각 고민을 네 실제 상황에 맞춰서 봐주기 위한 마지막 설정이야.</div>
        <div id="unniAllInOneSituations" style="display:grid;gap:8px">
          ${Object.keys(CONCERNS).map((k) => {
            const selected = k === data?.concernKey ? data?.concernSituation || "" : "";
            return `<label style="display:grid;grid-template-columns:92px 1fr;align-items:center;gap:8px;padding:9px 10px;border:1px solid #e2e8f0;border-radius:13px;background:#fff"><span style="font-size:11px;font-weight:900;color:#334155">${CONCERNS[k]}</span><select data-all-situation="${k}" style="width:100%;min-width:0;padding:9px 10px;border:1px solid #cbd5e1;border-radius:10px;background:#f8fafc;font-size:10.5px;font-weight:750;color:#475569">${situationSelectOptions(k, selected)}</select></label>`;
          }).join("")}
        </div>`;
    }
    if (productId === "compatibility") {
      const hourOpts = Array.from({ length: 12 }, (_, i) => `<option value="${i + 1}">${i + 1}시</option>`).join("");
      const minuteOpts = Array.from({ length: 60 }, (_, i) => `<option value="${String(i).padStart(2, "0")}">${String(i).padStart(2, "0")}분</option>`).join("");
      return `<div style="display:grid;gap:10px">
        <div><div style="font-size:11px;font-weight:900;color:#475569;margin:0 0 5px">상대 이름</div><input id="partnerName" placeholder="이름 또는 별명" style="width:100%;box-sizing:border-box;padding:12px;border:1px solid #e2e8f0;border-radius:12px"></div>
        <div><div style="font-size:11px;font-weight:900;color:#475569;margin:0 0 5px">상대 생년월일</div><input id="partnerBirth" inputmode="numeric" maxlength="8" placeholder="예: 1999년 2월 14일 → 19990214" style="width:100%;box-sizing:border-box;padding:12px;border:1px solid #e2e8f0;border-radius:12px"></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px"><select id="partnerGender" style="padding:12px;border:1px solid #e2e8f0;border-radius:12px"><option value="female">여성</option><option value="male">남성</option></select><select id="partnerCalendar" style="padding:12px;border:1px solid #e2e8f0;border-radius:12px"><option value="solar">양력</option><option value="lunar">음력</option></select></div>
        <div id="partnerLeapWrap" style="display:none;padding:10px 12px;border-radius:12px;background:#fff7ed;border:1px solid #fed7aa">
          <label style="display:flex;align-items:center;gap:7px;font-size:11px;font-weight:850;color:#9a3412;cursor:pointer"><input id="partnerLeapMonth" type="checkbox"> 윤달이에요</label>
        </div>
        <div style="padding:12px;border-radius:14px;background:#f8fafc;border:1px solid #e2e8f0">
          <div style="font-size:11px;font-weight:900;color:#334155;margin-bottom:7px">상대가 태어난 시간 <span style="font-weight:700;color:#94a3b8">(알면 선택)</span></div>
          <div style="display:grid;grid-template-columns:.9fr 1fr 1fr;gap:6px">
            <select id="partnerAmpm" style="padding:10px 8px;border:1px solid #cbd5e1;border-radius:10px;background:white"><option value="">오전/오후</option><option value="am">오전</option><option value="pm">오후</option></select>
            <select id="partnerHour12" style="padding:10px 8px;border:1px solid #cbd5e1;border-radius:10px;background:white"><option value="">몇 시</option>${hourOpts}</select>
            <select id="partnerMinute" style="padding:10px 8px;border:1px solid #cbd5e1;border-radius:10px;background:white"><option value="">몇 분</option>${minuteOpts}</select>
          </div>
          <label style="display:flex;align-items:center;gap:7px;margin-top:9px;font-size:11px;font-weight:800;color:#64748b;cursor:pointer"><input id="partnerTimeUnknown" type="checkbox"> 태어난 시간을 몰라요</label>
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
  }

  function collectExtra(productId, data, root) {
    if (productId === "concern_bundle3") {
      const picked = [...root.querySelectorAll('#unniBundleChecks input:checked')].map((x) => x.value);
      if (picked.length !== 3) throw new Error("고민을 정확히 3개 골라줘.");
      const situations = {};
      for (const key of picked) {
        const value = root.querySelector(`[data-bundle-situation="${key}"]`)?.value || "";
        if (!situationRows(key).some(([s]) => s === value)) {
          throw new Error(`${CONCERNS[key]}의 지금 상황도 하나 골라줘.`);
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
          throw new Error(`${CONCERNS[key]}의 지금 상황을 골라줘.`);
        }
        situations[key] = value;
      }
      return { situations };
    }
    if (productId === "compatibility") {
      const b = root.querySelector("#partnerBirth")?.value.replace(/\D/g, "") || "";
      if (!/^\d{8}$/.test(b)) throw new Error("상대 생년월일을 8자리로 입력해줘.");
      const unknown = !!root.querySelector("#partnerTimeUnknown")?.checked;
      let tRaw = "unknown";
      if (!unknown) {
        const ampm = root.querySelector("#partnerAmpm")?.value || "";
        const hour12 = Number(root.querySelector("#partnerHour12")?.value || 0);
        const minute = root.querySelector("#partnerMinute")?.value || "";
        if (!ampm || !hour12 || minute === "") throw new Error("상대 태어난 시간을 골라줘. 모르면 ‘태어난 시간을 몰라요’를 체크해줘.");
        const hour24 = (hour12 % 12) + (ampm === "pm" ? 12 : 0);
        tRaw = `${String(hour24).padStart(2, "0")}:${minute}`;
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
    root.querySelector("#unniProductBadge").textContent = "구매한 리포트";
    root.querySelector("#unniProductTitle").textContent = product.name;
    root.querySelector("#unniProductPrice").textContent = "";
    root.querySelector("#unniProductSetup").innerHTML = "";
    root.querySelector("#unniProductPayment").style.display = "none";
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
      saveHint.textContent = "결과 읽는 동안 저장용 사진을 미리 준비해둘게.";
    }

    const action = root.querySelector("#unniProductAction");
    action.textContent = "닫기";
    action.onclick = () => root.querySelector("#unniProductClose").click();
    root.style.display = "block";
    root.scrollTop = 0;
    document.body.style.overflow = "hidden";

    // 사용자가 리포트를 읽는 동안 뒤에서 천천히 준비해 저장 버튼 대기를 줄인다.
    prewarmPaidExport(root, productId);
  }

  async function beginPaidCheckout(productId, data, extra, root) {
    if (typeof paymentAPI !== "function" || typeof resultSnapshot !== "function") throw new Error("결제 준비 함수를 불러오지 못했어.");
    const snap = { ...resultSnapshot(data), p: productId, x: extra };
    const order = await paymentAPI({ action: "prepare", data: snap });
    const product = PRODUCTS[productId];
    if (!order?.ok || order.productId !== productId || Number(order.amount) !== product.price) throw new Error("상품 주문 정보가 맞지 않아. 다시 시도해줘.");
    if (typeof PaymentWidget === "undefined") throw new Error("결제창을 불러오지 못했어. 새로고침 후 다시 해줘.");
    root.querySelector("#unniProductPayment").style.display = "block";
    root.querySelector("#unniProductPaymentMethod").innerHTML = "";
    root.querySelector("#unniProductPaymentAgreement").innerHTML = "";
    const widget = PaymentWidget(TOSS_CLIENT_KEY, PaymentWidget.ANONYMOUS);
    widget.renderPaymentMethods("#unniProductPaymentMethod", { value: order.amount, currency: "KRW" }, { variantKey: "saju" });
    widget.renderAgreement("#unniProductPaymentAgreement");
    const action = root.querySelector("#unniProductAction");
    action.textContent = `${won(order.amount)} 결제하고 열기`;
    action.onclick = async () => {
      action.disabled = true;
      try {
        const base = (location.hostname === "sajuft.com" || location.hostname === "www.sajuft.com" ? "https://sajuft.com" : location.origin) + location.pathname;
        const ticket = encodeURIComponent(order.ticket);
        await widget.requestPayment({ orderId: order.orderId, orderName: product.name, customerName: data.name || data.userName || "구매자", successUrl: `${base}?payment=success&state=${ticket}`, failUrl: `${base}?payment=fail&state=${ticket}` });
      } catch (e) {
        action.disabled = false;
        if (typeof showToast === "function") showToast(e?.message || "결제창을 열지 못했어.");
      }
    };
  }

  async function openProduct(productId) {
    const data = getData();
    const product = PRODUCTS[productId];
    if (!data || !product) return;
    const root = ensureModal();
    root.querySelector("#unniProductBadge").textContent = product.badge;
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
    root.querySelector("#unniProductBody").innerHTML = `<p style="font-size:13px;line-height:1.75;color:#64748b">${esc(product.desc)}</p>${valueCopy?.unlocks ? `<div style="margin-top:10px;padding:10px 12px;border-radius:12px;background:#f8fafc;border:1px solid #e2e8f0;font-size:11px;line-height:1.65;color:#475569"><b>이 상품에서 새로 열리는 정보</b><br>${esc(valueCopy.unlocks)}</div>` : ""}`;
    const isFreeLaunch = typeof FREE_LAUNCH_MODE !== "undefined" && FREE_LAUNCH_MODE;
    const accessNote = root.querySelector("#unniProductAccessNote");
    if (accessNote) accessNote.style.display = isFreeLaunch ? "none" : "block";
    const action = root.querySelector("#unniProductAction");
    action.disabled = false;
    const grant = readGrant(data, productId);
    if (grant?.token && grant?.userKey && typeof verifyAccessToken === "function") {
      action.textContent = "구매한 리포트 다시 열기";
      action.onclick = async () => {
        action.disabled = true;
        try {
          const state = await verifyAccessToken(grant.userKey, grant.token);
          if (state === "valid") return showReport(productId, data, grant.extra || {});
          throw new Error("구매 확인이 필요해. 결제 내역을 다시 확인해줘.");
        } catch (e) { if (typeof showToast === "function") showToast(e?.message || "구매 확인에 실패했어."); }
        finally { action.disabled = false; }
      };
    } else {
      action.textContent = isFreeLaunch ? "무료 이벤트로 미리보기" : `${won(product.price)}에 열기`;
      action.onclick = async () => {
        action.disabled = true;
        try {
          const extra = collectExtra(productId, data, root);
          if (typeof FREE_LAUNCH_MODE !== "undefined" && FREE_LAUNCH_MODE) return showReport(productId, data, extra);
          await beginPaidCheckout(productId, data, extra, root);
        } catch (e) { if (typeof showToast === "function") showToast(e?.message || "상품을 열지 못했어."); }
        finally { action.disabled = false; }
      };
    }
    root.style.display = "block";
    document.body.style.overflow = "hidden";
  }

  function recommendedProductId(data) {
    const explicitIntent = data?.premiumIntent || "";
    if (explicitIntent === "everything") return "all_in_one";
    if (explicitIntent === "other-concerns") return "concern_bundle3";
    if (explicitIntent === "relationship-person") return "compatibility";
    if (explicitIntent === "long-term") return "full_saju";

    const concern = data?.concernKey || "money";
    const situation = data?.concernSituation || "";
    if (concern === "love" && ["crush","relationship","breakup"].includes(situation)) return "compatibility";
    if (["mental","people"].includes(concern)) return "concern_bundle3";

    const reasoning = getReasoning(data);
    const hasRealLongPivot = (reasoning?.timing?.longTermPivots || []).length > 0;
    if (hasRealLongPivot && ["money","career","path"].includes(concern)) return "full_saju";
    if (concern === "path" && situation === "strength") return "all_in_one";
    return "full_saju";
  }

  function productShort(productId) {
    return productValueCopy(productId)?.short || PRODUCTS[productId]?.desc || "";
  }

  function recommendationReason(productId, data, isT) {
    const situation = situationLabel(data?.concernKey, data?.concernSituation);
    if (productId === "compatibility") {
      return isT
        ? "지금 질문에는 네 사주만 더 보는 것보다 상대 사주까지 겹쳐야 새로 알 수 있는 정보가 많아."
        : `${situation ? "방금 말한 ‘" + situation + "’라면 " : ""}이제 네 마음만 더 보는 것보다, 상대 사주까지 같이 놓고 둘 사이 이유를 보는 게 완전히 다른 답을 줄 수 있어.`;
    }
    if (productId === "full_saju") {
      return isT
        ? "기본 NOTE에서 가까운 시기는 충분히 봤어. 다음 정보 가치는 5년 전체 흐름과 여러 영역이 같이 바뀌는 이유에 있어."
        : "지금 고민 하나의 가까운 시기는 이미 충분히 봤으니까, 다음에는 네 인생 전체 구조와 5년 큰 흐름을 이어서 보는 게 새 정보가 제일 많아.";
    }
    if (productId === "concern_bundle3") {
      return isT
        ? "지금 고민은 여기서 닫고, 다른 고민 3개에 같은 원판이 어떻게 다르게 적용되는지 보는 게 중복이 적어."
        : "지금 고민 하나는 충분히 풀었으니까, 아직 마음에 남은 다른 고민 3개를 같은 깊이로 보면 ‘같은 나인데 왜 문제마다 다르게 꼬이는지’가 더 선명해져.";
    }
    return isT
      ? "한 사람 기준으로 전체 구조·6개 고민·5년 흐름을 따로 열기 싫다면 한 번에 묶는 구성이 맞아."
      : "내 사주 전체판도 보고 6가지 고민도 하나씩 다 풀고 싶다면, 나 한 사람에 대한 내용을 한 번에 여는 쪽이 제일 편해.";
  }

  function productButtonHtml(p, { recommended = false, secondary = false, reason = "" } = {}) {
    const border = recommended ? "#fda4af" : "#e2e8f0";
    const bg = recommended ? "linear-gradient(135deg,#fff1f2,#fff)" : "#fff";
    const pad = recommended ? "15px" : "12px 13px";
    const value = productValueCopy(p.id);
    const description = recommended ? p.desc : productShort(p.id);
    const cta = value?.cta || p.badge;
    return `<button data-unni-product="${p.id}" ${secondary ? 'data-secondary-product="1"' : ""} style="text-align:left;width:100%;padding:${pad};border:${recommended ? "2px" : "1px"} solid ${border};border-radius:16px;background:${bg};cursor:pointer;box-shadow:${recommended ? "0 8px 24px rgba(244,63,94,.10)" : "none"}"><div style="display:flex;justify-content:space-between;gap:10px;align-items:center"><div style="min-width:0"><div style="font-size:10px;font-weight:900;color:${recommended ? "#f43f5e" : "#94a3b8"};margin-bottom:3px">${recommended ? "언니가 지금 먼저 골라준 건 · " : ""}${p.badge}</div><div style="font-size:${recommended ? "15px" : "13px"};font-weight:950;color:#0f172a">${p.name}</div></div><div style="font-size:${recommended ? "14px" : "13px"};font-weight:950;color:#0f172a;white-space:nowrap">${won(p.price)}</div></div><div style="font-size:${recommended ? "11.5px" : "10.5px"};line-height:1.6;color:#64748b;margin-top:${recommended ? "7px" : "5px"}">${description}</div><div style="margin-top:7px;font-size:10.5px;font-weight:900;color:${recommended ? "#be123c" : "#475569"}">새로 열리는 것 · ${esc(cta)}</div>${recommended && reason ? `<div style="margin-top:8px;padding:8px 9px;border-radius:11px;background:rgba(255,255,255,.75);font-size:10.5px;line-height:1.55;font-weight:800;color:#be123c">왜 이걸 먼저 추천하냐면 · ${reason}</div>` : ""}</button>`;
  }

  function renderCatalog() {
    const data = getData();
    const notes = document.getElementById("notesListContainer");
    const existing = document.getElementById("unniProductLadder");
    const unlocked = typeof isUnlocked === "undefined" ? true : !!isUnlocked;
    if (!data || !notes) {
      existing?.remove();
      return;
    }
    if (!unlocked) {
      existing?.remove();
      return;
    }
    if (existing) return;
    const isT = data?.currentMode === "T";
    const recommendedId = recommendedProductId(data);
    const recommended = PRODUCTS[recommendedId] || PRODUCTS.full_saju;
    const others = Object.values(PRODUCTS).filter((p) => p.id !== recommended.id);
    const wrap = document.createElement("section");
    wrap.id = "unniProductLadder";
    wrap.style.cssText = "margin-top:24px;padding:18px 14px;border-radius:22px;background:#fff;border:1px solid #fde2e8;box-shadow:0 10px 30px rgba(225,175,185,.10)";
    const eyebrow = isT ? "이 고민은 여기까지 정리했어" : "이 고민 끝까지 같이 봤으니까";
    const headline = isT ? "다음으로 볼 건 이게 제일 맞아" : "언니가 너한테 다음 하나만 골라봤어";
    const sub = isT
      ? "방금 본 내용을 다시 파는 게 아니라, 여기서부터 새로 열리는 정보가 가장 많은 걸 맨 위에 뒀어."
      : "방금 상담에서 이미 본 건 빼고, 여기서부터 새로 알 수 있는 게 가장 많은 걸 언니가 맨 위에 골라뒀어.";
    const reason = recommendationReason(recommended.id, data, isT);
    wrap.innerHTML = `<div style="font-size:11px;font-weight:900;color:#f43f5e">${eyebrow}</div><h3 style="font-size:18px;font-weight:950;margin:5px 0 5px">${headline}</h3><p style="font-size:11.5px;line-height:1.6;color:#64748b;margin:0 0 12px">${sub}</p><div style="display:grid;gap:9px">${productButtonHtml(recommended,{recommended:true,reason})}<button id="unniShowOtherProducts" type="button" aria-expanded="false" style="width:100%;border:1px solid #e2e8f0;background:#f8fafc;border-radius:13px;padding:10px 12px;font-size:11px;font-weight:900;color:#64748b;cursor:pointer">목적이 다르면 다른 3개 보기</button><div id="unniOtherProducts" style="display:none;gap:9px">${others.map((p)=>productButtonHtml(p,{secondary:true})).join("")}</div></div>`;
    notes.insertAdjacentElement("afterend", wrap);
    const toggle = wrap.querySelector("#unniShowOtherProducts");
    const otherWrap = wrap.querySelector("#unniOtherProducts");
    toggle?.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") !== "true";
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.textContent = open ? "다른 3개 접기" : "목적이 다르면 다른 3개 보기";
      if (otherWrap) {
        otherWrap.style.display = open ? "grid" : "none";
        otherWrap.style.gap = "9px";
      }
    });
    wrap.querySelectorAll("[data-unni-product]").forEach((btn) => btn.addEventListener("click", () => openProduct(btn.dataset.unniProduct)));
  }

  global.handleUnniProductPaymentReturn = async function (params, resume, restored, ticket) {
    const productId = resume?.productId;
    const product = PRODUCTS[productId];
    if (!product) return false;
    if (params.get("payment") === "fail") {
      if (typeof showToast === "function") showToast(params.get("message") || "결제가 취소됐어.");
      return true;
    }
    if (params.get("payment") !== "success") return true;
    const paymentKey = params.get("paymentKey"), orderId = params.get("orderId"), amount = Number(params.get("amount"));
    if (!paymentKey || orderId !== resume.orderId || amount !== Number(resume.amount)) throw new Error("상품 결제 복귀 정보가 일치하지 않아. 재결제하지 말고 주문번호로 문의해줘.");
    const token = await confirmPaymentOnServer(paymentKey, orderId, amount, resume.userKey, ticket);
    saveGrant(restored, productId, { userKey: resume.userKey, token, extra: resume.data?.x || {}, orderId });
    try { sessionStorage.removeItem("unni_pending_approval"); } catch (_) {}
    showReport(productId, restored, resume.data?.x || {});
    if (typeof showToast === "function") showToast("결제 확인됐어. 리포트 열어뒀어.");
    return true;
  };

  global.openUnniProduct = openProduct;
  global.renderUnniProductCatalog = renderCatalog;
  global.__UNNI_PRODUCTS_V1__ = {
    version: "2.0.1",
    products: PRODUCTS,
    contracts: global.__UNNI_PRODUCT_CONTENT_POLICY_V1__?.contracts || {},
    buildProductBody: productBody,
    recommendedProductId,
  };

  const observer = new MutationObserver(() => renderCatalog());
  if (document.documentElement) observer.observe(document.documentElement, { childList: true, subtree: true });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", renderCatalog);
  else setTimeout(renderCatalog, 0);
})(globalThis);
