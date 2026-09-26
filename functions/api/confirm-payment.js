// Cloudflare Pages Functions: 서버가 상품 가격·구매 권한·업그레이드 금액을 최종 확정합니다.
const PRODUCTS = Object.freeze({
  concern_single: { amount: 100, name: "어떤언니 1:1 질문 심층상담" },
  concern_bundle3: { amount: 100, name: "어떤언니 기존 질문 3개 상담" },
  full_saju: { amount: 100, name: "어떤언니 내 사주 전체상담" },
  compatibility: { amount: 100, name: "어떤언니 우리 둘 궁합" },
  all_in_one: { amount: 100, name: "어떤언니 내 인생 심층상담" },
});
const PREMIUM_IDS = Object.freeze(["concern_bundle3","full_saju","compatibility","all_in_one"]);
const ALL_IN_ONE_CREDITS = Object.freeze([]); // TEMP QA: every unowned premium checkout stays at 100 won
const TTL = 7 * 24 * 60 * 60 * 1000;
const enc = new TextEncoder();
const concerns = ["money", "career", "love", "path", "people", "mental"];
const CONSULTATION_KEY = "consultation";
const QUESTION_MIN = 4;
const QUESTION_MAX = 500;
function cleanQuestion(value) {
  if (typeof value !== "string") throw new Error("INPUT");
  const out = value.replace(/\s+/g, " ").trim();
  if (out.length < QUESTION_MIN || out.length > QUESTION_MAX || /[\x00-\x08\x0b\x0c\x0e-\x1f]/.test(out)) throw new Error("INPUT");
  return out;
}
const situations = Object.freeze({
  money:["saving","income","side","flow"],
  career:["exam","jobsearch","move","current"],
  love:["crush","relationship","breakup","new"],
  path:["lost","current","switch","strength"],
  people:["friend","work","family","distance"],
  mental:["burnout","overthink","low","recover"],
});
const BIRTH_TIME_BRANCH_RE = /^[子丑寅卯辰巳午未申酉戌亥]$/;
function validBirthTime(value) {
  return value === "unknown" || /^([01]\d|2[0-3]):[0-5]\d$/.test(value) || BIRTH_TIME_BRANCH_RE.test(value);
}

