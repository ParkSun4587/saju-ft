(function (global) {
  "use strict";

  const VERSION = "1.1.0";

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

  const FEATURE_MATRIX = {
    basic_concern: {
      "selected-concern": true,
      "additional-concerns": false,
      "full-five-year": false,
      "monthly-detail": true,
      "cross-domain": false,
      "second-person": false,
      compatibility: false,
      "all-six-concerns": false,
      "daewoon-context": false,
    },
    concern_bundle3: {
      "selected-concern": false,
      "additional-concerns": true,
      "full-five-year": false,
      "monthly-detail": true,
      "cross-domain": false,
      "second-person": false,
      compatibility: false,
      "all-six-concerns": false,
      "daewoon-context": false,
    },
    full_saju: {
      "selected-concern": false,
      "additional-concerns": false,
      "full-five-year": true,
      "monthly-detail": true,
      "cross-domain": true,
      "second-person": false,
      compatibility: false,
      "all-six-concerns": false,
      "daewoon-context": true,
    },
    compatibility: {
      "selected-concern": false,
      "additional-concerns": false,
      "full-five-year": false,
      "monthly-detail": true,
      "cross-domain": false,
      "second-person": true,
      compatibility: true,
      "all-six-concerns": false,
      "daewoon-context": false,
    },
    all_in_one: {
      "selected-concern": false,
      "additional-concerns": false,
      "full-five-year": true,
      "monthly-detail": true,
      "cross-domain": true,
      "second-person": false,
      compatibility: false,
      "all-six-concerns": true,
      "daewoon-context": true,
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

  function canRenderFeature(productId, feature, context) {
    const contract = getContract(productId);
    const row = FEATURE_MATRIX[productId];
    if (!contract || !row || !Object.prototype.hasOwnProperty.call(row, feature)) return false;
    if (row[feature] !== true) return false;
    if (feature === "monthly-detail") {
      const months = Number(context?.months || 0);
      if (months > 0 && months > Number(contract.monthlyDetailRange || 0)) return false;
    }
    if (feature === "second-person" || feature === "compatibility") {
      if (context?.secondPersonPresent === false) return false;
    }
    return true;
  }

  function sanitizeProductPayload(productId, payload) {
    const input = payload && typeof payload === "object" ? payload : {};
    const out = { ...input };
    if (input.extra && typeof input.extra === "object") {
      out.extra = { ...input.extra };
    }
    if (!canRenderFeature(productId, "second-person", { secondPersonPresent:true })) {
      delete out.partner;
      delete out.secondPerson;
      delete out.compatibilityOverlay;
      delete out.compatibilityTimeline;
      if (out.extra) delete out.extra.partner;
    }
    if (!canRenderFeature(productId, "full-five-year")) {
      delete out.fullSajuTimeline;
      delete out.fullFiveYear;
      delete out.daeunContext;
      if (out.extra) {
        delete out.extra.fullSajuTimeline;
        delete out.extra.fullFiveYear;
        delete out.extra.daeunContext;
      }
    }
    if (!canRenderFeature(productId, "cross-domain")) {
      delete out.crossDomain;
      delete out.crossDomainAnalysis;
      if (out.extra) {
        delete out.extra.crossDomain;
        delete out.extra.crossDomainAnalysis;
      }
    }
    return out;
  }

  function validateProductPayload(productId, payload) {
    const contract = getContract(productId);
    if (!contract) return { ok:false, productId, errors:["unknown-product"], deniedFeatures:[] };

    const input = payload && typeof payload === "object" ? payload : {};
    const features = Array.isArray(input.features) ? input.features : [];
    const context = {
      months: input.months,
      secondPersonPresent: !!input.secondPersonPresent,
    };
    const deniedFeatures = features.filter((feature) => !canRenderFeature(productId, feature, context));
    const errors = deniedFeatures.map((feature) => "feature-not-allowed:" + feature);

    if (contract.secondPersonRequired && !context.secondPersonPresent) {
      errors.push("second-person-required");
    }

    const count = Number(input.concernCount);
    if (Number.isFinite(count) && count >= 0) {
      if (productId === "concern_bundle3" && count !== contract.concernCount) errors.push("concern-count-mismatch");
      if (productId === "all_in_one" && count !== contract.concernCount) errors.push("concern-count-mismatch");
      if (productId === "basic_concern" && count !== 1) errors.push("concern-count-mismatch");
    }

    return {
      ok: errors.length === 0,
      productId,
      contract,
      requestedFeatures: features,
      deniedFeatures,
      errors,
    };
  }

  function filterTimingForProduct(productId, timing) {
    const source = timing && typeof timing === "object" ? timing : {};
    const contract = getContract(productId);
    if (!contract) return {
      concernNearTerm:null,
      longTermPivots:[],
      fullSajuTimeline:null,
      compatibilityTimeline:null,
      fullHorizon:null,
    };

    const monthlyAllowed = canRenderFeature(productId, "monthly-detail", {
      months: contract.monthlyDetailRange,
    });
    const fullFiveAllowed = canRenderFeature(productId, "full-five-year");
    const compatibilityAllowed = canRenderFeature(productId, "compatibility", {
      secondPersonPresent:true,
    });

    return {
      concernNearTerm: monthlyAllowed ? (source.concernNearTerm || null) : null,
      longTermPivots: contract.longTermDetail === "teaser-only"
        ? (Array.isArray(source.longTermPivots) ? source.longTermPivots.slice(0, 2) : [])
        : [],
      fullSajuTimeline: fullFiveAllowed ? (source.fullSajuTimeline || null) : null,
      compatibilityTimeline: compatibilityAllowed ? (source.compatibilityTimeline || null) : null,
      // fullHorizon is an internal calculation surface and is never exposed by a product renderer.
      fullHorizon: null,
    };
  }

  function assertDisclosure(productId, feature, context) {
    return canRenderFeature(productId, feature, context);
  }

  global.__UNNI_PRODUCT_CONTENT_POLICY_V1__ = {
    version: VERSION,
    contracts: CONTRACTS,
    featureMatrix: FEATURE_MATRIX,
    valueCopy: VALUE_COPY,
    getContract,
    canRenderFeature,
    validateProductPayload,
    sanitizeProductPayload,
    filterTimingForProduct,
    assertDisclosure,
  };
})(globalThis);
