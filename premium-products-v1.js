(function (global) {
  "use strict";

  const CONCERNS = {
    money: "재물·돈복",
    career: "직장·커리어",
    love: "연애·썸",
    path: "진로·내 길",
    people: "인간관계",
    mental: "마음·회복",
  };

  const PRODUCTS = {
    concern_bundle3: {
      id: "concern_bundle3",
      name: "고민 3개 더 깊게",
      price: 2900,
      badge: "다른 고민도 궁금하다면",
      desc: "지금 본 고민 말고 궁금한 고민 3개를 골라 NOTE 1~6 전체로 이어서 봐.",
    },
    full_saju: {
      id: "full_saju",
      name: "내 전체 사주판",
      price: 4900,
      badge: "정석 종합판",
      desc: "지금 고민을 다시 푸는 상품이 아니라, 타고난 기질·강점·과부하·결정법·일·돈·사랑·관계·회복·변화 대응까지 원국 전체를 한 장으로 연결해 봐.",
    },
    compatibility: {
      id: "compatibility",
      name: "우리 둘 궁합",
      price: 5900,
      badge: "상대 생일 하나 더",
      desc: "두 사람의 원국을 각각 계산한 뒤 끌리는 지점, 부딪히는 지점, 오래 가려면 필요한 방식을 봐.",
    },
    all_in_one: {
      id: "all_in_one",
      name: "어떤언니 올인원",
      price: 9900,
      badge: "가장 깊은 전체판",
      desc: "전체 사주판 + 6가지 고민 NOTE 전부를 한 번에 보는 가장 큰 리포트야.",
    },
  };

  const ELEMENT_WORD = {
    mok: "시작하고 넓히는 힘",
    hwa: "표현하고 반응을 만드는 힘",
    to: "쌓고 지키는 힘",
    geum: "기준을 세우고 정리하는 힘",
    su: "정보를 모으고 여백을 만드는 힘",
  };

  function esc(v) {
    return String(v == null ? "" : v)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function won(v) { return Number(v || 0).toLocaleString("ko-KR") + "원"; }

  function getData() {
    try { return typeof currentResultData !== "undefined" ? currentResultData : null; }
    catch (_) { return null; }
  }

  function getMode(data) {
    return data?.currentMode || (typeof selectedSplitMode !== "undefined" && selectedSplitMode) || "F";
  }

  function getProfile(data) {
    if (!data) return null;
    if (data.integratedSajuProfile) return data.integratedSajuProfile;
    if (typeof global.buildIntegratedSajuProfile === "function") {
      try { return global.buildIntegratedSajuProfile(data); } catch (_) {}
    }
    return null;
  }

  function strengthCopy(profile, isT) {
    if (!profile) return isT ? "한 가지 장면만 보고 판단하지 말고 반복되는 반응을 봐." : "한 장면만으로 너를 단정하지 않아도 돼.";
    return isT ? profile.strength?.T : profile.strength?.F;
  }

  function fullSajuSections(data, mode) {
    const p = getProfile(data);
    const isT = mode === "T";
    if (!p) return [];

    const dom = p.sipsin?.dominantHuman || "자기 기준을 찾고 움직이는 성향";
    const second = p.sipsin?.secondaryHuman || "";
    const strong = ELEMENT_WORD[p.elements?.influenceRank?.strongest] || "익숙한 방식으로 밀어가는 힘";
    const weak = ELEMENT_WORD[p.elements?.influenceRank?.weakest] || "일부러 챙겨야 하는 힘";
    const primary = p.elements?.primaryBehavior?.verb || "한 번에 하나씩 방향을 잡는 것";
    const secondary = p.elements?.secondaryBehavior?.verb || "작게 확인하고 다음 행동을 고르는 것";
    const avoid = p.elements?.avoidBehavior?.verb || "한쪽 방식만 과하게 쓰는 것";
    const climate = p.balance?.climateHuman || "속도를 조절하면서 현실 반응을 확인하는 쪽";
    const weakStat = p.behavior?.weakStatHuman || "내가 실제로 소모되는 지점을 확인하는 것";
    const structure = p.structure?.statusHuman || "한 가지 방식으로만 밀기보다 상황에 맞춰 조절할수록 힘이 잘 살아";
    const depth = p.structure?.depthHuman || "겉으로 보이는 성향 하나보다 여러 힘이 같이 작동하는 편이야";
    const mismatch = !!p.elements?.rawVsInfluenceMismatch;
    const bridge = !!p.balance?.bridge;
    const relation = p.relations?.hasClash
      ? (isT
        ? "관계 변수나 일정이 겹치면 한 번에 방향을 뒤집기 쉽다. 중간 확인을 넣어."
        : "사람 일이나 일정이 한꺼번에 겹치면 오래 참다가 마음이 확 돌아설 수 있어. 작은 불편함부터 말해주는 게 좋아.")
      : (isT
        ? "큰 충돌보다 작은 불편함을 오래 미루는 게 손실이 된다."
        : "큰 싸움보다 작은 불편함을 오래 참는 쪽이 오히려 너를 더 지치게 할 수 있어.");
    const mismatchCopy = mismatch
      ? (isT
        ? "겉으로 보이는 모습과 실제로 힘이 몰리는 방향이 다르다. 남들이 보는 너만 기준으로 선택하면 오판하기 쉽다."
        : "남들이 보는 너랑 네가 실제로 힘을 쓰는 방식이 조금 달라. 그래서 ‘난 원래 이런 사람인가?’ 하고 스스로를 잘못 읽을 때가 있을 수 있어.")
      : (isT
        ? "겉으로 보이는 모습과 실제 힘의 방향이 크게 어긋나지 않는다. 문제는 인식보다 실행 순서에서 생긴다."
        : "겉으로 보이는 너와 실제 힘 쓰는 방향이 비교적 비슷한 편이야. 그래서 너 자신을 모른다기보다, 알면서도 너무 늦게 챙기는 순간이 더 중요해.");

    return [
      {
        title: "01 · 내 사주 전체 한 줄 요약",
        body: isT
          ? `핵심 반응은 <b>${dom}</b>${second ? `, 보조로는 ${second}` : ""} 쪽이야. ${strengthCopy(p, true)} ${structure}. 이 전체판은 지금 고민 하나가 아니라 네 선택 대부분에 반복되는 기본 구조를 보는 리포트야.`
          : `언니가 네 사주 전체를 한 문장으로 잡으면 <b>${dom}</b>${second ? `, 그리고 그 안의 ${second}` : ""}이 제일 먼저 보여. ${strengthCopy(p, false)} ${structure}. 지금 고민 하나만 설명하는 게 아니라, 네가 앞으로 어떤 고민을 만나도 반복해서 나타나는 ‘기본 사용법’을 보는 거야.`
      },
      {
        title: "02 · 겉으로 보이는 나 vs 실제로 힘 쓰는 나",
        body: isT
          ? `${mismatchCopy} 네가 가장 자연스럽게 쓰는 힘은 <b>${strong}</b>, 의식적으로 보완해야 하는 쪽은 <b>${weak}</b>이야.`
          : `${mismatchCopy} 특히 <b>${strong}</b>은 네가 애써 만들지 않아도 잘 나오는데, <b>${weak}</b>은 바쁠수록 자꾸 뒤로 밀릴 수 있어. 부족하다는 뜻보다 ‘어디서 힘을 덜 쓰고도 잘하고, 어디는 일부러 챙겨야 편한지’ 보는 포인트야.`
      },
      {
        title: "03 · 타고난 강점과 재능",
        body: isT
          ? `강점은 <b>${dom}</b>을 실제 행동으로 바꿀 때 가장 잘 나온다. ${strong}을 쓰는 환경에서 결과가 빨리 붙고, ${second ? `${second}까지 연결되면 활용 범위가 넓어진다.` : "한 가지 강점을 반복해서 증명할수록 유리하다."}`
          : `네 장점은 억지로 다른 사람이 되려고 할 때보다 <b>${dom}</b>을 네 방식대로 잘 쓸 때 살아나. 특히 ${strong}이 필요한 자리에서는 남들보다 자연스럽게 힘을 내는 편이야. ${second ? `거기에 ${second}까지 잘 붙으면 네 장점이 훨씬 입체적으로 보여.` : "네가 잘하는 걸 너무 당연하게 넘기지 않았으면 좋겠어."}`
      },
      {
        title: "04 · 나를 가장 빨리 지치게 하는 패턴",
        body: isT
          ? `약점보다 과부하 패턴을 봐. <b>${weakStat}</b>이 무너지고, ${avoid}을 반복할 때 손실이 커진다. ${relation}`
          : `언니가 더 걱정하는 건 네가 못하는 게 아니라, 잘 버티다가 한 번에 지치는 순간이야. <b>${weakStat}</b>이 뒤로 밀리고 ${avoid}만 계속하면 마음이 먼저 닳을 수 있어. ${relation}`
      },
      {
        title: "05 · 결정할 때의 버릇",
        body: isT
          ? `결정은 <b>${primary}</b> → <b>${secondary}</b> 순서가 맞아. ${bridge ? "서로 다른 힘이 부딪히는 구조라 중간 확인 단계를 생략하면 오판이 늘어난다." : "여러 변수를 동시에 바꾸지 말고 하나를 고정한 뒤 결과를 봐."}`
          : `네가 마음 편하게 결정하려면 먼저 <b>${primary}</b>부터 해보는 게 좋아. 그다음 <b>${secondary}</b>을 붙이면 훨씬 덜 흔들려. ${bridge ? "너는 마음속 서로 다른 힘이 부딪칠 때가 있어서, 바로 결론내리기보다 중간 확인 하나를 넣어주면 정말 편해져." : "한꺼번에 다 바꾸기보다 하나씩 확인하면서 가는 게 네 리듬에 더 잘 맞아."}`
      },
      {
        title: "06 · 일과 역할에서 빛나는 자리",
        body: isT
          ? `직업명보다 판의 구조를 봐. 네가 맡은 책임과 결과 기준이 분명하고 <b>${strong}</b>을 실제 성과로 바꿀 수 있는 환경이 맞다. 역할은 많은데 권한·평가 기준이 흐린 곳은 피로 대비 수익이 낮다.`
          : `직업 이름 하나보다 ‘어떤 판에서 일하느냐’가 더 중요해. 네 역할과 기준이 분명하고 <b>${strong}</b>을 제대로 써볼 수 있는 곳에서는 네 장점이 훨씬 잘 보여. 반대로 일은 계속 얹는데 네 몫과 기준은 흐린 곳에서는 잘하고도 마음이 쉽게 지칠 수 있어.`
      },
      {
        title: "07 · 돈을 다루는 기본 리듬",
        body: isT
          ? `돈에서는 감정보다 기준 유지가 핵심이다. <b>${weakStat}</b>을 확인하고, 수입·가격·지출을 각각 분리해 봐. 네 사주에 맞는 운영 순서는 ${primary}부터 시작하는 쪽이야.`
          : `돈은 ‘많이 벌면 다 해결된다’보다 네 기준이 흔들리는 순간을 아는 게 먼저야. <b>${weakStat}</b>을 챙기고, 들어오는 돈·나가는 돈·내가 받을 몫을 따로 봐줘. 특히 ${primary}을 해주면 돈 때문에 마음이 출렁이는 폭이 줄어들어.`
      },
      {
        title: "08 · 사랑할 때의 기본 리듬",
        body: isT
          ? `연애에서는 상대 마음 추측보다 반응 확인이 우선이다. ${relation} 말과 행동의 일치, 경계를 말했을 때 조정하는지, 관계가 반복해서 안정되는지를 봐.`
          : `사랑할 때는 상대가 얼마나 강하게 표현하느냐보다, 그 사람 곁에서 네가 얼마나 편안한지가 중요해. ${relation} 네가 서운함을 말했을 때도 관계가 안전한지, 말과 행동이 계속 맞는지를 천천히 봐줘.`
      },
      {
        title: "09 · 사람을 남기는 기준",
        body: isT
          ? `사람 수보다 네 기준을 지켜주는 관계를 남겨. 관계의 질은 말보다 반복 행동으로 판단해. 불편함을 말했을 때 수정하는 사람은 남기고, 계속 네 기준을 흐리는 관계는 거리를 둬.`
          : `네 편은 네가 계속 잘해야만 남는 사람이 아니야. 네 속도와 선을 말했을 때도 편안하고, 네 수고를 당연하게 먹지 않는 사람이 오래 둘 사람이야. 사람을 잃을까 봐 네 마음부터 잃지는 않았으면 좋겠어.`
      },
      {
        title: "10 · 회복하는 방식",
        body: isT
          ? `회복도 시스템으로 봐. 네 흐름에는 <b>${climate}</b>이 맞다. 지쳤을 때 의지를 더 넣기보다 ${primary}을 먼저 실행하고, 회복 시간을 일정으로 고정해.`
          : `너한테 쉬는 건 멈추는 게 아니라 다시 네 리듬으로 돌아오는 시간이야. <b>${climate}</b>으로 움직일 때 훨씬 덜 소모돼. 지친 날에는 더 잘하려고 하지 말고 ${primary}부터 해줘. 쉬어도 되는 사람이 아니라, 쉬어야 오래 가는 사람이야.`
      },
      {
        title: "11 · 변화가 올 때 쓰는 법",
        body: isT
          ? `변화기에는 한 번에 올인하지 마. 첫 행동은 테스트, 다음 행동은 확정으로 나눠. ${depth}. 좋은 흐름도 용도를 나눠야 결과가 남는다.`
          : `변화가 보인다고 한 번에 인생을 뒤집을 필요는 없어. 처음엔 작게 해보고 반응을 확인하고, 그다음에 진짜 남길 걸 골라도 늦지 않아. ${depth}. 너는 속도를 잘 나누기만 해도 같은 기회에서 훨씬 덜 지치고 오래 갈 수 있어.`
      },
      {
        title: "12 · 평생 가져갈 내 사용법 3가지",
        body: isT
          ? `<b>1.</b> ${primary}.<br><b>2.</b> ${weakStat}을 주기적으로 확인하기.<br><b>3.</b> ${avoid}이 반복되면 즉시 속도를 낮추기.<br><br>이 세 가지가 네 전체 사주판에서 반복해서 나오는 운영 원칙이야.`
          : `언니가 마지막으로 딱 세 가지만 남겨줄게.<br><br><b>1.</b> 먼저 ${primary}.<br><b>2.</b> 바쁠수록 ${weakStat}을 잊지 않기.<br><b>3.</b> ${avoid}만 반복하고 있으면 ‘나 지금 너무 애쓰고 있나?’ 한 번 멈춰보기.<br><br>이 세 가지만 기억해도 네가 어떤 고민을 만나든 다시 중심으로 돌아오는 데 도움이 될 거야.`
      },
    ];
  }


  function noteCards(notes) {
    return (notes || []).map((n) => `<article style="padding:16px 0;border-bottom:1px solid #eef2f7"><div style="font-size:11px;font-weight:900;color:#f43f5e;margin-bottom:7px">${esc(n.badge || n.themeNum || "NOTE")}</div><h4 style="font-size:16px;font-weight:900;line-height:1.45;margin:0 0 9px">${n.title || ""}</h4><div style="font-size:13px;line-height:1.8;color:#475569">${n.desc || ""}</div>${n.checklist ? `<div style="margin-top:11px;padding:10px 12px;border-radius:12px;background:#f8fafc;font-size:12px;line-height:1.6;color:#334155"><b>이번에 해볼 것</b><br>${esc(n.checklist)}</div>` : ""}</article>`).join("");
  }

  function fullSajuHtml(data, mode) {
    const isT = mode === "T";
    const intro = isT
      ? "이 리포트는 지금 선택한 고민 6개를 다시 요약하는 상품이 아니다. 원국 전체에서 반복되는 기질·강점·과부하·판단법·관계·회복·변화 대응을 한 번에 묶은 기본 지도다."
      : "이건 지금 선택한 고민을 또 풀어쓰는 리포트가 아니야. 언니가 네 사주 원국 전체를 펼쳐놓고, 어떤 고민을 만나도 반복해서 나타나는 기질·강점·지치는 방식·사람 보는 법·회복법을 한 장으로 이어주는 ‘내 사용설명서’에 가까워 💕";
    const sections = fullSajuSections(data, mode);
    return `<div style="padding:14px 15px;border-radius:16px;background:#fff7ed;border:1px solid #fed7aa;font-size:12.5px;line-height:1.8;color:#7c2d12;margin-bottom:8px"><b>이 리포트에서 보는 것</b><br>${intro}</div>${sections.map((s) => `<section style="padding:18px 0;border-bottom:1px solid #eef2f7"><h4 style="font-size:15px;font-weight:900;margin:0 0 8px">${s.title}</h4><div style="font-size:13px;line-height:1.85;color:#475569">${s.body}</div></section>`).join("")}`;
  }


  function bundleHtml(data, mode, extra) {
    const keys = Array.isArray(extra?.concerns) ? extra.concerns : [];
    return keys.map((key) => {
      const d = { ...data, concernKey: key };
      const notes = typeof global.generateConcernNotes === "function" ? global.generateConcernNotes(d, mode) : [];
      return `<section style="margin-bottom:26px"><h3 style="font-size:19px;font-weight:950;margin:0 0 10px">${esc(CONCERNS[key] || key)}</h3>${noteCards(notes)}</section>`;
    }).join("");
  }

  function allInOneHtml(data, mode) {
    const all = Object.keys(CONCERNS).map((key) => {
      const d = { ...data, concernKey: key };
      const notes = typeof global.generateConcernNotes === "function" ? global.generateConcernNotes(d, mode) : [];
      return `<section style="margin:26px 0"><h3 style="font-size:19px;font-weight:950;margin:0 0 10px">${esc(CONCERNS[key])}</h3>${noteCards(notes)}</section>`;
    }).join("");
    return `<h3 style="font-size:19px;font-weight:950;margin:0 0 10px">내 전체 사주판</h3>${fullSajuHtml(data, mode)}<div style="height:24px"></div>${all}`;
  }

  function parseDate8(v) {
    const s = String(v || "").replace(/\D/g, "");
    if (!/^\d{8}$/.test(s)) return null;
    return { y: +s.slice(0,4), m: +s.slice(4,6), d: +s.slice(6,8), raw: s };
  }

  function partnerChart(extra) {
    const p = extra?.partner || {};
    const dt = parseDate8(p.b);
    if (!dt || typeof global.calculateAccurateManse !== "function") return null;
    let y = dt.y, m = dt.m, d = dt.d;
    if (p.c === "lunar" && typeof global.koreanLunarToSolar === "function") {
      const solar = global.koreanLunarToSolar(y, m, d, p.l === true);
      y = solar.year; m = solar.month; d = solar.day;
    }
    return global.calculateAccurateManse(y, m, d, p.t === "unknown" ? null : p.t, p.g || "female");
  }

  function elementOf(data) {
    return data?.dayOheng || data?.analysisProfile?.dayMaster?.element || data?.integratedSajuProfile?.balance?.primary || "to";
  }

  function relationCopy(a, b, isT) {
    const gen = { mok:"hwa", hwa:"to", to:"geum", geum:"su", su:"mok" };
    const ctrl = { mok:"to", to:"su", su:"hwa", hwa:"geum", geum:"mok" };
    if (a === b) return isT ? "기본 속도가 비슷해서 이해는 빠르지만, 둘 다 같은 약점을 동시에 반복할 수 있어. 역할 분담이 필요해." : "둘이 비슷한 속도로 움직여서 말하지 않아도 통하는 순간이 많을 수 있어. 대신 둘 다 같은 데서 지칠 때는 한 명이 먼저 속도를 바꿔줘야 해.";
    if (gen[a] === b || gen[b] === a) return isT ? "한쪽의 강점이 다른 쪽의 다음 행동으로 이어지기 쉬운 조합이야. 도움과 간섭의 경계만 명확히 해." : "한 사람이 가진 힘이 다른 사람을 자연스럽게 밀어주는 장면이 생기기 쉬워. 다만 도와준다는 마음으로 상대 선택까지 대신하지는 말자.";
    if (ctrl[a] === b || ctrl[b] === a) return isT ? "끌림과 마찰이 같이 생기기 쉬워. 싸움의 원인은 애정 부족보다 속도·기준 충돌일 가능성을 먼저 봐." : "서로 다른 점이 매력으로 느껴지다가 같은 차이가 서운함이 될 수 있어. 누가 맞는지보다 서로의 기준을 번역해주는 게 중요해.";
    return isT ? "서로 쓰는 방식이 달라 보완 가능성이 있다. 추측하지 말고 역할과 기대치를 말로 맞춰." : "서로 다른 부분이 있어서 같이 있을 때 새로운 면을 꺼내줄 수 있어. 다름을 사랑의 크기로 해석하지 않는 게 중요해.";
  }

  function compatibilityHtml(data, mode, extra) {
    const isT = mode === "T";
    let partner;
    try { partner = partnerChart(extra); } catch (e) { partner = null; }
    if (!partner) return `<p style="font-size:13px;line-height:1.8;color:#475569">상대 생년월일 정보를 다시 확인해줘. 정확한 원국이 계산돼야 궁합을 열 수 있어.</p>`;
    const a = elementOf(data), b = elementOf(partner);
    const pName = extra?.partner?.n || "상대";
    const relation = relationCopy(a,b,isT);
    const myP = getProfile(data);
    const myNeed = myP?.elements?.primaryBehavior?.verb || "내 기준을 먼저 확인하는 것";
    const conflict = myP?.relations?.hasClash
      ? (isT ? "너는 불편함이 누적되면 한 번에 방향을 바꿀 수 있으니, 터진 뒤 수습보다 초기에 말하는 게 낫다." : "너는 참다가 마음이 확 돌아서는 순간이 생길 수 있어서, 작게 서운할 때 말하는 게 오히려 관계를 지켜줘.")
      : (isT ? "작은 불편함을 오래 미루지 마. 애매한 상태를 길게 두는 게 더 큰 손실이야." : "괜찮은 척 오래 버티기보다 작은 불편함부터 말해도 괜찮아.");
    return `<section style="padding:10px 0"><h4 style="font-size:16px;font-weight:900">둘이 처음 끌리는 지점</h4><p style="font-size:13px;line-height:1.8;color:#475569">${relation}</p></section><section style="padding:14px 0;border-top:1px solid #eef2f7"><h4 style="font-size:16px;font-weight:900">싸울 때 진짜 봐야 할 것</h4><p style="font-size:13px;line-height:1.8;color:#475569">${conflict}</p></section><section style="padding:14px 0;border-top:1px solid #eef2f7"><h4 style="font-size:16px;font-weight:900">오래 가려면</h4><p style="font-size:13px;line-height:1.8;color:#475569">너는 <b>${myNeed}</b>이 필요하고, ${esc(pName)}도 자기 방식대로 숨 돌릴 공간이 필요해. 둘 중 한 사람의 방식만 정답으로 만들지 않는 게 핵심이야.</p></section>`;
  }

  function productBody(productId, data, extra) {
    const mode = getMode(data);
    if (productId === "concern_bundle3") return bundleHtml(data, mode, extra);
    if (productId === "full_saju") return fullSajuHtml(data, mode);
    if (productId === "all_in_one") return allInOneHtml(data, mode);
    if (productId === "compatibility") return compatibilityHtml(data, mode, extra);
    return "";
  }

  function ensureModal() {
    let root = document.getElementById("unniProductModal");
    if (root) return root;
    root = document.createElement("div");
    root.id = "unniProductModal";
    root.style.cssText = "display:none;position:fixed;inset:0;z-index:99999;background:rgba(15,23,42,.48);padding:18px;overflow:auto";
    root.innerHTML = `<div style="max-width:520px;margin:4vh auto;background:#fff;border-radius:24px;padding:20px;box-shadow:0 24px 70px rgba(15,23,42,.25)"><div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start"><div><div id="unniProductBadge" style="font-size:11px;font-weight:900;color:#f43f5e"></div><h2 id="unniProductTitle" style="font-size:21px;font-weight:950;margin:5px 0 4px"></h2><div id="unniProductPrice" style="font-size:13px;font-weight:800;color:#64748b"></div></div><button id="unniProductClose" style="border:0;background:#f1f5f9;border-radius:999px;width:34px;height:34px;font-size:18px;cursor:pointer">×</button></div><div id="unniProductSetup" style="margin-top:16px"></div><div id="unniProductPayment" style="display:none;margin-top:15px"><div id="unniProductPaymentMethod"></div><div id="unniProductPaymentAgreement"></div></div><div id="unniProductBody" style="margin-top:14px"></div><button id="unniProductAction" style="width:100%;margin-top:18px;border:0;border-radius:15px;background:#0f172a;color:white;padding:14px 16px;font-size:14px;font-weight:900;cursor:pointer"></button><div id="unniProductAccessNote" style="display:none;margin-top:9px;text-align:center;font-size:11px;font-weight:800;line-height:1.6;color:#a16207">🔐 한 번 결제하면 이 브라우저에서는 추가 결제 없이 계속 다시 볼 수 있어요.</div></div>`;
    document.body.appendChild(root);
    root.querySelector("#unniProductClose").onclick = () => { root.style.display = "none"; document.body.style.overflow = ""; };
    root.addEventListener("click", (e) => { if (e.target === root) root.querySelector("#unniProductClose").click(); });
    return root;
  }

  function defaultBundle(data) {
    const current = data?.concernKey || "money";
    return Object.keys(CONCERNS).filter((k) => k !== current).slice(0,3);
  }

  function setupHtml(productId, data) {
    if (productId === "concern_bundle3") {
      const defaults = new Set(defaultBundle(data));
      return `<div style="font-size:12px;font-weight:800;margin-bottom:8px">더 보고 싶은 고민 3개를 골라</div><div id="unniBundleChecks" style="display:grid;grid-template-columns:1fr 1fr;gap:8px">${Object.keys(CONCERNS).filter((k) => k !== data?.concernKey).map((k) => `<label style="padding:10px;border:1px solid #e2e8f0;border-radius:12px;font-size:12px;font-weight:700"><input type="checkbox" value="${k}" ${defaults.has(k)?"checked":""}> ${CONCERNS[k]}</label>`).join("")}</div>`;
    }
    if (productId === "compatibility") {
      return `<div style="display:grid;gap:9px"><input id="partnerName" placeholder="상대 이름 또는 별명" style="padding:12px;border:1px solid #e2e8f0;border-radius:12px"><input id="partnerBirth" inputmode="numeric" maxlength="8" placeholder="생년월일 8자리 예: 19990214" style="padding:12px;border:1px solid #e2e8f0;border-radius:12px"><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px"><select id="partnerGender" style="padding:12px;border:1px solid #e2e8f0;border-radius:12px"><option value="female">여성</option><option value="male">남성</option></select><select id="partnerCalendar" style="padding:12px;border:1px solid #e2e8f0;border-radius:12px"><option value="solar">양력</option><option value="lunar">음력</option></select></div><input id="partnerTime" placeholder="태어난 시간 HH:MM · 모르면 비워두기" style="padding:12px;border:1px solid #e2e8f0;border-radius:12px"></div>`;
    }
    return "";
  }

  function collectExtra(productId, data, root) {
    if (productId === "concern_bundle3") {
      const picked = [...root.querySelectorAll('#unniBundleChecks input:checked')].map((x) => x.value);
      if (picked.length !== 3) throw new Error("고민을 정확히 3개 골라줘.");
      return { concerns: picked };
    }
    if (productId === "compatibility") {
      const b = root.querySelector("#partnerBirth")?.value.replace(/\D/g, "") || "";
      if (!/^\d{8}$/.test(b)) throw new Error("상대 생년월일을 8자리로 입력해줘.");
      const tRaw = root.querySelector("#partnerTime")?.value.trim() || "";
      if (tRaw && !/^([01]\d|2[0-3]):[0-5]\d$/.test(tRaw)) throw new Error("상대 태어난 시간은 HH:MM 형식으로 입력해줘.");
      return { partner: { n: root.querySelector("#partnerName")?.value.trim() || "상대", b, t: tRaw || "unknown", g: root.querySelector("#partnerGender")?.value || "female", c: root.querySelector("#partnerCalendar")?.value || "solar", l: false } };
    }
    return {};
  }

  function grantStoreKey(data, productId) {
    let base = "";
    try { base = typeof getUserUniqueKey === "function" ? getUserUniqueKey(data) : JSON.stringify([data?.userBirthStr, data?.userTimeKey, data?.userGender]); }
    catch (_) { base = JSON.stringify([data?.userBirthStr, data?.userTimeKey]); }
    return "unni_product_grant_v1_" + productId + "_" + base;
  }

  function saveGrant(data, productId, grant) {
    try { localStorage.setItem(grantStoreKey(data, productId), JSON.stringify(grant)); } catch (_) {}
  }

  function readGrant(data, productId) {
    try { return JSON.parse(localStorage.getItem(grantStoreKey(data, productId)) || "null"); } catch (_) { return null; }
  }

  function showReport(productId, data, extra) {
    const root = ensureModal();
    const product = PRODUCTS[productId];
    root.querySelector("#unniProductBadge").textContent = "구매한 리포트";
    root.querySelector("#unniProductTitle").textContent = product.name;
    root.querySelector("#unniProductPrice").textContent = "";
    root.querySelector("#unniProductSetup").innerHTML = "";
    root.querySelector("#unniProductPayment").style.display = "none";
    const accessNote = root.querySelector("#unniProductAccessNote");
    if (accessNote) accessNote.style.display = "none";
    root.querySelector("#unniProductBody").innerHTML = productBody(productId, data, extra);
    const action = root.querySelector("#unniProductAction");
    action.textContent = "닫기";
    action.onclick = () => root.querySelector("#unniProductClose").click();
    root.style.display = "block";
    document.body.style.overflow = "hidden";
  }

  async function beginPaidCheckout(productId, data, extra, root) {
    if (typeof paymentAPI !== "function" || typeof resultSnapshot !== "function") throw new Error("결제 준비 함수를 불러오지 못했어.");
    const snap = { ...resultSnapshot(data), p: productId, x: extra };
    const order = await paymentAPI({ action: "prepare", data: snap });
    const product = PRODUCTS[productId];
    if (!order?.ok || order.productId !== productId || Number(order.amount) !== product.price) throw new Error("상품 주문 정보가 맞지 않아. 다시 시도해줘.");
    if (typeof PaymentWidget === "undefined") throw new Error("결제창을 불러오지 못했어. 새로고침 후 다시 해줘.");
    root.querySelector("#unniProductPayment").style.display = "block";
    root.querySelector("#unniProductPaymentMethod").innerHTML = "";
    root.querySelector("#unniProductPaymentAgreement").innerHTML = "";
    const widget = PaymentWidget(TOSS_CLIENT_KEY, PaymentWidget.ANONYMOUS);
    widget.renderPaymentMethods("#unniProductPaymentMethod", { value: order.amount, currency: "KRW" }, { variantKey: "saju" });
    widget.renderAgreement("#unniProductPaymentAgreement");
    const action = root.querySelector("#unniProductAction");
    action.textContent = `${won(order.amount)} 결제하고 열기`;
    action.onclick = async () => {
      action.disabled = true;
      try {
        const base = location.origin + location.pathname;
        const ticket = encodeURIComponent(order.ticket);
        await widget.requestPayment({ orderId: order.orderId, orderName: product.name, customerName: data.name || data.userName || "구매자", successUrl: `${base}?payment=success&state=${ticket}`, failUrl: `${base}?payment=fail&state=${ticket}` });
      } catch (e) {
        action.disabled = false;
        if (typeof showToast === "function") showToast(e?.message || "결제창을 열지 못했어.");
      }
    };
  }

  async function openProduct(productId) {
    const data = getData();
    const product = PRODUCTS[productId];
    if (!data || !product) return;
    const root = ensureModal();
    root.querySelector("#unniProductBadge").textContent = product.badge;
    root.querySelector("#unniProductTitle").textContent = product.name;
    root.querySelector("#unniProductPrice").textContent = won(product.price);
    root.querySelector("#unniProductSetup").innerHTML = setupHtml(productId, data);
    root.querySelector("#unniProductPayment").style.display = "none";
    root.querySelector("#unniProductBody").innerHTML = `<p style="font-size:13px;line-height:1.75;color:#64748b">${esc(product.desc)}</p>`;
    const isFreeLaunch = typeof FREE_LAUNCH_MODE !== "undefined" && FREE_LAUNCH_MODE;
    const accessNote = root.querySelector("#unniProductAccessNote");
    if (accessNote) accessNote.style.display = isFreeLaunch ? "none" : "block";
    const action = root.querySelector("#unniProductAction");
    action.disabled = false;
    const grant = readGrant(data, productId);
    if (grant?.token && grant?.userKey && typeof verifyAccessToken === "function") {
      action.textContent = "구매한 리포트 다시 열기";
      action.onclick = async () => {
        action.disabled = true;
        try {
          const state = await verifyAccessToken(grant.userKey, grant.token);
          if (state === "valid") return showReport(productId, data, grant.extra || {});
          throw new Error("구매 확인이 필요해. 결제 내역을 다시 확인해줘.");
        } catch (e) { if (typeof showToast === "function") showToast(e?.message || "구매 확인에 실패했어."); }
        finally { action.disabled = false; }
      };
    } else {
      action.textContent = isFreeLaunch ? "무료 이벤트로 미리보기" : `${won(product.price)}에 열기`;
      action.onclick = async () => {
        action.disabled = true;
        try {
          const extra = collectExtra(productId, data, root);
          if (typeof FREE_LAUNCH_MODE !== "undefined" && FREE_LAUNCH_MODE) return showReport(productId, data, extra);
          await beginPaidCheckout(productId, data, extra, root);
        } catch (e) { if (typeof showToast === "function") showToast(e?.message || "상품을 열지 못했어."); }
        finally { action.disabled = false; }
      };
    }
    root.style.display = "block";
    document.body.style.overflow = "hidden";
  }

  function renderCatalog() {
    const data = getData();
    const notes = document.getElementById("notesListContainer");
    if (!data || !notes || document.getElementById("unniProductLadder")) return;
    const wrap = document.createElement("section");
    wrap.id = "unniProductLadder";
    wrap.style.cssText = "margin-top:24px;padding:20px 16px;border-radius:22px;background:#fff;border:1px solid #fde2e8;box-shadow:0 10px 30px rgba(225,175,185,.10)";
    wrap.innerHTML = `<div style="font-size:11px;font-weight:900;color:#f43f5e">이어서 더 보고 싶다면</div><h3 style="font-size:19px;font-weight:950;margin:5px 0 5px">언니가 더 깊게 봐줄 수도 있어</h3><p style="font-size:12px;line-height:1.65;color:#64748b;margin:0 0 14px">지금 고민 하나로 끝내도 돼. 더 궁금한 사람만 골라서 이어봐.</p><div style="display:grid;gap:10px">${Object.values(PRODUCTS).map((p) => `<button data-unni-product="${p.id}" style="text-align:left;width:100%;padding:14px;border:1px solid #e2e8f0;border-radius:16px;background:#fff;cursor:pointer"><div style="display:flex;justify-content:space-between;gap:10px;align-items:center"><div><div style="font-size:10px;font-weight:900;color:#f43f5e;margin-bottom:3px">${p.badge}</div><div style="font-size:14px;font-weight:900;color:#0f172a">${p.name}</div></div><div style="font-size:13px;font-weight:950;color:#0f172a;white-space:nowrap">${won(p.price)}</div></div><div style="font-size:11px;line-height:1.55;color:#64748b;margin-top:7px">${p.desc}</div></button>`).join("")}</div>`;
    notes.insertAdjacentElement("afterend", wrap);
    wrap.querySelectorAll("[data-unni-product]").forEach((btn) => btn.addEventListener("click", () => openProduct(btn.dataset.unniProduct)));
  }

  global.handleUnniProductPaymentReturn = async function (params, resume, restored, ticket) {
    const productId = resume?.productId;
    const product = PRODUCTS[productId];
    if (!product) return false;
    if (params.get("payment") === "fail") {
      if (typeof showToast === "function") showToast(params.get("message") || "결제가 취소됐어.");
      return true;
    }
    if (params.get("payment") !== "success") return true;
    const paymentKey = params.get("paymentKey"), orderId = params.get("orderId"), amount = Number(params.get("amount"));
    if (!paymentKey || orderId !== resume.orderId || amount !== Number(resume.amount)) throw new Error("상품 결제 복귀 정보가 일치하지 않아. 재결제하지 말고 주문번호로 문의해줘.");
    const token = await confirmPaymentOnServer(paymentKey, orderId, amount, resume.userKey, ticket);
    saveGrant(restored, productId, { userKey: resume.userKey, token, extra: resume.data?.x || {}, orderId });
    try { sessionStorage.removeItem("unni_pending_approval"); } catch (_) {}
    showReport(productId, restored, resume.data?.x || {});
    if (typeof showToast === "function") showToast("결제 확인됐어. 리포트 열어뒀어.");
    return true;
  };

  global.openUnniProduct = openProduct;
  global.renderUnniProductCatalog = renderCatalog;
  global.__UNNI_PRODUCTS_V1__ = { version: "1.0.0", products: PRODUCTS };

  const observer = new MutationObserver(() => renderCatalog());
  if (document.documentElement) observer.observe(document.documentElement, { childList: true, subtree: true });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", renderCatalog);
  else setTimeout(renderCatalog, 0);
})(globalThis);
