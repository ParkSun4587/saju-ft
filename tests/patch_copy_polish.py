from pathlib import Path

p = Path('index.html')
s = p.read_text(encoding='utf-8')


def replace_between(text, start, end, replacement):
    a = text.find(start)
    if a < 0:
        raise SystemExit(f'missing start marker: {start}')
    b = text.find(end, a + len(start))
    if b < 0:
        raise SystemExit(f'missing end marker: {end}')
    return text[:a] + replacement.rstrip() + '\n\n' + text[b:]

helpers_and_note1 = r'''function getUnniCopyContext(data) {
  const profile = data?.analysisProfile || {};
  const strength = profile?.dayMaster?.strength || (data?.isDayMasterStrong ? "신강" : "신약");
  const dominantRaw = profile?.sipsin?.dominant;
  const dominant = typeof dominantRaw === "string" ? dominantRaw : (dominantRaw?.name || "");
  const lowest = data?.stats ? getLowestStatInfo(data.stats) : null;
  const hasClash = !!profile?.relations?.hasChung;
  const dominantHuman = ({
    비견: "내 방식은 내가 지키고 싶은 마음",
    겁재: "비교에서 밀리기 싫은 마음",
    식신: "내 페이스를 깨고 싶지 않은 마음",
    상관: "통제받거나 무시당하기 싫은 마음",
    정재: "예측 가능한 안정감을 지키고 싶은 마음",
    편재: "기회나 재미를 놓치기 싫은 마음",
    정관: "좋은 평가와 신뢰를 잃고 싶지 않은 마음",
    편관: "약해 보이거나 실패한 사람처럼 보이기 싫은 마음",
    정인: "충분히 이해받고 안전하다고 느끼고 싶은 마음",
    편인: "상대 속뜻을 먼저 읽고 대비하려는 마음",
  })[dominant] || "혼자서라도 상황을 정리하려는 마음";
  const weakHuman = ({
    wealth: "돈과 선택을 숫자로 확인하는 습관",
    mental: "마음이 지치기 전에 멈추는 감각",
    drive: "생각을 행동으로 옮기는 첫걸음",
    network: "혼자 해결하지 않고 사람을 쓰는 감각",
  })[lowest?.type] || "마지막 한 끗을 챙기는 습관";
  const strengthF = strength === "신강"
    ? "겉으로는 괜찮아 보여도 혼자 버티는 시간이 길어지는 편이야"
    : strength === "신약"
      ? "상황과 사람의 분위기를 빨리 읽는 만큼 네 마음이 뒤로 밀리기 쉬워"
      : "버틸 때와 내려놓을 때를 꽤 잘 아는데, 애매한 순간엔 오래 재는 편이야";
  const strengthT = strength === "신강"
    ? "너는 버티는 힘이 있어서 문제를 늦게 끊는 쪽이야"
    : strength === "신약"
      ? "너는 주변 변수에 반응이 빠른 대신 네 기준이 늦게 나오는 쪽이야"
      : "너는 균형은 괜찮은데 애매하면 결정을 미루는 쪽이야";
  return { strength, dominantHuman, weakHuman, hasClash, strengthF, strengthT };
}

function buildNoteOneInsight(data, concernKey, concernLabel, isT) {
  const ctx = getUnniCopyContext(data);
  const copy = {
    money: {
      F: {
        title: "너 돈 못 모으는 사람이 아니라, 마음 흔들릴 때 돈이 대신 움직이는 편이야",
        body: "평소엔 생각보다 계산 잘해. 근데 속상하거나 불안하거나, ‘나 이 정도는 해도 되지’ 싶은 날엔 결제가 위로 역할을 해버려. 그래서 사고 나서 후회하는 게 아니라, 결제 전에 이미 마음이 지쳐 있었던 경우가 많아.",
        check: "다음 결제 직전에 ‘지금 필요한 건 물건이야, 기분전환이야?’ 한 번만 물어보기",
      },
      T: {
        title: "돈 새는 구멍은 소비습관보다 ‘흔들릴 때 결제하는 순간’이야",
        body: "평소 소비가 문제라기보다 감정이 흔들린 날 판단 기준이 풀리는 게 문제야. 그 순간만 잡으면 지출 전체를 억지로 줄일 필요도 없어. 네 돈 문제는 ‘얼마 썼냐’보다 ‘언제 기준을 놨냐’를 보는 게 더 정확해.",
        check: "최근 충동결제 3건 옆에 그날 기분을 한 단어로 적기",
      },
    },
    career: {
      F: {
        title: "너 능력 없는 거 아니야. 너무 오래 ‘더 잘해야 말할 수 있지’ 하고 있었어",
        body: "잘하고도 스스로 먼저 부족한 점부터 찾아. 그래서 남들은 결과를 내보일 때 너는 한 번 더 다듬고, 한 번 더 참아. 언니가 보기엔 실력이 모자란 장면보다 네 몫을 네가 작게 말한 장면이 더 많아.",
        check: "이번 주 한 일 중 남에게 보여줄 결과물 하나를 딱 골라두기",
      },
      T: {
        title: "커리어에서 막히는 건 실력보다 ‘증거를 늦게 내놓는 습관’이야",
        body: "잘하는 것과 인정받는 건 다른 문제야. 너는 준비는 오래 하는데 결과물 공개, 지원, 협상은 뒤로 미루는 쪽이 보여. 회사나 환경 탓이 아예 없다는 뜻이 아니라, 네가 통제할 수 있는 누수부터 막아야 해.",
        check: "말로 설명할 성과 하나를 숫자·결과물·전후비교 중 하나로 바꾸기",
      },
    },
    love: {
      F: {
        title: "너 사랑을 못 받는 게 아니라, 상대 마음까지 네가 먼저 책임지려는 편이야",
        body: "좋아하면 더 조심스러워지고, 서운해도 ‘괜히 부담 주나’부터 생각하지? 그러다 네 마음은 점점 뒤로 밀리고 상대 반응만 크게 보여. 네가 예민한 게 아니라 좋아하는 사람 앞에서 너무 많이 이해하려고 한 거야.",
        check: "다음엔 상대 마음 추측하기 전에 네 감정을 한 문장으로 먼저 말해보기",
      },
      T: {
        title: "연애가 꼬이는 순간은 상대가 애매할 때보다 네가 확인을 미룰 때야",
        body: "신호를 오래 분석할수록 정확해지는 게 아니야. 애매한 행동을 해석하느라 시간을 쓰고, 정작 필요한 질문은 늦게 해. 좋은 사람을 못 만나는 문제와 애매한 사람을 오래 두는 문제를 분리해야 해.",
        check: "애매한 관계 하나에 ‘나는 지금 뭘 확인해야 하지?’ 질문 한 개만 적기",
      },
    },
    path: {
      F: {
        title: "네가 길을 못 찾는 게 아니라, 남들 안심시키느라 네 마음을 너무 늦게 들었어",
        body: "하고 싶은 게 생겨도 바로 설레기보다 ‘현실적으로 되나, 주변이 뭐라 하나’부터 보지? 그래서 꿈이 없는 것처럼 느껴질 수 있어. 근데 네 안엔 방향이 없는 게 아니라 허락받기 전까지 꺼내지 않는 선택지가 많은 편이야.",
        check: "아무도 평가하지 않는다고 치고 해보고 싶은 것 3개 적기",
      },
      T: {
        title: "진로가 안 보이는 게 아니라 확신 100%를 기다리느라 실험을 안 한 거야",
        body: "생각으로 진로를 확정하려고 하면 계속 제자리야. 네 경우엔 머릿속 비교를 더 늘리는 것보다 작은 실행에서 데이터를 얻는 게 빠르다. 확신은 시작 전에 생기는 게 아니라 해본 뒤 쌓이는 거야.",
        check: "고민 중인 선택지 하나를 7일짜리 작은 실험으로 바꾸기",
      },
    },
    people: {
      F: {
        title: "너 사람을 못 보는 게 아니라, 불편해도 너무 오래 이해해주는 편이야",
        body: "처음엔 분명 ‘이건 좀 아닌데’ 느껴. 근데 상대 사정도 생각하고, 분위기도 생각하고, 괜히 내가 예민한가 싶어서 한 번 더 넘겨. 그러다 진짜 지쳤을 때 갑자기 마음이 닫히는 거지.",
        check: "최근 참았던 관계 하나에서 첫 번째로 불편했던 순간을 적어보기",
      },
      T: {
        title: "인간관계 문제는 사람 보는 눈보다 ‘경계선이 늦게 나오는 것’에 가까워",
        body: "이상한 사람을 못 알아보는 게 아니야. 알아보고도 한두 번 더 기회를 주는 게 문제야. 불편함을 증거 부족으로 취급하지 마. 반복되면 그게 데이터야.",
        check: "다음에 같은 불편함이 두 번 반복되면 바로 말할 문장 하나 정해두기",
      },
    },
    mental: {
      F: {
        title: "너 멘탈 약한 거 아니야. 네 마음 말고 남의 마음까지 너무 많이 들고 있었어",
        body: "겉으로 별일 없어 보여도 머릿속에 사람 말, 해야 할 일, 미뤄둔 감정이 같이 돌아가. 그러니 쉬어도 쉰 것 같지 않은 거야. 네가 유난인 게 아니라 마음에 들어온 걸 밖으로 빼는 시간이 부족했던 거야.",
        check: "오늘 머릿속 걱정을 ‘내 일 / 남의 일’ 두 칸으로 나눠 적기",
      },
      T: {
        title: "멘탈이 약한 게 아니라 회복 전에 다음 일을 또 넣는 게 문제야",
        body: "지치면 쉬어야 하는데 너는 효율 떨어진 상태로 계속 밀어붙이는 쪽이 보여. 그러면 작은 일도 크게 느껴진다. 의지 문제가 아니라 회복 순서를 무시한 거야.",
        check: "오늘 일정에서 성과랑 상관없는 회복시간 30분을 먼저 잠그기",
      },
    },
  };
  const selected = copy[concernKey] || copy.money;
  const note = selected[isT ? "T" : "F"];
  const personal = isT
    ? `${ctx.strengthT} 그리고 ${ctx.dominantHuman}이 먼저 튀는 편이라 이 패턴이 더 빨리 굳어.`
    : `${ctx.strengthF}. 특히 ${ctx.dominantHuman} 때문에 네가 네 마음보다 상황을 먼저 정리하려고 할 때가 있어.`;
  return {
    badge: `${concernLabel} · 첫 번째 힌트`,
    title: note.title,
    desc: `${note.body}<br><br>${personal}`,
    checklist: note.check,
  };
}'''

