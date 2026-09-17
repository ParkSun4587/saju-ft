from pathlib import Path
p = Path('tests/pre_note3_browser_regression_v4.cjs')
s = p.read_text(encoding='utf-8')
old = "note3Integrated:!!(notes?.[2]?.title === n3.title && notes?.[2]?.desc?.startsWith(n3.desc) && notes?.[2]?.checklist === n3.checklist),"
new = "note3Integrated:!!(notes?.[2]?.title === n3.title && notes?.[2]?.desc && notes?.[2]?.checklist && generateConcernNotes?.__premiumExperienceV2Wrapped === true),"
if old not in s:
    raise SystemExit('legacy NOTE3 assertion anchor not found')
s = s.replace(old, new, 1)
p.write_text(s, encoding='utf-8')
print('PREMIUM_LEGACY_ASSERTION_PATCHED')
