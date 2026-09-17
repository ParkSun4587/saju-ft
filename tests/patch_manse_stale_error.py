from pathlib import Path
p = Path('index.html')
s = p.read_text(encoding='utf-8')
old = '''              "KST_LOCAL_TIME_AMBIGUOUS",
              "KOREAN_LUNAR_INVALID",
            ].includes(err.code)'''
new = '''              "KST_LOCAL_TIME_AMBIGUOUS",
              "KOREAN_LUNAR_INVALID",
              "MANSE_ENGINE_STALE",
            ].includes(err.code)'''
count = s.count(old)
if count != 1:
    raise SystemExit(f'expected exactly one diagnostic whitelist, got {count}')
s = s.replace(old, new, 1)
p.write_text(s, encoding='utf-8')
print('MANSE_STALE_ERROR_PATCHED')
