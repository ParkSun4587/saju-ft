(function (global) {
  "use strict";

  const VERSION = "3.0.0";
  const CONCERNS = ["money","career","love","path","people","mental"];

  const SITUATIONS = {
    money: {
      saving:{label:"돈이 잘 안 모여",object:"지출과 저축",cue:"돈을 써도 되는지 말아야 하는지 흔들리는 순간",move:"돈이 새는 장면 하나를 잡아 기준을 고정하기",metric:"계획 밖 지출 횟수와 그 직전 이유를 7일만 적기"},
      income:{label:"수입을 더 늘리고 싶어",object:"수입과 보상",cue:"내가 한 일의 값이나 보상을 요구해야 하는 순간",move:"성과 하나를 실제 가격·연봉·조건으로 바꿔 말하기",metric:"내 성과를 숫자 하나와 요구 조건 하나로 바꿔 말해보기"},
      side:{label:"부업·새 수입을 만들고 싶어",object:"새 수입원",cue:"새 아이디어를 실제 돈으로 시험해야 하는 순간",move:"작은 제안 하나에 가격을 붙여 실제 반응 보기",metric:"7일 안에 유료 제안 또는 실제 반응을 받는 테스트 1회"},
      flow:{label:"앞으로 돈 흐름이 궁금해",object:"앞으로의 돈 흐름",cue:"좋은 시기를 기다리면서 무엇을 할지 정해야 하는 순간",move:"좋은 구간에 할 돈 행동 하나를 미리 정하기",metric:"다음 기회가 오면 바로 할 행동 하나를 미리 완료 상태로 만들기"},
    },
    career: {
      exam:{label:"시험·합격이 궁금해",object:"시험과 합격",cue:"점수와 합격 가능성을 확인받는 순간",move:"실전 점수와 오답 패턴으로 공부법 하나만 남기기",metric:"7일 동안 공부법은 고정하고 오답 원인만 세 가지로 분류하기"},
      jobsearch:{label:"취업이 잘 될지 궁금해",object:"취업과 지원",cue:"내 실력을 밖에 보여주고 평가받아야 하는 순간",move:"지원·포트폴리오·면접 중 하나를 실제 외부 반응으로 바꾸기",metric:"지원·제출·면접 연습 중 외부 반응을 받는 행동 2회"},
      move:{label:"이직·퇴사가 고민돼",object:"이직과 퇴사",cue:"지금 자리를 버틸지 옮길지 결론내야 하는 순간",move:"감정과 조건을 분리해 옮길 기준 세 가지를 적기",metric:"이직 기준 3개를 숫자·조건으로 적고 현재 직장과 비교하기"},
      current:{label:"지금 직장이 너무 답답해",object:"현재 직장",cue:"일은 계속하는데 보상·역할·사람 중 하나가 답답하게 쌓이는 순간",move:"역할·보상·업무량 중 바꿀 수 있는 한 가지를 직접 말하기",metric:"바꿀 수 있는 조건 하나를 문장으로 만들어 실제로 요청하기"},
    },
    love: {
      crush:{label:"썸·짝사랑 중이야",object:"썸과 상대 마음",cue:"상대 반응이 애매해서 마음을 확인하고 싶은 순간",move:"추측 하나를 질문이나 만남 같은 실제 반응으로 바꾸기",metric:"추측 하나를 질문·만남 제안 같은 실제 확인으로 바꾸기"},
      relationship:{label:"지금 연애 중이야",object:"현재 연애",cue:"연락·표현·약속에서 작은 서운함이 생기는 순간",move:"서운한 장면 하나를 감정이 커지기 전에 짧게 말하기",metric:"서운함 하나를 24시간 안에 한 문장으로 말하기"},
      breakup:{label:"이별·재회가 궁금해",object:"이별과 재회",cue:"헤어진 이유와 다시 만날 가능성을 계속 생각하게 되는 순간",move:"그 사람의 말보다 헤어진 원인이 실제로 바뀌었는지 확인하기",metric:"재회 판단 기준을 말이 아니라 행동 변화 세 가지로 정하기"},
      new:{label:"새 인연이 들어올까",object:"새 인연",cue:"새 사람을 만나도 마음을 열지 말지 재는 순간",move:"조건보다 실제로 편안하고 일관된 반응인지 두세 번 확인하기",metric:"호감보다 일관된 행동을 세 번 확인한 뒤 다음 판단하기"},
    },
    path: {
      lost:{label:"뭘 해야 할지 모르겠어",object:"진로 선택",cue:"선택지는 있는데 어느 쪽이 내 길인지 확신이 안 드는 순간",move:"가장 궁금한 선택지 하나를 짧은 실제 경험으로 바꾸기",metric:"가장 궁금한 선택지 하나를 2시간 이상 실제 경험으로 바꾸기"},
      current:{label:"지금 길이 나한테 맞나",object:"현재 진로",cue:"하고 있는 일이 맞는지 계속 의심되는 순간",move:"지금 일에서 잘되는 부분과 소모되는 부분을 따로 기록하기",metric:"잘되는 장면 3개와 소모되는 장면 3개를 분리해서 기록하기"},
      switch:{label:"아예 다른 길로 갈까",object:"진로 전향",cue:"기존 경력을 버리고 새 방향으로 틀고 싶은 순간",move:"완전 전환 전에 새 방향을 작게 병행해 반응 보기",metric:"전환 전 새 방향을 작은 프로젝트나 체험으로 먼저 검증하기"},
      strength:{label:"내 적성·강점이 궁금해",object:"적성과 강점",cue:"내가 뭘 잘하는지 한마디로 정리하고 싶은 순간",move:"잘하는 방식이 반복해서 나타난 장면 세 개를 모으기",metric:"강점이 드러난 장면 3개에서 공통 행동 하나 뽑기"},
    },
    people: {
      friend:{label:"친구·지인이 힘들어",object:"친구 관계",cue:"친한 사이인데 불편함을 말할지 참을지 고민되는 순간",move:"작은 경계 하나를 말하고 상대 반응 보기",metric:"작은 경계 하나를 말하고 상대 반응을 그대로 기록하기"},
      work:{label:"직장 인간관계가 힘들어",object:"직장 관계",cue:"일 때문에 계속 봐야 하는 사람에게 선을 세워야 하는 순간",move:"감정 대신 역할·업무·연락 기준을 문장으로 정하기",metric:"업무 범위·기한·연락 기준 중 하나를 문장으로 고정하기"},
      family:{label:"가족 때문에 힘들어",object:"가족 관계",cue:"가족이라서 거절하기 어렵고 감정이 오래 남는 순간",move:"바꿀 수 없는 사람보다 내가 허용할 범위를 먼저 정하기",metric:"할 수 있는 범위와 못 하는 범위를 한 문장씩 정하기"},
      distance:{label:"누군가와 거리두고 싶어",object:"거리두기",cue:"관계를 끊어야 할지 조금 멀어져야 할지 재는 순간",move:"연락·만남·도움 중 하나부터 줄여 내 반응 확인하기",metric:"연락·만남·도움 중 하나만 먼저 줄이고 내 반응 보기"},
    },
    mental: {
      burnout:{label:"번아웃 온 것 같아",object:"번아웃",cue:"해야 할 건 많은데 몸과 마음이 더는 따라오지 않는 순간",move:"해야 할 일을 늘리기 전에 부하 하나를 실제로 덜어내기",metric:"7일 동안 해야 할 일 하나를 실제로 빼고 수면·피로 변화를 기록하기"},
      overthink:{label:"생각이 너무 많아",object:"생각 과다",cue:"같은 생각을 반복하면서 결론은 더 안 나는 순간",move:"생각거리 하나를 행동·보류·내 일이 아님으로 나누기",metric:"생각거리 하나를 행동·보류·내 일 아님 셋 중 하나로 분류하기"},
      low:{label:"아무것도 하기 싫어",object:"무기력",cue:"해야 하는 걸 알아도 몸이 먼저 멈추는 순간",move:"성과가 아니라 생활 리듬 하나부터 다시 고정하기",metric:"기상·식사·걷기 중 하나만 같은 시간에 7일 고정하기"},
      recover:{label:"다시 괜찮아지고 싶어",object:"회복",cue:"조금 나아졌지만 예전처럼 움직여도 될지 불안한 순간",move:"괜찮았던 수면·식사·움직임 하나를 반복 일정으로 만들기",metric:"좋은 날에도 활동량을 평소보다 20% 이상 갑자기 올리지 않기"},
    },
  };

  const GROUP_USER = {
    self:{noun:"내 기준과 버티는 힘",pressure:"내 방식과 내 몫을 지키려는 힘",action:"내가 감당할 범위와 기준을 먼저 정하는 것"},
    print:{noun:"받쳐주고 회복시키는 힘",pressure:"더 이해하고 준비해서 안전해지려는 힘",action:"정보·준비·회복 시간을 먼저 확보하는 것"},
    output:{noun:"표현하고 결과물로 빼는 힘",pressure:"생각과 에너지를 밖으로 꺼내야 하는 힘",action:"말·결과물·작은 실행으로 밖에 내보내는 것"},
    wealth:{noun:"현실 결과와 자원을 다루는 힘",pressure:"돈·성과·기회처럼 실제 결과를 챙겨야 하는 힘",action:"조건·금액·시간을 숫자로 확인하는 것"},
    officer:{noun:"기준·책임·평가의 힘",pressure:"책임·평가·규칙처럼 밖에서 들어오는 압박",action:"역할과 책임의 범위를 분명하게 정하는 것"},
    unknown:{noun:"한쪽으로 단정하기 어려운 힘",pressure:"여러 조건이 한꺼번에 작동하는 압박",action:"변수를 하나씩 분리해서 확인하는 것"},
  };

  const ELEMENT_ACTION = {
    mok:"작게 시작해서 실제 반응을 보는 것",
    hwa:"말하거나 보여줘서 반응을 확인하는 것",
    to:"루틴·예산·시간표처럼 반복 가능한 기준을 고정하는 것",
    geum:"조건·숫자·경계선을 분명히 하고 아닌 건 덜어내는 것",
    su:"급히 결론내리지 않고 필요한 정보만 모아 확인하는 것",
  };

  const GYEOK_USER = {
    정관격:"기준과 책임을 지키면서 자리를 만들어가는 힘",
    편관격:"강한 압박을 받아내면서 결과로 바꾸려는 힘",
    정재격:"내 몫과 자원을 안정적으로 관리하는 힘",
    편재격:"기회와 자원의 흐름을 넓게 보고 움직이는 힘",
    식신격:"내가 만든 것을 꾸준히 밖으로 내보내는 힘",
    상관격:"막힌 걸 바꾸고 내 방식으로 표현하는 힘",
    정인격:"이해하고 준비해서 기반을 단단하게 만드는 힘",
    편인격:"남들이 지나치는 걸 깊게 파고드는 힘",
    건록격:"내 힘과 기준을 스스로 세우는 힘",
    양인격:"강한 자기 힘을 결단과 행동으로 쓰는 힘",
    비견격:"내 힘과 기준을 스스로 세우는 힘",
    겁재격:"경쟁 속에서도 내 몫을 확보하려는 힘",
    평격:"한 가지 힘만 밀기보다 여러 조건을 맞춰가는 힘",
  };

  const GOD_USER = {
    비견:"내 기준을 지키는 힘",겁재:"내 몫을 확보하는 힘",
    식신:"꾸준히 만들어내는 힘",상관:"막힌 걸 표현하고 바꾸는 힘",
    정재:"안정적으로 관리하는 힘",편재:"기회와 자원을 넓게 움직이는 힘",
    정관:"기준과 책임을 세우는 힘",편관:"강한 압박을 돌파하는 힘",
    정인:"배우고 보호받아 기반을 세우는 힘",편인:"깊게 파고들어 다른 길을 찾는 힘",
  };

  const DOMAIN = {
    money:{
      name:"돈",
      help:{
        self:"내 몫과 지출 기준을 스스로 정할 수 있는 구조",print:"급하게 벌리기보다 정보를 확인하고 준비할 여유가 있는 구조",
        output:"내가 만든 것이 실제 판매·성과로 연결되는 구조",wealth:"수입·지출·보상이 숫자로 분명하게 보이는 구조",
        officer:"역할과 보상이 계약·규칙으로 정리된 구조",unknown:"돈이 들어오고 나가는 원인을 하나씩 확인할 수 있는 구조",
      },
      harm:{
        self:"비교나 경쟁 때문에 내 기준 없이 버티게 만드는 구조",print:"준비만 계속 늘고 실제 돈의 반응은 확인하지 못하는 구조",
        output:"표현과 시도만 많고 회수 기준이 없는 구조",wealth:"기회·지출·투자를 한꺼번에 늘리게 만드는 구조",
        officer:"책임과 고정비만 늘고 내 선택권은 줄어드는 구조",unknown:"왜 돈이 새는지 확인하기 어려운 구조",
      }
    },
    career:{
      name:"일",
      help:{
        self:"내 역할과 권한이 분명한 환경",print:"배우고 준비한 것이 실제 평가와 성장으로 이어지는 환경",
        output:"결과물을 만들고 보여줄 수 있는 환경",wealth:"성과와 보상이 실제 조건으로 연결되는 환경",
        officer:"책임·평가 기준이 명확한 환경",unknown:"역할과 평가를 단계별로 확인할 수 있는 환경",
      },
      harm:{
        self:"내 방식은 막으면서 책임만 떠넘기는 환경",print:"준비와 검토만 늘고 실행 기회는 주지 않는 환경",
        output:"말하거나 결과물을 내도 계속 막히는 환경",wealth:"성과보다 실적 압박과 조건 변동만 커지는 환경",
        officer:"기준은 계속 바뀌는데 책임만 늘어나는 환경",unknown:"무엇을 잘해야 하는지 기준 자체가 흐린 환경",
      }
    },
    love:{
      name:"연애",
      help:{
        self:"내 경계와 속도를 존중해주는 관계",print:"생각할 여유와 안정감을 주는 관계",
        output:"마음을 말해도 관계가 깨지지 않는 관계",wealth:"말보다 꾸준한 행동으로 관계를 보여주는 사람",
        officer:"약속과 책임을 분명하게 지키는 사람",unknown:"애매함을 오래 끌지 않고 확인할 수 있는 관계",
      },
      harm:{
        self:"누가 이기나 버티게 만드는 관계",print:"해석과 기다림만 늘어나는 관계",
        output:"말할수록 불이익이 생겨 계속 참게 되는 관계",wealth:"관계를 손익과 조건으로만 흔드는 관계",
        officer:"통제와 압박을 사랑처럼 요구하는 관계",unknown:"신호만 주고 설명은 하지 않는 관계",
      }
    },
    path:{
      name:"진로",
      help:{
        self:"내 기준으로 선택하고 책임질 수 있는 방식",print:"배운 것이 다음 선택의 기반으로 남는 방식",
        output:"작게 해보고 결과물로 적성을 확인하는 방식",wealth:"시장 반응과 보상을 실제로 확인할 수 있는 방식",
        officer:"목표와 평가 기준이 분명한 방식",unknown:"작게 시험하고 다음 선택을 좁혀갈 수 있는 방식",
      },
      harm:{
        self:"남의 속도 때문에 내 기준을 잃는 방식",print:"준비만 끝없이 늘리는 방식",
        output:"해볼 기회 없이 생각으로만 적성을 정하는 방식",wealth:"돈 되는 것만 좇아 방향을 계속 바꾸는 방식",
        officer:"정답을 미리 정해놓고 내 선택을 막는 방식",unknown:"무엇이 맞는지 확인할 데이터가 없는 방식",
      }
    },
    people:{
      name:"관계",
      help:{
        self:"선을 말했을 때 존중해주는 사람",print:"생각할 여유와 안정감을 주는 사람",
        output:"불편함을 말해도 대화가 이어지는 사람",wealth:"주고받는 몫이 한쪽으로 기울지 않는 관계",
        officer:"역할과 책임을 서로 분명하게 지키는 관계",unknown:"작은 불편함부터 조정할 수 있는 관계",
      },
      harm:{
        self:"계속 비교·경쟁시키는 관계",print:"생각만 복잡하게 만들고 현실 확인은 막는 관계",
        output:"말을 막고 참게 만드는 관계",wealth:"시간·돈·도움을 계속 가져가기만 하는 관계",
        officer:"규칙과 책임을 일방적으로 요구하는 관계",unknown:"경계가 생길 때마다 설명 없이 밀어붙이는 관계",
      }
    },
    mental:{
      name:"회복",
      help:{
        self:"내 속도와 한계를 지킬 수 있는 환경",print:"잠·식사·생각할 여유처럼 받쳐주는 시간이 있는 환경",
        output:"머릿속 부담을 말·글·움직임으로 빼낼 수 있는 환경",wealth:"생활 자원과 시간을 예측 가능하게 관리할 수 있는 환경",
        officer:"해야 할 일과 쉬어도 되는 시간을 분리할 수 있는 환경",unknown:"한 번에 하나씩 부담을 줄여볼 수 있는 환경",
      },
      harm:{
        self:"쉬어도 계속 버텨야 한다고 몰아붙이는 환경",print:"생각과 준비가 쉬는 시간까지 차지하는 환경",
        output:"감정과 피로를 밖으로 꺼낼 통로가 없는 환경",wealth:"돈·시간·일정 변수가 계속 흔드는 환경",
        officer:"책임과 평가가 끊기지 않는 환경",unknown:"무엇 때문에 지치는지 분리할 수 없는 환경",
      }
    },
  };

  function stripHtml(v) {
    return String(v || "").replace(/<br\s*\/?\s*>/gi," ").replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim();
  }

  function situationFor(data) {
    const concern = CONCERNS.includes(data?.concernKey) ? data.concernKey : "money";
    const map = SITUATIONS[concern] || SITUATIONS.money;
    const key = map[data?.concernSituation] ? data.concernSituation : Object.keys(map)[0];
    return {concern,key,...map[key]};
  }

  function groupText(group) {
    return GROUP_USER[group] || GROUP_USER.unknown;
  }

  function godGroup(god) {
    if (["비견","겁재"].includes(god)) return "self";
    if (["정인","편인"].includes(god)) return "print";
    if (["식신","상관"].includes(god)) return "output";
    if (["정재","편재"].includes(god)) return "wealth";
    if (["정관","편관"].includes(god)) return "officer";
    return "unknown";
  }

  function godsHuman(gods) {
    const rows = (gods || []).map((g) => GOD_USER[g]).filter(Boolean);
    return [...new Set(rows)];
  }

  function firstFinding(reasoning, kind) {
    return reasoning?.ditian?.findings?.find((x) => x.kind === kind) || null;
  }

  function zipingMain(reasoning) {
    return reasoning?.ziping?.findings?.find((x) => x.id !== "ZZ_MONTH_101" && x.implementationStatus !== "unimplemented")
      || reasoning?.ziping?.findings?.find((x) => x.id === "ZZ_MONTH_101")
      || null;
  }

  function rootUser(root) {
    const quality = root?.facts?.quality;
    if (quality === "month-rooted") return "그래도 가장 힘이 센 자리에서 네 힘을 받쳐주는 뿌리가 있어서, 압박을 전혀 못 버티는 구조는 아니야";
    if (quality === "day-rooted") return "그래도 네 가까운 자리에서 받쳐주는 뿌리가 있어서, 완전히 힘이 빠져 있는 구조는 아니야";
    if (quality === "other-rooted") return "강한 뿌리는 아니어도 다른 자리에서 받쳐주는 축이 있어서 완전히 떠 있는 구조는 아니야";
    if (quality === "rootless") return "반대로 스스로 버티게 해주는 뿌리가 뚜렷하지 않아서, 압박을 오래 들고 가는 방식은 손실이 커지기 쉬워";
    return "받치는 힘의 위치는 한쪽으로 단정하기 어려워";
  }

  function strengthUser(reasoning) {
    const verdict = reasoning?.integrated?.strength;
    if (verdict === "신약") return "네 힘보다 밖으로 빠지거나 눌리는 힘이 더 크게 작동하는 쪽이야";
    if (verdict === "신강") return "네 안에서 버티고 밀어붙이는 힘이 충분한 쪽이야";
    return "받치는 힘과 밖으로 쓰이는 힘이 한쪽으로 극단적으로 쏠리진 않은 쪽이야";
  }

  function structureUser(reasoning) {
    const name = reasoning?.profile?.structure?.gyeokName || "평격";
    return GYEOK_USER[name] || GYEOK_USER.평격;
  }

  function zipingUser(reasoning) {
    const z = zipingMain(reasoning);
    const path = z?.facts?.path;
    if (path === "print-transform") return "그래서 압박을 정면으로 버티기보다, 배움·준비·보호 장치를 거쳐 네가 감당할 수 있는 형태로 바꾸는 길이 중요해";
    if (path === "food-control") return "그래서 압박을 그대로 들고 있기보다, 실제 결과물과 행동으로 빼면서 힘을 조절하는 길이 살아 있어";
    if (path === "mixed-control-cost") return "밖으로 빼는 방식이 압박을 줄여주긴 하지만 네 힘도 같이 쓰기 때문에, 무작정 더 해내는 처방은 맞지 않아";
    if (path === "wealth-release") return "그래서 강한 표현과 산출을 현실 결과로 연결해야 힘이 막히지 않아";
    if (path === "print-control") return "그래서 바로 터뜨리기보다 한 번 정리하고 이해한 뒤 표현하는 순서가 힘을 살려";
    if (path === "officer-control") return "그래서 강한 자기 힘을 역할·책임·기준에 묶어 쓸 때 결과가 남기 쉬워";
    if (path === "output-to-wealth") return "그래서 내 힘을 결과물로 빼고 그걸 실제 보상과 연결할 때 구조가 살아";
    const state = reasoning?.integrated?.zipingState;
    if (state === "supported") return "중심 구조를 살려주는 연결이 실제 사주 안에 있어서, 조건만 맞으면 힘이 한 방향으로 모일 수 있어";
    if (state === "rescued") return "흐름을 깨는 힘이 있어도 다시 살려주는 연결이 함께 있어서, 무엇을 먼저 쓰느냐가 중요해";
    if (state === "damaged") return "중심 구조를 흔드는 힘이 같이 있어서, 익숙한 방식만 계속 밀면 소모가 커질 수 있어";
    if (state === "mixed") return "살리는 힘과 흔드는 힘이 같이 있어서, 같은 선택도 순서와 조건에 따라 결과 차이가 커질 수 있어";
    return "중심 구조는 보이지만 무엇이 살리고 무엇이 깨는지는 한쪽으로 과장하지 않는 게 맞아";
  }

  function pressureChain(reasoning, situation, isT) {
    const pressure = firstFinding(reasoning,"pressure");
    const root = firstFinding(reasoning,"root");
    const group = pressure?.facts?.group || reasoning?.integrated?.pressureGroup || "unknown";
    const p = groupText(group);
    const weak = reasoning?.integrated?.strength === "신약";
    const strong = reasoning?.integrated?.strength === "신강";
    const rooted = root?.facts?.quality && root.facts.quality !== "rootless";
    let middle;
    if (weak && rooted) middle = "처음엔 버텨낼 수 있지만, 같은 압박을 오래 들고 있으면 받치는 힘보다 소모가 먼저 커져";
    else if (weak) middle = "처음부터 오래 버티는 방식보다 압박을 줄이거나 받아낼 장치를 먼저 만드는 게 중요해";
    else if (strong) middle = "바로 무너지기보다 네가 먼저 감당하려고 해서, 문제를 알아도 계속 들고 갈 가능성이 커";
    else middle = "상황에 따라 받아낼 때와 밀려날 때가 달라서, 압박의 크기보다 대응 순서가 중요해";
    const end = zipingUser(reasoning);
    if (isT) return `<b>시작</b> — ${situation.cue}.<br><br><b>들어오는 힘</b> — ${p.pressure}이 가장 크게 작동해.<br><br><b>네가 받는 방식</b> — ${middle}.<br><br><b>갈림길</b> — ${end}.<br><br>그래서 ${situation.object}의 결과만 보지 말고, 이 순서가 시작되는 지점을 먼저 끊어야 해.`;
    return `보통 <b>${situation.cue}</b>에서 시작돼. 그때 네 사주에서는 ${p.pressure}이 가장 먼저 커져.<br><br>그리고 ${middle}.<br><br>여기서 중요한 건 네가 약해서가 아니라, <b>그 힘을 어떤 순서로 받아내느냐</b>야. ${end}.<br><br>언니는 ${situation.object}이 꼬인 마지막 장면보다 이 첫 순서를 먼저 잡고 싶어.`;
  }

  function corePortrait(reasoning, situation, isT) {
    const root = firstFinding(reasoning,"root");
    const pressure = firstFinding(reasoning,"pressure");
    const p = groupText(pressure?.facts?.group || reasoning?.integrated?.pressureGroup || "unknown");
    const base = structureUser(reasoning);
    const rootLine = rootUser(root);
    const strengthLine = strengthUser(reasoning);
    if (isT) {
      return `네 사주의 중심은 <b>${base}</b>이야. 그런데 실제 힘의 배분을 보면 ${strengthLine}. 지금 가장 크게 걸리는 건 <b>${p.pressure}</b>이고, ${rootLine}.<br><br>즉 ${situation.object}만 따로 떼서 볼 게 아니라, <b>이 압력을 네가 감당할 수 있는 형태로 바꾸는 구조</b>를 먼저 봐야 해.`;
    }
    return `언니가 네 사주 전체에서 먼저 보는 건 <b>${base}</b>이야. 그런데 이 힘이 그냥 편하게 쓰이는 건 아니고, 실제로는 ${strengthLine}. 지금 가장 크게 걸리는 건 <b>${p.pressure}</b>이야.<br><br>${rootLine}. 그래서 ${situation.object} 때문에 힘들 때도 ‘내가 왜 이것도 못 하지?’로 끝내면 핵심을 놓쳐. <b>어떤 압력을 받고, 그걸 무엇으로 받아내느냐</b>가 먼저야.`;
  }

  function deepCause(reasoning, situation, isT) {
    const s = reasoning?.profile?.structure || {};
    const z = zipingMain(reasoning);
    const bridge = reasoning?.integrated?.bridgeElementName;
    const helpful = godsHuman(reasoning?.integrated?.helpfulGods);
    const harmful = godsHuman(reasoning?.integrated?.harmfulGods);
    const conflict = reasoning?.integrated?.conflicts?.[0];
    const monthLine = s.touchul
      ? "사주의 중심 힘이 겉의 선택과 행동으로 비교적 바로 드러나는 편"
      : "사주의 중심 힘이 겉으로 바로 나오기보다 안쪽에서 먼저 작동하는 편";
    const supportLine = helpful.length ? `살리는 쪽은 ${helpful.join("·")}` : "살리는 신호가 한 가지로 단정되진 않아";
    const harmLine = harmful.length ? `반대로 ${harmful.join("·")}이 과해지면 중심 흐름이 깨질 수 있어` : "뚜렷한 방해 신호가 하나로 고정되진 않아";
    const bridgeLine = bridge ? `그리고 서로 부딪히는 힘 사이에서는 <b>${bridge}</b>이 중간 연결 역할을 할 수 있어.` : "";
    const conflictLine = conflict ? `두 판단이 완전히 같은 방향은 아니라서, ${conflict.priority}` : "";
    if (isT) {
      return `원인은 단순 성격이 아니야. 태어난 계절에서 잡힌 중심 구조상 <b>${monthLine}</b>이고, 실제 성패를 보면 ${zipingUser(reasoning)}<br><br>${supportLine}. ${harmLine}. ${bridgeLine}<br><br>${conflictLine || "강약 판단과 구조 판단이 같은 방향이면 그 조건을 더 강하게 본다."} 그래서 ${situation.object}의 원인을 범용 성향 하나로 줄이면 안 돼.`;
    }
    return `진짜 원인은 ‘원래 네 성격이 이래서’가 아니야. 네 사주 전체의 중심을 보면 <b>${monthLine}</b>이야. 그리고 그 구조가 실제로 잘 굴러가는지까지 보면, ${zipingUser(reasoning)}<br><br>쉽게 풀면 ${supportLine}. ${harmLine}. ${bridgeLine}<br><br>${conflictLine || "두 판단이 같은 방향을 가리킬 때는 그 조건을 더 중요하게 볼 수 있어."} 언니가 ${situation.object}을 볼 때 이 구조부터 보는 이유가 그거야.`;
  }

  function changeOrder(reasoning, situation, isT) {
    const bridge = reasoning?.integrated?.bridgeElement;
    const balance = reasoning?.profile?.balance || {};
    const firstElement = bridge || balance.primary || "";
    const secondElement = bridge ? (balance.primary || balance.secondary || "") : (balance.secondary || "");
    const firstAction = ELEMENT_ACTION[firstElement] || groupText(reasoning?.integrated?.neededGroups?.[0] || "unknown").action;
    const secondAction = ELEMENT_ACTION[secondElement] || groupText(reasoning?.integrated?.neededGroups?.[1] || "unknown").action;
    const harmful = godsHuman(reasoning?.integrated?.harmfulGods);
    const special = reasoning?.unsupported || [];
    const caution = special.length
      ? "다만 특수한 구조나 서로 묶이는 힘의 실제 변화처럼 아직 확정 규칙이 없는 부분은 억지로 결론내리지 않았어."
      : "";
    if (isT) {
      return `<b>첫 순서</b> — ${firstAction}.<br><br><b>그다음</b> — ${secondAction}.<br><br><b>지금 고민에 적용</b> — ${situation.move}.<br><br><b>7일 검증</b> — ${situation.metric}.<br><br>${harmful.length ? `특히 ${harmful.join("·")}이 과해지는 선택은 줄여.` : "한 번에 변수 여러 개를 바꾸지 마."} ${caution}`;
    }
    return `한꺼번에 바꾸기보다 순서가 중요해. <b>먼저 ${firstAction}</b>. 그다음 <b>${secondAction}</b>을 붙여봐.<br><br>지금 고민에서는 ${situation.move}. 그리고 이번 7일은 <b>${situation.metric}</b>만 확인해보자.<br><br>${harmful.length ? `${harmful.join("·")}이 너무 커지는 방식은 오히려 원래 구조를 더 힘들게 만들 수 있어.` : "변수를 여러 개 한꺼번에 바꾸면 뭐가 효과 있었는지 놓치기 쉬워."} ${caution}`;
  }

  function domainFit(reasoning, situation, isT) {
    const domain = DOMAIN[situation.concern] || DOMAIN.money;
    const helpfulGods = reasoning?.integrated?.helpfulGods || [];
    const harmfulGods = reasoning?.integrated?.harmfulGods || [];
    const helpGroups = [...new Set(helpfulGods.map(godGroup))];
    const harmGroups = [...new Set(harmfulGods.map(godGroup))];
    if (!helpGroups.length) {
      const needed = reasoning?.integrated?.neededGroups || [];
      helpGroups.push(...needed);
    }
    const good = [...new Set(helpGroups.map((g) => domain.help[g] || domain.help.unknown))];
    const bad = [...new Set(harmGroups.map((g) => domain.harm[g] || domain.harm.unknown))];
    if (!good.length) good.push(domain.help.unknown);
    if (!bad.length) bad.push(domain.harm.unknown);
    const state = reasoning?.integrated?.zipingState;
    const stateLine = state === "rescued"
      ? "특히 처음부터 완벽한 환경보다, 꼬였을 때 다시 조정할 통로가 있는지를 봐."
      : state === "damaged"
        ? "지금은 잘 버티는지보다 중심 흐름을 계속 깨는 조건이 반복되는지를 먼저 봐."
        : "잘 맞는지 판단할 때는 기분보다 이 조건이 실제로 반복되는지를 봐.";
    if (isT) {
      return `<b>${domain.name}에서 맞는 쪽</b> — ${good.join(" / ")}.<br><br><b>피할 쪽</b> — ${bad.join(" / ")}.<br><br><b>판별법</b> — ${stateLine}`;
    }
    return `네 사주에서 ${domain.name}을 볼 때 잘 맞는 쪽은 <b>${good.join(" / ")}</b>이야.<br><br>반대로 오래 두면 소모가 커지는 쪽은 <b>${bad.join(" / ")}</b>이고.<br><br>${stateLine} ‘좋아 보이는가’보다 <b>내 구조가 여기서 실제로 살아나는가</b>를 보는 게 더 정확해.`;
  }

  function formatMonth(row) {
    if (!row) return "뚜렷하게 짚을 달 없음";
    if (row.startMonth) return `${row.startMonth}월 ${row.startDay ? row.startDay + "일 무렵부터" : ""}`;
    if (row.startYmd) return row.startYmd;
    return row.ganZhi || "해당 시기";
  }

  function timingNote(reasoning, situation, isT) {
    const years = reasoning?.timing?.years || [];
    const valid = years.filter((y) => y.status === "ok");
    const cards = valid.map((y) => {
      const best = y.bestMonth;
      const caution = y.cautionMonth;
      const cls = y.class;
      const yearLine = cls === "supportive" || cls === "mild-support"
        ? "큰 흐름이 기본 사주를 비교적 받쳐주는 해"
        : cls === "caution" || cls === "mild-caution"
          ? "무리하게 넓히기보다 손실을 줄이는 게 중요한 해"
          : "큰 흐름이 한쪽으로 강하게 기울지 않는 해";
      const bestLine = best
        ? `${formatMonth(best)}가 상대적으로 쓰기 좋은 구간이야. 큰 흐름과 해의 흐름 위에 이 달의 힘까지 겹쳐 봤을 때 네 기본 구조를 더 받쳐주는 쪽이야.`
        : "앞으로 남은 달의 흐름에서 강한 우세 구간을 따로 잡지 않았어.";
      const cautionLine = caution && caution.score < (best?.score ?? Infinity)
        ? `${formatMonth(caution)}는 같은 속도로 밀기보다 한 번 더 확인해.`
        : "";
      return {year:y.year,yearLine,bestLine,cautionLine,best};
    });
    if (!cards.length) {
      return {
        desc:isT ? "현재 저장된 시기 데이터가 부족해서 특정 때를 만들어내지 않을게." : "지금은 시기 자료가 충분하지 않아서 언니가 날짜를 지어내진 않을게.",
        meta:{firstDate:null,secondDate:null,structureFingerprint:reasoning?.structureFingerprint||"",timingFingerprint:reasoning?.timingFingerprint||""},
      };
    }
    const body = cards.map((c) => `<b>${c.year}년</b> — ${c.yearLine}.<br>${c.bestLine}${c.cautionLine ? "<br>"+c.cautionLine : ""}`).join("<br><br>");
    const action = situation.move;
    const intro = isT
      ? "기본 사주는 그대로고, 시기마다 그 구조를 받치는 힘과 흔드는 힘만 달라져. 큰 흐름 → 해의 흐름 → 달의 흐름 순서로 겹쳐 봤어."
      : "네 기본 사주가 해마다 바뀌는 건 아니야. 언니는 같은 구조 위에 큰 흐름, 해의 흐름, 달의 흐름이 어떻게 겹치는지를 따로 봤어.";
    const close = isT
      ? `좋은 구간엔 ${action}. 조심 구간엔 같은 속도로 밀지 마.`
      : `움직이기 좋은 구간에는 ${action}. 반대로 힘이 덜 받쳐주는 때는 억지로 같은 속도를 내지 않아도 돼.`;
    return {
      desc:`${intro}<br><br>${body}<br><br>${close}`,
      meta:{
        firstDate:cards[0]?.best ? formatMonth(cards[0].best) : null,
        secondDate:cards[1]?.best ? formatMonth(cards[1].best) : null,
        firstBody:cards[0] ? String(cards[0].year)+" "+cards[0].yearLine+" "+cards[0].bestLine : "",
        secondBody:cards[1] ? String(cards[1].year)+" "+cards[1].yearLine+" "+cards[1].bestLine : "",
        concernSituation:situation.key,
        structureFingerprint:reasoning?.structureFingerprint||"",
        timingFingerprint:reasoning?.timingFingerprint||"",
        method:reasoning?.timing?.method||"",
      },
    };
  }

  function badgeFor(concern, idx) {
    const rows={
      money:["돈의 핵심","돈 패턴","진짜 원인","바꿀 순서","돈이 남는 구조","돈 흐름"],
      career:["일의 핵심","막히는 패턴","진짜 원인","바꿀 순서","맞는 일 환경","기회 시기"],
      love:["연애 핵심","반복 패턴","진짜 원인","바꿀 순서","맞는 사람","관계 시기"],
      path:["진로 핵심","고민 패턴","진짜 원인","바꿀 순서","맞는 일 방식","움직일 시기"],
      people:["관계 핵심","반복 패턴","진짜 원인","바꿀 순서","남길 사람","관계 시기"],
      mental:["마음 핵심","지치는 패턴","진짜 원인","바꿀 순서","회복 환경","회복 시기"],
    };
    return rows[concern]?.[idx] || "비밀 메모";
  }

  function titleFor(s, idx, isT) {
    if (idx === 0) return isT ? `${s.label} — 사주 전체에서 먼저 볼 건 이거야` : `${s.label} — 언니는 네 사주 전체부터 볼래`;
    if (idx === 1) return isT ? "결과보다 이 순서부터 끊어" : "반복되는 순서가 여기서 시작돼";
    if (idx === 2) return isT ? "원인은 성격 한 줄로 설명 안 돼" : "왜 자꾸 이렇게 되는지 뿌리부터 볼게";
    if (idx === 3) return isT ? "바꿀 건 하나가 아니라 순서야" : "힘을 바꾸는 순서부터 같이 잡자";
    if (idx === 4) return isT ? "잘 맞는 조건과 피할 조건을 나눠" : "너를 살리는 사람·환경은 조건이 달라";
    return isT ? "기본 사주는 그대로, 움직일 시기만 나눠" : "같은 너라도 힘이 붙는 시기는 따로 있어";
  }

  function buildConcernDiagnosisV2(data) {
    if (typeof global.buildClassicalReasoningV1 !== "function") {
      throw new Error("고전 명리 추론 엔진을 불러오지 못했습니다.");
    }
    const reasoning = global.buildClassicalReasoningV1(data || {});
    const situation = situationFor(data || {});
    return {
      version:VERSION,
      engine:"classical-causal",
      situation,
      reasoning,
      structureFingerprint:reasoning.structureFingerprint,
      timingFingerprint:reasoning.timingFingerprint,
    };
  }

  function renderConcernNotesV2(data, mode) {
    data = data || {};
    const isT = mode === "T";
    const d = buildConcernDiagnosisV2(data);
    const r = d.reasoning;
    const s = d.situation;
    const timing = timingNote(r,s,isT);

    const notes = [
      {
        badge:badgeFor(s.concern,0),
        title:titleFor(s,0,isT),
        desc:corePortrait(r,s,isT),
        checklist:isT ? `검증: ${s.cue}에서 실제로 어떤 압박이 먼저 커지는지 한 번만 기록해.` : `언니 말이 맞는지 확인해보자. ${s.cue}에서 네가 제일 먼저 부담스러워지는 게 뭔지만 적어봐.`,
      },
      {
        badge:badgeFor(s.concern,1),
        title:titleFor(s,1,isT),
        desc:pressureChain(r,s,isT),
        checklist:isT ? `체크: ${s.metric}.` : `다음에 비슷한 일이 오면 마지막 결과 말고 첫 장면을 보자. ${s.metric}.`,
      },
      {
        badge:badgeFor(s.concern,2),
        title:titleFor(s,2,isT),
        desc:deepCause(r,s,isT),
        checklist:isT ? "원인을 ‘내 성격’ 한 단어로 끝내지 말고, 어떤 힘이 들어오고 무엇이 그걸 받쳐주는지 둘로 나눠봐." : "이번에는 ‘내가 원래 이래’로 끝내지 말자. 부담이 시작된 조건과 그걸 덜어준 조건을 하나씩만 적어봐.",
      },
      {
        badge:badgeFor(s.concern,3),
        title:titleFor(s,3,isT),
        desc:changeOrder(r,s,isT),
        checklist:isT ? `7일 뒤 효과 있었던 순서 하나만 남겨. 기준은 ${s.metric}.` : `7일 뒤 ‘이 순서는 덜 힘들었어’ 싶은 것 하나만 남기면 돼. 기준은 ${s.metric}.`,
      },
      {
        badge:badgeFor(s.concern,4),
        title:titleFor(s,4,isT),
        desc:domainFit(r,s,isT),
        checklist:isT ? "사람·환경 하나를 떠올리고 도움 조건과 방해 조건 중 실제로 뭐가 반복되는지 봐." : "떠오르는 사람이나 환경 하나에 이 기준을 대입해봐. 기분보다 반복되는 반응을 보면 더 선명해져.",
      },
      {
        badge:badgeFor(s.concern,5),
        title:titleFor(s,5,isT),
        desc:timing.desc,
        checklist:isT ? "좋은 구간엔 확인할 행동 하나, 조심 구간엔 줄일 행동 하나만 캘린더에 넣어." : "움직일 때 할 것 하나, 힘을 아낄 때 줄일 것 하나만 미리 적어두자.",
        __timingQA:timing.meta,
      },
    ];

    notes.forEach((note, idx) => {
      note.themeNum=String(idx+1).padStart(2,"0");
      const claim=r.claims?.[idx];
      if (claim) claim.noteSentence=stripHtml(note.desc);
    });

    const audit = {
      version:VERSION,
      engine:"classical-causal",
      fingerprint:r.structureFingerprint+"|"+s.concern+"|"+s.key,
      genericClusterDependency:false,
      structureFingerprint:r.structureFingerprint,
      timingFingerprint:r.timingFingerprint,
      situation:{concern:s.concern,key:s.key},
      ditianRuleIds:r.ditian?.findings?.map((x)=>x.id)||[],
      zipingRuleIds:r.ziping?.findings?.map((x)=>x.id)||[],
      claims:r.claims||[],
      unsupported:r.unsupported||[],
      sourceLayers:{
        ditian:global.__DITIAN_SUI_SOURCES__?.version||null,
        ziping:global.__ZIPING_ZHENQUAN_SOURCES__?.version||null,
      },
      ruleLayers:{
        ditian:global.__DITIAN_SUI_RULES__?.version||null,
        ziping:global.__ZIPING_ZHENQUAN_RULES__?.version||null,
      },
    };
    data.noteV3Audit=audit;
    data.noteV2Audit=audit;
    data.noteDiagnosisV2=d;
    return notes;
  }

  global.buildConcernDiagnosisV2=buildConcernDiagnosisV2;
  global.renderConcernNotesV2=renderConcernNotesV2;
  global.__CONCERN_NOTE_ENGINE_V2__={version:VERSION,situations:SITUATIONS};

  const legacy=global.generateConcernNotes;
  const wrapped=function(data,mode){
    return renderConcernNotesV2(data||{},mode||"F");
  };
  wrapped.__noteV2Wrapped=true;
  wrapped.__classicalCausal=true;
  wrapped.__legacyBase=legacy;
  global.generateConcernNotes=wrapped;
})(globalThis);