note2 = r'''function buildNoteTwoPattern(data, concernKey, concernLabel, isT) {
  const ctx = getUnniCopyContext(data);
  const copy = {
    money: { trigger: "불안하거나 보상받고 싶은 날", reaction: "평소 세워둔 기준이 잠깐 느슨해지고 ‘이 정도는 괜찮지’로 넘어가", cost: "결제 뒤에 돈보다 자책이 더 남아", rule: "기분이 흔들린 날은 장바구니에만 넣고 다음 날 결제하기" },
    career: { trigger: "평가받거나 비교되는 순간", reaction: "바로 보여주기보다 더 준비하고 더 완벽하게 만들려고 해", cost: "실력은 쌓이는데 기회와 인정은 늦게 와", rule: "80% 완성되면 하나는 밖으로 내보내기" },
    love: { trigger: "상대 반응이 평소보다 차갑거나 애매할 때", reaction: "질문보다 해석을 먼저 하고 네 표현은 줄여", cost: "상대는 네 마음을 모르고 너는 혼자 더 불안해져", rule: "추측이 두 번 시작되면 질문 한 번 하기" },
    path: { trigger: "선택해야 하는데 실패 가능성이 보일 때", reaction: "정보를 더 모으고 비교표를 더 만들면서 시작을 늦춰", cost: "생각은 많아지는데 내 경험 데이터는 안 생겨", rule: "고민이 3일 넘으면 7일 실험 하나 시작하기" },
    people: { trigger: "상대가 선을 넘었는데 분위기가 깨질 것 같을 때", reaction: "일단 웃고 넘긴 뒤 혼자 의미를 곱씹어", cost: "한 번의 불편함이 오래 쌓여 관계 전체가 싫어져", rule: "두 번째 불편함 전에 짧게 선 말하기" },
    mental: { trigger: "일이 밀리거나 누군가 기대하는 게 많아질 때", reaction: "쉬는 시간을 먼저 없애고 더 버텨", cost: "회복이 늦어져 사소한 일에도 감정 소모가 커져", rule: "일정이 밀릴수록 수면·식사·30분 휴식부터 지키기" },
  };
  const p = copy[concernKey] || copy.money;
  const strengthLine = isT ? ctx.strengthT : ctx.strengthF;
  if (isT) {
    return {
      badge: `${concernLabel} · 반복 패턴`,
      title: "이건 우연이 아니라 네가 반복하는 순서야",
      desc: `<b>트리거</b> — ${p.trigger}.<br><br><b>자동반응</b> — ${p.reaction}.<br><br><b>대가</b> — ${p.cost}.<br><br>${strengthLine} 그래서 끊을 지점은 감정이 아니라 행동 순서야.`,
      checklist: `규칙 하나만 적용: ${p.rule}`,
    };
  }
  return {
    badge: `${concernLabel} · 반복 패턴`,
    title: "자꾸 같은 데서 힘들었던 데는 이유가 있었어",
    desc: `언니가 네 흐름을 보면 시작은 보통 <b>${p.trigger}</b>이야. 그때 ${p.reaction}. 그러고 나면 결국 ${p.cost}.<br><br>${strengthLine}. 그러니까 또 반복됐다고 너 자신부터 뭐라 하지 마. 대신 딱 한 군데만 바꾸자.`,
    checklist: `이번엔 이것만 같이 지켜보자: ${p.rule}`,
  };
}'''

