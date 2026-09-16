from pathlib import Path


def replace_once(text, old, new, label):
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{label}: expected exactly one match, got {count}")
    return text.replace(old, new, 1)


# -----------------------------------------------------------------------------
# manse-korea-v2.js
# -----------------------------------------------------------------------------
p = Path("manse-korea-v2.js")
s = p.read_text(encoding="utf-8")

s = replace_once(
    s,
    '  const CST_OFFSET_MINUTES = 8 * 60;\n  const DAY_BOUNDARY_SECT = 2;',
    '  const CST_OFFSET_MINUTES = 8 * 60;\n  // 한국식 만세력 호환 기준시각: 동경 127.5도(UTC+08:30).\n  // 현대 KST(UTC+09:00)에서는 출생기록 시각보다 30분 이르게 계산된다.\n  // 과거 표준시/서머타임은 IANA Asia/Seoul 실제 오프셋을 먼저 풀고 같은 기준시각으로 환산한다.\n  const KOREAN_MANSE_OFFSET_MINUTES = 8 * 60 + 30;\n  const DAY_BOUNDARY_SECT = 2;',
    "manse constant",
)

anchor = '''  function seoulLocalToCstFields(y, m, d, h, mi) {
    const resolved = seoulWallTimeToUtcMs(y, m, d, h, mi);
    return {
      ...utcMsToFixedOffsetFields(resolved.utcMs, CST_OFFSET_MINUTES),
      utcMs: resolved.utcMs,
      seoulOffsetMinutes: resolved.offsetMinutes,
    };
  }
'''
addition = anchor + '''  function seoulWallToManseFields(y, m, d, h, mi) {
    const resolved = seoulWallTimeToUtcMs(y, m, d, h, mi);
    const fields = utcMsToFixedOffsetFields(
      resolved.utcMs,
      KOREAN_MANSE_OFFSET_MINUTES,
    );
    const inputWallMs = Date.UTC(y, m - 1, d, h, mi, 0);
    const manseWallMs = Date.UTC(
      fields.year,
      fields.month - 1,
      fields.day,
      fields.hour,
      fields.minute,
      fields.second,
    );
    return {
      ...fields,
      utcMs: resolved.utcMs,
      seoulOffsetMinutes: resolved.offsetMinutes,
      correctionMinutes: Math.round((manseWallMs - inputWallMs) / 60000),
    };
  }
'''
s = replace_once(s, anchor, addition, "manse clock helper")

old = '''    const civil = makeEightChar(y, m, d, h, mi);
    const term = correctedTermPillars(y, m, d, h, mi);
    const daysFromJie = daysFromJieForTerm(term);
    const baZi = buildHybridBaZi(civil.baZi, term.baZi);
    const civilYear = `${civil.baZi.getYearGan()}${civil.baZi.getYearZhi()}`;
    const civilMonth = `${civil.baZi.getMonthGan()}${civil.baZi.getMonthZhi()}`;
'''
new = '''    // 입력한 병원/가족 기록 시각은 실제 한국 시각으로 먼저 해석한다.
    const inputCivil = makeEightChar(y, m, d, h, mi);
    // 일주·시주는 한국 만세력에서 널리 쓰는 127.5E 기준시각으로 환산한다.
    // 예: 1998-02-21 03:10 KST -> 02:40 -> 축시.
    const manseClock = seoulWallToManseFields(y, m, d, h, mi);
    const pillarCivil = makeEightChar(
      manseClock.year,
      manseClock.month,
      manseClock.day,
      manseClock.hour,
      manseClock.minute,
    );
    // 연주·월주의 절입 경계는 시계를 임의로 30분 당기지 않고 실제 순간으로 판정한다.
    const term = correctedTermPillars(y, m, d, h, mi);
    const daysFromJie = daysFromJieForTerm(term);
    const baZi = buildHybridBaZi(pillarCivil.baZi, term.baZi);
    const civilYear = `${inputCivil.baZi.getYearGan()}${inputCivil.baZi.getYearZhi()}`;
    const civilMonth = `${inputCivil.baZi.getMonthGan()}${inputCivil.baZi.getMonthZhi()}`;
'''
s = replace_once(s, old, new, "manse create hybrid")

s = replace_once(
    s,
    '''      solar: civil.solar,
      lunar: civil.lunar,
''',
    '''      solar: inputCivil.solar,
      lunar: inputCivil.lunar,
''',
    "manse return civil",
)

