// Cloudflare Pages Functions: 기존 990원 상품을 보존하면서 상품별 금액을 서버에서 확정합니다.
const PRODUCTS = Object.freeze({
  concern_single: { amount: 990, name: "어떤언니 고민 심층 분석" },
  concern_bundle3: { amount: 2900, name: "어떤언니 고민 3개 더 깊게" },
  full_saju: { amount: 4900, name: "어떤언니 내 전체 사주판" },
  compatibility: { amount: 5900, name: "어떤언니 우리 둘 궁합" },
  all_in_one: { amount: 9900, name: "어떤언니 올인원" },
});
const TTL = 7 * 24 * 60 * 60 * 1000;
const enc = new TextEncoder();
const concerns = ["money", "career", "love", "path", "people", "mental"];

function reply(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
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
  const p = {
    n: cleanName(input.n, "상대"),
    b: input.b,
    t: input.t,
    g: input.g,
    c: input.c,
    l: input.l === true,
  };
  if (
    !/^\d{8}$/.test(p.b) ||
    !(p.t === "unknown" || /^([01]\d|2[0-3]):[0-5]\d$/.test(p.t)) ||
    !["female", "male"].includes(p.g) ||
    !["solar", "lunar"].includes(p.c) ||
    (p.c === "solar" && p.l)
  ) throw new Error("INPUT");
  return p;
}
function validateExtra(productId, input) {
  const x = input && typeof input === "object" ? input : {};
  if (productId === "concern_bundle3") {
    if (!Array.isArray(x.concerns)) throw new Error("INPUT");
    const picked = [...new Set(x.concerns.filter((v) => concerns.includes(v)))];
    if (picked.length !== 3) throw new Error("INPUT");
    return { concerns: picked };
  }
  if (productId === "compatibility") return { partner: validatePartner(x.partner) };
  return {};
}
function snapshot(input) {
  if (!input || typeof input !== "object") throw new Error("INPUT");
  const productId = typeof input.p === "string" && PRODUCTS[input.p] ? input.p : "concern_single";
  const d = {
    n: input.n,
    b: input.b,
    t: input.t,
    g: input.g,
    c: input.c,
    k: input.k,
    m: input.m,
    l: input.l === true,
    p: productId,
    x: validateExtra(productId, input.x),
  };
  if (
    typeof d.n !== "string" || !d.n.trim() || d.n.length > 40 || /[\x00-\x1f]/.test(d.n) ||
    !/^\d{8}$/.test(d.b) ||
    !(d.t === "unknown" || /^([01]\d|2[0-3]):[0-5]\d$/.test(d.t)) ||
    !["female", "male"].includes(d.g) ||
    !["solar", "lunar"].includes(d.c) ||
    !concerns.includes(d.k) ||
    !["F", "T"].includes(d.m) ||
    (d.c === "solar" && d.l)
  ) throw new Error("INPUT");
  return d;
}
function productFor(d) {
  return PRODUCTS[d?.p] || PRODUCTS.concern_single;
}
function resultKey(d) {
  const legacy = "sazu_v2_" + JSON.stringify([d.n, d.b, d.t, d.g, d.c, d.l, d.k]);
  if (!d.p || d.p === "concern_single") return legacy;
  return legacy + "::" + d.p + "::" + JSON.stringify(d.x || {});
}
async function aesKey(secret) {
  const digest = await crypto.subtle.digest("SHA-256", enc.encode("unni-order-v2:" + secret));
  return crypto.subtle.importKey("raw", digest, "AES-GCM", false, ["encrypt", "decrypt"]);
}
async function seal(value, secret) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, await aesKey(secret), enc.encode(JSON.stringify(value)));
  return url64(iv) + "." + url64(encrypted);
}
async function unseal(ticket, secret) {
  if (typeof ticket !== "string" || ticket.length > 8192) throw new Error("TICKET");
  const parts = ticket.split(".");
  if (parts.length !== 2) throw new Error("TICKET");
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: bytes64(parts[0]) }, await aesKey(secret), bytes64(parts[1]));
  const value = JSON.parse(new TextDecoder().decode(plain));
  if (value.v !== 2 || !Number.isFinite(value.exp) || value.exp < Date.now()) throw new Error("EXPIRED");
  value.data = snapshot(value.data);
  return value;
}
async function toss(path, secret, options = {}) {
  const response = await fetch("https://api.tosspayments.com/v1/payments/" + path, {
    ...options,
    headers: {
      Authorization: "Basic " + btoa(secret + ":"),
      "Content-Type": "application/json",
      ...options.headers,
    },
    signal: AbortSignal.timeout(12000),
  });
  return { ok: response.ok, status: response.status, data: await response.json() };
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

export async function onRequestPost({ request, env }) {
  const secret = env.TOSS_SECRET_KEY;
  const signing = env.TOKEN_SIGNING_SECRET;
  if (!secret || !signing) return reply({ ok: false, message: "서버 결제 설정을 확인해주세요." }, 500);
  const origin = request.headers.get("Origin");
  if (origin && origin !== new URL(request.url).origin) return reply({ ok: false }, 403);
  let body;
  try {
    const raw = await request.text();
    if (raw.length > 24000) return reply({ ok: false }, 413);
    body = JSON.parse(raw);
    if (!body || typeof body !== "object") throw new Error();
  } catch {
    return reply({ ok: false, message: "요청 형식을 확인해주세요." }, 400);
  }
  try {
    if (body.action === "catalog") {
      return reply({ ok: true, products: Object.fromEntries(Object.entries(PRODUCTS).map(([id, p]) => [id, { amount: p.amount, name: p.name }])) });
    }
    if (body.action === "prepare") {
      const data = snapshot(body.data);
      const product = productFor(data);
      const orderId = "SAJU2_" + crypto.randomUUID().replace(/-/g, "");
      const ticket = await seal({ v: 2, orderId, data, exp: Date.now() + TTL }, signing);
      return reply({ ok: true, orderId, ticket, userKey: resultKey(data), amount: product.amount, productId: data.p, orderName: product.name });
    }
    if (body.action === "resume") {
      const order = await unseal(body.ticket, signing);
      const product = productFor(order.data);
      return reply({ ok: true, orderId: order.orderId, data: order.data, userKey: resultKey(order.data), amount: product.amount, productId: order.data.p, orderName: product.name });
    }
    if (body.action === "verify") {
      const { userKey, token } = body;
      if (typeof userKey !== "string" || userKey.length > 3000 || typeof token !== "string" || token.length > 8192) return reply({ ok: false }, 400);
      // 기존 단일 990원 구매 토큰을 계속 인정합니다.
      if (!token.startsWith("v2.")) return reply({ ok: equal(token, await hmac(userKey, signing)) });
      const parts = token.split(".");
      if (parts.length !== 3 || !equal(parts[2], await hmac("v2." + parts[1], signing))) return reply({ ok: false });
      const grant = JSON.parse(new TextDecoder().decode(bytes64(parts[1])));
      if (grant.userKey !== userKey) return reply({ ok: false });
      const expected = Number(grant.amount || PRODUCTS[grant.productId || "concern_single"].amount || 990);
      const payment = await toss(encodeURIComponent(grant.paymentKey), secret);
      if (!payment.ok) return reply({ ok: false, message: "구매 확인 서버에 연결하지 못했어요." }, 503);
      return reply({ ok: paid(payment.data, grant.paymentKey, grant.orderId, expected) });
    }
    if (body.action === "confirm") {
      if (typeof body.paymentKey !== "string" || !body.paymentKey || body.paymentKey.length > 200) return reply({ ok: false, message: "결제 정보를 확인해주세요." }, 400);
      const order = await unseal(body.ticket, signing);
      const product = productFor(order.data);
      if (Number(body.amount) !== product.amount) return reply({ ok: false, message: "상품 금액이 일치하지 않아요." }, 400);
      const userKey = resultKey(order.data);
      if (body.orderId !== order.orderId || body.userKey !== userKey) return reply({ ok: false, message: "주문과 분석 결과가 일치하지 않아요." }, 400);
      let payment;
      try {
        payment = await toss("confirm", secret, {
          method: "POST",
          headers: { "Idempotency-Key": order.orderId },
          body: JSON.stringify({ paymentKey: body.paymentKey, orderId: order.orderId, amount: product.amount }),
        });
      } catch {
        payment = { ok: false, data: {} };
      }
      if (!payment.ok) payment = await toss(encodeURIComponent(body.paymentKey), secret);
      if (!payment.ok) return reply({ ok: false, message: "결제 승인을 확인하지 못했어요. 같은 주문으로 다시 확인해주세요." }, 503);
      if (!paid(payment.data, body.paymentKey, order.orderId, product.amount)) return reply({ ok: false, message: "결제 완료 상태가 아니에요. 입금 대기·취소 여부를 확인해주세요." }, 409);
      const payload = url64(enc.encode(JSON.stringify({ userKey, orderId: order.orderId, paymentKey: body.paymentKey, productId: order.data.p, amount: product.amount })));
      const token = "v2." + payload + "." + (await hmac("v2." + payload, signing));
      return reply({ ok: true, token, productId: order.data.p, amount: product.amount });
    }
    return reply({ ok: false, message: "지원하지 않는 요청이에요." }, 400);
  } catch (error) {
    const badInput = ["INPUT", "TICKET", "EXPIRED"].includes(error.message) || error.name === "OperationError" || error.name === "InvalidCharacterError";
    return reply({ ok: false, message: badInput ? "주문 정보가 만료되었거나 올바르지 않아요. 이미 결제했다면 재결제하지 말고 주문번호로 문의해주세요." : "서버 확인이 지연되고 있어요. 잠시 후 다시 확인해주세요." }, badInput ? 400 : 503);
  }
}
