(function (global) {
  "use strict";

  const VERSION = "3.2.1";
  const CONCERNS = ["money","career","love","path","people","mental"];

  function hasBatchim(value) {
    const chars = Array.from(String(value || "").trim());
    for (let i = chars.length - 1; i >= 0; i -= 1) {
      const code = chars[i].charCodeAt(0);
      if (code >= 0xAC00 && code <= 0xD7A3) return (code - 0xAC00) % 28 !== 0;
    }
    return false;
  }

  function withJosa(value, withBatchim, withoutBatchim) {
    const text = String(value || "");
    return text + (hasBatchim(text) ? withBatchim : withoutBatchim);
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
    return `보통 <b>${situation.cue}</b>에서 시작돼. 그때 네 사주에서는 ${p.pressure}이 가장 먼저 커져.<br><br>그리고 ${middle}.<br><br>여기서 중요한 건 네가 약해서가 아니라, <b>그 힘을 어떤 순서로 받아내느냐</b>야. ${end}.<br><br>언니는 ${withJosa(situation.object,"이","가")} 꼬인 마지막 장면보다 이 첫 순서를 먼저 잡고 싶어.`;
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
    const bridgeLine = bridge ? `그리고 서로 부딪히는 힘 사이에서는 <b>${bridge}</b> 기운이 중간 연결 역할을 할 수 있어.` : "";
    const conflictLine = conflict
      ? "두 판단이 완전히 같은 방향은 아니라서, 먼저 버틸 힘이나 이어주는 조건을 만든 뒤 그다음 행동으로 옮겨야 해"
      : "";
    if (isT) {
      return `원인은 단순 성격이 아니야. 태어난 계절에서 잡힌 중심 구조상 <b>${monthLine}</b>이고, 실제 성패를 보면 ${zipingUser(reasoning)}<br><br>${supportLine}. ${harmLine}. ${bridgeLine}<br><br>${conflictLine || "강약 판단과 구조 판단이 같은 방향이면 그 조건을 더 강하게 본다."} 그래서 ${situation.object}의 원인을 범용 성향 하나로 줄이면 안 돼.`;
    }
    return `진짜 원인은 ‘원래 네 성격이 이래서’가 아니야. 네 사주 전체의 중심을 보면 <b>${monthLine}</b>이야. 그리고 그 구조가 실제로 잘 굴러가는지까지 보면, ${zipingUser(reasoning)}<br><br>쉽게 풀면 ${supportLine}. ${harmLine}. ${bridgeLine}<br><br>${conflictLine || "두 판단이 같은 방향을 가리킬 때는 그 조건을 더 중요하게 볼 수 있어."} 언니가 ${withJosa(situation.object,"을","를")} 볼 때 이 구조부터 보는 이유가 그거야.`;
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
      ? "다만 아직 확정 규칙이 없는 특수한 구조나 묶임은 결과에 억지로 끼워 넣지 않았어."
      : "";
    if (isT) {
      return `<b>첫 순서</b> — ${firstAction}.<br><br><b>그다음</b> — ${secondAction}.<br><br><b>지금 고민에 적용</b> — ${situation.move}.<br><br><b>7일 검증</b> — ${situation.metric}.<br><br>${harmful.length ? `특히 ${harmful.join("·")}이 과해지는 선택은 줄여.` : "한 번에 변수 여러 개를 바꾸지 마."} ${conflictLine} ${caution}`;
    }
    return `한꺼번에 바꾸기보다 순서가 중요해. <b>먼저 ${firstAction}</b>. 그다음 <b>${secondAction}</b>을 붙여봐.<br><br>지금 고민에서는 ${situation.move}. 그리고 이번 7일은 <b>${situation.metric}</b>만 확인해보자.<br><br>${harmful.length ? `${harmful.join("·")}이 너무 커지는 방식은 오히려 원래 구조를 더 힘들게 만들 수 있어.` : "변수를 여러 개 한꺼번에 바꾸면 뭐가 효과 있었는지 놓치기 쉬워."} ${conflictLine} ${caution}`;
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
    return `네 사주에서 ${domain.name}을 볼 때 잘 맞는 쪽은 <b>${good.join(" / ")}</b>이야.<br><br>반대로 오래 두면 소모가 커지는 쪽은 <b>${bad.join(" / ")}</b>이고.<br><br>${stateLine} ‘좋아 보이는가’보다 <b>내 사주의 좋은 힘이 여기서 실제로 잘 쓰이는가</b>를 보는 게 더 정확해.`;
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
      const bestNear=[...nearMonths].filter(x=>["supportive","mild-support"].includes(x.class)).sort((a,b)=>cmpTuple(supportRank(a),supportRank(b))||String(a.startYmd).localeCompare(String(b.startYmd)))[0];
      const cautionNear=[...nearMonths].filter(x=>["caution","mild-caution"].includes(x.class)).sort((a,b)=>cmpTuple(cautionRank(a),cautionRank(b))||String(a.startYmd).localeCompare(String(b.startYmd)))[0];
      for(const row of [bestNear,cautionNear,...nearMonths]){
        if(row&&!pickedMonths.some(x=>x.startYmd===row.startYmd))pickedMonths.push(row);
        if(pickedMonths.length>=3)break;
      }
    }
    pickedMonths.splice(3);
    pickedMonths.sort((a,b)=>String(a.startYmd).localeCompare(String(b.startYmd)));

    function timingReasonPhrase(row, positive) {
      const rows = positive ? (row?.supportSignals || []) : (row?.cautionSignals || []);
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

    function monthSentence(row) {
      const when = formatMonth(row);
      const supportWhy = timingReasonPhrase(row, true);
      const cautionWhy = timingReasonPhrase(row, false);
      if (row.class==="supportive") return `<b>${when}</b> — ${supportWhy || "중요한 도움 근거가"} 뚜렷하고 큰 주의 근거가 맞서지 않아. ${situation.move}처럼 실제 반응을 확인하는 행동을 넣기 좋아.`;
      if (row.class==="mild-support") return `<b>${when}</b> — ${supportWhy || "보조 도움 근거가"} 잡혀 있어. 크게 벌리기보다 ${situation.move}를 한 번 시험해보기 좋아.`;
      if (row.class==="caution") return `<b>${when}</b> — ${cautionWhy || "중요한 주의 근거가"} 뚜렷해. ${cautionAction}`;
      if (row.class==="mild-caution") return `<b>${when}</b> — ${cautionWhy || "보조 주의 근거가"} 있어. 속도를 줄이고 한 번 더 확인하는 편이 좋아.`;
      if (row.class==="mixed") return `<b>${when}</b> — 도움과 주의 근거가 같이 잡혀 있어. 한 방향으로 단정하기보다 조건을 나눠서 움직여.`;
      return `<b>${when}</b> — 한쪽으로 강하게 기울지 않아. 결과보다 준비 상태를 점검하기 좋아.`;
    }

    const nearBody = pickedMonths.length
      ? pickedMonths.map(monthSentence).join("<br><br>")
      : "앞으로 18개월 안에서는 특정 달 하나를 억지로 고르기보다 준비 상태를 확인하면서 움직이는 편이 맞아.";

    function pivotSentence(pivot) {
      const year = pivot?.year || String(pivot?.date||"").slice(0,4);
      if(!year)return "";
      if(pivot.class==="supportive"){
        return `<b>${year}년 전후</b> — ${situation.object}에서 지금보다 판을 넓혀볼 만한 큰 변곡점이 실제 계산에서 잡혀 있어. 여기서는 시점만 남기고, 그때 왜 힘이 붙는지와 월별 세부 흐름·다른 영역과의 연결은 펼치지 않을게.`;
      }
      return `<b>${year}년 전후</b> — ${situation.object}에서 방식이나 속도를 한 번 크게 조정해야 할 변곡점이 실제 계산에서 잡혀 있어. 여기서는 시점만 남기고, 구체 원인·월별 흐름·다른 영역과의 연결은 풀어놓지 않을게.`;
    }

    const pivotBody = longTermPivots.map(pivotSentence).filter(Boolean).join("<br><br>");
    const pivotSection = pivotBody ? `<br><br><b>그 이후 큰 변곡점</b><br>${pivotBody}` : "";

    const intro = isT
      ? "이 고민은 가까운 12~18개월을 가장 구체적으로 보는 게 실용적이야. 그래서 실제로 움직일 달과 줄일 달부터 잡았어."
      : "이 고민은 멀리 있는 미래를 전부 늘어놓는 것보다, 앞으로 12~18개월에 언제 움직이고 언제 속도를 줄일지 아는 게 더 쓸모 있어. 언니가 그 구간부터 촘촘하게 골라봤어.";
    const close = isT
      ? `움직이기 좋은 구간엔 ${situation.move}. 조심 구간엔 같은 속도로 밀지 마.`
      : `움직이기 좋은 구간에는 ${situation.move}. 힘이 덜 받쳐주는 때는 같은 속도를 억지로 유지하지 않아도 돼.`;

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

  function badgeFor(concern, idx) {
    const rows={
      money:["돈의 핵심","돈 패턴","진짜 원인","바꿀 순서","돈이 남는 구조","돈 흐름"],
      career:["일의 핵심","막히는 패턴","진짜 원인","바꿀 순서","맞는 일 환경","기회 시기"],
      love:["연애 핵심","반복 패턴","진짜 원인","바꿀 순서","맞는 사람","관계 시기"],
      path:["진로 핵심","고민 패턴","진짜 원인","바꿀 순서","맞는 일 방식","움직일 시기"],
      people:["관계 핵심","반복 패턴","진짜 원인","바꿀 순서","남길 사람","관계 시기"],
      mental:["마음 핵심","지치는 패턴","진짜 원인","이번 주 행동","회복 환경","회복 시기"],
    };
    return rows[concern]?.[idx] || "비밀 메모";
  }

  function titleFor(s, idx, isT) {
    if (idx === 0) return isT ? `${s.label} — 사주 전체에서 먼저 볼 건 이거야` : `${s.label} — 언니는 네 사주 전체부터 볼래`;
    if (idx === 1) return isT ? "결과보다 이 순서부터 끊어" : "반복되는 순서가 여기서 시작돼";
    if (idx === 2) return isT ? "원인은 성격 한 줄로 설명 안 돼" : "왜 자꾸 이렇게 되는지 뿌리부터 볼게";
    if (idx === 3) return isT ? "바꿀 건 하나가 아니라 순서야" : "이제 뭘 먼저 바꿀지 같이 보자";
    if (idx === 4) return isT ? "잘 맞는 조건과 피할 조건을 나눠" : "너를 살리는 사람·환경은 조건이 달라";
    return isT ? "사주는 같아도, 움직일 시기는 따로 봐" : "같은 너라도 힘이 붙는 시기는 따로 있어";
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
      if (claim?.evidenceStatus === "insufficient-evidence") {
        note.desc += isT
          ? "<br><br>여기는 근거가 한쪽만 잡혀 있어서 확정해서 말하지 않을게."
          : "<br><br>여기는 아직 근거가 한쪽만 잡혀 있어서 언니도 단정하지 않을게.";
      }
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