s = replace_once(
    s,
    '''        dayBoundaryRule:
          "23:00~23:59 일주는 당일 유지, 子시 시주는 야자시 시두 규칙 적용",
''',
    '''        dayBoundaryRule:
          "한국 만세력 기준시각(동경 127.5도 환산)에서 23:00~23:59 일주는 당일 유지",
        hourCorrectionRule:
          "입력한 한국 현지시각을 실제 UTC 순간으로 해석한 뒤 동경 127.5도(UTC+08:30) 기준시각으로 환산",
        manseReferenceOffsetMinutes: KOREAN_MANSE_OFFSET_MINUTES,
        hourCorrectionMinutes: manseClock.correctionMinutes,
        inputClock: `${String(y).padStart(4, "0")}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")} ${String(h).padStart(2, "0")}:${String(mi).padStart(2, "0")}`,
        manseClock: `${String(manseClock.year).padStart(4, "0")}-${String(manseClock.month).padStart(2, "0")}-${String(manseClock.day).padStart(2, "0")} ${String(manseClock.hour).padStart(2, "0")}:${String(manseClock.minute).padStart(2, "0")}`,
''',
    "manse metadata",
)

s = replace_once(
    s,
    '''    version: "2.0.0",
''',
    '''    version: "2.1.0",
''',
    "manse version",
)

s = replace_once(
    s,
    '''    seoulLocalToCstFields,
    isTermBoundaryDate,
''',
    '''    seoulLocalToCstFields,
    seoulWallToManseFields,
    isTermBoundaryDate,
''',
    "manse export helper",
)

p.write_text(s, encoding="utf-8")


# -----------------------------------------------------------------------------
# index.html : visible four-pillar table + V2 element distribution
# -----------------------------------------------------------------------------
p = Path("index.html")
s = p.read_text(encoding="utf-8")

pillar_card = '''        <!-- [내 사주 원국 4주 카드] -->
        <div class="card-box p-4 rounded-3xl text-left space-y-2.5">
          <div class="flex items-center justify-between pb-1 border-b border-slate-100">
            <span class="text-xs font-black text-slate-800 tracking-wider">내 사주 원국</span>
            <span id="pillarBasisTag" class="text-[10px] font-bold text-slate-500">한국 만세력 기준</span>
          </div>
          <div class="grid grid-cols-4 gap-1.5 text-center">
            <div class="rounded-xl bg-slate-50 border border-slate-100 px-1.5 py-2">
              <div class="text-[9px] font-bold text-slate-400">년주</div>
              <div id="pillarYear" class="mt-1 text-[14px] font-black text-slate-800">-</div>
            </div>
            <div class="rounded-xl bg-slate-50 border border-slate-100 px-1.5 py-2">
              <div class="text-[9px] font-bold text-slate-400">월주</div>
              <div id="pillarMonth" class="mt-1 text-[14px] font-black text-slate-800">-</div>
            </div>
            <div class="rounded-xl bg-slate-50 border border-slate-100 px-1.5 py-2">
              <div class="text-[9px] font-bold text-slate-400">일주</div>
              <div id="pillarDay" class="mt-1 text-[14px] font-black text-slate-800">-</div>
            </div>
            <div class="rounded-xl bg-slate-50 border border-slate-100 px-1.5 py-2">
              <div class="text-[9px] font-bold text-slate-400">시주</div>
              <div id="pillarHour" class="mt-1 text-[14px] font-black text-slate-800">-</div>
            </div>
          </div>
        </div>
'''
s = replace_once(
    s,
    '        <!-- [내 사주 5대 오행 분포 카드] -->\n',
    pillar_card + '        <!-- [내 사주 5대 오행 분포 카드] -->\n',
    "pillar card",
)

s = replace_once(
    s,
    '''            <span
              id="dayMasterTag"
              class="text-[11px] font-extrabold text-slate-600"
            ></span>
          </div>
          <div
            class="grid grid-cols-5 gap-1.5 text-center text-[10px] font-bold pt-1"
            id="ohengBarContainer"
          ></div>
''',
    '''            <span
              id="dayMasterTag"
              class="text-[11px] font-extrabold text-slate-600"
            ></span>
          </div>
          <p class="text-[9.5px] font-semibold text-slate-400 leading-relaxed">
            개수는 원국 겉글자 기준 · %는 지장간과 월령까지 반영한 실제 세력
          </p>
          <div
            class="grid grid-cols-5 gap-1.5 text-center text-[10px] font-bold pt-1"
            id="ohengBarContainer"
          ></div>
''',
    "oheng explanation",
)

