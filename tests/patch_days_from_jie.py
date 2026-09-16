from pathlib import Path

p = Path('manse-korea-v2.js')
s = p.read_text(encoding='utf-8')

old = '''  function cstSolarToSeoulParts(solarObj) {
    const utcMs =
      Date.UTC(
        solarObj.getYear(),
        solarObj.getMonth() - 1,
        solarObj.getDay(),
        typeof solarObj.getHour === "function" ? solarObj.getHour() : 0,
        typeof solarObj.getMinute === "function" ? solarObj.getMinute() : 0,
        typeof solarObj.getSecond === "function" ? solarObj.getSecond() : 0,
      ) -
      CST_OFFSET_MINUTES * 60000;
    return partsAt(utcMs, SEOUL_TZ);
  }'''
new = '''  function cstSolarToUtcMs(solarObj) {
    return (
      Date.UTC(
        solarObj.getYear(),
        solarObj.getMonth() - 1,
        solarObj.getDay(),
        typeof solarObj.getHour === "function" ? solarObj.getHour() : 0,
        typeof solarObj.getMinute === "function" ? solarObj.getMinute() : 0,
        typeof solarObj.getSecond === "function" ? solarObj.getSecond() : 0,
      ) -
      CST_OFFSET_MINUTES * 60000
    );
  }
  function cstSolarToSeoulParts(solarObj) {
    return partsAt(cstSolarToUtcMs(solarObj), SEOUL_TZ);
  }'''
if s.count(old) != 1:
    raise SystemExit(f'cst helper target expected once, found {s.count(old)}')
s = s.replace(old, new, 1)

old = '''  function isTermBoundaryDate(y, m, d) {
    const first = correctedTermPillars(y, m, d, 0, 0);'''
new = '''  function daysFromJieForTerm(term) {
    if (!term || !term.lunar || typeof term.lunar.getPrevJie !== "function") {
      return null;
    }
    const prevJie = term.lunar.getPrevJie();
    if (!prevJie || typeof prevJie.getSolar !== "function") return null;
    const jieSolar = prevJie.getSolar();
    const jieUtcMs = cstSolarToUtcMs(jieSolar);
    const elapsedDays = (term.cst.utcMs - jieUtcMs) / 86400000;
    // 정상적인 절입월은 약 30일이다. API 이상값은 격국 근거에 섞지 않는다.
    if (!Number.isFinite(elapsedDays) || elapsedDays < -1 / 1440 || elapsedDays > 40) {
      return null;
    }
    return Math.max(0, elapsedDays);
  }
  function isTermBoundaryDate(y, m, d) {
    const first = correctedTermPillars(y, m, d, 0, 0);'''
if s.count(old) != 1:
    raise SystemExit(f'daysFromJie insertion target expected once, found {s.count(old)}')
s = s.replace(old, new, 1)

old = '''    const civil = makeEightChar(y, m, d, h, mi);
    const term = correctedTermPillars(y, m, d, h, mi);
    const baZi = buildHybridBaZi(civil.baZi, term.baZi);'''
new = '''    const civil = makeEightChar(y, m, d, h, mi);
    const term = correctedTermPillars(y, m, d, h, mi);
    const daysFromJie = daysFromJieForTerm(term);
    const baZi = buildHybridBaZi(civil.baZi, term.baZi);'''
if s.count(old) != 1:
    raise SystemExit(f'create hybrid target expected once, found {s.count(old)}')
s = s.replace(old, new, 1)

old = '''        correctedYear,
        correctedMonth,
        cstClock: `${String(term.cst.year).padStart(4, "0")}-${String(term.cst.month).padStart(2, "0")}-${String(term.cst.day).padStart(2, "0")} ${String(term.cst.hour).padStart(2, "0")}:${String(term.cst.minute).padStart(2, "0")}`,'''
new = '''        correctedYear,
        correctedMonth,
        daysFromJie:
          Number.isFinite(daysFromJie) ? Math.round(daysFromJie * 1000) / 1000 : null,
        cstClock: `${String(term.cst.year).padStart(4, "0")}-${String(term.cst.month).padStart(2, "0")}-${String(term.cst.day).padStart(2, "0")} ${String(term.cst.hour).padStart(2, "0")}:${String(term.cst.minute).padStart(2, "0")}`,'''
if s.count(old) != 1:
    raise SystemExit(f'calendarMeta target expected once, found {s.count(old)}')
s = s.replace(old, new, 1)

old = '''    isTermBoundaryDate,
    correctedTermPillars,
    getMonthGanZhiRangeKst,'''
new = '''    isTermBoundaryDate,
    correctedTermPillars,
    daysFromJieForTerm,
    getMonthGanZhiRangeKst,'''
if s.count(old) != 1:
    raise SystemExit(f'export target expected once, found {s.count(old)}')
s = s.replace(old, new, 1)

p.write_text(s, encoding='utf-8')
print('PATCH_DAYS_FROM_JIE_OK')
