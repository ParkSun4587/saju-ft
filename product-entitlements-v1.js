(function (global) {
  "use strict";

  const VERSION = "1.0.0";

  const BASE_PRICES = Object.freeze({
    concern_bundle3: 100,
    full_saju: 100,
    compatibility: 100,
    all_in_one: 100,
  });

  const ENTITLEMENT_GRAPH = Object.freeze({
    concern_bundle3: Object.freeze(["concern_bundle3"]),
    full_saju: Object.freeze(["full_saju"]),
    compatibility: Object.freeze(["compatibility"]),
    all_in_one: Object.freeze(["all_in_one", "full_saju", "concern_bundle3", "question_pack3"]),
  });

  const ALL_IN_ONE_CREDIT_PRODUCTS = Object.freeze([]); // TEMP QA: keep every unowned product payable at 100 won

  function verifiedProductIds(summary) {
    const rows = Array.isArray(summary?.verifiedPurchases) ? summary.verifiedPurchases : [];
    return [...new Set(rows.map((row) => row?.productId).filter((id) => BASE_PRICES[id]))];
  }

  function effectiveEntitlements(summary) {
    const direct = verifiedProductIds(summary);
    const out = new Set();
    for (const productId of direct) {
      for (const entitlement of ENTITLEMENT_GRAPH[productId] || []) out.add(entitlement);
    }
    return [...out];
  }

  function hasEntitlement(summary, entitlement) {
    return effectiveEntitlements(summary).includes(entitlement);
  }

  function calculateUpgradeQuote({ targetProduct = "all_in_one", verifiedEntitlements = [] } = {}) {
    if (targetProduct !== "all_in_one") {
      const base = BASE_PRICES[targetProduct] || 0;
      return { targetProduct, baseAmount:base, creditAmount:0, amount:base, alreadyOwned:false, creditedProducts:[] };
    }
    const direct = [...new Set((verifiedEntitlements || []).filter((id) => BASE_PRICES[id]))];
    if (direct.includes("all_in_one")) {
      return { targetProduct, baseAmount:BASE_PRICES.all_in_one, creditAmount:BASE_PRICES.all_in_one, amount:0, alreadyOwned:true, creditedProducts:["all_in_one"] };
    }
    const creditedProducts = ALL_IN_ONE_CREDIT_PRODUCTS.filter((id) => direct.includes(id));
    const creditAmount = creditedProducts.reduce((sum, id) => sum + BASE_PRICES[id], 0);
    return {
      targetProduct,
      baseAmount:BASE_PRICES.all_in_one,
      creditAmount,
      amount:Math.max(0, BASE_PRICES.all_in_one - creditAmount),
      alreadyOwned:false,
      creditedProducts,
    };
  }

  function getEffectivePrice(productId, summary) {
    const direct = verifiedProductIds(summary);
    if (productId === "all_in_one") {
      return calculateUpgradeQuote({ targetProduct:"all_in_one", verifiedEntitlements:direct }).amount;
    }
    return BASE_PRICES[productId] || 0;
  }

  function getProductState(productId, summary) {
    const direct = verifiedProductIds(summary);
    const effective = new Set(effectiveEntitlements(summary));
    const directOwned = direct.includes(productId);
    const includedByAllInOne = !directOwned && direct.includes("all_in_one") && ["full_saju","concern_bundle3"].includes(productId);
    if (directOwned) {
      return { kind:"purchased", productId, amount:0, label: productId === "full_saju" ? "구매한 전체판 다시 보기" : "구매한 상품 다시 보기" };
    }
    if (includedByAllInOne) {
      return { kind:"included", productId, amount:0, label:"완전판에 포함됨 · 바로 보기", includedBy:"all_in_one" };
    }
    if (productId === "all_in_one") {
      const quote = calculateUpgradeQuote({ targetProduct:"all_in_one", verifiedEntitlements:direct });
      if (quote.creditAmount > 0) {
        return { kind:"upgrade", productId, amount:quote.amount, label:`완전판으로 업그레이드 +${quote.amount.toLocaleString("ko-KR")}원`, quote };
      }
    }
    return { kind:"unpurchased", productId, amount:BASE_PRICES[productId] || 0, label:`${(BASE_PRICES[productId] || 0).toLocaleString("ko-KR")}원에 열기` };
  }

  global.__UNNI_PRODUCT_ENTITLEMENTS_V1__ = {
    version:VERSION,
    basePrices:BASE_PRICES,
    graph:ENTITLEMENT_GRAPH,
    creditProducts:ALL_IN_ONE_CREDIT_PRODUCTS,
    verifiedProductIds,
    effectiveEntitlements,
    hasEntitlement,
    calculateUpgradeQuote,
    getEffectivePrice,
    getProductState,
  };
})(globalThis);
