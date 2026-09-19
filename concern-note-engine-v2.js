(function (global) {
  "use strict";

  const VERSION = "2.0.0";
  const CONCERNS = ["money","career","love","path","people","mental"];

  const SITUATIONS = {
    money: {
      saving:{ label:"돈이 잘 안 모여", scene:"돈을 써도 되는지 말아야 하는지 흔들리는 순간", object:"지출과 저축", move:"돈이 새는 장면 하나를 잡아 기준을 고정하기", avoid:"수입 전체를 탓하며 무작정 아끼기" },
      income:{ label:"수입을 더 늘리고 싶어", scene:"내가 한 일의 값이나 보상을 요구해야 하는 순간", object:"수입과 보상", move:"성과 하나를 실제 가격·연봉·조건으로 바꿔 말하기", avoid:"더 잘하면 알아주겠지 하고 요구를 미루기" },
      side:{ label:"부업·새 수입을 만들고 싶어", scene:"새 아이디어를 실제 돈으로 시험해야 하는 순간", object:"새 수입원", move:"작은 제안 하나에 가격을 붙여 실제 반응 보기", avoid:"준비와 아이디어만 키우고 첫 판매를 늦추기" },
      flow:{ label:"앞으로 돈 흐름이 궁금해", scene:"돈이 움직일 시기를 기다리면서 무엇을 할지 정해야 하는 순간", object:"앞으로의 돈 흐름", move:"좋은 구간에 할 돈 행동 하나를 미리 정하기", avoid:"운이 좋아지기만 기다리며 행동을 비워두기" },
    },
    career: {
      exam:{ label:"시험·합격이 궁금해", scene:"점수와 합격 가능성을 확인받는 순간", object:"시험과 합격", move:"실전 점수와 오답 패턴으로 공부법 하나만 남기기", avoid:"불안할수록 자료와 계획을 계속 갈아엎기" },
      jobsearch:{ label:"취업이 잘 될지 궁금해", scene:"내 실력을 밖에 보여주고 평가받아야 하는 순간", object:"취업과 지원", move:"지원·포트폴리오·면접 중 하나를 실제 외부 반응으로 바꾸기", avoid:"준비가 덜 됐다는 이유로 지원 자체를 늦추기" },
      move:{ label:"이직·퇴사가 고민돼", scene:"지금 자리를 버틸지 옮길지 결론내야 하는 순간", object:"이직과 퇴사", move:"감정과 조건을 분리해 옮길 기준 세 가지를 적기", avoid:"힘든 날의 감정 하나로 바로 결론내리거나 계속 참기" },
      current:{ label:"지금 직장이 너무 답답해", scene:"일은 계속하는데 보상·역할·사람 중 하나가 답답하게 쌓이는 순간", object:"현재 직장", move:"역할·보상·업무량 중 바꿀 수 있는 한 가지를 직접 말하기", avoid:"회사 전체가 문제라고 뭉뚱그리며 내 기준을 말하지 않기" },
    },
    love: {
      crush:{ label:"썸·짝사랑 중이야", scene:"상대 반응이 애매해서 마음을 확인하고 싶은 순간", object:"썸과 상대 마음", move:"추측 하나를 질문이나 만남 같은 실제 반응으로 바꾸기", avoid:"신호를 오래 해석하면서 내 표현은 줄이기" },
      relationship:{ label:"지금 연애 중이야", scene:"연락·표현·약속에서 작은 서운함이 생기는 순간", object:"현재 연애", move:"서운한 장면 하나를 감정이 커지기 전에 짧게 말하기", avoid:"괜찮은 척 넘기다가 한 번에 관계 전체를 문제 삼기" },
      breakup:{ label:"이별·재회가 궁금해", scene:"헤어진 이유와 다시 만날 가능성을 계속 생각하게 되는 순간", object:"이별과 재회", move:"그 사람의 말보다 헤어진 원인이 실제로 바뀌었는지 확인하기", avoid:"그리움만으로 관계가 달라졌다고 판단하기" },
      new:{ label:"새 인연이 들어올까", scene:"새 사람을 만나도 마음을 열지 말지 재는 순간", object:"새 인연", move:"조건보다 실제로 편안하고 일관된 반응인지 두세 번 확인하기", avoid:"첫인상 하나로 너무 빨리 기대하거나 닫아버리기" },
    },
    path: {
      lost:{ label:"뭘 해야 할지 모르겠어", scene:"선택지는 있는데 어느 쪽이 내 길인지 확신이 안 드는 순간", object:"진로 선택", move:"가장 궁금한 선택지 하나를 짧은 실제 경험으로 바꾸기", avoid:"생각만 더 하면 정답이 나올 거라 믿고 경험을 미루기" },
      current:{ label:"지금 길이 나한테 맞나", scene:"하고 있는 일이 맞는지 계속 의심되는 순간", object:"현재 진로", move:"지금 일에서 잘되는 부분과 소모되는 부분을 따로 기록하기", avoid:"힘든 날 하나로 적성 전체를 부정하기" },
      switch:{ label:"아예 다른 길로 갈까", scene:"기존 경력을 버리고 새 방향으로 틀고 싶은 순간", object:"진로 전향", move:"완전 전환 전에 새 방향을 작게 병행해 반응 보기", avoid:"답답함을 없애려고 준비 없이 판을 통째로 바꾸기" },
      strength:{ label:"내 적성·강점이 궁금해", scene:"내가 뭘 잘하는지 한마디로 정리하고 싶은 순간", object:"적성과 강점", move:"잘하는 방식이 반복해서 나타난 장면 세 개를 모으기", avoid:"직업명 하나로 적성을 너무 빨리 고정하기" },
    },
    people: {
      friend:{ label:"친구·지인이 힘들어", scene:"친한 사이인데 불편함을 말할지 참을지 고민되는 순간", object:"친구 관계", move:"작은 경계 하나를 말하고 상대 반응 보기", avoid:"오래 본 사이라는 이유로 불편함을 계속 무시하기" },
      work:{ label:"직장 인간관계가 힘들어", scene:"일 때문에 계속 봐야 하는 사람에게 선을 세워야 하는 순간", object:"직장 관계", move:"감정 대신 역할·업무·연락 기준을 문장으로 정하기", avoid:"좋게 보이려다 내 업무와 감정까지 떠맡기" },
      family:{ label:"가족 때문에 힘들어", scene:"가족이라서 거절하기 어렵고 감정이 오래 남는 순간", object:"가족 관계", move:"바꿀 수 없는 사람보다 내가 허용할 범위를 먼저 정하기", avoid:"가족이니까 이해해야 한다며 내 한계를 지우기" },
      distance:{ label:"누군가와 거리두고 싶어", scene:"관계를 끊어야 할지 조금 멀어져야 할지 재는 순간", object:"거리두기", move:"연락·만남·도움 중 하나부터 줄여 내 반응 확인하기", avoid:"참다가 어느 날 설명 없이 전부 끊어버리기" },
    },
    mental: {
      burnout:{ label:"번아웃 온 것 같아", scene:"해야 할 건 많은데 몸과 마음이 더는 따라오지 않는 순간", object:"번아웃", move:"해야 할 일을 늘리기 전에 부하 하나를 실제로 덜어내기", avoid:"의지로 버티면 회복될 거라 생각해 계속 밀기" },
      overthink:{ label:"생각이 너무 많아", scene:"같은 생각을 반복하면서 결론은 더 안 나는 순간", object:"생각 과다", move:"생각거리 하나를 행동·보류·내 일이 아님으로 나누기", avoid:"답이 나올 때까지 머릿속에서 계속 시뮬레이션하기" },
      low:{ label:"아무것도 하기 싫어", scene:"해야 하는 걸 알아도 몸이 먼저 멈추는 순간", object:"무기력", move:"성과가 아니라 생활 리듬 하나부터 다시 고정하기", avoid:"예전 속도를 기준으로 지금의 나를 몰아붙이기" },
      recover:{ label:"다시 괜찮아지고 싶어", scene:"조금 나아졌지만 예전처럼 움직여도 될지 불안한 순간", object:"회복", move:"괜찮았던 수면·식사·움직임 하나를 반복 일정으로 만들기", avoid:"컨디션이 하루 좋아졌다고 활동량을 한꺼번에 올리기" },
    },
  };

  const CLUSTER_LABEL = {
    boundary:"내 기준과 경계",
    comparison:"비교와 경쟁",
    stability:"안정과 예측",
    expression:"표현과 직진",
    expansion:"기회와 확장",
    responsibility:"책임과 버팀",
    analysis:"생각과 해석",
    intensity:"밀어붙이는 힘",
    sensitivity:"주변 반응 민감도",
    reversal:"참다가 크게 바꾸는 반응",
    mismatch:"겉모습과 실제 소모의 차이",
  };

  const GOD_CLUSTER = {
    "비견":"boundary", "겁재":"comparison", "식신":"stability", "상관":"expression",
    "정재":"stability", "편재":"expansion", "정관":"responsibility", "편관":"intensity",
    "정인":"analysis", "편인":"analysis",
  };

  const CLUSTER_COPY = {
    boundary:{
      money:"돈에서는 남이 정한 기준보다 네가 납득한 기준이 있어야 오래 지켜. 기준이 없으면 그날 기분이나 주변 분위기에 흔들릴 수 있어.",
      career:"일에서는 역할과 기준이 अस्पष्ट할수록 스트레스가 커지고, 네 방식이 존중될 때 성과가 훨씬 안정적으로 나와.",
      love:"연애에서는 좋아하는 마음보다도 ‘이 관계에서 내가 존중받고 있나’가 무너지면 정이 빠르게 식을 수 있어.",
      path:"진로에서는 남이 좋다는 길보다 네가 왜 이걸 하는지 납득돼야 오래 밀 수 있어.",
      people:"관계에서는 불편함 자체보다 네 선을 계속 무시당할 때 마음이 닫히는 쪽이야.",
      mental:"회복할 때도 남이 정한 속도보다 네 리듬을 되찾아야 마음이 안정돼.",
    },
    comparison:{
      money:"돈에서는 남과 비교되는 순간 평소 기준보다 더 쓰거나 더 벌어야 한다는 압박이 붙기 쉬워.",
      career:"평가·합격·연봉처럼 순위가 보이는 순간 평소보다 무리해서라도 밀어붙이려는 반응이 커질 수 있어.",
      love:"연애에서는 다른 커플이나 상대의 과거와 비교가 붙는 순간 네 마음이 갑자기 바빠질 수 있어.",
      path:"진로에서는 또래 속도가 눈에 들어오면 원래 고민보다 ‘나만 늦은 건가’가 더 큰 문제가 되기 쉬워.",
      people:"관계에서는 누가 더 인정받고 가까운지가 보이면 평소보다 신경을 많이 쓰는 편이야.",
      mental:"마음이 지칠 때도 내 상태보다 남들이 얼마나 해내는지를 보면 회복이 더 늦어질 수 있어.",
    },
    stability:{
      money:"돈에서는 큰 한 방보다 예측 가능한 수입·지출 구조가 있을 때 훨씬 강해. 반대로 기준이 자주 바뀌면 돈 관리가 쉽게 흐트러져.",
      career:"일에서는 반복할 수 있는 루틴과 평가 기준이 명확할수록 실력이 잘 쌓이는 타입이야.",
      love:"연애에서는 강한 설렘보다 연락·약속·태도가 꾸준한 사람이 오래 맞는 편이야.",
      path:"진로에서는 하루아침에 확 바꾸는 것보다 익숙해질 시간을 주면서 실력을 쌓을 때 강점이 살아.",
      people:"관계에서는 자극적인 사람보다 말과 행동이 꾸준한 사람이 네 에너지를 덜 빼.",
      mental:"회복은 특별한 이벤트보다 수면·식사·움직임 같은 반복 가능한 리듬이 생길 때 빨라.",
    },
    expression:{
      money:"돈에서는 답답한 조건을 오래 참고 있기보다 가격·보상·조건을 직접 말할 때 흐름이 바뀌는 편이야.",
      career:"일에서는 네 생각을 밖으로 보여주고 결과물을 내놓을 때 강점이 살아. 통제만 받는 환경에서는 답답함이 빨리 쌓여.",
      love:"연애에서는 마음을 숨긴 채 오래 버티기보다 말로 확인해야 관계가 덜 꼬여. 참다가 한 번에 세게 말할 수 있는 쪽이야.",
      path:"진로에서는 생각만 할 때보다 만들어보고 보여줄 때 적성이 더 빨리 드러나.",
      people:"관계에서는 할 말이 막히는 환경에서 유독 지치고, 솔직하게 말해도 안전한 관계에서 편해져.",
      mental:"스트레스가 쌓이면 머릿속에만 두는 것보다 말·글·움직임으로 밖에 빼야 회복이 빨라.",
    },
    expansion:{
      money:"돈에서는 기회가 보이면 여러 수입원이나 선택지를 동시에 보고 싶어지는 편이야. 잘 맞으면 빠르지만 너무 벌리면 관리가 새.",
      career:"일에서는 새 프로젝트·이직·외부 기회가 보일 때 에너지가 올라가. 대신 선택지가 많아지면 끝까지 가져갈 축이 흐려질 수 있어.",
      love:"연애에서는 관계가 답답하게 고정될 때보다 새로운 경험과 변화가 있을 때 마음이 살아나는 편이야.",
      path:"진로에서는 하나만 오래 파기보다 여러 가능성을 보면서 판을 넓히는 힘이 있어. 그래서 선별 기준이 특히 중요해.",
      people:"관계에서는 새로운 사람과 연결되는 속도가 빠른 편이지만, 사람 수가 많아질수록 에너지가 분산될 수 있어.",
      mental:"기분을 바꾸려고 새 계획을 많이 벌이면 잠깐 살아나도 회복 에너지가 더 분산될 수 있어.",
    },
    responsibility:{
      money:"돈에서는 내 몫·가족·고정비처럼 ‘내가 책임져야 한다’고 느끼는 항목에 생각보다 많은 에너지를 써.",
      career:"일에서는 역할을 맡으면 쉽게 내려놓지 않는 편이라, 남들이 보기엔 잘 버티지만 네 안에서는 피로가 늦게 드러날 수 있어.",
      love:"연애에서는 관계가 시작되면 내 감정보다 관계를 유지해야 한다는 책임을 먼저 챙기기 쉬워.",
      path:"진로에서는 하고 싶은 것보다 해야 할 일을 오래 붙들 수 있어서, 겉으로는 안정적이어도 안쪽 답답함이 쌓일 수 있어.",
      people:"관계에서는 부탁이나 기대를 내 몫처럼 받아들이기 쉬워서 선을 늦게 세우면 피로가 크게 누적돼.",
      mental:"지쳐도 해야 할 일부터 처리하는 반응이 먼저 나와서, 주변은 괜찮아 보는데 너만 늦게 무너질 수 있어.",
    },
    analysis:{
      money:"돈에서는 바로 결정하기보다 비교하고 따져보는 힘이 강해. 그런데 불안이 붙으면 계산이 많아질수록 오히려 결정을 더 늦출 수 있어.",
      career:"평가나 선택 앞에서는 준비와 검토를 충분히 해야 움직이는 편이야. 잘 쓰면 정확하지만, 확신을 기다리면 기회를 늦출 수 있어.",
      love:"상대 반응이 애매해지면 바로 묻기보다 이유를 여러 개 세워보는 쪽이야. 그래서 실제 정보보다 해석이 길어질 수 있어.",
      path:"진로에서는 생각으로 정답을 찾으려는 힘이 강해서, 직접 해본 데이터가 부족하면 고민이 끝없이 늘어날 수 있어.",
      people:"사람의 말보다 의도와 분위기까지 읽는 편이라, 한 장면을 오래 곱씹을 수 있어.",
      mental:"생각이 많아질수록 쉬는 시간에도 머리가 계속 일해서 몸은 멈춰도 회복은 늦어질 수 있어.",
    },
    intensity:{
      money:"돈에서는 목표가 생기면 세게 밀 수 있지만, 손실 신호가 보여도 ‘조금만 더’ 하며 멈추는 시점을 늦출 수 있어.",
      career:"일에서는 압박이 걸릴수록 오히려 집중해서 결과를 내는 힘이 있어. 대신 버티는 힘 때문에 과부하를 늦게 알아차려.",
      love:"연애에서는 마음이 커지면 반응도 강해지는 편이야. 좋아할 땐 오래 버티고, 한계를 넘으면 결론도 세게 날 수 있어.",
      path:"진로에서는 목표가 선명해지면 빠르게 밀 수 있지만, 잘못 잡은 방향도 오래 버틸 수 있어서 중간 점검이 필요해.",
      people:"관계에서는 참는 동안엔 버티지만 선을 넘었다고 판단하면 갑자기 강하게 정리할 수 있어.",
      mental:"지칠수록 쉬기보다 더 밀어붙이는 쪽으로 반응할 수 있어서 회복 신호를 일찍 잡는 게 중요해.",
    },
    sensitivity:{
      money:"돈에서는 숫자 자체보다 주변 상황과 감정 변화가 판단에 끼어드는 순간을 조심해야 해.",
      career:"평가·상사·팀 분위기가 바뀌면 네 컨디션과 판단도 생각보다 빠르게 영향을 받을 수 있어.",
      love:"상대 말투나 연락 온도 같은 작은 변화도 빨리 알아차리는 편이야. 문제는 감지력이 아니라 그 뒤 해석이 커질 때야.",
      path:"진로에서는 주변 반응이 좋고 나쁨에 따라 내 선택에 대한 확신도 같이 흔들릴 수 있어.",
      people:"사람 표정과 분위기를 빨리 읽는 편이라 갈등이 생기기 전부터 이미 에너지를 많이 쓰고 있을 수 있어.",
      mental:"환경 변화와 사람 반응을 많이 받아들이는 편이라, 혼자 회복할 여백이 없으면 쉽게 과부하가 와.",
    },
    reversal:{
      money:"돈에서는 평소엔 참다가 어느 순간 보상소비나 큰 결정을 한 번에 할 수 있어서 중간 점검이 중요해.",
      career:"일에서는 불만을 오래 견디다가 한계를 넘으면 갑자기 퇴사·이동 결론까지 갈 수 있어.",
      love:"연애에서는 작은 서운함을 바로 끝내진 않지만 쌓인 뒤에는 상대가 놀랄 만큼 마음이 확 돌아설 수 있어.",
      path:"진로에서는 오래 버티다가 어느 날 전부 바꾸고 싶어지는 식으로 결론이 크게 날 수 있어.",
      people:"관계에서는 참는 동안 티가 적다가 임계점을 넘으면 한 번에 거리를 크게 둘 수 있어.",
      mental:"버티는 동안은 괜찮아 보이다가 한계 이후에 아무것도 하기 싫어지는 식으로 꺼질 수 있어.",
    },
    mismatch:{
      money:"겉으로는 돈에 크게 흔들리지 않는 것처럼 보여도 실제로는 특정 상황에서 에너지가 많이 새는 지점이 따로 있을 수 있어.",
      career:"겉으로 잘하는 방식과 실제로 덜 지치는 방식이 다를 수 있어서, 남들이 칭찬하는 역할이 꼭 오래 맞는 자리는 아닐 수 있어.",
      love:"겉으로는 담담하게 보여도 관계 안에서는 생각보다 훨씬 많은 반응을 안쪽에서 처리할 수 있어.",
      path:"겉으로 잘하는 것과 실제로 오래 하고 싶은 것이 어긋날 수 있어서 적성을 성과 하나로만 보면 틀릴 수 있어.",
      people:"겉으론 잘 맞춰주는 것처럼 보여도 실제 속에서는 피로가 훨씬 빨리 쌓이는 관계가 있을 수 있어.",
      mental:"겉으로 멀쩡해 보여도 실제 소모가 더 큰 편일 수 있어서 ‘아직 버틸 만하다’는 자기 판단이 늦을 수 있어.",
    },
  };

  const ACTION_BY_ELEMENT = {
    mok:"작게라도 시작해서 반응을 보는 것",
    hwa:"말하거나 보여줘서 상대 반응을 확인하는 것",
    to:"루틴·예산·시간표처럼 기준을 눈에 보이게 고정하는 것",
    geum:"숫자·조건·경계선을 정하고 아닌 건 자르는 것",
    su:"결론을 서두르지 않고 필요한 정보만 모아 한 번 더 확인하는 것",
  };

  const AVOID_BY_ELEMENT = {
    mok:"선택지를 계속 늘리기",
    hwa:"감정이 올라온 상태에서 바로 결론내리기",
    to:"익숙하다는 이유로 오래 버티기",
    geum:"완벽한 기준이 생길 때까지 시작을 미루기",
    su:"생각만 늘리고 실제 확인을 미루기",
  };

  function stripHtml(v) {
    return String(v || "").replace(/<br\s*\/?\s*>/gi," ").replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim();
  }

  function situationFor(data) {
    const concern = CONCERNS.includes(data?.concernKey) ? data.concernKey : "money";
    const key = data?.concernSituation || Object.keys(SITUATIONS[concern] || {})[0];
    return { concern, key, ...(SITUATIONS[concern]?.[key] || Object.values(SITUATIONS[concern] || {})[0]) };
  }

  function addEvidence(list, cluster, weight, source, detail) {
    if (!cluster) return;
    list.push({ cluster, weight, source, detail });
  }

  function buildEvidence(profile) {
    const list = [];
    const dom = profile?.sipsin?.dominant || "";
    const sec = profile?.sipsin?.secondary || "";
    addEvidence(list, GOD_CLUSTER[dom], 3.2, "주된 반응", dom);
    if (sec && sec !== dom) addEvidence(list, GOD_CLUSTER[sec], 1.9, "보조 반응", sec);

    const sc = profile?.strength?.code;
    if (sc === "push") addEvidence(list, "intensity", 2.7, "기본 힘", "버티고 밀어붙이는 힘이 강함");
    if (sc === "sensitive") addEvidence(list, "sensitivity", 2.7, "기본 힘", "주변 변수의 영향을 빨리 받음");
    if (sc === "balanced") addEvidence(list, "stability", 1.4, "기본 힘", "기본 균형은 있으나 애매함에서 결정이 늦어질 수 있음");

    const status = profile?.structure?.status || "";
    if (status === "성중유패") addEvidence(list, "reversal", 2.6, "격의 흐름", "잘 가다가 특정 지점에서 흐름이 끊기기 쉬움");
    if (status === "파격") addEvidence(list, "sensitivity", 2.3, "격의 흐름", "익숙한 방식이 상황과 충돌하면 마찰이 커짐");
    if (status === "성격") addEvidence(list, GOD_CLUSTER[dom] || "stability", 1.8, "격의 흐름", "중심 반응이 비교적 일관되게 이어짐");

    if (profile?.relations?.hasClash) addEvidence(list, "reversal", 2.5, "관계 변화", "변수가 겹치면 방향을 크게 바꾸는 반응");
    if (profile?.elements?.rawVsInfluenceMismatch) addEvidence(list, "mismatch", 2.4, "겉과 실제 세력", "겉으로 보이는 것과 실제 힘 쓰는 방식이 다름");
    if (profile?.structure?.touchul) addEvidence(list, "expression", 1.5, "겉으로 드러나는 방식", "속 기준이 행동에 비교적 빨리 드러남");

    const weak = profile?.behavior?.weakStat;
    if (weak === "mental") addEvidence(list, "sensitivity", 1.8, "취약 지점", "회복시간과 감정 경계가 먼저 무너지기 쉬움");
    if (weak === "drive") addEvidence(list, "analysis", 1.8, "취약 지점", "실행을 밖에 걸어두지 않으면 시작이 늦어짐");
    if (weak === "wealth") addEvidence(list, "stability", 1.5, "취약 지점", "손익과 내 몫을 숫자로 확인해야 안정됨");
    if (weak === "network") addEvidence(list, "boundary", 1.5, "취약 지점", "도움 요청과 관계 경계가 중요함");

    return list;
  }

  function rankClusters(evidence) {
    const map = new Map();
    for (const e of evidence) {
      if (!map.has(e.cluster)) map.set(e.cluster, { cluster:e.cluster, score:0, evidence:[] });
      const row = map.get(e.cluster);
      row.score += e.weight;
      row.evidence.push(e);
    }
    return [...map.values()].sort((a,b)=>b.score-a.score || b.evidence.length-a.evidence.length);
  }

  function confidence(row) {
    const sources = new Set((row?.evidence || []).map(x=>x.source));
    if (sources.size >= 3 || (sources.size >= 2 && row.score >= 4.5)) return "high";
    if (sources.size >= 2 || row.score >= 3.2) return "medium";
    return "soft";
  }

  function buildConcernDiagnosisV2(data) {
    const profile = data?.integratedSajuProfile || (typeof global.buildIntegratedSajuProfile === "function" ? global.buildIntegratedSajuProfile(data || {}) : null);
    if (data && profile) data.integratedSajuProfile = profile;
    const situation = situationFor(data || {});
    const evidence = buildEvidence(profile || {});
    const ranked = rankClusters(evidence);
    const primary = ranked[0] || {cluster:"analysis",score:0,evidence:[]};
    const secondary = ranked.find(x=>x.cluster !== primary.cluster) || {cluster:"stability",score:0,evidence:[]};
    const fingerprint = [
      profile?.fingerprint || "no-profile",
      situation.concern,
      situation.key,
      primary.cluster,
      secondary.cluster,
      primary.evidence.map(x=>x.source+":"+x.detail).join(","),
      secondary.evidence.map(x=>x.source+":"+x.detail).join(","),
    ].join("|");
    const diagnosis = {
      version: VERSION,
      fingerprint,
      situation,
      profile,
      evidence,
      ranked,
      primary:{...primary, confidence:confidence(primary)},
      secondary:{...secondary, confidence:confidence(secondary)},
      actionElement: profile?.balance?.primary || "to",
      secondaryElement: profile?.balance?.secondary || profile?.balance?.primary || "to",
      avoidElement: profile?.balance?.avoid || "su",
    };
    if (data && typeof data === "object") data.noteDiagnosisV2 = diagnosis;
    return diagnosis;
  }

  function clusterSentence(cluster, concern) {
    return CLUSTER_COPY[cluster]?.[concern] || CLUSTER_COPY.analysis[concern];
  }

  function certaintyLead(row, isT) {
    const c = row?.confidence || "soft";
    if (c === "high") return isT ? "이건 꽤 선명해." : "이건 언니 눈엔 꽤 선명하게 보여.";
    if (c === "medium") return isT ? "가능성이 높은 패턴은 이거야." : "언니가 보기엔 이 패턴이 꽤 강해.";
    return isT ? "한쪽으로 단정하진 않을게. 다만 이 반응은 체크해." : "딱 잘라 말하긴 어렵지만, 이 반응은 한번 체크해봐.";
  }

  function noteTitle(d, idx, isT) {
    const s=d.situation, p=d.primary.cluster;
    if (idx===0) return isT ? s.label+"에서 네가 먼저 보이는 반응" : s.label+"라면, 언니는 네 이 반응부터 볼래";
    if (idx===1) return isT ? "막히는 순서는 여기서 갈려" : "네가 지치기 시작하는 순서가 보여";
    if (idx===2) return isT ? "원인, 네가 생각한 데랑 다를 수 있어" : "언니가 보기엔 진짜 문제는 조금 다른 데 있어";
    if (idx===3) return isT ? "이번 주엔 이것만 바꿔" : "이번 주엔 언니랑 이것만 바꿔보자";
    if (idx===4) {
      return ({money:"돈이 남는 구조는 따로 있어",career:"네가 성과 내기 좋은 자리는 따로 있어",love:"너랑 오래 맞는 사람은 이런 쪽이야",path:"네 강점이 오래 사는 일 방식은 이쪽이야",people:"가까이 둘 사람은 반응이 달라",mental:"네가 빨리 회복되는 환경은 따로 있어"})[s.concern];
    }
    return isT ? "움직일 때와 지킬 때를 나눠" : "언니가 움직일 때랑 쉬어갈 때를 나눠줄게";
  }

  function badgeFor(concern, idx) {
    const rows={
      money:["돈의 핵심","돈 패턴","진짜 원인","이번 주 행동","돈이 남는 방식","돈 흐름"],
      career:["일의 핵심","막히는 패턴","진짜 원인","이번 주 행동","맞는 일 환경","기회 시기"],
      love:["연애 핵심","반복 패턴","진짜 원인","이번 주 행동","맞는 사람","관계 시기"],
      path:["진로 핵심","고민 패턴","진짜 원인","이번 주 행동","맞는 일 방식","움직일 시기"],
      people:["관계 핵심","반복 패턴","진짜 원인","이번 주 행동","남길 사람","관계 시기"],
      mental:["마음 핵심","지치는 패턴","진짜 원인","이번 주 행동","회복 환경","회복 시기"],
    };
    return rows[concern]?.[idx] || "비밀 메모";
  }

  function behaviorChain(d, isT) {
    const s=d.situation;
    const a=clusterSentence(d.primary.cluster,s.concern);
    const b=clusterSentence(d.secondary.cluster,s.concern);
    const scene=s.scene;
    if (isT) {
      return "<b>시작</b> — "+scene+".<br><br><b>첫 반응</b> — "+a+"<br><br><b>그다음</b> — "+b+"<br><br><b>결국</b> — 같은 상황이 다시 오면 원래 문제보다 네 자동반응이 더 빨리 튀어나와. 그래서 시작 지점에서 끊어야 해.";
    }
    return "보통 <b>"+scene+"</b>에서 시작돼. 그때 "+a+"<br><br>그리고 그다음엔 "+b+"<br><br>그래서 나중에 보면 처음 문제보다 네가 그 안에서 쓴 에너지가 더 크게 남을 수 있어. 언니는 결과가 나온 뒤보다 <b>처음 반응이 시작되는 순간</b>을 먼저 잡고 싶어.";
  }

  function blindSpot(d, isT) {
    const s=d.situation;
    const p=d.primary.cluster, q=d.secondary.cluster;
    const pLabel=CLUSTER_LABEL[p]||p, qLabel=CLUSTER_LABEL[q]||q;
    const mismatch = d.profile?.elements?.rawVsInfluenceMismatch;
    if (isT) {
      return "네가 문제라고 보기 쉬운 건 <b>"+s.object+"</b> 자체야. 그런데 실제로 먼저 봐야 하는 건 <b>"+pLabel+"</b>과 <b>"+qLabel+"</b>이 같이 작동하는 방식이야."+ (mismatch ? " 겉으로 보이는 모습과 실제 힘 쓰는 방식도 달라서 원인을 잘못 잡기 쉬워." : "") +" 그래서 더 열심히 하기 전에 어디서 자동반응이 시작됐는지부터 분리해.";
    }
    return "너는 자꾸 <b>"+s.object+"</b> 자체가 문제라고 생각했을 수 있어. 근데 언니는 <b>"+pLabel+"</b>이랑 <b>"+qLabel+"</b>이 같이 작동하는 순간을 먼저 볼래."+ (mismatch ? " 특히 겉으로 보이는 너랑 실제로 힘을 쓰는 방식이 조금 달라서, 스스로도 엉뚱한 이유를 탓하기 쉬워." : "") +" 그러니까 너 자체가 부족하다고 결론내리기 전에, 어디서 마음과 행동이 바뀌는지부터 보자.";
  }

  function actionNote(d, isT) {
    const s=d.situation;
    const first=ACTION_BY_ELEMENT[d.actionElement] || ACTION_BY_ELEMENT.to;
    const second=ACTION_BY_ELEMENT[d.secondaryElement] || first;
    const avoid=AVOID_BY_ELEMENT[d.avoidElement] || AVOID_BY_ELEMENT.su;
    if (isT) {
      return "<b>1. 오늘</b> — "+s.move+".<br><br><b>2. 이번 7일</b> — "+first+"을 실제로 한 번 넣어.<br><br><b>3. 하지 말 것</b> — "+avoid+".<br><br><b>왜 이게 맞냐면</b> — 네 사주는 첫 행동을 "+first+" 쪽으로 잡을 때 힘이 덜 새고, 그다음 "+second+"을 붙일 때 결과가 안정돼.";
    }
    return "<b>오늘 먼저</b> — "+s.move+".<br><br><b>이번 7일</b> — "+first+"을 딱 한 번만 실제로 해보자.<br><br><b>이번 주엔 이것만 피하자</b> — "+avoid+".<br><br><b>왜 너한테 이 순서냐면</b> — 처음부터 다 바꾸는 것보다 "+first+"부터 시작하고, 괜찮으면 "+second+"을 붙이는 쪽이 네 사주 힘을 덜 낭비해.";
  }

  function domainFit(d, isT) {
    const c=d.situation.concern, primary=d.primary.cluster;
    const first=clusterSentence(primary,c);
    const action=ACTION_BY_ELEMENT[d.actionElement] || ACTION_BY_ELEMENT.to;
    const avoid=AVOID_BY_ELEMENT[d.avoidElement] || AVOID_BY_ELEMENT.su;
    const head={
      money:"돈은 많이 버는 방식보다 <b>어떤 구조에서 새지 않는지</b>가 먼저야.",
      career:"직장은 이름보다 <b>네 힘이 실제 성과로 연결되는 환경</b>인지가 중요해.",
      love:"너랑 맞는 사람은 조건보다 <b>네 자동반응을 덜 소모시키는 사람</b>이야.",
      path:"적성은 직업명보다 <b>어떤 방식으로 일할 때 오래 강한지</b>를 봐야 해.",
      people:"좋은 사람/나쁜 사람보다 <b>그 사람 옆에서 네 판단과 에너지가 어떻게 변하는지</b>가 기준이야.",
      mental:"회복은 의지보다 <b>네 과부하가 덜 생기는 환경</b>을 만드는 게 먼저야.",
    }[c];
    const fit={
      money:"수입·지출 기준이 눈에 보이고, "+action+"이 가능한 구조",
      career:"역할과 피드백이 분명하고, "+action+"을 막지 않는 환경",
      love:"말과 행동이 꾸준하고, 네가 확인하고 표현해도 관계가 불안정해지지 않는 사람",
      path:"작게 시험하고 수정할 수 있고, "+action+"이 허용되는 일 방식",
      people:"불편함을 말했을 때 방어보다 조정이 먼저 나오는 사람",
      mental:"혼자 회복할 여백이 있고, "+action+"을 생활 안에 둘 수 있는 환경",
    }[c];
    const drain={
      money:avoid+"을 부추기는 돈 환경",
      career:"기준은 바뀌는데 책임만 계속 늘어나는 환경",
      love:"확신은 안 주면서 네 반응만 계속 확인하는 관계",
      path:"정답을 강요하고 직접 시험할 여지를 주지 않는 환경",
      people:"네 경계를 예민함으로 돌리고 반복해서 넘는 관계",
      mental:"쉬는 시간까지 성과로 채우게 만드는 환경",
    }[c];
    if (isT) return head+"<br><br><b>잘 맞는 쪽</b> — "+fit+".<br><br><b>피할 쪽</b> — "+drain+".<br><br>"+first;
    return head+"<br><br><b>너를 살리는 쪽</b> — "+fit+".<br><br><b>오래 있으면 지치는 쪽</b> — "+drain+".<br><br>왜냐하면 "+first;
  }

  function timingFor(d, data, isT) {
    let timing=null;
    try {
      if (typeof global.getTrueBaziTiming === "function") {
        timing=global.getTrueBaziTiming(data?.dayOheng || "to", d.situation.concern, data?.userGender, data?.userBirthStr, data?.gyeokguk, data?.gyeokStatus, data?.realYeonun);
      }
    } catch (_) {}
    const r1=timing?.r1 || "첫 번째 흐름";
    const r2=timing?.r2 || "두 번째 흐름";
    const m1=String(timing?.momentum1 || "선별");
    const m2=String(timing?.momentum2 || "준비");
    function role(momentum, second) {
      const m=String(momentum);
      if (/공격|실행|확장|push|attack/.test(m)) return second ? "앞에서 확인한 걸 실제 선택으로 굳히는 구간" : "생각보다 행동을 먼저 넣어 반응을 보는 구간";
      if (/방어|휴식|rest|defend/.test(m)) return "판을 키우기보다 손실·과로·감정소모를 줄이는 구간";
      if (/준비|유지|prepare/.test(m)) return "결론보다 준비와 확인을 쌓는 구간";
      return second ? "괜찮았던 것만 남겨 선택을 좁히는 구간" : "가능성 중 반응이 오는 쪽만 골라보는 구간";
    }
    const a1=role(m1,false), a2=role(m2,true);
    const move=d.situation.move;
    const desc = isT
      ? "<b>"+r1+"</b><br>"+a1+". 이때는 "+move+".<br><br><b>"+r2+"</b><br>"+a2+". 첫 구간에서 반응 나온 것만 남겨.<br><br><b>둘의 차이</b> — 첫 시기는 확인, 다음 시기는 선별·확정으로 써."
      : "<b>"+r1+"</b><br>"+a1+"이야. 여기서는 "+move+".<br><br><b>"+r2+"</b><br>"+a2+"이야. 처음 해봤을 때 마음과 현실 반응이 괜찮았던 것만 이어가자.<br><br><b>언니가 나눠서 보는 이유</b> — 첫 시기는 확인, 다음 시기는 남길 걸 정하는 역할이 달라.";
    return {desc, meta:{firstDate:r1,secondDate:r2,firstBody:a1+" / "+move,secondBody:a2,concernSituation:d.situation.key,diagnosisFingerprint:d.fingerprint}};
  }

  function renderConcernNotesV2(data, mode) {
    const isT=mode==="T";
    const d=buildConcernDiagnosisV2(data || {});
    const c=d.situation.concern;
    const p=d.primary, q=d.secondary;
    const first=clusterSentence(p.cluster,c);
    const second=clusterSentence(q.cluster,c);
    const note1 = {
      badge:badgeFor(c,0),
      title:noteTitle(d,0,isT),
      desc: certaintyLead(p,isT)+"<br><br>"+first+"<br><br>"+certaintyLead(q,isT)+" "+second,
      checklist:isT ? "맞는지 볼 건 하나야. 최근 같은 상황에서 네 첫 반응이 뭐였는지 떠올려." : "최근 비슷한 장면 하나만 떠올려봐. 언니가 말한 첫 반응이 실제로 있었는지만 보면 돼.",
    };
    const note2 = {
      badge:badgeFor(c,1),
      title:noteTitle(d,1,isT),
      desc:behaviorChain(d,isT),
      checklist:isT ? "다음에 같은 장면 오면 결과 말고 첫 반응부터 체크해." : "다음에 비슷한 장면이 오면 ‘아, 여기서 시작되는구나’ 이것만 먼저 알아차려보자.",
    };
    const note3 = {
      badge:badgeFor(c,2),
      title:noteTitle(d,2,isT),
      desc:blindSpot(d,isT),
      checklist:isT ? "원인 하나만 바꿔 말해봐. ‘문제는 상황’이 아니라 ‘내가 여기서 자동으로 하는 반응’으로." : "이번엔 상황 탓이나 내 탓으로 끝내지 말고, 내가 자동으로 하는 반응 한 가지만 적어보자.",
    };
    const note4 = {
      badge:badgeFor(c,3),
      title:noteTitle(d,3,isT),
      desc:actionNote(d,isT),
      checklist:isT ? "7일 뒤 실제로 효과 있었던 행동 하나만 남겨." : "7일 뒤 ‘이건 덜 힘들었어’ 싶은 행동 하나만 남기면 돼.",
    };
    const note5 = {
      badge:badgeFor(c,4),
      title:noteTitle(d,4,isT),
      desc:domainFit(d,isT),
      checklist: c==="money" ? "돈이 들어오고 나가는 구조 하나에 이 기준을 대입해봐." :
        c==="career" ? "지금 조직이나 준비 중인 자리 하나에 이 기준을 대입해봐." :
        c==="love" ? "떠오르는 사람 한 명의 말보다 최근 행동 세 번을 봐." :
        c==="path" ? "관심 있는 일 하나를 직업명이 아니라 일하는 방식으로 다시 봐." :
        c==="people" ? "떠오르는 한 사람에게 경계를 말했을 때 반응을 기준으로 봐." :
        "지금 생활에서 회복을 방해하는 환경 하나만 줄여봐.",
    };
    const timing=timingFor(d,data,isT);
    const note6 = {
      badge:badgeFor(c,5),
      title:noteTitle(d,5,isT),
      desc:timing.desc,
      checklist:isT ? "첫 시기엔 확인할 행동 하나, 다음 시기엔 남길 행동 하나만 캘린더에 넣어." : "첫 시기엔 가볍게 확인할 것 하나, 다음 시기엔 이어갈 것 하나만 미리 적어두자.",
      __timingQA:timing.meta,
    };
    const notes=[note1,note2,note3,note4,note5,note6];
    if (data && typeof data==="object") {
      data.noteV2Audit={
        version:VERSION,
        fingerprint:d.fingerprint,
        primary:{cluster:p.cluster,confidence:p.confidence,evidence:p.evidence.map(x=>({source:x.source,detail:x.detail}))},
        secondary:{cluster:q.cluster,confidence:q.confidence,evidence:q.evidence.map(x=>({source:x.source,detail:x.detail}))},
        situation:d.situation.key,
      };
    }
    return notes;
  }

  global.buildConcernDiagnosisV2=buildConcernDiagnosisV2;
  global.renderConcernNotesV2=renderConcernNotesV2;
  global.__CONCERN_NOTE_ENGINE_V2__={version:VERSION,situations:SITUATIONS};

  const legacy=global.generateConcernNotes;
  const wrapped=function(data,mode){
    return renderConcernNotesV2(data || {}, mode || "F");
  };
  wrapped.__noteV2Wrapped=true;
  wrapped.__legacyBase=legacy;
  wrapped.__base=legacy?.__base || legacy;
  wrapped.__integratedProfileWrapped=!!legacy?.__integratedProfileWrapped;
  wrapped.__paidValueWrapped=!!legacy?.__paidValueWrapped;
  global.generateConcernNotes=wrapped;
})(globalThis);
