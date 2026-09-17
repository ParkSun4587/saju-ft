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
    attack: { F: "움직임을 조금 크게 가져가도 되는 흐름", T: "실행 비중을 높일 구간" },
    push: { F: "한 걸음 더 밀어도 되는 흐름", T: "실행 우선 구간" },
    selective: { F: "좋은 것만 골라 움직이는 흐름", T: "선별 실행 구간" },
    prepare: { F: "크게 벌이기보다 준비를 다듬는 흐름", T: "준비·검증 구간" },
    defend: { F: "무리하지 않고 내 걸 지키는 흐름", T: "방어 우선 구간" },
    rest: { F: "속도를 늦추고 회복을 챙기는 흐름", T: "회복 우선 구간" },
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
    money: "재물·돈복",
    career: "직장·커리어",
    love: "연애·썸",
    path: "진로·내 길",
    people: "인간관계",
    mental: "마음·회복",
  };

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
      ? `참고: ${pairedLabel}과 같은 시기가 잡힌 건 오류가 아니다. 네 사주에서는 두 고민이 같은 흐름에 반응하는 구간이 있어서 날짜가 겹칠 수 있어. 날짜는 같아도 실행 행동은 고민별로 다르게 써.`
      : `참고로 ${pairedLabel}을 봤을 때도 같은 시기가 나올 수 있어. 복붙한 게 아니라 네 사주에서는 두 고민이 같이 반응하는 구간이 겹치는 거야. 날짜가 같아도 여기서는 ${CONCERN_LABELS[concernKey] || "지금 고민"}에 맞는 행동으로 따로 써주면 돼 💕`;
    return { pairedConcern, same, text };
  }

  function momentumText(momentum, isT) {
    const row = MOMENTUM_LABEL[momentum] || MOMENTUM_LABEL.selective;
    return isT ? row.T : row.F;
  }

  function fallbackFlow(concernKey, which, isT, momentum) {
    const map = CONCERN_ACTIONS[concernKey] || CONCERN_ACTIONS.money;
    const action = map[which][isT ? "T" : "F"];
    const head = momentumText(momentum, isT);
    return isT ? `${head}이야. ${action}` : `${head}이야. ${action}`;
  }

  function periodCopy(timing, concernKey, which, isT) {
    const first = which === "first";
    const sentence = first
      ? (isT ? timing?.fullSentenceT : timing?.fullSentenceF)
      : (isT ? timing?.fullSentenceR2T : timing?.fullSentenceR2F);
    const momentum = first ? timing?.momentum1 : timing?.momentum2;
    const action = (CONCERN_ACTIONS[concernKey] || CONCERN_ACTIONS.money)[which][isT ? "T" : "F"];
    const clean = stripHtml(sentence);
    if (!clean || clean.length < 12) return fallbackFlow(concernKey, which, isT, momentum);
    return `${clean} ${action}`;
  }

  function comparisonLine(timing, concernKey, isT) {
    const m1 = momentumText(timing?.momentum1, isT);
    const m2 = momentumText(timing?.momentum2, isT);
    if (isT) {
      if (m1 === m2) return `둘 다 같은 속도로 쓰면 안 돼. 첫 구간은 반응 확인, 두 번째 구간은 확인된 것만 확정하는 순서로 써.`;
      return `첫 구간은 <b>${m1}</b>, 두 번째 구간은 <b>${m2}</b>이야. 같은 행동을 복붙하지 말고 단계가 바뀌면 행동도 바꿔.`;
    }
    if (m1 === m2) return `두 시기 모두 흐름은 비슷해 보여도 역할은 달라. 첫 번째는 마음과 현실의 반응을 확인하고, 두 번째는 그중 진짜 남길 걸 고르는 시간이야.`;
    return `첫 번째는 <b>${m1}</b>, 두 번째는 <b>${m2}</b>이야. 그래서 첫 시기에 해본 걸 두 번째 시기엔 그대로 반복하기보다, 결과를 보고 다음 단계로 넘어가면 돼.`;
  }

  function rebuildNoteSix(note, data, mode) {
    const isT = mode === "T";
    const concernKey = data?.concernKey || "money";
    const timing = safeTiming(data, concernKey);
    if (!timing) return note;

    let firstBody = periodCopy(timing, concernKey, "first", isT);
    let secondBody = periodCopy(timing, concernKey, "second", isT);
    if (normalizeSentence(firstBody) === normalizeSentence(secondBody)) {
      secondBody = fallbackFlow(concernKey, "second", isT, timing?.momentum2);
    }

    const firstDate = timing.r1 || "첫 번째 흐름";
    const secondDate = timing.r2 || "두 번째 흐름";
    const intro = isT
      ? "날짜만 두 개 던지는 건 의미 없어. 두 구간의 역할을 나눠서 쓸게."
      : "우리 날짜만 보고 ‘이때 뭐가 생기나?’ 기다리진 말자. 같은 좋은 흐름도 어떻게 쓰느냐가 더 중요하니까, 언니가 첫 번째랑 두 번째 역할을 따로 나눠줄게 💕";

    const overlap = sharedTimingOverlap(data, concernKey, timing, isT);
    const profile = data?.integratedSajuProfile || null;
    const personalMove = profile
      ? (isT
        ? `${profile.balance?.climateHuman || "현실 반응을 보면서 속도를 조절하는 쪽"}. 특히 ${profile.elements?.primaryBehavior?.verb || "한 번에 하나씩 움직이는 것"}부터 써.`
        : `그리고 너는 <b>${profile.balance?.climateHuman || "현실 반응을 보면서 속도를 조절하는 쪽"}</b>으로 움직일 때 덜 지쳐. 언니는 특히 <b>${profile.elements?.primaryBehavior?.verb || "한 번에 하나씩 움직이는 것"}</b>부터 챙겨주고 싶어.`)
      : (isT
        ? "좋은 시기에도 한 번에 크게 뒤집지 말고 현실 반응을 확인하면서 다음 행동을 정해."
        : "좋은 때라고 갑자기 다 바꾸지 않아도 돼. 한 번 움직여보고 마음이랑 현실 반응을 확인한 다음, 그다음 걸 정하면 충분해.");
    const overlapHtml = overlap ? `<br><br><div style="padding:10px 12px;border-radius:12px;background:#fff7ed;color:#9a3412;font-size:12px;line-height:1.7"><b>같은 시기가 또 나왔다면?</b><br>${overlap.text}</div>` : "";
    const desc = `${intro}${overlapHtml}<br><br><b>첫 번째 흐름 · ${firstDate}</b><br>${firstBody}<br><br><b>두 번째 흐름 · ${secondDate}</b><br>${secondBody}<br><br><b>두 시기의 차이</b><br>${comparisonLine(timing, concernKey, isT)}<br><br><b>너한테 맞는 움직임</b><br>${personalMove}`;
    const checklist = isT
      ? `${firstDate}에 할 ‘테스트 행동’ 1개와 ${secondDate}에 할 ‘확정 행동’ 1개를 각각 캘린더에 넣기`
      : `언니랑 약속 하나만 하자. ${firstDate}엔 가볍게 확인할 행동 하나, ${secondDate}엔 이어서 굳힐 행동 하나를 따로 적어두기`;

    return { ...note, desc, checklist, __timingQA: { firstDate, secondDate, firstBody, secondBody, sharedTimingWith: overlap?.pairedConcern || "", sharedDates: overlap?.same || [], profileFingerprint: profile?.fingerprint || "" } };
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
    const fSignals = ["언니", "같이", "괜찮", "마음", "챙겨", "해보자", "돼"].filter((x) => tone.includes(x)).length;
    const tSignals = ["확인", "기준", "실행", "정리", "숫자", "끊", "확정"].filter((x) => tone.includes(x)).length;
    return { duplicates, hardTerms, timingDuplicate, toneScore: mode === "T" ? tSignals : fSignals };
  }

  function polishPaidValueNotes(notes, data, mode) {
    if (!Array.isArray(notes) || notes.length < 6) return notes;
    const out = notes.map((n) => ({ ...n }));
    out[5] = rebuildNoteSix(out[5], data || {}, mode || "F");
    const audit = auditNotes(out, mode || "F");
    if (data && typeof data === "object") data.paidValueAudit = audit;
    return out;
  }

  global.polishPaidValueNotes = polishPaidValueNotes;
  global.auditPaidValueNotes = auditNotes;
  global.__PAID_VALUE_LAYER_V1__ = { version: "1.0.0" };

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
