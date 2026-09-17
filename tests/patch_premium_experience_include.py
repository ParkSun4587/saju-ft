from pathlib import Path
p = Path('index.html')
s = p.read_text(encoding='utf-8')
tag = '    <script src="./premium-experience-v2.js?v=2.0.0"></script>\n'
if tag in s:
    print('PREMIUM_EXPERIENCE_INCLUDE_ALREADY_PRESENT')
else:
    anchor = '    <script src="./integrated-saju-profile-v1.js?v=1.0.0"></script>\n'
    if anchor not in s:
        raise SystemExit('integrated profile script anchor not found')
    s = s.replace(anchor, anchor + tag, 1)
    p.write_text(s, encoding='utf-8')
    print('PREMIUM_EXPERIENCE_INCLUDE_PATCHED')
