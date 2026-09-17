const { chromium } = require('playwright');
const fs = require('fs');
// Story-card v2 and persona-copy regressions live in this suite.

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
    const maleExact = calculateAccurateManse(1998,2,21,'03:10','male');
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
    const maleBase = {
      ...maleExact,
      name:'박태양',
      userBirthStr:'19980221',
      userTimeKey:'03:10',
      userGender:'male',
      userCalendar:'solar',
      currentMode:'F',
    };
    const maleMoney = generateConcernNotes({ ...maleBase, concernKey:'money' }, 'F')[5];
    const maleLove = generateConcernNotes({ ...maleBase, concernKey:'love' }, 'F')[5];

    return {
      paidVersion:globalThis.__PAID_VALUE_LAYER_V1__,
      productVersion:globalThis.__UNNI_PRODUCTS_V1__,
      products:globalThis.__UNNI_PRODUCTS_V1__.products,
      wrappers:{ paid:!!generateConcernNotes.__paidValueWrapped, integrated:!!generateConcernNotes.__integratedProfileWrapped },
      rows,
      maleShared: {
        money: maleMoney?.__timingQA || {},
        love: maleLove?.__timingQA || {},
        moneyDesc: maleMoney?.desc || '',
        loveDesc: maleLove?.desc || '',
      },
    };
  });

  assert(qa.paidVersion.version === '1.0.0', 'paid value layer missing');
  assert(qa.productVersion.version === '1.0.0', 'product layer missing');
  assert(qa.wrappers.paid, 'paid-value wrapper missing');
  assert(qa.wrappers.integrated, 'integrated wrapper metadata lost');
  const expectedPrices = { concern_bundle3:2900, full_saju:4900, compatibility:5900, all_in_one:9900 };
  for (const [id, price] of Object.entries(expectedPrices)) assert(qa.products[id]?.price === price, `${id} price drift`);
  assert(qa.products.concern_bundle3.desc.includes('총 18개'), 'bundle3 delivered-volume copy missing');
  assert(qa.products.full_saju.desc.includes('12개 챕터'), 'full-saju delivered-volume copy missing');
  assert(qa.products.compatibility.desc.includes('16개 챕터'), 'compatibility delivered-volume copy missing');
  assert(qa.products.all_in_one.desc.includes('NOTE 36개'), 'all-in-one delivered-volume copy missing');
  assert(qa.rows.length === 12, `expected 12 rows, got ${qa.rows.length}`);
  assert(qa.maleShared.money.firstDate === qa.maleShared.love.firstDate, 'male money/love first timing should legitimately share the same sensitive axis');
  assert(qa.maleShared.money.secondDate === qa.maleShared.love.secondDate, 'male money/love second timing should legitimately share the same sensitive axis');
  assert(qa.maleShared.money.sharedTimingWith === 'love' && qa.maleShared.love.sharedTimingWith === 'money', 'shared timing pairing metadata missing');
  assert(qa.maleShared.moneyDesc.includes('복붙한 게 아니라') && qa.maleShared.loveDesc.includes('복붙한 게 아니라'), 'shared timing explanation missing from F copy');
  assert(norm(qa.maleShared.money.firstBody) !== norm(qa.maleShared.love.firstBody), 'same date must still produce concern-specific first action');
  assert(norm(qa.maleShared.money.secondBody) !== norm(qa.maleShared.love.secondBody), 'same date must still produce concern-specific second action');

  for (const r of qa.rows) {
    assert(r.count === 6, `${r.concern}/${r.mode}: note count ${r.count}`);
    assert(r.first && r.second, `${r.concern}/${r.mode}: timing bodies missing`);
    assert(r.firstDate && r.secondDate, `${r.concern}/${r.mode}: timing dates missing`);
    assert(norm(r.first) !== norm(r.second), `${r.concern}/${r.mode}: NOTE6 period body copied`);
    assert(!r.timingDuplicate, `${r.concern}/${r.mode}: timing duplicate audit failed`);
    assert(r.hardTerms.length === 0, `${r.concern}/${r.mode}: hard terms leaked ${JSON.stringify(r.hardTerms)}`);
    assert(r.toneScore >= 3, `${r.concern}/${r.mode}: persona tone too weak ${r.toneScore}`);
    assert(r.desc.includes('첫 번째 흐름') && r.desc.includes('두 번째 흐름') && r.desc.includes('두 시기의 차이'), `${r.concern}/${r.mode}: NOTE6 distinction headings missing`);
    assert(!/[💕❤♥💖💗💓💞💘💝]/u.test(r.desc), `${r.concern}/${r.mode}: decorative heart leaked into NOTE6`);
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
    openShareModal();
    const story = document.getElementById('storyCard');
    const share = {
      version: story?.dataset?.shareVersion || '',
      text: story?.innerText || '',
      core: document.getElementById('cardCoreElement')?.innerText || '',
      strong: document.getElementById('cardStrongElement')?.innerText || '',
      need: document.getElementById('cardNeedElement')?.innerText || '',
      avatar: document.getElementById('cardSisterAvatar')?.getAttribute('src') || '',
    };
    closeShareModal();
    return {
      result:!!currentResultData,
      catalog:!!catalog,
      buttons:catalog ? catalog.querySelectorAll('[data-unni-product]').length : 0,
      note6First:note6?.__timingQA?.firstBody || '',
      note6Second:note6?.__timingQA?.secondBody || '',
      note6Text:note6?.desc || '',
      share,
    };
  });
  assert(ui.result, 'production-like result missing');
  assert(ui.catalog, 'product catalog not rendered');
  assert(ui.buttons === 4, `product catalog buttons ${ui.buttons}`);
  assert(norm(ui.note6First) !== norm(ui.note6Second), 'production-like NOTE6 copied');
  assert(ui.share.version === '2', `story card version ${ui.share.version}`);
  assert(ui.share.text.includes('사주로 까본 내 본캐') && ui.share.text.includes('나를 설명하는 3문장') && ui.share.text.includes('링크 스티커는 여기'), 'story card identity/share copy missing');
  assert(ui.share.core && ui.share.strong && ui.share.need, `story card element strip missing: ${JSON.stringify(ui.share)}`);
  assert(ui.share.avatar === './로아.png', `F story avatar mismatch: ${ui.share.avatar}`);

  await page.evaluate(() => openUnniProduct('full_saju'));
  await page.waitForSelector('#unniProductModal', { state:'visible' });
  let modal = await page.locator('#unniProductModal').innerText();
  assert(modal.includes('내 전체 사주판') && modal.includes('무료 이벤트로 미리보기'), 'full_saju modal setup missing');
  await page.locator('#unniProductAction').click();
  modal = await page.locator('#unniProductModal').innerText();
  const fullSections = await page.locator('#unniProductBody section').count();
  assert(fullSections === 12, `full_saju section count ${fullSections}`);
  assert(modal.includes('내 사주 전체 한 줄 요약') && modal.includes('평생 가져갈 내 사용법 3가지'), 'full_saju preview content missing');
  assert(modal.includes('지금 선택한 고민을 또 풀어쓰는 리포트가 아니야'), 'full_saju differentiation copy missing');
  await page.locator('#unniProductClose').click();

  await page.evaluate(() => openUnniProduct('concern_bundle3'));
  await page.locator('#unniProductAction').click();
  modal = await page.locator('#unniProductModal').innerText();
  const bundleArticles = await page.locator('#unniProductBody article').count();
  assert(bundleArticles === 18, `bundle3 NOTE card count ${bundleArticles}`);
  await page.locator('#unniProductClose').click();

  await page.evaluate(() => openUnniProduct('compatibility'));
  modal = await page.locator('#unniProductModal').innerText();
  assert(modal.includes('오전/오후') && modal.includes('몇 시') && modal.includes('몇 분') && modal.includes('태어난 시간을 몰라요'), 'human-readable partner time UI missing');
  assert(!modal.includes('HH:MM'), 'technical HH:MM leaked into compatibility UI');
  await page.fill('#partnerName', '상대');
  await page.fill('#partnerBirth', '19990511');
  await page.selectOption('#partnerAmpm', 'pm');
  await page.selectOption('#partnerHour12', '12');
  await page.selectOption('#partnerMinute', '00');
  await page.locator('#unniProductAction').click();
  modal = await page.locator('#unniProductModal').innerText();
  const compatibilitySections = await page.locator('#unniProductBody section').count();
  assert(compatibilitySections === 16, `compatibility section count ${compatibilitySections}`);
  assert(modal.includes('우리 둘 궁합 · 16개 챕터'), 'compatibility chapter intro missing');
  assert(modal.includes('처음 서로에게 끌리는 이유') && modal.includes('싸움이 커지는 순서') && modal.includes('싸운 뒤 화해하는 법') && modal.includes('돈과 현실 문제를 같이 다룰 때') && modal.includes('둘이 실제로 지키면 좋은 약속'), 'compatibility deep content missing');
  await page.locator('#unniProductClose').click();

  await page.evaluate(() => openUnniProduct('all_in_one'));
  await page.locator('#unniProductAction').click();
  modal = await page.locator('#unniProductModal').innerText();
  for (const label of ['재물·돈복','직장·커리어','연애·썸','진로·내 길','인간관계','마음·회복']) assert(modal.includes(label), `all-in-one missing ${label}`);
  const allInOneArticles = await page.locator('#unniProductBody article').count();
  assert(allInOneArticles === 36, `all-in-one NOTE card count ${allInOneArticles}`);
  await page.locator('#unniProductClose').click();

  const html = fs.readFileSync('index.html','utf8');
  assert(html.includes('./paid-value-layer-v1.js?v=1.0.0'), 'paid value script include missing');
  assert(html.includes('./premium-products-v1.js?v=1.0.0'), 'product script include missing');
  assert(html.indexOf('integrated-saju-profile-v1.js') < html.indexOf('paid-value-layer-v1.js'), 'script wrapper order wrong');
  assert(html.indexOf('paid-value-layer-v1.js') < html.indexOf('premium-products-v1.js'), 'product script order wrong');
  assert(html.includes('resume.productId !== "concern_single"'), 'product payment return delegation missing');

  for (const prodPath of ['index.html','premium-products-v1.js','paid-value-layer-v1.js','integrated-saju-profile-v1.js','classical-engine-v2.js','manse-korea-v2.js']) {
    const prodText = fs.readFileSync(prodPath, 'utf8');
    assert(!prodText.includes('원국'), `technical 원국 wording remains in ${prodPath}`);
  }

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