render_anchor = '''      function renderOhengDistribution(elements, dayGan, dayOheng, pillars) {
'''
render_new = '''      function renderPillarTable(data) {
        const GAN_KR = {
          甲: "갑", 乙: "을", 丙: "병", 丁: "정", 戊: "무",
          己: "기", 庚: "경", 辛: "신", 壬: "임", 癸: "계",
        };
        const ZHI_KR = {
          子: "자", 丑: "축", 寅: "인", 卯: "묘", 辰: "진", 巳: "사",
          午: "오", 未: "미", 申: "신", 酉: "유", 戌: "술", 亥: "해",
        };
        const toKr = (pillar) =>
          pillar && pillar.gan && pillar.zhi
            ? `${GAN_KR[pillar.gan] || pillar.gan}${ZHI_KR[pillar.zhi] || pillar.zhi}`
            : "시간 모름";
        const ids = {
          year: "pillarYear",
          month: "pillarMonth",
          day: "pillarDay",
          hour: "pillarHour",
        };
        Object.entries(ids).forEach(([key, id]) => {
          const el = document.getElementById(id);
          if (el) el.textContent = toKr(data?.pillars?.[key]);
        });
        const basis = document.getElementById("pillarBasisTag");
        if (basis) {
          const correction = data?.calendarMeta?.hourCorrectionMinutes;
          basis.textContent = Number.isFinite(correction)
            ? `한국 만세력 기준 · 시간 ${correction > 0 ? "+" : ""}${correction}분 보정`
            : "한국 만세력 기준";
        }
      }

      function renderOhengDistribution(elements, dayGan, dayOheng, pillars, elementProfiles) {
'''
s = replace_once(s, render_anchor, render_new, "pillar renderer")

s = replace_once(
    s,
    '''        if (!container || !elements) return;

        const rawChars = [];
''',
    '''        if (!container || !elements) return;

        const weighted = elementProfiles?.influence || elements;
        const profileRaw = elementProfiles?.raw || null;
        const rawChars = [];
''',
    "oheng v2 inputs",
)

s = replace_once(
    s,
    '''        const realCounts = { mok: 0, hwa: 0, to: 0, geum: 0, su: 0 };
        rawChars.forEach((ch) => {
          const t = OHENG_MAP[ch];
          if (t) realCounts[t]++;
        });

        const total =
          elements.mok +
            elements.hwa +
            elements.to +
            elements.geum +
            elements.su || 1;
        const pMok = Math.round((elements.mok / total) * 100);
        const pHwa = Math.round((elements.hwa / total) * 100);
        const pTo = Math.round((elements.to / total) * 100);
        const pGeum = Math.round((elements.geum / total) * 100);
        const pSu = Math.round((elements.su / total) * 100);
''',
    '''        const realCounts = profileRaw
          ? {
              mok: profileRaw.mok || 0,
              hwa: profileRaw.hwa || 0,
              to: profileRaw.to || 0,
              geum: profileRaw.geum || 0,
              su: profileRaw.su || 0,
            }
          : { mok: 0, hwa: 0, to: 0, geum: 0, su: 0 };
        if (!profileRaw) {
          rawChars.forEach((ch) => {
            const t = OHENG_MAP[ch];
            if (t) realCounts[t]++;
          });
        }

        const total =
          weighted.mok +
            weighted.hwa +
            weighted.to +
            weighted.geum +
            weighted.su || 1;
        const pMok = Math.round((weighted.mok / total) * 100);
        const pHwa = Math.round((weighted.hwa / total) * 100);
        const pTo = Math.round((weighted.to / total) * 100);
        const pGeum = Math.round((weighted.geum / total) * 100);
        const pSu = Math.round((weighted.su / total) * 100);
''',
    "oheng v2 calculation",
)

s = replace_once(
    s,
    '''        renderOhengDistribution(
          data.elements,
          data.pillars && data.pillars.day ? data.pillars.day.gan : "甲",
          data.dayOheng,
          data.pillars,
        );
''',
    '''        renderPillarTable(data);
        renderOhengDistribution(
          data.elements,
          data.pillars && data.pillars.day ? data.pillars.day.gan : "甲",
          data.dayOheng,
          data.pillars,
          data.elementProfiles || data.analysisProfile?.elementProfiles || null,
        );
''',
    "render call",
)

p.write_text(s, encoding="utf-8")