function reply(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}
function base64(bytes) {
  return btoa(String.fromCharCode(...new Uint8Array(bytes)));
}
function url64(bytes) {
  return base64(bytes).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function bytes64(value) {
  return Uint8Array.from(atob(value.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));
}
async function hmac(value, secret) {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return base64(await crypto.subtle.sign("HMAC", key, enc.encode(value)));
}
function equal(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
function cleanName(value, fallback = "") {
  if (typeof value !== "string" || value.length > 40 || /[\x00-\x1f]/.test(value)) throw new Error("INPUT");
  const out = value.trim();
  if (!out && !fallback) throw new Error("INPUT");
  return out || fallback;
}
function validatePartner(input) {
  if (!input || typeof input !== "object") throw new Error("INPUT");
  const p = { n:cleanName(input.n,"상대"), b:input.b, t:input.t, g:input.g, c:input.c, l:input.l === true };
  if (
    !/^\d{8}$/.test(p.b) ||
    !validBirthTime(p.t) ||
    !["female","male"].includes(p.g) ||
    !["solar","lunar"].includes(p.c) ||
    (p.c === "solar" && p.l)
  ) throw new Error("INPUT");
  return p;
}
function validateSituationMap(input, keys) {
  if (!input || typeof input !== "object") throw new Error("INPUT");
  const out = {};
  for (const key of keys) {
    const value = input[key];
    if (!situations[key]?.includes(value)) throw new Error("INPUT");
    out[key] = value;
  }
  return out;
}
function validateExtra(productId, input) {
  const x = input && typeof input === "object" ? input : {};
  if (productId === "concern_bundle3") {
    // v2 자유질문형. 이미 발급된 구형 주문 ticket 복원을 위해 기존 3개 고민 형식도 계속 허용한다.
    if (Array.isArray(x.questions)) {
      const questions = x.questions.map(cleanQuestion);
      if (questions.length !== 3) throw new Error("INPUT");
      return { questions };
    }
    if (!Array.isArray(x.concerns)) throw new Error("INPUT");
    const picked = [...new Set(x.concerns.filter((v) => concerns.includes(v)))];
    if (picked.length !== 3) throw new Error("INPUT");
    return { concerns:picked, situations:validateSituationMap(x.situations, picked), legacy:true };
  }
  if (productId === "all_in_one") {
    if (Array.isArray(x.questions)) {
      const questions = x.questions.slice(0,6).map(cleanQuestion);
      return { questions };
    }
    // 구형 완전판 ticket 호환
    if (x.situations) return { situations:validateSituationMap(x.situations, concerns), legacy:true };
    return {};
  }
  if (productId === "compatibility") return { partner:validatePartner(x.partner) };
  return {};
}
function snapshot(input) {
  if (!input || typeof input !== "object") throw new Error("INPUT");
  const productId = typeof input.p === "string" && PRODUCTS[input.p] ? input.p : "concern_single";
  const isConsultation = input.k === CONSULTATION_KEY;
  const question = isConsultation ? cleanQuestion(input.q || "") : (input.q || "");
  const d = {
    n:input.n, b:input.b, t:input.t, g:input.g, c:input.c, k:input.k, q:question, m:input.m,
    l:input.l === true, p:productId, x:validateExtra(productId,input.x),
  };
  const legacyQuestionValid = concerns.includes(d.k) && (!d.q || situations[d.k]?.includes(d.q));
  const consultationValid = d.k === CONSULTATION_KEY && typeof d.q === "string" && d.q.length >= QUESTION_MIN;
  if (
    typeof d.n !== "string" || !d.n.trim() || d.n.length > 40 || /[\x00-\x1f]/.test(d.n) ||
    !/^\d{8}$/.test(d.b) ||
    !validBirthTime(d.t) ||
    !["female","male"].includes(d.g) ||
    !["solar","lunar"].includes(d.c) ||
    !(legacyQuestionValid || consultationValid) ||
    !["F","T"].includes(d.m) ||
    (d.c === "solar" && d.l)
  ) throw new Error("INPUT");
  return d;
}
function productFor(d) {
  return PRODUCTS[d?.p] || PRODUCTS.concern_single;
}
function resultKey(d) {
  // 예전 6개 고민은 기존 키를 그대로 유지한다. 자유질문은 질문 문자열까지 scope에 넣어 질문별 구매권한을 분리한다.
  const scope = d.k === CONSULTATION_KEY
    ? [d.n,d.b,d.t,d.g,d.c,d.l,d.k,d.q]
    : [d.n,d.b,d.t,d.g,d.c,d.l,d.k];
  const legacy = "sazu_v2_" + JSON.stringify(scope);
  if (!d.p || d.p === "concern_single") return legacy;
  return legacy + "::" + d.p + "::" + JSON.stringify(d.x || {});
}
function ownerKey(d) {
  return "sazu_owner_v1_" + JSON.stringify([d.n,d.b,d.t,d.g,d.c,d.l]);
}
function compatibilityScopeKeyFromPartner(partner) {
  if (!partner || typeof partner !== "object") return "";
  return JSON.stringify([partner.b,partner.t,partner.g,partner.c,partner.l === true]);
}
function compatibilityScopeKeyFromData(d) {
  if (d?.p !== "compatibility") return "";
  return compatibilityScopeKeyFromPartner(d?.x?.partner);
}
function compatibilityScopeKeyFromUserKey(userKey) {
  if (typeof userKey !== "string") return "";
  const marker = "::compatibility::";
  const idx = userKey.indexOf(marker);
  if (idx < 0) return "";
  try {
    const extra = JSON.parse(userKey.slice(idx + marker.length));
    return compatibilityScopeKeyFromPartner(extra?.partner);
  } catch {
    return "";
  }
}

function ownerKeyFromLegacyUserKey(userKey) {
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
    if (!Array.isArray(row) || row.length < 6) return "";
    return "sazu_owner_v1_" + JSON.stringify(row.slice(0,6));
  } catch {
    return "";
  }
}
function effectiveEntitlements(verifiedPurchases) {
  const direct = new Set((verifiedPurchases || []).map((x) => x.productId));
  const out = new Set(direct);
  if (direct.has("all_in_one")) {
    out.add("full_saju");
    out.add("concern_bundle3");
    out.add("question_pack3");
  }
  return [...out];
}
function calculateUpgradeQuote(targetProduct, verifiedPurchases) {
  const baseAmount = PRODUCTS[targetProduct]?.amount || 0;
  const direct = new Set((verifiedPurchases || []).map((x) => x.productId));
  if (targetProduct !== "all_in_one") {
    return { targetProduct, baseAmount, creditAmount:0, amount:baseAmount, alreadyOwned:direct.has(targetProduct), creditedProducts:[] };
  }
  if (direct.has("all_in_one")) {
    return { targetProduct, baseAmount, creditAmount:baseAmount, amount:0, alreadyOwned:true, creditedProducts:["all_in_one"] };
  }
  const creditedProducts = ALL_IN_ONE_CREDITS.filter((id) => direct.has(id));
  const creditAmount = creditedProducts.reduce((sum,id) => sum + PRODUCTS[id].amount, 0);
  return {
    targetProduct,
    baseAmount,
    creditAmount,
    amount:Math.max(0,baseAmount-creditAmount),
    alreadyOwned:false,
    creditedProducts,
  };
}
function isProductAlreadyEntitled(productId, verifiedPurchases, data) {
  const effective = new Set(effectiveEntitlements(verifiedPurchases));
  if (productId === "compatibility") {
    const targetScope = compatibilityScopeKeyFromData(data);
    if (!targetScope) return false;
    return (verifiedPurchases || []).some((x) =>
      x.productId === "compatibility" &&
      (x.scopeKey || compatibilityScopeKeyFromUserKey(x.userKey)) === targetScope
    );
  }
  return effective.has(productId);
}
async function aesKey(secret) {
  const digest = await crypto.subtle.digest("SHA-256", enc.encode("unni-order-v2:" + secret));
  return crypto.subtle.importKey("raw", digest, "AES-GCM", false, ["encrypt","decrypt"]);
}
async function seal(value, secret) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt({ name:"AES-GCM", iv }, await aesKey(secret), enc.encode(JSON.stringify(value)));
  return url64(iv) + "." + url64(encrypted);
}
async function unseal(ticket, secret) {
  if (typeof ticket !== "string" || ticket.length > 8192) throw new Error("TICKET");
  const parts = ticket.split(".");
  if (parts.length !== 2) throw new Error("TICKET");
  const plain = await crypto.subtle.decrypt({ name:"AES-GCM", iv:bytes64(parts[0]) }, await aesKey(secret), bytes64(parts[1]));
  const value = JSON.parse(new TextDecoder().decode(plain));
  if (value.v !== 2 || !Number.isFinite(value.exp) || value.exp < Date.now()) throw new Error("EXPIRED");
  value.data = snapshot(value.data);
  return value;
}
async function toss(path, secret, options = {}) {
  const response = await fetch("https://api.tosspayments.com/v1/payments/" + path, {
    ...options,
    headers: { Authorization:"Basic " + btoa(secret + ":"), "Content-Type":"application/json", ...options.headers },
    signal:AbortSignal.timeout(12000),
  });
  return { ok:response.ok, status:response.status, data:await response.json() };
}
function paid(data, paymentKey, orderId, expectedAmount) {
  return (
    data.status === "DONE" &&
    data.paymentKey === paymentKey &&
    data.orderId === orderId &&
    data.totalAmount === expectedAmount &&
    data.balanceAmount === expectedAmount &&
    data.currency === "KRW"
  );
}
async function parseSignedGrant(token, signing) {
  if (typeof token !== "string" || token.length > 8192) return null;
  const version = token.startsWith("v3.") ? "v3" : token.startsWith("v2.") ? "v2" : "";
  if (!version) return null;
  const parts = token.split(".");
  if (parts.length !== 3 || !equal(parts[2], await hmac(version + "." + parts[1], signing))) return null;
  let grant;
  try { grant = JSON.parse(new TextDecoder().decode(bytes64(parts[1]))); }
  catch { return null; }
  if (!grant || typeof grant !== "object") return null;
  if (Number.isFinite(grant.exp) && grant.exp < Date.now()) return null;
  return grant;
}
async function verifyPremiumPurchase(record, currentOwnerKey, secret, signing) {
  if (!record || typeof record !== "object") return null;
  const { userKey, token } = record;
  if (typeof userKey !== "string" || userKey.length > 3000) return null;
  const grant = await parseSignedGrant(token, signing);
  if (!grant || grant.userKey !== userKey || !PREMIUM_IDS.includes(grant.productId)) return null;
  const grantOwner = grant.ownerKey || ownerKeyFromLegacyUserKey(grant.userKey);
  if (!grantOwner || grantOwner !== currentOwnerKey) return null;
  const expected = Number(grant.amount);
  if (!Number.isFinite(expected) || expected < 0) return null;
  const payment = await toss(encodeURIComponent(grant.paymentKey), secret);
  if (!payment.ok) throw new Error("VERIFY_UNAVAILABLE");
  if (!paid(payment.data,grant.paymentKey,grant.orderId,expected)) return null;
  return {
    productId:grant.productId,
    userKey:grant.userKey,
    orderId:grant.orderId,
    amount:expected,
    scopeKey:grant.productId === "compatibility" ? compatibilityScopeKeyFromUserKey(grant.userKey) : "",
  };
}
async function resolveVerifiedEntitlements(data, records, secret, signing) {
  const currentOwnerKey = ownerKey(data);
  const rows = Array.isArray(records) ? records.slice(0,12) : [];
  const verified = [];
  const seen = new Set();
  for (const row of rows) {
    const sig = String(row?.userKey || "") + "|" + String(row?.token || "");
    if (seen.has(sig)) continue;
    seen.add(sig);
    const purchase = await verifyPremiumPurchase(row,currentOwnerKey,secret,signing);
    if (purchase && !verified.some((x) => x.productId === purchase.productId && x.userKey === purchase.userKey)) verified.push(purchase);
  }
  return {
    ownerKey:currentOwnerKey,
    verifiedPurchases:verified,
    effectiveEntitlements:effectiveEntitlements(verified),
    allInOneQuote:calculateUpgradeQuote("all_in_one",verified),
  };
}
function signedGrantToken(grant, signing, version = "v3") {
  return (async () => {
    const payload = url64(enc.encode(JSON.stringify(grant)));
    return version + "." + payload + "." + (await hmac(version + "." + payload, signing));
  })();
}

