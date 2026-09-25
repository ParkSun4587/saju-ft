(function (global) {
  "use strict";

  const VERSION = "6.5.0";
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
      saving:{label:"돈이 잘 안 모여",object:"지출과 저축",cue:"돈이 들어와도 남는 금액을 만들기 위해 지출·저축 기준을 정해야 하는 순간",move:"돈이 제일 많이 새는 날 하나를 찾아서, 그날 쓸 돈의 한도를 미리 정해둬",metric:"7일 동안 계획 밖 지출과 그 이유를 적어보기"},
      income:{label:"수입을 더 늘리고 싶어",object:"수입과 보상",cue:"지금 수입을 늘리기 위해 단가·연봉·일의 조건을 조정해야 하는 순간",move:"지금 하는 일에서 잘한 것 하나를 숫자로 정리해서, 단가나 연봉 얘기를 직접 꺼내봐",metric:"수입을 늘릴 근거 하나와 바꿀 조건 하나를 적어보기"},
      side:{label:"부업·새 수입을 만들고 싶어",object:"새 수입원",cue:"부업이나 새 수입원을 실제 돈으로 시험해봐야 하는 순간",move:"팔 수 있는 것 하나를 골라 가격을 붙이고, 아는 사람 몇 명에게 먼저 보여줘",metric:"7일 안에 가격을 붙인 제안 하나를 실제로 보여주고 반응 확인하기"},
      flow:{label:"앞으로 돈 흐름이 궁금해",object:"앞으로의 돈 흐름",cue:"앞으로의 돈 흐름을 보면서 언제 어떤 행동을 할지 정해야 하는 순간",move:"돈이 잘 도는 달에 할 일 하나를 미리 정해두고, 그달이 오면 바로 해",metric:"다음 기회 구간에 바로 할 돈 행동 하나를 미리 정해두기"},
    },
    career: {
      exam:{label:"시험·합격이 궁금해",object:"시험과 합격",cue:"시험 준비에서 현재 수준과 합격 기준을 맞춰봐야 하는 순간",move:"모의고사를 풀고 틀린 이유만 따로 적어서, 공부법은 하나만 남겨",metric:"7일 동안 공부법은 고정하고 틀린 이유만 세 가지로 분류하기"},
      jobsearch:{label:"취업 준비 중이야",object:"취업 준비와 지원",cue:"준비한 걸 실제 지원이나 면접으로 보여줘야 하는 순간",move:"완벽해질 때까지 기다리지 말고, 지원서나 포트폴리오를 실제 사람에게 먼저 보여줘",metric:"지원·제출·모의면접 중 실제 반응을 받는 행동 2회"},
      move:{label:"이직·퇴사를 고민 중이야",object:"이직과 퇴사",cue:"지금 자리를 버틸지 옮길지 결론내야 하는 순간",move:"감정은 빼고, 다음 회사에서 절대 포기 못 할 조건 세 가지를 적어봐",metric:"이직 기준 3개를 숫자·조건으로 적고 현재 직장과 비교하기"},
      current:{label:"지금 자리에서 잘 풀리고 싶어",object:"현재 자리의 성장과 성과",cue:"지금 맡은 일에서 평가·역할·보상을 더 잘 연결하고 싶은 순간",move:"요즘 잘한 일 하나를 골라서, 역할이나 보상 얘기를 윗사람에게 직접 꺼내봐",metric:"잘한 일 하나와 원하는 변화 하나를 문장으로 정리해 실제로 요청하기"},
    },
    love: {
      crush:{label:"썸·짝사랑 중이야",object:"썸과 상대 마음",cue:"상대 마음이나 관계의 다음 단계를 확인하고 싶은 순간",move:"혼자 추측만 하지 말고, 가볍게 만나자는 말이나 질문 하나를 직접 던져봐",metric:"궁금한 점 하나를 질문·만남 제안 같은 실제 확인으로 바꾸기"},
      relationship:{label:"지금 연애 중이야",object:"현재 연애",cue:"연락·표현·약속에서 둘의 기준을 맞춰야 하는 순간",move:"연락·표현·약속 중에 서운했던 것 하나를 골라, 서로 원하는 기준을 말로 맞춰봐",metric:"연락·표현·약속 중 하나의 기준을 한 문장으로 맞춰보기"},
      breakup:{label:"헤어진 사람이 있어",object:"헤어진 사람과 남은 관계",cue:"헤어진 사람을 떠올리며 이 관계를 어떻게 받아들일지 고민되는 순간",move:"다시 만날지는 나중 문제고, 헤어진 진짜 이유와 지금 달라진 점부터 적어봐",metric:"이 관계를 다시 생각할 때 달라져야 할 조건 세 가지를 적기"},
      new:{label:"새로운 인연을 만나고 싶어",object:"새로운 인연 만들기",cue:"새로운 사람을 만나고 싶은데 어디서부터 움직일지 고르는 순간",move:"기다리지 말고, 소개나 모임처럼 새 사람을 만날 자리를 한 달에 한 번은 직접 만들어",metric:"소개·모임·약속 중 새 사람을 만날 접점 하나를 실제로 만들기"},
    },
    path: {
      lost:{label:"뭘 해야 할지 모르겠어",object:"진로 선택",cue:"무엇부터 시도해야 할지 방향을 잡기 어려운 순간",move:"제일 궁금한 분야 하나를 골라, 수업이나 체험처럼 두 시간이라도 직접 해봐",metric:"궁금한 방향 하나를 2시간 이상 실제 경험으로 바꿔보기"},
      current:{label:"지금 가는 길이 맞는지 궁금해",object:"현재 진로",cue:"지금 가는 길을 계속 이어가도 되는지 확인하고 싶은 순간",move:"지금 일에서 잘되는 순간과 지치는 순간을 일주일만 따로 적어봐",metric:"잘되는 장면 3개와 소모되는 장면 3개를 분리해서 기록하기"},
      switch:{label:"다른 분야로 바꾸고 싶어",object:"다른 분야로의 전환",cue:"지금 하던 걸 유지하면서 다른 분야를 알아보고 싶은 순간",move:"다 바꾸기 전에, 새 분야를 작은 수업이나 프로젝트로 먼저 해봐",metric:"새 분야를 작은 프로젝트·수업·체험 중 하나로 먼저 검증하기"},
      strength:{label:"내 적성·강점을 알고 싶어",object:"적성과 강점",cue:"내가 반복해서 잘하는 방식이 무엇인지 확인하고 싶은 순간",move:"남들이 너한테 자주 부탁하거나 칭찬하는 일 세 가지를 적어봐. 그 공통점이 네 강점이야",metric:"강점이 드러난 장면 3개에서 공통 행동 하나 뽑기"},
    },
    people: {
      friend:{label:"친구·지인 때문에 힘들어",object:"친구·지인 관계",cue:"친구·지인 관계에서 불편한 장면이 생겼을 때 어떻게 대응할지 정해야 하는 순간",move:"불편했던 것 하나를 가볍게 말해보고, 상대가 어떻게 받는지 봐",metric:"작은 경계 하나를 말하고 상대 반응을 그대로 기록하기"},
      work:{label:"직장 사람 때문에 힘들어",object:"직장 사람과의 관계",cue:"직장 사람 문제를 역할·업무·연락 기준으로 나눠봐야 하는 순간",move:"감정 얘기 대신, 업무 범위나 연락 시간 기준 하나를 문장으로 정해서 전해",metric:"업무 범위·기한·연락 기준 중 하나를 문장으로 고정하기"},
      family:{label:"가족과 자꾸 부딪혀",object:"가족과의 반복 갈등",cue:"가족과 부딪히는 장면이 반복될 때 내 대응 기준을 정해야 하는 순간",move:"상대를 바꾸려 하지 말고, 부딪히는 장면에서 네가 해줄 수 있는 선을 먼저 정해",metric:"최근 부딪힌 장면 하나에서 할 수 있는 범위와 어려운 범위를 한 문장씩 정하기"},
      distance:{label:"계속 볼지 거리를 둘지 고민이야",object:"관계를 계속 볼지 거리 둘지",cue:"계속 볼지 조금 거리를 둘지 아직 결론이 안 선 순간",move:"끊을지 말지 바로 정하지 말고, 연락이나 만남 횟수만 먼저 줄여보고 네 마음을 봐",metric:"연락·만남·도움 중 하나만 조절한 뒤 내 반응을 기록하기"},
    },
    mental: {
      burnout:{label:"번아웃이 온 것 같아",object:"번아웃",cue:"번아웃 같다고 느껴져 더 밀어붙일지 부담을 덜어낼지 정해야 하는 순간",move:"해야 할 일을 늘리기 전에, 이번 주 할 일 하나를 실제로 빼",metric:"7일 동안 해야 할 일 하나를 실제로 빼고 수면·피로 변화를 기록하기"},
      overthink:{label:"생각이 너무 많아",object:"생각 과다",cue:"같은 생각을 반복하면서 결론은 더 안 나는 순간",move:"생각거리 하나를 ‘지금 할 것·미룰 것·내 일 아님’ 셋 중 하나로 나눠",metric:"생각거리 하나를 행동·보류·내 일 아님 셋 중 하나로 분류하기"},
      low:{label:"아무것도 하기 싫어",object:"무기력",cue:"아무것도 하기 싫을 때 어디까지를 오늘 기준으로 잡을지 정해야 하는 순간",move:"성과 말고, 일어나는 시간이나 밥 먹는 시간 하나만 매일 같게 맞춰",metric:"기상·식사·걷기 중 하나만 같은 시간에 7일 고정하기"},
      recover:{label:"다시 컨디션을 찾고 싶어",object:"컨디션 회복",cue:"컨디션을 다시 찾기 위해 무엇부터 일정하게 만들지 정해야 하는 순간",move:"자는 시간·밥·걷기 중 하나를 골라서 매일 같은 시간에 반복해",metric:"활동량을 한꺼번에 크게 늘리지 않고 조금씩 조절하기"},
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
  const GROUP_PLAIN={self:"자존심과 내 기준",print:"생각과 신중함",output:"표현과 재주",wealth:"돈과 현실 계산",officer:"책임과 체면"};
  // 천을귀인이 걸린 자리를 "월주·시주" 대신 사람으로 말한다. 첫 자리 기준으로 한 쪽만 짚는다.
  function guiPeople(gui){
    const pos=(gui?.positions||[]).filter(p=>POS_PERSON[p]&&p!=="day");
    return pos.length?POS_PERSON[pos[0]]:"가까운 사람";
  }
  // 일·진로 고민에서는 필요한 힘을 일의 말로 쓴다("쉬고 회복하는 힘"을 채워주는 직장 같은 어색한 말을 막는다).
  const NEED_POWER_WORK={self:"내 기준을 지키며 버티는 힘",print:"배우며 실력을 쌓는 힘",output:"결과물을 만들어 보여주는 힘",wealth:"한 만큼 보상으로 챙기는 힘",officer:"역할과 기준이 분명한 틀"};
  const NEED_POWER={self:"내 기준을 지키며 버티는 힘",print:"쉬고 배우며 회복하는 힘",output:"생각을 말과 결과물로 꺼내는 힘",wealth:"애쓴 만큼 돈과 보상으로 챙기는 힘",officer:"기준과 기한을 세워 지키는 힘"};
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
  // 가장 약한 쪽은 다른 문장과 같은 기준(십신 비중)으로 고르고 같은 숫자를 쓴다. 오행 비중을 따로 쓰면 같은 힘이 3%·2%처럼 다르게 보인다.
  function weakestGroupOf(reasoning){
    return ["self","output","wealth","officer","print"].map(g=>({g,v:groupShare(reasoning,g)})).sort((a,b)=>a.v-b.v)[0];
  }
  function elementOfGroup(reasoning,group){
    const d=ELEMENT_ORDER.indexOf(dayElementOf(reasoning));
    const idx=["self","output","wealth","officer","print"].indexOf(group);
    return d<0||idx<0?"":ELEMENT_ORDER[(d+idx)%5];
  }
  function weakLinkSentence(reasoning){
    const weakest=weakestGroupOf(reasoning);
    const group=weakest?.g;
    const el=elementOfGroup(reasoning,group);
    if(!EL_KR[el]||!GROUP_WEAK_STEP[group]) return "";
    const raw=Number(reasoning?.profile?.elements?.raw?.[el]||0);
    return "<b>약한 고리</b> — 가장 약한 기운은 "+withJosa(elementName(el),"이야","야")+". 겉으로 드러난 글자는 "+raw+"개, 사주 기운으로는 "+weakest.v+"%야. "+
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
    const centerMeaning=GOD_MEANING[center]||"";
    const rows=gods.slice(0,3).map(g=>({
      god:g,
      text:godSpecificCondition(g,domain,"harm")||domain.harm[godGroup(g)]||domain.harm.unknown,
      evidence:evidence[g]
        ? godLabelJ(g,"이","가")+" "+godPlaces(reasoning,g,1)+"에 있어서, 과해지면 사주 중심인 "+withJosa(center,"을","를")+" 흔들 수 있어."
        : godLabelJ(g,"은","는")+" 네 사주에 없지만, 들어오면 사주 중심인 "+withJosa(center,"을","를")+" 흔드는 쪽이야.",
      // 화면에 보이는 이유: 자리 이름 없이 뜻으로만 쓴다.
      plain:(GOD_MEANING[g]?withJosa(GOD_MEANING[g],"을","를")+" 뜻하는 ":"")+withJosa(g,"이","가")+
        (evidence[g]?" 네 사주에 있어서, 이 힘이 커지면 ":" 네 사주엔 없지만, 이 기운이 들어오는 때엔 ")+
        (centerMeaning?"네 사주가 기대고 있는 "+centerMeaning+" 쪽이 흔들릴 수 있어.":"네 사주의 중심이 흔들릴 수 있어."),
    }));
    if(!rows.length){
      const drive=syn.mechanisms?.drive||{};
      const group=drive.pressureGroup||"unknown";
      const share=groupShare(reasoning,group);
      const absentHarm=(st.structuralHarmGods||[]).filter(g=>!evidence[g]);
      const meaning=GROUP_NAME[group]?withJosa(GROUP_MEANING[group],"을","를")+" 뜻하는 "+GROUP_NAME[group]:"";
      const text=GROUP_NAME[group]
        ? (drive.pressureOverload
          ? withJosa(meaning,"이","가")+" 이미 사주 기운의 "+share+"%인데 너 자신의 힘은 "+strengthPlain(reasoning)+"이라, 여기서 부담이 더 붙으면 네 힘보다 부담이 먼저 커져."
          : withJosa(meaning,"이","가")+" 사주 기운의 "+share+"%로 가장 큰 바깥 힘이라, 이쪽 일이 한꺼번에 늘어나는 환경은 조심하는 게 좋아.")
        : "흔드는 기운이 하나로 두드러지지 않아서, 가장 크게 부담을 주는 쪽을 조심할 기준으로 잡았어.";
      const extra=absentHarm.length?"원래 "+withJosa(center,"을","를")+" 깨는 글자는 "+absentHarm.join("·")+"인데 네 사주엔 없어서, 그보다는 부담이 쌓이는 쪽을 봤어.":"";
      rows.push({god:null,text:domain.harm[group]||domain.harm.unknown,evidence:text+(extra?" "+extra:""),plain:text,detail:extra});
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

  // ===== NOTE 6개 구성 =====
  // 1 핵심(너는 이런 사람) → 2 질문에 대한 답 → 3 진짜 이유 → 4 어떻게 할지 → 5 가까운 흐름 → 6 조심할 것.
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
        self:"동업은 하지 말고, 일손이 필요하면 돈을 주고 맡겨. 돈 관리와 결정은 너 혼자 쥐어야 부업이 돈으로 남아.",
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
    money:"이런 순간이 오면 결제나 송금은 하루만 미뤄.",
    career:"이런 순간이 오면 바로 대답하지 말고 ‘확인해보고 말씀드릴게요’로 시간을 벌어.",
    love:"이런 순간이 오면 그날은 결론 내지 말고 하루 자고 다시 봐.",
    path:"이런 순간이 오면 결정 전에 믿을 만한 사람 한 명에게 먼저 말해봐.",
    people:"이런 사람과는 만나는 횟수부터 조용히 줄여도 괜찮아.",
    mental:"이런 날이 오면 그날 할 일 하나를 과감히 빼.",
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
    const ranked=groupsByShare(reasoning);
    return GROUP_NAME[ranked[0]] ? ranked[0] : "self";
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
  const DAY_IMAGE={甲:"곧게 뻗은 큰 나무",乙:"끈질기게 자라는 풀과 꽃",丙:"환하게 비추는 태양",丁:"주변을 밝히는 촛불",戊:"묵직한 큰 산",己:"무엇이든 길러내는 논밭의 흙",庚:"단단한 쇠",辛:"빛나는 보석",壬:"넓은 바다",癸:"조용히 스며드는 빗물"};
  const STRENGTH_MEAN={신강:"너 자신의 힘이 센 편이라, 한번 정하면 밀어붙이는 힘이 있어.",신약:"너 자신의 힘은 약한 편이라, 혼자 버티기보다 사람과 쉬는 시간에서 힘을 받아야 해.",중화:"너 자신의 힘은 균형이 잡힌 편이라, 상황에 따라 강하게도 부드럽게도 움직여."};
  // 일주 장면과 가장 큰 힘 장면이 같은 얘기(계산·거절 등)를 두 번 하면, 두 번째는 약한 쪽 장면으로 바꾼다.
  const SCENE_KEYS=["계산","거절","곱씹","비교","마감","규칙","고집","반박"];
  function noteCoreV6(reasoning,s,sig,isT){
    const top=godRows(reasoning)[0];
    const dm=dayMasterName(reasoning);
    const verdict=verdictOf(reasoning);
    const ilju=sig?.ilju||{};
    const special=(sig?.sinsal||[]).find(x=>x.tone!=="caution");
    let coreScene=top?CORE_SCENE[top.god]:"";
    if(coreScene&&ilju.scene&&SCENE_KEYS.some(w=>coreScene.includes(w)&&ilju.scene.includes(w))){
      coreScene=WEAK_SCENE[weakestGroupOf(reasoning)?.g]||"";
    }
    const bullets=[
      ilju.scene,
      coreScene,
      special?special.scene:(STRENGTH_SCENE[verdict]||STRENGTH_SCENE.중화).replace(/^그리고 /,""),
    ].filter(Boolean).map(x=>"· "+x);
    const tag=ilju.tag||headlineOf(reasoning)||"한쪽으로 치우치지 않은 사람";
    const conclusion=(isT?"<b>결론</b> — ":"<b>결론</b> — 언니가 딱 보니까 이거야. ")+"너는 <b>"+withJosa(tag,"이야","야")+"</b>.<br>"+bullets.join("<br>");
    const image=DAY_IMAGE[dayGanOf(reasoning)]||"";
    const why=whyLabel(isT)+"너를 뜻하는 글자는 "+dm+(image?", 곧 "+withJosa(image,"이야","야")+".":"이야.")+
      (top?" 그리고 네 사주 기운의 "+godShare(reasoning,top.god)+"%가 "+(GOD_MEANING[top.god]?top.god+", 곧 "+withJosa(GOD_MEANING[top.god],"이라서","라서"):withJosa(top.god,"이라서","라서"))+" 위 모습이 제일 크게 나와.":"")+
      (special?" 여기에 "+special.name+(special.plain?", 곧 "+special.plain:"")+"까지 있어.":"")+
      " "+(STRENGTH_MEAN[verdict]||STRENGTH_MEAN.중화);
    const tie=isT
      ? "이 성향이 ‘"+s.label+"’에서 어떻게 나오는지 바로 다음에 볼게."
      : "이 성향이 ‘"+s.label+"’ 고민에서 제일 먼저 드러나. 바로 다음에서 진짜 이유를 볼게.";
    const partner=top?godRows(reasoning).find(r=>r.group===top.group&&r.god!==top.god):null;
    const details=detailsBlock([
      (sig?.ilju?.name?"네 일주는 "+withJosa(sig.ilju.name.replace(/일주$/,""),"이야","야")+". ":"")+pillarName(reasoning,"day")+"의 윗글자 "+withJosa(dm,"이","가")+" 너 자신이야.",
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
    if(c==="people") return "친구·동료처럼 나와 나란히 서는 힘인 비겁은 "+sh("self")+"%, 규칙과 책임을 뜻하는 관성은 "+sh("officer")+"%야.";
    return (topGroupOf(reasoning)==="print"?"":"회복을 돕는 인성은 "+sh("print")+"%, ")+"밖으로 풀어내는 식상은 "+sh("output")+"%이고, 너 자신은 "+strengthPlain(reasoning)+"이야.";
  }
  function causeModifier(reasoning,s,sig){
    const sh=g=>groupShare(reasoning,g);
    const c=s.concern;
    if(c==="money"&&sh("self")>=25&&sh("wealth")>0&&sh("self")>sh("wealth")) return "게다가 친구·동료처럼 나와 나란히 서는 힘인 비겁이 "+sh("self")+"%로 재성 "+sh("wealth")+"%보다 커서, 돈이 사람 사이에서 나눠지기 쉬운 배치야.";
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
    // 보이는 "왜 그러냐면"은 필요한 기운이 왜 필요한지만 쉬운 말로 쓴다. 고전 명리식 "사주 중심을 살려주는 짝" 설명은 접힌 근거로 보낸다.
    const needPlain=(["career","path"].includes(s.concern)?NEED_POWER_WORK[N]:NEED_POWER[N])||"";
    const whyPlain=el
      ? (raw===0
        ? "네 사주에는 "+EL_PLAIN[el]+" 기운이 겉으로 하나도 없어. 그래서 "+withJosa(needPlain,"을","를")+" 사람·습관·환경으로 밖에서 채워야 해."
        : "네 사주에 "+EL_PLAIN[el]+" 기운이 조금 있어서, 그걸 살려 쓰면 "+withJosa(needPlain,"이","가")+" 바로 커져.")
      : "네 사주에서 모자란 쪽을 채우는 방법이라서야.";
    const lines=[
      lead(isT)+fix,
      "<b>네 사주에 제일 필요한 것</b> — "+need+(el?" 기운으로는 "+withJosa(elementName(el),"이야","야")+".":""),
      el?"<b>도움 되는 것</b> — "+ELEMENT_TIPS[el]+".":"",
      "<b>구체적으로</b> — "+plainSentence(s.move),
      whyLabel(isT)+whyPlain,
      detailsBlock([
        el?withJosa(elementName(el),"은","는")+" 너한테 "+groupLabelJ(N,"이고","고")+", 겉 글자로는 "+raw+"개야.":"",
        support?.why||"",
      ]),
    ];
    return lines.filter(Boolean).join("<br><br>");
  }

  // 4. 어떻게 할지 = 푸는 법 + (2번 답에서 안 다룬 경우) 잘 맞는 것
  const ANSWER_COVERS_FIT=new Set(["money/side","money/income","career/jobsearch","career/move","path/lost","path/switch","path/current","love/new","mental/burnout","mental/overthink","mental/low","mental/recover"]);
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
      return gui?"<b>도와주는 사람</b> — 네 사주엔 천을귀인, 곧 도와주는 사람 복이 있어서 "+guiPeople(gui)+" 쪽에서 도움이 올 가능성이 커.":"";
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
  // 사람·관계 고민의 NOTE2(답)가 이미 쓴 관계는 조심할 것에서 다시 쓰지 않는다.
  function peopleAnswerRelation(reasoning,sig,s){
    if(s?.concern!=="people") return null;
    const pos={friend:[],work:["month"],family:["year","month"],distance:["year","month","day","hour"]}[s.key]||[];
    return relationRows(reasoning,sig).find(x=>pos.includes(x.aPos)||pos.includes(x.bPos))||null;
  }
  // 관계 배치를 자리 이름(년주·월주…) 없이 "누구와 누구 사이"로 풀어 쓴다.
  const REL_SIDE={year:"집안 어른·윗사람 쪽",month:"부모님·직장 쪽",day:"너",hour:"후배·아랫사람 쪽"};
  const REL_KIND={clash:"정면으로 부딪히는",wonjin:"이유 없이 서운함이 쌓이는",punishment:"서로 상처를 주고받기 쉬운",harm:"은근히 서로 발목을 잡는",break:"약속이 자꾸 살짝씩 어긋나는"};
  const REL_TYPE_NAME={clash:"충",wonjin:"원진",punishment:"형",harm:"해",break:"파"};
  function relationPlain(row){
    const a=row.aPos==="day"?row.bPos:row.aPos, b=row.aPos==="day"?"day":row.bPos;
    const A=REL_SIDE[a]||"", B=REL_SIDE[b]||"";
    const pair=b==="day"?withJosa(A,"과","와")+" 너 사이":withJosa(A,"과","와")+" "+B+" 사이";
    const who=b==="day"?A.replace(/ 쪽$/,"")+" 일과 네 일":A.replace(/ 쪽$/,"")+" 일과 "+B.replace(/ 쪽$/,"")+" 일";
    const effect={
      clash:who+"이 한꺼번에 몰리면 한쪽이 크게 흔들려. 둘 중 무엇이 먼저인지 미리 정해둬.",
      wonjin:"가까울수록 사소한 말에 서운함이 쌓여. 서운한 건 작을 때 바로 풀어야 해.",
      punishment:"좋을 땐 좋다가도 한번 틀어지면 말이 날카로워져. 감정이 올라온 날엔 결론을 미뤄.",
      harm:"대놓고 싸우진 않는데 은근히 서로 일을 꼬이게 해. 역할을 미리 나눠두면 덜 부딪혀.",
      break:"크게 싸우진 않는데 계획이 자꾸 어긋나. 중요한 건 말로 한 번 더 확인해.",
    }[row.type]||"";
    return withJosa(pair,"이","가")+" "+REL_KIND[row.type]+" 배치야. "+effect;
  }
  function relationWhere(reasoning,row){
    const x=relationPair(reasoning,row);
    return withJosa(x.refsA,"과","와")+" "+x.refsB+" 사이의 "+REL_TYPE_NAME[row.type];
  }
  const CAUTION_WHY={
    self:"친구·동료처럼 나와 나란히 서는 힘인 {god} 네 사주에 있어서, {word}에서도 지기 싫은 마음과 자존심이 먼저 움직이기 쉬워.",
    output:"말하고 표현하는 힘인 {god} 네 사주에 있어서, {word}에서도 기분이 먼저 말과 행동으로 튀어나오기 쉬워.",
    wealth:"돈과 현실 계산을 뜻하는 {god} 네 사주에 있어서, {word}에서도 손익 계산이 먼저 움직이기 쉬워.",
    officer:"책임과 부담을 뜻하는 {god} 네 사주에 있어서, {word}에서도 해야 한다는 부담을 혼자 떠안기 쉬워.",
    print:"생각과 신중함을 뜻하는 {god} 네 사주에 있어서, {word}에서도 생각만 길어지고 움직임이 늦어지기 쉬워.",
  };
  function noteCautionV6(reasoning,s,sig,isT,data,grounding){
    const B=burdenGroupOf(reasoning);
    const main=CAUTION[s.concern]?.[B]||"";
    const relevantPos={love:["day"],people:["year","month","day","hour"],career:["year","month"],money:["year","month","day"]}[s.concern]||[];
    const relKey=x=>x?x.type+":"+[x.aPos,x.bPos].sort().join("-"):"";
    // NOTE2·NOTE3에서 이미 짚은 관계는 여기서 다시 쓰지 않는다.
    const used=new Set([peopleAnswerRelation(reasoning,sig,s),...(grounding?.selectedInterpretations||concernInterpretations(reasoning,s,sig,data||{}).slice(0,2)).map(x=>x.rel)].filter(Boolean).map(relKey));
    const rows=relationRows(reasoning,sig).filter(x=>!used.has(relKey(x)));
    // 썸·새 인연에서는 아랫사람 자리(시주)와의 관계는 연애와 거리가 멀어서 짚지 않는다.
    const skipHour=s.concern==="love"&&["crush","new"].includes(s.key);
    const rel=rows.find(x=>(relevantPos.includes(x.aPos)||relevantPos.includes(x.bPos))&&!(skipHour&&(x.aPos==="hour"||x.bPos==="hour")))||null;
    const bad=(sig?.sinsal||[]).find(x=>SINSAL_CAUTION[x.name]);
    const gm=(sig?.gongmang?.positions||[])[0];
    const harm=harmRows(reasoning,s)[0];
    const present=new Set(godRows(reasoning).map(r=>r.god));
    const harmPresent=(synthesisFor(reasoning).mechanisms?.structure?.harmfulGods||[]).some(g=>present.has(g));
    const top=godRows(reasoning)[0];
    const strongTop=!harmPresent&&verdictOf(reasoning)==="신강"&&top;
    // 조심할 것의 이유는 고른 고민 안에서 설명한다. 고전 명리식 "사주 중심을 흔드는 글자" 설명은 접힌 근거로만 둔다.
    const bGod=godRows(reasoning).find(r=>r.group===B)?.god||"";
    const word=CONCERN_WORD[s.concern]||"이 고민";
    const whyText=strongTop
      ? "너 자신이 강한 편인데 제일 큰 힘인 "+GROUP_PLAIN[top.group]+" 쪽이 이미 사주 기운의 "+groupShare(reasoning,top.group)+"%야. 여기서 더 세지면 장점이 고집이나 과함으로 바뀌기 쉬워."
      : harmPresent&&bGod&&CAUTION_WHY[B]
        ? CAUTION_WHY[B].replace("{god}",withJosa(bGod,"이","가")).replace("{word}",word)
        : (harm?.plain||harm?.evidence||"");
    const lines=[
      lead(isT)+main+" "+(CAUTION_CHECK[s.concern]||""),
      rel?"<b>특히 조심할 관계</b> — "+relationPlain(rel):"",
      bad?"<b>이것도 기억해</b> — "+SINSAL_CAUTION[bad.name]:"",
      gm?"<b>기대를 낮출 쪽</b> — "+POS_PERSON[gm]+" 쪽 도움은 크게 기대하지 않는 게 마음 편해. 사주에서 그 자리가 비어 있는 공망 배치라, 그쪽 일은 스스로 준비해두는 게 나아.":"",
      whyLabel(isT)+whyText,
      detailsBlock([
        harm?.god&&harm?.evidence?"명리 근거: "+harm.evidence:"",
        !strongTop&&harm?.detail?harm.detail:"",
        rel?"관계 근거: "+relationWhere(reasoning,rel)+".":"",
        gm?"공망 자리: "+pillarName(reasoning,gm)+".":"",
        ...rows.filter(r=>relKey(r)!==relKey(rel)).slice(0,2).map(r=>relationShort(reasoning,r)),
      ]),
    ];
    return lines.filter(Boolean).join("<br><br>");
  }

  // NOTE2가 이미 "올해와 내년" 답을 쓰는 고민은 NOTE5에서 해 이야기를 다시 하지 않는다.
  const YEAR_IN_ANSWER=new Set(["money/flow","career/move","career/current","love/new","path/switch"]);
  // 올해·내년을 NOTE2와 똑같은 고민별 기준(연인 별·돈 별·합격 별 등, 남녀 구분 포함)으로 풀어준다.
  function yearLine(reasoning,s,data,usedE){
    if(YEAR_IN_ANSWER.has(s.concern+"/"+s.key)) return [];
    const seen=usedE||new Set();
    const eOf=sig=>{ if(!sig?.e||seen.has(sig.e)) return ""; seen.add(sig.e); return sig.e; };
    const timing=reasoning?.timing||{};
    const today=String(timing.today||"");
    const y=Number(today.slice(0,4));
    const month=Number(today.slice(5,7))||1;
    const word=CONCERN_SHORT[s.concern]||"이 고민";
    const rows=(timing.years||[]).filter(r=>r&&(r.year===y||(r.year===y+1&&month>=9)))
      .sort((a,b)=>a.year-b.year);
    const info=rows.map(r=>{
      const gz=String(r.seyunGanZhi||"");
      const name=gz.length>=2&&GAN_KR[gz[0]]?GAN_KR[gz[0]]+(ZHI_KR[gz[1]]||"")+"년":"";
      const sigs=concernSignals(reasoning,s,data||{},yearCtx(reasoning,r));
      const pos=[...sigs].filter(x=>x.s>0).sort((a,b)=>b.s-a.s), neg=[...sigs].filter(x=>x.s<0).sort((a,b)=>a.s-b.s);
      return {r,name,when:r.year===y?"올해":"내년",pos,neg,score:sigs.reduce((a,x)=>a+x.s,0)};
    }).filter(x=>x.name);
    if(!info.length) return [];
    const quiet=x=>!x.pos.length&&!x.neg.length;
    if(info.length===2&&quiet(info[0])&&quiet(info[1])){
      return ["<b>올해 "+withJosa(info[0].name,"과","와")+" 내년 "+info[1].name+"</b> — 둘 다 "+word+" 쪽 기운이 직접 들어오는 해는 아니야. 그래서 해 전체를 믿고 기다리기보다, 아래 좋은 달에 맞춰 움직이는 게 맞아."];
    }
    return info.map(x=>{
      const head="<b>"+x.when+" "+x.name+"</b> — ";
      if(quiet(x)) return head+word+" 쪽 기운이 직접 들어오는 해는 아니야. 그래서 한 해 전체보다 좋은 달을 골라 움직이는 게 맞아.";
      const p=x.pos[0], n=x.neg[0];
      if(p&&(!n||x.score>=0)){
        const pe=eOf(p), ne=n?eOf(n):"";
        const extra=x.pos[1]?" 여기에 "+x.pos[1].n+"까지 겹쳐.":"";
        const warn=n?" 다만 "+n.a+" 해이기도 해서, "+(ne||"이 부분은 조심해")+".":"";
        return head+p.a+" 해야."+(pe?" "+pe+".":"")+extra+warn;
      }
      const ne=eOf(n);
      const soft=p?" 그래도 "+p.n+"도 같이 들어서, 좋은 달을 골라 움직이면 돼.":"";
      return head+n.a+" 해라, "+(ne||"이 해에는 속도를 조금 늦추는 게 좋아")+"."+soft;
    });
  }
  // 앞으로 6개월을 이 고민 기준(NOTE2와 같은 계산)으로 좋음·보통·조심으로 본다.
  function monthLabels(reasoning,s,data){
    const months=(reasoning?.timing?.nearMonths||[]).slice(0,6);
    return months.map((row,i)=>{
      const sc=concernSignals(reasoning,s,data||{},monthCtx(row)).reduce((a,x)=>a+x.s,0)+(CLASS_BONUS[row?.class]||0)*2;
      const m=Number(row.startMonth||0), d=Number(row.startDay||0);
      return {row,score:sc,label:sc>=2?"좋음":sc<=-2?"조심":"보통",when:i===0?"지금":(m&&d?m+"월 "+d+"일~":""),start:m&&d?m+"월 "+d+"일":""};
    });
  }
  function monthStrip(reasoning,s,data){
    const rows=monthLabels(reasoning,s,data);
    if(rows.length<3) return "";
    const short=CONCERN_SHORT[s.concern]||"";
    return "<b>앞으로 6개월 "+(short?short+" 흐름":"한눈에")+"</b> — "+rows.map(x=>x.when+" "+x.label).filter(x=>x.trim()).join(" · ");
  }
  // 흐름 NOTE 첫 줄: 한 줄 표와 똑같은 판정으로 "지금"과 "앞으로 6개월"을 말한다.
  function monthSummary(reasoning,s,data,plan){
    const rows=monthLabels(reasoning,s,data);
    const short=CONCERN_SHORT[s.concern]||"이 고민";
    if(rows.length<3) return "";
    const now=rows[0];
    const nowText=now.label==="좋음"?"지금이 "+short+" 쪽으로 좋은 달이야."
      :now.label==="조심"?"지금은 "+short+" 쪽으로 조심할 달이야."
      :"지금은 "+short+" 쪽으로 보통인 달이야.";
    // 이어지는 같은 판정은 "12월 7일부터 석 달"처럼 한 덩어리로 말한다.
    const COUNT=["","한 달","두 달","석 달","넉 달","다섯 달"];
    const runs=label=>{
      const out=[]; let cur=null;
      rows.slice(1).forEach(x=>{
        if(x.label===label&&x.start){ if(cur) cur.n++; else { cur={start:x.start,n:1}; out.push(cur); } }
        else cur=null;
      });
      return out.map(r=>r.start+"부터 "+COUNT[r.n]).join(", ");
    };
    const goods=runs("좋음"), bads=runs("조심");
    let next;
    if(goods&&bads) next=" 앞으로 6개월 안에는 "+withJosa(goods,"이","가")+" 좋고, "+withJosa(bads,"은","는")+" 조심해.";
    else if(goods) next=" 앞으로 6개월 안에는 "+withJosa(goods,"이","가")+" 좋아.";
    else if(bads) next=" 앞으로 6개월 안에는 "+bads+"만 조심하면 돼.";
    else if(plan&&(plan.best.length||plan.far.length)) next=" 앞으로 6개월은 크게 튀는 달 없이 가다가, 그 뒤에 "+short+" 쪽으로 힘이 붙어.";
    else next=" 앞으로 6개월은 크게 튀는 달 없이 고르게 가.";
    return "<b>결론</b> — "+nowText+next;
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
  // 오늘부터 1년 뒤 날짜. 이보다 늦게 시작하는 달은 "가까운 달"로 부르지 않는다.
  function yearAheadYmd(reasoning){
    const today=String(reasoning?.timing?.today||"");
    return /^\d{4}-\d{2}-\d{2}$/.test(today)?(Number(today.slice(0,4))+1)+today.slice(4):"";
  }
  function runText(reasoning,run){
    const today=String(reasoning?.timing?.today||"");
    const first=run.rows[0], last=run.rows[run.rows.length-1];
    const y=Number(today.slice(0,4));
    const months=reasoning?.timing?.nearMonths||[];
    // 계산 범위 끝까지 좋은 달이 이어지면, 범위 끝 날짜는 실제 끝이 아니라서 "쭉"으로 쓴다.
    const toWindowEnd=months.length>0&&String(last.startYmd)===String(months[months.length-1]?.startYmd);
    const endYmd=String(last.endYmd||"");
    const ey=Number(endYmd.slice(0,4)), em=Number(endYmd.slice(5,7)), ed=Number(endYmd.slice(8,10));
    const sy=Number(String(first.startYmd).slice(0,4));
    const end=em&&ed?(ey&&ey!==y&&ey!==sy?ey+"년 ":"")+em+"월 "+ed+"일 전까지":"";
    const isNow=String(first.startYmd)<=today;
    const start=isNow?"지금부터":(sy&&sy!==y?sy+"년 ":"")+Number(first.startMonth)+"월 "+Number(first.startDay)+"일부터";
    if(toWindowEnd) return isNow?"지금부터 1년 넘게 쭉":start+" 쭉";
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

  // 엔진 사실을 생활 장면으로 바로 점프시키지 않는다.
  // 고민별 후보를 찬성 근거·반대 근거·확신도로 교차검증한 뒤 NOTE에 올린다.
  const CONCERN_GROUP_SAFE_TITLE={
    money:{self:"내 몫과 공동 몫의 균형",output:"결과를 보상으로 잇는 힘",wealth:"돈·보상을 다루는 힘",officer:"돈에 규칙을 세우는 힘",print:"준비와 보상의 순서"},
    career:{self:"내 방식과 조직 기준의 균형",output:"결과를 밖으로 보여주는 힘",wealth:"현실 보상과 조건을 보는 힘",officer:"책임·평가를 받는 힘",print:"준비·학습을 쌓는 힘"},
    love:{self:"관계에서 내 기준의 비중",output:"호감·불만을 표현하는 힘",wealth:"관계의 현실 조건을 보는 힘",officer:"관계의 책임·기준을 보는 힘",print:"확신 전 생각과 확인의 비중"},
    path:{self:"스스로 방향을 정하는 힘",output:"재능을 결과로 꺼내는 힘",wealth:"현실성과 보상을 보는 힘",officer:"기준과 방향을 고정하는 힘",print:"배우고 파고드는 힘"},
    people:{self:"관계에서 대등함을 지키는 힘",output:"말과 표현이 관계에 미치는 힘",wealth:"주고받는 균형을 보는 힘",officer:"책임과 도리를 보는 힘",print:"상대를 이해하고 생각하는 힘"},
    mental:{self:"혼자 버티는 힘",output:"쌓인 것을 밖으로 빼는 힘",wealth:"현실 걱정과 계산의 비중",officer:"해야 한다는 부담의 비중",print:"생각·회복에 머무는 힘"},
  };
  const CONCERN_GROUP_SAFE_READING={
    money:{self:"돈 문제에서는 내 몫과 함께 쓰는 몫을 어디서 나누는지가 중요한 변수로 작동해.",output:"만든 결과가 실제 보상으로 이어지는 과정이 돈 문제에서 중요하게 작동해.",wealth:"돈과 보상 자체를 다루는 힘의 크기가 이 고민에 직접 연결돼.",officer:"예산·기한·규칙처럼 돈을 고정해서 관리하는 방식이 중요한 변수야.",print:"준비·학습에 힘이 먼저 가면 보상을 챙기는 시점이 뒤로 밀릴 수 있어."},
    career:{self:"일에서는 내 방식과 조직이 요구하는 방식을 얼마나 맞출지가 중요한 변수야.",output:"한 일을 밖으로 보여주고 결과물로 만드는 과정이 평가와 연결되기 쉬워.",wealth:"조건·보상·실익을 따지는 힘이 직장 선택과 만족도에 영향을 줄 수 있어.",officer:"책임·평가·직급처럼 조직의 기준을 받는 방식이 일 문제에서 핵심 변수야.",print:"준비와 학습이 강점이지만, 준비가 실제 지원·실행보다 앞서면 속도가 늦어질 수 있어."},
    love:{self:"연애에서는 내 기준을 지키는 힘과 상대에게 맞추는 정도의 균형이 중요해.",output:"호감이나 불만을 밖으로 표현하는 방식이 관계 진행 속도에 영향을 주기 쉬워.",wealth:"연애에서도 현실 조건과 주고받는 균형을 따지는 힘이 작동해.",officer:"관계에서 책임·약속·상대의 역할을 중요하게 보는 힘이 작동해.",print:"확신을 얻기 전에 생각하고 확인하는 과정이 길어질 수 있어."},
    path:{self:"남의 기준보다 내가 납득한 방향을 잡을 때 힘이 붙는지가 중요해.",output:"재능을 실제 결과물로 꺼내보는 과정이 진로 판단의 핵심이야.",wealth:"좋아하는 것뿐 아니라 현실 보상과 지속 가능성을 함께 보는 힘이 작동해.",officer:"방향·기한·기준을 정해주는 틀이 있을 때 진로가 선명해지는지가 중요해.",print:"배우고 깊게 파는 힘이 강점이지만, 실제 경험으로 확인하는 단계까지 이어져야 해."},
    people:{self:"관계에서는 한쪽만 맞추지 않고 대등함을 지키는 기준이 중요해.",output:"말과 표현의 세기가 관계의 거리 조절에 영향을 줄 수 있어.",wealth:"주고받는 몫이 기울었다고 느끼는 순간 관계 판단이 달라질 수 있어.",officer:"책임과 도리를 어디까지 맡을지 정하는 것이 관계 피로도와 연결돼.",print:"상대 입장을 오래 생각하는 힘이 크면 내 입장을 말하는 시점이 늦어질 수 있어."},
    mental:{self:"혼자 버티는 힘이 큰 만큼 도움을 받는 시점을 놓치지 않는 게 중요해.",output:"생각이나 감정을 말·행동·결과물로 밖에 빼는 통로가 회복에 중요해.",wealth:"현실 손익과 경우의 수를 계속 계산하는 힘이 생각을 길게 만들 수 있어.",officer:"해야 한다는 책임과 기준이 계속 켜져 있으면 쉬는 동안에도 부담이 남을 수 있어.",print:"생각하고 회복하는 힘이 한쪽으로 몰리면, 생각을 멈추는 전환점이 늦어질 수 있어."},
  };
  function groupsFromGods(gods){
    return new Set((gods||[]).map(godGroup).filter(g=>GROUP_NAME[g]));
  }
  function interpretationEvidence(reasoning,s,row){
    const evidenceIds=[],counterEvidenceIds=[];
    const group=row?.group||null;
    const share=group?groupShare(reasoning,group):null;
    if(group){
      evidenceIds.push("GROUP:"+group+":"+share);
      if(share>=30||share<10) evidenceIds.push("GROUP_EXTREME:"+group+":"+share);
    }
    if(row?.rel) evidenceIds.push("REL:"+row.rel.type+":"+[row.rel.aPos,row.rel.bPos].sort().join("-"));
    const st=synthesisFor(reasoning).mechanisms?.structure||{};
    const supportGroups=groupsFromGods([...(st.helpfulGods||[]),...(st.rescueGods||[]),...(st.structuralSupportGods||[]),...(st.structuralRescueGods||[])]);
    const harmGroups=groupsFromGods([...(st.harmfulGods||[]),...(st.structuralHarmGods||[])]);
    if(group&&supportGroups.has(group)) evidenceIds.push("STRUCT_SUPPORT:"+group);
    if(group&&harmGroups.has(group)) evidenceIds.push("STRUCT_HARM:"+group);
    const pressure=synthesisFor(reasoning).mechanisms?.drive?.pressureGroup||reasoning?.integrated?.pressureGroup||"";
    if(group&&group===pressure) evidenceIds.push("PRESSURE:"+group);
    const need=needGroupOf(reasoning);
    if(group&&group===need) evidenceIds.push("PRESCRIPTION:"+group);
    if(group&&supportGroups.has(group)&&harmGroups.has(group)) counterEvidenceIds.push("STRUCT_MIXED:"+group);
    const flags=synthesisFor(reasoning).contradictionFlags||[];
    if(flags.includes("body-vs-structure")) counterEvidenceIds.push("BODY_VS_STRUCTURE");
    if(flags.includes("visible-vs-actual-force")&&group) counterEvidenceIds.push("VISIBLE_VS_ACTUAL");
    const independent=[...new Set(evidenceIds)];
    const score=independent.length*2-counterEvidenceIds.length*1.5+(row?.rel?1:0);
    const confidence=independent.length>=4&&counterEvidenceIds.length===0?"high":independent.length>=2?"supported":"guarded";
    const safeTitle=row?.rel?"관계 자리 사이의 "+(REL_TYPE_NAME[row.rel.type]||"관계")+" 신호":(CONCERN_GROUP_SAFE_TITLE[s.concern]?.[group]||row?.title||"확인할 부분");
    const safeReading=row?.rel?"두 자리 사이에 실제 관계 신호가 있어. 다만 이 신호 하나만으로 특정 사건이나 상대 행동을 확정하지 않아.":(CONCERN_GROUP_SAFE_READING[s.concern]?.[group]||"이 힘이 현재 고민에서 어떻게 쓰이는지 다른 근거와 함께 봐야 해.");
    return {...row,evidenceIds:independent,counterEvidenceIds,score,confidence,safeTitle,safeReading};
  }
  function concernInterpretations(reasoning,s,sig,data){
    const rows=concernDiagnoses(reasoning,s,sig,data).map(row=>interpretationEvidence(reasoning,s,row));
    const rank={high:2,supported:1,guarded:0};
    return rows.sort((a,b)=>b.score-a.score||(rank[b.confidence]-rank[a.confidence]));
  }
  function buildConcernGroundingPlan(reasoning,s,sig,data){
    const interpretations=concernInterpretations(reasoning,s,sig,data);
    const supported=interpretations.filter(x=>x.confidence!=="guarded");
    const selected=(supported.length?supported:interpretations).slice(0,2);
    const byShare=groupsByShare(reasoning);
    const primaryGroup=selected.find(x=>x.group)?.group||byShare[0]||"self";
    const secondaryGroup=selected.find(x=>x.group&&x.group!==primaryGroup)?.group||byShare.find(g=>g!==primaryGroup)||primaryGroup;
    return {interpretations,selectedInterpretations:selected,primaryGroup,secondaryGroup,rankedGroups:rankGroups(reasoning),needGroup:needGroupOf(reasoning),burdenGroup:burdenGroupOf(reasoning),groupShares:Object.fromEntries(["self","output","wealth","officer","print"].map(g=>[g,groupShare(reasoning,g)]))};
  }
  function engineClaimByShape(reasoning,shape){
    const claims=reasoning?.claims||[];
    if(shape==="core") return claims.find(c=>c?.rawFacts?.strength)||null;
    if(shape==="support") return claims.find(c=>c?.rawFacts?.prescription)||null;
    if(shape==="timing") return claims.find(c=>String(c?.conclusion||"").includes("시간축"))||null;
    if(shape==="caution") return claims.find(c=>c?.rawFacts?.relations&&c?.rawFacts?.root)||null;
    return null;
  }
  function engineClaimDigest(claim,fallbackId){
    if(!claim) return {id:fallbackId,source:"engine",confidence:"guarded",evidenceIds:[],counterEvidenceIds:[]};
    return {id:claim.id||fallbackId,source:"engine",confidence:claim.certainty==="supported"?"supported":"guarded",evidenceIds:[...(claim.ditianRuleIds||[]),...(claim.zipingRuleIds||[])],counterEvidenceIds:claim.exceptions||[]};
  }
  function buildNoteClaimPlan(reasoning,s,grounding){
    const primary=grounding?.selectedInterpretations?.[0]||null;
    const secondary=grounding?.selectedInterpretations?.[1]||null;
    const concernClaim={id:"CONCERN:"+s.concern+"/"+s.key,source:"concern-cross-validation",confidence:primary?.confidence||"guarded",evidenceIds:primary?.evidenceIds||[],counterEvidenceIds:primary?.counterEvidenceIds||[],conclusion:primary?.safeTitle||""};
    const causeClaim={id:"CAUSE:"+s.concern+"/"+s.key,source:"concern-cross-validation",confidence:primary?.confidence||"guarded",evidenceIds:[...new Set([...(primary?.evidenceIds||[]),...(secondary?.evidenceIds||[])])],counterEvidenceIds:[...new Set([...(primary?.counterEvidenceIds||[]),...(secondary?.counterEvidenceIds||[])])],conclusion:[primary?.safeTitle,secondary?.safeTitle].filter(Boolean).join(" / ")};
    return [engineClaimDigest(engineClaimByShape(reasoning,"core"),"ENGINE:core"),concernClaim,causeClaim,engineClaimDigest(engineClaimByShape(reasoning,"support"),"ENGINE:support"),engineClaimDigest(engineClaimByShape(reasoning,"timing"),"ENGINE:timing"),engineClaimDigest(engineClaimByShape(reasoning,"caution"),"ENGINE:caution")];
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
    const limit=yearAheadYmd(reasoning);
    const allFar=runs.length>0&&!!limit&&runs.every(run=>String(run.rows[0].startYmd)>=limit);
    if(allFar) return "<b>"+label+"</b> — 1년 안에는 뚜렷하게 힘이 붙는 달이 없고, 그다음은 "+runText(reasoning,runs[0])+". 그 전까지는 서두르지 말고 작게 준비해.";
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
      const p=grounding?.selectedInterpretations?.[0]||null;
      const q=grounding?.selectedInterpretations?.[1]||null;
      out.push(lead(isT)+(p?"<b>"+p.safeTitle+"</b> 쪽이 돈이 안 모이는 고민과 가장 먼저 연결돼. "+p.safeReading:"특정 소비 습관을 사주만으로 찍기보다, 돈을 다루는 힘의 균형부터 보는 게 맞아."));
      if(p) out.push("<b>첫 번째 근거</b> — "+p.why+". 실제로 배달·쇼핑·사람에게 쓴다고 단정한 건 아니야.");
      if(q) out.push("<b>두 번째 근거</b> — "+q.safeTitle+". "+q.why+". "+q.safeReading);
      out.push("<b>저축 방식으로 옮기면 — "+SAVE_STYLE[N]+"</b>. 이건 소비 원인을 맞혔다는 뜻이 아니라, 네 사주에서 필요한 "+withJosa(GROUP_NAME[N],"을","를")+" 현실의 규칙으로 고정하는 방법이야.");
      out.push(savingCapacityLine(reasoning));
      out.push(...T("저축을 시작하기 좋은 달","돈 결정을 한 번 더 확인할 달").lines);
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
      const combine=dayCombine(reasoning);
      out.push(lead(isT)+"<b>"+(combine?"관계 자리가 다른 자리와 묶이는 신호가 있어":clash?"관계 자리에 충돌 신호가 있어":"관계 자리에 강한 충돌 신호가 두드러지진 않아")+"</b>. "+(combine?"합이 있다고 관계가 오래 간다고 단정하진 않아. 관계를 유지하려는 힘이 어떤 조건에서 살아나는지 같이 봐야 해.":clash?"이 충돌 하나로 이별을 뜻하진 않아. 다만 갈등이 생길 때 생활 조건이 같이 흔들리는지는 확인할 가치가 있어.":"큰 사건을 예언하기보다, 서운함을 어떻게 처리하는지가 더 중요한 쪽으로 읽을게."));
      out.push("<b>갈등이 생길 때 확인할 패턴</b> — "+FIGHT_PATTERN[G1]+" 실제로 이 패턴이 있는지는 네 경험이 우선이야.");
      out.push("<b>오래 가는 조건으로 시험해볼 것 — "+KEEP_LOVE[N]+"</b>. 네 사주에 필요한 "+withJosa(NEED_POWER[N],"을","를")+" 관계 안에서 보완하는 방식이야.");
      const dz=dayBranchGod(reasoning);
      if(SPOUSE_WANTS[dz]) out.push("<b>관계에서 중요하게 느끼기 쉬운 조건</b> — 배우자 자리에 "+withJosa(dz,"이","가")+" 있어서, "+withJosa(SPOUSE_WANTS[dz],"을","를")+" 중요하게 느낄 가능성이 있어. 상대가 반드시 그렇게 해야 한다는 뜻은 아니야.");
      out.push(...T("관계를 점검하기 좋은 달","갈등 결정을 한 번 더 확인할 달").lines);
    } else if(k==="love/breakup"){
      const {score,why}=breakupScore(reasoning,sig,data);
      const direction=score>=2?"다시 연결을 검토할 신호가 몇 개 겹쳐":score<=0?"같은 충돌이 반복될 수 있다는 신호가 더 보여":"다시 연결 쪽과 정리 쪽 신호가 섞여 있어";
      out.push(lead(isT)+"<b>"+direction+"</b>. 하지만 네 사주 하나로 재회 확률이나 상대의 연락 여부를 정할 수는 없어.");
      if(why.length) out.push("<b>네 쪽에서 확인된 근거</b> — "+why.join(". ")+". 이건 가능성의 근거이지 재회를 확정하는 증거는 아니야.");
      out.push(...T("연락을 검토하기 좋은 달","연락 결정을 한 번 더 확인할 달").lines);
      out.push("<b>연락한다면</b> — "+CONTACT_WAY[G1]+" 상대 반응이 없으면 그 사실을 사주보다 우선해.");
      out.push("<b>다시 만난다면 확인할 것</b> — "+REPEAT_FIX[G1]);
      out.push("<b>한 가지만 기억해</b> — 재회는 두 사람의 선택이라 상대 사주와 실제 상황이 없으면 확정할 수 없어.");
    } else if(k==="love/new"){
      const t=T("인연을 넓혀보기 좋은 달","새 관계 결정을 한 번 더 확인할 달");
      const b=t.plan.best[0]||t.plan.far[0];
      const spouseGroup=spouseGroupOf(data);
      const spouseShare=spouseGroup?groupShare(reasoning,spouseGroup):0;
      out.push(lead(isT)+(b?"새 인연 고민에서 지원 신호가 가장 겹치는 때는 <b>"+monthSpan(b.row,t.plan.today)+"</b>야.":"새 인연은 특정 달 하나보다 실제 만남을 만드는 행동이 더 중요하게 보여.")+" 상대의 외모·직업·정확한 만남 장소는 네 사주 하나로 만들지 않을게.");
      out.push(...t.lines);
      out.push(concernYearAnswer(reasoning,s,data));
      out.push("<b>사주에서 실제로 확인되는 것</b> — 연인을 뜻하는 "+withJosa(GROUP_NAME[spouseGroup]||"힘","은","는")+" 전체 힘의 "+spouseShare+"%야. 이 비중과 배우자 자리의 합·충을 같이 보고 인연의 강약만 판단해.");
      const dz=dayBranchGod(reasoning);
      if(SPOUSE_WANTS[dz]) out.push("<b>관계에서 중요하게 느끼기 쉬운 조건</b> — "+SPOUSE_WANTS[dz]+". 배우자 자리에서 보이는 힘을 현실 조건으로 풀어쓴 거라, 특정 사람의 성격을 예언한 건 아니야.");
      const charm=(sig?.sinsal||[]).find(x=>["도화","홍염","역마"].includes(x.name));
      if(charm) out.push("<b>보조 신호</b> — "+withJosa(charm.name,"이","가")+" 있어. 이건 만남 가능성을 보조해서 보는 신호일 뿐, 특정 상대가 나타난다고 확정하지 않아.");
      out.push("<b>피해야 할 기준</b> — 사주에서 상대 외모나 직업을 맞혔다고 믿고 사람을 고르지 않는 것. 실제 대화와 행동이 먼저야.");
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
      const rel=peopleAnswerRelation(reasoning,sig,s);
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

  // ===== v8: 고민마다 "사람들이 진짜 궁금한 것"을 끝까지 답하는 층 =====
  // 날짜는 전체 운이 아니라 고민별로 명리에서 실제로 보는 기준으로 고른다.
  // 연애=배우자 별(남 재성·여 관성)과 배우자 자리(일지)의 합·충·도화, 돈=재성·식상·겁재,
  // 시험=인성·관성·재성, 직장=관성·상관·역마, 관계=비겁·인성·충, 마음=인성·식신·편관.
  const ZHI_ELEMENT={子:"su",丑:"to",寅:"mok",卯:"mok",辰:"to",巳:"hwa",午:"hwa",未:"to",申:"geum",酉:"geum",戌:"to",亥:"su"};
  const ZHI_TRIAD_GROUP={寅:"fire",午:"fire",戌:"fire",申:"water",子:"water",辰:"water",巳:"metal",酉:"metal",丑:"metal",亥:"wood",卯:"wood",未:"wood"};
  const DOHWA_BY_TRIAD={fire:"卯",water:"酉",metal:"午",wood:"子"};
  const YEOKMA_BY_TRIAD={fire:"申",water:"寅",metal:"亥",wood:"巳"};
  const ZHI_COMBINE_PAIRS=new Set(["子丑","丑子","寅亥","亥寅","卯戌","戌卯","辰酉","酉辰","巳申","申巳","午未","未午"]);
  const ZHI_CLASH_PAIRS=new Set(["子午","午子","丑未","未丑","寅申","申寅","卯酉","酉卯","辰戌","戌辰","巳亥","亥巳"]);
  const ELEMENT_CONTROLS={mok:"to",to:"su",su:"hwa",hwa:"geum",geum:"mok"};
  const ELEMENT_CONTROLLED_BY={to:"mok",su:"to",hwa:"su",geum:"hwa",mok:"geum"};
  const CLASS_BONUS={supportive:1,"mild-support":0.5,caution:-1,"mild-caution":-0.5};
  const CONCERN_SHORT={money:"돈",career:"일",love:"연애",path:"진로",people:"관계",mental:"회복"};

  function natalSpecialZhi(reasoning,table){
    const p=pillarsOf(reasoning); const out=new Set();
    for(const pos of ["day","year"]){ const t=ZHI_TRIAD_GROUP[p[pos]?.zhi]; if(t) out.add(table[t]); }
    return out;
  }
  function monthCtx(row){
    const w=row?.layers?.wolun||{};
    const rel=(type,pos)=>(w.relations||[]).some(x=>x.type===type&&pos.includes(x.natalPos));
    return {g:w.god||row?.sipsin||"",bg:(w.branchGods||[])[0]||"",zhi:w.zhi||String(row?.ganZhi||"").charAt(1)||"",
      dayComb:rel("combine",["day"]),dayClash:rel("clash",["day"]),monthClash:rel("clash",["month"]),familyClash:rel("clash",["year","month"]),unit:"달"};
  }
  function yearCtx(reasoning,yr){
    const zhi=String(yr?.seyunGanZhi||"").charAt(1);
    const p=pillarsOf(reasoning);
    const has=(set,pos)=>!!zhi&&pos.some(ps=>p[ps]?.zhi&&set.has(zhi+p[ps].zhi));
    return {g:yr?.seyunGod||"",bg:"",zhi,dayComb:has(ZHI_COMBINE_PAIRS,["day"]),dayClash:has(ZHI_CLASH_PAIRS,["day"]),
      monthClash:has(ZHI_CLASH_PAIRS,["month"]),familyClash:has(ZHI_CLASH_PAIRS,["year","month"]),unit:"해"};
  }

  // 한 달(또는 한 해)이 이 고민에 어떤 기운인지. a=“…가 들어오는”(뒤에 달/해가 붙는 꾸밈말), n=짧은 이름, e=그때 실제로 생기는 일.
  function concernSignals(reasoning,s,data,ctx){
    const {g,bg,zhi,dayComb,dayClash,monthClash,familyClash,unit}=ctx;
    const k=s.key, c=s.concern, male=data?.gender==="male";
    const out=[];
    const add=(score,a,n,e)=>out.push({s:score,a,n,e:e||""});
    const pick=map=>map[k]||map.default||"";
    const dohwa=!!zhi&&natalSpecialZhi(reasoning,DOHWA_BY_TRIAD).has(zhi);
    const yeokma=!!zhi&&natalSpecialZhi(reasoning,YEOKMA_BY_TRIAD).has(zhi);
    const weak=verdictOf(reasoning)==="신약";
    if(c==="love"){
      const star=male?["정재","편재"]:["정관","편관"];
      if(male&&g==="정재") add(3,"남자 사주에서 진지한 연인을 뜻하는 정재가 들어오는","진지한 연인을 뜻하는 정재",pick({new:"이때 만난 사람은 가볍게 끝나지 않고 진지하게 이어지기 쉬워",crush:"썸이 진지한 사이로 넘어가기 좋아",relationship:"결혼이나 앞날 얘기를 꺼내기 좋아",breakup:"다시 연락이 닿으면 진지한 대화로 이어지기 쉬워"}));
      if(male&&g==="편재") add(3,"남자 사주에서 연애·이성 인연을 뜻하는 편재가 들어오는","이성 인연을 뜻하는 편재",pick({new:"소개나 모임에서 호감 가는 사람이 여럿 생기기 쉬워",crush:"분위기가 확 달아오르기 쉬워",relationship:"데이트나 여행으로 설렘을 되살리기 좋아",breakup:"예전 사람 소식이 들려오기 쉬워"}));
      if(!male&&g==="정관") add(3,"여자 사주에서 진지한 연인·남편감을 뜻하는 정관이 들어오는","진지한 연인을 뜻하는 정관",pick({new:"믿음 가는 사람을 소개받거나 오래 볼 사람을 만나기 쉬워",crush:"상대가 먼저 진지하게 나오기 쉬워",relationship:"결혼 얘기가 자연스럽게 나오기 좋아",breakup:"상대가 먼저 연락해올 여지가 생겨"}));
      if(!male&&g==="편관") add(3,"여자 사주에서 강하게 끌리는 인연을 뜻하는 편관이 들어오는","강하게 끌리는 인연을 뜻하는 편관",pick({new:"첫눈에 끌리는 사람이 나타나기 쉬워",crush:"밀고 당기기가 세게 오가기 쉬워",relationship:"감정이 커지는 만큼 부딪힘도 같이 커질 수 있어",breakup:"다시 강하게 끌리는 순간이 오기 쉬워"}));
      if(!star.includes(g)&&star.includes(bg)) add(1,"겉으로 안 보이게 연인 기운이 숨어 드는","숨은 연인 기운","겉으로 티는 안 나도 가까운 곳에서 인연이 움직여");
      if(dayComb) add(3,"배우자 자리와 합이 되는","배우자 자리와의 합",pick({new:"만난 사람과 빠르게 가까워지기 쉬워",crush:"관계를 확정하기 좋아",relationship:"둘 사이가 한 단계 가까워지기 좋아",breakup:"끊겼던 인연이 다시 묶이기 쉬워"}));
      if(dohwa) add(2,"사람을 끄는 도화가 드는","사람을 끄는 도화","가만히 있어도 눈에 띄고 호감을 사기 쉬워");
      if(k==="crush"&&g==="식신") add(1,"마음을 편하게 표현하기 좋은 식신이 들어오는","표현을 돕는 식신","먼저 말을 걸거나 약속을 잡기 편해");
      if(dayClash) add(-3,"배우자 자리와 정면으로 부딪히는","배우자 자리와의 충",pick({new:"급하게 시작한 관계는 오래 가기 어려워",crush:"작은 말 한마디로 오해가 생기기 쉬워",relationship:"사소한 말다툼이 크게 번지기 쉬워",breakup:"연락해도 예전 싸움이 되풀이되기 쉬워"}));
      if(male&&g==="겁재") add(-2,"경쟁자를 뜻하는 겁재가 들어오는","경쟁자를 뜻하는 겁재","좋아하는 사람을 두고 경쟁이 생기거나 친구로 남기 쉬워");
      if(!male&&g==="상관") add(-2,"연인 기운을 누르는 상관이 들어오는","연인 기운을 누르는 상관","말이 날카로워져서 좋은 사람도 밀어내기 쉬워");
    } else if(c==="money"){
      if(g==="정재") add(k==="side"?2:3,"차곡차곡 쌓이는 돈을 뜻하는 정재가 들어오는","쌓이는 돈을 뜻하는 정재",pick({saving:"이때 시작한 저축은 중간에 깨지 않고 오래 가",income:"고정 수입이 늘어나는 얘기가 나오기 좋아",side:"작아도 매달 꾸준히 들어오는 수입을 만들기 좋아",flow:"들어오는 돈이 안정적으로 늘어"}));
      if(g==="편재") add(k==="saving"?1:3,"큰돈이 움직이는 편재가 들어오는","큰돈이 움직이는 편재",pick({saving:"돈이 크게 도는 만큼 쓰기도 쉬워서, 들어온 날 바로 떼어둬야 남아",income:"성과급이나 추가 수입 기회가 오기 쉬워",side:"거래나 판매가 한 번에 크게 붙기 쉬워",flow:"큰돈이 들어오기 쉬운데, 그만큼 크게 나갈 일도 같이 생겨"}));
      if(g==="식신"&&k!=="saving") add(2,"실력이 결과물로 나오는 식신이 들어오는","결과물을 뜻하는 식신",pick({income:"일한 만큼 인정받고 보상 얘기가 나오기 좋아",side:"만든 게 꾸준히 팔리기 시작하기 좋아",flow:"돈을 만드는 활동이 늘어"}));
      if(g==="상관"){
        if(k==="saving") add(-1,"충동 지출이 늘기 쉬운 상관이 들어오는","충동 지출을 부르는 상관","사고 싶은 게 늘어나니 결제 전에 하루만 참아");
        else add(2,"아이디어가 돈이 되는 상관이 들어오는","아이디어를 뜻하는 상관",pick({income:"새로운 방식으로 수입을 늘릴 아이디어가 먹히기 좋아",side:"새 아이템을 시험해보기 좋아",flow:"새로운 돈줄이 생기기 쉬워"}));
      }
      if(g==="정관"&&k==="income") add(2,"자리와 평가가 올라가는 정관이 들어오는","평가를 뜻하는 정관","연봉이나 직급 얘기를 꺼내기 좋아");
      if(g==="정인"&&k==="saving") add(1,"문서와 계약을 뜻하는 정인이 들어오는","계약을 뜻하는 정인","적금이나 청약처럼 묶어두는 계약을 하기 좋아");
      if(g==="겁재") add(-3,"돈이 새기 쉬운 겁재가 들어오는","돈이 새는 겁재","빌려주기·동업·충동 결제는 이때 특히 조심해");
      if(g==="비견"&&["saving","flow"].includes(k)) add(-1,"나눠 쓸 일이 생기는 비견이 들어오는","나눠 쓰는 비견","모임이나 경조사로 돈이 나가기 쉬워");
    } else if(c==="career"){
      if(k==="exam"){
        if(g==="정인") add(3,"합격 문서를 뜻하는 정인이 들어오는","합격 문서를 뜻하는 정인","준비한 만큼 점수가 나오기 좋아");
        if(g==="편인") add(2,"깊게 파고드는 집중력의 편인이 들어오는","집중력을 뜻하는 편인","어려운 과목을 파고들기 좋아");
        if(g==="정관") add(2,"시험과 평가를 뜻하는 정관이 들어오는","평가를 뜻하는 정관","실전에서 긴장보다 집중이 앞서기 좋아");
        if(g==="편관") add(1,"마감 앞에서 힘이 나는 편관이 들어오는","마감의 힘을 뜻하는 편관","몰아서 준비하는 막판 스퍼트가 잘 돼");
        if(["정재","편재"].includes(g)) add(-2,"공부 집중을 흩뜨리는 재성이 들어오는","집중을 흩뜨리는 재성","돈·약속 같은 딴 일이 자꾸 끼어들기 쉬워");
        if(g==="상관") add(-1,"실수가 늘기 쉬운 상관이 들어오는","실수를 부르는 상관","아는 문제에서 실수하지 않게 검토를 꼭 해");
      } else if(k==="jobsearch"){
        if(g==="정관") add(3,"새 자리를 뜻하는 정관이 들어오는","새 자리를 뜻하는 정관","합격 소식이나 좋은 제안이 오기 쉬워");
        if(g==="편관") add(2,"도전하는 자리를 뜻하는 편관이 들어오는","도전하는 자리를 뜻하는 편관","경쟁이 센 곳에서도 붙기 좋아");
        if(g==="정인") add(2,"합격 통보와 계약 문서를 뜻하는 정인이 들어오는","합격 통보를 뜻하는 정인","서류 통과나 합격 연락이 오기 쉬워");
        if(yeokma) add(1,"이동을 뜻하는 역마가 드는","이동을 뜻하는 역마","새 지역이나 새 분야로 움직이기 좋아");
        if(g==="상관") add(-2,"말이 앞서기 쉬운 상관이 들어오는","말이 앞서는 상관","면접에서 불만이나 과한 말을 조심해");
        if(g==="겁재") add(-1,"경쟁자가 늘어나는 겁재가 들어오는","경쟁자를 뜻하는 겁재","지원자가 몰려 결과가 늦게 오기 쉬워");
      } else if(k==="move"){
        if(yeokma) add(2,"이동을 뜻하는 역마가 드는","이동을 뜻하는 역마","자리를 옮기는 일이 자연스럽게 풀려");
        if(monthClash) add(2,"지금 일 자리를 흔드는","지금 일 자리의 변화","지금 자리에 변화가 생기면서 옮길 명분이 생기기 쉬워");
        if(g==="정관") add(2,"새 자리를 뜻하는 정관이 들어오는","새 자리를 뜻하는 정관","더 나은 제안이 오기 쉬워");
        if(g==="정인") add(1,"계약 문서를 뜻하는 정인이 들어오는","계약 문서를 뜻하는 정인","조건을 문서로 확정하기 좋아");
        if(g==="겁재") add(-2,"조건 경쟁이 붙는 겁재가 들어오는","조건 경쟁을 뜻하는 겁재","급하게 옮기면 조건에서 손해 보기 쉬워");
        if(g==="상관") add(-1,"말이 앞서기 쉬운 상관이 들어오는","말이 앞서는 상관","퇴사 얘기를 감정적으로 꺼내기 쉬워");
      } else {
        if(g==="정관") add(3,"인정과 승진을 뜻하는 정관이 들어오는","인정과 승진을 뜻하는 정관","평가나 승진 얘기가 나오기 좋아");
        if(g==="정인") add(2,"윗사람이 끌어주는 정인이 들어오는","윗사람의 도움을 뜻하는 정인","도와주는 상사나 선배가 생기기 쉬워");
        if(g==="식신") add(1,"성과가 눈에 보이게 나오는 식신이 들어오는","성과를 뜻하는 식신","한 일을 보여주기 좋아");
        if(g==="상관") add(-3,"윗사람과 부딪히기 쉬운 상관이 들어오는","윗사람과 부딪히는 상관","불만은 말로 하지 말고 글로 정리해서 전해");
        if(monthClash) add(-1,"지금 일 자리를 흔드는","일 자리의 변화","부서 이동이나 업무 변화로 어수선해지기 쉬워");
      }
    } else if(c==="path"){
      if(g==="식신") add(2,"재능이 드러나는 식신이 들어오는","재능을 뜻하는 식신","해보고 싶은 걸 작게 시작해보기 좋아");
      if(g==="상관") add(2,"새 방식이 떠오르는 상관이 들어오는","새 방식을 뜻하는 상관","안 해본 분야를 시험해보기 좋아");
      if(g==="정인") add(2,"배움과 자격을 뜻하는 정인이 들어오는","배움을 뜻하는 정인","수업이나 자격증처럼 방향을 잡아줄 배움을 시작하기 좋아");
      if(g==="편인") add(1,"깊게 파고드는 편인이 들어오는","깊이 파는 편인","관심 분야를 깊게 알아보기 좋아");
      if(g==="정관"&&k!=="switch") add(1,"방향을 잡아주는 정관이 들어오는","방향을 잡아주는 정관","진로를 정하고 계획을 세우기 좋아");
      if(k==="switch"&&yeokma) add(2,"이동을 뜻하는 역마가 드는","이동을 뜻하는 역마","새 분야로 옮기는 일이 자연스럽게 풀려");
      if(k==="switch"&&monthClash) add(1,"지금 일 자리를 흔드는","지금 일 자리의 변화","지금 자리에 변화가 생기면서 옮길 계기가 생겨");
      if(k==="switch"&&g==="편관") add(-2,"부담이 커지는 편관이 들어오는","부담을 뜻하는 편관","새 시작보다 지금 일을 정리하는 데 써");
      if(g==="겁재") add(-1,"남과 비교가 커지는 겁재가 들어오는","비교를 부르는 겁재","남 따라 급하게 정하지 마");
    } else if(c==="people"){
      if(k==="friend"){
        if(g==="비견") add(2,"마음 맞는 친구를 뜻하는 비견이 들어오는","친구를 뜻하는 비견","새 친구가 생기거나 옛 친구와 다시 가까워지기 쉬워");
        if(g==="정인") add(2,"나를 이해해주는 사람을 뜻하는 정인이 들어오는","이해해주는 사람을 뜻하는 정인","속 얘기를 꺼내기 좋아");
        if(g==="식신") add(1,"편하게 어울리기 좋은 식신이 들어오는","편한 어울림을 뜻하는 식신","가볍게 만나 웃기 좋아");
        if(g==="겁재") add(-2,"비교와 돈 문제로 부딪히기 쉬운 겁재가 들어오는","비교를 부르는 겁재","돈 거래나 비교하는 말은 피해");
        if(dayClash) add(-2,"너 자신의 자리와 부딪히는","너 자신의 자리와의 충","작은 말에도 서운해지기 쉬워");
      } else if(k==="work"){
        if(g==="정인") add(2,"윗사람이 도와주는 정인이 들어오는","윗사람의 도움을 뜻하는 정인","상사와 관계를 풀기 좋아");
        if(g==="정관") add(2,"역할과 선이 분명해지는 정관이 들어오는","역할을 정리하는 정관","업무 분담을 다시 정하기 좋아");
        if(g==="식신") add(1,"분위기가 부드러워지는 식신이 들어오는","부드러운 분위기의 식신","팀 사람들과 가벼운 대화를 늘리기 좋아");
        if(g==="상관") add(-2,"말실수로 부딪히기 쉬운 상관이 들어오는","말실수를 부르는 상관","회의에서 반박은 한 번 참고 나중에 따로 말해");
        if(g==="편관") add(-2,"윗사람 부담이 커지는 편관이 들어오는","윗사람 부담을 뜻하는 편관","무리한 지시가 늘 수 있으니 기록을 남겨");
        if(monthClash) add(-2,"직장 자리를 흔드는","직장 자리의 변화","팀 이동이나 사람 변화로 어수선해져");
      } else if(k==="family"){
        if(g==="정인") add(3,"집안 어른과 풀리기 좋은 정인이 들어오는","집안 어른과의 화해를 뜻하는 정인","부모님과 대화를 다시 시작하기 좋아");
        if(g==="비견") add(1,"형제·또래 가족과 가까워지는 비견이 들어오는","형제를 뜻하는 비견","형제자매와 편하게 얘기하기 좋아");
        if(g==="식신") add(1,"집안 분위기가 부드러워지는 식신이 들어오는","부드러운 분위기의 식신","같이 밥 먹는 자리를 만들기 좋아");
        if(familyClash) add(-3,"부모·집안 자리와 부딪히는","집안 자리와의 충","집안의 큰 얘기는 이때 꺼내지 마");
        if(g==="겁재") add(-1,"집안 돈 문제가 생기기 쉬운 겁재가 들어오는","집안 돈 문제를 부르는 겁재","가족 간 돈 약속은 미뤄");
      } else {
        if(g==="식신") add(2,"하고 싶은 말을 부드럽게 꺼내기 좋은 식신이 들어오는","부드러운 말을 돕는 식신","거리를 두겠다는 말을 해도 덜 상처가 돼");
        if(g==="정관") add(2,"선을 긋기 좋은 정관이 들어오는","선을 긋는 정관","만나는 횟수를 정해 알리기 좋아");
        if(g==="편인") add(1,"혼자 정리할 시간이 생기는 편인이 들어오는","혼자만의 시간을 뜻하는 편인","자연스럽게 연락을 줄이기 좋아");
        if(g==="겁재") add(-2,"감정싸움이 붙기 쉬운 겁재가 들어오는","감정싸움을 부르는 겁재","이때 결론 내리면 싸움으로 끝나기 쉬워");
        if(dayClash) add(-2,"너 자신의 자리와 부딪히는","너 자신의 자리와의 충","감정이 격해지기 쉬우니 중요한 말은 미뤄");
      }
    } else {
      if(k==="overthink"){
        if(g==="식신") add(3,"생각을 밖으로 풀어내기 좋은 식신이 들어오는","생각을 풀어내는 식신","몸을 쓰거나 뭔가 만들면서 생각이 줄어들어");
        if(g==="상관") add(1,"말로 풀어내기 좋은 상관이 들어오는","말로 푸는 상관","털어놓으면 금방 가벼워져");
        if(g==="정인") add(2,"회복을 뜻하는 정인이 들어오는","회복을 뜻하는 정인","잠이 깊어지고 마음이 차분해지기 쉬워");
        if(g==="편인") add(-2,"생각이 더 깊어지기 쉬운 편인이 들어오는","생각을 키우는 편인","혼자 곱씹는 시간을 정해두고 끊어");
        if(g==="편관") add(-2,"부담이 몰려오는 편관이 들어오는","부담을 뜻하는 편관","새 일을 받지 말고 일정을 비워둬");
      } else {
        if(g==="정인") add(3,"회복을 뜻하는 정인이 들어오는","회복을 뜻하는 정인","쉬는 만큼 기운이 확실히 채워져");
        if(g==="식신") add(2,"즐거움이 돌아오는 식신이 들어오는","즐거움을 뜻하는 식신","좋아하는 걸 하면서 기분이 풀리기 쉬워");
        if(g==="편인") add(1,"혼자 쉬며 정리하기 좋은 편인이 들어오는","혼자 쉬는 편인","혼자만의 시간이 약이 돼");
        if(g==="비견"&&weak) add(1,"기댈 사람이 생기는 비견이 들어오는","기댈 사람을 뜻하는 비견","친구나 동료에게 힘든 걸 말하기 좋아");
        if(g==="편관") add(-3,"부담이 몰려오는 편관이 들어오는","부담을 뜻하는 편관","새 일을 받지 말고 일정을 비워둬");
        if(g==="상관") add(-1,"예민해지기 쉬운 상관이 들어오는","예민함을 키우는 상관","잠부터 먼저 챙겨");
        if(g==="겁재") add(-1,"남과 비교가 커지는 겁재가 들어오는","비교를 부르는 겁재","SNS를 줄여");
      }
    }
    return out;
  }

  function concernTimingPlan(reasoning,s,data){
    const today=String(reasoning?.timing?.today||"");
    const limit=yearAheadYmd(reasoning);
    const scored=(reasoning?.timing?.nearMonths||[]).filter(r=>String(r?.endYmd||"")>today).map(row=>{
      const sigs=concernSignals(reasoning,s,data,monthCtx(row));
      const concernScore=sigs.reduce((a,x)=>a+x.s,0);
      const engineScore=(CLASS_BONUS[row.class]||0)*2;
      const score=concernScore+engineScore;
      return {row,sigs,score,concernScore,engineScore,near:!limit||String(row.startYmd)<limit};
    });
    const hasPos=x=>x.sigs.some(y=>y.s>0)&&!["caution","mild-caution"].includes(x.row?.class);
    const hasNeg=x=>x.sigs.some(y=>y.s<0)&&!["supportive","mild-support"].includes(x.row?.class);
    const byBest=(a,b)=>b.score-a.score||String(a.row.startYmd).localeCompare(String(b.row.startYmd));
    const best=scored.filter(x=>x.near&&x.score>=2&&hasPos(x)).sort(byBest).slice(0,2);
    const far=best.length?[]:scored.filter(x=>!x.near&&x.score>=2&&hasPos(x)).sort(byBest).slice(0,1);
    const worst=scored.filter(x=>x.near&&x.score<=-2&&hasNeg(x))
      .sort((a,b)=>a.score-b.score||String(a.row.startYmd).localeCompare(String(b.row.startYmd)))[0]||null;
    const used=new Set([...best,...far,worst].filter(Boolean).map(x=>x.row.startYmd));
    const extra=scored.filter(x=>x.near&&!used.has(x.row.startYmd)&&x.score>=2&&hasPos(x)).sort(byBest).slice(0,1);
    return {scored,best,far,worst,extra,today};
  }
  function monthSpan(row,today){
    const y=Number(String(today).slice(0,4));
    const start=String(row?.startYmd||""), end=String(row?.endYmd||"");
    const sy=Number(start.slice(0,4)), ey=Number(end.slice(0,4));
    const isNow=start<=today;
    const endText=(ey&&ey!==(isNow?y:sy)?ey+"년 ":"")+Number(end.slice(5,7))+"월 "+Number(end.slice(8,10))+"일 전까지";
    if(isNow) return "지금부터 "+endText;
    return (sy&&sy!==y?sy+"년 ":"")+Number(start.slice(5,7))+"월 "+Number(start.slice(8,10))+"일부터 "+endText;
  }
  function posSigs(item){ return [...(item?.sigs||[])].filter(x=>x.s>0).sort((a,b)=>b.s-a.s); }
  function negSigs(item){ return [...(item?.sigs||[])].filter(x=>x.s<0).sort((a,b)=>a.s-b.s); }
  function goodMonthText(item,prevItem){
    const p=posSigs(item);
    const first=p[0], second=p[1];
    const prev=posSigs(prevItem);
    const sameSecond=!!second&&!!prev[1]&&prev[1].n===second.n;
    const secondText=second?(sameSecond?" 이 달에도 "+withJosa(second.n,"이","가")+" 같이 들어.":" 여기에 "+second.n+"까지 겹쳐."):"";
    if(!first) return "이 고민에 도움이 되는 신호가 겹치는 달이야.";
    const repeat=prev[0]&&first.n===prev[0].n?"1순위와 같은 "+withJosa(first.n,"이","가")+" 다시 들어오는 달이야.":first.a+" 달이야.";
    return repeat+secondText+" 사건을 확정하는 뜻이 아니라, 이 고민에서 움직임을 검토할 근거가 평소보다 겹친다는 뜻이야.";
  }
  function badMonthText(item){
    const n=negSigs(item)[0];
    return n?n.a+" 달이야. 사건을 예언하는 뜻은 아니고, 이 고민에서 큰 결정을 한 번 더 확인할 신호로 봐.":"이 고민에서 조심 신호가 겹치는 달이야.";
  }
  // NOTE2의 "좋은 달 / 피할 달" 줄. 1순위·2순위는 이유와 그때 생기는 일까지, 피할 달은 이유와 할 일까지 쓴다.
  function timingAnswerLines(reasoning,s,data,good,bad){
    const plan=concernTimingPlan(reasoning,s,data);
    const lines=[];
    if(plan.best.length){
      const b1=plan.best[0], b2=plan.best[1];
      lines.push("<b>"+good+" 1순위 — "+monthSpan(b1.row,plan.today)+"</b>. "+goodMonthText(b1));
      if(b2) lines.push("<b>2순위 — "+monthSpan(b2.row,plan.today)+"</b>. "+goodMonthText(b2,b1));
    } else if(plan.far.length){
      lines.push("<b>"+good+"</b> — 1년 안에는 이 고민에 딱 맞는 달이 두드러지지 않아. 가장 가까운 건 "+monthSpan(plan.far[0].row,plan.today)+"이고, "+goodMonthText(plan.far[0]));
    } else {
      lines.push("<b>"+good+"</b> — 앞으로 1년 반 동안 이 고민에서 특별히 튀는 달 없이 고르게 가. 그래서 날짜를 기다리기보다 준비되는 대로 움직이는 게 맞아.");
    }
    if(plan.worst) lines.push("<b>"+bad+" — "+monthSpan(plan.worst.row,plan.today)+"</b>. "+badMonthText(plan.worst));
    return {lines,plan};
  }
  // 올해·내년이 이 고민에 어떤 해인지 한 줄로.
  function concernYearAnswer(reasoning,s,data){
    const y=Number(String(reasoning?.timing?.today||"").slice(0,4));
    const years=reasoning?.timing?.years||[];
    const rows=[y,y+1].map(yy=>years.find(r=>r?.year===yy)).filter(Boolean);
    if(rows.length<2) return "";
    const info=rows.map(yr=>{
      const sigs=concernSignals(reasoning,s,data,yearCtx(reasoning,yr));
      const gz=String(yr.seyunGanZhi||"");
      return {name:(GAN_KR[gz[0]]||"")+(ZHI_KR[gz[1]]||"")+"년",score:sigs.reduce((a,x)=>a+x.s,0),top:[...sigs].sort((a,b)=>Math.abs(b.s)-Math.abs(a.s))[0]||null};
    });
    const word=CONCERN_SHORT[s.concern]||"이 고민";
    const part=(x,last)=>x.top?x.top.a+" "+(last?"해야":"해고"):word+" 쪽으로 크게 움직이지 않는 "+(last?"해야":"해고");
    const head=!info[0].top&&!info[1].top
      ? "올해 "+withJosa(info[0].name,"과","와")+" 내년 "+info[1].name+" 모두 "+word+" 쪽으로 크게 움직이는 해는 아니야."
      : "올해 "+withJosa(info[0].name,"은","는")+" "+part(info[0],false)+", 내년 "+withJosa(info[1].name,"은","는")+" "+part(info[1],true)+".";
    const a=info[0].score, b=info[1].score;
    const tail=a>=2&&b>=2?" 두 해 모두 "+word+" 쪽으로 열려 있어서, 이 2년이 제일 좋은 시기야."
      :a>=2?" 올해가 더 좋은 해라, 올해 안에 움직이는 게 유리해."
      :b>=2?" 내년이 더 좋은 해라, 올해는 준비하고 내년에 크게 움직여."
      :a<=-2&&b<=-2?" 두 해 모두 "+word+" 쪽은 조심스럽게 가는 해라, 크게 벌리기보다 지키는 게 먼저야."
      :a<=-2?" 올해는 조심스럽게 가고, 내년에 다시 보는 게 좋아."
      :!info[0].top&&!info[1].top?" 그래서 한 해를 통째로 믿기보다, 달 단위로 좋은 때를 골라 움직이는 게 맞아."
      :" 두 해 모두 크게 기울지 않아서, 달 단위로 좋은 때를 골라 움직이면 돼.";
    return "<b>올해와 내년</b> — "+head+tail;
  }

  // ----- v8 답 재료: 구체적인 이름까지 쓰기 위한 표 -----
  // [그룹][필요한 오행] → 실제로 할 수 있는 부업 예시
  const SIDE_ITEMS={
    output:{mok:"손글씨·일러스트 굿즈, 식물·원예 소품, 옷 리폼",hwa:"숏폼 영상 편집, 네일·메이크업 출장, 디저트·베이킹 판매",to:"수제 반찬·건강 간식, 도자기·공예품, 인테리어 소품 제작",geum:"액세서리·금속 공예, 사진 촬영·보정, 전자기기 커스텀",su:"음료·커피 레시피 판매, 여행 사진·영상 콘텐츠, 향초·디퓨저 제작"},
    wealth:{mok:"중고 의류·책 리셀, 식물·꽃 공동구매, 교육용품 유통",hwa:"화장품·뷰티템 공동구매, 공연·행사 티켓 대행, 인기 굿즈 리셀",to:"지역 농산물·특산품 판매, 중고 가구 리셀, 생활용품 공동구매",geum:"전자기기·카메라 중고 거래, 명품·시계 리셀, 운동용품 구매대행",su:"해외 직구 대행, 수입 식품·음료 판매, 여행 상품 제휴 판매"},
    print:{mok:"과외·학습 코칭, 독서·글쓰기 모임 운영, 전자책 출판",hwa:"말하기·발표 코칭, 뷰티·스타일링 클래스, 온라인 강의",to:"살림·재테크 노하우 강의, 상담·멘토링, 자격증 스터디 운영",geum:"엑셀·코딩 강의, 운동 지도, 분석 리포트 작성",su:"외국어 과외, 여행 코스 설계, 심리·명상 상담"},
    officer:{mok:"교육기관 운영 대행, 행사 진행 스태프, 블로그 관리 대행",hwa:"SNS 계정 운영 대행, 행사·파티 기획 대행, 매장 홍보 관리",to:"숙소·공간 관리 대행, 사무 행정 대행, 주말 매장 관리",geum:"회계·세무 보조, 데이터 정리 대행, 장비 점검 관리",su:"배송·물류 관리, 해외 거래처 연락 대행, 예약·고객응대 대행"},
    self:{mok:"1:1 레슨, 프리랜스 번역·교정, 인테리어 컨설팅",hwa:"프리랜스 디자인, 퍼스널컬러·스타일 컨설팅, 행사 MC·촬영 모델",to:"정리수납 서비스, 청소·이사 전문 서비스, 반려동물 돌봄",geum:"프리랜스 개발, 기기·차량 수리, 퍼스널 트레이닝",su:"프리랜스 통역, 음악 레슨·작곡, 1인 배달·운송"},
  };
  const SIDE_SHAPE={
    output:"돈이 들어오는 모양은, 처음엔 작게 팔리다가 후기가 쌓이면서 꾸준히 늘어나는 식이야.",
    wealth:"돈이 들어오는 모양은, 건당 수익이 크고 달마다 들쭉날쭉한 식이야.",
    print:"돈이 들어오는 모양은, 한 번 만든 강의나 자료가 반복해서 팔리는 식이야.",
    officer:"돈이 들어오는 모양은, 매달 정해진 금액이 안정적으로 들어오는 식이야.",
    self:"돈이 들어오는 모양은, 네가 움직인 만큼 바로바로 들어오는 식이야.",
  };
  const SIDE_PLUS={
    output:"만드는 걸 좋아하면 오래 할 수 있어.",wealth:"사람 만나는 걸 좋아하면 빨리 벌 수 있어.",print:"아는 게 쌓일수록 몸값이 올라가.",
    officer:"본업과 시간이 겹치지 않으면 안정적인 부수입이 돼.",self:"이미 가진 기술이 있으면 바로 시작할 수 있어.",
  };
  const SIDE_AVOID_WHY={
    self:"사람이 끼는 순간 돈이 나눠지고 관계까지 불편해져서, 네 사주에선 벌어도 남는 게 제일 적어.",
    output:"만드는 데 힘을 다 써서 팔 기운이 안 남고, 안 팔린 재고가 그대로 손해가 돼.",
    wealth:"한 번 크게 걸었다가 잃으면 네 사주는 회복이 오래 걸려서, 번 것보다 잃는 게 커지기 쉬워.",
    officer:"본업 책임까지 겹쳐서 둘 다 흐트러지고, 결국 부업 때문에 본업 평가까지 떨어지기 쉬워.",
    print:"준비만 길어지고 돈이 되는 단계까지 가질 못해서, 쓴 돈만 남기 쉬워.",
  };
  const INCOME_HOW={
    officer:"평가 시즌 전에 올해 한 일을 숫자로 정리해서 먼저 보여주고, 원하는 직급과 금액을 분명히 말해.",
    wealth:"성과가 숫자로 바로 찍히는 일을 맡고, 그 숫자를 근거로 성과급이나 수당을 요구해.",
    output:"지금 받는 단가를 한 단계 올려서 제시하고, 따로 받는 외주를 하나 만들어.",
    print:"자격증이나 전문 분야 하나를 정해서, 그걸 근거로 몸값을 다시 매겨.",
    self:"회사 밖에서 내 이름으로 받는 일을 작게 시작해서, 내 몫을 직접 정하는 방식으로 옮겨가.",
  };
  const INCOME_AVOID_WHY={
    self:"네 사주는 말 안 하면 아무도 안 챙겨주는 쪽이라, 기다리는 동안 수입은 그대로야.",
    output:"싸게 많이 하면 일만 늘고 몸값은 안 올라서, 나중엔 올리기가 더 어려워져.",
    wealth:"옮길 때마다 처음부터 다시 쌓아야 해서, 길게 보면 오히려 손해야.",
    officer:"책임만 늘고 보상 얘기를 미루면, 일 잘하는 사람으로만 남고 돈은 안 따라와.",
    print:"준비가 끝나길 기다리면 협상할 타이밍을 계속 놓쳐.",
  };
  const LEAK_WHY={
    self:"친구·동료처럼 나와 나란히 서는 힘인 비겁이 제일 커서, 사람 사이 의리로 돈을 쓰는 게 자연스러운 사주야.",
    output:"표현하고 즐기는 힘인 식상이 제일 커서, 기분이 곧 지출로 이어지기 쉬워.",
    wealth:"돈을 굴리는 힘인 재성이 제일 커서, 여기저기 조금씩 걸어두는 돈이 많아.",
    officer:"책임과 체면을 뜻하는 관성이 제일 커서, 안 내면 불편한 돈을 못 끊어.",
    print:"생각과 회복을 뜻하는 인성이 제일 커서, 지친 나를 달래는 데 돈이 나가.",
  };
  const LEAK_FIX={
    self:"빌려주거나 대신 내기 전에 이번 달 사람 예산을 정해두고, 그 안에서만 써.",
    output:"사고 싶은 건 장바구니에 넣고 사흘 뒤에 다시 봐. 그때도 필요하면 사.",
    wealth:"걸어둔 투자·구독·할인 결제를 전부 적어보고, 수익이 안 나는 건 이번 달에 정리해.",
    officer:"경조사·선물은 한 달 한도를 정하고, 넘으면 마음만 전해도 돼.",
    print:"배달·택시·자기계발비를 한 통장으로 묶어서 한도를 정해.",
  };
  const SAVE_WHY={
    print:"네 사주에 필요한 게 안정감과 보호라, 믿을 만한 곳에 맡겨두면 마음이 편해서 오래 가.",
    self:"네 사주에 필요한 게 내 기준이라, 내가 직접 정하고 지키는 방식이 제일 잘 맞아.",
    output:"네 사주에 필요한 게 눈에 보이는 결과라, 모은 돈으로 할 일이 눈에 보여야 계속 모아.",
    wealth:"네 사주에 필요한 게 돈 관리 감각이라, 통장마다 돈의 자리를 정해두면 새지 않아.",
    officer:"네 사주에 필요한 게 규칙이라, 한번 정한 규칙을 못 깨게 묶어두는 게 맞아.",
  };
  // [그룹][오행] → 실제 직무·직업 이름
  const JOB_ITEMS={
    officer:{mok:"교육청·학교 행정, 교육기업 관리직, 공공기관 기획",hwa:"방송·광고 대기업 관리직, 공기업 홍보, 문화재단 행정",to:"공기업·지자체 행정, 건설·부동산 대기업 관리직, 병원 행정",geum:"은행·금융권, 대기업 인사·총무, 군무원·경찰 행정",su:"무역·물류 대기업, 항공·해운사 관리직, 공공기관 대외협력"},
    wealth:{mok:"교육·출판 영업, 패션 MD, 인테리어 영업",hwa:"뷰티·광고 영업, 이커머스 MD, 마케팅 성과 분석",to:"부동산·건설 영업, 식품 MD, 구매·자재 관리",geum:"증권·보험·은행 영업, 재무·회계, IT 기기 영업",su:"무역 영업, 유통·물류 구매, 여행 상품 기획"},
    output:{mok:"교육 콘텐츠 기획, 편집 디자인, 패션 디자인",hwa:"영상·광고 콘텐츠 제작, UX·UI 디자인, 방송 작가",to:"공간·인테리어 설계, 식품 연구개발, 건축 설계",geum:"개발자, 제품 디자인, 품질·설계 엔지니어",su:"마케팅 콘텐츠, 음료·여행 브랜드 기획, 음향·영상 편집"},
    print:{mok:"교사·강사, 연구원, 편집자",hwa:"교육 코디네이터, 상담사, 기자·에디터",to:"사회복지사, 보건 전문직, 자격 기반 사무직",geum:"데이터 분석가, 법무·세무 보조, 연구 기술직",su:"통번역, 심리상담, 해외 교육 코디"},
    self:{mok:"물리치료사, 헤어디자이너, 플로리스트",hwa:"메이크업 아티스트, 사진가, 요리사",to:"간호사·치위생사, 공인중개사, 조리사",geum:"정비·기술직, 약사·임상병리사, 트레이너",su:"바리스타·소믈리에, 승무원, 물류 전문기사"},
  };
  const JOB_WHY={
    officer:"정해진 틀 안에서 믿음을 쌓는 자리라, 네 사주가 가장 안정적으로 평가받는 곳이야.",
    wealth:"한 만큼 숫자로 돌아오는 자리라, 네 사주가 가장 빨리 성과를 내는 곳이야.",
    output:"만든 걸 보여주는 자리라, 네 사주의 재주가 그대로 실력으로 인정받는 곳이야.",
    print:"아는 게 무기가 되는 자리라, 네 사주가 오래 갈수록 값이 올라가는 곳이야.",
    self:"내 손기술이 곧 내 몫인 자리라, 네 사주가 남 눈치 안 보고 버티는 곳이야.",
  };
  const INTERVIEW={
    정관:"성실함보다 ‘맡으면 끝까지 책임진 경험’ 하나를 구체적으로 말해.",편관:"힘든 상황을 버텨서 결과를 낸 경험을 앞에 세워.",
    정재:"숫자로 남긴 성과를 먼저 말해. 금액이든 기간이든 하나만 있어도 돼.",편재:"사람을 만나서 일을 성사시킨 경험을 이야기로 풀어.",
    식신:"꾸준히 만들어온 결과물을 직접 보여줘.",상관:"문제를 바꾼 경험은 좋지만, 이전 회사 흉은 절대 꺼내지 마.",
    정인:"배운 걸 실제로 적용한 사례를 말해. 공부한 목록만 나열하면 약해.",편인:"네 방식이 달랐던 이유를 짧게 설명하고, 결과로 마무리해.",
    비견:"혼자 끝까지 해낸 일을 말하되, 팀과 맞춘 부분도 한 줄 붙여.",겁재:"경쟁에서 이긴 경험보다 같이 이긴 경험을 말해.",
  };
  const STUDY_STYLE={
    정관:"계획표를 짜고 시간 단위로 지키는 방식",편관:"모의고사와 마감을 먼저 걸어두고 몰아붙이는 방식",
    정재:"분량을 잘게 쪼개서 매일 체크하는 방식",편재:"짧고 굵게 몰아서 하고 확실히 쉬는 방식",
    식신:"같은 시간·같은 장소에서 꾸준히 반복하는 방식",상관:"문제를 풀고 틀린 걸 남에게 설명해보는 방식",
    정인:"강의를 듣고 내 말로 정리하는 방식",편인:"한 과목씩 끝까지 깊게 파는 방식",
    비견:"혼자 내 페이스대로 하는 방식",겁재:"스터디에서 서로 경쟁하는 방식",
  };
  const EXAM_DAY={
    정관:"긴장하면 아는 문제도 두 번 의심해. 처음 고른 답을 믿어.",편관:"초반에 어려운 문제에 오래 매달리지 마.",
    정재:"시간 배분을 미리 정해두고 그대로 지켜.",편재:"자신 있는 문제부터 빠르게 풀고 돌아와.",
    식신:"평소 루틴대로 먹고 자는 게 제일 중요해.",상관:"아는 문제에서 실수가 나기 쉬우니 검토 시간을 꼭 남겨.",
    정인:"완벽하게 이해하려다 시간이 부족해지기 쉬워.",편인:"한 문제에 생각이 깊어지면 표시하고 넘어가.",
    비견:"남과 비교하지 말고 내 속도대로 풀어.",겁재:"옆 사람 속도에 휘둘리지 마.",
  };
  const EXAM_KEY_WHY={
    self:"네 사주는 고집이 있어서, 안 되는 방식을 끝까지 붙잡는 게 제일 큰 손해야.",
    output:"네 사주는 새로운 걸 좋아해서, 지루한 반복에서 무너지기 쉬워.",
    wealth:"네 사주는 효율을 따져서, 기본을 건너뛰고 응용부터 하다가 구멍이 생겨.",
    officer:"네 사주는 평가 앞에서 긴장이 커서, 실전 연습이 점수를 제일 크게 바꿔.",
    print:"네 사주는 이해하는 데 시간을 많이 써서, 정리만 하다 문제 풀 시간이 모자라.",
  };
  const CURRENT_WHY={
    self:"네 사주는 혼자 조용히 끝내는 편이라, 말 안 하면 네 몫이 안 보여.",
    output:"네 사주는 아이디어는 좋은데, 윗사람 입장에서 들으면 불만처럼 들릴 때가 있어.",
    wealth:"네 사주는 계산이 빨라서, 보상 얘기를 먼저 꺼내면 손해 보는 사람처럼 보이기 쉬워.",
    officer:"네 사주는 알아서 해주길 기다리는 편이라, 원하는 걸 말 안 하면 계속 뒤로 밀려.",
    print:"네 사주는 완벽해질 때까지 붙잡고 있다가, 보고 타이밍을 놓치기 쉬워.",
  };
  const CURRENT_NEED={
    self:"내 담당 범위를 분명히 해서 성과가 내 이름으로 남게 하는 것",output:"한 일을 보고서나 발표처럼 눈에 보이게 만드는 것",
    wealth:"한 일을 숫자로 기록해두는 것",officer:"자격이나 직함처럼 공식적인 인정을 챙기는 것",print:"끌어줄 선배나 멘토 한 명을 만드는 것",
  };
  const CURRENT_EX={
    self:"일주일에 한 번, 끝낸 일 세 줄 요약을 보내는 것부터 해.",
    output:"‘이건 문제예요’ 대신 ‘이렇게 바꾸면 이만큼 좋아져요’로 말해.",
    wealth:"이번 분기 성과를 숫자로 먼저 쌓고, 평가 면담에서 그 숫자를 꺼내.",
    officer:"‘이 업무를 맡고 싶어요’처럼 원하는 걸 한 문장으로 요청해.",
    print:"마감 이틀 전에 중간본을 먼저 보여주고 의견을 받아.",
  };
  // 배우자 자리(일지) 오행 → 외모 인상
  const PARTNER_LOOK={
    mok:"키가 크거나 몸선이 길고 곧은 편이야. 얼굴선은 갸름하고 눈매가 순해서 첫인상이 부드러워.",
    hwa:"표정이 밝고 눈빛이 또렷해서 첫인상이 화사해. 옷차림이나 머리 스타일에 신경을 쓰는 편이라 멀리서도 눈에 띄어.",
    to:"체격이 듬직하고 얼굴형이 둥글거나 각진 편이야. 웃는 얼굴이 편안해서 처음 봐도 믿음이 가는 인상이야.",
    geum:"피부가 맑고 이목구비가 또렷해. 깔끔하고 단정한 스타일이라 처음엔 살짝 차가워 보일 수 있어.",
    su:"눈매가 깊고 얼굴선이 부드러운 곡선이야. 말수가 많지 않아도 분위기가 있어서 자꾸 눈이 가는 인상이야.",
  };
  const PARTNER_LOOK_SHORT={mok:"키가 크고 선이 곧은 사람",hwa:"표정이 밝고 화사한 사람",to:"듬직하고 편안한 인상의 사람",geum:"깔끔하고 이목구비가 또렷한 사람",su:"눈매가 깊고 분위기 있는 사람"};
  const PARTNER_STYLE={mok:"캐주얼하고 자연스러운",hwa:"화사하고 트렌디한",to:"편안하고 무난한",geum:"깔끔하고 정돈된",su:"차분하고 분위기 있는"};
  const PARTNER_CHAR={
    정재:"성실하고 생활력이 강한 사람이야. 약속을 잘 지키고 돈 관리도 알뜰해서, 같이 있으면 생활이 안정돼.",
    편재:"활동적이고 통이 큰 사람이야. 사람 만나는 걸 좋아하고 씀씀이도 시원해서, 같이 있으면 새로운 경험이 많아.",
    정관:"반듯하고 책임감이 강한 사람이야. 말과 행동이 같고 예의가 발라서, 믿고 기댈 수 있어.",
    편관:"카리스마 있고 결단이 빠른 사람이야. 추진력이 세서 끌려가듯 빠져들 수 있는데, 고집도 센 편이야.",
    정인:"따뜻하고 잘 챙겨주는 사람이야. 네 얘기를 끝까지 들어주고, 힘들 때 먼저 알아채 줘.",
    편인:"생각이 깊고 독특한 감각을 가진 사람이야. 말은 많지 않지만 한마디가 깊고, 혼자만의 세계가 있어.",
    식신:"편하고 잘 웃는 사람이야. 맛있는 거 먹고 즐겁게 지내는 걸 좋아해서, 같이 있으면 마음이 풀어져.",
    상관:"말을 잘하고 재치 있는 사람이야. 대화가 끊이지 않고 센스가 있는데, 할 말은 하는 편이야.",
    비견:"친구처럼 대등한 사람이야. 서로 간섭하지 않고 각자 일을 존중해줘서 편해.",
    겁재:"에너지 넘치고 승부욕 있는 사람이야. 같이 있으면 활력이 생기는데, 자존심 싸움은 조심해야 해.",
  };
  const MEET_ROUTE={
    정재:"지인 소개나 오래 알던 사람 중에서 인연이 이어지기 쉬워. 처음부터 불꽃 튀기보다 편하게 알던 사이가 연인이 되는 식이야.",
    편재:"모임·여행·행사처럼 사람이 많이 오가는 자리에서 우연히 만나기 쉬워.",
    정관:"직장이나 학교, 믿을 만한 사람의 소개처럼 공식적인 자리에서 만나기 쉬워.",
    편관:"운동·일·프로젝트처럼 같이 부딪히며 뭔가 하는 자리에서 강하게 끌리기 쉬워.",
    정인:"스터디·강의·어른의 소개처럼 배우거나 챙김받는 자리에서 만나기 쉬워.",
    편인:"온라인이나 취미 커뮤니티처럼 관심사가 맞는 좁은 곳에서 만나기 쉬워.",
    식신:"맛집 모임·취미 클래스처럼 즐겁게 노는 자리에서 자연스럽게 가까워지기 쉬워.",
    상관:"대화가 많은 자리나 메시지로 먼저 말이 통하면서 가까워지기 쉬워.",
    비견:"친구의 친구나 동호회처럼 친구 관계가 넓어지는 자리에서 만나기 쉬워.",
    겁재:"친구 모임이나 경쟁하는 자리에서 만나기 쉬운데, 친구와 겹치는 사람은 조심해.",
  };
  const MEET_PLACE_LONG={
    mok:"서점·도서관·강의실이나 공원 산책로처럼 배우고 걷는 곳",hwa:"공연장·전시·페스티벌이나 밝은 카페처럼 사람 많고 화사한 곳",
    to:"동네 모임·요리 클래스·봉사나 동호회처럼 편하게 오래 머무는 곳",geum:"헬스장·러닝 모임·전문 세미나처럼 깔끔하고 목적이 분명한 곳",
    su:"바닷가·여행지나 조용한 와인 모임처럼 분위기 있는 곳",
  };
  const AVOID_PARTNER={
    self:"처음부터 너랑 경쟁하려 들거나 자존심을 세우는 사람",output:"네 말을 가볍게 넘기거나 표현을 부담스러워하는 사람",
    wealth:"만나자마자 조건·돈 얘기부터 꺼내는 사람",officer:"책임만 떠넘기고 너한테 맞추라고만 하는 사람",
    print:"생각할 시간을 안 주고 결정을 재촉하는 사람",
  };
  const CRUSH_WHY={
    self:"네 사주는 자존심이 세서, 크게 고백하면 거절이 두려워 오히려 못 움직여.",
    output:"네 사주는 표현이 빨라서, 상대보다 먼저 너무 많이 보여주면 부담으로 느껴져.",
    wealth:"네 사주는 챙겨주는 걸로 마음을 보여줘서, 잘해주기만 하다 좋은 사람으로 끝나기 쉬워.",
    officer:"네 사주는 확실해질 때까지 기다리는 편이라, 타이밍을 놓치기 쉬워.",
    print:"네 사주는 상대 말 한마디를 오래 해석해서, 혼자 결론 내리기 쉬워.",
  };
  const CRUSH_MISTAKE={
    self:"답장이 늦다고 너도 일부러 늦게 보내는 것",output:"하루에 너무 많은 메시지를 보내는 것",wealth:"선물이나 밥값으로 마음을 대신하는 것",
    officer:"상대가 먼저 고백하길 끝까지 기다리는 것",print:"상대 SNS를 보며 혼자 의미를 붙이는 것",
  };
  const FIGHT_PATTERN={
    self:"누가 맞는지 끝까지 따지다가 둘 다 지치는 쪽이야.",output:"서운한 걸 바로 말하는데, 말이 세게 나가서 상처가 되기 쉬워.",
    wealth:"누가 더 많이 했는지 계산이 시작되면서 싸움이 커져.",officer:"참고 맞춰주다가 한 번에 터지는 쪽이야.",
    print:"말 안 하고 혼자 곱씹다가, 상대는 이유도 모르고 멀어지는 쪽이야.",
  };
  const KEEP_LOVE={
    self:"각자 시간을 존중하고, 내 기준을 한 번은 분명히 말하는 것",output:"서운한 건 그날 말하되, 한 가지만 짧게 말하는 것",
    wealth:"데이트·돈·시간을 둘이 같이 계획하는 것",officer:"둘만의 약속과 규칙을 정해서 지키는 것",
    print:"싸운 뒤엔 따뜻한 말 한마디로 먼저 챙겨주는 것",
  };
  const SPOUSE_WANTS={
    정재:"꾸준함과 약속",편재:"같이 하는 새로운 경험",정관:"믿음과 예의",편관:"확실한 결정과 편",정인:"따뜻한 관심",편인:"혼자만의 시간",
    식신:"편안한 일상",상관:"말이 통하는 대화",비견:"대등한 관계",겁재:"같은 편이라는 확신",
  };
  const CONTACT_WAY={
    self:"길게 설명하지 말고 ‘잘 지내?’처럼 가볍게 한 줄만 보내.",output:"감정을 쏟아내는 긴 메시지는 보내지 마. 짧게, 한 번만.",
    wealth:"선물이나 부탁을 핑계로 연락하지 말고, 안부 하나로 시작해.",officer:"사과할 게 있으면 사과부터, 짧고 분명하게 해.",
    print:"상대 반응을 오래 해석하지 말고, 답이 없으면 그대로 받아들여.",
  };
  const REPEAT_FIX={
    self:"다시 만나면 누가 맞는지 따지는 대신 ‘이번엔 네 말대로 해보자’를 한 번은 해.",output:"다시 만나면 서운한 건 그날 말하되, 말투를 한 단계 낮춰.",
    wealth:"다시 만나면 누가 더 했는지 세지 않기로 먼저 약속해.",officer:"다시 만나면 참다가 터지지 말고, 작을 때 말하는 연습을 해.",
    print:"다시 만나면 혼자 결론 내리지 말고 직접 물어보는 걸 약속해.",
  };
  const PATH_WHY={
    officer:"정해진 틀에서 신뢰를 쌓는 일이라, 네 사주가 가장 오래 안정적으로 버티는 방향이야.",
    wealth:"결과가 돈으로 바로 보이는 일이라, 네 사주가 가장 빨리 성과를 내는 방향이야.",
    output:"손과 머리로 뭔가를 만들어내는 일이라, 네 사주의 재주가 가장 잘 드러나는 방향이야.",
    print:"배우고 알려주는 일이라, 네 사주가 할수록 깊어지고 값이 올라가는 방향이야.",
    self:"내 이름과 기술로 하는 일이라, 네 사주가 남 밑에서보다 훨씬 힘을 내는 방향이야.",
  };
  const TALENT={
    정관:"맡은 일을 흐트러짐 없이 끝내는 신뢰",편관:"어려운 상황에서 버티고 밀어붙이는 힘",정재:"꼼꼼하게 관리하고 계산하는 감각",
    편재:"사람과 기회를 연결하는 감각",식신:"한 가지를 꾸준히 만들어내는 힘",상관:"문제를 찾아서 새롭게 바꾸는 머리",
    정인:"깊게 이해하고 쉽게 설명하는 힘",편인:"남들이 못 보는 걸 찾아내는 눈",비견:"혼자서도 끝까지 해내는 힘",겁재:"경쟁 앞에서 오히려 커지는 추진력",
  };
  const PATH_BOOST={
    self:"네 이름이 남는 결과를 하나 만들어",output:"만든 걸 사람들에게 보여주는 창구를 하나 열어",wealth:"성과를 숫자로 기록해",
    officer:"자격이나 직함처럼 공식적인 인정을 하나 챙겨",print:"배운 걸 누군가에게 가르쳐봐",
  };
  const SWITCH_KEY={
    self:"옮기기 전에 새 분야에서 혼자 해볼 수 있는 작은 일 하나를 먼저 끝내봐.",output:"옮기기 전에 새 분야 결과물을 하나 만들어서 반응부터 봐.",
    wealth:"옮기기 전에 새 분야에서 받을 수 있는 금액을 먼저 확인해.",officer:"옮기기 전에 새 분야 자격이나 소속부터 확보해.",
    print:"옮기기 전에 새 분야를 석 달만 배워보고 정해.",
  };
  const TALENT_SCENE={
    self:"남들이 포기할 때도 혼자 끝까지 붙잡고 있어서, 결국 마무리는 네가 하는 경우가 많지?",
    output:"뭔가 만들거나 말로 풀어낼 때 사람들이 ‘어떻게 이런 생각을 했어?’ 하지?",
    wealth:"어디서 돈이 새는지, 뭐가 이득인지 남들보다 빨리 보이지?",
    officer:"한번 맡으면 끝까지 책임져서, 중요한 일은 결국 너한테 오지?",
    print:"남들이 대충 넘기는 것도 끝까지 이해해서, 설명을 잘한다는 말을 듣지?",
  };
  const STRENGTH_USE={
    self:"혼자 맡아서 끝내는 프로젝트나 1인 사업에서 제일 크게 쓰여.",output:"콘텐츠·디자인·기획처럼 결과물이 남는 일에서 제일 크게 쓰여.",
    wealth:"영업·재무·거래처럼 숫자가 오가는 일에서 제일 크게 쓰여.",officer:"관리·운영처럼 믿고 맡기는 자리에서 제일 크게 쓰여.",
    print:"교육·상담·연구처럼 깊이가 필요한 일에서 제일 크게 쓰여.",
  };
  const FRIEND_FIT={
    self:"자기 일이 있고 서로 간섭하지 않는 친구",output:"같이 뭔가 하면서 웃을 수 있는 친구",wealth:"약속과 돈 계산이 깔끔한 친구",
    officer:"예의 있고 선을 지키는 친구",print:"네 얘기를 판단 없이 들어주는 친구",
  };
  const FRIEND_AVOID={
    self:"늘 비교하고 이기려 드는 친구",output:"네 말꼬리를 잡거나 뒷말하는 친구",wealth:"돈 얘기가 흐리고 빌려가는 친구",
    officer:"부탁만 하고 네 부탁은 안 들어주는 친구",print:"네가 힘들 땐 연락이 없는 친구",
  };
  const WORK_FIT={
    self:"네 담당을 존중해주는 동료",output:"네 아이디어를 들어주는 상사",wealth:"성과를 공정하게 봐주는 상사",
    officer:"기준을 분명하게 말해주는 상사",print:"차근차근 알려주는 선배",
  };
  const WORK_CLASH={
    self:"네 일에 간섭하는 사람",output:"말을 끝까지 안 듣고 자르는 사람",wealth:"성과를 가로채는 사람",
    officer:"기준 없이 일을 떠넘기는 사람",print:"급하게 몰아붙이는 사람",
  };
  const DISTANCE_HOW={
    self:"끊는다고 선언하기보다 만나는 횟수를 조용히 줄여.",output:"하고 싶은 말은 한 번만, 짧고 담담하게 해.",
    wealth:"돈이나 부탁이 얽혀 있으면 그것부터 정리하고 거리를 둬.",officer:"도리 때문에 만나는 자리는 한 달에 한 번처럼 정해두고 그 이상은 거절해.",
    print:"혼자 참다가 멀어지지 말고, 서운했던 한 가지만 말하고 정해.",
  };
  const DISTANCE_CHECK={
    self:"그 사람을 만나고 나면 네 기준이 흔들리는지",output:"만나고 나서 할 말을 못 해 답답했는지",wealth:"주고받는 게 계속 한쪽으로 기울었는지",
    officer:"만남이 즐거움보다 의무로 느껴지는지",print:"만나고 나면 며칠씩 기분이 가라앉는지",
  };
  const TIRE_WHY={
    self:"네 사주는 도움을 청하기보다 혼자 해결하는 쪽이라, 짐이 한 사람한테 몰려.",
    output:"네 사주는 에너지를 밖으로 쓰는 쪽이라, 채우는 속도보다 쓰는 속도가 빨라.",
    wealth:"네 사주는 챙길 게 많은 쪽이라, 한꺼번에 몰리면 머리가 쉴 틈이 없어.",
    officer:"네 사주는 책임감이 커서, 힘들어도 맡은 걸 내려놓질 못해.",
    print:"네 사주는 생각이 많은 쪽이라, 몸은 쉬어도 머리는 계속 일해.",
  };
  const RECOVER_BY_GROUP={
    self:"믿는 사람 한 명에게 힘든 걸 털어놓는 것",output:"몸을 쓰거나 뭔가를 만드는 것",wealth:"해야 할 일을 적고 절반을 지우는 것",
    officer:"자는 시간과 일어나는 시간을 정해서 지키는 것",print:"충분히 자고 좋아하는 걸 조용히 즐기는 것",
  };
  const GUI_INTRO={year:"집안 어른이나 윗사람",month:"직장이나 부모님 쪽",day:"가까운 지인",hour:"후배나 아랫사람"};
  const FAMILY_PERSON={year:"조부모님이나 집안 어른",month:"부모님이나 형제",day:"배우자",hour:"자녀"};
  const THINK_CAUSE={
    self:"남한테 기대지 않고 혼자 결론을 내려는 성향",output:"머릿속에서 계속 말을 만들어내는 성향",wealth:"경우의 수를 계속 계산하는 성향",
    officer:"잘못될까 봐 미리 걱정하는 성향",print:"한 가지를 끝까지 곱씹는 성향",
  };

  function sideWhy(reasoning,g,N,G1){
    const sh=x=>groupShare(reasoning,x);
    // NOTE3의 "재주는 있는데 돈으로 바꾸는 단계가 약해"(식상 20% 이상·재성 12% 미만)와 말이 엇갈리지 않게 기준을 맞춘다.
    if(g==="output"&&sh("output")>=10&&sh("wealth")>=12) return "만드는 힘인 식상이 돈을 뜻하는 재성으로 바로 이어지는 사주라, 만든 게 그대로 돈이 돼.";
    if(g==="output"&&sh("output")>=15) return "만드는 재주는 충분한데 그걸 돈으로 바꾸는 힘은 약한 사주라, 처음부터 가격을 붙여 파는 방식으로 시작해야 실력만큼 돈이 돼.";
    if(g===N) return "네 사주에 제일 필요한 "+GROUP_NAME[N]+" 쪽 일이라, 하면 할수록 네 힘이 채워지면서 돈도 같이 붙어.";
    if(g===G1) return "네 사주에서 제일 큰 힘인 "+GROUP_NAME[G1]+" 쪽 일이라, 원래 잘하는 걸로 바로 돈을 벌 수 있어.";
    return "네 사주에서 힘이 잘 붙는 쪽이라, 들인 시간에 비해 남는 게 커.";
  }
  function moneyShapeLine(reasoning){
    const sh=x=>groupShare(reasoning,x);
    const rows=godRows(reasoning);
    const jj=Number(rows.find(r=>r.god==="정재")?.weight||0), pj=Number(rows.find(r=>r.god==="편재")?.weight||0);
    const v=verdictOf(reasoning);
    if(sh("wealth")<8) return "<b>네 돈복의 모양</b> — 돈이 저절로 따라오는 사주는 아니야. 대신 기술이나 자리로 돈을 불러오면 꾸준히 들어와서, 한 방보다 몸값을 올리는 쪽이 맞아.";
    if(v==="신약"&&sh("wealth")>=30) return "<b>네 돈복의 모양</b> — 돈 기회는 많은데, 한꺼번에 다 잡으면 버거운 사주야. 크게 한 번 거는 것보다 여러 개를 작게 굴리는 쪽이 맞아.";
    if(pj>jj) return "<b>네 돈복의 모양</b> — 크게 벌고 크게 움직이는 사업형이야. 월급 하나로는 답답하고, 기회가 올 때 한 번씩 크게 불리는 쪽이 맞아.";
    return "<b>네 돈복의 모양</b> — 꾸준히 들어오는 돈을 쌓아서 불리는 월급형이야. 한 방보다 오래 쌓을수록 확실하게 커져.";
  }
  function savingCapacityLine(reasoning){
    const sh=x=>groupShare(reasoning,x);
    const v=verdictOf(reasoning);
    if(v==="신약"&&sh("wealth")>=30) return "<b>모을 수 있는 사주야?</b> — 돈은 잘 도는데 붙잡아두는 힘이 약한 편이야. 그래서 의지로 참는 것보다, 월급날 자동으로 빠져나가게 해두는 게 제일 확실해.";
    if(sh("wealth")<8) return "<b>모을 수 있는 사주야?</b> — 큰돈이 한 번에 모이는 사주는 아니야. 대신 정해진 금액을 꾸준히 쌓으면, 새는 게 적어서 생각보다 빨리 불어나.";
    if(v==="신강"&&sh("wealth")>=15) return "<b>모을 수 있는 사주야?</b> — 벌고 지키는 힘이 둘 다 있는 사주야. 새는 구멍만 막으면 확실하게 모여.";
    return "<b>모을 수 있는 사주야?</b> — 새는 구멍만 막으면 무난하게 모이는 사주야. 큰 욕심보다 꾸준함이 이기는 쪽이야.";
  }
  function examVerdict(reasoning){
    const sh=x=>groupShare(reasoning,x);
    if(sh("print")>=20) return "공부 운이 받쳐주는 사주야. 준비한 만큼 결과가 나오는 편이라, 방법만 맞추면 충분히 붙어.";
    if(sh("wealth")>=25&&sh("print")<15) return "실력은 되는데 집중이 흩어지기 쉬운 사주야. 공부 환경만 잡으면 점수가 확 올라.";
    if(sh("officer")>=20&&sh("print")<10) return "시험 자체엔 강한데, 공부를 오래 붙잡는 힘은 약한 사주야. 긴 계획보다 짧게 끊어서 가는 게 맞아.";
    return "벼락치기보다 꾸준히 쌓을 때 붙는 사주야. 하루 공부량을 일정하게 지키는 게 제일 중요해.";
  }
  function spouseElementOf(reasoning,data){
    const d=dayElementOf(reasoning);
    return data?.gender==="male"?ELEMENT_CONTROLS[d]:ELEMENT_CONTROLLED_BY[d];
  }
  function starTypeLine(reasoning,data){
    const rows=godRows(reasoning);
    const male=data?.gender==="male";
    const [a,b]=male?["정재","편재"]:["정관","편관"];
    const wa=Number(rows.find(r=>r.god===a)?.weight||0), wb=Number(rows.find(r=>r.god===b)?.weight||0);
    if(!wa&&!wb) return "";
    return wa>=wb
      ? "연인 기운 중에 "+withJosa(a,"이","가")+" 더 커서, 가볍게 만나기보다 오래 볼 진지한 관계로 이어질 사람이야."
      : "연인 기운 중에 "+withJosa(b,"이","가")+" 더 커서, 같이 있으면 설레고 활기찬 연애를 하게 될 사람이야.";
  }
  function breakupScore(reasoning,sig,data){
    const sg=spouseGroupOf(data), v=verdictOf(reasoning), G1=topGroupOf(reasoning);
    let score=0; const why=[];
    if(dayCombine(reasoning)){ score++; why.push("배우자 자리가 묶여 있어서 한번 맺은 인연이 쉽게 안 끊겨"); }
    if(sg&&groupShare(reasoning,sg)>=25){ score++; why.push("연인을 뜻하는 기운이 커서 인연이 다시 닿을 여지가 있어"); }
    if(sg&&thisYearGroup(reasoning)===sg){ score++; why.push("올해 연인을 뜻하는 기운이 들어와"); }
    if(dayRelation(reasoning,sig,["clash"])){ score--; why.push("배우자 자리가 부딪히는 배치라 같은 이유로 또 헤어지기 쉬워"); }
    if(v==="신강"&&G1==="self"){ score--; why.push("자존심이 강해서 먼저 연락하기가 어려워"); }
    return {score,why};
  }
  function soonRow(plan,list,months){
    const today=plan.today;
    const lim=(()=>{ const d=new Date(today+"T00:00:00Z"); if(isNaN(d)) return ""; d.setUTCMonth(d.getUTCMonth()+months); return d.toISOString().slice(0,10); })();
    return (list||[]).find(x=>x&&String(x.row.startYmd)<lim)||null;
  }

  function noteAnswerV8(reasoning,s,sig,data,isT,grounding){
    const k=s.concern+"/"+s.key;
    const el=prescriptionElement(reasoning);
    const EL=el||dayElementOf(reasoning);
    const N=grounding?.needGroup||needGroupOf(reasoning);
    const G1=grounding?.primaryGroup||topGroupOf(reasoning);
    const byShare=groupsByShare(reasoning);
    const G2=grounding?.secondaryGroup||byShare.find(g=>g!==G1)||G1;
    const rank=grounding?.rankedGroups||rankGroups(reasoning);
    const hint=el?INDUSTRY[el].split("·"):[];
    const clashes=g=>[...(PATH_OPTION[g]||[""])[0].split(/[·\s]/),...(SIDE_OPTION[g]||[""])[1].split(/[·\s]/)].some(w=>w&&hint.includes(w));
    const worst=[...rank].reverse().find(g=>!clashes(g))||rank[rank.length-1];
    const v=verdictOf(reasoning);
    const top=godRows(reasoning)[0];
    const topGod=top?.god||"";
    const out=[];
    const T=(good,bad)=>timingAnswerLines(reasoning,s,data,good,bad);
    const elWhy=el?" 셋 다 네 사주에 필요한 "+EL_PLAIN[el]+" 기운이 도는 분야야.":"";
    if(k==="money/side"){
      const g1=rank[0], g2=rank[1];
      out.push(lead(isT)+"사주에서 먼저 시험해볼 부업 방식은 <b>"+withJosa(SIDE_OPTION[g1][0],"이야","야")+"</b>. 반대로 <b>"+withJosa(SIDE_AVOID[worst],"은","는")+"</b> 상대적으로 소모가 커질 수 있어.");
      out.push("<b>1순위 방향 — "+SIDE_OPTION[g1][0]+"</b>. 예시는 "+SIDE_ITEMS[g1][EL]+" 같은 거야."+elWhy+" "+sideWhy(reasoning,g1,N,G1)+" 실제 수익은 시장·가격·실행에 따라 달라.");
      out.push("<b>2순위 방향 — "+SIDE_OPTION[g2][0]+"</b>. "+SIDE_ITEMS[g2][EL]+" 같은 방식도 시험해볼 수 있어. "+SIDE_PLUS[g2]);
      out.push(signalWorkLine(sig));
      out.push("<b>덜 맞을 수 있는 방식 — "+SIDE_AVOID[worst]+"</b>. 이건 수익을 예측한 게 아니라, 네 사주에서 필요한 힘과 덜 겹치는 방향이라는 뜻이야.");
      out.push(...T("시작하기 좋은 달","시작을 피할 달").lines);
    } else if(k==="money/income"){
      const g1=rank[0], g2=rank[1];
      out.push(lead(isT)+"수입을 늘릴 때 사주에서 먼저 시험해볼 길은 <b>"+withJosa(INCOME_OPTION[g1][0],"이야","야")+"</b>. "+withJosa(INCOME_OPTION[g1][1],"이야","야")+". 실제 수입액이나 성공 확률을 뜻하진 않아.");
      out.push("<b>1순위 — 이렇게 해</b>. "+INCOME_HOW[g1]+" "+sideWhy(reasoning,g1,N,G1).replace("돈도 같이 붙어","수입도 같이 올라").replace("돈을 벌 수 있어","수입을 올릴 수 있어").replace("만든 게 그대로 돈이 돼","만든 게 그대로 수입이 돼").replace("실력만큼 돈이 돼","실력만큼 수입이 올라"));
      out.push("<b>2순위 방향 — "+INCOME_OPTION[g2][0]+"</b>. "+withJosa(INCOME_OPTION[g2][1],"이야","야")+". "+INCOME_HOW[g2]);
      out.push(moneyShapeLine(reasoning));
      out.push("<b>덜 맞을 수 있는 길 — "+INCOME_AVOID[worst]+"</b>. 이건 소득을 예측한 게 아니라, 현재 사주 흐름과 얼마나 맞는지 비교한 결과야.");
      out.push(...T("수입 얘기를 꺼내기 좋은 달","큰 결정을 미룰 달").lines);
    } else if(k==="money/saving"){
      out.push(lead(isT)+"네 돈은 <b>"+LEAK_NAME[G1][0]+"</b>으로 제일 많이 새. 이것만 막아도 통장이 달라져.");
      out.push("<b>1순위 구멍 — "+LEAK_NAME[G1][0]+"</b>. "+LEAK_NAME[G1][1]+"이야. "+LEAK_WHY[G1]+" <b>막는 법</b> — "+LEAK_FIX[G1]);
      out.push("<b>2순위 구멍 — "+LEAK_NAME[G2][0]+"</b>. "+LEAK_NAME[G2][1]+"이야. "+LEAK_FIX[G2]);
      out.push("<b>너한테 맞는 저축 방식 — "+SAVE_STYLE[N]+"</b>. "+SAVE_WHY[N]);
      out.push(savingCapacityLine(reasoning));
      out.push(...T("모으기 시작하기 좋은 달","돈이 새기 쉬운 달").lines);
    } else if(k==="money/flow"){
      const t=T("돈이 잘 도는 달","지출을 조심할 달");
      const b=t.plan.best[0];
      out.push(lead(isT)+(b?"앞으로 1년 돈 문제에서 지원 신호가 가장 겹치는 때는 <b>"+monthSpan(b.row,t.plan.today)+"</b>야.":"앞으로 1년은 돈 문제에서 특정 달 하나가 크게 튀지 않아.")+(t.plan.worst?" 반대로 결정을 한 번 더 확인할 때는 <b>"+monthSpan(t.plan.worst.row,t.plan.today)+"</b>야.":""));
      out.push(concernYearAnswer(reasoning,s,data));
      out.push(...t.lines);
      out.push("<b>돈을 다룰 때 먼저 살릴 방식</b> — "+FLOW_WAY[G1]+" 쪽이야. 특정 수입원이 생긴다는 예측이 아니라, 현재 사주에서 강한 힘을 돈 문제에 쓰는 방식으로 봐.");
      out.push(moneyShapeLine(reasoning));
    } else if(k==="career/exam"){
      out.push(lead(isT)+examVerdict(reasoning));
      out.push(...T("시험 보기 좋은 달","실력이 흔들리기 쉬운 달").lines);
      out.push("<b>시험에서 특히 챙길 한 가지 — "+EXAM_KEY[G1]+"</b>. "+EXAM_KEY_WHY[G1]);
      if(STUDY_STYLE[topGod]) out.push("<b>너한테 맞는 공부법 — "+STUDY_STYLE[topGod]+"</b>. 네 사주에서 제일 큰 힘이 "+withJosa(topGod,"이라서","라서")+", 이렇게 할 때 제일 오래 버텨.");
      if(EXAM_DAY[topGod]) out.push("<b>시험 날 조심할 것</b> — "+EXAM_DAY[topGod]);
    } else if(k==="career/jobsearch"){
      const g1=rank[0], g2=rank[1];
      out.push(lead(isT)+"합격 확률을 사주로 계산하진 않을게. 대신 사주에서 잘 맞는 채용 환경은 <b>"+withJosa(JOB_OPTION[g1][0],"이야","야")+"</b>. <b>"+JOB_OPTION[worst][0]+"</b> 쪽은 상대적으로 소모가 커질 수 있어.");
      out.push("<b>1순위 — "+JOB_OPTION[g1][0]+"</b>. 구체적으로는 "+JOB_ITEMS[g1][EL]+" 같은 자리야. "+JOB_WHY[g1]);
      out.push("<b>2순위 환경 — "+JOB_OPTION[g2][0]+"</b>. "+JOB_ITEMS[g2][EL]+" 같은 자리도 비교해볼 수 있어.");
      out.push(...T("붙기 좋은 달","결과가 늦어지기 쉬운 달").lines);
      if(INTERVIEW[topGod]) out.push("<b>면접에서 이기는 법</b> — "+INTERVIEW[topGod]);
    } else if(k==="career/move"){
      const t=T("옮기기 좋은 달","옮기면 손해 보기 쉬운 달");
      const soonGood=soonRow(t.plan,t.plan.best,4), soonBad=t.plan.worst&&soonRow(t.plan,[t.plan.worst],4);
      const verdict=soonGood&&!soonBad?"지금은 움직여도 되는 쪽이야"
        :soonBad&&!soonGood?"지금 바로 나가기보다, 준비하고 움직이는 쪽이 유리해"
        :t.plan.best.length?"당장보다 좋은 달을 골라 움직이는 쪽이 유리해":"지금은 반반이야. 조건이 확실해질 때 움직여";
      out.push(lead(isT)+"<b>"+verdict+"</b>. "+MOVE_FIT[G1]);
      out.push(...t.lines);
      out.push("<b>옮긴다면 이런 곳</b> — "+JOB_ITEMS[N][EL]+" 같은 자리야. 네 사주에 제일 필요한 "+withJosa(NEED_POWER_WORK[N],"을","를")+" 채워주는 자리라, 옮긴 뒤에 힘이 붙어.");
      out.push(concernYearAnswer(reasoning,s,data));
    } else if(k==="career/current"){
      out.push(lead(isT)+"지금 자리에서 인정받을 때 먼저 써볼 방식은 <b>"+withJosa(CURRENT_KEY[G1],"이야","야")+"</b>.");
      out.push("<b>1순위 — "+CURRENT_KEY[G1]+"</b>. "+CURRENT_WHY[G1]+" 예를 들면, "+CURRENT_EX[G1]);
      if(N!==G1) out.push("<b>2순위 — "+CURRENT_NEED[N]+"</b>. 네 사주에 제일 필요한 "+withJosa(NEED_POWER_WORK[N],"을","를")+" 채우는 방법이라, 하면 할수록 편해져.");
      const gui=sinsalOf(sig,"천을귀인");
      out.push("<b>힘이 되는 사람</b> — "+withJosa(HELPER[N],"이야","야")+"."+(gui?" 네 사주엔 천을귀인, 곧 도와주는 사람 복도 있어서 "+guiPeople(gui)+" 쪽에서 도움이 오기 쉬워.":" 네 사주에 부족한 걸 채워주는 쪽이야."));
      out.push(...T("인정받기 좋은 달","평가가 흔들리기 쉬운 달").lines);
      out.push(concernYearAnswer(reasoning,s,data));
    } else if(k==="love/crush"){
      const t=T("다가가기 좋은 달","오해가 생기기 쉬운 달");
      const soonGood=soonRow(t.plan,t.plan.best,2), soonBad=t.plan.worst&&soonRow(t.plan,[t.plan.worst],2);
      out.push(lead(isT)+"<b>"+(soonGood&&!soonBad?"시기 신호는 먼저 움직이는 쪽에 조금 더 실려 있어":soonBad&&!soonGood?"시기 신호는 지금보다 조금 뒤가 덜 부담스러워":"시기만으로는 한쪽으로 강하게 기울지 않아")+"</b>. 상대 마음은 알 수 없으니, 크게 고백하기보다 작은 반응을 확인하는 방식이 안전해.");
      out.push(...t.lines);
      out.push("<b>너한테 맞는 다가가는 법 — "+CRUSH_MOVE[G1]+"</b>. "+CRUSH_WHY[G1]);
      const charm=(sig?.sinsal||[]).find(x=>["도화","홍염"].includes(x.name));
      if(charm) out.push("<b>네 쪽의 호감 신호</b> — "+withJosa(charm.name,"이","가")+" 있어. 이건 네가 눈에 띄거나 호감을 표현하는 쪽의 참고 신호고, 상대 반응까지 보장하는 뜻은 아니야.");
      out.push("<b>꼭 피할 실수</b> — "+CRUSH_MISTAKE[G1]+". 이게 썸을 제일 빨리 식게 만들어.");
      out.push("<b>상대 마음</b> — 상대 마음은 상대 사주가 있어야 정확히 보여. 여기선 네 쪽에서 되는 방법만 봤어.");
    } else if(k==="love/relationship"){
      const clash=dayRelation(reasoning,sig,["clash","wonjin"]);
      out.push(lead(isT)+"<b>"+(dayCombine(reasoning)?"한번 맺은 인연을 오래 끌고 가는 사주야":clash?"큰 싸움 한 번이 고비가 되는 사주야":"큰 사건보다 작은 서운함 관리가 관건인 사주야")+"</b>. "+(dayCombine(reasoning)?"배우자 자리가 다른 자리와 묶여 있어서, 쉽게 놓지 않아.":clash?"배우자 자리가 부딪히는 배치라, 생활 문제로 크게 싸운 뒤를 조심해야 해.":"배우자 자리가 조용해서, 쌓이는 서운함만 풀면 오래 가."));
      out.push("<b>너희가 싸우는 패턴</b> — 너는 "+FIGHT_PATTERN[G1]+" 그래서 싸움 자체보다 싸운 뒤가 더 중요해.");
      out.push("<b>오래 가는 비결 — "+KEEP_LOVE[N]+"</b>. 네 사주에 부족한 "+withJosa(NEED_POWER[N],"을","를")+" 채우는 방법이라, 이것만 지켜도 싸움이 확 줄어.");
      const dz=dayBranchGod(reasoning);
      if(SPOUSE_WANTS[dz]) out.push("<b>네가 연인에게 제일 바라는 것</b> — 배우자 자리에 "+withJosa(dz,"이","가")+" 있어서, 너는 연인에게 "+withJosa(SPOUSE_WANTS[dz],"을","를")+" 제일 바라. 이게 채워지면 웬만한 건 다 넘어가지는 편이야.");
      out.push(...T("관계가 깊어지기 좋은 달","다투기 쉬운 달").lines);
    } else if(k==="love/breakup"){
      const {score,why}=breakupScore(reasoning,sig,data);
      out.push(lead(isT)+"<b>"+(score>=2?"다시 이어질 여지가 있는 편이야":score===1?"반반이야":"다시 만나기보다 정리하는 쪽이 네 사주엔 더 편한 편이야")+"</b>. "+(why.length?why.join(". ")+".":"사주에서 재회 쪽으로 강하게 끄는 신호도, 막는 신호도 두드러지지 않아."));
      out.push(...T("연락해보기 좋은 달","연락을 피할 달").lines);
      out.push("<b>연락한다면 이렇게</b> — "+CONTACT_WAY[G1]);
      out.push("<b>다시 만나도 같은 이유로 안 헤어지려면</b> — "+REPEAT_FIX[G1]);
      out.push("<b>한 가지만 기억해</b> — 상대 사주까지 봐야 확실해져. 여기선 네 쪽 사주로 보이는 것만 말했어.");
    } else if(k==="love/new"){
      const dz=dayBranchGod(reasoning);
      const dzEl=ZHI_ELEMENT[pillarsOf(reasoning).day?.zhi]||EL;
      const spEl=spouseElementOf(reasoning,data);
      const t=T("인연이 들어오는 때","새로 시작하지 말 달");
      const b=t.plan.best[0]||t.plan.far[0];
      out.push(lead(isT)+(b?"네 인연이 제일 크게 들어오는 때는 <b>"+monthSpan(b.row,t.plan.today)+"</b>야.":"네 인연은 특정 달보다 네가 움직이는 만큼 들어와.")+" 그 사람은 <b>"+PARTNER_LOOK_SHORT[dzEl]+"</b>일 가능성이 커.");
      out.push(...t.lines);
      out.push(concernYearAnswer(reasoning,s,data));
      out.push("<b>그 사람 외모</b> — "+PARTNER_LOOK[dzEl]+" 네 사주에서 배우자 자리에 "+EL_PLAIN[dzEl]+" 기운이 있어서야.");
      if(PARTNER_CHAR[dz]) out.push("<b>성격</b> — "+PARTNER_CHAR[dz]+" "+starTypeLine(reasoning,data));
      if(spEl) out.push("<b>하는 일</b> — "+INDUSTRY[spEl]+" 쪽 일을 하거나, 그런 분위기를 가진 사람일 가능성이 커. 네 사주에서 연인을 뜻하는 기운이 "+EL_PLAIN[spEl]+" 기운이라서야.");
      const gui=sinsalOf(sig,"천을귀인");
      const mods=[gui?"특히 "+GUI_INTRO[gui.positions[0]]+" 소개가 잘 풀려":"",sinsalOf(sig,"역마")?"여행이나 이동 중에 만나는 인연도 커":"",sinsalOf(sig,"도화")?"네가 눈에 띄는 자리에 나갈수록 인연이 빨리 와":""].filter(Boolean);
      if(MEET_ROUTE[dz]) out.push("<b>만나는 방식</b> — "+MEET_ROUTE[dz]+(mods.length?" "+mods.join(". ")+".":""));
      if(spEl) out.push("<b>만나기 좋은 곳</b> — "+MEET_PLACE_LONG[spEl]+"이야.");
      out.push("<b>피해야 할 사람</b> — "+AVOID_PARTNER[G1]+". 네 사주는 이미 "+GROUP_PLAIN[G1]+" 쪽 힘이 큰데, 이런 사람을 만나면 둘 다 그쪽으로만 기울어서 금방 지쳐.");
    } else if(k==="path/lost"){
      const g1=rank[0], g2=rank[1], g3=rank[2];
      out.push(lead(isT)+"사주에서 먼저 시험해볼 분야는 <b>"+withJosa(PATH_OPTION[g1][0],"이야","야")+"</b>. 반대로 <b>"+PATH_OPTION[worst][0]+"</b>"+josaSuffix(PATH_OPTION[worst][0],"은","는")+" 상대적으로 필요한 힘과 덜 겹쳐. 실제 적성은 경험으로 확인해야 해.");
      out.push("<b>1순위 — "+PATH_OPTION[g1][0]+"</b>. 구체적으로는 "+JOB_ITEMS[g1][EL]+" 같은 일이야. "+PATH_WHY[g1]);
      out.push("<b>2순위 — "+PATH_OPTION[g2][0]+"</b>. "+JOB_ITEMS[g2][EL]+" 쪽도 잘 맞아.");
      if(g3) out.push("<b>3순위 — "+PATH_OPTION[g3][0]+"</b>. 1·2순위가 막힐 때 열어둘 만한 쪽이야.");
      out.push(signalWorkLine(sig));
      if(TALENT[topGod]) out.push("<b>네 재능 한 줄</b> — "+withJosa(TALENT[topGod],"이야","야")+". 어느 분야를 가든 이걸 쓰는 자리에서 제일 빨리 인정받아.");
      out.push(...T("방향을 정하기 좋은 달","급하게 정하면 안 되는 달").lines);
    } else if(k==="path/current"){
      out.push(lead(isT)+"<b>지금 길이 "+PATH_OPTION[rank[0]][0]+"나 "+PATH_OPTION[rank[1]][0]+"에 가까우면 사주에서 강한 힘과 겹치는 부분이 많아</b>. 맞는 길인지 확정하려면 실제 만족도와 성과도 같이 봐야 해.");
      out.push("<b>계속 가도 되는 신호</b> — "+PATH_KEEP[G1]+" 계속 가도 돼. 네 사주는 이게 보일 때 제일 크게 자라.");
      out.push("<b>바꿔야 하는 신호</b> — "+PATH_CHANGE[G1]+", 그땐 방향을 다시 봐야 해.");
      out.push("<b>지금 길에서 더 잘되려면</b> — "+PATH_BOOST[N]+". 네 사주에 제일 필요한 "+withJosa(NEED_POWER_WORK[N],"을","를")+" 채우는 방법이야.");
      out.push(...T("성과가 드러나기 좋은 달","흔들리기 쉬운 달").lines);
    } else if(k==="path/switch"){
      const t=T("옮기기 좋은 달","옮기면 안 되는 달");
      const soonGood=soonRow(t.plan,t.plan.best,4), soonBad=t.plan.worst&&soonRow(t.plan,[t.plan.worst],4);
      out.push(lead(isT)+"<b>"+(soonGood&&!soonBad?"전환을 검토할 지원 신호가 있어":soonBad&&!soonGood?"지금은 바로 바꾸기보다 준비 신호가 더 커":"작게 시험해본 뒤 판단하는 쪽이 안전해")+"</b>. 옮긴다면 <b>"+PATH_OPTION[rank[0]][0]+"</b>"+josaSuffix(PATH_OPTION[rank[0]][0],"이","가")+" 사주에서 먼저 비교할 방향이야.");
      out.push("<b>1순위 — "+PATH_OPTION[rank[0]][0]+"</b>. "+JOB_ITEMS[rank[0]][EL]+" 같은 일이야. "+PATH_WHY[rank[0]]);
      out.push("<b>2순위 — "+PATH_OPTION[rank[1]][0]+"</b>. "+JOB_ITEMS[rank[1]][EL]+" 쪽이야.");
      out.push(...t.lines);
      out.push("<b>전환이 성공하는 조건</b> — "+SWITCH_KEY[G1]);
      out.push(concernYearAnswer(reasoning,s,data));
    } else if(k==="path/strength"){
      const W=byShare[byShare.length-1];
      const G3=byShare.find(g=>g!==G1&&g!==G2);
      out.push(lead(isT)+"네 제일 센 강점은 <b>"+withJosa(STRENGTH_NAME[G1],"이야","야")+"</b>. "+TALENT_SCENE[G1]);
      out.push("<b>1순위 강점 — "+STRENGTH_NAME[G1]+"</b>. 네 사주에서 제일 큰 힘이야. "+STRENGTH_USE[G1]);
      out.push("<b>2순위 강점 — "+STRENGTH_NAME[G2]+"</b>. "+STRENGTH_USE[G2]);
      if(G3&&G3!==W) out.push("<b>3순위 강점 — "+STRENGTH_NAME[G3]+"</b>. 1·2순위만큼 크진 않지만, 같이 쓰면 강점이 두 배로 보여.");
      out.push("<b>상대적으로 약한 쪽 — "+STRENGTH_NAME[W]+"</b>. 이건 혼자 키우기보다 잘하는 사람과 같이 하는 게 빨라.");
      if(TALENT[topGod]) out.push("<b>한 줄로 말하면</b> — 너는 "+withJosa(TALENT[topGod],"을","를")+" 가진 사람이야.");
      out.push(...T("강점을 보여주기 좋은 달","실수하기 쉬운 달").lines);
    } else if(s.concern==="people"){
      const rel=peopleAnswerRelation(reasoning,sig,s);
      if(s.key==="friend"){
        out.push(lead(isT)+"너한테 맞는 친구는 <b>"+FRIEND_FIT[N]+"</b>"+josaSuffix(FRIEND_FIT[N],"이고","고")+", 멀리할 친구는 <b>"+FRIEND_AVOID[G1]+"</b>"+josaSuffix(FRIEND_AVOID[G1],"이야","야")+".");
        const sh=groupShare(reasoning,"self");
        out.push("<b>네 친구 자리</b> — 친구를 뜻하는 비겁이 "+sh+"%"+(sh>=25?"로 커서, 친구와 얽히는 일이 많고 비교도 생기기 쉬운 편이야.":sh>=10?"로 적당해서, 넓게보다 맞는 몇 명과 오래 가는 편이야.":"로 적어서, 친구가 많진 않아도 한번 믿으면 깊게 가는 편이야."));
        out.push("<b>이 관계에서 네가 지킬 선 — "+PEOPLE_LINE[G1]+"</b>. 네 사주에서 제일 큰 힘이 이쪽이라, 여기서 무너지면 지쳐.");
      } else if(s.key==="work"){
        out.push(lead(isT)+"직장에서 너랑 잘 맞는 사람은 <b>"+WORK_FIT[N]+"</b>"+josaSuffix(WORK_FIT[N],"이고","고")+", 부딪히는 사람은 <b>"+WORK_CLASH[G1]+"</b>"+josaSuffix(WORK_CLASH[G1],"이야","야")+".");
        out.push("<b>네가 지킬 선 — "+WORK_LINE[G1]+"</b>. 네 사주에서 제일 큰 힘이 이쪽이라, 여기서 무너지면 지쳐.");
        const gui=sinsalOf(sig,"천을귀인");
        if(gui) out.push("<b>도와주는 사람</b> — 네 사주엔 천을귀인, 곧 도와주는 사람 복이 있어서 "+guiPeople(gui)+" 쪽에서 도움이 오기 쉬워.");
      } else if(s.key==="family"){
        const fam=rel?(rel.aPos==="day"||rel.bPos==="day"
          ?"가족 중에서는 <b>"+FAMILY_PERSON[rel.aPos==="day"?rel.bPos:rel.aPos]+"</b> 쪽과 제일 부딪히기 쉬워."
          :"<b>"+FAMILY_PERSON[rel.aPos]+"</b>"+josaSuffix(FAMILY_PERSON[rel.aPos],"과","와")+" <b>"+FAMILY_PERSON[rel.bPos]+"</b> 사이가 부딪히는 배치라, 그 사이에서 네가 끼기 쉬워."):"가족 중 특정 한 사람과 부딪히는 배치는 두드러지지 않아. 대신 네 쪽에서 반복되는 패턴이 있어.";
        out.push(lead(isT)+fam);
        out.push("<b>네가 지킬 선 — "+FAMILY_LINE[G1]+"</b>. 네 사주에서 제일 큰 힘이 이쪽이라, 여기서 무너지면 지쳐.");
      } else {
        const hard=rel&&["clash","wonjin","punishment"].includes(rel.type);
        out.push(lead(isT)+"<b>"+(hard?"거리를 두는 쪽이 네 마음엔 더 편한 편이야":G1==="self"?"끊기보다 만나는 횟수만 줄이는 쪽이 맞아":G1==="officer"?"도리 때문에 붙잡고 있는 거라면 거리를 둬도 돼":"한 번은 할 말을 하고, 반응을 보고 정하는 쪽이 맞아")+"</b>.");
        out.push("<b>거리 두는 법</b> — "+DISTANCE_HOW[G1]);
        out.push("<b>후회 안 하려면 이것부터 확인해</b> — "+DISTANCE_CHECK[G1]+". 여기에 해당하면 거리를 둬도 네 잘못이 아니야.");
      }
      out.push(...T(s.key==="distance"?"말을 꺼내기 좋은 달":"관계가 풀리기 좋은 달",s.key==="distance"?"결론 내리면 안 되는 달":s.key==="family"?"집안 얘기를 피할 달":"부딪히기 쉬운 달").lines);
    } else {
      if(s.key==="burnout"){
        out.push(lead(isT)+"<b>"+(v==="신강"?"지금은 쌓인 걸 빼낼 때야":"지금은 더 버틸 때가 아니라 채울 때야")+"</b>. 지친 이유 1순위는 "+TIRE_NAME[G1]+"이고, 2순위는 "+TIRE_NAME[G2]+"이야.");
        out.push("<b>왜 이렇게 지쳤냐면</b> — "+TIRE_WHY[G1]);
      } else if(s.key==="overthink"){
        out.push(lead(isT)+"네 생각이 멈추지 않는 이유는 <b>"+THINK_CAUSE[G1]+"</b> 때문이야. 생각을 줄이려고 애쓰기보다, 생각이 갈 곳을 만들어주는 게 맞아.");
        out.push("<b>1순위 — "+THINK_STOP[G1]+"</b>. 네 사주에서 제일 큰 "+GROUP_PLAIN[G1]+" 쪽 힘을 막지 않고, 생각이 멈출 자리로 돌려쓰는 방법이라 제일 빨리 먹혀.");
        if(G2!==G1) out.push("<b>2순위 — "+THINK_STOP[G2]+"</b>.");
      } else if(s.key==="low"){
        out.push(lead(isT)+"다시 움직이는 첫걸음은 <b>"+withJosa(LOW_STEP[G1],"이야","야")+"</b>. 크게 바꾸려 하지 말고 이것 하나만 해.");
        out.push("<b>두 번째 걸음 — "+LOW_STEP[N]+"</b>. 네 사주에 제일 필요한 "+withJosa(NEED_POWER[N],"을","를")+" 채우는 거라, 여기까지 하면 기운이 돌아오기 시작해.");
      } else {
        out.push(lead(isT)+"네 회복이 제일 빨리 붙는 방법은 <b>"+withJosa(el?QUICK_RECOVER[el]:"같은 시간에 자고 먹기","이야","야")+"</b>. 네 사주에 제일 필요한 "+(el?EL_PLAIN[el]+" ":"")+"기운을 채우는 방법이거든.");
      }
      if(s.key!=="recover"&&el) out.push("<b>제일 빨리 효과 보는 것</b> — "+QUICK_RECOVER[el]+". 네 사주에 필요한 "+EL_PLAIN[el]+" 기운을 채우는 방법이야.");
      if(s.key!=="low") out.push("<b>"+(s.key==="recover"?"두 번째 방법":"또 하나 효과 있는 것")+" — "+RECOVER_BY_GROUP[N]+"</b>. 네 사주에 부족한 "+withJosa(NEED_POWER[N],"을","를")+" 보태줘.");
      out.push(...T(s.key==="recover"?"회복이 붙는 달":"나아지기 시작하는 달","더 지치기 쉬운 달").lines);
    }
    out.push(detailsBlock([
      "순위 기준: 네 사주에 제일 필요한 기운은 "+(el?elementName(el)+" 쪽 ":"")+GROUP_NAME[N]+", 가장 큰 힘은 "+(top?top.god:"고르게 나뉜 힘")+", 너 자신은 "+strengthPlain(reasoning)+"이야.",
      "날짜 기준: 이 고민에서 명리가 보는 기운이 들어오는 달을 좋은 달로, 이 고민에서 약한 곳을 건드리는 달을 피할 달로 골랐어.",
    ]));
    return out.filter(Boolean).join("<br><br>");
  }

  // ----- v8 NOTE3: "진짜 이유"를 사주 진단으로 -----
  // 고민별로 명리에서 문제를 만드는 배치(연인 기운 과다+약한 나, 연인 기운 부재, 경쟁 기운 과다, 배우자 자리 충 등)를 찾아
  // 원인 → 사주 근거 → 네가 실제로 겪었을 장면 순서로 쓴다. 숫자는 뜻을 설명할 때만 쓴다.
  function concernDiagnoses(reasoning,s,sig,data){
    const sh=g=>groupShare(reasoning,g);
    const gs=god=>godShare(reasoning,god);
    const v=verdictOf(reasoning), weak=v==="신약", strong=v==="신강";
    const male=data?.gender==="male";
    const k=s.key, c=s.concern;
    const out=[];
    const pick=map=>typeof map==="string"?map:(map[k]||map.default||"");
    // 0%는 "0%로 적어" 대신 "거의 없어"로 쓴다.
    // 퍼센트는 "사주 기운의 몇 %"로 풀어서 쓴다. 0%는 "거의 없어"로 쓴다.
    const zero=w=>String(w||"")
      .replace(/이 0%로 (아주 |가장 )?적어$/,"이 사주에 거의 없어").replace(/이 0%로 적고/,"이 거의 없고")
      .replace(/이 (\d+)%로 (아주 |가장 )?적어$/,"이 사주 기운의 $1%밖에 안 돼")
      .replace(/이 (\d+)%로 적고/,"이 사주 기운의 $1%밖에 안 되고")
      .replace(/이 (\d+)%로 커$/,"이 사주 기운의 $1%나 돼")
      .replace(/이 (\d+)%로 커서/,"이 사주 기운의 $1%나 돼서")
      .replace(/이 (\d+)%로 (재성|관성|인성|식상|비겁|연인)/,"이 사주 기운의 $1%로 $2")
      .replace(/이 (\d+)%나 되는데/,"이 사주 기운의 $1%나 되는데")
      .replace(/이 (\d+)%인데/,"이 사주 기운의 $1%인데")
      .replace(/은 (\d+)%인데/,"은 사주 기운의 $1%인데");
    const add=(title,why,scene,group,rel)=>{ const t=pick(title); if(t&&scene) out.push({title:t,why:zero(why),scene,group:group||null,rel:rel||null}); };
    const dayClash=relationRows(reasoning,sig).find(x=>(x.aPos==="day"||x.bPos==="day")&&x.type==="clash");
    const dayGong=(sig?.gongmang?.positions||[]).includes("day");
    if(c==="love"){
      const star=male?"wealth":"officer", starName=male?"재성":"관성";
      const st=sh(star);
      if(st>=35&&weak) add("연인 기운은 많은데, 그걸 감당할 네 힘이 약해","연인을 뜻하는 "+withJosa(starName,"이","가")+" "+st+"%나 되는데, 너 자신은 약한 편이야",pick({new:"그래서 만날 기회는 적지 않은데, 조건을 따지거나 결정을 미루다가 흐지부지되기 쉬워.",crush:"좋아하는 마음은 큰데 먼저 움직일 힘이 안 나서 타이밍을 놓치기 쉬워.",relationship:"상대에게 맞추느라 네 에너지가 먼저 바닥나기 쉬워.",breakup:"마음은 남아 있는데, 다시 시작할 힘이 없다고 느끼기 쉬워."}),star);
      if(st<8) add("연인을 뜻하는 기운이 사주에 거의 없어",withJosa(starName,"이","가")+" "+st+"%로 아주 적어",pick({new:"그래서 인연이 저절로 굴러오는 사주가 아니야. 가만히 있으면 몇 년이 그냥 지나가고, 네가 직접 만남의 자리를 만들어야 인연이 생겨.",crush:"그래서 연애 신호를 읽는 게 서툴러서, 상대의 호감을 놓치기 쉬워.",relationship:"연애를 해도 연애가 삶의 중심이 되진 않아서, 상대가 서운해하기 쉬워.",breakup:"그래서 먼저 움직이지 않으면 인연이 다시 닿을 계기가 잘 안 생겨."}),star);
      if(male&&sh("self")>=30&&sh("self")>st) add("연인 기운보다 경쟁·친구 기운이 더 커","친구·동료처럼 나와 나란히 서는 힘인 비겁이 "+sh("self")+"%로 연인을 뜻하는 재성 "+st+"%보다 커",pick({new:"그래서 좋은 사람을 만나도 친구로 끝나거나, 다른 사람에게 먼저 뺏기기 쉬워.",crush:"그래서 썸이 친구 같은 사이로 흘러가기 쉬워.",relationship:"연애에서도 누가 이기나 자존심 싸움이 붙기 쉬워.",breakup:"자존심 때문에 먼저 연락하는 게 제일 어려워."}),"self");
      if(!male&&sh("self")>=35) add("네 기준이 강해서 상대에게 맞추기가 어려워","친구·동료처럼 나와 나란히 서는 힘인 비겁이 "+sh("self")+"%로 커",pick({new:"그래서 괜찮은 사람이 와도 ‘굳이?’ 하는 마음이 먼저 들어.",crush:"그래서 먼저 다가가는 게 자존심 상하는 일처럼 느껴져.",relationship:"연애에서도 내 방식을 지키려다 부딪히기 쉬워.",breakup:"자존심 때문에 먼저 연락하는 게 제일 어려워."}),"self");
      if(male&&sh("officer")>=35) add("일과 책임이 먼저라, 연애에 쓸 힘이 남지 않아","책임과 평가를 뜻하는 관성이 "+sh("officer")+"%로 커",pick({new:"퇴근하고 나면 사람 만날 힘이 없고, 주말엔 쉬고 싶지? 그래서 연애가 늘 다음 순서로 밀려.",crush:"좋아하는 마음이 있어도 일이 먼저라, 연락이 뜸해지기 쉬워.",relationship:"일이 바쁠 때 연인을 뒤로 미루게 돼서, 상대가 서운해하기 쉬워.",breakup:"헤어진 이유가 결국 네가 바빴던 거라면, 그게 그대로면 다시 만나도 같아."}),"officer");
      if(!male&&gs("정관")>=8&&gs("편관")>=8) add("끌리는 사람이 두 부류로 갈려","안정적인 연인을 뜻하는 정관과 강하게 끌리는 인연을 뜻하는 편관이 둘 다 있어",pick({new:"편한 사람은 설렘이 없고, 설레는 사람은 불안해서 한 사람으로 정하기가 어려워.",crush:"지금 상대가 편한 쪽인지 설레는 쪽인지에 따라 네 마음이 계속 흔들려.",relationship:"안정적인데 심심하다는 마음과 설레는데 불안하다는 마음이 번갈아 와.",breakup:"헤어진 사람이 편한 쪽이었는지 설레는 쪽이었는지에 따라 미련의 크기가 달라."}),"officer");
      if(!male&&sh("output")>=30) add("상대를 보는 기준이 높고, 말이 먼저 나가","표현을 뜻하는 식상이 "+sh("output")+"%로 커서, 연인 기운인 관성을 누르는 배치야",pick({new:"마음에 안 드는 점이 먼저 보이고, 그걸 말하다 보면 상대가 물러서기 쉬워.",crush:"좋아도 장난이나 지적으로 표현해서, 상대가 헷갈리기 쉬워.",relationship:"서운한 걸 말할 때 말이 세게 나가서, 싸움이 커지기 쉬워.",breakup:"헤어질 때 했던 말이 상대 마음에 오래 남아 있을 수 있어."}),"output");
      if(sh("print")>=35) add("마음이 확실해질 때까지 너무 오래 생각해","생각과 신중함을 뜻하는 인성이 "+sh("print")+"%로 커",pick({new:"좋은 사람이다 싶어도 확신이 올 때까지 기다리다가, 상대가 먼저 지쳐서 떠나기 쉬워.",crush:"상대 말 한마디를 며칠씩 해석하느라, 정작 답장은 늦어져.",relationship:"서운한 걸 말하기 전에 혼자 결론을 내려버리기 쉬워.",breakup:"헤어진 이유를 혼자 계속 곱씹으면서 시간이 흘러가."}),"print");
      if(dayClash){
        const other=dayClash.aPos==="day"?dayClash.bPos:dayClash.aPos;
        const INTRUDE={year:"집안 어른이나 윗사람 일",month:"부모님이나 직장 일",hour:"아랫사람 일이나 나중 계획"};
        add({new:"만나도 오래 붙잡아두기 어려운 배치야",crush:"가까워질 만하면 엇갈리는 배치야",relationship:"한번 싸우면 크게 번지는 배치야",breakup:"다시 만나도 같은 데서 부딪히기 쉬운 배치야"},
          "배우자 자리와 "+POS_PERSON[other]+" 자리가 정면으로 부딪히는 충이 있어서, "+(INTRUDE[other]||"다른 일")+"이 연애에 자주 끼어들어",
          pick({new:"그래서 인연이 아예 없는 게 아니라, 시작해도 생활 문제로 금방 흔들려서 ‘나는 인연이 없나’ 싶어지는 거야.",crush:"그래서 가까워질 만하면 꼭 한 번씩 엇갈려.",relationship:"좋을 땐 좋다가, 한번 싸우면 크게 번지기 쉬워.",breakup:"그래서 다시 만나도 같은 지점에서 부딪히기 쉬워."}),null,dayClash);
      }
      if(dayGong) add("배우자 자리가 비어 있는 공망 배치야","배우자 자리가 공망, 곧 비어 있는 자리에 걸려 있어",pick({new:"누굴 만나도 뭔가 채워지지 않는 느낌이 들어서, 이상형이 자꾸 높아지기 쉬워.",default:"상대가 곁에 있어도 가끔 허전한 마음이 드는 편이야."}));
      if(sh("output")<8) add("좋아해도 티를 잘 안 내","표현을 뜻하는 식상이 "+sh("output")+"%로 적어",pick({new:"속으로는 호감이 있는데 상대는 네 마음을 몰라서, 그냥 아는 사이로 지나가기 쉬워.",crush:"네 마음을 상대가 몰라서, 썸이 제자리걸음이야.",relationship:"사랑한다는 말이나 표현이 부족해서, 상대가 불안해하기 쉬워.",breakup:"헤어질 때도 네 진짜 마음을 제대로 못 전했을 가능성이 커."}),"output");
    } else if(c==="money"){
      if(sh("wealth")>=35&&weak) add({saving:"돈 기운은 큰데, 붙잡아둘 네 힘이 약해",income:"기회는 많은데, 다 잡을 힘이 부족해",side:"벌이는 건 빠른데, 끝까지 키울 힘이 약해",flow:"돈은 크게 도는데, 관리할 힘이 약해"},"돈을 뜻하는 재성이 "+sh("wealth")+"%인데 너 자신은 약한 편이야",pick({saving:"돈은 잘 돌아오는데 들어오는 만큼 여기저기 나가서, 통장에 남는 게 없지?",income:"벌 기회는 많은데 다 잡으려다 지쳐서, 결국 제대로 키운 게 없기 쉬워.",side:"이것저것 벌이다가 하나도 끝까지 못 키우기 쉬워.",flow:"큰돈이 들어올 때도 있지만, 관리가 안 되면 그대로 빠져나가."}),"wealth");
      if(sh("self")>=25&&sh("wealth")>0&&sh("self")>sh("wealth")) add("돈이 사람 사이에서 나눠지는 배치야","친구·동료처럼 나와 나란히 서는 힘인 비겁이 "+sh("self")+"%로 돈을 뜻하는 재성 "+sh("wealth")+"%보다 커",pick({saving:"모임비, 빌려준 돈, 대신 내준 밥값으로 돈이 흩어지지? 사람 좋다는 말은 듣는데 돈은 안 남아.",income:"같이 일하면 네 몫이 줄어들기 쉬워서, 공은 나눠지고 보상은 적어.",side:"동업이나 같이 하는 부업은 돈 문제로 끝나기 쉬워.",flow:"돈이 들어와도 사람 일로 나가는 게 커서, 흐름이 자꾸 끊겨."}),"self");
      if(sh("wealth")<8) add("돈이 저절로 따라오는 사주는 아니야","돈을 뜻하는 재성이 "+sh("wealth")+"%로 적어",pick({saving:"그래서 크게 한 번 모이기보다, 조금씩 꾸준히 쌓아야 모여.",income:"운 좋게 돈이 굴러오길 기다리면 안 와. 대신 기술이나 자리로 돈을 불러오면 꾸준히 들어와.",side:"아무 부업이나 하면 시간만 쓰고 끝나. 네 기술이 들어가는 일이어야 돈이 돼.",flow:"그래서 돈 흐름이 크게 출렁이진 않지만, 크게 불어나지도 않아."}),"wealth");
      if(sh("output")>=20&&sh("wealth")<12) add("재주는 있는데 돈으로 바꾸는 단계가 약해","만들어내는 힘인 식상은 "+sh("output")+"%인데 돈을 뜻하는 재성은 "+sh("wealth")+"%야",pick({default:"잘한다는 말은 많이 듣는데, 가격을 붙이거나 돈 얘기를 꺼내는 건 어색하지? 그래서 실력에 비해 버는 게 적어."}),"output");
      if(sh("officer")>=35) add({saving:"책임과 체면에 나가는 돈이 커",income:"책임은 큰데, 보상 얘기를 못 꺼내",side:"본업 책임이 무거워서 부업에 쓸 힘이 없어",flow:"들어온 돈이 의무 지출로 먼저 빠져"},"책임과 체면을 뜻하는 관성이 "+sh("officer")+"%로 커",pick({saving:"경조사, 선물, 회비처럼 안 내면 불편한 돈이 계속 나가.",income:"책임은 계속 느는데 보상 얘기는 못 꺼내서, 일한 만큼 못 받아.",side:"본업 책임이 무거워서 부업에 쓸 힘이 잘 안 남아.",flow:"들어온 돈이 의무 지출로 먼저 빠져서, 남는 게 적어."}),"officer");
      if(sh("print")>=35) add({saving:"준비와 자기계발에 돈이 새",default:"준비에 돈을 쓰고, 돈 버는 실행은 늦어"},"공부와 준비를 뜻하는 인성이 "+sh("print")+"%로 커",pick({default:"강의·책·자격증엔 돈을 쓰는데, 그걸로 돈을 버는 단계까지는 잘 안 가."}),"print");
    } else if(c==="career"){
      if(sh("officer")>=35&&weak) add({exam:"시험 부담이 네 힘보다 커",jobsearch:"붙어야 한다는 부담이 네 힘보다 커",default:"맡은 책임이 네 힘보다 커"},"책임과 평가를 뜻하는 관성이 "+sh("officer")+"%인데 너 자신은 약한 편이야",pick({exam:"시험에 대한 부담이 실력보다 커서, 시험장에서 긴장이 점수를 깎기 쉬워.",jobsearch:"그래서 면접장에서 긴장이 먼저 올라와서, 준비한 네 모습이 다 안 나와.",move:"일이 계속 늘어나는데 쉴 틈이 없어서, 떠나고 싶은 마음이 커진 거야.",current:"일은 계속 늘어나는데, 잘하고 있어도 늘 버거운 느낌이지?"}),"officer");
      if(gs("상관")>=12&&sh("officer")>=10) add({exam:"정해진 답보다 네 답이 먼저 나와",jobsearch:"솔직함이 불만처럼 들리기 쉬워",default:"윗사람과 부딪히기 쉬운 배치야"},"바꾸려는 힘인 상관이 "+gs("상관")+"%, 윗사람과 평가를 뜻하는 관성이 "+sh("officer")+"%라 서로 부딪혀",pick({exam:"정해진 방식이 답답해서, 출제자가 원하는 답보다 내 답을 쓰기 쉬워.",jobsearch:"면접에서 솔직한 말이 불만처럼 들리기 쉬워.",move:"불합리한 걸 참다가 쌓인 게 이직 생각으로 이어진 거야.",current:"불합리한 걸 보면 말하고 싶은데, 말하면 찍히고 참으면 속이 터지지?"}),"output");
      if(sh("officer")<8) add({exam:"남이 짠 계획으로는 힘이 안 나",jobsearch:"큰 조직의 틀에 맞추면 힘이 안 나",move:"지금 조직의 틀이 너한테 안 맞아",current:"조직이 알아서 챙겨주는 사주가 아니야"},"자리와 평가를 뜻하는 관성이 "+sh("officer")+"%로 적어",pick({exam:"누가 정해준 계획보다 네 방식대로 할 때 성적이 나오는데, 틀에 맞추려다 흐트러지기 쉬워.",jobsearch:"큰 조직의 틀에 맞추려고 하면 힘이 안 나. 네 역할이 분명한 곳에서 붙어.",move:"지금 조직의 틀 자체가 너한테 안 맞는 걸 수 있어.",current:"조직이 알아서 챙겨주길 기다리면 계속 밀려. 네가 먼저 드러내야 보여."}),"officer");
      if(k==="exam"&&sh("wealth")>=25&&sh("print")<=15) add("공부에 집중할 힘을 딴 일이 흩트려","돈과 현실 일을 뜻하는 재성이 "+sh("wealth")+"%인데, 공부를 뜻하는 인성은 "+sh("print")+"%야",pick({default:"공부하려고 앉아도 돈, 약속, 할 일이 계속 떠올라서 집중이 끊기지?"}),"wealth");
      if(sh("print")>=35) add({exam:"준비는 충분한데 실전 감각이 부족해",jobsearch:"준비만 길고 지원이 늦어",move:"옮길 준비만 하다 타이밍을 놓쳐",current:"완벽해질 때까지 붙잡고 있다가 늦어"},"준비와 공부를 뜻하는 인성이 "+sh("print")+"%로 커",pick({exam:"공부한 양은 많은데 시험장에선 생각만큼 안 나오지? 정리만 하다 문제 풀 시간이 모자랐던 거야.",jobsearch:"준비만 길어지고 지원은 늦어서, 좋은 자리를 먼저 놓치기 쉬워.",move:"옮길 준비만 계속하다가 타이밍을 놓치기 쉬워.",current:"완벽해질 때까지 붙잡고 있다가 보고 타이밍을 놓치기 쉬워."}),"print");
      if(sh("self")>=35) add("조직의 지시보다 네 방식이 앞서","친구·동료처럼 나와 나란히 서는 힘인 비겁이 "+sh("self")+"%로 커",pick({exam:"남들 따라 하는 공부법이 안 맞아서, 네 방식을 찾기 전까지 헤매.",jobsearch:"시키는 대로 하는 자리에선 오래 못 버틸 것 같은 느낌이 먼저 들어.",move:"간섭이 많아질수록 떠나고 싶은 마음이 커져.",current:"시키는 대로 하는 게 답답해서, 조직 안에서 네 몫이 안 보이기 쉬워."}),"self");
    } else if(c==="path"){
      if(sh("output")<8) add("재능을 밖으로 꺼내는 힘이 약해","표현과 결과물을 뜻하는 식상이 "+sh("output")+"%로 적어",pick({lost:"뭘 잘하는지 몰라서가 아니라, 해보기 전에 멈춰서 네 재능이 드러날 기회가 없었던 거야.",current:"지금 길에서도 네가 잘하는 걸 보여줄 기회를 스스로 안 만들어서, 제자리처럼 느껴지는 거야.",switch:"지금 분야가 싫다기보다, 네 재능을 써볼 기회가 없어서 답답한 걸 수 있어.",strength:"강점이 없어서가 아니라, 밖으로 보여준 적이 적어서 스스로도 잘 몰라."}),"output");
      if(sh("print")>=35) add("생각이 행동보다 앞서","생각과 준비를 뜻하는 인성이 "+sh("print")+"%로 커",pick({lost:"알아보고 고민하는 시간은 긴데, 직접 해본 경험이 적어서 확신이 안 생겨.",current:"지금 길이 맞는지 계속 생각만 하다가, 확인해볼 행동은 미뤄.",switch:"옮길 분야를 계속 알아보기만 하고, 실제로 발을 담가본 적은 없어서 결정이 안 나.",strength:"생각은 깊은데 결과로 보여준 게 적어서, 강점이 잘 안 드러나."}),"print");
      if(sh("officer")<8&&k!=="strength") add("방향을 정해줄 기준이 약해","자리와 기준을 뜻하는 관성이 "+sh("officer")+"%로 적어",pick({lost:"하고 싶은 건 많은데 하나로 정하는 게 제일 어렵지? 기준이 없으니 매번 처음부터 고민하게 돼.",current:"잘하고 있는지 판단할 기준이 없어서, 남의 말 한마디에 흔들려.",switch:"옮기고 싶은 이유가 분명하지 않아서, 옮겨도 또 흔들릴 수 있어."}),"officer");
      if(godRows(reasoning)[0]&&gs(godRows(reasoning)[0].god)<25) add("힘이 여러 곳에 고르게 나뉘어 있어","가장 큰 힘도 "+gs(godRows(reasoning)[0].god)+"%라, 한쪽으로 크게 쏠리지 않았어",pick({lost:"이것도 되고 저것도 돼서, 오히려 하나로 못 정하는 거야.",current:"여러 방향이 다 조금씩 맞아서, 지금 길만 고집할 이유가 약하게 느껴져.",switch:"다른 길도 될 것 같아서 자꾸 눈이 가는 거야.",strength:"강점이 한 가지로 튀지 않아서, 스스로 뭘 잘하는지 헷갈려."}));
      if(sh("self")>=35) add("남이 정한 길이 안 맞는 사주야","친구·동료처럼 나와 나란히 서는 힘인 비겁이 "+sh("self")+"%로 커",pick({lost:"누가 좋다는 길을 가면 금방 흥미를 잃지? 네가 납득한 길이어야 오래 가.",current:"지금 길이 네가 고른 게 아니라면, 계속 답답할 수밖에 없어.",switch:"남이 정한 틀에서 벗어나고 싶은 마음이 전환 생각의 진짜 이유일 수 있어.",strength:"혼자 해낸 것들이 강점인데, 남 기준으로 보면 안 보여."}),"self");
    } else if(c==="people"){
      const pos={friend:["day"],work:["month"],family:["year","month"],distance:["year","month","day","hour"]}[k]||[];
      const rel=relationRows(reasoning,sig).find(x=>pos.includes(x.aPos)||pos.includes(x.bPos));
      if(rel) add("애초에 부딪히기 쉬운 자리 배치가 있어",relationCore(reasoning,rel),pick({friend:"그래서 가까운 사이일수록 작은 말에 서운함이 쌓이기 쉬워.",work:"그래서 일하는 자리에서 특정 사람과 자꾸 엇갈려.",family:"그래서 가족 사이에서 같은 문제로 되풀이해서 부딪혀.",distance:"그래서 이 관계는 노력해도 완전히 편해지긴 어려운 쪽이야."}),null,rel);
      if(sh("officer")>=35) add("거절을 못 해서 관계가 버거워져","책임과 도리를 뜻하는 관성이 "+sh("officer")+"%로 커",pick({default:"부탁을 받으면 일단 들어주고, 나중에 혼자 지치지? 그래서 관계가 점점 의무처럼 느껴져."}),"officer");
      if(sh("self")>=30) add("대등함이 깨지면 참기가 힘들어","친구·동료처럼 나와 나란히 서는 힘인 비겁이 "+sh("self")+"%로 커",pick({default:"한쪽만 맞춰주는 관계가 되면 속으로 계속 불편해져. 누가 위냐가 은근히 신경 쓰이는 편이야."}),"self");
      if(sh("output")>=30) add("말이 먼저 나가서 오해가 생겨","표현을 뜻하는 식상이 "+sh("output")+"%로 커",pick({default:"솔직하게 말한 건데 상대는 공격으로 받아들여서, 의도와 다르게 멀어지기 쉬워."}),"output");
      if(sh("print")>=35) add("혼자 이해하고 참다가 지쳐","생각과 배려를 뜻하는 인성이 "+sh("print")+"%로 커",pick({default:"상대 입장을 먼저 이해해주다 보니, 네 서운함은 말할 타이밍을 계속 놓쳐."}),"print");
      if(sh("wealth")>=35) add("주고받는 게 기울면 계산이 시작돼","현실 감각을 뜻하는 재성이 "+sh("wealth")+"%로 커",pick({default:"내가 더 많이 한다는 느낌이 들면, 겉으론 웃어도 속으론 거리를 두기 시작해."}),"wealth");
    } else {
      // 마음 고민은 고른 상황(번아웃·생각 과다·무기력·회복)에 맞는 이유부터 쓴다.
      const thinker=gs("편인")>=15||sh("print")>=35;
      if(k==="overthink"&&thinker) add("생각이 한번 시작되면 멈추지 않는 사주야","깊게 곱씹는 힘인 인성이 "+sh("print")+"%로 커","누우면 오늘 있었던 말들이 다시 떠오르지? 한번 시작된 생각이 끝까지 파고들어서, 몸보다 머리가 먼저 지쳐.","print");
      if(k==="overthink"&&sh("wealth")>=35) add("경우의 수를 끝까지 계산하느라 생각이 안 끝나","현실 계산을 뜻하는 재성이 "+sh("wealth")+"%로 커","손해 볼 가능성을 하나씩 다 따지다 보니, 결론 대신 생각만 늘어나지?","wealth");
      if(weak&&sh("print")<15) add({overthink:"머리를 쉬게 하는 스위치가 약해",low:"기운을 다시 채우는 힘이 약해",default:"충전하는 힘이 원래 약한 사주야"},"회복을 뜻하는 인성이 "+sh("print")+"%로 적고, 너 자신도 약한 편이야",pick({overthink:"몸은 누워 있어도 머리는 계속 돌아가지? 생각을 끄고 푹 쉬는 힘이 약해서, 한번 시작된 생각이 멈출 곳이 없어.",low:"쉬어도 기운이 안 차오르니까, 뭘 시작할 힘 자체가 안 나는 거야.",default:"쉬어도 개운하지 않고, 주말이 지나도 피곤이 그대로지? 그냥 쉬는 걸로는 부족하고, 제대로 채우는 방법이 따로 필요해."}),"print");
      if(sh("officer")>=35) add({overthink:"잘못될까 봐 미리 걱정하는 쪽으로 생각이 돌아",default:"해야 할 일의 무게가 계속 쌓여"},"책임을 뜻하는 관성이 "+sh("officer")+"%로 커",pick({overthink:"해야 할 일과 잘못될 경우를 미리 다 떠올리다 보니, 생각이 걱정으로 번지지?",low:"해야 할 일이 너무 무거워서, 아예 손을 놓고 싶어지는 거야.",default:"쉬는 날에도 해야 할 일이 머릿속에서 안 떠나지? 몸은 쉬어도 마음은 계속 일하고 있어."}),"officer");
      if(k!=="overthink"&&thinker) add("생각이 멈추지 않는 사주야","깊게 곱씹는 힘인 인성이 "+sh("print")+"%로 커","누우면 오늘 있었던 말들이 다시 떠오르지? 생각이 쉬질 않아서 몸보다 머리가 먼저 지쳐.","print");
      if(sh("output")<8) add("쌓인 감정을 밖으로 빼는 통로가 좁아","감정을 밖으로 풀어내는 식상이 "+sh("output")+"%로 적어",pick({overthink:"생각을 말이나 행동으로 빼지 않으니까, 머릿속에서만 같은 생각이 계속 돌아.",default:"힘든 걸 말로 안 해서, 속에서만 계속 쌓여."}),"output");
      if(sh("output")>=30&&weak) add("에너지를 밖으로 너무 많이 써","밖으로 쓰는 힘인 식상이 "+sh("output")+"%인데 너 자신은 약한 편이야",pick({default:"남들 챙기고 할 말 하고 나면, 정작 너한테 쓸 힘이 안 남아."}),"output");
      if(sh("self")>=35) add("힘든 걸 혼자 다 떠안아","친구·동료처럼 나와 나란히 서는 힘인 비겁이 "+sh("self")+"%로 커",pick({overthink:"누구한테 털어놓지 않고 혼자 결론을 내려다 보니, 생각이 혼자 안에서만 돌아.",default:"도와달라는 말을 잘 안 해서, 힘든 게 너한테만 쌓여."}),"self");
    }
    // 모든 고민 공통: 가장 약한 힘이 10% 아래면, 그 빈자리가 이 고민에서 어떻게 드러나는지도 이유로 쓴다.
    const used=new Set(out.map(x=>x.group).filter(Boolean));
    const weakest=weakestGroupOf(reasoning);
    const WEAK_TITLE={output:"생각을 밖으로 꺼내는 힘이 약해",wealth:"애쓴 만큼 챙겨 받는 힘이 약해",officer:"스스로 기준과 기한을 세우는 힘이 약해",print:"쉬고 채우는 힘이 약해",self:"내 기준을 지키는 힘이 약해"};
    const WEAK_MEAN={output:"표현과 결과물을 뜻하는 식상",wealth:"돈과 보상을 뜻하는 재성",officer:"기준과 책임을 뜻하는 관성",print:"회복과 배움을 뜻하는 인성",self:"나 자신을 지키는 힘인 비겁"};
    const w={money:"돈 문제",career:"일",love:"연애",path:"진로",people:"관계",mental:"마음"}[c]||"이 고민";
    const WEAK_SCENE={output:"그래서 "+w+"에서 생각은 많은데 말이나 행동으로 꺼내는 게 늦어져.",wealth:"그래서 "+w+"에서 애쓴 만큼 챙겨 받는 건 늘 뒤로 밀려.",officer:"그래서 "+w+"에서 정해진 기한이 없으면 끝까지 가기 어려워.",print:"그래서 "+w+"에서 지쳐도 제대로 쉬지 못하고 계속 버텨.",self:"그래서 "+w+"에서 남 맞추다 내 기준이 흐려지기 쉬워."};
    if(weakest&&weakest.v<10&&!used.has(weakest.g)) add(WEAK_TITLE[weakest.g],WEAK_MEAN[weakest.g]+"이 "+weakest.v+"%로 가장 적어",WEAK_SCENE[weakest.g],weakest.g);
    return out;
  }

  function noteCauseV8(reasoning,s,sig,data,isT,grounding){
    const G=grounding?.primaryGroup||topGroupOf(reasoning);
    const top=godRows(reasoning)[0];
    const list=grounding?.selectedInterpretations||concernInterpretations(reasoning,s,sig,data).slice(0,2);
    const fallback=CAUSE[s.concern]?.[s.key]?.[G]||"";
    const d1=list[0]||null, d2=list[1]||null;
    const lead1=d1?lead(isT)+"<b>"+d1.safeTitle+"</b>. "+d1.safeReading:lead(isT)+fallback.replace(/^(.+?[.?!])(\s|$)/,"<b>$1</b>$2");
    const why=whyLabel(isT)+(d1?d1.why+".":GROUP_MEANING[G]+" 쪽 힘이 사주 전체에서 크게 잡혀 있어.");
    const second=d2?"<b>두 번째 이유 — "+d2.safeTitle+"</b>. "+d2.why+". "+d2.safeReading:"";
    const guarded=d1?.confidence==="guarded"?"이 해석은 독립된 근거가 충분히 겹치지 않아서 실제 경험을 확정하지 않을게.":d1?.counterEvidenceIds?.length?"반대 방향 근거도 같이 잡혀 있어서, 이 결론은 경향으로만 볼게.":"";
    const modifier=causeModifier(reasoning,s,sig);
    const weakest=weakestGroupOf(reasoning);
    const weakUsed=list.some(x=>x.group===weakest?.g);
    const details=detailsBlock([d1?"교차검증 근거 "+d1.evidenceIds.length+"개 · 반대 근거 "+d1.counterEvidenceIds.length+"개":"",top?"사주에서 가장 크게 잡힌 힘은 "+top.god+"이고, 전체 힘의 "+godShare(reasoning,top.god)+"%야.":"",bondSentence(reasoning),weakUsed?"":weakLinkSentence(reasoning).replace(/<[^>]+>/g,"")]);
    return [lead1,why,second,guarded,list.length?"":modifier,details].filter(Boolean).join("<br><br>");
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

  function compactTimingNote(reasoning,s,p,isT,data){
    const timing=reasoning?.timing||{};
    const today=timing.today||"";
    const policy=global.__UNNI_PRODUCT_CONTENT_POLICY_V1__;
    const disclosed=policy?.filterTimingForProduct
      ? policy.filterTimingForProduct("basic_concern",timing)
      : {concernNearTerm:timing.concernNearTerm||null,longTermPivots:(timing.longTermPivots||[]).slice(0,2)};
    const near=disclosed.concernNearTerm||{};
    // 흐름 NOTE도 NOTE2와 같은 고민별 기준으로 달을 본다. NOTE2에서 이미 짚은 달은 빼고, 그 밖에 눈여겨볼 달만 보여준다.
    const plan=concernTimingPlan(reasoning,s,data||{});
    const usedDates=new Set([...plan.best,...plan.far,plan.worst].filter(Boolean).map(x=>x.row.startYmd));
    const extraBad=plan.scored.filter(x=>x.near&&!usedDates.has(x.row.startYmd)&&x.score<=-2&&x.sigs.some(y=>y.s<0))
      .sort((a,b)=>a.score-b.score||String(a.row.startYmd).localeCompare(String(b.row.startYmd)))[0]||null;
    const shown=[...plan.extra,extraBad].filter(Boolean);
    const metaItems=shown.length?shown:[...plan.best,plan.worst].filter(Boolean);
    const uniqueHighlights=metaItems.map(x=>x.row);
    // QA용 본문 키: 달 범위 + 이 고민에서의 역할(좋은 달/조심할 달) + 이유 + 간지라서 서로 겹치지 않는다.
    const metaBody=x=>x?monthSpan(x.row,today)+" "+(x.score>0?"concern-good":"concern-caution")+" "+((x.score>0?posSigs(x):negSigs(x))[0]?.n||"")+" "+(x.row.ganZhi||""):"";
    const pivot=(disclosed.longTermPivots||[]).find(x=>x?.isStructuralPivot===true)||null;
    const planRows=[...plan.best,...plan.far,plan.worst,...shown].filter(Boolean).map(x=>x.row);
    const evidenceRuleIds=[...new Set([
      ...evidenceIdsForRole(reasoning,"timing"),
      ...planRows.flatMap(row=>[
        ...(row?.layers?.wolun?.supportSignals||[]),
        ...(row?.layers?.wolun?.cautionSignals||[]),
      ].flatMap(x=>x?.sourceRuleIds||[])),
      ...(pivot?.sourceRuleIds||[]),
    ].filter(Boolean))];

    const short=CONCERN_SHORT[s.concern]||"이 고민";
    // 첫 줄은 아래 한 줄 표와 똑같은 판정으로 쓴다. 표와 결론이 서로 다른 말을 하지 않게.
    const summary=monthSummary(reasoning,s,data,plan)||(isT
      ? "<b>결론</b> — 가까운 18개월은 계산되지만 다른 달과 분명히 갈리는 달이 약해. 특정 달은 억지로 찍지 않을게."
      : "<b>결론</b> — 가까운 18개월 흐름은 다 봤는데, 다른 달과 확실히 갈리는 달이 약해. 그래서 언니도 그럴듯하게 날짜를 만들어 찍진 않을게.");

    // NOTE2에서 이미 쓴 "그때 생기는 일" 문장은 다시 쓰지 않는다.
    const usedE=new Set([...plan.best,...plan.far].map(x=>posSigs(x)[0]?.e).concat(plan.worst?[negSigs(plan.worst)[0]?.e]:[]).filter(Boolean));
    const eOf=sig=>{ if(!sig?.e||usedE.has(sig.e)) return ""; usedE.add(sig.e); return sig.e; };
    const yearLines=yearLine(reasoning,s,data,usedE);
    const lines=shown.map(x=>{
      const pos=x.sigs.filter(y=>y.s>0).sort((a,b)=>b.s-a.s)[0];
      const neg=x.sigs.filter(y=>y.s<0).sort((a,b)=>a.s-b.s)[0];
      if(x.score>0&&pos){
        const pe=eOf(pos);
        return "<b>"+monthSpan(x.row,today)+"</b> — "+pos.a+" 달이라, "+short+" 쪽으로 한 번 더 힘이 붙는 구간이야."+(pe?" "+pe+".":"");
      }
      const ne=neg?eOf(neg):"";
      return "<b>"+monthSpan(x.row,today)+"</b> — "+(neg?neg.a+" 달이라, "+(ne||"여기서도 속도를 늦추는 게 좋아")+".":"여기서는 속도를 늦추는 게 좋아.");
    });

    // 10년 단위 큰 흐름이 바뀌는 해는, 새 10년이 이 고민에 실제로 어떤 기운인지 계산될 때만 짚는다.
    const pivotYears=[];
    if(pivot?.year&&(pivot.pivotReasons||[]).includes("major-flow-change")){
      const yr=(timing.years||[]).find(r=>r?.year===pivot.year)||{};
      const gz=String(pivot.daeunGanZhi||yr.daeunGanZhi||"");
      const god=yr.daeunGod||"";
      if(gz.length>=2&&god){
        const ctx={...yearCtx(reasoning,{seyunGanZhi:gz,seyunGod:god}),unit:"10년"};
        const sigs=concernSignals(reasoning,s,data||{},ctx);
        const p1=sigs.filter(y=>y.s>0).sort((a,b)=>b.s-a.s)[0], n1=sigs.filter(y=>y.s<0).sort((a,b)=>a.s-b.s)[0];
        const score=sigs.reduce((a,x)=>a+x.s,0);
        if(p1&&score>=0){
          const pe=eOf(p1);
          lines.push("<b>"+pivot.year+"년부터 10년</b> — 10년마다 바뀌는 큰 흐름이 이때 바뀌어. 새 10년은 "+p1.a+" 흐름이라, "+short+" 쪽으로 판이 한 번 크게 넓어져."+(pe?" "+pe+".":""));
          pivotYears.push(pivot.year);
        } else if(n1){
          lines.push("<b>"+pivot.year+"년부터 10년</b> — 10년마다 바뀌는 큰 흐름이 이때 바뀌어. 새 10년은 "+n1.a+" 흐름이라, 그 전에 "+short+" 쪽 기반을 다져두는 게 좋아.");
          pivotYears.push(pivot.year);
        }
      }
    }

    if(!uniqueHighlights.length){
      const nowRow=(near.months||[])[0]||null;
      const sz=String(nowRow?.seyunGanZhi||nowRow?.seyounGanZhi||"");
      const sName=sz.length>=2&&GAN_KR[sz[0]]?GAN_KR[sz[0]]+(ZHI_KR[sz[1]]||""):"";
      if(sName) lines.unshift("<b>지금 흐름</b> — 올해 "+sName+"년 안에서는 "+short+" 쪽으로 특정 달만 크게 갈리지 않아. 그래서 날짜보다 네가 준비된 때가 기준이야.");
    }
    const strip=monthStrip(reasoning,s,data);
    if(strip) lines.unshift(strip);
    lines.unshift(...yearLines);
    const criterion=DECISION_CRITERIA[s.concern]?.[s.key]||"실제로 바뀌는 행동이 생기는지 봐";
    lines.push("<b>잘 가고 있다는 신호</b> — "+criterion+".");
    const label=row=>row?formatMonth(row,today):null;
    return {
      desc:[summary,...lines].join("<br><br>"),
      evidenceRuleIds,
      personalizationFacts:{
        firstDate:label(uniqueHighlights[0]||null),
        secondDate:label(uniqueHighlights[1]||null),
        firstClass:uniqueHighlights[0]?.class||null,
        secondClass:uniqueHighlights[1]?.class||null,
        pivotYear:pivotYears[0]||null,
        timingFingerprint:reasoning?.timingFingerprint||"",
      },
      meta:{
        firstDate:label(uniqueHighlights[0]||null),
        secondDate:label(uniqueHighlights[1]||null),
        firstBody:metaBody(metaItems[0]),
        secondBody:metaBody(metaItems[1]),
        concernSituation:s.key,
        structureFingerprint:reasoning?.structureFingerprint||"",
        timingFingerprint:reasoning?.timingFingerprint||"",
        method:timing.method||"",
        horizonEnd:timing.horizonEnd||"",
        internalHorizonEnd:timing.internalHorizonEnd||"",
        detailEnd:timing.detailEnd||"",
        nearMonthCount:Array.isArray(near.months)?near.months.length:0,
        longTermPivotYears:pivotYears,
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

  const NOTE_BADGES=["핵심","질문에 대한 답","왜 그런지","어떻게 할지","가까운 흐름","조심할 것"];
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
    return CAUTION_TITLE[s.concern]||"조심할 것";
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
    const grounding=buildConcernGroundingPlan(r,s,sig,data);
    const claimPlan=buildNoteClaimPlan(r,s,grounding);
    const p={label:s.label,topGod:(r.synthesis?.tenGodEvidence||[])[0]?.god||"",headline:headlineOf(r),iljuName:sig?.ilju?.name||""};
    const timing=compactTimingNote(r,s,p,isT,data);
    const signalFacts={ilju:sig?.ilju?.key||null,dayStage:sig?.dayStage||null,sinsal:(sig?.sinsal||[]).map(x=>x.name),gongmang:sig?.gongmang?.positions||[],wonjin:sig?.wonjin?.positions||[]};
    const spec=[
      {desc:noteCoreV6(r,s,sig,isT),role:"core",facts:{...personalizationFactsForRole(r,"core",s),...signalFacts},claim:claimPlan[0]},
      {desc:noteAnswerV8(r,s,sig,data,isT,grounding),role:"fit",facts:{answerRank:grounding.rankedGroups,needGroup:grounding.needGroup,bestMonths:concernTimingPlan(r,s,data).best.map(x=>x.row.startYmd),dayBranchGod:dayBranchGod(r),gender:data.gender||null},claim:claimPlan[1]},
      {desc:noteCauseV8(r,s,sig,data,isT,grounding),role:"pattern",facts:{...personalizationFactsForRole(r,"pattern",s),causeGroup:grounding.primaryGroup,diagnoses:grounding.selectedInterpretations.map(x=>x.safeTitle)},claim:claimPlan[2]},
      {desc:noteHowV7(r,s,sig,data,isT),role:"fit",facts:{...personalizationFactsForRole(r,"fit",s),needGroup:grounding.needGroup,needElement:prescriptionElement(r)},claim:claimPlan[3]},
      {desc:timing.desc,role:"timing",facts:timing.personalizationFacts||{},timing:true,claim:claimPlan[4]},
      {desc:noteCautionV6(r,s,sig,isT,data,grounding),role:"caution",facts:{...personalizationFactsForRole(r,"caution",s),burdenGroup:grounding.burdenGroup,relations:relationRows(r,sig).map(x=>x.type)},claim:claimPlan[5]},
    ];
    const notes=spec.map((x,idx)=>{
      const note={
        badge:badgeFor(s.concern,idx),
        title:titleFor(s,idx,isT,p),
        desc:x.desc,
        checklist:"",
        __evidenceRuleIds:x.timing?[...new Set([...evidenceIdsForRole(r,"timing"),...(timing.evidenceRuleIds||[])])]:evidenceIdsForRole(r,x.role),
        __personalizationFacts:x.facts,
        __claim:x.claim||null,
        __interpretationEvidenceIds:x.claim?.evidenceIds||[],
        __counterEvidenceIds:x.claim?.counterEvidenceIds||[],
      };
      if(x.timing) note.__timingQA=timing.meta;
      return note;
    });

    // claim은 NOTE 뒤에 붙이지 않는다. 위에서 claimPlan을 먼저 만들고 그 claim을 받아 NOTE를 렌더링한다.
    notes.forEach((note,idx)=>{
      note.themeNum=String(idx+1).padStart(2,"0");
      if(note.__claim?.confidence==="guarded"){
        note.desc += isT?"<br><br>이 부분은 독립된 근거가 충분히 겹치지 않아서 확정하지 않을게.":"<br><br>이 부분은 근거가 아직 한쪽이라 언니도 확정해서 말하진 않을게.";
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
      behaviorTemplateRole:"expression-only",
      behaviorTemplateFieldsUsed:["SIDE_OPTION","SIDE_ITEMS","INCOME_OPTION","JOB_OPTION","PATH_OPTION","SAVE_STYLE"],
      structureFingerprint:r.structureFingerprint,
      timingFingerprint:r.timingFingerprint,
      synthesisFingerprint:r.synthesis?.fingerprint||"",
      situation:{concern:s.concern,key:s.key},
      noteCount:notes.length,
      outputClaimMap:notes.map((note,index)=>({noteNum:index+1,claimId:note.__claim?.id||null,source:note.__claim?.source||null,confidence:note.__claim?.confidence||"guarded"})),
      noteEvidence:notes.map((note,index)=>({noteNum:index+1,ruleIds:note.__evidenceRuleIds||[]})),
      semanticEvidence:semanticRows,
      interpretationPlan:{
        primaryGroup:grounding.primaryGroup,
        secondaryGroup:grounding.secondaryGroup,
        groupShares:grounding.groupShares,
        selected:grounding.selectedInterpretations.map(x=>({title:x.safeTitle,group:x.group||null,confidence:x.confidence,evidenceIds:x.evidenceIds,counterEvidenceIds:x.counterEvidenceIds})),
      },
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
  global.__CONCERN_NOTE_ENGINE_V2__={version:VERSION,situations:SITUATIONS,describeTerm:describeTermForData,facts:chartFactsForData,_testTopGroup:topGroupOf,_testGrounding:(reasoning,situation,data)=>buildConcernGroundingPlan(reasoning,situation,signalsOf(reasoning),data||{})};

  const legacy=global.generateConcernNotes;
  const wrapped=function(data,mode){
    return renderConcernNotesV2(data||{},mode||"F");
  };
  wrapped.__noteV2Wrapped=true;
  wrapped.__classicalCausal=true;
  wrapped.__legacyBase=legacy;
  global.generateConcernNotes=wrapped;
})(globalThis);
