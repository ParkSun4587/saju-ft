(function (global) {
  "use strict";

  const VERSION = "5.0.0";
  const CONCERNS = ["money","career","love","path","people","mental"];

  function hasBatchim(value) {
    const chars = Array.from(String(value || "").trim());
    for (let i = chars.length - 1; i >= 0; i -= 1) {
      const code = chars[i].charCodeAt(0);
      if (code >= 0xAC00 && code <= 0xD7A3) return (code - 0xAC00) % 28 !== 0;
    }
    return false;
  }

  function josaSuffix(value, withBatchim, withoutBatchim) {
    return hasBatchim(value) ? withBatchim : withoutBatchim;
  }

  function withJosa(value, withBatchim, withoutBatchim) {
    const text = String(value || "");
    return text + josaSuffix(text, withBatchim, withoutBatchim);
  }

  function actionExample(value) {
    const text = String(value || "").trim();
    return /기$/.test(text) ? text.replace(/기$/, "는 식으로") : text;
  }

  function cueAt(value) {
    const text = String(value || "").trim();
    return /순간$/.test(text) ? text.replace(/순간$/, "순간에") : text;
  }

  const SITUATIONS = {
    money: {
      saving:{label:"돈이 잘 안 모여",object:"지출과 저축",cue:"돈이 들어와도 남는 금액을 만들기 위해 지출·저축 기준을 정해야 하는 순간",move:"돈이 남지 않는 장면 하나를 찾아 지출·저축 기준을 고정하기",metric:"7일 동안 계획 밖 지출과 그 이유를 적어보기"},
      income:{label:"수입을 더 늘리고 싶어",object:"수입과 보상",cue:"지금 수입을 늘리기 위해 단가·연봉·일의 조건을 조정해야 하는 순간",move:"성과나 제공 가치를 가격·연봉·조건 중 하나로 구체화해 말하기",metric:"수입을 늘릴 근거 하나와 바꿀 조건 하나를 적어보기"},
      side:{label:"부업·새 수입을 만들고 싶어",object:"새 수입원",cue:"부업이나 새 수입원을 실제 돈으로 시험해봐야 하는 순간",move:"작게 팔거나 제안할 수 있는 것 하나에 가격을 붙여 반응 보기",metric:"7일 안에 가격을 붙인 제안 하나를 실제로 보여주고 반응 확인하기"},
      flow:{label:"앞으로 돈 흐름이 궁금해",object:"앞으로의 돈 흐름",cue:"앞으로의 돈 흐름을 보면서 언제 어떤 행동을 할지 정해야 하는 순간",move:"힘이 붙는 구간에 할 돈 행동 하나를 미리 정하기",metric:"다음 기회 구간에 바로 할 돈 행동 하나를 미리 정해두기"},
    },
    career: {
      exam:{label:"시험·합격이 궁금해",object:"시험과 합격",cue:"시험 준비에서 현재 수준과 합격 기준을 맞춰봐야 하는 순간",move:"실전 결과와 틀린 이유를 보고 공부법 하나만 남기기",metric:"7일 동안 공부법은 고정하고 틀린 이유만 세 가지로 분류하기"},
      jobsearch:{label:"취업 준비 중이야",object:"취업 준비와 지원",cue:"준비한 걸 실제 지원이나 면접으로 보여줘야 하는 순간",move:"지원·포트폴리오·면접 중 하나를 실제 사람에게 보여주고 반응 받기",metric:"지원·제출·모의면접 중 실제 반응을 받는 행동 2회"},
      move:{label:"이직·퇴사를 고민 중이야",object:"이직과 퇴사",cue:"지금 자리를 버틸지 옮길지 결론내야 하는 순간",move:"감정과 조건을 분리해 옮길 기준 세 가지를 적기",metric:"이직 기준 3개를 숫자·조건으로 적고 현재 직장과 비교하기"},
      current:{label:"지금 자리에서 잘 풀리고 싶어",object:"현재 자리의 성장과 성과",cue:"지금 맡은 일에서 평가·역할·보상을 더 잘 연결하고 싶은 순간",move:"지금 잘하고 있는 일 하나를 역할·보상·업무 기준으로 구체화해 말하기",metric:"잘한 일 하나와 원하는 변화 하나를 문장으로 정리해 실제로 요청하기"},
    },
    love: {
      crush:{label:"썸·짝사랑 중이야",object:"썸과 상대 마음",cue:"상대 마음이나 관계의 다음 단계를 확인하고 싶은 순간",move:"추측만 이어가기보다 질문이나 만남 같은 실제 반응 하나 확인하기",metric:"궁금한 점 하나를 질문·만남 제안 같은 실제 확인으로 바꾸기"},
      relationship:{label:"지금 연애 중이야",object:"현재 연애",cue:"연락·표현·약속에서 둘의 기준을 맞춰야 하는 순간",move:"지금 관계에서 중요한 기준 하나를 구체적으로 말하고 상대 기준도 확인하기",metric:"연락·표현·약속 중 하나의 기준을 한 문장으로 맞춰보기"},
      breakup:{label:"헤어진 사람이 있어",object:"헤어진 사람과 남은 관계",cue:"헤어진 사람을 떠올리며 이 관계를 어떻게 받아들일지 고민되는 순간",move:"다시 볼지와 별개로 헤어진 이유와 지금 달라진 점을 나눠 확인하기",metric:"이 관계를 다시 생각할 때 달라져야 할 조건 세 가지를 적기"},
      new:{label:"새로운 인연을 만나고 싶어",object:"새로운 인연 만들기",cue:"새로운 사람을 만나고 싶은데 어디서부터 움직일지 고르는 순간",move:"기다리기보다 실제 만남 접점 하나를 늘리고 반응 보기",metric:"소개·모임·약속 중 새 사람을 만날 접점 하나를 실제로 만들기"},
    },
    path: {
      lost:{label:"뭘 해야 할지 모르겠어",object:"진로 선택",cue:"무엇부터 시도해야 할지 방향을 잡기 어려운 순간",move:"지금 가장 궁금한 방향 하나를 짧은 실제 경험으로 바꾸기",metric:"궁금한 방향 하나를 2시간 이상 실제 경험으로 바꿔보기"},
      current:{label:"지금 가는 길이 맞는지 궁금해",object:"현재 진로",cue:"지금 가는 길을 계속 이어가도 되는지 확인하고 싶은 순간",move:"지금 일에서 잘되는 부분과 소모되는 부분을 따로 기록하기",metric:"잘되는 장면 3개와 소모되는 장면 3개를 분리해서 기록하기"},
      switch:{label:"다른 분야로 바꾸고 싶어",object:"다른 분야로의 전환",cue:"지금 하던 걸 유지하면서 다른 분야를 알아보고 싶은 순간",move:"전부 바꾸기 전에 새 분야를 작은 경험으로 먼저 확인하기",metric:"새 분야를 작은 프로젝트·수업·체험 중 하나로 먼저 검증하기"},
      strength:{label:"내 적성·강점을 알고 싶어",object:"적성과 강점",cue:"내가 반복해서 잘하는 방식이 무엇인지 확인하고 싶은 순간",move:"잘하는 방식이 반복해서 나타난 장면 세 개를 모으기",metric:"강점이 드러난 장면 3개에서 공통 행동 하나 뽑기"},
    },
    people: {
      friend:{label:"친구·지인 때문에 힘들어",object:"친구·지인 관계",cue:"친구·지인 관계에서 불편한 장면이 생겼을 때 어떻게 대응할지 정해야 하는 순간",move:"작은 경계 하나를 말하고 상대 반응 보기",metric:"작은 경계 하나를 말하고 상대 반응을 그대로 기록하기"},
      work:{label:"직장 사람 때문에 힘들어",object:"직장 사람과의 관계",cue:"직장 사람 문제를 역할·업무·연락 기준으로 나눠봐야 하는 순간",move:"감정만 설명하기보다 역할·업무·연락 기준 하나를 문장으로 정하기",metric:"업무 범위·기한·연락 기준 중 하나를 문장으로 고정하기"},
      family:{label:"가족과 자꾸 부딪혀",object:"가족과의 반복 갈등",cue:"가족과 부딪히는 장면이 반복될 때 내 대응 기준을 정해야 하는 순간",move:"상대를 바꾸려 하기보다 반복해서 부딪히는 장면에서 내가 지킬 범위를 정하기",metric:"최근 부딪힌 장면 하나에서 할 수 있는 범위와 어려운 범위를 한 문장씩 정하기"},
      distance:{label:"계속 볼지 거리를 둘지 고민이야",object:"관계를 계속 볼지 거리 둘지",cue:"계속 볼지 조금 거리를 둘지 아직 결론이 안 선 순간",move:"바로 끊거나 유지로 확정하지 말고 연락·만남·도움 중 하나를 조절해 내 반응 보기",metric:"연락·만남·도움 중 하나만 조절한 뒤 내 반응을 기록하기"},
    },
    mental: {
      burnout:{label:"번아웃이 온 것 같아",object:"번아웃",cue:"번아웃 같다고 느껴져 더 밀어붙일지 부담을 덜어낼지 정해야 하는 순간",move:"해야 할 일을 늘리기 전에 부하 하나를 실제로 덜어내기",metric:"7일 동안 해야 할 일 하나를 실제로 빼고 수면·피로 변화를 기록하기"},
      overthink:{label:"생각이 너무 많아",object:"생각 과다",cue:"같은 생각을 반복하면서 결론은 더 안 나는 순간",move:"생각거리 하나를 행동·보류·내 일이 아님으로 나누기",metric:"생각거리 하나를 행동·보류·내 일 아님 셋 중 하나로 분류하기"},
      low:{label:"아무것도 하기 싫어",object:"무기력",cue:"아무것도 하기 싫을 때 어디까지를 오늘 기준으로 잡을지 정해야 하는 순간",move:"성과가 아니라 생활 리듬 하나부터 다시 고정하기",metric:"기상·식사·걷기 중 하나만 같은 시간에 7일 고정하기"},
      recover:{label:"다시 컨디션을 찾고 싶어",object:"컨디션 회복",cue:"컨디션을 다시 찾기 위해 무엇부터 일정하게 만들지 정해야 하는 순간",move:"지키기 쉬운 수면·식사·움직임 하나를 반복 일정으로 만들기",metric:"활동량을 한꺼번에 크게 늘리지 않고 조금씩 조절하기"},
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

  const FLOW_USER = {
    mok:"시작하고 넓히는 힘",
    hwa:"밖으로 드러내고 표현하는 힘",
    to:"붙잡고 정리해서 유지하는 힘",
    geum:"기준을 세우고 골라내는 힘",
    su:"정보를 모으고 회복하며 다음을 준비하는 힘",
  };
  const FLOW_SHORT = {
    mok:"시작·확장",
    hwa:"표현·노출",
    to:"정리·유지",
    geum:"기준·선택",
    su:"정보·회복",
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
        self:"내 몫과 지출 기준을 스스로 정할 수 있는 조건",print:"급하게 벌리기보다 정보를 확인하고 준비할 여유가 있는 조건",
        output:"내가 만든 것이 실제 판매·성과로 연결되는 조건",wealth:"수입·지출·보상이 숫자로 분명하게 보이는 조건",
        officer:"역할과 보상이 계약·규칙으로 정리된 조건",unknown:"돈이 들어오고 나가는 원인을 하나씩 확인할 수 있는 조건",
      },
      harm:{
        self:"비교나 경쟁 때문에 내 기준 없이 버티게 만드는 환경",print:"준비만 계속 늘고 실제 돈의 반응은 확인하지 못하는 환경",
        output:"표현과 시도만 많고 회수 기준이 없는 환경",wealth:"기회·지출·투자를 한꺼번에 늘리게 만드는 환경",
        officer:"책임과 고정비만 늘고 내 선택권은 줄어드는 환경",unknown:"왜 돈이 새는지 확인하기 어려운 환경",
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
        output:"말하거나 결과물을 내도 계속 막히는 환경",wealth:"성과보다 실적 요구와 조건 변동만 커지는 환경",
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
        officer:"통제와 강요를 사랑처럼 요구하는 관계",unknown:"신호만 주고 설명은 하지 않는 관계",
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
    return String(v || "").replace(/<br\s*\/?\s*>/gi," ").replace(/<[^>]+>/g,"").replace(/\s+/g," ").trim();
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

  function strengthContextUser(reasoning) {
    const st = reasoning?.profile?.strength || {};
    const season = !!st.deukryeong?.active;
    const party = !!st.deukse?.active;
    if (season && party) return "태어난 계절의 중심 힘도 네 편이고, 다른 자리에서 보태주는 힘도 같이 붙는 편이야";
    if (season && !party) return "태어난 계절의 중심 힘은 네 편이지만, 그 밖의 자리까지 전부 같은 방향으로 받쳐주진 않아";
    if (!season && party) return "태어난 계절의 중심 힘 자체는 네 편이 아니지만, 다른 자리에서 그 부담을 보완해주는 힘은 있어";
    return "태어난 계절의 중심 힘 자체는 네 편이 아니고, 가까운 뿌리를 빼면 바깥에서 보태주는 힘도 넉넉하진 않아";
  }

  function specialGuardUser(reasoning, isT) {
    if (!reasoning?.integrated?.specialStructureGuarded) return "";
    return isT
      ? "다만 힘이 한쪽으로 아주 크게 몰린 후보라, 일반적인 강·약 설명 하나로 확정하지 않았어."
      : "다만 이 사주는 힘이 한쪽으로 아주 크게 몰린 후보라서, 언니도 일반적인 강·약 설명 하나만 믿고 단정하진 않았어.";
  }

  function flowUser(reasoning) {
    const dominant = firstFinding(reasoning,"flow");
    const chain = firstFinding(reasoning,"flow-chain");
    const start = dominant?.facts?.strongestElement || chain?.facts?.sourceElement;
    const path = Array.isArray(chain?.facts?.path) ? chain.facts.path : [];
    const blocked = chain?.facts?.blockedAt;
    const startText = FLOW_SHORT[start] || "한쪽 힘";
    if (blocked?.from && blocked?.to) {
      const from = FLOW_SHORT[blocked.from] || "앞 단계";
      const to = FLOW_SHORT[blocked.to] || "다음 단계";
      return `전체 흐름은 <b>${startText}</b>에서 시작하는데, <b>${from}</b> 다음에 <b>${to}</b>${josaSuffix(to,"이","가")} 이어지는 연결이 약해. 그래서 힘이 없는 게 아니라, 다음 단계로 넘기는 지점에서 막히기 쉬워`;
    }
    const labels = [start, ...path.filter(x=>x?.present).map(x=>x.to)]
      .map(x=>FLOW_SHORT[x])
      .filter(Boolean)
      .filter((x,i,a)=>a.indexOf(x)===i);
    if (labels.length >= 2) {
      return `전체 힘은 <b>${labels.join(" → ")}</b> 순서로 비교적 이어지는 편이야. 그래서 문제는 '아예 못 움직이는 것'보다 어느 단계가 과해져 전체 균형을 흔드느냐에 가까워`;
    }
    return `전체 흐름에서는 <b>${startText}</b>이 먼저 커지는 편이라, 그 힘을 어디로 넘기느냐가 중요해`;
  }

  function relationUser(reasoning) {
    const ctx = reasoning?.context || {};
    const clashes = ctx.clashes || [];
    const other = [...(ctx.punishments||[]),...(ctx.harms||[]),...(ctx.breaks||[])];
    const monthClash = clashes.some(x=>x?.aPos==="month"||x?.bPos==="month");
    if (monthClash) return "여기에 사주의 중심이 되는 자리를 직접 부딪히는 관계까지 있어서, 같은 힘도 상황에 따라 흔들림이 더 커질 수 있어.";
    if (clashes.length) return "사주 안에 서로 정면으로 부딪히는 자리도 있어서, 한쪽을 밀수록 다른 쪽이 같이 흔들리는 장면이 생길 수 있어.";
    if (other.length) return "서로 불편하게 당기거나 밀어내는 관계가 보이지만, 이것만으로 나쁘다고 단정하지 않고 다른 흐름과 같이 봐야 해.";
    return "";
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

  function zipingCauseSummary(reasoning) {
    const state = reasoning?.integrated?.zipingState;
    if (state === "supported") return "살리는 조건이 들어오면 중심이 흩어지기보다 한 방향으로 모이는 구조야";
    if (state === "rescued") return "한 번 흐트러져도 다시 받치는 힘이 이어질 때 회복되는 구조야";
    if (state === "damaged") return "방해 조건을 그대로 두면 중심 흐름이 반복해서 깎이는 구조야";
    if (state === "mixed") return "살리는 힘과 흔드는 힘이 같이 있어서 무엇을 먼저 쓰느냐가 결과를 가르는 구조야";
    return "한 가지 힘만 보고 결론내리기보다 살리는 조건과 흔드는 조건을 함께 봐야 하는 구조야";
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
    const flow = flowUser(reasoning);
    const end = zipingUser(reasoning);
    if (isT) return `<b>시작</b> — ${situation.cue}.<br><br><b>흐르는 순서</b> — ${flow}.<br><br><b>가장 크게 걸리는 힘</b> — ${p.pressure}. ${middle}.<br><br><b>갈림길</b> — ${end}.<br><br>그래서 ${situation.object}의 마지막 결과보다, 어디에서 흐름이 막히거나 과해지는지를 먼저 봐야 해.`;
    const cueStart = /순간$/.test(situation.cue) ? situation.cue.replace(/순간$/, "순간부터") : situation.cue;
    const lastScene = situation.concern === "love" && situation.key === "relationship"
      ? `${situation.object}에서 반복되는 장면보다`
      : `${withJosa(situation.object,"이","가")} 꼬인 마지막 장면보다`;
    return `보통 <b>${cueStart}</b> 시작돼.<br><br>${flow}. 그리고 그 과정에서 특히 <b>${p.pressure}</b>${josaSuffix(p.pressure,"이","가")} 크게 걸리고, ${middle}.<br><br>그래서 단순히 '내가 버티냐 못 버티냐'가 핵심이 아니야. ${end}.<br><br>언니는 ${lastScene} <b>어디에서 흐름이 막히거나 과해지는지</b>부터 잡고 싶어.`;
  }

  function corePortrait(reasoning, situation, isT) {
    const root = firstFinding(reasoning,"root");
    const pressure = firstFinding(reasoning,"pressure");
    const p = groupText(pressure?.facts?.group || reasoning?.integrated?.pressureGroup || "unknown");
    const base = structureUser(reasoning);
    const rootLine = rootUser(root);
    const strengthLine = strengthUser(reasoning);
    const seasonLine = strengthContextUser(reasoning);
    const guard = specialGuardUser(reasoning,isT);
    if (isT) {
      return `네 사주의 중심은 <b>${base}</b>${josaSuffix(base,"이야","야")}. ${seasonLine}. 실제 전체 힘의 배분까지 합치면 ${strengthLine}.<br><br>지금 가장 크게 걸리는 건 <b>${p.pressure}</b>이고, ${rootLine}. 즉 ${situation.object}만 따로 떼서 볼 게 아니라, <b>무엇이 너를 받치고 무엇이 힘을 빼는지</b>를 같이 봐야 해. ${guard}`;
    }
    const situationLead = situation.concern === "love" && situation.key === "relationship"
      ? `${situation.object}를 볼 때도`
      : `${situation.object} 때문에 힘들 때도`;
    return `언니가 네 사주 전체에서 먼저 보는 건 <b>${base}</b>${josaSuffix(base,"이야","야")}. 그리고 중요한 건 이 힘의 이름보다 <b>실제로 얼마나 받쳐지느냐</b>야. ${seasonLine}. 전체를 합치면 ${strengthLine}.<br><br>지금 가장 크게 걸리는 건 <b>${p.pressure}</b>${josaSuffix(p.pressure,"이야","야")}. ${rootLine}. 그래서 ${situationLead} ‘내가 왜 이것도 못 하지?’로 끝내면 핵심을 놓쳐. <b>받쳐주는 조건과 힘을 빼는 조건이 동시에 어떻게 작동하는지</b>가 먼저야. ${guard}`;
  }

  function deepCause(reasoning, situation, isT) {
    const s = reasoning?.profile?.structure || {};
    const z = zipingMain(reasoning);
    const bridge = reasoning?.integrated?.bridgeElement;
    const helpful = godsHuman(z?.supportGods?.length ? z.supportGods : reasoning?.integrated?.helpfulGods);
    const harmful = godsHuman(z?.harmGods?.length ? z.harmGods : reasoning?.integrated?.harmfulGods);
    const rescue = godsHuman(z?.rescueGods || reasoning?.integrated?.rescueGods);
    const conflict = reasoning?.integrated?.conflicts?.[0];
    const monthLine = s.touchul
      ? "태어난 계절에서 잡힌 중심 힘이 겉의 선택과 행동까지 바로 이어지는 편"
      : "태어난 계절에서 잡힌 중심 힘이 바로 겉으로 튀어나오기보다 안에서 한 번 걸러지는 편";
    const supportLine = helpful.length ? `이 구조를 살리는 쪽은 <b>${helpful.join("·")}</b>` : "이 구조를 살리는 힘은 한 가지로만 고정되지 않아";
    const harmLine = harmful.length ? `반대로 <b>${harmful.join("·")}</b>이 앞에 서면 원래 흐름을 흔들 수 있어` : "지금 확인된 구조에서는 한 가지 방해 힘이 압도적으로 고정되진 않아";
    const rescueLine = harmful.length && rescue.length
      ? `그래도 흐트러졌을 때 <b>${rescue.join("·")}</b>이 다시 받아주는 길이 있어`
      : "";
    const bridgeLine = bridge
      ? `서로 맞서는 힘을 이어주는 역할은 <b>${FLOW_USER[bridge] || "중간 연결 힘"}</b>이 맡아.`
      : "";
    const relationLine = relationUser(reasoning);
    const conflictLine = conflict
      ? "다만 몸이 감당하는 방향과 중심 구조가 요구하는 방향이 완전히 같진 않아서, 먼저 버틸 조건을 만든 다음 결과 쪽 힘을 써야 해."
      : "";
    const resolution = String(conflictLine || zipingCauseSummary(reasoning)).replace(/[.!?]+$/,"");
    if (isT) {
      return `원인은 성격 한 줄이 아니야. <b>${monthLine}</b>. ${supportLine}. ${harmLine}. ${rescueLine}<br><br>${bridgeLine} ${relationLine}<br><br>${resolution}. 그래서 ${situation.object}에서 봐야 할 건 '내가 왜 이러지?'가 아니라 <b>어떤 조건이 중심을 살리고, 어떤 조건이 먼저 흐름을 깨는지</b>야.`;
    }
    return `진짜 원인은 ‘원래 네 성격이 이래서’가 아니야. <b>${monthLine}</b>${josaSuffix(monthLine,"이야","야")}. 그리고 여기서 더 중요한 건 그 힘이 살아남는 조건이야.<br><br>${supportLine}. ${harmLine}. ${rescueLine} ${bridgeLine}<br><br>${relationLine} ${resolution}. 그래서 ${withJosa(situation.object,"을","를")} 볼 때도 ‘좋다/나쁘다’보다 <b>어떤 조건에서 네 중심이 살아나고, 어디서 먼저 꼬이는지</b>를 보는 게 맞아.`;
  }

  function changeOrder(reasoning, situation, isT) {
    const prescription = reasoning?.integrated?.prescription || {};
    const sequence = Array.isArray(prescription.sequence) ? prescription.sequence : [];
    const actions = [...new Set(sequence.map((row) => ELEMENT_ACTION[row?.element]).filter(Boolean))];
    if (!actions.length) {
      for (const group of reasoning?.integrated?.neededGroups || []) {
        const action = groupText(group).action;
        if (action && !actions.includes(action)) actions.push(action);
      }
    }
    const firstAction = actions[0] || "변수를 하나씩 분리해서 확인하는 것";
    const secondAction = actions[1] || "첫 변화가 실제로 먹히는지 확인한 뒤 다음 행동을 붙이는 것";
    const harmful = godsHuman(prescription.harmfulGods || reasoning?.integrated?.harmfulGods);
    const conflicts = prescription.conflicts || [];
    const special = reasoning?.unsupported || [];
    const conflictLine = conflicts.length
      ? "두 방향이 겹치지 않는 부분은 한꺼번에 밀지 않고, 먼저 네가 감당할 힘을 만들고 그다음 결과 쪽으로 쓰는 순서가 중요해."
      : "";
    const caution = special.length
      ? "확실하지 않은 부분은 억지로 단정하지 않았어."
      : "";
    if (isT) {
      return `<b>첫 순서</b> — ${firstAction}.<br><br><b>그다음</b> — ${secondAction}.<br><br><b>지금 고민에 적용</b> — ${situation.move}.<br><br><b>7일 검증 기준</b> — ${situation.metric}.<br><br>${harmful.length ? `특히 ${harmful.join("·")}이 과해지는 선택은 줄여.` : "한 번에 변수 여러 개를 바꾸지 마."} ${conflictLine} ${caution}`;
    }
    return `한꺼번에 바꾸기보다 순서가 중요해. <b>먼저 ${firstAction}</b>. 그다음 <b>${secondAction}</b>을 붙여봐.<br><br>지금 고민에서는 ${situation.move}. <b>이번 7일의 확인 기준은 ‘${situation.metric}’</b>이야.<br><br>${harmful.length ? `${harmful.join("·")}이 너무 커지는 방식은 오히려 원래 구조를 더 힘들게 만들 수 있어.` : "변수를 여러 개 한꺼번에 바꾸면 뭐가 효과 있었는지 놓치기 쉬워."} ${conflictLine} ${caution}`;
  }

  function godSpecificCondition(god, domain, kind) {
    const name = domain?.name || "이 고민";
    const help = {
      비견:`내가 결정할 범위와 내 몫이 분명한 ${name} 조건`,
      겁재:`경쟁·협업이 있어도 기여와 몫을 분명히 나눌 수 있는 ${name} 조건`,
      식신:`꾸준히 만든 결과가 쌓이고 실제 반응으로 돌아오는 ${name} 조건`,
      상관:`불편한 점을 말하고 바꿔도 불이익으로 돌아오지 않는 ${name} 조건`,
      정재:`시간·돈·보상·약속이 예측 가능하게 반복되는 ${name} 조건`,
      편재:`새 기회나 범위를 넓혀도 회수 기준이 분명한 ${name} 조건`,
      정관:`역할·책임·평가 기준이 처음부터 명확한 ${name} 조건`,
      편관:`난도와 부담이 있어도 권한·보호장치가 같이 주어지는 ${name} 조건`,
      정인:`배울 시간·자료·피드백과 회복 여지가 보장되는 ${name} 조건`,
      편인:`깊게 파거나 다른 방식을 시험할 재량이 있는 ${name} 조건`,
    };
    const harm = {
      비견:`내 방식만 지키느라 필요한 조정까지 어려워지는 ${name} 조건`,
      겁재:`경쟁만 세지고 기여·몫의 기준은 흐려지는 ${name} 조건`,
      식신:`계속 만들고 내놓지만 결과를 회수할 기준이 없는 ${name} 조건`,
      상관:`문제점을 말할수록 갈등이나 불이익이 커지는 ${name} 조건`,
      정재:`안정을 지키는 데 매여 필요한 변화까지 못 하는 ${name} 조건`,
      편재:`기회·사람·돈을 한꺼번에 벌려 회수 기준이 사라지는 ${name} 조건`,
      정관:`규칙·책임은 늘지만 기준과 보상은 자꾸 바뀌는 ${name} 조건`,
      편관:`부담·경쟁만 강하고 권한이나 보호장치는 없는 ${name} 조건`,
      정인:`준비·검토만 늘고 실제로 움직일 기회는 없는 ${name} 조건`,
      편인:`생각과 해석만 깊어지고 현실 확인은 계속 늦어지는 ${name} 조건`,
    };
    const table = kind === "harm" ? harm : help;
    return table[god] || null;
  }

  function domainFit(reasoning, situation, isT) {
    const domain = DOMAIN[situation.concern] || DOMAIN.money;
    const helpfulGods = reasoning?.integrated?.helpfulGods || [];
    const harmfulGods = reasoning?.integrated?.harmfulGods || [];
    const needed = reasoning?.integrated?.neededGroups || [];
    const goodRows = helpfulGods.length
      ? helpfulGods.slice(0,2).map(g => `<b>${GOD_USER[g] || g}</b> → ${godSpecificCondition(g,domain,"help") || domain.help[godGroup(g)] || domain.help.unknown}`)
      : needed.slice(0,2).map(g => `<b>${groupText(g).noun}</b> → ${domain.help[g] || domain.help.unknown}`);
    const pressureGroup = reasoning?.integrated?.pressureGroup || "unknown";
    const badRows = harmfulGods.length
      ? harmfulGods.slice(0,2).map(g => `<b>${GOD_USER[g] || g}</b>이 과해질 때 → ${godSpecificCondition(g,domain,"harm") || domain.harm[godGroup(g)] || domain.harm.unknown}`)
      : pressureGroup !== "unknown"
        ? [`<b>${groupText(pressureGroup).pressure}</b>이 과해질 때 → ${domain.harm[pressureGroup] || domain.harm.unknown}`]
        : [domain.harm.unknown];
    if (!goodRows.length) goodRows.push(domain.help.unknown);
    const state = reasoning?.integrated?.zipingState;
    const stateLine = state === "rescued"
      ? "처음부터 완벽한 곳만 찾기보다, 꼬였을 때 다시 조정할 통로가 실제로 있는지를 봐."
      : state === "damaged"
        ? "겉으로 버틸 만한지보다, 같은 조건이 반복될수록 네 중심이 계속 무너지는지를 봐."
        : "처음 느낌보다, 이 조건이 몇 번 반복됐을 때도 네 힘이 남는지를 봐.";
    if (isT) {
      return `<b>잘 맞는 조건</b><br>${goodRows.join("<br>")}<br><br><b>오래 두면 소모되는 조건</b><br>${badRows.join("<br>")}<br><br><b>마지막 판단 기준</b><br>${stateLine}`;
    }
    return `<b>잘 맞는 조건</b><br>${goodRows.join("<br>")}<br><br><b>오래 두면 소모되는 조건</b><br>${badRows.join("<br>")}<br><br><b>마지막 판단 기준</b><br>${stateLine} 네가 ${withJosa(domain.name,"을","를")} 볼 때는 ‘좋아 보이느냐’보다 <b>이 조건 안에서 실제로 내 힘이 남는가</b>를 보는 게 더 정확해.`;
  }

  function formatMonth(row) {
    if (!row) return "뚜렷하게 짚을 달 없음";
    if (row.startMonth) return `${row.startMonth}월 ${row.startDay ? row.startDay + "일 무렵부터" : ""}`;
    if (row.startYmd) return row.startYmd;
    return row.ganZhi || "해당 시기";
  }

  function timingNote(reasoning, situation, isT) {
    const timing = reasoning?.timing || {};
    const policy = global.__UNNI_PRODUCT_CONTENT_POLICY_V1__;
    const disclosed = policy?.filterTimingForProduct
      ? policy.filterTimingForProduct("basic_concern", timing)
      : {
          concernNearTerm: timing.concernNearTerm || null,
          longTermPivots: Array.isArray(timing.longTermPivots) ? timing.longTermPivots.slice(0,2) : [],
          fullSajuTimeline: null,
        };
    const near = disclosed.concernNearTerm || {};
    const nearMonths = Array.isArray(near.months) ? near.months : [];
    const longTermPivots = Array.isArray(disclosed.longTermPivots) ? disclosed.longTermPivots.slice(0,2) : [];
    const fullFiveYearAllowed = policy?.canRenderFeature?.("basic_concern", "full-five-year") === true;
    const cautionAction = ({
      money:"지출·손실이나 무리한 확장을 먼저 줄여.",
      career:"업무 과부하를 줄이고 이동·퇴사 같은 큰 결정은 서두르지 마.",
      love:"감정적으로 밀어붙이거나 관계 결론을 서두르지 마.",
      people:"갈등을 키우는 대응이나 관계 결정을 서두르지 마.",
      path:"큰 결정을 한꺼번에 확정하지 말고 작은 확인부터 해.",
      mental:"부담과 활동량을 한꺼번에 늘리지 말고 회복 여지를 먼저 남겨.",
    })[situation.concern] || "같은 속도로 밀지 말고 부담을 먼저 줄여.";

    if (!nearMonths.length) {
      return {
        desc:isT ? "현재 저장된 시기 데이터가 부족해서 특정 때를 만들어내지 않을게." : "지금은 시기 자료가 충분하지 않아서 언니가 날짜를 지어내진 않을게.",
        meta:{
          firstDate:null,secondDate:null,firstBody:"",secondBody:"",concernSituation:situation.key,
          structureFingerprint:reasoning?.structureFingerprint||"",timingFingerprint:reasoning?.timingFingerprint||"",
          method:timing.method||"",disclosureContract:"basic_concern",longTermPivotYears:[],fullFiveYearAllowed,
        },
      };
    }

    const supportRank=(row)=>{
      const e=row?.evidence||{};
      return [(row?.class==="supportive"?2:row?.class==="mild-support"?1:0),e.majorSupport||0,e.support||0,-(e.majorCaution||0),-(e.caution||0)];
    };
    const cautionRank=(row)=>{
      const e=row?.evidence||{};
      return [(row?.class==="caution"?2:row?.class==="mild-caution"?1:0),e.majorCaution||0,e.caution||0,-(e.majorSupport||0),-(e.support||0)];
    };
    const cmpTuple=(a,b)=>{
      for(let i=0;i<Math.max(a.length,b.length);i++){const d=(b[i]||0)-(a[i]||0);if(d)return d;}
      return 0;
    };

    const sourceHighlights=Array.isArray(near.highlights)&&near.highlights.length ? near.highlights : [];
    const pickedMonths=[...sourceHighlights];
    if(!pickedMonths.length){
      const monthSupport=x=>Number(x?.monthSpecific?.support||0)>0;
      const monthCaution=x=>Number(x?.monthSpecific?.caution||0)>0;
      const bestNear=[...nearMonths].filter(x=>["supportive","mild-support"].includes(x.class)&&monthSupport(x)).sort((a,b)=>cmpTuple(supportRank(a),supportRank(b))||String(a.startYmd).localeCompare(String(b.startYmd)))[0];
      const cautionNear=[...nearMonths].filter(x=>["caution","mild-caution"].includes(x.class)&&monthCaution(x)).sort((a,b)=>cmpTuple(cautionRank(a),cautionRank(b))||String(a.startYmd).localeCompare(String(b.startYmd)))[0];
      for(const row of [bestNear,cautionNear]){
        if(row&&!pickedMonths.some(x=>x.startYmd===row.startYmd))pickedMonths.push(row);
      }
    }
    pickedMonths.splice(3);
    pickedMonths.sort((a,b)=>String(a.startYmd).localeCompare(String(b.startYmd)));

    function timingReasonPhrase(row, positive) {
      const monthRows = positive ? (row?.layers?.wolun?.supportSignals || []) : (row?.layers?.wolun?.cautionSignals || []);
      const allRows = positive ? (row?.supportSignals || []) : (row?.cautionSignals || []);
      const rows = monthRows.length ? monthRows : allRows;
      const signal = rows.find(x => x.severity === "major") || rows.find(x => x.severity === "support") || null;
      if (!signal) return "";
      const layer = signal.layer === "daeun" ? "큰 흐름"
        : signal.layer === "seyun" ? "해의 흐름"
          : signal.layer === "wolun" ? "달의 흐름" : "이 시기";
      const code = signal.code || "";
      let effect = positive ? "받쳐주는 힘이" : "주의 신호가";
      if (/generate|rescue/.test(code)) effect = "회복·기반을 보태는 힘이";
      else if (/assist|root-add/.test(code)) effect = "내 힘과 버팀목을 보태는 흐름이";
      else if (/bridge|flow-unblock/.test(code)) effect = "막힌 연결을 이어주는 힘이";
      else if (/discharge/.test(code)) effect = "쌓인 힘을 밖으로 빼는 흐름이";
      else if (/control/.test(code)) effect = "힘을 역할과 기준으로 정리하는 흐름이";
      else if (/ziping-support/.test(code)) effect = "중심 구조를 살리는 힘이";
      else if (/root-clash/.test(code)) effect = "버티는 기반을 흔드는 신호가";
      else if (/body-cost/.test(code)) effect = "감당해야 할 부담을 키우는 신호가";
      else if (/ziping-harm/.test(code)) effect = "중심 흐름을 흔드는 신호가";
      else if (/over-support/.test(code)) effect = "이미 많은 힘을 더 쌓는 신호가";
      return `${layer}에서 ${effect}`;
    }

    const cautionActionBare = String(cautionAction).replace(/[.!?]+$/,"");
    function monthSentence(row) {
      const when = formatMonth(row);
      const supportWhy = timingReasonPhrase(row, true);
      const cautionWhy = timingReasonPhrase(row, false);
      if (row.class==="supportive") return `<b>${when}</b> — ${supportWhy || "중요한 도움 근거가"} 뚜렷하고, 크게 조심할 신호는 같이 잡히지 않아.`;
      if (row.class==="mild-support") return `<b>${when}</b> — ${supportWhy || "보조 도움 근거가"} 잡혀 있어서, 크게 벌리기보다 작은 확인을 해보기 좋아.`;
      if (row.class==="caution") return `<b>${when}</b> — ${cautionWhy || "중요한 주의 근거가"} 뚜렷해서, ${cautionActionBare}.`;
      if (row.class==="mild-caution") return `<b>${when}</b> — ${cautionWhy || "보조 주의 근거가"} 있어서, 속도를 줄이고 한 번 더 확인하는 편이 좋아.`;
      if (row.class==="mixed") return `<b>${when}</b> — 도움과 주의 근거가 같이 잡혀 있어서, 한 방향으로 단정하기보다 조건을 나눠서 움직여.`;
      return `<b>${when}</b> — 한쪽으로 강하게 기울지 않아서, 결과보다 준비 상태를 점검하기 좋아.`;
    }

    const nearBody = pickedMonths.length
      ? pickedMonths.map(monthSentence).join("<br><br>")
      : "앞으로 18개월의 큰 흐름은 계산돼 있지만, 월운 자체에서 다른 달과 구분되는 신호가 약해서 특정 달을 억지로 찍지는 않을게.";

    function pivotSentence(pivot) {
      const year = pivot?.year || String(pivot?.date||"").slice(0,4);
      if(!year || pivot?.isStructuralPivot!==true)return "";
      const reasons = pivot?.pivotReasons || [];
      const why = reasons.includes("major-flow-change") && reasons.includes("direction-change")
        ? "큰 흐름의 바탕이 바뀌고 도움·주의 방향도 함께 돌아서는 지점"
        : reasons.includes("major-flow-change")
          ? "큰 흐름의 바탕 자체가 교체되는 지점"
          : "앞선 해와 비교해 도움·주의 방향이 실제로 바뀌는 지점";
      if(pivot.class==="supportive"){
        return `<b>${year}년 전후</b> — ${why}이라, ${situation.object}에서는 이전과 같은 방식만 반복하기보다 힘이 붙는 새 조건을 확인해볼 가치가 있어.`;
      }
      return `<b>${year}년 전후</b> — ${why}이라, ${situation.object}에서는 이전 속도를 그대로 유지하기보다 방식과 부담을 다시 조정해야 해.`;
    }

    const pivotBody = longTermPivots.map(pivotSentence).filter(Boolean).join("<br><br>");
    const pivotSection = pivotBody ? `<br><br><b>그 이후 큰 변곡점</b><br>${pivotBody}<br><br>여기서는 실제로 흐름이 바뀌는 시점만 먼저 짚었어.` : "";

    const intro = isT
      ? "이 고민은 가까운 12~18개월을 가장 구체적으로 보는 게 실용적이야. 달까지 좁힐 근거가 있는 구간만 골랐어."
      : "이 고민은 멀리 있는 미래를 전부 늘어놓는 것보다, 앞으로 12~18개월에 언제 움직이고 언제 속도를 줄일지 아는 게 더 쓸모 있어. 언니가 달까지 좁힐 근거가 있는 구간만 골라봤어.";
    const close = isT
      ? `움직이기 좋은 구간엔 ${situation.move}. 조심 구간엔 ${cautionActionBare}.`
      : `움직이기 좋은 구간에는 ${situation.move}. 힘이 덜 받쳐주는 때는 ${cautionActionBare}.`;

    const first=pickedMonths[0]||longTermPivots[0]||null;
    const second=pickedMonths[1]||longTermPivots[1]||pickedMonths[2]||null;
    const label=(row)=>{
      if(!row)return null;
      if(row.scope==="year"||row.year&&!row.startYmd)return `${row.year}년`;
      return formatMonth(row);
    };
    return {
      desc:`${intro}<br><br><b>가까운 시기 상세</b><br>${nearBody}${pivotSection}<br><br>${close}`,
      meta:{
        firstDate:label(first),
        secondDate:label(second),
        firstBody:first?`${label(first)} ${first.class||""}`:"",
        secondBody:second?`${label(second)} ${second.class||""}`:"",
        concernSituation:situation.key,
        structureFingerprint:reasoning?.structureFingerprint||"",
        timingFingerprint:reasoning?.timingFingerprint||"",
        method:timing.method||"",
        horizonEnd:timing.horizonEnd||"",
        internalHorizonEnd:timing.internalHorizonEnd||"",
        detailEnd:timing.detailEnd||"",
        nearMonthCount:nearMonths.length,
        longTermPivotYears:longTermPivots.map(x=>x.year),
        disclosureContract:"basic_concern",
        fullFiveYearAllowed,
      },
    };
  }

  const CONCERN_GROUP_LINES = {
    money:{
      self:"돈 문제에서도 남 기준보다 네 방식대로 해결하려는 힘이 먼저 나와. 그래서 한 번 정한 소비·가격 기준을 바꾸는 타이밍이 늦어질 수 있어",
      print:"돈이 불안해지면 바로 움직이기보다 더 알아보고 준비하려는 쪽으로 가기 쉬워. 그래서 결정이 늦어질 수 있어",
      output:"아이디어나 하고 싶은 건 빨리 생기는데, 실제 가격·수입 기준을 붙이는 건 뒤로 갈 수 있어",
      wealth:"돈이나 기회가 보이면 현실 계산이 빨리 돌아가는 편이야. 대신 여러 가능성을 한꺼번에 잡으면 새는 곳도 같이 늘 수 있어",
      officer:"돈 문제에서도 안정과 책임을 먼저 챙기는 편이야. 그래서 보상 요구나 조건 변경을 늦출 수 있어",
      unknown:"돈 문제는 한 가지 이유보다 수입·지출·조건이 같이 움직여. 그래서 실제로 돈이 남는 장면을 기준으로 보는 게 맞아",
    },
    career:{
      self:"일에서는 네가 맡은 건 네가 끝내려는 힘이 강해. 그래서 도움을 청하거나 조건을 다시 말하는 시점이 늦어질 수 있어",
      print:"준비가 덜 됐다고 느끼면 실행보다 공부·검토를 더 늘리는 쪽으로 가기 쉬워",
      output:"결과를 만들고 보여주는 힘은 빠른 편이지만, 평가 기준과 어긋나면 한 만큼 인정받지 못했다고 느끼기 쉬워",
      wealth:"성과와 보상이 연결되는지 빨리 보는 편이야. 대신 기회가 여러 개 보이면 한쪽에 집중하기 어려워질 수 있어",
      officer:"책임·평가를 먼저 감당하려는 편이야. 그래서 일은 늘어나는데 네 요구는 뒤로 밀릴 수 있어",
      unknown:"일에서는 능력 하나보다 역할·평가·보상이 같이 맞아야 오래 편해져",
    },
    love:{
      self:"연애에서도 네 기준이 중요한 편이야. 마음이 생겨도 상대에게 전부 맞추기보다 내 선을 지키려는 쪽이 먼저 나와",
      print:"상대의 말과 행동을 그냥 넘기기보다 속뜻을 오래 생각하는 편이야. 애매한 반응이 길어질수록 혼자 해석하는 시간이 늘 수 있어",
      output:"마음이 움직이면 표현과 반응이 비교적 빠른 편이야. 그래서 상대 반응이 늦으면 온도 차이를 더 크게 느낄 수 있어",
      wealth:"좋아하면 시간·배려·에너지를 실제 행동으로 많이 쓰는 편이야. 문제는 주고받는 양이 기울 때도 네가 조금 더 쓰기 쉽다는 거야",
      officer:"관계를 망치고 싶지 않아서 약속이나 상대 기대를 먼저 맞추려는 편이야. 서운함을 바로 말하지 않으면 뒤에서 더 크게 쌓일 수 있어",
      unknown:"연애에서는 감정 하나보다 상대가 실제로 어떻게 행동하는지를 같이 봐야 네 판단이 선명해져",
    },
    path:{
      self:"진로는 남들이 좋다는 답보다 네가 납득해야 움직이는 편이야. 한번 마음먹으면 오래 밀지만, 방향을 바꾸는 데 시간이 걸릴 수 있어",
      print:"진로가 불안하면 직접 해보기보다 정보를 더 찾고 준비하려는 쪽으로 가기 쉬워",
      output:"생각만 할 때보다 직접 만들고 보여볼 때 적성이 더 빨리 드러나는 편이야",
      wealth:"진로에서도 현실성·수입·기회를 빨리 보는 편이야. 대신 조건이 좋은 선택지가 여러 개면 마음이 분산될 수 있어",
      officer:"안전한 길이나 정답처럼 보이는 기준을 먼저 의식하는 편이야. 그래서 네가 진짜 원하는 방향을 뒤로 미룰 수 있어",
      unknown:"진로는 생각만으로 맞는 답을 고르기보다 직접 해본 반응을 쌓아야 선명해져",
    },
    people:{
      self:"관계에서도 네 선은 분명한 편이지만, 한번 내 사람이라고 생각하면 생각보다 오래 참을 수 있어",
      print:"상대가 왜 그랬는지 이유를 많이 생각하는 편이야. 이해하려다 네 불편함을 뒤로 미룰 수 있어",
      output:"불편함을 말로 풀 수 있을 때는 관계 회복이 빠른 편이야. 반대로 말을 막는 관계에서는 소모가 확 커져",
      wealth:"사람에게 시간·도움·배려를 실제로 많이 쓰는 편이야. 주고받는 몫이 기울면 네 쪽 피로가 빨리 쌓여",
      officer:"예의·책임·관계 유지 역할을 많이 의식하는 편이야. 그래서 상대 잘못까지 네가 정리하려 들 수 있어",
      unknown:"사람 문제는 호감보다 선을 말했을 때 상대가 어떻게 반응하는지를 보는 게 더 정확해",
    },
    mental:{
      self:"힘들어도 일단 버티는 쪽이라 쉬어야 할 때를 늦게 알아차릴 수 있어",
      print:"피곤할수록 생각과 검토가 더 많아질 수 있어. 몸은 쉬는데 머리는 계속 일하는 식으로 남기 쉬워",
      output:"답답한 걸 말·글·움직임으로 빼낼 통로가 있을 때 훨씬 낫고, 안으로만 쌓이면 피로가 빨리 커져",
      wealth:"시간·일정·돈처럼 현실 변수가 흔들리면 마음도 같이 바빠지는 편이야. 한꺼번에 챙길 게 많을수록 소모가 커져",
      officer:"해야 한다는 기준이 강한 편이라 지쳐도 할 일을 먼저 챙길 수 있어. 그래서 회복을 자꾸 뒤로 미루기 쉬워",
      unknown:"지금은 이유를 하나로 단정하기보다 무엇을 줄였을 때 실제로 덜 지치는지 확인하는 게 먼저야",
    },
  };

  const SCENE_TITLES = {
    money:{
      saving:"돈이 안 남을 때 먼저 볼 장면",income:"수입을 늘릴 때 갈리는 지점",side:"부업을 실제 돈으로 바꿀 때 갈리는 지점",flow:"돈 흐름이 바뀔 때 먼저 볼 것",
    },
    career:{
      exam:"공부량보다 먼저 볼 합격 변수",jobsearch:"준비에서 지원으로 넘어갈 때 갈리는 지점",move:"이직·퇴사 판단에서 먼저 볼 것",current:"지금 자리에서 평가가 움직이는 조건",
    },
    love:{
      crush:"썸에서 상대 마음보다 먼저 볼 것",relationship:"지금 관계에서 먼저 볼 장면",breakup:"재회를 보기 전에 먼저 확인할 것",new:"새 인연이 들어올 때 먼저 볼 조건",
    },
    path:{
      lost:"진로가 안 보일 때 먼저 좁힐 것",current:"지금 길을 계속 갈지 판단하는 기준",switch:"분야를 바꾸기 전에 먼저 볼 것",strength:"내 강점이 실제로 드러나는 방식",
    },
    people:{
      friend:"친구 관계에서 먼저 볼 신호",work:"직장 관계에서 감정보다 먼저 볼 것",family:"가족과 부딪힐 때 먼저 볼 것",distance:"거리를 둘지 판단하는 핵심 기준",
    },
    mental:{
      burnout:"지쳤을 때 더 버틸지 말지 가르는 신호",overthink:"생각이 많아질 때 먼저 끊을 지점",low:"무기력할 때 먼저 회복할 부분",recover:"컨디션을 오래 회복시키는 조건",
    },
  };

  const DECISION_CRITERIA = {
    money:{
      saving:"한 달 반복했을 때 실제로 남는 돈이 늘어나는지 봐",
      income:"일이 늘 때 보상·단가·연봉 중 하나라도 같이 움직이는지 봐",
      side:"좋다는 반응보다 실제 결제나 구체적인 구매 의사가 생기는지 봐",
      flow:"좋은 시기라는 말보다 그때 수입·지출 행동을 실제로 바꿀 수 있는지 봐",
    },
    career:{
      exam:"공부시간보다 같은 유형에서 실전 결과가 나아지는지 봐",
      jobsearch:"준비량보다 지원 뒤 면접·연락 같은 현실 반응이 늘어나는지 봐",
      move:"다음 자리에서 네가 포기 못 할 조건이 실제로 충족되는지 봐",
      current:"책임이 늘 때 역할·평가·보상도 같이 움직이는지 봐",
    },
    love:{
      crush:"호감 표현보다 실제 약속을 잡고 지키는지 봐",
      relationship:"불편한 얘기를 꺼냈을 때 상대가 같이 조정하려는지 봐",
      breakup:"그리움보다 헤어진 핵심 이유가 실제로 달라졌는지 봐",
      new:"첫 느낌보다 만남이 이어져도 말과 행동이 같은지 봐",
    },
    path:{
      lost:"직접 해본 뒤에도 다시 해보고 싶은 마음이 남는지 봐",
      current:"시간이 지날수록 성장·만족·현실 보상 중 무엇이 실제로 나아지는지 봐",
      switch:"새 분야의 실제 하루를 경험해본 뒤에도 옮기고 싶은지 봐",
      strength:"잘하는 것뿐 아니라 반복해도 남들보다 덜 지치는지 봐",
    },
    people:{
      friend:"선을 말했을 때 웃어넘기지 않고 실제 행동을 바꾸는지 봐",
      work:"업무 경계를 말한 뒤 역할·연락 방식이 실제로 달라지는지 봐",
      family:"선을 말했을 때 죄책감만 주는지, 서로 조정할 여지를 보이는지 봐",
      distance:"거리를 조금 줄였을 때 오히려 네 마음과 생활이 편해지는지 봐",
    },
    mental:{
      burnout:"할 일을 줄였을 때 수면·피로·집중이 실제로 나아지는지 봐",
      overthink:"생각한 시간보다 실제 결정이나 행동 하나가 생기는지 봐",
      low:"큰 성과보다 기본 생활 하나가 다시 이어지는지 봐",
      recover:"한 번 몰아서가 아니라 반복해도 무리가 없는 방식인지 봐",
    },
  };

  function situationProfile(s) {
    return global.__PAID_VALUE_LAYER_V1__?.situationProfiles?.[s.concern]?.[s.key] || null;
  }

  function plainSentence(value) {
    const text=stripHtml(value).replace(/[.!?]+$/,"");
    return text ? text+"." : "";
  }

  function synthesisFor(reasoning){
    return reasoning?.synthesis || {
      mechanisms:{
        capacity:{
          verdict:reasoning?.integrated?.strength||"중화",
          rootQuality:firstFinding(reasoning,"root")?.facts?.quality||"unknown",
          seasonSupported:!!reasoning?.profile?.strength?.deukryeong?.active,
          partySupported:!!reasoning?.profile?.strength?.deukse?.active,
          rootClashCount:firstFinding(reasoning,"root")?.facts?.rootClashes?.length||0,
        },
        drive:{
          pressureGroup:reasoning?.integrated?.pressureGroup||"unknown",
          pressureOverload:!!firstFinding(reasoning,"pressure")?.facts?.overload,
          strongestElement:firstFinding(reasoning,"flow")?.facts?.strongestElement||null,
          blockedAt:firstFinding(reasoning,"flow-chain")?.facts?.blockedAt||null,
          rawInfluenceMismatch:!!firstFinding(reasoning,"flow")?.facts?.rawInfluenceMismatch,
        },
        structure:{
          state:reasoning?.integrated?.zipingState||"undetermined",
          path:reasoning?.integrated?.zipingPath||null,
          helpfulGods:reasoning?.integrated?.helpfulGods||[],
          rescueGods:reasoning?.integrated?.rescueGods||[],
          harmfulGods:reasoning?.integrated?.harmfulGods||[],
        },
        adjustment:{
          bridgeElement:reasoning?.integrated?.bridgeElement||null,
          bridgeStatus:reasoning?.integrated?.bridgeStatus||null,
          prescription:reasoning?.integrated?.prescription||{},
          conflicts:reasoning?.integrated?.conflicts||[],
        },
        friction:{
          clashCount:reasoning?.context?.clashes?.length||0,
          punishmentCount:reasoning?.context?.punishments?.length||0,
          harmCount:reasoning?.context?.harms?.length||0,
          breakCount:reasoning?.context?.breaks?.length||0,
          monthClashCount:0,
          relationCount:(reasoning?.context?.clashes?.length||0)+(reasoning?.context?.punishments?.length||0)+(reasoning?.context?.harms?.length||0)+(reasoning?.context?.breaks?.length||0),
        },
      },
      evidencePlan:{roles:{core:[],pattern:[],fit:[],caution:[],timing:[]},allImplementedRuleIds:[],unusedRuleIds:[]},
      guarded:!!reasoning?.integrated?.specialStructureGuarded,
    };
  }

  function evidenceIdsForRole(reasoning,role){
    return [...new Set(synthesisFor(reasoning)?.evidencePlan?.roles?.[role]||[])];
  }

  function capacitySentence(reasoning){
    const m=synthesisFor(reasoning).mechanisms?.capacity||{};
    const verdict=m.verdict||"중화";
    const root=m.rootQuality||"unknown";
    const season=!!m.seasonSupported;
    const party=!!m.partySupported;
    const clash=Number(m.rootClashCount||0)>0;
    let first;
    if(verdict==="신약"&&root==="rootless") first="너는 못 버티는 사람이 아니라, 바깥 요구를 오래 들고 있을수록 회복보다 소모가 먼저 쌓이는 쪽이야";
    else if(verdict==="신약") first="처음엔 꽤 버티는 편이지만, 오래 끌면 받쳐주는 힘보다 소모가 먼저 커지는 쪽이야";
    else if(verdict==="신강"&&["month-rooted","day-rooted"].includes(root)) first="쉽게 무너지지 않고 스스로 밀어붙이는 힘이 강한 편이라, 오히려 문제를 혼자 더 오래 들고 갈 수 있어";
    else if(verdict==="신강") first="기본적으로 밀어붙이는 힘은 충분한데, 힘이 센 만큼 멈출 시점을 늦게 잡을 수 있어";
    else first="한쪽으로 무조건 강하거나 약하다기보다, 상황에 따라 버티는 힘과 소모가 꽤 다르게 나타나는 편이야";

    let second;
    if(season&&party) second="기본적으로 받쳐주는 힘도 여러 군데에서 같이 붙는 편이야.";
    else if(season&&!party) second="중심을 받쳐주는 힘은 있지만, 모든 상황에서 자동으로 여유가 생기는 건 아니야.";
    else if(!season&&party) second="처음부터 편하게 받쳐지는 편은 아니지만, 다른 자리에서 보완해주는 힘은 분명히 있어.";
    else second="처음부터 넉넉하게 받쳐지는 편은 아니라서, 무리한 환경에서는 같은 일도 더 크게 소모될 수 있어.";
    if(clash) second+=" 게다가 버티는 축이 흔들릴 수 있는 신호가 있어서, '평소엔 되니까 계속 되겠지'라고 밀어붙이는 건 조심해야 해.";
    return first+". "+second;
  }

  function dominantFunctionSentence(reasoning){
    const row=(synthesisFor(reasoning).tenGodEvidence||[])[0];
    if(!row?.god) return "";
    const functionMap={
      비견:"남이 정해준 답보다 내 기준으로 결정할 때 힘이 더 또렷해지는 편이야",
      겁재:"경쟁하거나 함께 움직이는 상황에서 내 역할과 내 몫이 분명할수록 힘을 제대로 쓰는 편이야",
      식신:"한 번에 크게 터뜨리기보다 꾸준히 만들고 쌓아갈 때 장점이 안정적으로 드러나는 편이야",
      상관:"답답한 걸 그냥 참고 두기보다 말하거나 바꾸고 개선할 때 힘이 살아나는 편이야",
      정재:"변수가 계속 바뀌는 환경보다 약속·시간·보상처럼 예측 가능한 기준이 있을 때 힘을 안정적으로 쓰는 편이야",
      편재:"한 가지 가능성에만 갇히기보다 기회·사람·자원을 넓게 보고 움직일 때 힘을 쓰는 편이야",
      정관:"역할과 기준이 분명할수록 책임감을 실제 결과로 바꾸기 쉬운 편이야",
      편관:"난도가 있어도 내가 움직일 권한과 보호장치가 같이 있을 때 돌파력이 살아나는 편이야",
      정인:"충분히 이해하고 준비할 시간이나 믿을 만한 지원이 있을 때 훨씬 안정적으로 움직이는 편이야",
      편인:"남들이 그냥 넘기는 지점을 깊게 파고 다른 방법을 찾아볼 때 강점이 드러나는 편이야",
    };
    const core=functionMap[row.god]||"한 가지 방식만 밀기보다 실제 반응에 맞춰 조정할 때 힘이 살아나는 편이야";
    const visible=Number(row.visibleWeight||0);
    const hidden=Number(row.hiddenWeight||0);
    const surface=visible>hidden*1.15
      ? "이 방식은 생각 속에만 머무르기보다 실제 선택이나 행동으로 비교적 빨리 드러나는 쪽이야."
      : hidden>visible*1.15
        ? "다만 이 방식은 처음부터 겉으로 확 보이기보다, 익숙해진 상황이나 안쪽 판단에서 더 강하게 작동하는 쪽이야."
        : "겉으로 보이는 선택과 안쪽 판단에서 이 방식이 둘 다 비슷하게 작동하는 편이야.";
    return core+". "+surface;
  }

  function flowGapSentence(reasoning){
    const d=synthesisFor(reasoning).mechanisms?.drive||{};
    const b=d.blockedAt;
    const gapMap={
      "mok>hwa":"시작하거나 마음먹는 데서 끝나는 게 아니라, 그걸 밖으로 표현하고 보여주는 단계에서 끊기기 쉬워",
      "hwa>to":"표현하거나 시작한 뒤, 그걸 꾸준히 유지하고 생활 속 기준으로 굳히는 단계에서 끊기기 쉬워",
      "to>geum":"버티고 유지하는 건 되는데, 이제 뭘 남기고 뭘 버릴지 기준을 세우는 단계가 늦어지기 쉬워",
      "geum>su":"판단하고 잘라내는 건 빠른데, 그다음 다시 정보를 모으고 회복하는 단계가 부족해지기 쉬워",
      "su>mok":"생각하고 준비하는 건 충분한데, 다시 실제 시작으로 옮기는 단계가 늦어지기 쉬워",
    };
    if(b?.from&&b?.to) return gapMap[b.from+">"+b.to] || "힘이 없는 게 아니라, 한 단계에서 다음 단계로 넘기는 연결이 약해서 중간에서 막히기 쉬워";
    const path=d.flowPath||[];
    if(path.length) return "한 번 움직이기 시작하면 다음 단계로 이어지는 길은 있는 편이야. 그래서 시작 자체보다 어디에서 과해지는지를 보는 게 더 중요해";
    return "한 가지 반응만으로 설명하기보다, 시작부터 마무리까지 어느 단계에서 힘이 커지는지 같이 봐야 해";
  }

  function structureSentence(reasoning){
    const s=synthesisFor(reasoning).mechanisms?.structure||{};
    const path=s.path;
    if(path==="print-transform") return "부담을 정면으로 맞받기보다, 먼저 이해하고 정리할 시간을 가진 뒤 움직일 때 훨씬 안정적으로 힘을 써.";
    if(path==="food-control") return "부담을 머릿속에만 두기보다 작은 결과물이나 행동으로 빼낼 때 오히려 중심을 잡기 쉬워.";
    if(path==="mixed-control-cost") return "행동으로 빼내는 게 도움이 되긴 하지만 너무 많이 해내려고 하면 네 힘까지 같이 빠져서, 양 조절이 중요해.";
    if(path==="wealth-release") return "아이디어나 표현을 실제 결과·보상으로 연결해야 힘이 헛돌지 않아.";
    if(path==="print-control") return "바로 반응하기보다 한 번 이해하고 정리한 뒤 말할 때 네 장점이 더 살아.";
    if(path==="officer-control") return "강한 자기 힘을 역할·책임·기준에 묶어 쓸 때 결과가 더 안정적으로 남아.";
    if(path==="output-to-wealth") return "네 힘을 결과물로 빼고 그걸 실제 보상과 연결할 때 가장 자연스럽게 이어져.";
    if(s.state==="supported") return "잘되는 조건이 이미 서로 이어져 있어서, 맞는 환경에서는 힘이 한 방향으로 모이기 쉬워.";
    if(s.state==="rescued") return "꼬이게 만드는 조건이 있어도 다시 살려주는 통로가 있어서, 무엇을 먼저 쓰느냐가 중요해.";
    if(s.state==="damaged") return "방해하는 조건이 반복되면 원래 장점도 같이 깎이기 쉬워서, 버티는 것보다 환경을 고르는 게 중요해.";
    if(s.state==="mixed") return "잘되는 힘과 흔드는 힘이 같이 있어서, 같은 선택도 조건과 순서에 따라 체감 차이가 크게 날 수 있어.";
    return "한 가지 성향으로 단정하기보다, 잘되는 조건과 흔들리는 조건을 같이 봐야 정확해.";
  }

  function pressureGroupLine(reasoning,s){
    const group=synthesisFor(reasoning).mechanisms?.drive?.pressureGroup || reasoning?.integrated?.pressureGroup || "unknown";
    return CONCERN_GROUP_LINES[s.concern]?.[group] || CONCERN_GROUP_LINES[s.concern]?.unknown || "";
  }

  function relationSentence(reasoning){
    const f=synthesisFor(reasoning).mechanisms?.friction||{};
    if(Number(f.monthClashCount||0)>0) return "특히 사주의 중심 역할을 하는 자리까지 직접 부딪히는 신호가 있어서, 평소엔 괜찮던 방식도 특정 상황에서는 확 흔들릴 수 있어.";
    if(Number(f.clashCount||0)>0) return "서로 정면으로 부딪히는 힘도 같이 있어서, 한쪽을 세게 밀수록 다른 쪽에서 반작용이 생길 수 있어.";
    if(Number(f.relationCount||0)>0) return "안에서 서로 불편하게 당기고 미는 신호도 있지만, 이것 하나만으로 나쁘다고 단정하지 않고 다른 힘과 같이 봐야 해.";
    return "";
  }

  function guardSentence(reasoning,isT){
    if(!synthesisFor(reasoning).guarded) return "";
    return isT
      ? "다만 힘이 한쪽으로 아주 크게 몰린 후보라서, 일반적인 강·약 설명 하나만으로 확정하지 않았어."
      : "다만 힘이 한쪽으로 아주 크게 몰린 후보라서, 언니도 보통 사주처럼 한 가지 공식으로 단정하진 않았어.";
  }

  function supportRows(reasoning,s){
    const domain=DOMAIN[s.concern]||DOMAIN.money;
    const syn=synthesisFor(reasoning);
    const st=syn.mechanisms?.structure||{};
    const prescription=syn.mechanisms?.adjustment?.prescription||{};
    const godRank=Object.fromEntries((syn.tenGodEvidence||[]).map((row,i)=>[row.god,{score:Number(row.priorityScore||0),index:i}]));
    const gods=[...new Set([
      ...(st.rescueGods||[]),
      ...(st.helpfulGods||[]),
      ...(prescription.zipingGods||[]),
    ].filter(Boolean))].sort((a,b)=>(godRank[b]?.score||0)-(godRank[a]?.score||0)||(godRank[a]?.index??999)-(godRank[b]?.index??999));
    const rows=gods.slice(0,3).map(g=>({
      god:g,
      label:GOD_USER[g]||g,
      text:godSpecificCondition(g,domain,"help")||domain.help[godGroup(g)]||domain.help.unknown,
    }));
    if(!rows.length){
      const groups=[...new Set(reasoning?.integrated?.neededGroups||[])];
      groups.slice(0,2).forEach(g=>rows.push({god:null,label:groupText(g).noun,text:domain.help[g]||domain.help.unknown}));
    }
    if(!rows.length) rows.push({god:null,label:"확인 가능한 조건",text:domain.help.unknown});
    return rows;
  }

  function harmRows(reasoning,s){
    const domain=DOMAIN[s.concern]||DOMAIN.money;
    const syn=synthesisFor(reasoning);
    const st=syn.mechanisms?.structure||{};
    const godRank=Object.fromEntries((syn.tenGodEvidence||[]).map((row,i)=>[row.god,{score:Number(row.priorityScore||0),index:i}]));
    const gods=[...new Set(st.harmfulGods||[])].sort((a,b)=>(godRank[b]?.score||0)-(godRank[a]?.score||0)||(godRank[a]?.index??999)-(godRank[b]?.index??999));
    const rows=gods.slice(0,3).map(g=>({
      god:g,
      label:GOD_USER[g]||g,
      text:godSpecificCondition(g,domain,"harm")||domain.harm[godGroup(g)]||domain.harm.unknown,
    }));
    if(!rows.length){
      const group=syn.mechanisms?.drive?.pressureGroup||"unknown";
      rows.push({god:null,label:groupText(group).pressure,text:domain.harm[group]||domain.harm.unknown});
    }
    return rows;
  }

  function adjustmentSentence(reasoning){
    const a=synthesisFor(reasoning).mechanisms?.adjustment||{};
    const seq=a.prescription?.sequence||[];
    const actions=[...new Set(seq.map(x=>ELEMENT_ACTION[x?.element]).filter(Boolean))];
    const bridge=a.bridgeElement;
    const parts=[];
    if(actions[0]) parts.push("먼저 "+actions[0]);
    if(actions[1]) parts.push("그다음 "+actions[1]);
    if(bridge&&a.bridgeStatus==="missing") parts.push("서로 맞서는 힘 사이를 이어줄 중간 단계가 원래 약해서, 한 번에 점프하기보다 연결 단계를 따로 만드는 게 중요해");
    else if(bridge) parts.push("서로 맞서는 힘 사이를 이어주는 연결은 이미 있어서, 그 통로를 실제 생활에서 쓰는 게 중요해");
    if((a.conflicts||[]).length) parts.push("잘되는 방식과 네가 감당할 수 있는 방식이 완전히 같지는 않아서, 먼저 버틸 여지를 만든 뒤 결과를 키워야 해");
    return parts.join(". ");
  }

  function noteOneDesc(reasoning,s,p,isT){
    const core=plainSentence(pressureGroupLine(reasoning,s));
    const capacity=capacitySentence(reasoning);
    const working=structureSentence(reasoning);
    const actual=stripHtml(p?.actual||"");
    const mismatch=synthesisFor(reasoning).mechanisms?.drive?.rawInfluenceMismatch
      ? "겉으로 보이는 오행 개수와 실제로 힘을 쓰는 순서도 같지 않아서, 단순히 많은 글자만 보고 해석하면 이 사람의 핵심을 놓치게 돼."
      : "";
    const guard=guardSentence(reasoning,isT);
    const lead=isT?"<b>결론</b> — ":"<b>결론</b> — 언니가 보기엔 ";
    const capacityLine=isT ? capacity : "쉽게 말하면 "+capacity;
    const workingLine=isT ? working : "그래서 네 힘을 제대로 쓰려면 "+working.charAt(0).toLowerCase()+working.slice(1);
    return [
      lead+core,
      capacityLine,
      dominantFunctionSentence(reasoning),
      workingLine,
      mismatch,
      actual ? (isT ? `<b>지금 고민에 적용</b> — ${actual}` : `지금 네 고민에 놓고 보면 <b>${actual}</b>`) : "",
      guard,
    ].filter(Boolean).join("<br><br>");
  }

  function noteTwoDesc(reasoning,s,p,isT){
    const trigger=stripHtml(p?.trigger||s.cue);
    const reaction=stripHtml(p?.reaction||"");
    const cost=stripHtml(p?.cost||"");
    const pressure=plainSentence(pressureGroupLine(reasoning,s));
    const capacity=capacitySentence(reasoning);
    const flow=flowGapSentence(reasoning);
    const relation=relationSentence(reasoning);
    const conclusion=isT
      ? `<b>결론</b> — 이 고민은 결과가 나빠지는 마지막 순간보다, <b>${trigger}</b> 같은 초반 장면에서 먼저 갈려.`
      : `<b>결론</b> — 네 경우엔 마지막 결과보다 <b>${trigger}</b> 같은 순간에서 이미 방향이 갈리기 쉬워.`;
    const scene=reaction&&cost
      ? `예를 들면 이런 상황에서는 <b>${reaction}</b> 같은 반응으로 이어질 수 있고, 그게 계속되면 ${cost} 같은 체감이 남기 쉬워. 이건 과거에 꼭 그랬다는 뜻이 아니라, 지금 사주에서 가장 먼저 경계할 반복 방식이야.`
      : "";
    return [
      conclusion,
      pressure+" "+capacity,
      flow+".",
      scene,
      relation,
      structureSentence(reasoning),
    ].filter(Boolean).join("<br><br>");
  }

  function noteThreeDesc(reasoning,s,p,isT){
    const rows=supportRows(reasoning,s);
    const first=rows[0];
    const rest=rows.slice(1);
    const keep=stripHtml(p?.keep||"");
    const place=stripHtml(p?.place||"");
    const adjust=adjustmentSentence(reasoning);
    const state=synthesisFor(reasoning).mechanisms?.structure?.state||"undetermined";
    const closing=state==="rescued"
      ? "특히 처음부터 완벽한 사람·환경보다, 한번 꼬였을 때 대화나 조건을 다시 맞출 통로가 실제로 있는지가 중요해."
      : state==="damaged"
        ? "겉으로 괜찮아 보여도 같은 조건이 반복될수록 네 힘이 계속 줄어들면 오래 두는 쪽이 아니야."
        : "처음 느낌보다 같은 조건이 반복됐을 때도 네 힘이 남는지를 보는 게 정확해.";
    return [
      isT
        ? `<b>결론</b> — 맞는 조건 1순위는 <b>${first.text}</b>`
        : `<b>결론</b> — 너한테 제일 편하게 맞는 건 <b>${first.text}</b>`,
      rest.length
        ? (isT ? `추가 조건 — ${rest.map(x=>`<b>${x.text}</b>`).join(" / ")}` : `그리고 ${rest.map(x=>`<b>${x.text}</b>`).join(" / ")}까지 같이 있으면 훨씬 덜 지쳐.`)
        : "",
      keep
        ? (isT ? `<b>현실에서 볼 것</b> — ${keep}` : `사람이나 상황을 볼 땐 <b>${keep}</b> 쪽을 먼저 봐.`)
        : "",
      place
        ? (isT ? `<b>환경</b> — ${place}` : `환경까지 보면 <b>${place}</b>일수록 네 장점이 덜 깎여.`)
        : "",
      adjust ? adjust+"." : "",
      isT ? closing.replace("특히 ","").replace("처음 느낌보다 ","판단은 ") : closing,
    ].filter(Boolean).join("<br><br>");
  }

  function noteFourDesc(reasoning,s,p,isT){
    const rows=harmRows(reasoning,s);
    const first=rows[0];
    const rest=rows.slice(1);
    const cut=stripHtml(p?.cut||"");
    const criterion=stripHtml(DECISION_CRITERIA[s.concern]?.[s.key]||"말보다 실제 반응이 달라지는지 봐");
    const drive=synthesisFor(reasoning).mechanisms?.drive||{};
    const overload=drive.pressureOverload
      ? "이 힘은 지금 사주에서 단순한 배경이 아니라 실제 부담으로 커질 수 있는 쪽이라, 반복되면 무시하지 않는 게 좋아."
      : "한 번 나타났다고 바로 나쁜 건 아니지만, 같은 조건이 계속 반복되면 소모 쪽으로 기울 수 있어.";
    const conflict=(synthesisFor(reasoning).mechanisms?.adjustment?.conflicts||[]).length
      ? "특히 결과를 내는 방식과 네가 감당할 수 있는 방식이 어긋나는 부분이 있어서, '할 수 있냐'보다 '이걸 계속 해도 내 힘이 남느냐'를 봐야 해."
      : "";
    return [
      isT
        ? `<b>결론</b> — 우선 제외할 조건은 <b>${first.text}</b>`
        : `<b>결론</b> — 네가 제일 먼저 거리를 둬야 할 건 <b>${first.text}</b>`,
      rest.length
        ? (isT ? `추가 주의 — ${rest.map(x=>`<b>${x.text}</b>`).join(" / ")}` : `그리고 ${rest.map(x=>`<b>${x.text}</b>`).join(" / ")}도 같이 반복되면 오래 두지 않는 게 좋아.`)
        : "",
      cut
        ? (isT ? `<b>현실 신호</b> — ${cut}` : `현실에서는 <b>${cut}</b> 같은 반응이 반복되는지 먼저 봐.`)
        : "",
      overload,
      conflict,
      relationSentence(reasoning),
      isT ? `<b>판단 기준</b> — ${criterion}.` : `<b>마지막으로 이것만 봐</b> — ${criterion}.`,
    ].filter(Boolean).join("<br><br>");
  }

  function compactTimingReason(row,positive){
    const rows=positive ? (row?.layers?.wolun?.supportSignals||[]) : (row?.layers?.wolun?.cautionSignals||[]);
    const signal=rows.find(x=>x.severity==="major")||rows.find(x=>x.severity==="support")||rows[0]||null;
    const code=signal?.code||"";
    if(positive){
      if(/generate|rescue|root-add|assist/.test(code)) return "평소 부족하던 버팀목이 보태져서, 같은 일을 해도 덜 버겁게 움직일 수 있어";
      if(/bridge|flow-unblock/.test(code)) return "평소 중간에서 끊기던 연결이 이어지기 쉬워";
      if(/discharge/.test(code)) return "생각이나 에너지를 말·결과물·행동으로 빼내기가 평소보다 쉬워";
      if(/control/.test(code)) return "기준을 세우고 우선순위를 정리하기가 평소보다 쉬워";
      if(/ziping-support/.test(code)) return "원래 잘되는 방식이 실제 결과로 이어지기 쉬워";
      return "작게 움직여 실제 반응을 확인해보기 좋은 쪽이야";
    }
    if(/root-clash/.test(code)) return "평소 버티던 축이 흔들리기 쉬워서 큰 결정을 한꺼번에 밀기엔 불리해";
    if(/body-cost/.test(code)) return "감당할 일이 늘기 쉬워서 범위를 먼저 줄이는 게 좋아";
    if(/ziping-harm/.test(code)) return "평소 잘되던 방식이 꼬이기 쉬워서 조건을 한 번 더 확인하는 게 좋아";
    if(/over-support/.test(code)) return "이미 강한 힘이 더 세져 고집이나 과부하로 번지기 쉬워";
    return "한 번에 크게 결정하기보다 부담을 줄이고 확인하는 쪽이 좋아";
  }

  function compactTimingNote(reasoning,s,p,isT){
    const timing=reasoning?.timing||{};
    const policy=global.__UNNI_PRODUCT_CONTENT_POLICY_V1__;
    const disclosed=policy?.filterTimingForProduct
      ? policy.filterTimingForProduct("basic_concern",timing)
      : {concernNearTerm:timing.concernNearTerm||null,longTermPivots:(timing.longTermPivots||[]).slice(0,2)};
    const near=disclosed.concernNearTerm||{};
    const highlights=(near.highlights||[]).filter(row=>{
      const ms=row?.monthSpecific||{};
      return Number(ms.support||0)>0||Number(ms.caution||0)>0;
    });
    const uniqueHighlights=[];
    const seen=new Set();
    for(const row of highlights){
      const positive=["supportive","mild-support"].includes(row.class);
      const caution=["caution","mild-caution"].includes(row.class);
      const reason=positive?compactTimingReason(row,true):caution?compactTimingReason(row,false):"좋은 점과 주의할 점이 같이 보여";
      const key=(positive?"P":caution?"C":"M")+"|"+reason;
      if(seen.has(key)) continue;
      seen.add(key); uniqueHighlights.push(row);
      if(uniqueHighlights.length>=2) break;
    }
    const pivot=(disclosed.longTermPivots||[]).find(x=>x?.isStructuralPivot===true)||null;
    const evidenceRuleIds=[...new Set([
      ...evidenceIdsForRole(reasoning,"timing"),
      ...uniqueHighlights.flatMap(row=>[
        ...(row?.layers?.wolun?.supportSignals||[]),
        ...(row?.layers?.wolun?.cautionSignals||[]),
      ].flatMap(x=>x?.sourceRuleIds||[])),
      ...(pivot?.sourceRuleIds||[]),
    ].filter(Boolean))];

    const first=uniqueHighlights[0]||null;
    const summary=first
      ? (["supportive","mild-support"].includes(first.class)
          ? (isT
              ? `<b>결론</b> — 가까운 흐름에서 움직여볼 근거가 있는 달이 잡혀. 자동으로 잘된다는 뜻은 아니고, 실제 반응을 시험하기 좋은 구간이야.`
              : `<b>결론</b> — 언니가 시기까지 보면, 가까운 흐름에 실제로 움직여볼 만한 달이 잡혀. 운이 알아서 해결해주는 때라기보다, 평소 막히던 걸 직접 시험해보기 좋은 구간이야.`)
          : (isT
              ? `<b>결론</b> — 가까운 흐름에서 속도를 줄여야 할 달이 잡혀. 나쁜 일이 정해진 게 아니라, 평소 약한 부분에 부담이 더 붙기 쉬운 구간이야.`
              : `<b>결론</b> — 가까운 흐름에선 잠깐 속도를 줄이는 게 나은 달도 보여. 나쁜 일이 생긴다고 정해진 게 아니라, 평소 약한 부분이 더 버겁게 느껴질 수 있는 구간이야.`))
      : (isT
          ? "<b>결론</b> — 가까운 18개월은 계산되지만 다른 달과 분명히 갈리는 월 신호가 약해. 특정 달은 억지로 찍지 않을게."
          : "<b>결론</b> — 가까운 18개월 흐름은 다 봤는데, 다른 달과 확실히 갈리는 신호가 약해. 그래서 언니도 그럴듯하게 날짜를 만들어 찍진 않을게.");

    const lines=uniqueHighlights.map(row=>{
      const when=formatMonth(row);
      const positive=["supportive","mild-support"].includes(row.class);
      const caution=["caution","mild-caution"].includes(row.class);
      if(positive) return `<b>${when}</b> — ${compactTimingReason(row,true)}. 이때는 ${stripHtml(p?.first||s.move)}처럼 실제 반응을 확인하는 행동을 붙여봐.`;
      if(caution) return `<b>${when}</b> — ${compactTimingReason(row,false)}. 이때는 결론을 서두르기보다 부담·범위·속도를 먼저 조정하는 쪽이 좋아.`;
      return `<b>${when}</b> — 도움과 주의가 같이 보여서 한 번에 크게 움직이기보다 작은 확인부터 하는 게 좋아.`;
    });

    if(pivot?.year){
      const reasons=pivot.pivotReasons||[];
      const why=reasons.includes("major-flow-change")&&reasons.includes("direction-change")
        ?"큰 흐름의 바탕이 바뀌면서 도움·주의 방향도 같이 돌아서는 구간"
        : reasons.includes("major-flow-change")
          ?"몇 년 단위의 큰 흐름 바탕이 교체되는 구간"
          :"앞선 해와 비교해 도움·주의 방향이 실제로 바뀌는 구간";
      lines.push(`<b>${pivot.year}년 전후</b> — ${why}이라 장기적으로는 같은 방식만 반복하지 않는 게 중요해. 여기서는 시점만 먼저 짚을게.`);
    }

    const action=plainSentence(p?.first||s.move);
    lines.push(`<b>지금 할 것</b> — ${action}`);
    const label=row=>row?formatMonth(row):null;
    return {
      desc:[summary,...lines].join("<br><br>"),
      evidenceRuleIds,
      meta:{
        firstDate:label(uniqueHighlights[0]||null),
        secondDate:label(uniqueHighlights[1]||null),
        firstBody:uniqueHighlights[0]?`${label(uniqueHighlights[0])} ${uniqueHighlights[0].class||""}`:"",
        secondBody:uniqueHighlights[1]?`${label(uniqueHighlights[1])} ${uniqueHighlights[1].class||""}`:"",
        concernSituation:s.key,
        structureFingerprint:reasoning?.structureFingerprint||"",
        timingFingerprint:reasoning?.timingFingerprint||"",
        method:timing.method||"",
        horizonEnd:timing.horizonEnd||"",
        internalHorizonEnd:timing.internalHorizonEnd||"",
        detailEnd:timing.detailEnd||"",
        nearMonthCount:Array.isArray(near.months)?near.months.length:0,
        longTermPivotYears:pivot?.year?[pivot.year]:[],
        disclosureContract:"basic_concern",
        fullFiveYearAllowed:false,
      },
    };
  }

  function badgeFor(concern,idx){
    return ["핵심","실제 장면","잘 맞는 조건","거를 신호","가까운 흐름"][idx]||"핵심";
  }

  function titleFor(s,idx,isT,profile){
    if(idx===0) return `${profile?.label||s.label} — 네 사주에서 제일 먼저 보이는 답`;
    if(idx===1) return SCENE_TITLES[s.concern]?.[s.key]||"실제로 갈리는 장면";
    if(idx===2){
      const rows={money:"돈이 남는 조건",career:"잘 풀리는 일·공부 조건",love:"너랑 오래 맞는 사람·관계",path:"너한테 맞는 진로 조건",people:"남겨도 되는 사람·관계",mental:"회복이 붙는 조건"};
      return rows[s.concern]||"잘 맞는 조건";
    }
    if(idx===3){
      const rows={money:"돈에서 빨리 끊어야 할 신호",career:"일·공부에서 빨리 거를 신호",love:"연애에서 빨리 거를 신호",path:"진로에서 피해야 할 신호",people:"거리를 둬야 할 관계 신호",mental:"지금 더 지치게 하는 신호"};
      return rows[s.concern]||"빨리 거를 신호";
    }
    const rows={money:"가까운 돈 흐름과 지금 할 것",career:"가까운 일·시험 흐름과 지금 할 것",love:"가까운 연애 흐름과 지금 할 것",path:"가까운 진로 흐름과 지금 할 것",people:"가까운 관계 흐름과 지금 할 것",mental:"가까운 회복 흐름과 지금 할 것"};
    return rows[s.concern]||"가까운 흐름과 지금 할 것";
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
    data=data||{};
    const isT=mode==="T";
    const d=buildConcernDiagnosisV2(data);
    const r=d.reasoning;
    const s=d.situation;
    const p=situationProfile(s)||{
      label:s.label,focus:s.cue,trigger:s.cue,reaction:"익숙한 방식으로 먼저 반응해",cost:"같은 고민이 다시 남을 수 있어",
      assumed:"내가 더 잘하면 해결된다",actual:"실제 반응이 달라지는 조건을 확인하는 게 먼저야",
      keep:"말과 행동이 일치하는 사람",cut:"말해도 같은 불편함을 반복하는 반응",place:"기준을 직접 확인할 수 있는 환경",
      first:s.move,
    };
    const timing=compactTimingNote(r,s,p,isT);
    const notes=[
      {
        badge:badgeFor(s.concern,0),
        title:titleFor(s,0,isT,p),
        desc:noteOneDesc(r,s,p,isT),
        checklist:"",
        __evidenceRuleIds:evidenceIdsForRole(r,"core"),
      },
      {
        badge:badgeFor(s.concern,1),
        title:titleFor(s,1,isT,p),
        desc:noteTwoDesc(r,s,p,isT),
        checklist:"",
        __evidenceRuleIds:evidenceIdsForRole(r,"pattern"),
      },
      {
        badge:badgeFor(s.concern,2),
        title:titleFor(s,2,isT,p),
        desc:noteThreeDesc(r,s,p,isT),
        checklist:"",
        __evidenceRuleIds:evidenceIdsForRole(r,"fit"),
      },
      {
        badge:badgeFor(s.concern,3),
        title:titleFor(s,3,isT,p),
        desc:noteFourDesc(r,s,p,isT),
        checklist:"",
        __evidenceRuleIds:evidenceIdsForRole(r,"caution"),
      },
      {
        badge:badgeFor(s.concern,4),
        title:titleFor(s,4,isT,p),
        desc:timing.desc,
        checklist:"",
        __timingQA:timing.meta,
        __evidenceRuleIds:[...new Set([...evidenceIdsForRole(r,"timing"),...(timing.evidenceRuleIds||[])])],
      },
    ];

    const claimMap=[0,1,4,2,5];
    (r.claims||[]).forEach(claim=>{
      if(claim){
        claim.userNoteIndex=null;
        if(Object.prototype.hasOwnProperty.call(claim,"noteSentence")) delete claim.noteSentence;
      }
    });
    notes.forEach((note,idx)=>{
      note.themeNum=String(idx+1).padStart(2,"0");
      const claim=r.claims?.[claimMap[idx]];
      if(claim?.evidenceStatus==="insufficient-evidence"){
        note.desc += isT
          ? "<br><br>이 부분은 근거가 한쪽만 잡혀 있어서 확정해서 말하지 않을게."
          : "<br><br>이 부분은 근거가 한쪽만 잡혀 있어서 언니도 확정해서 말하진 않을게.";
      }
      if(claim){
        claim.userNoteIndex=idx+1;
        claim.noteSentence=stripHtml(note.desc);
      }
    });

    const paidValueAudit=typeof global.auditPaidValueNotes==="function"
      ? global.auditPaidValueNotes(notes,mode||"F")
      : null;
    if(paidValueAudit&&data&&typeof data==="object") data.paidValueAudit=paidValueAudit;

    const implementedRuleIds=[...new Set(r.synthesis?.evidencePlan?.allImplementedRuleIds||[])];
    const renderedRuleIds=[...new Set(notes.flatMap(note=>note.__evidenceRuleIds||[]).filter(Boolean))];
    const missingRuleIds=implementedRuleIds.filter(id=>!renderedRuleIds.includes(id));
    const audit={
      version:VERSION,
      engine:"classical-causal-full-evidence",
      fingerprint:r.structureFingerprint+"|"+s.concern+"|"+s.key,
      genericClusterDependency:false,
      structureFingerprint:r.structureFingerprint,
      timingFingerprint:r.timingFingerprint,
      synthesisFingerprint:r.synthesis?.fingerprint||"",
      situation:{concern:s.concern,key:s.key},
      noteCount:notes.length,
      outputClaimMap:claimMap.map((claimIndex,noteIndex)=>({noteNum:noteIndex+1,claimNum:claimIndex+1})),
      noteEvidence:notes.map((note,index)=>({noteNum:index+1,ruleIds:note.__evidenceRuleIds||[]})),
      evidenceCoverage:{
        implementedRuleIds,
        renderedRuleIds,
        missingRuleIds,
        coverageRate:implementedRuleIds.length?Math.round((renderedRuleIds.filter(id=>implementedRuleIds.includes(id)).length/implementedRuleIds.length)*1000)/1000:1,
      },
      ditianRuleIds:r.ditian?.findings?.map(x=>x.id)||[],
      zipingRuleIds:r.ziping?.findings?.map(x=>x.id)||[],
      priorityMechanisms:r.synthesis?.priorityMechanisms||[],
      tenGodEvidence:r.synthesis?.tenGodEvidence||[],
      contradictionFlags:r.synthesis?.contradictionFlags||[],
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
