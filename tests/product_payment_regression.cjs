const fs = require('fs');
function assert(cond, msg) { if (!cond) throw new Error(msg); }
const src = fs.readFileSync('functions/api/confirm-payment.js', 'utf8');
const expected = {
  concern_single: 990,
  concern_pack3: 2900,
  full_saju: 4900,
  compatibility: 3900,
  premium_all: 9900,
};
for (const [id, price] of Object.entries(expected)) {
  const re = new RegExp(id + ':\\s*\\{\\s*price:\\s*' + price + '\\s*\\}');
  assert(re.test(src), `${id}: server price mapping missing`);
}
assert(/const DEFAULT_PRODUCT = "concern_single"/.test(src), 'legacy default product missing');
assert(/if \(!d\.p \|\| d\.p === DEFAULT_PRODUCT\)[\s\S]*?"sazu_v2_"/.test(src), 'legacy 990 userKey compatibility missing');
assert(/d\.p === "concern_pack3"[\s\S]*?d\.s\.length !== 3/.test(src), 'pack selection validation missing');
assert(/d\.p === "compatibility"\) d\.x = partnerSnapshot/.test(src), 'compatibility partner validation missing');
assert(/const expectedAmount = priceOf\(order\.data\)/.test(src), 'confirm does not derive signed server price');
assert(/Number\(body\.amount\) !== expectedAmount/.test(src), 'client amount tamper guard missing');
assert(/paid\(payment\.data, body\.paymentKey, order\.orderId, expectedAmount\)/.test(src), 'paid-state verification not product-aware');
assert(/amount: expectedAmount/.test(src) && /productId: order\.data\.p/.test(src), 'purchase grant missing product amount/id');
console.log('PRODUCT_PAYMENT_PASS', JSON.stringify({products:Object.keys(expected).length,prices:expected,legacy990:true,tamperGuard:true}));
