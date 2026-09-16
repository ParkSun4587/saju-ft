(function (global) {
  "use strict";
  const SEOUL_TZ = "Asia/Seoul";
  const CST_OFFSET_MINUTES = 8 * 60;
  const DAY_BOUNDARY_SECT = 2;
  const HIDDEN_GANS = {
    子: ["癸"],
    丑: ["己", "癸", "辛"],
    寅: ["甲", "丙", "戊"],
    卯: ["乙"],
    辰: ["戊", "乙", "癸"],
    巳: ["丙", "戊", "庚"],
    午: ["丁", "己"],
    未: ["己", "丁", "乙"],
    申: ["庚", "壬", "戊"],
    酉: ["辛"],
    戌: ["戊", "辛", "丁"],
    亥: ["壬", "甲"],
  };
  const KR_TO_CN_TENGOD = {
    비견: "比肩",
    겁재: "劫财",
    식신: "食神",
    상관: "伤官",
    정재: "正财",
    편재: "偏财",
    정관: "正官",
    편관: "七杀",
    정인: "正印",
    편인: "偏印",
    일간: "日主",
  };
  const formatterCache = new Map();
  function getFormatter(timeZone) {
    if (!formatterCache.has(timeZone)) {
      formatterCache.set(
        timeZone,
        new Intl.DateTimeFormat("en-CA", {
          timeZone,
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hourCycle: "h23",
        }),
      );
    }
    return formatterCache.get(timeZone);
  }
  function partsAt(instantMs, timeZone) {
    const out = {};
    for (const part of getFormatter(timeZone).formatToParts(new Date(instantMs))) {
      if (part.type !== "literal") out[part.type] = Number(part.value);
    }
    return {
      year: out.year,
      month: out.month,
      day: out.day,
      hour: out.hour,
      minute: out.minute,
      second: out.second,
    };
  }
  function sameLocalParts(a, y, m, d, h, mi) {
    return (
      a.year === y &&
      a.month === m &&
      a.day === d &&
      a.hour === h &&
      a.minute === mi
    );
  }
  function offsetMillisecondsAt(instantMs, timeZone) {
    const p = partsAt(instantMs, timeZone);
    const representedAsUtc = Date.UTC(
      p.year,
      p.month - 1,
      p.day,
      p.hour,
      p.minute,
      p.second,
    );
    return representedAsUtc - instantMs;
  }
  function seoulWallTimeToUtcMs(y, m, d, h, mi) {
    const wallMs = Date.UTC(y, m - 1, d, h, mi, 0);
    const probeOffsets = new Set();
    for (const deltaHours of [-36, -12, 0, 12, 36]) {
      probeOffsets.add(
        offsetMillisecondsAt(wallMs + deltaHours * 3600000, SEOUL_TZ),
      );
    }
    const candidates = [];
    for (const offsetMs of probeOffsets) {
      const candidate = wallMs - offsetMs;
      if (sameLocalParts(partsAt(candidate, SEOUL_TZ), y, m, d, h, mi)) {
        candidates.push({
          utcMs: candidate,
          offsetMilliseconds: offsetMs,
          offsetMinutes: offsetMs / 60000,
        });
      }
    }
    const unique = [];
    const seen = new Set();
    for (const c of candidates) {
      if (!seen.has(c.utcMs)) {
        seen.add(c.utcMs);
        unique.push(c);
      }
    }
    if (unique.length === 0) {
      const err = new Error(
        "입력한 출생시각이 당시 한국 표준시/서머타임 전환 구간에 존재하지 않는 시각이에요. 출생기록을 다시 확인해주세요.",
      );
      err.code = "KST_LOCAL_TIME_INVALID";
      throw err;
    }
    if (unique.length > 1) {
      const err = new Error(
        "입력한 출생시각이 당시 한국 서머타임 종료 경계의 중복 시각이라 한 가지 원국으로 확정할 수 없어요. 출생기록의 표준시 여부를 확인해주세요.",
      );
      err.code = "KST_LOCAL_TIME_AMBIGUOUS";
      throw err;
    }
    return unique[0];
  }
  function utcMsToFixedOffsetFields(utcMs, offsetMinutes) {
    const d = new Date(utcMs + offsetMinutes * 60000);
    return {
      year: d.getUTCFullYear(),
      month: d.getUTCMonth() + 1,
      day: d.getUTCDate(),
      hour: d.getUTCHours(),
      minute: d.getUTCMinutes(),
      second: d.getUTCSeconds(),
    };
  }
  function seoulLocalToCstFields(y, m, d, h, mi) {
    const resolved = seoulWallTimeToUtcMs(y, m, d, h, mi);
    return {
      ...utcMsToFixedOffsetFields(resolved.utcMs, CST_OFFSET_MINUTES),
      utcMs: resolved.utcMs,
      seoulOffsetMinutes: resolved.offsetMinutes,
    };
  }
  function cstSolarToUtcMs(solarObj) {
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
  }
  function makeEightChar(y, m, d, h, mi) {
    if (typeof Solar === "undefined") {
      throw new Error("만세력 모듈을 불러오지 못했습니다. 새로고침 후 다시 시도해주세요.");
    }
    const solar = Solar.fromYmdHms(y, m, d, h, mi, 0);
    const lunar = solar.getLunar();
    const baZi = lunar.getEightChar();
    if (baZi && typeof baZi.setSect === "function") {
      baZi.setSect(DAY_BOUNDARY_SECT);
    }
    return { solar, lunar, baZi };
  }
  function toChineseTenGod(dayGan, targetGan) {
    if (!targetGan) return "";
    const kr = typeof computeSipsin === "function"
      ? computeSipsin(dayGan, targetGan)
      : "";
    return KR_TO_CN_TENGOD[kr] || kr;
  }
  function correctedTermPillars(y, m, d, h, mi) {
    const cst = seoulLocalToCstFields(y, m, d, h, mi);
    const term = makeEightChar(
      cst.year,
      cst.month,
      cst.day,
      cst.hour,
      cst.minute,
    );
    return {
      ...term,
      cst,
      yearGan: term.baZi.getYearGan(),
      yearZhi: term.baZi.getYearZhi(),
      monthGan: term.baZi.getMonthGan(),
      monthZhi: term.baZi.getMonthZhi(),
    };
  }
  function daysFromJieForTerm(term) {
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
    const first = correctedTermPillars(y, m, d, 0, 0);
    const last = correctedTermPillars(y, m, d, 23, 59);
    return (
      first.yearGan !== last.yearGan ||
      first.yearZhi !== last.yearZhi ||
      first.monthGan !== last.monthGan ||
      first.monthZhi !== last.monthZhi
    );
  }
  function buildHybridBaZi(civilBaZi, termBaZi) {
    const dayGan = civilBaZi.getDayGan();
    const yGan = termBaZi.getYearGan();
    const yZhi = termBaZi.getYearZhi();
    const mGan = termBaZi.getMonthGan();
    const mZhi = termBaZi.getMonthZhi();
    const yearHidden = () => (HIDDEN_GANS[yZhi] || []).slice();
    const monthHidden = () => (HIDDEN_GANS[mZhi] || []).slice();
    const overrides = {
      getYearGan: () => yGan,
      getYearZhi: () => yZhi,
      getMonthGan: () => mGan,
      getMonthZhi: () => mZhi,
      getYearHideGan: yearHidden,
      getMonthHideGan: monthHidden,
      getYearShiShenGan: () => toChineseTenGod(dayGan, yGan),
      getMonthShiShenGan: () => toChineseTenGod(dayGan, mGan),
      getYearShiShenZhi: () => yearHidden().map((g) => toChineseTenGod(dayGan, g)),
      getMonthShiShenZhi: () => monthHidden().map((g) => toChineseTenGod(dayGan, g)),
      getYun: (...args) => termBaZi.getYun(...args),
      getSect: () => DAY_BOUNDARY_SECT,
      setSect: () => buildHybridBaZi(civilBaZi, termBaZi),
    };
    return new Proxy(civilBaZi, {
      get(target, prop) {
        if (Object.prototype.hasOwnProperty.call(overrides, prop)) {
          return overrides[prop];
        }
        const value = target[prop];
        return typeof value === "function" ? value.bind(target) : value;
      },
    });
  }
  function createKoreanHybridBaZi(y, m, d, h, mi, hourKnown) {
    if (!hourKnown && isTermBoundaryDate(y, m, d)) {
      const err = new Error(
        "이 생일은 절기가 바뀌는 날이라 태어난 시간을 모르면 년주·월주를 한 가지로 확정할 수 없어요. 출생기록의 시간을 확인해서 다시 입력해주세요.",
      );
      err.code = "KST_TERM_TIME_REQUIRED";
      throw err;
    }
    const civil = makeEightChar(y, m, d, h, mi);
    const term = correctedTermPillars(y, m, d, h, mi);
    const daysFromJie = daysFromJieForTerm(term);
    const baZi = buildHybridBaZi(civil.baZi, term.baZi);
    const civilYear = `${civil.baZi.getYearGan()}${civil.baZi.getYearZhi()}`;
    const civilMonth = `${civil.baZi.getMonthGan()}${civil.baZi.getMonthZhi()}`;
    const correctedYear = `${term.yearGan}${term.yearZhi}`;
    const correctedMonth = `${term.monthGan}${term.monthZhi}`;
    return {
      solar: civil.solar,
      lunar: civil.lunar,
      baZi,
      termBaZi: term.baZi,
      calendarMeta: {
        timeZone: SEOUL_TZ,
        seoulUtcOffsetMinutes: term.cst.seoulOffsetMinutes,
        solarTermReference: "same-instant UTC+08 normalization",
        dayBoundarySect: DAY_BOUNDARY_SECT,
        dayBoundaryRule:
          "23:00~23:59 일주는 당일 유지, 子시 시주는 야자시 시두 규칙 적용",
        hourKnown: !!hourKnown,
        termBoundaryAdjusted:
          civilYear !== correctedYear || civilMonth !== correctedMonth,
        libraryCivilYear: civilYear,
        libraryCivilMonth: civilMonth,
        correctedYear,
        correctedMonth,
        daysFromJie:
          Number.isFinite(daysFromJie) ? Math.round(daysFromJie * 1000) / 1000 : null,
        cstClock: `${String(term.cst.year).padStart(4, "0")}-${String(term.cst.month).padStart(2, "0")}-${String(term.cst.day).padStart(2, "0")} ${String(term.cst.hour).padStart(2, "0")}:${String(term.cst.minute).padStart(2, "0")}`,
      },
    };
  }
  function getKoreanLunarCtor() {
    const lib = global.KoreanLunarCalendar;
    if (typeof lib === "function") return lib;
    if (lib && typeof lib.default === "function") return lib.default;
    throw new Error(
      "한국 음력 변환 모듈을 불러오지 못했습니다. 새로고침 후 다시 시도해주세요.",
    );
  }
  function koreanLunarToSolar(y, m, d, isLeap) {
    const Ctor = getKoreanLunarCtor();
    const calendar = new Ctor();
    const ok = calendar.setLunarDate(y, m, d, !!isLeap);
    if (!ok) {
      const err = new Error(
        isLeap
          ? `입력한 해에는 윤${m}월 ${d}일이 없어요. 윤달 여부와 날짜를 다시 확인해주세요.`
          : "입력한 한국 음력 날짜가 실제 달력에 없어요. 날짜를 다시 확인해주세요.",
      );
      err.code = "KOREAN_LUNAR_INVALID";
      throw err;
    }
    const solar = calendar.getSolarCalendar();
    return {
      year: solar.year,
      month: solar.month,
      day: solar.day,
    };
  }
  function getMonthGanZhiRangeKst(year, idx) {
    if (typeof Solar === "undefined" || typeof JIE_ORDER === "undefined") {
      throw new Error("절기 계산 모듈이 준비되지 않았습니다.");
    }
    const table = Solar.fromYmdHms(year, 1, 1, 12, 0, 0)
      .getLunar()
      .getJieQiTable();
    let startDate;
    let endDate;
    if (idx <= 9) {
      startDate = table[JIE_ORDER[idx]];
      endDate = idx <= 8 ? table[JIE_ORDER[idx + 1]] : table["大雪"];
    } else if (idx === 10) {
      startDate = table["大雪"];
      const nextTable = Solar.fromYmdHms(year + 1, 1, 1, 12, 0, 0)
        .getLunar()
        .getJieQiTable();
      endDate = nextTable["小寒"];
    } else {
      const nextTable = Solar.fromYmdHms(year + 1, 1, 1, 12, 0, 0)
        .getLunar()
        .getJieQiTable();
      startDate = nextTable["小寒"];
      endDate = nextTable["立春"];
    }
    const s = cstSolarToSeoulParts(startDate);
    const e = cstSolarToSeoulParts(endDate);
    const ymd = `${String(s.year).padStart(4, "0")}-${String(s.month).padStart(2, "0")}-${String(s.day).padStart(2, "0")}`;
    return {
      startYmd: ymd,
      startMonth: s.month,
      startDay: s.day,
      endMonth: e.month,
      endDay: e.day,
      startHour: s.hour,
      startMinute: s.minute,
      endHour: e.hour,
      endMinute: e.minute,
    };
  }
  global.koreanLunarToSolar = koreanLunarToSolar;
  global.createKoreanHybridBaZi = createKoreanHybridBaZi;
  global.__MANSE_KOREA_V2__ = {
    version: "2.0.0",
    timeZone: SEOUL_TZ,
    dayBoundarySect: DAY_BOUNDARY_SECT,
    seoulWallTimeToUtcMs,
    seoulLocalToCstFields,
    isTermBoundaryDate,
    correctedTermPillars,
    daysFromJieForTerm,
    getMonthGanZhiRangeKst,
  };
  try {
    if (typeof getMonthGanZhiRange === "function") {
      getMonthGanZhiRange = getMonthGanZhiRangeKst;
    }
  } catch (err) {
    console.warn("KST 월운 절입 보정 적용 실패:", err);
  }
})(globalThis);
