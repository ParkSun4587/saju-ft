const { chromium } = require('playwright');
const fs = require('fs');

function assert(cond, msg) { if (!cond) throw new Error(msg); }
function norm(v) {
  return String(v || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\d{4}년/g, 'YEAR')
    .replace(/\d{1,2}월/g, 'MONTH')
    .replace(/[\s.,!?·‘’'"“”()\[\]]/g, '');
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on('pageerror', e => errors.push(`[pageerror] ${e.stack || e.message}`));
  page.on('console', m => { if (m.type() === 'error') errors.push(`[console] ${m.text()}`); });
  await page.goto('http://127.0.0.1:4173/index.html', { waitUntil: 'load', timeout: 60000 });
  await page.waitForFunction(() =>
    globalThis.__PAID_VALUE_LAYER_V1__?.version === '1.0.0' &&
    globalThis.__UNNI_PRODUCTS_V1__?.version === '1.0.0' &&
    typeof generateConcernNotes === 'function' &&
    typeof auditPaidValueNotes === 'function', null, { timeout: 60000 });

  const qa = await page.evaluate(() => {
    window.gtag = () => {};
    const concerns = ['money','career','love','path','people','mental'];
    const exact = calculateAccurateManse(1998,2,21,'03:10','female');
    const rows = [];
    for (const concern of concerns) {
      for (const mode of ['F','T']) {
        const data = {
          ...exact,
          name:'박태양',
          concernKey:concern,
          userBirthStr:'19980221',
          userTimeKey:'03:10',
          userGender:'female',
          userCalendar:'solar',
          currentMode:mode,
          rawSolutionTemplate:{ F:{acts:[{d:'a'},{d:'b'}]}, T:{acts:[{d:'a'},{d:'b'}]} },
        };
        const notes = generateConcernNotes(data, mode);
        const audit = data.paidValueAudit || auditPaidValueNotes(notes, mode);
        const n6 = notes[5];
        rows.push({
          concern, mode,
          count:notes.length,
          first:n6?.__timingQA?.firstBody || '',
          second:n6?.__timingQA?.secondBody || '',
          firstDate:n6?.__timingQA?.firstDate || '',
          secondDate:n6?.__timingQA?.secondDate || '',
          desc:n6?.desc || '',
          duplicateCount:audit.duplicates.length,
          hardTerms:audit.hardTerms,
          timingDuplicate:audit.timingDuplicate,
          toneScore:audit.toneScore,
          allText:notes.map(n => `${n.title} ${n.desc} ${n.checklist || ''}`).join(' '),
        });
      }
    }
    return {
      paidVersion:globalThis.__PAID_VALUE_LAYER_V1__,
      productVersion:globalThis.__UNNI_PRODUCTS_V1__,
      products:globalThis.__UNNI_PRODUCTS_V1__.products,
      wrappers:{ paid:!!generateConcernNotes.__paidValueWrapped, integrated:!!generateConcernNotes.__integratedProfileWrapped },
      rows,
    };
  });

  assert(qa.paidVersion.version === '1.0.0', 'paid value layer missing');
  assert(qa.productVersion.version === '1.0.0', 'product layer missing');
  assert(qa.wrappers.paid, 'paid-value wrapper missing');
  assert(qa.wrappers.integrated, 'integrated wrapper metadata lost');
  const expectedPrices = { concern_bundle3:2900, full_saju:4900, compatibility:5900, all_in_one:9900 };
  for (const [id, price] of Object.entries(expectedPrices)) assert(qa.products[id]?.price === price, `${id} price drift`);
  assert(qa.rows.length === 12, `expected 12 rows, got ${qa.rows.length}`);
  for (const r of qa.rows) {
    assert(r.count === 6, `${r.concern}/${r.mode}: note count ${r.count}`);
    assert(r.first && r.second, `${r.concern}/${r.mode}: timing bodies missing`);
    assert(r.firstDate && r.secondDate, `${r.concern}/${r.mode}: timing dates missing`);
    assert(norm(r.first) !== norm(r.second), `${r.concern}/${r.mode}: NOTE6 period body copied`);
    assert(!r.timingDuplicate, `${r.concern}/${r.mode}: timing duplicate audit failed`);
    assert(r.hardTerms.length === 0, `${r.concern}/${r.mode}: hard terms leaked ${JSON.stringify(r.hardTerms)}`);
    assert(r.toneScore >= 3, `${r.concern}/${r.mode}: persona tone too weak ${r.toneScore}`);
    assert(r.desc.includes('첫 번째 흐름') && r.desc.includes('두 번째 흐름') && r.desc.includes('두 시기의 차이'), `${r.concern}/${r.mode}: NOTE6 distinction headings missing`);
    assert(!/(undefined|NaN|null)/.test(r.allText), `${r.concern}/${r.mode}: bad token leaked`);
  }

  // Production-like result path: verify catalog is actually visible and free-launch previews work.
  const ui = await page.evaluate(() => {
    window.gtag = () => {};
    window.setTimeout = (fn) => { fn(); return 1; };
    window.clearTimeout = () => {};
    document.getElementById('nameInput').value = '박태양';
    document.getElementById('selectedConcernKey').value = 'mental';
    document.getElementById('birthDateInput').value = '19980221';
    document.getElementById('calendarSelect').value = 'solar';
    document.getElementById('genderValue').value = 'female';
    const ub = document.getElementById('birthTimeUnknown');
    ub.checked = false;
    document.getElementById('birthTimeInput').value = '0310';
    toggleBirthTimeUnknown(ub, false);
    startAnalysis('F');
    renderUnniProductCatalog();
    const notes = generateConcernNotes(currentResultData, 'F');
    const note6 = notes[5];
    const catalog = document.getElementById('unniProductLadder');
    return {
      result:!!currentResultData,
      catalog:!!catalog,
      buttons:catalog ? catalog.querySelectorAll('[data-unni-product]').length : 0,
      note6First:note6?.__timingQA?.firstBody || '',
      note6Second:note6?.__timingQA?.secondBody || '',
      note6Text:note6?.desc || '',
    };
  });
  assert(ui.result, 'production-like result missing');
  assert(ui.catalog, 'product catalog not rendered');
  assert(ui.buttons === 4, `product catalog buttons ${ui.buttons}`);
  assert(norm(ui.note6First) !== norm(ui.note6Second), 'production-like NOTE6 copied');

  await page.evaluate(() => openUnniProduct('full_saju'));
  await page.waitForSelector('#unniProductModal', { state:'visible' });
  let modal = await page.locator('#unniProductModal').innerText();
  assert(modal.includes('내 전체 사주판') && modal.includes('무료 이벤트로 미리보기'), 'full_saju modal setup missing');
  await page.locator('#unniProductAction').click();
  modal = await page.locator('#unniProductModal').innerText();
  assert(modal.includes('너라는 사람의 중심') && modal.includes('앞으로 움직일 때'), 'full_saju preview content missing');
  await page.locator('#unniProductClose').click();

  await page.evaluate(() => openUnniProduct('concern_bundle3'));
  await page.locator('#unniProductAction').click();
  modal = await page.locator('#unniProductModal').innerText();
  assert((modal.match(/NOTE 0[1-6]/g) || []).length >= 18, 'bundle3 did not render three six-note reports');
  await page.locator('#unniProductClose').click();

  await page.evaluate(() => openUnniProduct('compatibility'));
  await page.fill('#partnerName', '상대');
  await page.fill('#partnerBirth', '19990511');
  await page.fill('#partnerTime', '12:00');
  await page.locator('#unniProductAction').click();
  modal = await page.locator('#unniProductModal').innerText();
  assert(modal.includes('둘이 처음 끌리는 지점') && modal.includes('싸울 때 진짜 봐야 할 것') && modal.includes('오래 가려면'), 'compatibility preview content missing');
  await page.locator('#unniProductClose').click();

  await page.evaluate(() => openUnniProduct('all_in_one'));
  await page.locator('#unniProductAction').click();
  modal = await page.locator('#unniProductModal').innerText();
  for (const label of ['재물·돈복','직장·커리어','연애·썸','진로·내 길','인간관계','마음·회복']) assert(modal.includes(label), `all-in-one missing ${label}`);
  await page.locator('#unniProductClose').click();

  const html = fs.readFileSync('index.html','utf8');
  assert(html.includes('./paid-value-layer-v1.js?v=1.0.0'), 'paid value script include missing');
  assert(html.includes('./premium-products-v1.js?v=1.0.0'), 'product script include missing');
  assert(html.indexOf('integrated-saju-profile-v1.js') < html.indexOf('paid-value-layer-v1.js'), 'script wrapper order wrong');
  assert(html.indexOf('paid-value-layer-v1.js') < html.indexOf('premium-products-v1.js'), 'product script order wrong');
  assert(html.includes('resume.productId !== "concern_single"'), 'product payment return delegation missing');

  const server = fs.readFileSync('functions/api/confirm-payment.js','utf8');
  for (const [id, price] of Object.entries({concern_single:990, ...expectedPrices})) {
    assert(server.includes(`${id}: { amount: ${price}`), `server product price missing ${id}/${price}`);
  }
  assert(server.includes('const product = productFor(order.data);'), 'server does not resolve signed product price');
  assert(server.includes('Number(body.amount) !== product.amount'), 'server does not reject amount mismatch');
  assert(server.includes('if (!d.p || d.p === "concern_single") return legacy;'), 'legacy 990 result key compatibility missing');

  assert(errors.length === 0, `browser errors: ${errors.join(' | ')}`);
  console.log('PAID_VALUE_PRODUCT_PASS', JSON.stringify({
    rows:qa.rows.length,
    prices:expectedPrices,
    catalogButtons:ui.buttons,
    note6Distinct:true,
  }));
  await browser.close();
})().catch(err => { console.error(err.stack || err); process.exit(1); });