export async function onRequestPost({ request, env }) {
  const secret = env.TOSS_SECRET_KEY;
  const signing = env.TOKEN_SIGNING_SECRET;
  if (!secret || !signing) return reply({ ok:false, message:"서버 결제 설정을 확인해주세요." },500);
  const origin = request.headers.get("Origin");
  if (origin && origin !== new URL(request.url).origin) return reply({ ok:false },403);
  let body;
  try {
    const raw = await request.text();
    if (raw.length > 48000) return reply({ ok:false },413);
    body = JSON.parse(raw);
    if (!body || typeof body !== "object") throw new Error();
  } catch {
    return reply({ ok:false, message:"요청 형식을 확인해주세요." },400);
  }

  try {
    if (body.action === "catalog") {
      return reply({ ok:true, products:Object.fromEntries(Object.entries(PRODUCTS).map(([id,p]) => [id,{ amount:p.amount,name:p.name }])) });
    }

    if (body.action === "entitlements") {
      const data = snapshot(body.data);
      const state = await resolveVerifiedEntitlements(data,body.tokens,secret,signing);
      return reply({ ok:true,...state });
    }

    if (body.action === "prepare") {
      const data = snapshot(body.data);
      const product = productFor(data);
      const entitlementState = await resolveVerifiedEntitlements(data,body.entitlementTokens,secret,signing);
      if (isProductAlreadyEntitled(data.p,entitlementState.verifiedPurchases,data)) {
        return reply({ ok:false, message:"이미 구매했거나 완전판에 포함된 상품이야. 다시 결제하지 않아도 돼." },409);
      }
      const quote = calculateUpgradeQuote(data.p,entitlementState.verifiedPurchases);
      if (quote.amount <= 0) return reply({ ok:false, message:"이미 이용 가능한 상품이야." },409);
      const orderId = "SAJU2_" + crypto.randomUUID().replace(/-/g,"");
      const ticket = await seal({
        v:2, orderId, data, amount:quote.amount, quote,
        verifiedProducts:entitlementState.verifiedPurchases.map((x) => x.productId),
        exp:Date.now()+TTL,
      },signing);
      return reply({
        ok:true, orderId, ticket, userKey:resultKey(data), ownerKey:ownerKey(data),
        amount:quote.amount, baseAmount:product.amount, productId:data.p, orderName:product.name, quote,
      });
    }

    if (body.action === "resume") {
      const order = await unseal(body.ticket,signing);
      const product = productFor(order.data);
      const amount = Number(order.amount ?? product.amount);
      return reply({
        ok:true, orderId:order.orderId, data:order.data, userKey:resultKey(order.data), ownerKey:ownerKey(order.data),
        amount, baseAmount:product.amount, productId:order.data.p, orderName:product.name,
        quote:order.quote || { targetProduct:order.data.p,baseAmount:product.amount,creditAmount:0,amount,alreadyOwned:false,creditedProducts:[] },
      });
    }

    if (body.action === "verify") {
      const { userKey, token } = body;
      const expectedProductId = typeof body.expectedProductId === "string" ? body.expectedProductId : "";
      if (
        typeof userKey !== "string" ||
        userKey.length > 3000 ||
        typeof token !== "string" ||
        token.length > 8192 ||
        (expectedProductId && !PRODUCTS[expectedProductId])
      ) return reply({ ok:false },400);

      // 구형 HMAC 토큰은 990원 concern_single 전용이다. 프리미엄 상품 재열람에는 사용하지 않는다.
      if (!token.startsWith("v2.") && !token.startsWith("v3.")) {
        if (expectedProductId && expectedProductId !== "concern_single") return reply({ ok:false });
        return reply({ ok:equal(token,await hmac(userKey,signing)) });
      }

      const grant = await parseSignedGrant(token,signing);
      if (!grant || grant.userKey !== userKey) return reply({ ok:false });

      const entitlesExpectedProduct =
        !expectedProductId ||
        grant.productId === expectedProductId ||
        (
          grant.productId === "all_in_one" &&
          ["full_saju","concern_bundle3"].includes(expectedProductId)
        );
      if (!entitlesExpectedProduct) {
        return reply({ ok:false, productId:grant.productId || "" });
      }

      const expected = Number(grant.amount || PRODUCTS[grant.productId || "concern_single"].amount || 990);
      const payment = await toss(encodeURIComponent(grant.paymentKey),secret);
      if (!payment.ok) return reply({ ok:false,message:"구매 확인 서버에 연결하지 못했어요." },503);
      return reply({
        ok:paid(payment.data,grant.paymentKey,grant.orderId,expected),
        productId:grant.productId || "",
      });
    }

    if (body.action === "confirm") {
      if (typeof body.paymentKey !== "string" || !body.paymentKey || body.paymentKey.length > 200) {
        return reply({ ok:false,message:"결제 정보를 확인해주세요." },400);
      }
      const order = await unseal(body.ticket,signing);
      const product = productFor(order.data);
      const expectedAmount = Number(order.amount ?? product.amount);
      if (Number(body.amount) !== expectedAmount) return reply({ ok:false,message:"상품 금액이 일치하지 않아요." },400);
      const userKey = resultKey(order.data);
      if (body.orderId !== order.orderId || body.userKey !== userKey) {
        return reply({ ok:false,message:"주문과 분석 결과가 일치하지 않아요." },400);
      }
      let payment;
      let confirmFailure = null;
      try {
        payment = await toss("confirm",secret,{
          method:"POST",
          headers:{ "Idempotency-Key":order.orderId },
          body:JSON.stringify({ paymentKey:body.paymentKey,orderId:order.orderId,amount:expectedAmount }),
        });
        if (!payment.ok) confirmFailure = {
          status: payment.status,
          code: typeof payment.data?.code === "string" ? payment.data.code : "",
          message: typeof payment.data?.message === "string" ? payment.data.message : "",
        };
      } catch {
        payment = { ok:false,status:0,data:{} };
      }
      if (!payment.ok) {
        const lookup = await toss(encodeURIComponent(body.paymentKey),secret);
        if (lookup.ok && paid(lookup.data,body.paymentKey,order.orderId,expectedAmount)) {
          payment = lookup;
        } else if (confirmFailure && confirmFailure.status >= 400 && confirmFailure.status < 500) {
          return reply({
            ok:false,
            paymentFailed:true,
            code:confirmFailure.code,
            message:confirmFailure.message || "결제가 승인되지 않았어요. 다른 결제수단으로 다시 시도해주세요.",
          },409);
        } else {
          return reply({ ok:false,message:"결제 승인을 확인하지 못했어요. 같은 주문으로 다시 확인해주세요." },503);
        }
      }
      if (!paid(payment.data,body.paymentKey,order.orderId,expectedAmount)) {
        return reply({ ok:false,message:"결제 완료 상태가 아니에요. 같은 주문으로 다시 확인해주세요." },409);
      }
      const grant = {
        userKey, ownerKey:ownerKey(order.data), orderId:order.orderId, paymentKey:body.paymentKey,
        productId:order.data.p, amount:expectedAmount, baseAmount:product.amount, issuedAt:Date.now(),
      };
      const token = await signedGrantToken(grant,signing,"v3");
      return reply({ ok:true,token,productId:order.data.p,amount:expectedAmount,baseAmount:product.amount,quote:order.quote || null });
    }

    return reply({ ok:false,message:"지원하지 않는 요청이에요." },400);
  } catch (error) {
    if (error.message === "VERIFY_UNAVAILABLE") return reply({ ok:false,message:"기존 구매 확인이 지연되고 있어. 재결제하지 말고 잠시 후 다시 확인해줘." },503);
    const badInput = ["INPUT","TICKET","EXPIRED"].includes(error.message) || error.name === "OperationError" || error.name === "InvalidCharacterError";
    return reply({
      ok:false,
      message:badInput
        ? "주문 정보가 만료되었거나 올바르지 않아요. 이미 결제했다면 재결제하지 말고 주문번호로 문의해주세요."
        : "서버 확인이 지연되고 있어요. 잠시 후 다시 확인해주세요.",
    },badInput ? 400 : 503);
  }
}

export const __test = Object.freeze({
  PRODUCTS,
  ownerKey,
  ownerKeyFromLegacyUserKey,
  effectiveEntitlements,
  calculateUpgradeQuote,
  isProductAlreadyEntitled,
  validateExtra,
  snapshot,
  resultKey,
  compatibilityScopeKeyFromData,
  compatibilityScopeKeyFromUserKey,
  signedGrantToken,
  resolveVerifiedEntitlements,
});
