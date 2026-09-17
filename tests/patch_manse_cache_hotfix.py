from pathlib import Path


def replace_once(text, old, new, label):
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{label}: expected 1 match, got {count}")
    return text.replace(old, new, 1)

# 1) Cache-bust the corrected Korean manse engine and fail closed on stale engine versions.
p = Path('index.html')
s = p.read_text(encoding='utf-8')
s = replace_once(
    s,
    '<script src="./manse-korea-v2.js?v=2"></script>',
    '<script src="./manse-korea-v2.js?v=2.2.0"></script>',
    'manse script cache version',
)
old_guard = '''          if (typeof createKoreanHybridBaZi !== "function") {
            throw new Error("한국 만세력 보정 모듈을 불러오지 못했습니다.");
          }
          const { solar, lunar, baZi, calendarMeta } =
            createKoreanHybridBaZi('''
new_guard = '''          if (typeof createKoreanHybridBaZi !== "function") {
            throw new Error("한국 만세력 보정 모듈을 불러오지 못했습니다.");
          }
          const manseEngineVersion = globalThis.__MANSE_KOREA_V2__?.version || "";
          if (manseEngineVersion !== "2.2.0") {
            const staleEngineError = new Error(
              "만세력 엔진이 최신 버전으로 갱신되지 않았어요. 페이지를 새로고침한 뒤 다시 입력해주세요.",
            );
            staleEngineError.code = "MANSE_ENGINE_STALE";
            throw staleEngineError;
          }
          const { solar, lunar, baZi, calendarMeta } =
            createKoreanHybridBaZi('''
s = replace_once(s, old_guard, new_guard, 'stale manse engine guard')
p.write_text(s, encoding='utf-8')

# 2) Give the corrected engine a distinct runtime version.
p = Path('manse-korea-v2.js')
s = p.read_text(encoding='utf-8')
s = replace_once(s, 'version: "2.1.0"', 'version: "2.2.0"', 'manse engine runtime version')
p.write_text(s, encoding='utf-8')

# 3) Regression: verify the HTML requests the new asset, runtime matches it, and stale engines fail closed.
p = Path('tests/pre_note3_browser_regression_v4.cjs')
s = p.read_text(encoding='utf-8')
old_wait = '''    typeof buildNoteFourPrescription === 'function' &&
    typeof buildNoteFiveEnvironmentFilter === 'function' &&
    typeof buildNoteSixTiming === 'function' &&
    typeof analyzeDayMasterStrengthV2 === 'function','''
new_wait = '''    typeof buildNoteFourPrescription === 'function' &&
    typeof buildNoteFiveEnvironmentFilter === 'function' &&
    typeof buildNoteSixTiming === 'function' &&
    typeof analyzeDayMasterStrengthV2 === 'function' &&
    globalThis.__MANSE_KOREA_V2__?.version === '2.2.0','''
s = replace_once(s, old_wait, new_wait, 'browser wait for manse 2.2.0')
old_return = '''      return {
        exact: {'''
new_return = '''      const manseScriptSrc = Array.from(document.scripts)
        .map((x) => x.getAttribute('src') || '')
        .find((src) => src.includes('manse-korea-v2.js')) || '';
      const runtimeVersion = globalThis.__MANSE_KOREA_V2__?.version || '';
      let staleGuard = { code:'', message:'' };
      const originalVersion = globalThis.__MANSE_KOREA_V2__.version;
      globalThis.__MANSE_KOREA_V2__.version = 'stale-test';
      try { calculateAccurateManse(1998,2,21,'03:10','male'); }
      catch (e) { staleGuard = { code:e.code || '', message:e.message || '' }; }
      globalThis.__MANSE_KOREA_V2__.version = originalVersion;
      return {
        manseScriptSrc,
        runtimeVersion,
        staleGuard,
        exact: {'''
s = replace_once(s, old_return, new_return, 'browser runtime cache metadata')
old_assert = '''    assert(r.exact.year === '戊寅', `1998 year drift ${r.exact.year}`);'''
new_assert = '''    assert(r.manseScriptSrc.includes('manse-korea-v2.js?v=2.2.0'), `stale manse asset URL ${r.manseScriptSrc}`);
    assert(r.runtimeVersion === '2.2.0', `stale manse runtime ${r.runtimeVersion}`);
    assert(r.staleGuard.code === 'MANSE_ENGINE_STALE', `stale engine did not fail closed ${JSON.stringify(r.staleGuard)}`);
    assert(r.exact.year === '戊寅', `1998 year drift ${r.exact.year}`);'''
s = replace_once(s, old_assert, new_assert, 'browser cache assertions')
p.write_text(s, encoding='utf-8')

print('MANSE_CACHE_HOTFIX_PATCHED')