note3 = r'''function buildNoteThreeBlindSpot(data, concernKey, concernLabel, isT) {
  const ctx = getUnniCopyContext(data);
  const copy = {
    money: { assumed: "내가 돈을 적게 벌어서 안 모인다", actual: "돈이 아니라 불안한 순간에 기준이 풀리는 게 더 큰 누수다", move: "수입 목표보다 감정결제 패턴부터 끊기" },
    career: { assumed: "내가 아직 실력이 부족하다", actual: "실력보다 결과를 보여주고 요구하는 타이밍이 늦다", move: "더 배우기 전에 이미 한 일을 보이게 만들기" },
    love: { assumed: "상대가 나를 충분히 좋아하지 않는다", actual: "상대 마음을 오래 추측하면서 네 기준과 질문이 뒤로 밀린다", move: "좋아하는지 해석보다 내가 원하는 관계인지 먼저 보기" },
    path: { assumed: "아직 내 적성을 못 찾았다", actual: "확신이 생길 때까지 경험을 미뤄서 적성을 확인할 재료가 부족하다", move: "정답 찾기보다 작은 실험으로 반응 확인하기" },
    people: { assumed: "내가 사람 보는 눈이 없다", actual: "첫 불편함을 알아차리고도 너무 오래 이해해준다", move: "사람 판별보다 경계선을 더 빨리 꺼내기" },
    mental: { assumed: "내 멘탈이 약하다", actual: "회복 전에 다음 부담을 계속 얹어서 마음이 비워질 틈이 없다", move: "강해지기보다 회복 순서를 먼저 지키기" },
  };
  const p = copy[concernKey] || copy.money;
  const personal = ctx.weakHuman;
  return isT ? {
    badge: `${concernLabel} · 블라인드스팟`,
    title: "네가 원인이라고 찍은 데랑 실제 새는 데가 달라",
    desc: `<b>네가 문제라고 본 것:</b> ${p.assumed}.<br><br><b>실제 누수:</b> ${p.actual}.<br><br>특히 네가 놓치기 쉬운 건 <b>${personal}</b> 쪽이야. 원인 잘못 잡고 더 열심히 하지 마.`,
    checklist: p.move,
  } : {
    badge: `${concernLabel} · 블라인드스팟`,
    title: "혹시 네가 엉뚱한 데서 너 자신을 탓하고 있었던 건 아닐까",
    desc: `너는 자꾸 <b>${p.assumed}</b>고 생각했을 수 있어. 근데 언니가 보기엔 진짜 새는 곳은 <b>${p.actual}</b> 쪽에 더 가까워.<br><br>그리고 네가 유독 놓치기 쉬운 건 <b>${personal}</b>이야. 그러니까 괜히 네 능력이나 매력부터 의심하지 않았으면 좋겠어.`,
    checklist: `이번엔 나를 탓하기 전에 이것부터 해보자: ${p.move}`,
  };
}'''

