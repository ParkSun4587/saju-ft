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

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}
function gzYear(b) { return b.getYearGan() + b.getYearZhi(); }
function gzMonth(b) { return b.getMonthGan() + b.getMonthZhi(); }
function gzDay(b) { return b.getDayGan() + b.getDayZhi(); }
function gzHour(b) { return b.getTimeGan() + b.getTimeZhi(); }

const ref = JSON.parse(fs.readFileSync('/tmp/manse_reference.json', 'utf8'));
let solarOk = 0;
for (const c of ref.solar) {
  const r = global.createKoreanHybridBaZi(c.Y, c.M, c.D, 12, 0, true);
  assert(gzYear(r.baZi) === c.year, `year ${c.Y}-${c.M}-${c.D}: ${gzYear(r.baZi)} != ${c.year}`);
  assert(gzMonth(r.baZi) === c.month, `month ${c.Y}-${c.M}-${c.D}: ${gzMonth(r.baZi)} != ${c.month}`);
  assert(gzDay(r.baZi) === c.day, `day ${c.Y}-${c.M}-${c.D}: ${gzDay(r.baZi)} != ${c.day}`);
  solarOk++;
}

let hourOk = 0;
for (const c of ref.hours) {
  const r = global.createKoreanHybridBaZi(c.Y, c.M, c.D, c.h, 0, true);
  assert(gzDay(r.baZi) === c.day, `hour-case day ${c.Y}-${c.M}-${c.D} ${c.h}:00`);
  assert(gzHour(r.baZi) === c.hour, `hour ${c.Y}-${c.M}-${c.D} ${c.h}:00: ${gzHour(r.baZi)} != ${c.hour}`);
  hourOk++;
}

let termOk = 0;
let unknownChecked = 0;
for (const c of ref.terms) {
  const b = c.before, a = c.after;
  const rb = global.createKoreanHybridBaZi(b.Y, b.M, b.D, b.h, b.mi, true);
  const ra = global.createKoreanHybridBaZi(a.Y, a.M, a.D, a.h, a.mi, true);
  assert(gzYear(rb.baZi) === c.beforeYear, `${c.year} ${c.name} before year ${gzYear(rb.baZi)} != ${c.beforeYear}`);
  assert(gzMonth(rb.baZi) === c.beforeMonth, `${c.year} ${c.name} before month ${gzMonth(rb.baZi)} != ${c.beforeMonth}`);
  assert(gzYear(ra.baZi) === c.afterYear, `${c.year} ${c.name} after year ${gzYear(ra.baZi)} != ${c.afterYear}`);
  assert(gzMonth(ra.baZi) === c.afterMonth, `${c.year} ${c.name} after month ${gzMonth(ra.baZi)} != ${c.afterMonth}`);
  termOk++;
  if (unknownChecked < 120 && b.Y === a.Y && b.M === a.M && b.D === a.D && global.__MANSE_KOREA_V2__.isTermBoundaryDate(b.Y, b.M, b.D)) {
    let blocked = false;
    try {
      global.createKoreanHybridBaZi(b.Y, b.M, b.D, 12, 0, false);
    } catch (e) {
      blocked = e && e.code === 'KST_TERM_TIME_REQUIRED';
    }
    assert(blocked, `${c.year} ${c.name}: unknown time should be blocked`);
    unknownChecked++;
  }
}

const I = global.__MANSE_KOREA_V2__;
const offsets = [
  [1956,1,1,12,0,510],
  [1960,6,1,12,0,570],
  [1988,7,1,12,0,600],
  [2026,2,4,12,0,540],
];
for (const [Y,M,D,h,mi,expected] of offsets) {
  const got = I.seoulLocalToCstFields(Y,M,D,h,mi).seoulOffsetMinutes;
  assert(got === expected, `Seoul UTC offset ${Y}-${M}-${D}: ${got} != ${expected}`);
}

const fixed23 = [
  [2000,1,1,'甲子'],
  [1990,5,15,'戊子'],
  [1985,8,8,'丙子'],
];
for (const [Y,M,D,expectedHour] of fixed23) {
  const r22 = global.createKoreanHybridBaZi(Y,M,D,22,0,true);
  const r23 = global.createKoreanHybridBaZi(Y,M,D,23,0,true);
  assert(gzDay(r22.baZi) === gzDay(r23.baZi), `${Y}-${M}-${D} 23:00 rolled day pillar`);
  assert(gzHour(r23.baZi) === expectedHour, `${Y}-${M}-${D} 23:00 ${gzHour(r23.baZi)} != ${expectedHour}`);
}

const Ctor = global.KoreanLunarCalendar;
let lunarRoundTrips = 0;
for (let y = 1900; y <= 2050; y++) {
  for (let m = 1; m <= 12; m++) {
    for (const d of [1, 15, 28]) {
      const cal = new Ctor();
      if (!cal.setSolarDate(y,m,d)) continue;
      const lunar = cal.getLunarCalendar();
      const back = global.koreanLunarToSolar(lunar.year, lunar.month, lunar.day, !!lunar.intercalation);
      assert(back.year === y && back.month === m && back.day === d,
        `Korean lunar roundtrip ${y}-${m}-${d} -> ${JSON.stringify(lunar)} -> ${JSON.stringify(back)}`);
      lunarRoundTrips++;
    }
  }
}
const k1 = global.koreanLunarToSolar(1956,1,21,false);
assert(k1.year===1956 && k1.month===3 && k1.day===3, '1956 KARI lunar sample mismatch');
const k2 = global.koreanLunarToSolar(2017,5,1,true);
assert(k2.year===2017 && k2.month===6 && k2.day===24, '2017 leap-month KARI sample mismatch');
let impossibleLeap = false;
try { global.koreanLunarToSolar(2017,3,1,true); } catch (e) { impossibleLeap = e.code === 'KOREAN_LUNAR_INVALID'; }
assert(impossibleLeap, 'impossible Korean leap month must be rejected');

const report = {
  solarPillarCases: solarOk,
  hourCases: hourOk,
  solarTermBoundaryCases: termOk,
  unknownTimeBoundaryCases: unknownChecked,
  koreanLunarRoundTrips: lunarRoundTrips,
  historicalOffsetCases: offsets.length,
  fixedLateZiCases: fixed23.length,
  status: 'PASS',
};
console.log(JSON.stringify(report, null, 2));
fs.writeFileSync('/tmp/manse_1_4_report.json', JSON.stringify(report, null, 2));
