from pathlib import Path

p = Path('index.html')
s = p.read_text(encoding='utf-8')

anchor = 'function getUnniCopyContext(data) {'
if anchor not in s:
    raise SystemExit('getUnniCopyContext anchor not found')
if 'function buildUnifiedSajuProfileV3(data, concernKey)' in s:
    raise SystemExit('unified profile already present')

helper = r'''function buildUnifiedSajuProfileV3(data, concernKey) {
  const profile = data?.analysisProfile || {};
  const dm = profile?.dayMaster || {};
  const structure = profile?.structure || data?.gyeokguk || {};
  const strength = data?.strengthDetail || profile?.strengthDetail || {};
  const elementProfiles = data?.elementProfiles || profile?.elementProfiles || {};
  const raw = elementProfiles?.raw || profile?.classical?.elements?.rawVisible || {};
  const influence = elementProfiles?.influence || profile?.classical?.elements?.influence || data?.elements || {};
  const yong = data?.yongshinDetail || profile?.yongshinDetail || profile?.classical?.yongshin || {};
  const sipsin = profile?.sipsin || {};
  const relations = profile?.relations || {};
  const stats = data?.stats || profile?.stats || {};
  const pillars = data?.pillars || {};
  const realYeonun = data?.realYeonun || profile?.timing?.yeonun || {};
  const classical = profile?.classical || {};
  const concern = concernKey || data?.concernKey || "money";
  const ELEMENTS = ["mok", "hwa", "to", "geum", "su"];

  const safe = (v, fallback = 0) => Number.isFinite(Number(v)) ? Number(v) : fallback;
  const elementHuman = {
    mok: { natural: "가능성을 넓히고 새 선택지를 만드는 것", action: "작게 시작해서 키우는 것", risk: "선택지를 계속 늘려 결정을 늦추는 것", env: "성장 여지가 있고 시도해볼 수 있는 곳" },
    hwa: { natural: "생각과 감정을 밖으로 드러내고 반응을 보는 것", action: "말과 행동으로 먼저 꺼내보는 것", risk: "반응에 과열돼 속도를 너무 올리는 것", env: "피드백이 빠르고 표현을 숨기지 않아도 되는 곳" },
    to: { natural: "익숙한 걸 지키고 생활에 안정적으로 굳히는 것", action: "루틴과 기록으로 꾸준히 굳히는 것", risk: "익숙하다는 이유만으로 오래 붙들고 있는 것", env: "역할과 일정이 예측 가능하고 기반이 안정적인 곳" },
    geum: { natural: "기준을 세우고 필요 없는 걸 잘라내는 것", action: "기준을 숫자와 말로 분명하게 세우는 것", risk: "기준을 너무 빡빡하게 만들어 스스로를 몰아붙이는 것", env: "룰과 평가 기준이 분명한 곳" },
    su: { natural: "정보를 읽고 여백을 두면서 다음 수를 보는 것", action: "정보와 생각할 여백을 먼저 확보하는 것", risk: "생각만 늘리고 실제 움직임을 늦추는 것", env: "혼자 정리할 시간과 유연성이 보장되는 곳" },
  };
  const tgHuman = {
    비견: "내 방식과 주도권을 지키고 싶은 마음",
    겁재: "비교와 경쟁에서 밀리고 싶지 않은 마음",
    식신: "내 페이스로 꾸준히 결과를 만들고 싶은 마음",
    상관: "답답한 틀을 깨고 내 방식대로 표현하고 싶은 마음",
    정재: "예측 가능한 안정과 확실한 내 몫을 챙기고 싶은 마음",
    편재: "기회와 흐름을 빨리 읽고 넓혀가고 싶은 마음",
    정관: "기준을 지키고 제대로 인정받고 싶은 마음",
    편관: "압박이 와도 밀리지 않고 버텨내고 싶은 마음",
    정인: "충분히 이해하고 안전하다는 확신을 얻고 싶은 마음",
    편인: "남들이 안 보는 가능성을 오래 탐색하고 싶은 마음",
    일간: "내 중심을 지키고 싶은 마음",
  };
  const tgRel = {
    비견: "서로 각자의 선택을 존중하는 관계",
    겁재: "비교하거나 경쟁시키지 않는 관계",
    식신: "재촉하지 않고 편하게 일상을 나눌 수 있는 관계",
    상관: "말을 눌러 막지 않고 솔직한 표현을 받아주는 관계",
    정재: "약속과 역할이 분명해서 불안하게 만들지 않는 관계",
    편재: "서로의 활동반경을 인정하면서도 연락과 약속은 지키는 관계",
    정관: "예의와 기준이 있으면서도 너를 평가대에만 올리지 않는 관계",
    편관: "긴장시키거나 몰아붙이지 않고 힘을 빼게 해주는 관계",
    정인: "설명하지 않아도 안심하고 기대도 되는 관계",
    편인: "조금 다른 생각과 리듬도 이상하다고 몰지 않는 관계",
  };
  const groupHuman = {
    self: "내 기준과 자존심을 지키려는 힘",
    print: "생각을 더 확인하고 안전해진 뒤 움직이려는 힘",
    output: "표현하고 결과를 만들어내려는 힘",
    wealth: "돈·성과·현실 결과를 챙기려는 힘",
    officer: "평가·책임·기준을 맞추려는 힘",
    unknown: "주변 상황을 통제하려는 힘",
  };

  const influenceSorted = ELEMENTS.map(key => ({ key, value: safe(influence?.[key]) }))
    .sort((a,b) => b.value - a.value || ELEMENTS.indexOf(a.key) - ELEMENTS.indexOf(b.key));
  const strongest = profile?.elements?.strongest?.key || influenceSorted[0]?.key || "to";
  const weakest = profile?.elements?.weakest?.key || influenceSorted[influenceSorted.length - 1]?.key || "su";
  const primary = yong?.primary || data?.yongshin || "to";
  const secondary = yong?.secondary || ELEMENTS.find(x => x !== primary) || "su";
  const avoid = yong?.avoid || strongest;

  const countEntries = Object.entries(sipsin?.count || {}).filter(([k,v]) => k !== "일간" && safe(v) > 0)
    .sort((a,b) => safe(b[1]) - safe(a[1]) || a[0].localeCompare(b[0], 'ko'));
  const dominantRaw = sipsin?.dominant;
  const dominant = typeof dominantRaw === "string" ? dominantRaw : (dominantRaw?.name || countEntries[0]?.[0] || "");
  const secondDominant = countEntries.find(([k]) => k !== dominant)?.[0] || "";
  const diversity = countEntries.length;

  const components = Array.isArray(strength?.components) ? strength.components : [];
  const groupTotals = components.reduce((acc, x) => {
    const g = x?.group || "unknown";
    acc[g] = safe(acc[g]) + safe(x?.amount);
    return acc;
  }, {});
  const pressureGroup = ["officer", "wealth", "output", "self", "print"]
    .sort((a,b) => safe(groupTotals[b]) - safe(groupTotals[a]))[0] || "unknown";
  const rootWeight = (Array.isArray(strength?.roots) ? strength.roots : []).reduce((sum, x) => sum + safe(x?.weight), 0);
  const supportRatio = safe(strength?.supportRatio, safe(dm?.supportRatio, 0.5));
  const strengthVerdict = strength?.verdict || dm?.strength || "중화";
  const monthGroup = strength?.monthCommand?.relation || "unknown";

  const socialTg = pillars?.year?.sipsin?.gan || "";
  const workTg = pillars?.month?.sipsin?.gan || "";
  const closeTg = pillars?.day?.sipsin?.zhi || "";
  const privateTg = pillars?.hour?.sipsin?.gan || pillars?.hour?.sipsin?.zhi || "";
  const hasClash = !!relations?.hasChung;

  const branchTypeLine = ({
    왕지: "한번 잡힌 반응이 선명하고 오래 가는 편",
    생지: "시작하거나 방향을 바꿀 때 반응이 특히 빨라지는 편",
    고지: "쉽게 버리기보다 오래 쌓아두고 버티는 편",
  })[structure?.branchType] || "상황에 맞춰 반응 방식이 꽤 달라지는 편";
  const outwardLine = structure?.touchul
    ? "속 기준이 겉행동으로 비교적 빨리 드러나는 편"
    : "겉으로는 티를 덜 내도 속 기준은 생각보다 분명한 편";
  const commandAligned = !!structure?.saryeongGan && !!structure?.basisGan && structure.saryeongGan === structure.basisGan;
  const mixedStructure = (Array.isArray(structure?.candidates) ? structure.candidates.length : 0) > 1;
  const structureTexture = commandAligned
    ? "평소 선택의 중심축이 비교적 한 방향으로 모이는 편"
    : mixedStructure
      ? "상황에 따라 서로 다른 두 반응이 번갈아 나오는 편"
      : "한 가지 성향만으로 단정하기보다 상황 영향도 같이 보는 편";

  const strengthLineF = strengthVerdict === "신강"
    ? "기본 버티는 힘은 있는 편이라 힘들수록 더 해내려는 쪽으로 가기 쉬워"
    : strengthVerdict === "신약"
      ? "주변 분위기와 요구를 빨리 읽는 만큼 네 페이스가 뒤로 밀릴 때가 있어"
      : "버틸 때와 내려놓을 때를 꽤 잘 아는데, 애매해지면 판단을 오래 붙들 수 있어";
  const strengthLineT = strengthVerdict === "신강"
    ? "버티는 힘은 충분해. 문제는 멈춤 기준이 늦는 것"
    : strengthVerdict === "신약"
      ? "주변 변수 반영 속도가 빠르다. 그래서 네 기준을 먼저 고정해야 해"
      : "균형은 괜찮다. 애매할 때 결정을 미루는 게 변수다";
  const rootLine = rootWeight >= 1.2
    ? "속에서 다시 중심을 잡아주는 버팀목은 있는 편"
    : "한번 흔들리면 혼자 중심을 복구하는 데 시간이 더 필요한 편";
  const clashLine = hasClash
    ? "게다가 마음 안에서 서로 반대 방향이 동시에 당기는 순간이 있어서, 참다가 갑자기 확 바꾸는 선택은 조심하는 게 좋아"
    : "큰 방향 충돌보다 한 패턴을 오래 반복하는 쪽을 더 조심하면 돼";

  const structureStatus = structure?.status || data?.gyeokStatus?.status || "평격";
  const statusLine = ({
    성격: "네 방식과 환경이 맞으면 장점이 결과로 연결되는 속도가 빠른 편",
    성중유패: "잘하는 방식이 분명한데 한 가지 걸림이 같이 붙으면 소모가 확 커지는 편",
    파격: "정석대로 더 버티기보다 환경이나 방식을 바꿨을 때 풀리는 경우가 많은 편",
    평격: "한 가지 공식보다 사람·환경·습관에 따라 결과 차이가 크게 나는 편",
  })[structureStatus] || "한 가지 공식보다 환경과 습관의 영향을 같이 보는 편";
  const flowEnv = ({
    순용: "기준과 순서가 분명하고 차근히 쌓을 수 있는 환경",
    역용: "압박을 그대로 떠안지 않고 조절할 장치가 있는 환경",
    복합: "한쪽 방식만 강요하지 않고 상황에 맞게 조절할 수 있는 환경",
  })[structure?.flow] || "역할과 경계가 말로 확인되는 환경";
  const sangsinLine = structure?.sangsin
    ? "네 장점을 살려주는 조건이 실제로 겉에 잡혀 있어서, 맞는 판에 들어가면 힘을 덜 쓰고도 잘 굴러갈 수 있어"
    : "장점을 자동으로 살려주는 조건이 늘 깔려 있는 건 아니라서, 환경을 고르는 게 더 중요해";
  const gisinLine = structure?.gisin
    ? "반대로 한 가지 걸림이 같이 드러나 있으니, 그 패턴이 시작되면 빨리 끊는 게 중요해"
    : "특정 한 가지 걸림보다 오래 참다가 기준이 흐려지는 쪽을 더 경계하면 돼";

  const statPairs = [["wealth", safe(stats?.wealth, 50)], ["mental", safe(stats?.mental, 50)], ["drive", safe(stats?.drive, 50)], ["network", safe(stats?.network, 50)]];
  statPairs.sort((a,b) => a[1] - b[1]);
  const weakAxis = statPairs[0]?.[0] || "mental";
  const weakAxisHuman = ({
    wealth: "손익과 내 몫을 숫자로 확인하는 부분",
    mental: "회복 시간을 먼저 확보하는 부분",
    drive: "생각을 첫 행동으로 옮기는 속도",
    network: "도움 요청과 관계의 역할을 분명히 하는 부분",
  })[weakAxis];

  const climateReasons = Array.isArray(yong?.climateReasons) ? yong.climateReasons : [];
  const climateDirection = classical?.qiongtong?.direction || "";
  let climateLine = "지금은 무작정 속도를 올리기보다 균형을 깨지 않는 방식이 더 잘 맞아";
  const climateText = climateReasons.join(" ") + " " + climateDirection;
  if (/겨울|한기/.test(climateText)) climateLine = "생각 속에 오래 머무르기보다 몸을 움직이고 표현을 밖으로 꺼낼수록 흐름이 살아나는 편이야";
  else if (/여름|열기|건조/.test(climateText)) climateLine = "속도를 계속 올리는 것보다 쉬는 간격과 여백을 먼저 넣어야 판단이 맑아지는 편이야";
  else if (/습기/.test(climateText)) climateLine = "머뭇거림이 길어질수록 답답해지니 작게라도 밖으로 움직이는 게 균형을 잡아줘";

  const bridgeLine = yong?.bridge
    ? `서로 잡아당기는 두 방향 사이에서는 ${elementHuman[primary]?.action || "한 번에 하나씩 움직이는 것"}이 중간다리 역할을 해`
    : `한 번에 여러 방향을 고치기보다 ${elementHuman[primary]?.action || "한 가지 기준을 세우는 것"}부터 넣는 게 효율적이야`;

  const annual26 = realYeonun?.y2026?.seyunGanSipsin || "";
  const annual27 = realYeonun?.y2027?.seyunGanSipsin || "";
  const annualHuman = (tg) => tgHuman[tg] || "기존 방식을 점검하고 새 기준을 세우는 흐름";
  const monthCount26 = Array.isArray(realYeonun?.y2026?.wolun) ? realYeonun.y2026.wolun.length : 0;
  const monthCount27 = Array.isArray(realYeonun?.y2027?.wolun) ? realYeonun.y2027.wolun.length : 0;

  const focusF = {
    money: "돈 문제에서는 감정이 올라온 순간보다 내 기준이 풀리는 순간을 먼저 잡는 게 중요해",
    career: "커리어에서는 더 준비하는 것보다 이미 가진 걸 밖에서 보이게 만드는 순간을 놓치지 않는 게 중요해",
    love: "연애에서는 상대 마음을 더 읽기보다 네가 원하는 관계 기준을 늦지 않게 꺼내는 게 중요해",
    path: "진로에서는 확신을 기다리는 것보다 실제 경험을 하나씩 쌓아 내 반응을 확인하는 게 중요해",
    people: "관계에서는 좋은 사람으로 남는 것보다 불편함을 초기에 말하는 게 너를 지켜줘",
    mental: "마음 문제에서는 더 버티는 힘보다 회복 시간을 먼저 잠그는 게 훨씬 중요해",
  };
  const focusT = {
    money: "돈은 감정이 아니라 기준이 풀리는 순간을 차단해야 한다",
    career: "커리어는 준비량보다 외부에 보인 결과물 수를 늘려야 한다",
    love: "연애는 해석량을 줄이고 확인 횟수를 늘려야 한다",
    path: "진로는 생각보다 실험 데이터가 부족한 게 문제다",
    people: "관계는 참는 시간보다 경계선을 꺼내는 속도가 중요하다",
    mental: "회복을 일정으로 잡지 않으면 버티는 힘이 오히려 독이 된다",
  };

  const closeNeed = tgRel[closeTg] || tgRel[dominant] || "말과 행동이 일치하고 경계를 존중하는 관계";
  const socialPrivateGap = socialTg && privateTg && socialTg !== privateTg
    ? "밖에서 보이는 모습과 혼자 있을 때 쓰는 방식이 꽤 달라서, 사람들은 네 피로를 늦게 알아차릴 수 있어"
    : "밖에서 보이는 모습과 속마음의 방향이 크게 다르진 않은 편이라, 기준을 말로만 분명히 해도 오해가 많이 줄어";
  const workPressure = tgHuman[workTg] || groupHuman[monthGroup] || "책임을 제대로 해내고 싶은 마음";

  const note1 = {
    F: `${outwardLine}이고 ${branchTypeLine}이야. ${tgHuman[dominant] || "내 기준을 지키고 싶은 마음"}이 중심에 있고, ${secondDominant ? `${tgHuman[secondDominant]}도 같이 있어서 ` : ""}${diversity >= 5 ? "한 가지 모습으로만 설명되는 사람은 아니야. " : ""}${strengthLineF}. ${socialPrivateGap}.`,
    T: `${outwardLine}. ${branchTypeLine}. 핵심 동기는 ${tgHuman[dominant] || "내 기준을 지키는 것"}. ${secondDominant ? `두 번째 축은 ${tgHuman[secondDominant]}. ` : ""}${strengthLineT}. ${structureTexture}.`,
  };
  const note2 = {
    F: `네 패턴이 세지는 순간엔 ${groupHuman[pressureGroup] || groupHuman.unknown}이 한꺼번에 커져. 특히 평소 일상에서는 ${workPressure}이 먼저 작동하는 편이야. ${rootLine}이지만, ${clashLine}.`,
    T: `반복 패턴의 압력원은 ${groupHuman[pressureGroup] || groupHuman.unknown}. 평소 작동축은 ${workPressure}. ${rootLine}. ${hasClash ? "반대 방향이 동시에 당길 때 급전환하지 말 것." : "같은 패턴을 오래 끌지 말 것."}`,
  };
  const note3 = {
    F: `너한테 제일 익숙한 방식은 ${elementHuman[strongest]?.natural || "익숙한 방법을 오래 쓰는 것"} 쪽이야. 그런데 의식하지 않으면 ${elementHuman[weakest]?.natural || "다른 선택지를 쓰는 것"}은 뒤로 밀리고, 균형을 되찾을 때는 ${elementHuman[primary]?.action || "한 가지를 작게 바꾸는 것"}이 더 중요해. ${avoid === strongest ? "잘하는 방식을 더 세게 쓰는 게 항상 답은 아니야." : "익숙한 방식과 필요한 방식이 완전히 같은 건 아니야."} ${bridgeLine}.`,
    T: `자동으로 나오는 방식은 ${elementHuman[strongest]?.natural || "익숙한 방법 유지"}. 제일 늦게 쓰는 방식은 ${elementHuman[weakest]?.natural || "다른 방식 전환"}. 보완축은 ${elementHuman[primary]?.action || "한 변수씩 바꾸는 것"}. ${avoid === strongest ? "강점 과사용이 누수 포인트다." : "익숙함과 필요한 처방을 구분해."} ${bridgeLine}.`,
  };
  const paceF = strengthVerdict === "신강" ? "새로 더 얹기보다 멈출 기준을 먼저 정해두자" : strengthVerdict === "신약" ? "한 번에 크게 바꾸지 말고 작게 반복해서 네 편으로 만들자" : "한 번에 하나만 바꾸고 네 반응을 확인하면서 가자";
  const paceT = strengthVerdict === "신강" ? "추가 행동보다 중단 기준부터 정해" : strengthVerdict === "신약" ? "행동 단위를 작게 쪼개서 반복해" : "변수 하나씩 바꾸고 결과를 확인해";
  const note4 = {
    F: `이번 처방의 중심은 ${elementHuman[primary]?.action || "작은 행동 하나를 반복하는 것"}이고, 옆에서 ${elementHuman[secondary]?.action || "기준을 유지하는 것"}이 받쳐주면 좋아. 특히 ${weakAxisHuman}은 일부러 챙겨야 해. ${paceF}. ${climateLine}.`,
    T: `1순위는 ${elementHuman[primary]?.action || "행동 하나 고정"}, 2순위는 ${elementHuman[secondary]?.action || "기준 유지"}. 취약한 건 ${weakAxisHuman}. ${paceT}. ${climateLine}.`,
  };
  const note5 = {
    F: `가까운 관계에서 네가 편해지려면 ${closeNeed}이 필요해. ${statusLine}. 그래서 ${flowEnv}에서 네 장점이 훨씬 덜 소모돼. ${sangsinLine} ${gisinLine}`,
    T: `관계 기준은 ${closeNeed}. ${statusLine}. 맞는 환경은 ${flowEnv}. ${structure?.gisin ? "걸림 패턴이 보이면 초기에 차단해." : "문제 생길 때까지 참지 말고 초기에 기준을 말해."}`,
  };
  const timingFocusF = {
    money: "돈은 기회가 보여도 바로 키우기보다, 지킬 기준이 선 뒤에 움직이자",
    career: "보여주고 요구해야 하는 달에는 결과물을 밖으로 꺼내고, 압박이 큰 달엔 준비보다 범위를 줄이자",
    love: "마음이 커지는 달일수록 상대 반응만 보지 말고 관계 기준도 같이 확인하자",
    path: "움직임이 붙는 달에는 작은 실험을 하고, 생각이 많아지는 달에는 선택지를 줄이자",
    people: "사람이 늘어나는 흐름에는 연결을 만들고, 피로가 커지는 흐름에는 관계 수보다 경계를 챙기자",
    mental: "밀어붙이는 흐름과 쉬어야 하는 흐름을 같은 방식으로 보내지 않는 게 핵심이야",
  };
  const timingFocusT = {
    money: "기회 달과 방어 달을 같은 지출 규칙으로 보내지 마",
    career: "외부 노출이 붙는 달엔 실행, 압박이 큰 달엔 범위 축소",
    love: "관계 흐름이 커질수록 확인 질문을 늘리고 추측은 줄여",
    path: "실험할 달엔 실행량을 올리고 생각이 과해지는 달엔 선택지를 줄여",
    people: "연결이 늘 때는 선별하고, 피로가 늘 때는 경계를 강화해",
    mental: "가속 구간과 회복 구간을 같은 일정으로 운영하지 마",
  };
  const note6 = {
    F: `2026년에는 ${annualHuman(annual26)}이 더 도드라지고, 2027년에는 ${annualHuman(annual27)}이 앞에 나와. ${timingFocusF[concern] || timingFocusF.money}. 월별 흐름도 ${monthCount26 + monthCount27}구간을 따로 보고 있으니까 한 해를 통째로 좋다·나쁘다로 보진 않을게.`,
    T: `2026 핵심=${annualHuman(annual26)}. 2027 핵심=${annualHuman(annual27)}. ${timingFocusT[concern] || timingFocusT.money}. 월별 ${monthCount26 + monthCount27}구간을 따로 본다.`,
  };

  const coverage = {
    pillars: !!pillars?.year && !!pillars?.month && !!pillars?.day,
    elementRaw: ELEMENTS.every(k => Number.isFinite(Number(raw?.[k]))),
    elementInfluence: ELEMENTS.every(k => Number.isFinite(Number(influence?.[k]))),
    strength: !!strengthVerdict && Number.isFinite(supportRatio) && Number.isFinite(safe(strength?.supportForce)) && Number.isFinite(safe(strength?.drainForce)) && Array.isArray(strength?.roots) && Array.isArray(strength?.components) && !!strength?.monthCommand,
    sipsin: Array.isArray(sipsin?.all) && !!sipsin?.count && !!dominant,
    structure: !!structure?.gyeokName && "status" in structure && "flow" in structure && "touchul" in structure && Array.isArray(structure?.candidates),
    yongshin: !!primary && !!secondary && !!avoid && !!yong?.scores && !!yong?.detail && Array.isArray(yong?.climateReasons),
    classical: !!classical?.japyeong && !!classical?.jeokcheon && !!classical?.qiongtong && !!classical?.yongshin && !!classical?.elements,
    relations: Object.prototype.hasOwnProperty.call(relations, "hasChung"),
    stats: ["wealth","mental","drive","network"].every(k => Number.isFinite(Number(stats?.[k]))),
    timing: !!realYeonun?.y2026 && !!realYeonun?.y2027 && Array.isArray(realYeonun?.y2026?.wolun) && Array.isArray(realYeonun?.y2027?.wolun),
  };
  const coverageRate = Object.values(coverage).filter(Boolean).length / Object.keys(coverage).length;
  const fingerprint = [
    dm?.gan, dm?.element, strengthVerdict, Math.round(supportRatio * 100), strongest, weakest,
    dominant, secondDominant, structure?.gyeokName, structureStatus, structure?.flow,
    structure?.branchType, structure?.touchul ? "out" : "in", primary, secondary, avoid,
    hasClash ? "clash" : "steady", weakAxis, annual26, annual27, closeTg, workTg,
  ].join("|");

  return {
    fingerprint,
    coverage,
    coverageRate,
    signals: {
      strongest, weakest, primary, secondary, avoid, dominant, secondDominant,
      pressureGroup, monthGroup, rootWeight: Math.round(rootWeight * 100) / 100,
      supportRatio, structureStatus, weakAxis, hasClash, annual26, annual27,
    },
    note1, note2, note3, note4, note5, note6,
    focus: { F: focusF[concern] || focusF.money, T: focusT[concern] || focusT.money },
  };
}

'''

