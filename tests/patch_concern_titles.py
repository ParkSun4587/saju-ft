from pathlib import Path
p = Path('index.html')
s = p.read_text(encoding='utf-8')

repls = {
'''  const p = copy[concernKey] || copy.money;
  const strengthLine = isT ? ctx.strengthT : ctx.strengthF;
  if (isT) {
    return {
      badge: `${concernLabel} · 반복 패턴`,
      title: "이건 우연이 아니라 네가 반복하는 순서야",''': '''  const p = copy[concernKey] || copy.money;
  const strengthLine = isT ? ctx.strengthT : ctx.strengthF;
  const titles = {
    money: { F: "돈 때문에 또 자책하기 전에, 네가 흔들리는 순서부터 같이 보자", T: "돈 새는 순서는 늘 비슷해. 끊을 지점도 정해져 있어" },
    career: { F: "열심히 하는데 왜 자꾸 제자리 같았는지, 이 순서에서 보여", T: "커리어가 막힐 때 너는 늘 같은 데서 시간을 버려" },
    love: { F: "좋아할수록 왜 네 마음이 더 바빠지는지, 이 순서야", T: "연애에서 애매함이 길어지는 순서부터 끊어" },
    path: { F: "고민만 길어지는 날엔 늘 비슷한 순서가 있었어", T: "진로 고민이 길어지는 건 생각 순서가 늘 같아서야" },
    people: { F: "사람 때문에 지칠 때, 너는 늘 네 마음을 제일 나중에 챙겨", T: "관계가 터지기 전까지 참는 순서가 문제야" },
    mental: { F: "무너지기 전까지 네가 어떻게 버티는지, 언니 눈엔 이 순서가 보여", T: "번아웃은 갑자기 안 와. 네가 반복하는 순서가 있어" },
  };
  const title = (titles[concernKey] || titles.money)[isT ? "T" : "F"];
  if (isT) {
    return {
      badge: `${concernLabel} · 반복 패턴`,
      title,''',
'''  return {
    badge: `${concernLabel} · 반복 패턴`,
    title: "자꾸 같은 데서 힘들었던 데는 이유가 있었어",''': '''  return {
    badge: `${concernLabel} · 반복 패턴`,
    title,''',
'''  const p = copy[concernKey] || copy.money;
  const personal = ctx.weakHuman;
  return isT ? {
    badge: `${concernLabel} · 블라인드스팟`,
    title: "네가 원인이라고 찍은 데랑 실제 새는 데가 달라",''': '''  const p = copy[concernKey] || copy.money;
  const personal = ctx.weakHuman;
  const titles = {
    money: { F: "돈이 안 모인다고 네 능력부터 의심했다면, 원인은 다른 데 있을 수 있어", T: "수입 탓하기 전에 실제 돈 새는 구멍부터 봐" },
    career: { F: "실력 부족이라고 자책했다면, 언니는 다른 데를 먼저 볼래", T: "실력 문제가 아니라 노출과 요구가 늦은 거야" },
    love: { F: "상대 마음만 문제였을까? 네 마음이 뒤로 밀린 순간도 같이 보자", T: "상대 분석보다 네 확인이 늦은 게 더 큰 누수야" },
    path: { F: "적성을 못 찾은 게 아니라, 해볼 기회를 너무 늦춘 건 아닐까", T: "적성 찾기보다 실험 부족이 문제야" },
    people: { F: "사람 보는 눈 탓하기 전에, 네가 참아준 시간을 먼저 보자", T: "사람 보는 눈보다 경계선 속도가 문제야" },
    mental: { F: "멘탈이 약해서가 아니라, 비울 틈 없이 버틴 건 아닐까", T: "멘탈 문제가 아니라 회복 순서가 틀어진 거야" },
  };
  const title = (titles[concernKey] || titles.money)[isT ? "T" : "F"];
  return isT ? {
    badge: `${concernLabel} · 블라인드스팟`,
    title,''',
'''  } : {
    badge: `${concernLabel} · 블라인드스팟`,
    title: "혹시 네가 엉뚱한 데서 너 자신을 탓하고 있었던 건 아닐까",''': '''  } : {
    badge: `${concernLabel} · 블라인드스팟`,
    title,''',
'''  const last = ctx.hasClash ? "특히 관계나 일정이 갑자기 꼬이는 날엔 평소 기준보다 더 빨리 멈추는 게 좋아." : "완벽하게 지킬 필요 없어. 한 번이라도 예전 반응 대신 새 반응을 고르면 성공이야.";
  return isT ? {
    badge: `${concernLabel} · 7일 처방`,
    title: "복잡하게 하지 마. 7일 동안 딱 세 가지만 해",''': '''  const last = ctx.hasClash ? "특히 관계나 일정이 갑자기 꼬이는 날엔 평소 기준보다 더 빨리 멈추는 게 좋아." : "완벽하게 지킬 필요 없어. 한 번이라도 예전 반응 대신 새 반응을 고르면 성공이야.";
  const titles = {
    money: { F: "돈 때문에 마음 상하지 않게, 언니랑 7일만 새는 데부터 막아보자", T: "7일이면 돼. 지출 통제 말고 새는 순간부터 차단해" },
    career: { F: "더 공부하라고 안 할게. 7일 동안 네가 한 걸 밖으로 꺼내보자", T: "7일 동안 준비 금지. 결과물 하나를 밖으로 내" },
    love: { F: "상대 마음 쫓느라 지치지 않게, 7일만 네 마음부터 챙겨보자", T: "7일 동안 해석 줄이고 확인 늘려. 그게 처방이야" },
    path: { F: "정답 찾느라 숨 막히지 않게, 7일만 작게 해보자", T: "7일 실험 하나면 된다. 생각 더 하지 마" },
    people: { F: "좋은 사람 되느라 너까지 잃지 않게, 7일만 선을 연습하자", T: "7일 동안 불편함을 미루지 마. 바로 선 긋는 연습해" },
    mental: { F: "더 버티라고 안 할게. 7일만 네 마음이 쉴 자리를 먼저 만들자", T: "7일 동안 회복을 일정으로 잠가. 의지로 버티지 마" },
  };
  const title = (titles[concernKey] || titles.money)[isT ? "T" : "F"];
  return isT ? {
    badge: `${concernLabel} · 7일 처방`,
    title,''',
'''  } : {
    badge: `${concernLabel} · 7일 처방`,
    title: "너 더 몰아붙이는 처방은 안 줄게. 언니랑 7일만 이렇게 해보자",''': '''  } : {
    badge: `${concernLabel} · 7일 처방`,
    title,''',
'''  const extra = ctx.hasClash
    ? "너는 관계가 꼬이면 한꺼번에 지치기 쉬운 편이라 ‘조금 불편한데?’ 싶을 때 빨리 선을 확인하는 게 중요해."
    : "너한테 좋은 관계는 강렬한 사람보다 같이 있을수록 네 에너지가 덜 새는 사람이야.";
  return isT ? {
    badge: `${concernLabel} · 사람 필터`,
    title: "남길 사람, 거리 둘 사람. 기준은 생각보다 단순해",''': '''  const extra = ctx.hasClash
    ? "너는 관계가 꼬이면 한꺼번에 지치기 쉬운 편이라 ‘조금 불편한데?’ 싶을 때 빨리 선을 확인하는 게 중요해."
    : "너한테 좋은 관계는 강렬한 사람보다 같이 있을수록 네 에너지가 덜 새는 사람이야.";
  const titles = {
    money: { F: "돈 앞에서도 네 마음을 작게 만들지 않는 사람이 진짜 네 편이야", T: "돈 얘기할수록 차분해지는 사람만 남겨" },
    career: { F: "네 성실함을 당연하게 먹지 않는 곳이 네 자리야", T: "응원보다 평가 기준이 분명한 사람을 골라" },
    love: { F: "서운하다고 말해도 사랑이 줄지 않는 사람이 맞는 사람이야", T: "밀당 말고 말과 행동이 맞는 사람만 봐" },
    path: { F: "걱정해도 네 선택권까지 가져가지 않는 사람이 네 편이야", T: "정답 강요하는 사람 말고 실험하게 두는 사람을 남겨" },
    people: { F: "네가 상대 기분까지 책임지지 않아도 편한 사람이 진짜 귀한 사람이야", T: "선을 말했을 때 고치는 사람만 남겨" },
    mental: { F: "아무것도 안 해도 곁에서 편하게 해주는 사람이 네 안식처야", T: "더 몰아붙이는 사람 말고 회복을 지켜주는 사람을 둬" },
  };
  const title = (titles[concernKey] || titles.money)[isT ? "T" : "F"];
  return isT ? {
    badge: `${concernLabel} · 사람 필터`,
    title,''',
'''  } : {
    badge: `${concernLabel} · 사람 필터`,
    title: "네가 편해지는 사람이 진짜 네 편이야. 자꾸 긴장하게 만드는 사람 말고",''': '''  } : {
    badge: `${concernLabel} · 사람 필터`,
    title,''',
}

for old, new in repls.items():
    count = s.count(old)
    if count != 1:
        raise SystemExit(f'expected one title patch match, got {count}: {old[:60]!r}')
    s = s.replace(old, new, 1)

p.write_text(s, encoding='utf-8')
print('CONCERN_TITLES_PATCHED')