note4 = r'''function buildNoteFourPrescription(data, concernKey, concernLabel, isT) {
  const ctx = getUnniCopyContext(data);
  const copy = {
    money: ["오늘 최근 지출 5개를 ‘필요 / 기분전환’ 둘로만 나눠", "7일 동안 기분전환 지출은 하루 묵혔다 결제해", "이번 주엔 돈 아끼기보다 충동결제 1번 막는 걸 성공으로 쳐"],
    career: ["오늘 보여줄 수 있는 결과물 하나를 골라", "7일 안에 누군가에게 보여주거나 지원·제안에 써", "새 공부 시작 전에 이미 한 일 하나를 밖으로 꺼내"],
    love: ["오늘 네가 원하는 관계 기준을 3개만 적어", "7일 동안 추측 대신 확인 질문을 최소 한 번 해", "애매한 행동을 대신 해석해주지 마"],
    path: ["오늘 고민 중인 선택지 하나를 고르고", "7일짜리 체험·샘플·작업으로 직접 해봐", "결정 못 했다는 이유로 정보만 더 모으지 마"],
    people: ["오늘 최근 불편했던 관계 하나를 골라", "다음 불편함엔 24시간 안에 짧게 말해", "상대 사정 이해한다고 네 기준까지 없애지 마"],
    mental: ["오늘 회복시간 30분을 일정에 먼저 넣어", "7일 동안 잠·밥·휴식 중 하나는 무조건 지켜", "지쳤을 때 계획을 더 세우는 걸 멈춰"],
  };
  const steps = copy[concernKey] || copy.money;
  const last = ctx.hasClash ? "특히 관계나 일정이 갑자기 꼬이는 날엔 평소 기준보다 더 빨리 멈추는 게 좋아." : "완벽하게 지킬 필요 없어. 한 번이라도 예전 반응 대신 새 반응을 고르면 성공이야.";
  return isT ? {
    badge: `${concernLabel} · 7일 처방`,
    title: "복잡하게 하지 마. 7일 동안 딱 세 가지만 해",
    desc: `<b>1.</b> ${steps[0]}.<br><br><b>2.</b> ${steps[1]}.<br><br><b>3.</b> ${steps[2]}.<br><br>${last}`,
    checklist: "7일 뒤 ‘몇 번 했는지’만 숫자로 체크하기",
  } : {
    badge: `${concernLabel} · 7일 처방`,
    title: "너 더 몰아붙이는 처방은 안 줄게. 언니랑 7일만 이렇게 해보자",
    desc: `첫째, <b>${steps[0]}</b>.<br><br>둘째, <b>${steps[1]}</b>.<br><br>셋째, <b>${steps[2]}</b>.<br><br>${last} 너 지금까지 충분히 애썼으니까 이번엔 ‘더 열심히’ 말고 ‘덜 소모되게’ 가보자.`,
    checklist: "7일 뒤 잘한 거 하나만 골라서 스스로 인정해주기",
  };
}'''

