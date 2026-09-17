const { chromium } = require('playwright');

function assert(cond, msg) { if (!cond) throw new Error(msg); }
function plain(s) { return String(s || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(); }
function paragraphs(s) {
  return String(s || '').split(/<br\s*\/?>\s*<br\s*\/?>/i).map(plain).filter(x => x.length >= 18);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(`[pageerror] ${e.stack || e.message}`));
  page.on('console', m => { if (m.type() === 'error') errors.push(`[console] ${m.text()}`); });
  await page.goto('http://127.0.0.1:4173/index.html', { waitUntil: 'load' });
  await page.waitForFunction(() =>
    window.__UNNI_PRODUCT_CATALOG_V2__?.version === '2.0.0' &&
    typeof premiumPolishNotesV2 === 'function' &&
    typeof buildFullSajuProductV2 === 'function' &&
    typeof buildConcernPackProductV2 === 'function' &&
    typeof buildCompatibilityProductV2 === 'function' &&
    typeof buildPremiumAllProductV2 === 'function' &&
    generateConcernNotes?.__premiumExperienceV2Wrapped === true
  );

  const result = await page.evaluate(() => {
    window.gtag = () => {};
    const concerns = ['money','career','love','path','people','mental'];
    const labels = { money:'재물·돈복', career:'학업·커리어', love:'연애·썸', path:'진로·미래', people:'인간관계', mental:'번아웃·멘탈' };
    function make(y,m,d,time,gender,birth) {
      const r = calculateAccurateManse(y,m,d,time,gender);
      return {
        ...r,
        name:'테스트', userName:'테스트', userBirthStr:birth,
        userTimeKey:time || 'unknown', userGender:gender, userCalendar:'solar',
        currentMode:'F', concernKey:'money', isLeapMonth:false,
        rawSolutionTemplate:{F:{acts:[]},T:{acts:[]}},
      };
    }
    const exact = make(1998,2,21,'03:10','female','19980221');
    const other = make(1990,1,2,'12:00','female','19900102');
    const sampleCharts = [
      exact,
      other,
      make(2001,5,6,'14:30','female','20010506'),
      make(1994,5,17,'08:15','female','19940517'),
      make(1988,7,1,'12:00','male','19880701'),
    ];

    const rows = [];
    for (const concern of concerns) {
      for (const mode of ['F','T']) {
        const data = {...exact, concernKey:concern, currentMode:mode};
        const notes = generateConcernNotes(data, mode);
        rows.push({ concern, mode, notes: notes.map(n => ({title:n.title, desc:n.desc, checklist:n.checklist})) });
      }
    }

    const cross = [];
    for (const concern of concerns) {
      const a = generateConcernNotes({...exact, concernKey:concern, currentMode:'F'}, 'F');
      const b = generateConcernNotes({...other, concernKey:concern, currentMode:'F'}, 'F');
      cross.push({ concern, diffs: a.filter((n,i) => n.desc !== b[i].desc).length });
    }

    const timingSamples = sampleCharts.map((chart, idx) => {
      const notes = generateConcernNotes({...chart, concernKey:concerns[idx % concerns.length], currentMode: idx % 2 ? 'T' : 'F'}, idx % 2 ? 'T' : 'F');
      return { idx, desc: notes[5].desc };
    });

    const full = buildFullSajuProductV2({...exact, concernKey:'career', currentMode:'F'}, 'F');
    const pack = buildConcernPackProductV2({...exact, concernKey:'money', currentMode:'T'}, 'T', ['career','love','mental']);
    const compat = buildCompatibilityProductV2({...exact, currentMode:'F'}, 'F', {
      n:'상대', b:'19940517', t:'08:15', g:'female', c:'solar', l:false,
    });
    const premium = buildPremiumAllProductV2({...exact, currentMode:'T'}, 'T');
    renderProductStoreV2({...exact, concernKey:'money', currentMode:'F'});
    const cards = Array.from(document.querySelectorAll('#unniProductStoreV2 [data-product-id]')).map(x => x.dataset.productId);
    return {
      rows, cross, timingSamples,
      catalog: window.__UNNI_PRODUCT_CATALOG_V2__,
      products: {
        full: {title:full.title, text:full.html},
        pack: {title:pack.title, text:pack.html, selected:pack.selected},
        compat: {title:compat.title, text:compat.html},
        premium: {title:premium.title, text:premium.html},
      },
      cards,
    };
  });

  const jargon = /(신강|신약|중화|격국|용신|상신|기신|지장간|월령|조후|통관|사령|십신|세운)/;
  const banned = /(언니가 잡은 사주 근거|언니가 잡은 계산 근거|왜 이 처방이 너한테 맞나|왜 이런 필터가 맞나|타이밍 읽는 법|개수는 원국 겉글자 기준|한국 만세력 기준|시간 -30분 보정)/;
  const fMarkers = ['언니','마음','같이','괜찮','좋겠','챙겨','힘들','아파','편안','해보자'];
  const tMarkers = ['하지 마','기준','손실','끊','확인','결정','정리','실행','숫자','버려'];
  let fText = '', tText = '';

  assert(result.rows.length === 12, `rows ${result.rows.length}`);
  for (const row of result.rows) {
    assert(row.notes.length === 6, `${row.concern}/${row.mode}: note count`);
    const titles = row.notes.map(n => n.title);
    const checks = row.notes.map(n => n.checklist);
    assert(new Set(titles).size === 6, `${row.concern}/${row.mode}: duplicate titles`);
    assert(new Set(checks).size === 6, `${row.concern}/${row.mode}: duplicate checklists`);
    const full = row.notes.map(n => `${n.title} ${n.desc} ${n.checklist}`).join(' ');
    assert(!jargon.test(full), `${row.concern}/${row.mode}: jargon leaked`);
    assert(!banned.test(full), `${row.concern}/${row.mode}: removed meta copy leaked`);
    assert(!/(undefined|NaN|null)/.test(full), `${row.concern}/${row.mode}: bad token`);
    row.notes.forEach((n, i) => assert(plain(n.desc).length >= 120, `${row.concern}/${row.mode}: NOTE${i+1} too thin (${plain(n.desc).length})`));
    const paras = row.notes.flatMap(n => paragraphs(n.desc));
    const duplicates = paras.filter((p, i) => paras.indexOf(p) !== i);
    assert(duplicates.length === 0, `${row.concern}/${row.mode}: repeated paragraph: ${duplicates[0]}`);
    const n6 = row.notes[5].desc;
    assert(n6.includes('data-timing-year="2026"') && n6.includes('data-timing-year="2027"'), `${row.concern}/${row.mode}: timing year blocks missing`);
    const y26 = plain((n6.match(/data-timing-year="2026"[^>]*>([\s\S]*?)<\/div>/)||[])[1]);
    const y27 = plain((n6.match(/data-timing-year="2027"[^>]*>([\s\S]*?)<\/div>/)||[])[1]);
    assert(y26 && y27, `${row.concern}/${row.mode}: timing bodies empty`);
    assert(y26 !== y27, `${row.concern}/${row.mode}: 2026/2027 copy duplicated`);
    if (row.mode === 'F') fText += ' ' + full; else tText += ' ' + full;
  }
  assert(fMarkers.filter(x => fText.includes(x)).length >= 8, 'F persona too weak');
  assert(tMarkers.filter(x => tText.includes(x)).length >= 8, 'T persona too weak');

  for (const x of result.cross) assert(x.diffs === 6, `${x.concern}: only ${x.diffs}/6 notes differ across charts`);
  for (const x of result.timingSamples) {
    const y26 = plain((x.desc.match(/data-timing-year="2026"[^>]*>([\s\S]*?)<\/div>/)||[])[1]);
    const y27 = plain((x.desc.match(/data-timing-year="2027"[^>]*>([\s\S]*?)<\/div>/)||[])[1]);
    assert(y26 !== y27, `sample ${x.idx}: timing duplication`);
  }

  const prices = Object.fromEntries(Object.entries(result.catalog.products).map(([k,v]) => [k,v.price]));
  assert(JSON.stringify(prices) === JSON.stringify({concern_single:990,concern_pack3:2900,full_saju:4900,compatibility:3900,premium_all:9900}), `catalog prices ${JSON.stringify(prices)}`);
  assert(new Set(result.cards).size === 5, `store cards ${result.cards.join(',')}`);
  assert(result.products.pack.selected.join(',') === 'career,love,mental', `pack selection ${result.products.pack.selected}`);
  assert(plain(result.products.full.text).length > 1200, 'full saju product too thin');
  assert(plain(result.products.pack.text).length > 2500, 'pack product too thin');
  assert(plain(result.products.compat.text).length > 500, 'compatibility product too thin');
  assert(plain(result.products.premium.text).length > 6000, 'premium product too thin');
  for (const [key, product] of Object.entries(result.products)) {
    assert(!jargon.test(plain(product.text)), `${key}: hard jargon leaked`);
    assert(!/(undefined|NaN|null)/.test(plain(product.text)), `${key}: bad token leaked`);
  }
  assert(errors.length === 0, `browser errors: ${errors.join(' | ')}`);

  console.log('PREMIUM_EXPERIENCE_PASS', JSON.stringify({
    rows: result.rows.length,
    allSixPersonalized: result.cross.every(x => x.diffs === 6),
    timingSamples: result.timingSamples.length,
    products: result.cards,
    prices,
  }));
  await browser.close();
})().catch(err => { console.error(err.stack || err); process.exit(1); });
