from pathlib import Path
p = Path('index.html')
s = p.read_text(encoding='utf-8')
repls = {
'''      desc: `<b>트리거</b> — ${p.trigger}.<br><br><b>자동반응</b> — ${p.reaction}.<br><br><b>대가</b> — ${p.cost}.<br><br>${strengthLine} 그래서 끊을 지점은 감정이 아니라 행동 순서야.`,''': '''      desc: `<b>시작</b> — ${p.trigger}.<br><br><b>네가 바로 하는 반응</b> — ${p.reaction}.<br><br><b>결국 남는 것</b> — ${p.cost}.<br><br>${strengthLine} 그래서 끊을 지점은 감정이 아니라 행동 순서야.`,''',
'''    badge: `${concernLabel} · 블라인드스팟`,''': '''    badge: `${concernLabel} · 놓친 포인트`,''',
'''    desc: `<b>네가 문제라고 본 것:</b> ${p.assumed}.<br><br><b>실제 누수:</b> ${p.actual}.<br><br>특히 네가 놓치기 쉬운 건 <b>${personal}</b> 쪽이야. 원인 잘못 잡고 더 열심히 하지 마.`,''': '''    desc: `<b>네가 문제라고 본 것:</b> ${p.assumed}.<br><br><b>실제로 새는 곳:</b> ${p.actual}.<br><br>특히 네가 놓치기 쉬운 건 <b>${personal}</b> 쪽이야. 원인 잘못 잡고 더 열심히 하지 마.`,''',
}
for old, new in repls.items():
    count = s.count(old)
    if old.startswith('    badge:'):
        if count != 2:
            raise SystemExit(f'expected two badge matches, got {count}')
        s = s.replace(old, new)
    else:
        if count != 1:
            raise SystemExit(f'expected one natural-copy match, got {count}: {old[:60]!r}')
        s = s.replace(old, new, 1)

# Add one natural relationship-personalization sentence to NOTE5 without exposing technical labels.
old = '''  const title = (titles[concernKey] || titles.money)[isT ? "T" : "F"];
  return isT ? {
    badge: `${concernLabel} · 사람 필터`,
    title,
    desc: `<b>남길 사람</b><br>${p.keep}.<br><br><b>거리 둘 사람</b><br>${p.cut}.<br><br><b>잘 맞는 환경</b><br>${p.place}.<br><br>${extra}`,'''
new = '''  const title = (titles[concernKey] || titles.money)[isT ? "T" : "F"];
  const relationPersonal = isT
    ? `너는 ${ctx.dominantHuman}이 올라오는 순간 관계에서 판단을 오래 끌 수 있어. 그 마음을 더 자극하는 사람은 굳이 가까이 둘 필요 없어.`
    : `너는 ${ctx.dominantHuman}이 올라오면 혼자 더 애쓰는 쪽이야. 그래서 네가 애쓰지 않아도 편한 사람이 훨씬 잘 맞아.`;
  return isT ? {
    badge: `${concernLabel} · 사람 필터`,
    title,
    desc: `<b>남길 사람</b><br>${p.keep}.<br><br><b>거리 둘 사람</b><br>${p.cut}.<br><br><b>잘 맞는 환경</b><br>${p.place}.<br><br>${relationPersonal}<br><br>${extra}`,'''
if s.count(old) != 1:
    raise SystemExit('NOTE5 relation personalization anchor not found')
s = s.replace(old, new, 1)
old2 = '''    desc: `<b>곁에 둘 사람</b><br>${p.keep}.<br><br><b>조금 멀리해도 되는 사람</b><br>${p.cut}.<br><br><b>네가 숨 쉬기 편한 곳</b><br>${p.place}.<br><br>${extra} 사람 때문에 힘들 때마다 네가 더 잘하면 된다고 생각하지 않았으면 좋겠어.`,'''
new2 = '''    desc: `<b>곁에 둘 사람</b><br>${p.keep}.<br><br><b>조금 멀리해도 되는 사람</b><br>${p.cut}.<br><br><b>네가 숨 쉬기 편한 곳</b><br>${p.place}.<br><br>${relationPersonal}<br><br>${extra} 사람 때문에 힘들 때마다 네가 더 잘하면 된다고 생각하지 않았으면 좋겠어.`,'''
if s.count(old2) != 1:
    raise SystemExit('NOTE5 F relation anchor not found')
s = s.replace(old2, new2, 1)

p.write_text(s, encoding='utf-8')
print('COPY_NATURALIZED')