note5 = r'''function buildNoteFiveEnvironmentFilter(data, concernKey, concernLabel, isT) {
  const ctx = getUnniCopyContext(data);
  const copy = {
    money: { keep: "돈 얘기를 해도 체면 세우게 만들지 않고 현실적으로 같이 정리해주는 사람", cut: "비교심 자극하고 ‘이 정도도 못 써?’ 하며 소비를 부추기는 사람", place: "가격·역할·보상이 미리 분명한 환경" },
    career: { keep: "네 성실함을 당연하게 먹지 않고 결과와 역할을 분명히 인정해주는 사람", cut: "일은 더 얹으면서 평가 기준은 계속 바꾸는 사람", place: "책임 범위와 피드백 기준이 분명한 팀" },
    love: { keep: "서운함을 말해도 비꼬지 않고 말과 행동을 맞춰주는 사람", cut: "확신은 안 주면서 네 반응만 확인하려는 사람", place: "밀당보다 약속과 소통이 예측 가능한 관계" },
    path: { keep: "걱정은 해도 네 선택권까지 뺏지 않고 직접 해보게 두는 사람", cut: "자기 기준의 안전한 답만 정답처럼 강요하는 사람", place: "작게 실험하고 수정할 수 있는 환경" },
    people: { keep: "네가 선을 말했을 때 변명보다 행동을 고치는 사람", cut: "네 불편함을 예민함으로 돌리거나 계속 떠보는 사람", place: "눈치보다 규칙과 존중이 먼저인 관계" },
    mental: { keep: "네가 쉬어도 죄책감 주지 않고 가만히 있어도 편한 사람", cut: "힘들다는데 해결책·비교·훈계부터 쏟는 사람", place: "혼자 있는 시간과 회복 리듬을 지킬 수 있는 환경" },
  };
  const p = copy[concernKey] || copy.money;
  const extra = ctx.hasClash
    ? "너는 관계가 꼬이면 한꺼번에 지치기 쉬운 편이라 ‘조금 불편한데?’ 싶을 때 빨리 선을 확인하는 게 중요해."
    : "너한테 좋은 관계는 강렬한 사람보다 같이 있을수록 네 에너지가 덜 새는 사람이야.";
  return isT ? {
    badge: `${concernLabel} · 사람 필터`,
    title: "남길 사람, 거리 둘 사람. 기준은 생각보다 단순해",
    desc: `<b>남길 사람</b><br>${p.keep}.<br><br><b>거리 둘 사람</b><br>${p.cut}.<br><br><b>잘 맞는 환경</b><br>${p.place}.<br><br>${extra}`,
    checklist: "사람 하나 떠올리고 ‘만난 뒤 에너지가 늘었나 줄었나’만 체크하기",
  } : {
    badge: `${concernLabel} · 사람 필터`,
    title: "네가 편해지는 사람이 진짜 네 편이야. 자꾸 긴장하게 만드는 사람 말고",
    desc: `<b>곁에 둘 사람</b><br>${p.keep}.<br><br><b>조금 멀리해도 되는 사람</b><br>${p.cut}.<br><br><b>네가 숨 쉬기 편한 곳</b><br>${p.place}.<br><br>${extra} 사람 때문에 힘들 때마다 네가 더 잘하면 된다고 생각하지 않았으면 좋겠어.`,
    checklist: "이번 주 한 사람에게서 느낀 ‘편안함 / 소모감’을 한 단어로 적어보기",
  };
}'''

