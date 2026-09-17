from pathlib import Path

# ---- index wiring ----
p = Path('index.html')
s = p.read_text(encoding='utf-8')
old_scripts = '    <script src="./integrated-saju-profile-v1.js?v=1.0.0"></script>\n  </body>'
new_scripts = '    <script src="./integrated-saju-profile-v1.js?v=1.0.0"></script>\n    <script src="./paid-value-layer-v1.js?v=1.0.0"></script>\n    <script src="./premium-products-v1.js?v=1.0.0"></script>\n  </body>'
if old_scripts not in s and 'paid-value-layer-v1.js?v=1.0.0' not in s:
    raise SystemExit('script include anchor not found')
if old_scripts in s:
    s = s.replace(old_scripts, new_scripts, 1)
anchor = '''          const restored = resultFromSnapshot(resume.data);\n          renderResultView(restored, { resumeApproval: false });\n          versionBefore = viewVersion;\n          if (params.get("payment") === "fail") {'''
replacement = '''          const restored = resultFromSnapshot(resume.data);\n          renderResultView(restored, { resumeApproval: false });\n          versionBefore = viewVersion;\n          if (\n            resume.productId &&\n            resume.productId !== "concern_single" &&\n            typeof window.handleUnniProductPaymentReturn === "function"\n          ) {\n            await window.handleUnniProductPaymentReturn(params, resume, restored, ticket);\n            return;\n          }\n          if (params.get("payment") === "fail") {'''
if 'resume.productId !== "concern_single"' not in s:
    if anchor not in s: raise SystemExit('product payment return anchor not found')
    s = s.replace(anchor, replacement, 1)
p.write_text(s, encoding='utf-8')

# ---- paid-value wrapper metadata + NOTE6 integrated profile use ----
pp = Path('paid-value-layer-v1.js')
ps = pp.read_text(encoding='utf-8')
old_meta = '''    wrapped.__paidValueWrapped = true;\n    wrapped.__base = base;\n    global.generateConcernNotes = wrapped;'''
new_meta = '''    wrapped.__paidValueWrapped = true;\n    wrapped.__integratedProfileWrapped = !!base.__integratedProfileWrapped;\n    wrapped.__base = base.__base || base;\n    wrapped.__integratedBase = base;\n    global.generateConcernNotes = wrapped;'''
if new_meta not in ps:
    if old_meta not in ps and 'wrapped.__integratedBase = base;' not in ps:
        raise SystemExit('paid wrapper metadata anchor not found')
    if old_meta in ps: ps = ps.replace(old_meta, new_meta, 1)

old_desc = '''    const desc = `${intro}<br><br><b>첫 번째 흐름 · ${firstDate}</b><br>${firstBody}<br><br><b>두 번째 흐름 · ${secondDate}</b><br>${secondBody}<br><br><b>두 시기의 차이</b><br>${comparisonLine(timing, concernKey, isT)}`;'''
new_desc = '''    const profile = data?.integratedSajuProfile || null;\n    const personalMove = profile\n      ? `${profile.balance?.climateHuman || "현실 반응을 보면서 속도를 조절하는 쪽"}. 특히 ${profile.elements?.primaryBehavior?.verb || "한 번에 하나씩 움직이는 것"}을 먼저 써.`\n      : "좋은 시기에도 한 번에 크게 뒤집기보다 현실 반응을 확인하면서 다음 행동을 정해.";\n    const desc = `${intro}<br><br><b>첫 번째 흐름 · ${firstDate}</b><br>${firstBody}<br><br><b>두 번째 흐름 · ${secondDate}</b><br>${secondBody}<br><br><b>두 시기의 차이</b><br>${comparisonLine(timing, concernKey, isT)}<br><br><b>너한테 맞는 움직임</b><br>${personalMove}`;'''
if new_desc not in ps:
    if old_desc not in ps: raise SystemExit('NOTE6 integrated profile anchor not found')
    ps = ps.replace(old_desc, new_desc, 1)
old_ret = '''    return { ...note, desc, checklist, __timingQA: { firstDate, secondDate, firstBody, secondBody } };'''
new_ret = '''    return { ...note, desc, checklist, __timingQA: { firstDate, secondDate, firstBody, secondBody, profileFingerprint: profile?.fingerprint || "" } };'''
if new_ret not in ps:
    if old_ret not in ps: raise SystemExit('NOTE6 timing QA return anchor not found')
    ps = ps.replace(old_ret, new_ret, 1)
pp.write_text(ps, encoding='utf-8')

# ---- integrated regression understands the outer paid-value NOTE6 renderer ----
it = Path('tests/integrated_profile_regression.cjs')
ts = it.read_text(encoding='utf-8')
old_enriched = '''          enriched: !!base && notes.every((n, i) => (n.desc || '').length > (base[i]?.desc || '').length),'''
new_enriched = '''          enriched: !!base && notes.slice(0, 5).every((n, i) => (n.desc || '').length > (base[i]?.desc || '').length) && !!notes[5]?.__timingQA?.profileFingerprint,'''
if new_enriched not in ts:
    if old_enriched not in ts: raise SystemExit('integrated enriched assertion anchor not found')
    ts = ts.replace(old_enriched, new_enriched, 1)
it.write_text(ts, encoding='utf-8')

print('PRODUCT_LADDER_PATCHED')
