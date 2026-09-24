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
      price: 100,
      badge: "다른 고민 3개 확장",
      desc: "지금 고민은 그대로 두고, 다른 고민 3개를 각각 같은 깊이로 풀어. 세 고민에 반복되는 공통 구조도 마지막에 묶어봐.",
    },
    full_saju: {
      id: "full_saju",
      name: "내 전체 사주판",
      price: 100,
      badge: "전체 구조 + 5년 흐름",
      desc: "고민 하나가 아니라 내 사주 전체 구조, 여러 삶의 영역이 연결되는 이유, 가까운 핵심 시기와 향후 5년 큰 흐름을 한 장으로 이어서 봐.",
    },
    compatibility: {
      id: "compatibility",
      name: "우리 둘 궁합",
      price: 100,
      badge: "두 사람 사주 교차",
      desc: "내 사주만으로는 만들 수 없는 결과야. 상대 사주까지 겹쳐 끌림·오해·갈등·보완과 둘만의 관계 시기를 같이 봐.",
    },
    all_in_one: {
      id: "all_in_one",
      name: "내 사주 완전판",
      price: 100,
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

  function reasoningMainZiping(reasoning) {
    return reasoning?.ziping?.findings?.find((x) => x.id !== "ZZ_MONTH_101" && x.kind === "gyeok" && x.implementationStatus !== "unimplemented")
      || reasoning?.ziping?.findings?.find((x) => x.id === "ZZ_MONTH_101")
      || null;
  }

  function josa(word, withBatchim, withoutBatchim) {
    const chars = Array.from(String(word || "").trim());
    for (let i = chars.length - 1; i >= 0; i -= 1) {
      const code = chars[i].charCodeAt(0);
      if (code >= 0xAC00 && code <= 0xD7A3) return String(word || "") + ((code - 0xAC00) % 28 !== 0 ? withBatchim : withoutBatchim);
    }
    return String(word || "") + withoutBatchim;
  }

  function chartFacts(data) {
    const api = global.__CONCERN_NOTE_ENGINE_V2__;
    if (typeof api?.facts !== "function") return null;
    try { return api.facts(data); } catch (_) { return null; }
  }

  // 전체판·궁합 문장은 NOTE와 같은 순서로 쓴다: 그 사람에게 실제로 보일 장면 → 왜 그러냐면 → 이렇게 써봐.
  const STRENGTH_ENDURANCE = {
    신약: "처음 며칠은 잘 버티는데, 같은 부담이 몇 주 이어지면 갑자기 바닥나는 느낌 알지?",
    신강: "웬만한 일엔 잘 안 흔들리고, 남들이 지칠 때 오히려 네가 끝까지 남는 편이지?",
    중화: "잘 버틸 때와 확 지칠 때가 상황 따라 꽤 갈리지? 같은 일도 겹치는 게 많으면 갑자기 버거워져.",
  };
  const GROUP_ACTION = {
    self: "내가 감당할 범위와 기준을 먼저 정해",
    print: "배우고 쉬는 시간을 일정에 먼저 넣어",
    output: "생각을 작은 결과물 하나로 먼저 꺼내",
    wealth: "한 일을 돈·보상 기준으로 먼저 적어봐",
    officer: "역할과 마감을 스스로라도 먼저 정해",
  };

  function fullSajuSections(data, mode) {
    const p = getProfile(data);
    const r = getReasoning(data);
    const f = chartFacts(data);
    const isT = mode === "T";
    if (!p || !r || !f) return [];

    const dom = f.top ? `${f.top.god}(${f.top.meaning})` : "고르게 나뉜 힘";
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

    const label = (t, f2) => `<b>${isT ? t : f2}</b> · `;
    const why = (text) => `${label("근거(왜냐면)", "왜 그러냐면")}${text}`;
    const use = (text) => `${label("이렇게 써", "그래서")}${text}`;
    const shareWord = (share) => share >= 30 ? "커" : share >= 10 ? "적당히 있어" : "적은 편이야";
    const groupLine = (group) => `${f.groupMeaning(group)}(${f.groupName(group)})${josa(f.groupMeaning(group), "은", "는").slice(f.groupMeaning(group).length)} ${f.shares[group] || 0}%로 ${shareWord(f.shares[group] || 0)}`;
    const balanceSide = f.balance ? `${f.balance.name} 기운(너한텐 ${f.groupMeaning(f.balance.group)} 쪽)` : "";
    const firstSupport = f.supportGods.find((g) => f.presentGods.includes(g)) || f.supportGods[0] || "";
    const firstHarm = f.harmGods[0] || "";

    function signalWhy(row, positive) {
      const rows = positive ? row?.supportSignals : row?.cautionSignals;
      const sig = (rows || []).find((x) => x.severity === "major") || (rows || [])[0];
      const code = sig?.code || "";
      if (/rescue|generate/.test(code)) return "부족한 쪽을 채워주는 글자가 들어와";
      if (/assist|root-add/.test(code)) return "너와 같은 기운이 보태져서 버티는 힘이 붙어";
      if (/bridge|flow-unblock/.test(code)) return "평소 끊기던 연결을 이어주는 글자가 들어와";
      if (/discharge/.test(code)) return "쌓인 생각을 말·결과로 빼기 쉬워";
      if (/control/.test(code)) return "흩어진 힘을 기준과 우선순위로 묶기 쉬워";
      if (/ziping-support/.test(code)) return `사주 중심인 ${josa(f.centerGod || "중심 글자", "을", "를")} 살려주는 글자가 들어와`;
      if (/root-clash/.test(code)) return "평소 버티게 해주던 뿌리를 건드리는 글자가 들어와";
      if (/body-cost/.test(code)) return "약한 쪽에 부담을 더 얹는 글자가 들어와";
      if (/ziping-harm/.test(code)) return `사주 중심인 ${josa(f.centerGod || "중심 글자", "을", "를")} 흔드는 글자가 들어와`;
      return positive ? "도움이 되는 글자가 겹쳐" : "조심할 글자가 겹쳐";
    }

    function nearTimelineCopy() {
      const rows = nearHighlights.slice(0,3);
      if (!rows.length) return "가까운 18개월에서는 특정 달 하나를 억지로 고르지 않을게. 준비 상태를 보면서 움직이는 편이 맞아.";
      // 같은 이유·같은 할 일이 두 번 나오지 않도록, 반복되면 앞 구간을 가리키고 할 일은 순서대로 바꾼다.
      const monthTips = {
        pos: ["일·돈·관계 중 실제 반응이 오는 곳부터 작게 확정해봐.", "앞에서 반응이 온 쪽을 한 단계 더 키워봐.", "미뤄둔 일 하나를 이 구간 안에 실제로 끝내봐."],
        neg: ["새 판을 크게 벌리기보다 일정·지출·약속 중 제일 무거운 것부터 줄여.", "줄여둔 일정과 지출은 아직 다시 늘리지 마.", "무리한 약속은 미루고 쉬는 시간을 먼저 잡아."],
        mix: ["잘되는 영역과 버거운 영역을 나눠서 움직여.", "잘되는 쪽만 조금 더 밀고, 버거운 쪽은 속도를 늦춰."],
      };
      const used = { pos:0, neg:0, mix:0 };
      let prevReason = "";
      const seenReason = new Set();
      return rows.map((row) => {
        const when = f.formatMonth(row);
        const positive = ["supportive","mild-support"].includes(row.class);
        const negative = ["caution","mild-caution"].includes(row.class);
        const key = positive ? "pos" : negative ? "neg" : "mix";
        const tip = monthTips[key][used[key]++ % monthTips[key].length];
        if (key === "mix") { prevReason = ""; return `<b>${when}</b><br>${used.mix > 1 ? "이번에도 도움과 주의가 같이 잡혀" : "도움과 주의가 같이 잡혀"}. ${tip}`; }
        const reason = f.monthReason(row, positive);
        const lead = reason === prevReason
          ? (positive ? (seenReason.has("repeat:pos") ? "같은 좋은 흐름이 계속 이어져" : "앞 구간의 좋은 흐름이 한 번 더 이어져") : (seenReason.has("repeat:neg") ? "같은 부담이 계속 이어져" : "앞 구간의 부담이 한 번 더 이어져"))
          : seenReason.has(reason) ? `앞에서처럼 ${reason}` : reason;
        if (reason === prevReason) seenReason.add(positive ? "repeat:pos" : "repeat:neg");
        prevReason = reason;
        seenReason.add(reason);
        return `<b>${when}</b><br>${lead}. ${tip}`;
      }).join("<br><br>");
    }

    function yearTimelineCopy() {
      if (!years.length) return "5년 흐름 자료가 충분하지 않아서 연도별 이야기를 억지로 만들지 않았어.";
      const currentYear = Number(String(r.timing?.today || "").slice(0,4)) || 0;
      const annualRows = years.filter((y) => y.year > currentYear).slice(0,5);
      const seenTip = {};
      const seenSignal = {};
      return annualRows.map((y) => {
        const positive = ["supportive","mild-support"].includes(y.class);
        const negative = ["caution","mild-caution"].includes(y.class);
        const direction = positive ? "준비한 걸 실제 선택으로 옮기기 좋은 해"
          : negative ? "넓히기보다 지키고 조정할 해"
            : y.class === "mixed" ? "잘되는 일과 부담되는 일이 같이 커지는 해"
              : "한쪽으로 크게 기울지 않는 해";
        const mark = (text) => {
          const before = seenSignal[text] || [];
          seenSignal[text] = [...before, y.year];
          return before.length ? `${before.join("·")}년처럼 ${text}` : text;
        };
        const reason = positive ? mark(signalWhy(y,true)) : negative ? mark(signalWhy(y,false)) : `${mark(signalWhy(y,true))}. 그런데 동시에 ${mark(signalWhy(y,false))}`;
        const key = positive ? "pos" : negative ? "neg" : y.class === "mixed" ? "mix" : "flat";
        const again = seenTip[key] = (seenTip[key] || 0) + 1;
        const tips = {
          pos: ["이미 검증한 일·돈·관계 선택을 한 단계 확정해.", "앞의 좋은 해에 해본 것 중 반응이 온 걸 한 번 더 키워.", "미뤄둔 결정 하나를 이 해 안에 실제로 끝내.", "새 사람·새 자리 제안이 오면 조건을 확인하고 받아들여 봐.", "그동안 쌓은 걸 밖으로 보여주고 평가받아 봐."],
          neg: ["손실·과로·갈등이 커지기 전에 범위와 속도를 줄여.", "새로 벌이기보다 이미 가진 일·돈·관계를 지키는 데 힘을 써.", "무리한 약속은 미루고, 쉬는 시간을 먼저 일정에 넣어.", "큰돈이 드는 결정은 한 번 더 미루고 비교해.", "부딪히는 사람과는 거리를 조금 두고 지켜봐."],
          mix: ["잘되는 영역만 키우고, 부담이 큰 영역은 같은 속도로 밀지 마.", "잘되는 쪽과 버거운 쪽을 나눠 적고, 버거운 쪽은 속도를 늦춰.", "좋은 기회가 와도 한 번에 다 받지 말고, 감당할 만큼만 골라.", "한 영역이 잘될 때 다른 영역에서 빠지는 게 없는지 같이 봐.", "좋은 소식에 들뜨기보다 체력과 돈의 여유부터 확인해."],
          flat: ["새 판보다 앞에서 만든 기반을 지키면서 다음 좋은 해를 준비해.", "크게 바꾸기보다 지금 방식을 다듬는 데 써.", "눈에 띄는 변화보다 기본 체력과 돈 관리를 챙기는 해로 써.", "배우고 싶던 걸 하나 시작해 두기 좋은 해로 써.", "관계와 일의 정리할 부분을 조용히 정리해."],
        }[key];
        const tip = tips[(again - 1) % tips.length];
        return `<b>${y.year}년 · ${direction}</b><br>${reason}. ${tip}`;
      }).join("<br><br>");
    }

    function daeunCopy() {
      if (!daeunPeriods.length) return "10년 단위 큰 흐름을 읽을 자료가 충분하지 않아 전환점을 만들지 않았어.";
      const current = daeunPeriods[0];
      const next = daeunPeriods[1];
      const now = current?.god ? f.godLabel(current.god) : "지금 삶의 과제를 밀어주는 힘";
      const nextText = next
        ? `<br><br><b>${next.startYear}년 무렵</b>부터는 ${next.god ? f.godLabel(next.god) : "다른 힘"} 쪽이 더 앞에 나와. 그때는 지금 잘되던 방식 그대로만 밀기보다 역할과 선택 기준을 다시 맞추는 게 좋아.`
        : "<br><br>지금 보는 범위 안에서는 다음 10년 흐름 전환을 억지로 만들지 않았어.";
      return `지금 10년 단위 큰 흐름에서는 <b>${now}</b> 쪽이 계속 앞에 나와. 요즘 잘되는 일도, 지치는 일도 이 힘과 관련된 장면에서 먼저 보일 거야.${nextText}`;
    }

    const bridgeStatus = bridge?.facts?.status || "unknown";
    const blockedTo = flow?.facts?.blockedAt?.to || "";
    const relationRaw = p.relations?.raw || {};
    const hasClash = !!p.relations?.hasClash;
    const actions = (prescription.sequence || []).map((x) => x?.element).filter(Boolean);
    const timingRuleIds = (rows) => uniq((rows || []).flatMap((row) => [...(row.supportSignals || []),...(row.cautionSignals || [])].flatMap((sig) => sig.sourceRuleIds || [])));
    const strongEl = f.strongest?.el || "";
    const weakEl = f.weakest?.el || "";
    const pressureHuman = f.pressureLabel || "여러 조건이 한꺼번에 들어오는 부담";
    const weakAction = f.weakest ? GROUP_ACTION[f.weakest.group] || "" : "";
    const moneyScene = f.concernLine("money");
    const careerScene = f.concernLine("career");
    const loveScene = f.concernLine("love");
    const peopleScene = f.concernLine("people");
    const mentalScene = f.concernLine("mental");

    const sections = [
      {
        title:"01 · 내 사주 전체 핵심",
        body:`${isT ? "" : "언니가 딱 보니까 이거야. "}<b>${esc(f.headline || "한쪽으로 치우치지 않은 사주")}</b>.<br>${f.coreScene} ${f.strengthScene}<br><br>${why(`네 사주에서 <b>${dom}</b>${f.top ? josa(f.top.god, "이", "가").slice(f.top.god.length) : "이"} 힘의 ${f.top?.share ?? 0}%로 가장 크고, 너 자신(${f.dayPillar}의 ${f.dm})은 ${f.strengthPlain}이라서 그래.`)}<br><br>${use("돈·일·관계·마음 어디서든 이 모습이 먼저 나와. 아래 장마다 이 힘이 각 영역에서 어떻게 보이는지 이어서 볼게.")}`,
        claim:{ section:1,sourceRuleIds:ids(force,pressure,z),newFacts:[textFact("strength",strength.verdict),textFact("pressure",pressure?.facts?.group),textFact("gyeok",z?.gyeokName)],conclusion:`전체 선택을 묶는 핵심은 ${dom}과 ${pressureHuman}의 결합이다.` },
      },
      {
        title:"02 · 계절·뿌리·버티는 힘",
        body:`${STRENGTH_ENDURANCE[f.verdict] || STRENGTH_ENDURANCE.중화}<br><br>${why(`${f.supportPercent !== null ? `너를 돕는 힘과 빠져나가거나 누르는 힘이 ${f.supportPercent} : ${100 - f.supportPercent}야. ` : ""}${f.season} ${f.root}`)}<br><br>${use(f.verdict === "신약" ? "힘들 때 의지부터 탓하지 말고, 지금 일이 네 기본 체력보다 큰지부터 확인해. 한꺼번에 받지 말고 나눠서 받는 게 맞아." : f.verdict === "신강" ? "버티는 힘은 충분하니까, 더 쥐기보다 어디로 빼고 어디서 덜어낼지를 먼저 정해." : "일이 겹치는 시기를 미리 알아두고, 그때만큼은 새 일을 더 받지 마.")}`,
        claim:{ section:2,sourceRuleIds:ids(season,root,party),newFacts:[textFact("deukryeong",season?.facts?.active),textFact("rootQuality",root?.facts?.quality || strength.deukji?.quality),textFact("deukse",party?.facts?.active)],conclusion:"버티는 힘은 계절·뿌리·주변 지원을 분리해서 봐야 한다." },
      },
      {
        title:"03 · 실제 기세의 흐름",
        body:`${f.weakScene || "잘하는 쪽은 저절로 커지는데, 약한 쪽은 일부러 챙기지 않으면 계속 비어 있어."}<br><br>${why(`${f.strongest ? `가장 센 기운은 ${f.strongest.name} ${f.strongest.share}%로, 너한텐 ${f.strongest.groupLabel} 쪽이야. ` : ""}${f.weakest ? `가장 약한 기운은 ${f.weakest.name} ${f.weakest.share}%로, 너한텐 ${f.weakest.groupLabel} 쪽이야.` : ""}`)}<br><br>${use(weakAction ? `${weakAction}. 센 쪽을 더 세게 쓰는 것보다 약한 쪽 한 칸을 채우는 게 결과를 더 크게 바꿔.` : "센 쪽을 더 세게 쓰기보다 중간 과정을 빼먹지 않는 게 중요해.")}`,
        claim:{ section:3,sourceRuleIds:ids(flow,bridge),newFacts:[textFact("strongElement",strongEl),textFact("weakElement",weakEl),textFact("blockedTo",blockedTo),textFact("bridge",bridgeStatus)],conclusion:"강한 힘의 양보다 다음 단계로 이어지는지 여부가 현실 결과를 좌우한다." },
      },
      {
        title:"04 · 중심 구조가 서는 조건과 깨지는 조건",
        body:`${firstSupport && f.fitScene(firstSupport) ? f.fitScene(firstSupport) : "맞는 조건에서는 같은 노력도 훨씬 덜 힘들게 결과가 나와."}${firstHarm ? ` 반대로 ${f.godLabel(firstHarm)} 쪽이 세지는 환경에서는 잘되던 것도 흔들려.` : ""}<br><br>${why(`${f.center || "태어난 달이 이 사주의 중심을 정해."}${f.supportGods.length ? ` 이 중심을 살려주는 짝은 ${f.supportGods.slice(0,3).join("·")}${f.presentGods.includes(firstSupport) ? "" : ""}${f.presentGods.includes(firstSupport) ? `이고, 그중 ${josa(firstSupport, "은", "는")} ${f.godPlaces(firstSupport)}에 있어` : `인데 네 사주엔 뚜렷하지 않아`}.` : ""}${firstHarm ? ` 흔드는 글자는 ${josa(firstHarm, "이고", "고")}${f.presentGods.includes(firstHarm) ? " 네 사주에도 있어" : ", 네 사주엔 없어"}.` : ""}`)}<br><br>${use("일이 꼬일 때는 좋은 걸 더 얹기 전에, 살려주는 조건이 빠졌는지부터 확인해.")}`,
        claim:{ section:4,sourceRuleIds:ids(z,relationFinding),newFacts:[textFact("zipingState",z?.sequenceStatus || z?.state),textFact("supportGods",(z?.supportGods || []).join(",")),textFact("harmGods",(z?.harmGods || []).join(",")),textFact("rescueGods",(z?.rescueGods || []).join(","))],conclusion:"중심 구조는 세우는 힘→깨뜨리는 힘→다시 구하는 힘의 순서로 읽는다." },
      },
      {
        title:"05 · 돈과 현실 결과",
        body:`${moneyScene}<br><br>${why(`${groupLine("wealth")}. ${f.top && f.top.group !== "wealth" ? `그보다 ${f.top.god}(${f.top.share}%)${josa(f.top.god, "이", "가").slice(f.top.god.length)} 더 커서, 돈보다 ${f.top.meaning} 쪽이 먼저 움직여.` : "돈 쪽 힘이 사주에서 가장 큰 편이라, 없어서보다 너무 신경 써서 지치는 쪽이야."}`)}<br><br>${use(`수입·지출·저축을 한 덩어리로 보지 말고 각각 숫자 기준을 정해.${f.balance ? ` 그리고 ${balanceSide}을 보태는 쪽으로 움직이면 균형이 좋아져.` : ""}`)}`,
        claim:{ section:5,sourceRuleIds:ids(pressure,flow,balance,z),newFacts:[textFact("wealthCount",wealth.count),textFact("wealthPlacements",wealth.placements.join(",")),textFact("pressureGroup",pressure?.facts?.group)],conclusion:"돈은 추상적인 돈복보다 자원·가격·성과가 현실 결과로 이어지는 방식으로 판단한다." },
      },
      {
        title:"06 · 일·직업·진로",
        body:`${careerScene}<br><br>${why(`${groupLine("officer")}. ${groupLine("output")}.`)}<br><br>${use(f.shares.officer >= 30 ? "책임이 늘 때 권한·보상도 같이 늘어나는지 꼭 확인해. 역할 기준이 분명한 곳이 너한텐 훨씬 편해." : f.shares.output >= 20 ? "만든 결과가 눈에 보이고 바로 반응이 오는 일에서 강점이 제일 잘 드러나." : "특정 직업명보다, 잘한 게 숫자·평가로 돌아오는 구조인지를 먼저 봐.")}`,
        claim:{ section:6,sourceRuleIds:ids(pressure,flow,force,z),newFacts:[textFact("officerCount",officer.count),textFact("officerPlacements",officer.placements.join(",")),textFact("forceVerdict",strength.verdict)],conclusion:"일은 직업명보다 역할 압력과 평가 구조가 개인의 힘과 맞는지로 판단한다." },
      },
      {
        title:"07 · 연애와 가까운 관계",
        body:`${loveScene}<br><br>${why(`나와 같은 힘(비겁)은 ${f.shares.self || 0}%, 표현·결과물(식상)은 ${f.shares.output || 0}%야.${f.bond ? " " + f.bond : ""}`)}<br><br>${use("상대 마음을 추측하기보다 불편함이 시작된 장면과, 말한 뒤 실제로 달라지는지를 확인해. 특정 사람과의 궁합은 별도 상품에서만 계산해.")}`,
        claim:{ section:7,sourceRuleIds:ids(relationFinding,pressure),newFacts:[textFact("selfGodCount",selfGod.count),textFact("outputCount",outputGod.count),textFact("hasClash",hasClash),textFact("relationKeys",Object.keys(relationRaw).sort().join(","))],conclusion:"가까운 관계는 본인의 기준·표현·충돌 신호만 해석하고 특정 상대 정보는 생성하지 않는다." },
      },
      {
        title:"08 · 사람과 환경",
        body:`${peopleScene}<br><br>${why(`너를 돕는 힘(비겁·인성)은 ${(f.shares.self || 0) + (f.shares.print || 0)}%${f.pressureLabel ? `, 바깥 힘 중에선 ${f.pressureLabel}이 가장 커` : ""}.${f.relationRisk ? " " + f.relationRisk : ""}`)}<br><br>${use((f.shares.self || 0) + (f.shares.print || 0) >= 45 ? "혼자서도 버티는 힘은 있으니, 네 방식을 존중해주는 사람을 곁에 남겨." : "주변 도움을 기본값으로 기대하기보다, 부탁·역할·경계를 말로 분명히 해두는 편이 훨씬 편해.")}`,
        claim:{ section:8,sourceRuleIds:ids(party,root,flow),newFacts:[textFact("partyActive",party?.facts?.active),textFact("rootQuality",root?.facts?.quality),textFact("flowBlocked",!!flow?.facts?.blockedAt)],conclusion:"환경 적합성은 주변 지원·뿌리·흐름이 실제 결과를 돕는지로 판단한다." },
      },
      {
        title:"09 · 마음·스트레스·회복",
        body:`${mentalScene}<br><br>${why(`배움·보호·회복(인성)은 ${f.shares.print || 0}%, 표현·결과물(식상)은 ${f.shares.output || 0}%야. 너 자신은 ${f.strengthPlain}이야.`)}<br><br>${use(`${f.balance ? `${balanceSide}을 채우는 쪽이 회복에 도움이 돼. ` : ""}부담을 한 번에 줄이기보다 하나씩 빼고 달라지는지 봐. 이 장은 질병이나 정신건강 진단을 대신하지 않아.`)}`,
        claim:{ section:9,sourceRuleIds:ids(force,pressure,balance),newFacts:[textFact("printCount",printGod.count),textFact("outputCount",outputGod.count),textFact("strength",strength.verdict)],conclusion:"회복은 진단이 아니라 과부하와 배출·기반의 순서를 조정하는 문제로 해석한다." },
      },
      {
        title:"10 · 가까운 18개월",
        body:`${isT ? "기본 NOTE는 지금 고른 고민에 필요한 달만 골랐다면, 전체판에서는 <b>삶 전체에 영향을 주는 가까운 구간</b>을 본다." : "기본 NOTE에서는 지금 고른 고민에 필요한 달만 봤지. 여기서는 <b>삶 전체에 영향을 주는 가까운 구간</b>까지 같이 볼게."}<br><br>${nearTimelineCopy()}<br><br>${use("같은 달이어도 돈·일·관계 중 실제 반응이 먼저 오는 영역부터 작게 움직이고, 나머지는 그 결과를 본 뒤 따라가.")}`,
        claim:{ section:10,sourceRuleIds:timingRuleIds(nearHighlights),newFacts:nearHighlights.slice(0,3).map((x) => textFact("near",`${x.startYmd}:${x.class}`)),conclusion:"가까운 시기는 특정 고민 하나가 아니라 한 사람 전체판의 동시 반응 가능성을 기준으로 사용한다." },
      },
      {
        title:"11 · 앞으로 5년",
        body:`${isT ? "기본 NOTE에서 공개하지 않은 연도별 흐름이야. 해마다 방향·이유·할 일까지 본다." : "기본 NOTE에서는 다 보여주지 않았던 연도별 흐름도 여기서는 이어서 볼게. 해마다 좋다/나쁘다로 끝내지 않고 이유와 할 일까지 같이 볼게."}<br><br>${yearTimelineCopy()}<br><br>${use("좋은 해에는 준비한 걸 실제로 확정하고, 조심할 해에는 범위를 줄이는 식으로 5년을 나눠 써.")}`,
        claim:{ section:11,sourceRuleIds:timingRuleIds(years),newFacts:years.slice(0,6).map((x) => textFact("year",`${x.year}:${x.class}`)),conclusion:"5년 흐름은 각 연도의 방향·발화 근거·활용 또는 주의 행동까지 묶어서 공개한다." },
      },
      {
        title:"12 · 큰 흐름 전환 + 평생 사용법",
        body:`${label("큰 흐름부터 보면", "큰 흐름부터 보면")}${daeunCopy()}<br><br><b>${isT ? "평생 활용 기준" : "언니가 마지막으로 남길 기준"}</b><br><b>1.</b> ${f.top ? `${f.top.god}(${f.top.meaning}) 쪽 일이 몰릴수록, 네 기본 체력보다 큰 일인지 먼저 확인해.` : "일이 몰릴수록 네 기본 체력보다 큰 일인지 먼저 확인해."}<br><b>2.</b> ${weakAction ? `${weakAction}. 제일 약한 한 칸을 채우는 게 제일 크게 바뀌어.` : "중간 과정을 빼먹지 마."}<br><b>3.</b> ${f.balance ? `${f.balance.name} 기운을 보태는 사람·환경·습관을 곁에 둬.` : "좋은 시기에도 작게 확인하고 확정하는 순서를 지켜."}<br><br>이 세 가지는 돈·일·관계·마음이 달라져도 같은 사주에서 반복해서 남는 사용법이야.`,
        claim:{ section:12,sourceRuleIds:uniq([...timingRuleIds(years),...ids(pressure,flow,bridge,balance)]),newFacts:[textFact("daeunPeriods",daeunPeriods.map((x) => `${x.startYear}-${x.endYear}:${x.ganZhi}`).join("|")),textFact("prescription",actions.join("→"))],conclusion:"현재 큰 흐름과 다음 전환을 평생 반복되는 행동 순서에 연결한다." },
      },
    ];
    return sections;
  }

  // 여러 고민을 이어 보여줄 때 NOTE1의 같은 첫 장면이 반복되지 않게, 두 번째부터는 한 줄로 줄인다.
  function shortenCoreDesc(desc, headline, isT) {
    const parts = String(desc || "").split("<br><br>");
    if (parts.length < 3 || !/^<b>결론<\/b>/.test(parts[0]) || !/^<b>(왜 그러냐면|근거)<\/b>/.test(parts[1])) return desc;
    const line = isT
      ? `<b>결론</b> — 앞에서 본 기본 성향(<b>${esc(headline)}</b>)이 이 고민에도 그대로 적용돼.`
      : `<b>결론</b> — 앞에서 본 그 모습(<b>${esc(headline)}</b>)이 이 고민에서도 똑같이 먼저 나와.`;
    return [line, ...parts.slice(2)].join("<br><br>");
  }

  function noteCards(notes, shortCore) {
    return (notes || []).map((n, i) => ({ ...n, desc: shortCore && i === 0 ? shortenCoreDesc(n.desc, shortCore.headline, shortCore.isT) : n.desc })).map((n) => `<article style="padding:16px 0;border-bottom:1px solid #eef2f7"><div style="font-size:11px;font-weight:900;color:#f43f5e;margin-bottom:7px">${esc(n.badge || n.themeNum || "NOTE")}</div><h4 style="font-size:16px;font-weight:900;line-height:1.45;margin:0 0 9px">${n.title || ""}</h4><div style="font-size:13px;line-height:1.8;color:#475569">${n.desc || ""}</div>${n.checklist ? `<div style="margin-top:11px;padding:10px 12px;border-radius:12px;background:#f8fafc;font-size:12px;line-height:1.6;color:#334155"><b>이번에 해볼 것</b><br>${esc(n.checklist)}</div>` : ""}</article>`).join("");
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
    const facts = chartFacts(data);
    const sharedFp = firstR?.structureFingerprint || "";
    const commonLine = facts?.top
      ? `세 고민 모두 같은 사주라서 먼저 나오는 모습도 같아. 너는 <b>${esc(facts.headline)}</b>야 — ${esc(facts.top.god)}(${esc(facts.top.meaning)})${josa(facts.top.god, "이", "가").slice(facts.top.god.length)} 힘의 ${facts.top.share}%로 가장 커서, 어느 고민에서든 이 모습이 먼저 튀어나와.`
      : "세 고민 모두 같은 사주라서 먼저 나오는 모습도 같아.";
    const shared = runs.length
      ? `<div data-product-exclusive="concern_bundle3" data-product-contract="concern_bundle3" data-structure-fingerprint="${esc(sharedFp)}" style="padding:14px 15px;border-radius:16px;background:#f8fafc;border:1px solid #e2e8f0;margin-bottom:18px;font-size:12.5px;line-height:1.8;color:#475569"><b>세 고민을 같이 보면 보이는 공통축</b><br>${commonLine} 아래에서는 이 같은 모습이 고민마다 어떻게 다르게 나타나는지 각각 깊게 풀어.</div>`
      : "";
    const shortCore = facts?.headline ? { headline:facts.headline, isT:mode === "T" } : null;
    const body = runs.map(({key,concernSituation,notes}, idx) => {
      const situLabel = situationLabel(key, concernSituation);
      return `<section data-export-kind="concern" data-concern="${esc(key)}" data-concern-situation="${esc(concernSituation)}" style="margin-bottom:26px"><h3 style="font-size:19px;font-weight:950;margin:0 0 5px">${esc(CONCERNS[key] || key)}</h3>${situLabel ? `<div style="font-size:11px;font-weight:850;color:#f43f5e;margin-bottom:10px">지금 상황 · ${esc(situLabel)}</div>` : ""}${noteCards(notes, idx > 0 ? shortCore : null)}</section>`;
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
    const facts = chartFacts(data);
    const commonPressure = facts?.top ? `${facts.top.god}(${facts.top.meaning})` : "여러 조건이 한꺼번에 들어오는 부담";
    const pivots = baseReasoning?.timing?.longTermPivots || [];
    const pivotText = pivots.length ? pivots.map((x) => `${x.year}년`).join(" · ") : "강한 장기 변곡점 없음";
    const firstAction = facts?.weakest ? `제일 약한 ${facts.weakest.groupMeaning} 쪽 한 칸부터 채워` : "지금 부담 하나를 줄이고 실제 반응을 확인해";
    const secondAction = facts?.balance ? `${facts.balance.name} 기운(너한텐 ${facts.groupMeaning(facts.balance.group)} 쪽)을 보태는 사람·환경·습관을 곁에 둬` : "확인된 선택만 다음 단계로 확정해";
    const domains = Object.keys(CONCERNS).map((key) => CONCERNS[key]).join(" · ");

    const crossDomain = `<div data-product-exclusive="all_in_one" data-product-contract="all_in_one" data-structure-fingerprint="${esc(baseReasoning?.structureFingerprint || "")}" style="padding:15px;border-radius:18px;background:#fff1f2;border:1px solid #fecdd3;margin:22px 0;font-size:12.5px;line-height:1.85;color:#881337"><b>6개 고민을 가로지르는 공통 구조</b><br>${domains}. 이 6개 고민은 서로 다른 문제처럼 보여도, 네 사주에서 가장 큰 <b>${esc(commonPressure)}</b> 쪽 일이 몰릴 때 비슷한 모습이 반복돼. 완전판에서는 이 같은 모습이 각 고민에서 어떻게 다르게 나타나는지 나란히 비교해.<br><span style="font-size:10.5px;color:#be123c">이 완전판은 나 한 사람 전체 분석이야. 두 사람 궁합은 포함하지 않아.</span></div>`;

    const simultaneous = `<div data-product-exclusive="all_in_one-timing" style="padding:15px;border-radius:18px;background:#f8fafc;border:1px solid #e2e8f0;margin:14px 0;font-size:12.5px;line-height:1.85;color:#334155"><b>여러 영역이 같이 움직이는 시점</b><br>${pivots.length ? `현재 5년 계산에서 공통으로 강하게 잡힌 변곡점은 <b>${esc(pivotText)}</b>이야. 같은 시기라도 돈은 조건 조정, 일은 역할 선택, 관계는 거리·약속 조정처럼 적용 방식이 달라져. 그래서 한 영역의 변화만 보고 인생 전체가 좋아지거나 나빠진다고 단정하지 않아.` : "5년 안에서 여러 영역을 동시에 크게 흔드는 강한 변곡점이 따로 잡히지 않아. 없는 변곡점을 만들지 않고 각 고민의 가까운 시기를 따로 쓰는 편이 맞아."}</div>`;

    const strategy = `<div data-product-exclusive="all_in_one-strategy" style="padding:15px;border-radius:18px;background:#fff7ed;border:1px solid #fed7aa;margin:14px 0 22px;font-size:12.5px;line-height:1.85;color:#7c2d12"><b>마지막 종합 행동 전략</b><br><b>1.</b> 먼저 ${esc(firstAction)}.<br><b>2.</b> 그다음 ${esc(secondAction)}.<br><b>3.</b> 좋은 시기에도 6개 영역을 한꺼번에 바꾸지 말고 실제 반응이 먼저 오는 영역부터 확정해.<br>이건 새로운 판단을 덧붙인 게 아니라, 같은 사주 판단에서 나온 행동 순서를 6개 고민에 공통으로 적용한 거야.</div>`;

    const all = allRuns.map(({key,concernSituation,notes}) => {
      const situLabel = situationLabel(key, concernSituation);
      return `<section data-export-kind="concern" data-concern="${esc(key)}" data-concern-situation="${esc(concernSituation)}" style="margin:26px 0"><h3 style="font-size:19px;font-weight:950;margin:0 0 5px">${esc(CONCERNS[key])}</h3>${situLabel ? `<div style="font-size:11px;font-weight:850;color:#f43f5e;margin-bottom:10px">지금 상황 · ${esc(situLabel)}</div>` : ""}${noteCards(notes, facts?.headline ? { headline:facts.headline, isT:mode === "T" } : null)}</section>`;
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

  // 궁합 장면 문장: 각자 사주에서 가장 큰 힘(십신 그룹)으로 고른다.
  const LOVE_SCENE = {
    officer: "좋아하면 약속을 잘 지키고 챙겨주는 걸로 마음을 보여줘. 대신 서운한 건 바로 말 안 하고 참다가 한 번에 쌓여 나와.",
    wealth: "좋아하면 시간·돈·배려를 실제 행동으로 많이 써. 대신 주고받는 게 기울면 속으로 계산이 시작돼.",
    output: "좋아하면 말과 표현이 먼저 나와. 대신 상대 반응이 미지근하면 온도 차이를 크게 느껴.",
    print: "좋아해도 바로 다가가기보다 상대를 오래 살피고 확인한 뒤에 마음을 열어. 애매한 반응엔 혼자 해석하는 시간이 길어져.",
    self: "좋아해도 자기 페이스와 기준은 지키려고 해. 다 맞춰주기보다 ‘나는 나대로’가 편한 쪽이야.",
  };
  // 같은 그룹이어도 가장 큰 십신이 다르면 장면이 달라지도록 한 줄씩 더 붙인다.
  const LOVE_TWIST = {
    비견: "연인이어도 친구처럼 대등할 때 제일 편해해.",
    겁재: "관계에서도 지기 싫은 마음이 있어서, 서운하면 오히려 더 세게 굴 때가 있어.",
    식신: "같이 맛있는 거 먹고 편하게 노는 시간에서 사랑을 제일 크게 느껴.",
    상관: "마음에 안 드는 건 참기보다 바로 짚고 넘어가려고 해.",
    편재: "이벤트나 깜짝 선물처럼 크게 한 번에 마음을 쓰는 편이야.",
    정재: "기념일·연락 같은 작은 약속을 꾸준히 지키는 게 사랑이라고 생각해.",
    편관: "힘든 티를 잘 안 내고, 관계 안의 문제도 혼자 짊어지려고 해.",
    정관: "관계에서도 ‘제대로 된 사람’으로 보이고 싶은 마음이 커서 선을 잘 지켜.",
    편인: "말로 다 설명하기보다 혼자 생각을 정리한 뒤에 마음을 보여줘.",
    정인: "챙김받고 보살핌받을 때 마음이 제일 크게 열려.",
  };
  const TALK_NEED = {
    officer: "약속과 역할을 분명히 말해주는 것",
    wealth: "막연한 말보다 현실적인 계획을 같이 짜는 것",
    output: "생각을 바로 말해도 받아주는 것",
    print: "대답하기 전에 생각할 시간을 주는 것",
    self: "자기 방식을 존중받는 것",
  };
  // "~ 편이야", "~ 버릇"에 그대로 붙는 형태로 쓴다.
  const FIGHT_HABIT = {
    officer: "참고 맞춰주다가 한 번에 터지는",
    wealth: "서운함을 누가 더 했나 따지듯 말하는",
    output: "말이 먼저 세게 나가는",
    print: "말 안 하고 혼자 곱씹는",
    self: "누가 맞나 고집 싸움으로 끌고 가는",
  };
  const LIFE_RHYTHM = {
    officer: "할 일을 먼저 끝내고 쉬는 리듬",
    wealth: "계획한 대로 시간과 돈을 쓰는 리듬",
    output: "하고 싶은 걸 그때그때 해보는 리듬",
    print: "혼자 조용히 충전하는 시간이 있는 리듬",
    self: "내 일정은 내가 정하는 리듬",
  };
  const LOVE_SIGN = {
    officer: "약속 지키기·챙겨주기",
    wealth: "시간과 돈을 실제로 쓰기",
    output: "말로 표현해주기",
    print: "곁에 있어주고 들어주기",
    self: "각자 공간을 존중해주기",
  };

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
    const nameIs = esc(josa(pName, "은", "는"));
    const nameGa = esc(josa(pName, "이", "가"));
    const a = elementOf(data);
    const b = elementOf(partner);
    const myP = getProfile(data);
    const partnerP = getProfile(partner);
    const myR = getReasoning(data);
    const partnerR = getReasoning(partner);
    const me = chartFacts(data);
    const you = chartFacts(partner);
    const overlay = typeof global.buildCompatibilityOverlayV1 === "function"
      ? global.buildCompatibilityOverlayV1(data, partner)
      : null;

    if (!myP || !partnerP || !myR || !partnerR || !overlay || !me || !you) {
      return `<p data-content-blocked="compatibility" style="font-size:13px;line-height:1.8;color:#475569">두 사람의 사주 정보를 충분히 읽지 못했어. 상대 사주까지 계산돼야 둘 사이 결과를 만들 수 있어.</p>`;
    }

    const relation = relationCopy(a, b, isT);
    const myG = me.top?.group || "self";
    const yourG = you.top?.group || "self";
    const myType = me.headline || "한쪽으로 치우치지 않은 사주";
    const yourType = you.headline || "한쪽으로 치우치지 않은 사주";
    const myWho = `${me.dm}(${me.dayElementPlain})`;
    const yourWho = `${you.dm}(${you.dayElementPlain})`;
    const why = (text) => `<br><br><b>${isT ? "근거" : "왜 그러냐면"}</b> · ${text}`;
    const same = myG === yourG;
    // 둘이 같은 유형이면 "너는 A, 상대는 A" 대신 "둘 다 A"로 쓴다.
    const pair = (table, tail) => same
      ? `둘 다 <b>${table[myG]}</b>${tail}`
      : `너는 <b>${table[myG]}</b>, ${nameIs} <b>${table[yourG]}</b>${tail}`;

    const dayRelations = overlay.dayBranchRelations || [];
    const directPairRelation = dayRelations.find(x=>x.type==="clash")
      || dayRelations.find(x=>x.type==="combine")
      || dayRelations.find(x=>["harm","break","punishment"].includes(x.type))
      || null;
    const directPairCopy = directPairRelation?.type === "clash"
      ? "둘의 일주 아랫글자(가장 가까운 관계 자리)가 정면으로 부딪히는 관계(충)라, 좋아하는 마음과 별개로 감정이 커진 순간엔 서로를 밀어내듯 반응할 수 있어."
      : directPairRelation?.type === "combine"
        ? "둘의 일주 아랫글자(가장 가까운 관계 자리)가 서로 묶이는 관계(합)라, 서로를 금방 의식하고 끌리기 쉬워. 그렇다고 무조건 잘 맞는다는 뜻은 아니야."
        : directPairRelation
          ? "둘의 일주 아랫글자(가장 가까운 관계 자리)에 작은 마찰 신호가 있어. 이것만으로 나쁘다고 보진 않고, 실제로 반복되는 장면을 같이 봐야 해."
          : "둘의 일주 아랫글자(가장 가까운 관계 자리)끼리 바로 부딪히거나 묶이는 신호는 두드러지지 않아. 그래서 차이는 각자 힘을 쓰는 방식에서 더 선명하게 보여.";

    const complement = overlay.complement || {};
    const complementCopy = complement.aStrongSupportsB && complement.bStrongSupportsA
      ? "서로 센 기운이 상대에게 부족한 쪽을 채워주는 부분이 양쪽 다 있어. 잘 쓰면 ‘내가 없는 걸 저 사람이 채워준다’는 느낌이 들어."
      : complement.aStrongSupportsB || complement.bStrongSupportsA
        ? "한 사람의 센 기운이 다른 사람에게 부족한 쪽을 채워주는 부분이 있어. 그래서 한쪽이 자연스럽게 끌어주거나 정리해주는 장면이 생겨."
        : "서로 센 기운이 상대의 부족한 쪽을 바로 채워주는 조합은 아니야. 그래서 ‘알아서 채워주겠지’보다 필요한 걸 직접 말해주는 게 더 중요해.";

    const intro = isT
      ? `궁합은 ‘좋다/나쁘다’ 한 줄로 끝내면 쓸모가 없어. 너와 ${safeName}의 사주를 따로 본 다음, 실제 관계에서 어디가 맞고 어디서 충돌하는지 처음부터 오래 가는 방식까지 나눠서 볼게.`
      : `궁합은 그냥 “둘이 잘 맞아” 한마디 듣고 끝내면 너무 아깝잖아. 언니가 너랑 ${safeName} 사주를 따로 펼쳐놓고, 왜 끌리고 어디서 서운해지고 어떻게 해야 오래 편한지까지 관계 흐름대로 차근차근 풀어줄게.`;

    const sameVerdict = me.verdict === you.verdict;
    const strengthLine = (f) => f.verdict === "신약" ? "겉으론 괜찮아 보여도 혼자 있을 때 확 지치는 날이 있는 쪽이야" : f.verdict === "신강" ? "한번 정하면 잘 안 꺾이는 쪽이야" : "컨디션 따라 여유가 꽤 달라지는 쪽이야";

    const cards = [
      {
        title: "01 · 둘 사이를 한 문장으로 보면",
        body: `너는 <b>${esc(myType)}</b>, ${nameIs} <b>${esc(yourType)}</b>야. ${directPairCopy}${why(`너는 ${me.dayPillar}의 ${myWho}, ${nameIs} ${you.dayPillar}의 ${yourWho}야. ${relation}`)}`
      },
      {
        title: "02 · 서로에게 먼저 보이는 강점",
        body: `${complementCopy}${why(`${me.strongest ? `너는 ${me.strongest.name} 기운이 ${me.strongest.share}%로 가장 세고` : "너는 기운이 고르게 나뉘어 있고"}, ${you.strongest ? `${nameIs} ${you.strongest.name} 기운이 ${you.strongest.share}%로 가장 세.` : "상대는 기운이 고르게 나뉘어 있어."}`)}`
      },
      {
        title: "03 · 내가 사랑할 때 나오는 모습",
        body: `${LOVE_SCENE[myG]} ${LOVE_TWIST[me.top?.god] || ""} 그리고 ${strengthLine(me)}.${why(`네 사주에서 ${me.top ? `${me.top.god}(${me.top.meaning})${josa(me.top.god, "이", "가").slice(me.top.god.length)}` : "한 가지 힘이"} ${me.top?.share ?? 0}%로 가장 커서 그래.`)}`
      },
      {
        title: `04 · ${safeName}${josa(pName, "이", "가").slice(pName.length)} 사랑할 때 나오는 모습`,
        body: `${same ? `${nameIs} 사랑하는 방식이 너랑 꽤 닮았어. 다만` : `${nameIs} ${LOVE_SCENE[yourG]}`} ${LOVE_TWIST[you.top?.god] || ""} ${sameVerdict ? "지치는 방식도 너랑 비슷한 편이야." : `그리고 ${strengthLine(you)}.`} 네가 기대한 표현이 아니어도, 저 사람 나름의 사랑 방식일 수 있어.${why(`${esc(josa(pName, "의", "의"))} 사주에서 ${you.top ? `${you.top.god}(${you.top.meaning})${josa(you.top.god, "이", "가").slice(you.top.god.length)}` : "한 가지 힘이"} ${you.top?.share ?? 0}%로 가장 커서 그래.`)}`
      },
      {
        title: "05 · 말이 잘 통할 때와 엇갈릴 때",
        body: `대화가 잘 풀리는 건 각자 필요한 걸 먼저 말해줄 때야. ${pair(TALK_NEED, "이 필요해.")} ${same ? "필요한 게 비슷해서 한번 맞추면 금방 편해져." : "필요한 게 달라서, 말 안 하면 서로 엉뚱한 걸 해주고 서운해하기 쉬워."}${why(`너는 ${me.top ? me.top.god : "고른 힘"}, ${nameIs} ${josa(you.top ? you.top.god : "고른 힘", "이", "가")} 가장 큰 사주야.`)}`
      },
      {
        title: "06 · 서로 부담이 커질 수 있는 포인트",
        body: `${me.weakScene ? `너: ${me.weakScene}` : ""}${you.weakest?.groupMeaning ? `<br>${safeName}: ${esc(you.weakest.groupMeaning)} 쪽이 약해서, 그 부분은 자꾸 미루거나 버거워할 수 있어.` : ""}<br>이 약한 부분이 동시에 필요한 상황이 오면 “왜 저래?” 하기 전에 지금 뭐가 비었는지 먼저 확인해.${why(`${me.weakest ? `너는 ${me.weakest.name} 기운이 ${me.weakest.share}%` : ""}${you.weakest ? `, ${nameIs} ${you.weakest.name} 기운이 ${you.weakest.share}%로 가장 약해.` : "."}`)}`
      },
      {
        title: "07 · 갈등이 생겼을 때 확인할 신호",
        body: `싸울 때 ${same ? `둘 다 <b>${FIGHT_HABIT[myG]}</b> 편이야.` : `너는 <b>${FIGHT_HABIT[myG]}</b> 편이고, ${nameIs} <b>${FIGHT_HABIT[yourG]}</b> 편이야.`} ${same ? "둘 다 같은 방식이라, 한 사람이 먼저 멈추는 규칙을 정해두는 게 제일 중요해." : "이 둘이 겹치는 순간이 제일 위험해."}${why(`${me.hasClash && you.hasClash ? "둘 다 각자 사주 안에 정면으로 부딪히는 관계(충)가 있어." : me.hasClash ? "네 사주 안에 정면으로 부딪히는 관계(충)가 있어." : you.hasClash ? `${esc(josa(pName, "의", "의"))} 사주 안에 정면으로 부딪히는 관계(충)가 있어.` : "둘 다 사주 안에 정면으로 부딪히는 관계(충)는 두드러지지 않아."} 싸우는 방식은 각자 가장 큰 힘(${me.top?.god || "-"} / ${you.top?.god || "-"})에서 나와.`)}`
      },
      {
        title: "08 · 싸운 뒤 화해하는 법",
        body: `화해할 때 “미안해, 됐지?”로 빨리 덮기보다 서로 뭐가 아팠는지 한 번은 확인해줘. ${same ? `둘 다 <b>${TALK_NEED[myG]}</b>이 화해의 열쇠야.` : `너한테는 <b>${TALK_NEED[myG]}</b>, ${esc(josa(pName, "에게는", "에게는"))} <b>${TALK_NEED[yourG]}</b>이 화해의 열쇠야.`} 사과보다 다음번에 달라지는 행동이 더 안심시켜줘.`
      },
      {
        title: "09 · 애정 표현이 어긋나는 순간",
        body: `${same ? `둘 다 <b>${LOVE_SIGN[myG]}</b>로 사랑을 보여줘.` : `너는 <b>${LOVE_SIGN[myG]}</b>로 사랑을 보여주고, ${nameIs} <b>${LOVE_SIGN[yourG]}</b>로 보여줘.`} ${same ? "표현 방식이 비슷해서 서로 알아보기 쉬운 편이야." : "방식이 달라서, 서로 사랑을 줘도 상대는 못 알아챌 수 있어. “난 이렇게 해줄 때 사랑받는 느낌이야”를 구체적으로 말해줘."}`
      },
      {
        title: "10 · 연락과 혼자 있는 시간",
        body: `${sameVerdict ? (me.verdict === "신강" ? "둘 다 혼자 있는 시간이 있어야 다시 충전돼." : "둘 다 자주 확인받을 때 마음이 놓이는 편이야.") : `${me.verdict === "신강" ? "너는 혼자 있는 시간이 있어야 다시 충전돼." : "너는 자주 확인받을 때 마음이 놓이는 편이야."} ${you.verdict === "신강" ? `${nameIs} 혼자 있는 시간이 있어야 다시 충전돼.` : `${nameIs} 자주 확인받을 때 마음이 놓이는 편이야.`}`} 연락 횟수를 사랑의 점수로 쓰지 말고, 각자 편한 리듬을 먼저 말해두자.${why(sameVerdict ? `둘 다 자기 힘(일간)이 ${me.strengthPlain}이야.` : `너 자신의 힘은 ${me.strengthPlain}, ${esc(josa(pName, "의", "의"))} 힘은 ${you.strengthPlain}이야.`)}`
      },
      {
        title: "11 · 일상에서 같이 살기 편하려면",
        body: `좋아하는 마음이 커도 생활 리듬이 계속 안 맞으면 사소한 일로 지치기 쉬워. 약속시간, 쉬는 방식, 집안일, 주말 계획 같은 건 “사랑하면 알아서 맞겠지” 하지 말고 둘만의 기준을 만들어두는 게 훨씬 편해.${same ? ` 특히 둘 다 <b>${LIFE_RHYTHM[myG]}</b>이 편해서, 이 부분은 쉽게 맞아.` : ` 특히 너는 <b>${LIFE_RHYTHM[myG]}</b>, ${nameIs} <b>${LIFE_RHYTHM[yourG]}</b>이 편해. 이 차이를 미리 알면 덜 부딪혀.`}`
      },
      {
        title: "12 · 돈과 현실 문제를 같이 다룰 때",
        body: `${(me.shares.wealth || 0) >= (you.shares.wealth || 0) ? `둘 중엔 네가 돈·현실 계산을 더 많이 신경 쓰는 쪽이야.` : `둘 중엔 ${nameGa} 돈·현실 계산을 더 많이 신경 쓰는 쪽이야.`} 데이트비, 선물, 여행, 큰 지출은 눈치 보지 말고 미리 얘기하는 게 오히려 덜 상처받아.${why(`돈을 뜻하는 재성이 너는 ${me.shares.wealth || 0}%, ${nameIs} ${you.shares.wealth || 0}%야.`)}`
      },
      {
        title: "13 · 질투·경계·사생활",
        body: `사랑하면 다 보여줘야 한다거나, 믿으면 아무 말도 하면 안 된다는 식으로 극단적으로 가지 않았으면 좋겠어. 친구, 전 연인, SNS, 개인시간처럼 민감한 부분은 “난 여기까지는 괜찮고 여기부터는 불편해”라고 말해도 돼.${myG === "self" || yourG === "self" ? " 특히 둘 중 자기 공간이 중요한 사람이 있어서, 경계를 존중해주는 게 곧 애정이야." : " 경계를 말하는 건 상대를 못 믿는다는 뜻이 아니야."}`
      },
      {
        title: "14 · 오래 만날수록 좋아지는 부분",
        body: `${me.strongest && you.strongest && me.strongest.el !== you.strongest.el ? `둘이 센 기운이 달라서, 역할을 나누면 같이 있을수록 편해져. 너는 ${me.strongest.name} 기운이, ${nameIs} ${you.strongest.name} 기운이 가장 세서 서로 다른 쪽을 맡을 수 있어.` : "둘이 잘하는 쪽이 비슷해서, 같은 목표를 잡으면 호흡이 잘 맞아. 대신 같은 약점도 공유하니까 그 부분은 밖에서 채워."}`
      },
      {
        title: "15 · 이 관계에서 꼭 조심할 신호",
        body: `언니가 이 관계에서 제일 조심하라고 하고 싶은 건 세 가지야. 마음을 말하지 않고 상대가 알아채나 시험하는 것, 내 방식만 사랑의 정답이라고 생각하는 것, 그리고 ${same ? `둘 다 가진 ‘<b>${FIGHT_HABIT[myG]}</b> 버릇’이 한꺼번에 나오는 것.` : `너의 ‘<b>${FIGHT_HABIT[myG]}</b> 버릇’과 ${esc(josa(pName, "의", "의"))} ‘<b>${FIGHT_HABIT[yourG]}</b> 버릇’이 한꺼번에 나오는 것.`} 이게 반복되면 원래 잘 맞는 부분도 점점 안 보이게 돼.`
      },
      {
        title: "16 · 둘이 실제로 지키면 좋은 약속",
        body: isT
          ? `<b>1.</b> 서운함은 너무 오래 묵히지 말고 말하기.<br><b>2.</b> 싸울 때 관계 전체를 평가하지 않기.<br><b>3.</b> 연락·돈·개인시간 기준을 미리 합의하기.<br><b>4.</b> ${same ? `둘 다 ${TALK_NEED[myG]}을 존중받기.` : `너는 ${TALK_NEED[myG]}, ${nameIs} ${TALK_NEED[yourG]}을 존중받기.`}<br><b>5.</b> 같은 싸움이 반복되면 감정보다 둘의 규칙을 먼저 바꾸기.`
          : `언니가 마지막으로 둘한테 약속 다섯 개만 남겨줄게.<br><br><b>1.</b> 서운한 건 너무 오래 묵히지 않기.<br><b>2.</b> 싸운 날 “우리 원래 안 맞아”까지 가지 않기.<br><b>3.</b> 연락·돈·혼자 있는 시간은 미리 기준 맞추기.<br><b>4.</b> ${same ? `둘 다 필요한 <b>${TALK_NEED[myG]}</b>을 서로 챙겨주기.` : `너한테 필요한 <b>${TALK_NEED[myG]}</b>과 ${esc(josa(pName, "에게", "에게"))} 필요한 <b>${TALK_NEED[yourG]}</b>을 서로 존중하기.`}<br><b>5.</b> 같은 싸움이 반복되면 사랑을 의심하기 전에 둘의 방식부터 바꿔보기.<br><br>궁합은 둘 사이를 결정하는 판정표라기보다, 잘 맞는 부분은 더 잘 쓰고 부딪히는 부분은 덜 다치게 만드는 지도처럼 봐주면 돼.`
      },
    ];

    const pairTimeline = overlay.compatibilityTimeline || { nearMonths:[], years:[] };
    const interestingMonths = (pairTimeline.nearMonths || []).filter(x=>x.pairClass!=="neutral").slice(0,3);
    const interestingYears = (pairTimeline.years || []).filter(x=>x.pairClass!=="neutral").slice(0,5);
    const pairClassCopy = (row) => {
      if (row.pairClass === "aligned-support") return "둘 다 여유가 생겨서 같이 뭔가 시작하기 좋은 때";
      if (row.pairClass === "shared-caution") return "둘 다 여유가 줄어서 싸움 관리가 먼저인 때";
      if (row.pairClass === "asymmetric") return "한 사람은 잘 풀리고 한 사람은 버거워서 속도를 맞춰야 하는 때";
      if (row.pairClass === "one-side-support") return "한 사람의 여유가 관계를 받쳐줄 수 있는 때";
      if (row.pairClass === "one-side-caution") return "한 사람이 힘든 걸 다른 사람이 오해하지 않게 확인할 때";
      return "좋은 것과 부담이 섞여 있어서 한쪽으로 결론 내지 않을 때";
    };
    const pairTimingBody = `
      <div data-export-compat-timing="1" data-product-exclusive="compatibility" data-product-contract="compatibility" data-overlay-fingerprint="${esc(overlay.fingerprint)}" style="padding:14px 15px;border-radius:16px;background:#f8fafc;border:1px solid #e2e8f0;margin:14px 0 6px;font-size:12.5px;line-height:1.8;color:#475569">
        <b>둘이 같이 있을 때의 시기 흐름</b><br>
        ${interestingMonths.length ? interestingMonths.map(x=>`<span><b>${esc(me.formatMonth(x))}</b> · ${esc(pairClassCopy(x))}</span>`).join("<br>") : "가까운 18개월에는 둘 사이에서 한쪽으로 강하게 기운 달을 억지로 만들지 않았어."}
        <br><br><b>연도 단위 관계 흐름</b><br>
        ${interestingYears.length ? interestingYears.map(x=>`<span><b>${x.year}년</b> · ${esc(pairClassCopy(x))}</span>`).join("<br>") : "5년 안에서 둘의 흐름이 동시에 크게 꺾이는 해는 따로 잡지 않았어."}
      </div>`;
    const summary = `<div data-export-intro="compat" data-product-contract="compatibility" data-person-a-fingerprint="${esc(overlay.personAFingerprint)}" data-person-b-fingerprint="${esc(overlay.personBFingerprint)}" style="padding:15px;border-radius:18px;background:#fff7ed;border:1px solid #fed7aa;margin-bottom:10px"><div style="font-size:11px;font-weight:900;color:#c2410c;margin-bottom:6px">우리 둘 관계를 깊게 보는 궁합</div><div style="font-size:13px;line-height:1.85;color:#7c2d12">${intro}</div></div>`;
    const pairCard = `<div data-export-pair="compat" style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:10px 0 6px"><div style="padding:12px;border-radius:14px;background:#fff;border:1px solid #e2e8f0"><div style="font-size:10px;font-weight:900;color:#94a3b8">나 · ${esc(myWho)}</div><div style="font-size:12px;font-weight:900;color:#0f172a;margin-top:4px">${esc(myType)}</div></div><div style="padding:12px;border-radius:14px;background:#fff;border:1px solid #e2e8f0"><div style="font-size:10px;font-weight:900;color:#94a3b8">${safeName} · ${esc(yourWho)}</div><div style="font-size:12px;font-weight:900;color:#0f172a;margin-top:4px">${esc(yourType)}</div></div></div>`;
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
          <div style="font-size:11px;font-weight:900;color:#334155;margin-bottom:7px">상대가 태어난 시간</div>
          <div id="partnerTimeBranchWrap"><select id="partnerTimeBranch" style="width:100%;padding:10px 9px;border:1px solid #cbd5e1;border-radius:10px;background:white;font-size:11px;font-weight:750;color:#475569"><option value="unknown" selected>(모름)</option>${branchOpts}</select></div>
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
      const branch = root.querySelector("#partnerTimeBranch")?.value || "unknown";
      const tRaw = /^[子丑寅卯辰巳午未申酉戌亥]$/.test(branch) ? branch : "unknown";
      const calendar = root.querySelector("#partnerCalendar")?.value || "solar";
      const leap = calendar === "lunar" && !!root.querySelector("#partnerLeapMonth")?.checked;
      return { partner: { n: root.querySelector("#partnerName")?.value.trim() || "상대", b, t: tRaw, g: root.querySelector("#partnerGender")?.value || "female", c: calendar, l: leap } };
    }
    return {};
  }

  function compactGrantKey(value) {
    let h = 2166136261;
    const text = String(value || "");
    for (let i = 0; i < text.length; i++) {
      h ^= text.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return (h >>> 0).toString(36);
  }

  function ownerSubjectFromGrantUserKey(userKey) {
    if (typeof userKey !== "string" || !userKey.startsWith("sazu_v2_")) return "";
    const raw = userKey.slice("sazu_v2_".length);
    let depth = 0, inString = false, escaped = false, end = -1;
    for (let i = 0; i < raw.length; i++) {
      const ch = raw[i];
      if (inString) {
        if (escaped) escaped = false;
        else if (ch === "\\") escaped = true;
        else if (ch === '"') inString = false;
        continue;
      }
      if (ch === '"') { inString = true; continue; }
      if (ch === "[") depth++;
      else if (ch === "]") {
        depth--;
        if (depth === 0) { end = i + 1; break; }
      }
    }
    if (end < 0) return "";
    try {
      const row = JSON.parse(raw.slice(0,end));
      return Array.isArray(row) && row.length >= 6 ? JSON.stringify(row.slice(0,6)) : "";
    } catch (_) { return ""; }
  }

  function grantStoreKey(data, productId, grant = null) {
    let base = "";
    try { base = typeof getUserUniqueKey === "function" ? getUserUniqueKey(data) : JSON.stringify([data?.userBirthStr, data?.userTimeKey, data?.userGender]); }
    catch (_) { base = JSON.stringify([data?.userBirthStr, data?.userTimeKey]); }
    const pairSuffix = productId === "compatibility" && grant?.userKey
      ? "_" + compactGrantKey(grant.userKey)
      : "";
    return "unni_product_grant_v1_" + productId + "_" + base + pairSuffix;
  }

  function saveGrant(data, productId, grant) {
    try {
      const stored = { ...grant, savedAt:Number(grant?.savedAt || Date.now()) };
      localStorage.setItem(grantStoreKey(data, productId, stored), JSON.stringify(stored));
    } catch (_) {}
  }

  function compatibilityStoredGrants(data) {
    const owner = entitlementSubjectKey(data);
    return collectStoredPremiumGrants()
      .filter((row) =>
        row.key.startsWith("unni_product_grant_v1_compatibility_") &&
        ownerSubjectFromGrantUserKey(row.userKey) === owner &&
        row.grant?.extra?.partner
      )
      .map((row) => row.grant)
      .sort((a,b) => Number(b?.savedAt || 0) - Number(a?.savedAt || 0));
  }

  function readGrant(data, productId) {
    if (productId === "compatibility") {
      const rows = compatibilityStoredGrants(data);
      if (rows.length) return rows[0];
    }
    try { return JSON.parse(localStorage.getItem(grantStoreKey(data, productId)) || "null"); } catch (_) { return null; }
  }

  function verifiedCompatibilityGrants(data, state) {
    const verifiedKeys = new Set(
      (state?.verifiedPurchases || [])
        .filter((row) => row.productId === "compatibility")
        .map((row) => row.userKey)
    );
    return compatibilityStoredGrants(data).filter((grant) => verifiedKeys.has(grant.userKey));
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

  async function ensurePremiumPaymentWidgetSDK() {
    if (typeof global.PaymentWidget === "function") return global.PaymentWidget;

    // 기본 NOTE 결제 경로가 제공하는 로더가 있으면 같은 로더/Promise를 공유한다.
    if (typeof global.ensurePaymentWidgetSDK === "function") {
      try {
        const loaded = await global.ensurePaymentWidgetSDK();
        if (typeof global.PaymentWidget === "function") return global.PaymentWidget;
        if (typeof loaded === "function") return loaded;
      } catch (_) {}
    }

    // 결제 복귀/새로고침 뒤에는 SDK 전역이 사라질 수 있으므로 추가상품 경로도 독립적으로 복구한다.
    if (!global.__paymentWidgetLoading) {
      global.__paymentWidgetLoading = new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://js.tosspayments.com/v1/payment-widget";
        script.async = true;
        script.onload = () =>
          typeof global.PaymentWidget === "function"
            ? resolve(global.PaymentWidget)
            : reject(new Error("PAYMENT_WIDGET_MISSING"));
        script.onerror = () => reject(new Error("PAYMENT_WIDGET_LOAD_FAILED"));
        document.head.appendChild(script);
      }).finally(() => {
        global.__paymentWidgetLoading = null;
      });
    }

    const loaded = await global.__paymentWidgetLoading;
    if (typeof global.PaymentWidget !== "function" && typeof loaded !== "function")
      throw new Error("PAYMENT_WIDGET_MISSING");
    return typeof global.PaymentWidget === "function" ? global.PaymentWidget : loaded;
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
    let PaymentWidgetCtor;
    try {
      PaymentWidgetCtor = await ensurePremiumPaymentWidgetSDK();
    } catch (_) {
      throw new Error(productVoice(data, {
        F: "결제창을 불러오지 못했어. 지금 내용은 그대로니까 네트워크를 확인하고 한 번만 다시 눌러줘.",
        T: "결제창을 불러오지 못했어. 네트워크 확인 후 다시 눌러줘.",
      }));
    }
    root.querySelector("#unniProductPrice").textContent = productId === "all_in_one" && Number(order.amount) < product.price
      ? `${won(product.price)} → ${won(order.amount)}`
      : won(order.amount);
    root.querySelector("#unniProductPayment").style.display = "block";
    const paymentAmount = root.querySelector("#unniProductPaymentAmount");
    if (paymentAmount) paymentAmount.textContent = `최종 ${won(order.amount)}`;
    root.querySelector("#unniProductPaymentMethod").innerHTML = "";
    root.querySelector("#unniProductPaymentAgreement").innerHTML = "";
    const widget = PaymentWidgetCtor(TOSS_CLIENT_KEY, PaymentWidgetCtor.ANONYMOUS);
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

  async function openProduct(productId, options = {}) {
    const data = getData();
    const forceNewCompatibility = productId === "compatibility" && options?.forceNewCompatibility === true;
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

    const directStoredGrant = forceNewCompatibility ? null : readGrant(data,productId);
    let directGrantVerified = false;
    if (directStoredGrant?.token && directStoredGrant?.userKey && typeof verifyAccessToken === "function") {
      try { directGrantVerified = (await verifyAccessToken(directStoredGrant.userKey,directStoredGrant.token,productId)) === "valid"; }
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

    const state = forceNewCompatibility
      ? { kind:"unpurchased", productId, amount:product.price, label:`${won(product.price)}에 열기` }
      : directGrantVerified
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
      } else if (productId === "compatibility") {
        const grants = verifiedCompatibilityGrants(data, verifiedState);
        const fallbackGrant = directGrant || grants[0] || null;
        action.textContent = "구매한 궁합 다시 보기";
        action.onclick = () => {
          if (!fallbackGrant) {
            productToast(data, {
              F: "구매 정보를 다시 불러오지 못했어. 다시 결제하지 말고 저장된 구매 내역부터 확인해보자.",
              T: "구매 정보를 다시 불러오지 못했어. 재결제하지 말고 저장된 구매 내역을 확인해줘.",
            });
            return;
          }
          showReport(productId,data,fallbackGrant.extra || {});
        };

        if (grants.length) {
          const rows = grants.map((grant,index) => {
            const partner = grant?.extra?.partner || {};
            const name = esc(partner.n || "상대");
            const birth = esc(partner.b || "");
            return `<button type="button" data-compat-reopen="${index}" style="width:100%;display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 0;border:0;border-top:1px solid #ebe5df;background:transparent;text-align:left;cursor:pointer"><span style="font-size:11.5px;font-weight:800;color:#334155">${name}<span style="margin-left:6px;font-size:9.5px;font-weight:650;color:#94a3b8">${birth}</span></span><span style="font-size:10px;font-weight:800;color:#047857">다시 보기</span></button>`;
          }).join("");
          body.insertAdjacentHTML("beforeend", `<div id="unniCompatibilityPurchases" style="margin-top:12px;padding-top:2px"><div style="font-size:10.5px;font-weight:900;color:#59616c;margin-bottom:2px">구매한 궁합</div>${rows}</div>`);
          body.querySelectorAll("[data-compat-reopen]").forEach((button) => {
            button.addEventListener("click", () => {
              const grant = grants[Number(button.dataset.compatReopen)];
              if (grant) showReport(productId,data,grant.extra || {});
            });
          });
        }

        const newPair = document.createElement("button");
        newPair.id = "unniCompatibilityNewPair";
        newPair.type = "button";
        newPair.textContent = `다른 상대 궁합 보기 · ${won(product.price)}`;
        newPair.style.cssText = "width:100%;margin-top:12px;padding:12px;border:1px solid #e2e8f0;border-radius:13px;background:#fff;color:#475569;font-size:11.5px;font-weight:850;cursor:pointer";
        newPair.onclick = () => openProduct("compatibility",{ forceNewCompatibility:true });
        body.appendChild(newPair);
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
      value:"두 사람을 같이 봐야 보이는 관계 흐름",
      difference:"내 사주를 더 길게 보는 게 아니라, 상대 사주를 같이 놓고 두 사람 사이의 관계 흐름을 봐.",
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
        ? "나 한 사람에 대한 건 완전판에 이미 들어 있어. 여기서 새로 열 수 있는 건 특정 상대와 두 사람을 같이 봐야 보이는 관계 흐름이야."
        : isT
          ? "지금 질문에는 네 사주만 더 보는 것보다 상대 사주까지 겹쳐야 새로 알 수 있는 정보가 많아."
          : `${situation ? "방금 말한 ‘" + situation + "’라면 " : ""}상대 사주까지 같이 놓고 둘 사이가 왜 이렇게 흘러가는지 보는 게 완전히 다른 답을 줄 수 있어.`;
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
    const priceLabel = resolvedState.kind === "purchased"
      ? (p.id === "compatibility" ? "구매한 궁합 있음" : "구매 완료")
      : resolvedState.kind === "included" ? "완전판 포함"
        : resolvedState.kind === "upgrade" ? `+${won(resolvedState.amount)}`
          : won(p.price);
    const stateCopy = resolvedState.kind === "purchased"
      ? (p.id === "compatibility" ? "구매내역 보기 · 다른 상대도 가능" : "구매한 내용 다시 이어보기")
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
    const desiredCatalogMode = unlocked ? "upsell" : "owned-reaccess";
    if (existing) {
      if (existing.dataset.catalogMode === desiredCatalogMode || existing.querySelector("[data-entitlement-status]")) return;
      existing.remove();
    }

    const isFreeLaunch = typeof FREE_LAUNCH_MODE !== "undefined" && FREE_LAUNCH_MODE;
    if (!unlocked && !isFreeLaunch && collectStoredPremiumGrants().length === 0) {
      existing?.remove();
      return;
    }
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
    const allProducts = Object.values(PRODUCTS);
    const allStates = Object.fromEntries(allProducts.map((p)=>[p.id,productStateFor(p.id,state)]));
    // 새 고민의 990원 잠금과 이미 구매한 프리미엄 권한은 별개다.
    // 잠긴 결과에서도 구매 완료/완전판 포함 상품은 평생 다시보기 진입점을 유지한다.
    const visibleProducts = unlocked
      ? allProducts
      : allProducts.filter((p) => ["purchased","included"].includes(allStates[p.id]?.kind));
    if (!visibleProducts.length) {
      existing?.remove();
      return;
    }
    const states = Object.fromEntries(visibleProducts.map((p)=>[p.id,allStates[p.id]]));
    const isT = data?.currentMode === "T";
    let recommendedId = unlocked ? recommendedProductId(data,state) : visibleProducts[0]?.id;
    if (!visibleProducts.some((p)=>p.id === recommendedId)) recommendedId = visibleProducts[0]?.id;
    const recommended = PRODUCTS[recommendedId] || visibleProducts[0];
    if (!recommended) return;
    const others = visibleProducts.filter((p) => p.id !== recommended.id);
    const reason = unlocked ? recommendationReason(recommended.id,data,isT,state) : "";

    const wrap = document.createElement("section");
    wrap.id = "unniProductLadder";
    wrap.dataset.verifiedPremium = isFreeLaunch ? "free-launch" : "server";
    wrap.dataset.catalogMode = unlocked ? "upsell" : "owned-reaccess";
    wrap.style.cssText = "margin-top:20px;padding:16px 2px 0;border-top:1px solid #e8e1db;background:transparent;box-shadow:none";
    const eyebrow = unlocked
      ? (isT ? "더 볼 거면, 다음 정보는 여기야" : "더 궁금한 게 남았다면")
      : (isT ? "이미 구매한 상품" : "전에 열어둔 건 여기 있어");
    const headline = unlocked
      ? (isT ? "다음으로 볼 거면 이게 가장 연결돼" : "지금 얘기 다음으로는 이게 제일 자연스러워")
      : (isT ? "구매한 내용은 바로 다시 볼 수 있어" : "새 고민 결제와 상관없이 다시 볼 수 있어");
    const sub = unlocked
      ? (isT
          ? "방금 본 내용과 겹치지 않게, 새로 볼 정보가 많은 걸 먼저 뒀어."
          : "아까 본 얘기는 빼고, 여기서 새로 볼 게 많은 걸 먼저 뒀어.")
      : (isT
          ? "새 고민의 NOTE 잠금과 기존 구매내역은 별개야."
          : "새 고민이 잠겨 있어도 전에 결제한 상품은 다시 결제할 필요 없어.");
    const otherHtml = others.length
      ? `<div id="unniOtherProducts" style="display:grid;gap:14px;margin-top:10px">${foldedProductGroups(others,states)}</div>`
      : "";
    wrap.innerHTML = `<div data-product-catalog-copy style="margin:0 2px 10px"><div style="font-size:10px;font-weight:800;color:#969ba4">${eyebrow}</div><div style="margin-top:2px;font-size:14px;font-weight:900;color:#172033">${headline}</div><div style="margin-top:3px;font-size:10.5px;line-height:1.55;color:#7a8089">${sub}</div></div><div style="display:grid;gap:0">${productButtonHtml(recommended,{recommended:true,reason,state:states[recommended.id]})}${otherHtml}</div>`;
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
    version:"2.3.0",
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