note6 = r'''function buildNoteSixTiming(data, concernKey, concernLabel, isT) {
  const timing = getTrueBaziTiming(
    data?.dayOheng || "to",
    concernKey,
    data?.userGender,
    data?.userBirthStr,
    data?.gyeokguk,
    data?.gyeokStatus,
    data?.realYeonun,
  );
  const titles = {
    money: { F: "돈 때문에 마음 급해지지 않게, 언니가 움직일 때를 딱 짚어줄게", T: "돈은 아무 때나 움직이지 마. 쓸 달과 지킬 달을 나눠" },
    career: { F: "네 노력이 밖에서 보이기 좋은 때, 그냥 흘려보내지 말자", T: "지원·협상·이동은 타이밍 타. 좋은 달에 행동을 몰아" },
    love: { F: "마음 서두르지 않아도 돼. 인연 흐름이 열릴 때를 같이 보자", T: "애매한 인연에 시간 쓰지 말고 반응 볼 시기를 정해" },
    path: { F: "네 길을 확인하기 좋은 때가 와. 그때는 겁보다 경험 쪽으로 가자", T: "진로는 한 번에 뒤집지 말고 움직일 달에 실험해" },
    people: { F: "내 편은 남기고, 지치는 관계는 덜어내기 좋은 흐름이 있어", T: "사람 늘릴 때와 정리할 때를 구분해. 둘 다 동시에 하지 마" },
    mental: { F: "마음이 덜 흔들리는 리듬이 있어. 힘줄 때랑 쉴 때를 나눠보자", T: "계속 밀어붙이지 마. 회복을 잠글 시기도 일정이다" },
  };
  const actions = {
    money: "수입·가격·협상처럼 돈이 실제로 움직이는 행동 하나를 잡아",
    career: "지원·면담·포트폴리오 공개처럼 밖으로 보이는 행동 하나를 잡아",
    love: "새 만남이든 관계 확인이든 애매함을 줄이는 행동 하나를 잡아",
    path: "작은 프로젝트·체험·지원처럼 직접 해보는 행동 하나를 잡아",
    people: "새 인연을 넓히거나 오래 끌던 관계 기준을 정리해",
    mental: "일정을 줄이거나 회복 루틴을 고정해서 몸부터 안정시켜",
  };
  const action = actions[concernKey] || actions.money;
  function card(year, when, momentum) {
    const m = String(momentum || "");
    let fLine = `이때는 ${action}. 완벽하게 하려 하지 말고 한 번 움직여보는 게 좋아.`;
    let tLine = `${action}. 생각 더 늘리지 말고 행동 하나로 확인해.`;
    if (m.includes("방어")) {
      fLine = "이때는 크게 벌이기보다 네 체력과 기준부터 지켜. 쉬어가는 것도 흐름을 잘 쓰는 거야.";
      tLine = "이때는 확장 금지. 손실·과로·감정소모부터 막아.";
    } else if (m.includes("준비") || m.includes("유지")) {
      fLine = "이때는 결과를 급하게 만들기보다 준비를 다져두자. 다음 움직임이 훨씬 편해져.";
      tLine = "이때는 판 키우지 말고 준비·정리. 다음 실행을 위한 재료를 쌓아.";
    } else if (m.includes("선별")) {
      fLine = "기회가 와도 다 잡지 말고 네 마음이 진짜 가는 쪽만 골라. 선택을 줄이는 게 포인트야.";
      tLine = "다 하지 마. 조건 좋은 것 하나만 골라서 밀어.";
    }
    return `<div class="rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-3"><div class="flex items-center justify-between gap-2"><b class="text-slate-900">${year}</b><span class="text-[11px] font-black text-slate-700">${when || "흐름 확인"}</span></div><div class="mt-2 text-[12px] leading-relaxed text-slate-700">${isT ? tLine : fLine}</div></div>`;
  }
  const title = (titles[concernKey] || titles.money)[isT ? "T" : "F"];
  const intro = isT
    ? "날짜를 맞히는 게 목적이 아니라, 네 행동을 언제 몰아줄지 정하는 게 목적이야."
    : "운이 다 해준다는 얘기 아니야. 다만 같은 노력을 해도 덜 버겁게 움직일 때가 있으니까, 그때를 놓치지 말자는 거야.";
  return {
    badge: `2026-2027 ${concernLabel} 흐름`,
    title,
    desc: `<div class="mb-3 text-slate-700">${intro}</div><div class="space-y-2">${card("2026", timing.r1, timing.momentum1)}${card("2027", timing.r2, timing.momentum2)}</div>`,
    checklist: isT
      ? `${timing.r1} / ${timing.r2} 중 하나를 골라 실제 행동 하나를 캘린더에 넣기`
      : `${timing.r1} / ${timing.r2} 중 마음이 가는 시기에 해볼 행동 하나를 미리 적어두기`,
  };
}'''

