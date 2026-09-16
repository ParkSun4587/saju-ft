from pathlib import Path

p = Path('tests/pre_note3_browser_regression_v4.cjs')
s = p.read_text(encoding='utf-8')
old = """          const data = { ...base, concernKey:key };\n          const n = buildNoteFourPrescription(data, key, labels[key], mode === 'T');\n          const integrated = generateConcernNotes(data, mode)[3];"""
new = """          const data = { ...base, concernKey:key };\n          const n = buildNoteFourPrescription(data, key, labels[key], mode === 'T');\n          const wiredData = {\n            ...data,\n            rawSolutionTemplate: { F:{acts:[]}, T:{acts:[]} },\n          };\n          const integrated = generateConcernNotes(wiredData, mode)[3];"""
if s.count(old) != 1:
    raise SystemExit(f'integration test target count={s.count(old)}')
s = s.replace(old, new, 1)
p.write_text(s, encoding='utf-8')
print('NOTE4_TEST_FIX_READY')
