(function (global) {
  "use strict";

  const VERSION = "2.0.0";
  const CONCERNS = {
    money: { label: "재물·돈복", emoji: "💸" },
    career: { label: "학업·커리어", emoji: "💼" },
    love: { label: "연애·썸", emoji: "💗" },
    path: { label: "진로·미래", emoji: "🧭" },
    people: { label: "인간관계", emoji: "🫂" },
    mental: { label: "번아웃·멘탈", emoji: "🌙" },
  };

  const PRODUCT_CATALOG = {
    concern_single: {
      id: "concern_single",
      name: "지금 고민 하나 정밀풀이",
      price: 990,
      eyebrow: "지금 보고 있는 상품",
      desc: "고민 하나를 6개의 다른 각도로 끝까지 파는 어떤언니 기본판",
    },
    concern_pack3: {
      id: "concern_pack3",
      name: "고민 3개 더 보기",
      price: 2900,
      eyebrow: "한 가지로 안 끝날 때",
      desc: "돈·연애·커리어·진로·사람·멘탈 중 원하는 3개를 골라 각각 6노트로 확인",
    },
    full_saju: {
      id: "full_saju",
      name: "내 전체 사주판",
      price: 4900,
      eyebrow: "언니 추천",
      desc: "지금 고민을 넘어 성향·돈·일·연애·사람·회복·앞으로의 흐름을 한 장으로 연결",
    },
    compatibility: {
      id: "compatibility",
      name: "우리 둘 궁합",
      price: 3900,
      eyebrow: "상대 생일이 있다면",
      desc: "누가 더 좋다는 점수 대신 끌리는 지점·부딪히는 지점·오래 가는 방식을 둘의 사주로 비교",
    },
    premium_all: {
      id: "premium_all",
      name: "프리미엄 올인원",
      price: 9900,
      eyebrow: "제일 깊게",
      desc: "6개 고민 전체 + 내 전체 사주판을 한 번에. 같은 설명 반복 없이 분야별로 따로 읽어줌",
    },
  };

  const SCENES = {
    money: {
      trigger: "불안하거나 ‘이 정도는 나한테 써도 되지’ 싶은 날",
      reaction: "돈 자체보다 기분을 먼저 달래는 선택이 빨라져",
      cost: "결제 뒤에 남는 건 물건보다 ‘왜 또 그랬지’ 하는 찝찝함이 되기 쉬워",
      falseCause: "내가 원래 돈 관리에 약한가",
      realCause: "마음이 흔들리는 순간에 평소 기준까지 같이 느슨해지는 것",
      action: "사고 싶은 건 바로 사지 말고 금액과 이유를 한 줄 적어 다음 날 다시 보기",
      stop: "기분이 상한 날에는 큰 결제·빌려주기·충동투자를 결정하지 않기",
      measure: "이번 주 ‘하루 미뤄서 안 산 돈’ 한 번만 기록하기",
      keep: "돈 얘기를 해도 네 형편과 기준을 존중하는 사람",
      cut: "호의·체면·비교심을 건드려 지갑부터 열게 만드는 사람",
    },
    career: {
      trigger: "평가받거나 다른 사람 성과가 눈에 들어오는 순간",
      reaction: "당장 보여주기보다 더 준비하고 더 완벽해진 뒤 내놓으려 해",
      cost: "실력은 늘어도 네가 한 일이 밖에서 보이는 속도는 늦어질 수 있어",
      falseCause: "아직 실력이 부족해서 기회가 안 오나",
      realCause: "준비가 부족한 게 아니라 결과를 밖으로 내놓는 시점이 늦어지는 것",
      action: "80% 완성된 결과물 하나를 제출·공유·지원 중 하나로 밖에 내놓기",
      stop: "자격증·공부를 하나 더 시작하기 전에 지금 가진 결과물부터 제출하기",
      measure: "이번 주 남에게 보여준 결과물 1개를 남기기",
      keep: "응원만 하는 사람보다 평가 기준과 네 몫을 분명히 말해주는 사람",
      cut: "네 성실함을 당연하게 쓰면서 기준·보상은 흐리는 사람",
    },
    love: {
      trigger: "상대 답장이 늦거나 평소보다 애매하게 느껴질 때",
      reaction: "묻기 전에 혼자 이유를 여러 개 만들고 네 표현부터 줄여",
      cost: "상대 마음은 확인하지 못한 채 네 불안만 점점 커질 수 있어",
      falseCause: "내가 사랑받기 어려운 사람인가",
      realCause: "상대의 마음을 확인하기 전에 네가 먼저 결론을 만들어버리는 것",
      action: "추측이 두 번 시작되면 해석을 멈추고 확인 질문 하나 하기",
      stop: "답장을 늦추거나 밀당으로 상대 반응을 시험하지 않기",
      measure: "이번 주 추측 대신 직접 확인한 장면 1개 만들기",
      keep: "서운함을 말해도 관계를 벌주지 않고 대화로 돌아오는 사람",
      cut: "말과 행동이 계속 다르면서 네가 눈치로 답을 맞히게 만드는 사람",
    },
    path: {
      trigger: "‘이 길이 맞나’라는 생각이 길어지고 주변 의견이 많이 들어올 때",
      reaction: "결정하기 전에 확신부터 100% 만들려고 정보와 생각을 더 모아",
      cost: "생각은 정교해지는데 실제 경험 데이터가 부족해서 오히려 확신이 더 안 생겨",
      falseCause: "내 적성을 아직 못 찾아서",
      realCause: "정답을 찾느라 작은 실험을 너무 늦게 시작하는 것",
      action: "7일 안에 결과가 남는 작은 실험 하나를 정하고 실제로 해보기",
      stop: "‘평생 할 수 있나’부터 계산하지 말고 첫 실험 전에는 장기 결론 내리지 않기",
      measure: "생각이 아니라 실제 해본 것 1개 남기기",
      keep: "걱정은 해도 네 선택권까지 가져가지 않는 사람",
      cut: "자기 정답을 네 인생의 정답처럼 밀어붙이는 사람",
    },
    people: {
      trigger: "상대가 불편한 말을 하거나 약속을 가볍게 넘겼을 때",
      reaction: "바로 선을 긋기보다 사정이 있겠지 하면서 한 번 더 이해해줘",
      cost: "작은 불편함이 쌓인 뒤에는 사소한 일에도 마음이 확 닫힐 수 있어",
      falseCause: "내가 사람 보는 눈이 없나",
      realCause: "사람을 잘못 고르는 것보다 불편함을 말하는 시점이 늦어지는 것",
      action: "불편함이 생긴 첫 주에 작은 요청이나 거절을 한 번 말해보기",
      stop: "세 번 참은 뒤 갑자기 손절하는 패턴 만들지 않기",
      measure: "이번 주 네 기준을 말한 장면 1개 적기",
      keep: "네가 상대 기분을 관리하지 않아도 편한 사람",
      cut: "선을 말하면 미안함부터 심어주거나 네 예민함 탓으로 돌리는 사람",
    },
    mental: {
      trigger: "해야 할 일이 몰리거나 누군가의 감정까지 같이 받아낸 날",
      reaction: "힘든 걸 알아도 일단 끝내고 쉬자는 쪽으로 계속 미뤄",
      cost: "버티는 동안은 괜찮아 보여도 회복 전에 다음 일이 들어오면 한꺼번에 꺼질 수 있어",
      falseCause: "내 멘탈이나 의지가 약해서",
      realCause: "회복을 남는 시간에만 하려고 해서 쉴 차례가 계속 뒤로 밀리는 것",
      action: "이번 주 두 번은 30분 회복 시간을 일정보다 먼저 캘린더에 잠그기",
      stop: "지친 날의 빈 시간을 또 다른 생산성 일정으로 채우지 않기",
      measure: "쉬고 난 뒤 실제로 덜 힘들어진 행동 1개 찾기",
      keep: "아무것도 증명하지 않아도 네 속도를 지켜주는 사람",
      cut: "쉬는 시간을 죄책감으로 만들거나 계속 더 하라고 몰아붙이는 사람",
    },
  };

  function safeText(v) {
    return v == null ? "" : String(v);
  }

  function esc(v) {
    return safeText(v)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function stripHtml(v) {
    return safeText(v).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  }

  function won(n) {
    return Number(n).toLocaleString("ko-KR") + "원";
  }

  function profileFor(data) {
    if (data && data.integratedSajuProfile) return data.integratedSajuProfile;
    if (typeof global.buildIntegratedSajuProfile === "function") {
      try {
        const p = global.buildIntegratedSajuProfile(data || {});
        if (data) data.integratedSajuProfile = p;
        return p;
      } catch (e) {}
    }
    return {
      fingerprint: "fallback",
      strength: { F: "너는 상황을 오래 읽는 편이라 네 속도를 먼저 챙기는 게 중요해", T: "상황을 오래 읽는 편이야. 결정 기준을 먼저 정해", code: "balanced" },
      elements: { influenceRank: { strongest: "to", weakest: "su" }, rawVsInfluenceMismatch: false },
      sipsin: { dominantHuman: "내 기준을 지키려는 성향", secondaryHuman: "" },
      structure: { statusHuman: "상황에 맞춰 조정할 때 힘이 잘 모이는 편", depthHuman: "겉모습 하나로 단정하기보다 반복되는 선택을 보는 게 중요해", sangsin: "", gisin: "" },
      balance: {
        primary: "to", secondary: "su", avoid: "mok", climateHuman: "한쪽으로 몰리지 않게 속도를 조절하는 쪽",
      },
      relations: { hasClash: false },
      behavior: { weakStatHuman: "한 번에 하나의 기준만 정해서 확인하는 것" },
      timing: { hash: 0 },
    };
  }

  const ELEM = {
    mok: { noun: "새 선택을 시작하고 키우는 힘", action: "작게 시작해서 실제 반응을 보는 것" },
    hwa: { noun: "마음을 밖으로 표현하고 반응을 받는 힘", action: "말하고 보여준 뒤 상대나 현실의 반응을 확인하는 것" },
    to: { noun: "흔들리지 않게 쌓고 유지하는 힘", action: "루틴·기록·저장으로 기준을 고정하는 것" },
    geum: { noun: "기준을 세우고 불필요한 걸 자르는 힘", action: "숫자나 조건을 정하고 아닌 것은 자르는 것" },
    su: { noun: "정보와 여백을 확보해 유연하게 판단하는 힘", action: "급히 결론내리지 않고 정보와 쉬는 틈을 확보하는 것" },
  };

  function elementInfo(key) {
    return ELEM[key] || ELEM.to;
  }

  function personFilter(profile, scene) {
    const helpful = scene.keep;
    const draining = scene.cut;
    const clash = profile.relations && profile.relations.hasClash;
    return {
      helpful,
      draining,
      test: clash
        ? "마음이 확 닫히기 전에 작은 불편함을 먼저 말하고, 그 사람이 고치는지 봐"
        : "괜찮은 척 오래 버티지 말고 작은 부탁이나 거절을 먼저 말해봐",
    };
  }

  function timingFor(data, concernKey) {
    try {
      if (typeof getTrueBaziTiming === "function") {
        return getTrueBaziTiming(
          data?.dayOheng || "to",
          concernKey,
          data?.userGender,
          data?.userBirthStr,
          data?.gyeokguk,
          data?.gyeokStatus,
          data?.realYeonun,
        );
      }
    } catch (e) {}
    return {
      r1: "2026년 흐름",
      r2: "2027년 흐름",
      fullSentenceF: "작게 움직여 반응을 확인하기 좋은 구간이야.",
      fullSentenceT: "작게 실행하고 반응을 확인해.",
      fullSentenceR2F: "앞에서 확인한 걸 내 기준으로 굳혀가기 좋은 구간이야.",
      fullSentenceR2T: "앞에서 확인한 데이터를 기준으로 확정해.",
      momentum1: "steady",
      momentum2: "steady",
      verdict1: "neutral",
      verdict2: "neutral",
    };
  }

  function postureText(momentum, concernKey, yearIndex, isT, profile) {
    const primary = elementInfo(profile.balance?.primary);
    const scene = SCENES[concernKey] || SCENES.money;
    const m = safeText(momentum);
    if (yearIndex === 1) {
      if (m === "strong") return isT
        ? `실행 구간이야. ${scene.action}. 반응이 오면 기록까지 남겨.`
        : `이때는 겁먹고 준비만 더 하기보다, ${scene.action}. 작은 반응 하나만 확인해도 충분해.`;
      if (m === "mixed") return isT
        ? `기회는 있는데 조건이 섞여 있어. 크게 베팅하지 말고 ${primary.action}부터 테스트해.`
        : `좋은 신호와 조심할 신호가 같이 올 수 있어. 한 번에 크게 정하지 말고 ${primary.action}부터 해보자.`;
      if (m === "caution") return isT
        ? `확장보다 방어가 먼저야. ${scene.stop}. 손실부터 막아.`
        : `이때는 더 해내는 것보다 지키는 게 먼저야. ${scene.stop}. 네 힘을 남겨두자.`;
      if (m === "passed") return isT ? "이미 지난 구간이면 복기만 해. 비슷한 장면에서 뭘 했는지 한 줄 적어." : "이미 지난 시기라면 아쉬워하지 말고, 그때 비슷한 일이 있었는지만 가볍게 돌아봐.";
      return isT ? `${scene.action}. 올해는 결과보다 실제 반응 데이터를 남기는 데 집중해.` : `${scene.action}. 올해는 완벽한 결과보다 ‘해봤더니 어땠는지’를 남기는 게 더 중요해.`;
    }
    if (m === "strong") return isT
      ? `확정·확장 구간으로 써. 2026년에 반응 좋았던 것만 남기고 규모를 키워.`
      : `앞에서 해본 것 중 진짜 반응이 좋았던 걸 골라서 조금 더 크게 가져가도 좋아. 다만 다 키우지 말고 하나만.`;
    if (m === "mixed") return isT
      ? `선별해서 굳혀. 반응 없는 건 버리고 남은 하나에만 시간·돈·감정을 써.`
      : `가능성은 있지만 다 안고 갈 필요는 없어. 앞에서 확인한 것 중 편하고 반응 좋았던 것만 남겨보자.`;
    if (m === "caution") return isT
      ? `회수·정리 구간이야. 새 판 벌이지 말고 이미 벌인 것의 비용과 체력을 줄여.`
      : `새로운 걸 더 얹기보다 지금까지 벌여둔 걸 정리하고 회복하는 쪽이 좋아. 덜어내는 것도 성과야.`;
    if (m === "passed") return isT ? "이미 지난 구간이면 결과만 정리해. 다음 선택 기준으로 써." : "이미 지난 시기라면 결과만 정리해두자. 다음에 같은 선택이 왔을 때 훨씬 덜 흔들릴 거야.";
    return isT ? `2026년에 남긴 데이터를 기준으로 하나를 확정해. ${primary.action}을 반복 가능한 방식으로 만들어.` : `2026년에 확인한 걸 바탕으로 하나를 내 방식으로 굳혀보자. ${primary.action}을 반복 가능한 습관으로 만드는 해로 쓰면 좋아.`;
  }

  function noteCopy(data, concernKey, mode, baseNotes) {
    const isT = mode === "T";
    const p = profileFor(data);
    const s = SCENES[concernKey] || SCENES.money;
    const strong = elementInfo(p.elements?.influenceRank?.strongest);
    const weak = elementInfo(p.elements?.influenceRank?.weakest);
    const primary = elementInfo(p.balance?.primary);
    const secondary = elementInfo(p.balance?.secondary);
    const avoid = elementInfo(p.balance?.avoid);
    const dominant = p.sipsin?.dominantHuman || "내 기준을 지키려는 성향";
    const second = p.sipsin?.secondaryHuman || "";
    const pf = personFilter(p, s);
    const timing = timingFor(data, concernKey);

    const mismatch = p.elements?.rawVsInfluenceMismatch
      ? (isT
          ? "겉으로 보이는 모습과 실제 힘이 몰리는 방향이 달라. 그래서 원인을 잘못 찍기 쉬워."
          : "겉으로 보이는 너와 실제로 힘을 많이 쓰는 방식이 조금 달라서, 스스로도 원인을 엉뚱한 데서 찾을 때가 있어.")
      : (isT
          ? "겉으로 보이는 모습과 실제 힘의 방향은 비슷해. 문제를 몰라서가 아니라 행동 시점이 늦어지는 쪽이야."
          : "겉으로 보이는 모습과 실제 힘의 방향은 꽤 비슷해. 그래서 몰라서라기보다 알면서도 타이밍을 늦추는 순간을 보는 게 중요해.");

    const relationLine = p.relations?.hasClash
      ? (isT ? "변수가 겹치면 참다가 한 번에 방향을 바꾸는 반응도 나와. 중간 확인을 넣어." : "여러 변수가 한꺼번에 겹치면 오래 참다가 마음이 확 돌아설 수 있어. 그 전에 중간 확인을 하나 넣어주자.")
      : (isT ? "큰 사건보다 작은 불편함을 오래 미루는 게 손실을 만든다." : "큰 사건 하나보다 작은 불편함을 오래 미루는 쪽이 네 힘을 더 많이 빼갈 수 있어.");

    const note1 = isT
      ? `<b>네가 먼저 보이는 반응</b><br>${dominant}${second ? `, 그다음엔 ${second}` : ""}. ${s.trigger} ${s.reaction}.<br><br><b>실제로 힘이 몰리는 곳</b><br>${strong.noun}은 자연스럽게 나오고, ${weak.noun}은 의식적으로 챙겨야 해. ${p.strength?.T || "결정 기준을 먼저 잡아."}<br><br>그래서 ${CONCERNS[concernKey].label}에서 네 문제를 성격 한 단어로 설명하면 반은 놓치는 거야.`
      : `<b>언니 눈에 제일 먼저 보이는 너</b><br>${dominant}${second ? `이랑 ${second}가 같이 있어` : "이 먼저 보여"}. 특히 ${s.trigger} ${s.reaction}.<br><br><b>근데 네 속은 이것도 같이 봐야 해</b><br>${strong.noun}은 비교적 자연스럽게 쓰는데, ${weak.noun}은 마음먹고 챙겨야 해. ${p.strength?.F || "네 속도를 먼저 챙겨줘야 오래 가."}<br><br>그러니까 ${CONCERNS[concernKey].label} 때문에 힘들었다고 네 성격 전체를 미워하진 않았으면 좋겠어.`;

    const note2 = isT
      ? `<b>시작</b><br>${s.trigger}.<br><br><b>네가 바로 하는 반응</b><br>${s.reaction}.<br><br><b>그다음 생기는 손실</b><br>${s.cost}.<br><br><b>여기서 끊어</b><br>${relationLine} 반복을 끊을 지점은 감정이 생기는 것 자체가 아니라 <b>그 감정 다음에 자동으로 붙는 행동</b>이야.`
      : `<b>시작</b><br>${s.trigger}.<br><br><b>그때 네가 바로 하는 것</b><br>${s.reaction}. 언니는 이걸 나쁜 버릇이라고만 보진 않아. 그 순간의 너 나름대로 마음을 지키는 방법이었을 수 있거든.<br><br><b>근데 오래 가면</b><br>${s.cost}. ${relationLine}<br><br>그래서 다음엔 감정을 없애려고 하지 말고, <b>감정 다음 행동 하나만 바꿔보자.</b>`;

    const note3 = isT
      ? `<b>네가 문제라고 느끼기 쉬운 것</b><br>${s.falseCause}.<br><br><b>실제로 더 먼저 볼 것</b><br>${s.realCause}. ${mismatch}<br><br>${p.structure?.statusHuman || "상황에 맞춰 조정할 때 힘이 잘 모이는 편"}. 그래서 원인을 하나로 단정하지 말고 <b>실제로 반복된 장면</b>을 기준으로 잡아.`
      : `<b>혹시 네가 이렇게 생각하고 있었어?</b><br>“${s.falseCause}.”<br><br><b>언니는 그보다 이쪽을 먼저 볼래</b><br>${s.realCause}. ${mismatch}<br><br>${p.structure?.statusHuman || "상황에 맞춰 조정할 때 힘이 잘 모이는 편"}이라서, 네가 부족해서라고 결론내리기 전에 실제로 반복된 장면을 한 번만 더 봐줬으면 좋겠어.`;

    const note4 = isT
      ? `<b>오늘</b><br>${s.action}.<br><br><b>7일 동안</b><br>1순위는 ${primary.action}. 그다음 ${secondary.action}. 반대로 ${avoid.action}만 과하게 쓰면 같은 문제가 반복돼.<br><br><b>금지선</b><br>${s.stop}.<br><br><b>성공 체크</b><br>${s.measure}. ${p.behavior?.weakStatHuman ? `그리고 ${p.behavior.weakStatHuman}도 숫자나 기록으로 확인해.` : ""}`
      : `<b>오늘 바로 하나만</b><br>${s.action}. 이것만 해도 돼.<br><br><b>7일 동안 언니랑 지킬 순서</b><br>먼저 ${primary.action}. 익숙해지면 ${secondary.action}을 붙여보자. ${avoid.action}만 계속하면 더 지칠 수 있으니까 그건 잠깐 줄여줘.<br><br><b>이번 주엔 이건 하지 말자</b><br>${s.stop}.<br><br><b>잘하고 있는지 보는 법</b><br>${s.measure}.`;

    const note5 = isT
      ? `<b>남길 사람</b><br>${pf.helpful}.<br><br><b>거리 둘 사람</b><br>${pf.draining}.<br><br><b>판별법</b><br>${pf.test}. 말보다 네가 선을 보였을 때 상대가 <b>수정하는지</b>를 봐.<br><br>네가 계속 설명해야만 유지되는 관계라면 이미 비용이 큰 관계야.`
      : `<b>네 옆에 남겼으면 하는 사람</b><br>${pf.helpful}. 그런 사람 앞에서는 네가 덜 애써도 관계가 유지돼.<br><br><b>조금 멀리해도 되는 사람</b><br>${pf.draining}.<br><br><b>헷갈릴 땐 이것만 보자</b><br>${pf.test}. 네가 작은 선을 말했을 때 미안하게 만들지 않고 고쳐주는 사람이라면 언니는 한 번 더 믿어봐도 좋다고 볼 것 같아.`;

    const sentence1 = isT ? timing.fullSentenceT : timing.fullSentenceF;
    const sentence2 = isT ? timing.fullSentenceR2T : timing.fullSentenceR2F;
    const action1 = postureText(timing.momentum1, concernKey, 1, isT, p);
    const action2 = postureText(timing.momentum2, concernKey, 2, isT, p);
    const timingIntro = isT
      ? "두 시기를 같은 방식으로 쓰면 안 돼. 2026은 확인·첫 행동, 2027은 그 결과를 보고 확정하거나 정리하는 쪽으로 나눠."
      : "둘 다 ‘좋은 때니까 열심히’로 읽으면 너무 아까워. 2026은 먼저 확인해보는 해, 2027은 그걸 내 것으로 굳히거나 정리하는 해처럼 다르게 쓰는 게 좋아.";
    const note6 = `${timingIntro}<br><br><div data-timing-year="2026"><b>2026 · ${esc(timing.r1)}</b><br>${safeText(sentence1)}<br><br><b>이때 할 일</b><br>${action1}</div><br><br><div data-timing-year="2027"><b>2027 · ${esc(timing.r2)}</b><br>${safeText(sentence2)}<br><br><b>이때 할 일</b><br>${action2}</div>`;

    const checklists = isT
      ? [
          `이번 주 ${CONCERNS[concernKey].label}에서 자동으로 한 행동 하나를 적어`,
          "시작 → 반응 → 손실 순서로 실제 장면 하나를 3줄로 적어",
          `‘${s.falseCause}’ 대신 실제 반복 행동 하나를 근거로 적어`,
          s.measure,
          "한 사람에게 작은 선을 말하고 상대가 수정하는지 확인해",
          `${timing.r1}에 넣을 행동 1개와 ${timing.r2}에 남길/정리할 기준 1개를 캘린더에 적어`,
        ]
      : [
          `이번 주 ${CONCERNS[concernKey].label} 때문에 마음 흔들린 장면 하나만 적어보기`,
          "그 장면에서 감정 다음에 바로 했던 행동 하나를 찾아보기",
          `“${s.falseCause}”라고 자책하기 전에 실제로 반복된 행동 하나 적어보기`,
          s.measure,
          "편안한 사람 한 명과 소모되는 사람 한 명을 떠올리고 이유 한 단어씩 적어보기",
          `${timing.r1}에 가볍게 해볼 것 1개, ${timing.r2}에 이어갈 것 1개를 미리 적어두기`,
        ];

    const copies = [note1, note2, note3, note4, note5, note6];
    return (baseNotes || []).map((note, i) => ({
      ...note,
      desc: copies[i] || note.desc,
      checklist: checklists[i] || note.checklist,
    }));
  }

  function premiumPolishNotes(notes, data, mode) {
    if (!Array.isArray(notes) || notes.length !== 6) return notes;
    const concernKey = data?.concernKey || "money";
    const polished = noteCopy(data || {}, concernKey, mode === "T" ? "T" : "F", notes);
    if (data) data.__premiumNoteQaV2 = { version: VERSION, concernKey, mode };
    return polished;
  }

  function cloneForConcern(data, key) {
    return {
      ...(data || {}),
      concernKey: key,
      rawSolutionTemplate: { F: { acts: [] }, T: { acts: [] } },
    };
  }

  function buildConcernPackProduct(data, mode, selected) {
    const keys = Array.from(new Set((selected || []).filter((x) => CONCERNS[x]))).slice(0, 3);
    const chosen = keys.length === 3 ? keys : Object.keys(CONCERNS).filter((x) => x !== data?.concernKey).slice(0, 3);
    return {
      title: "고민 3개 더 보기",
      subtitle: "같은 사주를 복붙하지 않고, 고민마다 다른 질문으로 다시 읽었어.",
      html: chosen.map((key) => {
        const notes = global.generateConcernNotes(cloneForConcern(data, key), mode);
        return `<section class="unni-product-report-section"><h3>${CONCERNS[key].emoji} ${CONCERNS[key].label}</h3>${notes.map((n) => `<article><strong>${esc(n.title)}</strong><p>${n.desc}</p></article>`).join("")}</section>`;
      }).join(""),
      selected: chosen,
    };
  }

  function concernSummary(data, mode, key) {
    const notes = global.generateConcernNotes(cloneForConcern(data, key), mode);
    const n1 = stripHtml(notes[0]?.desc || "");
    const n3 = stripHtml(notes[2]?.desc || "");
    const n4 = stripHtml(notes[3]?.desc || "");
    return {
      label: CONCERNS[key].label,
      body: `${n1.slice(0, 190)} ${n3.slice(0, 150)} ${n4.slice(0, 150)}`.trim(),
    };
  }

  function buildFullSajuProduct(data, mode) {
    const p = profileFor(data);
    const strong = elementInfo(p.elements?.influenceRank?.strongest);
    const weak = elementInfo(p.elements?.influenceRank?.weakest);
    const summaries = ["money", "career", "love", "people", "mental"].map((k) => concernSummary(data, mode, k));
    const timingCareer = timingFor(data, "career");
    const timingLove = timingFor(data, "love");
    const tone = mode === "T" ? "T" : "F";
    const intro = tone === "T"
      ? `${p.sipsin?.dominantHuman || "내 기준을 지키려는 성향"}이 중심이고, ${strong.noun}은 강점으로 쓰기 쉽지만 ${weak.noun}은 의식적으로 챙겨야 해. ${p.strength?.T || "결정 기준을 먼저 잡아."}`
      : `언니가 전체를 이어서 보면 ${p.sipsin?.dominantHuman || "내 기준을 지키려는 마음"}이 중심에 있어. ${strong.noun}은 자연스럽게 잘 쓰고, ${weak.noun}은 마음먹고 챙길수록 삶이 덜 힘들어져. ${p.strength?.F || "네 속도를 먼저 챙겨줘야 오래 가."}`;
    return {
      title: "내 전체 사주판",
      subtitle: "지금 고민 하나가 아니라, 같은 사람이 돈·일·사랑·사람·마음에서 어떻게 다르게 움직이는지 연결했어.",
      html: `<section class="unni-product-report-section"><h3>한눈에 보는 너</h3><p>${intro}</p></section>` +
        summaries.map((x) => `<section class="unni-product-report-section"><h3>${esc(x.label)}</h3><p>${esc(x.body)}</p></section>`).join("") +
        `<section class="unni-product-report-section"><h3>앞으로의 움직임</h3><p>커리어는 <b>${esc(timingCareer.r1)}</b>와 <b>${esc(timingCareer.r2)}</b>, 관계는 <b>${esc(timingLove.r1)}</b>와 <b>${esc(timingLove.r2)}</b>를 같은 방식으로 쓰지 않는 게 포인트야. 첫 구간은 확인, 다음 구간은 확정·정리로 나눠서 움직여.</p></section>`,
    };
  }

  function buildPremiumAllProduct(data, mode) {
    const full = buildFullSajuProduct(data, mode);
    const all = Object.keys(CONCERNS).map((key) => {
      const notes = global.generateConcernNotes(cloneForConcern(data, key), mode);
      return `<section class="unni-product-report-section"><h3>${CONCERNS[key].emoji} ${CONCERNS[key].label}</h3>${notes.map((n) => `<article><strong>${esc(n.title)}</strong><p>${n.desc}</p></article>`).join("")}</section>`;
    }).join("");
    return {
      title: "프리미엄 올인원",
      subtitle: "전체판 + 6개 고민을 한 번에. 같은 설명은 되풀이하지 않고 각 고민에서 필요한 장면만 다시 읽었어.",
      html: full.html + all,
    };
  }

  function compareProfiles(me, partner, mode) {
    const a = profileFor(me);
    const b = profileFor(partner);
    const aStrong = elementInfo(a.elements?.influenceRank?.strongest);
    const bStrong = elementInfo(b.elements?.influenceRank?.strongest);
    const aNeed = elementInfo(a.balance?.primary);
    const bNeed = elementInfo(b.balance?.primary);
    const aDom = a.sipsin?.dominantHuman || "내 기준을 지키려는 성향";
    const bDom = b.sipsin?.dominantHuman || "자기 기준을 지키려는 성향";
    const isT = mode === "T";
    const attraction = a.elements?.influenceRank?.weakest === b.elements?.influenceRank?.strongest || b.elements?.influenceRank?.weakest === a.elements?.influenceRank?.strongest
      ? (isT ? "서로 약한 부분을 상대가 자연스럽게 채워주는 장면이 생기기 쉬워. 그래서 처음엔 ‘나한테 없는 게 저 사람한텐 있네’라는 끌림이 커질 수 있어." : "서로에게 없는 힘을 상대가 자연스럽게 갖고 있어서, 처음엔 ‘이 사람 옆에 있으면 내가 조금 달라지는 것 같아’ 하는 끌림이 생기기 쉬워.")
      : (isT ? "둘이 비슷한 방식으로 힘을 쓰는 부분이 있어 속도는 잘 맞을 수 있어. 대신 같은 약점을 동시에 건드리면 갈등도 빨리 커질 수 있어." : "둘이 힘을 쓰는 방식이 비슷한 부분이 있어서 말하지 않아도 통하는 순간이 있어. 다만 둘 다 같은 데서 지치면 서로 여유가 없어질 수 있어.");
    const clash = (a.relations?.hasClash || b.relations?.hasClash)
      ? (isT ? "갈등이 생겼을 때 침묵으로 버티다가 한 번에 결론내리지 마. 작은 불편함에서 바로 확인해야 해." : "둘 중 한 명이라도 마음이 확 닫히기 전에 작은 서운함부터 말해주는 게 중요해. 참다가 한 번에 끝내는 방식은 둘 다 너무 아파.")
      : (isT ? "큰 싸움보다 작은 불편함을 방치하는 게 더 위험해. 주 1회라도 애매한 걸 바로 확인해." : "큰 싸움보다 ‘이 정도는 넘어가자’ 했던 작은 마음이 쌓이지 않게 가끔씩 먼저 물어봐주는 게 좋아.");
    return {
      title: "우리 둘 궁합",
      subtitle: "좋다/나쁘다 한 줄 대신 둘이 실제로 어디서 끌리고 어디서 지치는지 봤어.",
      html: `<section class="unni-product-report-section"><h3>왜 끌릴 수 있는지</h3><p>${attraction}</p></section>` +
        `<section class="unni-product-report-section"><h3>둘의 기본 속도</h3><p>너는 ${esc(aDom)}, 상대는 ${esc(bDom)}이 먼저 나오는 편이야. 너는 ${esc(aStrong.noun)}을, 상대는 ${esc(bStrong.noun)}을 자연스럽게 쓰는 쪽이라 같은 상황에서도 먼저 보는 포인트가 다를 수 있어.</p></section>` +
        `<section class="unni-product-report-section"><h3>부딪히기 쉬운 지점</h3><p>${clash}</p></section>` +
        `<section class="unni-product-report-section"><h3>오래 가는 방식</h3><p>너한테 필요한 건 ${esc(aNeed.action)}, 상대에게 필요한 건 ${esc(bNeed.action)}이야. 한쪽 방식만 정답으로 만들지 말고, 갈등 때는 각자 필요한 시간을 먼저 주고 다시 확인하는 규칙을 하나 정해두는 게 좋아.</p></section>`,
    };
  }

  function calculatePartner(extra) {
    if (!extra || !/^\d{8}$/.test(extra.b || "")) throw new Error("상대 생년월일을 8자리로 입력해줘.");
    let y = Number(extra.b.slice(0, 4));
    let m = Number(extra.b.slice(4, 6));
    let d = Number(extra.b.slice(6, 8));
    if (extra.c === "lunar") {
      if (typeof global.koreanLunarToSolar !== "function") throw new Error("음력 변환 모듈을 불러오지 못했어.");
      const solar = global.koreanLunarToSolar(y, m, d, !!extra.l);
      y = solar.year; m = solar.month; d = solar.day;
    }
    const t = extra.t === "unknown" ? null : extra.t;
    const result = global.calculateAccurateManse(y, m, d, t, extra.g || "female");
    return {
      ...result,
      name: extra.n || "상대",
      userName: extra.n || "상대",
      userBirthStr: extra.b,
      userTimeKey: extra.t || "unknown",
      userGender: extra.g || "female",
      userCalendar: extra.c || "solar",
      isLeapMonth: !!extra.l,
      concernKey: "love",
    };
  }

  function buildCompatibilityProduct(data, mode, extra) {
    return compareProfiles(data, calculatePartner(extra), mode);
  }

  function css() {
    if (document.getElementById("unniPremiumExperienceStyle")) return;
    const style = document.createElement("style");
    style.id = "unniPremiumExperienceStyle";
    style.textContent = `
      #unniProductStoreV2{margin:26px 0 10px;padding:20px 16px;border:1px solid #fde68a;border-radius:24px;background:#fffdf7;box-shadow:0 12px 28px rgba(180,130,60,.08)}
      #unniProductStoreV2 h2{font-size:20px;font-weight:900;color:#111827;margin:0 0 5px}#unniProductStoreV2 .sub{font-size:12px;line-height:1.55;color:#64748b;margin-bottom:14px}
      .unni-product-grid{display:grid;grid-template-columns:1fr;gap:10px}.unni-product-card{border:1px solid #e5e7eb;border-radius:18px;background:#fff;padding:15px;text-align:left;position:relative}.unni-product-card.recommend{border-color:#f9a8d4;background:#fffafb}.unni-product-eyebrow{font-size:10px;font-weight:900;color:#e11d48;letter-spacing:.03em}.unni-product-name{font-size:15px;font-weight:900;color:#111827;margin-top:4px}.unni-product-price{font-size:18px;font-weight:950;color:#111827;margin-top:4px}.unni-product-desc{font-size:11px;line-height:1.55;color:#64748b;margin-top:6px}.unni-product-btn{width:100%;margin-top:11px;border:0;border-radius:12px;padding:10px 12px;font-weight:900;font-size:12px;background:#111827;color:#fff;cursor:pointer}.unni-product-btn.current{background:#f1f5f9;color:#64748b}
      #unniProductModalV2{position:fixed;inset:0;z-index:100000;display:none;background:rgba(15,23,42,.55);padding:18px;overflow:auto}.unni-product-modal-card{max-width:620px;margin:18px auto;background:#fff;border-radius:24px;padding:20px;box-shadow:0 25px 60px rgba(15,23,42,.28)}.unni-product-modal-top{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}.unni-product-modal-top h2{font-size:20px;font-weight:950;color:#111827;margin:0}.unni-product-close{border:0;background:#f1f5f9;width:34px;height:34px;border-radius:999px;font-weight:900;cursor:pointer}.unni-product-modal-sub{font-size:12px;color:#64748b;line-height:1.6;margin:6px 0 16px}.unni-product-report-section{padding:16px 0;border-top:1px solid #eef2f7}.unni-product-report-section h3{font-size:15px;font-weight:950;color:#111827;margin:0 0 9px}.unni-product-report-section p{font-size:13px;line-height:1.72;color:#334155;margin:0}.unni-product-report-section article{padding:12px 0;border-top:1px dashed #e2e8f0}.unni-product-report-section article:first-of-type{border-top:0}.unni-product-report-section article strong{font-size:13px;color:#111827}.unni-product-report-section article p{margin-top:6px}.unni-product-setup label{display:block;font-size:11px;font-weight:800;color:#475569;margin:10px 0 5px}.unni-product-setup input,.unni-product-setup select{width:100%;box-sizing:border-box;border:1px solid #cbd5e1;border-radius:12px;padding:11px;font-size:14px;background:#fff}.unni-product-checks{display:grid;grid-template-columns:1fr 1fr;gap:8px}.unni-product-check{display:flex;align-items:center;gap:7px;border:1px solid #e2e8f0;border-radius:12px;padding:10px;font-size:12px}.unni-product-action{width:100%;border:0;border-radius:14px;padding:13px;font-weight:950;background:#111827;color:#fff;margin-top:14px;cursor:pointer}.unni-product-price-note{text-align:center;font-size:11px;color:#64748b;margin-top:7px}.unni-pay-area{margin-top:14px;border-top:1px solid #e2e8f0;padding-top:10px}
      @media(min-width:640px){.unni-product-grid{grid-template-columns:1fr 1fr}.unni-product-card:last-child{grid-column:1/-1}}
    `;
    document.head.appendChild(style);
  }

  function ensureModal() {
    css();
    let modal = document.getElementById("unniProductModalV2");
    if (modal) return modal;
    modal = document.createElement("div");
    modal.id = "unniProductModalV2";
    modal.innerHTML = `<div class="unni-product-modal-card"><div class="unni-product-modal-top"><div><h2 id="unniProductModalTitle"></h2><div id="unniProductModalPrice" class="unni-product-price"></div></div><button class="unni-product-close" type="button" aria-label="닫기">×</button></div><div id="unniProductModalSub" class="unni-product-modal-sub"></div><div id="unniProductModalBody"></div></div>`;
    document.body.appendChild(modal);
    modal.querySelector(".unni-product-close").addEventListener("click", () => { modal.style.display = "none"; });
    modal.addEventListener("click", (e) => { if (e.target === modal) modal.style.display = "none"; });
    return modal;
  }

  function showReport(report) {
    const modal = ensureModal();
    document.getElementById("unniProductModalTitle").textContent = report.title;
    document.getElementById("unniProductModalPrice").textContent = "";
    document.getElementById("unniProductModalSub").textContent = report.subtitle || "";
    document.getElementById("unniProductModalBody").innerHTML = report.html || "";
    modal.style.display = "block";
    modal.scrollTop = 0;
  }

  function currentMode(data) {
    return data?.currentMode === "T" ? "T" : "F";
  }

  function freeMode() {
    try { return typeof FREE_LAUNCH_MODE !== "undefined" && FREE_LAUNCH_MODE === true; }
    catch (e) { return false; }
  }

  async function api(body) {
    const res = await fetch("/api/confirm-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.ok) throw new Error(json.message || "결제 준비 중 문제가 생겼어.");
    return json;
  }

  function productSnapshot(data, productId, extra) {
    const base = typeof resultSnapshot === "function"
      ? resultSnapshot(data)
      : {
          n: data?.name || data?.userName || "",
          b: data?.userBirthStr || "",
          t: data?.userTimeKey || "unknown",
          g: data?.userGender || "female",
          c: data?.userCalendar || "solar",
          k: data?.concernKey || "money",
          m: data?.currentMode === "T" ? "T" : "F",
          l: data?.userCalendar === "lunar" && data?.isLeapMonth === true,
        };
    base.p = productId;
    if (extra?.selected) base.s = extra.selected;
    if (extra?.partner) base.x = extra.partner;
    return base;
  }

  function accessStorageKey(userKey) { return "unni_product_access_" + userKey; }

  function saveProductAccess(userKey, token) {
    try { localStorage.setItem(accessStorageKey(userKey), token); } catch (e) {}
  }

  function readProductAccess(userKey) {
    try { return localStorage.getItem(accessStorageKey(userKey)); } catch (e) { return null; }
  }

  async function verifyPreparedAccess(prepared) {
    const token = readProductAccess(prepared.userKey);
    if (!token) return false;
    try {
      const r = await api({ action: "verify", userKey: prepared.userKey, token });
      return !!r.ok;
    } catch (e) { return false; }
  }

  function productFromSnapshot(data, snap) {
    const mode = snap?.m === "T" ? "T" : currentMode(data);
    if (snap?.p === "concern_pack3") return buildConcernPackProduct(data, mode, snap.s);
    if (snap?.p === "full_saju") return buildFullSajuProduct(data, mode);
    if (snap?.p === "compatibility") return buildCompatibilityProduct(data, mode, snap.x);
    if (snap?.p === "premium_all") return buildPremiumAllProduct(data, mode);
    return null;
  }

  async function showCheckout(data, productId, extra) {
    const catalog = PRODUCT_CATALOG[productId];
    const modal = ensureModal();
    document.getElementById("unniProductModalTitle").textContent = catalog.name;
    document.getElementById("unniProductModalPrice").textContent = won(catalog.price);
    document.getElementById("unniProductModalSub").textContent = "결제 후 바로 이 화면에서 이어서 볼 수 있어.";
    const body = document.getElementById("unniProductModalBody");
    body.innerHTML = `<div class="unni-pay-area"><div id="unniProductPaymentMethod"></div><div id="unniProductPaymentAgreement"></div><button id="unniProductPayButton" class="unni-product-action" type="button">${won(catalog.price)} 결제하고 보기</button><div class="unni-product-price-note">한 번 결제한 상품은 같은 브라우저에서 다시 확인할 수 있어.</div></div>`;
    modal.style.display = "block";

    const prepared = await api({ action: "prepare", data: productSnapshot(data, productId, extra) });
    if (await verifyPreparedAccess(prepared)) {
      const report = productFromSnapshot(data, { ...productSnapshot(data, productId, extra), p: productId });
      if (report) showReport(report);
      return;
    }
    if (typeof PaymentWidget !== "function") throw new Error("결제창을 불러오지 못했어. 새로고침 후 다시 시도해줘.");
    const widget = PaymentWidget(typeof TOSS_CLIENT_KEY !== "undefined" ? TOSS_CLIENT_KEY : "", PaymentWidget.ANONYMOUS);
    widget.renderPaymentMethods("#unniProductPaymentMethod", { value: prepared.amount, currency: "KRW" }, { variantKey: "saju" });
    widget.renderAgreement("#unniProductPaymentAgreement");
    document.getElementById("unniProductPayButton").onclick = async () => {
      const baseUrl = location.origin + location.pathname;
      const state = encodeURIComponent(prepared.ticket);
      await widget.requestPayment({
        orderId: prepared.orderId,
        orderName: catalog.name,
        customerName: data?.name || data?.userName || "구매자",
        successUrl: `${baseUrl}?ppayment=success&state=${state}`,
        failUrl: `${baseUrl}?ppayment=fail&state=${state}`,
      });
    };
  }

  function setupPack(data) {
    const catalog = PRODUCT_CATALOG.concern_pack3;
    const modal = ensureModal();
    document.getElementById("unniProductModalTitle").textContent = catalog.name;
    document.getElementById("unniProductModalPrice").textContent = won(catalog.price);
    document.getElementById("unniProductModalSub").textContent = "보고 싶은 고민 3개를 골라줘. 같은 사주라도 세 고민을 똑같이 말하지 않게 따로 읽어.";
    const body = document.getElementById("unniProductModalBody");
    body.innerHTML = `<div class="unni-product-setup"><div class="unni-product-checks">${Object.keys(CONCERNS).map((k) => `<label class="unni-product-check"><input type="checkbox" value="${k}"> ${CONCERNS[k].emoji} ${CONCERNS[k].label}</label>`).join("")}</div><button id="unniPackGo" class="unni-product-action" type="button">3개 골라서 보기</button></div>`;
    modal.style.display = "block";
    body.querySelectorAll('input[type="checkbox"]').forEach((el) => el.addEventListener("change", () => {
      const checked = body.querySelectorAll('input[type="checkbox"]:checked');
      if (checked.length > 3) el.checked = false;
    }));
    document.getElementById("unniPackGo").onclick = async () => {
      const selected = Array.from(body.querySelectorAll('input[type="checkbox"]:checked')).map((x) => x.value);
      if (selected.length !== 3) { alert("딱 3개를 골라줘."); return; }
      if (freeMode()) showReport(buildConcernPackProduct(data, currentMode(data), selected));
      else await showCheckout(data, "concern_pack3", { selected });
    };
  }

  function setupCompatibility(data) {
    const catalog = PRODUCT_CATALOG.compatibility;
    const modal = ensureModal();
    document.getElementById("unniProductModalTitle").textContent = catalog.name;
    document.getElementById("unniProductModalPrice").textContent = won(catalog.price);
    document.getElementById("unniProductModalSub").textContent = "상대의 생년월일과 시간을 넣으면 둘을 따로 계산한 뒤 관계에서 만나는 지점만 비교해.";
    const body = document.getElementById("unniProductModalBody");
    body.innerHTML = `<div class="unni-product-setup"><label>상대 이름 또는 별명</label><input id="unniPartnerName" maxlength="20" placeholder="예: 민수"><label>상대 생년월일 8자리</label><input id="unniPartnerBirth" inputmode="numeric" maxlength="8" placeholder="19990101"><label>태어난 시간</label><input id="unniPartnerTime" maxlength="5" placeholder="14:30 또는 모르면 unknown"><label>성별</label><select id="unniPartnerGender"><option value="female">여성</option><option value="male">남성</option></select><label>달력</label><select id="unniPartnerCalendar"><option value="solar">양력</option><option value="lunar">음력</option></select><label class="unni-product-check" style="margin-top:8px"><input id="unniPartnerLeap" type="checkbox"> 음력 윤달</label><button id="unniCompatGo" class="unni-product-action" type="button">둘 궁합 보기</button></div>`;
    modal.style.display = "block";
    document.getElementById("unniCompatGo").onclick = async () => {
      const rawTime = document.getElementById("unniPartnerTime").value.trim();
      const extra = {
        n: document.getElementById("unniPartnerName").value.trim() || "상대",
        b: document.getElementById("unniPartnerBirth").value.replace(/\D/g, ""),
        t: rawTime === "" || rawTime.toLowerCase() === "unknown" ? "unknown" : rawTime,
        g: document.getElementById("unniPartnerGender").value,
        c: document.getElementById("unniPartnerCalendar").value,
        l: document.getElementById("unniPartnerCalendar").value === "lunar" && document.getElementById("unniPartnerLeap").checked,
      };
      try {
        const preview = buildCompatibilityProduct(data, currentMode(data), extra);
        if (freeMode()) showReport(preview);
        else await showCheckout(data, "compatibility", { partner: extra });
      } catch (e) { alert(e.message || "상대 정보를 다시 확인해줘."); }
    };
  }

  async function openProduct(productId, data) {
    if (!data) return;
    if (productId === "concern_single") {
      document.getElementById("notesListContainer")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    if (productId === "concern_pack3") { setupPack(data); return; }
    if (productId === "compatibility") { setupCompatibility(data); return; }
    const report = productId === "full_saju" ? buildFullSajuProduct(data, currentMode(data)) : buildPremiumAllProduct(data, currentMode(data));
    if (freeMode()) { showReport(report); return; }
    try { await showCheckout(data, productId, {}); } catch (e) { alert(e.message || "결제 준비 중 문제가 생겼어."); }
  }

  function renderProductStore(data) {
    css();
    let store = document.getElementById("unniProductStoreV2");
    if (!store) {
      store = document.createElement("section");
      store.id = "unniProductStoreV2";
      const anchor = document.getElementById("reAnalyzeBox") || document.getElementById("solutionWrapper") || document.getElementById("notesListContainer");
      if (!anchor || !anchor.parentNode) return;
      anchor.parentNode.insertBefore(store, anchor.nextSibling);
    }
    store.innerHTML = `<h2>언니가 더 봐줄 수 있는 것</h2><div class="sub">처음부터 큰돈 쓰게 하기보다, 지금 고민이 잘 맞았을 때만 더 깊게 볼 수 있게 나눴어.</div><div class="unni-product-grid">${Object.values(PRODUCT_CATALOG).map((p) => `<article class="unni-product-card ${p.id === "full_saju" ? "recommend" : ""}"><div class="unni-product-eyebrow">${esc(p.eyebrow)}</div><div class="unni-product-name">${esc(p.name)}</div><div class="unni-product-price">${won(p.price)}</div><div class="unni-product-desc">${esc(p.desc)}</div><button class="unni-product-btn ${p.id === "concern_single" ? "current" : ""}" data-product-id="${p.id}" type="button">${p.id === "concern_single" ? "지금 보고 있어" : (freeMode() ? "테스트로 열어보기" : "이 상품 보기")}</button></article>`).join("")}</div>`;
    store.querySelectorAll("[data-product-id]").forEach((btn) => btn.addEventListener("click", () => openProduct(btn.dataset.productId, data)));
  }

  async function handleProductPaymentReturn() {
    const raw = safeText(global.unniReturnParams || "");
    if (!raw) return;
    const params = new URLSearchParams(raw);
    if (!params.get("ppayment")) return;
    const ticket = params.get("state");
    if (!ticket) return;
    try {
      const resume = await api({ action: "resume", ticket });
      let restored = null;
      if (typeof resultFromSnapshot === "function") restored = resultFromSnapshot(resume.data);
      if (restored && typeof renderResultView === "function") renderResultView(restored, { resumeApproval: false });
      if (params.get("ppayment") === "fail") {
        if (typeof showToast === "function") showToast("결제가 완료되지 않았어. 다시 결제되지는 않았어.");
        return;
      }
      const confirmed = await api({
        action: "confirm",
        paymentKey: params.get("paymentKey"),
        orderId: params.get("orderId"),
        amount: Number(params.get("amount")),
        userKey: resume.userKey,
        ticket,
      });
      saveProductAccess(resume.userKey, confirmed.token);
      if (restored) {
        const report = productFromSnapshot(restored, resume.data);
        if (report) setTimeout(() => showReport(report), 120);
      }
    } catch (e) {
      if (typeof showToast === "function") showToast(e.message || "구매 확인이 지연되고 있어.");
    }
  }

  global.premiumPolishNotesV2 = premiumPolishNotes;
  global.buildFullSajuProductV2 = buildFullSajuProduct;
  global.buildConcernPackProductV2 = buildConcernPackProduct;
  global.buildCompatibilityProductV2 = buildCompatibilityProduct;
  global.buildPremiumAllProductV2 = buildPremiumAllProduct;
  global.renderProductStoreV2 = renderProductStore;
  global.__UNNI_PRODUCT_CATALOG_V2__ = { version: VERSION, products: PRODUCT_CATALOG };

  const baseNotes = global.generateConcernNotes;
  if (typeof baseNotes === "function" && !baseNotes.__premiumExperienceV2Wrapped) {
    const wrappedNotes = function (data, mode) {
      const notes = baseNotes(data, mode);
      return premiumPolishNotes(notes, data || {}, mode);
    };
    wrappedNotes.__premiumExperienceV2Wrapped = true;
    wrappedNotes.__base = baseNotes;
    global.generateConcernNotes = wrappedNotes;
  }

  const baseRender = global.renderResultView;
  if (typeof baseRender === "function" && !baseRender.__premiumExperienceV2Wrapped) {
    const wrappedRender = function (data, options) {
      const out = baseRender(data, options);
      setTimeout(() => renderProductStore(data), 0);
      return out;
    };
    wrappedRender.__premiumExperienceV2Wrapped = true;
    wrappedRender.__base = baseRender;
    global.renderResultView = wrappedRender;
  }

  setTimeout(handleProductPaymentReturn, 0);
})(globalThis);
