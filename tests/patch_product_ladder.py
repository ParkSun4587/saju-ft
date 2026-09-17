from pathlib import Path

p = Path('index.html')
s = p.read_text(encoding='utf-8')

# Load paid-value QA after the integrated profile wrapper, then product catalog last.
old_scripts = '    <script src="./integrated-saju-profile-v1.js?v=1.0.0"></script>\n  </body>'
new_scripts = '    <script src="./integrated-saju-profile-v1.js?v=1.0.0"></script>\n    <script src="./paid-value-layer-v1.js?v=1.0.0"></script>\n    <script src="./premium-products-v1.js?v=1.0.0"></script>\n  </body>'
if old_scripts not in s and 'paid-value-layer-v1.js?v=1.0.0' not in s:
    raise SystemExit('script include anchor not found')
if old_scripts in s:
    s = s.replace(old_scripts, new_scripts, 1)

# Product orders are restored by the existing signed ticket path, but their amount/access
# must be handled by the product layer before the legacy 990-won checks run.
anchor = '''          const restored = resultFromSnapshot(resume.data);\n          renderResultView(restored, { resumeApproval: false });\n          versionBefore = viewVersion;\n          if (params.get("payment") === "fail") {'''
replacement = '''          const restored = resultFromSnapshot(resume.data);\n          renderResultView(restored, { resumeApproval: false });\n          versionBefore = viewVersion;\n          if (\n            resume.productId &&\n            resume.productId !== "concern_single" &&\n            typeof window.handleUnniProductPaymentReturn === "function"\n          ) {\n            await window.handleUnniProductPaymentReturn(params, resume, restored, ticket);\n            return;\n          }\n          if (params.get("payment") === "fail") {'''
if 'resume.productId !== "concern_single"' not in s:
    if anchor not in s:
        raise SystemExit('product payment return anchor not found')
    s = s.replace(anchor, replacement, 1)

p.write_text(s, encoding='utf-8')
print('PRODUCT_LADDER_INDEX_PATCHED')
