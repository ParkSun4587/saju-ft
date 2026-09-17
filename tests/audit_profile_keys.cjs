const { chromium } = require('playwright');
(async()=>{
  const browser = await chromium.launch({headless:true});
  const page = await browser.newPage();
  await page.goto('http://127.0.0.1:4173/index.html', {waitUntil:'networkidle'});
  const out = await page.evaluate(() => {
    const r = calculateAccurateManse(1998,2,21,'03:10','male');
    function shape(x, depth=0) {
      if (depth>4 || x==null) return typeof x;
      if (Array.isArray(x)) return {type:'array', len:x.length, sample:x.length ? shape(x[0], depth+1) : null};
      if (typeof x !== 'object') return typeof x;
      const o={};
      for (const [k,v] of Object.entries(x)) o[k]=shape(v, depth+1);
      return o;
    }
    return { keys:Object.keys(r), shape:shape(r), sample:r };
  });
  console.log('PROFILE_AUDIT_KEYS', JSON.stringify(out.keys));
  console.log('PROFILE_AUDIT_SHAPE', JSON.stringify(out.shape));
  console.log('PROFILE_AUDIT_SAMPLE', JSON.stringify(out.sample));
  await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
