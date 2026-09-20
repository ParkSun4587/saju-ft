(function (global) {
  "use strict";

  const VERSION = "1.0.0";

  const CONTRACTS = {
    basic_concern: {
      id: "basic_concern",
      allowedDomains: "selected-concern-only",
      timelineDepth: "near-term-plus-long-pivot-teaser",
      monthlyDetailRange: 18,
      crossDomainAnalysis: false,
      secondPersonRequired: false,
      longTermDetail: "teaser-only",
      concernCount: 1,
      compatibilityAllowed: false,
    },
    concern_bundle3: {
      id: "concern_bundle3",
      allowedDomains: "three-selected-concerns",
      timelineDepth: "near-term-per-concern-plus-long-pivot-teaser",
      monthlyDetailRange: 18,
      crossDomainAnalysis: "shared-structure-summary-only",
      secondPersonRequired: false,
      longTermDetail: "teaser-only",
      concernCount: 3,
      compatibilityAllowed: false,
    },
    full_saju: {
      id: "full_saju",
      allowedDomains: "single-person-all-life-domains",
      timelineDepth: "five-year-annual-plus-near-term-highlights-plus-daewoon-context",
      monthlyDetailRange: 18,
      crossDomainAnalysis: true,
      secondPersonRequired: false,
      longTermDetail: "full-five-year",
      concernCount: 0,
      compatibilityAllowed: false,
    },
    compatibility: {
      id: "compatibility",
      allowedDomains: "two-person-relationship-only",
      timelineDepth: "relationship-near-term-plus-five-year-pair-flow",
      monthlyDetailRange: 18,
      crossDomainAnalysis: "relationship-only",
      secondPersonRequired: true,
      longTermDetail: "relationship-only",
      concernCount: 0,
      compatibilityAllowed: true,
    },
    all_in_one: {
      id: "all_in_one",
      allowedDomains: "single-person-all-life-domains-plus-all-six-concerns",
      timelineDepth: "full-single-person-five-year-plus-all-concerns",
      monthlyDetailRange: 18,
      crossDomainAnalysis: true,
      secondPersonRequired: false,
      longTermDetail: "full-five-year",
      concernCount: 6,
      compatibilityAllowed: false,
    },
  };

  const VALUE_COPY = {
    concern_bundle3: {
      short: "다른 고민 3개도 같은 사주로 각각 깊게 풀어보기",
      cta: "다른 고민 3개도 같은 사주로 풀어보기",
      unlocks: "지금 고민 말고 남은 고민 3개 · 각 고민의 반복패턴·원인·행동·가까운 시기 · 세 고민의 공통 구조",
    },
    full_saju: {
      short: "내 사주 전체 구조와 앞으로 5년의 큰 흐름 보기",
      cta: "5년 전체 흐름과 큰 변곡점 보기",
      unlocks: "사주 전체 구조 · 영역 간 연결 · 가까운 핵심 시기 · 5년 연도별 큰 흐름 · 지금과 다음 10년 흐름",
    },
    compatibility: {
      short: "두 사람 사주를 겹쳐 관계의 이유와 시기 보기",
      cta: "두 사람 사주를 겹쳐 관계의 이유 보기",
      unlocks: "상대 사주가 있어야만 계산되는 끌림·오해·갈등·보완·관계 전용 시기",
    },
    all_in_one: {
      short: "나 한 사람의 전체 사주판과 6개 고민을 한 번에 열기",
      cta: "내 전체 사주판과 6개 고민 한 번에 보기",
      unlocks: "전체 사주판 · 6개 고민 · 고민 간 공통패턴 · 5년 전체 흐름 · 영역 간 동시 변곡점 · 종합 행동 전략",
    },
  };

  function getContract(id) {
    return CONTRACTS[id] || null;
  }

  function assertDisclosure(productId, feature) {
    const contract = getContract(productId);
    if (!contract) return false;
    if (feature === "compatibility") return contract.compatibilityAllowed === true;
    if (feature === "full-five-year") return contract.longTermDetail === "full-five-year";
    if (feature === "second-person") return contract.secondPersonRequired === true;
    if (feature === "cross-domain") return !!contract.crossDomainAnalysis;
    return true;
  }

  global.__UNNI_PRODUCT_CONTENT_POLICY_V1__ = {
    version: VERSION,
    contracts: CONTRACTS,
    valueCopy: VALUE_COPY,
    getContract,
    assertDisclosure,
  };
})(globalThis);
