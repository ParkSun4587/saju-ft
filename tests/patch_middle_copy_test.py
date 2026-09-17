from pathlib import Path
p = Path('tests/pre_note3_browser_regression_v4.cjs')
s = p.read_text(encoding='utf-8')
old = """    assert(middle.n1.includes('중화(한쪽으로 치우치지 않은 균형형)'), 'NOTE1 basis does not label 중화 explicitly');
    assert(middle.n1.includes('<b>중화</b>라 한쪽 반응으로 고정되기보다'), 'NOTE1 still collapses 중화 into binary copy');
    assert(middle.n2.includes('신강·신약 한쪽으로 치우치지 않아'), 'NOTE2 still collapses 중화 into 신약 copy');
    assert(!middle.n2.includes('주변 반응을 빠르게 흡수해서 작은 신호에도 마음이 먼저 흔들리고'), 'NOTE2 used legacy 신약-only reason for 중화');
"""
new = """    assert(middle.n1.includes('버틸 때와 내려놓을 때를 꽤 잘 아는데'), 'NOTE1 middle-strength copy drift');
    assert(middle.n2.includes('버틸 때와 내려놓을 때를 꽤 잘 아는데'), 'NOTE2 middle-strength copy drift');
    assert(!middle.n1.includes('상황과 사람의 분위기를 빨리 읽는 만큼 네 마음이 뒤로 밀리기 쉬워'), 'NOTE1 collapsed middle into weak copy');
    assert(!middle.n2.includes('상황과 사람의 분위기를 빨리 읽는 만큼 네 마음이 뒤로 밀리기 쉬워'), 'NOTE2 collapsed middle into weak copy');
    assert(!middle.n1.includes('중화') && !middle.n2.includes('중화'), 'hard strength jargon leaked into user copy');
"""
if old not in s:
    raise SystemExit('middle assertion block not found')
s = s.replace(old, new, 1)
p.write_text(s, encoding='utf-8')
print('MIDDLE_COPY_TEST_PATCHED')