# -----------------------------------------------------------------------------
# Python independent reference generator: hour/day references use +08:30 clock.
# -----------------------------------------------------------------------------
p = Path("tests/generate_sxtwl_cases.py")
s = p.read_text(encoding="utf-8")
s = replace_once(
    s,
    'SEOUL = ZoneInfo("Asia/Seoul")\n',
    'SEOUL = ZoneInfo("Asia/Seoul")\nKOREAN_MANSE = dt.timezone(dt.timedelta(hours=8, minutes=30))\nUTC = dt.timezone.utc\n',
    "reference timezone",
)
old = '''hour_cases = []
for base in rng.sample(solar, 600):
    day = sxtwl.fromSolar(base["Y"], base["M"], base["D"])
    d_gz = day.getDayGZ()
    h = rng.randint(0, 23)
    hour_cases.append(
        {
            "Y": base["Y"],
            "M": base["M"],
            "D": base["D"],
            "h": h,
            "day": gz(d_gz),
            "hour": gz(sxtwl.getShiGz(d_gz.tg, h)),
        }
    )
'''
new = '''hour_cases = []
for base in rng.sample(solar, 600):
    h = rng.randint(0, 23)
    mi = rng.randint(0, 59)
    # Input is a Korean wall clock. Convert that instant to the Korean manse
    # reference meridian clock (+08:30) before choosing day/hour pillars.
    wall = dt.datetime(base["Y"], base["M"], base["D"], h, mi, tzinfo=SEOUL)
    manse = wall.astimezone(UTC).astimezone(KOREAN_MANSE)
    day = sxtwl.fromSolar(manse.year, manse.month, manse.day)
    d_gz = day.getDayGZ()
    hour_cases.append(
        {
            "Y": base["Y"],
            "M": base["M"],
            "D": base["D"],
            "h": h,
            "mi": mi,
            "manseY": manse.year,
            "manseM": manse.month,
            "manseD": manse.day,
            "manseH": manse.hour,
            "manseMi": manse.minute,
            "day": gz(d_gz),
            "hour": gz(sxtwl.getShiGz(d_gz.tg, manse.hour)),
        }
    )
'''
s = replace_once(s, old, new, "reference hour cases")
p.write_text(s, encoding="utf-8")


# -----------------------------------------------------------------------------
# Node engine validation
# -----------------------------------------------------------------------------
p = Path("tests/validate_manse_1_4.cjs")
s = p.read_text(encoding="utf-8")
s = replace_once(
    s,
    '''  const r = global.createKoreanHybridBaZi(c.Y, c.M, c.D, c.h, 0, true);
''',
    '''  const r = global.createKoreanHybridBaZi(c.Y, c.M, c.D, c.h, c.mi, true);
''',
    "validate random hours",
)

old = '''const fixed23 = [
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
'''
new = '''// Korean manse reference clock shifts modern KST by -30 minutes.
// Therefore the 子-hour boundary is 23:30 on the recorded modern wall clock.
const beforeZi = global.createKoreanHybridBaZi(2000,1,1,23,29,true);
const atZi = global.createKoreanHybridBaZi(2000,1,1,23,30,true);
assert(beforeZi.baZi.getTimeZhi() === '亥', `23:29 should remain 亥, got ${beforeZi.baZi.getTimeZhi()}`);
assert(atZi.baZi.getTimeZhi() === '子', `23:30 should enter 子, got ${atZi.baZi.getTimeZhi()}`);
assert(gzDay(beforeZi.baZi) === gzDay(atZi.baZi), '23:30 子 boundary must not roll day under sect=2');

// User-known fixed regression: 1998-02-21 03:10 KST -> 02:40 manse clock -> 乙丑.
const userFixed = global.createKoreanHybridBaZi(1998,2,21,3,10,true);
assert(gzDay(userFixed.baZi) === '己亥', `user day ${gzDay(userFixed.baZi)} != 己亥`);
assert(gzHour(userFixed.baZi) === '乙丑', `user hour ${gzHour(userFixed.baZi)} != 乙丑`);
assert(userFixed.calendarMeta.hourCorrectionMinutes === -30,
  `user correction ${userFixed.calendarMeta.hourCorrectionMinutes} != -30`);
assert(userFixed.calendarMeta.manseClock.endsWith('02:40'),
  `user manse clock ${userFixed.calendarMeta.manseClock} != 02:40`);

// Historical standard-time/DST handling must come from the actual instant,
// not from blindly subtracting 30 minutes from every birth record.
const hist1956 = global.createKoreanHybridBaZi(1956,1,1,12,0,true);
assert(hist1956.calendarMeta.hourCorrectionMinutes === 0,
  `1956 correction ${hist1956.calendarMeta.hourCorrectionMinutes} != 0`);
const dst1988 = global.createKoreanHybridBaZi(1988,7,1,12,0,true);
assert(dst1988.calendarMeta.hourCorrectionMinutes === -90,
  `1988 DST correction ${dst1988.calendarMeta.hourCorrectionMinutes} != -90`);
'''
s = replace_once(s, old, new, "fixed hour validation")