s = s.replace(anchor, helper + anchor, 1)

old = 'const ctx = getUnniCopyContext(data);\n  const copy = {'
new = 'const ctx = getUnniCopyContext(data);\n  const unified = buildUnifiedSajuProfileV3(data, concernKey);\n  const copy = {'
count = s.count(old)
if count != 5:
    raise SystemExit(f'expected 5 NOTE1-5 ctx anchors, found {count}')
s = s.replace(old, new)

repls = {
    'desc: `${note.body}<br><br>${personal}`,': 'desc: `${note.body}<br><br>${personal}<br><br>${unified.note1[isT ? "T" : "F"]}<br><br>${unified.focus[isT ? "T" : "F"]}`,',
    'desc: `<b>시작</b> — ${p.trigger}.<br><br><b>네가 바로 하는 반응</b> — ${p.reaction}.<br><br><b>결국 남는 것</b> — ${p.cost}.<br><br>${strengthLine} 그래서 끊을 지점은 감정이 아니라 행동 순서야.`,': 'desc: `<b>시작</b> — ${p.trigger}.<br><br><b>네가 바로 하는 반응</b> — ${p.reaction}.<br><br><b>결국 남는 것</b> — ${p.cost}.<br><br>${strengthLine} 그래서 끊을 지점은 감정이 아니라 행동 순서야.<br><br>${unified.note2.T}`,',
    'desc: `언니가 네 흐름을 보면 시작은 보통 <b>${p.trigger}</b>이야. 그때 ${p.reaction}. 그러고 나면 결국 ${p.cost}.<br><br>${strengthLine}. 그러니까 또 반복됐다고 너 자신부터 뭐라 하지 마. 대신 딱 한 군데만 바꾸자.`,': 'desc: `언니가 네 흐름을 보면 시작은 보통 <b>${p.trigger}</b>이야. 그때 ${p.reaction}. 그러고 나면 결국 ${p.cost}.<br><br>${strengthLine}. 그러니까 또 반복됐다고 너 자신부터 뭐라 하지 마. 대신 딱 한 군데만 바꾸자.<br><br>${unified.note2.F}`,',
    'desc: `<b>네가 문제라고 본 것:</b> ${p.assumed}.<br><br><b>실제로 새는 곳:</b> ${p.actual}.<br><br>특히 네가 놓치기 쉬운 건 <b>${personal}</b> 쪽이야. 원인 잘못 잡고 더 열심히 하지 마.`,': 'desc: `<b>네가 문제라고 본 것:</b> ${p.assumed}.<br><br><b>실제로 새는 곳:</b> ${p.actual}.<br><br>특히 네가 놓치기 쉬운 건 <b>${personal}</b> 쪽이야. 원인 잘못 잡고 더 열심히 하지 마.<br><br>${unified.note3.T}`,',
    'desc: `너는 자꾸 <b>${p.assumed}</b>고 생각했을 수 있어. 근데 언니가 보기엔 진짜 새는 곳은 <b>${p.actual}</b> 쪽에 더 가까워.<br><br>그리고 네가 유독 놓치기 쉬운 건 <b>${personal}</b>이야. 그러니까 괜히 네 능력이나 매력부터 의심하지 않았으면 좋겠어.`,': 'desc: `너는 자꾸 <b>${p.assumed}</b>고 생각했을 수 있어. 근데 언니가 보기엔 진짜 새는 곳은 <b>${p.actual}</b> 쪽에 더 가까워.<br><br>그리고 네가 유독 놓치기 쉬운 건 <b>${personal}</b>이야. 그러니까 괜히 네 능력이나 매력부터 의심하지 않았으면 좋겠어.<br><br>${unified.note3.F}`,',
    'desc: `<b>1.</b> ${steps[0]}.<br><br><b>2.</b> ${steps[1]}.<br><br><b>3.</b> ${steps[2]}.<br><br>${last}`,': 'desc: `<b>1.</b> ${steps[0]}.<br><br><b>2.</b> ${steps[1]}.<br><br><b>3.</b> ${steps[2]}.<br><br>${last}<br><br>${unified.note4.T}`,',
    'desc: `첫째, <b>${steps[0]}</b>.<br><br>둘째, <b>${steps[1]}</b>.<br><br>셋째, <b>${steps[2]}</b>.<br><br>${last} 너 지금까지 충분히 애썼으니까 이번엔 ‘더 열심히’ 말고 ‘덜 소모되게’ 가보자.`,': 'desc: `첫째, <b>${steps[0]}</b>.<br><br>둘째, <b>${steps[1]}</b>.<br><br>셋째, <b>${steps[2]}</b>.<br><br>${last} 너 지금까지 충분히 애썼으니까 이번엔 ‘더 열심히’ 말고 ‘덜 소모되게’ 가보자.<br><br>${unified.note4.F}`,',
    'desc: `<b>남길 사람</b><br>${p.keep}.<br><br><b>거리 둘 사람</b><br>${p.cut}.<br><br><b>잘 맞는 환경</b><br>${p.place}.<br><br>${relationPersonal}<br><br>${extra}`,': 'desc: `<b>남길 사람</b><br>${p.keep}.<br><br><b>거리 둘 사람</b><br>${p.cut}.<br><br><b>잘 맞는 환경</b><br>${p.place}.<br><br>${relationPersonal}<br><br>${extra}<br><br>${unified.note5.T}`,',
    'desc: `<b>곁에 둘 사람</b><br>${p.keep}.<br><br><b>조금 멀리해도 되는 사람</b><br>${p.cut}.<br><br><b>네가 숨 쉬기 편한 곳</b><br>${p.place}.<br><br>${relationPersonal}<br><br>${extra} 사람 때문에 힘들 때마다 네가 더 잘하면 된다고 생각하지 않았으면 좋겠어.`,': 'desc: `<b>곁에 둘 사람</b><br>${p.keep}.<br><br><b>조금 멀리해도 되는 사람</b><br>${p.cut}.<br><br><b>네가 숨 쉬기 편한 곳</b><br>${p.place}.<br><br>${relationPersonal}<br><br>${extra} 사람 때문에 힘들 때마다 네가 더 잘하면 된다고 생각하지 않았으면 좋겠어.<br><br>${unified.note5.F}`,',
}
for old_text, new_text in repls.items():
    if old_text not in s:
        raise SystemExit('missing expected NOTE replacement: ' + old_text[:80])
    s = s.replace(old_text, new_text, 1)

old6 = 'function buildNoteSixTiming(data, concernKey, concernLabel, isT) {\n  const timing = getTrueBaziTiming('
new6 = 'function buildNoteSixTiming(data, concernKey, concernLabel, isT) {\n  const unified = buildUnifiedSajuProfileV3(data, concernKey);\n  const timing = getTrueBaziTiming('
if old6 not in s:
    raise SystemExit('NOTE6 function anchor missing')
s = s.replace(old6, new6, 1)

old6desc = 'desc: `<div class="mb-3 text-slate-700">${intro}</div><div class="space-y-2">${card("2026", timing.r1, timing.momentum1)}${card("2027", timing.r2, timing.momentum2)}</div>`,'
new6desc = 'desc: `<div class="mb-3 text-slate-700">${intro}</div><div class="space-y-2">${card("2026", timing.r1, timing.momentum1)}${card("2027", timing.r2, timing.momentum2)}</div><div class="mt-3 text-slate-700">${unified.note6[isT ? "T" : "F"]}</div>`,'
if old6desc not in s:
    raise SystemExit('NOTE6 desc anchor missing')
s = s.replace(old6desc, new6desc, 1)

p.write_text(s, encoding='utf-8')
print('UNIFIED_SAJU_V3_PATCHED')
