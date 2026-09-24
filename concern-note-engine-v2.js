(function (global) {
  "use strict";

  const VERSION = "5.3.0";
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
  function elementName(el){ return EL_KR[el] ? EL_KR[el]+"("+EL_PLAIN[el]+")" : ""; }
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
  function groupLabel(group){ return GROUP_NAME[group] ? GROUP_NAME[group]+"("+GROUP_MEANING[group]+")" : "여러 힘"; }
  function godLabel(god){ return GOD_MEANING[god] ? god+"("+GOD_MEANING[god]+")" : String(god||""); }
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
    return "태어난 달("+pillarName(reasoning,"month")+"의 "+ZHI_KR[monthZhi]+")의 중심 기운은 "+EL_KR[el]+"이고, "+
      dm+"에게 "+EL_KR[el]+josaSuffix(EL_KR[el],"은","는")+" "+groupLabelJ(group,"이라","라")+" 계절이 너를 "+
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
      return "태어난 달 "+monthZhi+"의 중심 기운이 너와 같은 "+EL_KR[dayElementOf(reasoning)]+"라서, 내 힘 자체가 이 사주의 중심이야("+name+").";
    }
    const basis=s.basisGan;
    const visible=(reasoning?.context?.godOccurrences||[]).find(o=>o?.visible&&o.gan===basis&&o.pillar!=="day");
    if(s.touchul&&visible){
      const where=occurrenceText(reasoning,visible);
      return "태어난 달 "+monthZhi+"의 중심 글자가 "+where+roJosa(where)+" 그대로 드러나 있어서, 이 사주의 중심은 "+withJosa(god,"이야","야")+"("+name+").";
    }
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
    return "<b>약한 고리</b> — 가장 약한 기운은 "+elementName(el)+josaSuffix(EL_KR[el],"이야","야")+"(겉 글자 "+raw+"개, 실제 비중 "+share+"%). "+
      "너한텐 "+EL_KR[el]+josaSuffix(EL_KR[el],"이","가")+" "+groupLabelJ(group,"이라","라")+", "+withJosa(GROUP_WEAK_STEP[group],"이","가")+" 약해지기 쉬워.";
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
      return pillarName(reasoning,clash.aPos)+"의 "+a+josaSuffix(a,"과","와")+" "+pillarName(reasoning,clash.bPos)+"의 "+b+josaSuffix(b,"이","가")+" 정면으로 부딪히는 관계(충)라, "+
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
      return pillarName(reasoning,x.aPos)+"의 "+a+josaSuffix(a,"과","와")+" "+pillarName(reasoning,x.bPos)+"의 "+b+"처럼 아랫글자끼리 불편하게 걸리는 관계("+x.label+")도 있지만, 이것만으로 나쁘다고 보지 않고 다른 힘과 같이 봐.";
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

  function noteOneDesc(reasoning,s,p,isT){
    const top=godRows(reasoning)[0];
    const dm=dayMasterName(reasoning);
    const verdict=verdictOf(reasoning);
    const strength=strengthPlain(reasoning);
    const scene=[top?CORE_SCENE[top.god]:"",STRENGTH_SCENE[verdict]||STRENGTH_SCENE.중화].filter(Boolean).join(" ");
    const conclusion=(isT?"<b>결론</b> — ":"<b>결론</b> — 언니가 딱 보니까 이거야. ")+scene;
    const why=top
      ? (isT?"<b>근거</b> — ":"<b>왜 그러냐면</b> — ")+"네 사주에서 <b>"+godLabel(top.god)+"</b>"+josaSuffix(top.god,"이","가")+" 힘의 "+godShare(reasoning,top.god)+"%로 가장 크고, 너 자신("+pillarName(reasoning,"day")+"의 "+dm+")은 "+strength+"이라서 그래."
      : "";
    const sp=Number(reasoning?.profile?.strength?.supportRatio);
    const ratio=Number.isFinite(sp)?Math.round(sp*100):null;
    const partner=top?godRows(reasoning).find(r=>r.group===top.group&&r.god!==top.god):null;
    const details=detailsBlock([
      "나: "+pillarName(reasoning,"day")+"의 윗글자 "+dm+"("+(EL_PLAIN[dayElementOf(reasoning)]||"")+"). 사주는 이 글자를 기준으로 나머지를 읽어.",
      top?"가장 큰 힘: "+top.god+" — "+godPlaces(reasoning,top.god,2)+"에 있고 "+godShare(reasoning,top.god)+"%"+(partner?", "+GROUP_NAME[top.group]+"("+GROUP_GODS[top.group]+") 합계 "+groupShare(reasoning,top.group)+"%":"")+".":"",
      centerSentence(reasoning),
      ratio!==null?"힘의 크기: 나를 돕는 힘 "+ratio+" : 빠져나가거나 누르는 힘 "+(100-ratio)+".":"",
      seasonSentence(reasoning),
      rootSentence(reasoning),
    ]);
    return [
      conclusion,
      why,
      lensScene(reasoning,s),
      guardSentence(reasoning,isT),
      details,
    ].filter(Boolean).join("<br><br>");
  }

  function noteTwoDesc(reasoning,s,p,isT){
    const scene=concernMechanismScene(reasoning,s);
    const d=synthesisFor(reasoning).mechanisms?.drive||{};
    const group=d.pressureGroup||reasoning?.integrated?.pressureGroup||"unknown";
    const concernLine=plainSentence(CONCERN_GROUP_LINES[s.concern]?.[group]||CONCERN_GROUP_LINES[s.concern]?.unknown||"");
    const conclusion=isT
      ? "<b>결론</b> — "+concernLine+" ‘"+s.label+"’에서 반복이 갈리는 첫 지점은 <b>"+scene+"</b>이야."
      : "<b>결론</b> — "+concernLine+" ‘"+s.label+"’에서도 네 반복은 마지막 결과보다 <b>"+scene+"</b>에서 먼저 갈려.";
    const ranking=reasoning?.context?.elementRanking||[];
    const weakest=ranking[ranking.length-1];
    const weakGroup=weakest?.element?groupOfElement(dayElementOf(reasoning),weakest.element):"unknown";
    const weakScene=WEAK_SCENE[weakGroup]||"";
    let why="";
    if(GROUP_NAME[group]){
      const outShare=groupShare(reasoning,group);
      const supportShare=groupShare(reasoning,"self")+groupShare(reasoning,"print");
      const weakText=weakest?.element&&GROUP_NAME[weakGroup]
        ? " 그리고 가장 약한 기운인 "+elementName(weakest.element)+josaSuffix(EL_KR[weakest.element],"이","가")+" "+Math.round(Number(weakest.share||0)*100)+"%밖에 안 되는데, 너한텐 이게 "+GROUP_MEANING[weakGroup]+" 쪽이야."
        : "";
      why=(isT?"<b>근거</b> — ":"<b>왜 그러냐면</b> — ")+
        (outShare>supportShare
          ? GROUP_NAME[group]+"("+GROUP_MEANING[group]+")이 "+outShare+"%로, 너를 돕는 힘 "+supportShare+"%보다 커."
          : "너를 돕는 힘이 "+supportShare+"%로 충분하지만, 바깥 힘 중에선 "+GROUP_NAME[group]+"("+GROUP_MEANING[group]+")이 "+outShare+"%로 가장 커.")+weakText;
    }
    const details=detailsBlock([
      plainSentence(patternPressureSentence(reasoning))+" "+plainSentence(patternCapacitySentence(reasoning)),
      bondSentence(reasoning),
      weakLinkSentence(reasoning).replace(/<[^>]+>/g,""),
    ]);
    return [
      conclusion,
      weakScene,
      why,
      (isT?"<b>바꿀 것</b> — ":"<b>그래서</b> — ")+plainSentence(patternResolutionSentence(reasoning).replace(/^그래서\s*/,"")),
      details,
    ].filter(Boolean).join("<br><br>");
  }

  function noteThreeDesc(reasoning,s,p,isT){
    const rows=supportRows(reasoning,s);
    const first=rows[0];
    const rest=rows.slice(1);
    const restText=rest.map(x=>"<b>"+x.text+"</b>"+(x.god?"("+x.god+")":"")).join(" / ");
    const scene=first.god&&FIT_SCENE[first.god]?FIT_SCENE[first.god]:"";
    return [
      (isT?"<b>결론</b> — 맞는 조건 1순위는 <b>"+first.text+"</b>. ":"<b>결론</b> — 너한테 맞는 조건은 <b>"+first.text+"</b>이야. ")+scene,
      (isT?"<b>근거</b> — ":"<b>왜 그러냐면</b> — ")+first.why,
      rest.length?(isT?"추가 조건 — "+restText:"그다음은 "+restText+" 순서로 보면 돼."):"",
      detailsBlock([balanceSentence(reasoning).replace(/<[^>]+>/g,"")]),
    ].filter(Boolean).join("<br><br>");
  }

  function noteFourDesc(reasoning,s,p,isT){
    const rows=harmRows(reasoning,s);
    const first=rows[0];
    const rest=rows.slice(1);
    const drive=synthesisFor(reasoning).mechanisms?.drive||{};
    const sceneGroup=first.god?godGroup(first.god):(drive.pressureGroup||"unknown");
    const scene=HARM_SCENE[sceneGroup]||"";
    const conflict=(synthesisFor(reasoning).mechanisms?.adjustment?.conflicts||[])[0];
    const conflictLine=conflict?.god
      ? "사주 중심을 살리는 쪽("+conflict.god+")과 일간 "+withJosa(dayMasterName(reasoning),"이","가")+" 편한 쪽이 완전히 같지 않아서, 결과가 난다고 같은 방식을 계속 밀면 지치기 쉬워."
      : "";
    const criterion=cautionCriterionSentence(reasoning,s);
    return [
      (isT?"<b>결론</b> — 우선 경계할 조건은 <b>"+first.text+"</b>. ":"<b>결론</b> — <b>"+first.text+"</b>에 오래 있으면 넌 티 안 나게 지쳐. ")+scene,
      (isT?"<b>근거</b> — ":"<b>왜 그러냐면</b> — ")+first.evidence,
      rest.length
        ? (isT
          ?"추가 주의 — "+rest.map(x=>"<b>"+x.text+"</b>("+x.god+")").join(" / ")
          :"그리고 "+rest.map(x=>"<b>"+x.text+"</b>("+x.god+")").join(" / ")+"도 같이 봐.")
        :"",
      isT ? "<b>판단 기준</b> — "+criterion+"." : "<b>이것만 체크해</b> — "+criterion+".",
      detailsBlock([conflictLine,relationRiskSentence(reasoning)]),
    ].filter(Boolean).join("<br><br>");
  }

  // 시기 표기: 이미 시작한 달은 "지금부터 ~ 전까지", 올해가 아니면 연도를 붙인다.
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
      const godText=monthGodText(row);
      const lead="<b>"+when+"</b> — ";
      const tail=godText?" "+godText:"";
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
      lines.push("<b>"+pivot.year+"년 전후</b> — "+why+"라, 장기적으로는 같은 고민도 맞는 방식이 달라질 수 있어. 여기서는 바뀌는 시점만 먼저 짚을게.");
    }

    if(!uniqueHighlights.length){
      const nowRow=(near.months||[])[0]||null;
      const dz=String(nowRow?.daeunGanZhi||""), sz=String(nowRow?.seyunGanZhi||nowRow?.seyounGanZhi||"");
      const dName=dz.length>=2&&GAN_KR[dz[0]]?GAN_KR[dz[0]]+(ZHI_KR[dz[1]]||""):"";
      const sName=sz.length>=2&&GAN_KR[sz[0]]?GAN_KR[sz[0]]+(ZHI_KR[sz[1]]||""):"";
      if(dName&&sName) lines.unshift("<b>지금 흐름</b> — 10년 단위 큰 흐름은 "+dName+", 올해 기운은 "+withJosa(sName,"이야","야")+". 이 두 흐름 위에서 특정 달만 두드러지게 갈리는 신호는 약하다는 뜻이야.");
    }
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
  function chartFactsForData(data){
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
      godLabel:(god)=>godLabel(god),
      godPlaces:(god)=>godPlaces(reasoning,god,1),
      godShare:(god)=>godShare(reasoning,god),
      groupName:(group)=>GROUP_NAME[group]||"",
      groupLabel:(group)=>groupLabel(group),
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
    return "";
  }

  function badgeFor(concern,idx){
    return ["핵심","실제 장면","잘 맞는 조건","거를 신호","가까운 흐름"][idx]||"핵심";
  }

    function titleFor(s,idx,isT,profile){
    if(idx===0){
      const top=profile?.topGod;
      if(top) return (profile?.label||s.label)+" — "+(profile?.headline||withJosa(top,"이","가")+" 가장 큰 사주");
      return (profile?.label||s.label)+" — 네 사주에서 제일 먼저 보이는 답";
    }
    if(idx===1) return SCENE_TITLES[s.concern]?.[s.key]||"실제로 갈리는 장면";
    if(idx===2){
      const rows={money:"돈이 남는 조건",career:"잘 풀리는 일·공부 조건",love:"너랑 오래 맞는 사람·관계",path:"너한테 맞는 진로 조건",people:"남겨도 되는 사람·관계",mental:"회복이 붙는 조건"};
      return rows[s.concern]||"잘 맞는 조건";
    }
    if(idx===3){
      const rows={money:"돈에서 빨리 끊어야 할 신호",career:"일·공부에서 빨리 거를 신호",love:"연애에서 빨리 거를 신호",path:"진로에서 피해야 할 신호",people:"거리를 둬야 할 관계 신호",mental:"지금 더 지치게 하는 신호"};
      return rows[s.concern]||"빨리 거를 신호";
    }
    const rows={money:"가까운 돈 흐름에서 갈리는 때",career:"가까운 일·시험 흐름에서 갈리는 때",love:"가까운 연애 흐름에서 갈리는 때",path:"가까운 진로 흐름에서 갈리는 때",people:"가까운 관계 흐름에서 갈리는 때",mental:"가까운 회복 흐름에서 갈리는 때"};
    return rows[s.concern]||"가까운 흐름에서 갈리는 때";
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
    // NOTE 본문은 고민별 미리 작성된 trigger/reaction/cost/keep/cut/place를 읽지 않는다.
    // 고민 선택값은 같은 명리 사실을 어느 현실 영역으로 번역할지만 정한다.
    const p={label:s.label,topGod:(r.synthesis?.tenGodEvidence||[])[0]?.god||"",headline:headlineOf(r)};
    const timing=compactTimingNote(r,s,p,isT);
    const notes=[
      {
        badge:badgeFor(s.concern,0),
        title:titleFor(s,0,isT,p),
        desc:noteOneDesc(r,s,p,isT),
        checklist:"",
        __evidenceRuleIds:evidenceIdsForRole(r,"core"),
        __personalizationFacts:personalizationFactsForRole(r,"core",s),
      },
      {
        badge:badgeFor(s.concern,1),
        title:titleFor(s,1,isT,p),
        desc:noteTwoDesc(r,s,p,isT),
        checklist:"",
        __evidenceRuleIds:evidenceIdsForRole(r,"pattern"),
        __personalizationFacts:personalizationFactsForRole(r,"pattern",s),
      },
      {
        badge:badgeFor(s.concern,2),
        title:titleFor(s,2,isT,p),
        desc:noteThreeDesc(r,s,p,isT),
        checklist:"",
        __evidenceRuleIds:evidenceIdsForRole(r,"fit"),
        __personalizationFacts:personalizationFactsForRole(r,"fit",s),
      },
      {
        badge:badgeFor(s.concern,3),
        title:titleFor(s,3,isT,p),
        desc:noteFourDesc(r,s,p,isT),
        checklist:"",
        __evidenceRuleIds:evidenceIdsForRole(r,"caution"),
        __personalizationFacts:personalizationFactsForRole(r,"caution",s),
      },
      {
        badge:badgeFor(s.concern,4),
        title:titleFor(s,4,isT,p),
        desc:timing.desc,
        checklist:"",
        __timingQA:timing.meta,
        __evidenceRuleIds:[...new Set([...evidenceIdsForRole(r,"timing"),...(timing.evidenceRuleIds||[])])],
        __personalizationFacts:timing.personalizationFacts||{},
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
      outputClaimMap:claimMap.map((claimIndex,noteIndex)=>({noteNum:noteIndex+1,claimNum:claimIndex+1})),
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
