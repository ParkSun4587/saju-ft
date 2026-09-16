const fs = require('fs');
const path = require('path');
const lunarLib = require('lunar-javascript');
const koreanLib = require('korean-lunar-calendar');

global.Solar = lunarLib.Solar;
global.Lunar = lunarLib.Lunar;
global.KoreanLunarCalendar = koreanLib.default || koreanLib.KoreanLunarCalendar || koreanLib;
global.JIE_ORDER = ['立春','惊蛰','清明','立夏','芒种','小暑','立秋','白露','寒露','立冬','大雪','小寒'];
global.computeSipsin = () => '';
require(path.resolve('manse-korea-v2.js'));
require(path.resolve('classical-engine-v2.js'));

function assert(cond, msg) { if (!cond) throw new Error(msg); }
function pillars(b, hourKnown=true) {
  return {
    year: { gan:b.getYearGan(), zhi:b.getYearZhi() },
    month: { gan:b.getMonthGan(), zhi:b.getMonthZhi() },
    day: { gan:b.getDayGan(), zhi:b.getDayZhi() },
    ...(hourKnown ? {hour:{gan:b.getTimeGan(), zhi:b.getTimeZhi()}} : {}),
  };
}

const ref = JSON.parse(fs.readFileSync('/tmp/manse_reference.json', 'utf8'));
let boundaryPairs = 0;
let saryeongCases = 0;
let maxAfter = 0;
let minBefore = Infinity;

for (const c of ref.terms) {
  const b = c.before;
  const a = c.after;
  const rb = global.createKoreanHybridBaZi(b.Y,b.M,b.D,b.h,b.mi,true);
  const ra = global.createKoreanHybridBaZi(a.Y,a.M,a.D,a.h,a.mi,true);
  const db = rb.calendarMeta.daysFromJie;
  const da = ra.calendarMeta.daysFromJie;
  assert(Number.isFinite(db), `${c.year} ${c.name}: before daysFromJie missing`);
  assert(Number.isFinite(da), `${c.year} ${c.name}: after daysFromJie missing`);
  // Reference points are ±5 minutes around an independently generated astronomical Jie instant.
  assert(da >= 0 && da < 0.02, `${c.year} ${c.name}: after should reset near zero, got ${da}`);
  assert(db > 20 && db <= 40, `${c.year} ${c.name}: before should belong to prior Jie month, got ${db}`);
  maxAfter = Math.max(maxAfter, da);
  minBefore = Math.min(minBefore, db);

  const g = global.determineGyeokgukFromPillarsV2(pillars(ra.baZi), ra.calendarMeta);
  assert(g.saryeongGan, `${c.year} ${c.name}: saryeongGan missing after Jie`);
  assert(g.confidence === 'high', `${c.year} ${c.name}: expected high confidence with elapsed Jie days, got ${g.confidence}`);
  boundaryPairs++;
  saryeongCases++;
}

// Broad noon samples: metadata must remain bounded throughout the supported validation window.
let randomish = 0;
for (let y = 1900; y <= 2050; y += 5) {
  for (const m of [1,3,5,7,9,11]) {
    for (const d of [8,18,28]) {
      const r = global.createKoreanHybridBaZi(y,m,d,12,0,true);
      const days = r.calendarMeta.daysFromJie;
      assert(Number.isFinite(days), `${y}-${m}-${d}: daysFromJie missing`);
      assert(days >= 0 && days <= 40, `${y}-${m}-${d}: daysFromJie out of range ${days}`);
      randomish++;
    }
  }
}

console.log(JSON.stringify({
  boundaryPairs,
  saryeongCases,
  broadSamples: randomish,
  maxAfterDays: maxAfter,
  minBeforeDays: minBefore,
  status: 'PASS',
}, null, 2));