s = replace_between(s, 'function buildNoteOneInsight', 'function buildNoteTwoPattern', helpers_and_note1)
s = replace_between(s, 'function buildNoteTwoPattern', 'function buildNoteThreeBlindSpot', note2)
s = replace_between(s, 'function buildNoteThreeBlindSpot', 'function buildNoteFourPrescription', note3)
s = replace_between(s, 'function buildNoteFourPrescription', 'function buildNoteFiveEnvironmentFilter', note4)
s = replace_between(s, 'function buildNoteFiveEnvironmentFilter', 'function buildNoteSixTiming', note5)
s = replace_between(s, 'function buildNoteSixTiming', 'function generateConcernNotes', note6)

# Remove explanatory UI copy that breaks immersion.
s = s.replace('''            <span id="pillarBasisTag" class="text-[10px] font-bold text-slate-500">한국 만세력 기준</span>\n''', '')
s = s.replace('''          <p class="text-[9.5px] font-semibold text-slate-400 leading-relaxed">\n            개수는 원국 겉글자 기준 · %는 지장간과 월령까지 반영한 실제 세력\n          </p>\n''', '')

# The basis-tag renderer is now dead UI; remove the whole visible-label block.
old_basis = '''        const basis = document.getElementById("pillarBasisTag");\n        if (basis) {\n          const correction = data?.calendarMeta?.hourCorrectionMinutes;\n          basis.textContent = data?.pillars?.hour && Number.isFinite(correction)\n            ? `한국 만세력 기준 · 시간 ${correction > 0 ? "+" : ""}${correction}분 보정`\n            : "한국 만세력 기준";\n        }\n'''
if old_basis in s:
    s = s.replace(old_basis, '', 1)

banned = [
    '언니가 잡은 사주 근거',
    '왜 이 처방이 너한테 맞나',
    '왜 이런 필터가 맞나',
    '타이밍 읽는 법',
    '개수는 원국 겉글자 기준',
    'id="pillarBasisTag"',
]
for phrase in banned:
    if phrase in s:
        raise SystemExit(f'banned visible phrase still present: {phrase}')

p.write_text(s, encoding='utf-8')
print('COPY_POLISH_PATCHED')
