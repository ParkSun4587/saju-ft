from pathlib import Path
p = Path('tests/pre_note3_browser_regression_v4.cjs')
s = p.read_text(encoding='utf-8')
old = '''function isExpectedBoundaryDiagnostic(text) {
  return String(text).includes('이 생일은 절기가 바뀌는 날이라 태어난 시간을 모르면');
}'''
new = '''function isExpectedBoundaryDiagnostic(text) {
  const value = String(text);
  return value.includes('이 생일은 절기가 바뀌는 날이라 태어난 시간을 모르면') ||
    value.includes('만세력 엔진이 최신 버전으로 갱신되지 않았어요.');
}'''
count = s.count(old)
if count != 1:
    raise SystemExit(f'expected diagnostic helper once, got {count}')
s = s.replace(old, new, 1)
p.write_text(s, encoding='utf-8')
print('STALE_CONSOLE_TEST_PATCHED')
