(function (global) {
  "use strict";

  const VERSION = "1.2.0";

  const CONTRACTS = {
    basic_concern: {
      id: "basic_concern",
      allowedDomains: "single-free-question",
      timelineDepth: "question-relevant-near-term-plus-long-pivot-teaser",
      monthlyDetailRange: 18,
      crossDomainAnalysis: "question-relevant-only",
      secondPersonRequired: false,
      longTermDetail: "teaser-only",
      questionCount: 1,
      compatibilityAllowed: false,
    },
    concern_bundle3: {
      id: "concern_bundle3",
      allowedDomains: "three-free-questions",
      timelineDepth: "question-relevant-near-term-per-question-plus-long-pivot-teaser",
      monthlyDetailRange: 18,
      crossDomainAnalysis: "per-question-full-chart-synthesis",
      secondPersonRequired: false,
      longTermDetail: "teaser-only",
      questionCount: 3,
      compatibilityAllowed: false,
      newSales: false,
      legacyReaccess: true,
    },
    full_saju: {
      id: "full_saju",
      allowedDomains: "single-person-dynamic-whole-chart",
      timelineDepth: "near-term-context-only",
      monthlyDetailRange: 18,
      crossDomainAnalysis: true,
      secondPersonRequired: false,
      longTermDetail: "near-term-only",
      concernCount: 0,
      compatibilityAllowed: false,
      dynamicThemeSelection: true,
      themeRange: [5,7],
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
      allowedDomains: "single-person-deep-life-consultation",
      timelineDepth: "near-term-18-month-plus-real-five-year-pivots",
      monthlyDetailRange: 18,
      crossDomainAnalysis: true,
      secondPersonRequired: false,
      longTermDetail: "full-five-year",
      questionCount: 1,
      followUpQuestions: 1,
      legacyIncludesQuestionPack3: true,
      compatibilityAllowed: false,
    },
  };

  const FEATURE_MATRIX = {
    basic_concern: {
      "selected-question": true,
      "additional-questions": false,
      "current-question-link": true,
      "full-five-year": false,
      "monthly-detail": true,
      "cross-domain": true,
      "second-person": false,
      compatibility: false,
      "daewoon-context": false,
      "selected-concern": false,
      "additional-concerns": false,
      "all-six-concerns": false,
    },
    concern_bundle3: {
      "selected-question": false,
      "additional-questions": true,
      "current-question-link": false,
      "full-five-year": false,
      "monthly-detail": true,
      "cross-domain": true,
      "second-person": false,
      compatibility: false,
      "daewoon-context": false,
      "selected-concern": false,
      "additional-concerns": true,
      "all-six-concerns": false,
    },
    full_saju: {
      "selected-question": false,
      "additional-questions": false,
      "current-question-link": false,
      "full-five-year": false,
      "monthly-detail": true,
      "cross-domain": true,
      "second-person": false,
      compatibility: false,
      "daewoon-context": false,
      "selected-concern": false,
      "additional-concerns": false,
      "all-six-concerns": false,
    },
    compatibility: {
      "selected-question": false,
      "additional-questions": false,
      "current-question-link": false,
      "full-five-year": false,
      "monthly-detail": true,
      "cross-domain": false,
      "second-person": true,
      compatibility: true,
      "daewoon-context": false,
      "selected-concern": false,
      "additional-concerns": false,
      "all-six-concerns": false,
    },
    all_in_one: {
      "selected-question": false,
      "additional-questions": false,
      "follow-up-question": true,
      "current-question-link": true,
      "full-five-year": true,
      "monthly-detail": true,
      "cross-domain": true,
      "second-person": false,
      compatibility: false,
      "daewoon-context": true,
      "selected-concern": false,
      "additional-concerns": false,
      "all-six-concerns": false,
    },
  };

  const VALUE_COPY = {
    concern_bundle3: {
      short: "예전에 구매한 질문 3개 상담 다시보기",
      cta: "구매한 질문 3개 다시 보기",
      unlocks: "기존 구매 결과 재열람 전용",
    },
    full_saju: {
      short: "내 사주 전체에서 나를 이해하는 데 중요한 주제만 골라 보기",
      cta: "내 사주 전체상담 보기",
      unlocks: "전체 중심 인과 · 반복 패턴 · 강점 · 소모 조건 · 맞는 환경·사람·일 방식 · 가까운 흐름",
    },
    compatibility: {
      short: "두 사람 사주를 겹쳐 관계의 이유와 시기 보기",
      cta: "두 사람 사주를 겹쳐 관계의 이유 보기",
      unlocks: "상대 사주가 있어야만 계산되는 끌림·오해·갈등·보완·관계 전용 시기",
    },
    all_in_one: {
      short: "나를 이해하고, 지금 질문과 실제 흐름을 연결해 앞으로 움직일 기준까지 설계",
      cta: "내 인생 심층상담 보기",
      unlocks: "전체상담 · 현재 질문 연결 · 반복 선택 패턴 · 12~18개월 흐름 · 실제 5년 변곡점 · 판단 기준 · 후속 확인 질문 1개",
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

    const questionCount = Number(input.questionCount);
    if (Number.isFinite(questionCount) && questionCount >= 0 && Number.isFinite(Number(contract.questionCount))) {
      if (questionCount !== Number(contract.questionCount)) errors.push("question-count-mismatch");
    }

    // 구형 저장 결과/주문 복원만 허용하기 위한 호환 검증. 새 렌더러는 concernCount를 사용하지 않는다.
    const legacyConcernCount = Number(input.concernCount);
    if (Number.isFinite(legacyConcernCount) && legacyConcernCount >= 0) {
      if (productId === "concern_bundle3" && legacyConcernCount !== 3) errors.push("legacy-concern-count-mismatch");
      if (productId === "all_in_one" && legacyConcernCount !== 6) errors.push("legacy-concern-count-mismatch");
      if (productId === "basic_concern" && legacyConcernCount !== 1) errors.push("legacy-concern-count-mismatch");
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
