(function (global) {
  "use strict";

  const CONCERN_ACTIONS = {
    money: {
      first: { F: "이때는 돈을 크게 불리려 하기보다, 수입·가격·협상 중 하나를 실제로 움직여봐. 네가 돈을 만들어내는 방식에 반응이 오는지 먼저 확인하는 구간이야.", T: "이 구간은 테스트다. 수입·가격·협상 중 하나를 실제로 움직이고 숫자로 반응을 확인해." },
      second: { F: "두 번째 흐름에서는 첫 시기에 확인한 걸 그냥 흘려보내지 말고, 남길 수입원과 끊을 지출을 정해서 네 돈의 기준으로 굳혀줘.", T: "두 번째 구간은 굳히기다. 첫 결과를 기준으로 남길 수입원과 끊을 지출을 확정해." },
    },
    career: {
      first: { F: "이때는 준비만 더 하지 말고 지원·면담·포트폴리오 공개처럼 네 이름이 밖으로 보이는 행동 하나를 해봐. 반응을 받아야 다음 선택이 선명해져.", T: "첫 구간엔 지원·면담·포트폴리오 공개 중 하나를 실행해. 내부 준비보다 외부 반응 데이터가 먼저야." },
      second: { F: "두 번째 흐름은 처음 받은 반응을 바탕으로 자리와 조건을 고르는 쪽이 좋아. 연봉·역할·업무범위처럼 네 몫을 구체적으로 말해도 돼.", T: "두 번째 구간은 협상과 선택이다. 연봉·역할·업무범위를 숫자와 조건으로 확정해." },
    },
    love: {
      first: { F: "이때는 마음속에서 상대를 계속 해석하기보다 한 번 더 만나거나, 궁금한 걸 직접 묻는 식으로 관계의 온도를 확인해봐. 네 마음만 앞서 달리지 않게 해주는 시기야.", T: "첫 구간은 확인이다. 만남·질문·표현 중 하나로 상대 반응을 실제로 확인해. 추측은 데이터가 아니야." },
      second: { F: "두 번째 흐름에서는 편안함과 일관성이 확인된 관계만 조금 더 깊게 가져가면 돼. 애매한 사람에게 같은 에너지를 계속 쓰지는 말자.", T: "두 번째 구간은 선별이다. 말과 행동이 맞는 관계는 깊게, 애매함이 반복되는 관계는 정리해." },
    },
    path: {
      first: { F: "이때는 인생 정답을 고르려고 하지 말고 작은 프로젝트·체험·지원처럼 직접 해볼 수 있는 걸 하나 시작해봐. 해보고 느낀 게 생각보다 정확한 힌트가 돼.", T: "첫 구간엔 진로 결론 내리지 마. 작은 프로젝트·체험·지원 하나로 가설부터 검증해." },
      second: { F: "두 번째 흐름에서는 첫 실험에서 마음도 움직이고 현실 반응도 있었던 쪽에 시간을 더 줘. 모든 가능성을 계속 들고 있을 필요는 없어.", T: "두 번째 구간은 선택이다. 첫 실험에서 반응 나온 축에 자원을 몰고 나머지는 보류해." },
    },
    people: {
      first: { F: "이때는 사람을 확 끊기보다, 불편했던 관계에는 작은 선을 말해보고 새로운 사람에게는 한 번 더 마음을 열어봐. 반응을 보면 누가 내 편인지 훨씬 잘 보여.", T: "첫 구간은 관계 테스트다. 기존 관계엔 경계선을 말하고, 새 관계엔 한 번 더 접점을 만들어 반응을 봐." },
      second: { F: "두 번째 흐름에서는 네 선을 존중한 사람은 가까이 두고, 말해도 계속 소모시키는 관계는 거리를 줄여도 돼. 참는 걸 관계 유지라고 생각하지 말자.", T: "두 번째 구간은 정리다. 경계를 존중한 사람은 남기고 반복해서 넘는 사람은 거리 조절해." },
    },
    mental: {
      first: { F: "이때는 더 잘하려는 계획보다 먼저 일정 하나를 덜어내고 회복시간을 실제로 확보해줘. 쉬는 게 불안해도, 지금은 빈칸이 있어야 다시 마음이 움직여.", T: "첫 구간엔 업무·약속 하나를 덜고 회복시간을 먼저 잠가. 의지 추가가 아니라 부하 감소가 우선이야." },
      second: { F: "두 번째 흐름에서는 잠깐 쉬고 끝내지 말고, 네가 덜 흔들렸던 수면·운동·혼자 있는 시간을 생활 안에 고정해봐. 회복을 특별한 이벤트로 만들지 않는 게 중요해.", T: "두 번째 구간은 유지다. 효과 있었던 수면·운동·혼자 있는 시간을 반복 일정으로 고정해." },
    },
  };

  const MOMENTUM_LABEL = {
    attack: { F: "조금 크게 움직여봐도 괜찮은 흐름", T: "실행을 올릴 흐름" },
    push: { F: "한 걸음 더 가봐도 되는 흐름", T: "바로 움직일 흐름" },
    selective: { F: "좋은 것만 골라봐도 되는 흐름", T: "골라서 움직일 흐름" },
    prepare: { F: "서두르지 말고 준비해두는 흐름", T: "먼저 확인할 흐름" },
    defend: { F: "무리하지 말고 내 걸 지키는 흐름", T: "지킬 걸 정할 흐름" },
    rest: { F: "잠깐 속도를 늦춰도 되는 흐름", T: "회복부터 잡을 흐름" },
  };

  function stripHtml(value) {
    return String(value || "")
      .replace(/<br\s*\/?\s*>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function normalizeSentence(value) {
    return stripHtml(value)
      .replace(/[0-9]{4}년/g, "YEAR")
      .replace(/[0-9]{1,2}월/g, "MONTH")
      .replace(/[.,!?·‘’'\"“”()\[\]\s]/g, "");
  }

  function safeTiming(data, concernKey) {
    if (typeof global.getTrueBaziTiming !== "function") return null;
    try {
      return global.getTrueBaziTiming(
        data?.dayOheng || "to",
        concernKey,
        data?.userGender,
        data?.userBirthStr,
        data?.gyeokguk,
        data?.gyeokStatus,
        data?.realYeonun,
      );
    } catch (_) {
      return null;
    }
  }

  const CONCERN_LABELS = {
    money: "돈·재물",
    career: "학업·직장",
    love: "연애·썸",
    path: "진로·적성",
    people: "사람·관계",
    mental: "마음·스트레스",
  };

  const SITUATION_PROFILES = {
    money: {
      saving: {
        label: "돈이 잘 안 모여",
        focus: "지금은 ‘얼마를 버느냐’보다 들어온 돈이 어디서 새는지부터 보는 게 맞아",
        trigger: "스트레스가 쌓이거나 보상받고 싶은 날",
        reaction: "작은 결제를 가볍게 넘기거나 계획에 없던 소비를 합리화해",
        cost: "월말엔 큰 지출보다 자잘한 지출이 많이 남아",
        assumed: "수입이 적어서 돈이 안 모인다",
        actual: "수입과 별개로 지출 기준이 흔들리는 순간을 못 잡는 게 더 커",
        steps: ["최근 7일 지출을 필수/기분전환 둘로만 나누기", "기분전환 결제는 하루 묵히기", "자동이체·구독 하나만 정리하기"],
        keep: "돈 얘기를 해도 비교하지 않고 현실적으로 같이 정리해주는 사람",
        cut: "체면 소비나 충동결제를 부추기는 사람",
        place: "고정비와 쓸 돈이 눈에 보이게 나뉜 환경",
        first: "최근 지출을 정리하고 새는 항목 하나만 실제로 막아",
        second: "막아본 항목이 효과 있었으면 자동저축이나 예산으로 굳혀",
      },
      income: {
        label: "수입을 더 늘리고 싶어",
        focus: "아끼는 것보다 네가 이미 하는 일의 값을 제대로 받는 쪽을 먼저 봐야 해",
        trigger: "내가 이만큼 했는데 보상이 그대로일 때",
        reaction: "더 잘하면 알아주겠지 하고 성과는 쌓는데 요구는 늦춰",
        cost: "실력은 늘어도 단가·연봉·보상은 제자리일 수 있어",
        assumed: "아직 더 잘해야 돈을 더 받을 수 있다",
        actual: "실력보다 성과를 보여주고 조건을 말하는 타이밍이 늦을 수 있어",
        steps: ["최근 성과 3개를 숫자나 결과로 적기", "연봉·단가·보상 기준 하나 정하기", "협상·제안·지원 중 하나 실제로 하기"],
        keep: "성과와 보상 기준을 분명하게 말해주는 사람",
        cut: "열정만 요구하고 보상 얘기는 흐리는 사람",
        place: "성과가 가격·연봉·역할로 연결되는 환경",
        first: "성과 하나를 밖으로 보여주거나 보상 조건을 직접 물어봐",
        second: "반응이 온 곳에서 연봉·단가·조건을 구체적으로 확정해",
      },
      side: {
        label: "부업·새 수입을 만들고 싶어",
        focus: "처음부터 큰 사업보다 ‘누가 실제로 돈을 내는지’ 확인하는 작은 테스트가 먼저야",
        trigger: "지금 수입만으로 답답해서 새로운 걸 한꺼번에 벌이고 싶을 때",
        reaction: "아이디어와 준비는 커지는데 첫 판매·첫 제안은 늦어져",
        cost: "시간은 쓰는데 수입 가능성은 검증되지 않은 채 남아",
        assumed: "좋은 아이템만 찾으면 바로 돈이 된다",
        actual: "아이디어보다 첫 고객 반응과 반복 가능성을 확인하는 게 먼저야",
        steps: ["팔 수 있는 것 하나만 고르기", "가격을 붙여 3명에게 제안하기", "반응 없는 건 미련 없이 수정하기"],
        keep: "작게 시험해보고 숫자로 피드백 주는 사람",
        cut: "시작도 전에 판을 크게 키우게 만드는 사람",
        place: "작게 팔고 빨리 수정할 수 있는 환경",
        first: "작은 상품·서비스 하나에 가격을 붙여 실제 반응을 봐",
        second: "돈을 낸 반응이 있었던 것만 남겨 반복 가능한 구조로 만들어",
      },
      flow: {
        label: "앞으로 돈 흐름이 궁금해",
        focus: "좋은 달을 기다리기보다 돈이 움직일 때 네가 뭘 할지 미리 정해두는 게 핵심이야",
        trigger: "돈 흐름이 불안해서 타이밍만 계속 확인하고 싶을 때",
        reaction: "행동보다 기다림이 길어지고 좋은 시기를 놓치거나 과하게 기대해",
        cost: "시기가 와도 준비가 안 돼 실제 변화로 이어지지 않아",
        assumed: "좋은 운이 오면 돈 문제도 자연스럽게 풀린다",
        actual: "시기는 기회고, 실제 수입·지출 행동이 붙어야 흐름이 바뀌어",
        steps: ["늘리고 싶은 수입 한 가지 정하기", "지킬 지출 기준 하나 정하기", "좋은 시기에 할 행동을 캘린더에 넣기"],
        keep: "운 얘기보다 실제 행동을 같이 잡아주는 사람",
        cut: "한 번에 큰돈을 벌 수 있다고 조급하게 만드는 사람",
        place: "수입과 지출을 월 단위로 확인할 수 있는 환경",
        first: "수입·협상·판매 중 하나를 실제로 움직여 반응을 봐",
        second: "첫 반응을 보고 남길 수입원과 지킬 돈 기준을 확정해",
      },
    },
    career: {
      exam: {
        label: "시험·합격이 궁금해",
        focus: "지금은 커리어 전체보다 시험 범위·점수·실전 컨디션처럼 합격에 직접 연결되는 걸 봐야 해",
        trigger: "점수가 흔들리거나 주변 합격 소식을 들을 때",
        reaction: "계획을 새로 짜고 자료를 더 늘리면서 이미 하던 공부 리듬을 깨",
        cost: "공부시간은 늘어도 실전 점수로 연결되는 반복이 줄어",
        assumed: "아직 공부량이 부족하다",
        actual: "새로운 걸 더 넣기보다 틀리는 패턴과 실전 반복을 고정해야 할 수 있어",
        steps: ["최근 오답 유형 3개만 뽑기", "실전 시간 맞춘 문제풀이 넣기", "시험 직전 새 자료 추가하지 않기"],
        keep: "점수와 오답을 구체적으로 봐주는 사람",
        cut: "불안만 키우며 공부법을 계속 바꾸게 하는 사람",
        place: "반복 루틴과 실전 시간을 지킬 수 있는 환경",
        first: "모의·실전 테스트로 현재 점수와 약점을 확인해",
        second: "반응이 오른 방식만 남기고 시험 루틴으로 고정해",
      },
      jobsearch: {
        label: "취업 준비 중이야",
        focus: "더 준비하는 것보다 지원하고 반응을 받는 속도가 지금은 더 중요해",
        trigger: "공고를 보며 내가 부족해 보일 때",
        reaction: "지원보다 자격증·포트폴리오 수정만 계속해",
        cost: "준비는 늘지만 실제 면접 데이터가 쌓이지 않아",
        assumed: "조금 더 완벽해져야 지원할 수 있다",
        actual: "지원하고 떨어져봐야 어디를 고칠지 정확해져",
        steps: ["지원할 직무 1개로 좁히기", "이번 주 지원 3건 넣기", "면접 질문을 실제 답변으로 연습하기"],
        keep: "구체적인 피드백과 채용 정보를 주는 사람",
        cut: "스펙 비교만 하며 자신감 깎는 사람",
        place: "지원 횟수와 면접 피드백을 기록하는 환경",
        first: "지원·면접·포트폴리오 공개 중 하나를 실제로 시작해",
        second: "반응 좋았던 직무와 회사 유형에 지원을 집중해",
      },
      move: {
        label: "이직·퇴사를 고민 중이야",
        focus: "지금 직장이 싫다는 감정과 ‘어디로 옮길지’ 조건을 분리해서 봐야 해",
        trigger: "업무나 사람 때문에 확 그만두고 싶은 날",
        reaction: "퇴사 상상은 커지는데 다음 자리 조건은 흐릿한 채로 남아",
        cost: "버티기도 힘들고 옮길 준비도 늦어져",
        assumed: "일단 나가면 답이 보일 거다",
        actual: "퇴사 전에 다음 자리에서 절대 포기 못 할 조건을 먼저 정해야 해",
        steps: ["퇴사 이유를 사람/일/보상으로 나누기", "다음 직장 필수조건 3개 적기", "재직 중 지원 하나 넣기"],
        keep: "감정과 조건을 따로 정리해주는 사람",
        cut: "무조건 참으라거나 당장 그만두라고 몰아붙이는 사람",
        place: "조용히 지원하고 조건 비교할 수 있는 환경",
        first: "지원이나 면담으로 바깥 시장 반응부터 확인해",
        second: "조건이 맞는 선택지가 생기면 퇴사·이직 시점을 확정해",
      },
      current: {
        label: "지금 자리에서 잘 풀리고 싶어",
        focus: "새 직장을 찾기보다 지금 한 일이 평가·역할·보상으로 연결되는 구조를 만드는 게 먼저야",
        trigger: "일은 늘었는데 인정이나 보상이 따라오지 않을 때",
        reaction: "일을 더 잘해서 증명하려고 하지만 요구는 뒤로 미뤄",
        cost: "책임만 커지고 직급·연봉·역할은 그대로일 수 있어",
        assumed: "열심히 하면 알아서 인정받는다",
        actual: "성과를 보이게 만들고 원하는 역할을 말해야 평가가 움직여",
        steps: ["최근 성과 3개 정리하기", "원하는 역할·보상 한 문장으로 만들기", "면담 일정 잡기"],
        keep: "평가 기준과 기대 역할을 분명히 말하는 사람",
        cut: "일만 더 얹고 기준은 계속 바꾸는 사람",
        place: "성과와 역할을 기록하고 말할 수 있는 환경",
        first: "성과를 정리해서 면담·평가 대화에 꺼내",
        second: "역할·연봉·업무범위를 실제 조건으로 굳혀",
      },
    },
    love: {
      crush: {
        label: "썸·짝사랑 중이야",
        focus: "지금은 상대 마음을 맞히는 것보다 실제 반응을 확인해서 관계가 앞으로 가는지 보는 게 중요해",
        trigger: "답장이 느리거나 반응이 애매할 때",
        reaction: "말 한마디를 계속 해석하면서 내 표현은 줄여",
        cost: "썸은 길어지고 너만 더 많이 신경 쓰게 돼",
        assumed: "상대가 나를 얼마나 좋아하는지만 알면 된다",
        actual: "호감보다 만나려는 행동과 일관된 반응을 봐야 해",
        steps: ["한 번 더 만날 약속 제안하기", "궁금한 것 하나 직접 묻기", "두 번 연속 애매하면 혼자 의미 붙이지 않기"],
        keep: "말뿐 아니라 실제로 시간을 내는 사람",
        cut: "관심은 보이는데 계속 약속을 흐리는 사람",
        place: "밀당보다 만남과 대화가 자연스럽게 이어지는 관계",
        first: "만남·질문·표현 중 하나로 상대 반응을 실제로 확인해",
        second: "반응이 꾸준하면 한 단계 더 표현하고, 계속 애매하면 에너지를 줄여",
      },
      relationship: {
        label: "지금 연애 중이야",
        focus: "지금은 다른 사람 얘기가 아니라, 지금 둘 사이에서 무엇을 더 깊게 하고 무엇을 조정할지 봐야 해",
        trigger: "서운한 게 생겼는데 싸움이 될까 봐 말을 미룰 때",
        reaction: "괜찮은 척 넘기다가 상대 반응 하나에 감정이 크게 흔들려",
        cost: "작은 문제도 쌓이면 관계 전체가 불안하게 느껴져",
        assumed: "좋아하면 굳이 말하지 않아도 알아야 한다",
        actual: "오래 갈수록 마음보다 연락·약속·거리감 같은 기준을 말로 맞춰야 해",
        steps: ["요즘 서운한 것 하나만 고르기", "비난 없이 원하는 행동으로 말하기", "둘이 바꿀 규칙 하나 정하기"],
        keep: "불편한 얘기도 피하지 않고 같이 조정하는 사람",
        cut: "문제를 말하면 네 예민함으로 돌리는 반응",
        place: "연락·약속·개인시간을 솔직하게 조율하는 관계",
        first: "미뤄둔 대화나 약속 하나를 꺼내 관계의 현재 온도를 확인해",
        second: "잘 맞은 방식은 둘의 규칙으로 굳히고 반복되는 갈등은 기준을 다시 정해",
      },
      breakup: {
        label: "헤어진 사람이 있어",
        focus: "재회가 되냐만 볼 게 아니라 이 관계가 다시 시작돼도 달라질 근거가 있는지를 먼저 봐야 해",
        trigger: "외롭거나 좋은 기억이 갑자기 크게 떠오를 때",
        reaction: "헤어진 이유보다 보고 싶은 마음을 더 크게 해석해",
        cost: "연락 여부 하나에 회복 속도가 계속 흔들릴 수 있어",
        assumed: "아직 생각나면 다시 만나야 하는 관계다",
        actual: "그리움과 재회 가치가 있는 관계인지는 다른 문제야",
        steps: ["헤어진 핵심 이유 1개 적기", "그 문제가 실제로 바뀌었는지 확인하기", "연락한다면 답을 정해놓지 않고 한 번만 확인하기"],
        keep: "네 회복을 재촉하지 않고 현실을 같이 봐주는 사람",
        cut: "재회 가능성만 부풀리며 감정을 더 흔드는 사람",
        place: "연락 유무와 상관없이 네 생활 리듬을 지킬 수 있는 환경",
        first: "연락 자체보다 다시 시작할 근거가 생겼는지 현실 반응을 확인해",
        second: "변화가 확인되면 대화를 이어가고, 그대로라면 관계를 놓는 쪽까지 결론 내",
      },
      new: {
        label: "새로운 인연을 만나고 싶어",
        focus: "지금은 없는 상대를 기다리기보다 새로운 사람이 들어올 접점을 실제로 늘리는 게 먼저야",
        trigger: "외로워지거나 주변 연애 소식을 많이 볼 때",
        reaction: "좋은 사람을 상상하면서도 새로운 약속이나 소개는 귀찮아서 미뤄",
        cost: "인연을 원하면서 실제 만나는 사람의 폭은 그대로 남아",
        assumed: "좋은 때가 오면 누군가 자연스럽게 나타난다",
        actual: "좋은 흐름도 소개·모임·취미·앱처럼 만날 접점이 있어야 현실이 돼",
        steps: ["내가 원하는 관계 기준 3개 적기", "새 사람 만날 접점 하나 늘리기", "첫인상보다 두 번째 만남까지 보고 판단하기"],
        keep: "말과 행동이 일치하고 만남을 꾸준히 이어가는 사람",
        cut: "첫 텐션만 높고 약속은 계속 흐리는 사람",
        place: "친구 소개·모임·취미처럼 반복해서 사람을 볼 수 있는 환경",
        first: "소개·모임·취미·앱 중 하나에서 새 사람을 만날 접점을 늘려",
        second: "몇 번 만나도 편안함과 일관성이 있는 사람에게만 시간을 더 써",
      },
    },
    path: {
      lost: {
        label: "뭘 해야 할지 모르겠어",
        focus: "정답 직업을 찾기보다 싫은 것·잘하는 것·계속 궁금한 것부터 좁히는 게 먼저야",
        trigger: "남들은 방향이 있어 보이는데 나만 멈춘 것 같을 때",
        reaction: "직업 목록과 정보를 더 찾지만 직접 해보는 건 미뤄",
        cost: "선택지는 많아지고 내 경험 데이터는 늘지 않아",
        assumed: "나한테 딱 맞는 길 하나를 먼저 찾아야 한다",
        actual: "작게 해보면서 맞는 방향을 지워가는 방식이 더 빠를 수 있어",
        steps: ["싫은 일 3개 적기", "궁금한 분야 하나 고르기", "7일짜리 체험 하나 하기"],
        keep: "정답 대신 직접 해보게 도와주는 사람",
        cut: "남들 기준의 안정적인 답만 강요하는 사람",
        place: "짧게 경험하고 방향을 수정할 수 있는 환경",
        first: "작은 체험 하나로 ‘싫다/더 해보고 싶다’ 반응을 확인해",
        second: "반응 좋았던 분야 하나에 시간을 더 몰아줘",
      },
      current: {
        label: "지금 가는 길이 맞는지 궁금해",
        focus: "불안해서 흔들리는 건지 실제로 길이 안 맞는 건지 증거를 분리해서 봐야 해",
        trigger: "성과가 늦거나 주변 다른 길이 좋아 보일 때",
        reaction: "지금까지 한 걸 전부 틀린 선택처럼 느껴",
        cost: "쌓은 경험을 버리고 새 시작만 반복할 수 있어",
        assumed: "불안하면 이 길이 아닌 거다",
        actual: "힘든 것과 방향이 틀린 것은 다르니까 실제 만족·성과·성장 데이터를 봐야 해",
        steps: ["최근 3개월 만족/성장/수입 점수 매기기", "계속할 조건 3개 적기", "한 달만 개선 실험하기"],
        keep: "감정보다 실제 경험을 같이 정리해주는 사람",
        cut: "한 번 힘들다고 전부 포기하라고 하는 사람",
        place: "성과와 만족을 주기적으로 확인할 수 있는 환경",
        first: "지금 길에서 바꿀 수 있는 조건 하나를 실제로 실험해",
        second: "개선됐으면 이어가고 그대로면 다음 선택지로 자원을 옮겨",
      },
      switch: {
        label: "다른 분야로 바꾸고 싶어",
        focus: "지금 걸 버리기 전에 새 분야가 실제로 나랑 맞는지 작은 경험으로 검증해야 해",
        trigger: "현재 일이 지치고 새 분야가 훨씬 좋아 보일 때",
        reaction: "새 시작을 크게 상상하지만 필요한 기술·수입·일상은 덜 확인해",
        cost: "옮긴 뒤에야 현실 차이를 알 수 있어",
        assumed: "분야만 바꾸면 답답함이 사라진다",
        actual: "새 분야의 실제 하루와 필요한 조건을 미리 경험해야 해",
        steps: ["새 분야 실무자 1명 이야기 듣기", "작은 프로젝트나 강의 체험하기", "전환 비용·기간 계산하기"],
        keep: "새 분야의 현실까지 솔직하게 알려주는 사람",
        cut: "성공 사례만 보여주며 당장 바꾸라고 하는 사람",
        place: "본업을 유지하면서 작게 전환을 시험할 수 있는 환경",
        first: "새 분야 프로젝트·체험·지원으로 현실 반응을 확인해",
        second: "맞는 게 확인되면 시간·돈·학습 계획을 전환 쪽으로 확정해",
      },
      strength: {
        label: "내 적성·강점을 알고 싶어",
        focus: "좋아하는 것만이 아니라 남보다 덜 지치면서 반복해서 잘하는 걸 찾아야 해",
        trigger: "내 장점이 평범해 보여서 특별한 적성을 찾고 싶을 때",
        reaction: "새로운 재능만 찾고 이미 잘하는 건 당연하게 넘겨",
        cost: "실제로 쓸 수 있는 강점을 놓치게 돼",
        assumed: "적성은 특별한 재능 하나로 나타난다",
        actual: "반복해서 잘하고 주변에서 자주 맡기는 패턴이 적성의 힌트야",
        steps: ["최근 칭찬받은 일 5개 적기", "덜 지치면서 잘한 일 표시하기", "그 강점을 쓰는 역할 하나 찾아보기"],
        keep: "네가 이미 잘하는 걸 구체적으로 말해주는 사람",
        cut: "타고난 천직 하나만 찾으라고 압박하는 사람",
        place: "강점을 여러 역할로 시험해볼 수 있는 환경",
        first: "잘하는 힘 하나를 실제 과제나 역할에서 더 크게 써봐",
        second: "성과와 만족이 같이 나온 강점을 중심 역할로 가져가",
      },
    },
    people: {
      friend: {
        label: "친구·지인 때문에 힘들어",
        focus: "친한 기간보다 만나고 난 뒤 네가 편한지 소모되는지를 보는 게 더 중요해",
        trigger: "서운한 일이 있어도 관계가 깨질까 걱정될 때",
        reaction: "웃고 넘기고 혼자 의미를 오래 곱씹어",
        cost: "친구를 만나기 전부터 피곤해질 수 있어",
        assumed: "오래 본 친구면 이 정도는 참아야 한다",
        actual: "친함과 존중은 별개라서 불편함을 계속 무시할 필요 없어",
        steps: ["최근 불편했던 장면 하나 적기", "다음엔 짧게 불편함 말하기", "말한 뒤 반응을 보기"],
        keep: "네가 선을 말해도 관계를 위협하지 않는 친구",
        cut: "장난이라며 불편함을 계속 반복하는 사람",
        place: "눈치보다 솔직한 대화가 가능한 관계",
        first: "작은 불편함 하나를 말해보고 친구 반응을 확인해",
        second: "선을 존중한 친구는 남기고 계속 넘는 관계는 거리를 줄여",
      },
      work: {
        label: "직장 사람 때문에 힘들어",
        focus: "좋아하고 싫어하는 문제보다 업무 경계·책임·말의 기록을 분명히 하는 게 먼저야",
        trigger: "상사나 동료가 애매하게 일을 넘기거나 선을 넘을 때",
        reaction: "분위기 깨기 싫어 일단 받아주고 뒤에서 더 지쳐",
        cost: "업무와 감정 문제가 한꺼번에 커져",
        assumed: "내가 잘하면 관계도 자연스럽게 좋아진다",
        actual: "직장 관계는 호감보다 역할과 기준을 분명히 해야 편해져",
        steps: ["업무 요청을 글로 남기기", "내 담당 범위 한 문장으로 말하기", "반복되는 문제는 상위 기준에 맞춰 요청하기"],
        keep: "역할과 피드백을 분명히 하는 사람",
        cut: "책임은 넘기고 공은 가져가는 사람",
        place: "업무 기록과 역할 구분이 가능한 팀",
        first: "업무 경계 하나를 말하거나 기록으로 남겨 반응을 봐",
        second: "개선되는 관계는 유지하고 반복되면 역할·거리·보고선을 조정해",
      },
      family: {
        label: "가족과 자꾸 부딪혀",
        focus: "가족이라서 다 이해해야 하는 게 아니라 반복되는 주제에서 내 선을 어떻게 지킬지 봐야 해",
        trigger: "같은 잔소리·기대·간섭이 반복될 때",
        reaction: "참다가 한 번에 폭발하거나 아예 말을 닫아",
        cost: "한 주제 때문에 가족 관계 전체가 힘들어져",
        assumed: "가족이면 내가 맞춰야 평화롭다",
        actual: "가까운 관계일수록 허용할 것과 안 할 것을 짧게 반복해서 알려야 해",
        steps: ["반복 충돌 주제 1개 고르기", "내가 가능한 선 한 문장 만들기", "설명 길게 하지 않고 같은 문장 반복하기"],
        keep: "네 경계를 듣고 조정하려는 가족",
        cut: "죄책감으로 네 선택을 바꾸려는 반응",
        place: "대화를 길게 끌지 않고 쉬었다 다시 말할 수 있는 환경",
        first: "가장 반복되는 주제 하나에 짧은 경계 문장을 꺼내",
        second: "조정되는 부분은 유지하고 안 바뀌는 부분은 접촉 방식이나 거리를 조절해",
      },
      distance: {
        label: "계속 볼지 거리를 둘지 고민이야",
        focus: "한 번의 실수보다 같은 불편함이 반복됐는지, 말했을 때 바뀌었는지를 기준으로 봐야 해",
        trigger: "좋았던 기억 때문에 관계를 끊는 게 너무 과한가 싶을 때",
        reaction: "문제를 작게 만들고 다시 한 번 기회를 줘",
        cost: "결정은 미뤄지고 같은 상처가 반복돼",
        assumed: "확실히 나쁜 사람이 아니면 관계를 끊으면 안 된다",
        actual: "상대가 나쁜 사람인지보다 이 관계가 계속 나를 소모시키는지가 더 중요해",
        steps: ["반복된 불편함 횟수 적기", "이미 말해본 적 있는지 확인하기", "한 달 거리두기 후 내 컨디션 비교하기"],
        keep: "거리 요청을 존중하고 행동을 바꾸는 사람",
        cut: "죄책감·압박으로 다시 가까워지게 만드는 사람",
        place: "연락 빈도와 만남을 내가 조절할 수 있는 관계",
        first: "작은 거리두기나 경계선을 적용해 상대 반응과 내 컨디션을 봐",
        second: "편해졌다면 거리 기준을 유지하고 계속 소모되면 더 멀어져도 돼",
      },
    },
    mental: {
      burnout: {
        label: "번아웃이 온 것 같아",
        focus: "지금은 더 잘하는 방법보다 무엇을 덜어낼지 먼저 정해야 해",
        trigger: "해야 할 일이 쌓였는데 쉬면 더 불안할 때",
        reaction: "휴식을 줄이고 속도가 떨어진 상태로 계속 버텨",
        cost: "작은 일도 무겁고 회복에 더 오래 걸려",
        assumed: "조금만 더 버티면 다시 괜찮아진다",
        actual: "부하를 줄이지 않으면 쉬는 시간만 늘려도 회복이 안 될 수 있어",
        steps: ["이번 주 할 일 하나 빼기", "수면시간 먼저 고정하기", "성과 없는 휴식 30분 넣기"],
        keep: "쉬는 걸 게으름으로 보지 않는 사람",
        cut: "힘들다는데 더 열심히 하라고 몰아붙이는 사람",
        place: "해야 할 일을 줄이고 회복시간을 지킬 수 있는 환경",
        first: "업무·약속 하나를 실제로 덜어내고 몸 반응을 확인해",
        second: "효과 있었던 수면·휴식·운동 하나를 반복 일정으로 고정해",
      },
      overthink: {
        label: "생각이 너무 많아",
        focus: "답을 더 찾는 것보다 머릿속 문제를 행동 가능한 것과 아닌 것으로 나누는 게 먼저야",
        trigger: "결과를 통제할 수 없거나 상대 반응이 애매할 때",
        reaction: "같은 생각을 다른 각도로 계속 돌려",
        cost: "결론은 안 나는데 에너지만 빠져",
        assumed: "더 생각하면 불안을 없앨 수 있다",
        actual: "확인할 수 없는 문제는 생각량을 늘려도 답이 안 나와",
        steps: ["걱정을 내 행동/남의 행동으로 나누기", "내 행동 하나만 바로 처리하기", "생각 시간 20분 제한하기"],
        keep: "답을 강요하지 않고 현실 행동 하나로 돌아오게 해주는 사람",
        cut: "불안을 더 자극하는 추측과 비교",
        place: "메모하고 생각을 멈출 종료시간이 있는 환경",
        first: "머릿속 걱정 하나를 실제 확인 행동으로 바꿔",
        second: "확인해도 바뀌지 않는 문제는 생각시간 제한을 생활 규칙으로 굳혀",
      },
      low: {
        label: "아무것도 하기 싫어",
        focus: "의욕을 억지로 만들기보다 생활 에너지부터 바닥에서 조금 올리는 게 먼저야",
        trigger: "할 일이 너무 많거나 실패감이 쌓였을 때",
        reaction: "시작 기준을 높게 잡아 결국 아무것도 못 해",
        cost: "쉬어도 죄책감이 남고 더 시작하기 어려워져",
        assumed: "의지가 생겨야 다시 움직일 수 있다",
        actual: "기분보다 먼저 아주 작은 행동을 만들어야 에너지가 따라올 수 있어",
        steps: ["씻기·산책·식사 중 하나만 하기", "할 일을 10분짜리로 줄이기", "오늘 성공 기준을 하나로 낮추기"],
        keep: "작은 회복도 인정해주는 사람",
        cut: "비교하거나 의지 부족이라고 몰아가는 말",
        place: "성과 압박 없이 작은 행동을 반복할 수 있는 환경",
        first: "10분 안에 끝나는 생활 행동 하나만 실행해",
        second: "조금 나아진 행동 두세 개만 루틴으로 연결해",
      },
      recover: {
        label: "다시 컨디션을 찾고 싶어",
        focus: "한 번 푹 쉬는 것보다 수면·식사·운동·혼자 있는 시간을 다시 일정하게 만드는 게 핵심이야",
        trigger: "좀 괜찮아지면 밀린 일을 한꺼번에 처리하고 싶을 때",
        reaction: "회복 중인데 다시 속도를 확 올려",
        cost: "좋아졌다가 또 방전되는 사이클이 반복돼",
        assumed: "컨디션이 돌아오면 예전 속도로 바로 복귀해도 된다",
        actual: "회복은 속도를 천천히 올려야 오래 유지돼",
        steps: ["기상·수면시간 먼저 맞추기", "주 2회 가벼운 움직임 넣기", "일정 80%까지만 채우기"],
        keep: "네 회복 속도를 존중하는 사람",
        cut: "괜찮아 보인다고 바로 예전만큼 요구하는 사람",
        place: "일정에 빈칸을 남겨둘 수 있는 환경",
        first: "수면·식사·운동 중 하나를 일주일 고정해",
        second: "효과 있는 루틴은 남기고 활동량을 천천히 늘려",
      },
    },
  };

  const SITUATION_SHORT_LABELS = {
    money: { saving:"저축", income:"수입", side:"부업", flow:"돈 흐름" },
    career: { exam:"시험", jobsearch:"취업", move:"이직·퇴사", current:"현 직장" },
    love: { crush:"썸·짝사랑", relationship:"연애 중", breakup:"이별·재회", new:"새 인연" },
    path: { lost:"진로 고민", current:"현재 진로", switch:"전향", strength:"적성·강점" },
    people: { friend:"친구·지인", work:"직장 관계", family:"가족", distance:"거리두기" },
    mental: { burnout:"번아웃", overthink:"생각 과다", low:"무기력", recover:"회복" },
  };

  function getSituationProfile(data) {
    const concernKey = data?.concernKey || "money";
    const situationKey = data?.concernSituation || "";
    return SITUATION_PROFILES[concernKey]?.[situationKey] || null;
  }

  function shortSituationLabel(data) {
    const concernKey = data?.concernKey || "money";
    const situationKey = data?.concernSituation || "";
    return (
      SITUATION_SHORT_LABELS[concernKey]?.[situationKey] ||
      getSituationProfile(data)?.label ||
      CONCERN_LABELS[concernKey] ||
      "지금 고민"
    );
  }

  function userCallName(data) {
    const raw = String(data?.name || data?.userName || "").trim();
    if (!raw) return "너";
    const name = raw.length >= 2 ? raw.slice(1) : raw;
    const last = name.charCodeAt(name.length - 1);
    const batchim =
      last >= 0xac00 && last <= 0xd7a3
        ? (last - 0xac00) % 28 > 0
        : false;
    return `${name}${batchim ? "아" : "야"}`;
  }

  function compactBadge(data, stage) {
    return `${shortSituationLabel(data)} · ${stage}`;
  }

  function situationPersonalLine(data, isT) {
    const profile = data?.integratedSajuProfile || null;
    if (!profile) {
      return isT
        ? "지금 네 상황만 놓고 볼게. 바꿀 수 있는 것부터 바로 잡자."
        : "언니는 네 얘기만 놓고 볼게. 괜히 크게 단정하지 말고, 지금 바꿀 수 있는 것부터 같이 보자.";
    }
    const human =
      profile.balance?.climateHuman ||
      profile.sipsin?.dominantHuman ||
      "현실 반응을 확인하면서 움직이는 쪽";
    const verb =
      profile.elements?.primaryBehavior?.verb ||
      "한 번에 하나씩 움직이는 것";
    return isT
      ? `너는 <b>${human}</b> 쪽이 맞아. 여기선 <b>${verb}</b>부터 쓰자. 내가 그 순서로 잡아줄게.`
      : `그리고 너는 <b>${human}</b>일 때 덜 지쳐. 언니는 여기서도 <b>${verb}</b>부터 같이 챙겨주고 싶어.`;
  }

  function applySituationNotes(notes, data, mode) {
    const p = getSituationProfile(data);
    if (!p || !Array.isArray(notes) || notes.length < 5) return notes;
    const isT = mode === "T";
    const out = notes.map((note) => ({ ...note }));
    const call = userCallName(data);
    const personal = situationPersonalLine(data, isT);

    out[0] = {
      ...out[0],
      badge: compactBadge(data, "핵심"),
      title: isT
        ? `${call}, 핵심은 이거야`
        : `${call}, 언니가 여기부터 볼게`,
      desc: isT
        ? `${p.focus}.<br><br>${personal}<br><br>다른 경우 섞지 않고 지금 네 상황만 볼게.`
        : `${p.focus}.<br><br>${personal}<br><br>지금은 다른 사람 얘기 말고 딱 네 상황만 보자.`,
      checklist: isT
        ? "지금 제일 바꾸고 싶은 것 하나만 적어. 그거부터 보자."
        : "우리 하나만 먼저 정하자. 지금 제일 바뀌었으면 하는 걸 한 줄로 적어봐.",
    };

    out[1] = {
      ...out[1],
      badge: compactBadge(data, "패턴"),
      title: isT
        ? "막히는 순서, 딱 여기야"
        : "네 마음이 지치는 순서, 여기 있어",
      desc: isT
        ? `<b>시작</b> — ${p.trigger}.<br><br><b>반응</b> — ${p.reaction}.<br><br><b>결과</b> — ${p.cost}.<br><br>네 성격 문제가 아니야. 이 순서만 끊으면 돼. 내가 끊을 지점까지 딱 잡아줄게.`
        : `보통 <b>${p.trigger}</b> 때 시작돼. 그러면 ${p.reaction}. 결국 ${p.cost}.<br><br>또 이랬다고 네 탓부터 하지 마. 언니랑 여기만 끊어보자.`,
      checklist: isT
        ? "다음에 같은 장면 오면 ‘지금 시작됐네’ 하고 바로 멈춰."
        : "다음에 같은 장면 오면 ‘아, 또 여기구나’ 하고 한 번만 알아차려보자.",
    };

    {
      const base = out[2];
      const situationAdd = isT
        ? `<br><br><b>지금 네 상황에선 이것도 봐</b><br>네가 ${p.assumed}고 보기 쉬운데, 내가 먼저 볼 건 <b>${p.actual}</b> 쪽이야.<br><br>${personal}`
        : `<br><br><b>그리고 지금 네 상황에선 이것도 같이 보자</b><br>너는 ${p.assumed}고 생각했을 수 있어. 근데 언니는 <b>${p.actual}</b> 쪽을 먼저 볼래.<br><br>${personal} 그러니까 너 자체부터 문제 삼지는 말자.`;
      out[2] = {
        ...base,
        badge: compactBadge(data, "놓친 점"),
        title: base?.title,
        desc: `${base?.desc || ""}${situationAdd}`,
        checklist: base?.checklist,
      };
    }

    out[3] = {
      ...out[3],
      badge: compactBadge(data, "7일"),
      title: isT
        ? "7일은 이 세 개만 해"
        : "우리 7일만 이렇게 해보자",
      desc: isT
        ? `내가 세 개만 줄게.<br><br><b>1.</b> ${p.steps[0]}.<br><br><b>2.</b> ${p.steps[1]}.<br><br><b>3.</b> ${p.steps[2]}.<br><br>다 하려고 하지 마. 먹히는 것만 남기면 돼.`
        : `언니가 딱 세 개만 줄게.<br><br><b>하나.</b> ${p.steps[0]}.<br><br><b>둘.</b> ${p.steps[1]}.<br><br><b>셋.</b> ${p.steps[2]}.<br><br>다 잘하려고 하지 마. 하나만 달라져도 충분해.`,
      checklist: isT
        ? "7일 뒤 몇 번 했는지만 봐. 잘했나 못했나는 빼."
        : "7일 뒤 ‘이건 좀 덜 힘들었다’ 싶은 것 하나만 우리 남겨보자.",
    };

    out[4] = {
      ...out[4],
      badge: compactBadge(data, "사람"),
      title: isT
        ? "가까이 둘 사람, 기준은 이거야"
        : "네 편이 될 사람, 이렇게 보면 돼",
      desc: isT
        ? `내가 기준만 딱 줄게.<br><br><b>가까이 둘 쪽</b><br>${p.keep}.<br><br><b>거리 둘 쪽</b><br>${p.cut}.<br><br><b>맞는 환경</b><br>${p.place}.`
        : `언니가 사람 기준도 같이 봐줄게.<br><br><b>곁에 두면 좋은 쪽</b><br>${p.keep}.<br><br><b>조금 멀리해도 되는 쪽</b><br>${p.cut}.<br><br><b>네가 편한 환경</b><br>${p.place}.<br><br>네가 더 애써야만 유지되는 관계를 정답처럼 붙잡지는 말자.`,
      checklist: isT
        ? "한 사람만 떠올려. 만나고 나서 편해졌는지 소모됐는지만 봐."
        : "한 사람만 떠올려보자. 만나고 난 뒤 네가 편했는지 지쳤는지만 보면 돼.",
    };
    return out;
  }

  function situationTimingAction(data, which, isT) {
    const p = getSituationProfile(data);
    if (!p) return "";
    const action = which === "first" ? p.first : p.second;
    if (!action) return "";
    if (isT) {
      return which === "first"
        ? `${action}. 여기선 반응만 봐. 결론은 아직 내리지 마.`
        : `${action}. 처음 괜찮았던 것만 남겨. 그걸로 충분해.`;
    }
    return which === "first"
      ? `${action}. 너무 결론부터 내리지 말고, 언니랑 반응부터 같이 보자.`
      : `${action}. 처음 해봤을 때 괜찮았던 것만 이어가면 돼.`;
  }

  function sharedTimingOverlap(data, concernKey, timing, isT) {
    const male = data?.userGender === "male";
    let pairedConcern = "";
    if (male && concernKey === "money") pairedConcern = "love";
    else if (male && concernKey === "love") pairedConcern = "money";
    else if (!male && concernKey === "career") pairedConcern = "love";
    else if (!male && concernKey === "love") pairedConcern = "career";
    if (!pairedConcern) return null;

    const paired = safeTiming(data, pairedConcern);
    if (!paired) return null;
    const same = [];
    if (timing?.r1 && timing.r1 === paired.r1) same.push(timing.r1);
    if (timing?.r2 && timing.r2 === paired.r2) same.push(timing.r2);
    if (same.length === 0) return null;

    const pairedLabel = CONCERN_LABELS[pairedConcern] || pairedConcern;
    const text = isT
      ? `${pairedLabel}이랑 날짜가 겹쳐도 오류 아니야. 네 사주에선 둘이 같은 때 반응해. 날짜는 같아도 여기서 할 행동은 따로 보면 돼.`
      : `혹시 ${pairedLabel}에서도 같은 날짜 봤지? 복붙 아니야. 네 흐름에서 둘이 같이 움직이는 때가 겹친 거야. 언니가 지금 고민에 맞는 행동만 따로 잡아줄게.`;
    return { pairedConcern, same, text };
  }

  function momentumText(momentum, isT) {
    const row = MOMENTUM_LABEL[momentum] || MOMENTUM_LABEL.selective;
    return isT ? row.T : row.F;
  }

  function fallbackFlow(concernKey, which, isT, momentum, data) {
    const map = CONCERN_ACTIONS[concernKey] || CONCERN_ACTIONS.money;
    const action =
      situationTimingAction(data, which, isT) ||
      map[which][isT ? "T" : "F"];
    const head = momentumText(momentum, isT);
    return `${head}이야. ${action}`;
  }

  function periodCopy(timing, concernKey, which, isT, data) {
    const first = which === "first";
    const momentum = first ? timing?.momentum1 : timing?.momentum2;
    const situationAction = situationTimingAction(data, which, isT);

    // 세부 상황이 선택된 경우, 기존 고민 공통 문장에 "새 인연" 같은
    // 다른 상황 전제가 섞이지 않도록 날짜/기세만 공유하고 행동 문장은 전부 상황별로 쓴다.
    if (situationAction) {
      return `${momentumText(momentum, isT)}이야. ${situationAction}`;
    }

    const sentence = first
      ? (isT ? timing?.fullSentenceT : timing?.fullSentenceF)
      : (isT ? timing?.fullSentenceR2T : timing?.fullSentenceR2F);
    const action =
      (CONCERN_ACTIONS[concernKey] || CONCERN_ACTIONS.money)[which][isT ? "T" : "F"];
    const clean = stripHtml(sentence);
    if (!clean || clean.length < 12)
      return fallbackFlow(concernKey, which, isT, momentum, data);
    return `${clean} ${action}`;
  }

  function comparisonLine(timing, concernKey, isT) {
    const m1 = momentumText(timing?.momentum1, isT);
    const m2 = momentumText(timing?.momentum2, isT);
    if (isT) {
      if (m1 === m2) return "분위기는 비슷해도 순서는 달라. 처음엔 확인, 다음엔 괜찮았던 것만 남겨.";
      return `처음은 <b>${m1}</b>, 다음은 <b>${m2}</b>. 같은 행동 반복하지 말고 반응 보고 바꿔.`;
    }
    if (m1 === m2) return "둘 다 비슷해 보여도 역할은 달라. 처음엔 가볍게 확인하고, 다음엔 괜찮았던 걸 조금 더 잡으면 돼.";
    return `처음은 <b>${m1}</b>, 다음은 <b>${m2}</b>이야. 처음 해본 걸 그대로 반복하지 말고, 네 마음이랑 현실 반응 보고 다음 걸 고르자.`;
  }

  function rebuildNoteSix(note, data, mode) {
    const isT = mode === "T";
    const concernKey = data?.concernKey || "money";
    const timing = safeTiming(data, concernKey);
    if (!timing) return note;

    let firstBody = periodCopy(timing, concernKey, "first", isT, data);
    let secondBody = periodCopy(timing, concernKey, "second", isT, data);
    if (normalizeSentence(firstBody) === normalizeSentence(secondBody)) {
      secondBody = fallbackFlow(concernKey, "second", isT, timing?.momentum2, data);
    }

    const firstDate = timing.r1 || "첫 번째 흐름";
    const secondDate = timing.r2 || "두 번째 흐름";
    const call = userCallName(data);
    const situation = getSituationProfile(data);
    const overlap = sharedTimingOverlap(data, concernKey, timing, isT);
    const profile = data?.integratedSajuProfile || null;

    const intro = isT
      ? "날짜만 던지면 쓸모없어. 내가 처음엔 뭘 보고, 다음엔 뭘 잡을지 딱 나눠줄게."
      : "날짜만 툭 던지고 끝내진 않을게. 언니가 처음엔 뭘 보고, 다음엔 뭘 잡을지 같이 나눠줄게.";

    const personalMove = profile
      ? (isT
        ? `너는 <b>${profile.balance?.climateHuman || "현실 반응을 보면서 속도를 조절하는 쪽"}</b>이 맞아. 그래서 <b>${profile.elements?.primaryBehavior?.verb || "한 번에 하나씩 움직이는 것"}</b>부터 가자. 내가 순서까지 잡아줄게.`
        : `너는 <b>${profile.balance?.climateHuman || "현실 반응을 보면서 속도를 조절하는 쪽"}</b>으로 갈 때 덜 지쳐. 언니는 <b>${profile.elements?.primaryBehavior?.verb || "한 번에 하나씩 움직이는 것"}</b>부터 같이 해봤으면 좋겠어.`)
      : (isT
        ? "한 번에 뒤집지 마. 하나 움직이고 반응 본 다음 다음 걸 정하자."
        : "좋은 때라고 한 번에 다 바꿀 필요 없어. 하나 해보고 네 마음이랑 현실 반응 본 다음, 그다음 걸 같이 고르면 돼.");

    const overlapHtml = overlap
      ? `<br><br><div style="padding:10px 12px;border-radius:12px;background:#fff7ed;color:#9a3412;font-size:12px;line-height:1.7"><b>날짜가 또 같다면?</b><br>${overlap.text}</div>`
      : "";

    const desc = `${intro}${overlapHtml}<br><br><b>먼저 · ${firstDate}</b><br>${firstBody}<br><br><b>그다음 · ${secondDate}</b><br>${secondBody}<br><br><b>둘은 이렇게 달라</b><br>${comparisonLine(timing, concernKey, isT)}<br><br><b>너는 이렇게 가</b><br>${personalMove}`;
    const checklist = isT
      ? `캘린더에 딱 두 개만 넣어. ${firstDate}에 확인할 것 하나, ${secondDate}에 이어갈 것 하나.`
      : `언니랑 약속 하나만 하자. ${firstDate}엔 가볍게 해볼 것 하나, ${secondDate}엔 이어갈 것 하나만 적어두자.`;

    return {
      ...note,
      badge: compactBadge(data, "시기"),
      title: isT
        ? `${call}, 움직일 때는 여기야`
        : `${call}, 움직일 때도 언니랑 같이 보자`,
      desc,
      checklist,
      __timingQA: {
        firstDate,
        secondDate,
        firstBody,
        secondBody,
        concernSituation: data?.concernSituation || "",
        sharedTimingWith: overlap?.pairedConcern || "",
        sharedDates: overlap?.same || [],
        profileFingerprint: profile?.fingerprint || "",
      },
    };
  }

  function splitSentences(html) {
    return stripHtml(html)
      .split(/(?<=[.!?。])\s+|\n+/)
      .map((s) => s.trim())
      .filter((s) => s.length >= 18);
  }

  function auditNotes(notes, mode) {
    const seen = new Map();
    const duplicates = [];
    const hardTerms = [];
    const banned = ["월령", "지장간", "상신", "기신", "격국", "용신", "세운", "십신", "신강", "신약", "사령"];
    (notes || []).forEach((note, i) => {
      splitSentences(note?.desc).forEach((sentence) => {
        const key = normalizeSentence(sentence);
        if (key.length < 16) return;
        if (seen.has(key)) duplicates.push([seen.get(key), i + 1, sentence]);
        else seen.set(key, i + 1);
      });
      const text = stripHtml(`${note?.title || ""} ${note?.desc || ""} ${note?.checklist || ""}`);
      banned.forEach((term) => { if (text.includes(term)) hardTerms.push([i + 1, term]); });
    });
    const n6 = notes?.[5]?.__timingQA;
    const timingDuplicate = !!n6 && normalizeSentence(n6.firstBody) === normalizeSentence(n6.secondBody);
    const tone = (notes || []).map((n) => stripHtml(`${n?.title || ""} ${n?.desc || ""}`)).join(" ");
    const fSignals = ["언니", "같이", "우리", "괜찮", "마음", "해보자", "돼"].filter((x) => tone.includes(x)).length;
    const tSignals = ["내가", "딱", "바로", "확인", "기준", "끊", "보자"].filter((x) => tone.includes(x)).length;
    const badgeTooLong = (notes || [])
      .map((n, i) => ({ i:i + 1, badge:String(n?.badge || "") }))
      .filter((x) => x.badge.length > 16);
    return { duplicates, hardTerms, timingDuplicate, toneScore: mode === "T" ? tSignals : fSignals, badgeTooLong };
  }

  function polishPaidValueNotes(notes, data, mode) {
    if (!Array.isArray(notes) || notes.length < 6) return notes;
    let out = notes.map((n) => ({ ...n }));
    out[5] = rebuildNoteSix(out[5], data || {}, mode || "F");
    out = applySituationNotes(out, data || {}, mode || "F");
    const audit = auditNotes(out, mode || "F");
    if (data && typeof data === "object") data.paidValueAudit = audit;
    return out;
  }

  global.polishPaidValueNotes = polishPaidValueNotes;
  global.auditPaidValueNotes = auditNotes;
  global.__PAID_VALUE_LAYER_V1__ = {
    version: "1.2.0",
    situationProfiles: SITUATION_PROFILES,
  };

  const base = global.generateConcernNotes;
  if (typeof base === "function" && !base.__paidValueWrapped) {
    const wrapped = function (data, mode) {
      return polishPaidValueNotes(base(data, mode), data || {}, mode || "F");
    };
    wrapped.__paidValueWrapped = true;
    wrapped.__integratedProfileWrapped = !!base.__integratedProfileWrapped;
    wrapped.__base = base.__base || base;
    wrapped.__integratedBase = base;
    global.generateConcernNotes = wrapped;
  }
})(globalThis);
