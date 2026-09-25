(function (global) {
  "use strict";

  const VERSION = "6.1.1";
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
    officer:{noun:"기준·책임·평가의 힘",pressure:"책임·평가·규칙처럼 밖에서 들어오는 부담",action:"역할과 책임의 범위를 분명하게 정하는 것"},
    unknown:{noun:"한쪽으로 단정하기 어려운 힘",pressure:"여러 조건이 한꺼번에 작동하는 부담",action:"변수를 하나씩 분리해서 확인하는 것"},
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

  function firstFinding(reasoning, kind) {
    return reasoning?.ditian?.findings?.find((x) => x.kind === kind) || null;
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
          structuralSupportGods:reasoning?.integrated?.structuralSupportGods||[],
          structuralRescueGods:reasoning?.integrated?.structuralRescueGods||[],
          structuralHarmGods:reasoning?.integrated?.structuralHarmGods||[],
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

  function topGodEvidence(reasoning) {
    return (synthesisFor(reasoning).tenGodEvidence || [])[0] || null;
  }

  const SITUATION_GROUP_LENS = {
    money:{
      saving:["wealth","self","officer"], income:["wealth","output","officer"],
      side:["output","wealth","self"], flow:["wealth","officer","output"],
    },
    career:{
      exam:["print","officer","output"], jobsearch:["output","officer","print"],
      move:["officer","self","wealth"], current:["officer","wealth","output"],
    },
    love:{
      crush:["output","wealth","print"], relationship:["self","officer","output"],
      breakup:["print","self","officer"], new:["output","wealth","self"],
    },
    path:{
      lost:["print","output","self"], current:["officer","wealth","self"],
      switch:["output","wealth","print"], strength:["self","output","print","wealth","officer"],
    },
    people:{
      friend:["self","output","officer"], work:["officer","self","output"],
      family:["self","officer","print"], distance:["self","wealth","officer"],
    },
    mental:{
      burnout:["officer","print","self"], overthink:["print","output","self"],
      low:["output","print","self"], recover:["print","self","output"],
    },
  };

  function situationGodEvidence(reasoning,s) {
    const rows=synthesisFor(reasoning).tenGodEvidence||[];
    if(!rows.length) return null;
    const prefs=SITUATION_GROUP_LENS[s?.concern]?.[s?.key]||[];
    for(const group of prefs){
      const row=rows.find(x=>x?.group===group);
      if(row) return row;
    }
    return rows[0]||null;
  }

  function concernMechanismScene(reasoning, s) {
    const group = synthesisFor(reasoning).mechanisms?.drive?.pressureGroup || reasoning?.integrated?.pressureGroup || "unknown";
    const name = (DOMAIN[s.concern] || DOMAIN.money).name || "이 고민";
    const map = {
      self: name + "에서 내 몫·경계·결정권을 스스로 정해야 하는 장면",
      print: name + "에서 정보·준비·안전성을 확인해야 하는 장면",
      output: name + "에서 생각이나 의도를 말·행동·결과로 밖에 내야 하는 장면",
      wealth: name + "에서 시간·돈·보상·주고받음처럼 실제 자원을 계산해야 하는 장면",
      officer: name + "에서 책임·약속·평가·규칙이 걸리는 장면",
      unknown: name + "에서 여러 조건 가운데 무엇이 실제 결과를 바꾸는지 가려야 하는 장면",
    };
    return map[group] || map.unknown;
  }

  function cautionCriterionSentence(reasoning, s) {
    const syn = synthesisFor(reasoning);
    const c = syn.mechanisms?.capacity || {};
    const d = syn.mechanisms?.drive || {};
    const a = syn.mechanisms?.adjustment || {};
    const f = syn.mechanisms?.friction || {};
    const name = (DOMAIN[s.concern] || DOMAIN.money).name || "이 고민";
    if (Number(c.rootClashCount || 0) > 0) return name + "에서 평소엔 되던 방식이 특정 조건에서 유독 버티지 못하고 흔들리는지 봐";
    if ((a.conflicts || []).length) return name + "에서 결과는 나는데 같은 방식을 반복할수록 네 여유와 감당력이 더 빨리 줄어드는지 봐";
    if (d.blockedAt?.from && d.blockedAt?.to) return name + "에서 시작부터 끝까지가 아니라 항상 같은 중간 단계에서 반복해서 끊기는지 봐";
    if (d.pressureOverload) return name + "에서 " + groupText(d.pressureGroup || "unknown").pressure + "이 늘어날 때 체감이 유독 급격히 나빠지는지 봐";
    if (Number(f.monthClashCount || 0) > 0) return name + "의 한 조건은 좋아져도 생활의 중심이 계속 같이 흔들리는 선택인지 봐";
    if (Number(f.clashCount || 0) > 0) return name + "의 한쪽을 맞출수록 다른 중요한 조건이 반복해서 깨지는지 봐";
    return name + "에서 같은 조건을 몇 번 반복했을 때도 처음과 비슷하게 힘이 남는지 봐";
  }

  function timingRealityCheck(reasoning, s, row, positive) {
    const name = (DOMAIN[s.concern] || DOMAIN.money).name || "이 고민";
    const rows = positive ? (row?.layers?.wolun?.supportSignals || []) : (row?.layers?.wolun?.cautionSignals || []);
    const signal = rows.find(x => x.severity === "major") || rows.find(x => x.severity === "support") || rows[0] || null;
    const code = String(signal?.code || "");
    if (positive) {
      if (/generate|rescue|root-add|assist/.test(code)) return name + "에서 평소 버겁던 조건을 비슷한 강도로 다뤄도 체감이 덜 무거워지는지가 확인 포인트야";
      if (/bridge|flow-unblock/.test(code)) return name + "에서 평소 끊기던 단계가 실제로 다음 단계까지 이어지는지가 확인 포인트야";
      if (/discharge/.test(code)) return name + "에서 생각·준비가 실제 표현이나 결과까지 넘어가는지가 확인 포인트야";
      if (/control/.test(code)) return name + "에서 기준과 우선순위가 평소보다 선명하게 잡히는지가 확인 포인트야";
      if (/ziping-support/.test(code)) return name + "에서 원래 사주의 장점이 실제 결과까지 이어지는지가 확인 포인트야";
      return name + "에서 평소와 같은 선택을 했을 때 실제 반응이 더 가볍게 이어지는지가 확인 포인트야";
    }
    if (/root-clash/.test(code)) return name + "에서 평소 버티던 축이 같은 강도로 유지되는지부터 확인해야 하는 달이야";
    if (/body-cost/.test(code)) return name + "에서 해야 할 일이나 책임이 늘 때 네 감당력이 먼저 떨어지는지 확인해야 하는 달이야";
    if (/ziping-harm/.test(code)) return name + "에서 원래 잘되던 방식이 같은 조건에서도 꼬이는지 확인해야 하는 달이야";
    if (/over-support/.test(code)) return name + "에서 이미 강한 방식이 더 세져 선택 폭을 오히려 좁히는지 확인해야 하는 달이야";
    return name + "에서 평소 약한 지점이 다른 달보다 더 쉽게 드러나는지 확인해야 하는 달이야";
  }

    function personalizationFactsForRole(reasoning, role, situation) {
    const syn = synthesisFor(reasoning);
    const c = syn.mechanisms?.capacity || {};
    const d = syn.mechanisms?.drive || {};
    const st = syn.mechanisms?.structure || {};
    const a = syn.mechanisms?.adjustment || {};
    const f = syn.mechanisms?.friction || {};
    const top = topGodEvidence(reasoning);
    const lens = situation ? situationGodEvidence(reasoning,situation) : null;
    if (role === "core") return {
      priorityRuleIds:(syn.priorityMechanisms || []).slice(0,3).map(x=>x.ruleId),
      contradictionFlags:syn.contradictionFlags || [],
      strength:c.verdict || null, rootQuality:c.rootQuality || null, rootClashCount:Number(c.rootClashCount || 0),
      rawStrongest:d.rawStrongest || null, strongestElement:d.strongestElement || null,
      topGod:top?.god || null, topGodRoles:top?.roles || [],
      situationGod:lens?.god||null, situationGodGroup:lens?.group||null,
    };
    if (role === "pattern") return {
      pressureGroup:d.pressureGroup || null, pressureOverload:!!d.pressureOverload,
      blockedAt:d.blockedAt || null, rootQuality:c.rootQuality || null,
      structureState:st.state || null, structurePath:st.path || null,
      clashCount:Number(f.clashCount || 0), relationCount:Number(f.relationCount || 0),
      situationGod:lens?.god||null, situationGodGroup:lens?.group||null,
    };
    if (role === "fit") return {
      helpfulGods:st.helpfulGods || [], rescueGods:st.rescueGods || [],
      prescriptionSequence:(a.prescription?.sequence || []).map(x=>x.element).filter(Boolean),
      bridgeElement:a.bridgeElement || null, bridgeStatus:a.bridgeStatus || null,
      situationGod:lens?.god||null,
    };
    if (role === "caution") return {
      harmfulGods:st.harmfulGods || [], pressureGroup:d.pressureGroup || null,
      pressureOverload:!!d.pressureOverload, conflictCount:(a.conflicts || []).length,
      rootClashCount:Number(c.rootClashCount || 0), clashCount:Number(f.clashCount || 0),
      monthClashCount:Number(f.monthClashCount || 0), situationGod:lens?.god||null,
    };
    return {};
  }


  // ===== 사용자 문장층 (v5.1) =====
  // NOTE 문장은 결과 화면 사주표(년주·월주·일주·시주)에 보이는 글자를 직접 가리키고,
  // 십신은 이름 바로 뒤에 쉬운 뜻을 붙인다. 격국·신강 같은 전문어 대신 풀어 쓴 말을 쓰고,
  // 엔진 내부 용어("작동 방식", "압력군" 등)는 쓰지 않는다.
  const GAN_KR={甲:"갑",乙:"을",丙:"병",丁:"정",戊:"무",己:"기",庚:"경",辛:"신",壬:"임",癸:"계"};
  const ZHI_KR={子:"자",丑:"축",寅:"인",卯:"묘",辰:"진",巳:"사",午:"오",未:"미",申:"신",酉:"유",戌:"술",亥:"해"};
  const GAN_ELEMENT={甲:"mok",乙:"mok",丙:"hwa",丁:"hwa",戊:"to",己:"to",庚:"geum",辛:"geum",壬:"su",癸:"su"};
  const ELEMENT_ORDER=["mok","hwa","to","geum","su"];
  const EL_KR={mok:"목",hwa:"화",to:"토",geum:"금",su:"수"};
  const EL_PLAIN={mok:"나무",hwa:"불",to:"흙",geum:"쇠",su:"물"};
  const PILLAR_KR={year:"년주",month:"월주",day:"일주",hour:"시주"};
  const GOD_MEANING={
    비견:"나와 같은 힘·내 기준",겁재:"나와 같지만 경쟁하는 힘",
    식신:"꾸준히 만들어내는 힘",상관:"말하고 바꾸려는 표현의 힘",
    정재:"안정적으로 벌고 관리하는 돈",편재:"기회·거래로 크게 움직이는 돈",
    정관:"규칙·책임·평가",편관:"센 부담·경쟁·큰 책임",
    정인:"배움·보호·회복",편인:"깊게 파고드는 생각·다른 방식",
  };
  const GROUP_NAME={self:"비겁",print:"인성",output:"식상",wealth:"재성",officer:"관성"};
  const GROUP_GODS={self:"비견·겁재",print:"정인·편인",output:"식신·상관",wealth:"정재·편재",officer:"정관·편관"};
  const GROUP_MEANING={self:"나와 같은 힘",print:"배움·보호·회복",output:"표현·결과물",wealth:"돈·현실 자원",officer:"규칙·책임·평가"};
  const GROUP_WEAK_STEP={
    self:"내 기준을 지키며 버티는 힘",
    print:"쉬고 배우면서 회복하는 힘",
    output:"생각을 말·결과물로 꺼내는 단계",
    wealth:"한 일을 돈·보상으로 챙기는 단계",
    officer:"역할과 기준을 세워 지키는 힘",
  };
  const GROUP_BOND={
    self:"비슷한 사람·경쟁과 늘 얽혀 있는 편이야",
    print:"배우고 기대는 쪽에 마음이 쉽게 붙는 편이야",
    output:"표현하고 만드는 일에 마음이 쉽게 붙는 편이야",
    wealth:"돈·현실 문제를 늘 붙들고 있는 편이야",
    officer:"책임·평가가 걸린 일을 쉽게 떼어놓지 못하는 편이야",
  };

  function ganName(gan){ return GAN_KR[gan] ? GAN_KR[gan]+(EL_KR[GAN_ELEMENT[gan]]||"") : ""; }
  // NOTE를 만들 때는 "정관(규칙·책임·평가)"처럼 괄호로 뜻을 붙이지 않는다. 뜻은 용어를 누르면 나오는 설명 시트로 본다.
  let PLAIN_LABELS=false;
  function elementName(el){ return EL_KR[el] ? (PLAIN_LABELS?EL_PLAIN[el]:EL_KR[el]+"("+EL_PLAIN[el]+")") : ""; }
  function pillarsOf(reasoning){ return reasoning?.profile?.pillars||{}; }
  function pillarName(reasoning,pos){
    const p=pillarsOf(reasoning)[pos];
    if(!p?.gan||!p?.zhi) return PILLAR_KR[pos]||"";
    return (PILLAR_KR[pos]||"")+" "+(GAN_KR[p.gan]||"")+(ZHI_KR[p.zhi]||"");
  }
  function zhiAt(reasoning,pos){ return ZHI_KR[pillarsOf(reasoning)[pos]?.zhi]||""; }
  function dayGanOf(reasoning){ return reasoning?.context?.dayGan||pillarsOf(reasoning).day?.gan||""; }
  function dayMasterName(reasoning){ return ganName(dayGanOf(reasoning))||"일간"; }
  function dayElementOf(reasoning){ return reasoning?.context?.dayElement||GAN_ELEMENT[dayGanOf(reasoning)]||"to"; }
  function groupOfElement(dayEl,el){
    const d=ELEMENT_ORDER.indexOf(dayEl), e=ELEMENT_ORDER.indexOf(el);
    if(d<0||e<0) return "unknown";
    return ["self","output","wealth","officer","print"][(e-d+5)%5];
  }
  function groupLabel(group){ return GROUP_NAME[group] ? (PLAIN_LABELS?GROUP_NAME[group]:GROUP_NAME[group]+"("+GROUP_MEANING[group]+")") : "여러 힘"; }
  function godLabel(god){ return GOD_MEANING[god]&&!PLAIN_LABELS ? god+"("+GOD_MEANING[god]+")" : String(god||""); }
  function occurrenceText(reasoning,occ){
    if(!occ) return "";
    const base=pillarName(reasoning,occ.pillar);
    if(occ.sourceType==="visible-stem") return base+"의 윗글자 "+ganName(occ.gan);
    const zhi=ZHI_KR[occ.zhi]||"";
    if(occ.sourceType==="branch-main") return base+"의 아랫글자 "+zhi;
    return base+"의 아랫글자 "+zhi+" 속 "+ganName(occ.gan);
  }
  function placePart(occ){
    if(occ.sourceType==="visible-stem") return "윗글자 "+ganName(occ.gan);
    const zhi=ZHI_KR[occ.zhi]||"";
    return occ.sourceType==="branch-main" ? "아랫글자 "+zhi : "아랫글자 "+zhi+" 속 "+ganName(occ.gan);
  }
  // 같은 기둥에 두 번 나오면 "월주 갑인의 윗글자 갑목과 아랫글자 인"처럼 한 번에 묶는다.
  function godPlaces(reasoning,god,limit){
    const rows=(reasoning?.context?.godOccurrences||[])
      .filter(o=>o?.god===god&&PILLAR_KR[o.pillar])
      .sort((a,b)=>Number(b.weight||0)-Number(a.weight||0));
    const byPillar=new Map();
    for(const occ of rows){
      if(!byPillar.has(occ.pillar)) byPillar.set(occ.pillar,[]);
      byPillar.get(occ.pillar).push(occ);
    }
    const texts=[];
    for(const [pos,list] of byPillar){
      const parts=[...new Set([...list].sort((a,b)=>(b.visible?1:0)-(a.visible?1:0)).map(placePart))];
      const joined=parts.reduce((acc,part,i)=>i===0?part:acc+josaSuffix(acc,"과","와")+" "+part,"");
      texts.push(pillarName(reasoning,pos)+"의 "+joined);
      if(texts.length>=(limit||2)) break;
    }
    return texts.join(", ");
  }
  function godRows(reasoning){ return synthesisFor(reasoning).tenGodEvidence||[]; }
  function godWeightTotal(reasoning){ return godRows(reasoning).reduce((a,r)=>a+Number(r.weight||0),0); }
  function pct(value,total){ return total>0 ? Math.round(Number(value||0)/total*100) : 0; }
  function godShare(reasoning,god){
    const row=godRows(reasoning).find(x=>x.god===god);
    return pct(row?.weight,godWeightTotal(reasoning));
  }
  function groupShare(reasoning,group){
    const sum=godRows(reasoning).filter(x=>x.group===group).reduce((a,r)=>a+Number(r.weight||0),0);
    return pct(sum,godWeightTotal(reasoning));
  }
  function verdictOf(reasoning){ return synthesisFor(reasoning).mechanisms?.capacity?.verdict||reasoning?.integrated?.strength||"중화"; }
  function strengthPlain(reasoning){
    const v=verdictOf(reasoning);
    return v==="신약"?"약한 편":v==="신강"?"강한 편":"균형에 가까운 편";
  }
  function centerGodOf(reasoning){
    const s=reasoning?.profile?.structure||{};
    return s.gyeokSipsin||String(s.gyeokName||"").replace(/격$/,"")||"";
  }
  function quoted(label){ return "‘"+label+"’"+josaSuffix(label,"은","는"); }
  // 괄호로 뜻을 붙인 이름은 괄호 앞 단어 기준으로 조사를 고른다.
  function godLabelJ(god,a,b){ return godLabel(god)+josaSuffix(god,a,b); }
  function groupLabelJ(group,a,b){ return groupLabel(group)+josaSuffix(GROUP_NAME[group]||"힘",a,b); }
  function roJosa(word){
    const chars=Array.from(String(word||"").trim());
    const code=(chars[chars.length-1]||"").charCodeAt(0);
    if(!(code>=0xAC00&&code<=0xD7A3)) return "로";
    const jong=(code-0xAC00)%28;
    return jong===0||jong===8 ? "로" : "으로";
  }

  function seasonSentence(reasoning){
    const st=reasoning?.profile?.strength||{};
    const monthZhi=pillarsOf(reasoning).month?.zhi;
    const mainGan=st.deukryeong?.mainGan||st.monthCommand?.mainGan;
    if(!monthZhi||!GAN_ELEMENT[mainGan]) return "";
    const el=GAN_ELEMENT[mainGan];
    const dm=dayMasterName(reasoning);
    const group=groupOfElement(dayElementOf(reasoning),el);
    const helps=st.deukryeong?.active===true;
    const month=pillarName(reasoning,"month");
    const plainEl=EL_PLAIN[el]||EL_KR[el];
    return "태어난 달은 "+withJosa(month,"이고","고")+", 그 아랫글자 "+ZHI_KR[monthZhi]+"의 중심 기운은 "+withJosa(plainEl,"이야","야")+". "+
      dm+"에게 "+plainEl+" 기운은 "+(GROUP_NAME[group]?GROUP_NAME[group]+", 곧 "+GROUP_MEANING[group]+" 쪽이라":"여러 힘이 섞인 쪽이라")+" 계절이 너를 "+
      (helps?"돕는 쪽이야.":"직접 돕지는 않아.");
  }
  function rootSentence(reasoning){
    const roots=[...(reasoning?.profile?.strength?.roots||[])].sort((a,b)=>Number(b.weight||0)-Number(a.weight||0));
    const dm=dayMasterName(reasoning);
    if(!roots.length) return withJosa(dm,"과","와")+" 같은 기운의 뿌리가 아랫글자들에 없어서, 버티는 힘은 밖에서 채워야 하는 편이야.";
    const top=roots[0];
    return withJosa(dm,"과","와")+" 같은 기운의 뿌리는 "+roots.length+"곳이고, 가장 큰 뿌리는 "+
      pillarName(reasoning,top.pos)+"의 아랫글자 "+(ZHI_KR[top.zhi]||"")+"에 있어.";
  }
  function centerSentence(reasoning){
    const s=reasoning?.profile?.structure||{};
    const name=s.gyeokName||"";
    const god=centerGodOf(reasoning);
    const monthZhi=zhiAt(reasoning,"month");
    if(!name||!god||!monthZhi) return "";
    if(["건록격","양인격","비견격","겁재격"].includes(name)){
      if(PLAIN_LABELS) return "태어난 달 "+monthZhi+"의 중심 기운이 너와 같은 "+EL_KR[dayElementOf(reasoning)]+"라서, 내 힘 자체가 이 사주의 중심이야. 이런 사주를 "+withJosa(name,"이라고","라고")+" 해.";
      return "태어난 달 "+monthZhi+"의 중심 기운이 너와 같은 "+EL_KR[dayElementOf(reasoning)]+"라서, 내 힘 자체가 이 사주의 중심이야("+name+").";
    }
    const basis=s.basisGan;
    const visible=(reasoning?.context?.godOccurrences||[]).find(o=>o?.visible&&o.gan===basis&&o.pillar!=="day");
    if(s.touchul&&visible){
      const where=occurrenceText(reasoning,visible);
      if(PLAIN_LABELS) return "태어난 달 "+monthZhi+"의 중심 글자가 "+where+roJosa(where)+" 그대로 드러나 있어서, 이 사주의 중심은 "+withJosa(god,"이야","야")+". 이런 사주를 "+withJosa(name,"이라고","라고")+" 해.";
      return "태어난 달 "+monthZhi+"의 중심 글자가 "+where+roJosa(where)+" 그대로 드러나 있어서, 이 사주의 중심은 "+withJosa(god,"이야","야")+"("+name+").";
    }
    if(PLAIN_LABELS) return "태어난 달 "+monthZhi+" 속 중심 글자 "+ganName(basis)+", 곧 "+withJosa(god,"이","가")+" 이 사주의 중심 역할을 해. 이런 사주를 "+withJosa(name,"이라고","라고")+" 해.";
    return "태어난 달 "+monthZhi+" 속 중심 글자 "+ganName(basis)+"("+god+")"+josaSuffix(ganName(basis),"이","가")+" 이 사주의 중심 역할을 해("+name+").";
  }
  function lensGroupOf(s){ return (SITUATION_GROUP_LENS[s?.concern]?.[s?.key]||[])[0]||"unknown"; }
  function lensSentence(reasoning,s){
    const group=lensGroupOf(s);
    if(!GROUP_NAME[group]) return "";
    const head=quoted(s.label)+" "+groupLabel(group)+" 쪽으로 봐.";
    const rows=godRows(reasoning).filter(r=>r.group===group);
    if(!rows.length) return head+" 네 사주에는 "+GROUP_NAME[group]+"이 없어서, 이 부분은 사람·환경·시기에서 들어올 때 더 크게 움직여.";
    const main=rows[0];
    const top=godRows(reasoning)[0];
    const share=groupShare(reasoning,group);
    const where=godPlaces(reasoning,main.god,1);
    const compare=top&&top.group!==group
      ? " "+GROUP_NAME[group]+" 전체 비중은 "+share+"%라 가장 큰 "+top.god+"("+godShare(reasoning,top.god)+"%)보다 작아."
      : " "+GROUP_NAME[group]+" 전체 비중은 "+share+"%로 네 사주에서 가장 큰 쪽이야.";
    return head+" 네 사주에서 "+GROUP_NAME[group]+"은 "+withJosa(main.god,"이","가")+" 대표고, "+where+"에 있어."+compare;
  }

  function bondSentence(reasoning){
    const ctx=reasoning?.context||{};
    const dm=dayMasterName(reasoning);
    const combine=(ctx.stemCombines||[]).find(x=>x?.aPos==="day"||x?.bPos==="day");
    if(!combine) return "";
    const pos=combine.aPos==="day"?combine.bPos:combine.aPos;
    const occ=(ctx.godOccurrences||[]).find(o=>o?.pillar===pos&&o.sourceType==="visible-stem");
    if(!occ?.god||!GROUP_BOND[occ.group]) return "";
    if(PLAIN_LABELS) return "그리고 "+occurrenceText(reasoning,occ)+", 곧 "+withJosa(occ.god,"과","와")+" 일간 "+withJosa(dm,"이","가")+" 서로 묶이는 합 관계라, "+GROUP_BOND[occ.group]+".";
    return "그리고 "+occurrenceText(reasoning,occ)+"("+occ.god+")"+josaSuffix(ganName(occ.gan),"과","와")+" 일간 "+withJosa(dm,"이","가")+" 서로 묶이는 관계(합)라, "+GROUP_BOND[occ.group]+".";
  }
  function weakLinkSentence(reasoning){
    const ranking=reasoning?.context?.elementRanking||[];
    const weakest=ranking[ranking.length-1];
    if(!weakest?.element||!EL_KR[weakest.element]) return "";
    const el=weakest.element;
    const raw=Number(reasoning?.profile?.elements?.raw?.[el]||0);
    const share=Math.round(Number(weakest.share||0)*100);
    const group=groupOfElement(dayElementOf(reasoning),el);
    if(!GROUP_WEAK_STEP[group]) return "";
    return "<b>약한 고리</b> — 가장 약한 기운은 "+withJosa(elementName(el),"이야","야")+". 겉 글자는 "+raw+"개, 실제 비중은 "+share+"%야. "+
      "너한텐 "+withJosa(PLAIN_LABELS?elementName(el):EL_KR[el],"이","가")+" "+groupLabelJ(group,"이라","라")+", "+withJosa(GROUP_WEAK_STEP[group],"이","가")+" 약해지기 쉬워.";
  }

  function patternPressureSentence(reasoning){
    const group=synthesisFor(reasoning).mechanisms?.drive?.pressureGroup||reasoning?.integrated?.pressureGroup||"unknown";
    if(group==="self") return "이 장면에서는 남이 정한 답보다 내가 감당할 방식과 내 기준부터 지키려는 반응이 먼저 나와";
    if(group==="print") return "이 장면에서는 바로 움직이기보다 조금 더 확인하고 안전해진 뒤 움직이려는 반응이 먼저 나와";
    if(group==="output") return "이 장면에서는 답답함을 말하거나 뭔가 직접 해보는 쪽으로 먼저 힘이 빠져나가기 쉬워";
    if(group==="wealth") return "이 장면에서는 손익·기회·보상처럼 현실적으로 남는 게 뭔지부터 계산하는 반응이 먼저 나와";
    if(group==="officer") return "이 장면에서는 책임·기준·상대 기대를 먼저 맞추려는 쪽으로 반응하기 쉬워";
    return "이 장면에서는 여러 조건을 한꺼번에 해결하려 하기보다, 무엇부터 처리할지 정하는 과정에서 반응이 갈리기 쉬워";
  }

  function patternCapacitySentence(reasoning){
    const m=synthesisFor(reasoning).mechanisms?.capacity||{};
    const verdict=m.verdict||"중화";
    const root=m.rootQuality||"unknown";
    if(verdict==="신약"&&root==="rootless") return "이런 장면에서는 참고 버티는 시간을 늘릴수록 해결보다 소모가 먼저 커지기 쉬워";
    if(verdict==="신약") return "초반에는 버텨서 넘어갈 수 있어도 같은 장면이 반복되면 뒤로 갈수록 네 쪽 피로가 더 빨리 쌓이기 쉬워";
    if(verdict==="신강"&&["month-rooted","day-rooted"].includes(root)) return "문제가 보여도 바로 손을 떼기보다 '내가 정리하고 말지' 쪽으로 가기 쉬워서, 끊을 시점을 늦게 잡을 수 있어";
    if(verdict==="신강") return "한번 잡은 문제를 끝까지 밀어보려는 쪽이라, 방향을 바꿔야 할 때도 조금 더 해본 뒤에야 멈추기 쉬워";
    return "같은 일도 상황에 따라 버틸 때와 지칠 때 차이가 커서, 처음 반응보다 반복될수록 어떻게 달라지는지를 봐야 해";
  }

  function patternResolutionSentence(reasoning){
    const s=synthesisFor(reasoning).mechanisms?.structure||{};
    const path=s.path;
    if(path==="print-transform") return "그래서 반복을 끊으려면 바로 맞서기보다 먼저 이해하고 정리할 시간을 만든 다음 움직이는 순서가 필요해";
    if(path==="food-control") return "그래서 머릿속에서만 버티지 말고 작은 행동이나 결과물 하나로 밖에 빼야 같은 생각이 계속 도는 걸 줄일 수 있어";
    if(path==="mixed-control-cost") return "행동으로 빼는 건 도움이 되지만, 더 많이 해내는 방식으로 해결하려 들면 다시 네 힘이 빠질 수 있어";
    if(path==="wealth-release") return "표현이나 아이디어에서 멈추지 말고 실제 결과·보상까지 연결해야 같은 답답함이 반복되지 않아";
    if(path==="print-control") return "바로 반응하는 것보다 한 번 정리한 뒤 말하는 순서를 지켜야 불필요한 충돌을 줄일 수 있어";
    if(path==="officer-control") return "내가 다 알아서 하려 하기보다 역할·책임·기준을 먼저 세워야 반복이 줄어";
    if(path==="output-to-wealth") return "생각이나 의욕을 실제 결과물로 만들고 보상까지 확인해야 힘이 헛돌지 않아";
    if(s.state==="rescued") return "한번 꼬여도 다시 맞출 길이 있으니, 틀어졌을 때 바로 포기하기보다 조정이 실제로 되는지 확인하는 게 중요해";
    if(s.state==="damaged") return "같은 방해 조건을 그대로 둔 채 의지만 더 쓰면 반복이 커지기 쉬워서, 사람이나 환경 조건부터 바꾸는 게 먼저야";
    if(s.state==="mixed") return "좋은 조건과 흔드는 조건이 동시에 들어오면 순서 하나만 바뀌어도 결과가 달라지기 쉬워";
    const group=synthesisFor(reasoning).mechanisms?.drive?.pressureGroup||reasoning?.integrated?.pressureGroup||"unknown";
    if(group==="officer") return "그래서 책임이 늘어나는 순간, 역할과 보상 조건을 먼저 말로 정리하는 게 반복을 줄이는 첫 단계야";
    if(group==="wealth") return "그래서 기회가 보일 때 한꺼번에 벌리기보다, 하나씩 회수 기준을 정하는 게 반복을 줄이는 첫 단계야";
    if(group==="output") return "그래서 생각이나 표현을 쏟아내기 전에, 결과로 남길 것 하나를 먼저 정하는 게 반복을 줄이는 첫 단계야";
    return "이 반복은 의지 하나보다 어떤 조건을 먼저 바꾸느냐에서 갈리는 편이야";
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
    const actual=[...new Set([...(st.rescueGods||[]),...(st.helpfulGods||[])].filter(Boolean))];
    const structural=[...new Set([...(prescription.zipingGods||[]),...(st.structuralRescueGods||[]),...(st.structuralSupportGods||[])].filter(Boolean))];
    const evidence=Object.fromEntries((syn.tenGodEvidence||[]).map((row,i)=>[row.god,{...row,index:i}]));
    const center=centerGodOf(reasoning)||"사주 중심";
    const candidates=[...new Set([...actual,...structural])].map(g=>{
      const ev=evidence[g]||null;
      const isActual=actual.includes(g);
      const isPresent=!!ev;
      const tier=isActual ? 0 : isPresent ? 1 : 2;
      return {god:g,ev,isActual,isPresent,tier};
    }).sort((a,b)=>
      a.tier-b.tier ||
      Number(b.ev?.weight||0)-Number(a.ev?.weight||0) ||
      String(a.god).localeCompare(String(b.god),"ko")
    );

    const rows=candidates.slice(0,3).map(row=>{
      const base=godSpecificCondition(row.god,domain,"help")||domain.help[godGroup(row.god)]||domain.help.unknown;
      let why;
      if(row.isActual) why=godLabelJ(row.god,"이","가")+" "+godPlaces(reasoning,row.god,1)+"에 있어서, 사주 중심인 "+withJosa(center,"을","를")+" 실제로 살려주는 짝으로 확인돼.";
      else if(row.isPresent){
        const share=godShare(reasoning,row.god);
        why="사주 중심인 "+withJosa(center,"을","를")+" 살려주는 짝 중 하나가 "+godLabelJ(row.god,"이야","야")+". "+godPlaces(reasoning,row.god,1)+
          (share>=20?"에 있고 비중도 "+share+"%로 커서, 이 조건이 맞으면 바로 힘을 받는 편이야.":"에 있지만 비중이 "+share+"%로 작아서, 조건이 맞을 때 살아나는 편이야.");
      }
      else why=godLabelJ(row.god,"은","는")+" 사주 중심인 "+withJosa(center,"을","를")+" 살려주는 짝인데 네 사주엔 없어서, 사람·환경·시기에서 들어올 때 효과가 커.";
      return {god:row.god,text:base,why,evidenceStatus:row.isActual?"actual":row.isPresent?"present-secondary":"needed-external"};
    });

    if(!rows.length){
      const groups=[...new Set(reasoning?.integrated?.neededGroups||[])];
      groups.slice(0,2).forEach(g=>rows.push({
        god:null,text:domain.help[g]||domain.help.unknown,
        why:"약한 쪽을 받쳐주는 "+groupLabelJ(g,"이","가")+" 먼저 보완할 쪽으로 나와.",
        evidenceStatus:"needed-group",
      }));
    }
    if(!rows.length) rows.push({
      god:null,text:domain.help.unknown,
      why:"한 가지 도움 글자가 두드러지지 않아서, 한 조건을 핵심으로 과장하지 않았어.",
      evidenceStatus:"fallback",
    });
    return rows;
  }

  function balanceSentence(reasoning){
    const b=reasoning?.profile?.balance||{};
    const el=b.primary;
    if(!EL_KR[el]) return "";
    const group=groupOfElement(dayElementOf(reasoning),el);
    const raw=Number(reasoning?.profile?.elements?.raw?.[el]||0);
    return "<b>보태면 좋은 기운</b> — "+elementName(el)+". 너한텐 "+EL_KR[el]+josaSuffix(EL_KR[el],"이","가")+" "+groupLabelJ(group,"이고","고")+", 겉 글자로는 "+raw+"개"+
      (raw===0?"라 사람·환경·습관으로 밖에서 채워야 하는 쪽이야.":"라 이미 있는 걸 더 살리는 쪽이야.");
  }

  function harmRows(reasoning,s){
    const domain=DOMAIN[s.concern]||DOMAIN.money;
    const syn=synthesisFor(reasoning);
    const st=syn.mechanisms?.structure||{};
    const evidence=Object.fromEntries((syn.tenGodEvidence||[]).map((row,i)=>[row.god,{...row,index:i}]));
    const center=centerGodOf(reasoning)||"사주 중심";
    const gods=[...new Set(st.harmfulGods||[])].sort((a,b)=>
      Number(evidence[b]?.weight||0)-Number(evidence[a]?.weight||0) ||
      (evidence[a]?.index??999)-(evidence[b]?.index??999)
    );
    const rows=gods.slice(0,3).map(g=>({
      god:g,
      text:godSpecificCondition(g,domain,"harm")||domain.harm[godGroup(g)]||domain.harm.unknown,
      evidence:evidence[g]
        ? godLabelJ(g,"이","가")+" "+godPlaces(reasoning,g,1)+"에 있어서, 과해지면 사주 중심인 "+withJosa(center,"을","를")+" 흔들 수 있어."
        : godLabelJ(g,"은","는")+" 네 사주에 없지만, 들어오면 사주 중심인 "+withJosa(center,"을","를")+" 흔드는 쪽이야.",
    }));
    if(!rows.length){
      const drive=syn.mechanisms?.drive||{};
      const group=drive.pressureGroup||"unknown";
      const share=groupShare(reasoning,group);
      const absentHarm=(st.structuralHarmGods||[]).filter(g=>!evidence[g]);
      let text=GROUP_NAME[group]
        ? (drive.pressureOverload
          ? groupLabelJ(group,"이","가")+" 이미 "+share+"%로 가장 큰 바깥 힘인데 일간 힘은 "+strengthPlain(reasoning)+"이라, 이쪽 부담이 더 붙으면 네 힘보다 부담이 먼저 커져."
          : groupLabelJ(group,"이","가")+" "+share+"%로 가장 큰 바깥 힘이라, 이쪽이 한꺼번에 늘어나는 환경은 조심하는 게 좋아.")
        : "흔드는 글자가 하나로 두드러지지 않아서, 가장 크게 부담을 주는 쪽을 경계 기준으로 잡았어.";
      if(absentHarm.length) text+=" 원래 "+withJosa(center,"을","를")+" 깨는 글자는 "+absentHarm.join("·")+"인데 네 사주엔 없어서, 그보다는 부담이 쌓이는 쪽을 보면 돼.";
      rows.push({god:null,text:domain.harm[group]||domain.harm.unknown,evidence:text});
    }
    return rows;
  }

  function relationRiskSentence(reasoning){
    const ctx=reasoning?.context||{};
    const clash=(ctx.clashes||[])[0];
    if(clash?.aPos&&clash?.bPos){
      const monthOrDay=[clash.aPos,clash.bPos].some(x=>x==="month"||x==="day");
      const a=ZHI_KR[clash.aZhi]||"", b=ZHI_KR[clash.bZhi]||"";
      return pillarName(reasoning,clash.aPos)+"의 "+a+josaSuffix(a,"과","와")+" "+pillarName(reasoning,clash.bPos)+"의 "+b+josaSuffix(b,"이","가")+" 정면으로 부딪히는 충 관계라, "+
        (monthOrDay?"생활의 중심이 흔들리는 선택은 체감이 더 커.":"한쪽을 세게 밀면 다른 쪽이 흔들릴 수 있어.");
    }
    const other=[
      ...(ctx.punishments||[]).map(x=>({...x,label:"형"})),
      ...(ctx.harms||[]).map(x=>({...x,label:"해"})),
      ...(ctx.breaks||[]).map(x=>({...x,label:"파"})),
    ].filter(x=>x.aPos&&x.bPos);
    if(other.length){
      const x=other[0];
      const a=ZHI_KR[x.aZhi]||"", b=ZHI_KR[x.bZhi]||"";
      return pillarName(reasoning,x.aPos)+"의 "+a+josaSuffix(a,"과","와")+" "+pillarName(reasoning,x.bPos)+"의 "+b+"처럼 아랫글자끼리 불편하게 걸리는 "+x.label+" 관계도 있지만, 이것만으로 나쁘다고 보지 않고 다른 힘과 같이 봐.";
    }
    return "";
  }

  // ===== 장면 먼저 보여주는 문장층 (v5.2) =====
  // 각 NOTE는 "그 사람이 실제로 겪었을 법한 장면" → "왜 그러냐면" 한 줄 → 접힌 사주 근거 순서로 쓴다.
  // 장면 문장은 모두 계산된 사주 사실(가장 큰 십신, 강약, 가장 약한 기운, 도움·방해 십신)로 고른다.
  const HEADLINE={
    정관:"책임감이 먼저 움직이는 사주",편관:"몰아붙일수록 버티는 사주",
    정재:"계산이 서야 움직이는 사주",편재:"기회가 보이면 먼저 손이 가는 사주",
    식신:"좋아하는 걸 꾸준히 만들어내는 사주",상관:"불합리한 걸 못 참는 사주",
    비견:"내 방식대로 해야 풀리는 사주",겁재:"지는 건 싫은 사주",
    정인:"충분히 알아야 움직이는 사주",편인:"생각이 한번 시작되면 깊게 파고드는 사주",
  };
  const CORE_SCENE={
    정관:"너 부탁받으면 거절 잘 못 하지? “이거 네가 좀 해줘”가 오면 일단 맡고, 네 몫 얘기는 뒤로 미뤄. 약속이나 규칙을 어기는 사람을 보면 속으로 꽤 오래 신경 쓰이고.",
    편관:"마감 직전이나 누가 몰아붙일 때 오히려 집중이 확 되지? 대신 평소에도 ‘뭔가 해야 한다’는 긴장이 깔려 있어서, 쉬는 날에도 완전히 쉬는 느낌이 잘 안 들어.",
    정재:"돈이든 시간이든 ‘이게 남는 건가’부터 계산하지? 큰 모험보다는 확실한 쪽을 고르고, 한번 자리 잡은 루틴은 잘 안 바꾸는 편이야.",
    편재:"새로운 기회나 사람 얘기를 들으면 일단 궁금해서 발을 들이지? 벌이는 건 빠른데, 벌여놓은 걸 끝까지 챙겨서 거둬들이는 건 상대적으로 약해.",
    식신:"뭔가에 꽂히면 묵묵히 오래 붙잡고 만들어내지? 대신 그걸 ‘돈 받고 팔자’는 말은 이상하게 쑥스러워서 잘 못 꺼내.",
    상관:"이상한 규칙이나 말 안 되는 지시를 보면 속에서 반박부터 올라오지? 참으면 스트레스가 쌓이고, 말하면 ‘너무 세다’는 소리를 듣는 쪽이야.",
    비견:"남이 정해준 방식보다 내가 납득한 방식으로 해야 속이 편하지? 도움받는 것보다 혼자 해결하는 게 편해서, 힘들어도 먼저 말을 잘 안 해.",
    겁재:"겉으론 괜찮은 척해도 비교당하면 속으로 확 불붙지? 같이 하는 일에서도 내 몫이 얼마인지 은근히 신경 쓰이는 편이야.",
    정인:"뭘 시작하기 전에 알아보고 준비하는 시간이 길지? 확신이 없으면 잘 안 움직이고, 믿을 만한 사람이 ‘괜찮아’ 해줘야 마음이 놓여.",
    편인:"남들이 그냥 넘기는 말 한마디도 혼자 여러 번 곱씹지? 관심 가는 건 끝까지 파고드는데, 관심 없는 건 아예 손이 안 가.",
  };
  const STRENGTH_SCENE={
    신약:"그리고 겉으론 잘 해내는데, 혼자 있을 때 한꺼번에 확 지치는 날이 있어.",
    신강:"그리고 한번 정하면 웬만해선 안 꺾여서, ‘고집 있다’는 말도 꽤 들어봤을 거야.",
    중화:"컨디션 좋은 날엔 다 해낼 것 같다가도, 일이 겹치면 갑자기 버거워지는 날이 있어.",
  };
  const WEAK_SCENE={
    output:"생각은 많은데, 그걸 말로 꺼내거나 결과물로 내놓는 건 자꾸 미뤄지지?",
    wealth:"열심히 한 것에 비해, 돈이나 보상으로 챙기는 건 늘 뒤로 밀리지?",
    officer:"하고 싶은 건 많은데, 마감이나 정해진 틀이 없으면 끝까지 가기가 어렵지?",
    print:"쉬어야 할 때 제대로 못 쉬고, 배우거나 충전하는 시간을 사치처럼 느끼지?",
    self:"남 맞춰주다 보면, 정작 내 기준이 뭐였는지 흐려질 때가 있지?",
  };
  const FIT_SCENE={
    정재:"월급날·마감일처럼 날짜가 정해져 있고, 한 만큼 숫자로 돌아오는 곳에서 네 실력이 훨씬 잘 나와.",
    편재:"여러 사람·기회를 만나되 어디까지 거둬들일지 선이 분명한 판에서, 네 감이 제일 잘 맞아.",
    정관:"역할과 평가 기준이 처음부터 딱 정해진 곳에서는, 시키지 않아도 제일 믿음직한 사람이 돼.",
    편관:"어렵고 부담 큰 일이어도 권한을 같이 받으면, 오히려 제일 크게 해내는 쪽이야.",
    식신:"꾸준히 만든 게 쌓여서 눈에 보이는 곳에 있으면, 지치지 않고 오래 가.",
    상관:"불편한 점을 말해도 불이익이 없는 곳에선, 아이디어가 제일 많이 나오는 사람이 돼.",
    정인:"배울 시간과 믿을 만한 사람의 피드백이 있는 곳에서, 네 실력이 안정적으로 올라가.",
    편인:"네 방식대로 깊게 파볼 재량이 있는 곳에서는, 남들이 못 찾는 답을 찾아내.",
    비견:"내가 결정할 범위가 분명한 곳에서는, 누가 안 봐도 알아서 끝까지 해.",
    겁재:"같이 하되 각자 몫이 분명한 판에서는, 경쟁심이 오히려 성과로 바뀌어.",
  };
  const HARM_SCENE={
    officer:"처음엔 ‘내가 하면 되지’ 하고 맡다가, 어느새 일은 다 네 몫인데 결정권은 없는 상태가 돼.",
    wealth:"기회라고 하나둘 벌이다 보면, 어디서 돈과 시간이 새는지 모르게 돼.",
    output:"말하고 만들어내느라 에너지는 다 쓰는데, 정작 돌아오는 건 없는 상태가 돼.",
    self:"비교나 고집 싸움이 붙으면, 이기는 데 에너지를 다 써버려.",
    print:"준비만 계속하다가, 정작 해볼 타이밍을 놓쳐.",
  };

  function detailsBlock(lines){
    const rows=(lines||[]).map(x=>String(x||"").replace(/<br\s*\/?>/gi," ").trim()).filter(Boolean);
    if(!rows.length) return "";
    return '<details class="note-detail"><summary>사주 근거 자세히 보기</summary><div class="note-detail-body">'+rows.join("<br>")+"</div></details>";
  }
  function headlineOf(reasoning){
    const top=godRows(reasoning)[0];
    return top&&HEADLINE[top.god]?HEADLINE[top.god]:"";
  }
  function lensScene(reasoning,s){
    const group=lensGroupOf(s);
    if(!GROUP_NAME[group]) return "";
    const share=groupShare(reasoning,group);
    const head=quoted(s.label)+" "+groupLabel(group)+"으로 보는데, 네 사주에선 "+share+"%";
    if(share>=30) return head+"로 커. 그래서 없어서 문제라기보다, 너무 신경 쓰다가 지치는 쪽이야.";
    if(share>=10) return head+"로 적당히 있어. 그래서 있냐 없냐보다 어떻게 쓰느냐에서 결과 차이가 크게 나.";
    return head+"로 적은 편이야. 그래서 저절로 풀리길 기다리기보다, 기준을 직접 정해야 움직여.";
  }

  // ===== NOTE 7개 구성 (v6) =====
  // 1 핵심(너는 이런 사람) → 2 진짜 원인 → 3 푸는 법 → 4 잘 맞는 것 → 5 가까운 흐름 → 6 조심할 것 → 7 이번 주 할 것.
  // 고민(상황)마다 원인·해법 문장이 따로 있고, 어느 문장을 쓸지는 사주에서 가장 큰 힘(십신 그룹)·필요한 기운·
  // 배우자 자리·신살·합충 같은 계산값으로만 고른다.
  const CAUSE_TITLE={
    money:{saving:"돈이 안 모이는 진짜 이유",income:"수입이 안 오르는 진짜 이유",side:"부업이 돈이 안 되는 진짜 이유",flow:"네 돈이 들어오는 길"},
    career:{exam:"점수가 막히는 진짜 이유",jobsearch:"취업이 막히는 진짜 이유",move:"이직·퇴사 생각이 드는 진짜 이유",current:"지금 자리에서 인정이 안 붙는 진짜 이유"},
    love:{crush:"썸이 제자리인 진짜 이유",relationship:"이 연애에서 서운해지는 진짜 이유",breakup:"그 사람이 자꾸 생각나는 진짜 이유",new:"새 인연이 안 생기는 진짜 이유"},
    path:{lost:"뭘 해야 할지 모르겠는 진짜 이유",current:"지금 길이 흔들리는 진짜 이유",switch:"분야를 바꾸고 싶은 진짜 이유",strength:"네 진짜 강점"},
    people:{friend:"친구 관계에서 지치는 진짜 이유",work:"직장 사람 때문에 힘든 진짜 이유",family:"가족과 부딪히는 진짜 이유",distance:"이 관계를 못 놓는 진짜 이유"},
    mental:{burnout:"번아웃이 온 진짜 이유",overthink:"생각이 멈추지 않는 진짜 이유",low:"아무것도 하기 싫은 진짜 이유",recover:"컨디션이 안 돌아오는 진짜 이유"},
  };
  const CAUSE_HOOK={
    money:{
      saving:"돈이 안 모이는 건 네가 헤퍼서가 아니야. 네 사주에는 돈이 새는 구멍이 정해져 있어.",
      income:"수입이 안 오르는 이유는 실력보다 ‘돈을 받는 방식’에 있어.",
      side:"부업은 네 사주에서 되는 쪽과 막히는 쪽이 분명하게 갈려.",
      flow:"돈 흐름은 운보다 먼저, 네 돈이 어디서 들어오는 사주인지 알아야 보여.",
    },
    career:{
      exam:"점수가 막히는 건 공부량이 아니라 네 공부 습관의 한 지점 때문이야.",
      jobsearch:"취업이 막히는 건 스펙보다 움직이는 방식 쪽 문제일 가능성이 커.",
      move:"이직·퇴사 생각이 드는 건 일이 힘들어서만은 아니야.",
      current:"지금 자리에서 인정이 안 붙는 건 실력이 아니라 보여주는 방식 때문이야.",
    },
    love:{
      crush:"썸이 제자리인 건 상대 마음보다 네가 움직이는 방식 때문일 수 있어.",
      relationship:"이 연애에서 서운함이 쌓이는 건 사랑이 부족해서가 아니야.",
      breakup:"그 사람이 자꾸 생각나는 건 미련만의 문제가 아니야.",
      new:"새 인연이 안 생기는 건 운이 없어서가 아니라, 네가 사람을 들이는 방식 때문이야.",
    },
    path:{
      lost:"뭘 해야 할지 모르겠는 건 하고 싶은 게 없어서가 아니야.",
      current:"지금 길이 흔들리는 건 틀린 길이라서가 아닐 수 있어.",
      switch:"분야를 바꾸고 싶은 마음에는 네 사주가 보내는 신호가 있어.",
      strength:"네 강점은 이미 사주에 제일 크게 쓰여 있어.",
    },
    people:{
      friend:"친구 관계에서 지치는 데는 네 사주만의 패턴이 있어.",
      work:"직장 사람 때문에 힘든 건 그 사람만의 문제가 아니야.",
      family:"가족과 자꾸 부딪히는 데는 반복되는 지점이 하나 있어.",
      distance:"이 관계를 쉽게 못 놓는 데는 이유가 있어.",
    },
    mental:{
      burnout:"지금 지친 건 의지가 약해서가 아니야.",
      overthink:"생각이 멈추지 않는 데는 네 사주만의 이유가 있어.",
      low:"아무것도 하기 싫은 건 게을러서가 아니야.",
      recover:"컨디션이 안 돌아오는 건 쉬는 방법이 너한테 안 맞아서일 수 있어.",
    },
  };
  // CAUSE[고민][상황][가장 큰 힘의 그룹]
  const CAUSE={
    money:{
      saving:{
        self:"돈이 사람 따라 나가. 친구 밥값, 모임 회비, ‘이번엔 내가 낼게’, 빌려주고 못 받은 돈… 하나하나는 작아도 모아보면 제일 큰 구멍이 ‘사람’이야.",
        output:"돈이 ‘하고 싶은 것’으로 나가. 맛있는 거, 취미, 갑자기 꽂힌 물건… 쓰는 순간엔 다 이유가 있는데, 월말에 보면 남는 게 없지?",
        wealth:"돈 감각은 있는데 벌려놓은 게 많아. 여기저기 기회·할인·투자에 조금씩 걸어두다 보니, 돈이 한곳에 모일 틈이 없어.",
        officer:"‘써야 하는 돈’이 먼저 빠져나가. 경조사, 선물, 회비, 부모님, 남 부탁… 거절하면 도리를 못 한 것 같아서 결국 내잖아. 네가 헤픈 게 아니라 의무 지출이 많은 거야.",
        print:"돈이 ‘나를 편하게 해주는 것’으로 나가. 배달, 택시, 자기계발, 마음 편해지는 소비… 지친 나를 달래는 비용이 생각보다 커.",
      },
      income:{
        self:"혼자 다 해내려다 보니 몸값을 올릴 기회를 놓쳐. 협상이나 부탁을 ‘아쉬운 소리’처럼 느껴서, 받을 만큼 달라는 말을 잘 안 하지?",
        output:"실력은 있는데 가격을 못 매겨. 결과물은 잘 만드는데 ‘이거 얼마예요’가 쑥스러워서, 네 가치보다 싸게 일하는 경우가 많아.",
        wealth:"돈 되는 길은 잘 보이는데 한 곳에 오래 안 머물러. 기회가 보일 때마다 옮기다 보니, 한 분야에서 단가가 쌓일 시간이 부족해.",
        officer:"맡은 일은 늘어나는데 보상 얘기는 뒤로 미뤄. ‘열심히 하면 알아주겠지’ 하고 기다리는 동안 책임만 커지고 월급은 제자리야.",
        print:"준비는 오래 하는데 돈으로 바꾸는 건 늦어. 자격증·공부·계획은 쌓이는데, 그걸 실제로 팔거나 협상하는 단계에서 멈춰.",
      },
      side:{
        self:"부업도 혼자 다 하려고 해서 금방 지쳐. 누구랑 나눠 하거나 맡기는 게 불편해서, 규모가 커질 틈이 없어.",
        output:"아이디어는 제일 많은 사주야. 문제는 ‘일단 만들어보자’까진 빠른데, 값을 붙여 파는 단계에서 자꾸 멈춘다는 거야.",
        wealth:"돈 되는 감은 좋아. 대신 이것저것 동시에 벌여서, 하나가 제대로 돈이 되기 전에 다음 걸로 넘어가.",
        officer:"본업 책임이 워낙 커서 부업에 쓸 힘이 남지 않아. 퇴근하고 나면 이미 방전이라 ‘다음 주부터’가 반복되지?",
        print:"알아보고 공부하는 데 시간을 제일 많이 써. 강의 듣고 자료 모으다 보면, 정작 첫 판매는 계속 미뤄져.",
      },
      flow:{
        self:"네 돈은 ‘내가 직접 벌고 직접 관리할 때’ 흐름이 좋아. 남 말 듣고 움직이거나 누구랑 돈을 묶으면 오히려 흐름이 꼬여.",
        output:"네 돈은 ‘내가 만든 것’에서 들어오는 흐름이야. 월급보다 결과물·기술·콘텐츠가 쌓일수록 돈 흐름이 커지는 쪽이야.",
        wealth:"네 돈은 들어오는 문이 여러 개인 흐름이야. 대신 나가는 문도 같이 많아서, 흐름이 좋을 때 묶어두는 게 핵심이야.",
        officer:"네 돈은 ‘자리와 신용’에서 들어오는 흐름이야. 직함·경력·조직 안에서 인정이 쌓일수록 돈도 안정적으로 붙어.",
        print:"네 돈은 ‘배운 걸 인정받을 때’ 들어오는 흐름이야. 자격·전문성·계약서처럼 문서로 남는 게 생길 때 돈 흐름이 바뀌어.",
      },
    },
    career:{
      exam:{
        self:"공부 방법을 남 말대로 잘 안 바꾸지? 내 방식이 익숙해서 고수하는데, 점수가 막힌 구간에서도 방법을 안 바꾸는 게 문제야.",
        output:"이해는 빠른데 반복을 못 견뎌. 새로 배울 땐 재밌는데, 같은 유형을 여러 번 푸는 단계에서 집중이 풀려.",
        wealth:"효율을 너무 따져서 ‘시험에 나올 것만’ 하다가 기본기에서 구멍이 나. 점수가 오르다 멈추는 구간이 생기지?",
        officer:"실력보다 긴장이 발목을 잡아. 평소엔 되는데 실전에서 ‘틀리면 안 된다’는 부담이 커서 아는 것도 놓쳐.",
        print:"공부량은 충분한데 실전 연습이 부족해. 개념 정리·필기에 시간을 많이 쓰고, 시간 재고 푸는 연습은 뒤로 미루지?",
      },
      jobsearch:{
        self:"혼자 준비하는 시간이 길어. 도움 청하거나 사람을 통해 들어가는 걸 불편해해서, 정보와 기회가 늦게 들어와.",
        output:"하고 싶은 게 분명해서 안 맞는 곳엔 지원 자체를 안 해. 기준은 좋은데 지원 수가 너무 적어서 반응을 못 받아.",
        wealth:"조건을 빨리 비교하다 보니 여기저기 넣는데, 한 곳에 대한 준비가 얕아져서 면접에서 흔들려.",
        officer:"완벽하게 준비된 다음에 지원하려고 해. ‘아직 부족해’ 하는 사이 시기를 놓치는 게 제일 큰 이유야.",
        print:"준비가 끝이 안 나. 스펙·자격증·포트폴리오를 계속 보완하느라 실제 지원과 면접 경험이 부족해.",
      },
      move:{
        self:"지금 자리에서 네 방식대로 할 수 있는 범위가 너무 좁아서야. 일이 힘든 것보다 ‘내 뜻대로 못 하는 것’이 더 답답하지?",
        output:"할 말을 못 하고 참는 게 쌓여서야. 네 아이디어나 의견이 계속 막히는 곳에서는 에너지가 빠르게 바닥나.",
        wealth:"한 만큼 돌아오지 않는다는 계산이 섰기 때문이야. 일보다 ‘이 조건이 맞나’가 더 크게 보이지?",
        officer:"책임은 늘어나는데 기준이 계속 바뀌어서야. 책임감으로 버텨왔는데, 그 버팀이 이제 한계에 가까워.",
        print:"지금 자리에서 더 배울 게 없다고 느껴서야. 성장하는 느낌이 멈추면, 일이 아무리 편해도 떠나고 싶어져.",
      },
      current:{
        self:"혼자 다 해내고 티를 안 내서야. 도움 없이 끝내니까 위에서는 원래 쉬운 일인 줄 알아.",
        output:"성과를 내는 방식이 윗사람 기준과 달라서야. 네가 잘한 포인트를 상대가 알아보게 말해주지 않으면 그냥 지나가.",
        wealth:"성과는 내는데 보상 얘기가 먼저 나가서 계산적으로 보일 때가 있어. 인정받는 순서가 꼬여.",
        officer:"일은 제일 많이 하는데 ‘해달라’는 말을 못 해서야. 맡은 건 다 하니까, 네 몫 요구가 늘 마지막으로 밀려.",
        print:"준비는 제일 철저한데 드러내는 걸 안 해서야. 보여주기 전에 더 다듬느라 인정받을 타이밍을 놓쳐.",
      },
    },
    love:{
      crush:{
        self:"마음은 있는데 먼저 다가가는 게 자존심 상하지? 상대가 먼저 오길 기다리다가 타이밍이 지나가.",
        output:"표현은 빠른데 상대 속도를 앞질러. 네 마음이 먼저 커지니까, 상대 반응이 조금만 늦어도 혼자 식거나 불안해져.",
        wealth:"잘해주는 걸로 마음을 보여주는데, 그게 ‘좋은 사람’으로만 남고 설렘으로는 안 넘어가기 쉬워.",
        officer:"상대에게 부담 될까 봐 한 발 물러서. 확실해지기 전엔 티를 안 내니까, 상대는 네 마음을 모르고 지나가.",
        print:"상대 말 한마디, 답장 속도를 혼자 오래 해석해. 확인하는 대신 생각만 깊어져서 썸이 제자리야.",
      },
      relationship:{
        self:"서로 내 방식이 맞다고 버티는 순간이 많지? 사랑이 식어서가 아니라, 누가 먼저 맞추냐에서 서운함이 생겨.",
        output:"마음을 말로 다 하는데 상대는 그만큼 표현을 안 해서 서운하지? 표현의 온도 차이가 제일 큰 이유야.",
        wealth:"네가 쓰는 시간·돈·배려에 비해 돌아오는 게 적다고 느낄 때 서운해져. 속으로 계산이 시작되면 마음이 식어.",
        officer:"서운한 걸 바로 말 안 하고 참다가 한 번에 터지지? 관계를 지키려는 책임감이 오히려 서운함을 쌓아.",
        print:"상대가 뭘 원하는지 먼저 살피느라 네가 원하는 건 말을 안 해. 그러다 ‘왜 몰라주지’가 쌓여.",
      },
      breakup:{
        self:"자존심 때문에 끝까지 할 말을 못 해서야. 정리가 안 된 채 끝나서 마음 한쪽이 계속 열려 있어.",
        output:"하고 싶은 말이 아직 남아 있어서야. 말로 풀어야 정리되는 사주라, 못 한 말이 계속 맴돌아.",
        wealth:"그 사람에게 쓴 시간과 마음이 아까워서야. ‘이만큼 했는데’가 남아 있으면 쉽게 못 놓아.",
        officer:"헤어진 게 내 책임 같아서야. 잘못한 게 있었나 되짚느라 그 사람을 계속 붙잡고 있어.",
        print:"좋았던 기억을 반복해서 떠올려서야. 생각을 곱씹는 사주라, 시간이 지날수록 오히려 그 사람이 미화돼.",
      },
      new:{
        self:"혼자가 편해서 만남의 기회 자체를 잘 안 만들어. 누가 소개해줘도 ‘굳이…’ 하고 넘기지?",
        output:"첫인상에서 확 끌려야 움직이는 편이라, 천천히 알아가야 좋은 사람은 초반에 걸러버려.",
        wealth:"만나기 전부터 조건을 먼저 계산해. 따져보다 보면 설렐 틈이 없어.",
        officer:"기준이 높고 신중해서 쉽게 마음을 안 열어. 좋은 사람을 만나도 확신이 서기 전까지 거리를 둬.",
        print:"혼자 생각하는 시간이 길어서 새로운 사람을 만날 에너지가 잘 안 남아. 마음 준비가 먼저인 사주야.",
      },
    },
    path:{
      lost:{
        self:"남이 추천하는 길은 다 마음에 안 들지? 네가 납득해야 움직이는데, 아직 직접 해본 게 부족해서 판단 기준이 없어.",
        output:"하고 싶은 게 없는 게 아니라 너무 많아서야. 이것저것 관심은 가는데 하나로 좁히는 게 어려워.",
        wealth:"돈이 되는지, 안정적인지부터 따지다 보니 마음이 가는 걸 계속 뒤로 미뤄.",
        officer:"‘제대로 된 길’이어야 한다는 부담이 커서야. 실패하면 안 된다는 생각에 첫발을 못 떼.",
        print:"생각과 정보는 충분한데 직접 해본 게 적어서야. 머리로만 고르니까 뭘 골라도 확신이 안 서.",
      },
      current:{
        self:"네 방식대로 할 수 있는지가 제일 중요한데, 지금 길에서 그게 줄어들 때 흔들려.",
        output:"지금 하는 일에 네 생각이나 창의력을 쓸 틈이 없을 때 ‘이게 맞나’ 싶어져.",
        wealth:"노력 대비 돌아오는 게 보이지 않을 때 흔들려. 현실 보상이 너한텐 방향을 확인하는 신호야.",
        officer:"남들 보기에 번듯한 길인지, 인정받는 길인지가 신경 쓰여서야. 기준을 밖에 두면 계속 흔들려.",
        print:"더 배울 게 없다고 느낄 때 흔들려. 성장하는 느낌이 너한텐 맞는 길이라는 증거야.",
      },
      switch:{
        self:"지금 분야에서 내 자리가 안 보여서야. 남 밑에서 오래 버티는 것보다 내 영역을 갖고 싶은 마음이 커졌어.",
        output:"지금 분야가 너한테 좁아서야. 표현하고 만들고 싶은 게 넘쳐서, 새 판에서 해보고 싶어져.",
        wealth:"다른 분야가 더 기회가 커 보여서야. 현실 감각이 좋은 만큼, 옮기기 전에 숫자로 확인하는 게 중요해.",
        officer:"지금 자리의 규칙과 책임에 지쳐서야. 분야가 싫은 건지, 지금 조직이 싫은 건지부터 나눠봐야 해.",
        print:"새로운 걸 배우고 싶은 마음이 커져서야. 배움이 멈춘 곳에선 오래 못 버티는 사주야.",
      },
      strength:{
        self:"네 강점은 ‘끝까지 혼자 해내는 힘’이야. 누가 안 봐도, 도움 없이도 맡은 걸 마무리해.",
        output:"네 강점은 ‘만들어내고 표현하는 힘’이야. 생각을 말·글·결과물로 바꾸는 속도가 남들보다 빨라.",
        wealth:"네 강점은 ‘현실 감각’이야. 뭐가 돈이 되고 뭐가 손해인지 남들보다 빨리 보여.",
        officer:"네 강점은 ‘믿고 맡길 수 있는 사람’이라는 거야. 약속·마감·책임을 지키는 건 네가 제일 잘해.",
        print:"네 강점은 ‘깊게 이해하는 힘’이야. 남들이 대충 넘어가는 걸 끝까지 파고들어서 제대로 알아내.",
      },
    },
    people:{
      friend:{
        self:"친구 사이에도 대등함이 중요한데, 한쪽이 기울면 속으로 확 불편해져. 비교당하거나 무시당하는 느낌에 제일 크게 지쳐.",
        output:"할 말을 참는 관계에서 지쳐. 불편한 걸 말하면 분위기 깨질까 봐 참다가, 결국 혼자 거리를 두지?",
        wealth:"주는 쪽이 늘 너라서 지쳐. 시간·돈·도움을 먼저 쓰는데, 돌아오는 게 없다고 느낄 때 확 식어.",
        officer:"친구 사이에도 예의와 약속을 중요하게 여겨서, 상대가 가볍게 어기는 게 쌓이면 크게 지쳐.",
        print:"친구 기분을 먼저 살피고 이해하려다 네 불편함은 뒤로 미뤄. 이해해주는 역할만 하다 지쳐.",
      },
      work:{
        self:"내 방식에 간섭받는 게 제일 힘들지? 일 자체보다 누가 옆에서 이래라저래라 하는 게 스트레스야.",
        output:"말 한마디가 부딪혀. 솔직하게 말하는 편인데, 그게 윗사람이나 동료에겐 세게 들릴 때가 있어.",
        wealth:"일은 같이 하는데 공은 다른 사람이 가져갈 때 제일 억울하지? 몫이 불분명한 관계에서 힘들어져.",
        officer:"싫은 소리를 못 해서 일이 다 너한테 몰려. 거절 못 하는 사람한테 일이 몰리는 흐름에 네가 들어가 있어.",
        print:"상대 의도를 계속 곱씹어서 힘들어. 한마디를 들으면 퇴근해서도 그 말이 머릿속에서 안 떠나지?",
      },
      family:{
        self:"가족이 내 방식을 인정 안 해줄 때 제일 부딪혀. 너는 네 선택을 존중받고 싶은데, 가족은 걱정이라는 이름으로 간섭하지?",
        output:"하고 싶은 말을 참다가 한 번에 터져. 가족이라 더 편하게 말이 세게 나가고, 그게 다시 싸움이 돼.",
        wealth:"돈이나 현실 문제가 얽혀서 부딪혀. 누가 더 부담하냐, 누가 더 챙기냐에서 서운함이 쌓여.",
        officer:"가족에 대한 책임감이 너무 커서 지쳐. 네가 다 챙겨야 한다는 부담이 늘 깔려 있지?",
        print:"가족 기대에 맞추려다 네 마음은 뒤로 밀려. 서운한 걸 말하면 불효 같아서 속으로 삭여.",
      },
      distance:{
        self:"놓으면 지는 것 같아서야. 이 관계가 불편해도 내가 먼저 끊는 건 자존심이 허락을 안 해.",
        output:"아직 하고 싶은 말을 못 해서야. 말로 한번 정리를 해야 끝낼 수 있는 사주라, 애매하게 남아 있어.",
        wealth:"그동안 쓴 시간과 정이 아까워서야. ‘이만큼 했는데’가 발목을 잡아.",
        officer:"관계를 끊는 게 도리에 어긋나는 것 같아서야. 책임감 때문에 불편한 관계도 오래 유지해.",
        print:"상대 사정을 너무 잘 이해해서야. ‘그럴 수도 있지’ 하다 보니 끊을 이유를 스스로 지워버려.",
      },
    },
    mental:{
      burnout:{
        self:"힘든 걸 혼자 다 떠안아서야. 도와달라는 말을 안 하고 버티다 보니, 쉬어야 할 때를 놓쳤어.",
        output:"에너지를 밖으로 너무 많이 써서야. 말하고 만들고 챙기느라 쓴 만큼 채울 시간이 없었어.",
        wealth:"해야 할 일과 챙길 게 한꺼번에 몰려서야. 일·돈·일정을 동시에 계산하느라 머리가 쉴 틈이 없었어.",
        officer:"책임감으로 버텨온 게 한계에 온 거야. ‘내가 안 하면 안 된다’는 생각에 쉬는 걸 계속 미뤄왔지?",
        print:"몸은 쉬어도 머리가 안 쉬어서야. 누워서도 생각이 계속 돌아가니까 쉬어도 회복이 안 돼.",
      },
      overthink:{
        self:"내 판단이 맞는지 확인하고 싶어서야. 남한테 묻기보다 혼자 결론 내려고 하니 생각이 길어져.",
        output:"생각을 밖으로 못 빼서야. 말하거나 써야 정리되는 사주인데, 속에만 담아두니까 계속 맴돌아.",
        wealth:"모든 경우의 수를 계산해서야. 손해 볼 가능성을 다 따지다 보니 결론이 안 나.",
        officer:"실수하면 안 된다는 부담 때문이야. 틀릴까 봐 같은 걸 몇 번씩 다시 확인하지?",
        print:"원래 깊게 생각하는 사주라서야. 한 가지가 떠오르면 거기서 가지를 치면서 끝없이 이어져.",
      },
      low:{
        self:"혼자 버티는 힘이 다 떨어져서야. 누구한테 기대는 게 익숙하지 않아서, 바닥까지 가서야 멈춰.",
        output:"하고 싶은 걸 못 하는 시간이 길어져서야. 표현하고 만들 통로가 막히면 금방 무기력해지는 사주야.",
        wealth:"노력해도 돌아오는 게 없다고 느껴서야. 결과가 안 보이면 움직일 이유를 못 찾아.",
        officer:"해야 하는 일만 계속하다가 내가 원하는 게 뭔지 잊어서야. 의무만 남으면 마음이 꺼져.",
        print:"충전이 안 된 채로 너무 오래 달려서야. 쉬어야 할 때 못 쉬면 한 번에 멈춰버리는 사주야.",
      },
      recover:{
        self:"혼자 회복하려고 해서야. 사람한테서 힘을 받는 것도 회복인데, 그걸 안 쓰고 있어.",
        output:"쉬는 방법이 너한테 안 맞아서야. 가만히 쉬는 것보다 뭔가 하면서 풀어야 회복되는 사주야.",
        wealth:"생활 리듬이 들쭉날쭉해서야. 일정과 돈 걱정이 흔들리면 몸도 같이 흔들려.",
        officer:"쉬는 것도 ‘해야 할 일’처럼 해서야. 계획대로 못 쉬면 오히려 더 스트레스 받지?",
        print:"회복할 시간이 아직 부족해서야. 남들보다 충전 시간이 더 필요한 사주야.",
      },
    },
  };

  const FIX_TITLE={
    money:{saving:"돈이 남게 하는 방법",income:"수입을 올리는 방법",side:"부업을 돈으로 바꾸는 방법",flow:"돈 흐름을 타는 방법"},
    career:{exam:"점수를 올리는 방법",jobsearch:"합격 가능성을 올리는 방법",move:"후회 없이 결정하는 방법",current:"지금 자리에서 인정받는 방법"},
    love:{crush:"썸을 한 걸음 진전시키는 방법",relationship:"서운함을 줄이는 방법",breakup:"마음을 정리하는 방법",new:"인연을 만드는 방법"},
    path:{lost:"방향을 찾는 방법",current:"지금 길을 확인하는 방법",switch:"안전하게 옮기는 방법",strength:"강점을 제대로 쓰는 방법"},
    people:{friend:"덜 지치는 방법",work:"덜 부딪히는 방법",family:"가족과 덜 부딪히는 방법",distance:"거리를 정하는 방법"},
    mental:{burnout:"다시 채우는 방법",overthink:"생각을 끊는 방법",low:"다시 움직이는 방법",recover:"회복을 붙이는 방법"},
  };
  // FIX[고민][상황][가장 큰 힘의 그룹]: 원인에 바로 맞서는 한 가지 행동.
  const FIX={
    money:{
      saving:{
        self:"‘사람 지출’ 한도부터 정해. 한 달 모임·밥값 예산을 정해두고, 빌려주는 돈은 ‘안 돌아와도 되는 금액’까지만.",
        output:"사고 싶은 건 장바구니에 넣고 3일 뒤에 다시 봐. 그래도 사고 싶은 것만 사면, 새는 돈의 절반이 막혀.",
        wealth:"통장을 목적별로 나눠서 ‘안 건드리는 돈’부터 먼저 떼어놔. 기회 투자는 그다음 남는 돈으로만.",
        officer:"의무 지출을 한 번 전부 적어봐. 경조사·선물·회비 중 ‘안 해도 관계가 안 깨지는 것’ 하나만 줄여도 확 달라져.",
        print:"‘나를 달래는 소비’에 이름을 붙이고 한 주 예산을 정해. 지쳤을 때 쓰는 돈을 쉬는 시간으로 바꾸는 게 핵심이야.",
      },
      income:{
        self:"혼자 정하지 말고 시장 가격부터 확인해. 같은 일을 하는 사람들이 얼마 받는지 알면 요구할 말이 생겨.",
        output:"네 결과물에 가격표부터 붙여. ‘얼마예요’를 먼저 말하는 연습이 수입을 바꾸는 첫 단계야.",
        wealth:"한 분야를 정해서 최소 1년은 단가를 쌓아. 옮겨 다니는 것보다 한 곳에서 몸값 올리는 게 빨라.",
        officer:"책임이 늘 때마다 보상 얘기를 같이 꺼내. ‘이 일을 맡으면 이 조건도 같이’가 네 협상 공식이야.",
        print:"준비한 것 중 하나를 이번 달 안에 돈 받는 일로 바꿔봐. 완벽하지 않아도 첫 수입이 생기면 흐름이 바뀌어.",
      },
      side:{
        self:"혼자 다 하지 말고 한 가지는 맡기거나 같이 해. 규모를 키우는 건 네 힘보다 나누는 힘이야.",
        output:"만든 것 중 하나에 가격을 붙여서 올려. 반응은 ‘좋아요’가 아니라 결제로 확인해.",
        wealth:"벌인 것 중 반응이 제일 좋은 하나만 남기고 나머지는 멈춰. 하나가 돈이 되면 그때 다음으로 넘어가.",
        officer:"본업이 덜 바쁜 요일 하나를 부업 전용으로 정해. 정해진 틀이 있어야 움직이는 사주야.",
        print:"공부는 여기까지만 하고 이번 주에 하나를 실제로 팔아봐. 배움은 팔면서 채워도 늦지 않아.",
      },
      flow:{
        self:"돈 관리를 남에게 맡기거나 같이 묶지 말고, 네가 직접 보는 통장 하나로 모아.",
        output:"결과물이 쌓이는 수입원을 하나 만들어. 월급 말고 네 이름으로 들어오는 돈이 흐름을 키워.",
        wealth:"들어오는 문은 그대로 두고 나가는 문을 줄여. 흐름 좋을 때 자동이체로 묶어두는 게 핵심이야.",
        officer:"경력·자격·직함처럼 ‘신용’을 쌓는 데 돈과 시간을 써. 자리가 올라가면 돈이 따라오는 사주야.",
        print:"자격증·계약서처럼 문서로 남는 일을 늘려. 인정이 문서로 남을 때 돈이 붙는 사주야.",
      },
    },
    career:{
      exam:{
        self:"막힌 과목만큼은 남이 검증한 방법으로 바꿔봐. 네 방식은 나머지 과목에서 지키면 돼.",
        output:"새 개념 대신 같은 유형을 여러 번 반복하는 날을 따로 정해. 지루한 반복이 점수를 올려.",
        wealth:"기본서 한 권을 처음부터 다시 훑어서 빈 구멍부터 메워. 효율은 그다음이야.",
        officer:"실전처럼 시간 재고 푸는 연습을 매주 해. 긴장은 익숙해질수록 줄어.",
        print:"정리는 멈추고 문제 풀이 비중을 늘려. 아는 것보다 푸는 것이 점수가 돼.",
      },
      jobsearch:{
        self:"아는 사람·선배 한 명한테 먼저 연락해봐. 정보와 추천은 혼자 준비할 때보다 훨씬 빨리 들어와.",
        output:"기준에 70%만 맞아도 지원해. 면접에서 직접 보여줄 때 더 강한 사주야.",
        wealth:"지원할 곳을 줄이고, 한 곳당 준비를 두 배로 해. 조건보다 합격 확률을 먼저 봐.",
        officer:"‘준비 완료’ 기준을 낮춰. 이번 주에 한 곳은 무조건 지원하는 걸 규칙으로 정해.",
        print:"보완은 멈추고 모의면접·실제 지원으로 반응부터 받아. 부족한 건 그 반응이 알려줘.",
      },
      move:{
        self:"옮길 곳에서 ‘내가 결정할 수 있는 범위’가 실제로 넓은지부터 확인해. 그게 아니면 옮겨도 똑같아.",
        output:"지금 자리에서 한 번은 의견을 제대로 말해보고, 그래도 막히면 그때 옮겨.",
        wealth:"지금 조건과 옮길 조건을 숫자로 나란히 적어. 감정 말고 숫자가 이기면 옮겨.",
        officer:"책임 범위를 한 번 정리해서 말해보고, 그래도 안 바뀌면 떠날 준비를 해. 버티는 게 답은 아니야.",
        print:"옮길 곳에서 배울 게 있는지를 제일 먼저 확인해. 너한텐 성장이 연봉보다 오래 가.",
      },
      current:{
        self:"혼자 끝낸 일을 짧게라도 보고해. ‘이건 제가 했습니다’가 인정의 시작이야.",
        output:"네가 잘한 포인트를 상대 기준의 말로 바꿔서 전해. 같은 성과도 설명이 달라지면 평가가 달라져.",
        wealth:"성과를 먼저 쌓고 보상 얘기는 그다음에 꺼내. 순서만 바꿔도 인정받는 느낌이 달라져.",
        officer:"이번 달 안에 원하는 것 하나를 문장으로 요청해. 말 안 하면 아무도 몰라.",
        print:"80%만 됐을 때 먼저 보여줘. 다듬는 시간보다 보여주는 타이밍이 인정을 만들어.",
      },
    },
    love:{
      crush:{
        self:"작은 제안 하나를 먼저 해봐. 밥 한 번, 산책 한 번 정도면 자존심 안 상하고 반응을 볼 수 있어.",
        output:"마음 표현 속도를 한 박자 늦춰. 상대가 한 번 다가오면 그만큼만 다가가는 게 네 페이스야.",
        wealth:"잘해주는 걸 조금 줄이고, 대신 둘만의 시간을 만들어. 설렘은 챙겨줄 때보다 같이 있을 때 생겨.",
        officer:"‘확실해지면’ 말고 ‘궁금하면’ 표현해. 네 마음을 모르면 상대도 못 다가와.",
        print:"해석하지 말고 직접 물어봐. 질문 하나가 몇 주의 추측보다 정확해.",
      },
      relationship:{
        self:"이번 싸움에서 이길지 말고 ‘우리 규칙’ 하나를 같이 정해. 이기는 것보다 맞추는 게 오래가.",
        output:"상대 표현 방식을 한 번 물어봐. 너처럼 말로 표현하는 사람이 아닐 수 있어.",
        wealth:"주는 만큼 받으려는 계산을 잠깐 멈추고, 필요한 걸 직접 말해. 계산보다 요청이 빨라.",
        officer:"서운한 건 그날 안에 한 문장으로 말해. 쌓아두면 작은 일도 크게 터져.",
        print:"네가 원하는 걸 하나만 분명히 말해. 상대가 알아서 알아주길 기다리지 마.",
      },
      breakup:{
        self:"그 사람에게 못 한 말을 편지로 써봐. 보내지 않아도 돼. 말을 끝내야 마음이 닫혀.",
        output:"믿을 만한 사람에게 한 번 다 털어놔. 말로 풀면 정리가 훨씬 빨라.",
        wealth:"쓴 시간과 마음을 ‘손해’가 아니라 ‘배운 것’으로 바꿔 적어봐. 아까움이 줄어야 놓아져.",
        officer:"헤어진 이유를 내 몫과 상대 몫으로 나눠 적어. 다 네 탓이 아니라는 걸 확인해야 해.",
        print:"좋았던 기억만 말고 힘들었던 장면도 같이 적어. 기억을 균형 있게 봐야 재회든 정리든 판단이 서.",
      },
      new:{
        self:"한 달에 한 번은 새로운 모임에 나가는 걸 규칙으로 정해. 기회가 와야 인연도 와.",
        output:"첫 만남에서 판단하지 말고 몇 번은 더 만나봐. 천천히 좋아지는 사람이 잘 맞는 사주야.",
        wealth:"조건은 나중에 보고 대화가 편한지부터 봐. 계산은 몇 번 만나본 뒤에 해도 늦지 않아.",
        officer:"기준을 하나만 남기고 나머지는 내려놔. 확신은 만나면서 생기는 거야.",
        print:"새 사람을 만나기 전에 나를 먼저 채워. 에너지가 있어야 인연도 받아들일 수 있어.",
      },
    },
    path:{
      lost:{
        self:"추천은 참고만 하고, 관심 가는 것 세 개를 직접 하루씩 해봐. 네 기준은 해봐야 생겨.",
        output:"하고 싶은 것 중 ‘돈 받고도 할 수 있는 것’ 하나만 골라서 좁혀.",
        wealth:"돈이 되는지는 나중에 보고, 해보고 싶은 것 하나를 먼저 작게 시작해.",
        officer:"‘정답’ 말고 ‘시험 삼아’ 해볼 것 하나를 골라. 실패해도 괜찮은 크기로 시작해.",
        print:"정보 찾기는 멈추고 2시간짜리 체험 하나를 이번 주에 해봐.",
      },
      current:{
        self:"지금 길에서 네가 결정할 수 있는 부분을 하나라도 늘려봐. 그게 늘면 흔들림이 줄어.",
        output:"지금 일 안에서 네 아이디어를 쓸 작은 프로젝트 하나를 만들어봐.",
        wealth:"지금 길에서 1년 뒤 받을 수 있는 보상을 숫자로 적어봐. 숫자가 보이면 판단이 쉬워.",
        officer:"남 기준 말고 네 기준 세 가지를 적고 지금 길을 채점해봐.",
        print:"지금 길에서 아직 배울 게 뭐가 남았는지 적어봐. 남은 게 있으면 계속 가도 돼.",
      },
      switch:{
        self:"새 분야에서 내 자리를 만들 수 있는지부터 작게 확인해봐. 사이드 프로젝트가 제일 안전해.",
        output:"새 분야에서 결과물 하나를 먼저 만들어봐. 그게 이직보다 강한 증명이야.",
        wealth:"옮길 분야의 실제 수입·기간을 숫자로 확인하고, 6개월 버틸 돈을 먼저 모아.",
        officer:"분야가 문제인지 조직이 문제인지 먼저 나눠. 조직 문제면 분야는 안 바꿔도 돼.",
        print:"새 분야 수업이나 체험부터 해봐. 배우는 게 재밌으면 그때 옮겨도 늦지 않아.",
      },
      strength:{
        self:"혼자 끝까지 맡을 수 있는 일을 골라. 팀 안에서도 ‘내 담당’이 분명한 자리가 맞아.",
        output:"만든 걸 보여줄 수 있는 곳에 써. 포트폴리오·SNS·발표처럼 드러나는 자리가 맞아.",
        wealth:"숫자·거래·기획처럼 현실 결과가 바로 보이는 일에 강점을 써.",
        officer:"믿고 맡기는 역할, 관리·운영·책임자 자리에서 강점이 제일 크게 보여.",
        print:"깊이 파고들어야 하는 일, 연구·분석·전문 분야에서 강점을 써.",
      },
    },
    people:{
      friend:{
        self:"비교하는 친구와는 만나는 횟수를 줄이고, 대등하게 편한 친구에게 시간을 더 써.",
        output:"불편한 건 가볍게라도 한 번 말해봐. 말해도 괜찮은 관계인지 그때 보여.",
        wealth:"먼저 쓰는 걸 한 번 멈춰봐. 상대가 채우는지 보면 관계가 보여.",
        officer:"약속을 가볍게 어기는 친구에게는 기대치를 낮춰. 네 기준을 모두에게 적용하면 네가 지쳐.",
        print:"이해해주는 역할을 잠깐 쉬어. 이번엔 네 얘기를 먼저 꺼내봐.",
      },
      work:{
        self:"간섭이 싫은 부분은 ‘이 부분은 제가 맡겠습니다’로 선을 그어. 범위를 먼저 가져오면 간섭이 줄어.",
        output:"말하기 전에 한 번 쉬고, 결론부터 부드럽게 말해. 내용은 그대로 두고 말투만 바꿔도 부딪힘이 줄어.",
        wealth:"누가 뭘 했는지 기록을 남겨. 공이 흐려지는 걸 막는 건 기록이야.",
        officer:"이번 주에 한 번은 ‘지금은 어렵습니다’라고 말해봐. 거절해도 관계는 안 깨져.",
        print:"들은 말은 그날 메모로 적고 닫아. 머릿속에서 곱씹는 시간을 줄여야 해.",
      },
      family:{
        self:"내 선택을 설명하되 허락을 구하지는 마. ‘이렇게 하기로 했어’로 말하는 연습이 필요해.",
        output:"싸움이 커지기 전에 자리를 먼저 떠. 감정이 식은 뒤에 말하면 같은 말도 덜 세게 들려.",
        wealth:"돈 문제는 말로만 하지 말고 금액·기간을 정해서 합의해. 애매하면 계속 싸워.",
        officer:"네가 다 챙겨야 한다는 생각을 내려놔. 한 가지는 다른 가족에게 넘겨봐.",
        print:"서운한 건 한 번은 말해도 돼. 말하는 게 불효가 아니라 관계를 지키는 거야.",
      },
      distance:{
        self:"먼저 끊는 게 아니라 ‘연락 빈도만 줄이는 것’부터 해봐. 이기고 지는 문제로 보지 마.",
        output:"할 말을 한 번 정리해서 전하고, 반응을 보고 결정해.",
        wealth:"앞으로 이 관계에 더 쓸 시간과 마음을 기준으로 봐. 지난 건 이미 쓴 거야.",
        officer:"관계를 유지하는 것도 선택이라는 걸 기억해. 도리보다 네 마음이 편한지가 먼저야.",
        print:"상대 사정 말고 네 감정만 한 번 적어봐. 그게 답이야.",
      },
    },
    mental:{
      burnout:{
        self:"이번 주 안에 한 가지는 누군가에게 맡겨. 도움 요청이 회복의 시작이야.",
        output:"말하고 챙기는 일을 잠깐 줄이고, 혼자 채우는 시간을 먼저 잡아.",
        wealth:"해야 할 일 목록에서 이번 주 안 해도 되는 걸 세 개 지워.",
        officer:"‘안 해도 큰일 안 나는 일’ 하나를 실제로 안 해봐. 생각보다 아무 일도 안 일어나.",
        print:"자기 전 30분은 화면을 끄고 몸만 쉬어. 머리를 끄는 시간이 있어야 회복돼.",
      },
      overthink:{
        self:"혼자 결론 내지 말고 믿을 만한 사람 한 명에게 물어봐. 남의 한마디가 생각을 끊어줘.",
        output:"생각을 종이에 다 써. 쓰는 순간 머리 밖으로 빠져.",
        wealth:"경우의 수를 세 개까지만 적고 그중 하나를 고르는 연습을 해.",
        officer:"‘틀려도 되는 결정’ 하나를 빨리 내려봐. 완벽한 확인보다 작은 결정이 생각을 멈춰.",
        print:"생각할 시간을 하루 20분으로 정해두고, 그 밖의 시간엔 몸을 움직여.",
      },
      low:{
        self:"혼자 버티지 말고 가까운 사람에게 ‘요즘 힘들다’고 한 번 말해봐.",
        output:"아주 작은 것 하나를 만들어봐. 요리든 글이든, 뭔가를 만들면 에너지가 다시 돌아.",
        wealth:"작게라도 결과가 보이는 일을 해. 방 정리처럼 끝이 보이는 일이 좋아.",
        officer:"해야 할 일 말고 하고 싶은 일 하나를 오늘 일정에 넣어.",
        print:"푹 자고, 먹고, 햇빛 보는 것부터. 충전이 먼저야.",
      },
      recover:{
        self:"사람한테서 힘을 받는 시간도 회복이야. 편한 사람 한 명과 약속을 잡아.",
        output:"산책·운동·만들기처럼 몸을 쓰면서 쉬어. 움직이면서 회복되는 사주야.",
        wealth:"잠·식사 시간을 고정해. 리듬이 잡히면 몸이 따라와.",
        officer:"쉬는 계획을 느슨하게 세워. 못 지켜도 괜찮은 쉬는 계획이 너한텐 맞아.",
        print:"충전 시간을 일정에 먼저 넣어. 남들보다 회복 시간이 더 필요한 사주야.",
      },
    },
  };
  // 사주에 필요한 기운(보완할 그룹)을 고민 영역의 말로 옮긴 문장.
  const NEED_LINE={
    money:{print:"돈 공부나 믿을 만한 조언자처럼 ‘받쳐주는 쪽’을 곁에 두면 돈이 덜 새.",self:"내 돈 기준을 스스로 세우고 지키는 힘을 키우면 돈이 남아.",output:"네 재능이나 결과물을 돈으로 바꾸는 통로를 하나 만들면 돈이 돌아.",wealth:"수입·지출을 숫자로 보는 습관 하나가 네 돈을 지켜줘.",officer:"통장·예산처럼 정해진 틀을 두면 돈이 흩어지지 않아."},
    career:{print:"배우고 자격을 쌓을수록 일이 풀리는 사주야. 멘토나 공부가 네 편이야.",self:"내 영역과 권한을 분명히 할수록 일이 편해져.",output:"결과물을 만들어 보여줄수록 평가가 따라와.",wealth:"성과를 숫자로 남길수록 인정과 보상이 붙어.",officer:"역할과 기준이 분명한 곳에서 제일 안정적이야."},
    love:{print:"마음을 편하게 해주고 챙겨주는 사람이 너한테 힘이 돼.",self:"내 속도와 선을 지켜주는 사람이 너한테 힘이 돼.",output:"마음을 말로 편하게 꺼내게 해주는 사람이 너한테 힘이 돼.",wealth:"말보다 행동으로 꾸준히 보여주는 사람이 너한테 힘이 돼.",officer:"약속을 지키고 책임감 있는 사람이 너한테 힘이 돼."},
    path:{print:"배우고 자격을 쌓는 길이 너를 제일 멀리 데려가.",self:"내가 주도할 수 있는 길이 너를 제일 멀리 데려가.",output:"만들고 표현하는 길이 너를 제일 멀리 데려가.",wealth:"현실 결과가 바로 보이는 길이 너를 제일 멀리 데려가.",officer:"체계와 기준이 분명한 길이 너를 제일 멀리 데려가."},
    people:{print:"배울 게 있고 챙겨주는 사람을 곁에 두면 관계가 편해져.",self:"대등하게 편한 친구를 곁에 두면 관계가 편해져.",output:"같이 웃고 떠들 수 있는 사람을 곁에 두면 관계가 편해져.",wealth:"현실적으로 도움을 주고받는 사람을 곁에 두면 관계가 편해져.",officer:"약속을 지키고 선이 분명한 사람을 곁에 두면 관계가 편해져."},
    mental:{print:"푹 쉬고 배우며 채우는 시간이 회복의 핵심이야.",self:"내 편이 되어주는 사람과 있는 시간이 회복의 핵심이야.",output:"몸을 움직이고 뭔가를 만드는 게 회복의 핵심이야.",wealth:"생활 리듬을 규칙적으로 잡는 게 회복의 핵심이야.",officer:"정해진 루틴이 오히려 너를 쉬게 해."},
  };
  const ELEMENT_TIPS={
    hwa:"햇빛 드는 곳, 빨강·주황 같은 밝은 색, 낮 시간 활동, 사람 많은 따뜻한 자리",
    su:"물가 산책, 검정·남색, 밤에 조용히 정리하는 시간, 혼자 생각하는 공간",
    mok:"공원·숲 산책, 초록색, 아침 시간, 새로 배우고 시작하는 일",
    geum:"정리정돈, 흰색·금색, 저녁 시간, 규칙적인 운동",
    to:"등산·흙 밟기, 노랑·갈색, 매일 같은 시간의 루틴, 한곳에 오래 머무는 안정감",
  };
  const ELEMENT_WHEN={
    hwa:"낮에, 밝은 곳에서",su:"밤에 조용한 곳에서",mok:"아침에 시작해서",geum:"저녁에 하루를 정리하면서",to:"매일 같은 시간에",
  };

  const MONEY_STYLE={
    craft:"재능이나 결과물을 돈으로 바꾸는 방식이 맞아. 기술·콘텐츠·프리랜스처럼 네가 만든 게 쌓일수록 돈이 커져.",
    steady:"월급·고정수입·적금처럼 꾸준히 쌓는 방식이 맞아. 한 방보다 매달 들어오는 돈이 네 돈을 키워.",
    trade:"사람을 만나고 거래하면서 버는 방식이 맞아. 영업·유통·중개처럼 판이 넓을수록 기회가 와. 대신 회수 기준은 꼭 정해.",
    position:"조직·직함 안에서 안정적으로 받는 방식이 맞아. 자리가 올라갈수록 돈도 따라오는 사주야.",
    skill:"돈을 직접 쫓기보다 실력·자격·평판을 먼저 쌓아서 돈이 따라오게 하는 방식이 맞아.",
  };
  const MONEY_POSITION={
    year:"집안·윗사람 쪽과 돈 인연이 있어서, 어른이나 선배를 통해 들어오는 기회를 가볍게 넘기지 마.",
    month:"일·직장에서 버는 돈이 중심이야. 본업을 키우는 게 돈을 키우는 가장 빠른 길이야.",
    day:"내 살림·배우자 자리에 돈이 있어서, 혼자보다 가정·파트너와 함께 모을 때 돈이 불어.",
    hour:"시간이 갈수록 커지는 돈이야. 부업·저축·투자처럼 나중을 위해 심어둔 돈이 크게 돌아와.",
  };
  const CAREER_FIT={
    정관:"역할과 평가 기준이 분명한 조직이 맞아. 공공기관·대기업·관리직처럼 체계가 있는 곳에서 인정이 제일 빨리 붙어.",
    편관:"난이도 높고 책임 큰 자리가 맞아. 현장 지휘·위기 대응·경쟁이 센 곳에서 오히려 실력이 드러나.",
    정인:"배우고 가르치는 환경이 맞아. 교육·연구·자격 기반 직무처럼 전문성이 인정받는 곳이야.",
    편인:"혼자 깊게 파는 일이 맞아. 기획·분석·IT·특수 분야처럼 남들과 다른 시각이 무기가 되는 곳이야.",
    식신:"손으로 만들고 꾸준히 쌓는 일이 맞아. 기술·요리·디자인·서비스처럼 결과물이 남는 곳이야.",
    상관:"말과 아이디어로 움직이는 일이 맞아. 영업·마케팅·강의·창작처럼 표현이 성과가 되는 곳이야.",
    정재:"꼼꼼하게 관리하는 일이 맞아. 재무·회계·운영·실무 관리처럼 정확성이 인정받는 곳이야.",
    편재:"사람과 기회를 다루는 일이 맞아. 사업·영업·유통·투자처럼 판이 넓은 곳이야.",
    비견:"내 영역이 확실한 일이 맞아. 전문직·프리랜서·1인 사업처럼 스스로 결정하는 곳이야.",
    겁재:"경쟁과 협업이 같이 있는 일이 맞아. 영업팀·스타트업·스포츠처럼 에너지가 오가는 곳이야.",
  };
  const PATH_FIT={
    정관:"공무원·공기업·법·행정처럼 기준과 신뢰가 중요한 분야",
    편관:"경찰·군·의료·스포츠·컨설팅처럼 긴장감 있는 분야",
    정인:"교육·상담·연구·출판처럼 지식을 다루는 분야",
    편인:"IT·데이터·심리·예술·기획처럼 독특한 시각이 필요한 분야",
    식신:"요리·디자인·제조·콘텐츠처럼 손으로 만드는 분야",
    상관:"방송·마케팅·강연·예술처럼 표현하는 분야",
    정재:"금융·회계·유통 관리처럼 안정적인 실무 분야",
    편재:"사업·무역·세일즈·부동산처럼 돈이 도는 분야",
    비견:"전문직·자영업·코칭처럼 내 이름으로 하는 분야",
    겁재:"영업·스포츠·스타트업처럼 경쟁이 있는 분야",
  };
  const PARTNER_FIT={
    정재:"성실하고 생활력 있는 사람이야. 화려하진 않아도 약속 지키고 살림 챙기는 사람과 오래 가.",
    편재:"활동적이고 통 큰 사람이야. 같이 놀러 다니고 새로운 걸 해보는 사람과 잘 맞아.",
    정관:"반듯하고 책임감 있는 사람이야. 믿음을 주는 사람 옆에서 마음이 제일 편해.",
    편관:"카리스마 있고 강한 사람에게 끌려. 다만 너를 존중해주는 사람인지는 꼭 확인해.",
    정인:"따뜻하게 챙겨주고 이해해주는 사람이야. 기대도 괜찮은 사람이 맞아.",
    편인:"독특하고 생각이 깊은 사람이야. 대화가 깊게 통하는 사람에게 끌려.",
    식신:"편하고 잘 웃는 사람이야. 같이 맛있는 거 먹는 게 행복한 사람이 맞아.",
    상관:"말이 잘 통하고 재밌는 사람이야. 티키타카가 되는 사람에게 끌려.",
    비견:"친구 같은 대등한 사람이야. 서로 간섭하지 않는 관계가 편해.",
    겁재:"에너지 넘치고 승부욕 있는 사람이야. 같이 목표를 향해 가는 사람이 맞아.",
  };
  const RECOVER_FIT={
    hwa:"햇빛 보고 사람 만나고 몸을 데우는 회복이 맞아. 낮에 밖으로 나가는 것만으로 달라져.",
    su:"물 가까이, 조용한 밤, 혼자 정리하는 회복이 맞아. 반신욕이나 물가 산책이 특히 좋아.",
    mok:"걷고 배우고 새로 시작하는 회복이 맞아. 아침 산책이나 식물 키우기가 잘 맞아.",
    geum:"정리하고 비워내는 회복이 맞아. 방 정리, 규칙적인 운동이 머리를 가볍게 해.",
    to:"규칙적인 루틴과 든든한 식사가 회복의 바탕이야. 같은 시간에 자고 먹는 것부터 잡아.",
  };
  const CAUTION_TITLE={money:"돈에서 조심할 사람·상황",career:"일에서 조심할 사람·상황",love:"연애에서 조심할 사람·상황",path:"진로에서 조심할 선택",people:"조심할 사람",mental:"더 지치게 하는 것"};
  const CAUTION={
    money:{
      self:"‘같이 하자’는 돈 얘기를 조심해. 동업·계·돈 빌려주기처럼 사람과 돈이 섞이는 게 네 사주에서 제일 크게 새는 길이야.",
      output:"‘이건 꼭 사야 해’ 싶은 순간을 조심해. 기분이 들뜬 날의 결제가 제일 위험해.",
      wealth:"‘확실한 기회’라는 말을 조심해. 한꺼번에 크게 거는 투자는 네 사주에서 회수가 제일 어려워.",
      officer:"체면 때문에 쓰는 돈을 조심해. 보증·대신 내주기·무리한 선물처럼 책임감으로 나가는 돈이 제일 커.",
      print:"‘이거 하면 달라질 거야’ 하는 자기계발 결제를 조심해. 강의·장비만 사고 안 쓰는 돈이 쌓여.",
    },
    career:{
      self:"내 방식만 고집하다 윗사람과 부딪히는 순간을 조심해. 옳아도 혼자 싸우면 손해가 커.",
      output:"회의에서 참다가 한 번에 세게 말하는 순간을 조심해. 내용은 맞아도 말투로 평가가 깎여.",
      wealth:"조건만 보고 옮기는 선택을 조심해. 연봉은 올라도 일이 안 맞으면 1년 안에 또 흔들려.",
      officer:"‘이것도 해줄 수 있지?’가 반복되는 자리를 조심해. 책임만 늘고 권한은 없는 일이 제일 위험해.",
      print:"준비만 하다 기회를 넘기는 순간을 조심해. ‘다음에’가 반복되면 그때가 움직일 때야.",
    },
    love:{
      self:"‘누가 먼저 연락하나’ 자존심 싸움을 조심해. 이기면 관계가 식어.",
      output:"감정이 올라왔을 때 바로 보내는 메시지를 조심해. 한 시간만 두고 보내.",
      wealth:"주는 만큼 안 돌아온다고 계산이 시작되는 순간을 조심해. 그때가 서운함이 터지기 직전이야.",
      officer:"통제하거나 다그치는 사람을 조심해. 책임감 강한 너는 이런 사람한테 끌려가기 쉬워.",
      print:"상대 마음을 혼자 해석하다 결론 내리는 걸 조심해. 추측으로 끝낸 관계가 제일 아쉬워.",
    },
    path:{
      self:"남 조언을 다 무시하고 혼자 결정하는 걸 조심해. 방향은 네가 정해도 정보는 들어야 해.",
      output:"관심 가는 걸 다 동시에 시작하는 걸 조심해. 하나도 끝까지 못 가면 확신이 더 흐려져.",
      wealth:"돈만 보고 고르는 길을 조심해. 재미가 없으면 오래 못 가는 사주야.",
      officer:"‘남들 보기 좋은 길’을 고르는 걸 조심해. 남 기준으로 고른 길은 결국 다시 흔들려.",
      print:"준비만 끝없이 하는 걸 조심해. 자격증 하나 더가 답이 아닐 때가 많아.",
    },
    people:{
      self:"너를 계속 비교하거나 이기려는 사람을 조심해. 옆에 있으면 네 에너지가 경쟁에 다 빠져.",
      output:"네 말을 막거나 무시하는 사람을 조심해. 할 말을 못 하는 관계에서 제일 빨리 지쳐.",
      wealth:"받기만 하고 돌려주지 않는 사람을 조심해. 먼저 주는 너만 계속 비어가.",
      officer:"일방적으로 규칙과 도리를 요구하는 사람을 조심해. 책임감 강한 너는 거절을 못 하고 끌려가.",
      print:"너를 불안하게 만들고 생각을 복잡하게 하는 사람을 조심해. 만나고 나면 며칠씩 곱씹게 돼.",
    },
    mental:{
      self:"도움 없이 혼자 끝까지 버티는 습관을 조심해. 괜찮은 척이 제일 크게 지치게 해.",
      output:"하고 싶은 말을 삼키는 날이 이어지는 걸 조심해. 속에 쌓이면 몸이 먼저 신호를 보내.",
      wealth:"일정·돈 걱정이 한꺼번에 몰리는 주간을 조심해. 그 주엔 다른 약속을 비워둬.",
      officer:"쉬는 날에도 일 연락을 받는 걸 조심해. 쉬는 시간에 책임이 끼어들면 회복이 안 돼.",
      print:"밤늦게까지 이어지는 생각과 휴대폰을 조심해. 밤 생각은 대부분 아침엔 작아져.",
    },
  };
  const CAUTION_CHECK={
    money:"이 신호가 보이면 결제나 송금은 하루만 미뤄.",
    career:"이 신호가 보이면 바로 대답하지 말고 ‘확인해보고 말씀드릴게요’로 시간을 벌어.",
    love:"이 신호가 보이면 그날은 결론 내지 말고 하루 자고 다시 봐.",
    path:"이 신호가 보이면 결정 전에 믿을 만한 사람 한 명에게 먼저 말해봐.",
    people:"이런 사람과는 만나는 횟수부터 조용히 줄여도 괜찮아.",
    mental:"이 신호가 보이면 그날 할 일 하나를 과감히 빼.",
  };
  const YEAR_GOD_SCENE={
    정인:"도와주는 사람·배움·계약서나 자격증 같은 문서가 들어오는 해",
    편인:"생각이 깊어지고 새로운 공부나 특이한 기회가 오는 해",
    정관:"책임·자리·평가가 커지는 해",
    편관:"부담과 도전이 같이 오는 해",
    정재:"돈과 생활이 안정되는 쪽으로 움직이는 해",
    편재:"기회와 돈이 크게 움직이는 해",
    식신:"하고 싶은 걸 만들고 즐기는 해",
    상관:"말과 표현이 늘고 변화를 만들고 싶어지는 해",
    비견:"내 힘으로 서려는 마음이 커지는 해",
    겁재:"경쟁과 사람 문제가 늘어나는 해",
  };
  const CONCERN_YEAR={
    money:{print:"돈에서는 문서·계약·자격이 수입으로 이어지기 쉬워",self:"돈에서는 사람 따라 나가는 지출이 늘기 쉬워서 기준이 중요해",output:"돈에서는 만든 걸 팔아볼 기회가 늘어",wealth:"돈에서는 크게 들어오고 크게 나가기 쉬워서 관리가 핵심이야",officer:"돈에서는 책임이 커지는 만큼 보상 조건을 꼭 챙겨야 해"},
    career:{print:"일에서는 배우고 자격을 따기 좋은 흐름이야",self:"일에서는 내 방식대로 해보고 싶은 마음이 커져",output:"일에서는 결과물을 보여주고 인정받기 좋아",wealth:"일에서는 성과가 숫자로 드러나기 쉬워",officer:"일에서는 자리와 책임이 커지는 흐름이야"},
    love:{print:"연애에서는 챙겨주는 사람이 들어오기 쉬워",self:"연애에서는 내 페이스를 지키고 싶어지는 흐름이야",output:"연애에서는 마음을 표현하기가 쉬워져",wealth:"연애에서는 만남의 기회가 늘어나",officer:"연애에서는 관계가 진지해지고 약속이 생기기 쉬워"},
    path:{print:"진로에서는 공부·자격으로 방향을 잡기 좋아",self:"진로에서는 내 길을 스스로 정하고 싶어져",output:"진로에서는 해보고 싶은 걸 직접 시도하기 좋아",wealth:"진로에서는 현실적인 선택지가 눈에 들어와",officer:"진로에서는 정해진 길에서 자리를 잡기 좋아"},
    people:{print:"관계에서는 도와주는 어른·선배가 생기기 쉬워",self:"관계에서는 친구·동료와 부딪히거나 뭉치는 일이 많아져",output:"관계에서는 말로 풀면 풀리는 일이 많아",wealth:"관계에서는 사람과 돈이 얽히기 쉬워서 선이 중요해",officer:"관계에서는 윗사람과의 관계가 중요해져"},
    mental:{print:"마음은 쉬고 배우며 회복하기 좋은 흐름이야",self:"마음은 혼자 버티려는 쪽으로 가기 쉬워서 도움을 청하는 게 중요해",output:"마음은 밖으로 풀어낼수록 가벼워져",wealth:"마음은 챙길 게 많아져 바빠지기 쉬워서 리듬 관리가 중요해",officer:"마음은 책임이 커지는 만큼 쉬는 시간을 지켜야 해"},
  };
  const REL_PLAIN={clash:"정면으로 부딪히는 충 관계",wonjin:"이유 없이 서운함이 쌓이는 원진 관계",punishment:"서로 상처를 주고받기 쉬운 형 관계",harm:"은근히 서로 발목을 잡는 해 관계",break:"살짝 어긋나는 파 관계"};
  const REL_EFFECT={
    clash:"두 쪽을 동시에 다 챙기려 하면 한쪽이 크게 흔들려. 둘 중 무엇이 먼저인지 정해두는 게 좋아.",
    wonjin:"가까울수록 사소한 말에 서운함이 쌓여. 서운한 건 작을 때 바로 풀어야 해.",
    punishment:"좋을 땐 좋다가도 한번 틀어지면 말이 날카로워져. 감정이 올라온 날엔 결론을 미뤄.",
    harm:"대놓고 싸우진 않는데 은근히 서로 일을 꼬이게 해. 역할을 미리 나눠두면 덜 부딪혀.",
    break:"크게 싸우진 않는데 약속이나 계획이 자꾸 살짝씩 어긋나. 중요한 건 말로 한 번 더 확인해.",
  };
  const POS_AREA={year:"집안·윗사람 자리",month:"일·사회 자리",day:"내 살림·배우자 자리",hour:"나중·아랫사람 자리"};
  const CONCERN_WORD={money:"돈 문제",career:"일",love:"연애",path:"진로",people:"사람 관계",mental:"마음 문제"};
  const POS_PERSON={year:"집안 어른·윗사람",month:"부모님·직장",day:"너 자신과 배우자",hour:"자녀·후배·아랫사람"};
  const SINSAL_TIE={
    money:{역마:"그리고 역마가 있어서, 한 곳에 묶인 돈보다 이동·거래·출장에서 돈이 들어오는 편이야.",천을귀인:"그리고 천을귀인이 있어서, 돈이 막힐 때 사람을 통해 길이 열리는 편이야.",도화:"그리고 도화가 있어서, 사람 상대하는 일에서 돈이 붙기 쉬워.",화개:"그리고 화개가 있어서, 남들 안 하는 전문 분야에서 돈이 되는 편이야."},
    career:{역마:"그리고 역마가 있어서, 한자리에 오래 묶인 일보다 이동·출장·변화가 있는 일에서 풀려.",문창귀인:"그리고 문창귀인이 있어서, 시험·문서·보고서처럼 글로 평가받는 자리에서 강해.",천을귀인:"그리고 천을귀인이 있어서, 막힐 때 선배나 윗사람이 길을 열어주는 편이야.",괴강:"그리고 괴강이 있어서, 남 밑보다 앞에서 이끄는 자리에서 더 크게 쓰여."},
    love:{도화:"그리고 도화가 있어서, 네가 모르는 사이에 너한테 마음 있는 사람이 꽤 있어.",홍염:"그리고 홍염이 있어서, 첫인상보다 알아갈수록 끌리는 사람이라는 말을 들어.",화개:"그리고 화개가 있어서, 연애에서도 혼자만의 시간이 보장돼야 오래 가.",역마:"그리고 역마가 있어서, 여행지·새로운 장소·먼 곳에서 인연이 닿기 쉬워."},
    path:{역마:"그리고 역마가 있어서, 한곳에 머무는 길보다 이동·해외·변화가 있는 길이 맞아.",화개:"그리고 화개가 있어서, 예술·연구·종교처럼 깊이 파는 길에 적성이 있어.",문창귀인:"그리고 문창귀인이 있어서, 글·교육·기획처럼 머리를 쓰는 길에서 빛나.",도화:"그리고 도화가 있어서, 사람 앞에 서는 길에서 강점이 커져."},
    people:{천을귀인:"그리고 천을귀인이 있어서, 힘들 때 결국 손 내밀어주는 사람이 나타나.",도화:"그리고 도화가 있어서, 사람이 먼저 다가오는 만큼 선을 정하는 게 중요해.",화개:"그리고 화개가 있어서, 넓은 관계보다 깊은 소수의 관계가 더 편해."},
    mental:{화개:"그리고 화개가 있어서, 혼자 있는 시간이 사치가 아니라 약이야.",역마:"그리고 역마가 있어서, 한곳에 갇혀 있으면 더 지쳐. 짧은 이동이 회복이 돼.",천을귀인:"그리고 천을귀인이 있어서, 힘들다고 말하면 생각보다 도와줄 사람이 있어."},
  };
  const SINSAL_CAUTION={
    백호:"백호가 있어서 일이 한번 터지면 크게 터지는 편이야. 급하게 몰아붙일 때 다툼·사고를 특히 조심해.",
    양인:"양인이 있어서 한번 붙으면 절대 안 지려는 편이야. 화가 난 날 내린 결정은 하루 미뤄.",
    괴강:"괴강이 있어서 기가 세고 결단이 빨라. 옳아도 말이 너무 세게 나가면 적이 생겨.",
  };

  function pillarKr(reasoning,pos){
    const p=pillarsOf(reasoning)[pos];
    return p?.gan&&p?.zhi ? (GAN_KR[p.gan]||"")+(ZHI_KR[p.zhi]||"") : "";
  }
  function signalsOf(reasoning){
    const fn=global.__SAJU_SIGNALS_V1__?.compute;
    if(typeof fn!=="function") return null;
    try { return fn(pillarsOf(reasoning)); } catch(_) { return null; }
  }
  function prescriptionElement(reasoning){
    const pr=synthesisFor(reasoning).mechanisms?.adjustment?.prescription||reasoning?.integrated?.prescription||{};
    const seq=(pr.sequence||[]).map(x=>x?.element).filter(el=>EL_KR[el]);
    return seq[0]||(pr.overlapElements||[]).find(el=>EL_KR[el])||null;
  }
  function needGroupOf(reasoning){
    const el=prescriptionElement(reasoning);
    if(el) return groupOfElement(dayElementOf(reasoning),el);
    const g=(reasoning?.integrated?.neededGroups||[]).find(x=>GROUP_NAME[x]);
    return g||"print";
  }
  function topGroupOf(reasoning){
    const top=godRows(reasoning)[0];
    return GROUP_NAME[top?.group] ? top.group : "self";
  }
  function burdenGroupOf(reasoning){
    const st=synthesisFor(reasoning).mechanisms?.structure||{};
    const present=new Set(godRows(reasoning).map(r=>r.god));
    const harm=(st.harmfulGods||[]).find(g=>present.has(g));
    if(harm&&GROUP_NAME[godGroup(harm)]) return godGroup(harm);
    if(verdictOf(reasoning)==="신강") return topGroupOf(reasoning);
    const pressure=synthesisFor(reasoning).mechanisms?.drive?.pressureGroup||reasoning?.integrated?.pressureGroup;
    return GROUP_NAME[pressure] ? pressure : topGroupOf(reasoning);
  }
  function dayBranchGod(reasoning){
    const occ=(reasoning?.context?.godOccurrences||[]).find(o=>o?.pillar==="day"&&o.sourceType==="branch-main");
    return occ?.god||pillarsOf(reasoning).day?.sipsin?.zhi||"";
  }
  function mainPositionOfGroup(reasoning,group){
    const rows=(reasoning?.context?.godOccurrences||[]).filter(o=>o?.group===group&&PILLAR_KR[o.pillar]);
    const byPos={};
    rows.forEach(o=>{ byPos[o.pillar]=(byPos[o.pillar]||0)+Number(o.weight||0); });
    return Object.keys(byPos).sort((a,b)=>byPos[b]-byPos[a])[0]||"";
  }
  function relationRows(reasoning,sig){
    const ctx=reasoning?.context||{};
    const rows=[
      ...(ctx.clashes||[]).map(x=>({...x,type:"clash",rank:0})),
      ...(ctx.punishments||[]).map(x=>({...x,type:"punishment",rank:2})),
      ...(ctx.harms||[]).map(x=>({...x,type:"harm",rank:3})),
      ...(ctx.breaks||[]).map(x=>({...x,type:"break",rank:4})),
      ...((sig?.wonjin?.positions)||[]).map(pos=>({type:"wonjin",aPos:pos,bPos:"day",rank:1})),
    ].filter(x=>PILLAR_KR[x.aPos]&&PILLAR_KR[x.bPos]&&x.aPos!==x.bPos);
    const touches=x=>(x.aPos==="day"||x.bPos==="day")?0:(x.aPos==="month"||x.bPos==="month")?1:2;
    return rows.sort((a,b)=>touches(a)-touches(b)||a.rank-b.rank);
  }
  function relationPair(reasoning,row){
    const a=row.aPos==="day"?row.bPos:row.aPos;
    const b=row.aPos==="day"?"day":row.bPos;
    return {a,b,left:POS_PERSON[a]+" 자리",right:b==="day"?"너 자신·배우자 자리":POS_PERSON[b]+" 자리",refsA:pillarName(reasoning,a),refsB:pillarName(reasoning,b)};
  }
  function relationCore(reasoning,row){
    const x=relationPair(reasoning,row);
    return withJosa(x.left,"과","와")+" "+withJosa(x.right,"이","가")+" "+REL_PLAIN[row.type]+"야";
  }
  function relationSentence(reasoning,row){
    if(!row) return "";
    const x=relationPair(reasoning,row);
    return relationCore(reasoning,row)+". "+withJosa(x.refsA,"과","와")+" "+x.refsB+" 사이에서 보여. "+REL_EFFECT[row.type];
  }
  function relationShort(reasoning,row){
    const x=relationPair(reasoning,row);
    return "그 밖에 "+withJosa(x.refsA,"과","와")+" "+x.refsB+" 사이는 "+REL_PLAIN[row.type]+"야.";
  }
  function sinsalOf(sig,name){ return (sig?.sinsal||[]).find(x=>x.name===name)||null; }
  function sinsalTie(sig,concern){
    const table=SINSAL_TIE[concern]||{};
    const hit=(sig?.sinsal||[]).find(x=>table[x.name]);
    return hit?table[hit.name]:"";
  }
  function sinsalList(sig){
    return (sig?.sinsal||[]).map(x=>withJosa(x.name,"은","는")+" "+x.positions.map(p=>PILLAR_KR[p]).join("·")).join(", ")+"에 있어";
  }
  function lead(isT){ return "<b>결론</b> — "; }
  function whyLabel(isT){ return isT?"<b>근거</b> — ":"<b>왜 그러냐면</b> — "; }

  // 1. 핵심 — 너는 이런 사람
  function noteCoreV6(reasoning,s,sig,isT){
    const top=godRows(reasoning)[0];
    const dm=dayMasterName(reasoning);
    const verdict=verdictOf(reasoning);
    const ilju=sig?.ilju||{};
    const special=(sig?.sinsal||[]).find(x=>x.tone!=="caution");
    const bullets=[
      ilju.scene,
      top?CORE_SCENE[top.god]:"",
      special?special.scene:(STRENGTH_SCENE[verdict]||STRENGTH_SCENE.중화).replace(/^그리고 /,""),
    ].filter(Boolean).map(x=>"· "+x);
    const tag=ilju.tag||headlineOf(reasoning)||"한쪽으로 치우치지 않은 사람";
    const conclusion=(isT?"<b>결론</b> — ":"<b>결론</b> — 언니가 딱 보니까 이거야. ")+"너는 <b>"+withJosa(tag,"이야","야")+"</b>.<br>"+bullets.join("<br>");
    const why=whyLabel(isT)+(sig?.ilju?.name?"네 일주는 "+withJosa(sig.ilju.name.replace(/일주$/,""),"이야","야")+". ":"")+pillarName(reasoning,"day")+"의 윗글자 "+withJosa(dm,"이","가")+" 너 자신이고"+
      (top?", 사주에서 가장 큰 힘은 <b>"+godLabel(top.god)+"</b> "+godShare(reasoning,top.god)+"%야":"")+
      (special?". 여기에 "+withJosa(special.name,"이","가")+" "+special.positions.map(p=>PILLAR_KR[p]).join("·")+"에 있어":"")+
      ". 그리고 너 자신은 "+strengthPlain(reasoning)+"이야.";
    const tie=isT
      ? "이 성향이 ‘"+s.label+"’에서 어떻게 나오는지 바로 다음에 볼게."
      : "이 성향이 ‘"+s.label+"’ 고민에서 제일 먼저 드러나. 바로 다음에서 진짜 이유를 볼게.";
    const partner=top?godRows(reasoning).find(r=>r.group===top.group&&r.god!==top.god):null;
    const details=detailsBlock([
      top?"가장 큰 힘: "+top.god+" — "+godPlaces(reasoning,top.god,2)+"에 있고 "+godShare(reasoning,top.god)+"%"+(partner?", "+withJosa(GROUP_GODS[top.group],"을","를")+" 합친 "+GROUP_NAME[top.group]+"은 "+groupShare(reasoning,top.group)+"%":"")+".":"",
      sig?.dayStage?"일주의 12운성: "+sig.dayStage+" — "+sig.dayStageScene:"",
      (sig?.sinsal||[]).length?"신살: "+sinsalList(sig)+".":"",
      centerSentence(reasoning),
      rootSentence(reasoning),
    ]);
    return [conclusion,why,guardSentence(reasoning,isT),tie,details].filter(Boolean).join("<br><br>");
  }

  function concernEvidence(reasoning,s,sig,data){
    const sh=g=>groupShare(reasoning,g);
    const c=s.concern;
    if(c==="money"){
      const pos=mainPositionOfGroup(reasoning,"wealth");
      return "돈을 뜻하는 재성은 "+sh("wealth")+"%"+(pos?"이고, 주로 "+pillarName(reasoning,pos)+", 곧 "+POS_AREA[pos]+"에 있어.":"로 사주에 거의 안 보여.");
    }
    if(c==="career") return "결과를 보여주는 식상은 "+sh("output")+"%, 자리와 평가를 뜻하는 관성은 "+sh("officer")+"%야.";
    if(c==="love"){
      const g=data?.gender==="male"?"wealth":data?.gender==="female"?"officer":"";
      const dz=dayBranchGod(reasoning);
      const star=g?(g==="officer"?"여자 사주에서 연인을 뜻하는 관성은 ":"남자 사주에서 연인을 뜻하는 재성은 ")+sh(g)+"%이고, ":"";
      return star+(dz?"배우자 자리인 일주 아랫글자에는 "+withJosa(dz,"이","가")+" 있어.":"배우자 자리는 따로 두드러지는 글자가 없어.");
    }
    if(c==="path"){
      const rows=godRows(reasoning);
      return rows[1]?"두 번째로 큰 힘은 "+rows[1].god+" "+godShare(reasoning,rows[1].god)+"%야.":"다른 힘은 고르게 나뉘어 있어.";
    }
    if(c==="people") return "나와 같은 힘인 비겁은 "+sh("self")+"%, 규칙과 책임을 뜻하는 관성은 "+sh("officer")+"%야.";
    return (topGroupOf(reasoning)==="print"?"":"회복을 돕는 인성은 "+sh("print")+"%, ")+"밖으로 풀어내는 식상은 "+sh("output")+"%이고, 너 자신은 "+strengthPlain(reasoning)+"이야.";
  }
  function causeModifier(reasoning,s,sig){
    const sh=g=>groupShare(reasoning,g);
    const c=s.concern;
    if(c==="money"&&sh("self")>=25&&sh("wealth")>0&&sh("self")>sh("wealth")) return "게다가 나와 같은 힘인 비겁이 "+sh("self")+"%로 재성 "+sh("wealth")+"%보다 커서, 돈이 사람 사이에서 나눠지기 쉬운 배치야.";
    if(c==="money"&&sh("wealth")>=35&&verdictOf(reasoning)==="신약") return "게다가 재성이 "+sh("wealth")+"%로 큰데 너 자신은 약한 편이라, 돈을 벌어도 붙잡아 두는 힘이 먼저 필요해.";
    if(c==="love"){
      const rel=relationRows(reasoning,sig).find(x=>x.aPos==="day"||x.bPos==="day");
      const combine=(reasoning?.context?.branchCombines||[]).find(x=>x.aPos==="day"||x.bPos==="day");
      if(rel&&rel.type==="clash") return "그리고 배우자 자리가 다른 자리와 정면으로 부딪히고 있어서, 연애 초반엔 뜨겁다가 생활 문제에서 부딪히기 쉬워.";
      if(combine) return "그리고 배우자 자리가 다른 자리와 묶여 있어서, 한번 마음을 주면 깊고 오래 엮이는 편이야.";
    }
    if(c==="career"&&sh("officer")>=40&&verdictOf(reasoning)==="신약") return "게다가 관성이 "+sh("officer")+"%로 너 자신보다 훨씬 커서, 일이 늘수록 네 힘보다 부담이 먼저 커져.";
    if(c==="mental"&&verdictOf(reasoning)==="신약"&&sh("print")<15) return "게다가 회복을 돕는 인성이 "+sh("print")+"%로 적어서, 저절로 충전되길 기다리면 오래 걸려.";
    if(c==="people"&&sh("self")>=30) return "게다가 나와 같은 힘이 "+sh("self")+"%로 커서, 관계에서도 누가 위냐가 은근히 신경 쓰이는 편이야.";
    return c==="money"?sinsalTie(sig,c):"";
  }

  // 2. 진짜 원인
  function noteCauseV6(reasoning,s,sig,data,isT){
    const G=topGroupOf(reasoning);
    const top=godRows(reasoning)[0];
    const hook=CAUSE_HOOK[s.concern]?.[s.key]||"";
    const cause=CAUSE[s.concern]?.[s.key]?.[G]||"";
    const why=whyLabel(isT)+(top?"네 사주에서 가장 큰 힘은 "+godLabel(top.god)+"이고, 같은 계열인 "+withJosa(GROUP_NAME[G],"을","를")+" 합치면 "+groupShare(reasoning,G)+"%야. 그래서 "+(CONCERN_WORD[s.concern]||"이 고민")+"에서도 이 힘이 제일 먼저 움직여. ":"")+concernEvidence(reasoning,s,sig,data);
    const modifier=causeModifier(reasoning,s,sig);
    const details=detailsBlock([
      patternPressureSentence(reasoning)+".",
      patternCapacitySentence(reasoning)+".",
      bondSentence(reasoning),
      weakLinkSentence(reasoning).replace(/<[^>]+>/g,""),
    ]);
    // 원인 첫 문장은 굵게 보여줘서 "그래서 이유가 뭔데?"에 바로 답이 보이게 한다.
    const causeHtml=cause.replace(/^(.+?[.?!])(\s|$)/,"<b>$1</b>$2");
    return [lead(isT)+causeHtml,why,modifier,details].filter(Boolean).join("<br><br>");
  }

  // 3. 푸는 법
  function noteFixV6(reasoning,s,sig,isT){
    const G=topGroupOf(reasoning);
    const N=needGroupOf(reasoning);
    const el=prescriptionElement(reasoning);
    const fix=FIX[s.concern]?.[s.key]?.[G]||"";
    const need=NEED_LINE[s.concern]?.[N]||"";
    const support=supportRows(reasoning,s)[0];
    const raw=el?Number(reasoning?.profile?.elements?.raw?.[el]||0):null;
    const lines=[
      lead(isT)+fix,
      "<b>네 사주에 제일 필요한 것</b> — "+need+(el?" 기운으로는 "+withJosa(elementName(el),"이야","야")+".":""),
      el?"<b>도움 되는 것</b> — "+ELEMENT_TIPS[el]+".":"",
      "<b>구체적으로</b> — "+plainSentence(s.move),
      whyLabel(isT)+(el?withJosa(elementName(el),"은","는")+" 너한테 "+groupLabelJ(N,"이고","고")+", 겉 글자로는 "+raw+"개"+(raw===0?"라 밖에서 채워야 하는 쪽이야. ":"라 이미 있는 걸 살리는 쪽이야. "):"")+(support?.why||""),
    ];
    return lines.filter(Boolean).join("<br><br>");
  }

  // 4. 어떻게 할지 = 푸는 법 + (2번 답에서 안 다룬 경우) 잘 맞는 것
  const ANSWER_COVERS_FIT=new Set(["money/side","money/income","career/jobsearch","career/move","path/lost","path/switch","path/current","love/new"]);
  function fitMainLine(reasoning,s,sig,data){
    const top=godRows(reasoning)[0];
    const sh=g=>groupShare(reasoning,g);
    const c=s.concern;
    if(c==="money"){
      const rows=godRows(reasoning);
      const jj=rows.find(r=>r.god==="정재"), pj=rows.find(r=>r.god==="편재");
      const style=sh("output")>=15&&sh("wealth")>=8?"craft":sh("wealth")>=8&&Number(jj?.weight||0)>=Number(pj?.weight||0)?"steady":sh("wealth")>=8?"trade":sh("officer")>=30?"position":"skill";
      return "<b>너한테 맞는 돈 버는 방식</b> — "+MONEY_STYLE[style];
    }
    if(c==="career") return top?"<b>너한테 맞는 일·환경</b> — "+CAREER_FIT[top.god]:"";
    if(c==="path") return top?"<b>너한테 맞는 분야</b> — "+PATH_FIT[top.god]+"가 잘 맞아.":"";
    if(c==="love"){
      const dz=dayBranchGod(reasoning);
      return PARTNER_FIT[dz]?"<b>너랑 잘 맞는 사람</b> — "+PARTNER_FIT[dz]:"";
    }
    if(c==="people"){
      const gui=sinsalOf(sig,"천을귀인");
      return gui?"<b>도와주는 사람</b> — 천을귀인이 "+gui.positions.map(p=>PILLAR_KR[p]).join("·")+"에 있어서, "+gui.positions.map(p=>POS_PERSON[p]).join("·")+" 쪽에서 도움이 올 가능성이 커.":"";
    }
    const el=prescriptionElement(reasoning);
    return el?"<b>너한테 맞는 회복법</b> — "+RECOVER_FIT[el]:"";
  }
  function noteHowV7(reasoning,s,sig,data,isT){
    const base=noteFixV6(reasoning,s,sig,isT);
    const fit=ANSWER_COVERS_FIT.has(s.concern+"/"+s.key)?"":fitMainLine(reasoning,s,sig,data);
    if(!fit) return base;
    const parts=base.split("<br><br>");
    parts.splice(1,0,fit);
    return parts.join("<br><br>");
  }

  // 6. 조심할 것
  function noteCautionV6(reasoning,s,sig,isT){
    const B=burdenGroupOf(reasoning);
    const main=CAUTION[s.concern]?.[B]||"";
    const relevantPos={love:["day"],people:["year","month","day","hour"],career:["year","month"],money:["year","month","day"]}[s.concern]||[];
    const rel=relationRows(reasoning,sig).find(x=>relevantPos.includes(x.aPos)||relevantPos.includes(x.bPos))||null;
    const bad=(sig?.sinsal||[]).find(x=>SINSAL_CAUTION[x.name]);
    const gm=(sig?.gongmang?.positions||[])[0];
    const harm=harmRows(reasoning,s)[0];
    const present=new Set(godRows(reasoning).map(r=>r.god));
    const harmPresent=(synthesisFor(reasoning).mechanisms?.structure?.harmfulGods||[]).some(g=>present.has(g));
    const top=godRows(reasoning)[0];
    const whyText=!harmPresent&&verdictOf(reasoning)==="신강"&&top
      ? "너 자신이 강한 편인데 가장 큰 힘인 "+godLabel(top.god)+" 쪽이 이미 "+groupShare(reasoning,top.group)+"%야. 여기서 더 세지면 장점이 고집이나 과함으로 바뀌기 쉬워."
      : (harm?.evidence||"");
    const lines=[
      lead(isT)+main+" "+(CAUTION_CHECK[s.concern]||""),
      rel?"<b>특히 조심할 관계</b> — "+relationSentence(reasoning,rel):"",
      bad?"<b>이것도 기억해</b> — "+SINSAL_CAUTION[bad.name]:"",
      gm?"<b>기대를 낮출 쪽</b> — "+POS_PERSON[gm]+" 자리인 "+withJosa(pillarName(reasoning,gm),"이","가")+" 비어 있는 공망 배치라, 그쪽 도움은 크게 기대하기보다 스스로 준비해두는 게 마음이 편해.":"",
      whyLabel(isT)+whyText,
      detailsBlock(relationRows(reasoning,sig).filter(r=>r!==rel).slice(0,2).map(r=>relationShort(reasoning,r))),
    ];
    return lines.filter(Boolean).join("<br><br>");
  }

  // 7. 이번 주 할 것
  function nextGoodRow(reasoning){
    const months=(reasoning?.timing?.nearMonths||[]).slice(1);
    return months.find(row=>["supportive","mild-support"].includes(row?.class))||null;
  }
  function noteActionV6(reasoning,s,sig,isT,timingRow){
    const el=prescriptionElement(reasoning);
    const G=topGroupOf(reasoning);
    const when=el?ELEMENT_WHEN[el]:"";
    const cls=timingRow?.class||"";
    const positive=["supportive","mild-support"].includes(cls);
    const caution=["caution","mild-caution"].includes(cls);
    const now=timingRow?formatMonth(timingRow,reasoning?.timing?.today||""):"";
    const lines=[
      lead(isT)+"이번 주엔 딱 하나만 해. <b>"+plainSentence(s.metric).replace(/[.]$/,"")+"</b>"+(when?" — "+when+" 해봐.":"."),
      (isT?"<b>이유</b> — ":"<b>왜 이거냐면</b> — ")+(["strength","flow"].includes(s.key)
        ? "앞에서 본 ‘"+(CAUSE_TITLE[s.concern]?.[s.key]||"네 강점")+"’을 실제로 써보는 가장 작은 행동이라서야. "+GROUP_MEANING[G]+" 쪽 힘이 네 사주에서 제일 크거든."
        : "앞에서 본 진짜 이유를 끊는 가장 작은 행동이라서야. 큰 결심보다 이런 작은 행동이 "+(CONCERN_WORD[s.concern]||"이 고민")+"에서 "+GROUP_MEANING[G]+" 쪽으로 쏠린 힘을 제일 빨리 돌려놔.")+
        (positive?" 마침 "+now+" 구간이 네 사주를 돕는 쪽이라 시작하기 좋아.":caution?" "+now+" 구간은 약한 쪽을 건드리는 때라, 크게 바꾸기보다 이 정도 작은 것부터 하는 게 맞아.":""),
      (()=>{
        const next=nextGoodRow(reasoning);
        return next
          ? "<b>다음 타이밍</b> — "+formatMonth(next,reasoning?.timing?.today||"")+"가 다음으로 힘이 붙는 구간이야. "+(CONCERN_WORD[s.concern]||"이 고민")+"에서 이번 주에 해본 걸 그때 한 단계 더 키워."
          : "<b>다음 타이밍</b> — 가까운 달 중엔 특별히 힘이 붙는 달보다 고르게 가는 달이 많아. "+(CONCERN_WORD[s.concern]||"이 고민")+"에서 7일 해보고 달라진 게 있으면 그대로 이어가면 돼.";
      })(),
    ];
    return lines.filter(Boolean).join("<br><br>");
  }

  function yearLine(reasoning,s,isT){
    const timing=reasoning?.timing||{};
    const today=String(timing.today||"");
    const y=Number(today.slice(0,4));
    const rows=(timing.years||[]).filter(r=>r&&(r.year===y||r.year===y+1));
    const month=Number(today.slice(5,7))||1;
    const out=[];
    const usedLines=new Set();
    rows.forEach(r=>{
      const gz=String(r.seyunGanZhi||"");
      const name=gz.length>=2&&GAN_KR[gz[0]]?GAN_KR[gz[0]]+(ZHI_KR[gz[1]]||"")+"년":"";
      const god=r.seyunGod||"";
      if(!name||!YEAR_GOD_SCENE[god]) return;
      if(r.year===y+1&&month<9) return;
      const cls=r.class||"";
      let tone=["supportive","mild-support"].includes(cls)?"네 사주엔 도움이 되는 쪽이야."
        :["caution","mild-caution"].includes(cls)?"네 사주엔 부담이 되는 쪽이라 속도 조절이 필요해."
        :"도움과 부담이 섞여 있어서 잘되는 쪽만 골라 키우는 게 좋아.";
      if(usedLines.has(tone)) tone="판정은 올해와 비슷해서, 올해 잘 된 방식을 그대로 이어가면 돼.";
      usedLines.add(tone);
      let concernLine=CONCERN_YEAR[s.concern]?.[godGroup(god)]||"";
      if(usedLines.has(concernLine)) concernLine=(CONCERN_WORD[s.concern]||"이 고민")+"에서는 올해와 같은 결이 한 해 더 이어져";
      usedLines.add(concernLine);
      out.push("<b>"+(r.year===y?"올해":"내년")+" "+name+"</b> — 너한테는 "+godLabel(god)+"의 해, 곧 "+YEAR_GOD_SCENE[god]+"야. "+(concernLine?concernLine+". ":"")+tone);
    });
    return out;
  }
  function monthStrip(reasoning){
    const timing=reasoning?.timing||{};
    const months=(timing.nearMonths||[]).slice(0,6);
    if(months.length<3) return "";
    const today=String(timing.today||"");
    const label=row=>{
      const cls=row?.class||"";
      return ["supportive","mild-support"].includes(cls)?"좋음":["caution","mild-caution"].includes(cls)?"조심":"보통";
    };
    return "<b>앞으로 6개월 한눈에</b> — "+months.map((row,i)=>{
      const m=Number(row.startMonth||0), d=Number(row.startDay||0);
      const when=i===0?"지금":(m&&d?m+"월 "+d+"일~":"");
      return when+" "+label(row);
    }).filter(Boolean).join(" · ");
  }

  // ===== 질문에 대한 답 (v7) =====
  // 고민을 고른 사람이 제일 먼저 알고 싶은 것(뭘 하면 되는지 / 할까 말까 / 언제)을 NOTE2에서 결론부터 답한다.
  // 순위는 사주에서 필요한 기운(처방), 가장 큰 힘, 강약, 방해 글자로만 매긴다.
  const ANSWER_TITLE={
    money:{saving:"돈이 새는 구멍, 순서대로",income:"수입을 늘리는 길, 순서대로",side:"돈 되는 부업 vs 피할 부업",flow:"돈이 들어오는 때와 조심할 때"},
    career:{exam:"시험에 유리한 때와 합격을 가르는 것",jobsearch:"맞는 직무와 붙기 좋은 때",move:"옮길까, 버틸까",current:"지금 자리에서 올라가는 법"},
    love:{crush:"먼저 움직여도 될까",relationship:"이 연애, 오래 갈 수 있을까",breakup:"다시 이어질 수 있을까",new:"인연은 언제, 어디서 올까"},
    path:{lost:"맞는 분야, 순서대로",current:"지금 길, 계속 가도 될까",switch:"바꿔도 될까, 어디로",strength:"네 강점, 순서대로"},
    people:{friend:"이 친구 관계, 어떻게 할까",work:"직장 사람, 어떻게 대할까",family:"가족과 어떻게 지낼까",distance:"거리를 둘까, 계속 볼까"},
    mental:{burnout:"지금 쉬어야 할까",overthink:"생각을 멈추는 방법, 순서대로",low:"다시 움직이는 첫걸음",recover:"언제, 어떻게 회복될까"},
  };
  const ANSWER_HOOK={
    money:{saving:"돈이 새는 구멍은 순서가 있어. 제일 큰 구멍부터 막으면 돼.",income:"수입을 늘리는 길은 여러 개인데, 네 사주에 맞는 순서가 있어.",side:"네 사주에서 돈 되는 부업과 안 되는 부업은 분명하게 갈려. 1순위부터 말할게.",flow:"네 돈이 잘 도는 때와 조심할 때는 정해져 있어. 날짜부터 말할게."},
    career:{exam:"시험은 공부량보다 언제 보느냐와 뭘 하나 바꾸느냐에서 갈려. 날짜부터 말할게.",jobsearch:"붙는 곳은 스펙보다 맞는 직무와 지원 타이밍에서 갈려. 맞는 직무 1순위부터 말할게.",move:"옮길지 말지, 네 사주 기준으로 결론부터 말할게. 옮긴다면 어디로 갈지도 같이 볼게.",current:"지금 자리에서 올라가는 방법은 하나로 정리돼. 인정받기 좋은 때까지 같이 말할게."},
    love:{crush:"이 썸은 기다리는 것보다 네가 어떻게 움직이느냐에서 갈려.",relationship:"이 연애가 오래 가는지는 서운함을 푸는 방식에서 갈려. 네 사주 쪽 결론부터 말할게.",breakup:"다시 이어질지, 네 사주 쪽에서 볼 수 있는 결론부터 말할게.",new:"인연은 때와 장소가 있어. 언제, 어디서, 어떤 사람인지 차례로 말할게."},
    path:{lost:"네 사주에서 맞는 분야는 순서가 있어. 1순위부터 말할게.",current:"지금 길이 맞는지는 네 사주 기준으로 가를 수 있어. 맞는 방향부터 말할게.",switch:"바꿔도 되는지, 바꾼다면 어디로인지 결론부터 말할게. 옮기기 좋은 때도 같이 볼게.",strength:"네 강점은 사주에 순서대로 쓰여 있어. 제일 센 것부터 약한 것까지 말할게."},
    people:{friend:"이 친구 관계를 어떻게 할지, 네 사주에서 보이는 결론부터 말할게.",work:"직장 사람을 어떻게 대하면 덜 지치는지, 네 사주 기준으로 결론부터 말할게.",family:"가족과 덜 부딪히려면 뭘 지키면 되는지, 네 사주 기준으로 결론부터 말할게.",distance:"거리를 둘지 계속 볼지, 네 사주 쪽에서 보이는 결론부터 말할게."},
    mental:{burnout:"지금 더 버틸지 쉴지, 네 사주 기준으로 결론부터 말할게.",overthink:"생각을 멈추는 방법은 네 사주에 맞는 순서가 있어. 1순위부터 말할게.",low:"다시 움직이는 첫걸음은 크지 않아도 돼. 순서대로 말할게.",recover:"회복이 붙는 때와 방법, 네 사주 기준으로 결론부터 말할게."},
  };
  const SIDE_OPTION={
    output:["만들어 파는 부업","공예·레시피·디자인·영상처럼 네 손에서 나온 걸 파는 일"],
    wealth:["사고파는 부업","중개·리셀·공동구매처럼 사람과 물건을 연결하는 일"],
    print:["알려주는 부업","과외·강의·전자책·상담처럼 아는 걸 가르치는 일"],
    officer:["맡아서 관리하는 부업","대행·운영 관리·주말 고정 파트타임처럼 역할이 정해진 일"],
    self:["혼자 하는 1인 서비스","레슨·프리랜스처럼 내 기술 하나로 직접 받는 일"],
  };
  const SIDE_AVOID={
    self:"동업이나 계처럼 사람과 돈을 섞는 부업",output:"재고를 잔뜩 쌓아두고 파는 장사",wealth:"단기 투자·코인처럼 한 번에 크게 거는 수입",
    officer:"본업만큼 책임이 무거운 투잡",print:"강의·자격증만 계속 사는 준비형 부업",
  };
  const INCOME_OPTION={
    officer:["자리를 올려서 받는 길","승진·직급·연봉 협상처럼 조직 안에서 올라가는 방법"],
    wealth:["성과로 받는 길","성과급·영업·거래 규모처럼 숫자로 바로 보이는 방법"],
    output:["단가를 올리는 길","내 결과물 가격을 올리거나 프리랜스로 따로 받는 방법"],
    print:["전문성으로 받는 길","자격·전문 분야를 만들어 몸값을 올리는 방법"],
    self:["내 몫을 키우는 길","독립이나 1인 사업처럼 내가 정한 만큼 가져가는 방법"],
  };
  const INCOME_AVOID={
    self:"혼자 버티면서 알아서 올려주길 기다리는 것",output:"싸게 많이 해주는 것",wealth:"조건만 보고 여기저기 옮겨 다니는 것",
    officer:"책임만 늘리고 보상 얘기는 미루는 것",print:"준비만 하고 협상은 안 하는 것",
  };
  const INDUSTRY={
    hwa:"뷰티·방송·광고·카페·요식",su:"무역·물류·여행·음료·수산",mok:"교육·출판·식물·패션·인테리어",
    geum:"금융·IT기기·정밀기술·자동차·운동용품",to:"부동산·중개·농산물·건강식품·요양",
  };
  const SIGNAL_WORK={
    역마:"배달·출장·여행처럼 움직이는 일",도화:"사람 앞에 서거나 SNS에 얼굴을 보이는 일",문창귀인:"글·강의·정리 노트처럼 글로 파는 일",
    화개:"마니아층이 있는 전문·예술 분야",홍염:"분위기와 스타일을 파는 일",천을귀인:"아는 사람 소개로 들어오는 일",
  };
  const LEAK_NAME={
    self:["사람 따라 나가는 돈","모임·밥값·빌려준 돈처럼 사람 때문에 쓰는 돈"],output:["하고 싶은 것에 나가는 돈","취미·맛집·충동구매처럼 기분 따라 쓰는 돈"],
    wealth:["벌려놓은 기회에 나가는 돈","투자·할인·이것저것 조금씩 걸어둔 돈"],officer:["의무로 나가는 돈","경조사·선물·회비·체면처럼 안 내면 불편한 돈"],
    print:["나를 달래는 돈","배달·택시·자기계발처럼 지친 나한테 쓰는 돈"],
  };
  const SAVE_STYLE={
    print:"믿을 만한 곳에 맡겨두는 자동 적금",self:"월급날 내가 정한 금액을 바로 떼어두는 방식",output:"모은 돈으로 뭘 할지 목표를 정해두는 목적 저축",
    wealth:"통장을 목적별로 나눠두는 방식",officer:"한 번 넣으면 못 깨는 만기 상품",
  };
  const FLOW_WAY={
    self:"내가 직접 벌고 직접 관리하는 돈",output:"내가 만든 결과물로 들어오는 돈",wealth:"여러 곳에서 조금씩 들어오는 돈",
    officer:"자리와 신용으로 들어오는 돈",print:"자격과 문서로 들어오는 돈",
  };
  const EXAM_KEY={
    self:"막힌 과목의 공부법을 바꾸는 것",output:"지루한 반복 풀이를 버티는 것",wealth:"기본기 빈틈을 메우는 것",
    officer:"실전처럼 시간 재고 푸는 연습",print:"정리 대신 문제 풀이를 늘리는 것",
  };
  const JOB_OPTION={
    officer:["조직형 직무","공공기관·대기업·관리직처럼 역할과 평가가 분명한 자리"],
    wealth:["숫자·거래 직무","영업·재무·구매처럼 성과가 숫자로 보이는 자리"],
    output:["결과물 직무","기획·디자인·개발·콘텐츠처럼 만든 걸 보여주는 자리"],
    print:["전문·지식 직무","교육·연구·자격 기반처럼 아는 게 무기가 되는 자리"],
    self:["내 담당이 분명한 직무","전문직·기술직처럼 내가 맡은 게 확실한 자리"],
  };
  const MOVE_FIT={
    officer:"다만 너는 조직을 아예 떠나기보다 부서나 직무를 옮기는 쪽이 더 잘 맞는 사주야.",
    self:"옮긴다면 네 방식대로 할 수 있는 범위가 넓은 곳이어야 해.",output:"옮긴다면 네 의견과 결과물이 막히지 않는 곳이어야 해.",
    wealth:"옮긴다면 조건이 숫자로 확실히 나아지는 곳이어야 해.",print:"옮긴다면 새로 배울 게 있는 곳이어야 해.",
  };
  const CURRENT_KEY={
    self:"혼자 끝낸 일을 짧게라도 보고하는 것",output:"잘한 포인트를 윗사람 기준의 말로 바꿔 전하는 것",
    wealth:"성과를 먼저 쌓고 보상 얘기는 그다음에 하는 것",officer:"원하는 것 하나를 문장으로 요청하는 것",print:"80%일 때 먼저 보여주는 것",
  };
  const HELPER={print:"끌어주는 선배나 멘토",self:"같이 일하는 동료",output:"네 결과물을 알아봐주는 사람",wealth:"성과를 숫자로 봐주는 상사",officer:"기준이 분명한 윗사람"};
  const CRUSH_MOVE={
    self:"밥 한 번, 산책 한 번처럼 자존심 안 상하는 작은 제안",output:"표현은 한 박자 늦추고 상대가 다가온 만큼만 다가가기",
    wealth:"챙겨주기는 줄이고 둘만 있는 시간을 만들기",officer:"확실해질 때까지 기다리지 말고 궁금하다는 티 내기",print:"해석 대신 직접 한 번 물어보기",
  };
  const MEET_PLACE={
    hwa:"밝고 사람 많은 모임이나 행사",su:"조용한 카페·전시·여행지",mok:"강의·스터디·새로 배우는 자리",geum:"운동 모임이나 정돈된 동호회",to:"지인 소개나 오래 다닌 모임",
  };
  const PARTNER_SHORT={
    정재:"성실하고 생활력 있는 사람",편재:"활동적이고 통 큰 사람",정관:"반듯하고 책임감 있는 사람",편관:"카리스마 있고 강한 사람",
    정인:"따뜻하게 챙겨주는 사람",편인:"생각이 깊고 독특한 사람",식신:"편하고 잘 웃는 사람",상관:"말이 잘 통하고 재밌는 사람",
    비견:"친구 같은 대등한 사람",겁재:"에너지 넘치는 사람",
  };
  const PATH_OPTION={
    officer:["공공·행정·관리 분야","기준과 신뢰가 중요한 일"],wealth:["금융·영업·유통 분야","돈과 거래가 도는 일"],
    output:["디자인·제작·기술 분야","만들고 표현하는 일"],print:["교육·연구·상담 분야","알고 가르치는 일"],
    self:["전문직·자영업·1인 브랜드","내 이름으로 하는 일"],
  };
  const PATH_KEEP={
    self:"내가 결정하는 범위가 조금씩 넓어지고 있으면",output:"내 아이디어가 실제로 쓰이고 있으면",wealth:"노력한 만큼 보상이 늘고 있으면",
    officer:"인정과 자리가 조금씩 올라가고 있으면",print:"아직 배울 게 남아 있으면",
  };
  const PATH_CHANGE={
    self:"1년 넘게 내가 정할 수 있는 게 하나도 안 늘었다면",output:"1년 넘게 내 아이디어가 한 번도 안 쓰였다면",wealth:"1년 넘게 보상이 제자리라면",
    officer:"1년 넘게 인정도 자리도 그대로라면",print:"1년 넘게 새로 배운 게 없다면",
  };
  const STRENGTH_NAME={
    self:"끝까지 혼자 해내는 힘",output:"만들어내고 표현하는 힘",wealth:"현실을 계산하는 감각",officer:"믿고 맡길 수 있는 책임감",print:"깊게 이해하는 힘",
  };
  const PEOPLE_LINE={
    self:"대등함이 깨지는 순간 선을 긋는 것",output:"불편한 건 작을 때 가볍게 말하는 것",wealth:"주고받는 게 기울면 먼저 주는 걸 멈추는 것",
    officer:"‘지금은 어려워’라고 거절하는 연습",print:"이해해주는 역할을 잠깐 내려놓는 것",
  };
  const WORK_LINE={
    self:"내 담당 범위를 먼저 말로 정해두는 것",output:"말하기 전에 한 번 쉬고 결론부터 부드럽게 말하는 것",wealth:"누가 뭘 했는지 기록으로 남기는 것",
    officer:"무리한 부탁은 ‘확인해보고 말씀드릴게요’로 한 번 거르는 것",print:"들은 말을 그날 적고 닫는 것",
  };
  const FAMILY_LINE={
    self:"허락을 구하기보다 ‘이렇게 하기로 했어’라고 알리는 것",output:"싸움이 커지기 전에 자리를 먼저 뜨는 것",wealth:"돈 얘기는 금액과 기간을 정해서 하는 것",
    officer:"다 챙기려는 마음을 내려놓고 하나는 다른 가족에게 넘기는 것",print:"서운한 건 참지 말고 한 번은 말하는 것",
  };
  const TIRE_NAME={
    self:"혼자 다 떠안은 것",output:"밖으로 너무 많이 쓴 것",wealth:"챙길 게 한꺼번에 몰린 것",officer:"책임감으로 너무 오래 버틴 것",print:"머리가 한 번도 쉬지 못한 것",
  };
  const QUICK_RECOVER={
    hwa:"낮에 햇빛 보며 걷기",su:"밤에 따뜻한 물로 씻고 일찍 눕기",mok:"아침 산책",geum:"방 정리나 가벼운 운동",to:"같은 시간에 자고 먹기",
  };
  const THINK_STOP={
    self:"믿을 만한 사람 한 명에게 물어보기",output:"머릿속 생각을 종이에 다 쓰기",wealth:"선택지를 세 개까지만 적고 고르기",
    officer:"틀려도 되는 결정 하나를 빨리 내리기",print:"생각하는 시간을 하루 20분으로 정해두기",
  };
  const LOW_STEP={
    self:"가까운 사람에게 요즘 힘들다고 한 번 말하기",output:"아주 작은 것 하나 만들어보기",wealth:"끝이 보이는 작은 일 하나 끝내기",
    officer:"하고 싶은 일 하나를 일정에 넣기",print:"푹 자고 먹고 햇빛 보기",
  };

  function spouseGroupOf(data){ return data?.gender==="male"?"wealth":data?.gender==="female"?"officer":""; }
  // 좋은 달이 이어지면 한 구간으로 묶는다. 구간 점수(달별 도움 신호 합)가 큰 두 구간을 날짜순으로 보여준다.
  function goodRuns(reasoning){
    const today=String(reasoning?.timing?.today||"");
    const months=(reasoning?.timing?.nearMonths||[]).filter(row=>String(row.endYmd||row.startYmd)>=today);
    const runs=[]; let cur=null;
    months.forEach(row=>{
      const good=["supportive","mild-support"].includes(row?.class);
      if(!good){ cur=null; return; }
      const sc=Number(row?.monthSpecific?.support||0)*2+(row.class==="supportive"?1:0);
      if(cur){ cur.rows.push(row); cur.score+=sc; }
      else { cur={rows:[row],score:sc}; runs.push(cur); }
    });
    return runs.sort((a,b)=>b.score-a.score||String(a.rows[0].startYmd).localeCompare(String(b.rows[0].startYmd)))
      .slice(0,2).sort((a,b)=>String(a.rows[0].startYmd).localeCompare(String(b.rows[0].startYmd)));
  }
  function goodRows(reasoning){ return goodRuns(reasoning).map(run=>run.rows[0]); }
  function runText(reasoning,run){
    const today=String(reasoning?.timing?.today||"");
    const first=run.rows[0], last=run.rows[run.rows.length-1];
    const y=Number(today.slice(0,4));
    const endYmd=String(last.endYmd||"");
    const ey=Number(endYmd.slice(0,4)), em=Number(endYmd.slice(5,7)), ed=Number(endYmd.slice(8,10));
    const sy=Number(String(first.startYmd).slice(0,4));
    const end=em&&ed?(ey&&ey!==y&&ey!==sy?ey+"년 ":"")+em+"월 "+ed+"일 전까지":"";
    const isNow=String(first.startYmd)<=today;
    const start=isNow?"지금부터":(sy&&sy!==y?sy+"년 ":"")+Number(first.startMonth)+"월 "+Number(first.startDay)+"일부터";
    return end?start+" "+end:formatMonth(first,today);
  }
  function badRow(reasoning){
    return (reasoning?.timing?.nearMonths||[])
      .filter(row=>["caution","mild-caution"].includes(row?.class))
      .sort((a,b)=>Number(b?.monthSpecific?.caution||0)-Number(a?.monthSpecific?.caution||0)||String(a.startYmd).localeCompare(String(b.startYmd)))[0]||null;
  }
  function momentumOf(reasoning){
    const rows=(reasoning?.timing?.nearMonths||[]).slice(0,4);
    return rows.filter(r=>["supportive","mild-support"].includes(r?.class)).length-rows.filter(r=>["caution","mild-caution"].includes(r?.class)).length;
  }
  function rankGroups(reasoning){
    const groups=["self","output","wealth","officer","print"];
    const v=verdictOf(reasoning);
    const N=needGroupOf(reasoning);
    const pr=synthesisFor(reasoning).mechanisms?.adjustment?.prescription||reasoning?.integrated?.prescription||{};
    const el2=(pr.sequence||[]).map(x=>x?.element).filter(el=>EL_KR[el])[1];
    const N2=el2?groupOfElement(dayElementOf(reasoning),el2):"";
    const harm=new Set((synthesisFor(reasoning).mechanisms?.structure?.structuralHarmGods||[]).map(godGroup));
    const B=burdenGroupOf(reasoning);
    const score=g=>{
      let x=0;
      if(g===N) x+=4;
      if(g===N2) x+=2;
      if(["output","wealth"].includes(g)&&groupShare(reasoning,g)>=10) x+=1;
      if(v==="신강"&&["output","wealth","officer"].includes(g)) x+=1;
      if(v==="신약"&&["self","print"].includes(g)) x+=1;
      if(harm.has(g)) x-=3;
      if(v==="신약"&&g===B&&g!==N) x-=2;
      if(v==="신강"&&["self","print"].includes(g)&&g!==N) x-=1;
      return x;
    };
    return groups.map(g=>({g,s:score(g),share:groupShare(reasoning,g)}))
      .sort((a,b)=>b.s-a.s||b.share-a.share).map(x=>x.g);
  }
  function groupsByShare(reasoning){
    return ["self","output","wealth","officer","print"].map(g=>({g,share:groupShare(reasoning,g)})).sort((a,b)=>b.share-a.share).map(x=>x.g);
  }
  function signalWorkLine(sig){
    const hit=(sig?.sinsal||[]).find(x=>SIGNAL_WORK[x.name]);
    return hit?"<b>하나 더</b> — "+withJosa(hit.name,"이","가")+" 있어서 "+SIGNAL_WORK[hit.name]+"도 잘 맞아.":"";
  }
  function dayRelation(reasoning,sig,types){
    return relationRows(reasoning,sig).find(x=>(x.aPos==="day"||x.bPos==="day")&&types.includes(x.type))||null;
  }
  function dayCombine(reasoning){
    return (reasoning?.context?.branchCombines||[]).some(x=>x.aPos==="day"||x.bPos==="day");
  }
  function thisYearGroup(reasoning){
    const y=Number(String(reasoning?.timing?.today||"").slice(0,4));
    const row=(reasoning?.timing?.years||[]).find(r=>r?.year===y);
    return row?.seyunGod?godGroup(row.seyunGod):"";
  }
  function whenLine(reasoning,label){
    const runs=goodRuns(reasoning);
    return runs.length?"<b>"+label+"</b> — "+runs.map(run=>runText(reasoning,run)).join(", 그리고 ")+".":"<b>"+label+"</b> — 가까운 달 중엔 특별히 튀는 달 없이 고르게 가. 준비되는 대로 시작해도 돼.";
  }
  function cautionLine(reasoning,label){
    const bad=badRow(reasoning);
    return bad?"<b>"+label+"</b> — "+formatMonth(bad,reasoning?.timing?.today||"")+". 이때는 크게 벌리지 마.":"";
  }

  function noteAnswerV7(reasoning,s,sig,data,isT){
    const k=s.concern+"/"+s.key;
    const el=prescriptionElement(reasoning);
    const N=needGroupOf(reasoning);
    const G1=topGroupOf(reasoning);
    const byShare=groupsByShare(reasoning);
    const G2=byShare.find(g=>g!==G1)||G1;
    const rank=rankGroups(reasoning);
    const hint=el?INDUSTRY[el].split("·"):[];
    const clashes=g=>[...(PATH_OPTION[g]||[""])[0].split(/[·\s]/),...(SIDE_OPTION[g]||[""])[1].split(/[·\s]/)].some(w=>w&&hint.includes(w));
    const worst=[...rank].reverse().find(g=>!clashes(g))||rank[rank.length-1];
    const v=verdictOf(reasoning);
    const top=godRows(reasoning)[0];
    const out=[lead(isT)+(ANSWER_HOOK[s.concern]?.[s.key]||"결론부터 말할게.")];
    const why1="이렇게 나온 건 네 사주에 제일 필요한 게 "+GROUP_NAME[N]+" 쪽이라서야.";
    if(k==="money/side"){
      out.push("<b>1순위 — "+SIDE_OPTION[rank[0]][0]+"</b>. "+withJosa(SIDE_OPTION[rank[0]][1],"이야","야")+"."+(el?" 분야는 "+INDUSTRY[el]+" 쪽이면 더 잘 붙어.":"")+" "+why1);
      out.push("<b>2순위 — "+SIDE_OPTION[rank[1]][0]+"</b>. "+withJosa(SIDE_OPTION[rank[1]][1],"이야","야")+".");
      out.push(signalWorkLine(sig));
      out.push("<b>피할 것 — "+SIDE_AVOID[worst]+"</b>. 네 사주에선 들인 힘보다 새는 게 더 커.");
      out.push(whenLine(reasoning,"시작하기 좋은 때"));
    } else if(k==="money/income"){
      out.push("<b>1순위 — "+INCOME_OPTION[rank[0]][0]+"</b>. "+withJosa(INCOME_OPTION[rank[0]][1],"이야","야")+". "+why1);
      out.push("<b>2순위 — "+INCOME_OPTION[rank[1]][0]+"</b>. "+withJosa(INCOME_OPTION[rank[1]][1],"이야","야")+".");
      out.push("<b>효과 적은 길 — "+INCOME_AVOID[worst]+"</b>. 이건 네 사주에서 힘만 들고 수입은 잘 안 늘어.");
      out.push(whenLine(reasoning,"수입 얘기를 꺼내기 좋은 때"));
    } else if(k==="money/saving"){
      out.push("<b>1순위 구멍 — "+LEAK_NAME[G1][0]+"</b>. "+LEAK_NAME[G1][1]+"이야. 네 사주에서 제일 큰 힘이 이쪽이라 돈도 제일 먼저 여기로 가.");
      out.push("<b>2순위 구멍 — "+LEAK_NAME[G2][0]+"</b>. "+LEAK_NAME[G2][1]+"이야.");
      out.push("<b>너한테 맞는 저축 방식</b> — "+SAVE_STYLE[N]+"이 제일 오래 가.");
      out.push(whenLine(reasoning,"모으기 시작하기 좋은 때"));
    } else if(k==="money/flow"){
      out.push(whenLine(reasoning,"돈이 잘 도는 때"));
      out.push(cautionLine(reasoning,"조심할 때"));
      out.push("<b>네 돈이 들어오는 길</b> — "+FLOW_WAY[G1]+"이 중심이야. 좋은 때엔 이 길을 넓히고, 조심할 때엔 나가는 돈부터 줄여.");
    } else if(k==="career/exam"){
      out.push(whenLine(reasoning,"실력이 잘 나오는 때"));
      out.push(cautionLine(reasoning,"긴장이 커지는 때"));
      out.push("<b>합격을 가르는 한 가지 — "+EXAM_KEY[G1]+"</b>. 공부량보다 이게 점수를 바꿔.");
    } else if(k==="career/jobsearch"){
      out.push("<b>1순위 — "+JOB_OPTION[rank[0]][0]+"</b>. "+withJosa(JOB_OPTION[rank[0]][1],"이야","야")+". "+why1);
      out.push("<b>2순위 — "+JOB_OPTION[rank[1]][0]+"</b>. "+withJosa(JOB_OPTION[rank[1]][1],"이야","야")+".");
      out.push(whenLine(reasoning,"지원하기 좋은 때"));
      out.push(cautionLine(reasoning,"결과가 늦게 오는 때"));
    } else if(k==="career/move"){
      const m=momentumOf(reasoning);
      const good=goodRows(reasoning);
      out.push("<b>"+(m>0?"지금은 움직여도 되는 쪽이야":m<0?"지금 바로 나가기보다 준비해서 움직이는 쪽이 유리해":"지금은 반반이야. 조건이 확실해질 때 움직여")+"</b>. "+(m>0?"가까운 달 흐름이 너를 받쳐줘.":m<0?"가까운 달에 부담 신호가 먼저 잡혀.":"가까운 달에 도움과 부담이 섞여 있어."));
      out.push(MOVE_FIT[G1]);
      out.push("<b>옮긴다면 이런 곳</b> — "+JOB_OPTION[N][1]+".");
      if(good.length) out.push(whenLine(reasoning,"움직이기 좋은 때"));
    } else if(k==="career/current"){
      out.push("<b>1순위 — "+CURRENT_KEY[G1]+"</b>. 네 사주에서 제일 큰 힘이 이쪽이라, 여기만 바꿔도 평가가 달라져.");
      out.push("<b>힘이 되는 사람</b> — "+HELPER[N]+". 네 사주에 부족한 걸 채워주는 쪽이야.");
      out.push(whenLine(reasoning,"인정받기 좋은 때"));
      out.push(cautionLine(reasoning,"평가가 흔들리기 쉬운 때"));
    } else if(k==="love/crush"){
      const m=momentumOf(reasoning);
      const good=goodRows(reasoning);
      out.push("<b>"+(m>=0?"먼저 움직여도 되는 쪽이야":"지금보다 조금 뒤에 움직이는 쪽이 유리해")+"</b>. "+(good.length?"움직이기 좋은 때는 "+goodRuns(reasoning).map(run=>runText(reasoning,run)).join(", 그리고 ")+"야.":"가까운 달은 고르게 가서, 준비되면 움직여도 돼."));
      out.push("<b>먼저 해볼 것 — "+CRUSH_MOVE[G1]+"</b>.");
      const charm=(sig?.sinsal||[]).find(x=>["도화","홍염"].includes(x.name));
      if(charm) out.push(withJosa(charm.name,"이","가")+" 있어서 네가 먼저 다가가도 부담스럽게 느끼지 않는 편이야.");
      out.push("<b>상대 마음</b> — 상대 마음은 상대 사주가 있어야 정확히 보여. 여기선 네 쪽에서 되는 방법만 볼게.");
    } else if(k==="love/relationship"){
      const clash=dayRelation(reasoning,sig,["clash","wonjin"]);
      out.push("<b>"+(dayCombine(reasoning)?"한번 맺은 인연을 오래 끌고 가는 사주야":clash?"큰 싸움 한 번이 고비가 되는 사주야":"큰 사건보다 작은 서운함 관리가 관건인 사주야")+"</b>. "+(dayCombine(reasoning)?"배우자 자리가 다른 자리와 묶여 있어서, 쉽게 놓지 않아.":clash?"배우자 자리가 부딪히는 배치라, 생활 문제로 크게 싸운 뒤를 조심해야 해.":"배우자 자리가 조용해서, 쌓이는 서운함만 풀면 오래 가."));
      out.push(whenLine(reasoning,"관계가 편해지는 때"));
      out.push(cautionLine(reasoning,"부딪히기 쉬운 때"));
    } else if(k==="love/breakup"){
      const sg=spouseGroupOf(data);
      let score=0; const why=[];
      if(dayCombine(reasoning)){ score++; why.push("배우자 자리가 묶여 있어서 한번 맺은 인연이 쉽게 안 끊겨"); }
      if(sg&&groupShare(reasoning,sg)>=25){ score++; why.push("연인을 뜻하는 기운이 커서 인연이 다시 닿을 여지가 있어"); }
      if(sg&&thisYearGroup(reasoning)===sg){ score++; why.push("올해 연인을 뜻하는 기운이 들어와"); }
      if(dayRelation(reasoning,sig,["clash"])){ score--; why.push("배우자 자리가 부딪히는 배치라 같은 이유로 또 헤어지기 쉬워"); }
      if(v==="신강"&&G1==="self"){ score--; why.push("자존심이 강해서 먼저 연락하기가 어려워"); }
      out.push("<b>"+(score>=2?"다시 이어질 여지가 있는 편이야":score===1?"반반이야":"다시 만나기보다 정리하는 쪽이 네 사주엔 더 편한 편이야")+"</b>. "+(why.length?why.join(". ")+".":"사주에서 재회 쪽으로 강하게 끄는 신호도, 막는 신호도 두드러지지 않아."));
      out.push(whenLine(reasoning,"연락이 닿기 쉬운 때"));
      out.push("<b>한 가지만 기억해</b> — 상대 사주까지 봐야 확실해져. 여기선 네 쪽 사주로 보이는 것만 말했어.");
    } else if(k==="love/new"){
      const dz=dayBranchGod(reasoning);
      out.push(whenLine(reasoning,"인연이 들어오기 좋은 때"));
      out.push("<b>만나기 좋은 곳</b> — "+(el?MEET_PLACE[el]:"지인 소개나 오래 다닌 모임")+(sinsalOf(sig,"역마")?", 그리고 여행이나 이동 중":"")+(sinsalOf(sig,"도화")?", 그리고 사람이 많이 모이는 자리":"")+".");
      if(PARTNER_SHORT[dz]) out.push("<b>잘 맞는 사람</b> — "+PARTNER_SHORT[dz]+". 배우자 자리에 "+withJosa(dz,"이","가")+" 있어서야.");
    } else if(k==="path/lost"){
      out.push("<b>1순위 — "+PATH_OPTION[rank[0]][0]+"</b>. "+PATH_OPTION[rank[0]][1]+"이 맞아."+(el?" 그중에서도 "+INDUSTRY[el]+" 쪽이면 더 잘 붙어.":"")+" "+why1);
      out.push("<b>2순위 — "+PATH_OPTION[rank[1]][0]+"</b>. "+PATH_OPTION[rank[1]][1]+"도 잘 맞아.");
      out.push(signalWorkLine(sig));
      out.push("<b>피할 쪽 — "+PATH_OPTION[worst][0]+"</b>. 네 사주에선 힘이 가장 안 붙는 쪽이야.");
    } else if(k==="path/current"){
      out.push("<b>지금 길이 "+PATH_OPTION[rank[0]][0]+"나 "+PATH_OPTION[rank[1]][0]+"에 가까우면 맞는 길이야</b>. 네 사주에서 힘이 제일 잘 붙는 두 방향이거든.");
      out.push("<b>계속 가도 되는 신호</b> — "+PATH_KEEP[G1]+" 계속 가도 돼.");
      out.push("<b>바꿔야 하는 신호</b> — "+PATH_CHANGE[G1]+", 그땐 방향을 다시 봐야 해.");
      out.push(whenLine(reasoning,"판단하기 좋은 때"));
    } else if(k==="path/switch"){
      const m=momentumOf(reasoning);
      out.push("<b>"+(m>0?"바꿔도 되는 쪽이야":m<0?"바로 바꾸기보다 준비하고 옮기는 쪽이 유리해":"지금은 반반이야. 작게 시험해본 뒤 옮겨")+"</b>. "+(m>0?"가까운 달 흐름이 새 시작을 받쳐줘.":m<0?"가까운 달에 부담 신호가 먼저 잡혀.":"가까운 달에 도움과 부담이 섞여 있어."));
      out.push("<b>옮긴다면 1순위 — "+PATH_OPTION[rank[0]][0]+"</b>, <b>2순위 — "+PATH_OPTION[rank[1]][0]+"</b>."+(el?" 분야로는 "+INDUSTRY[el]+" 쪽이 잘 맞아.":""));
      out.push(whenLine(reasoning,"옮기기 좋은 때"));
    } else if(k==="path/strength"){
      out.push("<b>1순위 강점 — "+STRENGTH_NAME[G1]+"</b>. 네 사주에서 제일 큰 힘이야.");
      out.push("<b>2순위 강점 — "+STRENGTH_NAME[G2]+"</b>.");
      const W=byShare[byShare.length-1];
      out.push("<b>상대적으로 약한 쪽 — "+STRENGTH_NAME[W]+"</b>. 이건 혼자 키우기보다 잘하는 사람과 같이 하는 게 빨라.");
    } else if(s.concern==="people"){
      const pos={friend:[],work:["month"],family:["year","month"],distance:["year","month","day","hour"]}[s.key]||[];
      const rel=relationRows(reasoning,sig).find(x=>pos.includes(x.aPos)||pos.includes(x.bPos))||null;
      if(s.key==="distance"){
        const hard=rel&&["clash","wonjin","punishment"].includes(rel.type);
        out.push("<b>"+(hard?"거리를 두는 쪽이 네 마음엔 더 편한 편이야":G1==="self"?"끊기보다 만나는 횟수만 줄이는 쪽이 맞아":G1==="officer"?"도리 때문에 붙잡고 있는 거라면 거리를 둬도 돼":"한 번은 할 말을 하고, 반응을 보고 정하는 쪽이 맞아")+"</b>.");
      } else {
        const line=(s.key==="work"?WORK_LINE:s.key==="family"?FAMILY_LINE:PEOPLE_LINE)[G1];
        out.push("<b>이 관계에서 네가 지킬 선 — "+line+"</b>. 네 사주에서 제일 큰 힘이 이쪽이라, 여기서 무너지면 지쳐.");
        if(s.key==="friend"){
          const sh=groupShare(reasoning,"self");
          out.push("<b>친구 자리</b> — 친구를 뜻하는 비겁이 "+sh+"%"+(sh>=25?"로 커서, 친구와 얽히는 일이 많고 비교도 생기기 쉬운 편이야.":sh>=10?"로 적당해서, 넓게보다 맞는 몇 명과 오래 가는 편이야.":"로 적어서, 친구가 많진 않아도 한번 믿으면 깊게 가는 편이야."));
        }
      }
      if(rel) out.push("<b>원래 부딪히기 쉬운 배치야</b> — "+relationCore(reasoning,rel)+". 네 잘못만은 아니야.");
      out.push(whenLine(reasoning,"관계가 풀리기 좋은 때"));
    } else {
      if(s.key==="burnout") out.push("<b>"+(v==="신강"?"지금은 쌓인 걸 빼낼 때야":"지금은 더 버틸 때가 아니라 채울 때야")+"</b>. 지친 이유 1순위는 "+TIRE_NAME[G1]+"이야.");
      else if(s.key==="overthink") out.push("<b>1순위 — "+THINK_STOP[G1]+"</b>. <b>2순위 — "+THINK_STOP[G2]+"</b>.");
      else if(s.key==="low") out.push("<b>첫걸음 — "+LOW_STEP[G1]+"</b>. 그다음은 "+LOW_STEP[N]+".");
      else out.push("<b>회복 1순위 — "+(el?QUICK_RECOVER[el]:"같은 시간에 자고 먹기")+"</b>. 네 사주에 제일 필요한 기운을 채우는 방법이야.");
      if(s.key!=="recover"&&el) out.push("<b>제일 빨리 효과 보는 것</b> — "+QUICK_RECOVER[el]+".");
      out.push(whenLine(reasoning,s.key==="recover"?"회복이 붙기 시작하는 때":"나아지기 시작하는 때"));
    }
    out.push(detailsBlock([
      "순위 기준: 네 사주에 제일 필요한 기운은 "+(el?elementName(el)+" 쪽 ":"")+GROUP_NAME[N]+", 가장 큰 힘은 "+(top?top.god:"고르게 나뉜 힘")+", 너 자신은 "+strengthPlain(reasoning)+"이야.",
    ]));
    return out.filter(Boolean).join("<br><br>");
  }

  function formatMonth(row,today){
    if(!row) return "뚜렷하게 짚을 달 없음";
    const start=String(row.startYmd||"");
    const end=String(row.endYmd||"");
    const todayText=String(today||"");
    const endMonth=Number(end.slice(5,7))||row.endMonth;
    const endDay=Number(end.slice(8,10))||row.endDay;
    if(start&&todayText&&start<=todayText&&(!end||todayText<end)&&endMonth&&endDay){
      return "지금부터 "+endMonth+"월 "+endDay+"일 전까지";
    }
    const year=Number(start.slice(0,4))||row.startYear||row.year;
    const month=Number(start.slice(5,7))||row.startMonth;
    const day=Number(start.slice(8,10))||row.startDay;
    if(!month) return row.year?row.year+"년":(row.ganZhi||"해당 시기");
    const sameYear=todayText&&year===Number(todayText.slice(0,4));
    return (sameYear||!year?"":year+"년 ")+month+"월 "+(day?day+"일 ":"")+"무렵부터";
  }

  function monthGodText(row){
    const gz=String(row?.ganZhi||row?.layers?.wolun?.ganZhi||"");
    if(gz.length<2||!GAN_KR[gz[0]]) return "";
    const god=row?.sipsin||row?.layers?.wolun?.god||"";
    const name=GAN_KR[gz[0]]+(ZHI_KR[gz[1]]||"");
    return "(이 달 글자: "+name+(GOD_MEANING[god]?", "+god:"")+")";
  }

  function monthReason(reasoning,row,positive){
    const rows=positive ? (row?.layers?.wolun?.supportSignals||[]) : (row?.layers?.wolun?.cautionSignals||[]);
    const signal=rows.find(x=>x.severity==="major")||rows.find(x=>x.severity==="support")||rows[0]||null;
    const code=signal?.code||"";
    const center=centerGodOf(reasoning)||"사주 중심";
    if(positive){
      if(/generate|rescue/.test(code)) return "부족한 쪽을 채워주는 글자가 들어오는 달이야";
      if(/root-add|assist/.test(code)) return "너와 같은 기운이 보태지는 달이라 버티는 힘이 평소보다 붙어";
      if(/bridge|flow-unblock/.test(code)) return "평소 끊기던 연결을 이어주는 글자가 들어오는 달이야";
      if(/discharge/.test(code)) return "쌓인 생각을 말·결과로 빼기 쉬운 달이야";
      if(/control/.test(code)) return "흩어진 힘을 기준과 우선순위로 묶기 쉬운 달이야";
      if(/ziping-support/.test(code)) return "사주 중심인 "+withJosa(center,"을","를")+" 살려주는 글자가 들어오는 달이야";
      return "다른 달보다 도움이 되는 글자가 분명하게 겹쳐";
    }
    if(/root-clash/.test(code)) return "평소 버티게 해주던 뿌리를 직접 건드리는 글자가 들어와";
    if(/body-cost/.test(code)) return "약한 쪽에 부담을 더 얹는 글자가 들어와";
    if(/ziping-harm/.test(code)) return "사주 중심인 "+withJosa(center,"을","를")+" 흔드는 글자가 들어와";
    if(/over-support/.test(code)) return "이미 강한 쪽을 더 세게 만드는 글자가 들어와 한쪽으로 쏠리기 쉬워";
    return "다른 달보다 약한 지점을 건드리는 글자가 분명하게 겹쳐";
  }

  function compactTimingNote(reasoning,s,p,isT){
    const timing=reasoning?.timing||{};
    const today=timing.today||"";
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
      const reason=positive?monthReason(reasoning,row,true):caution?monthReason(reasoning,row,false):"mixed";
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
              ? "<b>결론</b> — 가까운 흐름에서 네 사주에 도움이 되는 달이 먼저 잡혀."
              : "<b>결론</b> — 가까운 흐름을 보면, 네 사주에 도움이 되는 달이 먼저 잡혀.")
          : (isT
              ? "<b>결론</b> — 가까운 흐름에서 네 사주의 약한 지점을 건드리는 달이 먼저 잡혀."
              : "<b>결론</b> — 가까운 흐름에는 네 사주의 약한 지점을 건드리는 달도 보여."))
      : (isT
          ? "<b>결론</b> — 가까운 18개월은 계산되지만 다른 달과 분명히 갈리는 달이 약해. 특정 달은 억지로 찍지 않을게."
          : "<b>결론</b> — 가까운 18개월 흐름은 다 봤는데, 다른 달과 확실히 갈리는 달이 약해. 그래서 언니도 그럴듯하게 날짜를 만들어 찍진 않을게.");

    const lines=uniqueHighlights.map(row=>{
      const when=formatMonth(row,today);
      const positive=["supportive","mild-support"].includes(row.class);
      const caution=["caution","mild-caution"].includes(row.class);
      const lead="<b>"+when+"</b> — ";
      const tail="";
      if(positive) return lead+monthReason(reasoning,row,true)+". "+timingRealityCheck(reasoning,s,row,true)+"."+tail;
      if(caution) return lead+monthReason(reasoning,row,false)+". "+timingRealityCheck(reasoning,s,row,false)+"."+tail;
      return lead+"도움과 주의가 같이 잡혀서 한쪽으로 강하게 단정하기 어려운 달이야."+tail;
    });

    if(pivot?.year){
      const reasons=pivot.pivotReasons||[];
      const gz=String(pivot.daeunGanZhi||"");
      const daeunName=gz.length>=2&&GAN_KR[gz[0]]?GAN_KR[gz[0]]+(ZHI_KR[gz[1]]||""):"";
      const daeunText=daeunName?"10년 단위 큰 흐름이 "+daeunName+roJosa(daeunName)+" 바뀌면서 ":"";
      const why=reasons.includes("major-flow-change")&&reasons.includes("direction-change")
        ?daeunText+"도움·주의 방향도 같이 돌아서는 때"
        :reasons.includes("major-flow-change")
          ?(daeunText||"몇 년 단위의 큰 흐름이 ")+"바탕이 바뀌는 때"
          :"앞선 해와 비교해 도움·주의 방향이 실제로 바뀌는 때";
      lines.push("<b>"+pivot.year+"년 전후</b> — "+why+"라, 장기적으로는 "+(CONCERN_WORD[s.concern]||"같은 고민")+"에서 맞는 방식도 달라질 수 있어. 여기서는 바뀌는 시점만 먼저 짚을게.");
    }

    if(!uniqueHighlights.length){
      const nowRow=(near.months||[])[0]||null;
      const dz=String(nowRow?.daeunGanZhi||""), sz=String(nowRow?.seyunGanZhi||nowRow?.seyounGanZhi||"");
      const dName=dz.length>=2&&GAN_KR[dz[0]]?GAN_KR[dz[0]]+(ZHI_KR[dz[1]]||""):"";
      const sName=sz.length>=2&&GAN_KR[sz[0]]?GAN_KR[sz[0]]+(ZHI_KR[sz[1]]||""):"";
      if(dName&&sName) lines.unshift("<b>지금 흐름</b> — 10년 단위 큰 흐름은 "+dName+", 올해 기운은 "+withJosa(sName,"이야","야")+". 이 두 흐름 위에서 특정 달만 두드러지게 갈리는 신호는 약하다는 뜻이야.");
    }
    const strip=monthStrip(reasoning);
    if(strip) lines.unshift(strip);
    lines.unshift(...yearLine(reasoning,s,isT));
    const criterion=DECISION_CRITERIA[s.concern]?.[s.key]||"실제로 바뀌는 행동이 생기는지 봐";
    lines.push("<b>지금 비교 기준</b> — "+criterion+".");
    const label=row=>row?formatMonth(row,today):null;
    return {
      desc:[summary,...lines].join("<br><br>"),
      evidenceRuleIds,
      personalizationFacts:{
        firstDate:label(uniqueHighlights[0]||null),
        secondDate:label(uniqueHighlights[1]||null),
        firstClass:uniqueHighlights[0]?.class||null,
        secondClass:uniqueHighlights[1]?.class||null,
        pivotYear:pivot?.year||null,
        timingFingerprint:reasoning?.timingFingerprint||"",
      },
      meta:{
        firstDate:label(uniqueHighlights[0]||null),
        secondDate:label(uniqueHighlights[1]||null),
        firstBody:uniqueHighlights[0]?label(uniqueHighlights[0])+" "+(uniqueHighlights[0].class||""):"",
        secondBody:uniqueHighlights[1]?label(uniqueHighlights[1])+" "+(uniqueHighlights[1].class||""):"",
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

  // 유료 상품(전체판·궁합 등)이 NOTE와 같은 사주 사실·장면 문장을 쓰도록 한 사람 분의 사실 묶음을 만든다.
  // 유료상품 문장도 NOTE처럼 괄호 뜻풀이 없이 쓴다. 뜻이 필요한 곳은 상품 쪽에서 "~을 뜻하는 정관"처럼 문장으로 풀어 쓴다.
  function chartFactsForData(data){
    const prev=PLAIN_LABELS;
    PLAIN_LABELS=true;
    try { return chartFactsPlain(data); } finally { PLAIN_LABELS=prev; }
  }
  function chartFactsPlain(data){
    let reasoning=data?.noteDiagnosisV2?.reasoning||null;
    if(!reasoning&&typeof global.buildClassicalReasoningV1==="function"){
      try{ reasoning=global.buildClassicalReasoningV1(data||{}); }catch(_){ reasoning=null; }
    }
    if(!reasoning) return null;
    const top=godRows(reasoning)[0]||null;
    const verdict=verdictOf(reasoning);
    const dayEl=dayElementOf(reasoning);
    const ranking=reasoning.context?.elementRanking||[];
    const elementFact=(row)=>{
      if(!row?.element||!EL_KR[row.element]) return null;
      const group=groupOfElement(dayEl,row.element);
      return {el:row.element,kr:EL_KR[row.element],name:elementName(row.element),share:Math.round(Number(row.share||0)*100),group,groupLabel:groupLabel(group),groupMeaning:GROUP_MEANING[group]||""};
    };
    const weakest=elementFact(ranking[ranking.length-1]);
    const strongest=elementFact(ranking[0]);
    const st=synthesisFor(reasoning).mechanisms?.structure||{};
    const pressure=synthesisFor(reasoning).mechanisms?.drive?.pressureGroup||reasoning.integrated?.pressureGroup||"unknown";
    const sp=Number(reasoning.profile?.strength?.supportRatio);
    const bal=reasoning.profile?.balance||{};
    const shares={};
    for(const k of ["self","print","output","wealth","officer"]) shares[k]=groupShare(reasoning,k);
    const present=new Set(godRows(reasoning).map(r=>r.god));
    return {
      dm:dayMasterName(reasoning),
      dayPillar:pillarName(reasoning,"day"),
      dayElement:dayEl,
      dayElementPlain:EL_PLAIN[dayEl]||"",
      verdict,
      strengthPlain:strengthPlain(reasoning),
      supportPercent:Number.isFinite(sp)?Math.round(sp*100):null,
      top:top?{god:top.god,label:godLabel(top.god),meaning:GOD_MEANING[top.god]||"",group:top.group,share:godShare(reasoning,top.god),places:godPlaces(reasoning,top.god,2)}:null,
      headline:headlineOf(reasoning),
      coreScene:top?(CORE_SCENE[top.god]||""):"",
      strengthScene:STRENGTH_SCENE[verdict]||STRENGTH_SCENE.중화,
      shares,
      strongest,
      weakest,
      weakScene:weakest?(WEAK_SCENE[weakest.group]||""):"",
      pressureGroup:pressure,
      pressureLabel:GROUP_NAME[pressure]?groupLabel(pressure):"",
      pressureScene:HARM_SCENE[pressure]||"",
      center:centerSentence(reasoning),
      centerGod:centerGodOf(reasoning),
      season:seasonSentence(reasoning),
      root:rootSentence(reasoning),
      balance:EL_KR[bal.primary]?{el:bal.primary,name:elementName(bal.primary),group:groupOfElement(dayEl,bal.primary),groupLabel:groupLabel(groupOfElement(dayEl,bal.primary)),raw:Number(reasoning.profile?.elements?.raw?.[bal.primary]||0)}:null,
      bond:bondSentence(reasoning),
      relationRisk:relationRiskSentence(reasoning),
      hasClash:(reasoning.context?.clashes||[]).length>0,
      resolution:patternResolutionSentence(reasoning),
      supportGods:[...new Set([...(st.rescueGods||[]),...(st.helpfulGods||[]),...(st.structuralRescueGods||[]),...(st.structuralSupportGods||[])])],
      harmGods:[...new Set([...(st.harmfulGods||[]),...(st.structuralHarmGods||[])])],
      presentGods:[...present],
      concernLine:(concern,group)=>plainSentence(CONCERN_GROUP_LINES[concern]?.[group||pressure]||CONCERN_GROUP_LINES[concern]?.unknown||""),
      fitScene:(god)=>FIT_SCENE[god]||"",
      godLabel:(god)=>String(god||""),
      godMeaning:(god)=>GOD_MEANING[god]||"",
      godPlaces:(god)=>godPlaces(reasoning,god,1),
      godShare:(god)=>godShare(reasoning,god),
      groupName:(group)=>GROUP_NAME[group]||"",
      groupLabel:(group)=>GROUP_NAME[group]||"여러 힘",
      groupMeaning:(group)=>GROUP_MEANING[group]||"",
      formatMonth:(row)=>formatMonth(row,reasoning.timing?.today||""),
      monthReason:(row,positive)=>monthReason(reasoning,row,positive),
      today:reasoning.timing?.today||"",
    };
  }

  // 사용자가 NOTE의 십신 용어를 눌렀을 때 "내 사주에서는" 설명을 채운다.
  function describeTermForData(data,term){
    const reasoning=data?.noteDiagnosisV2?.reasoning;
    if(!reasoning||!term) return "";
    const row=godRows(reasoning).find(x=>x.god===term);
    if(row){
      return "네 사주에서 "+withJosa(term,"은","는")+" "+godPlaces(reasoning,term,2)+"에 있고, 일간을 뺀 나머지 힘의 "+godShare(reasoning,term)+"%야.";
    }
    if(GOD_MEANING[term]) return "네 사주에는 "+withJosa(term,"이","가")+" 없어.";
    if(term==="일간") return "네 일간은 "+pillarName(reasoning,"day")+"의 윗글자 "+withJosa(dayMasterName(reasoning),"이야","야")+".";
    const sig=signalsOf(reasoning);
    if(term==="일주"&&sig?.ilju?.name) return "네 일주는 "+sig.ilju.name+"("+sig.ilju.tag+")야.";
    if(term==="12운성"&&sig?.dayStage) return "네 일간은 일주 아랫글자에서 ‘"+sig.dayStage+"’ 단계야. "+sig.dayStageScene;
    const hit=(sig?.sinsal||[]).find(x=>x.name===term);
    if(hit) return "네 사주에서는 "+hit.positions.map(p=>PILLAR_KR[p]).join("·")+"에 있어.";
    if(term==="공망"&&sig?.gongmang) return "네 공망 글자는 "+sig.gongmang.branchesKr.join("·")+(sig.gongmang.positions.length?"이고, "+sig.gongmang.positions.map(p=>PILLAR_KR[p]).join("·")+"에 걸려 있어.":"인데, 네 사주 다른 자리에는 걸려 있지 않아.");
    if(term==="원진"&&sig?.wonjin) return sig.wonjin.positions.length?"네 사주에서는 일주와 "+sig.wonjin.positions.map(p=>PILLAR_KR[p]).join("·")+" 사이에 있어.":"네 사주에는 일주와 걸린 원진이 없어.";
    if(["도화","역마","화개","천을귀인","문창귀인","홍염","양인","괴강","백호"].includes(term)) return "네 사주에는 "+withJosa(term,"이","가")+" 없어.";
    return "";
  }

  const NOTE_BADGES=["핵심","질문에 대한 답","왜 그런지","어떻게 할지","가까운 흐름","조심할 것","이번 주 할 것"];
  function badgeFor(concern,idx){
    return NOTE_BADGES[idx]||"핵심";
  }

  function titleFor(s,idx,isT,profile){
    if(idx===0){
      const name=profile?.iljuName||"";
      const head=profile?.headline||"";
      if(name&&head) return name+" · "+head;
      return (name||s.label)+" — 네 사주에서 제일 먼저 보이는 모습";
    }
    if(idx===1) return ANSWER_TITLE[s.concern]?.[s.key]||"질문에 대한 답";
    if(idx===2) return CAUSE_TITLE[s.concern]?.[s.key]||"왜 그런지";
    if(idx===3) return FIX_TITLE[s.concern]?.[s.key]||"어떻게 할지";
    if(idx===4){
      const rows={money:"올해와 가까운 달의 돈 흐름",career:"올해와 가까운 달의 일 흐름",love:"올해와 가까운 달의 연애 흐름",path:"올해와 가까운 달의 진로 흐름",people:"올해와 가까운 달의 관계 흐름",mental:"올해와 가까운 달의 회복 흐름"};
      return rows[s.concern]||"올해와 가까운 달의 흐름";
    }
    if(idx===5) return CAUTION_TITLE[s.concern]||"조심할 것";
    return "이번 주에 해볼 것 하나";
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
    PLAIN_LABELS=true;
    try { return renderConcernNotesV2Inner(data, mode); } finally { PLAIN_LABELS=false; }
  }

  function renderConcernNotesV2Inner(data, mode) {
    data=data||{};
    const isT=mode==="T";
    const d=buildConcernDiagnosisV2(data);
    const r=d.reasoning;
    const s=d.situation;
    // NOTE 본문은 고민별 미리 작성된 trigger/reaction/cost/keep/cut/place를 읽지 않는다.
    // 고민 선택값은 같은 명리 사실을 어느 현실 영역으로 번역할지만 정한다.
    const sig=signalsOf(r);
    const p={label:s.label,topGod:(r.synthesis?.tenGodEvidence||[])[0]?.god||"",headline:headlineOf(r),iljuName:sig?.ilju?.name||""};
    const timing=compactTimingNote(r,s,p,isT);
    const nowRow=(r.timing?.nearMonths||[])[0]||null;
    const signalFacts={ilju:sig?.ilju?.key||null,dayStage:sig?.dayStage||null,sinsal:(sig?.sinsal||[]).map(x=>x.name),gongmang:sig?.gongmang?.positions||[],wonjin:sig?.wonjin?.positions||[]};
    const spec=[
      {desc:noteCoreV6(r,s,sig,isT),role:"core",facts:{...personalizationFactsForRole(r,"core",s),...signalFacts}},
      {desc:noteAnswerV7(r,s,sig,data,isT),role:"fit",facts:{answerRank:rankGroups(r),needGroup:needGroupOf(r),bestMonths:goodRows(r).map(x=>x.startYmd),momentum:momentumOf(r),dayBranchGod:dayBranchGod(r),gender:data.gender||null}},
      {desc:noteCauseV6(r,s,sig,data,isT),role:"pattern",facts:{...personalizationFactsForRole(r,"pattern",s),causeGroup:topGroupOf(r)}},
      {desc:noteHowV7(r,s,sig,data,isT),role:"fit",facts:{...personalizationFactsForRole(r,"fit",s),needGroup:needGroupOf(r),needElement:prescriptionElement(r)}},
      {desc:timing.desc,role:"timing",facts:timing.personalizationFacts||{},timing:true},
      {desc:noteCautionV6(r,s,sig,isT),role:"caution",facts:{...personalizationFactsForRole(r,"caution",s),burdenGroup:burdenGroupOf(r),relations:relationRows(r,sig).map(x=>x.type)}},
      {desc:noteActionV6(r,s,sig,isT,nowRow),role:"core",facts:{metric:s.metric,needElement:prescriptionElement(r),nowClass:nowRow?.class||null}},
    ];
    const notes=spec.map((x,idx)=>{
      const note={
        badge:badgeFor(s.concern,idx),
        title:titleFor(s,idx,isT,p),
        desc:x.desc,
        checklist:"",
        __evidenceRuleIds:x.timing?[...new Set([...evidenceIdsForRole(r,"timing"),...(timing.evidenceRuleIds||[])])]:evidenceIdsForRole(r,x.role),
        __personalizationFacts:x.facts,
      };
      if(x.timing) note.__timingQA=timing.meta;
      return note;
    });

    // 노트 번호 → 내부 명리 근거(claim) 번호. 7번(이번 주 할 것)은 행동 제안이라 따로 묶지 않는다.
    const claimMap=[0,4,1,3,5,2,null];
    (r.claims||[]).forEach(claim=>{
      if(claim){
        claim.userNoteIndex=null;
        if(Object.prototype.hasOwnProperty.call(claim,"noteSentence")) delete claim.noteSentence;
      }
    });
    notes.forEach((note,idx)=>{
      note.themeNum=String(idx+1).padStart(2,"0");
      const claim=claimMap[idx]===null?null:r.claims?.[claimMap[idx]];
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
    const semanticRows=notes.map((note,index)=>({noteNum:index+1,facts:note.__personalizationFacts||{}}));
    const semanticCovered=semanticRows.filter(row=>Object.values(row.facts||{}).some(v=>
      Array.isArray(v)?v.length>0:(v!==null&&v!==undefined&&v!==""&&v!==false&&v!==0)
    )).length;
    const audit={
      version:VERSION,
      engine:"classical-causal-full-evidence",
      fingerprint:r.structureFingerprint+"|"+s.concern+"|"+s.key,
      genericClusterDependency:false,
      genericSituationDependency:false,
      behaviorTemplateDependency:false,
      behaviorTemplateFieldsUsed:[],
      structureFingerprint:r.structureFingerprint,
      timingFingerprint:r.timingFingerprint,
      synthesisFingerprint:r.synthesis?.fingerprint||"",
      situation:{concern:s.concern,key:s.key},
      noteCount:notes.length,
      outputClaimMap:claimMap.map((claimIndex,noteIndex)=>claimIndex===null?null:({noteNum:noteIndex+1,claimNum:claimIndex+1})).filter(Boolean),
      noteEvidence:notes.map((note,index)=>({noteNum:index+1,ruleIds:note.__evidenceRuleIds||[]})),
      semanticEvidence:semanticRows,
      semanticCoverage:{
        noteCountWithFacts:semanticCovered,
        totalNotes:notes.length,
        coverageRate:notes.length?Math.round((semanticCovered/notes.length)*1000)/1000:1,
      },
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
  global.__CONCERN_NOTE_ENGINE_V2__={version:VERSION,situations:SITUATIONS,describeTerm:describeTermForData,facts:chartFactsForData};

  const legacy=global.generateConcernNotes;
  const wrapped=function(data,mode){
    return renderConcernNotesV2(data||{},mode||"F");
  };
  wrapped.__noteV2Wrapped=true;
  wrapped.__classicalCausal=true;
  wrapped.__legacyBase=legacy;
  global.generateConcernNotes=wrapped;
})(globalThis);
