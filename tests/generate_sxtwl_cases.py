import calendar
import datetime as dt
import json
import random
from zoneinfo import ZoneInfo

import sxtwl

GAN = "甲乙丙丁戊己庚辛壬癸"
ZHI = "子丑寅卯辰巳午未申酉戌亥"
JIAZI = [GAN[i % 10] + ZHI[i % 12] for i in range(60)]
JQ_NAMES = [
    "冬至", "小寒", "大寒", "立春", "雨水", "惊蛰", "春分", "清明",
    "谷雨", "立夏", "小满", "芒种", "夏至", "小暑", "大暑", "立秋",
    "处暑", "白露", "秋分", "寒露", "霜降", "立冬", "小雪", "大雪",
]
JIE_INDEX = {1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23}
BEIJING = dt.timezone(dt.timedelta(hours=8))
SEOUL = ZoneInfo("Asia/Seoul")


def gz(g):
    return GAN[g.tg] + ZHI[g.dz]


def prev_gz(value):
    return JIAZI[(JIAZI.index(value) - 1) % 60]


def valid_random_date(rng):
    y = rng.randint(1900, 2050)
    m = rng.randint(1, 12)
    d = rng.randint(1, calendar.monthrange(y, m)[1])
    return dt.date(y, m, d)


def local_parts(x):
    return {
        "Y": x.year,
        "M": x.month,
        "D": x.day,
        "h": x.hour,
        "mi": x.minute,
    }


rng = random.Random(20260917)
solar = []
while len(solar) < 3000:
    date = valid_random_date(rng)
    day = sxtwl.fromSolar(date.year, date.month, date.day)
    # Date-only reference is unambiguous away from a solar-term date.
    if day.hasJieQi():
        continue
    solar.append(
        {
            "Y": date.year,
            "M": date.month,
            "D": date.day,
            "year": gz(day.getYearGZ()),
            "month": gz(day.getMonthGZ()),
            "day": gz(day.getDayGZ()),
        }
    )

hour_cases = []
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

# sxtwl's Day.getMonthGZ() is date-based, so it cannot represent the two sides
# of a solar-term instant on the same civil date. We use sxtwl only for the
# astronomical Jie instant and for the post-Jie pillar on the following day;
# the pre-Jie month is exactly the previous member of the 60-cycle. The year
# pillar changes only at Lichun, where the same previous-cycle rule applies.
term_cases = []
for year in range(1900, 2051):
    for info in sxtwl.getJieQiByYear(year):
        idx = int(info.jqIndex)
        if idx not in JIE_INDEX:
            continue
        t = sxtwl.JD2DD(info.jd)
        sec = int(round(t.s))
        minute = int(t.m)
        hour = int(t.h)
        base = dt.datetime(int(t.Y), int(t.M), int(t.D), hour, minute, min(sec, 59), tzinfo=BEIJING)
        before_bj = base - dt.timedelta(minutes=5)
        after_bj = base + dt.timedelta(minutes=5)
        before_kr = before_bj.astimezone(SEOUL)
        after_kr = after_bj.astimezone(SEOUL)
        next_date = base.date() + dt.timedelta(days=1)
        next_day = sxtwl.fromSolar(next_date.year, next_date.month, next_date.day)
        after_year = gz(next_day.getYearGZ())
        after_month = gz(next_day.getMonthGZ())
        before_year = prev_gz(after_year) if idx == 3 else after_year
        before_month = prev_gz(after_month)
        term_cases.append(
            {
                "year": year,
                "name": JQ_NAMES[idx],
                "before": local_parts(before_kr),
                "after": local_parts(after_kr),
                "beforeYear": before_year,
                "beforeMonth": before_month,
                "afterYear": after_year,
                "afterMonth": after_month,
            }
        )

out = {
    "solar": solar,
    "hours": hour_cases,
    "terms": term_cases,
}
with open("/tmp/manse_reference.json", "w", encoding="utf-8") as f:
    json.dump(out, f, ensure_ascii=False)
print(json.dumps({k: len(v) for k, v in out.items()}, ensure_ascii=False))