s = s.replace('  fixedLateZiCases: fixed23.length,', '  fixedLateZiCases: 2,\n  fixedKoreanHourCases: 3,')
p.write_text(s, encoding="utf-8")


# -----------------------------------------------------------------------------
# Browser regression: exact user's known hour + visual pillar/ohaeng checks.
# -----------------------------------------------------------------------------
p = Path("tests/pre_note3_browser_regression_v4.cjs")
s = p.read_text(encoding="utf-8")
s = replace_once(
    s,
    '''          hour: exact.pillars.hour.gan + exact.pillars.hour.zhi,
          strength: exact.analysisProfile?.dayMaster?.strength,
''',
    '''          day: exact.pillars.day.gan + exact.pillars.day.zhi,
          hour: exact.pillars.hour.gan + exact.pillars.hour.zhi,
          correction: exact.calendarMeta?.hourCorrectionMinutes,
          manseClock: exact.calendarMeta?.manseClock,
          rawElements: exact.elementProfiles?.raw,
          strength: exact.analysisProfile?.dayMaster?.strength,
''',
    "browser core fields",
)
s = replace_once(
    s,
    '''    assert(r.exact.month === '甲寅', `1998 month drift ${r.exact.month}`);
''',
    '''    assert(r.exact.month === '甲寅', `1998 month drift ${r.exact.month}`);
    assert(r.exact.day === '己亥', `1998 day drift ${r.exact.day}`);
    assert(r.exact.hour === '乙丑', `1998 corrected hour drift ${r.exact.hour}`);
    assert(r.exact.correction === -30, `1998 correction drift ${r.exact.correction}`);
    assert(r.exact.manseClock.endsWith('02:40'), `1998 manse clock drift ${r.exact.manseClock}`);
    assert(JSON.stringify(r.exact.rawElements) === JSON.stringify({mok:4,hwa:0,to:3,geum:0,su:1}),
      `1998 raw element drift ${JSON.stringify(r.exact.rawElements)}`);
''',
    "browser exact assertions",
)

s = replace_once(
    s,
    '''        firstNoteRendered:(document.getElementById('notesListContainer')?.innerText || '').includes('NOTE 01'),
''',
    '''        firstNoteRendered:(document.getElementById('notesListContainer')?.innerText || '').includes('NOTE 01'),
        pillarText:[
          document.getElementById('pillarYear')?.innerText || '',
          document.getElementById('pillarMonth')?.innerText || '',
          document.getElementById('pillarDay')?.innerText || '',
          document.getElementById('pillarHour')?.innerText || '',
        ],
        pillarBasis:document.getElementById('pillarBasisTag')?.innerText || '',
        ohengText:document.getElementById('ohengBarContainer')?.innerText || '',
''',
    "browser ui capture",
)

s = replace_once(
    s,
    '''    assert(report.firstNoteRendered, `${c.id}: NOTE01 not rendered into result DOM`);
    const unexpected = errs.filter(x => !isExpectedBoundaryDiagnostic(x));
''',
    '''    assert(report.firstNoteRendered, `${c.id}: NOTE01 not rendered into result DOM`);
    if (c.id === 'user-exact-love-F') {
      assert(report.pillarText.join(',') === '무인,갑인,기해,을축',
        `${c.id}: pillar UI drift ${report.pillarText.join(',')}`);
      assert(report.pillarBasis.includes('-30분 보정'),
        `${c.id}: correction basis missing ${report.pillarBasis}`);
      assert(report.ohengText.includes('목\\n(4개)') || report.ohengText.includes('목 (4개)') || report.ohengText.includes('목(4개)'),
        `${c.id}: mok raw count missing ${report.ohengText}`);
      assert(report.ohengText.includes('화\\n(0개)') || report.ohengText.includes('화 (0개)') || report.ohengText.includes('화(0개)'),
        `${c.id}: hwa raw count should be zero ${report.ohengText}`);
    }
    const unexpected = errs.filter(x => !isExpectedBoundaryDiagnostic(x));
''',
    "browser ui assertions",
)
p.write_text(s, encoding="utf-8")

print("PATCH_READY")
