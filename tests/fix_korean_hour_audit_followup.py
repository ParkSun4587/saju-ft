from pathlib import Path


def replace_once(text, old, new, label):
    n = text.count(old)
    if n != 1:
        raise SystemExit(f"{label}: expected 1 match, got {n}")
    return text.replace(old, new, 1)

p = Path('index.html')
s = p.read_text(encoding='utf-8')
s = replace_once(
    s,
    '''          basis.textContent = Number.isFinite(correction)
            ? `한국 만세력 기준 · 시간 ${correction > 0 ? "+" : ""}${correction}분 보정`
            : "한국 만세력 기준";
''',
    '''          basis.textContent = data?.pillars?.hour && Number.isFinite(correction)
            ? `한국 만세력 기준 · 시간 ${correction > 0 ? "+" : ""}${correction}분 보정`
            : "한국 만세력 기준";
''',
    'unknown-time basis label',
)
p.write_text(s, encoding='utf-8')

p = Path('tests/pre_note3_browser_regression_v4.cjs')
s = p.read_text(encoding='utf-8')
s = replace_once(
    s,
    '''    assert(r.late.hour === '甲子', `late zi regression ${r.late.hour}`);
''',
    '''    assert(r.late.hour.endsWith('亥'), `23:00 recorded time should still be 亥 after Korean correction: ${r.late.hour}`);
''',
    'browser late-hour assertion',
)
p.write_text(s, encoding='utf-8')
print('FOLLOWUP_PATCH_READY')
