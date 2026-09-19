(function (global) {
  "use strict";

  const VERSION = "2.3.0";
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
      career:"일에서는 역할과 기준이 모호할수록 스트레스가 커지고, 네 방식이 존중될 때 성과가 훨씬 안정적으로 나와.",
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

  const ELEMENT_CLUSTER = {
    mok:"expansion", hwa:"expression", to:"stability", geum:"boundary", su:"analysis",
  };

  const CLUSTER_ATOM = {
    boundary:{
      first:"내가 어디까지 괜찮은지부터 속으로 선을 그어",
      second:"상대나 상황이 그 선을 넘는지 확인한 뒤 움직여",
      visible:"한동안 별말 없이 지켜보는 쪽",
      after:"선을 여러 번 넘겼다고 느끼면 설명보다 거리두기가 먼저 나올 수 있어",
      misread:"고집이 세거나 갑자기 차가워진 것",
      fit:"기준을 말해도 무시하지 않고 조정해주는 환경",
      drain:"네 기준을 예민함이나 유난으로 돌리는 환경",
    },
    comparison:{
      first:"내 기준보다 다른 사람의 속도·성과가 먼저 눈에 들어와",
      second:"뒤처지면 안 된다는 압박이 붙으면서 원래 계획보다 힘을 더 써",
      visible:"갑자기 목표치를 높이거나 속도를 올리는 쪽",
      after:"성과가 나도 안도보다 다음 비교가 바로 붙어서 만족이 짧아질 수 있어",
      misread:"욕심이 많거나 승부욕만 센 것",
      fit:"비교보다 내 변화량과 실제 결과를 보여주는 환경",
      drain:"순위·눈치·인정 경쟁을 계속 자극하는 환경",
    },
    stability:{
      first:"예측 가능한 기준과 반복 가능한 방식을 먼저 찾고",
      second:"한번 괜찮다고 판단한 방식은 쉽게 버리지 않아",
      visible:"익숙한 루틴을 유지하면서 천천히 수정하는 쪽",
      after:"안정은 강점인데 이미 안 맞는 방식도 오래 들고 갈 수 있어",
      misread:"변화를 싫어하거나 소극적인 것",
      fit:"기준이 자주 바뀌지 않고 쌓인 노력이 남는 환경",
      drain:"오늘 맞는 말이 내일 뒤집히는 환경",
    },
    expression:{
      first:"답답한 지점을 빨리 알아차리고 말이나 행동으로 꺼내고 싶어 해",
      second:"참을수록 머릿속 문장이 더 세지고",
      visible:"어느 순간 한꺼번에 말하거나 바로 결과물을 내는 쪽",
      after:"표현 자체보다 타이밍이 늦었을 때 말의 강도가 커져 후회가 남을 수 있어",
      misread:"욱하거나 말이 센 것",
      fit:"질문·제안·표현을 해도 관계가 깨지지 않는 환경",
      drain:"말할수록 불이익이 생겨 계속 참아야 하는 환경",
    },
    expansion:{
      first:"새 가능성이 보이면 일단 판을 넓혀 보고 싶어 하고",
      second:"하나를 고르기 전에 여러 선택지를 동시에 비교해",
      visible:"새 계획·사람·기회를 빠르게 붙여보는 쪽",
      after:"시작은 빠른데 관리할 축이 없으면 에너지가 여러 군데로 새기 쉬워",
      misread:"산만하거나 쉽게 질리는 것",
      fit:"작게 시험해보고 반응 좋은 쪽만 키울 수 있는 환경",
      drain:"시작부터 하나에 전부 걸라고 압박하는 환경",
    },
    responsibility:{
      first:"문제가 생기면 누가 시키기 전에 내 몫부터 챙기고",
      second:"힘들어도 맡은 걸 끝내야 마음이 놓여",
      visible:"괜찮은 척하면서 할 일을 계속 처리하는 쪽",
      after:"주변은 잘 버틴다고 보는데 정작 본인은 한계 신호를 늦게 알아차릴 수 있어",
      misread:"원래 강해서 괜찮은 것",
      fit:"책임 범위와 보상이 같이 정리되는 환경",
      drain:"잘 버틴다는 이유로 네 몫이 계속 늘어나는 환경",
    },
    analysis:{
      first:"바로 결론내리기보다 이유와 경우의 수를 먼저 늘리고",
      second:"확실한 근거가 생길 때까지 한 번 더 확인하려 해",
      visible:"결정 직전에도 검색·비교·생각을 한 번 더 하는 쪽",
      after:"정확도는 높아지지만 확인이 길어지면 행동할 타이밍이 늦어질 수 있어",
      misread:"우유부단하거나 겁이 많은 것",
      fit:"질문하고 검토할 시간을 주되 마감이 분명한 환경",
      drain:"정보는 계속 늘어나는데 결론 기준은 없는 환경",
    },
    intensity:{
      first:"목표가 생기면 중간 불편함보다 끝까지 가는 쪽을 먼저 택하고",
      second:"힘들수록 쉬기보다 더 집중해서 밀어붙여",
      visible:"남들이 멈출 때 한 번 더 버티는 쪽",
      after:"성과는 만들 수 있지만 멈춰야 할 신호까지 의지로 덮을 수 있어",
      misread:"체력이 좋고 멘탈이 원래 센 것",
      fit:"집중할 때와 멈출 때 기준이 둘 다 있는 환경",
      drain:"버틸수록 칭찬받아서 과부하를 눈치채기 어려운 환경",
    },
    sensitivity:{
      first:"말보다 말투·간격·표정 같은 작은 변화를 먼저 잡고",
      second:"그 변화가 왜 생겼는지 속으로 여러 번 해석해",
      visible:"겉으로는 바로 묻지 않고 분위기를 더 보는 쪽",
      after:"감지한 건 맞아도 설명 없는 빈칸을 혼자 채우면서 마음이 더 커질 수 있어",
      misread:"예민해서 혼자 의미를 크게 만드는 것",
      fit:"애매하게 두기보다 말과 행동이 일관된 환경",
      drain:"신호는 계속 주는데 설명은 하지 않는 환경",
    },
    reversal:{
      first:"처음엔 웬만하면 참고 기존 흐름을 유지하려 하고",
      second:"작은 불편함을 그때그때 끊기보다 안쪽에 쌓아",
      visible:"겉으로는 평소와 비슷하게 지내는 쪽",
      after:"한계를 넘는 순간 그동안의 판단이 한꺼번에 합쳐져 크게 방향을 바꿀 수 있어",
      misread:"갑자기 마음이 변한 것",
      fit:"작은 불편함부터 중간중간 조정할 수 있는 환경",
      drain:"참는 걸 성숙함으로 여기게 만드는 환경",
    },
    mismatch:{
      first:"겉으로 보이는 역할에 맞춰 먼저 움직이지만",
      second:"실제로 힘이 빠지는 지점은 겉에서 보이는 것과 다르게 생겨",
      visible:"남들이 보기엔 잘하고 적응한 것처럼 보이는 쪽",
      after:"잘한다는 평가와 내가 오래 버틸 수 있는지가 달라 스스로도 원인을 늦게 알아챌 수 있어",
      misread:"잘하고 있으니 문제없는 것",
      fit:"겉 성과뿐 아니라 실제 소모와 회복까지 볼 수 있는 환경",
      drain:"잘하는 것만 계속 맡기고 소모는 보지 않는 환경",
    },
  };

  const SITUATION_DETAIL = {
    "money.saving":{ cue:"큰돈 한 번보다 ‘이 정도는 괜찮겠지’ 하는 작은 예외가 몇 번 겹칠 때", proof:"최근 한 달에서 계획에 없던 지출 세 개만 보면 돼. 금액보다 그 직전 상황이 비슷했는지 확인해.", metric:"계획 밖 지출 횟수와 그 직전 이유를 7일만 적기" },
    "money.income":{ cue:"성과는 냈는데 가격·연봉·조건을 직접 꺼내야 할 때", proof:"최근 보상 얘기를 미룬 장면이 있었는지, 있었다면 무엇이 걸렸는지 떠올려봐.", metric:"내 성과를 숫자 하나와 요구 조건 하나로 바꿔 말해보기" },
    "money.side":{ cue:"아이디어를 실제 판매·제안으로 바꾸기 직전", proof:"준비한 것과 실제로 밖에 내보낸 것의 개수가 얼마나 다른지 보면 정확해.", metric:"7일 안에 유료 제안 또는 실제 반응을 받는 테스트 1회" },
    "money.flow":{ cue:"좋은 시기를 기다리면서 지금 뭘 준비해야 할지 애매할 때", proof:"기다리는 동안 준비만 늘었는지, 실제 행동이 하나라도 있었는지 확인해.", metric:"다음 기회가 오면 바로 할 행동 하나를 미리 완료 상태로 만들기" },
    "career.exam":{ cue:"모의점수나 오답이 기대보다 안 나와 공부법을 바꾸고 싶어질 때", proof:"불안한 날마다 자료·계획을 바꿨는지, 아니면 같은 방식으로 누적했는지 보면 돼.", metric:"7일 동안 공부법은 고정하고 오답 원인만 세 가지로 분류하기" },
    "career.jobsearch":{ cue:"지원 버튼을 누르거나 내 실력을 남에게 보여줘야 할 때", proof:"준비 시간에 비해 실제 지원·제출 횟수가 적은지 확인해봐.", metric:"지원·제출·면접 연습 중 외부 반응을 받는 행동 2회" },
    "career.move":{ cue:"퇴사하고 싶은 날과 그냥 버텨야 하나 싶은 날이 번갈아 올 때", proof:"힘든 감정과 실제 조건 문제를 따로 적었을 때 같은 결론이 나오는지 보면 돼.", metric:"이직 기준 3개를 숫자·조건으로 적고 현재 직장과 비교하기" },
    "career.current":{ cue:"일은 해내는데 역할·보상·사람 중 하나가 계속 답답하게 남을 때", proof:"회사 전체가 싫은 건지, 반복해서 걸리는 한 지점이 있는지 구분해봐.", metric:"바꿀 수 있는 조건 하나를 문장으로 만들어 실제로 요청하기" },
    "love.crush":{ cue:"답장 속도·말투·약속 잡는 태도가 평소와 조금 달라졌을 때", proof:"상대 신호를 해석한 횟수와 직접 확인한 횟수 중 뭐가 더 많았는지 보면 돼.", metric:"추측 하나를 질문·만남 제안 같은 실제 확인으로 바꾸기" },
    "love.relationship":{ cue:"연락 간격·약속·표현에서 작게 서운한 일이 생겼을 때", proof:"그 자리에서 짧게 말했는지, 괜찮은 척 넘긴 뒤 다른 장면까지 묶었는지 떠올려봐.", metric:"서운함 하나를 24시간 안에 한 문장으로 말하기" },
    "love.breakup":{ cue:"좋았던 기억이 올라와 다시 연락하고 싶어질 때", proof:"그리움 말고 헤어진 원인이 실제로 달라졌다는 증거가 있는지 세 개만 확인해.", metric:"재회 판단 기준을 말이 아니라 행동 변화 세 가지로 정하기" },
    "love.new":{ cue:"새 사람이 괜찮아 보여도 마음을 열지 말지 재게 될 때", proof:"첫인상 하나로 기대를 키우거나 닫았는지, 두세 번의 행동을 본 뒤 판단했는지 봐.", metric:"호감보다 일관된 행동을 세 번 확인한 뒤 다음 판단하기" },
    "path.lost":{ cue:"선택지는 있는데 하나를 고르면 다른 걸 놓칠 것 같을 때", proof:"고민 시간은 긴데 직접 해본 시간은 짧은지 비교해보면 돼.", metric:"가장 궁금한 선택지 하나를 2시간 이상 실제 경험으로 바꾸기" },
    "path.current":{ cue:"일이 힘든 날마다 ‘이 길 자체가 틀렸나’가 올라올 때", proof:"적성 문제와 환경 문제를 따로 적었을 때 무엇이 반복되는지 봐.", metric:"잘되는 장면 3개와 소모되는 장면 3개를 분리해서 기록하기" },
    "path.switch":{ cue:"지금 답답함을 끝내려고 아예 다른 길로 뛰고 싶어질 때", proof:"새 길이 좋아서인지 현재가 싫어서인지 이유를 둘로 나눠보면 선명해져.", metric:"전환 전 새 방향을 작은 프로젝트나 체험으로 먼저 검증하기" },
    "path.strength":{ cue:"잘하는 건 많은데 ‘그래서 뭘 해야 하지?’가 안 정리될 때", proof:"직업명이 아니라 반복해서 칭찬받은 행동 방식이 같은지 세 장면을 모아봐.", metric:"강점이 드러난 장면 3개에서 공통 행동 하나 뽑기" },
    "people.friend":{ cue:"친한 사이인데 작은 불편함을 말하면 관계가 어색해질까 걱정될 때", proof:"참은 뒤 더 멀어졌는지, 작은 선을 말했을 때 상대가 조정했는지 떠올려봐.", metric:"작은 경계 하나를 말하고 상대 반응을 그대로 기록하기" },
    "people.work":{ cue:"일 때문에 계속 봐야 하는 사람이 내 역할까지 넘겨올 때", proof:"싫다는 감정보다 실제로 내 일이 얼마나 늘었는지 보면 더 정확해.", metric:"업무 범위·기한·연락 기준 중 하나를 문장으로 고정하기" },
    "people.family":{ cue:"가족 부탁이라 거절하면 죄책감이 먼저 올라올 때", proof:"도와준 뒤 괜찮았는지, 아니면 며칠씩 피로와 화가 남았는지 봐.", metric:"할 수 있는 범위와 못 하는 범위를 한 문장씩 정하기" },
    "people.distance":{ cue:"계속 참다가 아예 끊어버리고 싶다는 생각이 들 때", proof:"이미 여러 번 넘긴 경계가 있었는지, 한 번도 말하지 않은 채 쌓였는지 확인해.", metric:"연락·만남·도움 중 하나만 먼저 줄이고 내 반응 보기" },
    "mental.burnout":{ cue:"해야 할 일을 보면 몸이 먼저 무겁고 그래도 밀어붙이려 할 때", proof:"쉬어도 회복이 안 되는지, 쉬는 동안에도 머릿속으로 일을 계속했는지 나눠봐.", metric:"7일 동안 해야 할 일 하나를 실제로 빼고 수면·피로 변화를 기록하기" },
    "mental.overthink":{ cue:"같은 생각을 여러 번 돌리는데 새 정보는 더 생기지 않을 때", proof:"생각 횟수와 실제 확인 행동 횟수를 비교하면 패턴이 보여.", metric:"생각거리 하나를 행동·보류·내 일 아님 셋 중 하나로 분류하기" },
    "mental.low":{ cue:"해야 하는 건 아는데 시작 버튼을 누르는 것부터 버거울 때", proof:"큰 목표를 잡은 날보다 생활 리듬 하나를 지킨 날 컨디션이 나았는지 봐.", metric:"기상·식사·걷기 중 하나만 같은 시간에 7일 고정하기" },
    "mental.recover":{ cue:"하루 괜찮아지면 밀린 걸 한꺼번에 하고 싶어질 때", proof:"좋은 날 활동량을 확 올린 뒤 다음날 다시 꺼진 적이 있는지 확인해.", metric:"좋은 날에도 활동량을 평소보다 20% 이상 갑자기 올리지 않기" },
  };

  const FIT_CONTEXT = {
    money:{head:"돈에서는 ‘많이 버는 사람’보다 네 판단이 흔들리지 않는 구조가 중요해.", good:"수입·지출 기준이 보이고 결정 전에 확인할 수 있는 구조", bad:"감정·비교·주변 분위기에 따라 기준이 자주 바뀌는 구조"},
    career:{head:"일에서는 직함보다 네 힘이 결과로 연결되는 방식이 맞아야 오래 가.", good:"역할·평가·보상이 말이 아니라 기준으로 보이는 환경", bad:"책임은 늘어나는데 기준과 피드백은 계속 바뀌는 환경"},
    love:{head:"연애에서는 설렘보다 네 자동반응을 덜 소모시키는 사람이 오래 맞아.", good:"말과 행동이 일관되고 불편함을 말해도 조정이 가능한 사람", bad:"확신은 안 주면서 네 반응만 계속 확인하게 만드는 관계"},
    path:{head:"적성은 직업명보다 어떤 방식으로 일할 때 네 강점이 오래 남는지로 봐야 해.", good:"작게 시험하고 수정하면서 결과를 확인할 수 있는 방식", bad:"정답을 미리 정해놓고 네 방식과 속도를 계속 막는 환경"},
    people:{head:"관계는 좋은 사람/나쁜 사람보다 네 경계를 말했을 때의 반응이 더 정확한 기준이야.", good:"작은 선을 말했을 때 방어보다 조정이 먼저 나오는 사람", bad:"네 경계를 예민함으로 돌리고 같은 선을 반복해서 넘는 사람"},
    mental:{head:"회복은 의지보다 네 과부하가 덜 생기는 환경을 만드는 게 먼저야.", good:"혼자 정리할 여백과 반복 가능한 생활 리듬이 있는 환경", bad:"쉬는 시간까지 성과·눈치·연락으로 채워지는 환경"},
  };

  const ELEMENT_LABEL = { mok:"목", hwa:"화", to:"토", geum:"금", su:"수" };
  const ELEMENT_ORDER = ["mok","hwa","to","geum","su"];
  const STRUCTURE_CLUSTER = {
    "정관격":"responsibility","편관격":"intensity","정재격":"stability","편재격":"expansion",
    "식신격":"stability","상관격":"expression","정인격":"analysis","편인격":"analysis",
    "건록격":"boundary","양인격":"intensity","겁재격":"comparison","평격":"stability",
  };

  function stableHash(value) {
    const s=JSON.stringify(value);
    let h=2166136261;
    for(let i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619); }
    return (h>>>0).toString(16).padStart(8,"0");
  }

  function addClassicalSignal(list, cluster, weight, source, detail, role="support") {
    if(!cluster || !Number.isFinite(Number(weight)) || Number(weight)<=0) return;
    list.push({cluster,weight:Number(weight),source,detail,role});
  }

  function elementCluster(key) {
    return ELEMENT_CLUSTER[key] || null;
  }

  function godCluster(god) {
    return GOD_CLUSTER[god] || null;
  }

  function structureHuman(s) {
    const map={
      "정관격":"기준과 책임을 지키며 결과를 만드는 힘",
      "편관격":"압박이 와도 돌파하려는 힘",
      "정재격":"관리하고 안정적으로 쌓는 힘",
      "편재격":"기회와 사람, 돈의 흐름을 넓게 보는 힘",
      "식신격":"꾸준히 만들고 생활 리듬으로 이어가는 힘",
      "상관격":"답답한 걸 바꾸고 표현하는 힘",
      "정인격":"배우고 정리해 안정시키는 힘",
      "편인격":"남들이 지나치는 걸 깊게 파고드는 힘",
      "건록격":"내 기준과 독립성을 지키는 힘",
      "양인격":"결단하고 밀어붙이는 힘",
      "겁재격":"경쟁 속에서 내 몫을 확보하는 힘",
      "평격":"한 가지 방식보다 여러 힘을 같이 쓰는 쪽",
    };
    return map[s?.gyeokName] || "한 가지 반응만으로 설명하기 어려운 쪽";
  }

  function statusHumanLine(s) {
    if(s?.status==="성격") return "이 중심 힘을 받쳐주는 신호가 실제로 이어져서, 평소엔 자기 방식이 비교적 일관되게 나오는 편";
    if(s?.status==="성중유패") return "잘되는 방식과 그걸 흐트러뜨리는 신호가 같이 있어서, 같은 사람 안에서도 잘 풀릴 때와 꼬일 때 차이가 커질 수 있는 편";
    if(s?.status==="파격") return "원래 잘 쓰는 방식이 압박받는 신호가 같이 있어서, 익숙한 방식이 안 먹히는 순간 반응이 달라지기 쉬운 편";
    return "한쪽 신호가 압도적이라기보다 상황에 따라 여러 반응이 번갈아 나오는 편";
  }

  function strengthHumanLine(p) {
    const r=Number(p?.strength?.supportRatio);
    if(p?.strength?.verdict==="신약") {
      return r<=0.30
        ? "안에서 버티는 힘보다 밖으로 빠져나가는 힘이 훨씬 커서, 오래 참는 것 자체가 손실이 되기 쉬워"
        : "안에서 받치는 힘보다 밖으로 쓰이는 힘이 더 커서, 책임·감정·성과를 오래 들고 있으면 뒤에서 피로가 몰리기 쉬워";
    }
    if(p?.strength?.verdict==="신강") {
      return r>=0.70
        ? "스스로 버티고 밀어붙이는 힘이 아주 강해서, 멈춰야 할 때도 의지로 더 가는 쪽이 먼저 나올 수 있어"
        : "스스로 버티고 밀어붙이는 힘이 충분해서, 문제를 알아도 일단 내가 처리하고 보려는 쪽이 먼저 나와";
    }
    return "받치는 힘과 밖으로 쓰이는 힘이 크게 한쪽으로 쏠리지 않아, 상황에 따라 밀 때와 멈출 때가 달라지는 편이야";
  }

  function climateHumanLine(p) {
    const reasons=p?.balance?.climateReasons||[];
    if(!reasons.length) return "계절 때문에 한쪽을 강하게 보정해야 하는 사주는 아니라서, 성급하게 한 방향만 밀 필요는 없어";
    const s=reasons.join(" ");
    if(s.includes("겨울")) return "차갑게 굳거나 생각만 길어지기 쉬운 계절 조건이라, 실제 행동·표현·온기를 더해줄수록 흐름이 풀려";
    if(s.includes("여름")) return "열이 과해 속도와 반응이 빨라지기 쉬운 계절 조건이라, 한 박자 식히고 확인하는 과정이 중요해";
    if(s.includes("건조")) return "메마르고 끊어지기 쉬운 쪽을 보완해야 해서, 너무 빨리 잘라내기보다 여유와 연결을 남기는 게 중요해";
    if(s.includes("습기")) return "머물고 늘어지는 힘을 덜어야 해서, 생각보다 실행 시점을 분명히 잡는 게 중요해";
    return "계절 조건까지 같이 보면 한쪽으로 몰기보다 보완 순서를 지키는 게 중요해";
  }

  function bridgeHumanLine(p) {
    const b=p?.balance?.bridge;
    if(!b) return "";
    return "서로 맞부딪히는 힘 사이에 중간 단계가 필요한 사주라, 바로 결론내리기보다 한 번 시험하고 반응을 본 뒤 확정하는 순서가 더 잘 맞아";
  }

  function buildClassicalFusion(profile) {
    const supports=[], frictions=[];
    const s=profile?.structure||{};
    const strength=profile?.strength||{};
    const balance=profile?.balance||{};
    const counts=profile?.sipsin?.counts||{};

    const structureCluster=godCluster(s.gyeokSipsin) || STRUCTURE_CLUSTER[s.gyeokName] || "stability";
    addClassicalSignal(supports,structureCluster,3.4,"자평진전·중심 구조",s.gyeokName||"평격");

    if(s.sangsin) addClassicalSignal(supports,godCluster(s.sangsin),2.4,"자평진전·도움 신호",s.sangsin);
    if(s.gisin) addClassicalSignal(frictions,godCluster(s.gisin),2.4,"자평진전·방해 신호",s.gisin,"friction");

    if(s.status==="성중유패") addClassicalSignal(supports,"reversal",2.0,"자평진전·성패","도움과 방해가 함께 드러남");
    if(s.status==="파격") addClassicalSignal(supports,"sensitivity",1.9,"자평진전·성패","중심 흐름을 방해하는 신호가 드러남");
    if(s.status==="성격") addClassicalSignal(supports,structureCluster,1.4,"자평진전·성패","중심 흐름이 비교적 이어짐");
    if(s.flow==="역용") addClassicalSignal(supports,"boundary",1.1,"자평진전·운용","그대로 밀기보다 조절이 필요한 흐름");
    if(s.flow==="복합") addClassicalSignal(supports,"mismatch",1.2,"자평진전·운용","살릴 힘과 누를 힘이 함께 있음");
    if(s.touchul) addClassicalSignal(supports,"expression",0.9,"자평진전·투출","안의 기준이 밖 행동으로 드러남");
    else addClassicalSignal(supports,"analysis",0.7,"자평진전·투출","안의 기준이 바로 밖으로 드러나지 않음");
    if((s.candidateCount||0)>=3) addClassicalSignal(supports,"mismatch",0.8,"자평진전·후보","중심 후보가 여러 개 겹침");

    if(strength.code==="push") addClassicalSignal(supports,"intensity",3.0,"적천수·기세","스스로 버티고 미는 힘");
    if(strength.code==="sensitive") addClassicalSignal(supports,"sensitivity",3.0,"적천수·기세","밖으로 쓰이는 힘이 더 큰 흐름");
    if(strength.code==="balanced") addClassicalSignal(supports,"stability",1.8,"적천수·기세","받침과 소모가 비교적 균형");

    const ratio=Number(strength.supportRatio);
    if(Number.isFinite(ratio)){
      if(ratio<=0.30) addClassicalSignal(supports,"sensitivity",1.4,"적천수·강약 비율","받침보다 소모가 크게 우세");
      else if(ratio>=0.70) addClassicalSignal(supports,"intensity",1.4,"적천수·강약 비율","받침이 크게 우세");
    }
    const roots=Array.isArray(strength.roots)?strength.roots.length:0;
    if(roots>=2) addClassicalSignal(supports,"stability",1.0,"적천수·뿌리","자기 힘을 받치는 뿌리가 여러 곳");
    if(roots===0) addClassicalSignal(supports,"sensitivity",0.9,"적천수·뿌리","자기 힘을 받치는 뿌리가 약함");

    for(const row of (profile?.sipsin?.all||[])){
      const w=row?.pillar==="month"?0.72:row?.pillar==="day"?0.64:row?.pillar==="hour"?0.55:0.48;
      addClassicalSignal(supports,godCluster(row?.value),w,"십신·위치",(row?.pillar||"")+" "+(row?.position||"")+" "+(row?.value||""));
    }
    for(const [god,count] of Object.entries(counts)){
      if(Number(count)>1) addClassicalSignal(supports,godCluster(god),Math.min(1.2,Number(count)*0.28),"십신·반복",god+" "+count);
    }

    const influence=profile?.elements?.influence||{};
    const total=ELEMENT_ORDER.reduce((a,k)=>a+Number(influence[k]||0),0)||1;
    for(const key of ELEMENT_ORDER){
      const share=Number(influence[key]||0)/total;
      if(share>0) addClassicalSignal(supports,elementCluster(key),Math.min(1.25,0.25+share*2.1),"적천수·오행 기세",key+" "+share.toFixed(3));
    }
    if(profile?.elements?.rawVsInfluenceMismatch) addClassicalSignal(supports,"mismatch",1.8,"적천수·겉과 실제 기세","겉개수와 실제 세력 순위가 다름");

    for(const key of ELEMENT_ORDER){
      for(const row of (balance.detail?.[key]||[])){
        if(row?.layer==="조후" && Number(row.value)>0) addClassicalSignal(supports,elementCluster(key),1.6+Math.min(0.8,Number(row.value)/3),"궁통보감·계절 보정",row.reason||key);
        if(row?.layer==="과다" && Number(row.value)<0) addClassicalSignal(frictions,elementCluster(key),1.4,"오행 과다",row.reason||key,"friction");
      }
    }

    addClassicalSignal(supports,elementCluster(balance.primary),2.2,"용신·1순위 보완",balance.primary||"");
    addClassicalSignal(supports,elementCluster(balance.secondary),1.3,"용신·2순위 보완",balance.secondary||"");
    addClassicalSignal(frictions,elementCluster(balance.avoid),1.8,"용신·과용 주의",balance.avoid||"","friction");
    if(balance.bridge) addClassicalSignal(supports,"analysis",0.9,"통관·중간 연결",balance.bridge.bridge||"");

    if(profile?.relations?.hasClash) addClassicalSignal(supports,"reversal",2.1,"관계 충돌","기둥 사이 충돌");

    const weak=profile?.behavior?.weakStat;
    if(weak==="mental") addClassicalSignal(supports,"sensitivity",1.2,"생활 수치·취약축","마음");
    if(weak==="drive") addClassicalSignal(supports,"analysis",1.2,"생활 수치·취약축","실행");
    if(weak==="wealth") addClassicalSignal(supports,"stability",1.1,"생활 수치·취약축","돈");
    if(weak==="network") addClassicalSignal(supports,"boundary",1.1,"생활 수치·취약축","관계");

    const sourceCoverage={
      japyeong:!!(s.gyeokName||s.status||s.sangsin||s.gisin),
      jeokcheon:!!strength.verdict && Object.keys(influence).length>0,
      qiongtong:Array.isArray(balance.climateReasons),
      yongshin:!!balance.primary && !!balance.secondary && !!balance.avoid,
      sipsin:Object.keys(counts).length>0 || (profile?.sipsin?.all||[]).length>0,
      relations:typeof profile?.relations?.hasClash==="boolean",
      timing:Object.keys(profile?.timing?.raw||{}).length>0,
    };
    const frictionRank=[...frictions].sort((a,b)=>b.weight-a.weight);
    return {
      supports,
      frictions,
      topFriction:frictionRank[0]||null,
      sourceCoverage,
      structureLine:structureHuman(s),
      statusLine:statusHumanLine(s),
      strengthLine:strengthHumanLine(profile),
      climateLine:climateHumanLine(profile),
      bridgeLine:bridgeHumanLine(profile),
      fingerprint:stableHash({
        structure:{gyeokName:s.gyeokName,gyeokSipsin:s.gyeokSipsin,status:s.status,flow:s.flow,sangsin:s.sangsin,gisin:s.gisin,touchul:s.touchul,candidates:s.candidates},
        strength:{verdict:strength.verdict,ratio:strength.supportRatio,forces:[strength.supportForce,strength.drainForce],roots:strength.roots},
        sipsin:{all:profile?.sipsin?.all,counts},
        influence,
        balance:{primary:balance.primary,secondary:balance.secondary,avoid:balance.avoid,scores:balance.scores,detail:balance.detail,bridge:balance.bridge,climateReasons:balance.climateReasons},
        clash:profile?.relations?.hasClash,
        weak,
      }),
    };
  }

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
    const fusion=buildClassicalFusion(profile || {});
    return fusion.supports.map(x=>({
      cluster:x.cluster,
      weight:x.weight,
      source:x.source,
      detail:x.detail,
    }));
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
    if (sources.size >= 3 && row.score >= 5.2) return "high";
    if (sources.size >= 2 && row.score >= 3.8) return "high";
    if (sources.size >= 2 || row.score >= 3.1) return "medium";
    return "soft";
  }

  function detailFor(situation) {
    return SITUATION_DETAIL[situation.concern+"."+situation.key] || {
      cue:situation.scene,
      proof:"비슷한 장면 하나를 떠올려 첫 반응과 마지막 행동이 어떻게 달랐는지 확인해.",
      metric:"7일 동안 같은 장면이 오면 첫 반응과 실제 행동을 한 줄씩 적기",
    };
  }

  function pairPattern(primary, secondary) {
    const a=primary, b=secondary;
    const has=(x,y)=>(a===x&&b===y)||(a===y&&b===x);
    if (has("analysis","sensitivity")) return "작은 변화를 빨리 감지한 뒤 이유를 여러 개 만들고, 직접 확인은 가장 늦어지는 순서";
    if (has("responsibility","reversal")) return "내 몫부터 더 들고 버티다가 한계가 오면 설명보다 큰 결론이 먼저 나오는 순서";
    if (has("intensity","reversal")) return "버틸 수 있을 때까지 세게 밀고, 한계를 넘으면 방향을 크게 바꾸는 순서";
    if (has("boundary","reversal")) return "선을 바로 말하기보다 지켜보다가 반복되면 관계나 선택을 크게 정리하는 순서";
    if (has("expansion","analysis")) return "가능성을 많이 열어둔 뒤 비교가 길어져 마지막 선택이 늦어지는 순서";
    if (has("expansion","stability")) return "새 기회에는 끌리지만 안전한 기반도 놓치기 싫어 시작과 유지 사이에서 흔들리는 순서";
    if (has("expression","sensitivity")) return "작은 변화를 빨리 느끼지만 바로 말하지 못하면 나중에 표현 강도가 커지는 순서";
    if (has("expression","boundary")) return "기준이 분명해서 참을 때는 조용하지만 말할 때는 핵심을 한 번에 꺼내는 순서";
    if (has("comparison","intensity")) return "비교 신호가 들어오면 목표치를 올리고 몸이나 마음이 따라오지 않아도 속도를 더 내는 순서";
    if (has("comparison","analysis")) return "남의 속도를 본 뒤 내 선택을 다시 검토하면서 원래 계획까지 의심하는 순서";
    if (has("stability","responsibility")) return "익숙한 역할을 끝까지 지키려다 바꿔야 할 시점까지 오래 버티는 순서";
    if (has("mismatch","responsibility")) return "겉으로는 잘 해내서 계속 맡지만 실제 소모는 뒤늦게 한꺼번에 드러나는 순서";
    if (has("mismatch","sensitivity")) return "겉으로는 담담하게 처리하면서 안쪽에서는 작은 신호를 계속 받아들이는 순서";
    const x=CLUSTER_ATOM[a] || CLUSTER_ATOM.analysis;
    const y=CLUSTER_ATOM[b] || CLUSTER_ATOM.stability;
    return x.first+"고, 이어서 "+y.second+"는 순서";
  }

  function strengthModifier(profile) {
    const code=profile?.strength?.code;
    if (code==="push") return "게다가 힘들다고 바로 멈추는 편이 아니라서, 문제를 알아도 ‘조금만 더’가 붙기 쉬워.";
    if (code==="sensitive") return "게다가 주변 반응이 바뀌면 네 판단 속도도 같이 흔들릴 수 있어서, 첫 느낌과 최종 결론 사이가 길어질 수 있어.";
    return "기본적으로 한쪽으로 확 기울기보다 여러 조건을 같이 보려 해서, 애매한 상황일수록 결론이 늦어질 수 있어.";
  }

  function structureModifier(profile) {
    if (profile?.relations?.hasClash) return "변수가 두세 개 겹치는 날에는 평소보다 결론 폭이 커질 수 있어.";
    if (profile?.structure?.status==="성중유패") return "평소엔 잘 굴러가던 방식도 특정 지점에서 한 번에 뒤집히는 구간이 생길 수 있어.";
    if (profile?.structure?.status==="파격") return "익숙한 방식이 통하지 않는 장면에서 소모가 갑자기 커지는 편이야.";
    return "큰 사건 하나보다 작은 패턴이 반복될 때 네 선택이 더 선명하게 드러나는 편이야.";
  }

  function buildConcernDiagnosisV2(data) {
    const profile = data?.integratedSajuProfile || (typeof global.buildIntegratedSajuProfile === "function" ? global.buildIntegratedSajuProfile(data || {}) : null);
    if (data && profile) data.integratedSajuProfile = profile;
    const situation = situationFor(data || {});
    const detail = detailFor(situation);
    const classical = buildClassicalFusion(profile || {});
    const evidence = classical.supports.map(x=>({cluster:x.cluster,weight:x.weight,source:x.source,detail:x.detail}));
    const ranked = rankClusters(evidence);
    const primary = ranked[0] || {cluster:"analysis",score:0,evidence:[]};
    const secondary = ranked.find(x=>x.cluster !== primary.cluster) || {cluster:"stability",score:0,evidence:[]};
    const sourceCount = new Set([...(primary.evidence||[]),...(secondary.evidence||[])].map(x=>x.source)).size;
    const fingerprint = [
      profile?.fingerprint || "no-profile",
      situation.concern,
      situation.key,
      primary.cluster,
      secondary.cluster,
      profile?.strength?.code || "",
      profile?.structure?.status || "",
      profile?.elements?.influenceRank?.strongest || "",
      profile?.elements?.influenceRank?.weakest || "",
      profile?.behavior?.weakStat || "",
      profile?.relations?.hasClash ? "clash" : "steady",
      profile?.elements?.rawVsInfluenceMismatch ? "mismatch" : "aligned",
      primary.evidence.map(x=>x.source+":"+x.detail).join(","),
      secondary.evidence.map(x=>x.source+":"+x.detail).join(","),
    ].join("|");
    const diagnosis = {
      version: VERSION,
      fingerprint,
      situation,
      detail,
      profile,
      classical,
      evidence,
      ranked,
      primary:{...primary, confidence:confidence(primary)},
      secondary:{...secondary, confidence:confidence(secondary)},
      sourceCount,
      pairPattern:pairPattern(primary.cluster,secondary.cluster),
      actionElement: profile?.balance?.primary || "to",
      secondaryElement: profile?.balance?.secondary || profile?.balance?.primary || "to",
      avoidElement: profile?.balance?.avoid || "su",
    };
    diagnosis.classicalFingerprint=classical.fingerprint;
    diagnosis.classicalSources=classical.sourceCoverage;
    diagnosis.topFriction=classical.topFriction;
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
    if (idx===0) return isT ? s.label+" — 먼저 봐야 할 반응은 이거야" : s.label+" — 언니는 네 이 반응부터 볼래";
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

  function frictionSentence(d, isT) {
    const f=d.classical?.topFriction;
    if(!f) return "";
    const a=CLUSTER_ATOM[f.cluster] || CLUSTER_ATOM.analysis;
    return isT
      ? "반대로 이 흐름이 꼬일 때는 "+a.after+". 이건 의지 문제가 아니라 네 사주에서 과하게 쓰면 손실이 커지는 쪽이야."
      : "반대로 이 흐름이 꼬일 때는 "+a.after+". 언니는 이걸 네 성격 탓으로 안 볼래. 네 사주에서 이쪽을 과하게 쓰면 유독 손실이 커지는 거야.";
  }

  function classicalCoreLine(d,isT) {
    const c=d.classical||{};
    const bridge=c.bridgeLine ? " "+c.bridgeLine+"." : "";
    return isT
      ? c.structureLine+"이 중심이고, "+c.statusLine+". "+c.strengthLine+"."
      : "네 사주 바닥에는 "+c.structureLine+"이 깔려 있어. 그런데 "+c.statusLine+"이고, "+c.strengthLine+"."+bridge;
  }

  function portraitNote(d,isT) {
    const p=CLUSTER_ATOM[d.primary.cluster] || CLUSTER_ATOM.analysis;
    const q=CLUSTER_ATOM[d.secondary.cluster] || CLUSTER_ATOM.stability;
    const lead=certaintyLead(d.primary,isT);
    if(isT){
      return lead+" 특히 <b>"+d.detail.cue+"</b>, "+p.first+". 그다음 "+q.second+". <br><br>"+classicalCoreLine(d,true)+" 그래서 실제 반복 순서는 <b>"+d.pairPattern+"</b> 쪽으로 굳기 쉬워.";
    }
    return lead+" 특히 <b>"+d.detail.cue+"</b> 있지. 그럴 때 너는 "+p.first+". 그러고 나면 "+q.second+".<br><br>"+classicalCoreLine(d,false)+" 그래서 언니가 제일 중요하게 보는 건 <b>"+d.pairPattern+"</b>이야.";
  }

  function behaviorChain(d, isT) {
    const p=CLUSTER_ATOM[d.primary.cluster] || CLUSTER_ATOM.analysis;
    const q=CLUSTER_ATOM[d.secondary.cluster] || CLUSTER_ATOM.stability;
    const s=d.situation;
    const status=d.classical?.statusLine || "";
    if (isT) {
      return "<b>시작</b> — "+d.detail.cue+".<br><br><b>첫 반응</b> — "+p.first+".<br><br><b>그다음</b> — "+q.second+".<br><br><b>밖으로 보이는 행동</b> — "+p.visible+".<br><br><b>결국</b> — "+p.after+". "+status+". 그래서 "+s.object+" 자체보다 이 순서를 먼저 끊어야 해.";
    }
    return "보통 <b>"+d.detail.cue+"</b> 시작돼. 그때는 "+p.first+".<br><br>그리고 <b>그다음</b> "+q.second+". 그래서 밖에서는 "+p.visible+"처럼 보여도, 안에서는 이미 판단이 꽤 진행된 뒤일 수 있어.<br><br><b>결국</b> "+p.after+". "+status+". 언니는 결과가 터진 뒤보다 이 첫 장면을 먼저 잡고 싶어.";
  }

  function blindSpot(d, isT) {
    const p=CLUSTER_ATOM[d.primary.cluster] || CLUSTER_ATOM.analysis;
    const mismatch = d.profile?.elements?.rawVsInfluenceMismatch;
    const touchul = d.profile?.structure?.touchul;
    const friction=frictionSentence(d,isT);
    if (isT) {
      return "겉으로만 보면 <b>"+p.misread+"</b>처럼 보일 수 있어. 그런데 실제 핵심은 <b>"+d.pairPattern+"</b>이 반복된다는 거야. "+(mismatch?"겉으로 드러난 모습과 실제 힘의 중심도 달라서 원인을 잘못 잡기 쉬워. ":"겉과 실제 힘의 방향은 크게 다르지 않아. 핵심은 아는 것보다 끊는 시점이 늦는 쪽이야. ")+(touchul?"속 기준은 행동으로 비교적 빨리 나오는 편이야. ":"속에서 판단한 뒤 행동까지 간격이 생기는 편이야. ")+" "+friction;
    }
    return "남들이 보면 네가 <b>"+p.misread+"</b>처럼 느껴질 수도 있어. 근데 언니는 그렇게 단순하게 안 볼래. 실제로는 <b>"+d.pairPattern+"</b>이 겹쳐서 그렇게 보이는 거야. "+(mismatch?"게다가 겉으로 보이는 모습과 실제 힘의 중심이 달라서, 너도 원인을 엉뚱한 데서 찾기 쉬워. ":"겉과 실제 힘의 방향은 크게 다르지 않아서, 문제를 모르는 것보다 끊어야 할 순간을 늦게 잡는 쪽에 가까워. ")+(touchul?"마음먹으면 밖으로 옮기는 속도는 비교적 빠른 편이야. ":"그래서 중간 확인 지점을 일부러 만드는 게 중요해. ")+" "+friction;
  }

  function actionNote(d, isT) {
    const s=d.situation;
    const first=ACTION_BY_ELEMENT[d.actionElement] || ACTION_BY_ELEMENT.to;
    const second=ACTION_BY_ELEMENT[d.secondaryElement] || first;
    const avoid=AVOID_BY_ELEMENT[d.avoidElement] || AVOID_BY_ELEMENT.su;
    const weak=d.profile?.behavior?.weakStat;
    const guard=weak==="mental" ? "피로가 올라간 날은 결정 수를 줄여" :
      weak==="drive" ? "생각만 한 날은 완료로 치지 말고 밖에 낸 행동만 세" :
      weak==="wealth" ? "느낌 대신 금액·시간·횟수 중 하나를 숫자로 남겨" :
      weak==="network" ? "혼자 정리하기 전에 필요한 도움 하나를 구체적으로 요청해" :
      "한 번에 변수 하나만 바꾸고 결과를 봐";
    const climate=d.classical?.climateLine || "";
    const bridge=d.classical?.bridgeLine || "";
    if (isT) {
      return "<b>오늘</b> — "+s.move+".<br><br><b>이번 7일</b> — "+d.detail.metric+".<br><br><b>순서</b> — 먼저 "+first+", 그다음 "+second+". "+climate+". "+(bridge?bridge+". ":"")+"<br><br><b>피할 것</b> — "+avoid+". 그리고 "+guard+".";
    }
    return "<b>오늘 먼저</b> — "+s.move+".<br><br><b>이번 7일</b> — "+d.detail.metric+". 이것만 해보자.<br><br>너한테는 먼저 <b>"+first+"</b>을 넣고, 그다음 <b>"+second+"</b>을 붙이는 순서가 맞아. "+climate+". "+(bridge?bridge+". ":"")+"<br><br>이번 주엔 <b>"+avoid+"</b>은 줄이고, "+guard+".";
  }

  function domainFit(d, isT) {
    const c=d.situation.concern;
    const p=CLUSTER_ATOM[d.primary.cluster] || CLUSTER_ATOM.analysis;
    const q=CLUSTER_ATOM[d.secondary.cluster] || CLUSTER_ATOM.stability;
    const ctx=FIT_CONTEXT[c] || FIT_CONTEXT.money;
    const action=ACTION_BY_ELEMENT[d.actionElement] || ACTION_BY_ELEMENT.to;
    const avoid=AVOID_BY_ELEMENT[d.avoidElement] || AVOID_BY_ELEMENT.su;
    const friction=d.classical?.topFriction ? (CLUSTER_ATOM[d.classical.topFriction.cluster] || CLUSTER_ATOM.analysis) : null;
    const good=ctx.good+". 특히 "+p.fit+", 그리고 "+q.fit;
    const bad=ctx.bad+". "+(friction?friction.drain:p.drain);
    if (isT) {
      return ctx.head+"<br><br><b>잘 맞는 쪽</b> — "+good+".<br><br><b>피할 쪽</b> — "+bad+".<br><br><b>판별법</b> — 그 환경에서 "+action+"이 가능한지 봐. 반대로 "+avoid+"을 계속 하게 만든다면 오래 맞는 구조가 아니야.";
    }
    return ctx.head+"<br><br><b>너를 살리는 쪽</b> — "+good+".<br><br><b>오래 있으면 지치는 쪽</b> — "+bad+".<br><br>언니가 마지막으로 볼 기준은 그 사람이나 환경 옆에서 <b>"+action+"</b>이 자연스럽게 되느냐야. 반대로 "+avoid+"만 반복된다면 더 버티는 게 답은 아닐 수 있어.";
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
      desc:portraitNote(d,isT),
      checklist:isT ? "검증: "+d.detail.proof : "언니가 말한 게 맞는지 확인해보자. "+d.detail.proof,
    };
    const note2 = {
      badge:badgeFor(c,1),
      title:noteTitle(d,1,isT),
      desc:behaviorChain(d,isT),
      checklist:isT ? "체크 기준: "+d.detail.metric+"." : "다음에 비슷한 장면이 오면 결과보다 시작점을 보자. "+d.detail.metric+".",
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
    notes.forEach((note,idx)=>{ note.themeNum=String(idx+1).padStart(2,"0"); });
    if (data && typeof data==="object") {
      data.noteV2Audit={
        version:VERSION,
        fingerprint:d.fingerprint,
        primary:{cluster:p.cluster,confidence:p.confidence,evidence:p.evidence.map(x=>({source:x.source,detail:x.detail}))},
        secondary:{cluster:q.cluster,confidence:q.confidence,evidence:q.evidence.map(x=>({source:x.source,detail:x.detail}))},
        sourceCount:d.sourceCount,
        pairPattern:d.pairPattern,
        classicalFusion:{
          fingerprint:d.classicalFingerprint,
          sources:d.classicalSources,
          signalCount:d.classical?.supports?.length || 0,
          frictionCount:d.classical?.frictions?.length || 0,
          topFriction:d.classical?.topFriction ? {cluster:d.classical.topFriction.cluster,source:d.classical.topFriction.source} : null,
        },
        situation:d.situation.key,
        specificity:{cue:d.detail.cue,metric:d.detail.metric},
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
