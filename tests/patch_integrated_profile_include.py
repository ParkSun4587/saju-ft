from pathlib import Path
p = Path('index.html')
s = p.read_text(encoding='utf-8')
tag = '    <script src="./integrated-saju-profile-v1.js?v=1.0.0"></script>\n'
if tag in s:
    print('INTEGRATED_PROFILE_INCLUDE_ALREADY_PRESENT')
else:
    anchor = '</body>'
    if anchor not in s:
        raise SystemExit('body close anchor not found')
    s = s.replace(anchor, tag + '  ' + anchor, 1)
    p.write_text(s, encoding='utf-8')
    print('INTEGRATED_PROFILE_INCLUDE_PATCHED')
